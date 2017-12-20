import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
    
Meteor.subscribe("userPublish");
Meteor.subscribe("notesPublish");

Template.share.onRendered(function() {
    
});

Template.share.helpers({
    note() {
        return notes.find({_id: Session.get('noteId')}).fetch()
    },
    
    owner() {
        ownerId = notes.find({_id: Session.get('noteId')}).fetch()[0].owner;
        return Meteor.users.find({_id: ownerId}).fetch()[0].emails[0].address;
    },
    
    isOwnerYou() {
        ownerId = notes.find({_id: Session.get('noteId')}).fetch()[0].owner;
        ownerEmail = Meteor.users.find({_id: ownerId}).fetch()[0].emails[0].address
        yourEmail = Meteor.users.find({_id: Meteor.userId()}).fetch()[0].emails[0].address
        if(ownerEmail == yourEmail) {
            return true
        } else {
            return false
        }
    },
    
    isYou() {
        if(this.toString() == Meteor.users.find({_id: Meteor.userId()}).fetch()[0].emails[0].address) {
            return true
        } else {
            return false
        }
    }
});

Template.share.events({
    'click #shareNoteBtn': function(event) {
        if(validEmail($('#shareEmail').val()) == true) {
            shareArr = notes.find({_id: Session.get('noteId')}).fetch()[0].sharedWith;
            
            if(shareArr.indexOf($('#shareEmail').val()) == -1) {
                shareArr = notes.find({_id: Session.get('noteId')}).fetch()[0].sharedWith;
                shareArr.push($('#shareEmail').val());
                Meteor.call('updateNote', {_id: Session.get('noteId')}, {sharedWith: shareArr});
            } else {
                swal(
                  'Oops...',
                  'This not is already shared with ' + $('#shareEmail').val() + '.',
                  'error'
                )
            }
        } else {
            swal(
              'Oops...',
              'This email is not valid.',
              'error'
            )
        }
    },
    
    'click #removeUserBtn': function(event) {
        sharedWithArr = notes.find({_id: Session.get('noteId')}).fetch()[0].sharedWith;
        sharedWithArr.splice(sharedWithArr.indexOf(this.toString()), 1)
        Meteor.call('updateNote', {_id: Session.get('noteId')}, {sharedWith: sharedWithArr});
        
        if(this.toString() == Meteor.users.find({_id: Meteor.userId()}).fetch()[0].emails[0].address) {
            $('#shareModal').modal('hide')
            Router.go('/dashboard');
        }
    },
});

function validEmail(email) {// Regex confirming email is valid
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}