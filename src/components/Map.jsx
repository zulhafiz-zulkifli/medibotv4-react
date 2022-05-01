import React, { Component } from "react";
import {Row, Col, Form, Button, ButtonGroup} from "react-bootstrap";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import Config from "../scripts/config";


class Map extends Component {
	state = {
		ros:null,
		show_path:false
	};

	constructor(){
		super();
		this.view_map = this.view_map.bind(this);
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
		var viewer = new window.ROS2D.Viewer({
			divID: "nav_div",
			width: 640,
			height: 480,
		});

		var navClient = new window.NAV2D.OccupancyGridClientNav({
			ros: this.state.ros,
			rootObject: viewer.scene,
			viewer: viewer,
			serverName: '/move_base',
			withOrientation: true,
			continuous: true,
		});
		//this.navClient.upathed();
	    // Setup the map client.
	    // var gridClient = new window.ROS2D.OccupancyGridClient({
	    //   ros : this.state.ros,
	    //   rootObject : viewer.scene
	    // });     
	    // Scale the canvas to fit to the map
	    // gridClient.on('change', function(){
	    //   viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
	    // });
       	
	    //pathed() function
        var pathView = new window.ROS2D.PathShape({
            ros: this.state.ros,
            strokeSize: 0.1,
            strokeColor: "green",
        });

        viewer.scene.addChild(pathView);

        var pathTopic = new window.ROSLIB.Topic({
            ros: this.state.ros,
            name: '/move_base/NavfnROS/plan',
            messageType: 'nav_msgs/Path'
        });

        pathTopic.subscribe(function(message) {
            pathView.setPath(message);
        });
        //upathed() function
        // that.rootObject.removeChild(pathView);
        // if (pathTopic) {
        //     pathTopic.unsubscribe();
        // }
        // pathView = null;
        // pathTopic = null;
	}


	changeROSState(){
		this.setState({show_path:!this.state.show_path});
		// if (this.state.show_path){
  //           window.pathed;
  //       }
  //       else{
  //           window.upathed;
  //       }
  		// if(this.state.show_path){
  		// 	window.navigation = true;
    //     	//window.homing = false;
  		// }
  		// else{
  		// 	window.navigation = false;
    //     	//window.homing = true;
  		// }
	}

	navigation(){
		window.navigation = true;
		window.homing = false;
	}

	localize(){
		window.navigation = false;
		window.homing = true;
	}

	resetnavloc(){
		window.navigation = false;
		window.homing = false;
	}


	render() {
		return ( 
			<div>

			<p id="nav_div"></p>

			{/*<BootstrapSwitchButton id="show-path-btn" onChange={()=>{this.changeROSState()}}  onstyle="info" />*/}
			<ButtonGroup horizontal size="md">
			 	<Button onClick={()=>{this.localize()}} variant="success">LOCALIZE</Button>
			 	<Button onClick={()=>{this.navigation()}} variant="primary">NAVIGATE</Button>
			 	<Button onClick={()=>{this.resetnavloc()}} variant="secondary">RESET</Button>
			</ButtonGroup>
			</div>
		);
	}
}

export default Map;