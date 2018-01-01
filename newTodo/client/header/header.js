import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';


Template.header.helpers({

});

Template.header.events({
    'click #logoutButton': function(event) {
        Meteor.logout();//logout
    },
    
    'click #backButton': function(event) {
        Session.set('allowNotes', false);
        Session.set('newNote', false);
        Router.go('/dashboard');
    }
});