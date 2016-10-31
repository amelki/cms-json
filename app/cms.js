var cms = {};
module.exports = cms;

cms.findNode = function(model, data, path) {
	if (typeof path === 'string') {
		path = path.split('/');
	}
	var modelNode = this._findModel(model, path);
	var dataNode = this.findData(data, path);
	if (!dataNode) {
		this.fillPath(data, path, modelNode.list);
		dataNode = this.findData(data, path);
	}
	return {
		model: modelNode,
		data: dataNode
	};
};

/**
 * Removes the last path fragment if it is a number
 * 		/foo/bar/5 => /foo/bar
 *
 * @param path
 * @returns {*}
 */
cms.treePath = function (path) {
	if (path && path.length > 0) {
		var p = path.split('/');
		if (p.length > 0 && !Number.isNaN(parseInt(p[p.length - 1]))) {
			return p.slice(0, p.length - 1).join('/');
		}
	}
	return path;
};

cms.addItem = function(node) {
	var item = {};
	item[this.defaultFieldName(node.model)] = "New Item";
	node.data[node.data.length] = item;
	return item;
};

cms.deleteItem = function(node, index) {
	node.data.splice(index, 1);
};

cms.findDeepest = function(node, path) {
	path = ensureArray(path);
	return _findDeepest(node, path, 0);
};

function _findDeepest(node, path, depth) {
	var found = node[path[0]];
	if (found) {
		return _findDeepest(found, path.slice(1), depth + 1);
	} else {
		return { node: node, depth: depth };
	}
}

cms.fillPath = function(data, path, list) {
	path = ensureArray(path);
	var i;
	var found = this.findDeepest(data, path);
	data = found.node;
	var depth = found.depth;
	path = path.slice(depth);
	for (i in path) {
		var p = path[i];
		if (i == path.length - 1) { 
			if (!Number.isNaN(parseInt(p))) {
				// This is a number: we don't want to fill in anything here...
				break;
			} else {
				data[p] = list ? [] : {};
			}
		} else {
			data[p] = {};
		}
		data = data[p];
	}
};

cms._findModel = function(node, path) {
	for (var c in node.children) {
		var child = node.children[c];
		if (this.slugify(child.name) == path[0]) {
			return this._findModel(child, path.slice(1));
		}
	}
	if (path.length == 0) {
		return node;
	} else if (path.length == 1) {
		if (!Number.isNaN(parseInt(path[0]))) {
			return node;
		}
	}
	return null;
};

cms.defaultFieldName = function(model) {
	var field = model.fields[0];
	if (typeof field == 'object') {
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

cms.findData = function (node, path) {
	if (!node) {
		return null;
	}
	var key = path[0];
	var found = Array.isArray(node) ? node[parseInt(key)] : node[key];
	if (path.length == 1) {
		return found;
	} else {
		return cms.findData(found, path.slice(1));
	}
};

function ensureArray(path) {
	if (typeof path === 'string') {
		return path.split('/');
	}
	return path;
}
