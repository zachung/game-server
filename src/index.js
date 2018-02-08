var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

// 靜態檔案
app.use('/', express.static(__dirname + '/public'));

// single
app.use('/single', express.static(__dirname + '/single'));

// multi
[{
		name: "zombie-shooter",
		index: "zombie_shooter/zombie_shooter"
	},
	{
		name: "bomb-man",
		index: "bomb_man/bomb_man"
	},
	{
		name: "wizard-battle",
		index: "wizard_battle/index"
	},
	{
		name: "tower-defence",
		index: "tower_defence/index"
	}
].forEach(game => {
	let name = "/" + game.name;
	let index = "./lan/" + game.index;
	app.use(name, require(index)(io.of(name)));
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});