//Iron router

Router.onAfterAction(function () {
});

Router.route('/', function() {
    if(Meteor.userId()) {//if loged in
        Router.go('/dashboard');
    } else {
        Router.go('/login');
    }
});

Router.route('/login', function() {
    Meteor.subscribe("userPublish");
    this.render('login');
});

Router.route('/dashboard', function() {
    
    if(Meteor.userId()) {//if loged in
        Session.set('notesToShow', notes.find().fetch())
        this.render('dashboard');
        
        Meteor.subscribe('notesPublish');
        Meteor.subscribe("userPublish");
    } else {
        Router.go('/login');
    }
});

Router.route('/register', function() {
    this.render('register');
    Meteor.subscribe("userPublish");
});

Router.route('/notePage', function() {
    if(Session.get('allowNotes') != true) {//if allowed on notes page. If user reloads on note page, there will be errors
        Router.go('/dashboard');
    }
    if(Meteor.userId()) {//if loged in
        this.render('notePage');        
        Meteor.subscribe('notesPublish');
        Meteor.subscribe("userPublish");
    } else {
        Router.go('/login');
    }
});
