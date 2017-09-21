import axios from 'axios';
import * as Cms from './cms';
import {actions} from 'react-redux-form';
import {FieldType, Model, Node, NodeType, normalizeModel, TreeModel} from './model';
import {ActionCreator} from "react-redux";
import {Action} from "redux";

export const enum ActionTypes {
	ADD_CHILD,
	ADD_ITEM,
	DELETE_ITEM,
	MOVE_ITEM,
	INPUT_VALUE,
	ADD_VALUE,
	LOAD_START,
	LOAD_END,
	LOAD_ERROR,
	SAVE_START,
	SAVE_END,
	SAVE_ERROR,
	LOG_INFO,
	LOG_ERROR,
	CLEAR_FIELD_ERRORS,
	ON_NAVIGATE,
	SUBMIT_FIELD,
	CANCEL_EDIT_FIELD,
	EDIT_FIELD,
	EDIT_NODE,
	SUBMIT_NODE,
	CANCEL_EDIT_NODE,
	DELETE_FIELD,
	SHOW_CONFIRM,
	CANCEL_CONFIRM,
	DELETE_NODE,
	RESET_NAVIGATE_TO,
	DEFAULT_ACTION = "__any_other_action_type__"
}

export type LOG_INFO = 'App/LOG_INFO';
export const LOG_INFO : LOG_INFO = 'App/LOG_INFO';

export type LOG_ERROR = 'App/LOG_INFO';
export const LOG_ERROR : LOG_ERROR = 'App/LOG_INFO';


interface AddChildAction extends Action {
	node: Node<TreeModel>,
	childType: NodeType
}

export interface LogInfoAction extends Action {
	type: ActionTypes.LOG_INFO,
	message: string;
}
export interface LogErrorAction extends Action  {
	type: ActionTypes.LOG_ERROR,
	message: string;
}
export interface DefaultAction extends Action  {
	type: ActionTypes.DEFAULT_ACTION
}

const logInfo : ActionCreator<LogInfoAction> = (message : string) : LogInfoAction => ({
	message,
	type: ActionTypes.LOG_INFO
});
const logError : ActionCreator<LogErrorAction> = (message : string) : LogErrorAction => ({
	message,
	type: ActionTypes.LOG_ERROR
});

export const addChild : ActionCreator<AddChildAction> = (node : Node<TreeModel>, childType: NodeType) : AddChildAction => ({
	type: ActionTypes.ADD_CHILD,
	node: node,
	childType: childType
});

export const addItem = (node : Node<Model>) => ({
	type: ActionTypes.ADD_ITEM,
	node: node
});
export const deleteItem = (node : Node<Model>, dataIndex : number | string) => ({
	type: ActionTypes.DELETE_ITEM,
	node,
	dataIndex
});
export const moveItem = (node, source, target) => ({
	type: ActionTypes.MOVE_ITEM,
	node,
	source,
	target
});
export const clearFieldErrors = () => ({
	type: ActionTypes.CLEAR_FIELD_ERRORS
});
export const onNavigate = (previousRouterPath, newRouterPath) => ({
	type: ActionTypes.ON_NAVIGATE,
	previous: previousRouterPath,
	current: newRouterPath
});

export const load = () => {
	return dispatch => {
		dispatch(loadStart());
		dispatch(logInfo('Loading model and data files'));
		Promise.all([axios.get(`/model.json`), axios.get(`/data.json`)]).then(values => {
			const model = normalizeModel(values[0].data);
			const data = values[1].data;
			dispatch(loadEnd(model, data));
			dispatch(logInfo('Model and data files loaded from server'));
		}).catch(err => {
			dispatch(loadError());
			dispatch(logError('Error while loading JSON files: ' + err));
		});
	}
};
const loadStart = () => ({
	type: ActionTypes.LOAD_START
});
const loadEnd = (model, data) => ({
	type: ActionTypes.LOAD_END,
	model,
	data
});
const loadError = () => ({
	type: ActionTypes.LOAD_ERROR
});
export const save = () => {
	return (dispatch, getState) => {
		dispatch(saveStart());
		dispatch(logInfo('Loading model and data files'));
		axios.post('/data.json', getState().main.data).then(() => {
			dispatch(saveEnd());
			dispatch(logInfo('JSON data file saved on disk'));
		}).catch(err => {
			dispatch(saveError());
			dispatch(logError('Error while saving JSON file: ' + err));
		});
	}
};
const saveStart = () => ({
	type: ActionTypes.SAVE_START
});
const saveEnd = () => ({
	type: ActionTypes.SAVE_END
});
const saveError = () => ({
	type: ActionTypes.SAVE_ERROR
});
export const inputValue = (node, field, event) => ({
	type: ActionTypes.INPUT_VALUE,
	node,
	field,
	event
});
export const addValue = (node, field, value) => ({
	type: ActionTypes.ADD_VALUE,
	node,
	field,
	value
});
export const editField = (node, fieldIndex) => {
	return (dispatch/*, getState */) => {
		let field;
		if (fieldIndex >= 0) {
			field = Cms.getField(node.model.fields[fieldIndex]);
		} else {
			field = {
				name: '',
				type: FieldType.String
			}
		}
		dispatch(actions.change('field', field));
		dispatch({
			type: ActionTypes.EDIT_FIELD,
			node,
			fieldIndex
		});
	}
};
export const submitField = (field) => {
	return (dispatch, getState) => {
		const state = getState();
		dispatch({
			type: ActionTypes.SUBMIT_FIELD,
			field: field,
			node: Cms.findNode(state.main.tree, state.editingField.path),
			fieldIndex: state.editingField.fieldIndex
		});
	};
};
export const cancelEditField = () => ({
	type: ActionTypes.CANCEL_EDIT_FIELD
});
export const cancelConfirm = () => ({
	type: ActionTypes.CANCEL_CONFIRM
});
export const deleteField = (node, fieldIndex) => {
	return (dispatch /*, getState */) => {
		dispatch({
			type: ActionTypes.SHOW_CONFIRM,
			ok: () => {
				dispatch({
					type: ActionTypes.DELETE_FIELD,
					node,
					fieldIndex
				});
			},
			title: 'Confirm delete field',
			body: `Are you sure you want to delete the field '${Cms.getField(node.model.fields[fieldIndex]).name}' ?`
		});
	};
};
export const deleteNode = (node, selection, history) => {
	return (dispatch, getState) => {
		dispatch({
			type: ActionTypes.SHOW_CONFIRM,
			ok: () => {
				dispatch({
					type: ActionTypes.DELETE_NODE,
					node,
					selection
				});
				navigate(dispatch, getState, history);
			},
			title: 'Confirm delete node',
			body: `Are you sure you want to delete the node '${node.model.name}' ?`
		});
	};
};

export const editNode = (node) => {
	return (dispatch) => {
		dispatch(actions.change('modelNode', node.model));
		dispatch({
			type: ActionTypes.EDIT_NODE,
			node
		});
	}
};
export const cancelEditNode = () => ({
	type: ActionTypes.CANCEL_EDIT_NODE
});
export const submitNode = (node, model) => ({
	type: ActionTypes.SUBMIT_NODE,
	model,
	node
});

const navigate = (dispatch, getState, history) => {
	const navigateTo = getState().main.path;
	if (navigateTo !== null) {
		history.push(navigateTo);
		dispatch(resetNavigateTo());
	}
};

export const resetNavigateTo = () => ({
	type: ActionTypes.RESET_NAVIGATE_TO
});
