import React from 'react';
import ReactDOM from 'react-dom'
import App from './app';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { mainReducer, messageReducer } from './reducers';
import {Provider} from 'react-redux';
import axios from 'axios';
import thunkMiddleware from 'redux-thunk';

import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

Promise.all([axios.get(`/model.json`), axios.get(`/data.json`)]).then(values => {
	const initialState = {
		main: {
			tree: {
				model: values[0].data,
				data: values[1].data
			},
			stale: false,
			busy: false,
		},
		message: { text: '' },
		router: {}
	};
	const store = createStore(combineReducers({
			main: mainReducer,
			message: messageReducer,
			router: routerReducer
		}),
		initialState,
		applyMiddleware(historyMiddleware, thunkMiddleware)
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

// const NoMatch = () => {
// 	return (
// 		<div>
// 			<h4>
// 				404 Page Not Found
// 			</h4>
// 			<Link to="/"> Go back to homepage </Link>
// 		</div>
// 	);
// };
