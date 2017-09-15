import React from 'react';
import * as Cms from './cms';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Node from './node';

const Tree = ({node, selection}) =>
	<nav>
		<ul>
			{
				<Node node={node} selection={selection} depth={0}/>
//				Cms.getChildren(node).map(child => <Node key={child.path} node={child} selection={selection} depth={1}/>)
			}
		</ul>
	</nav>;

export default connect()(Tree);

Tree.propTypes = {
	node: PropTypes.object.isRequired,
	selection: PropTypes.object.isRequired
};
