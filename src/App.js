import logo from './logo.svg';
import './App.css';

import styles from "./App.module.css";
import * as d3 from "d3";
import React from "react";

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Modal from "react-bootstrap/Modal";
import { BsFillGearFill, BsQuestion } from "react-icons/bs";
import Button from "react-bootstrap/Button";

import SR_By_Age from "./components/SR_By_Age";
import SR_By_Sex from "./components/SR_By_Sex";


const geoJSONsrc = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";


function App() {

  const [geoJSONdata, setGeoJSONdata] = React.useState({});

  
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
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
        </div>

        <Tabs forceRenderTabPanel={true} onSelect={() => forceRerender(rerenderVar + 1)}>
          <TabList>
            <Tab>Suicide Rates by Gender</Tab>
            <Tab>Suicide Rates by Age Group</Tab>
          </TabList>

          <TabPanel>
            <div style={{"overflow": "hidden"}}>
              <SR_By_Sex geoJSONdata={geoJSONdata} showFlatMap={showFlatMap} rerenderVar={rerenderVar}/>
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{"overflow": "hidden"}}>
              <SR_By_Age geoJSONdata={geoJSONdata} showFlatMap={showFlatMap} rerenderVar={rerenderVar}/>
            </div>
          </TabPanel>
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
    </>
  );
}

export default App;
