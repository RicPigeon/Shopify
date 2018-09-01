
var app = angular.module('myApp');

app.directive('jqdatepicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
		scope: {
			date: '='
		},
         link: function (scope, element, attrs, ngModelCtrl) {
            element.datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (date) {
                    scope.date = date;
                    scope.$apply();
                },
				altField: "#datepicker",
				closeText: 'Fermer',
				prevText: 'Pr\351c\351dent',
				nextText: 'Suivant',
				currentText: 'Aujourd\'hui',
				monthNames: ['Janvier', 'F\351vrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Ao\371t', 'Septembre', 'Octobre', 'Novembre', 'D\351cembre'],
				monthNamesShort: ['Janv.', 'F\351vr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Ao\371t', 'Sept.', 'Oct.', 'Nov.', 'D\351c.'],
				dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
				dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
				dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
				weekHeader: 'Sem.',
            });
        }
    };
});