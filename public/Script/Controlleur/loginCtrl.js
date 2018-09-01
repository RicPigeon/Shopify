var app = angular.module('myApp');

app.controller('loginCtrl', 
	function($scope, $firebaseAuth, $location, $timeout, common, authentificationSvc){
	
	common.start();

	$scope.email = { data: '' };
	$scope.pass = { data: '' };

	var authentification = authentificationSvc.estAuthentifier();
	if(authentification){
		authentificationSvc.estAdmin().then(function(admin){
			if(admin){
				$location.path('/ma-admin');
			} else {
				$location.path('/ventes');
			}
		});
	}
	
	$scope.connexionClick = function(email, pass){
		authentificationSvc.connexion(email, pass);
	};

});