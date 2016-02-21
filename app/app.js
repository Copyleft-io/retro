'use strict';

var app = angular.module('retrofire', ['firebase','angular-md5','ui.bootstrap','ui.router', 'ngTable', 'ngTagsInput', 'textAngular','elasticui', 'elasticsearch'])
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
      .state('register', {
        url: '/register',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/register.html',
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
      .state('password-reset', {
        url: '/password-reset',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/password-reset.html',
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
          auth: requireAuth,
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
          auth: requireAuth,
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
          auth: requireAuth,
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
          auth: requireAuth,
          questions: function (Questions){
            return Questions();
          }
        }
      })
      .state('questions/create', {
        url: '/questions/create',
        templateUrl: 'questions/create.html',
        controller: 'QuestionsCtrl as questionsCtrl',
        resolve: { auth: requireAuth }
      })
      .state('questions/edit', {
        url: '/questions/edit/{questionId}',
        templateUrl: 'questions/edit.html',
        controller: 'QuestionsCtrl as questionsCtrl',
          resolve: { auth: requireAuth }
      })
      .state('questions/view', {
        url: '/questions/{questionId}',
        templateUrl: 'questions/view.html',
        controller: 'QuestionsCtrl as questionsCtrl',
        resolve: { auth: requireAuth }
      })
      .state('ideas', {
          url: '/ideas',
          controller: 'IdeasCtrl as ideasCtrl',
          templateUrl: 'ideas/index.html',
          resolve: {
              ideas: function (Ideas) {
                  return Ideas();
              },
              auth: requireAuth
          }
      })
      .state('ideas/create', {
        url: '/ideas/create',
        templateUrl: 'ideas/create.html',
        controller: 'IdeasCtrl as ideasCtrl',
        resolve: { auth: requireAuth }
      })
        .state('ideas/edit', {
          url: '/ideas/edit/{ideaId}',
          templateUrl: 'ideas/edit.html',
          controller: 'IdeasCtrl as ideasCtrl',
          resolve: { auth: requireAuth }
        })
        .state('ideas/view', {
          url: '/ideas/{ideaId}',
          templateUrl: 'ideas/view.html',
          controller: 'IdeasCtrl as ideasCtrl',
          resolve: { auth: requireAuth }
        })
      .state('memos', {
        url: '/memos',
        templateUrl: 'memos/index.html',
        controller: 'MemosCtrl as memosCtrl',
        resolve: {
          requests: function (Memos){
             return Memos();
           },
          auth: requireAuth
        }
      })
      .state('memos/create', {
        url: '/memos/create',
        templateUrl: 'memos/create.html',
        controller: 'MemosCtrl as memosCtrl',
        resolve: { auth: requireAuth }
      })
      .state('memos/view', {
        url: '/memos/{memoId}',
        templateUrl: 'memos/view.html',
        controller: 'MemosCtrl as memosCtrl',
        resolve: { auth: requireAuth }
      })
      .state('memos/edit', {
        url: '/memos/edit/{memoId}',
        templateUrl: 'memos/edit.html',
        controller: 'MemosCtrl as memosCtrl',
        resolve: { auth: requireAuth }
      })
      .state('elastic', {
        url: '/elastic',
        controller: 'ElasticCtrl as elasticCtrl',
        templateUrl: 'elasticsearch/index.html'
      });

    $urlRouterProvider.otherwise('/')

  })
.constant('FIREBASE_URL', 'https://ss16-retrofire.firebaseio.com/')
.constant('euiHost', 'https://80edaedca1e8ae1c1dc2521c374443e1.us-east-1.aws.found.io:9243');

var requireAuth =  function($state, Users, Auth){
    return Auth.$requireAuth().catch(function(){
        $state.go('login');
    });
};

console.log('--> retrofire/app/app.js loaded');
