import React, { Component } from "react";
import {Row, Col} from "react-bootstrap";
import Config from "../scripts/config";
import * as Three from "three";

class RobotState extends Component {
	state = {
		ros:null,
		x:0,
		y:0,
		orientation:0,
		linear_velocity:0,
		angular_velocity:0
	};

	constructor(){
		super();
		this.init_connection();
	}

	init_connection(){
		// eslint-disable-next-line
		this.state.ros = new window.ROSLIB.Ros();

		this.state.ros.on("connection", () => {
			console.info("Connected to ROS:ROBOTSTATE");
			this.setState({connected:true});
		});

		this.state.ros.on("close", () => {
			console.warn("Disconnected from ROS:ROBOTSTATE");
			this.setState({connected:false});
			//try to reconnect every 3 seconds
			setTimeout(()=>{
				try{
					this.state.ros.connect(
						"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
					);
				}catch(error){
					console.error("Connection problem : ROBOTSTATE");
				}
			},Config.RECONNECTION_TIMER);
		});

		try{
			this.state.ros.connect(
				"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
			);
		}catch(error){
			console.error("Connection problem : ROBOTSTATE");
		}

		this.state.ros.on("error", (error) => {
			// console.log('Error connecting to ROS: ', error);
		});
	}

	componentDidMount(){
		this.getRobotState();
	}

	getRobotState(){
		//create a twist subscriber
		var vel_subscriber = new window.ROSLIB.Topic({
			ros : this.state.ros,
			name : Config.CMD_VEL_TOPIC,
			messageType : "geometry_msgs/Twist"
			//messageType: "geometry_msgs/PoseWithCovariance"
		});
		//create a twist callback
		vel_subscriber.subscribe((message)=>{
			this.setState({linear_velocity:message.linear.x.toFixed(2)});
			this.setState({angular_velocity:message.angular.z.toFixed(2)});
			//this.setState({orientation:message.theta.toFixed(2)});
			//this.setState({orientation:this.getOrientationFromQuaternion(message.pose.pose.orientation).toFixed(2)});
		});

		//create a pose subscriber
		var pose_subscriber = new window.ROSLIB.Topic({
			ros : this.state.ros,
			name : Config.ODOM_TOPIC,
			messageType : "nav_msgs/Odometry"
		});
		//create a pose callback
		pose_subscriber.subscribe((message)=>{
			this.setState({x:message.pose.pose.position.x.toFixed(2)});
			this.setState({y:message.pose.pose.position.y.toFixed(2)});
			//this.setState({orientation:message.theta.toFixed(2)});
			this.setState({orientation:this.getOrientationFromQuaternion(message.pose.pose.orientation).toFixed(2)});
		});
	}

	getOrientationFromQuaternion(ros_orientation_quat){
		var q = new Three.Quaternion(
			ros_orientation_quat.x,
			ros_orientation_quat.y,
			ros_orientation_quat.z,
			ros_orientation_quat.w
		);
		//convert this quaternion into roll, pitch and yaw
		var RPY = new Three.Euler().setFromQuaternion(q);
		return RPY["_z"]*(180/Math.PI);
	}

	render() {
		return ( 
			<div>
				<Row>
					<Col>
						<h4 className="mt-4">Position</h4>
						<p className="mt-0">x : {this.state.x}</p>
						<p className="mt-0">y : {this.state.x}</p>
						<p className="mt-0">Orientation : {this.state.orientation}</p>
					</Col>
				</Row>
				<Row>
					<Col>
						<h4 className="mt-4">Velocity</h4>
						<p className="mt-0">Linear Velocity : {this.state.linear_velocity}</p>
						<p className="mt-0">Angular Velocity : {this.state.angular_velocity}</p>
					</Col>
				</Row>
			</div>
		);
	}
}

export default RobotState;