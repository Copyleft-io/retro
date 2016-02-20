'use strict';

app.factory("Questions", function QuestionFactory(FIREBASE_URL, $firebaseArray) {
  return function(){
    // snapshot of our data
    var ref = new Firebase(FIREBASE_URL + 'questions');
    // returning synchronized array
    return $firebaseArray(ref);
  }
});

console.log('--> questions.service.js loaded');
