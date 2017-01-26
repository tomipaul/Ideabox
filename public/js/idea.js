function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getIdea(cb) {
	var ideaId = window.location.hash.slice(1);
	var cookie = getCookie('token');
	var uri  = `/api/member/ideas/${ideaId}`;
	$.ajax({
		url: encodeURI(uri),
		type: 'GET',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', cookie);
		},
		dataType: "text",
		success: function(result) {
			return cb(result);
		}
	});
}

function populateIdea(idea) {
	var ideaObject = JSON.parse(idea);
	document.getElementById('ideaTitle').innerHTML = ideaObject['ideaTitle'];
	var converter = new showdown.Converter();
	html = converter.makeHtml(ideaObject['ideaDescription']);
	document.getElementById('ideaDescription').innerHTML = html;
	document.getElementById('ideaUserName').innerHTML = ideaObject['userName'];
	var upvotes = document.createTextNode(ideaObject['upvotes']);
	document.getElementById('upvoteSpan').appendChild(upvotes);
	var downvotes = document.createTextNode(ideaObject['downvotes']);
	document.getElementById('downvoteSpan').appendChild(downvotes);
	console.log(ideaObject['vote']);
}

function renderVote(idea) {
	var upvote = document.getElementById('upvote');
	var downvote = document.getElementById('downvote');
	upvote.isactive = false;
	downvote.isactive = false;
	var ideaObject = JSON.parse(idea);
	console.log(ideaObject)
	if (ideaObject.hasOwnProperty('vote')) {
		console.log(ideaObject);
		if (ideaObject['vote'] === 'upvoted') {
			upvote.src = '/images/thumbsup.png';
			upvote.isactive = true;
			downvote.isactive = 'disabled';
		}
		else if (ideaObject['vote'] === 'downvoted') {
			downvote.src = '/images/thumbsdown.png';
			downvote.isactive = true;
			upvote.isactive = 'disabled';
		}
	}
}

function getComments(cb) {
	var ideaId = window.location.hash.slice(1);
	var cookie = getCookie('token');
	var uri  = `/api/member/${ideaId}/comments`
	$.ajax({
		url: encodeURI(uri),
		type: 'GET',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', cookie);
		},
		dataType: "text",
		success: function(result) {
			return cb(result);
		}
	});
}

function renderComment(commentObject) {
	var commentDiv = document.createElement('div');
	commentDiv.className = "commentDiv";
	var nameSpan = document.createElement('span');
	nameSpan.className = "nameSpan";
	var name = document.createTextNode(commentObject["userName"]);
	nameSpan.appendChild(name);
	commentDiv.appendChild(nameSpan);
	var statement = document.createTextNode(commentObject['commentStatement']);
	commentDiv.appendChild(statement);
	document.getElementById('commentsDiv').appendChild(commentDiv);
}

function populateComments(comments) {
	var commentObjects = JSON.parse(comments);
	for (var commentId in commentObjects) {
		var commentObject = commentObjects[commentId];
		renderComment(commentObject);
	}
	var newCommentDiv = document.createElement('div');
	newCommentDiv.id = "newCommentDiv";
	var newComment = document.createElement('textarea');
	var submitComment = document.createElement('input');
	newComment.id = "newComment";
	submitComment.id = "submitComment";
	newComment.setAttribute("placeholder", "Enter your comment");
	submitComment.setAttribute('type', 'submit');
	submitComment.setAttribute('value', 'Go');
	newCommentDiv.appendChild(newComment);
	newCommentDiv.appendChild(submitComment);
	document.getElementById('commentsDiv').appendChild(newCommentDiv);
}

function postComment() {
	var cookie = getCookie('token');
	var ideaId = window.location.hash.slice(1);
	var commentStatement = $("#newComment").val();
	var uri = `/api/member/${ideaId}/comment`;
	var comment = {commentStatement: commentStatement};
	$.ajax({
		url: encodeURI(uri),
		type: 'POST',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', cookie);
		},
		data: comment,
		dataType: "text",
		success: function (result) {
			getComments(function(comments) {
				$("#commentsDiv").empty();
				populateComments(comments);
			});
		},
		error: function(xhr, status, error) {
			console.log(error);
		}
	});
}

function voteComment(elem) {
	var ideaId = window.location.hash.slice(1);
	var cookie = getCookie('token');
	var uri = `/api/member/${ideaId}/${elem.id}`;
	$.ajax({
		url: encodeURI(uri),
		type: 'PUT',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', cookie);
		},
		dataType: "text",
		success: function(result) {
			let countNode = elem.nextSibling;
			countNode.nodeValue = result;
		},
		error: function(xhr, status, error) {
			voteOff(elem);
		}
	});
}

function unvoteComment(elem) {
	var ideaId = window.location.hash.slice(1);
	var cookie = getCookie('token');
	var uri = `/api/member/${ideaId}/unvote/${elem.id}`;
	$.ajax({
		url: encodeURI(uri),
		type: 'PUT',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', cookie);
		},
		dataType: "text",
		success: function(result) {
			let countNode = elem.nextSibling;
			countNode.nodeValue = result;
		},
		error: function(xhr, status, error) {
			voteOn(elem);
		}
	});
}

function voteOn(elem) {
	if (elem.id === 'upvote') {
		elem.src = '/images/thumbsup.png';
		elem.isactive = true;
		document.getElementById('downvote').isactive = 'disabled';
	}
	else if (elem.id === 'downvote') {
		elem.src = '/images/thumbsdown.png';
		elem.isactive = true;
		document.getElementById('upvote').isactive = 'disabled';
	}
	var countNode = elem.nextSibling;
	var voteCount = countNode.nodeValue;
	countNode.nodeValue = parseInt(voteCount) + 1;
}

function voteOff(elem) {
	if (elem.id === 'upvote') {
		elem.src = '/images/thumb-up.png';
		elem.isactive = false;
		document.getElementById('downvote').isactive = false;
	}
	else if (elem.id === 'downvote') {
		elem.src = '/images/thumb-down.png';
		elem.isactive = false;
		document.getElementById('upvote').isactive = false;
	}
	var countNode = elem.nextSibling;
	var voteCount = countNode.nodeValue;
	countNode.nodeValue = parseInt(voteCount) - 1;
}

function clickVote(elem) {
	if (elem.isactive === true) {
		voteOff(elem);
		unvoteComment(elem);
	}
	else if (elem.isactive === false) {
		voteOn(elem);
		voteComment(elem);
	}
}


$(document).ready(function() {
	getIdea(function(idea) {
		populateIdea(idea);
		renderVote(idea);
	});

	getComments(function(comments) {
		populateComments(comments);
	});

	$("#commentsDiv").on("click", "#submitComment", function(event) {
		event.preventDefault();
		postComment();
	});

	$("#upvote, #downvote").on("click", function(event) {
		event.preventDefault();
		clickVote(this);
	});
});