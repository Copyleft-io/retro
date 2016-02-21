'use strict';

app.factory('Comments', function(FIREBASE_URL, $firebaseArray, $stateParams, User) {

    var Comments;
    Comments = (function() {
        function Comments(entity) {
            this.entity = entity;
            this.ref = new Firebase(FIREBASE_URL + this.entity + "/comments");
        }

        Comments.prototype.postComment = function(newContent) {
            var comment = {
                content: newContent,
                userId: User.getId(),
                createdAt: Firebase.ServerValue.TIMESTAMP
            };
            var ref = new Firebase(FIREBASE_URL + 'ideas/' + $stateParams.ideaId);
            var refChild = ref.child('comments');
            refChild.push(comment);
        };

        Comments.prototype.deleteComment = function(id) {
            return this.ref.child(id).remove();
        };

        return Comments;

    })();
    return Comments;
});

console.log('--> retrofire/app/comments/comments.service.js loaded');