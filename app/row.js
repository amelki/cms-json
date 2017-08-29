import React, { Component } from 'react';
import Cms from './cms';
import { Link } from 'react-router-dom';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux'
import { deleteItem, moveItem } from './actions';
import { bindActionCreators } from 'redux'

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
		props.dispatch(moveItem(props.node, dragIndex, hoverIndex));

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
class Row extends Component {
	render() {
		const { node, index, isDragging, connectDragSource, connectDropTarget, selection, dispatch } = this.props;
		const label = node.data[index][Cms.defaultFieldName(node.model)];
		const opacity = isDragging ? 0 : 1;
		return connectDragSource(connectDropTarget(
			<tr style={{ opacity }}>
				<td>
					<Link to={ '/node/' + selection.treePath + '/' + index }>{label}</Link>
				</td>
				<td className="delete">
					<a href="#" onClick={() => dispatch(deleteItem(node, index))}>×</a>
				</td>
			</tr>
		))
	}
}

//const mapDispatchToProps = dispatch => bindActionCreators({ deleteItem }, dispatch);

export default connect()(Row);
