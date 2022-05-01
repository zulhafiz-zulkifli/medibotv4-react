import React, { Component } from "react";
import {Row, Col, Form, Button, ButtonGroup} from "react-bootstrap";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import Config from "../scripts/config";


class Map extends Component {
	state = {
		ros:null,
		viewer:null,
		show_path:false,
		pathView:null,
		pathTopic:null
	};

	constructor(){
		super();
		this.view_map = this.view_map.bind(this);
		this.showPath = this.showPath.bind(this);
		this.hidePath = this.hidePath.bind(this);
	}

	init_connection(){
		// eslint-disable-next-line
		this.state.ros = new window.ROSLIB.Ros();

		this.state.ros.on("connection", () => {
			console.info("Connected to ROS:MAP");
			this.setState({connected:true});
		});

		this.state.ros.on("close", () => {
			console.warn("Disconnected from ROS:MAP");
			this.setState({connected:false});
			//try to reconnect every 3 seconds
			setTimeout(()=>{
				try{
					this.state.ros.connect(
						"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
					);
				}catch(error){
					console.error("Connection problem : MAP");
				}
			},Config.RECONNECTION_TIMER);
		});

		try{
			this.state.ros.connect(
				"ws://"+Config.ROSBRIDGE_SERVER_IP+":"+Config.ROSBRIDGE_SERVER_PORT+""
			);
		}catch(error){
			console.error("Connection problem : MAP");
		}

		this.state.ros.on("error", (error) => {
			// console.log('Error connecting to ROS: ', error);
		});
	}

	componentDidMount(){
		this.init_connection();
		this.view_map();
	}


	view_map(){
		// eslint-disable-next-line
		this.state.viewer = new window.ROS2D.Viewer({
			divID: "nav_div",
			width: 640,
			height: 480,
		});

		var navClient = new window.NAV2D.OccupancyGridClientNav({
			ros: this.state.ros,
			rootObject: this.state.viewer.scene,
			viewer: this.state.viewer,
			serverName: '/move_base',
			withOrientation: true,
			continuous: true,
		});
		
	    // Scale the canvas to fit to the map
	    // gridClient.on('change', function(){
	    //   viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
	    // });
	}

	navigation(){
		if(this.state.pathView==null && this.state.pathTopic==null && this.state.show_path){
			this.showPath();
		}
		window.navigation = true;
		window.homing = false;

	}

	localize(){
		if(this.state.pathView==null && this.state.pathTopic==null && this.state.show_path){
			this.showPath();
		}
		window.navigation = false;
		window.homing = true;
	}

	stop(){
		window.navigation = false;
		window.homing = false;
		var move_base_stop = new window.ROSLIB.Topic({
	        ros: this.state.ros,
	        name: '/move_base/cancel',
	        messageType: 'actionlib_msgs/GoalID'
	    });
	    var move_base_stop_msg = new window.ROSLIB.Message({
	        id: ''
	    });
	    move_base_stop.publish(move_base_stop_msg);
	    this.hidePath(true);
	}

	resetnavloc(){
		window.navigation = false;
		window.homing = false;
	}

	showPath(){
		this.setState({show_path:true});
		if(this.state.pathView==null && this.state.pathTopic==null){
			this.state.pathView = new window.ROS2D.PathShape({
	            ros: this.state.ros,
	            strokeSize: 0.2,
	            strokeColor: "green",
	        });

	        this.state.viewer.scene.addChild(this.state.pathView);

	        this.state.pathTopic = new window.ROSLIB.Topic({
	            ros: this.state.ros,
	            name: '/move_base/NavfnROS/plan',
	            messageType: 'nav_msgs/Path'
	        });

	        this.state.pathTopic.subscribe((message)=>{
	            this.state.pathView.setPath(message);
	        });
		}
	}

	hidePath(isStopping=false){
		if(!isStopping){
			this.setState({show_path:false});
		}
		
        this.state.viewer.scene.removeChild(this.state.pathView);
        if (this.state.pathTopic) {
            this.state.pathTopic.unsubscribe();
        }
        this.setState({pathView:null});
        this.setState({pathTopic:null});
	}

	render() {
		return ( 
			<div>

			<p id="nav_div"></p>

			&emsp;&emsp;&emsp;&emsp;PATH VIEW&emsp;<BootstrapSwitchButton checked={this.state.show_path?true:false} onChange={()=>{this.state.show_path?this.hidePath():this.showPath()}}  onstyle="info" offstyle="secondary" onlabel="ON" offlabel="OFF"/>
			&emsp;&emsp;&emsp;&emsp;
			<ButtonGroup horizontal size="md">
			 	<Button onClick={()=>{this.localize()}} variant="success">LOCALIZE</Button>
			 	<Button onClick={()=>{this.navigation()}} variant="primary">NAVIGATE</Button>
			 	<Button onClick={()=>{this.stop()}} variant="danger">STOP</Button>
			</ButtonGroup>
			</div>
		);
	}
}

export default Map;