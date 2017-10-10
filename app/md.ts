
import MarkdownIt from 'markdown-it';
import toMarkdown from 'to-markdown';

const mdIt = new MarkdownIt();

export const html = (md) => {
	if (!md) {
		return "";
	}
	return mdIt.render(md, {html: true});
};

export const md = (html) => {
	if (!html) {
		return "";
	}
	return toMarkdown(html, {
		converters: [
			{
				filter: 'hr',
				replacement: function (content) {
					return '---';
				}
			}
		]
	});
};
