var app = angular.module('myApp');

app.service('menuSvc', ['authentificationSvc',
	function(authentificationSvc) {
   
   	var menu = {};
   	var menus = [];
   	var menuConnection = {};

	var defaut = {
		affiche: 'Espace client',
		href: '#/connexion',
		controlleur: 'Autre'
	};

	menu.obtenirDefaut = function(){
		return defaut;
	}

    //L'objet de notification avec ces différents mode
  	menu.update = function(){
  		var authCredit = authentificationSvc.getAuthentificationCredit();
		menuConnection.affiche = authCredit.password.email;
		menuConnection.href = '#/espaceClient/';
		menuConnection.deconnexion = true;

		//On est authentifier donc on va changer le menu avec les nouvelles options
		if(menus.length == 0) {
			menus.push();
		}
	}

 	return menu;
 }]);

