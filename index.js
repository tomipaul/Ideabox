var express = require('express');
var admin = require('firebase-admin');
var firebase = require('firebase');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

var serviceAccount = require(__dirname + '/serviceKey.json');

var adminApp = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://ideabox-cd425.firebaseio.com"
}, 'admin');

var clientApp = firebase.initializeApp({
    apiKey: "AIzaSyDWF40r7WW-VuTZZjsnsbK96WIutt-Ncok",
    authDomain: "ideabox-cd425.firebaseapp.com",
    databaseURL: "https://ideabox-cd425.firebaseio.com",
    storageBucket: "ideabox-cd425.appspot.com",
    messagingSenderId: "307610155395"
}, 'client');

var adminAuth = adminApp.auth();
var clientDb = adminApp.database();
var clientAuth = clientApp.auth();

var checkToken = function(req, res, next) {
	if ('token' in req.cookies) {
		req.token = req.cookies.token;
		next();
	}
	else {
		res.redirect('/login');
	}
}

var checkToken2 = function(req, res, next) {
	if ('token' in req.cookies) {
		res.redirect('/privileged/me/ideas');
	}
	else {
		next();
	}
}

var checkToken3 = function(req, res, next) {
	var token = req.get('Authorization');
	if (typeof token == 'undefined') {
		res.status(401).end();
	}
	else {
		req.token = token;
		next();
	}
}

var login = function(req, res, next) {
	var [email, password] = [req.body.email, req.body.password];
	clientAuth.signInWithEmailAndPassword(email, password).then(function(user) {
		req.user = user;
		next();
	}, function(error) {
		return res.redirect('/login');
	});
}
var signup = function(req, res, next) {
	var [firstName, lastName] = [req.body.firstName, req.body.lastName];
	var [email, password] = [req.body.email, req.body.password];
	var fullName = firstName+' '+lastName;
	clientAuth.createUserWithEmailAndPassword(email, password)
	.then(function(user) {
		user.updateProfile({displayName: fullName})
		.then(function() {
			console.log(user.email, user.uid); // To be removed when deployed
			req.user = user;
			next();
		});
	}, function(error) {
		return res.redirect('/signup');
	});
}

var getToken = function(req, res, next) {
	req.user.getToken().then(function(token) {
		req.token = token;
		next();
	}, function(error) {
		return res.json(error);
	});
}

var verifyToken = function (req, res, next) {
	adminAuth.verifyIdToken(req.token).then(function(decodedToken) {
		req.useruid = decodedToken.uid;
		next();
	}, function (error) {
		res.json(error);
	});
}

var setResponseCookies = function(req, res, next) {
	res.cookie('token', req.token, {httpOnly: false});
	next();
}

var userPage = function(req, res) {
	res.redirect('/privileged/me/ideas');
}

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({'extended':'true'})); //parse application/x-www-form-urlencoded
app.use(bodyParser.json()); //parse application/json

//for the api starting routes, you have to checkToken and verifyToken before granting access

app.post('/api/login', login, getToken, verifyToken, setResponseCookies, userPage);

app.post('/api/signup', signup, getToken, verifyToken, setResponseCookies, userPage);

app.use('/api/member', checkToken3, verifyToken);

app.get('/api/member/ideas', function(req, res) {
	var ref = clientDb.ref('ideas');
	ref.once('value', function(snapshot) {
		res.json(snapshot.val());
	});
});

app.get('/api/member/me/ideas', function(req, res) {
	var ref = clientDb.ref('ideas');
	ref.orderByChild('userId').equalTo(req.useruid).once('value', function(snapshot) {
		console.log(snapshot.val());
		res.json(snapshot.val());
	});
});

app.get('/api/member/ideas/:ideaid', function(req, res) {
	var ideaId = req.params.ideaid;
	var ref = clientDb.ref('ideas/'+ideaId);
	ref.once('value', function(snapshot) {
		res.json(snapshot.val());
	});
});

app.get('/api/member/:ideaid/comments', function(req, res) {
	var ideaId = req.params.ideaid;
	var ref = clientDb.ref('comments');
	ref.orderByChild('ideaId').equalTo(ideaId).once('value', function(snapshot) {
		res.json(snapshot.val());
	});
});

app.post('/api/member/me/idea', function(req, res) {
	var [title, description] = [req.body.ideaTitle, req.body.ideaDescription];
	var ideaUpdate = {
		userId : req.useruid,
		ideaTitle: title,
		ideaDescription: description,
		upvotes: 0,
		downvotes: 0
	};
	clientDb.ref('ideas').push(ideaUpdate)
	.then(function() {
		return res.json('success');
	}, function(error) {
		return res.json(error);
	});
});

app.post('/api/member/:ideaid/comment', function(req, res) {
	var ideaId = req.params.ideaid;
	var statement = req.body.statement;
	var commentUpdate = {
		ideaId: ideaId,
		commentStatement: statement
	};
	clientDb.ref('comments').push(ideaUpdate)
	.then(function() {
		return res.json(commentUpdate);
	}, function(error) {
		return res.json(error);
	});
});

app.post('/api/member/:ideaid/upvote', function(req, res) {
	var ideaId = req.params.ideaid;
	var ref = clientDb.ref('ideas/'+ideaId+'/upvotes');
	ref.transaction(function(currentUpvotes) {
		return currentUpvotes + 1;
	}, function(error, committed, snapshot) {
		if (error || !committed) {
			return res.json("Upvote failed");
		} else {
			return res.json(snapshot.val());
		}
	});
});

app.post('/api/member/:ideaid/downvote', function(req, res) {
	var ideaId = req.params.ideaid;
	var ref = clientDb.ref('ideas/'+ideaId+'/downvotes');
	ref.transaction(function(currentDownvotes) {
		return currentDownvotes + 1;
	}, function(error, committed, snapshot) {
		if(error || !committed) {
			return res.json("Downvote failed");
		} else {
			return res.json(snapshot.val());
		}
	});
});

app.use('/privileged', checkToken, verifyToken);

app.get('/privileged/me/postidea', function(req, res) {
	return res.sendFile(__dirname + '/public/html/create_idea.html');
});

app.get('/privileged/me/ideas', function(req, res) {
	return res.sendFile(__dirname + '/public/html/show_ideas.html');
});

app.get('/privileged/idea', function(req, res) {
	return res.sendFile(__dirname + '/public/html/idea.html');
});

app.get('/signup', checkToken2, function(req, res) {
	return res.sendFile(__dirname + '/public/html/signup.html');	
});

app.get('/login', checkToken2, function(req, res) {
	return res.sendFile(__dirname + '/public/html/login.html');
});

app.listen('8080');
console.log('App listening on port 8080');