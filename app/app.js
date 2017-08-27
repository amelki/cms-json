import React from 'react';
import Content from './content';
import Json from './json';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { withRouter } from 'react-router';
import Header from './header';

class App extends React.Component {

	render() {
		const { message } = this.props;
		return (
				<div style={{position: 'relative', textAlign: 'left'}}>
					<Header/>
					<Switch>
						<Route exact path='/' component={Content}/>
						<Route path='/node/*' component={Content}/>
						<Route path='/json/*' component={Json}/>
					</Switch>
					<div id="message" className={ message.level }>{ message.text }</div>
				</div>
		);
	}
}

const mapStateToProps = state =>  {
	return {
		message: state.message
	};
};

export default withRouter(connect(mapStateToProps)(App));
