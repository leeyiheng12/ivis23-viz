import styles from "./AgeGroupSelector.module.css";
import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';


function AgeGroupSelector(props) {

    // const ageGroups = props.uniqueAgeGroups;
    // const ageGroups = ["5-14 years", "15-49 years", "50-69 years", "70+ years"]
    const ageGroups = ["5-14 years", "15-49 years", "50-69 years", "70+ years"]
    const groupStrings = [["5", "14"], ["15", "49"], ["50", "69"], ["70", ".."]]

    const [localSelectedGroup, setLocalSelectedGroup] = React.useState(3);
    const leftString = groupStrings[localSelectedGroup][0];
    const rightString = groupStrings[localSelectedGroup][1];

    function ageGroupHandler(idx) {
        setLocalSelectedGroup(idx);
        props.setSelectedAgeGroup(ageGroups[idx]);
    }

    return (
        <>
            <Row className={`align-items-center text-center pt-4 ${styles.row} d-flex justify-content-center`}>

                <Col xs="4" sm="4" className="align-items-center">
                    <div className={styles.barContainer}>

                        {
                            Array(4).fill().map(
                                (_, idx) => {
                                    return (
                                        <div key={idx}
                                            className={`${idx === localSelectedGroup && styles.selected} ${styles.group}`}
                                            onClick={(e) => ageGroupHandler(idx)}
                                        ></div>
                                    )
                                }
                            )

                        }


                    </div>
                </Col>

            </Row>

            <Row className={`align-items-center text-center d-flex justify-content-center ${styles.row}`}>
                <Col xs="4" sm="4" className="align-items-center">

                    <div className={styles.textContainer}>

                        {
                            Array(4).fill().map(
                                (_, idx) => {
                                    return (
                                        <div key={idx.toString() + "text"}
                                            className={styles.textGroup}>
                                            {idx === localSelectedGroup && ageGroups[idx]}
                                        </div>
                                    )
                                }
                            )
                        }


                    </div>
                </Col>
                {/* <Col xs="2" sm="2"></Col> */}
            </Row>
        </>
    )
}

export default AgeGroupSelector;
