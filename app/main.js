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
		busy: false,
		selection: '',
		message: ""
	};
	let store = createStore(reducer, initialState);
	ReactDOM.render(
		<Provider store={store}>
			<BrowserRouter>
				<App/>
			</BrowserRouter>
		</Provider>,
		document.getElementById('root')
	);
});

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


