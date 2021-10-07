import React, { Component } from "react";
import { Joystick } from "react-joystick-component";
import Config from "../scripts/config";

class Teleoperation extends Component {
	state = {
		ros : null
	};

	constructor(){
		super();
		this.init_connection();
		this.initTeleopKeyboard();
		this.handleMove = this.handleMove.bind(this);
		this.handleStop = this.handleStop.bind(this);
	}



	init_connection(){
		// eslint-disable-next-line
		this.state.ros = new window.ROSLIB.Ros();

		this.state.ros.on("connection", () => {
			console.info("Connected to ROS:TELEOP");
		});

		this.state.ros.on("close", () => {
			console.warn("Disconnected from ROS:TELEOP");
			setTimeout(()=>{
				try{
					this.state.ros.connect(
						"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
					);
				}catch(error){
					console.error("Connection problem : TELEOP");
				}
			},Config.RECONNECTION_TIMER);
		});

		this.state.ros.on("error", (error) => {});

		try{
			this.state.ros.connect(
				"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
			);
		}catch(error){
			console.error("Connection problem : TELEOP");
		}
	}

	initTeleopKeyboard() {
	    if (teleop == null) {
	        // Initialize the teleop.
	        var teleop = new window.KEYBOARDTELEOP.Teleop({
	            ros: this.state.ros,
	            topic: '/cmd_vel'
	        });
	    }
	    //console.log('TeleopKeyboard Initialized.');
	}

	handleMove(event){
		console.log("handle move");
		//create a ROS publisher to /cmd_vel
		var cmd_vel = new window.ROSLIB.Topic({
			ros: this.state.ros,
			name: Config.CMD_VEL_TOPIC,
			messageType: "geometry_msgs/Twist"
		});
		//create twist message to be published
		var twist = new window.ROSLIB.Message({
			linear:{
				x: event.y/150,
				y: 0,
				z: 0
			},
			angular:{
				x: 0,
				y: 0,
				z: -event.x/75
			}
		});
		//publish the message to /cmd_vel
		cmd_vel.publish(twist);
	}

	handleStop(event){
		console.log("handle stop");
		//create a ROS publisher to /cmd_vel
		var cmd_vel = new window.ROSLIB.Topic({
			ros: this.state.ros,
			name: Config.CMD_VEL_TOPIC,
			messageType: "geometry_msgs/Twist"
		});
		//create twist message to be published
		var twist = new window.ROSLIB.Message({
			linear:{
				x: 0,
				y: 0,
				z: 0
			},
			angular:{
				x: 0,
				y: 0,
				z: 0
			}
		});
		//publish the message to /cmd_vel
		cmd_vel.publish(twist);
	}

	render() {
		return ( 
			<div>
				<Joystick 
				size={150} 
				baseColor="#BBBBBB"
				stickColor="#EEEEEE" 
				move={this.handleMove} 
				stop={this.handleStop}
				></Joystick>
			</div>
		);
	}
}

export default Teleoperation;


