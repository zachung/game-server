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
app.changeStage();
app.changeScene(_LoadingScene2.default);

},{"./lib/Application":4,"./scenes/LoadingScene":20}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var CEIL_SIZE = exports.CEIL_SIZE = 16;

var MOVE = exports.MOVE = 'move';
var CAMERA = exports.CAMERA = 'camera';
var OPERATE = exports.OPERATE = Symbol('operate');
var SLOTPARTS_ALL = exports.SLOTPARTS_ALL = [MOVE, CAMERA, OPERATE];

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
    key: 'changeStage',
    value: function changeStage() {
      this.stage = new _PIXI.display.Stage();
    }
  }, {
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

},{"./PIXI":8}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global PIXI, Bump */

exports.default = new Bump(PIXI);

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

var _PIXI = require('./PIXI');

var _constants = require('../config/constants');

var _utils = require('./utils');

var _Bump = require('../lib/Bump');

var _Bump2 = _interopRequireDefault(_Bump);

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

/**
 * events:
 *  use: object
 */
var Map = function (_Container) {
  _inherits(Map, _Container);

  function Map() {
    _classCallCheck(this, Map);

    var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this));

    _this.collideObjects = [];
    _this.replyObjects = [];

    _this.once('added', _this.enableFog.bind(_this));
    return _this;
  }

  _createClass(Map, [{
    key: 'enableFog',
    value: function enableFog() {
      var lighting = new _PIXI.display.Layer();
      lighting.on('display', function (element) {
        element.blendMode = _PIXI.BLEND_MODES.ADD;
      });
      lighting.useRenderTexture = true;
      lighting.clearColor = [0, 0, 0, 1]; // ambient gray

      this.addChild(lighting);

      var lightingSprite = new _PIXI.Sprite(lighting.getRenderTexture());
      lightingSprite.blendMode = _PIXI.BLEND_MODES.MULTIPLY;

      this.addChild(lightingSprite);

      this.lighting = lighting;
    }

    // 消除迷霧

  }, {
    key: 'disableFog',
    value: function disableFog() {
      this.lighting.clearColor = [1, 1, 1, 1];
    }
  }, {
    key: 'load',
    value: function load(mapData) {
      var _this2 = this;

      var tiles = mapData.tiles;
      var cols = mapData.cols;
      var rows = mapData.rows;
      var items = mapData.items;

      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var id = tiles[j * cols + i];
          var o = (0, _utils.instanceByItemId)(id);
          o.position.set(i * _constants.CEIL_SIZE, j * _constants.CEIL_SIZE);
          switch (o.type) {
            case _constants.STAY:
              // 靜態物件
              this.collideObjects.push(o);
              break;
          }
          this.addChild(o);
        }
      }

      items.forEach(function (item, i) {
        var o = (0, _utils.instanceByItemId)(item.Type, item.params);
        o.position.set(item.pos[0] * _constants.CEIL_SIZE, item.pos[1] * _constants.CEIL_SIZE);
        switch (o.type) {
          case _constants.STAY:
            // 靜態物件
            _this2.collideObjects.push(o);
            break;
          default:
            _this2.replyObjects.push(o);
        }
        o.on('take', function () {
          // destroy treasure
          _this2.removeChild(o);
          o.destroy();
          var inx = _this2.replyObjects.indexOf(o);
          _this2.replyObjects.splice(inx, 1);

          // remove item from the map
          delete items[i];
        });
        o.on('use', function () {
          return _this2.emit('use', o);
        });
        _this2.addChild(o);
      });
    }
  }, {
    key: 'addPlayer',
    value: function addPlayer(player, toPosition) {
      player.position.set(toPosition[0] * _constants.CEIL_SIZE, toPosition[1] * _constants.CEIL_SIZE);
      this.addChild(player);

      this.player = player;
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      var _this3 = this;

      this.player.tick(delta);

      // collide detect
      this.collideObjects.forEach(function (o) {
        if (_Bump2.default.rectangleCollision(_this3.player, o, true)) {
          o.emit('collide', _this3.player);
        }
      });

      this.replyObjects.forEach(function (o) {
        if (_Bump2.default.hitTestRectangle(_this3.player, o)) {
          o.emit('collide', _this3.player);
        }
      });
    }
  }]);

  return Map;
}(_PIXI.Container);

exports.default = Map;

},{"../config/constants":2,"../lib/Bump":5,"./PIXI":8,"./utils":10}],7:[function(require,module,exports){
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

var messages = [];
var MSG_KEEP_MS = 1000;

var Messages = function () {
  function Messages() {
    _classCallCheck(this, Messages);
  }

  _createClass(Messages, null, [{
    key: "getList",
    value: function getList() {
      return messages;
    }
  }, {
    key: "add",
    value: function add(msg) {
      messages.push(msg);
      setTimeout(messages.pop.bind(messages), MSG_KEEP_MS);
    }
  }]);

  return Messages;
}();

exports.default = Messages;

},{}],8:[function(require,module,exports){
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
var BLEND_MODES = exports.BLEND_MODES = PIXI.BLEND_MODES;
var display = exports.display = PIXI.display;

},{}],9:[function(require,module,exports){
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

},{"./PIXI":8}],10:[function(require,module,exports){
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

var _Camera = require('../objects/slots/Camera');

var _Camera2 = _interopRequireDefault(_Camera);

var _Operate = require('../objects/slots/Operate');

var _Operate2 = _interopRequireDefault(_Operate);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Items = [_Grass2.default, _Wall2.default, _Treasure2.default, _Door2.default];

var Slots = [_Move2.default, _Camera2.default, _Operate2.default];

function instanceByItemId(itemId, params) {
  return new Items[itemId](params);
}

function instanceBySlotId(slotId, params) {
  return new Slots[slotId](params);
}

},{"../objects/Door":12,"../objects/Grass":14,"../objects/Treasure":15,"../objects/Wall":16,"../objects/slots/Camera":17,"../objects/slots/Move":18,"../objects/slots/Operate":19}],11:[function(require,module,exports){
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

var Cat = function (_GameObject) {
  _inherits(Cat, _GameObject);

  function Cat() {
    _classCallCheck(this, Cat);

    // Change the sprite's position
    var _this = _possibleConstructorReturn(this, (Cat.__proto__ || Object.getPrototypeOf(Cat)).call(this, _PIXI.resources['images/town_tiles.json'].textures['wall.png']));
    // Create the cat sprite


    _this.dx = 0;
    _this.dy = 0;

    _this.init();
    _this.tickAbilities = {};
    _this.abilities = {};
    return _this;
  }

  _createClass(Cat, [{
    key: 'takeAbility',
    value: function takeAbility(ability) {
      if (ability.hasToReplace(this)) {
        ability.carryBy(this);
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'cat';
    }
  }, {
    key: 'init',
    value: function init() {
      var _this2 = this;

      // Capture the keyboard arrow keys
      var left = (0, _keyboard2.default)(65);
      var up = (0, _keyboard2.default)(87);
      var right = (0, _keyboard2.default)(68);
      var down = (0, _keyboard2.default)(83);

      // Left
      left.press = function () {
        _this2.dx = -1;
        _this2.dy = 0;
      };
      left.release = function () {
        if (!right.isDown && _this2.dy === 0) {
          _this2.dx = 0;
        }
      };

      // Up
      up.press = function () {
        _this2.dy = -1;
        _this2.dx = 0;
      };
      up.release = function () {
        if (!down.isDown && _this2.dx === 0) {
          _this2.dy = 0;
        }
      };

      // Right
      right.press = function () {
        _this2.dx = 1;
        _this2.dy = 0;
      };
      right.release = function () {
        if (!left.isDown && _this2.dy === 0) {
          _this2.dx = 0;
        }
      };

      // Down
      down.press = function () {
        _this2.dy = 1;
        _this2.dx = 0;
      };
      down.release = function () {
        if (!up.isDown && _this2.dx === 0) {
          _this2.dy = 0;
        }
      };
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      var _this3 = this;

      Object.values(this.tickAbilities).forEach(function (ability) {
        return ability.tick(delta, _this3);
      });
    }
  }]);

  return Cat;
}(_GameObject3.default);

exports.default = Cat;

},{"../keyboard":3,"../lib/PIXI":8,"./GameObject":13}],12:[function(require,module,exports){
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
    value: function actionWith(operator) {
      var ability = operator.abilities[_constants.OPERATE];
      if (!ability) {
        this.say([operator.toString(), ' dosen\'t has ability to use this door ', this.map, '.'].join(''));
      } else {
        ability.use(operator, this);
      }
    }
  }, {
    key: _constants.OPERATE,
    value: function value() {
      this.say(['Get in ', this.map, ' now.'].join(''));
      this.emit('use');
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.STAY;
    }
  }]);

  return Door;
}(_GameObject3.default);

exports.default = Door;

},{"../config/constants":2,"../lib/PIXI":8,"./GameObject":13}],13:[function(require,module,exports){
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

var _Messages = require('../lib/Messages');

var _Messages2 = _interopRequireDefault(_Messages);

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

var GameObject = function (_Sprite) {
  _inherits(GameObject, _Sprite);

  function GameObject() {
    _classCallCheck(this, GameObject);

    return _possibleConstructorReturn(this, (GameObject.__proto__ || Object.getPrototypeOf(GameObject)).apply(this, arguments));
  }

  _createClass(GameObject, [{
    key: 'say',
    value: function say(msg) {
      _Messages2.default.add(msg);
      console.log(msg);
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.STATIC;
    }
  }]);

  return GameObject;
}(_PIXI.Sprite);

exports.default = GameObject;

},{"../config/constants":2,"../lib/Messages":7,"../lib/PIXI":8}],14:[function(require,module,exports){
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

},{"../config/constants":2,"../lib/PIXI":8,"./GameObject":13}],15:[function(require,module,exports){
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
      return ['treasure: [', this.inventories.join(', '), ']'].join('');
    }
  }, {
    key: 'actionWith',
    value: function actionWith(operator) {
      var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'takeAbility';

      // FIXME: 暫時用預設參數 takeAbility
      if (typeof operator[action] === 'function') {
        this.inventories.forEach(function (treasure) {
          return operator[action](treasure);
        });
        this.say([operator.toString(), ' taked ', this.toString()].join(''));

        this.emit('take');
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

},{"../config/constants":2,"../lib/PIXI":8,"../lib/utils":10,"./GameObject":13}],16:[function(require,module,exports){
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

},{"../config/constants":2,"../lib/PIXI":8,"./GameObject":13}],17:[function(require,module,exports){
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

var _PIXI = require('../../lib/PIXI');

var _constants = require('../../config/constants');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var FOG = Symbol('fog');

var Camera = function () {
  function Camera(value) {
    _classCallCheck(this, Camera);

    this.type = _constants.CAMERA;

    this.radius = value;
  }

  // 是否需置換


  _createClass(Camera, [{
    key: 'hasToReplace',
    value: function hasToReplace(owner) {
      var other = owner.abilities[this.type];
      if (!other) {
        return true;
      }
      // 只會變大
      return this.radius >= other.radius;
    }

    // 配備此技能

  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      var _this = this;

      var ability = owner.abilities[this.type];
      if (ability) {
        // remove pre fog
        this.removeCamera(owner);
      }
      owner.abilities[this.type] = this;

      if (owner.parent) {
        this.setup(owner, owner.parent);
      } else {
        owner.once('added', function (container) {
          return _this.setup(owner, container);
        });
      }
    }
  }, {
    key: 'setup',
    value: function setup(owner, container) {
      var _this2 = this;

      var lightbulb = new _PIXI.Graphics();
      var rr = 0xff;
      var rg = 0xff;
      var rb = 0xff;
      var rad = this.radius / owner.scale.x * _constants.CEIL_SIZE;

      var x = owner.width / 2 / owner.scale.x;
      var y = owner.height / 2 / owner.scale.y;
      lightbulb.beginFill((rr << 16) + (rg << 8) + rb, 1.0);
      lightbulb.drawCircle(x, y, rad);
      lightbulb.endFill();
      lightbulb.parentLayer = container.lighting; // must has property: lighting

      owner[FOG] = lightbulb;
      owner.addChild(lightbulb);

      owner.once('removed', function () {
        _this2.removeCamera(owner);
        owner.once('added', function (container) {
          return _this2.setup(owner, container);
        });
      });
    }
  }, {
    key: 'removeCamera',
    value: function removeCamera(owner) {
      owner.removeChild(owner[FOG]);
      delete owner[FOG];
    }
  }]);

  return Camera;
}();

exports.default = Camera;

},{"../../config/constants":2,"../../lib/PIXI":8}],18:[function(require,module,exports){
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

var _constants = require('../../config/constants');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Move = function () {
  function Move(value) {
    _classCallCheck(this, Move);

    this.type = _constants.MOVE;
    this.value = value;
  }

  // 是否需置換


  _createClass(Move, [{
    key: 'hasToReplace',
    value: function hasToReplace(owner) {
      var other = owner.tickAbilities[this.type];
      if (!other) {
        return true;
      }
      // 只會加快
      return this.value > other.value;
    }

    // 配備此技能

  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      owner.tickAbilities[this.type] = this;
    }

    // tick

  }, {
    key: 'tick',
    value: function tick(delta, owner) {
      owner.x += owner.dx * this.value * delta;
      owner.y += owner.dy * this.value * delta;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'move level: ' + this.value;
    }
  }]);

  return Move;
}();

exports.default = Move;

},{"../../config/constants":2}],19:[function(require,module,exports){
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

var _constants = require('../../config/constants');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Operate = function () {
  function Operate(value) {
    _classCallCheck(this, Operate);

    this.type = _constants.OPERATE;
    this.set = new Set([value]);
  }

  // 是否需置換


  _createClass(Operate, [{
    key: 'hasToReplace',
    value: function hasToReplace(owner) {
      return true;
    }

    // 配備此技能

  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      var ability = owner.abilities[this.type];
      if (!ability) {
        // first get operate ability
        ability = this;
        owner.abilities[this.type] = ability;
        return;
      }
      var set = ability.set;
      this.set.forEach(set.add.bind(set));
    }
  }, {
    key: 'use',
    value: function use(operator, target) {
      if (operator.abilities[this.type].set.has(target.map)) {
        operator.say(operator.toString() + ' use ability to open ' + target.map);
        target[this.type]();
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return ['keys: ', Array.from(this.set).join(', ')].join('');
    }
  }]);

  return Operate;
}();

exports.default = Operate;

},{"../../config/constants":2}],20:[function(require,module,exports){
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

},{"../lib/PIXI":8,"../lib/Scene":9,"./PlayScene":21}],21:[function(require,module,exports){
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

var _Map = require('../lib/Map');

var _Map2 = _interopRequireDefault(_Map);

var _Messages = require('../lib/Messages');

var _Messages2 = _interopRequireDefault(_Messages);

var _Cat = require('../objects/Cat');

var _Cat2 = _interopRequireDefault(_Cat);

var _Move = require('../objects/slots/Move');

var _Move2 = _interopRequireDefault(_Move);

var _Operate = require('../objects/slots/Operate');

var _Operate2 = _interopRequireDefault(_Operate);

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

      this.collideObjects = [];
      this.replyObjects = [];

      if (!this.cat) {
        this.cat = new _Cat2.default();
        this.cat.takeAbility(new _Move2.default(1));
        this.cat.takeAbility(new _Operate2.default('E0N0'));
        // this.cat.takeAbility(new Camera(16))
        this.cat.width = 10;
        this.cat.height = 10;
      }

      this.spawnMap(_PIXI.resources[this.mapFile].data);
      this.addChild(this.map);
      this.map.addPlayer(this.cat, this.toPosition);

      this.tipText();

      this.isLoaded = true;
    }
  }, {
    key: 'spawnMap',
    value: function spawnMap(mapData) {
      var _this2 = this;

      var map = new _Map2.default();
      map.load(mapData);

      map.on('use', function (o) {
        // tip text
        _this2.emit('changeScene', PlayScene, {
          map: o.map,
          player: _this2.cat,
          position: o.toPosition
        });
      });

      this.map = map;
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
      if (!this.isLoaded) {
        return;
      }
      this.map.tick(delta);
      this.text.text = _Messages2.default.getList().join('');
    }
  }]);

  return PlayScene;
}(_Scene3.default);

exports.default = PlayScene;

},{"../lib/Map":6,"../lib/Messages":7,"../lib/PIXI":8,"../lib/Scene":9,"../objects/Cat":11,"../objects/slots/Move":18,"../objects/slots/Operate":19}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbmZpZy9jb25zdGFudHMuanMiLCJzcmMva2V5Ym9hcmQuanMiLCJzcmMvbGliL0FwcGxpY2F0aW9uLmpzIiwic3JjL2xpYi9CdW1wLmpzIiwic3JjL2xpYi9NYXAuanMiLCJzcmMvbGliL01lc3NhZ2VzLmpzIiwic3JjL2xpYi9QSVhJLmpzIiwic3JjL2xpYi9TY2VuZS5qcyIsInNyYy9saWIvdXRpbHMuanMiLCJzcmMvb2JqZWN0cy9DYXQuanMiLCJzcmMvb2JqZWN0cy9Eb29yLmpzIiwic3JjL29iamVjdHMvR2FtZU9iamVjdC5qcyIsInNyYy9vYmplY3RzL0dyYXNzLmpzIiwic3JjL29iamVjdHMvVHJlYXN1cmUuanMiLCJzcmMvb2JqZWN0cy9XYWxsLmpzIiwic3JjL29iamVjdHMvc2xvdHMvQ2FtZXJhLmpzIiwic3JjL29iamVjdHMvc2xvdHMvTW92ZS5qcyIsInNyYy9vYmplY3RzL3Nsb3RzL09wZXJhdGUuanMiLCJzcmMvc2NlbmVzL0xvYWRpbmdTY2VuZS5qcyIsInNyYy9zY2VuZXMvUGxheVNjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFBLGVBQUEsUUFBQSxtQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxnQkFBQSxRQUFBLHVCQUFBLENBQUE7Ozs7Ozs7O0FBRUE7QUFDQSxJQUFJLE1BQU0sSUFBSSxjQUFKLE9BQUEsQ0FBZ0I7QUFDeEIsU0FEd0IsR0FBQTtBQUV4QixVQUZ3QixHQUFBO0FBR3hCLGFBSHdCLElBQUE7QUFJeEIsZUFKd0IsS0FBQTtBQUt4QixjQUx3QixDQUFBO0FBTXhCLGFBQVc7QUFOYSxDQUFoQixDQUFWOztBQVNBLElBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLFVBQUE7QUFDQSxJQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FB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QUFBLElBQUE7O0FBQ2pCLFVBQUksTUFBTSxJQUFJLE1BQWQsT0FBVSxFQUFWO0FBQ0EsVUFBQSxJQUFBLENBQUEsT0FBQTs7QUFFQSxVQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQWMsVUFBQSxDQUFBLEVBQUs7QUFDakI7QUFDQSxlQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsU0FBQSxFQUFvQztBQUNsQyxlQUFLLEVBRDZCLEdBQUE7QUFFbEMsa0JBQVEsT0FGMEIsR0FBQTtBQUdsQyxvQkFBVSxFQUFFO0FBSHNCLFNBQXBDO0FBRkYsT0FBQTs7QUFTQSxXQUFBLEdBQUEsR0FBQSxHQUFBO0FBQ0Q7Ozs4QkFFVTtBQUNULFVBQUksUUFBUSxJQUFJLE1BQUosU0FBQSxDQUFjO0FBQ3hCLGtCQUR3QixFQUFBO0FBRXhCLGNBQU07QUFGa0IsT0FBZCxDQUFaO0FBSUEsV0FBQSxJQUFBLEdBQVksSUFBSSxNQUFKLElBQUEsQ0FBQSxFQUFBLEVBQVosS0FBWSxDQUFaO0FBQ0EsV0FBQSxJQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUE7O0FBRUEsV0FBQSxRQUFBLENBQWMsS0FBZCxJQUFBO0FBQ0Q7Ozt5QkFFSyxLLEVBQU87QUFDWCxVQUFJLENBQUMsS0FBTCxRQUFBLEVBQW9CO0FBQ2xCO0FBQ0Q7QUFDRCxXQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtBQUNBLFdBQUEsSUFBQSxDQUFBLElBQUEsR0FBaUIsV0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBakIsRUFBaUIsQ0FBakI7QUFDRDs7OztFQW5GcUIsUUFBQSxPOztrQkFzRlQsUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuL2xpYi9BcHBsaWNhdGlvbidcbmltcG9ydCBMb2FkaW5nU2NlbmUgZnJvbSAnLi9zY2VuZXMvTG9hZGluZ1NjZW5lJ1xuXG4vLyBDcmVhdGUgYSBQaXhpIEFwcGxpY2F0aW9uXG5sZXQgYXBwID0gbmV3IEFwcGxpY2F0aW9uKHtcbiAgd2lkdGg6IDI1NixcbiAgaGVpZ2h0OiAyNTYsXG4gIGFudGlhbGlhczogdHJ1ZSxcbiAgdHJhbnNwYXJlbnQ6IGZhbHNlLFxuICByZXNvbHV0aW9uOiAxLFxuICBhdXRvU3RhcnQ6IGZhbHNlXG59KVxuXG5hcHAucmVuZGVyZXIudmlldy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5hcHAucmVuZGVyZXIuYXV0b1Jlc2l6ZSA9IHRydWVcbmFwcC5yZW5kZXJlci5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcblxuLy8gQWRkIHRoZSBjYW52YXMgdGhhdCBQaXhpIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBmb3IgeW91IHRvIHRoZSBIVE1MIGRvY3VtZW50XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFwcC52aWV3KVxuXG5hcHAuc3RhcnQoKVxuYXBwLmNoYW5nZVN0YWdlKClcbmFwcC5jaGFuZ2VTY2VuZShMb2FkaW5nU2NlbmUpXG4iLCJleHBvcnQgY29uc3QgQ0VJTF9TSVpFID0gMTZcblxuZXhwb3J0IGNvbnN0IE1PVkUgPSAnbW92ZSdcbmV4cG9ydCBjb25zdCBDQU1FUkEgPSAnY2FtZXJhJ1xuZXhwb3J0IGNvbnN0IE9QRVJBVEUgPSBTeW1ib2woJ29wZXJhdGUnKVxuZXhwb3J0IGNvbnN0IFNMT1RQQVJUU19BTEwgPSBbXG4gIE1PVkUsIENBTUVSQSwgT1BFUkFURVxuXVxuXG4vLyBvYmplY3QgdHlwZSwgc3RhdGljIG9iamVjdCwgbm90IGNvbGxpZGUgd2l0aFxuZXhwb3J0IGNvbnN0IFNUQVRJQyA9ICdzdGF0aWMnXG4vLyBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFZID0gJ3N0YXknXG4vLyB0b3VjaCB3aWxsIHJlcGx5XG5leHBvcnQgY29uc3QgUkVQTFkgPSAncmVwbHknXG4iLCJleHBvcnQgZGVmYXVsdCBrZXlDb2RlID0+IHtcbiAgbGV0IGtleSA9IHt9XG4gIGtleS5jb2RlID0ga2V5Q29kZVxuICBrZXkuaXNEb3duID0gZmFsc2VcbiAga2V5LmlzVXAgPSB0cnVlXG4gIGtleS5wcmVzcyA9IHVuZGVmaW5lZFxuICBrZXkucmVsZWFzZSA9IHVuZGVmaW5lZFxuICAvLyBUaGUgYGRvd25IYW5kbGVyYFxuICBrZXkuZG93bkhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XG4gICAgICBpZiAoa2V5LmlzVXAgJiYga2V5LnByZXNzKSBrZXkucHJlc3MoKVxuICAgICAga2V5LmlzRG93biA9IHRydWVcbiAgICAgIGtleS5pc1VwID0gZmFsc2VcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgLy8gVGhlIGB1cEhhbmRsZXJgXG4gIGtleS51cEhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XG4gICAgICBpZiAoa2V5LmlzRG93biAmJiBrZXkucmVsZWFzZSkga2V5LnJlbGVhc2UoKVxuICAgICAga2V5LmlzRG93biA9IGZhbHNlXG4gICAgICBrZXkuaXNVcCA9IHRydWVcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgLy8gQXR0YWNoIGV2ZW50IGxpc3RlbmVyc1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAna2V5ZG93bicsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXG4gIClcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgJ2tleXVwJywga2V5LnVwSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXG4gIClcbiAgcmV0dXJuIGtleVxufVxuIiwiaW1wb3J0IHsgQXBwbGljYXRpb24gYXMgUGl4aUFwcGxpY2F0aW9uLCBHcmFwaGljcywgZGlzcGxheSB9IGZyb20gJy4vUElYSSdcblxuY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBQaXhpQXBwbGljYXRpb24ge1xuICBjaGFuZ2VTdGFnZSAoKSB7XG4gICAgdGhpcy5zdGFnZSA9IG5ldyBkaXNwbGF5LlN0YWdlKClcbiAgfVxuXG4gIGNoYW5nZVNjZW5lIChTY2VuZU5hbWUsIHBhcmFtcykge1xuICAgIGlmICh0aGlzLmN1cnJlbnRTY2VuZSkge1xuICAgICAgLy8gbWF5YmUgdXNlIHByb21pc2UgZm9yIGFuaW1hdGlvblxuICAgICAgLy8gcmVtb3ZlIGdhbWVsb29wP1xuICAgICAgdGhpcy5jdXJyZW50U2NlbmUuZGVzdHJveSgpXG4gICAgICB0aGlzLnN0YWdlLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudFNjZW5lKVxuICAgIH1cblxuICAgIGxldCBzY2VuZSA9IG5ldyBTY2VuZU5hbWUocGFyYW1zKVxuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoc2NlbmUpXG4gICAgc2NlbmUuY3JlYXRlKClcbiAgICBzY2VuZS5vbignY2hhbmdlU2NlbmUnLCB0aGlzLmNoYW5nZVNjZW5lLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLmN1cnJlbnRTY2VuZSA9IHNjZW5lXG4gIH1cblxuICBzdGFydCAoLi4uYXJncykge1xuICAgIHN1cGVyLnN0YXJ0KC4uLmFyZ3MpXG5cbiAgICAvLyBjcmVhdGUgYSBiYWNrZ3JvdW5kIG1ha2Ugc3RhZ2UgaGFzIHdpZHRoICYgaGVpZ2h0XG4gICAgbGV0IHZpZXcgPSB0aGlzLnJlbmRlcmVyLnZpZXdcbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKFxuICAgICAgbmV3IEdyYXBoaWNzKCkuZHJhd1JlY3QoMCwgMCwgdmlldy53aWR0aCwgdmlldy5oZWlnaHQpXG4gICAgKVxuXG4gICAgLy8gU3RhcnQgdGhlIGdhbWUgbG9vcFxuICAgIHRoaXMudGlja2VyLmFkZChkZWx0YSA9PiB0aGlzLmdhbWVMb29wLmJpbmQodGhpcykoZGVsdGEpKVxuICB9XG5cbiAgZ2FtZUxvb3AgKGRlbHRhKSB7XG4gICAgLy8gVXBkYXRlIHRoZSBjdXJyZW50IGdhbWUgc3RhdGU6XG4gICAgdGhpcy5jdXJyZW50U2NlbmUudGljayhkZWx0YSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBsaWNhdGlvblxuIiwiLyogZ2xvYmFsIFBJWEksIEJ1bXAgKi9cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEJ1bXAoUElYSSlcbiIsImltcG9ydCB7IENvbnRhaW5lciwgZGlzcGxheSwgQkxFTkRfTU9ERVMsIFNwcml0ZSB9IGZyb20gJy4vUElYSSdcblxuaW1wb3J0IHsgU1RBWSwgQ0VJTF9TSVpFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCB7IGluc3RhbmNlQnlJdGVtSWQgfSBmcm9tICcuL3V0aWxzJ1xuaW1wb3J0IGJ1bXAgZnJvbSAnLi4vbGliL0J1bXAnXG5cbi8qKlxuICogZXZlbnRzOlxuICogIHVzZTogb2JqZWN0XG4gKi9cbmNsYXNzIE1hcCBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5jb2xsaWRlT2JqZWN0cyA9IFtdXG4gICAgdGhpcy5yZXBseU9iamVjdHMgPSBbXVxuXG4gICAgdGhpcy5vbmNlKCdhZGRlZCcsIHRoaXMuZW5hYmxlRm9nLmJpbmQodGhpcykpXG4gIH1cblxuICBlbmFibGVGb2cgKCkge1xuICAgIGxldCBsaWdodGluZyA9IG5ldyBkaXNwbGF5LkxheWVyKClcbiAgICBsaWdodGluZy5vbignZGlzcGxheScsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LmJsZW5kTW9kZSA9IEJMRU5EX01PREVTLkFERFxuICAgIH0pXG4gICAgbGlnaHRpbmcudXNlUmVuZGVyVGV4dHVyZSA9IHRydWVcbiAgICBsaWdodGluZy5jbGVhckNvbG9yID0gWzAsIDAsIDAsIDFdIC8vIGFtYmllbnQgZ3JheVxuXG4gICAgdGhpcy5hZGRDaGlsZChsaWdodGluZylcblxuICAgIHZhciBsaWdodGluZ1Nwcml0ZSA9IG5ldyBTcHJpdGUobGlnaHRpbmcuZ2V0UmVuZGVyVGV4dHVyZSgpKVxuICAgIGxpZ2h0aW5nU3ByaXRlLmJsZW5kTW9kZSA9IEJMRU5EX01PREVTLk1VTFRJUExZXG5cbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nU3ByaXRlKVxuXG4gICAgdGhpcy5saWdodGluZyA9IGxpZ2h0aW5nXG4gIH1cblxuICAvLyDmtojpmaTov7fpnKdcbiAgZGlzYWJsZUZvZyAoKSB7XG4gICAgdGhpcy5saWdodGluZy5jbGVhckNvbG9yID0gWzEsIDEsIDEsIDFdXG4gIH1cblxuICBsb2FkIChtYXBEYXRhKSB7XG4gICAgbGV0IHRpbGVzID0gbWFwRGF0YS50aWxlc1xuICAgIGxldCBjb2xzID0gbWFwRGF0YS5jb2xzXG4gICAgbGV0IHJvd3MgPSBtYXBEYXRhLnJvd3NcbiAgICBsZXQgaXRlbXMgPSBtYXBEYXRhLml0ZW1zXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHM7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dzOyBqKyspIHtcbiAgICAgICAgbGV0IGlkID0gdGlsZXNbaiAqIGNvbHMgKyBpXVxuICAgICAgICBsZXQgbyA9IGluc3RhbmNlQnlJdGVtSWQoaWQpXG4gICAgICAgIG8ucG9zaXRpb24uc2V0KGkgKiBDRUlMX1NJWkUsIGogKiBDRUlMX1NJWkUpXG4gICAgICAgIHN3aXRjaCAoby50eXBlKSB7XG4gICAgICAgICAgY2FzZSBTVEFZOlxuICAgICAgICAgICAgLy8g6Z2c5oWL54mp5Lu2XG4gICAgICAgICAgICB0aGlzLmNvbGxpZGVPYmplY3RzLnB1c2gobylcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hZGRDaGlsZChvKVxuICAgICAgfVxuICAgIH1cblxuICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgIGxldCBvID0gaW5zdGFuY2VCeUl0ZW1JZChpdGVtLlR5cGUsIGl0ZW0ucGFyYW1zKVxuICAgICAgby5wb3NpdGlvbi5zZXQoaXRlbS5wb3NbMF0gKiBDRUlMX1NJWkUsIGl0ZW0ucG9zWzFdICogQ0VJTF9TSVpFKVxuICAgICAgc3dpdGNoIChvLnR5cGUpIHtcbiAgICAgICAgY2FzZSBTVEFZOlxuICAgICAgICAgIC8vIOmdnOaFi+eJqeS7tlxuICAgICAgICAgIHRoaXMuY29sbGlkZU9iamVjdHMucHVzaChvKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5yZXBseU9iamVjdHMucHVzaChvKVxuICAgICAgfVxuICAgICAgby5vbigndGFrZScsICgpID0+IHtcbiAgICAgICAgLy8gZGVzdHJveSB0cmVhc3VyZVxuICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKG8pXG4gICAgICAgIG8uZGVzdHJveSgpXG4gICAgICAgIGxldCBpbnggPSB0aGlzLnJlcGx5T2JqZWN0cy5pbmRleE9mKG8pXG4gICAgICAgIHRoaXMucmVwbHlPYmplY3RzLnNwbGljZShpbngsIDEpXG5cbiAgICAgICAgLy8gcmVtb3ZlIGl0ZW0gZnJvbSB0aGUgbWFwXG4gICAgICAgIGRlbGV0ZSBpdGVtc1tpXVxuICAgICAgfSlcbiAgICAgIG8ub24oJ3VzZScsICgpID0+IHRoaXMuZW1pdCgndXNlJywgbykpXG4gICAgICB0aGlzLmFkZENoaWxkKG8pXG4gICAgfSlcbiAgfVxuXG4gIGFkZFBsYXllciAocGxheWVyLCB0b1Bvc2l0aW9uKSB7XG4gICAgcGxheWVyLnBvc2l0aW9uLnNldChcbiAgICAgIHRvUG9zaXRpb25bMF0gKiBDRUlMX1NJWkUsXG4gICAgICB0b1Bvc2l0aW9uWzFdICogQ0VJTF9TSVpFXG4gICAgKVxuICAgIHRoaXMuYWRkQ2hpbGQocGxheWVyKVxuXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXJcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgdGhpcy5wbGF5ZXIudGljayhkZWx0YSlcblxuICAgIC8vIGNvbGxpZGUgZGV0ZWN0XG4gICAgdGhpcy5jb2xsaWRlT2JqZWN0cy5mb3JFYWNoKG8gPT4ge1xuICAgICAgaWYgKGJ1bXAucmVjdGFuZ2xlQ29sbGlzaW9uKHRoaXMucGxheWVyLCBvLCB0cnVlKSkge1xuICAgICAgICBvLmVtaXQoJ2NvbGxpZGUnLCB0aGlzLnBsYXllcilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5yZXBseU9iamVjdHMuZm9yRWFjaChvID0+IHtcbiAgICAgIGlmIChidW1wLmhpdFRlc3RSZWN0YW5nbGUodGhpcy5wbGF5ZXIsIG8pKSB7XG4gICAgICAgIG8uZW1pdCgnY29sbGlkZScsIHRoaXMucGxheWVyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFwXG4iLCJjb25zdCBtZXNzYWdlcyA9IFtdXG5jb25zdCBNU0dfS0VFUF9NUyA9IDEwMDBcblxuY2xhc3MgTWVzc2FnZXMge1xuICBzdGF0aWMgZ2V0TGlzdCAoKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2VzXG4gIH1cblxuICBzdGF0aWMgYWRkIChtc2cpIHtcbiAgICBtZXNzYWdlcy5wdXNoKG1zZylcbiAgICBzZXRUaW1lb3V0KG1lc3NhZ2VzLnBvcC5iaW5kKG1lc3NhZ2VzKSwgTVNHX0tFRVBfTVMpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZXNcbiIsIi8qIGdsb2JhbCBQSVhJICovXG5cbmV4cG9ydCBjb25zdCBBcHBsaWNhdGlvbiA9IFBJWEkuQXBwbGljYXRpb25cbmV4cG9ydCBjb25zdCBDb250YWluZXIgPSBQSVhJLkNvbnRhaW5lclxuZXhwb3J0IGNvbnN0IGxvYWRlciA9IFBJWEkubG9hZGVyXG5leHBvcnQgY29uc3QgcmVzb3VyY2VzID0gUElYSS5sb2FkZXIucmVzb3VyY2VzXG5leHBvcnQgY29uc3QgU3ByaXRlID0gUElYSS5TcHJpdGVcbmV4cG9ydCBjb25zdCBUZXh0ID0gUElYSS5UZXh0XG5leHBvcnQgY29uc3QgVGV4dFN0eWxlID0gUElYSS5UZXh0U3R5bGVcblxuZXhwb3J0IGNvbnN0IEdyYXBoaWNzID0gUElYSS5HcmFwaGljc1xuZXhwb3J0IGNvbnN0IEJMRU5EX01PREVTID0gUElYSS5CTEVORF9NT0RFU1xuZXhwb3J0IGNvbnN0IGRpc3BsYXkgPSBQSVhJLmRpc3BsYXlcbiIsImltcG9ydCB7IENvbnRhaW5lciB9IGZyb20gJy4vUElYSSdcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBDb250YWluZXIge1xuICBjcmVhdGUgKCkge31cblxuICBkZXN0cm95ICgpIHt9XG5cbiAgdGljayAoZGVsdGEpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lXG4iLCJpbXBvcnQgVyBmcm9tICcuLi9vYmplY3RzL1dhbGwnXHJcbmltcG9ydCBHIGZyb20gJy4uL29iamVjdHMvR3Jhc3MnXHJcbmltcG9ydCBUIGZyb20gJy4uL29iamVjdHMvVHJlYXN1cmUnXHJcbmltcG9ydCBEIGZyb20gJy4uL29iamVjdHMvRG9vcidcclxuXHJcbmltcG9ydCBNb3ZlIGZyb20gJy4uL29iamVjdHMvc2xvdHMvTW92ZSdcclxuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9vYmplY3RzL3Nsb3RzL0NhbWVyYSdcclxuaW1wb3J0IE9wZXJhdGUgZnJvbSAnLi4vb2JqZWN0cy9zbG90cy9PcGVyYXRlJ1xyXG5cclxuY29uc3QgSXRlbXMgPSBbXHJcbiAgRywgVywgVCwgRFxyXG5dXHJcblxyXG5jb25zdCBTbG90cyA9IFtcclxuICBNb3ZlLCBDYW1lcmEsIE9wZXJhdGVcclxuXVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbmNlQnlJdGVtSWQgKGl0ZW1JZCwgcGFyYW1zKSB7XHJcbiAgcmV0dXJuIG5ldyBJdGVtc1tpdGVtSWRdKHBhcmFtcylcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbmNlQnlTbG90SWQgKHNsb3RJZCwgcGFyYW1zKSB7XHJcbiAgcmV0dXJuIG5ldyBTbG90c1tzbG90SWRdKHBhcmFtcylcclxufVxyXG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcbmltcG9ydCBrZXlib2FyZCBmcm9tICcuLi9rZXlib2FyZCdcblxuY2xhc3MgQ2F0IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1snd2FsbC5wbmcnXSlcblxuICAgIC8vIENoYW5nZSB0aGUgc3ByaXRlJ3MgcG9zaXRpb25cbiAgICB0aGlzLmR4ID0gMFxuICAgIHRoaXMuZHkgPSAwXG5cbiAgICB0aGlzLmluaXQoKVxuICAgIHRoaXMudGlja0FiaWxpdGllcyA9IHt9XG4gICAgdGhpcy5hYmlsaXRpZXMgPSB7fVxuICB9XG5cbiAgdGFrZUFiaWxpdHkgKGFiaWxpdHkpIHtcbiAgICBpZiAoYWJpbGl0eS5oYXNUb1JlcGxhY2UodGhpcykpIHtcbiAgICAgIGFiaWxpdHkuY2FycnlCeSh0aGlzKVxuICAgIH1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2NhdCdcbiAgfVxuXG4gIGluaXQgKCkge1xuICAgIC8vIENhcHR1cmUgdGhlIGtleWJvYXJkIGFycm93IGtleXNcbiAgICBsZXQgbGVmdCA9IGtleWJvYXJkKDY1KVxuICAgIGxldCB1cCA9IGtleWJvYXJkKDg3KVxuICAgIGxldCByaWdodCA9IGtleWJvYXJkKDY4KVxuICAgIGxldCBkb3duID0ga2V5Ym9hcmQoODMpXG5cbiAgICAvLyBMZWZ0XG4gICAgbGVmdC5wcmVzcyA9ICgpID0+IHtcbiAgICAgIHRoaXMuZHggPSAtMVxuICAgICAgdGhpcy5keSA9IDBcbiAgICB9XG4gICAgbGVmdC5yZWxlYXNlID0gKCkgPT4ge1xuICAgICAgaWYgKCFyaWdodC5pc0Rvd24gJiYgdGhpcy5keSA9PT0gMCkge1xuICAgICAgICB0aGlzLmR4ID0gMFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwXG4gICAgdXAucHJlc3MgPSAoKSA9PiB7XG4gICAgICB0aGlzLmR5ID0gLTFcbiAgICAgIHRoaXMuZHggPSAwXG4gICAgfVxuICAgIHVwLnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIWRvd24uaXNEb3duICYmIHRoaXMuZHggPT09IDApIHtcbiAgICAgICAgdGhpcy5keSA9IDBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSaWdodFxuICAgIHJpZ2h0LnByZXNzID0gKCkgPT4ge1xuICAgICAgdGhpcy5keCA9IDFcbiAgICAgIHRoaXMuZHkgPSAwXG4gICAgfVxuICAgIHJpZ2h0LnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIWxlZnQuaXNEb3duICYmIHRoaXMuZHkgPT09IDApIHtcbiAgICAgICAgdGhpcy5keCA9IDBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEb3duXG4gICAgZG93bi5wcmVzcyA9ICgpID0+IHtcbiAgICAgIHRoaXMuZHkgPSAxXG4gICAgICB0aGlzLmR4ID0gMFxuICAgIH1cbiAgICBkb3duLnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIXVwLmlzRG93biAmJiB0aGlzLmR4ID09PSAwKSB7XG4gICAgICAgIHRoaXMuZHkgPSAwXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICBPYmplY3QudmFsdWVzKHRoaXMudGlja0FiaWxpdGllcykuZm9yRWFjaChhYmlsaXR5ID0+IGFiaWxpdHkudGljayhkZWx0YSwgdGhpcykpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2F0XG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgU1RBWSwgT1BFUkFURSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcblxyXG5jbGFzcyBEb29yIGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKG1hcCkge1xyXG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXHJcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1snZG9vci5wbmcnXSlcclxuXHJcbiAgICB0aGlzLm1hcCA9IG1hcFswXVxyXG4gICAgdGhpcy50b1Bvc2l0aW9uID0gbWFwWzFdXHJcblxyXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XHJcblxyXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XHJcbiAgICBsZXQgYWJpbGl0eSA9IG9wZXJhdG9yLmFiaWxpdGllc1tPUEVSQVRFXVxyXG4gICAgaWYgKCFhYmlsaXR5KSB7XHJcbiAgICAgIHRoaXMuc2F5KFtcclxuICAgICAgICBvcGVyYXRvci50b1N0cmluZygpLFxyXG4gICAgICAgICcgZG9zZW5cXCd0IGhhcyBhYmlsaXR5IHRvIHVzZSB0aGlzIGRvb3IgJyxcclxuICAgICAgICB0aGlzLm1hcCxcclxuICAgICAgICAnLidcclxuICAgICAgXS5qb2luKCcnKSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFiaWxpdHkudXNlKG9wZXJhdG9yLCB0aGlzKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgW09QRVJBVEVdICgpIHtcclxuICAgIHRoaXMuc2F5KFsnR2V0IGluICcsIHRoaXMubWFwLCAnIG5vdy4nXS5qb2luKCcnKSlcclxuICAgIHRoaXMuZW1pdCgndXNlJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERvb3JcclxuIiwiaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IE1lc3NhZ2VzIGZyb20gJy4uL2xpYi9NZXNzYWdlcydcblxuY2xhc3MgR2FtZU9iamVjdCBleHRlbmRzIFNwcml0ZSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG4gIHNheSAobXNnKSB7XG4gICAgTWVzc2FnZXMuYWRkKG1zZylcbiAgICBjb25zb2xlLmxvZyhtc2cpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2FtZU9iamVjdFxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdyYXNzIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1snZ3Jhc3MucG5nJ10pXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFzc1xuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXHJcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcclxuXHJcbmltcG9ydCB7IFJFUExZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuaW1wb3J0IHsgaW5zdGFuY2VCeVNsb3RJZCB9IGZyb20gJy4uL2xpYi91dGlscydcclxuXHJcbmNsYXNzIFRyZWFzdXJlIGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKGludmVudG9yaWVzID0gW10pIHtcclxuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxyXG4gICAgc3VwZXIocmVzb3VyY2VzWydpbWFnZXMvdG93bl90aWxlcy5qc29uJ10udGV4dHVyZXNbJ3RyZWFzdXJlLnBuZyddKVxyXG5cclxuICAgIHRoaXMuaW52ZW50b3JpZXMgPSBpbnZlbnRvcmllcy5tYXAoY29uZiA9PiB7XHJcbiAgICAgIHJldHVybiBpbnN0YW5jZUJ5U2xvdElkKGNvbmZbMF0sIGNvbmZbMV0pXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICd0cmVhc3VyZTogWycsXHJcbiAgICAgIHRoaXMuaW52ZW50b3JpZXMuam9pbignLCAnKSxcclxuICAgICAgJ10nXHJcbiAgICBdLmpvaW4oJycpXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XHJcblxyXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yLCBhY3Rpb24gPSAndGFrZUFiaWxpdHknKSB7XHJcbiAgICAvLyBGSVhNRTog5pqr5pmC55So6aCQ6Kit5Y+D5pW4IHRha2VBYmlsaXR5XHJcbiAgICBpZiAodHlwZW9mIG9wZXJhdG9yW2FjdGlvbl0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpcy5pbnZlbnRvcmllcy5mb3JFYWNoKHRyZWFzdXJlID0+IG9wZXJhdG9yW2FjdGlvbl0odHJlYXN1cmUpKVxyXG4gICAgICB0aGlzLnNheShbXHJcbiAgICAgICAgb3BlcmF0b3IudG9TdHJpbmcoKSxcclxuICAgICAgICAnIHRha2VkICcsXHJcbiAgICAgICAgdGhpcy50b1N0cmluZygpXHJcbiAgICAgIF0uam9pbignJykpXHJcblxyXG4gICAgICB0aGlzLmVtaXQoJ3Rha2UnKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJlYXN1cmVcclxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBXYWxsIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1snd2FsbC5wbmcnXSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXYWxsXG4iLCJpbXBvcnQgeyBHcmFwaGljcyB9IGZyb20gJy4uLy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgeyBDQU1FUkEsIENFSUxfU0laRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IEZPRyA9IFN5bWJvbCgnZm9nJylcblxuY2xhc3MgQ2FtZXJhIHtcbiAgY29uc3RydWN0b3IgKHZhbHVlKSB7XG4gICAgdGhpcy50eXBlID0gQ0FNRVJBXG5cbiAgICB0aGlzLnJhZGl1cyA9IHZhbHVlXG4gIH1cblxuICAvLyDmmK/lkKbpnIDnva7mj5tcbiAgaGFzVG9SZXBsYWNlIChvd25lcikge1xuICAgIGxldCBvdGhlciA9IG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdXG4gICAgaWYgKCFvdGhlcikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgLy8g5Y+q5pyD6K6K5aSnXG4gICAgcmV0dXJuIHRoaXMucmFkaXVzID49IG90aGVyLnJhZGl1c1xuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgbGV0IGFiaWxpdHkgPSBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXVxuICAgIGlmIChhYmlsaXR5KSB7XG4gICAgICAvLyByZW1vdmUgcHJlIGZvZ1xuICAgICAgdGhpcy5yZW1vdmVDYW1lcmEob3duZXIpXG4gICAgfVxuICAgIG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdID0gdGhpc1xuXG4gICAgaWYgKG93bmVyLnBhcmVudCkge1xuICAgICAgdGhpcy5zZXR1cChvd25lciwgb3duZXIucGFyZW50KVxuICAgIH0gZWxzZSB7XG4gICAgICBvd25lci5vbmNlKCdhZGRlZCcsIGNvbnRhaW5lciA9PiB0aGlzLnNldHVwKG93bmVyLCBjb250YWluZXIpKVxuICAgIH1cbiAgfVxuXG4gIHNldHVwIChvd25lciwgY29udGFpbmVyKSB7XG4gICAgdmFyIGxpZ2h0YnVsYiA9IG5ldyBHcmFwaGljcygpXG4gICAgdmFyIHJyID0gMHhmZlxuICAgIHZhciByZyA9IDB4ZmZcbiAgICB2YXIgcmIgPSAweGZmXG4gICAgdmFyIHJhZCA9IHRoaXMucmFkaXVzIC8gb3duZXIuc2NhbGUueCAqIENFSUxfU0laRVxuXG4gICAgbGV0IHggPSBvd25lci53aWR0aCAvIDIgLyBvd25lci5zY2FsZS54XG4gICAgbGV0IHkgPSBvd25lci5oZWlnaHQgLyAyIC8gb3duZXIuc2NhbGUueVxuICAgIGxpZ2h0YnVsYi5iZWdpbkZpbGwoKHJyIDw8IDE2KSArIChyZyA8PCA4KSArIHJiLCAxLjApXG4gICAgbGlnaHRidWxiLmRyYXdDaXJjbGUoeCwgeSwgcmFkKVxuICAgIGxpZ2h0YnVsYi5lbmRGaWxsKClcbiAgICBsaWdodGJ1bGIucGFyZW50TGF5ZXIgPSBjb250YWluZXIubGlnaHRpbmcgLy8gbXVzdCBoYXMgcHJvcGVydHk6IGxpZ2h0aW5nXG5cbiAgICBvd25lcltGT0ddID0gbGlnaHRidWxiXG4gICAgb3duZXIuYWRkQ2hpbGQobGlnaHRidWxiKVxuXG4gICAgb3duZXIub25jZSgncmVtb3ZlZCcsICgpID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlQ2FtZXJhKG93bmVyKVxuICAgICAgb3duZXIub25jZSgnYWRkZWQnLCBjb250YWluZXIgPT4gdGhpcy5zZXR1cChvd25lciwgY29udGFpbmVyKSlcbiAgICB9KVxuICB9XG5cbiAgcmVtb3ZlQ2FtZXJhIChvd25lcikge1xuICAgIG93bmVyLnJlbW92ZUNoaWxkKG93bmVyW0ZPR10pXG4gICAgZGVsZXRlIG93bmVyW0ZPR11cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDYW1lcmFcbiIsImltcG9ydCB7IE1PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBNb3ZlIHtcbiAgY29uc3RydWN0b3IgKHZhbHVlKSB7XG4gICAgdGhpcy50eXBlID0gTU9WRVxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgLy8g5piv5ZCm6ZyA572u5o+bXG4gIGhhc1RvUmVwbGFjZSAob3duZXIpIHtcbiAgICBsZXQgb3RoZXIgPSBvd25lci50aWNrQWJpbGl0aWVzW3RoaXMudHlwZV1cbiAgICBpZiAoIW90aGVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICAvLyDlj6rmnIPliqDlv6tcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA+IG90aGVyLnZhbHVlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBvd25lci50aWNrQWJpbGl0aWVzW3RoaXMudHlwZV0gPSB0aGlzXG4gIH1cblxuICAvLyB0aWNrXG4gIHRpY2sgKGRlbHRhLCBvd25lcikge1xuICAgIG93bmVyLnggKz0gb3duZXIuZHggKiB0aGlzLnZhbHVlICogZGVsdGFcbiAgICBvd25lci55ICs9IG93bmVyLmR5ICogdGhpcy52YWx1ZSAqIGRlbHRhXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdtb3ZlIGxldmVsOiAnICsgdGhpcy52YWx1ZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1vdmVcbiIsImltcG9ydCB7IE9QRVJBVEUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBPcGVyYXRlIHtcbiAgY29uc3RydWN0b3IgKHZhbHVlKSB7XG4gICAgdGhpcy50eXBlID0gT1BFUkFURVxuICAgIHRoaXMuc2V0ID0gbmV3IFNldChbdmFsdWVdKVxuICB9XG5cbiAgLy8g5piv5ZCm6ZyA572u5o+bXG4gIGhhc1RvUmVwbGFjZSAob3duZXIpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgbGV0IGFiaWxpdHkgPSBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXVxuICAgIGlmICghYWJpbGl0eSkge1xuICAgICAgLy8gZmlyc3QgZ2V0IG9wZXJhdGUgYWJpbGl0eVxuICAgICAgYWJpbGl0eSA9IHRoaXNcbiAgICAgIG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdID0gYWJpbGl0eVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBzZXQgPSBhYmlsaXR5LnNldFxuICAgIHRoaXMuc2V0LmZvckVhY2goc2V0LmFkZC5iaW5kKHNldCkpXG4gIH1cblxuICB1c2UgKG9wZXJhdG9yLCB0YXJnZXQpIHtcbiAgICBpZiAob3BlcmF0b3IuYWJpbGl0aWVzW3RoaXMudHlwZV0uc2V0Lmhhcyh0YXJnZXQubWFwKSkge1xuICAgICAgb3BlcmF0b3Iuc2F5KG9wZXJhdG9yLnRvU3RyaW5nKCkgKyAnIHVzZSBhYmlsaXR5IHRvIG9wZW4gJyArIHRhcmdldC5tYXApXG4gICAgICB0YXJnZXRbdGhpcy50eXBlXSgpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbJ2tleXM6ICcsIEFycmF5LmZyb20odGhpcy5zZXQpLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0ZVxuIiwiaW1wb3J0IHsgVGV4dCwgVGV4dFN0eWxlLCBsb2FkZXIsIHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbGliL1NjZW5lJ1xyXG5pbXBvcnQgUGxheVNjZW5lIGZyb20gJy4vUGxheVNjZW5lJ1xyXG5cclxubGV0IHRleHQgPSAnbG9hZGluZydcclxuXHJcbmNsYXNzIExvYWRpbmdTY2VuZSBleHRlbmRzIFNjZW5lIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5saWZlID0gMFxyXG4gIH1cclxuXHJcbiAgY3JlYXRlICgpIHtcclxuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xyXG4gICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxyXG4gICAgICBmb250U2l6ZTogMzYsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHN0cm9rZTogJyNmZjMzMDAnLFxyXG4gICAgICBzdHJva2VUaGlja25lc3M6IDQsXHJcbiAgICAgIGRyb3BTaGFkb3c6IHRydWUsXHJcbiAgICAgIGRyb3BTaGFkb3dDb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICBkcm9wU2hhZG93Qmx1cjogNCxcclxuICAgICAgZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcclxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlOiA2XHJcbiAgICB9KVxyXG4gICAgdGhpcy50ZXh0TG9hZGluZyA9IG5ldyBUZXh0KHRleHQsIHN0eWxlKVxyXG5cclxuICAgIC8vIEFkZCB0aGUgY2F0IHRvIHRoZSBzdGFnZVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRleHRMb2FkaW5nKVxyXG5cclxuICAgIC8vIGxvYWQgYW4gaW1hZ2UgYW5kIHJ1biB0aGUgYHNldHVwYCBmdW5jdGlvbiB3aGVuIGl0J3MgZG9uZVxyXG4gICAgbG9hZGVyXHJcbiAgICAgIC5hZGQoJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nKVxyXG4gICAgICAubG9hZCgoKSA9PiB0aGlzLmVtaXQoJ2NoYW5nZVNjZW5lJywgUGxheVNjZW5lLCB7XHJcbiAgICAgICAgbWFwOiAnRTBOMCcsXHJcbiAgICAgICAgcG9zaXRpb246IFsxLCAxXVxyXG4gICAgICB9KSlcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICB0aGlzLmxpZmUgKz0gZGVsdGEgLyAzMCAvLyBibGVuZCBzcGVlZFxyXG4gICAgdGhpcy50ZXh0TG9hZGluZy50ZXh0ID0gdGV4dCArIEFycmF5KE1hdGguZmxvb3IodGhpcy5saWZlKSAlIDQgKyAxKS5qb2luKCcuJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExvYWRpbmdTY2VuZVxyXG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUsIGxvYWRlciwgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9saWIvU2NlbmUnXHJcbmltcG9ydCBNYXAgZnJvbSAnLi4vbGliL01hcCdcclxuaW1wb3J0IE1lc3NhZ2VzIGZyb20gJy4uL2xpYi9NZXNzYWdlcydcclxuXHJcbmltcG9ydCBDYXQgZnJvbSAnLi4vb2JqZWN0cy9DYXQnXHJcbmltcG9ydCBNb3ZlIGZyb20gJy4uL29iamVjdHMvc2xvdHMvTW92ZSdcclxuaW1wb3J0IE9wZXJhdGUgZnJvbSAnLi4vb2JqZWN0cy9zbG90cy9PcGVyYXRlJ1xyXG5cclxuY2xhc3MgUGxheVNjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yICh7IG1hcCwgcGxheWVyLCBwb3NpdGlvbiB9KSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmlzTG9hZGVkID0gZmFsc2VcclxuICAgIHRoaXMuY2F0ID0gcGxheWVyXHJcblxyXG4gICAgdGhpcy5tYXBGaWxlID0gJ3dvcmxkLycgKyBtYXBcclxuICAgIHRoaXMudG9Qb3NpdGlvbiA9IHBvc2l0aW9uXHJcbiAgfVxyXG5cclxuICBjcmVhdGUgKCkge1xyXG4gICAgbGV0IGZpbGVOYW1lID0gdGhpcy5tYXBGaWxlXHJcblxyXG4gICAgLy8gaWYgbWFwIG5vdCBsb2FkZWQgeWV0XHJcbiAgICBpZiAoIXJlc291cmNlc1tmaWxlTmFtZV0pIHtcclxuICAgICAgbG9hZGVyXHJcbiAgICAgICAgLmFkZChmaWxlTmFtZSwgZmlsZU5hbWUgKyAnLmpzb24nKVxyXG4gICAgICAgIC5sb2FkKHRoaXMub25Mb2FkZWQuYmluZCh0aGlzKSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMub25Mb2FkZWQoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25Mb2FkZWQgKCkge1xyXG4gICAgLy8gaW5pdCB2aWV3IHNpemVcclxuICAgIC8vIGxldCBzaWRlTGVuZ3RoID0gTWF0aC5taW4odGhpcy5wYXJlbnQud2lkdGgsIHRoaXMucGFyZW50LmhlaWdodClcclxuICAgIC8vIGxldCBzY2FsZSA9IHNpZGVMZW5ndGggLyBDRUlMX1NJWkUgLyAxMFxyXG4gICAgLy8gdGhpcy5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlKVxyXG5cclxuICAgIHRoaXMuY29sbGlkZU9iamVjdHMgPSBbXVxyXG4gICAgdGhpcy5yZXBseU9iamVjdHMgPSBbXVxyXG5cclxuICAgIGlmICghdGhpcy5jYXQpIHtcclxuICAgICAgdGhpcy5jYXQgPSBuZXcgQ2F0KClcclxuICAgICAgdGhpcy5jYXQudGFrZUFiaWxpdHkobmV3IE1vdmUoMSkpXHJcbiAgICAgIHRoaXMuY2F0LnRha2VBYmlsaXR5KG5ldyBPcGVyYXRlKCdFME4wJykpXHJcbiAgICAgIC8vIHRoaXMuY2F0LnRha2VBYmlsaXR5KG5ldyBDYW1lcmEoMTYpKVxyXG4gICAgICB0aGlzLmNhdC53aWR0aCA9IDEwXHJcbiAgICAgIHRoaXMuY2F0LmhlaWdodCA9IDEwXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zcGF3bk1hcChyZXNvdXJjZXNbdGhpcy5tYXBGaWxlXS5kYXRhKVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLm1hcClcclxuICAgIHRoaXMubWFwLmFkZFBsYXllcih0aGlzLmNhdCwgdGhpcy50b1Bvc2l0aW9uKVxyXG5cclxuICAgIHRoaXMudGlwVGV4dCgpXHJcblxyXG4gICAgdGhpcy5pc0xvYWRlZCA9IHRydWVcclxuICB9XHJcblxyXG4gIHNwYXduTWFwIChtYXBEYXRhKSB7XHJcbiAgICBsZXQgbWFwID0gbmV3IE1hcCgpXHJcbiAgICBtYXAubG9hZChtYXBEYXRhKVxyXG5cclxuICAgIG1hcC5vbigndXNlJywgbyA9PiB7XHJcbiAgICAgIC8vIHRpcCB0ZXh0XHJcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlU2NlbmUnLCBQbGF5U2NlbmUsIHtcclxuICAgICAgICBtYXA6IG8ubWFwLFxyXG4gICAgICAgIHBsYXllcjogdGhpcy5jYXQsXHJcbiAgICAgICAgcG9zaXRpb246IG8udG9Qb3NpdGlvblxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLm1hcCA9IG1hcFxyXG4gIH1cclxuXHJcbiAgdGlwVGV4dCAoKSB7XHJcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcclxuICAgICAgZm9udFNpemU6IDEyLFxyXG4gICAgICBmaWxsOiAnd2hpdGUnXHJcbiAgICB9KVxyXG4gICAgdGhpcy50ZXh0ID0gbmV3IFRleHQoJycsIHN0eWxlKVxyXG4gICAgdGhpcy50ZXh0LnggPSAxMDBcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGV4dClcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNMb2FkZWQpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcC50aWNrKGRlbHRhKVxyXG4gICAgdGhpcy50ZXh0LnRleHQgPSBNZXNzYWdlcy5nZXRMaXN0KCkuam9pbignJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYXlTY2VuZVxyXG4iXX0=
