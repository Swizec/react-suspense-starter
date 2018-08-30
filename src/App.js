import React from "react";
import { createCache, createResource } from "simple-cache-provider";
import { cache } from "./cache";
import { hot } from "react-hot-loader";
import * as d3 from "d3";

import Scatterplot from "./Scatterplot";
import styled from "styled-components";

const Circle = styled.circle`
    fill: steelblue;
    fill-opacity: 0.7;
    stroke: steelblue;
    stroke-width: 0.1;
`;

const Dataviz = ({ data }) => (
    <svg width={800} height={800}>
        <Scatterplot
            x={100}
            y={10}
            data={data}
            width={600}
            height={600}
            datapoint={({ x, y }) => <Circle cx={x} cy={y} r={2} />}
        />
    </svg>
);

const getData = createResource(
    () =>
        d3
            .csv(
                "https://s3-us-west-1.amazonaws.com/swizec-datasets/201807-fordgobike-tripdata.csv",
                d => ({
                    duration_sec: Number(d.duration_sec),
                    member_birth_year: Number(d.member_birth_year)
                })
            )
            .then(data => props => <Dataviz data={data} {...props} />),
    key => key
);

const LazyViz = props => {
    const Viz = getData.read(cache);
    return <Viz {...props} />;
};

function App() {
    return (
        <React.Fragment>
            <h1 />

            <React.Placeholder
                delayMs={300}
                fallback={<div>🌀 Loading like 40 megs of CSV....</div>}
            >
                <LazyViz />
            </React.Placeholder>
        </React.Fragment>
    );
}

// Setup react-hot-loader for Parcel.
// This is removed in production automagically.
export default hot(module)(App);
// export default App;
