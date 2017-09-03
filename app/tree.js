import React from 'react';
import {Link} from 'react-router-dom';
import * as Cms from './cms';
import PropTypes from 'prop-types';

const Tree = ({model, selection}) => {
	const all = [];
	if (model.children && model.children.length > 0) {
		for (let i = 0; i < model.children.length; i++) {
			const child = model.children[i];
			all.push(<Node key={i} node={child} path={''} selection={selection} depth={1}/>);
		}
		return <nav>
			<ul>{all}</ul>
		</nav>;
	}
	return <span/>;
};

export default Tree;

Tree.propTypes = {
	model: PropTypes.object.isRequired,
	selection: PropTypes.object.isRequired
};

export const Node = ({node, path, selection, depth}) => {
	const newPath = path + "/" + Cms.slugify(node.name);
	const linkClass = (('/' + selection.treePath) === newPath) ? 'selected' : '';
	const prefix = "/node";
	let subList = "";
	if (node.children && node.children.length > 0) {
		const children = [];
		const newDepth = depth + 1;
		for (let i = 0; i < node.children.length; i++) {
			const child = node.children[i];
			children.push(<Node key={i} node={child} path={newPath} selection={selection} depth={newDepth}/>);
		}
		subList = children;
	}
	const space = (20 * depth) + 'px';
	let labelContent = [ <span key="name">{node.name}</span> ];
	const nodeType = Cms.nodeType({ model: node });
	switch (nodeType) {
		case Cms.TYPE_LIST:
			labelContent.push(<span key="type" className="node-type">{"\u005b\u005d"}</span>);
			break;
		case Cms.TYPE_MAP:
			labelContent.push(<span key="type" className="node-type">{"\u007b\u007d"}</span>);
			break;
	}
	return (
		<span>
			<li>
				<Link className={linkClass} style={{paddingLeft: space}} to={ prefix + newPath }>{labelContent}</Link>
			</li>
			{subList}
		</span>
	);
};

Node.propTypes = {
	node: PropTypes.object.isRequired,
	path: PropTypes.string.isRequired,
	selection: PropTypes.object.isRequired,
	depth: PropTypes.number.isRequired
};

