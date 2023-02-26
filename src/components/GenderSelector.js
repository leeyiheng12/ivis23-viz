import styles from "./GenderSelector.module.css";
import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IoMan, IoWoman } from "react-icons/io5";

// https://react-bootstrap.github.io/layout/grid/
// xs < 576px
// sm >= 576px

function GenderSelector(props) {

  const iconSize = 50;

    return (
      <Row className="d-flex justify-content-center pt-2">
        <Col xs="2" sm="2">
          <IoMan size={iconSize}
            className={props.selectedSex === "Male" ? styles.iconSelected : styles.iconUnselected}
            onClick={(e) => props.setSelectedSex("Male")}
          />
        </Col>

        <Col xs="2" sm="2">
          <IoWoman size={iconSize}
            className={props.selectedSex === "Female" ? styles.iconSelected : styles.iconUnselected}
            onClick={(e) => props.setSelectedSex("Female")}
          />
        </Col>
    </Row>
    )
}

export default GenderSelector;
