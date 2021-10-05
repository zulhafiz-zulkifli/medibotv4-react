import React, { Component } from "react";
import {Alert} from "react-bootstrap";
import Config from "../scripts/config";

class Connection extends Component {
	state = {
		connected : false, 
		ros : null
	};

	constructor(){
		super();
		this.init_connection();
	}


	init_connection(){
		// eslint-disable-next-line
		this.state.ros = new window.ROSLIB.Ros();
		//console.log(this.state.ros);
		// if(!this.state.connected){
		// 	this.state.ros.connect(
		// 	 	"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
		// 	);
		// }

		this.state.ros.on("connection", () => {
			console.info("Connected to ROS:CONNECTION");
			this.setState({connected:true});
		});

		this.state.ros.on("close", () => {
			console.warn("Disconnected from ROS:CONNECTION");
			this.setState({connected:false});
			//try to reconnect every 3 seconds
			setTimeout(()=>{
				try{
					this.state.ros.connect(
						"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
					);
				}catch(error){
					console.error("Connection problem : CONNECTION");
				}
			},Config.RECONNECTION_TIMER);
		});

		try{
			this.state.ros.connect(
				"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
			);
		}catch(error){
			console.error("Connection problem : CONNECTION");
		}

		this.state.ros.on("error", (error) => {
			// console.log('Error connecting to ROS: ', error);
		});
	}


	render() {
		return ( 
			<div>
				<Alert className="text-center m-3" variant={this.state.connected?"success":"danger"}>
					{this.state.connected? "Robot Connected":"Robot Disconnected"}
				</Alert>
			</div>
		);
	}
}

export default Connection;