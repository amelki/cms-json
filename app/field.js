import React from 'react';
import * as Cms from './cms';
import md from './md';
import Tags from "./tags";
import { connect } from 'react-redux'
import {inputValue, addValue, editField, deleteField} from './actions';
import {TYPE_MAP_STRING} from "./cms";

class Field extends React.Component {
	render() {
		const { field, node, index, fieldIndex, fieldsInError, dispatch } = this.props;
		let className = field.className ? field.className : '';
		const data = node.data;
		const name = Cms.fieldName(field);
		const displayName = Cms.fieldDisplayName(field);
		let value;
		const nodeType = Cms.getNodeType(node);
		const inError = fieldsInError[node.path];
		if (inError && inError.field.name === field.name) {
			value = inError.value;
			className += ' error';
		} else {
			if (Cms.isMapType(node) && Cms.isKeyField(field)) {
				value = index;
			} else if (nodeType === TYPE_MAP_STRING && !Cms.isKeyField(field)) {
				value = data;
			} else {
				value = data[name];
			}
		}
		const description = field.description ? <div className="description"><small>{field.description}</small></div> : '';
		let typeHelp = field.type
			? <div className="type">
				({field.type})
			</div>
			: '';
		let input;
		const handleInputValue = (event) => {
			dispatch(inputValue(node, field, event));
		};
		const handleAddValue = (event) => dispatch(addValue(node, field, event));
		switch (field.type) {
			case 'textarea':
			case 'html':
				input = <textarea className={className} name={name} onChange={handleInputValue} value={value || ''}/>;
				break;
			case 'markdown':
				input = <textarea className={className} name={name} onChange={handleInputValue} value={md.md(value || '')}/>;
				typeHelp =
					<div className="type">
						<a className="blue" target="_blank" href="http://commonmark.org/help/">(markdown)</a>
					</div>;
				break;
			case 'boolean':
				input =
					<div className="checkbox">
						<input className={className} type="checkbox" id={name} name="checked" value={value} onChange={handleInputValue}/>
						<label htmlFor={name}/>
					</div>;
				break;
			case 'array':
				input = <Tags value={value} onChange={handleAddValue} />;
				break;
			default:
				input = <input autoComplete={"off"} className={className} type="text" name={name} value={value || ''} onChange={handleInputValue}/>;
		}
		return (
			<div className="field">
				<label>
					{displayName}
					<div className="right-block">
						{typeHelp}
						<div className="actions">
							<a href="#" onClick={() => dispatch(editField(node, fieldIndex))}><i className="fa fa-pencil" aria-hidden="true"/></a>
							<a href="#" onClick={() => dispatch(deleteField(node, fieldIndex))}><i className="fa fa-times" aria-hidden="true"/></a>
						</div>
					</div>
				</label>
				{description}
				{input}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		fieldsInError: state.main.fieldsInError
	};
};

export default connect(mapStateToProps)(Field);
