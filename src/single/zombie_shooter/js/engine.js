var ENGINE = {
  Resource: {},
  difficulty: 10
};
var collisionDetection = new CollisionDetection();

ENGINE.Intro = {

  level: 1,

  create: function() {

    this.app.scrollingBackground = new ScrollingBackground(this.app.images.background);
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
    var max_radius = Math.max(this.app.width, this.app.height);

    this.app.scrollingBackground = new ScrollingBackground(this.app.images.background);
    this.app.scrollingBackground.init(this.app.width, this.app.height);

    this.app.thomas = new Thomas({
      speed: 128,
      x: this.app.center.x,
      y: this.app.center.y,
      hp: 10,
      defence: 1
    });
    var gun = new Gun({
      max_radius: max_radius,
      colddown: ENGINE.levelData.gunColddown
    });
    this.app.thomas.takeWeapon(gun);

    ENGINE.Resource = this.app.music.play("music", true);
    ENGINE.enemies = [];
    ENGINE.bullets = [];
    ENGINE.items = [];
    ENGINE.score = new Score();

  },

  step: function(dt) {
    var center = this.app.center;
    var max_radius = Math.max(this.app.width, this.app.height);
    // thomas
    var thomas = this.app.thomas;
    // background
    var delta = this.app.scrollingBackground.move(thomas.speed * dt);

    // enemies
    var enemies = ENGINE.enemies;
    if (Math.random() < ENGINE.levelData.monsterSpawnRate) {
      // new place
      var min_radius = ENGINE.levelData.monsterSpawnRadiusMin;
      var spawn_radius = Math.random() * (max_radius - min_radius) + min_radius;
      var radians = Math.floor(Math.random() * 360);
      var enemy = new Zombie({
        speed: ENGINE.levelData.monsterSpeed,
        x: Math.cos(radians) * spawn_radius,
        y: Math.sin(radians) * spawn_radius,
        directRadians: -radians
      });
      enemies.push(enemy);
    }
    // enemies running
    enemies.forEach(function(enemy) {
      enemy.faceTo(thomas.x, thomas.y);
      enemy.run(dt);
      enemy.x -= delta[0];
      enemy.y -= delta[1];
      if (collisionDetection.RectRectColliding(enemy, thomas)) {
        console.log('collission');
        if (!thomas.getDamage(enemy.damage*dt)) {
          this.app.music.stop(ENGINE.Resource);
          this.app.setState(ENGINE.Game);
        }
      }
    });
    // shoot
    thomas.attack(enemies, dt);

    // gen item
    var items = ENGINE.items;
    if (items.length < 10) {
      var item = new Item({
        x: Math.random() * this.app.width,
        y: Math.random() * this.app.height,
        type: Item.gunColddown,
        value: -0.01
      });
      items.push(item);
    }
    items.forEach(function(item) {
      item.x -= delta[0];
      item.y -= delta[1];
      if (collisionDetection.RectRectColliding(item, thomas)) {
        console.log('get item');
        thomas.getItem(item);
        items.splice(items.indexOf(item), 1);
      }
    });
  },

  render: function(dt) {
    var app = this.app;
    var thomas = this.app.thomas;

    app.layer.clear("#000");
    // background
    app.scrollingBackground.render(app);

    app.layer
      .font("40px Georgia")
      .fillText("Current: " + ENGINE.score.getScore(), app.width - 300, 160)
      .font("40px Green")
      .fillText("High: " + ENGINE.score.getHighScore(), app.width - 300, 80)
      // hp
      .fillStyle("#000")
      .fillRect(20, 20, 300, 30)
      .fillStyle("#F00")
      .fillRect(20, 20, 300*(thomas.hp/thomas.hpMax), 30);

    app.thomas.render(app.layer);
    ENGINE.enemies.forEach(function(enemy) {
      enemy.render(app);
    });
    ENGINE.items.forEach(function(item) {
      item.render(app.layer);
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
    }
    this.app.scrollingBackground.faceTo(direct);
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
    this.app.scrollingBackground.faceCancel(direct);
  },

  mousemove: function(data) {
    this.app.thomas.faceTo(data.x, data.y);
  },

};
var ScrollingBackground = function(image) {
  var backgrounds = [];
  var bw = image.width;
  var bh = image.height;
  var layer = {};
  this.directRadians = Math.asin(-1);
  this.faceDirectBits = 0b0000; // LRUD
  this.dontMove = true;

  this.move = function(speed) {
    if (this.dontMove) {
      return [0, 0];
    }
    var dx = Math.cos(this.directRadians) * speed,
      dy = Math.sin(this.directRadians) * speed,
      lw = this.layer.w,
      lh = this.layer.h,
      nx = Math.ceil(lw / bw) + 1,
      ny = Math.ceil(lh / bh) + 1;
    backgrounds.forEach(function(e) {
      e[0] -= dx;
      e[1] -= dy;
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
        backgrounds.push([i * bw, j * bh]);
      }
    }
  };
  var turn = function() {
    var x = 0, y = 0;
    x -= (this.faceDirectBits >> 3) & 1; // L
    x += (this.faceDirectBits >> 2) & 1; // R
    y -= (this.faceDirectBits >> 1) & 1; // U
    y += (this.faceDirectBits >> 0) & 1; // D
    this.directRadians = Math.atan2(y, x);
    this.dontMove = x === 0 && y === 0;
  }
  this.faceTo = function(direct) {
    this.faceDirectBits |= direct;
    turn.call(this);
  };
  this.faceCancel = function(direct) {
    this.faceDirectBits &= direct;
    turn.call(this);
  };
  this.render = function(app) {
    backgrounds.forEach(function(e) {
      app.layer.drawImage(image, e[0], e[1]);
    });
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

class Bullet extends Ball {
  constructor(options) {
    const defaults = {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      color: "#ff0000",
      speed: 1024,
      directRadians: 0,
      damage: 1,
      hp: 1 // can go throw somebody
    };
    const populated = Object.assign(defaults, options);
    super(populated);
  }
  render(layer) {
    layer
      .fillStyle(this.color)
      .fillRect(this.x, this.y, this.width, this.height);
  }
}

class Gun {
  constructor(options) {
    const defaults = {
      max_radius: 0,
      colddown: 0,
      toRadians: Math.asin(-1)
    };
    const populated = Object.assign(defaults, options);
    for (const key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key];
      }
    }
    this.bullets = [];
    this.nextshoot = 0;
  }
  faceTo(toRadians) {
    this.toRadians = toRadians;
  }
  attack(fromX, fromY, dt) {
    if (this.nextshoot > 0) {
      this.nextshoot -= dt;
      return;
    }
    var bullets = this.bullets;
    var bullet = new Bullet({
      x: fromX,
      y: fromY,
      directRadians: this.toRadians
    });
    bullets.push(bullet);
    // bullet out of screen
    var bullets_index = bullets.length - 1;
    while (bullets_index >= 0) {
      var bullet = bullets[bullets_index];
      if (bullet.x > this.max_radius || bullet.y > this.max_radius) {
        bullets.splice(bullets_index, 1);
      }
      bullets_index -= 1;
    }
    this.nextshoot = this.colddown;
    return bullet;
  }
  step(enemies, dt) {
    var bullets = this.bullets;
    bullets.forEach(function(bullet) {
      bullet.run(dt);
      enemies.forEach(function(enemy) {
        if (collisionDetection.RectRectColliding(bullet, enemy)) {
          console.log('hit monster');
          // add score
          ENGINE.score.add(ENGINE.levelData.scorePreHit);
          ENGINE.score.save();
          // bullet die
          if (!bullet.getDamage(enemy.defence)) {
            bullets.splice(bullets.indexOf(bullet), 1);
          }
          // enemy get damage
          if (!enemy.getDamage(bullet.damage)) {
            // enemy die
            enemies.splice(enemies.indexOf(enemy), 1);
          }
        }
      });
    });
  }
  render(layer) {
    this.bullets.forEach(function(bullet) {
      bullet.render(layer);
    });
  }
  upgrade(type, value, isMultiply) {
    if (!isMultiply) {
      this[type] += value;
    } else {
      this[type] *= value;
    }
  }
}

var LevelData = function(data) {
  return new Proxy(data, {
    get(target, name) {
      var val = data[name];
      return val;
    }
  });
}

class Item extends Ball {
  static get gunColddown() {
    return "gunColddown";
  }
  constructor(options = {}) {
    options.speed = 0;
    options.color = "#000";
    super(options);
  }
}