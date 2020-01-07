import MarkdownIt from 'markdown-it';
import TurndownService from 'turndown';

const mdIt = new MarkdownIt();

const turndownService = new TurndownService();

turndownService.addRule('hr', {
	filter: 'hr',
	replacement: function (content) {
		return '---'
	}
});

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
	return turndownService.turndown(html);
};
