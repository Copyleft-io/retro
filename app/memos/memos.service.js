'use strict';

app.factory("Memos", function MemosFactory(FIREBASE_URL, $firebaseArray) {
  return function(){
    // snapshot of our data
    var ref = new Firebase(FIREBASE_URL + 'memos');
    // returning synchronized array
    return $firebaseArray(ref);
  }
});

console.log('--> retrofire/app/memos/memos.service.js loaded');
