var app = angular.module('myApp');

app.controller('accueilCtrl',
	function ($scope, common, dataSvc) {

		common.start();

		$scope.nomProduit = dataSvc.nomProduit();
		$scope.shopUrl = dataSvc.shopUrl();

		$scope.nomProduitChange = dataSvc.nomProduit;
		$scope.shopUrlChange = dataSvc.shopUrl;

});