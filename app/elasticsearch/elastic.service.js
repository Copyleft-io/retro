'use strict';

app.service("esClient", function (esFactory) {
  return esFactory({
    host: 'http://80edaedca1e8ae1c1dc2521c374443e1.us-east-1.aws.found.io:9200'
  });
});

console.log('--> retrofire/app/elasticsearch/elastic.service.js loaded');
