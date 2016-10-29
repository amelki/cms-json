'use strict';

// Embed the full ES-2015 runtime for 'old' browsers
require("babel-polyfill");
var angular = require('angular');
require('angular-route');
require('angular-sanitize');
require('angular-cookies');

var app = angular.module('cmsApp', [ 'ngRoute', 'ngSanitize', 'ngCookies' ]);

app.constant('VERSION', require('../package.json').version);

require('./services');
require('./controllers');

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	var resolve = {
		init: function(WalkerService) {
			if (WalkerService.model() == null || WalkerService.data() == null) {
				var baseUrl = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
				return WalkerService.init(baseUrl + '/model.json', baseUrl + '/data.json');
			}
		}
	};
	$routeProvider.when('/', {
		templateUrl: '/templates/home.html',
		controller: "HomeController",
		resolve: resolve
	}).when('/node/:path*', {
		templateUrl: '/templates/home.html',
		controller: "NodeController",
		resolve: resolve
	}).when('/item/:path*', {
		templateUrl: '/templates/home.html',
		controller: "ItemController",
		resolve: resolve
	});
	$locationProvider.html5Mode(true);
}]);
