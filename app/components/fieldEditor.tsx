import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Control, Form} from 'react-redux-form';
import {submitField, cancelEditField} from '../actions';

interface Props {
	on: boolean;
	newField: boolean;
	form: any;
	dispatch: Dispatch<any>;
}

const FieldEditor: React.SFC<Props> = ({dispatch, on, form, newField}) => {
		const submitClassName = (form && !form.valid) ? 'btn cmd disabled' : 'btn cmd blue';
		return (
			<div className="modal"
					 style={on ? {display: 'block'} : {display: 'none'}}
					 tabIndex={0}
					 onKeyDown={(e) =>(e.keyCode === 27 ? dispatch(cancelEditField()) : '')}>
				<div className="modal-content">
					<div className="title">
						{ newField ? 'Add Field' : 'Edit Field' }
						<div className="close" onClick={() => dispatch(cancelEditField())}>&times;</div>
					</div>
					<Form
						model="field"
						onSubmit={(values) => dispatch(submitField(values))}>
						<div className="fields">
							<div className="field">
								<label>Name</label>
								<Control.text model=".name"
															validators={{ name: (val) => val && val.length }}
															validateOn="change"
															autoFocus
															autoComplete="off"
								/>
							</div>
							<div className="field">
								<label>Type</label>
								<div className="styled-select">
									<Control.select model=".type">
										<option value="string">String</option>
										<option value="markdown">Markdown</option>
										<option value="array">Array</option>
										<option value="boolean">Boolean</option>
									</Control.select>
								</div>
							</div>
							<div className="field">
								<label>Description</label>
								<Control.text model=".description" autoComplete="off"
								/>
							</div>
						</div>
						<button className={submitClassName} type="submit">OK</button>
						<button className="btn cmd" onClick={() => dispatch(cancelEditField())}>Cancel</button>
					</Form>
				</div>
			</div>
		);
};

const mapStateToProps = (state) => {
	return {
		form: state.forms.field.$form,
		newField: state.editingField.fieldIndex === -1
	};
};

export default connect(mapStateToProps)(FieldEditor);
