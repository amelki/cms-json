var tree = {};
module.exports = tree;

tree.findDeepest = function(node, path) {
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

tree.fillPath = function(data, path, array) {
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
				break;
			} else {
				data[p] = [];
			}
		} else {
			data[p] = {};
		}
		data = data[p];
	}
};

tree.findData = function (node, path) {
	if (!node) {
		return null;
	}
	var key = path[0];
	var found = Array.isArray(node) ? node[parseInt(key)] : node[key];
	if (path.length == 1) {
		return found;
	} else {
		return tree.findData(found, path.slice(1));
	}
};


function ensureArray(path) {
	if (typeof path === 'string') {
		return path.split('/');
	}
	return path;
}
