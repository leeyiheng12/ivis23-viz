import * as d3 from "d3";
import React from "react";
// import styles from "./DoubleLineChart.module.css";

import MouseTooltip from 'react-sticky-mouse-tooltip';

function DoubleLineChart(props) {

    const margin = {top: 10, right: 30, bottom: 30, left: 60};
    const width = props.defaultSettings.width - margin.left - margin.right;
    const height = props.defaultSettings.height - margin.top - margin.bottom;
    
    const lineRef = React.useRef();

    // const [idleTimeout, setIdleTimeout] = React.useEffect(null);
    const [hoveredData, setHoveredData] = React.useState({});
    const [isMouseTooltipVisible, setIsMouseTooltipVisible] = React.useState(false);

    const paddingTop = 40;
    const paddingBottom = 60;
    const paddingLeft = 100;
    const paddingRight = 100;

    const line1Color = "red";
    const line2Color = "green";
    const dots1Color = "black";
    const dots2Color = "black";

    // Create line chart
    React.useEffect(() => {

        if (props.data.length === 0) return;

        const data = props.data.filter((row) => row[props.selectedColColName] === props.selectedCol);
        const minYear = d3.min(data, (d) => +(d["Year"]));
        const maxYear = d3.max(data, (d) => +(d["Year"]));

        const minCol1 = d3.min(data, (d) => +(d[props.col1]));
        const maxCol1 = d3.max(data, (d) => +(d[props.col1]));
        const minCol2 = d3.min(data, (d) => +(d[props.col2]));
        const maxCol2 = d3.max(data, (d) => +(d[props.col2]));
            
        const svg = d3.select(lineRef.current);
        svg.selectAll("*").remove();

        // Add chart
        svg.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleLinear()
            .domain([minYear,  maxYear])
            .range([0, width])
            .interpolate(d3.interpolateRound);
        
        const xAxis = svg.append("g")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")))
            .attr("transform", `translate(${paddingLeft}, ${height + paddingTop})`);

        const xAxisLabel = svg.append("text")
            .attr("x", (width + paddingLeft + paddingRight) / 2)
            .attr("y", height + paddingTop + 0.75 * paddingBottom)
            .attr("text-anchor", "middle")
            .text("Year")
            .attr("font-size", "12px");

        const oneUnitY1 = (maxCol1 - minCol1) / 12;
        const y1 = d3.scaleLinear()
            .domain([Math.max(minCol1 - oneUnitY1, 0), maxCol1 + oneUnitY1])
            .range([height, 0]);
        const yAxis1 = svg.append("g")
            .call(d3.axisLeft(y1))
            .attr("transform", `translate(${paddingLeft}, ${paddingTop})`)
            .attr("stroke", line1Color)
            .attr("stroke-width", 0.2);
        const yAxis1Label = svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height + paddingTop + paddingBottom) / 2)
            .attr("y", (paddingLeft) / 2)
            .style("text-anchor", "middle")
            .text(props.yAxis1Name)
            .attr("font-size", "12px")
            .attr("fill", line1Color);

        const oneUnitY2 = (maxCol2 - minCol2) / 12;
        const y2 = d3.scaleLinear()
            .domain([Math.max(minCol2 - oneUnitY2, 0), maxCol2 + oneUnitY2])
            .range([height, 0]);
        const yAxis2 = svg.append("g")
            .call(d3.axisRight(y2))
            .attr("transform", `translate(${width + paddingLeft}, ${paddingTop})`)
            .attr("stroke", line2Color)
            .attr("stroke-width", 0.2);
        const yAxis2Label = svg.append("text")
            .attr("transform", "rotate(90)")
            .attr("x", (height + paddingTop + paddingBottom) / 2)
            .attr("y", -(width + paddingLeft + 1.75 * paddingTop))
            .style("text-anchor", "middle")
            .text(props.yAxis2Name)
            .attr("font-size", "12px")
            .attr("fill", line2Color);

        // const line = svg.append("path")
        //     .datum(data)
        //     .attr("class", "line")
        //     .attr("fill", "none")
        //     .attr("stroke", "steelblue")
        //     .attr("d", d3.line()
        //         .x(d => x(+(d["Year"])))
        //         .y(d => y(+(d["SR"])))
        //     )
        //     .attr("transform", `translate(${padding}, ${padding})`);

        // Create the line variable: where both the line and the brush take place
        const line = svg
            .append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", line1Color)
            .attr("stroke-width", 1.5)
            .attr("transform", `translate(${paddingLeft}, ${paddingTop})`)
            .attr("d", d3.line()
              .x(d => x(+(d["Year"])))
              .y(d => y1(+(d[props.col1])))
            );

        const line2 = svg
            .append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", line2Color)
            .attr("stroke-width", 1.5)
            .attr("transform", `translate(${paddingLeft}, ${paddingTop})`)
            .attr("d", d3.line()
              .x(d => x(+(d["Year"])))
              .y(d => y2(+(d[props.col2])))
            );


        // Add title

        // Add square
        const widthProportion = 0.63;
        const legendFontSize = 12;

        const square1 = svg.append("rect")
            .attr("x", paddingLeft + widthProportion * width)
            .attr("y",  paddingTop - 10)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", line1Color);

        const legend1 = svg.append("text")
            .attr("x", paddingLeft + widthProportion * width + 15)
            .attr("y",  paddingTop)
            .text(props.yAxis1Name)
            .attr("font-size", `${legendFontSize}px`)
            .attr("fill", line1Color);

        const square2 = svg.append("rect")
            .attr("x", paddingLeft + widthProportion * width)
            .attr("y",  paddingTop + 15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", line2Color);

        const legend2 = svg.append("text")
            .attr("x", paddingLeft + widthProportion * width + 15)
            .attr("y",  paddingTop + 25)
            .text(props.yAxis2Name)
            .attr("font-size", `${legendFontSize}px`)
            .attr("fill", line2Color);

        // For brush, const line. line = svg...
        
        // xAxis.selectAll("text").filter((d, i) => i === 0).remove();
        // xAxis.selectAll("line").filter((d, i) => i === 0).remove();
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
            .attr("cy", (d) => y1(+(d[props.col1])))
            .attr("r", 3)
            .attr("fill", dots1Color)
            .attr("transform", `translate(${paddingLeft}, ${paddingTop})`)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);

        svg.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => x(+(d["Year"])))
            .attr("cy", (d) => y2(+(d[props.col2])))
            .attr("r", 3)
            .attr("fill", dots2Color)
            .attr("transform", `translate(${paddingLeft}, ${paddingTop})`)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);

        // Add a clipPath: everything out of this area won't be drawn.
        const clip = svg
            .append("defs")
            .append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", `translate(${0}, ${0})`);

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
                    .y(d => y1(+(d[props.col1])))
                );
        
            // Update dots
            svg.selectAll("circle")
                .transition()
                .duration(1000)
                .call((circle) => {
                    circle
                        .attr("cx", (d) => x(+(d["Year"])))
                        .attr("cy", (d) => y1(+(d[props.col1])));
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
                            .attr("cy", (d) => y1(+(d[props.col1])));
                    });

                line
                .select('.line')
                .transition()
                .attr("d", d3.line()
                    .x(d => x(+(d["Year"])))
                    .y(d => y1(+(d[props.col1])))
                )
            });

        }

    }, [props.data, props.selectedCol]);

    const tooltipStyle = {
        "backgroundColor": "white",
        "border": "1px solid blue",
        "padding": "5px",
        "borderRadius": "5px"
    }

    return (
        <div>
            <div style={{textAlign: "center", display: "block", margin: "auto"}}>
                <svg ref={lineRef}
                width={width + paddingLeft + paddingRight} height={height + paddingTop + paddingBottom}
                style={{display: "block", margin: "auto"}} />
            </div>
            {
                hoveredData["Year"] && hoveredData["SR"] &&
                <MouseTooltip
                    visible={isMouseTooltipVisible}
                    offsetX={15}
                    offsetY={10}
                    style={tooltipStyle}
                >
                    <p>Country: <b>{hoveredData["country"]}</b></p>

                    {
                        console.log(props.tooltipDetails)
                    }

                    {
                        props.tooltipDetails && props.tooltipDetails.map((element, index) => {
                            return (
                                <p key={index} style={{"padding": "0px", "margin": "0px"}}>
                                    {element[1]}:&nbsp;
                                    <b>{ hoveredData ? hoveredData[element[0]] : "No data"}</b>
                                </p>
                            )
                        })
                    }
                
                </MouseTooltip>
            }

        </div>
    )
}

export default DoubleLineChart;
