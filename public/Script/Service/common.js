var app = angular.module('myApp');

app.service('common', ['$timeout', '$location', 
    function($timeout, $location) {
   
    //L'objet de notification avec ces différents mode
    var common = {};

    //Ce qui est exécuter au chargement d'un controlleur
    common.start = function(){
            //Cache la navbar (S'il est était ouverte)
            $(".navbar-collapse").collapse('hide');
    }

    common.obtenirRef = function() {
        return database;
    }

    common.findBootstrapEnvironment = function() {
        var envs = ['xs', 'sm', 'md', 'lg'];

        $el = $('<div>');
        $el.appendTo($('body'));

        for (var i = envs.length - 1; i >= 0; i--) {
            var env = envs[i];

            $el.addClass('hidden-'+env);
            if ($el.is(':hidden')) {
                $el.remove();
                return env;
            }
        };
    }

    common.capitalize = function(str) {
        if(str){
           return str.replace(/\w\S*/g, function(txt) {
               return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
           });
        }
        return str;
   }

    common.$timeout = $timeout;
    common.$location = $location;

    return common;
 }]);