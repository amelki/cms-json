import {Field, FieldType, ListModel, Model, NodeType, ObjectMapModel, StringMapModel, TreeModel} from '../app/model';

export interface Node<M extends Model> {
	model: M;
	data: any;
	parent: Node<TreeModel>;
	path: string,
	treePath: string,
	fieldIndex: number,
	dataIndex: any
}

interface Path {
	fullPath: string,
	treePath: string[],
	dataIndex: any
}

export const getNodeType = <M extends Model>(node: Node<M>): NodeType => {
	return node.model.type;
};

export const getFieldAt = <M extends Model>(node: Node<M>, fieldIndex: number): Field => {
	return node.model.getFieldAt(fieldIndex);
};

export const getFieldNamed = <M extends Model>(node: Node<M>, name: string): Field => {
	return node.model.getFieldNamed(name);
};

export const getFieldIndex = <M extends Model>(node: Node<M>, field: Field) => {
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

export const getFields = <M extends Model> (node: Node<M>): Field[] => {
	return node.model.fields;
};

export const isMapType = <M extends Model> (node: Node<M>): boolean => {
	return node.model.isMap();
};

export const isKeyField = (field: Field): boolean => {
	return field.key;
};

export const findNode = <M extends Model> (node: Node<M>, path: any) => {
	if (path === '') {
		return node;
	}
	if (typeof path === 'string') {
		path = path.split('/');
	}
	return _findNode(node, path);
};

export const getChildren = <M extends Model>  (node: Node<TreeModel>): Node<M>[] => {
	return node.model.children.map(modelChild => {
		let childPath = (node.path ? (node.path + '/') : '') + slugify(modelChild.name);
		return <Node<M>> {
			model: modelChild,
			data: node.data[slugify(modelChild.name)],
			parent: node,
			path: childPath,
			treePath: childPath,
			fieldIndex: -1
		};
	});
};

export const deleteNode = <M extends Model> (node: Node<M>): void => {
	const parentNode = node.parent;
	const modelChildren = (<TreeModel> parentNode.model).children!;
	for (let i = 0; i < modelChildren.length; i++) {
		const modelChild = modelChildren[i];
		if (modelChild.name === node.model.name) {
			modelChildren.splice(i, 1);
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
export const treePathAndIndex = <M extends Model> (tree: Node<Model>, path: string): Path => {
	let res = _treePathAndIndex(tree, path.split('/'), {
		fullPath: path,
		treePath: [],
		dataIndex: -1
	});
	return res;
};

const _treePathAndIndex = (node: Node<Model>, path: string[], result: Path): Path => {
	if (path.length > 0) {
		const p = path[0];
		const nodeType = getNodeType(node);
		switch (nodeType) {
			case NodeType.TYPE_TREE:
				result.treePath = [ ...result.treePath , p ];
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

const _findChild = <M extends Model> (node: Node<TreeModel>, slug: string): Node<M> => {
	if (getNodeType(node) === NodeType.TYPE_TREE) {
		for (let i = 0; i < node.model.children.length; i++) {
			if (slugify(node.model.children[i].name) === slug) {
				let childPath = node.path + '/' + slug;
				return <Node<M>> {
					model: node.model.children[i],
					data: node.data[slug],
					parent: node,
					path: childPath,
					treePath: childPath,
					fieldIndex: -1
				};
			}
		}
	}
	throw new Error(`Could not find child with slug ${slug} in node ${node.model.name}`);
};

export const getDataItems = <M extends Model> (node: Node<M>): any[] => {
	switch (getNodeType(node)) {
		case NodeType.TYPE_LIST_OBJECT:
			return node.data;
		case NodeType.TYPE_MAP_OBJECT:
		case NodeType.TYPE_MAP_STRING:
			return Object.values(node.data);
		default:
			throw new Error("Cannot list items for type: " + node.model.type);
	}
};

const _findNewListItemName = <M extends Model> (node: Node<M>, newName: string, idx: number): string => {
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

const _findNewMapKey = <M extends Model> (node: Node<M>, newName: string, idx: number) => {
	const fullName = (idx === 1) ? newName : (newName + " (" + idx + ")");
	if (typeof node.data[fullName] !== 'undefined') {
		return _findNewMapKey(node, newName, idx + 1);
	}
	return fullName;
};

const _findNewNodeName = <M extends TreeModel> (node: Node<M>, newName: string, idx: number): string => {
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

export const addItem = <M extends Model> (node: Node<M>, requestedName: string) => {
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

export const addNode = <M extends Model> (node: Node<TreeModel>, requestedName: string, nodeType: NodeType): Node<M> => {
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
		return node.parent;
	}
	return node;
};

export const renameNode = function (node: Node<Model>, name: string) : void {
	const previousName = node.model.name;
	node.model.name = name;
	if (node.parent) {
		node.parent.data[slugify(name)] = node.parent.data[slugify(previousName)];
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
	getDataItems(structNode).forEach(item => delete item[slugify(field.name)]);
	node.model.fields.splice(fieldIndex, 1);
};

export const updateFieldAt = (node : Node<Model>, fieldIndex : number, field : Field) => {
	if (typeof fieldIndex === 'undefined' || fieldIndex === -1) {
		// The field does not exist, just compute the new model index
		fieldIndex = node.model.fields.length;
	} else {
		// Field exists already, we need to perform a data refactoring
		const newField = getField(field);
		const prevField = getField(node.model.fields[fieldIndex]);
		const structNode = _getStructNode(node);
		const nodeType = getNodeType(structNode);
		if (newField.name !== prevField.name
			&& [NodeType.TYPE_LIST_OBJECT, NodeType.TYPE_MAP_OBJECT].includes(nodeType)
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
	}
	// Update the model
	node.model.fields[fieldIndex] = field;
};

const _convert = (value : any, prevFieldType : FieldType, newFieldType : FieldType) : any => {
	switch (newFieldType) {
		case FieldType.String:
		case FieldType.Markdown:
		case FieldType.TextArea:
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
				return _findNode(<Node<Model>> {
					model: childModel,
					data: node.data[next] || (childModel.type === NodeType.TYPE_LIST_OBJECT ? [] : {}),
					parent: <Node<TreeModel>> node,
					path: treePath,
					treePath: treePath,
					dataIndex: -1
				}, path.slice(1));
			}
		}
		throw new Error(`Could not find child named ${next} in node ${node.model.name}`);
	} else if (nodeType === NodeType.TYPE_LIST_OBJECT) {
		const dataIndex = parseInt(next);
		return <Node<Model>> {
			model: node.model,
			data: node.data[dataIndex] || {},
			parent: <Node<TreeModel>> node,
			path: (node.path ? (node.path + '/') : '') + next,
			treePath: node.path,
			dataIndex: dataIndex
		};
	} else {
		// Map
		return <Node<Model>> {
			model: node.model,
			data: node.data[next] || (nodeType === NodeType.TYPE_MAP_OBJECT ? {} : ""),
			parent: <Node<TreeModel>> node,
			path: (node.path ? (node.path + '/') : '') + next,
			treePath: node.path,
			dataIndex: next
		};
	}
};

export const defaultFieldName = (model : Model) => {
	return slugify(model.fields[0].name);
};

// const _findKey = (model) => {
// 	if (model.fields && model.fields.length > 0) {
// 		let keys = model.fields.filter(f => f.key);
// 		if (keys.length === 1) {
// 			return keys[0];
// 		}
// 	}
// 	throw new Error(`Could not find a field marked as key for model ${model.name}`);
// };

export const fieldName = (field : Field) : string => slugify(field.name);

export const fieldDisplayName = (field : Field) : string => field.name;

export const slugify = (str : string) : string => str.replace(/\s/g, '_').replace(/\//g, '-').toLowerCase();

export const isItem = (node) => node.model.isItem();

const ensureArray = path => typeof path === 'string' ? path.split('/') : path;
