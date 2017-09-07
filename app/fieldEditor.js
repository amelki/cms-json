import React from 'react';
import {connect} from 'react-redux';
import {Control, Form} from 'react-redux-form';
import {submitField, cancelEditField} from './actions';

class FieldEditor extends React.Component {
	render() {
		const {dispatch} = this.props;
		return (
			<div className="modal">
				<Form
					model={field}
					onSubmit={(values) => dispatch(submitField())}>
					<div className="field-property">
						<label>Name:</label>
						<Control.text model=".name"/>
					</div>
					<div className="field-property">
						<label>Type:</label>
						<Control.select model=".type">
							<option value="string">String</option>
							<option value="md">Markdown</option>
							<option value="array">Array</option>
							<option value="boolean">Boolean</option>
						</Control.select>
					</div>
					<button type="submit">OK</button>
					<button onClick={() => dispatch(cancelEditField())}>Cancel</button>
				</Form>
			</div>
		);
	}
}

export default connect()(FieldEditor);
