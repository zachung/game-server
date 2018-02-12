const Thomas = require('./src/class/thomas')
const GameMap = require('./src/class/gamemap')
const Game = require('../../library/Game')

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

class BombMan extends Game {
  static get nsp() {
    return "/bomb-man";
  }
  constructor() {
    super();
    this.width = 3000;
    this.height = 2000;

    this.monsterCountMax = 100;
  }
  addUser(socket) {
    super.addUser(socket);
    var game = this;
    var id = socket.id;
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
  }
  step(dt) {
    super.step(dt);
    var game = this;
    // map
    let step = game.gameMap.step(dt);
    let msg = step.next();
    while(!msg.done) {
      console.log(msg.value);
      msg = step.next();
    }
  }
  onStart(io) {
    var game = this;
    console.log('game starting...');
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
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports = BombMan;