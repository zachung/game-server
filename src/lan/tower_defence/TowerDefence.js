const Thomas = require('./src/class/enemy')

const SocketEvent = {
  disconnect(socket, user) {
    var id = user.id;
    console.log('user ' + id + ' disconnect');
    this.removeUser(user);
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
    delete this.users[id];
  }
  step(dt) {
    this.gameTime += dt;
    var game = this;
    // all user leave
    if (Object.keys(this.users).length === 0) {
      console.log('all user leave');
      this.stop();
      return;
    }
  }
  onStart(io) {
    console.log('game starting...');
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