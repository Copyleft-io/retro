'use strict';

var app = angular.module('retrofire', ['firebase','angular-md5','ui.bootstrap','ui.router', 'ngTable', 'textAngular'])
  .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        //templateUrl: 'static/home.html',
        resolve: {
          requireNoAuth: ["$state", "Auth", function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('dashboard');
            }, function(error){
              $state.go('login');
            });
          }]
        }
      })
      .state('login', {
        url: '/login',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/login.html',
        resolve: {
          requireNoAuth: ["$state", "Auth", function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('dashboard');
            }, function(error){
              return;
            });
          }]
        }
      })
      .state('about', {
        url: '/about',
        templateUrl: 'static/about.html'
      })
      .state('profile', {
        url: '/profile',
        controller: 'ProfileCtrl as profileCtrl',
        templateUrl: 'users/profile.html',
        resolve: {
          auth: ["$state", "Users", "Auth", function($state, Users, Auth){
            return Auth.$requireAuth().catch(function(){
              $state.go('home');
            });
          }],
          profile: ["Users", "Auth", function(Users, Auth){
            return Auth.$requireAuth().then(function(auth){
              return Users.getProfile(auth.uid).$loaded();
            });
          }]
        }
      })
      .state('dashboard', {
        url: '/dashboard',
        controller: 'DashboardCtrl as dashboardCtrl',
        templateUrl: 'dashboard/index.html',
        resolve: {
          auth: ["$state", "Users", "Auth", function($state, Users, Auth){
            return Auth.$requireAuth().catch(function(){
              $state.go('login');
            });
          }],
          dashboard: ["Users", "Auth", function(Users, Auth){
            return Auth.$requireAuth().then(function(auth){
              return Users.getProfile(auth.uid).$loaded();
            });
          }]
        }
      })
      .state('directory', {
        url: '/directory',
        controller: 'DirectoryCtrl as directoryCtrl',
        templateUrl: 'directory/index.html',
        resolve: {
          auth: ["$state", "Users", "Auth", function($state, Users, Auth){
            return Auth.$requireAuth().catch(function(){
              $state.go('login');
            });
          }],
          dashboard: ["Users", "Auth", function(Users, Auth){
            return Auth.$requireAuth().then(function(auth){
              return Users.getProfile(auth.uid).$loaded();
            });
          }]
        }
      })
      .state('directory/user', {
        url: '/directory/user/{userId}',
        templateUrl: 'directory/view.html',
        controller: 'DirectoryCtrl as directoryCtrl'
      });
    $urlRouterProvider.otherwise('/');
  }])
.constant('FIREBASE_URL', 'https://ss16-retrofire.firebaseio.com/');

console.log('--> retrofire/app/app.js loaded');

'use strict';
app.factory('Auth', ["$firebaseAuth", "FIREBASE_URL", function($firebaseAuth, FIREBASE_URL){
    var ref = new Firebase(FIREBASE_URL);
    var auth = $firebaseAuth(ref);
    return auth;
  }]);
console.log('--> retrofire/app/auth/auth.service.js loaded');

'use strict';
app.controller('AuthCtrl', ["Auth", "$state", "$scope", "$rootScope", function(Auth, $state, $scope, $rootScope){
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



  }]);
  console.log('--> retrofire/app/auth/auth.controller.js loaded');

'use strict';
app.factory('Users', ["$firebaseArray", "$firebaseObject", "FIREBASE_URL", function($firebaseArray, $firebaseObject, FIREBASE_URL){
    var usersRef = new Firebase(FIREBASE_URL+'users');
    var connectedRef = new Firebase(FIREBASE_URL+'.info/connected');
    var users = $firebaseArray(usersRef);
    var Users = {
      getProfile: function(uid){
        return $firebaseObject(usersRef.child(uid));
      },
      getEmail: function(uid){
        return users.$getRecord(uid).email;
      },
      getDisplayName: function(uid){
        return users.$getRecord(uid).displayName;
      },
      getGravatar: function(uid){
        return '//www.gravatar.com/avatar/' + users.$getRecord(uid).emailHash;
      },
      setOnline: function(uid){
        var connected = $firebaseObject(connectedRef);
        var online = $firebaseArray(usersRef.child(uid+'/online'));

        connected.$watch(function (){
          if(connected.$value === true){
            online.$add(true).then(function(connectedRef){
              connectedRef.onDisconnect().remove();
            });
          }
        });
      },
      all: users
    };

    return Users;
  }]);
  console.log('--> retrofire/app/users/users.service.js loaded');

'use strict';
app.service('User', ["FIREBASE_URL", "$firebaseAuth", "Users", function(FIREBASE_URL, $firebaseAuth, Users){

// A Convience Service for getting authenticated user information id and email

var User = this;
var ref = new Firebase(FIREBASE_URL);
var authObj = $firebaseAuth(ref);
var userObj = {
  uid: '',
  email: ''
};

User.getId = function(){
  return userObj.uid;
};

User.getEmail = function(){
  return userObj.email;
};

// RUNS ON INITIALIZATION AND ON AUTH CHANGES
authObj.$onAuth(function(authData) {
  if (authData) {
    console.log("[user service] authenticated User is logged in as:", authData.uid);
    userObj.uid = authData.uid;
    userObj.email = authData.password.email;
    return userObj;
      } else {
    console.log("[user service] authenticated user Logged out");
    userObj = {
      uid: '',
      email: ''
    };
    console.log("[user service] returned user:", userObj);
    return userObj;
  }
});


}]);

console.log('--> retrofire/app/user.service.js loaded');

'use strict';
app.controller('ProfileCtrl', ["$state", "Auth", "md5", "auth", "profile", "User", "Users", function($state, Auth, md5, auth, profile, User, Users){
    var profileCtrl = this;
    profileCtrl.profile = profile;
    profileCtrl.updateProfile = function(){
      profileCtrl.profile.email = auth.password.email;
      profileCtrl.profile.emailHash = md5.createHash(auth.password.email);
      //profileCtrl.profile.gravatar = Users.getGravatar(User.getId);
      profileCtrl.profile.$save().then(function(){
        $state.go('dashboard');
      });
    };
    profileCtrl.logout = function(){
      profileCtrl.profile.online = null;
      profileCtrl.profile.$save().then(function(){
        Auth.$unauth();
        $state.go('login');
      });
    };
  }]);

console.log('--> retrofire/app/users.profile.js loaded');

'use strict';
app.controller('NavbarCtrl', ["$scope", "$state", "$firebaseAuth", "FIREBASE_URL", "Users", function($scope, $state, $firebaseAuth, FIREBASE_URL, Users){

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

  }]);

console.log('--> retrofire/app/navbar/navbar.controller.js loaded');

'use strict';

app.controller('DashboardCtrl', ["$state", "md5", "auth", function($state, md5, auth){
    var DashboardCtrl = this;

  }]);

console.log('--> retrofire/app/dashboard/dashboard.controller.js loaded');

'use strict';
app.controller('DirectoryCtrl', ["$state", "$scope", "FIREBASE_URL", "$firebaseObject", "$firebaseArray", "$stateParams", "ngTableParams", "$filter", "Users", function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, Users){

    var usersRef = new Firebase(FIREBASE_URL+'users');
    $scope.users = $firebaseArray(usersRef);

    // getUser on /directory/user/view/:id route
    $scope.getUser = function() {
    var ref = new Firebase(FIREBASE_URL + 'users');
    $scope.user = $firebaseObject(ref.child($stateParams.userId));
    };

    // Since the data is asynchronous we'll need to use the $loaded promise.
    // Once data is available we'll set the data variable and init the ngTable
    $scope.users.$loaded().then(function(users) {
      console.log(users.length); // data is loaded here
      var data = users;

      $scope.tableDirectory = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: { title: 'asc' }    // initial sorting
        }, {
            total: data.length, // length of data
            getData: function($defer, params) {
                // use build-in angular filter
                var orderedData = params.sorting() ? $filter('filter')(data, params.filter()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    });

    // Listening for list updates to Procedures to update Table
    var ref = new Firebase(FIREBASE_URL + 'users');
    var list = $firebaseArray(ref);
    list.$watch(function(event) {
      console.log(event);
      $scope.users.$loaded().then(function(){
        $scope.tableDirectory.reload();
      });
    });

}]);

console.log('--> retrofire/app/directory.controller.js loaded');
