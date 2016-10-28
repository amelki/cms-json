'use strict';

var app = require('angular').module('cmsApp');

app.controller('HomeController', require('./home'));
app.controller('NodeController', require('./node'));
app.controller('ItemController', require('./item'));
