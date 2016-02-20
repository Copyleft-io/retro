'use strict';
app.factory('Auth', function($firebaseAuth, FIREBASE_URL){
    var ref = new Firebase(FIREBASE_URL);
    var auth = $firebaseAuth(ref);
    return auth;
  });
console.log('--> retrofire/app/auth/auth.service.js loaded');
