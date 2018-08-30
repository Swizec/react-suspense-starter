import React from "react";
import * as d3 from "d3";

import Axis from "./Axis";

class Scatterplot extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            xScale: d3
                .scaleLinear()
                .domain([0, 1])
                .range([0, props.width]),
            yScale: d3
                .scaleLinear()
                .domain([0, 1])
                .range([0, props.height])
        };
    }

    static getDerivedStateFromProps(props, state) {
        let { xScale, yScale } = state;

        xScale
            .domain([1900, d3.max(props.data, d => d.member_birth_year)])

            .range([0, props.width]);
        yScale
            .domain([0, d3.max(props.data, d => d.duration_sec)])
            .range([props.height, 0]);

        return { ...state, xScale, yScale };
    }

    render() {
        const { x, y, data, width, height, datapoint } = this.props,
            { xScale, yScale } = this.state;

        return (
            <g transform={`translate(${x}, ${y})`}>
                {data.map(({ member_birth_year, duration_sec }) =>
                    datapoint({
                        x: xScale(member_birth_year),
                        y: yScale(duration_sec)
                    })
                )}
                <Axis
                    x={0}
                    y={0}
                    type="Left"
                    scale={yScale}
                    label="Ride Length (sec)"
                />
                <Axis
                    x={0}
                    y={height}
                    type="Bottom"
                    scale={xScale}
                    label="Birth Year"
                />
            </g>
        );
    }
}

export default Scatterplot;
