$(document).ready(function() {

  const loggedindiv = $('#loggedin');
  const loggedoutdiv = $('#loggedout');

  if (localStorage.getItem('username') !== null && !localStorage.getItem('username').startsWith('Guest')) {
    console.log('User is logged in');
    loggedindiv.css('display', 'block');
    loggedoutdiv.css('display', 'none');
    $('#welcomemessage').text('Hei, ' + localStorage.getItem('username') + '!');
    $.ajax({
      url: 'http://localhost:3000/validateSession',
      type: 'post',
      success: function(response, textStatus, jqXHR){
        console.log('Valid session');
        // User session is still valid no need to do anything
      },
      error: function(jqXHR, textStatus, errorThrown){
        // User session is not valid
        console.log('Invalid session');
        localStorage.removeItem('username');
        window.location.replace('http://localhost:3000/expired');
      },
    });
  } else {
    console.log('User is logged out');
    loggedindiv.css('display', 'none');
    loggedoutdiv.css('display', 'block');
    let randomGuestName = "Guest";
    const randomNumber = Math.floor(Math.random() * 999999) + 100000;
    randomGuestName = randomGuestName + randomNumber;
    localStorage.setItem('username', randomGuestName);
  }

  $("#password, #password_again").on('keyup', (event) => {
    if ($("#password").val() !== $("#password_again").val()) {
      $("#registerMessage").text("Salasanat eivät täsmää");
    } else {
      $("#registerMessage").text("");
    }
  });

  $("#loginButton").on('click', (event) => {
    login();
  });

  $("#registerButton").on('click', (event) => {
    register();
  });

  $("#logoutButton").on('click', (event) => {
    logout();
  });

  function logout() {
    $.ajax({
      url: 'http://localhost:3000/logout',
      type: 'post',
      success: function(response, textStatus, jqXHR) {
        localStorage.removeItem('username');
        window.location.replace('http://localhost:3000');
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert('Uloskirjautuminen epäonnistui');
      }
    });
  }

  function login() {

    const serializedData = $('#loginForm').serialize();
    console.log(serializedData);

    $.ajax({
      url: 'http://localhost:3000/login',
      type: 'post',
      data: serializedData,
      success: function(response, textStatus, jqXHR) {
        localStorage.setItem('username', response.username);
        loggedindiv.css('display', 'block');
        loggedoutdiv.css('display', 'none');
        $('#closeLoginModal').click();
        $('#welcomemessage').text('Hei, ' + localStorage.getItem('username') + '!');
        console.log('Login Successful');
        if (window.location.href.includes('expired')) {
          window.location.replace('http://localhost:3000');
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error(
          "The following error occurred: "+
          textStatus, errorThrown
        );
      }
    });

  }

  function register() {
    if ($("#password").val() === $("#password_again").val()) {
      const allowed = /^[0-9a-zA-Z]+$/;
      if ($("#username").val().match(allowed)) {
        const serializedData = $('#registerForm').serialize();
        console.log(serializedData);
        $.ajax({
          url: 'http://localhost:3000/register',
          type: 'post',
          data: serializedData,
          success: function(response, textStatus, jqXHR) {
            $('#closeRegisterModal').click();
            $('#openLoginModalButton').click();
            $('#loginMessage').text('Rekisteröityminen onnistui! Voit nyt kirjautua sisään!');
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log('The following error occurred: '+textStatus,errorThrown);
          }
        });
      } else {
        alert('Käyttäjänimi voi sisältää vain kirjaimia ja numeroita');
      }
    }
  }
});