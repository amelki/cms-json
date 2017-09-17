import {} from 'jest';
import * as Cms from '../app/cms';
import {slugify} from "../app/cms";
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
		return {
			model: JSON.parse(json.model),
			data: JSON.parse(json.data)
		}
	});
};

test(`findNode(messages)`, () => {
	return loadTree().then(tree => {
		const node = Cms.findNode(tree, "messages");
		expect(node.model.name).toBe("Messages");
		expect(node.model.children.length).toBe(2);
		expect(node.model.children[0].name).toBe("Errors");
		expect(node.data.errors).toBeDefined();
		expect(node.path).toBe('messages');
	});
});

test(`findNode(nav/header)`, () => {
	return loadTree().then(tree => {
		const node = Cms.findNode(tree, "nav/header");
		expect(node.model.name).toBe("Header");
		expect(node.data.length).toBe(3);
		expect(node.data[0].label).toBe('Home');
		expect(node.path).toBe('nav/header');
	});
});

test(`findNode(nav/header/2)`, () => {
	return loadTree().then(tree => {
		const node = Cms.findNode(tree, "nav/header/2");
		expect(node.model.name).toBe("Header");
		expect(node.data.label).toBe('Blog');
		expect(node.path).toBe('nav/header/2');
	});
});

test(`findNode(messages/errors)`, () => {
	return loadTree().then(tree => {
		const node = Cms.findNode(tree, "messages/errors");
		expect(node.model.name).toBe("Errors");
		expect(node.data.internalError).toBeDefined();
		expect(node.path).toBe('messages/errors');
	});
});

test(`findNode(messages/errors/internalError)`, () => {
	return loadTree().then(tree => {
		const node = Cms.findNode(tree, "messages/errors/internalError");
		expect(node.model.name).toBe("Errors");
		expect(node.data.title).toBe('Internal Error');
		expect(node.path).toBe('messages/errors/internalError');
	});
});

const testTreePathAndIndex = (path, expectedFullPath, expectedTreePath, expectedIndex) => {
	test(`treePathAndIndex(${path})`, () => {
		return loadTree().then(tree => {
			const res = Cms.treePathAndIndex(tree, path);
			expect(res.fullPath).toBe(expectedFullPath);
			expect(res.treePath).toBe(expectedTreePath);
			expect(res.dataIndex).toBe(expectedIndex);
		});
	});
};

testTreePathAndIndex('messages/errors/internalError', 'messages/errors/internalError', 'messages/errors', 'internalError');
testTreePathAndIndex('site_info', 'site_info', 'site_info', -1);
testTreePathAndIndex('nav/header', 'nav/header', 'nav/header', -1);
testTreePathAndIndex('nav/header/2', 'nav/header/2', 'nav/header', 2);
// The following cases are debatable (should we rather throw an error id a path does not / cannot exist ?...
testTreePathAndIndex('nav/header/5', 'nav/header/5', 'nav/header', 5);
testTreePathAndIndex('messages/errors/3', 'messages/errors/3', 'messages/errors', "3");


const testFindDeepest = (data, path, depth, extractor) => {
	test(`findDeepest(${path})`, () => {
		const result = Cms.findDeepest(data, path);
		expect(result.depth).toBe(depth);
		expect(result.node.name).toBe(extractor(data));
	});
};

const data1 = {
	a: {
		name: 'hello'
	},
	c: {
		name: 'world'
	}
};

testFindDeepest(data1, "a/b", 1, d => d.a.name);
testFindDeepest(data1, "a/b/c", 1, d => d.a.name);
testFindDeepest(data1, "a/b/c", 1, d => d.a.name);
testFindDeepest(data1, "a/b/c/1", 1, d => d.a.name);

const data2 = { a: { b: { c: { name: 'abc' }, name: 'ab' } }, d: { name: 'd' }, name: 'root' };

testFindDeepest(data2, "a/b", 2, d => d.a.b.name);
testFindDeepest(data2, "a/b/c", 3, d => d.a.b.c.name);
testFindDeepest(data2, "a/b/c/d/e/f/g", 3, d => d.a.b.c.name);
testFindDeepest(data2, "foo/bar/hux", 0, d => d.name);

// const data3 = { a: { name: 'hello' }, c: { name: 'world' } };

// test("fillPath", () => {
// 	expect(typeof data3.a.b).toBe('undefined');
// 	expect(data3.c).toBeDefined();
// 	Cms.fillPath(data3, "a/b");
// 	expect(data3.a.b).toBeDefined();
// 	Cms.fillPath(data3, "a/b/d/e/f");
// 	expect(data3.a.b.d.e.f).toBeDefined();
// 	expect(data3.c).toBeDefined();
// 	Cms.fillPath(data3, "c/foo/bar/3");
// 	expect(data3.c.foo.bar).toBeDefined();
// 	expect(typeof data3.c.foo.bar).toBe('object');
// });

const testAddListItem = (path, requestedName, expectedNewNames) => {
	test(`addListItem(${path},${requestedName})`, () => {
		return loadTree().then(tree => {
			const node = Cms.findNode(tree, path);
			if (!Array.isArray(expectedNewNames)) {
				expectedNewNames = [ expectedNewNames ];
			}
			expectedNewNames.forEach(expectedNewName => {
				const newItem = Cms.addItem(node, requestedName).item;
				expect(newItem[Cms.defaultFieldName(node.model)]).toBe(expectedNewName);
			});
		});
	});
};

testAddListItem("nav/header", "New Item", [ "New Item", "New Item (2)", "New Item (3)" ]);
testAddListItem("nav/header", "Blog", [ "Blog (2)", "Blog (3)" ]);
testAddListItem("nav/header", "Blog (2)", [ "Blog (2)", "Blog (2) (2)", "Blog (2) (3)" ]);

const testAddMapItem = (path, requestedName, expectedNewNames) => {
	test(`addMapItem(${path},${requestedName})`, () => {
		return loadTree().then(tree => {
			const node = Cms.findNode(tree, path);
			if (!Array.isArray(expectedNewNames)) {
				expectedNewNames = [ expectedNewNames ];
			}
			expectedNewNames.forEach(expectedNewName => {
				const newKey = Cms.addItem(node, requestedName).dataIndex;
				expect(newKey).toBe(expectedNewName);
			});
		});
	});
};

testAddMapItem("messages/errors", "internalError", [ "internalError (2)", "internalError (3)" ]);
testAddMapItem("messages/errors", "anotherError", [ "anotherError", "anotherError (2)" ]);
testAddMapItem("messages/tooltips", "welcome", [ "welcome (2)", "welcome (3)" ]);
testAddMapItem("messages/tooltips", "anotherTooltip", [ "anotherTooltip", "anotherTooltip (2)" ]);

const testAddNode = (path, nodeType, requestedName, expectedNewNames) => {
	test(`addNode(${path}, ${nodeType})`, () => {
		return loadTree().then(tree => {
			const node = Cms.findNode(tree, path);
			if (!Array.isArray(expectedNewNames)) {
				expectedNewNames = [ expectedNewNames ];
			}
			expectedNewNames.forEach(expectedNewName => {
				const newNode = Cms.addNode(node, requestedName, nodeType);
				expect(newNode.model.name).toBe(expectedNewName);
			});
		});
	});
};

testAddNode("nav", Cms.TYPE_TREE, "New Node", [ "New Node", "New Node (2)", "New Node (3)" ]);
testAddNode("nav", Cms.TYPE_MAP_OBJECT, "New Map", [ "New Map", "New Map (2)", "New Map (3)" ]);
testAddNode("nav", Cms.TYPE_LIST_OBJECT, "New List", [ "New List", "New List (2)", "New List (3)" ]);
testAddNode("nav", Cms.TYPE_LIST_OBJECT, "Header", [ "Header (2)", "Header (3)" ]);
testAddNode("nav", Cms.TYPE_MAP_OBJECT, "Header", [ "Header (2)", "Header (3)" ]);
testAddNode("nav", Cms.TYPE_TREE, "Header", [ "Header (2)", "Header (3)" ]);

const testGetFieldNamed = (path, fieldName) => {
	test(`getFieldName(${path}, ${fieldName})`, () => {
		return loadTree().then(tree => {
			const node = Cms.findNode(tree, path);
			const field = Cms.getFieldNamed(node, fieldName);
			expect(field).toBeDefined();
			expect(field.name).toBe(fieldName);
		});
	});
};

testGetFieldNamed("nav/header", 'Url');
testGetFieldNamed("nav/footer", 'Target');
testGetFieldNamed("nav/footer/1", 'Target');
testGetFieldNamed("pages", 'Search Enabled');

const testDeleteField = (path, fieldName) => {
	test(`deleteField(${path}, ${fieldName})`, () => {
		return loadTree().then(tree => {
			const node = Cms.findNode(tree, path);
			const field = Cms.getFieldNamed(node, fieldName);
			const fieldIndex = Cms.getFieldIndex(node, field);
			Cms.getDataItems(node).forEach(item => {
				expect(item[Cms.slugify(field.name)]).toBeDefined();
			});
			Cms.deleteFieldAt(node, fieldIndex);
			Cms.getDataItems(node).forEach(item => {
				expect(item[Cms.slugify(field.name)]).toBeUndefined();
			});
		});
	});
};
const testDeleteFieldError = (path, fieldName) => {
	test(`deleteFieldError(${path}, ${fieldName})`, () => {
		return loadTree().then(tree => {
			const node = Cms.findNode(tree, path);
			const field = Cms.getFieldNamed(node, fieldName);
			const fieldIndex = Cms.getFieldIndex(node, field);
			expect(() => Cms.deleteFieldAt(node, fieldIndex)).toThrow(Error);
		});
	});
};

testDeleteField("nav/header", 'Url');
testDeleteField("nav/footer", 'Label');
testDeleteField("messages/errors", 'Title');
testDeleteFieldError("messages/errors", 'Identifier');
testDeleteFieldError("messages/tooltips", 'Identifier');
testDeleteFieldError("messages/tooltips", 'Message');

const testUpdateField = (path, fieldName, field, expectedData) => {
	test(`updateField(${path}, ${fieldName})`, () => {
		return loadTree().then(tree => {
			const node = Cms.findNode(tree, path);
			const prevField = Cms.getFieldNamed(node, fieldName);
			const fieldIndex = Cms.getFieldIndex(node, prevField);
			expect(node.model.fields).not.toContainEqual(field);
			Cms.updateFieldAt(node, fieldIndex, field);
			expect(node.model.fields).toContainEqual(field);
			expect(node.data).toEqual(expectedData);
		});
	});
};

testUpdateField("nav/header", 'Url', "theUrl", [
	{
		"label": "Home",
		"theurl": "/home"
	},
	{
		"label": "Product",
		"theurl": "/product"
	},
	{
		"label": "Blog",
		"theurl": "/blog"
	}
]);
testUpdateField("nav/header", 'Url', { name: "Url", type: 'boolean' }, [
	{
		"label": "Home",
		"url": true
	},
	{
		"label": "Product",
		"url": true
	},
	{
		"label": "Blog",
		"url": true
	}
]);
testUpdateField("messages/errors", 'Identifier', "Id", {
	"internalError": {
		"title": "Internal Error",
		"message": "An internal error occurred"
	},
	"connectionError": {
		"title": "Network Error",
		"message": "There seem to be network issues"
	}
});
testUpdateField("messages/errors", 'Title', "theTitle", {
	"internalError": {
		"thetitle": "Internal Error",
		"message": "An internal error occurred"
	},
	"connectionError": {
		"thetitle": "Network Error",
		"message": "There seem to be network issues"
	}
});
testUpdateField("messages/tooltips", 'Identifier', "Id", {
	"welcome": "Welcome to my web site",
	"sendEmail": "click to send an email"
});
testUpdateField("messages/tooltips", 'Message', "Msg", {
	"welcome": "Welcome to my web site",
	"sendEmail": "click to send an email"
});

const testRenameNode = (path, name) => {
	test(`renameNode(${path}, ${name})`, () => {
		return loadTree().then(tree => {
			const node = Cms.findNode(tree, path);
			const previousName = node.model.name;
			const prev = node.parent.data[Cms.slugify(node.model.name)];
			Cms.renameNode(node, name);
			expect(node.model.name).toBe(name);
			expect(node.parent.data[slugify(name)]).toEqual(prev);
			expect(node.parent.data[slugify(previousName)]).toBeUndefined();
		});
	});
};

testRenameNode('nav/header', 'headers');
testRenameNode('nav', 'navigation');
testRenameNode('messages/errors', 'erreurs');
