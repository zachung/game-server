const Thomas = require('./src/class/thomas')
const GameMap = require('./src/class/gamemap')

const SocketEvent = {
  disconnect(socket, user) {
    var id = user.id;
    console.log('user ' + id + ' disconnect');
    this.removeUser(user);
  },
  user_move(socket, user, direct) {
    user.setFaceDirectBits(direct);
  },
  user_move_not(socket, user, direct) {
    user.cancelFaceDirectBits(direct);
  },
  magic_attack(socket, user, clientUser) {
    user.directRadians = clientUser.directRadians;
    user.magicAttack(this.gameMap);
    socket.broadcast.emit('magic_attack', user);
  },
}

class Game {
  constructor() {
    this.isStart = false;
    this.users = {};
  }
  addUser(socket) {
    var game = this;
    var id = socket.id;
    console.log('user connected', 'user ' + id + ' connected');
    var user = new Thomas({
      id: id,
      color: "#" + (Math.random().toString(16) + "000000").slice(2, 8)
    });

    user.on('die', function() {
      console.log('user die');
      socket.broadcast.emit('user_die', user);
      socket.emit('user_die', user);
      setTimeout(() => {
        user.cancelFaceDirectBits(0b0000);
        console.log('respawn user', user.id);
        game.gameMap.addUser(user);
      }, 1000);
    });
    user.on('step', function(dt) {
      // user location
      socket.broadcast.emit('user_location', user);
      socket.emit('user_location', user);
    });
    game.gameMap.addUser(user);
    socket.broadcast.emit('user_location', user);
    socket.emit('set_map', this.gameMap);

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
  removeUser(user) {
    let id = user.id;
    console.log('user ' + id + ' been removed');
    this.gameMap.remove(user);
    delete this.users[id];
  }
  step(dt) {
    this.gameTime += dt;
    var game = this;
    // map
    game.gameMap.step(dt);
    // all user leave
    if (Object.keys(this.users).length === 0) {
      console.log('all user leave');
      this.stop();
      return;
    }
  }
  onStart(io) {
    console.log('game starting...');
    this.gameMap = new GameMap();
    this.gameMap.init();
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

module.exports = Game;