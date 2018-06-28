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

var _pixi = require('./pixi');

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

var Scene = function (_Container) {
  _inherits(Scene, _Container);

  function Scene(app) {
    _classCallCheck(this, Scene);

    var _this = _possibleConstructorReturn(this, (Scene.__proto__ || Object.getPrototypeOf(Scene)).call(this));

    _this.app = app;
    return _this;
  }

  _createClass(Scene, [{
    key: 'show',
    value: function show() {
      this.app.stage.addChild(this);
    }
  }, {
    key: 'dismiss',
    value: function dismiss() {
      this.app.stage.removeChild(this);
    }
  }, {
    key: 'tick',
    value: function tick(delta) {}
  }]);

  return Scene;
}(_pixi.Container);

exports.default = Scene;

},{"./pixi":5}],2:[function(require,module,exports){
'use strict';

var _pixi = require('./pixi');

var _setup = require('./setup');

var _LoadingScene = require('./scenes/LoadingScene');

var _LoadingScene2 = _interopRequireDefault(_LoadingScene);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// Create a Pixi Application
var app = new _pixi.Application({
  width: 256,
  height: 256,
  antialias: true,
  transparent: false,
  resolution: 1
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

var loadingScene = new _LoadingScene2.default(app);
loadingScene.show();

// load an image and run the `setup` function when it's done
_pixi.loader.add('images/cat.png').add('images/下載.jpeg').add('images/142441.jpeg').add('images/2ea4c902-23fd-4e89-b072-c50ad931ab8b.jpeg').on('progress', function () {
  loadingScene.tick(31);
}).load(function () {
  loadingScene.dismiss();
  (0, _setup.setup)(app);
});

},{"./pixi":5,"./scenes/LoadingScene":6,"./setup":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  // The `downHandler`
  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  // The `upHandler`
  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  // Attach event listeners
  window.addEventListener('keydown', key.downHandler.bind(key), false);
  window.addEventListener('keyup', key.upHandler.bind(key), false);
  return key;
};

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

var _pixi = require('../pixi');

var _keyboard = require('../keyboard');

var _keyboard2 = _interopRequireDefault(_keyboard);

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

var Cat = function (_Sprite) {
  _inherits(Cat, _Sprite);

  function Cat() {
    _classCallCheck(this, Cat);

    // Change the sprite's position
    var _this = _possibleConstructorReturn(this, (Cat.__proto__ || Object.getPrototypeOf(Cat)).call(this, _pixi.resources['images/cat.png'].texture));
    // Create the cat sprite


    _this.x = 96;
    _this.y = 96;
    _this.vx = 0;
    _this.vy = 0;

    _this.init();
    return _this;
  }

  _createClass(Cat, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      // Capture the keyboard arrow keys
      var left = (0, _keyboard2.default)(37);
      var up = (0, _keyboard2.default)(38);
      var right = (0, _keyboard2.default)(39);
      var down = (0, _keyboard2.default)(40);

      // Left arrow key `press` method
      left.press = function () {
        // Change the cat's velocity when the key is pressed
        _this2.vx = -5;
        _this2.vy = 0;
      };

      // Left arrow key `release` method
      left.release = function () {
        // If the left arrow has been released, and the right arrow isn't down,
        // and the cat isn't moving vertically:
        // Stop the cat
        if (!right.isDown && _this2.vy === 0) {
          _this2.vx = 0;
        }
      };

      // Up
      up.press = function () {
        _this2.vy = -5;
        _this2.vx = 0;
      };
      up.release = function () {
        if (!down.isDown && _this2.vx === 0) {
          _this2.vy = 0;
        }
      };

      // Right
      right.press = function () {
        _this2.vx = 5;
        _this2.vy = 0;
      };
      right.release = function () {
        if (!left.isDown && _this2.vy === 0) {
          _this2.vx = 0;
        }
      };

      // Down
      down.press = function () {
        _this2.vy = 5;
        _this2.vx = 0;
      };
      down.release = function () {
        if (!up.isDown && _this2.vx === 0) {
          _this2.vy = 0;
        }
      };
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      this.x += this.vx;
      this.y += this.vy;
    }
  }]);

  return Cat;
}(_pixi.Sprite);

exports.default = Cat;

},{"../keyboard":3,"../pixi":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global PIXI */

var Application = exports.Application = PIXI.Application;
var Container = exports.Container = PIXI.Container;
var loader = exports.loader = PIXI.loader;
var resources = exports.resources = loader.resources;
var Sprite = exports.Sprite = PIXI.Sprite;
var Text = exports.Text = PIXI.Text;
var TextStyle = exports.TextStyle = PIXI.TextStyle;

},{}],6:[function(require,module,exports){
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

var _pixi = require('../pixi');

var _Scene2 = require('../Scene');

var _Scene3 = _interopRequireDefault(_Scene2);

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

var text = 'loading';

var PlayScene = function (_Scene) {
  _inherits(PlayScene, _Scene);

  function PlayScene() {
    var _ref;

    _classCallCheck(this, PlayScene);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = PlayScene.__proto__ || Object.getPrototypeOf(PlayScene)).call.apply(_ref, [this].concat(args)));

    var style = new _pixi.TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 'white',
      stroke: '#ff3300',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6
    });
    _this.textLoading = new _pixi.Text(text, style);

    // Add the cat to the stage
    _this.addChild(_this.textLoading);

    _this.life = 0;
    return _this;
  }

  _createClass(PlayScene, [{
    key: 'tick',
    value: function tick(delta) {
      this.life += delta / 30; // blend speed
      this.textLoading.text = text + Array(Math.floor(this.life) % 4 + 1).join('.');
    }
  }]);

  return PlayScene;
}(_Scene3.default);

exports.default = PlayScene;

},{"../Scene":1,"../pixi":5}],7:[function(require,module,exports){
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

var _Scene2 = require('../Scene');

var _Scene3 = _interopRequireDefault(_Scene2);

var _Cat = require('../objects/Cat');

var _Cat2 = _interopRequireDefault(_Cat);

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

var PlayScene = function (_Scene) {
  _inherits(PlayScene, _Scene);

  function PlayScene() {
    var _ref;

    _classCallCheck(this, PlayScene);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = PlayScene.__proto__ || Object.getPrototypeOf(PlayScene)).call.apply(_ref, [this].concat(args)));

    _this.cat = new _Cat2.default();

    // Add the cat to the stage
    _this.addChild(_this.cat);
    return _this;
  }

  _createClass(PlayScene, [{
    key: 'tick',
    value: function tick(delta) {
      this.cat.tick(delta);
    }
  }]);

  return PlayScene;
}(_Scene3.default);

exports.default = PlayScene;

},{"../Scene":1,"../objects/Cat":4}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = setup;

var _PlayScene = require('./scenes/PlayScene');

var _PlayScene2 = _interopRequireDefault(_PlayScene);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var scene = void 0;

function setup(app) {
  var playScene = new _PlayScene2.default(app);

  playScene.show();

  // Set the game state
  scene = playScene;

  // Start the game loop
  app.ticker.add(function (delta) {
    return gameLoop(delta);
  });
}

function gameLoop(delta) {
  // Update the current game state:
  scene.tick(delta);
}

},{"./scenes/PlayScene":7}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU2NlbmUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2tleWJvYXJkLmpzIiwic3JjL29iamVjdHMvQ2F0LmpzIiwic3JjL3BpeGkuanMiLCJzcmMvc2NlbmVzL0xvYWRpbmdTY2VuZS5qcyIsInNyYy9zY2VuZXMvUGxheVNjZW5lLmpzIiwic3JjL3NldHVwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBLElBQUEsUUFBQSxRQUFBLFFBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxROzs7QUFDSixXQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQWtCO0FBQUEsb0JBQUEsSUFBQSxFQUFBLEtBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLE1BQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFaEIsVUFBQSxHQUFBLEdBQUEsR0FBQTtBQUZnQixXQUFBLEtBQUE7QUFHakI7Ozs7MkJBRU87QUFDTixXQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxDQUFBLElBQUE7QUFDRDs7OzhCQUVVO0FBQ1QsV0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBO0FBQ0Q7Ozt5QkFFSyxLLEVBQU8sQ0FBRTs7OztFQWRHLE1BQUEsUzs7a0JBaUJMLEs7Ozs7O0FDbkJmLElBQUEsUUFBQSxRQUFBLFFBQUEsQ0FBQTs7QUFDQSxJQUFBLFNBQUEsUUFBQSxTQUFBLENBQUE7O0FBQ0EsSUFBQSxnQkFBQSxRQUFBLHVCQUFBLENBQUE7Ozs7Ozs7O0FBRUE7QUFDQSxJQUFJLE1BQU0sSUFBSSxNQUFKLFdBQUEsQ0FBZ0I7QUFDeEIsU0FEd0IsR0FBQTtBQUV4QixVQUZ3QixHQUFBO0FBR3hCLGFBSHdCLElBQUE7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LFVBQUEsS0FBQSxFQUFBO0FBQUEsV0FBUyxTQUFULEtBQVMsQ0FBVDtBQUFmLEdBQUE7QUFDRDs7QUFFRCxTQUFBLFFBQUEsQ0FBQSxLQUFBLEVBQTBCO0FBQ3hCO0FBQ0EsUUFBQSxJQUFBLENBQUEsS0FBQTtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgQ29udGFpbmVyIH0gZnJvbSAnLi9waXhpJ1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yIChhcHApIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5hcHAgPSBhcHBcbiAgfVxuXG4gIHNob3cgKCkge1xuICAgIHRoaXMuYXBwLnN0YWdlLmFkZENoaWxkKHRoaXMpXG4gIH1cblxuICBkaXNtaXNzICgpIHtcbiAgICB0aGlzLmFwcC5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzKVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lXG4iLCJpbXBvcnQgeyBBcHBsaWNhdGlvbiwgbG9hZGVyIH0gZnJvbSAnLi9waXhpJ1xuaW1wb3J0IHsgc2V0dXAgfSBmcm9tICcuL3NldHVwJ1xuaW1wb3J0IExvYWRpbmdTY2VuZSBmcm9tICcuL3NjZW5lcy9Mb2FkaW5nU2NlbmUnXG5cbi8vIENyZWF0ZSBhIFBpeGkgQXBwbGljYXRpb25cbmxldCBhcHAgPSBuZXcgQXBwbGljYXRpb24oe1xuICB3aWR0aDogMjU2LFxuICBoZWlnaHQ6IDI1NixcbiAgYW50aWFsaWFzOiB0cnVlLFxuICB0cmFuc3BhcmVudDogZmFsc2UsXG4gIHJlc29sdXRpb246IDFcbn0pXG5cbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuYXBwLnJlbmRlcmVyLnZpZXcuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbmFwcC5yZW5kZXJlci5hdXRvUmVzaXplID0gdHJ1ZVxuYXBwLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXG4vLyBBZGQgdGhlIGNhbnZhcyB0aGF0IFBpeGkgYXV0b21hdGljYWxseSBjcmVhdGVkIGZvciB5b3UgdG8gdGhlIEhUTUwgZG9jdW1lbnRcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpXG5cbmxldCBsb2FkaW5nU2NlbmUgPSBuZXcgTG9hZGluZ1NjZW5lKGFwcClcbmxvYWRpbmdTY2VuZS5zaG93KClcblxuLy8gbG9hZCBhbiBpbWFnZSBhbmQgcnVuIHRoZSBgc2V0dXBgIGZ1bmN0aW9uIHdoZW4gaXQncyBkb25lXG5sb2FkZXJcbiAgLmFkZCgnaW1hZ2VzL2NhdC5wbmcnKVxuICAuYWRkKCdpbWFnZXMv5LiL6LyJLmpwZWcnKVxuICAuYWRkKCdpbWFnZXMvMTQyNDQxLmpwZWcnKVxuICAuYWRkKCdpbWFnZXMvMmVhNGM5MDItMjNmZC00ZTg5LWIwNzItYzUwYWQ5MzFhYjhiLmpwZWcnKVxuICAub24oJ3Byb2dyZXNzJywgKCkgPT4ge1xuICAgIGxvYWRpbmdTY2VuZS50aWNrKDMxKVxuICB9KVxuICAubG9hZCgoKSA9PiB7XG4gICAgbG9hZGluZ1NjZW5lLmRpc21pc3MoKVxuICAgIHNldHVwKGFwcClcbiAgfSlcbiIsImV4cG9ydCBkZWZhdWx0IGtleUNvZGUgPT4ge1xuICBsZXQga2V5ID0ge31cbiAga2V5LmNvZGUgPSBrZXlDb2RlXG4gIGtleS5pc0Rvd24gPSBmYWxzZVxuICBrZXkuaXNVcCA9IHRydWVcbiAga2V5LnByZXNzID0gdW5kZWZpbmVkXG4gIGtleS5yZWxlYXNlID0gdW5kZWZpbmVkXG4gIC8vIFRoZSBgZG93bkhhbmRsZXJgXG4gIGtleS5kb3duSGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgIGlmIChrZXkuaXNVcCAmJiBrZXkucHJlc3MpIGtleS5wcmVzcygpXG4gICAgICBrZXkuaXNEb3duID0gdHJ1ZVxuICAgICAga2V5LmlzVXAgPSBmYWxzZVxuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICAvLyBUaGUgYHVwSGFuZGxlcmBcbiAga2V5LnVwSGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgIGlmIChrZXkuaXNEb3duICYmIGtleS5yZWxlYXNlKSBrZXkucmVsZWFzZSgpXG4gICAgICBrZXkuaXNEb3duID0gZmFsc2VcbiAgICAgIGtleS5pc1VwID0gdHJ1ZVxuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICAvLyBBdHRhY2ggZXZlbnQgbGlzdGVuZXJzXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgICdrZXlkb3duJywga2V5LmRvd25IYW5kbGVyLmJpbmQoa2V5KSwgZmFsc2VcbiAgKVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAna2V5dXAnLCBrZXkudXBIYW5kbGVyLmJpbmQoa2V5KSwgZmFsc2VcbiAgKVxuICByZXR1cm4ga2V5XG59XG4iLCJpbXBvcnQgeyByZXNvdXJjZXMsIFNwcml0ZSB9IGZyb20gJy4uL3BpeGknXG5pbXBvcnQga2V5Ym9hcmQgZnJvbSAnLi4va2V5Ym9hcmQnXG5cbmNsYXNzIENhdCBleHRlbmRzIFNwcml0ZSB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy9jYXQucG5nJ10udGV4dHVyZSlcblxuICAgIC8vIENoYW5nZSB0aGUgc3ByaXRlJ3MgcG9zaXRpb25cbiAgICB0aGlzLnggPSA5NlxuICAgIHRoaXMueSA9IDk2XG4gICAgdGhpcy52eCA9IDBcbiAgICB0aGlzLnZ5ID0gMFxuXG4gICAgdGhpcy5pbml0KClcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIC8vIENhcHR1cmUgdGhlIGtleWJvYXJkIGFycm93IGtleXNcbiAgICBsZXQgbGVmdCA9IGtleWJvYXJkKDM3KVxuICAgIGxldCB1cCA9IGtleWJvYXJkKDM4KVxuICAgIGxldCByaWdodCA9IGtleWJvYXJkKDM5KVxuICAgIGxldCBkb3duID0ga2V5Ym9hcmQoNDApXG5cbiAgICAvLyBMZWZ0IGFycm93IGtleSBgcHJlc3NgIG1ldGhvZFxuICAgIGxlZnQucHJlc3MgPSAoKSA9PiB7XG4gICAgICAvLyBDaGFuZ2UgdGhlIGNhdCdzIHZlbG9jaXR5IHdoZW4gdGhlIGtleSBpcyBwcmVzc2VkXG4gICAgICB0aGlzLnZ4ID0gLTVcbiAgICAgIHRoaXMudnkgPSAwXG4gICAgfVxuXG4gICAgLy8gTGVmdCBhcnJvdyBrZXkgYHJlbGVhc2VgIG1ldGhvZFxuICAgIGxlZnQucmVsZWFzZSA9ICgpID0+IHtcbiAgICAgIC8vIElmIHRoZSBsZWZ0IGFycm93IGhhcyBiZWVuIHJlbGVhc2VkLCBhbmQgdGhlIHJpZ2h0IGFycm93IGlzbid0IGRvd24sXG4gICAgICAvLyBhbmQgdGhlIGNhdCBpc24ndCBtb3ZpbmcgdmVydGljYWxseTpcbiAgICAgIC8vIFN0b3AgdGhlIGNhdFxuICAgICAgaWYgKCFyaWdodC5pc0Rvd24gJiYgdGhpcy52eSA9PT0gMCkge1xuICAgICAgICB0aGlzLnZ4ID0gMFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwXG4gICAgdXAucHJlc3MgPSAoKSA9PiB7XG4gICAgICB0aGlzLnZ5ID0gLTVcbiAgICAgIHRoaXMudnggPSAwXG4gICAgfVxuICAgIHVwLnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIWRvd24uaXNEb3duICYmIHRoaXMudnggPT09IDApIHtcbiAgICAgICAgdGhpcy52eSA9IDBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSaWdodFxuICAgIHJpZ2h0LnByZXNzID0gKCkgPT4ge1xuICAgICAgdGhpcy52eCA9IDVcbiAgICAgIHRoaXMudnkgPSAwXG4gICAgfVxuICAgIHJpZ2h0LnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIWxlZnQuaXNEb3duICYmIHRoaXMudnkgPT09IDApIHtcbiAgICAgICAgdGhpcy52eCA9IDBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEb3duXG4gICAgZG93bi5wcmVzcyA9ICgpID0+IHtcbiAgICAgIHRoaXMudnkgPSA1XG4gICAgICB0aGlzLnZ4ID0gMFxuICAgIH1cbiAgICBkb3duLnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIXVwLmlzRG93biAmJiB0aGlzLnZ4ID09PSAwKSB7XG4gICAgICAgIHRoaXMudnkgPSAwXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICB0aGlzLnggKz0gdGhpcy52eFxuICAgIHRoaXMueSArPSB0aGlzLnZ5XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2F0XG4iLCIvKiBnbG9iYWwgUElYSSAqL1xuXG5leHBvcnQgY29uc3QgQXBwbGljYXRpb24gPSBQSVhJLkFwcGxpY2F0aW9uXG5leHBvcnQgY29uc3QgQ29udGFpbmVyID0gUElYSS5Db250YWluZXJcbmV4cG9ydCBjb25zdCBsb2FkZXIgPSBQSVhJLmxvYWRlclxuZXhwb3J0IGNvbnN0IHJlc291cmNlcyA9IGxvYWRlci5yZXNvdXJjZXNcbmV4cG9ydCBjb25zdCBTcHJpdGUgPSBQSVhJLlNwcml0ZVxuZXhwb3J0IGNvbnN0IFRleHQgPSBQSVhJLlRleHRcbmV4cG9ydCBjb25zdCBUZXh0U3R5bGUgPSBQSVhJLlRleHRTdHlsZVxuIiwiaW1wb3J0IHsgVGV4dCwgVGV4dFN0eWxlIH0gZnJvbSAnLi4vcGl4aSdcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9TY2VuZSdcblxubGV0IHRleHQgPSAnbG9hZGluZydcblxuY2xhc3MgUGxheVNjZW5lIGV4dGVuZHMgU2NlbmUge1xuICBjb25zdHJ1Y3RvciAoLi4uYXJncykge1xuICAgIHN1cGVyKC4uLmFyZ3MpXG5cbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgICBmb250U2l6ZTogMzYsXG4gICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgc3Ryb2tlOiAnI2ZmMzMwMCcsXG4gICAgICBzdHJva2VUaGlja25lc3M6IDQsXG4gICAgICBkcm9wU2hhZG93OiB0cnVlLFxuICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93Qmx1cjogNCxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZTogTWF0aC5QSSAvIDYsXG4gICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDZcbiAgICB9KVxuICAgIHRoaXMudGV4dExvYWRpbmcgPSBuZXcgVGV4dCh0ZXh0LCBzdHlsZSlcblxuICAgIC8vIEFkZCB0aGUgY2F0IHRvIHRoZSBzdGFnZVxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50ZXh0TG9hZGluZylcblxuICAgIHRoaXMubGlmZSA9IDBcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgdGhpcy5saWZlICs9IGRlbHRhIC8gMzAgLy8gYmxlbmQgc3BlZWRcbiAgICB0aGlzLnRleHRMb2FkaW5nLnRleHQgPSB0ZXh0ICsgQXJyYXkoTWF0aC5mbG9vcih0aGlzLmxpZmUpICUgNCArIDEpLmpvaW4oJy4nKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXlTY2VuZVxuIiwiaW1wb3J0IFNjZW5lIGZyb20gJy4uL1NjZW5lJ1xuXG5pbXBvcnQgQ2F0IGZyb20gJy4uL29iamVjdHMvQ2F0J1xuXG5jbGFzcyBQbGF5U2NlbmUgZXh0ZW5kcyBTY2VuZSB7XG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncylcbiAgICB0aGlzLmNhdCA9IG5ldyBDYXQoKVxuXG4gICAgLy8gQWRkIHRoZSBjYXQgdG8gdGhlIHN0YWdlXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLmNhdClcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgdGhpcy5jYXQudGljayhkZWx0YSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5U2NlbmVcbiIsImltcG9ydCBQbGF5U2NlbmUgZnJvbSAnLi9zY2VuZXMvUGxheVNjZW5lJ1xuXG5sZXQgc2NlbmVcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwIChhcHApIHtcbiAgbGV0IHBsYXlTY2VuZSA9IG5ldyBQbGF5U2NlbmUoYXBwKVxuXG4gIHBsYXlTY2VuZS5zaG93KClcblxuICAvLyBTZXQgdGhlIGdhbWUgc3RhdGVcbiAgc2NlbmUgPSBwbGF5U2NlbmVcblxuICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gIGFwcC50aWNrZXIuYWRkKGRlbHRhID0+IGdhbWVMb29wKGRlbHRhKSlcbn1cblxuZnVuY3Rpb24gZ2FtZUxvb3AgKGRlbHRhKSB7XG4gIC8vIFVwZGF0ZSB0aGUgY3VycmVudCBnYW1lIHN0YXRlOlxuICBzY2VuZS50aWNrKGRlbHRhKVxufVxuIl19
