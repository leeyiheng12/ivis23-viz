import logo from './logo.svg';
import './App.css';

import styles from "./App.module.css";
import * as d3 from "d3";
import React from "react";

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Modal from "react-bootstrap/Modal";
import { BsFillGearFill, BsQuestion, BsQuestionCircle } from "react-icons/bs";
import Button from "react-bootstrap/Button";

import SR_By_Age from "./components/SR_By_Age";
import SR_By_Sex from "./components/SR_By_Sex";
import SR_Depressive from "./components/SR_Depressive";


const geoJSONsrc = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";


function App() {

  const [geoJSONdata, setGeoJSONdata] = React.useState({});

  
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [helpModalIsOpen, setHelpModalIsOpen] = React.useState(true);
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
          <BsFillGearFill size={20} onClick={() => setModalIsOpen(true)} />
          &nbsp;&nbsp;
          <BsQuestionCircle size={20} onClick={() => setHelpModalIsOpen(true)} />
        </div>

        <Tabs forceRenderTabPanel={true} onSelect={() => forceRerender(rerenderVar + 1)}>
          <TabList>
            <Tab>Suicide Rates by Gender</Tab>
            <Tab>Suicide Rates by Age Group</Tab>
            {/* <Tab>Suicide Rates compared with Prevalence of Depressive Disorders</Tab> */}
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
          {/* <TabPanel>
            <div style={{"overflow": "hidden"}}>
              <SR_Depressive
                geoJSONdata={geoJSONdata} showFlatMap={showFlatMap} rerenderVar={rerenderVar}
              />
            </div>
          </TabPanel> */}
        </Tabs>

      </div>

      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Body>

          <Button
            onClick={(e) => setShowFlatMap((p) => !p)}
            variant={showFlatMap ? "outline-secondary" : "outline-primary"}
            value={showFlatMap}
          >
            {showFlatMap ? "Show 3D" : "Show 2D"} 
          </Button>

        </Modal.Body>
      </Modal>


      <Modal show={helpModalIsOpen} onHide={() => setHelpModalIsOpen(false)}>
        <Modal.Body>
          <h3>How to use this website</h3>
            <p>Click on the gear icon in the top right corner to change the map view.</p>
            <p>Click on the question mark icon in the top right corner to reopen this help menu.</p>

            <b>In 2D mode:</b>
            <p>Drag the map with your cursor (by holding down the left click) to pan around.</p>

            <b>In 3D mode:</b>
            <p>Drag the map with your cursor (by holding down the left click) to rotate the globe.</p>

            <b>In either mode:</b>
            <p>Scroll using the mouse wheel to zoom in/out.</p>
            <p style={{"marginTop": "0", "paddingTop": "0"}}>Click on the map, then use the arrow keys to move the entire map up/down/left/right.</p>
            <p style={{"marginTop": "0", "paddingTop": "0"}}>Click on a country to view more information, then click anywhere on the map/globe to unselect.</p>
            <p style={{"marginTop": "0", "paddingTop": "0"}}>After zooming into a section of the line chart, double click the chart to zoom back out.</p>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default App;
