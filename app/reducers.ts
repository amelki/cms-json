import * as Cms from './cms';
import * as Markdown from './md';
import {Model, Node, NodeType, TreeModel} from "./model";
import {
	cloneMain, ConfirmState, EditingFieldState, EditingNodeState, JsonFile, MainState, makeMain, MessageState,
	NavigationState, PreferencesState, ViewMode
} from "./state";
import {
	LogInfoAction, LogErrorAction, ActionTypes, DefaultAction, NavigateAction, LoadEndAction,
	AddChildAction, AddItemAction, DeleteItemAction, MoveItemAction, InputValueAction, AddValueAction, SubmitNodeAction,
	SubmitFieldAction, DeleteFieldAction, DeleteNodeAction, ClearFieldErrorsAction, LoadStartAction, SaveStartAction,
	SaveEndAction, LoadErrorAction, ResetNavigateToAction, ShowConfirmAction, CancelConfirmAction, EditNodeAction,
	CancelEditNodeAction, EditFieldAction, CancelEditFieldAction, SetViewModeAction, SetJsonFileAction
} from "./actions";

const apply = (action: TreeAction, state: MainState, node: Node<Model>) => {
	const parentNode = node.parent!;
	switch (action.type) {
		case ActionTypes.ADD_ITEM:
			Cms.addItem(node, "New " + node.model.name);
			state.dataStale = true;
			break;
		case ActionTypes.ADD_CHILD:
			const newNode = Cms.addNode(node as Node<TreeModel>, "New " + action.childType, action.childType);
			if (newNode.path.startsWith('/')) {
				newNode.path = newNode.path.substr(1);
			}
			state.path = newNode.path;
			state.schemaStale = true;
			state.dataStale = true;
			break;
		case ActionTypes.DELETE_NODE:
			if (action.selection.treePath && action.selection.treePath.startsWith(node.path)) {
				state.path = (node.parent && node.parent.path) ? node.parent.path : '';
			}
			Cms.deleteNode(node);
			state.schemaStale = true;
			state.dataStale = true;
			break;
		case ActionTypes.DELETE_ITEM:
			if (Cms.getNodeType(node) === NodeType.TYPE_LIST_OBJECT) {
				node.data.splice(action.dataIndex, 1);
			} else {
				delete node.data[action.dataIndex];
			}
			state.dataStale = true;
			break;
		case ActionTypes.MOVE_ITEM:
			const sourceItem = node.data[action.source];
			const {source, target} = action;
			node.data[source] = node.data[target];
			node.data[target] = sourceItem;
			state.dataStale = true;
			break;
		case ActionTypes.INPUT_VALUE:
			// TODO move to Cms
			const {event, field} = action;
			let value = event.target.value;
			switch (field.type) {
				// case 'markdown':
				// 	value = Markdown.html(value);
				// 	break;
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
					state.fieldsInError.set(node.path, {name: field.name, value: value});
				}
			} else {
				node.data[Cms.fieldName(field)] = value;
			}
			state.dataStale = true;
			break;
		case ActionTypes.SUBMIT_FIELD:
			Cms.updateFieldAt(node, action.fieldIndex, action.field);
			state.dataStale = true;
			state.schemaStale = true;
			break;
		case ActionTypes.SUBMIT_NODE:
			Cms.renameNode(node, action.model.name);
			state.path = node.path;
			state.dataStale = true;
			state.schemaStale = true;
			break;
		case ActionTypes.DELETE_FIELD:
			Cms.deleteFieldAt(node, action.fieldIndex);
			state.dataStale = true;
			state.schemaStale = true;
			break;
		case ActionTypes.ADD_VALUE:
			Cms.setValue(node, action.field, action.value);
			state.dataStale = true;
			break;
	}
};

export const preferencesReducer = (state: PreferencesState = { mode: ViewMode.developer, jsonFile: JsonFile.data },
																	 action : SetViewModeAction | SetJsonFileAction | DefaultAction) => {
	switch (action.type) {
		case ActionTypes.SET_VIEW_MODE:
			return {
				mode: action.mode,
				jsonFile: state.jsonFile
			};
		case ActionTypes.SET_JSON_FILE:
			return {
				mode: state.mode,
				jsonFile: action.jsonFile
			};
		default:
			return state;
	}
};

export const editingFieldReducer = (state : EditingFieldState = null,
																		action : EditFieldAction | SubmitFieldAction | CancelEditFieldAction | DefaultAction) => {
	switch (action.type) {
		case ActionTypes.EDIT_FIELD:
			return {
				path: action.node.path,
				fieldIndex: action.fieldIndex
			};
		case ActionTypes.SUBMIT_FIELD:
		case ActionTypes.CANCEL_EDIT_FIELD:
			return null;
		default:
			return state;
	}
};

export const editingNodeReducer = (state : EditingNodeState = null,
																	 action : EditNodeAction | SubmitNodeAction | CancelEditNodeAction | DefaultAction) => {
	switch (action.type) {
		case ActionTypes.EDIT_NODE:
			return {
				path: action.node.path
			};
		case ActionTypes.SUBMIT_NODE:
		case ActionTypes.CANCEL_EDIT_NODE:
			return null;
		default:
			return state;
	}
};

export const confirmReducer = (state : ConfirmState = null, action : ShowConfirmAction | CancelConfirmAction | DeleteFieldAction | DeleteNodeAction) => {
	switch (action.type) {
		case ActionTypes.SHOW_CONFIRM:
			return {
				ok: action.ok,
				title: action.title,
				body: action.body
			};
		case ActionTypes.CANCEL_CONFIRM:
		case ActionTypes.DELETE_FIELD:
		case ActionTypes.DELETE_NODE:
			return null;
		default:
			return state;
	}
};

type TreeAction = AddChildAction
	| AddItemAction
	| DeleteItemAction
	| MoveItemAction
	| InputValueAction
	| AddValueAction
	| SubmitNodeAction
	| SubmitFieldAction
	| DeleteFieldAction
	| DeleteNodeAction
	| LoadEndAction;

type OtherMainActions = ClearFieldErrorsAction
	| LoadStartAction
	| SaveStartAction
	| LoadEndAction
	| SaveEndAction
	| DefaultAction
	| LoadErrorAction
	| ResetNavigateToAction;


export const mainReducer = (state: MainState = makeMain(), action: TreeAction | OtherMainActions): MainState => {
	switch (action.type) {
		case ActionTypes.ADD_CHILD:
		case ActionTypes.ADD_ITEM:
		case ActionTypes.DELETE_ITEM:
		case ActionTypes.MOVE_ITEM:
		case ActionTypes.INPUT_VALUE:
		case ActionTypes.ADD_VALUE:
		case ActionTypes.SUBMIT_NODE:
		case ActionTypes.SUBMIT_FIELD:
		case ActionTypes.DELETE_FIELD:
		case ActionTypes.DELETE_NODE:
			// For now, use JSON parse/stringify.
			// If performance becomes an issue, we could write our own custom deep copy
			// See https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
			const newState = cloneMain(state);
			newState.busy = false;
			const newNode = Cms.findNode(newState.tree, action.node.path);
			apply(action, newState, newNode);
			return newState;
		case ActionTypes.CLEAR_FIELD_ERRORS:
			return {
				...state,
				fieldsInError: new Map()
			};
		case ActionTypes.LOAD_START:
		case ActionTypes.SAVE_START:
			return {
				...state,
				busy: true
			};
		case ActionTypes.LOAD_END:
			return makeMain(action.model, action.data);
		case ActionTypes.SAVE_END:
			return {
				...state,
				schemaStale: false,
				dataStale: false,
				busy: false
			};
		case ActionTypes.LOAD_ERROR:
			return {
				...state,
				busy: false
			};
		case ActionTypes.RESET_NAVIGATE_TO:
			return {
				...state,
				path: null
			};
		default:
			return state;
	}
};

export const messageReducer = (state: MessageState | null = null,
															 action: LogInfoAction | LogErrorAction | DefaultAction) => {
	switch (action.type) {
		case ActionTypes.LOG_ERROR:
			return {
				text: action.message,
				level: 'error'
			};
		case ActionTypes.LOG_INFO:
			return {
				text: action.message,
				level: 'info'
			};
		default:
			return state;
	}
};

export const navigationReducer = (state: NavigationState | null = null,
																	action: NavigateAction | LoadEndAction | DefaultAction) => {
	switch (action.type) {
		case ActionTypes.ON_NAVIGATE:
			if (action.current.startsWith('/node/')) {
				// We were on a node, and quit the tree (eg: /json). We save the latestNode
				return {
					latestNode: action.current.substring('/node/'.length)
				}
			}
			return state;
		case ActionTypes.LOAD_END:
			return null;
		default:
			return state;
	}
};