'use strict';

var init = require('./init');

module.exports = function($scope, $routeParams, $http, WalkerService) {
	init($scope, $http, WalkerService);
	$scope.right = null;
};
