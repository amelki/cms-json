import * as Cms from '../app/cms';
import {modelToSchema, schemaToModel, slugify} from '../app/cms';
import {Field, FieldType, Node, NodeType, normalizeModel, TreeModel} from "../app/model";
import {readdirSync} from "fs";
import { prettyPrintData } from "../app/pretty";

const fs = require("fs");
const Promise = require("bluebird");
const readFile = Promise.promisify(fs.readFile);

let jsonTree;

/**
 * Utility methods that loads model and data from disk and cache them in a global variable.
 * @returns {Promise}
 */
const loadTree = () => {
	const promise = jsonTree
		? Promise.resolve(jsonTree) // reparse from cache
		: Promise.all([readFile('test/data/model.json', 'utf-8'), readFile('test/data/data.json', 'utf-8')])
			.then(results => {
				jsonTree = {
					model: results[0],
					data: results[1]
				};
				return jsonTree;
			});
	return promise.then(json => {
		let normalizedModel = normalizeModel(JSON.parse(json.model));
		return {
			model: normalizedModel,
			schema: modelToSchema(normalizedModel),
			data: JSON.parse(json.data)
		}
	});
};

const testPrettyPrint = (file, selection) => {
	test(`testPrettyPrint(${file})`, () => {
		return loadTree().then(tree => {
			let html = prettyPrintData(tree.schema, tree.data, eval(selection));
			let styles = '<style>.key{ color: red } .string{ color: green } .boolean{ color: blue } .selected { background-color: #ddd }</style>';
			let all = styles + '<br>' + html;
			return readFile(file, 'utf-8').then(text => {
				return expect(all).toBe(text);
			});
		});
	});
};

testPrettyPrint('test/data/pretty1.html', 'tree.data.nav.header[1]');
testPrettyPrint('test/data/pretty2.html', 'tree.data.pages');
