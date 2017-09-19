import * as React from 'react';
import Content from './content';
import Json from './json';
import {connect} from 'react-redux';
import {Switch, Route} from 'react-router-dom';
import {withRouter} from 'react-router';
import Header from './header';
import {default as AppState, MessageState} from "../state";

interface Props {
	message: MessageState;
}

const App: React.SFC<Props> = ({message}) => (
	<div style={{position: 'relative', textAlign: 'left'}}>
		<Header/>
		<Switch>
			<Route exact path='/' component={Content}/>
			<Route path='/node/*' component={Content}/>
			<Route path='/json/*' component={Json}/>
		</Switch>
		<div id="message" className={message.level.toString()}>{message.text}</div>
	</div>
);

const mapStateToProps = (state : AppState ) : Props => {
	return {
		message: state.message
	};
};

export default withRouter(connect(mapStateToProps)(App));
