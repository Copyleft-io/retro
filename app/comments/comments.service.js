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

            var ref = this.ref;
            entityChild.once("value", function(snapshot) {

              ref.update({
                commentCount: snapshot.numChildren()
              });

            });

        };

        Comments.prototype.deleteComment = function(entityId, commentId) {
            //return this.ref.child(id).remove();
            console.log(entityId);
            console.log(commentId);
            var ref = this.ref.child(entityId);
            ref.child('comments').child(commentId).remove().then(function(){
              console.log('Comment Deleted');
              ref.child('commentCount').transaction(function (count) {
                return (count || 1)  - 1;
              });
            }).catch(function(error){
              console.log(error);
            });
        };

        Comments.prototype.upVote = function(id) {

            var comment = this.ref.child(id);

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

            comment.votes = comment.upvotes.length - comment.downvotes.length;

        };

        Comments.prototype.downVote = function(id) {
            return this.ref.child(id).remove();
        };

        Comments.prototype.editComment = function(entityId, updatedContent) {

        };

        return Comments;

    })();
    return Comments;
});

console.log('--> retrofire/app/comments/comments.service.js loaded');