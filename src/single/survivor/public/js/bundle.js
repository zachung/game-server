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

},{"./lib/Application":10,"./scenes/LoadingScene":54}],8:[function(require,module,exports){
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
var ABILITY_MANA = exports.ABILITY_MANA = Symbol('mana');
var ABILITIES_ALL = exports.ABILITIES_ALL = [ABILITY_MOVE, ABILITY_CAMERA, ABILITY_OPERATE, ABILITY_KEY_MOVE, ABILITY_HEALTH, ABILITY_CARRY, ABILITY_LEARN, ABILITY_PLACE, ABILITY_KEY_PLACE, ABILITY_KEY_FIRE, ABILITY_ROTATE, ABILITY_DAMAGE, ABILITY_MANA];

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
var SWITCH1 = exports.SWITCH1 = '1';
var SWITCH2 = exports.SWITCH2 = '2';
var SWITCH3 = exports.SWITCH3 = '3';
var SWITCH4 = exports.SWITCH4 = '4';
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

var _globalEventManager = require('../lib/globalEventManager');

var _globalEventManager2 = _interopRequireDefault(_globalEventManager);

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
  addObject: function addObject(object, bullet) {
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
    _this.life = 0;
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

      var addGameObject = function addGameObject(i, j, id, params) {
        var o = (0, _utils.instanceByItemId)(id, params);
        _this2.addGameObject(o, i * _constants.CEIL_SIZE, j * _constants.CEIL_SIZE);
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
        o.on('addObject', objectEvent.addObject.bind(_this2, o));
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
    value: function addPlayer(player, _ref3) {
      var _this3 = this;

      var _ref4 = _slicedToArray(_ref3, 2),
          i = _ref4[0],
          j = _ref4[1];

      // 註冊事件
      Object.entries(objectEvent).forEach(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            eventName = _ref6[0],
            handler = _ref6[1];

        var eInstance = handler.bind(_this3, player);
        player.on(eventName, eInstance);
        player.once('removed', player.off.bind(player, eventName, eInstance));
      });
      // 新增至地圖上
      this.addGameObject(player, i * _constants.CEIL_SIZE, j * _constants.CEIL_SIZE);

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
      this.objects[_constants.REPLY].forEach(function (o) {
        return o.tick(delta);
      });
      this.mapWorld.update(delta);
      this.willRemoved.forEach(function (child) {
        _this4.map.removeChild(child);
      });
      this.life += delta;
      if (this.life % 10 < 1) {
        _globalEventManager2.default.emit('fire');
      }
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

},{"../config/constants":8,"../lib/MapWorld":14,"../lib/globalEventManager":21,"./PIXI":17,"./utils":22}],13:[function(require,module,exports){
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
exports.calcApothem = calcApothem;

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

var _FireBolt = require('../objects/skills/FireBolt');

var _FireBolt2 = _interopRequireDefault(_FireBolt);

var _FireStar = require('../objects/skills/FireStar');

var _FireStar2 = _interopRequireDefault(_FireStar);

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

var PI = Math.PI;

// 0x0000 ~ 0x000f
var ItemsStatic = [_Air2.default, _Grass2.default, _Ground2.default];
// 0x0010 ~ 0x00ff
var ItemsStay = [
// 0x0010, 0x0011, 0x0012
_Wall2.default, _IronFence2.default, _Root2.default, _Tree2.default];
// 0x0100 ~ 0x01ff
var ItemsOther = [_Treasure2.default, _Door2.default, _Torch2.default, _GrassDecorate2.default, _FireBolt2.default, _WallShootBolt2.default, _FireStar2.default];
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

},{"../objects/Air":23,"../objects/Door":26,"../objects/Grass":28,"../objects/GrassDecorate1":29,"../objects/Ground":30,"../objects/IronFence":31,"../objects/Root":32,"../objects/Torch":33,"../objects/Treasure":34,"../objects/Tree":35,"../objects/Wall":36,"../objects/WallShootBolt":37,"../objects/abilities/Camera":39,"../objects/abilities/Move":48,"../objects/abilities/Operate":49,"../objects/skills/FireBolt":51,"../objects/skills/FireStar":52}],23:[function(require,module,exports){
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

var Bullet = function (_GameObject) {
  _inherits(Bullet, _GameObject);

  function Bullet() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$speed = _ref.speed,
        speed = _ref$speed === undefined ? 1 : _ref$speed,
        _ref$damage = _ref.damage,
        damage = _ref$damage === undefined ? 1 : _ref$damage,
        _ref$force = _ref.force,
        force = _ref$force === undefined ? 0 : _ref$force,
        _ref$hp = _ref.hp,
        hp = _ref$hp === undefined ? 1 : _ref$hp;

    _classCallCheck(this, Bullet);

    var _this = _possibleConstructorReturn(this, (Bullet.__proto__ || Object.getPrototypeOf(Bullet)).call(this, _Texture2.default.Bullet));

    new _Learn2.default().carryBy(_this).learn(new _Move2.default([speed, 0])).learn(new _Health2.default(hp)).learn(new _Damage2.default([damage, force]));

    _this.on('collide', _this.actionWith.bind(_this));
    _this.on('die', _this.onDie.bind(_this));
    return _this;
  }

  _createClass(Bullet, [{
    key: 'bodyOpt',
    value: function bodyOpt() {
      return {
        isSensor: true,
        collisionFilter: {
          category: 4,
          mask: 5
        }
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
      // 對方不是 sensor(代表實體物件, i.e. Wall/Player)，自我毀滅
      if (!operator.bodyOpt().isSensor) {
        this.onDie();
      }
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

},{"../config/constants":8,"../lib/Texture":19,"../objects/abilities/Damage":41,"../objects/abilities/Health":43,"../objects/abilities/Move":48,"./GameObject":27,"./abilities/Learn":46}],25:[function(require,module,exports){
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

var _Fire = require('../objects/abilities/Fire');

var _Fire2 = _interopRequireDefault(_Fire);

var _KeyFire = require('../objects/abilities/KeyFire');

var _KeyFire2 = _interopRequireDefault(_KeyFire);

var _Rotate = require('../objects/abilities/Rotate');

var _Rotate2 = _interopRequireDefault(_Rotate);

var _Health = require('../objects/abilities/Health');

var _Health2 = _interopRequireDefault(_Health);

var _Mana = require('../objects/abilities/Mana');

var _Mana2 = _interopRequireDefault(_Mana);

var _FireBolt = require('../objects/skills/FireBolt');

var _FireBolt2 = _interopRequireDefault(_FireBolt);

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
    new _Learn2.default().carryBy(_this).learn(new _Move2.default([1])).learn(new _KeyMove2.default()).learn(new _Camera2.default(5)).learn(carry).learn(new _Fire2.default()).learn(new _Rotate2.default()).learn(new _KeyFire2.default()).learn(new _Health2.default(20)).learn(new _Mana2.default(20));

    carry.take(new _FireBolt2.default(0), Infinity);
    return _this;
  }

  _createClass(Cat, [{
    key: 'bodyOpt',
    value: function bodyOpt() {
      return {
        collisionFilter: {
          category: 1,
          mask: 7
        }
      };
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      this[_constants.ABILITY_MANA].tick(delta);
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

},{"../config/constants":8,"../lib/Texture":19,"../objects/abilities/Camera":39,"../objects/abilities/Carry":40,"../objects/abilities/Fire":42,"../objects/abilities/Health":43,"../objects/abilities/KeyFire":44,"../objects/abilities/KeyMove":45,"../objects/abilities/Mana":47,"../objects/abilities/Move":48,"../objects/abilities/Rotate":50,"../objects/skills/FireBolt":51,"./GameObject":27,"./abilities/Learn":46}],26:[function(require,module,exports){
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
}

function onPosition() {
  var position = this.positionEx;
  this.position.copy(position);
}

function bodyOpt() {
  var moveAbility = this[_constants.ABILITY_MOVE];
  var friction = moveAbility && moveAbility.friction !== undefined ? moveAbility.friction : 0.1;
  var frictionAir = moveAbility && moveAbility.frictionAir !== undefined ? moveAbility.frictionAir : 0.01;
  var density = this.density ? this.density : 0.001;
  return {
    isStatic: this.type === _constants.STAY,
    friction: friction,
    frictionAir: frictionAir,
    frictionStatic: friction,
    density: density
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

    _this.scaleEx = new _PIXI.ObservablePoint(onScale, _this);
    _this.positionEx = new _PIXI.ObservablePoint(onPosition, _this);
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
    key: 'bodyOpt',
    value: function bodyOpt() {
      return {
        isSensor: true,
        collisionFilter: {
          category: 2,
          mask: 1
        }
      };
    }
  }, {
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

var _FireBolt = require('../objects/skills/FireBolt');

var _FireBolt2 = _interopRequireDefault(_FireBolt);

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
    new _Learn2.default().carryBy(_this).learn(new _Fire2.default()).learn(carry).learn(new _Health2.default(10));

    carry.take(new _FireBolt2.default(0), Infinity);

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
      if (this.life % 3 !== 0) {
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

},{"../config/constants":8,"../lib/Texture":19,"../objects/abilities/Carry":40,"../objects/abilities/Fire":42,"../objects/abilities/Health":43,"../objects/skills/FireBolt":51,"./GameObject":27,"./abilities/Learn":46}],38:[function(require,module,exports){
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

function newSlot(skill, count) {
  return {
    skill: skill,
    count: count,
    toString: function toString() {
      return [skill.toString(), '(', this.count, ')'].join('');
    }
  };
}

var Carry = function (_Ability) {
  _inherits(Carry, _Ability);

  function Carry(initSlots) {
    _classCallCheck(this, Carry);

    var _this = _possibleConstructorReturn(this, (Carry.__proto__ || Object.getPrototypeOf(Carry)).call(this));

    _this.current = 0;
    _this.bags = Array(initSlots).fill();
    return _this;
  }

  _createClass(Carry, [{
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(Carry.prototype.__proto__ || Object.getPrototypeOf(Carry.prototype), 'carryBy', this).call(this, owner);
      this.owner = owner;
      owner[_constants.ABILITY_CARRY] = this;
    }

    // 暫時沒有限制施放次數

  }, {
    key: 'take',
    value: function take(skill, count) {
      var _this2 = this;

      var owner = this.owner;
      if (skill instanceof _Ability3.default && owner[_constants.ABILITY_LEARN]) {
        // 取得能力
        owner[_constants.ABILITY_LEARN].learn(skill);
        return;
      }
      count = count === -1 ? Infinity : count;
      var key = skill.toString();
      var firstEmptySlot = void 0;
      var found = this.bags.some(function (slot, si) {
        // 暫存第一個空格
        if (slot === undefined && firstEmptySlot === undefined) {
          firstEmptySlot = si;
        }
        // 技能升級(同類型)
        if (slot && slot.skill.toString() === key && skill.level > slot.skill.level) {
          _this2.bags[si] = newSlot(skill, count);
          return true;
        }
        return false;
      });
      if (!found) {
        if (firstEmptySlot === undefined) {
          // 沒有空格可放物品
          owner.say('no empty slot for new skill got.');
          return;
        }
        // 放入第一個空格
        this.bags[firstEmptySlot] = newSlot(skill, count);
      }
      owner.emit('inventory-modified', skill);
    }
  }, {
    key: 'getSlotItem',
    value: function getSlotItem(slotInx) {
      var si = void 0;
      // 照著包包加入順序查找
      var found = this.bags.find(function (slot, s) {
        si = s;
        return slotInx-- === 0;
      });
      var skill = void 0;
      if (found) {
        found = this.bags[si];
        skill = found.skill;
        // 取出後減一
        if (--found.count === 0) {
          this.bags[si] = undefined;
        }
        this.owner.emit('inventory-modified', skill);
      }
      return skill;
    }
  }, {
    key: 'getCurrent',
    value: function getCurrent() {
      var found = this.bags[this.current];
      var skill = void 0;
      if (found) {
        skill = found.skill;
        // 取出後減一
        if (--found.count === 0) {
          this.bags[this.current] = undefined;
        }
        this.owner.emit('inventory-modified', skill);
      }
      return skill;
    }
  }, {
    key: 'setCurrent',
    value: function setCurrent(current) {
      this.current = current;
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

var Fire = function (_Ability) {
  _inherits(Fire, _Ability);

  function Fire() {
    _classCallCheck(this, Fire);

    return _possibleConstructorReturn(this, (Fire.__proto__ || Object.getPrototypeOf(Fire)).apply(this, arguments));
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
    value: function fire(rad) {
      var caster = this.owner;

      var carryAbility = caster[_constants.ABILITY_CARRY];
      var BulletType = carryAbility.getCurrent();
      if (!BulletType) {
        // no skill at inventory
        console.log('no skill at inventory');
        return;
      }
      BulletType.cast({ caster: caster, rad: rad });
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

},{"../../config/constants":8,"./Ability":38}],43:[function(require,module,exports){
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
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    _classCallCheck(this, Health);

    var _this = _possibleConstructorReturn(this, (Health.__proto__ || Object.getPrototypeOf(Health)).call(this));

    _this.value = value;
    _this.valueMax = value;
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
      var preHp = this.value;
      var sufHp = Math.max(this.value - damage, 0);
      var vector = _Vector2.default.fromPoint(this.owner.position).sub(from.position).setLength(force);

      this.owner.say([this.owner.toString(), ' get hurt ', damage, ': ', preHp, ' -> ', sufHp].join(''));

      var moveAbility = this.owner[_constants.ABILITY_MOVE];
      if (moveAbility) {
        moveAbility.punch(vector);
      }

      this.value = sufHp;

      this.owner.emit('health-change');
      if (this.value <= 0) {
        this.owner.emit('die');
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return ['Health: ', this.value, ' / ', this.valueMax].join('');
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

},{"../../config/constants":8,"./Ability":38}],47:[function(require,module,exports){
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

var Mana = function (_Ability) {
  _inherits(Mana, _Ability);

  function Mana() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var refill = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.05;

    _classCallCheck(this, Mana);

    var _this = _possibleConstructorReturn(this, (Mana.__proto__ || Object.getPrototypeOf(Mana)).call(this));

    _this.value = value;
    _this.valueMax = value;
    _this.refill = refill;
    return _this;
  }

  _createClass(Mana, [{
    key: 'carryBy',
    value: function carryBy(owner) {
      _get(Mana.prototype.__proto__ || Object.getPrototypeOf(Mana.prototype), 'carryBy', this).call(this, owner);
      this.owner = owner;
      owner[_constants.ABILITY_MANA] = this;
    }
  }, {
    key: 'isEnough',
    value: function isEnough(value) {
      return this.value - value >= 0;
    }
  }, {
    key: 'reduce',
    value: function reduce(value) {
      this.value = Math.max(this.value - value, 0);
      this.owner.emit('mana-change');
    }
  }, {
    key: 'add',
    value: function add(value) {
      this.value = Math.min(this.value + value, this.valueMax);
      this.owner.emit('mana-change');
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      this.add(this.refill * delta);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return ['Mana: ', this.value, ' / ', this.valueMax].join('');
    }
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_MANA;
    }
  }]);

  return Mana;
}(_Ability3.default);

exports.default = Mana;

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
      if (!owner.body.isSensor) {
        // sensor 不會受力
        owner.body.world.forcesWaitForApply.push({ owner: owner, vector: vector });
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

},{"../../config/constants":8,"../../lib/Vector":20,"../../lib/globalEventManager":21,"./Ability":38}],51:[function(require,module,exports){
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

var _Skill2 = require('./Skill');

var _Skill3 = _interopRequireDefault(_Skill2);

var _Texture = require('../../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

var _Vector = require('../../lib/Vector');

var _Vector2 = _interopRequireDefault(_Vector);

var _constants = require('../../config/constants');

var _utils = require('../../lib/utils');

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

var levels = [
// cost, hp, reactForce, speed, damage, force, scale
[0.2, 1, 0.001, 6, 1, 0.01], [2, 3, 0.005, 10, 3, 5, 2]];

var FireBolt = function (_Skill) {
  _inherits(FireBolt, _Skill);

  function FireBolt() {
    _classCallCheck(this, FireBolt);

    return _possibleConstructorReturn(this, (FireBolt.__proto__ || Object.getPrototypeOf(FireBolt)).apply(this, arguments));
  }

  _createClass(FireBolt, [{
    key: 'sprite',
    value: function sprite() {
      return _Skill3.default.sprite(_Texture2.default.Bullet);
    }

    // 建立實體並釋放

  }, {
    key: 'cast',
    value: function cast(_ref) {
      var caster = _ref.caster,
          _ref$rad = _ref.rad,
          rad = _ref$rad === undefined ? undefined : _ref$rad;

      var _levels$level = _slicedToArray(levels[this.level], 7),
          cost = _levels$level[0],
          hp = _levels$level[1],
          reactForce = _levels$level[2],
          _levels$level$ = _levels$level[3],
          speed = _levels$level$ === undefined ? 1 : _levels$level$,
          _levels$level$2 = _levels$level[4],
          damage = _levels$level$2 === undefined ? 1 : _levels$level$2,
          _levels$level$3 = _levels$level[5],
          force = _levels$level$3 === undefined ? 0 : _levels$level$3,
          _levels$level$4 = _levels$level[6],
          scale = _levels$level$4 === undefined ? 1 : _levels$level$4;

      if (!this._cost(caster, cost)) {
        return;
      }
      var bullet = new _Bullet2.default({ speed: speed, damage: damage, force: force, hp: hp });

      // set direction
      if (rad === undefined) {
        // 如果沒指定方向，就用目前面對方向
        var rotateAbility = caster[_constants.ABILITY_ROTATE];
        rad = rotateAbility ? rotateAbility.faceRad : 0;
      }
      var vector = _Vector2.default.fromRadLength(rad, 1);
      bullet.scale.set(scale);
      bullet.setOwner(caster);

      // set position
      var rectLen = (0, _utils.calcApothem)(caster, rad + caster.rotation);
      var bulletLen = bullet.height / 2; // 射出角等於自身旋角，所以免去運算
      var len = rectLen + bulletLen;
      var position = _Vector2.default.fromRadLength(rad, len).add(_Vector2.default.fromPoint(caster.positionEx));
      bullet.positionEx.set(position.x, position.y);

      bullet.once('added', function () {
        bullet.setDirection(vector);

        var moveAbility = caster[_constants.ABILITY_MOVE];
        if (moveAbility) {
          moveAbility.punch(vector.clone().setLength(reactForce).invert());
        }
      });

      caster.emit('addObject', bullet);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'FireBolt';
    }
  }]);

  return FireBolt;
}(_Skill3.default);

exports.default = FireBolt;

},{"../../config/constants":8,"../../lib/Texture":19,"../../lib/Vector":20,"../../lib/utils":22,"../Bullet":24,"./Skill":53}],52:[function(require,module,exports){
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

var _PIXI = require('../../lib/PIXI');

var _Skill2 = require('./Skill');

var _Skill3 = _interopRequireDefault(_Skill2);

var _Texture = require('../../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

var _Bullet = require('../Bullet');

var _Bullet2 = _interopRequireDefault(_Bullet);

var _Vector = require('../../lib/Vector');

var _Vector2 = _interopRequireDefault(_Vector);

var _constants = require('../../config/constants');

var _utils = require('../../lib/utils');

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

var PI2 = Math.PI * 2;
var levels = [
// cost, boltCount, hp, reactForce, speed, damage, force, scale
[0.8, 8, 1, 6, 1, 0.01], [0.8, 16, 3, 10, 3, 5, 2]];

var FireStar = function (_Skill) {
  _inherits(FireStar, _Skill);

  function FireStar() {
    _classCallCheck(this, FireStar);

    return _possibleConstructorReturn(this, (FireStar.__proto__ || Object.getPrototypeOf(FireStar)).apply(this, arguments));
  }

  _createClass(FireStar, [{
    key: 'sprite',
    value: function sprite() {
      var container = new _PIXI.Container();
      var bullets = [];

      var _levels$level = _slicedToArray(levels[this.level], 2),
          boltCount = _levels$level[1];

      for (var rad = 0, maxRad = PI2; rad < maxRad; rad += PI2 / boltCount) {
        var bullet = _Skill3.default.sprite(_Texture2.default.Bullet);
        bullet.anchor.set(0.3, 0.5);
        bullet.rotation = rad;
        bullet.position.set(bullet.width * 0.7, bullet.width * 0.7);
        bullets.push(bullet);
      }

      container.addChild.apply(container, bullets);

      return container;
    }

    // 建立實體並釋放

  }, {
    key: 'cast',
    value: function cast(_ref) {
      var caster = _ref.caster,
          _ref$rad = _ref.rad,
          rad = _ref$rad === undefined ? undefined : _ref$rad;

      var _levels$level2 = _slicedToArray(levels[this.level], 7),
          cost = _levels$level2[0],
          boltCount = _levels$level2[1],
          hp = _levels$level2[2],
          _levels$level2$ = _levels$level2[3],
          speed = _levels$level2$ === undefined ? 1 : _levels$level2$,
          _levels$level2$2 = _levels$level2[4],
          damage = _levels$level2$2 === undefined ? 1 : _levels$level2$2,
          _levels$level2$3 = _levels$level2[5],
          force = _levels$level2$3 === undefined ? 0 : _levels$level2$3,
          _levels$level2$4 = _levels$level2[6],
          scale = _levels$level2$4 === undefined ? 1 : _levels$level2$4;

      if (!this._cost(caster, cost)) {
        return;
      }

      for (var _rad = 0, maxRad = PI2; _rad < maxRad; _rad += PI2 / boltCount) {
        var bullet = new _Bullet2.default({ speed: speed, damage: damage, force: force, hp: hp });
        bullet.scale.set(scale);
        this._genBullet(caster, bullet, _rad);
      }
    }
  }, {
    key: '_genBullet',
    value: function _genBullet(caster, bullet, rad) {
      // set direction
      if (rad === undefined) {
        // 如果沒指定方向，就用目前面對方向
        var rotateAbility = caster[_constants.ABILITY_ROTATE];
        rad = rotateAbility ? rotateAbility.faceRad : 0;
      }
      var vector = _Vector2.default.fromRadLength(rad, 1);
      bullet.setOwner(caster);

      // set position
      var rectLen = (0, _utils.calcApothem)(caster, rad + caster.rotation);
      var bulletLen = bullet.height / 2; // 射出角等於自身旋角，所以免去運算
      var len = rectLen + bulletLen;
      var position = _Vector2.default.fromRadLength(rad, len).add(_Vector2.default.fromPoint(caster.positionEx));
      bullet.positionEx.set(position.x, position.y);

      bullet.once('added', function () {
        bullet.setDirection(vector);
      });

      caster.emit('addObject', bullet);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'FireStar';
    }
  }]);

  return FireStar;
}(_Skill3.default);

exports.default = FireStar;

},{"../../config/constants":8,"../../lib/PIXI":17,"../../lib/Texture":19,"../../lib/Vector":20,"../../lib/utils":22,"../Bullet":24,"./Skill":53}],53:[function(require,module,exports){
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

var Skill = function () {
  function Skill(level) {
    _classCallCheck(this, Skill);

    this.level = level;
  }

  _createClass(Skill, [{
    key: '_cost',
    value: function _cost(caster, cost) {
      var manaAbility = caster[_constants.ABILITY_MANA];
      if (!manaAbility) {
        return true;
      }
      if (!manaAbility.isEnough(cost)) {
        return false;
      }
      manaAbility.reduce(cost);
      return true;
    }
  }], [{
    key: 'sprite',
    value: function sprite(texture) {
      return new _PIXI.Sprite(texture);
    }
  }]);

  return Skill;
}();

exports.default = Skill;

},{"../../config/constants":8,"../../lib/PIXI":17}],54:[function(require,module,exports){
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

var _Window = require('../ui/Window');

var _Window2 = _interopRequireDefault(_Window);

var _Button = require('../ui/Button');

var _Button2 = _interopRequireDefault(_Button);

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

var sceneWidth = void 0;
var sceneHeight = void 0;

var text = 'loading';

var LoadingScene = function (_Scene) {
  _inherits(LoadingScene, _Scene);

  function LoadingScene() {
    _classCallCheck(this, LoadingScene);

    var _this = _possibleConstructorReturn(this, (LoadingScene.__proto__ || Object.getPrototypeOf(LoadingScene)).call(this));

    _this.life = 0;
    _this.isLoading = false;
    _this.isLoaded = false;
    return _this;
  }

  _createClass(LoadingScene, [{
    key: 'create',
    value: function create() {
      sceneWidth = this.parent.width;
      sceneHeight = this.parent.height;
      this.showMain();
      this.startSingle();
    }
  }, {
    key: 'showMain',
    value: function showMain() {
      var mainContainer = new _PIXI.Container();
      mainContainer.position.set(sceneWidth / 4, sceneHeight / 4);

      var mainWindow = new _Window2.default({
        x: 0,
        y: 0,
        width: sceneWidth / 2,
        height: sceneHeight / 2
      });

      var buttonStart = new _Button2.default({
        x: mainWindow.width / 4,
        y: 10,
        width: mainWindow.width * 0.5,
        height: mainWindow.height * 0.25,
        literal: 'Single',
        on: this.startSingle.bind(this)
      });

      var buttonMulti = new _Button2.default({
        x: mainWindow.width / 4,
        y: buttonStart.y + buttonStart.height + 10,
        width: mainWindow.width * 0.5,
        height: mainWindow.height * 0.25,
        literal: 'Multi',
        on: this.startMulti.bind(this)
      });

      var fontSize = sceneWidth / 20;
      var style = new _PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: fontSize,
        fill: '#ff3300'
      });
      var textLoading = new _PIXI.Text(text, style);
      textLoading.anchor.set(1, 1);
      textLoading.position.set(mainWindow.width - fontSize / 2, mainWindow.height - fontSize / 2);
      textLoading.visible = false;

      mainContainer.addChild(mainWindow);
      mainContainer.addChild(buttonStart);
      mainContainer.addChild(buttonMulti);
      mainContainer.addChild(textLoading);
      this.addChild(mainContainer);

      this.textLoading = textLoading;
    }
  }, {
    key: 'startSingle',
    value: function startSingle() {
      var _this2 = this;

      this.showLoading();
      this.startLoad();
      var timer = void 0;
      timer = setInterval(function () {
        if (_this2.isLoaded) {
          clearInterval(timer);
          _this2.emit('changeScene', _PlayScene2.default, {
            mapFile: 'W0N0',
            position: [1, 1]
          });
        }
      }, 1000);
    }
  }, {
    key: 'startMulti',
    value: function startMulti() {
      this.textLoading.text = 'not support now';
      this.showLoading();
    }
  }, {
    key: 'showLoading',
    value: function showLoading() {
      this.textLoading.visible = true;
    }
  }, {
    key: 'startLoad',
    value: function startLoad() {
      var _this3 = this;

      this.isLoading = true;
      // load an image and run the `setup` function when it's done
      _PIXI.loader.add('images/terrain_atlas.json').add('images/base_out_atlas.json').add('images/fire_bolt.png').load(function () {
        _this3.isLoading = false;
        _this3.isLoaded = true;
      });
    }
  }, {
    key: 'tick',
    value: function tick(delta) {
      this.life += delta / 30; // blend speed
      if (this.isLoading) {
        this.textLoading.text = text + Array(Math.floor(this.life) % 4 + 1).join('.');
      }
    }
  }]);

  return LoadingScene;
}(_Scene3.default);

exports.default = LoadingScene;

},{"../lib/PIXI":17,"../lib/Scene":18,"../ui/Button":56,"../ui/Window":64,"./PlayScene":55}],55:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Map":12,"../lib/MapFog":13,"../lib/PIXI":17,"../lib/Scene":18,"../objects/Cat":25,"../ui/InventoryWindow":57,"../ui/MessageWindow":58,"../ui/PlayerWindow":59,"../ui/TouchDirectionControlPanel":61,"../ui/TouchOperationControlPanel":62}],56:[function(require,module,exports){
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

var Button = function (_Window) {
  _inherits(Button, _Window);

  function Button(opt) {
    _classCallCheck(this, Button);

    var _this = _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).call(this, opt));

    var width = opt.width,
        height = opt.height,
        _opt$fontSize = opt.fontSize,
        fontSize = _opt$fontSize === undefined ? height * 0.5 : _opt$fontSize,
        _opt$literal = opt.literal,
        literal = _opt$literal === undefined ? '' : _opt$literal,
        on = opt.on;

    _this._draw(fontSize, width, height);
    _this.setText(literal);
    if (on) {
      _this.listen(on);
    }
    return _this;
  }

  _createClass(Button, [{
    key: '_draw',
    value: function _draw(fontSize, width, height) {
      var style = new _PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: fontSize,
        fill: '#773300'
      });
      var text = new _PIXI.Text('', style);
      text.anchor.set(0.5, 0.5);
      text.position.set(width / 2, height / 2);
      this.addChild(text);
      this._text = text;
    }
  }, {
    key: 'setText',
    value: function setText(text) {
      this._text.text = text;
    }
  }, {
    key: 'listen',
    value: function listen(f) {
      this.interactive = true;
      this.on('click', f);
      this.on('tap', f);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Button';
    }
  }]);

  return Button;
}(_Window3.default);

exports.default = Button;

},{"../lib/PIXI":17,"./Window":64}],57:[function(require,module,exports){
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

var _Window2 = require('./Window');

var _Window3 = _interopRequireDefault(_Window2);

var _PIXI = require('../lib/PIXI');

var _constants = require('../config/constants');

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

var SLOTS = [_control.SWITCH1, _control.SWITCH2, _control.SWITCH3, _control.SWITCH4];

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

    var borderRect = new _PIXI.Graphics();
    borderRect.lineStyle(3, 0xFF0000, 1);
    borderRect.drawRect(0, 0, width, height);
    borderRect.endFill();
    borderRect.visible = false;
    _this.addChild(borderRect);

    _this.borderRect = borderRect;
    return _this;
  }

  _createClass(Slot, [{
    key: 'setContext',
    value: function setContext(skill, count) {
      this.clearContext();

      var width = this.width;
      var height = this.height;
      // 置中
      var sprite = skill.sprite();
      var maxSide = Math.max(sprite.width, sprite.height);
      var scale = width / maxSide;
      sprite.scale.set(scale);
      sprite.position.set(width / 2 - sprite.width / 2, height / 2 - sprite.height / 2);
      this.addChild(sprite);

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

      this.sprite = sprite;
      this.text = text;
    }
  }, {
    key: 'clearContext',
    value: function clearContext() {
      if (this.sprite) {
        this.sprite.destroy();
        this.text.destroy();
        delete this.sprite;
        delete this.text;
      }
    }
  }, {
    key: 'select',
    value: function select() {
      this.borderRect.visible = true;
    }
  }, {
    key: 'deselect',
    value: function deselect() {
      this.borderRect.visible = false;
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

    var _loop = function _loop() {
      var slot = new Slot(ceilOpt);
      var key = SLOTS[i];
      var press = function press() {
        _keyboardjs2.default.pressKey(key);
        _keyboardjs2.default.releaseKey(key);
      };
      slot.interactive = true;
      // tap for switch skill
      slot.on('click', press);
      slot.on('tap', press);
      _this2.addChild(slot);
      _this2.slotContainers.push(slot);
      ceilOpt.y += ceilSize + padding;
    };

    for (var i = 0; i < slotCount; i++) {
      _loop();
    }
    // default use first one
    _this2.slotContainers[0].select();

    _this2.onInventoryModified(player);
    _this2.setup(player);
    return _this2;
  }

  _createClass(InventoryWindow, [{
    key: 'onInventoryModified',
    value: function onInventoryModified(player) {
      var carryAbility = player[_constants.ABILITY_CARRY];
      if (!carryAbility) {
        // no inventory yet
        return;
      }
      var slots = [];
      var i = 0;
      carryAbility.bags.forEach(function (slot) {
        slots[i] = slot;
        i++;
      });
      this.slotContainers.forEach(function (container, i) {
        var slot = slots[i];
        if (slot) {
          container.setContext(slot.skill, slot.count);
        } else {
          container.clearContext();
        }
      });
    }
  }, {
    key: 'setup',
    value: function setup(player) {
      var _this3 = this;

      var carryAbility = player[_constants.ABILITY_CARRY];
      var bind = function bind(key) {
        var slotInx = SLOTS.indexOf(key);
        var handler = function handler(e) {
          e.preventRepeat();
          carryAbility.setCurrent(slotInx);
          _this3.slotContainers.forEach(function (container, i) {
            if (i === slotInx) {
              container.select();
            } else {
              container.deselect();
            }
          });
        };
        _keyboardjs2.default.bind(key, handler, function () {});
        return handler;
      };

      var binds = void 0;
      _keyboardjs2.default.setContext('');
      _keyboardjs2.default.withContext('', function () {
        binds = {
          SWITCH1: bind(_control.SWITCH1),
          SWITCH2: bind(_control.SWITCH2),
          SWITCH3: bind(_control.SWITCH3),
          SWITCH4: bind(_control.SWITCH4)
        };
      });

      player.once('removed', function () {
        Object.entries(binds).forEach(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 2),
              key = _ref3[0],
              handler = _ref3[1];

          _keyboardjs2.default.unbind(key, handler);
        });
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

},{"../config/constants":8,"../config/control":9,"../lib/PIXI":17,"./Window":64,"keyboardjs":2}],58:[function(require,module,exports){
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

},{"../lib/Messages":16,"../lib/PIXI":17,"./ScrollableWindow":60}],59:[function(require,module,exports){
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

var floor = Math.floor;

var ABILITIES_ALL = [_constants.ABILITY_MOVE, _constants.ABILITY_CAMERA, _constants.ABILITY_HEALTH];

var PlayerWindow = function (_Window) {
  _inherits(PlayerWindow, _Window);

  function PlayerWindow(opt) {
    _classCallCheck(this, PlayerWindow);

    var _this = _possibleConstructorReturn(this, (PlayerWindow.__proto__ || Object.getPrototypeOf(PlayerWindow)).call(this, opt));

    var player = opt.player;

    _this._opt = opt;

    _this.healthBar = _this.renderBar({ x: 5, y: 5, color: 0xD23200 });
    _this.manaBar = _this.renderBar({ x: 5, y: 17, color: 0x0032D2 });
    _this.renderAbility({ x: 5, y: 32 });

    _this.onAbilityCarry(player);

    player.on('ability-carry', _this.onAbilityCarry.bind(_this, player));
    player.on('health-change', _this.onHealthChange.bind(_this, player));
    player.on('mana-change', _this.onManaChange.bind(_this, player));
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
    key: 'renderBar',
    value: function renderBar(_ref2) {
      var x = _ref2.x,
          y = _ref2.y,
          color = _ref2.color;
      var width = this._opt.width;

      width /= 2;
      var height = 10;
      var container = new _PIXI.Container();
      container.position.set(x, y);
      var bar = new _ValueBar2.default({ width: width, height: height, color: color });
      var text = new _PIXI.Text('(10/20)', this._getTextStyle());
      text.x = width + 3;
      text.y = -3;

      container.addChild(bar);
      container.addChild(text);
      this.addChild(container);

      container.bar = bar;
      container.text = text;

      return container;
    }
  }, {
    key: '_getTextStyle',
    value: function _getTextStyle() {
      var _opt$fontSize = this._opt.fontSize,
          fontSize = _opt$fontSize === undefined ? 10 : _opt$fontSize;

      return new _PIXI.TextStyle({
        fontSize: fontSize,
        fill: 'green',
        lineHeight: fontSize
      });
    }
  }, {
    key: 'onAbilityCarry',
    value: function onAbilityCarry(player) {
      var _this2 = this;

      var i = 0;

      // 更新面板數據
      var contianer = this.abilityTextContainer;
      contianer.removeChildren();
      ABILITIES_ALL.forEach(function (abilitySymbol) {
        var ability = player.abilities[abilitySymbol];
        if (ability) {
          var text = new _PIXI.Text(ability.toString(), _this2._getTextStyle());
          text.y = i * text.height;

          contianer.addChild(text);

          i++;
        }
      });
    }
  }, {
    key: 'onHealthChange',
    value: function onHealthChange(player) {
      this._updateValueBar(this.healthBar, player[_constants.ABILITY_HEALTH]);
    }
  }, {
    key: 'onManaChange',
    value: function onManaChange(player) {
      this._updateValueBar(this.manaBar, player[_constants.ABILITY_MANA]);
    }
  }, {
    key: '_updateValueBar',
    value: function _updateValueBar(panel, ability) {
      if (!ability) {
        panel.visible = false;
        return;
      }
      if (!panel.visible) {
        panel.visible = true;
      }

      panel.text.text = ['(', floor(ability.value), '/', floor(ability.valueMax), ')'].join('');
      panel.bar.emit('value-change', ability.value / ability.valueMax);
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

},{"../config/constants":8,"../lib/PIXI":17,"./ValueBar":63,"./Window":64}],60:[function(require,module,exports){
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

},{"../lib/PIXI":17,"./Window":64,"./Wrapper":65}],61:[function(require,module,exports){
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

},{"../config/control":9,"../lib/PIXI":17,"../lib/Vector":20,"keyboardjs":2}],62:[function(require,module,exports){
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

},{"../lib/PIXI":17,"../lib/Vector":20,"../lib/globalEventManager":21}],63:[function(require,module,exports){
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

    var _opt$x = opt.x,
        x = _opt$x === undefined ? 0 : _opt$x,
        _opt$y = opt.y,
        y = _opt$y === undefined ? 0 : _opt$y,
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

},{"../lib/PIXI":17}],64:[function(require,module,exports){
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

},{"../lib/PIXI":17}],65:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tleWJvYXJkanMvbGliL2tleS1jb21iby5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9rZXlib2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9sb2NhbGUuanMiLCJub2RlX21vZHVsZXMva2V5Ym9hcmRqcy9sb2NhbGVzL3VzLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jb25maWcvY29uc3RhbnRzLmpzIiwic3JjL2NvbmZpZy9jb250cm9sLmpzIiwic3JjL2xpYi9BcHBsaWNhdGlvbi5qcyIsInNyYy9saWIvTGlnaHQuanMiLCJzcmMvbGliL01hcC5qcyIsInNyYy9saWIvTWFwRm9nLmpzIiwic3JjL2xpYi9NYXBXb3JsZC5qcyIsInNyYy9saWIvTWF0dGVyLmpzIiwic3JjL2xpYi9NZXNzYWdlcy5qcyIsInNyYy9saWIvUElYSS5qcyIsInNyYy9saWIvU2NlbmUuanMiLCJzcmMvbGliL1RleHR1cmUuanMiLCJzcmMvbGliL1ZlY3Rvci5qcyIsInNyYy9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyLmpzIiwic3JjL2xpYi91dGlscy5qcyIsInNyYy9vYmplY3RzL0Fpci5qcyIsInNyYy9vYmplY3RzL0J1bGxldC5qcyIsInNyYy9vYmplY3RzL0NhdC5qcyIsInNyYy9vYmplY3RzL0Rvb3IuanMiLCJzcmMvb2JqZWN0cy9HYW1lT2JqZWN0LmpzIiwic3JjL29iamVjdHMvR3Jhc3MuanMiLCJzcmMvb2JqZWN0cy9HcmFzc0RlY29yYXRlMS5qcyIsInNyYy9vYmplY3RzL0dyb3VuZC5qcyIsInNyYy9vYmplY3RzL0lyb25GZW5jZS5qcyIsInNyYy9vYmplY3RzL1Jvb3QuanMiLCJzcmMvb2JqZWN0cy9Ub3JjaC5qcyIsInNyYy9vYmplY3RzL1RyZWFzdXJlLmpzIiwic3JjL29iamVjdHMvVHJlZS5qcyIsInNyYy9vYmplY3RzL1dhbGwuanMiLCJzcmMvb2JqZWN0cy9XYWxsU2hvb3RCb2x0LmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0NhcnJ5LmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0RhbWFnZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9GaXJlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0hlYWx0aC5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9LZXlGaXJlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0tleU1vdmUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvTGVhcm4uanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvTWFuYS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9Nb3ZlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL09wZXJhdGUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvUm90YXRlLmpzIiwic3JjL29iamVjdHMvc2tpbGxzL0ZpcmVCb2x0LmpzIiwic3JjL29iamVjdHMvc2tpbGxzL0ZpcmVTdGFyLmpzIiwic3JjL29iamVjdHMvc2tpbGxzL1NraWxsLmpzIiwic3JjL3NjZW5lcy9Mb2FkaW5nU2NlbmUuanMiLCJzcmMvc2NlbmVzL1BsYXlTY2VuZS5qcyIsInNyYy91aS9CdXR0b24uanMiLCJzcmMvdWkvSW52ZW50b3J5V2luZG93LmpzIiwic3JjL3VpL01lc3NhZ2VXaW5kb3cuanMiLCJzcmMvdWkvUGxheWVyV2luZG93LmpzIiwic3JjL3VpL1Njcm9sbGFibGVXaW5kb3cuanMiLCJzcmMvdWkvVG91Y2hEaXJlY3Rpb25Db250cm9sUGFuZWwuanMiLCJzcmMvdWkvVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwuanMiLCJzcmMvdWkvVmFsdWVCYXIuanMiLCJzcmMvdWkvV2luZG93LmpzIiwic3JjL3VpL1dyYXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LENBQVQ7QUFDQSxPQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBUyxLQUFULENBQUEsRUFBaUIsU0FBQSxDQUFBLEdBQWEsU0FBYixLQUFBLEdBQTFCLEtBQVMsQ0FBVDtBQUNBLE9BQUEsQ0FBQSxHQUFTLEtBQUEsR0FBQSxDQUFTLEtBQVQsQ0FBQSxFQUFpQixTQUExQixDQUFTLENBQVQ7QUFDQSxPQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBUyxLQUFULENBQUEsRUFBaUIsU0FBQSxDQUFBLEdBQWEsU0FBYixNQUFBLEdBQTFCLE1BQVMsQ0FBVDtBQUNEOztJQUNLLFU7Ozs7Ozs7O0FBQ0o7Ozs7Ozs7OzhCQVFrQixhLEVBQWUsRyxFQUFLO0FBQ3BDLG9CQUFBLEdBQUEsSUFBQSxHQUFBO0FBQ0EsdUJBQUEsSUFBQSxDQUFBLGFBQUE7QUFDQSxvQkFBQSxrQkFBQSxHQUFBLG1CQUFBO0FBQ0Q7Ozs7OztrQkFHWSxPIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IG9iamVjdENyZWF0ZVBvbHlmaWxsXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IG9iamVjdEtleXNQb2x5ZmlsbFxudmFyIGJpbmQgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fCBmdW5jdGlvbkJpbmRQb2x5ZmlsbFxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19ldmVudHMnKSkge1xuICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG52YXIgaGFzRGVmaW5lUHJvcGVydHk7XG50cnkge1xuICB2YXIgbyA9IHt9O1xuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgJ3gnLCB7IHZhbHVlOiAwIH0pO1xuICBoYXNEZWZpbmVQcm9wZXJ0eSA9IG8ueCA9PT0gMDtcbn0gY2F0Y2ggKGVycikgeyBoYXNEZWZpbmVQcm9wZXJ0eSA9IGZhbHNlIH1cbmlmIChoYXNEZWZpbmVQcm9wZXJ0eSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRFbWl0dGVyLCAnZGVmYXVsdE1heExpc3RlbmVycycsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBpbnB1dCBpcyBhIHBvc2l0aXZlIG51bWJlciAod2hvc2UgdmFsdWUgaXMgemVybyBvclxuICAgICAgLy8gZ3JlYXRlciBhbmQgbm90IGEgTmFOKS5cbiAgICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IGFyZyAhPT0gYXJnKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgICBkZWZhdWx0TWF4TGlzdGVuZXJzID0gYXJnO1xuICAgIH1cbiAgfSk7XG59IGVsc2Uge1xuICBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJuXCIgYXJndW1lbnQgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uICRnZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuICRnZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG4vLyBUaGVzZSBzdGFuZGFsb25lIGVtaXQqIGZ1bmN0aW9ucyBhcmUgdXNlZCB0byBvcHRpbWl6ZSBjYWxsaW5nIG9mIGV2ZW50XG4vLyBoYW5kbGVycyBmb3IgZmFzdCBjYXNlcyBiZWNhdXNlIGVtaXQoKSBpdHNlbGYgb2Z0ZW4gaGFzIGEgdmFyaWFibGUgbnVtYmVyIG9mXG4vLyBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBiZWNhdXNlIG9mIHRoYXQuIFRoZXNlIGZ1bmN0aW9ucyBhbHdheXMgaGF2ZVxuLy8gdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgdGh1cyBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLCBzbyB0aGUgY29kZVxuLy8gaW5zaWRlIHRoZW0gY2FuIGV4ZWN1dGUgZmFzdGVyLlxuZnVuY3Rpb24gZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgc2VsZikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyLCBhcmczKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZ3MpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5hcHBseShzZWxmLCBhcmdzKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGV2ZW50cztcbiAgdmFyIGRvRXJyb3IgPSAodHlwZSA9PT0gJ2Vycm9yJyk7XG5cbiAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzKVxuICAgIGRvRXJyb3IgPSAoZG9FcnJvciAmJiBldmVudHMuZXJyb3IgPT0gbnVsbCk7XG4gIGVsc2UgaWYgKCFkb0Vycm9yKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmIChkb0Vycm9yKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKVxuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKCFoYW5kbGVyKVxuICAgIHJldHVybiBmYWxzZTtcblxuICB2YXIgaXNGbiA9IHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nO1xuICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICBzd2l0Y2ggKGxlbikge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgIGNhc2UgMTpcbiAgICAgIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHRoaXMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7XG4gICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgIGRlZmF1bHQ6XG4gICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBfYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgcHJlcGVuZCkge1xuICB2YXIgbTtcbiAgdmFyIGV2ZW50cztcbiAgdmFyIGV4aXN0aW5nO1xuXG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICBpZiAoIWV2ZW50cykge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICAgICAgLy8gUmUtYXNzaWduIGBldmVudHNgIGJlY2F1c2UgYSBuZXdMaXN0ZW5lciBoYW5kbGVyIGNvdWxkIGhhdmUgY2F1c2VkIHRoZVxuICAgICAgLy8gdGhpcy5fZXZlbnRzIHRvIGJlIGFzc2lnbmVkIHRvIGEgbmV3IG9iamVjdFxuICAgICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gICAgfVxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgaWYgKCFleGlzdGluZykge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgICBpZiAocHJlcGVuZCkge1xuICAgICAgICBleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCFleGlzdGluZy53YXJuZWQpIHtcbiAgICAgIG0gPSAkZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgICBpZiAobSAmJiBtID4gMCAmJiBleGlzdGluZy5sZW5ndGggPiBtKSB7XG4gICAgICAgIGV4aXN0aW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgZXhpc3RpbmcubGVuZ3RoICsgJyBcIicgKyBTdHJpbmcodHlwZSkgKyAnXCIgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICdpbmNyZWFzZSBsaW1pdC4nKTtcbiAgICAgICAgdy5uYW1lID0gJ01heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyc7XG4gICAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgICAgdy5jb3VudCA9IGV4aXN0aW5nLmxlbmd0aDtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0JyAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJyVzOiAlcycsIHcubmFtZSwgdy5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdKTtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSxcbiAgICAgICAgICAgIGFyZ3VtZW50c1syXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKVxuICAgICAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3MpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBiaW5kLmNhbGwob25jZVdyYXBwZXIsIHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAoIWxpc3QpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdC5saXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxpc3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcG9zaXRpb24gPSAtMTtcblxuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8IGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBvcmlnaW5hbExpc3RlbmVyID0gbGlzdFtpXS5saXN0ZW5lcjtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgb3JpZ2luYWxMaXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgICAgIGlmICghZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0pIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gb2JqZWN0S2V5cyhldmVudHMpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIC8vIExJRk8gb3JkZXJcbiAgICAgICAgZm9yIChpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbmZ1bmN0aW9uIF9saXN0ZW5lcnModGFyZ2V0LCB0eXBlLCB1bndyYXApIHtcbiAgdmFyIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuXG4gIGlmICghZXZlbnRzKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKCFldmxpc3RlbmVyKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgPyB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGV2bGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3Qub3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG4vLyBBYm91dCAxLjV4IGZhc3RlciB0aGFuIHRoZSB0d28tYXJnIHZlcnNpb24gb2YgQXJyYXkjc3BsaWNlKCkuXG5mdW5jdGlvbiBzcGxpY2VPbmUobGlzdCwgaW5kZXgpIHtcbiAgZm9yICh2YXIgaSA9IGluZGV4LCBrID0gaSArIDEsIG4gPSBsaXN0Lmxlbmd0aDsgayA8IG47IGkgKz0gMSwgayArPSAxKVxuICAgIGxpc3RbaV0gPSBsaXN0W2tdO1xuICBsaXN0LnBvcCgpO1xufVxuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9iamVjdENyZWF0ZVBvbHlmaWxsKHByb3RvKSB7XG4gIHZhciBGID0gZnVuY3Rpb24oKSB7fTtcbiAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgcmV0dXJuIG5ldyBGO1xufVxuZnVuY3Rpb24gb2JqZWN0S2V5c1BvbHlmaWxsKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrIGluIG9iaikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGspKSB7XG4gICAga2V5cy5wdXNoKGspO1xuICB9XG4gIHJldHVybiBrO1xufVxuZnVuY3Rpb24gZnVuY3Rpb25CaW5kUG9seWZpbGwoY29udGV4dCkge1xuICB2YXIgZm4gPSB0aGlzO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICB9O1xufVxuIiwiXG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKCcuL2xpYi9rZXlib2FyZCcpO1xudmFyIExvY2FsZSAgID0gcmVxdWlyZSgnLi9saWIvbG9jYWxlJyk7XG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2xpYi9rZXktY29tYm8nKTtcblxudmFyIGtleWJvYXJkID0gbmV3IEtleWJvYXJkKCk7XG5cbmtleWJvYXJkLnNldExvY2FsZSgndXMnLCByZXF1aXJlKCcuL2xvY2FsZXMvdXMnKSk7XG5cbmV4cG9ydHMgICAgICAgICAgPSBtb2R1bGUuZXhwb3J0cyA9IGtleWJvYXJkO1xuZXhwb3J0cy5LZXlib2FyZCA9IEtleWJvYXJkO1xuZXhwb3J0cy5Mb2NhbGUgICA9IExvY2FsZTtcbmV4cG9ydHMuS2V5Q29tYm8gPSBLZXlDb21ibztcbiIsIlxuZnVuY3Rpb24gS2V5Q29tYm8oa2V5Q29tYm9TdHIpIHtcbiAgdGhpcy5zb3VyY2VTdHIgPSBrZXlDb21ib1N0cjtcbiAgdGhpcy5zdWJDb21ib3MgPSBLZXlDb21iby5wYXJzZUNvbWJvU3RyKGtleUNvbWJvU3RyKTtcbiAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoZnVuY3Rpb24obWVtbywgbmV4dFN1YkNvbWJvKSB7XG4gICAgcmV0dXJuIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyk7XG4gIH0sIFtdKTtcbn1cblxuLy8gVE9ETzogQWRkIHN1cHBvcnQgZm9yIGtleSBjb21ibyBzZXF1ZW5jZXNcbktleUNvbWJvLnNlcXVlbmNlRGVsaW1pbmF0b3IgPSAnPj4nO1xuS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvciAgICA9ICc+JztcbktleUNvbWJvLmtleURlbGltaW5hdG9yICAgICAgPSAnKyc7XG5cbktleUNvbWJvLnBhcnNlQ29tYm9TdHIgPSBmdW5jdGlvbihrZXlDb21ib1N0cikge1xuICB2YXIgc3ViQ29tYm9TdHJzID0gS2V5Q29tYm8uX3NwbGl0U3RyKGtleUNvbWJvU3RyLCBLZXlDb21iby5jb21ib0RlbGltaW5hdG9yKTtcbiAgdmFyIGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59O1xuXG5LZXlDb21iby5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbihwcmVzc2VkS2V5TmFtZXMpIHtcbiAgdmFyIHN0YXJ0aW5nS2V5TmFtZUluZGV4ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHN0YXJ0aW5nS2V5TmFtZUluZGV4ID0gdGhpcy5fY2hlY2tTdWJDb21ibyhcbiAgICAgIHRoaXMuc3ViQ29tYm9zW2ldLFxuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICBwcmVzc2VkS2V5TmFtZXNcbiAgICApO1xuICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5LZXlDb21iby5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uKG90aGVyS2V5Q29tYm8pIHtcbiAgaWYgKFxuICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgdHlwZW9mIG90aGVyS2V5Q29tYm8gIT09ICdzdHJpbmcnICYmXG4gICAgdHlwZW9mIG90aGVyS2V5Q29tYm8gIT09ICdvYmplY3QnXG4gICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBpZiAodHlwZW9mIG90aGVyS2V5Q29tYm8gPT09ICdzdHJpbmcnKSB7XG4gICAgb3RoZXJLZXlDb21ibyA9IG5ldyBLZXlDb21ibyhvdGhlcktleUNvbWJvKTtcbiAgfVxuXG4gIGlmICh0aGlzLnN1YkNvbWJvcy5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zW2ldLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3NbaV0ubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBzdWJDb21ibyAgICAgID0gdGhpcy5zdWJDb21ib3NbaV07XG4gICAgdmFyIG90aGVyU3ViQ29tYm8gPSBvdGhlcktleUNvbWJvLnN1YkNvbWJvc1tpXS5zbGljZSgwKTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViQ29tYm8ubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgIHZhciBrZXlOYW1lID0gc3ViQ29tYm9bal07XG4gICAgICB2YXIgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgb3RoZXJTdWJDb21iby5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3RoZXJTdWJDb21iby5sZW5ndGggIT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgdmFyIHMgID0gc3RyO1xuICB2YXIgZCAgPSBkZWxpbWluYXRvcjtcbiAgdmFyIGMgID0gJyc7XG4gIHZhciBjYSA9IFtdO1xuXG4gIGZvciAodmFyIGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG5cbktleUNvbWJvLnByb3RvdHlwZS5fY2hlY2tTdWJDb21ibyA9IGZ1bmN0aW9uKHN1YkNvbWJvLCBzdGFydGluZ0tleU5hbWVJbmRleCwgcHJlc3NlZEtleU5hbWVzKSB7XG4gIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gIHByZXNzZWRLZXlOYW1lcyA9IHByZXNzZWRLZXlOYW1lcy5zbGljZShzdGFydGluZ0tleU5hbWVJbmRleCk7XG5cbiAgdmFyIGVuZEluZGV4ID0gc3RhcnRpbmdLZXlOYW1lSW5kZXg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgIHZhciBrZXlOYW1lID0gc3ViQ29tYm9baV07XG4gICAgaWYgKGtleU5hbWVbMF0gPT09ICdcXFxcJykge1xuICAgICAgdmFyIGVzY2FwZWRLZXlOYW1lID0ga2V5TmFtZS5zbGljZSgxKTtcbiAgICAgIGlmIChcbiAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmtleURlbGltaW5hdG9yXG4gICAgICApIHtcbiAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpbmRleCA9IHByZXNzZWRLZXlOYW1lcy5pbmRleE9mKGtleU5hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgICBpZiAoaW5kZXggPiBlbmRJbmRleCkge1xuICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgfVxuICAgICAgaWYgKHN1YkNvbWJvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBLZXlDb21ibztcbiIsIlxudmFyIExvY2FsZSA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xuXG5cbmZ1bmN0aW9uIEtleWJvYXJkKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgICA9IG51bGw7XG4gIHRoaXMuX2N1cnJlbnRDb250ZXh0ICAgICAgID0gbnVsbDtcbiAgdGhpcy5fY29udGV4dHMgICAgICAgICAgICAgPSB7fTtcbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcbiAgdGhpcy5fYXBwbGllZExpc3RlbmVycyAgICAgPSBbXTtcbiAgdGhpcy5fbG9jYWxlcyAgICAgICAgICAgICAgPSB7fTtcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRXaW5kb3cgICAgICAgICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICAgICAgID0gJyc7XG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XG4gIHRoaXMuX2lzTW9kZXJuQnJvd3NlciAgICAgID0gZmFsc2U7XG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcgICA9IG51bGw7XG4gIHRoaXMuX3BhdXNlZCAgICAgICAgICAgICAgID0gZmFsc2U7XG4gIHRoaXMuX2NhbGxlckhhbmRsZXIgICAgICAgID0gbnVsbDtcblxuICB0aGlzLnNldENvbnRleHQoJ2dsb2JhbCcpO1xuICB0aGlzLndhdGNoKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCk7XG59XG5cbktleWJvYXJkLnByb3RvdHlwZS5zZXRMb2NhbGUgPSBmdW5jdGlvbihsb2NhbGVOYW1lLCBsb2NhbGVCdWlsZGVyKSB7XG4gIHZhciBsb2NhbGUgPSBudWxsO1xuICBpZiAodHlwZW9mIGxvY2FsZU5hbWUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICBpZiAobG9jYWxlQnVpbGRlcikge1xuICAgICAgbG9jYWxlID0gbmV3IExvY2FsZShsb2NhbGVOYW1lKTtcbiAgICAgIGxvY2FsZUJ1aWxkZXIobG9jYWxlLCB0aGlzLl90YXJnZXRQbGF0Zm9ybSwgdGhpcy5fdGFyZ2V0VXNlckFnZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9jYWxlID0gdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSB8fCBudWxsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsb2NhbGUgICAgID0gbG9jYWxlTmFtZTtcbiAgICBsb2NhbGVOYW1lID0gbG9jYWxlLl9sb2NhbGVOYW1lO1xuICB9XG5cbiAgdGhpcy5fbG9jYWxlICAgICAgICAgICAgICA9IGxvY2FsZTtcbiAgdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSA9IGxvY2FsZTtcbiAgaWYgKGxvY2FsZSkge1xuICAgIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cyA9IGxvY2FsZS5wcmVzc2VkS2V5cztcbiAgfVxufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLmdldExvY2FsZSA9IGZ1bmN0aW9uKGxvY2FsTmFtZSkge1xuICBsb2NhbE5hbWUgfHwgKGxvY2FsTmFtZSA9IHRoaXMuX2xvY2FsZS5sb2NhbGVOYW1lKTtcbiAgcmV0dXJuIHRoaXMuX2xvY2FsZXNbbG9jYWxOYW1lXSB8fCBudWxsO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA9IHJlbGVhc2VIYW5kbGVyO1xuICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgPSBwcmVzc0hhbmRsZXI7XG4gICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA9IGtleUNvbWJvU3RyO1xuICAgIGtleUNvbWJvU3RyICAgICAgICAgICAgPSBudWxsO1xuICB9XG5cbiAgaWYgKFxuICAgIGtleUNvbWJvU3RyICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuX2xpc3RlbmVycy5wdXNoKHtcbiAgICBrZXlDb21ibyAgICAgICAgICAgICAgIDoga2V5Q29tYm9TdHIgPyBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpIDogbnVsbCxcbiAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogcHJlc3NIYW5kbGVyICAgICAgICAgICB8fCBudWxsLFxuICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgOiByZWxlYXNlSGFuZGxlciAgICAgICAgIHx8IG51bGwsXG4gICAgcHJldmVudFJlcGVhdCAgICAgICAgICA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2UsXG4gICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2VcbiAgfSk7XG59O1xuS2V5Ym9hcmQucHJvdG90eXBlLmFkZExpc3RlbmVyID0gS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQ7XG5LZXlib2FyZC5wcm90b3R5cGUub24gICAgICAgICAgPSBLZXlib2FyZC5wcm90b3R5cGUuYmluZDtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKSB7XG4gIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZWxlYXNlSGFuZGxlciA9IHByZXNzSGFuZGxlcjtcbiAgICBwcmVzc0hhbmRsZXIgICA9IGtleUNvbWJvU3RyO1xuICAgIGtleUNvbWJvU3RyID0gbnVsbDtcbiAgfVxuXG4gIGlmIChcbiAgICBrZXlDb21ib1N0ciAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xuICApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnVuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2ldO1xuXG4gICAgdmFyIGNvbWJvTWF0Y2hlcyAgICAgICAgICA9ICFrZXlDb21ib1N0ciAmJiAhbGlzdGVuZXIua2V5Q29tYm8gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIua2V5Q29tYm8gJiYgbGlzdGVuZXIua2V5Q29tYm8uaXNFcXVhbChrZXlDb21ib1N0cik7XG4gICAgdmFyIHByZXNzSGFuZGxlck1hdGNoZXMgICA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFwcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXNzSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzc0hhbmRsZXIgPT09IGxpc3RlbmVyLnByZXNzSGFuZGxlcjtcbiAgICB2YXIgcmVsZWFzZUhhbmRsZXJNYXRjaGVzID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXJlbGVhc2VIYW5kbGVyICYmICFsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlSGFuZGxlciA9PT0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XG5cbiAgICBpZiAoY29tYm9NYXRjaGVzICYmIHByZXNzSGFuZGxlck1hdGNoZXMgJiYgcmVsZWFzZUhhbmRsZXJNYXRjaGVzKSB7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcbktleWJvYXJkLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IEtleWJvYXJkLnByb3RvdHlwZS51bmJpbmQ7XG5LZXlib2FyZC5wcm90b3R5cGUub2ZmICAgICAgICAgICAgPSBLZXlib2FyZC5wcm90b3R5cGUudW5iaW5kO1xuXG5LZXlib2FyZC5wcm90b3R5cGUuc2V0Q29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHROYW1lKSB7XG4gIGlmKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cblxuICBpZiAoIXRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXSkge1xuICAgIHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXSA9IFtdO1xuICB9XG4gIHRoaXMuX2xpc3RlbmVycyAgICAgID0gdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdO1xuICB0aGlzLl9jdXJyZW50Q29udGV4dCA9IGNvbnRleHROYW1lO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2N1cnJlbnRDb250ZXh0O1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLndpdGhDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUsIGNhbGxiYWNrKSB7XG4gIHZhciBwcmV2aW91c0NvbnRleHROYW1lID0gdGhpcy5nZXRDb250ZXh0KCk7XG4gIHRoaXMuc2V0Q29udGV4dChjb250ZXh0TmFtZSk7XG5cbiAgY2FsbGJhY2soKTtcblxuICB0aGlzLnNldENvbnRleHQocHJldmlvdXNDb250ZXh0TmFtZSk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUud2F0Y2ggPSBmdW5jdGlvbih0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHRhcmdldFBsYXRmb3JtLCB0YXJnZXRVc2VyQWdlbnQpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB0aGlzLnN0b3AoKTtcblxuICBpZiAoIXRhcmdldFdpbmRvdykge1xuICAgIGlmICghZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgJiYgIWdsb2JhbC5hdHRhY2hFdmVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBnbG9iYWwgZnVuY3Rpb25zIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XG4gICAgfVxuICAgIHRhcmdldFdpbmRvdyA9IGdsb2JhbDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdGFyZ2V0V2luZG93Lm5vZGVUeXBlID09PSAnbnVtYmVyJykge1xuICAgIHRhcmdldFVzZXJBZ2VudCA9IHRhcmdldFBsYXRmb3JtO1xuICAgIHRhcmdldFBsYXRmb3JtICA9IHRhcmdldEVsZW1lbnQ7XG4gICAgdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93O1xuICAgIHRhcmdldFdpbmRvdyAgICA9IGdsb2JhbDtcbiAgfVxuXG4gIGlmICghdGFyZ2V0V2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJiYgIXRhcmdldFdpbmRvdy5hdHRhY2hFdmVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudCBtZXRob2RzIG9uIHRhcmdldFdpbmRvdy4nKTtcbiAgfVxuXG4gIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA9ICEhdGFyZ2V0V2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5cbiAgdmFyIHVzZXJBZ2VudCA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgfHwgJyc7XG4gIHZhciBwbGF0Zm9ybSAgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm0gIHx8ICcnO1xuXG4gIHRhcmdldEVsZW1lbnQgICAmJiB0YXJnZXRFbGVtZW50ICAgIT09IG51bGwgfHwgKHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdy5kb2N1bWVudCk7XG4gIHRhcmdldFBsYXRmb3JtICAmJiB0YXJnZXRQbGF0Zm9ybSAgIT09IG51bGwgfHwgKHRhcmdldFBsYXRmb3JtICA9IHBsYXRmb3JtKTtcbiAgdGFyZ2V0VXNlckFnZW50ICYmIHRhcmdldFVzZXJBZ2VudCAhPT0gbnVsbCB8fCAodGFyZ2V0VXNlckFnZW50ID0gdXNlckFnZW50KTtcblxuICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMucHJlc3NLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xuICAgIF90aGlzLl9oYW5kbGVDb21tYW5kQnVnKGV2ZW50LCBwbGF0Zm9ybSk7XG4gIH07XG4gIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMucmVsZWFzZUtleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gIH07XG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMucmVsZWFzZUFsbEtleXMoZXZlbnQpXG4gIH07XG5cbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuXG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgICA9IHRhcmdldEVsZW1lbnQ7XG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgICA9IHRhcmdldFdpbmRvdztcbiAgdGhpcy5fdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0UGxhdGZvcm07XG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCA9IHRhcmdldFVzZXJBZ2VudDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgaWYgKCF0aGlzLl90YXJnZXRFbGVtZW50IHx8ICF0aGlzLl90YXJnZXRXaW5kb3cpIHsgcmV0dXJuOyB9XG5cbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgdGhpcy5fdGFyZ2V0V2luZG93ICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgPSBudWxsO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnByZXNzS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgdGhpcy5fbG9jYWxlLnByZXNzS2V5KGtleUNvZGUpO1xuICB0aGlzLl9hcHBseUJpbmRpbmdzKGV2ZW50KTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZWxlYXNlS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgdGhpcy5fbG9jYWxlLnJlbGVhc2VLZXkoa2V5Q29kZSk7XG4gIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VBbGxLZXlzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XG4gIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICh0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG4gIHRoaXMuX3BhdXNlZCA9IHRydWU7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmVsZWFzZUFsbEtleXMoKTtcbiAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2JpbmRFdmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICB0YXJnZXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgIHRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX3VuYmluZEV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgIHRhcmdldEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgdGFyZ2V0RWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fZ2V0R3JvdXBlZExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGlzdGVuZXJHcm91cHMgICA9IFtdO1xuICB2YXIgbGlzdGVuZXJHcm91cE1hcCA9IFtdO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gIGlmICh0aGlzLl9jdXJyZW50Q29udGV4dCAhPT0gJ2dsb2JhbCcpIHtcbiAgICBsaXN0ZW5lcnMgPSBbXS5jb25jYXQobGlzdGVuZXJzLCB0aGlzLl9jb250ZXh0cy5nbG9iYWwpO1xuICB9XG5cbiAgbGlzdGVuZXJzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiAoYi5rZXlDb21ibyA/IGIua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCkgLSAoYS5rZXlDb21ibyA/IGEua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCk7XG4gIH0pLmZvckVhY2goZnVuY3Rpb24obCkge1xuICAgIHZhciBtYXBJbmRleCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgaWYgKGxpc3RlbmVyR3JvdXBNYXBbaV0gPT09IG51bGwgJiYgbC5rZXlDb21ibyA9PT0gbnVsbCB8fFxuICAgICAgICAgIGxpc3RlbmVyR3JvdXBNYXBbaV0gIT09IG51bGwgJiYgbGlzdGVuZXJHcm91cE1hcFtpXS5pc0VxdWFsKGwua2V5Q29tYm8pKSB7XG4gICAgICAgIG1hcEluZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1hcEluZGV4ID09PSAtMSkge1xuICAgICAgbWFwSW5kZXggPSBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDtcbiAgICAgIGxpc3RlbmVyR3JvdXBNYXAucHVzaChsLmtleUNvbWJvKTtcbiAgICB9XG4gICAgaWYgKCFsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0pIHtcbiAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSA9IFtdO1xuICAgIH1cbiAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0ucHVzaChsKTtcbiAgfSk7XG4gIHJldHVybiBsaXN0ZW5lckdyb3Vwcztcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fYXBwbHlCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBwcmV2ZW50UmVwZWF0ID0gZmFsc2U7XG5cbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuICBldmVudC5wcmV2ZW50UmVwZWF0ID0gZnVuY3Rpb24oKSB7IHByZXZlbnRSZXBlYXQgPSB0cnVlOyB9O1xuICBldmVudC5wcmVzc2VkS2V5cyAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuXG4gIHZhciBwcmVzc2VkS2V5cyAgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcbiAgdmFyIGxpc3RlbmVyR3JvdXBzID0gdGhpcy5fZ2V0R3JvdXBlZExpc3RlbmVycygpO1xuXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3Vwcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBsaXN0ZW5lckdyb3Vwc1tpXTtcbiAgICB2YXIga2V5Q29tYm8gID0gbGlzdGVuZXJzWzBdLmtleUNvbWJvO1xuXG4gICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8IGtleUNvbWJvLmNoZWNrKHByZXNzZWRLZXlzKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBsaXN0ZW5lcnMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2pdO1xuXG4gICAgICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCkge1xuICAgICAgICAgIGxpc3RlbmVyID0ge1xuICAgICAgICAgICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IG5ldyBLZXlDb21ibyhwcmVzc2VkS2V5cy5qb2luKCcrJykpLFxuICAgICAgICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IGxpc3RlbmVyLnByZXNzSGFuZGxlcixcbiAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgOiBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcixcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0LFxuICAgICAgICAgICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA6IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHRcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVyLnByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJldmVudFJlcGVhdCkge1xuICAgICAgICAgIGxpc3RlbmVyLnByZXNzSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICBpZiAocHJldmVudFJlcGVhdCkge1xuICAgICAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IHByZXZlbnRSZXBlYXQ7XG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyICYmIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcikgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoa2V5Q29tYm8pIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrZXlDb21iby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgIHZhciBpbmRleCA9IHByZXNzZWRLZXlzLmluZGV4T2Yoa2V5Q29tYm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2NsZWFyQmluZGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xuICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5fYXBwbGllZExpc3RlbmVyc1tpXTtcbiAgICB2YXIga2V5Q29tYm8gPSBsaXN0ZW5lci5rZXlDb21ibztcbiAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwgIWtleUNvbWJvLmNoZWNrKHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGlmICh0aGlzLl9jYWxsZXJIYW5kbGVyICE9PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcikge1xuICAgICAgICB2YXIgb2xkQ2FsbGVyID0gdGhpcy5fY2FsbGVySGFuZGxlcjtcbiAgICAgICAgdGhpcy5fY2FsbGVySGFuZGxlciA9IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xuICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdDtcbiAgICAgICAgbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgIHRoaXMuX2NhbGxlckhhbmRsZXIgPSBvbGRDYWxsZXI7XG4gICAgICB9XG4gICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICB9XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5faGFuZGxlQ29tbWFuZEJ1ZyA9IGZ1bmN0aW9uKGV2ZW50LCBwbGF0Zm9ybSkge1xuICAvLyBPbiBNYWMgd2hlbiB0aGUgY29tbWFuZCBrZXkgaXMga2VwdCBwcmVzc2VkLCBrZXl1cCBpcyBub3QgdHJpZ2dlcmVkIGZvciBhbnkgb3RoZXIga2V5LlxuICAvLyBJbiB0aGlzIGNhc2UgZm9yY2UgYSBrZXl1cCBmb3Igbm9uLW1vZGlmaWVyIGtleXMgZGlyZWN0bHkgYWZ0ZXIgdGhlIGtleXByZXNzLlxuICB2YXIgbW9kaWZpZXJLZXlzID0gW1wic2hpZnRcIiwgXCJjdHJsXCIsIFwiYWx0XCIsIFwiY2Fwc2xvY2tcIiwgXCJ0YWJcIiwgXCJjb21tYW5kXCJdO1xuICBpZiAocGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgJiYgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmluY2x1ZGVzKFwiY29tbWFuZFwiKSAmJlxuICAgICAgIW1vZGlmaWVyS2V5cy5pbmNsdWRlcyh0aGlzLl9sb2NhbGUuZ2V0S2V5TmFtZXMoZXZlbnQua2V5Q29kZSlbMF0pKSB7XG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKGV2ZW50KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcbiIsIlxudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9rZXktY29tYm8nKTtcblxuXG5mdW5jdGlvbiBMb2NhbGUobmFtZSkge1xuICB0aGlzLmxvY2FsZU5hbWUgICAgID0gbmFtZTtcbiAgdGhpcy5wcmVzc2VkS2V5cyAgICA9IFtdO1xuICB0aGlzLl9hcHBsaWVkTWFjcm9zID0gW107XG4gIHRoaXMuX2tleU1hcCAgICAgICAgPSB7fTtcbiAgdGhpcy5fa2lsbEtleUNvZGVzICA9IFtdO1xuICB0aGlzLl9tYWNyb3MgICAgICAgID0gW107XG59XG5cbkxvY2FsZS5wcm90b3R5cGUuYmluZEtleUNvZGUgPSBmdW5jdGlvbihrZXlDb2RlLCBrZXlOYW1lcykge1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnc3RyaW5nJykge1xuICAgIGtleU5hbWVzID0gW2tleU5hbWVzXTtcbiAgfVxuXG4gIHRoaXMuX2tleU1hcFtrZXlDb2RlXSA9IGtleU5hbWVzO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5iaW5kTWFjcm8gPSBmdW5jdGlvbihrZXlDb21ib1N0ciwga2V5TmFtZXMpIHtcbiAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ3N0cmluZycpIHtcbiAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gbnVsbDtcbiAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGhhbmRsZXIgPSBrZXlOYW1lcztcbiAgICBrZXlOYW1lcyA9IG51bGw7XG4gIH1cblxuICB2YXIgbWFjcm8gPSB7XG4gICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxuICAgIGtleU5hbWVzIDoga2V5TmFtZXMsXG4gICAgaGFuZGxlciAgOiBoYW5kbGVyXG4gIH07XG5cbiAgdGhpcy5fbWFjcm9zLnB1c2gobWFjcm8pO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5nZXRLZXlDb2RlcyA9IGZ1bmN0aW9uKGtleU5hbWUpIHtcbiAgdmFyIGtleUNvZGVzID0gW107XG4gIGZvciAodmFyIGtleUNvZGUgaW4gdGhpcy5fa2V5TWFwKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fa2V5TWFwW2tleUNvZGVdLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHsga2V5Q29kZXMucHVzaChrZXlDb2RlfDApOyB9XG4gIH1cbiAgcmV0dXJuIGtleUNvZGVzO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5nZXRLZXlOYW1lcyA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgcmV0dXJuIHRoaXMuX2tleU1hcFtrZXlDb2RlXSB8fCBbXTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuc2V0S2lsbEtleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5zZXRLaWxsS2V5KGtleUNvZGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fa2lsbEtleUNvZGVzLnB1c2goa2V5Q29kZSk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLnByZXNzS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnByZXNzS2V5KGtleUNvZGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlOYW1lcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5TmFtZXNbaV0pID09PSAtMSkge1xuICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLl9hcHBseU1hY3JvcygpO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5yZWxlYXNlS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnJlbGVhc2VLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIGVsc2Uge1xuICAgIHZhciBrZXlOYW1lcyAgICAgICAgID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICB2YXIga2lsbEtleUNvZGVJbmRleCA9IHRoaXMuX2tpbGxLZXlDb2Rlcy5pbmRleE9mKGtleUNvZGUpO1xuICAgIFxuICAgIGlmIChraWxsS2V5Q29kZUluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlOYW1lcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5TmFtZXNbaV0pO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2NsZWFyTWFjcm9zKCk7XG4gIH1cbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuX2FwcGx5TWFjcm9zID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtYWNyb3MgPSB0aGlzLl9tYWNyb3Muc2xpY2UoMCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIG1hY3JvID0gbWFjcm9zW2ldO1xuICAgIGlmIChtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgbWFjcm8ua2V5TmFtZXMgPSBtYWNyby5oYW5kbGVyKHRoaXMucHJlc3NlZEtleXMpO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKG1hY3JvLmtleU5hbWVzW2pdKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2gobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9hcHBsaWVkTWFjcm9zLnB1c2gobWFjcm8pO1xuICAgIH1cbiAgfVxufTtcblxuTG9jYWxlLnByb3RvdHlwZS5fY2xlYXJNYWNyb3MgPSBmdW5jdGlvbigpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIG1hY3JvID0gdGhpcy5fYXBwbGllZE1hY3Jvc1tpXTtcbiAgICBpZiAoIW1hY3JvLmtleUNvbWJvLmNoZWNrKHRoaXMucHJlc3NlZEtleXMpKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xuICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLl9hcHBsaWVkTWFjcm9zLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICB9XG4gIH1cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbGU7XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obG9jYWxlLCBwbGF0Zm9ybSwgdXNlckFnZW50KSB7XG5cbiAgLy8gZ2VuZXJhbFxuICBsb2NhbGUuYmluZEtleUNvZGUoMywgICBbJ2NhbmNlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDgsICAgWydiYWNrc3BhY2UnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5LCAgIFsndGFiJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIsICBbJ2NsZWFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMsICBbJ2VudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTYsICBbJ3NoaWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTcsICBbJ2N0cmwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOCwgIFsnYWx0JywgJ21lbnUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOSwgIFsncGF1c2UnLCAnYnJlYWsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMCwgIFsnY2Fwc2xvY2snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyNywgIFsnZXNjYXBlJywgJ2VzYyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMyLCAgWydzcGFjZScsICdzcGFjZWJhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMzLCAgWydwYWdldXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNCwgIFsncGFnZWRvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNSwgIFsnZW5kJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzYsICBbJ2hvbWUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNywgIFsnbGVmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM4LCAgWyd1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM5LCAgWydyaWdodCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQwLCAgWydkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDEsICBbJ3NlbGVjdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQyLCAgWydwcmludHNjcmVlbiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQzLCAgWydleGVjdXRlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDQsICBbJ3NuYXBzaG90J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDUsICBbJ2luc2VydCcsICdpbnMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NiwgIFsnZGVsZXRlJywgJ2RlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ3LCAgWydoZWxwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ1LCBbJ3Njcm9sbGxvY2snLCAnc2Nyb2xsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTg3LCBbJ2VxdWFsJywgJ2VxdWFsc2lnbicsICc9J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTg4LCBbJ2NvbW1hJywgJywnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTAsIFsncGVyaW9kJywgJy4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTEsIFsnc2xhc2gnLCAnZm9yd2FyZHNsYXNoJywgJy8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTIsIFsnZ3JhdmVhY2NlbnQnLCAnYCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIxOSwgWydvcGVuYnJhY2tldCcsICdbJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIwLCBbJ2JhY2tzbGFzaCcsICdcXFxcJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIxLCBbJ2Nsb3NlYnJhY2tldCcsICddJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIyLCBbJ2Fwb3N0cm9waGUnLCAnXFwnJ10pO1xuXG4gIC8vIDAtOVxuICBsb2NhbGUuYmluZEtleUNvZGUoNDgsIFsnemVybycsICcwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDksIFsnb25lJywgJzEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MCwgWyd0d28nLCAnMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUxLCBbJ3RocmVlJywgJzMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MiwgWydmb3VyJywgJzQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MywgWydmaXZlJywgJzUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NCwgWydzaXgnLCAnNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU1LCBbJ3NldmVuJywgJzcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NiwgWydlaWdodCcsICc4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTcsIFsnbmluZScsICc5J10pO1xuXG4gIC8vIG51bXBhZFxuICBsb2NhbGUuYmluZEtleUNvZGUoOTYsIFsnbnVtemVybycsICdudW0wJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTcsIFsnbnVtb25lJywgJ251bTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OCwgWydudW10d28nLCAnbnVtMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk5LCBbJ251bXRocmVlJywgJ251bTMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDAsIFsnbnVtZm91cicsICdudW00J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAxLCBbJ251bWZpdmUnLCAnbnVtNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMiwgWydudW1zaXgnLCAnbnVtNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMywgWydudW1zZXZlbicsICdudW03J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA0LCBbJ251bWVpZ2h0JywgJ251bTgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDUsIFsnbnVtbmluZScsICdudW05J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA2LCBbJ251bW11bHRpcGx5JywgJ251bSonXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDcsIFsnbnVtYWRkJywgJ251bSsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDgsIFsnbnVtZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDksIFsnbnVtc3VidHJhY3QnLCAnbnVtLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMCwgWydudW1kZWNpbWFsJywgJ251bS4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTEsIFsnbnVtZGl2aWRlJywgJ251bS8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDQsIFsnbnVtbG9jaycsICdudW0nXSk7XG5cbiAgLy8gZnVuY3Rpb24ga2V5c1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEyLCBbJ2YxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEzLCBbJ2YyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE0LCBbJ2YzJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE1LCBbJ2Y0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE2LCBbJ2Y1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE3LCBbJ2Y2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE4LCBbJ2Y3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE5LCBbJ2Y4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIwLCBbJ2Y5J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIxLCBbJ2YxMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMiwgWydmMTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjMsIFsnZjEyJ10pO1xuXG4gIC8vIHNlY29uZGFyeSBrZXkgc3ltYm9sc1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIGAnLCBbJ3RpbGRlJywgJ34nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMScsIFsnZXhjbGFtYXRpb24nLCAnZXhjbGFtYXRpb25wb2ludCcsICchJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDInLCBbJ2F0JywgJ0AnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMycsIFsnbnVtYmVyJywgJyMnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNCcsIFsnZG9sbGFyJywgJ2RvbGxhcnMnLCAnZG9sbGFyc2lnbicsICckJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDUnLCBbJ3BlcmNlbnQnLCAnJSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA2JywgWydjYXJldCcsICdeJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDcnLCBbJ2FtcGVyc2FuZCcsICdhbmQnLCAnJiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA4JywgWydhc3RlcmlzaycsICcqJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDknLCBbJ29wZW5wYXJlbicsICcoJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDAnLCBbJ2Nsb3NlcGFyZW4nLCAnKSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAtJywgWyd1bmRlcnNjb3JlJywgJ18nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgPScsIFsncGx1cycsICcrJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFsnLCBbJ29wZW5jdXJseWJyYWNlJywgJ29wZW5jdXJseWJyYWNrZXQnLCAneyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBdJywgWydjbG9zZWN1cmx5YnJhY2UnLCAnY2xvc2VjdXJseWJyYWNrZXQnLCAnfSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXFxcJywgWyd2ZXJ0aWNhbGJhcicsICd8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDsnLCBbJ2NvbG9uJywgJzonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFwnJywgWydxdW90YXRpb25tYXJrJywgJ1xcJyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAhLCcsIFsnb3BlbmFuZ2xlYnJhY2tldCcsICc8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC4nLCBbJ2Nsb3NlYW5nbGVicmFja2V0JywgJz4nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLycsIFsncXVlc3Rpb25tYXJrJywgJz8nXSk7XG4gIFxuICBpZiAocGxhdGZvcm0ubWF0Y2goJ01hYycpKSB7XG4gICAgbG9jYWxlLmJpbmRNYWNybygnY29tbWFuZCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xuICB9IGVsc2Uge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2N0cmwnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfVxuXG4gIC8vYS16IGFuZCBBLVpcbiAgZm9yICh2YXIga2V5Q29kZSA9IDY1OyBrZXlDb2RlIDw9IDkwOyBrZXlDb2RlICs9IDEpIHtcbiAgICB2YXIga2V5TmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSArIDMyKTtcbiAgICB2YXIgY2FwaXRhbEtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUpO1xuICBcdGxvY2FsZS5iaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lKTtcbiAgXHRsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICcgKyBrZXlOYW1lLCBjYXBpdGFsS2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnY2Fwc2xvY2sgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICB9XG5cbiAgLy8gYnJvd3NlciBjYXZlYXRzXG4gIHZhciBzZW1pY29sb25LZXlDb2RlID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyA1OSAgOiAxODY7XG4gIHZhciBkYXNoS2V5Q29kZSAgICAgID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyAxNzMgOiAxODk7XG4gIHZhciBsZWZ0Q29tbWFuZEtleUNvZGU7XG4gIHZhciByaWdodENvbW1hbmRLZXlDb2RlO1xuICBpZiAocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmICh1c2VyQWdlbnQubWF0Y2goJ1NhZmFyaScpIHx8IHVzZXJBZ2VudC5tYXRjaCgnQ2hyb21lJykpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDkxO1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSA5MztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ09wZXJhJykpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMTc7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDE3O1xuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDIyNDtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMjI0O1xuICB9XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShzZW1pY29sb25LZXlDb2RlLCAgICBbJ3NlbWljb2xvbicsICc7J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoZGFzaEtleUNvZGUsICAgICAgICAgWydkYXNoJywgJy0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShsZWZ0Q29tbWFuZEtleUNvZGUsICBbJ2NvbW1hbmQnLCAnd2luZG93cycsICd3aW4nLCAnc3VwZXInLCAnbGVmdGNvbW1hbmQnLCAnbGVmdHdpbmRvd3MnLCAnbGVmdHdpbicsICdsZWZ0c3VwZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShyaWdodENvbW1hbmRLZXlDb2RlLCBbJ2NvbW1hbmQnLCAnd2luZG93cycsICd3aW4nLCAnc3VwZXInLCAncmlnaHRjb21tYW5kJywgJ3JpZ2h0d2luZG93cycsICdyaWdodHdpbicsICdyaWdodHN1cGVyJ10pO1xuXG4gIC8vIGtpbGwga2V5c1xuICBsb2NhbGUuc2V0S2lsbEtleSgnY29tbWFuZCcpO1xufTtcbiIsImltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuL2xpYi9BcHBsaWNhdGlvbidcbmltcG9ydCBMb2FkaW5nU2NlbmUgZnJvbSAnLi9zY2VuZXMvTG9hZGluZ1NjZW5lJ1xuXG4vLyBDcmVhdGUgYSBQaXhpIEFwcGxpY2F0aW9uXG5sZXQgYXBwID0gbmV3IEFwcGxpY2F0aW9uKHtcbiAgd2lkdGg6IDI1NixcbiAgaGVpZ2h0OiAyNTYsXG4gIHJvdW5kUGl4ZWxzOiB0cnVlLFxuICBhdXRvUmVzaXplOiB0cnVlLFxuICByZXNvbHV0aW9uOiAxLFxuICBhdXRvU3RhcnQ6IGZhbHNlXG59KVxuXG5hcHAucmVuZGVyZXIudmlldy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5hcHAucmVuZGVyZXIucmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG5cbi8vIEFkZCB0aGUgY2FudmFzIHRoYXQgUGl4aSBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgZm9yIHlvdSB0byB0aGUgSFRNTCBkb2N1bWVudFxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcHAudmlldylcblxuYXBwLmNoYW5nZVN0YWdlKClcbmFwcC5zdGFydCgpXG5hcHAuY2hhbmdlU2NlbmUoTG9hZGluZ1NjZW5lKVxuIiwiZXhwb3J0IGNvbnN0IElTX01PQklMRSA9ICgoYSkgPT4gLyhhbmRyb2lkfGJiXFxkK3xtZWVnbykuK21vYmlsZXxhdmFudGdvfGJhZGFcXC98YmxhY2tiZXJyeXxibGF6ZXJ8Y29tcGFsfGVsYWluZXxmZW5uZWN8aGlwdG9wfGllbW9iaWxlfGlwKGhvbmV8b2QpfGlyaXN8a2luZGxlfGxnZSB8bWFlbW98bWlkcHxtbXB8bW9iaWxlLitmaXJlZm94fG5ldGZyb250fG9wZXJhIG0ob2J8aW4paXxwYWxtKCBvcyk/fHBob25lfHAoaXhpfHJlKVxcL3xwbHVja2VyfHBvY2tldHxwc3B8c2VyaWVzKDR8NikwfHN5bWJpYW58dHJlb3x1cFxcLihicm93c2VyfGxpbmspfHZvZGFmb25lfHdhcHx3aW5kb3dzIGNlfHhkYXx4aWluby9pLnRlc3QoYSkgfHxcbiAgLzEyMDd8NjMxMHw2NTkwfDNnc298NHRocHw1MFsxLTZdaXw3NzBzfDgwMnN8YSB3YXxhYmFjfGFjKGVyfG9vfHMtKXxhaShrb3xybil8YWwoYXZ8Y2F8Y28pfGFtb2l8YW4oZXh8bnl8eXcpfGFwdHV8YXIoY2h8Z28pfGFzKHRlfHVzKXxhdHR3fGF1KGRpfC1tfHIgfHMgKXxhdmFufGJlKGNrfGxsfG5xKXxiaShsYnxyZCl8YmwoYWN8YXopfGJyKGV8dil3fGJ1bWJ8YnctKG58dSl8YzU1XFwvfGNhcGl8Y2N3YXxjZG0tfGNlbGx8Y2h0bXxjbGRjfGNtZC18Y28obXB8bmQpfGNyYXd8ZGEoaXR8bGx8bmcpfGRidGV8ZGMtc3xkZXZpfGRpY2F8ZG1vYnxkbyhjfHApb3xkcygxMnwtZCl8ZWwoNDl8YWkpfGVtKGwyfHVsKXxlcihpY3xrMCl8ZXNsOHxleihbNC03XTB8b3N8d2F8emUpfGZldGN8Zmx5KC18Xyl8ZzEgdXxnNTYwfGdlbmV8Z2YtNXxnLW1vfGdvKFxcLnd8b2QpfGdyKGFkfHVuKXxoYWllfGhjaXR8aGQtKG18cHx0KXxoZWktfGhpKHB0fHRhKXxocCggaXxpcCl8aHMtY3xodChjKC18IHxffGF8Z3xwfHN8dCl8dHApfGh1KGF3fHRjKXxpLSgyMHxnb3xtYSl8aTIzMHxpYWMoIHwtfFxcLyl8aWJyb3xpZGVhfGlnMDF8aWtvbXxpbTFrfGlubm98aXBhcXxpcmlzfGphKHR8dilhfGpicm98amVtdXxqaWdzfGtkZGl8a2VqaXxrZ3QoIHxcXC8pfGtsb258a3B0IHxrd2MtfGt5byhjfGspfGxlKG5vfHhpKXxsZyggZ3xcXC8oa3xsfHUpfDUwfDU0fC1bYS13XSl8bGlid3xseW54fG0xLXd8bTNnYXxtNTBcXC98bWEodGV8dWl8eG8pfG1jKDAxfDIxfGNhKXxtLWNyfG1lKHJjfHJpKXxtaShvOHxvYXx0cyl8bW1lZnxtbygwMXwwMnxiaXxkZXxkb3x0KC18IHxvfHYpfHp6KXxtdCg1MHxwMXx2ICl8bXdicHxteXdhfG4xMFswLTJdfG4yMFsyLTNdfG4zMCgwfDIpfG41MCgwfDJ8NSl8bjcoMCgwfDEpfDEwKXxuZSgoY3xtKS18b258dGZ8d2Z8d2d8d3QpfG5vayg2fGkpfG56cGh8bzJpbXxvcCh0aXx3dil8b3Jhbnxvd2cxfHA4MDB8cGFuKGF8ZHx0KXxwZHhnfHBnKDEzfC0oWzEtOF18YykpfHBoaWx8cGlyZXxwbChheXx1Yyl8cG4tMnxwbyhja3xydHxzZSl8cHJveHxwc2lvfHB0LWd8cWEtYXxxYygwN3wxMnwyMXwzMnw2MHwtWzItN118aS0pfHF0ZWt8cjM4MHxyNjAwfHJha3N8cmltOXxybyh2ZXx6byl8czU1XFwvfHNhKGdlfG1hfG1tfG1zfG55fHZhKXxzYygwMXxoLXxvb3xwLSl8c2RrXFwvfHNlKGMoLXwwfDEpfDQ3fG1jfG5kfHJpKXxzZ2gtfHNoYXJ8c2llKC18bSl8c2stMHxzbCg0NXxpZCl8c20oYWx8YXJ8YjN8aXR8dDUpfHNvKGZ0fG55KXxzcCgwMXxoLXx2LXx2ICl8c3koMDF8bWIpfHQyKDE4fDUwKXx0NigwMHwxMHwxOCl8dGEoZ3R8bGspfHRjbC18dGRnLXx0ZWwoaXxtKXx0aW0tfHQtbW98dG8ocGx8c2gpfHRzKDcwfG0tfG0zfG01KXx0eC05fHVwKFxcLmJ8ZzF8c2kpfHV0c3R8djQwMHx2NzUwfHZlcml8dmkocmd8dGUpfHZrKDQwfDVbMC0zXXwtdil8dm00MHx2b2RhfHZ1bGN8dngoNTJ8NTN8NjB8NjF8NzB8ODB8ODF8ODN8ODV8OTgpfHczYygtfCApfHdlYmN8d2hpdHx3aShnIHxuY3xudyl8d21sYnx3b251fHg3MDB8eWFzLXx5b3VyfHpldG98enRlLS9pLnRlc3QoYS5zdWJzdHIoMCwgNCkpXG4pKG5hdmlnYXRvci51c2VyQWdlbnQgfHwgbmF2aWdhdG9yLnZlbmRvciB8fCB3aW5kb3cub3BlcmEpXG5cbmV4cG9ydCBjb25zdCBDRUlMX1NJWkUgPSAzMlxuXG5leHBvcnQgY29uc3QgQUJJTElUWV9NT1ZFID0gU3ltYm9sKCdtb3ZlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0NBTUVSQSA9IFN5bWJvbCgnY2FtZXJhJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX09QRVJBVEUgPSBTeW1ib2woJ29wZXJhdGUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfS0VZX01PVkUgPSBTeW1ib2woJ2tleS1tb3ZlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0hFQUxUSCA9IFN5bWJvbCgnaGVhbHRoJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0NBUlJZID0gU3ltYm9sKCdjYXJyeScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9MRUFSTiA9IFN5bWJvbCgnbGVhcm4nKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfUExBQ0UgPSBTeW1ib2woJ3BsYWNlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0tFWV9QTEFDRSA9IFN5bWJvbCgna2V5LXBsYWNlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0tFWV9GSVJFID0gU3ltYm9sKCdmaXJlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX1JPVEFURSA9IFN5bWJvbCgncm90YXRlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0RBTUFHRSA9IFN5bWJvbCgnZGFtYWdlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX01BTkEgPSBTeW1ib2woJ21hbmEnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVElFU19BTEwgPSBbXG4gIEFCSUxJVFlfTU9WRSxcbiAgQUJJTElUWV9DQU1FUkEsXG4gIEFCSUxJVFlfT1BFUkFURSxcbiAgQUJJTElUWV9LRVlfTU9WRSxcbiAgQUJJTElUWV9IRUFMVEgsXG4gIEFCSUxJVFlfQ0FSUlksXG4gIEFCSUxJVFlfTEVBUk4sXG4gIEFCSUxJVFlfUExBQ0UsXG4gIEFCSUxJVFlfS0VZX1BMQUNFLFxuICBBQklMSVRZX0tFWV9GSVJFLFxuICBBQklMSVRZX1JPVEFURSxcbiAgQUJJTElUWV9EQU1BR0UsXG4gIEFCSUxJVFlfTUFOQVxuXVxuXG4vLyBvYmplY3QgdHlwZSwgc3RhdGljIG9iamVjdCwgbm90IGNvbGxpZGUgd2l0aFxuZXhwb3J0IGNvbnN0IFNUQVRJQyA9ICdzdGF0aWMnXG4vLyBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFZID0gJ3N0YXknXG4vLyB0b3VjaCB3aWxsIHJlcGx5XG5leHBvcnQgY29uc3QgUkVQTFkgPSAncmVwbHknXG4iLCJleHBvcnQgY29uc3QgTEVGVCA9ICdhJ1xuZXhwb3J0IGNvbnN0IFVQID0gJ3cnXG5leHBvcnQgY29uc3QgUklHSFQgPSAnZCdcbmV4cG9ydCBjb25zdCBET1dOID0gJ3MnXG5leHBvcnQgY29uc3QgU1dJVENIMSA9ICcxJ1xuZXhwb3J0IGNvbnN0IFNXSVRDSDIgPSAnMidcbmV4cG9ydCBjb25zdCBTV0lUQ0gzID0gJzMnXG5leHBvcnQgY29uc3QgU1dJVENINCA9ICc0J1xuZXhwb3J0IGNvbnN0IEZJUkUgPSAnZidcbiIsImltcG9ydCB7IEFwcGxpY2F0aW9uIGFzIFBpeGlBcHBsaWNhdGlvbiwgR3JhcGhpY3MsIGRpc3BsYXkgfSBmcm9tICcuL1BJWEknXG5pbXBvcnQgZ2xvYmFsRXZlbnRNYW5hZ2VyIGZyb20gJy4vZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xuXG5sZXQgYXBwXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgUGl4aUFwcGxpY2F0aW9uIHtcbiAgY29uc3RydWN0b3IgKC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKVxuICAgIGFwcCA9IHRoaXNcbiAgfVxuXG4gIC8vIG9ubHkgb25lIGluc3RhbmNlIGZvciBub3dcbiAgc3RhdGljIGdldEFwcCAoKSB7XG4gICAgcmV0dXJuIGFwcFxuICB9XG5cbiAgY2hhbmdlU3RhZ2UgKCkge1xuICAgIHRoaXMuc3RhZ2UgPSBuZXcgZGlzcGxheS5TdGFnZSgpXG4gIH1cblxuICBjaGFuZ2VTY2VuZSAoU2NlbmVOYW1lLCBwYXJhbXMpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50U2NlbmUpIHtcbiAgICAgIC8vIG1heWJlIHVzZSBwcm9taXNlIGZvciBhbmltYXRpb25cbiAgICAgIC8vIHJlbW92ZSBnYW1lbG9vcD9cbiAgICAgIHRoaXMuY3VycmVudFNjZW5lLmRlc3Ryb3koKVxuICAgICAgdGhpcy5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLmN1cnJlbnRTY2VuZSlcbiAgICB9XG5cbiAgICBsZXQgc2NlbmUgPSBuZXcgU2NlbmVOYW1lKHBhcmFtcylcbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKHNjZW5lKVxuICAgIHNjZW5lLmNyZWF0ZSgpXG4gICAgc2NlbmUub24oJ2NoYW5nZVNjZW5lJywgdGhpcy5jaGFuZ2VTY2VuZS5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5jdXJyZW50U2NlbmUgPSBzY2VuZVxuICB9XG5cbiAgc3RhcnQgKC4uLmFyZ3MpIHtcbiAgICBzdXBlci5zdGFydCguLi5hcmdzKVxuXG4gICAgLy8gY3JlYXRlIGEgYmFja2dyb3VuZCBtYWtlIHN0YWdlIGhhcyB3aWR0aCAmIGhlaWdodFxuICAgIGxldCB2aWV3ID0gdGhpcy5yZW5kZXJlci52aWV3XG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChcbiAgICAgIG5ldyBHcmFwaGljcygpLmRyYXdSZWN0KDAsIDAsIHZpZXcud2lkdGgsIHZpZXcuaGVpZ2h0KVxuICAgIClcblxuICAgIGdsb2JhbEV2ZW50TWFuYWdlci5zZXRJbnRlcmFjdGlvbih0aGlzLnJlbmRlcmVyLnBsdWdpbnMuaW50ZXJhY3Rpb24pXG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgdGhpcy50aWNrZXIuYWRkKGRlbHRhID0+IHRoaXMuZ2FtZUxvb3AuYmluZCh0aGlzKShkZWx0YSkpXG4gIH1cblxuICBnYW1lTG9vcCAoZGVsdGEpIHtcbiAgICAvLyBVcGRhdGUgdGhlIGN1cnJlbnQgZ2FtZSBzdGF0ZTpcbiAgICB0aGlzLmN1cnJlbnRTY2VuZS50aWNrKGRlbHRhKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcGxpY2F0aW9uXG4iLCJpbXBvcnQgeyBHcmFwaGljcyB9IGZyb20gJy4vUElYSSdcbmltcG9ydCB7IENFSUxfU0laRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IExJR0hUID0gU3ltYm9sKCdsaWdodCcpXG5cbmNsYXNzIExpZ2h0IHtcbiAgc3RhdGljIGxpZ2h0T24gKHRhcmdldCwgcmFkaXVzLCByYW5kID0gMSkge1xuICAgIGxldCBjb250YWluZXIgPSB0YXJnZXQucGFyZW50XG4gICAgaWYgKCFjb250YWluZXIubGlnaHRpbmcpIHtcbiAgICAgIC8vIGNvbnRhaW5lciBkb2VzIE5PVCBoYXMgbGlnaHRpbmcgcHJvcGVydHlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgbGlnaHRidWxiID0gbmV3IEdyYXBoaWNzKClcbiAgICB2YXIgcnIgPSAweGZmXG4gICAgdmFyIHJnID0gMHhmZlxuICAgIHZhciByYiA9IDB4ZmZcbiAgICB2YXIgcmFkID0gcmFkaXVzICogQ0VJTF9TSVpFXG5cbiAgICBsZXQgYW5jaG9yID0gdGFyZ2V0LmFuY2hvclxuICAgIGxldCB4ID0gdGFyZ2V0LndpZHRoICogKDAuNSAtIGFuY2hvci54KVxuICAgIGxldCB5ID0gdGFyZ2V0LmhlaWdodCAqICgwLjUgLSBhbmNob3IueSlcbiAgICBsaWdodGJ1bGIuYmVnaW5GaWxsKChyciA8PCAxNikgKyAocmcgPDwgOCkgKyByYiwgMS4wKVxuICAgIGxpZ2h0YnVsYi5kcmF3Q2lyY2xlKHgsIHksIHJhZClcbiAgICBsaWdodGJ1bGIuZW5kRmlsbCgpXG4gICAgbGlnaHRidWxiLnBhcmVudExheWVyID0gY29udGFpbmVyLmxpZ2h0aW5nIC8vIG11c3QgaGFzIHByb3BlcnR5OiBsaWdodGluZ1xuXG4gICAgdGFyZ2V0W0xJR0hUXSA9IHtcbiAgICAgIGxpZ2h0OiBsaWdodGJ1bGJcbiAgICB9XG4gICAgdGFyZ2V0LmFkZENoaWxkKGxpZ2h0YnVsYilcblxuICAgIGlmIChyYW5kICE9PSAxKSB7XG4gICAgICBsZXQgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGxldCBkU2NhbGUgPSBNYXRoLnJhbmRvbSgpICogKDEgLSByYW5kKVxuICAgICAgICBpZiAobGlnaHRidWxiLnNjYWxlLnggPiAxKSB7XG4gICAgICAgICAgZFNjYWxlID0gLWRTY2FsZVxuICAgICAgICB9XG4gICAgICAgIGxpZ2h0YnVsYi5zY2FsZS54ICs9IGRTY2FsZVxuICAgICAgICBsaWdodGJ1bGIuc2NhbGUueSArPSBkU2NhbGVcbiAgICAgICAgbGlnaHRidWxiLmFscGhhICs9IGRTY2FsZVxuICAgICAgfSwgMTAwMCAvIDEyKVxuICAgICAgdGFyZ2V0W0xJR0hUXS5pbnRlcnZhbCA9IGludGVydmFsXG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGxpZ2h0T2ZmICh0YXJnZXQpIHtcbiAgICBpZiAoIXRhcmdldFtMSUdIVF0pIHtcbiAgICAgIC8vIG5vIGxpZ2h0IHRvIHJlbW92ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIHJlbW92ZSBsaWdodFxuICAgIHRhcmdldC5yZW1vdmVDaGlsZCh0YXJnZXRbTElHSFRdLmxpZ2h0KVxuICAgIC8vIHJlbW92ZSBpbnRlcnZhbFxuICAgIGNsZWFySW50ZXJ2YWwodGFyZ2V0W0xJR0hUXS5pbnRlcnZhbClcbiAgICBkZWxldGUgdGFyZ2V0W0xJR0hUXVxuICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgIHRhcmdldC5vZmYoJ3JlbW92ZWQnLCBMaWdodC5saWdodE9mZilcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaWdodFxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xyXG5cclxuaW1wb3J0IHsgU1RBWSwgU1RBVElDLCBSRVBMWSwgQ0VJTF9TSVpFLCBBQklMSVRZX0tFWV9GSVJFLCBBQklMSVRZX0tFWV9NT1ZFLCBBQklMSVRZX1JPVEFURSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCB7IGluc3RhbmNlQnlJdGVtSWQgfSBmcm9tICcuL3V0aWxzJ1xyXG5pbXBvcnQgTWFwV29ybGQgZnJvbSAnLi4vbGliL01hcFdvcmxkJ1xyXG5pbXBvcnQgZ2xvYmFsRXZlbnRNYW5hZ2VyIGZyb20gJy4uL2xpYi9nbG9iYWxFdmVudE1hbmFnZXInXHJcblxyXG5sZXQgaXNHYW1lT3ZlciA9IGZhbHNlXHJcblxyXG5jb25zdCBwaXBlID0gKGZpcnN0LCAuLi5tb3JlKSA9PlxyXG4gIG1vcmUucmVkdWNlKChhY2MsIGN1cnIpID0+ICguLi5hcmdzKSA9PiBjdXJyKGFjYyguLi5hcmdzKSksIGZpcnN0KVxyXG5cclxuY29uc3Qgb2JqZWN0RXZlbnQgPSB7XHJcbiAgYWRkT2JqZWN0IChvYmplY3QsIGJ1bGxldCkge1xyXG4gICAgdGhpcy5hZGRHYW1lT2JqZWN0KGJ1bGxldClcclxuICB9LFxyXG4gIGRpZSAob2JqZWN0KSB7XHJcbiAgICBpc0dhbWVPdmVyID0gdHJ1ZVxyXG4gICAgb2JqZWN0W0FCSUxJVFlfS0VZX0ZJUkVdLmRyb3BCeShvYmplY3QpXHJcbiAgICBvYmplY3RbQUJJTElUWV9LRVlfTU9WRV0uZHJvcEJ5KG9iamVjdClcclxuICAgIG9iamVjdFtBQklMSVRZX1JPVEFURV0uZHJvcEJ5KG9iamVjdClcclxuICAgIG9iamVjdC5zYXkoJ1lvdSBkaWUuJylcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBldmVudHM6XHJcbiAqICB1c2U6IG9iamVjdFxyXG4gKi9cclxuY2xhc3MgTWFwIGV4dGVuZHMgQ29udGFpbmVyIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLm9iamVjdHMgPSB7XHJcbiAgICAgIFtTVEFUSUNdOiBbXSxcclxuICAgICAgW1NUQVldOiBbXSxcclxuICAgICAgW1JFUExZXTogW11cclxuICAgIH1cclxuICAgIHRoaXMubWFwID0gbmV3IENvbnRhaW5lcigpXHJcbiAgICB0aGlzLm1hcC53aWxsUmVtb3ZlQ2hpbGQgPSB0aGlzLndpbGxSZW1vdmVDaGlsZC5iaW5kKHRoaXMpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMubWFwKVxyXG5cclxuICAgIC8vIHBsYXllciBncm91cFxyXG4gICAgdGhpcy5wbGF5ZXJHcm91cCA9IG5ldyBkaXNwbGF5Lkdyb3VwKClcclxuICAgIGxldCBwbGF5ZXJMYXllciA9IG5ldyBkaXNwbGF5LkxheWVyKHRoaXMucGxheWVyR3JvdXApXHJcbiAgICB0aGlzLmFkZENoaWxkKHBsYXllckxheWVyKVxyXG5cclxuICAgIC8vIHBoeXNpY1xyXG4gICAgdGhpcy5tYXBXb3JsZCA9IG5ldyBNYXBXb3JsZCgpXHJcblxyXG4gICAgdGhpcy53aWxsUmVtb3ZlZCA9IFtdXHJcbiAgICB0aGlzLmxpZmUgPSAwXHJcbiAgfVxyXG5cclxuICBsb2FkIChtYXBEYXRhKSB7XHJcbiAgICBsZXQgdGlsZXMgPSBtYXBEYXRhLnRpbGVzXHJcbiAgICBsZXQgY29scyA9IG1hcERhdGEuY29sc1xyXG4gICAgbGV0IHJvd3MgPSBtYXBEYXRhLnJvd3NcclxuICAgIGxldCBpdGVtcyA9IG1hcERhdGEuaXRlbXNcclxuXHJcbiAgICBsZXQgYWRkR2FtZU9iamVjdCA9IChpLCBqLCBpZCwgcGFyYW1zKSA9PiB7XHJcbiAgICAgIGxldCBvID0gaW5zdGFuY2VCeUl0ZW1JZChpZCwgcGFyYW1zKVxyXG4gICAgICB0aGlzLmFkZEdhbWVPYmplY3QobywgaSAqIENFSUxfU0laRSwgaiAqIENFSUxfU0laRSlcclxuICAgICAgcmV0dXJuIFtvLCBpLCBqXVxyXG4gICAgfVxyXG5cclxuICAgIGxldCByZWdpc3Rlck9uID0gKFtvLCBpLCBqXSkgPT4ge1xyXG4gICAgICBvLm9uKCd1c2UnLCAoKSA9PiB0aGlzLmVtaXQoJ3VzZScsIG8pKVxyXG4gICAgICBvLm9uKCdhZGRPYmplY3QnLCBvYmplY3RFdmVudC5hZGRPYmplY3QuYmluZCh0aGlzLCBvKSlcclxuICAgICAgcmV0dXJuIFtvLCBpLCBqXVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sczsgaSsrKSB7XHJcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm93czsgaisrKSB7XHJcbiAgICAgICAgcGlwZShhZGRHYW1lT2JqZWN0LCByZWdpc3Rlck9uKShpLCBqLCB0aWxlc1tqICogY29scyArIGldKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICBsZXQgWyBpZCwgW2ksIGpdLCBwYXJhbXMgXSA9IGl0ZW1cclxuICAgICAgcGlwZShhZGRHYW1lT2JqZWN0LCByZWdpc3Rlck9uKShpLCBqLCBpZCwgcGFyYW1zKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGFkZFBsYXllciAocGxheWVyLCBbaSwgal0pIHtcclxuICAgIC8vIOiou+WGiuS6i+S7tlxyXG4gICAgT2JqZWN0LmVudHJpZXMob2JqZWN0RXZlbnQpLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XHJcbiAgICAgIGxldCBlSW5zdGFuY2UgPSBoYW5kbGVyLmJpbmQodGhpcywgcGxheWVyKVxyXG4gICAgICBwbGF5ZXIub24oZXZlbnROYW1lLCBlSW5zdGFuY2UpXHJcbiAgICAgIHBsYXllci5vbmNlKCdyZW1vdmVkJywgcGxheWVyLm9mZi5iaW5kKHBsYXllciwgZXZlbnROYW1lLCBlSW5zdGFuY2UpKVxyXG4gICAgfSlcclxuICAgIC8vIOaWsOWinuiHs+WcsOWcluS4ilxyXG4gICAgdGhpcy5hZGRHYW1lT2JqZWN0KHBsYXllciwgaSAqIENFSUxfU0laRSwgaiAqIENFSUxfU0laRSlcclxuXHJcbiAgICAvLyBwbGF5ZXIg572u6aCC6aGv56S6XHJcbiAgICBwbGF5ZXIucGFyZW50R3JvdXAgPSB0aGlzLnBsYXllckdyb3VwXHJcblxyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXJcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICBpZiAoaXNHYW1lT3Zlcikge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMub2JqZWN0c1tTVEFZXS5mb3JFYWNoKG8gPT4gby50aWNrKGRlbHRhKSlcclxuICAgIHRoaXMub2JqZWN0c1tSRVBMWV0uZm9yRWFjaChvID0+IG8udGljayhkZWx0YSkpXHJcbiAgICB0aGlzLm1hcFdvcmxkLnVwZGF0ZShkZWx0YSlcclxuICAgIHRoaXMud2lsbFJlbW92ZWQuZm9yRWFjaChjaGlsZCA9PiB7XHJcbiAgICAgIHRoaXMubWFwLnJlbW92ZUNoaWxkKGNoaWxkKVxyXG4gICAgfSlcclxuICAgIHRoaXMubGlmZSArPSBkZWx0YVxyXG4gICAgaWYgKHRoaXMubGlmZSAlIDEwIDwgMSkge1xyXG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgnZmlyZScpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhZGRHYW1lT2JqZWN0IChvLCB4ID0gdW5kZWZpbmVkLCB5ID0gdW5kZWZpbmVkKSB7XHJcbiAgICBpZiAoeCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIG8ucG9zaXRpb25FeC5zZXQoeCwgeSlcclxuICAgIH1cclxuICAgIG8uYW5jaG9yLnNldCgwLjUsIDAuNSlcclxuXHJcbiAgICBsZXQgb0FycmF5ID0gdGhpcy5vYmplY3RzW28udHlwZV1cclxuICAgIG9BcnJheS5wdXNoKG8pXHJcbiAgICBvLm9uY2UoJ3JlbW92ZWQnLCAoKSA9PiB7XHJcbiAgICAgIGxldCBpbnggPSBvQXJyYXkuaW5kZXhPZihvKVxyXG4gICAgICBvQXJyYXkuc3BsaWNlKGlueCwgMSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gYWRkIHRvIHdvcmxkXHJcbiAgICB0aGlzLm1hcFdvcmxkLmFkZChvKVxyXG4gICAgdGhpcy5tYXAuYWRkQ2hpbGQobylcclxuICB9XHJcblxyXG4gIHNldFNjYWxlIChzY2FsZSkge1xyXG4gICAgdGhpcy5zY2FsZS5zZXQoc2NhbGUpXHJcbiAgICB0aGlzLm1hcFdvcmxkLnNjYWxlKHNjYWxlKVxyXG4gIH1cclxuXHJcbiAgc2V0UG9zaXRpb24gKHgsIHkpIHtcclxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXHJcbiAgfVxyXG5cclxuICBkZWJ1ZyAob3B0KSB7XHJcbiAgICB0aGlzLm1hcFdvcmxkLmVuYWJsZVJlbmRlcihvcHQpXHJcbiAgICB0aGlzLm1hcFdvcmxkLmZvbGxvdyh0aGlzLnBsYXllci5ib2R5KVxyXG4gIH1cclxuXHJcbiAgd2lsbFJlbW92ZUNoaWxkIChjaGlsZCkge1xyXG4gICAgdGhpcy53aWxsUmVtb3ZlZC5wdXNoKGNoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWFwXHJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgZGlzcGxheSwgQkxFTkRfTU9ERVMsIFNwcml0ZSB9IGZyb20gJy4vUElYSSdcclxuXHJcbmNsYXNzIE1hcEZvZyBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgbGV0IGxpZ2h0aW5nID0gbmV3IGRpc3BsYXkuTGF5ZXIoKVxyXG4gICAgbGlnaHRpbmcub24oJ2Rpc3BsYXknLCBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICBlbGVtZW50LmJsZW5kTW9kZSA9IEJMRU5EX01PREVTLkFERFxyXG4gICAgfSlcclxuICAgIGxpZ2h0aW5nLnVzZVJlbmRlclRleHR1cmUgPSB0cnVlXHJcbiAgICBsaWdodGluZy5jbGVhckNvbG9yID0gWzAsIDAsIDAsIDFdIC8vIGFtYmllbnQgZ3JheVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQobGlnaHRpbmcpXHJcblxyXG4gICAgdmFyIGxpZ2h0aW5nU3ByaXRlID0gbmV3IFNwcml0ZShsaWdodGluZy5nZXRSZW5kZXJUZXh0dXJlKCkpXHJcbiAgICBsaWdodGluZ1Nwcml0ZS5ibGVuZE1vZGUgPSBCTEVORF9NT0RFUy5NVUxUSVBMWVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQobGlnaHRpbmdTcHJpdGUpXHJcblxyXG4gICAgdGhpcy5saWdodGluZyA9IGxpZ2h0aW5nXHJcbiAgfVxyXG5cclxuICBlbmFibGUgKG1hcCkge1xyXG4gICAgdGhpcy5saWdodGluZy5jbGVhckNvbG9yID0gWzAsIDAsIDAsIDFdXHJcbiAgICBtYXAubWFwLmxpZ2h0aW5nID0gdGhpcy5saWdodGluZ1xyXG4gIH1cclxuXHJcbiAgLy8g5raI6Zmk6L+36ZynXHJcbiAgZGlzYWJsZSAoKSB7XHJcbiAgICB0aGlzLmxpZ2h0aW5nLmNsZWFyQ29sb3IgPSBbMSwgMSwgMSwgMV1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hcEZvZ1xyXG4iLCJpbXBvcnQgeyBFbmdpbmUsIEV2ZW50cywgV29ybGQsIFJlbmRlciwgTW91c2UsIE1vdXNlQ29uc3RyYWludCwgQm9keSB9IGZyb20gJy4vTWF0dGVyJ1xuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxubGV0IFBBUkVOVCA9IFN5bWJvbCgncGFyZW50JylcblxuZnVuY3Rpb24gZm9sbG93IChib2R5KSB7XG4gIGxldCBlbmdpbmUgPSB0aGlzLmVuZ2luZVxuICBsZXQgaW5pdGlhbEVuZ2luZUJvdW5kc01heFggPSB0aGlzLmluaXRpYWxFbmdpbmVCb3VuZHNNYXhYXG4gIGxldCBpbml0aWFsRW5naW5lQm91bmRzTWF4WSA9IHRoaXMuaW5pdGlhbEVuZ2luZUJvdW5kc01heFlcbiAgbGV0IGNlbnRlclggPSAtdGhpcy5jZW50ZXIueFxuICBsZXQgY2VudGVyWSA9IC10aGlzLmNlbnRlci55XG4gIGxldCBib3VuZHMgPSBlbmdpbmUucmVuZGVyLmJvdW5kc1xuICBsZXQgYm9keVggPSBib2R5LnBvc2l0aW9uLnhcbiAgbGV0IGJvZHlZID0gYm9keS5wb3NpdGlvbi55XG5cbiAgLy8gRmFsbG93IEhlcm8gWFxuICBib3VuZHMubWluLnggPSBjZW50ZXJYICsgYm9keVhcbiAgYm91bmRzLm1heC54ID0gY2VudGVyWCArIGJvZHlYICsgaW5pdGlhbEVuZ2luZUJvdW5kc01heFhcblxuICAvLyBGYWxsb3cgSGVybyBZXG4gIGJvdW5kcy5taW4ueSA9IGNlbnRlclkgKyBib2R5WVxuICBib3VuZHMubWF4LnkgPSBjZW50ZXJZICsgYm9keVkgKyBpbml0aWFsRW5naW5lQm91bmRzTWF4WVxuXG4gIE1vdXNlLnNldE9mZnNldCh0aGlzLm1vdXNlQ29uc3RyYWludC5tb3VzZSwgYm91bmRzLm1pbilcbn1cblxuY2xhc3MgTWFwV29ybGQge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gcGh5c2ljXG4gICAgbGV0IGVuZ2luZSA9IEVuZ2luZS5jcmVhdGUoKVxuXG4gICAgbGV0IHdvcmxkID0gZW5naW5lLndvcmxkXG4gICAgd29ybGQuZ3Jhdml0eS55ID0gMFxuICAgIC8vIGFwcGx5IGZvcmNlIGF0IG5leHQgdXBkYXRlXG4gICAgd29ybGQuZm9yY2VzV2FpdEZvckFwcGx5ID0gW11cblxuICAgIEV2ZW50cy5vbihlbmdpbmUsICdjb2xsaXNpb25TdGFydCcsIGV2ZW50ID0+IHtcbiAgICAgIHZhciBwYWlycyA9IGV2ZW50LnBhaXJzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBwYWlyID0gcGFpcnNbaV1cbiAgICAgICAgbGV0IG8xID0gcGFpci5ib2R5QVtQQVJFTlRdXG4gICAgICAgIGxldCBvMiA9IHBhaXIuYm9keUJbUEFSRU5UXVxuICAgICAgICBvMS5lbWl0KCdjb2xsaWRlJywgbzIpXG4gICAgICAgIG8yLmVtaXQoJ2NvbGxpZGUnLCBvMSlcbiAgICAgIH1cbiAgICB9KVxuICAgIEV2ZW50cy5vbihlbmdpbmUsICdiZWZvcmVVcGRhdGUnLCBldmVudCA9PiB7XG4gICAgICB3b3JsZC5mb3JjZXNXYWl0Rm9yQXBwbHkuZm9yRWFjaCgoe293bmVyLCB2ZWN0b3J9KSA9PiB7XG4gICAgICAgIGlmIChvd25lcikge1xuICAgICAgICAgIEJvZHkuYXBwbHlGb3JjZShvd25lci5ib2R5LCBvd25lci5wb3NpdGlvbkV4LCB2ZWN0b3IpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB3b3JsZC5mb3JjZXNXYWl0Rm9yQXBwbHkgPSBbXVxuICAgIH0pXG5cbiAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZVxuICAgIHRoaXMubW91c2VDb25zdHJhaW50ID0gTW91c2VDb25zdHJhaW50LmNyZWF0ZShlbmdpbmUpXG4gICAgV29ybGQuYWRkKGVuZ2luZS53b3JsZCwgdGhpcy5tb3VzZUNvbnN0cmFpbnQpXG4gIH1cblxuICBhZGQgKG8pIHtcbiAgICBpZiAoby50eXBlID09PSBTVEFUSUMpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgd29ybGQgPSB0aGlzLmVuZ2luZS53b3JsZFxuICAgIG8uYWRkQm9keSgpXG4gICAgbGV0IGJvZHkgPSBvLmJvZHlcbiAgICBvLm9uY2UoJ3JlbW92ZWQnLCAoKSA9PiB7XG4gICAgICBXb3JsZC5yZW1vdmUod29ybGQsIGJvZHkpXG4gICAgfSlcbiAgICBib2R5W1BBUkVOVF0gPSBvXG4gICAgYm9keS53b3JsZCA9IHdvcmxkXG4gICAgV29ybGQuYWRkQm9keSh3b3JsZCwgYm9keSlcbiAgfVxuXG4gIHVwZGF0ZSAoZGVsdGEpIHtcbiAgICBFbmdpbmUudXBkYXRlKHRoaXMuZW5naW5lLCBkZWx0YSAqIDE2LjY2NilcbiAgfVxuXG4gIGVuYWJsZVJlbmRlciAoe3dpZHRoLCBoZWlnaHR9KSB7XG4gICAgbGV0IGVuZ2luZSA9IHRoaXMuZW5naW5lXG4gICAgLy8gY3JlYXRlIGEgcmVuZGVyZXJcbiAgICB2YXIgcmVuZGVyID0gUmVuZGVyLmNyZWF0ZSh7XG4gICAgICBlbGVtZW50OiBkb2N1bWVudC5ib2R5LFxuICAgICAgZW5naW5lLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICB3aWR0aDogd2lkdGggKiAyLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodCAqIDIsXG4gICAgICAgIHdpcmVmcmFtZXM6IHRydWUsXG4gICAgICAgIGhhc0JvdW5kczogdHJ1ZSxcbiAgICAgICAgd2lyZWZyYW1lQmFja2dyb3VuZDogJ3RyYW5zcGFyZW50J1xuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBydW4gdGhlIHJlbmRlcmVyXG4gICAgUmVuZGVyLnJ1bihyZW5kZXIpXG4gICAgdGhpcy5lbmdpbmUucmVuZGVyID0gcmVuZGVyXG4gICAgdGhpcy5pbml0aWFsRW5naW5lQm91bmRzTWF4WCA9IHJlbmRlci5ib3VuZHMubWF4LnhcbiAgICB0aGlzLmluaXRpYWxFbmdpbmVCb3VuZHNNYXhZID0gcmVuZGVyLmJvdW5kcy5tYXgueVxuICAgIHRoaXMuY2VudGVyID0ge1xuICAgICAgeDogd2lkdGggLyAyLFxuICAgICAgeTogaGVpZ2h0IC8gMlxuICAgIH1cbiAgfVxuXG4gIGZvbGxvdyAoYm9keSkge1xuICAgIEV2ZW50cy5vbih0aGlzLmVuZ2luZSwgJ2JlZm9yZVVwZGF0ZScsIGZvbGxvdy5iaW5kKHRoaXMsIGJvZHkpKVxuICB9XG5cbiAgc2NhbGUgKHNjYWxlWCwgc2NhbGVZID0gc2NhbGVYKSB7XG4gICAgTW91c2Uuc2V0U2NhbGUodGhpcy5tb3VzZUNvbnN0cmFpbnQubW91c2UsIHtcbiAgICAgIHg6IHRoaXMuc2NhbGVYLFxuICAgICAgeTogdGhpcy5zY2FsZVlcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1hcFdvcmxkXG4iLCIvKiBnbG9iYWwgTWF0dGVyICovXG5leHBvcnQgY29uc3QgRW5naW5lID0gTWF0dGVyLkVuZ2luZVxuZXhwb3J0IGNvbnN0IFJlbmRlciA9IE1hdHRlci5SZW5kZXJcbmV4cG9ydCBjb25zdCBXb3JsZCA9IE1hdHRlci5Xb3JsZFxuZXhwb3J0IGNvbnN0IEJvZGllcyA9IE1hdHRlci5Cb2RpZXNcbmV4cG9ydCBjb25zdCBFdmVudHMgPSBNYXR0ZXIuRXZlbnRzXG5leHBvcnQgY29uc3QgQm9keSA9IE1hdHRlci5Cb2R5XG5leHBvcnQgY29uc3QgVmVjdG9yID0gTWF0dGVyLlZlY3RvclxuZXhwb3J0IGNvbnN0IENvbXBvc2l0ZSA9IE1hdHRlci5Db21wb3NpdGVcbmV4cG9ydCBjb25zdCBNb3VzZSA9IE1hdHRlci5Nb3VzZVxuZXhwb3J0IGNvbnN0IE1vdXNlQ29uc3RyYWludCA9IE1hdHRlci5Nb3VzZUNvbnN0cmFpbnRcbiIsImltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJ1xuXG5jb25zdCBNQVhfTUVTU0FHRV9DT1VOVCA9IDUwMFxuXG5jbGFzcyBNZXNzYWdlcyBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5fbWVzc2FnZXMgPSBbXVxuICB9XG5cbiAgZ2V0IGxpc3QgKCkge1xuICAgIHJldHVybiB0aGlzLl9tZXNzYWdlc1xuICB9XG5cbiAgYWRkIChtc2cpIHtcbiAgICBsZXQgbGVuZ3RoID0gdGhpcy5fbWVzc2FnZXMudW5zaGlmdChtc2cpXG4gICAgaWYgKGxlbmd0aCA+IE1BWF9NRVNTQUdFX0NPVU5UKSB7XG4gICAgICB0aGlzLl9tZXNzYWdlcy5wb3AoKVxuICAgIH1cbiAgICB0aGlzLmVtaXQoJ21vZGlmaWVkJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgTWVzc2FnZXMoKVxuIiwiLyogZ2xvYmFsIFBJWEkgKi9cblxuZXhwb3J0IGNvbnN0IEFwcGxpY2F0aW9uID0gUElYSS5BcHBsaWNhdGlvblxuZXhwb3J0IGNvbnN0IENvbnRhaW5lciA9IFBJWEkuQ29udGFpbmVyXG5leHBvcnQgY29uc3QgbG9hZGVyID0gUElYSS5sb2FkZXJcbmV4cG9ydCBjb25zdCByZXNvdXJjZXMgPSBQSVhJLmxvYWRlci5yZXNvdXJjZXNcbmV4cG9ydCBjb25zdCBTcHJpdGUgPSBQSVhJLlNwcml0ZVxuZXhwb3J0IGNvbnN0IFRleHQgPSBQSVhJLlRleHRcbmV4cG9ydCBjb25zdCBUZXh0U3R5bGUgPSBQSVhJLlRleHRTdHlsZVxuXG5leHBvcnQgY29uc3QgR3JhcGhpY3MgPSBQSVhJLkdyYXBoaWNzXG5leHBvcnQgY29uc3QgQkxFTkRfTU9ERVMgPSBQSVhJLkJMRU5EX01PREVTXG5leHBvcnQgY29uc3QgZGlzcGxheSA9IFBJWEkuZGlzcGxheVxuZXhwb3J0IGNvbnN0IHV0aWxzID0gUElYSS51dGlsc1xuZXhwb3J0IGNvbnN0IE9ic2VydmFibGVQb2ludCA9IFBJWEkuT2JzZXJ2YWJsZVBvaW50XG4iLCJpbXBvcnQgeyBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIGRpc3BsYXkuTGF5ZXIge1xuICBjcmVhdGUgKCkge31cblxuICBkZXN0cm95ICgpIHt9XG5cbiAgdGljayAoZGVsdGEpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lXG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY29uc3QgVGV4dHVyZSA9IHtcbiAgZ2V0IFRlcnJhaW5BdGxhcyAoKSB7XG4gICAgcmV0dXJuIHJlc291cmNlc1snaW1hZ2VzL3RlcnJhaW5fYXRsYXMuanNvbiddXG4gIH0sXG4gIGdldCBCYXNlT3V0QXRsYXMgKCkge1xuICAgIHJldHVybiByZXNvdXJjZXNbJ2ltYWdlcy9iYXNlX291dF9hdGxhcy5qc29uJ11cbiAgfSxcblxuICBnZXQgQWlyICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2VtcHR5LnBuZyddXG4gIH0sXG4gIGdldCBHcmFzcyAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydncmFzcy5wbmcnXVxuICB9LFxuICBnZXQgR3JvdW5kICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2JyaWNrLXRpbGUucG5nJ11cbiAgfSxcblxuICBnZXQgV2FsbCAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWyd3YWxsLnBuZyddXG4gIH0sXG4gIGdldCBJcm9uRmVuY2UgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1snaXJvbi1mZW5jZS5wbmcnXVxuICB9LFxuICBnZXQgUm9vdCAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydyb290LnBuZyddXG4gIH0sXG4gIGdldCBUcmVlICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ3RyZWUucG5nJ11cbiAgfSxcblxuICBnZXQgVHJlYXN1cmUgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1sndHJlYXN1cmUucG5nJ11cbiAgfSxcbiAgZ2V0IERvb3IgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1snaXJvbi1mZW5jZS5wbmcnXVxuICB9LFxuICBnZXQgVG9yY2ggKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1sndG9yY2gucG5nJ11cbiAgfSxcbiAgZ2V0IEdyYXNzRGVjb3JhdGUxICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2dyYXNzLWRlY29yYXRlLTEucG5nJ11cbiAgfSxcbiAgZ2V0IEJ1bGxldCAoKSB7XG4gICAgcmV0dXJuIHJlc291cmNlc1snaW1hZ2VzL2ZpcmVfYm9sdC5wbmcnXS50ZXh0dXJlXG4gIH0sXG5cbiAgZ2V0IFJvY2sgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1sncm9jay5wbmcnXVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHR1cmVcbiIsImNvbnN0IGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJXG5cbmNsYXNzIFZlY3RvciB7XG4gIGNvbnN0cnVjdG9yICh4LCB5KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUG9pbnQgKHApIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihwLngsIHAueSlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUmFkTGVuZ3RoIChyYWQsIGxlbmd0aCkge1xuICAgIGxldCB4ID0gbGVuZ3RoICogTWF0aC5jb3MocmFkKVxuICAgIGxldCB5ID0gbGVuZ3RoICogTWF0aC5zaW4ocmFkKVxuICAgIHJldHVybiBuZXcgVmVjdG9yKHgsIHkpXG4gIH1cblxuICBjbG9uZSAoKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnkpXG4gIH1cblxuICBhZGQgKHYpIHtcbiAgICB0aGlzLnggKz0gdi54XG4gICAgdGhpcy55ICs9IHYueVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdWIgKHYpIHtcbiAgICB0aGlzLnggLT0gdi54XG4gICAgdGhpcy55IC09IHYueVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbnZlcnQgKCkge1xuICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKC0xKVxuICB9XG5cbiAgbXVsdGlwbHlTY2FsYXIgKHMpIHtcbiAgICB0aGlzLnggKj0gc1xuICAgIHRoaXMueSAqPSBzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRpdmlkZVNjYWxhciAocykge1xuICAgIGlmIChzID09PSAwKSB7XG4gICAgICB0aGlzLnggPSAwXG4gICAgICB0aGlzLnkgPSAwXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKDEgLyBzKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZG90ICh2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueVxuICB9XG5cbiAgZ2V0IGxlbmd0aCAoKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkpXG4gIH1cblxuICBsZW5ndGhTcSAoKSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueVxuICB9XG5cbiAgbm9ybWFsaXplICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIodGhpcy5sZW5ndGgpXG4gIH1cblxuICBkaXN0YW5jZVRvICh2KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3RhbmNlVG9TcSh2KSlcbiAgfVxuXG4gIGRpc3RhbmNlVG9TcSAodikge1xuICAgIGxldCBkeCA9IHRoaXMueCAtIHYueFxuICAgIGxldCBkeSA9IHRoaXMueSAtIHYueVxuICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeVxuICB9XG5cbiAgc2V0ICh4LCB5KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0WCAoeCkge1xuICAgIHRoaXMueCA9IHhcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0WSAoeSkge1xuICAgIHRoaXMueSA9IHlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0TGVuZ3RoIChsKSB7XG4gICAgdmFyIG9sZExlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgaWYgKG9sZExlbmd0aCAhPT0gMCAmJiBsICE9PSBvbGRMZW5ndGgpIHtcbiAgICAgIHRoaXMubXVsdGlwbHlTY2FsYXIobCAvIG9sZExlbmd0aClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGxlcnAgKHYsIGFscGhhKSB7XG4gICAgdGhpcy54ICs9ICh2LnggLSB0aGlzLngpICogYWxwaGFcbiAgICB0aGlzLnkgKz0gKHYueSAtIHRoaXMueSkgKiBhbHBoYVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBnZXQgcmFkICgpIHtcbiAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueClcbiAgfVxuXG4gIGdldCBkZWcgKCkge1xuICAgIHJldHVybiB0aGlzLnJhZCAqIGRlZ3JlZXNcbiAgfVxuXG4gIGVxdWFscyAodikge1xuICAgIHJldHVybiB0aGlzLnggPT09IHYueCAmJiB0aGlzLnkgPT09IHYueVxuICB9XG5cbiAgcm90YXRlICh0aGV0YSkge1xuICAgIHZhciB4dGVtcCA9IHRoaXMueFxuICAgIHRoaXMueCA9IHRoaXMueCAqIE1hdGguY29zKHRoZXRhKSAtIHRoaXMueSAqIE1hdGguc2luKHRoZXRhKVxuICAgIHRoaXMueSA9IHh0ZW1wICogTWF0aC5zaW4odGhldGEpICsgdGhpcy55ICogTWF0aC5jb3ModGhldGEpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWZWN0b3JcbiIsImNsYXNzIEdsb2JhbEV2ZW50TWFuYWdlciB7XG4gIHNldEludGVyYWN0aW9uIChpbnRlcmFjdGlvbikge1xuICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBpbnRlcmFjdGlvblxuICB9XG5cbiAgb24gKGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIHRoaXMuaW50ZXJhY3Rpb24ub24oZXZlbnROYW1lLCBoYW5kbGVyKVxuICB9XG5cbiAgb2ZmIChldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmludGVyYWN0aW9uLm9mZihldmVudE5hbWUsIGhhbmRsZXIpXG4gIH1cblxuICBlbWl0IChldmVudE5hbWUsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLmludGVyYWN0aW9uLmVtaXQoZXZlbnROYW1lLCAuLi5hcmdzKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBHbG9iYWxFdmVudE1hbmFnZXIoKVxuIiwiaW1wb3J0IFdhbGwgZnJvbSAnLi4vb2JqZWN0cy9XYWxsJ1xyXG5pbXBvcnQgQWlyIGZyb20gJy4uL29iamVjdHMvQWlyJ1xyXG5pbXBvcnQgR3Jhc3MgZnJvbSAnLi4vb2JqZWN0cy9HcmFzcydcclxuaW1wb3J0IFRyZWFzdXJlIGZyb20gJy4uL29iamVjdHMvVHJlYXN1cmUnXHJcbmltcG9ydCBEb29yIGZyb20gJy4uL29iamVjdHMvRG9vcidcclxuaW1wb3J0IFRvcmNoIGZyb20gJy4uL29iamVjdHMvVG9yY2gnXHJcbmltcG9ydCBHcm91bmQgZnJvbSAnLi4vb2JqZWN0cy9Hcm91bmQnXHJcbmltcG9ydCBJcm9uRmVuY2UgZnJvbSAnLi4vb2JqZWN0cy9Jcm9uRmVuY2UnXHJcbmltcG9ydCBSb290IGZyb20gJy4uL29iamVjdHMvUm9vdCdcclxuaW1wb3J0IFRyZWUgZnJvbSAnLi4vb2JqZWN0cy9UcmVlJ1xyXG5pbXBvcnQgR3Jhc3NEZWNvcmF0ZTEgZnJvbSAnLi4vb2JqZWN0cy9HcmFzc0RlY29yYXRlMSdcclxuaW1wb3J0IEZpcmVCb2x0IGZyb20gJy4uL29iamVjdHMvc2tpbGxzL0ZpcmVCb2x0J1xyXG5pbXBvcnQgRmlyZVN0YXIgZnJvbSAnLi4vb2JqZWN0cy9za2lsbHMvRmlyZVN0YXInXHJcbmltcG9ydCBXYWxsU2hvb3RCb2x0IGZyb20gJy4uL29iamVjdHMvV2FsbFNob290Qm9sdCdcclxuXHJcbmltcG9ydCBNb3ZlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL01vdmUnXHJcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhJ1xyXG5pbXBvcnQgT3BlcmF0ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9PcGVyYXRlJ1xyXG5cclxuY29uc3QgUEkgPSBNYXRoLlBJXHJcblxyXG4vLyAweDAwMDAgfiAweDAwMGZcclxuY29uc3QgSXRlbXNTdGF0aWMgPSBbXHJcbiAgQWlyLCBHcmFzcywgR3JvdW5kXHJcbl1cclxuLy8gMHgwMDEwIH4gMHgwMGZmXHJcbmNvbnN0IEl0ZW1zU3RheSA9IFtcclxuICAvLyAweDAwMTAsIDB4MDAxMSwgMHgwMDEyXHJcbiAgV2FsbCwgSXJvbkZlbmNlLCBSb290LCBUcmVlXHJcbl1cclxuLy8gMHgwMTAwIH4gMHgwMWZmXHJcbmNvbnN0IEl0ZW1zT3RoZXIgPSBbXHJcbiAgVHJlYXN1cmUsIERvb3IsIFRvcmNoLCBHcmFzc0RlY29yYXRlMSwgRmlyZUJvbHQsIFdhbGxTaG9vdEJvbHQsIEZpcmVTdGFyXHJcbl1cclxuLy8gMHgwMjAwIH4gMHgwMmZmXHJcbmNvbnN0IEFiaWxpdGllcyA9IFtcclxuICBNb3ZlLCBDYW1lcmEsIE9wZXJhdGVcclxuXVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbmNlQnlJdGVtSWQgKGl0ZW1JZCwgcGFyYW1zKSB7XHJcbiAgbGV0IFR5cGVzXHJcbiAgaXRlbUlkID0gcGFyc2VJbnQoaXRlbUlkLCAxNilcclxuICBpZiAoKGl0ZW1JZCAmIDB4ZmZmMCkgPT09IDApIHtcclxuICAgIC8vIOWcsOadv1xyXG4gICAgVHlwZXMgPSBJdGVtc1N0YXRpY1xyXG4gIH0gZWxzZSBpZiAoKGl0ZW1JZCAmIDB4ZmYwMCkgPT09IDApIHtcclxuICAgIFR5cGVzID0gSXRlbXNTdGF5XHJcbiAgICBpdGVtSWQgLT0gMHgwMDEwXHJcbiAgfSBlbHNlIGlmICgoaXRlbUlkICYgMHhmZjAwKSA+Pj4gOCA9PT0gMSkge1xyXG4gICAgVHlwZXMgPSBJdGVtc090aGVyXHJcbiAgICBpdGVtSWQgLT0gMHgwMTAwXHJcbiAgfSBlbHNlIHtcclxuICAgIFR5cGVzID0gQWJpbGl0aWVzXHJcbiAgICBpdGVtSWQgLT0gMHgwMjAwXHJcbiAgfVxyXG4gIHJldHVybiBuZXcgVHlwZXNbaXRlbUlkXShwYXJhbXMpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjYWxjQXBvdGhlbSAobywgcmFkKSB7XHJcbiAgbGV0IHdpZHRoID0gby53aWR0aCAvIDJcclxuICBsZXQgaGVpZ2h0ID0gby5oZWlnaHQgLyAyXHJcbiAgbGV0IHJlY3RSYWQgPSBNYXRoLmF0YW4yKGhlaWdodCwgd2lkdGgpXHJcbiAgbGV0IGxlblxyXG4gIC8vIOWmguaenOWwhOWHuuinkuepv+mBjiB3aWR0aFxyXG4gIGxldCByMSA9IE1hdGguYWJzKHJhZCAlIFBJKVxyXG4gIGxldCByMiA9IE1hdGguYWJzKHJlY3RSYWQgJSBQSSlcclxuICBpZiAocjEgPCByMiB8fCByMSA+IHIyICsgUEkgLyAyKSB7XHJcbiAgICBsZW4gPSB3aWR0aCAvIE1hdGguY29zKHJhZClcclxuICB9IGVsc2Uge1xyXG4gICAgbGVuID0gaGVpZ2h0IC8gTWF0aC5zaW4ocmFkKVxyXG4gIH1cclxuICByZXR1cm4gTWF0aC5hYnMobGVuKVxyXG59XHJcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBBaXIgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuQWlyKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQWlyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcbmltcG9ydCB7IFJFUExZLCBBQklMSVRZX01PVkUsIEFCSUxJVFlfREFNQUdFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuaW1wb3J0IExlYXJuIGZyb20gJy4vYWJpbGl0aWVzL0xlYXJuJ1xuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcbmltcG9ydCBIZWFsdGggZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvSGVhbHRoJ1xuaW1wb3J0IERhbWFnZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9EYW1hZ2UnXG5cbmNsYXNzIEJ1bGxldCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoe3NwZWVkID0gMSwgZGFtYWdlID0gMSwgZm9yY2UgPSAwLCBocCA9IDF9ID0ge30pIHtcbiAgICBzdXBlcihUZXh0dXJlLkJ1bGxldClcblxuICAgIG5ldyBMZWFybigpLmNhcnJ5QnkodGhpcylcbiAgICAgIC5sZWFybihuZXcgTW92ZShbc3BlZWQsIDBdKSlcbiAgICAgIC5sZWFybihuZXcgSGVhbHRoKGhwKSlcbiAgICAgIC5sZWFybihuZXcgRGFtYWdlKFtkYW1hZ2UsIGZvcmNlXSkpXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbignZGllJywgdGhpcy5vbkRpZS5iaW5kKHRoaXMpKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gUkVQTFkgfVxuXG4gIGJvZHlPcHQgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1NlbnNvcjogdHJ1ZSxcbiAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICBjYXRlZ29yeTogMGIxMDAsXG4gICAgICAgIG1hc2s6IDBiMTAxXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcbiAgICBpZiAodGhpcy5vd25lciA9PT0gb3BlcmF0b3IgfHxcbiAgICAgIHRoaXMub3duZXIgPT09IG9wZXJhdG9yLm93bmVyKSB7XG4gICAgICAvLyDpgb/lhY3oh6rmrrpcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgZGFtYWdlQWJpbGl0eSA9IHRoaXNbQUJJTElUWV9EQU1BR0VdXG4gICAgZGFtYWdlQWJpbGl0eS5lZmZlY3Qob3BlcmF0b3IpXG4gICAgLy8g5bCN5pa55LiN5pivIHNlbnNvcijku6Pooajlr6bpq5Tnianku7YsIGkuZS4gV2FsbC9QbGF5ZXIp77yM6Ieq5oiR5q+A5ruFXG4gICAgaWYgKCFvcGVyYXRvci5ib2R5T3B0KCkuaXNTZW5zb3IpIHtcbiAgICAgIHRoaXMub25EaWUoKVxuICAgIH1cbiAgfVxuXG4gIG9uRGllICgpIHtcbiAgICB0aGlzLnBhcmVudC53aWxsUmVtb3ZlQ2hpbGQodGhpcylcbiAgfVxuXG4gIHNldE93bmVyIChvd25lcikge1xuICAgIHRoaXMub3duZXIgPSBvd25lclxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnQnVsbGV0J1xuICB9XG5cbiAgc2F5ICgpIHtcbiAgICAvLyBzYXkgbm90aGluZ1xuICB9XG5cbiAgc2V0RGlyZWN0aW9uICh2ZWN0b3IpIHtcbiAgICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzW0FCSUxJVFlfTU9WRV1cbiAgICBpZiAobW92ZUFiaWxpdHkpIHtcbiAgICAgIG1vdmVBYmlsaXR5LnNldERpcmVjdGlvbih2ZWN0b3IpXG4gICAgICB0aGlzLnJvdGF0ZSh2ZWN0b3IucmFkKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCdWxsZXRcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuaW1wb3J0IHsgUkVQTFksIEFCSUxJVFlfTUFOQSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmltcG9ydCBMZWFybiBmcm9tICcuL2FiaWxpdGllcy9MZWFybidcbmltcG9ydCBNb3ZlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL01vdmUnXG5pbXBvcnQgS2V5TW92ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9LZXlNb3ZlJ1xuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEnXG5pbXBvcnQgQ2FycnkgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FycnknXG5pbXBvcnQgRmlyZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9GaXJlJ1xuaW1wb3J0IEtleUZpcmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvS2V5RmlyZSdcbmltcG9ydCBSb3RhdGUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvUm90YXRlJ1xuaW1wb3J0IEhlYWx0aCBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9IZWFsdGgnXG5pbXBvcnQgTWFuYSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9NYW5hJ1xuaW1wb3J0IEZpcmVCb2x0IGZyb20gJy4uL29iamVjdHMvc2tpbGxzL0ZpcmVCb2x0J1xuXG5jbGFzcyBDYXQgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFRleHR1cmUuUm9jaylcblxuICAgIGxldCBjYXJyeSA9IG5ldyBDYXJyeSgzKVxuICAgIG5ldyBMZWFybigpLmNhcnJ5QnkodGhpcylcbiAgICAgIC5sZWFybihuZXcgTW92ZShbMV0pKVxuICAgICAgLmxlYXJuKG5ldyBLZXlNb3ZlKCkpXG4gICAgICAubGVhcm4obmV3IENhbWVyYSg1KSlcbiAgICAgIC5sZWFybihjYXJyeSlcbiAgICAgIC5sZWFybihuZXcgRmlyZSgpKVxuICAgICAgLmxlYXJuKG5ldyBSb3RhdGUoKSlcbiAgICAgIC5sZWFybihuZXcgS2V5RmlyZSgpKVxuICAgICAgLmxlYXJuKG5ldyBIZWFsdGgoMjApKVxuICAgICAgLmxlYXJuKG5ldyBNYW5hKDIwKSlcblxuICAgIGNhcnJ5LnRha2UobmV3IEZpcmVCb2x0KDApLCBJbmZpbml0eSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFJFUExZIH1cblxuICBib2R5T3B0ICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgIGNhdGVnb3J5OiAwYjEsXG4gICAgICAgIG1hc2s6IDBiMTExXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICB0aGlzW0FCSUxJVFlfTUFOQV0udGljayhkZWx0YSlcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3lvdSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDYXRcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xyXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXHJcblxyXG5pbXBvcnQgeyBTVEFZLCBBQklMSVRZX09QRVJBVEUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuY2xhc3MgRG9vciBleHRlbmRzIEdhbWVPYmplY3Qge1xyXG4gIGNvbnN0cnVjdG9yIChtYXApIHtcclxuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxyXG4gICAgc3VwZXIoVGV4dHVyZS5Eb29yKVxyXG5cclxuICAgIHRoaXMubWFwID0gbWFwWzBdXHJcbiAgICB0aGlzLnRvUG9zaXRpb24gPSBtYXBbMV1cclxuXHJcbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cclxuXHJcbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcclxuICAgIGxldCBhYmlsaXR5ID0gb3BlcmF0b3JbQUJJTElUWV9PUEVSQVRFXVxyXG4gICAgaWYgKGFiaWxpdHkpIHtcclxuICAgICAgYWJpbGl0eSh0aGlzKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3BlcmF0b3IuZW1pdCgnY29sbGlkZScsIHRoaXMpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBbQUJJTElUWV9PUEVSQVRFXSAoKSB7XHJcbiAgICB0aGlzLnNheShbJ0dldCBpbiAnLCB0aGlzLm1hcCwgJyBub3cuJ10uam9pbignJykpXHJcbiAgICB0aGlzLmVtaXQoJ3VzZScpXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ0Rvb3InXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEb29yXHJcbiIsImltcG9ydCB7IFNwcml0ZSwgT2JzZXJ2YWJsZVBvaW50IH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgeyBCb2RpZXMsIEJvZHkgfSBmcm9tICcuLi9saWIvTWF0dGVyJ1xuaW1wb3J0IHsgU1RBWSwgU1RBVElDLCBBQklMSVRZX01PVkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IG1lc3NhZ2VzIGZyb20gJy4uL2xpYi9NZXNzYWdlcydcblxuZnVuY3Rpb24gb25TY2FsZSAoKSB7XG4gIHRoaXMuc2NhbGUuY29weSh0aGlzLnNjYWxlRXgpXG59XG5cbmZ1bmN0aW9uIG9uUG9zaXRpb24gKCkge1xuICBsZXQgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uRXhcbiAgdGhpcy5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxufVxuXG5mdW5jdGlvbiBib2R5T3B0ICgpIHtcbiAgbGV0IG1vdmVBYmlsaXR5ID0gdGhpc1tBQklMSVRZX01PVkVdXG4gIGxldCBmcmljdGlvbiA9IChtb3ZlQWJpbGl0eSAmJiBtb3ZlQWJpbGl0eS5mcmljdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgID8gbW92ZUFiaWxpdHkuZnJpY3Rpb25cbiAgICA6IDAuMVxuICBsZXQgZnJpY3Rpb25BaXIgPSAobW92ZUFiaWxpdHkgJiYgbW92ZUFiaWxpdHkuZnJpY3Rpb25BaXIgIT09IHVuZGVmaW5lZClcbiAgICA/IG1vdmVBYmlsaXR5LmZyaWN0aW9uQWlyXG4gICAgOiAwLjAxXG4gIGxldCBkZW5zaXR5ID0gdGhpcy5kZW5zaXR5ID8gdGhpcy5kZW5zaXR5IDogMC4wMDFcbiAgcmV0dXJuIHtcbiAgICBpc1N0YXRpYzogdGhpcy50eXBlID09PSBTVEFZLFxuICAgIGZyaWN0aW9uLFxuICAgIGZyaWN0aW9uQWlyLFxuICAgIGZyaWN0aW9uU3RhdGljOiBmcmljdGlvbixcbiAgICBkZW5zaXR5XG4gIH1cbn1cblxuY2xhc3MgR2FtZU9iamVjdCBleHRlbmRzIFNwcml0ZSB7XG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncylcbiAgICB0aGlzLnNjYWxlRXggPSBuZXcgT2JzZXJ2YWJsZVBvaW50KG9uU2NhbGUsIHRoaXMpXG4gICAgdGhpcy5wb3NpdGlvbkV4ID0gbmV3IE9ic2VydmFibGVQb2ludChvblBvc2l0aW9uLCB0aGlzKVxuICB9XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG5cbiAgYm9keU9wdCAoKSB7XG4gICAgcmV0dXJuIHt9XG4gIH1cblxuICBhZGRCb2R5ICgpIHtcbiAgICBpZiAodGhpcy5ib2R5KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IG9wdCA9IE9iamVjdC5hc3NpZ24oYm9keU9wdC5jYWxsKHRoaXMpLCB0aGlzLmJvZHlPcHQoKSlcbiAgICBsZXQgYm9keSA9IEJvZGllcy5yZWN0YW5nbGUodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBvcHQpXG4gICAgLy8gc3luYyBwaHlzaWMgYm9keSAmIGRpc3BsYXkgcG9zaXRpb25cbiAgICBib2R5LnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkV4XG4gICAgdGhpcy5ib2R5ID0gYm9keVxuICB9XG5cbiAgcm90YXRlIChyYWQsIGRlbHRhID0gZmFsc2UpIHtcbiAgICB0aGlzLnJvdGF0aW9uID0gZGVsdGEgPyB0aGlzLnJvdGF0aW9uICsgcmFkIDogcmFkXG4gICAgaWYgKHRoaXMuYm9keSkge1xuICAgICAgQm9keS5zZXRBbmdsZSh0aGlzLmJvZHksIHJhZClcbiAgICB9XG4gIH1cblxuICBzYXkgKG1zZykge1xuICAgIG1lc3NhZ2VzLmFkZChtc2cpXG4gIH1cblxuICB0aWNrIChkZWx0YSkge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2FtZU9iamVjdFxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdyYXNzIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLkdyYXNzKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3Jhc3NcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBHcmFzc0RlY29yYXRlMSBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoVGV4dHVyZS5HcmFzc0RlY29yYXRlMSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnR3Jhc3NEZWNvcmF0ZTEnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3Jhc3NEZWNvcmF0ZTFcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBHcm91bmQgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuR3JvdW5kKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdHcm91bmQnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3JvdW5kXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIElyb25GZW5jZSBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgc3VwZXIoVGV4dHVyZS5Jcm9uRmVuY2UpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSXJvbkZlbmNlXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFJvb3QgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuUm9vdClcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSb290XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IExpZ2h0IGZyb20gJy4uL2xpYi9MaWdodCdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIFRvcmNoIGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgc3VwZXIoVGV4dHVyZS5Ub3JjaClcclxuXHJcbiAgICBsZXQgcmFkaXVzID0gMlxyXG5cclxuICAgIHRoaXMub24oJ2FkZGVkJywgTGlnaHQubGlnaHRPbi5iaW5kKG51bGwsIHRoaXMsIHJhZGl1cywgMC45NSkpXHJcbiAgICB0aGlzLm9uKCdyZW1vdmVlZCcsIExpZ2h0LmxpZ2h0T2ZmLmJpbmQobnVsbCwgdGhpcykpXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ3RvcmNoJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVG9yY2hcclxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXHJcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcclxuXHJcbmltcG9ydCB7IFJFUExZLCBBQklMSVRZX0NBUlJZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuaW1wb3J0IHsgaW5zdGFuY2VCeUl0ZW1JZCB9IGZyb20gJy4uL2xpYi91dGlscydcclxuXHJcbmNsYXNzIFNsb3Qge1xyXG4gIGNvbnN0cnVjdG9yIChbaXRlbUlkLCBwYXJhbXMsIGNvdW50XSkge1xyXG4gICAgdGhpcy5pdGVtID0gaW5zdGFuY2VCeUl0ZW1JZChpdGVtSWQsIHBhcmFtcylcclxuICAgIHRoaXMuY291bnQgPSBjb3VudFxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuIFt0aGlzLml0ZW0udG9TdHJpbmcoKSwgJygnLCB0aGlzLmNvdW50LCAnKSddLmpvaW4oJycpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBUcmVhc3VyZSBleHRlbmRzIEdhbWVPYmplY3Qge1xyXG4gIGNvbnN0cnVjdG9yIChpbnZlbnRvcmllcyA9IFtdKSB7XHJcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcclxuICAgIHN1cGVyKFRleHR1cmUuVHJlYXN1cmUpXHJcblxyXG4gICAgdGhpcy5pbnZlbnRvcmllcyA9IGludmVudG9yaWVzLm1hcCh0cmVhc3VyZSA9PiBuZXcgU2xvdCh0cmVhc3VyZSkpXHJcblxyXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gUkVQTFkgfVxyXG5cclxuICBib2R5T3B0ICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlzU2Vuc29yOiB0cnVlLFxyXG4gICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcclxuICAgICAgICBjYXRlZ29yeTogMGIxMCxcclxuICAgICAgICBtYXNrOiAwYjFcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcclxuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBvcGVyYXRvcltBQklMSVRZX0NBUlJZXVxyXG4gICAgaWYgKCFjYXJyeUFiaWxpdHkpIHtcclxuICAgICAgb3BlcmF0b3Iuc2F5KCdJIGNhblxcJ3QgY2FycnkgaXRlbXMgbm90IHlldC4nKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmludmVudG9yaWVzLmZvckVhY2goXHJcbiAgICAgIHRyZWFzdXJlID0+IGNhcnJ5QWJpbGl0eS50YWtlKHRyZWFzdXJlLml0ZW0sIHRyZWFzdXJlLmNvdW50KSlcclxuICAgIG9wZXJhdG9yLnNheShbJ0kgdGFrZWQgJywgdGhpcy50b1N0cmluZygpXS5qb2luKCcnKSlcclxuXHJcbiAgICB0aGlzLnBhcmVudC53aWxsUmVtb3ZlQ2hpbGQodGhpcylcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICd0cmVhc3VyZTogWycsXHJcbiAgICAgIHRoaXMuaW52ZW50b3JpZXMuam9pbignLCAnKSxcclxuICAgICAgJ10nXHJcbiAgICBdLmpvaW4oJycpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmVhc3VyZVxyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFRyZWUgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFRleHR1cmUuVHJlZSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmVlXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFdhbGwgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuV2FsbClcblxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxuXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XG4gICAgb3BlcmF0b3IuZW1pdCgnY29sbGlkZScsIHRoaXMpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdXYWxsJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdhbGxcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZLCBBQklMSVRZX0ZJUkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5pbXBvcnQgTGVhcm4gZnJvbSAnLi9hYmlsaXRpZXMvTGVhcm4nXG5pbXBvcnQgQ2FycnkgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FycnknXG5pbXBvcnQgRmlyZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9GaXJlJ1xuaW1wb3J0IEhlYWx0aCBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9IZWFsdGgnXG5pbXBvcnQgRmlyZUJvbHQgZnJvbSAnLi4vb2JqZWN0cy9za2lsbHMvRmlyZUJvbHQnXG5cbmNsYXNzIFdhbGxTaG9vdEJvbHQgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuV2FsbClcblxuICAgIGxldCBjYXJyeSA9IG5ldyBDYXJyeSgzKVxuICAgIG5ldyBMZWFybigpLmNhcnJ5QnkodGhpcylcbiAgICAgIC5sZWFybihuZXcgRmlyZSgpKVxuICAgICAgLmxlYXJuKGNhcnJ5KVxuICAgICAgLmxlYXJuKG5ldyBIZWFsdGgoMTApKVxuXG4gICAgY2FycnkudGFrZShuZXcgRmlyZUJvbHQoMCksIEluZmluaXR5KVxuXG4gICAgdGhpcy5saWZlID0gMFxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcbiAgICB0aGlzLm9uKCdkaWUnLCB0aGlzLm9uRGllLmJpbmQodGhpcykpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cblxuICBib2R5T3B0ICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNTdGF0aWM6IHRydWVcbiAgICB9XG4gIH1cblxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xuICAgIG9wZXJhdG9yLmVtaXQoJ2NvbGxpZGUnLCB0aGlzKVxuICB9XG5cbiAgb25EaWUgKCkge1xuICAgIHRoaXMucGFyZW50LndpbGxSZW1vdmVDaGlsZCh0aGlzKVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICB0aGlzLmxpZmUrK1xuICAgIGlmICh0aGlzLmxpZmUgJSAzICE9PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5saWZlID0gMFxuICAgIHRoaXMucm90YXRlKE1hdGguUEkgLyAxMCwgdHJ1ZSlcblxuICAgIGxldCByYWQgPSB0aGlzLnJvdGF0aW9uXG4gICAgdGhpc1tBQklMSVRZX0ZJUkVdLmZpcmUocmFkKVxuICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZCArIE1hdGguUEkgLyAyKVxuICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZCArIE1hdGguUEkpXG4gICAgdGhpc1tBQklMSVRZX0ZJUkVdLmZpcmUocmFkICsgTWF0aC5QSSAvIDIgKiAzKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnV2FsbFNob290Qm9sdCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXYWxsU2hvb3RCb2x0XG4iLCJjb25zdCB0eXBlID0gU3ltYm9sKCdhYmlsaXR5JylcblxuY2xhc3MgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIHR5cGUgfVxuXG4gIGdldFNhbWVUeXBlQWJpbGl0eSAob3duZXIpIHtcbiAgICByZXR1cm4gb3duZXIuYWJpbGl0aWVzW3RoaXMudHlwZV1cbiAgfVxuXG4gIC8vIOaYr+WQpumcgOe9ruaPm1xuICBoYXNUb1JlcGxhY2UgKG93bmVyLCBhYmlsaXR5TmV3KSB7XG4gICAgbGV0IGFiaWxpdHlPbGQgPSB0aGlzLmdldFNhbWVUeXBlQWJpbGl0eShvd25lcilcbiAgICByZXR1cm4gIWFiaWxpdHlPbGQgfHwgYWJpbGl0eU5ldy5pc0JldHRlcihhYmlsaXR5T2xkKVxuICB9XG5cbiAgLy8g5paw6IiK5q+U6LyDXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBsZXQgYWJpbGl0eU9sZCA9IHRoaXMuZ2V0U2FtZVR5cGVBYmlsaXR5KG93bmVyKVxuICAgIGlmIChhYmlsaXR5T2xkKSB7XG4gICAgICAvLyBmaXJzdCBnZXQgdGhpcyB0eXBlIGFiaWxpdHlcbiAgICAgIGFiaWxpdHlPbGQucmVwbGFjZWRCeSh0aGlzLCBvd25lcilcbiAgICB9XG4gICAgb3duZXIuYWJpbGl0aWVzW3RoaXMudHlwZV0gPSB0aGlzXG4gIH1cblxuICByZXBsYWNlZEJ5IChvdGhlciwgb3duZXIpIHt9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIGRlbGV0ZSBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAncGx6IGV4dGVuZCB0aGlzIGNsYXNzJ1xuICB9XG5cbiAgc2VyaWFsaXplICgpIHtcbiAgICByZXR1cm4ge31cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBYmlsaXR5XG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXHJcbmltcG9ydCBMaWdodCBmcm9tICcuLi8uLi9saWIvTGlnaHQnXHJcbmltcG9ydCB7IEFCSUxJVFlfQ0FNRVJBIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIENhbWVyYSBleHRlbmRzIEFiaWxpdHkge1xyXG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5yYWRpdXMgPSB2YWx1ZVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9DQU1FUkEgfVxyXG5cclxuICBpc0JldHRlciAob3RoZXIpIHtcclxuICAgIC8vIOWPquacg+iuiuWkp1xyXG4gICAgcmV0dXJuIHRoaXMucmFkaXVzID49IG90aGVyLnJhZGl1c1xyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XHJcbiAgY2FycnlCeSAob3duZXIpIHtcclxuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXHJcbiAgICBpZiAob3duZXIucGFyZW50KSB7XHJcbiAgICAgIHRoaXMuc2V0dXAob3duZXIsIG93bmVyLnBhcmVudClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG93bmVyLm9uY2UoJ2FkZGVkJywgY29udGFpbmVyID0+IHRoaXMuc2V0dXAob3duZXIsIGNvbnRhaW5lcikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXBsYWNlZEJ5IChvdGhlciwgb3duZXIpIHtcclxuICAgIHRoaXMuZHJvcEJ5KG93bmVyKVxyXG4gIH1cclxuXHJcbiAgc2V0dXAgKG93bmVyLCBjb250YWluZXIpIHtcclxuICAgIExpZ2h0LmxpZ2h0T24ob3duZXIsIHRoaXMucmFkaXVzKVxyXG4gICAgLy8g5aaC5p6cIG93bmVyIOS4jeiiq+mhr+ekulxyXG4gICAgb3duZXIucmVtb3ZlZCA9IHRoaXMub25SZW1vdmVkLmJpbmQodGhpcywgb3duZXIpXHJcbiAgICBvd25lci5vbmNlKCdyZW1vdmVkJywgb3duZXIucmVtb3ZlZClcclxuICB9XHJcblxyXG4gIG9uUmVtb3ZlZCAob3duZXIpIHtcclxuICAgIHRoaXMuZHJvcEJ5KG93bmVyKVxyXG4gICAgLy8gb3duZXIg6YeN5paw6KKr6aGv56S6XHJcbiAgICBvd25lci5vbmNlKCdhZGRlZCcsIGNvbnRhaW5lciA9PiB0aGlzLnNldHVwKG93bmVyLCBjb250YWluZXIpKVxyXG4gIH1cclxuXHJcbiAgZHJvcEJ5IChvd25lcikge1xyXG4gICAgTGlnaHQubGlnaHRPZmYob3duZXIpXHJcbiAgICAvLyByZW1vdmUgbGlzdGVuZXJcclxuICAgIG93bmVyLm9mZigncmVtb3ZlZCcsIG93bmVyLnJlbW92ZWQpXHJcbiAgICBkZWxldGUgb3duZXIucmVtb3ZlZFxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdsaWdodCBhcmVhOiAnICsgdGhpcy5yYWRpdXNcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhbWVyYVxyXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0NBUlJZLCBBQklMSVRZX0xFQVJOIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuZnVuY3Rpb24gbmV3U2xvdCAoc2tpbGwsIGNvdW50KSB7XG4gIHJldHVybiB7XG4gICAgc2tpbGwsXG4gICAgY291bnQsXG4gICAgdG9TdHJpbmcgKCkge1xuICAgICAgcmV0dXJuIFtza2lsbC50b1N0cmluZygpLCAnKCcsIHRoaXMuY291bnQsICcpJ10uam9pbignJylcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ2FycnkgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgY29uc3RydWN0b3IgKGluaXRTbG90cykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmN1cnJlbnQgPSAwXG4gICAgdGhpcy5iYWdzID0gQXJyYXkoaW5pdFNsb3RzKS5maWxsKClcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfQ0FSUlkgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX0NBUlJZXSA9IHRoaXNcbiAgfVxuXG4gIC8vIOaaq+aZguaykuaciemZkOWItuaWveaUvuasoeaVuFxuICB0YWtlIChza2lsbCwgY291bnQpIHtcbiAgICBsZXQgb3duZXIgPSB0aGlzLm93bmVyXG4gICAgaWYgKHNraWxsIGluc3RhbmNlb2YgQWJpbGl0eSAmJiBvd25lcltBQklMSVRZX0xFQVJOXSkge1xuICAgICAgLy8g5Y+W5b6X6IO95YqbXG4gICAgICBvd25lcltBQklMSVRZX0xFQVJOXS5sZWFybihza2lsbClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb3VudCA9IGNvdW50ID09PSAtMSA/IEluZmluaXR5IDogY291bnRcbiAgICBsZXQga2V5ID0gc2tpbGwudG9TdHJpbmcoKVxuICAgIGxldCBmaXJzdEVtcHR5U2xvdFxuICAgIGxldCBmb3VuZCA9IHRoaXMuYmFncy5zb21lKChzbG90LCBzaSkgPT4ge1xuICAgICAgLy8g5pqr5a2Y56ys5LiA5YCL56m65qC8XG4gICAgICBpZiAoc2xvdCA9PT0gdW5kZWZpbmVkICYmIGZpcnN0RW1wdHlTbG90ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZmlyc3RFbXB0eVNsb3QgPSBzaVxuICAgICAgfVxuICAgICAgLy8g5oqA6IO95Y2H57SaKOWQjOmhnuWeiylcbiAgICAgIGlmIChzbG90ICYmIHNsb3Quc2tpbGwudG9TdHJpbmcoKSA9PT0ga2V5ICYmXG4gICAgICAgIHNraWxsLmxldmVsID4gc2xvdC5za2lsbC5sZXZlbCkge1xuICAgICAgICB0aGlzLmJhZ3Nbc2ldID0gbmV3U2xvdChza2lsbCwgY291bnQpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9KVxuICAgIGlmICghZm91bmQpIHtcbiAgICAgIGlmIChmaXJzdEVtcHR5U2xvdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIOaykuacieepuuagvOWPr+aUvueJqeWTgVxuICAgICAgICBvd25lci5zYXkoJ25vIGVtcHR5IHNsb3QgZm9yIG5ldyBza2lsbCBnb3QuJylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyDmlL7lhaXnrKzkuIDlgIvnqbrmoLxcbiAgICAgIHRoaXMuYmFnc1tmaXJzdEVtcHR5U2xvdF0gPSBuZXdTbG90KHNraWxsLCBjb3VudClcbiAgICB9XG4gICAgb3duZXIuZW1pdCgnaW52ZW50b3J5LW1vZGlmaWVkJywgc2tpbGwpXG4gIH1cblxuICBnZXRTbG90SXRlbSAoc2xvdElueCkge1xuICAgIGxldCBzaVxuICAgIC8vIOeFp+iRl+WMheWMheWKoOWFpemghuW6j+afpeaJvlxuICAgIGxldCBmb3VuZCA9IHRoaXMuYmFncy5maW5kKChzbG90LCBzKSA9PiB7XG4gICAgICBzaSA9IHNcbiAgICAgIHJldHVybiBzbG90SW54LS0gPT09IDBcbiAgICB9KVxuICAgIGxldCBza2lsbFxuICAgIGlmIChmb3VuZCkge1xuICAgICAgZm91bmQgPSB0aGlzLmJhZ3Nbc2ldXG4gICAgICBza2lsbCA9IGZvdW5kLnNraWxsXG4gICAgICAvLyDlj5blh7rlvozmuJvkuIBcbiAgICAgIGlmICgtLWZvdW5kLmNvdW50ID09PSAwKSB7XG4gICAgICAgIHRoaXMuYmFnc1tzaV0gPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIHRoaXMub3duZXIuZW1pdCgnaW52ZW50b3J5LW1vZGlmaWVkJywgc2tpbGwpXG4gICAgfVxuICAgIHJldHVybiBza2lsbFxuICB9XG5cbiAgZ2V0Q3VycmVudCAoKSB7XG4gICAgbGV0IGZvdW5kID0gdGhpcy5iYWdzW3RoaXMuY3VycmVudF1cbiAgICBsZXQgc2tpbGxcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIHNraWxsID0gZm91bmQuc2tpbGxcbiAgICAgIC8vIOWPluWHuuW+jOa4m+S4gFxuICAgICAgaWYgKC0tZm91bmQuY291bnQgPT09IDApIHtcbiAgICAgICAgdGhpcy5iYWdzW3RoaXMuY3VycmVudF0gPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICAgIHRoaXMub3duZXIuZW1pdCgnaW52ZW50b3J5LW1vZGlmaWVkJywgc2tpbGwpXG4gICAgfVxuICAgIHJldHVybiBza2lsbFxuICB9XG5cbiAgc2V0Q3VycmVudCAoY3VycmVudCkge1xuICAgIHRoaXMuY3VycmVudCA9IGN1cnJlbnRcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gWydjYXJyeTogJywgdGhpcy5iYWdzLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cblxuICAvLyBUT0RPOiBzYXZlIGRhdGFcbiAgc2VyaWFsaXplICgpIHtcbiAgICByZXR1cm4gdGhpcy5iYWdzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2FycnlcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfREFNQUdFLCBBQklMSVRZX0hFQUxUSCB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIERhbWFnZSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAoW2RhbWFnZSA9IDEsIGZvcmNlID0gMC4wMV0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5kYW1hZ2UgPSBkYW1hZ2VcbiAgICB0aGlzLmZvcmNlID0gZm9yY2VcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfREFNQUdFIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9EQU1BR0VdID0gdGhpc1xuICB9XG5cbiAgZWZmZWN0IChvdGhlcikge1xuICAgIGxldCBoZWFsdGhBYmlsaXR5ID0gb3RoZXJbQUJJTElUWV9IRUFMVEhdXG4gICAgLy8g5YK35a6z5LuW5Lq6XG4gICAgaWYgKGhlYWx0aEFiaWxpdHkpIHtcbiAgICAgIGhlYWx0aEFiaWxpdHkuZ2V0SHVydCh0aGlzLm93bmVyKVxuICAgIH1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgJ0RhbWFnZTogJyxcbiAgICAgIHRoaXMuZGFtYWdlLFxuICAgICAgJywgJyxcbiAgICAgIHRoaXMuZm9yY2VcbiAgICBdLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGFtYWdlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0ZJUkUsIEFCSUxJVFlfQ0FSUlkgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBGaXJlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfRklSRSB9XG5cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMub3duZXIgPSBvd25lclxuICAgIG93bmVyW0FCSUxJVFlfRklSRV0gPSB0aGlzXG4gIH1cblxuICBmaXJlIChyYWQpIHtcbiAgICBsZXQgY2FzdGVyID0gdGhpcy5vd25lclxuXG4gICAgbGV0IGNhcnJ5QWJpbGl0eSA9IGNhc3RlcltBQklMSVRZX0NBUlJZXVxuICAgIGxldCBCdWxsZXRUeXBlID0gY2FycnlBYmlsaXR5LmdldEN1cnJlbnQoKVxuICAgIGlmICghQnVsbGV0VHlwZSkge1xuICAgICAgLy8gbm8gc2tpbGwgYXQgaW52ZW50b3J5XG4gICAgICBjb25zb2xlLmxvZygnbm8gc2tpbGwgYXQgaW52ZW50b3J5JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBCdWxsZXRUeXBlLmNhc3Qoe2Nhc3RlciwgcmFkfSlcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0ZpcmUnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlyZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9IRUFMVEgsIEFCSUxJVFlfREFNQUdFLCBBQklMSVRZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IFZlY3RvciBmcm9tICcuLi8uLi9saWIvVmVjdG9yJ1xuXG5jbGFzcyBIZWFsdGggZXh0ZW5kcyBBYmlsaXR5IHtcbiAgY29uc3RydWN0b3IgKHZhbHVlID0gMSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgICB0aGlzLnZhbHVlTWF4ID0gdmFsdWVcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfSEVBTFRIIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9IRUFMVEhdID0gdGhpc1xuICB9XG5cbiAgZ2V0SHVydCAoZnJvbSkge1xuICAgIGxldCBkYW1hZ2VBYmlsaXR5ID0gZnJvbVtBQklMSVRZX0RBTUFHRV1cbiAgICBpZiAoIWRhbWFnZUFiaWxpdHkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgZm9yY2UgPSBkYW1hZ2VBYmlsaXR5LmZvcmNlXG4gICAgbGV0IGRhbWFnZSA9IGRhbWFnZUFiaWxpdHkuZGFtYWdlXG4gICAgbGV0IHByZUhwID0gdGhpcy52YWx1ZVxuICAgIGxldCBzdWZIcCA9IE1hdGgubWF4KHRoaXMudmFsdWUgLSBkYW1hZ2UsIDApXG4gICAgbGV0IHZlY3RvciA9IFZlY3Rvci5mcm9tUG9pbnQodGhpcy5vd25lci5wb3NpdGlvbilcbiAgICAgIC5zdWIoZnJvbS5wb3NpdGlvbilcbiAgICAgIC5zZXRMZW5ndGgoZm9yY2UpXG5cbiAgICB0aGlzLm93bmVyLnNheShbXG4gICAgICB0aGlzLm93bmVyLnRvU3RyaW5nKCksXG4gICAgICAnIGdldCBodXJ0ICcsXG4gICAgICBkYW1hZ2UsXG4gICAgICAnOiAnLFxuICAgICAgcHJlSHAsXG4gICAgICAnIC0+ICcsXG4gICAgICBzdWZIcFxuICAgIF0uam9pbignJykpXG5cbiAgICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzLm93bmVyW0FCSUxJVFlfTU9WRV1cbiAgICBpZiAobW92ZUFiaWxpdHkpIHtcbiAgICAgIG1vdmVBYmlsaXR5LnB1bmNoKHZlY3RvcilcbiAgICB9XG5cbiAgICB0aGlzLnZhbHVlID0gc3VmSHBcblxuICAgIHRoaXMub3duZXIuZW1pdCgnaGVhbHRoLWNoYW5nZScpXG4gICAgaWYgKHRoaXMudmFsdWUgPD0gMCkge1xuICAgICAgdGhpcy5vd25lci5lbWl0KCdkaWUnKVxuICAgIH1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgJ0hlYWx0aDogJyxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICAnIC8gJyxcbiAgICAgIHRoaXMudmFsdWVNYXhcbiAgICBdLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSGVhbHRoXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0ZJUkUsIEFCSUxJVFlfS0VZX0ZJUkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi8uLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xuXG5jb25zdCBLRVlTID0gU3ltYm9sKCdrZXlzJylcblxuY2xhc3MgS2V5RmlyZSBleHRlbmRzIEFiaWxpdHkge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0tFWV9GSVJFIH1cblxuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgb3duZXJbQUJJTElUWV9LRVlfRklSRV0gPSB0aGlzXG4gICAgdGhpcy5zZXR1cChvd25lcilcbiAgfVxuXG4gIHNldHVwIChvd25lcikge1xuICAgIGxldCBmaXJlQWJpbGl0eSA9IG93bmVyW0FCSUxJVFlfRklSRV1cbiAgICBsZXQgbW91c2VIYW5kbGVyID0gZSA9PiB7XG4gICAgICBpZiAoZS5zdG9wcGVkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoJ2ZpcmUnKVxuICAgIH1cbiAgICBsZXQgZmlyZUhhbmRsZXIgPSBmaXJlQWJpbGl0eS5maXJlLmJpbmQoZmlyZUFiaWxpdHkpXG5cbiAgICBvd25lcltLRVlTXSA9IHtcbiAgICAgIG1vdXNlZG93bjogbW91c2VIYW5kbGVyLFxuICAgICAgZmlyZTogZmlyZUhhbmRsZXJcbiAgICB9XG4gICAgT2JqZWN0LmVudHJpZXMob3duZXJbS0VZU10pLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIub24oZXZlbnROYW1lLCBoYW5kbGVyKVxuICAgIH0pXG4gIH1cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgc3VwZXIuZHJvcEJ5KG93bmVyKVxuICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW0tFWVNdKS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLm9mZihldmVudE5hbWUsIGhhbmRsZXIpXG4gICAgfSlcbiAgICBkZWxldGUgb3duZXJbS0VZU11cbiAgICBkZWxldGUgb3duZXJbQUJJTElUWV9LRVlfRklSRV1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2tleSBmaXJlJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEtleUZpcmVcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCBrZXlib2FyZEpTIGZyb20gJ2tleWJvYXJkanMnXG5pbXBvcnQgeyBMRUZULCBVUCwgUklHSFQsIERPV04gfSBmcm9tICcuLi8uLi9jb25maWcvY29udHJvbCdcbmltcG9ydCB7IEFCSUxJVFlfTU9WRSwgQUJJTElUWV9LRVlfTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXG5cbmNvbnN0IEtFWVMgPSBTeW1ib2woJ2tleXMnKVxuXG5jbGFzcyBLZXlNb3ZlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfS0VZX01PVkUgfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICBvd25lcltBQklMSVRZX0tFWV9NT1ZFXSA9IHRoaXNcbiAgICB0aGlzLnNldHVwKG93bmVyKVxuICB9XG5cbiAgc2V0dXAgKG93bmVyKSB7XG4gICAgbGV0IGRpciA9IHt9XG4gICAgbGV0IGNhbGNEaXIgPSAoKSA9PiB7XG4gICAgICBsZXQgdmVjdG9yID0gbmV3IFZlY3RvcigtZGlyW0xFRlRdICsgZGlyW1JJR0hUXSwgLWRpcltVUF0gKyBkaXJbRE9XTl0pXG4gICAgICBpZiAodmVjdG9yLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHZlY3Rvci5tdWx0aXBseVNjYWxhcigwLjE3KVxuICAgICAgb3duZXJbQUJJTElUWV9NT1ZFXS5hZGREaXJlY3Rpb24odmVjdG9yKVxuICAgIH1cbiAgICBsZXQgYmluZCA9IGNvZGUgPT4ge1xuICAgICAgZGlyW2NvZGVdID0gMFxuICAgICAgbGV0IHByZUhhbmRsZXIgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50UmVwZWF0KClcbiAgICAgICAgZGlyW2NvZGVdID0gMVxuICAgICAgICBvd25lcltBQklMSVRZX01PVkVdLmNsZWFyUGF0aCgpXG4gICAgICB9XG4gICAgICBrZXlib2FyZEpTLmJpbmQoY29kZSwgcHJlSGFuZGxlciwgKCkgPT4ge1xuICAgICAgICBkaXJbY29kZV0gPSAwXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHByZUhhbmRsZXJcbiAgICB9XG5cbiAgICBrZXlib2FyZEpTLnNldENvbnRleHQoJycpXG4gICAga2V5Ym9hcmRKUy53aXRoQ29udGV4dCgnJywgKCkgPT4ge1xuICAgICAgb3duZXJbS0VZU10gPSB7XG4gICAgICAgIFtMRUZUXTogYmluZChMRUZUKSxcbiAgICAgICAgW1VQXTogYmluZChVUCksXG4gICAgICAgIFtSSUdIVF06IGJpbmQoUklHSFQpLFxuICAgICAgICBbRE9XTl06IGJpbmQoRE9XTilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKGNhbGNEaXIsIDE3KVxuICB9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIHN1cGVyLmRyb3BCeShvd25lcilcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBPYmplY3QuZW50cmllcyhvd25lcltLRVlTXSkuZm9yRWFjaCgoW2tleSwgaGFuZGxlcl0pID0+IHtcbiAgICAgICAga2V5Ym9hcmRKUy51bmJpbmQoa2V5LCBoYW5kbGVyKVxuICAgICAgfSlcbiAgICB9KVxuICAgIGRlbGV0ZSBvd25lcltLRVlTXVxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX0tFWV9NT1ZFXVxuXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAna2V5IGNvbnRyb2wnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS2V5TW92ZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9MRUFSTiB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIExlYXJuIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfTEVBUk4gfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBpZiAoIW93bmVyLmFiaWxpdGllcykge1xuICAgICAgb3duZXIuYWJpbGl0aWVzID0ge31cbiAgICAgIG93bmVyLnRpY2tBYmlsaXRpZXMgPSB7fVxuICAgIH1cbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMub3duZXIgPSBvd25lclxuICAgIG93bmVyW0FCSUxJVFlfTEVBUk5dID0gdGhpc1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBsZWFybiAoYWJpbGl0eSkge1xuICAgIGxldCBvd25lciA9IHRoaXMub3duZXJcbiAgICBpZiAoYWJpbGl0eS5oYXNUb1JlcGxhY2Uob3duZXIsIGFiaWxpdHkpKSB7XG4gICAgICBhYmlsaXR5LmNhcnJ5Qnkob3duZXIpXG4gICAgICBvd25lci5lbWl0KCdhYmlsaXR5LWNhcnJ5JywgYWJpbGl0eSlcbiAgICB9XG4gICAgcmV0dXJuIG93bmVyW0FCSUxJVFlfTEVBUk5dXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdsZWFybmluZydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMZWFyblxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9NQU5BIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgTWFuYSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAodmFsdWUgPSAxLCByZWZpbGwgPSAwLjA1KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMudmFsdWVNYXggPSB2YWx1ZVxuICAgIHRoaXMucmVmaWxsID0gcmVmaWxsXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX01BTkEgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX01BTkFdID0gdGhpc1xuICB9XG5cbiAgaXNFbm91Z2ggKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWUgLSB2YWx1ZSA+PSAwXG4gIH1cblxuICByZWR1Y2UgKHZhbHVlKSB7XG4gICAgdGhpcy52YWx1ZSA9IE1hdGgubWF4KHRoaXMudmFsdWUgLSB2YWx1ZSwgMClcbiAgICB0aGlzLm93bmVyLmVtaXQoJ21hbmEtY2hhbmdlJylcbiAgfVxuXG4gIGFkZCAodmFsdWUpIHtcbiAgICB0aGlzLnZhbHVlID0gTWF0aC5taW4odGhpcy52YWx1ZSArIHZhbHVlLCB0aGlzLnZhbHVlTWF4KVxuICAgIHRoaXMub3duZXIuZW1pdCgnbWFuYS1jaGFuZ2UnKVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICB0aGlzLmFkZCh0aGlzLnJlZmlsbCAqIGRlbHRhKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbXG4gICAgICAnTWFuYTogJyxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICAnIC8gJyxcbiAgICAgIHRoaXMudmFsdWVNYXhcbiAgICBdLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFuYVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xyXG5pbXBvcnQgeyBBQklMSVRZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXHJcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuLi8uLi9saWIvTWF0dGVyJ1xyXG5cclxuY29uc3QgRElTVEFOQ0VfVEhSRVNIT0xEID0gMVxyXG5cclxuY2xhc3MgTW92ZSBleHRlbmRzIEFiaWxpdHkge1xyXG4gIC8qKlxyXG4gICAqIOenu+WLleiDveWKm1xyXG4gICAqIEBwYXJhbSAge2ludH0gdmFsdWUgICAg56e75YuV6YCf5bqmXHJcbiAgICogQHBhcmFtICB7ZmxvYXR9IGZyaWN0aW9uQWlyICAgIOepuumWk+aRqeaTpuWKm1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yIChbdmFsdWUsIGZyaWN0aW9uQWlyXSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXHJcbiAgICB0aGlzLmZyaWN0aW9uQWlyID0gZnJpY3Rpb25BaXJcclxuICAgIHRoaXMudmVjdG9yID0gbmV3IFZlY3RvcigwLCAwKVxyXG4gICAgdGhpcy5wYXRoID0gW11cclxuICAgIHRoaXMubW92aW5nVG9Qb2ludCA9IHVuZGVmaW5lZFxyXG4gICAgdGhpcy5kaXN0YW5jZVRocmVzaG9sZCA9IHRoaXMudmFsdWUgKiBESVNUQU5DRV9USFJFU0hPTERcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfTU9WRSB9XHJcblxyXG4gIGlzQmV0dGVyIChvdGhlcikge1xyXG4gICAgLy8g5Y+q5pyD5Yqg5b+rXHJcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA+IG90aGVyLnZhbHVlXHJcbiAgfVxyXG5cclxuICAvLyDphY3lgpnmraTmioDog71cclxuICBjYXJyeUJ5IChvd25lcikge1xyXG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcclxuICAgIHRoaXMub3duZXIgPSBvd25lclxyXG4gICAgb3duZXJbQUJJTElUWV9NT1ZFXSA9IHRoaXNcclxuICB9XHJcblxyXG4gIHJlcGxhY2VkQnkgKG90aGVyLCBvd25lcikge1xyXG4gICAgb3RoZXIudmVjdG9yID0gdGhpcy52ZWN0b3JcclxuICAgIG90aGVyLnBhdGggPSB0aGlzLnBhdGhcclxuICAgIG90aGVyLm1vdmluZ1RvUG9pbnQgPSB0aGlzLm1vdmluZ1RvUG9pbnRcclxuICB9XHJcblxyXG4gIC8vIOioreWumuaWueWQkeacgOWkp+mAn+W6plxyXG4gIHNldERpcmVjdGlvbiAodmVjdG9yKSB7XHJcbiAgICBCb2R5LnNldFZlbG9jaXR5KHRoaXMub3duZXIuYm9keSwgdmVjdG9yLnNldExlbmd0aCh0aGlzLnZhbHVlKSlcclxuICB9XHJcblxyXG4gIC8vIOaWveS6iOWKm1xyXG4gIGFkZERpcmVjdGlvbiAodmVjdG9yKSB7XHJcbiAgICBsZXQgb3duZXIgPSB0aGlzLm93bmVyXHJcbiAgICBpZiAoIW93bmVyLmJvZHkpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0aGlzLnB1bmNoKHZlY3Rvci5tdWx0aXBseVNjYWxhcih0aGlzLnZhbHVlIC8gMzAwKSlcclxuICB9XHJcblxyXG4gIHB1bmNoICh2ZWN0b3IpIHtcclxuICAgIGxldCBvd25lciA9IHRoaXMub3duZXJcclxuICAgIGlmICghb3duZXIuYm9keSkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGlmICghb3duZXIuYm9keS5pc1NlbnNvcikge1xyXG4gICAgICAvLyBzZW5zb3Ig5LiN5pyD5Y+X5YqbXHJcbiAgICAgIG93bmVyLmJvZHkud29ybGQuZm9yY2VzV2FpdEZvckFwcGx5LnB1c2goe293bmVyLCB2ZWN0b3J9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g56e75YuV5Yiw6bueXHJcbiAgbW92ZVRvIChwb2ludCkge1xyXG4gICAgbGV0IHZlY3RvciA9IG5ldyBWZWN0b3IocG9pbnQueCAtIHRoaXMub3duZXIueCwgcG9pbnQueSAtIHRoaXMub3duZXIueSlcclxuICAgIHRoaXMuc2V0RGlyZWN0aW9uKHZlY3RvcilcclxuICB9XHJcblxyXG4gIC8vIOioreWumuenu+WLlei3r+W+kVxyXG4gIHNldFBhdGggKHBhdGgpIHtcclxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAvLyDmirXpgZTntYLpu55cclxuICAgICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gdW5kZWZpbmVkXHJcbiAgICAgIHRoaXMudmVjdG9yID0gbmV3IFZlY3RvcigwLCAwKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMucGF0aCA9IHBhdGhcclxuICAgIHRoaXMubW92aW5nVG9Qb2ludCA9IHBhdGgucG9wKClcclxuICAgIHRoaXMubW92ZVRvKHRoaXMubW92aW5nVG9Qb2ludClcclxuICB9XHJcblxyXG4gIGNsZWFyUGF0aCAoKSB7XHJcbiAgICB0aGlzLm1vdmluZ1RvUG9pbnQgPSB1bmRlZmluZWRcclxuICAgIHRoaXMucGF0aCA9IFtdXHJcbiAgfVxyXG5cclxuICBhZGRQYXRoIChwYXRoKSB7XHJcbiAgICB0aGlzLnNldFBhdGgocGF0aC5jb25jYXQodGhpcy5wYXRoKSlcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnbW92ZSBsZXZlbDogJyArIHRoaXMudmFsdWVcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vdmVcclxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9PUEVSQVRFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgT3BlcmF0ZSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5zZXQgPSBuZXcgU2V0KFt2YWx1ZV0pXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX09QRVJBVEUgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICBvd25lcltBQklMSVRZX09QRVJBVEVdID0gdGhpc1tBQklMSVRZX09QRVJBVEVdLmJpbmQodGhpcywgb3duZXIpXG4gICAgcmV0dXJuIG93bmVyW0FCSUxJVFlfT1BFUkFURV1cbiAgfVxuXG4gIHJlcGxhY2VkQnkgKG90aGVyKSB7XG4gICAgdGhpcy5zZXQuZm9yRWFjaChvdGhlci5zZXQuYWRkLmJpbmQob3RoZXIuc2V0KSlcbiAgfVxuXG4gIFtBQklMSVRZX09QRVJBVEVdIChvcGVyYXRvciwgdGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMuc2V0Lmhhcyh0YXJnZXQubWFwKSkge1xuICAgICAgb3BlcmF0b3Iuc2F5KG9wZXJhdG9yLnRvU3RyaW5nKCkgKyAnIHVzZSBhYmlsaXR5IHRvIG9wZW4gJyArIHRhcmdldC5tYXApXG4gICAgICB0YXJnZXRbdGhpcy50eXBlXSgpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbJ2tleXM6ICcsIEFycmF5LmZyb20odGhpcy5zZXQpLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0ZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xyXG5pbXBvcnQgeyBBQklMSVRZX1JPVEFURSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vLi4vbGliL1ZlY3RvcidcclxuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi8uLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xyXG5cclxuY29uc3QgTU9VU0VNT1ZFID0gU3ltYm9sKCdtb3VzZW1vdmUnKVxyXG5cclxuY2xhc3MgUm90YXRlIGV4dGVuZHMgQWJpbGl0eSB7XHJcbiAgY29uc3RydWN0b3IgKGluaXRSYWQgPSAwKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmluaXRSYWQgPSBpbml0UmFkXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX1JPVEFURSB9XHJcblxyXG4gIGlzQmV0dGVyIChvdGhlcikge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBnZXQgZmFjZVJhZCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZmFjZVJhZFxyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XHJcbiAgY2FycnlCeSAob3duZXIpIHtcclxuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXHJcblxyXG4gICAgdGhpcy5vd25lciA9IG93bmVyXHJcbiAgICBvd25lcltBQklMSVRZX1JPVEFURV0gPSB0aGlzXHJcbiAgICBvd25lci5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgIGxldCBtb3VzZUhhbmRsZXIgPSBlID0+IHtcclxuICAgICAgbGV0IG93bmVyUG9pbnQgPSB0aGlzLm93bmVyLmdldEdsb2JhbFBvc2l0aW9uKClcclxuICAgICAgbGV0IHBvaW50ZXIgPSBlLmRhdGEuZ2xvYmFsXHJcbiAgICAgIGxldCB2ZWN0b3IgPSBuZXcgVmVjdG9yKFxyXG4gICAgICAgIHBvaW50ZXIueCAtIG93bmVyUG9pbnQueCxcclxuICAgICAgICBwb2ludGVyLnkgLSBvd25lclBvaW50LnkpXHJcbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KCdyb3RhdGUnLCB2ZWN0b3IpXHJcbiAgICB9XHJcbiAgICBsZXQgcm90YXRlSGFuZGxlciA9IHRoaXMuc2V0RmFjZVJhZC5iaW5kKHRoaXMpXHJcblxyXG4gICAgb3duZXJbTU9VU0VNT1ZFXSA9IHtcclxuICAgICAgcm90YXRlOiByb3RhdGVIYW5kbGVyLFxyXG4gICAgICBtb3VzZW1vdmU6IG1vdXNlSGFuZGxlclxyXG4gICAgfVxyXG4gICAgT2JqZWN0LmVudHJpZXMob3duZXJbTU9VU0VNT1ZFXSkuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcclxuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLm9uKGV2ZW50TmFtZSwgaGFuZGxlcilcclxuICAgIH0pXHJcblxyXG4gICAgdGhpcy5zZXRGYWNlUmFkKG5ldyBWZWN0b3IoMCwgMCkpXHJcbiAgfVxyXG5cclxuICBkcm9wQnkgKG93bmVyKSB7XHJcbiAgICBzdXBlci5kcm9wQnkob3duZXIpXHJcbiAgICBPYmplY3QuZW50cmllcyhvd25lcltNT1VTRU1PVkVdKS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xyXG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIub2ZmKGV2ZW50TmFtZSwgaGFuZGxlcilcclxuICAgIH0pXHJcbiAgICBkZWxldGUgb3duZXJbTU9VU0VNT1ZFXVxyXG4gICAgZGVsZXRlIG93bmVyW0FCSUxJVFlfUk9UQVRFXVxyXG4gIH1cclxuXHJcbiAgc2V0RmFjZVJhZCAodmVjdG9yKSB7XHJcbiAgICB0aGlzLl9mYWNlUmFkID0gdmVjdG9yLnJhZCAtIHRoaXMuaW5pdFJhZFxyXG4gICAgdGhpcy5vd25lci5yb3RhdGUodGhpcy5fZmFjZVJhZClcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnUm90YXRlJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUm90YXRlXHJcbiIsImltcG9ydCBTa2lsbCBmcm9tICcuL1NraWxsJ1xuaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgQnVsbGV0IGZyb20gJy4uL0J1bGxldCdcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vLi4vbGliL1ZlY3RvcidcbmltcG9ydCB7IEFCSUxJVFlfUk9UQVRFLCBBQklMSVRZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IHsgY2FsY0Fwb3RoZW0gfSBmcm9tICcuLi8uLi9saWIvdXRpbHMnXG5cbmNvbnN0IGxldmVscyA9IFtcbiAgLy8gY29zdCwgaHAsIHJlYWN0Rm9yY2UsIHNwZWVkLCBkYW1hZ2UsIGZvcmNlLCBzY2FsZVxuICBbMC4yLCAxLCAwLjAwMSwgNiwgMSwgMC4wMV0sXG4gIFsyLCAzLCAwLjAwNSwgMTAsIDMsIDUsIDJdXG5dXG5cbmNsYXNzIEZpcmVCb2x0IGV4dGVuZHMgU2tpbGwge1xuICBzcHJpdGUgKCkge1xuICAgIHJldHVybiBTa2lsbC5zcHJpdGUoVGV4dHVyZS5CdWxsZXQpXG4gIH1cblxuICAvLyDlu7rnq4vlr6bpq5TkuKbph4vmlL5cbiAgY2FzdCAoe2Nhc3RlciwgcmFkID0gdW5kZWZpbmVkfSkge1xuICAgIGxldCBbIGNvc3QsIGhwLCByZWFjdEZvcmNlLCBzcGVlZCA9IDEsIGRhbWFnZSA9IDEsIGZvcmNlID0gMCwgc2NhbGUgPSAxIF0gPSBsZXZlbHNbdGhpcy5sZXZlbF1cbiAgICBpZiAoIXRoaXMuX2Nvc3QoY2FzdGVyLCBjb3N0KSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KHtzcGVlZCwgZGFtYWdlLCBmb3JjZSwgaHB9KVxuXG4gICAgLy8gc2V0IGRpcmVjdGlvblxuICAgIGlmIChyYWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8g5aaC5p6c5rKS5oyH5a6a5pa55ZCR77yM5bCx55So55uu5YmN6Z2i5bCN5pa55ZCRXG4gICAgICBsZXQgcm90YXRlQWJpbGl0eSA9IGNhc3RlcltBQklMSVRZX1JPVEFURV1cbiAgICAgIHJhZCA9IHJvdGF0ZUFiaWxpdHkgPyByb3RhdGVBYmlsaXR5LmZhY2VSYWQgOiAwXG4gICAgfVxuICAgIGxldCB2ZWN0b3IgPSBWZWN0b3IuZnJvbVJhZExlbmd0aChyYWQsIDEpXG4gICAgYnVsbGV0LnNjYWxlLnNldChzY2FsZSlcbiAgICBidWxsZXQuc2V0T3duZXIoY2FzdGVyKVxuXG4gICAgLy8gc2V0IHBvc2l0aW9uXG4gICAgbGV0IHJlY3RMZW4gPSBjYWxjQXBvdGhlbShjYXN0ZXIsIHJhZCArIGNhc3Rlci5yb3RhdGlvbilcbiAgICBsZXQgYnVsbGV0TGVuID0gYnVsbGV0LmhlaWdodCAvIDIgLy8g5bCE5Ye66KeS562J5pa86Ieq6Lqr5peL6KeS77yM5omA5Lul5YWN5Y676YGL566XXG4gICAgbGV0IGxlbiA9IHJlY3RMZW4gKyBidWxsZXRMZW5cbiAgICBsZXQgcG9zaXRpb24gPSBWZWN0b3IuZnJvbVJhZExlbmd0aChyYWQsIGxlbilcbiAgICAgIC5hZGQoVmVjdG9yLmZyb21Qb2ludChjYXN0ZXIucG9zaXRpb25FeCkpXG4gICAgYnVsbGV0LnBvc2l0aW9uRXguc2V0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpXG5cbiAgICBidWxsZXQub25jZSgnYWRkZWQnLCAoKSA9PiB7XG4gICAgICBidWxsZXQuc2V0RGlyZWN0aW9uKHZlY3RvcilcblxuICAgICAgbGV0IG1vdmVBYmlsaXR5ID0gY2FzdGVyW0FCSUxJVFlfTU9WRV1cbiAgICAgIGlmIChtb3ZlQWJpbGl0eSkge1xuICAgICAgICBtb3ZlQWJpbGl0eS5wdW5jaCh2ZWN0b3IuY2xvbmUoKS5zZXRMZW5ndGgocmVhY3RGb3JjZSkuaW52ZXJ0KCkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGNhc3Rlci5lbWl0KCdhZGRPYmplY3QnLCBidWxsZXQpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdGaXJlQm9sdCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaXJlQm9sdFxuIiwiaW1wb3J0IHsgQ29udGFpbmVyIH0gZnJvbSAnLi4vLi4vbGliL1BJWEknXG5pbXBvcnQgU2tpbGwgZnJvbSAnLi9Ta2lsbCdcbmltcG9ydCBUZXh0dXJlIGZyb20gJy4uLy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEJ1bGxldCBmcm9tICcuLi9CdWxsZXQnXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXG5pbXBvcnQgeyBBQklMSVRZX1JPVEFURSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgeyBjYWxjQXBvdGhlbSB9IGZyb20gJy4uLy4uL2xpYi91dGlscydcblxuY29uc3QgUEkyID0gTWF0aC5QSSAqIDJcbmNvbnN0IGxldmVscyA9IFtcbiAgLy8gY29zdCwgYm9sdENvdW50LCBocCwgcmVhY3RGb3JjZSwgc3BlZWQsIGRhbWFnZSwgZm9yY2UsIHNjYWxlXG4gIFswLjgsIDgsIDEsIDYsIDEsIDAuMDFdLFxuICBbMC44LCAxNiwgMywgMTAsIDMsIDUsIDJdXG5dXG5cbmNsYXNzIEZpcmVTdGFyIGV4dGVuZHMgU2tpbGwge1xuICBzcHJpdGUgKCkge1xuICAgIGxldCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKClcbiAgICBsZXQgYnVsbGV0cyA9IFtdXG4gICAgbGV0IFsgLCBib2x0Q291bnQgXSA9IGxldmVsc1t0aGlzLmxldmVsXVxuICAgIGZvciAobGV0IHJhZCA9IDAsIG1heFJhZCA9IFBJMjsgcmFkIDwgbWF4UmFkOyByYWQgKz0gUEkyIC8gYm9sdENvdW50KSB7XG4gICAgICBsZXQgYnVsbGV0ID0gU2tpbGwuc3ByaXRlKFRleHR1cmUuQnVsbGV0KVxuICAgICAgYnVsbGV0LmFuY2hvci5zZXQoMC4zLCAwLjUpXG4gICAgICBidWxsZXQucm90YXRpb24gPSByYWRcbiAgICAgIGJ1bGxldC5wb3NpdGlvbi5zZXQoYnVsbGV0LndpZHRoICogMC43LCBidWxsZXQud2lkdGggKiAwLjcpXG4gICAgICBidWxsZXRzLnB1c2goYnVsbGV0KVxuICAgIH1cblxuICAgIGNvbnRhaW5lci5hZGRDaGlsZCguLi5idWxsZXRzKVxuXG4gICAgcmV0dXJuIGNvbnRhaW5lclxuICB9XG5cbiAgLy8g5bu656uL5a+m6auU5Lim6YeL5pS+XG4gIGNhc3QgKHtjYXN0ZXIsIHJhZCA9IHVuZGVmaW5lZH0pIHtcbiAgICBsZXQgWyBjb3N0LCBib2x0Q291bnQsIGhwLCBzcGVlZCA9IDEsIGRhbWFnZSA9IDEsIGZvcmNlID0gMCwgc2NhbGUgPSAxIF0gPSBsZXZlbHNbdGhpcy5sZXZlbF1cbiAgICBpZiAoIXRoaXMuX2Nvc3QoY2FzdGVyLCBjb3N0KSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZm9yIChsZXQgcmFkID0gMCwgbWF4UmFkID0gUEkyOyByYWQgPCBtYXhSYWQ7IHJhZCArPSBQSTIgLyBib2x0Q291bnQpIHtcbiAgICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KHtzcGVlZCwgZGFtYWdlLCBmb3JjZSwgaHB9KVxuICAgICAgYnVsbGV0LnNjYWxlLnNldChzY2FsZSlcbiAgICAgIHRoaXMuX2dlbkJ1bGxldChjYXN0ZXIsIGJ1bGxldCwgcmFkKVxuICAgIH1cbiAgfVxuXG4gIF9nZW5CdWxsZXQgKGNhc3RlciwgYnVsbGV0LCByYWQpIHtcbiAgICAvLyBzZXQgZGlyZWN0aW9uXG4gICAgaWYgKHJhZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyDlpoLmnpzmspLmjIflrprmlrnlkJHvvIzlsLHnlKjnm67liY3pnaLlsI3mlrnlkJFcbiAgICAgIGxldCByb3RhdGVBYmlsaXR5ID0gY2FzdGVyW0FCSUxJVFlfUk9UQVRFXVxuICAgICAgcmFkID0gcm90YXRlQWJpbGl0eSA/IHJvdGF0ZUFiaWxpdHkuZmFjZVJhZCA6IDBcbiAgICB9XG4gICAgbGV0IHZlY3RvciA9IFZlY3Rvci5mcm9tUmFkTGVuZ3RoKHJhZCwgMSlcbiAgICBidWxsZXQuc2V0T3duZXIoY2FzdGVyKVxuXG4gICAgLy8gc2V0IHBvc2l0aW9uXG4gICAgbGV0IHJlY3RMZW4gPSBjYWxjQXBvdGhlbShjYXN0ZXIsIHJhZCArIGNhc3Rlci5yb3RhdGlvbilcbiAgICBsZXQgYnVsbGV0TGVuID0gYnVsbGV0LmhlaWdodCAvIDIgLy8g5bCE5Ye66KeS562J5pa86Ieq6Lqr5peL6KeS77yM5omA5Lul5YWN5Y676YGL566XXG4gICAgbGV0IGxlbiA9IHJlY3RMZW4gKyBidWxsZXRMZW5cbiAgICBsZXQgcG9zaXRpb24gPSBWZWN0b3IuZnJvbVJhZExlbmd0aChyYWQsIGxlbilcbiAgICAgIC5hZGQoVmVjdG9yLmZyb21Qb2ludChjYXN0ZXIucG9zaXRpb25FeCkpXG4gICAgYnVsbGV0LnBvc2l0aW9uRXguc2V0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpXG5cbiAgICBidWxsZXQub25jZSgnYWRkZWQnLCAoKSA9PiB7XG4gICAgICBidWxsZXQuc2V0RGlyZWN0aW9uKHZlY3RvcilcbiAgICB9KVxuXG4gICAgY2FzdGVyLmVtaXQoJ2FkZE9iamVjdCcsIGJ1bGxldClcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0ZpcmVTdGFyJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpcmVTdGFyXG4iLCJpbXBvcnQgeyBTcHJpdGUgfSBmcm9tICcuLi8uLi9saWIvUElYSSdcbmltcG9ydCB7IEFCSUxJVFlfTUFOQSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFNraWxsIHtcbiAgY29uc3RydWN0b3IgKGxldmVsKSB7XG4gICAgdGhpcy5sZXZlbCA9IGxldmVsXG4gIH1cblxuICBzdGF0aWMgc3ByaXRlICh0ZXh0dXJlKSB7XG4gICAgcmV0dXJuIG5ldyBTcHJpdGUodGV4dHVyZSlcbiAgfVxuXG4gIF9jb3N0IChjYXN0ZXIsIGNvc3QpIHtcbiAgICBsZXQgbWFuYUFiaWxpdHkgPSBjYXN0ZXJbQUJJTElUWV9NQU5BXVxuICAgIGlmICghbWFuYUFiaWxpdHkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmICghbWFuYUFiaWxpdHkuaXNFbm91Z2goY29zdCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBtYW5hQWJpbGl0eS5yZWR1Y2UoY29zdClcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNraWxsXG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUsIGxvYWRlciwgQ29udGFpbmVyIH0gZnJvbSAnLi4vbGliL1BJWEknXHJcbmltcG9ydCBXaW5kb3cgZnJvbSAnLi4vdWkvV2luZG93J1xyXG5pbXBvcnQgQnV0dG9uIGZyb20gJy4uL3VpL0J1dHRvbidcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2xpYi9TY2VuZSdcclxuaW1wb3J0IFBsYXlTY2VuZSBmcm9tICcuL1BsYXlTY2VuZSdcclxuXHJcbmxldCBzY2VuZVdpZHRoXHJcbmxldCBzY2VuZUhlaWdodFxyXG5cclxubGV0IHRleHQgPSAnbG9hZGluZydcclxuXHJcbmNsYXNzIExvYWRpbmdTY2VuZSBleHRlbmRzIFNjZW5lIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5saWZlID0gMFxyXG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZVxyXG4gICAgdGhpcy5pc0xvYWRlZCA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBjcmVhdGUgKCkge1xyXG4gICAgc2NlbmVXaWR0aCA9IHRoaXMucGFyZW50LndpZHRoXHJcbiAgICBzY2VuZUhlaWdodCA9IHRoaXMucGFyZW50LmhlaWdodFxyXG4gICAgdGhpcy5zaG93TWFpbigpXHJcbiAgICB0aGlzLnN0YXJ0U2luZ2xlKClcclxuICB9XHJcblxyXG4gIHNob3dNYWluICgpIHtcclxuICAgIGxldCBtYWluQ29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpXHJcbiAgICBtYWluQ29udGFpbmVyLnBvc2l0aW9uLnNldChzY2VuZVdpZHRoIC8gNCwgc2NlbmVIZWlnaHQgLyA0KVxyXG5cclxuICAgIGxldCBtYWluV2luZG93ID0gbmV3IFdpbmRvdyh7XHJcbiAgICAgIHg6IDAsXHJcbiAgICAgIHk6IDAsXHJcbiAgICAgIHdpZHRoOiBzY2VuZVdpZHRoIC8gMixcclxuICAgICAgaGVpZ2h0OiBzY2VuZUhlaWdodCAvIDJcclxuICAgIH0pXHJcblxyXG4gICAgbGV0IGJ1dHRvblN0YXJ0ID0gbmV3IEJ1dHRvbih7XHJcbiAgICAgIHg6IG1haW5XaW5kb3cud2lkdGggLyA0LFxyXG4gICAgICB5OiAxMCxcclxuICAgICAgd2lkdGg6IG1haW5XaW5kb3cud2lkdGggKiAwLjUsXHJcbiAgICAgIGhlaWdodDogbWFpbldpbmRvdy5oZWlnaHQgKiAwLjI1LFxyXG4gICAgICBsaXRlcmFsOiAnU2luZ2xlJyxcclxuICAgICAgb246IHRoaXMuc3RhcnRTaW5nbGUuYmluZCh0aGlzKVxyXG4gICAgfSlcclxuXHJcbiAgICBsZXQgYnV0dG9uTXVsdGkgPSBuZXcgQnV0dG9uKHtcclxuICAgICAgeDogbWFpbldpbmRvdy53aWR0aCAvIDQsXHJcbiAgICAgIHk6IGJ1dHRvblN0YXJ0LnkgKyBidXR0b25TdGFydC5oZWlnaHQgKyAxMCxcclxuICAgICAgd2lkdGg6IG1haW5XaW5kb3cud2lkdGggKiAwLjUsXHJcbiAgICAgIGhlaWdodDogbWFpbldpbmRvdy5oZWlnaHQgKiAwLjI1LFxyXG4gICAgICBsaXRlcmFsOiAnTXVsdGknLFxyXG4gICAgICBvbjogdGhpcy5zdGFydE11bHRpLmJpbmQodGhpcylcclxuICAgIH0pXHJcblxyXG4gICAgbGV0IGZvbnRTaXplID0gc2NlbmVXaWR0aCAvIDIwXHJcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcclxuICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxyXG4gICAgICBmaWxsOiAnI2ZmMzMwMCdcclxuICAgIH0pXHJcbiAgICBsZXQgdGV4dExvYWRpbmcgPSBuZXcgVGV4dCh0ZXh0LCBzdHlsZSlcclxuICAgIHRleHRMb2FkaW5nLmFuY2hvci5zZXQoMSwgMSlcclxuICAgIHRleHRMb2FkaW5nLnBvc2l0aW9uLnNldChcclxuICAgICAgbWFpbldpbmRvdy53aWR0aCAtIGZvbnRTaXplIC8gMiwgbWFpbldpbmRvdy5oZWlnaHQgLSBmb250U2l6ZSAvIDIpXHJcbiAgICB0ZXh0TG9hZGluZy52aXNpYmxlID0gZmFsc2VcclxuXHJcbiAgICBtYWluQ29udGFpbmVyLmFkZENoaWxkKG1haW5XaW5kb3cpXHJcbiAgICBtYWluQ29udGFpbmVyLmFkZENoaWxkKGJ1dHRvblN0YXJ0KVxyXG4gICAgbWFpbkNvbnRhaW5lci5hZGRDaGlsZChidXR0b25NdWx0aSlcclxuICAgIG1haW5Db250YWluZXIuYWRkQ2hpbGQodGV4dExvYWRpbmcpXHJcbiAgICB0aGlzLmFkZENoaWxkKG1haW5Db250YWluZXIpXHJcblxyXG4gICAgdGhpcy50ZXh0TG9hZGluZyA9IHRleHRMb2FkaW5nXHJcbiAgfVxyXG5cclxuICBzdGFydFNpbmdsZSAoKSB7XHJcbiAgICB0aGlzLnNob3dMb2FkaW5nKClcclxuICAgIHRoaXMuc3RhcnRMb2FkKClcclxuICAgIGxldCB0aW1lclxyXG4gICAgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmlzTG9hZGVkKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcilcclxuICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZVNjZW5lJywgUGxheVNjZW5lLCB7XHJcbiAgICAgICAgICBtYXBGaWxlOiAnVzBOMCcsXHJcbiAgICAgICAgICBwb3NpdGlvbjogWzEsIDFdXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSwgMTAwMClcclxuICB9XHJcblxyXG4gIHN0YXJ0TXVsdGkgKCkge1xyXG4gICAgdGhpcy50ZXh0TG9hZGluZy50ZXh0ID0gJ25vdCBzdXBwb3J0IG5vdydcclxuICAgIHRoaXMuc2hvd0xvYWRpbmcoKVxyXG4gIH1cclxuXHJcbiAgc2hvd0xvYWRpbmcgKCkge1xyXG4gICAgdGhpcy50ZXh0TG9hZGluZy52aXNpYmxlID0gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgc3RhcnRMb2FkICgpIHtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZVxyXG4gICAgLy8gbG9hZCBhbiBpbWFnZSBhbmQgcnVuIHRoZSBgc2V0dXBgIGZ1bmN0aW9uIHdoZW4gaXQncyBkb25lXHJcbiAgICBsb2FkZXJcclxuICAgICAgLmFkZCgnaW1hZ2VzL3RlcnJhaW5fYXRsYXMuanNvbicpXHJcbiAgICAgIC5hZGQoJ2ltYWdlcy9iYXNlX291dF9hdGxhcy5qc29uJylcclxuICAgICAgLmFkZCgnaW1hZ2VzL2ZpcmVfYm9sdC5wbmcnKVxyXG4gICAgICAubG9hZCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMuaXNMb2FkZWQgPSB0cnVlXHJcbiAgICAgIH0pXHJcbiAgfVxyXG5cclxuICB0aWNrIChkZWx0YSkge1xyXG4gICAgdGhpcy5saWZlICs9IGRlbHRhIC8gMzAgLy8gYmxlbmQgc3BlZWRcclxuICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICB0aGlzLnRleHRMb2FkaW5nLnRleHQgPSB0ZXh0ICsgQXJyYXkoTWF0aC5mbG9vcih0aGlzLmxpZmUpICUgNCArIDEpLmpvaW4oJy4nKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTG9hZGluZ1NjZW5lXHJcbiIsImltcG9ydCB7IGxvYWRlciwgcmVzb3VyY2VzLCBkaXNwbGF5IH0gZnJvbSAnLi4vbGliL1BJWEknXHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9saWIvU2NlbmUnXHJcbmltcG9ydCBNYXAgZnJvbSAnLi4vbGliL01hcCdcclxuaW1wb3J0IE1hcEZvZyBmcm9tICcuLi9saWIvTWFwRm9nJ1xyXG5pbXBvcnQgeyBJU19NT0JJTEUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuaW1wb3J0IENhdCBmcm9tICcuLi9vYmplY3RzL0NhdCdcclxuXHJcbmltcG9ydCBNZXNzYWdlV2luZG93IGZyb20gJy4uL3VpL01lc3NhZ2VXaW5kb3cnXHJcbmltcG9ydCBQbGF5ZXJXaW5kb3cgZnJvbSAnLi4vdWkvUGxheWVyV2luZG93J1xyXG5pbXBvcnQgSW52ZW50b3J5V2luZG93IGZyb20gJy4uL3VpL0ludmVudG9yeVdpbmRvdydcclxuaW1wb3J0IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsIGZyb20gJy4uL3VpL1RvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsJ1xyXG5pbXBvcnQgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwgZnJvbSAnLi4vdWkvVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwnXHJcblxyXG5sZXQgc2NlbmVXaWR0aFxyXG5sZXQgc2NlbmVIZWlnaHRcclxuXHJcbmZ1bmN0aW9uIGdldE1lc3NhZ2VXaW5kb3dPcHQgKCkge1xyXG4gIGxldCBvcHQgPSB7fVxyXG4gIGlmIChJU19NT0JJTEUpIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGhcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDMwXHJcbiAgICBvcHQuc2Nyb2xsQmFyV2lkdGggPSA1MFxyXG4gICAgb3B0LnNjcm9sbEJhck1pbkhlaWdodCA9IDcwXHJcbiAgfSBlbHNlIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggPCA0MDAgPyBzY2VuZVdpZHRoIDogc2NlbmVXaWR0aCAvIDJcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDYwXHJcbiAgfVxyXG4gIG9wdC5oZWlnaHQgPSBzY2VuZUhlaWdodCAvIDZcclxuICBvcHQueCA9IDBcclxuICBvcHQueSA9IHNjZW5lSGVpZ2h0IC0gb3B0LmhlaWdodFxyXG5cclxuICByZXR1cm4gb3B0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBsYXllcldpbmRvd09wdCAocGxheWVyKSB7XHJcbiAgbGV0IG9wdCA9IHtcclxuICAgIHBsYXllclxyXG4gIH1cclxuICBvcHQueCA9IDBcclxuICBvcHQueSA9IDBcclxuICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIC8gNFxyXG4gICAgb3B0LmhlaWdodCA9IHNjZW5lSGVpZ2h0IC8gNlxyXG4gICAgb3B0LmZvbnRTaXplID0gb3B0LndpZHRoIC8gMTBcclxuICB9IGVsc2Uge1xyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aCA8IDQwMCA/IHNjZW5lV2lkdGggLyAyIDogc2NlbmVXaWR0aCAvIDRcclxuICAgIG9wdC5oZWlnaHQgPSBzY2VuZUhlaWdodCAvIDNcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDIwXHJcbiAgfVxyXG4gIHJldHVybiBvcHRcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SW52ZW50b3J5V2luZG93T3B0IChwbGF5ZXIpIHtcclxuICBsZXQgb3B0ID0ge1xyXG4gICAgcGxheWVyXHJcbiAgfVxyXG4gIG9wdC55ID0gMFxyXG4gIGlmIChJU19NT0JJTEUpIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggLyA2XHJcbiAgfSBlbHNlIHtcclxuICAgIGxldCBkaXZpZGUgPSBzY2VuZVdpZHRoIDwgNDAwID8gNiA6IHNjZW5lV2lkdGggPCA4MDAgPyAxMiA6IDIwXHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIC8gZGl2aWRlXHJcbiAgfVxyXG4gIG9wdC54ID0gc2NlbmVXaWR0aCAtIG9wdC53aWR0aFxyXG4gIHJldHVybiBvcHRcclxufVxyXG5cclxuY2xhc3MgUGxheVNjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yICh7IG1hcEZpbGUsIHBvc2l0aW9uIH0pIHtcclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLm1hcEZpbGUgPSBtYXBGaWxlXHJcbiAgICB0aGlzLnRvUG9zaXRpb24gPSBwb3NpdGlvblxyXG4gICAgdGhpcy5ncm91cC5lbmFibGVTb3J0ID0gdHJ1ZVxyXG4gICAgdGhpcy5tYXBTY2FsZSA9IElTX01PQklMRSA/IDIgOiAwLjVcclxuICAgIHRoaXMubWFwRm9nID0gbmV3IE1hcEZvZygpXHJcbiAgfVxyXG5cclxuICBjcmVhdGUgKCkge1xyXG4gICAgc2NlbmVXaWR0aCA9IHRoaXMucGFyZW50LndpZHRoXHJcbiAgICBzY2VuZUhlaWdodCA9IHRoaXMucGFyZW50LmhlaWdodFxyXG4gICAgdGhpcy5pc01hcExvYWRlZCA9IGZhbHNlXHJcbiAgICB0aGlzLmxvYWRNYXAoKVxyXG4gICAgdGhpcy5pbml0UGxheWVyKClcclxuICAgIHRoaXMuaW5pdFVpKClcclxuICB9XHJcblxyXG4gIGluaXRVaSAoKSB7XHJcbiAgICBsZXQgdWlHcm91cCA9IG5ldyBkaXNwbGF5Lkdyb3VwKDEsIHRydWUpXHJcbiAgICBsZXQgdWlMYXllciA9IG5ldyBkaXNwbGF5LkxheWVyKHVpR3JvdXApXHJcbiAgICB1aUxheWVyLnBhcmVudExheWVyID0gdGhpc1xyXG4gICAgdGhpcy5hZGRDaGlsZCh1aUxheWVyKVxyXG5cclxuICAgIGxldCBtZXNzYWdlV2luZG93ID0gbmV3IE1lc3NhZ2VXaW5kb3coZ2V0TWVzc2FnZVdpbmRvd09wdCgpKVxyXG4gICAgbGV0IHBsYXllcldpbmRvdyA9IG5ldyBQbGF5ZXJXaW5kb3coZ2V0UGxheWVyV2luZG93T3B0KHRoaXMuY2F0KSlcclxuICAgIGxldCBpbnZlbnRvcnlXaW5kb3cgPSBuZXcgSW52ZW50b3J5V2luZG93KGdldEludmVudG9yeVdpbmRvd09wdCh0aGlzLmNhdCkpXHJcblxyXG4gICAgLy8g6K6TVUnpoa/npLrlnKjpoILlsaRcclxuICAgIG1lc3NhZ2VXaW5kb3cucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcbiAgICBwbGF5ZXJXaW5kb3cucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcbiAgICBpbnZlbnRvcnlXaW5kb3cucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcbiAgICB1aUxheWVyLmFkZENoaWxkKG1lc3NhZ2VXaW5kb3cpXHJcbiAgICB1aUxheWVyLmFkZENoaWxkKHBsYXllcldpbmRvdylcclxuICAgIHVpTGF5ZXIuYWRkQ2hpbGQoaW52ZW50b3J5V2luZG93KVxyXG5cclxuICAgIGlmIChJU19NT0JJTEUpIHtcclxuICAgICAgLy8g5Y+q5pyJ5omL5qmf6KaB6Ke45o6n5p2/XHJcbiAgICAgIC8vIOaWueWQkeaOp+WItlxyXG4gICAgICBsZXQgZGlyZWN0aW9uUGFuZWwgPSBuZXcgVG91Y2hEaXJlY3Rpb25Db250cm9sUGFuZWwoe1xyXG4gICAgICAgIHg6IHNjZW5lV2lkdGggLyA0LFxyXG4gICAgICAgIHk6IHNjZW5lSGVpZ2h0ICogNCAvIDYsXHJcbiAgICAgICAgcmFkaXVzOiBzY2VuZVdpZHRoIC8gOFxyXG4gICAgICB9KVxyXG4gICAgICBkaXJlY3Rpb25QYW5lbC5wYXJlbnRHcm91cCA9IHVpR3JvdXBcclxuXHJcbiAgICAgIC8vIOaTjeS9nOaOp+WItlxyXG4gICAgICBsZXQgb3BlcmF0aW9uUGFuZWwgPSBuZXcgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwoe1xyXG4gICAgICAgIHg6IHNjZW5lV2lkdGggLyA1ICogMyxcclxuICAgICAgICB5OiBzY2VuZUhlaWdodCAvIDUgKiAzLFxyXG4gICAgICAgIHdpZHRoOiBzY2VuZVdpZHRoIC8gMyxcclxuICAgICAgICBoZWlnaHQ6IHNjZW5lSGVpZ2h0IC8gNVxyXG4gICAgICB9KVxyXG4gICAgICBvcGVyYXRpb25QYW5lbC5wYXJlbnRHcm91cCA9IHVpR3JvdXBcclxuXHJcbiAgICAgIHVpTGF5ZXIuYWRkQ2hpbGQoZGlyZWN0aW9uUGFuZWwpXHJcbiAgICAgIHVpTGF5ZXIuYWRkQ2hpbGQob3BlcmF0aW9uUGFuZWwpXHJcbiAgICAgIC8vIHJlcXVpcmUoJy4uL2xpYi9kZW1vJylcclxuICAgIH1cclxuICAgIG1lc3NhZ2VXaW5kb3cuYWRkKFsnc2NlbmUgc2l6ZTogKCcsIHNjZW5lV2lkdGgsICcsICcsIHNjZW5lSGVpZ2h0LCAnKS4nXS5qb2luKCcnKSlcclxuICB9XHJcblxyXG4gIGluaXRQbGF5ZXIgKCkge1xyXG4gICAgaWYgKCF0aGlzLmNhdCkge1xyXG4gICAgICB0aGlzLmNhdCA9IG5ldyBDYXQoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbG9hZE1hcCAoKSB7XHJcbiAgICBsZXQgZmlsZU5hbWUgPSAnd29ybGQvJyArIHRoaXMubWFwRmlsZVxyXG5cclxuICAgIC8vIGlmIG1hcCBub3QgbG9hZGVkIHlldFxyXG4gICAgaWYgKCFyZXNvdXJjZXNbZmlsZU5hbWVdKSB7XHJcbiAgICAgIGxvYWRlclxyXG4gICAgICAgIC5hZGQoZmlsZU5hbWUsIGZpbGVOYW1lICsgJy5qc29uJylcclxuICAgICAgICAubG9hZCh0aGlzLnNwYXduTWFwLmJpbmQodGhpcywgZmlsZU5hbWUpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zcGF3bk1hcChmaWxlTmFtZSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNwYXduTWFwIChmaWxlTmFtZSkge1xyXG4gICAgbGV0IG1hcEdyb3VwID0gbmV3IGRpc3BsYXkuR3JvdXAoMCwgdHJ1ZSlcclxuICAgIGxldCBtYXBMYXllciA9IG5ldyBkaXNwbGF5LkxheWVyKG1hcEdyb3VwKVxyXG4gICAgbWFwTGF5ZXIucGFyZW50TGF5ZXIgPSB0aGlzXHJcbiAgICBtYXBMYXllci5ncm91cC5lbmFibGVTb3J0ID0gdHJ1ZVxyXG4gICAgbWFwTGF5ZXIucG9zaXRpb24uc2V0KHNjZW5lV2lkdGggLyAyLCBzY2VuZUhlaWdodCAvIDIpXHJcbiAgICB0aGlzLmFkZENoaWxkKG1hcExheWVyKVxyXG5cclxuICAgIGxldCBtYXBEYXRhID0gcmVzb3VyY2VzW2ZpbGVOYW1lXS5kYXRhXHJcblxyXG4gICAgbGV0IG1hcCA9IG5ldyBNYXAoKVxyXG4gICAgbWFwTGF5ZXIuYWRkQ2hpbGQobWFwKVxyXG4gICAgLy8gZW5hYmxlIGZvZ1xyXG4gICAgaWYgKCFtYXBEYXRhLmhhc0ZvZykge1xyXG4gICAgICB0aGlzLm1hcEZvZy5kaXNhYmxlKClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubWFwRm9nLmVuYWJsZShtYXApXHJcbiAgICB9XHJcbiAgICAvLyB0aGlzLm1hcEZvZy5wb3NpdGlvbi5zZXQoLXNjZW5lV2lkdGggLyAyLCAtc2NlbmVIZWlnaHQgLyAyKVxyXG4gICAgbWFwTGF5ZXIuYWRkQ2hpbGQodGhpcy5tYXBGb2cpXHJcbiAgICBtYXAubG9hZChtYXBEYXRhKVxyXG5cclxuICAgIG1hcC5vbigndXNlJywgbyA9PiB7XHJcbiAgICAgIHRoaXMuaXNNYXBMb2FkZWQgPSBmYWxzZVxyXG4gICAgICAvLyBjbGVhciBvbGQgbWFwXHJcbiAgICAgIHRoaXMucmVtb3ZlQ2hpbGQodGhpcy5tYXApXHJcbiAgICAgIHRoaXMubWFwLmRlc3Ryb3koKVxyXG5cclxuICAgICAgdGhpcy5tYXBGaWxlID0gby5tYXBcclxuICAgICAgdGhpcy50b1Bvc2l0aW9uID0gby50b1Bvc2l0aW9uXHJcbiAgICAgIHRoaXMubG9hZE1hcCgpXHJcbiAgICB9KVxyXG5cclxuICAgIG1hcC5hZGRQbGF5ZXIodGhpcy5jYXQsIHRoaXMudG9Qb3NpdGlvbilcclxuICAgIC8vIFRPRE86IGRlYnVnIHJlbmRlclxyXG4gICAgLy8gbWFwLmRlYnVnKHt3aWR0aDogc2NlbmVXaWR0aCwgaGVpZ2h0OiBzY2VuZUhlaWdodH0pXHJcbiAgICBtYXAuc2V0U2NhbGUodGhpcy5tYXBTY2FsZSlcclxuICAgIHRoaXMubWFwID0gbWFwXHJcblxyXG4gICAgdGhpcy5pc01hcExvYWRlZCA9IHRydWVcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNNYXBMb2FkZWQpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcC50aWNrKGRlbHRhKVxyXG4gICAgLy8gRklYTUU6IGdhcCBiZXR3ZWVuIHRpbGVzIG9uIGlQaG9uZSBTYWZhcmlcclxuICAgIHRoaXMubWFwLnNldFBvc2l0aW9uKFxyXG4gICAgICAtdGhpcy5jYXQueCAqIHRoaXMubWFwU2NhbGUsXHJcbiAgICAgIC10aGlzLmNhdC55ICogdGhpcy5tYXBTY2FsZSlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYXlTY2VuZVxyXG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBXaW5kb3cgZnJvbSAnLi9XaW5kb3cnXG5cbmNsYXNzIEJ1dHRvbiBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG5cbiAgICBsZXQgeyB3aWR0aCwgaGVpZ2h0LCBmb250U2l6ZSA9IGhlaWdodCAqIDAuNSwgbGl0ZXJhbCA9ICcnLCBvbiB9ID0gb3B0XG5cbiAgICB0aGlzLl9kcmF3KGZvbnRTaXplLCB3aWR0aCwgaGVpZ2h0KVxuICAgIHRoaXMuc2V0VGV4dChsaXRlcmFsKVxuICAgIGlmIChvbikge1xuICAgICAgdGhpcy5saXN0ZW4ob24pXG4gICAgfVxuICB9XG5cbiAgX2RyYXcgKGZvbnRTaXplLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgZmlsbDogJyM3NzMzMDAnXG4gICAgfSlcbiAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KCcnLCBzdHlsZSlcbiAgICB0ZXh0LmFuY2hvci5zZXQoMC41LCAwLjUpXG4gICAgdGV4dC5wb3NpdGlvbi5zZXQod2lkdGggLyAyLCBoZWlnaHQgLyAyKVxuICAgIHRoaXMuYWRkQ2hpbGQodGV4dClcbiAgICB0aGlzLl90ZXh0ID0gdGV4dFxuICB9XG5cbiAgc2V0VGV4dCAodGV4dCkge1xuICAgIHRoaXMuX3RleHQudGV4dCA9IHRleHRcbiAgfVxuXG4gIGxpc3RlbiAoZikge1xuICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXG4gICAgdGhpcy5vbignY2xpY2snLCBmKVxuICAgIHRoaXMub24oJ3RhcCcsIGYpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdCdXR0b24nXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQnV0dG9uXG4iLCJpbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcywgVGV4dCwgVGV4dFN0eWxlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgeyBBQklMSVRZX0NBUlJZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBrZXlib2FyZEpTIGZyb20gJ2tleWJvYXJkanMnXG5pbXBvcnQgeyBTV0lUQ0gxLCBTV0lUQ0gyLCBTV0lUQ0gzLCBTV0lUQ0g0IH0gZnJvbSAnLi4vY29uZmlnL2NvbnRyb2wnXG5cbmNvbnN0IFNMT1RTID0gWyBTV0lUQ0gxLCBTV0lUQ0gyLCBTV0lUQ0gzLCBTV0lUQ0g0IF1cblxuY2xhc3MgU2xvdCBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxuXG4gICAgbGV0IHJlY3QgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHJlY3QuYmVnaW5GaWxsKDB4QTJBMkEyKVxuICAgIHJlY3QuZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDUpXG4gICAgcmVjdC5lbmRGaWxsKClcbiAgICB0aGlzLmFkZENoaWxkKHJlY3QpXG5cbiAgICBsZXQgYm9yZGVyUmVjdCA9IG5ldyBHcmFwaGljcygpXG4gICAgYm9yZGVyUmVjdC5saW5lU3R5bGUoMywgMHhGRjAwMDAsIDEpXG4gICAgYm9yZGVyUmVjdC5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxuICAgIGJvcmRlclJlY3QuZW5kRmlsbCgpXG4gICAgYm9yZGVyUmVjdC52aXNpYmxlID0gZmFsc2VcbiAgICB0aGlzLmFkZENoaWxkKGJvcmRlclJlY3QpXG5cbiAgICB0aGlzLmJvcmRlclJlY3QgPSBib3JkZXJSZWN0XG4gIH1cblxuICBzZXRDb250ZXh0IChza2lsbCwgY291bnQpIHtcbiAgICB0aGlzLmNsZWFyQ29udGV4dCgpXG5cbiAgICBsZXQgd2lkdGggPSB0aGlzLndpZHRoXG4gICAgbGV0IGhlaWdodCA9IHRoaXMuaGVpZ2h0XG4gICAgLy8g572u5LitXG4gICAgbGV0IHNwcml0ZSA9IHNraWxsLnNwcml0ZSgpXG4gICAgbGV0IG1heFNpZGUgPSBNYXRoLm1heChzcHJpdGUud2lkdGgsIHNwcml0ZS5oZWlnaHQpXG4gICAgbGV0IHNjYWxlID0gd2lkdGggLyBtYXhTaWRlXG4gICAgc3ByaXRlLnNjYWxlLnNldChzY2FsZSlcbiAgICBzcHJpdGUucG9zaXRpb24uc2V0KHdpZHRoIC8gMiAtIHNwcml0ZS53aWR0aCAvIDIsIGhlaWdodCAvIDIgLSBzcHJpdGUuaGVpZ2h0IC8gMilcbiAgICB0aGlzLmFkZENoaWxkKHNwcml0ZSlcblxuICAgIC8vIOaVuOmHj1xuICAgIGxldCBmb250U2l6ZSA9IHRoaXMud2lkdGggKiAwLjNcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgIGZpbGw6ICdyZWQnLFxuICAgICAgZm9udFdlaWdodDogJzYwMCcsXG4gICAgICBsaW5lSGVpZ2h0OiBmb250U2l6ZVxuICAgIH0pXG4gICAgbGV0IGNvdW50VGV4dCA9IGNvdW50ID09PSBJbmZpbml0eSA/ICfiiJ4nIDogY291bnRcbiAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KGNvdW50VGV4dCwgc3R5bGUpXG4gICAgdGV4dC5wb3NpdGlvbi5zZXQod2lkdGggKiAwLjk1LCBoZWlnaHQpXG4gICAgdGV4dC5hbmNob3Iuc2V0KDEsIDEpXG4gICAgdGhpcy5hZGRDaGlsZCh0ZXh0KVxuXG4gICAgdGhpcy5zcHJpdGUgPSBzcHJpdGVcbiAgICB0aGlzLnRleHQgPSB0ZXh0XG4gIH1cblxuICBjbGVhckNvbnRleHQgKCkge1xuICAgIGlmICh0aGlzLnNwcml0ZSkge1xuICAgICAgdGhpcy5zcHJpdGUuZGVzdHJveSgpXG4gICAgICB0aGlzLnRleHQuZGVzdHJveSgpXG4gICAgICBkZWxldGUgdGhpcy5zcHJpdGVcbiAgICAgIGRlbGV0ZSB0aGlzLnRleHRcbiAgICB9XG4gIH1cblxuICBzZWxlY3QgKCkge1xuICAgIHRoaXMuYm9yZGVyUmVjdC52aXNpYmxlID0gdHJ1ZVxuICB9XG5cbiAgZGVzZWxlY3QgKCkge1xuICAgIHRoaXMuYm9yZGVyUmVjdC52aXNpYmxlID0gZmFsc2VcbiAgfVxufVxuXG5jbGFzcyBJbnZlbnRvcnlXaW5kb3cgZXh0ZW5kcyBXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgbGV0IHsgcGxheWVyLCB3aWR0aCB9ID0gb3B0XG4gICAgbGV0IHBhZGRpbmcgPSB3aWR0aCAqIDAuMVxuICAgIGxldCBjZWlsU2l6ZSA9IHdpZHRoIC0gcGFkZGluZyAqIDJcbiAgICBsZXQgY2VpbE9wdCA9IHtcbiAgICAgIHg6IHBhZGRpbmcsXG4gICAgICB5OiBwYWRkaW5nLFxuICAgICAgd2lkdGg6IGNlaWxTaXplLFxuICAgICAgaGVpZ2h0OiBjZWlsU2l6ZVxuICAgIH1cbiAgICBsZXQgc2xvdENvdW50ID0gNFxuICAgIG9wdC5oZWlnaHQgPSAod2lkdGggLSBwYWRkaW5nKSAqIHNsb3RDb3VudCArIHBhZGRpbmdcblxuICAgIHN1cGVyKG9wdClcblxuICAgIHRoaXMuX29wdCA9IG9wdFxuICAgIHBsYXllci5vbignaW52ZW50b3J5LW1vZGlmaWVkJywgdGhpcy5vbkludmVudG9yeU1vZGlmaWVkLmJpbmQodGhpcywgcGxheWVyKSlcblxuICAgIHRoaXMuc2xvdENvbnRhaW5lcnMgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xvdENvdW50OyBpKyspIHtcbiAgICAgIGxldCBzbG90ID0gbmV3IFNsb3QoY2VpbE9wdClcbiAgICAgIGxldCBrZXkgPSBTTE9UU1tpXVxuICAgICAgbGV0IHByZXNzID0gKCkgPT4ge1xuICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KGtleSlcbiAgICAgICAga2V5Ym9hcmRKUy5yZWxlYXNlS2V5KGtleSlcbiAgICAgIH1cbiAgICAgIHNsb3QuaW50ZXJhY3RpdmUgPSB0cnVlXG4gICAgICAvLyB0YXAgZm9yIHN3aXRjaCBza2lsbFxuICAgICAgc2xvdC5vbignY2xpY2snLCBwcmVzcylcbiAgICAgIHNsb3Qub24oJ3RhcCcsIHByZXNzKVxuICAgICAgdGhpcy5hZGRDaGlsZChzbG90KVxuICAgICAgdGhpcy5zbG90Q29udGFpbmVycy5wdXNoKHNsb3QpXG4gICAgICBjZWlsT3B0LnkgKz0gY2VpbFNpemUgKyBwYWRkaW5nXG4gICAgfVxuICAgIC8vIGRlZmF1bHQgdXNlIGZpcnN0IG9uZVxuICAgIHRoaXMuc2xvdENvbnRhaW5lcnNbMF0uc2VsZWN0KClcblxuICAgIHRoaXMub25JbnZlbnRvcnlNb2RpZmllZChwbGF5ZXIpXG4gICAgdGhpcy5zZXR1cChwbGF5ZXIpXG4gIH1cblxuICBvbkludmVudG9yeU1vZGlmaWVkIChwbGF5ZXIpIHtcbiAgICBsZXQgY2FycnlBYmlsaXR5ID0gcGxheWVyW0FCSUxJVFlfQ0FSUlldXG4gICAgaWYgKCFjYXJyeUFiaWxpdHkpIHtcbiAgICAgIC8vIG5vIGludmVudG9yeSB5ZXRcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgc2xvdHMgPSBbXVxuICAgIGxldCBpID0gMFxuICAgIGNhcnJ5QWJpbGl0eS5iYWdzLmZvckVhY2goc2xvdCA9PiB7XG4gICAgICBzbG90c1tpXSA9IHNsb3RcbiAgICAgIGkrK1xuICAgIH0pXG4gICAgdGhpcy5zbG90Q29udGFpbmVycy5mb3JFYWNoKChjb250YWluZXIsIGkpID0+IHtcbiAgICAgIGxldCBzbG90ID0gc2xvdHNbaV1cbiAgICAgIGlmIChzbG90KSB7XG4gICAgICAgIGNvbnRhaW5lci5zZXRDb250ZXh0KHNsb3Quc2tpbGwsIHNsb3QuY291bnQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250YWluZXIuY2xlYXJDb250ZXh0KClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgc2V0dXAgKHBsYXllcikge1xuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBwbGF5ZXJbQUJJTElUWV9DQVJSWV1cbiAgICBsZXQgYmluZCA9IGtleSA9PiB7XG4gICAgICBsZXQgc2xvdElueCA9IFNMT1RTLmluZGV4T2Yoa2V5KVxuICAgICAgbGV0IGhhbmRsZXIgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50UmVwZWF0KClcbiAgICAgICAgY2FycnlBYmlsaXR5LnNldEN1cnJlbnQoc2xvdElueClcbiAgICAgICAgdGhpcy5zbG90Q29udGFpbmVycy5mb3JFYWNoKChjb250YWluZXIsIGkpID0+IHtcbiAgICAgICAgICBpZiAoaSA9PT0gc2xvdElueCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnNlbGVjdCgpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5kZXNlbGVjdCgpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAga2V5Ym9hcmRKUy5iaW5kKGtleSwgaGFuZGxlciwgKCkgPT4ge30pXG4gICAgICByZXR1cm4gaGFuZGxlclxuICAgIH1cblxuICAgIGxldCBiaW5kc1xuICAgIGtleWJvYXJkSlMuc2V0Q29udGV4dCgnJylcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBiaW5kcyA9IHtcbiAgICAgICAgU1dJVENIMTogYmluZChTV0lUQ0gxKSxcbiAgICAgICAgU1dJVENIMjogYmluZChTV0lUQ0gyKSxcbiAgICAgICAgU1dJVENIMzogYmluZChTV0lUQ0gzKSxcbiAgICAgICAgU1dJVENINDogYmluZChTV0lUQ0g0KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBwbGF5ZXIub25jZSgncmVtb3ZlZCcsICgpID0+IHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKGJpbmRzKS5mb3JFYWNoKChba2V5LCBoYW5kbGVyXSkgPT4ge1xuICAgICAgICBrZXlib2FyZEpTLnVuYmluZChrZXksIGhhbmRsZXIpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW52ZW50b3J5V2luZG93XG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcblxuaW1wb3J0IFNjcm9sbGFibGVXaW5kb3cgZnJvbSAnLi9TY3JvbGxhYmxlV2luZG93J1xuaW1wb3J0IG1lc3NhZ2VzIGZyb20gJy4uL2xpYi9NZXNzYWdlcydcblxuY2xhc3MgTWVzc2FnZVdpbmRvdyBleHRlbmRzIFNjcm9sbGFibGVXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIob3B0KVxuXG4gICAgbGV0IHsgZm9udFNpemUgPSAxMiB9ID0gb3B0XG5cbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgIGZpbGw6ICdncmVlbicsXG4gICAgICBicmVha1dvcmRzOiB0cnVlLFxuICAgICAgd29yZFdyYXA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoOiB0aGlzLndpbmRvd1dpZHRoXG4gICAgfSlcbiAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KCcnLCBzdHlsZSlcblxuICAgIHRoaXMuYWRkV2luZG93Q2hpbGQodGV4dClcbiAgICB0aGlzLnRleHQgPSB0ZXh0XG5cbiAgICB0aGlzLmF1dG9TY3JvbGxUb0JvdHRvbSA9IHRydWVcblxuICAgIG1lc3NhZ2VzLm9uKCdtb2RpZmllZCcsIHRoaXMubW9kaWZpZWQuYmluZCh0aGlzKSlcbiAgfVxuXG4gIG1vZGlmaWVkICgpIHtcbiAgICBsZXQgc2Nyb2xsUGVyY2VudCA9IHRoaXMuc2Nyb2xsUGVyY2VudFxuICAgIHRoaXMudGV4dC50ZXh0ID0gW10uY29uY2F0KG1lc3NhZ2VzLmxpc3QpLnJldmVyc2UoKS5qb2luKCdcXG4nKVxuICAgIHRoaXMudXBkYXRlU2Nyb2xsQmFyTGVuZ3RoKClcblxuICAgIC8vIOiLpXNjcm9sbOe9ruW6le+8jOiHquWLleaNsuWLlee9ruW6lVxuICAgIGlmIChzY3JvbGxQZXJjZW50ID09PSAxKSB7XG4gICAgICB0aGlzLnNjcm9sbFRvKDEpXG4gICAgfVxuICB9XG5cbiAgYWRkIChtc2cpIHtcbiAgICBtZXNzYWdlcy5hZGQobXNnKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnbWVzc2FnZS13aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZVdpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBWYWx1ZUJhciBmcm9tICcuL1ZhbHVlQmFyJ1xuXG5pbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IHsgQUJJTElUWV9NT1ZFLCBBQklMSVRZX0NBTUVSQSwgQUJJTElUWV9IRUFMVEgsIEFCSUxJVFlfTUFOQSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IGZsb29yID0gTWF0aC5mbG9vclxuXG5jb25zdCBBQklMSVRJRVNfQUxMID0gW1xuICBBQklMSVRZX01PVkUsXG4gIEFCSUxJVFlfQ0FNRVJBLFxuICBBQklMSVRZX0hFQUxUSFxuXVxuXG5jbGFzcyBQbGF5ZXJXaW5kb3cgZXh0ZW5kcyBXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIob3B0KVxuICAgIGxldCB7IHBsYXllciB9ID0gb3B0XG4gICAgdGhpcy5fb3B0ID0gb3B0XG5cbiAgICB0aGlzLmhlYWx0aEJhciA9IHRoaXMucmVuZGVyQmFyKHt4OiA1LCB5OiA1LCBjb2xvcjogMHhEMjMyMDB9KVxuICAgIHRoaXMubWFuYUJhciA9IHRoaXMucmVuZGVyQmFyKHt4OiA1LCB5OiAxNywgY29sb3I6IDB4MDAzMkQyfSlcbiAgICB0aGlzLnJlbmRlckFiaWxpdHkoe3g6IDUsIHk6IDMyfSlcblxuICAgIHRoaXMub25BYmlsaXR5Q2FycnkocGxheWVyKVxuXG4gICAgcGxheWVyLm9uKCdhYmlsaXR5LWNhcnJ5JywgdGhpcy5vbkFiaWxpdHlDYXJyeS5iaW5kKHRoaXMsIHBsYXllcikpXG4gICAgcGxheWVyLm9uKCdoZWFsdGgtY2hhbmdlJywgdGhpcy5vbkhlYWx0aENoYW5nZS5iaW5kKHRoaXMsIHBsYXllcikpXG4gICAgcGxheWVyLm9uKCdtYW5hLWNoYW5nZScsIHRoaXMub25NYW5hQ2hhbmdlLmJpbmQodGhpcywgcGxheWVyKSlcbiAgfVxuXG4gIHJlbmRlckFiaWxpdHkgKHt4LCB5fSkge1xuICAgIGxldCBhYmlsaXR5VGV4dENvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKVxuICAgIGFiaWxpdHlUZXh0Q29udGFpbmVyLnBvc2l0aW9uLnNldCh4LCB5KVxuICAgIHRoaXMuYWRkQ2hpbGQoYWJpbGl0eVRleHRDb250YWluZXIpXG4gICAgdGhpcy5hYmlsaXR5VGV4dENvbnRhaW5lciA9IGFiaWxpdHlUZXh0Q29udGFpbmVyXG4gIH1cblxuICByZW5kZXJCYXIgKHt4LCB5LCBjb2xvcn0pIHtcbiAgICBsZXQge3dpZHRofSA9IHRoaXMuX29wdFxuICAgIHdpZHRoIC89IDJcbiAgICBsZXQgaGVpZ2h0ID0gMTBcbiAgICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpXG4gICAgY29udGFpbmVyLnBvc2l0aW9uLnNldCh4LCB5KVxuICAgIGxldCBiYXIgPSBuZXcgVmFsdWVCYXIoe3dpZHRoLCBoZWlnaHQsIGNvbG9yfSlcbiAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KCcoMTAvMjApJywgdGhpcy5fZ2V0VGV4dFN0eWxlKCkpXG4gICAgdGV4dC54ID0gd2lkdGggKyAzXG4gICAgdGV4dC55ID0gLTNcblxuICAgIGNvbnRhaW5lci5hZGRDaGlsZChiYXIpXG4gICAgY29udGFpbmVyLmFkZENoaWxkKHRleHQpXG4gICAgdGhpcy5hZGRDaGlsZChjb250YWluZXIpXG5cbiAgICBjb250YWluZXIuYmFyID0gYmFyXG4gICAgY29udGFpbmVyLnRleHQgPSB0ZXh0XG5cbiAgICByZXR1cm4gY29udGFpbmVyXG4gIH1cblxuICBfZ2V0VGV4dFN0eWxlICgpIHtcbiAgICBsZXQgeyBmb250U2l6ZSA9IDEwIH0gPSB0aGlzLl9vcHRcbiAgICByZXR1cm4gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgbGluZUhlaWdodDogZm9udFNpemVcbiAgICB9KVxuICB9XG5cbiAgb25BYmlsaXR5Q2FycnkgKHBsYXllcikge1xuICAgIGxldCBpID0gMFxuXG4gICAgLy8g5pu05paw6Z2i5p2/5pW45pOaXG4gICAgbGV0IGNvbnRpYW5lciA9IHRoaXMuYWJpbGl0eVRleHRDb250YWluZXJcbiAgICBjb250aWFuZXIucmVtb3ZlQ2hpbGRyZW4oKVxuICAgIEFCSUxJVElFU19BTEwuZm9yRWFjaChhYmlsaXR5U3ltYm9sID0+IHtcbiAgICAgIGxldCBhYmlsaXR5ID0gcGxheWVyLmFiaWxpdGllc1thYmlsaXR5U3ltYm9sXVxuICAgICAgaWYgKGFiaWxpdHkpIHtcbiAgICAgICAgbGV0IHRleHQgPSBuZXcgVGV4dChhYmlsaXR5LnRvU3RyaW5nKCksIHRoaXMuX2dldFRleHRTdHlsZSgpKVxuICAgICAgICB0ZXh0LnkgPSBpICogKHRleHQuaGVpZ2h0KVxuXG4gICAgICAgIGNvbnRpYW5lci5hZGRDaGlsZCh0ZXh0KVxuXG4gICAgICAgIGkrK1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBvbkhlYWx0aENoYW5nZSAocGxheWVyKSB7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWVCYXIodGhpcy5oZWFsdGhCYXIsIHBsYXllcltBQklMSVRZX0hFQUxUSF0pXG4gIH1cblxuICBvbk1hbmFDaGFuZ2UgKHBsYXllcikge1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlQmFyKHRoaXMubWFuYUJhciwgcGxheWVyW0FCSUxJVFlfTUFOQV0pXG4gIH1cblxuICBfdXBkYXRlVmFsdWVCYXIgKHBhbmVsLCBhYmlsaXR5KSB7XG4gICAgaWYgKCFhYmlsaXR5KSB7XG4gICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2VcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIXBhbmVsLnZpc2libGUpIHtcbiAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlXG4gICAgfVxuXG4gICAgcGFuZWwudGV4dC50ZXh0ID0gW1xuICAgICAgJygnLCBmbG9vcihhYmlsaXR5LnZhbHVlKSwgJy8nLCBmbG9vcihhYmlsaXR5LnZhbHVlTWF4KSwgJyknXG4gICAgXS5qb2luKCcnKVxuICAgIHBhbmVsLmJhci5lbWl0KCd2YWx1ZS1jaGFuZ2UnLCBhYmlsaXR5LnZhbHVlIC8gYWJpbGl0eS52YWx1ZU1heClcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3dpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXJXaW5kb3dcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuaW1wb3J0IFdpbmRvdyBmcm9tICcuL1dpbmRvdydcbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vV3JhcHBlcidcblxuY2xhc3MgU2Nyb2xsYWJsZVdpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG4gICAgbGV0IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcGFkZGluZyA9IDgsXG4gICAgICBzY3JvbGxCYXJXaWR0aCA9IDEwXG4gICAgfSA9IG9wdFxuICAgIHRoaXMuX29wdCA9IG9wdFxuXG4gICAgdGhpcy5faW5pdFNjcm9sbGFibGVBcmVhKFxuICAgICAgd2lkdGggLSBwYWRkaW5nICogMiAtIHNjcm9sbEJhcldpZHRoIC0gNSxcbiAgICAgIGhlaWdodCAtIHBhZGRpbmcgKiAyLFxuICAgICAgcGFkZGluZylcbiAgICB0aGlzLl9pbml0U2Nyb2xsQmFyKHtcbiAgICAgIC8vIHdpbmRvdyB3aWR0aCAtIHdpbmRvdyBwYWRkaW5nIC0gYmFyIHdpZHRoXG4gICAgICB4OiB3aWR0aCAtIHBhZGRpbmcgLSBzY3JvbGxCYXJXaWR0aCxcbiAgICAgIHk6IHBhZGRpbmcsXG4gICAgICB3aWR0aDogc2Nyb2xsQmFyV2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodCAtIHBhZGRpbmcgKiAyXG4gICAgfSlcbiAgfVxuXG4gIF9pbml0U2Nyb2xsYWJsZUFyZWEgKHdpZHRoLCBoZWlnaHQsIHBhZGRpbmcpIHtcbiAgICAvLyBob2xkIHBhZGRpbmdcbiAgICBsZXQgX21haW5WaWV3ID0gbmV3IENvbnRhaW5lcigpXG4gICAgX21haW5WaWV3LnBvc2l0aW9uLnNldChwYWRkaW5nLCBwYWRkaW5nKVxuICAgIHRoaXMuYWRkQ2hpbGQoX21haW5WaWV3KVxuXG4gICAgdGhpcy5tYWluVmlldyA9IG5ldyBDb250YWluZXIoKVxuICAgIF9tYWluVmlldy5hZGRDaGlsZCh0aGlzLm1haW5WaWV3KVxuXG4gICAgLy8gaGlkZSBtYWluVmlldydzIG92ZXJmbG93XG4gICAgbGV0IG1hc2sgPSBuZXcgR3JhcGhpY3MoKVxuICAgIG1hc2suYmVnaW5GaWxsKDB4RkZGRkZGKVxuICAgIG1hc2suZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDUpXG4gICAgbWFzay5lbmRGaWxsKClcbiAgICB0aGlzLm1haW5WaWV3Lm1hc2sgPSBtYXNrXG4gICAgX21haW5WaWV3LmFkZENoaWxkKG1hc2spXG5cbiAgICAvLyB3aW5kb3cgd2lkdGggLSB3aW5kb3cgcGFkZGluZyAqIDIgLSBiYXIgd2lkdGggLSBiZXR3ZWVuIHNwYWNlXG4gICAgdGhpcy5fd2luZG93V2lkdGggPSB3aWR0aFxuICAgIHRoaXMuX3dpbmRvd0hlaWdodCA9IGhlaWdodFxuICB9XG5cbiAgX2luaXRTY3JvbGxCYXIgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgbGV0IGNvbmF0aW5lciA9IG5ldyBDb250YWluZXIoKVxuICAgIGNvbmF0aW5lci54ID0geFxuICAgIGNvbmF0aW5lci55ID0geVxuXG4gICAgbGV0IHNjcm9sbEJhckJnID0gbmV3IEdyYXBoaWNzKClcbiAgICBzY3JvbGxCYXJCZy5iZWdpbkZpbGwoMHhBOEE4QTgpXG4gICAgc2Nyb2xsQmFyQmcuZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDIpXG4gICAgc2Nyb2xsQmFyQmcuZW5kRmlsbCgpXG5cbiAgICBsZXQgc2Nyb2xsQmFyID0gbmV3IEdyYXBoaWNzKClcbiAgICBzY3JvbGxCYXIuYmVnaW5GaWxsKDB4MjIyMjIyKVxuICAgIHNjcm9sbEJhci5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgMylcbiAgICBzY3JvbGxCYXIuZW5kRmlsbCgpXG4gICAgc2Nyb2xsQmFyLnRvU3RyaW5nID0gKCkgPT4gJ3Njcm9sbEJhcidcbiAgICBXcmFwcGVyLmRyYWdnYWJsZShzY3JvbGxCYXIsIHtcbiAgICAgIGJvdW5kYXJ5OiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDAsXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgIH1cbiAgICB9KVxuICAgIHNjcm9sbEJhci5vbignZHJhZycsIHRoaXMuc2Nyb2xsTWFpblZpZXcuYmluZCh0aGlzKSlcblxuICAgIGNvbmF0aW5lci5hZGRDaGlsZChzY3JvbGxCYXJCZylcbiAgICBjb25hdGluZXIuYWRkQ2hpbGQoc2Nyb2xsQmFyKVxuICAgIHRoaXMuYWRkQ2hpbGQoY29uYXRpbmVyKVxuICAgIHRoaXMuc2Nyb2xsQmFyID0gc2Nyb2xsQmFyXG4gICAgdGhpcy5zY3JvbGxCYXJCZyA9IHNjcm9sbEJhckJnXG4gIH1cblxuICAvLyDmjbLli5XoppbnqpdcbiAgc2Nyb2xsTWFpblZpZXcgKCkge1xuICAgIHRoaXMubWFpblZpZXcueSA9ICh0aGlzLndpbmRvd0hlaWdodCAtIHRoaXMubWFpblZpZXcuaGVpZ2h0KSAqIHRoaXMuc2Nyb2xsUGVyY2VudFxuICB9XG5cbiAgLy8g5paw5aKe54mp5Lu26Iez6KaW56qXXG4gIGFkZFdpbmRvd0NoaWxkIChjaGlsZCkge1xuICAgIHRoaXMubWFpblZpZXcuYWRkQ2hpbGQoY2hpbGQpXG4gIH1cblxuICAvLyDmm7TmlrDmjbLli5Xmo5LlpKflsI8sIOS4jeS4gOWumuimgeiqv+eUqFxuICB1cGRhdGVTY3JvbGxCYXJMZW5ndGggKCkge1xuICAgIGxldCB7IHNjcm9sbEJhck1pbkhlaWdodCA9IDIwIH0gPSB0aGlzLl9vcHRcblxuICAgIGxldCBkaCA9IHRoaXMubWFpblZpZXcuaGVpZ2h0IC8gdGhpcy53aW5kb3dIZWlnaHRcbiAgICBpZiAoZGggPCAxKSB7XG4gICAgICB0aGlzLnNjcm9sbEJhci5oZWlnaHQgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNjcm9sbEJhci5oZWlnaHQgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodCAvIGRoXG4gICAgICAvLyDpgb/lhY3lpKrlsI/lvojpm6Pmi5bmm7NcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IE1hdGgubWF4KHNjcm9sbEJhck1pbkhlaWdodCwgdGhpcy5zY3JvbGxCYXIuaGVpZ2h0KVxuICAgIH1cbiAgICB0aGlzLnNjcm9sbEJhci5mYWxsYmFja1RvQm91bmRhcnkoKVxuICB9XG5cbiAgLy8g5o2y5YuV55m+5YiG5q+UXG4gIGdldCBzY3JvbGxQZXJjZW50ICgpIHtcbiAgICBsZXQgZGVsdGEgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodCAtIHRoaXMuc2Nyb2xsQmFyLmhlaWdodFxuICAgIHJldHVybiBkZWx0YSA9PT0gMCA/IDEgOiB0aGlzLnNjcm9sbEJhci55IC8gZGVsdGFcbiAgfVxuXG4gIC8vIOaNsuWLleiHs+eZvuWIhuavlFxuICBzY3JvbGxUbyAocGVyY2VudCkge1xuICAgIGxldCBkZWx0YSA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC0gdGhpcy5zY3JvbGxCYXIuaGVpZ2h0XG4gICAgbGV0IHkgPSAwXG4gICAgaWYgKGRlbHRhICE9PSAwKSB7XG4gICAgICB5ID0gZGVsdGEgKiBwZXJjZW50XG4gICAgfVxuICAgIHRoaXMuc2Nyb2xsQmFyLnkgPSB5XG4gICAgdGhpcy5zY3JvbGxNYWluVmlldygpXG4gIH1cblxuICBnZXQgd2luZG93V2lkdGggKCkge1xuICAgIHJldHVybiB0aGlzLl93aW5kb3dXaWR0aFxuICB9XG5cbiAgZ2V0IHdpbmRvd0hlaWdodCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpbmRvd0hlaWdodFxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjcm9sbGFibGVXaW5kb3dcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi9saWIvVmVjdG9yJ1xyXG5cclxuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcclxuaW1wb3J0IHsgTEVGVCwgVVAsIFJJR0hULCBET1dOIH0gZnJvbSAnLi4vY29uZmlnL2NvbnRyb2wnXHJcblxyXG5jb25zdCBBTExfS0VZUyA9IFtSSUdIVCwgTEVGVCwgVVAsIERPV05dXHJcblxyXG5jbGFzcyBUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgcmFkaXVzIH0pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXHJcblxyXG4gICAgbGV0IHRvdWNoQXJlYSA9IG5ldyBHcmFwaGljcygpXHJcbiAgICB0b3VjaEFyZWEuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXHJcbiAgICB0b3VjaEFyZWEuZHJhd0NpcmNsZSgwLCAwLCByYWRpdXMpXHJcbiAgICB0b3VjaEFyZWEuZW5kRmlsbCgpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRvdWNoQXJlYSlcclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzXHJcblxyXG4gICAgdGhpcy5zZXR1cFRvdWNoKClcclxuICB9XHJcblxyXG4gIHNldHVwVG91Y2ggKCkge1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgIGxldCBmID0gdGhpcy5vblRvdWNoLmJpbmQodGhpcylcclxuICAgIHRoaXMub24oJ3RvdWNoc3RhcnQnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2hlbmQnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2htb3ZlJywgZilcclxuICAgIHRoaXMub24oJ3RvdWNoZW5kb3V0c2lkZScsIGYpXHJcbiAgfVxyXG5cclxuICBvblRvdWNoIChlKSB7XHJcbiAgICBsZXQgdHlwZSA9IGUudHlwZVxyXG4gICAgbGV0IHByb3BhZ2F0aW9uID0gZmFsc2VcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcclxuICAgICAgICB0aGlzLmRyYWcgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcclxuICAgICAgICB0aGlzLmNyZWF0ZURyYWdQb2ludCgpXHJcbiAgICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbiA9IHtcclxuICAgICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICAgIHk6IHRoaXMueVxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICd0b3VjaGVuZCc6XHJcbiAgICAgIGNhc2UgJ3RvdWNoZW5kb3V0c2lkZSc6XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgICAgdGhpcy5kcmFnID0gZmFsc2VcclxuICAgICAgICAgIHRoaXMuZGVzdHJveURyYWdQb2ludCgpXHJcbiAgICAgICAgICB0aGlzLnJlbGVhc2VLZXlzKClcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAndG91Y2htb3ZlJzpcclxuICAgICAgICBpZiAoIXRoaXMuZHJhZykge1xyXG4gICAgICAgICAgcHJvcGFnYXRpb24gPSB0cnVlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZXNzS2V5cyhlLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzKSlcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgaWYgKCFwcm9wYWdhdGlvbikge1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjcmVhdGVEcmFnUG9pbnQgKCkge1xyXG4gICAgbGV0IGRyYWdQb2ludCA9IG5ldyBHcmFwaGljcygpXHJcbiAgICBkcmFnUG9pbnQuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXHJcbiAgICBkcmFnUG9pbnQuZHJhd0NpcmNsZSgwLCAwLCAyMClcclxuICAgIGRyYWdQb2ludC5lbmRGaWxsKClcclxuICAgIHRoaXMuYWRkQ2hpbGQoZHJhZ1BvaW50KVxyXG4gICAgdGhpcy5kcmFnUG9pbnQgPSBkcmFnUG9pbnRcclxuICB9XHJcblxyXG4gIGRlc3Ryb3lEcmFnUG9pbnQgKCkge1xyXG4gICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLmRyYWdQb2ludClcclxuICAgIHRoaXMuZHJhZ1BvaW50LmRlc3Ryb3koKVxyXG4gIH1cclxuXHJcbiAgcHJlc3NLZXlzIChuZXdQb2ludCkge1xyXG4gICAgdGhpcy5yZWxlYXNlS2V5cygpXHJcbiAgICAvLyDmhJ/mh4npnYjmlY/luqZcclxuICAgIGxldCB0aHJlc2hvbGQgPSAzMFxyXG5cclxuICAgIGxldCB2ZWN0b3IgPSBWZWN0b3IuZnJvbVBvaW50KG5ld1BvaW50KVxyXG4gICAgbGV0IGRlZyA9IHZlY3Rvci5kZWdcclxuICAgIGxldCBsZW4gPSB2ZWN0b3IubGVuZ3RoXHJcblxyXG4gICAgaWYgKGxlbiA8IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGxldCBkZWdBYnMgPSBNYXRoLmFicyhkZWcpXHJcbiAgICBsZXQgZHggPSBkZWdBYnMgPCA2Ny41ID8gUklHSFQgOiAoZGVnQWJzID4gMTEyLjUgPyBMRUZUIDogZmFsc2UpXHJcbiAgICBsZXQgZHkgPSBkZWdBYnMgPCAyMi41IHx8IGRlZ0FicyA+IDE1Ny41ID8gZmFsc2UgOiAoZGVnIDwgMCA/IFVQIDogRE9XTilcclxuXHJcbiAgICBpZiAoZHggfHwgZHkpIHtcclxuICAgICAgaWYgKGR4KSB7XHJcbiAgICAgICAga2V5Ym9hcmRKUy5wcmVzc0tleShkeClcclxuICAgICAgfVxyXG4gICAgICBpZiAoZHkpIHtcclxuICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KGR5KVxyXG4gICAgICB9XHJcbiAgICAgIHZlY3Rvci5tdWx0aXBseVNjYWxhcih0aGlzLnJhZGl1cyAvIGxlbilcclxuICAgICAgdGhpcy5kcmFnUG9pbnQucG9zaXRpb24uc2V0KFxyXG4gICAgICAgIHZlY3Rvci54LFxyXG4gICAgICAgIHZlY3Rvci55XHJcbiAgICAgIClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbGVhc2VLZXlzICgpIHtcclxuICAgIEFMTF9LRVlTLmZvckVhY2goa2V5ID0+IGtleWJvYXJkSlMucmVsZWFzZUtleShrZXkpKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsXHJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi9saWIvVmVjdG9yJ1xyXG5cclxuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xyXG5cclxuY2xhc3MgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcclxuXHJcbiAgICBsZXQgdG91Y2hBcmVhID0gbmV3IEdyYXBoaWNzKClcclxuICAgIHRvdWNoQXJlYS5iZWdpbkZpbGwoMHhGMkYyRjIsIDAuNSlcclxuICAgIHRvdWNoQXJlYS5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxyXG4gICAgdG91Y2hBcmVhLmVuZEZpbGwoKVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0b3VjaEFyZWEpXHJcblxyXG4gICAgdGhpcy5zZXR1cFRvdWNoKClcclxuICB9XHJcblxyXG4gIHNldHVwVG91Y2ggKCkge1xyXG4gICAgdGhpcy5jZW50ZXIgPSBuZXcgVmVjdG9yKHRoaXMud2lkdGggLyAyLCB0aGlzLmhlaWdodCAvIDIpXHJcbiAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgbGV0IGYgPSB0aGlzLm9uVG91Y2guYmluZCh0aGlzKVxyXG4gICAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXHJcbiAgfVxyXG5cclxuICBvblRvdWNoIChlKSB7XHJcbiAgICBsZXQgcG9pbnRlciA9IGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpXHJcbiAgICBsZXQgdmVjdG9yID0gVmVjdG9yLmZyb21Qb2ludChwb2ludGVyKS5zdWIodGhpcy5jZW50ZXIpXHJcbiAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgncm90YXRlJywgdmVjdG9yKVxyXG4gICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoJ2ZpcmUnKVxyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdUb3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsXHJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY2xhc3MgVmFsdWVCYXIgZXh0ZW5kcyBDb250YWluZXIge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIoKVxuICAgIGxldCB7IHggPSAwLCB5ID0gMCwgd2lkdGgsIGhlaWdodCwgY29sb3IgfSA9IG9wdFxuXG4gICAgLy8gYmFja2dyb3VuZFxuICAgIGxldCBocEJhckJnID0gbmV3IEdyYXBoaWNzKClcbiAgICBocEJhckJnLmJlZ2luRmlsbCgweEEyQTJBMilcbiAgICBocEJhckJnLmxpbmVTdHlsZSgxLCAweDIyMjIyMiwgMSlcbiAgICBocEJhckJnLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpXG4gICAgaHBCYXJCZy5lbmRGaWxsKClcblxuICAgIC8vIG1hc2tcbiAgICBsZXQgbWFzayA9IG5ldyBHcmFwaGljcygpXG4gICAgbWFzay5iZWdpbkZpbGwoMHhGRkZGRkYpXG4gICAgbWFzay5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxuICAgIG1hc2suZW5kRmlsbCgpXG4gICAgdGhpcy5hZGRDaGlsZChtYXNrKVxuICAgIHRoaXMuYmFyTWFzayA9IG1hc2tcblxuICAgIHRoaXMuYWRkQ2hpbGQoaHBCYXJCZylcbiAgICB0aGlzLmhwQmFyQmcgPSBocEJhckJnXG5cbiAgICAvLyBiYXJcbiAgICB0aGlzLl9yZW5kZXJCYXIoe2NvbG9yLCB3aWR0aCwgaGVpZ2h0fSlcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxuICAgIHRoaXMuX29wdCA9IG9wdFxuXG4gICAgdGhpcy5vbigndmFsdWUtY2hhbmdlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSlcbiAgfVxuXG4gIHVwZGF0ZSAocmF0ZSkge1xuICAgIHRoaXMucmVtb3ZlQ2hpbGQodGhpcy5ocEJhcklubmVyKVxuICAgIHRoaXMuaHBCYXJJbm5lci5kZXN0cm95KClcbiAgICBsZXQgeyBjb2xvciwgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fb3B0XG4gICAgdGhpcy5fcmVuZGVyQmFyKHtcbiAgICAgIGNvbG9yLFxuICAgICAgd2lkdGg6IHdpZHRoICogcmF0ZSxcbiAgICAgIGhlaWdodFxuICAgIH0pXG4gIH1cblxuICBfcmVuZGVyQmFyICh7Y29sb3IsIHdpZHRoLCBoZWlnaHR9KSB7XG4gICAgbGV0IGhwQmFySW5uZXIgPSBuZXcgR3JhcGhpY3MoKVxuICAgIGhwQmFySW5uZXIuYmVnaW5GaWxsKGNvbG9yKVxuICAgIGhwQmFySW5uZXIuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodClcbiAgICBocEJhcklubmVyLmVuZEZpbGwoKVxuICAgIGhwQmFySW5uZXIubWFzayA9IHRoaXMuYmFyTWFza1xuXG4gICAgdGhpcy5hZGRDaGlsZChocEJhcklubmVyKVxuICAgIHRoaXMuaHBCYXJJbm5lciA9IGhwQmFySW5uZXJcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWYWx1ZUJhclxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5jbGFzcyBXaW5kb3cgZXh0ZW5kcyBDb250YWluZXIge1xuICBjb25zdHJ1Y3RvciAoeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcblxuICAgIGxldCBsaW5lV2lkdGggPSAzXG5cbiAgICBsZXQgd2luZG93QmcgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHdpbmRvd0JnLmJlZ2luRmlsbCgweEYyRjJGMilcbiAgICB3aW5kb3dCZy5saW5lU3R5bGUobGluZVdpZHRoLCAweDIyMjIyMiwgMSlcbiAgICB3aW5kb3dCZy5kcmF3Um91bmRlZFJlY3QoXG4gICAgICAwLCAwLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICA1KVxuICAgIHdpbmRvd0JnLmVuZEZpbGwoKVxuICAgIHRoaXMuYWRkQ2hpbGQod2luZG93QmcpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2luZG93XG4iLCJjb25zdCBPUFQgPSBTeW1ib2woJ29wdCcpXG5cbmZ1bmN0aW9uIF9lbmFibGVEcmFnZ2FibGUgKCkge1xuICB0aGlzLmRyYWcgPSBmYWxzZVxuICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxuICBsZXQgZiA9IF9vblRvdWNoLmJpbmQodGhpcylcbiAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXG4gIHRoaXMub24oJ3RvdWNoZW5kJywgZilcbiAgdGhpcy5vbigndG91Y2htb3ZlJywgZilcbiAgdGhpcy5vbigndG91Y2hlbmRvdXRzaWRlJywgZilcbiAgdGhpcy5vbignbW91c2Vkb3duJywgZilcbiAgdGhpcy5vbignbW91c2V1cCcsIGYpXG4gIHRoaXMub24oJ21vdXNlbW92ZScsIGYpXG4gIHRoaXMub24oJ21vdXNldXBvdXRzaWRlJywgZilcbn1cblxuZnVuY3Rpb24gX29uVG91Y2ggKGUpIHtcbiAgbGV0IHR5cGUgPSBlLnR5cGVcbiAgbGV0IHByb3BhZ2F0aW9uID0gZmFsc2VcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAndG91Y2hzdGFydCc6XG4gICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgIHRoaXMuZHJhZyA9IGUuZGF0YS5nbG9iYWwuY2xvbmUoKVxuICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbiA9IHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnlcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndG91Y2hlbmQnOlxuICAgIGNhc2UgJ3RvdWNoZW5kb3V0c2lkZSc6XG4gICAgY2FzZSAnbW91c2V1cCc6XG4gICAgY2FzZSAnbW91c2V1cG91dHNpZGUnOlxuICAgICAgdGhpcy5kcmFnID0gZmFsc2VcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndG91Y2htb3ZlJzpcbiAgICBjYXNlICdtb3VzZW1vdmUnOlxuICAgICAgaWYgKCF0aGlzLmRyYWcpIHtcbiAgICAgICAgcHJvcGFnYXRpb24gPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBsZXQgbmV3UG9pbnQgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcbiAgICAgIHRoaXMucG9zaXRpb24uc2V0KFxuICAgICAgICB0aGlzLm9yaWdpblBvc2l0aW9uLnggKyBuZXdQb2ludC54IC0gdGhpcy5kcmFnLngsXG4gICAgICAgIHRoaXMub3JpZ2luUG9zaXRpb24ueSArIG5ld1BvaW50LnkgLSB0aGlzLmRyYWcueVxuICAgICAgKVxuICAgICAgX2ZhbGxiYWNrVG9Cb3VuZGFyeS5jYWxsKHRoaXMpXG4gICAgICB0aGlzLmVtaXQoJ2RyYWcnKSAvLyBtYXliZSBjYW4gcGFzcyBwYXJhbSBmb3Igc29tZSByZWFzb246IGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpXG4gICAgICBicmVha1xuICB9XG4gIGlmICghcHJvcGFnYXRpb24pIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cbn1cblxuLy8g6YCA5Zue6YKK55WMXG5mdW5jdGlvbiBfZmFsbGJhY2tUb0JvdW5kYXJ5ICgpIHtcbiAgbGV0IHsgd2lkdGggPSB0aGlzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmhlaWdodCwgYm91bmRhcnkgfSA9IHRoaXNbT1BUXVxuICB0aGlzLnggPSBNYXRoLm1heCh0aGlzLngsIGJvdW5kYXJ5LngpXG4gIHRoaXMueCA9IE1hdGgubWluKHRoaXMueCwgYm91bmRhcnkueCArIGJvdW5kYXJ5LndpZHRoIC0gd2lkdGgpXG4gIHRoaXMueSA9IE1hdGgubWF4KHRoaXMueSwgYm91bmRhcnkueSlcbiAgdGhpcy55ID0gTWF0aC5taW4odGhpcy55LCBib3VuZGFyeS55ICsgYm91bmRhcnkuaGVpZ2h0IC0gaGVpZ2h0KVxufVxuY2xhc3MgV3JhcHBlciB7XG4gIC8qKlxuICAgKiBkaXNwbGF5T2JqZWN0OiB3aWxsIHdyYXBwZWQgRGlzcGxheU9iamVjdFxuICAgKiBvcHQ6IHtcbiAgICogIGJvdW5kYXJ5OiDmi5bmm7PpgornlYwgeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH1cbiAgICogIFssIHdpZHRoXTog6YKK55WM56Kw5pKe5a+sKGRlZmF1bHQ6IGRpc3BsYXlPYmplY3Qud2lkdGgpXG4gICAqICBbLCBoZWlnaHRdOiDpgornlYznorDmkp7pq5goZGVmYXVsdDogZGlzcGxheU9iamVjdC5oZWlnaHQpXG4gICAqICB9XG4gICAqL1xuICBzdGF0aWMgZHJhZ2dhYmxlIChkaXNwbGF5T2JqZWN0LCBvcHQpIHtcbiAgICBkaXNwbGF5T2JqZWN0W09QVF0gPSBvcHRcbiAgICBfZW5hYmxlRHJhZ2dhYmxlLmNhbGwoZGlzcGxheU9iamVjdClcbiAgICBkaXNwbGF5T2JqZWN0LmZhbGxiYWNrVG9Cb3VuZGFyeSA9IF9mYWxsYmFja1RvQm91bmRhcnlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXcmFwcGVyXG4iXX0=
