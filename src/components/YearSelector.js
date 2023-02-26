import styles from "./YearSelector.module.css";
import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import RangeSlider from 'react-bootstrap-range-slider';

function YearSelector(props) {

    return (
      <>
        <Row className="pt-1 d-flex justify-content-center">
          <Col xs="6" sm="6">
            <RangeSlider
              min={props.minYear}
              max={props.maxYear}
              step={1}
              value={props.selectedYear}
              onChange={(e) => props.setSelectedYear(e.target.value)}
              tooltipPlacement="top"
            />
          </Col>      
        </Row>

        <Row className={`${styles.yearText} d-flex justify-content-center`}>
          <Col xs="5" sm="5"></Col>
        </Row>
      </>
    )
}

export default YearSelector;
