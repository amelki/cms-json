'use strict';

var init = require('./init');

module.exports = function($scope, $routeParams, $http, $sce, WalkerService) {
	init($scope, $http, $sce, WalkerService);
	$scope.right = null;
};
