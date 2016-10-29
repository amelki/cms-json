'use strict';

var assert = require('assert');
var init = require('./init');
var $ = require('jquery');

module.exports = function($scope, $routeParams, $http, $sce, $timeout, WalkerService) {
	init($scope, $http, $sce, WalkerService);
	var path = $routeParams.path.split("/");
	$timeout(function () {
		// Use that good old jquery to select the current node
		$("#sidebar nav a[data-path='/" + $routeParams.path + "']").addClass('selected');
	});
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
