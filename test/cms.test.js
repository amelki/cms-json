import * as Cms from '../app/cms.js';

const testFindDeepest = (data, path, depth, extractor) => {
	test(path, () => {
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

const data3 = { a: { name: 'hello' }, c: { name: 'world' } };

test("fillPath", () => {
	expect(typeof data3.a.b).toBe('undefined');
	expect(data3.c).toBeDefined();
	Cms.fillPath(data3, "a/b");
	expect(data3.a.b).toBeDefined();
	Cms.fillPath(data3, "a/b/d/e/f");
	expect(data3.a.b.d.e.f).toBeDefined();
	expect(data3.c).toBeDefined();
	Cms.fillPath(data3, "c/foo/bar/3");
	expect(data3.c.foo.bar).toBeDefined();
	expect(typeof data3.c.foo.bar).toBe('object');
});

test("findNewName", () => {

});
