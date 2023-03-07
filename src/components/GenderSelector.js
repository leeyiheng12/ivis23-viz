import styles from "./GenderSelector.module.css";
import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IoMan, IoWoman } from "react-icons/io5";

// https://react-bootstrap.github.io/layout/grid/
// xs < 576px
// sm >= 576px

function GenderSelector(props) {

  const [maleSelected, setMaleSelected] = React.useState(true);
  const [femaleSelected, setFemaleSelected] = React.useState(false);

  function maleClickHandler(e) {

    if (maleSelected) {
      if (femaleSelected) {
        props.setSelectedSex("Female");
        setMaleSelected((prev) => !prev);
      }
    } else {
      setMaleSelected((prev) => !prev);
      if (femaleSelected) {
        props.setSelectedSex("All");
      } else {
        props.setSelectedSex("Male");  // should never reach here
      }
    }
  }


  function femaleClickHandler(e) {

    if (femaleSelected) {
      if (maleSelected) {
        props.setSelectedSex("Male");
        setFemaleSelected((prev) => !prev);
      }
    } else {
      setFemaleSelected((prev) => !prev);
      if (maleSelected) {
        props.setSelectedSex("All");
      } else {
        props.setSelectedSex("Female");  // should never reach here
      }
    }
  }


  const iconSize = 50;

    return (
      <Row className="d-flex justify-content-center pt-2">
        <Col xs="2" sm="2">
          <IoMan size={iconSize}
            className={maleSelected ? styles.iconSelected : styles.iconUnselected}
            onClick={maleClickHandler}
          />
        </Col>

        <Col xs="2" sm="2">
          <IoWoman size={iconSize}
            className={femaleSelected ? styles.iconSelected : styles.iconUnselected}
            onClick={femaleClickHandler}
          />
        </Col>
    </Row>
    )
}

export default GenderSelector;
