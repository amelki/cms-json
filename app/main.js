import React from 'react';
import { render } from 'react-dom'
import {App, NoMatch,} from './app';
import { Router, Route, browserHistory } from 'react-router'

render((
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<Route path="/node/*" component={App}/>
			<Route path="*" component={NoMatch}/>
		</Route>
	</Router>
), document.getElementById('root'));
