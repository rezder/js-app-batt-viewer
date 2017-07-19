import React, {
    Component
} from 'react';

export class MiddleLine extends Component {
    render() {
        const styleLine = {
            stroke: "#000000",
            strokeWidth: 2,
            strokeDasharray: [4, 4]
        };
        return (
                <path id="middelPath"
            d={"m 0,"+this.props.height/2+" "+this.props.width+",0"}
            style={styleLine}/>
        );
    }
}
/**
   Pattern must be placed in defs where the can be reused.
   The back of the card use the pattern and if not include card would fail.
*/
export class Pattern extends Component {
    render() {
        const blackStyle = {
            fill: "black",
            stroke: "none"
        };
        return (
            <defs>
                <pattern
                    patternUnits="userSpaceOnUse"
                    width="1"
                    height="1.73205080756"
                    patternTransform="matrix(10,0,0,10,540.14072,-27.21433)"
                    id="pattern11963-5-7">
                    <circle
                        style={blackStyle}
                        cx="0"
                        cy="0.5"
                        r="0.5"
                        id="circle11166-3-4" />
                    <circle
                        style={blackStyle}
                        cx="1"
                        cy="0.5"
                        r="0.5"
                        id="circle11168-1-9" />
                    <circle
                        style={blackStyle}
                        cx="0.5"
                        cy="1.36602540378"
                        r="0.5"
                        id="circle11170-4-8" />
                    <circle
                        style={blackStyle}
                        cx="0.5"
                        cy="-0.366025403784"
                        r="0.5"
                        id="circle11172-5-5" />
                </pattern>
            </defs>
        );
    }
}

export class Shade extends Component {
    render() {
        let on = this.props.on;
        let col = "#000000";
        let height = this.props.height;
        let width = this.props.width;
        let rectStyle = {
            strokeWidth: 0,
            fill: col,
            fillOpacity: 0.5
        };
        if (on) {
            return (
                    <rect
                height={height}
                width={width}
                style={rectStyle}
                    />
            );
        } else {
            return (<g/>);
        }
    }
}
export class Spinner extends Component {
    render() {
        let on = this.props.on;
        let col = "#000000";
        let x = this.props.x;
        let y = this.props.y;
        let rectStyle = {
            strokeWidth: 0,
            fill: "ffff00"
        };
        let styleOuter = {
            strokeWidth: 2,
            stroke: col,
            fill: "none"
        };
        let styleInner = {
            strokeWidth: 0,
            stroke: col,
            fill: col
        };
        if (on) {
            return (
                <g transform={"translate("+x+","+y+")"}>
                    <circle
                        r={8}
                        style={styleInner}
                    />
                    <rect
                        height={5}
                        width={12}
                        x={-6}
                        y={-2}
                        style={rectStyle}
                    >
                        <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            from="0 0 0"
                            to="360 0 0"
                            dur="0.5s"
                            begin="0s"
                            repeatCount="indefinite"
                            fill="freeze"
                        />
                    </rect>
                    <circle
                        r={7}
                        style={styleOuter}
                    />
                    <circle
                        r={4}
                        style={styleInner}
                    />

                </g>

            );

        } else {
            return (<g/>);
        }
    }
}
