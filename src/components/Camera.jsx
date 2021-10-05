import React, { Component } from "react";
import {Image} from "react-bootstrap";

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
				<Image  id="usb-cam" src="images/hqdefault.jpg" width="640" height="480"
				onError={(e)=>{e.target.onerror = null; e.target.src="images/novideo.jpg"}}/>
			</div>
		);
	}
}

export default Camera;