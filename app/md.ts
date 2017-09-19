import marked from 'marked';
import toMarkdown from 'to-markdown';

export const html = (md) => {
	if (!md) {
		return "";
	}
	return marked(md);
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
