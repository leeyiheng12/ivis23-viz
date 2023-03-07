import React from "react";
import * as d3 from "d3";

// import useD3 from "../hooks/useD3";
import styles from "./Map.module.css";

import { legendColor } from "d3-svg-legend";
import MouseTooltip from 'react-sticky-mouse-tooltip';



function split(left, right, chunks) {
    const result = [];
    const step = (right - left) / (chunks-1);
    for (let i = 0; i < chunks; i++) {
        result.push(left + i * step);
    }
    return result;
}


function getCountryFeature(geoJSONdata, projection, event) {
    // const pos = projection.invert([event.offsetX, event.offsetY]);
    const pos = projection.invert(d3.pointer(event));  // Coordinates in [long, lat]
    const countryFeature = geoJSONdata.features.find((d) => d3.geoContains(d, pos));
    return countryFeature;
}

class ColourDecider {
    constructor(colorScale) {

        // Default colors
        this.highlightedColor = "#BCE3F9"
        this.selectedColor = "blue";
        this.defaultColor = "";
        this.hiddenColor = "#E8E8E8";  // greyish
        
        // Colour scale for the map
        // https://colorbrewer2.org/#type=sequential&scheme=BuGn&n=3
        this.colorScale = colorScale;

        // this.colorScaleChunks = split(0, maxVal, this.colorScale.length);
        // this.d3colorScale = d3.scaleLinear()
        //     .domain(this.colorScaleChunks)
        //     .range(this.colorScale);

        // Values that may change
        this.hoveredCountryName = "";
        this.selectedCountryName = "";
        this.showEmptyCountries = true;
        this.countriesWithData = new Set();

        // Data
        this.filteredData = [];
    }

    generateLegend(title) {
        return legendColor().scale(this.d3colorScale).title(title);
    }

    setColorScale(colorScaleChunks) {
        // this.colorScaleChunks = split(0, maxSR, this.colorScale.length);
        this.colorScaleChunks = colorScaleChunks;

        this.d3colorScale = d3.scaleLinear()
            .domain(this.colorScaleChunks)
            .range(this.colorScale);

    }

    setShowEmptyCountries(showEmptyCountriesBool) {
        this.showEmptyCountries = showEmptyCountriesBool;
    }

    setHoveredCountry(hoveredCountryName) {
        this.hoveredCountryName = hoveredCountryName;
    }

    setSelectedCountry(selectedCountryName) {
        this.selectedCountryName = selectedCountryName;
    }

    setCountriesWithData(countriesWithData) {
        this.countriesWithData = countriesWithData;
    }

    setFilteredData(filteredData) {
        this.filteredData = filteredData;
    }

    getRowFromFilteredData(countryName) {
        return this.filteredData.find((countryRow) => countryRow.country === countryName);
    }

    getColour(value) {
        const normalisedValue = (value - this.min) / (this.max - this.min);
        return this.colourScale(normalisedValue);
    }

    determineColor(countryNameToCheck, colName) {
        if (countryNameToCheck === this.selectedCountryName) return this.selectedColor;
        if (countryNameToCheck === this.hoveredCountryName) return this.highlightedColor;

        // If we don't want to show countries without data, and this country doesn't have data, return the hidden color
        if (!this.showEmptyCountries && !this.countriesWithData.has(countryNameToCheck)) return this.hiddenColor;

        // If there is data, return scaled color. If there is no data, return the hidden color
        const relevantRow = this.getRowFromFilteredData(countryNameToCheck);
        return relevantRow ? this.d3colorScale(+(relevantRow[colName])) : this.hiddenColor;
        
    }
}


function genSvg(
        svg, projection, path, 
        geoJSONdata, hoverFunction, clickFunction,
        defaultSettings
    ) {

    svg.append("g")
        .attr("class", styles.countries)
        .selectAll("path")
        .data(geoJSONdata.features)
        .enter()
        .append("path")
        .attr("d", path);

    // Translate and scale
    const translate = projection.translate();
    projection.translate([translate[0] - defaultSettings.leftTranslate, translate[1] + defaultSettings.topTranslate]);
    svg.selectAll("path").attr("d", path);

    
    // Get country on mouseover
    svg.on("mouseover", function(event) {
        const countryFeature = getCountryFeature(geoJSONdata, projection, event);
        if (countryFeature) {
            const hoveredCountryName = countryFeature.properties.name;
            hoverFunction(hoveredCountryName);
        } else {
            hoverFunction("");
        }
    });

    // Remove tooltip on mouseout
    svg.on("mouseout", function(event) {
        hoverFunction("");
    });

    // Get country on click
    svg.on("click", function(event) {
        const countryFeature = getCountryFeature(geoJSONdata, projection, event);
        if (countryFeature) {
            const selectedCountryName = countryFeature.properties.name;
            clickFunction(selectedCountryName);
        } else {
            clickFunction("");
        }
    });


    // Add drag functionality
    svg.call(
        d3.drag().on("drag", (event) => {

                if (defaultSettings.showFlatMap) {

                    // Pan the map
                    const translate = projection.translate();
                    projection.translate([
                        translate[0] + event.dx,
                        translate[1] + event.dy
                    ]);

                } else {
                    // Rotate the map
                    const rotate = projection.rotate();
                    projection.rotate([
                        rotate[0] + event.dx / 2,
                        rotate[1] - event.dy / 2
                    ]);
                }
                // Redraw
                svg.selectAll("path").attr("d", path);

            }
        )
    );

    // Add scroll to zoom functionality
    if (defaultSettings.showFlatMap) {
        svg.call(
            d3.zoom().on("zoom", (event) => {
                projection.scale(defaultSettings.flatMapScale * event.transform.k);
                svg.selectAll("path").attr("d", path);
            })
        );
    } else {
        svg.call(
            d3.zoom().on("zoom", (event) => {
                projection.scale(defaultSettings.globeMapScale * event.transform.k);
                svg.selectAll("path").attr("d", path);
            })
        );
    }
}

function Map(props) {

    // Settings
    const width = props.defaultSettings.width;
    const height = props.defaultSettings.height;

    const [colourDecider, _] = React.useState(new ColourDecider(
        props.mapColors
        // ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']
        // ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b']
    ));

    const mapVizRef = React.useRef();

    const [countryColors, setCountryColors] = React.useState({});

    const [isMouseTooltipVisible, setIsMouseTooltipVisible] = React.useState(false);

    // ==================== Effects ====================

    function updateMapColours() {
        const svg = d3.select(mapVizRef.current);
        let countryName, countryColor;
        const newMapping = {};
        svg.selectAll("path").attr("fill", (d) => {
            countryName = d.properties.name;
            countryColor = colourDecider.determineColor(countryName, props.colorColName);
            newMapping[countryName] = countryColor;  // Update mapping
            return countryColor;
        });

        setCountryColors(newMapping);
    }

    // ==================== Handlers ====================
    // These functions are called when the user interacts with the map
    // D3.js is used to catch mouse events, which call these functions

    function countryHoverHandler(countryName) {

        if (countryName === "") {
            colourDecider.setHoveredCountry("");
            updateMapColours();

            props.setHoveredCountry("");
            setIsMouseTooltipVisible(false);
            return;
        };

        // Set it to hover color
        setCountryColors(countryColors => {
            return {...countryColors, [countryName]: colourDecider.highlightedColor};
        });

        // Update map
        colourDecider.setHoveredCountry(countryName);
        updateMapColours();

        props.setHoveredCountry(countryName);
        setIsMouseTooltipVisible(true);
    
    }

    function countryClickHandler(countryName) {
        if (countryName === "") {
            props.setSelectedCountry("");
            setIsMouseTooltipVisible(false);
            return;
        };

        props.setSelectedCountry(countryName);
        setIsMouseTooltipVisible(true);
    }


    // ============================== Use Effects ==============================

    // When geoJSON data is loaded - generate map
    React.useLayoutEffect(() => {

        // If no geoJSON data, return
        if (Object.keys(props.geoJSONdata).length === 0) return;
        const geoJSONdata = props.geoJSONdata;

        // Set countriesWithData
        const countriesWithData = new Set();
        for (let countryRow of props.filteredData) {
            countriesWithData.add(countryRow.country);
        }
        colourDecider.setCountriesWithData(countriesWithData);

        // Iterate over countries in geoJSONdata and set default colors
        const defaultCountryColors = {};
        for (let country of geoJSONdata.features) {
            defaultCountryColors[country.properties.name] = colourDecider.defaultColor;
        }
        setCountryColors(defaultCountryColors);

        // Viz
        let projection;
        if (props.defaultSettings.showFlatMap) {
            projection = d3.geoNaturalEarth1();
            projection.scale(props.defaultSettings.flatMapScale);
        } else {
            projection = d3.geoOrthographic();
            projection.scale(props.defaultSettings.globeMapScale);
        }

        let path = d3.geoPath().projection(projection);
        const svg = d3.select(mapVizRef.current);
        svg.selectAll("*").remove();

        genSvg(svg, projection, path, 
            geoJSONdata, countryHoverHandler, countryClickHandler,
            props.defaultSettings
        );
        
        // console.log("Map generated", props.defaultSettings.defaultScale);
        // projection.scale(props.defaultSettings.defaultScale);
        // svg.selectAll("path").attr("d", path);

        // add title
        svg.append("text")
            .attr("x", 10)
            .attr("y", height - 150)
            .attr("id", "mapTitle")
            .attr("font-size", "16px")
            .attr("fill", "black")
            .text(props.mapTitle);

        // Initial render
        colourDecider.setFilteredData(props.filteredData);
        updateMapColours();

        // add legend
        svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(10, 30)`)
            .call(
                colourDecider.generateLegend(props.legendTitle)
            );

        // Add event listener
        document.getElementById(props.defaultSettings.id).addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                const translate = projection.translate();
                projection.translate([translate[0] - 10, translate[1]]);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                const translate = projection.translate();
                projection.translate([translate[0] + 10, translate[1]]);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                const translate = projection.translate();
                projection.translate([translate[0], translate[1] - 10]);
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                const translate = projection.translate();
                projection.translate([translate[0], translate[1] + 10]);
            }
            svg.selectAll("path").attr("d", path);
        });

    }, [props.rerenderVar, props.geoJSONdata, props.defaultSettings.showFlatMap]);

    // When colorScale is changed
    React.useEffect(() => {
        colourDecider.setColorScale(props.colorScaleChunks);
        updateMapColours();
    }, [props.colorScaleChunks]);

    // When showEmptyCountries is toggled - change color of countries
    React.useEffect(() => {
        colourDecider.setShowEmptyCountries(props.defaultSettings.showEmptyCountries);
        updateMapColours();
    }, [props.defaultSettings.showEmptyCountries]);


    // When filtered data changes
    React.useEffect(() => {

        // Add title
        const svg = d3.select(mapVizRef.current);

        svg.selectAll("#mapTitle").remove();

        svg.append("text")
            .attr("x", 10)
            .attr("y", height - 150)
            .attr("id", "mapTitle")
            .attr("font-size", "16px")
            .attr("fill", "black")
            .text(props.mapTitle);

        colourDecider.setFilteredData(props.filteredData);
        updateMapColours();

    }, [props.filteredData, props.mapTitle]);


    // When country colors change
    React.useEffect(() => {
        const svg = d3.select(mapVizRef.current);
        svg.selectAll("path").attr("fill", (d) => {
            return countryColors[d.properties.name];
        });

    }, [countryColors]);

    const tooltipStyle = {
        "backgroundColor": "white",
        "border": "1px solid blue",
        "padding": "5px",
        "borderRadius": "5px"
    }

    const filteredCountryObject = Array.isArray(props.filteredData) && props.filteredData.length
        ? (props.filteredData.find(d => d.country === props.hoveredCountry))
        : Object();

    return (
        <>
            <MouseTooltip
                visible={isMouseTooltipVisible}
                offsetX={15}
                offsetY={10}
                style={tooltipStyle}
            >
                <p><b>{props.hoveredCountry}</b></p>

                {
                    props.tooltipDetails.map((element, index) => {
                        return (
                            <p key={index} style={{"padding": "0px", "margin": "0px"}}>
                                {element[1]}:&nbsp;
                                <b>{ filteredCountryObject ? filteredCountryObject[element[0]] : "No data"}</b>
                            </p>
                        )
                    })
                }
            
            </MouseTooltip>

            <div id={props.defaultSettings.id}
                tabIndex="0"
                style={{
                    display: "inline",
                }}>

                <svg ref={mapVizRef} width={width} height={height} />

            </div>
        </>
    )
}

export default Map;
