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

},{"./lib/Application":10,"./scenes/LoadingScene":52}],8:[function(require,module,exports){
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
var ABILITY_DAMAGE = exports.ABILITY_DAMAGE = Symbol('damage');
var ABILITIES_ALL = exports.ABILITIES_ALL = [ABILITY_MOVE, ABILITY_CAMERA, ABILITY_OPERATE, ABILITY_KEY_MOVE, ABILITY_HEALTH, ABILITY_CARRY, ABILITY_LEARN, ABILITY_PLACE, ABILITY_KEY_PLACE, ABILITY_KEY_FIRE, ABILITY_ROTATE, ABILITY_DAMAGE];

// object type, static object, not collide with
var STATIC = exports.STATIC = 'static';
// collide with
var STAY = exports.STAY = 'stay';
// touch will reply
var REPLY = exports.REPLY = 'reply';

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

var _globalEventManager = require('./globalEventManager');

var _globalEventManager2 = _interopRequireDefault(_globalEventManager);

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

var app = void 0;

var Application = function (_PixiApplication) {
  _inherits(Application, _PixiApplication);

  function Application() {
    var _ref;

    _classCallCheck(this, Application);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = Application.__proto__ || Object.getPrototypeOf(Application)).call.apply(_ref, [this].concat(args)));

    app = _this;
    return _this;
  }

  // only one instance for now


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

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      (_get2 = _get(Application.prototype.__proto__ || Object.getPrototypeOf(Application.prototype), 'start', this)).call.apply(_get2, [this].concat(args));

      // create a background make stage has width & height
      var view = this.renderer.view;
      this.stage.addChild(new _PIXI.Graphics().drawRect(0, 0, view.width, view.height));

      _globalEventManager2.default.setInteraction(this.renderer.plugins.interaction);

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
  }], [{
    key: 'getApp',
    value: function getApp() {
      return app;
    }
  }]);

  return Application;
}(_PIXI.Application);

exports.default = Application;

},{"./PIXI":17,"./globalEventManager":21}],11:[function(require,module,exports){
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

      var anchor = target.anchor;
      var x = target.width * (0.5 - anchor.x);
      var y = target.height * (0.5 - anchor.y);
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

},{"../config/constants":8,"./PIXI":17}],12:[function(require,module,exports){
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

var _MapWorld = require('../lib/MapWorld');

var _MapWorld2 = _interopRequireDefault(_MapWorld);

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

var isGameOver = false;

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
  die: function die(object) {
    isGameOver = true;
    object[_constants.ABILITY_KEY_FIRE].dropBy(object);
    object[_constants.ABILITY_KEY_MOVE].dropBy(object);
    object[_constants.ABILITY_ROTATE].dropBy(object);
    object.say('You die.');
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

    _classCallCheck(this, Map);

    var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this));

    _this.ceilSize = _constants.CEIL_SIZE;

    _this.objects = (_this$objects = {}, _defineProperty(_this$objects, _constants.STATIC, []), _defineProperty(_this$objects, _constants.STAY, []), _defineProperty(_this$objects, _constants.REPLY, []), _this$objects);
    _this.map = new _PIXI.Container();
    _this.map.willRemoveChild = _this.willRemoveChild.bind(_this);
    _this.addChild(_this.map);

    // player group
    _this.playerGroup = new _PIXI.display.Group();
    var playerLayer = new _PIXI.display.Layer(_this.playerGroup);
    _this.addChild(playerLayer);

    // physic
    _this.mapWorld = new _MapWorld2.default();

    _this.willRemoved = [];
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

      var ceilSize = this.ceilSize;

      var addGameObject = function addGameObject(i, j, id, params) {
        var o = (0, _utils.instanceByItemId)(id, params);
        _this2.addGameObject(o, i * ceilSize, j * ceilSize);
        return [o, i, j];
      };

      var registerOn = function registerOn(_ref) {
        var _ref2 = _slicedToArray(_ref, 3),
            o = _ref2[0],
            i = _ref2[1],
            j = _ref2[2];

        o.on('use', function () {
          return _this2.emit('use', o);
        });
        o.on('fire', objectEvent.fire.bind(_this2, o));
        // TODO: remove map item
        // delete items[i]
        return [o, i, j];
      };

      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          pipe(addGameObject, registerOn)(i, j, tiles[j * cols + i]);
        }
      }
      items.forEach(function (item) {
        var _item = _slicedToArray(item, 3),
            id = _item[0],
            _item$ = _slicedToArray(_item[1], 2),
            i = _item$[0],
            j = _item$[1],
            params = _item[2];

        pipe(addGameObject, registerOn)(i, j, id, params);
      });
    }
  }, {
    key: 'addPlayer',
    value: function addPlayer(player, toPosition) {
      var _this3 = this;

      // 註冊事件
      Object.entries(objectEvent).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            eventName = _ref4[0],
            handler = _ref4[1];

        var eInstance = handler.bind(_this3, player);
        player.on(eventName, eInstance);
        player.once('removed', player.off.bind(player, eventName, eInstance));
      });
      // 新增至地圖上
      this.addGameObject(player, toPosition[0] * this.ceilSize, toPosition[1] * this.ceilSize);

      // player 置頂顯示
      player.parentGroup = this.playerGroup;

      this.player = player;
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      var _this4 = this;

      if (isGameOver) {
        return;
      }
      this.objects[_constants.STAY].forEach(function (o) {
        return o.tick(delta);
      });
      this.mapWorld.update(delta);
      this.willRemoved.forEach(function (child) {
        _this4.map.removeChild(child);
        // child.destroy()wadwa
      });
    }
  }, {
    key: 'addGameObject',
    value: function addGameObject(o) {
      var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      if (x !== undefined) {
        o.positionEx.set(x, y);
      }
      o.anchor.set(0.5, 0.5);

      var oArray = this.objects[o.type];
      oArray.push(o);
      o.once('removed', function () {
        var inx = oArray.indexOf(o);
        oArray.splice(inx, 1);
      });

      // add to world
      this.mapWorld.add(o);
      this.map.addChild(o);
    }
  }, {
    key: 'setScale',
    value: function setScale(scale) {
      this.scale.set(scale);
      this.mapWorld.scale(scale);
    }
  }, {
    key: 'setPosition',
    value: function setPosition(x, y) {
      this.position.set(x, y);
    }
  }, {
    key: 'debug',
    value: function debug(opt) {
      this.mapWorld.enableRender(opt);
      this.mapWorld.follow(this.player.body);
    }
  }, {
    key: 'willRemoveChild',
    value: function willRemoveChild(child) {
      this.willRemoved.push(child);
    }
  }]);

  return Map;
}(_PIXI.Container);

exports.default = Map;

},{"../config/constants":8,"../lib/MapWorld":14,"./PIXI":17,"./utils":22}],13:[function(require,module,exports){
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

var MapFog = function (_Container) {
  _inherits(MapFog, _Container);

  function MapFog() {
    _classCallCheck(this, MapFog);

    var _this = _possibleConstructorReturn(this, (MapFog.__proto__ || Object.getPrototypeOf(MapFog)).call(this));

    var lighting = new _PIXI.display.Layer();
    lighting.on('display', function (element) {
      element.blendMode = _PIXI.BLEND_MODES.ADD;
    });
    lighting.useRenderTexture = true;
    lighting.clearColor = [0, 0, 0, 1]; // ambient gray

    _this.addChild(lighting);

    var lightingSprite = new _PIXI.Sprite(lighting.getRenderTexture());
    lightingSprite.blendMode = _PIXI.BLEND_MODES.MULTIPLY;

    _this.addChild(lightingSprite);

    _this.lighting = lighting;
    return _this;
  }

  _createClass(MapFog, [{
    key: 'enable',
    value: function enable(map) {
      this.lighting.clearColor = [0, 0, 0, 1];
      map.map.lighting = this.lighting;
    }

    // 消除迷霧

  }, {
    key: 'disable',
    value: function disable() {
      this.lighting.clearColor = [1, 1, 1, 1];
    }
  }]);

  return MapFog;
}(_PIXI.Container);

exports.default = MapFog;

},{"./PIXI":17}],14:[function(require,module,exports){
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

var _Matter = require('./Matter');

var _constants = require('../config/constants');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var PARENT = Symbol('parent');

function _follow(body) {
  var engine = this.engine;
  var initialEngineBoundsMaxX = this.initialEngineBoundsMaxX;
  var initialEngineBoundsMaxY = this.initialEngineBoundsMaxY;
  var centerX = -this.center.x;
  var centerY = -this.center.y;
  var bounds = engine.render.bounds;
  var bodyX = body.position.x;
  var bodyY = body.position.y;

  // Fallow Hero X
  bounds.min.x = centerX + bodyX;
  bounds.max.x = centerX + bodyX + initialEngineBoundsMaxX;

  // Fallow Hero Y
  bounds.min.y = centerY + bodyY;
  bounds.max.y = centerY + bodyY + initialEngineBoundsMaxY;

  _Matter.Mouse.setOffset(this.mouseConstraint.mouse, bounds.min);
}

var MapWorld = function () {
  function MapWorld() {
    _classCallCheck(this, MapWorld);

    // physic
    var engine = _Matter.Engine.create();

    var world = engine.world;
    world.gravity.y = 0;
    // apply force at next update
    world.forcesWaitForApply = [];

    _Matter.Events.on(engine, 'collisionStart', function (event) {
      var pairs = event.pairs;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var o1 = pair.bodyA[PARENT];
        var o2 = pair.bodyB[PARENT];
        o1.emit('collide', o2);
        o2.emit('collide', o1);
      }
    });
    _Matter.Events.on(engine, 'beforeUpdate', function (event) {
      world.forcesWaitForApply.forEach(function (_ref) {
        var owner = _ref.owner,
            vector = _ref.vector;

        if (owner) {
          _Matter.Body.applyForce(owner.body, owner.positionEx, vector);
        }
      });
      world.forcesWaitForApply = [];
    });

    this.engine = engine;
    this.mouseConstraint = _Matter.MouseConstraint.create(engine);
    _Matter.World.add(engine.world, this.mouseConstraint);
  }

  _createClass(MapWorld, [{
    key: 'add',
    value: function add(o) {
      if (o.type === _constants.STATIC) {
        return;
      }
      var world = this.engine.world;
      o.addBody();
      var body = o.body;
      o.once('removed', function () {
        _Matter.World.remove(world, body);
      });
      body[PARENT] = o;
      body.world = world;
      _Matter.World.addBody(world, body);
    }
  }, {
    key: 'update',
    value: function update(delta) {
      _Matter.Engine.update(this.engine, delta * 16.666);
    }
  }, {
    key: 'enableRender',
    value: function enableRender(_ref2) {
      var width = _ref2.width,
          height = _ref2.height;

      var engine = this.engine;
      // create a renderer
      var render = _Matter.Render.create({
        element: document.body,
        engine: engine,
        options: {
          width: width * 2,
          height: height * 2,
          wireframes: true,
          hasBounds: true,
          wireframeBackground: 'transparent'
        }
      });

      // run the renderer
      _Matter.Render.run(render);
      this.engine.render = render;
      this.initialEngineBoundsMaxX = render.bounds.max.x;
      this.initialEngineBoundsMaxY = render.bounds.max.y;
      this.center = {
        x: width / 2,
        y: height / 2
      };
    }
  }, {
    key: 'follow',
    value: function follow(body) {
      _Matter.Events.on(this.engine, 'beforeUpdate', _follow.bind(this, body));
    }
  }, {
    key: 'scale',
    value: function scale(scaleX) {
      var scaleY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : scaleX;

      _Matter.Mouse.setScale(this.mouseConstraint.mouse, {
        x: this.scaleX,
        y: this.scaleY
      });
    }
  }]);

  return MapWorld;
}();

exports.default = MapWorld;

},{"../config/constants":8,"./Matter":15}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global Matter */
var Engine = exports.Engine = Matter.Engine;
var Render = exports.Render = Matter.Render;
var World = exports.World = Matter.World;
var Bodies = exports.Bodies = Matter.Bodies;
var Events = exports.Events = Matter.Events;
var Body = exports.Body = Matter.Body;
var Vector = exports.Vector = Matter.Vector;
var Composite = exports.Composite = Matter.Composite;
var Mouse = exports.Mouse = Matter.Mouse;
var MouseConstraint = exports.MouseConstraint = Matter.MouseConstraint;

},{}],16:[function(require,module,exports){
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

},{"events":1}],17:[function(require,module,exports){
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
var ObservablePoint = exports.ObservablePoint = PIXI.ObservablePoint;

},{}],18:[function(require,module,exports){
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

},{"./PIXI":17}],19:[function(require,module,exports){
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

},{"../lib/PIXI":17}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

var GlobalEventManager = function () {
  function GlobalEventManager() {
    _classCallCheck(this, GlobalEventManager);
  }

  _createClass(GlobalEventManager, [{
    key: "setInteraction",
    value: function setInteraction(interaction) {
      this.interaction = interaction;
    }
  }, {
    key: "on",
    value: function on(eventName, handler) {
      this.interaction.on(eventName, handler);
    }
  }, {
    key: "off",
    value: function off(eventName, handler) {
      this.interaction.off(eventName, handler);
    }
  }, {
    key: "emit",
    value: function emit(eventName) {
      var _interaction;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (_interaction = this.interaction).emit.apply(_interaction, [eventName].concat(args));
    }
  }]);

  return GlobalEventManager;
}();

exports.default = new GlobalEventManager();

},{}],22:[function(require,module,exports){
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

},{"../objects/Air":23,"../objects/Bullet":24,"../objects/Door":26,"../objects/Grass":28,"../objects/GrassDecorate1":29,"../objects/Ground":30,"../objects/IronFence":31,"../objects/Root":32,"../objects/Torch":33,"../objects/Treasure":34,"../objects/Tree":35,"../objects/Wall":36,"../objects/WallShootBolt":37,"../objects/abilities/Camera":39,"../objects/abilities/Move":48,"../objects/abilities/Operate":49}],23:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":19,"./GameObject":27}],24:[function(require,module,exports){
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

var _Health = require('../objects/abilities/Health');

var _Health2 = _interopRequireDefault(_Health);

var _Damage = require('../objects/abilities/Damage');

var _Damage2 = _interopRequireDefault(_Damage);

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

var HealthPoint = 1;

var Bullet = function (_GameObject) {
  _inherits(Bullet, _GameObject);

  function Bullet() {
    _classCallCheck(this, Bullet);

    var _this = _possibleConstructorReturn(this, (Bullet.__proto__ || Object.getPrototypeOf(Bullet)).call(this, _Texture2.default.Bullet));

    new _Learn2.default().carryBy(_this).learn(new _Move2.default([2, 0])).learn(new _Health2.default(HealthPoint)).learn(new _Damage2.default([1, 0.01]));

    _this.on('collide', _this.actionWith.bind(_this));
    _this.on('die', _this.onDie.bind(_this));
    return _this;
  }

  _createClass(Bullet, [{
    key: 'bodyOpt',
    value: function bodyOpt() {
      return {
        isSensor: true
      };
    }
  }, {
    key: 'actionWith',
    value: function actionWith(operator) {
      if (this.owner === operator || this.owner === operator.owner) {
        // 避免自殺
        return;
      }
      var damageAbility = this[_constants.ABILITY_DAMAGE];
      damageAbility.effect(operator);
      // 自我毀滅
      this.onDie();
    }
  }, {
    key: 'onDie',
    value: function onDie() {
      this.parent.willRemoveChild(this);
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
        this.rotate(vector.rad);
      }
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

},{"../config/constants":8,"../lib/Texture":19,"../objects/abilities/Damage":41,"../objects/abilities/Health":43,"../objects/abilities/Move":48,"./GameObject":27,"./abilities/Learn":47}],25:[function(require,module,exports){
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
    new _Learn2.default().carryBy(_this).learn(new _Move2.default([1])).learn(new _KeyMove2.default()).learn(new _Place2.default()).learn(new _KeyPlace2.default()).learn(new _Camera2.default(5)).learn(carry).learn(new _Fire2.default([2])).learn(new _Rotate2.default()).learn(new _KeyFire2.default()).learn(new _Health2.default(10));

    var bullet = new _Bullet2.default();
    carry.take(bullet, Infinity);
    return _this;
  }

  _createClass(Cat, [{
    key: 'bodyOpt',
    value: function bodyOpt() {
      return {};
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'you';
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.REPLY;
    }
  }]);

  return Cat;
}(_GameObject3.default);

exports.default = Cat;

},{"../config/constants":8,"../lib/Texture":19,"../objects/Bullet":24,"../objects/abilities/Camera":39,"../objects/abilities/Carry":40,"../objects/abilities/Fire":42,"../objects/abilities/Health":43,"../objects/abilities/KeyFire":44,"../objects/abilities/KeyMove":45,"../objects/abilities/KeyPlace":46,"../objects/abilities/Move":48,"../objects/abilities/Place":50,"../objects/abilities/Rotate":51,"./GameObject":27,"./abilities/Learn":47}],26:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":19,"./GameObject":27}],27:[function(require,module,exports){
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

var _Matter = require('../lib/Matter');

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

function onScale() {
  this.scale.copy(this.scaleEx);
  if (this.body) {
    _Matter.Body.scale(this.body, this.scaleEx.x, this.scaleEx.y);
  }
}

function onPosition() {
  var position = this.positionEx;
  this.position.copy(position);
  if (this.body) {
    this.body.position.copy(position);
  }
}

function bodyOpt() {
  var moveAbility = this[_constants.ABILITY_MOVE];
  var friction = moveAbility && moveAbility.friction !== undefined ? moveAbility.friction : 0.1;
  var frictionAir = moveAbility && moveAbility.frictionAir !== undefined ? moveAbility.frictionAir : 0.01;
  var mass = this.mass ? this.mass : 1;
  return {
    isStatic: this.type === _constants.STAY,
    friction: friction,
    frictionAir: frictionAir,
    frictionStatic: friction,
    mass: mass
  };
}

var GameObject = function (_Sprite) {
  _inherits(GameObject, _Sprite);

  function GameObject() {
    var _ref;

    _classCallCheck(this, GameObject);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = GameObject.__proto__ || Object.getPrototypeOf(GameObject)).call.apply(_ref, [this].concat(args)));

    _this.scaleEx = _this.scale; // new ObservablePoint(onScale, this)
    _this.positionEx = _this.position; // new ObservablePoint(onPosition, this)
    return _this;
  }

  _createClass(GameObject, [{
    key: 'bodyOpt',
    value: function bodyOpt() {
      return {};
    }
  }, {
    key: 'addBody',
    value: function addBody() {
      if (this.body) {
        return;
      }
      var opt = Object.assign(bodyOpt.call(this), this.bodyOpt());
      var body = _Matter.Bodies.rectangle(this.x, this.y, this.width, this.height, opt);
      // sync physic body & display position
      body.position = this.positionEx;
      this.body = body;
    }
  }, {
    key: 'rotate',
    value: function rotate(rad) {
      var delta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this.rotation = delta ? this.rotation + rad : rad;
      if (this.body) {
        _Matter.Body.setAngle(this.body, rad);
      }
    }
  }, {
    key: 'say',
    value: function say(msg) {
      _Messages2.default.add(msg);
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

},{"../config/constants":8,"../lib/Matter":15,"../lib/Messages":16,"../lib/PIXI":17}],28:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":19,"./GameObject":27}],29:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":19,"./GameObject":27}],30:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":19,"./GameObject":27}],31:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":19,"./GameObject":27}],32:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":19,"./GameObject":27}],33:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Light":11,"../lib/Texture":19,"./GameObject":27}],34:[function(require,module,exports){
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

      this.parent.willRemoveChild(this);
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

},{"../config/constants":8,"../lib/Texture":19,"../lib/utils":22,"./GameObject":27}],35:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":19,"./GameObject":27}],36:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":19,"./GameObject":27}],37:[function(require,module,exports){
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
    new _Learn2.default().carryBy(_this).learn(new _Fire2.default([3])).learn(carry).learn(new _Health2.default(10));

    var bullet = new _Bullet2.default();
    carry.take(bullet, Infinity);

    _this.life = 0;
    _this.on('collide', _this.actionWith.bind(_this));
    _this.on('die', _this.onDie.bind(_this));
    return _this;
  }

  _createClass(WallShootBolt, [{
    key: 'bodyOpt',
    value: function bodyOpt() {
      return {
        isStatic: true
      };
    }
  }, {
    key: 'actionWith',
    value: function actionWith(operator) {
      operator.emit('collide', this);
    }
  }, {
    key: 'onDie',
    value: function onDie() {
      this.parent.willRemoveChild(this);
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      this.life++;
      if (this.life % 30 !== 0) {
        return;
      }
      this.life = 0;
      this.rotate(Math.PI / 10, true);

      var rad = this.rotation;
      this[_constants.ABILITY_FIRE].fire(rad);
      this[_constants.ABILITY_FIRE].fire(rad + Math.PI / 2);
      this[_constants.ABILITY_FIRE].fire(rad + Math.PI);
      this[_constants.ABILITY_FIRE].fire(rad + Math.PI / 2 * 3);
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

},{"../config/constants":8,"../lib/Texture":19,"../objects/Bullet":24,"../objects/abilities/Carry":40,"../objects/abilities/Fire":42,"../objects/abilities/Health":43,"./GameObject":27,"./abilities/Learn":47}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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

},{"../../config/constants":8,"../../lib/Light":11,"./Ability":38}],40:[function(require,module,exports){
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

},{"../../config/constants":8,"./Ability":38}],41:[function(require,module,exports){
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

var Damage = function (_Ability) {
  _inherits(Damage, _Ability);

  function Damage(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        _ref2$ = _ref2[0],
        damage = _ref2$ === undefined ? 1 : _ref2$,
        _ref2$2 = _ref2[1],
        force = _ref2$2 === undefined ? 0.01 : _ref2$2;

    _classCallCheck(this, Damage);

    var _this = _possibleConstructorReturn(this, (Damage.__proto__ || Object.getPrototypeOf(Damage)).call(this));

    _this.damage = damage;
    _this.force = force;
    return _this;
  }

  _createClass(Damage, [{
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(Damage.prototype.__proto__ || Object.getPrototypeOf(Damage.prototype), 'carryBy', this).call(this, owner);
      this.owner = owner;
      owner[_constants.ABILITY_DAMAGE] = this;
    }
  }, {
    key: 'effect',
    value: function effect(other) {
      var healthAbility = other[_constants.ABILITY_HEALTH];
      // 傷害他人
      if (healthAbility) {
        healthAbility.getHurt(this.owner);
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return ['Damage: ', this.damage, ', ', this.force].join('');
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_DAMAGE;
    }
  }]);

  return Damage;
}(_Ability3.default);

exports.default = Damage;

},{"../../config/constants":8,"./Ability":38}],42:[function(require,module,exports){
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

var PI = Math.PI;

function calcApothem(o, rad) {
  var width = o.width / 2;
  var height = o.height / 2;
  var rectRad = Math.atan2(height, width);
  var len = void 0;
  // 如果射出角穿過 width
  var r1 = Math.abs(rad % PI);
  var r2 = Math.abs(rectRad % PI);
  if (r1 < r2 || r1 > r2 + PI / 2) {
    len = width / Math.cos(rad);
  } else {
    len = height / Math.sin(rad);
  }
  return Math.abs(len);
}

var Fire = function (_Ability) {
  _inherits(Fire, _Ability);

  function Fire(_ref) {
    var _ref2 = _slicedToArray(_ref, 1),
        reactForce = _ref2[0];

    _classCallCheck(this, Fire);

    // TODO: implement
    var _this = _possibleConstructorReturn(this, (Fire.__proto__ || Object.getPrototypeOf(Fire)).call(this));

    _this.reactForce = reactForce;
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
      var _this2 = this;

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
      if (rad === undefined) {
        // 如果沒指定方向，就用目前面對方向
        var rotateAbility = owner[_constants.ABILITY_ROTATE];
        rad = rotateAbility ? rotateAbility.faceRad : 0;
      }
      var vector = _Vector2.default.fromRadLength(rad, 1);
      bullet.scaleEx.set(scale);
      bullet.setOwner(owner);

      // set position
      var rectLen = calcApothem(owner, rad + owner.rotation);
      var bulletLen = bullet.height / 2; // 射出角等於自身旋角，所以免去運算
      var len = rectLen + bulletLen;
      var position = _Vector2.default.fromRadLength(rad, len).add(_Vector2.default.fromPoint(owner.positionEx));
      bullet.positionEx.set(position.x, position.y);

      bullet.once('added', function () {
        bullet.setDirection(vector);

        var moveAbility = owner[_constants.ABILITY_MOVE];
        if (moveAbility) {
          moveAbility.punch(vector.clone().setLength(_this2.reactForce / 300).invert());
        }
      });

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

},{"../../config/constants":8,"../../lib/Vector":20,"../Bullet":24,"./Ability":38}],43:[function(require,module,exports){
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

var Health = function (_Ability) {
  _inherits(Health, _Ability);

  function Health() {
    var hp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    _classCallCheck(this, Health);

    var _this = _possibleConstructorReturn(this, (Health.__proto__ || Object.getPrototypeOf(Health)).call(this));

    _this.hp = hp;
    _this.hpMax = hp;
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
    value: function getHurt(from) {
      var damageAbility = from[_constants.ABILITY_DAMAGE];
      if (!damageAbility) {
        return;
      }
      var force = damageAbility.force;
      var damage = damageAbility.damage;
      var preHp = this.hp;
      var sufHp = Math.max(this.hp - damage, 0);
      var vector = _Vector2.default.fromPoint(this.owner.position).sub(from.position).setLength(force);

      this.owner.say([this.owner.toString(), ' get hurt ', damage, ': ', preHp, ' -> ', sufHp].join(''));

      var moveAbility = this.owner[_constants.ABILITY_MOVE];
      if (moveAbility) {
        moveAbility.punch(vector);
      }

      this.hp = sufHp;

      this.owner.emit('health-change');
      if (this.hp <= 0) {
        this.owner.emit('die');
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return ['Health: ', this.hp, ' / ', this.hpMax].join('');
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

},{"../../config/constants":8,"../../lib/Vector":20,"./Ability":38}],44:[function(require,module,exports){
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

var _globalEventManager = require('../../lib/globalEventManager');

var _globalEventManager2 = _interopRequireDefault(_globalEventManager);

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

var KEYS = Symbol('keys');

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
      owner[_constants.ABILITY_KEY_FIRE] = this;
      this.setup(owner);
    }
  }, {
    key: 'setup',
    value: function setup(owner) {
      var fireAbility = owner[_constants.ABILITY_FIRE];
      var mouseHandler = function mouseHandler(e) {
        if (e.stopped) {
          return;
        }
        _globalEventManager2.default.emit('fire');
      };
      var fireHandler = fireAbility.fire.bind(fireAbility);

      owner[KEYS] = {
        mousedown: mouseHandler,
        fire: fireHandler
      };
      Object.entries(owner[KEYS]).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            eventName = _ref2[0],
            handler = _ref2[1];

        _globalEventManager2.default.on(eventName, handler);
      });
    }
  }, {
    key: 'dropBy',
    value: function dropBy(owner) {
      _get(KeyFire.prototype.__proto__ || Object.getPrototypeOf(KeyFire.prototype), 'dropBy', this).call(this, owner);
      Object.entries(owner[KEYS]).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            eventName = _ref4[0],
            handler = _ref4[1];

        _globalEventManager2.default.off(eventName, handler);
      });
      delete owner[KEYS];
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

},{"../../config/constants":8,"../../lib/globalEventManager":21,"./Ability":38}],45:[function(require,module,exports){
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

var KEYS = Symbol('keys');

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
      owner[_constants.ABILITY_KEY_MOVE] = this;
      this.setup(owner);
    }
  }, {
    key: 'setup',
    value: function setup(owner) {
      var dir = {};
      var calcDir = function calcDir() {
        var vector = new _Vector2.default(-dir[_control.LEFT] + dir[_control.RIGHT], -dir[_control.UP] + dir[_control.DOWN]);
        if (vector.length === 0) {
          return;
        }
        vector.multiplyScalar(0.17);
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
        var _owner$KEYS;

        owner[KEYS] = (_owner$KEYS = {}, _defineProperty(_owner$KEYS, _control.LEFT, bind(_control.LEFT)), _defineProperty(_owner$KEYS, _control.UP, bind(_control.UP)), _defineProperty(_owner$KEYS, _control.RIGHT, bind(_control.RIGHT)), _defineProperty(_owner$KEYS, _control.DOWN, bind(_control.DOWN)), _owner$KEYS);
      });

      this.timer = setInterval(calcDir, 17);
    }
  }, {
    key: 'dropBy',
    value: function dropBy(owner) {
      _get(KeyMove.prototype.__proto__ || Object.getPrototypeOf(KeyMove.prototype), 'dropBy', this).call(this, owner);
      _keyboardjs2.default.withContext('', function () {
        Object.entries(owner[KEYS]).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key = _ref2[0],
              handler = _ref2[1];

          _keyboardjs2.default.unbind(key, handler);
        });
      });
      delete owner[KEYS];
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

},{"../../config/constants":8,"../../config/control":9,"../../lib/Vector":20,"./Ability":38,"keyboardjs":2}],46:[function(require,module,exports){
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

},{"../../config/constants":8,"../../config/control":9,"./Ability":38,"keyboardjs":2}],47:[function(require,module,exports){
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

},{"../../config/constants":8,"./Ability":38}],48:[function(require,module,exports){
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

var _Matter = require('../../lib/Matter');

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
   * @param  {float} frictionAir    空間摩擦力
   */
  function Move(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        value = _ref2[0],
        frictionAir = _ref2[1];

    _classCallCheck(this, Move);

    var _this = _possibleConstructorReturn(this, (Move.__proto__ || Object.getPrototypeOf(Move)).call(this));

    _this.value = value;
    _this.frictionAir = frictionAir;
    _this.vector = new _Vector2.default(0, 0);
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
      _Matter.Body.setVelocity(this.owner.body, vector.setLength(this.value));
    }

    // 施予力

  }, {
    key: 'addDirection',
    value: function addDirection(vector) {
      var owner = this.owner;
      if (!owner.body) {
        return;
      }
      this.punch(vector.multiplyScalar(this.value / 300));
    }
  }, {
    key: 'punch',
    value: function punch(vector) {
      var owner = this.owner;
      if (!owner.body) {
        return;
      }
      owner.body.world.forcesWaitForApply.push({ owner: owner, vector: vector });
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

},{"../../config/constants":8,"../../lib/Matter":15,"../../lib/Vector":20,"./Ability":38}],49:[function(require,module,exports){
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

},{"../../config/constants":8,"./Ability":38}],50:[function(require,module,exports){
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

        var position = owner.positionEx;
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

},{"../../config/constants":8,"./Ability":38}],51:[function(require,module,exports){
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

var _globalEventManager = require('../../lib/globalEventManager');

var _globalEventManager2 = _interopRequireDefault(_globalEventManager);

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

      this.owner = owner;
      owner[_constants.ABILITY_ROTATE] = this;
      owner.interactive = true;
      var mouseHandler = function mouseHandler(e) {
        var ownerPoint = _this2.owner.getGlobalPosition();
        var pointer = e.data.global;
        var vector = new _Vector2.default(pointer.x - ownerPoint.x, pointer.y - ownerPoint.y);
        _globalEventManager2.default.emit('rotate', vector);
      };
      var rotateHandler = this.setFaceRad.bind(this);

      owner[MOUSEMOVE] = {
        rotate: rotateHandler,
        mousemove: mouseHandler
      };
      Object.entries(owner[MOUSEMOVE]).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            eventName = _ref2[0],
            handler = _ref2[1];

        _globalEventManager2.default.on(eventName, handler);
      });

      this.setFaceRad(new _Vector2.default(0, 0));
    }
  }, {
    key: 'dropBy',
    value: function dropBy(owner) {
      _get(Rotate.prototype.__proto__ || Object.getPrototypeOf(Rotate.prototype), 'dropBy', this).call(this, owner);
      Object.entries(owner[MOUSEMOVE]).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            eventName = _ref4[0],
            handler = _ref4[1];

        _globalEventManager2.default.off(eventName, handler);
      });
      delete owner[MOUSEMOVE];
      delete owner[_constants.ABILITY_ROTATE];
    }
  }, {
    key: 'setFaceRad',
    value: function setFaceRad(vector) {
      this._faceRad = vector.rad - this.initRad;
      this.owner.rotate(this._faceRad);
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

},{"../../config/constants":8,"../../lib/Vector":20,"../../lib/globalEventManager":21,"./Ability":38}],52:[function(require,module,exports){
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
          position: [6, 12]
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

},{"../lib/PIXI":17,"../lib/Scene":18,"./PlayScene":53}],53:[function(require,module,exports){
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

var _MapFog = require('../lib/MapFog');

var _MapFog2 = _interopRequireDefault(_MapFog);

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

var _globalEventManager = require('../lib/globalEventManager');

var _globalEventManager2 = _interopRequireDefault(_globalEventManager);

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
    _this.group.enableSort = true;
    _this.mapScale = _constants.IS_MOBILE ? 2 : 0.5;
    _this.mapFog = new _MapFog2.default();
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
      // setInterval(() => {
      //   globalEventManager.emit('fire')
      // }, 100)
    }
  }, {
    key: 'initUi',
    value: function initUi() {
      var uiGroup = new _PIXI.display.Group(1, true);
      var uiLayer = new _PIXI.display.Layer(uiGroup);
      uiLayer.parentLayer = this;
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
          x: sceneWidth / 5 * 3,
          y: sceneHeight / 5 * 3,
          width: sceneWidth / 3,
          height: sceneHeight / 5
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

      var mapGroup = new _PIXI.display.Group(0, true);
      var mapLayer = new _PIXI.display.Layer(mapGroup);
      mapLayer.parentLayer = this;
      mapLayer.group.enableSort = true;
      mapLayer.position.set(sceneWidth / 2, sceneHeight / 2);
      this.addChild(mapLayer);

      var mapData = _PIXI.resources[fileName].data;

      var map = new _Map2.default();
      mapLayer.addChild(map);
      // enable fog
      if (!mapData.hasFog) {
        this.mapFog.disable();
      } else {
        this.mapFog.enable(map);
      }
      // this.mapFog.position.set(-sceneWidth / 2, -sceneHeight / 2)
      mapLayer.addChild(this.mapFog);
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
      // TODO: debug render
      // map.debug({width: sceneWidth, height: sceneHeight})
      map.setScale(this.mapScale);
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
      this.map.setPosition(-this.cat.x * this.mapScale, -this.cat.y * this.mapScale);
    }
  }]);

  return PlayScene;
}(_Scene3.default);

exports.default = PlayScene;

},{"../config/constants":8,"../lib/Map":12,"../lib/MapFog":13,"../lib/PIXI":17,"../lib/Scene":18,"../lib/globalEventManager":21,"../objects/Cat":25,"../ui/InventoryWindow":54,"../ui/MessageWindow":55,"../ui/PlayerWindow":56,"../ui/TouchDirectionControlPanel":58,"../ui/TouchOperationControlPanel":59}],54:[function(require,module,exports){
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
      item.scaleEx.set(scale);
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

},{"../config/constants":8,"../lib/PIXI":17,"./Window":61}],55:[function(require,module,exports){
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

},{"../lib/Messages":16,"../lib/PIXI":17,"./ScrollableWindow":57}],56:[function(require,module,exports){
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

var _ValueBar = require('./ValueBar');

var _ValueBar2 = _interopRequireDefault(_ValueBar);

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

var ABILITIES_ALL = [_constants.ABILITY_MOVE, _constants.ABILITY_CAMERA, _constants.ABILITY_HEALTH];

var PlayerWindow = function (_Window) {
  _inherits(PlayerWindow, _Window);

  function PlayerWindow(opt) {
    _classCallCheck(this, PlayerWindow);

    var _this = _possibleConstructorReturn(this, (PlayerWindow.__proto__ || Object.getPrototypeOf(PlayerWindow)).call(this, opt));

    var player = opt.player;

    _this._opt = opt;

    _this.renderHealthBar({ x: 5, y: 5 });
    _this.renderAbility({ x: 5, y: 20 });

    _this.onAbilityCarry(player);

    player.on('ability-carry', _this.onAbilityCarry.bind(_this, player));
    player.on('health-change', _this.onHealthChange.bind(_this, player));
    return _this;
  }

  _createClass(PlayerWindow, [{
    key: 'renderAbility',
    value: function renderAbility(_ref) {
      var x = _ref.x,
          y = _ref.y;

      var abilityTextContainer = new _PIXI.Container();
      abilityTextContainer.position.set(x, y);
      this.addChild(abilityTextContainer);
      this.abilityTextContainer = abilityTextContainer;
    }
  }, {
    key: 'renderHealthBar',
    value: function renderHealthBar(_ref2) {
      var x = _ref2.x,
          y = _ref2.y;
      var width = this._opt.width;

      width /= 2;
      var height = 10;
      var color = 0xD23200;
      var healthBar = new _ValueBar2.default({ x: x, y: y, width: width, height: height, color: color });

      this.addChild(healthBar);

      this.healthBar = healthBar;
    }
  }, {
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
    key: 'onHealthChange',
    value: function onHealthChange(player) {
      var healthAbility = player[_constants.ABILITY_HEALTH];
      if (!healthAbility) {
        this.healthBar.visible = false;
        return;
      }
      if (!this.healthBar.visible) {
        this.healthBar.visible = true;
      }
      this.healthBar.emit('value-change', healthAbility.hp / healthAbility.hpMax);
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

},{"../config/constants":8,"../lib/PIXI":17,"./ValueBar":60,"./Window":61}],57:[function(require,module,exports){
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

},{"../lib/PIXI":17,"./Window":61,"./Wrapper":62}],58:[function(require,module,exports){
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

},{"../config/control":9,"../lib/PIXI":17,"../lib/Vector":20,"keyboardjs":2}],59:[function(require,module,exports){
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

var _globalEventManager = require('../lib/globalEventManager');

var _globalEventManager2 = _interopRequireDefault(_globalEventManager);

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
        width = _ref.width,
        height = _ref.height;

    _classCallCheck(this, TouchOperationControlPanel);

    var _this = _possibleConstructorReturn(this, (TouchOperationControlPanel.__proto__ || Object.getPrototypeOf(TouchOperationControlPanel)).call(this));

    _this.position.set(x, y);

    var touchArea = new _PIXI.Graphics();
    touchArea.beginFill(0xF2F2F2, 0.5);
    touchArea.drawRect(0, 0, width, height);
    touchArea.endFill();
    _this.addChild(touchArea);

    _this.setupTouch();
    return _this;
  }

  _createClass(TouchOperationControlPanel, [{
    key: 'setupTouch',
    value: function setupTouch() {
      this.center = new _Vector2.default(this.width / 2, this.height / 2);
      this.interactive = true;
      var f = this.onTouch.bind(this);
      this.on('touchstart', f);
    }
  }, {
    key: 'onTouch',
    value: function onTouch(e) {
      var pointer = e.data.getLocalPosition(this);
      var vector = _Vector2.default.fromPoint(pointer).sub(this.center);
      _globalEventManager2.default.emit('rotate', vector);
      _globalEventManager2.default.emit('fire');
      e.stopPropagation();
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

},{"../lib/PIXI":17,"../lib/Vector":20,"../lib/globalEventManager":21}],60:[function(require,module,exports){
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

var ValueBar = function (_Container) {
  _inherits(ValueBar, _Container);

  function ValueBar(opt) {
    _classCallCheck(this, ValueBar);

    var _this = _possibleConstructorReturn(this, (ValueBar.__proto__ || Object.getPrototypeOf(ValueBar)).call(this));

    var x = opt.x,
        y = opt.y,
        width = opt.width,
        height = opt.height,
        color = opt.color;

    // background

    var hpBarBg = new _PIXI.Graphics();
    hpBarBg.beginFill(0xA2A2A2);
    hpBarBg.lineStyle(1, 0x222222, 1);
    hpBarBg.drawRect(0, 0, width, height);
    hpBarBg.endFill();

    // mask
    var mask = new _PIXI.Graphics();
    mask.beginFill(0xFFFFFF);
    mask.drawRect(0, 0, width, height);
    mask.endFill();
    _this.addChild(mask);
    _this.barMask = mask;

    _this.addChild(hpBarBg);
    _this.hpBarBg = hpBarBg;

    // bar
    _this._renderBar({ color: color, width: width, height: height });
    _this.position.set(x, y);
    _this._opt = opt;

    _this.on('value-change', _this.update.bind(_this));
    return _this;
  }

  _createClass(ValueBar, [{
    key: 'update',
    value: function update(rate) {
      this.removeChild(this.hpBarInner);
      this.hpBarInner.destroy();
      var _opt = this._opt,
          color = _opt.color,
          width = _opt.width,
          height = _opt.height;

      this._renderBar({
        color: color,
        width: width * rate,
        height: height
      });
    }
  }, {
    key: '_renderBar',
    value: function _renderBar(_ref) {
      var color = _ref.color,
          width = _ref.width,
          height = _ref.height;

      var hpBarInner = new _PIXI.Graphics();
      hpBarInner.beginFill(color);
      hpBarInner.drawRect(0, 0, width, height);
      hpBarInner.endFill();
      hpBarInner.mask = this.barMask;

      this.addChild(hpBarInner);
      this.hpBarInner = hpBarInner;
    }
  }]);

  return ValueBar;
}(_PIXI.Container);

exports.default = ValueBar;

},{"../lib/PIXI":17}],61:[function(require,module,exports){
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

},{"../lib/PIXI":17}],62:[function(require,module,exports){
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

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tleWJvYXJkanMvbGliL2tleS1jb21iby5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9rZXlib2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9sb2NhbGUuanMiLCJub2RlX21vZHVsZXMva2V5Ym9hcmRqcy9sb2NhbGVzL3VzLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jb25maWcvY29uc3RhbnRzLmpzIiwic3JjL2NvbmZpZy9jb250cm9sLmpzIiwic3JjL2xpYi9BcHBsaWNhdGlvbi5qcyIsInNyYy9saWIvTGlnaHQuanMiLCJzcmMvbGliL01hcC5qcyIsInNyYy9saWIvTWFwRm9nLmpzIiwic3JjL2xpYi9NYXBXb3JsZC5qcyIsInNyYy9saWIvTWF0dGVyLmpzIiwic3JjL2xpYi9NZXNzYWdlcy5qcyIsInNyYy9saWIvUElYSS5qcyIsInNyYy9saWIvU2NlbmUuanMiLCJzcmMvbGliL1RleHR1cmUuanMiLCJzcmMvbGliL1ZlY3Rvci5qcyIsInNyYy9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyLmpzIiwic3JjL2xpYi91dGlscy5qcyIsInNyYy9vYmplY3RzL0Fpci5qcyIsInNyYy9vYmplY3RzL0J1bGxldC5qcyIsInNyYy9vYmplY3RzL0NhdC5qcyIsInNyYy9vYmplY3RzL0Rvb3IuanMiLCJzcmMvb2JqZWN0cy9HYW1lT2JqZWN0LmpzIiwic3JjL29iamVjdHMvR3Jhc3MuanMiLCJzcmMvb2JqZWN0cy9HcmFzc0RlY29yYXRlMS5qcyIsInNyYy9vYmplY3RzL0dyb3VuZC5qcyIsInNyYy9vYmplY3RzL0lyb25GZW5jZS5qcyIsInNyYy9vYmplY3RzL1Jvb3QuanMiLCJzcmMvb2JqZWN0cy9Ub3JjaC5qcyIsInNyYy9vYmplY3RzL1RyZWFzdXJlLmpzIiwic3JjL29iamVjdHMvVHJlZS5qcyIsInNyYy9vYmplY3RzL1dhbGwuanMiLCJzcmMvb2JqZWN0cy9XYWxsU2hvb3RCb2x0LmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0NhcnJ5LmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0RhbWFnZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9GaXJlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0hlYWx0aC5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9LZXlGaXJlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0tleU1vdmUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvS2V5UGxhY2UuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvTGVhcm4uanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvTW92ZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9PcGVyYXRlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL1BsYWNlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL1JvdGF0ZS5qcyIsInNyYy9zY2VuZXMvTG9hZGluZ1NjZW5lLmpzIiwic3JjL3NjZW5lcy9QbGF5U2NlbmUuanMiLCJzcmMvdWkvSW52ZW50b3J5V2luZG93LmpzIiwic3JjL3VpL01lc3NhZ2VXaW5kb3cuanMiLCJzcmMvdWkvUGxheWVyV2luZG93LmpzIiwic3JjL3VpL1Njcm9sbGFibGVXaW5kb3cuanMiLCJzcmMvdWkvVG91Y2hEaXJlY3Rpb25Db250cm9sUGFuZWwuanMiLCJzcmMvdWkvVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwuanMiLCJzcmMvdWkvVmFsdWVCYXIuanMiLCJzcmMvdWkvV2luZG93LmpzIiwic3JjL3VpL1dyYXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QVdFLEVBWEYsQ0FXb0I7QUFDbEI7QUE1Qko7QUE4QkEsTUFBSSxDQUFKLFdBQUEsRUFBa0I7QUFDaEIsTUFBQSxlQUFBO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBLFNBQUEsbUJBQUEsR0FBZ0M7QUFBQSxNQUFBLE9BQytCLEtBRC9CLEdBQytCLENBRC9CO0FBQUEsTUFBQSxhQUFBLEtBQUEsS0FBQTtBQUFBLE1BQUEsUUFBQSxlQUFBLFNBQUEsR0FDaEIsS0FEZ0IsS0FBQSxHQUFBLFVBQUE7QUFBQSxNQUFBLGNBQUEsS0FBQSxNQUFBO0FBQUEsTUFBQSxTQUFBLGdCQUFBLFNBQUEsR0FDSyxLQURMLE1BQUEsR0FBQSxXQUFBO0FBQUEsTUFBQSxXQUFBLEtBQUEsUUFBQTs7QUFFOUIsT0FBQSxDQUFBLEdBQVMsS0FBQSxHQUFBLENBQVMsS0FBVCxDQUFBLEVBQWlCLFNBQTFCLENBQVMsQ0FBVDtBQUNBLE9BQUEsQ0FBQSxHQUFTLEtBQUEsR0FBQSxDQUFTLEtBQVQsQ0FBQSxFQUFpQixTQUFBLENBQUEsR0FBYSxTQUFiLEtBQUEsR0FBMUIsS0FBUyxDQUFUO0FBQ0EsT0FBQSxDQUFBLEdBQVMsS0FBQSxHQUFBLENBQVMsS0FBVCxDQUFBLEVBQWlCLFNBQTFCLENBQVMsQ0FBVDtBQUNBLE9BQUEsQ0FBQSxHQUFTLEtBQUEsR0FBQSxDQUFTLEtBQVQsQ0FBQSxFQUFpQixTQUFBLENBQUEsR0FBYSxTQUFiLE1BQUEsR0FBMUIsTUFBUyxDQUFUO0FBQ0Q7O0lBQ0ssVTs7Ozs7Ozs7QUFDSjs7Ozs7Ozs7OEJBUWtCLGEsRUFBZSxHLEVBQUs7QUFDcEMsb0JBQUEsR0FBQSxJQUFBLEdBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUEsYUFBQTtBQUNBLG9CQUFBLGtCQUFBLEdBQUEsbUJBQUE7QUFDRDs7Ozs7O2tCQUdZLE8iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgb2JqZWN0Q3JlYXRlUG9seWZpbGxcbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgb2JqZWN0S2V5c1BvbHlmaWxsXG52YXIgYmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGZ1bmN0aW9uQmluZFBvbHlmaWxsXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbnZhciBoYXNEZWZpbmVQcm9wZXJ0eTtcbnRyeSB7XG4gIHZhciBvID0ge307XG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCAneCcsIHsgdmFsdWU6IDAgfSk7XG4gIGhhc0RlZmluZVByb3BlcnR5ID0gby54ID09PSAwO1xufSBjYXRjaCAoZXJyKSB7IGhhc0RlZmluZVByb3BlcnR5ID0gZmFsc2UgfVxuaWYgKGhhc0RlZmluZVByb3BlcnR5KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIGlucHV0IGlzIGEgcG9zaXRpdmUgbnVtYmVyICh3aG9zZSB2YWx1ZSBpcyB6ZXJvIG9yXG4gICAgICAvLyBncmVhdGVyIGFuZCBub3QgYSBOYU4pLlxuICAgICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgYXJnICE9PSBhcmcpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZGVmYXVsdE1heExpc3RlbmVyc1wiIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gICAgfVxuICB9KTtcbn0gZWxzZSB7XG4gIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcIm5cIiBhcmd1bWVudCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gJGdldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gJGdldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbi8vIFRoZXNlIHN0YW5kYWxvbmUgZW1pdCogZnVuY3Rpb25zIGFyZSB1c2VkIHRvIG9wdGltaXplIGNhbGxpbmcgb2YgZXZlbnRcbi8vIGhhbmRsZXJzIGZvciBmYXN0IGNhc2VzIGJlY2F1c2UgZW1pdCgpIGl0c2VsZiBvZnRlbiBoYXMgYSB2YXJpYWJsZSBudW1iZXIgb2Zcbi8vIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGJlY2F1c2Ugb2YgdGhhdC4gVGhlc2UgZnVuY3Rpb25zIGFsd2F5cyBoYXZlXG4vLyB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCB0aHVzIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQsIHNvIHRoZSBjb2RlXG4vLyBpbnNpZGUgdGhlbSBjYW4gZXhlY3V0ZSBmYXN0ZXIuXG5mdW5jdGlvbiBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJncykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgZXZlbnRzO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PSBudWxsKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpXG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoIWhhbmRsZXIpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBpc0ZuID0gdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbic7XG4gIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgY2FzZSAxOlxuICAgICAgZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgdGhpcyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDpcbiAgICAgIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTtcbiAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgZGVmYXVsdDpcbiAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmICghZXZlbnRzKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lcikge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgICAgcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDogW2V4aXN0aW5nLCBsaXN0ZW5lcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICAgIGlmIChwcmVwZW5kKSB7XG4gICAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXhpc3RpbmcucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBpZiAoIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgbSA9ICRnZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICAgIGlmIChtICYmIG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnIFwiJyArIFN0cmluZyh0eXBlKSArICdcIiBsaXN0ZW5lcnMgJyArXG4gICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0LicpO1xuICAgICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgICB3LnR5cGUgPSB0eXBlO1xuICAgICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignJXM6ICVzJywgdy5uYW1lLCB3Lm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0pO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzJdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpXG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9vbmNlV3JhcCh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzdGF0ZSA9IHsgZmlyZWQ6IGZhbHNlLCB3cmFwRm46IHVuZGVmaW5lZCwgdGFyZ2V0OiB0YXJnZXQsIHR5cGU6IHR5cGUsIGxpc3RlbmVyOiBsaXN0ZW5lciB9O1xuICB2YXIgd3JhcHBlZCA9IGJpbmQuY2FsbChvbmNlV3JhcHBlciwgc3RhdGUpO1xuICB3cmFwcGVkLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHN0YXRlLndyYXBGbiA9IHdyYXBwZWQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB0aGlzLm9uKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZE9uY2VMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmICghbGlzdClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fCBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgc3BsaWNlT25lKGxpc3QsIHBvc2l0aW9uKTtcblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHMsIGk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKCFldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50c1t0eXBlXSkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGtleXMgPSBvYmplY3RLZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKCFldmVudHMpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoIWV2bGlzdGVuZXIpXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXR1cm4gdW53cmFwID8gW2V2bGlzdGVuZXIubGlzdGVuZXIgfHwgZXZsaXN0ZW5lcl0gOiBbZXZsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHVud3JhcCA/IHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICByZXR1cm4gdGhpcy5fZXZlbnRzQ291bnQgPiAwID8gUmVmbGVjdC5vd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbi8vIEFib3V0IDEuNXggZmFzdGVyIHRoYW4gdGhlIHR3by1hcmcgdmVyc2lvbiBvZiBBcnJheSNzcGxpY2UoKS5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKHZhciBpID0gaW5kZXgsIGsgPSBpICsgMSwgbiA9IGxpc3QubGVuZ3RoOyBrIDwgbjsgaSArPSAxLCBrICs9IDEpXG4gICAgbGlzdFtpXSA9IGxpc3Rba107XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb2JqZWN0Q3JlYXRlUG9seWZpbGwocHJvdG8pIHtcbiAgdmFyIEYgPSBmdW5jdGlvbigpIHt9O1xuICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICByZXR1cm4gbmV3IEY7XG59XG5mdW5jdGlvbiBvYmplY3RLZXlzUG9seWZpbGwob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGsgaW4gb2JqKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaykpIHtcbiAgICBrZXlzLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIGs7XG59XG5mdW5jdGlvbiBmdW5jdGlvbkJpbmRQb2x5ZmlsbChjb250ZXh0KSB7XG4gIHZhciBmbiA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG4iLCJcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoJy4vbGliL2tleWJvYXJkJyk7XG52YXIgTG9jYWxlICAgPSByZXF1aXJlKCcuL2xpYi9sb2NhbGUnKTtcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4vbGliL2tleS1jb21ibycpO1xuXG52YXIga2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoKTtcblxua2V5Ym9hcmQuc2V0TG9jYWxlKCd1cycsIHJlcXVpcmUoJy4vbG9jYWxlcy91cycpKTtcblxuZXhwb3J0cyAgICAgICAgICA9IG1vZHVsZS5leHBvcnRzID0ga2V5Ym9hcmQ7XG5leHBvcnRzLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5leHBvcnRzLkxvY2FsZSAgID0gTG9jYWxlO1xuZXhwb3J0cy5LZXlDb21ibyA9IEtleUNvbWJvO1xuIiwiXG5mdW5jdGlvbiBLZXlDb21ibyhrZXlDb21ib1N0cikge1xuICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICB0aGlzLnN1YkNvbWJvcyA9IEtleUNvbWJvLnBhcnNlQ29tYm9TdHIoa2V5Q29tYm9TdHIpO1xuICB0aGlzLmtleU5hbWVzICA9IHRoaXMuc3ViQ29tYm9zLnJlZHVjZShmdW5jdGlvbihtZW1vLCBuZXh0U3ViQ29tYm8pIHtcbiAgICByZXR1cm4gbWVtby5jb25jYXQobmV4dFN1YkNvbWJvKTtcbiAgfSwgW10pO1xufVxuXG4vLyBUT0RPOiBBZGQgc3VwcG9ydCBmb3Iga2V5IGNvbWJvIHNlcXVlbmNlc1xuS2V5Q29tYm8uc2VxdWVuY2VEZWxpbWluYXRvciA9ICc+Pic7XG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yICAgID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICAgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIHZhciBzdWJDb21ib1N0cnMgPSBLZXlDb21iby5fc3BsaXRTdHIoa2V5Q29tYm9TdHIsIEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IpO1xuICB2YXIgY29tYm8gICAgICAgID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDAgOyBpIDwgc3ViQ29tYm9TdHJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgY29tYm8ucHVzaChLZXlDb21iby5fc3BsaXRTdHIoc3ViQ29tYm9TdHJzW2ldLCBLZXlDb21iby5rZXlEZWxpbWluYXRvcikpO1xuICB9XG4gIHJldHVybiBjb21ibztcbn07XG5cbktleUNvbWJvLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKHByZXNzZWRLZXlOYW1lcykge1xuICB2YXIgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgdGhpcy5zdWJDb21ib3NbaV0sXG4gICAgICBzdGFydGluZ0tleU5hbWVJbmRleCxcbiAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICk7XG4gICAgaWYgKHN0YXJ0aW5nS2V5TmFtZUluZGV4ID09PSAtMSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbktleUNvbWJvLnByb3RvdHlwZS5pc0VxdWFsID0gZnVuY3Rpb24ob3RoZXJLZXlDb21ibykge1xuICBpZiAoXG4gICAgIW90aGVyS2V5Q29tYm8gfHxcbiAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ29iamVjdCdcbiAgKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICBvdGhlcktleUNvbWJvID0gbmV3IEtleUNvbWJvKG90aGVyS2V5Q29tYm8pO1xuICB9XG5cbiAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAodGhpcy5zdWJDb21ib3NbaV0ubGVuZ3RoICE9PSBvdGhlcktleUNvbWJvLnN1YkNvbWJvc1tpXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIHN1YkNvbWJvICAgICAgPSB0aGlzLnN1YkNvbWJvc1tpXTtcbiAgICB2YXIgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdWJDb21iby5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgdmFyIGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgIHZhciBpbmRleCAgID0gb3RoZXJTdWJDb21iby5pbmRleE9mKGtleU5hbWUpO1xuXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBvdGhlclN1YkNvbWJvLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvdGhlclN1YkNvbWJvLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuS2V5Q29tYm8uX3NwbGl0U3RyID0gZnVuY3Rpb24oc3RyLCBkZWxpbWluYXRvcikge1xuICB2YXIgcyAgPSBzdHI7XG4gIHZhciBkICA9IGRlbGltaW5hdG9yO1xuICB2YXIgYyAgPSAnJztcbiAgdmFyIGNhID0gW107XG5cbiAgZm9yICh2YXIgY2kgPSAwOyBjaSA8IHMubGVuZ3RoOyBjaSArPSAxKSB7XG4gICAgaWYgKGNpID4gMCAmJiBzW2NpXSA9PT0gZCAmJiBzW2NpIC0gMV0gIT09ICdcXFxcJykge1xuICAgICAgY2EucHVzaChjLnRyaW0oKSk7XG4gICAgICBjID0gJyc7XG4gICAgICBjaSArPSAxO1xuICAgIH1cbiAgICBjICs9IHNbY2ldO1xuICB9XG4gIGlmIChjKSB7IGNhLnB1c2goYy50cmltKCkpOyB9XG5cbiAgcmV0dXJuIGNhO1xufTtcblxuS2V5Q29tYm8ucHJvdG90eXBlLl9jaGVja1N1YkNvbWJvID0gZnVuY3Rpb24oc3ViQ29tYm8sIHN0YXJ0aW5nS2V5TmFtZUluZGV4LCBwcmVzc2VkS2V5TmFtZXMpIHtcbiAgc3ViQ29tYm8gPSBzdWJDb21iby5zbGljZSgwKTtcbiAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICB2YXIgZW5kSW5kZXggPSBzdGFydGluZ0tleU5hbWVJbmRleDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJDb21iby5sZW5ndGg7IGkgKz0gMSkge1xuXG4gICAgdmFyIGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICBpZiAoa2V5TmFtZVswXSA9PT0gJ1xcXFwnKSB7XG4gICAgICB2YXIgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgaWYgKFxuICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvciB8fFxuICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICkge1xuICAgICAgICBrZXlOYW1lID0gZXNjYXBlZEtleU5hbWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHN1YkNvbWJvLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICAgIGlmIChpbmRleCA+IGVuZEluZGV4KSB7XG4gICAgICAgIGVuZEluZGV4ID0gaW5kZXg7XG4gICAgICB9XG4gICAgICBpZiAoc3ViQ29tYm8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBlbmRJbmRleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleUNvbWJvO1xuIiwiXG52YXIgTG9jYWxlID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4va2V5LWNvbWJvJyk7XG5cblxuZnVuY3Rpb24gS2V5Ym9hcmQodGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KSB7XG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fY3VycmVudENvbnRleHQgICAgICAgPSBudWxsO1xuICB0aGlzLl9jb250ZXh0cyAgICAgICAgICAgICA9IHt9O1xuICB0aGlzLl9saXN0ZW5lcnMgICAgICAgICAgICA9IFtdO1xuICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xuICB0aGlzLl9sb2NhbGVzICAgICAgICAgICAgICA9IHt9O1xuICB0aGlzLl90YXJnZXRFbGVtZW50ICAgICAgICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0UGxhdGZvcm0gICAgICAgPSAnJztcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ICAgICAgPSAnJztcbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcbiAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSBudWxsO1xuICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcbiAgdGhpcy5fcGF1c2VkICAgICAgICAgICAgICAgPSBmYWxzZTtcbiAgdGhpcy5fY2FsbGVySGFuZGxlciAgICAgICAgPSBudWxsO1xuXG4gIHRoaXMuc2V0Q29udGV4dCgnZ2xvYmFsJyk7XG4gIHRoaXMud2F0Y2godGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KTtcbn1cblxuS2V5Ym9hcmQucHJvdG90eXBlLnNldExvY2FsZSA9IGZ1bmN0aW9uKGxvY2FsZU5hbWUsIGxvY2FsZUJ1aWxkZXIpIHtcbiAgdmFyIGxvY2FsZSA9IG51bGw7XG4gIGlmICh0eXBlb2YgbG9jYWxlTmFtZSA9PT0gJ3N0cmluZycpIHtcblxuICAgIGlmIChsb2NhbGVCdWlsZGVyKSB7XG4gICAgICBsb2NhbGUgPSBuZXcgTG9jYWxlKGxvY2FsZU5hbWUpO1xuICAgICAgbG9jYWxlQnVpbGRlcihsb2NhbGUsIHRoaXMuX3RhcmdldFBsYXRmb3JtLCB0aGlzLl90YXJnZXRVc2VyQWdlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2NhbGUgPSB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdIHx8IG51bGw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxvY2FsZSAgICAgPSBsb2NhbGVOYW1lO1xuICAgIGxvY2FsZU5hbWUgPSBsb2NhbGUuX2xvY2FsZU5hbWU7XG4gIH1cblxuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgID0gbG9jYWxlO1xuICB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdID0gbG9jYWxlO1xuICBpZiAobG9jYWxlKSB7XG4gICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzID0gbG9jYWxlLnByZXNzZWRLZXlzO1xuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxOYW1lKSB7XG4gIGxvY2FsTmFtZSB8fCAobG9jYWxOYW1lID0gdGhpcy5fbG9jYWxlLmxvY2FsZU5hbWUpO1xuICByZXR1cm4gdGhpcy5fbG9jYWxlc1tsb2NhbE5hbWVdIHx8IG51bGw7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0ID0gcmVsZWFzZUhhbmRsZXI7XG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA9IHByZXNzSGFuZGxlcjtcbiAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgID0ga2V5Q29tYm9TdHI7XG4gICAga2V5Q29tYm9TdHIgICAgICAgICAgICA9IG51bGw7XG4gIH1cblxuICBpZiAoXG4gICAga2V5Q29tYm9TdHIgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fbGlzdGVuZXJzLnB1c2goe1xuICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBrZXlDb21ib1N0ciA/IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0cikgOiBudWxsLFxuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBwcmVzc0hhbmRsZXIgICAgICAgICAgIHx8IG51bGwsXG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IHJlbGVhc2VIYW5kbGVyICAgICAgICAgfHwgbnVsbCxcbiAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZSxcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZVxuICB9KTtcbn07XG5LZXlib2FyZC5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUuYmluZDtcbktleWJvYXJkLnByb3RvdHlwZS5vbiAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xuXG5LZXlib2FyZC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJlbGVhc2VIYW5kbGVyID0gcHJlc3NIYW5kbGVyO1xuICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XG4gICAga2V5Q29tYm9TdHIgPSBudWxsO1xuICB9XG5cbiAgaWYgKFxuICAgIGtleUNvbWJvU3RyICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbaV07XG5cbiAgICB2YXIgY29tYm9NYXRjaGVzICAgICAgICAgID0gIWtleUNvbWJvU3RyICYmICFsaXN0ZW5lci5rZXlDb21ibyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5rZXlDb21ibyAmJiBsaXN0ZW5lci5rZXlDb21iby5pc0VxdWFsKGtleUNvbWJvU3RyKTtcbiAgICB2YXIgcHJlc3NIYW5kbGVyTWF0Y2hlcyAgID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJlc3NIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXNzSGFuZGxlciA9PT0gbGlzdGVuZXIucHJlc3NIYW5kbGVyO1xuICAgIHZhciByZWxlYXNlSGFuZGxlck1hdGNoZXMgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcmVsZWFzZUhhbmRsZXIgJiYgIWxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyID09PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcblxuICAgIGlmIChjb21ib01hdGNoZXMgJiYgcHJlc3NIYW5kbGVyTWF0Y2hlcyAmJiByZWxlYXNlSGFuZGxlck1hdGNoZXMpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuS2V5Ym9hcmQucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcbktleWJvYXJkLnByb3RvdHlwZS5vZmYgICAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS51bmJpbmQ7XG5cbktleWJvYXJkLnByb3RvdHlwZS5zZXRDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUpIHtcbiAgaWYodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuXG4gIGlmICghdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdKSB7XG4gICAgdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdID0gW107XG4gIH1cbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgPSB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV07XG4gIHRoaXMuX2N1cnJlbnRDb250ZXh0ID0gY29udGV4dE5hbWU7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fY3VycmVudENvbnRleHQ7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUud2l0aENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSwgY2FsbGJhY2spIHtcbiAgdmFyIHByZXZpb3VzQ29udGV4dE5hbWUgPSB0aGlzLmdldENvbnRleHQoKTtcbiAgdGhpcy5zZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICBjYWxsYmFjaygpO1xuXG4gIHRoaXMuc2V0Q29udGV4dChwcmV2aW91c0NvbnRleHROYW1lKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHRoaXMuc3RvcCgpO1xuXG4gIGlmICghdGFyZ2V0V2luZG93KSB7XG4gICAgaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiAhZ2xvYmFsLmF0dGFjaEV2ZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGdsb2JhbCBmdW5jdGlvbnMgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcbiAgICB9XG4gICAgdGFyZ2V0V2luZG93ID0gZ2xvYmFsO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0YXJnZXRXaW5kb3cubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0UGxhdGZvcm07XG4gICAgdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0RWxlbWVudDtcbiAgICB0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3c7XG4gICAgdGFyZ2V0V2luZG93ICAgID0gZ2xvYmFsO1xuICB9XG5cbiAgaWYgKCF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAmJiAhdGFyZ2V0V2luZG93LmF0dGFjaEV2ZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50IG1ldGhvZHMgb24gdGFyZ2V0V2luZG93LicpO1xuICB9XG5cbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyID0gISF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcblxuICB2YXIgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgdmFyIHBsYXRmb3JtICA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSAgfHwgJyc7XG5cbiAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcbiAgdGFyZ2V0UGxhdGZvcm0gICYmIHRhcmdldFBsYXRmb3JtICAhPT0gbnVsbCB8fCAodGFyZ2V0UGxhdGZvcm0gID0gcGxhdGZvcm0pO1xuICB0YXJnZXRVc2VyQWdlbnQgJiYgdGFyZ2V0VXNlckFnZW50ICE9PSBudWxsIHx8ICh0YXJnZXRVc2VyQWdlbnQgPSB1c2VyQWdlbnQpO1xuXG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5wcmVzc0tleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gICAgX3RoaXMuX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKTtcbiAgfTtcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgfTtcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudClcbiAgfTtcblxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0RWxlbWVudDtcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0VXNlckFnZW50O1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBpZiAoIXRoaXMuX3RhcmdldEVsZW1lbnQgfHwgIXRoaXMuX3RhcmdldFdpbmRvdykgeyByZXR1cm47IH1cblxuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICB0aGlzLl90YXJnZXRXaW5kb3cgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCA9IG51bGw7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucHJlc3NLZXkoa2V5Q29kZSk7XG4gIHRoaXMuX2FwcGx5QmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucmVsZWFzZUtleShrZXlDb2RlKTtcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVsZWFzZUFsbEtleXMgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cbiAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yZWxlYXNlQWxsS2V5cygpO1xuICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fYmluZEV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgIHRhcmdldEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgdGFyZ2V0RWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fdW5iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgdGFyZ2V0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICB0YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9nZXRHcm91cGVkTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsaXN0ZW5lckdyb3VwcyAgID0gW107XG4gIHZhciBsaXN0ZW5lckdyb3VwTWFwID0gW107XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ICE9PSAnZ2xvYmFsJykge1xuICAgIGxpc3RlbmVycyA9IFtdLmNvbmNhdChsaXN0ZW5lcnMsIHRoaXMuX2NvbnRleHRzLmdsb2JhbCk7XG4gIH1cblxuICBsaXN0ZW5lcnMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIChiLmtleUNvbWJvID8gYi5rZXlDb21iby5rZXlOYW1lcy5sZW5ndGggOiAwKSAtIChhLmtleUNvbWJvID8gYS5rZXlDb21iby5rZXlOYW1lcy5sZW5ndGggOiAwKTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbihsKSB7XG4gICAgdmFyIG1hcEluZGV4ID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXSA9PT0gbnVsbCAmJiBsLmtleUNvbWJvID09PSBudWxsIHx8XG4gICAgICAgICAgbGlzdGVuZXJHcm91cE1hcFtpXSAhPT0gbnVsbCAmJiBsaXN0ZW5lckdyb3VwTWFwW2ldLmlzRXF1YWwobC5rZXlDb21ibykpIHtcbiAgICAgICAgbWFwSW5kZXggPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobWFwSW5kZXggPT09IC0xKSB7XG4gICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xuICAgICAgbGlzdGVuZXJHcm91cE1hcC5wdXNoKGwua2V5Q29tYm8pO1xuICAgIH1cbiAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xuICAgICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdID0gW107XG4gICAgfVxuICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xuICB9KTtcbiAgcmV0dXJuIGxpc3RlbmVyR3JvdXBzO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9hcHBseUJpbmRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgdmFyIHByZXZlbnRSZXBlYXQgPSBmYWxzZTtcblxuICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gIGV2ZW50LnByZXZlbnRSZXBlYXQgPSBmdW5jdGlvbigpIHsgcHJldmVudFJlcGVhdCA9IHRydWU7IH07XG4gIGV2ZW50LnByZXNzZWRLZXlzICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgdmFyIHByZXNzZWRLZXlzICAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuICB2YXIgbGlzdGVuZXJHcm91cHMgPSB0aGlzLl9nZXRHcm91cGVkTGlzdGVuZXJzKCk7XG5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGxpc3RlbmVycyA9IGxpc3RlbmVyR3JvdXBzW2ldO1xuICAgIHZhciBrZXlDb21ibyAgPSBsaXN0ZW5lcnNbMF0ua2V5Q29tYm87XG5cbiAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwga2V5Q29tYm8uY2hlY2socHJlc3NlZEtleXMpKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxpc3RlbmVycy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbal07XG5cbiAgICAgICAgaWYgKGtleUNvbWJvID09PSBudWxsKSB7XG4gICAgICAgICAgbGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBrZXlDb21ibyAgICAgICAgICAgICAgIDogbmV3IEtleUNvbWJvKHByZXNzZWRLZXlzLmpvaW4oJysnKSksXG4gICAgICAgICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogbGlzdGVuZXIucHJlc3NIYW5kbGVyLFxuICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLFxuICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA6IGxpc3RlbmVyLnByZXZlbnRSZXBlYXQsXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXIucHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgbGlzdGVuZXIucHJlc3NIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgIGlmIChwcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gcHJldmVudFJlcGVhdDtcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgJiYgdGhpcy5fYXBwbGllZExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChrZXlDb21ibykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleXMuaW5kZXhPZihrZXlDb21iby5rZXlOYW1lc1tqXSk7XG4gICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgcHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIGogLT0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fY2xlYXJCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50IHx8IChldmVudCA9IHt9KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzW2ldO1xuICAgIHZhciBrZXlDb21ibyA9IGxpc3RlbmVyLmtleUNvbWJvO1xuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCAha2V5Q29tYm8uY2hlY2sodGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzKSkge1xuICAgICAgaWYgKHRoaXMuX2NhbGxlckhhbmRsZXIgIT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyKSB7XG4gICAgICAgIHZhciBvbGRDYWxsZXIgPSB0aGlzLl9jYWxsZXJIYW5kbGVyO1xuICAgICAgICB0aGlzLl9jYWxsZXJIYW5kbGVyID0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XG4gICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0O1xuICAgICAgICBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgdGhpcy5fY2FsbGVySGFuZGxlciA9IG9sZENhbGxlcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9oYW5kbGVDb21tYW5kQnVnID0gZnVuY3Rpb24oZXZlbnQsIHBsYXRmb3JtKSB7XG4gIC8vIE9uIE1hYyB3aGVuIHRoZSBjb21tYW5kIGtleSBpcyBrZXB0IHByZXNzZWQsIGtleXVwIGlzIG5vdCB0cmlnZ2VyZWQgZm9yIGFueSBvdGhlciBrZXkuXG4gIC8vIEluIHRoaXMgY2FzZSBmb3JjZSBhIGtleXVwIGZvciBub24tbW9kaWZpZXIga2V5cyBkaXJlY3RseSBhZnRlciB0aGUga2V5cHJlc3MuXG4gIHZhciBtb2RpZmllcktleXMgPSBbXCJzaGlmdFwiLCBcImN0cmxcIiwgXCJhbHRcIiwgXCJjYXBzbG9ja1wiLCBcInRhYlwiLCBcImNvbW1hbmRcIl07XG4gIGlmIChwbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSAmJiB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuaW5jbHVkZXMoXCJjb21tYW5kXCIpICYmXG4gICAgICAhbW9kaWZpZXJLZXlzLmluY2x1ZGVzKHRoaXMuX2xvY2FsZS5nZXRLZXlOYW1lcyhldmVudC5rZXlDb2RlKVswXSkpIHtcbiAgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcoZXZlbnQpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xuIiwiXG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xuXG5cbmZ1bmN0aW9uIExvY2FsZShuYW1lKSB7XG4gIHRoaXMubG9jYWxlTmFtZSAgICAgPSBuYW1lO1xuICB0aGlzLnByZXNzZWRLZXlzICAgID0gW107XG4gIHRoaXMuX2FwcGxpZWRNYWNyb3MgPSBbXTtcbiAgdGhpcy5fa2V5TWFwICAgICAgICA9IHt9O1xuICB0aGlzLl9raWxsS2V5Q29kZXMgID0gW107XG4gIHRoaXMuX21hY3JvcyAgICAgICAgPSBbXTtcbn1cblxuTG9jYWxlLnByb3RvdHlwZS5iaW5kS2V5Q29kZSA9IGZ1bmN0aW9uKGtleUNvZGUsIGtleU5hbWVzKSB7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAga2V5TmFtZXMgPSBba2V5TmFtZXNdO1xuICB9XG5cbiAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmJpbmRNYWNybyA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnc3RyaW5nJykge1xuICAgIGtleU5hbWVzID0gWyBrZXlOYW1lcyBdO1xuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBudWxsO1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgIGtleU5hbWVzID0gbnVsbDtcbiAgfVxuXG4gIHZhciBtYWNybyA9IHtcbiAgICBrZXlDb21ibyA6IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0ciksXG4gICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICBoYW5kbGVyICA6IGhhbmRsZXJcbiAgfTtcblxuICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmdldEtleUNvZGVzID0gZnVuY3Rpb24oa2V5TmFtZSkge1xuICB2YXIga2V5Q29kZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5Q29kZSBpbiB0aGlzLl9rZXlNYXApIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICBpZiAoaW5kZXggPiAtMSkgeyBrZXlDb2Rlcy5wdXNoKGtleUNvZGV8MCk7IH1cbiAgfVxuICByZXR1cm4ga2V5Q29kZXM7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmdldEtleU5hbWVzID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICByZXR1cm4gdGhpcy5fa2V5TWFwW2tleUNvZGVdIHx8IFtdO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5zZXRLaWxsS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9raWxsS2V5Q29kZXMucHVzaChrZXlDb2RlKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIga2V5TmFtZXMgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSkgPT09IC0xKSB7XG4gICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2goa2V5TmFtZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuX2FwcGx5TWFjcm9zKCk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMucmVsZWFzZUtleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgZWxzZSB7XG4gICAgdmFyIGtleU5hbWVzICAgICAgICAgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICAgIHZhciBraWxsS2V5Q29kZUluZGV4ID0gdGhpcy5fa2lsbEtleUNvZGVzLmluZGV4T2Yoa2V5Q29kZSk7XG4gICAgXG4gICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY2xlYXJNYWNyb3MoKTtcbiAgfVxufTtcblxuTG9jYWxlLnByb3RvdHlwZS5fYXBwbHlNYWNyb3MgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1hY3JvcyA9IHRoaXMuX21hY3Jvcy5zbGljZSgwKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYWNyb3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbWFjcm8gPSBtYWNyb3NbaV07XG4gICAgaWYgKG1hY3JvLmtleUNvbWJvLmNoZWNrKHRoaXMucHJlc3NlZEtleXMpKSB7XG4gICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xuICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG1hY3JvLmhhbmRsZXIodGhpcy5wcmVzc2VkS2V5cyk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pID09PSAtMSkge1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMucHVzaChtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3MucHVzaChtYWNybyk7XG4gICAgfVxuICB9XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLl9jbGVhck1hY3JvcyA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRNYWNyb3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbWFjcm8gPSB0aGlzLl9hcHBsaWVkTWFjcm9zW2ldO1xuICAgIGlmICghbWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgIG1hY3JvLmtleU5hbWVzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3Muc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsZTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsb2NhbGUsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcblxuICAvLyBnZW5lcmFsXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzLCAgIFsnY2FuY2VsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOCwgICBbJ2JhY2tzcGFjZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDksICAgWyd0YWInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMiwgIFsnY2xlYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMywgIFsnZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNiwgIFsnc2hpZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNywgIFsnY3RybCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4LCAgWydhbHQnLCAnbWVudSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5LCAgWydwYXVzZScsICdicmVhayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIwLCAgWydjYXBzbG9jayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDI3LCAgWydlc2NhcGUnLCAnZXNjJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzIsICBbJ3NwYWNlJywgJ3NwYWNlYmFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzMsICBbJ3BhZ2V1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM0LCAgWydwYWdlZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM1LCAgWydlbmQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNiwgIFsnaG9tZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM3LCAgWydsZWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzgsICBbJ3VwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzksICBbJ3JpZ2h0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDAsICBbJ2Rvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MSwgIFsnc2VsZWN0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDIsICBbJ3ByaW50c2NyZWVuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDMsICBbJ2V4ZWN1dGUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NCwgIFsnc25hcHNob3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NSwgIFsnaW5zZXJ0JywgJ2lucyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ2LCAgWydkZWxldGUnLCAnZGVsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDcsICBbJ2hlbHAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDUsIFsnc2Nyb2xsbG9jaycsICdzY3JvbGwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODcsIFsnZXF1YWwnLCAnZXF1YWxzaWduJywgJz0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODgsIFsnY29tbWEnLCAnLCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MCwgWydwZXJpb2QnLCAnLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MSwgWydzbGFzaCcsICdmb3J3YXJkc2xhc2gnLCAnLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MiwgWydncmF2ZWFjY2VudCcsICdgJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjE5LCBbJ29wZW5icmFja2V0JywgJ1snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjAsIFsnYmFja3NsYXNoJywgJ1xcXFwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjEsIFsnY2xvc2VicmFja2V0JywgJ10nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjIsIFsnYXBvc3Ryb3BoZScsICdcXCcnXSk7XG5cbiAgLy8gMC05XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OCwgWyd6ZXJvJywgJzAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OSwgWydvbmUnLCAnMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUwLCBbJ3R3bycsICcyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTEsIFsndGhyZWUnLCAnMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUyLCBbJ2ZvdXInLCAnNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUzLCBbJ2ZpdmUnLCAnNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU0LCBbJ3NpeCcsICc2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTUsIFsnc2V2ZW4nLCAnNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU2LCBbJ2VpZ2h0JywgJzgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NywgWyduaW5lJywgJzknXSk7XG5cbiAgLy8gbnVtcGFkXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NiwgWydudW16ZXJvJywgJ251bTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NywgWydudW1vbmUnLCAnbnVtMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk4LCBbJ251bXR3bycsICdudW0yJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTksIFsnbnVtdGhyZWUnLCAnbnVtMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMCwgWydudW1mb3VyJywgJ251bTQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDEsIFsnbnVtZml2ZScsICdudW01J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAyLCBbJ251bXNpeCcsICdudW02J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAzLCBbJ251bXNldmVuJywgJ251bTcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDQsIFsnbnVtZWlnaHQnLCAnbnVtOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNSwgWydudW1uaW5lJywgJ251bTknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDYsIFsnbnVtbXVsdGlwbHknLCAnbnVtKiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNywgWydudW1hZGQnLCAnbnVtKyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOCwgWydudW1lbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOSwgWydudW1zdWJ0cmFjdCcsICdudW0tJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEwLCBbJ251bWRlY2ltYWwnLCAnbnVtLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMSwgWydudW1kaXZpZGUnLCAnbnVtLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NCwgWydudW1sb2NrJywgJ251bSddKTtcblxuICAvLyBmdW5jdGlvbiBrZXlzXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTIsIFsnZjEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTMsIFsnZjInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTQsIFsnZjMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTUsIFsnZjQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTYsIFsnZjUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTcsIFsnZjYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTgsIFsnZjcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTksIFsnZjgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjAsIFsnZjknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjEsIFsnZjEwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIyLCBbJ2YxMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMywgWydmMTInXSk7XG5cbiAgLy8gc2Vjb25kYXJ5IGtleSBzeW1ib2xzXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgYCcsIFsndGlsZGUnLCAnfiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAxJywgWydleGNsYW1hdGlvbicsICdleGNsYW1hdGlvbnBvaW50JywgJyEnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMicsIFsnYXQnLCAnQCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAzJywgWydudW1iZXInLCAnIyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA0JywgWydkb2xsYXInLCAnZG9sbGFycycsICdkb2xsYXJzaWduJywgJyQnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNScsIFsncGVyY2VudCcsICclJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDYnLCBbJ2NhcmV0JywgJ14nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNycsIFsnYW1wZXJzYW5kJywgJ2FuZCcsICcmJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDgnLCBbJ2FzdGVyaXNrJywgJyonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOScsIFsnb3BlbnBhcmVuJywgJygnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMCcsIFsnY2xvc2VwYXJlbicsICcpJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC0nLCBbJ3VuZGVyc2NvcmUnLCAnXyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA9JywgWydwbHVzJywgJysnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgWycsIFsnb3BlbmN1cmx5YnJhY2UnLCAnb3BlbmN1cmx5YnJhY2tldCcsICd7J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIF0nLCBbJ2Nsb3NlY3VybHlicmFjZScsICdjbG9zZWN1cmx5YnJhY2tldCcsICd9J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcXFwnLCBbJ3ZlcnRpY2FsYmFyJywgJ3wnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOycsIFsnY29sb24nLCAnOiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXCcnLCBbJ3F1b3RhdGlvbm1hcmsnLCAnXFwnJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICEsJywgWydvcGVuYW5nbGVicmFja2V0JywgJzwnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLicsIFsnY2xvc2VhbmdsZWJyYWNrZXQnLCAnPiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAvJywgWydxdWVzdGlvbm1hcmsnLCAnPyddKTtcbiAgXG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykpIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjb21tYW5kJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxlLmJpbmRNYWNybygnY3RybCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xuICB9XG5cbiAgLy9hLXogYW5kIEEtWlxuICBmb3IgKHZhciBrZXlDb2RlID0gNjU7IGtleUNvZGUgPD0gOTA7IGtleUNvZGUgKz0gMSkge1xuICAgIHZhciBrZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlICsgMzIpO1xuICAgIHZhciBjYXBpdGFsS2V5TmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSk7XG4gIFx0bG9jYWxlLmJpbmRLZXlDb2RlKGtleUNvZGUsIGtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgXHRsb2NhbGUuYmluZE1hY3JvKCdjYXBzbG9jayArICcgKyBrZXlOYW1lLCBjYXBpdGFsS2V5TmFtZSk7XG4gIH1cblxuICAvLyBicm93c2VyIGNhdmVhdHNcbiAgdmFyIHNlbWljb2xvbktleUNvZGUgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDU5ICA6IDE4NjtcbiAgdmFyIGRhc2hLZXlDb2RlICAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDE3MyA6IDE4OTtcbiAgdmFyIGxlZnRDb21tYW5kS2V5Q29kZTtcbiAgdmFyIHJpZ2h0Q29tbWFuZEtleUNvZGU7XG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgKHVzZXJBZ2VudC5tYXRjaCgnU2FmYXJpJykgfHwgdXNlckFnZW50Lm1hdGNoKCdDaHJvbWUnKSkpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gOTE7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDkzO1xuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnT3BlcmEnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAxNztcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMTc7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMjI0O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAyMjQ7XG4gIH1cbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHNlbWljb2xvbktleUNvZGUsICAgIFsnc2VtaWNvbG9uJywgJzsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShkYXNoS2V5Q29kZSwgICAgICAgICBbJ2Rhc2gnLCAnLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGxlZnRDb21tYW5kS2V5Q29kZSwgIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdsZWZ0Y29tbWFuZCcsICdsZWZ0d2luZG93cycsICdsZWZ0d2luJywgJ2xlZnRzdXBlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHJpZ2h0Q29tbWFuZEtleUNvZGUsIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdyaWdodGNvbW1hbmQnLCAncmlnaHR3aW5kb3dzJywgJ3JpZ2h0d2luJywgJ3JpZ2h0c3VwZXInXSk7XG5cbiAgLy8ga2lsbCBrZXlzXG4gIGxvY2FsZS5zZXRLaWxsS2V5KCdjb21tYW5kJyk7XG59O1xuIiwiaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4vbGliL0FwcGxpY2F0aW9uJ1xuaW1wb3J0IExvYWRpbmdTY2VuZSBmcm9tICcuL3NjZW5lcy9Mb2FkaW5nU2NlbmUnXG5cbi8vIENyZWF0ZSBhIFBpeGkgQXBwbGljYXRpb25cbmxldCBhcHAgPSBuZXcgQXBwbGljYXRpb24oe1xuICB3aWR0aDogMjU2LFxuICBoZWlnaHQ6IDI1NixcbiAgcm91bmRQaXhlbHM6IHRydWUsXG4gIGF1dG9SZXNpemU6IHRydWUsXG4gIHJlc29sdXRpb246IDEsXG4gIGF1dG9TdGFydDogZmFsc2Vcbn0pXG5cbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuYXBwLnJlbmRlcmVyLnZpZXcuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbmFwcC5yZW5kZXJlci5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcblxuLy8gQWRkIHRoZSBjYW52YXMgdGhhdCBQaXhpIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBmb3IgeW91IHRvIHRoZSBIVE1MIGRvY3VtZW50XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFwcC52aWV3KVxuXG5hcHAuY2hhbmdlU3RhZ2UoKVxuYXBwLnN0YXJ0KClcbmFwcC5jaGFuZ2VTY2VuZShMb2FkaW5nU2NlbmUpXG4iLCJleHBvcnQgY29uc3QgSVNfTU9CSUxFID0gKChhKSA9PiAvKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vL2kudGVzdChhKSB8fFxuICAvMTIwN3w2MzEwfDY1OTB8M2dzb3w0dGhwfDUwWzEtNl1pfDc3MHN8ODAyc3xhIHdhfGFiYWN8YWMoZXJ8b298cy0pfGFpKGtvfHJuKXxhbChhdnxjYXxjbyl8YW1vaXxhbihleHxueXx5dyl8YXB0dXxhcihjaHxnbyl8YXModGV8dXMpfGF0dHd8YXUoZGl8LW18ciB8cyApfGF2YW58YmUoY2t8bGx8bnEpfGJpKGxifHJkKXxibChhY3xheil8YnIoZXx2KXd8YnVtYnxidy0obnx1KXxjNTVcXC98Y2FwaXxjY3dhfGNkbS18Y2VsbHxjaHRtfGNsZGN8Y21kLXxjbyhtcHxuZCl8Y3Jhd3xkYShpdHxsbHxuZyl8ZGJ0ZXxkYy1zfGRldml8ZGljYXxkbW9ifGRvKGN8cClvfGRzKDEyfC1kKXxlbCg0OXxhaSl8ZW0obDJ8dWwpfGVyKGljfGswKXxlc2w4fGV6KFs0LTddMHxvc3x3YXx6ZSl8ZmV0Y3xmbHkoLXxfKXxnMSB1fGc1NjB8Z2VuZXxnZi01fGctbW98Z28oXFwud3xvZCl8Z3IoYWR8dW4pfGhhaWV8aGNpdHxoZC0obXxwfHQpfGhlaS18aGkocHR8dGEpfGhwKCBpfGlwKXxocy1jfGh0KGMoLXwgfF98YXxnfHB8c3x0KXx0cCl8aHUoYXd8dGMpfGktKDIwfGdvfG1hKXxpMjMwfGlhYyggfC18XFwvKXxpYnJvfGlkZWF8aWcwMXxpa29tfGltMWt8aW5ub3xpcGFxfGlyaXN8amEodHx2KWF8amJyb3xqZW11fGppZ3N8a2RkaXxrZWppfGtndCggfFxcLyl8a2xvbnxrcHQgfGt3Yy18a3lvKGN8ayl8bGUobm98eGkpfGxnKCBnfFxcLyhrfGx8dSl8NTB8NTR8LVthLXddKXxsaWJ3fGx5bnh8bTEtd3xtM2dhfG01MFxcL3xtYSh0ZXx1aXx4byl8bWMoMDF8MjF8Y2EpfG0tY3J8bWUocmN8cmkpfG1pKG84fG9hfHRzKXxtbWVmfG1vKDAxfDAyfGJpfGRlfGRvfHQoLXwgfG98dil8enopfG10KDUwfHAxfHYgKXxtd2JwfG15d2F8bjEwWzAtMl18bjIwWzItM118bjMwKDB8Mil8bjUwKDB8Mnw1KXxuNygwKDB8MSl8MTApfG5lKChjfG0pLXxvbnx0Znx3Znx3Z3x3dCl8bm9rKDZ8aSl8bnpwaHxvMmltfG9wKHRpfHd2KXxvcmFufG93ZzF8cDgwMHxwYW4oYXxkfHQpfHBkeGd8cGcoMTN8LShbMS04XXxjKSl8cGhpbHxwaXJlfHBsKGF5fHVjKXxwbi0yfHBvKGNrfHJ0fHNlKXxwcm94fHBzaW98cHQtZ3xxYS1hfHFjKDA3fDEyfDIxfDMyfDYwfC1bMi03XXxpLSl8cXRla3xyMzgwfHI2MDB8cmFrc3xyaW05fHJvKHZlfHpvKXxzNTVcXC98c2EoZ2V8bWF8bW18bXN8bnl8dmEpfHNjKDAxfGgtfG9vfHAtKXxzZGtcXC98c2UoYygtfDB8MSl8NDd8bWN8bmR8cmkpfHNnaC18c2hhcnxzaWUoLXxtKXxzay0wfHNsKDQ1fGlkKXxzbShhbHxhcnxiM3xpdHx0NSl8c28oZnR8bnkpfHNwKDAxfGgtfHYtfHYgKXxzeSgwMXxtYil8dDIoMTh8NTApfHQ2KDAwfDEwfDE4KXx0YShndHxsayl8dGNsLXx0ZGctfHRlbChpfG0pfHRpbS18dC1tb3x0byhwbHxzaCl8dHMoNzB8bS18bTN8bTUpfHR4LTl8dXAoXFwuYnxnMXxzaSl8dXRzdHx2NDAwfHY3NTB8dmVyaXx2aShyZ3x0ZSl8dmsoNDB8NVswLTNdfC12KXx2bTQwfHZvZGF8dnVsY3x2eCg1Mnw1M3w2MHw2MXw3MHw4MHw4MXw4M3w4NXw5OCl8dzNjKC18ICl8d2ViY3x3aGl0fHdpKGcgfG5jfG53KXx3bWxifHdvbnV8eDcwMHx5YXMtfHlvdXJ8emV0b3x6dGUtL2kudGVzdChhLnN1YnN0cigwLCA0KSlcbikobmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudmVuZG9yIHx8IHdpbmRvdy5vcGVyYSlcblxuZXhwb3J0IGNvbnN0IENFSUxfU0laRSA9IDMyXG5cbmV4cG9ydCBjb25zdCBBQklMSVRZX01PVkUgPSBTeW1ib2woJ21vdmUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfQ0FNRVJBID0gU3ltYm9sKCdjYW1lcmEnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfT1BFUkFURSA9IFN5bWJvbCgnb3BlcmF0ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9LRVlfTU9WRSA9IFN5bWJvbCgna2V5LW1vdmUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfSEVBTFRIID0gU3ltYm9sKCdoZWFsdGgnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfQ0FSUlkgPSBTeW1ib2woJ2NhcnJ5JylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0xFQVJOID0gU3ltYm9sKCdsZWFybicpXG5leHBvcnQgY29uc3QgQUJJTElUWV9QTEFDRSA9IFN5bWJvbCgncGxhY2UnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfS0VZX1BMQUNFID0gU3ltYm9sKCdrZXktcGxhY2UnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfS0VZX0ZJUkUgPSBTeW1ib2woJ2ZpcmUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfUk9UQVRFID0gU3ltYm9sKCdyb3RhdGUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfREFNQUdFID0gU3ltYm9sKCdkYW1hZ2UnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVElFU19BTEwgPSBbXG4gIEFCSUxJVFlfTU9WRSxcbiAgQUJJTElUWV9DQU1FUkEsXG4gIEFCSUxJVFlfT1BFUkFURSxcbiAgQUJJTElUWV9LRVlfTU9WRSxcbiAgQUJJTElUWV9IRUFMVEgsXG4gIEFCSUxJVFlfQ0FSUlksXG4gIEFCSUxJVFlfTEVBUk4sXG4gIEFCSUxJVFlfUExBQ0UsXG4gIEFCSUxJVFlfS0VZX1BMQUNFLFxuICBBQklMSVRZX0tFWV9GSVJFLFxuICBBQklMSVRZX1JPVEFURSxcbiAgQUJJTElUWV9EQU1BR0Vcbl1cblxuLy8gb2JqZWN0IHR5cGUsIHN0YXRpYyBvYmplY3QsIG5vdCBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFUSUMgPSAnc3RhdGljJ1xuLy8gY29sbGlkZSB3aXRoXG5leHBvcnQgY29uc3QgU1RBWSA9ICdzdGF5J1xuLy8gdG91Y2ggd2lsbCByZXBseVxuZXhwb3J0IGNvbnN0IFJFUExZID0gJ3JlcGx5J1xuIiwiZXhwb3J0IGNvbnN0IExFRlQgPSAnYSdcbmV4cG9ydCBjb25zdCBVUCA9ICd3J1xuZXhwb3J0IGNvbnN0IFJJR0hUID0gJ2QnXG5leHBvcnQgY29uc3QgRE9XTiA9ICdzJ1xuZXhwb3J0IGNvbnN0IFBMQUNFMSA9ICcxJ1xuZXhwb3J0IGNvbnN0IFBMQUNFMiA9ICcyJ1xuZXhwb3J0IGNvbnN0IFBMQUNFMyA9ICczJ1xuZXhwb3J0IGNvbnN0IFBMQUNFNCA9ICc0J1xuZXhwb3J0IGNvbnN0IEZJUkUgPSAnZidcbiIsImltcG9ydCB7IEFwcGxpY2F0aW9uIGFzIFBpeGlBcHBsaWNhdGlvbiwgR3JhcGhpY3MsIGRpc3BsYXkgfSBmcm9tICcuL1BJWEknXG5pbXBvcnQgZ2xvYmFsRXZlbnRNYW5hZ2VyIGZyb20gJy4vZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xuXG5sZXQgYXBwXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgUGl4aUFwcGxpY2F0aW9uIHtcbiAgY29uc3RydWN0b3IgKC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKVxuICAgIGFwcCA9IHRoaXNcbiAgfVxuXG4gIC8vIG9ubHkgb25lIGluc3RhbmNlIGZvciBub3dcbiAgc3RhdGljIGdldEFwcCAoKSB7XG4gICAgcmV0dXJuIGFwcFxuICB9XG5cbiAgY2hhbmdlU3RhZ2UgKCkge1xuICAgIHRoaXMuc3RhZ2UgPSBuZXcgZGlzcGxheS5TdGFnZSgpXG4gIH1cblxuICBjaGFuZ2VTY2VuZSAoU2NlbmVOYW1lLCBwYXJhbXMpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50U2NlbmUpIHtcbiAgICAgIC8vIG1heWJlIHVzZSBwcm9taXNlIGZvciBhbmltYXRpb25cbiAgICAgIC8vIHJlbW92ZSBnYW1lbG9vcD9cbiAgICAgIHRoaXMuY3VycmVudFNjZW5lLmRlc3Ryb3koKVxuICAgICAgdGhpcy5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLmN1cnJlbnRTY2VuZSlcbiAgICB9XG5cbiAgICBsZXQgc2NlbmUgPSBuZXcgU2NlbmVOYW1lKHBhcmFtcylcbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKHNjZW5lKVxuICAgIHNjZW5lLmNyZWF0ZSgpXG4gICAgc2NlbmUub24oJ2NoYW5nZVNjZW5lJywgdGhpcy5jaGFuZ2VTY2VuZS5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5jdXJyZW50U2NlbmUgPSBzY2VuZVxuICB9XG5cbiAgc3RhcnQgKC4uLmFyZ3MpIHtcbiAgICBzdXBlci5zdGFydCguLi5hcmdzKVxuXG4gICAgLy8gY3JlYXRlIGEgYmFja2dyb3VuZCBtYWtlIHN0YWdlIGhhcyB3aWR0aCAmIGhlaWdodFxuICAgIGxldCB2aWV3ID0gdGhpcy5yZW5kZXJlci52aWV3XG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChcbiAgICAgIG5ldyBHcmFwaGljcygpLmRyYXdSZWN0KDAsIDAsIHZpZXcud2lkdGgsIHZpZXcuaGVpZ2h0KVxuICAgIClcblxuICAgIGdsb2JhbEV2ZW50TWFuYWdlci5zZXRJbnRlcmFjdGlvbih0aGlzLnJlbmRlcmVyLnBsdWdpbnMuaW50ZXJhY3Rpb24pXG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgdGhpcy50aWNrZXIuYWRkKGRlbHRhID0+IHRoaXMuZ2FtZUxvb3AuYmluZCh0aGlzKShkZWx0YSkpXG4gIH1cblxuICBnYW1lTG9vcCAoZGVsdGEpIHtcbiAgICAvLyBVcGRhdGUgdGhlIGN1cnJlbnQgZ2FtZSBzdGF0ZTpcbiAgICB0aGlzLmN1cnJlbnRTY2VuZS50aWNrKGRlbHRhKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcGxpY2F0aW9uXG4iLCJpbXBvcnQgeyBHcmFwaGljcyB9IGZyb20gJy4vUElYSSdcbmltcG9ydCB7IENFSUxfU0laRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IExJR0hUID0gU3ltYm9sKCdsaWdodCcpXG5cbmNsYXNzIExpZ2h0IHtcbiAgc3RhdGljIGxpZ2h0T24gKHRhcmdldCwgcmFkaXVzLCByYW5kID0gMSkge1xuICAgIGxldCBjb250YWluZXIgPSB0YXJnZXQucGFyZW50XG4gICAgaWYgKCFjb250YWluZXIubGlnaHRpbmcpIHtcbiAgICAgIC8vIGNvbnRhaW5lciBkb2VzIE5PVCBoYXMgbGlnaHRpbmcgcHJvcGVydHlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgbGlnaHRidWxiID0gbmV3IEdyYXBoaWNzKClcbiAgICB2YXIgcnIgPSAweGZmXG4gICAgdmFyIHJnID0gMHhmZlxuICAgIHZhciByYiA9IDB4ZmZcbiAgICB2YXIgcmFkID0gcmFkaXVzICogQ0VJTF9TSVpFXG5cbiAgICBsZXQgYW5jaG9yID0gdGFyZ2V0LmFuY2hvclxuICAgIGxldCB4ID0gdGFyZ2V0LndpZHRoICogKDAuNSAtIGFuY2hvci54KVxuICAgIGxldCB5ID0gdGFyZ2V0LmhlaWdodCAqICgwLjUgLSBhbmNob3IueSlcbiAgICBsaWdodGJ1bGIuYmVnaW5GaWxsKChyciA8PCAxNikgKyAocmcgPDwgOCkgKyByYiwgMS4wKVxuICAgIGxpZ2h0YnVsYi5kcmF3Q2lyY2xlKHgsIHksIHJhZClcbiAgICBsaWdodGJ1bGIuZW5kRmlsbCgpXG4gICAgbGlnaHRidWxiLnBhcmVudExheWVyID0gY29udGFpbmVyLmxpZ2h0aW5nIC8vIG11c3QgaGFzIHByb3BlcnR5OiBsaWdodGluZ1xuXG4gICAgdGFyZ2V0W0xJR0hUXSA9IHtcbiAgICAgIGxpZ2h0OiBsaWdodGJ1bGJcbiAgICB9XG4gICAgdGFyZ2V0LmFkZENoaWxkKGxpZ2h0YnVsYilcblxuICAgIGlmIChyYW5kICE9PSAxKSB7XG4gICAgICBsZXQgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGxldCBkU2NhbGUgPSBNYXRoLnJhbmRvbSgpICogKDEgLSByYW5kKVxuICAgICAgICBpZiAobGlnaHRidWxiLnNjYWxlLnggPiAxKSB7XG4gICAgICAgICAgZFNjYWxlID0gLWRTY2FsZVxuICAgICAgICB9XG4gICAgICAgIGxpZ2h0YnVsYi5zY2FsZS54ICs9IGRTY2FsZVxuICAgICAgICBsaWdodGJ1bGIuc2NhbGUueSArPSBkU2NhbGVcbiAgICAgICAgbGlnaHRidWxiLmFscGhhICs9IGRTY2FsZVxuICAgICAgfSwgMTAwMCAvIDEyKVxuICAgICAgdGFyZ2V0W0xJR0hUXS5pbnRlcnZhbCA9IGludGVydmFsXG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGxpZ2h0T2ZmICh0YXJnZXQpIHtcbiAgICBpZiAoIXRhcmdldFtMSUdIVF0pIHtcbiAgICAgIC8vIG5vIGxpZ2h0IHRvIHJlbW92ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIHJlbW92ZSBsaWdodFxuICAgIHRhcmdldC5yZW1vdmVDaGlsZCh0YXJnZXRbTElHSFRdLmxpZ2h0KVxuICAgIC8vIHJlbW92ZSBpbnRlcnZhbFxuICAgIGNsZWFySW50ZXJ2YWwodGFyZ2V0W0xJR0hUXS5pbnRlcnZhbClcbiAgICBkZWxldGUgdGFyZ2V0W0xJR0hUXVxuICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgIHRhcmdldC5vZmYoJ3JlbW92ZWQnLCBMaWdodC5saWdodE9mZilcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaWdodFxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xyXG5cclxuaW1wb3J0IHsgU1RBWSwgU1RBVElDLCBSRVBMWSwgQ0VJTF9TSVpFLCBBQklMSVRZX0tFWV9GSVJFLCBBQklMSVRZX0tFWV9NT1ZFLCBBQklMSVRZX1JPVEFURSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCB7IGluc3RhbmNlQnlJdGVtSWQgfSBmcm9tICcuL3V0aWxzJ1xyXG5pbXBvcnQgTWFwV29ybGQgZnJvbSAnLi4vbGliL01hcFdvcmxkJ1xyXG5cclxubGV0IGlzR2FtZU92ZXIgPSBmYWxzZVxyXG5cclxuY29uc3QgcGlwZSA9IChmaXJzdCwgLi4ubW9yZSkgPT5cclxuICBtb3JlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiAoLi4uYXJncykgPT4gY3VycihhY2MoLi4uYXJncykpLCBmaXJzdClcclxuXHJcbmNvbnN0IG9iamVjdEV2ZW50ID0ge1xyXG4gIHBsYWNlIChvYmplY3QsIHBsYWNlZCkge1xyXG4gICAgbGV0IHBvc2l0aW9uID0gb2JqZWN0LnBvc2l0aW9uXHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QocGxhY2VkLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KVxyXG4gIH0sXHJcbiAgZmlyZSAob2JqZWN0LCBidWxsZXQpIHtcclxuICAgIHRoaXMuYWRkR2FtZU9iamVjdChidWxsZXQpXHJcbiAgfSxcclxuICBkaWUgKG9iamVjdCkge1xyXG4gICAgaXNHYW1lT3ZlciA9IHRydWVcclxuICAgIG9iamVjdFtBQklMSVRZX0tFWV9GSVJFXS5kcm9wQnkob2JqZWN0KVxyXG4gICAgb2JqZWN0W0FCSUxJVFlfS0VZX01PVkVdLmRyb3BCeShvYmplY3QpXHJcbiAgICBvYmplY3RbQUJJTElUWV9ST1RBVEVdLmRyb3BCeShvYmplY3QpXHJcbiAgICBvYmplY3Quc2F5KCdZb3UgZGllLicpXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogZXZlbnRzOlxyXG4gKiAgdXNlOiBvYmplY3RcclxuICovXHJcbmNsYXNzIE1hcCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5jZWlsU2l6ZSA9IENFSUxfU0laRVxyXG5cclxuICAgIHRoaXMub2JqZWN0cyA9IHtcclxuICAgICAgW1NUQVRJQ106IFtdLFxyXG4gICAgICBbU1RBWV06IFtdLFxyXG4gICAgICBbUkVQTFldOiBbXVxyXG4gICAgfVxyXG4gICAgdGhpcy5tYXAgPSBuZXcgQ29udGFpbmVyKClcclxuICAgIHRoaXMubWFwLndpbGxSZW1vdmVDaGlsZCA9IHRoaXMud2lsbFJlbW92ZUNoaWxkLmJpbmQodGhpcylcclxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5tYXApXHJcblxyXG4gICAgLy8gcGxheWVyIGdyb3VwXHJcbiAgICB0aGlzLnBsYXllckdyb3VwID0gbmV3IGRpc3BsYXkuR3JvdXAoKVxyXG4gICAgbGV0IHBsYXllckxheWVyID0gbmV3IGRpc3BsYXkuTGF5ZXIodGhpcy5wbGF5ZXJHcm91cClcclxuICAgIHRoaXMuYWRkQ2hpbGQocGxheWVyTGF5ZXIpXHJcblxyXG4gICAgLy8gcGh5c2ljXHJcbiAgICB0aGlzLm1hcFdvcmxkID0gbmV3IE1hcFdvcmxkKClcclxuXHJcbiAgICB0aGlzLndpbGxSZW1vdmVkID0gW11cclxuICB9XHJcblxyXG4gIGxvYWQgKG1hcERhdGEpIHtcclxuICAgIGxldCB0aWxlcyA9IG1hcERhdGEudGlsZXNcclxuICAgIGxldCBjb2xzID0gbWFwRGF0YS5jb2xzXHJcbiAgICBsZXQgcm93cyA9IG1hcERhdGEucm93c1xyXG4gICAgbGV0IGl0ZW1zID0gbWFwRGF0YS5pdGVtc1xyXG5cclxuICAgIGxldCBjZWlsU2l6ZSA9IHRoaXMuY2VpbFNpemVcclxuXHJcbiAgICBsZXQgYWRkR2FtZU9iamVjdCA9IChpLCBqLCBpZCwgcGFyYW1zKSA9PiB7XHJcbiAgICAgIGxldCBvID0gaW5zdGFuY2VCeUl0ZW1JZChpZCwgcGFyYW1zKVxyXG4gICAgICB0aGlzLmFkZEdhbWVPYmplY3QobywgaSAqIGNlaWxTaXplLCBqICogY2VpbFNpemUpXHJcbiAgICAgIHJldHVybiBbbywgaSwgal1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgcmVnaXN0ZXJPbiA9IChbbywgaSwgal0pID0+IHtcclxuICAgICAgby5vbigndXNlJywgKCkgPT4gdGhpcy5lbWl0KCd1c2UnLCBvKSlcclxuICAgICAgby5vbignZmlyZScsIG9iamVjdEV2ZW50LmZpcmUuYmluZCh0aGlzLCBvKSlcclxuICAgICAgLy8gVE9ETzogcmVtb3ZlIG1hcCBpdGVtXHJcbiAgICAgIC8vIGRlbGV0ZSBpdGVtc1tpXVxyXG4gICAgICByZXR1cm4gW28sIGksIGpdXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xzOyBpKyspIHtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dzOyBqKyspIHtcclxuICAgICAgICBwaXBlKGFkZEdhbWVPYmplY3QsIHJlZ2lzdGVyT24pKGksIGosIHRpbGVzW2ogKiBjb2xzICsgaV0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGxldCBbIGlkLCBbaSwgal0sIHBhcmFtcyBdID0gaXRlbVxyXG4gICAgICBwaXBlKGFkZEdhbWVPYmplY3QsIHJlZ2lzdGVyT24pKGksIGosIGlkLCBwYXJhbXMpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgYWRkUGxheWVyIChwbGF5ZXIsIHRvUG9zaXRpb24pIHtcclxuICAgIC8vIOiou+WGiuS6i+S7tlxyXG4gICAgT2JqZWN0LmVudHJpZXMob2JqZWN0RXZlbnQpLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XHJcbiAgICAgIGxldCBlSW5zdGFuY2UgPSBoYW5kbGVyLmJpbmQodGhpcywgcGxheWVyKVxyXG4gICAgICBwbGF5ZXIub24oZXZlbnROYW1lLCBlSW5zdGFuY2UpXHJcbiAgICAgIHBsYXllci5vbmNlKCdyZW1vdmVkJywgcGxheWVyLm9mZi5iaW5kKHBsYXllciwgZXZlbnROYW1lLCBlSW5zdGFuY2UpKVxyXG4gICAgfSlcclxuICAgIC8vIOaWsOWinuiHs+WcsOWcluS4ilxyXG4gICAgdGhpcy5hZGRHYW1lT2JqZWN0KFxyXG4gICAgICBwbGF5ZXIsXHJcbiAgICAgIHRvUG9zaXRpb25bMF0gKiB0aGlzLmNlaWxTaXplLFxyXG4gICAgICB0b1Bvc2l0aW9uWzFdICogdGhpcy5jZWlsU2l6ZSlcclxuXHJcbiAgICAvLyBwbGF5ZXIg572u6aCC6aGv56S6XHJcbiAgICBwbGF5ZXIucGFyZW50R3JvdXAgPSB0aGlzLnBsYXllckdyb3VwXHJcblxyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXJcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICBpZiAoaXNHYW1lT3Zlcikge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMub2JqZWN0c1tTVEFZXS5mb3JFYWNoKG8gPT4gby50aWNrKGRlbHRhKSlcclxuICAgIHRoaXMubWFwV29ybGQudXBkYXRlKGRlbHRhKVxyXG4gICAgdGhpcy53aWxsUmVtb3ZlZC5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgdGhpcy5tYXAucmVtb3ZlQ2hpbGQoY2hpbGQpXHJcbiAgICAgIC8vIGNoaWxkLmRlc3Ryb3koKXdhZHdhXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgYWRkR2FtZU9iamVjdCAobywgeCA9IHVuZGVmaW5lZCwgeSA9IHVuZGVmaW5lZCkge1xyXG4gICAgaWYgKHggIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBvLnBvc2l0aW9uRXguc2V0KHgsIHkpXHJcbiAgICB9XHJcbiAgICBvLmFuY2hvci5zZXQoMC41LCAwLjUpXHJcblxyXG4gICAgbGV0IG9BcnJheSA9IHRoaXMub2JqZWN0c1tvLnR5cGVdXHJcbiAgICBvQXJyYXkucHVzaChvKVxyXG4gICAgby5vbmNlKCdyZW1vdmVkJywgKCkgPT4ge1xyXG4gICAgICBsZXQgaW54ID0gb0FycmF5LmluZGV4T2YobylcclxuICAgICAgb0FycmF5LnNwbGljZShpbngsIDEpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGFkZCB0byB3b3JsZFxyXG4gICAgdGhpcy5tYXBXb3JsZC5hZGQobylcclxuICAgIHRoaXMubWFwLmFkZENoaWxkKG8pXHJcbiAgfVxyXG5cclxuICBzZXRTY2FsZSAoc2NhbGUpIHtcclxuICAgIHRoaXMuc2NhbGUuc2V0KHNjYWxlKVxyXG4gICAgdGhpcy5tYXBXb3JsZC5zY2FsZShzY2FsZSlcclxuICB9XHJcblxyXG4gIHNldFBvc2l0aW9uICh4LCB5KSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxyXG4gIH1cclxuXHJcbiAgZGVidWcgKG9wdCkge1xyXG4gICAgdGhpcy5tYXBXb3JsZC5lbmFibGVSZW5kZXIob3B0KVxyXG4gICAgdGhpcy5tYXBXb3JsZC5mb2xsb3codGhpcy5wbGF5ZXIuYm9keSlcclxuICB9XHJcblxyXG4gIHdpbGxSZW1vdmVDaGlsZCAoY2hpbGQpIHtcclxuICAgIHRoaXMud2lsbFJlbW92ZWQucHVzaChjaGlsZClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hcFxyXG4iLCJpbXBvcnQgeyBDb250YWluZXIsIGRpc3BsYXksIEJMRU5EX01PREVTLCBTcHJpdGUgfSBmcm9tICcuL1BJWEknXHJcblxyXG5jbGFzcyBNYXBGb2cgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKClcclxuICAgIGxldCBsaWdodGluZyA9IG5ldyBkaXNwbGF5LkxheWVyKClcclxuICAgIGxpZ2h0aW5nLm9uKCdkaXNwbGF5JywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgZWxlbWVudC5ibGVuZE1vZGUgPSBCTEVORF9NT0RFUy5BRERcclxuICAgIH0pXHJcbiAgICBsaWdodGluZy51c2VSZW5kZXJUZXh0dXJlID0gdHJ1ZVxyXG4gICAgbGlnaHRpbmcuY2xlYXJDb2xvciA9IFswLCAwLCAwLCAxXSAvLyBhbWJpZW50IGdyYXlcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nKVxyXG5cclxuICAgIHZhciBsaWdodGluZ1Nwcml0ZSA9IG5ldyBTcHJpdGUobGlnaHRpbmcuZ2V0UmVuZGVyVGV4dHVyZSgpKVxyXG4gICAgbGlnaHRpbmdTcHJpdGUuYmxlbmRNb2RlID0gQkxFTkRfTU9ERVMuTVVMVElQTFlcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nU3ByaXRlKVxyXG5cclxuICAgIHRoaXMubGlnaHRpbmcgPSBsaWdodGluZ1xyXG4gIH1cclxuXHJcbiAgZW5hYmxlIChtYXApIHtcclxuICAgIHRoaXMubGlnaHRpbmcuY2xlYXJDb2xvciA9IFswLCAwLCAwLCAxXVxyXG4gICAgbWFwLm1hcC5saWdodGluZyA9IHRoaXMubGlnaHRpbmdcclxuICB9XHJcblxyXG4gIC8vIOa2iOmZpOi/t+mcp1xyXG4gIGRpc2FibGUgKCkge1xyXG4gICAgdGhpcy5saWdodGluZy5jbGVhckNvbG9yID0gWzEsIDEsIDEsIDFdXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXBGb2dcclxuIiwiaW1wb3J0IHsgRW5naW5lLCBFdmVudHMsIFdvcmxkLCBSZW5kZXIsIE1vdXNlLCBNb3VzZUNvbnN0cmFpbnQsIEJvZHkgfSBmcm9tICcuL01hdHRlcidcbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmxldCBQQVJFTlQgPSBTeW1ib2woJ3BhcmVudCcpXG5cbmZ1bmN0aW9uIGZvbGxvdyAoYm9keSkge1xuICBsZXQgZW5naW5lID0gdGhpcy5lbmdpbmVcbiAgbGV0IGluaXRpYWxFbmdpbmVCb3VuZHNNYXhYID0gdGhpcy5pbml0aWFsRW5naW5lQm91bmRzTWF4WFxuICBsZXQgaW5pdGlhbEVuZ2luZUJvdW5kc01heFkgPSB0aGlzLmluaXRpYWxFbmdpbmVCb3VuZHNNYXhZXG4gIGxldCBjZW50ZXJYID0gLXRoaXMuY2VudGVyLnhcbiAgbGV0IGNlbnRlclkgPSAtdGhpcy5jZW50ZXIueVxuICBsZXQgYm91bmRzID0gZW5naW5lLnJlbmRlci5ib3VuZHNcbiAgbGV0IGJvZHlYID0gYm9keS5wb3NpdGlvbi54XG4gIGxldCBib2R5WSA9IGJvZHkucG9zaXRpb24ueVxuXG4gIC8vIEZhbGxvdyBIZXJvIFhcbiAgYm91bmRzLm1pbi54ID0gY2VudGVyWCArIGJvZHlYXG4gIGJvdW5kcy5tYXgueCA9IGNlbnRlclggKyBib2R5WCArIGluaXRpYWxFbmdpbmVCb3VuZHNNYXhYXG5cbiAgLy8gRmFsbG93IEhlcm8gWVxuICBib3VuZHMubWluLnkgPSBjZW50ZXJZICsgYm9keVlcbiAgYm91bmRzLm1heC55ID0gY2VudGVyWSArIGJvZHlZICsgaW5pdGlhbEVuZ2luZUJvdW5kc01heFlcblxuICBNb3VzZS5zZXRPZmZzZXQodGhpcy5tb3VzZUNvbnN0cmFpbnQubW91c2UsIGJvdW5kcy5taW4pXG59XG5cbmNsYXNzIE1hcFdvcmxkIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIHBoeXNpY1xuICAgIGxldCBlbmdpbmUgPSBFbmdpbmUuY3JlYXRlKClcblxuICAgIGxldCB3b3JsZCA9IGVuZ2luZS53b3JsZFxuICAgIHdvcmxkLmdyYXZpdHkueSA9IDBcbiAgICAvLyBhcHBseSBmb3JjZSBhdCBuZXh0IHVwZGF0ZVxuICAgIHdvcmxkLmZvcmNlc1dhaXRGb3JBcHBseSA9IFtdXG5cbiAgICBFdmVudHMub24oZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCBldmVudCA9PiB7XG4gICAgICB2YXIgcGFpcnMgPSBldmVudC5wYWlyc1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcGFpciA9IHBhaXJzW2ldXG4gICAgICAgIGxldCBvMSA9IHBhaXIuYm9keUFbUEFSRU5UXVxuICAgICAgICBsZXQgbzIgPSBwYWlyLmJvZHlCW1BBUkVOVF1cbiAgICAgICAgbzEuZW1pdCgnY29sbGlkZScsIG8yKVxuICAgICAgICBvMi5lbWl0KCdjb2xsaWRlJywgbzEpXG4gICAgICB9XG4gICAgfSlcbiAgICBFdmVudHMub24oZW5naW5lLCAnYmVmb3JlVXBkYXRlJywgZXZlbnQgPT4ge1xuICAgICAgd29ybGQuZm9yY2VzV2FpdEZvckFwcGx5LmZvckVhY2goKHtvd25lciwgdmVjdG9yfSkgPT4ge1xuICAgICAgICBpZiAob3duZXIpIHtcbiAgICAgICAgICBCb2R5LmFwcGx5Rm9yY2Uob3duZXIuYm9keSwgb3duZXIucG9zaXRpb25FeCwgdmVjdG9yKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgd29ybGQuZm9yY2VzV2FpdEZvckFwcGx5ID0gW11cbiAgICB9KVxuXG4gICAgdGhpcy5lbmdpbmUgPSBlbmdpbmVcbiAgICB0aGlzLm1vdXNlQ29uc3RyYWludCA9IE1vdXNlQ29uc3RyYWludC5jcmVhdGUoZW5naW5lKVxuICAgIFdvcmxkLmFkZChlbmdpbmUud29ybGQsIHRoaXMubW91c2VDb25zdHJhaW50KVxuICB9XG5cbiAgYWRkIChvKSB7XG4gICAgaWYgKG8udHlwZSA9PT0gU1RBVElDKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IHdvcmxkID0gdGhpcy5lbmdpbmUud29ybGRcbiAgICBvLmFkZEJvZHkoKVxuICAgIGxldCBib2R5ID0gby5ib2R5XG4gICAgby5vbmNlKCdyZW1vdmVkJywgKCkgPT4ge1xuICAgICAgV29ybGQucmVtb3ZlKHdvcmxkLCBib2R5KVxuICAgIH0pXG4gICAgYm9keVtQQVJFTlRdID0gb1xuICAgIGJvZHkud29ybGQgPSB3b3JsZFxuICAgIFdvcmxkLmFkZEJvZHkod29ybGQsIGJvZHkpXG4gIH1cblxuICB1cGRhdGUgKGRlbHRhKSB7XG4gICAgRW5naW5lLnVwZGF0ZSh0aGlzLmVuZ2luZSwgZGVsdGEgKiAxNi42NjYpXG4gIH1cblxuICBlbmFibGVSZW5kZXIgKHt3aWR0aCwgaGVpZ2h0fSkge1xuICAgIGxldCBlbmdpbmUgPSB0aGlzLmVuZ2luZVxuICAgIC8vIGNyZWF0ZSBhIHJlbmRlcmVyXG4gICAgdmFyIHJlbmRlciA9IFJlbmRlci5jcmVhdGUoe1xuICAgICAgZWxlbWVudDogZG9jdW1lbnQuYm9keSxcbiAgICAgIGVuZ2luZSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgd2lkdGg6IHdpZHRoICogMixcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHQgKiAyLFxuICAgICAgICB3aXJlZnJhbWVzOiB0cnVlLFxuICAgICAgICBoYXNCb3VuZHM6IHRydWUsXG4gICAgICAgIHdpcmVmcmFtZUJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCdcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gcnVuIHRoZSByZW5kZXJlclxuICAgIFJlbmRlci5ydW4ocmVuZGVyKVxuICAgIHRoaXMuZW5naW5lLnJlbmRlciA9IHJlbmRlclxuICAgIHRoaXMuaW5pdGlhbEVuZ2luZUJvdW5kc01heFggPSByZW5kZXIuYm91bmRzLm1heC54XG4gICAgdGhpcy5pbml0aWFsRW5naW5lQm91bmRzTWF4WSA9IHJlbmRlci5ib3VuZHMubWF4LnlcbiAgICB0aGlzLmNlbnRlciA9IHtcbiAgICAgIHg6IHdpZHRoIC8gMixcbiAgICAgIHk6IGhlaWdodCAvIDJcbiAgICB9XG4gIH1cblxuICBmb2xsb3cgKGJvZHkpIHtcbiAgICBFdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCBmb2xsb3cuYmluZCh0aGlzLCBib2R5KSlcbiAgfVxuXG4gIHNjYWxlIChzY2FsZVgsIHNjYWxlWSA9IHNjYWxlWCkge1xuICAgIE1vdXNlLnNldFNjYWxlKHRoaXMubW91c2VDb25zdHJhaW50Lm1vdXNlLCB7XG4gICAgICB4OiB0aGlzLnNjYWxlWCxcbiAgICAgIHk6IHRoaXMuc2NhbGVZXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYXBXb3JsZFxuIiwiLyogZ2xvYmFsIE1hdHRlciAqL1xuZXhwb3J0IGNvbnN0IEVuZ2luZSA9IE1hdHRlci5FbmdpbmVcbmV4cG9ydCBjb25zdCBSZW5kZXIgPSBNYXR0ZXIuUmVuZGVyXG5leHBvcnQgY29uc3QgV29ybGQgPSBNYXR0ZXIuV29ybGRcbmV4cG9ydCBjb25zdCBCb2RpZXMgPSBNYXR0ZXIuQm9kaWVzXG5leHBvcnQgY29uc3QgRXZlbnRzID0gTWF0dGVyLkV2ZW50c1xuZXhwb3J0IGNvbnN0IEJvZHkgPSBNYXR0ZXIuQm9keVxuZXhwb3J0IGNvbnN0IFZlY3RvciA9IE1hdHRlci5WZWN0b3JcbmV4cG9ydCBjb25zdCBDb21wb3NpdGUgPSBNYXR0ZXIuQ29tcG9zaXRlXG5leHBvcnQgY29uc3QgTW91c2UgPSBNYXR0ZXIuTW91c2VcbmV4cG9ydCBjb25zdCBNb3VzZUNvbnN0cmFpbnQgPSBNYXR0ZXIuTW91c2VDb25zdHJhaW50XG4iLCJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cydcblxuY29uc3QgTUFYX01FU1NBR0VfQ09VTlQgPSA1MDBcblxuY2xhc3MgTWVzc2FnZXMgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuX21lc3NhZ2VzID0gW11cbiAgfVxuXG4gIGdldCBsaXN0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXNcbiAgfVxuXG4gIGFkZCAobXNnKSB7XG4gICAgbGV0IGxlbmd0aCA9IHRoaXMuX21lc3NhZ2VzLnVuc2hpZnQobXNnKVxuICAgIGlmIChsZW5ndGggPiBNQVhfTUVTU0FHRV9DT1VOVCkge1xuICAgICAgdGhpcy5fbWVzc2FnZXMucG9wKClcbiAgICB9XG4gICAgdGhpcy5lbWl0KCdtb2RpZmllZCcpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1lc3NhZ2VzKClcbiIsIi8qIGdsb2JhbCBQSVhJICovXG5cbmV4cG9ydCBjb25zdCBBcHBsaWNhdGlvbiA9IFBJWEkuQXBwbGljYXRpb25cbmV4cG9ydCBjb25zdCBDb250YWluZXIgPSBQSVhJLkNvbnRhaW5lclxuZXhwb3J0IGNvbnN0IGxvYWRlciA9IFBJWEkubG9hZGVyXG5leHBvcnQgY29uc3QgcmVzb3VyY2VzID0gUElYSS5sb2FkZXIucmVzb3VyY2VzXG5leHBvcnQgY29uc3QgU3ByaXRlID0gUElYSS5TcHJpdGVcbmV4cG9ydCBjb25zdCBUZXh0ID0gUElYSS5UZXh0XG5leHBvcnQgY29uc3QgVGV4dFN0eWxlID0gUElYSS5UZXh0U3R5bGVcblxuZXhwb3J0IGNvbnN0IEdyYXBoaWNzID0gUElYSS5HcmFwaGljc1xuZXhwb3J0IGNvbnN0IEJMRU5EX01PREVTID0gUElYSS5CTEVORF9NT0RFU1xuZXhwb3J0IGNvbnN0IGRpc3BsYXkgPSBQSVhJLmRpc3BsYXlcbmV4cG9ydCBjb25zdCB1dGlscyA9IFBJWEkudXRpbHNcbmV4cG9ydCBjb25zdCBPYnNlcnZhYmxlUG9pbnQgPSBQSVhJLk9ic2VydmFibGVQb2ludFxuIiwiaW1wb3J0IHsgZGlzcGxheSB9IGZyb20gJy4vUElYSSdcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBkaXNwbGF5LkxheWVyIHtcbiAgY3JlYXRlICgpIHt9XG5cbiAgZGVzdHJveSAoKSB7fVxuXG4gIHRpY2sgKGRlbHRhKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTY2VuZVxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5cbmNvbnN0IFRleHR1cmUgPSB7XG4gIGdldCBUZXJyYWluQXRsYXMgKCkge1xuICAgIHJldHVybiByZXNvdXJjZXNbJ2ltYWdlcy90ZXJyYWluX2F0bGFzLmpzb24nXVxuICB9LFxuICBnZXQgQmFzZU91dEF0bGFzICgpIHtcbiAgICByZXR1cm4gcmVzb3VyY2VzWydpbWFnZXMvYmFzZV9vdXRfYXRsYXMuanNvbiddXG4gIH0sXG5cbiAgZ2V0IEFpciAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydlbXB0eS5wbmcnXVxuICB9LFxuICBnZXQgR3Jhc3MgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1snZ3Jhc3MucG5nJ11cbiAgfSxcbiAgZ2V0IEdyb3VuZCAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydicmljay10aWxlLnBuZyddXG4gIH0sXG5cbiAgZ2V0IFdhbGwgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1snd2FsbC5wbmcnXVxuICB9LFxuICBnZXQgSXJvbkZlbmNlICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ2lyb24tZmVuY2UucG5nJ11cbiAgfSxcbiAgZ2V0IFJvb3QgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1sncm9vdC5wbmcnXVxuICB9LFxuICBnZXQgVHJlZSAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWyd0cmVlLnBuZyddXG4gIH0sXG5cbiAgZ2V0IFRyZWFzdXJlICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ3RyZWFzdXJlLnBuZyddXG4gIH0sXG4gIGdldCBEb29yICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ2lyb24tZmVuY2UucG5nJ11cbiAgfSxcbiAgZ2V0IFRvcmNoICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ3RvcmNoLnBuZyddXG4gIH0sXG4gIGdldCBHcmFzc0RlY29yYXRlMSAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydncmFzcy1kZWNvcmF0ZS0xLnBuZyddXG4gIH0sXG4gIGdldCBCdWxsZXQgKCkge1xuICAgIHJldHVybiByZXNvdXJjZXNbJ2ltYWdlcy9maXJlX2JvbHQucG5nJ10udGV4dHVyZVxuICB9LFxuXG4gIGdldCBSb2NrICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ3JvY2sucG5nJ11cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlXG4iLCJjb25zdCBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSVxuXG5jbGFzcyBWZWN0b3Ige1xuICBjb25zdHJ1Y3RvciAoeCwgeSkge1xuICAgIHRoaXMueCA9IHhcbiAgICB0aGlzLnkgPSB5XG4gIH1cblxuICBzdGF0aWMgZnJvbVBvaW50IChwKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IocC54LCBwLnkpXG4gIH1cblxuICBzdGF0aWMgZnJvbVJhZExlbmd0aCAocmFkLCBsZW5ndGgpIHtcbiAgICBsZXQgeCA9IGxlbmd0aCAqIE1hdGguY29zKHJhZClcbiAgICBsZXQgeSA9IGxlbmd0aCAqIE1hdGguc2luKHJhZClcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih4LCB5KVxuICB9XG5cbiAgY2xvbmUgKCkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCwgdGhpcy55KVxuICB9XG5cbiAgYWRkICh2KSB7XG4gICAgdGhpcy54ICs9IHYueFxuICAgIHRoaXMueSArPSB2LnlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3ViICh2KSB7XG4gICAgdGhpcy54IC09IHYueFxuICAgIHRoaXMueSAtPSB2LnlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgaW52ZXJ0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhcigtMSlcbiAgfVxuXG4gIG11bHRpcGx5U2NhbGFyIChzKSB7XG4gICAgdGhpcy54ICo9IHNcbiAgICB0aGlzLnkgKj0gc1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkaXZpZGVTY2FsYXIgKHMpIHtcbiAgICBpZiAocyA9PT0gMCkge1xuICAgICAgdGhpcy54ID0gMFxuICAgICAgdGhpcy55ID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhcigxIC8gcylcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRvdCAodikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnlcbiAgfVxuXG4gIGdldCBsZW5ndGggKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KVxuICB9XG5cbiAgbGVuZ3RoU3EgKCkge1xuICAgIHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnlcbiAgfVxuXG4gIG5vcm1hbGl6ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2aWRlU2NhbGFyKHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgZGlzdGFuY2VUbyAodikge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0YW5jZVRvU3EodikpXG4gIH1cblxuICBkaXN0YW5jZVRvU3EgKHYpIHtcbiAgICBsZXQgZHggPSB0aGlzLnggLSB2LnhcbiAgICBsZXQgZHkgPSB0aGlzLnkgLSB2LnlcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHlcbiAgfVxuXG4gIHNldCAoeCwgeSkge1xuICAgIHRoaXMueCA9IHhcbiAgICB0aGlzLnkgPSB5XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFggKHgpIHtcbiAgICB0aGlzLnggPSB4XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFkgKHkpIHtcbiAgICB0aGlzLnkgPSB5XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldExlbmd0aCAobCkge1xuICAgIHZhciBvbGRMZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIGlmIChvbGRMZW5ndGggIT09IDAgJiYgbCAhPT0gb2xkTGVuZ3RoKSB7XG4gICAgICB0aGlzLm11bHRpcGx5U2NhbGFyKGwgLyBvbGRMZW5ndGgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBsZXJwICh2LCBhbHBoYSkge1xuICAgIHRoaXMueCArPSAodi54IC0gdGhpcy54KSAqIGFscGhhXG4gICAgdGhpcy55ICs9ICh2LnkgLSB0aGlzLnkpICogYWxwaGFcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0IHJhZCAoKSB7XG4gICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpXG4gIH1cblxuICBnZXQgZGVnICgpIHtcbiAgICByZXR1cm4gdGhpcy5yYWQgKiBkZWdyZWVzXG4gIH1cblxuICBlcXVhbHMgKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSB2LnggJiYgdGhpcy55ID09PSB2LnlcbiAgfVxuXG4gIHJvdGF0ZSAodGhldGEpIHtcbiAgICB2YXIgeHRlbXAgPSB0aGlzLnhcbiAgICB0aGlzLnggPSB0aGlzLnggKiBNYXRoLmNvcyh0aGV0YSkgLSB0aGlzLnkgKiBNYXRoLnNpbih0aGV0YSlcbiAgICB0aGlzLnkgPSB4dGVtcCAqIE1hdGguc2luKHRoZXRhKSArIHRoaXMueSAqIE1hdGguY29zKHRoZXRhKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmVjdG9yXG4iLCJjbGFzcyBHbG9iYWxFdmVudE1hbmFnZXIge1xuICBzZXRJbnRlcmFjdGlvbiAoaW50ZXJhY3Rpb24pIHtcbiAgICB0aGlzLmludGVyYWN0aW9uID0gaW50ZXJhY3Rpb25cbiAgfVxuXG4gIG9uIChldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmludGVyYWN0aW9uLm9uKGV2ZW50TmFtZSwgaGFuZGxlcilcbiAgfVxuXG4gIG9mZiAoZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5pbnRlcmFjdGlvbi5vZmYoZXZlbnROYW1lLCBoYW5kbGVyKVxuICB9XG5cbiAgZW1pdCAoZXZlbnROYW1lLCAuLi5hcmdzKSB7XG4gICAgdGhpcy5pbnRlcmFjdGlvbi5lbWl0KGV2ZW50TmFtZSwgLi4uYXJncylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgR2xvYmFsRXZlbnRNYW5hZ2VyKClcbiIsImltcG9ydCBXYWxsIGZyb20gJy4uL29iamVjdHMvV2FsbCdcclxuaW1wb3J0IEFpciBmcm9tICcuLi9vYmplY3RzL0FpcidcclxuaW1wb3J0IEdyYXNzIGZyb20gJy4uL29iamVjdHMvR3Jhc3MnXHJcbmltcG9ydCBUcmVhc3VyZSBmcm9tICcuLi9vYmplY3RzL1RyZWFzdXJlJ1xyXG5pbXBvcnQgRG9vciBmcm9tICcuLi9vYmplY3RzL0Rvb3InXHJcbmltcG9ydCBUb3JjaCBmcm9tICcuLi9vYmplY3RzL1RvcmNoJ1xyXG5pbXBvcnQgR3JvdW5kIGZyb20gJy4uL29iamVjdHMvR3JvdW5kJ1xyXG5pbXBvcnQgSXJvbkZlbmNlIGZyb20gJy4uL29iamVjdHMvSXJvbkZlbmNlJ1xyXG5pbXBvcnQgUm9vdCBmcm9tICcuLi9vYmplY3RzL1Jvb3QnXHJcbmltcG9ydCBUcmVlIGZyb20gJy4uL29iamVjdHMvVHJlZSdcclxuaW1wb3J0IEdyYXNzRGVjb3JhdGUxIGZyb20gJy4uL29iamVjdHMvR3Jhc3NEZWNvcmF0ZTEnXHJcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vb2JqZWN0cy9CdWxsZXQnXHJcbmltcG9ydCBXYWxsU2hvb3RCb2x0IGZyb20gJy4uL29iamVjdHMvV2FsbFNob290Qm9sdCdcclxuXHJcbmltcG9ydCBNb3ZlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL01vdmUnXHJcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhJ1xyXG5pbXBvcnQgT3BlcmF0ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9PcGVyYXRlJ1xyXG5cclxuLy8gMHgwMDAwIH4gMHgwMDBmXHJcbmNvbnN0IEl0ZW1zU3RhdGljID0gW1xyXG4gIEFpciwgR3Jhc3MsIEdyb3VuZFxyXG5dXHJcbi8vIDB4MDAxMCB+IDB4MDBmZlxyXG5jb25zdCBJdGVtc1N0YXkgPSBbXHJcbiAgLy8gMHgwMDEwLCAweDAwMTEsIDB4MDAxMlxyXG4gIFdhbGwsIElyb25GZW5jZSwgUm9vdCwgVHJlZVxyXG5dXHJcbi8vIDB4MDEwMCB+IDB4MDFmZlxyXG5jb25zdCBJdGVtc090aGVyID0gW1xyXG4gIFRyZWFzdXJlLCBEb29yLCBUb3JjaCwgR3Jhc3NEZWNvcmF0ZTEsIEJ1bGxldCwgV2FsbFNob290Qm9sdFxyXG5dXHJcbi8vIDB4MDIwMCB+IDB4MDJmZlxyXG5jb25zdCBBYmlsaXRpZXMgPSBbXHJcbiAgTW92ZSwgQ2FtZXJhLCBPcGVyYXRlXHJcbl1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnN0YW5jZUJ5SXRlbUlkIChpdGVtSWQsIHBhcmFtcykge1xyXG4gIGxldCBUeXBlc1xyXG4gIGl0ZW1JZCA9IHBhcnNlSW50KGl0ZW1JZCwgMTYpXHJcbiAgaWYgKChpdGVtSWQgJiAweGZmZjApID09PSAwKSB7XHJcbiAgICAvLyDlnLDmnb9cclxuICAgIFR5cGVzID0gSXRlbXNTdGF0aWNcclxuICB9IGVsc2UgaWYgKChpdGVtSWQgJiAweGZmMDApID09PSAwKSB7XHJcbiAgICBUeXBlcyA9IEl0ZW1zU3RheVxyXG4gICAgaXRlbUlkIC09IDB4MDAxMFxyXG4gIH0gZWxzZSBpZiAoKGl0ZW1JZCAmIDB4ZmYwMCkgPj4+IDggPT09IDEpIHtcclxuICAgIFR5cGVzID0gSXRlbXNPdGhlclxyXG4gICAgaXRlbUlkIC09IDB4MDEwMFxyXG4gIH0gZWxzZSB7XHJcbiAgICBUeXBlcyA9IEFiaWxpdGllc1xyXG4gICAgaXRlbUlkIC09IDB4MDIwMFxyXG4gIH1cclxuICByZXR1cm4gbmV3IFR5cGVzW2l0ZW1JZF0ocGFyYW1zKVxyXG59XHJcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBBaXIgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuQWlyKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQWlyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcbmltcG9ydCB7IFJFUExZLCBBQklMSVRZX01PVkUsIEFCSUxJVFlfREFNQUdFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuaW1wb3J0IExlYXJuIGZyb20gJy4vYWJpbGl0aWVzL0xlYXJuJ1xuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcbmltcG9ydCBIZWFsdGggZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvSGVhbHRoJ1xuaW1wb3J0IERhbWFnZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9EYW1hZ2UnXG5cbmNvbnN0IEhlYWx0aFBvaW50ID0gMVxuXG5jbGFzcyBCdWxsZXQgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFRleHR1cmUuQnVsbGV0KVxuXG4gICAgbmV3IExlYXJuKCkuY2FycnlCeSh0aGlzKVxuICAgICAgLmxlYXJuKG5ldyBNb3ZlKFsyLCAwXSkpXG4gICAgICAubGVhcm4obmV3IEhlYWx0aChIZWFsdGhQb2ludCkpXG4gICAgICAubGVhcm4obmV3IERhbWFnZShbMSwgMC4wMV0pKVxuXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxuICAgIHRoaXMub24oJ2RpZScsIHRoaXMub25EaWUuYmluZCh0aGlzKSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFJFUExZIH1cblxuICBib2R5T3B0ICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNTZW5zb3I6IHRydWVcbiAgICB9XG4gIH1cblxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xuICAgIGlmICh0aGlzLm93bmVyID09PSBvcGVyYXRvciB8fFxuICAgICAgdGhpcy5vd25lciA9PT0gb3BlcmF0b3Iub3duZXIpIHtcbiAgICAgIC8vIOmBv+WFjeiHquauulxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBkYW1hZ2VBYmlsaXR5ID0gdGhpc1tBQklMSVRZX0RBTUFHRV1cbiAgICBkYW1hZ2VBYmlsaXR5LmVmZmVjdChvcGVyYXRvcilcbiAgICAvLyDoh6rmiJHmr4Dmu4VcbiAgICB0aGlzLm9uRGllKClcbiAgfVxuXG4gIG9uRGllICgpIHtcbiAgICB0aGlzLnBhcmVudC53aWxsUmVtb3ZlQ2hpbGQodGhpcylcbiAgfVxuXG4gIHNldE93bmVyIChvd25lcikge1xuICAgIHRoaXMub3duZXIgPSBvd25lclxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnQnVsbGV0J1xuICB9XG5cbiAgc2F5ICgpIHtcbiAgICAvLyBzYXkgbm90aGluZ1xuICB9XG5cbiAgc2V0RGlyZWN0aW9uICh2ZWN0b3IpIHtcbiAgICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzW0FCSUxJVFlfTU9WRV1cbiAgICBpZiAobW92ZUFiaWxpdHkpIHtcbiAgICAgIG1vdmVBYmlsaXR5LnNldERpcmVjdGlvbih2ZWN0b3IpXG4gICAgICB0aGlzLnJvdGF0ZSh2ZWN0b3IucmFkKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCdWxsZXRcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuaW1wb3J0IHsgUkVQTFkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5pbXBvcnQgTGVhcm4gZnJvbSAnLi9hYmlsaXRpZXMvTGVhcm4nXG5pbXBvcnQgTW92ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9Nb3ZlJ1xuaW1wb3J0IEtleU1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvS2V5TW92ZSdcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhJ1xuaW1wb3J0IENhcnJ5IGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0NhcnJ5J1xuaW1wb3J0IFBsYWNlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL1BsYWNlJ1xuaW1wb3J0IEtleVBsYWNlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0tleVBsYWNlJ1xuaW1wb3J0IEZpcmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvRmlyZSdcbmltcG9ydCBLZXlGaXJlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0tleUZpcmUnXG5pbXBvcnQgUm90YXRlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL1JvdGF0ZSdcbmltcG9ydCBIZWFsdGggZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvSGVhbHRoJ1xuaW1wb3J0IEJ1bGxldCBmcm9tICcuLi9vYmplY3RzL0J1bGxldCdcblxuY2xhc3MgQ2F0IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLlJvY2spXG5cbiAgICBsZXQgY2FycnkgPSBuZXcgQ2FycnkoMylcbiAgICBuZXcgTGVhcm4oKS5jYXJyeUJ5KHRoaXMpXG4gICAgICAubGVhcm4obmV3IE1vdmUoWzFdKSlcbiAgICAgIC5sZWFybihuZXcgS2V5TW92ZSgpKVxuICAgICAgLmxlYXJuKG5ldyBQbGFjZSgpKVxuICAgICAgLmxlYXJuKG5ldyBLZXlQbGFjZSgpKVxuICAgICAgLmxlYXJuKG5ldyBDYW1lcmEoNSkpXG4gICAgICAubGVhcm4oY2FycnkpXG4gICAgICAubGVhcm4obmV3IEZpcmUoWzJdKSlcbiAgICAgIC5sZWFybihuZXcgUm90YXRlKCkpXG4gICAgICAubGVhcm4obmV3IEtleUZpcmUoKSlcbiAgICAgIC5sZWFybihuZXcgSGVhbHRoKDEwKSlcblxuICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KClcbiAgICBjYXJyeS50YWtlKGJ1bGxldCwgSW5maW5pdHkpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XG5cbiAgYm9keU9wdCAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd5b3UnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2F0XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgU1RBWSwgQUJJTElUWV9PUEVSQVRFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIERvb3IgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAobWFwKSB7XHJcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcclxuICAgIHN1cGVyKFRleHR1cmUuRG9vcilcclxuXHJcbiAgICB0aGlzLm1hcCA9IG1hcFswXVxyXG4gICAgdGhpcy50b1Bvc2l0aW9uID0gbWFwWzFdXHJcblxyXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XHJcblxyXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XHJcbiAgICBsZXQgYWJpbGl0eSA9IG9wZXJhdG9yW0FCSUxJVFlfT1BFUkFURV1cclxuICAgIGlmIChhYmlsaXR5KSB7XHJcbiAgICAgIGFiaWxpdHkodGhpcylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG9wZXJhdG9yLmVtaXQoJ2NvbGxpZGUnLCB0aGlzKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgW0FCSUxJVFlfT1BFUkFURV0gKCkge1xyXG4gICAgdGhpcy5zYXkoWydHZXQgaW4gJywgdGhpcy5tYXAsICcgbm93LiddLmpvaW4oJycpKVxyXG4gICAgdGhpcy5lbWl0KCd1c2UnKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdEb29yJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG9vclxyXG4iLCJpbXBvcnQgeyBTcHJpdGUsIE9ic2VydmFibGVQb2ludCB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IHsgQm9kaWVzLCBCb2R5IH0gZnJvbSAnLi4vbGliL01hdHRlcidcbmltcG9ydCB7IFNUQVksIFNUQVRJQywgQUJJTElUWV9NT1ZFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBtZXNzYWdlcyBmcm9tICcuLi9saWIvTWVzc2FnZXMnXG5cbmZ1bmN0aW9uIG9uU2NhbGUgKCkge1xuICB0aGlzLnNjYWxlLmNvcHkodGhpcy5zY2FsZUV4KVxuICBpZiAodGhpcy5ib2R5KSB7XG4gICAgQm9keS5zY2FsZSh0aGlzLmJvZHksIHRoaXMuc2NhbGVFeC54LCB0aGlzLnNjYWxlRXgueSlcbiAgfVxufVxuXG5mdW5jdGlvbiBvblBvc2l0aW9uICgpIHtcbiAgbGV0IHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkV4XG4gIHRoaXMucG9zaXRpb24uY29weShwb3NpdGlvbilcbiAgaWYgKHRoaXMuYm9keSkge1xuICAgIHRoaXMuYm9keS5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJvZHlPcHQgKCkge1xuICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzW0FCSUxJVFlfTU9WRV1cbiAgbGV0IGZyaWN0aW9uID0gKG1vdmVBYmlsaXR5ICYmIG1vdmVBYmlsaXR5LmZyaWN0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgPyBtb3ZlQWJpbGl0eS5mcmljdGlvblxuICAgIDogMC4xXG4gIGxldCBmcmljdGlvbkFpciA9IChtb3ZlQWJpbGl0eSAmJiBtb3ZlQWJpbGl0eS5mcmljdGlvbkFpciAhPT0gdW5kZWZpbmVkKVxuICAgID8gbW92ZUFiaWxpdHkuZnJpY3Rpb25BaXJcbiAgICA6IDAuMDFcbiAgbGV0IG1hc3MgPSB0aGlzLm1hc3MgPyB0aGlzLm1hc3MgOiAxXG4gIHJldHVybiB7XG4gICAgaXNTdGF0aWM6IHRoaXMudHlwZSA9PT0gU1RBWSxcbiAgICBmcmljdGlvbixcbiAgICBmcmljdGlvbkFpcixcbiAgICBmcmljdGlvblN0YXRpYzogZnJpY3Rpb24sXG4gICAgbWFzc1xuICB9XG59XG5cbmNsYXNzIEdhbWVPYmplY3QgZXh0ZW5kcyBTcHJpdGUge1xuICBjb25zdHJ1Y3RvciAoLi4uYXJncykge1xuICAgIHN1cGVyKC4uLmFyZ3MpXG4gICAgdGhpcy5zY2FsZUV4ID0gdGhpcy5zY2FsZSAvLyBuZXcgT2JzZXJ2YWJsZVBvaW50KG9uU2NhbGUsIHRoaXMpXG4gICAgdGhpcy5wb3NpdGlvbkV4ID0gdGhpcy5wb3NpdGlvbiAvLyBuZXcgT2JzZXJ2YWJsZVBvaW50KG9uUG9zaXRpb24sIHRoaXMpXG4gIH1cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cblxuICBib2R5T3B0ICgpIHtcbiAgICByZXR1cm4ge31cbiAgfVxuXG4gIGFkZEJvZHkgKCkge1xuICAgIGlmICh0aGlzLmJvZHkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgb3B0ID0gT2JqZWN0LmFzc2lnbihib2R5T3B0LmNhbGwodGhpcyksIHRoaXMuYm9keU9wdCgpKVxuICAgIGxldCBib2R5ID0gQm9kaWVzLnJlY3RhbmdsZSh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIG9wdClcbiAgICAvLyBzeW5jIHBoeXNpYyBib2R5ICYgZGlzcGxheSBwb3NpdGlvblxuICAgIGJvZHkucG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uRXhcbiAgICB0aGlzLmJvZHkgPSBib2R5XG4gIH1cblxuICByb3RhdGUgKHJhZCwgZGVsdGEgPSBmYWxzZSkge1xuICAgIHRoaXMucm90YXRpb24gPSBkZWx0YSA/IHRoaXMucm90YXRpb24gKyByYWQgOiByYWRcbiAgICBpZiAodGhpcy5ib2R5KSB7XG4gICAgICBCb2R5LnNldEFuZ2xlKHRoaXMuYm9keSwgcmFkKVxuICAgIH1cbiAgfVxuXG4gIHNheSAobXNnKSB7XG4gICAgbWVzc2FnZXMuYWRkKG1zZylcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYW1lT2JqZWN0XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR3Jhc3MgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuR3Jhc3MpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFzc1xuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdyYXNzRGVjb3JhdGUxIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLkdyYXNzRGVjb3JhdGUxKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdHcmFzc0RlY29yYXRlMSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFzc0RlY29yYXRlMVxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdyb3VuZCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5Hcm91bmQpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0dyb3VuZCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcm91bmRcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgSXJvbkZlbmNlIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICBzdXBlcihUZXh0dXJlLklyb25GZW5jZSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJcm9uRmVuY2VcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgUm9vdCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5Sb290KVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvb3RcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xyXG5pbXBvcnQgTGlnaHQgZnJvbSAnLi4vbGliL0xpZ2h0J1xyXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXHJcblxyXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuY2xhc3MgVG9yY2ggZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcihUZXh0dXJlLlRvcmNoKVxyXG5cclxuICAgIGxldCByYWRpdXMgPSAyXHJcblxyXG4gICAgdGhpcy5vbignYWRkZWQnLCBMaWdodC5saWdodE9uLmJpbmQobnVsbCwgdGhpcywgcmFkaXVzLCAwLjk1KSlcclxuICAgIHRoaXMub24oJ3JlbW92ZWVkJywgTGlnaHQubGlnaHRPZmYuYmluZChudWxsLCB0aGlzKSlcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAndG9yY2gnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUb3JjaFxyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgUkVQTFksIEFCSUxJVFlfQ0FSUlkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBpbnN0YW5jZUJ5SXRlbUlkIH0gZnJvbSAnLi4vbGliL3V0aWxzJ1xyXG5cclxuY2xhc3MgU2xvdCB7XHJcbiAgY29uc3RydWN0b3IgKFtpdGVtSWQsIHBhcmFtcywgY291bnRdKSB7XHJcbiAgICB0aGlzLml0ZW0gPSBpbnN0YW5jZUJ5SXRlbUlkKGl0ZW1JZCwgcGFyYW1zKVxyXG4gICAgdGhpcy5jb3VudCA9IGNvdW50XHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gW3RoaXMuaXRlbS50b1N0cmluZygpLCAnKCcsIHRoaXMuY291bnQsICcpJ10uam9pbignJylcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFRyZWFzdXJlIGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKGludmVudG9yaWVzID0gW10pIHtcclxuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxyXG4gICAgc3VwZXIoVGV4dHVyZS5UcmVhc3VyZSlcclxuXHJcbiAgICB0aGlzLmludmVudG9yaWVzID0gaW52ZW50b3JpZXMubWFwKHRyZWFzdXJlID0+IG5ldyBTbG90KHRyZWFzdXJlKSlcclxuXHJcbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XHJcblxyXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XHJcbiAgICBsZXQgY2FycnlBYmlsaXR5ID0gb3BlcmF0b3JbQUJJTElUWV9DQVJSWV1cclxuICAgIGlmICghY2FycnlBYmlsaXR5KSB7XHJcbiAgICAgIG9wZXJhdG9yLnNheSgnSSBjYW5cXCd0IGNhcnJ5IGl0ZW1zIG5vdCB5ZXQuJylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbnZlbnRvcmllcy5mb3JFYWNoKFxyXG4gICAgICB0cmVhc3VyZSA9PiBjYXJyeUFiaWxpdHkudGFrZSh0cmVhc3VyZS5pdGVtLCB0cmVhc3VyZS5jb3VudCkpXHJcbiAgICBvcGVyYXRvci5zYXkoWydJIHRha2VkICcsIHRoaXMudG9TdHJpbmcoKV0uam9pbignJykpXHJcblxyXG4gICAgdGhpcy5wYXJlbnQud2lsbFJlbW92ZUNoaWxkKHRoaXMpXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAndHJlYXN1cmU6IFsnLFxyXG4gICAgICB0aGlzLmludmVudG9yaWVzLmpvaW4oJywgJyksXHJcbiAgICAgICddJ1xyXG4gICAgXS5qb2luKCcnKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJlYXN1cmVcclxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBUcmVlIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLlRyZWUpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJlZVxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBXYWxsIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLldhbGwpXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cblxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xuICAgIG9wZXJhdG9yLmVtaXQoJ2NvbGxpZGUnLCB0aGlzKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnV2FsbCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXYWxsXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSwgQUJJTElUWV9GSVJFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuaW1wb3J0IExlYXJuIGZyb20gJy4vYWJpbGl0aWVzL0xlYXJuJ1xuaW1wb3J0IENhcnJ5IGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0NhcnJ5J1xuaW1wb3J0IEZpcmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvRmlyZSdcbmltcG9ydCBIZWFsdGggZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvSGVhbHRoJ1xuaW1wb3J0IEJ1bGxldCBmcm9tICcuLi9vYmplY3RzL0J1bGxldCdcblxuY2xhc3MgV2FsbFNob290Qm9sdCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5XYWxsKVxuXG4gICAgbGV0IGNhcnJ5ID0gbmV3IENhcnJ5KDMpXG4gICAgbmV3IExlYXJuKCkuY2FycnlCeSh0aGlzKVxuICAgICAgLmxlYXJuKG5ldyBGaXJlKFszXSkpXG4gICAgICAubGVhcm4oY2FycnkpXG4gICAgICAubGVhcm4obmV3IEhlYWx0aCgxMCkpXG5cbiAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldCgpXG4gICAgY2FycnkudGFrZShidWxsZXQsIEluZmluaXR5KVxuXG4gICAgdGhpcy5saWZlID0gMFxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcbiAgICB0aGlzLm9uKCdkaWUnLCB0aGlzLm9uRGllLmJpbmQodGhpcykpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cblxuICBib2R5T3B0ICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNTdGF0aWM6IHRydWVcbiAgICB9XG4gIH1cblxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xuICAgIG9wZXJhdG9yLmVtaXQoJ2NvbGxpZGUnLCB0aGlzKVxuICB9XG5cbiAgb25EaWUgKCkge1xuICAgIHRoaXMucGFyZW50LndpbGxSZW1vdmVDaGlsZCh0aGlzKVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICB0aGlzLmxpZmUrK1xuICAgIGlmICh0aGlzLmxpZmUgJSAzMCAhPT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMubGlmZSA9IDBcbiAgICB0aGlzLnJvdGF0ZShNYXRoLlBJIC8gMTAsIHRydWUpXG5cbiAgICBsZXQgcmFkID0gdGhpcy5yb3RhdGlvblxuICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZClcbiAgICB0aGlzW0FCSUxJVFlfRklSRV0uZmlyZShyYWQgKyBNYXRoLlBJIC8gMilcbiAgICB0aGlzW0FCSUxJVFlfRklSRV0uZmlyZShyYWQgKyBNYXRoLlBJKVxuICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZCArIE1hdGguUEkgLyAyICogMylcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ1dhbGxTaG9vdEJvbHQnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2FsbFNob290Qm9sdFxuIiwiY29uc3QgdHlwZSA9IFN5bWJvbCgnYWJpbGl0eScpXG5cbmNsYXNzIEFiaWxpdHkge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiB0eXBlIH1cblxuICBnZXRTYW1lVHlwZUFiaWxpdHkgKG93bmVyKSB7XG4gICAgcmV0dXJuIG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdXG4gIH1cblxuICAvLyDmmK/lkKbpnIDnva7mj5tcbiAgaGFzVG9SZXBsYWNlIChvd25lciwgYWJpbGl0eU5ldykge1xuICAgIGxldCBhYmlsaXR5T2xkID0gdGhpcy5nZXRTYW1lVHlwZUFiaWxpdHkob3duZXIpXG4gICAgcmV0dXJuICFhYmlsaXR5T2xkIHx8IGFiaWxpdHlOZXcuaXNCZXR0ZXIoYWJpbGl0eU9sZClcbiAgfVxuXG4gIC8vIOaWsOiIiuavlOi8g1xuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgbGV0IGFiaWxpdHlPbGQgPSB0aGlzLmdldFNhbWVUeXBlQWJpbGl0eShvd25lcilcbiAgICBpZiAoYWJpbGl0eU9sZCkge1xuICAgICAgLy8gZmlyc3QgZ2V0IHRoaXMgdHlwZSBhYmlsaXR5XG4gICAgICBhYmlsaXR5T2xkLnJlcGxhY2VkQnkodGhpcywgb3duZXIpXG4gICAgfVxuICAgIG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdID0gdGhpc1xuICB9XG5cbiAgcmVwbGFjZWRCeSAob3RoZXIsIG93bmVyKSB7fVxuXG4gIGRyb3BCeSAob3duZXIpIHtcbiAgICBkZWxldGUgb3duZXIuYWJpbGl0aWVzW3RoaXMudHlwZV1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3BseiBleHRlbmQgdGhpcyBjbGFzcydcbiAgfVxuXG4gIHNlcmlhbGl6ZSAoKSB7XG4gICAgcmV0dXJuIHt9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQWJpbGl0eVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xyXG5pbXBvcnQgTGlnaHQgZnJvbSAnLi4vLi4vbGliL0xpZ2h0J1xyXG5pbXBvcnQgeyBBQklMSVRZX0NBTUVSQSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXHJcblxyXG5jbGFzcyBDYW1lcmEgZXh0ZW5kcyBBYmlsaXR5IHtcclxuICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMucmFkaXVzID0gdmFsdWVcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfQ0FNRVJBIH1cclxuXHJcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XHJcbiAgICAvLyDlj6rmnIPororlpKdcclxuICAgIHJldHVybiB0aGlzLnJhZGl1cyA+PSBvdGhlci5yYWRpdXNcclxuICB9XHJcblxyXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxyXG4gIGNhcnJ5QnkgKG93bmVyKSB7XHJcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxyXG4gICAgaWYgKG93bmVyLnBhcmVudCkge1xyXG4gICAgICB0aGlzLnNldHVwKG93bmVyLCBvd25lci5wYXJlbnQpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvd25lci5vbmNlKCdhZGRlZCcsIGNvbnRhaW5lciA9PiB0aGlzLnNldHVwKG93bmVyLCBjb250YWluZXIpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVwbGFjZWRCeSAob3RoZXIsIG93bmVyKSB7XHJcbiAgICB0aGlzLmRyb3BCeShvd25lcilcclxuICB9XHJcblxyXG4gIHNldHVwIChvd25lciwgY29udGFpbmVyKSB7XHJcbiAgICBMaWdodC5saWdodE9uKG93bmVyLCB0aGlzLnJhZGl1cylcclxuICAgIC8vIOWmguaenCBvd25lciDkuI3ooqvpoa/npLpcclxuICAgIG93bmVyLnJlbW92ZWQgPSB0aGlzLm9uUmVtb3ZlZC5iaW5kKHRoaXMsIG93bmVyKVxyXG4gICAgb3duZXIub25jZSgncmVtb3ZlZCcsIG93bmVyLnJlbW92ZWQpXHJcbiAgfVxyXG5cclxuICBvblJlbW92ZWQgKG93bmVyKSB7XHJcbiAgICB0aGlzLmRyb3BCeShvd25lcilcclxuICAgIC8vIG93bmVyIOmHjeaWsOiiq+mhr+ekulxyXG4gICAgb3duZXIub25jZSgnYWRkZWQnLCBjb250YWluZXIgPT4gdGhpcy5zZXR1cChvd25lciwgY29udGFpbmVyKSlcclxuICB9XHJcblxyXG4gIGRyb3BCeSAob3duZXIpIHtcclxuICAgIExpZ2h0LmxpZ2h0T2ZmKG93bmVyKVxyXG4gICAgLy8gcmVtb3ZlIGxpc3RlbmVyXHJcbiAgICBvd25lci5vZmYoJ3JlbW92ZWQnLCBvd25lci5yZW1vdmVkKVxyXG4gICAgZGVsZXRlIG93bmVyLnJlbW92ZWRcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnbGlnaHQgYXJlYTogJyArIHRoaXMucmFkaXVzXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYW1lcmFcclxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9DQVJSWSwgQUJJTElUWV9MRUFSTiB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmZ1bmN0aW9uIG5ld1Nsb3QgKGl0ZW0sIGNvdW50KSB7XG4gIHJldHVybiB7XG4gICAgaXRlbSxcbiAgICBjb3VudCxcbiAgICB0b1N0cmluZyAoKSB7XG4gICAgICByZXR1cm4gW2l0ZW0udG9TdHJpbmcoKSwgJygnLCB0aGlzLmNvdW50LCAnKSddLmpvaW4oJycpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIENhcnJ5IGV4dGVuZHMgQWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yIChpbml0U2xvdHMpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5iYWdzID0gW11cbiAgICB0aGlzLmJhZ3MucHVzaChBcnJheShpbml0U2xvdHMpLmZpbGwoKSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfQ0FSUlkgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX0NBUlJZXSA9IHRoaXNcbiAgfVxuXG4gIHRha2UgKGl0ZW0sIGNvdW50ID0gMSkge1xuICAgIGxldCBvd25lciA9IHRoaXMub3duZXJcbiAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIEFiaWxpdHkgJiYgb3duZXJbQUJJTElUWV9MRUFSTl0pIHtcbiAgICAgIC8vIOWPluW+l+iDveWKm1xuICAgICAgb3duZXJbQUJJTElUWV9MRUFSTl0ubGVhcm4oaXRlbSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQga2V5ID0gaXRlbS50b1N0cmluZygpXG4gICAgbGV0IGZpcnN0RW1wdHlTbG90XG4gICAgbGV0IGZvdW5kID0gdGhpcy5iYWdzLnNvbWUoKGJhZywgYmkpID0+IHtcbiAgICAgIHJldHVybiBiYWcuc29tZSgoc2xvdCwgc2kpID0+IHtcbiAgICAgICAgLy8g5pqr5a2Y56ys5LiA5YCL56m65qC8XG4gICAgICAgIGlmICghc2xvdCAmJiAhZmlyc3RFbXB0eVNsb3QpIHtcbiAgICAgICAgICBmaXJzdEVtcHR5U2xvdCA9IHtzaSwgYml9XG4gICAgICAgIH1cbiAgICAgICAgLy8g54mp5ZOB55aK5YqgKOWQjOmhnuWeiylcbiAgICAgICAgaWYgKHNsb3QgJiYgc2xvdC5pdGVtLnRvU3RyaW5nKCkgPT09IGtleSkge1xuICAgICAgICAgIHNsb3QuY291bnQgKz0gY291bnRcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSlcbiAgICB9KVxuICAgIGlmICghZm91bmQpIHtcbiAgICAgIGlmICghZmlyc3RFbXB0eVNsb3QpIHtcbiAgICAgICAgLy8g5rKS5pyJ56m65qC85Y+v5pS+54mp5ZOBXG4gICAgICAgIG93bmVyLnNheSgnbm8gZW1wdHkgc2xvdCBmb3IgbmV3IGl0ZW0gZ290LicpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8g5pS+5YWl56ys5LiA5YCL56m65qC8XG4gICAgICB0aGlzLmJhZ3NbZmlyc3RFbXB0eVNsb3QuYmldW2ZpcnN0RW1wdHlTbG90LnNpXSA9IG5ld1Nsb3QoaXRlbSwgY291bnQpXG4gICAgfVxuICAgIG93bmVyLmVtaXQoJ2ludmVudG9yeS1tb2RpZmllZCcsIGl0ZW0pXG4gIH1cblxuICBnZXRTbG90SXRlbSAoc2xvdElueCkge1xuICAgIGxldCBiaVxuICAgIGxldCBzaVxuICAgIC8vIOeFp+iRl+WMheWMheWKoOWFpemghuW6j+afpeaJvlxuICAgIGxldCBmb3VuZCA9IHRoaXMuYmFncy5maW5kKChiYWcsIGIpID0+IHtcbiAgICAgIGJpID0gYlxuICAgICAgcmV0dXJuIGJhZy5maW5kKChzbG90LCBzKSA9PiB7XG4gICAgICAgIHNpID0gc1xuICAgICAgICByZXR1cm4gc2xvdElueC0tID09PSAwXG4gICAgICB9KVxuICAgIH0pXG4gICAgbGV0IGl0ZW1cbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIGZvdW5kID0gdGhpcy5iYWdzW2JpXVtzaV1cbiAgICAgIGl0ZW0gPSBmb3VuZC5pdGVtXG4gICAgICAvLyDlj5blh7rlvozmuJvkuIBcbiAgICAgIGlmICgtLWZvdW5kLmNvdW50ID09PSAwKSB7XG4gICAgICAgIHRoaXMuYmFnc1tiaV1bc2ldID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICB0aGlzLm93bmVyLmVtaXQoJ2ludmVudG9yeS1tb2RpZmllZCcsIGl0ZW0pXG4gICAgfVxuICAgIHJldHVybiBpdGVtXG4gIH1cblxuICBnZXRJdGVtQnlUeXBlICh0eXBlKSB7XG4gICAgbGV0IGJpXG4gICAgbGV0IHNpXG4gICAgbGV0IGZvdW5kID0gdGhpcy5iYWdzLmZpbmQoKGJhZywgYikgPT4ge1xuICAgICAgYmkgPSBiXG4gICAgICByZXR1cm4gYmFnLmZpbmQoKHNsb3QsIHMpID0+IHtcbiAgICAgICAgc2kgPSBzXG4gICAgICAgIHJldHVybiBzbG90ICYmIHNsb3QuaXRlbSBpbnN0YW5jZW9mIHR5cGVcbiAgICAgIH0pXG4gICAgfSlcbiAgICBsZXQgaXRlbVxuICAgIGlmIChmb3VuZCkge1xuICAgICAgZm91bmQgPSB0aGlzLmJhZ3NbYmldW3NpXVxuICAgICAgaXRlbSA9IGZvdW5kLml0ZW1cbiAgICAgIC8vIOWPluWHuuW+jOa4m+S4gFxuICAgICAgaWYgKC0tZm91bmQuY291bnQgPT09IDApIHtcbiAgICAgICAgdGhpcy5iYWdzW2JpXVtzaV0gPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIHRoaXMub3duZXIuZW1pdCgnaW52ZW50b3J5LW1vZGlmaWVkJywgaXRlbSlcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gWydjYXJyeTogJywgdGhpcy5iYWdzLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cblxuICAvLyBUT0RPOiBzYXZlIGRhdGFcbiAgc2VyaWFsaXplICgpIHtcbiAgICByZXR1cm4gdGhpcy5iYWdzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2FycnlcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfREFNQUdFLCBBQklMSVRZX0hFQUxUSCB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIERhbWFnZSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAoW2RhbWFnZSA9IDEsIGZvcmNlID0gMC4wMV0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5kYW1hZ2UgPSBkYW1hZ2VcbiAgICB0aGlzLmZvcmNlID0gZm9yY2VcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfREFNQUdFIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9EQU1BR0VdID0gdGhpc1xuICB9XG5cbiAgZWZmZWN0IChvdGhlcikge1xuICAgIGxldCBoZWFsdGhBYmlsaXR5ID0gb3RoZXJbQUJJTElUWV9IRUFMVEhdXG4gICAgLy8g5YK35a6z5LuW5Lq6XG4gICAgaWYgKGhlYWx0aEFiaWxpdHkpIHtcbiAgICAgIGhlYWx0aEFiaWxpdHkuZ2V0SHVydCh0aGlzLm93bmVyKVxuICAgIH1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgJ0RhbWFnZTogJyxcbiAgICAgIHRoaXMuZGFtYWdlLFxuICAgICAgJywgJyxcbiAgICAgIHRoaXMuZm9yY2VcbiAgICBdLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGFtYWdlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0ZJUkUsIEFCSUxJVFlfQ0FSUlksIEFCSUxJVFlfUk9UQVRFLCBBQklMSVRZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IEJ1bGxldCBmcm9tICcuLi9CdWxsZXQnXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXG5cbmNvbnN0IFBJID0gTWF0aC5QSVxuXG5mdW5jdGlvbiBjYWxjQXBvdGhlbSAobywgcmFkKSB7XG4gIGxldCB3aWR0aCA9IG8ud2lkdGggLyAyXG4gIGxldCBoZWlnaHQgPSBvLmhlaWdodCAvIDJcbiAgbGV0IHJlY3RSYWQgPSBNYXRoLmF0YW4yKGhlaWdodCwgd2lkdGgpXG4gIGxldCBsZW5cbiAgLy8g5aaC5p6c5bCE5Ye66KeS56m/6YGOIHdpZHRoXG4gIGxldCByMSA9IE1hdGguYWJzKHJhZCAlIFBJKVxuICBsZXQgcjIgPSBNYXRoLmFicyhyZWN0UmFkICUgUEkpXG4gIGlmIChyMSA8IHIyIHx8IHIxID4gcjIgKyBQSSAvIDIpIHtcbiAgICBsZW4gPSB3aWR0aCAvIE1hdGguY29zKHJhZClcbiAgfSBlbHNlIHtcbiAgICBsZW4gPSBoZWlnaHQgLyBNYXRoLnNpbihyYWQpXG4gIH1cbiAgcmV0dXJuIE1hdGguYWJzKGxlbilcbn1cblxuY2xhc3MgRmlyZSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAoWyByZWFjdEZvcmNlIF0pIHtcbiAgICBzdXBlcigpXG4gICAgLy8gVE9ETzogaW1wbGVtZW50XG4gICAgdGhpcy5yZWFjdEZvcmNlID0gcmVhY3RGb3JjZVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9GSVJFIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9GSVJFXSA9IHRoaXNcbiAgfVxuXG4gIGZpcmUgKHJhZCA9IHVuZGVmaW5lZCkge1xuICAgIGxldCBvd25lciA9IHRoaXMub3duZXJcbiAgICBsZXQgc2NhbGUgPSBvd25lci5zY2FsZS54XG5cbiAgICBsZXQgY2FycnlBYmlsaXR5ID0gb3duZXJbQUJJTElUWV9DQVJSWV1cbiAgICBsZXQgQnVsbGV0VHlwZSA9IGNhcnJ5QWJpbGl0eS5nZXRJdGVtQnlUeXBlKEJ1bGxldClcbiAgICBpZiAoIUJ1bGxldFR5cGUpIHtcbiAgICAgIC8vIG5vIG1vcmUgYnVsbGV0IGluIGludmVudG9yeVxuICAgICAgY29uc29sZS5sb2coJ25vIG1vcmUgYnVsbGV0IGluIGludmVudG9yeScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXRUeXBlLmNvbnN0cnVjdG9yKClcblxuICAgIC8vIHNldCBkaXJlY3Rpb25cbiAgICBpZiAocmFkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIOWmguaenOaykuaMh+WumuaWueWQke+8jOWwseeUqOebruWJjemdouWwjeaWueWQkVxuICAgICAgbGV0IHJvdGF0ZUFiaWxpdHkgPSBvd25lcltBQklMSVRZX1JPVEFURV1cbiAgICAgIHJhZCA9IHJvdGF0ZUFiaWxpdHkgPyByb3RhdGVBYmlsaXR5LmZhY2VSYWQgOiAwXG4gICAgfVxuICAgIGxldCB2ZWN0b3IgPSBWZWN0b3IuZnJvbVJhZExlbmd0aChyYWQsIDEpXG4gICAgYnVsbGV0LnNjYWxlRXguc2V0KHNjYWxlKVxuICAgIGJ1bGxldC5zZXRPd25lcihvd25lcilcblxuICAgIC8vIHNldCBwb3NpdGlvblxuICAgIGxldCByZWN0TGVuID0gY2FsY0Fwb3RoZW0ob3duZXIsIHJhZCArIG93bmVyLnJvdGF0aW9uKVxuICAgIGxldCBidWxsZXRMZW4gPSBidWxsZXQuaGVpZ2h0IC8gMiAvLyDlsITlh7rop5LnrYnmlrzoh6rouqvml4vop5LvvIzmiYDku6XlhY3ljrvpgYvnrpdcbiAgICBsZXQgbGVuID0gcmVjdExlbiArIGJ1bGxldExlblxuICAgIGxldCBwb3NpdGlvbiA9IFZlY3Rvci5mcm9tUmFkTGVuZ3RoKHJhZCwgbGVuKVxuICAgICAgLmFkZChWZWN0b3IuZnJvbVBvaW50KG93bmVyLnBvc2l0aW9uRXgpKVxuICAgIGJ1bGxldC5wb3NpdGlvbkV4LnNldChwb3NpdGlvbi54LCBwb3NpdGlvbi55KVxuXG4gICAgYnVsbGV0Lm9uY2UoJ2FkZGVkJywgKCkgPT4ge1xuICAgICAgYnVsbGV0LnNldERpcmVjdGlvbih2ZWN0b3IpXG5cbiAgICAgIGxldCBtb3ZlQWJpbGl0eSA9IG93bmVyW0FCSUxJVFlfTU9WRV1cbiAgICAgIGlmIChtb3ZlQWJpbGl0eSkge1xuICAgICAgICBtb3ZlQWJpbGl0eS5wdW5jaChcbiAgICAgICAgICB2ZWN0b3IuY2xvbmUoKS5zZXRMZW5ndGgodGhpcy5yZWFjdEZvcmNlIC8gMzAwKS5pbnZlcnQoKSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgb3duZXIuZW1pdCgnZmlyZScsIGJ1bGxldClcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0ZpcmUnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlyZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9IRUFMVEgsIEFCSUxJVFlfREFNQUdFLCBBQklMSVRZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IFZlY3RvciBmcm9tICcuLi8uLi9saWIvVmVjdG9yJ1xuXG5jbGFzcyBIZWFsdGggZXh0ZW5kcyBBYmlsaXR5IHtcbiAgY29uc3RydWN0b3IgKGhwID0gMSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmhwID0gaHBcbiAgICB0aGlzLmhwTWF4ID0gaHBcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfSEVBTFRIIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9IRUFMVEhdID0gdGhpc1xuICB9XG5cbiAgZ2V0SHVydCAoZnJvbSkge1xuICAgIGxldCBkYW1hZ2VBYmlsaXR5ID0gZnJvbVtBQklMSVRZX0RBTUFHRV1cbiAgICBpZiAoIWRhbWFnZUFiaWxpdHkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgZm9yY2UgPSBkYW1hZ2VBYmlsaXR5LmZvcmNlXG4gICAgbGV0IGRhbWFnZSA9IGRhbWFnZUFiaWxpdHkuZGFtYWdlXG4gICAgbGV0IHByZUhwID0gdGhpcy5ocFxuICAgIGxldCBzdWZIcCA9IE1hdGgubWF4KHRoaXMuaHAgLSBkYW1hZ2UsIDApXG4gICAgbGV0IHZlY3RvciA9IFZlY3Rvci5mcm9tUG9pbnQodGhpcy5vd25lci5wb3NpdGlvbilcbiAgICAgIC5zdWIoZnJvbS5wb3NpdGlvbilcbiAgICAgIC5zZXRMZW5ndGgoZm9yY2UpXG5cbiAgICB0aGlzLm93bmVyLnNheShbXG4gICAgICB0aGlzLm93bmVyLnRvU3RyaW5nKCksXG4gICAgICAnIGdldCBodXJ0ICcsXG4gICAgICBkYW1hZ2UsXG4gICAgICAnOiAnLFxuICAgICAgcHJlSHAsXG4gICAgICAnIC0+ICcsXG4gICAgICBzdWZIcFxuICAgIF0uam9pbignJykpXG5cbiAgICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzLm93bmVyW0FCSUxJVFlfTU9WRV1cbiAgICBpZiAobW92ZUFiaWxpdHkpIHtcbiAgICAgIG1vdmVBYmlsaXR5LnB1bmNoKHZlY3RvcilcbiAgICB9XG5cbiAgICB0aGlzLmhwID0gc3VmSHBcblxuICAgIHRoaXMub3duZXIuZW1pdCgnaGVhbHRoLWNoYW5nZScpXG4gICAgaWYgKHRoaXMuaHAgPD0gMCkge1xuICAgICAgdGhpcy5vd25lci5lbWl0KCdkaWUnKVxuICAgIH1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgJ0hlYWx0aDogJyxcbiAgICAgIHRoaXMuaHAsXG4gICAgICAnIC8gJyxcbiAgICAgIHRoaXMuaHBNYXhcbiAgICBdLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSGVhbHRoXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0ZJUkUsIEFCSUxJVFlfS0VZX0ZJUkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi8uLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xuXG5jb25zdCBLRVlTID0gU3ltYm9sKCdrZXlzJylcblxuY2xhc3MgS2V5RmlyZSBleHRlbmRzIEFiaWxpdHkge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0tFWV9GSVJFIH1cblxuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgb3duZXJbQUJJTElUWV9LRVlfRklSRV0gPSB0aGlzXG4gICAgdGhpcy5zZXR1cChvd25lcilcbiAgfVxuXG4gIHNldHVwIChvd25lcikge1xuICAgIGxldCBmaXJlQWJpbGl0eSA9IG93bmVyW0FCSUxJVFlfRklSRV1cbiAgICBsZXQgbW91c2VIYW5kbGVyID0gZSA9PiB7XG4gICAgICBpZiAoZS5zdG9wcGVkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoJ2ZpcmUnKVxuICAgIH1cbiAgICBsZXQgZmlyZUhhbmRsZXIgPSBmaXJlQWJpbGl0eS5maXJlLmJpbmQoZmlyZUFiaWxpdHkpXG5cbiAgICBvd25lcltLRVlTXSA9IHtcbiAgICAgIG1vdXNlZG93bjogbW91c2VIYW5kbGVyLFxuICAgICAgZmlyZTogZmlyZUhhbmRsZXJcbiAgICB9XG4gICAgT2JqZWN0LmVudHJpZXMob3duZXJbS0VZU10pLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIub24oZXZlbnROYW1lLCBoYW5kbGVyKVxuICAgIH0pXG4gIH1cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgc3VwZXIuZHJvcEJ5KG93bmVyKVxuICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW0tFWVNdKS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLm9mZihldmVudE5hbWUsIGhhbmRsZXIpXG4gICAgfSlcbiAgICBkZWxldGUgb3duZXJbS0VZU11cbiAgICBkZWxldGUgb3duZXJbQUJJTElUWV9LRVlfRklSRV1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2tleSBmaXJlJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEtleUZpcmVcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCBrZXlib2FyZEpTIGZyb20gJ2tleWJvYXJkanMnXG5pbXBvcnQgeyBMRUZULCBVUCwgUklHSFQsIERPV04gfSBmcm9tICcuLi8uLi9jb25maWcvY29udHJvbCdcbmltcG9ydCB7IEFCSUxJVFlfTU9WRSwgQUJJTElUWV9LRVlfTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXG5cbmNvbnN0IEtFWVMgPSBTeW1ib2woJ2tleXMnKVxuXG5jbGFzcyBLZXlNb3ZlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfS0VZX01PVkUgfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICBvd25lcltBQklMSVRZX0tFWV9NT1ZFXSA9IHRoaXNcbiAgICB0aGlzLnNldHVwKG93bmVyKVxuICB9XG5cbiAgc2V0dXAgKG93bmVyKSB7XG4gICAgbGV0IGRpciA9IHt9XG4gICAgbGV0IGNhbGNEaXIgPSAoKSA9PiB7XG4gICAgICBsZXQgdmVjdG9yID0gbmV3IFZlY3RvcigtZGlyW0xFRlRdICsgZGlyW1JJR0hUXSwgLWRpcltVUF0gKyBkaXJbRE9XTl0pXG4gICAgICBpZiAodmVjdG9yLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHZlY3Rvci5tdWx0aXBseVNjYWxhcigwLjE3KVxuICAgICAgb3duZXJbQUJJTElUWV9NT1ZFXS5hZGREaXJlY3Rpb24odmVjdG9yKVxuICAgIH1cbiAgICBsZXQgYmluZCA9IGNvZGUgPT4ge1xuICAgICAgZGlyW2NvZGVdID0gMFxuICAgICAgbGV0IHByZUhhbmRsZXIgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50UmVwZWF0KClcbiAgICAgICAgZGlyW2NvZGVdID0gMVxuICAgICAgICBvd25lcltBQklMSVRZX01PVkVdLmNsZWFyUGF0aCgpXG4gICAgICB9XG4gICAgICBrZXlib2FyZEpTLmJpbmQoY29kZSwgcHJlSGFuZGxlciwgKCkgPT4ge1xuICAgICAgICBkaXJbY29kZV0gPSAwXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHByZUhhbmRsZXJcbiAgICB9XG5cbiAgICBrZXlib2FyZEpTLnNldENvbnRleHQoJycpXG4gICAga2V5Ym9hcmRKUy53aXRoQ29udGV4dCgnJywgKCkgPT4ge1xuICAgICAgb3duZXJbS0VZU10gPSB7XG4gICAgICAgIFtMRUZUXTogYmluZChMRUZUKSxcbiAgICAgICAgW1VQXTogYmluZChVUCksXG4gICAgICAgIFtSSUdIVF06IGJpbmQoUklHSFQpLFxuICAgICAgICBbRE9XTl06IGJpbmQoRE9XTilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKGNhbGNEaXIsIDE3KVxuICB9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIHN1cGVyLmRyb3BCeShvd25lcilcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBPYmplY3QuZW50cmllcyhvd25lcltLRVlTXSkuZm9yRWFjaCgoW2tleSwgaGFuZGxlcl0pID0+IHtcbiAgICAgICAga2V5Ym9hcmRKUy51bmJpbmQoa2V5LCBoYW5kbGVyKVxuICAgICAgfSlcbiAgICB9KVxuICAgIGRlbGV0ZSBvd25lcltLRVlTXVxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX0tFWV9NT1ZFXVxuXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAna2V5IGNvbnRyb2wnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS2V5TW92ZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcbmltcG9ydCB7IFBMQUNFMSwgUExBQ0UyLCBQTEFDRTMsIFBMQUNFNCB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb250cm9sJ1xuaW1wb3J0IHsgQUJJTElUWV9QTEFDRSwgQUJJTElUWV9LRVlfUExBQ0UgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jb25zdCBTTE9UUyA9IFtcbiAgUExBQ0UxLCBQTEFDRTIsIFBMQUNFMywgUExBQ0U0XG5dXG5cbmNsYXNzIEtleVBsYWNlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfS0VZX1BMQUNFIH1cblxuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5zZXR1cChvd25lcilcbiAgfVxuXG4gIHNldHVwIChvd25lcikge1xuICAgIGxldCBwbGFjZUFiaWxpdHkgPSBvd25lcltBQklMSVRZX1BMQUNFXVxuICAgIGxldCBiaW5kID0ga2V5ID0+IHtcbiAgICAgIGxldCBzbG90SW54ID0gU0xPVFMuaW5kZXhPZihrZXkpXG4gICAgICBsZXQgaGFuZGxlciA9IGUgPT4ge1xuICAgICAgICBlLnByZXZlbnRSZXBlYXQoKVxuICAgICAgICBwbGFjZUFiaWxpdHkucGxhY2Uoc2xvdElueClcbiAgICAgIH1cbiAgICAgIGtleWJvYXJkSlMuYmluZChrZXksIGhhbmRsZXIsICgpID0+IHt9KVxuICAgICAgcmV0dXJuIGhhbmRsZXJcbiAgICB9XG5cbiAgICBrZXlib2FyZEpTLnNldENvbnRleHQoJycpXG4gICAga2V5Ym9hcmRKUy53aXRoQ29udGV4dCgnJywgKCkgPT4ge1xuICAgICAgb3duZXJbQUJJTElUWV9LRVlfUExBQ0VdID0ge1xuICAgICAgICBQTEFDRTE6IGJpbmQoUExBQ0UxKSxcbiAgICAgICAgUExBQ0UyOiBiaW5kKFBMQUNFMiksXG4gICAgICAgIFBMQUNFMzogYmluZChQTEFDRTMpLFxuICAgICAgICBQTEFDRTQ6IGJpbmQoUExBQ0U0KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgc3VwZXIuZHJvcEJ5KG93bmVyKVxuICAgIGtleWJvYXJkSlMud2l0aENvbnRleHQoJycsICgpID0+IHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW0FCSUxJVFlfS0VZX1BMQUNFXSkuZm9yRWFjaCgoW2tleSwgaGFuZGxlcl0pID0+IHtcbiAgICAgICAga2V5Ym9hcmRKUy51bmJpbmQoa2V5LCBoYW5kbGVyKVxuICAgICAgfSlcbiAgICB9KVxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX0tFWV9QTEFDRV1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2tleSBwbGFjZSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLZXlQbGFjZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9MRUFSTiB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIExlYXJuIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfTEVBUk4gfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBpZiAoIW93bmVyLmFiaWxpdGllcykge1xuICAgICAgb3duZXIuYWJpbGl0aWVzID0ge31cbiAgICAgIG93bmVyLnRpY2tBYmlsaXRpZXMgPSB7fVxuICAgIH1cbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMub3duZXIgPSBvd25lclxuICAgIG93bmVyW0FCSUxJVFlfTEVBUk5dID0gdGhpc1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBsZWFybiAoYWJpbGl0eSkge1xuICAgIGxldCBvd25lciA9IHRoaXMub3duZXJcbiAgICBpZiAoYWJpbGl0eS5oYXNUb1JlcGxhY2Uob3duZXIsIGFiaWxpdHkpKSB7XG4gICAgICBhYmlsaXR5LmNhcnJ5Qnkob3duZXIpXG4gICAgICBvd25lci5lbWl0KCdhYmlsaXR5LWNhcnJ5JywgYWJpbGl0eSlcbiAgICB9XG4gICAgcmV0dXJuIG93bmVyW0FCSUxJVFlfTEVBUk5dXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdsZWFybmluZydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMZWFyblxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xyXG5pbXBvcnQgeyBBQklMSVRZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuLi8uLi9saWIvTWF0dGVyJ1xyXG5cclxuY29uc3QgRElTVEFOQ0VfVEhSRVNIT0xEID0gMVxyXG5cclxuY2xhc3MgTW92ZSBleHRlbmRzIEFiaWxpdHkge1xyXG4gIC8qKlxyXG4gICAqIOenu+WLleiDveWKm1xyXG4gICAqIEBwYXJhbSAge2ludH0gdmFsdWUgICAg56e75YuV6YCf5bqmXHJcbiAgICogQHBhcmFtICB7ZmxvYXR9IGZyaWN0aW9uQWlyICAgIOepuumWk+aRqeaTpuWKm1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yIChbdmFsdWUsIGZyaWN0aW9uQWlyXSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXHJcbiAgICB0aGlzLmZyaWN0aW9uQWlyID0gZnJpY3Rpb25BaXJcclxuICAgIHRoaXMudmVjdG9yID0gbmV3IFZlY3RvcigwLCAwKVxyXG4gICAgdGhpcy5wYXRoID0gW11cclxuICAgIHRoaXMubW92aW5nVG9Qb2ludCA9IHVuZGVmaW5lZFxyXG4gICAgdGhpcy5kaXN0YW5jZVRocmVzaG9sZCA9IHRoaXMudmFsdWUgKiBESVNUQU5DRV9USFJFU0hPTERcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfTU9WRSB9XHJcblxyXG4gIGlzQmV0dGVyIChvdGhlcikge1xyXG4gICAgLy8g5Y+q5pyD5Yqg5b+rXHJcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA+IG90aGVyLnZhbHVlXHJcbiAgfVxyXG5cclxuICAvLyDphY3lgpnmraTmioDog71cclxuICBjYXJyeUJ5IChvd25lcikge1xyXG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcclxuICAgIHRoaXMub3duZXIgPSBvd25lclxyXG4gICAgb3duZXJbQUJJTElUWV9NT1ZFXSA9IHRoaXNcclxuICB9XHJcblxyXG4gIHJlcGxhY2VkQnkgKG90aGVyLCBvd25lcikge1xyXG4gICAgb3RoZXIudmVjdG9yID0gdGhpcy52ZWN0b3JcclxuICAgIG90aGVyLnBhdGggPSB0aGlzLnBhdGhcclxuICAgIG90aGVyLm1vdmluZ1RvUG9pbnQgPSB0aGlzLm1vdmluZ1RvUG9pbnRcclxuICB9XHJcblxyXG4gIC8vIOioreWumuaWueWQkeacgOWkp+mAn+W6plxyXG4gIHNldERpcmVjdGlvbiAodmVjdG9yKSB7XHJcbiAgICBCb2R5LnNldFZlbG9jaXR5KHRoaXMub3duZXIuYm9keSwgdmVjdG9yLnNldExlbmd0aCh0aGlzLnZhbHVlKSlcclxuICB9XHJcblxyXG4gIC8vIOaWveS6iOWKm1xyXG4gIGFkZERpcmVjdGlvbiAodmVjdG9yKSB7XHJcbiAgICBsZXQgb3duZXIgPSB0aGlzLm93bmVyXHJcbiAgICBpZiAoIW93bmVyLmJvZHkpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0aGlzLnB1bmNoKHZlY3Rvci5tdWx0aXBseVNjYWxhcih0aGlzLnZhbHVlIC8gMzAwKSlcclxuICB9XHJcblxyXG4gIHB1bmNoICh2ZWN0b3IpIHtcclxuICAgIGxldCBvd25lciA9IHRoaXMub3duZXJcclxuICAgIGlmICghb3duZXIuYm9keSkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIG93bmVyLmJvZHkud29ybGQuZm9yY2VzV2FpdEZvckFwcGx5LnB1c2goe293bmVyLCB2ZWN0b3J9KVxyXG4gIH1cclxuXHJcbiAgLy8g56e75YuV5Yiw6bueXHJcbiAgbW92ZVRvIChwb2ludCkge1xyXG4gICAgbGV0IHZlY3RvciA9IG5ldyBWZWN0b3IocG9pbnQueCAtIHRoaXMub3duZXIueCwgcG9pbnQueSAtIHRoaXMub3duZXIueSlcclxuICAgIHRoaXMuc2V0RGlyZWN0aW9uKHZlY3RvcilcclxuICB9XHJcblxyXG4gIC8vIOioreWumuenu+WLlei3r+W+kVxyXG4gIHNldFBhdGggKHBhdGgpIHtcclxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAvLyDmirXpgZTntYLpu55cclxuICAgICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gdW5kZWZpbmVkXHJcbiAgICAgIHRoaXMudmVjdG9yID0gbmV3IFZlY3RvcigwLCAwKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMucGF0aCA9IHBhdGhcclxuICAgIHRoaXMubW92aW5nVG9Qb2ludCA9IHBhdGgucG9wKClcclxuICAgIHRoaXMubW92ZVRvKHRoaXMubW92aW5nVG9Qb2ludClcclxuICB9XHJcblxyXG4gIGNsZWFyUGF0aCAoKSB7XHJcbiAgICB0aGlzLm1vdmluZ1RvUG9pbnQgPSB1bmRlZmluZWRcclxuICAgIHRoaXMucGF0aCA9IFtdXHJcbiAgfVxyXG5cclxuICBhZGRQYXRoIChwYXRoKSB7XHJcbiAgICB0aGlzLnNldFBhdGgocGF0aC5jb25jYXQodGhpcy5wYXRoKSlcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnbW92ZSBsZXZlbDogJyArIHRoaXMudmFsdWVcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vdmVcclxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9PUEVSQVRFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgT3BlcmF0ZSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5zZXQgPSBuZXcgU2V0KFt2YWx1ZV0pXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX09QRVJBVEUgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICBvd25lcltBQklMSVRZX09QRVJBVEVdID0gdGhpc1tBQklMSVRZX09QRVJBVEVdLmJpbmQodGhpcywgb3duZXIpXG4gICAgcmV0dXJuIG93bmVyW0FCSUxJVFlfT1BFUkFURV1cbiAgfVxuXG4gIHJlcGxhY2VkQnkgKG90aGVyKSB7XG4gICAgdGhpcy5zZXQuZm9yRWFjaChvdGhlci5zZXQuYWRkLmJpbmQob3RoZXIuc2V0KSlcbiAgfVxuXG4gIFtBQklMSVRZX09QRVJBVEVdIChvcGVyYXRvciwgdGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMuc2V0Lmhhcyh0YXJnZXQubWFwKSkge1xuICAgICAgb3BlcmF0b3Iuc2F5KG9wZXJhdG9yLnRvU3RyaW5nKCkgKyAnIHVzZSBhYmlsaXR5IHRvIG9wZW4gJyArIHRhcmdldC5tYXApXG4gICAgICB0YXJnZXRbdGhpcy50eXBlXSgpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbJ2tleXM6ICcsIEFycmF5LmZyb20odGhpcy5zZXQpLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0ZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9QTEFDRSwgQUJJTElUWV9DQVJSWSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFBsYWNlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfUExBQ0UgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX1BMQUNFXSA9IHRoaXNcbiAgfVxuXG4gIHBsYWNlIChzbG90SW54KSB7XG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBvd25lcltBQklMSVRZX0NBUlJZXVxuICAgIGxldCBpdGVtID0gY2FycnlBYmlsaXR5LmdldFNsb3RJdGVtKHNsb3RJbngpXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIG93bmVyLmVtaXQoJ3BsYWNlJywgbmV3IGl0ZW0uY29uc3RydWN0b3IoKSlcblxuICAgICAgbGV0IHBvc2l0aW9uID0gb3duZXIucG9zaXRpb25FeFxuICAgICAgb3duZXIuc2F5KFsncGxhY2UgJywgaXRlbS50b1N0cmluZygpLCAnIGF0ICcsXG4gICAgICAgIFsnKCcsIHBvc2l0aW9uLngudG9GaXhlZCgwKSwgJywgJywgcG9zaXRpb24ueS50b0ZpeGVkKDApLCAnKSddLmpvaW4oJycpXS5qb2luKCcnKSlcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdwbGFjZSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGFjZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xyXG5pbXBvcnQgeyBBQklMSVRZX1JPVEFURSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vLi4vbGliL1ZlY3RvcidcclxuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi8uLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xyXG5cclxuY29uc3QgTU9VU0VNT1ZFID0gU3ltYm9sKCdtb3VzZW1vdmUnKVxyXG5cclxuY2xhc3MgUm90YXRlIGV4dGVuZHMgQWJpbGl0eSB7XHJcbiAgY29uc3RydWN0b3IgKGluaXRSYWQgPSAwKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmluaXRSYWQgPSBpbml0UmFkXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX1JPVEFURSB9XHJcblxyXG4gIGlzQmV0dGVyIChvdGhlcikge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBnZXQgZmFjZVJhZCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZmFjZVJhZFxyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XHJcbiAgY2FycnlCeSAob3duZXIpIHtcclxuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXHJcblxyXG4gICAgdGhpcy5vd25lciA9IG93bmVyXHJcbiAgICBvd25lcltBQklMSVRZX1JPVEFURV0gPSB0aGlzXHJcbiAgICBvd25lci5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgIGxldCBtb3VzZUhhbmRsZXIgPSBlID0+IHtcclxuICAgICAgbGV0IG93bmVyUG9pbnQgPSB0aGlzLm93bmVyLmdldEdsb2JhbFBvc2l0aW9uKClcclxuICAgICAgbGV0IHBvaW50ZXIgPSBlLmRhdGEuZ2xvYmFsXHJcbiAgICAgIGxldCB2ZWN0b3IgPSBuZXcgVmVjdG9yKFxyXG4gICAgICAgIHBvaW50ZXIueCAtIG93bmVyUG9pbnQueCxcclxuICAgICAgICBwb2ludGVyLnkgLSBvd25lclBvaW50LnkpXHJcbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KCdyb3RhdGUnLCB2ZWN0b3IpXHJcbiAgICB9XHJcbiAgICBsZXQgcm90YXRlSGFuZGxlciA9IHRoaXMuc2V0RmFjZVJhZC5iaW5kKHRoaXMpXHJcblxyXG4gICAgb3duZXJbTU9VU0VNT1ZFXSA9IHtcclxuICAgICAgcm90YXRlOiByb3RhdGVIYW5kbGVyLFxyXG4gICAgICBtb3VzZW1vdmU6IG1vdXNlSGFuZGxlclxyXG4gICAgfVxyXG4gICAgT2JqZWN0LmVudHJpZXMob3duZXJbTU9VU0VNT1ZFXSkuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcclxuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLm9uKGV2ZW50TmFtZSwgaGFuZGxlcilcclxuICAgIH0pXHJcblxyXG4gICAgdGhpcy5zZXRGYWNlUmFkKG5ldyBWZWN0b3IoMCwgMCkpXHJcbiAgfVxyXG5cclxuICBkcm9wQnkgKG93bmVyKSB7XHJcbiAgICBzdXBlci5kcm9wQnkob3duZXIpXHJcbiAgICBPYmplY3QuZW50cmllcyhvd25lcltNT1VTRU1PVkVdKS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xyXG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIub2ZmKGV2ZW50TmFtZSwgaGFuZGxlcilcclxuICAgIH0pXHJcbiAgICBkZWxldGUgb3duZXJbTU9VU0VNT1ZFXVxyXG4gICAgZGVsZXRlIG93bmVyW0FCSUxJVFlfUk9UQVRFXVxyXG4gIH1cclxuXHJcbiAgc2V0RmFjZVJhZCAodmVjdG9yKSB7XHJcbiAgICB0aGlzLl9mYWNlUmFkID0gdmVjdG9yLnJhZCAtIHRoaXMuaW5pdFJhZFxyXG4gICAgdGhpcy5vd25lci5yb3RhdGUodGhpcy5fZmFjZVJhZClcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnUm90YXRlJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUm90YXRlXHJcbiIsImltcG9ydCB7IFRleHQsIFRleHRTdHlsZSwgbG9hZGVyIH0gZnJvbSAnLi4vbGliL1BJWEknXHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9saWIvU2NlbmUnXHJcbmltcG9ydCBQbGF5U2NlbmUgZnJvbSAnLi9QbGF5U2NlbmUnXHJcblxyXG5sZXQgdGV4dCA9ICdsb2FkaW5nJ1xyXG5cclxuY2xhc3MgTG9hZGluZ1NjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLmxpZmUgPSAwXHJcbiAgfVxyXG5cclxuICBjcmVhdGUgKCkge1xyXG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XHJcbiAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXHJcbiAgICAgIGZvbnRTaXplOiAzNixcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnI2ZmMzMwMCcsXHJcbiAgICAgIHN0cm9rZVRoaWNrbmVzczogNCxcclxuICAgICAgZHJvcFNoYWRvdzogdHJ1ZSxcclxuICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgIGRyb3BTaGFkb3dCbHVyOiA0LFxyXG4gICAgICBkcm9wU2hhZG93QW5nbGU6IE1hdGguUEkgLyA2LFxyXG4gICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDZcclxuICAgIH0pXHJcbiAgICB0aGlzLnRleHRMb2FkaW5nID0gbmV3IFRleHQodGV4dCwgc3R5bGUpXHJcblxyXG4gICAgLy8gQWRkIHRoZSBjYXQgdG8gdGhlIHN0YWdlXHJcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGV4dExvYWRpbmcpXHJcblxyXG4gICAgLy8gbG9hZCBhbiBpbWFnZSBhbmQgcnVuIHRoZSBgc2V0dXBgIGZ1bmN0aW9uIHdoZW4gaXQncyBkb25lXHJcbiAgICBsb2FkZXJcclxuICAgICAgLmFkZCgnaW1hZ2VzL3RlcnJhaW5fYXRsYXMuanNvbicpXHJcbiAgICAgIC5hZGQoJ2ltYWdlcy9iYXNlX291dF9hdGxhcy5qc29uJylcclxuICAgICAgLmFkZCgnaW1hZ2VzL2ZpcmVfYm9sdC5wbmcnKVxyXG4gICAgICAubG9hZCgoKSA9PiB0aGlzLmVtaXQoJ2NoYW5nZVNjZW5lJywgUGxheVNjZW5lLCB7XHJcbiAgICAgICAgbWFwRmlsZTogJ1cwTjAnLFxyXG4gICAgICAgIHBvc2l0aW9uOiBbNiwgMTJdXHJcbiAgICAgIH0pKVxyXG4gIH1cclxuXHJcbiAgdGljayAoZGVsdGEpIHtcclxuICAgIHRoaXMubGlmZSArPSBkZWx0YSAvIDMwIC8vIGJsZW5kIHNwZWVkXHJcbiAgICB0aGlzLnRleHRMb2FkaW5nLnRleHQgPSB0ZXh0ICsgQXJyYXkoTWF0aC5mbG9vcih0aGlzLmxpZmUpICUgNCArIDEpLmpvaW4oJy4nKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTG9hZGluZ1NjZW5lXHJcbiIsImltcG9ydCB7IGxvYWRlciwgcmVzb3VyY2VzLCBkaXNwbGF5IH0gZnJvbSAnLi4vbGliL1BJWEknXHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9saWIvU2NlbmUnXHJcbmltcG9ydCBNYXAgZnJvbSAnLi4vbGliL01hcCdcclxuaW1wb3J0IE1hcEZvZyBmcm9tICcuLi9saWIvTWFwRm9nJ1xyXG5pbXBvcnQgeyBJU19NT0JJTEUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuaW1wb3J0IENhdCBmcm9tICcuLi9vYmplY3RzL0NhdCdcclxuXHJcbmltcG9ydCBNZXNzYWdlV2luZG93IGZyb20gJy4uL3VpL01lc3NhZ2VXaW5kb3cnXHJcbmltcG9ydCBQbGF5ZXJXaW5kb3cgZnJvbSAnLi4vdWkvUGxheWVyV2luZG93J1xyXG5pbXBvcnQgSW52ZW50b3J5V2luZG93IGZyb20gJy4uL3VpL0ludmVudG9yeVdpbmRvdydcclxuaW1wb3J0IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsIGZyb20gJy4uL3VpL1RvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsJ1xyXG5pbXBvcnQgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwgZnJvbSAnLi4vdWkvVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwnXHJcbmltcG9ydCBnbG9iYWxFdmVudE1hbmFnZXIgZnJvbSAnLi4vbGliL2dsb2JhbEV2ZW50TWFuYWdlcidcclxuXHJcbmxldCBzY2VuZVdpZHRoXHJcbmxldCBzY2VuZUhlaWdodFxyXG5cclxuZnVuY3Rpb24gZ2V0TWVzc2FnZVdpbmRvd09wdCAoKSB7XHJcbiAgbGV0IG9wdCA9IHt9XHJcbiAgaWYgKElTX01PQklMRSkge1xyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aFxyXG4gICAgb3B0LmZvbnRTaXplID0gb3B0LndpZHRoIC8gMzBcclxuICAgIG9wdC5zY3JvbGxCYXJXaWR0aCA9IDUwXHJcbiAgICBvcHQuc2Nyb2xsQmFyTWluSGVpZ2h0ID0gNzBcclxuICB9IGVsc2Uge1xyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aCA8IDQwMCA/IHNjZW5lV2lkdGggOiBzY2VuZVdpZHRoIC8gMlxyXG4gICAgb3B0LmZvbnRTaXplID0gb3B0LndpZHRoIC8gNjBcclxuICB9XHJcbiAgb3B0LmhlaWdodCA9IHNjZW5lSGVpZ2h0IC8gNlxyXG4gIG9wdC54ID0gMFxyXG4gIG9wdC55ID0gc2NlbmVIZWlnaHQgLSBvcHQuaGVpZ2h0XHJcblxyXG4gIHJldHVybiBvcHRcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UGxheWVyV2luZG93T3B0IChwbGF5ZXIpIHtcclxuICBsZXQgb3B0ID0ge1xyXG4gICAgcGxheWVyXHJcbiAgfVxyXG4gIG9wdC54ID0gMFxyXG4gIG9wdC55ID0gMFxyXG4gIGlmIChJU19NT0JJTEUpIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggLyA0XHJcbiAgICBvcHQuaGVpZ2h0ID0gc2NlbmVIZWlnaHQgLyA2XHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyAxMFxyXG4gIH0gZWxzZSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIDwgNDAwID8gc2NlbmVXaWR0aCAvIDIgOiBzY2VuZVdpZHRoIC8gNFxyXG4gICAgb3B0LmhlaWdodCA9IHNjZW5lSGVpZ2h0IC8gM1xyXG4gICAgb3B0LmZvbnRTaXplID0gb3B0LndpZHRoIC8gMjBcclxuICB9XHJcbiAgcmV0dXJuIG9wdFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJbnZlbnRvcnlXaW5kb3dPcHQgKHBsYXllcikge1xyXG4gIGxldCBvcHQgPSB7XHJcbiAgICBwbGF5ZXJcclxuICB9XHJcbiAgb3B0LnkgPSAwXHJcbiAgaWYgKElTX01PQklMRSkge1xyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aCAvIDZcclxuICB9IGVsc2Uge1xyXG4gICAgbGV0IGRpdmlkZSA9IHNjZW5lV2lkdGggPCA0MDAgPyA2IDogc2NlbmVXaWR0aCA8IDgwMCA/IDEyIDogMjBcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggLyBkaXZpZGVcclxuICB9XHJcbiAgb3B0LnggPSBzY2VuZVdpZHRoIC0gb3B0LndpZHRoXHJcbiAgcmV0dXJuIG9wdFxyXG59XHJcblxyXG5jbGFzcyBQbGF5U2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcbiAgY29uc3RydWN0b3IgKHsgbWFwRmlsZSwgcG9zaXRpb24gfSkge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIHRoaXMubWFwRmlsZSA9IG1hcEZpbGVcclxuICAgIHRoaXMudG9Qb3NpdGlvbiA9IHBvc2l0aW9uXHJcbiAgICB0aGlzLmdyb3VwLmVuYWJsZVNvcnQgPSB0cnVlXHJcbiAgICB0aGlzLm1hcFNjYWxlID0gSVNfTU9CSUxFID8gMiA6IDAuNVxyXG4gICAgdGhpcy5tYXBGb2cgPSBuZXcgTWFwRm9nKClcclxuICB9XHJcblxyXG4gIGNyZWF0ZSAoKSB7XHJcbiAgICBzY2VuZVdpZHRoID0gdGhpcy5wYXJlbnQud2lkdGhcclxuICAgIHNjZW5lSGVpZ2h0ID0gdGhpcy5wYXJlbnQuaGVpZ2h0XHJcbiAgICB0aGlzLmlzTWFwTG9hZGVkID0gZmFsc2VcclxuICAgIHRoaXMubG9hZE1hcCgpXHJcbiAgICB0aGlzLmluaXRQbGF5ZXIoKVxyXG4gICAgdGhpcy5pbml0VWkoKVxyXG4gICAgLy8gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgLy8gICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgnZmlyZScpXHJcbiAgICAvLyB9LCAxMDApXHJcbiAgfVxyXG5cclxuICBpbml0VWkgKCkge1xyXG4gICAgbGV0IHVpR3JvdXAgPSBuZXcgZGlzcGxheS5Hcm91cCgxLCB0cnVlKVxyXG4gICAgbGV0IHVpTGF5ZXIgPSBuZXcgZGlzcGxheS5MYXllcih1aUdyb3VwKVxyXG4gICAgdWlMYXllci5wYXJlbnRMYXllciA9IHRoaXNcclxuICAgIHRoaXMuYWRkQ2hpbGQodWlMYXllcilcclxuXHJcbiAgICBsZXQgbWVzc2FnZVdpbmRvdyA9IG5ldyBNZXNzYWdlV2luZG93KGdldE1lc3NhZ2VXaW5kb3dPcHQoKSlcclxuICAgIGxldCBwbGF5ZXJXaW5kb3cgPSBuZXcgUGxheWVyV2luZG93KGdldFBsYXllcldpbmRvd09wdCh0aGlzLmNhdCkpXHJcbiAgICBsZXQgaW52ZW50b3J5V2luZG93ID0gbmV3IEludmVudG9yeVdpbmRvdyhnZXRJbnZlbnRvcnlXaW5kb3dPcHQodGhpcy5jYXQpKVxyXG5cclxuICAgIC8vIOiuk1VJ6aGv56S65Zyo6aCC5bGkXHJcbiAgICBtZXNzYWdlV2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgcGxheWVyV2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgaW52ZW50b3J5V2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgdWlMYXllci5hZGRDaGlsZChtZXNzYWdlV2luZG93KVxyXG4gICAgdWlMYXllci5hZGRDaGlsZChwbGF5ZXJXaW5kb3cpXHJcbiAgICB1aUxheWVyLmFkZENoaWxkKGludmVudG9yeVdpbmRvdylcclxuXHJcbiAgICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICAgIC8vIOWPquacieaJi+apn+imgeinuOaOp+adv1xyXG4gICAgICAvLyDmlrnlkJHmjqfliLZcclxuICAgICAgbGV0IGRpcmVjdGlvblBhbmVsID0gbmV3IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsKHtcclxuICAgICAgICB4OiBzY2VuZVdpZHRoIC8gNCxcclxuICAgICAgICB5OiBzY2VuZUhlaWdodCAqIDQgLyA2LFxyXG4gICAgICAgIHJhZGl1czogc2NlbmVXaWR0aCAvIDhcclxuICAgICAgfSlcclxuICAgICAgZGlyZWN0aW9uUGFuZWwucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcblxyXG4gICAgICAvLyDmk43kvZzmjqfliLZcclxuICAgICAgbGV0IG9wZXJhdGlvblBhbmVsID0gbmV3IFRvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsKHtcclxuICAgICAgICB4OiBzY2VuZVdpZHRoIC8gNSAqIDMsXHJcbiAgICAgICAgeTogc2NlbmVIZWlnaHQgLyA1ICogMyxcclxuICAgICAgICB3aWR0aDogc2NlbmVXaWR0aCAvIDMsXHJcbiAgICAgICAgaGVpZ2h0OiBzY2VuZUhlaWdodCAvIDVcclxuICAgICAgfSlcclxuICAgICAgb3BlcmF0aW9uUGFuZWwucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcblxyXG4gICAgICB1aUxheWVyLmFkZENoaWxkKGRpcmVjdGlvblBhbmVsKVxyXG4gICAgICB1aUxheWVyLmFkZENoaWxkKG9wZXJhdGlvblBhbmVsKVxyXG4gICAgICAvLyByZXF1aXJlKCcuLi9saWIvZGVtbycpXHJcbiAgICB9XHJcbiAgICBtZXNzYWdlV2luZG93LmFkZChbJ3NjZW5lIHNpemU6ICgnLCBzY2VuZVdpZHRoLCAnLCAnLCBzY2VuZUhlaWdodCwgJykuJ10uam9pbignJykpXHJcbiAgfVxyXG5cclxuICBpbml0UGxheWVyICgpIHtcclxuICAgIGlmICghdGhpcy5jYXQpIHtcclxuICAgICAgdGhpcy5jYXQgPSBuZXcgQ2F0KClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxvYWRNYXAgKCkge1xyXG4gICAgbGV0IGZpbGVOYW1lID0gJ3dvcmxkLycgKyB0aGlzLm1hcEZpbGVcclxuXHJcbiAgICAvLyBpZiBtYXAgbm90IGxvYWRlZCB5ZXRcclxuICAgIGlmICghcmVzb3VyY2VzW2ZpbGVOYW1lXSkge1xyXG4gICAgICBsb2FkZXJcclxuICAgICAgICAuYWRkKGZpbGVOYW1lLCBmaWxlTmFtZSArICcuanNvbicpXHJcbiAgICAgICAgLmxvYWQodGhpcy5zcGF3bk1hcC5iaW5kKHRoaXMsIGZpbGVOYW1lKSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3Bhd25NYXAoZmlsZU5hbWUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzcGF3bk1hcCAoZmlsZU5hbWUpIHtcclxuICAgIGxldCBtYXBHcm91cCA9IG5ldyBkaXNwbGF5Lkdyb3VwKDAsIHRydWUpXHJcbiAgICBsZXQgbWFwTGF5ZXIgPSBuZXcgZGlzcGxheS5MYXllcihtYXBHcm91cClcclxuICAgIG1hcExheWVyLnBhcmVudExheWVyID0gdGhpc1xyXG4gICAgbWFwTGF5ZXIuZ3JvdXAuZW5hYmxlU29ydCA9IHRydWVcclxuICAgIG1hcExheWVyLnBvc2l0aW9uLnNldChzY2VuZVdpZHRoIC8gMiwgc2NlbmVIZWlnaHQgLyAyKVxyXG4gICAgdGhpcy5hZGRDaGlsZChtYXBMYXllcilcclxuXHJcbiAgICBsZXQgbWFwRGF0YSA9IHJlc291cmNlc1tmaWxlTmFtZV0uZGF0YVxyXG5cclxuICAgIGxldCBtYXAgPSBuZXcgTWFwKClcclxuICAgIG1hcExheWVyLmFkZENoaWxkKG1hcClcclxuICAgIC8vIGVuYWJsZSBmb2dcclxuICAgIGlmICghbWFwRGF0YS5oYXNGb2cpIHtcclxuICAgICAgdGhpcy5tYXBGb2cuZGlzYWJsZSgpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLm1hcEZvZy5lbmFibGUobWFwKVxyXG4gICAgfVxyXG4gICAgLy8gdGhpcy5tYXBGb2cucG9zaXRpb24uc2V0KC1zY2VuZVdpZHRoIC8gMiwgLXNjZW5lSGVpZ2h0IC8gMilcclxuICAgIG1hcExheWVyLmFkZENoaWxkKHRoaXMubWFwRm9nKVxyXG4gICAgbWFwLmxvYWQobWFwRGF0YSlcclxuXHJcbiAgICBtYXAub24oJ3VzZScsIG8gPT4ge1xyXG4gICAgICB0aGlzLmlzTWFwTG9hZGVkID0gZmFsc2VcclxuICAgICAgLy8gY2xlYXIgb2xkIG1hcFxyXG4gICAgICB0aGlzLnJlbW92ZUNoaWxkKHRoaXMubWFwKVxyXG4gICAgICB0aGlzLm1hcC5kZXN0cm95KClcclxuXHJcbiAgICAgIHRoaXMubWFwRmlsZSA9IG8ubWFwXHJcbiAgICAgIHRoaXMudG9Qb3NpdGlvbiA9IG8udG9Qb3NpdGlvblxyXG4gICAgICB0aGlzLmxvYWRNYXAoKVxyXG4gICAgfSlcclxuXHJcbiAgICBtYXAuYWRkUGxheWVyKHRoaXMuY2F0LCB0aGlzLnRvUG9zaXRpb24pXHJcbiAgICAvLyBUT0RPOiBkZWJ1ZyByZW5kZXJcclxuICAgIC8vIG1hcC5kZWJ1Zyh7d2lkdGg6IHNjZW5lV2lkdGgsIGhlaWdodDogc2NlbmVIZWlnaHR9KVxyXG4gICAgbWFwLnNldFNjYWxlKHRoaXMubWFwU2NhbGUpXHJcbiAgICB0aGlzLm1hcCA9IG1hcFxyXG5cclxuICAgIHRoaXMuaXNNYXBMb2FkZWQgPSB0cnVlXHJcbiAgfVxyXG5cclxuICB0aWNrIChkZWx0YSkge1xyXG4gICAgaWYgKCF0aGlzLmlzTWFwTG9hZGVkKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5tYXAudGljayhkZWx0YSlcclxuICAgIC8vIEZJWE1FOiBnYXAgYmV0d2VlbiB0aWxlcyBvbiBpUGhvbmUgU2FmYXJpXHJcbiAgICB0aGlzLm1hcC5zZXRQb3NpdGlvbihcclxuICAgICAgLXRoaXMuY2F0LnggKiB0aGlzLm1hcFNjYWxlLFxyXG4gICAgICAtdGhpcy5jYXQueSAqIHRoaXMubWFwU2NhbGUpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGF5U2NlbmVcclxuIiwiaW1wb3J0IFdpbmRvdyBmcm9tICcuL1dpbmRvdydcbmltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MsIFRleHQsIFRleHRTdHlsZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IHsgQUJJTElUWV9DQVJSWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFNsb3QgZXh0ZW5kcyBDb250YWluZXIge1xuICBjb25zdHJ1Y3RvciAoeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcblxuICAgIGxldCByZWN0ID0gbmV3IEdyYXBoaWNzKClcbiAgICByZWN0LmJlZ2luRmlsbCgweEEyQTJBMilcbiAgICByZWN0LmRyYXdSb3VuZGVkUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0LCA1KVxuICAgIHJlY3QuZW5kRmlsbCgpXG4gICAgdGhpcy5hZGRDaGlsZChyZWN0KVxuICB9XG5cbiAgc2V0Q29udGV4dCAoaXRlbSwgY291bnQpIHtcbiAgICB0aGlzLmNsZWFyQ29udGV4dCgpXG5cbiAgICBsZXQgd2lkdGggPSB0aGlzLndpZHRoXG4gICAgbGV0IGhlaWdodCA9IHRoaXMuaGVpZ2h0XG4gICAgLy8g572u5LitXG4gICAgaXRlbSA9IG5ldyBpdGVtLmNvbnN0cnVjdG9yKClcbiAgICBsZXQgbWF4U2lkZSA9IE1hdGgubWF4KGl0ZW0ud2lkdGgsIGl0ZW0uaGVpZ2h0KVxuICAgIGxldCBzY2FsZSA9IHdpZHRoIC8gbWF4U2lkZVxuICAgIGl0ZW0uc2NhbGVFeC5zZXQoc2NhbGUpXG4gICAgaXRlbS5hbmNob3Iuc2V0KDAuNSwgMC41KVxuICAgIGl0ZW0ucG9zaXRpb24uc2V0KHdpZHRoIC8gMiwgaGVpZ2h0IC8gMilcbiAgICB0aGlzLmFkZENoaWxkKGl0ZW0pXG5cbiAgICAvLyDmlbjph49cbiAgICBsZXQgZm9udFNpemUgPSB0aGlzLndpZHRoICogMC4zXG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICBmaWxsOiAncmVkJyxcbiAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxuICAgICAgbGluZUhlaWdodDogZm9udFNpemVcbiAgICB9KVxuICAgIGxldCBjb3VudFRleHQgPSBjb3VudCA9PT0gSW5maW5pdHkgPyAn4oieJyA6IGNvdW50XG4gICAgbGV0IHRleHQgPSBuZXcgVGV4dChjb3VudFRleHQsIHN0eWxlKVxuICAgIHRleHQucG9zaXRpb24uc2V0KHdpZHRoICogMC45NSwgaGVpZ2h0KVxuICAgIHRleHQuYW5jaG9yLnNldCgxLCAxKVxuICAgIHRoaXMuYWRkQ2hpbGQodGV4dClcblxuICAgIHRoaXMuaXRlbSA9IGl0ZW1cbiAgICB0aGlzLnRleHQgPSB0ZXh0XG4gIH1cblxuICBjbGVhckNvbnRleHQgKCkge1xuICAgIGlmICh0aGlzLml0ZW0pIHtcbiAgICAgIHRoaXMuaXRlbS5kZXN0cm95KClcbiAgICAgIHRoaXMudGV4dC5kZXN0cm95KClcbiAgICAgIGRlbGV0ZSB0aGlzLml0ZW1cbiAgICAgIGRlbGV0ZSB0aGlzLnRleHRcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgSW52ZW50b3J5V2luZG93IGV4dGVuZHMgV2luZG93IHtcbiAgY29uc3RydWN0b3IgKG9wdCkge1xuICAgIGxldCB7IHBsYXllciwgd2lkdGggfSA9IG9wdFxuICAgIGxldCBwYWRkaW5nID0gd2lkdGggKiAwLjFcbiAgICBsZXQgY2VpbFNpemUgPSB3aWR0aCAtIHBhZGRpbmcgKiAyXG4gICAgbGV0IGNlaWxPcHQgPSB7XG4gICAgICB4OiBwYWRkaW5nLFxuICAgICAgeTogcGFkZGluZyxcbiAgICAgIHdpZHRoOiBjZWlsU2l6ZSxcbiAgICAgIGhlaWdodDogY2VpbFNpemVcbiAgICB9XG4gICAgbGV0IHNsb3RDb3VudCA9IDRcbiAgICBvcHQuaGVpZ2h0ID0gKHdpZHRoIC0gcGFkZGluZykgKiBzbG90Q291bnQgKyBwYWRkaW5nXG5cbiAgICBzdXBlcihvcHQpXG5cbiAgICB0aGlzLl9vcHQgPSBvcHRcbiAgICBwbGF5ZXIub24oJ2ludmVudG9yeS1tb2RpZmllZCcsIHRoaXMub25JbnZlbnRvcnlNb2RpZmllZC5iaW5kKHRoaXMsIHBsYXllcikpXG5cbiAgICB0aGlzLnNsb3RDb250YWluZXJzID0gW11cbiAgICB0aGlzLnNsb3RzID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsb3RDb3VudDsgaSsrKSB7XG4gICAgICBsZXQgc2xvdCA9IG5ldyBTbG90KGNlaWxPcHQpXG4gICAgICB0aGlzLmFkZENoaWxkKHNsb3QpXG4gICAgICB0aGlzLnNsb3RDb250YWluZXJzLnB1c2goc2xvdClcbiAgICAgIGNlaWxPcHQueSArPSBjZWlsU2l6ZSArIHBhZGRpbmdcbiAgICB9XG5cbiAgICB0aGlzLm9uSW52ZW50b3J5TW9kaWZpZWQocGxheWVyKVxuICB9XG5cbiAgb25JbnZlbnRvcnlNb2RpZmllZCAocGxheWVyKSB7XG4gICAgbGV0IGNhcnJ5QWJpbGl0eSA9IHBsYXllcltBQklMSVRZX0NBUlJZXVxuICAgIGlmICghY2FycnlBYmlsaXR5KSB7XG4gICAgICAvLyBubyBpbnZlbnRvcnkgeWV0XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGkgPSAwXG4gICAgY2FycnlBYmlsaXR5LmJhZ3MuZm9yRWFjaChiYWcgPT4gYmFnLmZvckVhY2goc2xvdCA9PiB7XG4gICAgICB0aGlzLnNsb3RzW2ldID0gc2xvdFxuICAgICAgaSsrXG4gICAgfSkpXG4gICAgdGhpcy5zbG90Q29udGFpbmVycy5mb3JFYWNoKChjb250YWluZXIsIGkpID0+IHtcbiAgICAgIGxldCBzbG90ID0gdGhpcy5zbG90c1tpXVxuICAgICAgaWYgKHNsb3QpIHtcbiAgICAgICAgY29udGFpbmVyLnNldENvbnRleHQoc2xvdC5pdGVtLCBzbG90LmNvdW50KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGFpbmVyLmNsZWFyQ29udGV4dCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3dpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnZlbnRvcnlXaW5kb3dcbiIsImltcG9ydCB7IFRleHQsIFRleHRTdHlsZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgU2Nyb2xsYWJsZVdpbmRvdyBmcm9tICcuL1Njcm9sbGFibGVXaW5kb3cnXG5pbXBvcnQgbWVzc2FnZXMgZnJvbSAnLi4vbGliL01lc3NhZ2VzJ1xuXG5jbGFzcyBNZXNzYWdlV2luZG93IGV4dGVuZHMgU2Nyb2xsYWJsZVdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG5cbiAgICBsZXQgeyBmb250U2l6ZSA9IDEyIH0gPSBvcHRcblxuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgZmlsbDogJ2dyZWVuJyxcbiAgICAgIGJyZWFrV29yZHM6IHRydWUsXG4gICAgICB3b3JkV3JhcDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGg6IHRoaXMud2luZG93V2lkdGhcbiAgICB9KVxuICAgIGxldCB0ZXh0ID0gbmV3IFRleHQoJycsIHN0eWxlKVxuXG4gICAgdGhpcy5hZGRXaW5kb3dDaGlsZCh0ZXh0KVxuICAgIHRoaXMudGV4dCA9IHRleHRcblxuICAgIHRoaXMuYXV0b1Njcm9sbFRvQm90dG9tID0gdHJ1ZVxuXG4gICAgbWVzc2FnZXMub24oJ21vZGlmaWVkJywgdGhpcy5tb2RpZmllZC5iaW5kKHRoaXMpKVxuICB9XG5cbiAgbW9kaWZpZWQgKCkge1xuICAgIGxldCBzY3JvbGxQZXJjZW50ID0gdGhpcy5zY3JvbGxQZXJjZW50XG4gICAgdGhpcy50ZXh0LnRleHQgPSBbXS5jb25jYXQobWVzc2FnZXMubGlzdCkucmV2ZXJzZSgpLmpvaW4oJ1xcbicpXG4gICAgdGhpcy51cGRhdGVTY3JvbGxCYXJMZW5ndGgoKVxuXG4gICAgLy8g6Iulc2Nyb2xs572u5bqV77yM6Ieq5YuV5o2y5YuV572u5bqVXG4gICAgaWYgKHNjcm9sbFBlcmNlbnQgPT09IDEpIHtcbiAgICAgIHRoaXMuc2Nyb2xsVG8oMSlcbiAgICB9XG4gIH1cblxuICBhZGQgKG1zZykge1xuICAgIG1lc3NhZ2VzLmFkZChtc2cpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdtZXNzYWdlLXdpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlV2luZG93XG4iLCJpbXBvcnQgeyBDb250YWluZXIsIFRleHQsIFRleHRTdHlsZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IFZhbHVlQmFyIGZyb20gJy4vVmFsdWVCYXInXG5cbmltcG9ydCBXaW5kb3cgZnJvbSAnLi9XaW5kb3cnXG5pbXBvcnQgeyBBQklMSVRZX01PVkUsIEFCSUxJVFlfQ0FNRVJBLCBBQklMSVRZX0hFQUxUSCB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IEFCSUxJVElFU19BTEwgPSBbXG4gIEFCSUxJVFlfTU9WRSxcbiAgQUJJTElUWV9DQU1FUkEsXG4gIEFCSUxJVFlfSEVBTFRIXG5dXG5cbmNsYXNzIFBsYXllcldpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG4gICAgbGV0IHsgcGxheWVyIH0gPSBvcHRcbiAgICB0aGlzLl9vcHQgPSBvcHRcblxuICAgIHRoaXMucmVuZGVySGVhbHRoQmFyKHt4OiA1LCB5OiA1fSlcbiAgICB0aGlzLnJlbmRlckFiaWxpdHkoe3g6IDUsIHk6IDIwfSlcblxuICAgIHRoaXMub25BYmlsaXR5Q2FycnkocGxheWVyKVxuXG4gICAgcGxheWVyLm9uKCdhYmlsaXR5LWNhcnJ5JywgdGhpcy5vbkFiaWxpdHlDYXJyeS5iaW5kKHRoaXMsIHBsYXllcikpXG4gICAgcGxheWVyLm9uKCdoZWFsdGgtY2hhbmdlJywgdGhpcy5vbkhlYWx0aENoYW5nZS5iaW5kKHRoaXMsIHBsYXllcikpXG4gIH1cblxuICByZW5kZXJBYmlsaXR5ICh7eCwgeX0pIHtcbiAgICBsZXQgYWJpbGl0eVRleHRDb250YWluZXIgPSBuZXcgQ29udGFpbmVyKClcbiAgICBhYmlsaXR5VGV4dENvbnRhaW5lci5wb3NpdGlvbi5zZXQoeCwgeSlcbiAgICB0aGlzLmFkZENoaWxkKGFiaWxpdHlUZXh0Q29udGFpbmVyKVxuICAgIHRoaXMuYWJpbGl0eVRleHRDb250YWluZXIgPSBhYmlsaXR5VGV4dENvbnRhaW5lclxuICB9XG5cbiAgcmVuZGVySGVhbHRoQmFyICh7eCwgeX0pIHtcbiAgICBsZXQge3dpZHRofSA9IHRoaXMuX29wdFxuICAgIHdpZHRoIC89IDJcbiAgICBsZXQgaGVpZ2h0ID0gMTBcbiAgICBsZXQgY29sb3IgPSAweEQyMzIwMFxuICAgIGxldCBoZWFsdGhCYXIgPSBuZXcgVmFsdWVCYXIoe3gsIHksIHdpZHRoLCBoZWlnaHQsIGNvbG9yfSlcblxuICAgIHRoaXMuYWRkQ2hpbGQoaGVhbHRoQmFyKVxuXG4gICAgdGhpcy5oZWFsdGhCYXIgPSBoZWFsdGhCYXJcbiAgfVxuXG4gIG9uQWJpbGl0eUNhcnJ5IChwbGF5ZXIpIHtcbiAgICBsZXQgaSA9IDBcbiAgICBsZXQgeyBmb250U2l6ZSA9IDEwIH0gPSB0aGlzLl9vcHRcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgIGZpbGw6ICdncmVlbicsXG4gICAgICBsaW5lSGVpZ2h0OiBmb250U2l6ZVxuICAgIH0pXG5cbiAgICAvLyDmm7TmlrDpnaLmnb/mlbjmk5pcbiAgICBsZXQgY29udGlhbmVyID0gdGhpcy5hYmlsaXR5VGV4dENvbnRhaW5lclxuICAgIGNvbnRpYW5lci5yZW1vdmVDaGlsZHJlbigpXG4gICAgQUJJTElUSUVTX0FMTC5mb3JFYWNoKGFiaWxpdHlTeW1ib2wgPT4ge1xuICAgICAgbGV0IGFiaWxpdHkgPSBwbGF5ZXIuYWJpbGl0aWVzW2FiaWxpdHlTeW1ib2xdXG4gICAgICBpZiAoYWJpbGl0eSkge1xuICAgICAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KGFiaWxpdHkudG9TdHJpbmcoKSwgc3R5bGUpXG4gICAgICAgIHRleHQueSA9IGkgKiAoZm9udFNpemUgKyA1KVxuXG4gICAgICAgIGNvbnRpYW5lci5hZGRDaGlsZCh0ZXh0KVxuXG4gICAgICAgIGkrK1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBvbkhlYWx0aENoYW5nZSAocGxheWVyKSB7XG4gICAgbGV0IGhlYWx0aEFiaWxpdHkgPSBwbGF5ZXJbQUJJTElUWV9IRUFMVEhdXG4gICAgaWYgKCFoZWFsdGhBYmlsaXR5KSB7XG4gICAgICB0aGlzLmhlYWx0aEJhci52aXNpYmxlID0gZmFsc2VcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIXRoaXMuaGVhbHRoQmFyLnZpc2libGUpIHtcbiAgICAgIHRoaXMuaGVhbHRoQmFyLnZpc2libGUgPSB0cnVlXG4gICAgfVxuICAgIHRoaXMuaGVhbHRoQmFyLmVtaXQoJ3ZhbHVlLWNoYW5nZScsIGhlYWx0aEFiaWxpdHkuaHAgLyBoZWFsdGhBYmlsaXR5LmhwTWF4KVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllcldpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IFdyYXBwZXIgZnJvbSAnLi9XcmFwcGVyJ1xuXG5jbGFzcyBTY3JvbGxhYmxlV2luZG93IGV4dGVuZHMgV2luZG93IHtcbiAgY29uc3RydWN0b3IgKG9wdCkge1xuICAgIHN1cGVyKG9wdClcbiAgICBsZXQge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBwYWRkaW5nID0gOCxcbiAgICAgIHNjcm9sbEJhcldpZHRoID0gMTBcbiAgICB9ID0gb3B0XG4gICAgdGhpcy5fb3B0ID0gb3B0XG5cbiAgICB0aGlzLl9pbml0U2Nyb2xsYWJsZUFyZWEoXG4gICAgICB3aWR0aCAtIHBhZGRpbmcgKiAyIC0gc2Nyb2xsQmFyV2lkdGggLSA1LFxuICAgICAgaGVpZ2h0IC0gcGFkZGluZyAqIDIsXG4gICAgICBwYWRkaW5nKVxuICAgIHRoaXMuX2luaXRTY3JvbGxCYXIoe1xuICAgICAgLy8gd2luZG93IHdpZHRoIC0gd2luZG93IHBhZGRpbmcgLSBiYXIgd2lkdGhcbiAgICAgIHg6IHdpZHRoIC0gcGFkZGluZyAtIHNjcm9sbEJhcldpZHRoLFxuICAgICAgeTogcGFkZGluZyxcbiAgICAgIHdpZHRoOiBzY3JvbGxCYXJXaWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0IC0gcGFkZGluZyAqIDJcbiAgICB9KVxuICB9XG5cbiAgX2luaXRTY3JvbGxhYmxlQXJlYSAod2lkdGgsIGhlaWdodCwgcGFkZGluZykge1xuICAgIC8vIGhvbGQgcGFkZGluZ1xuICAgIGxldCBfbWFpblZpZXcgPSBuZXcgQ29udGFpbmVyKClcbiAgICBfbWFpblZpZXcucG9zaXRpb24uc2V0KHBhZGRpbmcsIHBhZGRpbmcpXG4gICAgdGhpcy5hZGRDaGlsZChfbWFpblZpZXcpXG5cbiAgICB0aGlzLm1haW5WaWV3ID0gbmV3IENvbnRhaW5lcigpXG4gICAgX21haW5WaWV3LmFkZENoaWxkKHRoaXMubWFpblZpZXcpXG5cbiAgICAvLyBoaWRlIG1haW5WaWV3J3Mgb3ZlcmZsb3dcbiAgICBsZXQgbWFzayA9IG5ldyBHcmFwaGljcygpXG4gICAgbWFzay5iZWdpbkZpbGwoMHhGRkZGRkYpXG4gICAgbWFzay5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgNSlcbiAgICBtYXNrLmVuZEZpbGwoKVxuICAgIHRoaXMubWFpblZpZXcubWFzayA9IG1hc2tcbiAgICBfbWFpblZpZXcuYWRkQ2hpbGQobWFzaylcblxuICAgIC8vIHdpbmRvdyB3aWR0aCAtIHdpbmRvdyBwYWRkaW5nICogMiAtIGJhciB3aWR0aCAtIGJldHdlZW4gc3BhY2VcbiAgICB0aGlzLl93aW5kb3dXaWR0aCA9IHdpZHRoXG4gICAgdGhpcy5fd2luZG93SGVpZ2h0ID0gaGVpZ2h0XG4gIH1cblxuICBfaW5pdFNjcm9sbEJhciAoeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0pIHtcbiAgICBsZXQgY29uYXRpbmVyID0gbmV3IENvbnRhaW5lcigpXG4gICAgY29uYXRpbmVyLnggPSB4XG4gICAgY29uYXRpbmVyLnkgPSB5XG5cbiAgICBsZXQgc2Nyb2xsQmFyQmcgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHNjcm9sbEJhckJnLmJlZ2luRmlsbCgweEE4QThBOClcbiAgICBzY3JvbGxCYXJCZy5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgMilcbiAgICBzY3JvbGxCYXJCZy5lbmRGaWxsKClcblxuICAgIGxldCBzY3JvbGxCYXIgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHNjcm9sbEJhci5iZWdpbkZpbGwoMHgyMjIyMjIpXG4gICAgc2Nyb2xsQmFyLmRyYXdSb3VuZGVkUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0LCAzKVxuICAgIHNjcm9sbEJhci5lbmRGaWxsKClcbiAgICBzY3JvbGxCYXIudG9TdHJpbmcgPSAoKSA9PiAnc2Nyb2xsQmFyJ1xuICAgIFdyYXBwZXIuZHJhZ2dhYmxlKHNjcm9sbEJhciwge1xuICAgICAgYm91bmRhcnk6IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMCxcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgfVxuICAgIH0pXG4gICAgc2Nyb2xsQmFyLm9uKCdkcmFnJywgdGhpcy5zY3JvbGxNYWluVmlldy5iaW5kKHRoaXMpKVxuXG4gICAgY29uYXRpbmVyLmFkZENoaWxkKHNjcm9sbEJhckJnKVxuICAgIGNvbmF0aW5lci5hZGRDaGlsZChzY3JvbGxCYXIpXG4gICAgdGhpcy5hZGRDaGlsZChjb25hdGluZXIpXG4gICAgdGhpcy5zY3JvbGxCYXIgPSBzY3JvbGxCYXJcbiAgICB0aGlzLnNjcm9sbEJhckJnID0gc2Nyb2xsQmFyQmdcbiAgfVxuXG4gIC8vIOaNsuWLleimlueql1xuICBzY3JvbGxNYWluVmlldyAoKSB7XG4gICAgdGhpcy5tYWluVmlldy55ID0gKHRoaXMud2luZG93SGVpZ2h0IC0gdGhpcy5tYWluVmlldy5oZWlnaHQpICogdGhpcy5zY3JvbGxQZXJjZW50XG4gIH1cblxuICAvLyDmlrDlop7nianku7boh7PoppbnqpdcbiAgYWRkV2luZG93Q2hpbGQgKGNoaWxkKSB7XG4gICAgdGhpcy5tYWluVmlldy5hZGRDaGlsZChjaGlsZClcbiAgfVxuXG4gIC8vIOabtOaWsOaNsuWLleajkuWkp+Wwjywg5LiN5LiA5a6a6KaB6Kq/55SoXG4gIHVwZGF0ZVNjcm9sbEJhckxlbmd0aCAoKSB7XG4gICAgbGV0IHsgc2Nyb2xsQmFyTWluSGVpZ2h0ID0gMjAgfSA9IHRoaXMuX29wdFxuXG4gICAgbGV0IGRoID0gdGhpcy5tYWluVmlldy5oZWlnaHQgLyB0aGlzLndpbmRvd0hlaWdodFxuICAgIGlmIChkaCA8IDEpIHtcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC8gZGhcbiAgICAgIC8vIOmBv+WFjeWkquWwj+W+iOmbo+aLluabs1xuICAgICAgdGhpcy5zY3JvbGxCYXIuaGVpZ2h0ID0gTWF0aC5tYXgoc2Nyb2xsQmFyTWluSGVpZ2h0LCB0aGlzLnNjcm9sbEJhci5oZWlnaHQpXG4gICAgfVxuICAgIHRoaXMuc2Nyb2xsQmFyLmZhbGxiYWNrVG9Cb3VuZGFyeSgpXG4gIH1cblxuICAvLyDmjbLli5Xnmb7liIbmr5RcbiAgZ2V0IHNjcm9sbFBlcmNlbnQgKCkge1xuICAgIGxldCBkZWx0YSA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC0gdGhpcy5zY3JvbGxCYXIuaGVpZ2h0XG4gICAgcmV0dXJuIGRlbHRhID09PSAwID8gMSA6IHRoaXMuc2Nyb2xsQmFyLnkgLyBkZWx0YVxuICB9XG5cbiAgLy8g5o2y5YuV6Iez55m+5YiG5q+UXG4gIHNjcm9sbFRvIChwZXJjZW50KSB7XG4gICAgbGV0IGRlbHRhID0gdGhpcy5zY3JvbGxCYXJCZy5oZWlnaHQgLSB0aGlzLnNjcm9sbEJhci5oZWlnaHRcbiAgICBsZXQgeSA9IDBcbiAgICBpZiAoZGVsdGEgIT09IDApIHtcbiAgICAgIHkgPSBkZWx0YSAqIHBlcmNlbnRcbiAgICB9XG4gICAgdGhpcy5zY3JvbGxCYXIueSA9IHlcbiAgICB0aGlzLnNjcm9sbE1haW5WaWV3KClcbiAgfVxuXG4gIGdldCB3aW5kb3dXaWR0aCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpbmRvd1dpZHRoXG4gIH1cblxuICBnZXQgd2luZG93SGVpZ2h0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fd2luZG93SGVpZ2h0XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2Nyb2xsYWJsZVdpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uL2xpYi9WZWN0b3InXHJcblxyXG5pbXBvcnQga2V5Ym9hcmRKUyBmcm9tICdrZXlib2FyZGpzJ1xyXG5pbXBvcnQgeyBMRUZULCBVUCwgUklHSFQsIERPV04gfSBmcm9tICcuLi9jb25maWcvY29udHJvbCdcclxuXHJcbmNvbnN0IEFMTF9LRVlTID0gW1JJR0hULCBMRUZULCBVUCwgRE9XTl1cclxuXHJcbmNsYXNzIFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsIGV4dGVuZHMgQ29udGFpbmVyIHtcclxuICBjb25zdHJ1Y3RvciAoeyB4LCB5LCByYWRpdXMgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcclxuXHJcbiAgICBsZXQgdG91Y2hBcmVhID0gbmV3IEdyYXBoaWNzKClcclxuICAgIHRvdWNoQXJlYS5iZWdpbkZpbGwoMHhGMkYyRjIsIDAuNSlcclxuICAgIHRvdWNoQXJlYS5kcmF3Q2lyY2xlKDAsIDAsIHJhZGl1cylcclxuICAgIHRvdWNoQXJlYS5lbmRGaWxsKClcclxuICAgIHRoaXMuYWRkQ2hpbGQodG91Y2hBcmVhKVxyXG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXNcclxuXHJcbiAgICB0aGlzLnNldHVwVG91Y2goKVxyXG4gIH1cclxuXHJcbiAgc2V0dXBUb3VjaCAoKSB7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgbGV0IGYgPSB0aGlzLm9uVG91Y2guYmluZCh0aGlzKVxyXG4gICAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXHJcbiAgICB0aGlzLm9uKCd0b3VjaGVuZCcsIGYpXHJcbiAgICB0aGlzLm9uKCd0b3VjaG1vdmUnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2hlbmRvdXRzaWRlJywgZilcclxuICB9XHJcblxyXG4gIG9uVG91Y2ggKGUpIHtcclxuICAgIGxldCB0eXBlID0gZS50eXBlXHJcbiAgICBsZXQgcHJvcGFnYXRpb24gPSBmYWxzZVxyXG4gICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxyXG4gICAgICAgIHRoaXMuZHJhZyA9IGUuZGF0YS5nbG9iYWwuY2xvbmUoKVxyXG4gICAgICAgIHRoaXMuY3JlYXRlRHJhZ1BvaW50KClcclxuICAgICAgICB0aGlzLm9yaWdpblBvc2l0aW9uID0ge1xyXG4gICAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgICAgeTogdGhpcy55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ3RvdWNoZW5kJzpcclxuICAgICAgY2FzZSAndG91Y2hlbmRvdXRzaWRlJzpcclxuICAgICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICAgICAgdGhpcy5kZXN0cm95RHJhZ1BvaW50KClcclxuICAgICAgICAgIHRoaXMucmVsZWFzZUtleXMoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICd0b3VjaG1vdmUnOlxyXG4gICAgICAgIGlmICghdGhpcy5kcmFnKSB7XHJcbiAgICAgICAgICBwcm9wYWdhdGlvbiA9IHRydWVcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucHJlc3NLZXlzKGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpKVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcbiAgICBpZiAoIXByb3BhZ2F0aW9uKSB7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNyZWF0ZURyYWdQb2ludCAoKSB7XHJcbiAgICBsZXQgZHJhZ1BvaW50ID0gbmV3IEdyYXBoaWNzKClcclxuICAgIGRyYWdQb2ludC5iZWdpbkZpbGwoMHhGMkYyRjIsIDAuNSlcclxuICAgIGRyYWdQb2ludC5kcmF3Q2lyY2xlKDAsIDAsIDIwKVxyXG4gICAgZHJhZ1BvaW50LmVuZEZpbGwoKVxyXG4gICAgdGhpcy5hZGRDaGlsZChkcmFnUG9pbnQpXHJcbiAgICB0aGlzLmRyYWdQb2ludCA9IGRyYWdQb2ludFxyXG4gIH1cclxuXHJcbiAgZGVzdHJveURyYWdQb2ludCAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUNoaWxkKHRoaXMuZHJhZ1BvaW50KVxyXG4gICAgdGhpcy5kcmFnUG9pbnQuZGVzdHJveSgpXHJcbiAgfVxyXG5cclxuICBwcmVzc0tleXMgKG5ld1BvaW50KSB7XHJcbiAgICB0aGlzLnJlbGVhc2VLZXlzKClcclxuICAgIC8vIOaEn+aHiemdiOaVj+W6plxyXG4gICAgbGV0IHRocmVzaG9sZCA9IDMwXHJcblxyXG4gICAgbGV0IHZlY3RvciA9IFZlY3Rvci5mcm9tUG9pbnQobmV3UG9pbnQpXHJcbiAgICBsZXQgZGVnID0gdmVjdG9yLmRlZ1xyXG4gICAgbGV0IGxlbiA9IHZlY3Rvci5sZW5ndGhcclxuXHJcbiAgICBpZiAobGVuIDwgdGhyZXNob2xkKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgbGV0IGRlZ0FicyA9IE1hdGguYWJzKGRlZylcclxuICAgIGxldCBkeCA9IGRlZ0FicyA8IDY3LjUgPyBSSUdIVCA6IChkZWdBYnMgPiAxMTIuNSA/IExFRlQgOiBmYWxzZSlcclxuICAgIGxldCBkeSA9IGRlZ0FicyA8IDIyLjUgfHwgZGVnQWJzID4gMTU3LjUgPyBmYWxzZSA6IChkZWcgPCAwID8gVVAgOiBET1dOKVxyXG5cclxuICAgIGlmIChkeCB8fCBkeSkge1xyXG4gICAgICBpZiAoZHgpIHtcclxuICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KGR4KVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChkeSkge1xyXG4gICAgICAgIGtleWJvYXJkSlMucHJlc3NLZXkoZHkpXHJcbiAgICAgIH1cclxuICAgICAgdmVjdG9yLm11bHRpcGx5U2NhbGFyKHRoaXMucmFkaXVzIC8gbGVuKVxyXG4gICAgICB0aGlzLmRyYWdQb2ludC5wb3NpdGlvbi5zZXQoXHJcbiAgICAgICAgdmVjdG9yLngsXHJcbiAgICAgICAgdmVjdG9yLnlcclxuICAgICAgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVsZWFzZUtleXMgKCkge1xyXG4gICAgQUxMX0tFWVMuZm9yRWFjaChrZXkgPT4ga2V5Ym9hcmRKUy5yZWxlYXNlS2V5KGtleSkpXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ1RvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVG91Y2hEaXJlY3Rpb25Db250cm9sUGFuZWxcclxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uL2xpYi9WZWN0b3InXHJcblxyXG5pbXBvcnQgZ2xvYmFsRXZlbnRNYW5hZ2VyIGZyb20gJy4uL2xpYi9nbG9iYWxFdmVudE1hbmFnZXInXHJcblxyXG5jbGFzcyBUb3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxyXG5cclxuICAgIGxldCB0b3VjaEFyZWEgPSBuZXcgR3JhcGhpY3MoKVxyXG4gICAgdG91Y2hBcmVhLmJlZ2luRmlsbCgweEYyRjJGMiwgMC41KVxyXG4gICAgdG91Y2hBcmVhLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpXHJcbiAgICB0b3VjaEFyZWEuZW5kRmlsbCgpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRvdWNoQXJlYSlcclxuXHJcbiAgICB0aGlzLnNldHVwVG91Y2goKVxyXG4gIH1cclxuXHJcbiAgc2V0dXBUb3VjaCAoKSB7XHJcbiAgICB0aGlzLmNlbnRlciA9IG5ldyBWZWN0b3IodGhpcy53aWR0aCAvIDIsIHRoaXMuaGVpZ2h0IC8gMilcclxuICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICBsZXQgZiA9IHRoaXMub25Ub3VjaC5iaW5kKHRoaXMpXHJcbiAgICB0aGlzLm9uKCd0b3VjaHN0YXJ0JywgZilcclxuICB9XHJcblxyXG4gIG9uVG91Y2ggKGUpIHtcclxuICAgIGxldCBwb2ludGVyID0gZS5kYXRhLmdldExvY2FsUG9zaXRpb24odGhpcylcclxuICAgIGxldCB2ZWN0b3IgPSBWZWN0b3IuZnJvbVBvaW50KHBvaW50ZXIpLnN1Yih0aGlzLmNlbnRlcilcclxuICAgIGdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KCdyb3RhdGUnLCB2ZWN0b3IpXHJcbiAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgnZmlyZScpXHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ1RvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWxcclxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5jbGFzcyBWYWx1ZUJhciBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcigpXG4gICAgbGV0IHsgeCwgeSwgd2lkdGgsIGhlaWdodCwgY29sb3IgfSA9IG9wdFxuXG4gICAgLy8gYmFja2dyb3VuZFxuICAgIGxldCBocEJhckJnID0gbmV3IEdyYXBoaWNzKClcbiAgICBocEJhckJnLmJlZ2luRmlsbCgweEEyQTJBMilcbiAgICBocEJhckJnLmxpbmVTdHlsZSgxLCAweDIyMjIyMiwgMSlcbiAgICBocEJhckJnLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpXG4gICAgaHBCYXJCZy5lbmRGaWxsKClcblxuICAgIC8vIG1hc2tcbiAgICBsZXQgbWFzayA9IG5ldyBHcmFwaGljcygpXG4gICAgbWFzay5iZWdpbkZpbGwoMHhGRkZGRkYpXG4gICAgbWFzay5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxuICAgIG1hc2suZW5kRmlsbCgpXG4gICAgdGhpcy5hZGRDaGlsZChtYXNrKVxuICAgIHRoaXMuYmFyTWFzayA9IG1hc2tcblxuICAgIHRoaXMuYWRkQ2hpbGQoaHBCYXJCZylcbiAgICB0aGlzLmhwQmFyQmcgPSBocEJhckJnXG5cbiAgICAvLyBiYXJcbiAgICB0aGlzLl9yZW5kZXJCYXIoe2NvbG9yLCB3aWR0aCwgaGVpZ2h0fSlcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxuICAgIHRoaXMuX29wdCA9IG9wdFxuXG4gICAgdGhpcy5vbigndmFsdWUtY2hhbmdlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSlcbiAgfVxuXG4gIHVwZGF0ZSAocmF0ZSkge1xuICAgIHRoaXMucmVtb3ZlQ2hpbGQodGhpcy5ocEJhcklubmVyKVxuICAgIHRoaXMuaHBCYXJJbm5lci5kZXN0cm95KClcbiAgICBsZXQgeyBjb2xvciwgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fb3B0XG4gICAgdGhpcy5fcmVuZGVyQmFyKHtcbiAgICAgIGNvbG9yLFxuICAgICAgd2lkdGg6IHdpZHRoICogcmF0ZSxcbiAgICAgIGhlaWdodFxuICAgIH0pXG4gIH1cblxuICBfcmVuZGVyQmFyICh7Y29sb3IsIHdpZHRoLCBoZWlnaHR9KSB7XG4gICAgbGV0IGhwQmFySW5uZXIgPSBuZXcgR3JhcGhpY3MoKVxuICAgIGhwQmFySW5uZXIuYmVnaW5GaWxsKGNvbG9yKVxuICAgIGhwQmFySW5uZXIuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodClcbiAgICBocEJhcklubmVyLmVuZEZpbGwoKVxuICAgIGhwQmFySW5uZXIubWFzayA9IHRoaXMuYmFyTWFza1xuXG4gICAgdGhpcy5hZGRDaGlsZChocEJhcklubmVyKVxuICAgIHRoaXMuaHBCYXJJbm5lciA9IGhwQmFySW5uZXJcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWYWx1ZUJhclxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5jbGFzcyBXaW5kb3cgZXh0ZW5kcyBDb250YWluZXIge1xuICBjb25zdHJ1Y3RvciAoeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcblxuICAgIGxldCBsaW5lV2lkdGggPSAzXG5cbiAgICBsZXQgd2luZG93QmcgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHdpbmRvd0JnLmJlZ2luRmlsbCgweEYyRjJGMilcbiAgICB3aW5kb3dCZy5saW5lU3R5bGUobGluZVdpZHRoLCAweDIyMjIyMiwgMSlcbiAgICB3aW5kb3dCZy5kcmF3Um91bmRlZFJlY3QoXG4gICAgICAwLCAwLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICA1KVxuICAgIHdpbmRvd0JnLmVuZEZpbGwoKVxuICAgIHRoaXMuYWRkQ2hpbGQod2luZG93QmcpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2luZG93XG4iLCJjb25zdCBPUFQgPSBTeW1ib2woJ29wdCcpXG5cbmZ1bmN0aW9uIF9lbmFibGVEcmFnZ2FibGUgKCkge1xuICB0aGlzLmRyYWcgPSBmYWxzZVxuICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxuICBsZXQgZiA9IF9vblRvdWNoLmJpbmQodGhpcylcbiAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXG4gIHRoaXMub24oJ3RvdWNoZW5kJywgZilcbiAgdGhpcy5vbigndG91Y2htb3ZlJywgZilcbiAgdGhpcy5vbigndG91Y2hlbmRvdXRzaWRlJywgZilcbiAgdGhpcy5vbignbW91c2Vkb3duJywgZilcbiAgdGhpcy5vbignbW91c2V1cCcsIGYpXG4gIHRoaXMub24oJ21vdXNlbW92ZScsIGYpXG4gIHRoaXMub24oJ21vdXNldXBvdXRzaWRlJywgZilcbn1cblxuZnVuY3Rpb24gX29uVG91Y2ggKGUpIHtcbiAgbGV0IHR5cGUgPSBlLnR5cGVcbiAgbGV0IHByb3BhZ2F0aW9uID0gZmFsc2VcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAndG91Y2hzdGFydCc6XG4gICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgIHRoaXMuZHJhZyA9IGUuZGF0YS5nbG9iYWwuY2xvbmUoKVxuICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbiA9IHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnlcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndG91Y2hlbmQnOlxuICAgIGNhc2UgJ3RvdWNoZW5kb3V0c2lkZSc6XG4gICAgY2FzZSAnbW91c2V1cCc6XG4gICAgY2FzZSAnbW91c2V1cG91dHNpZGUnOlxuICAgICAgdGhpcy5kcmFnID0gZmFsc2VcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndG91Y2htb3ZlJzpcbiAgICBjYXNlICdtb3VzZW1vdmUnOlxuICAgICAgaWYgKCF0aGlzLmRyYWcpIHtcbiAgICAgICAgcHJvcGFnYXRpb24gPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBsZXQgbmV3UG9pbnQgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcbiAgICAgIHRoaXMucG9zaXRpb24uc2V0KFxuICAgICAgICB0aGlzLm9yaWdpblBvc2l0aW9uLnggKyBuZXdQb2ludC54IC0gdGhpcy5kcmFnLngsXG4gICAgICAgIHRoaXMub3JpZ2luUG9zaXRpb24ueSArIG5ld1BvaW50LnkgLSB0aGlzLmRyYWcueVxuICAgICAgKVxuICAgICAgX2ZhbGxiYWNrVG9Cb3VuZGFyeS5jYWxsKHRoaXMpXG4gICAgICB0aGlzLmVtaXQoJ2RyYWcnKSAvLyBtYXliZSBjYW4gcGFzcyBwYXJhbSBmb3Igc29tZSByZWFzb246IGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpXG4gICAgICBicmVha1xuICB9XG4gIGlmICghcHJvcGFnYXRpb24pIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cbn1cblxuLy8g6YCA5Zue6YKK55WMXG5mdW5jdGlvbiBfZmFsbGJhY2tUb0JvdW5kYXJ5ICgpIHtcbiAgbGV0IHsgd2lkdGggPSB0aGlzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmhlaWdodCwgYm91bmRhcnkgfSA9IHRoaXNbT1BUXVxuICB0aGlzLnggPSBNYXRoLm1heCh0aGlzLngsIGJvdW5kYXJ5LngpXG4gIHRoaXMueCA9IE1hdGgubWluKHRoaXMueCwgYm91bmRhcnkueCArIGJvdW5kYXJ5LndpZHRoIC0gd2lkdGgpXG4gIHRoaXMueSA9IE1hdGgubWF4KHRoaXMueSwgYm91bmRhcnkueSlcbiAgdGhpcy55ID0gTWF0aC5taW4odGhpcy55LCBib3VuZGFyeS55ICsgYm91bmRhcnkuaGVpZ2h0IC0gaGVpZ2h0KVxufVxuY2xhc3MgV3JhcHBlciB7XG4gIC8qKlxuICAgKiBkaXNwbGF5T2JqZWN0OiB3aWxsIHdyYXBwZWQgRGlzcGxheU9iamVjdFxuICAgKiBvcHQ6IHtcbiAgICogIGJvdW5kYXJ5OiDmi5bmm7PpgornlYwgeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH1cbiAgICogIFssIHdpZHRoXTog6YKK55WM56Kw5pKe5a+sKGRlZmF1bHQ6IGRpc3BsYXlPYmplY3Qud2lkdGgpXG4gICAqICBbLCBoZWlnaHRdOiDpgornlYznorDmkp7pq5goZGVmYXVsdDogZGlzcGxheU9iamVjdC5oZWlnaHQpXG4gICAqICB9XG4gICAqL1xuICBzdGF0aWMgZHJhZ2dhYmxlIChkaXNwbGF5T2JqZWN0LCBvcHQpIHtcbiAgICBkaXNwbGF5T2JqZWN0W09QVF0gPSBvcHRcbiAgICBfZW5hYmxlRHJhZ2dhYmxlLmNhbGwoZGlzcGxheU9iamVjdClcbiAgICBkaXNwbGF5T2JqZWN0LmZhbGxiYWNrVG9Cb3VuZGFyeSA9IF9mYWxsYmFja1RvQm91bmRhcnlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXcmFwcGVyXG4iXX0=
