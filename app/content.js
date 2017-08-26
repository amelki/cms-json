import React from 'react';
import styles from './cms.scss';
import axios from 'axios';
import {Link} from 'react-router-dom';
import Cms from './cms';
import Tree from './tree';
import List from './list';
import Item from './item';
import {LOAD} from './actions';
import {connect} from 'react-redux'

class Content extends React.Component {

	render() {
		let {state} = this.props;
		const selection = (this.props.match.path === '/') ? '' : this.props.match.params[0];
		let node;
		let right = '';
		if (selection && selection.length > 0) {
			node = Cms.findNode(state.model, state.data, selection);
			if (node.model.list) {
				if (Array.isArray(node.data)) {
					right = <List node={node} selection={selection}/>;
				} else {
					let fragments = selection.split('/');
					let parent = fragments.slice(0, fragments.length - 1).join('/');
					right = <Item node={node} parent={parent}/>;
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
							<h1>{state.model.name}</h1>
						</header>
						<Tree model={state.model} selection={'/' + Cms.treePath(selection)}/>
					</div>
				</aside>
				<section id="right">
					{right}
				</section>
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		state: state
	};
}

export default connect(mapStateToProps)(Content);
