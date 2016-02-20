'use strict';

var deleteFromArray = function (array, element) {
  var index = array.indexOf(element);

  while (index !== -1) {
    array.splice(index, 1);
    index = array.indexOf(element);
  }
};

var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

app.controller("QuestionsCtrl", function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, User, Users, Questions) {

    $scope.questions = Questions();
    $scope.user = User;
    $scope.users = Users;

    // add a new question
    $scope.create = function() {

      $scope.questions.$add({

        userId: $scope.question.userId || User.getId(),
        content: $scope.question.content,
        tags: $scope.question.tags || [ 'tomcat', 'hadoop', 'node.js' ],
        views: 0,
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
      var question = ref.child($stateParams.questionId);
      $scope.question = $firebaseObject(question);
      question.child('views').transaction(function (views) {
        return (views || 0) + 1;
      });
    };

    // update a question and save it
    $scope.update = function(goTo) {
      // save firebaseObject
      $scope.question.updatedAt = Firebase.ServerValue.TIMESTAMP;
      $scope.question.$save().then(function(){
        console.log('question Updated');

        if (goTo != null) {
          $state.go(goTo);
        }

      }).catch(function(error){
        console.log(error);
      });
    };

    $scope.upVote = function(scopeObject) {

      var scopeObject = scopeObject || $scope.question;

      scopeObject.upvotes || (scopeObject.upvotes = []);
      scopeObject.downvotes || (scopeObject.downvotes = []);

      if (!(indexOf.call(scopeObject.upvotes, User.getId()) >= 0)) {
        console.log("Casting vote for " + User.getId());
        scopeObject.upvotes.push(User.getId());
        deleteFromArray(scopeObject.downvotes, User.getId());
      } else {
        console.log("Removing vote");
        deleteFromArray(scopeObject.upvotes, User.getId());
      }

      scopeObject.votes = scopeObject.upvotes.length + scopeObject.downvotes.length;
      $scope.update()

    };

  $scope.downVote = function(scopeObject) {

    var scopeObject = scopeObject || $scope.question;

    scopeObject.upvotes || (scopeObject.upvotes = []);
    scopeObject.downvotes || (scopeObject.downvotes = []);

    if (!(indexOf.call(scopeObject.downvotes, User.getId()) >= 0)) {
      console.log("Casting vote for " + User.getId());
      scopeObject.downvotes.push(User.getId());
      deleteFromArray(scopeObject.upvotes, User.getId());

    } else {
      console.log("Removing vote");
      deleteFromArray(scopeObject.downvotes, User.getId());
    }
    scopeObject.votes = scopeObject.upvotes.length + scopeObject.downvotes.length;
    $scope.update()

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
