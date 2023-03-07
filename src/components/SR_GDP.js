import * as d3 from "d3";
import React from "react";

import YearSelector from "./YearSelector";
import DoubleLineChart from "./DoubleLineChart";
import Map from "./Map";
import SR_GDP_Per_Capita from "../data/suicide-rates-gdp-per-capita.csv";
import MouseTooltip from 'react-sticky-mouse-tooltip';


function SR_GDP(props) {

    const [data, setData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState([]);

    const [minYear, setMinYear] = React.useState(2000);
    const [maxYear, setMaxYear] = React.useState(2000);
    const [selectedYear, setSelectedYear] = React.useState(2001);

    const [selectedCountry, setSelectedCountry] = React.useState("");
    const [hoveredCountry, setHoveredCountry] = React.useState("");
    const [countrySpecificData, setCountrySpecificData] = React.useState([]);
    
    // When a user selection changes, update filtered data
    React.useEffect(() => {
        setFilteredData(
            data.filter(
                (row) => row["Year"] === selectedYear.toString()
            )
        );
    }, [selectedYear]);

    // On load
    React.useEffect(() => {
        d3.csv(SR_GDP_Per_Capita).then((d) => {

            setData(d);
            setSelectedYear(selectedYear - 1);  // Just to trigger the above change, non-manually

            const uniqueYears = new Set();
            const uniqueSRs = new Set();
            for (let row of d) {
                uniqueYears.add(+(row["Year"]));
            }
            setMinYear(d3.min(uniqueYears));
            setMaxYear(d3.max(uniqueYears));

            setCountrySpecificData(data.filter((row) => row["country"] === "China"));
        });
    }, []);

    React.useEffect(() => {
        setCountrySpecificData(data.filter((row) => row["country"] === selectedCountry));
    }, [selectedCountry]);

    const mapWidth = "45%";
    const mapHeight = 600;

    const flatMapScale = 130;
    const globeMapScale = 200;
    
    const [isMouseTooltipVisible, setIsMouseTooltipVisible] = React.useState(false);

    const tooltipStyle = {
        "backgroundColor": "white",
        "border": "1px solid blue",
        "padding": "5px",
        "borderRadius": "5px"
    }

    return (
        <>     
            <MouseTooltip
                visible={isMouseTooltipVisible}
                offsetX={15}
                offsetY={10}
                style={tooltipStyle}
            >
                Measured by the number of deaths from violence, including interpersonal violence,
                conflict, terrorism, police conflict, and executions (per 100,000 people)
            </MouseTooltip>


            <h4>Comparison of Suicide Rate to {" "}
                <span onMouseEnter={(e) => setIsMouseTooltipVisible(true)}
                    onMouseLeave={(e) => setIsMouseTooltipVisible(false)}>
                        <u>GDP per capita</u>
                </span> {" "}
                 {selectedCountry === "" ? "around the world" : "in " + selectedCountry}
            </h4>
            {
                selectedCountry !== "" && countrySpecificData.length > 0 &&
                (
                    <>
                    <br />
                        <DoubleLineChart
                            defaultSettings={{width: 900, height: 200}}
                            data={countrySpecificData}
                            col1="SR"
                            col2="GDP per capita"
                            yAxis1Name="Suicide Rate per 100,000 people"
                            yAxis2Name="GDP per capita"
                            tooltipDetails={[["Year", "Year"], ["SR", "Suicides / 100k"], ["GDP per capita", "GDP per capita"]]}
                            />
                    </>
                )
            }
            
            <YearSelector minYear={minYear} maxYear={maxYear} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            <div style={{padding: "20px"}}>

                <Map
                    defaultSettings={{width: mapWidth, height: mapHeight, id: "SR_GDP_SR",
                        showEmptyCountries: true, showFlatMap: props.showFlatMap,
                        leftTranslate: 160, topTranslate: 0,
                        flatMapScale: flatMapScale, globeMapScale: globeMapScale
                    }}
                    geoJSONdata={props.geoJSONdata}
                    filteredData={filteredData}
                    mapColors={['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']}
                    colorScaleChunks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90]}
                    colorColName="SR"
                    mapTitle={`Suicide Rates in ${selectedYear}`}
                    legendTitle="Suicides / 100k"
                    tooltipDetails={[["Year", "Year"], ["SR", "Suicides / 100k"], ["GDP per capita", "GDP per capita"]]}
                    selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                    hoveredCountry={hoveredCountry} setHoveredCountry={setHoveredCountry}
                    rerenderVar={props.rerenderVar}
                />

                <Map
                    defaultSettings={{width: mapWidth, height: mapHeight, id: "SR_GDP_GDP",
                        showEmptyCountries: true, showFlatMap: props.showFlatMap,
                        leftTranslate: 160, topTranslate: 0,
                        flatMapScale: flatMapScale, globeMapScale: globeMapScale
                    }}
                    geoJSONdata={props.geoJSONdata}
                    filteredData={filteredData}
                    mapColors={['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']}
                    colorScaleChunks={[0, 400, 1300, 2100, 3500, 4800, 7000, 13400, 20000]}
                    colorColName="GDP per capita"
                    mapTitle={`GDP per capita in ${selectedYear}`}
                    legendTitle="GDP per capita"
                    tooltipDetails={[["Year", "Year"], ["SR", "Suicides / 100k"], ["GDP per capita", "GDP per capita"]]}
                    selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                    hoveredCountry={hoveredCountry} setHoveredCountry={setHoveredCountry}
                    rerenderVar={props.rerenderVar}
                />
            </div>

        </>
    );
}

export default SR_GDP;
