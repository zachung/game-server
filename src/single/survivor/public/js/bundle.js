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

},{"./lib/Application":4,"./scenes/LoadingScene":20}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

var CEIL_SIZE = 16;

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
    return _this;
  }

  _createClass(Map, [{
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

      items.forEach(function (item, i) {
        var o = (0, _utils.instanceByItemId)(item.Type, item.params);
        o.position.set(item.pos[0] * CEIL_SIZE, item.pos[1] * CEIL_SIZE);
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
    value: function addPlayer(player) {
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

var _constants = require('../../config/constants');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Camera = function () {
  function Camera(params) {
    _classCallCheck(this, Camera);

    this.type = _constants.CAMERA;

    this.x = params[0];
    this.y = params[1];
    this.width = params[2];
    this.height = params[3];
  }

  // 是否需置換


  _createClass(Camera, [{
    key: 'hasToReplace',
    value: function hasToReplace(owner) {
      var other = owner.tickAbilities[this.type];
      if (!other) {
        return true;
      }
      // 只會變大
      return this.width >= other.width && this.height >= other.height;
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
    value: function tick(delta, owner, map) {
      owner.x += owner.dx * this.value * delta;
      owner.y += owner.dy * this.value * delta;
    }
  }]);

  return Camera;
}();

exports.default = Camera;

},{"../../config/constants":2}],18:[function(require,module,exports){
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

      this.collideObjects = [];
      this.replyObjects = [];

      if (!this.cat) {
        this.cat = new _Cat2.default();
        this.cat.takeAbility(new _Move2.default(1));
        this.cat.takeAbility(new _Operate2.default('E0N0'));
        this.cat.width = 10;
        this.cat.height = 10;
      }
      this.cat.position.set(this.toPosition[0] * CEIL_SIZE, this.toPosition[1] * CEIL_SIZE);

      this.spawnMap(_PIXI.resources[this.mapFile].data);
      this.map.addPlayer(this.cat);
      this.addChild(this.map);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbmZpZy9jb25zdGFudHMuanMiLCJzcmMva2V5Ym9hcmQuanMiLCJzcmMvbGliL0FwcGxpY2F0aW9uLmpzIiwic3JjL2xpYi9CdW1wLmpzIiwic3JjL2xpYi9NYXAuanMiLCJzcmMvbGliL01lc3NhZ2VzLmpzIiwic3JjL2xpYi9QSVhJLmpzIiwic3JjL2xpYi9TY2VuZS5qcyIsInNyYy9saWIvdXRpbHMuanMiLCJzcmMvb2JqZWN0cy9DYXQuanMiLCJzcmMvb2JqZWN0cy9Eb29yLmpzIiwic3JjL29iamVjdHMvR2FtZU9iamVjdC5qcyIsInNyYy9vYmplY3RzL0dyYXNzLmpzIiwic3JjL29iamVjdHMvVHJlYXN1cmUuanMiLCJzcmMvb2JqZWN0cy9XYWxsLmpzIiwic3JjL29iamVjdHMvc2xvdHMvQ2FtZXJhLmpzIiwic3JjL29iamVjdHMvc2xvdHMvTW92ZS5qcyIsInNyYy9vYmplY3RzL3Nsb3RzL09wZXJhdGUuanMiLCJzcmMvc2NlbmVzL0xvYWRpbmdTY2VuZS5qcyIsInNyYy9zY2VuZXMvUGxheVNjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFBLGVBQUEsUUFBQSxtQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxnQkFBQSxRQUFBLHVCQUFBLENBQUE7Ozs7Ozs7O0FBRUE7QUFDQSxJQUFJLE1BQU0sSUFBSSxjQUFKLE9BQUEsQ0FBZ0I7QUFDeEIsU0FEd0IsR0FBQTtBQUV4QixVQUZ3QixHQUFBO0FBR3hCLGFBSHdCLElBQUE7QUFJeEIsZUFKd0IsS0FBQTtBQUt4QixjQUx3QixDQUFBO0FBTXhCLGFBQVc7QUFOYSxDQUFoQixDQUFWOztBQVNBLElBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLFVBQUE7QUFDQSxJQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FB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ZCxHQUFBOztBQUVBLFdBQUEsT0FBQTs7QUFFQSxXQUFBLFFBQUEsR0FBQSxJQUFBO0FBQ0Q7Ozs2QkFFUyxPLEVBQVM7QUFBQSxVQUFBLFNBQUEsSUFBQTs7QUFDakIsVUFBSSxNQUFNLElBQUksTUFBZCxPQUFVLEVBQVY7QUFDQSxVQUFBLElBQUEsQ0FBQSxPQUFBOztBQUVBLFVBQUEsRUFBQSxDQUFBLEtBQUEsRUFBYyxVQUFBLENBQUEsRUFBSztBQUNqQjtBQUNBLGVBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxTQUFBLEVBQW9DO0FBQ2xDLGVBQUssRUFENkIsR0FBQTtBQUVsQyxrQkFBUSxPQUYwQixHQUFBO0FBR2xDLG9CQUFVLEVBQUU7QUFIc0IsU0FBcEM7QUFGRixPQUFBOztBQVNBLFdBQUEsR0FBQSxHQUFBLEdBQUE7QUFDRDs7OzhCQUVVO0FBQ1QsVUFBSSxRQUFRLElBQUksTUFBSixTQUFBLENBQWM7QUFDeEIsa0JBRHdCLEVBQUE7QUFFeEIsY0FBTTtBQUZrQixPQUFkLENBQVo7QUFJQSxXQUFBLElBQUEsR0FBWSxJQUFJLE1BQUosSUFBQSxDQUFBLEVBQUEsRUFBWixLQUFZLENBQVo7QUFDQSxXQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQTs7QUFFQSxXQUFBLFFBQUEsQ0FBYyxLQUFkLElBQUE7QUFDRDs7O3lCQUVLLEssRUFBTztBQUNYLFVBQUksQ0FBQyxLQUFMLFFBQUEsRUFBb0I7QUFDbEI7QUFDRDtBQUNELFdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0EsV0FBQSxJQUFBLENBQUEsSUFBQSxHQUFpQixXQUFBLE9BQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFqQixFQUFpQixDQUFqQjtBQUNEOzs7O0VBdEZxQixRQUFBLE87O2tCQXlGVCxTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4vbGliL0FwcGxpY2F0aW9uJ1xuaW1wb3J0IExvYWRpbmdTY2VuZSBmcm9tICcuL3NjZW5lcy9Mb2FkaW5nU2NlbmUnXG5cbi8vIENyZWF0ZSBhIFBpeGkgQXBwbGljYXRpb25cbmxldCBhcHAgPSBuZXcgQXBwbGljYXRpb24oe1xuICB3aWR0aDogMjU2LFxuICBoZWlnaHQ6IDI1NixcbiAgYW50aWFsaWFzOiB0cnVlLFxuICB0cmFuc3BhcmVudDogZmFsc2UsXG4gIHJlc29sdXRpb246IDEsXG4gIGF1dG9TdGFydDogZmFsc2Vcbn0pXG5cbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuYXBwLnJlbmRlcmVyLnZpZXcuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbmFwcC5yZW5kZXJlci5hdXRvUmVzaXplID0gdHJ1ZVxuYXBwLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXG4vLyBBZGQgdGhlIGNhbnZhcyB0aGF0IFBpeGkgYXV0b21hdGljYWxseSBjcmVhdGVkIGZvciB5b3UgdG8gdGhlIEhUTUwgZG9jdW1lbnRcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpXG5cbmFwcC5zdGFydCgpXG5hcHAuY2hhbmdlU2NlbmUoTG9hZGluZ1NjZW5lKVxuIiwiZXhwb3J0IGNvbnN0IE1PVkUgPSAnbW92ZSdcbmV4cG9ydCBjb25zdCBDQU1FUkEgPSAnY2FtZXJhJ1xuZXhwb3J0IGNvbnN0IE9QRVJBVEUgPSBTeW1ib2woJ29wZXJhdGUnKVxuZXhwb3J0IGNvbnN0IFNMT1RQQVJUU19BTEwgPSBbXG4gIE1PVkUsIENBTUVSQSwgT1BFUkFURVxuXVxuXG4vLyBvYmplY3QgdHlwZSwgc3RhdGljIG9iamVjdCwgbm90IGNvbGxpZGUgd2l0aFxuZXhwb3J0IGNvbnN0IFNUQVRJQyA9ICdzdGF0aWMnXG4vLyBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFZID0gJ3N0YXknXG4vLyB0b3VjaCB3aWxsIHJlcGx5XG5leHBvcnQgY29uc3QgUkVQTFkgPSAncmVwbHknXG4iLCJleHBvcnQgZGVmYXVsdCBrZXlDb2RlID0+IHtcbiAgbGV0IGtleSA9IHt9XG4gIGtleS5jb2RlID0ga2V5Q29kZVxuICBrZXkuaXNEb3duID0gZmFsc2VcbiAga2V5LmlzVXAgPSB0cnVlXG4gIGtleS5wcmVzcyA9IHVuZGVmaW5lZFxuICBrZXkucmVsZWFzZSA9IHVuZGVmaW5lZFxuICAvLyBUaGUgYGRvd25IYW5kbGVyYFxuICBrZXkuZG93bkhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XG4gICAgICBpZiAoa2V5LmlzVXAgJiYga2V5LnByZXNzKSBrZXkucHJlc3MoKVxuICAgICAga2V5LmlzRG93biA9IHRydWVcbiAgICAgIGtleS5pc1VwID0gZmFsc2VcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgLy8gVGhlIGB1cEhhbmRsZXJgXG4gIGtleS51cEhhbmRsZXIgPSBldmVudCA9PiB7XG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XG4gICAgICBpZiAoa2V5LmlzRG93biAmJiBrZXkucmVsZWFzZSkga2V5LnJlbGVhc2UoKVxuICAgICAga2V5LmlzRG93biA9IGZhbHNlXG4gICAgICBrZXkuaXNVcCA9IHRydWVcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgLy8gQXR0YWNoIGV2ZW50IGxpc3RlbmVyc1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAna2V5ZG93bicsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXG4gIClcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgJ2tleXVwJywga2V5LnVwSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXG4gIClcbiAgcmV0dXJuIGtleVxufVxuIiwiaW1wb3J0IHsgQXBwbGljYXRpb24gYXMgUGl4aUFwcGxpY2F0aW9uLCBHcmFwaGljcyB9IGZyb20gJy4vUElYSSdcblxuY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBQaXhpQXBwbGljYXRpb24ge1xuICBjaGFuZ2VTY2VuZSAoU2NlbmVOYW1lLCBwYXJhbXMpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50U2NlbmUpIHtcbiAgICAgIC8vIG1heWJlIHVzZSBwcm9taXNlIGZvciBhbmltYXRpb25cbiAgICAgIC8vIHJlbW92ZSBnYW1lbG9vcD9cbiAgICAgIHRoaXMuY3VycmVudFNjZW5lLmRlc3Ryb3koKVxuICAgICAgdGhpcy5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLmN1cnJlbnRTY2VuZSlcbiAgICB9XG5cbiAgICBsZXQgc2NlbmUgPSBuZXcgU2NlbmVOYW1lKHBhcmFtcylcbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKHNjZW5lKVxuICAgIHNjZW5lLmNyZWF0ZSgpXG4gICAgc2NlbmUub24oJ2NoYW5nZVNjZW5lJywgdGhpcy5jaGFuZ2VTY2VuZS5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5jdXJyZW50U2NlbmUgPSBzY2VuZVxuICB9XG5cbiAgc3RhcnQgKC4uLmFyZ3MpIHtcbiAgICBzdXBlci5zdGFydCguLi5hcmdzKVxuXG4gICAgLy8gY3JlYXRlIGEgYmFja2dyb3VuZCBtYWtlIHN0YWdlIGhhcyB3aWR0aCAmIGhlaWdodFxuICAgIGxldCB2aWV3ID0gdGhpcy5yZW5kZXJlci52aWV3XG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChcbiAgICAgIG5ldyBHcmFwaGljcygpLmRyYXdSZWN0KDAsIDAsIHZpZXcud2lkdGgsIHZpZXcuaGVpZ2h0KVxuICAgIClcblxuICAgIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgICB0aGlzLnRpY2tlci5hZGQoZGVsdGEgPT4gdGhpcy5nYW1lTG9vcC5iaW5kKHRoaXMpKGRlbHRhKSlcbiAgfVxuXG4gIGdhbWVMb29wIChkZWx0YSkge1xuICAgIC8vIFVwZGF0ZSB0aGUgY3VycmVudCBnYW1lIHN0YXRlOlxuICAgIHRoaXMuY3VycmVudFNjZW5lLnRpY2soZGVsdGEpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwbGljYXRpb25cbiIsIi8qIGdsb2JhbCBQSVhJLCBCdW1wICovXG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBCdW1wKFBJWEkpXG4iLCJpbXBvcnQgeyBDb250YWluZXIgfSBmcm9tICcuL1BJWEknXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IHsgaW5zdGFuY2VCeUl0ZW1JZCB9IGZyb20gJy4vdXRpbHMnXG5pbXBvcnQgYnVtcCBmcm9tICcuLi9saWIvQnVtcCdcblxuY29uc3QgQ0VJTF9TSVpFID0gMTZcblxuLyoqXG4gKiBldmVudHM6XG4gKiAgdXNlOiBvYmplY3RcbiAqL1xuY2xhc3MgTWFwIGV4dGVuZHMgQ29udGFpbmVyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmNvbGxpZGVPYmplY3RzID0gW11cbiAgICB0aGlzLnJlcGx5T2JqZWN0cyA9IFtdXG4gIH1cblxuICBsb2FkIChtYXBEYXRhKSB7XG4gICAgbGV0IHRpbGVzID0gbWFwRGF0YS50aWxlc1xuICAgIGxldCBjb2xzID0gbWFwRGF0YS5jb2xzXG4gICAgbGV0IHJvd3MgPSBtYXBEYXRhLnJvd3NcbiAgICBsZXQgaXRlbXMgPSBtYXBEYXRhLml0ZW1zXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHM7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dzOyBqKyspIHtcbiAgICAgICAgbGV0IGlkID0gdGlsZXNbaiAqIGNvbHMgKyBpXVxuICAgICAgICBsZXQgbyA9IGluc3RhbmNlQnlJdGVtSWQoaWQpXG4gICAgICAgIG8ucG9zaXRpb24uc2V0KGkgKiBDRUlMX1NJWkUsIGogKiBDRUlMX1NJWkUpXG4gICAgICAgIHN3aXRjaCAoby50eXBlKSB7XG4gICAgICAgICAgY2FzZSBTVEFZOlxuICAgICAgICAgICAgLy8g6Z2c5oWL54mp5Lu2XG4gICAgICAgICAgICB0aGlzLmNvbGxpZGVPYmplY3RzLnB1c2gobylcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hZGRDaGlsZChvKVxuICAgICAgfVxuICAgIH1cblxuICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgIGxldCBvID0gaW5zdGFuY2VCeUl0ZW1JZChpdGVtLlR5cGUsIGl0ZW0ucGFyYW1zKVxuICAgICAgby5wb3NpdGlvbi5zZXQoaXRlbS5wb3NbMF0gKiBDRUlMX1NJWkUsIGl0ZW0ucG9zWzFdICogQ0VJTF9TSVpFKVxuICAgICAgc3dpdGNoIChvLnR5cGUpIHtcbiAgICAgICAgY2FzZSBTVEFZOlxuICAgICAgICAgIC8vIOmdnOaFi+eJqeS7tlxuICAgICAgICAgIHRoaXMuY29sbGlkZU9iamVjdHMucHVzaChvKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5yZXBseU9iamVjdHMucHVzaChvKVxuICAgICAgfVxuICAgICAgby5vbigndGFrZScsICgpID0+IHtcbiAgICAgICAgLy8gZGVzdHJveSB0cmVhc3VyZVxuICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKG8pXG4gICAgICAgIG8uZGVzdHJveSgpXG4gICAgICAgIGxldCBpbnggPSB0aGlzLnJlcGx5T2JqZWN0cy5pbmRleE9mKG8pXG4gICAgICAgIHRoaXMucmVwbHlPYmplY3RzLnNwbGljZShpbngsIDEpXG5cbiAgICAgICAgLy8gcmVtb3ZlIGl0ZW0gZnJvbSB0aGUgbWFwXG4gICAgICAgIGRlbGV0ZSBpdGVtc1tpXVxuICAgICAgfSlcbiAgICAgIG8ub24oJ3VzZScsICgpID0+IHRoaXMuZW1pdCgndXNlJywgbykpXG4gICAgICB0aGlzLmFkZENoaWxkKG8pXG4gICAgfSlcbiAgfVxuXG4gIGFkZFBsYXllciAocGxheWVyKSB7XG4gICAgdGhpcy5hZGRDaGlsZChwbGF5ZXIpXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXJcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgdGhpcy5wbGF5ZXIudGljayhkZWx0YSlcblxuICAgIC8vIGNvbGxpZGUgZGV0ZWN0XG4gICAgdGhpcy5jb2xsaWRlT2JqZWN0cy5mb3JFYWNoKG8gPT4ge1xuICAgICAgaWYgKGJ1bXAucmVjdGFuZ2xlQ29sbGlzaW9uKHRoaXMucGxheWVyLCBvLCB0cnVlKSkge1xuICAgICAgICBvLmVtaXQoJ2NvbGxpZGUnLCB0aGlzLnBsYXllcilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5yZXBseU9iamVjdHMuZm9yRWFjaChvID0+IHtcbiAgICAgIGlmIChidW1wLmhpdFRlc3RSZWN0YW5nbGUodGhpcy5wbGF5ZXIsIG8pKSB7XG4gICAgICAgIG8uZW1pdCgnY29sbGlkZScsIHRoaXMucGxheWVyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFwXG4iLCJjb25zdCBtZXNzYWdlcyA9IFtdXG5jb25zdCBNU0dfS0VFUF9NUyA9IDEwMDBcblxuY2xhc3MgTWVzc2FnZXMge1xuICBzdGF0aWMgZ2V0TGlzdCAoKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2VzXG4gIH1cblxuICBzdGF0aWMgYWRkIChtc2cpIHtcbiAgICBtZXNzYWdlcy5wdXNoKG1zZylcbiAgICBzZXRUaW1lb3V0KG1lc3NhZ2VzLnBvcC5iaW5kKG1lc3NhZ2VzKSwgTVNHX0tFRVBfTVMpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZXNcbiIsIi8qIGdsb2JhbCBQSVhJICovXG5cbmV4cG9ydCBjb25zdCBBcHBsaWNhdGlvbiA9IFBJWEkuQXBwbGljYXRpb25cbmV4cG9ydCBjb25zdCBDb250YWluZXIgPSBQSVhJLkNvbnRhaW5lclxuZXhwb3J0IGNvbnN0IGxvYWRlciA9IFBJWEkubG9hZGVyXG5leHBvcnQgY29uc3QgcmVzb3VyY2VzID0gUElYSS5sb2FkZXIucmVzb3VyY2VzXG5leHBvcnQgY29uc3QgU3ByaXRlID0gUElYSS5TcHJpdGVcbmV4cG9ydCBjb25zdCBUZXh0ID0gUElYSS5UZXh0XG5leHBvcnQgY29uc3QgVGV4dFN0eWxlID0gUElYSS5UZXh0U3R5bGVcblxuZXhwb3J0IGNvbnN0IEdyYXBoaWNzID0gUElYSS5HcmFwaGljc1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyIH0gZnJvbSAnLi9QSVhJJ1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNyZWF0ZSAoKSB7fVxuXG4gIGRlc3Ryb3kgKCkge31cblxuICB0aWNrIChkZWx0YSkge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVcbiIsImltcG9ydCBXIGZyb20gJy4uL29iamVjdHMvV2FsbCdcclxuaW1wb3J0IEcgZnJvbSAnLi4vb2JqZWN0cy9HcmFzcydcclxuaW1wb3J0IFQgZnJvbSAnLi4vb2JqZWN0cy9UcmVhc3VyZSdcclxuaW1wb3J0IEQgZnJvbSAnLi4vb2JqZWN0cy9Eb29yJ1xyXG5cclxuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9zbG90cy9Nb3ZlJ1xyXG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4uL29iamVjdHMvc2xvdHMvQ2FtZXJhJ1xyXG5pbXBvcnQgT3BlcmF0ZSBmcm9tICcuLi9vYmplY3RzL3Nsb3RzL09wZXJhdGUnXHJcblxyXG5jb25zdCBJdGVtcyA9IFtcclxuICBHLCBXLCBULCBEXHJcbl1cclxuXHJcbmNvbnN0IFNsb3RzID0gW1xyXG4gIE1vdmUsIENhbWVyYSwgT3BlcmF0ZVxyXG5dXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFuY2VCeUl0ZW1JZCAoaXRlbUlkLCBwYXJhbXMpIHtcclxuICByZXR1cm4gbmV3IEl0ZW1zW2l0ZW1JZF0ocGFyYW1zKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFuY2VCeVNsb3RJZCAoc2xvdElkLCBwYXJhbXMpIHtcclxuICByZXR1cm4gbmV3IFNsb3RzW3Nsb3RJZF0ocGFyYW1zKVxyXG59XHJcbiIsImltcG9ydCB7IHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuaW1wb3J0IGtleWJvYXJkIGZyb20gJy4uL2tleWJvYXJkJ1xuXG5jbGFzcyBDYXQgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWyd3YWxsLnBuZyddKVxuXG4gICAgLy8gQ2hhbmdlIHRoZSBzcHJpdGUncyBwb3NpdGlvblxuICAgIHRoaXMuZHggPSAwXG4gICAgdGhpcy5keSA9IDBcblxuICAgIHRoaXMuaW5pdCgpXG4gICAgdGhpcy50aWNrQWJpbGl0aWVzID0ge31cbiAgICB0aGlzLmFiaWxpdGllcyA9IHt9XG4gIH1cblxuICB0YWtlQWJpbGl0eSAoYWJpbGl0eSkge1xuICAgIGlmIChhYmlsaXR5Lmhhc1RvUmVwbGFjZSh0aGlzKSkge1xuICAgICAgYWJpbGl0eS5jYXJyeUJ5KHRoaXMpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnY2F0J1xuICB9XG5cbiAgaW5pdCAoKSB7XG4gICAgLy8gQ2FwdHVyZSB0aGUga2V5Ym9hcmQgYXJyb3cga2V5c1xuICAgIGxldCBsZWZ0ID0ga2V5Ym9hcmQoNjUpXG4gICAgbGV0IHVwID0ga2V5Ym9hcmQoODcpXG4gICAgbGV0IHJpZ2h0ID0ga2V5Ym9hcmQoNjgpXG4gICAgbGV0IGRvd24gPSBrZXlib2FyZCg4MylcblxuICAgIC8vIExlZnRcbiAgICBsZWZ0LnByZXNzID0gKCkgPT4ge1xuICAgICAgdGhpcy5keCA9IC0xXG4gICAgICB0aGlzLmR5ID0gMFxuICAgIH1cbiAgICBsZWZ0LnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoIXJpZ2h0LmlzRG93biAmJiB0aGlzLmR5ID09PSAwKSB7XG4gICAgICAgIHRoaXMuZHggPSAwXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVXBcbiAgICB1cC5wcmVzcyA9ICgpID0+IHtcbiAgICAgIHRoaXMuZHkgPSAtMVxuICAgICAgdGhpcy5keCA9IDBcbiAgICB9XG4gICAgdXAucmVsZWFzZSA9ICgpID0+IHtcbiAgICAgIGlmICghZG93bi5pc0Rvd24gJiYgdGhpcy5keCA9PT0gMCkge1xuICAgICAgICB0aGlzLmR5ID0gMFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJpZ2h0XG4gICAgcmlnaHQucHJlc3MgPSAoKSA9PiB7XG4gICAgICB0aGlzLmR4ID0gMVxuICAgICAgdGhpcy5keSA9IDBcbiAgICB9XG4gICAgcmlnaHQucmVsZWFzZSA9ICgpID0+IHtcbiAgICAgIGlmICghbGVmdC5pc0Rvd24gJiYgdGhpcy5keSA9PT0gMCkge1xuICAgICAgICB0aGlzLmR4ID0gMFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERvd25cbiAgICBkb3duLnByZXNzID0gKCkgPT4ge1xuICAgICAgdGhpcy5keSA9IDFcbiAgICAgIHRoaXMuZHggPSAwXG4gICAgfVxuICAgIGRvd24ucmVsZWFzZSA9ICgpID0+IHtcbiAgICAgIGlmICghdXAuaXNEb3duICYmIHRoaXMuZHggPT09IDApIHtcbiAgICAgICAgdGhpcy5keSA9IDBcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aWNrIChkZWx0YSkge1xuICAgIE9iamVjdC52YWx1ZXModGhpcy50aWNrQWJpbGl0aWVzKS5mb3JFYWNoKGFiaWxpdHkgPT4gYWJpbGl0eS50aWNrKGRlbHRhLCB0aGlzKSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDYXRcbiIsImltcG9ydCB7IHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXHJcblxyXG5pbXBvcnQgeyBTVEFZLCBPUEVSQVRFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIERvb3IgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAobWFwKSB7XHJcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcclxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWydkb29yLnBuZyddKVxyXG5cclxuICAgIHRoaXMubWFwID0gbWFwWzBdXHJcbiAgICB0aGlzLnRvUG9zaXRpb24gPSBtYXBbMV1cclxuXHJcbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cclxuXHJcbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcclxuICAgIGxldCBhYmlsaXR5ID0gb3BlcmF0b3IuYWJpbGl0aWVzW09QRVJBVEVdXHJcbiAgICBpZiAoIWFiaWxpdHkpIHtcclxuICAgICAgdGhpcy5zYXkoW1xyXG4gICAgICAgIG9wZXJhdG9yLnRvU3RyaW5nKCksXHJcbiAgICAgICAgJyBkb3NlblxcJ3QgaGFzIGFiaWxpdHkgdG8gdXNlIHRoaXMgZG9vciAnLFxyXG4gICAgICAgIHRoaXMubWFwLFxyXG4gICAgICAgICcuJ1xyXG4gICAgICBdLmpvaW4oJycpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWJpbGl0eS51c2Uob3BlcmF0b3IsIHRoaXMpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBbT1BFUkFURV0gKCkge1xyXG4gICAgdGhpcy5zYXkoWydHZXQgaW4gJywgdGhpcy5tYXAsICcgbm93LiddLmpvaW4oJycpKVxyXG4gICAgdGhpcy5lbWl0KCd1c2UnKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG9vclxyXG4iLCJpbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgTWVzc2FnZXMgZnJvbSAnLi4vbGliL01lc3NhZ2VzJ1xuXG5jbGFzcyBHYW1lT2JqZWN0IGV4dGVuZHMgU3ByaXRlIHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbiAgc2F5IChtc2cpIHtcbiAgICBNZXNzYWdlcy5hZGQobXNnKVxuICAgIGNvbnNvbGUubG9nKG1zZylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYW1lT2JqZWN0XG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR3Jhc3MgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWydncmFzcy5wbmcnXSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyYXNzXG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgUkVQTFkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBpbnN0YW5jZUJ5U2xvdElkIH0gZnJvbSAnLi4vbGliL3V0aWxzJ1xyXG5cclxuY2xhc3MgVHJlYXN1cmUgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAoaW52ZW50b3JpZXMgPSBbXSkge1xyXG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXHJcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1sndHJlYXN1cmUucG5nJ10pXHJcblxyXG4gICAgdGhpcy5pbnZlbnRvcmllcyA9IGludmVudG9yaWVzLm1hcChjb25mID0+IHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlQnlTbG90SWQoY29uZlswXSwgY29uZlsxXSlcclxuICAgIH0pXHJcblxyXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgJ3RyZWFzdXJlOiBbJyxcclxuICAgICAgdGhpcy5pbnZlbnRvcmllcy5qb2luKCcsICcpLFxyXG4gICAgICAnXSdcclxuICAgIF0uam9pbignJylcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFJFUExZIH1cclxuXHJcbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IsIGFjdGlvbiA9ICd0YWtlQWJpbGl0eScpIHtcclxuICAgIC8vIEZJWE1FOiDmmqvmmYLnlKjpoJDoqK3lj4PmlbggdGFrZUFiaWxpdHlcclxuICAgIGlmICh0eXBlb2Ygb3BlcmF0b3JbYWN0aW9uXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLmludmVudG9yaWVzLmZvckVhY2godHJlYXN1cmUgPT4gb3BlcmF0b3JbYWN0aW9uXSh0cmVhc3VyZSkpXHJcbiAgICAgIHRoaXMuc2F5KFtcclxuICAgICAgICBvcGVyYXRvci50b1N0cmluZygpLFxyXG4gICAgICAgICcgdGFrZWQgJyxcclxuICAgICAgICB0aGlzLnRvU3RyaW5nKClcclxuICAgICAgXS5qb2luKCcnKSlcclxuXHJcbiAgICAgIHRoaXMuZW1pdCgndGFrZScpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmVhc3VyZVxyXG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFdhbGwgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWyd3YWxsLnBuZyddKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdhbGxcbiIsImltcG9ydCB7IENBTUVSQSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIENhbWVyYSB7XG4gIGNvbnN0cnVjdG9yIChwYXJhbXMpIHtcbiAgICB0aGlzLnR5cGUgPSBDQU1FUkFcblxuICAgIHRoaXMueCA9IHBhcmFtc1swXVxuICAgIHRoaXMueSA9IHBhcmFtc1sxXVxuICAgIHRoaXMud2lkdGggPSBwYXJhbXNbMl1cbiAgICB0aGlzLmhlaWdodCA9IHBhcmFtc1szXVxuICB9XG5cbiAgLy8g5piv5ZCm6ZyA572u5o+bXG4gIGhhc1RvUmVwbGFjZSAob3duZXIpIHtcbiAgICBsZXQgb3RoZXIgPSBvd25lci50aWNrQWJpbGl0aWVzW3RoaXMudHlwZV1cbiAgICBpZiAoIW90aGVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICAvLyDlj6rmnIPororlpKdcbiAgICByZXR1cm4gdGhpcy53aWR0aCA+PSBvdGhlci53aWR0aCAmJiB0aGlzLmhlaWdodCA+PSBvdGhlci5oZWlnaHRcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIG93bmVyLnRpY2tBYmlsaXRpZXNbdGhpcy50eXBlXSA9IHRoaXNcbiAgfVxuXG4gIC8vIHRpY2tcbiAgdGljayAoZGVsdGEsIG93bmVyLCBtYXApIHtcbiAgICBvd25lci54ICs9IG93bmVyLmR4ICogdGhpcy52YWx1ZSAqIGRlbHRhXG4gICAgb3duZXIueSArPSBvd25lci5keSAqIHRoaXMudmFsdWUgKiBkZWx0YVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhbWVyYVxuIiwiaW1wb3J0IHsgTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIE1vdmUge1xuICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcbiAgICB0aGlzLnR5cGUgPSBNT1ZFXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gIH1cblxuICAvLyDmmK/lkKbpnIDnva7mj5tcbiAgaGFzVG9SZXBsYWNlIChvd25lcikge1xuICAgIGxldCBvdGhlciA9IG93bmVyLnRpY2tBYmlsaXRpZXNbdGhpcy50eXBlXVxuICAgIGlmICghb3RoZXIpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIC8vIOWPquacg+WKoOW/q1xuICAgIHJldHVybiB0aGlzLnZhbHVlID4gb3RoZXIudmFsdWVcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIG93bmVyLnRpY2tBYmlsaXRpZXNbdGhpcy50eXBlXSA9IHRoaXNcbiAgfVxuXG4gIC8vIHRpY2tcbiAgdGljayAoZGVsdGEsIG93bmVyKSB7XG4gICAgb3duZXIueCArPSBvd25lci5keCAqIHRoaXMudmFsdWUgKiBkZWx0YVxuICAgIG93bmVyLnkgKz0gb3duZXIuZHkgKiB0aGlzLnZhbHVlICogZGVsdGFcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ21vdmUgbGV2ZWw6ICcgKyB0aGlzLnZhbHVlXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTW92ZVxuIiwiaW1wb3J0IHsgT1BFUkFURSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIE9wZXJhdGUge1xuICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcbiAgICB0aGlzLnR5cGUgPSBPUEVSQVRFXG4gICAgdGhpcy5zZXQgPSBuZXcgU2V0KFt2YWx1ZV0pXG4gIH1cblxuICAvLyDmmK/lkKbpnIDnva7mj5tcbiAgaGFzVG9SZXBsYWNlIChvd25lcikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBsZXQgYWJpbGl0eSA9IG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdXG4gICAgaWYgKCFhYmlsaXR5KSB7XG4gICAgICAvLyBmaXJzdCBnZXQgb3BlcmF0ZSBhYmlsaXR5XG4gICAgICBhYmlsaXR5ID0gdGhpc1xuICAgICAgb3duZXIuYWJpbGl0aWVzW3RoaXMudHlwZV0gPSBhYmlsaXR5XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IHNldCA9IGFiaWxpdHkuc2V0XG4gICAgdGhpcy5zZXQuZm9yRWFjaChzZXQuYWRkLmJpbmQoc2V0KSlcbiAgfVxuXG4gIHVzZSAob3BlcmF0b3IsIHRhcmdldCkge1xuICAgIGlmIChvcGVyYXRvci5hYmlsaXRpZXNbdGhpcy50eXBlXS5zZXQuaGFzKHRhcmdldC5tYXApKSB7XG4gICAgICBvcGVyYXRvci5zYXkob3BlcmF0b3IudG9TdHJpbmcoKSArICcgdXNlIGFiaWxpdHkgdG8gb3BlbiAnICsgdGFyZ2V0Lm1hcClcbiAgICAgIHRhcmdldFt0aGlzLnR5cGVdKClcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIFsna2V5czogJywgQXJyYXkuZnJvbSh0aGlzLnNldCkuam9pbignLCAnKV0uam9pbignJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPcGVyYXRlXG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUsIGxvYWRlciwgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9saWIvU2NlbmUnXHJcbmltcG9ydCBQbGF5U2NlbmUgZnJvbSAnLi9QbGF5U2NlbmUnXHJcblxyXG5sZXQgdGV4dCA9ICdsb2FkaW5nJ1xyXG5cclxuY2xhc3MgTG9hZGluZ1NjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLmxpZmUgPSAwXHJcbiAgfVxyXG5cclxuICBjcmVhdGUgKCkge1xyXG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XHJcbiAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXHJcbiAgICAgIGZvbnRTaXplOiAzNixcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnI2ZmMzMwMCcsXHJcbiAgICAgIHN0cm9rZVRoaWNrbmVzczogNCxcclxuICAgICAgZHJvcFNoYWRvdzogdHJ1ZSxcclxuICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgIGRyb3BTaGFkb3dCbHVyOiA0LFxyXG4gICAgICBkcm9wU2hhZG93QW5nbGU6IE1hdGguUEkgLyA2LFxyXG4gICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDZcclxuICAgIH0pXHJcbiAgICB0aGlzLnRleHRMb2FkaW5nID0gbmV3IFRleHQodGV4dCwgc3R5bGUpXHJcblxyXG4gICAgLy8gQWRkIHRoZSBjYXQgdG8gdGhlIHN0YWdlXHJcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGV4dExvYWRpbmcpXHJcblxyXG4gICAgLy8gbG9hZCBhbiBpbWFnZSBhbmQgcnVuIHRoZSBgc2V0dXBgIGZ1bmN0aW9uIHdoZW4gaXQncyBkb25lXHJcbiAgICBsb2FkZXJcclxuICAgICAgLmFkZCgnaW1hZ2VzL3Rvd25fdGlsZXMuanNvbicpXHJcbiAgICAgIC5sb2FkKCgpID0+IHRoaXMuZW1pdCgnY2hhbmdlU2NlbmUnLCBQbGF5U2NlbmUsIHtcclxuICAgICAgICBtYXA6ICdFME4wJyxcclxuICAgICAgICBwb3NpdGlvbjogWzEsIDFdXHJcbiAgICAgIH0pKVxyXG4gIH1cclxuXHJcbiAgdGljayAoZGVsdGEpIHtcclxuICAgIHRoaXMubGlmZSArPSBkZWx0YSAvIDMwIC8vIGJsZW5kIHNwZWVkXHJcbiAgICB0aGlzLnRleHRMb2FkaW5nLnRleHQgPSB0ZXh0ICsgQXJyYXkoTWF0aC5mbG9vcih0aGlzLmxpZmUpICUgNCArIDEpLmpvaW4oJy4nKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTG9hZGluZ1NjZW5lXHJcbiIsImltcG9ydCB7IFRleHQsIFRleHRTdHlsZSwgbG9hZGVyLCByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2xpYi9TY2VuZSdcclxuaW1wb3J0IE1hcCBmcm9tICcuLi9saWIvTWFwJ1xyXG5pbXBvcnQgTWVzc2FnZXMgZnJvbSAnLi4vbGliL01lc3NhZ2VzJ1xyXG5cclxuaW1wb3J0IENhdCBmcm9tICcuLi9vYmplY3RzL0NhdCdcclxuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9zbG90cy9Nb3ZlJ1xyXG5pbXBvcnQgT3BlcmF0ZSBmcm9tICcuLi9vYmplY3RzL3Nsb3RzL09wZXJhdGUnXHJcblxyXG5jb25zdCBDRUlMX1NJWkUgPSAxNlxyXG5cclxuY2xhc3MgUGxheVNjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yICh7IG1hcCwgcGxheWVyLCBwb3NpdGlvbiB9KSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmlzTG9hZGVkID0gZmFsc2VcclxuICAgIHRoaXMuY2F0ID0gcGxheWVyXHJcblxyXG4gICAgdGhpcy5tYXBGaWxlID0gJ3dvcmxkLycgKyBtYXBcclxuICAgIHRoaXMudG9Qb3NpdGlvbiA9IHBvc2l0aW9uXHJcbiAgfVxyXG5cclxuICBjcmVhdGUgKCkge1xyXG4gICAgbGV0IGZpbGVOYW1lID0gdGhpcy5tYXBGaWxlXHJcblxyXG4gICAgLy8gaWYgbWFwIG5vdCBsb2FkZWQgeWV0XHJcbiAgICBpZiAoIXJlc291cmNlc1tmaWxlTmFtZV0pIHtcclxuICAgICAgbG9hZGVyXHJcbiAgICAgICAgLmFkZChmaWxlTmFtZSwgZmlsZU5hbWUgKyAnLmpzb24nKVxyXG4gICAgICAgIC5sb2FkKHRoaXMub25Mb2FkZWQuYmluZCh0aGlzKSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMub25Mb2FkZWQoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25Mb2FkZWQgKCkge1xyXG4gICAgLy8gaW5pdCB2aWV3IHNpemVcclxuICAgIC8vIGxldCBzaWRlTGVuZ3RoID0gTWF0aC5taW4odGhpcy5wYXJlbnQud2lkdGgsIHRoaXMucGFyZW50LmhlaWdodClcclxuICAgIC8vIGxldCBzY2FsZSA9IHNpZGVMZW5ndGggLyBDRUlMX1NJWkUgLyAxMFxyXG4gICAgLy8gdGhpcy5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlKVxyXG5cclxuICAgIHRoaXMuY29sbGlkZU9iamVjdHMgPSBbXVxyXG4gICAgdGhpcy5yZXBseU9iamVjdHMgPSBbXVxyXG5cclxuICAgIGlmICghdGhpcy5jYXQpIHtcclxuICAgICAgdGhpcy5jYXQgPSBuZXcgQ2F0KClcclxuICAgICAgdGhpcy5jYXQudGFrZUFiaWxpdHkobmV3IE1vdmUoMSkpXHJcbiAgICAgIHRoaXMuY2F0LnRha2VBYmlsaXR5KG5ldyBPcGVyYXRlKCdFME4wJykpXHJcbiAgICAgIHRoaXMuY2F0LndpZHRoID0gMTBcclxuICAgICAgdGhpcy5jYXQuaGVpZ2h0ID0gMTBcclxuICAgIH1cclxuICAgIHRoaXMuY2F0LnBvc2l0aW9uLnNldChcclxuICAgICAgdGhpcy50b1Bvc2l0aW9uWzBdICogQ0VJTF9TSVpFLFxyXG4gICAgICB0aGlzLnRvUG9zaXRpb25bMV0gKiBDRUlMX1NJWkVcclxuICAgIClcclxuXHJcbiAgICB0aGlzLnNwYXduTWFwKHJlc291cmNlc1t0aGlzLm1hcEZpbGVdLmRhdGEpXHJcbiAgICB0aGlzLm1hcC5hZGRQbGF5ZXIodGhpcy5jYXQpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMubWFwKVxyXG5cclxuICAgIHRoaXMudGlwVGV4dCgpXHJcblxyXG4gICAgdGhpcy5pc0xvYWRlZCA9IHRydWVcclxuICB9XHJcblxyXG4gIHNwYXduTWFwIChtYXBEYXRhKSB7XHJcbiAgICBsZXQgbWFwID0gbmV3IE1hcCgpXHJcbiAgICBtYXAubG9hZChtYXBEYXRhKVxyXG5cclxuICAgIG1hcC5vbigndXNlJywgbyA9PiB7XHJcbiAgICAgIC8vIHRpcCB0ZXh0XHJcbiAgICAgIHRoaXMuZW1pdCgnY2hhbmdlU2NlbmUnLCBQbGF5U2NlbmUsIHtcclxuICAgICAgICBtYXA6IG8ubWFwLFxyXG4gICAgICAgIHBsYXllcjogdGhpcy5jYXQsXHJcbiAgICAgICAgcG9zaXRpb246IG8udG9Qb3NpdGlvblxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLm1hcCA9IG1hcFxyXG4gIH1cclxuXHJcbiAgdGlwVGV4dCAoKSB7XHJcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcclxuICAgICAgZm9udFNpemU6IDEyLFxyXG4gICAgICBmaWxsOiAnd2hpdGUnXHJcbiAgICB9KVxyXG4gICAgdGhpcy50ZXh0ID0gbmV3IFRleHQoJycsIHN0eWxlKVxyXG4gICAgdGhpcy50ZXh0LnggPSAxMDBcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGV4dClcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNMb2FkZWQpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcC50aWNrKGRlbHRhKVxyXG4gICAgdGhpcy50ZXh0LnRleHQgPSBNZXNzYWdlcy5nZXRMaXN0KCkuam9pbignJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYXlTY2VuZVxyXG4iXX0=
