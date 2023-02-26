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
    const [countrySpecificData, setCountrySpecificData] = React.useState([]);

    
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
            const uniqueSRs = new Set();
            for (let row of d) {
                uniqueYears.add(+(row["Year"]));
                uniqueSRs.add(+(row["All"]));
                uniqueSRs.add(+(row["Males"]));
                uniqueSRs.add(+(row["Females"]));
            }
            setMinYear(d3.min(uniqueYears));
            setMaxYear(d3.max(uniqueYears));

            setMaxSR(d3.max(uniqueSRs));

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
            <hr />
            {
                selectedCountry !== "" && countrySpecificData.length > 0 &&
                (
                    <>
                    <br />
                        <LineChart
                            defaultSettings={{width: 900, height: 200}}
                            data={countrySpecificData} 
                            selectedCol={selectedAgeGroup}
                            selectedColColName="Age Group" />
                    </>
                )
            }
            <AgeGroupSelector selectedAgeGroup={selectedAgeGroup} setSelectedAgeGroup={setSelectedAgeGroup} />
            <YearSelector minYear={minYear} maxYear={maxYear} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            <div style={{"overflow": "auto"}}>
                <Map
                    defaultSettings={{
                        width: 900, height: 600, defaultScale: 150, id: "SRByAgeMap",
                        showEmptyCountries: true, showFlatMap: props.showFlatMap,
                    }}
                    geoJSONdata={props.geoJSONdata}
                    filteredData={filteredData}
                    maxSR={maxSR}
                    mapTitle={`Suicide Rates of ${selectedAgeGroup.replace("years", "year")} olds in ${selectedYear}`}
                    valueColName={selectedAgeGroup + "s"}
                    selectedColColName={"Age Group"}
                    selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                    rerenderVar={props.rerenderVar}
                />
                <br />
            </div>
        </>
    );
}

export default SR_By_Age;
