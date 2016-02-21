'use strict';

app.controller("ElasticCtrl", function($scope, esClient) {

  esClient.cluster.state({
      metric: [
        'cluster_name',
        'nodes',
        'master_node',
        'version'
      ]
    })
    .then(function (resp) {
      console.log('Cluster State ' + resp);
      $scope.clusterState = resp;
      $scope.error = null;
    })
    .catch(function (err) {
      $scope.clusterState = null;
      $scope.error = err;

      // if the err is a NoConnections error, then the client was not able to
      // connect to elasticsearch. In that case, create a more detailed error
      // message
      if (err instanceof Elastic.errors.NoConnections) {
        $scope.error = new Error('Unable to connect to elasticsearch. ' +
          'Make sure that it is running and listening at http://localhost:9200');
      }
    });

});

console.log('--> retrofire/app/elasticsearch/elastic.controller.js loaded');
