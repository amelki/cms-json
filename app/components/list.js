import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux'
import {addItem, addChild} from '../actions';
import Row from './row';
import * as Cms from '../cms';
import { NodeType } from "../model";

// Not migrated yet
// Should be done following https://stackoverflow.com/questions/40111314/react-dnd-typescript-support

@DragDropContext(HTML5Backend)
class List extends Component {
	render() {
		const { node, selection } = this.props;
		const rows = [];
		const nodeType = Cms.getNodeType(node);
		switch (nodeType) {
			// case NodeType.TYPE_TREE:
			// 	if (node.model.children) {
			// 		for (let i = 0; i < node.model.children.length; i++) {
			// 			rows.push(<Row key={i} id={i} dataIndex={i} node={node} selection={selection}/>);
			// 		}
			// 	}
			// 	break;
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
		if (rows.length > 0) {
			return <span>
				<table>
					<tbody>
					{rows}
					</tbody>
				</table>
			</span>;
		}
		return <noscript/>;
	}
}

const mapStateToProps = (state) => {
	return {
		router: state.router
	}
};

export default connect(mapStateToProps)(List);
