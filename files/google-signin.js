$(function() {

	var googleUser = {};
	var startApp = function() {
		gapi.load('auth2', function(){
		  // Retrieve the singleton for the GoogleAuth library and set up the client.
		  auth2 = gapi.auth2.init({
		    client_id: '189600346703-gjhpvsna6peafm84grf0unb6kv66lanl.apps.googleusercontent.com',
		    cookiepolicy: 'single_host_origin',
		    // Request scopes in addition to 'profile' and 'email'
		    //scope: 'additional_scope'
		  });
		  attachSignin(document.getElementById('google_signin'));
		});
	};

	function attachSignin(element) {
		console.log(element.id);
		auth2.attachClickHandler(element, {},
		    function(googleUser) {
			 document.getElementById('last-name').value = googleUser.getBasicProfile().getFamilyName();
			 document.getElementById('first-name').value = googleUser.getBasicProfile().getGivenName();
			// document.getElementById('middle-name').value = googleUser.getBasicProfile().getName();
			 document.getElementById('email').value = googleUser.getBasicProfile().getEmail();
		    }, function(error) {
		      console.log(JSON.stringify(error, undefined, 2));
		    });
	}

	if($('#google_signin').length)
		startApp();

});
