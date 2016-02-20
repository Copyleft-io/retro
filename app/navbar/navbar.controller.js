'use strict';
app.controller('NavbarCtrl', function($scope, $state, $firebaseAuth, FIREBASE_URL, Users){

    var ref = new Firebase(FIREBASE_URL);
    $scope.authObj = $firebaseAuth(ref);
    //$scope.userObj = null;
    $scope.loggedin = false;

    // RUNS ON INITIALIZATION AND ON AUTH CHANGES
    $scope.authObj.$onAuth(function(authData) {
      if (authData) {
        console.log("[onAuth] Logged in as:", authData.uid);
        $scope.userObj = Users.getProfile(authData.uid);
        $scope.loggedin = true;
        console.log($scope.userObj);
        console.log("User logged in: ", $scope.loggedin);
      } else {
        console.log("[onAuth] Logged out");
        $scope.userObj = {};
        $scope.loggedin = false;
        console.log($scope.userObj);
        console.log("User logged in: ", $scope.loggedin);
      }
    });

    // $scope.login = function(){
    //   $scope.authObj.$authWithPassword({
    //     email: $scope.user.email,
    //     password: $scope.user.password
    //     }).then(function(authData) {
    //         console.log("[authWithPassword] Logged in as:", authData.uid);
    //     }).catch(function(error) {
    //         console.error("[authWithPassword] Authentication failed:", error);
    //     });
    // };
    //
    $scope.logout = function(){
       $scope.authObj.$unauth();
       console.log("[unauth] Logged out");
       $state.go('login');
     };

  });

console.log('--> retrofire/app/navbar/navbar.controller.js loaded');
