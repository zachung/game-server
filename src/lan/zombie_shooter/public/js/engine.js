var ENGINE = {
  Resource: {},
  difficulty: 10
};
var collisionDetection = new CollisionDetection();

ENGINE.Intro = {

  level: 1,

  create: function() {

    this.app.scrollingBackground = new ScrollingBackground(this.app.images.background, this.app.center);
    this.app.scrollingBackground.init(this.app.width, this.app.height);

    this.addButton = {
      text: "＋",
      x: this.app.center.x + 200,
      y: this.app.center.y,
      width: 40,
      height: 40,
      background_color: "#eee"
    };
    this.minusButton = {
      text: "－",
      x: this.app.center.x - 200,
      y: this.app.center.y,
      width: 40,
      height: 40,
      background_color: "#eee"
    };
    this.startButton = {
      text: "Start",
      x: this.app.center.x,
      y: this.app.center.y + 200,
      width: 80,
      height: 40,
      background_color: "#eee"
    };
  },

  enter: function() {

  },

  step: function(dt) {},

  render: function(dt) {
    var addButton = this.addButton;
    var minusButton = this.minusButton;
    var startButton = this.startButton;

    this.app.layer.clear("#000");
    // background
    this.app.scrollingBackground.render(this.app);

    this.app.layer
      .font("40px Georgia")
      .fillText("Level: " + this.level, this.app.center.x - 30, this.app.center.y)
      .fillStyle(addButton.height + "px #abc")
      .textWithBackground(addButton.text, addButton.x, addButton.y, addButton.background_color)
      .fillStyle(minusButton.height + "px #abc")
      .textWithBackground(minusButton.text, minusButton.x, minusButton.y, minusButton.background_color)
      .fillStyle(startButton.height + "px #abc")
      .textWithBackground(startButton.text, startButton.x, startButton.y, startButton.background_color);
  },

  mousedown: function(data) {

    if (collisionDetection.RectPointColliding(this.addButton, data)) {
      this.level++;
    }
    if (collisionDetection.RectPointColliding(this.minusButton, data)) {
      this.level--;
    }
    if (this.level > 10) this.level = 10;
    if (this.level < 1) this.level = 1;

    // larger harder
    if (collisionDetection.RectPointColliding(this.startButton, data)) {
      ENGINE.difficulty = this.level;
      this.app.setState(ENGINE.Game);
    }

  },

};

ENGINE.Game = {

  create: function() {

    ENGINE.levelData = new LevelData(this.app.data.levels[ENGINE.difficulty]);

  },

  enter: function() {
    var app = this.app;
    var max_radius = Math.max(this.app.width, this.app.height);

    app.scrollingBackground = new ScrollingBackground(app.images.background, app.center);
    app.scrollingBackground.init(app.width, app.height);

    ENGINE.Resource = app.music.play("music", true);
    ENGINE.enemies = [];
    ENGINE.bombs = [];
    ENGINE.items = [];
    ENGINE.users = [];
    ENGINE.score = new Score();

    socket.on('new enemy', function(msg) {
      ENGINE.enemies.push(new Zombie(msg));
    });

    socket.on('set enemies', function(zombies) {
      ENGINE.enemies = [];
      Object.keys(zombies).map(function(key) {
        var enemy = zombies[key];
        ENGINE.enemies.push(new Zombie(enemy));
      });
    });

    socket.on('set bombs', function(bombs) {
      ENGINE.bombs = [];
      Object.keys(bombs).map(function(key) {
        var bomb = bombs[key];
        ENGINE.bombs.push(new Bomb(bomb));
      });
    });

    socket.on('set items', function(items) {
      ENGINE.items = [];
      Object.keys(items).map(function(key) {
        var item = items[key];
        ENGINE.items.push(new Item(item));
      });
    });

    socket.on('set user', function(users) {
      ENGINE.users = [];
      delete app.thomas;
      users.forEach(function(user) {
        var thomas = new Thomas(user);
        var gun = new Gun(user.weapon);
        thomas.takeWeapon(gun);
        ENGINE.users.push(thomas);
        if (socket.id === user.id) {
          app.thomas = thomas;
        }
      });
    });

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
  },

  render: function(dt) {
    var app = this.app;
    var thomas = this.app.thomas;
    var hpDy = 20;
    var hpH = 30;
    var hpHCurrent = 20;

    app.layer.clear("#000");
    // background
    var oPoint = app.scrollingBackground.render(app);

    app.layer
      .font("40px Georgia")
      .fillText("Current: " + ENGINE.score.getScore(), app.width - 300, 160)
      .font("40px Green")
      .fillText("High: " + ENGINE.score.getHighScore(), app.width - 300, 80)
      // hp
      .fillStyle("#000")
      .fillRect(20, hpHCurrent, 300, hpH);
    if (thomas) {
      app.layer
        .fillStyle("#F00")
        .fillRect(20, hpHCurrent, 300*(thomas.hp/thomas.hpMax), hpH);
    }

    ENGINE.enemies.forEach(function(enemy) {
      enemy.renderImage(app, oPoint);
    });
    ENGINE.users.forEach(function(user) {
      user.render(app, oPoint);
      // other players
      if (!thomas || user.id !== thomas.id) {
        hpHCurrent += hpH + hpDy;
        app.layer
          .fillStyle("#000")
          .fillRect(20, hpHCurrent, 300, hpH)
          .fillStyle("#F00")
          .fillRect(20, hpHCurrent, 300*(user.hp/user.hpMax), hpH);
      }
    });
    ENGINE.items.forEach(function(item) {
      item.renderImage(app, oPoint);
    });
    ENGINE.bombs.forEach(function(bomb) {
      bomb.renderImage(app, oPoint);
    });
  },

  keydown: function(data) {
    var direct = 0b0000;
    switch (data.key) {
      case "a":
        direct |= 0b1000;
        break;
      case "d":
        direct |= 0b0100;
        break;
      case "w":
        direct |= 0b0010;
        break;
      case "s":
        direct |= 0b0001;
        break;
      case "c":
        socket.emit('set_bomb');
        break;
    }
    socket.emit('user_move', direct);
  },

  keyup: function(data) {
    var direct = 0b1111;
    switch (data.key) {
      case "a":
        direct &= 0b0111;
        break;
      case "d":
        direct &= 0b1011;
        break;
      case "w":
        direct &= 0b1101;
        break;
      case "s":
        direct &= 0b1110;
        break;
    }
    socket.emit('user_move_not', direct);
  },

  mousemove: function(data) {
    var center = this.app.center;
    var directRadians = Math.atan2(data.y - center.y, data.x - center.x);
    socket.emit('user_mouse_move', {directRadians: directRadians});
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

var Score = function() {
  this.scoreCurrent = 0;
  this.scoreMax = 0;
  this.highscore = localStorage.getItem("highscore") || 0;

  this.save = function() {
    if (this.scoreCurrent > this.highscore) {
      this.highscore = this.scoreCurrent;
      localStorage.setItem("highscore", this.highscore);
    }
  };
  this.clear = function() {
    this.scoreCurrent = 0;
    this.scoreMax = 0;
  };
  this.add = function(score) {
    this.scoreCurrent += score;
    this.scoreMax = Math.max(this.scoreMax, this.scoreCurrent);
  };
  this.newScore = function() {
    return this.scoreCurrent === this.scoreMax;
  };
  this.getHighScore = function() {
    return (new Number(this.highscore)).toFixed(2);
  }
  this.getScore = function() {
    return (new Number(this.scoreCurrent)).toFixed(2);
  }
};

var LevelData = function(data) {
  return new Proxy(data, {
    get(target, name) {
      var val = data[name];
      return val;
    }
  });
}