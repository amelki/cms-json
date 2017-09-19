import * as React from "react";
const JSONPretty: any = require('react-json-pretty');
import { connect } from 'react-redux';

interface Props {
	jsonObject: object;
}

const Json: React.SFC<Props> = ({jsonObject}) => (
	<div id="json-container"><JSONPretty id="json-pretty" json={jsonObject}/></div>
);

const mapStateToProps = (state) => {
	const routerPath = state.router.location.pathname; // /node/header/2
	return {
		jsonObject: state.main.tree[routerPath.substring('/json/'.length)]
	};
};

export default connect(mapStateToProps)(Json);
