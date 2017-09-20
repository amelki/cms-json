import * as React from "react";
import * as Cms from '../cms';

import List from './list';
import Item from './item';
import FieldEditor from './fieldEditor';
import Confirm from './confirm';
import {connect} from 'react-redux';
import {Model, Node, NodeType, TreeModel} from "../model";
import Tree from './tree';
import AppState, { EditingFieldState } from "../state";
import {Path} from '../model';
// Bypass typescript import to load Css. See https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10
const styles = require('../main.scss');

interface Props {
	tree: Node<TreeModel>;
	selection: Path;
	node: Node<Model> | null;
	editingField: EditingFieldState | null;
}

const Content: React.SFC<Props> = ({tree, selection, node, editingField}) => {
	let right = <noscript/>;
	if (node) {
		const nodeType = Cms.getNodeType(node);
		switch (nodeType) {
			case NodeType.TYPE_TREE:
				right =
					<span>
							<Item node={node} selection={selection}/>
							<List node={node} selection={selection}/>
						</span>;
				break;
			case NodeType.TYPE_LIST_OBJECT:
			case NodeType.TYPE_MAP_OBJECT:
			case NodeType.TYPE_MAP_STRING:
				if (selection && (selection.dataIndex !== -1)) {
					right = <Item node={node} selection={selection}/>;
				} else {
					right = <List node={node} selection={selection}/>;
				}
				break;
		}
	}
	return (
		<div id="content">
			<aside id="left">
				<div className="inner">
					<nav>
						<ul><Tree node={tree} selection={selection} depth={0}/></ul>
					</nav>
				</div>
			</aside>
			<section id="right">
				{right}
			</section>
			{ editingField && <FieldEditor on={editingField != null}/>}
			<Confirm/>
		</div>
	);
};

const mapStateToProps = (state : AppState) : Props => {
	const routerPath = state.router.location.pathname; // /node/header/2
	let selection = {
		fullPath: '',
		treePath: '',
		dataIndex: -1
	};
	if (routerPath.startsWith('/node/')) {
		selection = Cms.treePathAndIndex(state.main.tree, routerPath.substring('/node/'.length));
	}
	const node = (selection.fullPath && selection.fullPath.length > 0)
		? Cms.findNode(state.main.tree, selection.fullPath)
		: null;
	return {
		tree: state.main.tree,
		selection: selection,
		node: node,
		editingField: state.editingField
	};
};

export default connect(mapStateToProps)(Content);
