'use strict';

var request = require('request');
var fs = require('fs');

module.exports = function() {
	this.findNode = function(path) {
		var _this = this;
		return {
			model: this._findModel(this._model, path),
			data: this._findData(this._data, path)
		};
	};
	this._findModel = function (node, path) {
		for (var c in node.children) {
			var child = node.children[c];
			if (slugify(child.name) == path[0]) {
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

	this._findData = function (node, path) {
		var key = path[0];
		var found = Array.isArray(node) ? node[parseInt(key)] : node[key];
		if (path.length == 1) {
			return found;
		} else {
			return this._findData(found, path.slice(1));
		}
	};

	this.init = function (modelFile, dataFile) {
		var _this = this;
		return Promise.all([
			loadResource(modelFile).then(model => {
				if (model && model.length > 0) {
					_this._model = JSON.parse(model);
				} else {
					console.log("Model file is empty...");
				}
			}),
			loadResource(dataFile).then(data => {
				if (data && data.length > 0) {
					_this._data = JSON.parse(data);
				} else {
					console.log("Data file is empty...");
				}
			})
		]).then(x => { return Promise.resolve(_this); });
	};

	this.tree = function() {
		var out = new PrettyPrinter();
		for (var c in this._model.children) {
			this._tree(this._model.children[c], out, "");
		}
		return out.toString();
	};
	
	this.model = function() {
		return this._model;
	};
	this.data = function() {
		return this._data;
	};

	function PrettyPrinter() {
		this._buffer = [];
		this._indent = 0;
	}
	PrettyPrinter.prototype._print = function(str, newLine) {
		var s = "";
		if (this._indent) {
			for (var i = 0; i < this._indent; i++) {
				s += '  ';
			}
		}
		s += str;
		if (newLine) {
			s += '\n';
		}
		this._buffer.push(s);
	};
	PrettyPrinter.prototype.print = function(str) {
		this._print(str, false);
	};
	PrettyPrinter.prototype.println = function(str) {
		this._print(str, true);
	};
	PrettyPrinter.prototype.toString = function() {
		return this._buffer.join('');
	};
	PrettyPrinter.prototype.indent = function() {
		this._indent = this._indent + 1;
	};
	PrettyPrinter.prototype.unindent = function() {
		this._indent = this._indent - 1;
	};

	this._tree = function (n, out, path) {
		var newPath = path + "/" + slugify(n.name);
		out.println("<li>");
		var prefix = (n.children || n.list) ? "/node" : "/item";
		out.println("  <a href='" + prefix + newPath + "'>" + n.name + "</a>");
		if (n.children) {
			out.println("  <ul>");
			out.indent();
			for (var c in n.children) {
				this._tree(n.children[c], out, newPath);
			}
			out.unindent();
			out.println("  </ul>");
		}
		out.println("</li>");
	};
	
	this.defautFieldName = function(model) {
		var field = model.fields[0];
		if (typeof field == 'object') {
			return field.name;
		} else {
			return field;
		}
	};
	
	function slugify(str) {
		return str.replace(/\s/g, '_').replace(/\//g, '-').toLowerCase();
	}

	function loadResource(path) {
		return new Promise(function (resolve, reject) {
			var filePrefix = "file://";
			if (path.startsWith(filePrefix)) {
				var file = path.substr(filePrefix.length);
				fs.readFile(file, 'utf8', function (error, body) {
					if (error) {
						reject(error);
					} else {
						resolve(body);
					}
				});
			} else {
				var url = path;
				request(url, function (error, response, body) {
					if (error) {
						reject(error);
					} else {
						resolve(body);
					}
				})
			}
		});
	}

	return this;
};

if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(searchString, position){
		position = position || 0;
		return this.substr(position, searchString.length) === searchString;
	};
}
