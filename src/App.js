import React from "react";
import ReactDOM from "react-dom";
import { createCache, createResource } from "simple-cache-provider";
import { cache } from "./cache";
import { hot } from "react-hot-loader";
import * as d3 from "d3";

import Scatterplot from "./Scatterplot";
import styled from "styled-components";

const Circle = styled.circle`
    fill: steelblue;
    fill-opacity: 0.5;
    stroke: steelblue;
    stroke-width: 0.1;
`;

// React polyfill borrowed from @ryanflorence
// https://github.com/reach/router/blob/master/src/index.js
let { unstable_deferredUpdates } = ReactDOM;
if (unstable_deferredUpdates === undefined) {
    unstable_deferredUpdates = fn => fn();
}

class Dataviz extends React.PureComponent {
    state = {
        data: this.props.data,
        dataSlice: [0, 0],
        maxAge: d3.max(this.props.data, d => d.member_birth_year),
        maxDuration: d3.max(this.props.data, d => d.duration_sec)
    };

    componentDidMount() {
        this.showMoreData();
    }

    componentDidUpdate() {
        this.showMoreData();
    }

    showMoreData = () => {
        const { data, dataSlice } = this.state,
            [_, end] = dataSlice;

        if (end < data.length) {
            requestAnimationFrame(() =>
                this.setState({ dataSlice: [0, end + 1000] })
            );
        }
    };

    render() {
        const { data, dataSlice, maxAge, maxDuration } = this.state,
            [start, end] = dataSlice;

        return (
            <React.Fragment>
                <p>Displaying {end} datapoints</p>
                <svg width={800} height={800}>
                    <Scatterplot
                        x={110}
                        y={10}
                        data={data.slice(start, end)}
                        maxX={maxAge}
                        maxY={maxDuration}
                        width={600}
                        height={600}
                        datapoint={({ x, y, key }) => (
                            <Circle cx={x} cy={y} r={2} key={key} />
                        )}
                    />
                </svg>
            </React.Fragment>
        );
    }
}

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
    return getData.read(cache)(props);
};

class NotLazyViz extends React.Component {
    state = {
        data: null
    };

    componentDidMount() {
        d3.csv(
            "https://s3-us-west-1.amazonaws.com/swizec-datasets/201807-fordgobike-tripdata.csv",
            d => ({
                duration_sec: Number(d.duration_sec),
                member_birth_year: Number(d.member_birth_year)
            })
        ).then(data => this.setState({ data }));
    }

    render() {
        return this.state.data ? (
            <Dataviz data={this.state.data} />
        ) : (
            <p>Loading</p>
        );
    }
}

/* <React.Placeholder
    delayMs={0}
    fallback={<div>🌀 Loading like 40 megs of CSV....</div>}
>
    <LazyViz />
</React.Placeholder> */

class App extends React.Component {
    constructor() {
        super();

        this.state = {
            showViz: false
        };
    }

    showViz = () =>
        this.setState({
            showViz: true
        });

    render() {
        const { showViz } = this.state;

        return (
            <React.Fragment>
                <h1>Suspensful scatterplot with 199,000+ datapoints</h1>

                <p>
                    Try typing in here to see the UI thread doesn't block:{" "}
                    <input type="text" />
                </p>

                {showViz ? (
                    <React.Placeholder
                        delayMs={500}
                        fallback={<div>Loading like 40 megs of CSV</div>}
                    >
                        <LazyViz />
                    </React.Placeholder>
                ) : (
                    <button onClick={this.showViz}>Click Me For Magic</button>
                )}
            </React.Fragment>
        );
    }
}

// Setup react-hot-loader for Parcel.
// This is removed in production automagically.
export default hot(module)(App);
// export default App;
