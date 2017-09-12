import React from 'react';
import {connect} from 'react-redux';
import {Control, Form} from 'react-redux-form';
import {submitField, cancelEditField, cancelConfirm} from './actions';

class Confirm extends React.Component {
	cancel() {
		const {dispatch} = this.props;
		return () => dispatch(cancelConfirm());
	}
	render() {
		const {on, title, body, ok} = this.props;
		return (
			<div className="modal"
					 style={on ? {display: 'block'} : {display: 'none'}}
					 tabIndex="0"
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
