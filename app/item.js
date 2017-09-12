import React from 'react';
import {Link} from 'react-router-dom';
import Field from './field';
import * as Cms from "./cms";
import {connect} from "react-redux";
import {editField} from "./actions";

const Item = ({node, selection, dispatch}) => {
	const fields = [];
	if (node.model.fields) {
		for (let i = 0; i < node.model.fields.length; i++) {
			fields.push(<Field key={i} node={node} field={node.model.fields[i]} fieldIndex={i} dataIndex={selection.dataIndex}/>);
		}
	}
	return <div>
		<form key="form">
			{
				(fields.length > 0) && <div className="fields">{fields}</div>
			}
			{
				Cms.isItem(node) &&
				<Link key="backBtn" id="backBtn" className="btn cmd" to={'/node/' + selection.treePath}>Back to list</Link>
			}
			{
				Cms.isItem(node) &&
				<a key="addFieldBtn" className="btn cmd" href="#" onClick={() => dispatch(editField(node))}>Add field</a>
			}
		</form>
	</div>;
};

export default connect()(Item);