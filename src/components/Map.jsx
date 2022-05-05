import React, { Component } from "react";
import {Row, Col, Form, Button, ButtonGroup, ListGroup, FloatingLabel, Modal} from "react-bootstrap";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import ClickNHold from "react-click-n-hold"; 
import Config from "../scripts/config";
window.navigation = false;
window.homing = false;

class Map extends Component {


	state = {
		ros:null,
		viewer:null,
		show_path:true,
		pathView:null,
		pathTopic:null,
		label:[],
		show_set_spot: false
	};

	constructor(){
		super();
		this.view_map = this.view_map.bind(this);
		this.showPath = this.showPath.bind(this);
		this.hidePath = this.hidePath.bind(this);
		this.getSpot = this.getSpot.bind(this);
		this.setSpot = this.setSpot.bind(this);
		this.sendGoal = this.sendGoal.bind(this);
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
		this.getSpot();

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
		try{
			window.navigation = true;
			window.homing = false;
		}catch(error){
			console.error("window.navigation or window.homing problem");
		}
	}

	localize(){
		if(this.state.pathView==null && this.state.pathTopic==null && this.state.show_path){
			this.showPath();
		}
		try{
			window.navigation = false;
			window.homing = true;
		}catch(error){
			console.error("window.navigation or window.homing problem");
		}
	}

	stop(){
		try{
			window.navigation = false;
			window.homing = false;
		}catch(error){
			console.error("window.navigation or window.homing problem");
		}
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




    zoomInMap(){
        var zoom = new window.ROS2D.ZoomView({
            ros: this.state.ros,
            rootObject: this.state.viewer.scene
        });
        zoom.startZoom(250, 250);
        zoom.zoom(1.2);
    }

    zoomOutMap(){
        var zoom = new window.ROS2D.ZoomView({
            ros: this.state.ros,
            rootObject: this.state.viewer.scene
        });
        zoom.startZoom(250, 250);
        zoom.zoom(0.8);
    }


    panUpMap(){
        var pan = new window.ROS2D.PanView({
            ros: this.state.ros,
            rootObject: this.state.viewer.scene
        });
        pan.startPan(250, 250);
        pan.pan(250,300);
    }

    panDownMap(){
        var pan = new window.ROS2D.PanView({
            ros: this.state.ros,
            rootObject: this.state.viewer.scene
        });
        pan.startPan(250, 250);
        pan.pan(250,200);
    }

    panRightMap(){
        var pan = new window.ROS2D.PanView({
            ros: this.state.ros,
            rootObject: this.state.viewer.scene
        });
        pan.startPan(250, 250);
        pan.pan(200,250);
    }

    panLeftMap(){
        var pan = new window.ROS2D.PanView({
            ros: this.state.ros,
            rootObject: this.state.viewer.scene
        });
        pan.startPan(250, 250);
        pan.pan(300,250);
    }

    getSpot(){
		var get_spot = new window.ROSLIB.Service({
			ros : this.state.ros,
			name : '/save_spots/get_spot',
			serviceType : 'medibotv4/GetSpot'
		});

		var request = new window.ROSLIB.ServiceRequest({});
		var i, temp_label=[];
		get_spot.callService(request, function(result) {
			for(i=0; i<result.label.length; i++){
				temp_label.push(result.label[i].toString());
			}
		});
		setTimeout(() => {
			this.setState({ label: []});
			this.setState({ label: this.state.label.concat(temp_label)});
			console.log("This is it!!!");
			console.log(this.state.label);
		}, 2000);
    }

    sendGoal(){
    	console.log(this.refs.select_spot_form_ref.value);


    	var send_goal = new window.ROSLIB.Service({
			ros : this.state.ros,
			name : '/save_spots/send_goal',
			serviceType : 'medibotv4/SendGoal'
		});

		var request = new window.ROSLIB.ServiceRequest({
			label: this.refs.select_spot_form_ref.value
		});

		send_goal.callService(request, function(result) {
			console.log(result.success);
			console.log(result.message);
		});

		setTimeout(() => {
			if(this.state.pathView==null && this.state.pathTopic==null && this.state.show_path){
				this.showPath();
			}
		}, 100);

		
    }

    setSpot(act){
    	var temp_label;
    	if(act === 'add'){
    		temp_label = this.refs.set_spot_form_ref.value;
    	}
    	else if(act === 'remove'){
			temp_label = this.refs.select_spot_form_ref.value;
    	}
    	else if(act === 'clear'){
    		temp_label = '';
    	}

    	var set_spot = new window.ROSLIB.Service({
			ros : this.state.ros,
			name : '/save_spots/set_spot',
			serviceType : 'medibotv4/SetSpot'
		});

		var request = new window.ROSLIB.ServiceRequest({
			action: act, //add remove or clear
			label: temp_label
		});

		set_spot.callService(request, function(result) {
			console.log(result.success);
			console.log(result.message);
		});	

		setTimeout(() => {
			this.getSpot();
			if(act === 'add'){
    			this.setState({show_set_spot:!this.state.show_set_spot});
    		}
		}, 500);
    }

	render() {
		return ( 
			<div>			
				<ListGroup.Item variant="dark">
					<Row>
						<p id="nav_div"></p>
						<Col>
							<Row>
								<ButtonGroup horizontal size="md">
								 	<Button onClick={()=>{this.localize()}} variant="success">LOCALIZE</Button>
								 	<Button onClick={()=>{this.navigation()}} variant="primary">NAVIGATE</Button>
								 	<Button onClick={()=>{this.stop()}} variant="danger">STOP</Button>
								</ButtonGroup>
								<p></p>
								<div>
								SHOW PATH&emsp;<BootstrapSwitchButton checked={this.state.show_path?true:false} onChange={()=>{this.state.show_path?this.hidePath():this.showPath()}}  onstyle="info" offstyle="secondary" onlabel="ON" offlabel="OFF"/>
								</div>
							</Row>
					 	</Col>
					 	<Col>

					 		ZOOM/PAN VIEW&emsp;
					 		<ButtonGroup vertical size="sm" className="gap-4">				
								<Button onClick={()=>{this.zoomInMap()}} variant="secondary"> + </Button>
						 		<Button onClick={()=>{this.zoomOutMap()}} variant="secondary"> - </Button>
						 	</ButtonGroup>&nbsp;&nbsp;&nbsp;


						 	<ButtonGroup size="sm" className="gap-1">	
						 		<Button size="sm" onClick={()=>{this.panLeftMap()}} variant="secondary"> ← </Button>
						 	</ButtonGroup>&nbsp;
						 	<ButtonGroup vertical size="sm" className="gap-4">		
							 	<Button size="sm" onClick={()=>{this.panUpMap()}} variant="secondary"> ↑ </Button>
							 	<Button size="sm" onClick={()=>{this.panDownMap()}} variant="secondary"> ↓ </Button>
							</ButtonGroup>&nbsp;
							<ButtonGroup size="sm" className="gap-1">
						 		<Button size="sm" onClick={()=>{this.panRightMap()}} variant="secondary"> → </Button>
						 	</ButtonGroup>	

					 	</Col><p></p>
					 	<Col>
						 	<Form size="xs">    
							 	<FloatingLabel label="Select a spot" size="xs">
								 	<Form.Control as="select" ref="select_spot_form_ref" size="xs">
							            {this.state.label.map((x) => (<option key={x} value={x}>{x}</option>))}
								 	</Form.Control>
								</FloatingLabel>
							 	<p></p>
							 	<ButtonGroup size="sm" className="gap-1">
						 			<Button size="sm" onClick={()=>{this.sendGoal()}} variant="secondary"> GOTO </Button>
						 			<Button size="sm" onClick={()=>{this.setState({show_set_spot:!this.state.show_set_spot});}} variant="secondary"> SAVE </Button>
						 			<Button size="sm" onClick={()=>{this.setSpot("remove")}} variant="secondary"> REMOVE </Button>
						 			<Button size="sm" onClick={()=>{this.setSpot("clear")}} variant="secondary"> CLEAR ALL </Button>
						 		</ButtonGroup>	
							 	
						 	</Form>

					 	</Col>
					</Row>
				</ListGroup.Item>

				<Modal show={this.state.show_set_spot} onHide={()=>{this.setState({show_set_spot:!this.state.show_set_spot});}} backdrop="static" keyboard={false}>
			        <Modal.Header closeButton>
			          <Modal.Title>SAVE CURRENT SPOT</Modal.Title>
			        </Modal.Header>
			        <Modal.Body>
			          <Form.Control placeholder="Enter label or name" ref="set_spot_form_ref"/>
			        </Modal.Body>
			        <Modal.Footer>
			          <Button variant="danger" onClick={()=>{this.setState({show_set_spot:!this.state.show_set_spot});}}>
			            CANCEL
			          </Button>
			          <Button variant="success" onClick={()=>{this.setSpot("add")}}>SAVE</Button>
			        </Modal.Footer>
			      </Modal>

			</div>

		);
	}
}

export default Map;