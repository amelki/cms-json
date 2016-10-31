import React from 'react';
import styles from './cms.scss';
import axios from 'axios';
import { Router, Route, Link, browserHistory } from 'react-router';
import Cms from './cms';
import Tree from './tree';
import List from './list';
import Item from './item';

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
		this.addItem = this.addItem.bind(this);
		this.deleteItem = this.deleteItem.bind(this);
		this.isStateValid = this.isStateValid.bind(this);
		this.setValue = this.setValue.bind(this);
		this.saveState = this.saveState.bind(this);
		this.loadState = this.loadState.bind(this);
		this.resetState = this.resetState.bind(this);
		this.doSetState = this.doSetState.bind(this);
  }
  doSetState() {
		this.state.stale = true;
		this.state.message = "";
		this.setState(this.state);
	}
  addItem(node) {
		Cms.addItem(node);
		this.doSetState();
	}
  deleteItem(node, index) {
		Cms.deleteItem(node, index);
		this.doSetState();
	}
  setValue(node, field, value) {
		var name = Cms.fieldName(field);
		node.data[name] = value;
		this.doSetState();
	}
	isStateValid() {
		return this.state.model && this.state.data;
	}
	saveState() {
		if (this.state.stale) {
			var _this = this;
			axios.post('/data.json', this.state.data).then(response => {
				_this.state.stale = false;
				_this.state.message = "JSON data file saved on disk";
				_this.setState(_this.state);
			}).catch(err => {
				_this.state.message = "Error: " + err;
			});
		}
	}
	resetState() {
		this.loadState('Loaded CMS JSON data and model files');
	}
	loadState(message) {
		Promise.all([ axios.get(`/model.json`), axios.get(`/data.json`) ]).then(values => {
			this.setState({
				model: values[0].data,
				data: values[1].data,
				stale: false,
				message: message ? message : ''
			});
		});
	}
	componentDidMount() {
		this.loadState();
	}
  render() {
		if (!this.isStateValid()) {
			return <div>No model nor data</div>;
		}
		var selection = this.props.params.splat;
		var node;
		var right = '';
		if (selection && selection.length > 0) {
			node = Cms.findNode(this.state.model, this.state.data, selection);
			if (node.model.list) {
				if (Array.isArray(node.data)) {
					right = <List node={node} selection={selection} addItem={this.addItem} deleteItem={this.deleteItem}/>;
				} else {
					right = <Item node={node} setValue={this.setValue}/>;
				}
			} else if (!node.model.children) {
				right = <Item node={node} setValue={this.setValue}/>
			}
		}
		var saveBtnClass = (this.state.stale ? 'btn blue cmd' : 'btn blue cmd disabled');
		var resetBtnClass = (this.state.stale ? 'btn cmd' : 'btn cmd disabled');
		return (
    	<div>
				<aside id="sidebar">
					<div className="inner">
						<header>
							<h1>{this.state.model.name}</h1>
						</header>
						<Tree model={this.state.model} selection={'/' + Cms.treePath(selection)}/>
					</div>
				</aside>
				<section id="content">
					<div id="navbar">
						<a href="#" className={saveBtnClass} onClick={this.saveState}>Save</a>
						<a href="#" className={resetBtnClass} onClick={this.resetState}>Reset</a>
						<div id="message">{this.state.message}</div>
					</div>
					<hr/>
					{right}
				</section>
			</div>
    );
  }
}

export const NoMatch = () => {
	return (
		<div>
			<h4>
				404 Page Not Found
			</h4>
			<Link to="/"> Go back to homepage </Link>
		</div>
	);
};


