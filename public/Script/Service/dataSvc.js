var app = angular.module('myApp');

app.service('dataSvc', ['$firebaseObject', '$firebaseArray', 'authentificationSvc','$http', '$q',
    function ($firebaseObject, $firebaseArray, authentificationSvc, $http, $q) {

        //L'objet de notification avec ces différents mode
        var data = {};
        var ref = firebase.database().ref();

        data.getVentes = function(){
            var produit = data.nomProduit();

            if(produit){
                return $http.get('/api/ventes', { 
                    params : { 
                        produit: produit,
                    } 
                });
            } else {
                toastr["warning"]("Configurer le nom du produit !")
                return $q.when(false);
            }
        }

		data.nomProduit = function(nom){
			if(nom){
				localStorage["nomProduit"] = nom;
			} else {
				if(localStorage["nomProduit"]){
					return localStorage["nomProduit"];
				} else {
					return null;
				}
			}
		}

		data.shopUrl = function(shopUrl){
			if(shopUrl){
				localStorage["shopUrl"] = shopUrl;
			} else {
				if(localStorage["shopUrl"]){
					return localStorage["shopUrl"];
				} else {
					return null;
				}
			}
		}

        return data;
    }]);

