import * as React from "react";
import * as ReactDOM from 'react-dom'
import App from './components/app';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {
	mainReducer, editingFieldReducer, messageReducer, navigationReducer, confirmReducer,
	editingNodeReducer
} from './reducers';
import {Provider} from 'react-redux';
import axios from 'axios';
import thunkMiddleware from 'redux-thunk';
import {createForms} from 'react-redux-form';

import {ConnectedRouter, routerReducer, routerMiddleware, RouterState} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';
import watch from './watch';
import {clearFieldErrors, onNavigate} from "./actions";
import AppState, {makeAppState} from "./state";

const history = createHistory();
const historyMiddleware = routerMiddleware(history);

Promise.all([axios.get(`/model.json`), axios.get(`/data.json`)]).then(values => {
	const initialState = makeAppState(values[0].data, values[1].data);
	const store = createStore<AppState>(combineReducers({
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
	store.subscribe(watch(store.getState, 'main.path')((newVal, oldVal/*, objectPath */) => {
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
	store.subscribe(watch(store.getState, 'router.location.pathname')((newVal, oldVal/*, objectPath */) => {
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
