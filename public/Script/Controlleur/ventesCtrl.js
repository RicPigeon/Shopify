var app = angular.module('myApp');

app.controller('ventesCtrl', 
	function($scope, $firebaseAuth, $location, $timeout, common, dataSvc, NgTableParams, excelManagerSvc){	
	
	//var produit = "Forfait Découverte NOAH SPA de Thetford Mines";
	common.start();	
	var donnees = [];

	$scope.chargement = true;
	dataSvc.getVentes().then(function(res){
		if(res){
			loadTable(res.data);
			donnees = res.data;
		}
		$scope.chargement = false;
	});

	function loadTable(data){
		$scope.tableParams = new NgTableParams({
			count: 25 // initial page size
		}, { 
			paginationMaxBlocks: 13,
        	paginationMinBlocks: 2,
			dataset: data
		});
	}
	
	$scope.exporter = function(){
		excelManagerSvc.exporter(donnees);
	}

});