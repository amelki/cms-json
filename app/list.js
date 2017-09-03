import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux'
import { addItem, addChildAndNavigate } from './actions';
import Row from './row';
import Cms from './cms';

@DragDropContext(HTML5Backend)
class List extends Component {
	render() {
		const { node, dispatch, selection, router } = this.props;
		const rows = [];
		const nodeType = Cms.nodeType(node);
		switch (nodeType) {
			case Cms.TYPE_TREE:
				if (node.model.children) {
					for (let i = 0; i < node.model.children.length; i++) {
						rows.push(<Row key={i} id={i} index={i} node={node} selection={selection}/>);
					}
				}
				break;
			case Cms.TYPE_LIST:
				for (let i = 0; i < node.data.length; i++) {
					rows.push(<Row key={i} id={i} index={i} node={node} selection={selection}/>);
				}
				break;
			case Cms.TYPE_MAP:
				for (let p in node.data) {
					rows.push(<Row key={p} id={p} index={p} node={node} selection={selection}/>);
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
					(nodeType === Cms.TYPE_TREE)
						? (
							<span>
								<a id="addBtn" className="btn" onClick={(event) => dispatch(addChildAndNavigate(node, Cms.TYPE_TREE, router.history))}>Add Node</a>
								<a id="addBtn" className="btn" onClick={(event) => dispatch(addChildAndNavigate(node, Cms.TYPE_LIST, router.history))}>Add List</a>
								<a id="addBtn" className="btn" onClick={(event) => dispatch(addChildAndNavigate(node, Cms.TYPE_MAP, router.history))}>Add Map</a>
							</span>
					)
						: <a id="addBtn" className="btn" onClick={(event) => dispatch(addItem(node))}>Add Item</a>
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
