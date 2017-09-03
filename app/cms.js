const cms = {};
module.exports = cms;

cms.TYPE_TREE = "tree";
cms.TYPE_MAP = "map";
cms.TYPE_LIST = "list";

cms.nodeType = function(node) {
	if (node.model.type) {
		return node.model.type;
	} else {
		if (node.model.list) {
			return cms.TYPE_LIST;
		} else {
			return cms.TYPE_TREE;
		}
	}
};

cms.findNode = function(node, path) {
	if (typeof path === 'string') {
		path = path.split('/');
	}
	const modelNode = this._findModel(node.model, path);
	let dataNode = this.findData(node.data, path);
	if (!dataNode) {
		this.fillPath(node.data, path, modelNode.type);
		dataNode = this.findData(node.data, path);
	}
	return {
		model: modelNode,
		data: dataNode,
		path: path
	};
};

cms.deepCopy = function(tree) {
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
cms.treePathAndIndex = function (tree, path) {
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
			switch (cms.nodeType(node)) {
				case cms.TYPE_LIST:
					result.index = parseInt(p);
					break;
				case cms.TYPE_MAP:
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
		if (cms.slugify(node.model.children[i].name) === slug) {
			return { model: node.model.children[i], data: node.data[slug], parent: node };
		}
	}
	throw new Error(`Could not find child with slug ${slug} in node ${node.model.name}`);
};

cms.addItem = function(node) {
	const item = {};
	item[this.defaultFieldName(node.model)] = this.findNewName(node, "New " + node.model.name, 1);
	node.data[node.data.length] = item;
	return item;
};

cms.moveItem = function(node, sourceIndex, targetIndex) {
	const source = node.data[sourceIndex];
	node.data[sourceIndex] = node.data[targetIndex];
	node.data[targetIndex] = source;
};

cms.items = function(node) {
	switch (cms.nodeType(node)) {
		case cms.TYPE_LIST:
			return node.data;
		case cms.TYPE_MAP:
			return Object.values(node.data);
		default:
			throw new Error("Cannot list items for type: " + node.model.type);
	}
};

cms.findNewName = function(node, newName, idx) {
	let fieldName = this.defaultFieldName(node.model);
	let items = cms.items(node);
	let fullName = (idx === 1) ? newName : (newName + " (" + idx + ")");
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let name = item[fieldName];
		if (name === fullName) {
			return this.findNewName(node, newName, idx + 1);
		}
	}
	return fullName;
};

cms.findNewNodeName = function(node, newName, idx) {
	const fullName = (idx === 1) ? newName : (newName + " (" + idx + ")");
	const children = node.model.children;
	if (children) {
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			let name = child["name"];
			if (name === fullName) {
				return this.findNewNodeName(node, newName, idx + 1);
			}
		}
	}
	return fullName;
};

cms.deleteItem = function(node, index) {
	node.data.splice(index, 1);
};

cms.findDeepest = function(node, path) {
	path = ensureArray(path);
	return _findDeepest(node, path, 0);
};

const _findDeepest = (node, path, depth) => {
	const found = node[path[0]];
	if (found) {
		return _findDeepest(found, path.slice(1), depth + 1);
	} else {
		return { node: node, depth: depth };
	}
};

cms.fillPath = function(data, path, type) {
	path = ensureArray(path);
	let found = this.findDeepest(data, path);
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
				data[p] = (type === cms.TYPE_LIST) ? [] : {};
			}
		} else {
			data[p] = {};
		}
		data = data[p];
	}
};

cms._findModel = function(model, path) {
	if (model.children) {
		for (let c = 0; c < model.children.length; c++) {
			const child = model.children[c];
			if (this.slugify(child.name) === path[0]) {
				return this._findModel(child, path.slice(1));
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

cms.defaultFieldName = function(model) {
	const field = model.fields[0];
	if (typeof field === 'object') {
		return this.slugify(field.name);
	} else {
		return this.slugify(field);
	}
};

cms.fieldName = function(field) {
	return (typeof field === 'string') ? this.slugify(field) : this.slugify(field.name);
};

cms.fieldDisplayName = function(field) {
	return (typeof field === 'string') ? field : field.name;
};

cms.slugify = function(str) {
	return str.replace(/\s/g, '_').replace(/\//g, '-').toLowerCase();
};

cms.findData = function (data, path) {
	if (!data) {
		return null;
	}
	const key = path[0];
	const found = Array.isArray(data) ? data[parseInt(key)] : data[key];
	if (path.length === 1) {
		return found;
	} else {
		return cms.findData(found, path.slice(1));
	}
};

cms.isItem = function (node) {
	const nodeType = cms.nodeType(node);
	return nodeType === cms.TYPE_LIST || nodeType === cms.TYPE_MAP;
};

function ensureArray(path) {
	if (typeof path === 'string') {
		return path.split('/');
	}
	return path;
}
