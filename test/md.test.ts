const converter = require('../app/md');

const md = "# foo\n\n*   bar\n*   hux";
const html = '<h1 id="foo">foo</h1>\n<ul>\n<li>bar</li>\n<li>hux</li>\n</ul>\n';
const actualHtml = converter.html(md);
const actualMd = converter.md(html);

test("nav/footer", () => {
	expect(actualHtml).toBe(html);
	expect(actualMd).toBe(md);
});
