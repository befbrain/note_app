import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
  
Meteor.subscribe("userPublish");
Meteor.subscribe("notesPublish");

Template.login.onRendered(function(){
    if($(document).height() <= $('#loginPage .h-center').height()) {
        $('#loginPage.loginRegisterStyle').css('display', 'unset')
    }
});

Template.login.onCreated(function(){
    loginError = new ReactiveVar("")
})

Template.login.helpers({
    isError() {
        if(loginError.get() == "") {
            return false;
        } else {
            return true;
        }
    },
    
    error() {
        return loginError.get();
    }
});

Template.login.events({
    'click #loginButton': function(event) {
        Meteor.loginWithPassword($('#emailInput').val(), $('#passwordInput').val(), function (error) {
            if(error)//if error loging in
            {
                loginError.set(error.reason);
            }
            else
            {
                Router.go("/dashboard"); 
            }
        });
    },
});