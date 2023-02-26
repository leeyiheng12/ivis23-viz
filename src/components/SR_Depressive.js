import * as d3 from "d3";
import React from "react";

import GenderSelector from "./GenderSelector";
import YearSelector from "./YearSelector";
import LineChart from "./LineChart";
import MultivariateMap from "./MultivariateMap";
import SR_against_Depressive_Dataset from "../data/suicide-rates-vs-prevalence-of-depression.csv";

// import SR_vs_Income_Inequality_Dataset from "./data/suicide-rate-vs-income-inequality.csv";

function SR_Depressive(props) {

    const [data, setData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState([]);

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
            )
        );
    }, [selectedYear]);

    // On load
    React.useEffect(() => {
        d3.csv(SR_against_Depressive_Dataset).then((d) => {

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
            <div style={{padding: "50px"}}>
                <MultivariateMap
                    defaultSettings={{width: 900, height: 600, defaultScale: 150, id: "SR_Depressive",
                        showEmptyCountries: true, showFlatMap: props.showFlatMap}}
                    geoJSONdata={props.geoJSONdata}
                    filteredData={filteredData}
                    maxSR={maxSR}
                    mapTitle={`Suicide Rates?`}
                    valueColName={"s"}
                    selectedColColName={"Gender"}
                    selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                    rerenderVar={props.rerenderVar}
                />
            </div>

        </>
    );
}

export default SR_Depressive;
