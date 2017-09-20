import * as Cms from './cms';
import * as Markdown from './md';
import * as Actions from './actions';
import {Model, Node, NodeType, TreeModel} from "./model";
import {cloneMain, MainState, makeMain} from "./state";

const apply = (action, state: MainState, node: Node<Model>) => {
	const parentNode = node.parent!;
	switch (action.type) {
		case Actions.ADD_ITEM:
			Cms.addItem(node, "New " + node.model.name);
			break;
		case Actions.ADD_CHILD:
			const newNode = Cms.addNode(node as Node<TreeModel>, "New " + action.childType, action.childType);
			state.path = newNode.path;
			break;
		case Actions.DELETE_NODE:
			if (action.selection.treePath && action.selection.treePath.startsWith(node.path)) {
				state.path = (node.parent && node.parent.path) ? node.parent.path : '';
			}
			Cms.deleteNode(node);
			break;
		case Actions.DELETE_ITEM:
			if (Cms.getNodeType(node) === NodeType.TYPE_LIST_OBJECT) {
				node.data.splice(action.dataIndex, 1);
			} else {
				delete node.data[action.dataIndex];
			}
			break;
		case Actions.MOVE_ITEM:
			const sourceItem = node.data[action.source];
			const {source, target} = action;
			node.data[source] = node.data[target];
			node.data[target] = sourceItem;
			break;
		case Actions.INPUT_VALUE:
			// TODO move to Cms
			const {event, field} = action;
			let value = event.target.value;
			switch (field.type) {
				case 'markdown':
					value = Markdown.html(value);
					break;
				case 'boolean':
					// Do not try to grab the state from the checkbox itself (event.target.checked has a surprising behavior...)
					value = !node.data[Cms.fieldName(field)];
					break;
			}
			if (Cms.isMapType(node) && Cms.isKeyField(field)) {
				if (value && value.length > 0 && !parentNode!.data[value]) {
					delete parentNode.data[node.dataIndex];
					parentNode.data[value] = node.data;
					// Request navigation to the new path
					state.path = parentNode.path + '/' + value;
					delete state.fieldsInError[node.path];
				} else {
					state.fieldsInError.set(node.path, { name: field.name, value: value });
				}
			} else {
				node.data[Cms.fieldName(field)] = value;
			}
			break;
		case Actions.SUBMIT_FIELD:
			Cms.updateFieldAt(node, action.fieldIndex, action.field);
			break;
		case Actions.SUBMIT_NODE:
			Cms.renameNode(node, action.model.name);
			state.path = node.path;
			break;
		case Actions.DELETE_FIELD:
			Cms.deleteFieldAt(node, action.fieldIndex);
			break;
		case Actions.ADD_VALUE:
			node.data[Cms.fieldName(action.fieldIndex)] = action.value;
			break;
	}
};

export const editingFieldReducer = (state = {fieldIndex: -1, path: ''}, action) => {
	switch (action.type) {
		case Actions.EDIT_FIELD:
			return {
				path: action.node.path,
				fieldIndex: action.fieldIndex
			};
		case Actions.SUBMIT_FIELD:
		case Actions.CANCEL_EDIT_FIELD:
			return null;
		default:
			return state;
	}
};

export const editingNodeReducer = (state = { path: '' }, action) => {
	switch (action.type) {
		case Actions.EDIT_NODE:
			return {
				path: action.node.path
			};
		case Actions.SUBMIT_NODE:
		case Actions.CANCEL_EDIT_NODE:
			return null;
		default:
			return state;
	}
};

export const confirmReducer = (state = null, action) => {
	switch (action.type) {
		case Actions.SHOW_CONFIRM:
			return {
				ok: action.ok,
				title: action.title,
				body: action.body
			};
		case Actions.CANCEL_CONFIRM:
		case Actions.DELETE_FIELD:
		case Actions.DELETE_NODE:
			return null;
		default:
			return state;
	}
};

export const mainReducer = (state : MainState = makeMain(), action) : MainState => {
	switch (action.type) {
		case Actions.ADD_CHILD:
		case Actions.ADD_ITEM:
		case Actions.DELETE_ITEM:
		case Actions.MOVE_ITEM:
		case Actions.INPUT_VALUE:
		case Actions.ADD_VALUE:
		case Actions.SUBMIT_NODE:
		case Actions.SUBMIT_FIELD:
		case Actions.DELETE_FIELD:
		case Actions.DELETE_NODE:
			// For now, use JSON parse/stringify.
			// If performance becomes an issue, we could write our own custom deep copy
			// See https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
			const newState = cloneMain(state);
			newState.stale = true;
			newState.busy = false;
			const newNode = Cms.findNode(newState.tree, action.node.path);
			apply(action, newState, newNode);
			return newState;
		case Actions.CLEAR_FIELD_ERRORS:
			return {
				...state,
				fieldsInError: new Map()
			};
		case Actions.LOAD_START:
		case Actions.SAVE_START:
			return {
				...state,
				busy: true
			};
		case Actions.LOAD_END:
			return makeMain(action.model, action.data);
		case Actions.SAVE_END:
			return {
				...state,
				stale: false,
				busy: false
			};
		case Actions.LOAD_ERROR:
			return {
				...state,
				busy: false
			};
		case Actions.RESET_NAVIGATE_TO:
			return {
				...state,
				path: null
			};
		default:
			return state;
	}
};

export const messageReducer = (state = { text: '', level: '' }, action) => {
	switch (action.type) {
		case Actions.LOG_ERROR:
			return {
				text: action.message,
				level: 'error'
			};
		case Actions.LOG_INFO:
			return {
				text: action.message,
				level: 'info'
			};
		default:
			return state;
	}
};

export const navigationReducer = (state = { latestNode: '' }, action) => {
	switch (action.type) {
		case Actions.ON_NAVIGATE:
			if (action.current.startsWith('/node/')) {
				// We were on a node, and quit the tree (eg: /json). We save the latestNode
				return {
					latestNode: action.current.substring('/node/'.length)
				}
			}
			return state;
		case Actions.LOAD_END:
			return { latestNode: '' };
		default:
			return state;
	}
};