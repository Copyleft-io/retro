'use strict';

app.controller("QuestionsCtrl", function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, User, Questions) {

    $scope.questions = Questions();
    $scope.user = User;

    // add a new question
    $scope.create = function() {

      $scope.questions.$add({

        userId: $scope.question.userId  || User.getId(),
        content: $scope.question.content,
        createdAt: Firebase.ServerValue.TIMESTAMP

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
      $scope.question.views.transaction(function (current_value) {
        return (current_value || 0) + 1;
      });
    };

    // update a question and save it
    $scope.update = function() {
      // save firebaseObject
      $scope.question.updatedAt = Firebase.ServerValue.TIMESTAMP;
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

});

console.log('--> questions.controller.js loaded');
