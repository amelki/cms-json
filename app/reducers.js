import Cms from './cms';
import md from './md';
import * as Actions from './actions';

const apply = (action, state, node) => {
	switch (action.type) {
		case Actions.ADD_ITEM:
			node.data.push({
				[Cms.defaultFieldName(node.model)] : Cms.findNewName(node, "New " + node.model.name, 1)
			});
			break;
		case Actions.DELETE_ITEM:
			node.data.splice(action.index, 1);
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
			switch (field) {
				case 'markdown':
					value = md.html(value);
					break;
				case 'boolean':
					value = event.target.checked;
					break;
			}
			node.data[Cms.fieldName(field)] = value;
			break;
		case Actions.ADD_VALUE:
			node.data[Cms.fieldName(action.field)] = action.value;
			break;
	}
};

export default (state = {data: {}, model: {}, stale: false, busy: false, selection: ''}, action) => {
	switch (action.type) {
		case Actions.ADD_ITEM:
		case Actions.DELETE_ITEM:
		case Actions.MOVE_ITEM:
		case Actions.INPUT_VALUE:
		case Actions.ADD_VALUE:
			const newState = Object.assign({
				stale: true,
				busy: false,
				selection: state.selection
			}, Cms.deepCopy(state.model, state.data));
			const newNode = Cms.findNode(newState.model, newState.data, action.node.path);
			apply(action, newState, newNode);
			return newState;
		case Actions.LOAD:
		case Actions.SAVE:
			return Object.assign({
				stale: false,
				busy: false,
				selection: state.selection
			}, Cms.deepCopy(state.model, state.data));
		default:
			return state;
	}
};
