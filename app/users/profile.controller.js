'use strict';
app.controller('ProfileCtrl', function($state, Auth, md5, auth, profile, User, Users){
    var profileCtrl = this;
    profileCtrl.profile = profile;
    profileCtrl.updateProfile = function(){
      profileCtrl.profile.email = auth.password.email;
      profileCtrl.profile.emailHash = md5.createHash(auth.password.email);
      //profileCtrl.profile.gravatar = Users.getGravatar(User.getId);
      profileCtrl.profile.$save().then(function(){
        $state.go('dashboard');
      });
    };
    profileCtrl.logout = function(){
      profileCtrl.profile.online = null;
      profileCtrl.profile.$save().then(function(){
        Auth.$unauth();
        $state.go('login');
      });
    };
  });

console.log('--> retrofire/app/users.profile.js loaded');
