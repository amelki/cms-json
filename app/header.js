import React from 'react';
import {Link} from 'react-router-dom';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { load, save } from './actions';

const Header = ({ enabled, mode, load, save}) => (
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
			<Link to="/" className="white">Editor</Link>
		</div>
		<div className={'nav tab' + (mode === 'data' ? ' selected' : '')}>
			<Link to="/json/data" className="white">data.json</Link>
		</div>
		<div className={'nav tab' + (mode === 'model' ? ' selected' : '')}>
			<Link to="/json/model" className="white">model.json</Link>
		</div>
	</div>
);

const mapStateToProps = state => {
	const routerPath = state.router.location.pathname;
	let mode = 'editor';
	if (routerPath === '/json/data') {
		mode = 'data';
	} else if (routerPath === '/json/model') {
		mode = 'model';
	}
	return {
		enabled: (state.main.stale || state.main.busy),
		mode: mode
	};
};
const mapDispatchToProps = dispatch => bindActionCreators({ load, save }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Header);