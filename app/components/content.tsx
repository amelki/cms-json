import * as React from "react";
import * as Cms from '../cms';

import List from './list';
import Item from './item';
import FieldEditor from './fieldEditor';
import Confirm from './confirm';
import {connect, Dispatch, DispatchProp} from 'react-redux';
import {Model, Node, NodeType, TreeModel} from "../model";
import Tree from './tree';
import AppState, {EditingFieldState, JsonFile, ViewMode} from "../state";
import {Path} from '../model';
import {addChild, addItem, editField, setJsonFile} from "../actions";
import {ReactElement} from "react";
import {RouterState} from 'react-router-redux';
import {Link} from 'react-router-dom';
import SplitPane from 'react-split-pane';
import {RootSchemaElement} from "../schema";
import JsonPretty from "./pretty";
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

// Bypass typescript import to load Css. See https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10
const styles = require('../main.scss');

interface BaseProps {
	tree: Node<TreeModel>;
	selection: Path;
	node: Node<Model> | null;
	editingField: EditingFieldState | null;
	router: RouterState;
	isDeveloper: boolean,
	isJsonData: boolean
}

interface Props extends BaseProps {
	dispatch: Dispatch<AppState>;
}

const Content: React.SFC<Props> = ({tree, selection, node, editingField, isDeveloper, isJsonData, dispatch, router}) => {
	let right = <noscript/>;
	const buttons = [] as ReactElement<any>[];
	if (node) {
		const itemSelected = (selection && (selection.dataIndex !== -1));
		const nodeType = Cms.getNodeType(node);
		switch (nodeType) {
			case NodeType.TYPE_TREE:
				right =
					<span>
							<Item node={node} selection={selection}/>
							<List node={node} selection={selection}/>
						</span>;
				break;
			case NodeType.TYPE_LIST_OBJECT:
			case NodeType.TYPE_MAP_OBJECT:
			case NodeType.TYPE_MAP_STRING:
				if (itemSelected) {
					right = <Item node={node} selection={selection}/>;
				} else {
					right = <List node={node} selection={selection}/>;
				}
				break;
		}
		if ((nodeType === NodeType.TYPE_TREE || Cms.isItem(node)) && isDeveloper) {
			buttons.push(<a key="addFieldBtn" className="btn cmd" href="#" onClick={() => dispatch(editField(node, -1))}>Add
				field</a>);
		}
		if (Cms.getNodeType(node) === NodeType.TYPE_TREE && isDeveloper) {
			buttons.push(<a id="addBtn" key="addNode" className="btn cmd"
											onClick={(event) => dispatch(addChild(node, NodeType.TYPE_TREE, router.history))}>Add Node</a>);
			buttons.push(<a id="addBtn" key="addList" className="btn cmd"
											onClick={(event) => dispatch(addChild(node, NodeType.TYPE_LIST_OBJECT, router.history))}>Add
				List</a>);
			buttons.push(<a id="addBtn" key="addStringMap" className="btn cmd"
											onClick={(event) => dispatch(addChild(node, NodeType.TYPE_MAP_STRING, router.history))}>Add String
				Map</a>);
			buttons.push(<a id="addBtn" key="addObjectMap" className="btn cmd"
											onClick={(event) => dispatch(addChild(node, NodeType.TYPE_MAP_OBJECT, router.history))}>Add Object
				Map</a>);
		} else if (Cms.isItem(node) && !itemSelected) {
			buttons.push(<a id="addBtn" key="addItem" className="btn cmd" onClick={(event) => dispatch(addItem(node))}>Add
				Item</a>);
		}
		if (Cms.isItem(node) && node.dataIndex !== -1) {
			buttons.push(<Link key="backBtn" id="backBtn" className="btn cmd" to={'/node/' + selection.treePath}>Back to
				list</Link>);
		}


	}
	const contentClass = isDeveloper ? 'developer' : 'author';
	return (
		<div id="content" className={contentClass}>
			<SplitPane split="vertical" minSize={100} defaultSize={200}>
				<div id="left">
					<div className="inner">
						<nav>
							<ul><Tree node={tree} selection={selection} depth={0}/></ul>
						</nav>
					</div>
				</div>
				{
					isDeveloper
						?
						<SplitPane split="vertical" minSize={200} defaultSize={250} primary="second">
							<div id="right">
								{right}
								{node && <div className="buttons">{buttons}</div>}
							</div>
							<div id="json-panel">
								<div id="json-navbar">
									<div className={'nav tab' + (isJsonData ? ' selected' : '')}>
										<a href="#" onClick={() => dispatch(setJsonFile(JsonFile.data))} className="white">Data</a>
									</div>
									<div className={'nav tab' + (!isJsonData ? ' selected' : '')}>
										<a href="#" onClick={() => dispatch(setJsonFile(JsonFile.model))} className="white">Schema</a>
									</div>
								</div>
								{isJsonData
									? <JsonPretty object={tree.data} selection={(node && node.parent) ? node.data : null}/>
									: <JsonPretty object={tree.schema} selection={(node && node.parent) ? node.schema : null}/>
								}
							</div>
						</SplitPane>
						:
						<div id="right">
							{right}
							{node && <div className="buttons">{buttons}</div>}
						</div>

				}

			</SplitPane>
			{editingField && <FieldEditor on={editingField != null}/>}
			<Confirm/>
		</div>
	);
};

const mapStateToProps = (state: AppState): BaseProps => {
	const routerPath = state.router.location.pathname; // /node/header/2
	let selection = {
		fullPath: '',
		treePath: '',
		dataIndex: -1
	};
	if (routerPath.startsWith('/node/')) {
		selection = Cms.treePathAndIndex(state.main.tree, routerPath.substring('/node/'.length));
	}
	const node = (selection.fullPath && selection.fullPath.length > 0)
		? Cms.findNode(state.main.tree, selection.fullPath)
		: state.main.tree;
	return {
		tree: state.main.tree,
		selection: selection,
		node: node,
		router: state.router,
		editingField: state.editingField,
		isDeveloper: state.preferences.mode === ViewMode.developer,
		isJsonData: state.preferences.jsonFile === JsonFile.data
	};
};

export default DragDropContext(HTML5Backend)(connect(mapStateToProps)(Content));
