'use strict';

var app = angular.module('retrofire', ['firebase','angular-md5','ui.bootstrap','ui.router', 'ngTable', 'textAngular'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        //templateUrl: 'static/home.html',
        resolve: {
          requireNoAuth: function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('dashboard');
            }, function(error){
              $state.go('login');
            });
          }
        }
      })
      .state('login', {
        url: '/login',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/login.html',
        resolve: {
          requireNoAuth: function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('dashboard');
            }, function(error){
              return;
            });
          }
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
          auth: function($state, Users, Auth){
            return Auth.$requireAuth().catch(function(){
              $state.go('home');
            });
          },
          profile: function(Users, Auth){
            return Auth.$requireAuth().then(function(auth){
              return Users.getProfile(auth.uid).$loaded();
            });
          }
        }
      })
      .state('dashboard', {
        url: '/dashboard',
        controller: 'DashboardCtrl as dashboardCtrl',
        templateUrl: 'dashboard/index.html',
        resolve: {
          auth: function($state, Users, Auth){
            return Auth.$requireAuth().catch(function(){
              $state.go('login');
            });
          },
          dashboard: function(Users, Auth){
            return Auth.$requireAuth().then(function(auth){
              return Users.getProfile(auth.uid).$loaded();
            });
          }
        }
      })
      .state('directory', {
        url: '/directory',
        controller: 'DirectoryCtrl as directoryCtrl',
        templateUrl: 'directory/index.html',
        resolve: {
          auth: function($state, Users, Auth){
            return Auth.$requireAuth().catch(function(){
              $state.go('login');
            });
          },
          dashboard: function(Users, Auth){
            return Auth.$requireAuth().then(function(auth){
              return Users.getProfile(auth.uid).$loaded();
            });
          }
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
				  questions: function (Questions){
					  return Questions();
				  }
			  }
		  })
		  .state('questions/create', {
			  url: '/questions/create',
			  templateUrl: 'questions/create.html',
			  controller: 'QuestionCtrl as questionCtrl'
		  });

    $urlRouterProvider.otherwise('/')

  })
.constant('FIREBASE_URL', 'https://ss16-retrofire.firebaseio.com/');

console.log('--> retrofire/app/app.js loaded');
