import React, {ReactElement} from 'react';
import {Link} from 'react-router-dom';
import Field from './field';
import * as Cms from "../cms";
import {connect, Dispatch} from "react-redux";
import {editField} from "../actions";
import {Model, Node, Path} from "../model";

interface Props {
	node: Node<Model>;
	selection: Path,
	dispatch: Dispatch<any>
}

const Item: React.SFC<Props> = ({node, selection, dispatch}) => {
	const fields = [] as ReactElement<any>[];
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
		</form>
	</div>;
};

export default connect()(Item);