'use strict';

app.controller("IdeasCtrl", function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, User, Users, Ideas) {
    $scope.ideas = Ideas();
    $scope.user = User;
    $scope.users = Users;

    // add a new idea
    $scope.create = function() {
        $scope.ideas.$add({
            name: $scope.idea.name,
            description: $scope.idea.description,
            //tags: $scope.idea.tags,
            createdAt: new Date().toString(),
            views: 1,
            userId: User.getId()
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
        /*$scope.idea.views = $scope.idea.views++;
        $scope.update();*/
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

    $scope.addComment = function(comment) {
        if($scope.comments === 'undefined') {
            $scope.comments = [];
        }
        $scope.idea.comments.push(comment);
        $scope.update();
        $scope.tableIdeas.reload();
    }

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
