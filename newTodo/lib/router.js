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
    this.render('login');
});

Router.route('/dashboard', function() {
    if(Meteor.userId()) {//if loged in
        Session.set('notesToShow', notes.find().fetch())
        this.render('dashboard');
    } else {
        Router.go('/login');
    }
});

Router.route('/register', function() {
    this.render('register');
});

Router.route('/notePage', function() {
    if(Session.get('allowNotes') != true) {//if allowed on notes page. If user reloads on note page, there will be errors
        Router.go('/dashboard');
    }
    if(Meteor.userId()) {//if loged in
        this.render('notePage');
    } else {
        Router.go('/login');
    }
});
