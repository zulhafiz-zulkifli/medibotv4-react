import React, { Component } from "react";
import { Joystick } from "react-joystick-component";
import {Row, Col, Form, InputGroup} from "react-bootstrap";
import { BsJoystick, BsKeyboard } from "react-icons/bs";
import Config from "../scripts/config";

class Teleoperation extends Component {
	state = {
		ros : null,
		key_teleop : true,
		key_teleop_obj : null,
		joy_teleop : false
	};

	constructor(){
		super();
		this.init_connection();
		this.initTeleopKeyboard();
		this.handleMove = this.handleMove.bind(this);
		this.handleStop = this.handleStop.bind(this);
		this.initTeleopKeyboard = this.initTeleopKeyboard.bind(this);
	}

	changeTeleopState(){
		this.setState({key_teleop:!this.state.key_teleop});
		this.setState({joy_teleop:!this.state.joy_teleop});
		console.log("key_teleop : "+this.state.key_teleop+" , joy_teleop : "+this.state.joy_teleop);
		if(this.state.key_teleop){
		    this.state.key_teleop_obj.scale=1.0;
		}
		else{
			this.state.key_teleop_obj.scale=0.0;
		}
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
	    if (this.state.key_teleop_obj == null){
	        this.state.key_teleop_obj = new window.KEYBOARDTELEOP.Teleop({
	            ros: this.state.ros,
	            topic: '/cmd_vel'
	        });
	        this.state.key_teleop_obj.scale=0.0;
	    }
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
			<Row>
				<Col align="center">
					  	<Joystick disabled={this.state.joy_teleop} size={100} baseColor="#BBBBBB" stickColor={this.state.joy_teleop?"#DDDDDD":"#EEEEEE"} move={this.state.joy_teleop?this.handleStop:this.handleMove} stop={this.handleStop}/>
				</Col>
				<Col align="left">
					<Form>
                    <InputGroup>
                        <Form.Check label="KEYBOARD" name="teleop" type="radio" id="key-teleop-radio" ref="key_teleop_radio_ref" checked={!this.state.key_teleop}  onChange={()=>{this.changeTeleopState();}}/>
                        &emsp;<BsKeyboard size={30}/>
                    </InputGroup><br></br>
                    <InputGroup>
                        <Form.Check label="JOYSTICK" name="teleop" type="radio" id="joy-teleop-radio" ref="joy_teleop_radio_ref" checked={!this.state.joy_teleop}  onChange={()=>{this.changeTeleopState();}}/>
                        &emsp;&ensp;<BsJoystick size={30}/>
                    </InputGroup>                    
                    </Form>
				</Col>
			</Row>
			</div>
		);
	}
}

export default Teleoperation;


