import React, { Component } from "react";
import { makeNoise2D } from "open-simplex-noise";
import "./App.css";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static distance(from, to) {
        const x = from.x - to.x;
        const y = from.y - to.y;

        return Math.sqrt(x * x + y * y);
    }
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pixelSize: 10,
            height: 500,
            width: 150,
            screenWidth: 0,
            screenHeight: 0,
            mouseX: -9999,
            mouseY: -9999,
            mouseEvent: 0,
            effectMod: 2,
            strength: 40,
            strengthCur: 0,
            mouseOver: false,
            points: [],
            pointCount: 10,
        };

        this.drawing = false;
        this.ctx = null;

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.startts = this.getTS();
    }

    getPoints(width, height, count) {
        const points = new Array(count);

        for (let i = 0; i < count; i++) {
            const x = width * Math.random();
            const y = height * Math.random();

            points[i] = new Point(x, y);
        }

        return points;
    }

    componentDidMount() {
        const canvas = this.refs.canvas;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.rAF = requestAnimationFrame(() => this.updateAnimationState());
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        const rect = this.canvas.getBoundingClientRect();
        const { innerWidth, innerHeight } = window;
        const { width, height } = rect;
        const screenWidth = Math.min(width, innerWidth);
        const screenHeight = Math.min(height, innerHeight);
        const { pointCount } = this.state;

        const realHeight = screenHeight / 4;
        const realWidth = screenWidth / 4;

        const points = this.getPoints(realWidth, realHeight, pointCount);

        this.setState({ width: realWidth, height: realHeight, points: points, screenHeight: screenHeight, screenWidth: screenWidth });
        this.nextFrame();
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.rAF);
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    updateAnimationState() {
        this.ts = this.getTS();
        this.clearFrame();

        this.drawDots();

        //this.nextFrame();
    }

    nextFrame() {
        this.rAF = requestAnimationFrame(() => this.updateAnimationState());
    }

    clearFrame() {
        const { width, height } = this.state;
        const { ctx } = this;

        ctx.clearRect(0, 0, width, height);
    }

    getTS() {
        const date = new Date();

        return date.getTime();
    }

    convertRange(value, r1, r2) {
        return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
    }

    distance(x1, y1, x2, y2) {
        const x = x1 - x2;
        const y = y1 - y2;

        return Math.sqrt(x * x + y * y);
    }

    scale(value, r1, r2) {
        return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
    }

    drawDots() {
        const { width, height, points, pixelSize } = this.state;
        const { ctx } = this;
        const ts = this.getTS() / 1000;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const distances = [];
                const curPoint = new Point(x, y);

                for (let i = 0; i < points.length; i++) {
                    distances.push(Point.distance(points[i], curPoint));
                }

                const sortedDistances = distances.sort((a,b) => a-b);

                ctx.beginPath();
                ctx.rect(x, y, 1, 1);
                
                const colour = this.convertRange(sortedDistances[0], [0, sortedDistances[sortedDistances.length - 1] / 10], [255, 0]);
                ctx.fillStyle = `rgb(${colour}, ${colour}, ${colour})`;
                ctx.fill();
            }
        }
    }

    getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        console.log("x: " + x + " y: " + y)
    }

    addPoint(event) {
        const { points, width, height, screenHeight, screenWidth } = this.state;
        
        const x = this.convertRange(event.clientX, [0, screenWidth], [0, width]);
        const y = this.convertRange(event.clientY, [0, screenHeight], [0, height]);

        points.push(new Point(x, y));
        this.setState({points});
        this.nextFrame();
    }

    render() {
        const { width, height } = this.state;

        return (
            <div className={"grid"}>
                <div className={"dots"}>
                    <canvas ref="canvas" width={width} height={height} onClick={(e) => this.addPoint(e)} />
                </div>
            </div>
        );
    }
}

export default App;
