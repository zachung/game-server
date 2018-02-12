const co = require('co')
const GameMap = require('./class/gamemap')
const Thomas = require('./class/thomas')

var ENGINE = {
  Resource: {},
  queue: [],
  isInit: false
};

// socket middleware
class SocketCommand {
  constructor() {
    this.socket = io('/bomb-man');
  }
  add(eventName, callback) {
    var socket = this.socket;
    this.socket.on(eventName, function() {
      var args = Array.of();
      ENGINE.queue.push({
        eventName: "on " + eventName,
        f: () => {
          // only allow "set map" at first listen
          if (!ENGINE.isInit && eventName !== "set map") {
            return;
          }
          // let callback has socket.id
          callback.apply(socket, arguments);
        }
      });
    });
  }
  emit(eventName, data) {
    ENGINE.queue.push({
      eventName: "emit " + eventName,
      f: () => {
        this.socket.emit(eventName, data);
      }
    });
  }
}

ENGINE.Game = {

  create: function() {

  },

  enter: function() {
    var game = this;
    var app = this.app;
    var max_radius = Math.max(this.app.width, this.app.height);

    app.scrollingBackground = new ScrollingBackground(app.images.background, app.center);
    app.scrollingBackground.init(app.width, app.height);

    ENGINE.Resource = app.music.play("music", true);
    ENGINE.enemies = [];
    ENGINE.bombs = [];
    ENGINE.items = [];
    ENGINE.users = [];

    var command = new SocketCommand();
    command.add('set map', function(map) {
      if (!ENGINE.isInit) {
        ENGINE.isInit = true;
        game.gameMap = new GameMap(map);
        game.thomas = game.gameMap.getUser(this.id);
      }
    });

    command.add('user add', function(user) {
      var remoteUser = new Thomas(user),
        loc = remoteUser.getLocation();
      var map = game.gameMap;
      // dirty trick!
      delete remoteUser.inMapLocation;
      map.setLocation(remoteUser, loc.i, loc.j);
    });

    var userLocation = function(user) {
      var remoteUser = new Thomas(user),
        loc = remoteUser.getLocation();
      var map = game.gameMap;
      var userInMap = map.getUser(user.id);
      if (userInMap) {
        userInMap.x = user.x;
        userInMap.y = user.y;
        map.moveObject(userInMap, 0, 0);
      } else {
        // dirty trick!
        delete remoteUser.inMapLocation;
        map.setLocation(remoteUser, loc.i, loc.j);
      }
    };
    command.add('user location', userLocation);

    command.add('spawn bomb', function(user) {
      userLocation(user);
      var user = game.gameMap.getUser(user.id);
      if (user) {
        var bomb = user.spawnBomb(game.gameMap);
        if (bomb) {
          bomb.on('die', () => {
            app.sound.play("explosion");
          });
        }
      }
    });

    command.add('user die', function(user) {
      var user = game.gameMap.getUser(user.id);
      if (user) {
        game.gameMap.remove(user);
      }
    });
    this.command = command;

    // this.gameMap = new GameMap();
    // this.gameMap.init();
    // this.thomas = new Thomas({
    //   hp: 100,
    //   hpMax: 100,
    //   color: "#" + (Math.random().toString(16) + "000000").slice(2, 8),
    //   onDie: function() {
    //     console.log('user die');
    //     game.removeUser(id);
    //   }
    // });
    // this.gameMap.addUser(this.thomas);
  },

  step: function(dt) {
    var center = this.app.center;
    var max_radius = Math.max(this.app.width, this.app.height);
    // thomas
    var thomas = this.app.thomas;
    // background
    if (thomas) {
      var delta = this.app.scrollingBackground.move(thomas, dt);
    }
    // message queue
    for (var i = ENGINE.queue.length - 1; i >= 0; --i) {
      let task = ENGINE.queue[i];
      if (!task.executeTime) {
        task.f();
        task.executeTime = new Date();
      } else {
        if (task.executeTime.getTime() + 1000*10 < (new Date()).getTime()) {
          ENGINE.queue.splice(i, 1); // Remove even numbers
        }
      }
    }

    if (this.gameMap) {
      let step = this.gameMap.step(dt);
      let msg = step.next();
      while (!msg.done) {
        console.log(msg.value);
        msg = step.next();
      }
    }
  },

  render: function(dt) {
    var app = this.app;
    var hpX = 1000;
    var hpDy = 20;
    var hpH = 30;
    var hpHCurrent = 200;

    app.layer.clear("#000");
    // background
    var oPoint = app.scrollingBackground.render(app);

    if (!this.gameMap) {
      return;
    }
    let id = this.thomas ? this.thomas.id : "";
    this.gameMap.render(app, oPoint, id);

    for (var i = ENGINE.queue.length - 1; i >= 0; --i) {
      app.layer
        .font("40px Georgia")
        .fillStyle(hpH + "px #abc")
        .fillText(ENGINE.queue[i].eventName, hpX, hpHCurrent);
      hpHCurrent += hpH + hpDy;
    }
  },

  keydown: function(data) {
    if (!this.thomas) {
      return;
    }
    var direct = 0b0000;
    switch (data.key) {
      case "a":
      case "left":
        direct |= 0b1000;
        break;
      case "d":
      case "right":
        direct |= 0b0100;
        break;
      case "w":
      case "up":
        direct |= 0b0010;
        break;
      case "s":
      case "down":
        direct |= 0b0001;
        break;
      case "c":
        this.command.emit('spawn_bomb');
        var bomb = this.thomas.spawnBomb(this.gameMap);
        if (bomb) {
          bomb.on('die', () => {
            this.app.sound.play("explosion");
          });
        }
        break;
    }
    this.command.emit('user_move', direct);
    this.thomas.setFaceDirectBits(direct);
  },

  keyup: function(data) {
    if (!this.thomas) {
      return;
    }
    var direct = 0b1111;
    switch (data.key) {
      case "a":
      case "left":
        direct &= 0b0111;
        break;
      case "d":
      case "right":
        direct &= 0b1011;
        break;
      case "w":
      case "up":
        direct &= 0b1101;
        break;
      case "s":
      case "down":
        direct &= 0b1110;
        break;
    }
    this.command.emit('user_move_not', direct);
    this.thomas.cancelFaceDirectBits(direct);
  },

};
var ScrollingBackground = function(image, center) {
  var _backgrounds = [];
  var backgrounds = [];
  var bw = image.width;
  var bh = image.height;
  var layer = {};
  var ox = center.x;
  var oy = center.y;
  var x = 0;
  var y = 0;
  this.directRadians = Math.asin(-1);
  this.faceDirectBits = 0b0000; // LRUD
  this.dontMove = true;

  this.move = function(user, dt) {
    x = ox - user.x;
    y = oy - user.y;
    var dx = x % bw,
      dy = y % bh,
      lw = this.layer.w,
      lh = this.layer.h,
      nx = Math.ceil(lw / bw) + 1,
      ny = Math.ceil(lh / bh) + 1;
    backgrounds = JSON.parse(JSON.stringify(_backgrounds));
    backgrounds.forEach(function(e) {
      e[0] += dx;
      e[1] += dy;
      if (e[0] < -bw) {
        e[0] += (nx + 1) * bw;
      }
      if (e[0] > lw) {
        e[0] -= (nx + 1) * bw;
      }
      if (e[1] < -bh) {
        e[1] += (ny + 1) * bh;
      }
      if (e[1] > lh) {
        e[1] -= (ny + 1) * bh;
      }
    });
    return [dx, dy];
  };
  this.init = function(w, h) {
    this.layer = {
      w: w,
      h: h
    };
    var nx = Math.ceil(w / bw) + 1;
    var ny = Math.ceil(h / bh) + 1;
    for (var i = -1; i <= nx; i++) {
      for (var j = -1; j <= ny; j++) {
        _backgrounds.push([i * bw, j * bh]);
      }
    }
  };
  this.render = function(app) {
    backgrounds.forEach(function(e) {
      app.layer.drawImage(image, e[0], e[1]);
    });
    return {
      x: x,
      y: y
    }
  };
};

class Queue {
  constructor() {
    this.queue = [];
  }
  push(msg) {
    this.queue.push(msg);
  }
  shift() {
    return this.queue.shift();
  }
}

module.exports = ENGINE;