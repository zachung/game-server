(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _Application = require('./lib/Application');

var _Application2 = _interopRequireDefault(_Application);

var _LoadingScene = require('./scenes/LoadingScene');

var _LoadingScene2 = _interopRequireDefault(_LoadingScene);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// Create a Pixi Application
var app = new _Application2.default({
  width: 256,
  height: 256,
  antialias: true,
  transparent: false,
  resolution: 1,
  autoStart: false
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.start();
app.changeScene(_LoadingScene2.default);

},{"./lib/Application":5,"./scenes/LoadingScene":16}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.E0S0 = exports.E0N0 = undefined;

var _Wall = require('../objects/Wall');

var _Wall2 = _interopRequireDefault(_Wall);

var _Grass = require('../objects/Grass');

var _Grass2 = _interopRequireDefault(_Grass);

var _Treasure = require('../objects/Treasure');

var _Treasure2 = _interopRequireDefault(_Treasure);

var _Door = require('../objects/Door');

var _Door2 = _interopRequireDefault(_Door);

var _Move = require('../objects/slots/Move');

var _Move2 = _interopRequireDefault(_Move);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var E0N0 = exports.E0N0 = {
  map: [[_Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default]],
  items: [{
    Type: _Treasure2.default,
    pos: [3, 4],
    params: [[_Move2.default, 2]]
  }, {
    Type: _Door2.default,
    pos: [1, 9],
    params: ['E0S0']
  }]
};
var E0S0 = exports.E0S0 = {
  map: [[_Wall2.default, _Grass2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Grass2.default, _Wall2.default], [_Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default, _Wall2.default]],
  items: [{
    Type: _Treasure2.default,
    pos: [3, 4],
    params: [[_Move2.default, 2]]
  }, {
    Type: _Door2.default,
    pos: [1, 0],
    params: ['E0N0']
  }]
};

},{"../objects/Door":10,"../objects/Grass":12,"../objects/Treasure":13,"../objects/Wall":14,"../objects/slots/Move":15}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var MOVE = exports.MOVE = 'move';
var SLOTPARTS_ALL = exports.SLOTPARTS_ALL = [MOVE];

// object type, static object, not collide with
var STATIC = exports.STATIC = 'static';
// collide with
var STAY = exports.STAY = 'stay';
// touch will reply
var REPLY = exports.REPLY = 'reply';

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

var _PIXI = require('./PIXI');

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

var Application = function (_PixiApplication) {
  _inherits(Application, _PixiApplication);

  function Application() {
    _classCallCheck(this, Application);

    return _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).apply(this, arguments));
  }

  _createClass(Application, [{
    key: 'changeScene',
    value: function changeScene(SceneName, params) {
      if (this.currentScene) {
        // maybe use promise for animation
        // remove gameloop?
        this.currentScene.destroy();
        this.stage.removeChild(this.currentScene);
      }

      var scene = new SceneName(params);
      this.stage.addChild(scene);
      scene.create();
      scene.on('changeScene', this.changeScene.bind(this));

      this.currentScene = scene;
    }
  }, {
    key: 'start',
    value: function start() {
      var _get2,
          _this2 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_get2 = _get(Application.prototype.__proto__ || Object.getPrototypeOf(Application.prototype), 'start', this)).call.apply(_get2, [this].concat(args));

      // create a background make stage has width & height
      var view = this.renderer.view;
      this.stage.addChild(new _PIXI.Graphics().drawRect(0, 0, view.width, view.height));

      // Start the game loop
      this.ticker.add(function (delta) {
        return _this2.gameLoop.bind(_this2)(delta);
      });
    }
  }, {
    key: 'gameLoop',
    value: function gameLoop(delta) {
      // Update the current game state:
      this.currentScene.tick(delta);
    }
  }]);

  return Application;
}(_PIXI.Application);

exports.default = Application;

},{"./PIXI":7}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global PIXI, Bump */

exports.default = new Bump(PIXI);

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global PIXI */

var Application = exports.Application = PIXI.Application;
var Container = exports.Container = PIXI.Container;
var loader = exports.loader = PIXI.loader;
var resources = exports.resources = PIXI.loader.resources;
var Sprite = exports.Sprite = PIXI.Sprite;
var Text = exports.Text = PIXI.Text;
var TextStyle = exports.TextStyle = PIXI.TextStyle;

var Graphics = exports.Graphics = PIXI.Graphics;

},{}],8:[function(require,module,exports){
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

var _PIXI = require('./PIXI');

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

  function Scene() {
    _classCallCheck(this, Scene);

    return _possibleConstructorReturn(this, (Scene.__proto__ || Object.getPrototypeOf(Scene)).apply(this, arguments));
  }

  _createClass(Scene, [{
    key: 'create',
    value: function create() {}
  }, {
    key: 'destroy',
    value: function destroy() {}
  }, {
    key: 'tick',
    value: function tick(delta) {}
  }]);

  return Scene;
}(_PIXI.Container);

exports.default = Scene;

},{"./PIXI":7}],9:[function(require,module,exports){
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

var _PIXI = require('../lib/PIXI');

var _keyboard = require('../keyboard');

var _keyboard2 = _interopRequireDefault(_keyboard);

var _constants = require('../config/constants');

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

function _getSlotParts(slots, type) {
  return slots.filter(function (slot) {
    return slot.type === type;
  });
}
function _getSlotPart(slots, type) {
  return slots.find(function (slot) {
    return slot.type === type;
  });
}

var Cat = function (_Sprite) {
  _inherits(Cat, _Sprite);

  function Cat() {
    _classCallCheck(this, Cat);

    // Change the sprite's position
    var _this = _possibleConstructorReturn(this, (Cat.__proto__ || Object.getPrototypeOf(Cat)).call(this, _PIXI.resources['images/town_tiles.json'].textures['wall.png']));
    // Create the cat sprite


    _this.dx = 0;
    _this.dy = 0;

    _this.init();
    _this.slots = [];
    return _this;
  }

  _createClass(Cat, [{
    key: 'addSlotPart',
    value: function addSlotPart(slot) {
      switch (slot.type) {
        case _constants.MOVE:
          var moveSlot = _getSlotPart(this.slots, _constants.MOVE);
          if (moveSlot) {
            if (moveSlot.value > slot.value) {
              return;
            }
            var inx = this.slots.indexOf(moveSlot);
            this.slots[inx] = slot;
          } else {
            this.slots.push(slot);
          }
          return;
      }
      this.slots.push(slot);
    }
  }, {
    key: 'move',
    value: function move(delta) {
      var moveSlot = _getSlotPart(this.slots, _constants.MOVE);
      if (!moveSlot) {
        return;
      }

      this.x += this.dx * moveSlot.value * delta;
      this.y += this.dy * moveSlot.value * delta;
    }
  }, {
    key: 'take',
    value: function take(inventories) {
      var _this2 = this;

      inventories.forEach(function (slot) {
        return _this2.addSlotPart(slot);
      });
    }
  }, {
    key: 'operate',
    value: function operate(other) {
      other.operate(this);
    }
  }, {
    key: 'init',
    value: function init() {
      var _this3 = this;

      // Capture the keyboard arrow keys
      var left = (0, _keyboard2.default)(65);
      var up = (0, _keyboard2.default)(87);
      var right = (0, _keyboard2.default)(68);
      var down = (0, _keyboard2.default)(83);

      // Left
      left.press = function () {
        _this3.dx = -1;
        _this3.dy = 0;
      };
      left.release = function () {
        if (!right.isDown && _this3.dy === 0) {
          _this3.dx = 0;
        }
      };

      // Up
      up.press = function () {
        _this3.dy = -1;
        _this3.dx = 0;
      };
      up.release = function () {
        if (!down.isDown && _this3.dx === 0) {
          _this3.dy = 0;
        }
      };

      // Right
      right.press = function () {
        _this3.dx = 1;
        _this3.dy = 0;
      };
      right.release = function () {
        if (!left.isDown && _this3.dy === 0) {
          _this3.dx = 0;
        }
      };

      // Down
      down.press = function () {
        _this3.dy = 1;
        _this3.dx = 0;
      };
      down.release = function () {
        if (!up.isDown && _this3.dx === 0) {
          _this3.dy = 0;
        }
      };
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      this.move(delta);
    }
  }]);

  return Cat;
}(_PIXI.Sprite);

exports.default = Cat;

},{"../config/constants":3,"../keyboard":4,"../lib/PIXI":7}],10:[function(require,module,exports){
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

var _PIXI = require('../lib/PIXI');

var _GameObject2 = require('./GameObject');

var _GameObject3 = _interopRequireDefault(_GameObject2);

var _constants = require('../config/constants');

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

var Door = function (_GameObject) {
  _inherits(Door, _GameObject);

  function Door(map) {
    _classCallCheck(this, Door);

    var _this = _possibleConstructorReturn(this, (Door.__proto__ || Object.getPrototypeOf(Door)).call(this, _PIXI.resources['images/town_tiles.json'].textures['door.png']));
    // Create the cat sprite


    _this.map = map[0];

    _this.on('collide', _this.actionWith.bind(_this));
    return _this;
  }

  _createClass(Door, [{
    key: 'actionWith',
    value: function actionWith(other) {
      var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'operate';

      if (typeof other[action] === 'function') {
        other[action](this);
      }
    }
  }, {
    key: 'operate',
    value: function operate(other) {
      this.emit('use', this);
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.REPLY;
    }
  }]);

  return Door;
}(_GameObject3.default);

exports.default = Door;

},{"../config/constants":3,"../lib/PIXI":7,"./GameObject":11}],11:[function(require,module,exports){
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

var _PIXI = require('../lib/PIXI');

var _constants = require('../config/constants');

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

var GameObject = function (_Sprite) {
  _inherits(GameObject, _Sprite);

  function GameObject() {
    _classCallCheck(this, GameObject);

    return _possibleConstructorReturn(this, (GameObject.__proto__ || Object.getPrototypeOf(GameObject)).apply(this, arguments));
  }

  _createClass(GameObject, [{
    key: 'type',
    get: function get() {
      return _constants.STATIC;
    }
  }]);

  return GameObject;
}(_PIXI.Sprite);

exports.default = GameObject;

},{"../config/constants":3,"../lib/PIXI":7}],12:[function(require,module,exports){
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

var _PIXI = require('../lib/PIXI');

var _GameObject2 = require('./GameObject');

var _GameObject3 = _interopRequireDefault(_GameObject2);

var _constants = require('../config/constants');

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

var Grass = function (_GameObject) {
  _inherits(Grass, _GameObject);

  function Grass(treasures) {
    _classCallCheck(this, Grass);

    // Create the cat sprite
    return _possibleConstructorReturn(this, (Grass.__proto__ || Object.getPrototypeOf(Grass)).call(this, _PIXI.resources['images/town_tiles.json'].textures['grass.png']));
  }

  _createClass(Grass, [{
    key: 'type',
    get: function get() {
      return _constants.STATIC;
    }
  }]);

  return Grass;
}(_GameObject3.default);

exports.default = Grass;

},{"../config/constants":3,"../lib/PIXI":7,"./GameObject":11}],13:[function(require,module,exports){
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

var _PIXI = require('../lib/PIXI');

var _GameObject2 = require('./GameObject');

var _GameObject3 = _interopRequireDefault(_GameObject2);

var _constants = require('../config/constants');

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

var Treasure = function (_GameObject) {
  _inherits(Treasure, _GameObject);

  function Treasure() {
    var inventories = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, Treasure);

    var _this = _possibleConstructorReturn(this, (Treasure.__proto__ || Object.getPrototypeOf(Treasure)).call(this, _PIXI.resources['images/town_tiles.json'].textures['treasure.png']));
    // Create the cat sprite


    _this.inventories = inventories.map(function (conf) {
      return new conf[0](conf[1]);
    });

    _this.on('collide', _this.actionWith.bind(_this));
    return _this;
  }

  _createClass(Treasure, [{
    key: 'toString',
    value: function toString() {
      return ['treasure: [', this.inventories.map(function (inventory) {
        return [inventory.type, ': ', inventory.value].join('');
      }).join(', '), ']'].join('');
    }
  }, {
    key: 'actionWith',
    value: function actionWith(other) {
      var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'take';

      if (typeof other[action] === 'function') {
        other[action](this.inventories);
        this.emit(action);
      }
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.REPLY;
    }
  }]);

  return Treasure;
}(_GameObject3.default);

exports.default = Treasure;

},{"../config/constants":3,"../lib/PIXI":7,"./GameObject":11}],14:[function(require,module,exports){
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

var _PIXI = require('../lib/PIXI');

var _GameObject2 = require('./GameObject');

var _GameObject3 = _interopRequireDefault(_GameObject2);

var _constants = require('../config/constants');

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

var Wall = function (_GameObject) {
  _inherits(Wall, _GameObject);

  function Wall(treasures) {
    _classCallCheck(this, Wall);

    // Create the cat sprite
    return _possibleConstructorReturn(this, (Wall.__proto__ || Object.getPrototypeOf(Wall)).call(this, _PIXI.resources['images/town_tiles.json'].textures['wall.png']));
  }

  _createClass(Wall, [{
    key: 'type',
    get: function get() {
      return _constants.STAY;
    }
  }]);

  return Wall;
}(_GameObject3.default);

exports.default = Wall;

},{"../config/constants":3,"../lib/PIXI":7,"./GameObject":11}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../../config/constants');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Move = function Move(value) {
  _classCallCheck(this, Move);

  this.type = _constants.MOVE;
  this.value = value;
};

exports.default = Move;

},{"../../config/constants":3}],16:[function(require,module,exports){
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

var _PIXI = require('../lib/PIXI');

var _Scene2 = require('../lib/Scene');

var _Scene3 = _interopRequireDefault(_Scene2);

var _PlayScene = require('./PlayScene');

var _PlayScene2 = _interopRequireDefault(_PlayScene);

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

var LoadingScene = function (_Scene) {
  _inherits(LoadingScene, _Scene);

  function LoadingScene() {
    _classCallCheck(this, LoadingScene);

    var _this = _possibleConstructorReturn(this, (LoadingScene.__proto__ || Object.getPrototypeOf(LoadingScene)).call(this));

    _this.life = 0;
    return _this;
  }

  _createClass(LoadingScene, [{
    key: 'create',
    value: function create() {
      var _this2 = this;

      var style = new _PIXI.TextStyle({
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
      this.textLoading = new _PIXI.Text(text, style);

      // Add the cat to the stage
      this.addChild(this.textLoading);

      // load an image and run the `setup` function when it's done
      _PIXI.loader.add('images/cat.png').add('images/town_tiles.json').add('images/下載.jpeg').add('images/142441.jpeg').add('images/2ea4c902-23fd-4e89-b072-c50ad931ab8b.jpg').load(function () {
        return _this2.emit('changeScene', _PlayScene2.default, {
          map: 'E0S0'
        });
      });
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      this.life += delta / 30; // blend speed
      this.textLoading.text = text + Array(Math.floor(this.life) % 4 + 1).join('.');
    }
  }]);

  return LoadingScene;
}(_Scene3.default);

exports.default = LoadingScene;

},{"../lib/PIXI":7,"../lib/Scene":8,"./PlayScene":17}],17:[function(require,module,exports){
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

var _PIXI = require('../lib/PIXI');

var _constants = require('../config/constants');

var _Scene2 = require('../lib/Scene');

var _Scene3 = _interopRequireDefault(_Scene2);

var _Bump = require('../lib/Bump');

var _Bump2 = _interopRequireDefault(_Bump);

var _Map = require('../config/Map');

var Map = _interopRequireWildcard(_Map);

var _Cat = require('../objects/Cat');

var _Cat2 = _interopRequireDefault(_Cat);

var _Move = require('../objects/slots/Move');

var _Move2 = _interopRequireDefault(_Move);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

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

// TODO: one map one file
// TODO: after switch map update position of player


var CEIL_SIZE = 16;

var PlayScene = function (_Scene) {
  _inherits(PlayScene, _Scene);

  function PlayScene(_ref) {
    var map = _ref.map,
        player = _ref.player;

    _classCallCheck(this, PlayScene);

    var _this = _possibleConstructorReturn(this, (PlayScene.__proto__ || Object.getPrototypeOf(PlayScene)).call(this));

    _this.map = map;
    _this.cat = player;
    return _this;
  }

  _createClass(PlayScene, [{
    key: 'create',
    value: function create() {
      // init view size
      var sideLength = Math.min(this.parent.width, this.parent.height);
      var scale = sideLength / CEIL_SIZE / 10;
      // this.scale.set(scale, scale)

      this.collideObjects = [];
      this.replyObjects = [];

      if (!this.cat) {
        this.cat = new _Cat2.default();
        this.cat.addSlotPart(new _Move2.default(1));
        this.cat.position.set(16, 16);
        this.cat.width = 10;
        this.cat.height = 10;
      }

      this.spawnMap();
      this.tipText();

      this.addChild(this.cat);
    }
  }, {
    key: 'spawnMap',
    value: function spawnMap() {
      var _this2 = this;

      var level = Map[this.map];
      level.map.forEach(function (row, i) {
        row.forEach(function (M, j) {
          var o = new M();
          o.position.set(j * CEIL_SIZE, i * CEIL_SIZE);
          switch (o.type) {
            case _constants.STAY:
              // 靜態物件
              _this2.collideObjects.push(o);
              break;
          }
          _this2.addChild(o);
        });
      });

      level.items.forEach(function (item) {
        var o = new item.Type(item.params);
        o.position.set(item.pos[0] * CEIL_SIZE, item.pos[1] * CEIL_SIZE);
        _this2.replyObjects.push(o);
        o.on('take', function () {
          // tip text
          _this2.text.text = o.toString();

          // destroy treasure
          _this2.removeChild(o);
          o.destroy();
          var inx = _this2.replyObjects.indexOf(o);
          _this2.replyObjects.splice(inx, 1);
        });
        o.on('use', function () {
          // tip text
          _this2.text.text = 'use door';
          _this2.emit('changeScene', PlayScene, {
            map: o.map,
            player: _this2.cat
          });
        });
        _this2.addChild(o);
      });
    }
  }, {
    key: 'tipText',
    value: function tipText() {
      var style = new _PIXI.TextStyle({
        fontSize: 12,
        fill: 'white'
      });
      this.text = new _PIXI.Text('', style);
      this.text.x = 100;

      this.addChild(this.text);
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      var _this3 = this;

      this.cat.tick(delta);

      // collide detect
      this.collideObjects.forEach(function (o) {
        if (_Bump2.default.rectangleCollision(_this3.cat, o, true)) {
          o.emit('collide', _this3.cat);
        }
      });

      this.replyObjects.forEach(function (o) {
        if (_Bump2.default.hitTestRectangle(_this3.cat, o)) {
          o.emit('collide', _this3.cat);
        }
      });
    }
  }]);

  return PlayScene;
}(_Scene3.default);

exports.default = PlayScene;

},{"../config/Map":2,"../config/constants":3,"../lib/Bump":6,"../lib/PIXI":7,"../lib/Scene":8,"../objects/Cat":9,"../objects/slots/Move":15}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbmZpZy9NYXAuanMiLCJzcmMvY29uZmlnL2NvbnN0YW50cy5qcyIsInNyYy9rZXlib2FyZC5qcyIsInNyYy9saWIvQXBwbGljYXRpb24uanMiLCJzcmMvbGliL0J1bXAuanMiLCJzcmMvbGliL1BJWEkuanMiLCJzcmMvbGliL1NjZW5lLmpzIiwic3JjL29iamVjdHMvQ2F0LmpzIiwic3JjL29iamVjdHMvRG9vci5qcyIsInNyYy9vYmplY3RzL0dhbWVPYmplY3QuanMiLCJzcmMvb2JqZWN0cy9HcmFzcy5qcyIsInNyYy9vYmplY3RzL1RyZWFzdXJlLmpzIiwic3JjL29iamVjdHMvV2FsbC5qcyIsInNyYy9vYmplY3RzL3Nsb3RzL01vdmUuanMiLCJzcmMvc2NlbmVzL0xvYWRpbmdTY2VuZS5qcyIsInNyYy9zY2VuZXMvUGxheVNjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFBLGVBQUEsUUFBQSxtQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxnQkFBQSxRQUFBLHVCQUFBLENBQUE7Ozs7Ozs7O0FBRUE7QUFDQSxJQUFJLE1BQU0sSUFBSSxjQUFKLE9BQUEsQ0FBZ0I7QUFDeEIsU0FEd0IsR0FBQTtBQUV4QixVQUZ3QixHQUFBO0FBR3hCLGFBSHdCLElBQUE7QUFJeEIsZUFKd0IsS0FBQTtBQUt4QixjQUx3QixDQUFBO0FBTXhCLGFBQVc7QUFOYSxDQUFoQixDQUFWOztBQVNBLElBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLFVBQUE7QUFDQSxJQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0EsSUFBQSxRQUFBLENBQUEsVUFBQSxHQUFBLElBQUE7QUFDQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLENBQW9CLE9BQXBCLFVBQUEsRUFBdUMsT0FBdkMsV0FBQTs7QUFFQTtBQUNBLFNBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBMEIsSUFBMUIsSUFBQTs7QUFFQSxJQUFBLEtBQUE7QUFDQSxJQUFBLFdBQUEsQ0FBZ0IsZUFBaEIsT0FBQTs7Ozs7Ozs7OztBQ3RCQSxJQUFBLFFBQUEsUUFBQSxpQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxTQUFBLFFBQUEsa0JBQUEsQ0FBQTs7OztBQUNBLElBQUEsWUFBQSxRQUFBLHFCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFFBQUEsUUFBQSxpQkFBQSxDQUFBOzs7O0FBRUEsSUFBQSxRQUFBLFFBQUEsdUJBQUEsQ0FBQTs7Ozs7Ozs7QUFFTyxJQUFNLE9BQUEsUUFBQSxJQUFBLEdBQU87QUFDbEIsT0FBSyxDQUNILENBQUMsT0FBRCxPQUFBLEVBQUksT0FBSixPQUFBLEVBQU8sT0FBUCxPQUFBLEVBQVUsT0FBVixPQUFBLEVBQWEsT0FBYixPQUFBLEVBQWdCLE9BQWhCLE9BQUEsRUFBbUIsT0FBbkIsT0FBQSxFQUFzQixPQUF0QixPQUFBLEVBQXlCLE9BQXpCLE9BQUEsRUFBNEIsT0FEekIsT0FDSCxDQURHLEVBRUgsQ0FBQyxPQUFELE9BQUEsRUFBSSxRQUFKLE9BQUEsRUFBTyxRQUFQLE9BQUEsRUFBVSxRQUFWLE9BQUEsRUFBYSxRQUFiLE9BQUEsRUFBZ0IsUUFBaEIsT0FBQSxFQUFtQixRQUFuQixPQUFBLEVBQXNCLFFBQXRCLE9BQUEsRUFBeUIsUUFBekIsT0FBQSxFQUE0QixPQUZ6QixPQUVILENBRkcsRUFHSCxDQUFDLE9BQUQsT0FBQSxFQUFJLFFBQUosT0FBQSxFQUFPLFFBQVAsT0FBQSxFQUFVLFFBQVYsT0FBQSxFQUFhLFFBQWIsT0FBQSxFQUFnQixRQUFoQixPQUFBLEVBQW1CLFFBQW5CLE9BQUEsRUFBc0IsUUFBdEIsT0FBQSxFQUF5QixRQUF6QixPQUFBLEVBQTRCLE9BSHpCLE9BR0gsQ0FIRyxFQUlILENBQUMsT0FBRCxPQUFBLEVBQUksUUFBSixPQUFBLEVBQU8sUUFBUCxPQUFBLEVBQVUsUUFBVixPQUFBLEVBQWEsUUFBYixPQUFBLEVBQWdCLFFBQWhCLE9BQUEsRUFBbUIsUUFBbkIsT0FBQSxFQUFzQixRQUF0QixPQUFBLEVBQXlCLFFBQXpCLE9BQUEsRUFBNEIsT0FKekIsT0FJSCxDQUpHLEVBS0gsQ0FBQyxPQUFELE9BQUEsRUFBSSxRQUFKLE9BQUEsRUFBTyxRQUFQLE9BQUEsRUFBVSxRQUFWLE9BQUEsRUFBYSxRQUFiLE9BQUEsRUFBZ0IsUUFBaEIsT0FBQSxFQUFtQixRQUFuQixPQUFBLEVBQXNCLFFBQXRCLE9BQUEsRUFBeUIsUUFBekIsT0FBQSxFQUE0QixPQUx6QixPQUtILENBTEcsRUFNSCxDQUFDLE9BQUQsT0FBQSxFQUFJLFFBQUosT0FBQSxFQUFPLFFBQVAsT0FBQSxFQUFVLFFBQVYsT0FBQSxFQUFhLFFBQWIsT0FBQSxFQUFnQixRQUFoQixPQUFBLEVBQW1CLFFBQW5CLE9BQUEsRUFBc0IsUUFBdEIsT0FBQSxFQUF5QixRQUF6QixPQUFBLEVBQTRCLE9BTnpCLE9BTUgsQ0FORyxFQU9ILENBQUMsT0FBRCxPQUFBLEVBQUksUUFBSixPQUFBLEVBQU8sUUFBUCxPQUFBLEVBQVUsUUFBVixPQUFBLEVBQWEsUUFBYixPQUFBLEVBQWdCLFFBQWhCLE9BQUEsRUFBbUIsUUFBbkIsT0FBQSxFQUFzQixRQUF0QixPQUFBLEVBQXlCLFFBQXpCLE9BQUEsRUFBNEIsT0FQekIsT0FPSCxDQVBHLEVBUUgsQ0FBQyxPQUFELE9BQUEsRUFBSSxRQUFKLE9BQUEsRUFBTyxRQUFQLE9BQUEsRUFBVSxRQUFWLE9BQUEsRUFBYSxRQUFiLE9BQUEsRUFBZ0IsUUFBaEIsT0FBQSxFQUFtQixRQUFuQixPQUFBLEVBQXNCLFFBQXRCLE9BQUEsRUFBeUIsUUFBekIsT0FBQSxFQUE0QixPQVJ6QixPQVFILENBUkcsRUFTSCxDQUFDLE9BQUQsT0FBQSxFQUFJLFFBQUosT0FBQSxFQUFPLFFBQVAsT0FBQSxFQUFVLFFBQVYsT0FBQSxFQUFhLFFBQWIsT0FBQSxFQUFnQixRQUFoQixPQUFBLEVBQW1CLFFBQW5CLE9BQUEsRUFBc0IsUUFBdEIsT0FBQSxFQUF5QixRQUF6QixPQUFBLEVBQTRCLE9BVHpCLE9BU0gsQ0FURyxFQVVILENBQUMsT0FBRCxPQUFBLEVBQUksUUFBSixPQUFBLEVBQU8sT0FBUCxPQUFBLEVBQVUsT0FBVixPQUFBLEVBQWEsT0FBYixPQUFBLEVBQWdCLE9BQWhCLE9BQUEsRUFBbUIsT0FBbkIsT0FBQSxFQUFzQixPQUF0QixPQUFBLEVBQXlCLE9BQXpCLE9BQUEsRUFBNEIsT0FYWixPQVdoQixDQVZHLENBRGE7QUFhbEIsU0FBTyxDQUNMO0FBQ0UsVUFBTSxXQURSLE9BQUE7QUFFRSxTQUFLLENBQUEsQ0FBQSxFQUZQLENBRU8sQ0FGUDtBQUdFLFlBQVEsQ0FDTixDQUFDLE9BQUQsT0FBQSxFQURNLENBQ04sQ0FETTtBQUhWLEdBREssRUFPRjtBQUNELFVBQU0sT0FETCxPQUFBO0FBRUQsU0FBSyxDQUFBLENBQUEsRUFGSixDQUVJLENBRko7QUFHRCxZQUFRLENBQUEsTUFBQTtBQUhQLEdBUEU7QUFiVyxDQUFiO0FBNkJBLElBQU0sT0FBQSxRQUFBLElBQUEsR0FBTztBQUNsQixPQUFLLENBQ0gsQ0FBQyxPQUFELE9BQUEsRUFBSSxRQUFKLE9BQUEsRUFBTyxPQUFQLE9BQUEsRUFBVSxPQUFWLE9BQUEsRUFBYSxPQUFiLE9BQUEsRUFBZ0IsT0FBaEIsT0FBQSxFQUFtQixPQUFuQixPQUFBLEVBQXNCLE9BQXRCLE9BQUEsRUFBeUIsT0FBekIsT0FBQSxFQUE0QixPQUR6QixPQUNILENBREcsRUFFSCxDQUFDLE9BQUQsT0FBQSxFQUFJLFFBQUosT0FBQSxFQUFPLFFBQVAsT0FBQSxFQUFVLFFBQVYsT0FBQSxFQUFhLFFBQWIsT0FBQSxFQUFnQixRQUFoQixPQUFBLEVBQW1CLFFBQW5CLE9BQUEsRUFBc0IsUUFBdEIsT0FBQSxFQUF5QixRQUF6QixPQUFBLEVBQTRCLE9BRnpCLE9BRUgsQ0FGRyxFQUdILENBQUMsT0FBRCxPQUFBLEVBQUksUUFBSixPQUFBLEVBQU8sUUFBUCxPQUFBLEVBQVUsUUFBVixPQUFBLEVBQWEsUUFBYixPQUFBLEVBQWdCLFFBQWhCLE9BQUEsRUFBbUIsUUFBbkIsT0FBQSxFQUFzQixRQUF0QixPQUFBLEVBQXlCLFFBQXpCLE9BQUEsRUFBNEIsT0FIekIsT0FHSCxDQUhHLEVBSUgsQ0FBQyxPQUFELE9BQUEsRUFBSSxRQUFKLE9BQUEsRUFBTyxRQUFQLE9BQUEsRUFBVSxRQUFWLE9BQUEsRUFBYSxRQUFiLE9BQUEsRUFBZ0IsUUFBaEIsT0FBQSxFQUFtQixRQUFuQixPQUFBLEVBQXNCLFFBQXRCLE9BQUEsRUFBeUIsUUFBekIsT0FBQSxFQUE0QixPQUp6QixPQUlILENBSkcsRUFLSCxDQUFDLE9BQUQsT0FBQSxFQUFJLFFBQUosT0FBQSxFQUFPLFFBQVAsT0FBQSxFQUFVLFFBQVYsT0FBQSxFQUFhLFFBQWIsT0FBQSxFQUFnQixRQUFoQixPQUFBLEVBQW1CLFFBQW5CLE9BQUEsRUFBc0IsUUFBdEIsT0FBQSxFQUF5QixRQUF6QixPQUFBLEVBQTRCLE9BTHpCLE9BS0gsQ0FMRyxFQU1ILENBQUMsT0FBRCxPQUFBLEVBQUksUUFBSixPQUFBLEVBQU8sUUFBUCxPQUFBLEVBQVUsUUFBVixPQUFBLEVBQWEsUUFBYixPQUFBLEVBQWdCLFFBQWhCLE9BQUEsRUFBbUIsUUFBbkIsT0FBQSxFQUFzQixRQUF0QixPQUFBLEVBQXlCLFFBQXpCLE9BQUEsRUFBNEIsT0FOekIsT0FNSCxDQU5HLEVBT0gsQ0FBQyxPQUFELE9BQUEsRUFBSSxRQUFKLE9BQUEsRUFBTyxRQUFQLE9BQUEsRUFBVSxRQUFWLE9BQUEsRUFBYSxRQUFiLE9BQUEsRUFBZ0IsUUFBaEIsT0FBQSxFQUFtQixRQUFuQixPQUFBLEVBQXNCLFFBQXRCLE9BQUEsRUFBeUIsUUFBekIsT0FBQSxFQUE0QixPQVB6QixPQU9ILENBUEcsRUFRSCxDQUFDLE9BQUQsT0FBQSxFQUFJLFFBQUosT0FBQSxFQUFPLFFBQVAsT0FBQSxFQUFVLFFBQVYsT0FBQSxFQUFhLFFBQWIsT0FBQSxFQUFnQixRQUFoQixPQUFBLEVBQW1CLFFBQW5CLE9BQUEsRUFBc0IsUUFBdEIsT0FBQSxFQUF5QixRQUF6QixPQUFBLEVBQTRCLE9BUnpCLE9BUUgsQ0FSRyxFQVNILENBQUMsT0FBRCxPQUFBLEVBQUksUUFBSixPQUFBLEVBQU8sUUFBUCxPQUFBLEVBQVUsUUFBVixPQUFBLEVBQWEsUUFBYixPQUFBLEVBQWdCLFFBQWhCLE9BQUEsRUFBbUIsUUFBbkIsT0FBQSxFQUFzQixRQUF0QixPQUFBLEVBQXlCLFFBQXpCLE9BQUEsRUFBNEIsT0FUekIsT0FTSCxDQVRHLEVBVUgsQ0FBQyxPQUFELE9BQUEsRUFBSSxPQUFKLE9BQUEsRUFBTyxPQUFQLE9BQUEsRUFBVSxPQUFWLE9BQUEsRUFBYSxPQUFiLE9BQUEsRUFBZ0IsT0FBaEIsT0FBQSxFQUFtQixPQUFuQixPQUFBLEVBQXNCLE9BQXRCLE9BQUEsRUFBeUIsT0FBekIsT0FBQSxFQUE0QixPQVhaLE9BV2hCLENBVkcsQ0FEYTtBQWFsQixTQUFPLENBQ0w7QUFDRSxVQUFNLFdBRFIsT0FBQTtBQUVFLFNBQUssQ0FBQSxDQUFBLEVBRlAsQ0FFTyxDQUZQO0FBR0UsWUFBUSxDQUNOLENBQUMsT0FBRCxPQUFBLEVBRE0sQ0FDTixDQURNO0FBSFYsR0FESyxFQU9GO0FBQ0QsVUFBTSxPQURMLE9BQUE7QUFFRCxTQUFLLENBQUEsQ0FBQSxFQUZKLENBRUksQ0FGSjtBQUdELFlBQVEsQ0FBQSxNQUFBO0FBSFAsR0FQRTtBQWJXLENBQWI7Ozs7Ozs7O0FDcENBLElBQU0sT0FBQSxRQUFBLElBQUEsR0FBTixNQUFBO0FBQ0EsSUFBTSxnQkFBQSxRQUFBLGFBQUEsR0FBZ0IsQ0FBdEIsSUFBc0IsQ0FBdEI7O0FBSVA7QUFDTyxJQUFNLFNBQUEsUUFBQSxNQUFBLEdBQU4sUUFBQTtBQUNQO0FBQ08sSUFBTSxPQUFBLFFBQUEsSUFBQSxHQUFOLE1BQUE7QUFDUDtBQUNPLElBQU0sUUFBQSxRQUFBLEtBQUEsR0FBTixPQUFBOzs7Ozs7Ozs7a0JDVlEsVUFBQSxPQUFBLEVBQVc7QUFDeEIsTUFBSSxNQUFKLEVBQUE7QUFDQSxNQUFBLElBQUEsR0FBQSxPQUFBO0FBQ0EsTUFBQSxNQUFBLEdBQUEsS0FBQTtBQUNBLE1BQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxNQUFBLEtBQUEsR0FBQSxTQUFBO0FBQ0EsTUFBQSxPQUFBLEdBQUEsU0FBQTtBQUNBO0FBQ0EsTUFBQSxXQUFBLEdBQWtCLFVBQUEsS0FBQSxFQUFTO0FBQ3pCLFFBQUksTUFBQSxPQUFBLEtBQWtCLElBQXRCLElBQUEsRUFBZ0M7QUFDOUIsVUFBSSxJQUFBLElBQUEsSUFBWSxJQUFoQixLQUFBLEVBQTJCLElBQUEsS0FBQTtBQUMzQixVQUFBLE1BQUEsR0FBQSxJQUFBO0FBQ0EsVUFBQSxJQUFBLEdBQUEsS0FBQTtBQUNEO0FBQ0QsVUFBQSxjQUFBO0FBTkYsR0FBQTs7QUFTQTtBQUNBLE1BQUEsU0FBQSxHQUFnQixVQUFBLEtBQUEsRUFBUztBQUN2QixRQUFJLE1BQUEsT0FBQSxLQUFrQixJQUF0QixJQUFBLEVBQWdDO0FBQzlCLFVBQUksSUFBQSxNQUFBLElBQWMsSUFBbEIsT0FBQSxFQUErQixJQUFBLE9BQUE7QUFDL0IsVUFBQSxNQUFBLEdBQUEsS0FBQTtBQUNBLFVBQUEsSUFBQSxHQUFBLElBQUE7QUFDRDtBQUNELFVBQUEsY0FBQTtBQU5GLEdBQUE7O0FBU0E7QUFDQSxTQUFBLGdCQUFBLENBQUEsU0FBQSxFQUNhLElBQUEsV0FBQSxDQUFBLElBQUEsQ0FEYixHQUNhLENBRGIsRUFBQSxLQUFBO0FBR0EsU0FBQSxnQkFBQSxDQUFBLE9BQUEsRUFDVyxJQUFBLFNBQUEsQ0FBQSxJQUFBLENBRFgsR0FDVyxDQURYLEVBQUEsS0FBQTtBQUdBLFNBQUEsR0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbENGLElBQUEsUUFBQSxRQUFBLFFBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxjOzs7Ozs7Ozs7OztnQ0FDUyxTLEVBQVcsTSxFQUFRO0FBQzlCLFVBQUksS0FBSixZQUFBLEVBQXVCO0FBQ3JCO0FBQ0E7QUFDQSxhQUFBLFlBQUEsQ0FBQSxPQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsV0FBQSxDQUF1QixLQUF2QixZQUFBO0FBQ0Q7O0FBRUQsVUFBSSxRQUFRLElBQUEsU0FBQSxDQUFaLE1BQVksQ0FBWjtBQUNBLFdBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBO0FBQ0EsWUFBQSxNQUFBO0FBQ0EsWUFBQSxFQUFBLENBQUEsYUFBQSxFQUF3QixLQUFBLFdBQUEsQ0FBQSxJQUFBLENBQXhCLElBQXdCLENBQXhCOztBQUVBLFdBQUEsWUFBQSxHQUFBLEtBQUE7QUFDRDs7OzRCQUVlO0FBQUEsVUFBQSxLQUFBO0FBQUEsVUFBQSxTQUFBLElBQUE7O0FBQUEsV0FBQSxJQUFBLE9BQUEsVUFBQSxNQUFBLEVBQU4sT0FBTSxNQUFBLElBQUEsQ0FBQSxFQUFBLE9BQUEsQ0FBQSxFQUFBLE9BQUEsSUFBQSxFQUFBLE1BQUEsRUFBQTtBQUFOLGFBQU0sSUFBTixJQUFNLFVBQUEsSUFBQSxDQUFOO0FBQU07O0FBQ2QsT0FBQSxRQUFBLEtBQUEsWUFBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLFlBQUEsU0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUE7O0FBRUE7QUFDQSxVQUFJLE9BQU8sS0FBQSxRQUFBLENBQVgsSUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLFFBQUEsQ0FDRSxJQUFJLE1BQUosUUFBQSxHQUFBLFFBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUE4QixLQUE5QixLQUFBLEVBQTBDLEtBRDVDLE1BQ0UsQ0FERjs7QUFJQTtBQUNBLFdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBZ0IsVUFBQSxLQUFBLEVBQUE7QUFBQSxlQUFTLE9BQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQVQsS0FBUyxDQUFUO0FBQWhCLE9BQUE7QUFDRDs7OzZCQUVTLEssRUFBTztBQUNmO0FBQ0EsV0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDRDs7OztFQWpDdUIsTUFBQSxXOztrQkFvQ1gsVzs7Ozs7Ozs7QUN0Q2Y7O2tCQUVlLElBQUEsSUFBQSxDQUFBLElBQUEsQzs7Ozs7Ozs7QUNGZjs7QUFFTyxJQUFNLGNBQUEsUUFBQSxXQUFBLEdBQWMsS0FBcEIsV0FBQTtBQUNBLElBQU0sWUFBQSxRQUFBLFNBQUEsR0FBWSxLQUFsQixTQUFBO0FBQ0EsSUFBTSxTQUFBLFFBQUEsTUFBQSxHQUFTLEtBQWYsTUFBQTtBQUNBLElBQU0sWUFBQSxRQUFBLFNBQUEsR0FBWSxLQUFBLE1BQUEsQ0FBbEIsU0FBQTtBQUNBLElBQU0sU0FBQSxRQUFBLE1BQUEsR0FBUyxLQUFmLE1BQUE7QUFDQSxJQUFNLE9BQUEsUUFBQSxJQUFBLEdBQU8sS0FBYixJQUFBO0FBQ0EsSUFBTSxZQUFBLFFBQUEsU0FBQSxHQUFZLEtBQWxCLFNBQUE7O0FBRUEsSUFBTSxXQUFBLFFBQUEsUUFBQSxHQUFXLEtBQWpCLFFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNWUCxJQUFBLFFBQUEsUUFBQSxRQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sUTs7Ozs7Ozs7Ozs7NkJBQ00sQ0FBRTs7OzhCQUVELENBQUU7Ozt5QkFFUCxLLEVBQU8sQ0FBRTs7OztFQUxHLE1BQUEsUzs7a0JBUUwsSzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1ZmLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7QUFDQSxJQUFBLFlBQUEsUUFBQSxhQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxTQUFBLGFBQUEsQ0FBQSxLQUFBLEVBQUEsSUFBQSxFQUFxQztBQUNuQyxTQUFPLE1BQUEsTUFBQSxDQUFhLFVBQUEsSUFBQSxFQUFBO0FBQUEsV0FBUSxLQUFBLElBQUEsS0FBUixJQUFBO0FBQXBCLEdBQU8sQ0FBUDtBQUNEO0FBQ0QsU0FBQSxZQUFBLENBQUEsS0FBQSxFQUFBLElBQUEsRUFBb0M7QUFDbEMsU0FBTyxNQUFBLElBQUEsQ0FBVyxVQUFBLElBQUEsRUFBQTtBQUFBLFdBQVEsS0FBQSxJQUFBLEtBQVIsSUFBQTtBQUFsQixHQUFPLENBQVA7QUFDRDs7SUFFSyxNOzs7QUFDSixXQUFBLEdBQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxHQUFBOztBQUliO0FBSmEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLElBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBRVAsTUFBQSxTQUFBLENBQUEsd0JBQUEsRUFBQSxRQUFBLENBRk8sVUFFUCxDQUZPLENBQUEsQ0FBQTtBQUNiOzs7QUFJQSxVQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0EsVUFBQSxFQUFBLEdBQUEsQ0FBQTs7QUFFQSxVQUFBLElBQUE7QUFDQSxVQUFBLEtBQUEsR0FBQSxFQUFBO0FBVGEsV0FBQSxLQUFBO0FBVWQ7Ozs7Z0NBRVksSSxFQUFNO0FBQ2pCLGNBQVEsS0FBUixJQUFBO0FBQ0UsYUFBSyxXQUFMLElBQUE7QUFDRSxjQUFJLFdBQVcsYUFBYSxLQUFiLEtBQUEsRUFBeUIsV0FBeEMsSUFBZSxDQUFmO0FBQ0EsY0FBQSxRQUFBLEVBQWM7QUFDWixnQkFBSSxTQUFBLEtBQUEsR0FBaUIsS0FBckIsS0FBQSxFQUFpQztBQUMvQjtBQUNEO0FBQ0QsZ0JBQUksTUFBTSxLQUFBLEtBQUEsQ0FBQSxPQUFBLENBQVYsUUFBVSxDQUFWO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLEdBQUEsSUFBQSxJQUFBO0FBTEYsV0FBQSxNQU1PO0FBQ0wsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0Q7QUFDRDtBQVpKO0FBY0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLElBQUE7QUFDRDs7O3lCQUVLLEssRUFBTztBQUNYLFVBQUksV0FBVyxhQUFhLEtBQWIsS0FBQSxFQUF5QixXQUF4QyxJQUFlLENBQWY7QUFDQSxVQUFJLENBQUosUUFBQSxFQUFlO0FBQ2I7QUFDRDs7QUFFRCxXQUFBLENBQUEsSUFBVSxLQUFBLEVBQUEsR0FBVSxTQUFWLEtBQUEsR0FBVixLQUFBO0FBQ0EsV0FBQSxDQUFBLElBQVUsS0FBQSxFQUFBLEdBQVUsU0FBVixLQUFBLEdBQVYsS0FBQTtBQUNEOzs7eUJBRUssVyxFQUFhO0FBQUEsVUFBQSxTQUFBLElBQUE7O0FBQ2pCLGtCQUFBLE9BQUEsQ0FBb0IsVUFBQSxJQUFBLEVBQUE7QUFBQSxlQUFRLE9BQUEsV0FBQSxDQUFSLElBQVEsQ0FBUjtBQUFwQixPQUFBO0FBQ0Q7Ozs0QkFFUSxLLEVBQU87QUFDZCxZQUFBLE9BQUEsQ0FBQSxJQUFBO0FBQ0Q7OzsyQkFFTztBQUFBLFVBQUEsU0FBQSxJQUFBOztBQUNOO0FBQ0EsVUFBSSxPQUFPLENBQUEsR0FBQSxXQUFBLE9BQUEsRUFBWCxFQUFXLENBQVg7QUFDQSxVQUFJLEtBQUssQ0FBQSxHQUFBLFdBQUEsT0FBQSxFQUFULEVBQVMsQ0FBVDtBQUNBLFVBQUksUUFBUSxDQUFBLEdBQUEsV0FBQSxPQUFBLEVBQVosRUFBWSxDQUFaO0FBQ0EsVUFBSSxPQUFPLENBQUEsR0FBQSxXQUFBLE9BQUEsRUFBWCxFQUFXLENBQVg7O0FBRUE7QUFDQSxXQUFBLEtBQUEsR0FBYSxZQUFNO0FBQ2pCLGVBQUEsRUFBQSxHQUFVLENBQVYsQ0FBQTtBQUNBLGVBQUEsRUFBQSxHQUFBLENBQUE7QUFGRixPQUFBO0FBSUEsV0FBQSxPQUFBLEdBQWUsWUFBTTtBQUNuQixZQUFJLENBQUMsTUFBRCxNQUFBLElBQWlCLE9BQUEsRUFBQSxLQUFyQixDQUFBLEVBQW9DO0FBQ2xDLGlCQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0Q7QUFISCxPQUFBOztBQU1BO0FBQ0EsU0FBQSxLQUFBLEdBQVcsWUFBTTtBQUNmLGVBQUEsRUFBQSxHQUFVLENBQVYsQ0FBQTtBQUNBLGVBQUEsRUFBQSxHQUFBLENBQUE7QUFGRixPQUFBO0FBSUEsU0FBQSxPQUFBLEdBQWEsWUFBTTtBQUNqQixZQUFJLENBQUMsS0FBRCxNQUFBLElBQWdCLE9BQUEsRUFBQSxLQUFwQixDQUFBLEVBQW1DO0FBQ2pDLGlCQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0Q7QUFISCxPQUFBOztBQU1BO0FBQ0EsWUFBQSxLQUFBLEdBQWMsWUFBTTtBQUNsQixlQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLEdBQUEsQ0FBQTtBQUZGLE9BQUE7QUFJQSxZQUFBLE9BQUEsR0FBZ0IsWUFBTTtBQUNwQixZQUFJLENBQUMsS0FBRCxNQUFBLElBQWdCLE9BQUEsRUFBQSxLQUFwQixDQUFBLEVBQW1DO0FBQ2pDLGlCQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0Q7QUFISCxPQUFBOztBQU1BO0FBQ0EsV0FBQSxLQUFBLEdBQWEsWUFBTTtBQUNqQixlQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLEdBQUEsQ0FBQTtBQUZGLE9BQUE7QUFJQSxXQUFBLE9BQUEsR0FBZSxZQUFNO0FBQ25CLFlBQUksQ0FBQyxHQUFELE1BQUEsSUFBYyxPQUFBLEVBQUEsS0FBbEIsQ0FBQSxFQUFpQztBQUMvQixpQkFBQSxFQUFBLEdBQUEsQ0FBQTtBQUNEO0FBSEgsT0FBQTtBQUtEOzs7eUJBRUssSyxFQUFPO0FBQ1gsV0FBQSxJQUFBLENBQUEsS0FBQTtBQUNEOzs7O0VBdkdlLE1BQUEsTTs7a0JBMEdILEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNySGYsSUFBQSxRQUFBLFFBQUEsYUFBQSxDQUFBOztBQUNBLElBQUEsZUFBQSxRQUFBLGNBQUEsQ0FBQTs7OztBQUVBLElBQUEsYUFBQSxRQUFBLHFCQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVNLE87OztBQUNKLFdBQUEsSUFBQSxDQUFBLEdBQUEsRUFBa0I7QUFBQSxvQkFBQSxJQUFBLEVBQUEsSUFBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsS0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFFVixNQUFBLFNBQUEsQ0FBQSx3QkFBQSxFQUFBLFFBQUEsQ0FGVSxVQUVWLENBRlUsQ0FBQSxDQUFBO0FBQ2hCOzs7QUFHQSxVQUFBLEdBQUEsR0FBVyxJQUFYLENBQVcsQ0FBWDs7QUFFQSxVQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQW1CLE1BQUEsVUFBQSxDQUFBLElBQUEsQ0FBbkIsS0FBbUIsQ0FBbkI7QUFOZ0IsV0FBQSxLQUFBO0FBT2pCOzs7OytCQUlXLEssRUFBMkI7QUFBQSxVQUFwQixTQUFvQixVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBQVgsU0FBVzs7QUFDckMsVUFBSSxPQUFPLE1BQVAsTUFBTyxDQUFQLEtBQUosVUFBQSxFQUF5QztBQUN2QyxjQUFBLE1BQUEsRUFBQSxJQUFBO0FBQ0Q7QUFDRjs7OzRCQUVRLEssRUFBTztBQUNkLFdBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBO0FBQ0Q7Ozt3QkFWVztBQUFFLGFBQU8sV0FBUCxLQUFBO0FBQWM7Ozs7RUFWWCxhQUFBLE87O2tCQXVCSixJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNUJmLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7QUFDQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVNLGE7Ozs7Ozs7Ozs7O3dCQUNRO0FBQUUsYUFBTyxXQUFQLE1BQUE7QUFBZTs7OztFQUROLE1BQUEsTTs7a0JBSVYsVTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1BmLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxROzs7QUFDSixXQUFBLEtBQUEsQ0FBQSxTQUFBLEVBQXdCO0FBQUEsb0JBQUEsSUFBQSxFQUFBLEtBQUE7O0FBQ3RCO0FBRHNCLFdBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsTUFBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFFaEIsTUFBQSxTQUFBLENBQUEsd0JBQUEsRUFBQSxRQUFBLENBRmdCLFdBRWhCLENBRmdCLENBQUEsQ0FBQTtBQUd2Qjs7Ozt3QkFFVztBQUFFLGFBQU8sV0FBUCxNQUFBO0FBQWU7Ozs7RUFOWCxhQUFBLE87O2tCQVNMLEs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNkZixJQUFBLFFBQUEsUUFBQSxhQUFBLENBQUE7O0FBQ0EsSUFBQSxlQUFBLFFBQUEsY0FBQSxDQUFBOzs7O0FBRUEsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sVzs7O0FBQ0osV0FBQSxRQUFBLEdBQStCO0FBQUEsUUFBbEIsY0FBa0IsVUFBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxHQUFKLEVBQUk7O0FBQUEsb0JBQUEsSUFBQSxFQUFBLFFBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLFNBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBRXZCLE1BQUEsU0FBQSxDQUFBLHdCQUFBLEVBQUEsUUFBQSxDQUZ1QixjQUV2QixDQUZ1QixDQUFBLENBQUE7QUFDN0I7OztBQUdBLFVBQUEsV0FBQSxHQUFtQixZQUFBLEdBQUEsQ0FBZ0IsVUFBQSxJQUFBLEVBQVE7QUFDekMsYUFBTyxJQUFJLEtBQUosQ0FBSSxDQUFKLENBQVksS0FBbkIsQ0FBbUIsQ0FBWixDQUFQO0FBREYsS0FBbUIsQ0FBbkI7O0FBSUEsVUFBQSxFQUFBLENBQUEsU0FBQSxFQUFtQixNQUFBLFVBQUEsQ0FBQSxJQUFBLENBQW5CLEtBQW1CLENBQW5CO0FBUjZCLFdBQUEsS0FBQTtBQVM5Qjs7OzsrQkFFVztBQUNWLGFBQU8sQ0FBQSxhQUFBLEVBRUwsS0FBQSxXQUFBLENBQUEsR0FBQSxDQUFxQixVQUFBLFNBQUEsRUFBYTtBQUNoQyxlQUFPLENBQUMsVUFBRCxJQUFBLEVBQUEsSUFBQSxFQUF1QixVQUF2QixLQUFBLEVBQUEsSUFBQSxDQUFQLEVBQU8sQ0FBUDtBQURGLE9BQUEsRUFBQSxJQUFBLENBRkssSUFFTCxDQUZLLEVBQUEsR0FBQSxFQUFBLElBQUEsQ0FBUCxFQUFPLENBQVA7QUFPRDs7OytCQUlXLEssRUFBd0I7QUFBQSxVQUFqQixTQUFpQixVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBQVIsTUFBUTs7QUFDbEMsVUFBSSxPQUFPLE1BQVAsTUFBTyxDQUFQLEtBQUosVUFBQSxFQUF5QztBQUN2QyxjQUFBLE1BQUEsRUFBYyxLQUFkLFdBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxNQUFBO0FBQ0Q7QUFDRjs7O3dCQVBXO0FBQUUsYUFBTyxXQUFQLEtBQUE7QUFBYzs7OztFQXRCUCxhQUFBLE87O2tCQWdDUixROzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckNmLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxPOzs7QUFDSixXQUFBLElBQUEsQ0FBQSxTQUFBLEVBQXdCO0FBQUEsb0JBQUEsSUFBQSxFQUFBLElBQUE7O0FBQ3RCO0FBRHNCLFdBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsS0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFFaEIsTUFBQSxTQUFBLENBQUEsd0JBQUEsRUFBQSxRQUFBLENBRmdCLFVBRWhCLENBRmdCLENBQUEsQ0FBQTtBQUd2Qjs7Ozt3QkFFVztBQUFFLGFBQU8sV0FBUCxJQUFBO0FBQWE7Ozs7RUFOVixhQUFBLE87O2tCQVNKLEk7Ozs7Ozs7OztBQ2RmLElBQUEsYUFBQSxRQUFBLHdCQUFBLENBQUE7Ozs7Ozs7O0lBRU0sT0FDSixTQUFBLElBQUEsQ0FBQSxLQUFBLEVBQW9CO0FBQUEsa0JBQUEsSUFBQSxFQUFBLElBQUE7O0FBQ2xCLE9BQUEsSUFBQSxHQUFZLFdBQVosSUFBQTtBQUNBLE9BQUEsS0FBQSxHQUFBLEtBQUE7OztrQkFJVyxJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDVGYsSUFBQSxRQUFBLFFBQUEsYUFBQSxDQUFBOztBQUNBLElBQUEsVUFBQSxRQUFBLGNBQUEsQ0FBQTs7OztBQUNBLElBQUEsYUFBQSxRQUFBLGFBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFJLE9BQUosU0FBQTs7SUFFTSxlOzs7QUFDSixXQUFBLFlBQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxZQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxhQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxZQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBR2IsVUFBQSxJQUFBLEdBQUEsQ0FBQTtBQUhhLFdBQUEsS0FBQTtBQUlkOzs7OzZCQUVTO0FBQUEsVUFBQSxTQUFBLElBQUE7O0FBQ1IsVUFBSSxRQUFRLElBQUksTUFBSixTQUFBLENBQWM7QUFDeEIsb0JBRHdCLE9BQUE7QUFFeEIsa0JBRndCLEVBQUE7QUFHeEIsY0FId0IsT0FBQTtBQUl4QixnQkFKd0IsU0FBQTtBQUt4Qix5QkFMd0IsQ0FBQTtBQU14QixvQkFOd0IsSUFBQTtBQU94Qix5QkFQd0IsU0FBQTtBQVF4Qix3QkFSd0IsQ0FBQTtBQVN4Qix5QkFBaUIsS0FBQSxFQUFBLEdBVE8sQ0FBQTtBQVV4Qiw0QkFBb0I7QUFWSSxPQUFkLENBQVo7QUFZQSxXQUFBLFdBQUEsR0FBbUIsSUFBSSxNQUFKLElBQUEsQ0FBQSxJQUFBLEVBQW5CLEtBQW1CLENBQW5COztBQUVBO0FBQ0EsV0FBQSxRQUFBLENBQWMsS0FBZCxXQUFBOztBQUVBO0FBQ0EsWUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLGdCQUFBLEVBQUEsR0FBQSxDQUFBLHdCQUFBLEVBQUEsR0FBQSxDQUFBLGdCQUFBLEVBQUEsR0FBQSxDQUFBLG9CQUFBLEVBQUEsR0FBQSxDQUFBLGlEQUFBLEVBQUEsSUFBQSxDQU1RLFlBQUE7QUFBQSxlQUFNLE9BQUEsSUFBQSxDQUFBLGFBQUEsRUFBeUIsWUFBekIsT0FBQSxFQUFvQztBQUM5QyxlQUFLO0FBRHlDLFNBQXBDLENBQU47QUFOUixPQUFBO0FBU0Q7Ozt5QkFFSyxLLEVBQU87QUFDWCxXQUFBLElBQUEsSUFBYSxRQURGLEVBQ1gsQ0FEVyxDQUNhO0FBQ3hCLFdBQUEsV0FBQSxDQUFBLElBQUEsR0FBd0IsT0FBTyxNQUFNLEtBQUEsS0FBQSxDQUFXLEtBQVgsSUFBQSxJQUFBLENBQUEsR0FBTixDQUFBLEVBQUEsSUFBQSxDQUEvQixHQUErQixDQUEvQjtBQUNEOzs7O0VBeEN3QixRQUFBLE87O2tCQTJDWixZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakRmLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7QUFDQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOztBQUNBLElBQUEsVUFBQSxRQUFBLGNBQUEsQ0FBQTs7OztBQUNBLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7OztBQUlBLElBQUEsT0FBQSxRQUFBLGVBQUEsQ0FBQTs7SUFBWSxNOztBQUVaLElBQUEsT0FBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFFBQUEsUUFBQSx1QkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUxBO0FBQ0E7OztBQU1BLElBQU0sWUFBTixFQUFBOztJQUVNLFk7OztBQUNKLFdBQUEsU0FBQSxDQUFBLElBQUEsRUFBOEI7QUFBQSxRQUFmLE1BQWUsS0FBZixHQUFlO0FBQUEsUUFBVixTQUFVLEtBQVYsTUFBVTs7QUFBQSxvQkFBQSxJQUFBLEVBQUEsU0FBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsVUFBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUU1QixVQUFBLEdBQUEsR0FBQSxHQUFBO0FBQ0EsVUFBQSxHQUFBLEdBQUEsTUFBQTtBQUg0QixXQUFBLEtBQUE7QUFJN0I7Ozs7NkJBQ1M7QUFDUjtBQUNBLFVBQUksYUFBYSxLQUFBLEdBQUEsQ0FBUyxLQUFBLE1BQUEsQ0FBVCxLQUFBLEVBQTRCLEtBQUEsTUFBQSxDQUE3QyxNQUFpQixDQUFqQjtBQUNBLFVBQUksUUFBUSxhQUFBLFNBQUEsR0FBWixFQUFBO0FBQ0E7O0FBRUEsV0FBQSxjQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsWUFBQSxHQUFBLEVBQUE7O0FBRUEsVUFBSSxDQUFDLEtBQUwsR0FBQSxFQUFlO0FBQ2IsYUFBQSxHQUFBLEdBQVcsSUFBSSxNQUFmLE9BQVcsRUFBWDtBQUNBLGFBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBcUIsSUFBSSxPQUFKLE9BQUEsQ0FBckIsQ0FBcUIsQ0FBckI7QUFDQSxhQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxHQUFBLENBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEdBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQTtBQUNEOztBQUVELFdBQUEsUUFBQTtBQUNBLFdBQUEsT0FBQTs7QUFFQSxXQUFBLFFBQUEsQ0FBYyxLQUFkLEdBQUE7QUFDRDs7OytCQUVXO0FBQUEsVUFBQSxTQUFBLElBQUE7O0FBQ1YsVUFBSSxRQUFRLElBQUksS0FBaEIsR0FBWSxDQUFaO0FBQ0EsWUFBQSxHQUFBLENBQUEsT0FBQSxDQUFrQixVQUFBLEdBQUEsRUFBQSxDQUFBLEVBQVk7QUFDNUIsWUFBQSxPQUFBLENBQVksVUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFVO0FBQ3BCLGNBQUksSUFBSSxJQUFSLENBQVEsRUFBUjtBQUNBLFlBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBZSxJQUFmLFNBQUEsRUFBOEIsSUFBOUIsU0FBQTtBQUNBLGtCQUFRLEVBQVIsSUFBQTtBQUNFLGlCQUFLLFdBQUwsSUFBQTtBQUNFO0FBQ0EscUJBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFKSjtBQU1BLGlCQUFBLFFBQUEsQ0FBQSxDQUFBO0FBVEYsU0FBQTtBQURGLE9BQUE7O0FBY0EsWUFBQSxLQUFBLENBQUEsT0FBQSxDQUFvQixVQUFBLElBQUEsRUFBUTtBQUMxQixZQUFJLElBQUksSUFBSSxLQUFKLElBQUEsQ0FBYyxLQUF0QixNQUFRLENBQVI7QUFDQSxVQUFBLFFBQUEsQ0FBQSxHQUFBLENBQWUsS0FBQSxHQUFBLENBQUEsQ0FBQSxJQUFmLFNBQUEsRUFBd0MsS0FBQSxHQUFBLENBQUEsQ0FBQSxJQUF4QyxTQUFBO0FBQ0EsZUFBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQWEsWUFBTTtBQUNqQjtBQUNBLGlCQUFBLElBQUEsQ0FBQSxJQUFBLEdBQWlCLEVBQWpCLFFBQWlCLEVBQWpCOztBQUVBO0FBQ0EsaUJBQUEsV0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLE9BQUE7QUFDQSxjQUFJLE1BQU0sT0FBQSxZQUFBLENBQUEsT0FBQSxDQUFWLENBQVUsQ0FBVjtBQUNBLGlCQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7QUFSRixTQUFBO0FBVUEsVUFBQSxFQUFBLENBQUEsS0FBQSxFQUFZLFlBQU07QUFDaEI7QUFDQSxpQkFBQSxJQUFBLENBQUEsSUFBQSxHQUFBLFVBQUE7QUFDQSxpQkFBQSxJQUFBLENBQUEsYUFBQSxFQUFBLFNBQUEsRUFBb0M7QUFDbEMsaUJBQUssRUFENkIsR0FBQTtBQUVsQyxvQkFBUSxPQUFLO0FBRnFCLFdBQXBDO0FBSEYsU0FBQTtBQVFBLGVBQUEsUUFBQSxDQUFBLENBQUE7QUF0QkYsT0FBQTtBQXdCRDs7OzhCQUVVO0FBQ1QsVUFBSSxRQUFRLElBQUksTUFBSixTQUFBLENBQWM7QUFDeEIsa0JBRHdCLEVBQUE7QUFFeEIsY0FBTTtBQUZrQixPQUFkLENBQVo7QUFJQSxXQUFBLElBQUEsR0FBWSxJQUFJLE1BQUosSUFBQSxDQUFBLEVBQUEsRUFBWixLQUFZLENBQVo7QUFDQSxXQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQTs7QUFFQSxXQUFBLFFBQUEsQ0FBYyxLQUFkLElBQUE7QUFDRDs7O3lCQUVLLEssRUFBTztBQUFBLFVBQUEsU0FBQSxJQUFBOztBQUNYLFdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBOztBQUVBO0FBQ0EsV0FBQSxjQUFBLENBQUEsT0FBQSxDQUE0QixVQUFBLENBQUEsRUFBSztBQUMvQixZQUFJLE9BQUEsT0FBQSxDQUFBLGtCQUFBLENBQXdCLE9BQXhCLEdBQUEsRUFBQSxDQUFBLEVBQUosSUFBSSxDQUFKLEVBQWdEO0FBQzlDLFlBQUEsSUFBQSxDQUFBLFNBQUEsRUFBa0IsT0FBbEIsR0FBQTtBQUNEO0FBSEgsT0FBQTs7QUFNQSxXQUFBLFlBQUEsQ0FBQSxPQUFBLENBQTBCLFVBQUEsQ0FBQSxFQUFLO0FBQzdCLFlBQUksT0FBQSxPQUFBLENBQUEsZ0JBQUEsQ0FBc0IsT0FBdEIsR0FBQSxFQUFKLENBQUksQ0FBSixFQUF3QztBQUN0QyxZQUFBLElBQUEsQ0FBQSxTQUFBLEVBQWtCLE9BQWxCLEdBQUE7QUFDRDtBQUhILE9BQUE7QUFLRDs7OztFQWpHcUIsUUFBQSxPOztrQkFvR1QsUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuL2xpYi9BcHBsaWNhdGlvbidcbmltcG9ydCBMb2FkaW5nU2NlbmUgZnJvbSAnLi9zY2VuZXMvTG9hZGluZ1NjZW5lJ1xuXG4vLyBDcmVhdGUgYSBQaXhpIEFwcGxpY2F0aW9uXG5sZXQgYXBwID0gbmV3IEFwcGxpY2F0aW9uKHtcbiAgd2lkdGg6IDI1NixcbiAgaGVpZ2h0OiAyNTYsXG4gIGFudGlhbGlhczogdHJ1ZSxcbiAgdHJhbnNwYXJlbnQ6IGZhbHNlLFxuICByZXNvbHV0aW9uOiAxLFxuICBhdXRvU3RhcnQ6IGZhbHNlXG59KVxuXG5hcHAucmVuZGVyZXIudmlldy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5hcHAucmVuZGVyZXIuYXV0b1Jlc2l6ZSA9IHRydWVcbmFwcC5yZW5kZXJlci5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcblxuLy8gQWRkIHRoZSBjYW52YXMgdGhhdCBQaXhpIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBmb3IgeW91IHRvIHRoZSBIVE1MIGRvY3VtZW50XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFwcC52aWV3KVxuXG5hcHAuc3RhcnQoKVxuYXBwLmNoYW5nZVNjZW5lKExvYWRpbmdTY2VuZSlcbiIsImltcG9ydCBXIGZyb20gJy4uL29iamVjdHMvV2FsbCdcbmltcG9ydCBHIGZyb20gJy4uL29iamVjdHMvR3Jhc3MnXG5pbXBvcnQgVCBmcm9tICcuLi9vYmplY3RzL1RyZWFzdXJlJ1xuaW1wb3J0IEQgZnJvbSAnLi4vb2JqZWN0cy9Eb29yJ1xuXG5pbXBvcnQgTW92ZSBmcm9tICcuLi9vYmplY3RzL3Nsb3RzL01vdmUnXG5cbmV4cG9ydCBjb25zdCBFME4wID0ge1xuICBtYXA6IFtcbiAgICBbVywgVywgVywgVywgVywgVywgVywgVywgVywgV10sXG4gICAgW1csIEcsIEcsIEcsIEcsIEcsIEcsIEcsIEcsIFddLFxuICAgIFtXLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBXXSxcbiAgICBbVywgRywgRywgRywgRywgRywgRywgRywgRywgV10sXG4gICAgW1csIEcsIEcsIEcsIEcsIEcsIEcsIEcsIEcsIFddLFxuICAgIFtXLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBXXSxcbiAgICBbVywgRywgRywgRywgRywgRywgRywgRywgRywgV10sXG4gICAgW1csIEcsIEcsIEcsIEcsIEcsIEcsIEcsIEcsIFddLFxuICAgIFtXLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBXXSxcbiAgICBbVywgRywgVywgVywgVywgVywgVywgVywgVywgV11cbiAgXSxcbiAgaXRlbXM6IFtcbiAgICB7XG4gICAgICBUeXBlOiBULFxuICAgICAgcG9zOiBbMywgNF0sXG4gICAgICBwYXJhbXM6IFtcbiAgICAgICAgW01vdmUsIDJdXG4gICAgICBdXG4gICAgfSwge1xuICAgICAgVHlwZTogRCxcbiAgICAgIHBvczogWzEsIDldLFxuICAgICAgcGFyYW1zOiBbXG4gICAgICAgICdFMFMwJ1xuICAgICAgXVxuICAgIH1cbiAgXVxufVxuZXhwb3J0IGNvbnN0IEUwUzAgPSB7XG4gIG1hcDogW1xuICAgIFtXLCBHLCBXLCBXLCBXLCBXLCBXLCBXLCBXLCBXXSxcbiAgICBbVywgRywgRywgRywgRywgRywgRywgRywgRywgV10sXG4gICAgW1csIEcsIEcsIEcsIEcsIEcsIEcsIEcsIEcsIFddLFxuICAgIFtXLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBXXSxcbiAgICBbVywgRywgRywgRywgRywgRywgRywgRywgRywgV10sXG4gICAgW1csIEcsIEcsIEcsIEcsIEcsIEcsIEcsIEcsIFddLFxuICAgIFtXLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBHLCBXXSxcbiAgICBbVywgRywgRywgRywgRywgRywgRywgRywgRywgV10sXG4gICAgW1csIEcsIEcsIEcsIEcsIEcsIEcsIEcsIEcsIFddLFxuICAgIFtXLCBXLCBXLCBXLCBXLCBXLCBXLCBXLCBXLCBXXVxuICBdLFxuICBpdGVtczogW1xuICAgIHtcbiAgICAgIFR5cGU6IFQsXG4gICAgICBwb3M6IFszLCA0XSxcbiAgICAgIHBhcmFtczogW1xuICAgICAgICBbTW92ZSwgMl1cbiAgICAgIF1cbiAgICB9LCB7XG4gICAgICBUeXBlOiBELFxuICAgICAgcG9zOiBbMSwgMF0sXG4gICAgICBwYXJhbXM6IFtcbiAgICAgICAgJ0UwTjAnXG4gICAgICBdXG4gICAgfVxuICBdXG59XG4iLCJleHBvcnQgY29uc3QgTU9WRSA9ICdtb3ZlJ1xuZXhwb3J0IGNvbnN0IFNMT1RQQVJUU19BTEwgPSBbXG4gIE1PVkVcbl1cblxuLy8gb2JqZWN0IHR5cGUsIHN0YXRpYyBvYmplY3QsIG5vdCBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFUSUMgPSAnc3RhdGljJ1xuLy8gY29sbGlkZSB3aXRoXG5leHBvcnQgY29uc3QgU1RBWSA9ICdzdGF5J1xuLy8gdG91Y2ggd2lsbCByZXBseVxuZXhwb3J0IGNvbnN0IFJFUExZID0gJ3JlcGx5J1xuIiwiZXhwb3J0IGRlZmF1bHQga2V5Q29kZSA9PiB7XG4gIGxldCBrZXkgPSB7fVxuICBrZXkuY29kZSA9IGtleUNvZGVcbiAga2V5LmlzRG93biA9IGZhbHNlXG4gIGtleS5pc1VwID0gdHJ1ZVxuICBrZXkucHJlc3MgPSB1bmRlZmluZWRcbiAga2V5LnJlbGVhc2UgPSB1bmRlZmluZWRcbiAgLy8gVGhlIGBkb3duSGFuZGxlcmBcbiAga2V5LmRvd25IYW5kbGVyID0gZXZlbnQgPT4ge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xuICAgICAgaWYgKGtleS5pc1VwICYmIGtleS5wcmVzcykga2V5LnByZXNzKClcbiAgICAgIGtleS5pc0Rvd24gPSB0cnVlXG4gICAgICBrZXkuaXNVcCA9IGZhbHNlXG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIC8vIFRoZSBgdXBIYW5kbGVyYFxuICBrZXkudXBIYW5kbGVyID0gZXZlbnQgPT4ge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xuICAgICAgaWYgKGtleS5pc0Rvd24gJiYga2V5LnJlbGVhc2UpIGtleS5yZWxlYXNlKClcbiAgICAgIGtleS5pc0Rvd24gPSBmYWxzZVxuICAgICAga2V5LmlzVXAgPSB0cnVlXG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIC8vIEF0dGFjaCBldmVudCBsaXN0ZW5lcnNcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgJ2tleWRvd24nLCBrZXkuZG93bkhhbmRsZXIuYmluZChrZXkpLCBmYWxzZVxuICApXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgICdrZXl1cCcsIGtleS51cEhhbmRsZXIuYmluZChrZXkpLCBmYWxzZVxuICApXG4gIHJldHVybiBrZXlcbn1cbiIsImltcG9ydCB7IEFwcGxpY2F0aW9uIGFzIFBpeGlBcHBsaWNhdGlvbiwgR3JhcGhpY3MgfSBmcm9tICcuL1BJWEknXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgUGl4aUFwcGxpY2F0aW9uIHtcbiAgY2hhbmdlU2NlbmUgKFNjZW5lTmFtZSwgcGFyYW1zKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFNjZW5lKSB7XG4gICAgICAvLyBtYXliZSB1c2UgcHJvbWlzZSBmb3IgYW5pbWF0aW9uXG4gICAgICAvLyByZW1vdmUgZ2FtZWxvb3A/XG4gICAgICB0aGlzLmN1cnJlbnRTY2VuZS5kZXN0cm95KClcbiAgICAgIHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQodGhpcy5jdXJyZW50U2NlbmUpXG4gICAgfVxuXG4gICAgbGV0IHNjZW5lID0gbmV3IFNjZW5lTmFtZShwYXJhbXMpXG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChzY2VuZSlcbiAgICBzY2VuZS5jcmVhdGUoKVxuICAgIHNjZW5lLm9uKCdjaGFuZ2VTY2VuZScsIHRoaXMuY2hhbmdlU2NlbmUuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuY3VycmVudFNjZW5lID0gc2NlbmVcbiAgfVxuXG4gIHN0YXJ0ICguLi5hcmdzKSB7XG4gICAgc3VwZXIuc3RhcnQoLi4uYXJncylcblxuICAgIC8vIGNyZWF0ZSBhIGJhY2tncm91bmQgbWFrZSBzdGFnZSBoYXMgd2lkdGggJiBoZWlnaHRcbiAgICBsZXQgdmlldyA9IHRoaXMucmVuZGVyZXIudmlld1xuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoXG4gICAgICBuZXcgR3JhcGhpY3MoKS5kcmF3UmVjdCgwLCAwLCB2aWV3LndpZHRoLCB2aWV3LmhlaWdodClcbiAgICApXG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgdGhpcy50aWNrZXIuYWRkKGRlbHRhID0+IHRoaXMuZ2FtZUxvb3AuYmluZCh0aGlzKShkZWx0YSkpXG4gIH1cblxuICBnYW1lTG9vcCAoZGVsdGEpIHtcbiAgICAvLyBVcGRhdGUgdGhlIGN1cnJlbnQgZ2FtZSBzdGF0ZTpcbiAgICB0aGlzLmN1cnJlbnRTY2VuZS50aWNrKGRlbHRhKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcGxpY2F0aW9uXG4iLCIvKiBnbG9iYWwgUElYSSwgQnVtcCAqL1xuXG5leHBvcnQgZGVmYXVsdCBuZXcgQnVtcChQSVhJKVxuIiwiLyogZ2xvYmFsIFBJWEkgKi9cblxuZXhwb3J0IGNvbnN0IEFwcGxpY2F0aW9uID0gUElYSS5BcHBsaWNhdGlvblxuZXhwb3J0IGNvbnN0IENvbnRhaW5lciA9IFBJWEkuQ29udGFpbmVyXG5leHBvcnQgY29uc3QgbG9hZGVyID0gUElYSS5sb2FkZXJcbmV4cG9ydCBjb25zdCByZXNvdXJjZXMgPSBQSVhJLmxvYWRlci5yZXNvdXJjZXNcbmV4cG9ydCBjb25zdCBTcHJpdGUgPSBQSVhJLlNwcml0ZVxuZXhwb3J0IGNvbnN0IFRleHQgPSBQSVhJLlRleHRcbmV4cG9ydCBjb25zdCBUZXh0U3R5bGUgPSBQSVhJLlRleHRTdHlsZVxuXG5leHBvcnQgY29uc3QgR3JhcGhpY3MgPSBQSVhJLkdyYXBoaWNzXG4iLCJpbXBvcnQgeyBDb250YWluZXIgfSBmcm9tICcuL1BJWEknXG5cbmNsYXNzIFNjZW5lIGV4dGVuZHMgQ29udGFpbmVyIHtcbiAgY3JlYXRlICgpIHt9XG5cbiAgZGVzdHJveSAoKSB7fVxuXG4gIHRpY2sgKGRlbHRhKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTY2VuZVxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzLCBTcHJpdGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBrZXlib2FyZCBmcm9tICcuLi9rZXlib2FyZCdcbmltcG9ydCB7IE1PVkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5mdW5jdGlvbiBfZ2V0U2xvdFBhcnRzIChzbG90cywgdHlwZSkge1xuICByZXR1cm4gc2xvdHMuZmlsdGVyKHNsb3QgPT4gc2xvdC50eXBlID09PSB0eXBlKVxufVxuZnVuY3Rpb24gX2dldFNsb3RQYXJ0IChzbG90cywgdHlwZSkge1xuICByZXR1cm4gc2xvdHMuZmluZChzbG90ID0+IHNsb3QudHlwZSA9PT0gdHlwZSlcbn1cblxuY2xhc3MgQ2F0IGV4dGVuZHMgU3ByaXRlIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWyd3YWxsLnBuZyddKVxuXG4gICAgLy8gQ2hhbmdlIHRoZSBzcHJpdGUncyBwb3NpdGlvblxuICAgIHRoaXMuZHggPSAwXG4gICAgdGhpcy5keSA9IDBcblxuICAgIHRoaXMuaW5pdCgpXG4gICAgdGhpcy5zbG90cyA9IFtdXG4gIH1cblxuICBhZGRTbG90UGFydCAoc2xvdCkge1xuICAgIHN3aXRjaCAoc2xvdC50eXBlKSB7XG4gICAgICBjYXNlIE1PVkU6XG4gICAgICAgIGxldCBtb3ZlU2xvdCA9IF9nZXRTbG90UGFydCh0aGlzLnNsb3RzLCBNT1ZFKVxuICAgICAgICBpZiAobW92ZVNsb3QpIHtcbiAgICAgICAgICBpZiAobW92ZVNsb3QudmFsdWUgPiBzbG90LnZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGlueCA9IHRoaXMuc2xvdHMuaW5kZXhPZihtb3ZlU2xvdClcbiAgICAgICAgICB0aGlzLnNsb3RzW2lueF0gPSBzbG90XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zbG90cy5wdXNoKHNsb3QpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuc2xvdHMucHVzaChzbG90KVxuICB9XG5cbiAgbW92ZSAoZGVsdGEpIHtcbiAgICBsZXQgbW92ZVNsb3QgPSBfZ2V0U2xvdFBhcnQodGhpcy5zbG90cywgTU9WRSlcbiAgICBpZiAoIW1vdmVTbG90KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnggKz0gdGhpcy5keCAqIG1vdmVTbG90LnZhbHVlICogZGVsdGFcbiAgICB0aGlzLnkgKz0gdGhpcy5keSAqIG1vdmVTbG90LnZhbHVlICogZGVsdGFcbiAgfVxuXG4gIHRha2UgKGludmVudG9yaWVzKSB7XG4gICAgaW52ZW50b3JpZXMuZm9yRWFjaChzbG90ID0+IHRoaXMuYWRkU2xvdFBhcnQoc2xvdCkpXG4gIH1cblxuICBvcGVyYXRlIChvdGhlcikge1xuICAgIG90aGVyLm9wZXJhdGUodGhpcylcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIC8vIENhcHR1cmUgdGhlIGtleWJvYXJkIGFycm93IGtleXNcbiAgICBsZXQgbGVmdCA9IGtleWJvYXJkKDY1KVxuICAgIGxldCB1cCA9IGtleWJvYXJkKDg3KVxuICAgIGxldCByaWdodCA9IGtleWJvYXJkKDY4KVxuICAgIGxldCBkb3duID0ga2V5Ym9hcmQoODMpXG5cbiAgICAvLyBMZWZ0XG4gICAgbGVmdC5wcmVzcyA9ICgpID0+IHtcbiAgICAgIHRoaXMuZHggPSAtMVxuICAgICAgdGhpcy5keSA9IDBcbiAgICB9XG4gICAgbGVmdC5yZWxlYXNlID0gKCkgPT4ge1xuICAgICAgaWYgKCFyaWdodC5pc0Rvd24gJiYgdGhpcy5keSA9PT0gMCkge1xuICAgICAgICB0aGlzLmR4ID0gMFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwXG4gICAgdXAucHJlc3MgPSAoKSA9PiB7XG4gICAgICB0aGlzLmR5ID0gLTFcbiAgICAgIHRoaXMuZHggPSAwXG4gICAgfVxuICAgIHVwLnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIWRvd24uaXNEb3duICYmIHRoaXMuZHggPT09IDApIHtcbiAgICAgICAgdGhpcy5keSA9IDBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSaWdodFxuICAgIHJpZ2h0LnByZXNzID0gKCkgPT4ge1xuICAgICAgdGhpcy5keCA9IDFcbiAgICAgIHRoaXMuZHkgPSAwXG4gICAgfVxuICAgIHJpZ2h0LnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIWxlZnQuaXNEb3duICYmIHRoaXMuZHkgPT09IDApIHtcbiAgICAgICAgdGhpcy5keCA9IDBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEb3duXG4gICAgZG93bi5wcmVzcyA9ICgpID0+IHtcbiAgICAgIHRoaXMuZHkgPSAxXG4gICAgICB0aGlzLmR4ID0gMFxuICAgIH1cbiAgICBkb3duLnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIXVwLmlzRG93biAmJiB0aGlzLmR4ID09PSAwKSB7XG4gICAgICAgIHRoaXMuZHkgPSAwXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICB0aGlzLm1vdmUoZGVsdGEpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2F0XG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgUkVQTFkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBEb29yIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yIChtYXApIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1snZG9vci5wbmcnXSlcblxuICAgIHRoaXMubWFwID0gbWFwWzBdXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XG5cbiAgYWN0aW9uV2l0aCAob3RoZXIsIGFjdGlvbiA9ICdvcGVyYXRlJykge1xuICAgIGlmICh0eXBlb2Ygb3RoZXJbYWN0aW9uXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb3RoZXJbYWN0aW9uXSh0aGlzKVxuICAgIH1cbiAgfVxuXG4gIG9wZXJhdGUgKG90aGVyKSB7XG4gICAgdGhpcy5lbWl0KCd1c2UnLCB0aGlzKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERvb3JcbiIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR2FtZU9iamVjdCBleHRlbmRzIFNwcml0ZSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVPYmplY3RcbiIsImltcG9ydCB7IHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBHcmFzcyBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIocmVzb3VyY2VzWydpbWFnZXMvdG93bl90aWxlcy5qc29uJ10udGV4dHVyZXNbJ2dyYXNzLnBuZyddKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3Jhc3NcbiIsImltcG9ydCB7IHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBSRVBMWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFRyZWFzdXJlIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yIChpbnZlbnRvcmllcyA9IFtdKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIocmVzb3VyY2VzWydpbWFnZXMvdG93bl90aWxlcy5qc29uJ10udGV4dHVyZXNbJ3RyZWFzdXJlLnBuZyddKVxuXG4gICAgdGhpcy5pbnZlbnRvcmllcyA9IGludmVudG9yaWVzLm1hcChjb25mID0+IHtcbiAgICAgIHJldHVybiBuZXcgY29uZlswXShjb25mWzFdKVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICd0cmVhc3VyZTogWycsXG4gICAgICB0aGlzLmludmVudG9yaWVzLm1hcChpbnZlbnRvcnkgPT4ge1xuICAgICAgICByZXR1cm4gW2ludmVudG9yeS50eXBlLCAnOiAnLCBpbnZlbnRvcnkudmFsdWVdLmpvaW4oJycpXG4gICAgICB9KS5qb2luKCcsICcpLFxuICAgICAgJ10nXG4gICAgXS5qb2luKCcnKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gUkVQTFkgfVxuXG4gIGFjdGlvbldpdGggKG90aGVyLCBhY3Rpb24gPSAndGFrZScpIHtcbiAgICBpZiAodHlwZW9mIG90aGVyW2FjdGlvbl0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG90aGVyW2FjdGlvbl0odGhpcy5pbnZlbnRvcmllcylcbiAgICAgIHRoaXMuZW1pdChhY3Rpb24pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyZWFzdXJlXG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFdhbGwgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWyd3YWxsLnBuZyddKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdhbGxcbiIsImltcG9ydCB7IE1PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBNb3ZlIHtcbiAgY29uc3RydWN0b3IgKHZhbHVlKSB7XG4gICAgdGhpcy50eXBlID0gTU9WRVxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1vdmVcbiIsImltcG9ydCB7IFRleHQsIFRleHRTdHlsZSwgbG9hZGVyIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbGliL1NjZW5lJ1xuaW1wb3J0IFBsYXlTY2VuZSBmcm9tICcuL1BsYXlTY2VuZSdcblxubGV0IHRleHQgPSAnbG9hZGluZydcblxuY2xhc3MgTG9hZGluZ1NjZW5lIGV4dGVuZHMgU2NlbmUge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgdGhpcy5saWZlID0gMFxuICB9XG5cbiAgY3JlYXRlICgpIHtcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgICBmb250U2l6ZTogMzYsXG4gICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgc3Ryb2tlOiAnI2ZmMzMwMCcsXG4gICAgICBzdHJva2VUaGlja25lc3M6IDQsXG4gICAgICBkcm9wU2hhZG93OiB0cnVlLFxuICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93Qmx1cjogNCxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZTogTWF0aC5QSSAvIDYsXG4gICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDZcbiAgICB9KVxuICAgIHRoaXMudGV4dExvYWRpbmcgPSBuZXcgVGV4dCh0ZXh0LCBzdHlsZSlcblxuICAgIC8vIEFkZCB0aGUgY2F0IHRvIHRoZSBzdGFnZVxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50ZXh0TG9hZGluZylcblxuICAgIC8vIGxvYWQgYW4gaW1hZ2UgYW5kIHJ1biB0aGUgYHNldHVwYCBmdW5jdGlvbiB3aGVuIGl0J3MgZG9uZVxuICAgIGxvYWRlclxuICAgICAgLmFkZCgnaW1hZ2VzL2NhdC5wbmcnKVxuICAgICAgLmFkZCgnaW1hZ2VzL3Rvd25fdGlsZXMuanNvbicpXG4gICAgICAuYWRkKCdpbWFnZXMv5LiL6LyJLmpwZWcnKVxuICAgICAgLmFkZCgnaW1hZ2VzLzE0MjQ0MS5qcGVnJylcbiAgICAgIC5hZGQoJ2ltYWdlcy8yZWE0YzkwMi0yM2ZkLTRlODktYjA3Mi1jNTBhZDkzMWFiOGIuanBnJylcbiAgICAgIC5sb2FkKCgpID0+IHRoaXMuZW1pdCgnY2hhbmdlU2NlbmUnLCBQbGF5U2NlbmUsIHtcbiAgICAgICAgbWFwOiAnRTBTMCdcbiAgICAgIH0pKVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICB0aGlzLmxpZmUgKz0gZGVsdGEgLyAzMCAvLyBibGVuZCBzcGVlZFxuICAgIHRoaXMudGV4dExvYWRpbmcudGV4dCA9IHRleHQgKyBBcnJheShNYXRoLmZsb29yKHRoaXMubGlmZSkgJSA0ICsgMSkuam9pbignLicpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9hZGluZ1NjZW5lXG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2xpYi9TY2VuZSdcbmltcG9ydCBidW1wIGZyb20gJy4uL2xpYi9CdW1wJ1xuXG4vLyBUT0RPOiBvbmUgbWFwIG9uZSBmaWxlXG4vLyBUT0RPOiBhZnRlciBzd2l0Y2ggbWFwIHVwZGF0ZSBwb3NpdGlvbiBvZiBwbGF5ZXJcbmltcG9ydCAqIGFzIE1hcCBmcm9tICcuLi9jb25maWcvTWFwJ1xuXG5pbXBvcnQgQ2F0IGZyb20gJy4uL29iamVjdHMvQ2F0J1xuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9zbG90cy9Nb3ZlJ1xuXG5jb25zdCBDRUlMX1NJWkUgPSAxNlxuXG5jbGFzcyBQbGF5U2NlbmUgZXh0ZW5kcyBTY2VuZSB7XG4gIGNvbnN0cnVjdG9yICh7IG1hcCwgcGxheWVyIH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5tYXAgPSBtYXBcbiAgICB0aGlzLmNhdCA9IHBsYXllclxuICB9XG4gIGNyZWF0ZSAoKSB7XG4gICAgLy8gaW5pdCB2aWV3IHNpemVcbiAgICBsZXQgc2lkZUxlbmd0aCA9IE1hdGgubWluKHRoaXMucGFyZW50LndpZHRoLCB0aGlzLnBhcmVudC5oZWlnaHQpXG4gICAgbGV0IHNjYWxlID0gc2lkZUxlbmd0aCAvIENFSUxfU0laRSAvIDEwXG4gICAgLy8gdGhpcy5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlKVxuXG4gICAgdGhpcy5jb2xsaWRlT2JqZWN0cyA9IFtdXG4gICAgdGhpcy5yZXBseU9iamVjdHMgPSBbXVxuXG4gICAgaWYgKCF0aGlzLmNhdCkge1xuICAgICAgdGhpcy5jYXQgPSBuZXcgQ2F0KClcbiAgICAgIHRoaXMuY2F0LmFkZFNsb3RQYXJ0KG5ldyBNb3ZlKDEpKVxuICAgICAgdGhpcy5jYXQucG9zaXRpb24uc2V0KDE2LCAxNilcbiAgICAgIHRoaXMuY2F0LndpZHRoID0gMTBcbiAgICAgIHRoaXMuY2F0LmhlaWdodCA9IDEwXG4gICAgfVxuXG4gICAgdGhpcy5zcGF3bk1hcCgpXG4gICAgdGhpcy50aXBUZXh0KClcblxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5jYXQpXG4gIH1cblxuICBzcGF3bk1hcCAoKSB7XG4gICAgbGV0IGxldmVsID0gTWFwW3RoaXMubWFwXVxuICAgIGxldmVsLm1hcC5mb3JFYWNoKChyb3csIGkpID0+IHtcbiAgICAgIHJvdy5mb3JFYWNoKChNLCBqKSA9PiB7XG4gICAgICAgIGxldCBvID0gbmV3IE0oKVxuICAgICAgICBvLnBvc2l0aW9uLnNldChqICogQ0VJTF9TSVpFLCBpICogQ0VJTF9TSVpFKVxuICAgICAgICBzd2l0Y2ggKG8udHlwZSkge1xuICAgICAgICAgIGNhc2UgU1RBWTpcbiAgICAgICAgICAgIC8vIOmdnOaFi+eJqeS7tlxuICAgICAgICAgICAgdGhpcy5jb2xsaWRlT2JqZWN0cy5wdXNoKG8pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQobylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGxldmVsLml0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBsZXQgbyA9IG5ldyBpdGVtLlR5cGUoaXRlbS5wYXJhbXMpXG4gICAgICBvLnBvc2l0aW9uLnNldChpdGVtLnBvc1swXSAqIENFSUxfU0laRSwgaXRlbS5wb3NbMV0gKiBDRUlMX1NJWkUpXG4gICAgICB0aGlzLnJlcGx5T2JqZWN0cy5wdXNoKG8pXG4gICAgICBvLm9uKCd0YWtlJywgKCkgPT4ge1xuICAgICAgICAvLyB0aXAgdGV4dFxuICAgICAgICB0aGlzLnRleHQudGV4dCA9IG8udG9TdHJpbmcoKVxuXG4gICAgICAgIC8vIGRlc3Ryb3kgdHJlYXN1cmVcbiAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChvKVxuICAgICAgICBvLmRlc3Ryb3koKVxuICAgICAgICBsZXQgaW54ID0gdGhpcy5yZXBseU9iamVjdHMuaW5kZXhPZihvKVxuICAgICAgICB0aGlzLnJlcGx5T2JqZWN0cy5zcGxpY2UoaW54LCAxKVxuICAgICAgfSlcbiAgICAgIG8ub24oJ3VzZScsICgpID0+IHtcbiAgICAgICAgLy8gdGlwIHRleHRcbiAgICAgICAgdGhpcy50ZXh0LnRleHQgPSAndXNlIGRvb3InXG4gICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlU2NlbmUnLCBQbGF5U2NlbmUsIHtcbiAgICAgICAgICBtYXA6IG8ubWFwLFxuICAgICAgICAgIHBsYXllcjogdGhpcy5jYXRcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICB0aGlzLmFkZENoaWxkKG8pXG4gICAgfSlcbiAgfVxuXG4gIHRpcFRleHQgKCkge1xuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgZmlsbDogJ3doaXRlJ1xuICAgIH0pXG4gICAgdGhpcy50ZXh0ID0gbmV3IFRleHQoJycsIHN0eWxlKVxuICAgIHRoaXMudGV4dC54ID0gMTAwXG5cbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGV4dClcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgdGhpcy5jYXQudGljayhkZWx0YSlcblxuICAgIC8vIGNvbGxpZGUgZGV0ZWN0XG4gICAgdGhpcy5jb2xsaWRlT2JqZWN0cy5mb3JFYWNoKG8gPT4ge1xuICAgICAgaWYgKGJ1bXAucmVjdGFuZ2xlQ29sbGlzaW9uKHRoaXMuY2F0LCBvLCB0cnVlKSkge1xuICAgICAgICBvLmVtaXQoJ2NvbGxpZGUnLCB0aGlzLmNhdClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5yZXBseU9iamVjdHMuZm9yRWFjaChvID0+IHtcbiAgICAgIGlmIChidW1wLmhpdFRlc3RSZWN0YW5nbGUodGhpcy5jYXQsIG8pKSB7XG4gICAgICAgIG8uZW1pdCgnY29sbGlkZScsIHRoaXMuY2F0KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheVNjZW5lXG4iXX0=
