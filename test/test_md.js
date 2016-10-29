var assert = require("assert");
var fs = require("fs");
var converter = require('../scripts/services/md.js');

var md = "# foo\n\n*   bar\n*   hux";
var html = '<h1 id="foo">foo</h1>\n<ul>\n<li>bar</li>\n<li>hux</li>\n</ul>\n';

var actualHtml = converter.html(md);
assert.equal(actualHtml, html);
var actualMd = converter.md(html);
assert.equal(actualMd, md);

console.log("Test OK");