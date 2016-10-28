var assert = require("assert");
var fs = require("fs");
var Tree = require('../scripts/services/tree.js');


var data;
var result;

data = { a: { name: 'hello' }, c: { name: 'world' } };

result = Tree.findDeepest(data, "a/b");
assert.equal(result.depth, 1);
assert.equal(result.node.name, data.a.name);

result = Tree.findDeepest(data, "a/b/c");
assert.equal(result.depth, 1);
assert.equal(result.node.name, data.a.name);

result = Tree.findDeepest(data, "a/b/c/1");
assert.equal(result.depth, 1);
assert.equal(result.node.name, data.a.name);

result = Tree.findDeepest(data, "a");
assert.equal(result.depth, 1);
assert.equal(result.node.name, data.a.name);

data = { a: { b: { c: { name: 'abc' }, name: 'ab' } }, d: { name: 'd' }, name: 'root' };

result = Tree.findDeepest(data, "a/b");
assert.equal(result.depth, 2);
assert.equal(result.node.name, data.a.b.name);

result = Tree.findDeepest(data, "a/b/c");
assert.equal(result.depth, 3);
assert.equal(result.node.name, data.a.b.c.name);

result = Tree.findDeepest(data, "a/b/c/d/e/f/g");
assert.equal(result.depth, 3);
assert.equal(result.node.name, data.a.b.c.name);

result = Tree.findDeepest(data, "foo/bar/hux");
assert.equal(result.depth, 0);
assert.equal(result.node.name, data.name);

data = { a: { name: 'hello' }, c: { name: 'world' } };

assert.ok(typeof data.a.b === 'undefined');
assert.ok(data.c);
Tree.fillPath(data, "a/b");
assert.ok(data.a.b);
Tree.fillPath(data, "a/b/d/e/f");
assert.ok(data.a.b.d.e.f);
assert.ok(data.c);
Tree.fillPath(data, "c/foo/bar/3");
assert.ok(data.c.foo.bar);
assert.ok(typeof data.c.foo.bar === 'object');

console.log("Test OK");
