import React from 'react';
import {Link} from 'react-router-dom';
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux';
import {load, save, setViewMode, download} from '../actions';
import AppState, {ViewMode} from "../state";

interface StateProps {
	enabled: boolean;
	mode: string,
	editorLink: string,
	schemaStale: boolean,
	dataStale: boolean,
	viewMode: ViewMode
}

interface Props extends StateProps {
	load: any,
	save: any,
	download: any,
	setViewMode: any
}

const Header: React.SFC<Props> = ({enabled, mode, editorLink, schemaStale, dataStale, viewMode, load, save, download, setViewMode}) => (
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
		<div className='middle'>
			<div className={'nav tab' + (viewMode === ViewMode.developer ? ' selected' : '')}>
				<a href="#" onClick={() => setViewMode(ViewMode.developer)} className="white">Developer</a>
			</div>
			<div className={'nav tab' + (viewMode === ViewMode.author ? ' selected' : '')}>
				<a href="#" onClick={() => setViewMode(ViewMode.author)} className="white">Author</a>
			</div>
		</div>
		<div className='right'>
			<div className="nav">
				<a href="#"
					 className={'btn blue cmd'}
					 title="Export a zip file of the schema and data JSON files"
					 onClick={() => download()}>
					Export
				</a>
			</div>
		</div>
	</div>
);

const mapStateToProps = (state: AppState): StateProps => {
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
		viewMode: state.preferences.mode,
		editorLink: state.navigation ? ('/node/' + state.navigation.latestNode) : '/'
	};
};
const mapDispatchToProps = dispatch => bindActionCreators({load, save, download, setViewMode}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Header);