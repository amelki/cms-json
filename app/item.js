import React from 'react';
import { Link } from 'react-router-dom';
import Field from './field';

export default Item = ({ parent, node }) =>  {
		const fields = [];
		for (let i = 0; i < node.model.fields.length; i++) {
			fields.push(<Field key={i} node={node} field={node.model.fields[i]}/>);
		}
		const divs = [ <form key="form">{fields}</form> ];
		if (parent) {
			divs.push(<Link key="backBtn" id="backBtn" className="btn" to={ '/node/' + parent }>Back to list</Link>);
		}
 		return <div>{divs}</div>;
};
