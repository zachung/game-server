const co = require('co')
const GameMap = require('./class/gamemap')
const Thomas = require('./class/thomas')
const SocketCommand = require('../../../library/SocketCommand')
const GAME_NAME = "/wizard-battle";

var ENGINE = {
  Resource: {},
  command: undefined,
  isInit: false
};

ENGINE.Game = {

  create: function() {
    let game = this;
    this.command = new SocketCommand(GAME_NAME);
    this.command.add('set_map', function(map) {
      if (!game.isInit) {
        game.isInit = true;
        game.gameMap = new GameMap(map);
        game.thomas = game.gameMap.getUser(this.id);
      }
    });
  },

  enter: function() {
    var game = this;
    var app = this.app;

    app.scrollingBackground = new ScrollingBackground(app.images.background);

    ENGINE.Resource = app.music.play("music", true);
    ENGINE.enemies = [];
    ENGINE.bombs = [];
    ENGINE.items = [];
    ENGINE.users = [];

    this.command.add('user_location', function(user) {
      if (!game.isInit) {
        return;
      }
      var id = this.id;
      var map = game.gameMap;
      var userInMap = map.getUser(user.id);
      if (userInMap) {
        userInMap.x = user.x;
        userInMap.y = user.y;
      } else {
        map.addUser(new Thomas(user));
      }
      game.thomas = game.gameMap.getUser(id);
    });

    this.command.add('user_die', function(user) {
      if (!game.isInit) {
        return;
      }
      var user = game.gameMap.getUser(user.id);
      if (user) {
        game.gameMap.remove(user);
      }
    });

    this.command.add('magic_attack', function(user) {
      if (!game.isInit) {
        return;
      }
      var userInMap = game.gameMap.getUser(user.id);
      if (userInMap) {
        userInMap.directRadians = user.directRadians;
        userInMap.magicAttack(game.gameMap);
      }
    });

    // this.gameMap = new GameMap();
    // this.gameMap.init();
    // this.thomas = new Thomas({
    //   hp: 100,
    //   hpMax: 100,
    //   id: "local_id",
    //   color: "#" + (Math.random().toString(16) + "000000").slice(2, 8)
    // });
    // this.thomas.on('die', () => {
    //   console.log('user die');
    //   game.gameMap.remove(this.thomas);
    //   delete this.thomas;
    // });
    // this.gameMap.addUser(this.thomas);

    // tester
    // let otherUser = new Thomas({
    //   x: 0,
    //   y: 100,
    //   hp: 100,
    //   hpMax: 100,
    //   id: "other_id",
    //   color: "#" + (Math.random().toString(16) + "000000").slice(2, 8)
    // });
    // otherUser.on('die', () => {
    //   console.log('other user die');
    //   game.gameMap.remove(otherUser);
    // });
    // this.gameMap.addUser(otherUser);
  },

  step: function(dt) {
    var center = this.app.center;
    // thomas
    var thomas = this.thomas;
    // message queue
    this.command.executeAll();

    if (this.gameMap) {
      this.gameMap.step(dt);
    }
  },

  render: function(dt) {
    var app = this.app;
    var hpX = app.width - 250;
    var hpDy = 20;
    var hpH = 30;
    var hpHCurrent = 200;

    app.layer.clear("#000");

    if (!this.gameMap) {
      return;
    }

    // character location
    if (this.thomas) {
      // background
      this.oPoint = app.scrollingBackground.render(app, this.thomas);

      app.layer
        .font("40px Georgia")
        .fillStyle("30 px #abc")
        .fillText("(" + [
          this.thomas.x.toFixed(2),
          this.thomas.y.toFixed(2)
        ].join(",") + ")", app.width - 250, 100);
    }

    let id = this.thomas ? this.thomas.id : "";
    this.gameMap.render(app, this.oPoint, id);

    let queue = this.command.getList();
    for (let i = queue.length - 1, max = Math.max(queue.length - 10, 0); i >= max; --i) {
      app.layer
        .font("40px Georgia")
        .fillStyle(hpH + "px #abc")
        .fillText(queue[i].eventName, hpX, hpHCurrent);
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
      case "mouseleft":
        this.command.emit('magic_attack', this.thomas);
        this.thomas.magicAttack(this.gameMap);
        return;
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

  mousemove: function(data) {
    if (this.thomas) {
      this.thomas.faceTo(data.x - this.oPoint.x, data.y - this.oPoint.y);
    }
  }

};
var ScrollingBackground = function(image) {
  var bw = image.width;
  var bh = image.height;
  var layer = {};
  this.directRadians = Math.asin(-1);
  this.faceDirectBits = 0b0000; // LRUD
  this.dontMove = true;

  this.render = function(app, user) {
    let
      w = app.width,
      h = app.height,
      x = app.center.x - user.x,
      y = app.center.y - user.y,
      dx = x % bw,
      dy = y % bh,
      nx = Math.ceil(w / bw) + 1,
      ny = Math.ceil(h / bh) + 1,
      backgrounds = []
      ;
    for (var i = -1; i <= nx; i++) {
      for (var j = -1; j <= ny; j++) {
        backgrounds.push([
          i * bw + dx,
          j * bh + dy
          ]);
      }
    }
    backgrounds.forEach(function(e) {
      app.layer.drawImage(image, e[0], e[1]);
    });
    return {
      x: x,
      y: y
    };
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