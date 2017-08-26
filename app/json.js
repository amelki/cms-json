import React from 'react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/JSONPretty.adventure_time.styl';
import { connect } from 'react-redux';

class Json extends React.Component {
	render() {
		return <JSONPretty
			style={{textAlign: 'left', padding: 10, paddingTop: 60, paddingBottom: 40}}
			id="json-pretty"
			json={this.props.state[this.props.match.params[0]]}/>;
	}
}

function mapStateToProps(state) {
	return {
		state: state
	};
}

export default connect(mapStateToProps)(Json);
