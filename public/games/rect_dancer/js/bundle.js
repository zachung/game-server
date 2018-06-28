(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  function Ball() {
    _classCallCheck(this, Ball);

    this.x = 0;
    this.y = 0;
    this.width = 32;
    this.height = 32;
    this.color = '#e2543e';
    this.speed = 256;
    this.directRadians = 0;
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
  }]);

  return Ball;
}();

exports.default = Ball;

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Ball = require('./Ball');

var _Ball2 = _interopRequireDefault(_Ball);

var _Collision = require('./Collision');

var _Collision2 = _interopRequireDefault(_Collision);

var _ScrollingBackground = require('./ScrollingBackground');

var _ScrollingBackground2 = _interopRequireDefault(_ScrollingBackground);

var _Score = require('./Score');

var _Score2 = _interopRequireDefault(_Score);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Engine = {
  Resource: {},
  difficulty: 0
};
var collisionDetection = new _Collision2.default();

Engine.Intro = {

  level: 1,

  enter: function enter() {},

  create: function create() {
    this.app.scrollingBackground = new _ScrollingBackground2.default(this.app.images.background);
    this.app.scrollingBackground.init(this.app.width, this.app.height);

    this.app.thomas = new _Ball2.default();
    this.app.thomas.x = this.app.center.x;
    this.app.thomas.y = this.app.center.y;

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
      Engine.difficulty = this.level / 10;
      this.app.setState(Engine.Game);
    }
  }

};

Engine.Game = {

  enter: function enter() {
    Engine.Resource = this.app.music.play('music', true);
    Engine.enemies = [];
    Engine.score = new _Score2.default();
  },

  create: function create() {
    this.app.scrollingBackground = new _ScrollingBackground2.default(this.app.images.background);
    this.app.scrollingBackground.init(this.app.width, this.app.height);

    this.app.thomas = new _Ball2.default();
    this.app.thomas.x = this.app.center.x;
    this.app.thomas.y = this.app.center.y;
  },

  step: function step(dt) {
    var _this = this;

    // thomas
    var thomas = this.app.thomas;
    // background
    var delta = this.app.scrollingBackground.move(thomas.speed * dt);

    // calc distance
    Engine.score.add(-delta[1] * Engine.difficulty);
    Engine.score.save();

    // enemies
    var enemies = Engine.enemies;
    if (Engine.score.newScore() && Math.random() < Engine.difficulty) {
      // new place
      var enemy = new _Ball2.default();
      enemy.speed = 256;
      enemy.x = Math.random() * this.app.width;
      enemy.y = 0;
      enemy.directRadians = Math.asin(1);
      enemy.color = '#e24fa2';
      enemies.push(enemy);
    }
    // enemies running
    enemies.forEach(function (enemy) {
      enemy.run(dt);
      enemy.x -= delta[0];
      enemy.y -= delta[1];
      if (collisionDetection.RectRectColliding(enemy, thomas)) {
        console.log('collission');
        _this.app.music.stop(Engine.Resource);
        _this.app.setState(Engine.Game);
      }
    });
    var enemiesIndex = enemies.length - 1;
    while (enemiesIndex >= 0) {
      if (enemies[enemiesIndex].y > this.app.height) {
        enemies.splice(enemiesIndex, 1);
      }
      enemiesIndex -= 1;
    }
  },

  render: function render(dt) {
    var _this2 = this;

    var thomas = this.app.thomas;

    this.app.layer.clear('#000');
    // background
    this.app.scrollingBackground.render(this.app);

    this.app.layer.fillStyle(thomas.color).fillRect(thomas.x, thomas.y, thomas.width, thomas.height).font('40px Georgia').fillText('Current: ' + Engine.score.getScore(), this.app.width - 300, 160).font('40px Green').fillText('High: ' + Engine.score.getHighScore(), this.app.width - 300, 80);

    Engine.enemies.forEach(function (enemy) {
      _this2.app.layer.fillStyle(enemy.color).fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
  },

  mousedown: function mousedown() {

    // this.app.sound.play("laser");

  },

  mousemove: function mousemove(data) {
    this.app.scrollingBackground.directRadians = Math.atan2(data.y - this.app.center.y, data.x - this.app.center.x);
  }

};

exports.default = Engine;

},{"./Ball":1,"./Collision":2,"./Score":4,"./ScrollingBackground":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
    this.layer = {};
    this.directRadians = Math.asin(-1);
  }

  _createClass(ScrollingBackground, [{
    key: "move",
    value: function move(speed) {
      var _this = this;

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
    key: "render",
    value: function render(app) {
      this.backgrounds.forEach(function (e) {
        app.layer.drawImage(app.images.background, e[0], e[1]);
      });
    }
  }]);

  return ScrollingBackground;
}();

exports.default = ScrollingBackground;

},{}],6:[function(require,module,exports){
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
      background: '/images/background.png'
    }
  },

  create: function create() {
    this.loadSounds('music');
    this.loadImage('<background>');
  },

  ready: function ready() {
    this.setState(_Engine2.default.Intro);
  },

  mousedown: function mousedown(data) {},

  scale: 0.5
  // container: exampleContainer

});

},{"./Engine":3}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQmFsbC5qcyIsInNyYy9Db2xsaXNpb24uanMiLCJzcmMvRW5naW5lLmpzIiwic3JjL1Njb3JlLmpzIiwic3JjL1Njcm9sbGluZ0JhY2tncm91bmQuanMiLCJzcmMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ0FNLE87QUFDSixXQUFBLElBQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxJQUFBOztBQUNiLFNBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLFNBQUEsTUFBQSxHQUFBLEVBQUE7QUFDQSxTQUFBLEtBQUEsR0FBQSxTQUFBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsR0FBQTtBQUNBLFNBQUEsYUFBQSxHQUFBLENBQUE7QUFDRDs7OzsyQkFFTyxDLEVBQUcsQyxFQUFHO0FBQ1osV0FBQSxhQUFBLEdBQXFCLEtBQUEsS0FBQSxDQUFXLElBQUksS0FBZixDQUFBLEVBQXVCLElBQUksS0FBaEQsQ0FBcUIsQ0FBckI7QUFDRDs7O3dCQUVJLEUsRUFBSTtBQUNQLFdBQUEsQ0FBQSxJQUFVLEtBQUEsR0FBQSxDQUFTLEtBQVQsYUFBQSxJQUErQixLQUEvQixLQUFBLEdBQVYsRUFBQTtBQUNBLFdBQUEsQ0FBQSxJQUFVLEtBQUEsR0FBQSxDQUFTLEtBQVQsYUFBQSxJQUErQixLQUEvQixLQUFBLEdBQVYsRUFBQTtBQUNEOzs7Ozs7a0JBR1ksSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ3JCVCxxQjtBQUNKLFdBQUEsa0JBQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxrQkFBQTs7QUFDYixTQUFBLGVBQUEsR0FBQSxFQUFBO0FBQ0EsU0FBQSxjQUFBLEdBRmEsSUFFYixDQUZhLENBRWM7QUFDNUI7Ozs7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S0FBTCxFQUFBLEVBQWMsSUFBSSxLQUF4QyxFQUFzQixDQUF0QjtBQUNEO0FBQ0Y7QUFDRjs7OzJCQUVPLEcsRUFBSztBQUNYLFdBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBeUIsVUFBQSxDQUFBLEVBQWE7QUFDcEMsWUFBQSxLQUFBLENBQUEsU0FBQSxDQUFvQixJQUFBLE1BQUEsQ0FBcEIsVUFBQSxFQUEyQyxFQUEzQyxDQUEyQyxDQUEzQyxFQUFpRCxFQUFqRCxDQUFpRCxDQUFqRDtBQURGLE9BQUE7QUFHRDs7Ozs7O2tCQUdZLG1COzs7OztBQ3hEZixJQUFBLFVBQUEsUUFBQSxVQUFBLENBQUE7Ozs7Ozs7O0FBRUEsSUFBSSxXQUFKLFdBQUEsQ0FBMkI7O0FBRXpCLFNBQU87QUFDTCxZQURLLFVBQUE7QUFFTCxnQkFBWTtBQUNWLGtCQUFZO0FBREY7QUFGUCxHQUZrQjs7QUFTekIsVUFBUSxTQUFBLE1BQUEsR0FBWTtBQUNsQixTQUFBLFVBQUEsQ0FBQSxPQUFBO0FBQ0EsU0FBQSxTQUFBLENBQUEsY0FBQTtBQVh1QixHQUFBOztBQWN6QixTQUFPLFNBQUEsS0FBQSxHQUFZO0FBQ2pCLFNBQUEsUUFBQSxDQUFjLFNBQUEsT0FBQSxDQUFkLEtBQUE7QUFmdUIsR0FBQTs7QUFrQnpCLGFBQVcsU0FBQSxTQUFBLENBQUEsSUFBQSxFQUFnQixDQWxCRixDQUFBOztBQXFCekIsU0FBTztBQUNQOztBQXRCeUIsQ0FBM0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBCYWxsIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLnggPSAwXHJcbiAgICB0aGlzLnkgPSAwXHJcbiAgICB0aGlzLndpZHRoID0gMzJcclxuICAgIHRoaXMuaGVpZ2h0ID0gMzJcclxuICAgIHRoaXMuY29sb3IgPSAnI2UyNTQzZSdcclxuICAgIHRoaXMuc3BlZWQgPSAyNTZcclxuICAgIHRoaXMuZGlyZWN0UmFkaWFucyA9IDBcclxuICB9XHJcblxyXG4gIGZhY2VUbyAoeCwgeSkge1xyXG4gICAgdGhpcy5kaXJlY3RSYWRpYW5zID0gTWF0aC5hdGFuMih5IC0gdGhpcy55LCB4IC0gdGhpcy54KVxyXG4gIH1cclxuXHJcbiAgcnVuIChkdCkge1xyXG4gICAgdGhpcy54ICs9IE1hdGguY29zKHRoaXMuZGlyZWN0UmFkaWFucykgKiB0aGlzLnNwZWVkICogZHRcclxuICAgIHRoaXMueSArPSBNYXRoLnNpbih0aGlzLmRpcmVjdFJhZGlhbnMpICogdGhpcy5zcGVlZCAqIGR0XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCYWxsXHJcbiIsImNsYXNzIENvbGxpc2lvbkRldGVjdGlvbiB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5jb2xsaWRpbmdSZWNvcmQgPSBbXVxyXG4gICAgdGhpcy5jb2xsaWRpbmdEZWxheSA9IDEwMDAgLy8gbXNcclxuICB9XHJcblxyXG4gIENpcmNsZVJlY3RDb2xsaWRpbmcgKGNpcmNsZSwgcmVjdCkge1xyXG4gICAgLy8gZGVsYXlcclxuICAgIGlmICh0aGlzLmNvbGxpZGluZ1JlY29yZFtjaXJjbGVdICYmXHJcbiAgICAgIHRoaXMuY29sbGlkaW5nUmVjb3JkW2NpcmNsZV0ud2l0aCA9PT0gcmVjdCAmJlxyXG4gICAgICAobmV3IERhdGUoKSkuZ2V0VGltZSgpIDwgdGhpcy5jb2xsaWRpbmdSZWNvcmRbY2lyY2xlXS50aW1lLmdldFRpbWUoKSArIHRoaXMuY29sbGlkaW5nRGVsYXkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgICB2YXIgZGlzdFggPSBNYXRoLmFicyhjaXJjbGUueCAtIHJlY3QueCAtIHJlY3QudyAvIDIpXHJcbiAgICB2YXIgZGlzdFkgPSBNYXRoLmFicyhjaXJjbGUueSAtIHJlY3QueSAtIHJlY3QuaCAvIDIpXHJcblxyXG4gICAgaWYgKGRpc3RYID4gKHJlY3QudyAvIDIgKyBjaXJjbGUucikpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgIGlmIChkaXN0WSA+IChyZWN0LmggLyAyICsgY2lyY2xlLnIpKSB7IHJldHVybiBmYWxzZSB9XHJcblxyXG4gICAgaWYgKGRpc3RYIDw9IChyZWN0LncgLyAyKSkgeyByZXR1cm4gdHJ1ZSB9XHJcbiAgICBpZiAoZGlzdFkgPD0gKHJlY3QuaCAvIDIpKSB7IHJldHVybiB0cnVlIH1cclxuXHJcbiAgICB2YXIgZHggPSBkaXN0WCAtIHJlY3QudyAvIDJcclxuICAgIHZhciBkeSA9IGRpc3RZIC0gcmVjdC5oIC8gMlxyXG4gICAgdmFyIGlzQ29sbGlzaW9uID0gKGR4ICogZHggKyBkeSAqIGR5IDw9IChjaXJjbGUuciAqIGNpcmNsZS5yKSlcclxuICAgIGlmIChpc0NvbGxpc2lvbikge1xyXG4gICAgICB0aGlzLmNvbGxpZGluZ1JlY29yZFtjaXJjbGVdID0ge1xyXG4gICAgICAgIHdpdGg6IHJlY3QsXHJcbiAgICAgICAgdGltZTogbmV3IERhdGUoKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaXNDb2xsaXNpb25cclxuICB9XHJcblxyXG4gIFJlY3RSZWN0Q29sbGlkaW5nIChyZWN0MSwgcmVjdDIpIHtcclxuICAgIGlmIChyZWN0MS54IDwgcmVjdDIueCArIHJlY3QyLndpZHRoICYmXHJcbiAgICAgIHJlY3QxLnggKyByZWN0MS53aWR0aCA+IHJlY3QyLnggJiZcclxuICAgICAgcmVjdDEueSA8IHJlY3QyLnkgKyByZWN0Mi5oZWlnaHQgJiZcclxuICAgICAgcmVjdDEuaGVpZ2h0ICsgcmVjdDEueSA+IHJlY3QyLnkpIHtcclxuICAgICAgLy8gY29sbGlzaW9uIGRldGVjdGVkIVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBSZWN0UG9pbnRDb2xsaWRpbmcgKHJlY3QsIHBvaW50KSB7XHJcbiAgICBpZiAocmVjdC54IDw9IHBvaW50LnggJiZcclxuICAgICAgcmVjdC54ICsgcmVjdC53aWR0aCA+PSBwb2ludC54ICYmXHJcbiAgICAgIHJlY3QueSA8PSBwb2ludC55ICYmXHJcbiAgICAgIHJlY3QuaGVpZ2h0ICsgcmVjdC55ID49IHBvaW50LnkpIHtcclxuICAgICAgLy8gY29sbGlzaW9uIGRldGVjdGVkIVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb2xsaXNpb25EZXRlY3Rpb25cclxuIiwiaW1wb3J0IEJhbGwgZnJvbSAnLi9CYWxsJ1xyXG5pbXBvcnQgQ29sbGlzaW9uRGV0ZWN0aW9uIGZyb20gJy4vQ29sbGlzaW9uJ1xyXG5pbXBvcnQgU2Nyb2xsaW5nQmFja2dyb3VuZCBmcm9tICcuL1Njcm9sbGluZ0JhY2tncm91bmQnXHJcbmltcG9ydCBTY29yZSBmcm9tICcuL1Njb3JlJ1xyXG5cclxubGV0IEVuZ2luZSA9IHtcclxuICBSZXNvdXJjZToge30sXHJcbiAgZGlmZmljdWx0eTogMFxyXG59XHJcbmxldCBjb2xsaXNpb25EZXRlY3Rpb24gPSBuZXcgQ29sbGlzaW9uRGV0ZWN0aW9uKClcclxuXHJcbkVuZ2luZS5JbnRybyA9IHtcclxuXHJcbiAgbGV2ZWw6IDEsXHJcblxyXG4gIGVudGVyOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hcHAuc2Nyb2xsaW5nQmFja2dyb3VuZCA9IG5ldyBTY3JvbGxpbmdCYWNrZ3JvdW5kKHRoaXMuYXBwLmltYWdlcy5iYWNrZ3JvdW5kKVxyXG4gICAgdGhpcy5hcHAuc2Nyb2xsaW5nQmFja2dyb3VuZC5pbml0KHRoaXMuYXBwLndpZHRoLCB0aGlzLmFwcC5oZWlnaHQpXHJcblxyXG4gICAgdGhpcy5hcHAudGhvbWFzID0gbmV3IEJhbGwoKVxyXG4gICAgdGhpcy5hcHAudGhvbWFzLnggPSB0aGlzLmFwcC5jZW50ZXIueFxyXG4gICAgdGhpcy5hcHAudGhvbWFzLnkgPSB0aGlzLmFwcC5jZW50ZXIueVxyXG5cclxuICAgIHRoaXMuYWRkQnV0dG9uID0ge1xyXG4gICAgICB0ZXh0OiAn77yLJyxcclxuICAgICAgeDogdGhpcy5hcHAuY2VudGVyLnggKyAyMDAsXHJcbiAgICAgIHk6IHRoaXMuYXBwLmNlbnRlci55LFxyXG4gICAgICB3aWR0aDogNDAsXHJcbiAgICAgIGhlaWdodDogNDAsXHJcbiAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZWVlJ1xyXG4gICAgfVxyXG4gICAgdGhpcy5taW51c0J1dHRvbiA9IHtcclxuICAgICAgdGV4dDogJ++8jScsXHJcbiAgICAgIHg6IHRoaXMuYXBwLmNlbnRlci54IC0gMjAwLFxyXG4gICAgICB5OiB0aGlzLmFwcC5jZW50ZXIueSxcclxuICAgICAgd2lkdGg6IDQwLFxyXG4gICAgICBoZWlnaHQ6IDQwLFxyXG4gICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2VlZSdcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnRCdXR0b24gPSB7XHJcbiAgICAgIHRleHQ6ICdTdGFydCcsXHJcbiAgICAgIHg6IHRoaXMuYXBwLmNlbnRlci54LFxyXG4gICAgICB5OiB0aGlzLmFwcC5jZW50ZXIueSArIDIwMCxcclxuICAgICAgd2lkdGg6IDgwLFxyXG4gICAgICBoZWlnaHQ6IDQwLFxyXG4gICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2VlZSdcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBzdGVwOiBmdW5jdGlvbiAoZHQpIHtcclxuICB9LFxyXG5cclxuICByZW5kZXI6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgbGV0IGFkZEJ1dHRvbiA9IHRoaXMuYWRkQnV0dG9uXHJcbiAgICBsZXQgbWludXNCdXR0b24gPSB0aGlzLm1pbnVzQnV0dG9uXHJcbiAgICBsZXQgc3RhcnRCdXR0b24gPSB0aGlzLnN0YXJ0QnV0dG9uXHJcblxyXG4gICAgdGhpcy5hcHAubGF5ZXIuY2xlYXIoJyMwMDAnKVxyXG4gICAgLy8gYmFja2dyb3VuZFxyXG4gICAgdGhpcy5hcHAuc2Nyb2xsaW5nQmFja2dyb3VuZC5yZW5kZXIodGhpcy5hcHApXHJcblxyXG4gICAgdGhpcy5hcHAubGF5ZXJcclxuICAgICAgLmZvbnQoJzQwcHggR2VvcmdpYScpXHJcbiAgICAgIC5maWxsVGV4dCgnTGV2ZWw6ICcgKyB0aGlzLmxldmVsLCB0aGlzLmFwcC5jZW50ZXIueCAtIDMwLCB0aGlzLmFwcC5jZW50ZXIueSlcclxuICAgICAgLmZpbGxTdHlsZShhZGRCdXR0b24uaGVpZ2h0ICsgJ3B4ICNhYmMnKVxyXG4gICAgICAudGV4dFdpdGhCYWNrZ3JvdW5kKGFkZEJ1dHRvbi50ZXh0LCBhZGRCdXR0b24ueCwgYWRkQnV0dG9uLnksIGFkZEJ1dHRvbi5iYWNrZ3JvdW5kX2NvbG9yKVxyXG4gICAgICAuZmlsbFN0eWxlKG1pbnVzQnV0dG9uLmhlaWdodCArICdweCAjYWJjJylcclxuICAgICAgLnRleHRXaXRoQmFja2dyb3VuZChtaW51c0J1dHRvbi50ZXh0LCBtaW51c0J1dHRvbi54LCBtaW51c0J1dHRvbi55LCBtaW51c0J1dHRvbi5iYWNrZ3JvdW5kX2NvbG9yKVxyXG4gICAgICAuZmlsbFN0eWxlKHN0YXJ0QnV0dG9uLmhlaWdodCArICdweCAjYWJjJylcclxuICAgICAgLnRleHRXaXRoQmFja2dyb3VuZChzdGFydEJ1dHRvbi50ZXh0LCBzdGFydEJ1dHRvbi54LCBzdGFydEJ1dHRvbi55LCBzdGFydEJ1dHRvbi5iYWNrZ3JvdW5kX2NvbG9yKVxyXG4gIH0sXHJcblxyXG4gIG1vdXNlZG93bjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIGlmIChjb2xsaXNpb25EZXRlY3Rpb24uUmVjdFBvaW50Q29sbGlkaW5nKHRoaXMuYWRkQnV0dG9uLCBkYXRhKSkge1xyXG4gICAgICB0aGlzLmxldmVsKytcclxuICAgIH1cclxuICAgIGlmIChjb2xsaXNpb25EZXRlY3Rpb24uUmVjdFBvaW50Q29sbGlkaW5nKHRoaXMubWludXNCdXR0b24sIGRhdGEpKSB7XHJcbiAgICAgIHRoaXMubGV2ZWwtLVxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubGV2ZWwgPiAxMCkgdGhpcy5sZXZlbCA9IDEwXHJcbiAgICBpZiAodGhpcy5sZXZlbCA8IDEpIHRoaXMubGV2ZWwgPSAxXHJcblxyXG4gICAgLy8gbGFyZ2VyIGhhcmRlclxyXG4gICAgaWYgKGNvbGxpc2lvbkRldGVjdGlvbi5SZWN0UG9pbnRDb2xsaWRpbmcodGhpcy5zdGFydEJ1dHRvbiwgZGF0YSkpIHtcclxuICAgICAgRW5naW5lLmRpZmZpY3VsdHkgPSB0aGlzLmxldmVsIC8gMTBcclxuICAgICAgdGhpcy5hcHAuc2V0U3RhdGUoRW5naW5lLkdhbWUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxufVxyXG5cclxuRW5naW5lLkdhbWUgPSB7XHJcblxyXG4gIGVudGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBFbmdpbmUuUmVzb3VyY2UgPSB0aGlzLmFwcC5tdXNpYy5wbGF5KCdtdXNpYycsIHRydWUpXHJcbiAgICBFbmdpbmUuZW5lbWllcyA9IFtdXHJcbiAgICBFbmdpbmUuc2NvcmUgPSBuZXcgU2NvcmUoKVxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hcHAuc2Nyb2xsaW5nQmFja2dyb3VuZCA9IG5ldyBTY3JvbGxpbmdCYWNrZ3JvdW5kKHRoaXMuYXBwLmltYWdlcy5iYWNrZ3JvdW5kKVxyXG4gICAgdGhpcy5hcHAuc2Nyb2xsaW5nQmFja2dyb3VuZC5pbml0KHRoaXMuYXBwLndpZHRoLCB0aGlzLmFwcC5oZWlnaHQpXHJcblxyXG4gICAgdGhpcy5hcHAudGhvbWFzID0gbmV3IEJhbGwoKVxyXG4gICAgdGhpcy5hcHAudGhvbWFzLnggPSB0aGlzLmFwcC5jZW50ZXIueFxyXG4gICAgdGhpcy5hcHAudGhvbWFzLnkgPSB0aGlzLmFwcC5jZW50ZXIueVxyXG4gIH0sXHJcblxyXG4gIHN0ZXA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgLy8gdGhvbWFzXHJcbiAgICBsZXQgdGhvbWFzID0gdGhpcy5hcHAudGhvbWFzXHJcbiAgICAvLyBiYWNrZ3JvdW5kXHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmFwcC5zY3JvbGxpbmdCYWNrZ3JvdW5kLm1vdmUodGhvbWFzLnNwZWVkICogZHQpXHJcblxyXG4gICAgLy8gY2FsYyBkaXN0YW5jZVxyXG4gICAgRW5naW5lLnNjb3JlLmFkZCgtZGVsdGFbMV0gKiBFbmdpbmUuZGlmZmljdWx0eSlcclxuICAgIEVuZ2luZS5zY29yZS5zYXZlKClcclxuXHJcbiAgICAvLyBlbmVtaWVzXHJcbiAgICBsZXQgZW5lbWllcyA9IEVuZ2luZS5lbmVtaWVzXHJcbiAgICBpZiAoRW5naW5lLnNjb3JlLm5ld1Njb3JlKCkgJiYgTWF0aC5yYW5kb20oKSA8IEVuZ2luZS5kaWZmaWN1bHR5KSB7XHJcbiAgICAgIC8vIG5ldyBwbGFjZVxyXG4gICAgICBsZXQgZW5lbXkgPSBuZXcgQmFsbCgpXHJcbiAgICAgIGVuZW15LnNwZWVkID0gMjU2XHJcbiAgICAgIGVuZW15LnggPSBNYXRoLnJhbmRvbSgpICogdGhpcy5hcHAud2lkdGhcclxuICAgICAgZW5lbXkueSA9IDBcclxuICAgICAgZW5lbXkuZGlyZWN0UmFkaWFucyA9IE1hdGguYXNpbigxKVxyXG4gICAgICBlbmVteS5jb2xvciA9ICcjZTI0ZmEyJ1xyXG4gICAgICBlbmVtaWVzLnB1c2goZW5lbXkpXHJcbiAgICB9XHJcbiAgICAvLyBlbmVtaWVzIHJ1bm5pbmdcclxuICAgIGVuZW1pZXMuZm9yRWFjaChlbmVteSA9PiB7XHJcbiAgICAgIGVuZW15LnJ1bihkdClcclxuICAgICAgZW5lbXkueCAtPSBkZWx0YVswXVxyXG4gICAgICBlbmVteS55IC09IGRlbHRhWzFdXHJcbiAgICAgIGlmIChjb2xsaXNpb25EZXRlY3Rpb24uUmVjdFJlY3RDb2xsaWRpbmcoZW5lbXksIHRob21hcykpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnY29sbGlzc2lvbicpXHJcbiAgICAgICAgdGhpcy5hcHAubXVzaWMuc3RvcChFbmdpbmUuUmVzb3VyY2UpXHJcbiAgICAgICAgdGhpcy5hcHAuc2V0U3RhdGUoRW5naW5lLkdhbWUpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBsZXQgZW5lbWllc0luZGV4ID0gZW5lbWllcy5sZW5ndGggLSAxXHJcbiAgICB3aGlsZSAoZW5lbWllc0luZGV4ID49IDApIHtcclxuICAgICAgaWYgKGVuZW1pZXNbZW5lbWllc0luZGV4XS55ID4gdGhpcy5hcHAuaGVpZ2h0KSB7XHJcbiAgICAgICAgZW5lbWllcy5zcGxpY2UoZW5lbWllc0luZGV4LCAxKVxyXG4gICAgICB9XHJcbiAgICAgIGVuZW1pZXNJbmRleCAtPSAxXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgIGxldCB0aG9tYXMgPSB0aGlzLmFwcC50aG9tYXNcclxuXHJcbiAgICB0aGlzLmFwcC5sYXllci5jbGVhcignIzAwMCcpXHJcbiAgICAvLyBiYWNrZ3JvdW5kXHJcbiAgICB0aGlzLmFwcC5zY3JvbGxpbmdCYWNrZ3JvdW5kLnJlbmRlcih0aGlzLmFwcClcclxuXHJcbiAgICB0aGlzLmFwcC5sYXllclxyXG4gICAgICAuZmlsbFN0eWxlKHRob21hcy5jb2xvcilcclxuICAgICAgLmZpbGxSZWN0KHRob21hcy54LCB0aG9tYXMueSwgdGhvbWFzLndpZHRoLCB0aG9tYXMuaGVpZ2h0KVxyXG4gICAgICAuZm9udCgnNDBweCBHZW9yZ2lhJylcclxuICAgICAgLmZpbGxUZXh0KCdDdXJyZW50OiAnICsgRW5naW5lLnNjb3JlLmdldFNjb3JlKCksIHRoaXMuYXBwLndpZHRoIC0gMzAwLCAxNjApXHJcbiAgICAgIC5mb250KCc0MHB4IEdyZWVuJylcclxuICAgICAgLmZpbGxUZXh0KCdIaWdoOiAnICsgRW5naW5lLnNjb3JlLmdldEhpZ2hTY29yZSgpLCB0aGlzLmFwcC53aWR0aCAtIDMwMCwgODApXHJcblxyXG4gICAgRW5naW5lLmVuZW1pZXMuZm9yRWFjaChlbmVteSA9PiB7XHJcbiAgICAgIHRoaXMuYXBwLmxheWVyXHJcbiAgICAgICAgLmZpbGxTdHlsZShlbmVteS5jb2xvcilcclxuICAgICAgICAuZmlsbFJlY3QoZW5lbXkueCwgZW5lbXkueSwgZW5lbXkud2lkdGgsIGVuZW15LmhlaWdodClcclxuICAgIH0pXHJcbiAgfSxcclxuXHJcbiAgbW91c2Vkb3duOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgLy8gdGhpcy5hcHAuc291bmQucGxheShcImxhc2VyXCIpO1xyXG5cclxuICB9LFxyXG5cclxuICBtb3VzZW1vdmU6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICB0aGlzLmFwcC5zY3JvbGxpbmdCYWNrZ3JvdW5kLmRpcmVjdFJhZGlhbnMgPSBNYXRoLmF0YW4yKGRhdGEueSAtIHRoaXMuYXBwLmNlbnRlci55LCBkYXRhLnggLSB0aGlzLmFwcC5jZW50ZXIueClcclxuICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFbmdpbmVcclxuIiwiY2xhc3MgU2NvcmUge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuc2NvcmVDdXJyZW50ID0gMFxyXG4gICAgdGhpcy5zY29yZU1heCA9IDBcclxuICAgIHRoaXMuaGlnaHNjb3JlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2hpZ2hzY29yZScpIHx8IDBcclxuICB9XHJcblxyXG4gIHNhdmUgKCkge1xyXG4gICAgaWYgKHRoaXMuc2NvcmVDdXJyZW50ID4gdGhpcy5oaWdoc2NvcmUpIHtcclxuICAgICAgdGhpcy5oaWdoc2NvcmUgPSB0aGlzLnNjb3JlQ3VycmVudFxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGlnaHNjb3JlJywgdGhpcy5oaWdoc2NvcmUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGVhciAoKSB7XHJcbiAgICB0aGlzLnNjb3JlQ3VycmVudCA9IDBcclxuICAgIHRoaXMuc2NvcmVNYXggPSAwXHJcbiAgfVxyXG5cclxuICBhZGQgKHNjb3JlKSB7XHJcbiAgICB0aGlzLnNjb3JlQ3VycmVudCArPSBzY29yZVxyXG4gICAgdGhpcy5zY29yZU1heCA9IE1hdGgubWF4KHRoaXMuc2NvcmVNYXgsIHRoaXMuc2NvcmVDdXJyZW50KVxyXG4gIH1cclxuXHJcbiAgbmV3U2NvcmUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2NvcmVDdXJyZW50ID09PSB0aGlzLnNjb3JlTWF4XHJcbiAgfVxyXG5cclxuICBnZXRIaWdoU2NvcmUgKCkge1xyXG4gICAgcmV0dXJuIChOdW1iZXIodGhpcy5oaWdoc2NvcmUpKS50b0ZpeGVkKDIpXHJcbiAgfVxyXG5cclxuICBnZXRTY29yZSAoKSB7XHJcbiAgICByZXR1cm4gKE51bWJlcih0aGlzLnNjb3JlQ3VycmVudCkpLnRvRml4ZWQoMilcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjb3JlXHJcbiIsImNsYXNzIFNjcm9sbGluZ0JhY2tncm91bmQge1xyXG4gIGNvbnN0cnVjdG9yIChpbWFnZSkge1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kcyA9IFtdXHJcbiAgICB0aGlzLmJ3ID0gaW1hZ2Uud2lkdGhcclxuICAgIHRoaXMuYmggPSBpbWFnZS5oZWlnaHRcclxuICAgIHRoaXMubGF5ZXIgPSB7fVxyXG4gICAgdGhpcy5kaXJlY3RSYWRpYW5zID0gTWF0aC5hc2luKC0xKVxyXG4gIH1cclxuXHJcbiAgbW92ZSAoc3BlZWQpIHtcclxuICAgIGxldCBkeCA9IE1hdGguY29zKHRoaXMuZGlyZWN0UmFkaWFucykgKiBzcGVlZFxyXG4gICAgbGV0IGR5ID0gTWF0aC5zaW4odGhpcy5kaXJlY3RSYWRpYW5zKSAqIHNwZWVkXHJcbiAgICBsZXQgbHcgPSB0aGlzLmxheWVyLndcclxuICAgIGxldCBsaCA9IHRoaXMubGF5ZXIuaFxyXG4gICAgbGV0IG54ID0gTWF0aC5jZWlsKGx3IC8gdGhpcy5idykgKyAxXHJcbiAgICBsZXQgbnkgPSBNYXRoLmNlaWwobGggLyB0aGlzLmJoKSArIDFcclxuICAgIHRoaXMuYmFja2dyb3VuZHMuZm9yRWFjaChlID0+IHtcclxuICAgICAgZVswXSAtPSBkeFxyXG4gICAgICBlWzFdIC09IGR5XHJcbiAgICAgIGlmIChlWzBdIDwgLXRoaXMuYncpIHtcclxuICAgICAgICBlWzBdICs9IChueCArIDEpICogdGhpcy5id1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChlWzBdID4gbHcpIHtcclxuICAgICAgICBlWzBdIC09IChueCArIDEpICogdGhpcy5id1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChlWzFdIDwgLXRoaXMuYmgpIHtcclxuICAgICAgICBlWzFdICs9IChueSArIDEpICogdGhpcy5iaFxyXG4gICAgICB9XHJcbiAgICAgIGlmIChlWzFdID4gbGgpIHtcclxuICAgICAgICBlWzFdIC09IChueSArIDEpICogdGhpcy5iaFxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIFtkeCwgZHldXHJcbiAgfVxyXG5cclxuICBpbml0ICh3LCBoKSB7XHJcbiAgICB0aGlzLmxheWVyID0ge1xyXG4gICAgICB3OiB3LFxyXG4gICAgICBoOiBoXHJcbiAgICB9XHJcbiAgICBsZXQgbnggPSBNYXRoLmNlaWwodyAvIHRoaXMuYncpICsgMVxyXG4gICAgbGV0IG55ID0gTWF0aC5jZWlsKGggLyB0aGlzLmJoKSArIDFcclxuICAgIGZvciAobGV0IGkgPSAtMTsgaSA8PSBueDsgaSsrKSB7XHJcbiAgICAgIGZvciAobGV0IGogPSAtMTsgaiA8PSBueTsgaisrKSB7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kcy5wdXNoKFtpICogdGhpcy5idywgaiAqIHRoaXMuYmhdKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW5kZXIgKGFwcCkge1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kcy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGFwcC5sYXllci5kcmF3SW1hZ2UoYXBwLmltYWdlcy5iYWNrZ3JvdW5kLCBlWzBdLCBlWzFdKVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjcm9sbGluZ0JhY2tncm91bmRcclxuIiwiaW1wb3J0IEVuZ2luZSBmcm9tICcuL0VuZ2luZSdcclxuXHJcbm5ldyBQTEFZR1JPVU5ELkFwcGxpY2F0aW9uKHtcclxuXHJcbiAgcGF0aHM6IHtcclxuICAgIHNvdW5kczogJy9zb3VuZHMvJyxcclxuICAgIHJld3JpdGVVUkw6IHtcclxuICAgICAgYmFja2dyb3VuZDogJy9pbWFnZXMvYmFja2dyb3VuZC5wbmcnXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmxvYWRTb3VuZHMoJ211c2ljJylcclxuICAgIHRoaXMubG9hZEltYWdlKCc8YmFja2dyb3VuZD4nKVxyXG4gIH0sXHJcblxyXG4gIHJlYWR5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnNldFN0YXRlKEVuZ2luZS5JbnRybylcclxuICB9LFxyXG5cclxuICBtb3VzZWRvd246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgfSxcclxuXHJcbiAgc2NhbGU6IDAuNVxyXG4gIC8vIGNvbnRhaW5lcjogZXhhbXBsZUNvbnRhaW5lclxyXG5cclxufSlcclxuIl19
