export const TYPE_TREE = "tree";
export const TYPE_MAP_OBJECT = "map<object>";
export const TYPE_MAP_STRING = "map<string>";
export const TYPE_LIST_OBJECT = "list<object>";

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
	const modelNode = _findModel(node.model, path);
	let dataNode = findData(node.data, path);
	if (!dataNode) {
		fillPath(node.data, path, modelNode.type);
		dataNode = findData(node.data, path);
	}
	return {
		model: modelNode,
		data: dataNode,
		path: path
	};
};

export const deepCopy = (tree) => {
	// For now, use JSON parse/stringify.
	// If performance becomes an issue, we could write our own custom deep copy
	// See https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
	return JSON.parse(JSON.stringify(tree));
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
	let res = _treePathAndIndex(tree, path.split('/'), {
		fullPath: path,
		treePath: [],
		index: -1
	});
	res.treePath = res.treePath.join('/');
	return res;
};

const _treePathAndIndex = function(node, path, result) {
	if (path.length > 0) {
		const p = path[0];
		if (node.model.children && node.model.children.length > 0) {
			result.treePath = [ ...result.treePath, p ];
			_treePathAndIndex(_findChild(node, p), path.slice(1), result);
		} else {
			switch (getNodeType(node)) {
				case TYPE_LIST_OBJECT:
					result.index = parseInt(p);
					break;
				case TYPE_MAP_OBJECT:
				case TYPE_MAP_STRING:
					result.index = p;
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

const _items = (node) => {
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
	const items = _items(node);
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
	let index;
	switch (nodeType) {
		case TYPE_MAP_OBJECT:
			item = {};
			index = _findNewMapKey(node, requestedName, 1);
			node.data[index] = item;
			break;
		case TYPE_MAP_STRING:
			item = "New value";
			index = _findNewMapKey(node, requestedName, 1);
			node.data[index] = item;
			break;
		case TYPE_LIST_OBJECT:
			item = {
				[defaultFieldName(node.model)] : _findNewListItemName(node, requestedName, 1)
			};
			node.data.push(item);
			index = node.data.length - 1;
			break;
		default:
			throw new Error(`Cannot add item to node of type ${nodeType}`);
	}
	return { index, item };
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
			data: newData
		}
	);
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

export const fillPath = (data, path, type) => {
	path = ensureArray(path);
	let found = findDeepest(data, path);
	data = found.node;
	let depth = found.depth;
	path = path.slice(depth);
	for (let i = 0; i < path.length; i++) {
		const p = path[i];
		if (i === path.length - 1) {
			if (!Number.isNaN(parseInt(p))) {
				// This is a number: we don't want to fill in anything here...
				break;
			} else {
				data[p] = (type === TYPE_LIST_OBJECT) ? [] : {};
			}
		} else {
			data[p] = {};
		}
		data = data[p];
	}
};

const _findModel = (model, path) => {
	if (model.children) {
		for (let c = 0; c < model.children.length; c++) {
			const child = model.children[c];
			if (slugify(child.name) === path[0]) {
				return _findModel(child, path.slice(1));
			}
		}
	}
	if (path.length === 0) {
		return model;
	} else if (path.length === 1) {
		return model;
	}
	return null;
};

export const defaultFieldName = (model) => {
		const field = model.fields[0];
		if (typeof field === 'object') {
			return slugify(field.name);
		} else {
			return slugify(field);
		}
};

const _findKey = (model) => {
	if (model.fields && model.fields.length > 0) {
		let keys = model.fields.filter(f => f.key);
		if (keys.length === 1) {
			return keys[0];
		}
	}
	throw new Error(`Could not find a field marked as key for model ${model.name}`);
};

export const fieldName = (field) => (typeof field === 'string') ? slugify(field) : slugify(field.name);

export const fieldDisplayName = (field) => (typeof field === 'string') ? field : field.name;

export const slugify = (str) => str.replace(/\s/g, '_').replace(/\//g, '-').toLowerCase();

export const findData = (data, path) => {
	if (!data) {
		return null;
	}
	const key = path[0];
	const found = Array.isArray(data) ? data[parseInt(key)] : data[key];
	if (path.length === 1) {
		return found;
	} else {
		return findData(found, path.slice(1));
	}
};

export const isItem = (node) => [TYPE_LIST_OBJECT, TYPE_MAP_OBJECT, TYPE_MAP_STRING].includes(getNodeType(node));

const ensureArray = path => typeof path === 'string' ? path.split('/') : path;
