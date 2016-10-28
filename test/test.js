var assert = require("assert");
var fs = require("fs");
var Walker = require('../scripts/services/walker.js');

var generate = false;

var expected = "test/expected.html";

new Walker().init('file://test/data/model.json', 'file://test/data/data.json')
	.then(walker => {
		var html = walker.tree();
		if (generate) {
			fs.writeFile(expected, html, function() {
				console.log("Generated test file", expected);
			});
		} else {
			fs.readFile(expected, 'utf8', function (err, body) {
				assert.equal(html, body);
				console.log("Test OK");
			});
		}
		return Promise.resolve(walker);
	})
	.then(walker => {
		var path = "site/text".split('/');
		var node = walker.findNode(path);
		assert.equal(node.model.name, "Text");
		assert.equal(node.data.signup_button, "Get Started");
		console.log("Test OK");
		return Promise.resolve(walker);
	})
	.then(walker => {
		var path = "site/header/0".split('/');
		var node = walker.findNode(path);
		assert.equal(node.model.name, "Header");
		assert.equal(node.model.list, true);
		assert.equal(node.data.name, "Security");
		assert.equal(node.data.url, "/security");
		assert.equal(node.model.fields[0], "name");
		assert.equal(node.model.fields[1], "url");
		console.log("Test OK");
		return Promise.resolve(walker);
	})
	.then(walker => {
		var path = "footer".split('/');
		var node = walker.findNode(path);
		assert.equal(node.model.name, "Footer");
		assert.equal(node.model.list, true);
		assert.equal(node.model.fields[0], "name");
		assert.equal(node.model.fields[1], "url");
		console.log("Test OK");
		return Promise.resolve(walker);
	})
	.catch(err => {
		console.log(err);
	});

new Walker().init('file://default/model.json', 'file://default/data.json')
	.then(walker => {
		var path = "site_info".split('/');
		var node = walker.findNode(path);
		assert.equal(node.model.name, "Site Info");
		assert.equal(node.model.fields[0], "name");
		assert.equal(node.model.fields[1], "favicon");
		assert.notEqual(node.data, null);
		console.log("Test OK");
	})
	.catch(err => {
		console.log(err);
	});

new Walker().init('file://default/model.json', 'file://default/data.json')
	.then(walker => {
		var path = "nav/footer".split('/');
		var node = walker.findNode(path);
		assert.equal(node.model.name, "Footer");
		assert.equal(node.model.fields[0], "name");
		assert.equal(node.model.fields[1], "url");
		assert.notEqual(node.data, null);
		console.log("Test OK");
	})
	.catch(err => {
		console.log(err);
	});
