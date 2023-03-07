import logo from './logo.svg';
import './App.css';

import styles from "./App.module.css";
import * as d3 from "d3";
import React from "react";

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Modal from "react-bootstrap/Modal";
import { BsInfoCircle, BsQuestionCircle } from "react-icons/bs";
import Button from "react-bootstrap/Button";

import SR_By_Age from "./components/SR_By_Age";
import SR_By_Sex from "./components/SR_By_Sex";
import SR_Depressive from "./components/SR_Depressive";
import SR_ViolentDeaths from "./components/SR_ViolentDeaths";
import SR_GDP from "./components/SR_GDP";


const geoJSONsrc = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";


function App() {

  const [geoJSONdata, setGeoJSONdata] = React.useState({});

  const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
  const [helpModalIsOpen, setHelpModalIsOpen] = React.useState(false);
  const [showFlatMap, setShowFlatMap] = React.useState(true);

  React.useEffect(() => {
      // Load geoJSON data
      d3.json(geoJSONsrc).then((d => {
        // setUniqueCountries(d.features.map((obj) => obj.properties.name));
        setGeoJSONdata(d);
        }));
  }, []);

  // Force rerender
  const [rerenderVar, forceRerender] = React.useState(0);


  return (
    <>
      <div className={styles.App}>

        <div className={styles.additionalInfo}>
          <Button
              onClick={(e) => setShowFlatMap((p) => !p)}
              variant={showFlatMap ? "outline-primary" : "outline-info"}
              value={showFlatMap}
            >
            {showFlatMap ? "Show 3D" : "Show 2D"} 
          </Button>

          &nbsp;&nbsp;&nbsp;&nbsp;

          <BsQuestionCircle size={20} onClick={() => setHelpModalIsOpen(true)} />
          &nbsp;
          <BsInfoCircle size={20} onClick={() => setInfoModalIsOpen(true)} />
        </div>

        {/* <br /> */}
        <Tabs forceRenderTabPanel={true} onSelect={() => forceRerender(rerenderVar + 1)} defaultIndex={4}>
          <TabList>
            <Tab>Suicide Rates by Gender</Tab>
            <Tab>Suicide Rates by Age Group</Tab>
            <Tab>Suicide Rates + Depression</Tab>
            <Tab>Suicide Rates + Violent Deaths</Tab>
            <Tab>Suicide Rates + GDP Per Capita</Tab>
          </TabList>

          <TabPanel>
            <div style={{"overflow": "hidden"}}>
              <SR_By_Sex
                geoJSONdata={geoJSONdata} showFlatMap={showFlatMap} rerenderVar={rerenderVar}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{"overflow": "hidden"}}>
              <SR_By_Age
                geoJSONdata={geoJSONdata} showFlatMap={showFlatMap} rerenderVar={rerenderVar}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{"overflow": "hidden"}}>
              <SR_Depressive
                geoJSONdata={geoJSONdata} showFlatMap={showFlatMap} rerenderVar={rerenderVar}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{"overflow": "hidden"}}>
              <SR_ViolentDeaths
                geoJSONdata={geoJSONdata} showFlatMap={showFlatMap} rerenderVar={rerenderVar}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{"overflow": "hidden"}}>
              <SR_GDP
                geoJSONdata={geoJSONdata} showFlatMap={showFlatMap} rerenderVar={rerenderVar}
              />
            </div>
          </TabPanel>
        </Tabs>

      </div>

      <Modal show={infoModalIsOpen} onHide={() => setInfoModalIsOpen(false)} dialogClassName="modal-50w">
        <Modal.Body>
          <h3>About this website</h3>
            <hr />
            <p>This website obtains its datasets from <a href="https://ourworldindata.org/suicide" target="_blank">Our World in Data</a>,
            which is open to use under the Creative Commons BY 4.0 license, and we would like to thank them for the data.</p>
            <p>This website simply seeks to visualize datasets regarding suicide information, and invites users to
              obtain their own insights and form their own opinions.</p>
            <p>The presentation of specific characteristics (e.g. age group) alongside suicide rates are not meant
              to imply correlation, and are simply done so for the purposes of information visualization.</p>
            <hr />
            <p>If you, or someone you know, require counselling regarding similar matters, do not be afraid to seek help.</p>
            <p><a href="https://www.google.com/search?q=suicide+helpline+near+me" target="_blank">Suicide Helplines Near Me</a></p>
            <p><a href="https://988lifeline.org/" target="_blank">988 Suicide & Crisis Lifeline</a></p>
            <p><a href="https://findahelpline.com/" target="_blank">Find a Helpline</a></p>
            <p><a href="https://blog.opencounseling.com/suicide-hotlines/" target="_blank">International Suicide Hotlines</a></p>
            
        </Modal.Body>
      </Modal>

      <Modal show={helpModalIsOpen} onHide={() => setHelpModalIsOpen(false)} dialogClassName="modal-50w">
        <Modal.Body>
          <h3>How to use this website</h3>
            <hr />
            <b>In 2D mode:</b>
            <p><u>Drag the map</u> (by holding down the left click) to <u>pan around</u>.</p>

            <b>In 3D mode:</b>
            <p><u>Drag the map</u> (by holding down the left click) to <u>rotate the globe</u>.</p>

            <b>In either mode:</b>
            <p><u>Scroll</u> using the mouse wheel to <u>zoom in/out</u>.</p>
            <p style={{"marginTop": "0", "paddingTop": "0"}}><u>Click</u> on the map, then use the <u>arrow keys</u> to <u>move</u> the map/globe around.</p>
            <p style={{"marginTop": "0", "paddingTop": "0"}}><u>Click on a country</u> to view more information, then <u>click an empty region</u> on the map/globe to unselect the country.</p>
            {/* <p style={{"marginTop": "0", "paddingTop": "0"}}>After zooming into a section of the line chart, double click the chart to zoom back out.</p> */}
            
            <hr />

            <p>Click on the question mark icon in the top right corner to reopen this help menu.</p>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default App;
