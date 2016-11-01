import React from 'react';
import styles from './cms.scss';
import Cms from './cms';
import md from './md';

export default class Item extends React.Component {
	render() {
		var node = this.props.node;
		var fields = [];
		for (let i = 0; i < node.model.fields.length; i++) {
			fields.push(<Field key={i} node={node} field={node.model.fields[i]} setValue={this.props.setValue}/>);
		}
		return (
			<form>
				{fields}
			</form>
		);
	}
}

class Field extends React.Component {
	constructor(props) {
		super(props);
		this.setValue = this.setValue.bind(this);
	}
	setValue(event) {
		var value = event.target.value;
		if (this.props.field.type == 'markdown') {
			value = md.html(value);
		}
		this.props.setValue(this.props.node, this.props.field, value);
	}
	render() {
		var field = this.props.field;
		var data = this.props.node.data;
		var name = Cms.fieldName(field);
		var displayName = Cms.fieldDisplayName(field);
		var value = data[name];
		var description = field.description ? <div><small>{field.description}</small></div> : '';
		var typeHelp = (field.type == 'markdown') ?
			<div className="type">
				<a className="blue" target="_blank" href="http://commonmark.org/help/">(markdown)</a>
			</div>
			: '';
		var input;
		switch (field.type) {
			case 'textarea':
				input = <textarea name={name} onChange={this.setValue}>{value}</textarea>;
				break;
			case 'markdown':
				input = <textarea name={name} onChange={this.setValue}>{md.md(value)}</textarea>;
				break;
			case 'checkbox':
				input = <input type="checkbox" name={name} value={value} onChange={this.setValue}/>;
				break;
			default:
				input = <input type="text" name={name} value={value} onChange={this.setValue}/>;
		}
		return (
			<label>
				<strong>
					{displayName}
					{typeHelp}
				</strong>
				{description}
				{input}
			</label>
		);
	}
}
