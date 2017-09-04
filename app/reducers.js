import * as Cms from './cms';
import md from './md';
import * as Actions from './actions';

const apply = (action, state, node) => {
	switch (action.type) {
		case Actions.ADD_ITEM:
			Cms.addItem(node, "New " + node.model.name);
			break;
		case Actions.ADD_CHILD:
			Cms.addNode(node, "New " + action.childType, action.childType);
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