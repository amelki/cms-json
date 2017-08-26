import React from 'react';
import ReactDOM from 'react-dom'
import App from './app';
import Json from './json';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { createStore, combineReducers } from 'redux';
import reducer from './reducers';
import {Provider} from 'react-redux';
import axios from 'axios';
import { renderRoutes } from 'react-router-config';

Promise.all([axios.get(`/model.json`), axios.get(`/data.json`)]).then(values => {
	const initialState = {
		model: values[0].data,
		data: values[1].data,
		stale: false,
		message: ""
	};

	let store = createStore(reducer, initialState);
	ReactDOM.render(
		<Provider store={store}>
			<BrowserRouter>
				<Switch>
					<Route exact path='/' component={App}/>
					<Route path='/node/*' component={App}/>
					<Route path='/json/*' component={Json}/>
				</Switch>
			</BrowserRouter>
		</Provider>,
		document.getElementById('root')
	);
});

// Promise.all([axios.get(`/model.json`), axios.get(`/data.json`)]).then(values => {
// 	const initialState = {
// 		model: values[0].data,
// 		data: values[1].data,
// 		stale: false,
// 		message: ""
// 	};
	// let store = createStore(reducer, initialState);
	// ReactDOM.render(
	// 	<Provider store={store}>
	// 		<BrowserRouter>
	// 			<Switch>
	// 				<Route exact path='/' component={App}/>
	// 				{/* both /roster and /roster/:number begin with /roster */}
	// 				<Route path='/node/*' component={App}/>
	// 				<Route path='/json/*' component={Json}/>
	// 			</Switch>
	// 		</BrowserRouter>
	// 	</Provider>,
	// 	document.getElementById('root')
	// );
//});

const NoMatch = () => {
	return (
		<div>
			<h4>
				404 Page Not Found
			</h4>
			<Link to="/"> Go back to homepage </Link>
		</div>
	);
};


