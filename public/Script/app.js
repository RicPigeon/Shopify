var app = angular.module('myApp', ['ngRoute', 'ngAnimate', 'summernote', 'firebase', 'ngTable']);

//Controlleur permettant de g�rer les changements de pages
app.controller('AppCtrl', 
	function($scope, $window, $location, dataSvc, authentificationSvc, menuSvc, $rootScope) {

	//menu pour les options
 	$scope.menus = [];
 	$rootScope.history = [];

 	//Sous menu de gauche de connection
	$scope.menuConnection = menuSvc.obtenirDefaut();

	$scope.singleton = {
		actuel: false
	};

	$scope.rafraichir = function(){
		window.location.reload(true);
	}
	
	$scope.annuler = function(){
		$window.history.back();
	};

	$scope.$on('$locationChangeStart', function(event, next, current) {
		$rootScope.history.push($location.$$path);
	});

	//Appeler dans AuthentificationSvc
	$scope.$on('updateMenu', function(event, args) {
		//console.log("updateMenu - broadcast")
		updateMenu();
	});

	$scope.deconnexion = function(){
		authentificationSvc.deconnexion();
		$scope.menuConnection = menuSvc.obtenirDefaut();
	}

	$scope.estAuthentifier = function(){
		return authentificationSvc.getAuthentificationCredit() !== null;
	};

	var updateMenu = function(){
  		var authCredit = authentificationSvc.getAuthentificationCredit();
  		$(".navbar-collapse").collapse('hide');

  		if(authCredit){
			$scope.menuConnection.affiche = authCredit.email;
			$scope.menuConnection.href = '#/espaceClient/';
			$scope.menuConnection.deconnexion = true;

			//On est authentifier donc on va changer le menu avec les nouvelles options
			if($scope.menus.length == 0) {
				//Exemple
				$scope.menus.push({
				 	affiche: 'Accueil',
				 	href : '#/accueil',
				 	controlleur: 'accueilCtrl'
				},{
					affiche: 'Ventes',
					href : '#/ventes',
					controlleur: 'ventesCtrl'
			   });
				authentificationSvc.estAdmin().then(function(admin){
					//Supprime Liste des nouveaux clients
  					if(admin){
						$scope.menus.push({
						 	affiche: 'Espace Admin',
						 	href : '#/ma-admin',
						 	controlleur: 'adminCtrl',
						 	icon: '	glyphicon glyphicon-edit'
						});
  					}
  				});
			}
		} else {
			$scope.menus.length = 0;
		}
	}
});