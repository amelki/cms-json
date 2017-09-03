import * as Cms from './cms';
import md from './md';
import * as Actions from './actions';

const apply = (action, state, node) => {
	switch (action.type) {
		case Actions.ADD_ITEM:
			const newItemName = Cms.findNewName(node, "New " + node.model.name, 1);
			let nodeType = Cms.nodeType(node);
			switch (nodeType) {
				case Cms.TYPE_MAP:
					node.data[Cms.slugify(newItemName)] = {
						[Cms.defaultFieldName(node.model)] : newItemName
					};
					break;
				case Cms.TYPE_LIST:
					node.data.push({
						[Cms.defaultFieldName(node.model)] : newItemName
					});
					break;
				default:
					throw new Error(`Cannot add item to node of type ${nodeType}`);
			}
			break;
		case Actions.ADD_CHILD:
			const newModel = {
				name : Cms.findNewNodeName(node, "New " + action.childType, 1),
				type: action.childType
			};
			let newData;
			switch (action.childType) {
				case Cms.TYPE_TREE:
					newModel.children = [];
					newData = {};
					break;
				case Cms.TYPE_MAP:
					newModel.fields = [ "Name" ];
					newData = {};
					break;
				case Cms.TYPE_LIST:
					newModel.fields = [ "Name" ];
					newData = [];
					break;
			}
			if (!node.model.children) {
				node.model.children = [];
			}
			node.model.children.push(newModel);
			node.data[Cms.slugify(newModel.name)] = newData;
			break;
		case Actions.DELETE_ITEM:
			if (Cms.nodeType(node) === Cms.TYPE_LIST) {
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
			node.data[Cms.fieldName(field)] = value;
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
			const newState = {
				stale: true,
				busy: false,
				tree: Cms.deepCopy(state.tree)
			};
			const newNode = Cms.findNode(newState.tree, action.node.path);
			apply(action, newState, newNode);
			return newState;
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