#!/usr/bin/env node
var express = require('express');
var process = require('process');
var fs = require('fs');
var colors = require('colors');
var bodyParser = require('body-parser');

module.exports.run = function(modelFile, dataFile, port) {

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