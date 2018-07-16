(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],2:[function(require,module,exports){

var Keyboard = require('./lib/keyboard');
var Locale   = require('./lib/locale');
var KeyCombo = require('./lib/key-combo');

var keyboard = new Keyboard();

keyboard.setLocale('us', require('./locales/us'));

exports          = module.exports = keyboard;
exports.Keyboard = Keyboard;
exports.Locale   = Locale;
exports.KeyCombo = KeyCombo;

},{"./lib/key-combo":3,"./lib/keyboard":4,"./lib/locale":5,"./locales/us":6}],3:[function(require,module,exports){

function KeyCombo(keyComboStr) {
  this.sourceStr = keyComboStr;
  this.subCombos = KeyCombo.parseComboStr(keyComboStr);
  this.keyNames  = this.subCombos.reduce(function(memo, nextSubCombo) {
    return memo.concat(nextSubCombo);
  }, []);
}

// TODO: Add support for key combo sequences
KeyCombo.sequenceDeliminator = '>>';
KeyCombo.comboDeliminator    = '>';
KeyCombo.keyDeliminator      = '+';

KeyCombo.parseComboStr = function(keyComboStr) {
  var subComboStrs = KeyCombo._splitStr(keyComboStr, KeyCombo.comboDeliminator);
  var combo        = [];

  for (var i = 0 ; i < subComboStrs.length; i += 1) {
    combo.push(KeyCombo._splitStr(subComboStrs[i], KeyCombo.keyDeliminator));
  }
  return combo;
};

KeyCombo.prototype.check = function(pressedKeyNames) {
  var startingKeyNameIndex = 0;
  for (var i = 0; i < this.subCombos.length; i += 1) {
    startingKeyNameIndex = this._checkSubCombo(
      this.subCombos[i],
      startingKeyNameIndex,
      pressedKeyNames
    );
    if (startingKeyNameIndex === -1) { return false; }
  }
  return true;
};

KeyCombo.prototype.isEqual = function(otherKeyCombo) {
  if (
    !otherKeyCombo ||
    typeof otherKeyCombo !== 'string' &&
    typeof otherKeyCombo !== 'object'
  ) { return false; }

  if (typeof otherKeyCombo === 'string') {
    otherKeyCombo = new KeyCombo(otherKeyCombo);
  }

  if (this.subCombos.length !== otherKeyCombo.subCombos.length) {
    return false;
  }
  for (var i = 0; i < this.subCombos.length; i += 1) {
    if (this.subCombos[i].length !== otherKeyCombo.subCombos[i].length) {
      return false;
    }
  }

  for (var i = 0; i < this.subCombos.length; i += 1) {
    var subCombo      = this.subCombos[i];
    var otherSubCombo = otherKeyCombo.subCombos[i].slice(0);

    for (var j = 0; j < subCombo.length; j += 1) {
      var keyName = subCombo[j];
      var index   = otherSubCombo.indexOf(keyName);

      if (index > -1) {
        otherSubCombo.splice(index, 1);
      }
    }
    if (otherSubCombo.length !== 0) {
      return false;
    }
  }

  return true;
};

KeyCombo._splitStr = function(str, deliminator) {
  var s  = str;
  var d  = deliminator;
  var c  = '';
  var ca = [];

  for (var ci = 0; ci < s.length; ci += 1) {
    if (ci > 0 && s[ci] === d && s[ci - 1] !== '\\') {
      ca.push(c.trim());
      c = '';
      ci += 1;
    }
    c += s[ci];
  }
  if (c) { ca.push(c.trim()); }

  return ca;
};

KeyCombo.prototype._checkSubCombo = function(subCombo, startingKeyNameIndex, pressedKeyNames) {
  subCombo = subCombo.slice(0);
  pressedKeyNames = pressedKeyNames.slice(startingKeyNameIndex);

  var endIndex = startingKeyNameIndex;
  for (var i = 0; i < subCombo.length; i += 1) {

    var keyName = subCombo[i];
    if (keyName[0] === '\\') {
      var escapedKeyName = keyName.slice(1);
      if (
        escapedKeyName === KeyCombo.comboDeliminator ||
        escapedKeyName === KeyCombo.keyDeliminator
      ) {
        keyName = escapedKeyName;
      }
    }

    var index = pressedKeyNames.indexOf(keyName);
    if (index > -1) {
      subCombo.splice(i, 1);
      i -= 1;
      if (index > endIndex) {
        endIndex = index;
      }
      if (subCombo.length === 0) {
        return endIndex;
      }
    }
  }
  return -1;
};


module.exports = KeyCombo;

},{}],4:[function(require,module,exports){
(function (global){

var Locale = require('./locale');
var KeyCombo = require('./key-combo');


function Keyboard(targetWindow, targetElement, platform, userAgent) {
  this._locale               = null;
  this._currentContext       = null;
  this._contexts             = {};
  this._listeners            = [];
  this._appliedListeners     = [];
  this._locales              = {};
  this._targetElement        = null;
  this._targetWindow         = null;
  this._targetPlatform       = '';
  this._targetUserAgent      = '';
  this._isModernBrowser      = false;
  this._targetKeyDownBinding = null;
  this._targetKeyUpBinding   = null;
  this._targetResetBinding   = null;
  this._paused               = false;
  this._callerHandler        = null;

  this.setContext('global');
  this.watch(targetWindow, targetElement, platform, userAgent);
}

Keyboard.prototype.setLocale = function(localeName, localeBuilder) {
  var locale = null;
  if (typeof localeName === 'string') {

    if (localeBuilder) {
      locale = new Locale(localeName);
      localeBuilder(locale, this._targetPlatform, this._targetUserAgent);
    } else {
      locale = this._locales[localeName] || null;
    }
  } else {
    locale     = localeName;
    localeName = locale._localeName;
  }

  this._locale              = locale;
  this._locales[localeName] = locale;
  if (locale) {
    this._locale.pressedKeys = locale.pressedKeys;
  }
};

Keyboard.prototype.getLocale = function(localName) {
  localName || (localName = this._locale.localeName);
  return this._locales[localName] || null;
};

Keyboard.prototype.bind = function(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
  if (keyComboStr === null || typeof keyComboStr === 'function') {
    preventRepeatByDefault = releaseHandler;
    releaseHandler         = pressHandler;
    pressHandler           = keyComboStr;
    keyComboStr            = null;
  }

  if (
    keyComboStr &&
    typeof keyComboStr === 'object' &&
    typeof keyComboStr.length === 'number'
  ) {
    for (var i = 0; i < keyComboStr.length; i += 1) {
      this.bind(keyComboStr[i], pressHandler, releaseHandler);
    }
    return;
  }

  this._listeners.push({
    keyCombo               : keyComboStr ? new KeyCombo(keyComboStr) : null,
    pressHandler           : pressHandler           || null,
    releaseHandler         : releaseHandler         || null,
    preventRepeat          : preventRepeatByDefault || false,
    preventRepeatByDefault : preventRepeatByDefault || false
  });
};
Keyboard.prototype.addListener = Keyboard.prototype.bind;
Keyboard.prototype.on          = Keyboard.prototype.bind;

Keyboard.prototype.unbind = function(keyComboStr, pressHandler, releaseHandler) {
  if (keyComboStr === null || typeof keyComboStr === 'function') {
    releaseHandler = pressHandler;
    pressHandler   = keyComboStr;
    keyComboStr = null;
  }

  if (
    keyComboStr &&
    typeof keyComboStr === 'object' &&
    typeof keyComboStr.length === 'number'
  ) {
    for (var i = 0; i < keyComboStr.length; i += 1) {
      this.unbind(keyComboStr[i], pressHandler, releaseHandler);
    }
    return;
  }

  for (var i = 0; i < this._listeners.length; i += 1) {
    var listener = this._listeners[i];

    var comboMatches          = !keyComboStr && !listener.keyCombo ||
                                listener.keyCombo && listener.keyCombo.isEqual(keyComboStr);
    var pressHandlerMatches   = !pressHandler && !releaseHandler ||
                                !pressHandler && !listener.pressHandler ||
                                pressHandler === listener.pressHandler;
    var releaseHandlerMatches = !pressHandler && !releaseHandler ||
                                !releaseHandler && !listener.releaseHandler ||
                                releaseHandler === listener.releaseHandler;

    if (comboMatches && pressHandlerMatches && releaseHandlerMatches) {
      this._listeners.splice(i, 1);
      i -= 1;
    }
  }
};
Keyboard.prototype.removeListener = Keyboard.prototype.unbind;
Keyboard.prototype.off            = Keyboard.prototype.unbind;

Keyboard.prototype.setContext = function(contextName) {
  if(this._locale) { this.releaseAllKeys(); }

  if (!this._contexts[contextName]) {
    this._contexts[contextName] = [];
  }
  this._listeners      = this._contexts[contextName];
  this._currentContext = contextName;
};

Keyboard.prototype.getContext = function() {
  return this._currentContext;
};

Keyboard.prototype.withContext = function(contextName, callback) {
  var previousContextName = this.getContext();
  this.setContext(contextName);

  callback();

  this.setContext(previousContextName);
};

Keyboard.prototype.watch = function(targetWindow, targetElement, targetPlatform, targetUserAgent) {
  var _this = this;

  this.stop();

  if (!targetWindow) {
    if (!global.addEventListener && !global.attachEvent) {
      throw new Error('Cannot find global functions addEventListener or attachEvent.');
    }
    targetWindow = global;
  }

  if (typeof targetWindow.nodeType === 'number') {
    targetUserAgent = targetPlatform;
    targetPlatform  = targetElement;
    targetElement   = targetWindow;
    targetWindow    = global;
  }

  if (!targetWindow.addEventListener && !targetWindow.attachEvent) {
    throw new Error('Cannot find addEventListener or attachEvent methods on targetWindow.');
  }

  this._isModernBrowser = !!targetWindow.addEventListener;

  var userAgent = targetWindow.navigator && targetWindow.navigator.userAgent || '';
  var platform  = targetWindow.navigator && targetWindow.navigator.platform  || '';

  targetElement   && targetElement   !== null || (targetElement   = targetWindow.document);
  targetPlatform  && targetPlatform  !== null || (targetPlatform  = platform);
  targetUserAgent && targetUserAgent !== null || (targetUserAgent = userAgent);

  this._targetKeyDownBinding = function(event) {
    _this.pressKey(event.keyCode, event);
    _this._handleCommandBug(event, platform);
  };
  this._targetKeyUpBinding = function(event) {
    _this.releaseKey(event.keyCode, event);
  };
  this._targetResetBinding = function(event) {
    _this.releaseAllKeys(event)
  };

  this._bindEvent(targetElement, 'keydown', this._targetKeyDownBinding);
  this._bindEvent(targetElement, 'keyup',   this._targetKeyUpBinding);
  this._bindEvent(targetWindow,  'focus',   this._targetResetBinding);
  this._bindEvent(targetWindow,  'blur',    this._targetResetBinding);

  this._targetElement   = targetElement;
  this._targetWindow    = targetWindow;
  this._targetPlatform  = targetPlatform;
  this._targetUserAgent = targetUserAgent;
};

Keyboard.prototype.stop = function() {
  var _this = this;

  if (!this._targetElement || !this._targetWindow) { return; }

  this._unbindEvent(this._targetElement, 'keydown', this._targetKeyDownBinding);
  this._unbindEvent(this._targetElement, 'keyup',   this._targetKeyUpBinding);
  this._unbindEvent(this._targetWindow,  'focus',   this._targetResetBinding);
  this._unbindEvent(this._targetWindow,  'blur',    this._targetResetBinding);

  this._targetWindow  = null;
  this._targetElement = null;
};

Keyboard.prototype.pressKey = function(keyCode, event) {
  if (this._paused) { return; }
  if (!this._locale) { throw new Error('Locale not set'); }

  this._locale.pressKey(keyCode);
  this._applyBindings(event);
};

Keyboard.prototype.releaseKey = function(keyCode, event) {
  if (this._paused) { return; }
  if (!this._locale) { throw new Error('Locale not set'); }

  this._locale.releaseKey(keyCode);
  this._clearBindings(event);
};

Keyboard.prototype.releaseAllKeys = function(event) {
  if (this._paused) { return; }
  if (!this._locale) { throw new Error('Locale not set'); }

  this._locale.pressedKeys.length = 0;
  this._clearBindings(event);
};

Keyboard.prototype.pause = function() {
  if (this._paused) { return; }
  if (this._locale) { this.releaseAllKeys(); }
  this._paused = true;
};

Keyboard.prototype.resume = function() {
  this._paused = false;
};

Keyboard.prototype.reset = function() {
  this.releaseAllKeys();
  this._listeners.length = 0;
};

Keyboard.prototype._bindEvent = function(targetElement, eventName, handler) {
  return this._isModernBrowser ?
    targetElement.addEventListener(eventName, handler, false) :
    targetElement.attachEvent('on' + eventName, handler);
};

Keyboard.prototype._unbindEvent = function(targetElement, eventName, handler) {
  return this._isModernBrowser ?
    targetElement.removeEventListener(eventName, handler, false) :
    targetElement.detachEvent('on' + eventName, handler);
};

Keyboard.prototype._getGroupedListeners = function() {
  var listenerGroups   = [];
  var listenerGroupMap = [];

  var listeners = this._listeners;
  if (this._currentContext !== 'global') {
    listeners = [].concat(listeners, this._contexts.global);
  }

  listeners.sort(function(a, b) {
    return (b.keyCombo ? b.keyCombo.keyNames.length : 0) - (a.keyCombo ? a.keyCombo.keyNames.length : 0);
  }).forEach(function(l) {
    var mapIndex = -1;
    for (var i = 0; i < listenerGroupMap.length; i += 1) {
      if (listenerGroupMap[i] === null && l.keyCombo === null ||
          listenerGroupMap[i] !== null && listenerGroupMap[i].isEqual(l.keyCombo)) {
        mapIndex = i;
      }
    }
    if (mapIndex === -1) {
      mapIndex = listenerGroupMap.length;
      listenerGroupMap.push(l.keyCombo);
    }
    if (!listenerGroups[mapIndex]) {
      listenerGroups[mapIndex] = [];
    }
    listenerGroups[mapIndex].push(l);
  });
  return listenerGroups;
};

Keyboard.prototype._applyBindings = function(event) {
  var preventRepeat = false;

  event || (event = {});
  event.preventRepeat = function() { preventRepeat = true; };
  event.pressedKeys   = this._locale.pressedKeys.slice(0);

  var pressedKeys    = this._locale.pressedKeys.slice(0);
  var listenerGroups = this._getGroupedListeners();


  for (var i = 0; i < listenerGroups.length; i += 1) {
    var listeners = listenerGroups[i];
    var keyCombo  = listeners[0].keyCombo;

    if (keyCombo === null || keyCombo.check(pressedKeys)) {
      for (var j = 0; j < listeners.length; j += 1) {
        var listener = listeners[j];

        if (keyCombo === null) {
          listener = {
            keyCombo               : new KeyCombo(pressedKeys.join('+')),
            pressHandler           : listener.pressHandler,
            releaseHandler         : listener.releaseHandler,
            preventRepeat          : listener.preventRepeat,
            preventRepeatByDefault : listener.preventRepeatByDefault
          };
        }

        if (listener.pressHandler && !listener.preventRepeat) {
          listener.pressHandler.call(this, event);
          if (preventRepeat) {
            listener.preventRepeat = preventRepeat;
            preventRepeat          = false;
          }
        }

        if (listener.releaseHandler && this._appliedListeners.indexOf(listener) === -1) {
          this._appliedListeners.push(listener);
        }
      }

      if (keyCombo) {
        for (var j = 0; j < keyCombo.keyNames.length; j += 1) {
          var index = pressedKeys.indexOf(keyCombo.keyNames[j]);
          if (index !== -1) {
            pressedKeys.splice(index, 1);
            j -= 1;
          }
        }
      }
    }
  }
};

Keyboard.prototype._clearBindings = function(event) {
  event || (event = {});

  for (var i = 0; i < this._appliedListeners.length; i += 1) {
    var listener = this._appliedListeners[i];
    var keyCombo = listener.keyCombo;
    if (keyCombo === null || !keyCombo.check(this._locale.pressedKeys)) {
      if (this._callerHandler !== listener.releaseHandler) {
        var oldCaller = this._callerHandler;
        this._callerHandler = listener.releaseHandler;
        listener.preventRepeat = listener.preventRepeatByDefault;
        listener.releaseHandler.call(this, event);
        this._callerHandler = oldCaller;
      }
      this._appliedListeners.splice(i, 1);
      i -= 1;
    }
  }
};

Keyboard.prototype._handleCommandBug = function(event, platform) {
  // On Mac when the command key is kept pressed, keyup is not triggered for any other key.
  // In this case force a keyup for non-modifier keys directly after the keypress.
  var modifierKeys = ["shift", "ctrl", "alt", "capslock", "tab", "command"];
  if (platform.match("Mac") && this._locale.pressedKeys.includes("command") &&
      !modifierKeys.includes(this._locale.getKeyNames(event.keyCode)[0])) {
    this._targetKeyUpBinding(event);
  }
};

module.exports = Keyboard;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./key-combo":3,"./locale":5}],5:[function(require,module,exports){

var KeyCombo = require('./key-combo');


function Locale(name) {
  this.localeName     = name;
  this.pressedKeys    = [];
  this._appliedMacros = [];
  this._keyMap        = {};
  this._killKeyCodes  = [];
  this._macros        = [];
}

Locale.prototype.bindKeyCode = function(keyCode, keyNames) {
  if (typeof keyNames === 'string') {
    keyNames = [keyNames];
  }

  this._keyMap[keyCode] = keyNames;
};

Locale.prototype.bindMacro = function(keyComboStr, keyNames) {
  if (typeof keyNames === 'string') {
    keyNames = [ keyNames ];
  }

  var handler = null;
  if (typeof keyNames === 'function') {
    handler = keyNames;
    keyNames = null;
  }

  var macro = {
    keyCombo : new KeyCombo(keyComboStr),
    keyNames : keyNames,
    handler  : handler
  };

  this._macros.push(macro);
};

Locale.prototype.getKeyCodes = function(keyName) {
  var keyCodes = [];
  for (var keyCode in this._keyMap) {
    var index = this._keyMap[keyCode].indexOf(keyName);
    if (index > -1) { keyCodes.push(keyCode|0); }
  }
  return keyCodes;
};

Locale.prototype.getKeyNames = function(keyCode) {
  return this._keyMap[keyCode] || [];
};

Locale.prototype.setKillKey = function(keyCode) {
  if (typeof keyCode === 'string') {
    var keyCodes = this.getKeyCodes(keyCode);
    for (var i = 0; i < keyCodes.length; i += 1) {
      this.setKillKey(keyCodes[i]);
    }
    return;
  }

  this._killKeyCodes.push(keyCode);
};

Locale.prototype.pressKey = function(keyCode) {
  if (typeof keyCode === 'string') {
    var keyCodes = this.getKeyCodes(keyCode);
    for (var i = 0; i < keyCodes.length; i += 1) {
      this.pressKey(keyCodes[i]);
    }
    return;
  }

  var keyNames = this.getKeyNames(keyCode);
  for (var i = 0; i < keyNames.length; i += 1) {
    if (this.pressedKeys.indexOf(keyNames[i]) === -1) {
      this.pressedKeys.push(keyNames[i]);
    }
  }

  this._applyMacros();
};

Locale.prototype.releaseKey = function(keyCode) {
  if (typeof keyCode === 'string') {
    var keyCodes = this.getKeyCodes(keyCode);
    for (var i = 0; i < keyCodes.length; i += 1) {
      this.releaseKey(keyCodes[i]);
    }
  }

  else {
    var keyNames         = this.getKeyNames(keyCode);
    var killKeyCodeIndex = this._killKeyCodes.indexOf(keyCode);
    
    if (killKeyCodeIndex > -1) {
      this.pressedKeys.length = 0;
    } else {
      for (var i = 0; i < keyNames.length; i += 1) {
        var index = this.pressedKeys.indexOf(keyNames[i]);
        if (index > -1) {
          this.pressedKeys.splice(index, 1);
        }
      }
    }

    this._clearMacros();
  }
};

Locale.prototype._applyMacros = function() {
  var macros = this._macros.slice(0);
  for (var i = 0; i < macros.length; i += 1) {
    var macro = macros[i];
    if (macro.keyCombo.check(this.pressedKeys)) {
      if (macro.handler) {
        macro.keyNames = macro.handler(this.pressedKeys);
      }
      for (var j = 0; j < macro.keyNames.length; j += 1) {
        if (this.pressedKeys.indexOf(macro.keyNames[j]) === -1) {
          this.pressedKeys.push(macro.keyNames[j]);
        }
      }
      this._appliedMacros.push(macro);
    }
  }
};

Locale.prototype._clearMacros = function() {
  for (var i = 0; i < this._appliedMacros.length; i += 1) {
    var macro = this._appliedMacros[i];
    if (!macro.keyCombo.check(this.pressedKeys)) {
      for (var j = 0; j < macro.keyNames.length; j += 1) {
        var index = this.pressedKeys.indexOf(macro.keyNames[j]);
        if (index > -1) {
          this.pressedKeys.splice(index, 1);
        }
      }
      if (macro.handler) {
        macro.keyNames = null;
      }
      this._appliedMacros.splice(i, 1);
      i -= 1;
    }
  }
};


module.exports = Locale;

},{"./key-combo":3}],6:[function(require,module,exports){

module.exports = function(locale, platform, userAgent) {

  // general
  locale.bindKeyCode(3,   ['cancel']);
  locale.bindKeyCode(8,   ['backspace']);
  locale.bindKeyCode(9,   ['tab']);
  locale.bindKeyCode(12,  ['clear']);
  locale.bindKeyCode(13,  ['enter']);
  locale.bindKeyCode(16,  ['shift']);
  locale.bindKeyCode(17,  ['ctrl']);
  locale.bindKeyCode(18,  ['alt', 'menu']);
  locale.bindKeyCode(19,  ['pause', 'break']);
  locale.bindKeyCode(20,  ['capslock']);
  locale.bindKeyCode(27,  ['escape', 'esc']);
  locale.bindKeyCode(32,  ['space', 'spacebar']);
  locale.bindKeyCode(33,  ['pageup']);
  locale.bindKeyCode(34,  ['pagedown']);
  locale.bindKeyCode(35,  ['end']);
  locale.bindKeyCode(36,  ['home']);
  locale.bindKeyCode(37,  ['left']);
  locale.bindKeyCode(38,  ['up']);
  locale.bindKeyCode(39,  ['right']);
  locale.bindKeyCode(40,  ['down']);
  locale.bindKeyCode(41,  ['select']);
  locale.bindKeyCode(42,  ['printscreen']);
  locale.bindKeyCode(43,  ['execute']);
  locale.bindKeyCode(44,  ['snapshot']);
  locale.bindKeyCode(45,  ['insert', 'ins']);
  locale.bindKeyCode(46,  ['delete', 'del']);
  locale.bindKeyCode(47,  ['help']);
  locale.bindKeyCode(145, ['scrolllock', 'scroll']);
  locale.bindKeyCode(187, ['equal', 'equalsign', '=']);
  locale.bindKeyCode(188, ['comma', ',']);
  locale.bindKeyCode(190, ['period', '.']);
  locale.bindKeyCode(191, ['slash', 'forwardslash', '/']);
  locale.bindKeyCode(192, ['graveaccent', '`']);
  locale.bindKeyCode(219, ['openbracket', '[']);
  locale.bindKeyCode(220, ['backslash', '\\']);
  locale.bindKeyCode(221, ['closebracket', ']']);
  locale.bindKeyCode(222, ['apostrophe', '\'']);

  // 0-9
  locale.bindKeyCode(48, ['zero', '0']);
  locale.bindKeyCode(49, ['one', '1']);
  locale.bindKeyCode(50, ['two', '2']);
  locale.bindKeyCode(51, ['three', '3']);
  locale.bindKeyCode(52, ['four', '4']);
  locale.bindKeyCode(53, ['five', '5']);
  locale.bindKeyCode(54, ['six', '6']);
  locale.bindKeyCode(55, ['seven', '7']);
  locale.bindKeyCode(56, ['eight', '8']);
  locale.bindKeyCode(57, ['nine', '9']);

  // numpad
  locale.bindKeyCode(96, ['numzero', 'num0']);
  locale.bindKeyCode(97, ['numone', 'num1']);
  locale.bindKeyCode(98, ['numtwo', 'num2']);
  locale.bindKeyCode(99, ['numthree', 'num3']);
  locale.bindKeyCode(100, ['numfour', 'num4']);
  locale.bindKeyCode(101, ['numfive', 'num5']);
  locale.bindKeyCode(102, ['numsix', 'num6']);
  locale.bindKeyCode(103, ['numseven', 'num7']);
  locale.bindKeyCode(104, ['numeight', 'num8']);
  locale.bindKeyCode(105, ['numnine', 'num9']);
  locale.bindKeyCode(106, ['nummultiply', 'num*']);
  locale.bindKeyCode(107, ['numadd', 'num+']);
  locale.bindKeyCode(108, ['numenter']);
  locale.bindKeyCode(109, ['numsubtract', 'num-']);
  locale.bindKeyCode(110, ['numdecimal', 'num.']);
  locale.bindKeyCode(111, ['numdivide', 'num/']);
  locale.bindKeyCode(144, ['numlock', 'num']);

  // function keys
  locale.bindKeyCode(112, ['f1']);
  locale.bindKeyCode(113, ['f2']);
  locale.bindKeyCode(114, ['f3']);
  locale.bindKeyCode(115, ['f4']);
  locale.bindKeyCode(116, ['f5']);
  locale.bindKeyCode(117, ['f6']);
  locale.bindKeyCode(118, ['f7']);
  locale.bindKeyCode(119, ['f8']);
  locale.bindKeyCode(120, ['f9']);
  locale.bindKeyCode(121, ['f10']);
  locale.bindKeyCode(122, ['f11']);
  locale.bindKeyCode(123, ['f12']);

  // secondary key symbols
  locale.bindMacro('shift + `', ['tilde', '~']);
  locale.bindMacro('shift + 1', ['exclamation', 'exclamationpoint', '!']);
  locale.bindMacro('shift + 2', ['at', '@']);
  locale.bindMacro('shift + 3', ['number', '#']);
  locale.bindMacro('shift + 4', ['dollar', 'dollars', 'dollarsign', '$']);
  locale.bindMacro('shift + 5', ['percent', '%']);
  locale.bindMacro('shift + 6', ['caret', '^']);
  locale.bindMacro('shift + 7', ['ampersand', 'and', '&']);
  locale.bindMacro('shift + 8', ['asterisk', '*']);
  locale.bindMacro('shift + 9', ['openparen', '(']);
  locale.bindMacro('shift + 0', ['closeparen', ')']);
  locale.bindMacro('shift + -', ['underscore', '_']);
  locale.bindMacro('shift + =', ['plus', '+']);
  locale.bindMacro('shift + [', ['opencurlybrace', 'opencurlybracket', '{']);
  locale.bindMacro('shift + ]', ['closecurlybrace', 'closecurlybracket', '}']);
  locale.bindMacro('shift + \\', ['verticalbar', '|']);
  locale.bindMacro('shift + ;', ['colon', ':']);
  locale.bindMacro('shift + \'', ['quotationmark', '\'']);
  locale.bindMacro('shift + !,', ['openanglebracket', '<']);
  locale.bindMacro('shift + .', ['closeanglebracket', '>']);
  locale.bindMacro('shift + /', ['questionmark', '?']);
  
  if (platform.match('Mac')) {
    locale.bindMacro('command', ['mod', 'modifier']);
  } else {
    locale.bindMacro('ctrl', ['mod', 'modifier']);
  }

  //a-z and A-Z
  for (var keyCode = 65; keyCode <= 90; keyCode += 1) {
    var keyName = String.fromCharCode(keyCode + 32);
    var capitalKeyName = String.fromCharCode(keyCode);
  	locale.bindKeyCode(keyCode, keyName);
  	locale.bindMacro('shift + ' + keyName, capitalKeyName);
  	locale.bindMacro('capslock + ' + keyName, capitalKeyName);
  }

  // browser caveats
  var semicolonKeyCode = userAgent.match('Firefox') ? 59  : 186;
  var dashKeyCode      = userAgent.match('Firefox') ? 173 : 189;
  var leftCommandKeyCode;
  var rightCommandKeyCode;
  if (platform.match('Mac') && (userAgent.match('Safari') || userAgent.match('Chrome'))) {
    leftCommandKeyCode  = 91;
    rightCommandKeyCode = 93;
  } else if(platform.match('Mac') && userAgent.match('Opera')) {
    leftCommandKeyCode  = 17;
    rightCommandKeyCode = 17;
  } else if(platform.match('Mac') && userAgent.match('Firefox')) {
    leftCommandKeyCode  = 224;
    rightCommandKeyCode = 224;
  }
  locale.bindKeyCode(semicolonKeyCode,    ['semicolon', ';']);
  locale.bindKeyCode(dashKeyCode,         ['dash', '-']);
  locale.bindKeyCode(leftCommandKeyCode,  ['command', 'windows', 'win', 'super', 'leftcommand', 'leftwindows', 'leftwin', 'leftsuper']);
  locale.bindKeyCode(rightCommandKeyCode, ['command', 'windows', 'win', 'super', 'rightcommand', 'rightwindows', 'rightwin', 'rightsuper']);

  // kill keys
  locale.setKillKey('command');
};

},{}],7:[function(require,module,exports){
module.exports = function(subject) {
  validateSubject(subject);

  var eventsStorage = createEventsStorage(subject);
  subject.on = eventsStorage.on;
  subject.off = eventsStorage.off;
  subject.fire = eventsStorage.fire;
  return subject;
};

function createEventsStorage(subject) {
  // Store all event listeners to this hash. Key is event name, value is array
  // of callback records.
  //
  // A callback record consists of callback function and its optional context:
  // { 'eventName' => [{callback: function, ctx: object}] }
  var registeredEvents = Object.create(null);

  return {
    on: function (eventName, callback, ctx) {
      if (typeof callback !== 'function') {
        throw new Error('callback is expected to be a function');
      }
      var handlers = registeredEvents[eventName];
      if (!handlers) {
        handlers = registeredEvents[eventName] = [];
      }
      handlers.push({callback: callback, ctx: ctx});

      return subject;
    },

    off: function (eventName, callback) {
      var wantToRemoveAll = (typeof eventName === 'undefined');
      if (wantToRemoveAll) {
        // Killing old events storage should be enough in this case:
        registeredEvents = Object.create(null);
        return subject;
      }

      if (registeredEvents[eventName]) {
        var deleteAllCallbacksForEvent = (typeof callback !== 'function');
        if (deleteAllCallbacksForEvent) {
          delete registeredEvents[eventName];
        } else {
          var callbacks = registeredEvents[eventName];
          for (var i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].callback === callback) {
              callbacks.splice(i, 1);
            }
          }
        }
      }

      return subject;
    },

    fire: function (eventName) {
      var callbacks = registeredEvents[eventName];
      if (!callbacks) {
        return subject;
      }

      var fireArguments;
      if (arguments.length > 1) {
        fireArguments = Array.prototype.splice.call(arguments, 1);
      }
      for(var i = 0; i < callbacks.length; ++i) {
        var callbackInfo = callbacks[i];
        callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
      }

      return subject;
    }
  };
}

function validateSubject(subject) {
  if (!subject) {
    throw new Error('Eventify cannot use falsy object as events subject');
  }
  var reservedWords = ['on', 'fire', 'off'];
  for (var i = 0; i < reservedWords.length; ++i) {
    if (subject.hasOwnProperty(reservedWords[i])) {
      throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
    }
  }
}

},{}],8:[function(require,module,exports){
/**
 * @fileOverview Contains definition of the core graph object.
 */

// TODO: need to change storage layer:
// 1. Be able to get all nodes O(1)
// 2. Be able to get number of links O(1)

/**
 * @example
 *  var graph = require('ngraph.graph')();
 *  graph.addNode(1);     // graph has one node.
 *  graph.addLink(2, 3);  // now graph contains three nodes and one link.
 *
 */
module.exports = createGraph;

var eventify = require('ngraph.events');

/**
 * Creates a new graph
 */
function createGraph(options) {
  // Graph structure is maintained as dictionary of nodes
  // and array of links. Each node has 'links' property which
  // hold all links related to that node. And general links
  // array is used to speed up all links enumeration. This is inefficient
  // in terms of memory, but simplifies coding.
  options = options || {};
  if ('uniqueLinkId' in options) {
    console.warn(
      'ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\n' +
      'Use `multigraph` option instead\n',
      '\n',
      'Note: there is also change in default behavior: From now own each graph\n'+
      'is considered to be not a multigraph by default (each edge is unique).'
    );

    options.multigraph = options.uniqueLinkId;
  }

  // Dear reader, the non-multigraphs do not guarantee that there is only
  // one link for a given pair of node. When this option is set to false
  // we can save some memory and CPU (18% faster for non-multigraph);
  if (options.multigraph === undefined) options.multigraph = false;

  var nodes = typeof Object.create === 'function' ? Object.create(null) : {},
    links = [],
    // Hash of multi-edges. Used to track ids of edges between same nodes
    multiEdges = {},
    nodesCount = 0,
    suspendEvents = 0,

    forEachNode = createNodeIterator(),
    createLink = options.multigraph ? createUniqueLink : createSingleLink,

    // Our graph API provides means to listen to graph changes. Users can subscribe
    // to be notified about changes in the graph by using `on` method. However
    // in some cases they don't use it. To avoid unnecessary memory consumption
    // we will not record graph changes until we have at least one subscriber.
    // Code below supports this optimization.
    //
    // Accumulates all changes made during graph updates.
    // Each change element contains:
    //  changeType - one of the strings: 'add', 'remove' or 'update';
    //  node - if change is related to node this property is set to changed graph's node;
    //  link - if change is related to link this property is set to changed graph's link;
    changes = [],
    recordLinkChange = noop,
    recordNodeChange = noop,
    enterModification = noop,
    exitModification = noop;

  // this is our public API:
  var graphPart = {
    /**
     * Adds node to the graph. If node with given id already exists in the graph
     * its data is extended with whatever comes in 'data' argument.
     *
     * @param nodeId the node's identifier. A string or number is preferred.
     * @param [data] additional data for the node being added. If node already
     *   exists its data object is augmented with the new one.
     *
     * @return {node} The newly added node or node with given id if it already exists.
     */
    addNode: addNode,

    /**
     * Adds a link to the graph. The function always create a new
     * link between two nodes. If one of the nodes does not exists
     * a new node is created.
     *
     * @param fromId link start node id;
     * @param toId link end node id;
     * @param [data] additional data to be set on the new link;
     *
     * @return {link} The newly created link
     */
    addLink: addLink,

    /**
     * Removes link from the graph. If link does not exist does nothing.
     *
     * @param link - object returned by addLink() or getLinks() methods.
     *
     * @returns true if link was removed; false otherwise.
     */
    removeLink: removeLink,

    /**
     * Removes node with given id from the graph. If node does not exist in the graph
     * does nothing.
     *
     * @param nodeId node's identifier passed to addNode() function.
     *
     * @returns true if node was removed; false otherwise.
     */
    removeNode: removeNode,

    /**
     * Gets node with given identifier. If node does not exist undefined value is returned.
     *
     * @param nodeId requested node identifier;
     *
     * @return {node} in with requested identifier or undefined if no such node exists.
     */
    getNode: getNode,

    /**
     * Gets number of nodes in this graph.
     *
     * @return number of nodes in the graph.
     */
    getNodesCount: function () {
      return nodesCount;
    },

    /**
     * Gets total number of links in the graph.
     */
    getLinksCount: function () {
      return links.length;
    },

    /**
     * Gets all links (inbound and outbound) from the node with given id.
     * If node with given id is not found null is returned.
     *
     * @param nodeId requested node identifier.
     *
     * @return Array of links from and to requested node if such node exists;
     *   otherwise null is returned.
     */
    getLinks: getLinks,

    /**
     * Invokes callback on each node of the graph.
     *
     * @param {Function(node)} callback Function to be invoked. The function
     *   is passed one argument: visited node.
     */
    forEachNode: forEachNode,

    /**
     * Invokes callback on every linked (adjacent) node to the given one.
     *
     * @param nodeId Identifier of the requested node.
     * @param {Function(node, link)} callback Function to be called on all linked nodes.
     *   The function is passed two parameters: adjacent node and link object itself.
     * @param oriented if true graph treated as oriented.
     */
    forEachLinkedNode: forEachLinkedNode,

    /**
     * Enumerates all links in the graph
     *
     * @param {Function(link)} callback Function to be called on all links in the graph.
     *   The function is passed one parameter: graph's link object.
     *
     * Link object contains at least the following fields:
     *  fromId - node id where link starts;
     *  toId - node id where link ends,
     *  data - additional data passed to graph.addLink() method.
     */
    forEachLink: forEachLink,

    /**
     * Suspend all notifications about graph changes until
     * endUpdate is called.
     */
    beginUpdate: enterModification,

    /**
     * Resumes all notifications about graph changes and fires
     * graph 'changed' event in case there are any pending changes.
     */
    endUpdate: exitModification,

    /**
     * Removes all nodes and links from the graph.
     */
    clear: clear,

    /**
     * Detects whether there is a link between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     * NOTE: this function is synonim for getLink()
     *
     * @returns link if there is one. null otherwise.
     */
    hasLink: getLink,

    /**
     * Detects whether there is a node with given id
     * 
     * Operation complexity is O(1)
     * NOTE: this function is synonim for getNode()
     *
     * @returns node if there is one; Falsy value otherwise.
     */
    hasNode: getNode,

    /**
     * Gets an edge between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     *
     * @param {string} fromId link start identifier
     * @param {string} toId link end identifier
     *
     * @returns link if there is one. null otherwise.
     */
    getLink: getLink
  };

  // this will add `on()` and `fire()` methods.
  eventify(graphPart);

  monitorSubscribers();

  return graphPart;

  function monitorSubscribers() {
    var realOn = graphPart.on;

    // replace real `on` with our temporary on, which will trigger change
    // modification monitoring:
    graphPart.on = on;

    function on() {
      // now it's time to start tracking stuff:
      graphPart.beginUpdate = enterModification = enterModificationReal;
      graphPart.endUpdate = exitModification = exitModificationReal;
      recordLinkChange = recordLinkChangeReal;
      recordNodeChange = recordNodeChangeReal;

      // this will replace current `on` method with real pub/sub from `eventify`.
      graphPart.on = realOn;
      // delegate to real `on` handler:
      return realOn.apply(graphPart, arguments);
    }
  }

  function recordLinkChangeReal(link, changeType) {
    changes.push({
      link: link,
      changeType: changeType
    });
  }

  function recordNodeChangeReal(node, changeType) {
    changes.push({
      node: node,
      changeType: changeType
    });
  }

  function addNode(nodeId, data) {
    if (nodeId === undefined) {
      throw new Error('Invalid node identifier');
    }

    enterModification();

    var node = getNode(nodeId);
    if (!node) {
      node = new Node(nodeId, data);
      nodesCount++;
      recordNodeChange(node, 'add');
    } else {
      node.data = data;
      recordNodeChange(node, 'update');
    }

    nodes[nodeId] = node;

    exitModification();
    return node;
  }

  function getNode(nodeId) {
    return nodes[nodeId];
  }

  function removeNode(nodeId) {
    var node = getNode(nodeId);
    if (!node) {
      return false;
    }

    enterModification();

    var prevLinks = node.links;
    if (prevLinks) {
      node.links = null;
      for(var i = 0; i < prevLinks.length; ++i) {
        removeLink(prevLinks[i]);
      }
    }

    delete nodes[nodeId];
    nodesCount--;

    recordNodeChange(node, 'remove');

    exitModification();

    return true;
  }


  function addLink(fromId, toId, data) {
    enterModification();

    var fromNode = getNode(fromId) || addNode(fromId);
    var toNode = getNode(toId) || addNode(toId);

    var link = createLink(fromId, toId, data);

    links.push(link);

    // TODO: this is not cool. On large graphs potentially would consume more memory.
    addLinkToNode(fromNode, link);
    if (fromId !== toId) {
      // make sure we are not duplicating links for self-loops
      addLinkToNode(toNode, link);
    }

    recordLinkChange(link, 'add');

    exitModification();

    return link;
  }

  function createSingleLink(fromId, toId, data) {
    var linkId = makeLinkId(fromId, toId);
    return new Link(fromId, toId, data, linkId);
  }

  function createUniqueLink(fromId, toId, data) {
    // TODO: Get rid of this method.
    var linkId = makeLinkId(fromId, toId);
    var isMultiEdge = multiEdges.hasOwnProperty(linkId);
    if (isMultiEdge || getLink(fromId, toId)) {
      if (!isMultiEdge) {
        multiEdges[linkId] = 0;
      }
      var suffix = '@' + (++multiEdges[linkId]);
      linkId = makeLinkId(fromId + suffix, toId + suffix);
    }

    return new Link(fromId, toId, data, linkId);
  }

  function getLinks(nodeId) {
    var node = getNode(nodeId);
    return node ? node.links : null;
  }

  function removeLink(link) {
    if (!link) {
      return false;
    }
    var idx = indexOfElementInArray(link, links);
    if (idx < 0) {
      return false;
    }

    enterModification();

    links.splice(idx, 1);

    var fromNode = getNode(link.fromId);
    var toNode = getNode(link.toId);

    if (fromNode) {
      idx = indexOfElementInArray(link, fromNode.links);
      if (idx >= 0) {
        fromNode.links.splice(idx, 1);
      }
    }

    if (toNode) {
      idx = indexOfElementInArray(link, toNode.links);
      if (idx >= 0) {
        toNode.links.splice(idx, 1);
      }
    }

    recordLinkChange(link, 'remove');

    exitModification();

    return true;
  }

  function getLink(fromNodeId, toNodeId) {
    // TODO: Use sorted links to speed this up
    var node = getNode(fromNodeId),
      i;
    if (!node || !node.links) {
      return null;
    }

    for (i = 0; i < node.links.length; ++i) {
      var link = node.links[i];
      if (link.fromId === fromNodeId && link.toId === toNodeId) {
        return link;
      }
    }

    return null; // no link.
  }

  function clear() {
    enterModification();
    forEachNode(function(node) {
      removeNode(node.id);
    });
    exitModification();
  }

  function forEachLink(callback) {
    var i, length;
    if (typeof callback === 'function') {
      for (i = 0, length = links.length; i < length; ++i) {
        callback(links[i]);
      }
    }
  }

  function forEachLinkedNode(nodeId, callback, oriented) {
    var node = getNode(nodeId);

    if (node && node.links && typeof callback === 'function') {
      if (oriented) {
        return forEachOrientedLink(node.links, nodeId, callback);
      } else {
        return forEachNonOrientedLink(node.links, nodeId, callback);
      }
    }
  }

  function forEachNonOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      var linkedNodeId = link.fromId === nodeId ? link.toId : link.fromId;

      quitFast = callback(nodes[linkedNodeId], link);
      if (quitFast) {
        return true; // Client does not need more iterations. Break now.
      }
    }
  }

  function forEachOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      if (link.fromId === nodeId) {
        quitFast = callback(nodes[link.toId], link);
        if (quitFast) {
          return true; // Client does not need more iterations. Break now.
        }
      }
    }
  }

  // we will not fire anything until users of this library explicitly call `on()`
  // method.
  function noop() {}

  // Enter, Exit modification allows bulk graph updates without firing events.
  function enterModificationReal() {
    suspendEvents += 1;
  }

  function exitModificationReal() {
    suspendEvents -= 1;
    if (suspendEvents === 0 && changes.length > 0) {
      graphPart.fire('changed', changes);
      changes.length = 0;
    }
  }

  function createNodeIterator() {
    // Object.keys iterator is 1.3x faster than `for in` loop.
    // See `https://github.com/anvaka/ngraph.graph/tree/bench-for-in-vs-obj-keys`
    // branch for perf test
    return Object.keys ? objectKeysIterator : forInIterator;
  }

  function objectKeysIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    var keys = Object.keys(nodes);
    for (var i = 0; i < keys.length; ++i) {
      if (callback(nodes[keys[i]])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }

  function forInIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }
    var node;

    for (node in nodes) {
      if (callback(nodes[node])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }
}

// need this for old browsers. Should this be a separate module?
function indexOfElementInArray(element, array) {
  if (!array) return -1;

  if (array.indexOf) {
    return array.indexOf(element);
  }

  var len = array.length,
    i;

  for (i = 0; i < len; i += 1) {
    if (array[i] === element) {
      return i;
    }
  }

  return -1;
}

/**
 * Internal structure to represent node;
 */
function Node(id, data) {
  this.id = id;
  this.links = null;
  this.data = data;
}

function addLinkToNode(node, link) {
  if (node.links) {
    node.links.push(link);
  } else {
    node.links = [link];
  }
}

/**
 * Internal structure to represent links;
 */
function Link(fromId, toId, data, id) {
  this.fromId = fromId;
  this.toId = toId;
  this.data = data;
  this.id = id;
}

function hashCode(str) {
  var hash = 0, i, chr, len;
  if (str.length == 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function makeLinkId(fromId, toId) {
  return fromId.toString() + '👉 ' + toId.toString();
}

},{"ngraph.events":7}],9:[function(require,module,exports){
/**
 * Based on https://github.com/mourner/tinyqueue
 * Copyright (c) 2017, Vladimir Agafonkin https://github.com/mourner/tinyqueue/blob/master/LICENSE
 * 
 * Adapted for PathFinding needs by @anvaka
 * Copyright (c) 2017, Andrei Kashcha
 */
module.exports = NodeHeap;

function NodeHeap(data, options) {
  if (!(this instanceof NodeHeap)) return new NodeHeap(data, options);

  if (!Array.isArray(data)) {
    // assume first argument is our config object;
    options = data;
    data = [];
  }

  options = options || {};

  this.data = data || [];
  this.length = this.data.length;
  this.compare = options.compare || defaultCompare;
  this.setNodeId = options.setNodeId || noop;

  if (this.length > 0) {
    for (var i = (this.length >> 1); i >= 0; i--) this._down(i);
  }

  if (options.setNodeId) {
    for (var i = 0; i < this.length; ++i) {
      this.setNodeId(this.data[i], i);
    }
  }
}

function noop() {}

function defaultCompare(a, b) {
  return a - b;
}

NodeHeap.prototype = {

  push: function (item) {
    this.data.push(item);
    this.setNodeId(item, this.length);
    this.length++;
    this._up(this.length - 1);
  },

  pop: function () {
    if (this.length === 0) return undefined;

    var top = this.data[0];
    this.length--;

    if (this.length > 0) {
      this.data[0] = this.data[this.length];
      this.setNodeId(this.data[0], 0);
      this._down(0);
    }
    this.data.pop();

    return top;
  },

  peek: function () {
    return this.data[0];
  },

  updateItem: function (pos) {
    this._down(pos);
    this._up(pos);
  },

  _up: function (pos) {
    var data = this.data;
    var compare = this.compare;
    var setNodeId = this.setNodeId;
    var item = data[pos];

    while (pos > 0) {
      var parent = (pos - 1) >> 1;
      var current = data[parent];
      if (compare(item, current) >= 0) break;
        data[pos] = current;

       setNodeId(current, pos);
       pos = parent;
    }

    data[pos] = item;
    setNodeId(item, pos);
  },

  _down: function (pos) {
    var data = this.data;
    var compare = this.compare;
    var halfLength = this.length >> 1;
    var item = data[pos];
    var setNodeId = this.setNodeId;

    while (pos < halfLength) {
      var left = (pos << 1) + 1;
      var right = left + 1;
      var best = data[left];

      if (right < this.length && compare(data[right], best) < 0) {
        left = right;
        best = data[right];
      }
      if (compare(best, item) >= 0) break;

      data[pos] = best;
      setNodeId(best, pos);
      pos = left;
    }

    data[pos] = item;
    setNodeId(item, pos);
  }
};
},{}],10:[function(require,module,exports){
/**
 * Performs suboptimal, greed A Star path finding.
 * This finder does not necessary finds the shortest path. The path
 * that it finds is very close to the shortest one. It is very fast though.
 */
module.exports = aStarBi;

var NodeHeap = require('./NodeHeap');
var makeSearchStatePool = require('./makeSearchStatePool');
var heuristics = require('./heuristics');
var defaultSettings = require('./defaultSettings');

var BY_FROM = 1;
var BY_TO = 2;
var NO_PATH = defaultSettings.NO_PATH;

module.exports.l2 = heuristics.l2;
module.exports.l1 = heuristics.l1;

/**
 * Creates a new instance of pathfinder. A pathfinder has just one method:
 * `find(fromId, toId)`, it may be extended in future.
 * 
 * NOTE: Algorithm implemented in this code DOES NOT find optimal path.
 * Yet the path that it finds is always near optimal, and it finds it very fast.
 * 
 * @param {ngraph.graph} graph instance. See https://github.com/anvaka/ngraph.graph
 * 
 * @param {Object} options that configures search
 * @param {Function(a, b)} options.heuristic - a function that returns estimated distance between
 * nodes `a` and `b`.  Defaults function returns 0, which makes this search equivalent to Dijkstra search.
 * @param {Function(a, b)} options.distance - a function that returns actual distance between two
 * nodes `a` and `b`. By default this is set to return graph-theoretical distance (always 1);
 * 
 * @returns {Object} A pathfinder with single method `find()`.
 */
function aStarBi(graph, options) {
  options = options || {};
  // whether traversal should be considered over oriented graph.
  var oriented = options.oriented;

  var heuristic = options.heuristic;
  if (!heuristic) heuristic = defaultSettings.heuristic;

  var distance = options.distance;
  if (!distance) distance = defaultSettings.distance;
  var pool = makeSearchStatePool();

  return {
    find: find
  };

  function find(fromId, toId) {
    // Not sure if we should return NO_PATH or throw. Throw seem to be more
    // helpful to debug errors. So, throwing.
    var from = graph.getNode(fromId);
    if (!from) throw new Error('fromId is not defined in this graph: ' + fromId);
    var to = graph.getNode(toId);
    if (!to) throw new Error('toId is not defined in this graph: ' + toId);

    if (from === to) return [from]; // trivial case.

    pool.reset();

    var callVisitor = oriented ? orientedVisitor : nonOrientedVisitor;

    // Maps nodeId to NodeSearchState.
    var nodeState = new Map();

    var openSetFrom = new NodeHeap({
      compare: defaultSettings.compareFScore,
      setNodeId: defaultSettings.setHeapIndex
    });

    var openSetTo = new NodeHeap({
      compare: defaultSettings.compareFScore,
      setNodeId: defaultSettings.setHeapIndex
    });


    var startNode = pool.createNewState(from);
    nodeState.set(fromId, startNode);

    // For the first node, fScore is completely heuristic.
    startNode.fScore = heuristic(from, to);
    // The cost of going from start to start is zero.
    startNode.distanceToSource = 0;
    openSetFrom.push(startNode);
    startNode.open = BY_FROM;

    var endNode = pool.createNewState(to);
    endNode.fScore = heuristic(to, from);
    endNode.distanceToSource = 0;
    openSetTo.push(endNode);
    endNode.open = BY_TO;

    // Cost of the best solution found so far. Used for accurate termination
    var lMin = Number.POSITIVE_INFINITY;
    var minFrom;
    var minTo;

    var currentSet = openSetFrom;
    var currentOpener = BY_FROM;

    while (openSetFrom.length > 0 && openSetTo.length > 0) {
      if (openSetFrom.length < openSetTo.length) {
        // we pick a set with less elements
        currentOpener = BY_FROM;
        currentSet = openSetFrom;
      } else {
        currentOpener = BY_TO;
        currentSet = openSetTo;
      }

      var current = currentSet.pop();

      // no need to visit this node anymore
      current.closed = true;

      if (current.distanceToSource > lMin) continue;

      graph.forEachLinkedNode(current.node.id, callVisitor);

      if (minFrom && minTo) {
        // This is not necessary the best path, but we are so greedy that we
        // can't resist:
        return reconstructBiDirectionalPath(minFrom, minTo);
      }
    }

    return NO_PATH; // No path.

    function nonOrientedVisitor(otherNode, link) {
      return visitNode(otherNode, link, current);
    }

    function orientedVisitor(otherNode, link) {
      // For oritned graphs we need to reverse graph, when traveling
      // backwards. So, we use non-oriented ngraph's traversal, and 
      // filter link orientation here.
      if (currentOpener === BY_FROM) {
        if (link.fromId === current.node.id) return visitNode(otherNode, link, current)
      } else if (currentOpener === BY_TO) {
        if (link.toId === current.node.id) return visitNode(otherNode, link, current);
      }
    }

    function canExit(currentNode) {
      var opener = currentNode.open
      if (opener && opener !== currentOpener) {
        return true;
      }

      return false;
    }

    function reconstructBiDirectionalPath(a, b) {
      var pathOfNodes = [];
      var aParent = a;
      while(aParent) {
        pathOfNodes.push(aParent.node);
        aParent = aParent.parent;
      }
      var bParent = b;
      while (bParent) {
        pathOfNodes.unshift(bParent.node);
        bParent = bParent.parent
      }
      return pathOfNodes;
    }

    function visitNode(otherNode, link, cameFrom) {
      var otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed) {
        // Already processed this node.
        return;
      }

      if (canExit(otherSearchState, cameFrom)) {
        // this node was opened by alternative opener. The sets intersect now,
        // we found an optimal path, that goes through *this* node. However, there
        // is no guarantee that this is the global optimal solution path.

        var potentialLMin = otherSearchState.distanceToSource + cameFrom.distanceToSource;
        if (potentialLMin < lMin) {
          minFrom = otherSearchState;
          minTo = cameFrom
          lMin = potentialLMin;
        }
        // we are done with this node.
        return;
      }

      var tentativeDistance = cameFrom.distanceToSource + distance(otherSearchState.node, cameFrom.node, link);

      if (tentativeDistance >= otherSearchState.distanceToSource) {
        // This would only make our path longer. Ignore this route.
        return;
      }

      // Choose target based on current working set:
      var target = (currentOpener === BY_FROM) ? to : from;
      var newFScore = tentativeDistance + heuristic(otherSearchState.node, target);
      if (newFScore >= lMin) {
        // this can't be optimal path, as we have already found a shorter path.
        return;
      }
      otherSearchState.fScore = newFScore;

      if (otherSearchState.open === 0) {
        // Remember this node in the current set
        currentSet.push(otherSearchState);
        currentSet.updateItem(otherSearchState.heapIndex);

        otherSearchState.open = currentOpener;
      }

      // bingo! we found shorter path:
      otherSearchState.parent = cameFrom;
      otherSearchState.distanceToSource = tentativeDistance;
    }
  }
}

},{"./NodeHeap":9,"./defaultSettings":12,"./heuristics":13,"./makeSearchStatePool":14}],11:[function(require,module,exports){
/**
 * Performs a uni-directional A Star search on graph.
 * 
 * We will try to minimize f(n) = g(n) + h(n), where
 * g(n) is actual distance from source node to `n`, and
 * h(n) is heuristic distance from `n` to target node.
 */
module.exports = aStarPathSearch;

var NodeHeap = require('./NodeHeap');
var makeSearchStatePool = require('./makeSearchStatePool');
var heuristics = require('./heuristics');
var defaultSettings = require('./defaultSettings.js');

var NO_PATH = defaultSettings.NO_PATH;

module.exports.l2 = heuristics.l2;
module.exports.l1 = heuristics.l1;

/**
 * Creates a new instance of pathfinder. A pathfinder has just one method:
 * `find(fromId, toId)`, it may be extended in future.
 * 
 * @param {ngraph.graph} graph instance. See https://github.com/anvaka/ngraph.graph
 * @param {Object} options that configures search
 * @param {Function(a, b)} options.heuristic - a function that returns estimated distance between
 * nodes `a` and `b`. This function should never overestimate actual distance between two
 * nodes (otherwise the found path will not be the shortest). Defaults function returns 0,
 * which makes this search equivalent to Dijkstra search.
 * @param {Function(a, b)} options.distance - a function that returns actual distance between two
 * nodes `a` and `b`. By default this is set to return graph-theoretical distance (always 1);
 * 
 * @returns {Object} A pathfinder with single method `find()`.
 */
function aStarPathSearch(graph, options) {
  options = options || {};
  // whether traversal should be considered over oriented graph.
  var oriented = options.oriented;

  var heuristic = options.heuristic;
  if (!heuristic) heuristic = defaultSettings.heuristic;

  var distance = options.distance;
  if (!distance) distance = defaultSettings.distance;
  var pool = makeSearchStatePool();

  return {
    /**
     * Finds a path between node `fromId` and `toId`.
     * @returns {Array} of nodes between `toId` and `fromId`. Empty array is returned
     * if no path is found.
     */
    find: find
  };

  function find(fromId, toId) {
    var from = graph.getNode(fromId);
    if (!from) throw new Error('fromId is not defined in this graph: ' + fromId);
    var to = graph.getNode(toId);
    if (!to) throw new Error('toId is not defined in this graph: ' + toId);
    pool.reset();

    // Maps nodeId to NodeSearchState.
    var nodeState = new Map();

    // the nodes that we still need to evaluate
    var openSet = new NodeHeap({
      compare: defaultSettings.compareFScore,
      setNodeId: defaultSettings.setHeapIndex
    });

    var startNode = pool.createNewState(from);
    nodeState.set(fromId, startNode);

    // For the first node, fScore is completely heuristic.
    startNode.fScore = heuristic(from, to);

    // The cost of going from start to start is zero.
    startNode.distanceToSource = 0;
    openSet.push(startNode);
    startNode.open = 1;

    var cameFrom;

    while (openSet.length > 0) {
      cameFrom = openSet.pop();
      if (goalReached(cameFrom, to)) return reconstructPath(cameFrom);

      // no need to visit this node anymore
      cameFrom.closed = true;
      graph.forEachLinkedNode(cameFrom.node.id, visitNeighbour, oriented);
    }

    // If we got here, then there is no path.
    return NO_PATH;

    function visitNeighbour(otherNode, link) {
      var otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed) {
        // Already processed this node.
        return;
      }
      if (otherSearchState.open === 0) {
        // Remember this node.
        openSet.push(otherSearchState);
        otherSearchState.open = 1;
      }

      var tentativeDistance = cameFrom.distanceToSource + distance(otherNode, cameFrom.node, link);
      if (tentativeDistance >= otherSearchState.distanceToSource) {
        // This would only make our path longer. Ignore this route.
        return;
      }

      // bingo! we found shorter path:
      otherSearchState.parent = cameFrom;
      otherSearchState.distanceToSource = tentativeDistance;
      otherSearchState.fScore = tentativeDistance + heuristic(otherSearchState.node, to);

      openSet.updateItem(otherSearchState.heapIndex);
    }
  }
}

function goalReached(searchState, targetNode) {
  return searchState.node === targetNode;
}

function reconstructPath(searchState) {
  var path = [searchState.node];
  var parent = searchState.parent;

  while (parent) {
    path.push(parent.node);
    parent = parent.parent;
  }

  return path;
}

},{"./NodeHeap":9,"./defaultSettings.js":12,"./heuristics":13,"./makeSearchStatePool":14}],12:[function(require,module,exports){
// We reuse instance of array, but we trie to freeze it as well,
// so that consumers don't modify it. Maybe it's a bad idea.
var NO_PATH = [];
if (typeof Object.freeze === 'function') Object.freeze(NO_PATH);

module.exports = {
  // Path search settings
  heuristic: blindHeuristic,
  distance: constantDistance,
  compareFScore: compareFScore,
  NO_PATH: NO_PATH,

  // heap settings
  setHeapIndex: setHeapIndex,

  // nba:
  setH1: setH1,
  setH2: setH2,
  compareF1Score: compareF1Score,
  compareF2Score: compareF2Score,
}

function blindHeuristic(/* a, b */) {
  // blind heuristic makes this search equal to plain Dijkstra path search.
  return 0;
}

function constantDistance(/* a, b */) {
  return 1;
}

function compareFScore(a, b) {
  var result = a.fScore - b.fScore;
  // TODO: Can I improve speed with smarter ties-breaking?
  // I tried distanceToSource, but it didn't seem to have much effect
  return result;
}

function setHeapIndex(nodeSearchState, heapIndex) {
  nodeSearchState.heapIndex = heapIndex;
}

function compareF1Score(a, b) {
  return a.f1 - b.f1;
}

function compareF2Score(a, b) {
  return a.f2 - b.f2;
}

function setH1(node, heapIndex) {
  node.h1 = heapIndex;
}

function setH2(node, heapIndex) {
  node.h2 = heapIndex;
}
},{}],13:[function(require,module,exports){
module.exports = {
  l2: l2,
  l1: l1
};

/**
 * Euclid distance (l2 norm);
 * 
 * @param {*} a 
 * @param {*} b 
 */
function l2(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Manhattan distance (l1 norm);
 * @param {*} a 
 * @param {*} b 
 */
function l1(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.abs(dx) + Math.abs(dy);
}

},{}],14:[function(require,module,exports){
/**
 * This class represents a single search node in the exploration tree for
 * A* algorithm.
 * 
 * @param {Object} node  original node in the graph
 */
function NodeSearchState(node) {
  this.node = node;

  // How we came to this node?
  this.parent = null;

  this.closed = false;
  this.open = 0;

  this.distanceToSource = Number.POSITIVE_INFINITY;
  // the f(n) = g(n) + h(n) value
  this.fScore = Number.POSITIVE_INFINITY;

  // used to reconstruct heap when fScore is updated.
  this.heapIndex = -1;
};

function makeSearchStatePool() {
  var currentInCache = 0;
  var nodeCache = [];

  return {
    createNewState: createNewState,
    reset: reset
  };

  function reset() {
    currentInCache = 0;
  }

  function createNewState(node) {
    var cached = nodeCache[currentInCache];
    if (cached) {
      // TODO: This almost duplicates constructor code. Not sure if
      // it would impact performance if I move this code into a function
      cached.node = node;
      // How we came to this node?
      cached.parent = null;

      cached.closed = false;
      cached.open = 0;

      cached.distanceToSource = Number.POSITIVE_INFINITY;
      // the f(n) = g(n) + h(n) value
      cached.fScore = Number.POSITIVE_INFINITY;

      // used to reconstruct heap when fScore is updated.
      cached.heapIndex = -1;

    } else {
      cached = new NodeSearchState(node);
      nodeCache[currentInCache] = cached;
    }
    currentInCache++;
    return cached;
  }
}
module.exports = makeSearchStatePool;
},{}],15:[function(require,module,exports){
module.exports = nba;

var NodeHeap = require('../NodeHeap');
var heuristics = require('../heuristics');
var defaultSettings = require('../defaultSettings.js');
var makeNBASearchStatePool = require('./makeNBASearchStatePool.js');

var NO_PATH = defaultSettings.NO_PATH;

module.exports.l2 = heuristics.l2;
module.exports.l1 = heuristics.l1;

/**
 * Creates a new instance of pathfinder. A pathfinder has just one method:
 * `find(fromId, toId)`.
 * 
 * This is implementation of the NBA* algorithm described in 
 * 
 *  "Yet another bidirectional algorithm for shortest paths" paper by Wim Pijls and Henk Post
 * 
 * The paper is available here: https://repub.eur.nl/pub/16100/ei2009-10.pdf
 * 
 * @param {ngraph.graph} graph instance. See https://github.com/anvaka/ngraph.graph
 * @param {Object} options that configures search
 * @param {Function(a, b)} options.heuristic - a function that returns estimated distance between
 * nodes `a` and `b`. This function should never overestimate actual distance between two
 * nodes (otherwise the found path will not be the shortest). Defaults function returns 0,
 * which makes this search equivalent to Dijkstra search.
 * @param {Function(a, b)} options.distance - a function that returns actual distance between two
 * nodes `a` and `b`. By default this is set to return graph-theoretical distance (always 1);
 * 
 * @returns {Object} A pathfinder with single method `find()`.
 */
function nba(graph, options) {
  options = options || {};
  // whether traversal should be considered over oriented graph.
  var oriented = options.oriented;
  var quitFast = options.quitFast;

  var heuristic = options.heuristic;
  if (!heuristic) heuristic = defaultSettings.heuristic;

  var distance = options.distance;
  if (!distance) distance = defaultSettings.distance;

  // During stress tests I noticed that garbage collection was one of the heaviest
  // contributors to the algorithm's speed. So I'm using an object pool to recycle nodes.
  var pool = makeNBASearchStatePool();

  return {
    /**
     * Finds a path between node `fromId` and `toId`.
     * @returns {Array} of nodes between `toId` and `fromId`. Empty array is returned
     * if no path is found.
     */
    find: find
  };

  function find(fromId, toId) {
    // I must apologize for the code duplication. This was the easiest way for me to
    // implement the algorithm fast.
    var from = graph.getNode(fromId);
    if (!from) throw new Error('fromId is not defined in this graph: ' + fromId);
    var to = graph.getNode(toId);
    if (!to) throw new Error('toId is not defined in this graph: ' + toId);

    pool.reset();

    // I must also apologize for somewhat cryptic names. The NBA* is bi-directional
    // search algorithm, which means it runs two searches in parallel. One runs
    // from source node to target, while the other one runs from target to source.
    // Everywhere where you see `1` it means it's for the forward search. `2` is for 
    // backward search.

    // For oriented graph path finding, we need to reverse the graph, so that
    // backward search visits correct link. Obviously we don't want to duplicate
    // the graph, instead we always traverse the graph as non-oriented, and filter
    // edges in `visitN1Oriented/visitN2Oritented`
    var forwardVisitor = oriented ? visitN1Oriented : visitN1;
    var reverseVisitor = oriented ? visitN2Oriented : visitN2;

    // Maps nodeId to NBASearchState.
    var nodeState = new Map();

    // These two heaps store nodes by their underestimated values.
    var open1Set = new NodeHeap({
      compare: defaultSettings.compareF1Score,
      setNodeId: defaultSettings.setH1
    });
    var open2Set = new NodeHeap({
      compare: defaultSettings.compareF2Score,
      setNodeId: defaultSettings.setH2
    });

    // This is where both searches will meet.
    var minNode;

    // The smallest path length seen so far is stored here:
    var lMin = Number.POSITIVE_INFINITY;

    // We start by putting start/end nodes to the corresponding heaps
    var startNode = pool.createNewState(from);
    nodeState.set(fromId, startNode); 
    startNode.g1 = 0;
    var f1 = heuristic(from, to);
    startNode.f1 = f1;
    open1Set.push(startNode);

    var endNode = pool.createNewState(to);
    nodeState.set(toId, endNode);
    endNode.g2 = 0;
    var f2 = f1; // they should agree originally
    endNode.f2 = f2;
    open2Set.push(endNode)

    // the `cameFrom` variable is accessed by both searches, so that we can store parents.
    var cameFrom;

    // this is the main algorithm loop:
    while (open2Set.length && open1Set.length) {
      if (open1Set.length < open2Set.length) {
        forwardSearch();
      } else {
        reverseSearch();
      }

      if (quitFast && minNode) break;
    }

    // If we got here, then there is no path.
    var path = reconstructPath(minNode);
    return path; // the public API is over

    function forwardSearch() {
      cameFrom = open1Set.pop();
      if (cameFrom.closed) {
        return;
      }

      cameFrom.closed = true;

      if (cameFrom.f1 < lMin && (cameFrom.g1 + f2 - heuristic(from, cameFrom.node)) < lMin) {
        graph.forEachLinkedNode(cameFrom.node.id, forwardVisitor);
      }

      if (open1Set.length > 0) {
        f1 = open1Set.peek().f1;
      } 
    }

    function reverseSearch() {
      cameFrom = open2Set.pop();
      if (cameFrom.closed) {
        return;
      }
      cameFrom.closed = true;

      if (cameFrom.f2 < lMin && (cameFrom.g2 + f1 - heuristic(cameFrom.node, to)) < lMin) {
        graph.forEachLinkedNode(cameFrom.node.id, reverseVisitor);
      }

      if (open2Set.length > 0) {
        f2 = open2Set.peek().f2;
      }
    }

    function visitN1(otherNode, link) {
      var otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed) return;

      var tentativeDistance = cameFrom.g1 + distance(cameFrom.node, otherNode, link);

      if (tentativeDistance < otherSearchState.g1) {
        otherSearchState.g1 = tentativeDistance;
        otherSearchState.f1 = tentativeDistance + heuristic(otherSearchState.node, to);
        otherSearchState.p1 = cameFrom;
        if (otherSearchState.h1 < 0) {
          open1Set.push(otherSearchState);
        } else {
          open1Set.updateItem(otherSearchState.h1);
        }
      }
      var potentialMin = otherSearchState.g1 + otherSearchState.g2;
      if (potentialMin < lMin) { 
        lMin = potentialMin;
        minNode = otherSearchState;
      }
    }

    function visitN2(otherNode, link) {
      var otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed) return;

      var tentativeDistance = cameFrom.g2 + distance(cameFrom.node, otherNode, link);

      if (tentativeDistance < otherSearchState.g2) {
        otherSearchState.g2 = tentativeDistance;
        otherSearchState.f2 = tentativeDistance + heuristic(from, otherSearchState.node);
        otherSearchState.p2 = cameFrom;
        if (otherSearchState.h2 < 0) {
          open2Set.push(otherSearchState);
        } else {
          open2Set.updateItem(otherSearchState.h2);
        }
      }
      var potentialMin = otherSearchState.g1 + otherSearchState.g2;
      if (potentialMin < lMin) {
        lMin = potentialMin;
        minNode = otherSearchState;
      }
    }

    function visitN2Oriented(otherNode, link) {
      // we are going backwards, graph needs to be reversed. 
      if (link.toId === cameFrom.node.id) return visitN2(otherNode, link);
    }
    function visitN1Oriented(otherNode, link) {
      // this is forward direction, so we should be coming FROM:
      if (link.fromId === cameFrom.node.id) return visitN1(otherNode, link);
    }
  }
}

function reconstructPath(searchState) {
  if (!searchState) return NO_PATH;

  var path = [searchState.node];
  var parent = searchState.p1;

  while (parent) {
    path.push(parent.node);
    parent = parent.p1;
  }

  var child = searchState.p2;

  while (child) {
    path.unshift(child.node);
    child = child.p2;
  }
  return path;
}

},{"../NodeHeap":9,"../defaultSettings.js":12,"../heuristics":13,"./makeNBASearchStatePool.js":16}],16:[function(require,module,exports){
module.exports = makeNBASearchStatePool;

/**
 * Creates new instance of NBASearchState. The instance stores information
 * about search state, and is used by NBA* algorithm.
 *
 * @param {Object} node - original graph node
 */
function NBASearchState(node) {
  /**
   * Original graph node.
   */
  this.node = node;

  /**
   * Parent of this node in forward search
   */
  this.p1 = null;

  /**
   * Parent of this node in reverse search
   */
  this.p2 = null;

  /**
   * If this is set to true, then the node was already processed
   * and we should not touch it anymore.
   */
  this.closed = false;

  /**
   * Actual distance from this node to its parent in forward search
   */
  this.g1 = Number.POSITIVE_INFINITY;

  /**
   * Actual distance from this node to its parent in reverse search
   */
  this.g2 = Number.POSITIVE_INFINITY;


  /**
   * Underestimated distance from this node to the path-finding source.
   */
  this.f1 = Number.POSITIVE_INFINITY;

  /**
   * Underestimated distance from this node to the path-finding target.
   */
  this.f2 = Number.POSITIVE_INFINITY;

  // used to reconstruct heap when fScore is updated. TODO: do I need them both?

  /**
   * Index of this node in the forward heap.
   */
  this.h1 = -1;

  /**
   * Index of this node in the reverse heap.
   */
  this.h2 = -1;
}

/**
 * As path-finding is memory-intensive process, we want to reduce pressure on
 * garbage collector. This class helps us to recycle path-finding nodes and significantly
 * reduces the search time (~20% faster than without it).
 */
function makeNBASearchStatePool() {
  var currentInCache = 0;
  var nodeCache = [];

  return {
    /**
     * Creates a new NBASearchState instance
     */
    createNewState: createNewState,

    /**
     * Marks all created instances available for recycling.
     */
    reset: reset
  };

  function reset() {
    currentInCache = 0;
  }

  function createNewState(node) {
    var cached = nodeCache[currentInCache];
    if (cached) {
      // TODO: This almost duplicates constructor code. Not sure if
      // it would impact performance if I move this code into a function
      cached.node = node;

      // How we came to this node?
      cached.p1 = null;
      cached.p2 = null;

      cached.closed = false;

      cached.g1 = Number.POSITIVE_INFINITY;
      cached.g2 = Number.POSITIVE_INFINITY;
      cached.f1 = Number.POSITIVE_INFINITY;
      cached.f2 = Number.POSITIVE_INFINITY;

      // used to reconstruct heap when fScore is updated.
      cached.h1 = -1;
      cached.h2 = -1;
    } else {
      cached = new NBASearchState(node);
      nodeCache[currentInCache] = cached;
    }
    currentInCache++;
    return cached;
  }
}

},{}],17:[function(require,module,exports){
module.exports = {
  aStar: require('./a-star/a-star.js'),
  aGreedy: require('./a-star/a-greedy-star'),
  nba: require('./a-star/nba/index.js'),
}

},{"./a-star/a-greedy-star":10,"./a-star/a-star.js":11,"./a-star/nba/index.js":15}],18:[function(require,module,exports){
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
  roundPixels: true,
  autoResize: true,
  resolution: 1,
  autoStart: false
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.resize(window.innerWidth, window.innerHeight);

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.changeStage();
app.start();
app.changeScene(_LoadingScene2.default);

},{"./lib/Application":21,"./scenes/LoadingScene":61}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var IS_MOBILE = exports.IS_MOBILE = function (a) {
  return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))
  );
}(navigator.userAgent || navigator.vendor || window.opera);

var CEIL_SIZE = exports.CEIL_SIZE = 32;

var ABILITY_MOVE = exports.ABILITY_MOVE = Symbol('move');
var ABILITY_CAMERA = exports.ABILITY_CAMERA = Symbol('camera');
var ABILITY_OPERATE = exports.ABILITY_OPERATE = Symbol('operate');
var ABILITY_KEY_MOVE = exports.ABILITY_KEY_MOVE = Symbol('key-move');
var ABILITY_HEALTH = exports.ABILITY_HEALTH = Symbol('health');
var ABILITY_CARRY = exports.ABILITY_CARRY = Symbol('carry');
var ABILITY_LEARN = exports.ABILITY_LEARN = Symbol('learn');
var ABILITY_PLACE = exports.ABILITY_PLACE = Symbol('place');
var ABILITY_KEY_PLACE = exports.ABILITY_KEY_PLACE = Symbol('key-place');
var ABILITY_KEY_FIRE = exports.ABILITY_KEY_FIRE = Symbol('fire');
var ABILITY_ROTATE = exports.ABILITY_ROTATE = Symbol('rotate');
var ABILITIES_ALL = exports.ABILITIES_ALL = [ABILITY_MOVE, ABILITY_CAMERA, ABILITY_OPERATE, ABILITY_KEY_MOVE, ABILITY_HEALTH, ABILITY_CARRY, ABILITY_LEARN, ABILITY_PLACE, ABILITY_KEY_PLACE, ABILITY_KEY_FIRE, ABILITY_ROTATE];

// object type, static object, not collide with
var STATIC = exports.STATIC = 'static';
// collide with
var STAY = exports.STAY = 'stay';
// touch will reply
var REPLY = exports.REPLY = 'reply';

},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var LEFT = exports.LEFT = 'a';
var UP = exports.UP = 'w';
var RIGHT = exports.RIGHT = 'd';
var DOWN = exports.DOWN = 's';
var PLACE1 = exports.PLACE1 = '1';
var PLACE2 = exports.PLACE2 = '2';
var PLACE3 = exports.PLACE3 = '3';
var PLACE4 = exports.PLACE4 = '4';
var FIRE = exports.FIRE = 'f';

},{}],21:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
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

},{"./PIXI":28}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global PIXI, Bump */

exports.default = new Bump(PIXI);

},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../config/constants');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var o = {
  get: function get(target, property) {
    // has STAY object will return 1, otherwise 0
    if (property === 'weight') {
      return target.some(function (o) {
        return o.type === _constants.STAY;
      }) ? 1 : 0;
    } else {
      return target[property];
    }
  }
};

var GameObjects = function GameObjects() {
  _classCallCheck(this, GameObjects);

  for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
    items[_key] = arguments[_key];
  }

  return new Proxy([].concat(items), o);
};

exports.default = GameObjects;

},{"../config/constants":19}],24:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var LIGHT = Symbol('light');

var Light = function () {
  function Light() {
    _classCallCheck(this, Light);
  }

  _createClass(Light, null, [{
    key: 'lightOn',
    value: function lightOn(target, radius) {
      var rand = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var container = target.parent;
      if (!container.lighting) {
        // container does NOT has lighting property
        return;
      }
      var lightbulb = new _PIXI.Graphics();
      var rr = 0xff;
      var rg = 0xff;
      var rb = 0xff;
      var rad = radius * _constants.CEIL_SIZE;

      var x = target.width / 2 / target.scale.x;
      var y = target.height / 2 / target.scale.y;
      lightbulb.beginFill((rr << 16) + (rg << 8) + rb, 1.0);
      lightbulb.drawCircle(x, y, rad);
      lightbulb.endFill();
      lightbulb.parentLayer = container.lighting; // must has property: lighting

      target[LIGHT] = {
        light: lightbulb
      };
      target.addChild(lightbulb);

      if (rand !== 1) {
        var interval = setInterval(function () {
          var dScale = Math.random() * (1 - rand);
          if (lightbulb.scale.x > 1) {
            dScale = -dScale;
          }
          lightbulb.scale.x += dScale;
          lightbulb.scale.y += dScale;
          lightbulb.alpha += dScale;
        }, 1000 / 12);
        target[LIGHT].interval = interval;
      }
    }
  }, {
    key: 'lightOff',
    value: function lightOff(target) {
      if (!target[LIGHT]) {
        // no light to remove
        return;
      }
      // remove light
      target.removeChild(target[LIGHT].light);
      // remove interval
      clearInterval(target[LIGHT].interval);
      delete target[LIGHT];
      // remove listener
      target.off('removed', Light.lightOff);
    }
  }]);

  return Light;
}();

exports.default = Light;

},{"../config/constants":19,"./PIXI":28}],25:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

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

var _MapGraph = require('./MapGraph');

var _MapGraph2 = _interopRequireDefault(_MapGraph);

var _Bump = require('../lib/Bump');

var _Bump2 = _interopRequireDefault(_Bump);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var pipe = function pipe(first) {
  for (var _len = arguments.length, more = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    more[_key - 1] = arguments[_key];
  }

  return more.reduce(function (acc, curr) {
    return function () {
      return curr(acc.apply(undefined, arguments));
    };
  }, first);
};

var objectEvent = {
  place: function place(object, placed) {
    var position = object.position;
    this.addGameObject(placed, position.x, position.y);
  },
  fire: function fire(object, bullet) {
    this.addGameObject(bullet);
  },
  die: function die() {
    console.log('You die.');
  }
};

/**
 * events:
 *  use: object
 */

var Map = function (_Container) {
  _inherits(Map, _Container);

  function Map() {
    var _this$objects;

    var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    _classCallCheck(this, Map);

    var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this));

    _this.ceilSize = scale * _constants.CEIL_SIZE;
    _this.mapScale = scale;

    _this.objects = (_this$objects = {}, _defineProperty(_this$objects, _constants.STATIC, []), _defineProperty(_this$objects, _constants.STAY, []), _defineProperty(_this$objects, _constants.REPLY, []), _this$objects);
    _this.map = new _PIXI.Container();
    _this.addChild(_this.map);

    // player group
    _this.playerGroup = new _PIXI.display.Group();
    var playerLayer = new _PIXI.display.Layer(_this.playerGroup);
    _this.addChild(playerLayer);
    _this.mapGraph = new _MapGraph2.default();
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

      this.map.lighting = lighting;
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

      var ceilSize = this.ceilSize;

      if (mapData.hasFog) {
        this.enableFog();
      }
      var mapGraph = this.mapGraph;

      var addGameObject = function addGameObject(i, j, id, params) {
        var o = (0, _utils.instanceByItemId)(id, params);
        _this2.addGameObject(o, i * ceilSize, j * ceilSize);
        return [o, i, j];
      };

      var addGraph = function addGraph(_ref) {
        var _ref2 = _slicedToArray(_ref, 3),
            o = _ref2[0],
            i = _ref2[1],
            j = _ref2[2];

        return mapGraph.addObject(o, i, j);
      };

      var registerOn = function registerOn(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 3),
            o = _ref4[0],
            i = _ref4[1],
            j = _ref4[2];

        o.on('use', function () {
          return _this2.emit('use', o);
        });
        o.on('fire', objectEvent.fire.bind(_this2, o));
        // TODO: remove map item
        // delete items[i]
        return [o, i, j];
      };

      mapGraph.beginUpdate();

      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          pipe(addGameObject, registerOn, addGraph)(i, j, tiles[j * cols + i]);
        }
      }
      items.forEach(function (item) {
        var _item = _slicedToArray(item, 3),
            id = _item[0],
            _item$ = _slicedToArray(_item[1], 2),
            i = _item$[0],
            j = _item$[1],
            params = _item[2];

        pipe(addGameObject, registerOn, addGraph)(i, j, id, params);
      });

      mapGraph.endUpdate();
    }
  }, {
    key: 'addPlayer',
    value: function addPlayer(player, toPosition) {
      var _this3 = this;

      player.position.set(toPosition[0] * this.ceilSize, toPosition[1] * this.ceilSize);
      player.scale.set(this.mapScale, this.mapScale);
      player.parentGroup = this.playerGroup;
      this.map.addChild(player);

      Object.entries(objectEvent).forEach(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            eventName = _ref6[0],
            handler = _ref6[1];

        var eInstance = handler.bind(_this3, player);
        player.on(eventName, eInstance);
        player.once('removed', player.off.bind(player, eventName, eInstance));
      });
      this.objects[_constants.REPLY].push(player);

      // 自動找路
      // let moveAbility = player[ABILITY_MOVE]
      // if (moveAbility) {
      //   let points = ['4,1', '4,4', '11,1', '6,10']
      //   points.reduce((acc, cur) => {
      //     let path = this.mapGraph.find(acc, cur).map(node => {
      //       let [i, j] = node.id.split(',')
      //       return {x: i * this.ceilSize, y: j * this.ceilSize}
      //     })
      //     moveAbility.addPath(path)
      //     return cur
      //   })
      // }
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      var objects = this.objects[_constants.REPLY];
      objects.forEach(function (o) {
        return o.tick(delta);
      });

      var collisionDetect = function collisionDetect(o1, o2, f) {
        if (!o1 || !o2 || o1 === o2) {
          return;
        }
        if (f(o2, o1, true)) {
          o1.emit('collide', o2);
        }
      };

      var rectangleCollision = _Bump2.default.rectangleCollision.bind(_Bump2.default);
      var collideArr = this.objects[_constants.STAY];
      // collide detect
      for (var i = collideArr.length - 1; i >= 0; i--) {
        for (var j = objects.length - 1; j >= 0; j--) {
          pipe(collisionDetect)(collideArr[i], objects[j], rectangleCollision);
        }
      }

      var hitTestRectangle = _Bump2.default.hitTestRectangle.bind(_Bump2.default);
      collideArr = this.objects[_constants.REPLY];
      for (var _i = collideArr.length - 1; _i >= 0; _i--) {
        for (var _j = objects.length - 1; _j >= 0; _j--) {
          pipe(collisionDetect)(collideArr[_i], objects[_j], hitTestRectangle);
        }
      }
    }
  }, {
    key: 'addGameObject',
    value: function addGameObject(o) {
      var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      var mapScale = this.mapScale;
      // NOTICE: 此處的 Number 必須留著，否則字串傳入 set() 物件無法顯示
      if (x !== undefined) {
        o.position.set(x, y);
      }
      o.scale.set(mapScale, mapScale);
      this.map.addChild(o);

      var oArray = this.objects[o.type];
      oArray.push(o);
      o.once('removed', function () {
        var inx = oArray.indexOf(o);
        oArray.splice(inx, 1);
      });
    }

    // fog 的 parent container 不能被移動(會錯位)，因此改成修改 map 位置

  }, {
    key: 'position',
    get: function get() {
      return this.map.position;
    }
  }, {
    key: 'x',
    get: function get() {
      return this.map.x;
    },
    set: function set(x) {
      this.map.x = x;
    }
  }, {
    key: 'y',
    get: function get() {
      return this.map.y;
    },
    set: function set(y) {
      this.map.y = y;
    }
  }]);

  return Map;
}(_PIXI.Container);

exports.default = Map;

},{"../config/constants":19,"../lib/Bump":22,"./MapGraph":26,"./PIXI":28,"./utils":32}],26:[function(require,module,exports){
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

var _ngraph = require('ngraph.graph');

var _ngraph2 = _interopRequireDefault(_ngraph);

var _ngraph3 = require('ngraph.path');

var _ngraph4 = _interopRequireDefault(_ngraph3);

var _GameObjects = require('./GameObjects');

var _GameObjects2 = _interopRequireDefault(_GameObjects);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var MapGraph = function () {
  function MapGraph() {
    var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    _classCallCheck(this, MapGraph);

    this._graph = (0, _ngraph2.default)();
    this._finder = _ngraph4.default.aStar(this._graph, {
      // We tell our pathfinder what should it use as a distance function:
      distance: function distance(fromNode, toNode, link) {
        return fromNode.data.weight + toNode.data.weight + 1;
      }
    });
  }

  _createClass(MapGraph, [{
    key: 'addObject',
    value: function addObject(o, i, j) {
      var graph = this._graph;

      var selfName = [i, j].join(',');
      var node = graph.getNode(selfName);
      if (!node) {
        node = graph.addNode(selfName, new _GameObjects2.default(o));
      } else {
        node.data.push(o);
      }
      var link = function link(selfNode, otherNode) {
        if (!selfNode || !otherNode || graph.getLink(selfNode.id, otherNode.id)) {
          return;
        }
        var weight = selfNode.data.weight + otherNode.data.weight;
        if (weight === 0) {
          graph.addLink(selfNode.id, otherNode.id);
        }
      };
      if (node.data.weight !== 0) {
        // 此點不通，移除所有連結
        graph.forEachLinkedNode(selfName, function (linkedNode, link) {
          graph.removeLink(link);
        });
        return;
      }
      link(node, graph.getNode([i - 1, j].join(',')));
      link(node, graph.getNode([i, j - 1].join(',')));
      link(graph.getNode([i + 1, j].join(',')), node);
      link(graph.getNode([i, j + 1].join(',')), node);
    }
  }, {
    key: 'find',
    value: function find(from, to) {
      return this._finder.find(from, to);
    }
  }, {
    key: 'beginUpdate',
    value: function beginUpdate() {
      this._graph.beginUpdate();
    }
  }, {
    key: 'endUpdate',
    value: function endUpdate() {
      this._graph.endUpdate();
    }
  }]);

  return MapGraph;
}();

exports.default = MapGraph;

},{"./GameObjects":23,"ngraph.graph":8,"ngraph.path":17}],27:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var MAX_MESSAGE_COUNT = 500;

var Messages = function (_EventEmitter) {
  _inherits(Messages, _EventEmitter);

  function Messages() {
    _classCallCheck(this, Messages);

    var _this = _possibleConstructorReturn(this, (Messages.__proto__ || Object.getPrototypeOf(Messages)).call(this));

    _this._messages = [];
    return _this;
  }

  _createClass(Messages, [{
    key: 'add',
    value: function add(msg) {
      var length = this._messages.unshift(msg);
      if (length > MAX_MESSAGE_COUNT) {
        this._messages.pop();
      }
      this.emit('modified');
    }
  }, {
    key: 'list',
    get: function get() {
      return this._messages;
    }
  }]);

  return Messages;
}(_events2.default);

exports.default = new Messages();

},{"events":1}],28:[function(require,module,exports){
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
var utils = exports.utils = PIXI.utils;

},{}],29:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Scene = function (_display$Layer) {
  _inherits(Scene, _display$Layer);

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
}(_PIXI.display.Layer);

exports.default = Scene;

},{"./PIXI":28}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PIXI = require('../lib/PIXI');

var Texture = {
  get TerrainAtlas() {
    return _PIXI.resources['images/terrain_atlas.json'];
  },
  get BaseOutAtlas() {
    return _PIXI.resources['images/base_out_atlas.json'];
  },

  get Air() {
    return Texture.TerrainAtlas.textures['empty.png'];
  },
  get Grass() {
    return Texture.TerrainAtlas.textures['grass.png'];
  },
  get Ground() {
    return Texture.TerrainAtlas.textures['brick-tile.png'];
  },

  get Wall() {
    return Texture.TerrainAtlas.textures['wall.png'];
  },
  get IronFence() {
    return Texture.BaseOutAtlas.textures['iron-fence.png'];
  },
  get Root() {
    return Texture.TerrainAtlas.textures['root.png'];
  },
  get Tree() {
    return Texture.TerrainAtlas.textures['tree.png'];
  },

  get Treasure() {
    return Texture.BaseOutAtlas.textures['treasure.png'];
  },
  get Door() {
    return Texture.BaseOutAtlas.textures['iron-fence.png'];
  },
  get Torch() {
    return Texture.BaseOutAtlas.textures['torch.png'];
  },
  get GrassDecorate1() {
    return Texture.TerrainAtlas.textures['grass-decorate-1.png'];
  },
  get Bullet() {
    return _PIXI.resources['images/fire_bolt.png'].texture;
  },

  get Rock() {
    return Texture.TerrainAtlas.textures['rock.png'];
  }
};

exports.default = Texture;

},{"../lib/PIXI":28}],31:[function(require,module,exports){
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

var degrees = 180 / Math.PI;

var Vector = function () {
  function Vector(x, y) {
    _classCallCheck(this, Vector);

    this.x = x;
    this.y = y;
  }

  _createClass(Vector, [{
    key: "clone",
    value: function clone() {
      return new Vector(this.x, this.y);
    }
  }, {
    key: "add",
    value: function add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
  }, {
    key: "sub",
    value: function sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }
  }, {
    key: "invert",
    value: function invert() {
      return this.multiplyScalar(-1);
    }
  }, {
    key: "multiplyScalar",
    value: function multiplyScalar(s) {
      this.x *= s;
      this.y *= s;
      return this;
    }
  }, {
    key: "divideScalar",
    value: function divideScalar(s) {
      if (s === 0) {
        this.x = 0;
        this.y = 0;
      } else {
        return this.multiplyScalar(1 / s);
      }
      return this;
    }
  }, {
    key: "dot",
    value: function dot(v) {
      return this.x * v.x + this.y * v.y;
    }
  }, {
    key: "lengthSq",
    value: function lengthSq() {
      return this.x * this.x + this.y * this.y;
    }
  }, {
    key: "normalize",
    value: function normalize() {
      return this.divideScalar(this.length);
    }
  }, {
    key: "distanceTo",
    value: function distanceTo(v) {
      return Math.sqrt(this.distanceToSq(v));
    }
  }, {
    key: "distanceToSq",
    value: function distanceToSq(v) {
      var dx = this.x - v.x;
      var dy = this.y - v.y;
      return dx * dx + dy * dy;
    }
  }, {
    key: "set",
    value: function set(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }
  }, {
    key: "setX",
    value: function setX(x) {
      this.x = x;
      return this;
    }
  }, {
    key: "setY",
    value: function setY(y) {
      this.y = y;
      return this;
    }
  }, {
    key: "setLength",
    value: function setLength(l) {
      var oldLength = this.length;
      if (oldLength !== 0 && l !== oldLength) {
        this.multiplyScalar(l / oldLength);
      }
      return this;
    }
  }, {
    key: "lerp",
    value: function lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      return this;
    }
  }, {
    key: "equals",
    value: function equals(v) {
      return this.x === v.x && this.y === v.y;
    }
  }, {
    key: "rotate",
    value: function rotate(theta) {
      var xtemp = this.x;
      this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
      this.y = xtemp * Math.sin(theta) + this.y * Math.cos(theta);
      return this;
    }
  }, {
    key: "length",
    get: function get() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  }, {
    key: "rad",
    get: function get() {
      return Math.atan2(this.y, this.x);
    }
  }, {
    key: "deg",
    get: function get() {
      return this.rad * degrees;
    }
  }], [{
    key: "fromPoint",
    value: function fromPoint(p) {
      return new Vector(p.x, p.y);
    }
  }, {
    key: "fromRadLength",
    value: function fromRadLength(rad, length) {
      var x = length * Math.cos(rad);
      var y = length * Math.sin(rad);
      return new Vector(x, y);
    }
  }]);

  return Vector;
}();

exports.default = Vector;

},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.instanceByItemId = instanceByItemId;

var _Wall = require('../objects/Wall');

var _Wall2 = _interopRequireDefault(_Wall);

var _Air = require('../objects/Air');

var _Air2 = _interopRequireDefault(_Air);

var _Grass = require('../objects/Grass');

var _Grass2 = _interopRequireDefault(_Grass);

var _Treasure = require('../objects/Treasure');

var _Treasure2 = _interopRequireDefault(_Treasure);

var _Door = require('../objects/Door');

var _Door2 = _interopRequireDefault(_Door);

var _Torch = require('../objects/Torch');

var _Torch2 = _interopRequireDefault(_Torch);

var _Ground = require('../objects/Ground');

var _Ground2 = _interopRequireDefault(_Ground);

var _IronFence = require('../objects/IronFence');

var _IronFence2 = _interopRequireDefault(_IronFence);

var _Root = require('../objects/Root');

var _Root2 = _interopRequireDefault(_Root);

var _Tree = require('../objects/Tree');

var _Tree2 = _interopRequireDefault(_Tree);

var _GrassDecorate = require('../objects/GrassDecorate1');

var _GrassDecorate2 = _interopRequireDefault(_GrassDecorate);

var _Bullet = require('../objects/Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

var _WallShootBolt = require('../objects/WallShootBolt');

var _WallShootBolt2 = _interopRequireDefault(_WallShootBolt);

var _Move = require('../objects/abilities/Move');

var _Move2 = _interopRequireDefault(_Move);

var _Camera = require('../objects/abilities/Camera');

var _Camera2 = _interopRequireDefault(_Camera);

var _Operate = require('../objects/abilities/Operate');

var _Operate2 = _interopRequireDefault(_Operate);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// 0x0000 ~ 0x000f
var ItemsStatic = [_Air2.default, _Grass2.default, _Ground2.default];
// 0x0010 ~ 0x00ff
var ItemsStay = [
// 0x0010, 0x0011, 0x0012
_Wall2.default, _IronFence2.default, _Root2.default, _Tree2.default];
// 0x0100 ~ 0x01ff
var ItemsOther = [_Treasure2.default, _Door2.default, _Torch2.default, _GrassDecorate2.default, _Bullet2.default, _WallShootBolt2.default];
// 0x0200 ~ 0x02ff
var Abilities = [_Move2.default, _Camera2.default, _Operate2.default];

function instanceByItemId(itemId, params) {
  var Types = void 0;
  itemId = parseInt(itemId, 16);
  if ((itemId & 0xfff0) === 0) {
    // 地板
    Types = ItemsStatic;
  } else if ((itemId & 0xff00) === 0) {
    Types = ItemsStay;
    itemId -= 0x0010;
  } else if ((itemId & 0xff00) >>> 8 === 1) {
    Types = ItemsOther;
    itemId -= 0x0100;
  } else {
    Types = Abilities;
    itemId -= 0x0200;
  }
  return new Types[itemId](params);
}

},{"../objects/Air":33,"../objects/Bullet":34,"../objects/Door":36,"../objects/Grass":38,"../objects/GrassDecorate1":39,"../objects/Ground":40,"../objects/IronFence":41,"../objects/Root":42,"../objects/Torch":43,"../objects/Treasure":44,"../objects/Tree":45,"../objects/Wall":46,"../objects/WallShootBolt":47,"../objects/abilities/Camera":49,"../objects/abilities/Move":57,"../objects/abilities/Operate":58}],33:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Air = function (_GameObject) {
  _inherits(Air, _GameObject);

  function Air() {
    _classCallCheck(this, Air);

    // Create the cat sprite
    return _possibleConstructorReturn(this, (Air.__proto__ || Object.getPrototypeOf(Air)).call(this, _Texture2.default.Air));
  }

  _createClass(Air, [{
    key: 'type',
    get: function get() {
      return _constants.STATIC;
    }
  }]);

  return Air;
}(_GameObject3.default);

exports.default = Air;

},{"../config/constants":19,"../lib/Texture":30,"./GameObject":37}],34:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

var _GameObject2 = require('./GameObject');

var _GameObject3 = _interopRequireDefault(_GameObject2);

var _constants = require('../config/constants');

var _Learn = require('./abilities/Learn');

var _Learn2 = _interopRequireDefault(_Learn);

var _Move = require('../objects/abilities/Move');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Bullet = function (_GameObject) {
  _inherits(Bullet, _GameObject);

  function Bullet() {
    _classCallCheck(this, Bullet);

    var _this = _possibleConstructorReturn(this, (Bullet.__proto__ || Object.getPrototypeOf(Bullet)).call(this, _Texture2.default.Bullet));

    new _Learn2.default().carryBy(_this).learn(new _Move2.default([1, 0]));

    _this.on('collide', _this.actionWith.bind(_this));
    return _this;
  }

  _createClass(Bullet, [{
    key: 'actionWith',
    value: function actionWith(operator) {
      if (this.owner === operator || this.owner === operator.owner) {
        // 避免自殺
        return;
      }
      var healthAbility = operator[_constants.ABILITY_HEALTH];
      if (healthAbility) {
        healthAbility.getHurt({
          damage: 1
        });
      }

      this.parent.removeChild(this);
      this.destroy();
    }
  }, {
    key: 'setOwner',
    value: function setOwner(owner) {
      this.owner = owner;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Bullet';
    }
  }, {
    key: 'say',
    value: function say() {
      // say nothing
    }
  }, {
    key: 'setDirection',
    value: function setDirection(vector) {
      var moveAbility = this[_constants.ABILITY_MOVE];
      if (moveAbility) {
        moveAbility.setDirection(vector);
        this.rotation = vector.rad;
      }
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      var _this2 = this;

      Object.values(this.tickAbilities).forEach(function (ability) {
        return ability.tick(delta, _this2);
      });
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.REPLY;
    }
  }]);

  return Bullet;
}(_GameObject3.default);

exports.default = Bullet;

},{"../config/constants":19,"../lib/Texture":30,"../objects/abilities/Move":57,"./GameObject":37,"./abilities/Learn":56}],35:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

var _GameObject2 = require('./GameObject');

var _GameObject3 = _interopRequireDefault(_GameObject2);

var _Learn = require('./abilities/Learn');

var _Learn2 = _interopRequireDefault(_Learn);

var _Move = require('../objects/abilities/Move');

var _Move2 = _interopRequireDefault(_Move);

var _KeyMove = require('../objects/abilities/KeyMove');

var _KeyMove2 = _interopRequireDefault(_KeyMove);

var _Camera = require('../objects/abilities/Camera');

var _Camera2 = _interopRequireDefault(_Camera);

var _Carry = require('../objects/abilities/Carry');

var _Carry2 = _interopRequireDefault(_Carry);

var _Place = require('../objects/abilities/Place');

var _Place2 = _interopRequireDefault(_Place);

var _KeyPlace = require('../objects/abilities/KeyPlace');

var _KeyPlace2 = _interopRequireDefault(_KeyPlace);

var _Fire = require('../objects/abilities/Fire');

var _Fire2 = _interopRequireDefault(_Fire);

var _KeyFire = require('../objects/abilities/KeyFire');

var _KeyFire2 = _interopRequireDefault(_KeyFire);

var _Rotate = require('../objects/abilities/Rotate');

var _Rotate2 = _interopRequireDefault(_Rotate);

var _Health = require('../objects/abilities/Health');

var _Health2 = _interopRequireDefault(_Health);

var _Bullet = require('../objects/Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Cat = function (_GameObject) {
  _inherits(Cat, _GameObject);

  function Cat() {
    _classCallCheck(this, Cat);

    var _this = _possibleConstructorReturn(this, (Cat.__proto__ || Object.getPrototypeOf(Cat)).call(this, _Texture2.default.Rock));

    var carry = new _Carry2.default(3);
    new _Learn2.default().carryBy(_this).learn(new _Move2.default([3, 0])).learn(new _KeyMove2.default()).learn(new _Place2.default()).learn(new _KeyPlace2.default()).learn(new _Camera2.default(1)).learn(carry).learn(new _Fire2.default([3, 3])).learn(new _KeyFire2.default()).learn(new _Rotate2.default()).learn(new _Health2.default(1));

    var bullet = new _Bullet2.default();
    carry.take(bullet, Infinity);
    return _this;
  }

  _createClass(Cat, [{
    key: 'toString',
    value: function toString() {
      return 'you';
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      var _this2 = this;

      Object.values(this.tickAbilities).forEach(function (ability) {
        return ability.tick(delta, _this2);
      });
    }
  }]);

  return Cat;
}(_GameObject3.default);

exports.default = Cat;

},{"../lib/Texture":30,"../objects/Bullet":34,"../objects/abilities/Camera":49,"../objects/abilities/Carry":50,"../objects/abilities/Fire":51,"../objects/abilities/Health":52,"../objects/abilities/KeyFire":53,"../objects/abilities/KeyMove":54,"../objects/abilities/KeyPlace":55,"../objects/abilities/Move":57,"../objects/abilities/Place":59,"../objects/abilities/Rotate":60,"./GameObject":37,"./abilities/Learn":56}],36:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Door = function (_GameObject) {
  _inherits(Door, _GameObject);

  function Door(map) {
    _classCallCheck(this, Door);

    var _this = _possibleConstructorReturn(this, (Door.__proto__ || Object.getPrototypeOf(Door)).call(this, _Texture2.default.Door));
    // Create the cat sprite


    _this.map = map[0];
    _this.toPosition = map[1];

    _this.on('collide', _this.actionWith.bind(_this));
    return _this;
  }

  _createClass(Door, [{
    key: 'actionWith',
    value: function actionWith(operator) {
      var ability = operator[_constants.ABILITY_OPERATE];
      if (ability) {
        ability(this);
      } else {
        operator.emit('collide', this);
      }
    }
  }, {
    key: _constants.ABILITY_OPERATE,
    value: function value() {
      this.say(['Get in ', this.map, ' now.'].join(''));
      this.emit('use');
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Door';
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

},{"../config/constants":19,"../lib/Texture":30,"./GameObject":37}],37:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
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
    key: 'tick',
    value: function tick(delta) {}
  }, {
    key: 'type',
    get: function get() {
      return _constants.STATIC;
    }
  }]);

  return GameObject;
}(_PIXI.Sprite);

exports.default = GameObject;

},{"../config/constants":19,"../lib/Messages":27,"../lib/PIXI":28}],38:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Grass = function (_GameObject) {
  _inherits(Grass, _GameObject);

  function Grass() {
    _classCallCheck(this, Grass);

    // Create the cat sprite
    return _possibleConstructorReturn(this, (Grass.__proto__ || Object.getPrototypeOf(Grass)).call(this, _Texture2.default.Grass));
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

},{"../config/constants":19,"../lib/Texture":30,"./GameObject":37}],39:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var GrassDecorate1 = function (_GameObject) {
  _inherits(GrassDecorate1, _GameObject);

  function GrassDecorate1() {
    _classCallCheck(this, GrassDecorate1);

    return _possibleConstructorReturn(this, (GrassDecorate1.__proto__ || Object.getPrototypeOf(GrassDecorate1)).call(this, _Texture2.default.GrassDecorate1));
  }

  _createClass(GrassDecorate1, [{
    key: 'toString',
    value: function toString() {
      return 'GrassDecorate1';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.STATIC;
    }
  }]);

  return GrassDecorate1;
}(_GameObject3.default);

exports.default = GrassDecorate1;

},{"../config/constants":19,"../lib/Texture":30,"./GameObject":37}],40:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Ground = function (_GameObject) {
  _inherits(Ground, _GameObject);

  function Ground() {
    _classCallCheck(this, Ground);

    // Create the cat sprite
    return _possibleConstructorReturn(this, (Ground.__proto__ || Object.getPrototypeOf(Ground)).call(this, _Texture2.default.Ground));
  }

  _createClass(Ground, [{
    key: 'toString',
    value: function toString() {
      return 'Ground';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.STATIC;
    }
  }]);

  return Ground;
}(_GameObject3.default);

exports.default = Ground;

},{"../config/constants":19,"../lib/Texture":30,"./GameObject":37}],41:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var IronFence = function (_GameObject) {
  _inherits(IronFence, _GameObject);

  function IronFence(treasures) {
    _classCallCheck(this, IronFence);

    return _possibleConstructorReturn(this, (IronFence.__proto__ || Object.getPrototypeOf(IronFence)).call(this, _Texture2.default.IronFence));
  }

  _createClass(IronFence, [{
    key: 'type',
    get: function get() {
      return _constants.STAY;
    }
  }]);

  return IronFence;
}(_GameObject3.default);

exports.default = IronFence;

},{"../config/constants":19,"../lib/Texture":30,"./GameObject":37}],42:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Root = function (_GameObject) {
  _inherits(Root, _GameObject);

  function Root(treasures) {
    _classCallCheck(this, Root);

    // Create the cat sprite
    return _possibleConstructorReturn(this, (Root.__proto__ || Object.getPrototypeOf(Root)).call(this, _Texture2.default.Root));
  }

  _createClass(Root, [{
    key: 'type',
    get: function get() {
      return _constants.STAY;
    }
  }]);

  return Root;
}(_GameObject3.default);

exports.default = Root;

},{"../config/constants":19,"../lib/Texture":30,"./GameObject":37}],43:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

var _Light = require('../lib/Light');

var _Light2 = _interopRequireDefault(_Light);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Torch = function (_GameObject) {
  _inherits(Torch, _GameObject);

  function Torch() {
    _classCallCheck(this, Torch);

    var _this = _possibleConstructorReturn(this, (Torch.__proto__ || Object.getPrototypeOf(Torch)).call(this, _Texture2.default.Torch));

    var radius = 2;

    _this.on('added', _Light2.default.lightOn.bind(null, _this, radius, 0.95));
    _this.on('removeed', _Light2.default.lightOff.bind(null, _this));
    return _this;
  }

  _createClass(Torch, [{
    key: 'toString',
    value: function toString() {
      return 'torch';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.STATIC;
    }
  }]);

  return Torch;
}(_GameObject3.default);

exports.default = Torch;

},{"../config/constants":19,"../lib/Light":24,"../lib/Texture":30,"./GameObject":37}],44:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

var _GameObject2 = require('./GameObject');

var _GameObject3 = _interopRequireDefault(_GameObject2);

var _constants = require('../config/constants');

var _utils = require('../lib/utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Slot = function () {
  function Slot(_ref) {
    var _ref2 = _slicedToArray(_ref, 3),
        itemId = _ref2[0],
        params = _ref2[1],
        count = _ref2[2];

    _classCallCheck(this, Slot);

    this.item = (0, _utils.instanceByItemId)(itemId, params);
    this.count = count;
  }

  _createClass(Slot, [{
    key: 'toString',
    value: function toString() {
      return [this.item.toString(), '(', this.count, ')'].join('');
    }
  }]);

  return Slot;
}();

var Treasure = function (_GameObject) {
  _inherits(Treasure, _GameObject);

  function Treasure() {
    var inventories = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, Treasure);

    var _this = _possibleConstructorReturn(this, (Treasure.__proto__ || Object.getPrototypeOf(Treasure)).call(this, _Texture2.default.Treasure));
    // Create the cat sprite


    _this.inventories = inventories.map(function (treasure) {
      return new Slot(treasure);
    });

    _this.on('collide', _this.actionWith.bind(_this));
    return _this;
  }

  _createClass(Treasure, [{
    key: 'actionWith',
    value: function actionWith(operator) {
      var carryAbility = operator[_constants.ABILITY_CARRY];
      if (!carryAbility) {
        operator.say('I can\'t carry items not yet.');
        return;
      }

      this.inventories.forEach(function (treasure) {
        return carryAbility.take(treasure.item, treasure.count);
      });
      operator.say(['I taked ', this.toString()].join(''));

      this.parent.removeChild(this);
      this.destroy();
    }
  }, {
    key: 'toString',
    value: function toString() {
      return ['treasure: [', this.inventories.join(', '), ']'].join('');
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

},{"../config/constants":19,"../lib/Texture":30,"../lib/utils":32,"./GameObject":37}],45:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Tree = function (_GameObject) {
  _inherits(Tree, _GameObject);

  function Tree() {
    _classCallCheck(this, Tree);

    return _possibleConstructorReturn(this, (Tree.__proto__ || Object.getPrototypeOf(Tree)).call(this, _Texture2.default.Tree));
  }

  _createClass(Tree, [{
    key: 'type',
    get: function get() {
      return _constants.STAY;
    }
  }]);

  return Tree;
}(_GameObject3.default);

exports.default = Tree;

},{"../config/constants":19,"../lib/Texture":30,"./GameObject":37}],46:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Wall = function (_GameObject) {
  _inherits(Wall, _GameObject);

  function Wall(treasures) {
    _classCallCheck(this, Wall);

    var _this = _possibleConstructorReturn(this, (Wall.__proto__ || Object.getPrototypeOf(Wall)).call(this, _Texture2.default.Wall));
    // Create the cat sprite


    _this.on('collide', _this.actionWith.bind(_this));
    return _this;
  }

  _createClass(Wall, [{
    key: 'actionWith',
    value: function actionWith(operator) {
      operator.emit('collide', this);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Wall';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.STAY;
    }
  }]);

  return Wall;
}(_GameObject3.default);

exports.default = Wall;

},{"../config/constants":19,"../lib/Texture":30,"./GameObject":37}],47:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

var _GameObject2 = require('./GameObject');

var _GameObject3 = _interopRequireDefault(_GameObject2);

var _constants = require('../config/constants');

var _Learn = require('./abilities/Learn');

var _Learn2 = _interopRequireDefault(_Learn);

var _Carry = require('../objects/abilities/Carry');

var _Carry2 = _interopRequireDefault(_Carry);

var _Fire = require('../objects/abilities/Fire');

var _Fire2 = _interopRequireDefault(_Fire);

var _Health = require('../objects/abilities/Health');

var _Health2 = _interopRequireDefault(_Health);

var _Bullet = require('../objects/Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var WallShootBolt = function (_GameObject) {
  _inherits(WallShootBolt, _GameObject);

  function WallShootBolt(treasures) {
    _classCallCheck(this, WallShootBolt);

    var _this = _possibleConstructorReturn(this, (WallShootBolt.__proto__ || Object.getPrototypeOf(WallShootBolt)).call(this, _Texture2.default.Wall));
    // Create the cat sprite


    var carry = new _Carry2.default(3);
    new _Learn2.default().carryBy(_this).learn(new _Fire2.default([3, 3])).learn(carry).learn(new _Health2.default(1));

    var bullet = new _Bullet2.default();
    carry.take(bullet, Infinity);

    _this.on('collide', _this.actionWith.bind(_this));
    _this.on('die', _this.onDie.bind(_this));

    _this.anchor.set(0.5, 0.5);
    setInterval(function () {
      var rad = _this.rotation;
      _this[_constants.ABILITY_FIRE].fire(rad);
      _this[_constants.ABILITY_FIRE].fire(rad + Math.PI / 2);
      _this[_constants.ABILITY_FIRE].fire(rad + Math.PI);
      _this[_constants.ABILITY_FIRE].fire(rad + Math.PI / 2 * 3);
      console.log('fire');
    }, 200);

    setInterval(function () {
      _this.rotation += Math.PI / 30 / 10;
    }, 17);
    return _this;
  }

  _createClass(WallShootBolt, [{
    key: 'actionWith',
    value: function actionWith(operator) {
      operator.emit('collide', this);
    }
  }, {
    key: 'onDie',
    value: function onDie() {
      this.parent.removeChild(this);
      this.destroy();
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'WallShootBolt';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.STAY;
    }
  }]);

  return WallShootBolt;
}(_GameObject3.default);

exports.default = WallShootBolt;

},{"../config/constants":19,"../lib/Texture":30,"../objects/Bullet":34,"../objects/abilities/Carry":50,"../objects/abilities/Fire":51,"../objects/abilities/Health":52,"./GameObject":37,"./abilities/Learn":56}],48:[function(require,module,exports){
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

var type = Symbol('ability');

var Ability = function () {
  function Ability() {
    _classCallCheck(this, Ability);
  }

  _createClass(Ability, [{
    key: 'getSameTypeAbility',
    value: function getSameTypeAbility(owner) {
      return owner.abilities[this.type];
    }

    // 是否需置換

  }, {
    key: 'hasToReplace',
    value: function hasToReplace(owner, abilityNew) {
      var abilityOld = this.getSameTypeAbility(owner);
      return !abilityOld || abilityNew.isBetter(abilityOld);
    }

    // 新舊比較

  }, {
    key: 'isBetter',
    value: function isBetter(other) {
      return true;
    }

    // 配備此技能

  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      var abilityOld = this.getSameTypeAbility(owner);
      if (abilityOld) {
        // first get this type ability
        abilityOld.replacedBy(this, owner);
      }
      owner.abilities[this.type] = this;
    }
  }, {
    key: 'replacedBy',
    value: function replacedBy(other, owner) {}
  }, {
    key: 'dropBy',
    value: function dropBy(owner) {
      delete owner.abilities[this.type];
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'plz extend this class';
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {};
    }
  }, {
    key: 'type',
    get: function get() {
      return type;
    }
  }]);

  return Ability;
}();

exports.default = Ability;

},{}],49:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _Light = require('../../lib/Light');

var _Light2 = _interopRequireDefault(_Light);

var _constants = require('../../config/constants');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Camera = function (_Ability) {
  _inherits(Camera, _Ability);

  function Camera(value) {
    _classCallCheck(this, Camera);

    var _this = _possibleConstructorReturn(this, (Camera.__proto__ || Object.getPrototypeOf(Camera)).call(this));

    _this.radius = value;
    return _this;
  }

  _createClass(Camera, [{
    key: 'isBetter',
    value: function isBetter(other) {
      // 只會變大
      return this.radius >= other.radius;
    }

    // 配備此技能

  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      var _this2 = this;

      _get(Camera.prototype.__proto__ || Object.getPrototypeOf(Camera.prototype), 'carryBy', this).call(this, owner);
      if (owner.parent) {
        this.setup(owner, owner.parent);
      } else {
        owner.once('added', function (container) {
          return _this2.setup(owner, container);
        });
      }
    }
  }, {
    key: 'replacedBy',
    value: function replacedBy(other, owner) {
      this.dropBy(owner);
    }
  }, {
    key: 'setup',
    value: function setup(owner, container) {
      _Light2.default.lightOn(owner, this.radius);
      // 如果 owner 不被顯示
      owner.removed = this.onRemoved.bind(this, owner);
      owner.once('removed', owner.removed);
    }
  }, {
    key: 'onRemoved',
    value: function onRemoved(owner) {
      var _this3 = this;

      this.dropBy(owner);
      // owner 重新被顯示
      owner.once('added', function (container) {
        return _this3.setup(owner, container);
      });
    }
  }, {
    key: 'dropBy',
    value: function dropBy(owner) {
      _Light2.default.lightOff(owner);
      // remove listener
      owner.off('removed', owner.removed);
      delete owner.removed;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'light area: ' + this.radius;
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_CAMERA;
    }
  }]);

  return Camera;
}(_Ability3.default);

exports.default = Camera;

},{"../../config/constants":19,"../../lib/Light":24,"./Ability":48}],50:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _constants = require('../../config/constants');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function newSlot(item, count) {
  return {
    item: item,
    count: count,
    toString: function toString() {
      return [item.toString(), '(', this.count, ')'].join('');
    }
  };
}

var Carry = function (_Ability) {
  _inherits(Carry, _Ability);

  function Carry(initSlots) {
    _classCallCheck(this, Carry);

    var _this = _possibleConstructorReturn(this, (Carry.__proto__ || Object.getPrototypeOf(Carry)).call(this));

    _this.bags = [];
    _this.bags.push(Array(initSlots).fill());
    return _this;
  }

  _createClass(Carry, [{
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(Carry.prototype.__proto__ || Object.getPrototypeOf(Carry.prototype), 'carryBy', this).call(this, owner);
      this.owner = owner;
      owner[_constants.ABILITY_CARRY] = this;
    }
  }, {
    key: 'take',
    value: function take(item) {
      var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      var owner = this.owner;
      if (item instanceof _Ability3.default && owner[_constants.ABILITY_LEARN]) {
        // 取得能力
        owner[_constants.ABILITY_LEARN].learn(item);
        return;
      }
      var key = item.toString();
      var firstEmptySlot = void 0;
      var found = this.bags.some(function (bag, bi) {
        return bag.some(function (slot, si) {
          // 暫存第一個空格
          if (!slot && !firstEmptySlot) {
            firstEmptySlot = { si: si, bi: bi };
          }
          // 物品疊加(同類型)
          if (slot && slot.item.toString() === key) {
            slot.count += count;
            return true;
          }
          return false;
        });
      });
      if (!found) {
        if (!firstEmptySlot) {
          // 沒有空格可放物品
          owner.say('no empty slot for new item got.');
          return;
        }
        // 放入第一個空格
        this.bags[firstEmptySlot.bi][firstEmptySlot.si] = newSlot(item, count);
      }
      owner.emit('inventory-modified', item);
    }
  }, {
    key: 'getSlotItem',
    value: function getSlotItem(slotInx) {
      var bi = void 0;
      var si = void 0;
      // 照著包包加入順序查找
      var found = this.bags.find(function (bag, b) {
        bi = b;
        return bag.find(function (slot, s) {
          si = s;
          return slotInx-- === 0;
        });
      });
      var item = void 0;
      if (found) {
        found = this.bags[bi][si];
        item = found.item;
        // 取出後減一
        if (--found.count === 0) {
          this.bags[bi][si] = undefined;
        }
        this.owner.emit('inventory-modified', item);
      }
      return item;
    }
  }, {
    key: 'getItemByType',
    value: function getItemByType(type) {
      var bi = void 0;
      var si = void 0;
      var found = this.bags.find(function (bag, b) {
        bi = b;
        return bag.find(function (slot, s) {
          si = s;
          return slot && slot.item instanceof type;
        });
      });
      var item = void 0;
      if (found) {
        found = this.bags[bi][si];
        item = found.item;
        // 取出後減一
        if (--found.count === 0) {
          this.bags[bi][si] = undefined;
        }
        this.owner.emit('inventory-modified', item);
      }
      return item;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return ['carry: ', this.bags.join(', ')].join('');
    }

    // TODO: save data

  }, {
    key: 'serialize',
    value: function serialize() {
      return this.bags;
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_CARRY;
    }
  }]);

  return Carry;
}(_Ability3.default);

exports.default = Carry;

},{"../../config/constants":19,"./Ability":48}],51:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _constants = require('../../config/constants');

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

var _Vector = require('../../lib/Vector');

var _Vector2 = _interopRequireDefault(_Vector);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Fire = function (_Ability) {
  _inherits(Fire, _Ability);

  function Fire(_ref) {
    var _ref2 = _slicedToArray(_ref, 1),
        power = _ref2[0];

    _classCallCheck(this, Fire);

    // TODO: implement
    var _this = _possibleConstructorReturn(this, (Fire.__proto__ || Object.getPrototypeOf(Fire)).call(this));

    _this.power = power;
    return _this;
  }

  _createClass(Fire, [{
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(Fire.prototype.__proto__ || Object.getPrototypeOf(Fire.prototype), 'carryBy', this).call(this, owner);
      this.owner = owner;
      owner[_constants.ABILITY_FIRE] = this;
    }
  }, {
    key: 'fire',
    value: function fire() {
      var rad = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      var owner = this.owner;
      var scale = owner.scale.x;

      var carryAbility = owner[_constants.ABILITY_CARRY];
      var BulletType = carryAbility.getItemByType(_Bullet2.default);
      if (!BulletType) {
        // no more bullet in inventory
        console.log('no more bullet in inventory');
        return;
      }
      var bullet = new BulletType.constructor();

      // set direction
      var rotateAbility = owner[_constants.ABILITY_ROTATE];
      if (rad === undefined) {
        // 如果沒指定方向，就用目前面對方向
        rad = rotateAbility ? rotateAbility.faceRad : 0;
      }
      var vector = _Vector2.default.fromRadLength(rad, 1);
      bullet.setDirection(vector);
      bullet.setOwner(owner);
      bullet.scale.set(scale, scale);
      bullet.anchor.set(0.5, 0.5);

      // set position
      var anchor = owner.anchor;
      var position = vector.clone().multiplyScalar(owner.width / 2 + bullet.width / 2).add(new _Vector2.default(owner.x + owner.width * (0.5 - anchor.x), owner.y + owner.height * (0.5 - anchor.y)));
      bullet.position.set(position.x, position.y);

      owner.emit('fire', bullet);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Fire';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_FIRE;
    }
  }]);

  return Fire;
}(_Ability3.default);

exports.default = Fire;

},{"../../config/constants":19,"../../lib/Vector":31,"../Bullet":34,"./Ability":48}],52:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _constants = require('../../config/constants');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Health = function (_Ability) {
  _inherits(Health, _Ability);

  function Health() {
    var healthPoint = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    _classCallCheck(this, Health);

    var _this = _possibleConstructorReturn(this, (Health.__proto__ || Object.getPrototypeOf(Health)).call(this));

    _this.healthPoint = healthPoint;
    _this.mapHealthPoint = healthPoint;
    return _this;
  }

  _createClass(Health, [{
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(Health.prototype.__proto__ || Object.getPrototypeOf(Health.prototype), 'carryBy', this).call(this, owner);
      this.owner = owner;
      owner[_constants.ABILITY_HEALTH] = this;
    }
  }, {
    key: 'getHurt',
    value: function getHurt(hurt) {
      var preHp = this.healthPoint;
      this.healthPoint -= hurt.damage;
      var sufHp = this.healthPoint;
      this.owner.say([this.owner.toString(), ' get hurt ', hurt.damage, ': ', preHp, ' -> ', sufHp].join(''));
      if (this.healthPoint <= 0) {
        this.owner.emit('die');
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Health';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_HEALTH;
    }
  }]);

  return Health;
}(_Ability3.default);

exports.default = Health;

},{"../../config/constants":19,"./Ability":48}],53:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _constants = require('../../config/constants');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
} /* global addEventListener, removeEventListener */

var KeyFire = function (_Ability) {
  _inherits(KeyFire, _Ability);

  function KeyFire() {
    _classCallCheck(this, KeyFire);

    return _possibleConstructorReturn(this, (KeyFire.__proto__ || Object.getPrototypeOf(KeyFire)).apply(this, arguments));
  }

  _createClass(KeyFire, [{
    key: 'isBetter',
    value: function isBetter(other) {
      return false;
    }

    // 配備此技能

  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(KeyFire.prototype.__proto__ || Object.getPrototypeOf(KeyFire.prototype), 'carryBy', this).call(this, owner);
      this.setup(owner);
    }
  }, {
    key: 'setup',
    value: function setup(owner) {
      var fireAbility = owner[_constants.ABILITY_FIRE];
      var bind = function bind() {
        var handler = function handler(e) {
          fireAbility.fire();
        };
        addEventListener('click', handler);
        return handler;
      };

      owner[_constants.ABILITY_KEY_FIRE] = bind();
    }
  }, {
    key: 'dropBy',
    value: function dropBy(owner) {
      _get(KeyFire.prototype.__proto__ || Object.getPrototypeOf(KeyFire.prototype), 'dropBy', this).call(this, owner);
      removeEventListener('click', owner[_constants.ABILITY_KEY_FIRE]);
      delete owner[_constants.ABILITY_KEY_FIRE];
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'key fire';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_KEY_FIRE;
    }
  }]);

  return KeyFire;
}(_Ability3.default);

exports.default = KeyFire;

},{"../../config/constants":19,"./Ability":48}],54:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _keyboardjs = require('keyboardjs');

var _keyboardjs2 = _interopRequireDefault(_keyboardjs);

var _control = require('../../config/control');

var _constants = require('../../config/constants');

var _Vector = require('../../lib/Vector');

var _Vector2 = _interopRequireDefault(_Vector);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var KeyMove = function (_Ability) {
  _inherits(KeyMove, _Ability);

  function KeyMove() {
    _classCallCheck(this, KeyMove);

    return _possibleConstructorReturn(this, (KeyMove.__proto__ || Object.getPrototypeOf(KeyMove)).apply(this, arguments));
  }

  _createClass(KeyMove, [{
    key: 'isBetter',
    value: function isBetter(other) {
      return false;
    }

    // 配備此技能

  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(KeyMove.prototype.__proto__ || Object.getPrototypeOf(KeyMove.prototype), 'carryBy', this).call(this, owner);
      this.setup(owner);
    }
  }, {
    key: 'setup',
    value: function setup(owner) {
      var dir = {};
      var calcDir = function calcDir() {
        var vector = new _Vector2.default(-dir[_control.LEFT] + dir[_control.RIGHT], -dir[_control.UP] + dir[_control.DOWN]);
        owner[_constants.ABILITY_MOVE].addDirection(vector);
      };
      var bind = function bind(code) {
        dir[code] = 0;
        var preHandler = function preHandler(e) {
          e.preventRepeat();
          dir[code] = 1;
          owner[_constants.ABILITY_MOVE].clearPath();
        };
        _keyboardjs2.default.bind(code, preHandler, function () {
          dir[code] = 0;
        });
        return preHandler;
      };

      _keyboardjs2.default.setContext('');
      _keyboardjs2.default.withContext('', function () {
        var _owner$ABILITY_KEY_MO;

        owner[_constants.ABILITY_KEY_MOVE] = (_owner$ABILITY_KEY_MO = {}, _defineProperty(_owner$ABILITY_KEY_MO, _control.LEFT, bind(_control.LEFT)), _defineProperty(_owner$ABILITY_KEY_MO, _control.UP, bind(_control.UP)), _defineProperty(_owner$ABILITY_KEY_MO, _control.RIGHT, bind(_control.RIGHT)), _defineProperty(_owner$ABILITY_KEY_MO, _control.DOWN, bind(_control.DOWN)), _owner$ABILITY_KEY_MO);
      });

      this.timer = setInterval(calcDir, 17);
    }
  }, {
    key: 'dropBy',
    value: function dropBy(owner) {
      _get(KeyMove.prototype.__proto__ || Object.getPrototypeOf(KeyMove.prototype), 'dropBy', this).call(this, owner);
      _keyboardjs2.default.withContext('', function () {
        Object.entries(owner[_constants.ABILITY_KEY_MOVE]).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key = _ref2[0],
              handler = _ref2[1];

          _keyboardjs2.default.unbind(key, handler);
        });
      });
      delete owner[_constants.ABILITY_KEY_MOVE];

      clearInterval(this.timer);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'key control';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_KEY_MOVE;
    }
  }]);

  return KeyMove;
}(_Ability3.default);

exports.default = KeyMove;

},{"../../config/constants":19,"../../config/control":20,"../../lib/Vector":31,"./Ability":48,"keyboardjs":2}],55:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _keyboardjs = require('keyboardjs');

var _keyboardjs2 = _interopRequireDefault(_keyboardjs);

var _control = require('../../config/control');

var _constants = require('../../config/constants');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var SLOTS = [_control.PLACE1, _control.PLACE2, _control.PLACE3, _control.PLACE4];

var KeyPlace = function (_Ability) {
  _inherits(KeyPlace, _Ability);

  function KeyPlace() {
    _classCallCheck(this, KeyPlace);

    return _possibleConstructorReturn(this, (KeyPlace.__proto__ || Object.getPrototypeOf(KeyPlace)).apply(this, arguments));
  }

  _createClass(KeyPlace, [{
    key: 'isBetter',
    value: function isBetter(other) {
      return false;
    }

    // 配備此技能

  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(KeyPlace.prototype.__proto__ || Object.getPrototypeOf(KeyPlace.prototype), 'carryBy', this).call(this, owner);
      this.setup(owner);
    }
  }, {
    key: 'setup',
    value: function setup(owner) {
      var placeAbility = owner[_constants.ABILITY_PLACE];
      var bind = function bind(key) {
        var slotInx = SLOTS.indexOf(key);
        var handler = function handler(e) {
          e.preventRepeat();
          placeAbility.place(slotInx);
        };
        _keyboardjs2.default.bind(key, handler, function () {});
        return handler;
      };

      _keyboardjs2.default.setContext('');
      _keyboardjs2.default.withContext('', function () {
        owner[_constants.ABILITY_KEY_PLACE] = {
          PLACE1: bind(_control.PLACE1),
          PLACE2: bind(_control.PLACE2),
          PLACE3: bind(_control.PLACE3),
          PLACE4: bind(_control.PLACE4)
        };
      });
    }
  }, {
    key: 'dropBy',
    value: function dropBy(owner) {
      _get(KeyPlace.prototype.__proto__ || Object.getPrototypeOf(KeyPlace.prototype), 'dropBy', this).call(this, owner);
      _keyboardjs2.default.withContext('', function () {
        Object.entries(owner[_constants.ABILITY_KEY_PLACE]).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key = _ref2[0],
              handler = _ref2[1];

          _keyboardjs2.default.unbind(key, handler);
        });
      });
      delete owner[_constants.ABILITY_KEY_PLACE];
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'key place';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_KEY_PLACE;
    }
  }]);

  return KeyPlace;
}(_Ability3.default);

exports.default = KeyPlace;

},{"../../config/constants":19,"../../config/control":20,"./Ability":48,"keyboardjs":2}],56:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _constants = require('../../config/constants');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Learn = function (_Ability) {
  _inherits(Learn, _Ability);

  function Learn() {
    _classCallCheck(this, Learn);

    return _possibleConstructorReturn(this, (Learn.__proto__ || Object.getPrototypeOf(Learn)).apply(this, arguments));
  }

  _createClass(Learn, [{
    key: 'isBetter',
    value: function isBetter(other) {
      return false;
    }
  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      if (!owner.abilities) {
        owner.abilities = {};
        owner.tickAbilities = {};
      }
      _get(Learn.prototype.__proto__ || Object.getPrototypeOf(Learn.prototype), 'carryBy', this).call(this, owner);
      this.owner = owner;
      owner[_constants.ABILITY_LEARN] = this;
      return this;
    }
  }, {
    key: 'learn',
    value: function learn(ability) {
      var owner = this.owner;
      if (ability.hasToReplace(owner, ability)) {
        ability.carryBy(owner);
        owner.emit('ability-carry', ability);
      }
      return owner[_constants.ABILITY_LEARN];
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'learning';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_LEARN;
    }
  }]);

  return Learn;
}(_Ability3.default);

exports.default = Learn;

},{"../../config/constants":19,"./Ability":48}],57:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _constants = require('../../config/constants');

var _Vector = require('../../lib/Vector');

var _Vector2 = _interopRequireDefault(_Vector);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var DISTANCE_THRESHOLD = 1;

var Move = function (_Ability) {
  _inherits(Move, _Ability);

  /**
   * 移動能力
   * @param  {int} value    移動速度
   * @param  {Number} friction 摩擦力(1: 最大，0: 最小)
   */
  function Move(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        value = _ref2[0],
        friction = _ref2[1];

    _classCallCheck(this, Move);

    var _this = _possibleConstructorReturn(this, (Move.__proto__ || Object.getPrototypeOf(Move)).call(this));

    _this.value = value;
    _this.vector = new _Vector2.default(0, 0);
    _this.friction = friction;
    _this.path = [];
    _this.movingToPoint = undefined;
    _this.distanceThreshold = _this.value * DISTANCE_THRESHOLD;
    return _this;
  }

  _createClass(Move, [{
    key: 'isBetter',
    value: function isBetter(other) {
      // 只會加快
      return this.value > other.value;
    }

    // 配備此技能

  }, {
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(Move.prototype.__proto__ || Object.getPrototypeOf(Move.prototype), 'carryBy', this).call(this, owner);
      this.owner = owner;
      owner[_constants.ABILITY_MOVE] = this;
      owner.tickAbilities[this.type.toString()] = this;
    }
  }, {
    key: 'replacedBy',
    value: function replacedBy(other, owner) {
      other.vector = this.vector;
      other.path = this.path;
      other.movingToPoint = this.movingToPoint;
    }

    // 設定方向最大速度

  }, {
    key: 'setDirection',
    value: function setDirection(vector) {
      if (vector.length === 0) {
        return;
      }
      this.vector = vector.setLength(1);
    }

    // 緩慢加速，呼叫60次可達全速

  }, {
    key: 'addDirection',
    value: function addDirection(vector) {
      var len = this.value / 60;
      vector.setLength(len);
      this.vector.add(vector);

      var maxValue = this.value;
      // 不可超出最高速度
      if (this.vector.length > maxValue) {
        this.vector.setLength(maxValue);
      }
    }

    // 移動到點

  }, {
    key: 'moveTo',
    value: function moveTo(point) {
      var vector = new _Vector2.default(point.x - this.owner.x, point.y - this.owner.y);
      this.setDirection(vector);
    }

    // 設定移動路徑

  }, {
    key: 'setPath',
    value: function setPath(path) {
      if (path.length === 0) {
        // 抵達終點
        this.movingToPoint = undefined;
        this.vector = new _Vector2.default(0, 0);
        return;
      }
      this.path = path;
      this.movingToPoint = path.pop();
      this.moveTo(this.movingToPoint);
    }
  }, {
    key: 'clearPath',
    value: function clearPath() {
      this.movingToPoint = undefined;
      this.path = [];
    }
  }, {
    key: 'addPath',
    value: function addPath(path) {
      this.setPath(path.concat(this.path));
    }

    // tick

  }, {
    key: 'tick',
    value: function tick(delta, owner) {
      // NOTICE: 假設自己是正方形
      var scale = owner.scale.x;
      var vector = this.vector;

      // 摩擦力
      this.vector.add(this.vector.clone().invert().multiplyScalar(this.friction));

      owner.x += vector.x * this.value * scale * delta;
      owner.y += vector.y * this.value * scale * delta;

      if (this.movingToPoint) {
        var position = owner.position;
        var targetPosition = this.movingToPoint;
        var a = position.x - targetPosition.x;
        var b = position.y - targetPosition.y;
        var c = Math.sqrt(a * a + b * b);
        if (c < this.distanceThreshold) {
          this.setPath(this.path);
        } else {
          this.moveTo(this.movingToPoint);
        }
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'move level: ' + this.value;
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_MOVE;
    }
  }]);

  return Move;
}(_Ability3.default);

exports.default = Move;

},{"../../config/constants":19,"../../lib/Vector":31,"./Ability":48}],58:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _constants = require('../../config/constants');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Operate = function (_Ability) {
  _inherits(Operate, _Ability);

  function Operate(value) {
    _classCallCheck(this, Operate);

    var _this = _possibleConstructorReturn(this, (Operate.__proto__ || Object.getPrototypeOf(Operate)).call(this));

    _this.set = new Set([value]);
    return _this;
  }

  _createClass(Operate, [{
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(Operate.prototype.__proto__ || Object.getPrototypeOf(Operate.prototype), 'carryBy', this).call(this, owner);
      owner[_constants.ABILITY_OPERATE] = this[_constants.ABILITY_OPERATE].bind(this, owner);
      return owner[_constants.ABILITY_OPERATE];
    }
  }, {
    key: 'replacedBy',
    value: function replacedBy(other) {
      this.set.forEach(other.set.add.bind(other.set));
    }
  }, {
    key: _constants.ABILITY_OPERATE,
    value: function value(operator, target) {
      if (this.set.has(target.map)) {
        operator.say(operator.toString() + ' use ability to open ' + target.map);
        target[this.type]();
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return ['keys: ', Array.from(this.set).join(', ')].join('');
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_OPERATE;
    }
  }]);

  return Operate;
}(_Ability3.default);

exports.default = Operate;

},{"../../config/constants":19,"./Ability":48}],59:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _constants = require('../../config/constants');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Place = function (_Ability) {
  _inherits(Place, _Ability);

  function Place() {
    _classCallCheck(this, Place);

    return _possibleConstructorReturn(this, (Place.__proto__ || Object.getPrototypeOf(Place)).apply(this, arguments));
  }

  _createClass(Place, [{
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(Place.prototype.__proto__ || Object.getPrototypeOf(Place.prototype), 'carryBy', this).call(this, owner);
      this.owner = owner;
      owner[_constants.ABILITY_PLACE] = this;
    }
  }, {
    key: 'place',
    value: function place(slotInx) {
      var owner = this.owner;
      var carryAbility = owner[_constants.ABILITY_CARRY];
      var item = carryAbility.getSlotItem(slotInx);
      if (item) {
        owner.emit('place', new item.constructor());

        var position = owner.position;
        owner.say(['place ', item.toString(), ' at ', ['(', position.x.toFixed(0), ', ', position.y.toFixed(0), ')'].join('')].join(''));
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'place';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_PLACE;
    }
  }]);

  return Place;
}(_Ability3.default);

exports.default = Place;

},{"../../config/constants":19,"./Ability":48}],60:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _constants = require('../../config/constants');

var _Vector = require('../../lib/Vector');

var _Vector2 = _interopRequireDefault(_Vector);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var MOUSEMOVE = Symbol('mousemove');

var Rotate = function (_Ability) {
  _inherits(Rotate, _Ability);

  function Rotate() {
    var initRad = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    _classCallCheck(this, Rotate);

    var _this = _possibleConstructorReturn(this, (Rotate.__proto__ || Object.getPrototypeOf(Rotate)).call(this));

    _this.initRad = initRad;
    return _this;
  }

  _createClass(Rotate, [{
    key: 'isBetter',
    value: function isBetter(other) {
      return false;
    }
  }, {
    key: 'carryBy',

    // 配備此技能
    value: function carryBy(owner) {
      var _this2 = this;

      _get(Rotate.prototype.__proto__ || Object.getPrototypeOf(Rotate.prototype), 'carryBy', this).call(this, owner);
      owner.anchor.set(0.5, 0.5);

      this.owner = owner;
      owner[_constants.ABILITY_ROTATE] = this;
      owner.interactive = true;
      owner[MOUSEMOVE] = function (e) {
        var ownerPoint = owner.getGlobalPosition();
        var pointer = e.data.global;
        var targetPosition = {
          x: pointer.x - ownerPoint.x,
          y: pointer.y - ownerPoint.y
        };
        _this2._faceRad = _Vector2.default.fromPoint(targetPosition).rad - _this2.initRad;
        _this2.rotate(_this2._faceRad);
      };
      owner.on('mousemove', owner[MOUSEMOVE]);
      owner.rotation = Math.PI / 2;
    }
  }, {
    key: 'rotate',
    value: function rotate(rad) {
      this.owner.rotation = rad;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Rotate';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_ROTATE;
    }
  }, {
    key: 'faceRad',
    get: function get() {
      return this._faceRad;
    }
  }]);

  return Rotate;
}(_Ability3.default);

exports.default = Rotate;

},{"../../config/constants":19,"../../lib/Vector":31,"./Ability":48}],61:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
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
      _PIXI.loader.add('images/terrain_atlas.json').add('images/base_out_atlas.json').add('images/fire_bolt.png').load(function () {
        return _this2.emit('changeScene', _PlayScene2.default, {
          mapFile: 'W0N0',
          position: [4, 1]
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

},{"../lib/PIXI":28,"../lib/Scene":29,"./PlayScene":62}],62:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _constants = require('../config/constants');

var _Cat = require('../objects/Cat');

var _Cat2 = _interopRequireDefault(_Cat);

var _MessageWindow = require('../ui/MessageWindow');

var _MessageWindow2 = _interopRequireDefault(_MessageWindow);

var _PlayerWindow = require('../ui/PlayerWindow');

var _PlayerWindow2 = _interopRequireDefault(_PlayerWindow);

var _InventoryWindow = require('../ui/InventoryWindow');

var _InventoryWindow2 = _interopRequireDefault(_InventoryWindow);

var _TouchDirectionControlPanel = require('../ui/TouchDirectionControlPanel');

var _TouchDirectionControlPanel2 = _interopRequireDefault(_TouchDirectionControlPanel);

var _TouchOperationControlPanel = require('../ui/TouchOperationControlPanel');

var _TouchOperationControlPanel2 = _interopRequireDefault(_TouchOperationControlPanel);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var sceneWidth = void 0;
var sceneHeight = void 0;

function getMessageWindowOpt() {
  var opt = {};
  if (_constants.IS_MOBILE) {
    opt.width = sceneWidth;
    opt.fontSize = opt.width / 30;
    opt.scrollBarWidth = 50;
    opt.scrollBarMinHeight = 70;
  } else {
    opt.width = sceneWidth < 400 ? sceneWidth : sceneWidth / 2;
    opt.fontSize = opt.width / 60;
  }
  opt.height = sceneHeight / 6;
  opt.x = 0;
  opt.y = sceneHeight - opt.height;

  return opt;
}

function getPlayerWindowOpt(player) {
  var opt = {
    player: player
  };
  opt.x = 0;
  opt.y = 0;
  if (_constants.IS_MOBILE) {
    opt.width = sceneWidth / 4;
    opt.height = sceneHeight / 6;
    opt.fontSize = opt.width / 10;
  } else {
    opt.width = sceneWidth < 400 ? sceneWidth / 2 : sceneWidth / 4;
    opt.height = sceneHeight / 3;
    opt.fontSize = opt.width / 20;
  }
  return opt;
}

function getInventoryWindowOpt(player) {
  var opt = {
    player: player
  };
  opt.y = 0;
  if (_constants.IS_MOBILE) {
    opt.width = sceneWidth / 6;
  } else {
    var divide = sceneWidth < 400 ? 6 : sceneWidth < 800 ? 12 : 20;
    opt.width = sceneWidth / divide;
  }
  opt.x = sceneWidth - opt.width;
  return opt;
}

var PlayScene = function (_Scene) {
  _inherits(PlayScene, _Scene);

  function PlayScene(_ref) {
    var mapFile = _ref.mapFile,
        position = _ref.position;

    _classCallCheck(this, PlayScene);

    var _this = _possibleConstructorReturn(this, (PlayScene.__proto__ || Object.getPrototypeOf(PlayScene)).call(this));

    _this.mapFile = mapFile;
    _this.toPosition = position;
    return _this;
  }

  _createClass(PlayScene, [{
    key: 'create',
    value: function create() {
      sceneWidth = this.parent.width;
      sceneHeight = this.parent.height;
      this.isMapLoaded = false;
      this.loadMap();
      this.initPlayer();
      this.initUi();
    }
  }, {
    key: 'initUi',
    value: function initUi() {
      var uiGroup = new _PIXI.display.Group(0, true);
      var uiLayer = new _PIXI.display.Layer(uiGroup);
      uiLayer.parentLayer = this;
      uiLayer.group.enableSort = true;
      this.addChild(uiLayer);

      var messageWindow = new _MessageWindow2.default(getMessageWindowOpt());
      var playerWindow = new _PlayerWindow2.default(getPlayerWindowOpt(this.cat));
      var inventoryWindow = new _InventoryWindow2.default(getInventoryWindowOpt(this.cat));

      // 讓UI顯示在頂層
      messageWindow.parentGroup = uiGroup;
      playerWindow.parentGroup = uiGroup;
      inventoryWindow.parentGroup = uiGroup;
      uiLayer.addChild(messageWindow);
      uiLayer.addChild(playerWindow);
      uiLayer.addChild(inventoryWindow);

      if (_constants.IS_MOBILE) {
        // 只有手機要觸控板
        // 方向控制
        var directionPanel = new _TouchDirectionControlPanel2.default({
          x: sceneWidth / 4,
          y: sceneHeight * 4 / 6,
          radius: sceneWidth / 8
        });
        directionPanel.parentGroup = uiGroup;

        // 操作控制
        var operationPanel = new _TouchOperationControlPanel2.default({
          x: sceneWidth / 4 * 3,
          y: sceneHeight * 4 / 6,
          radius: sceneWidth / 10
        });
        operationPanel.parentGroup = uiGroup;

        uiLayer.addChild(directionPanel);
        uiLayer.addChild(operationPanel);
        // require('../lib/demo')
      }
      messageWindow.add(['scene size: (', sceneWidth, ', ', sceneHeight, ').'].join(''));
    }
  }, {
    key: 'initPlayer',
    value: function initPlayer() {
      if (!this.cat) {
        this.cat = new _Cat2.default();
      }
    }
  }, {
    key: 'loadMap',
    value: function loadMap() {
      var fileName = 'world/' + this.mapFile;

      // if map not loaded yet
      if (!_PIXI.resources[fileName]) {
        _PIXI.loader.add(fileName, fileName + '.json').load(this.spawnMap.bind(this, fileName));
      } else {
        this.spawnMap(fileName);
      }
    }
  }, {
    key: 'spawnMap',
    value: function spawnMap(fileName) {
      var _this2 = this;

      var mapData = _PIXI.resources[fileName].data;
      var mapScale = _constants.IS_MOBILE ? 2 : 0.5;

      var map = new _Map2.default(mapScale);
      this.addChild(map);
      map.load(mapData);

      map.on('use', function (o) {
        _this2.isMapLoaded = false;
        // clear old map
        _this2.removeChild(_this2.map);
        _this2.map.destroy();

        _this2.mapFile = o.map;
        _this2.toPosition = o.toPosition;
        _this2.loadMap();
      });

      map.addPlayer(this.cat, this.toPosition);
      this.map = map;

      this.isMapLoaded = true;
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      if (!this.isMapLoaded) {
        return;
      }
      this.map.tick(delta);
      // FIXME: gap between tiles on iPhone Safari
      this.map.position.set(Math.floor(sceneWidth / 2 - this.cat.x), Math.floor(sceneHeight / 2 - this.cat.y));
    }
  }]);

  return PlayScene;
}(_Scene3.default);

exports.default = PlayScene;

},{"../config/constants":19,"../lib/Map":25,"../lib/PIXI":28,"../lib/Scene":29,"../objects/Cat":35,"../ui/InventoryWindow":63,"../ui/MessageWindow":64,"../ui/PlayerWindow":65,"../ui/TouchDirectionControlPanel":67,"../ui/TouchOperationControlPanel":68}],63:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Window2 = require('./Window');

var _Window3 = _interopRequireDefault(_Window2);

var _PIXI = require('../lib/PIXI');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Slot = function (_Container) {
  _inherits(Slot, _Container);

  function Slot(_ref) {
    var x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height;

    _classCallCheck(this, Slot);

    var _this = _possibleConstructorReturn(this, (Slot.__proto__ || Object.getPrototypeOf(Slot)).call(this));

    _this.position.set(x, y);

    var rect = new _PIXI.Graphics();
    rect.beginFill(0xA2A2A2);
    rect.drawRoundedRect(0, 0, width, height, 5);
    rect.endFill();
    _this.addChild(rect);
    return _this;
  }

  _createClass(Slot, [{
    key: 'setContext',
    value: function setContext(item, count) {
      this.clearContext();

      var width = this.width;
      var height = this.height;
      // 置中
      item = new item.constructor();
      var maxSide = Math.max(item.width, item.height);
      var scale = width / maxSide;
      item.scale.set(scale, scale);
      item.anchor.set(0.5, 0.5);
      item.position.set(width / 2, height / 2);
      this.addChild(item);

      // 數量
      var fontSize = this.width * 0.3;
      var style = new _PIXI.TextStyle({
        fontSize: fontSize,
        fill: 'red',
        fontWeight: '600',
        lineHeight: fontSize
      });
      var countText = count === Infinity ? '∞' : count;
      var text = new _PIXI.Text(countText, style);
      text.position.set(width * 0.95, height);
      text.anchor.set(1, 1);
      this.addChild(text);

      this.item = item;
      this.text = text;
    }
  }, {
    key: 'clearContext',
    value: function clearContext() {
      if (this.item) {
        this.item.destroy();
        this.text.destroy();
        delete this.item;
        delete this.text;
      }
    }
  }]);

  return Slot;
}(_PIXI.Container);

var InventoryWindow = function (_Window) {
  _inherits(InventoryWindow, _Window);

  function InventoryWindow(opt) {
    _classCallCheck(this, InventoryWindow);

    var player = opt.player,
        width = opt.width;

    var padding = width * 0.1;
    var ceilSize = width - padding * 2;
    var ceilOpt = {
      x: padding,
      y: padding,
      width: ceilSize,
      height: ceilSize
    };
    var slotCount = 4;
    opt.height = (width - padding) * slotCount + padding;

    var _this2 = _possibleConstructorReturn(this, (InventoryWindow.__proto__ || Object.getPrototypeOf(InventoryWindow)).call(this, opt));

    _this2._opt = opt;
    player.on('inventory-modified', _this2.onInventoryModified.bind(_this2, player));

    _this2.slotContainers = [];
    _this2.slots = [];
    for (var i = 0; i < slotCount; i++) {
      var slot = new Slot(ceilOpt);
      _this2.addChild(slot);
      _this2.slotContainers.push(slot);
      ceilOpt.y += ceilSize + padding;
    }

    _this2.onInventoryModified(player);
    return _this2;
  }

  _createClass(InventoryWindow, [{
    key: 'onInventoryModified',
    value: function onInventoryModified(player) {
      var _this3 = this;

      var carryAbility = player[_constants.ABILITY_CARRY];
      if (!carryAbility) {
        // no inventory yet
        return;
      }
      var i = 0;
      carryAbility.bags.forEach(function (bag) {
        return bag.forEach(function (slot) {
          _this3.slots[i] = slot;
          i++;
        });
      });
      this.slotContainers.forEach(function (container, i) {
        var slot = _this3.slots[i];
        if (slot) {
          container.setContext(slot.item, slot.count);
        } else {
          container.clearContext();
        }
      });
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'window';
    }
  }]);

  return InventoryWindow;
}(_Window3.default);

exports.default = InventoryWindow;

},{"../config/constants":19,"../lib/PIXI":28,"./Window":69}],64:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _ScrollableWindow2 = require('./ScrollableWindow');

var _ScrollableWindow3 = _interopRequireDefault(_ScrollableWindow2);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var MessageWindow = function (_ScrollableWindow) {
  _inherits(MessageWindow, _ScrollableWindow);

  function MessageWindow(opt) {
    _classCallCheck(this, MessageWindow);

    var _this = _possibleConstructorReturn(this, (MessageWindow.__proto__ || Object.getPrototypeOf(MessageWindow)).call(this, opt));

    var _opt$fontSize = opt.fontSize,
        fontSize = _opt$fontSize === undefined ? 12 : _opt$fontSize;

    var style = new _PIXI.TextStyle({
      fontSize: fontSize,
      fill: 'green',
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: _this.windowWidth
    });
    var text = new _PIXI.Text('', style);

    _this.addWindowChild(text);
    _this.text = text;

    _this.autoScrollToBottom = true;

    _Messages2.default.on('modified', _this.modified.bind(_this));
    return _this;
  }

  _createClass(MessageWindow, [{
    key: 'modified',
    value: function modified() {
      var scrollPercent = this.scrollPercent;
      this.text.text = [].concat(_Messages2.default.list).reverse().join('\n');
      this.updateScrollBarLength();

      // 若scroll置底，自動捲動置底
      if (scrollPercent === 1) {
        this.scrollTo(1);
      }
    }
  }, {
    key: 'add',
    value: function add(msg) {
      _Messages2.default.add(msg);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'message-window';
    }
  }]);

  return MessageWindow;
}(_ScrollableWindow3.default);

exports.default = MessageWindow;

},{"../lib/Messages":27,"../lib/PIXI":28,"./ScrollableWindow":66}],65:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Window2 = require('./Window');

var _Window3 = _interopRequireDefault(_Window2);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var ABILITIES_ALL = [_constants.ABILITY_MOVE, _constants.ABILITY_CAMERA, _constants.ABILITY_OPERATE, _constants.ABILITY_PLACE];

var PlayerWindow = function (_Window) {
  _inherits(PlayerWindow, _Window);

  function PlayerWindow(opt) {
    _classCallCheck(this, PlayerWindow);

    var _this = _possibleConstructorReturn(this, (PlayerWindow.__proto__ || Object.getPrototypeOf(PlayerWindow)).call(this, opt));

    var player = opt.player;

    _this._opt = opt;
    player.on('ability-carry', _this.onAbilityCarry.bind(_this, player));

    _this.abilityTextContainer = new _PIXI.Container();
    _this.abilityTextContainer.x = 5;
    _this.addChild(_this.abilityTextContainer);

    _this.onAbilityCarry(player);
    return _this;
  }

  _createClass(PlayerWindow, [{
    key: 'onAbilityCarry',
    value: function onAbilityCarry(player) {
      var i = 0;
      var _opt$fontSize = this._opt.fontSize,
          fontSize = _opt$fontSize === undefined ? 10 : _opt$fontSize;

      var style = new _PIXI.TextStyle({
        fontSize: fontSize,
        fill: 'green',
        lineHeight: fontSize
      });

      // 更新面板數據
      var contianer = this.abilityTextContainer;
      contianer.removeChildren();
      ABILITIES_ALL.forEach(function (abilitySymbol) {
        var ability = player.abilities[abilitySymbol];
        if (ability) {
          var text = new _PIXI.Text(ability.toString(), style);
          text.y = i * (fontSize + 5);

          contianer.addChild(text);

          i++;
        }
      });
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'window';
    }
  }]);

  return PlayerWindow;
}(_Window3.default);

exports.default = PlayerWindow;

},{"../config/constants":19,"../lib/PIXI":28,"./Window":69}],66:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Window2 = require('./Window');

var _Window3 = _interopRequireDefault(_Window2);

var _Wrapper = require('./Wrapper');

var _Wrapper2 = _interopRequireDefault(_Wrapper);

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var ScrollableWindow = function (_Window) {
  _inherits(ScrollableWindow, _Window);

  function ScrollableWindow(opt) {
    _classCallCheck(this, ScrollableWindow);

    var _this = _possibleConstructorReturn(this, (ScrollableWindow.__proto__ || Object.getPrototypeOf(ScrollableWindow)).call(this, opt));

    var width = opt.width,
        height = opt.height,
        _opt$padding = opt.padding,
        padding = _opt$padding === undefined ? 8 : _opt$padding,
        _opt$scrollBarWidth = opt.scrollBarWidth,
        scrollBarWidth = _opt$scrollBarWidth === undefined ? 10 : _opt$scrollBarWidth;

    _this._opt = opt;

    _this._initScrollableArea(width - padding * 2 - scrollBarWidth - 5, height - padding * 2, padding);
    _this._initScrollBar({
      // window width - window padding - bar width
      x: width - padding - scrollBarWidth,
      y: padding,
      width: scrollBarWidth,
      height: height - padding * 2
    });
    return _this;
  }

  _createClass(ScrollableWindow, [{
    key: '_initScrollableArea',
    value: function _initScrollableArea(width, height, padding) {
      // hold padding
      var _mainView = new _PIXI.Container();
      _mainView.position.set(padding, padding);
      this.addChild(_mainView);

      this.mainView = new _PIXI.Container();
      _mainView.addChild(this.mainView);

      // hide mainView's overflow
      var mask = new _PIXI.Graphics();
      mask.beginFill(0xFFFFFF);
      mask.drawRoundedRect(0, 0, width, height, 5);
      mask.endFill();
      this.mainView.mask = mask;
      _mainView.addChild(mask);

      // window width - window padding * 2 - bar width - between space
      this._windowWidth = width;
      this._windowHeight = height;
    }
  }, {
    key: '_initScrollBar',
    value: function _initScrollBar(_ref) {
      var x = _ref.x,
          y = _ref.y,
          width = _ref.width,
          height = _ref.height;

      var conatiner = new _PIXI.Container();
      conatiner.x = x;
      conatiner.y = y;

      var scrollBarBg = new _PIXI.Graphics();
      scrollBarBg.beginFill(0xA8A8A8);
      scrollBarBg.drawRoundedRect(0, 0, width, height, 2);
      scrollBarBg.endFill();

      var scrollBar = new _PIXI.Graphics();
      scrollBar.beginFill(0x222222);
      scrollBar.drawRoundedRect(0, 0, width, height, 3);
      scrollBar.endFill();
      scrollBar.toString = function () {
        return 'scrollBar';
      };
      _Wrapper2.default.draggable(scrollBar, {
        boundary: {
          x: 0,
          y: 0,
          width: width,
          height: height
        }
      });
      scrollBar.on('drag', this.scrollMainView.bind(this));

      conatiner.addChild(scrollBarBg);
      conatiner.addChild(scrollBar);
      this.addChild(conatiner);
      this.scrollBar = scrollBar;
      this.scrollBarBg = scrollBarBg;
    }

    // 捲動視窗

  }, {
    key: 'scrollMainView',
    value: function scrollMainView() {
      this.mainView.y = (this.windowHeight - this.mainView.height) * this.scrollPercent;
    }

    // 新增物件至視窗

  }, {
    key: 'addWindowChild',
    value: function addWindowChild(child) {
      this.mainView.addChild(child);
    }

    // 更新捲動棒大小, 不一定要調用

  }, {
    key: 'updateScrollBarLength',
    value: function updateScrollBarLength() {
      var _opt$scrollBarMinHeig = this._opt.scrollBarMinHeight,
          scrollBarMinHeight = _opt$scrollBarMinHeig === undefined ? 20 : _opt$scrollBarMinHeig;

      var dh = this.mainView.height / this.windowHeight;
      if (dh < 1) {
        this.scrollBar.height = this.scrollBarBg.height;
      } else {
        this.scrollBar.height = this.scrollBarBg.height / dh;
        // 避免太小很難拖曳
        this.scrollBar.height = Math.max(scrollBarMinHeight, this.scrollBar.height);
      }
      this.scrollBar.fallbackToBoundary();
    }

    // 捲動百分比

  }, {
    key: 'scrollTo',

    // 捲動至百分比
    value: function scrollTo(percent) {
      var delta = this.scrollBarBg.height - this.scrollBar.height;
      var y = 0;
      if (delta !== 0) {
        y = delta * percent;
      }
      this.scrollBar.y = y;
      this.scrollMainView();
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'window';
    }
  }, {
    key: 'scrollPercent',
    get: function get() {
      var delta = this.scrollBarBg.height - this.scrollBar.height;
      return delta === 0 ? 1 : this.scrollBar.y / delta;
    }
  }, {
    key: 'windowWidth',
    get: function get() {
      return this._windowWidth;
    }
  }, {
    key: 'windowHeight',
    get: function get() {
      return this._windowHeight;
    }
  }]);

  return ScrollableWindow;
}(_Window3.default);

exports.default = ScrollableWindow;

},{"../lib/PIXI":28,"./Window":69,"./Wrapper":70}],67:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _Vector = require('../lib/Vector');

var _Vector2 = _interopRequireDefault(_Vector);

var _keyboardjs = require('keyboardjs');

var _keyboardjs2 = _interopRequireDefault(_keyboardjs);

var _control = require('../config/control');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var ALL_KEYS = [_control.RIGHT, _control.LEFT, _control.UP, _control.DOWN];

var TouchDirectionControlPanel = function (_Container) {
  _inherits(TouchDirectionControlPanel, _Container);

  function TouchDirectionControlPanel(_ref) {
    var x = _ref.x,
        y = _ref.y,
        radius = _ref.radius;

    _classCallCheck(this, TouchDirectionControlPanel);

    var _this = _possibleConstructorReturn(this, (TouchDirectionControlPanel.__proto__ || Object.getPrototypeOf(TouchDirectionControlPanel)).call(this));

    _this.position.set(x, y);

    var touchArea = new _PIXI.Graphics();
    touchArea.beginFill(0xF2F2F2, 0.5);
    touchArea.drawCircle(0, 0, radius);
    touchArea.endFill();
    _this.addChild(touchArea);
    _this.radius = radius;

    _this.setupTouch();
    return _this;
  }

  _createClass(TouchDirectionControlPanel, [{
    key: 'setupTouch',
    value: function setupTouch() {
      this.interactive = true;
      var f = this.onTouch.bind(this);
      this.on('touchstart', f);
      this.on('touchend', f);
      this.on('touchmove', f);
      this.on('touchendoutside', f);
    }
  }, {
    key: 'onTouch',
    value: function onTouch(e) {
      var type = e.type;
      var propagation = false;
      switch (type) {
        case 'touchstart':
          this.drag = e.data.global.clone();
          this.createDragPoint();
          this.originPosition = {
            x: this.x,
            y: this.y
          };
          break;
        case 'touchend':
        case 'touchendoutside':
          if (this.drag) {
            this.drag = false;
            this.destroyDragPoint();
            this.releaseKeys();
          }
          break;
        case 'touchmove':
          if (!this.drag) {
            propagation = true;
            break;
          }
          this.pressKeys(e.data.getLocalPosition(this));
          break;
      }
      if (!propagation) {
        e.stopPropagation();
      }
    }
  }, {
    key: 'createDragPoint',
    value: function createDragPoint() {
      var dragPoint = new _PIXI.Graphics();
      dragPoint.beginFill(0xF2F2F2, 0.5);
      dragPoint.drawCircle(0, 0, 20);
      dragPoint.endFill();
      this.addChild(dragPoint);
      this.dragPoint = dragPoint;
    }
  }, {
    key: 'destroyDragPoint',
    value: function destroyDragPoint() {
      this.removeChild(this.dragPoint);
      this.dragPoint.destroy();
    }
  }, {
    key: 'pressKeys',
    value: function pressKeys(newPoint) {
      this.releaseKeys();
      // 感應靈敏度
      var threshold = 30;

      var vector = _Vector2.default.fromPoint(newPoint);
      var deg = vector.deg;
      var len = vector.length;

      if (len < threshold) {
        return;
      }
      var degAbs = Math.abs(deg);
      var dx = degAbs < 67.5 ? _control.RIGHT : degAbs > 112.5 ? _control.LEFT : false;
      var dy = degAbs < 22.5 || degAbs > 157.5 ? false : deg < 0 ? _control.UP : _control.DOWN;

      if (dx || dy) {
        if (dx) {
          _keyboardjs2.default.pressKey(dx);
        }
        if (dy) {
          _keyboardjs2.default.pressKey(dy);
        }
        vector.multiplyScalar(this.radius / len);
        this.dragPoint.position.set(vector.x, vector.y);
      }
    }
  }, {
    key: 'releaseKeys',
    value: function releaseKeys() {
      ALL_KEYS.forEach(function (key) {
        return _keyboardjs2.default.releaseKey(key);
      });
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'TouchDirectionControlPanel';
    }
  }]);

  return TouchDirectionControlPanel;
}(_PIXI.Container);

exports.default = TouchDirectionControlPanel;

},{"../config/control":20,"../lib/PIXI":28,"../lib/Vector":31,"keyboardjs":2}],68:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _keyboardjs = require('keyboardjs');

var _keyboardjs2 = _interopRequireDefault(_keyboardjs);

var _control = require('../config/control');

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
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var TouchOperationControlPanel = function (_Container) {
  _inherits(TouchOperationControlPanel, _Container);

  function TouchOperationControlPanel(_ref) {
    var x = _ref.x,
        y = _ref.y,
        radius = _ref.radius;

    _classCallCheck(this, TouchOperationControlPanel);

    var _this = _possibleConstructorReturn(this, (TouchOperationControlPanel.__proto__ || Object.getPrototypeOf(TouchOperationControlPanel)).call(this));

    _this.position.set(x, y);

    var touchArea = new _PIXI.Graphics();
    touchArea.beginFill(0xF2F2F2, 0.5);
    touchArea.drawCircle(0, 0, radius);
    touchArea.endFill();
    _this.addChild(touchArea);
    _this.radius = radius;

    _this.setupTouch();
    return _this;
  }

  _createClass(TouchOperationControlPanel, [{
    key: 'setupTouch',
    value: function setupTouch() {
      this.interactive = true;
      var f = this.onTouch.bind(this);
      this.on('touchstart', f);
      this.on('touchend', f);
    }
  }, {
    key: 'onTouch',
    value: function onTouch(e) {
      var type = e.type;
      var propagation = false;
      switch (type) {
        case 'touchstart':
          this.drag = true;
          break;
        case 'touchend':
          if (this.drag) {
            this.drag = false;
            _keyboardjs2.default.pressKey(_control.PLACE1);
            _keyboardjs2.default.releaseKey(_control.PLACE1);
          }
          break;
      }
      if (!propagation) {
        e.stopPropagation();
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'TouchOperationControlPanel';
    }
  }]);

  return TouchOperationControlPanel;
}(_PIXI.Container);

exports.default = TouchOperationControlPanel;

},{"../config/control":20,"../lib/PIXI":28,"keyboardjs":2}],69:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Window = function (_Container) {
  _inherits(Window, _Container);

  function Window(_ref) {
    var x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height;

    _classCallCheck(this, Window);

    var _this = _possibleConstructorReturn(this, (Window.__proto__ || Object.getPrototypeOf(Window)).call(this));

    _this.position.set(x, y);

    var lineWidth = 3;

    var windowBg = new _PIXI.Graphics();
    windowBg.beginFill(0xF2F2F2);
    windowBg.lineStyle(lineWidth, 0x222222, 1);
    windowBg.drawRoundedRect(0, 0, width, height, 5);
    windowBg.endFill();
    _this.addChild(windowBg);
    return _this;
  }

  _createClass(Window, [{
    key: 'toString',
    value: function toString() {
      return 'window';
    }
  }]);

  return Window;
}(_PIXI.Container);

exports.default = Window;

},{"../lib/PIXI":28}],70:[function(require,module,exports){
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

var OPT = Symbol('opt');

function _enableDraggable() {
  this.drag = false;
  this.interactive = true;
  var f = _onTouch.bind(this);
  this.on('touchstart', f);
  this.on('touchend', f);
  this.on('touchmove', f);
  this.on('touchendoutside', f);
  this.on('mousedown', f);
  this.on('mouseup', f);
  this.on('mousemove', f);
  this.on('mouseupoutside', f);
}

function _onTouch(e) {
  var type = e.type;
  var propagation = false;
  switch (type) {
    case 'touchstart':
    case 'mousedown':
      this.drag = e.data.global.clone();
      this.originPosition = {
        x: this.x,
        y: this.y
      };
      break;
    case 'touchend':
    case 'touchendoutside':
    case 'mouseup':
    case 'mouseupoutside':
      this.drag = false;
      break;
    case 'touchmove':
    case 'mousemove':
      if (!this.drag) {
        propagation = true;
        break;
      }
      var newPoint = e.data.global.clone();
      this.position.set(this.originPosition.x + newPoint.x - this.drag.x, this.originPosition.y + newPoint.y - this.drag.y);
      _fallbackToBoundary.call(this);
      this.emit('drag'); // maybe can pass param for some reason: e.data.getLocalPosition(this)
      break;
  }
  if (!propagation) {
    e.stopPropagation();
  }
}

// 退回邊界
function _fallbackToBoundary() {
  var _OPT = this[OPT],
      _OPT$width = _OPT.width,
      width = _OPT$width === undefined ? this.width : _OPT$width,
      _OPT$height = _OPT.height,
      height = _OPT$height === undefined ? this.height : _OPT$height,
      boundary = _OPT.boundary;

  this.x = Math.max(this.x, boundary.x);
  this.x = Math.min(this.x, boundary.x + boundary.width - width);
  this.y = Math.max(this.y, boundary.y);
  this.y = Math.min(this.y, boundary.y + boundary.height - height);
}

var Wrapper = function () {
  function Wrapper() {
    _classCallCheck(this, Wrapper);
  }

  _createClass(Wrapper, null, [{
    key: 'draggable',

    /**
     * displayObject: will wrapped DisplayObject
     * opt: {
     *  boundary: 拖曳邊界 { x, y, width, height }
     *  [, width]: 邊界碰撞寬(default: displayObject.width)
     *  [, height]: 邊界碰撞高(default: displayObject.height)
     *  }
     */
    value: function draggable(displayObject, opt) {
      displayObject[OPT] = opt;
      _enableDraggable.call(displayObject);
      displayObject.fallbackToBoundary = _fallbackToBoundary;
    }
  }]);

  return Wrapper;
}();

exports.default = Wrapper;

},{}]},{},[18])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tleWJvYXJkanMvbGliL2tleS1jb21iby5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9rZXlib2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9sb2NhbGUuanMiLCJub2RlX21vZHVsZXMva2V5Ym9hcmRqcy9sb2NhbGVzL3VzLmpzIiwibm9kZV9tb2R1bGVzL25ncmFwaC5ldmVudHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLmdyYXBoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL25ncmFwaC5wYXRoL2Etc3Rhci9Ob2RlSGVhcC5qcyIsIm5vZGVfbW9kdWxlcy9uZ3JhcGgucGF0aC9hLXN0YXIvYS1ncmVlZHktc3Rhci5qcyIsIm5vZGVfbW9kdWxlcy9uZ3JhcGgucGF0aC9hLXN0YXIvYS1zdGFyLmpzIiwibm9kZV9tb2R1bGVzL25ncmFwaC5wYXRoL2Etc3Rhci9kZWZhdWx0U2V0dGluZ3MuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvYS1zdGFyL2hldXJpc3RpY3MuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvYS1zdGFyL21ha2VTZWFyY2hTdGF0ZVBvb2wuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvYS1zdGFyL25iYS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9uZ3JhcGgucGF0aC9hLXN0YXIvbmJhL21ha2VOQkFTZWFyY2hTdGF0ZVBvb2wuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvaW5kZXguanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbmZpZy9jb25zdGFudHMuanMiLCJzcmMvY29uZmlnL2NvbnRyb2wuanMiLCJzcmMvbGliL0FwcGxpY2F0aW9uLmpzIiwic3JjL2xpYi9CdW1wLmpzIiwic3JjL2xpYi9HYW1lT2JqZWN0cy5qcyIsInNyYy9saWIvTGlnaHQuanMiLCJzcmMvbGliL01hcC5qcyIsInNyYy9saWIvTWFwR3JhcGguanMiLCJzcmMvbGliL01lc3NhZ2VzLmpzIiwic3JjL2xpYi9QSVhJLmpzIiwic3JjL2xpYi9TY2VuZS5qcyIsInNyYy9saWIvVGV4dHVyZS5qcyIsInNyYy9saWIvVmVjdG9yLmpzIiwic3JjL2xpYi91dGlscy5qcyIsInNyYy9vYmplY3RzL0Fpci5qcyIsInNyYy9vYmplY3RzL0J1bGxldC5qcyIsInNyYy9vYmplY3RzL0NhdC5qcyIsInNyYy9vYmplY3RzL0Rvb3IuanMiLCJzcmMvb2JqZWN0cy9HYW1lT2JqZWN0LmpzIiwic3JjL29iamVjdHMvR3Jhc3MuanMiLCJzcmMvb2JqZWN0cy9HcmFzc0RlY29yYXRlMS5qcyIsInNyYy9vYmplY3RzL0dyb3VuZC5qcyIsInNyYy9vYmplY3RzL0lyb25GZW5jZS5qcyIsInNyYy9vYmplY3RzL1Jvb3QuanMiLCJzcmMvb2JqZWN0cy9Ub3JjaC5qcyIsInNyYy9vYmplY3RzL1RyZWFzdXJlLmpzIiwic3JjL29iamVjdHMvVHJlZS5qcyIsInNyYy9vYmplY3RzL1dhbGwuanMiLCJzcmMvb2JqZWN0cy9XYWxsU2hvb3RCb2x0LmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0NhcnJ5LmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0ZpcmUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvSGVhbHRoLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0tleUZpcmUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvS2V5TW92ZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9LZXlQbGFjZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9MZWFybi5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9Nb3ZlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL09wZXJhdGUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvUGxhY2UuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvUm90YXRlLmpzIiwic3JjL3NjZW5lcy9Mb2FkaW5nU2NlbmUuanMiLCJzcmMvc2NlbmVzL1BsYXlTY2VuZS5qcyIsInNyYy91aS9JbnZlbnRvcnlXaW5kb3cuanMiLCJzcmMvdWkvTWVzc2FnZVdpbmRvdy5qcyIsInNyYy91aS9QbGF5ZXJXaW5kb3cuanMiLCJzcmMvdWkvU2Nyb2xsYWJsZVdpbmRvdy5qcyIsInNyYy91aS9Ub3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbC5qcyIsInNyYy91aS9Ub3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbC5qcyIsInNyYy91aS9XaW5kb3cuanMiLCJzcmMvdWkvV3JhcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBQ0EsT0FBQSxDQUFBLEdBQVMsS0FBQSxHQUFBLENBQVMsS0FBVCxDQUFBLEVBQWlCLFNBQTFCLENBQVMsQ0FBVDtBQUNBLE9BQUEsQ0FBQSxHQUFTLEtBQUEsR0FBQSxDQUFTLEtBQVQsQ0FBQSxFQUFpQixTQUFBLENBQUEsR0FBYSxTQUFiLE1BQUEsR0FBMUIsTUFBUyxDQUFUO0FBQ0Q7O0lBQ0ssVTs7Ozs7Ozs7QUFDSjs7Ozs7Ozs7OEJBUWtCLGEsRUFBZSxHLEVBQUs7QUFDcEMsb0JBQUEsR0FBQSxJQUFBLEdBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUEsYUFBQTtBQUNBLG9CQUFBLGtCQUFBLEdBQUEsbUJBQUE7QUFDRDs7Ozs7O2tCQUdZLE8iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgb2JqZWN0Q3JlYXRlUG9seWZpbGxcbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgb2JqZWN0S2V5c1BvbHlmaWxsXG52YXIgYmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGZ1bmN0aW9uQmluZFBvbHlmaWxsXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbnZhciBoYXNEZWZpbmVQcm9wZXJ0eTtcbnRyeSB7XG4gIHZhciBvID0ge307XG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCAneCcsIHsgdmFsdWU6IDAgfSk7XG4gIGhhc0RlZmluZVByb3BlcnR5ID0gby54ID09PSAwO1xufSBjYXRjaCAoZXJyKSB7IGhhc0RlZmluZVByb3BlcnR5ID0gZmFsc2UgfVxuaWYgKGhhc0RlZmluZVByb3BlcnR5KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIGlucHV0IGlzIGEgcG9zaXRpdmUgbnVtYmVyICh3aG9zZSB2YWx1ZSBpcyB6ZXJvIG9yXG4gICAgICAvLyBncmVhdGVyIGFuZCBub3QgYSBOYU4pLlxuICAgICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgYXJnICE9PSBhcmcpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZGVmYXVsdE1heExpc3RlbmVyc1wiIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gICAgfVxuICB9KTtcbn0gZWxzZSB7XG4gIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcIm5cIiBhcmd1bWVudCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gJGdldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gJGdldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbi8vIFRoZXNlIHN0YW5kYWxvbmUgZW1pdCogZnVuY3Rpb25zIGFyZSB1c2VkIHRvIG9wdGltaXplIGNhbGxpbmcgb2YgZXZlbnRcbi8vIGhhbmRsZXJzIGZvciBmYXN0IGNhc2VzIGJlY2F1c2UgZW1pdCgpIGl0c2VsZiBvZnRlbiBoYXMgYSB2YXJpYWJsZSBudW1iZXIgb2Zcbi8vIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGJlY2F1c2Ugb2YgdGhhdC4gVGhlc2UgZnVuY3Rpb25zIGFsd2F5cyBoYXZlXG4vLyB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCB0aHVzIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQsIHNvIHRoZSBjb2RlXG4vLyBpbnNpZGUgdGhlbSBjYW4gZXhlY3V0ZSBmYXN0ZXIuXG5mdW5jdGlvbiBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJncykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgZXZlbnRzO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PSBudWxsKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpXG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoIWhhbmRsZXIpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBpc0ZuID0gdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbic7XG4gIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgY2FzZSAxOlxuICAgICAgZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgdGhpcyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDpcbiAgICAgIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTtcbiAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgZGVmYXVsdDpcbiAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmICghZXZlbnRzKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lcikge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgICAgcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDogW2V4aXN0aW5nLCBsaXN0ZW5lcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICAgIGlmIChwcmVwZW5kKSB7XG4gICAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXhpc3RpbmcucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBpZiAoIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgbSA9ICRnZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICAgIGlmIChtICYmIG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnIFwiJyArIFN0cmluZyh0eXBlKSArICdcIiBsaXN0ZW5lcnMgJyArXG4gICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0LicpO1xuICAgICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgICB3LnR5cGUgPSB0eXBlO1xuICAgICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignJXM6ICVzJywgdy5uYW1lLCB3Lm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0pO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzJdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpXG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9vbmNlV3JhcCh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzdGF0ZSA9IHsgZmlyZWQ6IGZhbHNlLCB3cmFwRm46IHVuZGVmaW5lZCwgdGFyZ2V0OiB0YXJnZXQsIHR5cGU6IHR5cGUsIGxpc3RlbmVyOiBsaXN0ZW5lciB9O1xuICB2YXIgd3JhcHBlZCA9IGJpbmQuY2FsbChvbmNlV3JhcHBlciwgc3RhdGUpO1xuICB3cmFwcGVkLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHN0YXRlLndyYXBGbiA9IHdyYXBwZWQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB0aGlzLm9uKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZE9uY2VMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmICghbGlzdClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fCBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgc3BsaWNlT25lKGxpc3QsIHBvc2l0aW9uKTtcblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHMsIGk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKCFldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50c1t0eXBlXSkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGtleXMgPSBvYmplY3RLZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKCFldmVudHMpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoIWV2bGlzdGVuZXIpXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXR1cm4gdW53cmFwID8gW2V2bGlzdGVuZXIubGlzdGVuZXIgfHwgZXZsaXN0ZW5lcl0gOiBbZXZsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHVud3JhcCA/IHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICByZXR1cm4gdGhpcy5fZXZlbnRzQ291bnQgPiAwID8gUmVmbGVjdC5vd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbi8vIEFib3V0IDEuNXggZmFzdGVyIHRoYW4gdGhlIHR3by1hcmcgdmVyc2lvbiBvZiBBcnJheSNzcGxpY2UoKS5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKHZhciBpID0gaW5kZXgsIGsgPSBpICsgMSwgbiA9IGxpc3QubGVuZ3RoOyBrIDwgbjsgaSArPSAxLCBrICs9IDEpXG4gICAgbGlzdFtpXSA9IGxpc3Rba107XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb2JqZWN0Q3JlYXRlUG9seWZpbGwocHJvdG8pIHtcbiAgdmFyIEYgPSBmdW5jdGlvbigpIHt9O1xuICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICByZXR1cm4gbmV3IEY7XG59XG5mdW5jdGlvbiBvYmplY3RLZXlzUG9seWZpbGwob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGsgaW4gb2JqKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaykpIHtcbiAgICBrZXlzLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIGs7XG59XG5mdW5jdGlvbiBmdW5jdGlvbkJpbmRQb2x5ZmlsbChjb250ZXh0KSB7XG4gIHZhciBmbiA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG4iLCJcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoJy4vbGliL2tleWJvYXJkJyk7XG52YXIgTG9jYWxlICAgPSByZXF1aXJlKCcuL2xpYi9sb2NhbGUnKTtcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4vbGliL2tleS1jb21ibycpO1xuXG52YXIga2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoKTtcblxua2V5Ym9hcmQuc2V0TG9jYWxlKCd1cycsIHJlcXVpcmUoJy4vbG9jYWxlcy91cycpKTtcblxuZXhwb3J0cyAgICAgICAgICA9IG1vZHVsZS5leHBvcnRzID0ga2V5Ym9hcmQ7XG5leHBvcnRzLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5leHBvcnRzLkxvY2FsZSAgID0gTG9jYWxlO1xuZXhwb3J0cy5LZXlDb21ibyA9IEtleUNvbWJvO1xuIiwiXG5mdW5jdGlvbiBLZXlDb21ibyhrZXlDb21ib1N0cikge1xuICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICB0aGlzLnN1YkNvbWJvcyA9IEtleUNvbWJvLnBhcnNlQ29tYm9TdHIoa2V5Q29tYm9TdHIpO1xuICB0aGlzLmtleU5hbWVzICA9IHRoaXMuc3ViQ29tYm9zLnJlZHVjZShmdW5jdGlvbihtZW1vLCBuZXh0U3ViQ29tYm8pIHtcbiAgICByZXR1cm4gbWVtby5jb25jYXQobmV4dFN1YkNvbWJvKTtcbiAgfSwgW10pO1xufVxuXG4vLyBUT0RPOiBBZGQgc3VwcG9ydCBmb3Iga2V5IGNvbWJvIHNlcXVlbmNlc1xuS2V5Q29tYm8uc2VxdWVuY2VEZWxpbWluYXRvciA9ICc+Pic7XG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yICAgID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICAgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIHZhciBzdWJDb21ib1N0cnMgPSBLZXlDb21iby5fc3BsaXRTdHIoa2V5Q29tYm9TdHIsIEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IpO1xuICB2YXIgY29tYm8gICAgICAgID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDAgOyBpIDwgc3ViQ29tYm9TdHJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgY29tYm8ucHVzaChLZXlDb21iby5fc3BsaXRTdHIoc3ViQ29tYm9TdHJzW2ldLCBLZXlDb21iby5rZXlEZWxpbWluYXRvcikpO1xuICB9XG4gIHJldHVybiBjb21ibztcbn07XG5cbktleUNvbWJvLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKHByZXNzZWRLZXlOYW1lcykge1xuICB2YXIgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgdGhpcy5zdWJDb21ib3NbaV0sXG4gICAgICBzdGFydGluZ0tleU5hbWVJbmRleCxcbiAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICk7XG4gICAgaWYgKHN0YXJ0aW5nS2V5TmFtZUluZGV4ID09PSAtMSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbktleUNvbWJvLnByb3RvdHlwZS5pc0VxdWFsID0gZnVuY3Rpb24ob3RoZXJLZXlDb21ibykge1xuICBpZiAoXG4gICAgIW90aGVyS2V5Q29tYm8gfHxcbiAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ29iamVjdCdcbiAgKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICBvdGhlcktleUNvbWJvID0gbmV3IEtleUNvbWJvKG90aGVyS2V5Q29tYm8pO1xuICB9XG5cbiAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAodGhpcy5zdWJDb21ib3NbaV0ubGVuZ3RoICE9PSBvdGhlcktleUNvbWJvLnN1YkNvbWJvc1tpXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIHN1YkNvbWJvICAgICAgPSB0aGlzLnN1YkNvbWJvc1tpXTtcbiAgICB2YXIgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdWJDb21iby5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgdmFyIGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgIHZhciBpbmRleCAgID0gb3RoZXJTdWJDb21iby5pbmRleE9mKGtleU5hbWUpO1xuXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBvdGhlclN1YkNvbWJvLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvdGhlclN1YkNvbWJvLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuS2V5Q29tYm8uX3NwbGl0U3RyID0gZnVuY3Rpb24oc3RyLCBkZWxpbWluYXRvcikge1xuICB2YXIgcyAgPSBzdHI7XG4gIHZhciBkICA9IGRlbGltaW5hdG9yO1xuICB2YXIgYyAgPSAnJztcbiAgdmFyIGNhID0gW107XG5cbiAgZm9yICh2YXIgY2kgPSAwOyBjaSA8IHMubGVuZ3RoOyBjaSArPSAxKSB7XG4gICAgaWYgKGNpID4gMCAmJiBzW2NpXSA9PT0gZCAmJiBzW2NpIC0gMV0gIT09ICdcXFxcJykge1xuICAgICAgY2EucHVzaChjLnRyaW0oKSk7XG4gICAgICBjID0gJyc7XG4gICAgICBjaSArPSAxO1xuICAgIH1cbiAgICBjICs9IHNbY2ldO1xuICB9XG4gIGlmIChjKSB7IGNhLnB1c2goYy50cmltKCkpOyB9XG5cbiAgcmV0dXJuIGNhO1xufTtcblxuS2V5Q29tYm8ucHJvdG90eXBlLl9jaGVja1N1YkNvbWJvID0gZnVuY3Rpb24oc3ViQ29tYm8sIHN0YXJ0aW5nS2V5TmFtZUluZGV4LCBwcmVzc2VkS2V5TmFtZXMpIHtcbiAgc3ViQ29tYm8gPSBzdWJDb21iby5zbGljZSgwKTtcbiAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICB2YXIgZW5kSW5kZXggPSBzdGFydGluZ0tleU5hbWVJbmRleDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJDb21iby5sZW5ndGg7IGkgKz0gMSkge1xuXG4gICAgdmFyIGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICBpZiAoa2V5TmFtZVswXSA9PT0gJ1xcXFwnKSB7XG4gICAgICB2YXIgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgaWYgKFxuICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvciB8fFxuICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICkge1xuICAgICAgICBrZXlOYW1lID0gZXNjYXBlZEtleU5hbWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHN1YkNvbWJvLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICAgIGlmIChpbmRleCA+IGVuZEluZGV4KSB7XG4gICAgICAgIGVuZEluZGV4ID0gaW5kZXg7XG4gICAgICB9XG4gICAgICBpZiAoc3ViQ29tYm8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBlbmRJbmRleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleUNvbWJvO1xuIiwiXG52YXIgTG9jYWxlID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4va2V5LWNvbWJvJyk7XG5cblxuZnVuY3Rpb24gS2V5Ym9hcmQodGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KSB7XG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fY3VycmVudENvbnRleHQgICAgICAgPSBudWxsO1xuICB0aGlzLl9jb250ZXh0cyAgICAgICAgICAgICA9IHt9O1xuICB0aGlzLl9saXN0ZW5lcnMgICAgICAgICAgICA9IFtdO1xuICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xuICB0aGlzLl9sb2NhbGVzICAgICAgICAgICAgICA9IHt9O1xuICB0aGlzLl90YXJnZXRFbGVtZW50ICAgICAgICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0UGxhdGZvcm0gICAgICAgPSAnJztcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ICAgICAgPSAnJztcbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcbiAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSBudWxsO1xuICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcbiAgdGhpcy5fcGF1c2VkICAgICAgICAgICAgICAgPSBmYWxzZTtcbiAgdGhpcy5fY2FsbGVySGFuZGxlciAgICAgICAgPSBudWxsO1xuXG4gIHRoaXMuc2V0Q29udGV4dCgnZ2xvYmFsJyk7XG4gIHRoaXMud2F0Y2godGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KTtcbn1cblxuS2V5Ym9hcmQucHJvdG90eXBlLnNldExvY2FsZSA9IGZ1bmN0aW9uKGxvY2FsZU5hbWUsIGxvY2FsZUJ1aWxkZXIpIHtcbiAgdmFyIGxvY2FsZSA9IG51bGw7XG4gIGlmICh0eXBlb2YgbG9jYWxlTmFtZSA9PT0gJ3N0cmluZycpIHtcblxuICAgIGlmIChsb2NhbGVCdWlsZGVyKSB7XG4gICAgICBsb2NhbGUgPSBuZXcgTG9jYWxlKGxvY2FsZU5hbWUpO1xuICAgICAgbG9jYWxlQnVpbGRlcihsb2NhbGUsIHRoaXMuX3RhcmdldFBsYXRmb3JtLCB0aGlzLl90YXJnZXRVc2VyQWdlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2NhbGUgPSB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdIHx8IG51bGw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxvY2FsZSAgICAgPSBsb2NhbGVOYW1lO1xuICAgIGxvY2FsZU5hbWUgPSBsb2NhbGUuX2xvY2FsZU5hbWU7XG4gIH1cblxuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgID0gbG9jYWxlO1xuICB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdID0gbG9jYWxlO1xuICBpZiAobG9jYWxlKSB7XG4gICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzID0gbG9jYWxlLnByZXNzZWRLZXlzO1xuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxOYW1lKSB7XG4gIGxvY2FsTmFtZSB8fCAobG9jYWxOYW1lID0gdGhpcy5fbG9jYWxlLmxvY2FsZU5hbWUpO1xuICByZXR1cm4gdGhpcy5fbG9jYWxlc1tsb2NhbE5hbWVdIHx8IG51bGw7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0ID0gcmVsZWFzZUhhbmRsZXI7XG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA9IHByZXNzSGFuZGxlcjtcbiAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgID0ga2V5Q29tYm9TdHI7XG4gICAga2V5Q29tYm9TdHIgICAgICAgICAgICA9IG51bGw7XG4gIH1cblxuICBpZiAoXG4gICAga2V5Q29tYm9TdHIgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fbGlzdGVuZXJzLnB1c2goe1xuICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBrZXlDb21ib1N0ciA/IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0cikgOiBudWxsLFxuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBwcmVzc0hhbmRsZXIgICAgICAgICAgIHx8IG51bGwsXG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IHJlbGVhc2VIYW5kbGVyICAgICAgICAgfHwgbnVsbCxcbiAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZSxcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZVxuICB9KTtcbn07XG5LZXlib2FyZC5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUuYmluZDtcbktleWJvYXJkLnByb3RvdHlwZS5vbiAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xuXG5LZXlib2FyZC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJlbGVhc2VIYW5kbGVyID0gcHJlc3NIYW5kbGVyO1xuICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XG4gICAga2V5Q29tYm9TdHIgPSBudWxsO1xuICB9XG5cbiAgaWYgKFxuICAgIGtleUNvbWJvU3RyICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbaV07XG5cbiAgICB2YXIgY29tYm9NYXRjaGVzICAgICAgICAgID0gIWtleUNvbWJvU3RyICYmICFsaXN0ZW5lci5rZXlDb21ibyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5rZXlDb21ibyAmJiBsaXN0ZW5lci5rZXlDb21iby5pc0VxdWFsKGtleUNvbWJvU3RyKTtcbiAgICB2YXIgcHJlc3NIYW5kbGVyTWF0Y2hlcyAgID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJlc3NIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXNzSGFuZGxlciA9PT0gbGlzdGVuZXIucHJlc3NIYW5kbGVyO1xuICAgIHZhciByZWxlYXNlSGFuZGxlck1hdGNoZXMgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcmVsZWFzZUhhbmRsZXIgJiYgIWxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyID09PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcblxuICAgIGlmIChjb21ib01hdGNoZXMgJiYgcHJlc3NIYW5kbGVyTWF0Y2hlcyAmJiByZWxlYXNlSGFuZGxlck1hdGNoZXMpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuS2V5Ym9hcmQucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcbktleWJvYXJkLnByb3RvdHlwZS5vZmYgICAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS51bmJpbmQ7XG5cbktleWJvYXJkLnByb3RvdHlwZS5zZXRDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUpIHtcbiAgaWYodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuXG4gIGlmICghdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdKSB7XG4gICAgdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdID0gW107XG4gIH1cbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgPSB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV07XG4gIHRoaXMuX2N1cnJlbnRDb250ZXh0ID0gY29udGV4dE5hbWU7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fY3VycmVudENvbnRleHQ7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUud2l0aENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSwgY2FsbGJhY2spIHtcbiAgdmFyIHByZXZpb3VzQ29udGV4dE5hbWUgPSB0aGlzLmdldENvbnRleHQoKTtcbiAgdGhpcy5zZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICBjYWxsYmFjaygpO1xuXG4gIHRoaXMuc2V0Q29udGV4dChwcmV2aW91c0NvbnRleHROYW1lKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHRoaXMuc3RvcCgpO1xuXG4gIGlmICghdGFyZ2V0V2luZG93KSB7XG4gICAgaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiAhZ2xvYmFsLmF0dGFjaEV2ZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGdsb2JhbCBmdW5jdGlvbnMgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcbiAgICB9XG4gICAgdGFyZ2V0V2luZG93ID0gZ2xvYmFsO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0YXJnZXRXaW5kb3cubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0UGxhdGZvcm07XG4gICAgdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0RWxlbWVudDtcbiAgICB0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3c7XG4gICAgdGFyZ2V0V2luZG93ICAgID0gZ2xvYmFsO1xuICB9XG5cbiAgaWYgKCF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAmJiAhdGFyZ2V0V2luZG93LmF0dGFjaEV2ZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50IG1ldGhvZHMgb24gdGFyZ2V0V2luZG93LicpO1xuICB9XG5cbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyID0gISF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcblxuICB2YXIgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgdmFyIHBsYXRmb3JtICA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSAgfHwgJyc7XG5cbiAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcbiAgdGFyZ2V0UGxhdGZvcm0gICYmIHRhcmdldFBsYXRmb3JtICAhPT0gbnVsbCB8fCAodGFyZ2V0UGxhdGZvcm0gID0gcGxhdGZvcm0pO1xuICB0YXJnZXRVc2VyQWdlbnQgJiYgdGFyZ2V0VXNlckFnZW50ICE9PSBudWxsIHx8ICh0YXJnZXRVc2VyQWdlbnQgPSB1c2VyQWdlbnQpO1xuXG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5wcmVzc0tleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gICAgX3RoaXMuX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKTtcbiAgfTtcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgfTtcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudClcbiAgfTtcblxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0RWxlbWVudDtcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0VXNlckFnZW50O1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBpZiAoIXRoaXMuX3RhcmdldEVsZW1lbnQgfHwgIXRoaXMuX3RhcmdldFdpbmRvdykgeyByZXR1cm47IH1cblxuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICB0aGlzLl90YXJnZXRXaW5kb3cgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCA9IG51bGw7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucHJlc3NLZXkoa2V5Q29kZSk7XG4gIHRoaXMuX2FwcGx5QmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucmVsZWFzZUtleShrZXlDb2RlKTtcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVsZWFzZUFsbEtleXMgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cbiAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yZWxlYXNlQWxsS2V5cygpO1xuICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fYmluZEV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgIHRhcmdldEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgdGFyZ2V0RWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fdW5iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgdGFyZ2V0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICB0YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9nZXRHcm91cGVkTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsaXN0ZW5lckdyb3VwcyAgID0gW107XG4gIHZhciBsaXN0ZW5lckdyb3VwTWFwID0gW107XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ICE9PSAnZ2xvYmFsJykge1xuICAgIGxpc3RlbmVycyA9IFtdLmNvbmNhdChsaXN0ZW5lcnMsIHRoaXMuX2NvbnRleHRzLmdsb2JhbCk7XG4gIH1cblxuICBsaXN0ZW5lcnMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIChiLmtleUNvbWJvID8gYi5rZXlDb21iby5rZXlOYW1lcy5sZW5ndGggOiAwKSAtIChhLmtleUNvbWJvID8gYS5rZXlDb21iby5rZXlOYW1lcy5sZW5ndGggOiAwKTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbihsKSB7XG4gICAgdmFyIG1hcEluZGV4ID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXSA9PT0gbnVsbCAmJiBsLmtleUNvbWJvID09PSBudWxsIHx8XG4gICAgICAgICAgbGlzdGVuZXJHcm91cE1hcFtpXSAhPT0gbnVsbCAmJiBsaXN0ZW5lckdyb3VwTWFwW2ldLmlzRXF1YWwobC5rZXlDb21ibykpIHtcbiAgICAgICAgbWFwSW5kZXggPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobWFwSW5kZXggPT09IC0xKSB7XG4gICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xuICAgICAgbGlzdGVuZXJHcm91cE1hcC5wdXNoKGwua2V5Q29tYm8pO1xuICAgIH1cbiAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xuICAgICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdID0gW107XG4gICAgfVxuICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xuICB9KTtcbiAgcmV0dXJuIGxpc3RlbmVyR3JvdXBzO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9hcHBseUJpbmRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgdmFyIHByZXZlbnRSZXBlYXQgPSBmYWxzZTtcblxuICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gIGV2ZW50LnByZXZlbnRSZXBlYXQgPSBmdW5jdGlvbigpIHsgcHJldmVudFJlcGVhdCA9IHRydWU7IH07XG4gIGV2ZW50LnByZXNzZWRLZXlzICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgdmFyIHByZXNzZWRLZXlzICAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuICB2YXIgbGlzdGVuZXJHcm91cHMgPSB0aGlzLl9nZXRHcm91cGVkTGlzdGVuZXJzKCk7XG5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGxpc3RlbmVycyA9IGxpc3RlbmVyR3JvdXBzW2ldO1xuICAgIHZhciBrZXlDb21ibyAgPSBsaXN0ZW5lcnNbMF0ua2V5Q29tYm87XG5cbiAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwga2V5Q29tYm8uY2hlY2socHJlc3NlZEtleXMpKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxpc3RlbmVycy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbal07XG5cbiAgICAgICAgaWYgKGtleUNvbWJvID09PSBudWxsKSB7XG4gICAgICAgICAgbGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBrZXlDb21ibyAgICAgICAgICAgICAgIDogbmV3IEtleUNvbWJvKHByZXNzZWRLZXlzLmpvaW4oJysnKSksXG4gICAgICAgICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogbGlzdGVuZXIucHJlc3NIYW5kbGVyLFxuICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLFxuICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA6IGxpc3RlbmVyLnByZXZlbnRSZXBlYXQsXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXIucHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgbGlzdGVuZXIucHJlc3NIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgIGlmIChwcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gcHJldmVudFJlcGVhdDtcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgJiYgdGhpcy5fYXBwbGllZExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChrZXlDb21ibykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleXMuaW5kZXhPZihrZXlDb21iby5rZXlOYW1lc1tqXSk7XG4gICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgcHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIGogLT0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fY2xlYXJCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50IHx8IChldmVudCA9IHt9KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzW2ldO1xuICAgIHZhciBrZXlDb21ibyA9IGxpc3RlbmVyLmtleUNvbWJvO1xuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCAha2V5Q29tYm8uY2hlY2sodGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzKSkge1xuICAgICAgaWYgKHRoaXMuX2NhbGxlckhhbmRsZXIgIT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyKSB7XG4gICAgICAgIHZhciBvbGRDYWxsZXIgPSB0aGlzLl9jYWxsZXJIYW5kbGVyO1xuICAgICAgICB0aGlzLl9jYWxsZXJIYW5kbGVyID0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XG4gICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0O1xuICAgICAgICBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgdGhpcy5fY2FsbGVySGFuZGxlciA9IG9sZENhbGxlcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9oYW5kbGVDb21tYW5kQnVnID0gZnVuY3Rpb24oZXZlbnQsIHBsYXRmb3JtKSB7XG4gIC8vIE9uIE1hYyB3aGVuIHRoZSBjb21tYW5kIGtleSBpcyBrZXB0IHByZXNzZWQsIGtleXVwIGlzIG5vdCB0cmlnZ2VyZWQgZm9yIGFueSBvdGhlciBrZXkuXG4gIC8vIEluIHRoaXMgY2FzZSBmb3JjZSBhIGtleXVwIGZvciBub24tbW9kaWZpZXIga2V5cyBkaXJlY3RseSBhZnRlciB0aGUga2V5cHJlc3MuXG4gIHZhciBtb2RpZmllcktleXMgPSBbXCJzaGlmdFwiLCBcImN0cmxcIiwgXCJhbHRcIiwgXCJjYXBzbG9ja1wiLCBcInRhYlwiLCBcImNvbW1hbmRcIl07XG4gIGlmIChwbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSAmJiB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuaW5jbHVkZXMoXCJjb21tYW5kXCIpICYmXG4gICAgICAhbW9kaWZpZXJLZXlzLmluY2x1ZGVzKHRoaXMuX2xvY2FsZS5nZXRLZXlOYW1lcyhldmVudC5rZXlDb2RlKVswXSkpIHtcbiAgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcoZXZlbnQpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xuIiwiXG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xuXG5cbmZ1bmN0aW9uIExvY2FsZShuYW1lKSB7XG4gIHRoaXMubG9jYWxlTmFtZSAgICAgPSBuYW1lO1xuICB0aGlzLnByZXNzZWRLZXlzICAgID0gW107XG4gIHRoaXMuX2FwcGxpZWRNYWNyb3MgPSBbXTtcbiAgdGhpcy5fa2V5TWFwICAgICAgICA9IHt9O1xuICB0aGlzLl9raWxsS2V5Q29kZXMgID0gW107XG4gIHRoaXMuX21hY3JvcyAgICAgICAgPSBbXTtcbn1cblxuTG9jYWxlLnByb3RvdHlwZS5iaW5kS2V5Q29kZSA9IGZ1bmN0aW9uKGtleUNvZGUsIGtleU5hbWVzKSB7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAga2V5TmFtZXMgPSBba2V5TmFtZXNdO1xuICB9XG5cbiAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmJpbmRNYWNybyA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnc3RyaW5nJykge1xuICAgIGtleU5hbWVzID0gWyBrZXlOYW1lcyBdO1xuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBudWxsO1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgIGtleU5hbWVzID0gbnVsbDtcbiAgfVxuXG4gIHZhciBtYWNybyA9IHtcbiAgICBrZXlDb21ibyA6IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0ciksXG4gICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICBoYW5kbGVyICA6IGhhbmRsZXJcbiAgfTtcblxuICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmdldEtleUNvZGVzID0gZnVuY3Rpb24oa2V5TmFtZSkge1xuICB2YXIga2V5Q29kZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5Q29kZSBpbiB0aGlzLl9rZXlNYXApIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICBpZiAoaW5kZXggPiAtMSkgeyBrZXlDb2Rlcy5wdXNoKGtleUNvZGV8MCk7IH1cbiAgfVxuICByZXR1cm4ga2V5Q29kZXM7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmdldEtleU5hbWVzID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICByZXR1cm4gdGhpcy5fa2V5TWFwW2tleUNvZGVdIHx8IFtdO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5zZXRLaWxsS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9raWxsS2V5Q29kZXMucHVzaChrZXlDb2RlKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIga2V5TmFtZXMgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSkgPT09IC0xKSB7XG4gICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2goa2V5TmFtZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuX2FwcGx5TWFjcm9zKCk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMucmVsZWFzZUtleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgZWxzZSB7XG4gICAgdmFyIGtleU5hbWVzICAgICAgICAgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICAgIHZhciBraWxsS2V5Q29kZUluZGV4ID0gdGhpcy5fa2lsbEtleUNvZGVzLmluZGV4T2Yoa2V5Q29kZSk7XG4gICAgXG4gICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY2xlYXJNYWNyb3MoKTtcbiAgfVxufTtcblxuTG9jYWxlLnByb3RvdHlwZS5fYXBwbHlNYWNyb3MgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1hY3JvcyA9IHRoaXMuX21hY3Jvcy5zbGljZSgwKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYWNyb3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbWFjcm8gPSBtYWNyb3NbaV07XG4gICAgaWYgKG1hY3JvLmtleUNvbWJvLmNoZWNrKHRoaXMucHJlc3NlZEtleXMpKSB7XG4gICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xuICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG1hY3JvLmhhbmRsZXIodGhpcy5wcmVzc2VkS2V5cyk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pID09PSAtMSkge1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMucHVzaChtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3MucHVzaChtYWNybyk7XG4gICAgfVxuICB9XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLl9jbGVhck1hY3JvcyA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRNYWNyb3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbWFjcm8gPSB0aGlzLl9hcHBsaWVkTWFjcm9zW2ldO1xuICAgIGlmICghbWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgIG1hY3JvLmtleU5hbWVzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3Muc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsZTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsb2NhbGUsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcblxuICAvLyBnZW5lcmFsXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzLCAgIFsnY2FuY2VsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOCwgICBbJ2JhY2tzcGFjZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDksICAgWyd0YWInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMiwgIFsnY2xlYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMywgIFsnZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNiwgIFsnc2hpZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNywgIFsnY3RybCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4LCAgWydhbHQnLCAnbWVudSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5LCAgWydwYXVzZScsICdicmVhayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIwLCAgWydjYXBzbG9jayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDI3LCAgWydlc2NhcGUnLCAnZXNjJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzIsICBbJ3NwYWNlJywgJ3NwYWNlYmFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzMsICBbJ3BhZ2V1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM0LCAgWydwYWdlZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM1LCAgWydlbmQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNiwgIFsnaG9tZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM3LCAgWydsZWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzgsICBbJ3VwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzksICBbJ3JpZ2h0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDAsICBbJ2Rvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MSwgIFsnc2VsZWN0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDIsICBbJ3ByaW50c2NyZWVuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDMsICBbJ2V4ZWN1dGUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NCwgIFsnc25hcHNob3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NSwgIFsnaW5zZXJ0JywgJ2lucyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ2LCAgWydkZWxldGUnLCAnZGVsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDcsICBbJ2hlbHAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDUsIFsnc2Nyb2xsbG9jaycsICdzY3JvbGwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODcsIFsnZXF1YWwnLCAnZXF1YWxzaWduJywgJz0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODgsIFsnY29tbWEnLCAnLCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MCwgWydwZXJpb2QnLCAnLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MSwgWydzbGFzaCcsICdmb3J3YXJkc2xhc2gnLCAnLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MiwgWydncmF2ZWFjY2VudCcsICdgJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjE5LCBbJ29wZW5icmFja2V0JywgJ1snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjAsIFsnYmFja3NsYXNoJywgJ1xcXFwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjEsIFsnY2xvc2VicmFja2V0JywgJ10nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjIsIFsnYXBvc3Ryb3BoZScsICdcXCcnXSk7XG5cbiAgLy8gMC05XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OCwgWyd6ZXJvJywgJzAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OSwgWydvbmUnLCAnMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUwLCBbJ3R3bycsICcyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTEsIFsndGhyZWUnLCAnMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUyLCBbJ2ZvdXInLCAnNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUzLCBbJ2ZpdmUnLCAnNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU0LCBbJ3NpeCcsICc2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTUsIFsnc2V2ZW4nLCAnNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU2LCBbJ2VpZ2h0JywgJzgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NywgWyduaW5lJywgJzknXSk7XG5cbiAgLy8gbnVtcGFkXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NiwgWydudW16ZXJvJywgJ251bTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NywgWydudW1vbmUnLCAnbnVtMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk4LCBbJ251bXR3bycsICdudW0yJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTksIFsnbnVtdGhyZWUnLCAnbnVtMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMCwgWydudW1mb3VyJywgJ251bTQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDEsIFsnbnVtZml2ZScsICdudW01J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAyLCBbJ251bXNpeCcsICdudW02J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAzLCBbJ251bXNldmVuJywgJ251bTcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDQsIFsnbnVtZWlnaHQnLCAnbnVtOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNSwgWydudW1uaW5lJywgJ251bTknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDYsIFsnbnVtbXVsdGlwbHknLCAnbnVtKiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNywgWydudW1hZGQnLCAnbnVtKyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOCwgWydudW1lbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOSwgWydudW1zdWJ0cmFjdCcsICdudW0tJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEwLCBbJ251bWRlY2ltYWwnLCAnbnVtLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMSwgWydudW1kaXZpZGUnLCAnbnVtLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NCwgWydudW1sb2NrJywgJ251bSddKTtcblxuICAvLyBmdW5jdGlvbiBrZXlzXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTIsIFsnZjEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTMsIFsnZjInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTQsIFsnZjMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTUsIFsnZjQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTYsIFsnZjUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTcsIFsnZjYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTgsIFsnZjcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTksIFsnZjgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjAsIFsnZjknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjEsIFsnZjEwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIyLCBbJ2YxMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMywgWydmMTInXSk7XG5cbiAgLy8gc2Vjb25kYXJ5IGtleSBzeW1ib2xzXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgYCcsIFsndGlsZGUnLCAnfiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAxJywgWydleGNsYW1hdGlvbicsICdleGNsYW1hdGlvbnBvaW50JywgJyEnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMicsIFsnYXQnLCAnQCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAzJywgWydudW1iZXInLCAnIyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA0JywgWydkb2xsYXInLCAnZG9sbGFycycsICdkb2xsYXJzaWduJywgJyQnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNScsIFsncGVyY2VudCcsICclJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDYnLCBbJ2NhcmV0JywgJ14nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNycsIFsnYW1wZXJzYW5kJywgJ2FuZCcsICcmJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDgnLCBbJ2FzdGVyaXNrJywgJyonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOScsIFsnb3BlbnBhcmVuJywgJygnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMCcsIFsnY2xvc2VwYXJlbicsICcpJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC0nLCBbJ3VuZGVyc2NvcmUnLCAnXyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA9JywgWydwbHVzJywgJysnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgWycsIFsnb3BlbmN1cmx5YnJhY2UnLCAnb3BlbmN1cmx5YnJhY2tldCcsICd7J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIF0nLCBbJ2Nsb3NlY3VybHlicmFjZScsICdjbG9zZWN1cmx5YnJhY2tldCcsICd9J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcXFwnLCBbJ3ZlcnRpY2FsYmFyJywgJ3wnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOycsIFsnY29sb24nLCAnOiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXCcnLCBbJ3F1b3RhdGlvbm1hcmsnLCAnXFwnJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICEsJywgWydvcGVuYW5nbGVicmFja2V0JywgJzwnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLicsIFsnY2xvc2VhbmdsZWJyYWNrZXQnLCAnPiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAvJywgWydxdWVzdGlvbm1hcmsnLCAnPyddKTtcbiAgXG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykpIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjb21tYW5kJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxlLmJpbmRNYWNybygnY3RybCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xuICB9XG5cbiAgLy9hLXogYW5kIEEtWlxuICBmb3IgKHZhciBrZXlDb2RlID0gNjU7IGtleUNvZGUgPD0gOTA7IGtleUNvZGUgKz0gMSkge1xuICAgIHZhciBrZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlICsgMzIpO1xuICAgIHZhciBjYXBpdGFsS2V5TmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSk7XG4gIFx0bG9jYWxlLmJpbmRLZXlDb2RlKGtleUNvZGUsIGtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgXHRsb2NhbGUuYmluZE1hY3JvKCdjYXBzbG9jayArICcgKyBrZXlOYW1lLCBjYXBpdGFsS2V5TmFtZSk7XG4gIH1cblxuICAvLyBicm93c2VyIGNhdmVhdHNcbiAgdmFyIHNlbWljb2xvbktleUNvZGUgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDU5ICA6IDE4NjtcbiAgdmFyIGRhc2hLZXlDb2RlICAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDE3MyA6IDE4OTtcbiAgdmFyIGxlZnRDb21tYW5kS2V5Q29kZTtcbiAgdmFyIHJpZ2h0Q29tbWFuZEtleUNvZGU7XG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgKHVzZXJBZ2VudC5tYXRjaCgnU2FmYXJpJykgfHwgdXNlckFnZW50Lm1hdGNoKCdDaHJvbWUnKSkpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gOTE7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDkzO1xuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnT3BlcmEnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAxNztcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMTc7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMjI0O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAyMjQ7XG4gIH1cbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHNlbWljb2xvbktleUNvZGUsICAgIFsnc2VtaWNvbG9uJywgJzsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShkYXNoS2V5Q29kZSwgICAgICAgICBbJ2Rhc2gnLCAnLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGxlZnRDb21tYW5kS2V5Q29kZSwgIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdsZWZ0Y29tbWFuZCcsICdsZWZ0d2luZG93cycsICdsZWZ0d2luJywgJ2xlZnRzdXBlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHJpZ2h0Q29tbWFuZEtleUNvZGUsIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdyaWdodGNvbW1hbmQnLCAncmlnaHR3aW5kb3dzJywgJ3JpZ2h0d2luJywgJ3JpZ2h0c3VwZXInXSk7XG5cbiAgLy8ga2lsbCBrZXlzXG4gIGxvY2FsZS5zZXRLaWxsS2V5KCdjb21tYW5kJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdWJqZWN0KSB7XG4gIHZhbGlkYXRlU3ViamVjdChzdWJqZWN0KTtcblxuICB2YXIgZXZlbnRzU3RvcmFnZSA9IGNyZWF0ZUV2ZW50c1N0b3JhZ2Uoc3ViamVjdCk7XG4gIHN1YmplY3Qub24gPSBldmVudHNTdG9yYWdlLm9uO1xuICBzdWJqZWN0Lm9mZiA9IGV2ZW50c1N0b3JhZ2Uub2ZmO1xuICBzdWJqZWN0LmZpcmUgPSBldmVudHNTdG9yYWdlLmZpcmU7XG4gIHJldHVybiBzdWJqZWN0O1xufTtcblxuZnVuY3Rpb24gY3JlYXRlRXZlbnRzU3RvcmFnZShzdWJqZWN0KSB7XG4gIC8vIFN0b3JlIGFsbCBldmVudCBsaXN0ZW5lcnMgdG8gdGhpcyBoYXNoLiBLZXkgaXMgZXZlbnQgbmFtZSwgdmFsdWUgaXMgYXJyYXlcbiAgLy8gb2YgY2FsbGJhY2sgcmVjb3Jkcy5cbiAgLy9cbiAgLy8gQSBjYWxsYmFjayByZWNvcmQgY29uc2lzdHMgb2YgY2FsbGJhY2sgZnVuY3Rpb24gYW5kIGl0cyBvcHRpb25hbCBjb250ZXh0OlxuICAvLyB7ICdldmVudE5hbWUnID0+IFt7Y2FsbGJhY2s6IGZ1bmN0aW9uLCBjdHg6IG9iamVjdH1dIH1cbiAgdmFyIHJlZ2lzdGVyZWRFdmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHJldHVybiB7XG4gICAgb246IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYWxsYmFjayBpcyBleHBlY3RlZCB0byBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgICB2YXIgaGFuZGxlcnMgPSByZWdpc3RlcmVkRXZlbnRzW2V2ZW50TmFtZV07XG4gICAgICBpZiAoIWhhbmRsZXJzKSB7XG4gICAgICAgIGhhbmRsZXJzID0gcmVnaXN0ZXJlZEV2ZW50c1tldmVudE5hbWVdID0gW107XG4gICAgICB9XG4gICAgICBoYW5kbGVycy5wdXNoKHtjYWxsYmFjazogY2FsbGJhY2ssIGN0eDogY3R4fSk7XG5cbiAgICAgIHJldHVybiBzdWJqZWN0O1xuICAgIH0sXG5cbiAgICBvZmY6IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgd2FudFRvUmVtb3ZlQWxsID0gKHR5cGVvZiBldmVudE5hbWUgPT09ICd1bmRlZmluZWQnKTtcbiAgICAgIGlmICh3YW50VG9SZW1vdmVBbGwpIHtcbiAgICAgICAgLy8gS2lsbGluZyBvbGQgZXZlbnRzIHN0b3JhZ2Ugc2hvdWxkIGJlIGVub3VnaCBpbiB0aGlzIGNhc2U6XG4gICAgICAgIHJlZ2lzdGVyZWRFdmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICByZXR1cm4gc3ViamVjdDtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlZ2lzdGVyZWRFdmVudHNbZXZlbnROYW1lXSkge1xuICAgICAgICB2YXIgZGVsZXRlQWxsQ2FsbGJhY2tzRm9yRXZlbnQgPSAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKTtcbiAgICAgICAgaWYgKGRlbGV0ZUFsbENhbGxiYWNrc0ZvckV2ZW50KSB7XG4gICAgICAgICAgZGVsZXRlIHJlZ2lzdGVyZWRFdmVudHNbZXZlbnROYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgY2FsbGJhY2tzID0gcmVnaXN0ZXJlZEV2ZW50c1tldmVudE5hbWVdO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2tzW2ldLmNhbGxiYWNrID09PSBjYWxsYmFjaykge1xuICAgICAgICAgICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3ViamVjdDtcbiAgICB9LFxuXG4gICAgZmlyZTogZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgdmFyIGNhbGxiYWNrcyA9IHJlZ2lzdGVyZWRFdmVudHNbZXZlbnROYW1lXTtcbiAgICAgIGlmICghY2FsbGJhY2tzKSB7XG4gICAgICAgIHJldHVybiBzdWJqZWN0O1xuICAgICAgfVxuXG4gICAgICB2YXIgZmlyZUFyZ3VtZW50cztcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmaXJlQXJndW1lbnRzID0gQXJyYXkucHJvdG90eXBlLnNwbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB9XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjYWxsYmFja0luZm8gPSBjYWxsYmFja3NbaV07XG4gICAgICAgIGNhbGxiYWNrSW5mby5jYWxsYmFjay5hcHBseShjYWxsYmFja0luZm8uY3R4LCBmaXJlQXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN1YmplY3Q7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVN1YmplY3Qoc3ViamVjdCkge1xuICBpZiAoIXN1YmplY3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V2ZW50aWZ5IGNhbm5vdCB1c2UgZmFsc3kgb2JqZWN0IGFzIGV2ZW50cyBzdWJqZWN0Jyk7XG4gIH1cbiAgdmFyIHJlc2VydmVkV29yZHMgPSBbJ29uJywgJ2ZpcmUnLCAnb2ZmJ107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzZXJ2ZWRXb3Jkcy5sZW5ndGg7ICsraSkge1xuICAgIGlmIChzdWJqZWN0Lmhhc093blByb3BlcnR5KHJlc2VydmVkV29yZHNbaV0pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdWJqZWN0IGNhbm5vdCBiZSBldmVudGlmaWVkLCBzaW5jZSBpdCBhbHJlYWR5IGhhcyBwcm9wZXJ0eSAnXCIgKyByZXNlcnZlZFdvcmRzW2ldICsgXCInXCIpO1xuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IENvbnRhaW5zIGRlZmluaXRpb24gb2YgdGhlIGNvcmUgZ3JhcGggb2JqZWN0LlxuICovXG5cbi8vIFRPRE86IG5lZWQgdG8gY2hhbmdlIHN0b3JhZ2UgbGF5ZXI6XG4vLyAxLiBCZSBhYmxlIHRvIGdldCBhbGwgbm9kZXMgTygxKVxuLy8gMi4gQmUgYWJsZSB0byBnZXQgbnVtYmVyIG9mIGxpbmtzIE8oMSlcblxuLyoqXG4gKiBAZXhhbXBsZVxuICogIHZhciBncmFwaCA9IHJlcXVpcmUoJ25ncmFwaC5ncmFwaCcpKCk7XG4gKiAgZ3JhcGguYWRkTm9kZSgxKTsgICAgIC8vIGdyYXBoIGhhcyBvbmUgbm9kZS5cbiAqICBncmFwaC5hZGRMaW5rKDIsIDMpOyAgLy8gbm93IGdyYXBoIGNvbnRhaW5zIHRocmVlIG5vZGVzIGFuZCBvbmUgbGluay5cbiAqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlR3JhcGg7XG5cbnZhciBldmVudGlmeSA9IHJlcXVpcmUoJ25ncmFwaC5ldmVudHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGdyYXBoXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUdyYXBoKG9wdGlvbnMpIHtcbiAgLy8gR3JhcGggc3RydWN0dXJlIGlzIG1haW50YWluZWQgYXMgZGljdGlvbmFyeSBvZiBub2Rlc1xuICAvLyBhbmQgYXJyYXkgb2YgbGlua3MuIEVhY2ggbm9kZSBoYXMgJ2xpbmtzJyBwcm9wZXJ0eSB3aGljaFxuICAvLyBob2xkIGFsbCBsaW5rcyByZWxhdGVkIHRvIHRoYXQgbm9kZS4gQW5kIGdlbmVyYWwgbGlua3NcbiAgLy8gYXJyYXkgaXMgdXNlZCB0byBzcGVlZCB1cCBhbGwgbGlua3MgZW51bWVyYXRpb24uIFRoaXMgaXMgaW5lZmZpY2llbnRcbiAgLy8gaW4gdGVybXMgb2YgbWVtb3J5LCBidXQgc2ltcGxpZmllcyBjb2RpbmcuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoJ3VuaXF1ZUxpbmtJZCcgaW4gb3B0aW9ucykge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICduZ3JhcGguZ3JhcGg6IFN0YXJ0aW5nIGZyb20gdmVyc2lvbiAwLjE0IGB1bmlxdWVMaW5rSWRgIGlzIGRlcHJlY2F0ZWQuXFxuJyArXG4gICAgICAnVXNlIGBtdWx0aWdyYXBoYCBvcHRpb24gaW5zdGVhZFxcbicsXG4gICAgICAnXFxuJyxcbiAgICAgICdOb3RlOiB0aGVyZSBpcyBhbHNvIGNoYW5nZSBpbiBkZWZhdWx0IGJlaGF2aW9yOiBGcm9tIG5vdyBvd24gZWFjaCBncmFwaFxcbicrXG4gICAgICAnaXMgY29uc2lkZXJlZCB0byBiZSBub3QgYSBtdWx0aWdyYXBoIGJ5IGRlZmF1bHQgKGVhY2ggZWRnZSBpcyB1bmlxdWUpLidcbiAgICApO1xuXG4gICAgb3B0aW9ucy5tdWx0aWdyYXBoID0gb3B0aW9ucy51bmlxdWVMaW5rSWQ7XG4gIH1cblxuICAvLyBEZWFyIHJlYWRlciwgdGhlIG5vbi1tdWx0aWdyYXBocyBkbyBub3QgZ3VhcmFudGVlIHRoYXQgdGhlcmUgaXMgb25seVxuICAvLyBvbmUgbGluayBmb3IgYSBnaXZlbiBwYWlyIG9mIG5vZGUuIFdoZW4gdGhpcyBvcHRpb24gaXMgc2V0IHRvIGZhbHNlXG4gIC8vIHdlIGNhbiBzYXZlIHNvbWUgbWVtb3J5IGFuZCBDUFUgKDE4JSBmYXN0ZXIgZm9yIG5vbi1tdWx0aWdyYXBoKTtcbiAgaWYgKG9wdGlvbnMubXVsdGlncmFwaCA9PT0gdW5kZWZpbmVkKSBvcHRpb25zLm11bHRpZ3JhcGggPSBmYWxzZTtcblxuICB2YXIgbm9kZXMgPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJyA/IE9iamVjdC5jcmVhdGUobnVsbCkgOiB7fSxcbiAgICBsaW5rcyA9IFtdLFxuICAgIC8vIEhhc2ggb2YgbXVsdGktZWRnZXMuIFVzZWQgdG8gdHJhY2sgaWRzIG9mIGVkZ2VzIGJldHdlZW4gc2FtZSBub2Rlc1xuICAgIG11bHRpRWRnZXMgPSB7fSxcbiAgICBub2Rlc0NvdW50ID0gMCxcbiAgICBzdXNwZW5kRXZlbnRzID0gMCxcblxuICAgIGZvckVhY2hOb2RlID0gY3JlYXRlTm9kZUl0ZXJhdG9yKCksXG4gICAgY3JlYXRlTGluayA9IG9wdGlvbnMubXVsdGlncmFwaCA/IGNyZWF0ZVVuaXF1ZUxpbmsgOiBjcmVhdGVTaW5nbGVMaW5rLFxuXG4gICAgLy8gT3VyIGdyYXBoIEFQSSBwcm92aWRlcyBtZWFucyB0byBsaXN0ZW4gdG8gZ3JhcGggY2hhbmdlcy4gVXNlcnMgY2FuIHN1YnNjcmliZVxuICAgIC8vIHRvIGJlIG5vdGlmaWVkIGFib3V0IGNoYW5nZXMgaW4gdGhlIGdyYXBoIGJ5IHVzaW5nIGBvbmAgbWV0aG9kLiBIb3dldmVyXG4gICAgLy8gaW4gc29tZSBjYXNlcyB0aGV5IGRvbid0IHVzZSBpdC4gVG8gYXZvaWQgdW5uZWNlc3NhcnkgbWVtb3J5IGNvbnN1bXB0aW9uXG4gICAgLy8gd2Ugd2lsbCBub3QgcmVjb3JkIGdyYXBoIGNoYW5nZXMgdW50aWwgd2UgaGF2ZSBhdCBsZWFzdCBvbmUgc3Vic2NyaWJlci5cbiAgICAvLyBDb2RlIGJlbG93IHN1cHBvcnRzIHRoaXMgb3B0aW1pemF0aW9uLlxuICAgIC8vXG4gICAgLy8gQWNjdW11bGF0ZXMgYWxsIGNoYW5nZXMgbWFkZSBkdXJpbmcgZ3JhcGggdXBkYXRlcy5cbiAgICAvLyBFYWNoIGNoYW5nZSBlbGVtZW50IGNvbnRhaW5zOlxuICAgIC8vICBjaGFuZ2VUeXBlIC0gb25lIG9mIHRoZSBzdHJpbmdzOiAnYWRkJywgJ3JlbW92ZScgb3IgJ3VwZGF0ZSc7XG4gICAgLy8gIG5vZGUgLSBpZiBjaGFuZ2UgaXMgcmVsYXRlZCB0byBub2RlIHRoaXMgcHJvcGVydHkgaXMgc2V0IHRvIGNoYW5nZWQgZ3JhcGgncyBub2RlO1xuICAgIC8vICBsaW5rIC0gaWYgY2hhbmdlIGlzIHJlbGF0ZWQgdG8gbGluayB0aGlzIHByb3BlcnR5IGlzIHNldCB0byBjaGFuZ2VkIGdyYXBoJ3MgbGluaztcbiAgICBjaGFuZ2VzID0gW10sXG4gICAgcmVjb3JkTGlua0NoYW5nZSA9IG5vb3AsXG4gICAgcmVjb3JkTm9kZUNoYW5nZSA9IG5vb3AsXG4gICAgZW50ZXJNb2RpZmljYXRpb24gPSBub29wLFxuICAgIGV4aXRNb2RpZmljYXRpb24gPSBub29wO1xuXG4gIC8vIHRoaXMgaXMgb3VyIHB1YmxpYyBBUEk6XG4gIHZhciBncmFwaFBhcnQgPSB7XG4gICAgLyoqXG4gICAgICogQWRkcyBub2RlIHRvIHRoZSBncmFwaC4gSWYgbm9kZSB3aXRoIGdpdmVuIGlkIGFscmVhZHkgZXhpc3RzIGluIHRoZSBncmFwaFxuICAgICAqIGl0cyBkYXRhIGlzIGV4dGVuZGVkIHdpdGggd2hhdGV2ZXIgY29tZXMgaW4gJ2RhdGEnIGFyZ3VtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIG5vZGVJZCB0aGUgbm9kZSdzIGlkZW50aWZpZXIuIEEgc3RyaW5nIG9yIG51bWJlciBpcyBwcmVmZXJyZWQuXG4gICAgICogQHBhcmFtIFtkYXRhXSBhZGRpdGlvbmFsIGRhdGEgZm9yIHRoZSBub2RlIGJlaW5nIGFkZGVkLiBJZiBub2RlIGFscmVhZHlcbiAgICAgKiAgIGV4aXN0cyBpdHMgZGF0YSBvYmplY3QgaXMgYXVnbWVudGVkIHdpdGggdGhlIG5ldyBvbmUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtub2RlfSBUaGUgbmV3bHkgYWRkZWQgbm9kZSBvciBub2RlIHdpdGggZ2l2ZW4gaWQgaWYgaXQgYWxyZWFkeSBleGlzdHMuXG4gICAgICovXG4gICAgYWRkTm9kZTogYWRkTm9kZSxcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaW5rIHRvIHRoZSBncmFwaC4gVGhlIGZ1bmN0aW9uIGFsd2F5cyBjcmVhdGUgYSBuZXdcbiAgICAgKiBsaW5rIGJldHdlZW4gdHdvIG5vZGVzLiBJZiBvbmUgb2YgdGhlIG5vZGVzIGRvZXMgbm90IGV4aXN0c1xuICAgICAqIGEgbmV3IG5vZGUgaXMgY3JlYXRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmcm9tSWQgbGluayBzdGFydCBub2RlIGlkO1xuICAgICAqIEBwYXJhbSB0b0lkIGxpbmsgZW5kIG5vZGUgaWQ7XG4gICAgICogQHBhcmFtIFtkYXRhXSBhZGRpdGlvbmFsIGRhdGEgdG8gYmUgc2V0IG9uIHRoZSBuZXcgbGluaztcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2xpbmt9IFRoZSBuZXdseSBjcmVhdGVkIGxpbmtcbiAgICAgKi9cbiAgICBhZGRMaW5rOiBhZGRMaW5rLFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBsaW5rIGZyb20gdGhlIGdyYXBoLiBJZiBsaW5rIGRvZXMgbm90IGV4aXN0IGRvZXMgbm90aGluZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBsaW5rIC0gb2JqZWN0IHJldHVybmVkIGJ5IGFkZExpbmsoKSBvciBnZXRMaW5rcygpIG1ldGhvZHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGxpbmsgd2FzIHJlbW92ZWQ7IGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICByZW1vdmVMaW5rOiByZW1vdmVMaW5rLFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBub2RlIHdpdGggZ2l2ZW4gaWQgZnJvbSB0aGUgZ3JhcGguIElmIG5vZGUgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGdyYXBoXG4gICAgICogZG9lcyBub3RoaW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5vZGVJZCBub2RlJ3MgaWRlbnRpZmllciBwYXNzZWQgdG8gYWRkTm9kZSgpIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBub2RlIHdhcyByZW1vdmVkOyBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgcmVtb3ZlTm9kZTogcmVtb3ZlTm9kZSxcblxuICAgIC8qKlxuICAgICAqIEdldHMgbm9kZSB3aXRoIGdpdmVuIGlkZW50aWZpZXIuIElmIG5vZGUgZG9lcyBub3QgZXhpc3QgdW5kZWZpbmVkIHZhbHVlIGlzIHJldHVybmVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5vZGVJZCByZXF1ZXN0ZWQgbm9kZSBpZGVudGlmaWVyO1xuICAgICAqXG4gICAgICogQHJldHVybiB7bm9kZX0gaW4gd2l0aCByZXF1ZXN0ZWQgaWRlbnRpZmllciBvciB1bmRlZmluZWQgaWYgbm8gc3VjaCBub2RlIGV4aXN0cy5cbiAgICAgKi9cbiAgICBnZXROb2RlOiBnZXROb2RlLFxuXG4gICAgLyoqXG4gICAgICogR2V0cyBudW1iZXIgb2Ygbm9kZXMgaW4gdGhpcyBncmFwaC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gbnVtYmVyIG9mIG5vZGVzIGluIHRoZSBncmFwaC5cbiAgICAgKi9cbiAgICBnZXROb2Rlc0NvdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbm9kZXNDb3VudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0b3RhbCBudW1iZXIgb2YgbGlua3MgaW4gdGhlIGdyYXBoLlxuICAgICAqL1xuICAgIGdldExpbmtzQ291bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBsaW5rcy5sZW5ndGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldHMgYWxsIGxpbmtzIChpbmJvdW5kIGFuZCBvdXRib3VuZCkgZnJvbSB0aGUgbm9kZSB3aXRoIGdpdmVuIGlkLlxuICAgICAqIElmIG5vZGUgd2l0aCBnaXZlbiBpZCBpcyBub3QgZm91bmQgbnVsbCBpcyByZXR1cm5lZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBub2RlSWQgcmVxdWVzdGVkIG5vZGUgaWRlbnRpZmllci5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gQXJyYXkgb2YgbGlua3MgZnJvbSBhbmQgdG8gcmVxdWVzdGVkIG5vZGUgaWYgc3VjaCBub2RlIGV4aXN0cztcbiAgICAgKiAgIG90aGVyd2lzZSBudWxsIGlzIHJldHVybmVkLlxuICAgICAqL1xuICAgIGdldExpbmtzOiBnZXRMaW5rcyxcblxuICAgIC8qKlxuICAgICAqIEludm9rZXMgY2FsbGJhY2sgb24gZWFjaCBub2RlIG9mIHRoZSBncmFwaC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb24obm9kZSl9IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGJlIGludm9rZWQuIFRoZSBmdW5jdGlvblxuICAgICAqICAgaXMgcGFzc2VkIG9uZSBhcmd1bWVudDogdmlzaXRlZCBub2RlLlxuICAgICAqL1xuICAgIGZvckVhY2hOb2RlOiBmb3JFYWNoTm9kZSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZXMgY2FsbGJhY2sgb24gZXZlcnkgbGlua2VkIChhZGphY2VudCkgbm9kZSB0byB0aGUgZ2l2ZW4gb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5vZGVJZCBJZGVudGlmaWVyIG9mIHRoZSByZXF1ZXN0ZWQgbm9kZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9uKG5vZGUsIGxpbmspfSBjYWxsYmFjayBGdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYWxsIGxpbmtlZCBub2Rlcy5cbiAgICAgKiAgIFRoZSBmdW5jdGlvbiBpcyBwYXNzZWQgdHdvIHBhcmFtZXRlcnM6IGFkamFjZW50IG5vZGUgYW5kIGxpbmsgb2JqZWN0IGl0c2VsZi5cbiAgICAgKiBAcGFyYW0gb3JpZW50ZWQgaWYgdHJ1ZSBncmFwaCB0cmVhdGVkIGFzIG9yaWVudGVkLlxuICAgICAqL1xuICAgIGZvckVhY2hMaW5rZWROb2RlOiBmb3JFYWNoTGlua2VkTm9kZSxcblxuICAgIC8qKlxuICAgICAqIEVudW1lcmF0ZXMgYWxsIGxpbmtzIGluIHRoZSBncmFwaFxuICAgICAqXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbihsaW5rKX0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGFsbCBsaW5rcyBpbiB0aGUgZ3JhcGguXG4gICAgICogICBUaGUgZnVuY3Rpb24gaXMgcGFzc2VkIG9uZSBwYXJhbWV0ZXI6IGdyYXBoJ3MgbGluayBvYmplY3QuXG4gICAgICpcbiAgICAgKiBMaW5rIG9iamVjdCBjb250YWlucyBhdCBsZWFzdCB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAgICAgKiAgZnJvbUlkIC0gbm9kZSBpZCB3aGVyZSBsaW5rIHN0YXJ0cztcbiAgICAgKiAgdG9JZCAtIG5vZGUgaWQgd2hlcmUgbGluayBlbmRzLFxuICAgICAqICBkYXRhIC0gYWRkaXRpb25hbCBkYXRhIHBhc3NlZCB0byBncmFwaC5hZGRMaW5rKCkgbWV0aG9kLlxuICAgICAqL1xuICAgIGZvckVhY2hMaW5rOiBmb3JFYWNoTGluayxcblxuICAgIC8qKlxuICAgICAqIFN1c3BlbmQgYWxsIG5vdGlmaWNhdGlvbnMgYWJvdXQgZ3JhcGggY2hhbmdlcyB1bnRpbFxuICAgICAqIGVuZFVwZGF0ZSBpcyBjYWxsZWQuXG4gICAgICovXG4gICAgYmVnaW5VcGRhdGU6IGVudGVyTW9kaWZpY2F0aW9uLFxuXG4gICAgLyoqXG4gICAgICogUmVzdW1lcyBhbGwgbm90aWZpY2F0aW9ucyBhYm91dCBncmFwaCBjaGFuZ2VzIGFuZCBmaXJlc1xuICAgICAqIGdyYXBoICdjaGFuZ2VkJyBldmVudCBpbiBjYXNlIHRoZXJlIGFyZSBhbnkgcGVuZGluZyBjaGFuZ2VzLlxuICAgICAqL1xuICAgIGVuZFVwZGF0ZTogZXhpdE1vZGlmaWNhdGlvbixcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIG5vZGVzIGFuZCBsaW5rcyBmcm9tIHRoZSBncmFwaC5cbiAgICAgKi9cbiAgICBjbGVhcjogY2xlYXIsXG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3RzIHdoZXRoZXIgdGhlcmUgaXMgYSBsaW5rIGJldHdlZW4gdHdvIG5vZGVzLlxuICAgICAqIE9wZXJhdGlvbiBjb21wbGV4aXR5IGlzIE8obikgd2hlcmUgbiAtIG51bWJlciBvZiBsaW5rcyBvZiBhIG5vZGUuXG4gICAgICogTk9URTogdGhpcyBmdW5jdGlvbiBpcyBzeW5vbmltIGZvciBnZXRMaW5rKClcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGxpbmsgaWYgdGhlcmUgaXMgb25lLiBudWxsIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBoYXNMaW5rOiBnZXRMaW5rLFxuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0cyB3aGV0aGVyIHRoZXJlIGlzIGEgbm9kZSB3aXRoIGdpdmVuIGlkXG4gICAgICogXG4gICAgICogT3BlcmF0aW9uIGNvbXBsZXhpdHkgaXMgTygxKVxuICAgICAqIE5PVEU6IHRoaXMgZnVuY3Rpb24gaXMgc3lub25pbSBmb3IgZ2V0Tm9kZSgpXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBub2RlIGlmIHRoZXJlIGlzIG9uZTsgRmFsc3kgdmFsdWUgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGhhc05vZGU6IGdldE5vZGUsXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFuIGVkZ2UgYmV0d2VlbiB0d28gbm9kZXMuXG4gICAgICogT3BlcmF0aW9uIGNvbXBsZXhpdHkgaXMgTyhuKSB3aGVyZSBuIC0gbnVtYmVyIG9mIGxpbmtzIG9mIGEgbm9kZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tSWQgbGluayBzdGFydCBpZGVudGlmaWVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRvSWQgbGluayBlbmQgaWRlbnRpZmllclxuICAgICAqXG4gICAgICogQHJldHVybnMgbGluayBpZiB0aGVyZSBpcyBvbmUuIG51bGwgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGdldExpbms6IGdldExpbmtcbiAgfTtcblxuICAvLyB0aGlzIHdpbGwgYWRkIGBvbigpYCBhbmQgYGZpcmUoKWAgbWV0aG9kcy5cbiAgZXZlbnRpZnkoZ3JhcGhQYXJ0KTtcblxuICBtb25pdG9yU3Vic2NyaWJlcnMoKTtcblxuICByZXR1cm4gZ3JhcGhQYXJ0O1xuXG4gIGZ1bmN0aW9uIG1vbml0b3JTdWJzY3JpYmVycygpIHtcbiAgICB2YXIgcmVhbE9uID0gZ3JhcGhQYXJ0Lm9uO1xuXG4gICAgLy8gcmVwbGFjZSByZWFsIGBvbmAgd2l0aCBvdXIgdGVtcG9yYXJ5IG9uLCB3aGljaCB3aWxsIHRyaWdnZXIgY2hhbmdlXG4gICAgLy8gbW9kaWZpY2F0aW9uIG1vbml0b3Jpbmc6XG4gICAgZ3JhcGhQYXJ0Lm9uID0gb247XG5cbiAgICBmdW5jdGlvbiBvbigpIHtcbiAgICAgIC8vIG5vdyBpdCdzIHRpbWUgdG8gc3RhcnQgdHJhY2tpbmcgc3R1ZmY6XG4gICAgICBncmFwaFBhcnQuYmVnaW5VcGRhdGUgPSBlbnRlck1vZGlmaWNhdGlvbiA9IGVudGVyTW9kaWZpY2F0aW9uUmVhbDtcbiAgICAgIGdyYXBoUGFydC5lbmRVcGRhdGUgPSBleGl0TW9kaWZpY2F0aW9uID0gZXhpdE1vZGlmaWNhdGlvblJlYWw7XG4gICAgICByZWNvcmRMaW5rQ2hhbmdlID0gcmVjb3JkTGlua0NoYW5nZVJlYWw7XG4gICAgICByZWNvcmROb2RlQ2hhbmdlID0gcmVjb3JkTm9kZUNoYW5nZVJlYWw7XG5cbiAgICAgIC8vIHRoaXMgd2lsbCByZXBsYWNlIGN1cnJlbnQgYG9uYCBtZXRob2Qgd2l0aCByZWFsIHB1Yi9zdWIgZnJvbSBgZXZlbnRpZnlgLlxuICAgICAgZ3JhcGhQYXJ0Lm9uID0gcmVhbE9uO1xuICAgICAgLy8gZGVsZWdhdGUgdG8gcmVhbCBgb25gIGhhbmRsZXI6XG4gICAgICByZXR1cm4gcmVhbE9uLmFwcGx5KGdyYXBoUGFydCwgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWNvcmRMaW5rQ2hhbmdlUmVhbChsaW5rLCBjaGFuZ2VUeXBlKSB7XG4gICAgY2hhbmdlcy5wdXNoKHtcbiAgICAgIGxpbms6IGxpbmssXG4gICAgICBjaGFuZ2VUeXBlOiBjaGFuZ2VUeXBlXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWNvcmROb2RlQ2hhbmdlUmVhbChub2RlLCBjaGFuZ2VUeXBlKSB7XG4gICAgY2hhbmdlcy5wdXNoKHtcbiAgICAgIG5vZGU6IG5vZGUsXG4gICAgICBjaGFuZ2VUeXBlOiBjaGFuZ2VUeXBlXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGROb2RlKG5vZGVJZCwgZGF0YSkge1xuICAgIGlmIChub2RlSWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG5vZGUgaWRlbnRpZmllcicpO1xuICAgIH1cblxuICAgIGVudGVyTW9kaWZpY2F0aW9uKCk7XG5cbiAgICB2YXIgbm9kZSA9IGdldE5vZGUobm9kZUlkKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIG5vZGUgPSBuZXcgTm9kZShub2RlSWQsIGRhdGEpO1xuICAgICAgbm9kZXNDb3VudCsrO1xuICAgICAgcmVjb3JkTm9kZUNoYW5nZShub2RlLCAnYWRkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUuZGF0YSA9IGRhdGE7XG4gICAgICByZWNvcmROb2RlQ2hhbmdlKG5vZGUsICd1cGRhdGUnKTtcbiAgICB9XG5cbiAgICBub2Rlc1tub2RlSWRdID0gbm9kZTtcblxuICAgIGV4aXRNb2RpZmljYXRpb24oKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE5vZGUobm9kZUlkKSB7XG4gICAgcmV0dXJuIG5vZGVzW25vZGVJZF07XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGVJZCkge1xuICAgIHZhciBub2RlID0gZ2V0Tm9kZShub2RlSWQpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGVudGVyTW9kaWZpY2F0aW9uKCk7XG5cbiAgICB2YXIgcHJldkxpbmtzID0gbm9kZS5saW5rcztcbiAgICBpZiAocHJldkxpbmtzKSB7XG4gICAgICBub2RlLmxpbmtzID0gbnVsbDtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwcmV2TGlua3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcmVtb3ZlTGluayhwcmV2TGlua3NbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRlbGV0ZSBub2Rlc1tub2RlSWRdO1xuICAgIG5vZGVzQ291bnQtLTtcblxuICAgIHJlY29yZE5vZGVDaGFuZ2Uobm9kZSwgJ3JlbW92ZScpO1xuXG4gICAgZXhpdE1vZGlmaWNhdGlvbigpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGFkZExpbmsoZnJvbUlkLCB0b0lkLCBkYXRhKSB7XG4gICAgZW50ZXJNb2RpZmljYXRpb24oKTtcblxuICAgIHZhciBmcm9tTm9kZSA9IGdldE5vZGUoZnJvbUlkKSB8fCBhZGROb2RlKGZyb21JZCk7XG4gICAgdmFyIHRvTm9kZSA9IGdldE5vZGUodG9JZCkgfHwgYWRkTm9kZSh0b0lkKTtcblxuICAgIHZhciBsaW5rID0gY3JlYXRlTGluayhmcm9tSWQsIHRvSWQsIGRhdGEpO1xuXG4gICAgbGlua3MucHVzaChsaW5rKTtcblxuICAgIC8vIFRPRE86IHRoaXMgaXMgbm90IGNvb2wuIE9uIGxhcmdlIGdyYXBocyBwb3RlbnRpYWxseSB3b3VsZCBjb25zdW1lIG1vcmUgbWVtb3J5LlxuICAgIGFkZExpbmtUb05vZGUoZnJvbU5vZGUsIGxpbmspO1xuICAgIGlmIChmcm9tSWQgIT09IHRvSWQpIHtcbiAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmUgbm90IGR1cGxpY2F0aW5nIGxpbmtzIGZvciBzZWxmLWxvb3BzXG4gICAgICBhZGRMaW5rVG9Ob2RlKHRvTm9kZSwgbGluayk7XG4gICAgfVxuXG4gICAgcmVjb3JkTGlua0NoYW5nZShsaW5rLCAnYWRkJyk7XG5cbiAgICBleGl0TW9kaWZpY2F0aW9uKCk7XG5cbiAgICByZXR1cm4gbGluaztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNpbmdsZUxpbmsoZnJvbUlkLCB0b0lkLCBkYXRhKSB7XG4gICAgdmFyIGxpbmtJZCA9IG1ha2VMaW5rSWQoZnJvbUlkLCB0b0lkKTtcbiAgICByZXR1cm4gbmV3IExpbmsoZnJvbUlkLCB0b0lkLCBkYXRhLCBsaW5rSWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVW5pcXVlTGluayhmcm9tSWQsIHRvSWQsIGRhdGEpIHtcbiAgICAvLyBUT0RPOiBHZXQgcmlkIG9mIHRoaXMgbWV0aG9kLlxuICAgIHZhciBsaW5rSWQgPSBtYWtlTGlua0lkKGZyb21JZCwgdG9JZCk7XG4gICAgdmFyIGlzTXVsdGlFZGdlID0gbXVsdGlFZGdlcy5oYXNPd25Qcm9wZXJ0eShsaW5rSWQpO1xuICAgIGlmIChpc011bHRpRWRnZSB8fCBnZXRMaW5rKGZyb21JZCwgdG9JZCkpIHtcbiAgICAgIGlmICghaXNNdWx0aUVkZ2UpIHtcbiAgICAgICAgbXVsdGlFZGdlc1tsaW5rSWRdID0gMDtcbiAgICAgIH1cbiAgICAgIHZhciBzdWZmaXggPSAnQCcgKyAoKyttdWx0aUVkZ2VzW2xpbmtJZF0pO1xuICAgICAgbGlua0lkID0gbWFrZUxpbmtJZChmcm9tSWQgKyBzdWZmaXgsIHRvSWQgKyBzdWZmaXgpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTGluayhmcm9tSWQsIHRvSWQsIGRhdGEsIGxpbmtJZCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRMaW5rcyhub2RlSWQpIHtcbiAgICB2YXIgbm9kZSA9IGdldE5vZGUobm9kZUlkKTtcbiAgICByZXR1cm4gbm9kZSA/IG5vZGUubGlua3MgOiBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlTGluayhsaW5rKSB7XG4gICAgaWYgKCFsaW5rKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBpZHggPSBpbmRleE9mRWxlbWVudEluQXJyYXkobGluaywgbGlua3MpO1xuICAgIGlmIChpZHggPCAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZW50ZXJNb2RpZmljYXRpb24oKTtcblxuICAgIGxpbmtzLnNwbGljZShpZHgsIDEpO1xuXG4gICAgdmFyIGZyb21Ob2RlID0gZ2V0Tm9kZShsaW5rLmZyb21JZCk7XG4gICAgdmFyIHRvTm9kZSA9IGdldE5vZGUobGluay50b0lkKTtcblxuICAgIGlmIChmcm9tTm9kZSkge1xuICAgICAgaWR4ID0gaW5kZXhPZkVsZW1lbnRJbkFycmF5KGxpbmssIGZyb21Ob2RlLmxpbmtzKTtcbiAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICBmcm9tTm9kZS5saW5rcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodG9Ob2RlKSB7XG4gICAgICBpZHggPSBpbmRleE9mRWxlbWVudEluQXJyYXkobGluaywgdG9Ob2RlLmxpbmtzKTtcbiAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICB0b05vZGUubGlua3Muc3BsaWNlKGlkeCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVjb3JkTGlua0NoYW5nZShsaW5rLCAncmVtb3ZlJyk7XG5cbiAgICBleGl0TW9kaWZpY2F0aW9uKCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExpbmsoZnJvbU5vZGVJZCwgdG9Ob2RlSWQpIHtcbiAgICAvLyBUT0RPOiBVc2Ugc29ydGVkIGxpbmtzIHRvIHNwZWVkIHRoaXMgdXBcbiAgICB2YXIgbm9kZSA9IGdldE5vZGUoZnJvbU5vZGVJZCksXG4gICAgICBpO1xuICAgIGlmICghbm9kZSB8fCAhbm9kZS5saW5rcykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IG5vZGUubGlua3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBsaW5rID0gbm9kZS5saW5rc1tpXTtcbiAgICAgIGlmIChsaW5rLmZyb21JZCA9PT0gZnJvbU5vZGVJZCAmJiBsaW5rLnRvSWQgPT09IHRvTm9kZUlkKSB7XG4gICAgICAgIHJldHVybiBsaW5rO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsOyAvLyBubyBsaW5rLlxuICB9XG5cbiAgZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgZW50ZXJNb2RpZmljYXRpb24oKTtcbiAgICBmb3JFYWNoTm9kZShmdW5jdGlvbihub2RlKSB7XG4gICAgICByZW1vdmVOb2RlKG5vZGUuaWQpO1xuICAgIH0pO1xuICAgIGV4aXRNb2RpZmljYXRpb24oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvckVhY2hMaW5rKGNhbGxiYWNrKSB7XG4gICAgdmFyIGksIGxlbmd0aDtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBsaW5rcy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgICBjYWxsYmFjayhsaW5rc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZm9yRWFjaExpbmtlZE5vZGUobm9kZUlkLCBjYWxsYmFjaywgb3JpZW50ZWQpIHtcbiAgICB2YXIgbm9kZSA9IGdldE5vZGUobm9kZUlkKTtcblxuICAgIGlmIChub2RlICYmIG5vZGUubGlua3MgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAob3JpZW50ZWQpIHtcbiAgICAgICAgcmV0dXJuIGZvckVhY2hPcmllbnRlZExpbmsobm9kZS5saW5rcywgbm9kZUlkLCBjYWxsYmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZm9yRWFjaE5vbk9yaWVudGVkTGluayhub2RlLmxpbmtzLCBub2RlSWQsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmb3JFYWNoTm9uT3JpZW50ZWRMaW5rKGxpbmtzLCBub2RlSWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1aXRGYXN0O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlua3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBsaW5rID0gbGlua3NbaV07XG4gICAgICB2YXIgbGlua2VkTm9kZUlkID0gbGluay5mcm9tSWQgPT09IG5vZGVJZCA/IGxpbmsudG9JZCA6IGxpbmsuZnJvbUlkO1xuXG4gICAgICBxdWl0RmFzdCA9IGNhbGxiYWNrKG5vZGVzW2xpbmtlZE5vZGVJZF0sIGxpbmspO1xuICAgICAgaWYgKHF1aXRGYXN0KSB7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBDbGllbnQgZG9lcyBub3QgbmVlZCBtb3JlIGl0ZXJhdGlvbnMuIEJyZWFrIG5vdy5cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmb3JFYWNoT3JpZW50ZWRMaW5rKGxpbmtzLCBub2RlSWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1aXRGYXN0O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlua3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBsaW5rID0gbGlua3NbaV07XG4gICAgICBpZiAobGluay5mcm9tSWQgPT09IG5vZGVJZCkge1xuICAgICAgICBxdWl0RmFzdCA9IGNhbGxiYWNrKG5vZGVzW2xpbmsudG9JZF0sIGxpbmspO1xuICAgICAgICBpZiAocXVpdEZhc3QpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gQ2xpZW50IGRvZXMgbm90IG5lZWQgbW9yZSBpdGVyYXRpb25zLiBCcmVhayBub3cuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyB3ZSB3aWxsIG5vdCBmaXJlIGFueXRoaW5nIHVudGlsIHVzZXJzIG9mIHRoaXMgbGlicmFyeSBleHBsaWNpdGx5IGNhbGwgYG9uKClgXG4gIC8vIG1ldGhvZC5cbiAgZnVuY3Rpb24gbm9vcCgpIHt9XG5cbiAgLy8gRW50ZXIsIEV4aXQgbW9kaWZpY2F0aW9uIGFsbG93cyBidWxrIGdyYXBoIHVwZGF0ZXMgd2l0aG91dCBmaXJpbmcgZXZlbnRzLlxuICBmdW5jdGlvbiBlbnRlck1vZGlmaWNhdGlvblJlYWwoKSB7XG4gICAgc3VzcGVuZEV2ZW50cyArPSAxO1xuICB9XG5cbiAgZnVuY3Rpb24gZXhpdE1vZGlmaWNhdGlvblJlYWwoKSB7XG4gICAgc3VzcGVuZEV2ZW50cyAtPSAxO1xuICAgIGlmIChzdXNwZW5kRXZlbnRzID09PSAwICYmIGNoYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgZ3JhcGhQYXJ0LmZpcmUoJ2NoYW5nZWQnLCBjaGFuZ2VzKTtcbiAgICAgIGNoYW5nZXMubGVuZ3RoID0gMDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVOb2RlSXRlcmF0b3IoKSB7XG4gICAgLy8gT2JqZWN0LmtleXMgaXRlcmF0b3IgaXMgMS4zeCBmYXN0ZXIgdGhhbiBgZm9yIGluYCBsb29wLlxuICAgIC8vIFNlZSBgaHR0cHM6Ly9naXRodWIuY29tL2FudmFrYS9uZ3JhcGguZ3JhcGgvdHJlZS9iZW5jaC1mb3ItaW4tdnMtb2JqLWtleXNgXG4gICAgLy8gYnJhbmNoIGZvciBwZXJmIHRlc3RcbiAgICByZXR1cm4gT2JqZWN0LmtleXMgPyBvYmplY3RLZXlzSXRlcmF0b3IgOiBmb3JJbkl0ZXJhdG9yO1xuICB9XG5cbiAgZnVuY3Rpb24gb2JqZWN0S2V5c0l0ZXJhdG9yKGNhbGxiYWNrKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobm9kZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGNhbGxiYWNrKG5vZGVzW2tleXNbaV1dKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gY2xpZW50IGRvZXNuJ3Qgd2FudCB0byBwcm9jZWVkLiBSZXR1cm4uXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZm9ySW5JdGVyYXRvcihjYWxsYmFjaykge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG5vZGU7XG5cbiAgICBmb3IgKG5vZGUgaW4gbm9kZXMpIHtcbiAgICAgIGlmIChjYWxsYmFjayhub2Rlc1tub2RlXSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIGNsaWVudCBkb2Vzbid0IHdhbnQgdG8gcHJvY2VlZC4gUmV0dXJuLlxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBuZWVkIHRoaXMgZm9yIG9sZCBicm93c2Vycy4gU2hvdWxkIHRoaXMgYmUgYSBzZXBhcmF0ZSBtb2R1bGU/XG5mdW5jdGlvbiBpbmRleE9mRWxlbWVudEluQXJyYXkoZWxlbWVudCwgYXJyYXkpIHtcbiAgaWYgKCFhcnJheSkgcmV0dXJuIC0xO1xuXG4gIGlmIChhcnJheS5pbmRleE9mKSB7XG4gICAgcmV0dXJuIGFycmF5LmluZGV4T2YoZWxlbWVudCk7XG4gIH1cblxuICB2YXIgbGVuID0gYXJyYXkubGVuZ3RoLFxuICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSBlbGVtZW50KSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogSW50ZXJuYWwgc3RydWN0dXJlIHRvIHJlcHJlc2VudCBub2RlO1xuICovXG5mdW5jdGlvbiBOb2RlKGlkLCBkYXRhKSB7XG4gIHRoaXMuaWQgPSBpZDtcbiAgdGhpcy5saW5rcyA9IG51bGw7XG4gIHRoaXMuZGF0YSA9IGRhdGE7XG59XG5cbmZ1bmN0aW9uIGFkZExpbmtUb05vZGUobm9kZSwgbGluaykge1xuICBpZiAobm9kZS5saW5rcykge1xuICAgIG5vZGUubGlua3MucHVzaChsaW5rKTtcbiAgfSBlbHNlIHtcbiAgICBub2RlLmxpbmtzID0gW2xpbmtdO1xuICB9XG59XG5cbi8qKlxuICogSW50ZXJuYWwgc3RydWN0dXJlIHRvIHJlcHJlc2VudCBsaW5rcztcbiAqL1xuZnVuY3Rpb24gTGluayhmcm9tSWQsIHRvSWQsIGRhdGEsIGlkKSB7XG4gIHRoaXMuZnJvbUlkID0gZnJvbUlkO1xuICB0aGlzLnRvSWQgPSB0b0lkO1xuICB0aGlzLmRhdGEgPSBkYXRhO1xuICB0aGlzLmlkID0gaWQ7XG59XG5cbmZ1bmN0aW9uIGhhc2hDb2RlKHN0cikge1xuICB2YXIgaGFzaCA9IDAsIGksIGNociwgbGVuO1xuICBpZiAoc3RyLmxlbmd0aCA9PSAwKSByZXR1cm4gaGFzaDtcbiAgZm9yIChpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY2hyICAgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoICA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgY2hyO1xuICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gIH1cbiAgcmV0dXJuIGhhc2g7XG59XG5cbmZ1bmN0aW9uIG1ha2VMaW5rSWQoZnJvbUlkLCB0b0lkKSB7XG4gIHJldHVybiBmcm9tSWQudG9TdHJpbmcoKSArICfwn5GJICcgKyB0b0lkLnRvU3RyaW5nKCk7XG59XG4iLCIvKipcbiAqIEJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3VybmVyL3RpbnlxdWV1ZVxuICogQ29weXJpZ2h0IChjKSAyMDE3LCBWbGFkaW1pciBBZ2Fmb25raW4gaHR0cHM6Ly9naXRodWIuY29tL21vdXJuZXIvdGlueXF1ZXVlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqIFxuICogQWRhcHRlZCBmb3IgUGF0aEZpbmRpbmcgbmVlZHMgYnkgQGFudmFrYVxuICogQ29weXJpZ2h0IChjKSAyMDE3LCBBbmRyZWkgS2FzaGNoYVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IE5vZGVIZWFwO1xuXG5mdW5jdGlvbiBOb2RlSGVhcChkYXRhLCBvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBOb2RlSGVhcCkpIHJldHVybiBuZXcgTm9kZUhlYXAoZGF0YSwgb3B0aW9ucyk7XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgLy8gYXNzdW1lIGZpcnN0IGFyZ3VtZW50IGlzIG91ciBjb25maWcgb2JqZWN0O1xuICAgIG9wdGlvbnMgPSBkYXRhO1xuICAgIGRhdGEgPSBbXTtcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRoaXMuZGF0YSA9IGRhdGEgfHwgW107XG4gIHRoaXMubGVuZ3RoID0gdGhpcy5kYXRhLmxlbmd0aDtcbiAgdGhpcy5jb21wYXJlID0gb3B0aW9ucy5jb21wYXJlIHx8IGRlZmF1bHRDb21wYXJlO1xuICB0aGlzLnNldE5vZGVJZCA9IG9wdGlvbnMuc2V0Tm9kZUlkIHx8IG5vb3A7XG5cbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIGZvciAodmFyIGkgPSAodGhpcy5sZW5ndGggPj4gMSk7IGkgPj0gMDsgaS0tKSB0aGlzLl9kb3duKGkpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuc2V0Tm9kZUlkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLnNldE5vZGVJZCh0aGlzLmRhdGFbaV0sIGkpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gZGVmYXVsdENvbXBhcmUoYSwgYikge1xuICByZXR1cm4gYSAtIGI7XG59XG5cbk5vZGVIZWFwLnByb3RvdHlwZSA9IHtcblxuICBwdXNoOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgIHRoaXMuZGF0YS5wdXNoKGl0ZW0pO1xuICAgIHRoaXMuc2V0Tm9kZUlkKGl0ZW0sIHRoaXMubGVuZ3RoKTtcbiAgICB0aGlzLmxlbmd0aCsrO1xuICAgIHRoaXMuX3VwKHRoaXMubGVuZ3RoIC0gMSk7XG4gIH0sXG5cbiAgcG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgdmFyIHRvcCA9IHRoaXMuZGF0YVswXTtcbiAgICB0aGlzLmxlbmd0aC0tO1xuXG4gICAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5kYXRhWzBdID0gdGhpcy5kYXRhW3RoaXMubGVuZ3RoXTtcbiAgICAgIHRoaXMuc2V0Tm9kZUlkKHRoaXMuZGF0YVswXSwgMCk7XG4gICAgICB0aGlzLl9kb3duKDApO1xuICAgIH1cbiAgICB0aGlzLmRhdGEucG9wKCk7XG5cbiAgICByZXR1cm4gdG9wO1xuICB9LFxuXG4gIHBlZWs6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhWzBdO1xuICB9LFxuXG4gIHVwZGF0ZUl0ZW06IGZ1bmN0aW9uIChwb3MpIHtcbiAgICB0aGlzLl9kb3duKHBvcyk7XG4gICAgdGhpcy5fdXAocG9zKTtcbiAgfSxcblxuICBfdXA6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgY29tcGFyZSA9IHRoaXMuY29tcGFyZTtcbiAgICB2YXIgc2V0Tm9kZUlkID0gdGhpcy5zZXROb2RlSWQ7XG4gICAgdmFyIGl0ZW0gPSBkYXRhW3Bvc107XG5cbiAgICB3aGlsZSAocG9zID4gMCkge1xuICAgICAgdmFyIHBhcmVudCA9IChwb3MgLSAxKSA+PiAxO1xuICAgICAgdmFyIGN1cnJlbnQgPSBkYXRhW3BhcmVudF07XG4gICAgICBpZiAoY29tcGFyZShpdGVtLCBjdXJyZW50KSA+PSAwKSBicmVhaztcbiAgICAgICAgZGF0YVtwb3NdID0gY3VycmVudDtcblxuICAgICAgIHNldE5vZGVJZChjdXJyZW50LCBwb3MpO1xuICAgICAgIHBvcyA9IHBhcmVudDtcbiAgICB9XG5cbiAgICBkYXRhW3Bvc10gPSBpdGVtO1xuICAgIHNldE5vZGVJZChpdGVtLCBwb3MpO1xuICB9LFxuXG4gIF9kb3duOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGNvbXBhcmUgPSB0aGlzLmNvbXBhcmU7XG4gICAgdmFyIGhhbGZMZW5ndGggPSB0aGlzLmxlbmd0aCA+PiAxO1xuICAgIHZhciBpdGVtID0gZGF0YVtwb3NdO1xuICAgIHZhciBzZXROb2RlSWQgPSB0aGlzLnNldE5vZGVJZDtcblxuICAgIHdoaWxlIChwb3MgPCBoYWxmTGVuZ3RoKSB7XG4gICAgICB2YXIgbGVmdCA9IChwb3MgPDwgMSkgKyAxO1xuICAgICAgdmFyIHJpZ2h0ID0gbGVmdCArIDE7XG4gICAgICB2YXIgYmVzdCA9IGRhdGFbbGVmdF07XG5cbiAgICAgIGlmIChyaWdodCA8IHRoaXMubGVuZ3RoICYmIGNvbXBhcmUoZGF0YVtyaWdodF0sIGJlc3QpIDwgMCkge1xuICAgICAgICBsZWZ0ID0gcmlnaHQ7XG4gICAgICAgIGJlc3QgPSBkYXRhW3JpZ2h0XTtcbiAgICAgIH1cbiAgICAgIGlmIChjb21wYXJlKGJlc3QsIGl0ZW0pID49IDApIGJyZWFrO1xuXG4gICAgICBkYXRhW3Bvc10gPSBiZXN0O1xuICAgICAgc2V0Tm9kZUlkKGJlc3QsIHBvcyk7XG4gICAgICBwb3MgPSBsZWZ0O1xuICAgIH1cblxuICAgIGRhdGFbcG9zXSA9IGl0ZW07XG4gICAgc2V0Tm9kZUlkKGl0ZW0sIHBvcyk7XG4gIH1cbn07IiwiLyoqXG4gKiBQZXJmb3JtcyBzdWJvcHRpbWFsLCBncmVlZCBBIFN0YXIgcGF0aCBmaW5kaW5nLlxuICogVGhpcyBmaW5kZXIgZG9lcyBub3QgbmVjZXNzYXJ5IGZpbmRzIHRoZSBzaG9ydGVzdCBwYXRoLiBUaGUgcGF0aFxuICogdGhhdCBpdCBmaW5kcyBpcyB2ZXJ5IGNsb3NlIHRvIHRoZSBzaG9ydGVzdCBvbmUuIEl0IGlzIHZlcnkgZmFzdCB0aG91Z2guXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYVN0YXJCaTtcblxudmFyIE5vZGVIZWFwID0gcmVxdWlyZSgnLi9Ob2RlSGVhcCcpO1xudmFyIG1ha2VTZWFyY2hTdGF0ZVBvb2wgPSByZXF1aXJlKCcuL21ha2VTZWFyY2hTdGF0ZVBvb2wnKTtcbnZhciBoZXVyaXN0aWNzID0gcmVxdWlyZSgnLi9oZXVyaXN0aWNzJyk7XG52YXIgZGVmYXVsdFNldHRpbmdzID0gcmVxdWlyZSgnLi9kZWZhdWx0U2V0dGluZ3MnKTtcblxudmFyIEJZX0ZST00gPSAxO1xudmFyIEJZX1RPID0gMjtcbnZhciBOT19QQVRIID0gZGVmYXVsdFNldHRpbmdzLk5PX1BBVEg7XG5cbm1vZHVsZS5leHBvcnRzLmwyID0gaGV1cmlzdGljcy5sMjtcbm1vZHVsZS5leHBvcnRzLmwxID0gaGV1cmlzdGljcy5sMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHBhdGhmaW5kZXIuIEEgcGF0aGZpbmRlciBoYXMganVzdCBvbmUgbWV0aG9kOlxuICogYGZpbmQoZnJvbUlkLCB0b0lkKWAsIGl0IG1heSBiZSBleHRlbmRlZCBpbiBmdXR1cmUuXG4gKiBcbiAqIE5PVEU6IEFsZ29yaXRobSBpbXBsZW1lbnRlZCBpbiB0aGlzIGNvZGUgRE9FUyBOT1QgZmluZCBvcHRpbWFsIHBhdGguXG4gKiBZZXQgdGhlIHBhdGggdGhhdCBpdCBmaW5kcyBpcyBhbHdheXMgbmVhciBvcHRpbWFsLCBhbmQgaXQgZmluZHMgaXQgdmVyeSBmYXN0LlxuICogXG4gKiBAcGFyYW0ge25ncmFwaC5ncmFwaH0gZ3JhcGggaW5zdGFuY2UuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW52YWthL25ncmFwaC5ncmFwaFxuICogXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyB0aGF0IGNvbmZpZ3VyZXMgc2VhcmNoXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKGEsIGIpfSBvcHRpb25zLmhldXJpc3RpYyAtIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGVzdGltYXRlZCBkaXN0YW5jZSBiZXR3ZWVuXG4gKiBub2RlcyBgYWAgYW5kIGBiYC4gIERlZmF1bHRzIGZ1bmN0aW9uIHJldHVybnMgMCwgd2hpY2ggbWFrZXMgdGhpcyBzZWFyY2ggZXF1aXZhbGVudCB0byBEaWprc3RyYSBzZWFyY2guXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKGEsIGIpfSBvcHRpb25zLmRpc3RhbmNlIC0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYWN0dWFsIGRpc3RhbmNlIGJldHdlZW4gdHdvXG4gKiBub2RlcyBgYWAgYW5kIGBiYC4gQnkgZGVmYXVsdCB0aGlzIGlzIHNldCB0byByZXR1cm4gZ3JhcGgtdGhlb3JldGljYWwgZGlzdGFuY2UgKGFsd2F5cyAxKTtcbiAqIFxuICogQHJldHVybnMge09iamVjdH0gQSBwYXRoZmluZGVyIHdpdGggc2luZ2xlIG1ldGhvZCBgZmluZCgpYC5cbiAqL1xuZnVuY3Rpb24gYVN0YXJCaShncmFwaCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgLy8gd2hldGhlciB0cmF2ZXJzYWwgc2hvdWxkIGJlIGNvbnNpZGVyZWQgb3ZlciBvcmllbnRlZCBncmFwaC5cbiAgdmFyIG9yaWVudGVkID0gb3B0aW9ucy5vcmllbnRlZDtcblxuICB2YXIgaGV1cmlzdGljID0gb3B0aW9ucy5oZXVyaXN0aWM7XG4gIGlmICghaGV1cmlzdGljKSBoZXVyaXN0aWMgPSBkZWZhdWx0U2V0dGluZ3MuaGV1cmlzdGljO1xuXG4gIHZhciBkaXN0YW5jZSA9IG9wdGlvbnMuZGlzdGFuY2U7XG4gIGlmICghZGlzdGFuY2UpIGRpc3RhbmNlID0gZGVmYXVsdFNldHRpbmdzLmRpc3RhbmNlO1xuICB2YXIgcG9vbCA9IG1ha2VTZWFyY2hTdGF0ZVBvb2woKTtcblxuICByZXR1cm4ge1xuICAgIGZpbmQ6IGZpbmRcbiAgfTtcblxuICBmdW5jdGlvbiBmaW5kKGZyb21JZCwgdG9JZCkge1xuICAgIC8vIE5vdCBzdXJlIGlmIHdlIHNob3VsZCByZXR1cm4gTk9fUEFUSCBvciB0aHJvdy4gVGhyb3cgc2VlbSB0byBiZSBtb3JlXG4gICAgLy8gaGVscGZ1bCB0byBkZWJ1ZyBlcnJvcnMuIFNvLCB0aHJvd2luZy5cbiAgICB2YXIgZnJvbSA9IGdyYXBoLmdldE5vZGUoZnJvbUlkKTtcbiAgICBpZiAoIWZyb20pIHRocm93IG5ldyBFcnJvcignZnJvbUlkIGlzIG5vdCBkZWZpbmVkIGluIHRoaXMgZ3JhcGg6ICcgKyBmcm9tSWQpO1xuICAgIHZhciB0byA9IGdyYXBoLmdldE5vZGUodG9JZCk7XG4gICAgaWYgKCF0bykgdGhyb3cgbmV3IEVycm9yKCd0b0lkIGlzIG5vdCBkZWZpbmVkIGluIHRoaXMgZ3JhcGg6ICcgKyB0b0lkKTtcblxuICAgIGlmIChmcm9tID09PSB0bykgcmV0dXJuIFtmcm9tXTsgLy8gdHJpdmlhbCBjYXNlLlxuXG4gICAgcG9vbC5yZXNldCgpO1xuXG4gICAgdmFyIGNhbGxWaXNpdG9yID0gb3JpZW50ZWQgPyBvcmllbnRlZFZpc2l0b3IgOiBub25PcmllbnRlZFZpc2l0b3I7XG5cbiAgICAvLyBNYXBzIG5vZGVJZCB0byBOb2RlU2VhcmNoU3RhdGUuXG4gICAgdmFyIG5vZGVTdGF0ZSA9IG5ldyBNYXAoKTtcblxuICAgIHZhciBvcGVuU2V0RnJvbSA9IG5ldyBOb2RlSGVhcCh7XG4gICAgICBjb21wYXJlOiBkZWZhdWx0U2V0dGluZ3MuY29tcGFyZUZTY29yZSxcbiAgICAgIHNldE5vZGVJZDogZGVmYXVsdFNldHRpbmdzLnNldEhlYXBJbmRleFxuICAgIH0pO1xuXG4gICAgdmFyIG9wZW5TZXRUbyA9IG5ldyBOb2RlSGVhcCh7XG4gICAgICBjb21wYXJlOiBkZWZhdWx0U2V0dGluZ3MuY29tcGFyZUZTY29yZSxcbiAgICAgIHNldE5vZGVJZDogZGVmYXVsdFNldHRpbmdzLnNldEhlYXBJbmRleFxuICAgIH0pO1xuXG5cbiAgICB2YXIgc3RhcnROb2RlID0gcG9vbC5jcmVhdGVOZXdTdGF0ZShmcm9tKTtcbiAgICBub2RlU3RhdGUuc2V0KGZyb21JZCwgc3RhcnROb2RlKTtcblxuICAgIC8vIEZvciB0aGUgZmlyc3Qgbm9kZSwgZlNjb3JlIGlzIGNvbXBsZXRlbHkgaGV1cmlzdGljLlxuICAgIHN0YXJ0Tm9kZS5mU2NvcmUgPSBoZXVyaXN0aWMoZnJvbSwgdG8pO1xuICAgIC8vIFRoZSBjb3N0IG9mIGdvaW5nIGZyb20gc3RhcnQgdG8gc3RhcnQgaXMgemVyby5cbiAgICBzdGFydE5vZGUuZGlzdGFuY2VUb1NvdXJjZSA9IDA7XG4gICAgb3BlblNldEZyb20ucHVzaChzdGFydE5vZGUpO1xuICAgIHN0YXJ0Tm9kZS5vcGVuID0gQllfRlJPTTtcblxuICAgIHZhciBlbmROb2RlID0gcG9vbC5jcmVhdGVOZXdTdGF0ZSh0byk7XG4gICAgZW5kTm9kZS5mU2NvcmUgPSBoZXVyaXN0aWModG8sIGZyb20pO1xuICAgIGVuZE5vZGUuZGlzdGFuY2VUb1NvdXJjZSA9IDA7XG4gICAgb3BlblNldFRvLnB1c2goZW5kTm9kZSk7XG4gICAgZW5kTm9kZS5vcGVuID0gQllfVE87XG5cbiAgICAvLyBDb3N0IG9mIHRoZSBiZXN0IHNvbHV0aW9uIGZvdW5kIHNvIGZhci4gVXNlZCBmb3IgYWNjdXJhdGUgdGVybWluYXRpb25cbiAgICB2YXIgbE1pbiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICB2YXIgbWluRnJvbTtcbiAgICB2YXIgbWluVG87XG5cbiAgICB2YXIgY3VycmVudFNldCA9IG9wZW5TZXRGcm9tO1xuICAgIHZhciBjdXJyZW50T3BlbmVyID0gQllfRlJPTTtcblxuICAgIHdoaWxlIChvcGVuU2V0RnJvbS5sZW5ndGggPiAwICYmIG9wZW5TZXRUby5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAob3BlblNldEZyb20ubGVuZ3RoIDwgb3BlblNldFRvLmxlbmd0aCkge1xuICAgICAgICAvLyB3ZSBwaWNrIGEgc2V0IHdpdGggbGVzcyBlbGVtZW50c1xuICAgICAgICBjdXJyZW50T3BlbmVyID0gQllfRlJPTTtcbiAgICAgICAgY3VycmVudFNldCA9IG9wZW5TZXRGcm9tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudE9wZW5lciA9IEJZX1RPO1xuICAgICAgICBjdXJyZW50U2V0ID0gb3BlblNldFRvO1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudCA9IGN1cnJlbnRTZXQucG9wKCk7XG5cbiAgICAgIC8vIG5vIG5lZWQgdG8gdmlzaXQgdGhpcyBub2RlIGFueW1vcmVcbiAgICAgIGN1cnJlbnQuY2xvc2VkID0gdHJ1ZTtcblxuICAgICAgaWYgKGN1cnJlbnQuZGlzdGFuY2VUb1NvdXJjZSA+IGxNaW4pIGNvbnRpbnVlO1xuXG4gICAgICBncmFwaC5mb3JFYWNoTGlua2VkTm9kZShjdXJyZW50Lm5vZGUuaWQsIGNhbGxWaXNpdG9yKTtcblxuICAgICAgaWYgKG1pbkZyb20gJiYgbWluVG8pIHtcbiAgICAgICAgLy8gVGhpcyBpcyBub3QgbmVjZXNzYXJ5IHRoZSBiZXN0IHBhdGgsIGJ1dCB3ZSBhcmUgc28gZ3JlZWR5IHRoYXQgd2VcbiAgICAgICAgLy8gY2FuJ3QgcmVzaXN0OlxuICAgICAgICByZXR1cm4gcmVjb25zdHJ1Y3RCaURpcmVjdGlvbmFsUGF0aChtaW5Gcm9tLCBtaW5Ubyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE5PX1BBVEg7IC8vIE5vIHBhdGguXG5cbiAgICBmdW5jdGlvbiBub25PcmllbnRlZFZpc2l0b3Iob3RoZXJOb2RlLCBsaW5rKSB7XG4gICAgICByZXR1cm4gdmlzaXROb2RlKG90aGVyTm9kZSwgbGluaywgY3VycmVudCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb3JpZW50ZWRWaXNpdG9yKG90aGVyTm9kZSwgbGluaykge1xuICAgICAgLy8gRm9yIG9yaXRuZWQgZ3JhcGhzIHdlIG5lZWQgdG8gcmV2ZXJzZSBncmFwaCwgd2hlbiB0cmF2ZWxpbmdcbiAgICAgIC8vIGJhY2t3YXJkcy4gU28sIHdlIHVzZSBub24tb3JpZW50ZWQgbmdyYXBoJ3MgdHJhdmVyc2FsLCBhbmQgXG4gICAgICAvLyBmaWx0ZXIgbGluayBvcmllbnRhdGlvbiBoZXJlLlxuICAgICAgaWYgKGN1cnJlbnRPcGVuZXIgPT09IEJZX0ZST00pIHtcbiAgICAgICAgaWYgKGxpbmsuZnJvbUlkID09PSBjdXJyZW50Lm5vZGUuaWQpIHJldHVybiB2aXNpdE5vZGUob3RoZXJOb2RlLCBsaW5rLCBjdXJyZW50KVxuICAgICAgfSBlbHNlIGlmIChjdXJyZW50T3BlbmVyID09PSBCWV9UTykge1xuICAgICAgICBpZiAobGluay50b0lkID09PSBjdXJyZW50Lm5vZGUuaWQpIHJldHVybiB2aXNpdE5vZGUob3RoZXJOb2RlLCBsaW5rLCBjdXJyZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5FeGl0KGN1cnJlbnROb2RlKSB7XG4gICAgICB2YXIgb3BlbmVyID0gY3VycmVudE5vZGUub3BlblxuICAgICAgaWYgKG9wZW5lciAmJiBvcGVuZXIgIT09IGN1cnJlbnRPcGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWNvbnN0cnVjdEJpRGlyZWN0aW9uYWxQYXRoKGEsIGIpIHtcbiAgICAgIHZhciBwYXRoT2ZOb2RlcyA9IFtdO1xuICAgICAgdmFyIGFQYXJlbnQgPSBhO1xuICAgICAgd2hpbGUoYVBhcmVudCkge1xuICAgICAgICBwYXRoT2ZOb2Rlcy5wdXNoKGFQYXJlbnQubm9kZSk7XG4gICAgICAgIGFQYXJlbnQgPSBhUGFyZW50LnBhcmVudDtcbiAgICAgIH1cbiAgICAgIHZhciBiUGFyZW50ID0gYjtcbiAgICAgIHdoaWxlIChiUGFyZW50KSB7XG4gICAgICAgIHBhdGhPZk5vZGVzLnVuc2hpZnQoYlBhcmVudC5ub2RlKTtcbiAgICAgICAgYlBhcmVudCA9IGJQYXJlbnQucGFyZW50XG4gICAgICB9XG4gICAgICByZXR1cm4gcGF0aE9mTm9kZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmlzaXROb2RlKG90aGVyTm9kZSwgbGluaywgY2FtZUZyb20pIHtcbiAgICAgIHZhciBvdGhlclNlYXJjaFN0YXRlID0gbm9kZVN0YXRlLmdldChvdGhlck5vZGUuaWQpO1xuICAgICAgaWYgKCFvdGhlclNlYXJjaFN0YXRlKSB7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUgPSBwb29sLmNyZWF0ZU5ld1N0YXRlKG90aGVyTm9kZSk7XG4gICAgICAgIG5vZGVTdGF0ZS5zZXQob3RoZXJOb2RlLmlkLCBvdGhlclNlYXJjaFN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG90aGVyU2VhcmNoU3RhdGUuY2xvc2VkKSB7XG4gICAgICAgIC8vIEFscmVhZHkgcHJvY2Vzc2VkIHRoaXMgbm9kZS5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2FuRXhpdChvdGhlclNlYXJjaFN0YXRlLCBjYW1lRnJvbSkpIHtcbiAgICAgICAgLy8gdGhpcyBub2RlIHdhcyBvcGVuZWQgYnkgYWx0ZXJuYXRpdmUgb3BlbmVyLiBUaGUgc2V0cyBpbnRlcnNlY3Qgbm93LFxuICAgICAgICAvLyB3ZSBmb3VuZCBhbiBvcHRpbWFsIHBhdGgsIHRoYXQgZ29lcyB0aHJvdWdoICp0aGlzKiBub2RlLiBIb3dldmVyLCB0aGVyZVxuICAgICAgICAvLyBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGlzIGlzIHRoZSBnbG9iYWwgb3B0aW1hbCBzb2x1dGlvbiBwYXRoLlxuXG4gICAgICAgIHZhciBwb3RlbnRpYWxMTWluID0gb3RoZXJTZWFyY2hTdGF0ZS5kaXN0YW5jZVRvU291cmNlICsgY2FtZUZyb20uZGlzdGFuY2VUb1NvdXJjZTtcbiAgICAgICAgaWYgKHBvdGVudGlhbExNaW4gPCBsTWluKSB7XG4gICAgICAgICAgbWluRnJvbSA9IG90aGVyU2VhcmNoU3RhdGU7XG4gICAgICAgICAgbWluVG8gPSBjYW1lRnJvbVxuICAgICAgICAgIGxNaW4gPSBwb3RlbnRpYWxMTWluO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdlIGFyZSBkb25lIHdpdGggdGhpcyBub2RlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB0ZW50YXRpdmVEaXN0YW5jZSA9IGNhbWVGcm9tLmRpc3RhbmNlVG9Tb3VyY2UgKyBkaXN0YW5jZShvdGhlclNlYXJjaFN0YXRlLm5vZGUsIGNhbWVGcm9tLm5vZGUsIGxpbmspO1xuXG4gICAgICBpZiAodGVudGF0aXZlRGlzdGFuY2UgPj0gb3RoZXJTZWFyY2hTdGF0ZS5kaXN0YW5jZVRvU291cmNlKSB7XG4gICAgICAgIC8vIFRoaXMgd291bGQgb25seSBtYWtlIG91ciBwYXRoIGxvbmdlci4gSWdub3JlIHRoaXMgcm91dGUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hvb3NlIHRhcmdldCBiYXNlZCBvbiBjdXJyZW50IHdvcmtpbmcgc2V0OlxuICAgICAgdmFyIHRhcmdldCA9IChjdXJyZW50T3BlbmVyID09PSBCWV9GUk9NKSA/IHRvIDogZnJvbTtcbiAgICAgIHZhciBuZXdGU2NvcmUgPSB0ZW50YXRpdmVEaXN0YW5jZSArIGhldXJpc3RpYyhvdGhlclNlYXJjaFN0YXRlLm5vZGUsIHRhcmdldCk7XG4gICAgICBpZiAobmV3RlNjb3JlID49IGxNaW4pIHtcbiAgICAgICAgLy8gdGhpcyBjYW4ndCBiZSBvcHRpbWFsIHBhdGgsIGFzIHdlIGhhdmUgYWxyZWFkeSBmb3VuZCBhIHNob3J0ZXIgcGF0aC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5mU2NvcmUgPSBuZXdGU2NvcmU7XG5cbiAgICAgIGlmIChvdGhlclNlYXJjaFN0YXRlLm9wZW4gPT09IDApIHtcbiAgICAgICAgLy8gUmVtZW1iZXIgdGhpcyBub2RlIGluIHRoZSBjdXJyZW50IHNldFxuICAgICAgICBjdXJyZW50U2V0LnB1c2gob3RoZXJTZWFyY2hTdGF0ZSk7XG4gICAgICAgIGN1cnJlbnRTZXQudXBkYXRlSXRlbShvdGhlclNlYXJjaFN0YXRlLmhlYXBJbmRleCk7XG5cbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5vcGVuID0gY3VycmVudE9wZW5lcjtcbiAgICAgIH1cblxuICAgICAgLy8gYmluZ28hIHdlIGZvdW5kIHNob3J0ZXIgcGF0aDpcbiAgICAgIG90aGVyU2VhcmNoU3RhdGUucGFyZW50ID0gY2FtZUZyb207XG4gICAgICBvdGhlclNlYXJjaFN0YXRlLmRpc3RhbmNlVG9Tb3VyY2UgPSB0ZW50YXRpdmVEaXN0YW5jZTtcbiAgICB9XG4gIH1cbn1cbiIsIi8qKlxuICogUGVyZm9ybXMgYSB1bmktZGlyZWN0aW9uYWwgQSBTdGFyIHNlYXJjaCBvbiBncmFwaC5cbiAqIFxuICogV2Ugd2lsbCB0cnkgdG8gbWluaW1pemUgZihuKSA9IGcobikgKyBoKG4pLCB3aGVyZVxuICogZyhuKSBpcyBhY3R1YWwgZGlzdGFuY2UgZnJvbSBzb3VyY2Ugbm9kZSB0byBgbmAsIGFuZFxuICogaChuKSBpcyBoZXVyaXN0aWMgZGlzdGFuY2UgZnJvbSBgbmAgdG8gdGFyZ2V0IG5vZGUuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYVN0YXJQYXRoU2VhcmNoO1xuXG52YXIgTm9kZUhlYXAgPSByZXF1aXJlKCcuL05vZGVIZWFwJyk7XG52YXIgbWFrZVNlYXJjaFN0YXRlUG9vbCA9IHJlcXVpcmUoJy4vbWFrZVNlYXJjaFN0YXRlUG9vbCcpO1xudmFyIGhldXJpc3RpY3MgPSByZXF1aXJlKCcuL2hldXJpc3RpY3MnKTtcbnZhciBkZWZhdWx0U2V0dGluZ3MgPSByZXF1aXJlKCcuL2RlZmF1bHRTZXR0aW5ncy5qcycpO1xuXG52YXIgTk9fUEFUSCA9IGRlZmF1bHRTZXR0aW5ncy5OT19QQVRIO1xuXG5tb2R1bGUuZXhwb3J0cy5sMiA9IGhldXJpc3RpY3MubDI7XG5tb2R1bGUuZXhwb3J0cy5sMSA9IGhldXJpc3RpY3MubDE7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBwYXRoZmluZGVyLiBBIHBhdGhmaW5kZXIgaGFzIGp1c3Qgb25lIG1ldGhvZDpcbiAqIGBmaW5kKGZyb21JZCwgdG9JZClgLCBpdCBtYXkgYmUgZXh0ZW5kZWQgaW4gZnV0dXJlLlxuICogXG4gKiBAcGFyYW0ge25ncmFwaC5ncmFwaH0gZ3JhcGggaW5zdGFuY2UuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW52YWthL25ncmFwaC5ncmFwaFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgdGhhdCBjb25maWd1cmVzIHNlYXJjaFxuICogQHBhcmFtIHtGdW5jdGlvbihhLCBiKX0gb3B0aW9ucy5oZXVyaXN0aWMgLSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBlc3RpbWF0ZWQgZGlzdGFuY2UgYmV0d2VlblxuICogbm9kZXMgYGFgIGFuZCBgYmAuIFRoaXMgZnVuY3Rpb24gc2hvdWxkIG5ldmVyIG92ZXJlc3RpbWF0ZSBhY3R1YWwgZGlzdGFuY2UgYmV0d2VlbiB0d29cbiAqIG5vZGVzIChvdGhlcndpc2UgdGhlIGZvdW5kIHBhdGggd2lsbCBub3QgYmUgdGhlIHNob3J0ZXN0KS4gRGVmYXVsdHMgZnVuY3Rpb24gcmV0dXJucyAwLFxuICogd2hpY2ggbWFrZXMgdGhpcyBzZWFyY2ggZXF1aXZhbGVudCB0byBEaWprc3RyYSBzZWFyY2guXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKGEsIGIpfSBvcHRpb25zLmRpc3RhbmNlIC0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYWN0dWFsIGRpc3RhbmNlIGJldHdlZW4gdHdvXG4gKiBub2RlcyBgYWAgYW5kIGBiYC4gQnkgZGVmYXVsdCB0aGlzIGlzIHNldCB0byByZXR1cm4gZ3JhcGgtdGhlb3JldGljYWwgZGlzdGFuY2UgKGFsd2F5cyAxKTtcbiAqIFxuICogQHJldHVybnMge09iamVjdH0gQSBwYXRoZmluZGVyIHdpdGggc2luZ2xlIG1ldGhvZCBgZmluZCgpYC5cbiAqL1xuZnVuY3Rpb24gYVN0YXJQYXRoU2VhcmNoKGdyYXBoLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAvLyB3aGV0aGVyIHRyYXZlcnNhbCBzaG91bGQgYmUgY29uc2lkZXJlZCBvdmVyIG9yaWVudGVkIGdyYXBoLlxuICB2YXIgb3JpZW50ZWQgPSBvcHRpb25zLm9yaWVudGVkO1xuXG4gIHZhciBoZXVyaXN0aWMgPSBvcHRpb25zLmhldXJpc3RpYztcbiAgaWYgKCFoZXVyaXN0aWMpIGhldXJpc3RpYyA9IGRlZmF1bHRTZXR0aW5ncy5oZXVyaXN0aWM7XG5cbiAgdmFyIGRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZTtcbiAgaWYgKCFkaXN0YW5jZSkgZGlzdGFuY2UgPSBkZWZhdWx0U2V0dGluZ3MuZGlzdGFuY2U7XG4gIHZhciBwb29sID0gbWFrZVNlYXJjaFN0YXRlUG9vbCgpO1xuXG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogRmluZHMgYSBwYXRoIGJldHdlZW4gbm9kZSBgZnJvbUlkYCBhbmQgYHRvSWRgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gb2Ygbm9kZXMgYmV0d2VlbiBgdG9JZGAgYW5kIGBmcm9tSWRgLiBFbXB0eSBhcnJheSBpcyByZXR1cm5lZFxuICAgICAqIGlmIG5vIHBhdGggaXMgZm91bmQuXG4gICAgICovXG4gICAgZmluZDogZmluZFxuICB9O1xuXG4gIGZ1bmN0aW9uIGZpbmQoZnJvbUlkLCB0b0lkKSB7XG4gICAgdmFyIGZyb20gPSBncmFwaC5nZXROb2RlKGZyb21JZCk7XG4gICAgaWYgKCFmcm9tKSB0aHJvdyBuZXcgRXJyb3IoJ2Zyb21JZCBpcyBub3QgZGVmaW5lZCBpbiB0aGlzIGdyYXBoOiAnICsgZnJvbUlkKTtcbiAgICB2YXIgdG8gPSBncmFwaC5nZXROb2RlKHRvSWQpO1xuICAgIGlmICghdG8pIHRocm93IG5ldyBFcnJvcigndG9JZCBpcyBub3QgZGVmaW5lZCBpbiB0aGlzIGdyYXBoOiAnICsgdG9JZCk7XG4gICAgcG9vbC5yZXNldCgpO1xuXG4gICAgLy8gTWFwcyBub2RlSWQgdG8gTm9kZVNlYXJjaFN0YXRlLlxuICAgIHZhciBub2RlU3RhdGUgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyB0aGUgbm9kZXMgdGhhdCB3ZSBzdGlsbCBuZWVkIHRvIGV2YWx1YXRlXG4gICAgdmFyIG9wZW5TZXQgPSBuZXcgTm9kZUhlYXAoe1xuICAgICAgY29tcGFyZTogZGVmYXVsdFNldHRpbmdzLmNvbXBhcmVGU2NvcmUsXG4gICAgICBzZXROb2RlSWQ6IGRlZmF1bHRTZXR0aW5ncy5zZXRIZWFwSW5kZXhcbiAgICB9KTtcblxuICAgIHZhciBzdGFydE5vZGUgPSBwb29sLmNyZWF0ZU5ld1N0YXRlKGZyb20pO1xuICAgIG5vZGVTdGF0ZS5zZXQoZnJvbUlkLCBzdGFydE5vZGUpO1xuXG4gICAgLy8gRm9yIHRoZSBmaXJzdCBub2RlLCBmU2NvcmUgaXMgY29tcGxldGVseSBoZXVyaXN0aWMuXG4gICAgc3RhcnROb2RlLmZTY29yZSA9IGhldXJpc3RpYyhmcm9tLCB0byk7XG5cbiAgICAvLyBUaGUgY29zdCBvZiBnb2luZyBmcm9tIHN0YXJ0IHRvIHN0YXJ0IGlzIHplcm8uXG4gICAgc3RhcnROb2RlLmRpc3RhbmNlVG9Tb3VyY2UgPSAwO1xuICAgIG9wZW5TZXQucHVzaChzdGFydE5vZGUpO1xuICAgIHN0YXJ0Tm9kZS5vcGVuID0gMTtcblxuICAgIHZhciBjYW1lRnJvbTtcblxuICAgIHdoaWxlIChvcGVuU2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGNhbWVGcm9tID0gb3BlblNldC5wb3AoKTtcbiAgICAgIGlmIChnb2FsUmVhY2hlZChjYW1lRnJvbSwgdG8pKSByZXR1cm4gcmVjb25zdHJ1Y3RQYXRoKGNhbWVGcm9tKTtcblxuICAgICAgLy8gbm8gbmVlZCB0byB2aXNpdCB0aGlzIG5vZGUgYW55bW9yZVxuICAgICAgY2FtZUZyb20uY2xvc2VkID0gdHJ1ZTtcbiAgICAgIGdyYXBoLmZvckVhY2hMaW5rZWROb2RlKGNhbWVGcm9tLm5vZGUuaWQsIHZpc2l0TmVpZ2hib3VyLCBvcmllbnRlZCk7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZ290IGhlcmUsIHRoZW4gdGhlcmUgaXMgbm8gcGF0aC5cbiAgICByZXR1cm4gTk9fUEFUSDtcblxuICAgIGZ1bmN0aW9uIHZpc2l0TmVpZ2hib3VyKG90aGVyTm9kZSwgbGluaykge1xuICAgICAgdmFyIG90aGVyU2VhcmNoU3RhdGUgPSBub2RlU3RhdGUuZ2V0KG90aGVyTm9kZS5pZCk7XG4gICAgICBpZiAoIW90aGVyU2VhcmNoU3RhdGUpIHtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZSA9IHBvb2wuY3JlYXRlTmV3U3RhdGUob3RoZXJOb2RlKTtcbiAgICAgICAgbm9kZVN0YXRlLnNldChvdGhlck5vZGUuaWQsIG90aGVyU2VhcmNoU3RhdGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3RoZXJTZWFyY2hTdGF0ZS5jbG9zZWQpIHtcbiAgICAgICAgLy8gQWxyZWFkeSBwcm9jZXNzZWQgdGhpcyBub2RlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAob3RoZXJTZWFyY2hTdGF0ZS5vcGVuID09PSAwKSB7XG4gICAgICAgIC8vIFJlbWVtYmVyIHRoaXMgbm9kZS5cbiAgICAgICAgb3BlblNldC5wdXNoKG90aGVyU2VhcmNoU3RhdGUpO1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlLm9wZW4gPSAxO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGVudGF0aXZlRGlzdGFuY2UgPSBjYW1lRnJvbS5kaXN0YW5jZVRvU291cmNlICsgZGlzdGFuY2Uob3RoZXJOb2RlLCBjYW1lRnJvbS5ub2RlLCBsaW5rKTtcbiAgICAgIGlmICh0ZW50YXRpdmVEaXN0YW5jZSA+PSBvdGhlclNlYXJjaFN0YXRlLmRpc3RhbmNlVG9Tb3VyY2UpIHtcbiAgICAgICAgLy8gVGhpcyB3b3VsZCBvbmx5IG1ha2Ugb3VyIHBhdGggbG9uZ2VyLiBJZ25vcmUgdGhpcyByb3V0ZS5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBiaW5nbyEgd2UgZm91bmQgc2hvcnRlciBwYXRoOlxuICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5wYXJlbnQgPSBjYW1lRnJvbTtcbiAgICAgIG90aGVyU2VhcmNoU3RhdGUuZGlzdGFuY2VUb1NvdXJjZSA9IHRlbnRhdGl2ZURpc3RhbmNlO1xuICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5mU2NvcmUgPSB0ZW50YXRpdmVEaXN0YW5jZSArIGhldXJpc3RpYyhvdGhlclNlYXJjaFN0YXRlLm5vZGUsIHRvKTtcblxuICAgICAgb3BlblNldC51cGRhdGVJdGVtKG90aGVyU2VhcmNoU3RhdGUuaGVhcEluZGV4KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ29hbFJlYWNoZWQoc2VhcmNoU3RhdGUsIHRhcmdldE5vZGUpIHtcbiAgcmV0dXJuIHNlYXJjaFN0YXRlLm5vZGUgPT09IHRhcmdldE5vZGU7XG59XG5cbmZ1bmN0aW9uIHJlY29uc3RydWN0UGF0aChzZWFyY2hTdGF0ZSkge1xuICB2YXIgcGF0aCA9IFtzZWFyY2hTdGF0ZS5ub2RlXTtcbiAgdmFyIHBhcmVudCA9IHNlYXJjaFN0YXRlLnBhcmVudDtcblxuICB3aGlsZSAocGFyZW50KSB7XG4gICAgcGF0aC5wdXNoKHBhcmVudC5ub2RlKTtcbiAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICB9XG5cbiAgcmV0dXJuIHBhdGg7XG59XG4iLCIvLyBXZSByZXVzZSBpbnN0YW5jZSBvZiBhcnJheSwgYnV0IHdlIHRyaWUgdG8gZnJlZXplIGl0IGFzIHdlbGwsXG4vLyBzbyB0aGF0IGNvbnN1bWVycyBkb24ndCBtb2RpZnkgaXQuIE1heWJlIGl0J3MgYSBiYWQgaWRlYS5cbnZhciBOT19QQVRIID0gW107XG5pZiAodHlwZW9mIE9iamVjdC5mcmVlemUgPT09ICdmdW5jdGlvbicpIE9iamVjdC5mcmVlemUoTk9fUEFUSCk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBQYXRoIHNlYXJjaCBzZXR0aW5nc1xuICBoZXVyaXN0aWM6IGJsaW5kSGV1cmlzdGljLFxuICBkaXN0YW5jZTogY29uc3RhbnREaXN0YW5jZSxcbiAgY29tcGFyZUZTY29yZTogY29tcGFyZUZTY29yZSxcbiAgTk9fUEFUSDogTk9fUEFUSCxcblxuICAvLyBoZWFwIHNldHRpbmdzXG4gIHNldEhlYXBJbmRleDogc2V0SGVhcEluZGV4LFxuXG4gIC8vIG5iYTpcbiAgc2V0SDE6IHNldEgxLFxuICBzZXRIMjogc2V0SDIsXG4gIGNvbXBhcmVGMVNjb3JlOiBjb21wYXJlRjFTY29yZSxcbiAgY29tcGFyZUYyU2NvcmU6IGNvbXBhcmVGMlNjb3JlLFxufVxuXG5mdW5jdGlvbiBibGluZEhldXJpc3RpYygvKiBhLCBiICovKSB7XG4gIC8vIGJsaW5kIGhldXJpc3RpYyBtYWtlcyB0aGlzIHNlYXJjaCBlcXVhbCB0byBwbGFpbiBEaWprc3RyYSBwYXRoIHNlYXJjaC5cbiAgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIGNvbnN0YW50RGlzdGFuY2UoLyogYSwgYiAqLykge1xuICByZXR1cm4gMTtcbn1cblxuZnVuY3Rpb24gY29tcGFyZUZTY29yZShhLCBiKSB7XG4gIHZhciByZXN1bHQgPSBhLmZTY29yZSAtIGIuZlNjb3JlO1xuICAvLyBUT0RPOiBDYW4gSSBpbXByb3ZlIHNwZWVkIHdpdGggc21hcnRlciB0aWVzLWJyZWFraW5nP1xuICAvLyBJIHRyaWVkIGRpc3RhbmNlVG9Tb3VyY2UsIGJ1dCBpdCBkaWRuJ3Qgc2VlbSB0byBoYXZlIG11Y2ggZWZmZWN0XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHNldEhlYXBJbmRleChub2RlU2VhcmNoU3RhdGUsIGhlYXBJbmRleCkge1xuICBub2RlU2VhcmNoU3RhdGUuaGVhcEluZGV4ID0gaGVhcEluZGV4O1xufVxuXG5mdW5jdGlvbiBjb21wYXJlRjFTY29yZShhLCBiKSB7XG4gIHJldHVybiBhLmYxIC0gYi5mMTtcbn1cblxuZnVuY3Rpb24gY29tcGFyZUYyU2NvcmUoYSwgYikge1xuICByZXR1cm4gYS5mMiAtIGIuZjI7XG59XG5cbmZ1bmN0aW9uIHNldEgxKG5vZGUsIGhlYXBJbmRleCkge1xuICBub2RlLmgxID0gaGVhcEluZGV4O1xufVxuXG5mdW5jdGlvbiBzZXRIMihub2RlLCBoZWFwSW5kZXgpIHtcbiAgbm9kZS5oMiA9IGhlYXBJbmRleDtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbDI6IGwyLFxuICBsMTogbDFcbn07XG5cbi8qKlxuICogRXVjbGlkIGRpc3RhbmNlIChsMiBub3JtKTtcbiAqIFxuICogQHBhcmFtIHsqfSBhIFxuICogQHBhcmFtIHsqfSBiIFxuICovXG5mdW5jdGlvbiBsMihhLCBiKSB7XG4gIHZhciBkeCA9IGEueCAtIGIueDtcbiAgdmFyIGR5ID0gYS55IC0gYi55O1xuICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbn1cblxuLyoqXG4gKiBNYW5oYXR0YW4gZGlzdGFuY2UgKGwxIG5vcm0pO1xuICogQHBhcmFtIHsqfSBhIFxuICogQHBhcmFtIHsqfSBiIFxuICovXG5mdW5jdGlvbiBsMShhLCBiKSB7XG4gIHZhciBkeCA9IGEueCAtIGIueDtcbiAgdmFyIGR5ID0gYS55IC0gYi55O1xuICByZXR1cm4gTWF0aC5hYnMoZHgpICsgTWF0aC5hYnMoZHkpO1xufVxuIiwiLyoqXG4gKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSBzaW5nbGUgc2VhcmNoIG5vZGUgaW4gdGhlIGV4cGxvcmF0aW9uIHRyZWUgZm9yXG4gKiBBKiBhbGdvcml0aG0uXG4gKiBcbiAqIEBwYXJhbSB7T2JqZWN0fSBub2RlICBvcmlnaW5hbCBub2RlIGluIHRoZSBncmFwaFxuICovXG5mdW5jdGlvbiBOb2RlU2VhcmNoU3RhdGUobm9kZSkge1xuICB0aGlzLm5vZGUgPSBub2RlO1xuXG4gIC8vIEhvdyB3ZSBjYW1lIHRvIHRoaXMgbm9kZT9cbiAgdGhpcy5wYXJlbnQgPSBudWxsO1xuXG4gIHRoaXMuY2xvc2VkID0gZmFsc2U7XG4gIHRoaXMub3BlbiA9IDA7XG5cbiAgdGhpcy5kaXN0YW5jZVRvU291cmNlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAvLyB0aGUgZihuKSA9IGcobikgKyBoKG4pIHZhbHVlXG4gIHRoaXMuZlNjb3JlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gIC8vIHVzZWQgdG8gcmVjb25zdHJ1Y3QgaGVhcCB3aGVuIGZTY29yZSBpcyB1cGRhdGVkLlxuICB0aGlzLmhlYXBJbmRleCA9IC0xO1xufTtcblxuZnVuY3Rpb24gbWFrZVNlYXJjaFN0YXRlUG9vbCgpIHtcbiAgdmFyIGN1cnJlbnRJbkNhY2hlID0gMDtcbiAgdmFyIG5vZGVDYWNoZSA9IFtdO1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlTmV3U3RhdGU6IGNyZWF0ZU5ld1N0YXRlLFxuICAgIHJlc2V0OiByZXNldFxuICB9O1xuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGN1cnJlbnRJbkNhY2hlID0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU5ld1N0YXRlKG5vZGUpIHtcbiAgICB2YXIgY2FjaGVkID0gbm9kZUNhY2hlW2N1cnJlbnRJbkNhY2hlXTtcbiAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAvLyBUT0RPOiBUaGlzIGFsbW9zdCBkdXBsaWNhdGVzIGNvbnN0cnVjdG9yIGNvZGUuIE5vdCBzdXJlIGlmXG4gICAgICAvLyBpdCB3b3VsZCBpbXBhY3QgcGVyZm9ybWFuY2UgaWYgSSBtb3ZlIHRoaXMgY29kZSBpbnRvIGEgZnVuY3Rpb25cbiAgICAgIGNhY2hlZC5ub2RlID0gbm9kZTtcbiAgICAgIC8vIEhvdyB3ZSBjYW1lIHRvIHRoaXMgbm9kZT9cbiAgICAgIGNhY2hlZC5wYXJlbnQgPSBudWxsO1xuXG4gICAgICBjYWNoZWQuY2xvc2VkID0gZmFsc2U7XG4gICAgICBjYWNoZWQub3BlbiA9IDA7XG5cbiAgICAgIGNhY2hlZC5kaXN0YW5jZVRvU291cmNlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgICAgLy8gdGhlIGYobikgPSBnKG4pICsgaChuKSB2YWx1ZVxuICAgICAgY2FjaGVkLmZTY29yZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuICAgICAgLy8gdXNlZCB0byByZWNvbnN0cnVjdCBoZWFwIHdoZW4gZlNjb3JlIGlzIHVwZGF0ZWQuXG4gICAgICBjYWNoZWQuaGVhcEluZGV4ID0gLTE7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgY2FjaGVkID0gbmV3IE5vZGVTZWFyY2hTdGF0ZShub2RlKTtcbiAgICAgIG5vZGVDYWNoZVtjdXJyZW50SW5DYWNoZV0gPSBjYWNoZWQ7XG4gICAgfVxuICAgIGN1cnJlbnRJbkNhY2hlKys7XG4gICAgcmV0dXJuIGNhY2hlZDtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBtYWtlU2VhcmNoU3RhdGVQb29sOyIsIm1vZHVsZS5leHBvcnRzID0gbmJhO1xuXG52YXIgTm9kZUhlYXAgPSByZXF1aXJlKCcuLi9Ob2RlSGVhcCcpO1xudmFyIGhldXJpc3RpY3MgPSByZXF1aXJlKCcuLi9oZXVyaXN0aWNzJyk7XG52YXIgZGVmYXVsdFNldHRpbmdzID0gcmVxdWlyZSgnLi4vZGVmYXVsdFNldHRpbmdzLmpzJyk7XG52YXIgbWFrZU5CQVNlYXJjaFN0YXRlUG9vbCA9IHJlcXVpcmUoJy4vbWFrZU5CQVNlYXJjaFN0YXRlUG9vbC5qcycpO1xuXG52YXIgTk9fUEFUSCA9IGRlZmF1bHRTZXR0aW5ncy5OT19QQVRIO1xuXG5tb2R1bGUuZXhwb3J0cy5sMiA9IGhldXJpc3RpY3MubDI7XG5tb2R1bGUuZXhwb3J0cy5sMSA9IGhldXJpc3RpY3MubDE7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBwYXRoZmluZGVyLiBBIHBhdGhmaW5kZXIgaGFzIGp1c3Qgb25lIG1ldGhvZDpcbiAqIGBmaW5kKGZyb21JZCwgdG9JZClgLlxuICogXG4gKiBUaGlzIGlzIGltcGxlbWVudGF0aW9uIG9mIHRoZSBOQkEqIGFsZ29yaXRobSBkZXNjcmliZWQgaW4gXG4gKiBcbiAqICBcIllldCBhbm90aGVyIGJpZGlyZWN0aW9uYWwgYWxnb3JpdGhtIGZvciBzaG9ydGVzdCBwYXRoc1wiIHBhcGVyIGJ5IFdpbSBQaWpscyBhbmQgSGVuayBQb3N0XG4gKiBcbiAqIFRoZSBwYXBlciBpcyBhdmFpbGFibGUgaGVyZTogaHR0cHM6Ly9yZXB1Yi5ldXIubmwvcHViLzE2MTAwL2VpMjAwOS0xMC5wZGZcbiAqIFxuICogQHBhcmFtIHtuZ3JhcGguZ3JhcGh9IGdyYXBoIGluc3RhbmNlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FudmFrYS9uZ3JhcGguZ3JhcGhcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIHRoYXQgY29uZmlndXJlcyBzZWFyY2hcbiAqIEBwYXJhbSB7RnVuY3Rpb24oYSwgYil9IG9wdGlvbnMuaGV1cmlzdGljIC0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgZXN0aW1hdGVkIGRpc3RhbmNlIGJldHdlZW5cbiAqIG5vZGVzIGBhYCBhbmQgYGJgLiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBuZXZlciBvdmVyZXN0aW1hdGUgYWN0dWFsIGRpc3RhbmNlIGJldHdlZW4gdHdvXG4gKiBub2RlcyAob3RoZXJ3aXNlIHRoZSBmb3VuZCBwYXRoIHdpbGwgbm90IGJlIHRoZSBzaG9ydGVzdCkuIERlZmF1bHRzIGZ1bmN0aW9uIHJldHVybnMgMCxcbiAqIHdoaWNoIG1ha2VzIHRoaXMgc2VhcmNoIGVxdWl2YWxlbnQgdG8gRGlqa3N0cmEgc2VhcmNoLlxuICogQHBhcmFtIHtGdW5jdGlvbihhLCBiKX0gb3B0aW9ucy5kaXN0YW5jZSAtIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFjdHVhbCBkaXN0YW5jZSBiZXR3ZWVuIHR3b1xuICogbm9kZXMgYGFgIGFuZCBgYmAuIEJ5IGRlZmF1bHQgdGhpcyBpcyBzZXQgdG8gcmV0dXJuIGdyYXBoLXRoZW9yZXRpY2FsIGRpc3RhbmNlIChhbHdheXMgMSk7XG4gKiBcbiAqIEByZXR1cm5zIHtPYmplY3R9IEEgcGF0aGZpbmRlciB3aXRoIHNpbmdsZSBtZXRob2QgYGZpbmQoKWAuXG4gKi9cbmZ1bmN0aW9uIG5iYShncmFwaCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgLy8gd2hldGhlciB0cmF2ZXJzYWwgc2hvdWxkIGJlIGNvbnNpZGVyZWQgb3ZlciBvcmllbnRlZCBncmFwaC5cbiAgdmFyIG9yaWVudGVkID0gb3B0aW9ucy5vcmllbnRlZDtcbiAgdmFyIHF1aXRGYXN0ID0gb3B0aW9ucy5xdWl0RmFzdDtcblxuICB2YXIgaGV1cmlzdGljID0gb3B0aW9ucy5oZXVyaXN0aWM7XG4gIGlmICghaGV1cmlzdGljKSBoZXVyaXN0aWMgPSBkZWZhdWx0U2V0dGluZ3MuaGV1cmlzdGljO1xuXG4gIHZhciBkaXN0YW5jZSA9IG9wdGlvbnMuZGlzdGFuY2U7XG4gIGlmICghZGlzdGFuY2UpIGRpc3RhbmNlID0gZGVmYXVsdFNldHRpbmdzLmRpc3RhbmNlO1xuXG4gIC8vIER1cmluZyBzdHJlc3MgdGVzdHMgSSBub3RpY2VkIHRoYXQgZ2FyYmFnZSBjb2xsZWN0aW9uIHdhcyBvbmUgb2YgdGhlIGhlYXZpZXN0XG4gIC8vIGNvbnRyaWJ1dG9ycyB0byB0aGUgYWxnb3JpdGhtJ3Mgc3BlZWQuIFNvIEknbSB1c2luZyBhbiBvYmplY3QgcG9vbCB0byByZWN5Y2xlIG5vZGVzLlxuICB2YXIgcG9vbCA9IG1ha2VOQkFTZWFyY2hTdGF0ZVBvb2woKTtcblxuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIEZpbmRzIGEgcGF0aCBiZXR3ZWVuIG5vZGUgYGZyb21JZGAgYW5kIGB0b0lkYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IG9mIG5vZGVzIGJldHdlZW4gYHRvSWRgIGFuZCBgZnJvbUlkYC4gRW1wdHkgYXJyYXkgaXMgcmV0dXJuZWRcbiAgICAgKiBpZiBubyBwYXRoIGlzIGZvdW5kLlxuICAgICAqL1xuICAgIGZpbmQ6IGZpbmRcbiAgfTtcblxuICBmdW5jdGlvbiBmaW5kKGZyb21JZCwgdG9JZCkge1xuICAgIC8vIEkgbXVzdCBhcG9sb2dpemUgZm9yIHRoZSBjb2RlIGR1cGxpY2F0aW9uLiBUaGlzIHdhcyB0aGUgZWFzaWVzdCB3YXkgZm9yIG1lIHRvXG4gICAgLy8gaW1wbGVtZW50IHRoZSBhbGdvcml0aG0gZmFzdC5cbiAgICB2YXIgZnJvbSA9IGdyYXBoLmdldE5vZGUoZnJvbUlkKTtcbiAgICBpZiAoIWZyb20pIHRocm93IG5ldyBFcnJvcignZnJvbUlkIGlzIG5vdCBkZWZpbmVkIGluIHRoaXMgZ3JhcGg6ICcgKyBmcm9tSWQpO1xuICAgIHZhciB0byA9IGdyYXBoLmdldE5vZGUodG9JZCk7XG4gICAgaWYgKCF0bykgdGhyb3cgbmV3IEVycm9yKCd0b0lkIGlzIG5vdCBkZWZpbmVkIGluIHRoaXMgZ3JhcGg6ICcgKyB0b0lkKTtcblxuICAgIHBvb2wucmVzZXQoKTtcblxuICAgIC8vIEkgbXVzdCBhbHNvIGFwb2xvZ2l6ZSBmb3Igc29tZXdoYXQgY3J5cHRpYyBuYW1lcy4gVGhlIE5CQSogaXMgYmktZGlyZWN0aW9uYWxcbiAgICAvLyBzZWFyY2ggYWxnb3JpdGhtLCB3aGljaCBtZWFucyBpdCBydW5zIHR3byBzZWFyY2hlcyBpbiBwYXJhbGxlbC4gT25lIHJ1bnNcbiAgICAvLyBmcm9tIHNvdXJjZSBub2RlIHRvIHRhcmdldCwgd2hpbGUgdGhlIG90aGVyIG9uZSBydW5zIGZyb20gdGFyZ2V0IHRvIHNvdXJjZS5cbiAgICAvLyBFdmVyeXdoZXJlIHdoZXJlIHlvdSBzZWUgYDFgIGl0IG1lYW5zIGl0J3MgZm9yIHRoZSBmb3J3YXJkIHNlYXJjaC4gYDJgIGlzIGZvciBcbiAgICAvLyBiYWNrd2FyZCBzZWFyY2guXG5cbiAgICAvLyBGb3Igb3JpZW50ZWQgZ3JhcGggcGF0aCBmaW5kaW5nLCB3ZSBuZWVkIHRvIHJldmVyc2UgdGhlIGdyYXBoLCBzbyB0aGF0XG4gICAgLy8gYmFja3dhcmQgc2VhcmNoIHZpc2l0cyBjb3JyZWN0IGxpbmsuIE9idmlvdXNseSB3ZSBkb24ndCB3YW50IHRvIGR1cGxpY2F0ZVxuICAgIC8vIHRoZSBncmFwaCwgaW5zdGVhZCB3ZSBhbHdheXMgdHJhdmVyc2UgdGhlIGdyYXBoIGFzIG5vbi1vcmllbnRlZCwgYW5kIGZpbHRlclxuICAgIC8vIGVkZ2VzIGluIGB2aXNpdE4xT3JpZW50ZWQvdmlzaXROMk9yaXRlbnRlZGBcbiAgICB2YXIgZm9yd2FyZFZpc2l0b3IgPSBvcmllbnRlZCA/IHZpc2l0TjFPcmllbnRlZCA6IHZpc2l0TjE7XG4gICAgdmFyIHJldmVyc2VWaXNpdG9yID0gb3JpZW50ZWQgPyB2aXNpdE4yT3JpZW50ZWQgOiB2aXNpdE4yO1xuXG4gICAgLy8gTWFwcyBub2RlSWQgdG8gTkJBU2VhcmNoU3RhdGUuXG4gICAgdmFyIG5vZGVTdGF0ZSA9IG5ldyBNYXAoKTtcblxuICAgIC8vIFRoZXNlIHR3byBoZWFwcyBzdG9yZSBub2RlcyBieSB0aGVpciB1bmRlcmVzdGltYXRlZCB2YWx1ZXMuXG4gICAgdmFyIG9wZW4xU2V0ID0gbmV3IE5vZGVIZWFwKHtcbiAgICAgIGNvbXBhcmU6IGRlZmF1bHRTZXR0aW5ncy5jb21wYXJlRjFTY29yZSxcbiAgICAgIHNldE5vZGVJZDogZGVmYXVsdFNldHRpbmdzLnNldEgxXG4gICAgfSk7XG4gICAgdmFyIG9wZW4yU2V0ID0gbmV3IE5vZGVIZWFwKHtcbiAgICAgIGNvbXBhcmU6IGRlZmF1bHRTZXR0aW5ncy5jb21wYXJlRjJTY29yZSxcbiAgICAgIHNldE5vZGVJZDogZGVmYXVsdFNldHRpbmdzLnNldEgyXG4gICAgfSk7XG5cbiAgICAvLyBUaGlzIGlzIHdoZXJlIGJvdGggc2VhcmNoZXMgd2lsbCBtZWV0LlxuICAgIHZhciBtaW5Ob2RlO1xuXG4gICAgLy8gVGhlIHNtYWxsZXN0IHBhdGggbGVuZ3RoIHNlZW4gc28gZmFyIGlzIHN0b3JlZCBoZXJlOlxuICAgIHZhciBsTWluID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gICAgLy8gV2Ugc3RhcnQgYnkgcHV0dGluZyBzdGFydC9lbmQgbm9kZXMgdG8gdGhlIGNvcnJlc3BvbmRpbmcgaGVhcHNcbiAgICB2YXIgc3RhcnROb2RlID0gcG9vbC5jcmVhdGVOZXdTdGF0ZShmcm9tKTtcbiAgICBub2RlU3RhdGUuc2V0KGZyb21JZCwgc3RhcnROb2RlKTsgXG4gICAgc3RhcnROb2RlLmcxID0gMDtcbiAgICB2YXIgZjEgPSBoZXVyaXN0aWMoZnJvbSwgdG8pO1xuICAgIHN0YXJ0Tm9kZS5mMSA9IGYxO1xuICAgIG9wZW4xU2V0LnB1c2goc3RhcnROb2RlKTtcblxuICAgIHZhciBlbmROb2RlID0gcG9vbC5jcmVhdGVOZXdTdGF0ZSh0byk7XG4gICAgbm9kZVN0YXRlLnNldCh0b0lkLCBlbmROb2RlKTtcbiAgICBlbmROb2RlLmcyID0gMDtcbiAgICB2YXIgZjIgPSBmMTsgLy8gdGhleSBzaG91bGQgYWdyZWUgb3JpZ2luYWxseVxuICAgIGVuZE5vZGUuZjIgPSBmMjtcbiAgICBvcGVuMlNldC5wdXNoKGVuZE5vZGUpXG5cbiAgICAvLyB0aGUgYGNhbWVGcm9tYCB2YXJpYWJsZSBpcyBhY2Nlc3NlZCBieSBib3RoIHNlYXJjaGVzLCBzbyB0aGF0IHdlIGNhbiBzdG9yZSBwYXJlbnRzLlxuICAgIHZhciBjYW1lRnJvbTtcblxuICAgIC8vIHRoaXMgaXMgdGhlIG1haW4gYWxnb3JpdGhtIGxvb3A6XG4gICAgd2hpbGUgKG9wZW4yU2V0Lmxlbmd0aCAmJiBvcGVuMVNldC5sZW5ndGgpIHtcbiAgICAgIGlmIChvcGVuMVNldC5sZW5ndGggPCBvcGVuMlNldC5sZW5ndGgpIHtcbiAgICAgICAgZm9yd2FyZFNlYXJjaCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV2ZXJzZVNlYXJjaCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAocXVpdEZhc3QgJiYgbWluTm9kZSkgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZ290IGhlcmUsIHRoZW4gdGhlcmUgaXMgbm8gcGF0aC5cbiAgICB2YXIgcGF0aCA9IHJlY29uc3RydWN0UGF0aChtaW5Ob2RlKTtcbiAgICByZXR1cm4gcGF0aDsgLy8gdGhlIHB1YmxpYyBBUEkgaXMgb3ZlclxuXG4gICAgZnVuY3Rpb24gZm9yd2FyZFNlYXJjaCgpIHtcbiAgICAgIGNhbWVGcm9tID0gb3BlbjFTZXQucG9wKCk7XG4gICAgICBpZiAoY2FtZUZyb20uY2xvc2VkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY2FtZUZyb20uY2xvc2VkID0gdHJ1ZTtcblxuICAgICAgaWYgKGNhbWVGcm9tLmYxIDwgbE1pbiAmJiAoY2FtZUZyb20uZzEgKyBmMiAtIGhldXJpc3RpYyhmcm9tLCBjYW1lRnJvbS5ub2RlKSkgPCBsTWluKSB7XG4gICAgICAgIGdyYXBoLmZvckVhY2hMaW5rZWROb2RlKGNhbWVGcm9tLm5vZGUuaWQsIGZvcndhcmRWaXNpdG9yKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wZW4xU2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgZjEgPSBvcGVuMVNldC5wZWVrKCkuZjE7XG4gICAgICB9IFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJldmVyc2VTZWFyY2goKSB7XG4gICAgICBjYW1lRnJvbSA9IG9wZW4yU2V0LnBvcCgpO1xuICAgICAgaWYgKGNhbWVGcm9tLmNsb3NlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjYW1lRnJvbS5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICBpZiAoY2FtZUZyb20uZjIgPCBsTWluICYmIChjYW1lRnJvbS5nMiArIGYxIC0gaGV1cmlzdGljKGNhbWVGcm9tLm5vZGUsIHRvKSkgPCBsTWluKSB7XG4gICAgICAgIGdyYXBoLmZvckVhY2hMaW5rZWROb2RlKGNhbWVGcm9tLm5vZGUuaWQsIHJldmVyc2VWaXNpdG9yKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wZW4yU2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgZjIgPSBvcGVuMlNldC5wZWVrKCkuZjI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmlzaXROMShvdGhlck5vZGUsIGxpbmspIHtcbiAgICAgIHZhciBvdGhlclNlYXJjaFN0YXRlID0gbm9kZVN0YXRlLmdldChvdGhlck5vZGUuaWQpO1xuICAgICAgaWYgKCFvdGhlclNlYXJjaFN0YXRlKSB7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUgPSBwb29sLmNyZWF0ZU5ld1N0YXRlKG90aGVyTm9kZSk7XG4gICAgICAgIG5vZGVTdGF0ZS5zZXQob3RoZXJOb2RlLmlkLCBvdGhlclNlYXJjaFN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG90aGVyU2VhcmNoU3RhdGUuY2xvc2VkKSByZXR1cm47XG5cbiAgICAgIHZhciB0ZW50YXRpdmVEaXN0YW5jZSA9IGNhbWVGcm9tLmcxICsgZGlzdGFuY2UoY2FtZUZyb20ubm9kZSwgb3RoZXJOb2RlLCBsaW5rKTtcblxuICAgICAgaWYgKHRlbnRhdGl2ZURpc3RhbmNlIDwgb3RoZXJTZWFyY2hTdGF0ZS5nMSkge1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlLmcxID0gdGVudGF0aXZlRGlzdGFuY2U7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUuZjEgPSB0ZW50YXRpdmVEaXN0YW5jZSArIGhldXJpc3RpYyhvdGhlclNlYXJjaFN0YXRlLm5vZGUsIHRvKTtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5wMSA9IGNhbWVGcm9tO1xuICAgICAgICBpZiAob3RoZXJTZWFyY2hTdGF0ZS5oMSA8IDApIHtcbiAgICAgICAgICBvcGVuMVNldC5wdXNoKG90aGVyU2VhcmNoU3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9wZW4xU2V0LnVwZGF0ZUl0ZW0ob3RoZXJTZWFyY2hTdGF0ZS5oMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBwb3RlbnRpYWxNaW4gPSBvdGhlclNlYXJjaFN0YXRlLmcxICsgb3RoZXJTZWFyY2hTdGF0ZS5nMjtcbiAgICAgIGlmIChwb3RlbnRpYWxNaW4gPCBsTWluKSB7IFxuICAgICAgICBsTWluID0gcG90ZW50aWFsTWluO1xuICAgICAgICBtaW5Ob2RlID0gb3RoZXJTZWFyY2hTdGF0ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2aXNpdE4yKG90aGVyTm9kZSwgbGluaykge1xuICAgICAgdmFyIG90aGVyU2VhcmNoU3RhdGUgPSBub2RlU3RhdGUuZ2V0KG90aGVyTm9kZS5pZCk7XG4gICAgICBpZiAoIW90aGVyU2VhcmNoU3RhdGUpIHtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZSA9IHBvb2wuY3JlYXRlTmV3U3RhdGUob3RoZXJOb2RlKTtcbiAgICAgICAgbm9kZVN0YXRlLnNldChvdGhlck5vZGUuaWQsIG90aGVyU2VhcmNoU3RhdGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3RoZXJTZWFyY2hTdGF0ZS5jbG9zZWQpIHJldHVybjtcblxuICAgICAgdmFyIHRlbnRhdGl2ZURpc3RhbmNlID0gY2FtZUZyb20uZzIgKyBkaXN0YW5jZShjYW1lRnJvbS5ub2RlLCBvdGhlck5vZGUsIGxpbmspO1xuXG4gICAgICBpZiAodGVudGF0aXZlRGlzdGFuY2UgPCBvdGhlclNlYXJjaFN0YXRlLmcyKSB7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUuZzIgPSB0ZW50YXRpdmVEaXN0YW5jZTtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5mMiA9IHRlbnRhdGl2ZURpc3RhbmNlICsgaGV1cmlzdGljKGZyb20sIG90aGVyU2VhcmNoU3RhdGUubm9kZSk7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUucDIgPSBjYW1lRnJvbTtcbiAgICAgICAgaWYgKG90aGVyU2VhcmNoU3RhdGUuaDIgPCAwKSB7XG4gICAgICAgICAgb3BlbjJTZXQucHVzaChvdGhlclNlYXJjaFN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvcGVuMlNldC51cGRhdGVJdGVtKG90aGVyU2VhcmNoU3RhdGUuaDIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgcG90ZW50aWFsTWluID0gb3RoZXJTZWFyY2hTdGF0ZS5nMSArIG90aGVyU2VhcmNoU3RhdGUuZzI7XG4gICAgICBpZiAocG90ZW50aWFsTWluIDwgbE1pbikge1xuICAgICAgICBsTWluID0gcG90ZW50aWFsTWluO1xuICAgICAgICBtaW5Ob2RlID0gb3RoZXJTZWFyY2hTdGF0ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2aXNpdE4yT3JpZW50ZWQob3RoZXJOb2RlLCBsaW5rKSB7XG4gICAgICAvLyB3ZSBhcmUgZ29pbmcgYmFja3dhcmRzLCBncmFwaCBuZWVkcyB0byBiZSByZXZlcnNlZC4gXG4gICAgICBpZiAobGluay50b0lkID09PSBjYW1lRnJvbS5ub2RlLmlkKSByZXR1cm4gdmlzaXROMihvdGhlck5vZGUsIGxpbmspO1xuICAgIH1cbiAgICBmdW5jdGlvbiB2aXNpdE4xT3JpZW50ZWQob3RoZXJOb2RlLCBsaW5rKSB7XG4gICAgICAvLyB0aGlzIGlzIGZvcndhcmQgZGlyZWN0aW9uLCBzbyB3ZSBzaG91bGQgYmUgY29taW5nIEZST006XG4gICAgICBpZiAobGluay5mcm9tSWQgPT09IGNhbWVGcm9tLm5vZGUuaWQpIHJldHVybiB2aXNpdE4xKG90aGVyTm9kZSwgbGluayk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlY29uc3RydWN0UGF0aChzZWFyY2hTdGF0ZSkge1xuICBpZiAoIXNlYXJjaFN0YXRlKSByZXR1cm4gTk9fUEFUSDtcblxuICB2YXIgcGF0aCA9IFtzZWFyY2hTdGF0ZS5ub2RlXTtcbiAgdmFyIHBhcmVudCA9IHNlYXJjaFN0YXRlLnAxO1xuXG4gIHdoaWxlIChwYXJlbnQpIHtcbiAgICBwYXRoLnB1c2gocGFyZW50Lm5vZGUpO1xuICAgIHBhcmVudCA9IHBhcmVudC5wMTtcbiAgfVxuXG4gIHZhciBjaGlsZCA9IHNlYXJjaFN0YXRlLnAyO1xuXG4gIHdoaWxlIChjaGlsZCkge1xuICAgIHBhdGgudW5zaGlmdChjaGlsZC5ub2RlKTtcbiAgICBjaGlsZCA9IGNoaWxkLnAyO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBtYWtlTkJBU2VhcmNoU3RhdGVQb29sO1xuXG4vKipcbiAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIE5CQVNlYXJjaFN0YXRlLiBUaGUgaW5zdGFuY2Ugc3RvcmVzIGluZm9ybWF0aW9uXG4gKiBhYm91dCBzZWFyY2ggc3RhdGUsIGFuZCBpcyB1c2VkIGJ5IE5CQSogYWxnb3JpdGhtLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBub2RlIC0gb3JpZ2luYWwgZ3JhcGggbm9kZVxuICovXG5mdW5jdGlvbiBOQkFTZWFyY2hTdGF0ZShub2RlKSB7XG4gIC8qKlxuICAgKiBPcmlnaW5hbCBncmFwaCBub2RlLlxuICAgKi9cbiAgdGhpcy5ub2RlID0gbm9kZTtcblxuICAvKipcbiAgICogUGFyZW50IG9mIHRoaXMgbm9kZSBpbiBmb3J3YXJkIHNlYXJjaFxuICAgKi9cbiAgdGhpcy5wMSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFBhcmVudCBvZiB0aGlzIG5vZGUgaW4gcmV2ZXJzZSBzZWFyY2hcbiAgICovXG4gIHRoaXMucDIgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBJZiB0aGlzIGlzIHNldCB0byB0cnVlLCB0aGVuIHRoZSBub2RlIHdhcyBhbHJlYWR5IHByb2Nlc3NlZFxuICAgKiBhbmQgd2Ugc2hvdWxkIG5vdCB0b3VjaCBpdCBhbnltb3JlLlxuICAgKi9cbiAgdGhpcy5jbG9zZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogQWN0dWFsIGRpc3RhbmNlIGZyb20gdGhpcyBub2RlIHRvIGl0cyBwYXJlbnQgaW4gZm9yd2FyZCBzZWFyY2hcbiAgICovXG4gIHRoaXMuZzEgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbiAgLyoqXG4gICAqIEFjdHVhbCBkaXN0YW5jZSBmcm9tIHRoaXMgbm9kZSB0byBpdHMgcGFyZW50IGluIHJldmVyc2Ugc2VhcmNoXG4gICAqL1xuICB0aGlzLmcyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG5cbiAgLyoqXG4gICAqIFVuZGVyZXN0aW1hdGVkIGRpc3RhbmNlIGZyb20gdGhpcyBub2RlIHRvIHRoZSBwYXRoLWZpbmRpbmcgc291cmNlLlxuICAgKi9cbiAgdGhpcy5mMSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuICAvKipcbiAgICogVW5kZXJlc3RpbWF0ZWQgZGlzdGFuY2UgZnJvbSB0aGlzIG5vZGUgdG8gdGhlIHBhdGgtZmluZGluZyB0YXJnZXQuXG4gICAqL1xuICB0aGlzLmYyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gIC8vIHVzZWQgdG8gcmVjb25zdHJ1Y3QgaGVhcCB3aGVuIGZTY29yZSBpcyB1cGRhdGVkLiBUT0RPOiBkbyBJIG5lZWQgdGhlbSBib3RoP1xuXG4gIC8qKlxuICAgKiBJbmRleCBvZiB0aGlzIG5vZGUgaW4gdGhlIGZvcndhcmQgaGVhcC5cbiAgICovXG4gIHRoaXMuaDEgPSAtMTtcblxuICAvKipcbiAgICogSW5kZXggb2YgdGhpcyBub2RlIGluIHRoZSByZXZlcnNlIGhlYXAuXG4gICAqL1xuICB0aGlzLmgyID0gLTE7XG59XG5cbi8qKlxuICogQXMgcGF0aC1maW5kaW5nIGlzIG1lbW9yeS1pbnRlbnNpdmUgcHJvY2Vzcywgd2Ugd2FudCB0byByZWR1Y2UgcHJlc3N1cmUgb25cbiAqIGdhcmJhZ2UgY29sbGVjdG9yLiBUaGlzIGNsYXNzIGhlbHBzIHVzIHRvIHJlY3ljbGUgcGF0aC1maW5kaW5nIG5vZGVzIGFuZCBzaWduaWZpY2FudGx5XG4gKiByZWR1Y2VzIHRoZSBzZWFyY2ggdGltZSAofjIwJSBmYXN0ZXIgdGhhbiB3aXRob3V0IGl0KS5cbiAqL1xuZnVuY3Rpb24gbWFrZU5CQVNlYXJjaFN0YXRlUG9vbCgpIHtcbiAgdmFyIGN1cnJlbnRJbkNhY2hlID0gMDtcbiAgdmFyIG5vZGVDYWNoZSA9IFtdO1xuXG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBOQkFTZWFyY2hTdGF0ZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGNyZWF0ZU5ld1N0YXRlOiBjcmVhdGVOZXdTdGF0ZSxcblxuICAgIC8qKlxuICAgICAqIE1hcmtzIGFsbCBjcmVhdGVkIGluc3RhbmNlcyBhdmFpbGFibGUgZm9yIHJlY3ljbGluZy5cbiAgICAgKi9cbiAgICByZXNldDogcmVzZXRcbiAgfTtcblxuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBjdXJyZW50SW5DYWNoZSA9IDA7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVOZXdTdGF0ZShub2RlKSB7XG4gICAgdmFyIGNhY2hlZCA9IG5vZGVDYWNoZVtjdXJyZW50SW5DYWNoZV07XG4gICAgaWYgKGNhY2hlZCkge1xuICAgICAgLy8gVE9ETzogVGhpcyBhbG1vc3QgZHVwbGljYXRlcyBjb25zdHJ1Y3RvciBjb2RlLiBOb3Qgc3VyZSBpZlxuICAgICAgLy8gaXQgd291bGQgaW1wYWN0IHBlcmZvcm1hbmNlIGlmIEkgbW92ZSB0aGlzIGNvZGUgaW50byBhIGZ1bmN0aW9uXG4gICAgICBjYWNoZWQubm9kZSA9IG5vZGU7XG5cbiAgICAgIC8vIEhvdyB3ZSBjYW1lIHRvIHRoaXMgbm9kZT9cbiAgICAgIGNhY2hlZC5wMSA9IG51bGw7XG4gICAgICBjYWNoZWQucDIgPSBudWxsO1xuXG4gICAgICBjYWNoZWQuY2xvc2VkID0gZmFsc2U7XG5cbiAgICAgIGNhY2hlZC5nMSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgIGNhY2hlZC5nMiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgIGNhY2hlZC5mMSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgIGNhY2hlZC5mMiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuICAgICAgLy8gdXNlZCB0byByZWNvbnN0cnVjdCBoZWFwIHdoZW4gZlNjb3JlIGlzIHVwZGF0ZWQuXG4gICAgICBjYWNoZWQuaDEgPSAtMTtcbiAgICAgIGNhY2hlZC5oMiA9IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWNoZWQgPSBuZXcgTkJBU2VhcmNoU3RhdGUobm9kZSk7XG4gICAgICBub2RlQ2FjaGVbY3VycmVudEluQ2FjaGVdID0gY2FjaGVkO1xuICAgIH1cbiAgICBjdXJyZW50SW5DYWNoZSsrO1xuICAgIHJldHVybiBjYWNoZWQ7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBhU3RhcjogcmVxdWlyZSgnLi9hLXN0YXIvYS1zdGFyLmpzJyksXG4gIGFHcmVlZHk6IHJlcXVpcmUoJy4vYS1zdGFyL2EtZ3JlZWR5LXN0YXInKSxcbiAgbmJhOiByZXF1aXJlKCcuL2Etc3Rhci9uYmEvaW5kZXguanMnKSxcbn1cbiIsImltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuL2xpYi9BcHBsaWNhdGlvbidcbmltcG9ydCBMb2FkaW5nU2NlbmUgZnJvbSAnLi9zY2VuZXMvTG9hZGluZ1NjZW5lJ1xuXG4vLyBDcmVhdGUgYSBQaXhpIEFwcGxpY2F0aW9uXG5sZXQgYXBwID0gbmV3IEFwcGxpY2F0aW9uKHtcbiAgd2lkdGg6IDI1NixcbiAgaGVpZ2h0OiAyNTYsXG4gIHJvdW5kUGl4ZWxzOiB0cnVlLFxuICBhdXRvUmVzaXplOiB0cnVlLFxuICByZXNvbHV0aW9uOiAxLFxuICBhdXRvU3RhcnQ6IGZhbHNlXG59KVxuXG5hcHAucmVuZGVyZXIudmlldy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5hcHAucmVuZGVyZXIucmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG5cbi8vIEFkZCB0aGUgY2FudmFzIHRoYXQgUGl4aSBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgZm9yIHlvdSB0byB0aGUgSFRNTCBkb2N1bWVudFxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcHAudmlldylcblxuYXBwLmNoYW5nZVN0YWdlKClcbmFwcC5zdGFydCgpXG5hcHAuY2hhbmdlU2NlbmUoTG9hZGluZ1NjZW5lKVxuIiwiZXhwb3J0IGNvbnN0IElTX01PQklMRSA9ICgoYSkgPT4gLyhhbmRyb2lkfGJiXFxkK3xtZWVnbykuK21vYmlsZXxhdmFudGdvfGJhZGFcXC98YmxhY2tiZXJyeXxibGF6ZXJ8Y29tcGFsfGVsYWluZXxmZW5uZWN8aGlwdG9wfGllbW9iaWxlfGlwKGhvbmV8b2QpfGlyaXN8a2luZGxlfGxnZSB8bWFlbW98bWlkcHxtbXB8bW9iaWxlLitmaXJlZm94fG5ldGZyb250fG9wZXJhIG0ob2J8aW4paXxwYWxtKCBvcyk/fHBob25lfHAoaXhpfHJlKVxcL3xwbHVja2VyfHBvY2tldHxwc3B8c2VyaWVzKDR8NikwfHN5bWJpYW58dHJlb3x1cFxcLihicm93c2VyfGxpbmspfHZvZGFmb25lfHdhcHx3aW5kb3dzIGNlfHhkYXx4aWluby9pLnRlc3QoYSkgfHxcbiAgLzEyMDd8NjMxMHw2NTkwfDNnc298NHRocHw1MFsxLTZdaXw3NzBzfDgwMnN8YSB3YXxhYmFjfGFjKGVyfG9vfHMtKXxhaShrb3xybil8YWwoYXZ8Y2F8Y28pfGFtb2l8YW4oZXh8bnl8eXcpfGFwdHV8YXIoY2h8Z28pfGFzKHRlfHVzKXxhdHR3fGF1KGRpfC1tfHIgfHMgKXxhdmFufGJlKGNrfGxsfG5xKXxiaShsYnxyZCl8YmwoYWN8YXopfGJyKGV8dil3fGJ1bWJ8YnctKG58dSl8YzU1XFwvfGNhcGl8Y2N3YXxjZG0tfGNlbGx8Y2h0bXxjbGRjfGNtZC18Y28obXB8bmQpfGNyYXd8ZGEoaXR8bGx8bmcpfGRidGV8ZGMtc3xkZXZpfGRpY2F8ZG1vYnxkbyhjfHApb3xkcygxMnwtZCl8ZWwoNDl8YWkpfGVtKGwyfHVsKXxlcihpY3xrMCl8ZXNsOHxleihbNC03XTB8b3N8d2F8emUpfGZldGN8Zmx5KC18Xyl8ZzEgdXxnNTYwfGdlbmV8Z2YtNXxnLW1vfGdvKFxcLnd8b2QpfGdyKGFkfHVuKXxoYWllfGhjaXR8aGQtKG18cHx0KXxoZWktfGhpKHB0fHRhKXxocCggaXxpcCl8aHMtY3xodChjKC18IHxffGF8Z3xwfHN8dCl8dHApfGh1KGF3fHRjKXxpLSgyMHxnb3xtYSl8aTIzMHxpYWMoIHwtfFxcLyl8aWJyb3xpZGVhfGlnMDF8aWtvbXxpbTFrfGlubm98aXBhcXxpcmlzfGphKHR8dilhfGpicm98amVtdXxqaWdzfGtkZGl8a2VqaXxrZ3QoIHxcXC8pfGtsb258a3B0IHxrd2MtfGt5byhjfGspfGxlKG5vfHhpKXxsZyggZ3xcXC8oa3xsfHUpfDUwfDU0fC1bYS13XSl8bGlid3xseW54fG0xLXd8bTNnYXxtNTBcXC98bWEodGV8dWl8eG8pfG1jKDAxfDIxfGNhKXxtLWNyfG1lKHJjfHJpKXxtaShvOHxvYXx0cyl8bW1lZnxtbygwMXwwMnxiaXxkZXxkb3x0KC18IHxvfHYpfHp6KXxtdCg1MHxwMXx2ICl8bXdicHxteXdhfG4xMFswLTJdfG4yMFsyLTNdfG4zMCgwfDIpfG41MCgwfDJ8NSl8bjcoMCgwfDEpfDEwKXxuZSgoY3xtKS18b258dGZ8d2Z8d2d8d3QpfG5vayg2fGkpfG56cGh8bzJpbXxvcCh0aXx3dil8b3Jhbnxvd2cxfHA4MDB8cGFuKGF8ZHx0KXxwZHhnfHBnKDEzfC0oWzEtOF18YykpfHBoaWx8cGlyZXxwbChheXx1Yyl8cG4tMnxwbyhja3xydHxzZSl8cHJveHxwc2lvfHB0LWd8cWEtYXxxYygwN3wxMnwyMXwzMnw2MHwtWzItN118aS0pfHF0ZWt8cjM4MHxyNjAwfHJha3N8cmltOXxybyh2ZXx6byl8czU1XFwvfHNhKGdlfG1hfG1tfG1zfG55fHZhKXxzYygwMXxoLXxvb3xwLSl8c2RrXFwvfHNlKGMoLXwwfDEpfDQ3fG1jfG5kfHJpKXxzZ2gtfHNoYXJ8c2llKC18bSl8c2stMHxzbCg0NXxpZCl8c20oYWx8YXJ8YjN8aXR8dDUpfHNvKGZ0fG55KXxzcCgwMXxoLXx2LXx2ICl8c3koMDF8bWIpfHQyKDE4fDUwKXx0NigwMHwxMHwxOCl8dGEoZ3R8bGspfHRjbC18dGRnLXx0ZWwoaXxtKXx0aW0tfHQtbW98dG8ocGx8c2gpfHRzKDcwfG0tfG0zfG01KXx0eC05fHVwKFxcLmJ8ZzF8c2kpfHV0c3R8djQwMHx2NzUwfHZlcml8dmkocmd8dGUpfHZrKDQwfDVbMC0zXXwtdil8dm00MHx2b2RhfHZ1bGN8dngoNTJ8NTN8NjB8NjF8NzB8ODB8ODF8ODN8ODV8OTgpfHczYygtfCApfHdlYmN8d2hpdHx3aShnIHxuY3xudyl8d21sYnx3b251fHg3MDB8eWFzLXx5b3VyfHpldG98enRlLS9pLnRlc3QoYS5zdWJzdHIoMCwgNCkpXG4pKG5hdmlnYXRvci51c2VyQWdlbnQgfHwgbmF2aWdhdG9yLnZlbmRvciB8fCB3aW5kb3cub3BlcmEpXG5cbmV4cG9ydCBjb25zdCBDRUlMX1NJWkUgPSAzMlxuXG5leHBvcnQgY29uc3QgQUJJTElUWV9NT1ZFID0gU3ltYm9sKCdtb3ZlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0NBTUVSQSA9IFN5bWJvbCgnY2FtZXJhJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX09QRVJBVEUgPSBTeW1ib2woJ29wZXJhdGUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfS0VZX01PVkUgPSBTeW1ib2woJ2tleS1tb3ZlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0hFQUxUSCA9IFN5bWJvbCgnaGVhbHRoJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0NBUlJZID0gU3ltYm9sKCdjYXJyeScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9MRUFSTiA9IFN5bWJvbCgnbGVhcm4nKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfUExBQ0UgPSBTeW1ib2woJ3BsYWNlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0tFWV9QTEFDRSA9IFN5bWJvbCgna2V5LXBsYWNlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0tFWV9GSVJFID0gU3ltYm9sKCdmaXJlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX1JPVEFURSA9IFN5bWJvbCgncm90YXRlJylcbmV4cG9ydCBjb25zdCBBQklMSVRJRVNfQUxMID0gW1xuICBBQklMSVRZX01PVkUsXG4gIEFCSUxJVFlfQ0FNRVJBLFxuICBBQklMSVRZX09QRVJBVEUsXG4gIEFCSUxJVFlfS0VZX01PVkUsXG4gIEFCSUxJVFlfSEVBTFRILFxuICBBQklMSVRZX0NBUlJZLFxuICBBQklMSVRZX0xFQVJOLFxuICBBQklMSVRZX1BMQUNFLFxuICBBQklMSVRZX0tFWV9QTEFDRSxcbiAgQUJJTElUWV9LRVlfRklSRSxcbiAgQUJJTElUWV9ST1RBVEVcbl1cblxuLy8gb2JqZWN0IHR5cGUsIHN0YXRpYyBvYmplY3QsIG5vdCBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFUSUMgPSAnc3RhdGljJ1xuLy8gY29sbGlkZSB3aXRoXG5leHBvcnQgY29uc3QgU1RBWSA9ICdzdGF5J1xuLy8gdG91Y2ggd2lsbCByZXBseVxuZXhwb3J0IGNvbnN0IFJFUExZID0gJ3JlcGx5J1xuIiwiZXhwb3J0IGNvbnN0IExFRlQgPSAnYSdcbmV4cG9ydCBjb25zdCBVUCA9ICd3J1xuZXhwb3J0IGNvbnN0IFJJR0hUID0gJ2QnXG5leHBvcnQgY29uc3QgRE9XTiA9ICdzJ1xuZXhwb3J0IGNvbnN0IFBMQUNFMSA9ICcxJ1xuZXhwb3J0IGNvbnN0IFBMQUNFMiA9ICcyJ1xuZXhwb3J0IGNvbnN0IFBMQUNFMyA9ICczJ1xuZXhwb3J0IGNvbnN0IFBMQUNFNCA9ICc0J1xuZXhwb3J0IGNvbnN0IEZJUkUgPSAnZidcbiIsImltcG9ydCB7IEFwcGxpY2F0aW9uIGFzIFBpeGlBcHBsaWNhdGlvbiwgR3JhcGhpY3MsIGRpc3BsYXkgfSBmcm9tICcuL1BJWEknXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgUGl4aUFwcGxpY2F0aW9uIHtcbiAgY2hhbmdlU3RhZ2UgKCkge1xuICAgIHRoaXMuc3RhZ2UgPSBuZXcgZGlzcGxheS5TdGFnZSgpXG4gIH1cblxuICBjaGFuZ2VTY2VuZSAoU2NlbmVOYW1lLCBwYXJhbXMpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50U2NlbmUpIHtcbiAgICAgIC8vIG1heWJlIHVzZSBwcm9taXNlIGZvciBhbmltYXRpb25cbiAgICAgIC8vIHJlbW92ZSBnYW1lbG9vcD9cbiAgICAgIHRoaXMuY3VycmVudFNjZW5lLmRlc3Ryb3koKVxuICAgICAgdGhpcy5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLmN1cnJlbnRTY2VuZSlcbiAgICB9XG5cbiAgICBsZXQgc2NlbmUgPSBuZXcgU2NlbmVOYW1lKHBhcmFtcylcbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKHNjZW5lKVxuICAgIHNjZW5lLmNyZWF0ZSgpXG4gICAgc2NlbmUub24oJ2NoYW5nZVNjZW5lJywgdGhpcy5jaGFuZ2VTY2VuZS5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5jdXJyZW50U2NlbmUgPSBzY2VuZVxuICB9XG5cbiAgc3RhcnQgKC4uLmFyZ3MpIHtcbiAgICBzdXBlci5zdGFydCguLi5hcmdzKVxuXG4gICAgLy8gY3JlYXRlIGEgYmFja2dyb3VuZCBtYWtlIHN0YWdlIGhhcyB3aWR0aCAmIGhlaWdodFxuICAgIGxldCB2aWV3ID0gdGhpcy5yZW5kZXJlci52aWV3XG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChcbiAgICAgIG5ldyBHcmFwaGljcygpLmRyYXdSZWN0KDAsIDAsIHZpZXcud2lkdGgsIHZpZXcuaGVpZ2h0KVxuICAgIClcblxuICAgIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgICB0aGlzLnRpY2tlci5hZGQoZGVsdGEgPT4gdGhpcy5nYW1lTG9vcC5iaW5kKHRoaXMpKGRlbHRhKSlcbiAgfVxuXG4gIGdhbWVMb29wIChkZWx0YSkge1xuICAgIC8vIFVwZGF0ZSB0aGUgY3VycmVudCBnYW1lIHN0YXRlOlxuICAgIHRoaXMuY3VycmVudFNjZW5lLnRpY2soZGVsdGEpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwbGljYXRpb25cbiIsIi8qIGdsb2JhbCBQSVhJLCBCdW1wICovXG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBCdW1wKFBJWEkpXG4iLCJpbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNvbnN0IG8gPSB7XHJcbiAgZ2V0ICh0YXJnZXQsIHByb3BlcnR5KSB7XHJcbiAgICAvLyBoYXMgU1RBWSBvYmplY3Qgd2lsbCByZXR1cm4gMSwgb3RoZXJ3aXNlIDBcclxuICAgIGlmIChwcm9wZXJ0eSA9PT0gJ3dlaWdodCcpIHtcclxuICAgICAgcmV0dXJuIHRhcmdldC5zb21lKG8gPT4gby50eXBlID09PSBTVEFZKSA/IDEgOiAwXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGFyZ2V0W3Byb3BlcnR5XVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgR2FtZU9iamVjdHMge1xyXG4gIGNvbnN0cnVjdG9yICguLi5pdGVtcykge1xyXG4gICAgcmV0dXJuIG5ldyBQcm94eShbLi4uaXRlbXNdLCBvKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgR2FtZU9iamVjdHNcclxuIiwiaW1wb3J0IHsgR3JhcGhpY3MgfSBmcm9tICcuL1BJWEknXG5pbXBvcnQgeyBDRUlMX1NJWkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jb25zdCBMSUdIVCA9IFN5bWJvbCgnbGlnaHQnKVxuXG5jbGFzcyBMaWdodCB7XG4gIHN0YXRpYyBsaWdodE9uICh0YXJnZXQsIHJhZGl1cywgcmFuZCA9IDEpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGFyZ2V0LnBhcmVudFxuICAgIGlmICghY29udGFpbmVyLmxpZ2h0aW5nKSB7XG4gICAgICAvLyBjb250YWluZXIgZG9lcyBOT1QgaGFzIGxpZ2h0aW5nIHByb3BlcnR5XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIGxpZ2h0YnVsYiA9IG5ldyBHcmFwaGljcygpXG4gICAgdmFyIHJyID0gMHhmZlxuICAgIHZhciByZyA9IDB4ZmZcbiAgICB2YXIgcmIgPSAweGZmXG4gICAgdmFyIHJhZCA9IHJhZGl1cyAqIENFSUxfU0laRVxuXG4gICAgbGV0IHggPSB0YXJnZXQud2lkdGggLyAyIC8gdGFyZ2V0LnNjYWxlLnhcbiAgICBsZXQgeSA9IHRhcmdldC5oZWlnaHQgLyAyIC8gdGFyZ2V0LnNjYWxlLnlcbiAgICBsaWdodGJ1bGIuYmVnaW5GaWxsKChyciA8PCAxNikgKyAocmcgPDwgOCkgKyByYiwgMS4wKVxuICAgIGxpZ2h0YnVsYi5kcmF3Q2lyY2xlKHgsIHksIHJhZClcbiAgICBsaWdodGJ1bGIuZW5kRmlsbCgpXG4gICAgbGlnaHRidWxiLnBhcmVudExheWVyID0gY29udGFpbmVyLmxpZ2h0aW5nIC8vIG11c3QgaGFzIHByb3BlcnR5OiBsaWdodGluZ1xuXG4gICAgdGFyZ2V0W0xJR0hUXSA9IHtcbiAgICAgIGxpZ2h0OiBsaWdodGJ1bGJcbiAgICB9XG4gICAgdGFyZ2V0LmFkZENoaWxkKGxpZ2h0YnVsYilcblxuICAgIGlmIChyYW5kICE9PSAxKSB7XG4gICAgICBsZXQgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGxldCBkU2NhbGUgPSBNYXRoLnJhbmRvbSgpICogKDEgLSByYW5kKVxuICAgICAgICBpZiAobGlnaHRidWxiLnNjYWxlLnggPiAxKSB7XG4gICAgICAgICAgZFNjYWxlID0gLWRTY2FsZVxuICAgICAgICB9XG4gICAgICAgIGxpZ2h0YnVsYi5zY2FsZS54ICs9IGRTY2FsZVxuICAgICAgICBsaWdodGJ1bGIuc2NhbGUueSArPSBkU2NhbGVcbiAgICAgICAgbGlnaHRidWxiLmFscGhhICs9IGRTY2FsZVxuICAgICAgfSwgMTAwMCAvIDEyKVxuICAgICAgdGFyZ2V0W0xJR0hUXS5pbnRlcnZhbCA9IGludGVydmFsXG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGxpZ2h0T2ZmICh0YXJnZXQpIHtcbiAgICBpZiAoIXRhcmdldFtMSUdIVF0pIHtcbiAgICAgIC8vIG5vIGxpZ2h0IHRvIHJlbW92ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIHJlbW92ZSBsaWdodFxuICAgIHRhcmdldC5yZW1vdmVDaGlsZCh0YXJnZXRbTElHSFRdLmxpZ2h0KVxuICAgIC8vIHJlbW92ZSBpbnRlcnZhbFxuICAgIGNsZWFySW50ZXJ2YWwodGFyZ2V0W0xJR0hUXS5pbnRlcnZhbClcbiAgICBkZWxldGUgdGFyZ2V0W0xJR0hUXVxuICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgIHRhcmdldC5vZmYoJ3JlbW92ZWQnLCBMaWdodC5saWdodE9mZilcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaWdodFxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBkaXNwbGF5LCBCTEVORF9NT0RFUywgU3ByaXRlIH0gZnJvbSAnLi9QSVhJJ1xyXG5cclxuaW1wb3J0IHsgU1RBWSwgU1RBVElDLCBSRVBMWSwgQ0VJTF9TSVpFLCBBQklMSVRZX01PVkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBpbnN0YW5jZUJ5SXRlbUlkIH0gZnJvbSAnLi91dGlscydcclxuaW1wb3J0IE1hcEdyYXBoIGZyb20gJy4vTWFwR3JhcGgnXHJcbmltcG9ydCBidW1wIGZyb20gJy4uL2xpYi9CdW1wJ1xyXG5cclxuY29uc3QgcGlwZSA9IChmaXJzdCwgLi4ubW9yZSkgPT5cclxuICBtb3JlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiAoLi4uYXJncykgPT4gY3VycihhY2MoLi4uYXJncykpLCBmaXJzdClcclxuXHJcbmNvbnN0IG9iamVjdEV2ZW50ID0ge1xyXG4gIHBsYWNlIChvYmplY3QsIHBsYWNlZCkge1xyXG4gICAgbGV0IHBvc2l0aW9uID0gb2JqZWN0LnBvc2l0aW9uXHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QocGxhY2VkLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KVxyXG4gIH0sXHJcbiAgZmlyZSAob2JqZWN0LCBidWxsZXQpIHtcclxuICAgIHRoaXMuYWRkR2FtZU9iamVjdChidWxsZXQpXHJcbiAgfSxcclxuICBkaWUgKCkge1xyXG4gICAgY29uc29sZS5sb2coJ1lvdSBkaWUuJylcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBldmVudHM6XHJcbiAqICB1c2U6IG9iamVjdFxyXG4gKi9cclxuY2xhc3MgTWFwIGV4dGVuZHMgQ29udGFpbmVyIHtcclxuICBjb25zdHJ1Y3RvciAoc2NhbGUgPSAxKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmNlaWxTaXplID0gc2NhbGUgKiBDRUlMX1NJWkVcclxuICAgIHRoaXMubWFwU2NhbGUgPSBzY2FsZVxyXG5cclxuICAgIHRoaXMub2JqZWN0cyA9IHtcclxuICAgICAgW1NUQVRJQ106IFtdLFxyXG4gICAgICBbU1RBWV06IFtdLFxyXG4gICAgICBbUkVQTFldOiBbXVxyXG4gICAgfVxyXG4gICAgdGhpcy5tYXAgPSBuZXcgQ29udGFpbmVyKClcclxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5tYXApXHJcblxyXG4gICAgLy8gcGxheWVyIGdyb3VwXHJcbiAgICB0aGlzLnBsYXllckdyb3VwID0gbmV3IGRpc3BsYXkuR3JvdXAoKVxyXG4gICAgbGV0IHBsYXllckxheWVyID0gbmV3IGRpc3BsYXkuTGF5ZXIodGhpcy5wbGF5ZXJHcm91cClcclxuICAgIHRoaXMuYWRkQ2hpbGQocGxheWVyTGF5ZXIpXHJcbiAgICB0aGlzLm1hcEdyYXBoID0gbmV3IE1hcEdyYXBoKClcclxuICB9XHJcblxyXG4gIGVuYWJsZUZvZyAoKSB7XHJcbiAgICBsZXQgbGlnaHRpbmcgPSBuZXcgZGlzcGxheS5MYXllcigpXHJcbiAgICBsaWdodGluZy5vbignZGlzcGxheScsIGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgIGVsZW1lbnQuYmxlbmRNb2RlID0gQkxFTkRfTU9ERVMuQUREXHJcbiAgICB9KVxyXG4gICAgbGlnaHRpbmcudXNlUmVuZGVyVGV4dHVyZSA9IHRydWVcclxuICAgIGxpZ2h0aW5nLmNsZWFyQ29sb3IgPSBbMCwgMCwgMCwgMV0gLy8gYW1iaWVudCBncmF5XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZChsaWdodGluZylcclxuXHJcbiAgICB2YXIgbGlnaHRpbmdTcHJpdGUgPSBuZXcgU3ByaXRlKGxpZ2h0aW5nLmdldFJlbmRlclRleHR1cmUoKSlcclxuICAgIGxpZ2h0aW5nU3ByaXRlLmJsZW5kTW9kZSA9IEJMRU5EX01PREVTLk1VTFRJUExZXHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZChsaWdodGluZ1Nwcml0ZSlcclxuXHJcbiAgICB0aGlzLm1hcC5saWdodGluZyA9IGxpZ2h0aW5nXHJcbiAgfVxyXG5cclxuICAvLyDmtojpmaTov7fpnKdcclxuICBkaXNhYmxlRm9nICgpIHtcclxuICAgIHRoaXMubGlnaHRpbmcuY2xlYXJDb2xvciA9IFsxLCAxLCAxLCAxXVxyXG4gIH1cclxuXHJcbiAgbG9hZCAobWFwRGF0YSkge1xyXG4gICAgbGV0IHRpbGVzID0gbWFwRGF0YS50aWxlc1xyXG4gICAgbGV0IGNvbHMgPSBtYXBEYXRhLmNvbHNcclxuICAgIGxldCByb3dzID0gbWFwRGF0YS5yb3dzXHJcbiAgICBsZXQgaXRlbXMgPSBtYXBEYXRhLml0ZW1zXHJcblxyXG4gICAgbGV0IGNlaWxTaXplID0gdGhpcy5jZWlsU2l6ZVxyXG5cclxuICAgIGlmIChtYXBEYXRhLmhhc0ZvZykge1xyXG4gICAgICB0aGlzLmVuYWJsZUZvZygpXHJcbiAgICB9XHJcbiAgICBsZXQgbWFwR3JhcGggPSB0aGlzLm1hcEdyYXBoXHJcblxyXG4gICAgbGV0IGFkZEdhbWVPYmplY3QgPSAoaSwgaiwgaWQsIHBhcmFtcykgPT4ge1xyXG4gICAgICBsZXQgbyA9IGluc3RhbmNlQnlJdGVtSWQoaWQsIHBhcmFtcylcclxuICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG8sIGkgKiBjZWlsU2l6ZSwgaiAqIGNlaWxTaXplKVxyXG4gICAgICByZXR1cm4gW28sIGksIGpdXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFkZEdyYXBoID0gKFtvLCBpLCBqXSkgPT4gbWFwR3JhcGguYWRkT2JqZWN0KG8sIGksIGopXHJcblxyXG4gICAgbGV0IHJlZ2lzdGVyT24gPSAoW28sIGksIGpdKSA9PiB7XHJcbiAgICAgIG8ub24oJ3VzZScsICgpID0+IHRoaXMuZW1pdCgndXNlJywgbykpXHJcbiAgICAgIG8ub24oJ2ZpcmUnLCBvYmplY3RFdmVudC5maXJlLmJpbmQodGhpcywgbykpXHJcbiAgICAgIC8vIFRPRE86IHJlbW92ZSBtYXAgaXRlbVxyXG4gICAgICAvLyBkZWxldGUgaXRlbXNbaV1cclxuICAgICAgcmV0dXJuIFtvLCBpLCBqXVxyXG4gICAgfVxyXG5cclxuICAgIG1hcEdyYXBoLmJlZ2luVXBkYXRlKClcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHM7IGkrKykge1xyXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJvd3M7IGorKykge1xyXG4gICAgICAgIHBpcGUoYWRkR2FtZU9iamVjdCwgcmVnaXN0ZXJPbiwgYWRkR3JhcGgpKGksIGosIHRpbGVzW2ogKiBjb2xzICsgaV0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGxldCBbIGlkLCBbaSwgal0sIHBhcmFtcyBdID0gaXRlbVxyXG4gICAgICBwaXBlKGFkZEdhbWVPYmplY3QsIHJlZ2lzdGVyT24sIGFkZEdyYXBoKShpLCBqLCBpZCwgcGFyYW1zKVxyXG4gICAgfSlcclxuXHJcbiAgICBtYXBHcmFwaC5lbmRVcGRhdGUoKVxyXG4gIH1cclxuXHJcbiAgYWRkUGxheWVyIChwbGF5ZXIsIHRvUG9zaXRpb24pIHtcclxuICAgIHBsYXllci5wb3NpdGlvbi5zZXQoXHJcbiAgICAgIHRvUG9zaXRpb25bMF0gKiB0aGlzLmNlaWxTaXplLFxyXG4gICAgICB0b1Bvc2l0aW9uWzFdICogdGhpcy5jZWlsU2l6ZVxyXG4gICAgKVxyXG4gICAgcGxheWVyLnNjYWxlLnNldCh0aGlzLm1hcFNjYWxlLCB0aGlzLm1hcFNjYWxlKVxyXG4gICAgcGxheWVyLnBhcmVudEdyb3VwID0gdGhpcy5wbGF5ZXJHcm91cFxyXG4gICAgdGhpcy5tYXAuYWRkQ2hpbGQocGxheWVyKVxyXG5cclxuICAgIE9iamVjdC5lbnRyaWVzKG9iamVjdEV2ZW50KS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xyXG4gICAgICBsZXQgZUluc3RhbmNlID0gaGFuZGxlci5iaW5kKHRoaXMsIHBsYXllcilcclxuICAgICAgcGxheWVyLm9uKGV2ZW50TmFtZSwgZUluc3RhbmNlKVxyXG4gICAgICBwbGF5ZXIub25jZSgncmVtb3ZlZCcsIHBsYXllci5vZmYuYmluZChwbGF5ZXIsIGV2ZW50TmFtZSwgZUluc3RhbmNlKSlcclxuICAgIH0pXHJcbiAgICB0aGlzLm9iamVjdHNbUkVQTFldLnB1c2gocGxheWVyKVxyXG5cclxuICAgIC8vIOiHquWLleaJvui3r1xyXG4gICAgLy8gbGV0IG1vdmVBYmlsaXR5ID0gcGxheWVyW0FCSUxJVFlfTU9WRV1cclxuICAgIC8vIGlmIChtb3ZlQWJpbGl0eSkge1xyXG4gICAgLy8gICBsZXQgcG9pbnRzID0gWyc0LDEnLCAnNCw0JywgJzExLDEnLCAnNiwxMCddXHJcbiAgICAvLyAgIHBvaW50cy5yZWR1Y2UoKGFjYywgY3VyKSA9PiB7XHJcbiAgICAvLyAgICAgbGV0IHBhdGggPSB0aGlzLm1hcEdyYXBoLmZpbmQoYWNjLCBjdXIpLm1hcChub2RlID0+IHtcclxuICAgIC8vICAgICAgIGxldCBbaSwgal0gPSBub2RlLmlkLnNwbGl0KCcsJylcclxuICAgIC8vICAgICAgIHJldHVybiB7eDogaSAqIHRoaXMuY2VpbFNpemUsIHk6IGogKiB0aGlzLmNlaWxTaXplfVxyXG4gICAgLy8gICAgIH0pXHJcbiAgICAvLyAgICAgbW92ZUFiaWxpdHkuYWRkUGF0aChwYXRoKVxyXG4gICAgLy8gICAgIHJldHVybiBjdXJcclxuICAgIC8vICAgfSlcclxuICAgIC8vIH1cclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICBsZXQgb2JqZWN0cyA9IHRoaXMub2JqZWN0c1tSRVBMWV1cclxuICAgIG9iamVjdHMuZm9yRWFjaChvID0+IG8udGljayhkZWx0YSkpXHJcblxyXG4gICAgbGV0IGNvbGxpc2lvbkRldGVjdCA9IChvMSwgbzIsIGYpID0+IHtcclxuICAgICAgaWYgKCFvMSB8fCAhbzIgfHwgbzEgPT09IG8yKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgaWYgKGYobzIsIG8xLCB0cnVlKSkge1xyXG4gICAgICAgIG8xLmVtaXQoJ2NvbGxpZGUnLCBvMilcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCByZWN0YW5nbGVDb2xsaXNpb24gPSBidW1wLnJlY3RhbmdsZUNvbGxpc2lvbi5iaW5kKGJ1bXApXHJcbiAgICBsZXQgY29sbGlkZUFyciA9IHRoaXMub2JqZWN0c1tTVEFZXVxyXG4gICAgLy8gY29sbGlkZSBkZXRlY3RcclxuICAgIGZvciAobGV0IGkgPSBjb2xsaWRlQXJyLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGZvciAobGV0IGogPSBvYmplY3RzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XHJcbiAgICAgICAgcGlwZShjb2xsaXNpb25EZXRlY3QpKGNvbGxpZGVBcnJbaV0sIG9iamVjdHNbal0sIHJlY3RhbmdsZUNvbGxpc2lvbilcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBoaXRUZXN0UmVjdGFuZ2xlID0gYnVtcC5oaXRUZXN0UmVjdGFuZ2xlLmJpbmQoYnVtcClcclxuICAgIGNvbGxpZGVBcnIgPSB0aGlzLm9iamVjdHNbUkVQTFldXHJcbiAgICBmb3IgKGxldCBpID0gY29sbGlkZUFyci5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBmb3IgKGxldCBqID0gb2JqZWN0cy5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xyXG4gICAgICAgIHBpcGUoY29sbGlzaW9uRGV0ZWN0KShjb2xsaWRlQXJyW2ldLCBvYmplY3RzW2pdLCBoaXRUZXN0UmVjdGFuZ2xlKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhZGRHYW1lT2JqZWN0IChvLCB4ID0gdW5kZWZpbmVkLCB5ID0gdW5kZWZpbmVkKSB7XHJcbiAgICBsZXQgbWFwU2NhbGUgPSB0aGlzLm1hcFNjYWxlXHJcbiAgICAvLyBOT1RJQ0U6IOatpOiZleeahCBOdW1iZXIg5b+F6aCI55WZ6JGX77yM5ZCm5YmH5a2X5Liy5YKz5YWlIHNldCgpIOeJqeS7tueEoeazlemhr+ekulxyXG4gICAgaWYgKHggIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBvLnBvc2l0aW9uLnNldCh4LCB5KVxyXG4gICAgfVxyXG4gICAgby5zY2FsZS5zZXQobWFwU2NhbGUsIG1hcFNjYWxlKVxyXG4gICAgdGhpcy5tYXAuYWRkQ2hpbGQobylcclxuXHJcbiAgICBsZXQgb0FycmF5ID0gdGhpcy5vYmplY3RzW28udHlwZV1cclxuICAgIG9BcnJheS5wdXNoKG8pXHJcbiAgICBvLm9uY2UoJ3JlbW92ZWQnLCAoKSA9PiB7XHJcbiAgICAgIGxldCBpbnggPSBvQXJyYXkuaW5kZXhPZihvKVxyXG4gICAgICBvQXJyYXkuc3BsaWNlKGlueCwgMSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvLyBmb2cg55qEIHBhcmVudCBjb250YWluZXIg5LiN6IO96KKr56e75YuVKOacg+mMr+S9jSnvvIzlm6DmraTmlLnmiJDkv67mlLkgbWFwIOS9jee9rlxyXG4gIGdldCBwb3NpdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXAucG9zaXRpb25cclxuICB9XHJcblxyXG4gIGdldCB4ICgpIHtcclxuICAgIHJldHVybiB0aGlzLm1hcC54XHJcbiAgfVxyXG5cclxuICBnZXQgeSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXAueVxyXG4gIH1cclxuXHJcbiAgc2V0IHggKHgpIHtcclxuICAgIHRoaXMubWFwLnggPSB4XHJcbiAgfVxyXG5cclxuICBzZXQgeSAoeSkge1xyXG4gICAgdGhpcy5tYXAueSA9IHlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hcFxyXG4iLCJpbXBvcnQgY3JlYXRlR3JhcGggZnJvbSAnbmdyYXBoLmdyYXBoJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICduZ3JhcGgucGF0aCdcclxuaW1wb3J0IEdhbWVPYmplY3RzIGZyb20gJy4vR2FtZU9iamVjdHMnXHJcblxyXG5jbGFzcyBNYXBHcmFwaCB7XHJcbiAgY29uc3RydWN0b3IgKHNjYWxlID0gMSkge1xyXG4gICAgdGhpcy5fZ3JhcGggPSBjcmVhdGVHcmFwaCgpXHJcbiAgICB0aGlzLl9maW5kZXIgPSBwYXRoLmFTdGFyKHRoaXMuX2dyYXBoLCB7XHJcbiAgICAgIC8vIFdlIHRlbGwgb3VyIHBhdGhmaW5kZXIgd2hhdCBzaG91bGQgaXQgdXNlIGFzIGEgZGlzdGFuY2UgZnVuY3Rpb246XHJcbiAgICAgIGRpc3RhbmNlIChmcm9tTm9kZSwgdG9Ob2RlLCBsaW5rKSB7XHJcbiAgICAgICAgcmV0dXJuIGZyb21Ob2RlLmRhdGEud2VpZ2h0ICsgdG9Ob2RlLmRhdGEud2VpZ2h0ICsgMVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgYWRkT2JqZWN0IChvLCBpLCBqKSB7XHJcbiAgICBsZXQgZ3JhcGggPSB0aGlzLl9ncmFwaFxyXG5cclxuICAgIGxldCBzZWxmTmFtZSA9IFtpLCBqXS5qb2luKCcsJylcclxuICAgIGxldCBub2RlID0gZ3JhcGguZ2V0Tm9kZShzZWxmTmFtZSlcclxuICAgIGlmICghbm9kZSkge1xyXG4gICAgICBub2RlID0gZ3JhcGguYWRkTm9kZShzZWxmTmFtZSwgbmV3IEdhbWVPYmplY3RzKG8pKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbm9kZS5kYXRhLnB1c2gobylcclxuICAgIH1cclxuICAgIGxldCBsaW5rID0gKHNlbGZOb2RlLCBvdGhlck5vZGUpID0+IHtcclxuICAgICAgaWYgKCFzZWxmTm9kZSB8fCAhb3RoZXJOb2RlIHx8IGdyYXBoLmdldExpbmsoc2VsZk5vZGUuaWQsIG90aGVyTm9kZS5pZCkpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBsZXQgd2VpZ2h0ID0gc2VsZk5vZGUuZGF0YS53ZWlnaHQgKyBvdGhlck5vZGUuZGF0YS53ZWlnaHRcclxuICAgICAgaWYgKHdlaWdodCA9PT0gMCkge1xyXG4gICAgICAgIGdyYXBoLmFkZExpbmsoc2VsZk5vZGUuaWQsIG90aGVyTm9kZS5pZClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZGF0YS53ZWlnaHQgIT09IDApIHtcclxuICAgICAgLy8g5q2k6bue5LiN6YCa77yM56e76Zmk5omA5pyJ6YCj57WQXHJcbiAgICAgIGdyYXBoLmZvckVhY2hMaW5rZWROb2RlKHNlbGZOYW1lLCBmdW5jdGlvbiAobGlua2VkTm9kZSwgbGluaykge1xyXG4gICAgICAgIGdyYXBoLnJlbW92ZUxpbmsobGluaylcclxuICAgICAgfSlcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBsaW5rKG5vZGUsIGdyYXBoLmdldE5vZGUoW2kgLSAxLCBqXS5qb2luKCcsJykpKVxyXG4gICAgbGluayhub2RlLCBncmFwaC5nZXROb2RlKFtpLCBqIC0gMV0uam9pbignLCcpKSlcclxuICAgIGxpbmsoZ3JhcGguZ2V0Tm9kZShbaSArIDEsIGpdLmpvaW4oJywnKSksIG5vZGUpXHJcbiAgICBsaW5rKGdyYXBoLmdldE5vZGUoW2ksIGogKyAxXS5qb2luKCcsJykpLCBub2RlKVxyXG4gIH1cclxuXHJcbiAgZmluZCAoZnJvbSwgdG8pIHtcclxuICAgIHJldHVybiB0aGlzLl9maW5kZXIuZmluZChmcm9tLCB0bylcclxuICB9XHJcblxyXG4gIGJlZ2luVXBkYXRlICgpIHtcclxuICAgIHRoaXMuX2dyYXBoLmJlZ2luVXBkYXRlKClcclxuICB9XHJcblxyXG4gIGVuZFVwZGF0ZSAoKSB7XHJcbiAgICB0aGlzLl9ncmFwaC5lbmRVcGRhdGUoKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWFwR3JhcGhcclxuIiwiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnXG5cbmNvbnN0IE1BWF9NRVNTQUdFX0NPVU5UID0gNTAwXG5cbmNsYXNzIE1lc3NhZ2VzIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLl9tZXNzYWdlcyA9IFtdXG4gIH1cblxuICBnZXQgbGlzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzXG4gIH1cblxuICBhZGQgKG1zZykge1xuICAgIGxldCBsZW5ndGggPSB0aGlzLl9tZXNzYWdlcy51bnNoaWZ0KG1zZylcbiAgICBpZiAobGVuZ3RoID4gTUFYX01FU1NBR0VfQ09VTlQpIHtcbiAgICAgIHRoaXMuX21lc3NhZ2VzLnBvcCgpXG4gICAgfVxuICAgIHRoaXMuZW1pdCgnbW9kaWZpZWQnKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBNZXNzYWdlcygpXG4iLCIvKiBnbG9iYWwgUElYSSAqL1xuXG5leHBvcnQgY29uc3QgQXBwbGljYXRpb24gPSBQSVhJLkFwcGxpY2F0aW9uXG5leHBvcnQgY29uc3QgQ29udGFpbmVyID0gUElYSS5Db250YWluZXJcbmV4cG9ydCBjb25zdCBsb2FkZXIgPSBQSVhJLmxvYWRlclxuZXhwb3J0IGNvbnN0IHJlc291cmNlcyA9IFBJWEkubG9hZGVyLnJlc291cmNlc1xuZXhwb3J0IGNvbnN0IFNwcml0ZSA9IFBJWEkuU3ByaXRlXG5leHBvcnQgY29uc3QgVGV4dCA9IFBJWEkuVGV4dFxuZXhwb3J0IGNvbnN0IFRleHRTdHlsZSA9IFBJWEkuVGV4dFN0eWxlXG5cbmV4cG9ydCBjb25zdCBHcmFwaGljcyA9IFBJWEkuR3JhcGhpY3NcbmV4cG9ydCBjb25zdCBCTEVORF9NT0RFUyA9IFBJWEkuQkxFTkRfTU9ERVNcbmV4cG9ydCBjb25zdCBkaXNwbGF5ID0gUElYSS5kaXNwbGF5XG5leHBvcnQgY29uc3QgdXRpbHMgPSBQSVhJLnV0aWxzXG4iLCJpbXBvcnQgeyBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIGRpc3BsYXkuTGF5ZXIge1xuICBjcmVhdGUgKCkge31cblxuICBkZXN0cm95ICgpIHt9XG5cbiAgdGljayAoZGVsdGEpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lXG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY29uc3QgVGV4dHVyZSA9IHtcbiAgZ2V0IFRlcnJhaW5BdGxhcyAoKSB7XG4gICAgcmV0dXJuIHJlc291cmNlc1snaW1hZ2VzL3RlcnJhaW5fYXRsYXMuanNvbiddXG4gIH0sXG4gIGdldCBCYXNlT3V0QXRsYXMgKCkge1xuICAgIHJldHVybiByZXNvdXJjZXNbJ2ltYWdlcy9iYXNlX291dF9hdGxhcy5qc29uJ11cbiAgfSxcblxuICBnZXQgQWlyICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2VtcHR5LnBuZyddXG4gIH0sXG4gIGdldCBHcmFzcyAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydncmFzcy5wbmcnXVxuICB9LFxuICBnZXQgR3JvdW5kICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2JyaWNrLXRpbGUucG5nJ11cbiAgfSxcblxuICBnZXQgV2FsbCAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWyd3YWxsLnBuZyddXG4gIH0sXG4gIGdldCBJcm9uRmVuY2UgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1snaXJvbi1mZW5jZS5wbmcnXVxuICB9LFxuICBnZXQgUm9vdCAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydyb290LnBuZyddXG4gIH0sXG4gIGdldCBUcmVlICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ3RyZWUucG5nJ11cbiAgfSxcblxuICBnZXQgVHJlYXN1cmUgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1sndHJlYXN1cmUucG5nJ11cbiAgfSxcbiAgZ2V0IERvb3IgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1snaXJvbi1mZW5jZS5wbmcnXVxuICB9LFxuICBnZXQgVG9yY2ggKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1sndG9yY2gucG5nJ11cbiAgfSxcbiAgZ2V0IEdyYXNzRGVjb3JhdGUxICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2dyYXNzLWRlY29yYXRlLTEucG5nJ11cbiAgfSxcbiAgZ2V0IEJ1bGxldCAoKSB7XG4gICAgcmV0dXJuIHJlc291cmNlc1snaW1hZ2VzL2ZpcmVfYm9sdC5wbmcnXS50ZXh0dXJlXG4gIH0sXG5cbiAgZ2V0IFJvY2sgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1sncm9jay5wbmcnXVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHR1cmVcbiIsImNvbnN0IGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJXG5cbmNsYXNzIFZlY3RvciB7XG4gIGNvbnN0cnVjdG9yICh4LCB5KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUG9pbnQgKHApIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihwLngsIHAueSlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUmFkTGVuZ3RoIChyYWQsIGxlbmd0aCkge1xuICAgIGxldCB4ID0gbGVuZ3RoICogTWF0aC5jb3MocmFkKVxuICAgIGxldCB5ID0gbGVuZ3RoICogTWF0aC5zaW4ocmFkKVxuICAgIHJldHVybiBuZXcgVmVjdG9yKHgsIHkpXG4gIH1cblxuICBjbG9uZSAoKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnkpXG4gIH1cblxuICBhZGQgKHYpIHtcbiAgICB0aGlzLnggKz0gdi54XG4gICAgdGhpcy55ICs9IHYueVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdWIgKHYpIHtcbiAgICB0aGlzLnggLT0gdi54XG4gICAgdGhpcy55IC09IHYueVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbnZlcnQgKCkge1xuICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKC0xKVxuICB9XG5cbiAgbXVsdGlwbHlTY2FsYXIgKHMpIHtcbiAgICB0aGlzLnggKj0gc1xuICAgIHRoaXMueSAqPSBzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRpdmlkZVNjYWxhciAocykge1xuICAgIGlmIChzID09PSAwKSB7XG4gICAgICB0aGlzLnggPSAwXG4gICAgICB0aGlzLnkgPSAwXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKDEgLyBzKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZG90ICh2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueVxuICB9XG5cbiAgZ2V0IGxlbmd0aCAoKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkpXG4gIH1cblxuICBsZW5ndGhTcSAoKSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueVxuICB9XG5cbiAgbm9ybWFsaXplICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIodGhpcy5sZW5ndGgpXG4gIH1cblxuICBkaXN0YW5jZVRvICh2KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3RhbmNlVG9TcSh2KSlcbiAgfVxuXG4gIGRpc3RhbmNlVG9TcSAodikge1xuICAgIGxldCBkeCA9IHRoaXMueCAtIHYueFxuICAgIGxldCBkeSA9IHRoaXMueSAtIHYueVxuICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeVxuICB9XG5cbiAgc2V0ICh4LCB5KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0WCAoeCkge1xuICAgIHRoaXMueCA9IHhcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0WSAoeSkge1xuICAgIHRoaXMueSA9IHlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0TGVuZ3RoIChsKSB7XG4gICAgdmFyIG9sZExlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgaWYgKG9sZExlbmd0aCAhPT0gMCAmJiBsICE9PSBvbGRMZW5ndGgpIHtcbiAgICAgIHRoaXMubXVsdGlwbHlTY2FsYXIobCAvIG9sZExlbmd0aClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGxlcnAgKHYsIGFscGhhKSB7XG4gICAgdGhpcy54ICs9ICh2LnggLSB0aGlzLngpICogYWxwaGFcbiAgICB0aGlzLnkgKz0gKHYueSAtIHRoaXMueSkgKiBhbHBoYVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBnZXQgcmFkICgpIHtcbiAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueClcbiAgfVxuXG4gIGdldCBkZWcgKCkge1xuICAgIHJldHVybiB0aGlzLnJhZCAqIGRlZ3JlZXNcbiAgfVxuXG4gIGVxdWFscyAodikge1xuICAgIHJldHVybiB0aGlzLnggPT09IHYueCAmJiB0aGlzLnkgPT09IHYueVxuICB9XG5cbiAgcm90YXRlICh0aGV0YSkge1xuICAgIHZhciB4dGVtcCA9IHRoaXMueFxuICAgIHRoaXMueCA9IHRoaXMueCAqIE1hdGguY29zKHRoZXRhKSAtIHRoaXMueSAqIE1hdGguc2luKHRoZXRhKVxuICAgIHRoaXMueSA9IHh0ZW1wICogTWF0aC5zaW4odGhldGEpICsgdGhpcy55ICogTWF0aC5jb3ModGhldGEpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWZWN0b3JcbiIsImltcG9ydCBXYWxsIGZyb20gJy4uL29iamVjdHMvV2FsbCdcclxuaW1wb3J0IEFpciBmcm9tICcuLi9vYmplY3RzL0FpcidcclxuaW1wb3J0IEdyYXNzIGZyb20gJy4uL29iamVjdHMvR3Jhc3MnXHJcbmltcG9ydCBUcmVhc3VyZSBmcm9tICcuLi9vYmplY3RzL1RyZWFzdXJlJ1xyXG5pbXBvcnQgRG9vciBmcm9tICcuLi9vYmplY3RzL0Rvb3InXHJcbmltcG9ydCBUb3JjaCBmcm9tICcuLi9vYmplY3RzL1RvcmNoJ1xyXG5pbXBvcnQgR3JvdW5kIGZyb20gJy4uL29iamVjdHMvR3JvdW5kJ1xyXG5pbXBvcnQgSXJvbkZlbmNlIGZyb20gJy4uL29iamVjdHMvSXJvbkZlbmNlJ1xyXG5pbXBvcnQgUm9vdCBmcm9tICcuLi9vYmplY3RzL1Jvb3QnXHJcbmltcG9ydCBUcmVlIGZyb20gJy4uL29iamVjdHMvVHJlZSdcclxuaW1wb3J0IEdyYXNzRGVjb3JhdGUxIGZyb20gJy4uL29iamVjdHMvR3Jhc3NEZWNvcmF0ZTEnXHJcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vb2JqZWN0cy9CdWxsZXQnXHJcbmltcG9ydCBXYWxsU2hvb3RCb2x0IGZyb20gJy4uL29iamVjdHMvV2FsbFNob290Qm9sdCdcclxuXHJcbmltcG9ydCBNb3ZlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL01vdmUnXHJcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhJ1xyXG5pbXBvcnQgT3BlcmF0ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9PcGVyYXRlJ1xyXG5cclxuLy8gMHgwMDAwIH4gMHgwMDBmXHJcbmNvbnN0IEl0ZW1zU3RhdGljID0gW1xyXG4gIEFpciwgR3Jhc3MsIEdyb3VuZFxyXG5dXHJcbi8vIDB4MDAxMCB+IDB4MDBmZlxyXG5jb25zdCBJdGVtc1N0YXkgPSBbXHJcbiAgLy8gMHgwMDEwLCAweDAwMTEsIDB4MDAxMlxyXG4gIFdhbGwsIElyb25GZW5jZSwgUm9vdCwgVHJlZVxyXG5dXHJcbi8vIDB4MDEwMCB+IDB4MDFmZlxyXG5jb25zdCBJdGVtc090aGVyID0gW1xyXG4gIFRyZWFzdXJlLCBEb29yLCBUb3JjaCwgR3Jhc3NEZWNvcmF0ZTEsIEJ1bGxldCwgV2FsbFNob290Qm9sdFxyXG5dXHJcbi8vIDB4MDIwMCB+IDB4MDJmZlxyXG5jb25zdCBBYmlsaXRpZXMgPSBbXHJcbiAgTW92ZSwgQ2FtZXJhLCBPcGVyYXRlXHJcbl1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnN0YW5jZUJ5SXRlbUlkIChpdGVtSWQsIHBhcmFtcykge1xyXG4gIGxldCBUeXBlc1xyXG4gIGl0ZW1JZCA9IHBhcnNlSW50KGl0ZW1JZCwgMTYpXHJcbiAgaWYgKChpdGVtSWQgJiAweGZmZjApID09PSAwKSB7XHJcbiAgICAvLyDlnLDmnb9cclxuICAgIFR5cGVzID0gSXRlbXNTdGF0aWNcclxuICB9IGVsc2UgaWYgKChpdGVtSWQgJiAweGZmMDApID09PSAwKSB7XHJcbiAgICBUeXBlcyA9IEl0ZW1zU3RheVxyXG4gICAgaXRlbUlkIC09IDB4MDAxMFxyXG4gIH0gZWxzZSBpZiAoKGl0ZW1JZCAmIDB4ZmYwMCkgPj4+IDggPT09IDEpIHtcclxuICAgIFR5cGVzID0gSXRlbXNPdGhlclxyXG4gICAgaXRlbUlkIC09IDB4MDEwMFxyXG4gIH0gZWxzZSB7XHJcbiAgICBUeXBlcyA9IEFiaWxpdGllc1xyXG4gICAgaXRlbUlkIC09IDB4MDIwMFxyXG4gIH1cclxuICByZXR1cm4gbmV3IFR5cGVzW2l0ZW1JZF0ocGFyYW1zKVxyXG59XHJcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBBaXIgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuQWlyKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQWlyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcbmltcG9ydCB7IFJFUExZLCBBQklMSVRZX01PVkUsIEFCSUxJVFlfSEVBTFRIIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuaW1wb3J0IExlYXJuIGZyb20gJy4vYWJpbGl0aWVzL0xlYXJuJ1xuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcblxuY2xhc3MgQnVsbGV0IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLkJ1bGxldClcblxuICAgIG5ldyBMZWFybigpLmNhcnJ5QnkodGhpcylcbiAgICAgIC5sZWFybihuZXcgTW92ZShbMSwgMF0pKVxuXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gUkVQTFkgfVxuXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XG4gICAgaWYgKHRoaXMub3duZXIgPT09IG9wZXJhdG9yIHx8XG4gICAgICB0aGlzLm93bmVyID09PSBvcGVyYXRvci5vd25lcikge1xuICAgICAgLy8g6YG/5YWN6Ieq5q66XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGhlYWx0aEFiaWxpdHkgPSBvcGVyYXRvcltBQklMSVRZX0hFQUxUSF1cbiAgICBpZiAoaGVhbHRoQWJpbGl0eSkge1xuICAgICAgaGVhbHRoQWJpbGl0eS5nZXRIdXJ0KHtcbiAgICAgICAgZGFtYWdlOiAxXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpXG4gICAgdGhpcy5kZXN0cm95KClcbiAgfVxuXG4gIHNldE93bmVyIChvd25lcikge1xuICAgIHRoaXMub3duZXIgPSBvd25lclxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnQnVsbGV0J1xuICB9XG5cbiAgc2F5ICgpIHtcbiAgICAvLyBzYXkgbm90aGluZ1xuICB9XG5cbiAgc2V0RGlyZWN0aW9uICh2ZWN0b3IpIHtcbiAgICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzW0FCSUxJVFlfTU9WRV1cbiAgICBpZiAobW92ZUFiaWxpdHkpIHtcbiAgICAgIG1vdmVBYmlsaXR5LnNldERpcmVjdGlvbih2ZWN0b3IpXG4gICAgICB0aGlzLnJvdGF0aW9uID0gdmVjdG9yLnJhZFxuICAgIH1cbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLnRpY2tBYmlsaXRpZXMpLmZvckVhY2goYWJpbGl0eSA9PiBhYmlsaXR5LnRpY2soZGVsdGEsIHRoaXMpKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJ1bGxldFxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCBMZWFybiBmcm9tICcuL2FiaWxpdGllcy9MZWFybidcbmltcG9ydCBNb3ZlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL01vdmUnXG5pbXBvcnQgS2V5TW92ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9LZXlNb3ZlJ1xuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEnXG5pbXBvcnQgQ2FycnkgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FycnknXG5pbXBvcnQgUGxhY2UgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvUGxhY2UnXG5pbXBvcnQgS2V5UGxhY2UgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvS2V5UGxhY2UnXG5pbXBvcnQgRmlyZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9GaXJlJ1xuaW1wb3J0IEtleUZpcmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvS2V5RmlyZSdcbmltcG9ydCBSb3RhdGUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvUm90YXRlJ1xuaW1wb3J0IEhlYWx0aCBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9IZWFsdGgnXG5pbXBvcnQgQnVsbGV0IGZyb20gJy4uL29iamVjdHMvQnVsbGV0J1xuXG5jbGFzcyBDYXQgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFRleHR1cmUuUm9jaylcblxuICAgIGxldCBjYXJyeSA9IG5ldyBDYXJyeSgzKVxuICAgIG5ldyBMZWFybigpLmNhcnJ5QnkodGhpcylcbiAgICAgIC5sZWFybihuZXcgTW92ZShbMywgMF0pKVxuICAgICAgLmxlYXJuKG5ldyBLZXlNb3ZlKCkpXG4gICAgICAubGVhcm4obmV3IFBsYWNlKCkpXG4gICAgICAubGVhcm4obmV3IEtleVBsYWNlKCkpXG4gICAgICAubGVhcm4obmV3IENhbWVyYSgxKSlcbiAgICAgIC5sZWFybihjYXJyeSlcbiAgICAgIC5sZWFybihuZXcgRmlyZShbMywgM10pKVxuICAgICAgLmxlYXJuKG5ldyBLZXlGaXJlKCkpXG4gICAgICAubGVhcm4obmV3IFJvdGF0ZSgpKVxuICAgICAgLmxlYXJuKG5ldyBIZWFsdGgoMSkpXG5cbiAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCgpXG4gICAgY2FycnkudGFrZShidWxsZXQsIEluZmluaXR5KVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAneW91J1xuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICBPYmplY3QudmFsdWVzKHRoaXMudGlja0FiaWxpdGllcykuZm9yRWFjaChhYmlsaXR5ID0+IGFiaWxpdHkudGljayhkZWx0YSwgdGhpcykpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2F0XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgU1RBWSwgQUJJTElUWV9PUEVSQVRFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIERvb3IgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAobWFwKSB7XHJcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcclxuICAgIHN1cGVyKFRleHR1cmUuRG9vcilcclxuXHJcbiAgICB0aGlzLm1hcCA9IG1hcFswXVxyXG4gICAgdGhpcy50b1Bvc2l0aW9uID0gbWFwWzFdXHJcblxyXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XHJcblxyXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XHJcbiAgICBsZXQgYWJpbGl0eSA9IG9wZXJhdG9yW0FCSUxJVFlfT1BFUkFURV1cclxuICAgIGlmIChhYmlsaXR5KSB7XHJcbiAgICAgIGFiaWxpdHkodGhpcylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG9wZXJhdG9yLmVtaXQoJ2NvbGxpZGUnLCB0aGlzKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgW0FCSUxJVFlfT1BFUkFURV0gKCkge1xyXG4gICAgdGhpcy5zYXkoWydHZXQgaW4gJywgdGhpcy5tYXAsICcgbm93LiddLmpvaW4oJycpKVxyXG4gICAgdGhpcy5lbWl0KCd1c2UnKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdEb29yJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG9vclxyXG4iLCJpbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgbWVzc2FnZXMgZnJvbSAnLi4vbGliL01lc3NhZ2VzJ1xuXG5jbGFzcyBHYW1lT2JqZWN0IGV4dGVuZHMgU3ByaXRlIHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbiAgc2F5IChtc2cpIHtcbiAgICBtZXNzYWdlcy5hZGQobXNnKVxuICAgIGNvbnNvbGUubG9nKG1zZylcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYW1lT2JqZWN0XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR3Jhc3MgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuR3Jhc3MpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFzc1xuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdyYXNzRGVjb3JhdGUxIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLkdyYXNzRGVjb3JhdGUxKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdHcmFzc0RlY29yYXRlMSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFzc0RlY29yYXRlMVxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdyb3VuZCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5Hcm91bmQpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0dyb3VuZCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcm91bmRcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgSXJvbkZlbmNlIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICBzdXBlcihUZXh0dXJlLklyb25GZW5jZSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJcm9uRmVuY2VcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgUm9vdCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5Sb290KVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvb3RcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xyXG5pbXBvcnQgTGlnaHQgZnJvbSAnLi4vbGliL0xpZ2h0J1xyXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXHJcblxyXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuY2xhc3MgVG9yY2ggZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcihUZXh0dXJlLlRvcmNoKVxyXG5cclxuICAgIGxldCByYWRpdXMgPSAyXHJcblxyXG4gICAgdGhpcy5vbignYWRkZWQnLCBMaWdodC5saWdodE9uLmJpbmQobnVsbCwgdGhpcywgcmFkaXVzLCAwLjk1KSlcclxuICAgIHRoaXMub24oJ3JlbW92ZWVkJywgTGlnaHQubGlnaHRPZmYuYmluZChudWxsLCB0aGlzKSlcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAndG9yY2gnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUb3JjaFxyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgUkVQTFksIEFCSUxJVFlfQ0FSUlkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBpbnN0YW5jZUJ5SXRlbUlkIH0gZnJvbSAnLi4vbGliL3V0aWxzJ1xyXG5cclxuY2xhc3MgU2xvdCB7XHJcbiAgY29uc3RydWN0b3IgKFtpdGVtSWQsIHBhcmFtcywgY291bnRdKSB7XHJcbiAgICB0aGlzLml0ZW0gPSBpbnN0YW5jZUJ5SXRlbUlkKGl0ZW1JZCwgcGFyYW1zKVxyXG4gICAgdGhpcy5jb3VudCA9IGNvdW50XHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gW3RoaXMuaXRlbS50b1N0cmluZygpLCAnKCcsIHRoaXMuY291bnQsICcpJ10uam9pbignJylcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFRyZWFzdXJlIGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKGludmVudG9yaWVzID0gW10pIHtcclxuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxyXG4gICAgc3VwZXIoVGV4dHVyZS5UcmVhc3VyZSlcclxuXHJcbiAgICB0aGlzLmludmVudG9yaWVzID0gaW52ZW50b3JpZXMubWFwKHRyZWFzdXJlID0+IG5ldyBTbG90KHRyZWFzdXJlKSlcclxuXHJcbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XHJcblxyXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XHJcbiAgICBsZXQgY2FycnlBYmlsaXR5ID0gb3BlcmF0b3JbQUJJTElUWV9DQVJSWV1cclxuICAgIGlmICghY2FycnlBYmlsaXR5KSB7XHJcbiAgICAgIG9wZXJhdG9yLnNheSgnSSBjYW5cXCd0IGNhcnJ5IGl0ZW1zIG5vdCB5ZXQuJylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbnZlbnRvcmllcy5mb3JFYWNoKFxyXG4gICAgICB0cmVhc3VyZSA9PiBjYXJyeUFiaWxpdHkudGFrZSh0cmVhc3VyZS5pdGVtLCB0cmVhc3VyZS5jb3VudCkpXHJcbiAgICBvcGVyYXRvci5zYXkoWydJIHRha2VkICcsIHRoaXMudG9TdHJpbmcoKV0uam9pbignJykpXHJcblxyXG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlQ2hpbGQodGhpcylcclxuICAgIHRoaXMuZGVzdHJveSgpXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAndHJlYXN1cmU6IFsnLFxyXG4gICAgICB0aGlzLmludmVudG9yaWVzLmpvaW4oJywgJyksXHJcbiAgICAgICddJ1xyXG4gICAgXS5qb2luKCcnKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJlYXN1cmVcclxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBUcmVlIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLlRyZWUpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJlZVxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBXYWxsIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLldhbGwpXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cblxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xuICAgIG9wZXJhdG9yLmVtaXQoJ2NvbGxpZGUnLCB0aGlzKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnV2FsbCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXYWxsXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSwgQUJJTElUWV9GSVJFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuaW1wb3J0IExlYXJuIGZyb20gJy4vYWJpbGl0aWVzL0xlYXJuJ1xuaW1wb3J0IENhcnJ5IGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0NhcnJ5J1xuaW1wb3J0IEZpcmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvRmlyZSdcbmltcG9ydCBIZWFsdGggZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvSGVhbHRoJ1xuaW1wb3J0IEJ1bGxldCBmcm9tICcuLi9vYmplY3RzL0J1bGxldCdcblxuY2xhc3MgV2FsbFNob290Qm9sdCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5XYWxsKVxuXG4gICAgbGV0IGNhcnJ5ID0gbmV3IENhcnJ5KDMpXG4gICAgbmV3IExlYXJuKCkuY2FycnlCeSh0aGlzKVxuICAgICAgLmxlYXJuKG5ldyBGaXJlKFszLCAzXSkpXG4gICAgICAubGVhcm4oY2FycnkpXG4gICAgICAubGVhcm4obmV3IEhlYWx0aCgxKSlcblxuICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KClcbiAgICBjYXJyeS50YWtlKGJ1bGxldCwgSW5maW5pdHkpXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbignZGllJywgdGhpcy5vbkRpZS5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5hbmNob3Iuc2V0KDAuNSwgMC41KVxuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGxldCByYWQgPSB0aGlzLnJvdGF0aW9uXG4gICAgICB0aGlzW0FCSUxJVFlfRklSRV0uZmlyZShyYWQpXG4gICAgICB0aGlzW0FCSUxJVFlfRklSRV0uZmlyZShyYWQgKyBNYXRoLlBJIC8gMilcbiAgICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZCArIE1hdGguUEkpXG4gICAgICB0aGlzW0FCSUxJVFlfRklSRV0uZmlyZShyYWQgKyBNYXRoLlBJIC8gMiAqIDMpXG4gICAgICBjb25zb2xlLmxvZygnZmlyZScpXG4gICAgfSwgMjAwKVxuXG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdGhpcy5yb3RhdGlvbiArPSBNYXRoLlBJIC8gMzAgLyAxMFxuICAgIH0sIDE3KVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG5cbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcbiAgICBvcGVyYXRvci5lbWl0KCdjb2xsaWRlJywgdGhpcylcbiAgfVxuXG4gIG9uRGllICgpIHtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKVxuICAgIHRoaXMuZGVzdHJveSgpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdXYWxsU2hvb3RCb2x0J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdhbGxTaG9vdEJvbHRcbiIsImNvbnN0IHR5cGUgPSBTeW1ib2woJ2FiaWxpdHknKVxuXG5jbGFzcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gdHlwZSB9XG5cbiAgZ2V0U2FtZVR5cGVBYmlsaXR5IChvd25lcikge1xuICAgIHJldHVybiBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXVxuICB9XG5cbiAgLy8g5piv5ZCm6ZyA572u5o+bXG4gIGhhc1RvUmVwbGFjZSAob3duZXIsIGFiaWxpdHlOZXcpIHtcbiAgICBsZXQgYWJpbGl0eU9sZCA9IHRoaXMuZ2V0U2FtZVR5cGVBYmlsaXR5KG93bmVyKVxuICAgIHJldHVybiAhYWJpbGl0eU9sZCB8fCBhYmlsaXR5TmV3LmlzQmV0dGVyKGFiaWxpdHlPbGQpXG4gIH1cblxuICAvLyDmlrDoiIrmr5TovINcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIGxldCBhYmlsaXR5T2xkID0gdGhpcy5nZXRTYW1lVHlwZUFiaWxpdHkob3duZXIpXG4gICAgaWYgKGFiaWxpdHlPbGQpIHtcbiAgICAgIC8vIGZpcnN0IGdldCB0aGlzIHR5cGUgYWJpbGl0eVxuICAgICAgYWJpbGl0eU9sZC5yZXBsYWNlZEJ5KHRoaXMsIG93bmVyKVxuICAgIH1cbiAgICBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXSA9IHRoaXNcbiAgfVxuXG4gIHJlcGxhY2VkQnkgKG90aGVyLCBvd25lcikge31cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgZGVsZXRlIG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdwbHogZXh0ZW5kIHRoaXMgY2xhc3MnXG4gIH1cblxuICBzZXJpYWxpemUgKCkge1xuICAgIHJldHVybiB7fVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFiaWxpdHlcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcclxuaW1wb3J0IExpZ2h0IGZyb20gJy4uLy4uL2xpYi9MaWdodCdcclxuaW1wb3J0IHsgQUJJTElUWV9DQU1FUkEgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuY2xhc3MgQ2FtZXJhIGV4dGVuZHMgQWJpbGl0eSB7XHJcbiAgY29uc3RydWN0b3IgKHZhbHVlKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnJhZGl1cyA9IHZhbHVlXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0NBTUVSQSB9XHJcblxyXG4gIGlzQmV0dGVyIChvdGhlcikge1xyXG4gICAgLy8g5Y+q5pyD6K6K5aSnXHJcbiAgICByZXR1cm4gdGhpcy5yYWRpdXMgPj0gb3RoZXIucmFkaXVzXHJcbiAgfVxyXG5cclxuICAvLyDphY3lgpnmraTmioDog71cclxuICBjYXJyeUJ5IChvd25lcikge1xyXG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcclxuICAgIGlmIChvd25lci5wYXJlbnQpIHtcclxuICAgICAgdGhpcy5zZXR1cChvd25lciwgb3duZXIucGFyZW50KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3duZXIub25jZSgnYWRkZWQnLCBjb250YWluZXIgPT4gdGhpcy5zZXR1cChvd25lciwgY29udGFpbmVyKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlcGxhY2VkQnkgKG90aGVyLCBvd25lcikge1xyXG4gICAgdGhpcy5kcm9wQnkob3duZXIpXHJcbiAgfVxyXG5cclxuICBzZXR1cCAob3duZXIsIGNvbnRhaW5lcikge1xyXG4gICAgTGlnaHQubGlnaHRPbihvd25lciwgdGhpcy5yYWRpdXMpXHJcbiAgICAvLyDlpoLmnpwgb3duZXIg5LiN6KKr6aGv56S6XHJcbiAgICBvd25lci5yZW1vdmVkID0gdGhpcy5vblJlbW92ZWQuYmluZCh0aGlzLCBvd25lcilcclxuICAgIG93bmVyLm9uY2UoJ3JlbW92ZWQnLCBvd25lci5yZW1vdmVkKVxyXG4gIH1cclxuXHJcbiAgb25SZW1vdmVkIChvd25lcikge1xyXG4gICAgdGhpcy5kcm9wQnkob3duZXIpXHJcbiAgICAvLyBvd25lciDph43mlrDooqvpoa/npLpcclxuICAgIG93bmVyLm9uY2UoJ2FkZGVkJywgY29udGFpbmVyID0+IHRoaXMuc2V0dXAob3duZXIsIGNvbnRhaW5lcikpXHJcbiAgfVxyXG5cclxuICBkcm9wQnkgKG93bmVyKSB7XHJcbiAgICBMaWdodC5saWdodE9mZihvd25lcilcclxuICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxyXG4gICAgb3duZXIub2ZmKCdyZW1vdmVkJywgb3duZXIucmVtb3ZlZClcclxuICAgIGRlbGV0ZSBvd25lci5yZW1vdmVkXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ2xpZ2h0IGFyZWE6ICcgKyB0aGlzLnJhZGl1c1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FtZXJhXHJcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfQ0FSUlksIEFCSUxJVFlfTEVBUk4gfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5mdW5jdGlvbiBuZXdTbG90IChpdGVtLCBjb3VudCkge1xuICByZXR1cm4ge1xuICAgIGl0ZW0sXG4gICAgY291bnQsXG4gICAgdG9TdHJpbmcgKCkge1xuICAgICAgcmV0dXJuIFtpdGVtLnRvU3RyaW5nKCksICcoJywgdGhpcy5jb3VudCwgJyknXS5qb2luKCcnKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDYXJyeSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAoaW5pdFNsb3RzKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuYmFncyA9IFtdXG4gICAgdGhpcy5iYWdzLnB1c2goQXJyYXkoaW5pdFNsb3RzKS5maWxsKCkpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0NBUlJZIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9DQVJSWV0gPSB0aGlzXG4gIH1cblxuICB0YWtlIChpdGVtLCBjb3VudCA9IDEpIHtcbiAgICBsZXQgb3duZXIgPSB0aGlzLm93bmVyXG4gICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBBYmlsaXR5ICYmIG93bmVyW0FCSUxJVFlfTEVBUk5dKSB7XG4gICAgICAvLyDlj5blvpfog73liptcbiAgICAgIG93bmVyW0FCSUxJVFlfTEVBUk5dLmxlYXJuKGl0ZW0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGtleSA9IGl0ZW0udG9TdHJpbmcoKVxuICAgIGxldCBmaXJzdEVtcHR5U2xvdFxuICAgIGxldCBmb3VuZCA9IHRoaXMuYmFncy5zb21lKChiYWcsIGJpKSA9PiB7XG4gICAgICByZXR1cm4gYmFnLnNvbWUoKHNsb3QsIHNpKSA9PiB7XG4gICAgICAgIC8vIOaaq+WtmOesrOS4gOWAi+epuuagvFxuICAgICAgICBpZiAoIXNsb3QgJiYgIWZpcnN0RW1wdHlTbG90KSB7XG4gICAgICAgICAgZmlyc3RFbXB0eVNsb3QgPSB7c2ksIGJpfVxuICAgICAgICB9XG4gICAgICAgIC8vIOeJqeWTgeeWiuWKoCjlkIzpoZ7lnospXG4gICAgICAgIGlmIChzbG90ICYmIHNsb3QuaXRlbS50b1N0cmluZygpID09PSBrZXkpIHtcbiAgICAgICAgICBzbG90LmNvdW50ICs9IGNvdW50XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0pXG4gICAgfSlcbiAgICBpZiAoIWZvdW5kKSB7XG4gICAgICBpZiAoIWZpcnN0RW1wdHlTbG90KSB7XG4gICAgICAgIC8vIOaykuacieepuuagvOWPr+aUvueJqeWTgVxuICAgICAgICBvd25lci5zYXkoJ25vIGVtcHR5IHNsb3QgZm9yIG5ldyBpdGVtIGdvdC4nKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIOaUvuWFpeesrOS4gOWAi+epuuagvFxuICAgICAgdGhpcy5iYWdzW2ZpcnN0RW1wdHlTbG90LmJpXVtmaXJzdEVtcHR5U2xvdC5zaV0gPSBuZXdTbG90KGl0ZW0sIGNvdW50KVxuICAgIH1cbiAgICBvd25lci5lbWl0KCdpbnZlbnRvcnktbW9kaWZpZWQnLCBpdGVtKVxuICB9XG5cbiAgZ2V0U2xvdEl0ZW0gKHNsb3RJbngpIHtcbiAgICBsZXQgYmlcbiAgICBsZXQgc2lcbiAgICAvLyDnhafokZfljIXljIXliqDlhaXpoIbluo/mn6Xmib5cbiAgICBsZXQgZm91bmQgPSB0aGlzLmJhZ3MuZmluZCgoYmFnLCBiKSA9PiB7XG4gICAgICBiaSA9IGJcbiAgICAgIHJldHVybiBiYWcuZmluZCgoc2xvdCwgcykgPT4ge1xuICAgICAgICBzaSA9IHNcbiAgICAgICAgcmV0dXJuIHNsb3RJbngtLSA9PT0gMFxuICAgICAgfSlcbiAgICB9KVxuICAgIGxldCBpdGVtXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICBmb3VuZCA9IHRoaXMuYmFnc1tiaV1bc2ldXG4gICAgICBpdGVtID0gZm91bmQuaXRlbVxuICAgICAgLy8g5Y+W5Ye65b6M5rib5LiAXG4gICAgICBpZiAoLS1mb3VuZC5jb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLmJhZ3NbYmldW3NpXSA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgdGhpcy5vd25lci5lbWl0KCdpbnZlbnRvcnktbW9kaWZpZWQnLCBpdGVtKVxuICAgIH1cbiAgICByZXR1cm4gaXRlbVxuICB9XG5cbiAgZ2V0SXRlbUJ5VHlwZSAodHlwZSkge1xuICAgIGxldCBiaVxuICAgIGxldCBzaVxuICAgIGxldCBmb3VuZCA9IHRoaXMuYmFncy5maW5kKChiYWcsIGIpID0+IHtcbiAgICAgIGJpID0gYlxuICAgICAgcmV0dXJuIGJhZy5maW5kKChzbG90LCBzKSA9PiB7XG4gICAgICAgIHNpID0gc1xuICAgICAgICByZXR1cm4gc2xvdCAmJiBzbG90Lml0ZW0gaW5zdGFuY2VvZiB0eXBlXG4gICAgICB9KVxuICAgIH0pXG4gICAgbGV0IGl0ZW1cbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIGZvdW5kID0gdGhpcy5iYWdzW2JpXVtzaV1cbiAgICAgIGl0ZW0gPSBmb3VuZC5pdGVtXG4gICAgICAvLyDlj5blh7rlvozmuJvkuIBcbiAgICAgIGlmICgtLWZvdW5kLmNvdW50ID09PSAwKSB7XG4gICAgICAgIHRoaXMuYmFnc1tiaV1bc2ldID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICB0aGlzLm93bmVyLmVtaXQoJ2ludmVudG9yeS1tb2RpZmllZCcsIGl0ZW0pXG4gICAgfVxuICAgIHJldHVybiBpdGVtXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIFsnY2Fycnk6ICcsIHRoaXMuYmFncy5qb2luKCcsICcpXS5qb2luKCcnKVxuICB9XG5cbiAgLy8gVE9ETzogc2F2ZSBkYXRhXG4gIHNlcmlhbGl6ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFnc1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhcnJ5XG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0ZJUkUsIEFCSUxJVFlfQ0FSUlksIEFCSUxJVFlfUk9UQVRFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuaW1wb3J0IFZlY3RvciBmcm9tICcuLi8uLi9saWIvVmVjdG9yJ1xuXG5jbGFzcyBGaXJlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yIChbIHBvd2VyIF0pIHtcbiAgICBzdXBlcigpXG4gICAgLy8gVE9ETzogaW1wbGVtZW50XG4gICAgdGhpcy5wb3dlciA9IHBvd2VyXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0ZJUkUgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX0ZJUkVdID0gdGhpc1xuICB9XG5cbiAgZmlyZSAocmFkID0gdW5kZWZpbmVkKSB7XG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxuICAgIGxldCBzY2FsZSA9IG93bmVyLnNjYWxlLnhcblxuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBvd25lcltBQklMSVRZX0NBUlJZXVxuICAgIGxldCBCdWxsZXRUeXBlID0gY2FycnlBYmlsaXR5LmdldEl0ZW1CeVR5cGUoQnVsbGV0KVxuICAgIGlmICghQnVsbGV0VHlwZSkge1xuICAgICAgLy8gbm8gbW9yZSBidWxsZXQgaW4gaW52ZW50b3J5XG4gICAgICBjb25zb2xlLmxvZygnbm8gbW9yZSBidWxsZXQgaW4gaW52ZW50b3J5JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldFR5cGUuY29uc3RydWN0b3IoKVxuXG4gICAgLy8gc2V0IGRpcmVjdGlvblxuICAgIGxldCByb3RhdGVBYmlsaXR5ID0gb3duZXJbQUJJTElUWV9ST1RBVEVdXG4gICAgaWYgKHJhZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyDlpoLmnpzmspLmjIflrprmlrnlkJHvvIzlsLHnlKjnm67liY3pnaLlsI3mlrnlkJFcbiAgICAgIHJhZCA9IHJvdGF0ZUFiaWxpdHkgPyByb3RhdGVBYmlsaXR5LmZhY2VSYWQgOiAwXG4gICAgfVxuICAgIGxldCB2ZWN0b3IgPSBWZWN0b3IuZnJvbVJhZExlbmd0aChyYWQsIDEpXG4gICAgYnVsbGV0LnNldERpcmVjdGlvbih2ZWN0b3IpXG4gICAgYnVsbGV0LnNldE93bmVyKG93bmVyKVxuICAgIGJ1bGxldC5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlKVxuICAgIGJ1bGxldC5hbmNob3Iuc2V0KDAuNSwgMC41KVxuXG4gICAgLy8gc2V0IHBvc2l0aW9uXG4gICAgbGV0IGFuY2hvciA9IG93bmVyLmFuY2hvclxuICAgIGxldCBwb3NpdGlvbiA9IHZlY3Rvci5jbG9uZSgpXG4gICAgICAubXVsdGlwbHlTY2FsYXIob3duZXIud2lkdGggLyAyICsgYnVsbGV0LndpZHRoIC8gMilcbiAgICAgIC5hZGQobmV3IFZlY3RvcihcbiAgICAgICAgb3duZXIueCArIG93bmVyLndpZHRoICogKDAuNSAtIGFuY2hvci54KSxcbiAgICAgICAgb3duZXIueSArIG93bmVyLmhlaWdodCAqICgwLjUgLSBhbmNob3IueSlcbiAgICAgICkpXG4gICAgYnVsbGV0LnBvc2l0aW9uLnNldChwb3NpdGlvbi54LCBwb3NpdGlvbi55KVxuXG4gICAgb3duZXIuZW1pdCgnZmlyZScsIGJ1bGxldClcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0ZpcmUnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlyZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9IRUFMVEggfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBIZWFsdGggZXh0ZW5kcyBBYmlsaXR5IHtcbiAgY29uc3RydWN0b3IgKGhlYWx0aFBvaW50ID0gMSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmhlYWx0aFBvaW50ID0gaGVhbHRoUG9pbnRcbiAgICB0aGlzLm1hcEhlYWx0aFBvaW50ID0gaGVhbHRoUG9pbnRcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfSEVBTFRIIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9IRUFMVEhdID0gdGhpc1xuICB9XG5cbiAgZ2V0SHVydCAoaHVydCkge1xuICAgIGxldCBwcmVIcCA9IHRoaXMuaGVhbHRoUG9pbnRcbiAgICB0aGlzLmhlYWx0aFBvaW50IC09IGh1cnQuZGFtYWdlXG4gICAgbGV0IHN1ZkhwID0gdGhpcy5oZWFsdGhQb2ludFxuICAgIHRoaXMub3duZXIuc2F5KFtcbiAgICAgIHRoaXMub3duZXIudG9TdHJpbmcoKSxcbiAgICAgICcgZ2V0IGh1cnQgJyxcbiAgICAgIGh1cnQuZGFtYWdlLFxuICAgICAgJzogJyxcbiAgICAgIHByZUhwLFxuICAgICAgJyAtPiAnLFxuICAgICAgc3VmSHBcbiAgICBdLmpvaW4oJycpKVxuICAgIGlmICh0aGlzLmhlYWx0aFBvaW50IDw9IDApIHtcbiAgICAgIHRoaXMub3duZXIuZW1pdCgnZGllJylcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdIZWFsdGgnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSGVhbHRoXG4iLCIvKiBnbG9iYWwgYWRkRXZlbnRMaXN0ZW5lciwgcmVtb3ZlRXZlbnRMaXN0ZW5lciAqL1xuaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9GSVJFLCBBQklMSVRZX0tFWV9GSVJFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgS2V5RmlyZSBleHRlbmRzIEFiaWxpdHkge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0tFWV9GSVJFIH1cblxuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5zZXR1cChvd25lcilcbiAgfVxuXG4gIHNldHVwIChvd25lcikge1xuICAgIGxldCBmaXJlQWJpbGl0eSA9IG93bmVyW0FCSUxJVFlfRklSRV1cbiAgICBsZXQgYmluZCA9ICgpID0+IHtcbiAgICAgIGxldCBoYW5kbGVyID0gZSA9PiB7XG4gICAgICAgIGZpcmVBYmlsaXR5LmZpcmUoKVxuICAgICAgfVxuICAgICAgYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyKVxuICAgICAgcmV0dXJuIGhhbmRsZXJcbiAgICB9XG5cbiAgICBvd25lcltBQklMSVRZX0tFWV9GSVJFXSA9IGJpbmQoKVxuICB9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIHN1cGVyLmRyb3BCeShvd25lcilcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG93bmVyW0FCSUxJVFlfS0VZX0ZJUkVdKVxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX0tFWV9GSVJFXVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAna2V5IGZpcmUnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS2V5RmlyZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcbmltcG9ydCB7IExFRlQsIFVQLCBSSUdIVCwgRE9XTiB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb250cm9sJ1xuaW1wb3J0IHsgQUJJTElUWV9NT1ZFLCBBQklMSVRZX0tFWV9NT1ZFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vLi4vbGliL1ZlY3RvcidcblxuY2xhc3MgS2V5TW92ZSBleHRlbmRzIEFiaWxpdHkge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0tFWV9NT1ZFIH1cblxuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5zZXR1cChvd25lcilcbiAgfVxuXG4gIHNldHVwIChvd25lcikge1xuICAgIGxldCBkaXIgPSB7fVxuICAgIGxldCBjYWxjRGlyID0gKCkgPT4ge1xuICAgICAgbGV0IHZlY3RvciA9IG5ldyBWZWN0b3IoLWRpcltMRUZUXSArIGRpcltSSUdIVF0sIC1kaXJbVVBdICsgZGlyW0RPV05dKVxuICAgICAgb3duZXJbQUJJTElUWV9NT1ZFXS5hZGREaXJlY3Rpb24odmVjdG9yKVxuICAgIH1cbiAgICBsZXQgYmluZCA9IGNvZGUgPT4ge1xuICAgICAgZGlyW2NvZGVdID0gMFxuICAgICAgbGV0IHByZUhhbmRsZXIgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50UmVwZWF0KClcbiAgICAgICAgZGlyW2NvZGVdID0gMVxuICAgICAgICBvd25lcltBQklMSVRZX01PVkVdLmNsZWFyUGF0aCgpXG4gICAgICB9XG4gICAgICBrZXlib2FyZEpTLmJpbmQoY29kZSwgcHJlSGFuZGxlciwgKCkgPT4ge1xuICAgICAgICBkaXJbY29kZV0gPSAwXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHByZUhhbmRsZXJcbiAgICB9XG5cbiAgICBrZXlib2FyZEpTLnNldENvbnRleHQoJycpXG4gICAga2V5Ym9hcmRKUy53aXRoQ29udGV4dCgnJywgKCkgPT4ge1xuICAgICAgb3duZXJbQUJJTElUWV9LRVlfTU9WRV0gPSB7XG4gICAgICAgIFtMRUZUXTogYmluZChMRUZUKSxcbiAgICAgICAgW1VQXTogYmluZChVUCksXG4gICAgICAgIFtSSUdIVF06IGJpbmQoUklHSFQpLFxuICAgICAgICBbRE9XTl06IGJpbmQoRE9XTilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKGNhbGNEaXIsIDE3KVxuICB9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIHN1cGVyLmRyb3BCeShvd25lcilcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBPYmplY3QuZW50cmllcyhvd25lcltBQklMSVRZX0tFWV9NT1ZFXSkuZm9yRWFjaCgoW2tleSwgaGFuZGxlcl0pID0+IHtcbiAgICAgICAga2V5Ym9hcmRKUy51bmJpbmQoa2V5LCBoYW5kbGVyKVxuICAgICAgfSlcbiAgICB9KVxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX0tFWV9NT1ZFXVxuXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAna2V5IGNvbnRyb2wnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS2V5TW92ZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcbmltcG9ydCB7IFBMQUNFMSwgUExBQ0UyLCBQTEFDRTMsIFBMQUNFNCB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb250cm9sJ1xuaW1wb3J0IHsgQUJJTElUWV9QTEFDRSwgQUJJTElUWV9LRVlfUExBQ0UgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jb25zdCBTTE9UUyA9IFtcbiAgUExBQ0UxLCBQTEFDRTIsIFBMQUNFMywgUExBQ0U0XG5dXG5cbmNsYXNzIEtleVBsYWNlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfS0VZX1BMQUNFIH1cblxuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5zZXR1cChvd25lcilcbiAgfVxuXG4gIHNldHVwIChvd25lcikge1xuICAgIGxldCBwbGFjZUFiaWxpdHkgPSBvd25lcltBQklMSVRZX1BMQUNFXVxuICAgIGxldCBiaW5kID0ga2V5ID0+IHtcbiAgICAgIGxldCBzbG90SW54ID0gU0xPVFMuaW5kZXhPZihrZXkpXG4gICAgICBsZXQgaGFuZGxlciA9IGUgPT4ge1xuICAgICAgICBlLnByZXZlbnRSZXBlYXQoKVxuICAgICAgICBwbGFjZUFiaWxpdHkucGxhY2Uoc2xvdElueClcbiAgICAgIH1cbiAgICAgIGtleWJvYXJkSlMuYmluZChrZXksIGhhbmRsZXIsICgpID0+IHt9KVxuICAgICAgcmV0dXJuIGhhbmRsZXJcbiAgICB9XG5cbiAgICBrZXlib2FyZEpTLnNldENvbnRleHQoJycpXG4gICAga2V5Ym9hcmRKUy53aXRoQ29udGV4dCgnJywgKCkgPT4ge1xuICAgICAgb3duZXJbQUJJTElUWV9LRVlfUExBQ0VdID0ge1xuICAgICAgICBQTEFDRTE6IGJpbmQoUExBQ0UxKSxcbiAgICAgICAgUExBQ0UyOiBiaW5kKFBMQUNFMiksXG4gICAgICAgIFBMQUNFMzogYmluZChQTEFDRTMpLFxuICAgICAgICBQTEFDRTQ6IGJpbmQoUExBQ0U0KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgc3VwZXIuZHJvcEJ5KG93bmVyKVxuICAgIGtleWJvYXJkSlMud2l0aENvbnRleHQoJycsICgpID0+IHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW0FCSUxJVFlfS0VZX1BMQUNFXSkuZm9yRWFjaCgoW2tleSwgaGFuZGxlcl0pID0+IHtcbiAgICAgICAga2V5Ym9hcmRKUy51bmJpbmQoa2V5LCBoYW5kbGVyKVxuICAgICAgfSlcbiAgICB9KVxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX0tFWV9QTEFDRV1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2tleSBwbGFjZSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLZXlQbGFjZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9MRUFSTiB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIExlYXJuIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfTEVBUk4gfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBpZiAoIW93bmVyLmFiaWxpdGllcykge1xuICAgICAgb3duZXIuYWJpbGl0aWVzID0ge31cbiAgICAgIG93bmVyLnRpY2tBYmlsaXRpZXMgPSB7fVxuICAgIH1cbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMub3duZXIgPSBvd25lclxuICAgIG93bmVyW0FCSUxJVFlfTEVBUk5dID0gdGhpc1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBsZWFybiAoYWJpbGl0eSkge1xuICAgIGxldCBvd25lciA9IHRoaXMub3duZXJcbiAgICBpZiAoYWJpbGl0eS5oYXNUb1JlcGxhY2Uob3duZXIsIGFiaWxpdHkpKSB7XG4gICAgICBhYmlsaXR5LmNhcnJ5Qnkob3duZXIpXG4gICAgICBvd25lci5lbWl0KCdhYmlsaXR5LWNhcnJ5JywgYWJpbGl0eSlcbiAgICB9XG4gICAgcmV0dXJuIG93bmVyW0FCSUxJVFlfTEVBUk5dXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdsZWFybmluZydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMZWFyblxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xyXG5pbXBvcnQgeyBBQklMSVRZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXHJcblxyXG5jb25zdCBESVNUQU5DRV9USFJFU0hPTEQgPSAxXHJcblxyXG5jbGFzcyBNb3ZlIGV4dGVuZHMgQWJpbGl0eSB7XHJcbiAgLyoqXHJcbiAgICog56e75YuV6IO95YqbXHJcbiAgICogQHBhcmFtICB7aW50fSB2YWx1ZSAgICDnp7vli5XpgJ/luqZcclxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGZyaWN0aW9uIOaRqeaTpuWKmygxOiDmnIDlpKfvvIwwOiDmnIDlsI8pXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKFt2YWx1ZSwgZnJpY3Rpb25dKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcclxuICAgIHRoaXMudmVjdG9yID0gbmV3IFZlY3RvcigwLCAwKVxyXG4gICAgdGhpcy5mcmljdGlvbiA9IGZyaWN0aW9uXHJcbiAgICB0aGlzLnBhdGggPSBbXVxyXG4gICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gdW5kZWZpbmVkXHJcbiAgICB0aGlzLmRpc3RhbmNlVGhyZXNob2xkID0gdGhpcy52YWx1ZSAqIERJU1RBTkNFX1RIUkVTSE9MRFxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9NT1ZFIH1cclxuXHJcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XHJcbiAgICAvLyDlj6rmnIPliqDlv6tcclxuICAgIHJldHVybiB0aGlzLnZhbHVlID4gb3RoZXIudmFsdWVcclxuICB9XHJcblxyXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxyXG4gIGNhcnJ5QnkgKG93bmVyKSB7XHJcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxyXG4gICAgdGhpcy5vd25lciA9IG93bmVyXHJcbiAgICBvd25lcltBQklMSVRZX01PVkVdID0gdGhpc1xyXG4gICAgb3duZXIudGlja0FiaWxpdGllc1t0aGlzLnR5cGUudG9TdHJpbmcoKV0gPSB0aGlzXHJcbiAgfVxyXG5cclxuICByZXBsYWNlZEJ5IChvdGhlciwgb3duZXIpIHtcclxuICAgIG90aGVyLnZlY3RvciA9IHRoaXMudmVjdG9yXHJcbiAgICBvdGhlci5wYXRoID0gdGhpcy5wYXRoXHJcbiAgICBvdGhlci5tb3ZpbmdUb1BvaW50ID0gdGhpcy5tb3ZpbmdUb1BvaW50XHJcbiAgfVxyXG5cclxuICAvLyDoqK3lrprmlrnlkJHmnIDlpKfpgJ/luqZcclxuICBzZXREaXJlY3Rpb24gKHZlY3Rvcikge1xyXG4gICAgaWYgKHZlY3Rvci5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0aGlzLnZlY3RvciA9IHZlY3Rvci5zZXRMZW5ndGgoMSlcclxuICB9XHJcblxyXG4gIC8vIOe3qeaFouWKoOmAn++8jOWRvOWPqzYw5qyh5Y+v6YGU5YWo6YCfXHJcbiAgYWRkRGlyZWN0aW9uICh2ZWN0b3IpIHtcclxuICAgIGxldCBsZW4gPSB0aGlzLnZhbHVlIC8gNjBcclxuICAgIHZlY3Rvci5zZXRMZW5ndGgobGVuKVxyXG4gICAgdGhpcy52ZWN0b3IuYWRkKHZlY3RvcilcclxuXHJcbiAgICBsZXQgbWF4VmFsdWUgPSB0aGlzLnZhbHVlXHJcbiAgICAvLyDkuI3lj6/otoXlh7rmnIDpq5jpgJ/luqZcclxuICAgIGlmICh0aGlzLnZlY3Rvci5sZW5ndGggPiBtYXhWYWx1ZSkge1xyXG4gICAgICB0aGlzLnZlY3Rvci5zZXRMZW5ndGgobWF4VmFsdWUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDnp7vli5XliLDpu55cclxuICBtb3ZlVG8gKHBvaW50KSB7XHJcbiAgICBsZXQgdmVjdG9yID0gbmV3IFZlY3Rvcihwb2ludC54IC0gdGhpcy5vd25lci54LCBwb2ludC55IC0gdGhpcy5vd25lci55KVxyXG4gICAgdGhpcy5zZXREaXJlY3Rpb24odmVjdG9yKVxyXG4gIH1cclxuXHJcbiAgLy8g6Kit5a6a56e75YuV6Lev5b6RXHJcbiAgc2V0UGF0aCAocGF0aCkge1xyXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIC8vIOaKtemBlOe1gum7nlxyXG4gICAgICB0aGlzLm1vdmluZ1RvUG9pbnQgPSB1bmRlZmluZWRcclxuICAgICAgdGhpcy52ZWN0b3IgPSBuZXcgVmVjdG9yKDAsIDApXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5wYXRoID0gcGF0aFxyXG4gICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gcGF0aC5wb3AoKVxyXG4gICAgdGhpcy5tb3ZlVG8odGhpcy5tb3ZpbmdUb1BvaW50KVxyXG4gIH1cclxuXHJcbiAgY2xlYXJQYXRoICgpIHtcclxuICAgIHRoaXMubW92aW5nVG9Qb2ludCA9IHVuZGVmaW5lZFxyXG4gICAgdGhpcy5wYXRoID0gW11cclxuICB9XHJcblxyXG4gIGFkZFBhdGggKHBhdGgpIHtcclxuICAgIHRoaXMuc2V0UGF0aChwYXRoLmNvbmNhdCh0aGlzLnBhdGgpKVxyXG4gIH1cclxuXHJcbiAgLy8gdGlja1xyXG4gIHRpY2sgKGRlbHRhLCBvd25lcikge1xyXG4gICAgLy8gTk9USUNFOiDlgYfoqK3oh6rlt7HmmK/mraPmlrnlvaJcclxuICAgIGxldCBzY2FsZSA9IG93bmVyLnNjYWxlLnhcclxuICAgIGxldCB2ZWN0b3IgPSB0aGlzLnZlY3RvclxyXG5cclxuICAgIC8vIOaRqeaTpuWKm1xyXG4gICAgdGhpcy52ZWN0b3IuYWRkKHRoaXMudmVjdG9yLmNsb25lKCkuaW52ZXJ0KCkubXVsdGlwbHlTY2FsYXIodGhpcy5mcmljdGlvbikpXHJcblxyXG4gICAgb3duZXIueCArPSB2ZWN0b3IueCAqIHRoaXMudmFsdWUgKiBzY2FsZSAqIGRlbHRhXHJcbiAgICBvd25lci55ICs9IHZlY3Rvci55ICogdGhpcy52YWx1ZSAqIHNjYWxlICogZGVsdGFcclxuXHJcbiAgICBpZiAodGhpcy5tb3ZpbmdUb1BvaW50KSB7XHJcbiAgICAgIGxldCBwb3NpdGlvbiA9IG93bmVyLnBvc2l0aW9uXHJcbiAgICAgIGxldCB0YXJnZXRQb3NpdGlvbiA9IHRoaXMubW92aW5nVG9Qb2ludFxyXG4gICAgICBsZXQgYSA9IHBvc2l0aW9uLnggLSB0YXJnZXRQb3NpdGlvbi54XHJcbiAgICAgIGxldCBiID0gcG9zaXRpb24ueSAtIHRhcmdldFBvc2l0aW9uLnlcclxuICAgICAgbGV0IGMgPSBNYXRoLnNxcnQoYSAqIGEgKyBiICogYilcclxuICAgICAgaWYgKGMgPCB0aGlzLmRpc3RhbmNlVGhyZXNob2xkKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQYXRoKHRoaXMucGF0aClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1vdmVUbyh0aGlzLm1vdmluZ1RvUG9pbnQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnbW92ZSBsZXZlbDogJyArIHRoaXMudmFsdWVcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vdmVcclxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9PUEVSQVRFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgT3BlcmF0ZSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5zZXQgPSBuZXcgU2V0KFt2YWx1ZV0pXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX09QRVJBVEUgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICBvd25lcltBQklMSVRZX09QRVJBVEVdID0gdGhpc1tBQklMSVRZX09QRVJBVEVdLmJpbmQodGhpcywgb3duZXIpXG4gICAgcmV0dXJuIG93bmVyW0FCSUxJVFlfT1BFUkFURV1cbiAgfVxuXG4gIHJlcGxhY2VkQnkgKG90aGVyKSB7XG4gICAgdGhpcy5zZXQuZm9yRWFjaChvdGhlci5zZXQuYWRkLmJpbmQob3RoZXIuc2V0KSlcbiAgfVxuXG4gIFtBQklMSVRZX09QRVJBVEVdIChvcGVyYXRvciwgdGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMuc2V0Lmhhcyh0YXJnZXQubWFwKSkge1xuICAgICAgb3BlcmF0b3Iuc2F5KG9wZXJhdG9yLnRvU3RyaW5nKCkgKyAnIHVzZSBhYmlsaXR5IHRvIG9wZW4gJyArIHRhcmdldC5tYXApXG4gICAgICB0YXJnZXRbdGhpcy50eXBlXSgpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbJ2tleXM6ICcsIEFycmF5LmZyb20odGhpcy5zZXQpLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0ZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9QTEFDRSwgQUJJTElUWV9DQVJSWSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFBsYWNlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfUExBQ0UgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX1BMQUNFXSA9IHRoaXNcbiAgfVxuXG4gIHBsYWNlIChzbG90SW54KSB7XG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBvd25lcltBQklMSVRZX0NBUlJZXVxuICAgIGxldCBpdGVtID0gY2FycnlBYmlsaXR5LmdldFNsb3RJdGVtKHNsb3RJbngpXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIG93bmVyLmVtaXQoJ3BsYWNlJywgbmV3IGl0ZW0uY29uc3RydWN0b3IoKSlcblxuICAgICAgbGV0IHBvc2l0aW9uID0gb3duZXIucG9zaXRpb25cbiAgICAgIG93bmVyLnNheShbJ3BsYWNlICcsIGl0ZW0udG9TdHJpbmcoKSwgJyBhdCAnLFxuICAgICAgICBbJygnLCBwb3NpdGlvbi54LnRvRml4ZWQoMCksICcsICcsIHBvc2l0aW9uLnkudG9GaXhlZCgwKSwgJyknXS5qb2luKCcnKV0uam9pbignJykpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAncGxhY2UnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxhY2VcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcclxuaW1wb3J0IHsgQUJJTElUWV9ST1RBVEUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXHJcblxyXG5jb25zdCBNT1VTRU1PVkUgPSBTeW1ib2woJ21vdXNlbW92ZScpXHJcblxyXG5jbGFzcyBSb3RhdGUgZXh0ZW5kcyBBYmlsaXR5IHtcclxuICBjb25zdHJ1Y3RvciAoaW5pdFJhZCA9IDApIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMuaW5pdFJhZCA9IGluaXRSYWRcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfUk9UQVRFIH1cclxuXHJcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIGdldCBmYWNlUmFkICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9mYWNlUmFkXHJcbiAgfVxyXG5cclxuICAvLyDphY3lgpnmraTmioDog71cclxuICBjYXJyeUJ5IChvd25lcikge1xyXG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcclxuICAgIG93bmVyLmFuY2hvci5zZXQoMC41LCAwLjUpXHJcblxyXG4gICAgdGhpcy5vd25lciA9IG93bmVyXHJcbiAgICBvd25lcltBQklMSVRZX1JPVEFURV0gPSB0aGlzXHJcbiAgICBvd25lci5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgIG93bmVyW01PVVNFTU9WRV0gPSBlID0+IHtcclxuICAgICAgbGV0IG93bmVyUG9pbnQgPSBvd25lci5nZXRHbG9iYWxQb3NpdGlvbigpXHJcbiAgICAgIGxldCBwb2ludGVyID0gZS5kYXRhLmdsb2JhbFxyXG4gICAgICBsZXQgdGFyZ2V0UG9zaXRpb24gPSB7XHJcbiAgICAgICAgeDogcG9pbnRlci54IC0gb3duZXJQb2ludC54LFxyXG4gICAgICAgIHk6IHBvaW50ZXIueSAtIG93bmVyUG9pbnQueVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuX2ZhY2VSYWQgPSBWZWN0b3IuZnJvbVBvaW50KHRhcmdldFBvc2l0aW9uKS5yYWQgLSB0aGlzLmluaXRSYWRcclxuICAgICAgdGhpcy5yb3RhdGUodGhpcy5fZmFjZVJhZClcclxuICAgIH1cclxuICAgIG93bmVyLm9uKCdtb3VzZW1vdmUnLCBvd25lcltNT1VTRU1PVkVdKVxyXG4gICAgb3duZXIucm90YXRpb24gPSBNYXRoLlBJIC8gMlxyXG4gIH1cclxuXHJcbiAgcm90YXRlIChyYWQpIHtcclxuICAgIHRoaXMub3duZXIucm90YXRpb24gPSByYWRcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnUm90YXRlJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUm90YXRlXHJcbiIsImltcG9ydCB7IFRleHQsIFRleHRTdHlsZSwgbG9hZGVyIH0gZnJvbSAnLi4vbGliL1BJWEknXHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9saWIvU2NlbmUnXHJcbmltcG9ydCBQbGF5U2NlbmUgZnJvbSAnLi9QbGF5U2NlbmUnXHJcblxyXG5sZXQgdGV4dCA9ICdsb2FkaW5nJ1xyXG5cclxuY2xhc3MgTG9hZGluZ1NjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLmxpZmUgPSAwXHJcbiAgfVxyXG5cclxuICBjcmVhdGUgKCkge1xyXG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XHJcbiAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXHJcbiAgICAgIGZvbnRTaXplOiAzNixcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnI2ZmMzMwMCcsXHJcbiAgICAgIHN0cm9rZVRoaWNrbmVzczogNCxcclxuICAgICAgZHJvcFNoYWRvdzogdHJ1ZSxcclxuICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgIGRyb3BTaGFkb3dCbHVyOiA0LFxyXG4gICAgICBkcm9wU2hhZG93QW5nbGU6IE1hdGguUEkgLyA2LFxyXG4gICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDZcclxuICAgIH0pXHJcbiAgICB0aGlzLnRleHRMb2FkaW5nID0gbmV3IFRleHQodGV4dCwgc3R5bGUpXHJcblxyXG4gICAgLy8gQWRkIHRoZSBjYXQgdG8gdGhlIHN0YWdlXHJcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGV4dExvYWRpbmcpXHJcblxyXG4gICAgLy8gbG9hZCBhbiBpbWFnZSBhbmQgcnVuIHRoZSBgc2V0dXBgIGZ1bmN0aW9uIHdoZW4gaXQncyBkb25lXHJcbiAgICBsb2FkZXJcclxuICAgICAgLmFkZCgnaW1hZ2VzL3RlcnJhaW5fYXRsYXMuanNvbicpXHJcbiAgICAgIC5hZGQoJ2ltYWdlcy9iYXNlX291dF9hdGxhcy5qc29uJylcclxuICAgICAgLmFkZCgnaW1hZ2VzL2ZpcmVfYm9sdC5wbmcnKVxyXG4gICAgICAubG9hZCgoKSA9PiB0aGlzLmVtaXQoJ2NoYW5nZVNjZW5lJywgUGxheVNjZW5lLCB7XHJcbiAgICAgICAgbWFwRmlsZTogJ1cwTjAnLFxyXG4gICAgICAgIHBvc2l0aW9uOiBbNCwgMV1cclxuICAgICAgfSkpXHJcbiAgfVxyXG5cclxuICB0aWNrIChkZWx0YSkge1xyXG4gICAgdGhpcy5saWZlICs9IGRlbHRhIC8gMzAgLy8gYmxlbmQgc3BlZWRcclxuICAgIHRoaXMudGV4dExvYWRpbmcudGV4dCA9IHRleHQgKyBBcnJheShNYXRoLmZsb29yKHRoaXMubGlmZSkgJSA0ICsgMSkuam9pbignLicpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMb2FkaW5nU2NlbmVcclxuIiwiaW1wb3J0IHsgbG9hZGVyLCByZXNvdXJjZXMsIGRpc3BsYXkgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2xpYi9TY2VuZSdcclxuaW1wb3J0IE1hcCBmcm9tICcuLi9saWIvTWFwJ1xyXG5pbXBvcnQgeyBJU19NT0JJTEUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuaW1wb3J0IENhdCBmcm9tICcuLi9vYmplY3RzL0NhdCdcclxuXHJcbmltcG9ydCBNZXNzYWdlV2luZG93IGZyb20gJy4uL3VpL01lc3NhZ2VXaW5kb3cnXHJcbmltcG9ydCBQbGF5ZXJXaW5kb3cgZnJvbSAnLi4vdWkvUGxheWVyV2luZG93J1xyXG5pbXBvcnQgSW52ZW50b3J5V2luZG93IGZyb20gJy4uL3VpL0ludmVudG9yeVdpbmRvdydcclxuaW1wb3J0IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsIGZyb20gJy4uL3VpL1RvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsJ1xyXG5pbXBvcnQgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwgZnJvbSAnLi4vdWkvVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwnXHJcblxyXG5sZXQgc2NlbmVXaWR0aFxyXG5sZXQgc2NlbmVIZWlnaHRcclxuXHJcbmZ1bmN0aW9uIGdldE1lc3NhZ2VXaW5kb3dPcHQgKCkge1xyXG4gIGxldCBvcHQgPSB7fVxyXG4gIGlmIChJU19NT0JJTEUpIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGhcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDMwXHJcbiAgICBvcHQuc2Nyb2xsQmFyV2lkdGggPSA1MFxyXG4gICAgb3B0LnNjcm9sbEJhck1pbkhlaWdodCA9IDcwXHJcbiAgfSBlbHNlIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggPCA0MDAgPyBzY2VuZVdpZHRoIDogc2NlbmVXaWR0aCAvIDJcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDYwXHJcbiAgfVxyXG4gIG9wdC5oZWlnaHQgPSBzY2VuZUhlaWdodCAvIDZcclxuICBvcHQueCA9IDBcclxuICBvcHQueSA9IHNjZW5lSGVpZ2h0IC0gb3B0LmhlaWdodFxyXG5cclxuICByZXR1cm4gb3B0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBsYXllcldpbmRvd09wdCAocGxheWVyKSB7XHJcbiAgbGV0IG9wdCA9IHtcclxuICAgIHBsYXllclxyXG4gIH1cclxuICBvcHQueCA9IDBcclxuICBvcHQueSA9IDBcclxuICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIC8gNFxyXG4gICAgb3B0LmhlaWdodCA9IHNjZW5lSGVpZ2h0IC8gNlxyXG4gICAgb3B0LmZvbnRTaXplID0gb3B0LndpZHRoIC8gMTBcclxuICB9IGVsc2Uge1xyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aCA8IDQwMCA/IHNjZW5lV2lkdGggLyAyIDogc2NlbmVXaWR0aCAvIDRcclxuICAgIG9wdC5oZWlnaHQgPSBzY2VuZUhlaWdodCAvIDNcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDIwXHJcbiAgfVxyXG4gIHJldHVybiBvcHRcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SW52ZW50b3J5V2luZG93T3B0IChwbGF5ZXIpIHtcclxuICBsZXQgb3B0ID0ge1xyXG4gICAgcGxheWVyXHJcbiAgfVxyXG4gIG9wdC55ID0gMFxyXG4gIGlmIChJU19NT0JJTEUpIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggLyA2XHJcbiAgfSBlbHNlIHtcclxuICAgIGxldCBkaXZpZGUgPSBzY2VuZVdpZHRoIDwgNDAwID8gNiA6IHNjZW5lV2lkdGggPCA4MDAgPyAxMiA6IDIwXHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIC8gZGl2aWRlXHJcbiAgfVxyXG4gIG9wdC54ID0gc2NlbmVXaWR0aCAtIG9wdC53aWR0aFxyXG4gIHJldHVybiBvcHRcclxufVxyXG5cclxuY2xhc3MgUGxheVNjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yICh7IG1hcEZpbGUsIHBvc2l0aW9uIH0pIHtcclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLm1hcEZpbGUgPSBtYXBGaWxlXHJcbiAgICB0aGlzLnRvUG9zaXRpb24gPSBwb3NpdGlvblxyXG4gIH1cclxuXHJcbiAgY3JlYXRlICgpIHtcclxuICAgIHNjZW5lV2lkdGggPSB0aGlzLnBhcmVudC53aWR0aFxyXG4gICAgc2NlbmVIZWlnaHQgPSB0aGlzLnBhcmVudC5oZWlnaHRcclxuICAgIHRoaXMuaXNNYXBMb2FkZWQgPSBmYWxzZVxyXG4gICAgdGhpcy5sb2FkTWFwKClcclxuICAgIHRoaXMuaW5pdFBsYXllcigpXHJcbiAgICB0aGlzLmluaXRVaSgpXHJcbiAgfVxyXG5cclxuICBpbml0VWkgKCkge1xyXG4gICAgbGV0IHVpR3JvdXAgPSBuZXcgZGlzcGxheS5Hcm91cCgwLCB0cnVlKVxyXG4gICAgbGV0IHVpTGF5ZXIgPSBuZXcgZGlzcGxheS5MYXllcih1aUdyb3VwKVxyXG4gICAgdWlMYXllci5wYXJlbnRMYXllciA9IHRoaXNcclxuICAgIHVpTGF5ZXIuZ3JvdXAuZW5hYmxlU29ydCA9IHRydWVcclxuICAgIHRoaXMuYWRkQ2hpbGQodWlMYXllcilcclxuXHJcbiAgICBsZXQgbWVzc2FnZVdpbmRvdyA9IG5ldyBNZXNzYWdlV2luZG93KGdldE1lc3NhZ2VXaW5kb3dPcHQoKSlcclxuICAgIGxldCBwbGF5ZXJXaW5kb3cgPSBuZXcgUGxheWVyV2luZG93KGdldFBsYXllcldpbmRvd09wdCh0aGlzLmNhdCkpXHJcbiAgICBsZXQgaW52ZW50b3J5V2luZG93ID0gbmV3IEludmVudG9yeVdpbmRvdyhnZXRJbnZlbnRvcnlXaW5kb3dPcHQodGhpcy5jYXQpKVxyXG5cclxuICAgIC8vIOiuk1VJ6aGv56S65Zyo6aCC5bGkXHJcbiAgICBtZXNzYWdlV2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgcGxheWVyV2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgaW52ZW50b3J5V2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgdWlMYXllci5hZGRDaGlsZChtZXNzYWdlV2luZG93KVxyXG4gICAgdWlMYXllci5hZGRDaGlsZChwbGF5ZXJXaW5kb3cpXHJcbiAgICB1aUxheWVyLmFkZENoaWxkKGludmVudG9yeVdpbmRvdylcclxuXHJcbiAgICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICAgIC8vIOWPquacieaJi+apn+imgeinuOaOp+adv1xyXG4gICAgICAvLyDmlrnlkJHmjqfliLZcclxuICAgICAgbGV0IGRpcmVjdGlvblBhbmVsID0gbmV3IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsKHtcclxuICAgICAgICB4OiBzY2VuZVdpZHRoIC8gNCxcclxuICAgICAgICB5OiBzY2VuZUhlaWdodCAqIDQgLyA2LFxyXG4gICAgICAgIHJhZGl1czogc2NlbmVXaWR0aCAvIDhcclxuICAgICAgfSlcclxuICAgICAgZGlyZWN0aW9uUGFuZWwucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcblxyXG4gICAgICAvLyDmk43kvZzmjqfliLZcclxuICAgICAgbGV0IG9wZXJhdGlvblBhbmVsID0gbmV3IFRvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsKHtcclxuICAgICAgICB4OiBzY2VuZVdpZHRoIC8gNCAqIDMsXHJcbiAgICAgICAgeTogc2NlbmVIZWlnaHQgKiA0IC8gNixcclxuICAgICAgICByYWRpdXM6IHNjZW5lV2lkdGggLyAxMFxyXG4gICAgICB9KVxyXG4gICAgICBvcGVyYXRpb25QYW5lbC5wYXJlbnRHcm91cCA9IHVpR3JvdXBcclxuXHJcbiAgICAgIHVpTGF5ZXIuYWRkQ2hpbGQoZGlyZWN0aW9uUGFuZWwpXHJcbiAgICAgIHVpTGF5ZXIuYWRkQ2hpbGQob3BlcmF0aW9uUGFuZWwpXHJcbiAgICAgIC8vIHJlcXVpcmUoJy4uL2xpYi9kZW1vJylcclxuICAgIH1cclxuICAgIG1lc3NhZ2VXaW5kb3cuYWRkKFsnc2NlbmUgc2l6ZTogKCcsIHNjZW5lV2lkdGgsICcsICcsIHNjZW5lSGVpZ2h0LCAnKS4nXS5qb2luKCcnKSlcclxuICB9XHJcblxyXG4gIGluaXRQbGF5ZXIgKCkge1xyXG4gICAgaWYgKCF0aGlzLmNhdCkge1xyXG4gICAgICB0aGlzLmNhdCA9IG5ldyBDYXQoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbG9hZE1hcCAoKSB7XHJcbiAgICBsZXQgZmlsZU5hbWUgPSAnd29ybGQvJyArIHRoaXMubWFwRmlsZVxyXG5cclxuICAgIC8vIGlmIG1hcCBub3QgbG9hZGVkIHlldFxyXG4gICAgaWYgKCFyZXNvdXJjZXNbZmlsZU5hbWVdKSB7XHJcbiAgICAgIGxvYWRlclxyXG4gICAgICAgIC5hZGQoZmlsZU5hbWUsIGZpbGVOYW1lICsgJy5qc29uJylcclxuICAgICAgICAubG9hZCh0aGlzLnNwYXduTWFwLmJpbmQodGhpcywgZmlsZU5hbWUpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zcGF3bk1hcChmaWxlTmFtZSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNwYXduTWFwIChmaWxlTmFtZSkge1xyXG4gICAgbGV0IG1hcERhdGEgPSByZXNvdXJjZXNbZmlsZU5hbWVdLmRhdGFcclxuICAgIGxldCBtYXBTY2FsZSA9IElTX01PQklMRSA/IDIgOiAwLjVcclxuXHJcbiAgICBsZXQgbWFwID0gbmV3IE1hcChtYXBTY2FsZSlcclxuICAgIHRoaXMuYWRkQ2hpbGQobWFwKVxyXG4gICAgbWFwLmxvYWQobWFwRGF0YSlcclxuXHJcbiAgICBtYXAub24oJ3VzZScsIG8gPT4ge1xyXG4gICAgICB0aGlzLmlzTWFwTG9hZGVkID0gZmFsc2VcclxuICAgICAgLy8gY2xlYXIgb2xkIG1hcFxyXG4gICAgICB0aGlzLnJlbW92ZUNoaWxkKHRoaXMubWFwKVxyXG4gICAgICB0aGlzLm1hcC5kZXN0cm95KClcclxuXHJcbiAgICAgIHRoaXMubWFwRmlsZSA9IG8ubWFwXHJcbiAgICAgIHRoaXMudG9Qb3NpdGlvbiA9IG8udG9Qb3NpdGlvblxyXG4gICAgICB0aGlzLmxvYWRNYXAoKVxyXG4gICAgfSlcclxuXHJcbiAgICBtYXAuYWRkUGxheWVyKHRoaXMuY2F0LCB0aGlzLnRvUG9zaXRpb24pXHJcbiAgICB0aGlzLm1hcCA9IG1hcFxyXG5cclxuICAgIHRoaXMuaXNNYXBMb2FkZWQgPSB0cnVlXHJcbiAgfVxyXG5cclxuICB0aWNrIChkZWx0YSkge1xyXG4gICAgaWYgKCF0aGlzLmlzTWFwTG9hZGVkKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5tYXAudGljayhkZWx0YSlcclxuICAgIC8vIEZJWE1FOiBnYXAgYmV0d2VlbiB0aWxlcyBvbiBpUGhvbmUgU2FmYXJpXHJcbiAgICB0aGlzLm1hcC5wb3NpdGlvbi5zZXQoXHJcbiAgICAgIE1hdGguZmxvb3Ioc2NlbmVXaWR0aCAvIDIgLSB0aGlzLmNhdC54KSxcclxuICAgICAgTWF0aC5mbG9vcihzY2VuZUhlaWdodCAvIDIgLSB0aGlzLmNhdC55KVxyXG4gICAgKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxheVNjZW5lXHJcbiIsImltcG9ydCBXaW5kb3cgZnJvbSAnLi9XaW5kb3cnXG5pbXBvcnQgeyBDb250YWluZXIsIEdyYXBoaWNzLCBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCB7IEFCSUxJVFlfQ0FSUlkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBTbG90IGV4dGVuZHMgQ29udGFpbmVyIHtcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXG5cbiAgICBsZXQgcmVjdCA9IG5ldyBHcmFwaGljcygpXG4gICAgcmVjdC5iZWdpbkZpbGwoMHhBMkEyQTIpXG4gICAgcmVjdC5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgNSlcbiAgICByZWN0LmVuZEZpbGwoKVxuICAgIHRoaXMuYWRkQ2hpbGQocmVjdClcbiAgfVxuXG4gIHNldENvbnRleHQgKGl0ZW0sIGNvdW50KSB7XG4gICAgdGhpcy5jbGVhckNvbnRleHQoKVxuXG4gICAgbGV0IHdpZHRoID0gdGhpcy53aWR0aFxuICAgIGxldCBoZWlnaHQgPSB0aGlzLmhlaWdodFxuICAgIC8vIOe9ruS4rVxuICAgIGl0ZW0gPSBuZXcgaXRlbS5jb25zdHJ1Y3RvcigpXG4gICAgbGV0IG1heFNpZGUgPSBNYXRoLm1heChpdGVtLndpZHRoLCBpdGVtLmhlaWdodClcbiAgICBsZXQgc2NhbGUgPSB3aWR0aCAvIG1heFNpZGVcbiAgICBpdGVtLnNjYWxlLnNldChzY2FsZSwgc2NhbGUpXG4gICAgaXRlbS5hbmNob3Iuc2V0KDAuNSwgMC41KVxuICAgIGl0ZW0ucG9zaXRpb24uc2V0KHdpZHRoIC8gMiwgaGVpZ2h0IC8gMilcbiAgICB0aGlzLmFkZENoaWxkKGl0ZW0pXG5cbiAgICAvLyDmlbjph49cbiAgICBsZXQgZm9udFNpemUgPSB0aGlzLndpZHRoICogMC4zXG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICBmaWxsOiAncmVkJyxcbiAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxuICAgICAgbGluZUhlaWdodDogZm9udFNpemVcbiAgICB9KVxuICAgIGxldCBjb3VudFRleHQgPSBjb3VudCA9PT0gSW5maW5pdHkgPyAn4oieJyA6IGNvdW50XG4gICAgbGV0IHRleHQgPSBuZXcgVGV4dChjb3VudFRleHQsIHN0eWxlKVxuICAgIHRleHQucG9zaXRpb24uc2V0KHdpZHRoICogMC45NSwgaGVpZ2h0KVxuICAgIHRleHQuYW5jaG9yLnNldCgxLCAxKVxuICAgIHRoaXMuYWRkQ2hpbGQodGV4dClcblxuICAgIHRoaXMuaXRlbSA9IGl0ZW1cbiAgICB0aGlzLnRleHQgPSB0ZXh0XG4gIH1cblxuICBjbGVhckNvbnRleHQgKCkge1xuICAgIGlmICh0aGlzLml0ZW0pIHtcbiAgICAgIHRoaXMuaXRlbS5kZXN0cm95KClcbiAgICAgIHRoaXMudGV4dC5kZXN0cm95KClcbiAgICAgIGRlbGV0ZSB0aGlzLml0ZW1cbiAgICAgIGRlbGV0ZSB0aGlzLnRleHRcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgSW52ZW50b3J5V2luZG93IGV4dGVuZHMgV2luZG93IHtcbiAgY29uc3RydWN0b3IgKG9wdCkge1xuICAgIGxldCB7IHBsYXllciwgd2lkdGggfSA9IG9wdFxuICAgIGxldCBwYWRkaW5nID0gd2lkdGggKiAwLjFcbiAgICBsZXQgY2VpbFNpemUgPSB3aWR0aCAtIHBhZGRpbmcgKiAyXG4gICAgbGV0IGNlaWxPcHQgPSB7XG4gICAgICB4OiBwYWRkaW5nLFxuICAgICAgeTogcGFkZGluZyxcbiAgICAgIHdpZHRoOiBjZWlsU2l6ZSxcbiAgICAgIGhlaWdodDogY2VpbFNpemVcbiAgICB9XG4gICAgbGV0IHNsb3RDb3VudCA9IDRcbiAgICBvcHQuaGVpZ2h0ID0gKHdpZHRoIC0gcGFkZGluZykgKiBzbG90Q291bnQgKyBwYWRkaW5nXG5cbiAgICBzdXBlcihvcHQpXG5cbiAgICB0aGlzLl9vcHQgPSBvcHRcbiAgICBwbGF5ZXIub24oJ2ludmVudG9yeS1tb2RpZmllZCcsIHRoaXMub25JbnZlbnRvcnlNb2RpZmllZC5iaW5kKHRoaXMsIHBsYXllcikpXG5cbiAgICB0aGlzLnNsb3RDb250YWluZXJzID0gW11cbiAgICB0aGlzLnNsb3RzID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsb3RDb3VudDsgaSsrKSB7XG4gICAgICBsZXQgc2xvdCA9IG5ldyBTbG90KGNlaWxPcHQpXG4gICAgICB0aGlzLmFkZENoaWxkKHNsb3QpXG4gICAgICB0aGlzLnNsb3RDb250YWluZXJzLnB1c2goc2xvdClcbiAgICAgIGNlaWxPcHQueSArPSBjZWlsU2l6ZSArIHBhZGRpbmdcbiAgICB9XG5cbiAgICB0aGlzLm9uSW52ZW50b3J5TW9kaWZpZWQocGxheWVyKVxuICB9XG5cbiAgb25JbnZlbnRvcnlNb2RpZmllZCAocGxheWVyKSB7XG4gICAgbGV0IGNhcnJ5QWJpbGl0eSA9IHBsYXllcltBQklMSVRZX0NBUlJZXVxuICAgIGlmICghY2FycnlBYmlsaXR5KSB7XG4gICAgICAvLyBubyBpbnZlbnRvcnkgeWV0XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGkgPSAwXG4gICAgY2FycnlBYmlsaXR5LmJhZ3MuZm9yRWFjaChiYWcgPT4gYmFnLmZvckVhY2goc2xvdCA9PiB7XG4gICAgICB0aGlzLnNsb3RzW2ldID0gc2xvdFxuICAgICAgaSsrXG4gICAgfSkpXG4gICAgdGhpcy5zbG90Q29udGFpbmVycy5mb3JFYWNoKChjb250YWluZXIsIGkpID0+IHtcbiAgICAgIGxldCBzbG90ID0gdGhpcy5zbG90c1tpXVxuICAgICAgaWYgKHNsb3QpIHtcbiAgICAgICAgY29udGFpbmVyLnNldENvbnRleHQoc2xvdC5pdGVtLCBzbG90LmNvdW50KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGFpbmVyLmNsZWFyQ29udGV4dCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3dpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnZlbnRvcnlXaW5kb3dcbiIsImltcG9ydCB7IFRleHQsIFRleHRTdHlsZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgU2Nyb2xsYWJsZVdpbmRvdyBmcm9tICcuL1Njcm9sbGFibGVXaW5kb3cnXG5pbXBvcnQgbWVzc2FnZXMgZnJvbSAnLi4vbGliL01lc3NhZ2VzJ1xuXG5jbGFzcyBNZXNzYWdlV2luZG93IGV4dGVuZHMgU2Nyb2xsYWJsZVdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG5cbiAgICBsZXQgeyBmb250U2l6ZSA9IDEyIH0gPSBvcHRcblxuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgZmlsbDogJ2dyZWVuJyxcbiAgICAgIGJyZWFrV29yZHM6IHRydWUsXG4gICAgICB3b3JkV3JhcDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGg6IHRoaXMud2luZG93V2lkdGhcbiAgICB9KVxuICAgIGxldCB0ZXh0ID0gbmV3IFRleHQoJycsIHN0eWxlKVxuXG4gICAgdGhpcy5hZGRXaW5kb3dDaGlsZCh0ZXh0KVxuICAgIHRoaXMudGV4dCA9IHRleHRcblxuICAgIHRoaXMuYXV0b1Njcm9sbFRvQm90dG9tID0gdHJ1ZVxuXG4gICAgbWVzc2FnZXMub24oJ21vZGlmaWVkJywgdGhpcy5tb2RpZmllZC5iaW5kKHRoaXMpKVxuICB9XG5cbiAgbW9kaWZpZWQgKCkge1xuICAgIGxldCBzY3JvbGxQZXJjZW50ID0gdGhpcy5zY3JvbGxQZXJjZW50XG4gICAgdGhpcy50ZXh0LnRleHQgPSBbXS5jb25jYXQobWVzc2FnZXMubGlzdCkucmV2ZXJzZSgpLmpvaW4oJ1xcbicpXG4gICAgdGhpcy51cGRhdGVTY3JvbGxCYXJMZW5ndGgoKVxuXG4gICAgLy8g6Iulc2Nyb2xs572u5bqV77yM6Ieq5YuV5o2y5YuV572u5bqVXG4gICAgaWYgKHNjcm9sbFBlcmNlbnQgPT09IDEpIHtcbiAgICAgIHRoaXMuc2Nyb2xsVG8oMSlcbiAgICB9XG4gIH1cblxuICBhZGQgKG1zZykge1xuICAgIG1lc3NhZ2VzLmFkZChtc2cpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdtZXNzYWdlLXdpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlV2luZG93XG4iLCJpbXBvcnQgeyBDb250YWluZXIsIFRleHQsIFRleHRTdHlsZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IHsgQUJJTElUWV9NT1ZFLCBBQklMSVRZX0NBTUVSQSwgQUJJTElUWV9PUEVSQVRFLCBBQklMSVRZX0NBUlJZLCBBQklMSVRZX1BMQUNFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY29uc3QgQUJJTElUSUVTX0FMTCA9IFtcbiAgQUJJTElUWV9NT1ZFLFxuICBBQklMSVRZX0NBTUVSQSxcbiAgQUJJTElUWV9PUEVSQVRFLFxuICBBQklMSVRZX1BMQUNFXG5dXG5cbmNsYXNzIFBsYXllcldpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG4gICAgbGV0IHsgcGxheWVyIH0gPSBvcHRcbiAgICB0aGlzLl9vcHQgPSBvcHRcbiAgICBwbGF5ZXIub24oJ2FiaWxpdHktY2FycnknLCB0aGlzLm9uQWJpbGl0eUNhcnJ5LmJpbmQodGhpcywgcGxheWVyKSlcblxuICAgIHRoaXMuYWJpbGl0eVRleHRDb250YWluZXIgPSBuZXcgQ29udGFpbmVyKClcbiAgICB0aGlzLmFiaWxpdHlUZXh0Q29udGFpbmVyLnggPSA1XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLmFiaWxpdHlUZXh0Q29udGFpbmVyKVxuXG4gICAgdGhpcy5vbkFiaWxpdHlDYXJyeShwbGF5ZXIpXG4gIH1cblxuICBvbkFiaWxpdHlDYXJyeSAocGxheWVyKSB7XG4gICAgbGV0IGkgPSAwXG4gICAgbGV0IHsgZm9udFNpemUgPSAxMCB9ID0gdGhpcy5fb3B0XG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgbGluZUhlaWdodDogZm9udFNpemVcbiAgICB9KVxuXG4gICAgLy8g5pu05paw6Z2i5p2/5pW45pOaXG4gICAgbGV0IGNvbnRpYW5lciA9IHRoaXMuYWJpbGl0eVRleHRDb250YWluZXJcbiAgICBjb250aWFuZXIucmVtb3ZlQ2hpbGRyZW4oKVxuICAgIEFCSUxJVElFU19BTEwuZm9yRWFjaChhYmlsaXR5U3ltYm9sID0+IHtcbiAgICAgIGxldCBhYmlsaXR5ID0gcGxheWVyLmFiaWxpdGllc1thYmlsaXR5U3ltYm9sXVxuICAgICAgaWYgKGFiaWxpdHkpIHtcbiAgICAgICAgbGV0IHRleHQgPSBuZXcgVGV4dChhYmlsaXR5LnRvU3RyaW5nKCksIHN0eWxlKVxuICAgICAgICB0ZXh0LnkgPSBpICogKGZvbnRTaXplICsgNSlcblxuICAgICAgICBjb250aWFuZXIuYWRkQ2hpbGQodGV4dClcblxuICAgICAgICBpKytcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllcldpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IFdyYXBwZXIgZnJvbSAnLi9XcmFwcGVyJ1xuXG5jbGFzcyBTY3JvbGxhYmxlV2luZG93IGV4dGVuZHMgV2luZG93IHtcbiAgY29uc3RydWN0b3IgKG9wdCkge1xuICAgIHN1cGVyKG9wdClcbiAgICBsZXQge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBwYWRkaW5nID0gOCxcbiAgICAgIHNjcm9sbEJhcldpZHRoID0gMTBcbiAgICB9ID0gb3B0XG4gICAgdGhpcy5fb3B0ID0gb3B0XG5cbiAgICB0aGlzLl9pbml0U2Nyb2xsYWJsZUFyZWEoXG4gICAgICB3aWR0aCAtIHBhZGRpbmcgKiAyIC0gc2Nyb2xsQmFyV2lkdGggLSA1LFxuICAgICAgaGVpZ2h0IC0gcGFkZGluZyAqIDIsXG4gICAgICBwYWRkaW5nKVxuICAgIHRoaXMuX2luaXRTY3JvbGxCYXIoe1xuICAgICAgLy8gd2luZG93IHdpZHRoIC0gd2luZG93IHBhZGRpbmcgLSBiYXIgd2lkdGhcbiAgICAgIHg6IHdpZHRoIC0gcGFkZGluZyAtIHNjcm9sbEJhcldpZHRoLFxuICAgICAgeTogcGFkZGluZyxcbiAgICAgIHdpZHRoOiBzY3JvbGxCYXJXaWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0IC0gcGFkZGluZyAqIDJcbiAgICB9KVxuICB9XG5cbiAgX2luaXRTY3JvbGxhYmxlQXJlYSAod2lkdGgsIGhlaWdodCwgcGFkZGluZykge1xuICAgIC8vIGhvbGQgcGFkZGluZ1xuICAgIGxldCBfbWFpblZpZXcgPSBuZXcgQ29udGFpbmVyKClcbiAgICBfbWFpblZpZXcucG9zaXRpb24uc2V0KHBhZGRpbmcsIHBhZGRpbmcpXG4gICAgdGhpcy5hZGRDaGlsZChfbWFpblZpZXcpXG5cbiAgICB0aGlzLm1haW5WaWV3ID0gbmV3IENvbnRhaW5lcigpXG4gICAgX21haW5WaWV3LmFkZENoaWxkKHRoaXMubWFpblZpZXcpXG5cbiAgICAvLyBoaWRlIG1haW5WaWV3J3Mgb3ZlcmZsb3dcbiAgICBsZXQgbWFzayA9IG5ldyBHcmFwaGljcygpXG4gICAgbWFzay5iZWdpbkZpbGwoMHhGRkZGRkYpXG4gICAgbWFzay5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgNSlcbiAgICBtYXNrLmVuZEZpbGwoKVxuICAgIHRoaXMubWFpblZpZXcubWFzayA9IG1hc2tcbiAgICBfbWFpblZpZXcuYWRkQ2hpbGQobWFzaylcblxuICAgIC8vIHdpbmRvdyB3aWR0aCAtIHdpbmRvdyBwYWRkaW5nICogMiAtIGJhciB3aWR0aCAtIGJldHdlZW4gc3BhY2VcbiAgICB0aGlzLl93aW5kb3dXaWR0aCA9IHdpZHRoXG4gICAgdGhpcy5fd2luZG93SGVpZ2h0ID0gaGVpZ2h0XG4gIH1cblxuICBfaW5pdFNjcm9sbEJhciAoeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0pIHtcbiAgICBsZXQgY29uYXRpbmVyID0gbmV3IENvbnRhaW5lcigpXG4gICAgY29uYXRpbmVyLnggPSB4XG4gICAgY29uYXRpbmVyLnkgPSB5XG5cbiAgICBsZXQgc2Nyb2xsQmFyQmcgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHNjcm9sbEJhckJnLmJlZ2luRmlsbCgweEE4QThBOClcbiAgICBzY3JvbGxCYXJCZy5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgMilcbiAgICBzY3JvbGxCYXJCZy5lbmRGaWxsKClcblxuICAgIGxldCBzY3JvbGxCYXIgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHNjcm9sbEJhci5iZWdpbkZpbGwoMHgyMjIyMjIpXG4gICAgc2Nyb2xsQmFyLmRyYXdSb3VuZGVkUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0LCAzKVxuICAgIHNjcm9sbEJhci5lbmRGaWxsKClcbiAgICBzY3JvbGxCYXIudG9TdHJpbmcgPSAoKSA9PiAnc2Nyb2xsQmFyJ1xuICAgIFdyYXBwZXIuZHJhZ2dhYmxlKHNjcm9sbEJhciwge1xuICAgICAgYm91bmRhcnk6IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMCxcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgfVxuICAgIH0pXG4gICAgc2Nyb2xsQmFyLm9uKCdkcmFnJywgdGhpcy5zY3JvbGxNYWluVmlldy5iaW5kKHRoaXMpKVxuXG4gICAgY29uYXRpbmVyLmFkZENoaWxkKHNjcm9sbEJhckJnKVxuICAgIGNvbmF0aW5lci5hZGRDaGlsZChzY3JvbGxCYXIpXG4gICAgdGhpcy5hZGRDaGlsZChjb25hdGluZXIpXG4gICAgdGhpcy5zY3JvbGxCYXIgPSBzY3JvbGxCYXJcbiAgICB0aGlzLnNjcm9sbEJhckJnID0gc2Nyb2xsQmFyQmdcbiAgfVxuXG4gIC8vIOaNsuWLleimlueql1xuICBzY3JvbGxNYWluVmlldyAoKSB7XG4gICAgdGhpcy5tYWluVmlldy55ID0gKHRoaXMud2luZG93SGVpZ2h0IC0gdGhpcy5tYWluVmlldy5oZWlnaHQpICogdGhpcy5zY3JvbGxQZXJjZW50XG4gIH1cblxuICAvLyDmlrDlop7nianku7boh7PoppbnqpdcbiAgYWRkV2luZG93Q2hpbGQgKGNoaWxkKSB7XG4gICAgdGhpcy5tYWluVmlldy5hZGRDaGlsZChjaGlsZClcbiAgfVxuXG4gIC8vIOabtOaWsOaNsuWLleajkuWkp+Wwjywg5LiN5LiA5a6a6KaB6Kq/55SoXG4gIHVwZGF0ZVNjcm9sbEJhckxlbmd0aCAoKSB7XG4gICAgbGV0IHsgc2Nyb2xsQmFyTWluSGVpZ2h0ID0gMjAgfSA9IHRoaXMuX29wdFxuXG4gICAgbGV0IGRoID0gdGhpcy5tYWluVmlldy5oZWlnaHQgLyB0aGlzLndpbmRvd0hlaWdodFxuICAgIGlmIChkaCA8IDEpIHtcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC8gZGhcbiAgICAgIC8vIOmBv+WFjeWkquWwj+W+iOmbo+aLluabs1xuICAgICAgdGhpcy5zY3JvbGxCYXIuaGVpZ2h0ID0gTWF0aC5tYXgoc2Nyb2xsQmFyTWluSGVpZ2h0LCB0aGlzLnNjcm9sbEJhci5oZWlnaHQpXG4gICAgfVxuICAgIHRoaXMuc2Nyb2xsQmFyLmZhbGxiYWNrVG9Cb3VuZGFyeSgpXG4gIH1cblxuICAvLyDmjbLli5Xnmb7liIbmr5RcbiAgZ2V0IHNjcm9sbFBlcmNlbnQgKCkge1xuICAgIGxldCBkZWx0YSA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC0gdGhpcy5zY3JvbGxCYXIuaGVpZ2h0XG4gICAgcmV0dXJuIGRlbHRhID09PSAwID8gMSA6IHRoaXMuc2Nyb2xsQmFyLnkgLyBkZWx0YVxuICB9XG5cbiAgLy8g5o2y5YuV6Iez55m+5YiG5q+UXG4gIHNjcm9sbFRvIChwZXJjZW50KSB7XG4gICAgbGV0IGRlbHRhID0gdGhpcy5zY3JvbGxCYXJCZy5oZWlnaHQgLSB0aGlzLnNjcm9sbEJhci5oZWlnaHRcbiAgICBsZXQgeSA9IDBcbiAgICBpZiAoZGVsdGEgIT09IDApIHtcbiAgICAgIHkgPSBkZWx0YSAqIHBlcmNlbnRcbiAgICB9XG4gICAgdGhpcy5zY3JvbGxCYXIueSA9IHlcbiAgICB0aGlzLnNjcm9sbE1haW5WaWV3KClcbiAgfVxuXG4gIGdldCB3aW5kb3dXaWR0aCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpbmRvd1dpZHRoXG4gIH1cblxuICBnZXQgd2luZG93SGVpZ2h0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fd2luZG93SGVpZ2h0XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2Nyb2xsYWJsZVdpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uL2xpYi9WZWN0b3InXHJcblxyXG5pbXBvcnQga2V5Ym9hcmRKUyBmcm9tICdrZXlib2FyZGpzJ1xyXG5pbXBvcnQgeyBMRUZULCBVUCwgUklHSFQsIERPV04gfSBmcm9tICcuLi9jb25maWcvY29udHJvbCdcclxuXHJcbmNvbnN0IEFMTF9LRVlTID0gW1JJR0hULCBMRUZULCBVUCwgRE9XTl1cclxuXHJcbmNsYXNzIFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsIGV4dGVuZHMgQ29udGFpbmVyIHtcclxuICBjb25zdHJ1Y3RvciAoeyB4LCB5LCByYWRpdXMgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcclxuXHJcbiAgICBsZXQgdG91Y2hBcmVhID0gbmV3IEdyYXBoaWNzKClcclxuICAgIHRvdWNoQXJlYS5iZWdpbkZpbGwoMHhGMkYyRjIsIDAuNSlcclxuICAgIHRvdWNoQXJlYS5kcmF3Q2lyY2xlKDAsIDAsIHJhZGl1cylcclxuICAgIHRvdWNoQXJlYS5lbmRGaWxsKClcclxuICAgIHRoaXMuYWRkQ2hpbGQodG91Y2hBcmVhKVxyXG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXNcclxuXHJcbiAgICB0aGlzLnNldHVwVG91Y2goKVxyXG4gIH1cclxuXHJcbiAgc2V0dXBUb3VjaCAoKSB7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgbGV0IGYgPSB0aGlzLm9uVG91Y2guYmluZCh0aGlzKVxyXG4gICAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXHJcbiAgICB0aGlzLm9uKCd0b3VjaGVuZCcsIGYpXHJcbiAgICB0aGlzLm9uKCd0b3VjaG1vdmUnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2hlbmRvdXRzaWRlJywgZilcclxuICB9XHJcblxyXG4gIG9uVG91Y2ggKGUpIHtcclxuICAgIGxldCB0eXBlID0gZS50eXBlXHJcbiAgICBsZXQgcHJvcGFnYXRpb24gPSBmYWxzZVxyXG4gICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxyXG4gICAgICAgIHRoaXMuZHJhZyA9IGUuZGF0YS5nbG9iYWwuY2xvbmUoKVxyXG4gICAgICAgIHRoaXMuY3JlYXRlRHJhZ1BvaW50KClcclxuICAgICAgICB0aGlzLm9yaWdpblBvc2l0aW9uID0ge1xyXG4gICAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgICAgeTogdGhpcy55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ3RvdWNoZW5kJzpcclxuICAgICAgY2FzZSAndG91Y2hlbmRvdXRzaWRlJzpcclxuICAgICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICAgICAgdGhpcy5kZXN0cm95RHJhZ1BvaW50KClcclxuICAgICAgICAgIHRoaXMucmVsZWFzZUtleXMoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICd0b3VjaG1vdmUnOlxyXG4gICAgICAgIGlmICghdGhpcy5kcmFnKSB7XHJcbiAgICAgICAgICBwcm9wYWdhdGlvbiA9IHRydWVcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucHJlc3NLZXlzKGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpKVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcbiAgICBpZiAoIXByb3BhZ2F0aW9uKSB7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNyZWF0ZURyYWdQb2ludCAoKSB7XHJcbiAgICBsZXQgZHJhZ1BvaW50ID0gbmV3IEdyYXBoaWNzKClcclxuICAgIGRyYWdQb2ludC5iZWdpbkZpbGwoMHhGMkYyRjIsIDAuNSlcclxuICAgIGRyYWdQb2ludC5kcmF3Q2lyY2xlKDAsIDAsIDIwKVxyXG4gICAgZHJhZ1BvaW50LmVuZEZpbGwoKVxyXG4gICAgdGhpcy5hZGRDaGlsZChkcmFnUG9pbnQpXHJcbiAgICB0aGlzLmRyYWdQb2ludCA9IGRyYWdQb2ludFxyXG4gIH1cclxuXHJcbiAgZGVzdHJveURyYWdQb2ludCAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUNoaWxkKHRoaXMuZHJhZ1BvaW50KVxyXG4gICAgdGhpcy5kcmFnUG9pbnQuZGVzdHJveSgpXHJcbiAgfVxyXG5cclxuICBwcmVzc0tleXMgKG5ld1BvaW50KSB7XHJcbiAgICB0aGlzLnJlbGVhc2VLZXlzKClcclxuICAgIC8vIOaEn+aHiemdiOaVj+W6plxyXG4gICAgbGV0IHRocmVzaG9sZCA9IDMwXHJcblxyXG4gICAgbGV0IHZlY3RvciA9IFZlY3Rvci5mcm9tUG9pbnQobmV3UG9pbnQpXHJcbiAgICBsZXQgZGVnID0gdmVjdG9yLmRlZ1xyXG4gICAgbGV0IGxlbiA9IHZlY3Rvci5sZW5ndGhcclxuXHJcbiAgICBpZiAobGVuIDwgdGhyZXNob2xkKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgbGV0IGRlZ0FicyA9IE1hdGguYWJzKGRlZylcclxuICAgIGxldCBkeCA9IGRlZ0FicyA8IDY3LjUgPyBSSUdIVCA6IChkZWdBYnMgPiAxMTIuNSA/IExFRlQgOiBmYWxzZSlcclxuICAgIGxldCBkeSA9IGRlZ0FicyA8IDIyLjUgfHwgZGVnQWJzID4gMTU3LjUgPyBmYWxzZSA6IChkZWcgPCAwID8gVVAgOiBET1dOKVxyXG5cclxuICAgIGlmIChkeCB8fCBkeSkge1xyXG4gICAgICBpZiAoZHgpIHtcclxuICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KGR4KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChkeSkge1xyXG4gICAgICAgIGtleWJvYXJkSlMucHJlc3NLZXkoZHkpXHJcbiAgICAgIH1cclxuICAgICAgdmVjdG9yLm11bHRpcGx5U2NhbGFyKHRoaXMucmFkaXVzIC8gbGVuKVxyXG4gICAgICB0aGlzLmRyYWdQb2ludC5wb3NpdGlvbi5zZXQoXHJcbiAgICAgICAgdmVjdG9yLngsXHJcbiAgICAgICAgdmVjdG9yLnlcclxuICAgICAgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVsZWFzZUtleXMgKCkge1xyXG4gICAgQUxMX0tFWVMuZm9yRWFjaChrZXkgPT4ga2V5Ym9hcmRKUy5yZWxlYXNlS2V5KGtleSkpXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ1RvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVG91Y2hEaXJlY3Rpb25Db250cm9sUGFuZWxcclxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5cclxuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcclxuaW1wb3J0IHsgUExBQ0UxIH0gZnJvbSAnLi4vY29uZmlnL2NvbnRyb2wnXHJcblxyXG5jbGFzcyBUb3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgcmFkaXVzIH0pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXHJcblxyXG4gICAgbGV0IHRvdWNoQXJlYSA9IG5ldyBHcmFwaGljcygpXHJcbiAgICB0b3VjaEFyZWEuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXHJcbiAgICB0b3VjaEFyZWEuZHJhd0NpcmNsZSgwLCAwLCByYWRpdXMpXHJcbiAgICB0b3VjaEFyZWEuZW5kRmlsbCgpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRvdWNoQXJlYSlcclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzXHJcblxyXG4gICAgdGhpcy5zZXR1cFRvdWNoKClcclxuICB9XHJcblxyXG4gIHNldHVwVG91Y2ggKCkge1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgIGxldCBmID0gdGhpcy5vblRvdWNoLmJpbmQodGhpcylcclxuICAgIHRoaXMub24oJ3RvdWNoc3RhcnQnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2hlbmQnLCBmKVxyXG4gIH1cclxuXHJcbiAgb25Ub3VjaCAoZSkge1xyXG4gICAgbGV0IHR5cGUgPSBlLnR5cGVcclxuICAgIGxldCBwcm9wYWdhdGlvbiA9IGZhbHNlXHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgY2FzZSAndG91Y2hzdGFydCc6XHJcbiAgICAgICAgdGhpcy5kcmFnID0gdHJ1ZVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ3RvdWNoZW5kJzpcclxuICAgICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICAgICAga2V5Ym9hcmRKUy5wcmVzc0tleShQTEFDRTEpXHJcbiAgICAgICAgICBrZXlib2FyZEpTLnJlbGVhc2VLZXkoUExBQ0UxKVxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgaWYgKCFwcm9wYWdhdGlvbikge1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ1RvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWxcclxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5jbGFzcyBXaW5kb3cgZXh0ZW5kcyBDb250YWluZXIge1xuICBjb25zdHJ1Y3RvciAoeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcblxuICAgIGxldCBsaW5lV2lkdGggPSAzXG5cbiAgICBsZXQgd2luZG93QmcgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHdpbmRvd0JnLmJlZ2luRmlsbCgweEYyRjJGMilcbiAgICB3aW5kb3dCZy5saW5lU3R5bGUobGluZVdpZHRoLCAweDIyMjIyMiwgMSlcbiAgICB3aW5kb3dCZy5kcmF3Um91bmRlZFJlY3QoXG4gICAgICAwLCAwLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICA1KVxuICAgIHdpbmRvd0JnLmVuZEZpbGwoKVxuICAgIHRoaXMuYWRkQ2hpbGQod2luZG93QmcpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2luZG93XG4iLCJjb25zdCBPUFQgPSBTeW1ib2woJ29wdCcpXG5cbmZ1bmN0aW9uIF9lbmFibGVEcmFnZ2FibGUgKCkge1xuICB0aGlzLmRyYWcgPSBmYWxzZVxuICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxuICBsZXQgZiA9IF9vblRvdWNoLmJpbmQodGhpcylcbiAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXG4gIHRoaXMub24oJ3RvdWNoZW5kJywgZilcbiAgdGhpcy5vbigndG91Y2htb3ZlJywgZilcbiAgdGhpcy5vbigndG91Y2hlbmRvdXRzaWRlJywgZilcbiAgdGhpcy5vbignbW91c2Vkb3duJywgZilcbiAgdGhpcy5vbignbW91c2V1cCcsIGYpXG4gIHRoaXMub24oJ21vdXNlbW92ZScsIGYpXG4gIHRoaXMub24oJ21vdXNldXBvdXRzaWRlJywgZilcbn1cblxuZnVuY3Rpb24gX29uVG91Y2ggKGUpIHtcbiAgbGV0IHR5cGUgPSBlLnR5cGVcbiAgbGV0IHByb3BhZ2F0aW9uID0gZmFsc2VcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAndG91Y2hzdGFydCc6XG4gICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgIHRoaXMuZHJhZyA9IGUuZGF0YS5nbG9iYWwuY2xvbmUoKVxuICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbiA9IHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnlcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndG91Y2hlbmQnOlxuICAgIGNhc2UgJ3RvdWNoZW5kb3V0c2lkZSc6XG4gICAgY2FzZSAnbW91c2V1cCc6XG4gICAgY2FzZSAnbW91c2V1cG91dHNpZGUnOlxuICAgICAgdGhpcy5kcmFnID0gZmFsc2VcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndG91Y2htb3ZlJzpcbiAgICBjYXNlICdtb3VzZW1vdmUnOlxuICAgICAgaWYgKCF0aGlzLmRyYWcpIHtcbiAgICAgICAgcHJvcGFnYXRpb24gPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBsZXQgbmV3UG9pbnQgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcbiAgICAgIHRoaXMucG9zaXRpb24uc2V0KFxuICAgICAgICB0aGlzLm9yaWdpblBvc2l0aW9uLnggKyBuZXdQb2ludC54IC0gdGhpcy5kcmFnLngsXG4gICAgICAgIHRoaXMub3JpZ2luUG9zaXRpb24ueSArIG5ld1BvaW50LnkgLSB0aGlzLmRyYWcueVxuICAgICAgKVxuICAgICAgX2ZhbGxiYWNrVG9Cb3VuZGFyeS5jYWxsKHRoaXMpXG4gICAgICB0aGlzLmVtaXQoJ2RyYWcnKSAvLyBtYXliZSBjYW4gcGFzcyBwYXJhbSBmb3Igc29tZSByZWFzb246IGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpXG4gICAgICBicmVha1xuICB9XG4gIGlmICghcHJvcGFnYXRpb24pIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cbn1cblxuLy8g6YCA5Zue6YKK55WMXG5mdW5jdGlvbiBfZmFsbGJhY2tUb0JvdW5kYXJ5ICgpIHtcbiAgbGV0IHsgd2lkdGggPSB0aGlzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmhlaWdodCwgYm91bmRhcnkgfSA9IHRoaXNbT1BUXVxuICB0aGlzLnggPSBNYXRoLm1heCh0aGlzLngsIGJvdW5kYXJ5LngpXG4gIHRoaXMueCA9IE1hdGgubWluKHRoaXMueCwgYm91bmRhcnkueCArIGJvdW5kYXJ5LndpZHRoIC0gd2lkdGgpXG4gIHRoaXMueSA9IE1hdGgubWF4KHRoaXMueSwgYm91bmRhcnkueSlcbiAgdGhpcy55ID0gTWF0aC5taW4odGhpcy55LCBib3VuZGFyeS55ICsgYm91bmRhcnkuaGVpZ2h0IC0gaGVpZ2h0KVxufVxuY2xhc3MgV3JhcHBlciB7XG4gIC8qKlxuICAgKiBkaXNwbGF5T2JqZWN0OiB3aWxsIHdyYXBwZWQgRGlzcGxheU9iamVjdFxuICAgKiBvcHQ6IHtcbiAgICogIGJvdW5kYXJ5OiDmi5bmm7PpgornlYwgeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH1cbiAgICogIFssIHdpZHRoXTog6YKK55WM56Kw5pKe5a+sKGRlZmF1bHQ6IGRpc3BsYXlPYmplY3Qud2lkdGgpXG4gICAqICBbLCBoZWlnaHRdOiDpgornlYznorDmkp7pq5goZGVmYXVsdDogZGlzcGxheU9iamVjdC5oZWlnaHQpXG4gICAqICB9XG4gICAqL1xuICBzdGF0aWMgZHJhZ2dhYmxlIChkaXNwbGF5T2JqZWN0LCBvcHQpIHtcbiAgICBkaXNwbGF5T2JqZWN0W09QVF0gPSBvcHRcbiAgICBfZW5hYmxlRHJhZ2dhYmxlLmNhbGwoZGlzcGxheU9iamVjdClcbiAgICBkaXNwbGF5T2JqZWN0LmZhbGxiYWNrVG9Cb3VuZGFyeSA9IF9mYWxsYmFja1RvQm91bmRhcnlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXcmFwcGVyXG4iXX0=
