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
  }
  addItem(node) {
		Cms.addItem(node);
		this.setState(this.state);
	}
  deleteItem(node, index) {
		Cms.deleteItem(node, index);
		this.setState(this.state);
	}
  setValue(node, field, value) {
		var name = Cms.fieldName(field);
		node.data[name] = value;
		this.setState(this.state);
	}
	isStateValid() {
		return this.state.model && this.state.data;
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
						<input type="submit" value="Save"/>
					</div>
					{right}
				</section>
			</div>
    );
  }
	componentDidMount() {
		Promise.all([ axios.get(`/model.json`), axios.get(`/data.json`) ]).then(values => {
			this.setState({ model: values[0].data, data: values[1].data });
		});
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


