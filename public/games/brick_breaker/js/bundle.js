(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _class = require('./level/class1');

var _library = require('./library');

var canvas = void 0;
var raf = void 0;
var collisionDetection = new _library.CollisionDetection();
var running = false;
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
    running = false;
    init();
    return;
  }

  if (running) {
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
    if (!running) {
      init();
      raf = window.requestAnimationFrame(draw);
      running = true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2xldmVsL2NsYXNzMS5qcyIsInNyYy9saWJyYXJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFBLFNBQUEsUUFBQSxnQkFBQSxDQUFBOztBQUNBLElBQUEsV0FBQSxRQUFBLFdBQUEsQ0FBQTs7QUFFQSxJQUFJLFNBQUEsS0FBSixDQUFBO0FBQ0EsSUFBSSxNQUFBLEtBQUosQ0FBQTtBQUNBLElBQUkscUJBQXFCLElBQUksU0FBN0Isa0JBQXlCLEVBQXpCO0FBQ0EsSUFBSSxVQUFKLEtBQUE7QUFDQSxJQUFJLFNBQVMsSUFBSSxTQUFqQixJQUFhLEVBQWI7QUFDQSxJQUFJLFNBQUosRUFBQTtBQUNBLElBQUksUUFBSixDQUFBO0FBQ0EsSUFBSSxPQUFBLEtBQUosQ0FBQTs7QUFFQSxTQUFBLElBQUEsR0FBaUI7QUFDZixXQUFTLFNBQUEsY0FBQSxDQUFULFFBQVMsQ0FBVDtBQUNBLE1BQUksTUFBTSxPQUFBLFVBQUEsQ0FBVixJQUFVLENBQVY7QUFDQSxNQUFJLFFBQVEsT0FBWixLQUFBO0FBQ0EsTUFBSSxTQUFTLE9BQWIsTUFBQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFOZSxNQU1mLEVBTmUsQ0FNb0I7O0FBRW5DO0FBQ0EsU0FBQSxJQUFBLENBQUEsTUFBQTs7QUFFQTtBQUNBLE1BQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxNQUFBLFNBQUEsR0FBQSxPQUFBO0FBQ0EsTUFBQSxRQUFBLENBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxFQUFBOztBQUVBO0FBQ0EsT0FBQSxJQUFBLENBQUEsTUFBQTs7QUFFQTtBQUNBLFNBQUEsT0FBQSxDQUFlLFVBQUEsS0FBQSxFQUFBLENBQUEsRUFBb0I7QUFDakMsVUFBQSxJQUFBLENBQUEsTUFBQTtBQUNBLFFBQUksbUJB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QUFBLEdBQXpDLENBQVksQ0FBWjtBQUNBLFFBQUksUUFBUSxLQUFBLEdBQUEsQ0FBUyxPQUFBLENBQUEsR0FBVyxLQUFYLENBQUEsR0FBb0IsS0FBQSxDQUFBLEdBQXpDLENBQVksQ0FBWjs7QUFFQSxRQUFJLFFBQVMsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFhLE9BQTFCLENBQUEsRUFBcUM7QUFBRSxhQUFBLEtBQUE7QUFBYztBQUNyRCxRQUFJLFFBQVMsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFhLE9BQTFCLENBQUEsRUFBcUM7QUFBRSxhQUFBLEtBQUE7QUFBYzs7QUFFckQsUUFBSSxTQUFVLEtBQUEsQ0FBQSxHQUFkLENBQUEsRUFBMkI7QUFBRSxhQUFBLElBQUE7QUFBYTtBQUMxQyxRQUFJLFNBQVUsS0FBQSxDQUFBLEdBQWQsQ0FBQSxFQUEyQjtBQUFFLGFBQUEsSUFBQTtBQUFhOztBQUUxQyxRQUFJLEtBQUssUUFBUSxLQUFBLENBQUEsR0FBakIsQ0FBQTtBQUNBLFFBQUksS0FBSyxRQUFRLEtBQUEsQ0FBQSxHQUFqQixDQUFBO0FBQ0EsUUFBSSxjQUFlLEtBQUEsRUFBQSxHQUFVLEtBQVYsRUFBQSxJQUFzQixPQUFBLENBQUEsR0FBVyxPQUFwRCxDQUFBO0FBQ0EsUUFBQSxXQUFBLEVBQWlCO0FBQ2YsV0FBQSxlQUFBLENBQUEsTUFBQSxJQUErQjtBQUM3QixjQUQ2QixJQUFBO0FBRTdCLGNBQU0sSUFBQSxJQUFBO0FBRnVCLE9BQS9CO0FBSUQ7QUFDRCxXQUFBLFdBQUE7QUF6QkYsR0FBQTtBQUhLLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBtYXAgfSBmcm9tICcuL2xldmVsL2NsYXNzMSdcclxuaW1wb3J0IHsgQmFsbCwgUmVjdCwgUmVjdCBhcyBQYWRkbGUsIENvbGxpc2lvbkRldGVjdGlvbiB9IGZyb20gJy4vbGlicmFyeSdcclxuXHJcbmxldCBjYW52YXNcclxubGV0IHJhZlxyXG5sZXQgY29sbGlzaW9uRGV0ZWN0aW9uID0gbmV3IENvbGxpc2lvbkRldGVjdGlvbigpXHJcbmxldCBydW5uaW5nID0gZmFsc2VcclxubGV0IHBhZGRsZSA9IG5ldyBQYWRkbGUoKVxyXG5sZXQgYnJpY2tzID0gW11cclxubGV0IHNjb3JlID0gMFxyXG5sZXQgYmFsbFxyXG5cclxuZnVuY3Rpb24gZHJhdyAoKSB7XHJcbiAgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpXHJcbiAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgbGV0IHdpZHRoID0gY2FudmFzLndpZHRoXHJcbiAgbGV0IGhlaWdodCA9IGNhbnZhcy5oZWlnaHRcclxuXHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KSAvLyBjbGVhciBjYW52YXNcclxuXHJcbiAgLy8gcGFkZGxlXHJcbiAgcGFkZGxlLmRyYXcoY2FudmFzKVxyXG5cclxuICAvLyBzY29yZVxyXG4gIGN0eC5mb250ID0gJzEwcHQgQXJpYWwnXHJcbiAgY3R4LnRleHRBbGlnbiA9ICdyaWdodCdcclxuICBjdHguZmlsbFRleHQoc2NvcmUsIHdpZHRoLCAxMClcclxuXHJcbiAgLy8gYmFsbFxyXG4gIGJhbGwuZHJhdyhjYW52YXMpXHJcblxyXG4gIC8vIGJyaWNrc1xyXG4gIGJyaWNrcy5mb3JFYWNoKGZ1bmN0aW9uIChicmljaywgaSkge1xyXG4gICAgYnJpY2suZHJhdyhjYW52YXMpXHJcbiAgICBpZiAoY29sbGlzaW9uRGV0ZWN0aW9uLkNpcmNsZVJlY3RDb2xsaWRpbmcoYmFsbCwgYnJpY2spKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdicmVhayBicmljayAhIScpXHJcbiAgICAgIGJyaWNrcy5zcGxpY2UoaSwgMSlcclxuICAgICAgc2NvcmUgKz0gMVxyXG4gICAgICBiYWxsLnZ5ID0gLWJhbGwudnlcclxuICAgIH1cclxuICB9KVxyXG5cclxuICAvLyBjb2xsaXNpb24gZGV0ZWN0aW9uXHJcbiAgaWYgKGNvbGxpc2lvbkRldGVjdGlvbi5DaXJjbGVSZWN0Q29sbGlkaW5nKGJhbGwsIHBhZGRsZSkpIHtcclxuICAgIGJhbGwudnkgPSAtYmFsbC52eVxyXG4gICAgY29uc29sZS5sb2coJ2NvbGxpc2lvbicpXHJcbiAgfVxyXG5cclxuICAvLyBzdG9wIGdhbWUhXHJcbiAgaWYgKGJhbGwueSA+IGNhbnZhcy5oZWlnaHQgLSAyMCkge1xyXG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZilcclxuICAgIHJ1bm5pbmcgPSBmYWxzZVxyXG4gICAgaW5pdCgpXHJcbiAgICByZXR1cm5cclxuICB9XHJcblxyXG4gIGlmIChydW5uaW5nKSB7XHJcbiAgICByYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0ICgpIHtcclxuICBzY29yZSA9IDBcclxuXHJcbiAgLy8gcGFpbnRcclxuICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJylcclxuICBwYWRkbGUueCA9IGNhbnZhcy53aWR0aCAvIDIgLSBwYWRkbGUud1xyXG4gIHBhZGRsZS55ID0gY2FudmFzLmhlaWdodCAtIHBhZGRsZS5oIC0gMzBcclxuICBiYWxsID0gbmV3IEJhbGwoe1xyXG4gICAgeDogcGFkZGxlLnggKyBwYWRkbGUudyAvIDIsXHJcbiAgICB5OiBwYWRkbGUueSAtIHBhZGRsZS5oIC8gMiAtIDUsXHJcbiAgICByOiAxMFxyXG4gIH0pXHJcblxyXG4gIC8vIGluaXQgYnJpY2tzXHJcbiAgYnJpY2tzID0gW11cclxuICBtYXAuZm9yRWFjaChmdW5jdGlvbiAocG9pbnQpIHtcclxuICAgIGJyaWNrcy5wdXNoKG5ldyBSZWN0KHtcclxuICAgICAgeDogcG9pbnRbMF0sXHJcbiAgICAgIHk6IHBvaW50WzFdXHJcbiAgICB9KSlcclxuICB9KVxyXG59XHJcblxyXG4oKCkgPT4ge1xyXG4gIGluaXQoKVxyXG4gIGRyYXcoKVxyXG4gIC8vIG1vdXNlIGNvbnRyb2wgcGFkZGxlIGxvY2F0aW9uXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBwYWRkbGUueCA9IGUuY2xpZW50WCAtIHBhZGRsZS53IC8gMlxyXG4gIH0pXHJcblxyXG4gIC8vIHN0YXJ0IGdhbWVcclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCFydW5uaW5nKSB7XHJcbiAgICAgIGluaXQoKVxyXG4gICAgICByYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpXHJcbiAgICAgIHJ1bm5pbmcgPSB0cnVlXHJcbiAgICB9XHJcbiAgfSlcclxufSkoKVxyXG4iLCJleHBvcnQgY29uc3QgbWFwID0gW1xyXG4gIFsxMCwgMzBdLFxyXG4gIFs2MCwgMzBdLFxyXG4gIFsxMTAsIDMwXSxcclxuICBbMTYwLCAzMF0sXHJcbiAgWzIxMCwgMzBdLFxyXG4gIFsyNjAsIDMwXSxcclxuICBbMzEwLCAzMF0sXHJcbiAgWzM2MCwgMzBdLFxyXG4gIFs0MTAsIDMwXSxcclxuICBbNDYwLCAzMF0sXHJcbiAgWzUxMCwgMzBdLFxyXG4gIFs1NjAsIDMwXSxcclxuICBbMTAsIDYwXSxcclxuICBbNjAsIDYwXSxcclxuICBbMTEwLCA2MF0sXHJcbiAgWzE2MCwgNjBdLFxyXG4gIFsyMTAsIDYwXSxcclxuICBbMjYwLCA2MF0sXHJcbiAgWzMxMCwgNjBdLFxyXG4gIFszNjAsIDYwXSxcclxuICBbNDEwLCA2MF0sXHJcbiAgWzQ2MCwgNjBdLFxyXG4gIFs1MTAsIDYwXSxcclxuICBbNTYwLCA2MF0sXHJcbiAgWzEwLCA5MF0sXHJcbiAgWzYwLCA5MF0sXHJcbiAgWzExMCwgOTBdLFxyXG4gIFsxNjAsIDkwXSxcclxuICBbMjEwLCA5MF0sXHJcbiAgWzI2MCwgOTBdLFxyXG4gIFszMTAsIDkwXSxcclxuICBbMzYwLCA5MF0sXHJcbiAgWzQxMCwgOTBdLFxyXG4gIFs0NjAsIDkwXSxcclxuICBbNTEwLCA5MF0sXHJcbiAgWzU2MCwgOTBdLFxyXG4gIFsxMCwgMTIwXSxcclxuICBbNjAsIDEyMF0sXHJcbiAgWzExMCwgMTIwXSxcclxuICBbMTYwLCAxMjBdLFxyXG4gIFsyMTAsIDEyMF0sXHJcbiAgWzI2MCwgMTIwXSxcclxuICBbMzEwLCAxMjBdLFxyXG4gIFszNjAsIDEyMF0sXHJcbiAgWzQxMCwgMTIwXSxcclxuICBbNDYwLCAxMjBdLFxyXG4gIFs1MTAsIDEyMF0sXHJcbiAgWzU2MCwgMTIwXVxyXG5dXHJcbiIsImNsYXNzIEdhbWVPYmplY3Qge1xyXG4gIGNvbnN0cnVjdG9yICh7IHgsIHkgfSA9IHt9KSB7XHJcbiAgICB0aGlzLnggPSB4IHx8IDBcclxuICAgIHRoaXMueSA9IHkgfHwgMFxyXG4gICAgdGhpcy5jb2xvciA9ICdibHVlJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJhbGwgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAob3B0aW9ucyA9IHt9KSB7XHJcbiAgICBzdXBlcihvcHRpb25zKVxyXG4gICAgdGhpcy52eCA9IDVcclxuICAgIHRoaXMudnkgPSAtMlxyXG4gICAgdGhpcy5yID0gb3B0aW9ucy5yXHJcbiAgICB0aGlzLmNvbG9yID0gJ2JsdWUnXHJcbiAgfVxyXG5cclxuICBkcmF3IChjYW52YXMpIHtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnIsIDAsIE1hdGguUEkgKiAyLCB0cnVlKVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpXHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvclxyXG4gICAgY3R4LmZpbGwoKVxyXG4gICAgLy8g5aaC5p6c5LiL5LiA5YCLZnJhbWXotoXlh7p5XHJcbiAgICBpZiAodGhpcy55ICsgdGhpcy52eSA+IGNhbnZhcy5oZWlnaHQgLSB0aGlzLnIgfHwgdGhpcy55ICsgdGhpcy52eSA8IHRoaXMucikge1xyXG4gICAgICB0aGlzLnZ5ID0gLXRoaXMudnlcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnggKyB0aGlzLnZ4ID4gY2FudmFzLndpZHRoIC0gdGhpcy5yIHx8IHRoaXMueCArIHRoaXMudnggPCB0aGlzLnIpIHtcclxuICAgICAgdGhpcy52eCA9IC10aGlzLnZ4XHJcbiAgICB9XHJcbiAgICB0aGlzLnggKz0gdGhpcy52eFxyXG4gICAgdGhpcy55ICs9IHRoaXMudnlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBSZWN0IGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcclxuICAgIHN1cGVyKG9wdGlvbnMpXHJcbiAgICB0aGlzLncgPSA0MFxyXG4gICAgdGhpcy5oID0gMTVcclxuICAgIHRoaXMuY29sb3IgPSAncmdiKDIwMCwwLDApJ1xyXG4gIH1cclxuXHJcbiAgZHJhdyAoY2FudmFzKSB7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yXHJcbiAgICBjdHguZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMudywgdGhpcy5oKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IENvbGxpc2lvbkRldGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICB0aGlzLmNvbGxpZGluZ1JlY29yZCA9IFtdXHJcbiAgdGhpcy5jb2xsaWRpbmdEZWxheSA9IDEwMDAgLy8gbXNcclxuICB0aGlzLkNpcmNsZVJlY3RDb2xsaWRpbmcgPSBmdW5jdGlvbiAoY2lyY2xlLCByZWN0KSB7XHJcbiAgICAvLyBkZWxheVxyXG4gICAgaWYgKHRoaXMuY29sbGlkaW5nUmVjb3JkW2NpcmNsZV0gJiZcclxuICAgICAgdGhpcy5jb2xsaWRpbmdSZWNvcmRbY2lyY2xlXS53aXRoID09PSByZWN0ICYmXHJcbiAgICAgIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgPCB0aGlzLmNvbGxpZGluZ1JlY29yZFtjaXJjbGVdLnRpbWUuZ2V0VGltZSgpICsgdGhpcy5jb2xsaWRpbmdEZWxheSkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICAgIHZhciBkaXN0WCA9IE1hdGguYWJzKGNpcmNsZS54IC0gcmVjdC54IC0gcmVjdC53IC8gMilcclxuICAgIHZhciBkaXN0WSA9IE1hdGguYWJzKGNpcmNsZS55IC0gcmVjdC55IC0gcmVjdC5oIC8gMilcclxuXHJcbiAgICBpZiAoZGlzdFggPiAocmVjdC53IC8gMiArIGNpcmNsZS5yKSkgeyByZXR1cm4gZmFsc2UgfVxyXG4gICAgaWYgKGRpc3RZID4gKHJlY3QuaCAvIDIgKyBjaXJjbGUucikpIHsgcmV0dXJuIGZhbHNlIH1cclxuXHJcbiAgICBpZiAoZGlzdFggPD0gKHJlY3QudyAvIDIpKSB7IHJldHVybiB0cnVlIH1cclxuICAgIGlmIChkaXN0WSA8PSAocmVjdC5oIC8gMikpIHsgcmV0dXJuIHRydWUgfVxyXG5cclxuICAgIHZhciBkeCA9IGRpc3RYIC0gcmVjdC53IC8gMlxyXG4gICAgdmFyIGR5ID0gZGlzdFkgLSByZWN0LmggLyAyXHJcbiAgICB2YXIgaXNDb2xsaXNpb24gPSAoZHggKiBkeCArIGR5ICogZHkgPD0gKGNpcmNsZS5yICogY2lyY2xlLnIpKVxyXG4gICAgaWYgKGlzQ29sbGlzaW9uKSB7XHJcbiAgICAgIHRoaXMuY29sbGlkaW5nUmVjb3JkW2NpcmNsZV0gPSB7XHJcbiAgICAgICAgd2l0aDogcmVjdCxcclxuICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpc0NvbGxpc2lvblxyXG4gIH1cclxufVxyXG4iXX0=
