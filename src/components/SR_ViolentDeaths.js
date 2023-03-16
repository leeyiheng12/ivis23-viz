import * as d3 from "d3";
import React from "react";

import YearSelector from "./YearSelector";
import DoubleLineChart from "./DoubleLineChart";
import Map from "./Map";
import SR_against_Violent_Deaths_Dataset from "../data/suicide-vs-violent-deaths.csv";
import MouseTooltip from 'react-sticky-mouse-tooltip';


function SR_ViolentDeaths(props) {

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
        d3.csv(SR_against_Violent_Deaths_Dataset).then((d) => {

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
                        <u>Prevalence of Violent Deaths</u>
                </span> {" "}
                 {selectedCountry === "" ? "around the world" : "in " + selectedCountry}
            </h4>
            {
                selectedCountry !== "" && countrySpecificData.length > 0 &&
                (
                    <>
                    <br />
                        <DoubleLineChart
                            defaultSettings={{width: 900, height: 300}}
                            data={countrySpecificData}
                            col1="SR"
                            col2="Violent Deaths"
                            yAxis1Name="Suicide Rate per 100,000 people"
                            yAxis2Name="Rate of Violent Deaths per 100,000 people"
                            tooltipDetails={[["Year", "Year"], ["SR", "Suicides / 100k"], ["Violent Deaths", "Violent Deaths"]]}
                            />
                    </>
                )
            }
            
            <YearSelector minYear={minYear} maxYear={maxYear} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            <div style={{padding: "20px"}}>

                <Map
                    defaultSettings={{width: mapWidth, height: mapHeight, id: "SR_Violent_SR",
                        showEmptyCountries: true, showFlatMap: props.showFlatMap,
                        leftTranslate: 160, topTranslate: 0,
                        flatMapScale: flatMapScale, globeMapScale: globeMapScale,
                    }}
                    geoJSONdata={props.geoJSONdata}
                    filteredData={filteredData}
                    mapColors={['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']}
                    colorScaleChunks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90]}
                    colorColName="SR"
                    mapTitle={`Suicide Rates in ${selectedYear}`}
                    legendTitle="Suicides / 100k"
                    tooltipDetails={[["Year", "Year"], ["SR", "Suicides / 100k"], ["Violent Deaths", "Violent Deaths"]]}
                    selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                    hoveredCountry={hoveredCountry} setHoveredCountry={setHoveredCountry}
                    rerenderVar={props.rerenderVar}
                />

                <Map
                    defaultSettings={{width: mapWidth, height: mapHeight, id: "SR_Violent_ViolentDeaths",
                        showEmptyCountries: true, showFlatMap: props.showFlatMap,
                        leftTranslate: 160, topTranslate: 0,
                        flatMapScale: flatMapScale, globeMapScale: globeMapScale,
                    }}
                    geoJSONdata={props.geoJSONdata}
                    filteredData={filteredData}
                    mapColors={['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']}
                    colorScaleChunks={[0, 5, 10, 15, 20, 30, 50, 80, 100]}
                    colorColName="Violent Deaths"
                    mapTitle={`Violent Deaths in ${selectedYear}`}
                    legendTitle="Number of violent deaths / 100k"
                    tooltipDetails={[["Year", "Year"], ["SR", "Suicides / 100k"], ["Violent Deaths", "Violent Deaths"]]}
                    selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                    hoveredCountry={hoveredCountry} setHoveredCountry={setHoveredCountry}
                    rerenderVar={props.rerenderVar}
                />
            </div>

        </>
    );
}

export default SR_ViolentDeaths;
