'use strict';
app.controller('AuthCtrl', function(FIREBASE_URL, Auth, $state, $scope, $rootScope){
    var ref = new Firebase(FIREBASE_URL);
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

    authCtrl.resetPassword = function (){
      ref.resetPassword({
        email : authCtrl.user.email
      }, function(error) {
          if (error === null) {
            console.log("Password reset email sent successfully");
          } else {
            console.log("Error sending password reset email:", error);
          }
        });
    };

    /* Removing Registration Functionality
    Email Logins should be managed by an admin interface
    This can be done via Firebase Forge in the meantime*/

    authCtrl.register = function (){
      Auth.$createUser(authCtrl.user).then(function (user){
        authCtrl.login();
      }, function (error){
        authCtrl.error = error;
      });
    };


  });
  console.log('--> retrofire/app/auth/auth.controller.js loaded');
