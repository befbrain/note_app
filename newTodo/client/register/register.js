import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
  
Meteor.subscribe("userPublish");
Meteor.subscribe("notesPublish");

Template.register.onCreated(function(){
    RegisterError = new ReactiveVar("");
});

Template.register.onRendered(function(){
    if($(document).height() <= $('#registerPage .h-center').height()) {
        $('#registerPage.loginRegisterStyle').css('display', 'unset')
    }
});

Template.register.helpers({
    isError() {
        if(RegisterError.get() == "") {
            return false;
        } else {
            return true;
        }
    },
    
    error() {
        return RegisterError.get();
    }
});

Template.register.events({
    'click #registerButton': function(event) {
        //error check
        if(validEmail($('#emailInput').val()) != true) {
            RegisterError.set("This email is not valid.");
        } else if($('#passwordInput1').val() != $('#passwordInput2').val()) {
            RegisterError.set("Your passwords do not match.");
        } else if($('#passwordInput1').val().length < 4) {
            RegisterError.set("Your passwords must be at least 4 charecters.");
        } else if($('#fName').val().length == 0) {
            RegisterError.set("You must enter your first name.");
        } else {
            RegisterError.set("");
        }
        
        if(RegisterError.get() != "") {
            swal(
                'You have an error',
                RegisterError.get(),
                'error'
            );
        } else {
            //create user
            Accounts.createUser({
                password: $('#passwordInput1').val(),
                email: $('#emailInput').val(),
                profile: {
                    fName: $('#fName').val(),
                    lName: $('#lName').val(),
                    partOfUserShare: null,
                }
            }, function (err, result) {//if error creating user:
                if(err) {
                    RegisterError.set(err.reason);
                    swal(
                        'You have an error',
                        err.reason,
                        'error'
                    );
                } else {
                    swal(
                        'Yaaaaaaaay',
                        'Your acount has been created!',
                        'success'
                    ); 
                    $('#emailInput').val("");
                    $('#passwordInput1').val("");
                    $('#passwordInput2').val("");
                    $('#registerModel').modal('hide');
                    Router.go("/dashboard");
                }
            }
            );
        }
    },
})

function validEmail(email) {// Regex confirming email is valid
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}