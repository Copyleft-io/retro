'use strict';
app.service('User', function(FIREBASE_URL, $firebaseAuth, Users){

// A Convience Service for getting authenticated user information id and email

var User = this;
var ref = new Firebase(FIREBASE_URL);
var authObj = $firebaseAuth(ref);
var userObj = {
  uid: '',
  email: ''
};

User.getId = function(){
  return userObj.uid;
};

User.getEmail = function(){
  return userObj.email;
};

// RUNS ON INITIALIZATION AND ON AUTH CHANGES
authObj.$onAuth(function(authData) {
  if (authData) {
    console.log("[user service] authenticated User is logged in as:", authData.uid);
    userObj.uid = authData.uid;
    userObj.email = authData.password.email;
    return userObj;
      } else {
    console.log("[user service] authenticated user Logged out");
    userObj = {
      uid: '',
      email: ''
    };
    console.log("[user service] returned user:", userObj);
    return userObj;
  }
});


});

console.log('--> retrofire/app/user.service.js loaded');
