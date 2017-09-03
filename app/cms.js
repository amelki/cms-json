export const TYPE_TREE = "tree";
export const TYPE_MAP = "map";
export const TYPE_LIST = "list";

export const nodeType = (node) => {
	if (node.model.type) {
		return node.model.type;
	} else {
		if (node.model.list) {
			return TYPE_LIST;
		} else {
			return TYPE_TREE;
		}
	}
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
			switch (nodeType(node)) {
				case TYPE_LIST:
					result.index = parseInt(p);
					break;
				case TYPE_MAP:
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
	switch (nodeType(node)) {
		case TYPE_LIST:
			return node.data;
		case TYPE_MAP:
			return Object.values(node.data);
		default:
			throw new Error("Cannot list items for type: " + node.model.type);
	}
};

export const findNewName = (node, newName, idx) => {
	let fieldName = defaultFieldName(node.model);
	let items = _items(node);
	let fullName = (idx === 1) ? newName : (newName + " (" + idx + ")");
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let name = item[fieldName];
		if (name === fullName) {
			return findNewName(node, newName, idx + 1);
		}
	}
	return fullName;
};

export const findNewNodeName = (node, newName, idx) => {
	const fullName = (idx === 1) ? newName : (newName + " (" + idx + ")");
	const children = node.model.children;
	if (children) {
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			let name = child["name"];
			if (name === fullName) {
				return findNewNodeName(node, newName, idx + 1);
			}
		}
	}
	return fullName;
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
				data[p] = (type === TYPE_LIST) ? [] : {};
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

export const isItem = (node) => nodeType(node) === TYPE_LIST || nodeType(node) === TYPE_MAP;

const ensureArray = path => typeof path === 'string' ? path.split('/') : path;
