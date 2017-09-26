import React from 'react';
import {Link} from 'react-router-dom';
import { bindActionCreators } from 'redux'
import {connect} from 'react-redux';
import { load, save } from '../actions';
import AppState from "../state";

interface StateProps {
	enabled: boolean;
	mode: string,
	editorLink: string,
	schemaStale: boolean,
	dataStale: boolean
}
interface Props extends StateProps {
	load: any,
	save: any
}

const Header: React.SFC<Props> = ({enabled, mode, editorLink, schemaStale, dataStale, load, save}) => (
	<div id="navbar">
		<div className="nav">
			<a href="#"
				 className={enabled ? 'btn blue cmd' : 'btn blue cmd disabled'}
				 onClick={() => save()}>
				Save
			</a>
		</div>
		<div className="nav">
			<a href="#"
				 className={enabled ? 'btn cmd' : 'btn cmd disabled'}
				 onClick={() => load()}>
				Reset
			</a>
		</div>
		<div className={'nav tab' + (mode === 'editor' ? ' selected' : '')}>
			<Link to={editorLink} className="white">Editor</Link>
		</div>
		<div className={'nav tab' + (mode === 'data' ? ' selected' : '')}>
			<Link to="/json/data" className="white">data.json{dataStale ? ' *' : ''}</Link>
		</div>
		<div className={'nav tab' + (mode === 'schema' ? ' selected' : '')}>
			<Link to="/json/schema" className="white">schema.json{schemaStale ? ' *' : ''}</Link>
		</div>
	</div>
);

const mapStateToProps = (state: AppState) : StateProps => {
	const routerPath = state.router.location.pathname;
	let mode = 'editor';
	if (routerPath === '/json/data') {
		mode = 'data';
	} else if (routerPath === '/json/schema') {
		mode = 'schema';
	}
	return {
		enabled: ((state.main.schemaStale || state.main.dataStale || state.main.busy) && !state.editingField),
		schemaStale: state.main.schemaStale,
		dataStale: state.main.dataStale,
		mode: mode,
		editorLink: state.navigation ? ('/node/' + state.navigation.latestNode) : '/'
	};
};
const mapDispatchToProps = dispatch => bindActionCreators({ load, save }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Header);