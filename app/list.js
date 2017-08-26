import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux'
import { addItem } from './actions';
import Row from './row';

@DragDropContext(HTML5Backend)
class List extends Component {
	render() {
		const { node, selection, dispatch } = this.props;
		const rows = [];
		for (let i = 0; i < node.data.length; i++) {
			rows.push(<Row key={i} id={i} index={i} node={node} selection={selection}/>);
		}
		return (
			<div>
				<table>
					<tbody>
					{rows}
					</tbody>
				</table>
				<a id="addBtn" className="btn" onClick={(event) => dispatch(addItem(node))}>Add Item</a>
			</div>
		);
	}
}

export default connect()(List);
