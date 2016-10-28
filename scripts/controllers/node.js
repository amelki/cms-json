'use strict';

var assert = require('assert');
var init = require('./init');

module.exports = function($scope, $routeParams, $http, WalkerService) {
	init($scope, $http, WalkerService);
	var path = $routeParams.path.split("/");
	var node = WalkerService.findNode(path);
	assert.notEqual(node.model, null, path);
	assert.notEqual(node.data, null, path);
	if (!node.model.children) {
		$scope.right = node;
		$scope.summary = function (model, data) {
			return data[WalkerService.defautFieldName(model)];
		};
		$scope.link = function (index) {
			return "/item/" + path.join('/') + '/' + index;
		};
		$scope.deleteItem = function (parent, index) {
			parent.splice(index, 1);
		};
		$scope.addItem = function (model, data) {
			var item = {};
			item[WalkerService.defautFieldName(model)] = "New Item";
			data[data.length] = item;
		};
	}
};
