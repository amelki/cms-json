import React from 'react';
import {Link} from 'react-router-dom';
import * as Cms from './cms';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {deleteNode, editNode} from "./actions";
import {withRouter} from "react-router";
import {Control, Form} from "react-redux-form";

const _Node = ({node, selection, depth, dispatch, history, editingNode}) => {
	const linkClass = (selection.treePath === node.path) ? 'selected' : '';
	const editing = editingNode && editingNode.path === node.path;
	const space = (20 * depth) + 'px';
	const typeLabel = (() => {
		const nodeType = Cms.getNodeType(node);
		switch (nodeType) {
			case Cms.TYPE_LIST_OBJECT:
				return "\u005b\u005d";
			case Cms.TYPE_MAP_OBJECT:
			case Cms.TYPE_MAP_STRING:
				return "\u007b\u007d";
			default:
				return null;
		}
	})();
	const handleDeleteNode = (event) => {
		event.stopPropagation();
		event.preventDefault();
		dispatch(deleteNode(node, selection, history));
	};
	const handleEditNode = (event) => {
		event.stopPropagation();
		event.preventDefault();
		dispatch(editNode(node, selection));
	};
	return (
		<span>
			<li>
				<Link className={linkClass} style={{paddingLeft: space}} to={'/node/' + node.path}>
					{
						editing
							? <Form model={"modelNode"}><Control.text model=".name"/></Form>
							: <span key="name">{node.model.name}</span>
					}
					{
						typeLabel && <span key="type" className="node-type">{typeLabel}</span>
					}
					<div className="actions">
						<span onClick={(event) => handleEditNode(event)}><i className="fa fa-pencil"/></span>
						<span onClick={(event) => handleDeleteNode(event)}><i className="fa fa-times"/></span>
					</div>
				</Link>
			</li>
			{
				Cms.getChildren(node).map(child => <Node key={child.path}
																								 node={child}
																								 selection={selection}
																								 depth={depth + 1}/>)
			}
			</span>
	);
};

const mapStateToProps = (state) => {
	return {
		form: state.forms.field.$form,
		editingNode: state.editingNode
	};
};

const Node = withRouter(connect(mapStateToProps)(_Node));

export default Node;

Node.propTypes = {
	node: PropTypes.object.isRequired,
	selection: PropTypes.object.isRequired,
	depth: PropTypes.number.isRequired
};
