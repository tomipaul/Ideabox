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

function populateComments(comments) {
	var commentObjects = JSON.parse(comments);
	for (var commentId in commentObjects) {
		var commentObject = commentObjects[commentId];
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

function commentUpvoted() {
	var upvoteCountNode = document.getElementById('upvoteSpan').childNodes[1];
	var upvoteCount = upvoteCountNode.nodeValue;
	upvoteCountNode.nodeValue = parseInt(upvoteCount) + 1;
	var upthumb = document.getElementById('upvoteSpan').childNodes[0];
	upthumb.src = '/images/thumbsup.png';
}

$(document).ready(function() {
	getIdea(function(idea) {
		populateIdea(idea);
	});

	getComments(function(comments) {
		populateComments(comments);
	});

	$("#commentsDiv").on("click", "#submitComment", function(event) {
		event.preventDefault();
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
	});

	$("#upvoteSpan").on("click", "img", commentUpvoted);
});