import React from 'react';
import {Link} from 'react-router-dom';
import * as Cms from './cms';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {deleteNode} from "./actions";
import {withRouter} from "react-router";

const Tree = ({node, selection, dispatch}) => {
	const all = [];
	const children = Cms.getChildren(node);
	let keyCount = 0;
	children.forEach(child => {
		all.push(<Node key={keyCount++} node={child} path={''} selection={selection} depth={1} dispatch={dispatch}/>);
	});
	return <nav>
		<ul>{all}</ul>
	</nav>;
};

export default connect()(Tree);

Tree.propTypes = {
	node: PropTypes.object.isRequired,
	selection: PropTypes.object.isRequired
};

const generateUUID = () => { // Public Domain/MIT
	let d = new Date().getTime();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
		d += performance.now(); //use high-precision timer if available
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
};

const _Node = ({node, path, selection, depth, dispatch, history}) => {
	const newPath = path + "/" + Cms.slugify(node.model.name);
	const linkClass = (('/' + selection.treePath) === newPath) ? 'selected' : '';
	const prefix = "/node";
	const subList = [];
	const children = Cms.getChildren(node);
	const newDepth = depth + 1;
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		subList.push(<Node key={i} node={child} path={newPath} selection={selection} depth={newDepth} dispatch={dispatch}/>);
	}
	const space = (20 * depth) + 'px';
	let labelContent = [ <span key="name">{node.model.name}</span> ];
	const nodeType = Cms.getNodeType(node);
	switch (nodeType) {
		case Cms.TYPE_LIST_OBJECT:
			labelContent.push(<span key="type" className="node-type">{"\u005b\u005d"}</span>);
			break;
		case Cms.TYPE_MAP_OBJECT:
		case Cms.TYPE_MAP_STRING:
			labelContent.push(<span key="type" className="node-type">{"\u007b\u007d"}</span>);
			break;
	}
	const handleDeleteNode = (event) => {
		event.stopPropagation();
		event.preventDefault();
		dispatch(deleteNode(node, selection, history));
	};
	return (
		<span>
			<li>
				<Link className={linkClass} style={{paddingLeft: space}} to={ prefix + newPath }>
					{labelContent}
					<div className="actions">
						<span><i className="fa fa-pencil"/></span>
						<span onClick={(event) => handleDeleteNode(event)}><i className="fa fa-times"/></span>
					</div>
				</Link>
			</li>
			{subList}
		</span>
	);
};

const Node = withRouter(_Node);

Node.propTypes = {
	node: PropTypes.object.isRequired,
	path: PropTypes.string.isRequired,
	selection: PropTypes.object.isRequired,
	depth: PropTypes.number.isRequired
};
