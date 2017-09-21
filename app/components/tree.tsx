import * as React from "react";
import {Link} from 'react-router-dom';
import * as Cms from '../cms';
import {connect, Dispatch} from "react-redux";
import {cancelEditNode, deleteNode, editNode, submitNode} from "../actions";
import {withRouter} from "react-router";
import {Control, Form} from "react-redux-form";
import {NodeType, Model, TreeModel, Node} from '../model';
import {Path} from '../model';
import {Action} from "redux";
import AppState from "../state";

interface Props {
	node: Node<Model>;
	selection: Path;
	depth: number;
	history: object;
	editingNode: any;
	modelNodeFormModel: any;
	dispatch: Dispatch<any>;
}

const _Tree: React.SFC<Props> = ({node, selection, depth, dispatch, history, editingNode, modelNodeFormModel}) => {
	const linkClass = (selection.treePath === node.path) ? 'selected' : '';
	const editing = editingNode && editingNode.path === node.path;
	const space = (depth === 0) ? '20px' : ((20 * depth) + 'px');
	const typeLabel = (() => {
		const nodeType = Cms.getNodeType(node);
		switch (nodeType) {
			case NodeType.TYPE_LIST_OBJECT:
				return "\u005b\u005d";
			case NodeType.TYPE_MAP_OBJECT:
			case NodeType.TYPE_MAP_STRING:
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
		dispatch(editNode(node));
	};
	const className = (modelNodeFormModel && !modelNodeFormModel.name.valid)? 'error' : '';
	return (
		<span>
			<li className={depth === 0 ? 'root' : ''}>
				<Link className={linkClass} style={{paddingLeft: space}} to={'/node/' + node.path}>
					{
						editing
							?
							<Form model={"modelNode"} onSubmit={(values) => dispatch(submitNode(node, values))}>
								<Control.text model=".name"
															updateOn="change"
															className={className}
															autoFocus
															autoComplete="off"
															validators={{name: (val) => val && val.length}}
															validateOn="change"
															onFocus={event => (event.target as HTMLInputElement).select()}
															onKeyDown={(e) => (e.keyCode === 27 ? dispatch(cancelEditNode()) : '')}
															onBlur={event => dispatch(cancelEditNode())}
								/>
							</Form>
							:
							<span key="name">{node.model.name}</span>
					}
					{
						!editing && typeLabel && <span key="type" className="node-type">{typeLabel}</span>
					}
					{
						!editing &&
						<div className="actions">
							<span onClick={(event) => handleEditNode(event)}><i className="fa fa-pencil"/></span>
							{depth > 0 && <span onClick={(event) => handleDeleteNode(event)}><i className="fa fa-times"/></span>}
						</div>
					}
				</Link>
			</li>
			{depth === 0 && <hr/>}
			{
				Cms.getNodeType(node) === NodeType.TYPE_TREE
				&& Cms.getChildren(node as Node<TreeModel>).map(child => <Tree key={child.path}
																																			 node={child}
																																			 selection={selection}
																																			 depth={depth + 1}/>)
			}
			</span>
	);
};

const mapStateToProps = (state : AppState) => {
	return {
		modelNodeFormModel: state.forms.modelNode,
		editingNode: state.editingNode
	};
};

const Tree = withRouter(connect(mapStateToProps)(_Tree));

export default Tree;
