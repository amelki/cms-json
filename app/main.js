import React from 'react';
import ReactDOM from 'react-dom'
import App from './app';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {
	mainReducer, editingFieldReducer, messageReducer, navigationReducer, confirmReducer,
	editingNodeReducer
} from './reducers';
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
		editingNode: null,
		confirm: null,
		message: {text: ''},
		navigation: {},
		router: {},
	};
	const store = createStore(combineReducers({
			main: mainReducer,
			editingField: editingFieldReducer,
			editingNode: editingNodeReducer,
			message: messageReducer,
			navigation: navigationReducer,
			confirm: confirmReducer,
			router: routerReducer,
			...createForms({
				field: { name: '' },
				modelNode: { name: '' }
			})
		}),
		initialState,
		applyMiddleware(historyMiddleware, thunkMiddleware)
	);
	store.subscribe(watch(store.getState, 'main.path')((newVal, oldVal, objectPath) => {
		// In some cases, we need to defer the navigation after all reducers have been applied
		// This is the case of 'key' fields, which, each tme a character is typed, must trigger a navigation
		// If we don't defer, then the edited key field looses focus each time a character is entered.
		if (newVal !== null && newVal !== oldVal) {
			if (newVal === '') {
				history.push('/');
			} else {
				history.push('/node/' + newVal);
			}
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
