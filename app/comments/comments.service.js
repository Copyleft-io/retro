'use strict';

app.factory('Comments', function(FIREBASE_URL, $firebaseArray, $stateParams, User) {

    var Comments;
    Comments = (function() {
        function Comments(entity) {
            this.entity = entity;
            this.ref = new Firebase(FIREBASE_URL + this.entity);
        }

        Comments.prototype.createComment = function(entityId, newContent) {
            var comment = {
                content: newContent,
                userId: User.getId(),
                createdAt: Firebase.ServerValue.TIMESTAMP
            };
            var entityChild = this.ref.child(entityId);
            var refChild = entityChild.child('comments');
            refChild.push(comment);
        };

        Comments.prototype.deleteComment = function(id) {
            return this.ref.child(id).remove();
        };

        Comments.prototype.editComment = function(entityId, updatedContent) {

        };

        return Comments;

    })();
    return Comments;
});

console.log('--> retrofire/app/comments/comments.service.js loaded');