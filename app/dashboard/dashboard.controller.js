'use strict';

app.controller('DashboardCtrl', function($state, $scope, esClient, esFactory){

    var DashboardCtrl = this;
    $scope.totalQuestions = questionCount;
    $scope.totalIdeas = ideaCount;
    $scope.totalMemos = memoCount;

    //Elastic Search Query For Count of Type: Idea
    var questionCount = esClient.count({
      type: 'question'
      }, function (error, response) {
       console.log(response.count);
       $scope.totalQuestions = response.count;
       // ...
      });

    //Elastic Search Query For Count of Type: Idea
    var ideaCount = esClient.count({
      type: 'idea'
      }, function (error, response) {
       console.log(response.count);
       $scope.totalIdeas = response.count;
       // ...
      });

    //Elastic Search Query For Count of Type: Memo
    var memoCount = esClient.count({
      type: 'memo'
      }, function (error, response) {
       console.log(response.count);
       $scope.totalMemos = response.count;
       // ...
      });


    console.log('TEST = ' + memoCount);
  });

console.log('--> retrofire/app/dashboard/dashboard.controller.js loaded');
