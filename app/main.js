import React from 'react';
import ReactDOM from 'react-dom'
import App from './app';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import reducers from './reducers';
import {Provider} from 'react-redux';
import axios from 'axios';

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';

const history = createHistory();
const middleware = routerMiddleware(history);

Promise.all([axios.get(`/model.json`), axios.get(`/data.json`)]).then(values => {
	const initialState = {
		main: {
			model: values[0].data,
			data: values[1].data,
			stale: false,
			busy: false,
			selection: '',
			message: ""
		},
		router: {}
	};
	let store = createStore(combineReducers({
			main: reducers,
			router: routerReducer
		}),
		initialState,
		applyMiddleware(middleware)
	);
	ReactDOM.render(
		<Provider store={store}>
			<ConnectedRouter history={history}>
				<App/>
			</ConnectedRouter>
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


