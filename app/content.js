import React from 'react';
import * as Cms from './cms';
import Tree from './tree';
import List from './list';
import Item from './item';
import { connect } from 'react-redux';
import styles from './main.scss';

class Content extends React.Component {

	render() {
		let { tree, selection, node } = this.props;
		let right = '';
		if (node) {
			const nodeType = Cms.nodeType(node);
			switch (nodeType) {
				case Cms.TYPE_TREE:
					right =
						<span>
							<Item node={node} selection={selection}/>
							<List node={node} selection={selection}/>
						</span>;
					break;
				case Cms.TYPE_LIST:
				case Cms.TYPE_MAP:
					if (selection && (selection.index != -1)) {
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
						<header>
							<h1>{tree.model.name}</h1>
						</header>
						<Tree model={tree.model} selection={ selection }/>
					</div>
				</aside>
				<section id="right">
					{right}
				</section>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	const routerPath = state.router.location.pathname; // /node/header/2
	let selection = {
		fullPath: '',
		treePath: '',
		index: -1
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
		node: node
	};
};

export default connect(mapStateToProps)(Content);
