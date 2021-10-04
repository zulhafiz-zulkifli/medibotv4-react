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

		this.handleMove = this.handleMove.bind(this);
		this.handleStop = this.handleStop.bind(this);
	}

	init_connection(){
		// eslint-disable-next-line
		this.state.ros = new window.ROSLIB.Ros();

		this.state.ros.on("connection", () => {
			console.log("Connection to websocket server established!");
			this.setState({connected:true});
		});

		this.state.ros.on("close", () => {
			console.log("Connection to websocket server closed!");
			this.setState({connected:false});
			//try to reconnect every 3 seconds
			setTimeout(()=>{
				try{
					this.state.ros.connect(
						"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
					);
				}catch(error){
					console.log("connection problem");
				}
			},Config.RECONNECTION_TIMER);
		});

		try{
			this.state.ros.connect(
				"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
			);
		}catch(error){
			console.log("connection problem");
		}

		this.state.ros.on("error", (error) => {
			// console.log('Error connecting to websocket server: ', error);
		});
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
				x: event.y/50 ,
				y: 0,
				z: 0
			},
			angular:{
				x: 0,
				y: 0,
				z: -event.x/50
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
				size={100} 
				baseColor="#EEEEEE" 
				stickColor="#BBBBBB" 
				move={this.handleMove} 
				stop={this.handleStop}
				></Joystick>
			</div>
		);
	}
}

export default Teleoperation;