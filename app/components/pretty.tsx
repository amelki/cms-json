import * as React from "react";
import { prettyPrint } from "../pretty";

interface Props {
	object: any;
	selection: any;
}

class JsonPretty extends React.Component<Props, {}> {

	public render(): React.ReactElement<{}> {
		const {object, selection} = this.props;
		return React.createElement('div', {
			id: 'json-pretty',
			className: 'json-pretty',
			dangerouslySetInnerHTML: {__html: prettyPrint(object, selection)}
		});
	}

	componentDidUpdate() {
		// Show the selected piece of Json, if any
		const selection = document.querySelector('#json-pretty .selected');
		const jsonPanel = document.querySelector('#json-panel');
		const jsonPretty = document.querySelector('#json-pretty');
		if (jsonPanel && jsonPretty && selection) {
			const panelRect = jsonPanel.getBoundingClientRect();
			const selectionRect = selection.getBoundingClientRect();
			const selectionYScrolledToTop = selectionRect.top;
			const selectionYToTop = selectionRect.top + jsonPanel.scrollTop + window.scrollY;
			if (selectionRect.top < panelRect.top || selectionYScrolledToTop + selectionRect.height > panelRect.height) {
				jsonPretty.scrollTo(0, selectionYToTop - panelRect.top);
			}
			// Couln't find a way to do this in CSS... Ensure the content is as wide as container
			selection.setAttribute("style", 'width: ' + jsonPretty!.scrollWidth + "px");
		}
	}

}

export default JsonPretty;
