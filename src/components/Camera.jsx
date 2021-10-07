import React, { Component } from "react";
import {Image} from "react-bootstrap";
import Config from "../scripts/config";

class Camera extends Component {
	state = {
		
	};

	constructor(){
		super();
		this.init_video();
	}

	init_video(){
		
	}

	

	render() {
		return ( 
			<div>
				<Image  id="front-cam" src={Config.FRONT_CAM_SRC} width="640" height="480"
				onError={(e)=>{e.target.onerror = null; e.target.src=Config.ERROR_CAM_SRC}}/>
			</div>
		);
	}
}

export default Camera;