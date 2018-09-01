var app = angular.module('myApp');

app.config(function($routeProvider) {
        $routeProvider

        // route for the home page
        .when('/', {
            templateUrl : 'pages/login.html',
            controller  : 'loginCtrl'
        })
		
		.when('/connexion', {
            templateUrl : 'pages/login.html',
            controller  : 'loginCtrl'
        })

        .when('/accueil', {
            templateUrl : 'pages/accueil.html',
            controller  : 'accueilCtrl'
        })

        .when('/ventes', {
            templateUrl : 'pages/ventes.html',
            controller  : 'ventesCtrl'
        })

        .when('/ma-admin', {
            templateUrl : 'pages/admin.html',
            controller  : 'adminCtrl'
        })


        .when('/erreur', {
            templateUrl : 'pages/erreur.html',
        })

        .otherwise({ redirectTo: '/' });;
});