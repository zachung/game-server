var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const Lobby = require('./library/Lobby')
const Game = require('./library/Game')

var lobby = new Lobby(io);

app.use("/", function() {
	var router = express.Router()

	router.get('/', function(req, res) {
		res.sendFile(__dirname + '/public/index.html');
	});

	// 靜態檔案
	router.use('/', express.static(__dirname + '/public'));

	// single
	router.use('/single', express.static(__dirname + '/single'));

	lobby.on(Game);

	return router;
}());

// multi
[{
		name: "zombie-shooter",
		index: "zombie_shooter/index"
	},
	{
		name: "bomb-man",
		index: "bomb_man/index"
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
	app.use(name, require(index)(lobby));
});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});