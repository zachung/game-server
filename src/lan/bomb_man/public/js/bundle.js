(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var CollisionDetection = require('../collision');
var easeOutQuad = function(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
};
var collisionDetection = new CollisionDetection();
var Ball = function Ball(options) {
  var defaults = {
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    color: "#e2543e",
    directRadians: 0,
    speed: 0,
    dt: 0,
    hp: 1,
    damage: 0,
    defence: 0,
    attackDistance: 0,
    listeners: {},
    faceDirectBits: 0
  };
  var populated = Object.assign(defaults, options);
  for (var key in populated) {
    if (populated.hasOwnProperty(key)) {
      this[key] = populated[key];
    }
  }
};
($traceurRuntime.createClass)(Ball, {
  faceTo: function(x, y) {
    this.directRadians = Math.atan2(y - this.y, x - this.x);
  },
  getMoveVector: function(dt) {
    var x = 0,
        y = 0,
        maxDt = 0.5;
    ;
    x -= (this.faceDirectBits >> 3) & 1;
    x += (this.faceDirectBits >> 2) & 1;
    y -= (this.faceDirectBits >> 1) & 1;
    y += (this.faceDirectBits >> 0) & 1;
    var ease = easeOutQuad(this.dt, 0, this.speed * dt, maxDt);
    return {
      dx: ease * x,
      dy: ease * y
    };
  },
  _step: function(dt) {
    var x = 0,
        y = 0,
        maxDt = 0.5;
    ;
    x -= (this.faceDirectBits >> 3) & 1;
    x += (this.faceDirectBits >> 2) & 1;
    y -= (this.faceDirectBits >> 1) & 1;
    y += (this.faceDirectBits >> 0) & 1;
    if (x !== 0 || y !== 0) {
      this.dt += dt;
      this.dt = Math.min(this.dt, maxDt);
    } else {
      this.dt -= dt;
      this.dt = Math.max(this.dt, 0);
    }
  },
  step: function(dt) {
    this._step(dt);
    var vector = this.getMoveVector(dt);
    this.x += vector.dx;
    this.y += vector.dy;
    this.trigger('step', arguments);
  },
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    app.layer.fillStyle(this.color).fillRect(this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height);
  },
  renderImage: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    app.layer.drawImage(app.images[this.image], this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height);
  },
  getDamage: function(damage, dt) {
    this.hp -= Math.max(damage * dt - this.defence, 0);
    var isAlive = this.hp > 0;
    if (!isAlive) {
      this.die();
    }
    return isAlive;
  },
  attack: function(other) {
    var dt = arguments[1] !== (void 0) ? arguments[1] : 1;
    var isHitted = this.canAttack(other);
    if (isHitted) {
      other.getDamage(this.damage, dt);
    }
    return isHitted;
  },
  canAttack: function(other) {
    return collisionDetection.RectRectDistance(this, other) <= this.attackDistance;
  },
  die: function() {
    this.trigger('die', arguments);
  },
  center: function() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  },
  trigger: function(eventName, args) {
    if (this.listeners[eventName]) {
      for (var $__1 = this.listeners[eventName][$traceurRuntime.toProperty(Symbol.iterator)](),
          $__2; !($__2 = $__1.next()).done; ) {
        var event = $__2.value;
        {
          if (typeof event === "function") {
            event.apply(this, args);
          }
        }
      }
    }
  },
  on: function(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }
}, {});
var Event = function Event(options) {
  var defaults = {msg: ""};
  var populated = Object.assign(defaults, options);
  for (var key in populated) {
    if (populated.hasOwnProperty(key)) {
      this[key] = populated[key];
    }
  }
};
($traceurRuntime.createClass)(Event, {}, {});
module.exports = Ball;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/ball.js
},{"../collision":11}],2:[function(require,module,exports){
"use strict";
var Floor = require('./floor');
var Item = require('./item');
var Block = function Block(options) {
  var defaults = {
    color: "#42a43e",
    hp: 1,
    defence: 0
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Block).call(this, populated);
  this.class = this.constructor.name;
};
var $Block = Block;
($traceurRuntime.createClass)(Block, {
  getDamage: function(damage) {
    var dt = arguments[1] !== (void 0) ? arguments[1] : 1;
    $traceurRuntime.superGet(this, $Block.prototype, "getDamage").call(this, damage, dt);
  },
  dieOnMapAfter: function(map) {
    $traceurRuntime.superGet(this, $Block.prototype, "dieOnMapAfter").call(this, map);
    var loc = this.getLocation();
    var value = 1;
    var item = new Item({
      type: this.type,
      value: value,
      x: this.x,
      y: this.y
    });
    map.setLocation(item, loc.i, loc.j);
  }
}, {}, Floor);
module.exports = Block;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/block.js
},{"./floor":6,"./item":8}],3:[function(require,module,exports){
"use strict";
var Floor = require('./floor');
var Fire = require('./fire');
var Bomb = function Bomb(options) {
  var defaults = {
    image: "items/bomb",
    countdown: 2,
    radius: 0,
    hp: 0.01,
    defence: 0,
    width: 60,
    height: 60,
    animationSize: 64
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Bomb).call(this, populated);
  this.class = this.constructor.name;
};
var $Bomb = Bomb;
($traceurRuntime.createClass)(Bomb, {
  step: function(dt, map, cell) {
    this.animationSize += dt * this.width * 0.7;
    this.countdown -= dt;
    if (this.isReadyBoom()) {
      this.die();
    }
  },
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    this.renderImage(app, deltaPoint);
  },
  renderImage: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    var range = 0.2;
    var direct = Math.floor(this.animationSize / this.width / range) % 2;
    var size = this.animationSize % (this.width * range);
    var animationSize = this.width + (direct === 1 ? size : this.width * range - size);
    app.layer.drawImage(app.images[this.image], this.x + deltaPoint.x, this.y + deltaPoint.y, animationSize, animationSize);
  },
  isReadyBoom: function() {
    return this.countdown < 0;
  },
  canAttack: function(other) {
    return collisionDetection.CircleRectDistance(this, other) <= this.radius;
  },
  getDamage: function(damage, dt) {
    return $traceurRuntime.superGet(this, $Bomb.prototype, "getDamage").call(this, damage, dt);
  },
  dieOnMapPre: function(map) {
    $traceurRuntime.superGet(this, $Bomb.prototype, "dieOnMapPre").call(this, map);
    var ci = this.inMapLocation.i,
        cj = this.inMapLocation.j,
        radius = this.radius;
    map.setLocation(new Fire(), ci, cj);
    for (var i = 1; i <= radius; i++) {
      if (!map.setLocation(new Fire(), ci + i, cj)) {
        break;
      }
    }
    for (var i = 1; i <= radius; i++) {
      if (!map.setLocation(new Fire(), ci - i, cj)) {
        break;
      }
    }
    for (var i = 1; i <= radius; i++) {
      if (!map.setLocation(new Fire(), ci, cj + i)) {
        break;
      }
    }
    for (var i = 1; i <= radius; i++) {
      if (!map.setLocation(new Fire(), ci, cj - i)) {
        break;
      }
    }
  }
}, {}, Floor);
module.exports = Bomb;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/bomb.js
},{"./fire":5,"./floor":6}],4:[function(require,module,exports){
"use strict";
var Ball = require('./ball');
var Floor = require('./floor');
var Wall = require('./wall');
var Block = require('./block');
var Thomas = require('./thomas');
var Bomb = require('./bomb');
var Fire = require('./fire');
var Item = require('./item');
var Cell = function Cell(options) {
  var defaults = {
    width: 64,
    height: 64,
    standInObjects: []
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Cell).call(this, populated);
  var i = this.i,
      j = this.j;
  if (this.standInObjects.length !== 0) {
    this.standInObjects = this.standInObjects.map(function(object) {
      var instance = null;
      switch (object.class) {
        case "Floor":
          instance = new Floor(object);
          break;
        case "Wall":
          instance = new Wall(object);
          break;
        case "Block":
          instance = new Block(object);
          break;
        case "Thomas":
          instance = new Thomas(object);
          break;
        case "Bomb":
          instance = new Bomb(object);
          break;
        case "Fire":
          instance = new Fire(object);
          break;
        case "Item":
          instance = new Item(object);
          break;
      }
      return instance;
    });
  }
};
var $Cell = Cell;
($traceurRuntime.createClass)(Cell, {
  in: function(object) {
    if (object.class === "Thomas") {
      this.standInObjects.filter((function(object) {
        return object.class === "Item";
      })).forEach(function(item) {
        item.sendTo(object);
        item.die();
      });
    }
    this.standInObjects.push(object);
    object.inMapLocation = {
      i: this.i,
      j: this.j
    };
  },
  out: function(object) {
    var objects = this.standInObjects;
    var index = objects.indexOf(object);
    if (-1 !== index) {
      objects.splice(index, 1);
    }
  },
  _tryTouchOtherCell: function(object) {
    var cell = this;
    var tx = 0,
        ty = 0;
    var object_side = {
      r: object.x + object.width,
      l: object.x,
      d: object.y + object.height,
      u: object.y
    };
    var cell_side = {
      r: cell.x + cell.width,
      l: cell.x,
      d: cell.y + cell.height,
      u: cell.y
    };
    if (object_side.r > cell_side.r) {
      tx++;
    }
    if (object_side.l < cell_side.l) {
      tx--;
    }
    if (object_side.d > cell_side.d) {
      ty++;
    }
    if (object_side.u < cell_side.u) {
      ty--;
    }
    return {
      x: tx,
      y: ty
    };
  },
  step: function(dt, map) {
    var cell = this;
    $traceurRuntime.superGet(this, $Cell.prototype, "step").call(this, dt);
    this.standInObjects.forEach(function(object, i) {
      object.step(dt, map, cell);
      var object_center = {
        x: object.x + object.width / 2,
        y: object.y + object.height / 2
      };
      var cell_center = {
        x: cell.x + cell.width / 2,
        y: cell.y + cell.height / 2
      };
      var cdx = object_center.x - cell_center.x;
      var cdy = object_center.y - cell_center.y;
      var touch_vector = cell._tryTouchOtherCell(object);
      var move_vector = object.getMoveVector(dt);
      if (!map.canGetIn(cell.i + touch_vector.x, cell.j)) {
        object.x += -touch_vector.x * object.speed * dt;
      }
      if (!map.canGetIn(cell.i, cell.j + touch_vector.y)) {
        object.y += -touch_vector.y * object.speed * dt;
      }
      var dx = 0,
          dy = 0,
          side_buffer = 0;
      ;
      var object_center = {
        x: object.x + object.width / 2,
        y: object.y + object.height / 2
      };
      var cell_side = {
        r: cell.x + cell.width + side_buffer,
        l: cell.x - side_buffer,
        d: cell.y + cell.height + side_buffer,
        u: cell.y - side_buffer
      };
      if (object_center.x > cell_side.r) {
        dx++;
      } else if (object_center.x < cell_side.l) {
        dx--;
      } else if (object_center.y > cell_side.d) {
        dy++;
      } else if (object_center.y < cell_side.u) {
        dy--;
      }
      if (dx === 0 && dy === 0) {
        return;
      }
      map.moveObject(object, dx, dy);
    });
  },
  getDamage: function(damage) {
    var dt = arguments[1] !== (void 0) ? arguments[1] : 1;
    $traceurRuntime.superGet(this, $Cell.prototype, "getDamage").call(this, damage, dt);
    this.standInObjects.forEach(function(object, i) {
      object.getDamage(damage, dt);
    });
  },
  canGetIn: function() {
    var canGetIn = true;
    this.standInObjects.forEach(function(object) {
      if (-1 !== ["Wall", "Block", "Bomb"].indexOf(object.class)) {
        canGetIn = false;
      }
    });
    return canGetIn;
  },
  canFire: function() {
    var handle = true;
    this.standInObjects.some(function(object) {
      var index = ["Wall"].indexOf(object.class);
      if (-1 !== index) {
        handle = false;
        return true;
      }
      return false;
    });
    return handle;
  }
}, {}, Ball);
module.exports = Cell;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/cell.js
},{"./ball":1,"./block":2,"./bomb":3,"./fire":5,"./floor":6,"./item":8,"./thomas":9,"./wall":10}],5:[function(require,module,exports){
"use strict";
var Floor = require('./floor');
var Fire = function Fire(options) {
  var defaults = {
    image: "items/fire",
    countdown: 0.7,
    width: 60,
    height: 60,
    damage: 2,
    hp: 100000,
    animationSize: 30
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Fire).call(this, populated);
  this.class = this.constructor.name;
};
var $Fire = Fire;
($traceurRuntime.createClass)(Fire, {
  step: function(dt, map, cell) {
    this.animationSize += dt * this.width * 2;
    this.countdown -= dt;
    this.attack(cell, dt);
    if (this.countdown < 0) {
      this.die(map);
    }
  },
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    this.renderImage(app, deltaPoint);
  },
  renderImage: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    var range = 0.1;
    var direct = Math.floor(this.animationSize / this.width / range) % 2;
    var size = this.animationSize % (this.width * range);
    var d = (direct === 1 ? size : this.width * range - size);
    var animationSize = this.width + d;
    app.layer.drawImage(app.images[this.image], this.x + deltaPoint.x, this.y + deltaPoint.y - d, animationSize, animationSize);
  }
}, {}, Floor);
module.exports = Fire;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/fire.js
},{"./floor":6}],6:[function(require,module,exports){
"use strict";
var Ball = require('./ball');
var Floor = function Floor(options) {
  var defaults = {
    width: 64,
    height: 64,
    color: "#e2a4ae",
    speed: 0,
    hp: 10000,
    defence: 10000
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Floor).call(this, populated);
  this.class = this.constructor.name;
};
var $Floor = Floor;
($traceurRuntime.createClass)(Floor, {
  getLocation: function() {
    return this.inMapLocation;
  },
  dieOnMapPre: function(map) {
    var loc = this.getLocation();
  },
  dieOnMapAfter: function(map) {}
}, {}, Ball);
module.exports = Floor;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/floor.js
},{"./ball":1}],7:[function(require,module,exports){
"use strict";
var Ball = require('./ball');
var Floor = require('./floor');
var Cell = require('./cell');
var Block = require('./block');
var Wall = require('./wall');
var Bomb = require('./bomb');
var GameMap = function GameMap(options) {
  var defaults = {
    x: 0,
    y: 0,
    w: 13,
    h: 13,
    size: 64,
    cells: [],
    objects: {}
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($GameMap).call(this, populated);
  this.width = this.w * this.size;
  this.height = this.h * this.size;
  this.objects = {};
  if (this.cells.length !== 0) {
    for (var i = 0; i < this.w; i++) {
      for (var j = 0; j < this.h; j++) {
        var cell = new Cell(this.cells[i][j]);
        this.cells[i][j] = cell;
        for (var $__1 = cell.standInObjects[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__2; !($__2 = $__1.next()).done; ) {
          var object = $__2.value;
          {
            this._setLocation(object, i, j);
          }
        }
      }
    }
  }
};
var $GameMap = GameMap;
($traceurRuntime.createClass)(GameMap, {
  init: function() {
    for (var i = 0; i < this.w; i++) {
      this.cells[i] = [];
      for (var j = 0; j < this.h; j++) {
        var options = {
          x: this.x + i * this.size,
          y: this.y + j * this.size,
          i: i,
          j: j
        };
        var cell = new Cell(options, this);
        this.cells[i][j] = cell;
        this.setLocation(new Floor(options), i, j);
        if (i % 2 !== 1 && j % 2 !== 1 || i === 0 || j === 0 || i === this.w - 1 || j === this.h - 1) {
          this.setLocation(new Wall(options), i, j);
        } else if (i > 0 && i < this.w - 1 && j > 2 && j < this.h - 3 && (i % 2 === 1 || j % 2 === 1)) {
          options.type = Math.floor(Math.random() * 4);
          this.setLocation(new Block(options), i, j);
        } else if (i > 2 && i < this.w - 3 && j > 0 && j < this.h - 1) {
          options.type = Math.floor(Math.random() * 4);
          this.setLocation(new Block(options), i, j);
        }
      }
    }
    this.userLocation = [{
      i: 1,
      j: 1,
      hasUser: false
    }, {
      i: 1,
      j: 11,
      hasUser: false
    }, {
      i: 11,
      j: 1,
      hasUser: false
    }, {
      i: 11,
      j: 11,
      hasUser: false
    }];
  },
  step: $traceurRuntime.initGeneratorFunction(function $__5(dt) {
    var i,
        j;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $traceurRuntime.superGet(this, $GameMap.prototype, "step").call(this, dt);
            for (i = 0; i < this.w; i++) {
              for (j = 0; j < this.h; j++) {
                this.cells[i][j].step(dt, this);
              }
            }
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__5, this);
  }),
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    var id = arguments[2];
    var hpX = 1000;
    var hpDy = 20;
    var hpH = 30;
    var hpHInit = 20;
    var hpHCurrent = hpHInit + hpH + hpDy;
    for (var $__3 = ["Floor", "Thomas", "Wall", "Block", "Bomb", "Item", "Fire"][$traceurRuntime.toProperty(Symbol.iterator)](),
        $__4; !($__4 = $__3.next()).done; ) {
      var clazz = $__4.value;
      {
        if (this.objects[clazz]) {
          for (var $__1 = this.objects[clazz][$traceurRuntime.toProperty(Symbol.iterator)](),
              $__2; !($__2 = $__1.next()).done; ) {
            var object = $__2.value;
            {
              object.render(app, deltaPoint);
              if (clazz === "Thomas") {
                var hpY = hpHCurrent;
                if (object.id !== id) {
                  hpHCurrent += hpH + hpDy;
                  hpY = hpHCurrent;
                } else {
                  hpY = hpHInit;
                }
                app.layer.fillStyle("#000").fillRect(hpX, hpY, 200, hpH).fillStyle("#F00").fillRect(hpX, hpY, 200 * (object.hp / object.hpMax), hpH);
              }
            }
          }
        }
      }
    }
  },
  _setLocation: function(object, i, j) {
    var gameMap = this;
    if (!this.objects[object.class]) {
      this.objects[object.class] = [];
    }
    this.objects[object.class].push(object);
    object.on('die', function() {
      object.dieOnMapPre(gameMap);
      gameMap.remove(object);
      object.dieOnMapAfter(gameMap);
    });
  },
  addUser: function(user) {
    var userLocation = this.userLocation;
    var loc = userLocation.filter((function(loc) {
      return !loc.hasUser;
    }))[0];
    userLocation[userLocation.indexOf(loc)].hasUser = true;
    this.setLocation(user, loc.i, loc.j);
    user.on("die", function() {
      userLocation[userLocation.indexOf(loc)].hasUser = false;
    });
  },
  setLocation: function(object, i, j) {
    if (object.inMapLocation) {
      this.moveObject(object, 0, 0);
    } else {
      if (!this.standIn(object, i, j)) {
        return false;
      } else {
        this._setLocation(object, i, j);
      }
    }
    var cell = this.cells[object.inMapLocation.i][object.inMapLocation.j];
    object.x = cell.x;
    object.y = cell.y;
    return cell.canGetIn();
  },
  isCellExist: function(i, j) {
    if (!this.cells[i] || !this.cells[i][j]) {
      return false;
    }
    return true;
  },
  canGetIn: function(i, j) {
    if (!this.isCellExist(i, j)) {
      return false;
    }
    return this.cells[i][j].canGetIn();
  },
  standIn: function(object, i, j) {
    if (!this.isCellExist(i, j)) {
      return false;
    }
    if (object.class === "Fire") {
      if (!this.cells[i][j].canFire()) {
        return false;
      }
    } else if (!this.cells[i][j].canGetIn()) {
      return false;
    }
    this.cells[i][j].in(object);
    return true;
  },
  moveObject: function(object, dx, dy) {
    var i = object.inMapLocation.i;
    var j = object.inMapLocation.j;
    if (!this.standIn(object, i + dx, j + dy)) {
      return false;
    }
    this.cells[i][j].out(object);
    return true;
  },
  remove: function(object) {
    this.cells[object.inMapLocation.i][object.inMapLocation.j].out(object);
    var index = this.objects[object.class].indexOf(object);
    if (-1 !== index) {
      this.objects[object.class].splice(index, 1);
    }
  },
  spawnBomb: function(object) {
    var i = object.inMapLocation.i;
    var j = object.inMapLocation.j;
    var cell = this.cells[i][j];
    var bomb = new Bomb({
      x: cell.x,
      y: cell.y,
      radius: object.fireRadius,
      damage: 10,
      countdown: 2
    });
    this.setLocation(bomb, cell.i, cell.j);
    return bomb;
  },
  getUser: function(id) {
    if (!this.objects["Thomas"]) {
      return null;
    }
    var users = this.objects["Thomas"].filter((function(user) {
      return user.id === id;
    }));
    if (users.length > 0) {
      return users[0];
    }
    return null;
  }
}, {}, Ball);
module.exports = GameMap;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/gamemap.js
},{"./ball":1,"./block":2,"./bomb":3,"./cell":4,"./floor":6,"./wall":10}],8:[function(require,module,exports){
"use strict";
var Floor = require('./floor');
var Item = function Item(options) {
  var defaults = {
    color: "#00a4ae",
    hp: 1,
    defence: 0
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Item).call(this, populated);
  this.class = this.constructor.name;
};
var $Item = Item;
($traceurRuntime.createClass)(Item, {
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    switch (this.type) {
      case 0:
        this.image = "items/Icon_blastup";
        break;
      case 1:
        this.image = "items/Icon_countup";
        break;
      case 2:
        this.image = "items/Icon_healthup";
        break;
      case 3:
        this.image = "items/Icon_speedup";
        break;
    }
    this.renderImage(app, deltaPoint);
  },
  sendTo: function(user) {
    switch (this.type) {
      case 0:
        user.fireRadius += this.value;
        break;
      case 1:
        user.bombCountMax += this.value;
        break;
      case 2:
        user.hp += this.value;
        break;
      case 3:
        user.speed += this.value * 30;
        user.speed = Math.min(user.speed, 512);
        break;
    }
  }
}, {}, Floor);
module.exports = Item;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/item.js
},{"./floor":6}],9:[function(require,module,exports){
"use strict";
var Floor = require('./floor');
var Thomas = function Thomas(options) {
  var defaults = {
    width: 50,
    height: 50,
    defence: 0,
    fireRadius: 2,
    bombCount: 0,
    bombCountMax: 10,
    speed: 256
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Thomas).call(this, populated);
  this.faceDirectBits = 0;
  this.canActive = true;
};
var $Thomas = Thomas;
($traceurRuntime.createClass)(Thomas, {
  takeWeapon: function(weapon) {
    this.weapon = weapon;
  },
  fire: function(dt) {
    if (!this.weapon) {
      return;
    }
  },
  setFaceDirectBits: function(direct) {
    this.faceDirectBits |= direct;
  },
  cancelFaceDirectBits: function(direct) {
    this.faceDirectBits &= direct;
  },
  setCanMove: function(canActive) {
    this.canActive = canActive;
  },
  spawnBomb: function(map) {
    if (this.bombCount >= this.bombCountMax) {
      return;
    }
    var user = this;
    var bomb = map.spawnBomb(this);
    bomb.on("die", function() {
      user.bombCount--;
    });
    this.bombCount++;
    return bomb;
  }
}, {}, Floor);
module.exports = Thomas;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/thomas.js
},{"./floor":6}],10:[function(require,module,exports){
"use strict";
var Floor = require('./floor');
var Wall = function Wall(options) {
  var defaults = {
    x: 0,
    y: 0,
    color: "#e2543e",
    hp: 10000,
    defence: 10000
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Wall).call(this, populated);
  this.class = this.constructor.name;
};
var $Wall = Wall;
($traceurRuntime.createClass)(Wall, {}, {}, Floor);
module.exports = Wall;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/class/wall.js
},{"./floor":6}],11:[function(require,module,exports){
"use strict";
var CollisionDetection = function() {
  this.collidingRecord = [];
  this.collidingDelay = 0;
  this.CircleRectColliding = function(circle, rect) {
    var distX = Math.abs(circle.x - rect.x - rect.width / 2);
    var distY = Math.abs(circle.y - rect.y - rect.height / 2);
    if (distX > (rect.width / 2 + circle.radius)) {
      return false;
    }
    if (distY > (rect.height / 2 + circle.radius)) {
      return false;
    }
    if (distX <= (rect.width / 2)) {
      return true;
    }
    if (distY <= (rect.height / 2)) {
      return true;
    }
    var dx = distX - rect.width / 2;
    var dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
  };
  this.RectRectColliding = function(rect1, rect2) {
    if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y) {
      return true;
    }
    return false;
  };
  this.RectPointColliding = function(rect, point) {
    if (rect.x <= point.x && rect.x + rect.width >= point.x && rect.y <= point.y && rect.height + rect.y >= point.y) {
      return true;
    }
    return false;
  };
  this.RectRectAngle = function(rect1, rect2) {
    var rect1_center = {
      x: rect1.x + rect1.width / 2,
      y: rect1.y + rect1.height / 2
    };
    var rect2_center = {
      x: rect2.x + rect2.width / 2,
      y: rect2.y + rect2.height / 2
    };
    return this.getAngle(rect1_center, rect2_center);
  };
  this.RectRectDistance = function(rect1, rect2) {
    var rect1_center = {
      x: rect1.x + rect1.width / 2,
      y: rect1.y + rect1.height / 2
    };
    var rect2_center = {
      x: rect2.x + rect2.width / 2,
      y: rect2.y + rect2.height / 2
    };
    var distance = Math.pow(Math.sqrt(rect2.x - rect1.x) + Math.sqrt(rect2.y - rect1.y), 2);
    var rect1_angle = this.getAngle(rect1_center, rect1);
    var rect2_angle = this.getAngle(rect2_center, rect2);
    var go_through_angle = this.getAngle(rect1_center, rect2_center);
    if (go_through_angle < rect2_angle) {
      distance -= rect2.width / 2 / Math.cos(go_through_angle);
    } else {
      distance -= rect2.height / 2 / Math.sin(go_through_angle);
    }
    if (go_through_angle < rect1_angle) {
      distance -= rect1.width / 2 / Math.cos(go_through_angle);
    } else {
      distance -= rect1.height / 2 / Math.sin(go_through_angle);
    }
    return distance;
  };
  this.getAngle = function(p1, p2) {
    var angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    if (angle < 0)
      angle += Math.PI * 2;
    angle %= Math.PI / 2;
    return angle;
  };
  this.CircleRectDistance = function(circle, rect) {
    var circle_center = {
      x: circle.x + Math.cos(Math.PI / 2) * circle.radius,
      y: circle.y + Math.cos(Math.PI / 2) * circle.radius
    };
    var rect_center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
    var distance = Math.pow(Math.sqrt(rect.x - circle.x) + Math.sqrt(rect.y - circle.y), 2);
    var rect_angle = this.getAngle(rect_center, rect);
    var go_through_angle = this.getAngle(circle_center, rect_center);
    if (go_through_angle < rect_angle) {
      distance -= rect.width / 2 / Math.cos(go_through_angle);
    } else {
      distance -= rect.height / 2 / Math.sin(go_through_angle);
    }
    distance -= circle.radius;
    return distance;
  };
};
module.exports = CollisionDetection;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/collision.js
},{}],12:[function(require,module,exports){
"use strict";
var co = require('co');
var GameMap = require('./class/gamemap');
var Thomas = require('./class/thomas');
var ENGINE = {
  Resource: {},
  queue: [],
  isInit: false
};
var SocketCommand = function SocketCommand() {
  this.socket = io('/bomb-man');
};
($traceurRuntime.createClass)(SocketCommand, {
  add: function(eventName, callback) {
    var socket = this.socket;
    this.socket.on(eventName, function() {
      var $__0 = arguments;
      var args = Array.of();
      ENGINE.queue.push({
        eventName: "on " + eventName,
        f: (function() {
          if (!ENGINE.isInit && eventName !== "set map") {
            return;
          }
          callback.apply(socket, $__0);
        })
      });
    });
  },
  emit: function(eventName, data) {
    var $__0 = this;
    ENGINE.queue.push({
      eventName: "emit " + eventName,
      f: (function() {
        $__0.socket.emit(eventName, data);
      })
    });
  }
}, {});
ENGINE.Game = {
  create: function() {},
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
      if (!game.isInit) {
        game.isInit = true;
        game.gameMap = new GameMap(map);
        game.thomas = game.gameMap.getUser(this.id);
      }
    });
    command.add('user add', function(user) {
      var remoteUser = new Thomas(user),
          loc = remoteUser.getLocation();
      var map = game.gameMap;
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
          bomb.on('die', (function() {
            app.sound.play("explosion");
          }));
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
  },
  step: function(dt) {
    var center = this.app.center;
    var max_radius = Math.max(this.app.width, this.app.height);
    var thomas = this.app.thomas;
    if (thomas) {
      var delta = this.app.scrollingBackground.move(thomas, dt);
    }
    for (var i = ENGINE.queue.length - 1; i >= 0; --i) {
      var task = ENGINE.queue[i];
      if (!task.executeTime) {
        task.f();
        task.executeTime = new Date();
      } else {
        if (task.executeTime.getTime() + 1000 * 10 < (new Date()).getTime()) {
          ENGINE.queue.splice(i, 1);
        }
      }
    }
    if (this.gameMap) {
      var step = this.gameMap.step(dt);
      var msg = step.next();
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
    var oPoint = app.scrollingBackground.render(app);
    if (!this.gameMap) {
      return;
    }
    var id = this.thomas ? this.thomas.id : "";
    this.gameMap.render(app, oPoint, id);
    for (var i = ENGINE.queue.length - 1; i >= 0; --i) {
      app.layer.font("40px Georgia").fillStyle(hpH + "px #abc").fillText(ENGINE.queue[i].eventName, hpX, hpHCurrent);
      hpHCurrent += hpH + hpDy;
    }
  },
  keydown: function(data) {
    var $__0 = this;
    if (!this.thomas) {
      return;
    }
    var direct = 0;
    switch (data.key) {
      case "a":
      case "left":
        direct |= 8;
        break;
      case "d":
      case "right":
        direct |= 4;
        break;
      case "w":
      case "up":
        direct |= 2;
        break;
      case "s":
      case "down":
        direct |= 1;
        break;
      case "c":
        this.command.emit('spawn_bomb');
        var bomb = this.thomas.spawnBomb(this.gameMap);
        if (bomb) {
          bomb.on('die', (function() {
            $__0.app.sound.play("explosion");
          }));
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
    var direct = 15;
    switch (data.key) {
      case "a":
      case "left":
        direct &= 7;
        break;
      case "d":
      case "right":
        direct &= 11;
        break;
      case "w":
      case "up":
        direct &= 13;
        break;
      case "s":
      case "down":
        direct &= 14;
        break;
    }
    this.command.emit('user_move_not', direct);
    this.thomas.cancelFaceDirectBits(direct);
  }
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
  this.faceDirectBits = 0;
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
    };
  };
};
var Queue = function Queue() {
  this.queue = [];
};
($traceurRuntime.createClass)(Queue, {
  push: function(msg) {
    this.queue.push(msg);
  },
  shift: function() {
    return this.queue.shift();
  }
}, {});
module.exports = ENGINE;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/engine.js
},{"./class/gamemap":7,"./class/thomas":9,"co":14}],13:[function(require,module,exports){
"use strict";
var ENGINE = require('./engine');
var app = new PLAYGROUND.Application({
  paths: {
    images: "bomb-man/images/",
    sounds: "bomb-man/sounds/",
    atlases: "bomb-man/atlases/",
    data: "bomb-man/data/"
  },
  create: function() {
    this.loadSounds("music", "explosion");
    this.loadImage(["background", "items/Icon_blastup", "items/Icon_countup", "items/Icon_healthup", "items/Icon_speedup", "items/bomb", "items/fire"]);
    this.loadData("levels");
    this.loadImage("zombie");
  },
  ready: function() {
    this.setState(ENGINE.Game);
  },
  mousedown: function(data) {},
  scale: 0.5
});

//# sourceURL=/home/zach/www/MultiPlay/lan_game/lan/bomb_man/src/main.js
},{"./engine":12}],14:[function(require,module,exports){
"use strict";
var slice = Array.prototype.slice;
module.exports = co['default'] = co.co = co;
co.wrap = function(fn) {
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise() {
    return co.call(this, fn.apply(this, arguments));
  }
};
function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1);
  return new Promise(function(resolve, reject) {
    if (typeof gen === 'function')
      gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function')
      return resolve(gen);
    onFulfilled();
    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }
    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }
    function next(ret) {
      if (ret.done)
        return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value))
        return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, ' + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}
function toPromise(obj) {
  if (!obj)
    return obj;
  if (isPromise(obj))
    return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj))
    return co.call(this, obj);
  if ('function' == typeof obj)
    return thunkToPromise.call(this, obj);
  if (Array.isArray(obj))
    return arrayToPromise.call(this, obj);
  if (isObject(obj))
    return objectToPromise.call(this, obj);
  return obj;
}
function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function(resolve, reject) {
    fn.call(ctx, function(err, res) {
      if (err)
        return reject(err);
      if (arguments.length > 2)
        res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}
function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}
function objectToPromise(obj) {
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise))
      defer(promise, key);
    else
      results[key] = obj[key];
  }
  return Promise.all(promises).then(function() {
    return results;
  });
  function defer(promise, key) {
    results[key] = undefined;
    promises.push(promise.then(function(res) {
      results[key] = res;
    }));
  }
}
function isPromise(obj) {
  return 'function' == typeof obj.then;
}
function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor)
    return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName)
    return true;
  return isGenerator(constructor.prototype);
}
function isObject(val) {
  return Object == val.constructor;
}

//# sourceURL=/home/zach/www/MultiPlay/lan_game/node_modules/co/index.js
},{}],15:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":16}],16:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],17:[function(require,module,exports){
(function (process,global){
(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  var privateNames = $create(null);
  function isPrivateName(s) {
    return privateNames[s];
  }
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isShimSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isShimSymbol(v))
      return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined)
      desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  var hashProperty = createPrivateName();
  var hashPropertyDescriptor = {value: undefined};
  var hashObjectProperties = {
    hash: {value: undefined},
    self: {value: undefined}
  };
  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
    if (hashObject && hashObject.self === object)
      return hashObject;
    if ($isExtensible(object)) {
      hashObjectProperties.hash.value = hashCounter++;
      hashObjectProperties.self.value = object;
      hashPropertyDescriptor.value = $create(null, hashObjectProperties);
      $defineProperty(object, hashProperty, hashPropertyDescriptor);
      return hashPropertyDescriptor.value;
    }
    return undefined;
  }
  function freeze(object) {
    getOwnHashObject(object);
    return $freeze.apply(this, arguments);
  }
  function preventExtensions(object) {
    getOwnHashObject(object);
    return $preventExtensions.apply(this, arguments);
  }
  function seal(object) {
    getOwnHashObject(object);
    return $seal.apply(this, arguments);
  }
  freeze(SymbolValue.prototype);
  function isSymbolString(s) {
    return symbolValues[s] || privateNames[s];
  }
  function toProperty(name) {
    if (isShimSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function removeSymbolKeys(array) {
    var rv = [];
    for (var i = 0; i < array.length; i++) {
      if (!isSymbolString(array[i])) {
        rv.push(array[i]);
      }
    }
    return rv;
  }
  function getOwnPropertyNames(object) {
    return removeSymbolKeys($getOwnPropertyNames(object));
  }
  function keys(object) {
    return removeSymbolKeys($keys(object));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol) {
        rv.push(symbol);
      }
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function defineProperty(object, name, descriptor) {
    if (isShimSymbol(name)) {
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    $defineProperty(Object, 'freeze', {value: freeze});
    $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
    $defineProperty(Object, 'seal', {value: seal});
    $defineProperty(Object, 'keys', {value: keys});
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (isSymbolString(name))
          continue;
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function isObject(x) {
    return x != null && (typeof x === 'object' || typeof x === 'function');
  }
  function toObject(x) {
    if (x == null)
      throw $TypeError();
    return $Object(x);
  }
  function checkObjectCoercible(argument) {
    if (argument == null) {
      throw new TypeError('Value cannot be converted to an Object');
    }
    return argument;
  }
  function polyfillSymbol(global, Symbol) {
    if (!global.Symbol) {
      global.Symbol = Symbol;
      Object.getOwnPropertySymbols = getOwnPropertySymbols;
    }
    if (!global.Symbol.iterator) {
      global.Symbol.iterator = Symbol('Symbol.iterator');
    }
  }
  function setupGlobals(global) {
    polyfillSymbol(global, Symbol);
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    checkObjectCoercible: checkObjectCoercible,
    createPrivateName: createPrivateName,
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    isObject: isObject,
    isPrivateName: isPrivateName,
    isSymbolString: isSymbolString,
    keys: $keys,
    setupGlobals: setupGlobals,
    toObject: toObject,
    toProperty: toProperty,
    typeof: typeOf
  };
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function() {
  'use strict';
  var path;
  function relativeRequire(callerPath, requiredPath) {
    path = path || typeof require !== 'undefined' && require('path');
    function isDirectory(path) {
      return path.slice(-1) === '/';
    }
    function isAbsolute(path) {
      return path[0] === '/';
    }
    function isRelative(path) {
      return path[0] === '.';
    }
    if (isDirectory(requiredPath) || isAbsolute(requiredPath))
      return;
    return isRelative(requiredPath) ? require(path.resolve(path.dirname(callerPath), requiredPath)) : require(requiredPath);
  }
  $traceurRuntime.require = relativeRequire;
})();
(function() {
  'use strict';
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
})();
(function() {
  'use strict';
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $__0 = Object,
      getOwnPropertyNames = $__0.getOwnPropertyNames,
      getOwnPropertySymbols = $__0.getOwnPropertySymbols;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superConstructor(ctor) {
    return ctor.__proto__;
  }
  function superCall(self, homeObject, name, args) {
    return superGet(self, homeObject, name).apply(self, args);
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError(("super has no setter '" + name + "'."));
  }
  function getDescriptors(object) {
    var descriptors = {};
    var names = getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    var symbols = getOwnPropertySymbols(object);
    for (var i = 0; i < symbols.length; i++) {
      var symbol = symbols[i];
      descriptors[$traceurRuntime.toProperty(symbol)] = $getOwnPropertyDescriptor(object, $traceurRuntime.toProperty(symbol));
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null)
      return null;
    throw new $TypeError(("Super expression must either be null or a function, not " + typeof superClass + "."));
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.defaultSuperCall = defaultSuperCall;
  $traceurRuntime.superCall = superCall;
  $traceurRuntime.superConstructor = superConstructor;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
})();
(function() {
  'use strict';
  if (typeof $traceurRuntime !== 'object') {
    throw new Error('traceur runtime not found.');
  }
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value = moveNext(ctx);
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
})();
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function() {
  'use strict';
  var types = {
    any: {name: 'any'},
    boolean: {name: 'boolean'},
    number: {name: 'number'},
    string: {name: 'string'},
    symbol: {name: 'symbol'},
    void: {name: 'void'}
  };
  var GenericType = function GenericType(type, argumentTypes) {
    this.type = type;
    this.argumentTypes = argumentTypes;
  };
  ($traceurRuntime.createClass)(GenericType, {}, {});
  var typeRegister = Object.create(null);
  function genericType(type) {
    for (var argumentTypes = [],
        $__1 = 1; $__1 < arguments.length; $__1++)
      argumentTypes[$__1 - 1] = arguments[$__1];
    var typeMap = typeRegister;
    var key = $traceurRuntime.getOwnHashObject(type).hash;
    if (!typeMap[key]) {
      typeMap[key] = Object.create(null);
    }
    typeMap = typeMap[key];
    for (var i = 0; i < argumentTypes.length - 1; i++) {
      key = $traceurRuntime.getOwnHashObject(argumentTypes[i]).hash;
      if (!typeMap[key]) {
        typeMap[key] = Object.create(null);
      }
      typeMap = typeMap[key];
    }
    var tail = argumentTypes[argumentTypes.length - 1];
    key = $traceurRuntime.getOwnHashObject(tail).hash;
    if (!typeMap[key]) {
      typeMap[key] = new GenericType(type, argumentTypes);
    }
    return typeMap[key];
  }
  $traceurRuntime.GenericType = GenericType;
  $traceurRuntime.genericType = genericType;
  $traceurRuntime.type = types;
})();
(function(global) {
  'use strict';
  var $__2 = $traceurRuntime,
      canonicalizeUrl = $__2.canonicalizeUrl,
      resolveUrl = $__2.resolveUrl,
      isAbsolute = $__2.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var ModuleEvaluationError = function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof $ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  };
  var $ModuleEvaluationError = ModuleEvaluationError;
  ($traceurRuntime.createClass)(ModuleEvaluationError, {
    stripError: function(message) {
      return message.replace(/.*Error:/, this.constructor.name + ':');
    },
    stripCause: function(cause) {
      if (!cause)
        return '';
      if (!cause.message)
        return cause + '';
      return this.stripError(cause.message);
    },
    loadedBy: function(moduleName) {
      this.stack += '\n loaded by ' + moduleName;
    },
    stripStack: function(causeStack) {
      var stack = [];
      causeStack.split('\n').some((function(frame) {
        if (/UncoatedModuleInstantiator/.test(frame))
          return true;
        stack.push(frame);
      }));
      stack[0] = this.stripError(stack[0]);
      return stack.join('\n');
    }
  }, {}, Error);
  function beforeLines(lines, number) {
    var result = [];
    var first = number - 3;
    if (first < 0)
      first = 0;
    for (var i = first; i < number; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function afterLines(lines, number) {
    var last = number + 1;
    if (last > lines.length - 1)
      last = lines.length - 1;
    var result = [];
    for (var i = number; i <= last; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function columnSpacing(columns) {
    var result = '';
    for (var i = 0; i < columns - 1; i++) {
      result += '-';
    }
    return result;
  }
  var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
    $traceurRuntime.superConstructor($UncoatedModuleInstantiator).call(this, url, null);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
  ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_)
        return this.value_;
      try {
        var relativeRequire;
        if (typeof $traceurRuntime !== undefined) {
          relativeRequire = $traceurRuntime.require.bind(null, this.url);
        }
        return this.value_ = this.func.call(global, relativeRequire);
      } catch (ex) {
        if (ex instanceof ModuleEvaluationError) {
          ex.loadedBy(this.url);
          throw ex;
        }
        if (ex.stack) {
          var lines = this.func.toString().split('\n');
          var evaled = [];
          ex.stack.split('\n').some(function(frame) {
            if (frame.indexOf('UncoatedModuleInstantiator.getUncoatedModule') > 0)
              return true;
            var m = /(at\s[^\s]*\s).*>:(\d*):(\d*)\)/.exec(frame);
            if (m) {
              var line = parseInt(m[2], 10);
              evaled = evaled.concat(beforeLines(lines, line));
              evaled.push(columnSpacing(m[3]) + '^');
              evaled = evaled.concat(afterLines(lines, line));
              evaled.push('= = = = = = = = =');
            } else {
              evaled.push(frame);
            }
          });
          ex.stack = evaled.join('\n');
        }
        throw new ModuleEvaluationError(this.url, ex);
      }
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== 'string')
        throw new TypeError('module name must be a string, not ' + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, deps, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, deps, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  var moduleStoreModule = new Module({ModuleStore: ModuleStore});
  ModuleStore.set('@traceur/src/runtime/ModuleStore', moduleStoreModule);
  ModuleStore.set('@traceur/src/runtime/ModuleStore.js', moduleStoreModule);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    registerModule: ModuleStore.registerModule.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/utils.js";
  var $ceil = Math.ceil;
  var $floor = Math.floor;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $pow = Math.pow;
  var $min = Math.min;
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x >>> 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function isNumber(x) {
    return typeof x === 'number';
  }
  function toInteger(x) {
    x = +x;
    if ($isNaN(x))
      return 0;
    if (x === 0 || !$isFinite(x))
      return x;
    return x > 0 ? $floor(x) : $ceil(x);
  }
  var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
  }
  function checkIterable(x) {
    return !isObject(x) ? undefined : x[Symbol.iterator];
  }
  function isConstructor(x) {
    return isCallable(x);
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function maybeDefine(object, name, descr) {
    if (!(name in object)) {
      Object.defineProperty(object, name, descr);
    }
  }
  function maybeDefineMethod(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  function maybeDefineConst(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function maybeAddConsts(object, consts) {
    for (var i = 0; i < consts.length; i += 2) {
      var name = consts[i];
      var value = consts[i + 1];
      maybeDefineConst(object, name, value);
    }
  }
  function maybeAddIterator(object, func, Symbol) {
    if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
      return;
    if (object['@@iterator'])
      func = object['@@iterator'];
    Object.defineProperty(object, Symbol.iterator, {
      value: func,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  var polyfills = [];
  function registerPolyfill(func) {
    polyfills.push(func);
  }
  function polyfillAll(global) {
    polyfills.forEach((function(f) {
      return f(global);
    }));
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get isNumber() {
      return isNumber;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    },
    get checkIterable() {
      return checkIterable;
    },
    get isConstructor() {
      return isConstructor;
    },
    get createIteratorResultObject() {
      return createIteratorResultObject;
    },
    get maybeDefine() {
      return maybeDefine;
    },
    get maybeDefineMethod() {
      return maybeDefineMethod;
    },
    get maybeDefineConst() {
      return maybeDefineConst;
    },
    get maybeAddFunctions() {
      return maybeAddFunctions;
    },
    get maybeAddConsts() {
      return maybeAddConsts;
    },
    get maybeAddIterator() {
      return maybeAddIterator;
    },
    get registerPolyfill() {
      return registerPolyfill;
    },
    get polyfillAll() {
      return polyfillAll;
    }
  };
});
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Map.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Map.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = function Map() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Map called on incompatible type');
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError('Map can not be reentrantly initialised');
    }
    initMap(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__2 = iterable[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__3; !($__3 = $__2.next()).done; ) {
        var $__4 = $__3.value,
            key = $__4[0],
            value = $__4[1];
        {
          this.set(key, value);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Map, {
    get size() {
      return this.entries_.length / 2 - this.deletedCount_;
    },
    get: function(key) {
      var index = lookupIndex(this, key);
      if (index !== undefined)
        return this.entries_[index + 1];
    },
    set: function(key, value) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index = lookupIndex(this, key);
      if (index !== undefined) {
        this.entries_[index + 1] = value;
      } else {
        index = this.entries_.length;
        this.entries_[index] = key;
        this.entries_[index + 1] = value;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          var hash = hashObject.hash;
          this.objectIndex_[hash] = index;
        } else if (stringMode) {
          this.stringIndex_[key] = index;
        } else {
          this.primitiveIndex_[key] = index;
        }
      }
      return this;
    },
    has: function(key) {
      return lookupIndex(this, key) !== undefined;
    },
    delete: function(key) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index;
      var hash;
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        if (hashObject) {
          index = this.objectIndex_[hash = hashObject.hash];
          delete this.objectIndex_[hash];
        }
      } else if (stringMode) {
        index = this.stringIndex_[key];
        delete this.stringIndex_[key];
      } else {
        index = this.primitiveIndex_[key];
        delete this.primitiveIndex_[key];
      }
      if (index !== undefined) {
        this.entries_[index] = deletedSentinel;
        this.entries_[index + 1] = undefined;
        this.deletedCount_++;
        return true;
      }
      return false;
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0; i < this.entries_.length; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    },
    entries: $traceurRuntime.initGeneratorFunction(function $__5() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return [key, value];
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__5, this);
    }),
    keys: $traceurRuntime.initGeneratorFunction(function $__6() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return key;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__6, this);
    }),
    values: $traceurRuntime.initGeneratorFunction(function $__7() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return value;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__7, this);
    })
  }, {});
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__4 = global,
        Object = $__4.Object,
        Symbol = $__4.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries === undefined)
      global.Map = Map;
    if (mapPrototype.entries) {
      maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillMap);
  return {
    get Map() {
      return Map;
    },
    get polyfillMap() {
      return polyfillMap;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Map.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Set.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Set.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Map.js").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = function Set() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Set called on incompatible type');
    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }
    initSet(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__4 = iterable[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__5; !($__5 = $__4.next()).done; ) {
        var item = $__5.value;
        {
          this.add(item);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Set, {
    get size() {
      return this.map_.size;
    },
    has: function(key) {
      return this.map_.has(key);
    },
    add: function(key) {
      this.map_.set(key, key);
      return this;
    },
    delete: function(key) {
      return this.map_.delete(key);
    },
    clear: function() {
      return this.map_.clear();
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      var $__2 = this;
      return this.map_.forEach((function(value, key) {
        callbackFn.call(thisArg, key, key, $__2);
      }));
    },
    values: $traceurRuntime.initGeneratorFunction(function $__7() {
      var $__8,
          $__9;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__8 = this.map_.keys()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__9 = $__8[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__9.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__9.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__9.value;
            default:
              return $ctx.end();
          }
      }, $__7, this);
    }),
    entries: $traceurRuntime.initGeneratorFunction(function $__10() {
      var $__11,
          $__12;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__11 = this.map_.entries()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__12 = $__11[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__12.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__12.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__12.value;
            default:
              return $ctx.end();
          }
      }, $__10, this);
    })
  }, {});
  Object.defineProperty(Set.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  Object.defineProperty(Set.prototype, 'keys', {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  function polyfillSet(global) {
    var $__6 = global,
        Object = $__6.Object,
        Symbol = $__6.Symbol;
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    if (setPrototype.values) {
      maybeAddIterator(setPrototype, setPrototype.values, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillSet);
  return {
    get Set() {
      return Set;
    },
    get polyfillSet() {
      return polyfillSet;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Set.js" + '');
System.registerModule("traceur-runtime@0.0.79/node_modules/rsvp/lib/rsvp/asap.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/node_modules/rsvp/lib/rsvp/asap.js";
  var len = 0;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
      callback(arg);
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
    len = 0;
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Promise.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Promise.js";
  var async = System.get("traceur-runtime@0.0.79/node_modules/rsvp/lib/rsvp/asap.js").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js").registerPolyfill;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = function Promise(resolver) {
    if (resolver === promiseRaw)
      return;
    if (typeof resolver !== 'function')
      throw new TypeError;
    var promise = promiseInit(this);
    try {
      resolver((function(x) {
        promiseResolve(promise, x);
      }), (function(r) {
        promiseReject(promise, r);
      }));
    } catch (e) {
      promiseReject(promise, e);
    }
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function(onResolve, onReject) {
      if (typeof onResolve !== 'function')
        onResolve = idResolveHandler;
      if (typeof onReject !== 'function')
        onReject = idRejectHandler;
      var that = this;
      var constructor = this.constructor;
      return chain(this, function(x) {
        x = promiseCoerce(constructor, x);
        return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }, onReject);
    }
  }, {
    resolve: function(x) {
      if (this === $Promise) {
        if (isPromise(x)) {
          return x;
        }
        return promiseSet(new $Promise(promiseRaw), +1, x);
      } else {
        return new this(function(resolve, reject) {
          resolve(x);
        });
      }
    },
    reject: function(r) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), -1, r);
      } else {
        return new this((function(resolve, reject) {
          reject(r);
        }));
      }
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var resolutions = [];
      try {
        var count = values.length;
        if (count === 0) {
          deferred.resolve(resolutions);
        } else {
          for (var i = 0; i < values.length; i++) {
            this.resolve(values[i]).then(function(i, x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            }.bind(undefined, i), (function(r) {
              deferred.reject(r);
            }));
          }
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.resolve(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  registerPolyfill(polyfillPromise);
  return {
    get Promise() {
      return Promise;
    },
    get polyfillPromise() {
      return polyfillPromise;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Promise.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/StringIterator.js", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/StringIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      createIteratorResultObject = $__0.createIteratorResultObject,
      isObject = $__0.isObject;
  var toProperty = $traceurRuntime.toProperty;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = function StringIterator() {};
  ($traceurRuntime.createClass)(StringIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var o = this;
      if (!isObject(o) || !hasOwnProperty.call(o, iteratedString)) {
        throw new TypeError('this must be a StringIterator object');
      }
      var s = o[toProperty(iteratedString)];
      if (s === undefined) {
        return createIteratorResultObject(undefined, true);
      }
      var position = o[toProperty(stringIteratorNextIndex)];
      var len = s.length;
      if (position >= len) {
        o[toProperty(iteratedString)] = undefined;
        return createIteratorResultObject(undefined, true);
      }
      var first = s.charCodeAt(position);
      var resultString;
      if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
        resultString = String.fromCharCode(first);
      } else {
        var second = s.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) {
          resultString = String.fromCharCode(first);
        } else {
          resultString = String.fromCharCode(first) + String.fromCharCode(second);
        }
      }
      o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
      return createIteratorResultObject(resultString, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createStringIterator(string) {
    var s = String(string);
    var iterator = Object.create(StringIterator.prototype);
    iterator[toProperty(iteratedString)] = s;
    iterator[toProperty(stringIteratorNextIndex)] = 0;
    return iterator;
  }
  return {get createStringIterator() {
      return createStringIterator;
    }};
});
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/String.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/String.js";
  var createStringIterator = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/StringIterator.js").createStringIterator;
  var $__1 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill;
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function includes(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    if (search && $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (pos != pos) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    if (searchLength + start > stringLength) {
      return false;
    }
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint() {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  function stringPrototypeIterator() {
    var o = $traceurRuntime.checkObjectCoercible(this);
    var s = String(o);
    return createStringIterator(s);
  }
  function polyfillString(global) {
    var String = global.String;
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'endsWith', endsWith, 'includes', includes, 'repeat', repeat, 'startsWith', startsWith]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
  }
  registerPolyfill(polyfillString);
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get includes() {
      return includes;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    },
    get stringPrototypeIterator() {
      return stringPrototypeIterator;
    },
    get polyfillString() {
      return polyfillString;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/String.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/ArrayIterator.js", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/ArrayIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      toObject = $__0.toObject,
      toUint32 = $__0.toUint32,
      createIteratorResultObject = $__0.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Array.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Array.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/ArrayIterator.js"),
      entries = $__0.entries,
      keys = $__0.keys,
      values = $__0.values;
  var $__1 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      checkIterable = $__1.checkIterable,
      isCallable = $__1.isCallable,
      isConstructor = $__1.isConstructor,
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill,
      toInteger = $__1.toInteger,
      toLength = $__1.toLength,
      toObject = $__1.toObject;
  function from(arrLike) {
    var mapFn = arguments[1];
    var thisArg = arguments[2];
    var C = this;
    var items = toObject(arrLike);
    var mapping = mapFn !== undefined;
    var k = 0;
    var arr,
        len;
    if (mapping && !isCallable(mapFn)) {
      throw TypeError();
    }
    if (checkIterable(items)) {
      arr = isConstructor(C) ? new C() : [];
      for (var $__2 = items[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__3; !($__3 = $__2.next()).done; ) {
        var item = $__3.value;
        {
          if (mapping) {
            arr[k] = mapFn.call(thisArg, item, k);
          } else {
            arr[k] = item;
          }
          k++;
        }
      }
      arr.length = k;
      return arr;
    }
    len = toLength(items.length);
    arr = isConstructor(C) ? new C(len) : new Array(len);
    for (; k < len; k++) {
      if (mapping) {
        arr[k] = typeof thisArg === 'undefined' ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
    }
    arr.length = len;
    return arr;
  }
  function of() {
    for (var items = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      items[$__4] = arguments[$__4];
    var C = this;
    var len = items.length;
    var arr = isConstructor(C) ? new C(len) : new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = items[k];
    }
    arr.length = len;
    return arr;
  }
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      var value = object[i];
      if (predicate.call(thisArg, value, i, object)) {
        return returnIndex ? i : value;
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__5 = global,
        Array = $__5.Array,
        Object = $__5.Object,
        Symbol = $__5.Symbol;
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from, 'of', of]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(Object.getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  registerPolyfill(polyfillArray);
  return {
    get from() {
      return from;
    },
    get of() {
      return of;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    },
    get polyfillArray() {
      return polyfillArray;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Array.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Object.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Object.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill;
  var $__1 = $traceurRuntime,
      defineProperty = $__1.defineProperty,
      getOwnPropertyDescriptor = $__1.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__1.getOwnPropertyNames,
      isPrivateName = $__1.isPrivateName,
      keys = $__1.keys;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = source == null ? [] : keys(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (isPrivateName(name))
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (isPrivateName(name))
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  function polyfillObject(global) {
    var Object = global.Object;
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  registerPolyfill(polyfillObject);
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    },
    get polyfillObject() {
      return polyfillObject;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Object.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Number.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Number.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      isNumber = $__0.isNumber,
      maybeAddConsts = $__0.maybeAddConsts,
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill,
      toInteger = $__0.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  ;
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
  ;
  function isSafeInteger(number) {
    if (NumberIsFinite(number)) {
      var integral = toInteger(number);
      if (integral === number)
        return $abs(integral) <= MAX_SAFE_INTEGER;
    }
    return false;
  }
  function polyfillNumber(global) {
    var Number = global.Number;
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', NumberIsFinite, 'isInteger', isInteger, 'isNaN', NumberIsNaN, 'isSafeInteger', isSafeInteger]);
  }
  registerPolyfill(polyfillNumber);
  return {
    get MAX_SAFE_INTEGER() {
      return MAX_SAFE_INTEGER;
    },
    get MIN_SAFE_INTEGER() {
      return MIN_SAFE_INTEGER;
    },
    get EPSILON() {
      return EPSILON;
    },
    get isFinite() {
      return NumberIsFinite;
    },
    get isInteger() {
      return isInteger;
    },
    get isNaN() {
      return NumberIsNaN;
    },
    get isSafeInteger() {
      return isSafeInteger;
    },
    get polyfillNumber() {
      return polyfillNumber;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Number.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/polyfills.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/polyfills.js";
  var polyfillAll = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js").polyfillAll;
  polyfillAll(Reflect.global);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/polyfills.js" + '');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":16,"path":15}]},{},[17,13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9jbGFzcy9iYWxsLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3MvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9jbGFzcy9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9sYW4vYm9tYl9tYW4vc3JjL2NsYXNzL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci84IiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3MvYmxvY2suanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9jbGFzcy9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9sYW4vYm9tYl9tYW4vc3JjL2NsYXNzL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3MvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9jbGFzcy9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9sYW4vYm9tYl9tYW4vc3JjL2NsYXNzL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3MvYm9tYi5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9sYW4vYm9tYl9tYW4vc3JjL2NsYXNzL2NlbGwuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9jbGFzcy9maXJlLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3MvZmxvb3IuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9jbGFzcy9nYW1lbWFwLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3MvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3MvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEyIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3MvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzkiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9jbGFzcy9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9jbGFzcy9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTAiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9jbGFzcy9pdGVtLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3MvdGhvbWFzLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvY2xhc3Mvd2FsbC5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9sYW4vYm9tYl9tYW4vc3JjL2NvbGxpc2lvbi5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9sYW4vYm9tYl9tYW4vc3JjL2VuZ2luZS5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9sYW4vYm9tYl9tYW4vc3JjL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL2xhbi9ib21iX21hbi9zcmMvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbGFuL2JvbWJfbWFuL3NyYy9tYWluLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL25vZGVfbW9kdWxlcy9jby9pbmRleC5qcyIsIi4uL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL25vZGVfbW9kdWxlcy9wYXRoLWJyb3dzZXJpZnkvaW5kZXguanMiLCIuLi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiLi4vaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvbm9kZV9tb2R1bGVzL3RyYWNldXIvYmluL3RyYWNldXItcnVudGltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFB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QUFDLEVBQUksQ0FBQSxJQUFHLEtBQUssQUFBQyxDQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsQ0FBQSxDQUFJLEVBQUEsQ0FBQztBQUM3QixjQUFVLEVBQUksQ0FBQSxJQUFHLE1BQU0sQUFBQyxDQUFDLElBQUcsVUFBVSxBQUFDLENBQUMsWUFBVyxDQUFDLENBQUMsQ0FBQztBQUN0RCxjQUFVLFFBQVEsQUFBQyxDQUFDLFNBQVMsQ0FBQSxDQUFHO0FBQzlCLE1BQUEsQ0FBRSxDQUFBLENBQUMsR0FBSyxHQUFDLENBQUM7QUFDVixNQUFBLENBQUUsQ0FBQSxDQUFDLEdBQUssR0FBQyxDQUFDO0FBQ1YsU0FBSSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksRUFBQyxFQUFDLENBQUc7QUFDZCxRQUFBLENBQUUsQ0FBQSxDQUFDLEdBQUssQ0FBQSxDQUFDLEVBQUMsRUFBSSxFQUFBLENBQUMsRUFBSSxHQUFDLENBQUM7TUFDdkI7QUFBQSxBQUNBLFNBQUksQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLEdBQUMsQ0FBRztBQUNiLFFBQUEsQ0FBRSxDQUFBLENBQUMsR0FBSyxDQUFBLENBQUMsRUFBQyxFQUFJLEVBQUEsQ0FBQyxFQUFJLEdBQUMsQ0FBQztNQUN2QjtBQUFBLEFBQ0EsU0FBSSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksRUFBQyxFQUFDLENBQUc7QUFDZCxRQUFBLENBQUUsQ0FBQSxDQUFDLEdBQUssQ0FBQSxDQUFDLEVBQUMsRUFBSSxFQUFBLENBQUMsRUFBSSxHQUFDLENBQUM7TUFDdkI7QUFBQSxBQUNBLFNBQUksQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLEdBQUMsQ0FBRztBQUNiLFFBQUEsQ0FBRSxDQUFBLENBQUMsR0FBSyxDQUFBLENBQUMsRUFBQyxFQUFJLEVBQUEsQ0FBQyxFQUFJLEdBQUMsQ0FBQztNQUN2QjtBQUFBLElBQ0YsQ0FBQyxDQUFDO0FBQ0YsU0FBTyxFQUFDLEVBQUMsQ0FBRyxHQUFDLENBQUMsQ0FBQztFQUNqQixDQUFDO0FBQ0QsS0FBRyxLQUFLLEVBQUksVUFB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QVUsS0FBSyxDQUFBLEVBQUssQ0FBQSxtQkFBa0IsSUFBTSxDQUFBLFdBQVUsWUFBWTtBQUFHLFNBQU8sS0FBRyxDQUFDO0FBQUEsQUFDNUcsT0FBTyxDQUFBLFdBQVUsQUFBQyxDQUFDLFdBQVUsVUFBVSxDQUFDLENBQUM7QUFDM0M7QUFBQSxBQVVBLE9BQVMsU0FBTyxDQUFFLEdBQUUsQ0FBRztBQUNyQixPQUFPLENBQUEsTUFBSyxHQUFLLENBQUEsR0FBRSxZQUFZLENBQUM7QUFDbEM7QUFBQTs7OztBQzVPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsbnVsbCwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1xuICAgICAgICAgICAgICAgICAgICAgJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoU3ltYm9sLml0ZXJhdG9yKV0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLG51bGwsIiR0cmFjZXVyUnVudGltZS5zdXBlckNvbnN0cnVjdG9yKCRfX3BsYWNlaG9sZGVyX18wKS5jYWxsKCRfX3BsYWNlaG9sZGVyX18xKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsIiR0cmFjZXVyUnVudGltZS5zdXBlckdldCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIiRfX3BsYWNlaG9sZGVyX18wLmNhbGwoJF9fcGxhY2Vob2xkZXJfXzEpIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJyZXR1cm4gJGN0eC5lbmQoKSIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIixudWxsLG51bGwsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIihmdW5jdGlvbihnbG9iYWwpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICBpZiAoZ2xvYmFsLiR0cmFjZXVyUnVudGltZSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgJE9iamVjdCA9IE9iamVjdDtcbiAgdmFyICRUeXBlRXJyb3IgPSBUeXBlRXJyb3I7XG4gIHZhciAkY3JlYXRlID0gJE9iamVjdC5jcmVhdGU7XG4gIHZhciAkZGVmaW5lUHJvcGVydGllcyA9ICRPYmplY3QuZGVmaW5lUHJvcGVydGllcztcbiAgdmFyICRkZWZpbmVQcm9wZXJ0eSA9ICRPYmplY3QuZGVmaW5lUHJvcGVydHk7XG4gIHZhciAkZnJlZXplID0gJE9iamVjdC5mcmVlemU7XG4gIHZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gJE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gIHZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9ICRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgdmFyICRrZXlzID0gJE9iamVjdC5rZXlzO1xuICB2YXIgJGhhc093blByb3BlcnR5ID0gJE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciAkdG9TdHJpbmcgPSAkT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgdmFyICRwcmV2ZW50RXh0ZW5zaW9ucyA9IE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucztcbiAgdmFyICRzZWFsID0gT2JqZWN0LnNlYWw7XG4gIHZhciAkaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZTtcbiAgZnVuY3Rpb24gbm9uRW51bSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfTtcbiAgfVxuICB2YXIgbWV0aG9kID0gbm9uRW51bTtcbiAgdmFyIGNvdW50ZXIgPSAwO1xuICBmdW5jdGlvbiBuZXdVbmlxdWVTdHJpbmcoKSB7XG4gICAgcmV0dXJuICdfXyQnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMWU5KSArICckJyArICsrY291bnRlciArICckX18nO1xuICB9XG4gIHZhciBzeW1ib2xJbnRlcm5hbFByb3BlcnR5ID0gbmV3VW5pcXVlU3RyaW5nKCk7XG4gIHZhciBzeW1ib2xEZXNjcmlwdGlvblByb3BlcnR5ID0gbmV3VW5pcXVlU3RyaW5nKCk7XG4gIHZhciBzeW1ib2xEYXRhUHJvcGVydHkgPSBuZXdVbmlxdWVTdHJpbmcoKTtcbiAgdmFyIHN5bWJvbFZhbHVlcyA9ICRjcmVhdGUobnVsbCk7XG4gIHZhciBwcml2YXRlTmFtZXMgPSAkY3JlYXRlKG51bGwpO1xuICBmdW5jdGlvbiBpc1ByaXZhdGVOYW1lKHMpIHtcbiAgICByZXR1cm4gcHJpdmF0ZU5hbWVzW3NdO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZVByaXZhdGVOYW1lKCkge1xuICAgIHZhciBzID0gbmV3VW5pcXVlU3RyaW5nKCk7XG4gICAgcHJpdmF0ZU5hbWVzW3NdID0gdHJ1ZTtcbiAgICByZXR1cm4gcztcbiAgfVxuICBmdW5jdGlvbiBpc1NoaW1TeW1ib2woc3ltYm9sKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzeW1ib2wgPT09ICdvYmplY3QnICYmIHN5bWJvbCBpbnN0YW5jZW9mIFN5bWJvbFZhbHVlO1xuICB9XG4gIGZ1bmN0aW9uIHR5cGVPZih2KSB7XG4gICAgaWYgKGlzU2hpbVN5bWJvbCh2KSlcbiAgICAgIHJldHVybiAnc3ltYm9sJztcbiAgICByZXR1cm4gdHlwZW9mIHY7XG4gIH1cbiAgZnVuY3Rpb24gU3ltYm9sKGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIHZhbHVlID0gbmV3IFN5bWJvbFZhbHVlKGRlc2NyaXB0aW9uKTtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU3ltYm9sKSlcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTeW1ib2wgY2Fubm90IGJlIG5ld1xcJ2VkJyk7XG4gIH1cbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbC5wcm90b3R5cGUsICdjb25zdHJ1Y3RvcicsIG5vbkVudW0oU3ltYm9sKSk7XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2wucHJvdG90eXBlLCAndG9TdHJpbmcnLCBtZXRob2QoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN5bWJvbFZhbHVlID0gdGhpc1tzeW1ib2xEYXRhUHJvcGVydHldO1xuICAgIGlmICghZ2V0T3B0aW9uKCdzeW1ib2xzJykpXG4gICAgICByZXR1cm4gc3ltYm9sVmFsdWVbc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eV07XG4gICAgaWYgKCFzeW1ib2xWYWx1ZSlcbiAgICAgIHRocm93IFR5cGVFcnJvcignQ29udmVyc2lvbiBmcm9tIHN5bWJvbCB0byBzdHJpbmcnKTtcbiAgICB2YXIgZGVzYyA9IHN5bWJvbFZhbHVlW3N5bWJvbERlc2NyaXB0aW9uUHJvcGVydHldO1xuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpXG4gICAgICBkZXNjID0gJyc7XG4gICAgcmV0dXJuICdTeW1ib2woJyArIGRlc2MgKyAnKSc7XG4gIH0pKTtcbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbC5wcm90b3R5cGUsICd2YWx1ZU9mJywgbWV0aG9kKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzeW1ib2xWYWx1ZSA9IHRoaXNbc3ltYm9sRGF0YVByb3BlcnR5XTtcbiAgICBpZiAoIXN5bWJvbFZhbHVlKVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdDb252ZXJzaW9uIGZyb20gc3ltYm9sIHRvIHN0cmluZycpO1xuICAgIGlmICghZ2V0T3B0aW9uKCdzeW1ib2xzJykpXG4gICAgICByZXR1cm4gc3ltYm9sVmFsdWVbc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eV07XG4gICAgcmV0dXJuIHN5bWJvbFZhbHVlO1xuICB9KSk7XG4gIGZ1bmN0aW9uIFN5bWJvbFZhbHVlKGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIGtleSA9IG5ld1VuaXF1ZVN0cmluZygpO1xuICAgICRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBzeW1ib2xEYXRhUHJvcGVydHksIHt2YWx1ZTogdGhpc30pO1xuICAgICRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBzeW1ib2xJbnRlcm5hbFByb3BlcnR5LCB7dmFsdWU6IGtleX0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBzeW1ib2xEZXNjcmlwdGlvblByb3BlcnR5LCB7dmFsdWU6IGRlc2NyaXB0aW9ufSk7XG4gICAgZnJlZXplKHRoaXMpO1xuICAgIHN5bWJvbFZhbHVlc1trZXldID0gdGhpcztcbiAgfVxuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sVmFsdWUucHJvdG90eXBlLCAnY29uc3RydWN0b3InLCBub25FbnVtKFN5bWJvbCkpO1xuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sVmFsdWUucHJvdG90eXBlLCAndG9TdHJpbmcnLCB7XG4gICAgdmFsdWU6IFN5bWJvbC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZW51bWVyYWJsZTogZmFsc2VcbiAgfSk7XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2xWYWx1ZS5wcm90b3R5cGUsICd2YWx1ZU9mJywge1xuICAgIHZhbHVlOiBTeW1ib2wucHJvdG90eXBlLnZhbHVlT2YsXG4gICAgZW51bWVyYWJsZTogZmFsc2VcbiAgfSk7XG4gIHZhciBoYXNoUHJvcGVydHkgPSBjcmVhdGVQcml2YXRlTmFtZSgpO1xuICB2YXIgaGFzaFByb3BlcnR5RGVzY3JpcHRvciA9IHt2YWx1ZTogdW5kZWZpbmVkfTtcbiAgdmFyIGhhc2hPYmplY3RQcm9wZXJ0aWVzID0ge1xuICAgIGhhc2g6IHt2YWx1ZTogdW5kZWZpbmVkfSxcbiAgICBzZWxmOiB7dmFsdWU6IHVuZGVmaW5lZH1cbiAgfTtcbiAgdmFyIGhhc2hDb3VudGVyID0gMDtcbiAgZnVuY3Rpb24gZ2V0T3duSGFzaE9iamVjdChvYmplY3QpIHtcbiAgICB2YXIgaGFzaE9iamVjdCA9IG9iamVjdFtoYXNoUHJvcGVydHldO1xuICAgIGlmIChoYXNoT2JqZWN0ICYmIGhhc2hPYmplY3Quc2VsZiA9PT0gb2JqZWN0KVxuICAgICAgcmV0dXJuIGhhc2hPYmplY3Q7XG4gICAgaWYgKCRpc0V4dGVuc2libGUob2JqZWN0KSkge1xuICAgICAgaGFzaE9iamVjdFByb3BlcnRpZXMuaGFzaC52YWx1ZSA9IGhhc2hDb3VudGVyKys7XG4gICAgICBoYXNoT2JqZWN0UHJvcGVydGllcy5zZWxmLnZhbHVlID0gb2JqZWN0O1xuICAgICAgaGFzaFByb3BlcnR5RGVzY3JpcHRvci52YWx1ZSA9ICRjcmVhdGUobnVsbCwgaGFzaE9iamVjdFByb3BlcnRpZXMpO1xuICAgICAgJGRlZmluZVByb3BlcnR5KG9iamVjdCwgaGFzaFByb3BlcnR5LCBoYXNoUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgIHJldHVybiBoYXNoUHJvcGVydHlEZXNjcmlwdG9yLnZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIGZyZWV6ZShvYmplY3QpIHtcbiAgICBnZXRPd25IYXNoT2JqZWN0KG9iamVjdCk7XG4gICAgcmV0dXJuICRmcmVlemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyhvYmplY3QpIHtcbiAgICBnZXRPd25IYXNoT2JqZWN0KG9iamVjdCk7XG4gICAgcmV0dXJuICRwcmV2ZW50RXh0ZW5zaW9ucy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIGZ1bmN0aW9uIHNlYWwob2JqZWN0KSB7XG4gICAgZ2V0T3duSGFzaE9iamVjdChvYmplY3QpO1xuICAgIHJldHVybiAkc2VhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIGZyZWV6ZShTeW1ib2xWYWx1ZS5wcm90b3R5cGUpO1xuICBmdW5jdGlvbiBpc1N5bWJvbFN0cmluZyhzKSB7XG4gICAgcmV0dXJuIHN5bWJvbFZhbHVlc1tzXSB8fCBwcml2YXRlTmFtZXNbc107XG4gIH1cbiAgZnVuY3Rpb24gdG9Qcm9wZXJ0eShuYW1lKSB7XG4gICAgaWYgKGlzU2hpbVN5bWJvbChuYW1lKSlcbiAgICAgIHJldHVybiBuYW1lW3N5bWJvbEludGVybmFsUHJvcGVydHldO1xuICAgIHJldHVybiBuYW1lO1xuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZVN5bWJvbEtleXMoYXJyYXkpIHtcbiAgICB2YXIgcnYgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWlzU3ltYm9sU3RyaW5nKGFycmF5W2ldKSkge1xuICAgICAgICBydi5wdXNoKGFycmF5W2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJ2O1xuICB9XG4gIGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KSB7XG4gICAgcmV0dXJuIHJlbW92ZVN5bWJvbEtleXMoJGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KSk7XG4gIH1cbiAgZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgICByZXR1cm4gcmVtb3ZlU3ltYm9sS2V5cygka2V5cyhvYmplY3QpKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KSB7XG4gICAgdmFyIHJ2ID0gW107XG4gICAgdmFyIG5hbWVzID0gJGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc3ltYm9sID0gc3ltYm9sVmFsdWVzW25hbWVzW2ldXTtcbiAgICAgIGlmIChzeW1ib2wpIHtcbiAgICAgICAgcnYucHVzaChzeW1ib2wpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcnY7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgbmFtZSkge1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgdG9Qcm9wZXJ0eShuYW1lKSk7XG4gIH1cbiAgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkobmFtZSkge1xuICAgIHJldHVybiAkaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCB0b1Byb3BlcnR5KG5hbWUpKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRPcHRpb24obmFtZSkge1xuICAgIHJldHVybiBnbG9iYWwudHJhY2V1ciAmJiBnbG9iYWwudHJhY2V1ci5vcHRpb25zW25hbWVdO1xuICB9XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgIGlmIChpc1NoaW1TeW1ib2wobmFtZSkpIHtcbiAgICAgIG5hbWUgPSBuYW1lW3N5bWJvbEludGVybmFsUHJvcGVydHldO1xuICAgIH1cbiAgICAkZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCBkZXNjcmlwdG9yKTtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsT2JqZWN0KE9iamVjdCkge1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScsIHt2YWx1ZTogZGVmaW5lUHJvcGVydHl9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAnZ2V0T3duUHJvcGVydHlOYW1lcycsIHt2YWx1ZTogZ2V0T3duUHJvcGVydHlOYW1lc30pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3InLCB7dmFsdWU6IGdldE93blByb3BlcnR5RGVzY3JpcHRvcn0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCAnaGFzT3duUHJvcGVydHknLCB7dmFsdWU6IGhhc093blByb3BlcnR5fSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2ZyZWV6ZScsIHt2YWx1ZTogZnJlZXplfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ3ByZXZlbnRFeHRlbnNpb25zJywge3ZhbHVlOiBwcmV2ZW50RXh0ZW5zaW9uc30pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdzZWFsJywge3ZhbHVlOiBzZWFsfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2tleXMnLCB7dmFsdWU6IGtleXN9KTtcbiAgfVxuICBmdW5jdGlvbiBleHBvcnRTdGFyKG9iamVjdCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmFtZXMgPSAkZ2V0T3duUHJvcGVydHlOYW1lcyhhcmd1bWVudHNbaV0pO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBuYW1lcy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgbmFtZSA9IG5hbWVzW2pdO1xuICAgICAgICBpZiAoaXNTeW1ib2xTdHJpbmcobmFtZSkpXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIChmdW5jdGlvbihtb2QsIG5hbWUpIHtcbiAgICAgICAgICAkZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gbW9kW25hbWVdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkoYXJndW1lbnRzW2ldLCBuYW1lc1tqXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gaXNPYmplY3QoeCkge1xuICAgIHJldHVybiB4ICE9IG51bGwgJiYgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyk7XG4gIH1cbiAgZnVuY3Rpb24gdG9PYmplY3QoeCkge1xuICAgIGlmICh4ID09IG51bGwpXG4gICAgICB0aHJvdyAkVHlwZUVycm9yKCk7XG4gICAgcmV0dXJuICRPYmplY3QoeCk7XG4gIH1cbiAgZnVuY3Rpb24gY2hlY2tPYmplY3RDb2VyY2libGUoYXJndW1lbnQpIHtcbiAgICBpZiAoYXJndW1lbnQgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVmFsdWUgY2Fubm90IGJlIGNvbnZlcnRlZCB0byBhbiBPYmplY3QnKTtcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3VtZW50O1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsU3ltYm9sKGdsb2JhbCwgU3ltYm9sKSB7XG4gICAgaWYgKCFnbG9iYWwuU3ltYm9sKSB7XG4gICAgICBnbG9iYWwuU3ltYm9sID0gU3ltYm9sO1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9scztcbiAgICB9XG4gICAgaWYgKCFnbG9iYWwuU3ltYm9sLml0ZXJhdG9yKSB7XG4gICAgICBnbG9iYWwuU3ltYm9sLml0ZXJhdG9yID0gU3ltYm9sKCdTeW1ib2wuaXRlcmF0b3InKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gc2V0dXBHbG9iYWxzKGdsb2JhbCkge1xuICAgIHBvbHlmaWxsU3ltYm9sKGdsb2JhbCwgU3ltYm9sKTtcbiAgICBnbG9iYWwuUmVmbGVjdCA9IGdsb2JhbC5SZWZsZWN0IHx8IHt9O1xuICAgIGdsb2JhbC5SZWZsZWN0Lmdsb2JhbCA9IGdsb2JhbC5SZWZsZWN0Lmdsb2JhbCB8fCBnbG9iYWw7XG4gICAgcG9seWZpbGxPYmplY3QoZ2xvYmFsLk9iamVjdCk7XG4gIH1cbiAgc2V0dXBHbG9iYWxzKGdsb2JhbCk7XG4gIGdsb2JhbC4kdHJhY2V1clJ1bnRpbWUgPSB7XG4gICAgY2hlY2tPYmplY3RDb2VyY2libGU6IGNoZWNrT2JqZWN0Q29lcmNpYmxlLFxuICAgIGNyZWF0ZVByaXZhdGVOYW1lOiBjcmVhdGVQcml2YXRlTmFtZSxcbiAgICBkZWZpbmVQcm9wZXJ0aWVzOiAkZGVmaW5lUHJvcGVydGllcyxcbiAgICBkZWZpbmVQcm9wZXJ0eTogJGRlZmluZVByb3BlcnR5LFxuICAgIGV4cG9ydFN0YXI6IGV4cG9ydFN0YXIsXG4gICAgZ2V0T3duSGFzaE9iamVjdDogZ2V0T3duSGFzaE9iamVjdCxcbiAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gICAgZ2V0T3duUHJvcGVydHlOYW1lczogJGdldE93blByb3BlcnR5TmFtZXMsXG4gICAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICAgIGlzUHJpdmF0ZU5hbWU6IGlzUHJpdmF0ZU5hbWUsXG4gICAgaXNTeW1ib2xTdHJpbmc6IGlzU3ltYm9sU3RyaW5nLFxuICAgIGtleXM6ICRrZXlzLFxuICAgIHNldHVwR2xvYmFsczogc2V0dXBHbG9iYWxzLFxuICAgIHRvT2JqZWN0OiB0b09iamVjdCxcbiAgICB0b1Byb3BlcnR5OiB0b1Byb3BlcnR5LFxuICAgIHR5cGVvZjogdHlwZU9mXG4gIH07XG59KSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBwYXRoO1xuICBmdW5jdGlvbiByZWxhdGl2ZVJlcXVpcmUoY2FsbGVyUGF0aCwgcmVxdWlyZWRQYXRoKSB7XG4gICAgcGF0aCA9IHBhdGggfHwgdHlwZW9mIHJlcXVpcmUgIT09ICd1bmRlZmluZWQnICYmIHJlcXVpcmUoJ3BhdGgnKTtcbiAgICBmdW5jdGlvbiBpc0RpcmVjdG9yeShwYXRoKSB7XG4gICAgICByZXR1cm4gcGF0aC5zbGljZSgtMSkgPT09ICcvJztcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNBYnNvbHV0ZShwYXRoKSB7XG4gICAgICByZXR1cm4gcGF0aFswXSA9PT0gJy8nO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1JlbGF0aXZlKHBhdGgpIHtcbiAgICAgIHJldHVybiBwYXRoWzBdID09PSAnLic7XG4gICAgfVxuICAgIGlmIChpc0RpcmVjdG9yeShyZXF1aXJlZFBhdGgpIHx8IGlzQWJzb2x1dGUocmVxdWlyZWRQYXRoKSlcbiAgICAgIHJldHVybjtcbiAgICByZXR1cm4gaXNSZWxhdGl2ZShyZXF1aXJlZFBhdGgpID8gcmVxdWlyZShwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKGNhbGxlclBhdGgpLCByZXF1aXJlZFBhdGgpKSA6IHJlcXVpcmUocmVxdWlyZWRQYXRoKTtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUucmVxdWlyZSA9IHJlbGF0aXZlUmVxdWlyZTtcbn0pKCk7XG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgZnVuY3Rpb24gc3ByZWFkKCkge1xuICAgIHZhciBydiA9IFtdLFxuICAgICAgICBqID0gMCxcbiAgICAgICAgaXRlclJlc3VsdDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlVG9TcHJlYWQgPSAkdHJhY2V1clJ1bnRpbWUuY2hlY2tPYmplY3RDb2VyY2libGUoYXJndW1lbnRzW2ldKTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWVUb1NwcmVhZFskdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShTeW1ib2wuaXRlcmF0b3IpXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3Qgc3ByZWFkIG5vbi1pdGVyYWJsZSBvYmplY3QuJyk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlciA9IHZhbHVlVG9TcHJlYWRbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoU3ltYm9sLml0ZXJhdG9yKV0oKTtcbiAgICAgIHdoaWxlICghKGl0ZXJSZXN1bHQgPSBpdGVyLm5leHQoKSkuZG9uZSkge1xuICAgICAgICBydltqKytdID0gaXRlclJlc3VsdC52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJ2O1xuICB9XG4gICR0cmFjZXVyUnVudGltZS5zcHJlYWQgPSBzcHJlYWQ7XG59KSgpO1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciAkT2JqZWN0ID0gT2JqZWN0O1xuICB2YXIgJFR5cGVFcnJvciA9IFR5cGVFcnJvcjtcbiAgdmFyICRjcmVhdGUgPSAkT2JqZWN0LmNyZWF0ZTtcbiAgdmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gJHRyYWNldXJSdW50aW1lLmRlZmluZVByb3BlcnRpZXM7XG4gIHZhciAkZGVmaW5lUHJvcGVydHkgPSAkdHJhY2V1clJ1bnRpbWUuZGVmaW5lUHJvcGVydHk7XG4gIHZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gJHRyYWNldXJSdW50aW1lLmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgdmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gJHRyYWNldXJSdW50aW1lLmdldE93blByb3BlcnR5TmFtZXM7XG4gIHZhciAkZ2V0UHJvdG90eXBlT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciAkX18wID0gT2JqZWN0LFxuICAgICAgZ2V0T3duUHJvcGVydHlOYW1lcyA9ICRfXzAuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgICAgIGdldE93blByb3BlcnR5U3ltYm9scyA9ICRfXzAuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuICBmdW5jdGlvbiBzdXBlckRlc2NyaXB0b3IoaG9tZU9iamVjdCwgbmFtZSkge1xuICAgIHZhciBwcm90byA9ICRnZXRQcm90b3R5cGVPZihob21lT2JqZWN0KTtcbiAgICBkbyB7XG4gICAgICB2YXIgcmVzdWx0ID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90bywgbmFtZSk7XG4gICAgICBpZiAocmVzdWx0KVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgcHJvdG8gPSAkZ2V0UHJvdG90eXBlT2YocHJvdG8pO1xuICAgIH0gd2hpbGUgKHByb3RvKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIHN1cGVyQ29uc3RydWN0b3IoY3Rvcikge1xuICAgIHJldHVybiBjdG9yLl9fcHJvdG9fXztcbiAgfVxuICBmdW5jdGlvbiBzdXBlckNhbGwoc2VsZiwgaG9tZU9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBzdXBlckdldChzZWxmLCBob21lT2JqZWN0LCBuYW1lKS5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxuICBmdW5jdGlvbiBzdXBlckdldChzZWxmLCBob21lT2JqZWN0LCBuYW1lKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBzdXBlckRlc2NyaXB0b3IoaG9tZU9iamVjdCwgbmFtZSk7XG4gICAgaWYgKGRlc2NyaXB0b3IpIHtcbiAgICAgIGlmICghZGVzY3JpcHRvci5nZXQpXG4gICAgICAgIHJldHVybiBkZXNjcmlwdG9yLnZhbHVlO1xuICAgICAgcmV0dXJuIGRlc2NyaXB0b3IuZ2V0LmNhbGwoc2VsZik7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgZnVuY3Rpb24gc3VwZXJTZXQoc2VsZiwgaG9tZU9iamVjdCwgbmFtZSwgdmFsdWUpIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHN1cGVyRGVzY3JpcHRvcihob21lT2JqZWN0LCBuYW1lKTtcbiAgICBpZiAoZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLnNldCkge1xuICAgICAgZGVzY3JpcHRvci5zZXQuY2FsbChzZWxmLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHRocm93ICRUeXBlRXJyb3IoKFwic3VwZXIgaGFzIG5vIHNldHRlciAnXCIgKyBuYW1lICsgXCInLlwiKSk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0RGVzY3JpcHRvcnMob2JqZWN0KSB7XG4gICAgdmFyIGRlc2NyaXB0b3JzID0ge307XG4gICAgdmFyIG5hbWVzID0gZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBuYW1lID0gbmFtZXNbaV07XG4gICAgICBkZXNjcmlwdG9yc1tuYW1lXSA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBuYW1lKTtcbiAgICB9XG4gICAgdmFyIHN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzeW1ib2wgPSBzeW1ib2xzW2ldO1xuICAgICAgZGVzY3JpcHRvcnNbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoc3ltYm9sKV0gPSAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoc3ltYm9sKSk7XG4gICAgfVxuICAgIHJldHVybiBkZXNjcmlwdG9ycztcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVDbGFzcyhjdG9yLCBvYmplY3QsIHN0YXRpY09iamVjdCwgc3VwZXJDbGFzcykge1xuICAgICRkZWZpbmVQcm9wZXJ0eShvYmplY3QsICdjb25zdHJ1Y3RvcicsIHtcbiAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgaWYgKHR5cGVvZiBzdXBlckNsYXNzID09PSAnZnVuY3Rpb24nKVxuICAgICAgICBjdG9yLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9ICRjcmVhdGUoZ2V0UHJvdG9QYXJlbnQoc3VwZXJDbGFzcyksIGdldERlc2NyaXB0b3JzKG9iamVjdCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgICB9XG4gICAgJGRlZmluZVByb3BlcnR5KGN0b3IsICdwcm90b3R5cGUnLCB7XG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfSk7XG4gICAgcmV0dXJuICRkZWZpbmVQcm9wZXJ0aWVzKGN0b3IsIGdldERlc2NyaXB0b3JzKHN0YXRpY09iamVjdCkpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFByb3RvUGFyZW50KHN1cGVyQ2xhc3MpIHtcbiAgICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBwcm90b3R5cGUgPSBzdXBlckNsYXNzLnByb3RvdHlwZTtcbiAgICAgIGlmICgkT2JqZWN0KHByb3RvdHlwZSkgPT09IHByb3RvdHlwZSB8fCBwcm90b3R5cGUgPT09IG51bGwpXG4gICAgICAgIHJldHVybiBzdXBlckNsYXNzLnByb3RvdHlwZTtcbiAgICAgIHRocm93IG5ldyAkVHlwZUVycm9yKCdzdXBlciBwcm90b3R5cGUgbXVzdCBiZSBhbiBPYmplY3Qgb3IgbnVsbCcpO1xuICAgIH1cbiAgICBpZiAoc3VwZXJDbGFzcyA9PT0gbnVsbClcbiAgICAgIHJldHVybiBudWxsO1xuICAgIHRocm93IG5ldyAkVHlwZUVycm9yKChcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyArIFwiLlwiKSk7XG4gIH1cbiAgZnVuY3Rpb24gZGVmYXVsdFN1cGVyQ2FsbChzZWxmLCBob21lT2JqZWN0LCBhcmdzKSB7XG4gICAgaWYgKCRnZXRQcm90b3R5cGVPZihob21lT2JqZWN0KSAhPT0gbnVsbClcbiAgICAgIHN1cGVyQ2FsbChzZWxmLCBob21lT2JqZWN0LCAnY29uc3RydWN0b3InLCBhcmdzKTtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MgPSBjcmVhdGVDbGFzcztcbiAgJHRyYWNldXJSdW50aW1lLmRlZmF1bHRTdXBlckNhbGwgPSBkZWZhdWx0U3VwZXJDYWxsO1xuICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsID0gc3VwZXJDYWxsO1xuICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJDb25zdHJ1Y3RvciA9IHN1cGVyQ29uc3RydWN0b3I7XG4gICR0cmFjZXVyUnVudGltZS5zdXBlckdldCA9IHN1cGVyR2V0O1xuICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJTZXQgPSBzdXBlclNldDtcbn0pKCk7XG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgaWYgKHR5cGVvZiAkdHJhY2V1clJ1bnRpbWUgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd0cmFjZXVyIHJ1bnRpbWUgbm90IGZvdW5kLicpO1xuICB9XG4gIHZhciBjcmVhdGVQcml2YXRlTmFtZSA9ICR0cmFjZXVyUnVudGltZS5jcmVhdGVQcml2YXRlTmFtZTtcbiAgdmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gJHRyYWNldXJSdW50aW1lLmRlZmluZVByb3BlcnRpZXM7XG4gIHZhciAkZGVmaW5lUHJvcGVydHkgPSAkdHJhY2V1clJ1bnRpbWUuZGVmaW5lUHJvcGVydHk7XG4gIHZhciAkY3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcbiAgdmFyICRUeXBlRXJyb3IgPSBUeXBlRXJyb3I7XG4gIGZ1bmN0aW9uIG5vbkVudW0odmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH07XG4gIH1cbiAgdmFyIFNUX05FV0JPUk4gPSAwO1xuICB2YXIgU1RfRVhFQ1VUSU5HID0gMTtcbiAgdmFyIFNUX1NVU1BFTkRFRCA9IDI7XG4gIHZhciBTVF9DTE9TRUQgPSAzO1xuICB2YXIgRU5EX1NUQVRFID0gLTI7XG4gIHZhciBSRVRIUk9XX1NUQVRFID0gLTM7XG4gIGZ1bmN0aW9uIGdldEludGVybmFsRXJyb3Ioc3RhdGUpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKCdUcmFjZXVyIGNvbXBpbGVyIGJ1ZzogaW52YWxpZCBzdGF0ZSBpbiBzdGF0ZSBtYWNoaW5lOiAnICsgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckNvbnRleHQoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IDA7XG4gICAgdGhpcy5HU3RhdGUgPSBTVF9ORVdCT1JOO1xuICAgIHRoaXMuc3RvcmVkRXhjZXB0aW9uID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZmluYWxseUZhbGxUaHJvdWdoID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2VudF8gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5yZXR1cm5WYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRyeVN0YWNrXyA9IFtdO1xuICB9XG4gIEdlbmVyYXRvckNvbnRleHQucHJvdG90eXBlID0ge1xuICAgIHB1c2hUcnk6IGZ1bmN0aW9uKGNhdGNoU3RhdGUsIGZpbmFsbHlTdGF0ZSkge1xuICAgICAgaWYgKGZpbmFsbHlTdGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgZmluYWxseUZhbGxUaHJvdWdoID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5U3RhY2tfLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKHRoaXMudHJ5U3RhY2tfW2ldLmNhdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZpbmFsbHlGYWxsVGhyb3VnaCA9IHRoaXMudHJ5U3RhY2tfW2ldLmNhdGNoO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChmaW5hbGx5RmFsbFRocm91Z2ggPT09IG51bGwpXG4gICAgICAgICAgZmluYWxseUZhbGxUaHJvdWdoID0gUkVUSFJPV19TVEFURTtcbiAgICAgICAgdGhpcy50cnlTdGFja18ucHVzaCh7XG4gICAgICAgICAgZmluYWxseTogZmluYWxseVN0YXRlLFxuICAgICAgICAgIGZpbmFsbHlGYWxsVGhyb3VnaDogZmluYWxseUZhbGxUaHJvdWdoXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGNhdGNoU3RhdGUgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy50cnlTdGFja18ucHVzaCh7Y2F0Y2g6IGNhdGNoU3RhdGV9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHBvcFRyeTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnRyeVN0YWNrXy5wb3AoKTtcbiAgICB9LFxuICAgIGdldCBzZW50KCkge1xuICAgICAgdGhpcy5tYXliZVRocm93KCk7XG4gICAgICByZXR1cm4gdGhpcy5zZW50XztcbiAgICB9LFxuICAgIHNldCBzZW50KHYpIHtcbiAgICAgIHRoaXMuc2VudF8gPSB2O1xuICAgIH0sXG4gICAgZ2V0IHNlbnRJZ25vcmVUaHJvdygpIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbnRfO1xuICAgIH0sXG4gICAgbWF5YmVUaHJvdzogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5hY3Rpb24gPT09ICd0aHJvdycpIHtcbiAgICAgICAgdGhpcy5hY3Rpb24gPSAnbmV4dCc7XG4gICAgICAgIHRocm93IHRoaXMuc2VudF87XG4gICAgICB9XG4gICAgfSxcbiAgICBlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICAgIGNhc2UgRU5EX1NUQVRFOlxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICBjYXNlIFJFVEhST1dfU1RBVEU6XG4gICAgICAgICAgdGhyb3cgdGhpcy5zdG9yZWRFeGNlcHRpb247XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgZ2V0SW50ZXJuYWxFcnJvcih0aGlzLnN0YXRlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZUV4Y2VwdGlvbjogZnVuY3Rpb24oZXgpIHtcbiAgICAgIHRoaXMuR1N0YXRlID0gU1RfQ0xPU0VEO1xuICAgICAgdGhpcy5zdGF0ZSA9IEVORF9TVEFURTtcbiAgICAgIHRocm93IGV4O1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gbmV4dE9yVGhyb3coY3R4LCBtb3ZlTmV4dCwgYWN0aW9uLCB4KSB7XG4gICAgc3dpdGNoIChjdHguR1N0YXRlKSB7XG4gICAgICBjYXNlIFNUX0VYRUNVVElORzpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKChcIlxcXCJcIiArIGFjdGlvbiArIFwiXFxcIiBvbiBleGVjdXRpbmcgZ2VuZXJhdG9yXCIpKTtcbiAgICAgIGNhc2UgU1RfQ0xPU0VEOlxuICAgICAgICBpZiAoYWN0aW9uID09ICduZXh0Jykge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgZG9uZTogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgeDtcbiAgICAgIGNhc2UgU1RfTkVXQk9STjpcbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3Rocm93Jykge1xuICAgICAgICAgIGN0eC5HU3RhdGUgPSBTVF9DTE9TRUQ7XG4gICAgICAgICAgdGhyb3cgeDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoeCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgIHRocm93ICRUeXBlRXJyb3IoJ1NlbnQgdmFsdWUgdG8gbmV3Ym9ybiBnZW5lcmF0b3InKTtcbiAgICAgIGNhc2UgU1RfU1VTUEVOREVEOlxuICAgICAgICBjdHguR1N0YXRlID0gU1RfRVhFQ1VUSU5HO1xuICAgICAgICBjdHguYWN0aW9uID0gYWN0aW9uO1xuICAgICAgICBjdHguc2VudCA9IHg7XG4gICAgICAgIHZhciB2YWx1ZSA9IG1vdmVOZXh0KGN0eCk7XG4gICAgICAgIHZhciBkb25lID0gdmFsdWUgPT09IGN0eDtcbiAgICAgICAgaWYgKGRvbmUpXG4gICAgICAgICAgdmFsdWUgPSBjdHgucmV0dXJuVmFsdWU7XG4gICAgICAgIGN0eC5HU3RhdGUgPSBkb25lID8gU1RfQ0xPU0VEIDogU1RfU1VTUEVOREVEO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBkb25lOiBkb25lXG4gICAgICAgIH07XG4gICAgfVxuICB9XG4gIHZhciBjdHhOYW1lID0gY3JlYXRlUHJpdmF0ZU5hbWUoKTtcbiAgdmFyIG1vdmVOZXh0TmFtZSA9IGNyZWF0ZVByaXZhdGVOYW1lKCk7XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgJGRlZmluZVByb3BlcnR5KEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLCAnY29uc3RydWN0b3InLCBub25FbnVtKEdlbmVyYXRvckZ1bmN0aW9uKSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsXG4gICAgbmV4dDogZnVuY3Rpb24odikge1xuICAgICAgcmV0dXJuIG5leHRPclRocm93KHRoaXNbY3R4TmFtZV0sIHRoaXNbbW92ZU5leHROYW1lXSwgJ25leHQnLCB2KTtcbiAgICB9LFxuICAgIHRocm93OiBmdW5jdGlvbih2KSB7XG4gICAgICByZXR1cm4gbmV4dE9yVGhyb3codGhpc1tjdHhOYW1lXSwgdGhpc1ttb3ZlTmV4dE5hbWVdLCAndGhyb3cnLCB2KTtcbiAgICB9XG4gIH07XG4gICRkZWZpbmVQcm9wZXJ0aWVzKEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7ZW51bWVyYWJsZTogZmFsc2V9LFxuICAgIG5leHQ6IHtlbnVtZXJhYmxlOiBmYWxzZX0sXG4gICAgdGhyb3c6IHtlbnVtZXJhYmxlOiBmYWxzZX1cbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUsIFN5bWJvbC5pdGVyYXRvciwgbm9uRW51bShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSkpO1xuICBmdW5jdGlvbiBjcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShpbm5lckZ1bmN0aW9uLCBmdW5jdGlvbk9iamVjdCwgc2VsZikge1xuICAgIHZhciBtb3ZlTmV4dCA9IGdldE1vdmVOZXh0KGlubmVyRnVuY3Rpb24sIHNlbGYpO1xuICAgIHZhciBjdHggPSBuZXcgR2VuZXJhdG9yQ29udGV4dCgpO1xuICAgIHZhciBvYmplY3QgPSAkY3JlYXRlKGZ1bmN0aW9uT2JqZWN0LnByb3RvdHlwZSk7XG4gICAgb2JqZWN0W2N0eE5hbWVdID0gY3R4O1xuICAgIG9iamVjdFttb3ZlTmV4dE5hbWVdID0gbW92ZU5leHQ7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBmdW5jdGlvbiBpbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb25PYmplY3QpIHtcbiAgICBmdW5jdGlvbk9iamVjdC5wcm90b3R5cGUgPSAkY3JlYXRlKEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSk7XG4gICAgZnVuY3Rpb25PYmplY3QuX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgcmV0dXJuIGZ1bmN0aW9uT2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIEFzeW5jRnVuY3Rpb25Db250ZXh0KCkge1xuICAgIEdlbmVyYXRvckNvbnRleHQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVyciA9IHVuZGVmaW5lZDtcbiAgICB2YXIgY3R4ID0gdGhpcztcbiAgICBjdHgucmVzdWx0ID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBjdHgucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICBjdHgucmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuICB9XG4gIEFzeW5jRnVuY3Rpb25Db250ZXh0LnByb3RvdHlwZSA9ICRjcmVhdGUoR2VuZXJhdG9yQ29udGV4dC5wcm90b3R5cGUpO1xuICBBc3luY0Z1bmN0aW9uQ29udGV4dC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICBjYXNlIEVORF9TVEFURTpcbiAgICAgICAgdGhpcy5yZXNvbHZlKHRoaXMucmV0dXJuVmFsdWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUkVUSFJPV19TVEFURTpcbiAgICAgICAgdGhpcy5yZWplY3QodGhpcy5zdG9yZWRFeGNlcHRpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMucmVqZWN0KGdldEludGVybmFsRXJyb3IodGhpcy5zdGF0ZSkpO1xuICAgIH1cbiAgfTtcbiAgQXN5bmNGdW5jdGlvbkNvbnRleHQucHJvdG90eXBlLmhhbmRsZUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RhdGUgPSBSRVRIUk9XX1NUQVRFO1xuICB9O1xuICBmdW5jdGlvbiBhc3luY1dyYXAoaW5uZXJGdW5jdGlvbiwgc2VsZikge1xuICAgIHZhciBtb3ZlTmV4dCA9IGdldE1vdmVOZXh0KGlubmVyRnVuY3Rpb24sIHNlbGYpO1xuICAgIHZhciBjdHggPSBuZXcgQXN5bmNGdW5jdGlvbkNvbnRleHQoKTtcbiAgICBjdHguY3JlYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGN0eC5zdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgICBjdHgudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgbW92ZU5leHQoY3R4KTtcbiAgICAgIH07XG4gICAgfTtcbiAgICBjdHguZXJyYmFjayA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgaGFuZGxlQ2F0Y2goY3R4LCBlcnIpO1xuICAgICAgbW92ZU5leHQoY3R4KTtcbiAgICB9O1xuICAgIG1vdmVOZXh0KGN0eCk7XG4gICAgcmV0dXJuIGN0eC5yZXN1bHQ7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TW92ZU5leHQoaW5uZXJGdW5jdGlvbiwgc2VsZikge1xuICAgIHJldHVybiBmdW5jdGlvbihjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIGlubmVyRnVuY3Rpb24uY2FsbChzZWxmLCBjdHgpO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIGhhbmRsZUNhdGNoKGN0eCwgZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVDYXRjaChjdHgsIGV4KSB7XG4gICAgY3R4LnN0b3JlZEV4Y2VwdGlvbiA9IGV4O1xuICAgIHZhciBsYXN0ID0gY3R4LnRyeVN0YWNrX1tjdHgudHJ5U3RhY2tfLmxlbmd0aCAtIDFdO1xuICAgIGlmICghbGFzdCkge1xuICAgICAgY3R4LmhhbmRsZUV4Y2VwdGlvbihleCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGN0eC5zdGF0ZSA9IGxhc3QuY2F0Y2ggIT09IHVuZGVmaW5lZCA/IGxhc3QuY2F0Y2ggOiBsYXN0LmZpbmFsbHk7XG4gICAgaWYgKGxhc3QuZmluYWxseUZhbGxUaHJvdWdoICE9PSB1bmRlZmluZWQpXG4gICAgICBjdHguZmluYWxseUZhbGxUaHJvdWdoID0gbGFzdC5maW5hbGx5RmFsbFRocm91Z2g7XG4gIH1cbiAgJHRyYWNldXJSdW50aW1lLmFzeW5jV3JhcCA9IGFzeW5jV3JhcDtcbiAgJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbiA9IGluaXRHZW5lcmF0b3JGdW5jdGlvbjtcbiAgJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlID0gY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2U7XG59KSgpO1xuKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBidWlsZEZyb21FbmNvZGVkUGFydHMob3B0X3NjaGVtZSwgb3B0X3VzZXJJbmZvLCBvcHRfZG9tYWluLCBvcHRfcG9ydCwgb3B0X3BhdGgsIG9wdF9xdWVyeURhdGEsIG9wdF9mcmFnbWVudCkge1xuICAgIHZhciBvdXQgPSBbXTtcbiAgICBpZiAob3B0X3NjaGVtZSkge1xuICAgICAgb3V0LnB1c2gob3B0X3NjaGVtZSwgJzonKTtcbiAgICB9XG4gICAgaWYgKG9wdF9kb21haW4pIHtcbiAgICAgIG91dC5wdXNoKCcvLycpO1xuICAgICAgaWYgKG9wdF91c2VySW5mbykge1xuICAgICAgICBvdXQucHVzaChvcHRfdXNlckluZm8sICdAJyk7XG4gICAgICB9XG4gICAgICBvdXQucHVzaChvcHRfZG9tYWluKTtcbiAgICAgIGlmIChvcHRfcG9ydCkge1xuICAgICAgICBvdXQucHVzaCgnOicsIG9wdF9wb3J0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdF9wYXRoKSB7XG4gICAgICBvdXQucHVzaChvcHRfcGF0aCk7XG4gICAgfVxuICAgIGlmIChvcHRfcXVlcnlEYXRhKSB7XG4gICAgICBvdXQucHVzaCgnPycsIG9wdF9xdWVyeURhdGEpO1xuICAgIH1cbiAgICBpZiAob3B0X2ZyYWdtZW50KSB7XG4gICAgICBvdXQucHVzaCgnIycsIG9wdF9mcmFnbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBvdXQuam9pbignJyk7XG4gIH1cbiAgO1xuICB2YXIgc3BsaXRSZSA9IG5ldyBSZWdFeHAoJ14nICsgJyg/OicgKyAnKFteOi8/Iy5dKyknICsgJzopPycgKyAnKD86Ly8nICsgJyg/OihbXi8/I10qKUApPycgKyAnKFtcXFxcd1xcXFxkXFxcXC1cXFxcdTAxMDAtXFxcXHVmZmZmLiVdKiknICsgJyg/OjooWzAtOV0rKSk/JyArICcpPycgKyAnKFtePyNdKyk/JyArICcoPzpcXFxcPyhbXiNdKikpPycgKyAnKD86IyguKikpPycgKyAnJCcpO1xuICB2YXIgQ29tcG9uZW50SW5kZXggPSB7XG4gICAgU0NIRU1FOiAxLFxuICAgIFVTRVJfSU5GTzogMixcbiAgICBET01BSU46IDMsXG4gICAgUE9SVDogNCxcbiAgICBQQVRIOiA1LFxuICAgIFFVRVJZX0RBVEE6IDYsXG4gICAgRlJBR01FTlQ6IDdcbiAgfTtcbiAgZnVuY3Rpb24gc3BsaXQodXJpKSB7XG4gICAgcmV0dXJuICh1cmkubWF0Y2goc3BsaXRSZSkpO1xuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZURvdFNlZ21lbnRzKHBhdGgpIHtcbiAgICBpZiAocGF0aCA9PT0gJy8nKVxuICAgICAgcmV0dXJuICcvJztcbiAgICB2YXIgbGVhZGluZ1NsYXNoID0gcGF0aFswXSA9PT0gJy8nID8gJy8nIDogJyc7XG4gICAgdmFyIHRyYWlsaW5nU2xhc2ggPSBwYXRoLnNsaWNlKC0xKSA9PT0gJy8nID8gJy8nIDogJyc7XG4gICAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xuICAgIHZhciBvdXQgPSBbXTtcbiAgICB2YXIgdXAgPSAwO1xuICAgIGZvciAodmFyIHBvcyA9IDA7IHBvcyA8IHNlZ21lbnRzLmxlbmd0aDsgcG9zKyspIHtcbiAgICAgIHZhciBzZWdtZW50ID0gc2VnbWVudHNbcG9zXTtcbiAgICAgIHN3aXRjaCAoc2VnbWVudCkge1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICcuJzpcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnLi4nOlxuICAgICAgICAgIGlmIChvdXQubGVuZ3RoKVxuICAgICAgICAgICAgb3V0LnBvcCgpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHVwKys7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgb3V0LnB1c2goc2VnbWVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbGVhZGluZ1NsYXNoKSB7XG4gICAgICB3aGlsZSAodXAtLSA+IDApIHtcbiAgICAgICAgb3V0LnVuc2hpZnQoJy4uJyk7XG4gICAgICB9XG4gICAgICBpZiAob3V0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgb3V0LnB1c2goJy4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGxlYWRpbmdTbGFzaCArIG91dC5qb2luKCcvJykgKyB0cmFpbGluZ1NsYXNoO1xuICB9XG4gIGZ1bmN0aW9uIGpvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKSB7XG4gICAgdmFyIHBhdGggPSBwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXSB8fCAnJztcbiAgICBwYXRoID0gcmVtb3ZlRG90U2VnbWVudHMocGF0aCk7XG4gICAgcGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF0gPSBwYXRoO1xuICAgIHJldHVybiBidWlsZEZyb21FbmNvZGVkUGFydHMocGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXSwgcGFydHNbQ29tcG9uZW50SW5kZXguVVNFUl9JTkZPXSwgcGFydHNbQ29tcG9uZW50SW5kZXguRE9NQUlOXSwgcGFydHNbQ29tcG9uZW50SW5kZXguUE9SVF0sIHBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdLCBwYXJ0c1tDb21wb25lbnRJbmRleC5RVUVSWV9EQVRBXSwgcGFydHNbQ29tcG9uZW50SW5kZXguRlJBR01FTlRdKTtcbiAgfVxuICBmdW5jdGlvbiBjYW5vbmljYWxpemVVcmwodXJsKSB7XG4gICAgdmFyIHBhcnRzID0gc3BsaXQodXJsKTtcbiAgICByZXR1cm4gam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgocGFydHMpO1xuICB9XG4gIGZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgdXJsKSB7XG4gICAgdmFyIHBhcnRzID0gc3BsaXQodXJsKTtcbiAgICB2YXIgYmFzZVBhcnRzID0gc3BsaXQoYmFzZSk7XG4gICAgaWYgKHBhcnRzW0NvbXBvbmVudEluZGV4LlNDSEVNRV0pIHtcbiAgICAgIHJldHVybiBqb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzW0NvbXBvbmVudEluZGV4LlNDSEVNRV0gPSBiYXNlUGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IENvbXBvbmVudEluZGV4LlNDSEVNRTsgaSA8PSBDb21wb25lbnRJbmRleC5QT1JUOyBpKyspIHtcbiAgICAgIGlmICghcGFydHNbaV0pIHtcbiAgICAgICAgcGFydHNbaV0gPSBiYXNlUGFydHNbaV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXVswXSA9PSAnLycpIHtcbiAgICAgIHJldHVybiBqb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gICAgfVxuICAgIHZhciBwYXRoID0gYmFzZVBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdO1xuICAgIHZhciBpbmRleCA9IHBhdGgubGFzdEluZGV4T2YoJy8nKTtcbiAgICBwYXRoID0gcGF0aC5zbGljZSgwLCBpbmRleCArIDEpICsgcGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF07XG4gICAgcGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF0gPSBwYXRoO1xuICAgIHJldHVybiBqb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gIH1cbiAgZnVuY3Rpb24gaXNBYnNvbHV0ZShuYW1lKSB7XG4gICAgaWYgKCFuYW1lKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChuYW1lWzBdID09PSAnLycpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB2YXIgcGFydHMgPSBzcGxpdChuYW1lKTtcbiAgICBpZiAocGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXSlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUuY2Fub25pY2FsaXplVXJsID0gY2Fub25pY2FsaXplVXJsO1xuICAkdHJhY2V1clJ1bnRpbWUuaXNBYnNvbHV0ZSA9IGlzQWJzb2x1dGU7XG4gICR0cmFjZXVyUnVudGltZS5yZW1vdmVEb3RTZWdtZW50cyA9IHJlbW92ZURvdFNlZ21lbnRzO1xuICAkdHJhY2V1clJ1bnRpbWUucmVzb2x2ZVVybCA9IHJlc29sdmVVcmw7XG59KSgpO1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciB0eXBlcyA9IHtcbiAgICBhbnk6IHtuYW1lOiAnYW55J30sXG4gICAgYm9vbGVhbjoge25hbWU6ICdib29sZWFuJ30sXG4gICAgbnVtYmVyOiB7bmFtZTogJ251bWJlcid9LFxuICAgIHN0cmluZzoge25hbWU6ICdzdHJpbmcnfSxcbiAgICBzeW1ib2w6IHtuYW1lOiAnc3ltYm9sJ30sXG4gICAgdm9pZDoge25hbWU6ICd2b2lkJ31cbiAgfTtcbiAgdmFyIEdlbmVyaWNUeXBlID0gZnVuY3Rpb24gR2VuZXJpY1R5cGUodHlwZSwgYXJndW1lbnRUeXBlcykge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5hcmd1bWVudFR5cGVzID0gYXJndW1lbnRUeXBlcztcbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoR2VuZXJpY1R5cGUsIHt9LCB7fSk7XG4gIHZhciB0eXBlUmVnaXN0ZXIgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBmdW5jdGlvbiBnZW5lcmljVHlwZSh0eXBlKSB7XG4gICAgZm9yICh2YXIgYXJndW1lbnRUeXBlcyA9IFtdLFxuICAgICAgICAkX18xID0gMTsgJF9fMSA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfXzErKylcbiAgICAgIGFyZ3VtZW50VHlwZXNbJF9fMSAtIDFdID0gYXJndW1lbnRzWyRfXzFdO1xuICAgIHZhciB0eXBlTWFwID0gdHlwZVJlZ2lzdGVyO1xuICAgIHZhciBrZXkgPSAkdHJhY2V1clJ1bnRpbWUuZ2V0T3duSGFzaE9iamVjdCh0eXBlKS5oYXNoO1xuICAgIGlmICghdHlwZU1hcFtrZXldKSB7XG4gICAgICB0eXBlTWFwW2tleV0gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIH1cbiAgICB0eXBlTWFwID0gdHlwZU1hcFtrZXldO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRUeXBlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIGtleSA9ICR0cmFjZXVyUnVudGltZS5nZXRPd25IYXNoT2JqZWN0KGFyZ3VtZW50VHlwZXNbaV0pLmhhc2g7XG4gICAgICBpZiAoIXR5cGVNYXBba2V5XSkge1xuICAgICAgICB0eXBlTWFwW2tleV0gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgfVxuICAgICAgdHlwZU1hcCA9IHR5cGVNYXBba2V5XTtcbiAgICB9XG4gICAgdmFyIHRhaWwgPSBhcmd1bWVudFR5cGVzW2FyZ3VtZW50VHlwZXMubGVuZ3RoIC0gMV07XG4gICAga2V5ID0gJHRyYWNldXJSdW50aW1lLmdldE93bkhhc2hPYmplY3QodGFpbCkuaGFzaDtcbiAgICBpZiAoIXR5cGVNYXBba2V5XSkge1xuICAgICAgdHlwZU1hcFtrZXldID0gbmV3IEdlbmVyaWNUeXBlKHR5cGUsIGFyZ3VtZW50VHlwZXMpO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZU1hcFtrZXldO1xuICB9XG4gICR0cmFjZXVyUnVudGltZS5HZW5lcmljVHlwZSA9IEdlbmVyaWNUeXBlO1xuICAkdHJhY2V1clJ1bnRpbWUuZ2VuZXJpY1R5cGUgPSBnZW5lcmljVHlwZTtcbiAgJHRyYWNldXJSdW50aW1lLnR5cGUgPSB0eXBlcztcbn0pKCk7XG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyICRfXzIgPSAkdHJhY2V1clJ1bnRpbWUsXG4gICAgICBjYW5vbmljYWxpemVVcmwgPSAkX18yLmNhbm9uaWNhbGl6ZVVybCxcbiAgICAgIHJlc29sdmVVcmwgPSAkX18yLnJlc29sdmVVcmwsXG4gICAgICBpc0Fic29sdXRlID0gJF9fMi5pc0Fic29sdXRlO1xuICB2YXIgbW9kdWxlSW5zdGFudGlhdG9ycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciBiYXNlVVJMO1xuICBpZiAoZ2xvYmFsLmxvY2F0aW9uICYmIGdsb2JhbC5sb2NhdGlvbi5ocmVmKVxuICAgIGJhc2VVUkwgPSByZXNvbHZlVXJsKGdsb2JhbC5sb2NhdGlvbi5ocmVmLCAnLi8nKTtcbiAgZWxzZVxuICAgIGJhc2VVUkwgPSAnJztcbiAgdmFyIFVuY29hdGVkTW9kdWxlRW50cnkgPSBmdW5jdGlvbiBVbmNvYXRlZE1vZHVsZUVudHJ5KHVybCwgdW5jb2F0ZWRNb2R1bGUpIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLnZhbHVlXyA9IHVuY29hdGVkTW9kdWxlO1xuICB9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShVbmNvYXRlZE1vZHVsZUVudHJ5LCB7fSwge30pO1xuICB2YXIgTW9kdWxlRXZhbHVhdGlvbkVycm9yID0gZnVuY3Rpb24gTW9kdWxlRXZhbHVhdGlvbkVycm9yKGVycm9uZW91c01vZHVsZU5hbWUsIGNhdXNlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgJzogJyArIHRoaXMuc3RyaXBDYXVzZShjYXVzZSkgKyAnIGluICcgKyBlcnJvbmVvdXNNb2R1bGVOYW1lO1xuICAgIGlmICghKGNhdXNlIGluc3RhbmNlb2YgJE1vZHVsZUV2YWx1YXRpb25FcnJvcikgJiYgY2F1c2Uuc3RhY2spXG4gICAgICB0aGlzLnN0YWNrID0gdGhpcy5zdHJpcFN0YWNrKGNhdXNlLnN0YWNrKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnN0YWNrID0gJyc7XG4gIH07XG4gIHZhciAkTW9kdWxlRXZhbHVhdGlvbkVycm9yID0gTW9kdWxlRXZhbHVhdGlvbkVycm9yO1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShNb2R1bGVFdmFsdWF0aW9uRXJyb3IsIHtcbiAgICBzdHJpcEVycm9yOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gbWVzc2FnZS5yZXBsYWNlKC8uKkVycm9yOi8sIHRoaXMuY29uc3RydWN0b3IubmFtZSArICc6Jyk7XG4gICAgfSxcbiAgICBzdHJpcENhdXNlOiBmdW5jdGlvbihjYXVzZSkge1xuICAgICAgaWYgKCFjYXVzZSlcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgaWYgKCFjYXVzZS5tZXNzYWdlKVxuICAgICAgICByZXR1cm4gY2F1c2UgKyAnJztcbiAgICAgIHJldHVybiB0aGlzLnN0cmlwRXJyb3IoY2F1c2UubWVzc2FnZSk7XG4gICAgfSxcbiAgICBsb2FkZWRCeTogZnVuY3Rpb24obW9kdWxlTmFtZSkge1xuICAgICAgdGhpcy5zdGFjayArPSAnXFxuIGxvYWRlZCBieSAnICsgbW9kdWxlTmFtZTtcbiAgICB9LFxuICAgIHN0cmlwU3RhY2s6IGZ1bmN0aW9uKGNhdXNlU3RhY2spIHtcbiAgICAgIHZhciBzdGFjayA9IFtdO1xuICAgICAgY2F1c2VTdGFjay5zcGxpdCgnXFxuJykuc29tZSgoZnVuY3Rpb24oZnJhbWUpIHtcbiAgICAgICAgaWYgKC9VbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvci8udGVzdChmcmFtZSkpXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIHN0YWNrLnB1c2goZnJhbWUpO1xuICAgICAgfSkpO1xuICAgICAgc3RhY2tbMF0gPSB0aGlzLnN0cmlwRXJyb3Ioc3RhY2tbMF0pO1xuICAgICAgcmV0dXJuIHN0YWNrLmpvaW4oJ1xcbicpO1xuICAgIH1cbiAgfSwge30sIEVycm9yKTtcbiAgZnVuY3Rpb24gYmVmb3JlTGluZXMobGluZXMsIG51bWJlcikge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgZmlyc3QgPSBudW1iZXIgLSAzO1xuICAgIGlmIChmaXJzdCA8IDApXG4gICAgICBmaXJzdCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IGZpcnN0OyBpIDwgbnVtYmVyOyBpKyspIHtcbiAgICAgIHJlc3VsdC5wdXNoKGxpbmVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBmdW5jdGlvbiBhZnRlckxpbmVzKGxpbmVzLCBudW1iZXIpIHtcbiAgICB2YXIgbGFzdCA9IG51bWJlciArIDE7XG4gICAgaWYgKGxhc3QgPiBsaW5lcy5sZW5ndGggLSAxKVxuICAgICAgbGFzdCA9IGxpbmVzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSBudW1iZXI7IGkgPD0gbGFzdDsgaSsrKSB7XG4gICAgICByZXN1bHQucHVzaChsaW5lc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZnVuY3Rpb24gY29sdW1uU3BhY2luZyhjb2x1bW5zKSB7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sdW1ucyAtIDE7IGkrKykge1xuICAgICAgcmVzdWx0ICs9ICctJztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICB2YXIgVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IgPSBmdW5jdGlvbiBVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcih1cmwsIGZ1bmMpIHtcbiAgICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJDb25zdHJ1Y3RvcigkVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IpLmNhbGwodGhpcywgdXJsLCBudWxsKTtcbiAgICB0aGlzLmZ1bmMgPSBmdW5jO1xuICB9O1xuICB2YXIgJFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yID0gVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3I7XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yLCB7Z2V0VW5jb2F0ZWRNb2R1bGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudmFsdWVfKVxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZV87XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgcmVsYXRpdmVSZXF1aXJlO1xuICAgICAgICBpZiAodHlwZW9mICR0cmFjZXVyUnVudGltZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmVsYXRpdmVSZXF1aXJlID0gJHRyYWNldXJSdW50aW1lLnJlcXVpcmUuYmluZChudWxsLCB0aGlzLnVybCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVfID0gdGhpcy5mdW5jLmNhbGwoZ2xvYmFsLCByZWxhdGl2ZVJlcXVpcmUpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgaWYgKGV4IGluc3RhbmNlb2YgTW9kdWxlRXZhbHVhdGlvbkVycm9yKSB7XG4gICAgICAgICAgZXgubG9hZGVkQnkodGhpcy51cmwpO1xuICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChleC5zdGFjaykge1xuICAgICAgICAgIHZhciBsaW5lcyA9IHRoaXMuZnVuYy50b1N0cmluZygpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICB2YXIgZXZhbGVkID0gW107XG4gICAgICAgICAgZXguc3RhY2suc3BsaXQoJ1xcbicpLnNvbWUoZnVuY3Rpb24oZnJhbWUpIHtcbiAgICAgICAgICAgIGlmIChmcmFtZS5pbmRleE9mKCdVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvci5nZXRVbmNvYXRlZE1vZHVsZScpID4gMClcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB2YXIgbSA9IC8oYXRcXHNbXlxcc10qXFxzKS4qPjooXFxkKik6KFxcZCopXFwpLy5leGVjKGZyYW1lKTtcbiAgICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICAgIHZhciBsaW5lID0gcGFyc2VJbnQobVsyXSwgMTApO1xuICAgICAgICAgICAgICBldmFsZWQgPSBldmFsZWQuY29uY2F0KGJlZm9yZUxpbmVzKGxpbmVzLCBsaW5lKSk7XG4gICAgICAgICAgICAgIGV2YWxlZC5wdXNoKGNvbHVtblNwYWNpbmcobVszXSkgKyAnXicpO1xuICAgICAgICAgICAgICBldmFsZWQgPSBldmFsZWQuY29uY2F0KGFmdGVyTGluZXMobGluZXMsIGxpbmUpKTtcbiAgICAgICAgICAgICAgZXZhbGVkLnB1c2goJz0gPSA9ID0gPSA9ID0gPSA9Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBldmFsZWQucHVzaChmcmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZXguc3RhY2sgPSBldmFsZWQuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IE1vZHVsZUV2YWx1YXRpb25FcnJvcih0aGlzLnVybCwgZXgpO1xuICAgICAgfVxuICAgIH19LCB7fSwgVW5jb2F0ZWRNb2R1bGVFbnRyeSk7XG4gIGZ1bmN0aW9uIGdldFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKG5hbWUpIHtcbiAgICBpZiAoIW5hbWUpXG4gICAgICByZXR1cm47XG4gICAgdmFyIHVybCA9IE1vZHVsZVN0b3JlLm5vcm1hbGl6ZShuYW1lKTtcbiAgICByZXR1cm4gbW9kdWxlSW5zdGFudGlhdG9yc1t1cmxdO1xuICB9XG4gIDtcbiAgdmFyIG1vZHVsZUluc3RhbmNlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciBsaXZlTW9kdWxlU2VudGluZWwgPSB7fTtcbiAgZnVuY3Rpb24gTW9kdWxlKHVuY29hdGVkTW9kdWxlKSB7XG4gICAgdmFyIGlzTGl2ZSA9IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgY29hdGVkTW9kdWxlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh1bmNvYXRlZE1vZHVsZSkuZm9yRWFjaCgoZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGdldHRlcixcbiAgICAgICAgICB2YWx1ZTtcbiAgICAgIGlmIChpc0xpdmUgPT09IGxpdmVNb2R1bGVTZW50aW5lbCkge1xuICAgICAgICB2YXIgZGVzY3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHVuY29hdGVkTW9kdWxlLCBuYW1lKTtcbiAgICAgICAgaWYgKGRlc2NyLmdldClcbiAgICAgICAgICBnZXR0ZXIgPSBkZXNjci5nZXQ7XG4gICAgICB9XG4gICAgICBpZiAoIWdldHRlcikge1xuICAgICAgICB2YWx1ZSA9IHVuY29hdGVkTW9kdWxlW25hbWVdO1xuICAgICAgICBnZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29hdGVkTW9kdWxlLCBuYW1lLCB7XG4gICAgICAgIGdldDogZ2V0dGVyLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9KSk7XG4gICAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKGNvYXRlZE1vZHVsZSk7XG4gICAgcmV0dXJuIGNvYXRlZE1vZHVsZTtcbiAgfVxuICB2YXIgTW9kdWxlU3RvcmUgPSB7XG4gICAgbm9ybWFsaXplOiBmdW5jdGlvbihuYW1lLCByZWZlcmVyTmFtZSwgcmVmZXJlckFkZHJlc3MpIHtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ21vZHVsZSBuYW1lIG11c3QgYmUgYSBzdHJpbmcsIG5vdCAnICsgdHlwZW9mIG5hbWUpO1xuICAgICAgaWYgKGlzQWJzb2x1dGUobmFtZSkpXG4gICAgICAgIHJldHVybiBjYW5vbmljYWxpemVVcmwobmFtZSk7XG4gICAgICBpZiAoL1teXFwuXVxcL1xcLlxcLlxcLy8udGVzdChuYW1lKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21vZHVsZSBuYW1lIGVtYmVkcyAvLi4vOiAnICsgbmFtZSk7XG4gICAgICB9XG4gICAgICBpZiAobmFtZVswXSA9PT0gJy4nICYmIHJlZmVyZXJOYW1lKVxuICAgICAgICByZXR1cm4gcmVzb2x2ZVVybChyZWZlcmVyTmFtZSwgbmFtZSk7XG4gICAgICByZXR1cm4gY2Fub25pY2FsaXplVXJsKG5hbWUpO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihub3JtYWxpemVkTmFtZSkge1xuICAgICAgdmFyIG0gPSBnZXRVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcihub3JtYWxpemVkTmFtZSk7XG4gICAgICBpZiAoIW0pXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB2YXIgbW9kdWxlSW5zdGFuY2UgPSBtb2R1bGVJbnN0YW5jZXNbbS51cmxdO1xuICAgICAgaWYgKG1vZHVsZUluc3RhbmNlKVxuICAgICAgICByZXR1cm4gbW9kdWxlSW5zdGFuY2U7XG4gICAgICBtb2R1bGVJbnN0YW5jZSA9IE1vZHVsZShtLmdldFVuY29hdGVkTW9kdWxlKCksIGxpdmVNb2R1bGVTZW50aW5lbCk7XG4gICAgICByZXR1cm4gbW9kdWxlSW5zdGFuY2VzW20udXJsXSA9IG1vZHVsZUluc3RhbmNlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihub3JtYWxpemVkTmFtZSwgbW9kdWxlKSB7XG4gICAgICBub3JtYWxpemVkTmFtZSA9IFN0cmluZyhub3JtYWxpemVkTmFtZSk7XG4gICAgICBtb2R1bGVJbnN0YW50aWF0b3JzW25vcm1hbGl6ZWROYW1lXSA9IG5ldyBVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcihub3JtYWxpemVkTmFtZSwgKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbW9kdWxlO1xuICAgICAgfSkpO1xuICAgICAgbW9kdWxlSW5zdGFuY2VzW25vcm1hbGl6ZWROYW1lXSA9IG1vZHVsZTtcbiAgICB9LFxuICAgIGdldCBiYXNlVVJMKCkge1xuICAgICAgcmV0dXJuIGJhc2VVUkw7XG4gICAgfSxcbiAgICBzZXQgYmFzZVVSTCh2KSB7XG4gICAgICBiYXNlVVJMID0gU3RyaW5nKHYpO1xuICAgIH0sXG4gICAgcmVnaXN0ZXJNb2R1bGU6IGZ1bmN0aW9uKG5hbWUsIGRlcHMsIGZ1bmMpIHtcbiAgICAgIHZhciBub3JtYWxpemVkTmFtZSA9IE1vZHVsZVN0b3JlLm5vcm1hbGl6ZShuYW1lKTtcbiAgICAgIGlmIChtb2R1bGVJbnN0YW50aWF0b3JzW25vcm1hbGl6ZWROYW1lXSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdkdXBsaWNhdGUgbW9kdWxlIG5hbWVkICcgKyBub3JtYWxpemVkTmFtZSk7XG4gICAgICBtb2R1bGVJbnN0YW50aWF0b3JzW25vcm1hbGl6ZWROYW1lXSA9IG5ldyBVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcihub3JtYWxpemVkTmFtZSwgZnVuYyk7XG4gICAgfSxcbiAgICBidW5kbGVTdG9yZTogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICByZWdpc3RlcjogZnVuY3Rpb24obmFtZSwgZGVwcywgZnVuYykge1xuICAgICAgaWYgKCFkZXBzIHx8ICFkZXBzLmxlbmd0aCAmJiAhZnVuYy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZWdpc3Rlck1vZHVsZShuYW1lLCBkZXBzLCBmdW5jKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYnVuZGxlU3RvcmVbbmFtZV0gPSB7XG4gICAgICAgICAgZGVwczogZGVwcyxcbiAgICAgICAgICBleGVjdXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkX18wID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgdmFyIGRlcE1hcCA9IHt9O1xuICAgICAgICAgICAgZGVwcy5mb3JFYWNoKChmdW5jdGlvbihkZXAsIGluZGV4KSB7XG4gICAgICAgICAgICAgIHJldHVybiBkZXBNYXBbZGVwXSA9ICRfXzBbaW5kZXhdO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgdmFyIHJlZ2lzdHJ5RW50cnkgPSBmdW5jLmNhbGwodGhpcywgZGVwTWFwKTtcbiAgICAgICAgICAgIHJlZ2lzdHJ5RW50cnkuZXhlY3V0ZS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHJlZ2lzdHJ5RW50cnkuZXhwb3J0cztcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRBbm9ueW1vdXNNb2R1bGU6IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgIHJldHVybiBuZXcgTW9kdWxlKGZ1bmMuY2FsbChnbG9iYWwpLCBsaXZlTW9kdWxlU2VudGluZWwpO1xuICAgIH0sXG4gICAgZ2V0Rm9yVGVzdGluZzogZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyICRfXzAgPSB0aGlzO1xuICAgICAgaWYgKCF0aGlzLnRlc3RpbmdQcmVmaXhfKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG1vZHVsZUluc3RhbmNlcykuc29tZSgoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgdmFyIG0gPSAvKHRyYWNldXJAW15cXC9dKlxcLykvLmV4ZWMoa2V5KTtcbiAgICAgICAgICBpZiAobSkge1xuICAgICAgICAgICAgJF9fMC50ZXN0aW5nUHJlZml4XyA9IG1bMV07XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmdldCh0aGlzLnRlc3RpbmdQcmVmaXhfICsgbmFtZSk7XG4gICAgfVxuICB9O1xuICB2YXIgbW9kdWxlU3RvcmVNb2R1bGUgPSBuZXcgTW9kdWxlKHtNb2R1bGVTdG9yZTogTW9kdWxlU3RvcmV9KTtcbiAgTW9kdWxlU3RvcmUuc2V0KCdAdHJhY2V1ci9zcmMvcnVudGltZS9Nb2R1bGVTdG9yZScsIG1vZHVsZVN0b3JlTW9kdWxlKTtcbiAgTW9kdWxlU3RvcmUuc2V0KCdAdHJhY2V1ci9zcmMvcnVudGltZS9Nb2R1bGVTdG9yZS5qcycsIG1vZHVsZVN0b3JlTW9kdWxlKTtcbiAgdmFyIHNldHVwR2xvYmFscyA9ICR0cmFjZXVyUnVudGltZS5zZXR1cEdsb2JhbHM7XG4gICR0cmFjZXVyUnVudGltZS5zZXR1cEdsb2JhbHMgPSBmdW5jdGlvbihnbG9iYWwpIHtcbiAgICBzZXR1cEdsb2JhbHMoZ2xvYmFsKTtcbiAgfTtcbiAgJHRyYWNldXJSdW50aW1lLk1vZHVsZVN0b3JlID0gTW9kdWxlU3RvcmU7XG4gIGdsb2JhbC5TeXN0ZW0gPSB7XG4gICAgcmVnaXN0ZXI6IE1vZHVsZVN0b3JlLnJlZ2lzdGVyLmJpbmQoTW9kdWxlU3RvcmUpLFxuICAgIHJlZ2lzdGVyTW9kdWxlOiBNb2R1bGVTdG9yZS5yZWdpc3Rlck1vZHVsZS5iaW5kKE1vZHVsZVN0b3JlKSxcbiAgICBnZXQ6IE1vZHVsZVN0b3JlLmdldCxcbiAgICBzZXQ6IE1vZHVsZVN0b3JlLnNldCxcbiAgICBub3JtYWxpemU6IE1vZHVsZVN0b3JlLm5vcm1hbGl6ZVxuICB9O1xuICAkdHJhY2V1clJ1bnRpbWUuZ2V0TW9kdWxlSW1wbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW5zdGFudGlhdG9yID0gZ2V0VW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IobmFtZSk7XG4gICAgcmV0dXJuIGluc3RhbnRpYXRvciAmJiBpbnN0YW50aWF0b3IuZ2V0VW5jb2F0ZWRNb2R1bGUoKTtcbiAgfTtcbn0pKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG5TeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlscy5qc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlscy5qc1wiO1xuICB2YXIgJGNlaWwgPSBNYXRoLmNlaWw7XG4gIHZhciAkZmxvb3IgPSBNYXRoLmZsb29yO1xuICB2YXIgJGlzRmluaXRlID0gaXNGaW5pdGU7XG4gIHZhciAkaXNOYU4gPSBpc05hTjtcbiAgdmFyICRwb3cgPSBNYXRoLnBvdztcbiAgdmFyICRtaW4gPSBNYXRoLm1pbjtcbiAgdmFyIHRvT2JqZWN0ID0gJHRyYWNldXJSdW50aW1lLnRvT2JqZWN0O1xuICBmdW5jdGlvbiB0b1VpbnQzMih4KSB7XG4gICAgcmV0dXJuIHggPj4+IDA7XG4gIH1cbiAgZnVuY3Rpb24gaXNPYmplY3QoeCkge1xuICAgIHJldHVybiB4ICYmICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbicpO1xuICB9XG4gIGZ1bmN0aW9uIGlzQ2FsbGFibGUoeCkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuICBmdW5jdGlvbiBpc051bWJlcih4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnbnVtYmVyJztcbiAgfVxuICBmdW5jdGlvbiB0b0ludGVnZXIoeCkge1xuICAgIHggPSAreDtcbiAgICBpZiAoJGlzTmFOKHgpKVxuICAgICAgcmV0dXJuIDA7XG4gICAgaWYgKHggPT09IDAgfHwgISRpc0Zpbml0ZSh4KSlcbiAgICAgIHJldHVybiB4O1xuICAgIHJldHVybiB4ID4gMCA/ICRmbG9vcih4KSA6ICRjZWlsKHgpO1xuICB9XG4gIHZhciBNQVhfU0FGRV9MRU5HVEggPSAkcG93KDIsIDUzKSAtIDE7XG4gIGZ1bmN0aW9uIHRvTGVuZ3RoKHgpIHtcbiAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHgpO1xuICAgIHJldHVybiBsZW4gPCAwID8gMCA6ICRtaW4obGVuLCBNQVhfU0FGRV9MRU5HVEgpO1xuICB9XG4gIGZ1bmN0aW9uIGNoZWNrSXRlcmFibGUoeCkge1xuICAgIHJldHVybiAhaXNPYmplY3QoeCkgPyB1bmRlZmluZWQgOiB4W1N5bWJvbC5pdGVyYXRvcl07XG4gIH1cbiAgZnVuY3Rpb24gaXNDb25zdHJ1Y3Rvcih4KSB7XG4gICAgcmV0dXJuIGlzQ2FsbGFibGUoeCk7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodmFsdWUsIGRvbmUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZG9uZTogZG9uZVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVEZWZpbmUob2JqZWN0LCBuYW1lLCBkZXNjcikge1xuICAgIGlmICghKG5hbWUgaW4gb2JqZWN0KSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwgZGVzY3IpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBtYXliZURlZmluZU1ldGhvZChvYmplY3QsIG5hbWUsIHZhbHVlKSB7XG4gICAgbWF5YmVEZWZpbmUob2JqZWN0LCBuYW1lLCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVEZWZpbmVDb25zdChvYmplY3QsIG5hbWUsIHZhbHVlKSB7XG4gICAgbWF5YmVEZWZpbmUob2JqZWN0LCBuYW1lLCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZUFkZEZ1bmN0aW9ucyhvYmplY3QsIGZ1bmN0aW9ucykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZnVuY3Rpb25zLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICB2YXIgbmFtZSA9IGZ1bmN0aW9uc1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IGZ1bmN0aW9uc1tpICsgMV07XG4gICAgICBtYXliZURlZmluZU1ldGhvZChvYmplY3QsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBZGRDb25zdHMob2JqZWN0LCBjb25zdHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnN0cy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgdmFyIG5hbWUgPSBjb25zdHNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBjb25zdHNbaSArIDFdO1xuICAgICAgbWF5YmVEZWZpbmVDb25zdChvYmplY3QsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBZGRJdGVyYXRvcihvYmplY3QsIGZ1bmMsIFN5bWJvbCkge1xuICAgIGlmICghU3ltYm9sIHx8ICFTeW1ib2wuaXRlcmF0b3IgfHwgb2JqZWN0W1N5bWJvbC5pdGVyYXRvcl0pXG4gICAgICByZXR1cm47XG4gICAgaWYgKG9iamVjdFsnQEBpdGVyYXRvciddKVxuICAgICAgZnVuYyA9IG9iamVjdFsnQEBpdGVyYXRvciddO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgICAgdmFsdWU6IGZ1bmMsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgdmFyIHBvbHlmaWxscyA9IFtdO1xuICBmdW5jdGlvbiByZWdpc3RlclBvbHlmaWxsKGZ1bmMpIHtcbiAgICBwb2x5ZmlsbHMucHVzaChmdW5jKTtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbEFsbChnbG9iYWwpIHtcbiAgICBwb2x5ZmlsbHMuZm9yRWFjaCgoZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGYoZ2xvYmFsKTtcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBnZXQgdG9PYmplY3QoKSB7XG4gICAgICByZXR1cm4gdG9PYmplY3Q7XG4gICAgfSxcbiAgICBnZXQgdG9VaW50MzIoKSB7XG4gICAgICByZXR1cm4gdG9VaW50MzI7XG4gICAgfSxcbiAgICBnZXQgaXNPYmplY3QoKSB7XG4gICAgICByZXR1cm4gaXNPYmplY3Q7XG4gICAgfSxcbiAgICBnZXQgaXNDYWxsYWJsZSgpIHtcbiAgICAgIHJldHVybiBpc0NhbGxhYmxlO1xuICAgIH0sXG4gICAgZ2V0IGlzTnVtYmVyKCkge1xuICAgICAgcmV0dXJuIGlzTnVtYmVyO1xuICAgIH0sXG4gICAgZ2V0IHRvSW50ZWdlcigpIHtcbiAgICAgIHJldHVybiB0b0ludGVnZXI7XG4gICAgfSxcbiAgICBnZXQgdG9MZW5ndGgoKSB7XG4gICAgICByZXR1cm4gdG9MZW5ndGg7XG4gICAgfSxcbiAgICBnZXQgY2hlY2tJdGVyYWJsZSgpIHtcbiAgICAgIHJldHVybiBjaGVja0l0ZXJhYmxlO1xuICAgIH0sXG4gICAgZ2V0IGlzQ29uc3RydWN0b3IoKSB7XG4gICAgICByZXR1cm4gaXNDb25zdHJ1Y3RvcjtcbiAgICB9LFxuICAgIGdldCBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCgpIHtcbiAgICAgIHJldHVybiBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdDtcbiAgICB9LFxuICAgIGdldCBtYXliZURlZmluZSgpIHtcbiAgICAgIHJldHVybiBtYXliZURlZmluZTtcbiAgICB9LFxuICAgIGdldCBtYXliZURlZmluZU1ldGhvZCgpIHtcbiAgICAgIHJldHVybiBtYXliZURlZmluZU1ldGhvZDtcbiAgICB9LFxuICAgIGdldCBtYXliZURlZmluZUNvbnN0KCkge1xuICAgICAgcmV0dXJuIG1heWJlRGVmaW5lQ29uc3Q7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVBZGRGdW5jdGlvbnMoKSB7XG4gICAgICByZXR1cm4gbWF5YmVBZGRGdW5jdGlvbnM7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVBZGRDb25zdHMoKSB7XG4gICAgICByZXR1cm4gbWF5YmVBZGRDb25zdHM7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVBZGRJdGVyYXRvcigpIHtcbiAgICAgIHJldHVybiBtYXliZUFkZEl0ZXJhdG9yO1xuICAgIH0sXG4gICAgZ2V0IHJlZ2lzdGVyUG9seWZpbGwoKSB7XG4gICAgICByZXR1cm4gcmVnaXN0ZXJQb2x5ZmlsbDtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbEFsbCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbEFsbDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL01hcC5qc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9NYXAuanNcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIiksXG4gICAgICBpc09iamVjdCA9ICRfXzAuaXNPYmplY3QsXG4gICAgICBtYXliZUFkZEl0ZXJhdG9yID0gJF9fMC5tYXliZUFkZEl0ZXJhdG9yLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzAucmVnaXN0ZXJQb2x5ZmlsbDtcbiAgdmFyIGdldE93bkhhc2hPYmplY3QgPSAkdHJhY2V1clJ1bnRpbWUuZ2V0T3duSGFzaE9iamVjdDtcbiAgdmFyICRoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciBkZWxldGVkU2VudGluZWwgPSB7fTtcbiAgZnVuY3Rpb24gbG9va3VwSW5kZXgobWFwLCBrZXkpIHtcbiAgICBpZiAoaXNPYmplY3Qoa2V5KSkge1xuICAgICAgdmFyIGhhc2hPYmplY3QgPSBnZXRPd25IYXNoT2JqZWN0KGtleSk7XG4gICAgICByZXR1cm4gaGFzaE9iamVjdCAmJiBtYXAub2JqZWN0SW5kZXhfW2hhc2hPYmplY3QuaGFzaF07XG4gICAgfVxuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJylcbiAgICAgIHJldHVybiBtYXAuc3RyaW5nSW5kZXhfW2tleV07XG4gICAgcmV0dXJuIG1hcC5wcmltaXRpdmVJbmRleF9ba2V5XTtcbiAgfVxuICBmdW5jdGlvbiBpbml0TWFwKG1hcCkge1xuICAgIG1hcC5lbnRyaWVzXyA9IFtdO1xuICAgIG1hcC5vYmplY3RJbmRleF8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIG1hcC5zdHJpbmdJbmRleF8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIG1hcC5wcmltaXRpdmVJbmRleF8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIG1hcC5kZWxldGVkQ291bnRfID0gMDtcbiAgfVxuICB2YXIgTWFwID0gZnVuY3Rpb24gTWFwKCkge1xuICAgIHZhciBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICBpZiAoIWlzT2JqZWN0KHRoaXMpKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWFwIGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgdHlwZScpO1xuICAgIGlmICgkaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnZW50cmllc18nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWFwIGNhbiBub3QgYmUgcmVlbnRyYW50bHkgaW5pdGlhbGlzZWQnKTtcbiAgICB9XG4gICAgaW5pdE1hcCh0aGlzKTtcbiAgICBpZiAoaXRlcmFibGUgIT09IG51bGwgJiYgaXRlcmFibGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yICh2YXIgJF9fMiA9IGl0ZXJhYmxlWyR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5KFN5bWJvbC5pdGVyYXRvcildKCksXG4gICAgICAgICAgJF9fMzsgISgkX18zID0gJF9fMi5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICB2YXIgJF9fNCA9ICRfXzMudmFsdWUsXG4gICAgICAgICAgICBrZXkgPSAkX180WzBdLFxuICAgICAgICAgICAgdmFsdWUgPSAkX180WzFdO1xuICAgICAgICB7XG4gICAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKE1hcCwge1xuICAgIGdldCBzaXplKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZW50cmllc18ubGVuZ3RoIC8gMiAtIHRoaXMuZGVsZXRlZENvdW50XztcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgaW5kZXggPSBsb29rdXBJbmRleCh0aGlzLCBrZXkpO1xuICAgICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzLmVudHJpZXNfW2luZGV4ICsgMV07XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciBvYmplY3RNb2RlID0gaXNPYmplY3Qoa2V5KTtcbiAgICAgIHZhciBzdHJpbmdNb2RlID0gdHlwZW9mIGtleSA9PT0gJ3N0cmluZyc7XG4gICAgICB2YXIgaW5kZXggPSBsb29rdXBJbmRleCh0aGlzLCBrZXkpO1xuICAgICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5lbnRyaWVzX1tpbmRleCArIDFdID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IHRoaXMuZW50cmllc18ubGVuZ3RoO1xuICAgICAgICB0aGlzLmVudHJpZXNfW2luZGV4XSA9IGtleTtcbiAgICAgICAgdGhpcy5lbnRyaWVzX1tpbmRleCArIDFdID0gdmFsdWU7XG4gICAgICAgIGlmIChvYmplY3RNb2RlKSB7XG4gICAgICAgICAgdmFyIGhhc2hPYmplY3QgPSBnZXRPd25IYXNoT2JqZWN0KGtleSk7XG4gICAgICAgICAgdmFyIGhhc2ggPSBoYXNoT2JqZWN0Lmhhc2g7XG4gICAgICAgICAgdGhpcy5vYmplY3RJbmRleF9baGFzaF0gPSBpbmRleDtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJpbmdNb2RlKSB7XG4gICAgICAgICAgdGhpcy5zdHJpbmdJbmRleF9ba2V5XSA9IGluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucHJpbWl0aXZlSW5kZXhfW2tleV0gPSBpbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGxvb2t1cEluZGV4KHRoaXMsIGtleSkgIT09IHVuZGVmaW5lZDtcbiAgICB9LFxuICAgIGRlbGV0ZTogZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgb2JqZWN0TW9kZSA9IGlzT2JqZWN0KGtleSk7XG4gICAgICB2YXIgc3RyaW5nTW9kZSA9IHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnO1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgdmFyIGhhc2g7XG4gICAgICBpZiAob2JqZWN0TW9kZSkge1xuICAgICAgICB2YXIgaGFzaE9iamVjdCA9IGdldE93bkhhc2hPYmplY3Qoa2V5KTtcbiAgICAgICAgaWYgKGhhc2hPYmplY3QpIHtcbiAgICAgICAgICBpbmRleCA9IHRoaXMub2JqZWN0SW5kZXhfW2hhc2ggPSBoYXNoT2JqZWN0Lmhhc2hdO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLm9iamVjdEluZGV4X1toYXNoXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzdHJpbmdNb2RlKSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5zdHJpbmdJbmRleF9ba2V5XTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RyaW5nSW5kZXhfW2tleV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IHRoaXMucHJpbWl0aXZlSW5kZXhfW2tleV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLnByaW1pdGl2ZUluZGV4X1trZXldO1xuICAgICAgfVxuICAgICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5lbnRyaWVzX1tpbmRleF0gPSBkZWxldGVkU2VudGluZWw7XG4gICAgICAgIHRoaXMuZW50cmllc19baW5kZXggKyAxXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5kZWxldGVkQ291bnRfKys7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaW5pdE1hcCh0aGlzKTtcbiAgICB9LFxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKGNhbGxiYWNrRm4pIHtcbiAgICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIHZhciBrZXkgPSB0aGlzLmVudHJpZXNfW2ldO1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmVudHJpZXNfW2kgKyAxXTtcbiAgICAgICAgaWYgKGtleSA9PT0gZGVsZXRlZFNlbnRpbmVsKVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBjYWxsYmFja0ZuLmNhbGwodGhpc0FyZywgdmFsdWUsIGtleSwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbnRyaWVzOiAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uICRfXzUoKSB7XG4gICAgICB2YXIgaSxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgdmFsdWU7XG4gICAgICByZXR1cm4gJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgc3dpdGNoICgkY3R4LnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChpIDwgdGhpcy5lbnRyaWVzXy5sZW5ndGgpID8gOCA6IC0yO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICBrZXkgPSB0aGlzLmVudHJpZXNfW2ldO1xuICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZW50cmllc19baSArIDFdO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gOTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoa2V5ID09PSBkZWxldGVkU2VudGluZWwpID8gNCA6IDY7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMjtcbiAgICAgICAgICAgICAgcmV0dXJuIFtrZXksIHZhbHVlXTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgJGN0eC5tYXliZVRocm93KCk7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA0O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAkY3R4LmVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgIH0sICRfXzUsIHRoaXMpO1xuICAgIH0pLFxuICAgIGtleXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fNigpIHtcbiAgICAgIHZhciBpLFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICB2YWx1ZTtcbiAgICAgIHJldHVybiAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UoZnVuY3Rpb24oJGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSlcbiAgICAgICAgICBzd2l0Y2ggKCRjdHguc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aCkgPyA4IDogLTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIGtleSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5lbnRyaWVzX1tpICsgMV07XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChrZXkgPT09IGRlbGV0ZWRTZW50aW5lbCkgPyA0IDogNjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAkY3R4Lm1heWJlVGhyb3coKTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fNiwgdGhpcyk7XG4gICAgfSksXG4gICAgdmFsdWVzOiAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uICRfXzcoKSB7XG4gICAgICB2YXIgaSxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgdmFsdWU7XG4gICAgICByZXR1cm4gJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgc3dpdGNoICgkY3R4LnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChpIDwgdGhpcy5lbnRyaWVzXy5sZW5ndGgpID8gOCA6IC0yO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICBrZXkgPSB0aGlzLmVudHJpZXNfW2ldO1xuICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZW50cmllc19baSArIDFdO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gOTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoa2V5ID09PSBkZWxldGVkU2VudGluZWwpID8gNCA6IDY7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMjtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAkY3R4Lm1heWJlVGhyb3coKTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fNywgdGhpcyk7XG4gICAgfSlcbiAgfSwge30pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTWFwLnByb3RvdHlwZSwgU3ltYm9sLml0ZXJhdG9yLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBNYXAucHJvdG90eXBlLmVudHJpZXNcbiAgfSk7XG4gIGZ1bmN0aW9uIHBvbHlmaWxsTWFwKGdsb2JhbCkge1xuICAgIHZhciAkX180ID0gZ2xvYmFsLFxuICAgICAgICBPYmplY3QgPSAkX180Lk9iamVjdCxcbiAgICAgICAgU3ltYm9sID0gJF9fNC5TeW1ib2w7XG4gICAgaWYgKCFnbG9iYWwuTWFwKVxuICAgICAgZ2xvYmFsLk1hcCA9IE1hcDtcbiAgICB2YXIgbWFwUHJvdG90eXBlID0gZ2xvYmFsLk1hcC5wcm90b3R5cGU7XG4gICAgaWYgKG1hcFByb3RvdHlwZS5lbnRyaWVzID09PSB1bmRlZmluZWQpXG4gICAgICBnbG9iYWwuTWFwID0gTWFwO1xuICAgIGlmIChtYXBQcm90b3R5cGUuZW50cmllcykge1xuICAgICAgbWF5YmVBZGRJdGVyYXRvcihtYXBQcm90b3R5cGUsIG1hcFByb3RvdHlwZS5lbnRyaWVzLCBTeW1ib2wpO1xuICAgICAgbWF5YmVBZGRJdGVyYXRvcihPYmplY3QuZ2V0UHJvdG90eXBlT2YobmV3IGdsb2JhbC5NYXAoKS5lbnRyaWVzKCkpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBTeW1ib2wpO1xuICAgIH1cbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsTWFwKTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgTWFwKCkge1xuICAgICAgcmV0dXJuIE1hcDtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbE1hcCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbE1hcDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9NYXAuanNcIiArICcnKTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1NldC5qc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9TZXQuanNcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIiksXG4gICAgICBpc09iamVjdCA9ICRfXzAuaXNPYmplY3QsXG4gICAgICBtYXliZUFkZEl0ZXJhdG9yID0gJF9fMC5tYXliZUFkZEl0ZXJhdG9yLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzAucmVnaXN0ZXJQb2x5ZmlsbDtcbiAgdmFyIE1hcCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9NYXAuanNcIikuTWFwO1xuICB2YXIgZ2V0T3duSGFzaE9iamVjdCA9ICR0cmFjZXVyUnVudGltZS5nZXRPd25IYXNoT2JqZWN0O1xuICB2YXIgJGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgZnVuY3Rpb24gaW5pdFNldChzZXQpIHtcbiAgICBzZXQubWFwXyA9IG5ldyBNYXAoKTtcbiAgfVxuICB2YXIgU2V0ID0gZnVuY3Rpb24gU2V0KCkge1xuICAgIHZhciBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICBpZiAoIWlzT2JqZWN0KHRoaXMpKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU2V0IGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgdHlwZScpO1xuICAgIGlmICgkaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnbWFwXycpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTZXQgY2FuIG5vdCBiZSByZWVudHJhbnRseSBpbml0aWFsaXNlZCcpO1xuICAgIH1cbiAgICBpbml0U2V0KHRoaXMpO1xuICAgIGlmIChpdGVyYWJsZSAhPT0gbnVsbCAmJiBpdGVyYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKHZhciAkX180ID0gaXRlcmFibGVbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoU3ltYm9sLml0ZXJhdG9yKV0oKSxcbiAgICAgICAgICAkX181OyAhKCRfXzUgPSAkX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgIHZhciBpdGVtID0gJF9fNS52YWx1ZTtcbiAgICAgICAge1xuICAgICAgICAgIHRoaXMuYWRkKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShTZXQsIHtcbiAgICBnZXQgc2l6ZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcF8uc2l6ZTtcbiAgICB9LFxuICAgIGhhczogZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBfLmhhcyhrZXkpO1xuICAgIH0sXG4gICAgYWRkOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHRoaXMubWFwXy5zZXQoa2V5LCBrZXkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBkZWxldGU6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwXy5kZWxldGUoa2V5KTtcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcF8uY2xlYXIoKTtcbiAgICB9LFxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKGNhbGxiYWNrRm4pIHtcbiAgICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgICAgdmFyICRfXzIgPSB0aGlzO1xuICAgICAgcmV0dXJuIHRoaXMubWFwXy5mb3JFYWNoKChmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIGNhbGxiYWNrRm4uY2FsbCh0aGlzQXJnLCBrZXksIGtleSwgJF9fMik7XG4gICAgICB9KSk7XG4gICAgfSxcbiAgICB2YWx1ZXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fNygpIHtcbiAgICAgIHZhciAkX184LFxuICAgICAgICAgICRfXzk7XG4gICAgICByZXR1cm4gJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgc3dpdGNoICgkY3R4LnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICRfXzggPSB0aGlzLm1hcF8ua2V5cygpW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgICAgICAgICAgICAgJGN0eC5zZW50ID0gdm9pZCAwO1xuICAgICAgICAgICAgICAkY3R4LmFjdGlvbiA9ICduZXh0JztcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgICRfXzkgPSAkX184WyRjdHguYWN0aW9uXSgkY3R4LnNlbnRJZ25vcmVUaHJvdyk7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9ICgkX185LmRvbmUpID8gMyA6IDI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAkY3R4LnNlbnQgPSAkX185LnZhbHVlO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gLTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIHJldHVybiAkX185LnZhbHVlO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fNywgdGhpcyk7XG4gICAgfSksXG4gICAgZW50cmllczogJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbihmdW5jdGlvbiAkX18xMCgpIHtcbiAgICAgIHZhciAkX18xMSxcbiAgICAgICAgICAkX18xMjtcbiAgICAgIHJldHVybiAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UoZnVuY3Rpb24oJGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSlcbiAgICAgICAgICBzd2l0Y2ggKCRjdHguc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgJF9fMTEgPSB0aGlzLm1hcF8uZW50cmllcygpW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgICAgICAgICAgICAgJGN0eC5zZW50ID0gdm9pZCAwO1xuICAgICAgICAgICAgICAkY3R4LmFjdGlvbiA9ICduZXh0JztcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgICRfXzEyID0gJF9fMTFbJGN0eC5hY3Rpb25dKCRjdHguc2VudElnbm9yZVRocm93KTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKCRfXzEyLmRvbmUpID8gMyA6IDI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAkY3R4LnNlbnQgPSAkX18xMi52YWx1ZTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IC0yO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICByZXR1cm4gJF9fMTIudmFsdWU7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gJGN0eC5lbmQoKTtcbiAgICAgICAgICB9XG4gICAgICB9LCAkX18xMCwgdGhpcyk7XG4gICAgfSlcbiAgfSwge30pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2V0LnByb3RvdHlwZSwgU3ltYm9sLml0ZXJhdG9yLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBTZXQucHJvdG90eXBlLnZhbHVlc1xuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNldC5wcm90b3R5cGUsICdrZXlzJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogU2V0LnByb3RvdHlwZS52YWx1ZXNcbiAgfSk7XG4gIGZ1bmN0aW9uIHBvbHlmaWxsU2V0KGdsb2JhbCkge1xuICAgIHZhciAkX182ID0gZ2xvYmFsLFxuICAgICAgICBPYmplY3QgPSAkX182Lk9iamVjdCxcbiAgICAgICAgU3ltYm9sID0gJF9fNi5TeW1ib2w7XG4gICAgaWYgKCFnbG9iYWwuU2V0KVxuICAgICAgZ2xvYmFsLlNldCA9IFNldDtcbiAgICB2YXIgc2V0UHJvdG90eXBlID0gZ2xvYmFsLlNldC5wcm90b3R5cGU7XG4gICAgaWYgKHNldFByb3RvdHlwZS52YWx1ZXMpIHtcbiAgICAgIG1heWJlQWRkSXRlcmF0b3Ioc2V0UHJvdG90eXBlLCBzZXRQcm90b3R5cGUudmFsdWVzLCBTeW1ib2wpO1xuICAgICAgbWF5YmVBZGRJdGVyYXRvcihPYmplY3QuZ2V0UHJvdG90eXBlT2YobmV3IGdsb2JhbC5TZXQoKS52YWx1ZXMoKSksIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFN5bWJvbCk7XG4gICAgfVxuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxTZXQpO1xuICByZXR1cm4ge1xuICAgIGdldCBTZXQoKSB7XG4gICAgICByZXR1cm4gU2V0O1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsU2V0KCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsU2V0O1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1NldC5qc1wiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9ub2RlX21vZHVsZXMvcnN2cC9saWIvcnN2cC9hc2FwLmpzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzkvbm9kZV9tb2R1bGVzL3JzdnAvbGliL3JzdnAvYXNhcC5qc1wiO1xuICB2YXIgbGVuID0gMDtcbiAgZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gICAgcXVldWVbbGVuXSA9IGNhbGxiYWNrO1xuICAgIHF1ZXVlW2xlbiArIDFdID0gYXJnO1xuICAgIGxlbiArPSAyO1xuICAgIGlmIChsZW4gPT09IDIpIHtcbiAgICAgIHNjaGVkdWxlRmx1c2goKTtcbiAgICB9XG4gIH1cbiAgdmFyICRfX2RlZmF1bHQgPSBhc2FwO1xuICB2YXIgYnJvd3Nlckdsb2JhbCA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgPyB3aW5kb3cgOiB7fTtcbiAgdmFyIEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbiAgdmFyIGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJztcbiAgZnVuY3Rpb24gdXNlTmV4dFRpY2soKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiB1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIoZmx1c2gpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgIG9ic2VydmVyLm9ic2VydmUobm9kZSwge2NoYXJhY3RlckRhdGE6IHRydWV9KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gdXNlTWVzc2FnZUNoYW5uZWwoKSB7XG4gICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiB1c2VTZXRUaW1lb3V0KCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDEpO1xuICAgIH07XG4gIH1cbiAgdmFyIHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgICB2YXIgY2FsbGJhY2sgPSBxdWV1ZVtpXTtcbiAgICAgIHZhciBhcmcgPSBxdWV1ZVtpICsgMV07XG4gICAgICBjYWxsYmFjayhhcmcpO1xuICAgICAgcXVldWVbaV0gPSB1bmRlZmluZWQ7XG4gICAgICBxdWV1ZVtpICsgMV0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGxlbiA9IDA7XG4gIH1cbiAgdmFyIHNjaGVkdWxlRmx1c2g7XG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgc2NoZWR1bGVGbHVzaCA9IHVzZU5leHRUaWNrKCk7XG4gIH0gZWxzZSBpZiAoQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICBzY2hlZHVsZUZsdXNoID0gdXNlTXV0YXRpb25PYnNlcnZlcigpO1xuICB9IGVsc2UgaWYgKGlzV29ya2VyKSB7XG4gICAgc2NoZWR1bGVGbHVzaCA9IHVzZU1lc3NhZ2VDaGFubmVsKCk7XG4gIH0gZWxzZSB7XG4gICAgc2NoZWR1bGVGbHVzaCA9IHVzZVNldFRpbWVvdXQoKTtcbiAgfVxuICByZXR1cm4ge2dldCBkZWZhdWx0KCkge1xuICAgICAgcmV0dXJuICRfX2RlZmF1bHQ7XG4gICAgfX07XG59KTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1Byb21pc2UuanNcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvUHJvbWlzZS5qc1wiO1xuICB2YXIgYXN5bmMgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9ub2RlX21vZHVsZXMvcnN2cC9saWIvcnN2cC9hc2FwLmpzXCIpLmRlZmF1bHQ7XG4gIHZhciByZWdpc3RlclBvbHlmaWxsID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzLmpzXCIpLnJlZ2lzdGVyUG9seWZpbGw7XG4gIHZhciBwcm9taXNlUmF3ID0ge307XG4gIGZ1bmN0aW9uIGlzUHJvbWlzZSh4KSB7XG4gICAgcmV0dXJuIHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHguc3RhdHVzXyAhPT0gdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIGlkUmVzb2x2ZUhhbmRsZXIoeCkge1xuICAgIHJldHVybiB4O1xuICB9XG4gIGZ1bmN0aW9uIGlkUmVqZWN0SGFuZGxlcih4KSB7XG4gICAgdGhyb3cgeDtcbiAgfVxuICBmdW5jdGlvbiBjaGFpbihwcm9taXNlKSB7XG4gICAgdmFyIG9uUmVzb2x2ZSA9IGFyZ3VtZW50c1sxXSAhPT0gKHZvaWQgMCkgPyBhcmd1bWVudHNbMV0gOiBpZFJlc29sdmVIYW5kbGVyO1xuICAgIHZhciBvblJlamVjdCA9IGFyZ3VtZW50c1syXSAhPT0gKHZvaWQgMCkgPyBhcmd1bWVudHNbMl0gOiBpZFJlamVjdEhhbmRsZXI7XG4gICAgdmFyIGRlZmVycmVkID0gZ2V0RGVmZXJyZWQocHJvbWlzZS5jb25zdHJ1Y3Rvcik7XG4gICAgc3dpdGNoIChwcm9taXNlLnN0YXR1c18pIHtcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICB0aHJvdyBUeXBlRXJyb3I7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHByb21pc2Uub25SZXNvbHZlXy5wdXNoKG9uUmVzb2x2ZSwgZGVmZXJyZWQpO1xuICAgICAgICBwcm9taXNlLm9uUmVqZWN0Xy5wdXNoKG9uUmVqZWN0LCBkZWZlcnJlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSArMTpcbiAgICAgICAgcHJvbWlzZUVucXVldWUocHJvbWlzZS52YWx1ZV8sIFtvblJlc29sdmUsIGRlZmVycmVkXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgcHJvbWlzZUVucXVldWUocHJvbWlzZS52YWx1ZV8sIFtvblJlamVjdCwgZGVmZXJyZWRdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIGdldERlZmVycmVkKEMpIHtcbiAgICBpZiAodGhpcyA9PT0gJFByb21pc2UpIHtcbiAgICAgIHZhciBwcm9taXNlID0gcHJvbWlzZUluaXQobmV3ICRQcm9taXNlKHByb21pc2VSYXcpKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb21pc2U6IHByb21pc2UsXG4gICAgICAgIHJlc29sdmU6IChmdW5jdGlvbih4KSB7XG4gICAgICAgICAgcHJvbWlzZVJlc29sdmUocHJvbWlzZSwgeCk7XG4gICAgICAgIH0pLFxuICAgICAgICByZWplY3Q6IChmdW5jdGlvbihyKSB7XG4gICAgICAgICAgcHJvbWlzZVJlamVjdChwcm9taXNlLCByKTtcbiAgICAgICAgfSlcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIHJlc3VsdC5wcm9taXNlID0gbmV3IEMoKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICByZXN1bHQucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgIHJlc3VsdC5yZWplY3QgPSByZWplY3Q7XG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlU2V0KHByb21pc2UsIHN0YXR1cywgdmFsdWUsIG9uUmVzb2x2ZSwgb25SZWplY3QpIHtcbiAgICBwcm9taXNlLnN0YXR1c18gPSBzdGF0dXM7XG4gICAgcHJvbWlzZS52YWx1ZV8gPSB2YWx1ZTtcbiAgICBwcm9taXNlLm9uUmVzb2x2ZV8gPSBvblJlc29sdmU7XG4gICAgcHJvbWlzZS5vblJlamVjdF8gPSBvblJlamVjdDtcbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlSW5pdChwcm9taXNlKSB7XG4gICAgcmV0dXJuIHByb21pc2VTZXQocHJvbWlzZSwgMCwgdW5kZWZpbmVkLCBbXSwgW10pO1xuICB9XG4gIHZhciBQcm9taXNlID0gZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlcikge1xuICAgIGlmIChyZXNvbHZlciA9PT0gcHJvbWlzZVJhdylcbiAgICAgIHJldHVybjtcbiAgICBpZiAodHlwZW9mIHJlc29sdmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VJbml0KHRoaXMpO1xuICAgIHRyeSB7XG4gICAgICByZXNvbHZlcigoZnVuY3Rpb24oeCkge1xuICAgICAgICBwcm9taXNlUmVzb2x2ZShwcm9taXNlLCB4KTtcbiAgICAgIH0pLCAoZnVuY3Rpb24ocikge1xuICAgICAgICBwcm9taXNlUmVqZWN0KHByb21pc2UsIHIpO1xuICAgICAgfSkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHByb21pc2VSZWplY3QocHJvbWlzZSwgZSk7XG4gICAgfVxuICB9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShQcm9taXNlLCB7XG4gICAgY2F0Y2g6IGZ1bmN0aW9uKG9uUmVqZWN0KSB7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3QpO1xuICAgIH0sXG4gICAgdGhlbjogZnVuY3Rpb24ob25SZXNvbHZlLCBvblJlamVjdCkge1xuICAgICAgaWYgKHR5cGVvZiBvblJlc29sdmUgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIG9uUmVzb2x2ZSA9IGlkUmVzb2x2ZUhhbmRsZXI7XG4gICAgICBpZiAodHlwZW9mIG9uUmVqZWN0ICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICBvblJlamVjdCA9IGlkUmVqZWN0SGFuZGxlcjtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgIHZhciBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgICByZXR1cm4gY2hhaW4odGhpcywgZnVuY3Rpb24oeCkge1xuICAgICAgICB4ID0gcHJvbWlzZUNvZXJjZShjb25zdHJ1Y3RvciwgeCk7XG4gICAgICAgIHJldHVybiB4ID09PSB0aGF0ID8gb25SZWplY3QobmV3IFR5cGVFcnJvcikgOiBpc1Byb21pc2UoeCkgPyB4LnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCkgOiBvblJlc29sdmUoeCk7XG4gICAgICB9LCBvblJlamVjdCk7XG4gICAgfVxuICB9LCB7XG4gICAgcmVzb2x2ZTogZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKHRoaXMgPT09ICRQcm9taXNlKSB7XG4gICAgICAgIGlmIChpc1Byb21pc2UoeCkpIHtcbiAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzZVNldChuZXcgJFByb21pc2UocHJvbWlzZVJhdyksICsxLCB4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICByZXNvbHZlKHgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlamVjdDogZnVuY3Rpb24ocikge1xuICAgICAgaWYgKHRoaXMgPT09ICRQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlU2V0KG5ldyAkUHJvbWlzZShwcm9taXNlUmF3KSwgLTEsIHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICByZWplY3Qocik7XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFsbDogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSBnZXREZWZlcnJlZCh0aGlzKTtcbiAgICAgIHZhciByZXNvbHV0aW9ucyA9IFtdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGNvdW50ID0gdmFsdWVzLmxlbmd0aDtcbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXNvbHV0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZSh2YWx1ZXNbaV0pLnRoZW4oZnVuY3Rpb24oaSwgeCkge1xuICAgICAgICAgICAgICByZXNvbHV0aW9uc1tpXSA9IHg7XG4gICAgICAgICAgICAgIGlmICgtLWNvdW50ID09PSAwKVxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzb2x1dGlvbnMpO1xuICAgICAgICAgICAgfS5iaW5kKHVuZGVmaW5lZCwgaSksIChmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcbiAgICByYWNlOiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9IGdldERlZmVycmVkKHRoaXMpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLnJlc29sdmUodmFsdWVzW2ldKS50aGVuKChmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHgpO1xuICAgICAgICAgIH0pLCAoZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHIpO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH0pO1xuICB2YXIgJFByb21pc2UgPSBQcm9taXNlO1xuICB2YXIgJFByb21pc2VSZWplY3QgPSAkUHJvbWlzZS5yZWplY3Q7XG4gIGZ1bmN0aW9uIHByb21pc2VSZXNvbHZlKHByb21pc2UsIHgpIHtcbiAgICBwcm9taXNlRG9uZShwcm9taXNlLCArMSwgeCwgcHJvbWlzZS5vblJlc29sdmVfKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlUmVqZWN0KHByb21pc2UsIHIpIHtcbiAgICBwcm9taXNlRG9uZShwcm9taXNlLCAtMSwgciwgcHJvbWlzZS5vblJlamVjdF8pO1xuICB9XG4gIGZ1bmN0aW9uIHByb21pc2VEb25lKHByb21pc2UsIHN0YXR1cywgdmFsdWUsIHJlYWN0aW9ucykge1xuICAgIGlmIChwcm9taXNlLnN0YXR1c18gIT09IDApXG4gICAgICByZXR1cm47XG4gICAgcHJvbWlzZUVucXVldWUodmFsdWUsIHJlYWN0aW9ucyk7XG4gICAgcHJvbWlzZVNldChwcm9taXNlLCBzdGF0dXMsIHZhbHVlKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlRW5xdWV1ZSh2YWx1ZSwgdGFza3MpIHtcbiAgICBhc3luYygoZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhc2tzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIHByb21pc2VIYW5kbGUodmFsdWUsIHRhc2tzW2ldLCB0YXNrc1tpICsgMV0pO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlSGFuZGxlKHZhbHVlLCBoYW5kbGVyLCBkZWZlcnJlZCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgcmVzdWx0ID0gaGFuZGxlcih2YWx1ZSk7XG4gICAgICBpZiAocmVzdWx0ID09PSBkZWZlcnJlZC5wcm9taXNlKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgZWxzZSBpZiAoaXNQcm9taXNlKHJlc3VsdCkpXG4gICAgICAgIGNoYWluKHJlc3VsdCwgZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgIGVsc2VcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICB9XG4gIHZhciB0aGVuYWJsZVN5bWJvbCA9ICdAQHRoZW5hYmxlJztcbiAgZnVuY3Rpb24gaXNPYmplY3QoeCkge1xuICAgIHJldHVybiB4ICYmICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbicpO1xuICB9XG4gIGZ1bmN0aW9uIHByb21pc2VDb2VyY2UoY29uc3RydWN0b3IsIHgpIHtcbiAgICBpZiAoIWlzUHJvbWlzZSh4KSAmJiBpc09iamVjdCh4KSkge1xuICAgICAgdmFyIHRoZW47XG4gICAgICB0cnkge1xuICAgICAgICB0aGVuID0geC50aGVuO1xuICAgICAgfSBjYXRjaCAocikge1xuICAgICAgICB2YXIgcHJvbWlzZSA9ICRQcm9taXNlUmVqZWN0LmNhbGwoY29uc3RydWN0b3IsIHIpO1xuICAgICAgICB4W3RoZW5hYmxlU3ltYm9sXSA9IHByb21pc2U7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBwID0geFt0aGVuYWJsZVN5bWJvbF07XG4gICAgICAgIGlmIChwKSB7XG4gICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gZ2V0RGVmZXJyZWQoY29uc3RydWN0b3IpO1xuICAgICAgICAgIHhbdGhlbmFibGVTeW1ib2xdID0gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhlbi5jYWxsKHgsIGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgICAgfSBjYXRjaCAocikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geDtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbFByb21pc2UoZ2xvYmFsKSB7XG4gICAgaWYgKCFnbG9iYWwuUHJvbWlzZSlcbiAgICAgIGdsb2JhbC5Qcm9taXNlID0gUHJvbWlzZTtcbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsUHJvbWlzZSk7XG4gIHJldHVybiB7XG4gICAgZ2V0IFByb21pc2UoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZTtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbFByb21pc2UoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxQcm9taXNlO1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1Byb21pc2UuanNcIiArICcnKTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1N0cmluZ0l0ZXJhdG9yLmpzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciAkX18yO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdJdGVyYXRvci5qc1wiO1xuICB2YXIgJF9fMCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlscy5qc1wiKSxcbiAgICAgIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0ID0gJF9fMC5jcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCxcbiAgICAgIGlzT2JqZWN0ID0gJF9fMC5pc09iamVjdDtcbiAgdmFyIHRvUHJvcGVydHkgPSAkdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eTtcbiAgdmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIGl0ZXJhdGVkU3RyaW5nID0gU3ltYm9sKCdpdGVyYXRlZFN0cmluZycpO1xuICB2YXIgc3RyaW5nSXRlcmF0b3JOZXh0SW5kZXggPSBTeW1ib2woJ3N0cmluZ0l0ZXJhdG9yTmV4dEluZGV4Jyk7XG4gIHZhciBTdHJpbmdJdGVyYXRvciA9IGZ1bmN0aW9uIFN0cmluZ0l0ZXJhdG9yKCkge307XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKFN0cmluZ0l0ZXJhdG9yLCAoJF9fMiA9IHt9LCBPYmplY3QuZGVmaW5lUHJvcGVydHkoJF9fMiwgXCJuZXh0XCIsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbyA9IHRoaXM7XG4gICAgICBpZiAoIWlzT2JqZWN0KG8pIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGl0ZXJhdGVkU3RyaW5nKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd0aGlzIG11c3QgYmUgYSBTdHJpbmdJdGVyYXRvciBvYmplY3QnKTtcbiAgICAgIH1cbiAgICAgIHZhciBzID0gb1t0b1Byb3BlcnR5KGl0ZXJhdGVkU3RyaW5nKV07XG4gICAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCh1bmRlZmluZWQsIHRydWUpO1xuICAgICAgfVxuICAgICAgdmFyIHBvc2l0aW9uID0gb1t0b1Byb3BlcnR5KHN0cmluZ0l0ZXJhdG9yTmV4dEluZGV4KV07XG4gICAgICB2YXIgbGVuID0gcy5sZW5ndGg7XG4gICAgICBpZiAocG9zaXRpb24gPj0gbGVuKSB7XG4gICAgICAgIG9bdG9Qcm9wZXJ0eShpdGVyYXRlZFN0cmluZyldID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIHZhciBmaXJzdCA9IHMuY2hhckNvZGVBdChwb3NpdGlvbik7XG4gICAgICB2YXIgcmVzdWx0U3RyaW5nO1xuICAgICAgaWYgKGZpcnN0IDwgMHhEODAwIHx8IGZpcnN0ID4gMHhEQkZGIHx8IHBvc2l0aW9uICsgMSA9PT0gbGVuKSB7XG4gICAgICAgIHJlc3VsdFN0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZmlyc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNlY29uZCA9IHMuY2hhckNvZGVBdChwb3NpdGlvbiArIDEpO1xuICAgICAgICBpZiAoc2Vjb25kIDwgMHhEQzAwIHx8IHNlY29uZCA+IDB4REZGRikge1xuICAgICAgICAgIHJlc3VsdFN0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZmlyc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFN0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZmlyc3QpICsgU3RyaW5nLmZyb21DaGFyQ29kZShzZWNvbmQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvW3RvUHJvcGVydHkoc3RyaW5nSXRlcmF0b3JOZXh0SW5kZXgpXSA9IHBvc2l0aW9uICsgcmVzdWx0U3RyaW5nLmxlbmd0aDtcbiAgICAgIHJldHVybiBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdChyZXN1bHRTdHJpbmcsIGZhbHNlKTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlXG4gIH0pLCBPYmplY3QuZGVmaW5lUHJvcGVydHkoJF9fMiwgU3ltYm9sLml0ZXJhdG9yLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZVxuICB9KSwgJF9fMiksIHt9KTtcbiAgZnVuY3Rpb24gY3JlYXRlU3RyaW5nSXRlcmF0b3Ioc3RyaW5nKSB7XG4gICAgdmFyIHMgPSBTdHJpbmcoc3RyaW5nKTtcbiAgICB2YXIgaXRlcmF0b3IgPSBPYmplY3QuY3JlYXRlKFN0cmluZ0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgaXRlcmF0b3JbdG9Qcm9wZXJ0eShpdGVyYXRlZFN0cmluZyldID0gcztcbiAgICBpdGVyYXRvclt0b1Byb3BlcnR5KHN0cmluZ0l0ZXJhdG9yTmV4dEluZGV4KV0gPSAwO1xuICAgIHJldHVybiBpdGVyYXRvcjtcbiAgfVxuICByZXR1cm4ge2dldCBjcmVhdGVTdHJpbmdJdGVyYXRvcigpIHtcbiAgICAgIHJldHVybiBjcmVhdGVTdHJpbmdJdGVyYXRvcjtcbiAgICB9fTtcbn0pO1xuU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU3RyaW5nLmpzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1N0cmluZy5qc1wiO1xuICB2YXIgY3JlYXRlU3RyaW5nSXRlcmF0b3IgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU3RyaW5nSXRlcmF0b3IuanNcIikuY3JlYXRlU3RyaW5nSXRlcmF0b3I7XG4gIHZhciAkX18xID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzLmpzXCIpLFxuICAgICAgbWF5YmVBZGRGdW5jdGlvbnMgPSAkX18xLm1heWJlQWRkRnVuY3Rpb25zLFxuICAgICAgbWF5YmVBZGRJdGVyYXRvciA9ICRfXzEubWF5YmVBZGRJdGVyYXRvcixcbiAgICAgIHJlZ2lzdGVyUG9seWZpbGwgPSAkX18xLnJlZ2lzdGVyUG9seWZpbGw7XG4gIHZhciAkdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICB2YXIgJGluZGV4T2YgPSBTdHJpbmcucHJvdG90eXBlLmluZGV4T2Y7XG4gIHZhciAkbGFzdEluZGV4T2YgPSBTdHJpbmcucHJvdG90eXBlLmxhc3RJbmRleE9mO1xuICBmdW5jdGlvbiBzdGFydHNXaXRoKHNlYXJjaCkge1xuICAgIHZhciBzdHJpbmcgPSBTdHJpbmcodGhpcyk7XG4gICAgaWYgKHRoaXMgPT0gbnVsbCB8fCAkdG9TdHJpbmcuY2FsbChzZWFyY2gpID09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHN0cmluZ0xlbmd0aCA9IHN0cmluZy5sZW5ndGg7XG4gICAgdmFyIHNlYXJjaFN0cmluZyA9IFN0cmluZyhzZWFyY2gpO1xuICAgIHZhciBzZWFyY2hMZW5ndGggPSBzZWFyY2hTdHJpbmcubGVuZ3RoO1xuICAgIHZhciBwb3NpdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICAgIHZhciBwb3MgPSBwb3NpdGlvbiA/IE51bWJlcihwb3NpdGlvbikgOiAwO1xuICAgIGlmIChpc05hTihwb3MpKSB7XG4gICAgICBwb3MgPSAwO1xuICAgIH1cbiAgICB2YXIgc3RhcnQgPSBNYXRoLm1pbihNYXRoLm1heChwb3MsIDApLCBzdHJpbmdMZW5ndGgpO1xuICAgIHJldHVybiAkaW5kZXhPZi5jYWxsKHN0cmluZywgc2VhcmNoU3RyaW5nLCBwb3MpID09IHN0YXJ0O1xuICB9XG4gIGZ1bmN0aW9uIGVuZHNXaXRoKHNlYXJjaCkge1xuICAgIHZhciBzdHJpbmcgPSBTdHJpbmcodGhpcyk7XG4gICAgaWYgKHRoaXMgPT0gbnVsbCB8fCAkdG9TdHJpbmcuY2FsbChzZWFyY2gpID09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHN0cmluZ0xlbmd0aCA9IHN0cmluZy5sZW5ndGg7XG4gICAgdmFyIHNlYXJjaFN0cmluZyA9IFN0cmluZyhzZWFyY2gpO1xuICAgIHZhciBzZWFyY2hMZW5ndGggPSBzZWFyY2hTdHJpbmcubGVuZ3RoO1xuICAgIHZhciBwb3MgPSBzdHJpbmdMZW5ndGg7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwb3MgPSBwb3NpdGlvbiA/IE51bWJlcihwb3NpdGlvbikgOiAwO1xuICAgICAgICBpZiAoaXNOYU4ocG9zKSkge1xuICAgICAgICAgIHBvcyA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGVuZCA9IE1hdGgubWluKE1hdGgubWF4KHBvcywgMCksIHN0cmluZ0xlbmd0aCk7XG4gICAgdmFyIHN0YXJ0ID0gZW5kIC0gc2VhcmNoTGVuZ3RoO1xuICAgIGlmIChzdGFydCA8IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuICRsYXN0SW5kZXhPZi5jYWxsKHN0cmluZywgc2VhcmNoU3RyaW5nLCBzdGFydCkgPT0gc3RhcnQ7XG4gIH1cbiAgZnVuY3Rpb24gaW5jbHVkZXMoc2VhcmNoKSB7XG4gICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmcgPSBTdHJpbmcodGhpcyk7XG4gICAgaWYgKHNlYXJjaCAmJiAkdG9TdHJpbmcuY2FsbChzZWFyY2gpID09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHN0cmluZ0xlbmd0aCA9IHN0cmluZy5sZW5ndGg7XG4gICAgdmFyIHNlYXJjaFN0cmluZyA9IFN0cmluZyhzZWFyY2gpO1xuICAgIHZhciBzZWFyY2hMZW5ndGggPSBzZWFyY2hTdHJpbmcubGVuZ3RoO1xuICAgIHZhciBwb3NpdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICAgIHZhciBwb3MgPSBwb3NpdGlvbiA/IE51bWJlcihwb3NpdGlvbikgOiAwO1xuICAgIGlmIChwb3MgIT0gcG9zKSB7XG4gICAgICBwb3MgPSAwO1xuICAgIH1cbiAgICB2YXIgc3RhcnQgPSBNYXRoLm1pbihNYXRoLm1heChwb3MsIDApLCBzdHJpbmdMZW5ndGgpO1xuICAgIGlmIChzZWFyY2hMZW5ndGggKyBzdGFydCA+IHN0cmluZ0xlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gJGluZGV4T2YuY2FsbChzdHJpbmcsIHNlYXJjaFN0cmluZywgcG9zKSAhPSAtMTtcbiAgfVxuICBmdW5jdGlvbiByZXBlYXQoY291bnQpIHtcbiAgICBpZiAodGhpcyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICB2YXIgbiA9IGNvdW50ID8gTnVtYmVyKGNvdW50KSA6IDA7XG4gICAgaWYgKGlzTmFOKG4pKSB7XG4gICAgICBuID0gMDtcbiAgICB9XG4gICAgaWYgKG4gPCAwIHx8IG4gPT0gSW5maW5pdHkpIHtcbiAgICAgIHRocm93IFJhbmdlRXJyb3IoKTtcbiAgICB9XG4gICAgaWYgKG4gPT0gMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgd2hpbGUgKG4tLSkge1xuICAgICAgcmVzdWx0ICs9IHN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBmdW5jdGlvbiBjb2RlUG9pbnRBdChwb3NpdGlvbikge1xuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIHZhciBzaXplID0gc3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgaW5kZXggPSBwb3NpdGlvbiA/IE51bWJlcihwb3NpdGlvbikgOiAwO1xuICAgIGlmIChpc05hTihpbmRleCkpIHtcbiAgICAgIGluZGV4ID0gMDtcbiAgICB9XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB2YXIgZmlyc3QgPSBzdHJpbmcuY2hhckNvZGVBdChpbmRleCk7XG4gICAgdmFyIHNlY29uZDtcbiAgICBpZiAoZmlyc3QgPj0gMHhEODAwICYmIGZpcnN0IDw9IDB4REJGRiAmJiBzaXplID4gaW5kZXggKyAxKSB7XG4gICAgICBzZWNvbmQgPSBzdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpO1xuICAgICAgaWYgKHNlY29uZCA+PSAweERDMDAgJiYgc2Vjb25kIDw9IDB4REZGRikge1xuICAgICAgICByZXR1cm4gKGZpcnN0IC0gMHhEODAwKSAqIDB4NDAwICsgc2Vjb25kIC0gMHhEQzAwICsgMHgxMDAwMDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZpcnN0O1xuICB9XG4gIGZ1bmN0aW9uIHJhdyhjYWxsc2l0ZSkge1xuICAgIHZhciByYXcgPSBjYWxsc2l0ZS5yYXc7XG4gICAgdmFyIGxlbiA9IHJhdy5sZW5ndGggPj4+IDA7XG4gICAgaWYgKGxlbiA9PT0gMClcbiAgICAgIHJldHVybiAnJztcbiAgICB2YXIgcyA9ICcnO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgcyArPSByYXdbaV07XG4gICAgICBpZiAoaSArIDEgPT09IGxlbilcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICBzICs9IGFyZ3VtZW50c1srK2ldO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KCkge1xuICAgIHZhciBjb2RlVW5pdHMgPSBbXTtcbiAgICB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgIHZhciBoaWdoU3Vycm9nYXRlO1xuICAgIHZhciBsb3dTdXJyb2dhdGU7XG4gICAgdmFyIGluZGV4ID0gLTE7XG4gICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBjb2RlUG9pbnQgPSBOdW1iZXIoYXJndW1lbnRzW2luZGV4XSk7XG4gICAgICBpZiAoIWlzRmluaXRlKGNvZGVQb2ludCkgfHwgY29kZVBvaW50IDwgMCB8fCBjb2RlUG9pbnQgPiAweDEwRkZGRiB8fCBmbG9vcihjb2RlUG9pbnQpICE9IGNvZGVQb2ludCkge1xuICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQ6ICcgKyBjb2RlUG9pbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGNvZGVQb2ludCA8PSAweEZGRkYpIHtcbiAgICAgICAgY29kZVVuaXRzLnB1c2goY29kZVBvaW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwO1xuICAgICAgICBoaWdoU3Vycm9nYXRlID0gKGNvZGVQb2ludCA+PiAxMCkgKyAweEQ4MDA7XG4gICAgICAgIGxvd1N1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgJSAweDQwMCkgKyAweERDMDA7XG4gICAgICAgIGNvZGVVbml0cy5wdXNoKGhpZ2hTdXJyb2dhdGUsIGxvd1N1cnJvZ2F0ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGNvZGVVbml0cyk7XG4gIH1cbiAgZnVuY3Rpb24gc3RyaW5nUHJvdG90eXBlSXRlcmF0b3IoKSB7XG4gICAgdmFyIG8gPSAkdHJhY2V1clJ1bnRpbWUuY2hlY2tPYmplY3RDb2VyY2libGUodGhpcyk7XG4gICAgdmFyIHMgPSBTdHJpbmcobyk7XG4gICAgcmV0dXJuIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yKHMpO1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsU3RyaW5nKGdsb2JhbCkge1xuICAgIHZhciBTdHJpbmcgPSBnbG9iYWwuU3RyaW5nO1xuICAgIG1heWJlQWRkRnVuY3Rpb25zKFN0cmluZy5wcm90b3R5cGUsIFsnY29kZVBvaW50QXQnLCBjb2RlUG9pbnRBdCwgJ2VuZHNXaXRoJywgZW5kc1dpdGgsICdpbmNsdWRlcycsIGluY2x1ZGVzLCAncmVwZWF0JywgcmVwZWF0LCAnc3RhcnRzV2l0aCcsIHN0YXJ0c1dpdGhdKTtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhTdHJpbmcsIFsnZnJvbUNvZGVQb2ludCcsIGZyb21Db2RlUG9pbnQsICdyYXcnLCByYXddKTtcbiAgICBtYXliZUFkZEl0ZXJhdG9yKFN0cmluZy5wcm90b3R5cGUsIHN0cmluZ1Byb3RvdHlwZUl0ZXJhdG9yLCBTeW1ib2wpO1xuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxTdHJpbmcpO1xuICByZXR1cm4ge1xuICAgIGdldCBzdGFydHNXaXRoKCkge1xuICAgICAgcmV0dXJuIHN0YXJ0c1dpdGg7XG4gICAgfSxcbiAgICBnZXQgZW5kc1dpdGgoKSB7XG4gICAgICByZXR1cm4gZW5kc1dpdGg7XG4gICAgfSxcbiAgICBnZXQgaW5jbHVkZXMoKSB7XG4gICAgICByZXR1cm4gaW5jbHVkZXM7XG4gICAgfSxcbiAgICBnZXQgcmVwZWF0KCkge1xuICAgICAgcmV0dXJuIHJlcGVhdDtcbiAgICB9LFxuICAgIGdldCBjb2RlUG9pbnRBdCgpIHtcbiAgICAgIHJldHVybiBjb2RlUG9pbnRBdDtcbiAgICB9LFxuICAgIGdldCByYXcoKSB7XG4gICAgICByZXR1cm4gcmF3O1xuICAgIH0sXG4gICAgZ2V0IGZyb21Db2RlUG9pbnQoKSB7XG4gICAgICByZXR1cm4gZnJvbUNvZGVQb2ludDtcbiAgICB9LFxuICAgIGdldCBzdHJpbmdQcm90b3R5cGVJdGVyYXRvcigpIHtcbiAgICAgIHJldHVybiBzdHJpbmdQcm90b3R5cGVJdGVyYXRvcjtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbFN0cmluZygpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbFN0cmluZztcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmcuanNcIiArICcnKTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5SXRlcmF0b3IuanNcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyICRfXzI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5SXRlcmF0b3IuanNcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIiksXG4gICAgICB0b09iamVjdCA9ICRfXzAudG9PYmplY3QsXG4gICAgICB0b1VpbnQzMiA9ICRfXzAudG9VaW50MzIsXG4gICAgICBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCA9ICRfXzAuY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3Q7XG4gIHZhciBBUlJBWV9JVEVSQVRPUl9LSU5EX0tFWVMgPSAxO1xuICB2YXIgQVJSQVlfSVRFUkFUT1JfS0lORF9WQUxVRVMgPSAyO1xuICB2YXIgQVJSQVlfSVRFUkFUT1JfS0lORF9FTlRSSUVTID0gMztcbiAgdmFyIEFycmF5SXRlcmF0b3IgPSBmdW5jdGlvbiBBcnJheUl0ZXJhdG9yKCkge307XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKEFycmF5SXRlcmF0b3IsICgkX18yID0ge30sIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkX18yLCBcIm5leHRcIiwge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IHRvT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGFycmF5ID0gaXRlcmF0b3IuaXRlcmF0b3JPYmplY3RfO1xuICAgICAgaWYgKCFhcnJheSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QgaXMgbm90IGFuIEFycmF5SXRlcmF0b3InKTtcbiAgICAgIH1cbiAgICAgIHZhciBpbmRleCA9IGl0ZXJhdG9yLmFycmF5SXRlcmF0b3JOZXh0SW5kZXhfO1xuICAgICAgdmFyIGl0ZW1LaW5kID0gaXRlcmF0b3IuYXJyYXlJdGVyYXRpb25LaW5kXztcbiAgICAgIHZhciBsZW5ndGggPSB0b1VpbnQzMihhcnJheS5sZW5ndGgpO1xuICAgICAgaWYgKGluZGV4ID49IGxlbmd0aCkge1xuICAgICAgICBpdGVyYXRvci5hcnJheUl0ZXJhdG9yTmV4dEluZGV4XyA9IEluZmluaXR5O1xuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGl0ZXJhdG9yLmFycmF5SXRlcmF0b3JOZXh0SW5kZXhfID0gaW5kZXggKyAxO1xuICAgICAgaWYgKGl0ZW1LaW5kID09IEFSUkFZX0lURVJBVE9SX0tJTkRfVkFMVUVTKVxuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoYXJyYXlbaW5kZXhdLCBmYWxzZSk7XG4gICAgICBpZiAoaXRlbUtpbmQgPT0gQVJSQVlfSVRFUkFUT1JfS0lORF9FTlRSSUVTKVxuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoW2luZGV4LCBhcnJheVtpbmRleF1dLCBmYWxzZSk7XG4gICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoaW5kZXgsIGZhbHNlKTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlXG4gIH0pLCBPYmplY3QuZGVmaW5lUHJvcGVydHkoJF9fMiwgU3ltYm9sLml0ZXJhdG9yLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZVxuICB9KSwgJF9fMiksIHt9KTtcbiAgZnVuY3Rpb24gY3JlYXRlQXJyYXlJdGVyYXRvcihhcnJheSwga2luZCkge1xuICAgIHZhciBvYmplY3QgPSB0b09iamVjdChhcnJheSk7XG4gICAgdmFyIGl0ZXJhdG9yID0gbmV3IEFycmF5SXRlcmF0b3I7XG4gICAgaXRlcmF0b3IuaXRlcmF0b3JPYmplY3RfID0gb2JqZWN0O1xuICAgIGl0ZXJhdG9yLmFycmF5SXRlcmF0b3JOZXh0SW5kZXhfID0gMDtcbiAgICBpdGVyYXRvci5hcnJheUl0ZXJhdGlvbktpbmRfID0ga2luZDtcbiAgICByZXR1cm4gaXRlcmF0b3I7XG4gIH1cbiAgZnVuY3Rpb24gZW50cmllcygpIHtcbiAgICByZXR1cm4gY3JlYXRlQXJyYXlJdGVyYXRvcih0aGlzLCBBUlJBWV9JVEVSQVRPUl9LSU5EX0VOVFJJRVMpO1xuICB9XG4gIGZ1bmN0aW9uIGtleXMoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUFycmF5SXRlcmF0b3IodGhpcywgQVJSQVlfSVRFUkFUT1JfS0lORF9LRVlTKTtcbiAgfVxuICBmdW5jdGlvbiB2YWx1ZXMoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUFycmF5SXRlcmF0b3IodGhpcywgQVJSQVlfSVRFUkFUT1JfS0lORF9WQUxVRVMpO1xuICB9XG4gIHJldHVybiB7XG4gICAgZ2V0IGVudHJpZXMoKSB7XG4gICAgICByZXR1cm4gZW50cmllcztcbiAgICB9LFxuICAgIGdldCBrZXlzKCkge1xuICAgICAgcmV0dXJuIGtleXM7XG4gICAgfSxcbiAgICBnZXQgdmFsdWVzKCkge1xuICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5LmpzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5LmpzXCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5SXRlcmF0b3IuanNcIiksXG4gICAgICBlbnRyaWVzID0gJF9fMC5lbnRyaWVzLFxuICAgICAga2V5cyA9ICRfXzAua2V5cyxcbiAgICAgIHZhbHVlcyA9ICRfXzAudmFsdWVzO1xuICB2YXIgJF9fMSA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlscy5qc1wiKSxcbiAgICAgIGNoZWNrSXRlcmFibGUgPSAkX18xLmNoZWNrSXRlcmFibGUsXG4gICAgICBpc0NhbGxhYmxlID0gJF9fMS5pc0NhbGxhYmxlLFxuICAgICAgaXNDb25zdHJ1Y3RvciA9ICRfXzEuaXNDb25zdHJ1Y3RvcixcbiAgICAgIG1heWJlQWRkRnVuY3Rpb25zID0gJF9fMS5tYXliZUFkZEZ1bmN0aW9ucyxcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IgPSAkX18xLm1heWJlQWRkSXRlcmF0b3IsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMS5yZWdpc3RlclBvbHlmaWxsLFxuICAgICAgdG9JbnRlZ2VyID0gJF9fMS50b0ludGVnZXIsXG4gICAgICB0b0xlbmd0aCA9ICRfXzEudG9MZW5ndGgsXG4gICAgICB0b09iamVjdCA9ICRfXzEudG9PYmplY3Q7XG4gIGZ1bmN0aW9uIGZyb20oYXJyTGlrZSkge1xuICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1syXTtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGl0ZW1zID0gdG9PYmplY3QoYXJyTGlrZSk7XG4gICAgdmFyIG1hcHBpbmcgPSBtYXBGbiAhPT0gdW5kZWZpbmVkO1xuICAgIHZhciBrID0gMDtcbiAgICB2YXIgYXJyLFxuICAgICAgICBsZW47XG4gICAgaWYgKG1hcHBpbmcgJiYgIWlzQ2FsbGFibGUobWFwRm4pKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgaWYgKGNoZWNrSXRlcmFibGUoaXRlbXMpKSB7XG4gICAgICBhcnIgPSBpc0NvbnN0cnVjdG9yKEMpID8gbmV3IEMoKSA6IFtdO1xuICAgICAgZm9yICh2YXIgJF9fMiA9IGl0ZW1zWyR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5KFN5bWJvbC5pdGVyYXRvcildKCksXG4gICAgICAgICAgJF9fMzsgISgkX18zID0gJF9fMi5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICB2YXIgaXRlbSA9ICRfXzMudmFsdWU7XG4gICAgICAgIHtcbiAgICAgICAgICBpZiAobWFwcGluZykge1xuICAgICAgICAgICAgYXJyW2tdID0gbWFwRm4uY2FsbCh0aGlzQXJnLCBpdGVtLCBrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyW2tdID0gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaysrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhcnIubGVuZ3RoID0gaztcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuICAgIGxlbiA9IHRvTGVuZ3RoKGl0ZW1zLmxlbmd0aCk7XG4gICAgYXJyID0gaXNDb25zdHJ1Y3RvcihDKSA/IG5ldyBDKGxlbikgOiBuZXcgQXJyYXkobGVuKTtcbiAgICBmb3IgKDsgayA8IGxlbjsgaysrKSB7XG4gICAgICBpZiAobWFwcGluZykge1xuICAgICAgICBhcnJba10gPSB0eXBlb2YgdGhpc0FyZyA9PT0gJ3VuZGVmaW5lZCcgPyBtYXBGbihpdGVtc1trXSwgaykgOiBtYXBGbi5jYWxsKHRoaXNBcmcsIGl0ZW1zW2tdLCBrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFycltrXSA9IGl0ZW1zW2tdO1xuICAgICAgfVxuICAgIH1cbiAgICBhcnIubGVuZ3RoID0gbGVuO1xuICAgIHJldHVybiBhcnI7XG4gIH1cbiAgZnVuY3Rpb24gb2YoKSB7XG4gICAgZm9yICh2YXIgaXRlbXMgPSBbXSxcbiAgICAgICAgJF9fNCA9IDA7ICRfXzQgPCBhcmd1bWVudHMubGVuZ3RoOyAkX180KyspXG4gICAgICBpdGVtc1skX180XSA9IGFyZ3VtZW50c1skX180XTtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgICB2YXIgYXJyID0gaXNDb25zdHJ1Y3RvcihDKSA/IG5ldyBDKGxlbikgOiBuZXcgQXJyYXkobGVuKTtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGxlbjsgaysrKSB7XG4gICAgICBhcnJba10gPSBpdGVtc1trXTtcbiAgICB9XG4gICAgYXJyLmxlbmd0aCA9IGxlbjtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIGZ1bmN0aW9uIGZpbGwodmFsdWUpIHtcbiAgICB2YXIgc3RhcnQgPSBhcmd1bWVudHNbMV0gIT09ICh2b2lkIDApID8gYXJndW1lbnRzWzFdIDogMDtcbiAgICB2YXIgZW5kID0gYXJndW1lbnRzWzJdO1xuICAgIHZhciBvYmplY3QgPSB0b09iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuID0gdG9MZW5ndGgob2JqZWN0Lmxlbmd0aCk7XG4gICAgdmFyIGZpbGxTdGFydCA9IHRvSW50ZWdlcihzdGFydCk7XG4gICAgdmFyIGZpbGxFbmQgPSBlbmQgIT09IHVuZGVmaW5lZCA/IHRvSW50ZWdlcihlbmQpIDogbGVuO1xuICAgIGZpbGxTdGFydCA9IGZpbGxTdGFydCA8IDAgPyBNYXRoLm1heChsZW4gKyBmaWxsU3RhcnQsIDApIDogTWF0aC5taW4oZmlsbFN0YXJ0LCBsZW4pO1xuICAgIGZpbGxFbmQgPSBmaWxsRW5kIDwgMCA/IE1hdGgubWF4KGxlbiArIGZpbGxFbmQsIDApIDogTWF0aC5taW4oZmlsbEVuZCwgbGVuKTtcbiAgICB3aGlsZSAoZmlsbFN0YXJ0IDwgZmlsbEVuZCkge1xuICAgICAgb2JqZWN0W2ZpbGxTdGFydF0gPSB2YWx1ZTtcbiAgICAgIGZpbGxTdGFydCsrO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIGZpbmQocHJlZGljYXRlKSB7XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgcmV0dXJuIGZpbmRIZWxwZXIodGhpcywgcHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgfVxuICBmdW5jdGlvbiBmaW5kSW5kZXgocHJlZGljYXRlKSB7XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgcmV0dXJuIGZpbmRIZWxwZXIodGhpcywgcHJlZGljYXRlLCB0aGlzQXJnLCB0cnVlKTtcbiAgfVxuICBmdW5jdGlvbiBmaW5kSGVscGVyKHNlbGYsIHByZWRpY2F0ZSkge1xuICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzJdO1xuICAgIHZhciByZXR1cm5JbmRleCA9IGFyZ3VtZW50c1szXSAhPT0gKHZvaWQgMCkgPyBhcmd1bWVudHNbM10gOiBmYWxzZTtcbiAgICB2YXIgb2JqZWN0ID0gdG9PYmplY3Qoc2VsZik7XG4gICAgdmFyIGxlbiA9IHRvTGVuZ3RoKG9iamVjdC5sZW5ndGgpO1xuICAgIGlmICghaXNDYWxsYWJsZShwcmVkaWNhdGUpKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gb2JqZWN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBvYmplY3QpKSB7XG4gICAgICAgIHJldHVybiByZXR1cm5JbmRleCA/IGkgOiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldHVybkluZGV4ID8gLTEgOiB1bmRlZmluZWQ7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxBcnJheShnbG9iYWwpIHtcbiAgICB2YXIgJF9fNSA9IGdsb2JhbCxcbiAgICAgICAgQXJyYXkgPSAkX181LkFycmF5LFxuICAgICAgICBPYmplY3QgPSAkX181Lk9iamVjdCxcbiAgICAgICAgU3ltYm9sID0gJF9fNS5TeW1ib2w7XG4gICAgbWF5YmVBZGRGdW5jdGlvbnMoQXJyYXkucHJvdG90eXBlLCBbJ2VudHJpZXMnLCBlbnRyaWVzLCAna2V5cycsIGtleXMsICd2YWx1ZXMnLCB2YWx1ZXMsICdmaWxsJywgZmlsbCwgJ2ZpbmQnLCBmaW5kLCAnZmluZEluZGV4JywgZmluZEluZGV4XSk7XG4gICAgbWF5YmVBZGRGdW5jdGlvbnMoQXJyYXksIFsnZnJvbScsIGZyb20sICdvZicsIG9mXSk7XG4gICAgbWF5YmVBZGRJdGVyYXRvcihBcnJheS5wcm90b3R5cGUsIHZhbHVlcywgU3ltYm9sKTtcbiAgICBtYXliZUFkZEl0ZXJhdG9yKE9iamVjdC5nZXRQcm90b3R5cGVPZihbXS52YWx1ZXMoKSksIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgU3ltYm9sKTtcbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsQXJyYXkpO1xuICByZXR1cm4ge1xuICAgIGdldCBmcm9tKCkge1xuICAgICAgcmV0dXJuIGZyb207XG4gICAgfSxcbiAgICBnZXQgb2YoKSB7XG4gICAgICByZXR1cm4gb2Y7XG4gICAgfSxcbiAgICBnZXQgZmlsbCgpIHtcbiAgICAgIHJldHVybiBmaWxsO1xuICAgIH0sXG4gICAgZ2V0IGZpbmQoKSB7XG4gICAgICByZXR1cm4gZmluZDtcbiAgICB9LFxuICAgIGdldCBmaW5kSW5kZXgoKSB7XG4gICAgICByZXR1cm4gZmluZEluZGV4O1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsQXJyYXkoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxBcnJheTtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheS5qc1wiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvT2JqZWN0LmpzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL09iamVjdC5qc1wiO1xuICB2YXIgJF9fMCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlscy5qc1wiKSxcbiAgICAgIG1heWJlQWRkRnVuY3Rpb25zID0gJF9fMC5tYXliZUFkZEZ1bmN0aW9ucyxcbiAgICAgIHJlZ2lzdGVyUG9seWZpbGwgPSAkX18wLnJlZ2lzdGVyUG9seWZpbGw7XG4gIHZhciAkX18xID0gJHRyYWNldXJSdW50aW1lLFxuICAgICAgZGVmaW5lUHJvcGVydHkgPSAkX18xLmRlZmluZVByb3BlcnR5LFxuICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gJF9fMS5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gICAgICBnZXRPd25Qcm9wZXJ0eU5hbWVzID0gJF9fMS5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAgICAgaXNQcml2YXRlTmFtZSA9ICRfXzEuaXNQcml2YXRlTmFtZSxcbiAgICAgIGtleXMgPSAkX18xLmtleXM7XG4gIGZ1bmN0aW9uIGlzKGxlZnQsIHJpZ2h0KSB7XG4gICAgaWYgKGxlZnQgPT09IHJpZ2h0KVxuICAgICAgcmV0dXJuIGxlZnQgIT09IDAgfHwgMSAvIGxlZnQgPT09IDEgLyByaWdodDtcbiAgICByZXR1cm4gbGVmdCAhPT0gbGVmdCAmJiByaWdodCAhPT0gcmlnaHQ7XG4gIH1cbiAgZnVuY3Rpb24gYXNzaWduKHRhcmdldCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgdmFyIHByb3BzID0gc291cmNlID09IG51bGwgPyBbXSA6IGtleXMoc291cmNlKTtcbiAgICAgIHZhciBwLFxuICAgICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcbiAgICAgIGZvciAocCA9IDA7IHAgPCBsZW5ndGg7IHArKykge1xuICAgICAgICB2YXIgbmFtZSA9IHByb3BzW3BdO1xuICAgICAgICBpZiAoaXNQcml2YXRlTmFtZShuYW1lKSlcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgdGFyZ2V0W25hbWVdID0gc291cmNlW25hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG4gIGZ1bmN0aW9uIG1peGluKHRhcmdldCwgc291cmNlKSB7XG4gICAgdmFyIHByb3BzID0gZ2V0T3duUHJvcGVydHlOYW1lcyhzb3VyY2UpO1xuICAgIHZhciBwLFxuICAgICAgICBkZXNjcmlwdG9yLFxuICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG4gICAgZm9yIChwID0gMDsgcCA8IGxlbmd0aDsgcCsrKSB7XG4gICAgICB2YXIgbmFtZSA9IHByb3BzW3BdO1xuICAgICAgaWYgKGlzUHJpdmF0ZU5hbWUobmFtZSkpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgZGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHByb3BzW3BdKTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcHNbcF0sIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsT2JqZWN0KGdsb2JhbCkge1xuICAgIHZhciBPYmplY3QgPSBnbG9iYWwuT2JqZWN0O1xuICAgIG1heWJlQWRkRnVuY3Rpb25zKE9iamVjdCwgWydhc3NpZ24nLCBhc3NpZ24sICdpcycsIGlzLCAnbWl4aW4nLCBtaXhpbl0pO1xuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxPYmplY3QpO1xuICByZXR1cm4ge1xuICAgIGdldCBpcygpIHtcbiAgICAgIHJldHVybiBpcztcbiAgICB9LFxuICAgIGdldCBhc3NpZ24oKSB7XG4gICAgICByZXR1cm4gYXNzaWduO1xuICAgIH0sXG4gICAgZ2V0IG1peGluKCkge1xuICAgICAgcmV0dXJuIG1peGluO1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsT2JqZWN0KCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsT2JqZWN0O1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL09iamVjdC5qc1wiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvTnVtYmVyLmpzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL051bWJlci5qc1wiO1xuICB2YXIgJF9fMCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlscy5qc1wiKSxcbiAgICAgIGlzTnVtYmVyID0gJF9fMC5pc051bWJlcixcbiAgICAgIG1heWJlQWRkQ29uc3RzID0gJF9fMC5tYXliZUFkZENvbnN0cyxcbiAgICAgIG1heWJlQWRkRnVuY3Rpb25zID0gJF9fMC5tYXliZUFkZEZ1bmN0aW9ucyxcbiAgICAgIHJlZ2lzdGVyUG9seWZpbGwgPSAkX18wLnJlZ2lzdGVyUG9seWZpbGwsXG4gICAgICB0b0ludGVnZXIgPSAkX18wLnRvSW50ZWdlcjtcbiAgdmFyICRhYnMgPSBNYXRoLmFicztcbiAgdmFyICRpc0Zpbml0ZSA9IGlzRmluaXRlO1xuICB2YXIgJGlzTmFOID0gaXNOYU47XG4gIHZhciBNQVhfU0FGRV9JTlRFR0VSID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgdmFyIE1JTl9TQUZFX0lOVEVHRVIgPSAtTWF0aC5wb3coMiwgNTMpICsgMTtcbiAgdmFyIEVQU0lMT04gPSBNYXRoLnBvdygyLCAtNTIpO1xuICBmdW5jdGlvbiBOdW1iZXJJc0Zpbml0ZShudW1iZXIpIHtcbiAgICByZXR1cm4gaXNOdW1iZXIobnVtYmVyKSAmJiAkaXNGaW5pdGUobnVtYmVyKTtcbiAgfVxuICA7XG4gIGZ1bmN0aW9uIGlzSW50ZWdlcihudW1iZXIpIHtcbiAgICByZXR1cm4gTnVtYmVySXNGaW5pdGUobnVtYmVyKSAmJiB0b0ludGVnZXIobnVtYmVyKSA9PT0gbnVtYmVyO1xuICB9XG4gIGZ1bmN0aW9uIE51bWJlcklzTmFOKG51bWJlcikge1xuICAgIHJldHVybiBpc051bWJlcihudW1iZXIpICYmICRpc05hTihudW1iZXIpO1xuICB9XG4gIDtcbiAgZnVuY3Rpb24gaXNTYWZlSW50ZWdlcihudW1iZXIpIHtcbiAgICBpZiAoTnVtYmVySXNGaW5pdGUobnVtYmVyKSkge1xuICAgICAgdmFyIGludGVncmFsID0gdG9JbnRlZ2VyKG51bWJlcik7XG4gICAgICBpZiAoaW50ZWdyYWwgPT09IG51bWJlcilcbiAgICAgICAgcmV0dXJuICRhYnMoaW50ZWdyYWwpIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbE51bWJlcihnbG9iYWwpIHtcbiAgICB2YXIgTnVtYmVyID0gZ2xvYmFsLk51bWJlcjtcbiAgICBtYXliZUFkZENvbnN0cyhOdW1iZXIsIFsnTUFYX1NBRkVfSU5URUdFUicsIE1BWF9TQUZFX0lOVEVHRVIsICdNSU5fU0FGRV9JTlRFR0VSJywgTUlOX1NBRkVfSU5URUdFUiwgJ0VQU0lMT04nLCBFUFNJTE9OXSk7XG4gICAgbWF5YmVBZGRGdW5jdGlvbnMoTnVtYmVyLCBbJ2lzRmluaXRlJywgTnVtYmVySXNGaW5pdGUsICdpc0ludGVnZXInLCBpc0ludGVnZXIsICdpc05hTicsIE51bWJlcklzTmFOLCAnaXNTYWZlSW50ZWdlcicsIGlzU2FmZUludGVnZXJdKTtcbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsTnVtYmVyKTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgTUFYX1NBRkVfSU5URUdFUigpIHtcbiAgICAgIHJldHVybiBNQVhfU0FGRV9JTlRFR0VSO1xuICAgIH0sXG4gICAgZ2V0IE1JTl9TQUZFX0lOVEVHRVIoKSB7XG4gICAgICByZXR1cm4gTUlOX1NBRkVfSU5URUdFUjtcbiAgICB9LFxuICAgIGdldCBFUFNJTE9OKCkge1xuICAgICAgcmV0dXJuIEVQU0lMT047XG4gICAgfSxcbiAgICBnZXQgaXNGaW5pdGUoKSB7XG4gICAgICByZXR1cm4gTnVtYmVySXNGaW5pdGU7XG4gICAgfSxcbiAgICBnZXQgaXNJbnRlZ2VyKCkge1xuICAgICAgcmV0dXJuIGlzSW50ZWdlcjtcbiAgICB9LFxuICAgIGdldCBpc05hTigpIHtcbiAgICAgIHJldHVybiBOdW1iZXJJc05hTjtcbiAgICB9LFxuICAgIGdldCBpc1NhZmVJbnRlZ2VyKCkge1xuICAgICAgcmV0dXJuIGlzU2FmZUludGVnZXI7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxOdW1iZXIoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxOdW1iZXI7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvTnVtYmVyLmpzXCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9wb2x5ZmlsbHMuanNcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvcG9seWZpbGxzLmpzXCI7XG4gIHZhciBwb2x5ZmlsbEFsbCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlscy5qc1wiKS5wb2x5ZmlsbEFsbDtcbiAgcG9seWZpbGxBbGwoUmVmbGVjdC5nbG9iYWwpO1xuICB2YXIgc2V0dXBHbG9iYWxzID0gJHRyYWNldXJSdW50aW1lLnNldHVwR2xvYmFscztcbiAgJHRyYWNldXJSdW50aW1lLnNldHVwR2xvYmFscyA9IGZ1bmN0aW9uKGdsb2JhbCkge1xuICAgIHNldHVwR2xvYmFscyhnbG9iYWwpO1xuICAgIHBvbHlmaWxsQWxsKGdsb2JhbCk7XG4gIH07XG4gIHJldHVybiB7fTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3BvbHlmaWxscy5qc1wiICsgJycpO1xuIl19
