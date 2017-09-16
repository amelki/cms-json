import * as React from "react";
import {connect, DispatchProp} from 'react-redux';
import {cancelConfirm} from "./actions";

interface Props extends DispatchProp<() => object> {
	on: boolean,
	title: string,
	body: string,
	ok: () => any
}

class Confirm extends React.Component<Props, {}> {

	cancel(): any {
		return () => {
			this.props.dispatch!(cancelConfirm());
		};
	}

	public render(): React.ReactElement<{}> {
		const {on, title, body, ok} = this.props;
		return (
			<div className="modal"
					 style={on ? { display: 'block' } : { display: 'none' }}
					 tabIndex={0}
					 onKeyDown={(e) =>(e.keyCode === 27 ? this.cancel() : '')}>
				<div className="modal-content">
					<div className="title">
						{title}
						<div className="close" onClick={this.cancel()}>&times;</div>
					</div>
					<div className="modal-body">
						{body}
					</div>
					<button className="btn cmd blue" onClick={() => ok()}>Yes</button>
					<button className="btn cmd" onClick={this.cancel()}>No</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	const confirm = state.confirm;
	if (confirm) {
		return {
			...confirm,
			on: true,
		}
	} else {
		return {
			on: false,
		};
	}
};

export default connect(mapStateToProps)(Confirm);
