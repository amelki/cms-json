var express = require('express');
var process = require('process');
var fs = require('fs');
var colors = require('colors');
var bodyParser = require('body-parser');

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
	var port = options.port || 3000;
	var modelFile = options.modelFile;
	var dataFile = options.dataFile;
	if (!modelFile) {
		throw "Model file not provided";
	}
	if (!dataFile) {
		throw "Data file not provided";
	}
	var app = express();
	app.use(bodyParser.json());
	app.use(express.static(__dirname + '/public'));

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
		});
	});

	app.get('/node/*', function (req, res) {
		var options = {
			root: __dirname + '/public/',
			dotfiles: 'deny',
			headers: {
				'x-timestamp': Date.now(),
				'x-sent': true
			}
		};
		res.sendFile("index.html", options, function (err) {
			if (err) console.log(err);
		});
	});

	app.get('/item/*', function (req, res) {
		var options = {
			root: __dirname + '/public/',
			dotfiles: 'deny',
			headers: {
				'x-timestamp': Date.now(),
				'x-sent': true
			}
		};
		res.sendFile("index.html", options, function (err) {
			if (err) console.log(err);
		});
	});


	app.listen(port, function () {
		console.log('CMS served on port ' + port);
	});
	
	return app;

};