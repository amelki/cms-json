import { SchemaElement, Type } from './schema';

export enum NodeType {
	TYPE_TREE = 'tree',
	TYPE_MAP_OBJECT = 'map<object>',
	TYPE_MAP_STRING = "map<string>",
	TYPE_LIST_OBJECT = "list<object>"
}

export enum FieldType {
	String = 'string',
	Boolean = 'boolean',
	Markdown = 'markdown',
	Array = 'array',
	TextArea = 'textarea',
	Html = 'html'
}

export class Model {
	name: string;
	type: NodeType;
	fields: Field[];
	constructor(name: string, fields: Field[]) {
		this.name = name;
		this.fields = fields;
	}

	getFieldAt(i: number) : Field {
		return this.fields[i];
	}
	getFieldNamed(name: string) : Field {
		return this.fields.find(field => field.name === name)!;
	}

	isMap() {
		return false;
	}
	isItem() {
		return false;
	}
}

export class TreeModel extends Model {
	children: Model[];
	constructor(name: string, fields: Field[], children: Model[]) {
		super(name, fields);
		this.name = name;
		this.children = children;
		this.type = NodeType.TYPE_TREE;
	}
}

export class ListModel extends Model {
	constructor(name: string, fields: Field[]) {
		super(name, fields);
		this.type = NodeType.TYPE_LIST_OBJECT;
	}
	isItem() {
		return true;
	}
}

export class StringMapModel extends Model {
	constructor(name: string, fields: Field[]) {
		super(name, fields);
		this.type = NodeType.TYPE_MAP_STRING;
	}
	isMap() {
		return true;
	}
	isItem() {
		return true;
	}
}

export class ObjectMapModel extends Model {
	constructor(name: string, fields: Field[]) {
		super(name, fields);
		this.type = NodeType.TYPE_MAP_OBJECT;
	}
	isMap() {
		return true;
	}
	isItem() {
		return true;
	}
}

export class Field {
	name: string;
	type: FieldType;
	key: boolean;
	description: string;
	className: string;
	constructor(name: string, type?: FieldType, key?: boolean, description?: string, className?: string) {
		this.name = name;
		this.type = type || FieldType.String;
		this.key = key || false;
		this.description = description!;
		this.className = className!;
	}
}

export interface Node<M extends Model> {
	model: M;
	data: any;
	parent: Node<TreeModel> | null;
	path: string,
	treePath: string,
	fieldIndex: number,
	dataIndex: any
}

export interface Path {
	fullPath: string,
	treePath: string,
	dataIndex: any
}

const normalizeField = (field: any) : Field => {
	if (typeof field === 'string') {
		return new Field(field, FieldType.String);
	} else {
		return new Field(
			field.name,
			field.type || FieldType.String,
			field.key || false,
			field.description || undefined,
			field.className || undefined
		);
	}
};

export const normalizeModel = (model: any) : Model => {
	const type : NodeType = model.type || (model.list ? NodeType.TYPE_LIST_OBJECT : NodeType.TYPE_TREE);
	const fields = model.fields || [];
	const normalizedFields : Field[] = fields.map(field => normalizeField(field));
	switch (type) {
		case NodeType.TYPE_TREE:
			const normalizedChildren : Model[] = model.children ? model.children.map(child => normalizeModel(child)) : [];
			return new TreeModel(model.name, normalizedFields, normalizedChildren);
		case NodeType.TYPE_LIST_OBJECT:
			return new ListModel(model.name, normalizedFields);
		case NodeType.TYPE_MAP_OBJECT:
			return new ObjectMapModel(model.name, normalizedFields);
		case NodeType.TYPE_MAP_STRING:
			return new StringMapModel(model.name, normalizedFields);
	}
};
