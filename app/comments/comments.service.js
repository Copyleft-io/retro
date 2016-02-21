'use strict';

var handleSave = function(){
    console.log('entity saved');
};

app.factory('Comments', function(FIREBASE_URL, $firebaseArray, $stateParams, User, $firebaseObject) {

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

            entityChild.child('commentCount').transaction(function (count) {
              return (count || 0)  + 1;
            });

        };

        Comments.prototype.deleteComment = function(entityId, commentId) {
            //return this.ref.child(id).remove();
            console.log(entityId);
            console.log(commentId);
            var entityChild = this.ref.child(entityId);

            entityChild.child('comments/' + commentId).remove().then(function(){
              console.log('Comment Deleted');
              entityChild.child('commentCount').transaction(function (count) {
                return (count || 1)  - 1;
              });
            }).catch(function(error){
              console.log(error);
            });
        };

        Comments.prototype.upVote = function(entityId, commentId) {
            //TODO: save users to index
            var entity = this.ref.child(entityId);
            var comment = entity.child('comments/' + commentId);

            comment.upvotes || (comment.upvotes = []);
            comment.downvotes || (comment.downvotes = []);
            if (!(indexOf.call(comment.upvotes, User.getId()) >= 0)) {
                console.log("Casting vote for " + User.getId());
                comment.upvotes.push(User.getId());
                deleteFromArray(comment.downvotes, User.getId());

            } else {
                console.log("Removing vote");
                deleteFromArray(comment.upvotes, User.getId());
            }

            comment.child('rank').transaction(function (count) {
                return  comment.upvotes.length - comment.downvotes.length;
            });
        };

        Comments.prototype.downVote = function(entityId, commentId) {

            var entity = this.ref.child(entityId);
            var comment = entity.child('comments/' + commentId);

            comment.upvotes || (comment.upvotes = []);
            comment.downvotes || (comment.downvotes = []);
            if (!(indexOf.call(comment.downvotes, User.getId()) >= 0)) {
                console.log("Casting vote for " + User.getId());
                comment.downvotes.push(User.getId());
                deleteFromArray(comment.upvotes, User.getId());

            } else {
                console.log("Removing vote");
                deleteFromArray(comment.downvotes, User.getId());
            }

            comment.child('rank').transaction(function (count) {
                return  comment.upvotes.length - comment.downvotes.length;
            });
        };

        Comments.prototype.editComment = function(entityId, updatedContent) {

        };

        return Comments;

    })();
    return Comments;
});

console.log('--> retrofire/app/comments/comments.service.js loaded');