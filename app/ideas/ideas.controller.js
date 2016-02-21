'use strict';

app.controller("IdeasCtrl", function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, User, Users, Comments, Ideas, esClient, Vote) {
    $scope.ideas = Ideas();
    $scope.comments = new Comments("ideas");
    console.log("Comments: " + $scope.comments);
    $scope.vote = new Vote('ideas');
    $scope.user = User;
    $scope.users = Users;

    // add a new idea
    $scope.create = function(idea) {
        idea.createdAt = Firebase.ServerValue.TIMESTAMP;
        idea.userId = User.getId();
        idea.views = 0;
        $scope.ideas.$add(idea).then(function(newIdea) {
            newIdea.setPriority(0);
            console.log('idea Created');

            var refId = newIdea.key();
            var ideaObject = $scope.ideas.$getRecord(newIdea.key());
            var ideaObjectTags = ideaObject.tags || [];
            var ideaTagsArray = [];
            ideaObjectTags.forEach(function (tag) {
              ideaTagsArray.push(tag.text);
            });

            // Elastic Search Client Create A New Index
            esClient.create({
              index: 'retrofire',
              type: 'idea',
              id: refId,
              body: {
                firebaseId: refId,
                title: ideaObject.title,
                content: ideaObject.content,
                tags: ideaTagsArray,
                createdAt: ideaObject.createdAt,
                createdById: ideaObject.userId
              }
            }, function (error, response) {
                console.log(error);
                console.log(response);
            });

            $state.go('ideas');

        }).catch(function(error) {
            console.log(error);
        });
    };

    // remove an idea
    $scope.delete = function(idea) {
        $scope.ideas.$remove(idea).then(function(deletedIdea){
            console.log('idea Deleted');
            var refId = deletedIdea.key();
            esClient.delete({
                index: 'retrofire',
                type: 'idea',
                id: refId
              }, function (error, response) {
                // ...
              });
        }).catch(function(error){
            console.log(error);
        });
    };

    // getIdea on init for /idea/edit/:id route
    $scope.getIdea = function() {
        var ref = new Firebase(FIREBASE_URL + 'ideas');
        var idea;

        $scope.idea = $firebaseObject(ref.child($stateParams.ideaId));

        ref.child($stateParams.ideaId).once("value", function(snapshot) {
            idea = snapshot.val();

            var currentViews = idea.views;
            var incrementViews = currentViews + 1;
            var ideaRef = ref.child($stateParams.ideaId);
            ideaRef.update({
                views: incrementViews
            });
        });
    };

    // update an idea and save it
    $scope.update = function(goTo) {
        // save firebaseObject
        $scope.idea.updatedAt = Firebase.ServerValue.TIMESTAMP;
        $scope.idea.$save().then(function(updatedIdea){
            console.log('idea Updated');

            var refId = updatedIdea.key();
            var ideaObject = $scope.ideas.$getRecord(updatedIdea.key());
            var ideaObjectTags = ideaObject.tags;
            var ideaTagsArray = [];
            ideaObjectTags.forEach(function (tag) {
              ideaTagsArray.push(tag.text);
            });

            // Elastic Search Client Create A New Index
            esClient.update({
              index: 'retrofire',
              type: 'idea',
              id: refId,
              body: {
                doc: {
                  firebaseId: refId,
                  title: ideaObject.title,
                  content: ideaObject.content,
                  tags: ideaTagsArray,
                  createdAt: ideaObject.createdAt,
                  createdById: ideaObject.userId
                }
              }
            }, function (error, response) {
                console.log(error);
                console.log(response);
            });

            if (goTo != null) {
                $state.go(goTo);
            }

        }).catch(function(error){
            console.log(error);
        });
    };

    $scope.upVote = function(scopeObject) {

        var scopeObject = scopeObject || $scope.idea;

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

        scopeObject.votes = scopeObject.upvotes.length - scopeObject.downvotes.length;
        $scope.update();
    };

    $scope.downVote = function(scopeObject) {

        var scopeObject = scopeObject || $scope.idea;

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
        scopeObject.votes = scopeObject.upvotes.length - scopeObject.downvotes.length;
        $scope.update();

    };

    // Since the data is asynchronous we'll need to use the $loaded promise.
    // Once data is available we'll set the data variable and init the ngTable
    $scope.ideas.$loaded().then(function(ideas) {
        console.log(ideas.length); // data is loaded here
        var data = ideas;

        $scope.tableIdeas = new ngTableParams({
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
            $scope.tableIdeas.reload();
        });
    });
});

console.log('--> retrofire/app/devices/ideas.controller.js loaded');
