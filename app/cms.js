export const TYPE_TREE = "tree";
export const TYPE_MAP_OBJECT = "map<object>";
export const TYPE_MAP_STRING = "map<string>";
export const TYPE_LIST_OBJECT = "list<object>";
export const FIELD_TYPE_STRING = "string";
export const FIELD_TYPE_BOOLEAN = "boolean";
export const FIELD_TYPE_ARRAY = "array";
export const FIELD_TYPE_MARKDOWN = "markdown";

export const getNodeType = (node) => {
	if (node.model.type) {
		return node.model.type;
	} else {
		if (node.model.list) { // legacy
			return TYPE_LIST_OBJECT;
		} else {
			return TYPE_TREE;
		}
	}
};

export const getFieldAt = (node, fieldIndex) => {
	if (fieldIndex < 0) {
		throw new Error(`Negative field index`);
	}
	if (node.model.fields && fieldIndex < node.model.fields.length) {
		return getField(node.model.fields[fieldIndex]);
	}
	throw new Error(`No field at index ${fieldIndex} for node ${node.name}`);
};

export const getFieldNamed = (node, name) => {
	return getFields(node).filter(f => f.name === name)[0];
};

export const getFieldIndex = (node, field) => {
	field = getField(field);
	const fields = getFields(node);
	for (let i = 0; i < fields.length; i++) {
		const f = fields[i];
		if (field.name === f.name) {
			return i;
		}
	}
	throw new Error(`Cannot find fieldIndex for field ${field.name} in node ${node.name}`);
};

export const getField = (f) => {
	return typeof f === 'string' ? { name: f } : f;
};

export const getFields = (node) => {
	const fields = node.model.fields;
	if (fields) {
		return fields.map(f => typeof f === 'string' ? { name: f } : f);
	}
	return fields;
};

export const isMapType = (node) => {
	const nodeType = getNodeType(node);
	return [ TYPE_MAP_STRING, TYPE_MAP_OBJECT ].includes(nodeType);
};

export const isKeyField = (field) => {
	return typeof field === 'object' && field.key;
};

export const findNode = (node, path) => {
	if (typeof path === 'string') {
		path = path.split('/');
	}
	return _findNode(node, path);
};

export const getChildren = (node) => {
	const children = [];
	if (node.model.children && node.model.children.length > 0) {
		node.model.children.forEach(modelChild => {
			children.push({
				model: modelChild,
				data: node.data[slugify(modelChild.name)],
				parent: node,
				path: (node.path ? (node.path + '/') : '') + slugify(modelChild.name),
				fieldIndex: -1
			});
		});
	}
	return children;
};

export const deleteNode = (node) => {
	const parentNode = node.parent;
	const modelChildren = parentNode.model.children;
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
 * 		/foo/bar/5 => /foo/bar
 *
 * @param tree
 * @param path
 * @returns {*}
 */
export const treePathAndIndex = (tree, path) => {
	let res = _treePathAndIndex(tree, Array.isArray(path) ? path : path.split('/'), {
		fullPath: path,
		treePath: [],
		dataIndex: -1
	});
	res.treePath = res.treePath.join('/');
	return res;
};

export const isSelectionItem = (selection) => selection.dataIndex !== -1;

const _treePathAndIndex = function(node, path, result) {
	if (path.length > 0) {
		const p = path[0];
		if (node.model.children && node.model.children.length > 0) {
			result.treePath = [ ...result.treePath, p ];
			_treePathAndIndex(_findChild(node, p), path.slice(1), result);
		} else {
			switch (getNodeType(node)) {
				case TYPE_LIST_OBJECT:
					result.dataIndex = parseInt(p);
					break;
				case TYPE_MAP_OBJECT:
				case TYPE_MAP_STRING:
					result.dataIndex = p;
					break;
				default:
					throw new Error('No child for path ${path}');
			}
		}
	}
	return result;
};

const _findChild = (node, slug) => {
	for (let i = 0; i < node.model.children.length; i++) {
		if (slugify(node.model.children[i].name) === slug) {
			return { model: node.model.children[i], data: node.data[slug], parent: node };
		}
	}
	throw new Error(`Could not find child with slug ${slug} in node ${node.model.name}`);
};

export const getDataItems = (node) => {
	switch (getNodeType(node)) {
		case TYPE_LIST_OBJECT:
			return node.data;
		case TYPE_MAP_OBJECT:
		case TYPE_MAP_STRING:
			return Object.values(node.data);
		default:
			throw new Error("Cannot list items for type: " + node.model.type);
	}
};

const _findNewListItemName = (node, newName, idx) => {
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

const _findNewMapKey = (node, newName, idx) => {
	const fullName = (idx === 1) ? newName : (newName + " (" + idx + ")");
	if (typeof node.data[fullName] !== 'undefined') {
		return _findNewMapKey(node, newName, idx + 1);
	}
	return fullName;
};

const _findNewNodeName = (node, newName, idx) => {
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

export const addItem = (node, requestedName) => {
	const nodeType = getNodeType(node);
	let item;
	let dataIndex;
	switch (nodeType) {
		case TYPE_MAP_OBJECT:
			item = {};
			dataIndex = _findNewMapKey(node, requestedName, 1);
			node.data[dataIndex] = item;
			break;
		case TYPE_MAP_STRING:
			item = "New value";
			dataIndex = _findNewMapKey(node, requestedName, 1);
			node.data[dataIndex] = item;
			break;
		case TYPE_LIST_OBJECT:
			item = {
				[defaultFieldName(node.model)] : _findNewListItemName(node, requestedName, 1)
			};
			node.data.push(item);
			dataIndex = node.data.length - 1;
			break;
		default:
			throw new Error(`Cannot add item to node of type ${nodeType}`);
	}
	return { dataIndex, item };
};

export const addNode = (node, requestedName, nodeType) => {
	const newModel = {
		name : _findNewNodeName(node, requestedName, 1),
		type: nodeType
	};
	let newData;
	switch (nodeType) {
		case TYPE_TREE:
			newModel.children = [];
			newData = {};
			break;
		case TYPE_MAP_OBJECT:
			newModel.fields = [ { name: "Key", key: true } ];
			newData = {};
			break;
		case TYPE_MAP_STRING:
			newModel.fields = [ { name: "Key", key: true }, "Value" ];
			newData = {};
			break;
		case TYPE_LIST_OBJECT:
			newModel.fields = [ "Name" ];
			newData = [];
			break;
	}
	if (!node.model.children) {
		node.model.children = [];
	}
	node.model.children.push(newModel);
	node.data[slugify(newModel.name)] = newData;
	return Object.assign(
		{},
		node,
		{
			model: newModel,
			data: newData,
			path: node.path + '/' + slugify(newModel.name),
			parent: node,
			dataIndex: -1
		}
	);
};

/**
 * Get the node holding the 'struct' data: either this node, or its parent, if the data held
 * is an 'item' (from a map or an array)
 */
const _getStructNode = (node) => {
	if (node.dataIndex !== -1) {
		return node.parent;
	}
	return node;
};

const _checkDeleteFieldAt = (node, fieldIndex) => {
	const field = getFieldAt(node, fieldIndex);
	if (field.key) {
		throw new Error(`Cannot delete: field ${field.name} is a key field for node '${node.name}'`);
	}
	const nodeType = getNodeType(node);
	if (nodeType === TYPE_MAP_STRING) {
		throw new Error(`Cannot delete: field ${field.name} is the value field for node '${node.name}', which is a map(string)`);
	}
	return field;
};

export const canDeleteFieldAt = (node, fieldIndex) => {
	try {
		_checkDeleteFieldAt(node, fieldIndex);
	} catch (err) {
		return false;
	}
	return true;
};

export const deleteFieldAt = (node, fieldIndex) => {
	const field = _checkDeleteFieldAt(node, fieldIndex);
	const structNode = _getStructNode(node);
	getDataItems(structNode).forEach(item => delete item[slugify(field.name)]);
	node.model.fields.splice(fieldIndex, 1);
};

export const updateFieldAt = (node, fieldIndex, field) => {
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
			&& [TYPE_LIST_OBJECT, TYPE_MAP_OBJECT].includes(nodeType)
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

const _convert = (value, prevFieldType, newFieldType) => {
	switch (newFieldType) {
		case FIELD_TYPE_STRING:
		case FIELD_TYPE_MARKDOWN:
			return value ? "" + value : "";
		case FIELD_TYPE_BOOLEAN:
			return !!value;
		case FIELD_TYPE_ARRAY:
			return [ value ];
		default:
			throw new Error(`Unknown type: ${newFieldType}`);
	}
};

export const findDeepest = (node, path) => _findDeepest(node, ensureArray(path), 0);

const _findDeepest = (node, path, depth) => {
	const found = node[path[0]];
	if (found) {
		return _findDeepest(found, path.slice(1), depth + 1);
	} else {
		return { node: node, depth: depth };
	}
};

const _findNode = (node, path) => {
	const nodeType = getNodeType(node);
	if (path.length === 0) {
		return node;
	}
	const next = path[0];
	if (nodeType === TYPE_TREE) {
		for (let c = 0; c < node.model.children.length; c++) {
			const childModel = node.model.children[c];
			if (slugify(childModel.name) === next) {
				return _findNode({
					model: childModel,
					data: node.data[next] || (getNodeType(childModel) === TYPE_LIST_OBJECT ? [] : {}),
					parent: node,
					path: (node.path ? (node.path + '/') : '') + next,
					dataIndex: -1
				}, path.slice(1));
			}
		}
		throw new Error(`Could not find child named ${next} in node ${node.model.name}`);
	} else if (nodeType === TYPE_LIST_OBJECT) {
		const dataIndex = parseInt(next);
		return {
			model: node.model,
			data: node.data[dataIndex] || {},
			parent: node,
			path: (node.path ? (node.path + '/') : '') + next,
			dataIndex: dataIndex
		};
	} else {
		// Map
		return {
			model: node.model,
			data: node.data[next] || (nodeType === TYPE_MAP_OBJECT ? {} : ""),
			parent: node,
			path: (node.path ? (node.path + '/') : '') + next,
			dataIndex: next
		};
	}
};

export const defaultFieldName = (model) => {
		const field = model.fields[0];
		if (typeof field === 'object') {
			return slugify(field.name);
		} else {
			return slugify(field);
		}
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

export const fieldName = (field) => (typeof field === 'string') ? slugify(field) : slugify(field.name);

export const fieldDisplayName = (field) => (typeof field === 'string') ? field : field.name;

export const slugify = (str) => str.replace(/\s/g, '_').replace(/\//g, '-').toLowerCase();

export const isItem = (node) => [TYPE_LIST_OBJECT, TYPE_MAP_OBJECT, TYPE_MAP_STRING].includes(getNodeType(node));

const ensureArray = path => typeof path === 'string' ? path.split('/') : path;
