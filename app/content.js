import React from 'react';
import Cms from './cms';
import Tree from './tree';
import List from './list';
import Item from './item';
import {connect} from 'react-redux';
import styles from './cms.scss';

class Content extends React.Component {

	render() {
		let { model, selection, node } = this.props;
		let right = '';
		if (node) {
			if (node.model.list) {
				if (Array.isArray(node.data)) {
					right = <List node={node} selection={selection}/>;
				} else {
					right = <Item node={node} selection={selection}/>;
				}
			} else if (!node.model.children) {
				right = <Item node={node}/>
			}
		}
		return (
			<div id="content">
				<aside id="left">
					<div className="inner">
						<header>
							<h1>{model.name}</h1>
						</header>
						<Tree model={model} selection={ selection }/>
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
		selection = Cms.treePathAndIndex(routerPath.substring('/node/'.length));
	}
	const node = (selection.fullPath && selection.fullPath.length > 0)
		? Cms.findNode(state.main.model, state.main.data, selection.fullPath)
		: null;
	return {
		model: state.main.model,
		data: state.main.data,
		selection: selection,
		node: node
	};
};

export default connect(mapStateToProps)(Content);
