var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// single
app.use('/single/brick_breaker', express.static(__dirname + '/single/brick_breaker'));
app.use('/single/rect_dancer', express.static(__dirname + '/single/rect_dancer'));
app.use('/single/zombie_shooter', express.static(__dirname + '/single/zombie_shooter'));

// lan game
app.use('/zombie-shooter', require('./lan/zombie_shooter/zombie_shooter')(
  app, io.of('/zombie-shooter')
));

// bomb man
app.use('/bomb-man', require('./lan/bomb_man/bomb_man')(
  app, io.of('/bomb-man')
));

http.listen(3000, function() {
  console.log('listening on *:3000');
});