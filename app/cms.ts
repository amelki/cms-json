import {
	Field,
	FieldType,
	ListModel,
	Model,
	Node,
	NodeType, normalizeModel,
	ObjectMapModel,
	Path,
	StringMapModel,
	TreeModel
} from './model';
import {
	Format, RootSchemaElement, SchemaElement, SchemaPatternProperty, SchemaProperties, schemaVersion,
	Type
} from "./schema";

export const getNodeType = (node: Node<Model>): NodeType => {
	return node.model.type;
};

export const getFieldAt = (node: Node<Model>, fieldIndex: number): Field => {
	return node.model.getFieldAt(fieldIndex);
};

export const getFieldNamed = (node: Node<Model>, name: string): Field => {
	return node.model.getFieldNamed(name);
};

export const getFieldIndex = (node: Node<Model>, field: Field) => {
	field = getField(field);
	const fields = getFields(node);
	for (let i = 0; i < fields.length; i++) {
		const f = fields[i];
		if (field.name === f.name) {
			return i;
		}
	}
	throw new Error(`Cannot find fieldIndex for field ${field.name} in node ${node.model.name}`);
};

export const getField = (f: any): Field => {
	return typeof f === 'string' ? {name: f} : f;
};

export const getFields = (node: Node<Model>): Field[] => {
	return node.model.fields;
};

export const isMapType = (node: Node<Model>): boolean => {
	return node.model.isMap();
};

export const isKeyField = (field: Field): boolean => {
	return field.key;
};

export const getKeyField = (model : ObjectMapModel | StringMapModel) : Field => {
	return model.fields.find(f => f.key)!;
};

export const getValueField = (model : StringMapModel) : Field => {
	return model.fields.find(f => !f.key)!;
};

export const findNode = (node: Node<Model>, path: any) => {
	if (path === '') {
		return node;
	}
	if (typeof path === 'string') {
		path = path.split('/');
	}
	return _findNode(node, path);
};

export const getChildren = (node: Node<TreeModel>): Node<Model>[] => {
	return node.model.children.map(modelChild => {
		let childPath = (node.path ? (node.path + '/') : '') + slugify(modelChild.name);
		return {
			model: modelChild,
			schema: node.schema.properties![slugify(modelChild.name)],
			data: node.data[slugify(modelChild.name)],
			parent: node,
			path: childPath,
			treePath: childPath,
			fieldIndex: -1,
			dataIndex: -1
		};
	});
};

export const deleteNode = (node: Node<Model>): void => {
	const parentNode = node.parent!;
	const modelChildren = (<TreeModel> parentNode.model).children!;
	for (let i = 0; i < modelChildren.length; i++) {
		const modelChild = modelChildren[i];
		if (modelChild.name === node.model.name) {
			modelChildren.splice(i, 1);
			delete parentNode.schema.properties![slugify(node.model.name)];
			delete parentNode.data[slugify(node.model.name)];
			return;
		}
	}
	throw new Error(`Could not delete node '${node.model.name}'`);
};

/**
 * Removes the last path fragment if it is a number
 *    /foo/bar/5 => /foo/bar
 *
 * @param tree
 * @param path
 * @returns {*}
 */
export const treePathAndIndex = (tree: Node<Model>, path: string): Path => {
	return _treePathAndIndex(tree, path === '' ? [] : path.split('/'), {
		fullPath: path,
		treePath: '',
		dataIndex: -1
	});
};

const _treePathAndIndex = (node: Node<Model>, path: string[], result: Path): Path => {
	if (path.length > 0) {
		const p = path[0];
		const nodeType = getNodeType(node);
		switch (nodeType) {
			case NodeType.TYPE_TREE:
				result.treePath = result.treePath === '' ? p : (result.treePath + '/' + p);
				_treePathAndIndex(_findChild(<Node<TreeModel>> node, p), path.slice(1), result);
				break;
			case NodeType.TYPE_LIST_OBJECT:
				result.dataIndex = parseInt(p);
				break;
			case NodeType.TYPE_MAP_OBJECT:
			case NodeType.TYPE_MAP_STRING:
				result.dataIndex = p;
				break;
		}
	}
	return result;
};

const _findChild = (node: Node<TreeModel>, slug: string): Node<Model> => {
	if (getNodeType(node) === NodeType.TYPE_TREE) {
		for (let i = 0; i < node.model.children.length; i++) {
			if (slugify(node.model.children[i].name) === slug) {
				let childPath = node.path + '/' + slug;
				return {
					model: node.model.children[i],
					schema: node.schema.properties![slug],
					data: node.data[slug],
					parent: node,
					path: childPath,
					treePath: childPath,
					fieldIndex: -1,
					dataIndex: -1
				};
			}
		}
	}
	throw new Error(`Could not find child with slug ${slug} in node ${node.model.name}`);
};

export const getDataItems = (node: Node<Model>): any[] => {
	switch (getNodeType(node)) {
		case NodeType.TYPE_LIST_OBJECT:
			return node.data;
		case NodeType.TYPE_TREE:
			return [ node.data ];
		case NodeType.TYPE_MAP_OBJECT:
		case NodeType.TYPE_MAP_STRING:
			return Object.values(node.data);
		default:
			throw new Error("Cannot list items for type: " + node.model.type);
	}
};

const _findNewListItemName = (node: Node<Model>, newName: string, idx: number): string => {
	const fullName = (idx === 1) ? newName : (newName + " (" + idx + ")");
	const fieldName = defaultFieldName(node.model);
	const items = getDataItems(node);
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let name = item[fieldName];
		if (name === fullName) {
			return _findNewListItemName(node, newName, idx + 1);
		}
	}
	return fullName;
};

const _findNewMapKey = (node: Node<Model>, newName: string, idx: number) => {
	const fullName = (idx === 1) ? newName : (newName + " (" + idx + ")");
	if (typeof node.data[fullName] !== 'undefined') {
		return _findNewMapKey(node, newName, idx + 1);
	}
	return fullName;
};

const _findNewNodeName = (node: Node<TreeModel>, newName: string, idx: number): string => {
	const fullName = (idx === 1) ? newName : (newName + " (" + idx + ")");
	const children = node.model.children;
	if (children) {
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			let name = child["name"];
			if (name === fullName) {
				return _findNewNodeName(node, newName, idx + 1);
			}
		}
	}
	return fullName;
};

export const addItem = (node: Node<Model>, requestedName: string) => {
	const nodeType = getNodeType(node);
	let item;
	let dataIndex;
	switch (nodeType) {
		case NodeType.TYPE_MAP_OBJECT:
			item = {};
			dataIndex = _findNewMapKey(node, requestedName, 1);
			node.data[dataIndex] = item;
			break;
		case NodeType.TYPE_MAP_STRING:
			item = "New value";
			dataIndex = _findNewMapKey(node, requestedName, 1);
			node.data[dataIndex] = item;
			break;
		case NodeType.TYPE_LIST_OBJECT:
			item = {
				[defaultFieldName(node.model)]: _findNewListItemName(node, requestedName, 1)
			};
			node.data.push(item);
			dataIndex = node.data.length - 1;
			break;
		default:
			throw new Error(`Cannot add item to node of type ${nodeType}`);
	}
	return {dataIndex, item};
};

export const addNode = (node: Node<TreeModel>, requestedName: string, nodeType: NodeType): Node<Model> => {
	const newName = _findNewNodeName(node, requestedName, 1);
	let newData;
	let newModel;
	switch (nodeType) {
		case NodeType.TYPE_TREE:
			newModel = new TreeModel(newName, [], []);
			newData = {};
			break;
		case NodeType.TYPE_MAP_OBJECT:
			newModel = new ObjectMapModel(newName, [ new Field("Key", FieldType.String, true) ]);
			newData = {};
			break;
		case NodeType.TYPE_MAP_STRING:
			newModel = new StringMapModel(newName, [
				new Field("Key", FieldType.String, true),
				new Field("Value", FieldType.String)
			]);
			newData = {};
			break;
		case NodeType.TYPE_LIST_OBJECT:
			newModel = new ListModel(newName, [ new Field("Name", FieldType.String) ]);
			newData = [];
			break;
	}
	node.model.children.push(newModel);
	node.schema.properties![slugify(newModel.name)] = _modelToSchema(newModel);
	node.data[slugify(newModel.name)] = newData;
	let path = node.path + '/' + slugify(newModel.name);
	return Object.assign(
		{},
		node,
		{
			model: newModel,
			data: newData,
			path: path,
			treePath: path,
			parent: node,
			dataIndex: -1
		}
	);
};

/**
 * Get the node holding the 'struct' data: either this node, or its parent, if the data held
 * is an 'item' (from a map or an array)
 */
const _getStructNode = (node : Node<Model>) : Node<Model> => {
	if (node.dataIndex !== -1) {
		return node.parent!;
	}
	return node;
};

export const renameNode = function (node: Node<Model>, name: string) : void {
	const previousName = node.model.name;
	node.model.name = name;
	node.schema.title = name;
	if (node.parent) {
		node.parent.data[slugify(name)] = node.parent.data[slugify(previousName)];
		const schema = node.parent.schema.properties![slugify(previousName)];
		delete node.parent.schema.properties![slugify(previousName)];
		node.parent.schema.properties![slugify(name)] = schema;
		node.path = node.parent.path ? (node.parent.path + '/' + slugify(name)) : slugify(name);
		node.treePath = node.path;
		delete node.parent.data[slugify(previousName)];
	}
};

const _checkDeleteFieldAt = (node : Node<Model>, fieldIndex: number) : Field => {
	const field = getFieldAt(node, fieldIndex);
	if (field.key) {
		throw new Error(`Cannot delete: field ${field.name} is a key field for node '${node.model.name}'`);
	}
	const nodeType = getNodeType(node);
	if (nodeType === NodeType.TYPE_MAP_STRING) {
		throw new Error(`Cannot delete: field ${field.name} is the value field for node '${node.model.name}', which is a map(string)`);
	}
	return field;
};

export const canDeleteFieldAt = (node : Node<Model>, fieldIndex : number) : boolean => {
	try {
		_checkDeleteFieldAt(node, fieldIndex);
	} catch (err) {
		return false;
	}
	return true;
};

export const deleteFieldAt = (node : Node<Model>, fieldIndex : number) : void => {
	const field = _checkDeleteFieldAt(node, fieldIndex);
	const structNode = _getStructNode(node);
	if (isItem(structNode)) {
		getDataItems(structNode).forEach(item => delete item[slugify(field.name)]);
	} else {
		delete node.data[slugify(field.name)];
	}
	node.model.fields.splice(fieldIndex, 1);
	delete getFieldHolder(node).properties![slugify(field.name)];
};

const getFieldHolder = (node: Node<Model>) : SchemaElement => {
	let nodeType = getNodeType(node);
	switch (nodeType) {
		case NodeType.TYPE_LIST_OBJECT:
			return node.schema.items!;
		case NodeType.TYPE_MAP_OBJECT:
		case NodeType.TYPE_MAP_STRING:
			return node.schema.patternProperties!['.+']!;
		case NodeType.TYPE_TREE:
			return node.schema;
	}
};

export const setValue = (node: Node<Model>, field : Field, value : any) : void  => {
	node.data[slugify(field.name)] = value;
};

export const updateFieldAt = (node : Node<Model>, fieldIndex : number, field : Field) => {
	let fieldHolder = getFieldHolder(node);
	if (typeof fieldIndex === 'undefined' || fieldIndex === -1) {
		// The field does not exist, just compute the new model index
		fieldIndex = node.model.fields.length;
		fieldHolder.properties![slugify(field.name)] = fieldToProperty(field);
	} else {
		// Field exists already, we need to perform a data refactoring
		const newField = getField(field);
		const prevField = getField(node.model.fields[fieldIndex]);
		const structNode = _getStructNode(node);
		const nodeType = getNodeType(structNode);
		if (newField.name !== prevField.name
			&& [NodeType.TYPE_LIST_OBJECT, NodeType.TYPE_MAP_OBJECT, NodeType.TYPE_TREE].includes(nodeType)
			&& !newField.key) {
			getDataItems(structNode).forEach(item => {
				item[slugify(newField.name)] = item[slugify(prevField.name)];
				delete item[slugify(prevField.name)];
			});
		}
		if (newField.type !== prevField.type) {
			getDataItems(structNode).forEach(item => {
				item[slugify(newField.name)] = _convert(item[slugify(newField.name)], prevField.type, newField.type);
			});
		}
		if (newField.key) {
			(fieldHolder as SchemaPatternProperty).keyTitle = newField.name;
		} else if (nodeType === NodeType.TYPE_MAP_STRING) {
			(fieldHolder as SchemaPatternProperty).valueTitle = newField.name;
		} else {
			delete fieldHolder.properties![slugify(prevField.name)];
			fieldHolder.properties![slugify(newField.name)] = fieldToProperty(newField);
		}
	}
	// Update the model
	node.model.fields[fieldIndex] = field;
};

const _convert = (value : any, prevFieldType : FieldType, newFieldType : FieldType) : any => {
	switch (newFieldType) {
		case FieldType.String:
		case FieldType.Markdown:
		case FieldType.TextArea:
		case FieldType.Html:
			return value ? "" + value : "";
		case FieldType.Boolean:
			return !!value;
		case FieldType.Array:
			return [value];
		default:
			throw new Error(`Unknown type: ${newFieldType}`);
	}
};

export const findDeepest = (data : any, path : string) => _findDeepest(data, ensureArray(path), 0);

const _findDeepest = (data : any, path : string, depth : number) => {
	const found = data[path[0]];
	if (found) {
		return _findDeepest(found, path.slice(1), depth + 1);
	} else {
		return {node: data, depth: depth};
	}
};

const _findNode = (node : Node<Model>, path : string[]) : Node<Model> => {
	const nodeType = getNodeType(node);
	if (path.length === 0) {
		return node;
	}
	const next = path[0];
	if (nodeType === NodeType.TYPE_TREE) {
		const parentModel : TreeModel = <TreeModel> node.model;
		for (let c = 0; c < parentModel.children.length; c++) {
			const childModel = parentModel.children[c];
			if (slugify(childModel.name) === next) {
				let treePath = (node.path ? (node.path + '/') : '') + next;
				return _findNode({
					model: childModel,
					schema: node.schema.properties![next],
					data: node.data[next] || (childModel.type === NodeType.TYPE_LIST_OBJECT ? [] : {}),
					parent: <Node<TreeModel>> node,
					path: treePath,
					treePath: treePath,
					fieldIndex: -1,
					dataIndex: -1
				}, path.slice(1));
			}
		}
		throw new Error(`Could not find child named ${next} in node ${node.model.name}`);
	} else if (nodeType === NodeType.TYPE_LIST_OBJECT) {
		const dataIndex = parseInt(next);
		return {
			model: node.model,
			schema: node.schema,
			data: node.data[dataIndex] || {},
			parent: <Node<TreeModel>> node,
			path: (node.path ? (node.path + '/') : '') + next,
			treePath: node.path,
			dataIndex: dataIndex,
			fieldIndex: -1
		};
	} else {
		// Map
		return {
			model: node.model,
			schema: node.schema,
			data: node.data[next] || (nodeType === NodeType.TYPE_MAP_OBJECT ? {} : ""),
			parent: <Node<TreeModel>> node,
			path: (node.path ? (node.path + '/') : '') + next,
			treePath: node.path,
			dataIndex: next,
			fieldIndex: -1
		};
	}
};

export const defaultFieldName = (model : Model) => {
	return slugify(model.fields[0].name);
};

export const fieldName = (field : Field) : string => slugify(field.name);

export const fieldDisplayName = (field : Field) : string => field.name;

export const slugify = (str : string) : string => str.replace(/\s/g, '_').replace(/\//g, '-').toLowerCase();

export const isItem = (node) => {
	return node.model.isItem();
};

const ensureArray = path => typeof path === 'string' ? path.split('/') : path;

export const modelToSchema = (model): RootSchemaElement => {
	const root = _modelToSchema(normalizeModel(model));
	return Object.assign({} as RootSchemaElement, { $schema: schemaVersion }, root);
};
export const _modelToSchema = (model: Model): SchemaElement => {
	const element: SchemaElement = {type: Type.TObject};
	element.title = model.name;
	if (model.type === NodeType.TYPE_TREE) {
		const treeModel: TreeModel = model as TreeModel;
		treeModel.children.forEach(child => {
			const property = slugify(child.name);
			if (!element.properties) {
				element.properties = {};
			}
			element.properties[property] = _modelToSchema(child);
		});
	}
	if (model.fields.length > 0) {
		const properties : { [s: string]: SchemaElement; } = {};
		model.fields.forEach(field => {
			if (!isKeyField(field) && model.type !== NodeType.TYPE_MAP_STRING) {
				const property = slugify(field.name);
				properties[property] = fieldToProperty(field);
			}
		});
		switch (model.type) {
			case NodeType.TYPE_TREE:
				element.properties = element.properties ? Object.assign(element.properties, properties) : properties;
				break;
			case NodeType.TYPE_LIST_OBJECT:
				element.type = Type.TArray;
				element.items = {
					type: Type.TObject,
					properties: properties
				};
				break;
			case NodeType.TYPE_MAP_OBJECT:
				element.patternProperties = {
					".+": {
						type: Type.TObject,
						properties: properties,
						keyTitle: getKeyField(model).name
					}
				};
				break;
			case NodeType.TYPE_MAP_STRING:
				element.patternProperties = {
					".+": {
						type: Type.TString,
						keyTitle: getKeyField(model).name,
						valueTitle: getValueField(model).name
					}
				};
				break;
		}
	}
	return element;
};

const fieldToProperty = (field: Field) : SchemaElement => {
	const property : SchemaElement = {
		type: fieldTypeToSchemaType(field.type),
		title: field.name
	};
	switch (field.type) {
		case FieldType.Html:
			property.format = Format.Html;
			break;
		case FieldType.Markdown:
			property.format = Format.Markdown;
			break;
		case FieldType.TextArea:
			property.format = Format.TextArea;
			break;
		default:
			break;
	}
	if (field.className) {
		property.className = field.className;
	}
	if (field.description) {
		property.description = field.description;
	}
	if (field.type === FieldType.Array) {
		property.items = {
			type: Type.TString
		}
	}
	return property;
};

const fieldTypeToSchemaType = (fieldType: FieldType) : Type => {
	switch (fieldType) {
		case FieldType.Html:
		case FieldType.Markdown:
		case FieldType.TextArea:
			return Type.TString;
		case FieldType.Array:
			return Type.TArray;
		case FieldType.String:
			return Type.TString;
		case FieldType.Boolean:
			return Type.TBoolean;
	}
};

export const migrateSchema = (object) : RootSchemaElement => {
	// Is this a schema or a old model?
	if (object.$schema) {
		return object as RootSchemaElement;
	} else {
		// This is an 'model', which is the old representation
		return modelToSchema(normalizeModel(object));
	}
};

export const schemaToModel = (schema: RootSchemaElement) : Model => {
	return _schemaToModel(schema as SchemaElement);
};

const _schemaToModel = (schema: SchemaElement) : Model => {
	let model : Model;
	switch (schema.type) {
		case Type.TObject:
			if (schema.patternProperties) {
				const patterns = schema.patternProperties['.+'] as SchemaPatternProperty;
				if (patterns.type === Type.TObject) {
					model = new ObjectMapModel(schema.title!, []);
					model.fields.push(new Field(patterns.keyTitle!, FieldType.String, true, patterns.description));
					_propertiesToFields(patterns.properties!, model);
				} else {
					model = new StringMapModel(schema.title!, []);
					model.fields.push(new Field(patterns.keyTitle!, FieldType.String, true, patterns.description));
					model.fields.push(new Field(patterns.valueTitle!, FieldType.String));
				}
			} else {
				model = new TreeModel(schema.title!, [], []);
			}
			break;
		case Type.TArray:
			model = new ListModel(schema.title!, []);
			_propertiesToFields(schema.items!.properties!, model);
			break;
		default:
			throw new Error(`Don't know what to do with element named ${schema.title} and type ${schema.type}`);
	}
	if (schema.properties) {
		_propertiesToFields(schema.properties, model);
	}
	return model;
};

const _propertiesToFields = (properties : { [s: string]: SchemaElement; }, model : Model) => {
	for (let key in properties) {
		const element = properties[key];
		switch (element.type) {
			case Type.TString:
				let fieldType = FieldType.String;
				if (element.format === Format.Markdown) {
					fieldType = FieldType.Markdown;
				} else if (element.format === Format.Html) {
					fieldType = FieldType.Html;
				} else if (element.format === Format.TextArea) {
					fieldType = FieldType.TextArea;
				}
				model.fields.push(new Field(element.title!, fieldType, false, element.description, element.className));
				break;
			case Type.TBoolean:
				model.fields.push(new Field(element.title!, FieldType.Boolean, false, element.description, element.className));
				break;
			case Type.TArray:
				if (element.items!.type === Type.TString) {
					model.fields.push(new Field(element.title!, FieldType.Array, false, element.description, element.className));
				} else {
					(model as TreeModel).children.push(_schemaToModel(element));
				}
				break;
			default:
				(model as TreeModel).children.push(_schemaToModel(element));
				break;
//				throw new Error(`Unknown field type: ${element.type} for element named ${element.title}`);
		}
	}
};
