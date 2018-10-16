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
	Html = 'html',
	Number = 'number'
}

export abstract class Model {
	name: string;
	abstract type: NodeType;
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
	type: NodeType = NodeType.TYPE_TREE;
	constructor(name: string, fields: Field[], children: Model[]) {
		super(name, fields);
		this.name = name;
		this.children = children;
	}
}

export class ListModel extends Model {
	type: NodeType = NodeType.TYPE_LIST_OBJECT;
	isItem() {
		return true;
	}
}

export class StringMapModel extends Model {
	type: NodeType = NodeType.TYPE_MAP_STRING;
	isMap() {
		return true;
	}
	isItem() {
		return true;
	}

}

export class ObjectMapModel extends Model {
	type: NodeType = NodeType.TYPE_MAP_OBJECT;
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
	schema: SchemaElement;
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
		let fieldType = field.type || FieldType.String;
		if (fieldType === 'Html') { // Some models had that typo...
			fieldType = "html";
		}
		if (fieldType === 'markdown') {
			// In the case of markdown fields with old models, convert them back to HTML since the values
			// were automatically converted to HTML.
			// New fields of type markdown will store the raw markdown text in the corresponding json string
			fieldType = 'html';
		}
		return new Field(
			field.name,
			fieldType,
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
