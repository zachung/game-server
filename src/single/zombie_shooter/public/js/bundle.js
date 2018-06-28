(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var CollisionDetection = function () {
  function CollisionDetection() {
    _classCallCheck(this, CollisionDetection);

    this.collidingRecord = [];
    this.collidingDelay = 1000; // ms
  }

  _createClass(CollisionDetection, [{
    key: "CircleRectColliding",
    value: function CircleRectColliding(circle, rect) {
      // delay
      if (this.collidingRecord[circle] && this.collidingRecord[circle].with === rect && new Date().getTime() < this.collidingRecord[circle].time.getTime() + this.collidingDelay) {
        return false;
      }
      var distX = Math.abs(circle.x - rect.x - rect.w / 2);
      var distY = Math.abs(circle.y - rect.y - rect.h / 2);

      if (distX > rect.w / 2 + circle.r) {
        return false;
      }
      if (distY > rect.h / 2 + circle.r) {
        return false;
      }

      if (distX <= rect.w / 2) {
        return true;
      }
      if (distY <= rect.h / 2) {
        return true;
      }

      var dx = distX - rect.w / 2;
      var dy = distY - rect.h / 2;
      var isCollision = dx * dx + dy * dy <= circle.r * circle.r;
      if (isCollision) {
        this.collidingRecord[circle] = {
          with: rect,
          time: new Date()
        };
      }
      return isCollision;
    }
  }, {
    key: "RectRectColliding",
    value: function RectRectColliding(rect1, rect2) {
      if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y) {
        // collision detected!
        return true;
      }
      return false;
    }
  }, {
    key: "RectPointColliding",
    value: function RectPointColliding(rect, point) {
      if (rect.x <= point.x && rect.x + rect.width >= point.x && rect.y <= point.y && rect.height + rect.y >= point.y) {
        // collision detected!
        return true;
      }
      return false;
    }
  }]);

  return CollisionDetection;
}();

exports.default = CollisionDetection;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Item = require('./GameObject/Item');

var _Item2 = _interopRequireDefault(_Item);

var _Thomas = require('./GameObject/Thomas');

var _Thomas2 = _interopRequireDefault(_Thomas);

var _Zombie = require('./GameObject/Zombie');

var _Zombie2 = _interopRequireDefault(_Zombie);

var _Gun = require('./GameObject/Gun');

var _Gun2 = _interopRequireDefault(_Gun);

var _Collision = require('./Collision');

var _Collision2 = _interopRequireDefault(_Collision);

var _ScrollingBackground = require('./ScrollingBackground');

var _ScrollingBackground2 = _interopRequireDefault(_ScrollingBackground);

var _Score = require('./Score');

var _Score2 = _interopRequireDefault(_Score);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var ENGINE = {
  Resource: {},
  difficulty: 10
};
var collisionDetection = new _Collision2.default();

ENGINE.Intro = {

  level: 1,

  create: function create() {
    this.app.scrollingBackground = new _ScrollingBackground2.default(this.app.images.background);
    this.app.scrollingBackground.init(this.app.width, this.app.height);

    this.addButton = {
      text: '＋',
      x: this.app.center.x + 200,
      y: this.app.center.y,
      width: 40,
      height: 40,
      background_color: '#eee'
    };
    this.minusButton = {
      text: '－',
      x: this.app.center.x - 200,
      y: this.app.center.y,
      width: 40,
      height: 40,
      background_color: '#eee'
    };
    this.startButton = {
      text: 'Start',
      x: this.app.center.x,
      y: this.app.center.y + 200,
      width: 80,
      height: 40,
      background_color: '#eee'
    };
  },

  enter: function enter() {},

  step: function step(dt) {},

  render: function render(dt) {
    var addButton = this.addButton;
    var minusButton = this.minusButton;
    var startButton = this.startButton;

    this.app.layer.clear('#000');
    // background
    this.app.scrollingBackground.render(this.app);

    this.app.layer.font('40px Georgia').fillText('Level: ' + this.level, this.app.center.x - 30, this.app.center.y).fillStyle(addButton.height + 'px #abc').textWithBackground(addButton.text, addButton.x, addButton.y, addButton.background_color).fillStyle(minusButton.height + 'px #abc').textWithBackground(minusButton.text, minusButton.x, minusButton.y, minusButton.background_color).fillStyle(startButton.height + 'px #abc').textWithBackground(startButton.text, startButton.x, startButton.y, startButton.background_color);
  },

  mousedown: function mousedown(data) {
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
  }

};

ENGINE.Game = {

  create: function create() {
    ENGINE.levelData = new LevelData(this.app.data.levels[ENGINE.difficulty]);
  },

  enter: function enter() {
    var maxRadius = Math.max(this.app.width, this.app.height);

    this.app.scrollingBackground = new _ScrollingBackground2.default(this.app.images.background);
    this.app.scrollingBackground.init(this.app.width, this.app.height);

    this.app.thomas = new _Thomas2.default({
      speed: 128,
      x: this.app.center.x,
      y: this.app.center.y,
      hp: 10,
      defence: 1
    });
    var gun = new _Gun2.default({
      maxRadius: maxRadius,
      colddown: ENGINE.levelData.gunColddown
    });
    this.app.thomas.takeWeapon(gun);

    ENGINE.Resource = this.app.music.play('music', true);
    ENGINE.enemies = [];
    ENGINE.bullets = [];
    ENGINE.items = [];
    ENGINE.score = new _Score2.default();
  },

  step: function step(dt) {
    var _this = this;

    var maxRadius = Math.max(this.app.width, this.app.height);
    // thomas
    var thomas = this.app.thomas;
    // background
    var delta = this.app.scrollingBackground.move(thomas.speed * dt);

    // enemies
    var enemies = ENGINE.enemies;
    if (Math.random() < ENGINE.levelData.monsterSpawnRate) {
      // new place
      var minRadius = ENGINE.levelData.monsterSpawnRadiusMin;
      var spawnRadius = Math.random() * (maxRadius - minRadius) + minRadius;
      var radians = Math.floor(Math.random() * 360);
      var enemy = new _Zombie2.default({
        speed: ENGINE.levelData.monsterSpeed,
        x: Math.cos(radians) * spawnRadius,
        y: Math.sin(radians) * spawnRadius,
        directRadians: -radians
      });
      enemies.push(enemy);
    }
    // enemies running
    enemies.forEach(function (enemy) {
      enemy.faceTo(thomas.x, thomas.y);
      enemy.run(dt);
      enemy.x -= delta[0];
      enemy.y -= delta[1];
      if (collisionDetection.RectRectColliding(enemy, thomas)) {
        console.log('collission');
        if (!thomas.getDamage(enemy.damage * dt)) {
          _this.app.music.stop(ENGINE.Resource);
          _this.app.setState(ENGINE.Game);
        }
      }
    });
    // shoot
    thomas.attack(enemies, dt);

    // gen item
    var items = ENGINE.items;
    if (items.length < 10) {
      var item = new _Item2.default({
        x: Math.random() * this.app.width,
        y: Math.random() * this.app.height,
        type: _Item2.default.gunColddown,
        value: -0.01
      });
      items.push(item);
    }
    items.forEach(function (item) {
      item.x -= delta[0];
      item.y -= delta[1];
      if (collisionDetection.RectRectColliding(item, thomas)) {
        console.log('get item');
        thomas.getItem(item);
        items.splice(items.indexOf(item), 1);
      }
    });
  },

  render: function render(dt) {
    var app = this.app;
    var thomas = this.app.thomas;

    app.layer.clear('#000');
    // background
    app.scrollingBackground.render(app);

    app.layer.font('40px Georgia').fillText('Current: ' + ENGINE.score.getScore(), app.width - 300, 160).font('40px Green').fillText('High: ' + ENGINE.score.getHighScore(), app.width - 300, 80)
    // hp
    .fillStyle('#000').fillRect(20, 20, 300, 30).fillStyle('#F00').fillRect(20, 20, 300 * (thomas.hp / thomas.hpMax), 30);

    app.thomas.render(app.layer);
    ENGINE.enemies.forEach(function (enemy) {
      enemy.render(app);
    });
    ENGINE.items.forEach(function (item) {
      item.render(app.layer);
    });
  },

  keydown: function keydown(data) {
    var direct = 0;
    switch (data.key) {
      case 'a':
        direct |= 8;
        break;
      case 'd':
        direct |= 4;
        break;
      case 'w':
        direct |= 2;
        break;
      case 's':
        direct |= 1;
        break;
    }
    this.app.scrollingBackground.faceTo(direct);
  },

  keyup: function keyup(data) {
    var direct = 15;
    switch (data.key) {
      case 'a':
        direct &= 7;
        break;
      case 'd':
        direct &= 11;
        break;
      case 'w':
        direct &= 13;
        break;
      case 's':
        direct &= 14;
        break;
    }
    this.app.scrollingBackground.faceCancel(direct);
  },

  mousemove: function mousemove(data) {
    this.app.thomas.faceTo(data.x, data.y);
  }

};

var LevelData = function LevelData(data) {
  return new Proxy(data, {
    get: function get(target, name) {
      var val = data[name];
      return val;
    }
  });
};

exports.default = ENGINE;

},{"./Collision":1,"./GameObject/Gun":5,"./GameObject/Item":6,"./GameObject/Thomas":7,"./GameObject/Zombie":8,"./Score":9,"./ScrollingBackground":10}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Ball = function () {
  function Ball(options) {
    _classCallCheck(this, Ball);

    var defaults = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      color: '#e2543e',
      speed: 256,
      directRadians: 0,
      hp: 1,
      damage: 0,
      defence: 0
    };
    var populated = Object.assign(defaults, options);
    for (var key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key];
      }
    }
  }

  _createClass(Ball, [{
    key: 'faceTo',
    value: function faceTo(x, y) {
      this.directRadians = Math.atan2(y - this.y, x - this.x);
    }
  }, {
    key: 'run',
    value: function run(dt) {
      this.x += Math.cos(this.directRadians) * this.speed * dt;
      this.y += Math.sin(this.directRadians) * this.speed * dt;
    }
    /**
     * Gets the damage.
     *
     * @param      {number}  damage  The damage
     * @return     {boolean}  still alive
     */

  }, {
    key: 'getDamage',
    value: function getDamage(damage) {
      this.hp -= damage;
      return this.hp > 0;
    }
  }, {
    key: 'render',
    value: function render(layer) {
      layer.fillStyle(this.color).fillRect(this.x, this.y, this.width, this.height);
    }
  }]);

  return Ball;
}();

exports.default = Ball;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _Ball2 = require('./Ball');

var _Ball3 = _interopRequireDefault(_Ball2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Bullet = function (_Ball) {
  _inherits(Bullet, _Ball);

  function Bullet(options) {
    _classCallCheck(this, Bullet);

    var defaults = {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      color: '#ff0000',
      speed: 1024,
      directRadians: 0,
      damage: 1,
      hp: 1 // can go throw somebody
    };
    var populated = Object.assign(defaults, options);
    return _possibleConstructorReturn(this, (Bullet.__proto__ || Object.getPrototypeOf(Bullet)).call(this, populated));
  }

  _createClass(Bullet, [{
    key: 'render',
    value: function render(layer) {
      layer.fillStyle(this.color).fillRect(this.x, this.y, this.width, this.height);
    }
  }]);

  return Bullet;
}(_Ball3.default);

exports.default = Bullet;

},{"./Ball":3}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _Collision = require('../Collision');

var _Collision2 = _interopRequireDefault(_Collision);

var _Engine = require('../Engine');

var _Engine2 = _interopRequireDefault(_Engine);

var _Bullet = require('./Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var collisionDetection = new _Collision2.default();

var Gun = function () {
  function Gun(options) {
    _classCallCheck(this, Gun);

    var defaults = {
      maxRadius: 0,
      colddown: 0,
      toRadians: Math.asin(-1)
    };
    var populated = Object.assign(defaults, options);
    for (var key in populated) {
      if (populated.hasOwnProperty(key)) {
        this[key] = populated[key];
      }
    }
    this.bullets = [];
    this.nextshoot = 0;
  }

  _createClass(Gun, [{
    key: 'faceTo',
    value: function faceTo(toRadians) {
      this.toRadians = toRadians;
    }
  }, {
    key: 'attack',
    value: function attack(fromX, fromY, dt) {
      if (this.nextshoot > 0) {
        this.nextshoot -= dt;
        return;
      }
      var bullets = this.bullets;
      var bullet = new _Bullet2.default({
        x: fromX,
        y: fromY,
        directRadians: this.toRadians
      });
      bullets.push(bullet);
      // bullet out of screen
      var bulletsIndex = bullets.length - 1;
      while (bulletsIndex >= 0) {
        var bullet = bullets[bulletsIndex];
        if (bullet.x > this.maxRadius || bullet.y > this.maxRadius) {
          bullets.splice(bulletsIndex, 1);
        }
        bulletsIndex -= 1;
      }
      this.nextshoot = this.colddown;
      return bullet;
    }
  }, {
    key: 'step',
    value: function step(enemies, dt) {
      var bullets = this.bullets;
      bullets.forEach(function (bullet) {
        bullet.run(dt);
        enemies.forEach(function (enemy) {
          if (collisionDetection.RectRectColliding(bullet, enemy)) {
            console.log('hit monster');
            // add score
            _Engine2.default.score.add(_Engine2.default.levelData.scorePreHit);
            _Engine2.default.score.save();
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
  }, {
    key: 'render',
    value: function render(layer) {
      this.bullets.forEach(function (bullet) {
        bullet.render(layer);
      });
    }
  }, {
    key: 'upgrade',
    value: function upgrade(type, value, isMultiply) {
      if (!isMultiply) {
        this[type] += value;
      } else {
        this[type] *= value;
      }
    }
  }]);

  return Gun;
}();

exports.default = Gun;

},{"../Collision":1,"../Engine":2,"./Bullet":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _Ball2 = require('./Ball');

var _Ball3 = _interopRequireDefault(_Ball2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Item = function (_Ball) {
  _inherits(Item, _Ball);

  _createClass(Item, null, [{
    key: 'gunColddown',
    get: function get() {
      return 'gunColddown';
    }
  }]);

  function Item() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Item);

    options.speed = 0;
    options.color = '#000';
    return _possibleConstructorReturn(this, (Item.__proto__ || Object.getPrototypeOf(Item)).call(this, options));
  }

  return Item;
}(_Ball3.default);

exports.default = Item;

},{"./Ball":3}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;if (getter === undefined) {
      return undefined;
    }return getter.call(receiver);
  }
};

var _Ball2 = require('./Ball');

var _Ball3 = _interopRequireDefault(_Ball2);

var _Item = require('./Item');

var _Item2 = _interopRequireDefault(_Item);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Thomas = function (_Ball) {
  _inherits(Thomas, _Ball);

  function Thomas(options) {
    _classCallCheck(this, Thomas);

    var _this = _possibleConstructorReturn(this, (Thomas.__proto__ || Object.getPrototypeOf(Thomas)).call(this, options));

    _this.hpMax = _this.hp;
    return _this;
  }

  _createClass(Thomas, [{
    key: 'takeWeapon',
    value: function takeWeapon(weapon) {
      this.weapon = weapon;
    }
  }, {
    key: 'attack',
    value: function attack(enemies, dt) {
      if (!this.weapon) {
        return;
      }
      this.weapon.attack(this.x, this.y, dt);
      this.weapon.step(enemies, dt);
    }
  }, {
    key: 'render',
    value: function render(layer) {
      _get(Thomas.prototype.__proto__ || Object.getPrototypeOf(Thomas.prototype), 'render', this).call(this, layer);
      // gun bullet
      this.weapon.render(layer);
    }
  }, {
    key: 'faceTo',
    value: function faceTo(x, y) {
      _get(Thomas.prototype.__proto__ || Object.getPrototypeOf(Thomas.prototype), 'faceTo', this).call(this, x, y);
      this.weapon.faceTo(this.directRadians);
    }
  }, {
    key: 'getItem',
    value: function getItem(item) {
      switch (item.type) {
        case _Item2.default.gunColddown:
          this.weapon.upgrade('colddown', item.value);
          break;
      }
    }
  }]);

  return Thomas;
}(_Ball3.default);

exports.default = Thomas;

},{"./Ball":3,"./Item":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _Ball2 = require('./Ball');

var _Ball3 = _interopRequireDefault(_Ball2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Zombie = function (_Ball) {
  _inherits(Zombie, _Ball);

  function Zombie(options) {
    _classCallCheck(this, Zombie);

    var defaults = {
      x: 0,
      y: 0,
      width: 128,
      height: 128,
      image: 'zombie',
      speed: 256,
      directRadians: 0,
      hp: 1,
      damage: 1,
      defence: 0
    };
    var populated = Object.assign(defaults, options);

    var _this = _possibleConstructorReturn(this, (Zombie.__proto__ || Object.getPrototypeOf(Zombie)).call(this, populated));

    _this.speed *= Math.random() * 0.8 + 0.2;
    return _this;
  }

  _createClass(Zombie, [{
    key: 'faceTo',
    value: function faceTo(x, y) {
      this.directRadians = Math.atan2(y - this.y, x - this.x);
    }
  }, {
    key: 'run',
    value: function run(dt) {
      this.x += Math.cos(this.directRadians) * this.speed * dt;
      this.y += Math.sin(this.directRadians) * this.speed * dt;
    }
  }, {
    key: 'render',
    value: function render(app) {
      app.layer.drawImage(app.images[this.image], this.x, this.y, this.width, this.height);
    }
  }]);

  return Zombie;
}(_Ball3.default);

exports.default = Zombie;

},{"./Ball":3}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Score = function () {
  function Score() {
    _classCallCheck(this, Score);

    this.scoreCurrent = 0;
    this.scoreMax = 0;
    this.highscore = localStorage.getItem('highscore') || 0;
  }

  _createClass(Score, [{
    key: 'save',
    value: function save() {
      if (this.scoreCurrent > this.highscore) {
        this.highscore = this.scoreCurrent;
        localStorage.setItem('highscore', this.highscore);
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.scoreCurrent = 0;
      this.scoreMax = 0;
    }
  }, {
    key: 'add',
    value: function add(score) {
      this.scoreCurrent += score;
      this.scoreMax = Math.max(this.scoreMax, this.scoreCurrent);
    }
  }, {
    key: 'newScore',
    value: function newScore() {
      return this.scoreCurrent === this.scoreMax;
    }
  }, {
    key: 'getHighScore',
    value: function getHighScore() {
      return Number(this.highscore).toFixed(2);
    }
  }, {
    key: 'getScore',
    value: function getScore() {
      return Number(this.scoreCurrent).toFixed(2);
    }
  }]);

  return Score;
}();

exports.default = Score;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var ScrollingBackground = function () {
  function ScrollingBackground(image) {
    _classCallCheck(this, ScrollingBackground);

    this.backgrounds = [];
    this.bw = image.width;
    this.bh = image.height;
    this.image = image;
    this.layer = {};
    this.directRadians = Math.asin(-1);
    this.faceDirectBits = 0; // LRUD
    this.dontMove = true;
  }

  _createClass(ScrollingBackground, [{
    key: "move",
    value: function move(speed) {
      var _this = this;

      if (this.dontMove) {
        return [0, 0];
      }
      var dx = Math.cos(this.directRadians) * speed;
      var dy = Math.sin(this.directRadians) * speed;
      var lw = this.layer.w;
      var lh = this.layer.h;
      var nx = Math.ceil(lw / this.bw) + 1;
      var ny = Math.ceil(lh / this.bh) + 1;
      this.backgrounds.forEach(function (e) {
        e[0] -= dx;
        e[1] -= dy;
        if (e[0] < -_this.bw) {
          e[0] += (nx + 1) * _this.bw;
        }
        if (e[0] > lw) {
          e[0] -= (nx + 1) * _this.bw;
        }
        if (e[1] < -_this.bh) {
          e[1] += (ny + 1) * _this.bh;
        }
        if (e[1] > lh) {
          e[1] -= (ny + 1) * _this.bh;
        }
      });
      return [dx, dy];
    }
  }, {
    key: "init",
    value: function init(w, h) {
      this.layer = {
        w: w,
        h: h
      };
      var nx = Math.ceil(w / this.bw) + 1;
      var ny = Math.ceil(h / this.bh) + 1;
      for (var i = -1; i <= nx; i++) {
        for (var j = -1; j <= ny; j++) {
          this.backgrounds.push([i * this.bw, j * this.bh]);
        }
      }
    }
  }, {
    key: "_turn",
    value: function _turn() {
      var x = 0;
      var y = 0;
      x -= this.faceDirectBits >> 3 & 1; // L
      x += this.faceDirectBits >> 2 & 1; // R
      y -= this.faceDirectBits >> 1 & 1; // U
      y += this.faceDirectBits >> 0 & 1; // D
      this.directRadians = Math.atan2(y, x);
      this.dontMove = x === 0 && y === 0;
    }
  }, {
    key: "faceTo",
    value: function faceTo(direct) {
      this.faceDirectBits |= direct;
      this._turn();
    }
  }, {
    key: "faceCancel",
    value: function faceCancel(direct) {
      this.faceDirectBits &= direct;
      this._turn();
    }
  }, {
    key: "render",
    value: function render(app) {
      var _this2 = this;

      this.backgrounds.forEach(function (e) {
        app.layer.drawImage(_this2.image, e[0], e[1]);
      });
    }
  }]);

  return ScrollingBackground;
}();

exports.default = ScrollingBackground;

},{}],11:[function(require,module,exports){
'use strict';

var _Engine = require('./Engine');

var _Engine2 = _interopRequireDefault(_Engine);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

new PLAYGROUND.Application({

  paths: {
    sounds: '/sounds/',
    rewriteURL: {
      background: '/images/background.png',
      zombie: '/images/zombie.png'
    }
  },

  create: function create() {
    this.loadSounds('music');
    this.loadImage(['<background>', '<zombie>']);
    this.loadData('levels');
  },

  ready: function ready() {
    this.setState(_Engine2.default.Intro);
  },

  mousedown: function mousedown(data) {},

  scale: 0.5
  // container: exampleContainer

});

},{"./Engine":2}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQ29sbGlzaW9uLmpzIiwic3JjL0VuZ2luZS5qcyIsInNyYy9HYW1lT2JqZWN0L0JhbGwuanMiLCJzcmMvR2FtZU9iamVjdC9CdWxsZXQuanMiLCJzcmMvR2FtZU9iamVjdC9HdW4uanMiLCJzcmMvR2FtZU9iamVjdC9JdGVtLmpzIiwic3JjL0dhbWVPYmplY3QvVGhvbWFzLmpzIiwic3JjL0dhbWVPYmplY3QvWm9tYmllLmpzIiwic3JjL1Njb3JlLmpzIiwic3JjL1Njcm9sbGluZ0JhY2tncm91bmQuanMiLCJzcmMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ0FNLHFCO0FBQ0osV0FBQSxrQkFBQSxHQUFlO0FBQUEsb0JBQUEsSUFBQSxFQUFBLGtCQUFBOztBQUNiLFNBQUEsZUFBQSxHQUFBLEVBQUE7QUFDQSxTQUFBLGNBQUEsR0FGYSxJQUViLENBRmEsQ0FFYztBQUM1Qjs7Ozt3Q0FDb0IsTSxFQUFRLEksRUFBTTtBQUNqQztBQUNBLFVBQUksS0FBQSxlQUFBLENBQUEsTUFBQSxLQUNGLEtBQUEsZUFBQSxDQUFBLE1BQUEsRUFBQSxJQUFBLEtBREUsSUFBQSxJQUVELElBQUQsSUFBQyxHQUFELE9BQUMsS0FBd0IsS0FBQSxlQUFBLENBQUEsTUFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBLEtBQThDLEtBRnpFLGNBQUEsRUFFOEY7QUFDNUYsZUFBQSxLQUFBO0FBQ0Q7QUFDRCxVQUFJLFFBQVEsS0FBQSxHQUFBLENBQVMsT0FBQSxDQUFBLEdBQVcsS0FBWCxDQUFBLEdBQW9CLEtBQUEsQ0FBQSxHQUF6QyxDQUFZLENBQVo7QUFDQSxVQUFJLFFBQVEsS0FBQSxHQUFBLENBQVMsT0FBQSxDQUFBLEdBQVcsS0FBWCxDQUFBLEdBQW9CLEtBQUEsQ0FBQSxHQUF6QyxDQUFZLENBQVo7O0FBRUEsVUFBSSxR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QUFBLENBQXlCLFVBQUEsQ0FBQSxFQUFLO0FBQzVCLFlBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBb0IsT0FBcEIsS0FBQSxFQUFnQyxFQUFoQyxDQUFnQyxDQUFoQyxFQUFzQyxFQUF0QyxDQUFzQyxDQUF0QztBQURGLE9BQUE7QUFHRDs7Ozs7O2tCQUdZLG1COzs7OztBQzlFZixJQUFBLFVBQUEsUUFBQSxVQUFBLENBQUE7Ozs7Ozs7O0FBRUEsSUFBSSxXQUFKLFdBQUEsQ0FBMkI7O0FBRXpCLFNBQU87QUFDTCxZQURLLFVBQUE7QUFFTCxnQkFBWTtBQUNWLGtCQURVLHdCQUFBO0FBRVYsY0FBUTtBQUZFO0FBRlAsR0FGa0I7O0FBVXpCLFVBQVEsU0FBQSxNQUFBLEdBQVk7QUFDbEIsU0FBQSxVQUFBLENBQUEsT0FBQTtBQUNBLFNBQUEsU0FBQSxDQUFlLENBQUEsY0FBQSxFQUFmLFVBQWUsQ0FBZjtBQUNBLFNBQUEsUUFBQSxDQUFBLFFBQUE7QUFidUIsR0FBQTs7QUFnQnpCLFNBQU8sU0FBQSxLQUFBLEdBQVk7QUFDakIsU0FBQSxRQUFBLENBQWMsU0FBQSxPQUFBLENBQWQsS0FBQTtBQWpCdUIsR0FBQTs7QUFvQnpCLGFBQVcsU0FBQSxTQUFBLENBQUEsSUFBQSxFQUFnQixDQXBCRixDQUFBOztBQXVCekIsU0FBTztBQUNQOztBQXhCeUIsQ0FBM0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBDb2xsaXNpb25EZXRlY3Rpb24ge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuY29sbGlkaW5nUmVjb3JkID0gW11cclxuICAgIHRoaXMuY29sbGlkaW5nRGVsYXkgPSAxMDAwIC8vIG1zXHJcbiAgfVxyXG4gIENpcmNsZVJlY3RDb2xsaWRpbmcgKGNpcmNsZSwgcmVjdCkge1xyXG4gICAgLy8gZGVsYXlcclxuICAgIGlmICh0aGlzLmNvbGxpZGluZ1JlY29yZFtjaXJjbGVdICYmXHJcbiAgICAgIHRoaXMuY29sbGlkaW5nUmVjb3JkW2NpcmNsZV0ud2l0aCA9PT0gcmVjdCAmJlxyXG4gICAgICAobmV3IERhdGUoKSkuZ2V0VGltZSgpIDwgdGhpcy5jb2xsaWRpbmdSZWNvcmRbY2lyY2xlXS50aW1lLmdldFRpbWUoKSArIHRoaXMuY29sbGlkaW5nRGVsYXkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgICB2YXIgZGlzdFggPSBNYXRoLmFicyhjaXJjbGUueCAtIHJlY3QueCAtIHJlY3QudyAvIDIpXHJcbiAgICB2YXIgZGlzdFkgPSBNYXRoLmFicyhjaXJjbGUueSAtIHJlY3QueSAtIHJlY3QuaCAvIDIpXHJcblxyXG4gICAgaWYgKGRpc3RYID4gKHJlY3QudyAvIDIgKyBjaXJjbGUucikpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIGlmIChkaXN0WSA+IChyZWN0LmggLyAyICsgY2lyY2xlLnIpKSB7IHJldHVybiBmYWxzZSB9XHJcblxyXG4gICAgaWYgKGRpc3RYIDw9IChyZWN0LncgLyAyKSkgeyByZXR1cm4gdHJ1ZSB9XHJcbiAgICBpZiAoZGlzdFkgPD0gKHJlY3QuaCAvIDIpKSB7IHJldHVybiB0cnVlIH1cclxuXHJcbiAgICB2YXIgZHggPSBkaXN0WCAtIHJlY3QudyAvIDJcclxuICAgIHZhciBkeSA9IGRpc3RZIC0gcmVjdC5oIC8gMlxyXG4gICAgdmFyIGlzQ29sbGlzaW9uID0gKGR4ICogZHggKyBkeSAqIGR5IDw9IChjaXJjbGUuciAqIGNpcmNsZS5yKSlcclxuICAgIGlmIChpc0NvbGxpc2lvbikge1xyXG4gICAgICB0aGlzLmNvbGxpZGluZ1JlY29yZFtjaXJjbGVdID0ge1xyXG4gICAgICAgIHdpdGg6IHJlY3QsXHJcbiAgICAgICAgdGltZTogbmV3IERhdGUoKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaXNDb2xsaXNpb25cclxuICB9XHJcbiAgUmVjdFJlY3RDb2xsaWRpbmcgKHJlY3QxLCByZWN0Mikge1xyXG4gICAgaWYgKHJlY3QxLnggPCByZWN0Mi54ICsgcmVjdDIud2lkdGggJiZcclxuICAgICAgcmVjdDEueCArIHJlY3QxLndpZHRoID4gcmVjdDIueCAmJlxyXG4gICAgICByZWN0MS55IDwgcmVjdDIueSArIHJlY3QyLmhlaWdodCAmJlxyXG4gICAgICByZWN0MS5oZWlnaHQgKyByZWN0MS55ID4gcmVjdDIueSkge1xyXG4gICAgICAvLyBjb2xsaXNpb24gZGV0ZWN0ZWQhXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbiAgUmVjdFBvaW50Q29sbGlkaW5nIChyZWN0LCBwb2ludCkge1xyXG4gICAgaWYgKHJlY3QueCA8PSBwb2ludC54ICYmXHJcbiAgICAgIHJlY3QueCArIHJlY3Qud2lkdGggPj0gcG9pbnQueCAmJlxyXG4gICAgICByZWN0LnkgPD0gcG9pbnQueSAmJlxyXG4gICAgICByZWN0LmhlaWdodCArIHJlY3QueSA+PSBwb2ludC55KSB7XHJcbiAgICAgIC8vIGNvbGxpc2lvbiBkZXRlY3RlZCFcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29sbGlzaW9uRGV0ZWN0aW9uXHJcbiIsImltcG9ydCBJdGVtIGZyb20gJy4vR2FtZU9iamVjdC9JdGVtJ1xyXG5pbXBvcnQgVGhvbWFzIGZyb20gJy4vR2FtZU9iamVjdC9UaG9tYXMnXHJcbmltcG9ydCBab21iaWUgZnJvbSAnLi9HYW1lT2JqZWN0L1pvbWJpZSdcclxuaW1wb3J0IEd1biBmcm9tICcuL0dhbWVPYmplY3QvR3VuJ1xyXG5cclxuaW1wb3J0IENvbGxpc2lvbkRldGVjdGlvbiBmcm9tICcuL0NvbGxpc2lvbidcclxuaW1wb3J0IFNjcm9sbGluZ0JhY2tncm91bmQgZnJvbSAnLi9TY3JvbGxpbmdCYWNrZ3JvdW5kJ1xyXG5pbXBvcnQgU2NvcmUgZnJvbSAnLi9TY29yZSdcclxuXHJcbnZhciBFTkdJTkUgPSB7XHJcbiAgUmVzb3VyY2U6IHt9LFxyXG4gIGRpZmZpY3VsdHk6IDEwXHJcbn1cclxudmFyIGNvbGxpc2lvbkRldGVjdGlvbiA9IG5ldyBDb2xsaXNpb25EZXRlY3Rpb24oKVxyXG5cclxuRU5HSU5FLkludHJvID0ge1xyXG5cclxuICBsZXZlbDogMSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmFwcC5zY3JvbGxpbmdCYWNrZ3JvdW5kID0gbmV3IFNjcm9sbGluZ0JhY2tncm91bmQodGhpcy5hcHAuaW1hZ2VzLmJhY2tncm91bmQpXHJcbiAgICB0aGlzLmFwcC5zY3JvbGxpbmdCYWNrZ3JvdW5kLmluaXQodGhpcy5hcHAud2lkdGgsIHRoaXMuYXBwLmhlaWdodClcclxuXHJcbiAgICB0aGlzLmFkZEJ1dHRvbiA9IHtcclxuICAgICAgdGV4dDogJ++8iycsXHJcbiAgICAgIHg6IHRoaXMuYXBwLmNlbnRlci54ICsgMjAwLFxyXG4gICAgICB5OiB0aGlzLmFwcC5jZW50ZXIueSxcclxuICAgICAgd2lkdGg6IDQwLFxyXG4gICAgICBoZWlnaHQ6IDQwLFxyXG4gICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2VlZSdcclxuICAgIH1cclxuICAgIHRoaXMubWludXNCdXR0b24gPSB7XHJcbiAgICAgIHRleHQ6ICfvvI0nLFxyXG4gICAgICB4OiB0aGlzLmFwcC5jZW50ZXIueCAtIDIwMCxcclxuICAgICAgeTogdGhpcy5hcHAuY2VudGVyLnksXHJcbiAgICAgIHdpZHRoOiA0MCxcclxuICAgICAgaGVpZ2h0OiA0MCxcclxuICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNlZWUnXHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXJ0QnV0dG9uID0ge1xyXG4gICAgICB0ZXh0OiAnU3RhcnQnLFxyXG4gICAgICB4OiB0aGlzLmFwcC5jZW50ZXIueCxcclxuICAgICAgeTogdGhpcy5hcHAuY2VudGVyLnkgKyAyMDAsXHJcbiAgICAgIHdpZHRoOiA4MCxcclxuICAgICAgaGVpZ2h0OiA0MCxcclxuICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNlZWUnXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgZW50ZXI6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuXHJcbiAgc3RlcDogZnVuY3Rpb24gKGR0KSB7fSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgIHZhciBhZGRCdXR0b24gPSB0aGlzLmFkZEJ1dHRvblxyXG4gICAgdmFyIG1pbnVzQnV0dG9uID0gdGhpcy5taW51c0J1dHRvblxyXG4gICAgdmFyIHN0YXJ0QnV0dG9uID0gdGhpcy5zdGFydEJ1dHRvblxyXG5cclxuICAgIHRoaXMuYXBwLmxheWVyLmNsZWFyKCcjMDAwJylcclxuICAgIC8vIGJhY2tncm91bmRcclxuICAgIHRoaXMuYXBwLnNjcm9sbGluZ0JhY2tncm91bmQucmVuZGVyKHRoaXMuYXBwKVxyXG5cclxuICAgIHRoaXMuYXBwLmxheWVyXHJcbiAgICAgIC5mb250KCc0MHB4IEdlb3JnaWEnKVxyXG4gICAgICAuZmlsbFRleHQoJ0xldmVsOiAnICsgdGhpcy5sZXZlbCwgdGhpcy5hcHAuY2VudGVyLnggLSAzMCwgdGhpcy5hcHAuY2VudGVyLnkpXHJcbiAgICAgIC5maWxsU3R5bGUoYWRkQnV0dG9uLmhlaWdodCArICdweCAjYWJjJylcclxuICAgICAgLnRleHRXaXRoQmFja2dyb3VuZChhZGRCdXR0b24udGV4dCwgYWRkQnV0dG9uLngsIGFkZEJ1dHRvbi55LCBhZGRCdXR0b24uYmFja2dyb3VuZF9jb2xvcilcclxuICAgICAgLmZpbGxTdHlsZShtaW51c0J1dHRvbi5oZWlnaHQgKyAncHggI2FiYycpXHJcbiAgICAgIC50ZXh0V2l0aEJhY2tncm91bmQobWludXNCdXR0b24udGV4dCwgbWludXNCdXR0b24ueCwgbWludXNCdXR0b24ueSwgbWludXNCdXR0b24uYmFja2dyb3VuZF9jb2xvcilcclxuICAgICAgLmZpbGxTdHlsZShzdGFydEJ1dHRvbi5oZWlnaHQgKyAncHggI2FiYycpXHJcbiAgICAgIC50ZXh0V2l0aEJhY2tncm91bmQoc3RhcnRCdXR0b24udGV4dCwgc3RhcnRCdXR0b24ueCwgc3RhcnRCdXR0b24ueSwgc3RhcnRCdXR0b24uYmFja2dyb3VuZF9jb2xvcilcclxuICB9LFxyXG5cclxuICBtb3VzZWRvd246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICBpZiAoY29sbGlzaW9uRGV0ZWN0aW9uLlJlY3RQb2ludENvbGxpZGluZyh0aGlzLmFkZEJ1dHRvbiwgZGF0YSkpIHtcclxuICAgICAgdGhpcy5sZXZlbCsrXHJcbiAgICB9XHJcbiAgICBpZiAoY29sbGlzaW9uRGV0ZWN0aW9uLlJlY3RQb2ludENvbGxpZGluZyh0aGlzLm1pbnVzQnV0dG9uLCBkYXRhKSkge1xyXG4gICAgICB0aGlzLmxldmVsLS1cclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxldmVsID4gMTApIHRoaXMubGV2ZWwgPSAxMFxyXG4gICAgaWYgKHRoaXMubGV2ZWwgPCAxKSB0aGlzLmxldmVsID0gMVxyXG5cclxuICAgIC8vIGxhcmdlciBoYXJkZXJcclxuICAgIGlmIChjb2xsaXNpb25EZXRlY3Rpb24uUmVjdFBvaW50Q29sbGlkaW5nKHRoaXMuc3RhcnRCdXR0b24sIGRhdGEpKSB7XHJcbiAgICAgIEVOR0lORS5kaWZmaWN1bHR5ID0gdGhpcy5sZXZlbFxyXG4gICAgICB0aGlzLmFwcC5zZXRTdGF0ZShFTkdJTkUuR2FtZSlcclxuICAgIH1cclxuICB9XHJcblxyXG59XHJcblxyXG5FTkdJTkUuR2FtZSA9IHtcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBFTkdJTkUubGV2ZWxEYXRhID0gbmV3IExldmVsRGF0YSh0aGlzLmFwcC5kYXRhLmxldmVsc1tFTkdJTkUuZGlmZmljdWx0eV0pXHJcbiAgfSxcclxuXHJcbiAgZW50ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBtYXhSYWRpdXMgPSBNYXRoLm1heCh0aGlzLmFwcC53aWR0aCwgdGhpcy5hcHAuaGVpZ2h0KVxyXG5cclxuICAgIHRoaXMuYXBwLnNjcm9sbGluZ0JhY2tncm91bmQgPSBuZXcgU2Nyb2xsaW5nQmFja2dyb3VuZCh0aGlzLmFwcC5pbWFnZXMuYmFja2dyb3VuZClcclxuICAgIHRoaXMuYXBwLnNjcm9sbGluZ0JhY2tncm91bmQuaW5pdCh0aGlzLmFwcC53aWR0aCwgdGhpcy5hcHAuaGVpZ2h0KVxyXG5cclxuICAgIHRoaXMuYXBwLnRob21hcyA9IG5ldyBUaG9tYXMoe1xyXG4gICAgICBzcGVlZDogMTI4LFxyXG4gICAgICB4OiB0aGlzLmFwcC5jZW50ZXIueCxcclxuICAgICAgeTogdGhpcy5hcHAuY2VudGVyLnksXHJcbiAgICAgIGhwOiAxMCxcclxuICAgICAgZGVmZW5jZTogMVxyXG4gICAgfSlcclxuICAgIHZhciBndW4gPSBuZXcgR3VuKHtcclxuICAgICAgbWF4UmFkaXVzOiBtYXhSYWRpdXMsXHJcbiAgICAgIGNvbGRkb3duOiBFTkdJTkUubGV2ZWxEYXRhLmd1bkNvbGRkb3duXHJcbiAgICB9KVxyXG4gICAgdGhpcy5hcHAudGhvbWFzLnRha2VXZWFwb24oZ3VuKVxyXG5cclxuICAgIEVOR0lORS5SZXNvdXJjZSA9IHRoaXMuYXBwLm11c2ljLnBsYXkoJ211c2ljJywgdHJ1ZSlcclxuICAgIEVOR0lORS5lbmVtaWVzID0gW11cclxuICAgIEVOR0lORS5idWxsZXRzID0gW11cclxuICAgIEVOR0lORS5pdGVtcyA9IFtdXHJcbiAgICBFTkdJTkUuc2NvcmUgPSBuZXcgU2NvcmUoKVxyXG4gIH0sXHJcblxyXG4gIHN0ZXA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWF4KHRoaXMuYXBwLndpZHRoLCB0aGlzLmFwcC5oZWlnaHQpXHJcbiAgICAvLyB0aG9tYXNcclxuICAgIHZhciB0aG9tYXMgPSB0aGlzLmFwcC50aG9tYXNcclxuICAgIC8vIGJhY2tncm91bmRcclxuICAgIHZhciBkZWx0YSA9IHRoaXMuYXBwLnNjcm9sbGluZ0JhY2tncm91bmQubW92ZSh0aG9tYXMuc3BlZWQgKiBkdClcclxuXHJcbiAgICAvLyBlbmVtaWVzXHJcbiAgICB2YXIgZW5lbWllcyA9IEVOR0lORS5lbmVtaWVzXHJcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA8IEVOR0lORS5sZXZlbERhdGEubW9uc3RlclNwYXduUmF0ZSkge1xyXG4gICAgICAvLyBuZXcgcGxhY2VcclxuICAgICAgdmFyIG1pblJhZGl1cyA9IEVOR0lORS5sZXZlbERhdGEubW9uc3RlclNwYXduUmFkaXVzTWluXHJcbiAgICAgIHZhciBzcGF3blJhZGl1cyA9IE1hdGgucmFuZG9tKCkgKiAobWF4UmFkaXVzIC0gbWluUmFkaXVzKSArIG1pblJhZGl1c1xyXG4gICAgICB2YXIgcmFkaWFucyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MClcclxuICAgICAgdmFyIGVuZW15ID0gbmV3IFpvbWJpZSh7XHJcbiAgICAgICAgc3BlZWQ6IEVOR0lORS5sZXZlbERhdGEubW9uc3RlclNwZWVkLFxyXG4gICAgICAgIHg6IE1hdGguY29zKHJhZGlhbnMpICogc3Bhd25SYWRpdXMsXHJcbiAgICAgICAgeTogTWF0aC5zaW4ocmFkaWFucykgKiBzcGF3blJhZGl1cyxcclxuICAgICAgICBkaXJlY3RSYWRpYW5zOiAtcmFkaWFuc1xyXG4gICAgICB9KVxyXG4gICAgICBlbmVtaWVzLnB1c2goZW5lbXkpXHJcbiAgICB9XHJcbiAgICAvLyBlbmVtaWVzIHJ1bm5pbmdcclxuICAgIGVuZW1pZXMuZm9yRWFjaChlbmVteSA9PiB7XHJcbiAgICAgIGVuZW15LmZhY2VUbyh0aG9tYXMueCwgdGhvbWFzLnkpXHJcbiAgICAgIGVuZW15LnJ1bihkdClcclxuICAgICAgZW5lbXkueCAtPSBkZWx0YVswXVxyXG4gICAgICBlbmVteS55IC09IGRlbHRhWzFdXHJcbiAgICAgIGlmIChjb2xsaXNpb25EZXRlY3Rpb24uUmVjdFJlY3RDb2xsaWRpbmcoZW5lbXksIHRob21hcykpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnY29sbGlzc2lvbicpXHJcbiAgICAgICAgaWYgKCF0aG9tYXMuZ2V0RGFtYWdlKGVuZW15LmRhbWFnZSAqIGR0KSkge1xyXG4gICAgICAgICAgdGhpcy5hcHAubXVzaWMuc3RvcChFTkdJTkUuUmVzb3VyY2UpXHJcbiAgICAgICAgICB0aGlzLmFwcC5zZXRTdGF0ZShFTkdJTkUuR2FtZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAvLyBzaG9vdFxyXG4gICAgdGhvbWFzLmF0dGFjayhlbmVtaWVzLCBkdClcclxuXHJcbiAgICAvLyBnZW4gaXRlbVxyXG4gICAgdmFyIGl0ZW1zID0gRU5HSU5FLml0ZW1zXHJcbiAgICBpZiAoaXRlbXMubGVuZ3RoIDwgMTApIHtcclxuICAgICAgdmFyIGl0ZW0gPSBuZXcgSXRlbSh7XHJcbiAgICAgICAgeDogTWF0aC5yYW5kb20oKSAqIHRoaXMuYXBwLndpZHRoLFxyXG4gICAgICAgIHk6IE1hdGgucmFuZG9tKCkgKiB0aGlzLmFwcC5oZWlnaHQsXHJcbiAgICAgICAgdHlwZTogSXRlbS5ndW5Db2xkZG93bixcclxuICAgICAgICB2YWx1ZTogLTAuMDFcclxuICAgICAgfSlcclxuICAgICAgaXRlbXMucHVzaChpdGVtKVxyXG4gICAgfVxyXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgaXRlbS54IC09IGRlbHRhWzBdXHJcbiAgICAgIGl0ZW0ueSAtPSBkZWx0YVsxXVxyXG4gICAgICBpZiAoY29sbGlzaW9uRGV0ZWN0aW9uLlJlY3RSZWN0Q29sbGlkaW5nKGl0ZW0sIHRob21hcykpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnZ2V0IGl0ZW0nKVxyXG4gICAgICAgIHRob21hcy5nZXRJdGVtKGl0ZW0pXHJcbiAgICAgICAgaXRlbXMuc3BsaWNlKGl0ZW1zLmluZGV4T2YoaXRlbSksIDEpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgIHZhciBhcHAgPSB0aGlzLmFwcFxyXG4gICAgdmFyIHRob21hcyA9IHRoaXMuYXBwLnRob21hc1xyXG5cclxuICAgIGFwcC5sYXllci5jbGVhcignIzAwMCcpXHJcbiAgICAvLyBiYWNrZ3JvdW5kXHJcbiAgICBhcHAuc2Nyb2xsaW5nQmFja2dyb3VuZC5yZW5kZXIoYXBwKVxyXG5cclxuICAgIGFwcC5sYXllclxyXG4gICAgICAuZm9udCgnNDBweCBHZW9yZ2lhJylcclxuICAgICAgLmZpbGxUZXh0KCdDdXJyZW50OiAnICsgRU5HSU5FLnNjb3JlLmdldFNjb3JlKCksIGFwcC53aWR0aCAtIDMwMCwgMTYwKVxyXG4gICAgICAuZm9udCgnNDBweCBHcmVlbicpXHJcbiAgICAgIC5maWxsVGV4dCgnSGlnaDogJyArIEVOR0lORS5zY29yZS5nZXRIaWdoU2NvcmUoKSwgYXBwLndpZHRoIC0gMzAwLCA4MClcclxuICAgICAgLy8gaHBcclxuICAgICAgLmZpbGxTdHlsZSgnIzAwMCcpXHJcbiAgICAgIC5maWxsUmVjdCgyMCwgMjAsIDMwMCwgMzApXHJcbiAgICAgIC5maWxsU3R5bGUoJyNGMDAnKVxyXG4gICAgICAuZmlsbFJlY3QoMjAsIDIwLCAzMDAgKiAodGhvbWFzLmhwIC8gdGhvbWFzLmhwTWF4KSwgMzApXHJcblxyXG4gICAgYXBwLnRob21hcy5yZW5kZXIoYXBwLmxheWVyKVxyXG4gICAgRU5HSU5FLmVuZW1pZXMuZm9yRWFjaChlbmVteSA9PiB7XHJcbiAgICAgIGVuZW15LnJlbmRlcihhcHApXHJcbiAgICB9KVxyXG4gICAgRU5HSU5FLml0ZW1zLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGl0ZW0ucmVuZGVyKGFwcC5sYXllcilcclxuICAgIH0pXHJcbiAgfSxcclxuXHJcbiAga2V5ZG93bjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIHZhciBkaXJlY3QgPSAwYjAwMDBcclxuICAgIHN3aXRjaCAoZGF0YS5rZXkpIHtcclxuICAgICAgY2FzZSAnYSc6XHJcbiAgICAgICAgZGlyZWN0IHw9IDBiMTAwMFxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ2QnOlxyXG4gICAgICAgIGRpcmVjdCB8PSAwYjAxMDBcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICd3JzpcclxuICAgICAgICBkaXJlY3QgfD0gMGIwMDEwXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAncyc6XHJcbiAgICAgICAgZGlyZWN0IHw9IDBiMDAwMVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcbiAgICB0aGlzLmFwcC5zY3JvbGxpbmdCYWNrZ3JvdW5kLmZhY2VUbyhkaXJlY3QpXHJcbiAgfSxcclxuXHJcbiAga2V5dXA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICB2YXIgZGlyZWN0ID0gMGIxMTExXHJcbiAgICBzd2l0Y2ggKGRhdGEua2V5KSB7XHJcbiAgICAgIGNhc2UgJ2EnOlxyXG4gICAgICAgIGRpcmVjdCAmPSAwYjAxMTFcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICdkJzpcclxuICAgICAgICBkaXJlY3QgJj0gMGIxMDExXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAndyc6XHJcbiAgICAgICAgZGlyZWN0ICY9IDBiMTEwMVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ3MnOlxyXG4gICAgICAgIGRpcmVjdCAmPSAwYjExMTBcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgdGhpcy5hcHAuc2Nyb2xsaW5nQmFja2dyb3VuZC5mYWNlQ2FuY2VsKGRpcmVjdClcclxuICB9LFxyXG5cclxuICBtb3VzZW1vdmU6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICB0aGlzLmFwcC50aG9tYXMuZmFjZVRvKGRhdGEueCwgZGF0YS55KVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbnZhciBMZXZlbERhdGEgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gIHJldHVybiBuZXcgUHJveHkoZGF0YSwge1xyXG4gICAgZ2V0ICh0YXJnZXQsIG5hbWUpIHtcclxuICAgICAgdmFyIHZhbCA9IGRhdGFbbmFtZV1cclxuICAgICAgcmV0dXJuIHZhbFxyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVOR0lORVxyXG4iLCJjbGFzcyBCYWxsIHtcclxuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xyXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XHJcbiAgICAgIHg6IDAsXHJcbiAgICAgIHk6IDAsXHJcbiAgICAgIHdpZHRoOiAzMixcclxuICAgICAgaGVpZ2h0OiAzMixcclxuICAgICAgY29sb3I6ICcjZTI1NDNlJyxcclxuICAgICAgc3BlZWQ6IDI1NixcclxuICAgICAgZGlyZWN0UmFkaWFuczogMCxcclxuICAgICAgaHA6IDEsXHJcbiAgICAgIGRhbWFnZTogMCxcclxuICAgICAgZGVmZW5jZTogMFxyXG4gICAgfVxyXG4gICAgY29uc3QgcG9wdWxhdGVkID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0aW9ucylcclxuICAgIGZvciAoY29uc3Qga2V5IGluIHBvcHVsYXRlZCkge1xyXG4gICAgICBpZiAocG9wdWxhdGVkLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICB0aGlzW2tleV0gPSBwb3B1bGF0ZWRba2V5XVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGZhY2VUbyAoeCwgeSkge1xyXG4gICAgdGhpcy5kaXJlY3RSYWRpYW5zID0gTWF0aC5hdGFuMih5IC0gdGhpcy55LCB4IC0gdGhpcy54KVxyXG4gIH1cclxuICBydW4gKGR0KSB7XHJcbiAgICB0aGlzLnggKz0gTWF0aC5jb3ModGhpcy5kaXJlY3RSYWRpYW5zKSAqIHRoaXMuc3BlZWQgKiBkdFxyXG4gICAgdGhpcy55ICs9IE1hdGguc2luKHRoaXMuZGlyZWN0UmFkaWFucykgKiB0aGlzLnNwZWVkICogZHRcclxuICB9XHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgZGFtYWdlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICAgICAge251bWJlcn0gIGRhbWFnZSAgVGhlIGRhbWFnZVxyXG4gICAqIEByZXR1cm4gICAgIHtib29sZWFufSAgc3RpbGwgYWxpdmVcclxuICAgKi9cclxuICBnZXREYW1hZ2UgKGRhbWFnZSkge1xyXG4gICAgdGhpcy5ocCAtPSBkYW1hZ2VcclxuICAgIHJldHVybiB0aGlzLmhwID4gMFxyXG4gIH1cclxuICByZW5kZXIgKGxheWVyKSB7XHJcbiAgICBsYXllclxyXG4gICAgICAuZmlsbFN0eWxlKHRoaXMuY29sb3IpXHJcbiAgICAgIC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCYWxsXHJcbiIsImltcG9ydCBCYWxsIGZyb20gJy4vQmFsbCdcclxuXHJcbmNsYXNzIEJ1bGxldCBleHRlbmRzIEJhbGwge1xyXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XHJcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMCxcclxuICAgICAgd2lkdGg6IDEwLFxyXG4gICAgICBoZWlnaHQ6IDEwLFxyXG4gICAgICBjb2xvcjogJyNmZjAwMDAnLFxyXG4gICAgICBzcGVlZDogMTAyNCxcclxuICAgICAgZGlyZWN0UmFkaWFuczogMCxcclxuICAgICAgZGFtYWdlOiAxLFxyXG4gICAgICBocDogMSAvLyBjYW4gZ28gdGhyb3cgc29tZWJvZHlcclxuICAgIH1cclxuICAgIGNvbnN0IHBvcHVsYXRlZCA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIG9wdGlvbnMpXHJcbiAgICBzdXBlcihwb3B1bGF0ZWQpXHJcbiAgfVxyXG4gIHJlbmRlciAobGF5ZXIpIHtcclxuICAgIGxheWVyXHJcbiAgICAgIC5maWxsU3R5bGUodGhpcy5jb2xvcilcclxuICAgICAgLmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJ1bGxldFxyXG4iLCJpbXBvcnQgQ29sbGlzaW9uRGV0ZWN0aW9uIGZyb20gJy4uL0NvbGxpc2lvbidcclxuaW1wb3J0IEVuZ2luZSBmcm9tICcuLi9FbmdpbmUnXHJcblxyXG5pbXBvcnQgQnVsbGV0IGZyb20gJy4vQnVsbGV0J1xyXG5cclxudmFyIGNvbGxpc2lvbkRldGVjdGlvbiA9IG5ldyBDb2xsaXNpb25EZXRlY3Rpb24oKVxyXG5cclxuY2xhc3MgR3VuIHtcclxuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xyXG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XHJcbiAgICAgIG1heFJhZGl1czogMCxcclxuICAgICAgY29sZGRvd246IDAsXHJcbiAgICAgIHRvUmFkaWFuczogTWF0aC5hc2luKC0xKVxyXG4gICAgfVxyXG4gICAgY29uc3QgcG9wdWxhdGVkID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0aW9ucylcclxuICAgIGZvciAoY29uc3Qga2V5IGluIHBvcHVsYXRlZCkge1xyXG4gICAgICBpZiAocG9wdWxhdGVkLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICB0aGlzW2tleV0gPSBwb3B1bGF0ZWRba2V5XVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmJ1bGxldHMgPSBbXVxyXG4gICAgdGhpcy5uZXh0c2hvb3QgPSAwXHJcbiAgfVxyXG4gIGZhY2VUbyAodG9SYWRpYW5zKSB7XHJcbiAgICB0aGlzLnRvUmFkaWFucyA9IHRvUmFkaWFuc1xyXG4gIH1cclxuICBhdHRhY2sgKGZyb21YLCBmcm9tWSwgZHQpIHtcclxuICAgIGlmICh0aGlzLm5leHRzaG9vdCA+IDApIHtcclxuICAgICAgdGhpcy5uZXh0c2hvb3QgLT0gZHRcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB2YXIgYnVsbGV0cyA9IHRoaXMuYnVsbGV0c1xyXG4gICAgdmFyIGJ1bGxldCA9IG5ldyBCdWxsZXQoe1xyXG4gICAgICB4OiBmcm9tWCxcclxuICAgICAgeTogZnJvbVksXHJcbiAgICAgIGRpcmVjdFJhZGlhbnM6IHRoaXMudG9SYWRpYW5zXHJcbiAgICB9KVxyXG4gICAgYnVsbGV0cy5wdXNoKGJ1bGxldClcclxuICAgIC8vIGJ1bGxldCBvdXQgb2Ygc2NyZWVuXHJcbiAgICB2YXIgYnVsbGV0c0luZGV4ID0gYnVsbGV0cy5sZW5ndGggLSAxXHJcbiAgICB3aGlsZSAoYnVsbGV0c0luZGV4ID49IDApIHtcclxuICAgICAgdmFyIGJ1bGxldCA9IGJ1bGxldHNbYnVsbGV0c0luZGV4XVxyXG4gICAgICBpZiAoYnVsbGV0LnggPiB0aGlzLm1heFJhZGl1cyB8fCBidWxsZXQueSA+IHRoaXMubWF4UmFkaXVzKSB7XHJcbiAgICAgICAgYnVsbGV0cy5zcGxpY2UoYnVsbGV0c0luZGV4LCAxKVxyXG4gICAgICB9XHJcbiAgICAgIGJ1bGxldHNJbmRleCAtPSAxXHJcbiAgICB9XHJcbiAgICB0aGlzLm5leHRzaG9vdCA9IHRoaXMuY29sZGRvd25cclxuICAgIHJldHVybiBidWxsZXRcclxuICB9XHJcbiAgc3RlcCAoZW5lbWllcywgZHQpIHtcclxuICAgIHZhciBidWxsZXRzID0gdGhpcy5idWxsZXRzXHJcbiAgICBidWxsZXRzLmZvckVhY2goZnVuY3Rpb24gKGJ1bGxldCkge1xyXG4gICAgICBidWxsZXQucnVuKGR0KVxyXG4gICAgICBlbmVtaWVzLmZvckVhY2goZnVuY3Rpb24gKGVuZW15KSB7XHJcbiAgICAgICAgaWYgKGNvbGxpc2lvbkRldGVjdGlvbi5SZWN0UmVjdENvbGxpZGluZyhidWxsZXQsIGVuZW15KSkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2hpdCBtb25zdGVyJylcclxuICAgICAgICAgIC8vIGFkZCBzY29yZVxyXG4gICAgICAgICAgRW5naW5lLnNjb3JlLmFkZChFbmdpbmUubGV2ZWxEYXRhLnNjb3JlUHJlSGl0KVxyXG4gICAgICAgICAgRW5naW5lLnNjb3JlLnNhdmUoKVxyXG4gICAgICAgICAgLy8gYnVsbGV0IGRpZVxyXG4gICAgICAgICAgaWYgKCFidWxsZXQuZ2V0RGFtYWdlKGVuZW15LmRlZmVuY2UpKSB7XHJcbiAgICAgICAgICAgIGJ1bGxldHMuc3BsaWNlKGJ1bGxldHMuaW5kZXhPZihidWxsZXQpLCAxKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gZW5lbXkgZ2V0IGRhbWFnZVxyXG4gICAgICAgICAgaWYgKCFlbmVteS5nZXREYW1hZ2UoYnVsbGV0LmRhbWFnZSkpIHtcclxuICAgICAgICAgICAgLy8gZW5lbXkgZGllXHJcbiAgICAgICAgICAgIGVuZW1pZXMuc3BsaWNlKGVuZW1pZXMuaW5kZXhPZihlbmVteSksIDEpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcbiAgcmVuZGVyIChsYXllcikge1xyXG4gICAgdGhpcy5idWxsZXRzLmZvckVhY2goZnVuY3Rpb24gKGJ1bGxldCkge1xyXG4gICAgICBidWxsZXQucmVuZGVyKGxheWVyKVxyXG4gICAgfSlcclxuICB9XHJcbiAgdXBncmFkZSAodHlwZSwgdmFsdWUsIGlzTXVsdGlwbHkpIHtcclxuICAgIGlmICghaXNNdWx0aXBseSkge1xyXG4gICAgICB0aGlzW3R5cGVdICs9IHZhbHVlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzW3R5cGVdICo9IHZhbHVlXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHdW5cclxuIiwiaW1wb3J0IEJhbGwgZnJvbSAnLi9CYWxsJ1xyXG5cclxuY2xhc3MgSXRlbSBleHRlbmRzIEJhbGwge1xyXG4gIHN0YXRpYyBnZXQgZ3VuQ29sZGRvd24gKCkge1xyXG4gICAgcmV0dXJuICdndW5Db2xkZG93bidcclxuICB9XHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMgPSB7fSkge1xyXG4gICAgb3B0aW9ucy5zcGVlZCA9IDBcclxuICAgIG9wdGlvbnMuY29sb3IgPSAnIzAwMCdcclxuICAgIHN1cGVyKG9wdGlvbnMpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJdGVtXHJcbiIsImltcG9ydCBCYWxsIGZyb20gJy4vQmFsbCdcclxuaW1wb3J0IEl0ZW0gZnJvbSAnLi9JdGVtJ1xyXG5cclxuY2xhc3MgVGhvbWFzIGV4dGVuZHMgQmFsbCB7XHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcclxuICAgIHN1cGVyKG9wdGlvbnMpXHJcbiAgICB0aGlzLmhwTWF4ID0gdGhpcy5ocFxyXG4gIH1cclxuICB0YWtlV2VhcG9uICh3ZWFwb24pIHtcclxuICAgIHRoaXMud2VhcG9uID0gd2VhcG9uXHJcbiAgfVxyXG4gIGF0dGFjayAoZW5lbWllcywgZHQpIHtcclxuICAgIGlmICghdGhpcy53ZWFwb24pIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0aGlzLndlYXBvbi5hdHRhY2sodGhpcy54LCB0aGlzLnksIGR0KVxyXG4gICAgdGhpcy53ZWFwb24uc3RlcChlbmVtaWVzLCBkdClcclxuICB9XHJcbiAgcmVuZGVyIChsYXllcikge1xyXG4gICAgc3VwZXIucmVuZGVyKGxheWVyKVxyXG4gICAgLy8gZ3VuIGJ1bGxldFxyXG4gICAgdGhpcy53ZWFwb24ucmVuZGVyKGxheWVyKVxyXG4gIH1cclxuICBmYWNlVG8gKHgsIHkpIHtcclxuICAgIHN1cGVyLmZhY2VUbyh4LCB5KVxyXG4gICAgdGhpcy53ZWFwb24uZmFjZVRvKHRoaXMuZGlyZWN0UmFkaWFucylcclxuICB9XHJcbiAgZ2V0SXRlbSAoaXRlbSkge1xyXG4gICAgc3dpdGNoIChpdGVtLnR5cGUpIHtcclxuICAgICAgY2FzZSBJdGVtLmd1bkNvbGRkb3duOlxyXG4gICAgICAgIHRoaXMud2VhcG9uLnVwZ3JhZGUoJ2NvbGRkb3duJywgaXRlbS52YWx1ZSlcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGhvbWFzXHJcbiIsImltcG9ydCBCYWxsIGZyb20gJy4vQmFsbCdcclxuXHJcbmNsYXNzIFpvbWJpZSBleHRlbmRzIEJhbGwge1xyXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XHJcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMCxcclxuICAgICAgd2lkdGg6IDEyOCxcclxuICAgICAgaGVpZ2h0OiAxMjgsXHJcbiAgICAgIGltYWdlOiAnem9tYmllJyxcclxuICAgICAgc3BlZWQ6IDI1NixcclxuICAgICAgZGlyZWN0UmFkaWFuczogMCxcclxuICAgICAgaHA6IDEsXHJcbiAgICAgIGRhbWFnZTogMSxcclxuICAgICAgZGVmZW5jZTogMFxyXG4gICAgfVxyXG4gICAgY29uc3QgcG9wdWxhdGVkID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0aW9ucylcclxuICAgIHN1cGVyKHBvcHVsYXRlZClcclxuICAgIHRoaXMuc3BlZWQgKj0gTWF0aC5yYW5kb20oKSAqIDAuOCArIDAuMlxyXG4gIH1cclxuICBmYWNlVG8gKHgsIHkpIHtcclxuICAgIHRoaXMuZGlyZWN0UmFkaWFucyA9IE1hdGguYXRhbjIoeSAtIHRoaXMueSwgeCAtIHRoaXMueClcclxuICB9XHJcbiAgcnVuIChkdCkge1xyXG4gICAgdGhpcy54ICs9IE1hdGguY29zKHRoaXMuZGlyZWN0UmFkaWFucykgKiB0aGlzLnNwZWVkICogZHRcclxuICAgIHRoaXMueSArPSBNYXRoLnNpbih0aGlzLmRpcmVjdFJhZGlhbnMpICogdGhpcy5zcGVlZCAqIGR0XHJcbiAgfVxyXG4gIHJlbmRlciAoYXBwKSB7XHJcbiAgICBhcHAubGF5ZXIuZHJhd0ltYWdlKGFwcC5pbWFnZXNbdGhpcy5pbWFnZV0sIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFpvbWJpZVxyXG4iLCJjbGFzcyBTY29yZSB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5zY29yZUN1cnJlbnQgPSAwXHJcbiAgICB0aGlzLnNjb3JlTWF4ID0gMFxyXG4gICAgdGhpcy5oaWdoc2NvcmUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaGlnaHNjb3JlJykgfHwgMFxyXG4gIH1cclxuXHJcbiAgc2F2ZSAoKSB7XHJcbiAgICBpZiAodGhpcy5zY29yZUN1cnJlbnQgPiB0aGlzLmhpZ2hzY29yZSkge1xyXG4gICAgICB0aGlzLmhpZ2hzY29yZSA9IHRoaXMuc2NvcmVDdXJyZW50XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdoaWdoc2NvcmUnLCB0aGlzLmhpZ2hzY29yZSlcclxuICAgIH1cclxuICB9XHJcbiAgY2xlYXIgKCkge1xyXG4gICAgdGhpcy5zY29yZUN1cnJlbnQgPSAwXHJcbiAgICB0aGlzLnNjb3JlTWF4ID0gMFxyXG4gIH1cclxuICBhZGQgKHNjb3JlKSB7XHJcbiAgICB0aGlzLnNjb3JlQ3VycmVudCArPSBzY29yZVxyXG4gICAgdGhpcy5zY29yZU1heCA9IE1hdGgubWF4KHRoaXMuc2NvcmVNYXgsIHRoaXMuc2NvcmVDdXJyZW50KVxyXG4gIH1cclxuICBuZXdTY29yZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zY29yZUN1cnJlbnQgPT09IHRoaXMuc2NvcmVNYXhcclxuICB9XHJcbiAgZ2V0SGlnaFNjb3JlICgpIHtcclxuICAgIHJldHVybiAoTnVtYmVyKHRoaXMuaGlnaHNjb3JlKSkudG9GaXhlZCgyKVxyXG4gIH1cclxuICBnZXRTY29yZSAoKSB7XHJcbiAgICByZXR1cm4gKE51bWJlcih0aGlzLnNjb3JlQ3VycmVudCkpLnRvRml4ZWQoMilcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjb3JlXHJcbiIsImNsYXNzIFNjcm9sbGluZ0JhY2tncm91bmQge1xyXG4gIGNvbnN0cnVjdG9yIChpbWFnZSkge1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kcyA9IFtdXHJcbiAgICB0aGlzLmJ3ID0gaW1hZ2Uud2lkdGhcclxuICAgIHRoaXMuYmggPSBpbWFnZS5oZWlnaHRcclxuICAgIHRoaXMuaW1hZ2UgPSBpbWFnZVxyXG4gICAgdGhpcy5sYXllciA9IHt9XHJcbiAgICB0aGlzLmRpcmVjdFJhZGlhbnMgPSBNYXRoLmFzaW4oLTEpXHJcbiAgICB0aGlzLmZhY2VEaXJlY3RCaXRzID0gMGIwMDAwIC8vIExSVURcclxuICAgIHRoaXMuZG9udE1vdmUgPSB0cnVlXHJcbiAgfVxyXG5cclxuICBtb3ZlIChzcGVlZCkge1xyXG4gICAgaWYgKHRoaXMuZG9udE1vdmUpIHtcclxuICAgICAgcmV0dXJuIFswLCAwXVxyXG4gICAgfVxyXG4gICAgbGV0IGR4ID0gTWF0aC5jb3ModGhpcy5kaXJlY3RSYWRpYW5zKSAqIHNwZWVkXHJcbiAgICBsZXQgZHkgPSBNYXRoLnNpbih0aGlzLmRpcmVjdFJhZGlhbnMpICogc3BlZWRcclxuICAgIGxldCBsdyA9IHRoaXMubGF5ZXIud1xyXG4gICAgbGV0IGxoID0gdGhpcy5sYXllci5oXHJcbiAgICBsZXQgbnggPSBNYXRoLmNlaWwobHcgLyB0aGlzLmJ3KSArIDFcclxuICAgIGxldCBueSA9IE1hdGguY2VpbChsaCAvIHRoaXMuYmgpICsgMVxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kcy5mb3JFYWNoKGUgPT4ge1xyXG4gICAgICBlWzBdIC09IGR4XHJcbiAgICAgIGVbMV0gLT0gZHlcclxuICAgICAgaWYgKGVbMF0gPCAtdGhpcy5idykge1xyXG4gICAgICAgIGVbMF0gKz0gKG54ICsgMSkgKiB0aGlzLmJ3XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGVbMF0gPiBsdykge1xyXG4gICAgICAgIGVbMF0gLT0gKG54ICsgMSkgKiB0aGlzLmJ3XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGVbMV0gPCAtdGhpcy5iaCkge1xyXG4gICAgICAgIGVbMV0gKz0gKG55ICsgMSkgKiB0aGlzLmJoXHJcbiAgICAgIH1cclxuICAgICAgaWYgKGVbMV0gPiBsaCkge1xyXG4gICAgICAgIGVbMV0gLT0gKG55ICsgMSkgKiB0aGlzLmJoXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gW2R4LCBkeV1cclxuICB9XHJcbiAgaW5pdCAodywgaCkge1xyXG4gICAgdGhpcy5sYXllciA9IHtcclxuICAgICAgdzogdyxcclxuICAgICAgaDogaFxyXG4gICAgfVxyXG4gICAgdmFyIG54ID0gTWF0aC5jZWlsKHcgLyB0aGlzLmJ3KSArIDFcclxuICAgIHZhciBueSA9IE1hdGguY2VpbChoIC8gdGhpcy5iaCkgKyAxXHJcbiAgICBmb3IgKHZhciBpID0gLTE7IGkgPD0gbng7IGkrKykge1xyXG4gICAgICBmb3IgKHZhciBqID0gLTE7IGogPD0gbnk7IGorKykge1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZHMucHVzaChbaSAqIHRoaXMuYncsIGogKiB0aGlzLmJoXSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBfdHVybiAoKSB7XHJcbiAgICBsZXQgeCA9IDBcclxuICAgIGxldCB5ID0gMFxyXG4gICAgeCAtPSAodGhpcy5mYWNlRGlyZWN0Qml0cyA+PiAzKSAmIDEgLy8gTFxyXG4gICAgeCArPSAodGhpcy5mYWNlRGlyZWN0Qml0cyA+PiAyKSAmIDEgLy8gUlxyXG4gICAgeSAtPSAodGhpcy5mYWNlRGlyZWN0Qml0cyA+PiAxKSAmIDEgLy8gVVxyXG4gICAgeSArPSAodGhpcy5mYWNlRGlyZWN0Qml0cyA+PiAwKSAmIDEgLy8gRFxyXG4gICAgdGhpcy5kaXJlY3RSYWRpYW5zID0gTWF0aC5hdGFuMih5LCB4KVxyXG4gICAgdGhpcy5kb250TW92ZSA9IHggPT09IDAgJiYgeSA9PT0gMFxyXG4gIH1cclxuICBmYWNlVG8gKGRpcmVjdCkge1xyXG4gICAgdGhpcy5mYWNlRGlyZWN0Qml0cyB8PSBkaXJlY3RcclxuICAgIHRoaXMuX3R1cm4oKVxyXG4gIH1cclxuICBmYWNlQ2FuY2VsIChkaXJlY3QpIHtcclxuICAgIHRoaXMuZmFjZURpcmVjdEJpdHMgJj0gZGlyZWN0XHJcbiAgICB0aGlzLl90dXJuKClcclxuICB9XHJcbiAgcmVuZGVyIChhcHApIHtcclxuICAgIHRoaXMuYmFja2dyb3VuZHMuZm9yRWFjaChlID0+IHtcclxuICAgICAgYXBwLmxheWVyLmRyYXdJbWFnZSh0aGlzLmltYWdlLCBlWzBdLCBlWzFdKVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjcm9sbGluZ0JhY2tncm91bmRcclxuIiwiaW1wb3J0IEVuZ2luZSBmcm9tICcuL0VuZ2luZSdcclxuXHJcbm5ldyBQTEFZR1JPVU5ELkFwcGxpY2F0aW9uKHtcclxuXHJcbiAgcGF0aHM6IHtcclxuICAgIHNvdW5kczogJy9zb3VuZHMvJyxcclxuICAgIHJld3JpdGVVUkw6IHtcclxuICAgICAgYmFja2dyb3VuZDogJy9pbWFnZXMvYmFja2dyb3VuZC5wbmcnLFxyXG4gICAgICB6b21iaWU6ICcvaW1hZ2VzL3pvbWJpZS5wbmcnXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmxvYWRTb3VuZHMoJ211c2ljJylcclxuICAgIHRoaXMubG9hZEltYWdlKFsnPGJhY2tncm91bmQ+JywgJzx6b21iaWU+J10pXHJcbiAgICB0aGlzLmxvYWREYXRhKCdsZXZlbHMnKVxyXG4gIH0sXHJcblxyXG4gIHJlYWR5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnNldFN0YXRlKEVuZ2luZS5JbnRybylcclxuICB9LFxyXG5cclxuICBtb3VzZWRvd246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgfSxcclxuXHJcbiAgc2NhbGU6IDAuNVxyXG4gIC8vIGNvbnRhaW5lcjogZXhhbXBsZUNvbnRhaW5lclxyXG5cclxufSlcclxuIl19
