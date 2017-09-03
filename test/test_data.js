var assert = require("assert");
var fs = require("fs");
var Cms = require("../app/cms");
var Promise = require("bluebird");
var readFile = Promise.promisify(fs.readFile);

Promise.all([ readFile('test/data/model.json', 'utf-8'), readFile('test/data/data.json', 'utf-8') ])
	.then(results => {
		const model = JSON.parse(results[0]);
		const data = JSON.parse(results[1]);
		const path = "site_info".split('/');
		const node = Cms.findNode({model, data}, path);
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
		const model = JSON.parse(results[0]);
		const data = JSON.parse(results[1]);
		const path = "nav/footer".split('/');
		const node = Cms.findNode({model, data}, path);
		assert.equal(node.model.name, "Footer");
		assert.equal(node.model.fields[0], "Label");
		assert.equal(node.model.fields[1], "Url");
		assert.notEqual(node.data, null);
		console.log("Test OK");
	})
	.catch(err => {
		console.log(err);
	});
