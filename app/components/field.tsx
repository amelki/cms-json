import * as React from 'react';
import * as Cms from '../cms';
import * as Markdown from '../md';
import Tags from "./tags";
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {inputValue, addValue, editField, deleteField} from '../actions';
import {withRouter} from "react-router";
import {Field, Model, NodeType} from "../model";
import {Node} from "../model";
import {ViewMode} from "../state";

interface Props {
	field: Field;
	node: Node<Model>;
	dataIndex: any;
	fieldIndex: number;
	fieldsInError: any;
	isDeveloper: boolean;
	dispatch: Dispatch<any>;
}

const FieldComponent: React.SFC<Props> = ({field, node, dataIndex, fieldIndex, fieldsInError, isDeveloper, dispatch}) => {
	const isKey = Cms.isKeyField(field);
	let className = field.className ? field.className : '';
	const data = node.data;
	const name = Cms.fieldName(field);
	const displayName = Cms.fieldDisplayName(field);
	let value;
	const nodeType = Cms.getNodeType(node);
	const inError = fieldsInError.get(node.path);
	if (inError && inError.name === field.name) {
		value = inError.value;
		className += ' error';
	} else {
		if (Cms.isMapType(node) && Cms.isKeyField(field)) {
			value = dataIndex;
		} else if (nodeType === NodeType.TYPE_MAP_STRING && !Cms.isKeyField(field)) {
			value = data;
		} else {
			value = data[name];
		}
	}
	const description = field.description ? <div className="description">
		<small>{field.description}</small>
	</div> : '';
	let typeHelp = <noscript/>;
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
			input = <textarea className={className} name={name} onChange={handleInputValue} value={value || ''}/>;
			typeHelp =
				<div className="type">
					<a className="blue" target="_blank" href="http://commonmark.org/help/">(markdown)</a>
				</div>;
			break;
		case 'boolean':
			input =
				<div className="checkbox">
					<input className={className} type="checkbox" id={name} name="checked" value={value}
								 onChange={handleInputValue}/>
					<label htmlFor={name}/>
				</div>;
			break;
		case 'array':
			input = <Tags value={value} onChange={handleAddValue}/>;
			break;
		default:
			input = <input autoComplete={"off"} className={className} type="text" name={name} value={value || ''}
										 onChange={handleInputValue}/>;
	}
	return (
		<div className="field">
			<label>
				<span className="name">{displayName} {isKey && <i className="fa fa-key" title="Key field"/>}</span>
				<div className="right-block">
					{typeHelp}
					{
						isDeveloper && <div className="actions">
							<a href="#" onClick={() => dispatch(editField(node, fieldIndex))}>
								<i title="Edit Field" className="fa fa-pencil" aria-hidden="true"/>
							</a>
							{
								Cms.canDeleteFieldAt(node, fieldIndex)
								&&
								<a href="#" onClick={() => dispatch(deleteField(node, fieldIndex))}>
									<i title="Delete Field" className="fa fa-times" aria-hidden="true"/>
								</a>
							}
						</div>
					}
				</div>
			</label>
			{description}
			{input}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		fieldsInError: state.main.fieldsInError,
		isDeveloper: state.preferences.mode === ViewMode.developer
	};
};

export default connect(mapStateToProps)(FieldComponent);
