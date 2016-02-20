'use strict';

app.factory("Ideas", function IdeaFactory(FIREBASE_URL, $firebaseArray) {
    return function(){
        // snapshot of our data
        var ref = new Firebase(FIREBASE_URL + 'ideas');
        // returning synchronized array
        return $firebaseArray(ref);
    }
});

console.log('--> basestation/app/ideas/ideas.service.js loaded');