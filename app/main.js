import React from 'react';
import ReactDOM from 'react-dom'
import App from './app';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {mainReducer, messageReducer, navigationReducer} from './reducers';
import {Provider} from 'react-redux';
import axios from 'axios';
import thunkMiddleware from 'redux-thunk';
import { createForms } from 'react-redux-form';

import {ConnectedRouter, routerReducer, routerMiddleware} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';
import watch from 'redux-watch'
import {clearFieldErrors, onNavigate} from "./actions";

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
			fieldsInError: {},
			editingField: null
		},
		message: {text: ''},
		navigation: {},
		router: {},
		...createForms({
			field: {},
		}),
	};
	const store = createStore(combineReducers({
			main: mainReducer,
			message: messageReducer,
			navigation: navigationReducer,
			router: routerReducer
		}),
		initialState,
		applyMiddleware(historyMiddleware, thunkMiddleware)
	);
	store.subscribe(watch(store.getState, 'main.path')((newVal, oldVal, objectPath) => {
		if (newVal !== oldVal) {
			history.push('/node/' + newVal);
		}
	}));
	store.subscribe(watch(store.getState, 'router.location.pathname')((newVal, oldVal, objectPath) => {
		if (newVal !== oldVal) {
			// Clear field errors when navigating to any other path
			store.dispatch(clearFieldErrors());
			store.dispatch(onNavigate(oldVal, newVal));
		}
	}));
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
