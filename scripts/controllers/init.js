'use strict';

var assert = require('assert');

module.exports = function($scope, $http, $sce, WalkerService) {
	$scope.model = WalkerService.model();
	$scope.data = WalkerService.data();
	$scope.tree = WalkerService.tree();
	$scope.save = function(data) {
		$http.post('/data.json', data);
	};
	$scope.trustAsHtml = function (html) {
		return $sce.trustAsHtml(html);
	};
};