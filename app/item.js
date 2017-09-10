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
			fields.push(<Field key={i} node={node} field={node.model.fields[i]} index={selection.index}/>);
		}
	}
	return <div>
		<form key="form">
			{
				(fields.length > 0) && <div className="fields">{fields}</div>
			}
			{
				Cms.isItem(node) &&
				<Link key="backBtn" id="backBtn" className="btn" to={'/node/' + selection.treePath}>Back to list</Link>
			}
			{
				Cms.isItem(node) &&
				<a key="addFieldBtn" className="btn" href="#" onClick={() => dispatch(editField(node))}>Add field</a>
			}
		</form>
	</div>;
	// const res = [];
	// if (node.model.fields) {
	// 	const fields = [];
	// 	for (let i = 0; i < node.model.fields.length; i++) {
	// 		fields.push(<Field key={i} node={node} field={node.model.fields[i]} index={selection.index}/>);
	// 	}
	// 	res.push(<form key="form">{fields}</form>);
	// }
	// if (Cms.isItem(node)) {
	// 	res.push(<Link key="backBtn" id="backBtn" className="btn" to={'/node/' + selection.treePath}>Back to list</Link>);
	// 	res.push(<a key="addFieldBtn" className="btn" href="#" onClick={() => dispatch(editField(node))}>Add field</a>);
	// }
	// return <div>{res}</div>;
};

export default connect()(Item);