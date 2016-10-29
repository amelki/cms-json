var assert = require("assert");
var fs = require("fs");
var Walker = require('../scripts/services/walker.js');

new Walker().init('file://test/data/model.json', 'file://test/data/data.json')
	.then(walker => {
		var path = "site_info".split('/');
		var node = walker.findNode(path);
		assert.equal(node.model.name, "Site Info");
		assert.equal(node.model.fields[0], "Favicon");
		assert.notEqual(node.data, null);
		console.log("Test OK");
	})
	.catch(err => {
		console.log(err);
	});

new Walker().init('file://test/data/model.json', 'file://test/data/data.json')
	.then(walker => {
		var path = "nav/footer".split('/');
		var node = walker.findNode(path);
		assert.equal(node.model.name, "Footer");
		assert.equal(node.model.fields[0], "Label");
		assert.equal(node.model.fields[1], "Url");
		assert.notEqual(node.data, null);
		console.log("Test OK");
	})
	.catch(err => {
		console.log(err);
	});
