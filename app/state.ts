import { normalizeModel, TreeModel } from "./model";
import { Node } from "./model";
import { RouterState } from 'react-router-redux';
import {RootSchemaElement, SchemaElement} from "./schema";
import {schemaToModel} from "./cms";

export default interface AppState {
	main: MainState;
	editingField: EditingFieldState | null;
	editingNode: EditingNodeState | null;
	message: MessageState;
	navigation : NavigationState | null;
	confirm;
	router: RouterState;
	field?: any;
	modelNode?: any;
	forms?: any;
}

export const makeAppState = (schema: RootSchemaElement, data: object) : AppState => {
	return {
		main: makeMain(schema, data),
		editingField: null,
		editingNode: null,
		message: {
			text: '',
			level: Level.info
		},
		navigation: null,
		confirm: null,
		router: {}
	}
};

export interface NavigationState {
	latestNode: string;
}

export type EditingNodeState = { path: string; } | null;

export type ConfirmState = {
	ok : () => void,
	title : string,
	body: string
} | null;

export enum Level {
	error, info
}

export interface MessageState {
	text: string;
	level: Level;
}

export interface FieldInError {
	name: string;
	value: any;
}

export type EditingFieldState = {
	path: string;
	fieldIndex: number;
} | null;

export interface MainState {
	tree: Node<TreeModel>;
	stale: boolean;
	busy: boolean;
	path: string | null;
	fieldsInError: Map<string, FieldInError>;
}

export const makeMain = (schema?: RootSchemaElement, data?) : MainState => {
	let treeModel = schema ? (<TreeModel> schemaToModel(schema)) : { name: 'New Web Site', children: [], fields: [] };
	return {
		tree: {
			model: treeModel,
			schema: schema,
			data: data || {},
			parent: null,
			path: '',
			treePath: '',
			fieldIndex: -1,
			dataIndex: -1
		},
		stale: false,
		busy: false,
		path: '',
		fieldsInError: new Map()
	} as MainState;
};

export const cloneMain = (main: MainState) : MainState => {
	const _fieldsInError : Map<string, FieldInError> = new Map();
	main.fieldsInError.forEach((fieldInError, key) => {
		_fieldsInError.set(key, { name: fieldInError.name, value: fieldInError.value });
	});
	return {
		tree: {
			model: (<TreeModel> normalizeModel(JSON.parse(JSON.stringify(main.tree.model)))),
			data: JSON.parse(JSON.stringify(main.tree.data)),
			schema: JSON.parse(JSON.stringify(main.tree.schema)),
			parent: null,
			path: '',
			treePath: '',
			fieldIndex: -1,
			dataIndex: -1
		},
		stale: main.stale,
		busy: main.busy,
		path: main.path,
		fieldsInError: _fieldsInError
	};
};
