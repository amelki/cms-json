import React from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import Content from './content';
import Json from './json';
import { LOAD } from './actions';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { withRouter } from 'react-router';


class App extends React.Component {
	static isStateValid() {
		return this.props.state.model && this.props.state.data;
	}

	saveState() {
		if (this.state.stale) {
			const _this = this;
			axios.post('/data.json', this.state.data).then(() => {
				_this.state.stale = false;
				_this.state.message = "JSON data file saved on disk";
				_this.setState(_this.state);
			}).catch(err => {
				_this.state.message = "Error: " + err;
			});
		}
	}

	static resetState() {
		if (store.getState().stale) {
			this.loadState('Loaded CMS JSON data and model files');
		}
	}

	static loadState(message) {
		Promise.all([axios.get(`/model.json`), axios.get(`/data.json`)]).then(values => {
			store.dispatch({
				type: LOAD,
				model: values[0].data,
				data: values[1].data,
				message: message
			});
		});
	}

	render() {
		let { state } = this.props;
		const saveBtnClass = (state.stale ? 'btn blue cmd' : 'btn blue cmd disabled');
		const resetBtnClass = (state.stale ? 'btn cmd' : 'btn cmd disabled');
		return (
				<div style={{position: 'relative', textAlign: 'left'}}>
					<ul id="navbar">
						<li>
							<a href="#" className={saveBtnClass} onClick={this.saveState}>Save</a>
						</li>
						<li>
							<a href="#" className={resetBtnClass} onClick={this.resetState}>Reset</a>
						</li>
						<li>
							<div className="separator">|</div>
						</li>
						<li>
							<Link to="/" className="blue">Editor</Link>
						</li>
						<li>
							<div className="separator">|</div>
						</li>
						<li>
							<Link to="/json/data" className="blue">data.json</Link>
						</li>
						<li>
							<div className="separator">|</div>
						</li>
						<li>
							<Link to="/json/model" className="blue">model.json</Link>
						</li>
					</ul>
					<Switch>
						<Route exact path='/' component={Content}/>
						<Route path='/node/*' component={Content}/>
						<Route path='/json/*' component={Json}/>
					</Switch>
					<div id="message">{state.message}</div>
				</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		state: state
	};
}

export default withRouter(connect(mapStateToProps)(App));
