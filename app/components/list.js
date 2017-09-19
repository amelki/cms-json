import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux'
import {addItem, addChild} from '../actions';
import Row from './row';
import * as Cms from '../cms';
import { NodeType } from "../model";

@DragDropContext(HTML5Backend)
class List extends Component {
	render() {
		const { node, dispatch, selection, router } = this.props;
		const rows = [];
		const nodeType = Cms.getNodeType(node);
		switch (nodeType) {
			case NodeType.TYPE_TREE:
				if (node.model.children) {
					for (let i = 0; i < node.model.children.length; i++) {
						rows.push(<Row key={i} id={i} dataIndex={i} node={node} selection={selection}/>);
					}
				}
				break;
			case NodeType.TYPE_LIST_OBJECT:
				for (let i = 0; i < node.data.length; i++) {
					rows.push(<Row key={i} id={i} dataIndex={i} node={node} selection={selection}/>);
				}
				break;
			case NodeType.TYPE_MAP_OBJECT:
			case NodeType.TYPE_MAP_STRING:
				for (let p in node.data) {
					rows.push(<Row key={p} id={p} dataIndex={p} node={node} selection={selection}/>);
				}
				break;
		}
		return (
			<div>
				<table>
					<tbody>
					{rows}
					</tbody>
				</table>
				{
					(nodeType === NodeType.TYPE_TREE)
						? (
							<span>
								<a id="addBtn" className="btn cmd" onClick={(event) => dispatch(addChild(node, NodeType.TYPE_TREE, router.history))}>Add Node</a>
								<a id="addBtn" className="btn cmd" onClick={(event) => dispatch(addChild(node, NodeType.TYPE_LIST_OBJECT, router.history))}>Add List</a>
								<a id="addBtn" className="btn cmd" onClick={(event) => dispatch(addChild(node, NodeType.TYPE_MAP_STRING, router.history))}>Add String Map</a>
								<a id="addBtn" className="btn cmd" onClick={(event) => dispatch(addChild(node, NodeType.TYPE_MAP_OBJECT, router.history))}>Add Object Map</a>
							</span>
					)
						: <a id="addBtn" className="btn cmd" onClick={(event) => dispatch(addItem(node))}>Add Item</a>
				}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		router: state.router
	}
};

export default connect(mapStateToProps)(List);
