import React, { Component } from "react";
import {Container} from "react-bootstrap";
import {Route, BrowserRouter as Router, Switch} from "react-router-dom"
import Monitor from './Monitor';
import Navigation from './Navigation';

class Body extends Component {
	render() {
		return ( 
			<main>
			<Container>
				<Router>
					<Switch>
						<Route path="/" exact component={Navigation}></Route>
						<Route path="/Monitor" exact component={Monitor}></Route>
					</Switch>
				</Router>
			</Container>
			</main>
		);
		
	}
}

export default Body;