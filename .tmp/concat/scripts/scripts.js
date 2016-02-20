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
      .state('password-reset', {
        url: '/password-reset',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/password-reset.html',
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
      })
		  .state('questions', {
			  url: '/questions',
			  controller: 'QuestionsCtrl as questionsCtrl',
			  templateUrl: 'questions/index.html',
			  resolve: {
				  questions: ["Questions", function (Questions){
					  return Questions();
				  }]
			  }
		  })
		  .state('questions/create', {
			  url: '/questions/create',
			  templateUrl: 'questions/create.html',
        controller: 'QuestionsCtrl as questionsCtrl'
      })
      .state('ideas', {
          url: '/ideas',
          controller: 'IdeasCtrl as ideasCtrl',
          templateUrl: 'ideas/index.html',
          resolve: {
              questions: ["Ideas", function (Ideas){
                  return Ideas();
              }]
          }
      })
      .state('ideas/create', {
          url: '/ideas/create',
          templateUrl: 'ideas/create.html',
          controller: 'IdeasCtrl as ideasCtrl'
      });


    $urlRouterProvider.otherwise('/')

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
app.controller('AuthCtrl', ["FIREBASE_URL", "Auth", "$state", "$scope", "$rootScope", function(FIREBASE_URL, Auth, $state, $scope, $rootScope){
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
app.controller('ProfileCtrl', ["FIREBASE_URL", "$state", "Auth", "md5", "auth", "profile", "User", "Users", function(FIREBASE_URL, $state, Auth, md5, auth, profile, User, Users){
    var ref = new Firebase(FIREBASE_URL);
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

    profileCtrl.changePassword = function(){
      ref.changePassword({
        email       :  profileCtrl.profile.email,
        oldPassword :  profileCtrl.profile.currentPassword,
        newPassword :  profileCtrl.profile.newPassword
      }, function(error) {
          if (error === null) {
            console.log("Password changed successfully");
          } else {
            console.log("Error changing password:", error);
          }
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

'use strict';

app.controller("QuestionsCtrl", ["$state", "$scope", "FIREBASE_URL", "$firebaseObject", "$firebaseArray", "$stateParams", "ngTableParams", "$filter", "User", "Questions", function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, User, Questions) {

    $scope.questions = Questions();
    $scope.userId = User.getId();

    // add a new question
    $scope.create = function() {
      $scope.questions.$add({
        user: $scope.question.user  || $scope.userId,
        question: $scope.question.question

      }).then(function() {
        console.log('question Created');

        $state.go('questions');

      }).catch(function(error) {
        console.log(error);
      });
    };

    // remove an question
    $scope.delete = function(question) {
        $scope.questions.$remove(question).then(function(){
            console.log('question Deleted');
        }).catch(function(error){
            console.log(error);
        });
    };

    // getQuestion on init for /question/edit/:id route
    $scope.getQuestion = function() {
      var ref = new Firebase(FIREBASE_URL + 'questions');
      $scope.question = $firebaseObject(ref.child($stateParams.questionId));
    };

    // update a question and save it
    $scope.update = function() {
      // save firebaseObject
      $scope.question.$save().then(function(){
        console.log('question Updated');
        // redirect to /questions path after update
        //$location.path('/questions');
        $state.go('questions');
      }).catch(function(error){
        console.log(error);
      });
    };

    // Since the data is asynchronous we'll need to use the $loaded promise.
    // Once data is available we'll set the data variable and init the ngTable
    $scope.questions.$loaded().then(function(questions) {
      console.log(questions.length); // data is loaded here
      var data = questions;

      $scope.tablequestions = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: { name: 'asc' }    // initial sorting
        }, {
            total: data.length, // length of data
            getData: function($defer, params) {
                // use build-in angular filter
                var orderedData = params.sorting() ? $filter('filter')(data, params.filter()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    });

    // Listening for list updates to questions to update Table
    var ref = new Firebase(FIREBASE_URL + 'questions');
    var list = $firebaseArray(ref);
    list.$watch(function(event) {
      console.log(event);
      $scope.questions.$loaded().then(function(){
        $scope.tablequestions.reload();
      });
    });

}]);

console.log('--> questions.controller.js loaded');

'use strict';

app.factory("Questions", ["FIREBASE_URL", "$firebaseArray", function QuestionFactory(FIREBASE_URL, $firebaseArray) {
  return function(){
    // snapshot of our data
    var ref = new Firebase(FIREBASE_URL + 'questions');
    // returning synchronized array
    return $firebaseArray(ref);
  }
}]);

console.log('--> questions.service.js loaded');

'use strict';

app.controller("IdeasCtrl", ["$state", "$scope", "FIREBASE_URL", "$firebaseObject", "$firebaseArray", "$stateParams", "ngTableParams", "$filter", "Ideas", function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, Ideas) {
    $scope.ideas = Ideas();

    // add a new idea
    $scope.create = function() {
        $scope.ideas.$add({
            name: $scope.idea.name,
            description: $scope.idea.description,
            comments: $scope.idea.comments,
            tags: $scope.idea.tags,
            views: $scope.idea.views,
            userId: $scope.idea.userId
        }).then(function() {
            console.log('idea Created');
            $state.go('ideas');

        }).catch(function(error) {
            console.log(error);
        });
    };

    // remove an idea
    $scope.delete = function(idea) {
        $scope.ideas.$remove(idea).then(function(){
            console.log('idea Deleted');
        }).catch(function(error){
            console.log(error);
        });
    };

    // getIdea on init for /idea/edit/:id route
    $scope.getIdea = function() {
        var ref = new Firebase(FIREBASE_URL + 'ideas');
        $scope.idea = $firebaseObject(ref.child($stateParams.ideaId));
        $scope.idea.views = $scope.idea.views++;
        $scope.update();
    };

    // update an idea and save it
    $scope.update = function() {
        // save firebaseObject
        $scope.idea.$save().then(function(){
            console.log('idea Updated');
            // redirect to /ideas path after update
            $state.go('ideas');
        }).catch(function(error){
            console.log(error);
        });
    };

    // Since the data is asynchronous we'll need to use the $loaded promise.
    // Once data is available we'll set the data variable and init the ngTable
    $scope.ideas.$loaded().then(function(ideas) {
        console.log(ideas.length); // data is loaded here
        var data = ideas;

        $scope.tableDevices = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: { name: 'asc' }    // initial sorting
        }, {
            total: data.length, // length of data
            getData: function($defer, params) {
                // use build-in angular filter
                var orderedData = params.sorting() ? $filter('filter')(data, params.filter()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    });

    // Listening for list updates to Ideas to update Table
    var ref = new Firebase(FIREBASE_URL + 'ideas');
    var list = $firebaseArray(ref);
    list.$watch(function(event) {
        console.log(event);
        $scope.ideas.$loaded().then(function(){
            $scope.tableDevices.reload();
        });
    });
}]);

console.log('--> basestation/app/devices/ideas.controller.js loaded');
'use strict';

app.factory("Ideas", ["FIREBASE_URL", "$firebaseArray", function IdeaFactory(FIREBASE_URL, $firebaseArray) {
    return function(){
        // snapshot of our data
        var ref = new Firebase(FIREBASE_URL + 'ideas');
        // returning synchronized array
        return $firebaseArray(ref);
    }
}]);

console.log('--> basestation/app/ideas/ideas.service.js loaded');