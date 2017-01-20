function checkPassword() {
	var password = document.getElementById('password').value;
	var password2= document.getElementById('password2').value;
	if (password!=password2) {
		if (document.getElementById('unmatchedPassword')===null) {
			var unmatchedPassword = document.createElement('div');
			unmatchedPassword.id = "unmatchedPassword";
			var errorMsg = document.createTextNode("Passwords did not match!");
			unmatchedPassword.appendChild(errorMsg);
			document.getElementById('signupForm').insertBefore(unmatchedPassword, document.getElementById('password2'));
		}
	}
	else {
		var unmatchedPassword = document.getElementById('unmatchedPassword');
		if (unmatchedPassword!=null) {
			document.getElementById('signupForm').removeChild(unmatchedPassword);
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('password2').addEventListener('input', checkPassword);
});

/*
var email = document.getElementById('email').value;
	var password = document.getElementById('password').value;
	var firstName = document.getElementById('firstName').value;
	var lastName = document.getElementById('lastName').value;
document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('password2').addEventListener('input', checkPassword);
	document.getElementById('signupForm').addEventListener('submit', createAccount);
	document.querySelector("body > div").innerHTML=error;
});*/