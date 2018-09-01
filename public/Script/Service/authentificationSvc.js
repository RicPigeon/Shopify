var app = angular.module('myApp');

app.service('authentificationSvc', ['$firebaseAuth', '$q', '$location','$rootScope', 'common',
    function ($firebaseAuth, $q, $location, $rootScope, common) {

        // Initialize Firebase
        var authentification = firebase.auth();
        var database = firebase.database();
        var ref = firebase.database().ref();

        var getEstAdmin = null;
        var compagnieID = null;

        var authentifier = {};


        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in.
                authentifier.estAdmin().then(function(admin) {
                    if(admin){
                        $location.path('/ventes');
                    } else {
                        if($rootScope.history && $rootScope.history.length > 0){
                            var path = $rootScope.history[0] === '/' || $rootScope.history[0] === '' ? '/accueil' : $rootScope.history[0];

                            common.$timeout(function(){
                                //console.log('redirect', path);
                                $location.path(path);
                            });
                        }
                    }
                });
                $rootScope.$broadcast('updateMenu');
            }
        });

        authentifier.estAuthentifier = function () {
            var user = authentification.currentUser;
            if (user) {
                return true;
            } else {
                return false;
            }
        }


        authentifier.compagnieID = function () {
            var deffered = $q.defer();
            var user = firebase.auth().currentUser;

            if(compagnieID > 0){
                deffered.resolve(compagnieID);            
            } else {
                if (user) {
                    var name = user.email.substring(0, user.email.lastIndexOf("@"));
                    name = name.replace(/\.|#|$|[|]/g, "");

                    console.log(name);
                    var refUsers = ref.child('/users/' + name);

                    refUsers.once("value").then(function (data) {
                        compagnieID = data.val() || null;
                        deffered.resolve(data.val() || null);
                    });

                } else {
                    compagnieID = null;
                    deffered.resolve(null);
                }
            }

            return deffered.promise;
        }


        authentifier.estAdmin = function () {
            var deffered = $q.defer();
            var user = authentification.currentUser;
            if (user) {
                var name = user.email.substring(0, user.email.lastIndexOf("@"));
                name = name.replace(/\.|#|$|[|]/g, "");
                var refAdmin = database.ref('/admin/' + name);

                refAdmin.once("value").then(function (data) {
                    if (data.val()) {
                        getEstAdmin = true;
                    } else {
                        getEstAdmin = false;
                    }
                    deffered.resolve(getEstAdmin);
                });
            } else {
                getEstAdmin = false;
                deffered.resolve(getEstAdmin);
            }

            return deffered.promise;
        }

        authentifier.getAuthentificationCredit = function () {
            return authentification.currentUser;
        }

        authentifier.connexion = function (email, password) {
            authentification.signInWithEmailAndPassword(email, password).catch(function (error) {
                //Une erreur
                if (error.code = "auth/wrong-password") {
                    toastr["error"]("Mot de passe incorrecte.", "Attention");
                }
            });
        }

        authentifier.deconnexion = function () {
            //On vide les informations d'authentification
            getEstAdmin = false;
            authentification.signOut().then(function () {
                // Sign-out successful.
                $location.path('/');
                console.log("Sign-out successful.");
            }, function (error) {
                // An error happened.
                console.log("An error happened.");
            });
        }

        authentifier.changerMotDePasse = function (email, oldpass, newPassword) {
            var deffered = $q.defer();
            var user = authentification.currentUser;
            authentification.currentUser.reauthenticate(firebase.auth.EmailAuthProvider.credential(email, oldpass));

            window.setTimeout(function() {
                user.updatePassword(newPassword).then(function () {
                    // Update successful.
                    console.log("Updated.");
                    authentification.currentUser.reauthenticate(firebase.auth.EmailAuthProvider.credential(email, newPassword));
                    deffered.resolve(true);
                }, function (error) {
                    deffered.resolve(false);
                });
            }, 1000);

            return deffered.promise;

        }


        return authentifier;

    }]);

