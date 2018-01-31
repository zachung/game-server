var ENGINE = {
  Resource: {},
  difficulty: 0
};
var collisionDetection = new CollisionDetection();

ENGINE.Intro = {

  level: 1,

  enter: function() {

  },

  create: function() {

    this.app.scrollingBackground = new ScrollingBackground(this.app.images.background);
    this.app.scrollingBackground.init(this.app.width, this.app.height);

    this.app.thomas = new Ball();
    this.app.thomas.x = this.app.center.x;
    this.app.thomas.y = this.app.center.y;

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

  step: function(dt) {
  },

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
      .textWithBackground(startButton.text, startButton.x, startButton.y, startButton.background_color)
      ;
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
      ENGINE.difficulty = this.level / 10;
      this.app.setState(ENGINE.Game);
    }

  },

};

ENGINE.Game = {

  enter: function() {

    ENGINE.Resource = this.app.music.play("music", true);
    ENGINE.enemies = [];
    ENGINE.score = new Score();

  },

  create: function() {

    this.app.scrollingBackground = new ScrollingBackground(this.app.images.background);
    this.app.scrollingBackground.init(this.app.width, this.app.height);

    this.app.thomas = new Ball();
    this.app.thomas.x = this.app.center.x;
    this.app.thomas.y = this.app.center.y;
  },

  step: function(dt) {
    // thomas
    var thomas = this.app.thomas;
    // background
    var delta = this.app.scrollingBackground.move(thomas.speed * dt);

    // calc distance
    ENGINE.score.add(-delta[1] * ENGINE.difficulty);
    ENGINE.score.save();

    // enemies
    var enemies = ENGINE.enemies;
    if (ENGINE.score.newScore() && Math.random() < ENGINE.difficulty) {
      // new place
      var enemy = new Ball();
      enemy.speed = 256;
      enemy.x = Math.random() * this.app.width;
      enemy.y = 0;
      enemy.directRadians = Math.asin(1);
      enemy.color = "#e24fa2";
      enemies.push(enemy);
    }
    // enemies running
    enemies.forEach(function(enemy) {
      enemy.run(dt);
      enemy.x -= delta[0];
      enemy.y -= delta[1];
      if (collisionDetection.RectRectColliding(enemy, thomas)) {
        console.log('collission');
        this.app.music.stop(ENGINE.Resource);
        this.app.setState(ENGINE.Game);
      }
    });
    var enemies_index = enemies.length - 1;
    while (enemies_index >= 0) {
      if (enemies[enemies_index].y > this.app.height) {
        enemies.splice(enemies_index, 1);
      }
      enemies_index -= 1;
    }
  },

  render: function(dt) {

    var thomas = this.app.thomas;

    this.app.layer.clear("#000");
    // background
    this.app.scrollingBackground.render(this.app);

    this.app.layer
      .fillStyle(thomas.color)
      .fillRect(thomas.x, thomas.y, thomas.width, thomas.height)
      .font("40px Georgia")
      .fillText("Current: " + ENGINE.score.getScore(), this.app.width - 300, 160)
      .font("40px Green")
      .fillText("High: " + ENGINE.score.getHighScore(), this.app.width - 300, 80);

    ENGINE.enemies.forEach(function(enemy) {
      this.app.layer
        .fillStyle(enemy.color)
        .fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
  },

  mousedown: function() {

    // this.app.sound.play("laser");

  },

  mousemove: function(data) {
    this.app.scrollingBackground.directRadians = Math.atan2(data.y - this.app.center.y, data.x - this.app.center.x);
  },

};
var ScrollingBackground = function(image) {
  var backgrounds = [];
  var bw = image.width;
  var bh = image.height;
  var layer = {};
  this.directRadians = Math.asin(-1);

  this.move = function(speed) {
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
  this.render = function(app) {
    backgrounds.forEach(function(e) {
      app.layer.drawImage(app.images.background, e[0], e[1]);
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
    return ENGINE.score.scoreCurrent === ENGINE.score.scoreMax;
  };
  this.getHighScore = function() {
    return (new Number(this.highscore)).toFixed(2);
  }
  this.getScore = function() {
    return (new Number(this.scoreCurrent)).toFixed(2);
  }
};