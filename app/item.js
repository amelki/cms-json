import React from 'react';
import styles from './cms.scss';
import Cms from './cms';

export default class Item extends React.Component {
	render() {
		var node = this.props.node;
		var fields = [];
		for (let i = 0; i < node.model.fields.length; i++) {
			fields.push(<Field key={i} data={node.data} field={node.model.fields[i]}/>);
		}
		return (
			<form>
				{fields}
			</form>
		);
	}
}

class Field extends React.Component {
	render() {
		var field = this.props.field;
		var data = this.props.data;
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
			case 'markdown':
				input = <textarea name={name}>{value}</textarea>;
				break;
			case 'checkbox':
				input = <input type="checkbox" name={name} value={value}/>;
				break;
			default:
				input = <input type="text" name={name} value={value}/>;
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
