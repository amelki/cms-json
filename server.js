#!/usr/bin/env node
var express = require('express');
var program = require('commander');
var process = require('process');
var fs = require('fs');
var colors = require('colors');

var server = require('./index');

program
	.version('0.0.1')
	.option('-s, --schema [file]', 'JSON schema for the CMS. Default is ./default/schema.json')
	.option('-m, --model [file]', 'Deprecated. Previous representation of a model, until v0.40')
	.option('-d, --data [file]', 'CMS Data file (json). Default is ./default/data.json')
	.option('-p, --port [port]', 'Server port. Default is 3000')
	.option('-e, --env [env]', 'One of production or development. Development will use the webpack server')
	.parse(process.argv);

var port = program.port || 3000;
var modelFile = program.schema || program.model || 'default/schema.json';
var dataFile = program.data || 'default/data.json';
var env = program.env || 'production';

server.run({ modelFile: modelFile, dataFile: dataFile, port: port, env: env});
