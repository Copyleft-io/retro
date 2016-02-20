'use strict';
app.controller('DirectoryCtrl', function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, Users){

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

});

console.log('--> retrofire/app/directory.controller.js loaded');
