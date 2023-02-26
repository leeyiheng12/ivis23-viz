import * as d3 from "d3";
import React from "react";
import styles from "./LineChart.module.css";

import MouseTooltip from 'react-sticky-mouse-tooltip';

function LineChart(props) {

    const margin = {top: 10, right: 30, bottom: 30, left: 60};
    const width = props.defaultSettings.width - margin.left - margin.right;
    const height = props.defaultSettings.height - margin.top - margin.bottom;
    
    const lineRef = React.useRef();

    // const [idleTimeout, setIdleTimeout] = React.useEffect(null);
    const [hoveredData, setHoveredData] = React.useState({});
    const [isMouseTooltipVisible, setIsMouseTooltipVisible] = React.useState(false);


    // Create line chart
    React.useEffect(() => {

        if (props.data.length === 0) return;

        const data = props.data.filter((row) => row[props.selectedColColName] === props.selectedCol);
        const minYear = d3.min(data, (d) => +(d["Year"]));
        const maxYear = d3.max(data, (d) => +(d["Year"]));
        const minSR = d3.min(data, (d) => +(d["SR"]));
        const maxSR = d3.max(data, (d) => +(d["SR"]));

        // const data = d3.group(props.data, d => d["Gender"]);
        // const minYear = d3.min(data, (g) => d3.min(g[1], (d) => +(d["Year"])));
        // const maxYear = d3.max(data, (g) => d3.max(g[1], (d) => +(d["Year"])));
        // const minSR = d3.min(data, (g) => d3.min(g[1], (d) => +(d["SR"])));
        // const maxSR = d3.max(data, (g) => d3.max(g[1], (d) => +(d["SR"])));
            
        const svg = d3.select(lineRef.current);
        svg.selectAll("*").remove();

        // Add chart
        svg.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleLinear()
            .domain([minYear - 2,  maxYear + 2])
            .range([0, width])
            .interpolate(d3.interpolateRound);
        
        const xAxis = svg.append("g")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")))
            .attr("transform", `translate(0, ${height - 30})`);

        const y = d3.scaleLinear()
            .domain([-2, maxSR + 2])
            .range([height, 0]);

        const yAxis = svg.append("g")
            .call(d3.axisLeft(y))
            .attr("transform", `translate(${30}, 0)`);

        const line = svg.append('g').attr("clip-path", "url(#clip)");

        line.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("d", d3.line()
                .x(d => x(+(d["Year"])))
                .y(d => y(+(d["SR"])))
            );
                // (d[1]));

        // // Create the line variable: where both the line and the brush take place
        // const line = svg.append('g').attr("clip-path", "url(#clip)");

        // line.append("path")
        //     .datum(data)
        //     .attr("class", "line")
        //     .attr("fill", "none")
        //     .attr("stroke", "steelblue")
        //     .attr("stroke-width", 1.5)
        //     .attr("d", d3.line()
        //       .x(d => x(+(d["Year"])))
        //       .y(d => y(+(d["SR"])))
        //     );
        
        xAxis.selectAll("text").filter((d, i) => i === 0).remove();
        xAxis.selectAll("line").filter((d, i) => i === 0).remove();
        yAxis.selectAll("text").filter((d, i) => i === 0).remove();
        yAxis.selectAll("line").filter((d, i) => i === 0).remove();

        // xAxis.selectAll("text").filter((d, i) => i === 0 || i === xAxis.selectAll("text").size() - 1).remove();

        // Add dots to line chart
        const mouseover = function(event, d) {
            setIsMouseTooltipVisible(true);
            setHoveredData(d);
        }

        const mouseleave = function(event, d) {
            setIsMouseTooltipVisible(false);
            setHoveredData({});
        }

        // Add dots
        svg.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => x(+(d["Year"])))
            .attr("cy", (d) => y(+(d["SR"])))
            .attr("r", 3)
            .attr("fill", "steelblue")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);

        // Add a clipPath: everything out of this area won't be drawn.
        const clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // Add brushing
        const brush = d3.brushX()                   // Add the brush feature using the d3.brush function
            .extent( [ [0, 0], [width, height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart);               // Each time the brush selection changes, trigger the 'updateChart' functio

        // Add the brushing
        line.append("g")
            .attr("class", "brush")
            .call(brush);

        // A function that set idleTimeOut to null
        let idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart(event, d) {

            // What are the selected boundaries?
            const extent = event.selection;

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain([4,8]);
            } else {
                x.domain([ x.invert(extent[0]), x.invert(extent[1]) ]);
                line.select(".brush").call(brush.move, null);  // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and line position
            xAxis.transition().duration(1000).call(d3.axisBottom(x));
            line
                .select('.line')
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(d => x(+(d["Year"])))
                    .y(d => y(+(d["SR"])))
                );
        
            // Update dots
            svg.selectAll("circle")
                .transition()
                .duration(1000)
                .call((circle) => {
                    circle
                        .attr("cx", (d) => x(+(d["Year"])))
                        .attr("cy", (d) => y(+(d["SR"])));
                });

            // If user double click, reinitialize the chart
            svg.on("dblclick",function() {

                x.domain([minYear - 2, maxYear + 2]).interpolate(d3.interpolateRound);
                xAxis.transition().duration(1000).call(d3.axisBottom(x));

                svg.selectAll("circle")
                    .transition()
                    // .duration(1000)
                    .call((circle) => {
                        circle
                            .attr("cx", (d) => x(+(d["Year"])))
                            .attr("cy", (d) => y(+(d["SR"])));
                    });

                line
                .select('.line')
                .transition()
                .attr("d", d3.line()
                    .x(d => x(+(d["Year"])))
                    .y(d => y(+(d["SR"])))
                )
            });

        }

    }, [props.data, props.selectedCol, props.title]);

    const tooltipStyle = {
        "backgroundColor": "white",
        "border": "1px solid blue",
        "padding": "5px",
        "borderRadius": "5px"
    }

    return (
        <div>
            <svg ref={lineRef} width={width} height={height} />
            {
                hoveredData["Year"] && hoveredData["SR"] &&
                <MouseTooltip
                    visible={isMouseTooltipVisible}
                    offsetX={15}
                    offsetY={10}
                    style={tooltipStyle}
                >
                    <p>Country: <b>{hoveredData["country"]}</b></p>
                    <p style={{"padding": "0px", "margin": "0px"}}>{props.selectedColColName}: <b>{hoveredData[props.selectedColColName]}</b></p>
                    <p style={{"padding": "0px", "margin": "0px"}}>Year: <b>{hoveredData["Year"]}</b></p>
                    <p style={{"padding": "0px", "margin": "0px"}}>Suicides / 100k: <b>{hoveredData["SR"]}</b></p>
                </MouseTooltip>
            }

        </div>
    )
}

export default LineChart;
