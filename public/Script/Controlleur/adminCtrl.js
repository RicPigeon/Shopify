var app = angular.module('myApp');

app.controller('adminCtrl', 
	function($scope, $firebaseAuth, $location, $timeout, common, authentificationSvc){
	
	common.start();
});