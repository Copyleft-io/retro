'use strict';
app.controller('AuthCtrl', function(Auth, $state, $scope, $rootScope){
    var authCtrl = this;

    authCtrl.user = {
      email: '',
      password: ''
    };

    // authCtrl.google = function() {
    //   var ref = new Firebase(FIREBASE_URL);
    //   ref.authWithOAuthPopup("google", function(error, authData) {
    //     if (error) {
    //       console.log("Login Failed!", error);
    //     } else {
    //       console.log("Authenticated successfully with payload:", authData);
    //     }
    //   });
    // };

    authCtrl.login = function (){
      Auth.$authWithPassword(authCtrl.user).then(function (authData){
        console.log("Logged in as: ",authData.uid);
        $state.go('dashboard');
      }, function (error){
        authCtrl.error = error;
      });
    };

    /* Removing Registration Functionality
    Email Logins should be managed by an admin interface
    This can be done via Firebase Forge in the meantime

    authCtrl.register = function (){
      Auth.$createUser(authCtrl.user).then(function (user){
        authCtrl.login();
      }, function (error){
        authCtrl.error = error;
      });
    };
    */



  });
  console.log('--> retrofire/app/auth/auth.controller.js loaded');
