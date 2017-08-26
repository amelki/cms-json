import React from 'react';
import styles from './cms.scss';
import axios from 'axios';
import {Link} from 'react-router-dom';
import Cms from './cms';
import Tree from './tree';
import List from './list';
import Item from './item';
import { LOAD } from './actions';
import { connect } from 'react-redux'

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

	// componentDidMount() {
	// 	App.loadState();
	// }

	render() {
		let { state } = this.props;
		const selection = (this.props.match.path === '/') ? '' : this.props.match.params[0];
		let node;
		let right = '';
		if (selection && selection.length > 0) {
			node = Cms.findNode(state.model, state.data, selection);
			if (node.model.list) {
				if (Array.isArray(node.data)) {
					right = <List node={node} selection={selection}/>;
				} else {
					let fragments = selection.split('/');
					let parent = fragments.slice(0, fragments.length - 1).join('/');
					right = <Item node={node} parent={parent} setValue={this.setValue}/>;
				}
			} else if (!node.model.children) {
				right = <Item node={node} setValue={this.setValue}/>
			}
		}
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
							<a href='/json/data.json' className="blue" target="_blank">data.json</a>
						</li>
						<li>
							<div className="separator">|</div>
						</li>
						<li>
							<a href='/json/model.json' className="blue" target="_blank">model.json</a>
						</li>
					</ul>
					<div id="content">
						<aside id="left">
							<div className="inner">
								<header>
									<h1>{state.model.name}</h1>
								</header>
								<Tree model={state.model} selection={'/' + Cms.treePath(selection)}/>
							</div>
						</aside>
						<section id="right">
							{right}
						</section>
					</div>
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

export default connect(mapStateToProps)(App);
