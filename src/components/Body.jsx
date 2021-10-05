import React, { Component } from "react";
import {Container} from "react-bootstrap";
import {Route, BrowserRouter as Router, Switch} from "react-router-dom"
import Home from './Home';
import Navigation from './Navigation';

class Body extends Component {
	render() {
		return ( 
			<main>
			<Container>
				<Router>
					<Switch>
						<Route path="/" exact component={Home}></Route>
						<Route path="/Navigation" exact component={Navigation}></Route>
					</Switch>
				</Router>
			</Container>
			</main>
		);
		
	}
}

export default Body;