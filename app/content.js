import React from 'react';
import * as Cms from './cms';

import List from './list';
import Item from './item';
import FieldEditor from './fieldEditor';
import Confirm from './components/confirm.tsx';
import { connect } from 'react-redux';
import { NodeType } from "./model";
import Node from './components/tree';
//import styles from './main.scss';
// Bypass typescript import to load Css. See https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10
const styles = require('./main.scss');

class Content extends React.Component {

	render() {
		let { tree, selection, node, editingField } = this.props;
		let right = '';
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
							<ul><Node node={tree} selection={selection} depth={0}/></ul>
						</nav>
					</div>
				</aside>
				<section id="right">
					{right}
				</section>
				{editingField && <FieldEditor on={editingField}/>}
				<Confirm/>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
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
