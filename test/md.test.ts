import * as converter from '../app/md';

const expectedMd = "foo\n===\n\n*   bar\n*   hux";
const expectedHtml = '<h1>foo</h1>\n<ul>\n<li>bar</li>\n<li>hux</li>\n</ul>\n';
const actualHtml = converter.html(expectedMd);
const actualMd = converter.md(expectedHtml);

test("nav/footer", () => {
	expect(actualHtml).toBe(expectedHtml);
	expect(actualMd).toBe(expectedMd);
	expect(converter.html(null)).toBe('');
	expect(converter.md(null)).toBe('');
});
