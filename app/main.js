import React from 'react';
import { render } from 'react-dom'
import {App, NoMatch, Tree} from './theapp.js';
import { Router, Route, Link, browserHistory } from 'react-router'

render((
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<Route path="/node/*" component={App}/>
			<Route path="*" component={NoMatch}/>
		</Route>
	</Router>
), document.getElementById('root'))
