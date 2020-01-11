import React, { Component } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect, Dispatch} from 'react-redux'
import {addItem, addChild} from '../actions';
import Row from './row';
import * as Cms from '../cms';
import {Model, Node, NodeType, Path} from "../model";
import AppState from "../state";
import { RouterState } from 'react-router-redux';

// Not migrated yet
// Should be done following https://stackoverflow.com/questions/40111314/react-dnd-typescript-support

interface StateProps {
	router: RouterState
}

interface Props extends StateProps {
	node: Node<Model>;
	selection: Path,
	dispatch: Dispatch<any>
}


//@DragDropContext(HTML5Backend)
const List: React.SFC<Props> = ({node, selection, dispatch}) => {
//class List extends React.Component<Props, {}> {
		const rows: JSX.Element[] = [];
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
					rows.push(<Row key={i} dataIndex={i} node={node} selection={selection} highlight={false}/>);
				}
				break;
			case NodeType.TYPE_MAP_OBJECT:
			case NodeType.TYPE_MAP_STRING:
				for (let p in node.data) {
					rows.push(<Row key={p} dataIndex={p} node={node} selection={selection} highlight={false}/>);
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
};

const mapStateToProps = (state: AppState): StateProps => {
	return {
		router: state.router
	}
};

export default connect(mapStateToProps)(List);
