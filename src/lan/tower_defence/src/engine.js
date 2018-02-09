const GameMap = require('./class/gamemap')
const TowerFire = require('./class/tower/TowerFire')
const TowerIce = require('./class/tower/TowerIce')
const Cursor = require('./class/cursor')
const Icon = require('./class/icon')
const SocketCommand = require('../../../library/SocketCommand')
const Guid = require('../../../library/Guid')

const TechTree = require('./gui/TechTree')

const GAME_NAME = "/tower-defence";

var ENGINE = {
  Resource: {},
  command: undefined,
  isInit: false
};

ENGINE.Game = {

  wallet: {
    balance: 100,
    balanceReal: 100,
    hold: 0
  },

  score: 0,
  round: 1,
  messageTip: "press 1 or 2 select tower, then upgrade by click on it.",

  create: function() {
    let game = this;
    this.command = new SocketCommand(GAME_NAME);
    this.command.add('set_map', function(map) {
      if (!game.isInit) {
        // game.isInit = true;
        // game.gameMap = new GameMap(map);
        // game.thomas = game.gameMap.getUser(this.id);
      }
    });
    this.cursor = new Cursor();
    this.towerList = [TowerFire, TowerIce];
    this.techTree = new TechTree({
      width: 1000
    });
  },

  enter: function() {
    var game = this;
    var app = this.app;

    app.scrollingBackground = new ScrollingBackground(app.images.background);

    // ENGINE.Resource = app.music.play("music", true);
    ENGINE.enemies = [];
    ENGINE.bombs = [];
    ENGINE.items = [];
    ENGINE.users = [];

    const level1 = require('./levels/level1')
    this.gameMap = new GameMap();
    this.gameMap.init(level1);
    this.gameMap.on('enemyDie', enemy => {
      this.wallet.balanceReal += enemy.reward;
      this.wallet.balance += enemy.reward;
      this.score += this.round * enemy.score;
    });
    this.gameMap.on('enemyEscape', enemy => {
      this.score -= this.round * enemy.escapeFine;
      this.gameMap.remove(enemy);
      this.gameMap.gameOver();
    });
    this.gameMap.on('roundEnd', () => {
      let timer, second = 5;
      timer = setInterval(() => {
        second--;
        this.messageTip = "Next Round will begin at " + second + " second later";
        if (second <= 0) {
          this.round++;
          this.gameMap.setDifficulty(this.round);
          clearInterval(timer);
          this.messageTip = "";
          this.gameMap.roundStart();
        }
      }, 1000);
    })
    this.gameMap.on('gameOver', () => {
      this.messageTip = 'game over, your score: ' + this.score;
    })
    this.gameMap.roundStart();
  },

  step: function(dt) {
    var center = this.app.center;
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

    this.oPoint = app.scrollingBackground.render(app, {x:0, y:200});

    this.gameMap.render(app, this.oPoint);

    // money
    app.layer
      .fillStyle("#000")
      .fillRect(0, 0, 1500, 200)
      .font("30px Verdana")
      .fillStyle("#FFD700")
      .fillText("$" + this.wallet.balanceReal.toFixed(2), 50, 50)
      .fillStyle("#00D700")
      .fillText("score: " + this.score, 50, 100)
      .fillStyle("#FFD700")
      .fillText("Round " + this.round, 350, 50)
      .fillStyle("#FFD700")
      .fillText(this.messageTip, 350, 100)
      ;
    // tower sample
    let tower_sample = {
      attackDistance: 0,
      x: 50,
      y: 100
    }
    this.towerList.forEach((towerClass, i) => {
      let tower = new this.towerList[i](tower_sample);
      let center = tower.center;
      tower.render(app);
      app.layer
        .fillStyle("#FFD700")
        .fillText("$" + tower.cost, center.x - 30, tower_sample.y + tower.height + 30);
      tower_sample.x += tower.width + 20;
    });

    // gui
    // this.techTree.render(app);

    let queue = this.command.getList();
    for (let i = queue.length - 1, max = Math.max(queue.length - 10, 0); i >= max; --i) {
      app.layer
        .font("40px Georgia")
        .fillStyle(hpH + "px #abc")
        .fillText(queue[i].eventName, hpX, hpHCurrent);
      hpHCurrent += hpH + hpDy;
    }

    // mouse active
    this.cursor.render(app);
  },

  keydown: function(data) {
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
      case "1":
      case "2":
        this.selectBuild(data.key);
        this.traceBuildLocation(this.cursor);
        break;
    }
  },

  keyup: function(data) {
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
  },

  mousemove: function(data) {
    // gui
    this.techTree.trigger('mousemove', data);

    this.traceBuildLocation(data);
    this.cursor.x = data.x;
    this.cursor.y = data.y;
  },

  mousedown: function(data) {
    // gui
    this.techTree.trigger('mousedown', data);
    let gameMapOrigin = {
      x: data.x - this.oPoint.x,
      y: data.y - this.oPoint.y,
      button: data.button
    }
    this.gameMap.trigger('mousedown', gameMapOrigin);

    let
      button = data.button,
      build = this.cursor.getSelectedBuild();
    if (!build) {
      return;
    }
    if (button === "left") {
      // create build
      build.setCenter(this.cursor.x - this.oPoint.x, this.cursor.y - this.oPoint.y);
      build.id = Guid.gen('tower');
      let isSuccess = this.gameMap.addTower(build);
      if (isSuccess) {
        build.on('sell', () => {
          console.log('selled', build)
          this.wallet.balanceReal += build.sellIncome;
          this.wallet.balance += build.sellIncome;
          this.gameMap.removeTower(build);
        }).on('upgrade', (option, upgradeFunc) => {
          if (this.wallet.balanceReal < option.cost) {
            this.messageTip = "money not enough";
            return;
          }
          this.wallet.balanceReal -= option.cost;
          this.wallet.balance -= option.cost;
          upgradeFunc();
        });
        this.cursor.clearSelected();
        this.wallet.balanceReal -= build.cost;
        this.gameMap.showTowerArea(false);
      }
    } else if (button === "right") {
      // cancel, return money back
      this.cursor.clearSelected();
      this.wallet.balance += build.cost;
      this.gameMap.showTowerArea(false);
    }
  },

  mouseup: function(data) {
    // gui
    this.techTree.trigger('mouseup', data);
  },

  traceBuildLocation(data) {
    let build = this.cursor.getSelectedBuild();
    if (build) {
      data.x = Math.floor(data.x / 64) * 64 + 31;
      data.y = Math.floor(data.y / 64) * 64 + 38;
      // try building
      build.setCenter(data.x - this.oPoint.x, data.y - this.oPoint.y);
      this.cursor.canBuildHere = this.gameMap.tryBuildTower(build);
    }
  },

  selectBuild(index) {
    index -= 1;
    let build = new this.towerList[index]();
    if (this.wallet.balanceReal < build.cost) {
      // has no more money
      return;
    }
    this.wallet.balance -= build.cost;
    this.cursor.setSelectedBuild(build);
    this.gameMap.showTowerArea(true);
  },

};
var ScrollingBackground = function(image) {
  var bw = image.width;
  var bh = image.height;
  var layer = {};
  this.directRadians = Math.asin(-1);
  this.faceDirectBits = 0b0000; // LRUD
  this.dontMove = true;

  this.render = function(app, start = { x: 0, y: 0 }) {
    let
      w = app.width,
      h = app.height,
      x = 0 + start.x, // where the begin x
      y = 0 + start.y, // where the begin y
      dx = x % bw,
      dy = y % bh,
      nx = Math.ceil(w / bw) + 1,
      ny = Math.ceil(h / bh) + 1,
      backgrounds = [];
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