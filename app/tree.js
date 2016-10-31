import React from 'react';
import styles from './cms.scss';
import axios from 'axios';
import { Router, Route, Link, browserHistory } from 'react-router';
import Cms from './cms';

export default class Tree extends React.Component {
	render() {
		var model = this.props.model;
		var all = [];
		if (model.children && model.children.length > 0) {
			for (let i = 0; i < model.children.length; i++) {
				var child = model.children[i];
				all.push(<Node key={i} node={child} path={''} selection={this.props.selection}/>);
			}
			return <nav>{all}</nav>;
		}
		return <span/>;
	}
}

class Node extends React.Component {
	render() {
		var node = this.props.node;
		var path = this.props.path;
		var newPath = path + "/" + Cms.slugify(node.name);
		var linkClass = (this.props.selection == newPath) ? 'selected' : '';
		var prefix = "/node";
		var subul = "";
		if (node.children && node.children.length > 0) {
			var children = [];
			for (let i = 0; i < node.children.length; i++) {
				var child = node.children[i];
				children.push(<Node key={i} node={child} path={newPath} selection={this.props.selection}/>);
			}
			subul = <ul>{children}</ul>;
		}
		return (
			<li>
				<Link to={ prefix + newPath } className={linkClass}>{node.name}</Link>
				{subul}
			</li>
		);
	}
}
