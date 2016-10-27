#!/usr/bin/env node
var express = require('express');
var program = require('commander');
var process = require('process');
var fs = require('fs');
var colors = require('colors');

var server = require('./index');

program
	.version('0.0.1')
	.option('-m, --model <file>', 'CMS Model file (json)')
	.option('-d, --data <file>', 'CMS Data file (json)')
	.option('-p, --port [port]', 'Optional server port. Default is 3000')
	.parse(process.argv);

if (!program.model || !program.data) {
	program.outputHelp();
	process.exit(0);
	program.outputHelp(text => { colors.red(text); });
}

var port = program.port || 3000;
var modelFile = program.model || 'default/model.json';
var dataFile = program.data || 'default/data.json';

server.run(modelFile, dataFile, port);
