import React from 'react';
import Content from './content';
import Json from './json';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { withRouter } from 'react-router';
import Header from './header';

class App extends React.Component {

	// saveState() {
	// 	if (this.state.stale) {
	// 		const _this = this;
	// 		axios.post('/data.json', this.state.data).then(() => {
	// 			_this.state.stale = false;
	// 			_this.state.message = "JSON data file saved on disk";
	// 			_this.setState(_this.state);
	// 		}).catch(err => {
	// 			_this.state.message = "Error: " + err;
	// 		});
	// 	}
	// }

	render() {
		let { message } = this.props;
		return (
				<div style={{position: 'relative', textAlign: 'left'}}>
					<Header/>
					<Switch>
						<Route exact path='/' component={Content}/>
						<Route path='/node/*' component={Content}/>
						<Route path='/json/*' component={Json}/>
					</Switch>
					<div id="message">{message}</div>
				</div>
		);
	}
}

const mapStateToProps = state =>  {
	return {
		message: state.main.message
	};
};

export default withRouter(connect(mapStateToProps)(App));
