import React, { Component } from "react";
import Connection from "./Connection";
import RobotState from "./RobotState";
import Camera from "./Camera";
import {Row, Col, Container} from "react-bootstrap";

class Home extends Component {
	state = {
		
	};



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
							<h1 className="text-center">CAMERA</h1>
							<Camera/>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Home;