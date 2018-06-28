(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _class = require('./level/class1');

var _library = require('./library');

var canvas = void 0;
var raf = void 0;
var collisionDetection = new _library.CollisionDetection();
var isRunning = false;
var paddle = new _library.Rect();
var bricks = [];
var score = 0;
var ball = void 0;

function draw() {
  canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var width = canvas.width;
  var height = canvas.height;

  ctx.clearRect(0, 0, width, height); // clear canvas

  // paddle
  paddle.draw(canvas);

  // score
  ctx.font = '10pt Arial';
  ctx.textAlign = 'right';
  ctx.fillText(score, width, 10);

  // ball
  ball.draw(canvas);

  // bricks
  bricks.forEach(function (brick, i) {
    brick.draw(canvas);
    if (collisionDetection.CircleRectColliding(ball, brick)) {
      console.log('break brick !!');
      bricks.splice(i, 1);
      score += 1;
      ball.vy = -ball.vy;
    }
  });

  // collision detection
  if (collisionDetection.CircleRectColliding(ball, paddle)) {
    ball.vy = -ball.vy;
    console.log('collision');
  }

  // stop game!
  if (ball.y > canvas.height - 20) {
    window.cancelAnimationFrame(raf);
    isRunning = false;
    init();
    return;
  }

  if (isRunning) {
    raf = window.requestAnimationFrame(draw);
  }
}

function init() {
  score = 0;

  // paint
  canvas = document.getElementById('canvas');
  paddle.x = canvas.width / 2 - paddle.w;
  paddle.y = canvas.height - paddle.h - 30;
  ball = new _library.Ball({
    x: paddle.x + paddle.w / 2,
    y: paddle.y - paddle.h / 2 - 5,
    r: 10
  });

  // init bricks
  bricks = [];
  _class.map.forEach(function (point) {
    bricks.push(new _library.Rect({
      x: point[0],
      y: point[1]
    }));
  });
}

(function () {
  init();
  draw();
  // mouse control paddle location
  canvas.addEventListener('mousemove', function (e) {
    paddle.x = e.clientX - paddle.w / 2;
  });

  // start game
  canvas.addEventListener('click', function (e) {
    if (!isRunning) {
      init();
      raf = window.requestAnimationFrame(draw);
      isRunning = true;
    }
  });
})();

},{"./level/class1":2,"./library":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var map = exports.map = [[10, 30], [60, 30], [110, 30], [160, 30], [210, 30], [260, 30], [310, 30], [360, 30], [410, 30], [460, 30], [510, 30], [560, 30], [10, 60], [60, 60], [110, 60], [160, 60], [210, 60], [260, 60], [310, 60], [360, 60], [410, 60], [460, 60], [510, 60], [560, 60], [10, 90], [60, 90], [110, 90], [160, 90], [210, 90], [260, 90], [310, 90], [360, 90], [410, 90], [460, 90], [510, 90], [560, 90], [10, 120], [60, 120], [110, 120], [160, 120], [210, 120], [260, 120], [310, 120], [360, 120], [410, 120], [460, 120], [510, 120], [560, 120]];

},{}],3:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var GameObject = function GameObject() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      x = _ref.x,
      y = _ref.y;

  _classCallCheck(this, GameObject);

  this.x = x || 0;
  this.y = y || 0;
  this.color = 'blue';
};

var Ball = exports.Ball = function (_GameObject) {
  _inherits(Ball, _GameObject);

  function Ball() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Ball);

    var _this = _possibleConstructorReturn(this, (Ball.__proto__ || Object.getPrototypeOf(Ball)).call(this, options));

    _this.vx = 5;
    _this.vy = -2;
    _this.r = options.r;
    _this.color = 'blue';
    return _this;
  }

  _createClass(Ball, [{
    key: 'draw',
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      // 如果下一個frame超出y
      if (this.y + this.vy > canvas.height - this.r || this.y + this.vy < this.r) {
        this.vy = -this.vy;
      }
      if (this.x + this.vx > canvas.width - this.r || this.x + this.vx < this.r) {
        this.vx = -this.vx;
      }
      this.x += this.vx;
      this.y += this.vy;
    }
  }]);

  return Ball;
}(GameObject);

var Rect = exports.Rect = function (_GameObject2) {
  _inherits(Rect, _GameObject2);

  function Rect(options) {
    _classCallCheck(this, Rect);

    var _this2 = _possibleConstructorReturn(this, (Rect.__proto__ || Object.getPrototypeOf(Rect)).call(this, options));

    _this2.w = 40;
    _this2.h = 15;
    _this2.color = 'rgb(200,0,0)';
    return _this2;
  }

  _createClass(Rect, [{
    key: 'draw',
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }]);

  return Rect;
}(GameObject);

var CollisionDetection = exports.CollisionDetection = function CollisionDetection() {
  this.collidingRecord = [];
  this.collidingDelay = 1000; // ms
  this.CircleRectColliding = function (circle, rect) {
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
  };
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2xldmVsL2NsYXNzMS5qcyIsInNyYy9saWJyYXJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFBLFNBQUEsUUFBQSxnQkFBQSxDQUFBOztBQUNBLElBQUEsV0FBQSxRQUFBLFdBQUEsQ0FBQTs7QUFFQSxJQUFJLFNBQUEsS0FBSixDQUFBO0FBQ0EsSUFBSSxNQUFBLEtBQUosQ0FBQTtBQUNBLElBQUkscUJBQXFCLElBQUksU0FBN0Isa0JBQXlCLEVBQXpCO0FBQ0EsSUFBSSxZQUFKLEtBQUE7QUFDQSxJQUFJLFNBQVMsSUFBSSxTQUFqQixJQUFhLEVBQWI7QUFDQSxJQUFJLFNBQUosRUFBQTtBQUNBLElBQUksUUFBSixDQUFBO0FBQ0EsSUFBSSxPQUFBLEtBQUosQ0FBQTs7QUFFQSxTQUFBLElBQUEsR0FBaUI7QUFDZixXQUFTLFNBQUEsY0FBQSxDQUFULFFBQVMsQ0FBVDtBQUNBLE1BQUksTUFBTSxPQUFBLFVBQUEsQ0FBVixJQUFVLENBQVY7QUFDQSxNQUFJLFFBQVEsT0FBWixLQUFBO0FBQ0EsTUFBSSxTQUFTLE9BQWIsTUFBQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFOZSxNQU1mLEVBTmUsQ0FNb0I7O0FBRW5DO0FBQ0EsU0FBQSxJQUFBLENBQUEsTUFBQTs7QUFFQTtBQUNBLE1BQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxNQUFBLFNBQUEsR0FBQSxPQUFBO0FBQ0EsTUFBQSxRQUFBLENBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxFQUFBOztBQUVBO0FBQ0EsT0FBQSxJQUFBLENBQUEsTUFBQTs7QUFFQTtBQUNBLFNBQUEsT0FBQSxDQUFlLFVBQUEsS0FBQSxFQUFBLENBQUEsRUFBb0I7QUFDakMsVUFBQSxJQUFBLENBQUEsTUFBQTtBQUNBLFFBQUksbUJB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LENBQUEsR0FBekMsQ0FBWSxDQUFaO0FBQ0EsUUFBSSxRQUFRLEtBQUEsR0FBQSxDQUFTLE9BQUEsQ0FBQSxHQUFXLEtBQVgsQ0FBQSxHQUFvQixLQUFBLENBQUEsR0FBekMsQ0FBWSxDQUFaOztBQUVBLFFBQUksUUFBUyxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQWEsT0FBMUIsQ0FBQSxFQUFxQztBQUFFLGFBQUEsS0FBQTtBQUFjO0FBQ3JELFFBQUksUUFBUyxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQWEsT0FBMUIsQ0FBQSxFQUFxQztBQUFFLGFBQUEsS0FBQTtBQUFjOztBQUVyRCxRQUFJLFNBQVUsS0FBQSxDQUFBLEdBQWQsQ0FBQSxFQUEyQjtBQUFFLGFBQUEsSUFBQTtBQUFhO0FBQzFDLFFBQUksU0FBVSxLQUFBLENBQUEsR0FBZCxDQUFBLEVBQTJCO0FBQUUsYUFBQSxJQUFBO0FBQWE7O0FBRTFDLFFBQUksS0FBSyxRQUFRLEtBQUEsQ0FBQSxHQUFqQixDQUFBO0FBQ0EsUUFBSSxLQUFLLFFBQVEsS0FBQSxDQUFBLEdBQWpCLENBQUE7QUFDQSxRQUFJLGNBQWUsS0FBQSxFQUFBLEdBQVUsS0FBVixFQUFBLElBQXNCLE9BQUEsQ0FBQSxHQUFXLE9BQXBELENBQUE7QUFDQSxRQUFBLFdBQUEsRUFBaUI7QUFDZixXQUFBLGVBQUEsQ0FBQSxNQUFBLElBQStCO0FBQzdCLGNBRDZCLElBQUE7QUFFN0IsY0FBTSxJQUFBLElBQUE7QUFGdUIsT0FBL0I7QUFJRDtBQUNELFdBQUEsV0FBQTtBQXpCRixHQUFBO0FBSEssQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IG1hcCB9IGZyb20gJy4vbGV2ZWwvY2xhc3MxJ1xyXG5pbXBvcnQgeyBCYWxsLCBSZWN0LCBSZWN0IGFzIFBhZGRsZSwgQ29sbGlzaW9uRGV0ZWN0aW9uIH0gZnJvbSAnLi9saWJyYXJ5J1xyXG5cclxubGV0IGNhbnZhc1xyXG5sZXQgcmFmXHJcbmxldCBjb2xsaXNpb25EZXRlY3Rpb24gPSBuZXcgQ29sbGlzaW9uRGV0ZWN0aW9uKClcclxubGV0IGlzUnVubmluZyA9IGZhbHNlXHJcbmxldCBwYWRkbGUgPSBuZXcgUGFkZGxlKClcclxubGV0IGJyaWNrcyA9IFtdXHJcbmxldCBzY29yZSA9IDBcclxubGV0IGJhbGxcclxuXHJcbmZ1bmN0aW9uIGRyYXcgKCkge1xyXG4gIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKVxyXG4gIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxyXG4gIGxldCB3aWR0aCA9IGNhbnZhcy53aWR0aFxyXG4gIGxldCBoZWlnaHQgPSBjYW52YXMuaGVpZ2h0XHJcblxyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCkgLy8gY2xlYXIgY2FudmFzXHJcblxyXG4gIC8vIHBhZGRsZVxyXG4gIHBhZGRsZS5kcmF3KGNhbnZhcylcclxuXHJcbiAgLy8gc2NvcmVcclxuICBjdHguZm9udCA9ICcxMHB0IEFyaWFsJ1xyXG4gIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnXHJcbiAgY3R4LmZpbGxUZXh0KHNjb3JlLCB3aWR0aCwgMTApXHJcblxyXG4gIC8vIGJhbGxcclxuICBiYWxsLmRyYXcoY2FudmFzKVxyXG5cclxuICAvLyBicmlja3NcclxuICBicmlja3MuZm9yRWFjaChmdW5jdGlvbiAoYnJpY2ssIGkpIHtcclxuICAgIGJyaWNrLmRyYXcoY2FudmFzKVxyXG4gICAgaWYgKGNvbGxpc2lvbkRldGVjdGlvbi5DaXJjbGVSZWN0Q29sbGlkaW5nKGJhbGwsIGJyaWNrKSkge1xyXG4gICAgICBjb25zb2xlLmxvZygnYnJlYWsgYnJpY2sgISEnKVxyXG4gICAgICBicmlja3Muc3BsaWNlKGksIDEpXHJcbiAgICAgIHNjb3JlICs9IDFcclxuICAgICAgYmFsbC52eSA9IC1iYWxsLnZ5XHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgLy8gY29sbGlzaW9uIGRldGVjdGlvblxyXG4gIGlmIChjb2xsaXNpb25EZXRlY3Rpb24uQ2lyY2xlUmVjdENvbGxpZGluZyhiYWxsLCBwYWRkbGUpKSB7XHJcbiAgICBiYWxsLnZ5ID0gLWJhbGwudnlcclxuICAgIGNvbnNvbGUubG9nKCdjb2xsaXNpb24nKVxyXG4gIH1cclxuXHJcbiAgLy8gc3RvcCBnYW1lIVxyXG4gIGlmIChiYWxsLnkgPiBjYW52YXMuaGVpZ2h0IC0gMjApIHtcclxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShyYWYpXHJcbiAgICBpc1J1bm5pbmcgPSBmYWxzZVxyXG4gICAgaW5pdCgpXHJcbiAgICByZXR1cm5cclxuICB9XHJcblxyXG4gIGlmIChpc1J1bm5pbmcpIHtcclxuICAgIHJhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdylcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXQgKCkge1xyXG4gIHNjb3JlID0gMFxyXG5cclxuICAvLyBwYWludFxyXG4gIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKVxyXG4gIHBhZGRsZS54ID0gY2FudmFzLndpZHRoIC8gMiAtIHBhZGRsZS53XHJcbiAgcGFkZGxlLnkgPSBjYW52YXMuaGVpZ2h0IC0gcGFkZGxlLmggLSAzMFxyXG4gIGJhbGwgPSBuZXcgQmFsbCh7XHJcbiAgICB4OiBwYWRkbGUueCArIHBhZGRsZS53IC8gMixcclxuICAgIHk6IHBhZGRsZS55IC0gcGFkZGxlLmggLyAyIC0gNSxcclxuICAgIHI6IDEwXHJcbiAgfSlcclxuXHJcbiAgLy8gaW5pdCBicmlja3NcclxuICBicmlja3MgPSBbXVxyXG4gIG1hcC5mb3JFYWNoKGZ1bmN0aW9uIChwb2ludCkge1xyXG4gICAgYnJpY2tzLnB1c2gobmV3IFJlY3Qoe1xyXG4gICAgICB4OiBwb2ludFswXSxcclxuICAgICAgeTogcG9pbnRbMV1cclxuICAgIH0pKVxyXG4gIH0pXHJcbn1cclxuXHJcbigoKSA9PiB7XHJcbiAgaW5pdCgpXHJcbiAgZHJhdygpXHJcbiAgLy8gbW91c2UgY29udHJvbCBwYWRkbGUgbG9jYXRpb25cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHBhZGRsZS54ID0gZS5jbGllbnRYIC0gcGFkZGxlLncgLyAyXHJcbiAgfSlcclxuXHJcbiAgLy8gc3RhcnQgZ2FtZVxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoIWlzUnVubmluZykge1xyXG4gICAgICBpbml0KClcclxuICAgICAgcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KVxyXG4gICAgICBpc1J1bm5pbmcgPSB0cnVlXHJcbiAgICB9XHJcbiAgfSlcclxufSkoKVxyXG4iLCJleHBvcnQgY29uc3QgbWFwID0gW1xyXG4gIFsxMCwgMzBdLFxyXG4gIFs2MCwgMzBdLFxyXG4gIFsxMTAsIDMwXSxcclxuICBbMTYwLCAzMF0sXHJcbiAgWzIxMCwgMzBdLFxyXG4gIFsyNjAsIDMwXSxcclxuICBbMzEwLCAzMF0sXHJcbiAgWzM2MCwgMzBdLFxyXG4gIFs0MTAsIDMwXSxcclxuICBbNDYwLCAzMF0sXHJcbiAgWzUxMCwgMzBdLFxyXG4gIFs1NjAsIDMwXSxcclxuICBbMTAsIDYwXSxcclxuICBbNjAsIDYwXSxcclxuICBbMTEwLCA2MF0sXHJcbiAgWzE2MCwgNjBdLFxyXG4gIFsyMTAsIDYwXSxcclxuICBbMjYwLCA2MF0sXHJcbiAgWzMxMCwgNjBdLFxyXG4gIFszNjAsIDYwXSxcclxuICBbNDEwLCA2MF0sXHJcbiAgWzQ2MCwgNjBdLFxyXG4gIFs1MTAsIDYwXSxcclxuICBbNTYwLCA2MF0sXHJcbiAgWzEwLCA5MF0sXHJcbiAgWzYwLCA5MF0sXHJcbiAgWzExMCwgOTBdLFxyXG4gIFsxNjAsIDkwXSxcclxuICBbMjEwLCA5MF0sXHJcbiAgWzI2MCwgOTBdLFxyXG4gIFszMTAsIDkwXSxcclxuICBbMzYwLCA5MF0sXHJcbiAgWzQxMCwgOTBdLFxyXG4gIFs0NjAsIDkwXSxcclxuICBbNTEwLCA5MF0sXHJcbiAgWzU2MCwgOTBdLFxyXG4gIFsxMCwgMTIwXSxcclxuICBbNjAsIDEyMF0sXHJcbiAgWzExMCwgMTIwXSxcclxuICBbMTYwLCAxMjBdLFxyXG4gIFsyMTAsIDEyMF0sXHJcbiAgWzI2MCwgMTIwXSxcclxuICBbMzEwLCAxMjBdLFxyXG4gIFszNjAsIDEyMF0sXHJcbiAgWzQxMCwgMTIwXSxcclxuICBbNDYwLCAxMjBdLFxyXG4gIFs1MTAsIDEyMF0sXHJcbiAgWzU2MCwgMTIwXVxyXG5dXHJcbiIsImNsYXNzIEdhbWVPYmplY3Qge1xyXG4gIGNvbnN0cnVjdG9yICh7IHgsIHkgfSA9IHt9KSB7XHJcbiAgICB0aGlzLnggPSB4IHx8IDBcclxuICAgIHRoaXMueSA9IHkgfHwgMFxyXG4gICAgdGhpcy5jb2xvciA9ICdibHVlJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJhbGwgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAob3B0aW9ucyA9IHt9KSB7XHJcbiAgICBzdXBlcihvcHRpb25zKVxyXG4gICAgdGhpcy52eCA9IDVcclxuICAgIHRoaXMudnkgPSAtMlxyXG4gICAgdGhpcy5yID0gb3B0aW9ucy5yXHJcbiAgICB0aGlzLmNvbG9yID0gJ2JsdWUnXHJcbiAgfVxyXG5cclxuICBkcmF3IChjYW52YXMpIHtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnIsIDAsIE1hdGguUEkgKiAyLCB0cnVlKVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpXHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvclxyXG4gICAgY3R4LmZpbGwoKVxyXG4gICAgLy8g5aaC5p6c5LiL5LiA5YCLZnJhbWXotoXlh7p5XHJcbiAgICBpZiAodGhpcy55ICsgdGhpcy52eSA+IGNhbnZhcy5oZWlnaHQgLSB0aGlzLnIgfHwgdGhpcy55ICsgdGhpcy52eSA8IHRoaXMucikge1xyXG4gICAgICB0aGlzLnZ5ID0gLXRoaXMudnlcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnggKyB0aGlzLnZ4ID4gY2FudmFzLndpZHRoIC0gdGhpcy5yIHx8IHRoaXMueCArIHRoaXMudnggPCB0aGlzLnIpIHtcclxuICAgICAgdGhpcy52eCA9IC10aGlzLnZ4XHJcbiAgICB9XHJcbiAgICB0aGlzLnggKz0gdGhpcy52eFxyXG4gICAgdGhpcy55ICs9IHRoaXMudnlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBSZWN0IGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcclxuICAgIHN1cGVyKG9wdGlvbnMpXHJcbiAgICB0aGlzLncgPSA0MFxyXG4gICAgdGhpcy5oID0gMTVcclxuICAgIHRoaXMuY29sb3IgPSAncmdiKDIwMCwwLDApJ1xyXG4gIH1cclxuXHJcbiAgZHJhdyAoY2FudmFzKSB7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yXHJcbiAgICBjdHguZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMudywgdGhpcy5oKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IENvbGxpc2lvbkRldGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLmNvbGxpZGluZ1JlY29yZCA9IFtdXHJcbiAgdGhpcy5jb2xsaWRpbmdEZWxheSA9IDEwMDAgLy8gbXNcclxuICB0aGlzLkNpcmNsZVJlY3RDb2xsaWRpbmcgPSBmdW5jdGlvbiAoY2lyY2xlLCByZWN0KSB7XHJcbiAgICAvLyBkZWxheVxyXG4gICAgaWYgKHRoaXMuY29sbGlkaW5nUmVjb3JkW2NpcmNsZV0gJiZcclxuICAgICAgdGhpcy5jb2xsaWRpbmdSZWNvcmRbY2lyY2xlXS53aXRoID09PSByZWN0ICYmXHJcbiAgICAgIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgPCB0aGlzLmNvbGxpZGluZ1JlY29yZFtjaXJjbGVdLnRpbWUuZ2V0VGltZSgpICsgdGhpcy5jb2xsaWRpbmdEZWxheSkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICAgIHZhciBkaXN0WCA9IE1hdGguYWJzKGNpcmNsZS54IC0gcmVjdC54IC0gcmVjdC53IC8gMilcclxuICAgIHZhciBkaXN0WSA9IE1hdGguYWJzKGNpcmNsZS55IC0gcmVjdC55IC0gcmVjdC5oIC8gMilcclxuXHJcbiAgICBpZiAoZGlzdFggPiAocmVjdC53IC8gMiArIGNpcmNsZS5yKSkgeyByZXR1cm4gZmFsc2UgfVxyXG4gICAgaWYgKGRpc3RZID4gKHJlY3QuaCAvIDIgKyBjaXJjbGUucikpIHsgcmV0dXJuIGZhbHNlIH1cclxuXHJcbiAgICBpZiAoZGlzdFggPD0gKHJlY3QudyAvIDIpKSB7IHJldHVybiB0cnVlIH1cclxuICAgIGlmIChkaXN0WSA8PSAocmVjdC5oIC8gMikpIHsgcmV0dXJuIHRydWUgfVxyXG5cclxuICAgIHZhciBkeCA9IGRpc3RYIC0gcmVjdC53IC8gMlxyXG4gICAgdmFyIGR5ID0gZGlzdFkgLSByZWN0LmggLyAyXHJcbiAgICB2YXIgaXNDb2xsaXNpb24gPSAoZHggKiBkeCArIGR5ICogZHkgPD0gKGNpcmNsZS5yICogY2lyY2xlLnIpKVxyXG4gICAgaWYgKGlzQ29sbGlzaW9uKSB7XHJcbiAgICAgIHRoaXMuY29sbGlkaW5nUmVjb3JkW2NpcmNsZV0gPSB7XHJcbiAgICAgICAgd2l0aDogcmVjdCxcclxuICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpc0NvbGxpc2lvblxyXG4gIH1cclxufVxyXG4iXX0=
