const Thomas = require('./src/class/thomas')
const GameMap = require('./src/class/gamemap')

class Lobby {
  constructor() {
    this.isOn = false;
    this.games = {};
    this.users = [];
  }
  addUser(socket) {
    this.users.push(socket.id);
  }
  /**
   * find first game or create
   *
   * @param      {socket}  socket  The socket
   * @return     {Game}  instance of Game
   */
  findGame(socket) {
    var game_ids = Object.keys(this.games);
    if (game_ids.length === 0) {
      var game = new Game(socket);
      this.games[socket.id] = game;
      return game;
    }
    return this.games[game_ids[0]];
  }
  on(io) {
    if (this.isOn) {
      return;
    }
    var lobby = this;
    io.on("connection", function(socket) {
      console.log('new socket in');
      lobby.addUser(socket);
      var game = lobby.findGame(socket);
      if (!game.isRunning()) {
        game.start(io);
      }
      game.addUser(socket);
    });
    this.isOn = true;

    var time_pre = new Date();
    this.interval = setInterval(function() {
      var now = new Date();
      var dt = now.getTime() - time_pre.getTime();
      time_pre = now;
      Object.keys(lobby.games).map(function(key) {
        if (!lobby.games[key].isRunning()) {
          delete lobby.games[key];
          console.log('game ' + key + ' been killed.');
        }
      });
    }, 10);
    console.log('lobby on');
  }
  off() {
    clearInterval(this.interval);
  }
}

const SocketEvent = {
  disconnect(socket, user) {
    var id = user.id;
    console.log('user ' + id + ' disconnect');
    user.die();
    this.removeUser(id);
  },
  user_move(socket, user, direct) {
    user.setFaceDirectBits(direct);
  },
  user_move_not(socket, user, direct) {
    user.cancelFaceDirectBits(direct);
  },
  spawn_bomb(socket, user) {
    user.spawnBomb(this.gameMap);
    console.log(user.id, 'spawn bomb', user.getLocation());
    socket.broadcast.emit('spawn bomb', user);
  }
}

class Game {
  constructor() {
    this.isStart = false;
    this.users = {};
    this.width = 3000;
    this.height = 2000;

    this.monsterCountMax = 100;
  }
  addUser(socket) {
    var game = this;
    var id = socket.id;
    console.log('user connected', 'user ' + id + ' connected');
    var user = new Thomas({
      id: id,
      hp: 1,
      hpMax: 1,
      color: "#" + (Math.random().toString(16) + "000000").slice(2, 8)
    });
    user.on('die', function() {
      console.log('user die');
      socket.emit('user die', user);
    });
    user.on('step', function(dt) {
      // user location
      socket.broadcast.emit('user location', user);
      socket.emit('user location', user);
    });
    game.gameMap.addUser(user);
    // once time
    socket.broadcast.emit('user add', user);
    socket.emit('set map', game.gameMap);

    for (const key in SocketEvent) {
      if (SocketEvent.hasOwnProperty(key)) {
        socket.on(key, function() {
          var args = Array.from(arguments);
          args.unshift(user);
          args.unshift(socket);
          SocketEvent[key].apply(game, args);
        });
      }
    }
    this.users[id] = user;
  }
  removeUser(id) {
    console.log('user ' + id + ' been removed');
    delete this.users[id];
  }
  nearsetUser(x, y) {
    var nearest;
    var nearest_d;
    for (var key in this.users) {
      if (this.users.hasOwnProperty(key)) {
        var user = this.users[key];
        var a = user.x - x,
          b = user.y - y;
        var user_d = Math.sqrt(a * a + b * b);
        if (!nearest) {
          nearest = user;
          nearest_d = user_d;
        } else {
          if (user_d < nearest_d) {
            nearest = user;
            nearest_d = user_d;
          }
        }
      }
    }
    return nearest;
  }
  step(dt) {
    this.gameTime += dt;
    var game = this;
    // map
    let step = game.gameMap.step(dt);
    let msg = step.next();
    while(!msg.done) {
      console.log(msg.value);
      msg = step.next();
    }
    // all user leave
    if (Object.keys(this.users).length === 0) {
      console.log('all user leave');
      this.stop();
      return;
    }
  }
  onStart(io) {
    var game = this;
    console.log('game starting...');
    this.gameTime = 0;
    this.gameMap = new GameMap();
    this.gameMap.x = 0;
    this.gameMap.y = 0;
    this.gameMap.init();

    this.gameMap.on('step', function(dt) {
      if (game.gameTime % 1 < dt) {
        io.emit('set map', game.gameMap);
      }
    })
  }
  start(io) {
    if (this.isStart) {
      return;
    }
    this.isStart = true;
    var time_pre = new Date();
    var game = this;
    game.onStart(io);
    this.interval = setInterval(function() {
      var now = new Date();
      var dt = now.getTime() - time_pre.getTime();
      game.step(dt / 1000);
      time_pre = now;
    }, 10);
  }
  stop() {
    console.log('game stop');
    clearInterval(this.interval);
    this.isStart = false;
  }
  isRunning() {
    return this.isStart;
  }
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports = Lobby;