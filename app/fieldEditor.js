import React from 'react';
import {connect} from 'react-redux';
import {Control, Form} from 'react-redux-form';
import {submitField, cancelEditField} from './actions';

class FieldEditor extends React.Component {
	render() {
		const {dispatch, on, forms} = this.props;
		const submitClassName = (forms && !forms.field.$form.valid) ? 'btn cmd disabled' : 'btn cmd blue';
		return (
			<div className="modal" style={on ? {display: 'block'} : {display: 'none'}}>
				<div className="modal-content">
					<span className="close" onClick={() => dispatch(cancelEditField())}>&times;</span>
					<div className="title">Edit Field</div>
					<Form
						model="field"
						onSubmit={(values) => dispatch(submitField(values))}>
						<div className="fields">
							<div className="field">
								<label>Name</label>
								<Control.text model=".name"
															validators={{ name: (val) => val && val.length }}
															validateOn="change"
								/>
							</div>
							<div className="field">
								<label>Type</label>
								<div className="styled-select">
									<Control.select model=".type">
										<option value="string">String</option>
										<option value="md">Markdown</option>
										<option value="array">Array</option>
										<option value="boolean">Boolean</option>
									</Control.select>
								</div>
							</div>
						</div>
						<button className={submitClassName} type="submit">OK</button>
						<button className="btn cmd" onClick={() => dispatch(cancelEditField())}>Cancel</button>
					</Form>
				</div>
			</div>
		);
	}
}

export default connect()(FieldEditor);
