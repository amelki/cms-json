import * as React from "react";
import {connect, Dispatch} from 'react-redux';
import {cancelConfirm} from "../actions";
import AppState from "../state";

interface BaseProps {
	on: boolean,
	title: string,
	body: string,
	ok: () => any
}

interface Props extends BaseProps {
	dispatch: Dispatch<AppState>;
}

const Confirm: React.SFC<Props> = ({on, title, body, ok, dispatch}) => {
	const cancel = () => dispatch(cancelConfirm());
	return <div className="modal"
			 style={on ? { display: 'block' } : { display: 'none' }}
			 tabIndex={0}
			 onKeyDown={(e) =>(e.keyCode === 27 ? cancel() : '')}>
		<div className="modal-content">
			<div className="title">
				{title}
				<div className="close" onClick={cancel}>&times;</div>
			</div>
			<div className="modal-body">
				{body}
			</div>
			<button className="btn cmd blue" onClick={() => ok()}>Yes</button>
			<button className="btn cmd" onClick={cancel}>No</button>
		</div>
	</div>
};

const mapStateToProps = (state: AppState) : BaseProps => {
	const confirm = state.confirm;
	if (confirm) {
		return {
			...confirm,
			on: true,
		}
	} else {
		return {
			title: '',
			body: '',
			ok: () => {},
			on: false,
		};
	}
};

export default connect(mapStateToProps)(Confirm);
