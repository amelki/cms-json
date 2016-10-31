/* eslint no-console: 0 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const bodyParser = require('body-parser');


/**
 * Run an Express server embedding a simple UI for editing the content of the given dataFile.
 *
 * @param {Object} [options]
 * @param {Object} [options.dataFile]
 * 		A JSON file with the content. This parameter is mandatory.
 * 		The	content authored from the web site will be saved with that path name.
 * 		The structure of this JSON file must match the model.
 * 		See an example here: https://github.com/amelki/cms-json/blob/master/default/data.json
 * @param {Object} [options.modelFile]
 * 		A JSON file representing the model to support/ease authoring via the UI. This parameter is mandatory.
 * 		See an example here: https://github.com/amelki/cms-json/blob/master/default/model.json
 * @param {Object} [options.port] The server port. 3000 by default
 * @returns {*} The express app
 */
module.exports.run = function(options) {
	options = options || {};
	const isDeveloping = process.env.NODE_ENV !== 'production';
//	const port = isDeveloping ? 3000 : process.env.PORT;
	var port = options.port || 3000;
	var modelFile = options.modelFile;
	var dataFile = options.dataFile;
	if (!modelFile) {
		throw "Model file not provided";
	}
	if (!dataFile) {
		throw "Data file not provided";
	}

	const app = express();
	app.use(bodyParser.json());

	app.get('/model.json', function (req, res) {
		fs.readFile(modelFile, 'utf-8', (err, json) => {
			if (err) throw err;
			res.send(json);
		});
	});
	app.get('/data.json', function (req, res) {
		fs.readFile(dataFile, 'utf-8', (err, json) => {
			if (err) throw err;
			res.send(json);
		});
	});
	app.post('/data.json', function (req, res) {
		var json = req.body;
		fs.writeFile(dataFile, JSON.stringify(json, undefined, 2), function (err) {
			if (err) console.log(err);
			console.log("File " + dataFile + " saved");
			res.send("OK");
		});
	});

	if (isDeveloping) {
		const compiler = webpack(config);
		const middleware = webpackMiddleware(compiler, {
			publicPath: config.output.publicPath,
			contentBase: 'src',
			stats: {
				colors: true,
				hash: false,
				timings: true,
				chunks: false,
				chunkModules: false,
				modules: false
			}
		});

		app.use(middleware);
		app.use(webpackHotMiddleware(compiler));
		app.get('*', function response(req, res) {
			res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
			res.end();
		});
	} else {
		app.use(express.static(__dirname + '/dist'));
		app.get('*', function response(req, res) {
			res.sendFile(path.join(__dirname, 'dist/index.html'));
		});
	}

	app.listen(port, '0.0.0.0', function onStart(err) {
		if (err) {
			console.log(err);
		}
		console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
	});

};