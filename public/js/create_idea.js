
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

function convertTextAreaToMarkdown() {
	var converter = new showdown.Converter();
    var ideaDescription = document.getElementById('ideaDescription');
    var markdownArea = document.getElementById('markdown');

    var ideaDescriptionText = ideaDescription.value;
    html = converter.makeHtml(ideaDescriptionText);
    markdownArea.innerHTML = html;
}

$(document).ready(function() {
	$("#ideaDescription").on('input', convertTextAreaToMarkdown);
	convertTextAreaToMarkdown();
	$("#postIdeaForm").submit(function(event) {
		event.preventDefault();
		var ideaTitle = $("#ideaTitle").val();
		var ideaDescription = $("#ideaDescription").val();
		var cookie = getCookie('token');
		var idea = {ideaTitle: ideaTitle, ideaDescription: ideaDescription};
		$.ajax({
			url: encodeURI('/api/member/me/idea'),
			type: 'POST',
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', cookie);
			},
			data: idea,
			dataType: "text",
			success: function (result) {
				console.log(result);
				window.location.replace('/privileged/me/ideas');
			},
			error: function(xhr, status, error) {
				console.log(error);
			}
		});
	});
});