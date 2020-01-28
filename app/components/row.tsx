import React, { Component } from 'react';
import * as Cms from '../cms';
import { Link } from 'react-router-dom';
import { findDOMNode } from 'react-dom';
import {connect} from "react-redux";
import {Dispatch} from 'redux';
import { deleteItem, moveItem } from '../actions';
import {Model, Node, NodeType, Path, TreeModel} from "../model";
import {
	ConnectDragSource,
	DragSource,
	DragSourceSpec,
	DragSourceConnector,
	DragSourceMonitor,
	DropTarget,
	DropTargetSpec } from 'react-dnd';

// Not migrated yet
// Should be done following https://stackoverflow.com/questions/40111314/react-dnd-typescript-support


let rowSourceSpec: DragSourceSpec<RowProps, {}> = {
	beginDrag: (props: RowProps) => ({
//		id: props.id,
		index: props.dataIndex,
	}),
};

// Collect: Put drag state into props
let rowSourceCollector = (connect: DragSourceConnector, monitor: DragSourceMonitor) => {
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	}
};

const isTargeted = (props, monitor, component) => {
	const dragIndex = monitor.getItem().index;
	const hoverIndex = props.dataIndex;
	// Don't replace items with themselves
	if (dragIndex === hoverIndex) {
		return false;
	}
	// Determine rectangle on screen
    const domNode = findDOMNode(component);
	if (domNode != null) {
        const hoverBoundingRect = (domNode as any).getBoundingClientRect();
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
            return false;
        }
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
            return false;
        }
    }
	return true;
};

const rowTarget: DropTargetSpec<RowProps> = {
	drop(props, monitor, component) {
		const dragIndex = monitor.getItem().index;
		const hoverIndex = props.dataIndex;

		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return;
		}

		// Determine rectangle on screen
        const domNode = findDOMNode(component);
		if (domNode != null) {
            const hoverBoundingRect = (domNode as any).getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            if (clientOffset != null && hoverBoundingRect != null) {
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
            }
        }
	},
};

interface RowProps {
	node: Node<Model>;
	dataIndex:  number | string;
	isDragging?: boolean;
	connectDragSource?: ConnectDragSource;
	connectDropTarget?: any;
	selection: Path;
	dispatch: Dispatch<any>;
	highlight: boolean;
}

export const ItemTypes = {
	ROW: 'row'
};


@DropTarget(ItemTypes.ROW, rowTarget, connect => ({
	connectDropTarget: connect.dropTarget(),
}))
@DragSource(ItemTypes.ROW, rowSourceSpec, rowSourceCollector)
class Row extends React.Component<RowProps, {}> {
	render(): JSX.Element | null {
		const { node, dataIndex, isDragging, connectDragSource, connectDropTarget, selection, dispatch, highlight = false } = this.props;
		let label, dest;
		const nodeType = Cms.getNodeType(node);
		switch (nodeType) {
			case NodeType.TYPE_TREE:
				if ((node.model as TreeModel).children) {
					label = (node.model as TreeModel).children[dataIndex].name;
					dest = '/node/' + selection.treePath + '/' + Cms.slugify(label);
				}
				break;
			case NodeType.TYPE_LIST_OBJECT:
				label = node.data[dataIndex][Cms.defaultFieldName(node.model)];
				dest = '/node/' + selection.treePath + '/' + dataIndex;
				break;
			case NodeType.TYPE_MAP_OBJECT:
			case NodeType.TYPE_MAP_STRING:
				label = dataIndex;
				dest = '/node/' + selection.treePath + '/' + dataIndex;
				break;
		}
		const nodeChildren = (NodeType.TYPE_TREE == nodeType);
		const opacity = isDragging ? 0.2 : 1;
		const backgroundColor = highlight ? 'red' : '';
		if (connectDropTarget && connectDragSource) {
            return connectDragSource(connectDropTarget(
                <tr style={{opacity, backgroundColor}}>
                    <td>
                        <Link to={dest}>{label}</Link>
                    </td>
                    {
                        !nodeChildren &&
                        <td className="delete">
                            <a href="#" onClick={() => dispatch(deleteItem(node, dataIndex))}>×</a>
                        </td>
                    }
                </tr>
            ))
        } else {
			return <span>Error: connectDropTarget or connectDragSource is undefined</span>
		}
	}
}

//const mapDispatchToProps = dispatch => bindActionCreators({ deleteItem }, dispatch);

export default connect()(Row);
