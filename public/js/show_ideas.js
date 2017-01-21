function populateIdeas(ideas) {
	var count = 0;
	var ideaObjects = JSON.parse(ideas);
	for (var ideaId in ideaObjects) {
		var ideaObject = ideaObjects[ideaId];
		if (count == 15) {
			break;
		}
		var ideaDiv = document.createElement('div');
		ideaDiv.className = "ideaDiv";
		var ideaTitleDiv = document.createElement('div');
		ideaTitleDiv.className = "ideaTitleDiv";
		var ideaVoteDiv = document.createElement('div');
		ideaVoteDiv.className = "ideaVoteDiv";
		var ideaUpvoteSpan = document.createElement('span');
		var ideaDownvoteSpan = document.createElement('span');
		ideaDiv.appendChild(ideaTitleDiv);
		ideaDiv.appendChild(ideaVoteDiv);
		ideaVoteDiv.appendChild(ideaUpvoteSpan);
		ideaVoteDiv.appendChild(ideaDownvoteSpan);
		var anchor = document.createElement('A');
		var horizontalLine =document.createElement('hr');
		anchor.href = '/privileged/idea';
		anchor.hash = ideaId;
		var title = document.createTextNode(ideaObject['ideaTitle']);
		var upvotes = document.createTextNode(ideaObject['upvotes']);
		var downvotes = document.createTextNode(ideaObject['downvotes']);
		var upthumb = document.createElement('img');
		var downthumb = document.createElement('img');
		upthumb.id = 'upthumb';
		downthumb.id = 'downthumb';
		upthumb.src='/images/thumb-up.png';
		downthumb.src='/images/thumb-down.png';
		anchor.appendChild(title);
		ideaTitleDiv.appendChild(anchor);
		ideaTitleDiv.appendChild(horizontalLine);
		ideaUpvoteSpan.appendChild(upthumb);
		ideaUpvoteSpan.appendChild(upvotes);
		ideaDownvoteSpan.appendChild(downvotes);
		ideaDownvoteSpan.appendChild(downthumb);
		count+=1;
		document.body.insertBefore(ideaDiv, document.getElementById('showfooter'));
	}
}

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

function getMyIdeas(cb) {
	var cookie = getCookie('token');
	$.ajax({
		url: encodeURI('/api/member/me/ideas'),
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

function getAllIdeas(cb) {
	var cookie = getCookie('token');
	$.ajax({
		url: encodeURI('/api/member/ideas'),
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

$(document).ready(function() {
	getMyIdeas(function(ideas) {
		populateIdeas(ideas);
	});
});