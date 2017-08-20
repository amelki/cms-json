import React, { Component } from 'react';
import styles from './cms.scss';
import Cms from './cms';
import { Link } from 'react-router-dom';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragSource, DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

@DragDropContext(HTML5Backend)
export default class List extends Component {
	constructor(props) {
		super(props);
		this.addItem = this.addItem.bind(this);
		this.moveItem = this.moveItem.bind(this);
	}
	addItem() {
		this.props.addItem(this.props.node);
	}
	moveItem(dragIndex, hoverIndex) {
		this.props.moveItem(this.props.node, dragIndex, hoverIndex);
	}
	render() {
		const node = this.props.node;
		const rows = [];
		for (let i = 0; i < node.data.length; i++) {
			rows.push(<ListRow key={i} id={i} index={i} node={node} moveItem={this.moveItem} deleteItem={this.props.deleteItem} selection={this.props.selection}/>);
		}
		return (
			<div>
				<table>
					<tbody>
					{rows}
					</tbody>
				</table>
				<a id="addBtn" className="btn" onClick={this.addItem}>Add Item</a>
			</div>
		);
	}
}

const style = {
	border: '1px dashed gray',
	padding: '0.5rem 1rem',
	marginBottom: '.5rem',
	backgroundColor: 'white',
	cursor: 'move',
};

const rowSource = {
	beginDrag(props) {
		return {
			id: props.id,
			index: props.index,
		};
	},
};

const rowTarget = {
	hover(props, monitor, component) {
		const dragIndex = monitor.getItem().index;
		const hoverIndex = props.index;

		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return;
		}

		// Determine rectangle on screen
		const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

		// Get vertical middle
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

		// Determine mouse position
		const clientOffset = monitor.getClientOffset();

		// Get pixels to the top
		const hoverClientY = clientOffset.y - hoverBoundingRect.top;

		// Only perform the move when the mouse has crossed half of the items height
		// When dragging downwards, only move when the cursor is below 50%
		// When dragging upwards, only move when the cursor is above 50%

		// Dragging downwards
		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return;
		}

		// Dragging upwards
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return;
		}

		// Time to actually perform the action
		props.moveItem(dragIndex, hoverIndex);

		// Note: we're mutating the monitor item here!
		// Generally it's better to avoid mutations,
		// but it's good here for the sake of performance
		// to avoid expensive index searches.
		monitor.getItem().index = hoverIndex;
	},
};

@DropTarget('row', rowTarget, connect => ({
	connectDropTarget: connect.dropTarget(),
}))
@DragSource('row', rowSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
}))
class ListRow extends Component {
	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
		connectDropTarget: PropTypes.func.isRequired,
		index: PropTypes.number.isRequired,
		isDragging: PropTypes.bool.isRequired,
		id: PropTypes.any.isRequired,
		moveItem: PropTypes.func.isRequired
	};
	constructor(props) {
		super(props);
		this.deleteItem = this.deleteItem.bind(this);
	}
	deleteItem() {
		this.props.deleteItem(this.props.node, this.props.index);
	}
	render() {
		const { node, index, isDragging, connectDragSource, connectDropTarget } = this.props;
		const label = node.data[index][Cms.defaultFieldName(node.model)];
		const opacity = isDragging ? 0 : 1;
		return connectDragSource(connectDropTarget(
			<tr style={{ ...style, opacity }}>
				<td>
					<Link to={ '/node/' + this.props.selection + '/' + index }>{label}</Link>
				</td>
				<td className="delete">
					<a href="#" onClick={this.deleteItem}>×</a>
				</td>
			</tr>
		))
	}
}
