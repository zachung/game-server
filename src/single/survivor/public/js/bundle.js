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

},{"./lib/Application":4,"./scenes/LoadingScene":16}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./PIXI":6}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global PIXI, Bump */

exports.default = new Bump(PIXI);

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./PIXI":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.instanceByItemId = instanceByItemId;
exports.instanceBySlotId = instanceBySlotId;

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

var Items = [_Grass2.default, _Wall2.default, _Treasure2.default, _Door2.default];

var Slots = [_Move2.default];

function instanceByItemId(itemId, params) {
  return new Items[itemId](params);
}

function instanceBySlotId(slotId, params) {
  return new Slots[slotId](params);
}

},{"../objects/Door":10,"../objects/Grass":12,"../objects/Treasure":13,"../objects/Wall":14,"../objects/slots/Move":15}],9:[function(require,module,exports){
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

},{"../config/constants":2,"../keyboard":3,"../lib/PIXI":6}],10:[function(require,module,exports){
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
    _this.toPosition = map[1];

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

},{"../config/constants":2,"../lib/PIXI":6,"./GameObject":11}],11:[function(require,module,exports){
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

},{"../config/constants":2,"../lib/PIXI":6}],12:[function(require,module,exports){
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

},{"../config/constants":2,"../lib/PIXI":6,"./GameObject":11}],13:[function(require,module,exports){
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

var _utils = require('../lib/utils');

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
      return (0, _utils.instanceBySlotId)(conf[0], conf[1]);
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

},{"../config/constants":2,"../lib/PIXI":6,"../lib/utils":8,"./GameObject":11}],14:[function(require,module,exports){
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

},{"../config/constants":2,"../lib/PIXI":6,"./GameObject":11}],15:[function(require,module,exports){
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

},{"../../config/constants":2}],16:[function(require,module,exports){
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
      _PIXI.loader.add('images/town_tiles.json').load(function () {
        return _this2.emit('changeScene', _PlayScene2.default, {
          map: 'E0N0',
          position: [1, 1]
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

},{"../lib/PIXI":6,"../lib/Scene":7,"./PlayScene":17}],17:[function(require,module,exports){
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

var _utils = require('../lib/utils');

var _Cat = require('../objects/Cat');

var _Cat2 = _interopRequireDefault(_Cat);

var _Move = require('../objects/slots/Move');

var _Move2 = _interopRequireDefault(_Move);

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

var CEIL_SIZE = 16;

var PlayScene = function (_Scene) {
  _inherits(PlayScene, _Scene);

  function PlayScene(_ref) {
    var map = _ref.map,
        player = _ref.player,
        position = _ref.position;

    _classCallCheck(this, PlayScene);

    var _this = _possibleConstructorReturn(this, (PlayScene.__proto__ || Object.getPrototypeOf(PlayScene)).call(this));

    _this.isLoaded = false;
    _this.cat = player;

    _this.mapFile = 'world/' + map;
    _this.toPosition = position;
    return _this;
  }

  _createClass(PlayScene, [{
    key: 'create',
    value: function create() {
      var fileName = this.mapFile;

      // if map not loaded yet
      if (!_PIXI.resources[fileName]) {
        _PIXI.loader.add(fileName, fileName + '.json').load(this.onLoaded.bind(this));
      } else {
        this.onLoaded();
      }
    }
  }, {
    key: 'onLoaded',
    value: function onLoaded() {
      // init view size
      // let sideLength = Math.min(this.parent.width, this.parent.height)
      // let scale = sideLength / CEIL_SIZE / 10
      // this.scale.set(scale, scale)

      this.map = _PIXI.resources[this.mapFile].data;

      this.collideObjects = [];
      this.replyObjects = [];

      if (!this.cat) {
        this.cat = new _Cat2.default();
        this.cat.addSlotPart(new _Move2.default(1));
        this.cat.width = 10;
        this.cat.height = 10;
      }
      this.cat.position.set(this.toPosition[0] * CEIL_SIZE, this.toPosition[1] * CEIL_SIZE);

      this.spawnMap();
      this.tipText();

      this.addChild(this.cat);

      this.isLoaded = true;
    }
  }, {
    key: 'spawnMap',
    value: function spawnMap() {
      var _this2 = this;

      var level = this.map;
      var tiles = level.tiles;
      var cols = level.cols;
      var rows = level.rows;

      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var id = tiles[j * cols + i];
          var o = (0, _utils.instanceByItemId)(id);
          o.position.set(i * CEIL_SIZE, j * CEIL_SIZE);
          switch (o.type) {
            case _constants.STAY:
              // 靜態物件
              this.collideObjects.push(o);
              break;
          }
          this.addChild(o);
        }
      }

      level.items.forEach(function (item, i) {
        var o = (0, _utils.instanceByItemId)(item.Type, item.params);
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

          // remove item from the map
          delete level.items[i];
        });
        o.on('use', function () {
          // tip text
          _this2.text.text = 'use door';
          _this2.emit('changeScene', PlayScene, {
            map: o.map,
            player: _this2.cat,
            position: o.toPosition
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

      if (!this.isLoaded) {
        return;
      }
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

},{"../config/constants":2,"../lib/Bump":5,"../lib/PIXI":6,"../lib/Scene":7,"../lib/utils":8,"../objects/Cat":9,"../objects/slots/Move":15}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbmZpZy9jb25zdGFudHMuanMiLCJzcmMva2V5Ym9hcmQuanMiLCJzcmMvbGliL0FwcGxpY2F0aW9uLmpzIiwic3JjL2xpYi9CdW1wLmpzIiwic3JjL2xpYi9QSVhJLmpzIiwic3JjL2xpYi9TY2VuZS5qcyIsInNyYy9saWIvdXRpbHMuanMiLCJzcmMvb2JqZWN0cy9DYXQuanMiLCJzcmMvb2JqZWN0cy9Eb29yLmpzIiwic3JjL29iamVjdHMvR2FtZU9iamVjdC5qcyIsInNyYy9vYmplY3RzL0dyYXNzLmpzIiwic3JjL29iamVjdHMvVHJlYXN1cmUuanMiLCJzcmMvb2JqZWN0cy9XYWxsLmpzIiwic3JjL29iamVjdHMvc2xvdHMvTW92ZS5qcyIsInNyYy9zY2VuZXMvTG9hZGluZ1NjZW5lLmpzIiwic3JjL3NjZW5lcy9QbGF5U2NlbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUEsZUFBQSxRQUFBLG1CQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGdCQUFBLFFBQUEsdUJBQUEsQ0FBQTs7Ozs7Ozs7QUFFQTtBQUNBLElBQUksTUFBTSxJQUFJLGNBQUosT0FBQSxDQUFnQjtBQUN4QixTQUR3QixHQUFBO0FBRXhCLFVBRndCLEdBQUE7QUFHeEIsYUFId0IsSUFBQTtBQUl4QixlQUp3QixLQUFBO0FBS3hCLGNBTHdCLENBQUE7QUFNeEIsYUFBVztBQU5hLENBQWhCLENBQVY7O0FBU0EsSUFBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQTtBQUNBLElBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLE9BQUE7QUFDQSxJQUFBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQTtBQUNBLElBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBb0IsT0FBcEIsVUFBQSxF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QUNsQjtBQUNEO0FBQ0QsV0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7O0FBRUE7QUFDQSxXQUFBLGNBQUEsQ0FBQSxPQUFBLENBQTRCLFVBQUEsQ0FBQSxFQUFLO0FBQy9CLFlBQUksT0FBQSxPQUFBLENBQUEsa0JBQUEsQ0FBd0IsT0FBeEIsR0FBQSxFQUFBLENBQUEsRUFBSixJQUFJLENBQUosRUFBZ0Q7QUFDOUMsWUFBQSxJQUFBLENBQUEsU0FBQSxFQUFrQixPQUFsQixHQUFBO0FBQ0Q7QUFISCxPQUFBOztBQU1BLFdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBMEIsVUFBQSxDQUFBLEVBQUs7QUFDN0IsWUFBSSxPQUFBLE9BQUEsQ0FBQSxnQkFBQSxDQUFzQixPQUF0QixHQUFBLEVBQUosQ0FBSSxDQUFKLEVBQXdDO0FBQ3RDLFlBQUEsSUFBQSxDQUFBLFNBQUEsRUFBa0IsT0FBbEIsR0FBQTtBQUNEO0FBSEgsT0FBQTtBQUtEOzs7O0VBcklxQixRQUFBLE87O2tCQXdJVCxTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4vbGliL0FwcGxpY2F0aW9uJ1xuaW1wb3J0IExvYWRpbmdTY2VuZSBmcm9tICcuL3NjZW5lcy9Mb2FkaW5nU2NlbmUnXG5cbi8vIENyZWF0ZSBhIFBpeGkgQXBwbGljYXRpb25cbmxldCBhcHAgPSBuZXcgQXBwbGljYXRpb24oe1xuICB3aWR0aDogMjU2LFxuICBoZWlnaHQ6IDI1NixcbiAgYW50aWFsaWFzOiB0cnVlLFxuICB0cmFuc3BhcmVudDogZmFsc2UsXG4gIHJlc29sdXRpb246IDEsXG4gIGF1dG9TdGFydDogZmFsc2Vcbn0pXG5cbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuYXBwLnJlbmRlcmVyLnZpZXcuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbmFwcC5yZW5kZXJlci5hdXRvUmVzaXplID0gdHJ1ZVxuYXBwLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXG4vLyBBZGQgdGhlIGNhbnZhcyB0aGF0IFBpeGkgYXV0b21hdGljYWxseSBjcmVhdGVkIGZvciB5b3UgdG8gdGhlIEhUTUwgZG9jdW1lbnRcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpXG5cbmFwcC5zdGFydCgpXG5hcHAuY2hhbmdlU2NlbmUoTG9hZGluZ1NjZW5lKVxuIiwiZXhwb3J0IGNvbnN0IE1PVkUgPSAnbW92ZSdcbmV4cG9ydCBjb25zdCBTTE9UUEFSVFNfQUxMID0gW1xuICBNT1ZFXG5dXG5cbi8vIG9iamVjdCB0eXBlLCBzdGF0aWMgb2JqZWN0LCBub3QgY29sbGlkZSB3aXRoXG5leHBvcnQgY29uc3QgU1RBVElDID0gJ3N0YXRpYydcbi8vIGNvbGxpZGUgd2l0aFxuZXhwb3J0IGNvbnN0IFNUQVkgPSAnc3RheSdcbi8vIHRvdWNoIHdpbGwgcmVwbHlcbmV4cG9ydCBjb25zdCBSRVBMWSA9ICdyZXBseSdcbiIsImV4cG9ydCBkZWZhdWx0IGtleUNvZGUgPT4ge1xuICBsZXQga2V5ID0ge31cbiAga2V5LmNvZGUgPSBrZXlDb2RlXG4gIGtleS5pc0Rvd24gPSBmYWxzZVxuICBrZXkuaXNVcCA9IHRydWVcbiAga2V5LnByZXNzID0gdW5kZWZpbmVkXG4gIGtleS5yZWxlYXNlID0gdW5kZWZpbmVkXG4gIC8vIFRoZSBgZG93bkhhbmRsZXJgXG4gIGtleS5kb3duSGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgIGlmIChrZXkuaXNVcCAmJiBrZXkucHJlc3MpIGtleS5wcmVzcygpXG4gICAgICBrZXkuaXNEb3duID0gdHJ1ZVxuICAgICAga2V5LmlzVXAgPSBmYWxzZVxuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICAvLyBUaGUgYHVwSGFuZGxlcmBcbiAga2V5LnVwSGFuZGxlciA9IGV2ZW50ID0+IHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgIGlmIChrZXkuaXNEb3duICYmIGtleS5yZWxlYXNlKSBrZXkucmVsZWFzZSgpXG4gICAgICBrZXkuaXNEb3duID0gZmFsc2VcbiAgICAgIGtleS5pc1VwID0gdHJ1ZVxuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICAvLyBBdHRhY2ggZXZlbnQgbGlzdGVuZXJzXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgICdrZXlkb3duJywga2V5LmRvd25IYW5kbGVyLmJpbmQoa2V5KSwgZmFsc2VcbiAgKVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAna2V5dXAnLCBrZXkudXBIYW5kbGVyLmJpbmQoa2V5KSwgZmFsc2VcbiAgKVxuICByZXR1cm4ga2V5XG59XG4iLCJpbXBvcnQgeyBBcHBsaWNhdGlvbiBhcyBQaXhpQXBwbGljYXRpb24sIEdyYXBoaWNzIH0gZnJvbSAnLi9QSVhJJ1xuXG5jbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIFBpeGlBcHBsaWNhdGlvbiB7XG4gIGNoYW5nZVNjZW5lIChTY2VuZU5hbWUsIHBhcmFtcykge1xuICAgIGlmICh0aGlzLmN1cnJlbnRTY2VuZSkge1xuICAgICAgLy8gbWF5YmUgdXNlIHByb21pc2UgZm9yIGFuaW1hdGlvblxuICAgICAgLy8gcmVtb3ZlIGdhbWVsb29wP1xuICAgICAgdGhpcy5jdXJyZW50U2NlbmUuZGVzdHJveSgpXG4gICAgICB0aGlzLnN0YWdlLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudFNjZW5lKVxuICAgIH1cblxuICAgIGxldCBzY2VuZSA9IG5ldyBTY2VuZU5hbWUocGFyYW1zKVxuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoc2NlbmUpXG4gICAgc2NlbmUuY3JlYXRlKClcbiAgICBzY2VuZS5vbignY2hhbmdlU2NlbmUnLCB0aGlzLmNoYW5nZVNjZW5lLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLmN1cnJlbnRTY2VuZSA9IHNjZW5lXG4gIH1cblxuICBzdGFydCAoLi4uYXJncykge1xuICAgIHN1cGVyLnN0YXJ0KC4uLmFyZ3MpXG5cbiAgICAvLyBjcmVhdGUgYSBiYWNrZ3JvdW5kIG1ha2Ugc3RhZ2UgaGFzIHdpZHRoICYgaGVpZ2h0XG4gICAgbGV0IHZpZXcgPSB0aGlzLnJlbmRlcmVyLnZpZXdcbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKFxuICAgICAgbmV3IEdyYXBoaWNzKCkuZHJhd1JlY3QoMCwgMCwgdmlldy53aWR0aCwgdmlldy5oZWlnaHQpXG4gICAgKVxuXG4gICAgLy8gU3RhcnQgdGhlIGdhbWUgbG9vcFxuICAgIHRoaXMudGlja2VyLmFkZChkZWx0YSA9PiB0aGlzLmdhbWVMb29wLmJpbmQodGhpcykoZGVsdGEpKVxuICB9XG5cbiAgZ2FtZUxvb3AgKGRlbHRhKSB7XG4gICAgLy8gVXBkYXRlIHRoZSBjdXJyZW50IGdhbWUgc3RhdGU6XG4gICAgdGhpcy5jdXJyZW50U2NlbmUudGljayhkZWx0YSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBsaWNhdGlvblxuIiwiLyogZ2xvYmFsIFBJWEksIEJ1bXAgKi9cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEJ1bXAoUElYSSlcbiIsIi8qIGdsb2JhbCBQSVhJICovXG5cbmV4cG9ydCBjb25zdCBBcHBsaWNhdGlvbiA9IFBJWEkuQXBwbGljYXRpb25cbmV4cG9ydCBjb25zdCBDb250YWluZXIgPSBQSVhJLkNvbnRhaW5lclxuZXhwb3J0IGNvbnN0IGxvYWRlciA9IFBJWEkubG9hZGVyXG5leHBvcnQgY29uc3QgcmVzb3VyY2VzID0gUElYSS5sb2FkZXIucmVzb3VyY2VzXG5leHBvcnQgY29uc3QgU3ByaXRlID0gUElYSS5TcHJpdGVcbmV4cG9ydCBjb25zdCBUZXh0ID0gUElYSS5UZXh0XG5leHBvcnQgY29uc3QgVGV4dFN0eWxlID0gUElYSS5UZXh0U3R5bGVcblxuZXhwb3J0IGNvbnN0IEdyYXBoaWNzID0gUElYSS5HcmFwaGljc1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyIH0gZnJvbSAnLi9QSVhJJ1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNyZWF0ZSAoKSB7fVxuXG4gIGRlc3Ryb3kgKCkge31cblxuICB0aWNrIChkZWx0YSkge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVcbiIsImltcG9ydCBXIGZyb20gJy4uL29iamVjdHMvV2FsbCdcbmltcG9ydCBHIGZyb20gJy4uL29iamVjdHMvR3Jhc3MnXG5pbXBvcnQgVCBmcm9tICcuLi9vYmplY3RzL1RyZWFzdXJlJ1xuaW1wb3J0IEQgZnJvbSAnLi4vb2JqZWN0cy9Eb29yJ1xuXG5pbXBvcnQgTW92ZSBmcm9tICcuLi9vYmplY3RzL3Nsb3RzL01vdmUnXG5cbmNvbnN0IEl0ZW1zID0gW1xuICBHLCBXLCBULCBEXG5dXG5cbmNvbnN0IFNsb3RzID0gW1xuICBNb3ZlXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YW5jZUJ5SXRlbUlkIChpdGVtSWQsIHBhcmFtcykge1xuICByZXR1cm4gbmV3IEl0ZW1zW2l0ZW1JZF0ocGFyYW1zKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFuY2VCeVNsb3RJZCAoc2xvdElkLCBwYXJhbXMpIHtcbiAgcmV0dXJuIG5ldyBTbG90c1tzbG90SWRdKHBhcmFtcylcbn1cbiIsImltcG9ydCB7IHJlc291cmNlcywgU3ByaXRlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQga2V5Ym9hcmQgZnJvbSAnLi4va2V5Ym9hcmQnXG5pbXBvcnQgeyBNT1ZFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuZnVuY3Rpb24gX2dldFNsb3RQYXJ0cyAoc2xvdHMsIHR5cGUpIHtcbiAgcmV0dXJuIHNsb3RzLmZpbHRlcihzbG90ID0+IHNsb3QudHlwZSA9PT0gdHlwZSlcbn1cbmZ1bmN0aW9uIF9nZXRTbG90UGFydCAoc2xvdHMsIHR5cGUpIHtcbiAgcmV0dXJuIHNsb3RzLmZpbmQoc2xvdCA9PiBzbG90LnR5cGUgPT09IHR5cGUpXG59XG5cbmNsYXNzIENhdCBleHRlbmRzIFNwcml0ZSB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1snd2FsbC5wbmcnXSlcblxuICAgIC8vIENoYW5nZSB0aGUgc3ByaXRlJ3MgcG9zaXRpb25cbiAgICB0aGlzLmR4ID0gMFxuICAgIHRoaXMuZHkgPSAwXG5cbiAgICB0aGlzLmluaXQoKVxuICAgIHRoaXMuc2xvdHMgPSBbXVxuICB9XG5cbiAgYWRkU2xvdFBhcnQgKHNsb3QpIHtcbiAgICBzd2l0Y2ggKHNsb3QudHlwZSkge1xuICAgICAgY2FzZSBNT1ZFOlxuICAgICAgICBsZXQgbW92ZVNsb3QgPSBfZ2V0U2xvdFBhcnQodGhpcy5zbG90cywgTU9WRSlcbiAgICAgICAgaWYgKG1vdmVTbG90KSB7XG4gICAgICAgICAgaWYgKG1vdmVTbG90LnZhbHVlID4gc2xvdC52YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBpbnggPSB0aGlzLnNsb3RzLmluZGV4T2YobW92ZVNsb3QpXG4gICAgICAgICAgdGhpcy5zbG90c1tpbnhdID0gc2xvdFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2xvdHMucHVzaChzbG90KVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnNsb3RzLnB1c2goc2xvdClcbiAgfVxuXG4gIG1vdmUgKGRlbHRhKSB7XG4gICAgbGV0IG1vdmVTbG90ID0gX2dldFNsb3RQYXJ0KHRoaXMuc2xvdHMsIE1PVkUpXG4gICAgaWYgKCFtb3ZlU2xvdCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy54ICs9IHRoaXMuZHggKiBtb3ZlU2xvdC52YWx1ZSAqIGRlbHRhXG4gICAgdGhpcy55ICs9IHRoaXMuZHkgKiBtb3ZlU2xvdC52YWx1ZSAqIGRlbHRhXG4gIH1cblxuICB0YWtlIChpbnZlbnRvcmllcykge1xuICAgIGludmVudG9yaWVzLmZvckVhY2goc2xvdCA9PiB0aGlzLmFkZFNsb3RQYXJ0KHNsb3QpKVxuICB9XG5cbiAgb3BlcmF0ZSAob3RoZXIpIHtcbiAgICBvdGhlci5vcGVyYXRlKHRoaXMpXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICAvLyBDYXB0dXJlIHRoZSBrZXlib2FyZCBhcnJvdyBrZXlzXG4gICAgbGV0IGxlZnQgPSBrZXlib2FyZCg2NSlcbiAgICBsZXQgdXAgPSBrZXlib2FyZCg4NylcbiAgICBsZXQgcmlnaHQgPSBrZXlib2FyZCg2OClcbiAgICBsZXQgZG93biA9IGtleWJvYXJkKDgzKVxuXG4gICAgLy8gTGVmdFxuICAgIGxlZnQucHJlc3MgPSAoKSA9PiB7XG4gICAgICB0aGlzLmR4ID0gLTFcbiAgICAgIHRoaXMuZHkgPSAwXG4gICAgfVxuICAgIGxlZnQucmVsZWFzZSA9ICgpID0+IHtcbiAgICAgIGlmICghcmlnaHQuaXNEb3duICYmIHRoaXMuZHkgPT09IDApIHtcbiAgICAgICAgdGhpcy5keCA9IDBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVcFxuICAgIHVwLnByZXNzID0gKCkgPT4ge1xuICAgICAgdGhpcy5keSA9IC0xXG4gICAgICB0aGlzLmR4ID0gMFxuICAgIH1cbiAgICB1cC5yZWxlYXNlID0gKCkgPT4ge1xuICAgICAgaWYgKCFkb3duLmlzRG93biAmJiB0aGlzLmR4ID09PSAwKSB7XG4gICAgICAgIHRoaXMuZHkgPSAwXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmlnaHRcbiAgICByaWdodC5wcmVzcyA9ICgpID0+IHtcbiAgICAgIHRoaXMuZHggPSAxXG4gICAgICB0aGlzLmR5ID0gMFxuICAgIH1cbiAgICByaWdodC5yZWxlYXNlID0gKCkgPT4ge1xuICAgICAgaWYgKCFsZWZ0LmlzRG93biAmJiB0aGlzLmR5ID09PSAwKSB7XG4gICAgICAgIHRoaXMuZHggPSAwXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRG93blxuICAgIGRvd24ucHJlc3MgPSAoKSA9PiB7XG4gICAgICB0aGlzLmR5ID0gMVxuICAgICAgdGhpcy5keCA9IDBcbiAgICB9XG4gICAgZG93bi5yZWxlYXNlID0gKCkgPT4ge1xuICAgICAgaWYgKCF1cC5pc0Rvd24gJiYgdGhpcy5keCA9PT0gMCkge1xuICAgICAgICB0aGlzLmR5ID0gMFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgdGhpcy5tb3ZlKGRlbHRhKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhdFxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFJFUExZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgRG9vciBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAobWFwKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIocmVzb3VyY2VzWydpbWFnZXMvdG93bl90aWxlcy5qc29uJ10udGV4dHVyZXNbJ2Rvb3IucG5nJ10pXG5cbiAgICB0aGlzLm1hcCA9IG1hcFswXVxuICAgIHRoaXMudG9Qb3NpdGlvbiA9IG1hcFsxXVxuXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gUkVQTFkgfVxuXG4gIGFjdGlvbldpdGggKG90aGVyLCBhY3Rpb24gPSAnb3BlcmF0ZScpIHtcbiAgICBpZiAodHlwZW9mIG90aGVyW2FjdGlvbl0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG90aGVyW2FjdGlvbl0odGhpcylcbiAgICB9XG4gIH1cblxuICBvcGVyYXRlIChvdGhlcikge1xuICAgIHRoaXMuZW1pdCgndXNlJywgdGhpcylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEb29yXG4iLCJpbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdhbWVPYmplY3QgZXh0ZW5kcyBTcHJpdGUge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYW1lT2JqZWN0XG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR3Jhc3MgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWydncmFzcy5wbmcnXSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyYXNzXG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgUkVQTFkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IHsgaW5zdGFuY2VCeVNsb3RJZCB9IGZyb20gJy4uL2xpYi91dGlscydcblxuY2xhc3MgVHJlYXN1cmUgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKGludmVudG9yaWVzID0gW10pIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1sndHJlYXN1cmUucG5nJ10pXG5cbiAgICB0aGlzLmludmVudG9yaWVzID0gaW52ZW50b3JpZXMubWFwKGNvbmYgPT4ge1xuICAgICAgcmV0dXJuIGluc3RhbmNlQnlTbG90SWQoY29uZlswXSwgY29uZlsxXSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbXG4gICAgICAndHJlYXN1cmU6IFsnLFxuICAgICAgdGhpcy5pbnZlbnRvcmllcy5tYXAoaW52ZW50b3J5ID0+IHtcbiAgICAgICAgcmV0dXJuIFtpbnZlbnRvcnkudHlwZSwgJzogJywgaW52ZW50b3J5LnZhbHVlXS5qb2luKCcnKVxuICAgICAgfSkuam9pbignLCAnKSxcbiAgICAgICddJ1xuICAgIF0uam9pbignJylcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFJFUExZIH1cblxuICBhY3Rpb25XaXRoIChvdGhlciwgYWN0aW9uID0gJ3Rha2UnKSB7XG4gICAgaWYgKHR5cGVvZiBvdGhlclthY3Rpb25dID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvdGhlclthY3Rpb25dKHRoaXMuaW52ZW50b3JpZXMpXG4gICAgICB0aGlzLmVtaXQoYWN0aW9uKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmVhc3VyZVxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBXYWxsIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1snd2FsbC5wbmcnXSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXYWxsXG4iLCJpbXBvcnQgeyBNT1ZFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgTW92ZSB7XG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xuICAgIHRoaXMudHlwZSA9IE1PVkVcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNb3ZlXG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUsIGxvYWRlciwgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbGliL1NjZW5lJ1xuaW1wb3J0IFBsYXlTY2VuZSBmcm9tICcuL1BsYXlTY2VuZSdcblxubGV0IHRleHQgPSAnbG9hZGluZydcblxuY2xhc3MgTG9hZGluZ1NjZW5lIGV4dGVuZHMgU2NlbmUge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgdGhpcy5saWZlID0gMFxuICB9XG5cbiAgY3JlYXRlICgpIHtcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgICBmb250U2l6ZTogMzYsXG4gICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgc3Ryb2tlOiAnI2ZmMzMwMCcsXG4gICAgICBzdHJva2VUaGlja25lc3M6IDQsXG4gICAgICBkcm9wU2hhZG93OiB0cnVlLFxuICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93Qmx1cjogNCxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZTogTWF0aC5QSSAvIDYsXG4gICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDZcbiAgICB9KVxuICAgIHRoaXMudGV4dExvYWRpbmcgPSBuZXcgVGV4dCh0ZXh0LCBzdHlsZSlcblxuICAgIC8vIEFkZCB0aGUgY2F0IHRvIHRoZSBzdGFnZVxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50ZXh0TG9hZGluZylcblxuICAgIC8vIGxvYWQgYW4gaW1hZ2UgYW5kIHJ1biB0aGUgYHNldHVwYCBmdW5jdGlvbiB3aGVuIGl0J3MgZG9uZVxuICAgIGxvYWRlclxuICAgICAgLmFkZCgnaW1hZ2VzL3Rvd25fdGlsZXMuanNvbicpXG4gICAgICAubG9hZCgoKSA9PiB0aGlzLmVtaXQoJ2NoYW5nZVNjZW5lJywgUGxheVNjZW5lLCB7XG4gICAgICAgIG1hcDogJ0UwTjAnLFxuICAgICAgICBwb3NpdGlvbjogWzEsIDFdXG4gICAgICB9KSlcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgdGhpcy5saWZlICs9IGRlbHRhIC8gMzAgLy8gYmxlbmQgc3BlZWRcbiAgICB0aGlzLnRleHRMb2FkaW5nLnRleHQgPSB0ZXh0ICsgQXJyYXkoTWF0aC5mbG9vcih0aGlzLmxpZmUpICUgNCArIDEpLmpvaW4oJy4nKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExvYWRpbmdTY2VuZVxuIiwiaW1wb3J0IHsgVGV4dCwgVGV4dFN0eWxlLCBsb2FkZXIsIHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbGliL1NjZW5lJ1xuaW1wb3J0IGJ1bXAgZnJvbSAnLi4vbGliL0J1bXAnXG5cbmltcG9ydCB7IGluc3RhbmNlQnlJdGVtSWQgfSBmcm9tICcuLi9saWIvdXRpbHMnXG5cbmltcG9ydCBDYXQgZnJvbSAnLi4vb2JqZWN0cy9DYXQnXG5pbXBvcnQgTW92ZSBmcm9tICcuLi9vYmplY3RzL3Nsb3RzL01vdmUnXG5cbmNvbnN0IENFSUxfU0laRSA9IDE2XG5cbmNsYXNzIFBsYXlTY2VuZSBleHRlbmRzIFNjZW5lIHtcbiAgY29uc3RydWN0b3IgKHsgbWFwLCBwbGF5ZXIsIHBvc2l0aW9uIH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5pc0xvYWRlZCA9IGZhbHNlXG4gICAgdGhpcy5jYXQgPSBwbGF5ZXJcblxuICAgIHRoaXMubWFwRmlsZSA9ICd3b3JsZC8nICsgbWFwXG4gICAgdGhpcy50b1Bvc2l0aW9uID0gcG9zaXRpb25cbiAgfVxuXG4gIGNyZWF0ZSAoKSB7XG4gICAgbGV0IGZpbGVOYW1lID0gdGhpcy5tYXBGaWxlXG5cbiAgICAvLyBpZiBtYXAgbm90IGxvYWRlZCB5ZXRcbiAgICBpZiAoIXJlc291cmNlc1tmaWxlTmFtZV0pIHtcbiAgICAgIGxvYWRlclxuICAgICAgICAuYWRkKGZpbGVOYW1lLCBmaWxlTmFtZSArICcuanNvbicpXG4gICAgICAgIC5sb2FkKHRoaXMub25Mb2FkZWQuYmluZCh0aGlzKSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbkxvYWRlZCgpXG4gICAgfVxuICB9XG5cbiAgb25Mb2FkZWQgKCkge1xuICAgIC8vIGluaXQgdmlldyBzaXplXG4gICAgLy8gbGV0IHNpZGVMZW5ndGggPSBNYXRoLm1pbih0aGlzLnBhcmVudC53aWR0aCwgdGhpcy5wYXJlbnQuaGVpZ2h0KVxuICAgIC8vIGxldCBzY2FsZSA9IHNpZGVMZW5ndGggLyBDRUlMX1NJWkUgLyAxMFxuICAgIC8vIHRoaXMuc2NhbGUuc2V0KHNjYWxlLCBzY2FsZSlcblxuICAgIHRoaXMubWFwID0gcmVzb3VyY2VzW3RoaXMubWFwRmlsZV0uZGF0YVxuXG4gICAgdGhpcy5jb2xsaWRlT2JqZWN0cyA9IFtdXG4gICAgdGhpcy5yZXBseU9iamVjdHMgPSBbXVxuXG4gICAgaWYgKCF0aGlzLmNhdCkge1xuICAgICAgdGhpcy5jYXQgPSBuZXcgQ2F0KClcbiAgICAgIHRoaXMuY2F0LmFkZFNsb3RQYXJ0KG5ldyBNb3ZlKDEpKVxuICAgICAgdGhpcy5jYXQud2lkdGggPSAxMFxuICAgICAgdGhpcy5jYXQuaGVpZ2h0ID0gMTBcbiAgICB9XG4gICAgdGhpcy5jYXQucG9zaXRpb24uc2V0KFxuICAgICAgdGhpcy50b1Bvc2l0aW9uWzBdICogQ0VJTF9TSVpFLFxuICAgICAgdGhpcy50b1Bvc2l0aW9uWzFdICogQ0VJTF9TSVpFXG4gICAgKVxuXG4gICAgdGhpcy5zcGF3bk1hcCgpXG4gICAgdGhpcy50aXBUZXh0KClcblxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5jYXQpXG5cbiAgICB0aGlzLmlzTG9hZGVkID0gdHJ1ZVxuICB9XG5cbiAgc3Bhd25NYXAgKCkge1xuICAgIGxldCBsZXZlbCA9IHRoaXMubWFwXG4gICAgbGV0IHRpbGVzID0gbGV2ZWwudGlsZXNcbiAgICBsZXQgY29scyA9IGxldmVsLmNvbHNcbiAgICBsZXQgcm93cyA9IGxldmVsLnJvd3NcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sczsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJvd3M7IGorKykge1xuICAgICAgICBsZXQgaWQgPSB0aWxlc1tqICogY29scyArIGldXG4gICAgICAgIGxldCBvID0gaW5zdGFuY2VCeUl0ZW1JZChpZClcbiAgICAgICAgby5wb3NpdGlvbi5zZXQoaSAqIENFSUxfU0laRSwgaiAqIENFSUxfU0laRSlcbiAgICAgICAgc3dpdGNoIChvLnR5cGUpIHtcbiAgICAgICAgICBjYXNlIFNUQVk6XG4gICAgICAgICAgICAvLyDpnZzmhYvnianku7ZcbiAgICAgICAgICAgIHRoaXMuY29sbGlkZU9iamVjdHMucHVzaChvKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkZENoaWxkKG8pXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV2ZWwuaXRlbXMuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuICAgICAgbGV0IG8gPSBpbnN0YW5jZUJ5SXRlbUlkKGl0ZW0uVHlwZSwgaXRlbS5wYXJhbXMpXG4gICAgICBvLnBvc2l0aW9uLnNldChpdGVtLnBvc1swXSAqIENFSUxfU0laRSwgaXRlbS5wb3NbMV0gKiBDRUlMX1NJWkUpXG4gICAgICB0aGlzLnJlcGx5T2JqZWN0cy5wdXNoKG8pXG4gICAgICBvLm9uKCd0YWtlJywgKCkgPT4ge1xuICAgICAgICAvLyB0aXAgdGV4dFxuICAgICAgICB0aGlzLnRleHQudGV4dCA9IG8udG9TdHJpbmcoKVxuXG4gICAgICAgIC8vIGRlc3Ryb3kgdHJlYXN1cmVcbiAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChvKVxuICAgICAgICBvLmRlc3Ryb3koKVxuICAgICAgICBsZXQgaW54ID0gdGhpcy5yZXBseU9iamVjdHMuaW5kZXhPZihvKVxuICAgICAgICB0aGlzLnJlcGx5T2JqZWN0cy5zcGxpY2UoaW54LCAxKVxuXG4gICAgICAgIC8vIHJlbW92ZSBpdGVtIGZyb20gdGhlIG1hcFxuICAgICAgICBkZWxldGUgbGV2ZWwuaXRlbXNbaV1cbiAgICAgIH0pXG4gICAgICBvLm9uKCd1c2UnLCAoKSA9PiB7XG4gICAgICAgIC8vIHRpcCB0ZXh0XG4gICAgICAgIHRoaXMudGV4dC50ZXh0ID0gJ3VzZSBkb29yJ1xuICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZVNjZW5lJywgUGxheVNjZW5lLCB7XG4gICAgICAgICAgbWFwOiBvLm1hcCxcbiAgICAgICAgICBwbGF5ZXI6IHRoaXMuY2F0LFxuICAgICAgICAgIHBvc2l0aW9uOiBvLnRvUG9zaXRpb25cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICB0aGlzLmFkZENoaWxkKG8pXG4gICAgfSlcbiAgfVxuXG4gIHRpcFRleHQgKCkge1xuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgZmlsbDogJ3doaXRlJ1xuICAgIH0pXG4gICAgdGhpcy50ZXh0ID0gbmV3IFRleHQoJycsIHN0eWxlKVxuICAgIHRoaXMudGV4dC54ID0gMTAwXG5cbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGV4dClcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgaWYgKCF0aGlzLmlzTG9hZGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5jYXQudGljayhkZWx0YSlcblxuICAgIC8vIGNvbGxpZGUgZGV0ZWN0XG4gICAgdGhpcy5jb2xsaWRlT2JqZWN0cy5mb3JFYWNoKG8gPT4ge1xuICAgICAgaWYgKGJ1bXAucmVjdGFuZ2xlQ29sbGlzaW9uKHRoaXMuY2F0LCBvLCB0cnVlKSkge1xuICAgICAgICBvLmVtaXQoJ2NvbGxpZGUnLCB0aGlzLmNhdClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5yZXBseU9iamVjdHMuZm9yRWFjaChvID0+IHtcbiAgICAgIGlmIChidW1wLmhpdFRlc3RSZWN0YW5nbGUodGhpcy5jYXQsIG8pKSB7XG4gICAgICAgIG8uZW1pdCgnY29sbGlkZScsIHRoaXMuY2F0KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheVNjZW5lXG4iXX0=
