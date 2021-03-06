var socket = io();
var createMoment = function(time) {
  return moment(time).format('h:mm a');
};

var user = $.deparam(window.location.search);
// user is an object with name and room properties

socket.on('connect', () => {
  //Question: how is this error handling function called inside the browser, when it is clearly called in server.js?
  socket.emit('userJoined', user, function(err) {
    alert(err);
    window.location.href = '/';
  });
});

//could maybe redesign the rendering so it will add / remove the user name one at a time instead of rerendering the entire page

socket.on('usersUpdated', function(users) {
  $('#users').html('');
  users.forEach(function(user) {
    var template = $('#users-template').html()
    var li = Mustache.render(template, {user})
    $('#users').append(li)
  })
})

$('#sendMessage').on('click', function(e) {
  e.preventDefault();
  var message = $('#message')[0];
  socket.emit('createMessage', message.value, function(e) {
    alert(e);
  });
  message.value = '';
});

socket.on('newMessage', function(newMessage) {
  var template = $('#message-template').html();
  var message = Mustache.render(template, {
    from: newMessage.from,
    createdAt: moment(newMessage.createdAt).format('h:mm a'),
    message: newMessage.message
  });

  $('#messages').append(message);
});

var locationButton = $('#locationButton');
locationButton.on('click', function() {
  var disableButton = function(btn) {
    btn.text('Sending...');
    btn.attr('disabled', 'disabled');
  };

  var enableButton = function(btn, text) {
    btn.removeAttr('disabled');
    btn.text(text);
  };

  disableButton(locationButton);

  navigator.geolocation.getCurrentPosition(
    function(location) {
      enableButton(locationButton, 'Send Location');
      var position = location.coords;
      socket.emit('sendLocation', position.latitude, position.longitude);
    },
    function() {
      locationButton.removeAttr('disabled');
      alert('Could not fetch location!');
    }
  );
});

socket.on('sendLocationMessage', function(locationMessage) {
  var template = $('#location-message-template').html();
  var message = Mustache.render(template, {
    from: locationMessage.from,
    createdAt: moment(locationMessage.createdAt).format('h:mm a'),
    url: locationMessage.url
  });

  $('#messages').append(message);
});
