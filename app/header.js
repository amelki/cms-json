import React from 'react';
import {Link} from 'react-router-dom';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { load, save } from './actions';

const Header = ({ enabled, load, save}) => (
	<ul id="navbar">
		<li>
			<a href="#"
				 className={enabled ? 'btn blue cmd' : 'btn blue cmd disabled'}
				 onClick={() => save()}>
				Save
			</a>
		</li>
		<li>
			<a href="#"
				 className={enabled ? 'btn cmd' : 'btn cmd disabled'}
				 onClick={() => load()}>
				Reset
			</a>
		</li>
		<li>
			<div className="separator">|</div>
		</li>
		<li>
			<Link to="/" className="blue">Editor</Link>
		</li>
		<li>
			<div className="separator">|</div>
		</li>
		<li>
			<Link to="/json/data" className="blue">data.json</Link>
		</li>
		<li>
			<div className="separator">|</div>
		</li>
		<li>
			<Link to="/json/model" className="blue">model.json</Link>
		</li>
	</ul>
);

const mapStateToProps = state => ({ enabled: (state.main.stale || state.main.busy) });
const mapDispatchToProps = dispatch => bindActionCreators({ load, save }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Header);