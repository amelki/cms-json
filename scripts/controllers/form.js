'use strict';

var init = require('./init');

module.exports = function($scope, $routeParams, $http, WalkerService) {
	init($scope, $http, WalkerService);
	var path = $routeParams.path.split("/");
	$scope.form = WalkerService.findNode(path);
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
