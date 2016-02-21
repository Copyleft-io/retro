'use strict';

app.factory('Vote', function(FIREBASE_URL, User) {

    var Vote;
    Vote = (function() {
        function Vote(entity) {
            this.entity = entity;
            this.ref = new Firebase(FIREBASE_URL + this.entity);
        }

        Vote.prototype.up = function(entityId) {

            var entity = this.ref.child(entityId);
            entity.once("value", function(snap) {
                var entitySnapshot = snap.val();
                entitySnapshot.upvotes || (entitySnapshot.upvotes = []);
                entitySnapshot.downvotes || (entitySnapshot.downvotes = []);

                if (!(indexOf.call(entitySnapshot.upvotes, User.getId()) >= 0)) {
                    console.log("Casting vote for " + User.getId());
                    entitySnapshot.upvotes.push(User.getId());
                    deleteFromArray(entitySnapshot.downvotes, User.getId());

                } else {
                    console.log("Removing vote");
                    deleteFromArray(entitySnapshot.upvotes, User.getId());
                }

                var rank = entitySnapshot.upvotes.length - entitySnapshot.downvotes.length;

                entity.child('upvotes').transaction(function (count) {
                    return entitySnapshot.upvotes;
                });
                entity.child('downvotes').transaction(function (count) {
                    return entitySnapshot.downvotes;
                });
                entity.child('rank').transaction(function (count) {
                    return entitySnapshot.upvotes.length - entitySnapshot.downvotes.length;
                });

                entity.setPriority(rank * -1);
            });


        };

        Vote.prototype.down = function(entityId) {

            var entity = this.ref.child(entityId);
            entity.once("value", function(snap) {
                var entitySnapshot = snap.val();
                entitySnapshot.upvotes || (entitySnapshot.upvotes = []);
                entitySnapshot.downvotes || (entitySnapshot.downvotes = []);

                if (!(indexOf.call(entitySnapshot.downvotes, User.getId()) >= 0)) {
                    console.log("Casting vote for " + User.getId());
                    entitySnapshot.downvotes.push(User.getId());
                    deleteFromArray(entitySnapshot.upvotes, User.getId());

                } else {
                    console.log("Removing vote");
                    deleteFromArray(entitySnapshot.downvotes, User.getId());
                }

                var rank = entitySnapshot.upvotes.length - entitySnapshot.downvotes.length;

                entity.child('upvotes').transaction(function (count) {
                    return entitySnapshot.upvotes;
                });
                entity.child('downvotes').transaction(function (count) {
                    return entitySnapshot.downvotes;
                });
                entity.child('rank').transaction(function (count) {
                    return entitySnapshot.upvotes.length - entitySnapshot.downvotes.length;
                });

                entity.setPriority(rank * -1);

            });

        };

        return Vote;

    })();
    return Vote;
});

console.log('--> retrofire/app/comments/comments.service.js loaded');