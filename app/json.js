import React from 'react';
import JSONPretty from 'react-json-pretty';
import axios from 'axios';
import 'react-json-pretty/JSONPretty.adventure_time.styl';

export default class Json extends React.Component {
	constructor(props) {
		super(props);
		this.loadState = this.loadState.bind(this);
		this.isStateValid = this.isStateValid.bind(this);
	}

	loadState() {
		const _this = this;
		const fileName = this.props.match.params["0"];
		axios.get('/' + fileName).then(res => {
			_this.setState(res.data);
		});

	}

	componentDidMount() {
		this.loadState();
	}

	isStateValid() {
		return this.state;
	}

	render() {
		if (this.isStateValid()) {
			return <JSONPretty style={{textAlign: 'left', padding: 10}} id="json-pretty" json={this.state}/>;
		} else {
			return <div>no json</div>;
		}
	}

};
