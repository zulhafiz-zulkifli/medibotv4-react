import React, { Component } from "react";
import Connection from "./Connection";
//import Teleoperation from "./Teleoperation";
import RobotState from "./RobotState";
import Map from "./Map";
import {Row, Col, Container} from "react-bootstrap";

class Navigation extends Component {
	render() {
		return ( 
			<div>
				<Container>
					{/*<h1 className="text-center mt-3">Medibot V4 Control</h1> */}
					<br/>
					<Row>
						<Col>
							<Connection/>
						</Col>
					</Row>
					<br/>
					<Row>
						<Col>
							<h1 className="text-center">ROBOT STATE</h1>
							<RobotState/>
						</Col>
						<Col>
							<h1 className="text-center">NAVIGATION</h1>
							<Map/>
						</Col>
					</Row>
{/*					<Row>
						<Col>
							<Teleoperation/>
						</Col>
					</Row>*/}
				</Container>
			</div>
		);
	}
}

export default Navigation;