'use strict';
app.controller('ProfileCtrl', function(FIREBASE_URL, $state, Auth, md5, auth, profile, User, Users){
    var ref = new Firebase(FIREBASE_URL);
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

    profileCtrl.changePassword = function(){
      ref.changePassword({
        email       :  profileCtrl.profile.email,
        oldPassword :  profileCtrl.profile.currentPassword,
        newPassword :  profileCtrl.profile.newPassword
      }, function(error) {
          if (error === null) {
            console.log("Password changed successfully");
          } else {
            console.log("Error changing password:", error);
          }
      });
    };
});

console.log('--> retrofire/app/users.profile.js loaded');
