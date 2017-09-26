import {normalizeModel} from "../app/model";
import {modelToSchema} from "../app/cms";

const fs = require("fs");
const Cms = require("../app/cms");
const Promise = require("bluebird");
const readFile = Promise.promisify(fs.readFile);

test("site_info", () => {
	return Promise.all([readFile('test/data/model.json', 'utf-8'), readFile('test/data/data.json', 'utf-8')])
		.then(results => {
			const model = normalizeModel(JSON.parse(results[0]));
			const data = JSON.parse(results[1]);
			const schema = modelToSchema(model);
			const path = "site_info".split('/');
			const node = Cms.findNode({model, data, schema}, path);
			expect(node.model.name).toBe( "Site Info");
			expect(node.model.fields[0].name).toBe( "Favicon");
			expect(node.data).not.toBeNull();
		});
});

test("nav/footer", () => {
	return Promise.all([readFile('test/data/model.json'), readFile('test/data/data.json')])
		.then(results => {
			const model = normalizeModel(JSON.parse(results[0]));
			const data = JSON.parse(results[1]);
			const schema = modelToSchema(model);
			const path = "nav/footer".split('/');
			const node = Cms.findNode({model, data, schema}, path);
			expect(node.model.name).toBe("Footer");
			expect(node.model.fields[0].name).toBe("Label");
			expect(node.model.fields[1].name).toBe("Url");
		});
});