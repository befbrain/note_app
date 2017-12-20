import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({// for security

    //To call a method from the CLIENT (or server) do:
    // Meteor.call("insertNote", putYourUserIDHere);
    /*removeUser: function(userId) {
        Meteor.users.remove({_id:userId});
    },*/
    insertNote: function(feilds) {
        noteId = notes.insert(feilds);
        return noteId;
    },
    
    updateNote: function (find, update) {
        notes.update(find, {$set: update});
    },
    
    removeNote: function (noteId) {
        notes.remove(noteId);
    },
});

//publish tells what data is accesible. On client side, at top of all js files, there is subscribe.
Meteor.publish("userPublish", function () { return Meteor.users.find({}, {fields:{emails:1, _id:1, profile:1, password: 1}}); });

Meteor.publish("notesPublish", function () { 
    return notes.find(
        { 
            $or: [  
                {
                    owner: Meteor.userId()
                },
                {
                    sharedWith: 'brandon@befweb.com'//Meteor.users.find({_id: Meteor.userId()}).fetch()[0].emails[0].address
                }
            ] 
        }, 
        {
            fields: {
                owner: 1, 
                lastUpdated: 1, 
                lastUpdatedWho: 1, 
                sharedWith: 1, 
                note: 1, 
                title: 1, 
                tags: 1, 
                stared: 1,
                toUpdate: 1,
                toUpdateWho: 1,
            }
        }
    ); 
});
//allows client side changes to a collection
// Meteor.users.allow({
//     insert: function (userId, doc) {
//           return true;
//     },
    
//     update: function (userId, doc, fieldNames, modifier) {
//           return true;
//     },
    
//     remove: function (userId, doc) {
//           return true;
//     },
// });