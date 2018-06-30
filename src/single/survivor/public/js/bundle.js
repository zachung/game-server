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
          map: 'E0N0'
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

// TODO: after switch map update position of player


var CEIL_SIZE = 16;

var PlayScene = function (_Scene) {
  _inherits(PlayScene, _Scene);

  function PlayScene(_ref) {
    var map = _ref.map,
        player = _ref.player;

    _classCallCheck(this, PlayScene);

    var _this = _possibleConstructorReturn(this, (PlayScene.__proto__ || Object.getPrototypeOf(PlayScene)).call(this));

    _this.cat = player;

    var fileName = 'world/' + map;

    // FIXME: Resource named "world/E0N0" already exists
    _PIXI.loader.add(fileName, fileName + '.json').load(function () {
      _this.map = _PIXI.resources[fileName].data;
      _this._create();
    });
    return _this;
  }

  _createClass(PlayScene, [{
    key: '_create',
    value: function _create() {
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

      var level = this.map;
      level.tiles.forEach(function (row, i) {
        row.forEach(function (id, j) {
          var o = (0, _utils.instanceByItemId)(id);
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
        });
        o.on('use', function () {
          // tip text
          _this2.text.text = 'use door';
          _this2.emit('changeScene', PlayScene, {
            map: o.map
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

},{"../config/constants":2,"../lib/Bump":5,"../lib/PIXI":6,"../lib/Scene":7,"../lib/utils":8,"../objects/Cat":9,"../objects/slots/Move":15}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbmZpZy9jb25zdGFudHMuanMiLCJzcmMva2V5Ym9hcmQuanMiLCJzcmMvbGliL0FwcGxpY2F0aW9uLmpzIiwic3JjL2xpYi9CdW1wLmpzIiwic3JjL2xpYi9QSVhJLmpzIiwic3JjL2xpYi9TY2VuZS5qcyIsInNyYy9saWIvdXRpbHMuanMiLCJzcmMvb2JqZWN0cy9DYXQuanMiLCJzcmMvb2JqZWN0cy9Eb29yLmpzIiwic3JjL29iamVjdHMvR2FtZU9iamVjdC5qcyIsInNyYy9vYmplY3RzL0dyYXNzLmpzIiwic3JjL29iamVjdHMvVHJlYXN1cmUuanMiLCJzcmMvb2JqZWN0cy9XYWxsLmpzIiwic3JjL29iamVjdHMvc2xvdHMvTW92ZS5qcyIsInNyYy9zY2VuZXMvTG9hZGluZ1NjZW5lLmpzIiwic3JjL3NjZW5lcy9QbGF5U2NlbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUEsZUFBQSxRQUFBLG1CQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGdCQUFBLFFBQUEsdUJBQUEsQ0FBQTs7Ozs7Ozs7QUFFQTtBQUNBLElBQUksTUFBTSxJQUFJLGNBQUosT0FBQSxDQUFnQjtBQUN4QixTQUR3QixHQUFBO0FBRXhCLFVBRndCLEdBQUE7QUFHeEIsYUFId0IsSUFBQTtBQUl4QixlQUp3QixLQUFBO0FBS3hCLGNBTHdCLENBQUE7QUFNeEIsYUFBVztBQU5hLENBQWhCLENBQVY7O0FBU0EsSUFBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQTtBQUNBLElBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLE9BQUE7QUFDQSxJQUFBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQTtBQUNBLElBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBb0IsT0FBcEIsVUFBQSxF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LEdBQUEsVUFBQTtBQUNBLGlCQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsU0FBQSxFQUFvQztBQUNsQyxpQkFBSyxFQUFFO0FBRDJCLFdBQXBDO0FBSEYsU0FBQTtBQU9BLGVBQUEsUUFBQSxDQUFBLENBQUE7QUFyQkYsT0FBQTtBQXVCRDs7OzhCQUVVO0FBQ1QsVUFBSSxRQUFRLElBQUksTUFBSixTQUFBLENBQWM7QUFDeEIsa0JBRHdCLEVBQUE7QUFFeEIsY0FBTTtBQUZrQixPQUFkLENBQVo7QUFJQSxXQUFBLElBQUEsR0FBWSxJQUFJLE1BQUosSUFBQSxDQUFBLEVBQUEsRUFBWixLQUFZLENBQVo7QUFDQSxXQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQTs7QUFFQSxXQUFBLFFBQUEsQ0FBYyxLQUFkLElBQUE7QUFDRDs7O3lCQUVLLEssRUFBTztBQUFBLFVBQUEsU0FBQSxJQUFBOztBQUNYLFdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBOztBQUVBO0FBQ0EsV0FBQSxjQUFBLENBQUEsT0FBQSxDQUE0QixVQUFBLENBQUEsRUFBSztBQUMvQixZQUFJLE9BQUEsT0FBQSxDQUFBLGtCQUFBLENBQXdCLE9BQXhCLEdBQUEsRUFBQSxDQUFBLEVBQUosSUFBSSxDQUFKLEVBQWdEO0FBQzlDLFlBQUEsSUFBQSxDQUFBLFNBQUEsRUFBa0IsT0FBbEIsR0FBQTtBQUNEO0FBSEgsT0FBQTs7QUFNQSxXQUFBLFlBQUEsQ0FBQSxPQUFBLENBQTBCLFVBQUEsQ0FBQSxFQUFLO0FBQzdCLFlBQUksT0FBQSxPQUFBLENBQUEsZ0JBQUEsQ0FBc0IsT0FBdEIsR0FBQSxFQUFKLENBQUksQ0FBSixFQUF3QztBQUN0QyxZQUFBLElBQUEsQ0FBQSxTQUFBLEVBQWtCLE9BQWxCLEdBQUE7QUFDRDtBQUhILE9BQUE7QUFLRDs7OztFQXpHcUIsUUFBQSxPOztrQkE0R1QsUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuL2xpYi9BcHBsaWNhdGlvbidcbmltcG9ydCBMb2FkaW5nU2NlbmUgZnJvbSAnLi9zY2VuZXMvTG9hZGluZ1NjZW5lJ1xuXG4vLyBDcmVhdGUgYSBQaXhpIEFwcGxpY2F0aW9uXG5sZXQgYXBwID0gbmV3IEFwcGxpY2F0aW9uKHtcbiAgd2lkdGg6IDI1NixcbiAgaGVpZ2h0OiAyNTYsXG4gIGFudGlhbGlhczogdHJ1ZSxcbiAgdHJhbnNwYXJlbnQ6IGZhbHNlLFxuICByZXNvbHV0aW9uOiAxLFxuICBhdXRvU3RhcnQ6IGZhbHNlXG59KVxuXG5hcHAucmVuZGVyZXIudmlldy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5hcHAucmVuZGVyZXIuYXV0b1Jlc2l6ZSA9IHRydWVcbmFwcC5yZW5kZXJlci5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcblxuLy8gQWRkIHRoZSBjYW52YXMgdGhhdCBQaXhpIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBmb3IgeW91IHRvIHRoZSBIVE1MIGRvY3VtZW50XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFwcC52aWV3KVxuXG5hcHAuc3RhcnQoKVxuYXBwLmNoYW5nZVNjZW5lKExvYWRpbmdTY2VuZSlcbiIsImV4cG9ydCBjb25zdCBNT1ZFID0gJ21vdmUnXG5leHBvcnQgY29uc3QgU0xPVFBBUlRTX0FMTCA9IFtcbiAgTU9WRVxuXVxuXG4vLyBvYmplY3QgdHlwZSwgc3RhdGljIG9iamVjdCwgbm90IGNvbGxpZGUgd2l0aFxuZXhwb3J0IGNvbnN0IFNUQVRJQyA9ICdzdGF0aWMnXG4vLyBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFZID0gJ3N0YXknXG4vLyB0b3VjaCB3aWxsIHJlcGx5XG5leHBvcnQgY29uc3QgUkVQTFkgPSAncmVwbHknXG4iLCJleHBvcnQgZGVmYXVsdCBrZXlDb2RlID0+IHtcbiAgbGV0IGtleSA9IHt9XG4gIGtleS5jb2RlID0ga2V5Q29kZVxuICBrZXkuaXNEb3duID0gZmFsc2VcbiAga2V5LmlzVXAgPSB0cnVlXG4gIGtleS5wcmVzcyA9IHVuZGVmaW5lZFxuICBrZXkucmVsZWFzZSA9IHVuZGVmaW5lZFxuICAvLyBUaGUgYGRvd25IYW5kbGVyYFxuICBrZXkuZG93bkhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XG4gICAgICBpZiAoa2V5LmlzVXAgJiYga2V5LnByZXNzKSBrZXkucHJlc3MoKVxuICAgICAga2V5LmlzRG93biA9IHRydWVcbiAgICAgIGtleS5pc1VwID0gZmFsc2VcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgLy8gVGhlIGB1cEhhbmRsZXJgXG4gIGtleS51cEhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XG4gICAgICBpZiAoa2V5LmlzRG93biAmJiBrZXkucmVsZWFzZSkga2V5LnJlbGVhc2UoKVxuICAgICAga2V5LmlzRG93biA9IGZhbHNlXG4gICAgICBrZXkuaXNVcCA9IHRydWVcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgLy8gQXR0YWNoIGV2ZW50IGxpc3RlbmVyc1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAna2V5ZG93bicsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXG4gIClcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgJ2tleXVwJywga2V5LnVwSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXG4gIClcbiAgcmV0dXJuIGtleVxufVxuIiwiaW1wb3J0IHsgQXBwbGljYXRpb24gYXMgUGl4aUFwcGxpY2F0aW9uLCBHcmFwaGljcyB9IGZyb20gJy4vUElYSSdcblxuY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBQaXhpQXBwbGljYXRpb24ge1xuICBjaGFuZ2VTY2VuZSAoU2NlbmVOYW1lLCBwYXJhbXMpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50U2NlbmUpIHtcbiAgICAgIC8vIG1heWJlIHVzZSBwcm9taXNlIGZvciBhbmltYXRpb25cbiAgICAgIC8vIHJlbW92ZSBnYW1lbG9vcD9cbiAgICAgIHRoaXMuY3VycmVudFNjZW5lLmRlc3Ryb3koKVxuICAgICAgdGhpcy5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLmN1cnJlbnRTY2VuZSlcbiAgICB9XG5cbiAgICBsZXQgc2NlbmUgPSBuZXcgU2NlbmVOYW1lKHBhcmFtcylcbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKHNjZW5lKVxuICAgIHNjZW5lLmNyZWF0ZSgpXG4gICAgc2NlbmUub24oJ2NoYW5nZVNjZW5lJywgdGhpcy5jaGFuZ2VTY2VuZS5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5jdXJyZW50U2NlbmUgPSBzY2VuZVxuICB9XG5cbiAgc3RhcnQgKC4uLmFyZ3MpIHtcbiAgICBzdXBlci5zdGFydCguLi5hcmdzKVxuXG4gICAgLy8gY3JlYXRlIGEgYmFja2dyb3VuZCBtYWtlIHN0YWdlIGhhcyB3aWR0aCAmIGhlaWdodFxuICAgIGxldCB2aWV3ID0gdGhpcy5yZW5kZXJlci52aWV3XG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChcbiAgICAgIG5ldyBHcmFwaGljcygpLmRyYXdSZWN0KDAsIDAsIHZpZXcud2lkdGgsIHZpZXcuaGVpZ2h0KVxuICAgIClcblxuICAgIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgICB0aGlzLnRpY2tlci5hZGQoZGVsdGEgPT4gdGhpcy5nYW1lTG9vcC5iaW5kKHRoaXMpKGRlbHRhKSlcbiAgfVxuXG4gIGdhbWVMb29wIChkZWx0YSkge1xuICAgIC8vIFVwZGF0ZSB0aGUgY3VycmVudCBnYW1lIHN0YXRlOlxuICAgIHRoaXMuY3VycmVudFNjZW5lLnRpY2soZGVsdGEpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwbGljYXRpb25cbiIsIi8qIGdsb2JhbCBQSVhJLCBCdW1wICovXG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBCdW1wKFBJWEkpXG4iLCIvKiBnbG9iYWwgUElYSSAqL1xuXG5leHBvcnQgY29uc3QgQXBwbGljYXRpb24gPSBQSVhJLkFwcGxpY2F0aW9uXG5leHBvcnQgY29uc3QgQ29udGFpbmVyID0gUElYSS5Db250YWluZXJcbmV4cG9ydCBjb25zdCBsb2FkZXIgPSBQSVhJLmxvYWRlclxuZXhwb3J0IGNvbnN0IHJlc291cmNlcyA9IFBJWEkubG9hZGVyLnJlc291cmNlc1xuZXhwb3J0IGNvbnN0IFNwcml0ZSA9IFBJWEkuU3ByaXRlXG5leHBvcnQgY29uc3QgVGV4dCA9IFBJWEkuVGV4dFxuZXhwb3J0IGNvbnN0IFRleHRTdHlsZSA9IFBJWEkuVGV4dFN0eWxlXG5cbmV4cG9ydCBjb25zdCBHcmFwaGljcyA9IFBJWEkuR3JhcGhpY3NcbiIsImltcG9ydCB7IENvbnRhaW5lciB9IGZyb20gJy4vUElYSSdcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBDb250YWluZXIge1xuICBjcmVhdGUgKCkge31cblxuICBkZXN0cm95ICgpIHt9XG5cbiAgdGljayAoZGVsdGEpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lXG4iLCJpbXBvcnQgVyBmcm9tICcuLi9vYmplY3RzL1dhbGwnXG5pbXBvcnQgRyBmcm9tICcuLi9vYmplY3RzL0dyYXNzJ1xuaW1wb3J0IFQgZnJvbSAnLi4vb2JqZWN0cy9UcmVhc3VyZSdcbmltcG9ydCBEIGZyb20gJy4uL29iamVjdHMvRG9vcidcblxuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9zbG90cy9Nb3ZlJ1xuXG5jb25zdCBJdGVtcyA9IFtcbiAgRywgVywgVCwgRFxuXVxuXG5jb25zdCBTbG90cyA9IFtcbiAgTW92ZVxuXVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFuY2VCeUl0ZW1JZCAoaXRlbUlkLCBwYXJhbXMpIHtcbiAgcmV0dXJuIG5ldyBJdGVtc1tpdGVtSWRdKHBhcmFtcylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbmNlQnlTbG90SWQgKHNsb3RJZCwgcGFyYW1zKSB7XG4gIHJldHVybiBuZXcgU2xvdHNbc2xvdElkXShwYXJhbXMpXG59XG4iLCJpbXBvcnQgeyByZXNvdXJjZXMsIFNwcml0ZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IGtleWJvYXJkIGZyb20gJy4uL2tleWJvYXJkJ1xuaW1wb3J0IHsgTU9WRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmZ1bmN0aW9uIF9nZXRTbG90UGFydHMgKHNsb3RzLCB0eXBlKSB7XG4gIHJldHVybiBzbG90cy5maWx0ZXIoc2xvdCA9PiBzbG90LnR5cGUgPT09IHR5cGUpXG59XG5mdW5jdGlvbiBfZ2V0U2xvdFBhcnQgKHNsb3RzLCB0eXBlKSB7XG4gIHJldHVybiBzbG90cy5maW5kKHNsb3QgPT4gc2xvdC50eXBlID09PSB0eXBlKVxufVxuXG5jbGFzcyBDYXQgZXh0ZW5kcyBTcHJpdGUge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIocmVzb3VyY2VzWydpbWFnZXMvdG93bl90aWxlcy5qc29uJ10udGV4dHVyZXNbJ3dhbGwucG5nJ10pXG5cbiAgICAvLyBDaGFuZ2UgdGhlIHNwcml0ZSdzIHBvc2l0aW9uXG4gICAgdGhpcy5keCA9IDBcbiAgICB0aGlzLmR5ID0gMFxuXG4gICAgdGhpcy5pbml0KClcbiAgICB0aGlzLnNsb3RzID0gW11cbiAgfVxuXG4gIGFkZFNsb3RQYXJ0IChzbG90KSB7XG4gICAgc3dpdGNoIChzbG90LnR5cGUpIHtcbiAgICAgIGNhc2UgTU9WRTpcbiAgICAgICAgbGV0IG1vdmVTbG90ID0gX2dldFNsb3RQYXJ0KHRoaXMuc2xvdHMsIE1PVkUpXG4gICAgICAgIGlmIChtb3ZlU2xvdCkge1xuICAgICAgICAgIGlmIChtb3ZlU2xvdC52YWx1ZSA+IHNsb3QudmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaW54ID0gdGhpcy5zbG90cy5pbmRleE9mKG1vdmVTbG90KVxuICAgICAgICAgIHRoaXMuc2xvdHNbaW54XSA9IHNsb3RcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNsb3RzLnB1c2goc2xvdClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5zbG90cy5wdXNoKHNsb3QpXG4gIH1cblxuICBtb3ZlIChkZWx0YSkge1xuICAgIGxldCBtb3ZlU2xvdCA9IF9nZXRTbG90UGFydCh0aGlzLnNsb3RzLCBNT1ZFKVxuICAgIGlmICghbW92ZVNsb3QpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMueCArPSB0aGlzLmR4ICogbW92ZVNsb3QudmFsdWUgKiBkZWx0YVxuICAgIHRoaXMueSArPSB0aGlzLmR5ICogbW92ZVNsb3QudmFsdWUgKiBkZWx0YVxuICB9XG5cbiAgdGFrZSAoaW52ZW50b3JpZXMpIHtcbiAgICBpbnZlbnRvcmllcy5mb3JFYWNoKHNsb3QgPT4gdGhpcy5hZGRTbG90UGFydChzbG90KSlcbiAgfVxuXG4gIG9wZXJhdGUgKG90aGVyKSB7XG4gICAgb3RoZXIub3BlcmF0ZSh0aGlzKVxuICB9XG5cbiAgaW5pdCAoKSB7XG4gICAgLy8gQ2FwdHVyZSB0aGUga2V5Ym9hcmQgYXJyb3cga2V5c1xuICAgIGxldCBsZWZ0ID0ga2V5Ym9hcmQoNjUpXG4gICAgbGV0IHVwID0ga2V5Ym9hcmQoODcpXG4gICAgbGV0IHJpZ2h0ID0ga2V5Ym9hcmQoNjgpXG4gICAgbGV0IGRvd24gPSBrZXlib2FyZCg4MylcblxuICAgIC8vIExlZnRcbiAgICBsZWZ0LnByZXNzID0gKCkgPT4ge1xuICAgICAgdGhpcy5keCA9IC0xXG4gICAgICB0aGlzLmR5ID0gMFxuICAgIH1cbiAgICBsZWZ0LnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIXJpZ2h0LmlzRG93biAmJiB0aGlzLmR5ID09PSAwKSB7XG4gICAgICAgIHRoaXMuZHggPSAwXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVXBcbiAgICB1cC5wcmVzcyA9ICgpID0+IHtcbiAgICAgIHRoaXMuZHkgPSAtMVxuICAgICAgdGhpcy5keCA9IDBcbiAgICB9XG4gICAgdXAucmVsZWFzZSA9ICgpID0+IHtcbiAgICAgIGlmICghZG93bi5pc0Rvd24gJiYgdGhpcy5keCA9PT0gMCkge1xuICAgICAgICB0aGlzLmR5ID0gMFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJpZ2h0XG4gICAgcmlnaHQucHJlc3MgPSAoKSA9PiB7XG4gICAgICB0aGlzLmR4ID0gMVxuICAgICAgdGhpcy5keSA9IDBcbiAgICB9XG4gICAgcmlnaHQucmVsZWFzZSA9ICgpID0+IHtcbiAgICAgIGlmICghbGVmdC5pc0Rvd24gJiYgdGhpcy5keSA9PT0gMCkge1xuICAgICAgICB0aGlzLmR4ID0gMFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERvd25cbiAgICBkb3duLnByZXNzID0gKCkgPT4ge1xuICAgICAgdGhpcy5keSA9IDFcbiAgICAgIHRoaXMuZHggPSAwXG4gICAgfVxuICAgIGRvd24ucmVsZWFzZSA9ICgpID0+IHtcbiAgICAgIGlmICghdXAuaXNEb3duICYmIHRoaXMuZHggPT09IDApIHtcbiAgICAgICAgdGhpcy5keSA9IDBcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aWNrIChkZWx0YSkge1xuICAgIHRoaXMubW92ZShkZWx0YSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDYXRcbiIsImltcG9ydCB7IHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBSRVBMWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIERvb3IgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKG1hcCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWydkb29yLnBuZyddKVxuXG4gICAgdGhpcy5tYXAgPSBtYXBbMF1cblxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFJFUExZIH1cblxuICBhY3Rpb25XaXRoIChvdGhlciwgYWN0aW9uID0gJ29wZXJhdGUnKSB7XG4gICAgaWYgKHR5cGVvZiBvdGhlclthY3Rpb25dID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvdGhlclthY3Rpb25dKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgb3BlcmF0ZSAob3RoZXIpIHtcbiAgICB0aGlzLmVtaXQoJ3VzZScsIHRoaXMpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRG9vclxuIiwiaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBHYW1lT2JqZWN0IGV4dGVuZHMgU3ByaXRlIHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2FtZU9iamVjdFxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdyYXNzIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1snZ3Jhc3MucG5nJ10pXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFzc1xuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFJFUExZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCB7IGluc3RhbmNlQnlTbG90SWQgfSBmcm9tICcuLi9saWIvdXRpbHMnXG5cbmNsYXNzIFRyZWFzdXJlIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yIChpbnZlbnRvcmllcyA9IFtdKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIocmVzb3VyY2VzWydpbWFnZXMvdG93bl90aWxlcy5qc29uJ10udGV4dHVyZXNbJ3RyZWFzdXJlLnBuZyddKVxuXG4gICAgdGhpcy5pbnZlbnRvcmllcyA9IGludmVudG9yaWVzLm1hcChjb25mID0+IHtcbiAgICAgIHJldHVybiBpbnN0YW5jZUJ5U2xvdElkKGNvbmZbMF0sIGNvbmZbMV0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgJ3RyZWFzdXJlOiBbJyxcbiAgICAgIHRoaXMuaW52ZW50b3JpZXMubWFwKGludmVudG9yeSA9PiB7XG4gICAgICAgIHJldHVybiBbaW52ZW50b3J5LnR5cGUsICc6ICcsIGludmVudG9yeS52YWx1ZV0uam9pbignJylcbiAgICAgIH0pLmpvaW4oJywgJyksXG4gICAgICAnXSdcbiAgICBdLmpvaW4oJycpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XG5cbiAgYWN0aW9uV2l0aCAob3RoZXIsIGFjdGlvbiA9ICd0YWtlJykge1xuICAgIGlmICh0eXBlb2Ygb3RoZXJbYWN0aW9uXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb3RoZXJbYWN0aW9uXSh0aGlzLmludmVudG9yaWVzKVxuICAgICAgdGhpcy5lbWl0KGFjdGlvbilcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJlYXN1cmVcbiIsImltcG9ydCB7IHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgV2FsbCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIocmVzb3VyY2VzWydpbWFnZXMvdG93bl90aWxlcy5qc29uJ10udGV4dHVyZXNbJ3dhbGwucG5nJ10pXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2FsbFxuIiwiaW1wb3J0IHsgTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIE1vdmUge1xuICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcbiAgICB0aGlzLnR5cGUgPSBNT1ZFXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW92ZVxuIiwiaW1wb3J0IHsgVGV4dCwgVGV4dFN0eWxlLCBsb2FkZXIsIHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2xpYi9TY2VuZSdcbmltcG9ydCBQbGF5U2NlbmUgZnJvbSAnLi9QbGF5U2NlbmUnXG5cbmxldCB0ZXh0ID0gJ2xvYWRpbmcnXG5cbmNsYXNzIExvYWRpbmdTY2VuZSBleHRlbmRzIFNjZW5lIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKClcblxuICAgIHRoaXMubGlmZSA9IDBcbiAgfVxuXG4gIGNyZWF0ZSAoKSB7XG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgZm9udFNpemU6IDM2LFxuICAgICAgZmlsbDogJ3doaXRlJyxcbiAgICAgIHN0cm9rZTogJyNmZjMzMDAnLFxuICAgICAgc3Ryb2tlVGhpY2tuZXNzOiA0LFxuICAgICAgZHJvcFNoYWRvdzogdHJ1ZSxcbiAgICAgIGRyb3BTaGFkb3dDb2xvcjogJyMwMDAwMDAnLFxuICAgICAgZHJvcFNoYWRvd0JsdXI6IDQsXG4gICAgICBkcm9wU2hhZG93QW5nbGU6IE1hdGguUEkgLyA2LFxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlOiA2XG4gICAgfSlcbiAgICB0aGlzLnRleHRMb2FkaW5nID0gbmV3IFRleHQodGV4dCwgc3R5bGUpXG5cbiAgICAvLyBBZGQgdGhlIGNhdCB0byB0aGUgc3RhZ2VcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGV4dExvYWRpbmcpXG5cbiAgICAvLyBsb2FkIGFuIGltYWdlIGFuZCBydW4gdGhlIGBzZXR1cGAgZnVuY3Rpb24gd2hlbiBpdCdzIGRvbmVcbiAgICBsb2FkZXJcbiAgICAgIC5hZGQoJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nKVxuICAgICAgLmxvYWQoKCkgPT4gdGhpcy5lbWl0KCdjaGFuZ2VTY2VuZScsIFBsYXlTY2VuZSwge1xuICAgICAgICBtYXA6ICdFME4wJ1xuICAgICAgfSkpXG4gIH1cblxuICB0aWNrIChkZWx0YSkge1xuICAgIHRoaXMubGlmZSArPSBkZWx0YSAvIDMwIC8vIGJsZW5kIHNwZWVkXG4gICAgdGhpcy50ZXh0TG9hZGluZy50ZXh0ID0gdGV4dCArIEFycmF5KE1hdGguZmxvb3IodGhpcy5saWZlKSAlIDQgKyAxKS5qb2luKCcuJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb2FkaW5nU2NlbmVcbiIsImltcG9ydCB7IFRleHQsIFRleHRTdHlsZSwgbG9hZGVyLCByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2xpYi9TY2VuZSdcbmltcG9ydCBidW1wIGZyb20gJy4uL2xpYi9CdW1wJ1xuXG4vLyBUT0RPOiBhZnRlciBzd2l0Y2ggbWFwIHVwZGF0ZSBwb3NpdGlvbiBvZiBwbGF5ZXJcbmltcG9ydCB7IGluc3RhbmNlQnlJdGVtSWQgfSBmcm9tICcuLi9saWIvdXRpbHMnXG5cbmltcG9ydCBDYXQgZnJvbSAnLi4vb2JqZWN0cy9DYXQnXG5pbXBvcnQgTW92ZSBmcm9tICcuLi9vYmplY3RzL3Nsb3RzL01vdmUnXG5cbmNvbnN0IENFSUxfU0laRSA9IDE2XG5cbmNsYXNzIFBsYXlTY2VuZSBleHRlbmRzIFNjZW5lIHtcbiAgY29uc3RydWN0b3IgKHsgbWFwLCBwbGF5ZXIgfSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmNhdCA9IHBsYXllclxuXG4gICAgbGV0IGZpbGVOYW1lID0gJ3dvcmxkLycgKyBtYXBcblxuICAgIC8vIEZJWE1FOiBSZXNvdXJjZSBuYW1lZCBcIndvcmxkL0UwTjBcIiBhbHJlYWR5IGV4aXN0c1xuICAgIGxvYWRlclxuICAgICAgLmFkZChmaWxlTmFtZSwgZmlsZU5hbWUgKyAnLmpzb24nKVxuICAgICAgLmxvYWQoKCkgPT4ge1xuICAgICAgICB0aGlzLm1hcCA9IHJlc291cmNlc1tmaWxlTmFtZV0uZGF0YVxuICAgICAgICB0aGlzLl9jcmVhdGUoKVxuICAgICAgfSlcbiAgfVxuICBfY3JlYXRlICgpIHtcbiAgICAvLyBpbml0IHZpZXcgc2l6ZVxuICAgIGxldCBzaWRlTGVuZ3RoID0gTWF0aC5taW4odGhpcy5wYXJlbnQud2lkdGgsIHRoaXMucGFyZW50LmhlaWdodClcbiAgICBsZXQgc2NhbGUgPSBzaWRlTGVuZ3RoIC8gQ0VJTF9TSVpFIC8gMTBcbiAgICAvLyB0aGlzLnNjYWxlLnNldChzY2FsZSwgc2NhbGUpXG5cbiAgICB0aGlzLmNvbGxpZGVPYmplY3RzID0gW11cbiAgICB0aGlzLnJlcGx5T2JqZWN0cyA9IFtdXG5cbiAgICBpZiAoIXRoaXMuY2F0KSB7XG4gICAgICB0aGlzLmNhdCA9IG5ldyBDYXQoKVxuICAgICAgdGhpcy5jYXQuYWRkU2xvdFBhcnQobmV3IE1vdmUoMSkpXG4gICAgICB0aGlzLmNhdC5wb3NpdGlvbi5zZXQoMTYsIDE2KVxuICAgICAgdGhpcy5jYXQud2lkdGggPSAxMFxuICAgICAgdGhpcy5jYXQuaGVpZ2h0ID0gMTBcbiAgICB9XG5cbiAgICB0aGlzLnNwYXduTWFwKClcbiAgICB0aGlzLnRpcFRleHQoKVxuXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLmNhdClcbiAgfVxuXG4gIHNwYXduTWFwICgpIHtcbiAgICBsZXQgbGV2ZWwgPSB0aGlzLm1hcFxuICAgIGxldmVsLnRpbGVzLmZvckVhY2goKHJvdywgaSkgPT4ge1xuICAgICAgcm93LmZvckVhY2goKGlkLCBqKSA9PiB7XG4gICAgICAgIGxldCBvID0gaW5zdGFuY2VCeUl0ZW1JZChpZClcbiAgICAgICAgby5wb3NpdGlvbi5zZXQoaiAqIENFSUxfU0laRSwgaSAqIENFSUxfU0laRSlcbiAgICAgICAgc3dpdGNoIChvLnR5cGUpIHtcbiAgICAgICAgICBjYXNlIFNUQVk6XG4gICAgICAgICAgICAvLyDpnZzmhYvnianku7ZcbiAgICAgICAgICAgIHRoaXMuY29sbGlkZU9iamVjdHMucHVzaChvKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkZENoaWxkKG8pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBsZXZlbC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgbGV0IG8gPSBpbnN0YW5jZUJ5SXRlbUlkKGl0ZW0uVHlwZSwgaXRlbS5wYXJhbXMpXG4gICAgICBvLnBvc2l0aW9uLnNldChpdGVtLnBvc1swXSAqIENFSUxfU0laRSwgaXRlbS5wb3NbMV0gKiBDRUlMX1NJWkUpXG4gICAgICB0aGlzLnJlcGx5T2JqZWN0cy5wdXNoKG8pXG4gICAgICBvLm9uKCd0YWtlJywgKCkgPT4ge1xuICAgICAgICAvLyB0aXAgdGV4dFxuICAgICAgICB0aGlzLnRleHQudGV4dCA9IG8udG9TdHJpbmcoKVxuXG4gICAgICAgIC8vIGRlc3Ryb3kgdHJlYXN1cmVcbiAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChvKVxuICAgICAgICBvLmRlc3Ryb3koKVxuICAgICAgICBsZXQgaW54ID0gdGhpcy5yZXBseU9iamVjdHMuaW5kZXhPZihvKVxuICAgICAgICB0aGlzLnJlcGx5T2JqZWN0cy5zcGxpY2UoaW54LCAxKVxuICAgICAgfSlcbiAgICAgIG8ub24oJ3VzZScsICgpID0+IHtcbiAgICAgICAgLy8gdGlwIHRleHRcbiAgICAgICAgdGhpcy50ZXh0LnRleHQgPSAndXNlIGRvb3InXG4gICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlU2NlbmUnLCBQbGF5U2NlbmUsIHtcbiAgICAgICAgICBtYXA6IG8ubWFwXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgdGhpcy5hZGRDaGlsZChvKVxuICAgIH0pXG4gIH1cblxuICB0aXBUZXh0ICgpIHtcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgIGZpbGw6ICd3aGl0ZSdcbiAgICB9KVxuICAgIHRoaXMudGV4dCA9IG5ldyBUZXh0KCcnLCBzdHlsZSlcbiAgICB0aGlzLnRleHQueCA9IDEwMFxuXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRleHQpXG4gIH1cblxuICB0aWNrIChkZWx0YSkge1xuICAgIHRoaXMuY2F0LnRpY2soZGVsdGEpXG5cbiAgICAvLyBjb2xsaWRlIGRldGVjdFxuICAgIHRoaXMuY29sbGlkZU9iamVjdHMuZm9yRWFjaChvID0+IHtcbiAgICAgIGlmIChidW1wLnJlY3RhbmdsZUNvbGxpc2lvbih0aGlzLmNhdCwgbywgdHJ1ZSkpIHtcbiAgICAgICAgby5lbWl0KCdjb2xsaWRlJywgdGhpcy5jYXQpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMucmVwbHlPYmplY3RzLmZvckVhY2gobyA9PiB7XG4gICAgICBpZiAoYnVtcC5oaXRUZXN0UmVjdGFuZ2xlKHRoaXMuY2F0LCBvKSkge1xuICAgICAgICBvLmVtaXQoJ2NvbGxpZGUnLCB0aGlzLmNhdClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXlTY2VuZVxuIl19
