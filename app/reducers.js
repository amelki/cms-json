import * as Cms from './cms';
import md from './md';
import * as Actions from './actions';

const apply = (action, state, node, parentNode) => {
	switch (action.type) {
		case Actions.ADD_ITEM:
			Cms.addItem(node, "New " + node.model.name);
			break;
		case Actions.ADD_CHILD:
			const newNode = Cms.addNode(node, "New " + action.childType, action.childType);
			state.path = newNode.path;
			break;
		case Actions.DELETE_ITEM:
			if (Cms.getNodeType(node) === Cms.TYPE_LIST_OBJECT) {
				node.data.splice(action.index, 1);
			} else {
				delete node.data[action.index];
			}
			break;
		case Actions.MOVE_ITEM:
			const sourceItem = node.data[action.source];
			const {source, target} = action;
			node.data[source] = node.data[target];
			node.data[target] = sourceItem;
			break;
		case Actions.INPUT_VALUE:
			const {event, field} = action;
			let value = event.target.value;
			switch (field.type) {
				case 'markdown':
					value = md.html(value);
					break;
				case 'boolean':
					// Do not try to grab the state from the checkbox itself (event.target.checked has a surprising behavior...)
					value = !node.data[Cms.fieldName(field)];
					break;
			}
			if (Cms.isMapType(node) && Cms.isKeyField(field)) {
				if (value && value.length > 0 && !parentNode.data[value]) {
					delete parentNode.data[node.index];
					parentNode.data[value] = node.data;
					// Request navigation to the new path
					state.path = parentNode.path + '/' + value;
					delete state.fieldsInError[node.path];
				} else {
					state.fieldsInError[node.path] = { field: field, value: value };
				}
			} else {
				node.data[Cms.fieldName(field)] = value;
			}
			break;
		case Actions.SUBMIT_FIELD:
			const index = (typeof state.editingField.index !== 'undefined') ? state.editingField.index : node.model.children.length;
			node.model.fields[index] = state.editingField.field;
			// TODO: handle the case where the field already exists (involves refactoring data...)
			state.editingField = null;
			break;
		case Actions.ADD_VALUE:
			node.data[Cms.fieldName(action.field)] = action.value;
			break;
	}
};

export const mainReducer = (state = {data: {}, model: {}, stale: false, busy: false}, action) => {
	switch (action.type) {
		case Actions.ADD_CHILD:
		case Actions.ADD_ITEM:
		case Actions.DELETE_ITEM:
		case Actions.MOVE_ITEM:
		case Actions.INPUT_VALUE:
		case Actions.ADD_VALUE:
		case Actions.SUBMIT_FIELD:
			// For now, use JSON parse/stringify.
			// If performance becomes an issue, we could write our own custom deep copy
			// See https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
			const newState = Object.assign({}, JSON.parse(JSON.stringify(state)), { stale: true, busy: false });
			const newNode = Cms.findNode(newState.tree, action.node.path);
			const selection = Cms.treePathAndIndex(newState.tree, action.node.path);
			apply(action, newState, newNode, Cms.isSelectionItem(selection) ? Cms.findNode(newState.tree, selection.treePath) : null);
			return newState;
		case Actions.EDIT_FIELD:
			let editingField = {};
			if (typeof action.index !== 'undefined') {
				editingField = { path: action.node.path, index: action.index };
			}
			return {
				...state,
				editingField
			};
		case Actions.CANCEL_EDIT_FIELD:
			return {
				...state,
				editingField: null
			};
		case Actions.CLEAR_FIELD_ERRORS:
			return {
				...state,
				fieldsInError: {}
			};
		case Actions.LOAD_START:
		case Actions.SAVE_START:
			return {
				...state,
				busy: true
			};
		case Actions.LOAD_END:
			return {
				tree: {
					model: action.model,
					data: action.data
				},
				fieldsInError: {},
				stale: false,
				busy: false
			};
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
				// We were on a node, and qui the tree (eg: /json). We save the latestNode
				return {
					latestNode: action.current.substring('/node/'.length)
				}
			}
			return state;
		default:
			return state;
	}
};