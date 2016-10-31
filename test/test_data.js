var assert = require("assert");
var fs = require("fs");
var Cms = require("../app/cms");
var Promise = require("bluebird");
var readFile = Promise.promisify(fs.readFile);

Promise.all([ readFile('test/data/model.json', 'utf-8'), readFile('test/data/data.json', 'utf-8') ])
	.then(results => {
		var model = JSON.parse(results[0]);
		var data = JSON.parse(results[1]);
		var path = "site_info".split('/');
		var node = Cms.findNode(model, data, path);
		assert.equal(node.model.name, "Site Info");
		assert.equal(node.model.fields[0], "Favicon");
		assert.notEqual(node.data, null);
		console.log("Test OK");
	})
	.catch(err => {
		console.log(err);
	});

Promise.all([ readFile('test/data/model.json'), readFile('test/data/data.json') ])
	.then(results => {
		var model = JSON.parse(results[0]);
		var data = JSON.parse(results[1]);
		var path = "nav/footer".split('/');
		var node = Cms.findNode(model, data, path);
		assert.equal(node.model.name, "Footer");
		assert.equal(node.model.fields[0], "Label");
		assert.equal(node.model.fields[1], "Url");
		assert.notEqual(node.data, null);
		console.log("Test OK");
	})
	.catch(err => {
		console.log(err);
	});
