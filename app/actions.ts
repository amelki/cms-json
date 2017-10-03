import axios from 'axios';
import * as Cms from './cms';
import {actions, ModelAction} from 'react-redux-form';
import {Field, FieldType, Model, Node, NodeType, normalizeModel, Path, TreeModel} from './model';
import {ActionCreator, Dispatch} from "react-redux";
import {Action} from "redux";
import AppState, {JsonFile, ViewMode} from "./state";
import {migrateSchema, schemaToModel} from "./cms";
import {RootSchemaElement} from "./schema";

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
	SET_VIEW_MODE,
	SET_JSON_FILE,
	DEFAULT_ACTION = "__any_other_action_type__"
}

export interface DefaultAction extends Action {
	type: ActionTypes.DEFAULT_ACTION
}

export interface LogErrorAction extends Action {
	type: ActionTypes.LOG_ERROR;
	message: string;
}
export const logError: ActionCreator<LogErrorAction> = (message: string): LogErrorAction => ({
	type: ActionTypes.LOG_ERROR,
	message
});

export interface LogInfoAction extends Action {
	type: ActionTypes.LOG_INFO;
	message: string;
}
export const logInfo: ActionCreator<LogInfoAction> = (message: string): LogInfoAction => ({
	type: ActionTypes.LOG_INFO,
	message
});

export interface AddChildAction extends Action {
	type: ActionTypes.ADD_CHILD,
	node: Node<TreeModel>,
	childType: NodeType
}
export const addChild: ActionCreator<AddChildAction> = (node: Node<TreeModel>, childType: NodeType): AddChildAction => ({
	type: ActionTypes.ADD_CHILD,
	node: node,
	childType: childType
});

export interface AddItemAction extends Action {
	type: ActionTypes.ADD_ITEM,
	node: Node<Model>
}
export const addItem: ActionCreator<AddItemAction> = (node: Node<Model>) : AddItemAction => ({
	type: ActionTypes.ADD_ITEM,
	node: node
});

export interface DeleteItemAction extends Action {
	type: ActionTypes.DELETE_ITEM,
	node: Node<Model>,
	dataIndex: number | string
}
export const deleteItem : ActionCreator<DeleteItemAction> = (node: Node<Model>, dataIndex: number | string) : DeleteItemAction => ({
	type: ActionTypes.DELETE_ITEM,
	node,
	dataIndex
});

export interface MoveItemAction extends Action {
	type: ActionTypes.MOVE_ITEM,
	node: Node<Model>,
	source: number,
	target: number
}
export const moveItem: ActionCreator<MoveItemAction> = (node: Node<Model>, source : number, target : number) : MoveItemAction => ({
	type: ActionTypes.MOVE_ITEM,
	node,
	source,
	target
});

export interface ClearFieldErrorsAction extends Action {
	type: ActionTypes.CLEAR_FIELD_ERRORS
}
export const clearFieldErrors : ActionCreator<ClearFieldErrorsAction> = () : ClearFieldErrorsAction => ({
	type: ActionTypes.CLEAR_FIELD_ERRORS
});

export interface NavigateAction extends Action {
	type: ActionTypes.ON_NAVIGATE,
	previous: string,
	current: string
}
export const onNavigate: ActionCreator<NavigateAction> = (previousRouterPath: string, newRouterPath: string) => ({
	type: ActionTypes.ON_NAVIGATE,
	previous: previousRouterPath,
	current: newRouterPath
});

export const load = () => {
	return (dispatch: Dispatch<ActionCreator<Action>>) => {
		dispatch(loadStart());
		dispatch(logInfo('Loading model and data files'));
		Promise.all([axios.get(`/schema.json`), axios.get(`/data.json`)]).then(values => {
			const model = migrateSchema(values[0].data);
			const data = values[1].data;
			dispatch(loadEnd(model, data));
			dispatch(logInfo('Model and data files loaded from server'));
		}).catch(err => {
			dispatch(loadError());
			dispatch(logError('Error while loading JSON files: ' + err));
		});
	}
};

export interface LoadStartAction extends Action {
	type: ActionTypes.LOAD_START
}
const loadStart: ActionCreator<LoadStartAction> = () : LoadStartAction => ({
	type: ActionTypes.LOAD_START
});

export interface LoadEndAction extends Action {
	type: ActionTypes.LOAD_END,
	model: RootSchemaElement,
	data: object
}
export const loadEnd : ActionCreator<LoadEndAction> = (model, data) : LoadEndAction => ({
	type: ActionTypes.LOAD_END,
	model,
	data
});

export interface LoadErrorAction extends Action {
	type: ActionTypes.LOAD_ERROR
}
export const loadError: ActionCreator<LoadErrorAction> = () : LoadErrorAction => ({
	type: ActionTypes.LOAD_ERROR
});

export const save = () => {
	return (dispatch, getState : () => AppState) => {
		dispatch(saveStart());
		const state = getState();
		const promises = [] as Promise<any>[];
		let beforeMessage;
		let afterMessage;
		if (state.main.schemaStale) {
			promises.push(axios.post('/schema.json', getState().main.tree.schema));
			if (state.main.dataStale) {
				beforeMessage = 'Saving schema and data files';
				afterMessage = 'Schema and data files saved on disk';
			} else {
				beforeMessage = 'Saving schema file';
				afterMessage = 'Schema file saved on disk';
			}
		}
		if (state.main.dataStale) {
			promises.push(axios.post('/data.json', getState().main.tree.data));
			if (!state.main.schemaStale) {
				beforeMessage = 'Saving data file';
				afterMessage = 'Data file saved on disk';
			}
		}
		dispatch(logInfo(beforeMessage));
		Promise.all(promises).then(() => {
			dispatch(saveEnd());
			dispatch(logInfo(afterMessage));
		}).catch(err => {
			dispatch(saveError());
			dispatch(logError('Error while saving JSON file: ' + err));
		});
	}
};

export interface SaveStartAction extends Action {
	type: ActionTypes.SAVE_START
}
const saveStart: ActionCreator<SaveStartAction> = () : SaveStartAction => ({
	type: ActionTypes.SAVE_START
});

export interface SaveEndAction extends Action {
	type: ActionTypes.SAVE_END
}
const saveEnd: ActionCreator<SaveEndAction> = () : SaveEndAction => ({
	type: ActionTypes.SAVE_END
});

export interface SaveErrorAction extends Action {
	type: ActionTypes.SAVE_ERROR
}
const saveError: ActionCreator<SaveErrorAction> = () : SaveErrorAction => ({
	type: ActionTypes.SAVE_ERROR
});

export interface InputValueAction extends Action {
	type: ActionTypes.INPUT_VALUE,
	node: Node<Model>,
	field: Field,
	event
}
export const inputValue: ActionCreator<InputValueAction> = (node: Node<Model>, field: Field, event) : InputValueAction => ({
	type: ActionTypes.INPUT_VALUE,
	node,
	field,
	event
});

export interface AddValueAction extends Action {
	type: ActionTypes.ADD_VALUE,
	node: Node<Model>,
	field: Field,
	value
}
export const addValue: ActionCreator<AddValueAction> = (node: Node<Model>, field, value) : AddValueAction => ({
	type: ActionTypes.ADD_VALUE,
	node,
	field,
	value
});

export const editField = (node : Node<Model>, fieldIndex: number) => {
	return (dispatch: (a: EditFieldAction | ModelAction) => SubmitFieldAction/*, getState: () => AppState*/) => {
		let field : Field;
		if (fieldIndex >= 0) {
			field = Cms.getField(node.model.fields[fieldIndex]);
		} else {
			field = {
				name: '',
				type: FieldType.String,
				key: false,
				description: '',
				className: ''
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

export interface EditFieldAction extends Action {
	type: ActionTypes.EDIT_FIELD;
	node: Node<Model>;
	fieldIndex: number;
}

export interface SubmitFieldAction {
	type: ActionTypes.SUBMIT_FIELD,
	field: Field,
	node: Node<Model>,
	fieldIndex: number
}
export const submitField = (field : Field) => {
	return (dispatch: (a: SubmitFieldAction) => SubmitFieldAction, getState: () => AppState) => {
		const state = getState();
		if (state.editingField != null) {
			dispatch({
				type: ActionTypes.SUBMIT_FIELD,
				field: field,
				node: Cms.findNode(state.main.tree, state.editingField.path),
				fieldIndex: state.editingField.fieldIndex
			});
		}
	};
};

export interface CancelEditFieldAction extends Action {
	type: ActionTypes.CANCEL_EDIT_FIELD
}
export const cancelEditField: ActionCreator<CancelEditFieldAction> = () : CancelEditFieldAction => ({
	type: ActionTypes.CANCEL_EDIT_FIELD
});

export interface CancelConfirmAction extends Action {
	type: ActionTypes.CANCEL_CONFIRM
}
export const cancelConfirm: ActionCreator<CancelConfirmAction> = () : CancelConfirmAction => ({
	type: ActionTypes.CANCEL_CONFIRM
});

export interface ShowConfirmAction extends Action {
	type: ActionTypes.SHOW_CONFIRM;
	ok: () => void,
	title: string,
	body: string
}
export interface DeleteFieldAction extends Action {
	type: ActionTypes.DELETE_FIELD;
	node : Node<Model>;
	fieldIndex : number
}
export const deleteField = (node : Node<Model>, fieldIndex : number) => {
	return (dispatch : (action: ShowConfirmAction | DeleteFieldAction) => Action /*, getState */) => {
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

export interface DeleteNodeAction extends Action {
	type: ActionTypes.DELETE_NODE;
	node : Node<Model>;
	selection : Path;
}
export const deleteNode = (node : Node<Model>, selection : Path, history) => {
	return (dispatch: (action: DeleteNodeAction | ShowConfirmAction) => Action, getState : () => AppState) => {
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

export interface EditNodeAction extends Action {
	type: ActionTypes.EDIT_NODE,
	node: Node<Model>
}
export const editNode = (node : Node<Model>) => {
	return (dispatch : (action : EditNodeAction | ModelAction) =>  EditNodeAction) => {
		dispatch(actions.change('modelNode', node.model));
		dispatch({
			type: ActionTypes.EDIT_NODE,
			node
		});
	}
};

export interface CancelEditNodeAction extends Action {
	type: ActionTypes.CANCEL_EDIT_NODE
}
export const cancelEditNode : ActionCreator<CancelEditNodeAction> = () : CancelEditNodeAction => ({
	type: ActionTypes.CANCEL_EDIT_NODE
});

export interface SubmitNodeAction extends Action {
	type: ActionTypes.SUBMIT_NODE,
	model : Model,
	node : Node<Model>
}
export const submitNode: ActionCreator<SubmitNodeAction> = (node : Node<Model>, model: Model) : SubmitNodeAction => ({
	type: ActionTypes.SUBMIT_NODE,
	model,
	node
});

export interface ResetNavigateToAction extends Action {
	type: ActionTypes.RESET_NAVIGATE_TO
}
export const resetNavigateTo : ActionCreator<ResetNavigateToAction> = () : ResetNavigateToAction => ({
	type: ActionTypes.RESET_NAVIGATE_TO
});

const navigate = (dispatch: (action: Action) => void, getState: () => AppState, history) => {
	const navigateTo = getState().main.path;
	if (navigateTo !== null) {
		history.push(navigateTo);
		dispatch(resetNavigateTo());
	}
};

export interface SetViewModeAction extends Action {
	type: ActionTypes.SET_VIEW_MODE;
	mode: ViewMode;
}
export const setViewMode : ActionCreator<SetViewModeAction> = (mode: ViewMode) : SetViewModeAction => ({
	type: ActionTypes.SET_VIEW_MODE,
	mode: mode
});

export interface SetJsonFileAction extends Action {
	type: ActionTypes.SET_JSON_FILE;
	jsonFile: JsonFile;
}
export const setJsonFile : ActionCreator<SetJsonFileAction> = (jsonFile: JsonFile) : SetJsonFileAction => ({
	type: ActionTypes.SET_JSON_FILE,
	jsonFile: jsonFile
});

