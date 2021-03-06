import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Template.dashboard.onRendered(function() {
    Session.set('onlyStar', false)
})

Template.dashboard.helpers({
    notes() {
        return Session.get('notesToShow');
    },
    
    isStared() {
        if(notes.find({_id: this._id}).fetch()[0].stared == false) {
            return false
        } else {
            return true
        }
    },
    
    onlyStared() {
        if(Session.get('onlyStar') == true) {
            return true;
        } else {
            return false
        }
    },
    
    lastUpdated() {
        date = notes.find({_id: this._id}).fetch()[0].lastUpdated;
        if(date.getMinutes() < 10) {//if minutes is 0-9
            minutes = '0' + date.getMinutes()//add 0 before time
        } else {
            minutes = date.getMinutes();
        }
        if((date.getMonth() == new Date().getMonth()) && (date.getDate() == new Date().getDate())) {//if todya
            //am or pm
            if(date.getHours() > 12) {
                hour = date.getHours() - 12
                return hour + ":" + minutes + " pm"
            } else {
                return date.getHours() + ":" + minutes + " am"
            } 
        } else {
            if((date.getHours()) > 12) {//if hours is > 12
                hour = date.getHours() - 12//hours minus 12 so not army time
                return getMonthAsString() + " " +  date.getDate() + ", " + hour + ":" + minutes + " pm"
            } else {
                return getMonthAsString() + " " + date.getHours() + ":" + minutes + " am"
            } 
        }
    }
});

Template.dashboard.events({
    
    'click #addNote': function(event) {
        Session.set('newNote', true);
        Session.set('norePageAllow', true);
        Session.set('allowNotes', true);
        Router.go("/notePage");
    },
    
    'click #onlyStar': function(event) {
        clickOnlyStar()
    },
    
    'keyup #searchBar': function(event) {
        if(Session.get('onlyStar') == true) {
            notesToFind = findSearchedNotes(notes.find({stared: true}).fetch());
        } else {
            notesToFind = findSearchedNotes(notes.find().fetch());
        }
        
        notesToFind = findSearchedNotes(notesToFind);
        
        Session.set('notesToShow', notesToFind);
    },
    
    'click #card': function(event) {
        Session.set('noteId', this._id);
        Session.set('norePageAllow', true);
        Session.set('allowNotes', true);
        Router.go("/notePage");
    },
    
    'click #starNote': function(event) {
        if(notes.find({_id: this._id}).fetch()[0].stared == false) {
            Meteor.call('updateNote', {_id: this._id}, {stared: true});
        } else {
            Meteor.call('updateNote', {_id: this._id}, {stared: false});
        }
    }
    
});

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

function findSearchedNotes(arr) {
     notesToFind = [];
    _.forEach(arr, function(noteTemp){//for each note in collection of notes
        //all to lower to standerdize
        
        title = $('#searchBar').val();
        title = title.toLowerCase()
        
        noteNote = noteTemp.note.ops;
        
        stringNote = ''
        
         _.forEach(noteNote, function(insert){
             if(typeof insert.insert != 'object') {
                 stringNote = stringNote + insert.insert;
             }
         })
        
        stringNote = stringNote.toLowerCase()
        
        noteTitle = noteTemp.title;
        noteTitle = noteTitle.toLowerCase()
        
        if (stringNote.indexOf(title) >=0) {//if note contains search
            notesToFind.push(noteTemp)
        } else if(noteTitle.indexOf(title) >=0) {//if note tile contains search
            notesToFind.push(noteTemp)
        }
    });
    return notesToFind
}

function clickOnlyStar() {
    notesToShow = []
    if(Session.get('onlyStar') == true) {
        notesToShow = notes.find().fetch()
        Session.set('onlyStar', false);
    } else {
        notesToShow = notes.find({stared: true}).fetch();
        Session.set('onlyStar', true);
    }
    
    if($('#searchBar').val() != "") {
        notesToShow = findSearchedNotes(notesToShow);
    }
    
    Session.set('notesToShow', notesToShow);
}