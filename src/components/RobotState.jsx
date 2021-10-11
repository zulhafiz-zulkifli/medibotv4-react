import React, { Component } from "react";
import {Row, Col, ListGroup, Button, ButtonGroup} from "react-bootstrap";
import Config from "../scripts/config";
import * as Three from "three";
import Teleoperation from "./Teleoperation";

class RobotState extends Component {
	state = {
		ros:null,
		x:0,
		y:0,
		orientation:0,
		linear_velocity:0,
		angular_velocity:0,
		pwm:80,
		pwm_turn:60,
		pwm_control:false,
		lwheel:0,
		rwheel:0
	};

	constructor(){
		super();
		this.init_connection();
		this.changePwm = this.changePwm.bind(this);
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
		this.changePwm(0,0);
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
			this.setState({linear_velocity:message.linear.x});
			this.setState({angular_velocity:message.angular.z});
		});

		//create a pose subscriber
		var pose_subscriber = new window.ROSLIB.Topic({
			ros : this.state.ros,
			name : Config.ODOM_TOPIC,
			messageType : "nav_msgs/Odometry"
		});
		//create a pose callback
		pose_subscriber.subscribe((message)=>{
			this.setState({x:message.pose.pose.position.x});
			this.setState({y:message.pose.pose.position.y});
			this.setState({orientation:this.getOrientationFromQuaternion(message.pose.pose.orientation)});
		});

		//create a pwm subscriber
		var pwm_subscriber = new window.ROSLIB.Topic({
			ros : this.state.ros,
			name : Config.PWM_TOPIC,
			messageType : "std_msgs/Int16"
		});
		//create a pwm callback
		pwm_subscriber.subscribe((message)=>{
			this.setState({pwm:message.data});
		});

		//create a pwm turn subscriber
		var pwm_turn_subscriber = new window.ROSLIB.Topic({
			ros : this.state.ros,
			name : Config.PWM_TURN_TOPIC,
			messageType : "std_msgs/Int16"
		});
		//create a pwm callback
		pwm_turn_subscriber.subscribe((message)=>{
			this.setState({pwm_turn:message.data});
		});

		//create a lwheel subscriber
		var lwheel_subscriber = new window.ROSLIB.Topic({
			ros : this.state.ros,
			name : Config.ENCODER_LEFT_TOPIC,
			messageType : "std_msgs/Int16"
		});
		//create a lwheel callback
		lwheel_subscriber.subscribe((message)=>{
			this.setState({lwheel:message.data});
		});

		//create a rwheel subscriber
		var rwheel_subscriber = new window.ROSLIB.Topic({
			ros : this.state.ros,
			name : Config.ENCODER_RIGHT_TOPIC,
			messageType : "std_msgs/Int16"
		});
		//create a rwheel callback
		rwheel_subscriber.subscribe((message)=>{
			this.setState({rwheel:message.data});
		});
	}

	changePwm(dpwm,dpwm_turn){
	    var pwm_publisher = new window.ROSLIB.Topic({
	        ros: this.state.ros,
	        name: Config.PWM_TOPIC,
	        messageType: 'std_msgs/Int16'
	    });
	    var pwm_turn_publisher = new window.ROSLIB.Topic({
	        ros: this.state.ros,
	        name: Config.PWM_TURN_TOPIC,
	        messageType: 'std_msgs/Int16'
	    });
	    var pwm_msg = new window.ROSLIB.Message({
	        data: this.state.pwm+dpwm
	    });
	    var pwm_turn_msg = new window.ROSLIB.Message({
	        data: this.state.pwm_turn+dpwm_turn
	    });
	    pwm_publisher.publish(pwm_msg);
	    pwm_turn_publisher.publish(pwm_turn_msg);
	}

	changeROSState(){
		this.setState({pwm_control:!this.state.pwm_control});
	    var pwm_control_publisher = new window.ROSLIB.Topic({
	        ros: this.state.ros,
	        name: Config.PWM_CONTROL_TOPIC,
	        messageType: 'std_msgs/Bool'
	    });
	    var pwm_control_msg = new window.ROSLIB.Message({
	        data: this.state.pwm_control
	    });
	    pwm_control_publisher.publish(pwm_control_msg);
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
				<ListGroup>
						<ListGroup.Item variant="light">
							<Row>
								<Col>
									<h4 className="mt-4">PWM Control&ensp;
										<Button onClick={()=>{this.changeROSState()}} 
										variant={this.state.pwm_control?"danger":"success"}>
										{this.state.pwm_control?"OFF":"ON"}
										</Button>
									</h4>
									<p className="mt-0">
										<ButtonGroup vertical size="sm">
											<Button onClick={()=>{this.changePwm(10,0)}} variant="secondary" 
											disabled={this.state.pwm_control?true:false}>+</Button>
											<Button onClick={()=>{this.changePwm(-10,0)}} variant="secondary"
											disabled={this.state.pwm_control?true:false}>-</Button>
										</ButtonGroup>
										&emsp;Straight PWM : {this.state.pwm.toFixed(0)} 
									</p>
									<p className="mt-0">
										<ButtonGroup vertical size="sm">
										 	<Button onClick={()=>{this.changePwm(0,10)}} variant="secondary"
										 	disabled={this.state.pwm_control?true:false}>+</Button>
										 	<Button onClick={()=>{this.changePwm(0,-10)}} variant="secondary"
										 	disabled={this.state.pwm_control?true:false}>-</Button>
										</ButtonGroup>
										&emsp;Turning PWM : {this.state.pwm_turn.toFixed(0)} 
									</p>
								</Col>&emsp;
								<Col>
									<br/><Teleoperation/>
								</Col>
							</Row>
						</ListGroup.Item>
						<ListGroup.Item variant="dark">
							<Row>
								<Col>
									<h4 className="mt-4">Velocity</h4>
									<p className="m-0">Linear Velocity : {this.state.linear_velocity.toFixed(2)}</p>
									<p className="m-0">Angular Velocity : {this.state.angular_velocity.toFixed(2)}</p>
								</Col>&emsp;&emsp;&emsp;
								<Col>
									<h4 className="mt-4">Position</h4>
									<p className="m-0">x : {this.state.x.toFixed(2)}</p>
									<p className="m-0">y : {this.state.y.toFixed(2)}</p>
									<p className="m-0">θ : {this.state.orientation.toFixed(2)}</p>
								</Col>
								<Col>
									<h4 className="mt-4">Encoder</h4>
									<p className="m-0">Left Count : {this.state.lwheel.toFixed(0)}</p>
									<p className="m-0">Right Count : {this.state.rwheel.toFixed(0)}</p>
								</Col>
							</Row>
							<br/>
						</ListGroup.Item>
				</ListGroup>
			</div>
		);
	}
}

export default RobotState;