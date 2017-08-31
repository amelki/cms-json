import React from 'react';
import Cms from './cms';
import md from './md';
import Tags from "./tags";
import { connect } from 'react-redux'
import { inputValue, addValue } from './actions';

class Field extends React.Component {
	render() {
		const { field, node, dispatch } = this.props;
		const data = node.data;
		const name = Cms.fieldName(field);
		const displayName = Cms.fieldDisplayName(field);
		const value = data[name];
		const description = field.description ? <div><small>{field.description}</small></div> : '';
		let typeHelp = field.type
			? <div className="type">
				({field.type})
			</div>
			: '';
		let input;
		let className = field.className ? field.className : '';
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
				input = <input className={className} type="text" name={name} value={value || ''} onChange={handleInputValue}/>;
		}
		return (
			<div className="field">
				<strong>
					{displayName}
					{typeHelp}
				</strong>
				{description}
				{input}
			</div>
		);
	}
}

export default connect()(Field);
