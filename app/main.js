import React from 'react';
import ReactDOM from 'react-dom'
import App from './app';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {mainReducer, editingFieldReducer, messageReducer, navigationReducer, confirmReducer} from './reducers';
import {Provider} from 'react-redux';
import axios from 'axios';
import thunkMiddleware from 'redux-thunk';
import {createForms, combineForms} from 'react-redux-form';

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
		},
		editingField: null,
		confirm: null,
		message: {text: ''},
		navigation: {},
		router: {},
	};
	const initialField = {
		name: ''
	};
	const store = createStore(combineReducers({
			main: mainReducer,
			editingField: editingFieldReducer,
			message: messageReducer,
			navigation: navigationReducer,
			confirm: confirmReducer,
			router: routerReducer,
			...createForms({
				field: initialField
			})
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
