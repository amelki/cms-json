import React from 'react';
import {Link} from 'react-router-dom';
import Field from './field';
import * as Cms from "./cms";

const Item = ({node, selection}) => {
	const res = [];
	if (node.model.fields) {
		const fields = [];
		for (let i = 0; i < node.model.fields.length; i++) {
			fields.push(<Field key={i} node={node} field={node.model.fields[i]} index={selection.index}/>);
		}
		res.push(<form key="form">{fields}</form>);
	}
	if (Cms.isItem(node)) {
		res.push(<Link key="backBtn" id="backBtn" className="btn" to={ '/node/' + selection.treePath }>Back to list</Link>);
	}
	return <div>{res}</div>;
};

export default Item;