var marked = require('marked');
var toMarkdown = require('to-markdown');

var converter = {};

module.exports = converter;


converter.html = function(md) {
	return marked(md);
};

converter.md = function(html) {
	return toMarkdown(html, { converters: [
		{
			filter: 'hr',
			replacement: function(content) {
				return '---';
			}
		}
	] });
};
