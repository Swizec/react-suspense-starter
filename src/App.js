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

const P = styled.p`
    width: 960px;
`;

const Button = styled.button`
    margin-top: 200px;
    margin-bottom: 200px;
    font-size: 1.5em;
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
        N: 0,
        chunkSize: this.props.data.length / 4,
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
        const { N, chunkSize } = this.state;

        if (N < chunkSize) {
            requestAnimationFrame(() => this.setState({ N: N + 1000 }));
        }
    };

    render() {
        const { data, N, chunkSize, maxAge, maxDuration } = this.state;

        return (
            <React.Fragment>
                <p>Displaying {N * 4} datapoints</p>
                <svg width={800} height={650}>
                    <Scatterplot
                        x={110}
                        y={10}
                        data={data.slice(0, N)}
                        maxX={maxAge}
                        maxY={maxDuration}
                        width={600}
                        height={600}
                        datapoint={({ x, y, key }) => (
                            <Circle cx={x} cy={y} r={2} key={key} />
                        )}
                    />
                    <Scatterplot
                        x={110}
                        y={10}
                        data={data.slice(chunkSize, N * 2)}
                        maxX={maxAge}
                        maxY={maxDuration}
                        width={600}
                        height={600}
                        datapoint={({ x, y, key }) => (
                            <Circle cx={x} cy={y} r={2} key={key} />
                        )}
                    />
                    <Scatterplot
                        x={110}
                        y={10}
                        data={data.slice(chunkSize * 2, N * 3)}
                        maxX={maxAge}
                        maxY={maxDuration}
                        width={600}
                        height={600}
                        datapoint={({ x, y, key }) => (
                            <Circle cx={x} cy={y} r={2} key={key} />
                        )}
                    />
                    <Scatterplot
                        x={110}
                        y={10}
                        data={data.slice(chunkSize * 3, N * 4)}
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
            <React.unstable_AsyncMode>
                <h1>Suspensful scatterplot with 199,000+ datapoints</h1>

                <P>
                    Try typing in here to see the UI thread doesn't block:{" "}
                    <input type="text" />
                </P>
                <P>
                    This experiment shows all FordBike rides in San Francisco in
                    2018 comparing ride duration to birth year of the rider.
                    Correlation is weak.
                </P>
                <P>
                    We use 3 overlapping scatterplots and React's new Time
                    Slicing feature to progressively show more and more
                    datapoints the more patience you have as a user. Adding
                    datapoints gets slower and slower, but never blocks the UI
                    thread which is nice. The loading state is done with React
                    Suspense.
                </P>

                {showViz ? (
                    <React.Placeholder
                        delayMs={500}
                        fallback={
                            <React.Fragment>
                                <div>🌀 Loading like 40 megs of CSV</div>
                                <svg width={800} height={650} />
                            </React.Fragment>
                        }
                    >
                        <LazyViz />
                    </React.Placeholder>
                ) : (
                    <Button onClick={this.showViz}>Click Me For Magic</Button>
                )}
                <P>
                    Experiment built by{" "}
                    <a href="https://twitter.com/swizec">Swizec</a>.
                </P>
            </React.unstable_AsyncMode>
        );
    }
}

// Setup react-hot-loader for Parcel.
// This is removed in production automagically.
export default hot(module)(App);
// export default App;
