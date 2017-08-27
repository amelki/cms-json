import React from 'react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/JSONPretty.adventure_time.styl';
import { connect } from 'react-redux';

class Json extends React.Component {
	render() {
		const { json } = this.props;
		return <JSONPretty
			style={{textAlign: 'left', padding: 10, paddingTop: 60, paddingBottom: 40}}
			id="json-pretty"
			json={json}/>;
	}
}

const mapStateToProps = (state) => {
	const routerPath = state.router.location.pathname; // /node/header/2
	return {
		json: state.main[routerPath.substring('/json/'.length)]
	};
};

export default connect(mapStateToProps)(Json);
