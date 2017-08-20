import React from 'react';
import { render } from 'react-dom'
import {App, NoMatch,} from './app';
import Json from './json';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

render((
		<BrowserRouter>
			<Switch>
				<Route exact path="/" component={App}/>
				<Route path="/node/*" component={App}/>
				<Route path="/json/*" component={Json}/>
				<Route component={NoMatch}/>
			</Switch>
		</BrowserRouter>
), document.getElementById('root'));
