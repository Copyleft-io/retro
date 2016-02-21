'use strict';


app.controller("TaggedCtrl", function($state, $scope, $stateParams, FIREBASE_URL, Users, esClient) {

    $scope.users = Users;
    $scope.getIdsByTag = function() {
        esClient.search({
            q: $stateParams.tag
        }, function (error, response) {
            console.log(response.hits);
            $scope.tagged || ($scope.tagged  = {});
            $scope.tag = $stateParams.tag;
            $scope.tagged[$scope.tag] = response.hits.hits;
            console.log(response.hits);
        });
    };

});

console.log('--> questions.controller.js loaded');
