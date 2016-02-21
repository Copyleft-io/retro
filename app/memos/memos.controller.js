'use strict';

app.controller("MemosCtrl", function($state, $scope, FIREBASE_URL, $firebaseObject, $firebaseArray, $stateParams, ngTableParams, $filter, Memos, User, esClient) {

    $scope.memos = Memos();
    $scope.user = User;

    // CORE CRUD FUNCTIONALITY
    // - CREATE ($add firebaseObject to synchronized firebaseArray)
    // - READ (get firebaseObject using stateParams and Firebase Reference)
    // - UPDATE ($save firebaseObject)
    // - DELETE ($remove firebaseObject)

    // CREATE - ADD A NEW MEMO TO FIREBASE
    $scope.create = function(memo) {
      // Set Default Attributes on Create
      //memo.createdAt = new Date().toString();
      memo.createdAt = Firebase.ServerValue.TIMESTAMP;
      memo.createdBy = User.getEmail();
      memo.createdById = User.getId();
      memo.views = 1;

      // Add New Memo to synchronized firebaseArray
      $scope.memos.$add(memo).then(function(newMemo) {
        console.log('[ MemosCtrl ] --> Memo Created');
        var refId = newMemo.key();
        var memoObject = $scope.memos.$getRecord(newMemo.key());
        var memoObjectTags = memoObject.tags;
        var memoTagsArray = [];
        memoObjectTags.forEach(function (tag) {
          memoTagsArray.push(tag.text);
        });

        // Elastic Search Client
        esClient.create({
          index: 'memos',
          type: 'memo',
          id: refId,
          body: {
            title: memoObject.title,
            content: memoObject.content,
            tags: memoTagsArray,
            createdAt: memoObject.createdAt,
            createdBy: memoObject.createdBy,
            createdById: memoObject.createdById
          }
        }, function (error, response) {
            console.log(error);
            console.log(response);
        });
        //$location.path('/memos');
        $state.go('memos');

      }).catch(function(error) {
        console.log(error);
      });
    };


    // READ - GET A MEMO FROM FIREBASE ON PAGE INIT FOR /memos/edit/:id route
    $scope.getMemo = function() {
      var ref = new Firebase(FIREBASE_URL + 'memos');
      var memo;
      //var memoRef = ref.child($stateParams.memoId);

      $scope.memo = $firebaseObject(ref.child($stateParams.memoId));

      ref.child($stateParams.memoId).once("value", function(snapshot) {
        memo = snapshot.val();

        var currentViews = memo.views;
        var incrementViews = currentViews + 1;
        var memoRef = ref.child($stateParams.memoId);
        memoRef.update({
         views: incrementViews
        });
      });


      //console.log('memo = ' + $scope.memo);
      // var memo = ref.child($stateParams.memoId).once("value", function(snapshot) {
      //   var data = snapshot.exportVal();
      // });
      //
      // console.log(memo);
      // console.log('ViewCount = ' + memo.views);
      // //console.log('ViewCount = ' + $scope.memo.views);
      // function incrementViewCount() {
      //   var currentViewCount = $scope.memo.views;
      //   console.log('currentViewCount = ' + currentViewCount);
      //   var updatedViewCount = currentViewCount + 1;
      //   console.log('updatedViewCount = ' + updatedViewCount);
      //   //return updatedViewCount;
      //   return 2;
      // };
      //$scope.memo.views = 2;
      //$scope.update();
    };

    // UPDATE - EDIT A MEMO AND SAVE IT TO FIREBASE
    $scope.update = function() {
      // save firebaseObject
      $scope.memo.$save().then(function(){
        console.log('[ MemosCtrl ] --> Memo Updated');

        // redirect to /memos path after update
        $state.go('memos');
      }).catch(function(error){
        console.log(error);
      });
    };

    // DELETE - REMOVE A MEMO FROM FIREBASE
    $scope.delete = function(memo) {
        $scope.memos.$remove(memo).then(function(){
            console.log('[ MemosCtrl ] --> Memo Deleted');

            // redirect to /memos path after delete
            $state.go('memos');
        }).catch(function(error){
            console.log(error);
        });
    };

    // LOAD TAGS
    // $scope.loadTags = function() {
    //   return Tags();
    // };

    // DATA TABLE SYNCHRONIZATION USING NG-TABLE

    // Since the data is asynchronous we'll need to use the $loaded promise.
    // Once data is available we'll set the data variable and init the ngTable
    $scope.memos.$loaded().then(function(memos) {
      console.log(memos.length); // data is loaded here
      var data = memos;

      $scope.tableMemos = new ngTableParams({
            page: 1,            // show first page
            count: 10,          // count per page
            sorting: { title: 'asc' }  // initial sorting
        }, {
            total: data.length, // length of data
            getData: function($defer, params) {
                // use build-in angular filter
                var orderedData = params.sorting() ? $filter('filter')(data, params.filter()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    });

    // Listening for list updates to Memos to update DataTable
    var ref = new Firebase(FIREBASE_URL + 'memos');
    var list = $firebaseArray(ref);
    list.$watch(function(event) {
      console.log(event);
      $scope.memos.$loaded().then(function(){
        $scope.tableMemos.reload();
      });
    });

});

console.log('--> retrofire/app/memos/memos.controller.js loaded');
