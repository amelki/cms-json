'use strict';

var init = require('./init');
var $ = require('jquery');

module.exports = function($scope, $routeParams, $http, $sce, $timeout, WalkerService) {
	init($scope, $http, $sce, WalkerService);
	var path = $routeParams.path.split("/");
	$scope.form = WalkerService.findNode(path);
	$timeout(function () {
		var matchingPath = path;
		if ($scope.form.model.list) {
			matchingPath = path.slice(0, path.length-1);
		}
		matchingPath = "/" + matchingPath.join('/');
		$("#sidebar nav a[data-path='" + matchingPath + "']").addClass('selected');
	});
	$scope.name = function(field) {
		return (typeof field == 'object') ? field.name : field;
	};
	$scope.type = function(field) {
		if (typeof field == 'object') {
			switch (field.type) {
				case 'markdown':
				case 'html':
					return "textarea";
				case 'boolean':
					return "checkbox";
				default:
					return "text";
			}
		} else {
			return "text";
		}
	};
	$scope.value = function(item, field) {
		var fieldName =  (typeof field == 'object') ? field.name : field;
		return item[fieldName];
	};
	$scope.checked = function(item, field) {
		var fieldName =  (typeof field == 'object') ? field.name : field;
		if (item[fieldName]) {
			return "checked";
		}
	};
};
