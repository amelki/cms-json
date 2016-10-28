#!/usr/bin/env node
var express = require('express');
var program = require('commander');
var process = require('process');
var fs = require('fs');
var colors = require('colors');

var server = require('./index');

program
	.version('0.0.1')
	.option('-m, --model [file]', 'CMS Model file (json). Default is ./default/model.json')
	.option('-d, --data [file]', 'CMS Data file (json). Default is ./default/data.json')
	.option('-p, --port [port]', 'Server port. Default is 3000')
	.parse(process.argv);

var port = program.port || 3000;
var modelFile = program.model || 'default/model.json';
var dataFile = program.data || 'default/data.json';

server.run(modelFile, dataFile, port);
