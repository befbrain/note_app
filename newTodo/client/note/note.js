import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
    
Meteor.subscribe("userPublish");
Meteor.subscribe("notesPublish");
 

Template.notePage.onRendered(function() {
    noSave = true;
    
    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    //   ['blockquote', 'code-block'],
      ['link', 'image'],
    
    //   [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    //   [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    //   [{ 'direction': 'rtl' }],                         // text direction
    
    //   [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, false] }],
    
    //   [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    //   [{ 'font': [] }],
      [{ 'align': [] }],
    
    //   ['clean']                                         // remove formatting button
    ];
    
    quill = new Quill('#editor', {
      modules: {
        toolbar: toolbarOptions,
      },
      
      theme: 'snow'
    });
    
    
    
    if(Session.get('newNote') != true) {    
        $('#titleInput').val(notes.find({_id: Session.get('noteId')}).fetch()[0].title);
        quill.setContents(notes.find({_id: Session.get('noteId')}).fetch()[0].note);
    }
    
    Meteor.setInterval(function() {
        if(Session.get('newNote') != true) {    
            if(notes.find({_id: Session.get('noteId')}).fetch()[0].toUpdate == true) {
                toUpdate = notes.find({_id: Session.get('noteId')}).fetch()[0].toUpdateWho;
                userEmail = Meteor.users.find({_id: Meteor.userId()}).fetch()[0].emails[0].address;
                
                if(toUpdate != userEmail) {
                    
                    Meteor.call('updateNote', {_id: Session.get('noteId')}, {toUpdate: false});
                    Meteor.call('updateNote', {_id: Session.get('noteId')}, {toUpdateWho: null});
                    range = quill.getSelection();
                    $('#titleInput').val(notes.find({_id: Session.get('noteId')}).fetch()[0].title);
                    quill.setContents(notes.find({_id: Session.get('noteId')}).fetch()[0].note);
                    
                    if(range != null) {
                        quill.setSelection(range.index, range.length);
                    }
                }
            }
        
        }
    }, 1000);
    
    //check if title is invalid
    checkTitle()
    
    //when quill is changed
    quill.on('text-change', function(delta, oldDelta, source) {
        if(source == 'user') {
            if(noSave != true) {
                noteChange(true)
            }
            noSave = false;
        }
    });
});

Template.notePage.helpers({
    userID() {
        return Meteor.userId();
    },
    
    notes() {
        return notes.find({owner: Meteor.userId()});
    },
    
    isStared() {
        if(notes.find({_id: Session.get('noteId')}).fetch()[0].stared == false) {
            return false
        } else {
            return true
        }
    },
    notNew() {
        if((Session.get('newNote') == true)) {
           return false
        } else {
            return true
        }
    },
    
    updateByWho() {
        updateByWho = notes.find({_id: Session.get('noteId')}).fetch()[0].lastUpdatedWho
        user = Meteor.users.find({_id: updateByWho}).fetch()[0].profile
        return user.fName + " " + user.lName;
    },
    
    lastUpdated() {
        date = notes.find({_id: Session.get('noteId')}).fetch()[0].lastUpdated;
        if(date.getMinutes() < 10) { //if minute is 1-9
            minutes = '0' + date.getMinutes()//add 0 before minute
        } else {
            minutes = date.getMinutes();
        }
        if((date.getMonth() == new Date().getMonth()) && (date.getDate() == new Date().getDate())) {//if today
            
            //am or pm
            if(date.getHours() > 12) {
                hour = date.getHours() - 12
                return hour + ":" + minutes + " pm"
            } else {
                return date.getHours() + ":" + minutes + " am"
            } 
        } else {//if not today
            
            //am or pm
            if((date.getHours()) > 12) {
                hour = date.getHours() - 12
                return getMonthAsString() + " " +  date.getDate() + ", " + hour + ":" + minutes + " pm"
            } else {
                return getMonthAsString() + " " + date.getHours() + ":" + minutes + " am"
            } 
        }
    }
});

Template.notePage.events({
    'keyup #titleInput': _.throttle(function(event) { //when title input is changed
        checkTitle()
        noteChange(true);
    }, 10),
    
    'click #deleteNote': function(event) {//click delete
        Meteor.call('removeNote', Session.get('noteId'));
        Router.go('/dashboard');
        Session.set('allowNotes', false);
    },
    
    'click #starNote': function(event) {//click star
        if(notes.find({_id: Session.get('noteId')}).fetch()[0].stared == false) {
            Meteor.call('updateNote', {_id: Session.get('noteId')}, {stared: true});
        } else {
            Meteor.call('updateNote', {_id: Session.get('noteId')}, {stared: false});
        }
    }
    
});

function noteChange(save) {
    if(save == true) {
        html = quill.getContents();
        if($('#titleInput').val() == "") {//if title is blank
            return 0; 
        } else if((Session.get('newNote') == true)) {//if creating new note
            
            //create new note
            noteId = Meteor.call("insertNote", {
                lastUpdated: new Date(),
                lastUpdatedWho: Meteor.userId(),
                owner: Meteor.userId(),
                sharedWith: [],
                note: html,
                title: $('#titleInput').val(),
                stared: false,
                toUpdate: false,
                toUpdateWho: null
            }, function(error, result){//error check
                if(error){
                    console.log(error);
                } else {
                    console.log('created note: ' + result);
                    Session.set('noteId', result);
                }
            });
            
            quill.on('text-change', function(delta, oldDelta, source) {
                if(source == 'user') {
                    if(noSave != true) {
                        noteChange(true)
                    }
                    noSave = false;
                }
            });
            
            Session.set('newNote', false);
            return 0;
        } else { //update note
            if($('#titleInput').val() != "") {
                Meteor.call('updateNote', {_id: Session.get('noteId')}, {title: $('#titleInput').val()});
            }
            Meteor.call('updateNote', {_id: Session.get('noteId')}, {note: html});
            Meteor.call('updateNote', {_id: Session.get('noteId')}, {lastUpdated: new Date()});
            Meteor.call('updateNote', {_id: Session.get('noteId')}, {lastUpdatedWho: Meteor.userId()});
            Meteor.call('updateNote', {_id: Session.get('noteId')}, {toUpdate: true});
            Meteor.call('updateNote', {_id: Session.get('noteId')}, {toUpdateWho: Meteor.users.find({_id: Meteor.userId()}).fetch()[0].emails[0].address});
        }
    } else {
        return 0;
    }
}
//convert number to month
function getMonthAsString() {
    month = new Array();
    
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";

    var date = new Date();
    var strDate = month[date.getMonth()];
    return strDate;
}

function checkTitle() {
    if($('#titleInput').val() == "") {
        $( "#titleInput" ).addClass( 'is-invalid' );
        $(".invalid-feedback").html("Invalid input. You must have a title. Your title changes will not be saved.");
    } else {
        $( "#titleInput" ).removeClass( 'is-invalid' );
    }
}