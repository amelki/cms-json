import React from 'react';
import { Link } from 'react-router-dom';
import Field from './field';

const Item = ({ node, selection }) =>  {
		const fields = [];
		for (let i = 0; i < node.model.fields.length; i++) {
			fields.push(<Field key={i} node={node} field={node.model.fields[i]}/>);
		}
		const divs = [ <form key="form">{fields}</form> ];
		if (selection && selection.index >= 0) {
			divs.push(<Link key="backBtn" id="backBtn" className="btn" to={ '/node/' + selection.treePath }>Back to list</Link>);
		}
 		return <div>{divs}</div>;
};

export default Item;