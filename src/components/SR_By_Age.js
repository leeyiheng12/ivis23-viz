import * as d3 from "d3";
import React from "react";

import AgeGroupSelector from "./AgeGroupSelector";
import YearSelector from "./YearSelector";
import LineChart from "./LineChart";
import Map from "./Map";

import SR_by_Age_Dataset from "../data/suicide-rates-by-age.csv";

function SR_By_Age(props) {

    const [data, setData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState([]);
    const [selectedAgeGroup, setSelectedAgeGroup] = React.useState("70+ years");

    const [minYear, setMinYear] = React.useState(2000);
    const [maxYear, setMaxYear] = React.useState(2000);
    const [selectedYear, setSelectedYear] = React.useState(2001);
    
    const [maxSR, setMaxSR] = React.useState(0);

    const [selectedCountry, setSelectedCountry] = React.useState("");
    const [hoveredCountry, setHoveredCountry] = React.useState("");
    const [countrySpecificData, setCountrySpecificData] = React.useState([]);

    const flatMapScale = 170;
    const globeMapScale = 250;
    
    // When a user selection changes, update filtered data
    React.useEffect(() => {
        setFilteredData(
            data.filter(
                (row) => row["Year"] === selectedYear.toString()
                && row["Age Group"] === selectedAgeGroup
            )
        );
    }, [selectedYear, selectedAgeGroup]);

    // On load
    React.useEffect(() => {
        d3.csv(SR_by_Age_Dataset).then((d) => {

            setData(d);
            setSelectedYear(selectedYear - 1);  // Just to trigger the above change, non-manually

            const uniqueYears = new Set();
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

    return (
        <>
            <h4>{`Suicide Rates of ${selectedAgeGroup.replace("years", "year")} olds 
                ${selectedCountry === "" ? "around the world" : "in " + selectedCountry}`}</h4>
            {
                selectedCountry !== "" && countrySpecificData.length > 0 &&
                (
                    <LineChart
                        defaultSettings={{width: 900, height: 200}}
                        data={countrySpecificData}
                        maxYVal={130}
                        selectedCol={selectedAgeGroup}
                        selectedColColName="Age Group" />
                )
            }
            <AgeGroupSelector selectedAgeGroup={selectedAgeGroup} setSelectedAgeGroup={setSelectedAgeGroup} />
            <YearSelector minYear={minYear} maxYear={maxYear} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            <div style={{"overflow": "auto"}}>
                <Map
                    defaultSettings={{
                        width: 900, height: 600, defaultScale: 150, id: "SRByAgeMap",
                        showEmptyCountries: true, showFlatMap: props.showFlatMap,
                        leftTranslate: 0, topTranslate: 0,
                        flatMapScale: flatMapScale, globeMapScale: globeMapScale,
                    }}
                    geoJSONdata={props.geoJSONdata}
                    filteredData={filteredData}
                    mapColors={['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']}
                    colorScaleChunks={[0, 7.5, 15, 30, 40, 60, 80, 100, 131.36]}
                    colorColName="SR"
                    mapTitle={`Suicide Rates of ${selectedAgeGroup.replace("years", "year")} olds in ${selectedYear}`}
                    legendTitle="Suicides / 100k"
                    tooltipDetails={[["Age Group", "Age Group"], ["Year", "Year"], ["SR", "Suicides / 100k"]]}  // mapping of colname to display name
                    selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                    hoveredCountry={hoveredCountry} setHoveredCountry={setHoveredCountry}
                    rerenderVar={props.rerenderVar}
                />
                <br />
            </div>
        </>
    );
}

export default SR_By_Age;
