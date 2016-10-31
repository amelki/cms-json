import React from 'react';
import styles from './cms.scss';
import Cms from './cms';
import { Link } from 'react-router';

export default class List extends React.Component {
	constructor(props) {
		super(props);
		this.addItem = this.addItem.bind(this);
	}
	addItem() {
		this.props.addItem(this.props.node);
	}
	render() {
		var node = this.props.node;
		var rows = [];
		for (var i = 0; i < node.data.length; i++) {
			rows.push(<ListRow key={i} index={i} node={node} deleteItem={this.props.deleteItem} selection={this.props.selection}/>);
		}
		return (
			<div>
				<table>
					<tbody>
					{rows}
					</tbody>
				</table>
				<a id="addBtn" className="btn" onClick={this.addItem}>Add Item</a>
			</div>
		);
	}
}

class ListRow extends React.Component {
	constructor(props) {
		super(props);
		this.deleteItem = this.deleteItem.bind(this);
	}
	deleteItem() {
		this.props.deleteItem(this.props.node, this.props.index);
	}
	render() {
		var node = this.props.node;
		var index = this.props.index;
		var label = node.data[index][Cms.defaultFieldName(node.model)];
		return (
			<tr>
				<td>
					<Link to={ '/node/' + this.props.selection + '/' + index }>{label}</Link>
				</td>
				<td className="delete">
					<a href="#" onClick={this.deleteItem}>×</a>
				</td>
			</tr>
		)
	}
}
