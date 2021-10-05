import React, { Component } from "react";
import Config from "../scripts/config";

class Map extends Component {
	state = {
		ros : null
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
			height: 480
		});

		var navClient = new window.NAV2D.OccupancyGridClientNav({
			ros: this.state.ros,
			rootObject: viewer.scene,
			viewer: viewer,
			serverName: "/move_base",
			withOrientation: true
		});

	    // // Setup the map client.
	    // var gridClient = new window.ROS2D.OccupancyGridClient({
	    //   ros : this.state.ros,
	    //   rootObject : viewer.scene
	    // });     
	    // // Scale the canvas to fit to the map
	    // gridClient.on('change', function(){
	    //   viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
	    // });


	}



	render() {
		return ( 
			<div>
				<div id="nav_div"></div>
			</div>
		);
	}
}

export default Map;