'use strict';

var assert = require('assert');
var init = require('./init');

module.exports = function($scope, $routeParams, $http, WalkerService) {
	init($scope, $http, WalkerService);
	var path = $routeParams.path.split("/");
	$scope.right = WalkerService.findNode(path);
	assert.notEqual($scope.right.model, null, path);
	assert.notEqual($scope.right.data, null, path);
	$scope.summary = function(model, data) {
		return data[WalkerService.defautFieldName(model)];
	};
	$scope.link = function(index) {
		return "/item/" + path.join('/') + '/' + index;
	};
	$scope.deleteItem = function(parent, index) {
		parent.splice(index, 1);
	};
	$scope.addItem = function(model, data) {
		var item = {};
		item[WalkerService.defautFieldName(model)] = "New Item";
		data[data.length] = item;
	};
};
