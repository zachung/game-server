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

},{"./lib/Application":10,"./scenes/LoadingScene":53}],8:[function(require,module,exports){
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
        o.on('addObject', objectEvent.addObject.bind(_this2, o));
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
      this.objects[_constants.REPLY].forEach(function (o) {
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

var _FireBolt = require('../objects/skills/FireBolt');

var _FireBolt2 = _interopRequireDefault(_FireBolt);

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
var ItemsOther = [_Treasure2.default, _Door2.default, _Torch2.default, _GrassDecorate2.default, _FireBolt2.default, _WallShootBolt2.default];
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

},{"../objects/Air":23,"../objects/Door":26,"../objects/Grass":28,"../objects/GrassDecorate1":29,"../objects/Ground":30,"../objects/IronFence":31,"../objects/Root":32,"../objects/Torch":33,"../objects/Treasure":34,"../objects/Tree":35,"../objects/Wall":36,"../objects/WallShootBolt":37,"../objects/abilities/Camera":39,"../objects/abilities/Move":48,"../objects/abilities/Operate":49,"../objects/skills/FireBolt":51}],23:[function(require,module,exports){
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
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$speed = _ref.speed,
        speed = _ref$speed === undefined ? 1 : _ref$speed,
        _ref$damage = _ref.damage,
        damage = _ref$damage === undefined ? 1 : _ref$damage,
        _ref$force = _ref.force,
        force = _ref$force === undefined ? 0 : _ref$force;

    _classCallCheck(this, Bullet);

    var _this = _possibleConstructorReturn(this, (Bullet.__proto__ || Object.getPrototypeOf(Bullet)).call(this, _Texture2.default.Bullet));

    new _Learn2.default().carryBy(_this).learn(new _Move2.default([speed, 0])).learn(new _Health2.default(HealthPoint)).learn(new _Damage2.default([damage, force]));

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
      if (this.life % 10 !== 0) {
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
    value: function take(skill) {
      var _this2 = this;

      var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

      var owner = this.owner;
      if (skill instanceof _Ability3.default && owner[_constants.ABILITY_LEARN]) {
        // 取得能力
        owner[_constants.ABILITY_LEARN].learn(skill);
        return;
      }
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

var levels = [
// cost, reactForce, speed, damage, force, scale
[1, 0.001, 6, 1, 0.01], [3, 0.001, 10, 3, 5, 2]];

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
  }, {
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

    // 建立實體並釋放

  }, {
    key: 'cast',
    value: function cast(_ref) {
      var caster = _ref.caster,
          _ref$rad = _ref.rad,
          rad = _ref$rad === undefined ? undefined : _ref$rad;

      var _levels$level = _slicedToArray(levels[this.level], 6),
          cost = _levels$level[0],
          reactForce = _levels$level[1],
          _levels$level$ = _levels$level[2],
          speed = _levels$level$ === undefined ? 1 : _levels$level$,
          _levels$level$2 = _levels$level[3],
          damage = _levels$level$2 === undefined ? 1 : _levels$level$2,
          _levels$level$3 = _levels$level[4],
          force = _levels$level$3 === undefined ? 0 : _levels$level$3,
          _levels$level$4 = _levels$level[5],
          scale = _levels$level$4 === undefined ? 1 : _levels$level$4;

      if (!this._cost(caster, cost)) {
        return;
      }
      var bullet = new _Bullet2.default({ speed: speed, damage: damage, force: force });

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
      var rectLen = calcApothem(caster, rad + caster.rotation);
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

},{"../../config/constants":8,"../../lib/Texture":19,"../../lib/Vector":20,"../Bullet":24,"./Skill":52}],52:[function(require,module,exports){
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
    key: 'cost',
    value: function cost() {}
  }], [{
    key: 'sprite',
    value: function sprite(texture) {
      return new _PIXI.Sprite(texture);
    }
  }]);

  return Skill;
}();

exports.default = Skill;

},{"../../lib/PIXI":17}],53:[function(require,module,exports){
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

},{"../lib/PIXI":17,"../lib/Scene":18,"./PlayScene":54}],54:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Map":12,"../lib/MapFog":13,"../lib/PIXI":17,"../lib/Scene":18,"../lib/globalEventManager":21,"../objects/Cat":25,"../ui/InventoryWindow":55,"../ui/MessageWindow":56,"../ui/PlayerWindow":57,"../ui/TouchDirectionControlPanel":59,"../ui/TouchOperationControlPanel":60}],55:[function(require,module,exports){
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
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(width / 2, height / 2);
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
    for (var i = 0; i < slotCount; i++) {
      var slot = new Slot(ceilOpt);
      _this2.addChild(slot);
      _this2.slotContainers.push(slot);
      ceilOpt.y += ceilSize + padding;
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

},{"../config/constants":8,"../config/control":9,"../lib/PIXI":17,"./Window":62,"keyboardjs":2}],56:[function(require,module,exports){
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

},{"../lib/Messages":16,"../lib/PIXI":17,"./ScrollableWindow":58}],57:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/PIXI":17,"./ValueBar":61,"./Window":62}],58:[function(require,module,exports){
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

},{"../lib/PIXI":17,"./Window":62,"./Wrapper":63}],59:[function(require,module,exports){
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

},{"../config/control":9,"../lib/PIXI":17,"../lib/Vector":20,"keyboardjs":2}],60:[function(require,module,exports){
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

},{"../lib/PIXI":17,"../lib/Vector":20,"../lib/globalEventManager":21}],61:[function(require,module,exports){
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

},{"../lib/PIXI":17}],62:[function(require,module,exports){
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

},{"../lib/PIXI":17}],63:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tleWJvYXJkanMvbGliL2tleS1jb21iby5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9rZXlib2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9sb2NhbGUuanMiLCJub2RlX21vZHVsZXMva2V5Ym9hcmRqcy9sb2NhbGVzL3VzLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jb25maWcvY29uc3RhbnRzLmpzIiwic3JjL2NvbmZpZy9jb250cm9sLmpzIiwic3JjL2xpYi9BcHBsaWNhdGlvbi5qcyIsInNyYy9saWIvTGlnaHQuanMiLCJzcmMvbGliL01hcC5qcyIsInNyYy9saWIvTWFwRm9nLmpzIiwic3JjL2xpYi9NYXBXb3JsZC5qcyIsInNyYy9saWIvTWF0dGVyLmpzIiwic3JjL2xpYi9NZXNzYWdlcy5qcyIsInNyYy9saWIvUElYSS5qcyIsInNyYy9saWIvU2NlbmUuanMiLCJzcmMvbGliL1RleHR1cmUuanMiLCJzcmMvbGliL1ZlY3Rvci5qcyIsInNyYy9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyLmpzIiwic3JjL2xpYi91dGlscy5qcyIsInNyYy9vYmplY3RzL0Fpci5qcyIsInNyYy9vYmplY3RzL0J1bGxldC5qcyIsInNyYy9vYmplY3RzL0NhdC5qcyIsInNyYy9vYmplY3RzL0Rvb3IuanMiLCJzcmMvb2JqZWN0cy9HYW1lT2JqZWN0LmpzIiwic3JjL29iamVjdHMvR3Jhc3MuanMiLCJzcmMvb2JqZWN0cy9HcmFzc0RlY29yYXRlMS5qcyIsInNyYy9vYmplY3RzL0dyb3VuZC5qcyIsInNyYy9vYmplY3RzL0lyb25GZW5jZS5qcyIsInNyYy9vYmplY3RzL1Jvb3QuanMiLCJzcmMvb2JqZWN0cy9Ub3JjaC5qcyIsInNyYy9vYmplY3RzL1RyZWFzdXJlLmpzIiwic3JjL29iamVjdHMvVHJlZS5qcyIsInNyYy9vYmplY3RzL1dhbGwuanMiLCJzcmMvb2JqZWN0cy9XYWxsU2hvb3RCb2x0LmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0NhcnJ5LmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0RhbWFnZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9GaXJlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0hlYWx0aC5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9LZXlGaXJlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0tleU1vdmUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvTGVhcm4uanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvTWFuYS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9Nb3ZlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL09wZXJhdGUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvUm90YXRlLmpzIiwic3JjL29iamVjdHMvc2tpbGxzL0ZpcmVCb2x0LmpzIiwic3JjL29iamVjdHMvc2tpbGxzL1NraWxsLmpzIiwic3JjL3NjZW5lcy9Mb2FkaW5nU2NlbmUuanMiLCJzcmMvc2NlbmVzL1BsYXlTY2VuZS5qcyIsInNyYy91aS9JbnZlbnRvcnlXaW5kb3cuanMiLCJzcmMvdWkvTWVzc2FnZVdpbmRvdy5qcyIsInNyYy91aS9QbGF5ZXJXaW5kb3cuanMiLCJzcmMvdWkvU2Nyb2xsYWJsZVdpbmRvdy5qcyIsInNyYy91aS9Ub3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbC5qcyIsInNyYy91aS9Ub3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbC5qcyIsInNyYy91aS9WYWx1ZUJhci5qcyIsInNyYy91aS9XaW5kb3cuanMiLCJzcmMvdWkvV3JhcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BKQSxJQUFBLGVBQUEsUUFBQSxtQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxnQkFBQSxRQUFBLHVCQUFBLENBQUE7Ozs7Ozs7O0FBRUE7QUFDQSxJQUFJLE1BQU0sSUFBSSxjQUFKLE9BQUEsQ0FBZ0I7QUFDeEIsU0FEd0IsR0FBQTtBQUV4QixVQUZ3QixHQUFBO0FBR3hCLGVBSHdCLElBQUE7QUFJeEIsY0FKd0IsSUFBQTtBQUt4QixjQUx3QixDQUFBO0FBTXhCLGFBQVc7QUFOYSxDQUFoQixDQUFWOztBQVNBLElBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLFVBQUE7QUFDQSxJQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0EsSUFBQSxRQUFBLENBQUEsTUFBQSxDQUFvQixPQUFwQixVQUFBLEVBQXVDLE9BQXZDLFdBQUE7O0FBRUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxXQUFBLENBQTBCLElBQTFCLElBQUE7O0FBRUEsSUFBQSxXQUFBO0FBQ0EsSUFBQSxLQUFBO0FBQ0EsSUFBQSxXQUFBLENBQWdCLGVBQWhCLE9BQUE7Ozs7Ozs7O0FDdEJPLElBQU0sWUFBQSxRQUFBLFNBQUEsR0FBYSxVQUFBLENBQUEsRUFBQTtBQUFBLFNBQU8sNFRBQUEsSUFBQSxDQUFBLENBQUEsS0FDL0IsNGhEQUFBLElBQUEsQ0FBaWlELEVBQUEsTUFBQSxDQUFBLENBQUEsRUFBamlELENBQWlpRCxDQUFqaUQ7QUFEd0I7QUFBRCxDQUFDLENBRXhCLFVBQUEsU0FBQSxJQUF1QixVQUF2QixNQUFBLElBQTJDLE9BRnRDLEtBQW1CLENBQW5COztBQUlBLElBQU0sWUFBQSxRQUFBLFNBQUEsR0FBTixFQUFBOztBQUVBLElBQU0sZUFBQSxRQUFBLFlBQUEsR0FBZSxPQUFyQixNQUFxQixDQUFyQjtBQUNBLElBQU0saUJBQUEsUUFBQSxjQUFBLEdBQWlCLE9BQXZCLFFBQXVCLENBQXZCO0FBQ0EsSUFBTSxrQkFBQSxRQUFBLGVBQUEsR0FBa0IsT0FBeEIsU0FBd0IsQ0FBeEI7QUFDQSxJQUFNLG1CQUFBLFFBQUEsZ0JBQUEsR0FBbUIsT0FBekIsVUFBeUIsQ0FBekI7QUFDQSxJQUFNLGlCQUFBLFFBQUEsY0FBQSxHQUFpQixPQUF2QixRQUF1QixDQUF2QjtBQUNBLElBQU0sZ0JBQUEsUUFBQSxhQUFBLEdBQWdCLE9BQXRCLE9BQXNCLENBQXRCO0FBQ0EsSUFBTSxnQkFBQSxRQUFBLGFBQUEsR0FBZ0IsT0FBdEIsT0FBc0IsQ0FBdEI7QUFDQSxJQUFNLGdCQUFBLFFBQUEsYUFBQSxHQUFnQixPQUF0QixPQUFzQixDQUF0QjtBQUNBLElBQU0sb0JBQUEsUUFBQSxpQkFBQSxHQUFvQixPQUExQixXQUEwQixDQUExQjtBQUNBLElBQU0sbUJBQUEsUUFBQSxnQkFBQSxHQUFtQixPQUF6QixNQUF5QixDQUF6QjtBQUNBLElBQU0saUJBQUEsUUFBQSxjQUFBLEdBQWlCLE9BQXZCLFFBQXVCLENBQXZCO0FBQ0EsSUFBTSxpQkFBQSxRQUFBLGNBQUEsR0FBaUIsT0FBdkIsUUFBdUIsQ0FBdkI7QUFDQSxJQUFNLGVBQUEsUUFBQSxZQUFBLEdBQWUsT0FBckIsTUFBcUIsQ0FBckI7QUFDQSxJQUFNLGdCQUFBLFFBQUEsYUFBQSxHQUFnQixDQUFBLFlBQUEsRUFBQSxjQUFBLEVBQUEsZUFBQSxFQUFBLGdCQUFBLEVBQUEsY0FBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLGlCQUFBLEVBQUEsZ0JBQUEsRUFBQSxjQUFBLEVBQUEsY0FBQSxFQUF0QixZQUFzQixDQUF0Qjs7QUFnQlA7QUFDTyxJQUFNLFNBQUEsUUFBQSxNQUFBLEdBQU4sUUFBQTtBQUNQO0FBQ08sSUFBTSxPQUFBLFFBQUEsSUFBQSxHQUFOLE1BQUE7QUFDUDtBQUNPLElBQU0sUUFBQSxRQUFBLEtBQUEsR0FBTixPQUFBOzs7Ozs7OztBQ3hDQSxJQUFNLE9BQUEsUUFBQSxJQUFBLEdBQU4sR0FBQTtBQUNBLElBQU0sS0FBQSxRQUFBLEVBQUEsR0FBTixHQUFBO0FBQ0EsSUFBTSxRQUFBLFFBQUEsS0FBQSxHQUFOLEdBQUE7QUFDQSxJQUFNLE9BQUEsUUFBQSxJQUFBLEdBQU4sR0FBQTtBQUNBLElBQU0sVUFBQSxRQUFBLE9BQUEsR0FBTixHQUFBO0FBQ0EsSUFBTSxVQUFBLFFBQUEsT0FBQSxHQUFOLEdBQUE7QUFDQSxJQUFNLFVBQUEsUUFBQSxPQUFBLEdBQU4sR0FBQTtBQUNBLElBQU0sVUFBQSxRQUFBLE9BQUEsR0FBTixHQUFBO0FBQ0EsSUFBTSxPQUFBLFFBQUEsSUFBQSxHQUFOLEdBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNSUCxJQUFBLFFBQUEsUUFBQSxRQUFBLENBQUE7O0FBQ0EsSUFBQSxzQkFBQSxRQUFBLHNCQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSSxNQUFBLEtBQUosQ0FBQTs7SUFFTSxjOzs7QUFDSixXQUFBLFdBQUEsR0FBc0I7QUFBQSxRQUFBLElBQUE7O0FBQUEsb0JBQUEsSUFBQSxFQUFBLFdBQUE7O0FBQUEsU0FBQSxJQUFBLE9BQUEsVUFBQSxNQUFBLEVBQU4sT0FBTSxNQUFBLElBQUEsQ0FBQSxFQUFBLE9BQUEsQ0FBQSxFQUFBLE9BQUEsSUFBQSxFQUFBLE1BQUEsRUFBQTtBQUFOLFdBQU0sSUFBTixJQUFNLFVBQUEsSUFBQSxDQUFOO0FBQU07O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLE9BQUEsWUFBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsV0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRXBCLFVBQUEsS0FBQTtBQUZvQixXQUFBLEtBQUE7QUFHckI7O0FBRUQ7Ozs7O2tDQUtlO0FBQ2IsV0FBQSxLQUFBLEdBQWEsSUFBSSxNQUFBLE9BQUEsQ0FBakIsS0FBYSxFQUFiO0FBQ0Q7OztnQ0FFWSxTLEVBQVcsTSxFQUFRO0FBQzlCLFVBQUksS0FBSixZQUFBLEVBQXVCO0FBQ3JCO0FBQ0E7QUFDQSxhQUFBLFlBQUEsQ0FBQSxPQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsV0FBQSxDQUF1QixLQUF2QixZQUFBO0FBQ0Q7O0FBRUQsVUFBSSxRQUFRLElBQUEsU0FBQSxDQUFaLE1BQVksQ0FBWjtBQUNBLFdBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBO0FBQ0EsWUFBQSxNQUFBO0FBQ0EsWUFBQSxFQUFBLENBQUEsYUFBQSxFQUF3QixLQUFBLFdBQUEsQ0FBQSxJQUFBLENBQXhCLElBQXdCLENBQXhCOztBQUVBLFdBQUEsWUFBQSxHQUFBLEtBQUE7QUFDRDs7OzRCQUVlO0FBQUEsVUFBQSxLQUFBO0FBQUEsVUFBQSxTQUFBLElBQUE7O0FBQUEsV0FBQSxJQUFBLFFBQUEsVUFBQSxNQUFBLEVBQU4sT0FBTSxNQUFBLEtBQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxFQUFBLFFBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQTtBQUFOLGFBQU0sS0FBTixJQUFNLFVBQUEsS0FBQSxDQUFOO0FBQU07O0FBQ2QsT0FBQSxRQUFBLEtBQUEsWUFBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLFlBQUEsU0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUE7O0FBRUE7QUFDQSxVQUFJLE9BQU8sS0FBQSxRQUFBLENBQVgsSUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLFFBQUEsQ0FDRSxJQUFJLE1BQUosUUFBQSxHQUFBLFFBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUE4QixLQUE5QixLQUFBLEVBQTBDLEtBRDVDLE1BQ0UsQ0FERjs7QUFJQSwyQkFBQSxPQUFBLENBQUEsY0FBQSxDQUFrQyxLQUFBLFFBQUEsQ0FBQSxPQUFBLENBQWxDLFdBQUE7O0FBRUE7QUFDQSxXQUFBLE1BQUEsQ0FBQSxHQUFBLENBQWdCLFVBQUEsS0FBQSxFQUFBO0FBQUEsZUFBUyxPQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFULEtBQVMsQ0FBVDtBQUFoQixPQUFBO0FBQ0Q7Ozs2QkFFUyxLLEVBQU87QUFDZjtBQUNBLFdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0Q7Ozs2QkExQ2dCO0FBQ2YsYUFBQSxHQUFBO0FBQ0Q7Ozs7RUFUdUIsTUFBQSxXOztrQkFvRFgsVzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pEZixJQUFBLFFBQUEsUUFBQSxRQUFBLENBQUE7O0FBQ0EsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7Ozs7Ozs7QUFFQSxJQUFNLFFBQVEsT0FBZCxPQUFjLENBQWQ7O0lBRU0sUTs7Ozs7Ozs0QkFDWSxNLEVBQVEsTSxFQUFrQjtBQUFBLFVBQVYsT0FBVSxVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBQUgsQ0FBRzs7QUFDeEMsVUFBSSxZQUFZLE9BQWhCLE1BQUE7QUFDQSxVQUFJLENBQUMsVUFBTCxRQUFBLEVBQXlCO0FBQ3ZCO0FBQ0E7QUFDRDtBQUNELFVBQUksWUFBWSxJQUFJLE1BQXBCLFFBQWdCLEVBQWhCO0FBQ0EsVUFBSSxLQUFKLElBQUE7QUFDQSxVQUFJLEtBQUosSUFBQTtBQUNBLFVBQUksS0FBSixJQUFBO0FBQ0EsVUFBSSxNQUFNLFNBQVMsV0FBbkIsU0FBQTs7QUFFQSxVQUFJLFNBQVMsT0FBYixNQUFBO0FBQ0EsVUFBSSxJQUFJLE9BQUEsS0FBQSxJQUFnQixNQUFNLE9BQTlCLENBQVEsQ0FBUjtBQUNBLFVBQUksSUFBSSxPQUFBLE1BQUEsSUFBaUIsTUFBTSxPQUEvQixDQUFRLENBQVI7QUFDQSxnQkFBQSxTQUFBLENBQW9CLENBQUMsTUFBRCxFQUFBLEtBQWMsTUFBZCxDQUFBLElBQXBCLEVBQUEsRUFBQSxHQUFBO0FBQ0EsZ0JBQUEsVUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQTtBQUNBLGdCQUFBLE9BQUE7QUFDQSxnQkFBQSxXQUFBLEdBQXdCLFVBbEJnQixRQWtCeEMsQ0FsQndDLENBa0JHOztBQUUzQyxhQUFBLEtBQUEsSUFBZ0I7QUFDZCxlQUFPO0FBRE8sT0FBaEI7QUFHQSxhQUFBLFFBQUEsQ0FBQSxTQUFBOztBQUVBLFVBQUksU0FBSixDQUFBLEVBQWdCO0FBQ2QsWUFBSSxXQUFXLFlBQVksWUFBTTtBQUMvQixjQUFJLFNBQVMsS0FBQSxNQUFBLE1BQWlCLElBQTlCLElBQWEsQ0FBYjtBQUNBLGNBQUksVUFBQSxLQUFBLENBQUEsQ0FBQSxHQUFKLENBQUEsRUFBMkI7QUFDekIscUJBQVMsQ0FBVCxNQUFBO0FBQ0Q7QUFDRCxvQkFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUE7QUFDQSxvQkFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUE7QUFDQSxvQkFBQSxLQUFBLElBQUEsTUFBQTtBQVBhLFNBQUEsRUFRWixPQVJILEVBQWUsQ0FBZjtBQVNBLGVBQUEsS0FBQSxFQUFBLFFBQUEsR0FBQSxRQUFBO0FBQ0Q7QUFDRjs7OzZCQUVnQixNLEVBQVE7QUFDdkIsVUFBSSxDQUFDLE9BQUwsS0FBSyxDQUFMLEVBQW9CO0FBQ2xCO0FBQ0E7QUFDRDtBQUNEO0FBQ0EsYUFBQSxXQUFBLENBQW1CLE9BQUEsS0FBQSxFQUFuQixLQUFBO0FBQ0E7QUFDQSxvQkFBYyxPQUFBLEtBQUEsRUFBZCxRQUFBO0FBQ0EsYUFBTyxPQUFQLEtBQU8sQ0FBUDtBQUNBO0FBQ0EsYUFBQSxHQUFBLENBQUEsU0FBQSxFQUFzQixNQUF0QixRQUFBO0FBQ0Q7Ozs7OztrQkFHWSxLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVEZixJQUFBLFFBQUEsUUFBQSxRQUFBLENBQUE7O0FBRUEsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7QUFDQSxJQUFBLFNBQUEsUUFBQSxTQUFBLENBQUE7O0FBQ0EsSUFBQSxZQUFBLFFBQUEsaUJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQUksYUFBSixLQUFBOztBQUVBLElBQU0sT0FBTyxTQUFQLElBQU8sQ0FBQSxLQUFBLEVBQUE7QUFBQSxPQUFBLElBQUEsT0FBQSxVQUFBLE1BQUEsRUFBQSxPQUFBLE1BQUEsT0FBQSxDQUFBLEdBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxDQUFBLEVBQUEsT0FBQSxJQUFBLEVBQUEsTUFBQSxFQUFBO0FBQUEsU0FBQSxPQUFBLENBQUEsSUFBQSxVQUFBLElBQUEsQ0FBQTtBQUFBOztBQUFBLFNBQ1gsS0FBQSxNQUFBLENBQVksVUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0FBQUEsV0FBZSxZQUFBO0FBQUEsYUFBYSxLQUFLLElBQUEsS0FBQSxDQUFBLFNBQUEsRUFBbEIsU0FBa0IsQ0FBTCxDQUFiO0FBQWYsS0FBQTtBQUFaLEdBQUEsRUFEVyxLQUNYLENBRFc7QUFBYixDQUFBOztBQUdBLElBQU0sY0FBYztBQUFBLGFBQUEsU0FBQSxTQUFBLENBQUEsTUFBQSxFQUFBLE1BQUEsRUFDUztBQUN6QixTQUFBLGFBQUEsQ0FBQSxNQUFBO0FBRmdCLEdBQUE7QUFBQSxPQUFBLFNBQUEsR0FBQSxDQUFBLE1BQUEsRUFJTDtBQUNYLGlCQUFBLElBQUE7QUFDQSxXQUFPLFdBQVAsZ0JBQUEsRUFBQSxNQUFBLENBQUEsTUFBQTtBQUNBLFdBQU8sV0FBUCxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxNQUFBO0FBQ0EsV0FBTyxXQUFQLGNBQUEsRUFBQSxNQUFBLENBQUEsTUFBQTtBQUNBLFdBQUEsR0FBQSxDQUFBLFVBQUE7QUFDRDtBQVZpQixDQUFwQjs7QUFhQTs7Ozs7SUFJTSxNOzs7QUFDSixXQUFBLEdBQUEsR0FBZTtBQUFBLFFBQUEsYUFBQTs7QUFBQSxvQkFBQSxJQUFBLEVBQUEsR0FBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsSUFBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUViLFVBQUEsUUFBQSxHQUFnQixXQUFoQixTQUFBOztBQUVBLFVBQUEsT0FBQSxJQUFBLGdCQUFBLEVBQUEsRUFBQSxnQkFBQSxhQUFBLEVBQ0csV0FESCxNQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsZ0JBQUEsYUFBQSxFQUVHLFdBRkgsSUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLGdCQUFBLGFBQUEsRUFHRyxXQUhILEtBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxhQUFBO0FBS0EsVUFBQSxHQUFBLEdBQVcsSUFBSSxNQUFmLFNBQVcsRUFBWDtBQUNBLFVBQUEsR0FBQSxDQUFBLGVBQUEsR0FBMkIsTUFBQSxlQUFBLENBQUEsSUFBQSxDQUEzQixLQUEyQixDQUEzQjtBQUNBLFVBQUEsUUFBQSxDQUFjLE1BQWQsR0FBQTs7QUFFQTtBQUNBLFVBQUEsV0FBQSxHQUFtQixJQUFJLE1BQUEsT0FBQSxDQUF2QixLQUFtQixFQUFuQjtBQUNBLFFBQUksY0FBYyxJQUFJLE1BQUEsT0FBQSxDQUFKLEtBQUEsQ0FBa0IsTUFBcEMsV0FBa0IsQ0FBbEI7QUFDQSxVQUFBLFFBQUEsQ0FBQSxXQUFBOztBQUVBO0FBQ0EsVUFBQSxRQUFBLEdBQWdCLElBQUksV0FBcEIsT0FBZ0IsRUFBaEI7O0FBRUEsVUFBQSxXQUFBLEdBQUEsRUFBQTtBQXJCYSxXQUFBLEtBQUE7QUFzQmQ7Ozs7eUJBRUssTyxFQUFTO0FBQUEsVUFBQSxTQUFBLElBQUE7O0FBQ2IsVUFBSSxRQUFRLFFBQVosS0FBQTtBQUNBLFVBQUksT0FBTyxRQUFYLElBQUE7QUFDQSxVQUFJLE9BQU8sUUFBWCxJQUFBO0FBQ0EsVUFBSSxRQUFRLFFBQVosS0FBQTs7QUFFQSxVQUFJLFdBQVcsS0FBZixRQUFBOztBQUVBLFVBQUksZ0JBQWdCLFNBQWhCLGFBQWdCLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFzQjtBQUN4QyxZQUFJLElBQUksQ0FBQSxHQUFBLE9BQUEsZ0JBQUEsRUFBQSxFQUFBLEVBQVIsTUFBUSxDQUFSO0FBQ0EsZUFBQSxhQUFBLENBQUEsQ0FBQSxFQUFzQixJQUF0QixRQUFBLEVBQW9DLElBQXBDLFFBQUE7QUFDQSxlQUFPLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBUCxDQUFPLENBQVA7QUFIRixPQUFBOztBQU1BLFVBQUksYUFBYSxTQUFiLFVBQWEsQ0FBQSxJQUFBLEVBQWU7QUFBQSxZQUFBLFFBQUEsZUFBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQUEsWUFBYixJQUFhLE1BQUEsQ0FBQSxDQUFBO0FBQUEsWUFBVixJQUFVLE1BQUEsQ0FBQSxDQUFBO0FBQUEsWUFBUCxJQUFPLE1BQUEsQ0FBQSxDQUFBOztBQUM5QixVQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQVksWUFBQTtBQUFBLGlCQUFNLE9BQUEsSUFBQSxDQUFBLEtBQUEsRUFBTixDQUFNLENBQU47QUFBWixTQUFBO0FBQ0EsVUFBQSxFQUFBLENBQUEsV0FBQSxFQUFrQixZQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFsQixDQUFrQixDQUFsQjtBQUNBO0FBQ0E7QUFDQSxlQUFPLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBUCxDQUFPLENBQVA7QUFMRixPQUFBOztBQVFBLFdBQUssSUFBSSxJQUFULENBQUEsRUFBZ0IsSUFBaEIsSUFBQSxFQUFBLEdBQUEsRUFBK0I7QUFDN0IsYUFBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFoQixJQUFBLEVBQUEsR0FBQSxFQUErQjtBQUM3QixlQUFBLGFBQUEsRUFBQSxVQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBc0MsTUFBTSxJQUFBLElBQUEsR0FBNUMsQ0FBc0MsQ0FBdEM7QUFDRDtBQUNGO0FBQ0QsWUFBQSxPQUFBLENBQWMsVUFBQSxJQUFBLEVBQVE7QUFBQSxZQUFBLFFBQUEsZUFBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQUEsWUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQUEsWUFBQSxTQUFBLGVBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFBQSxZQUFBLElBQUEsT0FBQSxDQUFBLENBQUE7QUFBQSxZQUFBLElBQUEsT0FBQSxDQUFBLENBQUE7QUFBQSxZQUFBLFNBQUEsTUFBQSxDQUFBLENBQUE7O0FBRXBCLGFBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxNQUFBO0FBRkYsT0FBQTtBQUlEOzs7OEJBRVUsTSxFQUFRLFUsRUFBWTtBQUFBLFVBQUEsU0FBQSxJQUFBOztBQUM3QjtBQUNBLGFBQUEsT0FBQSxDQUFBLFdBQUEsRUFBQSxPQUFBLENBQW9DLFVBQUEsS0FBQSxFQUEwQjtBQUFBLFlBQUEsUUFBQSxlQUFBLEtBQUEsRUFBQSxDQUFBLENBQUE7QUFBQSxZQUF4QixZQUF3QixNQUFBLENBQUEsQ0FBQTtBQUFBLFlBQWIsVUFBYSxNQUFBLENBQUEsQ0FBQTs7QUFDNUQsWUFBSSxZQUFZLFFBQUEsSUFBQSxDQUFBLE1BQUEsRUFBaEIsTUFBZ0IsQ0FBaEI7QUFDQSxlQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQTtBQUNBLGVBQUEsSUFBQSxDQUFBLFNBQUEsRUFBdUIsT0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLEVBQXZCLFNBQXVCLENBQXZCO0FBSEYsT0FBQTtBQUtBO0FBQ0EsV0FBQSxhQUFBLENBQUEsTUFBQSxFQUVFLFdBQUEsQ0FBQSxJQUFnQixLQUZsQixRQUFBLEVBR0UsV0FBQSxDQUFBLElBQWdCLEtBSGxCLFFBQUE7O0FBS0E7QUFDQSxhQUFBLFdBQUEsR0FBcUIsS0FBckIsV0FBQTs7QUFFQSxXQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0Q7Ozt5QkFFSyxLLEVBQU87QUFBQSxVQUFBLFNBQUEsSUFBQTs7QUFDWCxVQUFBLFVBQUEsRUFBZ0I7QUFDZDtBQUNEO0FBQ0QsV0FBQSxPQUFBLENBQWEsV0FBYixJQUFBLEVBQUEsT0FBQSxDQUEyQixVQUFBLENBQUEsRUFBQTtBQUFBLGVBQUssRUFBQSxJQUFBLENBQUwsS0FBSyxDQUFMO0FBQTNCLE9BQUE7QUFDQSxXQUFBLE9BQUEsQ0FBYSxXQUFiLEtBQUEsRUFBQSxPQUFBLENBQTRCLFVBQUEsQ0FBQSxFQUFBO0FBQUEsZUFBSyxFQUFBLElBQUEsQ0FBTCxLQUFLLENBQUw7QUFBNUIsT0FBQTtBQUNBLFdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBO0FBQ0EsV0FBQSxXQUFBLENBQUEsT0FBQSxDQUF5QixVQUFBLEtBQUEsRUFBUztBQUNoQyxlQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsS0FBQTtBQUNBO0FBRkYsT0FBQTtBQUlEOzs7a0NBRWMsQyxFQUFpQztBQUFBLFVBQTlCLElBQThCLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FBMUIsU0FBMEI7QUFBQSxVQUFmLElBQWUsVUFBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxHQUFYLFNBQVc7O0FBQzlDLFVBQUksTUFBSixTQUFBLEVBQXFCO0FBQ25CLFVBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQTtBQUNEO0FBQ0QsUUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFBOztBQUVBLFVBQUksU0FBUyxLQUFBLE9BQUEsQ0FBYSxFQUExQixJQUFhLENBQWI7QUFDQSxhQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLENBQUEsU0FBQSxFQUFrQixZQUFNO0FBQ3RCLFlBQUksTUFBTSxPQUFBLE9BQUEsQ0FBVixDQUFVLENBQVY7QUFDQSxlQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUZGLE9BQUE7O0FBS0E7QUFDQSxXQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0Q7Ozs2QkFFUyxLLEVBQU87QUFDZixXQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQTtBQUNBLFdBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBO0FBQ0Q7OztnQ0FFWSxDLEVBQUcsQyxFQUFHO0FBQ2pCLFdBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQTtBQUNEOzs7MEJBRU0sRyxFQUFLO0FBQ1YsV0FBQSxRQUFBLENBQUEsWUFBQSxDQUFBLEdBQUE7QUFDQSxXQUFBLFFBQUEsQ0FBQSxNQUFBLENBQXFCLEtBQUEsTUFBQSxDQUFyQixJQUFBO0FBQ0Q7OztvQ0FFZ0IsSyxFQUFPO0FBQ3RCLFdBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0Q7Ozs7RUE1SGUsTUFBQSxTOztrQkErSEgsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDM0pmLElBQUEsUUFBQSxRQUFBLFFBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxTOzs7QUFDSixXQUFBLE1BQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxNQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxPQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRWIsUUFBSSxXQUFXLElBQUksTUFBQSxPQUFBLENBQW5CLEtBQWUsRUFBZjtBQUNBLGFBQUEsRUFBQSxDQUFBLFNBQUEsRUFBdUIsVUFBQSxPQUFBLEVBQW1CO0FBQ3hDLGNBQUEsU0FBQSxHQUFvQixNQUFBLFdBQUEsQ0FBcEIsR0FBQTtBQURGLEtBQUE7QUFHQSxhQUFBLGdCQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsVUFBQSxHQUFzQixDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQVBULENBT1MsQ0FBdEIsQ0FQYSxDQU9zQjs7QUFFbkMsVUFBQSxRQUFBLENBQUEsUUFBQTs7QUFFQSxRQUFJLGlCQUFpQixJQUFJLE1BQUosTUFBQSxDQUFXLFNBQWhDLGdCQUFnQyxFQUFYLENBQXJCO0FBQ0EsbUJBQUEsU0FBQSxHQUEyQixNQUFBLFdBQUEsQ0FBM0IsUUFBQTs7QUFFQSxVQUFBLFFBQUEsQ0FBQSxjQUFBOztBQUVBLFVBQUEsUUFBQSxHQUFBLFFBQUE7QUFoQmEsV0FBQSxLQUFBO0FBaUJkOzs7OzJCQUVPLEcsRUFBSztBQUNYLFdBQUEsUUFBQSxDQUFBLFVBQUEsR0FBMkIsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBM0IsQ0FBMkIsQ0FBM0I7QUFDQSxVQUFBLEdBQUEsQ0FBQSxRQUFBLEdBQW1CLEtBQW5CLFFBQUE7QUFDRDs7QUFFRDs7Ozs4QkFDVztBQUNULFdBQUEsUUFBQSxDQUFBLFVBQUEsR0FBMkIsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBM0IsQ0FBMkIsQ0FBM0I7QUFDRDs7OztFQTVCa0IsTUFBQSxTOztrQkErQk4sTTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2pDZixJQUFBLFVBQUEsUUFBQSxVQUFBLENBQUE7O0FBQ0EsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7Ozs7Ozs7QUFFQSxJQUFJLFNBQVMsT0FBYixRQUFhLENBQWI7O0FBRUEsU0FBQSxPQUFBLENBQUEsSUFBQSxFQUF1QjtBQUNyQixNQUFJLFNBQVMsS0FBYixNQUFBO0FBQ0EsTUFBSSwwQkFBMEIsS0FBOUIsdUJBQUE7QUFDQSxNQUFJLDBCQUEwQixLQUE5Qix1QkFBQTtBQUNBLE1BQUksVUFBVSxDQUFDLEtBQUEsTUFBQSxDQUFmLENBQUE7QUFDQSxNQUFJLFVBQVUsQ0FBQyxLQUFBLE1BQUEsQ0FBZixDQUFBO0FBQ0EsTUFBSSxTQUFTLE9BQUEsTUFBQSxDQUFiLE1BQUE7QUFDQSxNQUFJLFFBQVEsS0FBQSxRQUFBLENBQVosQ0FBQTtBQUNBLE1BQUksUUFBUSxLQUFBLFFBQUEsQ0FBWixDQUFBOztBQUVBO0FBQ0EsU0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFlLFVBQWYsS0FBQTtBQUNBLFNBQUEsR0FBQSxDQUFBLENBQUEsR0FBZSxVQUFBLEtBQUEsR0FBZix1QkFBQTs7QUFFQTtBQUNBLFNBQUEsR0FBQSxDQUFBLENBQUEsR0FBZSxVQUFmLEtBQUE7QUFDQSxTQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQWUsVUFBQSxLQUFBLEdBQWYsdUJBQUE7O0FBRUEsVUFBQSxLQUFBLENBQUEsU0FBQSxDQUFnQixLQUFBLGVBQUEsQ0FBaEIsS0FBQSxFQUE0QyxPQUE1QyxHQUFBO0FBQ0Q7O0lBRUssVztBQUNKLFdBQUEsUUFBQSxHQUFlO0FBQUEsb0JBQUEsSUFBQSxFQUFBLFFBQUE7O0FBQ2I7QUFDQSxRQUFJLFNBQVMsUUFBQSxNQUFBLENBQWIsTUFBYSxFQUFiOztBQUVBLFFBQUksUUFBUSxPQUFaLEtBQUE7QUFDQSxVQUFBLE9BQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBO0FBQ0EsVUFBQSxrQkFBQSxHQUFBLEVBQUE7O0FBRUEsWUFBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsRUFBQSxnQkFBQSxFQUFvQyxVQUFBLEtBQUEsRUFBUztBQUMzQyxVQUFJLFFBQVEsTUFBWixLQUFBO0FBQ0EsV0FBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFJLE1BQXBCLE1BQUEsRUFBQSxHQUFBLEVBQXVDO0FBQ3JDLFlBQUksT0FBTyxNQUFYLENBQVcsQ0FBWDtBQUNBLFlBQUksS0FBSyxLQUFBLEtBQUEsQ0FBVCxNQUFTLENBQVQ7QUFDQSxZQUFJLEtBQUssS0FBQSxLQUFBLENBQVQsTUFBUyxDQUFUO0FBQ0EsV0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsRUFBQTtBQUNEO0FBUkgsS0FBQTtBQVVBLFlBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUEsY0FBQSxFQUFrQyxVQUFBLEtBQUEsRUFBUztBQUN6QyxZQUFBLGtCQUFBLENBQUEsT0FBQSxDQUFpQyxVQUFBLElBQUEsRUFBcUI7QUFBQSxZQUFuQixRQUFtQixLQUFuQixLQUFtQjtBQUFBLFlBQVosU0FBWSxLQUFaLE1BQVk7O0FBQ3BELFlBQUEsS0FBQSxFQUFXO0FBQ1Qsa0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBZ0IsTUFBaEIsSUFBQSxFQUE0QixNQUE1QixVQUFBLEVBQUEsTUFBQTtBQUNEO0FBSEgsT0FBQTtBQUtBLFlBQUEsa0JBQUEsR0FBQSxFQUFBO0FBTkYsS0FBQTs7QUFTQSxTQUFBLE1BQUEsR0FBQSxNQUFBO0FBQ0EsU0FBQSxlQUFBLEdBQXVCLFFBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBdkIsTUFBdUIsQ0FBdkI7QUFDQSxZQUFBLEtBQUEsQ0FBQSxHQUFBLENBQVUsT0FBVixLQUFBLEVBQXdCLEtBQXhCLGVBQUE7QUFDRDs7Ozt3QkFFSSxDLEVBQUc7QUFDTixVQUFJLEVBQUEsSUFBQSxLQUFXLFdBQWYsTUFBQSxFQUF1QjtBQUNyQjtBQUNEO0FBQ0QsVUFBSSxRQUFRLEtBQUEsTUFBQSxDQUFaLEtBQUE7QUFDQSxRQUFBLE9BQUE7QUFDQSxVQUFJLE9BQU8sRUFBWCxJQUFBO0FBQ0EsUUFBQSxJQUFBLENBQUEsU0FBQSxFQUFrQixZQUFNO0FBQ3RCLGdCQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLElBQUE7QUFERixPQUFBO0FBR0EsV0FBQSxNQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxjQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBLElBQUE7QUFDRDs7OzJCQUVPLEssRUFBTztBQUNiLGNBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBYyxLQUFkLE1BQUEsRUFBMkIsUUFBM0IsTUFBQTtBQUNEOzs7d0NBRThCO0FBQUEsVUFBaEIsUUFBZ0IsTUFBaEIsS0FBZ0I7QUFBQSxVQUFULFNBQVMsTUFBVCxNQUFTOztBQUM3QixVQUFJLFNBQVMsS0FBYixNQUFBO0FBQ0E7QUFDQSxVQUFJLFNBQVMsUUFBQSxNQUFBLENBQUEsTUFBQSxDQUFjO0FBQ3pCLGlCQUFTLFNBRGdCLElBQUE7QUFFekIsZ0JBRnlCLE1BQUE7QUFHekIsaUJBQVM7QUFDUCxpQkFBTyxRQURBLENBQUE7QUFFUCxrQkFBUSxTQUZELENBQUE7QUFHUCxzQkFITyxJQUFBO0FBSVAscUJBSk8sSUFBQTtBQUtQLCtCQUFxQjtBQUxkO0FBSGdCLE9BQWQsQ0FBYjs7QUFZQTtBQUNBLGNBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBO0FBQ0EsV0FBQSxNQUFBLENBQUEsTUFBQSxHQUFBLE1BQUE7QUFDQSxXQUFBLHVCQUFBLEdBQStCLE9BQUEsTUFBQSxDQUFBLEdBQUEsQ0FBL0IsQ0FBQTtBQUNBLFdBQUEsdUJBQUEsR0FBK0IsT0FBQSxNQUFBLENBQUEsR0FBQSxDQUEvQixDQUFBO0FBQ0EsV0FBQSxNQUFBLEdBQWM7QUFDWixXQUFHLFFBRFMsQ0FBQTtBQUVaLFdBQUcsU0FBUztBQUZBLE9BQWQ7QUFJRDs7OzJCQUVPLEksRUFBTTtBQUNaLGNBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBVSxLQUFWLE1BQUEsRUFBQSxjQUFBLEVBQXVDLFFBQUEsSUFBQSxDQUFBLElBQUEsRUFBdkMsSUFBdUMsQ0FBdkM7QUFDRDs7OzBCQUVNLE0sRUFBeUI7QUFBQSxVQUFqQixTQUFpQixVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBQVIsTUFBUTs7QUFDOUIsY0FBQSxLQUFBLENBQUEsUUFBQSxDQUFlLEtBQUEsZUFBQSxDQUFmLEtBQUEsRUFBMkM7QUFDekMsV0FBRyxLQURzQyxNQUFBO0FBRXpDLFdBQUcsS0FBSztBQUZpQyxPQUEzQztBQUlEOzs7Ozs7a0JBR1ksUTs7Ozs7Ozs7QUNySGY7QUFDTyxJQUFNLFNBQUEsUUFBQSxNQUFBLEdBQVMsT0FBZixNQUFBO0FBQ0EsSUFBTSxTQUFBLFFBQUEsTUFBQSxHQUFTLE9BQWYsTUFBQTtBQUNBLElBQU0sUUFBQSxRQUFBLEtBQUEsR0FBUSxPQUFkLEtBQUE7QUFDQSxJQUFNLFNBQUEsUUFBQSxNQUFBLEdBQVMsT0FBZixNQUFBO0FBQ0EsSUFBTSxTQUFBLFFBQUEsTUFBQSxHQUFTLE9BQWYsTUFBQTtBQUNBLElBQU0sT0FBQSxRQUFBLElBQUEsR0FBTyxPQUFiLElBQUE7QUFDQSxJQUFNLFNBQUEsUUFBQSxNQUFBLEdBQVMsT0FBZixNQUFBO0FBQ0EsSUFBTSxZQUFBLFFBQUEsU0FBQSxHQUFZLE9BQWxCLFNBQUE7QUFDQSxJQUFNLFFBQUEsUUFBQSxLQUFBLEdBQVEsT0FBZCxLQUFBO0FBQ0EsSUFBTSxrQkFBQSxRQUFBLGVBQUEsR0FBa0IsT0FBeEIsZUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDVlAsSUFBQSxVQUFBLFFBQUEsUUFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sb0JBQU4sR0FBQTs7SUFFTSxXOzs7QUFDSixXQUFBLFFBQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxRQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxTQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRWIsVUFBQSxTQUFBLEdBQUEsRUFBQTtBQUZhLFdBQUEsS0FBQTtBQUdkOzs7O3dCQU1JLEcsRUFBSztBQUNSLFVBQUksU0FBUyxLQUFBLFNBQUEsQ0FBQSxPQUFBLENBQWIsR0FBYSxDQUFiO0FBQ0EsVUFBSSxTQUFKLGlCQUFBLEVBQWdDO0FBQzlCLGFBQUEsU0FBQSxDQUFBLEdBQUE7QUFDRDtBQUNELFdBQUEsSUFBQSxDQUFBLFVBQUE7QUFDRDs7O3dCQVZXO0FBQ1YsYUFBTyxLQUFQLFNBQUE7QUFDRDs7OztFQVJvQixTQUFBLE87O2tCQW1CUixJQUFBLFFBQUEsRTs7Ozs7Ozs7QUN2QmY7O0FBRU8sSUFBTSxjQUFBLFFBQUEsV0FBQSxHQUFjLEtBQXBCLFdBQUE7QUFDQSxJQUFNLFlBQUEsUUFBQSxTQUFBLEdBQVksS0FBbEIsU0FBQTtBQUNBLElBQU0sU0FBQSxRQUFBLE1BQUEsR0FBUyxLQUFmLE1BQUE7QUFDQSxJQUFNLFlBQUEsUUFBQSxTQUFBLEdBQVksS0FBQSxNQUFBLENBQWxCLFNBQUE7QUFDQSxJQUFNLFNBQUEsUUFBQSxNQUFBLEdBQVMsS0FBZixNQUFBO0FBQ0EsSUFBTSxPQUFBLFFBQUEsSUFBQSxHQUFPLEtBQWIsSUFBQTtBQUNBLElBQU0sWUFBQSxRQUFBLFNBQUEsR0FBWSxLQUFsQixTQUFBOztBQUVBLElBQU0sV0FBQSxRQUFBLFFBQUEsR0FBVyxLQUFqQixRQUFBO0FBQ0EsSUFBTSxjQUFBLFFBQUEsV0FBQSxHQUFjLEtBQXBCLFdBQUE7QUFDQSxJQUFNLFVBQUEsUUFBQSxPQUFBLEdBQVUsS0FBaEIsT0FBQTtBQUNBLElBQU0sUUFBQSxRQUFBLEtBQUEsR0FBUSxLQUFkLEtBQUE7QUFDQSxJQUFNLGtCQUFBLFFBQUEsZUFBQSxHQUFrQixLQUF4QixlQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNkUCxJQUFBLFFBQUEsUUFBQSxRQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sUTs7Ozs7Ozs7Ozs7NkJBQ00sQ0FBRTs7OzhCQUVELENBQUU7Ozt5QkFFUCxLLEVBQU8sQ0FBRTs7OztFQUxHLE1BQUEsT0FBQSxDQUFRLEs7O2tCQVFiLEs7Ozs7Ozs7OztBQ1ZmLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7QUFFQSxJQUFNLFVBQVU7QUFDZCxNQUFBLFlBQUEsR0FBb0I7QUFDbEIsV0FBTyxNQUFBLFNBQUEsQ0FBUCwyQkFBTyxDQUFQO0FBRlksR0FBQTtBQUlkLE1BQUEsWUFBQSxHQUFvQjtBQUNsQixXQUFPLE1BQUEsU0FBQSxDQUFQLDRCQUFPLENBQVA7QUFMWSxHQUFBOztBQVFkLE1BQUEsR0FBQSxHQUFXO0FBQ1QsV0FBTyxRQUFBLFlBQUEsQ0FBQSxRQUFBLENBQVAsV0FBTyxDQUFQO0FBVFksR0FBQTtBQVdkLE1BQUEsS0FBQSxHQUFhO0FBQ1gsV0FBTyxRQUFBLFlBQUEsQ0FBQSxRQUFBLENBQVAsV0FBTyxDQUFQO0FBWlksR0FBQTtBQWNkLE1BQUEsTUFBQSxHQUFjO0FBQ1osV0FBTyxRQUFBLFlBQUEsQ0FBQSxRQUFBLENBQVAsZ0JBQU8sQ0FBUDtBQWZZLEdBQUE7O0FBa0JkLE1BQUEsSUFBQSxHQUFZO0FBQ1YsV0FBTyxRQUFBLFlBQUEsQ0FBQSxRQUFBLENBQVAsVUFBTyxDQUFQO0FBbkJZLEdBQUE7QUFxQmQsTUFBQSxTQUFBLEdBQWlCO0FBQ2YsV0FBTyxRQUFBLFlBQUEsQ0FBQSxRQUFBLENBQVAsZ0JBQU8sQ0FBUDtBQXRCWSxHQUFBO0FBd0JkLE1BQUEsSUFBQSxHQUFZO0FBQ1YsV0FBTyxRQUFBLFlBQUEsQ0FBQSxRQUFBLENBQVAsVUFBTyxDQUFQO0FBekJZLEdBQUE7QUEyQmQsTUFBQSxJQUFBLEdBQVk7QUFDVixXQUFPLFFBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBUCxVQUFPLENBQVA7QUE1QlksR0FBQTs7QUErQmQsTUFBQSxRQUFBLEdBQWdCO0FBQ2QsV0FBTyxRQUFBLFlBQUEsQ0FBQSxRQUFBLENBQVAsY0FBTyxDQUFQO0FBaENZLEdBQUE7QUFrQ2QsTUFBQSxJQUFBLEdBQVk7QUFDVixXQUFPLFFBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBUCxnQkFBTyxDQUFQO0FBbkNZLEdBQUE7QUFxQ2QsTUFBQSxLQUFBLEdBQWE7QUFDWCxXQUFPLFFBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBUCxXQUFPLENBQVA7QUF0Q1ksR0FBQTtBQXdDZCxNQUFBLGNBQUEsR0FBc0I7QUFDcEIsV0FBTyxRQUFBLFlBQUEsQ0FBQSxRQUFBLENBQVAsc0JBQU8sQ0FBUDtBQXpDWSxHQUFBO0FBMkNkLE1BQUEsTUFBQSxHQUFjO0FBQ1osV0FBTyxNQUFBLFNBQUEsQ0FBQSxzQkFBQSxFQUFQLE9BQUE7QUE1Q1ksR0FBQTs7QUErQ2QsTUFBQSxJQUFBLEdBQVk7QUFDVixXQUFPLFFBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBUCxVQUFPLENBQVA7QUFDRDtBQWpEYSxDQUFoQjs7a0JBb0RlLE87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0RGYsSUFBTSxVQUFVLE1BQU0sS0FBdEIsRUFBQTs7SUFFTSxTO0FBQ0osV0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBbUI7QUFBQSxvQkFBQSxJQUFBLEVBQUEsTUFBQTs7QUFDakIsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUE7QUFDRDs7Ozs0QkFZUTtBQUNQLGFBQU8sSUFBQSxNQUFBLENBQVcsS0FBWCxDQUFBLEVBQW1CLEtBQTFCLENBQU8sQ0FBUDtBQUNEOzs7d0JBRUksQyxFQUFHO0FBQ04sV0FBQSxDQUFBLElBQVUsRUFBVixDQUFBO0FBQ0EsV0FBQSxDQUFBLElBQVUsRUFBVixDQUFBO0FBQ0EsYUFBQSxJQUFBO0FBQ0Q7Ozt3QkFFSSxDLEVBQUc7QUFDTixXQUFBLENBQUEsSUFBVSxFQUFWLENBQUE7QUFDQSxXQUFBLENBQUEsSUFBVSxFQUFWLENBQUE7QUFDQSxhQUFBLElBQUE7QUFDRDs7OzZCQUVTO0FBQ1IsYUFBTyxLQUFBLGNBQUEsQ0FBb0IsQ0FBM0IsQ0FBTyxDQUFQO0FBQ0Q7OzttQ0FFZSxDLEVBQUc7QUFDakIsV0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLElBQUE7QUFDRDs7O2lDQUVhLEMsRUFBRztBQUNmLFVBQUksTUFBSixDQUFBLEVBQWE7QUFDWCxhQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQTtBQUZGLE9BQUEsTUFHTztBQUNMLGVBQU8sS0FBQSxjQUFBLENBQW9CLElBQTNCLENBQU8sQ0FBUDtBQUNEO0FBQ0QsYUFBQSxJQUFBO0FBQ0Q7Ozt3QkFFSSxDLEVBQUc7QUFDTixhQUFPLEtBQUEsQ0FBQSxHQUFTLEVBQVQsQ0FBQSxHQUFlLEtBQUEsQ0FBQSxHQUFTLEVBQS9CLENBQUE7QUFDRDs7OytCQU1XO0FBQ1YsYUFBTyxLQUFBLENBQUEsR0FBUyxLQUFULENBQUEsR0FBa0IsS0FBQSxDQUFBLEdBQVMsS0FBbEMsQ0FBQTtBQUNEOzs7Z0NBRVk7QUFDWCxhQUFPLEtBQUEsWUFBQSxDQUFrQixLQUF6QixNQUFPLENBQVA7QUFDRDs7OytCQUVXLEMsRUFBRztBQUNiLGFBQU8sS0FBQSxJQUFBLENBQVUsS0FBQSxZQUFBLENBQWpCLENBQWlCLENBQVYsQ0FBUDtBQUNEOzs7aUNBRWEsQyxFQUFHO0FBQ2YsVUFBSSxLQUFLLEtBQUEsQ0FBQSxHQUFTLEVBQWxCLENBQUE7QUFDQSxVQUFJLEtBQUssS0FBQSxDQUFBLEdBQVMsRUFBbEIsQ0FBQTtBQUNBLGFBQU8sS0FBQSxFQUFBLEdBQVUsS0FBakIsRUFBQTtBQUNEOzs7d0JBRUksQyxFQUFHLEMsRUFBRztBQUNULFdBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBO0FBQ0Q7Ozt5QkFFSyxDLEVBQUc7QUFDUCxXQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBO0FBQ0Q7Ozt5QkFFSyxDLEVBQUc7QUFDUCxXQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBO0FBQ0Q7Ozs4QkFFVSxDLEVBQUc7QUFDWixVQUFJLFlBQVksS0FBaEIsTUFBQTtBQUNBLFVBQUksY0FBQSxDQUFBLElBQW1CLE1BQXZCLFNBQUEsRUFBd0M7QUFDdEMsYUFBQSxjQUFBLENBQW9CLElBQXBCLFNBQUE7QUFDRDtBQUNELGFBQUEsSUFBQTtBQUNEOzs7eUJBRUssQyxFQUFHLEssRUFBTztBQUNkLFdBQUEsQ0FBQSxJQUFVLENBQUMsRUFBQSxDQUFBLEdBQU0sS0FBUCxDQUFBLElBQVYsS0FBQTtBQUNBLFdBQUEsQ0FBQSxJQUFVLENBQUMsRUFBQSxDQUFBLEdBQU0sS0FBUCxDQUFBLElBQVYsS0FBQTtBQUNBLGFBQUEsSUFBQTtBQUNEOzs7MkJBVU8sQyxFQUFHO0FBQ1QsYUFBTyxLQUFBLENBQUEsS0FBVyxFQUFYLENBQUEsSUFBa0IsS0FBQSxDQUFBLEtBQVcsRUFBcEMsQ0FBQTtBQUNEOzs7MkJBRU8sSyxFQUFPO0FBQ2IsVUFBSSxRQUFRLEtBQVosQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFTLEtBQUEsQ0FBQSxHQUFTLEtBQUEsR0FBQSxDQUFULEtBQVMsQ0FBVCxHQUEyQixLQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBN0MsS0FBNkMsQ0FBN0M7QUFDQSxXQUFBLENBQUEsR0FBUyxRQUFRLEtBQUEsR0FBQSxDQUFSLEtBQVEsQ0FBUixHQUEwQixLQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBNUMsS0FBNEMsQ0FBNUM7QUFDQSxhQUFBLElBQUE7QUFDRDs7O3dCQXJFYTtBQUNaLGFBQU8sS0FBQSxJQUFBLENBQVUsS0FBQSxDQUFBLEdBQVMsS0FBVCxDQUFBLEdBQWtCLEtBQUEsQ0FBQSxHQUFTLEtBQTVDLENBQU8sQ0FBUDtBQUNEOzs7d0JBa0RVO0FBQ1QsYUFBTyxLQUFBLEtBQUEsQ0FBVyxLQUFYLENBQUEsRUFBbUIsS0FBMUIsQ0FBTyxDQUFQO0FBQ0Q7Ozt3QkFFVTtBQUNULGFBQU8sS0FBQSxHQUFBLEdBQVAsT0FBQTtBQUNEOzs7OEJBNUdpQixDLEVBQUc7QUFDbkIsYUFBTyxJQUFBLE1BQUEsQ0FBVyxFQUFYLENBQUEsRUFBZ0IsRUFBdkIsQ0FBTyxDQUFQO0FBQ0Q7OztrQ0FFcUIsRyxFQUFLLE0sRUFBUTtBQUNqQyxVQUFJLElBQUksU0FBUyxLQUFBLEdBQUEsQ0FBakIsR0FBaUIsQ0FBakI7QUFDQSxVQUFJLElBQUksU0FBUyxLQUFBLEdBQUEsQ0FBakIsR0FBaUIsQ0FBakI7QUFDQSxhQUFPLElBQUEsTUFBQSxDQUFBLENBQUEsRUFBUCxDQUFPLENBQVA7QUFDRDs7Ozs7O2tCQWtIWSxNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDbElULHFCOzs7Ozs7O21DQUNZLFcsRUFBYTtBQUMzQixXQUFBLFdBQUEsR0FBQSxXQUFBO0FBQ0Q7Ozt1QkFFRyxTLEVBQVcsTyxFQUFTO0FBQ3RCLFdBQUEsV0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsT0FBQTtBQUNEOzs7d0JBRUksUyxFQUFXLE8sRUFBUztBQUN2QixXQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxFQUFBLE9BQUE7QUFDRDs7O3lCQUVLLFMsRUFBb0I7QUFBQSxVQUFBLFlBQUE7O0FBQUEsV0FBQSxJQUFBLE9BQUEsVUFBQSxNQUFBLEVBQU4sT0FBTSxNQUFBLE9BQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsQ0FBQSxFQUFBLE9BQUEsSUFBQSxFQUFBLE1BQUEsRUFBQTtBQUFOLGFBQU0sT0FBQSxDQUFOLElBQU0sVUFBQSxJQUFBLENBQU47QUFBTTs7QUFDeEIsT0FBQSxlQUFBLEtBQUEsV0FBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsU0FBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUE7QUFDRDs7Ozs7O2tCQUdZLElBQUEsa0JBQUEsRTs7Ozs7Ozs7UUNrQkMsZ0IsR0FBQSxnQjs7QUFwQ2hCLElBQUEsUUFBQSxRQUFBLGlCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLE9BQUEsUUFBQSxnQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxTQUFBLFFBQUEsa0JBQUEsQ0FBQTs7OztBQUNBLElBQUEsWUFBQSxRQUFBLHFCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFFBQUEsUUFBQSxpQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxTQUFBLFFBQUEsa0JBQUEsQ0FBQTs7OztBQUNBLElBQUEsVUFBQSxRQUFBLG1CQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSxzQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxRQUFBLFFBQUEsaUJBQUEsQ0FBQTs7OztBQUNBLElBQUEsUUFBQSxRQUFBLGlCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGlCQUFBLFFBQUEsMkJBQUEsQ0FBQTs7OztBQUNBLElBQUEsWUFBQSxRQUFBLDRCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGlCQUFBLFFBQUEsMEJBQUEsQ0FBQTs7OztBQUVBLElBQUEsUUFBQSxRQUFBLDJCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFVBQUEsUUFBQSw2QkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxXQUFBLFFBQUEsOEJBQUEsQ0FBQTs7Ozs7Ozs7QUFFQTtBQUNBLElBQU0sY0FBYyxDQUNsQixNQURrQixPQUFBLEVBQ2IsUUFEYSxPQUFBLEVBQ04sU0FEZCxPQUFvQixDQUFwQjtBQUdBO0FBQ0EsSUFBTSxZQUFZO0FBQ2hCO0FBQ0EsT0FGZ0IsT0FBQSxFQUVWLFlBRlUsT0FBQSxFQUVDLE9BRkQsT0FBQSxFQUVPLE9BRnpCLE9BQWtCLENBQWxCO0FBSUE7QUFDQSxJQUFNLGFBQWEsQ0FDakIsV0FEaUIsT0FBQSxFQUNQLE9BRE8sT0FBQSxFQUNELFFBREMsT0FBQSxFQUNNLGdCQUROLE9BQUEsRUFDc0IsV0FEdEIsT0FBQSxFQUNnQyxnQkFEbkQsT0FBbUIsQ0FBbkI7QUFHQTtBQUNBLElBQU0sWUFBWSxDQUNoQixPQURnQixPQUFBLEVBQ1YsU0FEVSxPQUFBLEVBQ0YsVUFEaEIsT0FBa0IsQ0FBbEI7O0FBSU8sU0FBQSxnQkFBQSxDQUFBLE1BQUEsRUFBQSxNQUFBLEVBQTJDO0FBQ2hELE1BQUksUUFBQSxLQUFKLENBQUE7QUFDQSxXQUFTLFNBQUEsTUFBQSxFQUFULEVBQVMsQ0FBVDtBQUNBLE1BQUksQ0FBQyxTQUFELE1BQUEsTUFBSixDQUFBLEVBQTZCO0FBQzNCO0FBQ0EsWUFBQSxXQUFBO0FBRkYsR0FBQSxNQUdPLElBQUksQ0FBQyxTQUFELE1BQUEsTUFBSixDQUFBLEVBQTZCO0FBQ2xDLFlBQUEsU0FBQTtBQUNBLGNBQUEsTUFBQTtBQUZLLEdBQUEsTUFHQSxJQUFJLENBQUMsU0FBRCxNQUFBLE1BQUEsQ0FBQSxLQUFKLENBQUEsRUFBbUM7QUFDeEMsWUFBQSxVQUFBO0FBQ0EsY0FBQSxNQUFBO0FBRkssR0FBQSxNQUdBO0FBQ0wsWUFBQSxTQUFBO0FBQ0EsY0FBQSxNQUFBO0FBQ0Q7QUFDRCxTQUFPLElBQUksTUFBSixNQUFJLENBQUosQ0FBUCxNQUFPLENBQVA7QUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckRELElBQUEsV0FBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxNOzs7QUFDSixXQUFBLEdBQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxHQUFBOztBQUNiO0FBRGEsV0FBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxJQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUVQLFVBQUEsT0FBQSxDQUZPLEdBQUEsQ0FBQSxDQUFBO0FBR2Q7Ozs7d0JBRVc7QUFBRSxhQUFPLFdBQVAsTUFBQTtBQUFlOzs7O0VBTmIsYUFBQSxPOztrQkFTSCxHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNkZixJQUFBLFdBQUEsUUFBQSxnQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxlQUFBLFFBQUEsY0FBQSxDQUFBOzs7O0FBQ0EsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7QUFFQSxJQUFBLFNBQUEsUUFBQSxtQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxRQUFBLFFBQUEsMkJBQUEsQ0FBQTs7OztBQUNBLElBQUEsVUFBQSxRQUFBLDZCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFVBQUEsUUFBQSw2QkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sY0FBTixDQUFBOztJQUVNLFM7OztBQUNKLFdBQUEsTUFBQSxHQUFzRDtBQUFBLFFBQUEsT0FBQSxVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBQUosRUFBSTtBQUFBLFFBQUEsYUFBQSxLQUF4QyxLQUF3QztBQUFBLFFBQXhDLFFBQXdDLGVBQUEsU0FBQSxHQUFoQyxDQUFnQyxHQUFBLFVBQUE7QUFBQSxRQUFBLGNBQUEsS0FBN0IsTUFBNkI7QUFBQSxRQUE3QixTQUE2QixnQkFBQSxTQUFBLEdBQXBCLENBQW9CLEdBQUEsV0FBQTtBQUFBLFFBQUEsYUFBQSxLQUFqQixLQUFpQjtBQUFBLFFBQWpCLFFBQWlCLGVBQUEsU0FBQSxHQUFULENBQVMsR0FBQSxVQUFBOztBQUFBLG9CQUFBLElBQUEsRUFBQSxNQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxPQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUM5QyxVQUFBLE9BQUEsQ0FEOEMsTUFBQSxDQUFBLENBQUE7O0FBR3BELFFBQUksUUFBSixPQUFBLEdBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLENBQ1MsSUFBSSxPQUFKLE9BQUEsQ0FBUyxDQUFBLEtBQUEsRUFEbEIsQ0FDa0IsQ0FBVCxDQURULEVBQUEsS0FBQSxDQUVTLElBQUksU0FBSixPQUFBLENBRlQsV0FFUyxDQUZULEVBQUEsS0FBQSxDQUdTLElBQUksU0FBSixPQUFBLENBQVcsQ0FBQSxNQUFBLEVBSHBCLEtBR29CLENBQVgsQ0FIVDs7QUFLQSxVQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQW1CLE1BQUEsVUFBQSxDQUFBLElBQUEsQ0FBbkIsS0FBbUIsQ0FBbkI7QUFDQSxVQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQWUsTUFBQSxLQUFBLENBQUEsSUFBQSxDQUFmLEtBQWUsQ0FBZjtBQVRvRCxXQUFBLEtBQUE7QUFVckQ7Ozs7OEJBSVU7QUFDVCxhQUFPO0FBQ0wsa0JBREssSUFBQTtBQUVMLHlCQUFpQjtBQUNmLG9CQURlLENBQUE7QUFFZixnQkFBTTtBQUZTO0FBRlosT0FBUDtBQU9EOzs7K0JBRVcsUSxFQUFVO0FBQ3BCLFVBQUksS0FBQSxLQUFBLEtBQUEsUUFBQSxJQUNGLEtBQUEsS0FBQSxLQUFlLFNBRGpCLEtBQUEsRUFDaUM7QUFDL0I7QUFDQTtBQUNEO0FBQ0QsVUFBSSxnQkFBZ0IsS0FBSyxXQUF6QixjQUFvQixDQUFwQjtBQUNBLG9CQUFBLE1BQUEsQ0FBQSxRQUFBO0FBQ0E7QUFDQSxXQUFBLEtBQUE7QUFDRDs7OzRCQUVRO0FBQ1AsV0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLElBQUE7QUFDRDs7OzZCQUVTLEssRUFBTztBQUNmLFdBQUEsS0FBQSxHQUFBLEtBQUE7QUFDRDs7OytCQUVXO0FBQ1YsYUFBQSxRQUFBO0FBQ0Q7OzswQkFFTTtBQUNMO0FBQ0Q7OztpQ0FFYSxNLEVBQVE7QUFDcEIsVUFBSSxjQUFjLEtBQUssV0FBdkIsWUFBa0IsQ0FBbEI7QUFDQSxVQUFBLFdBQUEsRUFBaUI7QUFDZixvQkFBQSxZQUFBLENBQUEsTUFBQTtBQUNBLGFBQUEsTUFBQSxDQUFZLE9BQVosR0FBQTtBQUNEO0FBQ0Y7Ozt3QkE5Q1c7QUFBRSxhQUFPLFdBQVAsS0FBQTtBQUFjOzs7O0VBYlQsYUFBQSxPOztrQkE4RE4sTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDekVmLElBQUEsV0FBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOztBQUVBLElBQUEsU0FBQSxRQUFBLG1CQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFFBQUEsUUFBQSwyQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxXQUFBLFFBQUEsOEJBQUEsQ0FBQTs7OztBQUNBLElBQUEsVUFBQSxRQUFBLDZCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFNBQUEsUUFBQSw0QkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxRQUFBLFFBQUEsMkJBQUEsQ0FBQTs7OztBQUNBLElBQUEsV0FBQSxRQUFBLDhCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFVBQUEsUUFBQSw2QkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxVQUFBLFFBQUEsNkJBQUEsQ0FBQTs7OztBQUNBLElBQUEsUUFBQSxRQUFBLDJCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFlBQUEsUUFBQSw0QkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVNLE07OztBQUNKLFdBQUEsR0FBQSxHQUFlO0FBQUEsb0JBQUEsSUFBQSxFQUFBLEdBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLElBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBQ1AsVUFBQSxPQUFBLENBRE8sSUFBQSxDQUFBLENBQUE7O0FBR2IsUUFBSSxRQUFRLElBQUksUUFBSixPQUFBLENBQVosQ0FBWSxDQUFaO0FBQ0EsUUFBSSxRQUFKLE9BQUEsR0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBLEtBQUEsQ0FDUyxJQUFJLE9BQUosT0FBQSxDQUFTLENBRGxCLENBQ2tCLENBQVQsQ0FEVCxFQUFBLEtBQUEsQ0FFUyxJQUFJLFVBRmIsT0FFUyxFQUZULEVBQUEsS0FBQSxDQUdTLElBQUksU0FBSixPQUFBLENBSFQsQ0FHUyxDQUhULEVBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLENBS1MsSUFBSSxPQUxiLE9BS1MsRUFMVCxFQUFBLEtBQUEsQ0FNUyxJQUFJLFNBTmIsT0FNUyxFQU5ULEVBQUEsS0FBQSxDQU9TLElBQUksVUFQYixPQU9TLEVBUFQsRUFBQSxLQUFBLENBUVMsSUFBSSxTQUFKLE9BQUEsQ0FSVCxFQVFTLENBUlQsRUFBQSxLQUFBLENBU1MsSUFBSSxPQUFKLE9BQUEsQ0FUVCxFQVNTLENBVFQ7O0FBV0EsVUFBQSxJQUFBLENBQVcsSUFBSSxXQUFKLE9BQUEsQ0FBWCxDQUFXLENBQVgsRUFBQSxRQUFBO0FBZmEsV0FBQSxLQUFBO0FBZ0JkOzs7OzhCQUlVO0FBQ1QsYUFBTztBQUNMLHlCQUFpQjtBQUNmLG9CQURlLENBQUE7QUFFZixnQkFBTTtBQUZTO0FBRFosT0FBUDtBQU1EOzs7eUJBRUssSyxFQUFPO0FBQ1gsV0FBSyxXQUFMLFlBQUEsRUFBQSxJQUFBLENBQUEsS0FBQTtBQUNEOzs7K0JBRVc7QUFDVixhQUFBLEtBQUE7QUFDRDs7O3dCQWpCVztBQUFFLGFBQU8sV0FBUCxLQUFBO0FBQWM7Ozs7RUFuQlosYUFBQSxPOztrQkF1Q0gsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkRmLElBQUEsV0FBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxPOzs7QUFDSixXQUFBLElBQUEsQ0FBQSxHQUFBLEVBQWtCO0FBQUEsb0JBQUEsSUFBQSxFQUFBLElBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLEtBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBRVYsVUFBQSxPQUFBLENBRlUsSUFBQSxDQUFBLENBQUE7QUFDaEI7OztBQUdBLFVBQUEsR0FBQSxHQUFXLElBQVgsQ0FBVyxDQUFYO0FBQ0EsVUFBQSxVQUFBLEdBQWtCLElBQWxCLENBQWtCLENBQWxCOztBQUVBLFVBQUEsRUFBQSxDQUFBLFNBQUEsRUFBbUIsTUFBQSxVQUFBLENBQUEsSUFBQSxDQUFuQixLQUFtQixDQUFuQjtBQVBnQixXQUFBLEtBQUE7QUFRakI7Ozs7K0JBSVcsUSxFQUFVO0FBQ3BCLFVBQUksVUFBVSxTQUFTLFdBQXZCLGVBQWMsQ0FBZDtBQUNBLFVBQUEsT0FBQSxFQUFhO0FBQ1gsZ0JBQUEsSUFBQTtBQURGLE9BQUEsTUFFTztBQUNMLGlCQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQTtBQUNEO0FBQ0Y7O1NBRUEsV0FBQSxlOzRCQUFvQjtBQUNuQixXQUFBLEdBQUEsQ0FBUyxDQUFBLFNBQUEsRUFBWSxLQUFaLEdBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxDQUFULEVBQVMsQ0FBVDtBQUNBLFdBQUEsSUFBQSxDQUFBLEtBQUE7QUFDRDs7OytCQUVXO0FBQ1YsYUFBQSxNQUFBO0FBQ0Q7Ozt3QkFsQlc7QUFBRSxhQUFPLFdBQVAsSUFBQTtBQUFhOzs7O0VBWFYsYUFBQSxPOztrQkFnQ0osSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckNmLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7QUFDQSxJQUFBLFVBQUEsUUFBQSxlQUFBLENBQUE7O0FBQ0EsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7QUFDQSxJQUFBLFlBQUEsUUFBQSxpQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLFNBQUEsT0FBQSxHQUFvQjtBQUNsQixPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQWdCLEtBQWhCLE9BQUE7QUFDQSxNQUFJLEtBQUosSUFBQSxFQUFlO0FBQ2IsWUFBQSxJQUFBLENBQUEsS0FBQSxDQUFXLEtBQVgsSUFBQSxFQUFzQixLQUFBLE9BQUEsQ0FBdEIsQ0FBQSxFQUFzQyxLQUFBLE9BQUEsQ0FBdEMsQ0FBQTtBQUNEO0FBQ0Y7O0FBRUQsU0FBQSxVQUFBLEdBQXVCO0FBQ3JCLE1BQUksV0FBVyxLQUFmLFVBQUE7QUFDQSxPQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtBQUNBLE1BQUksS0FBSixJQUFBLEVBQWU7QUFDYixTQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFFBQUE7QUFDRDtBQUNGOztBQUVELFNBQUEsT0FBQSxHQUFvQjtBQUNsQixNQUFJLGNBQWMsS0FBSyxXQUF2QixZQUFrQixDQUFsQjtBQUNBLE1BQUksV0FBWSxlQUFlLFlBQUEsUUFBQSxLQUFoQixTQUFDLEdBQ1osWUFEVyxRQUFDLEdBQWhCLEdBQUE7QUFHQSxNQUFJLGNBQWUsZUFBZSxZQUFBLFdBQUEsS0FBaEIsU0FBQyxHQUNmLFlBRGMsV0FBQyxHQUFuQixJQUFBO0FBR0EsTUFBSSxPQUFPLEtBQUEsSUFBQSxHQUFZLEtBQVosSUFBQSxHQUFYLENBQUE7QUFDQSxTQUFPO0FBQ0wsY0FBVSxLQUFBLElBQUEsS0FBYyxXQURuQixJQUFBO0FBRUwsY0FGSyxRQUFBO0FBR0wsaUJBSEssV0FBQTtBQUlMLG9CQUpLLFFBQUE7QUFLTCxVQUFBO0FBTEssR0FBUDtBQU9EOztJQUVLLGE7OztBQUNKLFdBQUEsVUFBQSxHQUFzQjtBQUFBLFFBQUEsSUFBQTs7QUFBQSxvQkFBQSxJQUFBLEVBQUEsVUFBQTs7QUFBQSxTQUFBLElBQUEsT0FBQSxVQUFBLE1BQUEsRUFBTixPQUFNLE1BQUEsSUFBQSxDQUFBLEVBQUEsT0FBQSxDQUFBLEVBQUEsT0FBQSxJQUFBLEVBQUEsTUFBQSxFQUFBO0FBQU4sV0FBTSxJQUFOLElBQU0sVUFBQSxJQUFBLENBQU47QUFBTTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsT0FBQSxXQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFcEIsVUFBQSxPQUFBLEdBQWUsTUFGSyxLQUVwQixDQUZvQixDQUVNO0FBQzFCLFVBQUEsVUFBQSxHQUFrQixNQUhFLFFBR3BCLENBSG9CLENBR1k7QUFIWixXQUFBLEtBQUE7QUFJckI7Ozs7OEJBR1U7QUFDVCxhQUFBLEVBQUE7QUFDRDs7OzhCQUVVO0FBQ1QsVUFBSSxLQUFKLElBQUEsRUFBZTtBQUNiO0FBQ0Q7QUFDRCxVQUFJLE1BQU0sT0FBQSxNQUFBLENBQWMsUUFBQSxJQUFBLENBQWQsSUFBYyxDQUFkLEVBQWtDLEtBQTVDLE9BQTRDLEVBQWxDLENBQVY7QUFDQSxVQUFJLE9BQU8sUUFBQSxNQUFBLENBQUEsU0FBQSxDQUFpQixLQUFqQixDQUFBLEVBQXlCLEtBQXpCLENBQUEsRUFBaUMsS0FBakMsS0FBQSxFQUE2QyxLQUE3QyxNQUFBLEVBQVgsR0FBVyxDQUFYO0FBQ0E7QUFDQSxXQUFBLFFBQUEsR0FBZ0IsS0FBaEIsVUFBQTtBQUNBLFdBQUEsSUFBQSxHQUFBLElBQUE7QUFDRDs7OzJCQUVPLEcsRUFBb0I7QUFBQSxVQUFmLFFBQWUsVUFBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxHQUFQLEtBQU87O0FBQzFCLFdBQUEsUUFBQSxHQUFnQixRQUFRLEtBQUEsUUFBQSxHQUFSLEdBQUEsR0FBaEIsR0FBQTtBQUNBLFVBQUksS0FBSixJQUFBLEVBQWU7QUFDYixnQkFBQSxJQUFBLENBQUEsUUFBQSxDQUFjLEtBQWQsSUFBQSxFQUFBLEdBQUE7QUFDRDtBQUNGOzs7d0JBRUksRyxFQUFLO0FBQ1IsaUJBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBO0FBQ0Q7Ozt5QkFFSyxLLEVBQU8sQ0FBRTs7O3dCQTVCSDtBQUFFLGFBQU8sV0FBUCxNQUFBO0FBQWU7Ozs7RUFOTixNQUFBLE07O2tCQXFDVixVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzRWYsSUFBQSxXQUFBLFFBQUEsZ0JBQUEsQ0FBQTs7OztBQUNBLElBQUEsZUFBQSxRQUFBLGNBQUEsQ0FBQTs7OztBQUVBLElBQUEsYUFBQSxRQUFBLHFCQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVNLFE7OztBQUNKLFdBQUEsS0FBQSxHQUFlO0FBQUEsb0JBQUEsSUFBQSxFQUFBLEtBQUE7O0FBQ2I7QUFEYSxXQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLE1BQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBRVAsVUFBQSxPQUFBLENBRk8sS0FBQSxDQUFBLENBQUE7QUFHZDs7Ozt3QkFFVztBQUFFLGFBQU8sV0FBUCxNQUFBO0FBQWU7Ozs7RUFOWCxhQUFBLE87O2tCQVNMLEs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2RmLElBQUEsV0FBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxpQjs7O0FBQ0osV0FBQSxjQUFBLEdBQWU7QUFBQSxvQkFBQSxJQUFBLEVBQUEsY0FBQTs7QUFBQSxXQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLGVBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLGNBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBQ1AsVUFBQSxPQUFBLENBRE8sY0FBQSxDQUFBLENBQUE7QUFFZDs7OzsrQkFJVztBQUNWLGFBQUEsZ0JBQUE7QUFDRDs7O3dCQUpXO0FBQUUsYUFBTyxXQUFQLE1BQUE7QUFBZTs7OztFQUxGLGFBQUEsTzs7a0JBWWQsYzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakJmLElBQUEsV0FBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxTOzs7QUFDSixXQUFBLE1BQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxNQUFBOztBQUNiO0FBRGEsV0FBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxPQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUVQLFVBQUEsT0FBQSxDQUZPLE1BQUEsQ0FBQSxDQUFBO0FBR2Q7Ozs7K0JBSVc7QUFDVixhQUFBLFFBQUE7QUFDRDs7O3dCQUpXO0FBQUUsYUFBTyxXQUFQLE1BQUE7QUFBZTs7OztFQU5WLGFBQUEsTzs7a0JBYU4sTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbEJmLElBQUEsV0FBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxZOzs7QUFDSixXQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQXdCO0FBQUEsb0JBQUEsSUFBQSxFQUFBLFNBQUE7O0FBQUEsV0FBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxVQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUNoQixVQUFBLE9BQUEsQ0FEZ0IsU0FBQSxDQUFBLENBQUE7QUFFdkI7Ozs7d0JBRVc7QUFBRSxhQUFPLFdBQVAsSUFBQTtBQUFhOzs7O0VBTEwsYUFBQSxPOztrQkFRVCxTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNiZixJQUFBLFdBQUEsUUFBQSxnQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxlQUFBLFFBQUEsY0FBQSxDQUFBOzs7O0FBRUEsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sTzs7O0FBQ0osV0FBQSxJQUFBLENBQUEsU0FBQSxFQUF3QjtBQUFBLG9CQUFBLElBQUEsRUFBQSxJQUFBOztBQUN0QjtBQURzQixXQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLEtBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBRWhCLFVBQUEsT0FBQSxDQUZnQixJQUFBLENBQUEsQ0FBQTtBQUd2Qjs7Ozt3QkFFVztBQUFFLGFBQU8sV0FBUCxJQUFBO0FBQWE7Ozs7RUFOVixhQUFBLE87O2tCQVNKLEk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2RmLElBQUEsV0FBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFNBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxROzs7QUFDSixXQUFBLEtBQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxLQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxNQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUNQLFVBQUEsT0FBQSxDQURPLEtBQUEsQ0FBQSxDQUFBOztBQUdiLFFBQUksU0FBSixDQUFBOztBQUVBLFVBQUEsRUFBQSxDQUFBLE9BQUEsRUFBaUIsUUFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBakIsSUFBaUIsQ0FBakI7QUFDQSxVQUFBLEVBQUEsQ0FBQSxVQUFBLEVBQW9CLFFBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFwQixLQUFvQixDQUFwQjtBQU5hLFdBQUEsS0FBQTtBQU9kOzs7OytCQUlXO0FBQ1YsYUFBQSxPQUFBO0FBQ0Q7Ozt3QkFKVztBQUFFLGFBQU8sV0FBUCxNQUFBO0FBQWU7Ozs7RUFWWCxhQUFBLE87O2tCQWlCTCxLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZCZixJQUFBLFdBQUEsUUFBQSxnQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxlQUFBLFFBQUEsY0FBQSxDQUFBOzs7O0FBRUEsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7QUFDQSxJQUFBLFNBQUEsUUFBQSxjQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVNLE87QUFDSixXQUFBLElBQUEsQ0FBQSxJQUFBLEVBQXNDO0FBQUEsUUFBQSxRQUFBLGVBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtBQUFBLFFBQXhCLFNBQXdCLE1BQUEsQ0FBQSxDQUFBO0FBQUEsUUFBaEIsU0FBZ0IsTUFBQSxDQUFBLENBQUE7QUFBQSxRQUFSLFFBQVEsTUFBQSxDQUFBLENBQUE7O0FBQUEsb0JBQUEsSUFBQSxFQUFBLElBQUE7O0FBQ3BDLFNBQUEsSUFBQSxHQUFZLENBQUEsR0FBQSxPQUFBLGdCQUFBLEVBQUEsTUFBQSxFQUFaLE1BQVksQ0FBWjtBQUNBLFNBQUEsS0FBQSxHQUFBLEtBQUE7QUFDRDs7OzsrQkFFVztBQUNWLGFBQU8sQ0FBQyxLQUFBLElBQUEsQ0FBRCxRQUFDLEVBQUQsRUFBQSxHQUFBLEVBQTRCLEtBQTVCLEtBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxDQUFQLEVBQU8sQ0FBUDtBQUNEOzs7Ozs7SUFHRyxXOzs7QUFDSixXQUFBLFFBQUEsR0FBK0I7QUFBQSxRQUFsQixjQUFrQixVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBQUosRUFBSTs7QUFBQSxvQkFBQSxJQUFBLEVBQUEsUUFBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsU0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsUUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFFdkIsVUFBQSxPQUFBLENBRnVCLFFBQUEsQ0FBQSxDQUFBO0FBQzdCOzs7QUFHQSxVQUFBLFdBQUEsR0FBbUIsWUFBQSxHQUFBLENBQWdCLFVBQUEsUUFBQSxFQUFBO0FBQUEsYUFBWSxJQUFBLElBQUEsQ0FBWixRQUFZLENBQVo7QUFBbkMsS0FBbUIsQ0FBbkI7O0FBRUEsVUFBQSxFQUFBLENBQUEsU0FBQSxFQUFtQixNQUFBLFVBQUEsQ0FBQSxJQUFBLENBQW5CLEtBQW1CLENBQW5CO0FBTjZCLFdBQUEsS0FBQTtBQU85Qjs7Ozs4QkFJVTtBQUNULGFBQU87QUFDTCxrQkFESyxJQUFBO0FBRUwseUJBQWlCO0FBQ2Ysb0JBRGUsQ0FBQTtBQUVmLGdCQUFNO0FBRlM7QUFGWixPQUFQO0FBT0Q7OzsrQkFFVyxRLEVBQVU7QUFDcEIsVUFBSSxlQUFlLFNBQVMsV0FBNUIsYUFBbUIsQ0FBbkI7QUFDQSxVQUFJLENBQUosWUFBQSxFQUFtQjtBQUNqQixpQkFBQSxHQUFBLENBQUEsK0JBQUE7QUFDQTtBQUNEOztBQUVELFdBQUEsV0FBQSxDQUFBLE9BQUEsQ0FDRSxVQUFBLFFBQUEsRUFBQTtBQUFBLGVBQVksYUFBQSxJQUFBLENBQWtCLFNBQWxCLElBQUEsRUFBaUMsU0FBN0MsS0FBWSxDQUFaO0FBREYsT0FBQTtBQUVBLGVBQUEsR0FBQSxDQUFhLENBQUEsVUFBQSxFQUFhLEtBQWIsUUFBYSxFQUFiLEVBQUEsSUFBQSxDQUFiLEVBQWEsQ0FBYjs7QUFFQSxXQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsSUFBQTtBQUNEOzs7K0JBRVc7QUFDVixhQUFPLENBQUEsYUFBQSxFQUVMLEtBQUEsV0FBQSxDQUFBLElBQUEsQ0FGSyxJQUVMLENBRkssRUFBQSxHQUFBLEVBQUEsSUFBQSxDQUFQLEVBQU8sQ0FBUDtBQUtEOzs7d0JBaENXO0FBQUUsYUFBTyxXQUFQLEtBQUE7QUFBYzs7OztFQVZQLGFBQUEsTzs7a0JBNkNSLFE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlEZixJQUFBLFdBQUEsUUFBQSxnQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxlQUFBLFFBQUEsY0FBQSxDQUFBOzs7O0FBRUEsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sTzs7O0FBQ0osV0FBQSxJQUFBLEdBQWU7QUFBQSxvQkFBQSxJQUFBLEVBQUEsSUFBQTs7QUFBQSxXQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLEtBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBQ1AsVUFBQSxPQUFBLENBRE8sSUFBQSxDQUFBLENBQUE7QUFFZDs7Ozt3QkFFVztBQUFFLGFBQU8sV0FBUCxJQUFBO0FBQWE7Ozs7RUFMVixhQUFBLE87O2tCQVFKLEk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2JmLElBQUEsV0FBQSxRQUFBLGdCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGVBQUEsUUFBQSxjQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGFBQUEsUUFBQSxxQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxPOzs7QUFDSixXQUFBLElBQUEsQ0FBQSxTQUFBLEVBQXdCO0FBQUEsb0JBQUEsSUFBQSxFQUFBLElBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLEtBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBRWhCLFVBQUEsT0FBQSxDQUZnQixJQUFBLENBQUEsQ0FBQTtBQUN0Qjs7O0FBR0EsVUFBQSxFQUFBLENBQUEsU0FBQSxFQUFtQixNQUFBLFVBQUEsQ0FBQSxJQUFBLENBQW5CLEtBQW1CLENBQW5CO0FBSnNCLFdBQUEsS0FBQTtBQUt2Qjs7OzsrQkFJVyxRLEVBQVU7QUFDcEIsZUFBQSxJQUFBLENBQUEsU0FBQSxFQUFBLElBQUE7QUFDRDs7OytCQUVXO0FBQ1YsYUFBQSxNQUFBO0FBQ0Q7Ozt3QkFSVztBQUFFLGFBQU8sV0FBUCxJQUFBO0FBQWE7Ozs7RUFSVixhQUFBLE87O2tCQW1CSixJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4QmYsSUFBQSxXQUFBLFFBQUEsZ0JBQUEsQ0FBQTs7OztBQUNBLElBQUEsZUFBQSxRQUFBLGNBQUEsQ0FBQTs7OztBQUVBLElBQUEsYUFBQSxRQUFBLHFCQUFBLENBQUE7O0FBRUEsSUFBQSxTQUFBLFFBQUEsbUJBQUEsQ0FBQTs7OztBQUNBLElBQUEsU0FBQSxRQUFBLDRCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFFBQUEsUUFBQSwyQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxVQUFBLFFBQUEsNkJBQUEsQ0FBQTs7OztBQUNBLElBQUEsWUFBQSxRQUFBLDRCQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sZ0I7OztBQUNKLFdBQUEsYUFBQSxDQUFBLFNBQUEsRUFBd0I7QUFBQSxvQkFBQSxJQUFBLEVBQUEsYUFBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsY0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsYUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFFaEIsVUFBQSxPQUFBLENBRmdCLElBQUEsQ0FBQSxDQUFBO0FBQ3RCOzs7QUFHQSxRQUFJLFFBQVEsSUFBSSxRQUFKLE9BQUEsQ0FBWixDQUFZLENBQVo7QUFDQSxRQUFJLFFBQUosT0FBQSxHQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxDQUNTLElBQUksT0FEYixPQUNTLEVBRFQsRUFBQSxLQUFBLENBQUEsS0FBQSxFQUFBLEtBQUEsQ0FHUyxJQUFJLFNBQUosT0FBQSxDQUhULEVBR1MsQ0FIVDs7QUFLQSxVQUFBLElBQUEsQ0FBVyxJQUFJLFdBQUosT0FBQSxDQUFYLENBQVcsQ0FBWCxFQUFBLFFBQUE7O0FBRUEsVUFBQSxJQUFBLEdBQUEsQ0FBQTtBQUNBLFVBQUEsRUFBQSxDQUFBLFNBQUEsRUFBbUIsTUFBQSxVQUFBLENBQUEsSUFBQSxDQUFuQixLQUFtQixDQUFuQjtBQUNBLFVBQUEsRUFBQSxDQUFBLEtBQUEsRUFBZSxNQUFBLEtBQUEsQ0FBQSxJQUFBLENBQWYsS0FBZSxDQUFmO0FBZHNCLFdBQUEsS0FBQTtBQWV2Qjs7Ozs4QkFJVTtBQUNULGFBQU87QUFDTCxrQkFBVTtBQURMLE9BQVA7QUFHRDs7OytCQUVXLFEsRUFBVTtBQUNwQixlQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQTtBQUNEOzs7NEJBRVE7QUFDUCxXQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsSUFBQTtBQUNEOzs7eUJBRUssSyxFQUFPO0FBQ1gsV0FBQSxJQUFBO0FBQ0EsVUFBSSxLQUFBLElBQUEsR0FBQSxFQUFBLEtBQUosQ0FBQSxFQUEwQjtBQUN4QjtBQUNEO0FBQ0QsV0FBQSxJQUFBLEdBQUEsQ0FBQTtBQUNBLFdBQUEsTUFBQSxDQUFZLEtBQUEsRUFBQSxHQUFaLEVBQUEsRUFBQSxJQUFBOztBQUVBLFVBQUksTUFBTSxLQUFWLFFBQUE7QUFDQSxXQUFLLFdBQUwsWUFBQSxFQUFBLElBQUEsQ0FBQSxHQUFBO0FBQ0EsV0FBSyxXQUFMLFlBQUEsRUFBQSxJQUFBLENBQXdCLE1BQU0sS0FBQSxFQUFBLEdBQTlCLENBQUE7QUFDQSxXQUFLLFdBQUwsWUFBQSxFQUFBLElBQUEsQ0FBd0IsTUFBTSxLQUE5QixFQUFBO0FBQ0EsV0FBSyxXQUFMLFlBQUEsRUFBQSxJQUFBLENBQXdCLE1BQU0sS0FBQSxFQUFBLEdBQUEsQ0FBQSxHQUE5QixDQUFBO0FBQ0Q7OzsrQkFFVztBQUNWLGFBQUEsZUFBQTtBQUNEOzs7d0JBakNXO0FBQUUsYUFBTyxXQUFQLElBQUE7QUFBYTs7OztFQWxCRCxhQUFBLE87O2tCQXNEYixhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakVmLElBQU0sT0FBTyxPQUFiLFNBQWEsQ0FBYjs7SUFFTSxVOzs7Ozs7O3VDQUdnQixLLEVBQU87QUFDekIsYUFBTyxNQUFBLFNBQUEsQ0FBZ0IsS0FBdkIsSUFBTyxDQUFQO0FBQ0Q7O0FBRUQ7Ozs7aUNBQ2MsSyxFQUFPLFUsRUFBWTtBQUMvQixVQUFJLGFBQWEsS0FBQSxrQkFBQSxDQUFqQixLQUFpQixDQUFqQjtBQUNBLGFBQU8sQ0FBQSxVQUFBLElBQWUsV0FBQSxRQUFBLENBQXRCLFVBQXNCLENBQXRCO0FBQ0Q7O0FBRUQ7Ozs7NkJBQ1UsSyxFQUFPO0FBQ2YsYUFBQSxJQUFBO0FBQ0Q7O0FBRUQ7Ozs7NEJBQ1MsSyxFQUFPO0FBQ2QsVUFBSSxhQUFhLEtBQUEsa0JBQUEsQ0FBakIsS0FBaUIsQ0FBakI7QUFDQSxVQUFBLFVBQUEsRUFBZ0I7QUFDZDtBQUNBLG1CQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQTtBQUNEO0FBQ0QsWUFBQSxTQUFBLENBQWdCLEtBQWhCLElBQUEsSUFBQSxJQUFBO0FBQ0Q7OzsrQkFFVyxLLEVBQU8sSyxFQUFPLENBQUU7OzsyQkFFcEIsSyxFQUFPO0FBQ2IsYUFBTyxNQUFBLFNBQUEsQ0FBZ0IsS0FBdkIsSUFBTyxDQUFQO0FBQ0Q7OzsrQkFFVztBQUNWLGFBQUEsdUJBQUE7QUFDRDs7O2dDQUVZO0FBQ1gsYUFBQSxFQUFBO0FBQ0Q7Ozt3QkF2Q1c7QUFBRSxhQUFBLElBQUE7QUFBYTs7Ozs7O2tCQTBDZCxPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN0NmLElBQUEsWUFBQSxRQUFBLFdBQUEsQ0FBQTs7OztBQUNBLElBQUEsU0FBQSxRQUFBLGlCQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSx3QkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxTOzs7QUFDSixXQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQW9CO0FBQUEsb0JBQUEsSUFBQSxFQUFBLE1BQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLE9BQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFbEIsVUFBQSxNQUFBLEdBQUEsS0FBQTtBQUZrQixXQUFBLEtBQUE7QUFHbkI7Ozs7NkJBSVMsSyxFQUFPO0FBQ2Y7QUFDQSxhQUFPLEtBQUEsTUFBQSxJQUFlLE1BQXRCLE1BQUE7QUFDRDs7QUFFRDs7Ozs0QkFDUyxLLEVBQU87QUFBQSxVQUFBLFNBQUEsSUFBQTs7QUFDZCxXQUFBLE9BQUEsU0FBQSxDQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxPQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBO0FBQ0EsVUFBSSxNQUFKLE1BQUEsRUFBa0I7QUFDaEIsYUFBQSxLQUFBLENBQUEsS0FBQSxFQUFrQixNQUFsQixNQUFBO0FBREYsT0FBQSxNQUVPO0FBQ0wsY0FBQSxJQUFBLENBQUEsT0FBQSxFQUFvQixVQUFBLFNBQUEsRUFBQTtBQUFBLGlCQUFhLE9BQUEsS0FBQSxDQUFBLEtBQUEsRUFBYixTQUFhLENBQWI7QUFBcEIsU0FBQTtBQUNEO0FBQ0Y7OzsrQkFFVyxLLEVBQU8sSyxFQUFPO0FBQ3hCLFdBQUEsTUFBQSxDQUFBLEtBQUE7QUFDRDs7OzBCQUVNLEssRUFBTyxTLEVBQVc7QUFDdkIsY0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBcUIsS0FBckIsTUFBQTtBQUNBO0FBQ0EsWUFBQSxPQUFBLEdBQWdCLEtBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQWhCLEtBQWdCLENBQWhCO0FBQ0EsWUFBQSxJQUFBLENBQUEsU0FBQSxFQUFzQixNQUF0QixPQUFBO0FBQ0Q7Ozs4QkFFVSxLLEVBQU87QUFBQSxVQUFBLFNBQUEsSUFBQTs7QUFDaEIsV0FBQSxNQUFBLENBQUEsS0FBQTtBQUNBO0FBQ0EsWUFBQSxJQUFBLENBQUEsT0FBQSxFQUFvQixVQUFBLFNBQUEsRUFBQTtBQUFBLGVBQWEsT0FBQSxLQUFBLENBQUEsS0FBQSxFQUFiLFNBQWEsQ0FBYjtBQUFwQixPQUFBO0FBQ0Q7OzsyQkFFTyxLLEVBQU87QUFDYixjQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsS0FBQTtBQUNBO0FBQ0EsWUFBQSxHQUFBLENBQUEsU0FBQSxFQUFxQixNQUFyQixPQUFBO0FBQ0EsYUFBTyxNQUFQLE9BQUE7QUFDRDs7OytCQUVXO0FBQ1YsYUFBTyxpQkFBaUIsS0FBeEIsTUFBQTtBQUNEOzs7d0JBM0NXO0FBQUUsYUFBTyxXQUFQLGNBQUE7QUFBdUI7Ozs7RUFObEIsVUFBQSxPOztrQkFvRE4sTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3hEZixJQUFBLFlBQUEsUUFBQSxXQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSx3QkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxTQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxFQUFnQztBQUM5QixTQUFPO0FBQ0wsV0FESyxLQUFBO0FBRUwsV0FGSyxLQUFBO0FBQUEsY0FBQSxTQUFBLFFBQUEsR0FHTztBQUNWLGFBQU8sQ0FBQyxNQUFELFFBQUMsRUFBRCxFQUFBLEdBQUEsRUFBd0IsS0FBeEIsS0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLENBQVAsRUFBTyxDQUFQO0FBQ0Q7QUFMSSxHQUFQO0FBT0Q7O0lBRUssUTs7O0FBQ0osV0FBQSxLQUFBLENBQUEsU0FBQSxFQUF3QjtBQUFBLG9CQUFBLElBQUEsRUFBQSxLQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxNQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRXRCLFVBQUEsT0FBQSxHQUFBLENBQUE7QUFDQSxVQUFBLElBQUEsR0FBWSxNQUFBLFNBQUEsRUFBWixJQUFZLEVBQVo7QUFIc0IsV0FBQSxLQUFBO0FBSXZCOzs7OzRCQUlRLEssRUFBTztBQUNkLFdBQUEsTUFBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDQSxXQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsWUFBTSxXQUFOLGFBQUEsSUFBQSxJQUFBO0FBQ0Q7O0FBRUQ7Ozs7eUJBQ00sSyxFQUF5QjtBQUFBLFVBQUEsU0FBQSxJQUFBOztBQUFBLFVBQWxCLFFBQWtCLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FBVixRQUFVOztBQUM3QixVQUFJLFFBQVEsS0FBWixLQUFBO0FBQ0EsVUFBSSxpQkFBaUIsVUFBakIsT0FBQSxJQUE0QixNQUFNLFdBQXRDLGFBQWdDLENBQWhDLEVBQXNEO0FBQ3BEO0FBQ0EsY0FBTSxXQUFOLGFBQUEsRUFBQSxLQUFBLENBQUEsS0FBQTtBQUNBO0FBQ0Q7QUFDRCxVQUFJLE1BQU0sTUFBVixRQUFVLEVBQVY7QUFDQSxVQUFJLGlCQUFBLEtBQUosQ0FBQTtBQUNBLFVBQUksUUFBUSxLQUFBLElBQUEsQ0FBQSxJQUFBLENBQWUsVUFBQSxJQUFBLEVBQUEsRUFBQSxFQUFjO0FBQ3ZDO0FBQ0EsWUFBSSxTQUFBLFNBQUEsSUFBc0IsbUJBQTFCLFNBQUEsRUFBd0Q7QUFDdEQsMkJBQUEsRUFBQTtBQUNEO0FBQ0Q7QUFDQSxZQUFJLFFBQVEsS0FBQSxLQUFBLENBQUEsUUFBQSxPQUFSLEdBQUEsSUFDRixNQUFBLEtBQUEsR0FBYyxLQUFBLEtBQUEsQ0FEaEIsS0FBQSxFQUNrQztBQUNoQyxpQkFBQSxJQUFBLENBQUEsRUFBQSxJQUFnQixRQUFBLEtBQUEsRUFBaEIsS0FBZ0IsQ0FBaEI7QUFDQSxpQkFBQSxJQUFBO0FBQ0Q7QUFDRCxlQUFBLEtBQUE7QUFYRixPQUFZLENBQVo7QUFhQSxVQUFJLENBQUosS0FBQSxFQUFZO0FBQ1YsWUFBSSxtQkFBSixTQUFBLEVBQWtDO0FBQ2hDO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLGtDQUFBO0FBQ0E7QUFDRDtBQUNEO0FBQ0EsYUFBQSxJQUFBLENBQUEsY0FBQSxJQUE0QixRQUFBLEtBQUEsRUFBNUIsS0FBNEIsQ0FBNUI7QUFDRDtBQUNELFlBQUEsSUFBQSxDQUFBLG9CQUFBLEVBQUEsS0FBQTtBQUNEOzs7Z0NBRVksTyxFQUFTO0FBQ3BCLFVBQUksS0FBQSxLQUFKLENBQUE7QUFDQTtBQUNBLFVBQUksUUFBUSxLQUFBLElBQUEsQ0FBQSxJQUFBLENBQWUsVUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFhO0FBQ3RDLGFBQUEsQ0FBQTtBQUNBLGVBQU8sY0FBUCxDQUFBO0FBRkYsT0FBWSxDQUFaO0FBSUEsVUFBSSxRQUFBLEtBQUosQ0FBQTtBQUNBLFVBQUEsS0FBQSxFQUFXO0FBQ1QsZ0JBQVEsS0FBQSxJQUFBLENBQVIsRUFBUSxDQUFSO0FBQ0EsZ0JBQVEsTUFBUixLQUFBO0FBQ0E7QUFDQSxZQUFJLEVBQUUsTUFBRixLQUFBLEtBQUosQ0FBQSxFQUF5QjtBQUN2QixlQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsU0FBQTtBQUNEO0FBQ0QsYUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLG9CQUFBLEVBQUEsS0FBQTtBQUNEO0FBQ0QsYUFBQSxLQUFBO0FBQ0Q7OztpQ0FFYTtBQUNaLFVBQUksUUFBUSxLQUFBLElBQUEsQ0FBVSxLQUF0QixPQUFZLENBQVo7QUFDQSxVQUFJLFFBQUEsS0FBSixDQUFBO0FBQ0EsVUFBQSxLQUFBLEVBQVc7QUFDVCxnQkFBUSxNQUFSLEtBQUE7QUFDQTtBQUNBLFlBQUksRUFBRSxNQUFGLEtBQUEsS0FBSixDQUFBLEVBQXlCO0FBQ3ZCLGVBQUEsSUFBQSxDQUFVLEtBQVYsT0FBQSxJQUFBLFNBQUE7QUFDRDtBQUNELGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxvQkFBQSxFQUFBLEtBQUE7QUFDRDtBQUNELGFBQUEsS0FBQTtBQUNEOzs7K0JBRVcsTyxFQUFTO0FBQ25CLFdBQUEsT0FBQSxHQUFBLE9BQUE7QUFDRDs7OytCQUVXO0FBQ1YsYUFBTyxDQUFBLFNBQUEsRUFBWSxLQUFBLElBQUEsQ0FBQSxJQUFBLENBQVosSUFBWSxDQUFaLEVBQUEsSUFBQSxDQUFQLEVBQU8sQ0FBUDtBQUNEOztBQUVEOzs7O2dDQUNhO0FBQ1gsYUFBTyxLQUFQLElBQUE7QUFDRDs7O3dCQXhGVztBQUFFLGFBQU8sV0FBUCxhQUFBO0FBQXNCOzs7O0VBUGxCLFVBQUEsTzs7a0JBa0dMLEs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9HZixJQUFBLFlBQUEsUUFBQSxXQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSx3QkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxTOzs7QUFDSixXQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQXlDO0FBQUEsUUFBQSxRQUFBLGVBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtBQUFBLFFBQUEsU0FBQSxNQUFBLENBQUEsQ0FBQTtBQUFBLFFBQTNCLFNBQTJCLFdBQUEsU0FBQSxHQUFsQixDQUFrQixHQUFBLE1BQUE7QUFBQSxRQUFBLFVBQUEsTUFBQSxDQUFBLENBQUE7QUFBQSxRQUFmLFFBQWUsWUFBQSxTQUFBLEdBQVAsSUFBTyxHQUFBLE9BQUE7O0FBQUEsb0JBQUEsSUFBQSxFQUFBLE1BQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLE9BQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFdkMsVUFBQSxNQUFBLEdBQUEsTUFBQTtBQUNBLFVBQUEsS0FBQSxHQUFBLEtBQUE7QUFIdUMsV0FBQSxLQUFBO0FBSXhDOzs7OzRCQUlRLEssRUFBTztBQUNkLFdBQUEsT0FBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLE9BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDQSxXQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsWUFBTSxXQUFOLGNBQUEsSUFBQSxJQUFBO0FBQ0Q7OzsyQkFFTyxLLEVBQU87QUFDYixVQUFJLGdCQUFnQixNQUFNLFdBQTFCLGNBQW9CLENBQXBCO0FBQ0E7QUFDQSxVQUFBLGFBQUEsRUFBbUI7QUFDakIsc0JBQUEsT0FBQSxDQUFzQixLQUF0QixLQUFBO0FBQ0Q7QUFDRjs7OytCQUVXO0FBQ1YsYUFBTyxDQUFBLFVBQUEsRUFFTCxLQUZLLE1BQUEsRUFBQSxJQUFBLEVBSUwsS0FKSyxLQUFBLEVBQUEsSUFBQSxDQUFQLEVBQU8sQ0FBUDtBQU1EOzs7d0JBdkJXO0FBQUUsYUFBTyxXQUFQLGNBQUE7QUFBdUI7Ozs7RUFQbEIsVUFBQSxPOztrQkFpQ04sTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BDZixJQUFBLFlBQUEsUUFBQSxXQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSx3QkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxPOzs7Ozs7Ozs7Ozs0QkFHSyxLLEVBQU87QUFDZCxXQUFBLEtBQUEsU0FBQSxDQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxLQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBO0FBQ0EsV0FBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLFlBQU0sV0FBTixZQUFBLElBQUEsSUFBQTtBQUNEOzs7eUJBRUssRyxFQUFLO0FBQ1QsVUFBSSxTQUFTLEtBQWIsS0FBQTs7QUFFQSxVQUFJLGVBQWUsT0FBTyxXQUExQixhQUFtQixDQUFuQjtBQUNBLFVBQUksYUFBYSxhQUFqQixVQUFpQixFQUFqQjtBQUNBLFVBQUksQ0FBSixVQUFBLEVBQWlCO0FBQ2Y7QUFDQSxnQkFBQSxHQUFBLENBQUEsdUJBQUE7QUFDQTtBQUNEO0FBQ0QsaUJBQUEsSUFBQSxDQUFnQixFQUFDLFFBQUQsTUFBQSxFQUFTLEtBQXpCLEdBQWdCLEVBQWhCO0FBQ0Q7OzsrQkFFVztBQUNWLGFBQUEsTUFBQTtBQUNEOzs7d0JBdkJXO0FBQUUsYUFBTyxXQUFQLFlBQUE7QUFBcUI7Ozs7RUFEbEIsVUFBQSxPOztrQkEyQkosSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlCZixJQUFBLFlBQUEsUUFBQSxXQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSx3QkFBQSxDQUFBOztBQUNBLElBQUEsVUFBQSxRQUFBLGtCQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sUzs7O0FBQ0osV0FBQSxNQUFBLEdBQXdCO0FBQUEsUUFBWCxRQUFXLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FBSCxDQUFHOztBQUFBLG9CQUFBLElBQUEsRUFBQSxNQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxPQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRXRCLFVBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxVQUFBLFFBQUEsR0FBQSxLQUFBO0FBSHNCLFdBQUEsS0FBQTtBQUl2Qjs7Ozs0QkFJUSxLLEVBQU87QUFDZCxXQUFBLE9BQUEsU0FBQSxDQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxPQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBO0FBQ0EsV0FBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLFlBQU0sV0FBTixjQUFBLElBQUEsSUFBQTtBQUNEOzs7NEJBRVEsSSxFQUFNO0FBQ2IsVUFBSSxnQkFBZ0IsS0FBSyxXQUF6QixjQUFvQixDQUFwQjtBQUNBLFVBQUksQ0FBSixhQUFBLEVBQW9CO0FBQ2xCO0FBQ0Q7QUFDRCxVQUFJLFFBQVEsY0FBWixLQUFBO0FBQ0EsVUFBSSxTQUFTLGNBQWIsTUFBQTtBQUNBLFVBQUksUUFBUSxLQUFaLEtBQUE7QUFDQSxVQUFJLFFBQVEsS0FBQSxHQUFBLENBQVMsS0FBQSxLQUFBLEdBQVQsTUFBQSxFQUFaLENBQVksQ0FBWjtBQUNBLFVBQUksU0FBUyxTQUFBLE9BQUEsQ0FBQSxTQUFBLENBQWlCLEtBQUEsS0FBQSxDQUFqQixRQUFBLEVBQUEsR0FBQSxDQUNOLEtBRE0sUUFBQSxFQUFBLFNBQUEsQ0FBYixLQUFhLENBQWI7O0FBSUEsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFlLENBQ2IsS0FBQSxLQUFBLENBRGEsUUFDYixFQURhLEVBQUEsWUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxDQUFmLEVBQWUsQ0FBZjs7QUFVQSxVQUFJLGNBQWMsS0FBQSxLQUFBLENBQVcsV0FBN0IsWUFBa0IsQ0FBbEI7QUFDQSxVQUFBLFdBQUEsRUFBaUI7QUFDZixvQkFBQSxLQUFBLENBQUEsTUFBQTtBQUNEOztBQUVELFdBQUEsS0FBQSxHQUFBLEtBQUE7O0FBRUEsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGVBQUE7QUFDQSxVQUFJLEtBQUEsS0FBQSxJQUFKLENBQUEsRUFBcUI7QUFDbkIsYUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDRDtBQUNGOzs7K0JBRVc7QUFDVixhQUFPLENBQUEsVUFBQSxFQUVMLEtBRkssS0FBQSxFQUFBLEtBQUEsRUFJTCxLQUpLLFFBQUEsRUFBQSxJQUFBLENBQVAsRUFBTyxDQUFQO0FBTUQ7Ozt3QkFuRFc7QUFBRSxhQUFPLFdBQVAsY0FBQTtBQUF1Qjs7OztFQVBsQixVQUFBLE87O2tCQTZETixNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqRWYsSUFBQSxZQUFBLFFBQUEsV0FBQSxDQUFBOzs7O0FBQ0EsSUFBQSxhQUFBLFFBQUEsd0JBQUEsQ0FBQTs7QUFDQSxJQUFBLHNCQUFBLFFBQUEsOEJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNLE9BQU8sT0FBYixNQUFhLENBQWI7O0lBRU0sVTs7Ozs7Ozs7Ozs7NkJBR00sSyxFQUFPO0FBQ2YsYUFBQSxLQUFBO0FBQ0Q7O0FBRUQ7Ozs7NEJBQ1MsSyxFQUFPO0FBQ2QsV0FBQSxRQUFBLFNBQUEsQ0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsUUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQTtBQUNBLFlBQU0sV0FBTixnQkFBQSxJQUFBLElBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxLQUFBO0FBQ0Q7OzswQkFFTSxLLEVBQU87QUFDWixVQUFJLGNBQWMsTUFBTSxXQUF4QixZQUFrQixDQUFsQjtBQUNBLFVBQUksZUFBZSxTQUFmLFlBQWUsQ0FBQSxDQUFBLEVBQUs7QUFDdEIsWUFBSSxFQUFKLE9BQUEsRUFBZTtBQUNiO0FBQ0Q7QUFDRCw2QkFBQSxPQUFBLENBQUEsSUFBQSxDQUFBLE1BQUE7QUFKRixPQUFBO0FBTUEsVUFBSSxjQUFjLFlBQUEsSUFBQSxDQUFBLElBQUEsQ0FBbEIsV0FBa0IsQ0FBbEI7O0FBRUEsWUFBQSxJQUFBLElBQWM7QUFDWixtQkFEWSxZQUFBO0FBRVosY0FBTTtBQUZNLE9BQWQ7QUFJQSxhQUFBLE9BQUEsQ0FBZSxNQUFmLElBQWUsQ0FBZixFQUFBLE9BQUEsQ0FBb0MsVUFBQSxJQUFBLEVBQTBCO0FBQUEsWUFBQSxRQUFBLGVBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtBQUFBLFlBQXhCLFlBQXdCLE1BQUEsQ0FBQSxDQUFBO0FBQUEsWUFBYixVQUFhLE1BQUEsQ0FBQSxDQUFBOztBQUM1RCw2QkFBQSxPQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsRUFBQSxPQUFBO0FBREYsT0FBQTtBQUdEOzs7MkJBRU8sSyxFQUFPO0FBQ2IsV0FBQSxRQUFBLFNBQUEsQ0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsUUFBQSxTQUFBLENBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsT0FBQSxDQUFlLE1BQWYsSUFBZSxDQUFmLEVBQUEsT0FBQSxDQUFvQyxVQUFBLEtBQUEsRUFBMEI7QUFBQSxZQUFBLFFBQUEsZUFBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQUEsWUFBeEIsWUFBd0IsTUFBQSxDQUFBLENBQUE7QUFBQSxZQUFiLFVBQWEsTUFBQSxDQUFBLENBQUE7O0FBQzVELDZCQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxFQUFBLE9BQUE7QUFERixPQUFBO0FBR0EsYUFBTyxNQUFQLElBQU8sQ0FBUDtBQUNBLGFBQU8sTUFBTSxXQUFiLGdCQUFPLENBQVA7QUFDRDs7OytCQUVXO0FBQ1YsYUFBQSxVQUFBO0FBQ0Q7Ozt3QkEzQ1c7QUFBRSxhQUFPLFdBQVAsZ0JBQUE7QUFBeUI7Ozs7RUFEbkIsVUFBQSxPOztrQkErQ1AsTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckRmLElBQUEsWUFBQSxRQUFBLFdBQUEsQ0FBQTs7OztBQUNBLElBQUEsY0FBQSxRQUFBLFlBQUEsQ0FBQTs7OztBQUNBLElBQUEsV0FBQSxRQUFBLHNCQUFBLENBQUE7O0FBQ0EsSUFBQSxhQUFBLFFBQUEsd0JBQUEsQ0FBQTs7QUFDQSxJQUFBLFVBQUEsUUFBQSxrQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTSxPQUFPLE9BQWIsTUFBYSxDQUFiOztJQUVNLFU7Ozs7Ozs7Ozs7OzZCQUdNLEssRUFBTztBQUNmLGFBQUEsS0FBQTtBQUNEOztBQUVEOzs7OzRCQUNTLEssRUFBTztBQUNkLFdBQUEsUUFBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLFFBQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDQSxZQUFNLFdBQU4sZ0JBQUEsSUFBQSxJQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsS0FBQTtBQUNEOzs7MEJBRU0sSyxFQUFPO0FBQ1osVUFBSSxNQUFKLEVBQUE7QUFDQSxVQUFJLFVBQVUsU0FBVixPQUFVLEdBQU07QUFDbEIsWUFBSSxTQUFTLElBQUksU0FBSixPQUFBLENBQVcsQ0FBQyxJQUFJLFNBQUwsSUFBQyxDQUFELEdBQWEsSUFBSSxTQUE1QixLQUF3QixDQUF4QixFQUFvQyxDQUFDLElBQUksU0FBTCxFQUFDLENBQUQsR0FBVyxJQUFJLFNBQWhFLElBQTRELENBQS9DLENBQWI7QUFDQSxZQUFJLE9BQUEsTUFBQSxLQUFKLENBQUEsRUFBeUI7QUFDdkI7QUFDRDtBQUNELGVBQUEsY0FBQSxDQUFBLElBQUE7QUFDQSxjQUFNLFdBQU4sWUFBQSxFQUFBLFlBQUEsQ0FBQSxNQUFBO0FBTkYsT0FBQTtBQVFBLFVBQUksT0FBTyxTQUFQLElBQU8sQ0FBQSxJQUFBLEVBQVE7QUFDakIsWUFBQSxJQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUksYUFBYSxTQUFiLFVBQWEsQ0FBQSxDQUFBLEVBQUs7QUFDcEIsWUFBQSxhQUFBO0FBQ0EsY0FBQSxJQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFNLFdBQU4sWUFBQSxFQUFBLFNBQUE7QUFIRixTQUFBO0FBS0EscUJBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxFQUFrQyxZQUFNO0FBQ3RDLGNBQUEsSUFBQSxJQUFBLENBQUE7QUFERixTQUFBO0FBR0EsZUFBQSxVQUFBO0FBVkYsT0FBQTs7QUFhQSxtQkFBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSxtQkFBQSxPQUFBLENBQUEsV0FBQSxDQUFBLEVBQUEsRUFBMkIsWUFBTTtBQUFBLFlBQUEsV0FBQTs7QUFDL0IsY0FBQSxJQUFBLEtBQUEsY0FBQSxFQUFBLEVBQUEsZ0JBQUEsV0FBQSxFQUNHLFNBREgsSUFBQSxFQUNVLEtBQUssU0FEZixJQUNVLENBRFYsQ0FBQSxFQUFBLGdCQUFBLFdBQUEsRUFFRyxTQUZILEVBQUEsRUFFUSxLQUFLLFNBRmIsRUFFUSxDQUZSLENBQUEsRUFBQSxnQkFBQSxXQUFBLEVBR0csU0FISCxLQUFBLEVBR1csS0FBSyxTQUhoQixLQUdXLENBSFgsQ0FBQSxFQUFBLGdCQUFBLFdBQUEsRUFJRyxTQUpILElBQUEsRUFJVSxLQUFLLFNBSmYsSUFJVSxDQUpWLENBQUEsRUFBQSxXQUFBO0FBREYsT0FBQTs7QUFTQSxXQUFBLEtBQUEsR0FBYSxZQUFBLE9BQUEsRUFBYixFQUFhLENBQWI7QUFDRDs7OzJCQUVPLEssRUFBTztBQUNiLFdBQUEsUUFBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLFFBQUEsU0FBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDQSxtQkFBQSxPQUFBLENBQUEsV0FBQSxDQUFBLEVBQUEsRUFBMkIsWUFBTTtBQUMvQixlQUFBLE9BQUEsQ0FBZSxNQUFmLElBQWUsQ0FBZixFQUFBLE9BQUEsQ0FBb0MsVUFBQSxJQUFBLEVBQW9CO0FBQUEsY0FBQSxRQUFBLGVBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtBQUFBLGNBQWxCLE1BQWtCLE1BQUEsQ0FBQSxDQUFBO0FBQUEsY0FBYixVQUFhLE1BQUEsQ0FBQSxDQUFBOztBQUN0RCx1QkFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQSxPQUFBO0FBREYsU0FBQTtBQURGLE9BQUE7QUFLQSxhQUFPLE1BQVAsSUFBTyxDQUFQO0FBQ0EsYUFBTyxNQUFNLFdBQWIsZ0JBQU8sQ0FBUDs7QUFFQSxvQkFBYyxLQUFkLEtBQUE7QUFDRDs7OytCQUVXO0FBQ1YsYUFBQSxhQUFBO0FBQ0Q7Ozt3QkFoRVc7QUFBRSxhQUFPLFdBQVAsZ0JBQUE7QUFBeUI7Ozs7RUFEbkIsVUFBQSxPOztrQkFvRVAsTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVFZixJQUFBLFlBQUEsUUFBQSxXQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSx3QkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxROzs7Ozs7Ozs7Ozs2QkFHTSxLLEVBQU87QUFDZixhQUFBLEtBQUE7QUFDRDs7OzRCQUVRLEssRUFBTztBQUNkLFVBQUksQ0FBQyxNQUFMLFNBQUEsRUFBc0I7QUFDcEIsY0FBQSxTQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsYUFBQSxHQUFBLEVBQUE7QUFDRDtBQUNELFdBQUEsTUFBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDQSxXQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsWUFBTSxXQUFOLGFBQUEsSUFBQSxJQUFBO0FBQ0EsYUFBQSxJQUFBO0FBQ0Q7OzswQkFFTSxPLEVBQVM7QUFDZCxVQUFJLFFBQVEsS0FBWixLQUFBO0FBQ0EsVUFBSSxRQUFBLFlBQUEsQ0FBQSxLQUFBLEVBQUosT0FBSSxDQUFKLEVBQTBDO0FBQ3hDLGdCQUFBLE9BQUEsQ0FBQSxLQUFBO0FBQ0EsY0FBQSxJQUFBLENBQUEsZUFBQSxFQUFBLE9BQUE7QUFDRDtBQUNELGFBQU8sTUFBTSxXQUFiLGFBQU8sQ0FBUDtBQUNEOzs7K0JBRVc7QUFDVixhQUFBLFVBQUE7QUFDRDs7O3dCQTVCVztBQUFFLGFBQU8sV0FBUCxhQUFBO0FBQXNCOzs7O0VBRGxCLFVBQUEsTzs7a0JBZ0NMLEs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuQ2YsSUFBQSxZQUFBLFFBQUEsV0FBQSxDQUFBOzs7O0FBQ0EsSUFBQSxhQUFBLFFBQUEsd0JBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sTzs7O0FBQ0osV0FBQSxJQUFBLEdBQXVDO0FBQUEsUUFBMUIsUUFBMEIsVUFBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxHQUFsQixDQUFrQjtBQUFBLFFBQWYsU0FBZSxVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBQU4sSUFBTTs7QUFBQSxvQkFBQSxJQUFBLEVBQUEsSUFBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsS0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVyQyxVQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsVUFBQSxRQUFBLEdBQUEsS0FBQTtBQUNBLFVBQUEsTUFBQSxHQUFBLE1BQUE7QUFKcUMsV0FBQSxLQUFBO0FBS3RDOzs7OzRCQUlRLEssRUFBTztBQUNkLFdBQUEsS0FBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLEtBQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDQSxXQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0EsWUFBTSxXQUFOLFlBQUEsSUFBQSxJQUFBO0FBQ0Q7Ozs2QkFFUyxLLEVBQU87QUFDZixhQUFPLEtBQUEsS0FBQSxHQUFBLEtBQUEsSUFBUCxDQUFBO0FBQ0Q7OzsyQkFFTyxLLEVBQU87QUFDYixXQUFBLEtBQUEsR0FBYSxLQUFBLEdBQUEsQ0FBUyxLQUFBLEtBQUEsR0FBVCxLQUFBLEVBQWIsQ0FBYSxDQUFiO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUE7QUFDRDs7O3dCQUVJLEssRUFBTztBQUNWLFdBQUEsS0FBQSxHQUFhLEtBQUEsR0FBQSxDQUFTLEtBQUEsS0FBQSxHQUFULEtBQUEsRUFBNkIsS0FBMUMsUUFBYSxDQUFiO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUE7QUFDRDs7O3lCQUVLLEssRUFBTztBQUNYLFdBQUEsR0FBQSxDQUFTLEtBQUEsTUFBQSxHQUFULEtBQUE7QUFDRDs7OytCQUVXO0FBQ1YsYUFBTyxDQUFBLFFBQUEsRUFFTCxLQUZLLEtBQUEsRUFBQSxLQUFBLEVBSUwsS0FKSyxRQUFBLEVBQUEsSUFBQSxDQUFQLEVBQU8sQ0FBUDtBQU1EOzs7d0JBakNXO0FBQUUsYUFBTyxXQUFQLFlBQUE7QUFBcUI7Ozs7RUFSbEIsVUFBQSxPOztrQkE0Q0osSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDL0NmLElBQUEsWUFBQSxRQUFBLFdBQUEsQ0FBQTs7OztBQUNBLElBQUEsYUFBQSxRQUFBLHdCQUFBLENBQUE7O0FBQ0EsSUFBQSxVQUFBLFFBQUEsa0JBQUEsQ0FBQTs7OztBQUNBLElBQUEsVUFBQSxRQUFBLGtCQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU0scUJBQU4sQ0FBQTs7SUFFTSxPOzs7QUFDSjs7Ozs7QUFLQSxXQUFBLElBQUEsQ0FBQSxJQUFBLEVBQW1DO0FBQUEsUUFBQSxRQUFBLGVBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtBQUFBLFFBQXJCLFFBQXFCLE1BQUEsQ0FBQSxDQUFBO0FBQUEsUUFBZCxjQUFjLE1BQUEsQ0FBQSxDQUFBOztBQUFBLG9CQUFBLElBQUEsRUFBQSxJQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxLQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRWpDLFVBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQSxVQUFBLFdBQUEsR0FBQSxXQUFBO0FBQ0EsVUFBQSxNQUFBLEdBQWMsSUFBSSxTQUFKLE9BQUEsQ0FBQSxDQUFBLEVBQWQsQ0FBYyxDQUFkO0FBQ0EsVUFBQSxJQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsYUFBQSxHQUFBLFNBQUE7QUFDQSxVQUFBLGlCQUFBLEdBQXlCLE1BQUEsS0FBQSxHQUF6QixrQkFBQTtBQVBpQyxXQUFBLEtBQUE7QUFRbEM7Ozs7NkJBSVMsSyxFQUFPO0FBQ2Y7QUFDQSxhQUFPLEtBQUEsS0FBQSxHQUFhLE1BQXBCLEtBQUE7QUFDRDs7QUFFRDs7Ozs0QkFDUyxLLEVBQU87QUFDZCxXQUFBLEtBQUEsU0FBQSxDQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxLQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBO0FBQ0EsV0FBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLFlBQU0sV0FBTixZQUFBLElBQUEsSUFBQTtBQUNEOzs7K0JBRVcsSyxFQUFPLEssRUFBTztBQUN4QixZQUFBLE1BQUEsR0FBZSxLQUFmLE1BQUE7QUFDQSxZQUFBLElBQUEsR0FBYSxLQUFiLElBQUE7QUFDQSxZQUFBLGFBQUEsR0FBc0IsS0FBdEIsYUFBQTtBQUNEOztBQUVEOzs7O2lDQUNjLE0sRUFBUTtBQUNwQixjQUFBLElBQUEsQ0FBQSxXQUFBLENBQWlCLEtBQUEsS0FBQSxDQUFqQixJQUFBLEVBQWtDLE9BQUEsU0FBQSxDQUFpQixLQUFuRCxLQUFrQyxDQUFsQztBQUNEOztBQUVEOzs7O2lDQUNjLE0sRUFBUTtBQUNwQixVQUFJLFFBQVEsS0FBWixLQUFBO0FBQ0EsVUFBSSxDQUFDLE1BQUwsSUFBQSxFQUFpQjtBQUNmO0FBQ0Q7QUFDRCxXQUFBLEtBQUEsQ0FBVyxPQUFBLGNBQUEsQ0FBc0IsS0FBQSxLQUFBLEdBQWpDLEdBQVcsQ0FBWDtBQUNEOzs7MEJBRU0sTSxFQUFRO0FBQ2IsVUFBSSxRQUFRLEtBQVosS0FBQTtBQUNBLFVBQUksQ0FBQyxNQUFMLElBQUEsRUFBaUI7QUFDZjtBQUNEO0FBQ0QsWUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUEsSUFBQSxDQUF5QyxFQUFDLE9BQUQsS0FBQSxFQUFRLFFBQWpELE1BQXlDLEVBQXpDO0FBQ0Q7O0FBRUQ7Ozs7MkJBQ1EsSyxFQUFPO0FBQ2IsVUFBSSxTQUFTLElBQUksU0FBSixPQUFBLENBQVcsTUFBQSxDQUFBLEdBQVUsS0FBQSxLQUFBLENBQXJCLENBQUEsRUFBbUMsTUFBQSxDQUFBLEdBQVUsS0FBQSxLQUFBLENBQTFELENBQWEsQ0FBYjtBQUNBLFdBQUEsWUFBQSxDQUFBLE1BQUE7QUFDRDs7QUFFRDs7Ozs0QkFDUyxJLEVBQU07QUFDYixVQUFJLEtBQUEsTUFBQSxLQUFKLENBQUEsRUFBdUI7QUFDckI7QUFDQSxhQUFBLGFBQUEsR0FBQSxTQUFBO0FBQ0EsYUFBQSxNQUFBLEdBQWMsSUFBSSxTQUFKLE9BQUEsQ0FBQSxDQUFBLEVBQWQsQ0FBYyxDQUFkO0FBQ0E7QUFDRDtBQUNELFdBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxXQUFBLGFBQUEsR0FBcUIsS0FBckIsR0FBcUIsRUFBckI7QUFDQSxXQUFBLE1BQUEsQ0FBWSxLQUFaLGFBQUE7QUFDRDs7O2dDQUVZO0FBQ1gsV0FBQSxhQUFBLEdBQUEsU0FBQTtBQUNBLFdBQUEsSUFBQSxHQUFBLEVBQUE7QUFDRDs7OzRCQUVRLEksRUFBTTtBQUNiLFdBQUEsT0FBQSxDQUFhLEtBQUEsTUFBQSxDQUFZLEtBQXpCLElBQWEsQ0FBYjtBQUNEOzs7K0JBRVc7QUFDVixhQUFPLGlCQUFpQixLQUF4QixLQUFBO0FBQ0Q7Ozt3QkF4RVc7QUFBRSxhQUFPLFdBQVAsWUFBQTtBQUFxQjs7OztFQWhCbEIsVUFBQSxPOztrQkEyRkosSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2xHZixJQUFBLFlBQUEsUUFBQSxXQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGFBQUEsUUFBQSx3QkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxVOzs7QUFDSixXQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQW9CO0FBQUEsb0JBQUEsSUFBQSxFQUFBLE9BQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLFFBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFbEIsVUFBQSxHQUFBLEdBQVcsSUFBQSxHQUFBLENBQVEsQ0FBbkIsS0FBbUIsQ0FBUixDQUFYO0FBRmtCLFdBQUEsS0FBQTtBQUduQjs7Ozs0QkFJUSxLLEVBQU87QUFDZCxXQUFBLFFBQUEsU0FBQSxDQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxRQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBO0FBQ0EsWUFBTSxXQUFOLGVBQUEsSUFBeUIsS0FBSyxXQUFMLGVBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUF6QixLQUF5QixDQUF6QjtBQUNBLGFBQU8sTUFBTSxXQUFiLGVBQU8sQ0FBUDtBQUNEOzs7K0JBRVcsSyxFQUFPO0FBQ2pCLFdBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBaUIsTUFBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBbUIsTUFBcEMsR0FBaUIsQ0FBakI7QUFDRDs7U0FFQSxXQUFBLGU7MEJBQWtCLFEsRUFBVSxNLEVBQVE7QUFDbkMsVUFBSSxLQUFBLEdBQUEsQ0FBQSxHQUFBLENBQWEsT0FBakIsR0FBSSxDQUFKLEVBQThCO0FBQzVCLGlCQUFBLEdBQUEsQ0FBYSxTQUFBLFFBQUEsS0FBQSx1QkFBQSxHQUFnRCxPQUE3RCxHQUFBO0FBQ0EsZUFBTyxLQUFQLElBQUE7QUFDRDtBQUNGOzs7K0JBRVc7QUFDVixhQUFPLENBQUEsUUFBQSxFQUFXLE1BQUEsSUFBQSxDQUFXLEtBQVgsR0FBQSxFQUFBLElBQUEsQ0FBWCxJQUFXLENBQVgsRUFBQSxJQUFBLENBQVAsRUFBTyxDQUFQO0FBQ0Q7Ozt3QkFyQlc7QUFBRSxhQUFPLFdBQVAsZUFBQTtBQUF3Qjs7OztFQU5sQixVQUFBLE87O2tCQThCUCxPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqQ2YsSUFBQSxZQUFBLFFBQUEsV0FBQSxDQUFBOzs7O0FBQ0EsSUFBQSxhQUFBLFFBQUEsd0JBQUEsQ0FBQTs7QUFDQSxJQUFBLFVBQUEsUUFBQSxrQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxzQkFBQSxRQUFBLDhCQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTSxZQUFZLE9BQWxCLFdBQWtCLENBQWxCOztJQUVNLFM7OztBQUNKLFdBQUEsTUFBQSxHQUEwQjtBQUFBLFFBQWIsVUFBYSxVQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLE1BQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxDQUFBLEdBQUgsQ0FBRzs7QUFBQSxvQkFBQSxJQUFBLEVBQUEsTUFBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsT0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUV4QixVQUFBLE9BQUEsR0FBQSxPQUFBO0FBRndCLFdBQUEsS0FBQTtBQUd6Qjs7Ozs2QkFJUyxLLEVBQU87QUFDZixhQUFBLEtBQUE7QUFDRDs7OztBQU1EOzRCQUNTLEssRUFBTztBQUFBLFVBQUEsU0FBQSxJQUFBOztBQUNkLFdBQUEsT0FBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLE9BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7O0FBRUEsV0FBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLFlBQU0sV0FBTixjQUFBLElBQUEsSUFBQTtBQUNBLFlBQUEsV0FBQSxHQUFBLElBQUE7QUFDQSxVQUFJLGVBQWUsU0FBZixZQUFlLENBQUEsQ0FBQSxFQUFLO0FBQ3RCLFlBQUksYUFBYSxPQUFBLEtBQUEsQ0FBakIsaUJBQWlCLEVBQWpCO0FBQ0EsWUFBSSxVQUFVLEVBQUEsSUFBQSxDQUFkLE1BQUE7QUFDQSxZQUFJLFNBQVMsSUFBSSxTQUFKLE9BQUEsQ0FDWCxRQUFBLENBQUEsR0FBWSxXQURELENBQUEsRUFFWCxRQUFBLENBQUEsR0FBWSxXQUZkLENBQWEsQ0FBYjtBQUdBLDZCQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLE1BQUE7QUFORixPQUFBO0FBUUEsVUFBSSxnQkFBZ0IsS0FBQSxVQUFBLENBQUEsSUFBQSxDQUFwQixJQUFvQixDQUFwQjs7QUFFQSxZQUFBLFNBQUEsSUFBbUI7QUFDakIsZ0JBRGlCLGFBQUE7QUFFakIsbUJBQVc7QUFGTSxPQUFuQjtBQUlBLGFBQUEsT0FBQSxDQUFlLE1BQWYsU0FBZSxDQUFmLEVBQUEsT0FBQSxDQUF5QyxVQUFBLElBQUEsRUFBMEI7QUFBQSxZQUFBLFFBQUEsZUFBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQUEsWUFBeEIsWUFBd0IsTUFBQSxDQUFBLENBQUE7QUFBQSxZQUFiLFVBQWEsTUFBQSxDQUFBLENBQUE7O0FBQ2pFLDZCQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxFQUFBLE9BQUE7QUFERixPQUFBOztBQUlBLFdBQUEsVUFBQSxDQUFnQixJQUFJLFNBQUosT0FBQSxDQUFBLENBQUEsRUFBaEIsQ0FBZ0IsQ0FBaEI7QUFDRDs7OzJCQUVPLEssRUFBTztBQUNiLFdBQUEsT0FBQSxTQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLE9BQUEsU0FBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7QUFDQSxhQUFBLE9BQUEsQ0FBZSxNQUFmLFNBQWUsQ0FBZixFQUFBLE9BQUEsQ0FBeUMsVUFBQSxLQUFBLEVBQTBCO0FBQUEsWUFBQSxRQUFBLGVBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQTtBQUFBLFlBQXhCLFlBQXdCLE1BQUEsQ0FBQSxDQUFBO0FBQUEsWUFBYixVQUFhLE1BQUEsQ0FBQSxDQUFBOztBQUNqRSw2QkFBQSxPQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsRUFBQSxPQUFBO0FBREYsT0FBQTtBQUdBLGFBQU8sTUFBUCxTQUFPLENBQVA7QUFDQSxhQUFPLE1BQU0sV0FBYixjQUFPLENBQVA7QUFDRDs7OytCQUVXLE0sRUFBUTtBQUNsQixXQUFBLFFBQUEsR0FBZ0IsT0FBQSxHQUFBLEdBQWEsS0FBN0IsT0FBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBa0IsS0FBbEIsUUFBQTtBQUNEOzs7K0JBRVc7QUFDVixhQUFBLFFBQUE7QUFDRDs7O3dCQXREVztBQUFFLGFBQU8sV0FBUCxjQUFBO0FBQXVCOzs7d0JBTXRCO0FBQ2IsYUFBTyxLQUFQLFFBQUE7QUFDRDs7OztFQWRrQixVQUFBLE87O2tCQStETixNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RFZixJQUFBLFVBQUEsUUFBQSxTQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFdBQUEsUUFBQSxtQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxVQUFBLFFBQUEsV0FBQSxDQUFBOzs7O0FBQ0EsSUFBQSxVQUFBLFFBQUEsa0JBQUEsQ0FBQTs7OztBQUNBLElBQUEsYUFBQSxRQUFBLHdCQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sS0FBSyxLQUFYLEVBQUE7O0FBRUEsU0FBQSxXQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBOEI7QUFDNUIsTUFBSSxRQUFRLEVBQUEsS0FBQSxHQUFaLENBQUE7QUFDQSxNQUFJLFNBQVMsRUFBQSxNQUFBLEdBQWIsQ0FBQTtBQUNBLE1BQUksVUFBVSxLQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQWQsS0FBYyxDQUFkO0FBQ0EsTUFBSSxNQUFBLEtBQUosQ0FBQTtBQUNBO0FBQ0EsTUFBSSxLQUFLLEtBQUEsR0FBQSxDQUFTLE1BQWxCLEVBQVMsQ0FBVDtBQUNBLE1BQUksS0FBSyxLQUFBLEdBQUEsQ0FBUyxVQUFsQixFQUFTLENBQVQ7QUFDQSxNQUFJLEtBQUEsRUFBQSxJQUFXLEtBQUssS0FBSyxLQUF6QixDQUFBLEVBQWlDO0FBQy9CLFVBQU0sUUFBUSxLQUFBLEdBQUEsQ0FBZCxHQUFjLENBQWQ7QUFERixHQUFBLE1BRU87QUFDTCxVQUFNLFNBQVMsS0FBQSxHQUFBLENBQWYsR0FBZSxDQUFmO0FBQ0Q7QUFDRCxTQUFPLEtBQUEsR0FBQSxDQUFQLEdBQU8sQ0FBUDtBQUNEOztBQUVELElBQU0sU0FBUztBQUNiO0FBQ0EsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBRmEsSUFFYixDQUZhLEVBR2IsQ0FBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUhGLENBR0UsQ0FIYSxDQUFmOztJQU1NLFc7Ozs7Ozs7Ozs7OzZCQUNNO0FBQ1IsYUFBTyxRQUFBLE9BQUEsQ0FBQSxNQUFBLENBQWEsVUFBQSxPQUFBLENBQXBCLE1BQU8sQ0FBUDtBQUNEOzs7MEJBRU0sTSxFQUFRLEksRUFBTTtBQUNuQixVQUFJLGNBQWMsT0FBTyxXQUF6QixZQUFrQixDQUFsQjtBQUNBLFVBQUksQ0FBSixXQUFBLEVBQWtCO0FBQ2hCLGVBQUEsSUFBQTtBQUNEO0FBQ0QsVUFBSSxDQUFDLFlBQUEsUUFBQSxDQUFMLElBQUssQ0FBTCxFQUFpQztBQUMvQixlQUFBLEtBQUE7QUFDRDtBQUNELGtCQUFBLE1BQUEsQ0FBQSxJQUFBO0FBQ0EsYUFBQSxJQUFBO0FBQ0Q7O0FBRUQ7Ozs7K0JBQ2lDO0FBQUEsVUFBMUIsU0FBMEIsS0FBMUIsTUFBMEI7QUFBQSxVQUFBLFdBQUEsS0FBbEIsR0FBa0I7QUFBQSxVQUFsQixNQUFrQixhQUFBLFNBQUEsR0FBWixTQUFZLEdBQUEsUUFBQTs7QUFBQSxVQUFBLGdCQUFBLGVBQ3lDLE9BQU8sS0FEaEQsS0FDeUMsQ0FEekMsRUFBQSxDQUFBLENBQUE7QUFBQSxVQUFBLE9BQUEsY0FBQSxDQUFBLENBQUE7QUFBQSxVQUFBLGFBQUEsY0FBQSxDQUFBLENBQUE7QUFBQSxVQUFBLGlCQUFBLGNBQUEsQ0FBQSxDQUFBO0FBQUEsVUFBQSxRQUFBLG1CQUFBLFNBQUEsR0FBQSxDQUFBLEdBQUEsY0FBQTtBQUFBLFVBQUEsa0JBQUEsY0FBQSxDQUFBLENBQUE7QUFBQSxVQUFBLFNBQUEsb0JBQUEsU0FBQSxHQUFBLENBQUEsR0FBQSxlQUFBO0FBQUEsVUFBQSxrQkFBQSxjQUFBLENBQUEsQ0FBQTtBQUFBLFVBQUEsUUFBQSxvQkFBQSxTQUFBLEdBQUEsQ0FBQSxHQUFBLGVBQUE7QUFBQSxVQUFBLGtCQUFBLGNBQUEsQ0FBQSxDQUFBO0FBQUEsVUFBQSxRQUFBLG9CQUFBLFNBQUEsR0FBQSxDQUFBLEdBQUEsZUFBQTs7QUFFL0IsVUFBSSxDQUFDLEtBQUEsS0FBQSxDQUFBLE1BQUEsRUFBTCxJQUFLLENBQUwsRUFBK0I7QUFDN0I7QUFDRDtBQUNELFVBQUksU0FBUyxJQUFJLFNBQUosT0FBQSxDQUFXLEVBQUMsT0FBRCxLQUFBLEVBQVEsUUFBUixNQUFBLEVBQWdCLE9BQXhDLEtBQXdCLEVBQVgsQ0FBYjs7QUFFQTtBQUNBLFVBQUksUUFBSixTQUFBLEVBQXVCO0FBQ3JCO0FBQ0EsWUFBSSxnQkFBZ0IsT0FBTyxXQUEzQixjQUFvQixDQUFwQjtBQUNBLGNBQU0sZ0JBQWdCLGNBQWhCLE9BQUEsR0FBTixDQUFBO0FBQ0Q7QUFDRCxVQUFJLFNBQVMsU0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLEdBQUEsRUFBYixDQUFhLENBQWI7QUFDQSxhQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQTtBQUNBLGFBQUEsUUFBQSxDQUFBLE1BQUE7O0FBRUE7QUFDQSxVQUFJLFVBQVUsWUFBQSxNQUFBLEVBQW9CLE1BQU0sT0FBeEMsUUFBYyxDQUFkO0FBQ0EsVUFBSSxZQUFZLE9BQUEsTUFBQSxHQW5CZSxDQW1CL0IsQ0FuQitCLENBbUJHO0FBQ2xDLFVBQUksTUFBTSxVQUFWLFNBQUE7QUFDQSxVQUFJLFdBQVcsU0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxDQUNSLFNBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBaUIsT0FEeEIsVUFDTyxDQURRLENBQWY7QUFFQSxhQUFBLFVBQUEsQ0FBQSxHQUFBLENBQXNCLFNBQXRCLENBQUEsRUFBa0MsU0FBbEMsQ0FBQTs7QUFFQSxhQUFBLElBQUEsQ0FBQSxPQUFBLEVBQXFCLFlBQU07QUFDekIsZUFBQSxZQUFBLENBQUEsTUFBQTs7QUFFQSxZQUFJLGNBQWMsT0FBTyxXQUF6QixZQUFrQixDQUFsQjtBQUNBLFlBQUEsV0FBQSxFQUFpQjtBQUNmLHNCQUFBLEtBQUEsQ0FBa0IsT0FBQSxLQUFBLEdBQUEsU0FBQSxDQUFBLFVBQUEsRUFBbEIsTUFBa0IsRUFBbEI7QUFDRDtBQU5ILE9BQUE7O0FBU0EsYUFBQSxJQUFBLENBQUEsV0FBQSxFQUFBLE1BQUE7QUFDRDs7OytCQUVXO0FBQ1YsYUFBQSxVQUFBO0FBQ0Q7Ozs7RUF6RG9CLFFBQUEsTzs7a0JBNERSLFE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxRmYsSUFBQSxRQUFBLFFBQUEsZ0JBQUEsQ0FBQTs7Ozs7Ozs7SUFFTSxRO0FBQ0osV0FBQSxLQUFBLENBQUEsS0FBQSxFQUFvQjtBQUFBLG9CQUFBLElBQUEsRUFBQSxLQUFBOztBQUNsQixTQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0Q7Ozs7MkJBRU8sQ0FFUDs7OzJCQUVjLE8sRUFBUztBQUN0QixhQUFPLElBQUksTUFBSixNQUFBLENBQVAsT0FBTyxDQUFQO0FBQ0Q7Ozs7OztrQkFHWSxLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQmYsSUFBQSxRQUFBLFFBQUEsYUFBQSxDQUFBOztBQUNBLElBQUEsVUFBQSxRQUFBLGNBQUEsQ0FBQTs7OztBQUNBLElBQUEsYUFBQSxRQUFBLGFBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFJLE9BQUosU0FBQTs7SUFFTSxlOzs7QUFDSixXQUFBLFlBQUEsR0FBZTtBQUFBLG9CQUFBLElBQUEsRUFBQSxZQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxhQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxZQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBR2IsVUFBQSxJQUFBLEdBQUEsQ0FBQTtBQUhhLFdBQUEsS0FBQTtBQUlkOzs7OzZCQUVTO0FBQUEsVUFBQSxTQUFBLElBQUE7O0FBQ1IsVUFBSSxRQUFRLElBQUksTUFBSixTQUFBLENBQWM7QUFDeEIsb0JBRHdCLE9BQUE7QUFFeEIsa0JBRndCLEVBQUE7QUFHeEIsY0FId0IsT0FBQTtBQUl4QixnQkFKd0IsU0FBQTtBQUt4Qix5QkFMd0IsQ0FBQTtBQU14QixvQkFOd0IsSUFBQTtBQU94Qix5QkFQd0IsU0FBQTtBQVF4Qix3QkFSd0IsQ0FBQTtBQVN4Qix5QkFBaUIsS0FBQSxFQUFBLEdBVE8sQ0FBQTtBQVV4Qiw0QkFBb0I7QUFWSSxPQUFkLENBQVo7QUFZQSxXQUFBLFdBQUEsR0FBbUIsSUFBSSxNQUFKLElBQUEsQ0FBQSxJQUFBLEVBQW5CLEtBQW1CLENBQW5COztBQUVBO0FBQ0EsV0FBQSxRQUFBLENBQWMsS0FBZCxXQUFBOztBQUVBO0FBQ0EsWUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLEVBQUEsR0FBQSxDQUFBLDRCQUFBLEVBQUEsR0FBQSxDQUFBLHNCQUFBLEVBQUEsSUFBQSxDQUlRLFlBQUE7QUFBQSxlQUFNLE9BQUEsSUFBQSxDQUFBLGFBQUEsRUFBeUIsWUFBekIsT0FBQSxFQUFvQztBQUM5QyxtQkFEOEMsTUFBQTtBQUU5QyxvQkFBVSxDQUFBLENBQUEsRUFBQSxDQUFBO0FBRm9DLFNBQXBDLENBQU47QUFKUixPQUFBO0FBUUQ7Ozt5QkFFSyxLLEVBQU87QUFDWCxXQUFBLElBQUEsSUFBYSxRQURGLEVBQ1gsQ0FEVyxDQUNhO0FBQ3hCLFdBQUEsV0FBQSxDQUFBLElBQUEsR0FBd0IsT0FBTyxNQUFNLEtBQUEsS0FBQSxDQUFXLEtBQVgsSUFBQSxJQUFBLENBQUEsR0FBTixDQUFBLEVBQUEsSUFBQSxDQUEvQixHQUErQixDQUEvQjtBQUNEOzs7O0VBdkN3QixRQUFBLE87O2tCQTBDWixZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoRGYsSUFBQSxRQUFBLFFBQUEsYUFBQSxDQUFBOztBQUNBLElBQUEsVUFBQSxRQUFBLGNBQUEsQ0FBQTs7OztBQUNBLElBQUEsT0FBQSxRQUFBLFlBQUEsQ0FBQTs7OztBQUNBLElBQUEsVUFBQSxRQUFBLGVBQUEsQ0FBQTs7OztBQUNBLElBQUEsYUFBQSxRQUFBLHFCQUFBLENBQUE7O0FBRUEsSUFBQSxPQUFBLFFBQUEsZ0JBQUEsQ0FBQTs7OztBQUVBLElBQUEsaUJBQUEsUUFBQSxxQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxnQkFBQSxRQUFBLG9CQUFBLENBQUE7Ozs7QUFDQSxJQUFBLG1CQUFBLFFBQUEsdUJBQUEsQ0FBQTs7OztBQUNBLElBQUEsOEJBQUEsUUFBQSxrQ0FBQSxDQUFBOzs7O0FBQ0EsSUFBQSw4QkFBQSxRQUFBLGtDQUFBLENBQUE7Ozs7QUFDQSxJQUFBLHNCQUFBLFFBQUEsMkJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFJLGFBQUEsS0FBSixDQUFBO0FBQ0EsSUFBSSxjQUFBLEtBQUosQ0FBQTs7QUFFQSxTQUFBLG1CQUFBLEdBQWdDO0FBQzlCLE1BQUksTUFBSixFQUFBO0FBQ0EsTUFBSSxXQUFKLFNBQUEsRUFBZTtBQUNiLFFBQUEsS0FBQSxHQUFBLFVBQUE7QUFDQSxRQUFBLFFBQUEsR0FBZSxJQUFBLEtBQUEsR0FBZixFQUFBO0FBQ0EsUUFBQSxjQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsa0JBQUEsR0FBQSxFQUFBO0FBSkYsR0FBQSxNQUtPO0FBQ0wsUUFBQSxLQUFBLEdBQVksYUFBQSxHQUFBLEdBQUEsVUFBQSxHQUFnQyxhQUE1QyxDQUFBO0FBQ0EsUUFBQSxRQUFBLEdBQWUsSUFBQSxLQUFBLEdBQWYsRUFBQTtBQUNEO0FBQ0QsTUFBQSxNQUFBLEdBQWEsY0FBYixDQUFBO0FBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxHQUFRLGNBQWMsSUFBdEIsTUFBQTs7QUFFQSxTQUFBLEdBQUE7QUFDRDs7QUFFRCxTQUFBLGtCQUFBLENBQUEsTUFBQSxFQUFxQztBQUNuQyxNQUFJLE1BQU07QUFDUixZQUFBO0FBRFEsR0FBVjtBQUdBLE1BQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsTUFBSSxXQUFKLFNBQUEsRUFBZTtBQUNiLFFBQUEsS0FBQSxHQUFZLGFBQVosQ0FBQTtBQUNBLFFBQUEsTUFBQSxHQUFhLGNBQWIsQ0FBQTtBQUNBLFFBQUEsUUFBQSxHQUFlLElBQUEsS0FBQSxHQUFmLEVBQUE7QUFIRixHQUFBLE1BSU87QUFDTCxRQUFBLEtBQUEsR0FBWSxhQUFBLEdBQUEsR0FBbUIsYUFBbkIsQ0FBQSxHQUFvQyxhQUFoRCxDQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQWEsY0FBYixDQUFBO0FBQ0EsUUFBQSxRQUFBLEdBQWUsSUFBQSxLQUFBLEdBQWYsRUFBQTtBQUNEO0FBQ0QsU0FBQSxHQUFBO0FBQ0Q7O0FBRUQsU0FBQSxxQkFBQSxDQUFBLE1BQUEsRUFBd0M7QUFDdEMsTUFBSSxNQUFNO0FBQ1IsWUFBQTtBQURRLEdBQVY7QUFHQSxNQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsTUFBSSxXQUFKLFNBQUEsRUFBZTtBQUNiLFFBQUEsS0FBQSxHQUFZLGFBQVosQ0FBQTtBQURGLEdBQUEsTUFFTztBQUNMLFFBQUksU0FBUyxhQUFBLEdBQUEsR0FBQSxDQUFBLEdBQXVCLGFBQUEsR0FBQSxHQUFBLEVBQUEsR0FBcEMsRUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFZLGFBQVosTUFBQTtBQUNEO0FBQ0QsTUFBQSxDQUFBLEdBQVEsYUFBYSxJQUFyQixLQUFBO0FBQ0EsU0FBQSxHQUFBO0FBQ0Q7O0lBRUssWTs7O0FBQ0osV0FBQSxTQUFBLENBQUEsSUFBQSxFQUFvQztBQUFBLFFBQXJCLFVBQXFCLEtBQXJCLE9BQXFCO0FBQUEsUUFBWixXQUFZLEtBQVosUUFBWTs7QUFBQSxvQkFBQSxJQUFBLEVBQUEsU0FBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsVUFBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUdsQyxVQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0EsVUFBQSxVQUFBLEdBQUEsUUFBQTtBQUNBLFVBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBO0FBQ0EsVUFBQSxRQUFBLEdBQWdCLFdBQUEsU0FBQSxHQUFBLENBQUEsR0FBaEIsR0FBQTtBQUNBLFVBQUEsTUFBQSxHQUFjLElBQUksU0FBbEIsT0FBYyxFQUFkO0FBUGtDLFdBQUEsS0FBQTtBQVFuQzs7Ozs2QkFFUztBQUNSLG1CQUFhLEtBQUEsTUFBQSxDQUFiLEtBQUE7QUFDQSxvQkFBYyxLQUFBLE1BQUEsQ0FBZCxNQUFBO0FBQ0EsV0FBQSxXQUFBLEdBQUEsS0FBQTtBQUNBLFdBQUEsT0FBQTtBQUNBLFdBQUEsVUFBQTtBQUNBLFdBQUEsTUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNEOzs7NkJBRVM7QUFDUixVQUFJLFVBQVUsSUFBSSxNQUFBLE9BQUEsQ0FBSixLQUFBLENBQUEsQ0FBQSxFQUFkLElBQWMsQ0FBZDtBQUNBLFVBQUksVUFBVSxJQUFJLE1BQUEsT0FBQSxDQUFKLEtBQUEsQ0FBZCxPQUFjLENBQWQ7QUFDQSxjQUFBLFdBQUEsR0FBQSxJQUFBO0FBQ0EsV0FBQSxRQUFBLENBQUEsT0FBQTs7QUFFQSxVQUFJLGdCQUFnQixJQUFJLGdCQUFKLE9BQUEsQ0FBcEIscUJBQW9CLENBQXBCO0FBQ0EsVUFBSSxlQUFlLElBQUksZUFBSixPQUFBLENBQWlCLG1CQUFtQixLQUF2RCxHQUFvQyxDQUFqQixDQUFuQjtBQUNBLFVBQUksa0JBQWtCLElBQUksa0JBQUosT0FBQSxDQUFvQixzQkFBc0IsS0FBaEUsR0FBMEMsQ0FBcEIsQ0FBdEI7O0FBRUE7QUFDQSxvQkFBQSxXQUFBLEdBQUEsT0FBQTtBQUNBLG1CQUFBLFdBQUEsR0FBQSxPQUFBO0FBQ0Esc0JBQUEsV0FBQSxHQUFBLE9BQUE7QUFDQSxjQUFBLFFBQUEsQ0FBQSxhQUFBO0FBQ0EsY0FBQSxRQUFBLENBQUEsWUFBQTtBQUNBLGNBQUEsUUFBQSxDQUFBLGVBQUE7O0FBRUEsVUFBSSxXQUFKLFNBQUEsRUFBZTtBQUNiO0FBQ0E7QUFDQSxZQUFJLGlCQUFpQixJQUFJLDZCQUFKLE9BQUEsQ0FBK0I7QUFDbEQsYUFBRyxhQUQrQyxDQUFBO0FBRWxELGFBQUcsY0FBQSxDQUFBLEdBRitDLENBQUE7QUFHbEQsa0JBQVEsYUFBYTtBQUg2QixTQUEvQixDQUFyQjtBQUtBLHVCQUFBLFdBQUEsR0FBQSxPQUFBOztBQUVBO0FBQ0EsWUFBSSxpQkFBaUIsSUFBSSw2QkFBSixPQUFBLENBQStCO0FBQ2xELGFBQUcsYUFBQSxDQUFBLEdBRCtDLENBQUE7QUFFbEQsYUFBRyxjQUFBLENBQUEsR0FGK0MsQ0FBQTtBQUdsRCxpQkFBTyxhQUgyQyxDQUFBO0FBSWxELGtCQUFRLGNBQWM7QUFKNEIsU0FBL0IsQ0FBckI7QUFNQSx1QkFBQSxXQUFBLEdBQUEsT0FBQTs7QUFFQSxnQkFBQSxRQUFBLENBQUEsY0FBQTtBQUNBLGdCQUFBLFFBQUEsQ0FBQSxjQUFBO0FBQ0E7QUFDRDtBQUNELG9CQUFBLEdBQUEsQ0FBa0IsQ0FBQSxlQUFBLEVBQUEsVUFBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsQ0FBbEIsRUFBa0IsQ0FBbEI7QUFDRDs7O2lDQUVhO0FBQ1osVUFBSSxDQUFDLEtBQUwsR0FBQSxFQUFlO0FBQ2IsYUFBQSxHQUFBLEdBQVcsSUFBSSxNQUFmLE9BQVcsRUFBWDtBQUNEO0FBQ0Y7Ozs4QkFFVTtBQUNULFVBQUksV0FBVyxXQUFXLEtBQTFCLE9BQUE7O0FBRUE7QUFDQSxVQUFJLENBQUMsTUFBQSxTQUFBLENBQUwsUUFBSyxDQUFMLEVBQTBCO0FBQ3hCLGNBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQ2lCLFdBRGpCLE9BQUEsRUFBQSxJQUFBLENBRVEsS0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFGUixRQUVRLENBRlI7QUFERixPQUFBLE1BSU87QUFDTCxhQUFBLFFBQUEsQ0FBQSxRQUFBO0FBQ0Q7QUFDRjs7OzZCQUVTLFEsRUFBVTtBQUFBLFVBQUEsU0FBQSxJQUFBOztBQUNsQixVQUFJLFdBQVcsSUFBSSxNQUFBLE9BQUEsQ0FBSixLQUFBLENBQUEsQ0FBQSxFQUFmLElBQWUsQ0FBZjtBQUNBLFVBQUksV0FBVyxJQUFJLE1BQUEsT0FBQSxDQUFKLEtBQUEsQ0FBZixRQUFlLENBQWY7QUFDQSxlQUFBLFdBQUEsR0FBQSxJQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsVUFBQSxHQUFBLElBQUE7QUFDQSxlQUFBLFFBQUEsQ0FBQSxHQUFBLENBQXNCLGFBQXRCLENBQUEsRUFBc0MsY0FBdEMsQ0FBQTtBQUNBLFdBQUEsUUFBQSxDQUFBLFFBQUE7O0FBRUEsVUFBSSxVQUFVLE1BQUEsU0FBQSxDQUFBLFFBQUEsRUFBZCxJQUFBOztBQUVBLFVBQUksTUFBTSxJQUFJLE1BQWQsT0FBVSxFQUFWO0FBQ0EsZUFBQSxRQUFBLENBQUEsR0FBQTtBQUNBO0FBQ0EsVUFBSSxDQUFDLFFBQUwsTUFBQSxFQUFxQjtBQUNuQixhQUFBLE1BQUEsQ0FBQSxPQUFBO0FBREYsT0FBQSxNQUVPO0FBQ0wsYUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEdBQUE7QUFDRDtBQUNEO0FBQ0EsZUFBQSxRQUFBLENBQWtCLEtBQWxCLE1BQUE7QUFDQSxVQUFBLElBQUEsQ0FBQSxPQUFBOztBQUVBLFVBQUEsRUFBQSxDQUFBLEtBQUEsRUFBYyxVQUFBLENBQUEsRUFBSztBQUNqQixlQUFBLFdBQUEsR0FBQSxLQUFBO0FBQ0E7QUFDQSxlQUFBLFdBQUEsQ0FBaUIsT0FBakIsR0FBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLE9BQUE7O0FBRUEsZUFBQSxPQUFBLEdBQWUsRUFBZixHQUFBO0FBQ0EsZUFBQSxVQUFBLEdBQWtCLEVBQWxCLFVBQUE7QUFDQSxlQUFBLE9BQUE7QUFSRixPQUFBOztBQVdBLFVBQUEsU0FBQSxDQUFjLEtBQWQsR0FBQSxFQUF3QixLQUF4QixVQUFBO0FBQ0E7QUFDQTtBQUNBLFVBQUEsUUFBQSxDQUFhLEtBQWIsUUFBQTtBQUNBLFdBQUEsR0FBQSxHQUFBLEdBQUE7O0FBRUEsV0FBQSxXQUFBLEdBQUEsSUFBQTtBQUNEOzs7eUJBRUssSyxFQUFPO0FBQ1gsVUFBSSxDQUFDLEtBQUwsV0FBQSxFQUF1QjtBQUNyQjtBQUNEO0FBQ0QsV0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQTtBQUNBLFdBQUEsR0FBQSxDQUFBLFdBQUEsQ0FDRSxDQUFDLEtBQUEsR0FBQSxDQUFELENBQUEsR0FBYyxLQURoQixRQUFBLEVBRUUsQ0FBQyxLQUFBLEdBQUEsQ0FBRCxDQUFBLEdBQWMsS0FGaEIsUUFBQTtBQUdEOzs7O0VBeklxQixRQUFBLE87O2tCQTRJVCxTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2pOZixJQUFBLFdBQUEsUUFBQSxVQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFFBQUEsUUFBQSxhQUFBLENBQUE7O0FBQ0EsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7QUFDQSxJQUFBLGNBQUEsUUFBQSxZQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFdBQUEsUUFBQSxtQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNLFFBQVEsQ0FBRSxTQUFGLE9BQUEsRUFBVyxTQUFYLE9BQUEsRUFBb0IsU0FBcEIsT0FBQSxFQUE2QixTQUEzQyxPQUFjLENBQWQ7O0lBRU0sTzs7O0FBQ0osV0FBQSxJQUFBLENBQUEsSUFBQSxFQUFzQztBQUFBLFFBQXZCLElBQXVCLEtBQXZCLENBQXVCO0FBQUEsUUFBcEIsSUFBb0IsS0FBcEIsQ0FBb0I7QUFBQSxRQUFqQixRQUFpQixLQUFqQixLQUFpQjtBQUFBLFFBQVYsU0FBVSxLQUFWLE1BQVU7O0FBQUEsb0JBQUEsSUFBQSxFQUFBLElBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLEtBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFcEMsVUFBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUksT0FBTyxJQUFJLE1BQWYsUUFBVyxFQUFYO0FBQ0EsU0FBQSxTQUFBLENBQUEsUUFBQTtBQUNBLFNBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxPQUFBO0FBQ0EsVUFBQSxRQUFBLENBQUEsSUFBQTs7QUFFQSxRQUFJLGFBQWEsSUFBSSxNQUFyQixRQUFpQixFQUFqQjtBQUNBLGVBQUEsU0FBQSxDQUFBLENBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsUUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUE7QUFDQSxlQUFBLE9BQUE7QUFDQSxlQUFBLE9BQUEsR0FBQSxLQUFBO0FBQ0EsVUFBQSxRQUFBLENBQUEsVUFBQTs7QUFFQSxVQUFBLFVBQUEsR0FBQSxVQUFBO0FBakJvQyxXQUFBLEtBQUE7QUFrQnJDOzs7OytCQUVXLEssRUFBTyxLLEVBQU87QUFDeEIsV0FBQSxZQUFBOztBQUVBLFVBQUksUUFBUSxLQUFaLEtBQUE7QUFDQSxVQUFJLFNBQVMsS0FBYixNQUFBO0FBQ0E7QUFDQSxVQUFJLFNBQVMsTUFBYixNQUFhLEVBQWI7QUFDQSxVQUFJLFVBQVUsS0FBQSxHQUFBLENBQVMsT0FBVCxLQUFBLEVBQXVCLE9BQXJDLE1BQWMsQ0FBZDtBQUNBLFVBQUksUUFBUSxRQUFaLE9BQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQTtBQUNBLGFBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBb0IsUUFBcEIsQ0FBQSxFQUErQixTQUEvQixDQUFBO0FBQ0EsV0FBQSxRQUFBLENBQUEsTUFBQTs7QUFFQTtBQUNBLFVBQUksV0FBVyxLQUFBLEtBQUEsR0FBZixHQUFBO0FBQ0EsVUFBSSxRQUFRLElBQUksTUFBSixTQUFBLENBQWM7QUFDeEIsa0JBRHdCLFFBQUE7QUFFeEIsY0FGd0IsS0FBQTtBQUd4QixvQkFId0IsS0FBQTtBQUl4QixvQkFBWTtBQUpZLE9BQWQsQ0FBWjtBQU1BLFVBQUksWUFBWSxVQUFBLFFBQUEsR0FBQSxHQUFBLEdBQWhCLEtBQUE7QUFDQSxVQUFJLE9BQU8sSUFBSSxNQUFKLElBQUEsQ0FBQSxTQUFBLEVBQVgsS0FBVyxDQUFYO0FBQ0EsV0FBQSxRQUFBLENBQUEsR0FBQSxDQUFrQixRQUFsQixJQUFBLEVBQUEsTUFBQTtBQUNBLFdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsUUFBQSxDQUFBLElBQUE7O0FBRUEsV0FBQSxNQUFBLEdBQUEsTUFBQTtBQUNBLFdBQUEsSUFBQSxHQUFBLElBQUE7QUFDRDs7O21DQUVlO0FBQ2QsVUFBSSxLQUFKLE1BQUEsRUFBaUI7QUFDZixhQUFBLE1BQUEsQ0FBQSxPQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsT0FBQTtBQUNBLGVBQU8sS0FBUCxNQUFBO0FBQ0EsZUFBTyxLQUFQLElBQUE7QUFDRDtBQUNGOzs7NkJBRVM7QUFDUixXQUFBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQTtBQUNEOzs7K0JBRVc7QUFDVixXQUFBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQTtBQUNEOzs7O0VBcEVnQixNQUFBLFM7O0lBdUViLGtCOzs7QUFDSixXQUFBLGVBQUEsQ0FBQSxHQUFBLEVBQWtCO0FBQUEsb0JBQUEsSUFBQSxFQUFBLGVBQUE7O0FBQUEsUUFBQSxTQUFBLElBQUEsTUFBQTtBQUFBLFFBQUEsUUFBQSxJQUFBLEtBQUE7O0FBRWhCLFFBQUksVUFBVSxRQUFkLEdBQUE7QUFDQSxRQUFJLFdBQVcsUUFBUSxVQUF2QixDQUFBO0FBQ0EsUUFBSSxVQUFVO0FBQ1osU0FEWSxPQUFBO0FBRVosU0FGWSxPQUFBO0FBR1osYUFIWSxRQUFBO0FBSVosY0FBUTtBQUpJLEtBQWQ7QUFNQSxRQUFJLFlBQUosQ0FBQTtBQUNBLFFBQUEsTUFBQSxHQUFhLENBQUMsUUFBRCxPQUFBLElBQUEsU0FBQSxHQUFiLE9BQUE7O0FBWGdCLFFBQUEsU0FBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSxnQkFBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsZUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTs7QUFlaEIsV0FBQSxJQUFBLEdBQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxDQUFBLG9CQUFBLEVBQWdDLE9BQUEsbUJBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFoQyxNQUFnQyxDQUFoQzs7QUFFQSxXQUFBLGNBQUEsR0FBQSxFQUFBO0FBQ0EsU0FBSyxJQUFJLElBQVQsQ0FBQSxFQUFnQixJQUFoQixTQUFBLEVBQUEsR0FBQSxFQUFvQztBQUNsQyxVQUFJLE9BQU8sSUFBQSxJQUFBLENBQVgsT0FBVyxDQUFYO0FBQ0EsYUFBQSxRQUFBLENBQUEsSUFBQTtBQUNBLGFBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsY0FBQSxDQUFBLElBQWEsV0FBYixPQUFBO0FBQ0Q7QUFDRDtBQUNBLFdBQUEsY0FBQSxDQUFBLENBQUEsRUFBQSxNQUFBOztBQUVBLFdBQUEsbUJBQUEsQ0FBQSxNQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsTUFBQTtBQTdCZ0IsV0FBQSxNQUFBO0FBOEJqQjs7Ozt3Q0FFb0IsTSxFQUFRO0FBQzNCLFVBQUksZUFBZSxPQUFPLFdBQTFCLGFBQW1CLENBQW5CO0FBQ0EsVUFBSSxDQUFKLFlBQUEsRUFBbUI7QUFDakI7QUFDQTtBQUNEO0FBQ0QsVUFBSSxRQUFKLEVBQUE7QUFDQSxVQUFJLElBQUosQ0FBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxPQUFBLENBQTBCLFVBQUEsSUFBQSxFQUFRO0FBQ2hDLGNBQUEsQ0FBQSxJQUFBLElBQUE7QUFDQTtBQUZGLE9BQUE7QUFJQSxXQUFBLGNBQUEsQ0FBQSxPQUFBLENBQTRCLFVBQUEsU0FBQSxFQUFBLENBQUEsRUFBa0I7QUFDNUMsWUFBSSxPQUFPLE1BQVgsQ0FBVyxDQUFYO0FBQ0EsWUFBQSxJQUFBLEVBQVU7QUFDUixvQkFBQSxVQUFBLENBQXFCLEtBQXJCLEtBQUEsRUFBaUMsS0FBakMsS0FBQTtBQURGLFNBQUEsTUFFTztBQUNMLG9CQUFBLFlBQUE7QUFDRDtBQU5ILE9BQUE7QUFRRDs7OzBCQUVNLE0sRUFBUTtBQUFBLFVBQUEsU0FBQSxJQUFBOztBQUNiLFVBQUksZUFBZSxPQUFPLFdBQTFCLGFBQW1CLENBQW5CO0FBQ0EsVUFBSSxPQUFPLFNBQVAsSUFBTyxDQUFBLEdBQUEsRUFBTztBQUNoQixZQUFJLFVBQVUsTUFBQSxPQUFBLENBQWQsR0FBYyxDQUFkO0FBQ0EsWUFBSSxVQUFVLFNBQVYsT0FBVSxDQUFBLENBQUEsRUFBSztBQUNqQixZQUFBLGFBQUE7QUFDQSx1QkFBQSxVQUFBLENBQUEsT0FBQTtBQUNBLGlCQUFBLGNBQUEsQ0FBQSxPQUFBLENBQTRCLFVBQUEsU0FBQSxFQUFBLENBQUEsRUFBa0I7QUFDNUMsZ0JBQUksTUFBSixPQUFBLEVBQW1CO0FBQ2pCLHdCQUFBLE1BQUE7QUFERixhQUFBLE1BRU87QUFDTCx3QkFBQSxRQUFBO0FBQ0Q7QUFMSCxXQUFBO0FBSEYsU0FBQTtBQVdBLHFCQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLE9BQUEsRUFBOEIsWUFBTSxDQUFwQyxDQUFBO0FBQ0EsZUFBQSxPQUFBO0FBZEYsT0FBQTs7QUFpQkEsVUFBSSxRQUFBLEtBQUosQ0FBQTtBQUNBLG1CQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLG1CQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsRUFBQSxFQUEyQixZQUFNO0FBQy9CLGdCQUFRO0FBQ04sbUJBQVMsS0FBSyxTQURSLE9BQ0csQ0FESDtBQUVOLG1CQUFTLEtBQUssU0FGUixPQUVHLENBRkg7QUFHTixtQkFBUyxLQUFLLFNBSFIsT0FHRyxDQUhIO0FBSU4sbUJBQVMsS0FBSyxTQUFMLE9BQUE7QUFKSCxTQUFSO0FBREYsT0FBQTs7QUFTQSxhQUFBLElBQUEsQ0FBQSxTQUFBLEVBQXVCLFlBQU07QUFDM0IsZUFBQSxPQUFBLENBQUEsS0FBQSxFQUFBLE9BQUEsQ0FBOEIsVUFBQSxLQUFBLEVBQW9CO0FBQUEsY0FBQSxRQUFBLGVBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQTtBQUFBLGNBQWxCLE1BQWtCLE1BQUEsQ0FBQSxDQUFBO0FBQUEsY0FBYixVQUFhLE1BQUEsQ0FBQSxDQUFBOztBQUNoRCx1QkFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQSxPQUFBO0FBREYsU0FBQTtBQURGLE9BQUE7QUFLRDs7OytCQUVXO0FBQ1YsYUFBQSxRQUFBO0FBQ0Q7Ozs7RUE5RjJCLFNBQUEsTzs7a0JBaUdmLGU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hMZixJQUFBLFFBQUEsUUFBQSxhQUFBLENBQUE7O0FBRUEsSUFBQSxxQkFBQSxRQUFBLG9CQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFlBQUEsUUFBQSxpQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVNLGdCOzs7QUFDSixXQUFBLGFBQUEsQ0FBQSxHQUFBLEVBQWtCO0FBQUEsb0JBQUEsSUFBQSxFQUFBLGFBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLGNBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLGFBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7O0FBQUEsUUFBQSxnQkFBQSxJQUFBLFFBQUE7QUFBQSxRQUFBLFdBQUEsa0JBQUEsU0FBQSxHQUFBLEVBQUEsR0FBQSxhQUFBOztBQUtoQixRQUFJLFFBQVEsSUFBSSxNQUFKLFNBQUEsQ0FBYztBQUN4QixnQkFEd0IsUUFBQTtBQUV4QixZQUZ3QixPQUFBO0FBR3hCLGtCQUh3QixJQUFBO0FBSXhCLGdCQUp3QixJQUFBO0FBS3hCLHFCQUFlLE1BQUs7QUFMSSxLQUFkLENBQVo7QUFPQSxRQUFJLE9BQU8sSUFBSSxNQUFKLElBQUEsQ0FBQSxFQUFBLEVBQVgsS0FBVyxDQUFYOztBQUVBLFVBQUEsY0FBQSxDQUFBLElBQUE7QUFDQSxVQUFBLElBQUEsR0FBQSxJQUFBOztBQUVBLFVBQUEsa0JBQUEsR0FBQSxJQUFBOztBQUVBLGVBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxVQUFBLEVBQXdCLE1BQUEsUUFBQSxDQUFBLElBQUEsQ0FBeEIsS0FBd0IsQ0FBeEI7QUFuQmdCLFdBQUEsS0FBQTtBQW9CakI7Ozs7K0JBRVc7QUFDVixVQUFJLGdCQUFnQixLQUFwQixhQUFBO0FBQ0EsV0FBQSxJQUFBLENBQUEsSUFBQSxHQUFpQixHQUFBLE1BQUEsQ0FBVSxXQUFBLE9BQUEsQ0FBVixJQUFBLEVBQUEsT0FBQSxHQUFBLElBQUEsQ0FBakIsSUFBaUIsQ0FBakI7QUFDQSxXQUFBLHFCQUFBOztBQUVBO0FBQ0EsVUFBSSxrQkFBSixDQUFBLEVBQXlCO0FBQ3ZCLGFBQUEsUUFBQSxDQUFBLENBQUE7QUFDRDtBQUNGOzs7d0JBRUksRyxFQUFLO0FBQ1IsaUJBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBO0FBQ0Q7OzsrQkFFVztBQUNWLGFBQUEsZ0JBQUE7QUFDRDs7OztFQXhDeUIsbUJBQUEsTzs7a0JBMkNiLGE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hEZixJQUFBLFFBQUEsUUFBQSxhQUFBLENBQUE7O0FBQ0EsSUFBQSxZQUFBLFFBQUEsWUFBQSxDQUFBOzs7O0FBRUEsSUFBQSxXQUFBLFFBQUEsVUFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxhQUFBLFFBQUEscUJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTSxRQUFRLEtBQWQsS0FBQTs7QUFFQSxJQUFNLGdCQUFnQixDQUNwQixXQURvQixZQUFBLEVBRXBCLFdBRm9CLGNBQUEsRUFHcEIsV0FIRixjQUFzQixDQUF0Qjs7SUFNTSxlOzs7QUFDSixXQUFBLFlBQUEsQ0FBQSxHQUFBLEVBQWtCO0FBQUEsb0JBQUEsSUFBQSxFQUFBLFlBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLGFBQUEsU0FBQSxJQUFBLE9BQUEsY0FBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7O0FBQUEsUUFBQSxTQUFBLElBQUEsTUFBQTs7QUFHaEIsVUFBQSxJQUFBLEdBQUEsR0FBQTs7QUFFQSxVQUFBLFNBQUEsR0FBaUIsTUFBQSxTQUFBLENBQWUsRUFBQyxHQUFELENBQUEsRUFBTyxHQUFQLENBQUEsRUFBYSxPQUE3QyxRQUFnQyxFQUFmLENBQWpCO0FBQ0EsVUFBQSxPQUFBLEdBQWUsTUFBQSxTQUFBLENBQWUsRUFBQyxHQUFELENBQUEsRUFBTyxHQUFQLEVBQUEsRUFBYyxPQUE1QyxRQUE4QixFQUFmLENBQWY7QUFDQSxVQUFBLGFBQUEsQ0FBbUIsRUFBQyxHQUFELENBQUEsRUFBTyxHQUExQixFQUFtQixFQUFuQjs7QUFFQSxVQUFBLGNBQUEsQ0FBQSxNQUFBOztBQUVBLFdBQUEsRUFBQSxDQUFBLGVBQUEsRUFBMkIsTUFBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsRUFBM0IsTUFBMkIsQ0FBM0I7QUFDQSxXQUFBLEVBQUEsQ0FBQSxlQUFBLEVBQTJCLE1BQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEVBQTNCLE1BQTJCLENBQTNCO0FBQ0EsV0FBQSxFQUFBLENBQUEsYUFBQSxFQUF5QixNQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUF6QixNQUF5QixDQUF6QjtBQWJnQixXQUFBLEtBQUE7QUFjakI7Ozs7d0NBRXNCO0FBQUEsVUFBUCxJQUFPLEtBQVAsQ0FBTztBQUFBLFVBQUosSUFBSSxLQUFKLENBQUk7O0FBQ3JCLFVBQUksdUJBQXVCLElBQUksTUFBL0IsU0FBMkIsRUFBM0I7QUFDQSwyQkFBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsV0FBQSxRQUFBLENBQUEsb0JBQUE7QUFDQSxXQUFBLG9CQUFBLEdBQUEsb0JBQUE7QUFDRDs7O3FDQUV5QjtBQUFBLFVBQWQsSUFBYyxNQUFkLENBQWM7QUFBQSxVQUFYLElBQVcsTUFBWCxDQUFXO0FBQUEsVUFBUixRQUFRLE1BQVIsS0FBUTtBQUFBLFVBQUEsUUFDVixLQURVLElBQ1YsQ0FEVSxLQUFBOztBQUV4QixlQUFBLENBQUE7QUFDQSxVQUFJLFNBQUosRUFBQTtBQUNBLFVBQUksWUFBWSxJQUFJLE1BQXBCLFNBQWdCLEVBQWhCO0FBQ0EsZ0JBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUksTUFBTSxJQUFJLFdBQUosT0FBQSxDQUFhLEVBQUMsT0FBRCxLQUFBLEVBQVEsUUFBUixNQUFBLEVBQWdCLE9BQXZDLEtBQXVCLEVBQWIsQ0FBVjtBQUNBLFVBQUksT0FBTyxJQUFJLE1BQUosSUFBQSxDQUFBLFNBQUEsRUFBb0IsS0FBL0IsYUFBK0IsRUFBcEIsQ0FBWDtBQUNBLFdBQUEsQ0FBQSxHQUFTLFFBQVQsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFTLENBQVQsQ0FBQTs7QUFFQSxnQkFBQSxRQUFBLENBQUEsR0FBQTtBQUNBLGdCQUFBLFFBQUEsQ0FBQSxJQUFBO0FBQ0EsV0FBQSxRQUFBLENBQUEsU0FBQTs7QUFFQSxnQkFBQSxHQUFBLEdBQUEsR0FBQTtBQUNBLGdCQUFBLElBQUEsR0FBQSxJQUFBOztBQUVBLGFBQUEsU0FBQTtBQUNEOzs7b0NBRWdCO0FBQUEsVUFBQSxnQkFDUyxLQURULElBQ1MsQ0FEVCxRQUFBO0FBQUEsVUFBQSxXQUFBLGtCQUFBLFNBQUEsR0FBQSxFQUFBLEdBQUEsYUFBQTs7QUFFZixhQUFPLElBQUksTUFBSixTQUFBLENBQWM7QUFDbkIsa0JBRG1CLFFBQUE7QUFFbkIsY0FGbUIsT0FBQTtBQUduQixvQkFBWTtBQUhPLE9BQWQsQ0FBUDtBQUtEOzs7bUNBRWUsTSxFQUFRO0FBQUEsVUFBQSxTQUFBLElBQUE7O0FBQ3RCLFVBQUksSUFBSixDQUFBOztBQUVBO0FBQ0EsVUFBSSxZQUFZLEtBQWhCLG9CQUFBO0FBQ0EsZ0JBQUEsY0FBQTtBQUNBLG9CQUFBLE9BQUEsQ0FBc0IsVUFBQSxhQUFBLEVBQWlCO0FBQ3JDLFlBQUksVUFBVSxPQUFBLFNBQUEsQ0FBZCxhQUFjLENBQWQ7QUFDQSxZQUFBLE9BQUEsRUFBYTtBQUNYLGNBQUksT0FBTyxJQUFJLE1BQUosSUFBQSxDQUFTLFFBQVQsUUFBUyxFQUFULEVBQTZCLE9BQXhDLGFBQXdDLEVBQTdCLENBQVg7QUFDQSxlQUFBLENBQUEsR0FBUyxJQUFLLEtBQWQsTUFBQTs7QUFFQSxvQkFBQSxRQUFBLENBQUEsSUFBQTs7QUFFQTtBQUNEO0FBVEgsT0FBQTtBQVdEOzs7bUNBRWUsTSxFQUFRO0FBQ3RCLFdBQUEsZUFBQSxDQUFxQixLQUFyQixTQUFBLEVBQXFDLE9BQU8sV0FBNUMsY0FBcUMsQ0FBckM7QUFDRDs7O2lDQUVhLE0sRUFBUTtBQUNwQixXQUFBLGVBQUEsQ0FBcUIsS0FBckIsT0FBQSxFQUFtQyxPQUFPLFdBQTFDLFlBQW1DLENBQW5DO0FBQ0Q7OztvQ0FFZ0IsSyxFQUFPLE8sRUFBUztBQUMvQixVQUFJLENBQUosT0FBQSxFQUFjO0FBQ1osY0FBQSxPQUFBLEdBQUEsS0FBQTtBQUNBO0FBQ0Q7QUFDRCxVQUFJLENBQUMsTUFBTCxPQUFBLEVBQW9CO0FBQ2xCLGNBQUEsT0FBQSxHQUFBLElBQUE7QUFDRDs7QUFFRCxZQUFBLElBQUEsQ0FBQSxJQUFBLEdBQWtCLENBQUEsR0FBQSxFQUNYLE1BQU0sUUFESyxLQUNYLENBRFcsRUFBQSxHQUFBLEVBQ2dCLE1BQU0sUUFEdEIsUUFDZ0IsQ0FEaEIsRUFBQSxHQUFBLEVBQUEsSUFBQSxDQUFsQixFQUFrQixDQUFsQjtBQUdBLFlBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQStCLFFBQUEsS0FBQSxHQUFnQixRQUEvQyxRQUFBO0FBQ0Q7OzsrQkFFVztBQUNWLGFBQUEsUUFBQTtBQUNEOzs7O0VBbEd3QixTQUFBLE87O2tCQXFHWixZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuSGYsSUFBQSxRQUFBLFFBQUEsYUFBQSxDQUFBOztBQUVBLElBQUEsV0FBQSxRQUFBLFVBQUEsQ0FBQTs7OztBQUNBLElBQUEsV0FBQSxRQUFBLFdBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxtQjs7O0FBQ0osV0FBQSxnQkFBQSxDQUFBLEdBQUEsRUFBa0I7QUFBQSxvQkFBQSxJQUFBLEVBQUEsZ0JBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLGlCQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSxnQkFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTs7QUFBQSxRQUFBLFFBQUEsSUFBQSxLQUFBO0FBQUEsUUFBQSxTQUFBLElBQUEsTUFBQTtBQUFBLFFBQUEsZUFBQSxJQUFBLE9BQUE7QUFBQSxRQUFBLFVBQUEsaUJBQUEsU0FBQSxHQUFBLENBQUEsR0FBQSxZQUFBO0FBQUEsUUFBQSxzQkFBQSxJQUFBLGNBQUE7QUFBQSxRQUFBLGlCQUFBLHdCQUFBLFNBQUEsR0FBQSxFQUFBLEdBQUEsbUJBQUE7O0FBUWhCLFVBQUEsSUFBQSxHQUFBLEdBQUE7O0FBRUEsVUFBQSxtQkFBQSxDQUNFLFFBQVEsVUFBUixDQUFBLEdBQUEsY0FBQSxHQURGLENBQUEsRUFFRSxTQUFTLFVBRlgsQ0FBQSxFQUFBLE9BQUE7QUFJQSxVQUFBLGNBQUEsQ0FBb0I7QUFDbEI7QUFDQSxTQUFHLFFBQUEsT0FBQSxHQUZlLGNBQUE7QUFHbEIsU0FIa0IsT0FBQTtBQUlsQixhQUprQixjQUFBO0FBS2xCLGNBQVEsU0FBUyxVQUFVO0FBTFQsS0FBcEI7QUFkZ0IsV0FBQSxLQUFBO0FBcUJqQjs7Ozt3Q0FFb0IsSyxFQUFPLE0sRUFBUSxPLEVBQVM7QUFDM0M7QUFDQSxVQUFJLFlBQVksSUFBSSxNQUFwQixTQUFnQixFQUFoQjtBQUNBLGdCQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLE9BQUE7QUFDQSxXQUFBLFFBQUEsQ0FBQSxTQUFBOztBQUVBLFdBQUEsUUFBQSxHQUFnQixJQUFJLE1BQXBCLFNBQWdCLEVBQWhCO0FBQ0EsZ0JBQUEsUUFBQSxDQUFtQixLQUFuQixRQUFBOztBQUVBO0FBQ0EsVUFBSSxPQUFPLElBQUksTUFBZixRQUFXLEVBQVg7QUFDQSxXQUFBLFNBQUEsQ0FBQSxRQUFBO0FBQ0EsV0FBQSxlQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLENBQUE7QUFDQSxXQUFBLE9BQUE7QUFDQSxXQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGdCQUFBLFFBQUEsQ0FBQSxJQUFBOztBQUVBO0FBQ0EsV0FBQSxZQUFBLEdBQUEsS0FBQTtBQUNBLFdBQUEsYUFBQSxHQUFBLE1BQUE7QUFDRDs7O3lDQUV3QztBQUFBLFVBQXZCLElBQXVCLEtBQXZCLENBQXVCO0FBQUEsVUFBcEIsSUFBb0IsS0FBcEIsQ0FBb0I7QUFBQSxVQUFqQixRQUFpQixLQUFqQixLQUFpQjtBQUFBLFVBQVYsU0FBVSxLQUFWLE1BQVU7O0FBQ3ZDLFVBQUksWUFBWSxJQUFJLE1BQXBCLFNBQWdCLEVBQWhCO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQTs7QUFFQSxVQUFJLGNBQWMsSUFBSSxNQUF0QixRQUFrQixFQUFsQjtBQUNBLGtCQUFBLFNBQUEsQ0FBQSxRQUFBO0FBQ0Esa0JBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsT0FBQTs7QUFFQSxVQUFJLFlBQVksSUFBSSxNQUFwQixRQUFnQixFQUFoQjtBQUNBLGdCQUFBLFNBQUEsQ0FBQSxRQUFBO0FBQ0EsZ0JBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBO0FBQ0EsZ0JBQUEsT0FBQTtBQUNBLGdCQUFBLFFBQUEsR0FBcUIsWUFBQTtBQUFBLGVBQUEsV0FBQTtBQUFyQixPQUFBO0FBQ0EsZ0JBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQTZCO0FBQzNCLGtCQUFVO0FBQ1IsYUFEUSxDQUFBO0FBRVIsYUFGUSxDQUFBO0FBR1IsaUJBSFEsS0FBQTtBQUlSLGtCQUFRO0FBSkE7QUFEaUIsT0FBN0I7QUFRQSxnQkFBQSxFQUFBLENBQUEsTUFBQSxFQUFxQixLQUFBLGNBQUEsQ0FBQSxJQUFBLENBQXJCLElBQXFCLENBQXJCOztBQUVBLGdCQUFBLFFBQUEsQ0FBQSxXQUFBO0FBQ0EsZ0JBQUEsUUFBQSxDQUFBLFNBQUE7QUFDQSxXQUFBLFFBQUEsQ0FBQSxTQUFBO0FBQ0EsV0FBQSxTQUFBLEdBQUEsU0FBQTtBQUNBLFdBQUEsV0FBQSxHQUFBLFdBQUE7QUFDRDs7QUFFRDs7OztxQ0FDa0I7QUFDaEIsV0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFrQixDQUFDLEtBQUEsWUFBQSxHQUFvQixLQUFBLFFBQUEsQ0FBckIsTUFBQSxJQUE2QyxLQUEvRCxhQUFBO0FBQ0Q7O0FBRUQ7Ozs7bUNBQ2dCLEssRUFBTztBQUNyQixXQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQTtBQUNEOztBQUVEOzs7OzRDQUN5QjtBQUFBLFVBQUEsd0JBQ1csS0FEWCxJQUNXLENBRFgsa0JBQUE7QUFBQSxVQUFBLHFCQUFBLDBCQUFBLFNBQUEsR0FBQSxFQUFBLEdBQUEscUJBQUE7O0FBR3ZCLFVBQUksS0FBSyxLQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQXVCLEtBQWhDLFlBQUE7QUFDQSxVQUFJLEtBQUosQ0FBQSxFQUFZO0FBQ1YsYUFBQSxTQUFBLENBQUEsTUFBQSxHQUF3QixLQUFBLFdBQUEsQ0FBeEIsTUFBQTtBQURGLE9BQUEsTUFFTztBQUNMLGFBQUEsU0FBQSxDQUFBLE1BQUEsR0FBd0IsS0FBQSxXQUFBLENBQUEsTUFBQSxHQUF4QixFQUFBO0FBQ0E7QUFDQSxhQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQXdCLEtBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQTZCLEtBQUEsU0FBQSxDQUFyRCxNQUF3QixDQUF4QjtBQUNEO0FBQ0QsV0FBQSxTQUFBLENBQUEsa0JBQUE7QUFDRDs7QUFFRDs7Ozs7QUFNQTs2QkFDVSxPLEVBQVM7QUFDakIsVUFBSSxRQUFRLEtBQUEsV0FBQSxDQUFBLE1BQUEsR0FBMEIsS0FBQSxTQUFBLENBQXRDLE1BQUE7QUFDQSxVQUFJLElBQUosQ0FBQTtBQUNBLFVBQUksVUFBSixDQUFBLEVBQWlCO0FBQ2YsWUFBSSxRQUFKLE9BQUE7QUFDRDtBQUNELFdBQUEsU0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsV0FBQSxjQUFBO0FBQ0Q7OzsrQkFVVztBQUNWLGFBQUEsUUFBQTtBQUNEOzs7d0JBMUJvQjtBQUNuQixVQUFJLFFBQVEsS0FBQSxXQUFBLENBQUEsTUFBQSxHQUEwQixLQUFBLFNBQUEsQ0FBdEMsTUFBQTtBQUNBLGFBQU8sVUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFrQixLQUFBLFNBQUEsQ0FBQSxDQUFBLEdBQXpCLEtBQUE7QUFDRDs7O3dCQWFrQjtBQUNqQixhQUFPLEtBQVAsWUFBQTtBQUNEOzs7d0JBRW1CO0FBQ2xCLGFBQU8sS0FBUCxhQUFBO0FBQ0Q7Ozs7RUE5SDRCLFNBQUEsTzs7a0JBcUloQixnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUlmLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7QUFDQSxJQUFBLFVBQUEsUUFBQSxlQUFBLENBQUE7Ozs7QUFFQSxJQUFBLGNBQUEsUUFBQSxZQUFBLENBQUE7Ozs7QUFDQSxJQUFBLFdBQUEsUUFBQSxtQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNLFdBQVcsQ0FBQyxTQUFELEtBQUEsRUFBUSxTQUFSLElBQUEsRUFBYyxTQUFkLEVBQUEsRUFBa0IsU0FBbkMsSUFBaUIsQ0FBakI7O0lBRU0sNkI7OztBQUNKLFdBQUEsMEJBQUEsQ0FBQSxJQUFBLEVBQStCO0FBQUEsUUFBaEIsSUFBZ0IsS0FBaEIsQ0FBZ0I7QUFBQSxRQUFiLElBQWEsS0FBYixDQUFhO0FBQUEsUUFBVixTQUFVLEtBQVYsTUFBVTs7QUFBQSxvQkFBQSxJQUFBLEVBQUEsMEJBQUE7O0FBQUEsUUFBQSxRQUFBLDJCQUFBLElBQUEsRUFBQSxDQUFBLDJCQUFBLFNBQUEsSUFBQSxPQUFBLGNBQUEsQ0FBQSwwQkFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUU3QixVQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBSSxZQUFZLElBQUksTUFBcEIsUUFBZ0IsRUFBaEI7QUFDQSxjQUFBLFNBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQTtBQUNBLGNBQUEsVUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQTtBQUNBLGNBQUEsT0FBQTtBQUNBLFVBQUEsUUFBQSxDQUFBLFNBQUE7QUFDQSxVQUFBLE1BQUEsR0FBQSxNQUFBOztBQUVBLFVBQUEsVUFBQTtBQVg2QixXQUFBLEtBQUE7QUFZOUI7Ozs7aUNBRWE7QUFDWixXQUFBLFdBQUEsR0FBQSxJQUFBO0FBQ0EsVUFBSSxJQUFJLEtBQUEsT0FBQSxDQUFBLElBQUEsQ0FBUixJQUFRLENBQVI7QUFDQSxXQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUE7QUFDRDs7OzRCQUVRLEMsRUFBRztBQUNWLFVBQUksT0FBTyxFQUFYLElBQUE7QUFDQSxVQUFJLGNBQUosS0FBQTtBQUNBLGNBQUEsSUFBQTtBQUNFLGFBQUEsWUFBQTtBQUNFLGVBQUEsSUFBQSxHQUFZLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBWixLQUFZLEVBQVo7QUFDQSxlQUFBLGVBQUE7QUFDQSxlQUFBLGNBQUEsR0FBc0I7QUFDcEIsZUFBRyxLQURpQixDQUFBO0FBRXBCLGVBQUcsS0FBSztBQUZZLFdBQXRCO0FBSUE7QUFDRixhQUFBLFVBQUE7QUFDQSxhQUFBLGlCQUFBO0FBQ0UsY0FBSSxLQUFKLElBQUEsRUFBZTtBQUNiLGlCQUFBLElBQUEsR0FBQSxLQUFBO0FBQ0EsaUJBQUEsZ0JBQUE7QUFDQSxpQkFBQSxXQUFBO0FBQ0Q7QUFDRDtBQUNGLGFBQUEsV0FBQTtBQUNFLGNBQUksQ0FBQyxLQUFMLElBQUEsRUFBZ0I7QUFDZCwwQkFBQSxJQUFBO0FBQ0E7QUFDRDtBQUNELGVBQUEsU0FBQSxDQUFlLEVBQUEsSUFBQSxDQUFBLGdCQUFBLENBQWYsSUFBZSxDQUFmO0FBQ0E7QUF2Qko7QUF5QkEsVUFBSSxDQUFKLFdBQUEsRUFBa0I7QUFDaEIsVUFBQSxlQUFBO0FBQ0Q7QUFDRjs7O3NDQUVrQjtBQUNqQixVQUFJLFlBQVksSUFBSSxNQUFwQixRQUFnQixFQUFoQjtBQUNBLGdCQUFBLFNBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQTtBQUNBLGdCQUFBLFVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxPQUFBO0FBQ0EsV0FBQSxRQUFBLENBQUEsU0FBQTtBQUNBLFdBQUEsU0FBQSxHQUFBLFNBQUE7QUFDRDs7O3VDQUVtQjtBQUNsQixXQUFBLFdBQUEsQ0FBaUIsS0FBakIsU0FBQTtBQUNBLFdBQUEsU0FBQSxDQUFBLE9BQUE7QUFDRDs7OzhCQUVVLFEsRUFBVTtBQUNuQixXQUFBLFdBQUE7QUFDQTtBQUNBLFVBQUksWUFBSixFQUFBOztBQUVBLFVBQUksU0FBUyxTQUFBLE9BQUEsQ0FBQSxTQUFBLENBQWIsUUFBYSxDQUFiO0FBQ0EsVUFBSSxNQUFNLE9BQVYsR0FBQTtBQUNBLFVBQUksTUFBTSxPQUFWLE1BQUE7O0FBRUEsVUFBSSxNQUFKLFNBQUEsRUFBcUI7QUFDbkI7QUFDRDtBQUNELFVBQUksU0FBUyxLQUFBLEdBQUEsQ0FBYixHQUFhLENBQWI7QUFDQSxVQUFJLEtBQUssU0FBQSxJQUFBLEdBQWdCLFNBQWhCLEtBQUEsR0FBeUIsU0FBQSxLQUFBLEdBQWlCLFNBQWpCLElBQUEsR0FBbEMsS0FBQTtBQUNBLFVBQUksS0FBSyxTQUFBLElBQUEsSUFBaUIsU0FBakIsS0FBQSxHQUFBLEtBQUEsR0FBMkMsTUFBQSxDQUFBLEdBQVUsU0FBVixFQUFBLEdBQWUsU0FBbkUsSUFBQTs7QUFFQSxVQUFJLE1BQUosRUFBQSxFQUFjO0FBQ1osWUFBQSxFQUFBLEVBQVE7QUFDTix1QkFBQSxPQUFBLENBQUEsUUFBQSxDQUFBLEVBQUE7QUFDRDtBQUNELFlBQUEsRUFBQSxFQUFRO0FBQ04sdUJBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBO0FBQ0Q7QUFDRCxlQUFBLGNBQUEsQ0FBc0IsS0FBQSxNQUFBLEdBQXRCLEdBQUE7QUFDQSxhQUFBLFNBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUNFLE9BREYsQ0FBQSxFQUVFLE9BRkYsQ0FBQTtBQUlEO0FBQ0Y7OztrQ0FFYztBQUNiLGVBQUEsT0FBQSxDQUFpQixVQUFBLEdBQUEsRUFBQTtBQUFBLGVBQU8sYUFBQSxPQUFBLENBQUEsVUFBQSxDQUFQLEdBQU8sQ0FBUDtBQUFqQixPQUFBO0FBQ0Q7OzsrQkFFVztBQUNWLGFBQUEsNEJBQUE7QUFDRDs7OztFQTVHc0MsTUFBQSxTOztrQkErRzFCLDBCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2SGYsSUFBQSxRQUFBLFFBQUEsYUFBQSxDQUFBOztBQUNBLElBQUEsVUFBQSxRQUFBLGVBQUEsQ0FBQTs7OztBQUVBLElBQUEsc0JBQUEsUUFBQSwyQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVNLDZCOzs7QUFDSixXQUFBLDBCQUFBLENBQUEsSUFBQSxFQUFzQztBQUFBLFFBQXZCLElBQXVCLEtBQXZCLENBQXVCO0FBQUEsUUFBcEIsSUFBb0IsS0FBcEIsQ0FBb0I7QUFBQSxRQUFqQixRQUFpQixLQUFqQixLQUFpQjtBQUFBLFFBQVYsU0FBVSxLQUFWLE1BQVU7O0FBQUEsb0JBQUEsSUFBQSxFQUFBLDBCQUFBOztBQUFBLFFBQUEsUUFBQSwyQkFBQSxJQUFBLEVBQUEsQ0FBQSwyQkFBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsMEJBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFcEMsVUFBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUksWUFBWSxJQUFJLE1BQXBCLFFBQWdCLEVBQWhCO0FBQ0EsY0FBQSxTQUFBLENBQUEsUUFBQSxFQUFBLEdBQUE7QUFDQSxjQUFBLFFBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBO0FBQ0EsY0FBQSxPQUFBO0FBQ0EsVUFBQSxRQUFBLENBQUEsU0FBQTs7QUFFQSxVQUFBLFVBQUE7QUFWb0MsV0FBQSxLQUFBO0FBV3JDOzs7O2lDQUVhO0FBQ1osV0FBQSxNQUFBLEdBQWMsSUFBSSxTQUFKLE9BQUEsQ0FBVyxLQUFBLEtBQUEsR0FBWCxDQUFBLEVBQTJCLEtBQUEsTUFBQSxHQUF6QyxDQUFjLENBQWQ7QUFDQSxXQUFBLFdBQUEsR0FBQSxJQUFBO0FBQ0EsVUFBSSxJQUFJLEtBQUEsT0FBQSxDQUFBLElBQUEsQ0FBUixJQUFRLENBQVI7QUFDQSxXQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtBQUNEOzs7NEJBRVEsQyxFQUFHO0FBQ1YsVUFBSSxVQUFVLEVBQUEsSUFBQSxDQUFBLGdCQUFBLENBQWQsSUFBYyxDQUFkO0FBQ0EsVUFBSSxTQUFTLFNBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxDQUE4QixLQUEzQyxNQUFhLENBQWI7QUFDQSwyQkFBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxNQUFBO0FBQ0EsMkJBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBO0FBQ0EsUUFBQSxlQUFBO0FBQ0Q7OzsrQkFFVztBQUNWLGFBQUEsNEJBQUE7QUFDRDs7OztFQS9Cc0MsTUFBQSxTOztrQkFrQzFCLDBCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2Q2YsSUFBQSxRQUFBLFFBQUEsYUFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVNLFc7OztBQUNKLFdBQUEsUUFBQSxDQUFBLEdBQUEsRUFBa0I7QUFBQSxvQkFBQSxJQUFBLEVBQUEsUUFBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsU0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsUUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUFBLFFBQUEsU0FBQSxJQUFBLENBQUE7QUFBQSxRQUFBLElBQUEsV0FBQSxTQUFBLEdBQUEsQ0FBQSxHQUFBLE1BQUE7QUFBQSxRQUFBLFNBQUEsSUFBQSxDQUFBO0FBQUEsUUFBQSxJQUFBLFdBQUEsU0FBQSxHQUFBLENBQUEsR0FBQSxNQUFBO0FBQUEsUUFBQSxRQUFBLElBQUEsS0FBQTtBQUFBLFFBQUEsU0FBQSxJQUFBLE1BQUE7QUFBQSxRQUFBLFFBQUEsSUFBQSxLQUFBOztBQUloQjs7QUFDQSxRQUFJLFVBQVUsSUFBSSxNQUFsQixRQUFjLEVBQWQ7QUFDQSxZQUFBLFNBQUEsQ0FBQSxRQUFBO0FBQ0EsWUFBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxRQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQTtBQUNBLFlBQUEsT0FBQTs7QUFFQTtBQUNBLFFBQUksT0FBTyxJQUFJLE1BQWYsUUFBVyxFQUFYO0FBQ0EsU0FBQSxTQUFBLENBQUEsUUFBQTtBQUNBLFNBQUEsUUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUE7QUFDQSxTQUFBLE9BQUE7QUFDQSxVQUFBLFFBQUEsQ0FBQSxJQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsSUFBQTs7QUFFQSxVQUFBLFFBQUEsQ0FBQSxPQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsT0FBQTs7QUFFQTtBQUNBLFVBQUEsVUFBQSxDQUFnQixFQUFDLE9BQUQsS0FBQSxFQUFRLE9BQVIsS0FBQSxFQUFlLFFBQS9CLE1BQWdCLEVBQWhCO0FBQ0EsVUFBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxJQUFBLEdBQUEsR0FBQTs7QUFFQSxVQUFBLEVBQUEsQ0FBQSxjQUFBLEVBQXdCLE1BQUEsTUFBQSxDQUFBLElBQUEsQ0FBeEIsS0FBd0IsQ0FBeEI7QUEzQmdCLFdBQUEsS0FBQTtBQTRCakI7Ozs7MkJBRU8sSSxFQUFNO0FBQ1osV0FBQSxXQUFBLENBQWlCLEtBQWpCLFVBQUE7QUFDQSxXQUFBLFVBQUEsQ0FBQSxPQUFBO0FBRlksVUFBQSxPQUdtQixLQUhuQixJQUFBO0FBQUEsVUFBQSxRQUFBLEtBQUEsS0FBQTtBQUFBLFVBQUEsUUFBQSxLQUFBLEtBQUE7QUFBQSxVQUFBLFNBQUEsS0FBQSxNQUFBOztBQUlaLFdBQUEsVUFBQSxDQUFnQjtBQUNkLGVBRGMsS0FBQTtBQUVkLGVBQU8sUUFGTyxJQUFBO0FBR2QsZ0JBQUE7QUFIYyxPQUFoQjtBQUtEOzs7cUNBRW1DO0FBQUEsVUFBdkIsUUFBdUIsS0FBdkIsS0FBdUI7QUFBQSxVQUFoQixRQUFnQixLQUFoQixLQUFnQjtBQUFBLFVBQVQsU0FBUyxLQUFULE1BQVM7O0FBQ2xDLFVBQUksYUFBYSxJQUFJLE1BQXJCLFFBQWlCLEVBQWpCO0FBQ0EsaUJBQUEsU0FBQSxDQUFBLEtBQUE7QUFDQSxpQkFBQSxRQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQTtBQUNBLGlCQUFBLE9BQUE7QUFDQSxpQkFBQSxJQUFBLEdBQWtCLEtBQWxCLE9BQUE7O0FBRUEsV0FBQSxRQUFBLENBQUEsVUFBQTtBQUNBLFdBQUEsVUFBQSxHQUFBLFVBQUE7QUFDRDs7OztFQW5Eb0IsTUFBQSxTOztrQkFzRFIsUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeERmLElBQUEsUUFBQSxRQUFBLGFBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxTOzs7QUFDSixXQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQXNDO0FBQUEsUUFBdkIsSUFBdUIsS0FBdkIsQ0FBdUI7QUFBQSxRQUFwQixJQUFvQixLQUFwQixDQUFvQjtBQUFBLFFBQWpCLFFBQWlCLEtBQWpCLEtBQWlCO0FBQUEsUUFBVixTQUFVLEtBQVYsTUFBVTs7QUFBQSxvQkFBQSxJQUFBLEVBQUEsTUFBQTs7QUFBQSxRQUFBLFFBQUEsMkJBQUEsSUFBQSxFQUFBLENBQUEsT0FBQSxTQUFBLElBQUEsT0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVwQyxVQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBSSxZQUFKLENBQUE7O0FBRUEsUUFBSSxXQUFXLElBQUksTUFBbkIsUUFBZSxFQUFmO0FBQ0EsYUFBQSxTQUFBLENBQUEsUUFBQTtBQUNBLGFBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLGFBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBO0FBS0EsYUFBQSxPQUFBO0FBQ0EsVUFBQSxRQUFBLENBQUEsUUFBQTtBQWZvQyxXQUFBLEtBQUE7QUFnQnJDOzs7OytCQUVXO0FBQ1YsYUFBQSxRQUFBO0FBQ0Q7Ozs7RUFyQmtCLE1BQUEsUzs7a0JBd0JOLE07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxQmYsSUFBTSxNQUFNLE9BQVosS0FBWSxDQUFaOztBQUVBLFNBQUEsZ0JBQUEsR0FBNkI7QUFDM0IsT0FBQSxJQUFBLEdBQUEsS0FBQTtBQUNBLE9BQUEsV0FBQSxHQUFBLElBQUE7QUFDQSxNQUFJLElBQUksU0FBQSxJQUFBLENBQVIsSUFBUSxDQUFSO0FBQ0EsT0FBQSxFQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7QUFDQSxPQUFBLEVBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtBQUNBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsT0FBQSxFQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO0FBQ0EsT0FBQSxFQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxPQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsT0FBQSxFQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBO0FBQ0Q7O0FBRUQsU0FBQSxRQUFBLENBQUEsQ0FBQSxFQUFzQjtBQUNwQixNQUFJLE9BQU8sRUFBWCxJQUFBO0FBQ0EsTUFBSSxjQUFKLEtBQUE7QUFDQSxVQUFBLElBQUE7QUFDRSxTQUFBLFlBQUE7QUFDQSxTQUFBLFdBQUE7QUFDRSxXQUFBLElBQUEsR0FBWSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQVosS0FBWSxFQUFaO0FBQ0EsV0FBQSxjQUFBLEdBQXNCO0FBQ3BCLFdBQUcsS0FEaUIsQ0FBQTtBQUVwQixXQUFHLEtBQUs7QUFGWSxPQUF0QjtBQUlBO0FBQ0YsU0FBQSxVQUFBO0FBQ0EsU0FBQSxpQkFBQTtBQUNBLFNBQUEsU0FBQTtBQUNBLFNBQUEsZ0JBQUE7QUFDRSxXQUFBLElBQUEsR0FBQSxLQUFBO0FBQ0E7QUFDRixTQUFBLFdBQUE7QUFDQSxTQUFBLFdBQUE7QUFDRSxVQUFJLENBQUMsS0FBTCxJQUFBLEVBQWdCO0FBQ2Qsc0JBQUEsSUFBQTtBQUNBO0FBQ0Q7QUFDRCxVQUFJLFdBQVcsRUFBQSxJQUFBLENBQUEsTUFBQSxDQUFmLEtBQWUsRUFBZjtBQUNBLFdBQUEsUUFBQSxDQUFBLEdBQUEsQ0FDRSxLQUFBLGNBQUEsQ0FBQSxDQUFBLEdBQXdCLFNBQXhCLENBQUEsR0FBcUMsS0FBQSxJQUFBLENBRHZDLENBQUEsRUFFRSxLQUFBLGNBQUEsQ0FBQSxDQUFBLEdBQXdCLFNBQXhCLENBQUEsR0FBcUMsS0FBQSxJQUFBLENBRnZDLENBQUE7QUFJQSwwQkFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLFdBQUEsSUFBQSxDQVhGLE1BV0UsRUFYRixDQVdvQjtBQUNsQjtBQTVCSjtBQThCQSxNQUFJLENBQUosV0FBQSxFQUFrQjtBQUNoQixNQUFBLGVBQUE7QUFDRDtBQUNGOztBQUVEO0FBQ0EsU0FBQSxtQkFBQSxHQUFnQztBQUFBLE1BQUEsT0FDK0IsS0FEL0IsR0FDK0IsQ0FEL0I7QUFBQSxNQUFBLGFBQUEsS0FBQSxLQUFBO0FBQUEsTUFBQSxRQUFBLGVBQUEsU0FBQSxHQUNoQixLQURnQixLQUFBLEdBQUEsVUFBQTtBQUFBLE1BQUEsY0FBQSxLQUFBLE1BQUE7QUFBQSxNQUFBLFNBQUEsZ0JBQUEsU0FBQSxHQUNLLEtBREwsTUFBQSxHQUFBLFdBQUE7QUFBQSxNQUFBLFdBQUEsS0FBQSxRQUFBOztBQUU5QixPQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBUyxLQUFULENBQUEsRUFBaUIsU0FBMUIsQ0FBUyxDQUFUO0FBQ0EsT0FBQSxDQUFBLEdBQVMsS0FBQSxHQUFBLENBQVMsS0FBVCxDQUFBLEVBQWlCLFNBQUEsQ0FBQSxHQUFhLFNBQWIsS0FBQSxHQUExQixLQUFTLENBQVQ7QUFDQSxPQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBUyxLQUFULENBQUEsRUFBaUIsU0FBMUIsQ0FBUyxDQUFUO0FBQ0EsT0FBQSxDQUFBLEdBQVMsS0FBQSxHQUFBLENBQVMsS0FBVCxDQUFBLEVBQWlCLFNBQUEsQ0FBQSxHQUFhLFNBQWIsTUFBQSxHQUExQixNQUFTLENBQVQ7QUFDRDs7SUFDSyxVOzs7Ozs7OztBQUNKOzs7Ozs7Ozs4QkFRa0IsYSxFQUFlLEcsRUFBSztBQUNwQyxvQkFBQSxHQUFBLElBQUEsR0FBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQSxhQUFBO0FBQ0Esb0JBQUEsa0JBQUEsR0FBQSxtQkFBQTtBQUNEOzs7Ozs7a0JBR1ksTyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgb2JqZWN0Q3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBvYmplY3RDcmVhdGVQb2x5ZmlsbFxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBvYmplY3RLZXlzUG9seWZpbGxcbnZhciBiaW5kID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgfHwgZnVuY3Rpb25CaW5kUG9seWZpbGxcblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfZXZlbnRzJykpIHtcbiAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxudmFyIGhhc0RlZmluZVByb3BlcnR5O1xudHJ5IHtcbiAgdmFyIG8gPSB7fTtcbiAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sICd4JywgeyB2YWx1ZTogMCB9KTtcbiAgaGFzRGVmaW5lUHJvcGVydHkgPSBvLnggPT09IDA7XG59IGNhdGNoIChlcnIpIHsgaGFzRGVmaW5lUHJvcGVydHkgPSBmYWxzZSB9XG5pZiAoaGFzRGVmaW5lUHJvcGVydHkpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50RW1pdHRlciwgJ2RlZmF1bHRNYXhMaXN0ZW5lcnMnLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGUgaW5wdXQgaXMgYSBwb3NpdGl2ZSBudW1iZXIgKHdob3NlIHZhbHVlIGlzIHplcm8gb3JcbiAgICAgIC8vIGdyZWF0ZXIgYW5kIG5vdCBhIE5hTikuXG4gICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ251bWJlcicgfHwgYXJnIDwgMCB8fCBhcmcgIT09IGFyZylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJkZWZhdWx0TWF4TGlzdGVuZXJzXCIgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICAgICAgZGVmYXVsdE1heExpc3RlbmVycyA9IGFyZztcbiAgICB9XG4gIH0pO1xufSBlbHNlIHtcbiAgRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xufVxuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiblwiIGFyZ3VtZW50IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiAkZ2V0TWF4TGlzdGVuZXJzKHRoYXQpIHtcbiAgaWYgKHRoYXQuX21heExpc3RlbmVycyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgcmV0dXJuIHRoYXQuX21heExpc3RlbmVycztcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiAkZ2V0TWF4TGlzdGVuZXJzKHRoaXMpO1xufTtcblxuLy8gVGhlc2Ugc3RhbmRhbG9uZSBlbWl0KiBmdW5jdGlvbnMgYXJlIHVzZWQgdG8gb3B0aW1pemUgY2FsbGluZyBvZiBldmVudFxuLy8gaGFuZGxlcnMgZm9yIGZhc3QgY2FzZXMgYmVjYXVzZSBlbWl0KCkgaXRzZWxmIG9mdGVuIGhhcyBhIHZhcmlhYmxlIG51bWJlciBvZlxuLy8gYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYmVjYXVzZSBvZiB0aGF0LiBUaGVzZSBmdW5jdGlvbnMgYWx3YXlzIGhhdmVcbi8vIHRoZSBzYW1lIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIHRodXMgZG8gbm90IGdldCBkZW9wdGltaXplZCwgc28gdGhlIGNvZGVcbi8vIGluc2lkZSB0aGVtIGNhbiBleGVjdXRlIGZhc3Rlci5cbmZ1bmN0aW9uIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHNlbGYpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRPbmUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSkge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMiwgYXJnMykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmdzKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuYXBwbHkoc2VsZiwgYXJncyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBldmVudHM7XG4gIHZhciBkb0Vycm9yID0gKHR5cGUgPT09ICdlcnJvcicpO1xuXG4gIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgaWYgKGV2ZW50cylcbiAgICBkb0Vycm9yID0gKGRvRXJyb3IgJiYgZXZlbnRzLmVycm9yID09IG51bGwpO1xuICBlbHNlIGlmICghZG9FcnJvcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAoZG9FcnJvcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSlcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5oYW5kbGVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBoYW5kbGVyID0gZXZlbnRzW3R5cGVdO1xuXG4gIGlmICghaGFuZGxlcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGlzRm4gPSB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJztcbiAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgc3dpdGNoIChsZW4pIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICBjYXNlIDE6XG4gICAgICBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIGVtaXRPbmUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzpcbiAgICAgIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA0OlxuICAgICAgZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdLCBhcmd1bWVudHNbM10pO1xuICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICBkZWZhdWx0OlxuICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgdmFyIG07XG4gIHZhciBldmVudHM7XG4gIHZhciBleGlzdGluZztcblxuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgaWYgKCFldmVudHMpIHtcbiAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0YXJnZXQuX2V2ZW50c0NvdW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgICBpZiAoZXZlbnRzLm5ld0xpc3RlbmVyKSB7XG4gICAgICB0YXJnZXQuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgICAgIC8vIFJlLWFzc2lnbiBgZXZlbnRzYCBiZWNhdXNlIGEgbmV3TGlzdGVuZXIgaGFuZGxlciBjb3VsZCBoYXZlIGNhdXNlZCB0aGVcbiAgICAgIC8vIHRoaXMuX2V2ZW50cyB0byBiZSBhc3NpZ25lZCB0byBhIG5ldyBvYmplY3RcbiAgICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICAgIH1cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIGlmICghZXhpc3RpbmcpIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICAgICsrdGFyZ2V0Ll9ldmVudHNDb3VudDtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGV4aXN0aW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID1cbiAgICAgICAgICBwcmVwZW5kID8gW2xpc3RlbmVyLCBleGlzdGluZ10gOiBbZXhpc3RpbmcsIGxpc3RlbmVyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgICAgaWYgKHByZXBlbmQpIHtcbiAgICAgICAgZXhpc3RpbmcudW5zaGlmdChsaXN0ZW5lcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleGlzdGluZy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIGlmICghZXhpc3Rpbmcud2FybmVkKSB7XG4gICAgICBtID0gJGdldE1heExpc3RlbmVycyh0YXJnZXQpO1xuICAgICAgaWYgKG0gJiYgbSA+IDAgJiYgZXhpc3RpbmcubGVuZ3RoID4gbSkge1xuICAgICAgICBleGlzdGluZy53YXJuZWQgPSB0cnVlO1xuICAgICAgICB2YXIgdyA9IG5ldyBFcnJvcignUG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSBsZWFrIGRldGVjdGVkLiAnICtcbiAgICAgICAgICAgIGV4aXN0aW5nLmxlbmd0aCArICcgXCInICsgU3RyaW5nKHR5cGUpICsgJ1wiIGxpc3RlbmVycyAnICtcbiAgICAgICAgICAgICdhZGRlZC4gVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gJyArXG4gICAgICAgICAgICAnaW5jcmVhc2UgbGltaXQuJyk7XG4gICAgICAgIHcubmFtZSA9ICdNYXhMaXN0ZW5lcnNFeGNlZWRlZFdhcm5pbmcnO1xuICAgICAgICB3LmVtaXR0ZXIgPSB0YXJnZXQ7XG4gICAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICAgIHcuY291bnQgPSBleGlzdGluZy5sZW5ndGg7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCcgJiYgY29uc29sZS53YXJuKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCclczogJXMnLCB3Lm5hbWUsIHcubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24gYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZExpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIHRydWUpO1xuICAgIH07XG5cbmZ1bmN0aW9uIG9uY2VXcmFwcGVyKCkge1xuICBpZiAoIXRoaXMuZmlyZWQpIHtcbiAgICB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMud3JhcEZuKTtcbiAgICB0aGlzLmZpcmVkID0gdHJ1ZTtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCk7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSk7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0sXG4gICAgICAgICAgICBhcmd1bWVudHNbMl0pO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSlcbiAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB0aGlzLmxpc3RlbmVyLmFwcGx5KHRoaXMudGFyZ2V0LCBhcmdzKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHN0YXRlID0geyBmaXJlZDogZmFsc2UsIHdyYXBGbjogdW5kZWZpbmVkLCB0YXJnZXQ6IHRhcmdldCwgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyIH07XG4gIHZhciB3cmFwcGVkID0gYmluZC5jYWxsKG9uY2VXcmFwcGVyLCBzdGF0ZSk7XG4gIHdyYXBwZWQubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgc3RhdGUud3JhcEZuID0gd3JhcHBlZDtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIHRoaXMub24odHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kT25jZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kT25jZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB0aGlzLnByZXBlbmRMaXN0ZW5lcih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbi8vIEVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZiBhbmQgb25seSBpZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGxpc3QsIGV2ZW50cywgcG9zaXRpb24sIGksIG9yaWdpbmFsTGlzdGVuZXI7XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBsaXN0ID0gZXZlbnRzW3R5cGVdO1xuICAgICAgaWYgKCFsaXN0KVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8IGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3QubGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaXN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBvc2l0aW9uID0gLTE7XG5cbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fCBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgb3JpZ2luYWxMaXN0ZW5lciA9IGxpc3RbaV0ubGlzdGVuZXI7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMClcbiAgICAgICAgICBsaXN0LnNoaWZ0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzcGxpY2VPbmUobGlzdCwgcG9zaXRpb24pO1xuXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSlcbiAgICAgICAgICBldmVudHNbdHlwZV0gPSBsaXN0WzBdO1xuXG4gICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIG9yaWdpbmFsTGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsIGV2ZW50cywgaTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gICAgICBpZiAoIWV2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRzW3R5cGVdKSB7XG4gICAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IG9iamVjdEtleXMoZXZlbnRzKTtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbGlzdGVuZXJzID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gICAgICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgICAgICAvLyBMSUZPIG9yZGVyXG4gICAgICAgIGZvciAoaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5mdW5jdGlvbiBfbGlzdGVuZXJzKHRhcmdldCwgdHlwZSwgdW53cmFwKSB7XG4gIHZhciBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcblxuICBpZiAoIWV2ZW50cylcbiAgICByZXR1cm4gW107XG5cbiAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG4gIGlmICghZXZsaXN0ZW5lcilcbiAgICByZXR1cm4gW107XG5cbiAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB1bndyYXAgPyBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXSA6IFtldmxpc3RlbmVyXTtcblxuICByZXR1cm4gdW53cmFwID8gdW53cmFwTGlzdGVuZXJzKGV2bGlzdGVuZXIpIDogYXJyYXlDbG9uZShldmxpc3RlbmVyLCBldmxpc3RlbmVyLmxlbmd0aCk7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgdHJ1ZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJhd0xpc3RlbmVycyA9IGZ1bmN0aW9uIHJhd0xpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIubGlzdGVuZXJDb3VudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGxpc3RlbmVyQ291bnQuY2FsbChlbWl0dGVyLCB0eXBlKTtcbiAgfVxufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gbGlzdGVuZXJDb3VudDtcbmZ1bmN0aW9uIGxpc3RlbmVyQ291bnQodHlwZSkge1xuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuXG4gIGlmIChldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcblxuICAgIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmIChldmxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHJldHVybiB0aGlzLl9ldmVudHNDb3VudCA+IDAgPyBSZWZsZWN0Lm93bktleXModGhpcy5fZXZlbnRzKSA6IFtdO1xufTtcblxuLy8gQWJvdXQgMS41eCBmYXN0ZXIgdGhhbiB0aGUgdHdvLWFyZyB2ZXJzaW9uIG9mIEFycmF5I3NwbGljZSgpLlxuZnVuY3Rpb24gc3BsaWNlT25lKGxpc3QsIGluZGV4KSB7XG4gIGZvciAodmFyIGkgPSBpbmRleCwgayA9IGkgKyAxLCBuID0gbGlzdC5sZW5ndGg7IGsgPCBuOyBpICs9IDEsIGsgKz0gMSlcbiAgICBsaXN0W2ldID0gbGlzdFtrXTtcbiAgbGlzdC5wb3AoKTtcbn1cblxuZnVuY3Rpb24gYXJyYXlDbG9uZShhcnIsIG4pIHtcbiAgdmFyIGNvcHkgPSBuZXcgQXJyYXkobik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKVxuICAgIGNvcHlbaV0gPSBhcnJbaV07XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiB1bndyYXBMaXN0ZW5lcnMoYXJyKSB7XG4gIHZhciByZXQgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmV0Lmxlbmd0aDsgKytpKSB7XG4gICAgcmV0W2ldID0gYXJyW2ldLmxpc3RlbmVyIHx8IGFycltpXTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBvYmplY3RDcmVhdGVQb2x5ZmlsbChwcm90bykge1xuICB2YXIgRiA9IGZ1bmN0aW9uKCkge307XG4gIEYucHJvdG90eXBlID0gcHJvdG87XG4gIHJldHVybiBuZXcgRjtcbn1cbmZ1bmN0aW9uIG9iamVjdEtleXNQb2x5ZmlsbChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIgayBpbiBvYmopIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrKSkge1xuICAgIGtleXMucHVzaChrKTtcbiAgfVxuICByZXR1cm4gaztcbn1cbmZ1bmN0aW9uIGZ1bmN0aW9uQmluZFBvbHlmaWxsKGNvbnRleHQpIHtcbiAgdmFyIGZuID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cbiIsIlxudmFyIEtleWJvYXJkID0gcmVxdWlyZSgnLi9saWIva2V5Ym9hcmQnKTtcbnZhciBMb2NhbGUgICA9IHJlcXVpcmUoJy4vbGliL2xvY2FsZScpO1xudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9saWIva2V5LWNvbWJvJyk7XG5cbnZhciBrZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xuXG5rZXlib2FyZC5zZXRMb2NhbGUoJ3VzJywgcmVxdWlyZSgnLi9sb2NhbGVzL3VzJykpO1xuXG5leHBvcnRzICAgICAgICAgID0gbW9kdWxlLmV4cG9ydHMgPSBrZXlib2FyZDtcbmV4cG9ydHMuS2V5Ym9hcmQgPSBLZXlib2FyZDtcbmV4cG9ydHMuTG9jYWxlICAgPSBMb2NhbGU7XG5leHBvcnRzLktleUNvbWJvID0gS2V5Q29tYm87XG4iLCJcbmZ1bmN0aW9uIEtleUNvbWJvKGtleUNvbWJvU3RyKSB7XG4gIHRoaXMuc291cmNlU3RyID0ga2V5Q29tYm9TdHI7XG4gIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gIHRoaXMua2V5TmFtZXMgID0gdGhpcy5zdWJDb21ib3MucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIG5leHRTdWJDb21ibykge1xuICAgIHJldHVybiBtZW1vLmNvbmNhdChuZXh0U3ViQ29tYm8pO1xuICB9LCBbXSk7XG59XG5cbi8vIFRPRE86IEFkZCBzdXBwb3J0IGZvciBrZXkgY29tYm8gc2VxdWVuY2VzXG5LZXlDb21iby5zZXF1ZW5jZURlbGltaW5hdG9yID0gJz4+JztcbktleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgICAgPSAnPic7XG5LZXlDb21iby5rZXlEZWxpbWluYXRvciAgICAgID0gJysnO1xuXG5LZXlDb21iby5wYXJzZUNvbWJvU3RyID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIpIHtcbiAgdmFyIHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIHZhciBjb21ibyAgICAgICAgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMCA7IGkgPCBzdWJDb21ib1N0cnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBjb21iby5wdXNoKEtleUNvbWJvLl9zcGxpdFN0cihzdWJDb21ib1N0cnNbaV0sIEtleUNvbWJvLmtleURlbGltaW5hdG9yKSk7XG4gIH1cbiAgcmV0dXJuIGNvbWJvO1xufTtcblxuS2V5Q29tYm8ucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24ocHJlc3NlZEtleU5hbWVzKSB7XG4gIHZhciBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBzdGFydGluZ0tleU5hbWVJbmRleCA9IHRoaXMuX2NoZWNrU3ViQ29tYm8oXG4gICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgIHN0YXJ0aW5nS2V5TmFtZUluZGV4LFxuICAgICAgcHJlc3NlZEtleU5hbWVzXG4gICAgKTtcbiAgICBpZiAoc3RhcnRpbmdLZXlOYW1lSW5kZXggPT09IC0xKSB7IHJldHVybiBmYWxzZTsgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuS2V5Q29tYm8ucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbihvdGhlcktleUNvbWJvKSB7XG4gIGlmIChcbiAgICAhb3RoZXJLZXlDb21ibyB8fFxuICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgaWYgKHR5cGVvZiBvdGhlcktleUNvbWJvID09PSAnc3RyaW5nJykge1xuICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gIH1cblxuICBpZiAodGhpcy5zdWJDb21ib3MubGVuZ3RoICE9PSBvdGhlcktleUNvbWJvLnN1YkNvbWJvcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgIHZhciBvdGhlclN1YkNvbWJvID0gb3RoZXJLZXlDb21iby5zdWJDb21ib3NbaV0uc2xpY2UoMCk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICB2YXIga2V5TmFtZSA9IHN1YkNvbWJvW2pdO1xuICAgICAgdmFyIGluZGV4ICAgPSBvdGhlclN1YkNvbWJvLmluZGV4T2Yoa2V5TmFtZSk7XG5cbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5LZXlDb21iby5fc3BsaXRTdHIgPSBmdW5jdGlvbihzdHIsIGRlbGltaW5hdG9yKSB7XG4gIHZhciBzICA9IHN0cjtcbiAgdmFyIGQgID0gZGVsaW1pbmF0b3I7XG4gIHZhciBjICA9ICcnO1xuICB2YXIgY2EgPSBbXTtcblxuICBmb3IgKHZhciBjaSA9IDA7IGNpIDwgcy5sZW5ndGg7IGNpICs9IDEpIHtcbiAgICBpZiAoY2kgPiAwICYmIHNbY2ldID09PSBkICYmIHNbY2kgLSAxXSAhPT0gJ1xcXFwnKSB7XG4gICAgICBjYS5wdXNoKGMudHJpbSgpKTtcbiAgICAgIGMgPSAnJztcbiAgICAgIGNpICs9IDE7XG4gICAgfVxuICAgIGMgKz0gc1tjaV07XG4gIH1cbiAgaWYgKGMpIHsgY2EucHVzaChjLnRyaW0oKSk7IH1cblxuICByZXR1cm4gY2E7XG59O1xuXG5LZXlDb21iby5wcm90b3R5cGUuX2NoZWNrU3ViQ29tYm8gPSBmdW5jdGlvbihzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICBzdWJDb21ibyA9IHN1YkNvbWJvLnNsaWNlKDApO1xuICBwcmVzc2VkS2V5TmFtZXMgPSBwcmVzc2VkS2V5TmFtZXMuc2xpY2Uoc3RhcnRpbmdLZXlOYW1lSW5kZXgpO1xuXG4gIHZhciBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YkNvbWJvLmxlbmd0aDsgaSArPSAxKSB7XG5cbiAgICB2YXIga2V5TmFtZSA9IHN1YkNvbWJvW2ldO1xuICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgIHZhciBlc2NhcGVkS2V5TmFtZSA9IGtleU5hbWUuc2xpY2UoMSk7XG4gICAgICBpZiAoXG4gICAgICAgIGVzY2FwZWRLZXlOYW1lID09PSBLZXlDb21iby5jb21ib0RlbGltaW5hdG9yIHx8XG4gICAgICAgIGVzY2FwZWRLZXlOYW1lID09PSBLZXlDb21iby5rZXlEZWxpbWluYXRvclxuICAgICAgKSB7XG4gICAgICAgIGtleU5hbWUgPSBlc2NhcGVkS2V5TmFtZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSBwcmVzc2VkS2V5TmFtZXMuaW5kZXhPZihrZXlOYW1lKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgc3ViQ29tYm8uc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgZW5kSW5kZXggPSBpbmRleDtcbiAgICAgIH1cbiAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGVuZEluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Q29tYm87XG4iLCJcbnZhciBMb2NhbGUgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9rZXktY29tYm8nKTtcblxuXG5mdW5jdGlvbiBLZXlib2FyZCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcbiAgdGhpcy5fbG9jYWxlICAgICAgICAgICAgICAgPSBudWxsO1xuICB0aGlzLl9jdXJyZW50Q29udGV4dCAgICAgICA9IG51bGw7XG4gIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gIHRoaXMuX2xpc3RlbmVycyAgICAgICAgICAgID0gW107XG4gIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMgICAgID0gW107XG4gIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgICAgICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgICAgICA9ICcnO1xuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgICAgICA9IGZhbHNlO1xuICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nICAgPSBudWxsO1xuICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuICB0aGlzLl9jYWxsZXJIYW5kbGVyICAgICAgICA9IG51bGw7XG5cbiAgdGhpcy5zZXRDb250ZXh0KCdnbG9iYWwnKTtcbiAgdGhpcy53YXRjaCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpO1xufVxuXG5LZXlib2FyZC5wcm90b3R5cGUuc2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxlTmFtZSwgbG9jYWxlQnVpbGRlcikge1xuICB2YXIgbG9jYWxlID0gbnVsbDtcbiAgaWYgKHR5cGVvZiBsb2NhbGVOYW1lID09PSAnc3RyaW5nJykge1xuXG4gICAgaWYgKGxvY2FsZUJ1aWxkZXIpIHtcbiAgICAgIGxvY2FsZSA9IG5ldyBMb2NhbGUobG9jYWxlTmFtZSk7XG4gICAgICBsb2NhbGVCdWlsZGVyKGxvY2FsZSwgdGhpcy5fdGFyZ2V0UGxhdGZvcm0sIHRoaXMuX3RhcmdldFVzZXJBZ2VudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsZSA9IHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gfHwgbnVsbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxlICAgICA9IGxvY2FsZU5hbWU7XG4gICAgbG9jYWxlTmFtZSA9IGxvY2FsZS5fbG9jYWxlTmFtZTtcbiAgfVxuXG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgPSBsb2NhbGU7XG4gIHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gPSBsb2NhbGU7XG4gIGlmIChsb2NhbGUpIHtcbiAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMgPSBsb2NhbGUucHJlc3NlZEtleXM7XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5nZXRMb2NhbGUgPSBmdW5jdGlvbihsb2NhbE5hbWUpIHtcbiAgbG9jYWxOYW1lIHx8IChsb2NhbE5hbWUgPSB0aGlzLl9sb2NhbGUubG9jYWxlTmFtZSk7XG4gIHJldHVybiB0aGlzLl9sb2NhbGVzW2xvY2FsTmFtZV0gfHwgbnVsbDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgPSByZWxlYXNlSGFuZGxlcjtcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgID0gcHJlc3NIYW5kbGVyO1xuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgPSBrZXlDb21ib1N0cjtcbiAgICBrZXlDb21ib1N0ciAgICAgICAgICAgID0gbnVsbDtcbiAgfVxuXG4gIGlmIChcbiAgICBrZXlDb21ib1N0ciAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xuICApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9saXN0ZW5lcnMucHVzaCh7XG4gICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IGtleUNvbWJvU3RyID8gbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSA6IG51bGwsXG4gICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IHByZXNzSGFuZGxlciAgICAgICAgICAgfHwgbnVsbCxcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogcmVsZWFzZUhhbmRsZXIgICAgICAgICB8fCBudWxsLFxuICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlLFxuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlXG4gIH0pO1xufTtcbktleWJvYXJkLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xuS2V5Ym9hcmQucHJvdG90eXBlLm9uICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQ7XG5cbktleWJvYXJkLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmVsZWFzZUhhbmRsZXIgPSBwcmVzc0hhbmRsZXI7XG4gICAgcHJlc3NIYW5kbGVyICAgPSBrZXlDb21ib1N0cjtcbiAgICBrZXlDb21ib1N0ciA9IG51bGw7XG4gIH1cblxuICBpZiAoXG4gICAga2V5Q29tYm9TdHIgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy51bmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcblxuICAgIHZhciBjb21ib01hdGNoZXMgICAgICAgICAgPSAha2V5Q29tYm9TdHIgJiYgIWxpc3RlbmVyLmtleUNvbWJvIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmtleUNvbWJvICYmIGxpc3RlbmVyLmtleUNvbWJvLmlzRXF1YWwoa2V5Q29tYm9TdHIpO1xuICAgIHZhciBwcmVzc0hhbmRsZXJNYXRjaGVzICAgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmVzc0hhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc3NIYW5kbGVyID09PSBsaXN0ZW5lci5wcmVzc0hhbmRsZXI7XG4gICAgdmFyIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcyA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFyZWxlYXNlSGFuZGxlciAmJiAhbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgPT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xuXG4gICAgaWYgKGNvbWJvTWF0Y2hlcyAmJiBwcmVzc0hhbmRsZXJNYXRjaGVzICYmIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcykge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICB9XG4gIH1cbn07XG5LZXlib2FyZC5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUudW5iaW5kO1xuS2V5Ym9hcmQucHJvdG90eXBlLm9mZiAgICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnNldENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSkge1xuICBpZih0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG5cbiAgaWYgKCF0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0pIHtcbiAgICB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0gPSBbXTtcbiAgfVxuICB0aGlzLl9saXN0ZW5lcnMgICAgICA9IHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXTtcbiAgdGhpcy5fY3VycmVudENvbnRleHQgPSBjb250ZXh0TmFtZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9jdXJyZW50Q29udGV4dDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS53aXRoQ29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHROYW1lLCBjYWxsYmFjaykge1xuICB2YXIgcHJldmlvdXNDb250ZXh0TmFtZSA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuICB0aGlzLnNldENvbnRleHQoY29udGV4dE5hbWUpO1xuXG4gIGNhbGxiYWNrKCk7XG5cbiAgdGhpcy5zZXRDb250ZXh0KHByZXZpb3VzQ29udGV4dE5hbWUpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24odGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCB0YXJnZXRQbGF0Zm9ybSwgdGFyZ2V0VXNlckFnZW50KSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdGhpcy5zdG9wKCk7XG5cbiAgaWYgKCF0YXJnZXRXaW5kb3cpIHtcbiAgICBpZiAoIWdsb2JhbC5hZGRFdmVudExpc3RlbmVyICYmICFnbG9iYWwuYXR0YWNoRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgZ2xvYmFsIGZ1bmN0aW9ucyBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50LicpO1xuICAgIH1cbiAgICB0YXJnZXRXaW5kb3cgPSBnbG9iYWw7XG4gIH1cblxuICBpZiAodHlwZW9mIHRhcmdldFdpbmRvdy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICB0YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgICB0YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRFbGVtZW50O1xuICAgIHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdztcbiAgICB0YXJnZXRXaW5kb3cgICAgPSBnbG9iYWw7XG4gIH1cblxuICBpZiAoIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmICF0YXJnZXRXaW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQgbWV0aG9kcyBvbiB0YXJnZXRXaW5kb3cuJyk7XG4gIH1cblxuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuXG4gIHZhciB1c2VyQWdlbnQgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnO1xuICB2YXIgcGxhdGZvcm0gID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICB8fCAnJztcblxuICB0YXJnZXRFbGVtZW50ICAgJiYgdGFyZ2V0RWxlbWVudCAgICE9PSBudWxsIHx8ICh0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3cuZG9jdW1lbnQpO1xuICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XG4gIHRhcmdldFVzZXJBZ2VudCAmJiB0YXJnZXRVc2VyQWdlbnQgIT09IG51bGwgfHwgKHRhcmdldFVzZXJBZ2VudCA9IHVzZXJBZ2VudCk7XG5cbiAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICBfdGhpcy5faGFuZGxlQ29tbWFuZEJ1ZyhldmVudCwgcGxhdGZvcm0pO1xuICB9O1xuICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnJlbGVhc2VLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xuICB9O1xuICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnJlbGVhc2VBbGxLZXlzKGV2ZW50KVxuICB9O1xuXG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICB0aGlzLl90YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRFbGVtZW50O1xuICB0aGlzLl90YXJnZXRXaW5kb3cgICAgPSB0YXJnZXRXaW5kb3c7XG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICA9IHRhcmdldFBsYXRmb3JtO1xuICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRVc2VyQWdlbnQ7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIGlmICghdGhpcy5fdGFyZ2V0RWxlbWVudCB8fCAhdGhpcy5fdGFyZ2V0V2luZG93KSB7IHJldHVybjsgfVxuXG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuXG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRFbGVtZW50ID0gbnVsbDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5wcmVzc0tleSA9IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gIHRoaXMuX2xvY2FsZS5wcmVzc0tleShrZXlDb2RlKTtcbiAgdGhpcy5fYXBwbHlCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVsZWFzZUtleSA9IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gIHRoaXMuX2xvY2FsZS5yZWxlYXNlS2V5KGtleUNvZGUpO1xuICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZWxlYXNlQWxsS2V5cyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xuICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7XG4gIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPSAwO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgdGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICB0YXJnZXRFbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl91bmJpbmRFdmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICB0YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgIHRhcmdldEVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2dldEdyb3VwZWRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxpc3RlbmVyR3JvdXBzICAgPSBbXTtcbiAgdmFyIGxpc3RlbmVyR3JvdXBNYXAgPSBbXTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICBpZiAodGhpcy5fY3VycmVudENvbnRleHQgIT09ICdnbG9iYWwnKSB7XG4gICAgbGlzdGVuZXJzID0gW10uY29uY2F0KGxpc3RlbmVycywgdGhpcy5fY29udGV4dHMuZ2xvYmFsKTtcbiAgfVxuXG4gIGxpc3RlbmVycy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gKGIua2V5Q29tYm8gPyBiLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApIC0gKGEua2V5Q29tYm8gPyBhLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApO1xuICB9KS5mb3JFYWNoKGZ1bmN0aW9uKGwpIHtcbiAgICB2YXIgbWFwSW5kZXggPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmIChsaXN0ZW5lckdyb3VwTWFwW2ldID09PSBudWxsICYmIGwua2V5Q29tYm8gPT09IG51bGwgfHxcbiAgICAgICAgICBsaXN0ZW5lckdyb3VwTWFwW2ldICE9PSBudWxsICYmIGxpc3RlbmVyR3JvdXBNYXBbaV0uaXNFcXVhbChsLmtleUNvbWJvKSkge1xuICAgICAgICBtYXBJbmRleCA9IGk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChtYXBJbmRleCA9PT0gLTEpIHtcbiAgICAgIG1hcEluZGV4ID0gbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7XG4gICAgICBsaXN0ZW5lckdyb3VwTWFwLnB1c2gobC5rZXlDb21ibyk7XG4gICAgfVxuICAgIGlmICghbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdKSB7XG4gICAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0gPSBbXTtcbiAgICB9XG4gICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdLnB1c2gobCk7XG4gIH0pO1xuICByZXR1cm4gbGlzdGVuZXJHcm91cHM7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2FwcGx5QmluZGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xuICB2YXIgcHJldmVudFJlcGVhdCA9IGZhbHNlO1xuXG4gIGV2ZW50IHx8IChldmVudCA9IHt9KTtcbiAgZXZlbnQucHJldmVudFJlcGVhdCA9IGZ1bmN0aW9uKCkgeyBwcmV2ZW50UmVwZWF0ID0gdHJ1ZTsgfTtcbiAgZXZlbnQucHJlc3NlZEtleXMgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcblxuICB2YXIgcHJlc3NlZEtleXMgICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG4gIHZhciBsaXN0ZW5lckdyb3VwcyA9IHRoaXMuX2dldEdyb3VwZWRMaXN0ZW5lcnMoKTtcblxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gbGlzdGVuZXJHcm91cHNbaV07XG4gICAgdmFyIGtleUNvbWJvICA9IGxpc3RlbmVyc1swXS5rZXlDb21ibztcblxuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCBrZXlDb21iby5jaGVjayhwcmVzc2VkS2V5cykpIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGlzdGVuZXJzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tqXTtcblxuICAgICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwpIHtcbiAgICAgICAgICBsaXN0ZW5lciA9IHtcbiAgICAgICAgICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBuZXcgS2V5Q29tYm8ocHJlc3NlZEtleXMuam9pbignKycpKSxcbiAgICAgICAgICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBsaXN0ZW5lci5wcmVzc0hhbmRsZXIsXG4gICAgICAgICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIsXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogbGlzdGVuZXIucHJldmVudFJlcGVhdCxcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0ZW5lci5wcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXZlbnRSZXBlYXQpIHtcbiAgICAgICAgICBsaXN0ZW5lci5wcmVzc0hhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgaWYgKHByZXZlbnRSZXBlYXQpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBwcmV2ZW50UmVwZWF0O1xuICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciAmJiB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGtleUNvbWJvKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICB2YXIgaW5kZXggPSBwcmVzc2VkS2V5cy5pbmRleE9mKGtleUNvbWJvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBwcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgaiAtPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9jbGVhckJpbmRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZExpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnNbaV07XG4gICAgdmFyIGtleUNvbWJvID0gbGlzdGVuZXIua2V5Q29tYm87XG4gICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8ICFrZXlDb21iby5jaGVjayh0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMpKSB7XG4gICAgICBpZiAodGhpcy5fY2FsbGVySGFuZGxlciAhPT0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIpIHtcbiAgICAgICAgdmFyIG9sZENhbGxlciA9IHRoaXMuX2NhbGxlckhhbmRsZXI7XG4gICAgICAgIHRoaXMuX2NhbGxlckhhbmRsZXIgPSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcbiAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHQ7XG4gICAgICAgIGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICB0aGlzLl9jYWxsZXJIYW5kbGVyID0gb2xkQ2FsbGVyO1xuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2hhbmRsZUNvbW1hbmRCdWcgPSBmdW5jdGlvbihldmVudCwgcGxhdGZvcm0pIHtcbiAgLy8gT24gTWFjIHdoZW4gdGhlIGNvbW1hbmQga2V5IGlzIGtlcHQgcHJlc3NlZCwga2V5dXAgaXMgbm90IHRyaWdnZXJlZCBmb3IgYW55IG90aGVyIGtleS5cbiAgLy8gSW4gdGhpcyBjYXNlIGZvcmNlIGEga2V5dXAgZm9yIG5vbi1tb2RpZmllciBrZXlzIGRpcmVjdGx5IGFmdGVyIHRoZSBrZXlwcmVzcy5cbiAgdmFyIG1vZGlmaWVyS2V5cyA9IFtcInNoaWZ0XCIsIFwiY3RybFwiLCBcImFsdFwiLCBcImNhcHNsb2NrXCIsIFwidGFiXCIsIFwiY29tbWFuZFwiXTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpICYmIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5pbmNsdWRlcyhcImNvbW1hbmRcIikgJiZcbiAgICAgICFtb2RpZmllcktleXMuaW5jbHVkZXModGhpcy5fbG9jYWxlLmdldEtleU5hbWVzKGV2ZW50LmtleUNvZGUpWzBdKSkge1xuICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyhldmVudCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG4iLCJcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4va2V5LWNvbWJvJyk7XG5cblxuZnVuY3Rpb24gTG9jYWxlKG5hbWUpIHtcbiAgdGhpcy5sb2NhbGVOYW1lICAgICA9IG5hbWU7XG4gIHRoaXMucHJlc3NlZEtleXMgICAgPSBbXTtcbiAgdGhpcy5fYXBwbGllZE1hY3JvcyA9IFtdO1xuICB0aGlzLl9rZXlNYXAgICAgICAgID0ge307XG4gIHRoaXMuX2tpbGxLZXlDb2RlcyAgPSBbXTtcbiAgdGhpcy5fbWFjcm9zICAgICAgICA9IFtdO1xufVxuXG5Mb2NhbGUucHJvdG90eXBlLmJpbmRLZXlDb2RlID0gZnVuY3Rpb24oa2V5Q29kZSwga2V5TmFtZXMpIHtcbiAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ3N0cmluZycpIHtcbiAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gIH1cblxuICB0aGlzLl9rZXlNYXBba2V5Q29kZV0gPSBrZXlOYW1lcztcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuYmluZE1hY3JvID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIGtleU5hbWVzKSB7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAga2V5TmFtZXMgPSBbIGtleU5hbWVzIF07XG4gIH1cblxuICB2YXIgaGFuZGxlciA9IG51bGw7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBoYW5kbGVyID0ga2V5TmFtZXM7XG4gICAga2V5TmFtZXMgPSBudWxsO1xuICB9XG5cbiAgdmFyIG1hY3JvID0ge1xuICAgIGtleUNvbWJvIDogbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSxcbiAgICBrZXlOYW1lcyA6IGtleU5hbWVzLFxuICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICB9O1xuXG4gIHRoaXMuX21hY3Jvcy5wdXNoKG1hY3JvKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuZ2V0S2V5Q29kZXMgPSBmdW5jdGlvbihrZXlOYW1lKSB7XG4gIHZhciBrZXlDb2RlcyA9IFtdO1xuICBmb3IgKHZhciBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX2tleU1hcFtrZXlDb2RlXS5pbmRleE9mKGtleU5hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICB9XG4gIHJldHVybiBrZXlDb2Rlcztcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuZ2V0S2V5TmFtZXMgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLnNldEtpbGxLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMuc2V0S2lsbEtleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5wcmVzc0tleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5wcmVzc0tleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBrZXlOYW1lcyA9IHRoaXMuZ2V0S2V5TmFtZXMoa2V5Q29kZSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMucHJlc3NlZEtleXMucHVzaChrZXlOYW1lc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5fYXBwbHlNYWNyb3MoKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUucmVsZWFzZUtleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICB9XG4gIH1cblxuICBlbHNlIHtcbiAgICB2YXIga2V5TmFtZXMgICAgICAgICA9IHRoaXMuZ2V0S2V5TmFtZXMoa2V5Q29kZSk7XG4gICAgdmFyIGtpbGxLZXlDb2RlSW5kZXggPSB0aGlzLl9raWxsS2V5Q29kZXMuaW5kZXhPZihrZXlDb2RlKTtcbiAgICBcbiAgICBpZiAoa2lsbEtleUNvZGVJbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jbGVhck1hY3JvcygpO1xuICB9XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLl9hcHBseU1hY3JvcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbWFjcm9zID0gdGhpcy5fbWFjcm9zLnNsaWNlKDApO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBtYWNybyA9IG1hY3Jvc1tpXTtcbiAgICBpZiAobWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgIG1hY3JvLmtleU5hbWVzID0gbWFjcm8uaGFuZGxlcih0aGlzLnByZXNzZWRLZXlzKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSkgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5wdXNoKG1hY3JvKTtcbiAgICB9XG4gIH1cbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuX2NsZWFyTWFjcm9zID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZE1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBtYWNybyA9IHRoaXMuX2FwcGxpZWRNYWNyb3NbaV07XG4gICAgaWYgKCFtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgbWFjcm8ua2V5TmFtZXMgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxlO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxvY2FsZSwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xuXG4gIC8vIGdlbmVyYWxcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMsICAgWydjYW5jZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg4LCAgIFsnYmFja3NwYWNlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOSwgICBbJ3RhYiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyLCAgWydjbGVhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzLCAgWydlbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE2LCAgWydzaGlmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE3LCAgWydjdHJsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTgsICBbJ2FsdCcsICdtZW51J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTksICBbJ3BhdXNlJywgJ2JyZWFrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjAsICBbJ2NhcHNsb2NrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjcsICBbJ2VzY2FwZScsICdlc2MnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMiwgIFsnc3BhY2UnLCAnc3BhY2ViYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMywgIFsncGFnZXVwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzQsICBbJ3BhZ2Vkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzUsICBbJ2VuZCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM2LCAgWydob21lJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzcsICBbJ2xlZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOCwgIFsndXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOSwgIFsncmlnaHQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MCwgIFsnZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQxLCAgWydzZWxlY3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MiwgIFsncHJpbnRzY3JlZW4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MywgIFsnZXhlY3V0ZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ0LCAgWydzbmFwc2hvdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ1LCAgWydpbnNlcnQnLCAnaW5zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDYsICBbJ2RlbGV0ZScsICdkZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NywgIFsnaGVscCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NSwgWydzY3JvbGxsb2NrJywgJ3Njcm9sbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4NywgWydlcXVhbCcsICdlcXVhbHNpZ24nLCAnPSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4OCwgWydjb21tYScsICcsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkwLCBbJ3BlcmlvZCcsICcuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkxLCBbJ3NsYXNoJywgJ2ZvcndhcmRzbGFzaCcsICcvJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkyLCBbJ2dyYXZlYWNjZW50JywgJ2AnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMTksIFsnb3BlbmJyYWNrZXQnLCAnWyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMCwgWydiYWNrc2xhc2gnLCAnXFxcXCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMSwgWydjbG9zZWJyYWNrZXQnLCAnXSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMiwgWydhcG9zdHJvcGhlJywgJ1xcJyddKTtcblxuICAvLyAwLTlcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ4LCBbJ3plcm8nLCAnMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ5LCBbJ29uZScsICcxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTAsIFsndHdvJywgJzInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MSwgWyd0aHJlZScsICczJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTIsIFsnZm91cicsICc0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTMsIFsnZml2ZScsICc1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTQsIFsnc2l4JywgJzYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NSwgWydzZXZlbicsICc3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTYsIFsnZWlnaHQnLCAnOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU3LCBbJ25pbmUnLCAnOSddKTtcblxuICAvLyBudW1wYWRcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk2LCBbJ251bXplcm8nLCAnbnVtMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk3LCBbJ251bW9uZScsICdudW0xJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTgsIFsnbnVtdHdvJywgJ251bTInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OSwgWydudW10aHJlZScsICdudW0zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAwLCBbJ251bWZvdXInLCAnbnVtNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMSwgWydudW1maXZlJywgJ251bTUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDIsIFsnbnVtc2l4JywgJ251bTYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDMsIFsnbnVtc2V2ZW4nLCAnbnVtNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNCwgWydudW1laWdodCcsICdudW04J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA1LCBbJ251bW5pbmUnLCAnbnVtOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNiwgWydudW1tdWx0aXBseScsICdudW0qJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA3LCBbJ251bWFkZCcsICdudW0rJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA4LCBbJ251bWVudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA5LCBbJ251bXN1YnRyYWN0JywgJ251bS0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTAsIFsnbnVtZGVjaW1hbCcsICdudW0uJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTExLCBbJ251bWRpdmlkZScsICdudW0vJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ0LCBbJ251bWxvY2snLCAnbnVtJ10pO1xuXG4gIC8vIGZ1bmN0aW9uIGtleXNcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMiwgWydmMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMywgWydmMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNCwgWydmMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNSwgWydmNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNiwgWydmNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNywgWydmNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOCwgWydmNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOSwgWydmOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMCwgWydmOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMSwgWydmMTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjIsIFsnZjExJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIzLCBbJ2YxMiddKTtcblxuICAvLyBzZWNvbmRhcnkga2V5IHN5bWJvbHNcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBgJywgWyd0aWxkZScsICd+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDEnLCBbJ2V4Y2xhbWF0aW9uJywgJ2V4Y2xhbWF0aW9ucG9pbnQnLCAnISddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAyJywgWydhdCcsICdAJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDMnLCBbJ251bWJlcicsICcjJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDQnLCBbJ2RvbGxhcicsICdkb2xsYXJzJywgJ2RvbGxhcnNpZ24nLCAnJCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA1JywgWydwZXJjZW50JywgJyUnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNicsIFsnY2FyZXQnLCAnXiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA3JywgWydhbXBlcnNhbmQnLCAnYW5kJywgJyYnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOCcsIFsnYXN0ZXJpc2snLCAnKiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA5JywgWydvcGVucGFyZW4nLCAnKCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAwJywgWydjbG9zZXBhcmVuJywgJyknXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLScsIFsndW5kZXJzY29yZScsICdfJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArID0nLCBbJ3BsdXMnLCAnKyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBbJywgWydvcGVuY3VybHlicmFjZScsICdvcGVuY3VybHlicmFja2V0JywgJ3snXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXScsIFsnY2xvc2VjdXJseWJyYWNlJywgJ2Nsb3NlY3VybHlicmFja2V0JywgJ30nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFxcXCcsIFsndmVydGljYWxiYXInLCAnfCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA7JywgWydjb2xvbicsICc6J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcJycsIFsncXVvdGF0aW9ubWFyaycsICdcXCcnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgISwnLCBbJ29wZW5hbmdsZWJyYWNrZXQnLCAnPCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAuJywgWydjbG9zZWFuZ2xlYnJhY2tldCcsICc+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC8nLCBbJ3F1ZXN0aW9ubWFyaycsICc/J10pO1xuICBcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSkge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2NvbW1hbmQnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfSBlbHNlIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjdHJsJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH1cblxuICAvL2EteiBhbmQgQS1aXG4gIGZvciAodmFyIGtleUNvZGUgPSA2NTsga2V5Q29kZSA8PSA5MDsga2V5Q29kZSArPSAxKSB7XG4gICAgdmFyIGtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUgKyAzMik7XG4gICAgdmFyIGNhcGl0YWxLZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcbiAgXHRsb2NhbGUuYmluZEtleUNvZGUoa2V5Q29kZSwga2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ2NhcHNsb2NrICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgfVxuXG4gIC8vIGJyb3dzZXIgY2F2ZWF0c1xuICB2YXIgc2VtaWNvbG9uS2V5Q29kZSA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNTkgIDogMTg2O1xuICB2YXIgZGFzaEtleUNvZGUgICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gMTczIDogMTg5O1xuICB2YXIgbGVmdENvbW1hbmRLZXlDb2RlO1xuICB2YXIgcmlnaHRDb21tYW5kS2V5Q29kZTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiAodXNlckFnZW50Lm1hdGNoKCdTYWZhcmknKSB8fCB1c2VyQWdlbnQubWF0Y2goJ0Nocm9tZScpKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSA5MTtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gOTM7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdPcGVyYScpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDE3O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAxNztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAyMjQ7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDIyNDtcbiAgfVxuICBsb2NhbGUuYmluZEtleUNvZGUoc2VtaWNvbG9uS2V5Q29kZSwgICAgWydzZW1pY29sb24nLCAnOyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGRhc2hLZXlDb2RlLCAgICAgICAgIFsnZGFzaCcsICctJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUobGVmdENvbW1hbmRLZXlDb2RlLCAgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ2xlZnRjb21tYW5kJywgJ2xlZnR3aW5kb3dzJywgJ2xlZnR3aW4nLCAnbGVmdHN1cGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUocmlnaHRDb21tYW5kS2V5Q29kZSwgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ3JpZ2h0Y29tbWFuZCcsICdyaWdodHdpbmRvd3MnLCAncmlnaHR3aW4nLCAncmlnaHRzdXBlciddKTtcblxuICAvLyBraWxsIGtleXNcbiAgbG9jYWxlLnNldEtpbGxLZXkoJ2NvbW1hbmQnKTtcbn07XG4iLCJpbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi9saWIvQXBwbGljYXRpb24nXG5pbXBvcnQgTG9hZGluZ1NjZW5lIGZyb20gJy4vc2NlbmVzL0xvYWRpbmdTY2VuZSdcblxuLy8gQ3JlYXRlIGEgUGl4aSBBcHBsaWNhdGlvblxubGV0IGFwcCA9IG5ldyBBcHBsaWNhdGlvbih7XG4gIHdpZHRoOiAyNTYsXG4gIGhlaWdodDogMjU2LFxuICByb3VuZFBpeGVsczogdHJ1ZSxcbiAgYXV0b1Jlc2l6ZTogdHJ1ZSxcbiAgcmVzb2x1dGlvbjogMSxcbiAgYXV0b1N0YXJ0OiBmYWxzZVxufSlcblxuYXBwLnJlbmRlcmVyLnZpZXcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5hcHAucmVuZGVyZXIudmlldy5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuYXBwLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXG4vLyBBZGQgdGhlIGNhbnZhcyB0aGF0IFBpeGkgYXV0b21hdGljYWxseSBjcmVhdGVkIGZvciB5b3UgdG8gdGhlIEhUTUwgZG9jdW1lbnRcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpXG5cbmFwcC5jaGFuZ2VTdGFnZSgpXG5hcHAuc3RhcnQoKVxuYXBwLmNoYW5nZVNjZW5lKExvYWRpbmdTY2VuZSlcbiIsImV4cG9ydCBjb25zdCBJU19NT0JJTEUgPSAoKGEpID0+IC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm8vaS50ZXN0KGEpIHx8XG4gIC8xMjA3fDYzMTB8NjU5MHwzZ3NvfDR0aHB8NTBbMS02XWl8Nzcwc3w4MDJzfGEgd2F8YWJhY3xhYyhlcnxvb3xzLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3LShufHUpfGM1NVxcL3xjYXBpfGNjd2F8Y2RtLXxjZWxsfGNodG18Y2xkY3xjbWQtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjLXN8ZGV2aXxkaWNhfGRtb2J8ZG8oY3xwKW98ZHMoMTJ8LWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseSgtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmLTV8Zy1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkLShtfHB8dCl8aGVpLXxoaShwdHx0YSl8aHAoIGl8aXApfGhzLWN8aHQoYygtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aS0oMjB8Z298bWEpfGkyMzB8aWFjKCB8LXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHwtW2Etd10pfGxpYnd8bHlueHxtMS13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bS1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dCgtfCB8b3x2KXx6eil8bXQoNTB8cDF8diApfG13YnB8bXl3YXxuMTBbMC0yXXxuMjBbMi0zXXxuMzAoMHwyKXxuNTAoMHwyfDUpfG43KDAoMHwxKXwxMCl8bmUoKGN8bSktfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3wtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuLTJ8cG8oY2t8cnR8c2UpfHByb3h8cHNpb3xwdC1nfHFhLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8LVsyLTddfGktKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aC18b298cC0pfHNka1xcL3xzZShjKC18MHwxKXw0N3xtY3xuZHxyaSl8c2doLXxzaGFyfHNpZSgtfG0pfHNrLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aC18di18diApfHN5KDAxfG1iKXx0MigxOHw1MCl8dDYoMDB8MTB8MTgpfHRhKGd0fGxrKXx0Y2wtfHRkZy18dGVsKGl8bSl8dGltLXx0LW1vfHRvKHBsfHNoKXx0cyg3MHxtLXxtM3xtNSl8dHgtOXx1cChcXC5ifGcxfHNpKXx1dHN0fHY0MDB8djc1MHx2ZXJpfHZpKHJnfHRlKXx2ayg0MHw1WzAtM118LXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhcy18eW91cnx6ZXRvfHp0ZS0vaS50ZXN0KGEuc3Vic3RyKDAsIDQpKVxuKShuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgd2luZG93Lm9wZXJhKVxuXG5leHBvcnQgY29uc3QgQ0VJTF9TSVpFID0gMzJcblxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfTU9WRSA9IFN5bWJvbCgnbW92ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9DQU1FUkEgPSBTeW1ib2woJ2NhbWVyYScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9PUEVSQVRFID0gU3ltYm9sKCdvcGVyYXRlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0tFWV9NT1ZFID0gU3ltYm9sKCdrZXktbW92ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9IRUFMVEggPSBTeW1ib2woJ2hlYWx0aCcpXG5leHBvcnQgY29uc3QgQUJJTElUWV9DQVJSWSA9IFN5bWJvbCgnY2FycnknKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfTEVBUk4gPSBTeW1ib2woJ2xlYXJuJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX1BMQUNFID0gU3ltYm9sKCdwbGFjZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9LRVlfUExBQ0UgPSBTeW1ib2woJ2tleS1wbGFjZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9LRVlfRklSRSA9IFN5bWJvbCgnZmlyZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9ST1RBVEUgPSBTeW1ib2woJ3JvdGF0ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9EQU1BR0UgPSBTeW1ib2woJ2RhbWFnZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9NQU5BID0gU3ltYm9sKCdtYW5hJylcbmV4cG9ydCBjb25zdCBBQklMSVRJRVNfQUxMID0gW1xuICBBQklMSVRZX01PVkUsXG4gIEFCSUxJVFlfQ0FNRVJBLFxuICBBQklMSVRZX09QRVJBVEUsXG4gIEFCSUxJVFlfS0VZX01PVkUsXG4gIEFCSUxJVFlfSEVBTFRILFxuICBBQklMSVRZX0NBUlJZLFxuICBBQklMSVRZX0xFQVJOLFxuICBBQklMSVRZX1BMQUNFLFxuICBBQklMSVRZX0tFWV9QTEFDRSxcbiAgQUJJTElUWV9LRVlfRklSRSxcbiAgQUJJTElUWV9ST1RBVEUsXG4gIEFCSUxJVFlfREFNQUdFLFxuICBBQklMSVRZX01BTkFcbl1cblxuLy8gb2JqZWN0IHR5cGUsIHN0YXRpYyBvYmplY3QsIG5vdCBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFUSUMgPSAnc3RhdGljJ1xuLy8gY29sbGlkZSB3aXRoXG5leHBvcnQgY29uc3QgU1RBWSA9ICdzdGF5J1xuLy8gdG91Y2ggd2lsbCByZXBseVxuZXhwb3J0IGNvbnN0IFJFUExZID0gJ3JlcGx5J1xuIiwiZXhwb3J0IGNvbnN0IExFRlQgPSAnYSdcbmV4cG9ydCBjb25zdCBVUCA9ICd3J1xuZXhwb3J0IGNvbnN0IFJJR0hUID0gJ2QnXG5leHBvcnQgY29uc3QgRE9XTiA9ICdzJ1xuZXhwb3J0IGNvbnN0IFNXSVRDSDEgPSAnMSdcbmV4cG9ydCBjb25zdCBTV0lUQ0gyID0gJzInXG5leHBvcnQgY29uc3QgU1dJVENIMyA9ICczJ1xuZXhwb3J0IGNvbnN0IFNXSVRDSDQgPSAnNCdcbmV4cG9ydCBjb25zdCBGSVJFID0gJ2YnXG4iLCJpbXBvcnQgeyBBcHBsaWNhdGlvbiBhcyBQaXhpQXBwbGljYXRpb24sIEdyYXBoaWNzLCBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuL2dsb2JhbEV2ZW50TWFuYWdlcidcblxubGV0IGFwcFxuXG5jbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIFBpeGlBcHBsaWNhdGlvbiB7XG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncylcbiAgICBhcHAgPSB0aGlzXG4gIH1cblxuICAvLyBvbmx5IG9uZSBpbnN0YW5jZSBmb3Igbm93XG4gIHN0YXRpYyBnZXRBcHAgKCkge1xuICAgIHJldHVybiBhcHBcbiAgfVxuXG4gIGNoYW5nZVN0YWdlICgpIHtcbiAgICB0aGlzLnN0YWdlID0gbmV3IGRpc3BsYXkuU3RhZ2UoKVxuICB9XG5cbiAgY2hhbmdlU2NlbmUgKFNjZW5lTmFtZSwgcGFyYW1zKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFNjZW5lKSB7XG4gICAgICAvLyBtYXliZSB1c2UgcHJvbWlzZSBmb3IgYW5pbWF0aW9uXG4gICAgICAvLyByZW1vdmUgZ2FtZWxvb3A/XG4gICAgICB0aGlzLmN1cnJlbnRTY2VuZS5kZXN0cm95KClcbiAgICAgIHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQodGhpcy5jdXJyZW50U2NlbmUpXG4gICAgfVxuXG4gICAgbGV0IHNjZW5lID0gbmV3IFNjZW5lTmFtZShwYXJhbXMpXG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChzY2VuZSlcbiAgICBzY2VuZS5jcmVhdGUoKVxuICAgIHNjZW5lLm9uKCdjaGFuZ2VTY2VuZScsIHRoaXMuY2hhbmdlU2NlbmUuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuY3VycmVudFNjZW5lID0gc2NlbmVcbiAgfVxuXG4gIHN0YXJ0ICguLi5hcmdzKSB7XG4gICAgc3VwZXIuc3RhcnQoLi4uYXJncylcblxuICAgIC8vIGNyZWF0ZSBhIGJhY2tncm91bmQgbWFrZSBzdGFnZSBoYXMgd2lkdGggJiBoZWlnaHRcbiAgICBsZXQgdmlldyA9IHRoaXMucmVuZGVyZXIudmlld1xuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoXG4gICAgICBuZXcgR3JhcGhpY3MoKS5kcmF3UmVjdCgwLCAwLCB2aWV3LndpZHRoLCB2aWV3LmhlaWdodClcbiAgICApXG5cbiAgICBnbG9iYWxFdmVudE1hbmFnZXIuc2V0SW50ZXJhY3Rpb24odGhpcy5yZW5kZXJlci5wbHVnaW5zLmludGVyYWN0aW9uKVxuXG4gICAgLy8gU3RhcnQgdGhlIGdhbWUgbG9vcFxuICAgIHRoaXMudGlja2VyLmFkZChkZWx0YSA9PiB0aGlzLmdhbWVMb29wLmJpbmQodGhpcykoZGVsdGEpKVxuICB9XG5cbiAgZ2FtZUxvb3AgKGRlbHRhKSB7XG4gICAgLy8gVXBkYXRlIHRoZSBjdXJyZW50IGdhbWUgc3RhdGU6XG4gICAgdGhpcy5jdXJyZW50U2NlbmUudGljayhkZWx0YSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBsaWNhdGlvblxuIiwiaW1wb3J0IHsgR3JhcGhpY3MgfSBmcm9tICcuL1BJWEknXG5pbXBvcnQgeyBDRUlMX1NJWkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jb25zdCBMSUdIVCA9IFN5bWJvbCgnbGlnaHQnKVxuXG5jbGFzcyBMaWdodCB7XG4gIHN0YXRpYyBsaWdodE9uICh0YXJnZXQsIHJhZGl1cywgcmFuZCA9IDEpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGFyZ2V0LnBhcmVudFxuICAgIGlmICghY29udGFpbmVyLmxpZ2h0aW5nKSB7XG4gICAgICAvLyBjb250YWluZXIgZG9lcyBOT1QgaGFzIGxpZ2h0aW5nIHByb3BlcnR5XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIGxpZ2h0YnVsYiA9IG5ldyBHcmFwaGljcygpXG4gICAgdmFyIHJyID0gMHhmZlxuICAgIHZhciByZyA9IDB4ZmZcbiAgICB2YXIgcmIgPSAweGZmXG4gICAgdmFyIHJhZCA9IHJhZGl1cyAqIENFSUxfU0laRVxuXG4gICAgbGV0IGFuY2hvciA9IHRhcmdldC5hbmNob3JcbiAgICBsZXQgeCA9IHRhcmdldC53aWR0aCAqICgwLjUgLSBhbmNob3IueClcbiAgICBsZXQgeSA9IHRhcmdldC5oZWlnaHQgKiAoMC41IC0gYW5jaG9yLnkpXG4gICAgbGlnaHRidWxiLmJlZ2luRmlsbCgocnIgPDwgMTYpICsgKHJnIDw8IDgpICsgcmIsIDEuMClcbiAgICBsaWdodGJ1bGIuZHJhd0NpcmNsZSh4LCB5LCByYWQpXG4gICAgbGlnaHRidWxiLmVuZEZpbGwoKVxuICAgIGxpZ2h0YnVsYi5wYXJlbnRMYXllciA9IGNvbnRhaW5lci5saWdodGluZyAvLyBtdXN0IGhhcyBwcm9wZXJ0eTogbGlnaHRpbmdcblxuICAgIHRhcmdldFtMSUdIVF0gPSB7XG4gICAgICBsaWdodDogbGlnaHRidWxiXG4gICAgfVxuICAgIHRhcmdldC5hZGRDaGlsZChsaWdodGJ1bGIpXG5cbiAgICBpZiAocmFuZCAhPT0gMSkge1xuICAgICAgbGV0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgZFNjYWxlID0gTWF0aC5yYW5kb20oKSAqICgxIC0gcmFuZClcbiAgICAgICAgaWYgKGxpZ2h0YnVsYi5zY2FsZS54ID4gMSkge1xuICAgICAgICAgIGRTY2FsZSA9IC1kU2NhbGVcbiAgICAgICAgfVxuICAgICAgICBsaWdodGJ1bGIuc2NhbGUueCArPSBkU2NhbGVcbiAgICAgICAgbGlnaHRidWxiLnNjYWxlLnkgKz0gZFNjYWxlXG4gICAgICAgIGxpZ2h0YnVsYi5hbHBoYSArPSBkU2NhbGVcbiAgICAgIH0sIDEwMDAgLyAxMilcbiAgICAgIHRhcmdldFtMSUdIVF0uaW50ZXJ2YWwgPSBpbnRlcnZhbFxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBsaWdodE9mZiAodGFyZ2V0KSB7XG4gICAgaWYgKCF0YXJnZXRbTElHSFRdKSB7XG4gICAgICAvLyBubyBsaWdodCB0byByZW1vdmVcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyByZW1vdmUgbGlnaHRcbiAgICB0YXJnZXQucmVtb3ZlQ2hpbGQodGFyZ2V0W0xJR0hUXS5saWdodClcbiAgICAvLyByZW1vdmUgaW50ZXJ2YWxcbiAgICBjbGVhckludGVydmFsKHRhcmdldFtMSUdIVF0uaW50ZXJ2YWwpXG4gICAgZGVsZXRlIHRhcmdldFtMSUdIVF1cbiAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICB0YXJnZXQub2ZmKCdyZW1vdmVkJywgTGlnaHQubGlnaHRPZmYpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGlnaHRcbiIsImltcG9ydCB7IENvbnRhaW5lciwgZGlzcGxheSB9IGZyb20gJy4vUElYSSdcclxuXHJcbmltcG9ydCB7IFNUQVksIFNUQVRJQywgUkVQTFksIENFSUxfU0laRSwgQUJJTElUWV9LRVlfRklSRSwgQUJJTElUWV9LRVlfTU9WRSwgQUJJTElUWV9ST1RBVEUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBpbnN0YW5jZUJ5SXRlbUlkIH0gZnJvbSAnLi91dGlscydcclxuaW1wb3J0IE1hcFdvcmxkIGZyb20gJy4uL2xpYi9NYXBXb3JsZCdcclxuXHJcbmxldCBpc0dhbWVPdmVyID0gZmFsc2VcclxuXHJcbmNvbnN0IHBpcGUgPSAoZmlyc3QsIC4uLm1vcmUpID0+XHJcbiAgbW9yZS5yZWR1Y2UoKGFjYywgY3VycikgPT4gKC4uLmFyZ3MpID0+IGN1cnIoYWNjKC4uLmFyZ3MpKSwgZmlyc3QpXHJcblxyXG5jb25zdCBvYmplY3RFdmVudCA9IHtcclxuICBhZGRPYmplY3QgKG9iamVjdCwgYnVsbGV0KSB7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QoYnVsbGV0KVxyXG4gIH0sXHJcbiAgZGllIChvYmplY3QpIHtcclxuICAgIGlzR2FtZU92ZXIgPSB0cnVlXHJcbiAgICBvYmplY3RbQUJJTElUWV9LRVlfRklSRV0uZHJvcEJ5KG9iamVjdClcclxuICAgIG9iamVjdFtBQklMSVRZX0tFWV9NT1ZFXS5kcm9wQnkob2JqZWN0KVxyXG4gICAgb2JqZWN0W0FCSUxJVFlfUk9UQVRFXS5kcm9wQnkob2JqZWN0KVxyXG4gICAgb2JqZWN0LnNheSgnWW91IGRpZS4nKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGV2ZW50czpcclxuICogIHVzZTogb2JqZWN0XHJcbiAqL1xyXG5jbGFzcyBNYXAgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMuY2VpbFNpemUgPSBDRUlMX1NJWkVcclxuXHJcbiAgICB0aGlzLm9iamVjdHMgPSB7XHJcbiAgICAgIFtTVEFUSUNdOiBbXSxcclxuICAgICAgW1NUQVldOiBbXSxcclxuICAgICAgW1JFUExZXTogW11cclxuICAgIH1cclxuICAgIHRoaXMubWFwID0gbmV3IENvbnRhaW5lcigpXHJcbiAgICB0aGlzLm1hcC53aWxsUmVtb3ZlQ2hpbGQgPSB0aGlzLndpbGxSZW1vdmVDaGlsZC5iaW5kKHRoaXMpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMubWFwKVxyXG5cclxuICAgIC8vIHBsYXllciBncm91cFxyXG4gICAgdGhpcy5wbGF5ZXJHcm91cCA9IG5ldyBkaXNwbGF5Lkdyb3VwKClcclxuICAgIGxldCBwbGF5ZXJMYXllciA9IG5ldyBkaXNwbGF5LkxheWVyKHRoaXMucGxheWVyR3JvdXApXHJcbiAgICB0aGlzLmFkZENoaWxkKHBsYXllckxheWVyKVxyXG5cclxuICAgIC8vIHBoeXNpY1xyXG4gICAgdGhpcy5tYXBXb3JsZCA9IG5ldyBNYXBXb3JsZCgpXHJcblxyXG4gICAgdGhpcy53aWxsUmVtb3ZlZCA9IFtdXHJcbiAgfVxyXG5cclxuICBsb2FkIChtYXBEYXRhKSB7XHJcbiAgICBsZXQgdGlsZXMgPSBtYXBEYXRhLnRpbGVzXHJcbiAgICBsZXQgY29scyA9IG1hcERhdGEuY29sc1xyXG4gICAgbGV0IHJvd3MgPSBtYXBEYXRhLnJvd3NcclxuICAgIGxldCBpdGVtcyA9IG1hcERhdGEuaXRlbXNcclxuXHJcbiAgICBsZXQgY2VpbFNpemUgPSB0aGlzLmNlaWxTaXplXHJcblxyXG4gICAgbGV0IGFkZEdhbWVPYmplY3QgPSAoaSwgaiwgaWQsIHBhcmFtcykgPT4ge1xyXG4gICAgICBsZXQgbyA9IGluc3RhbmNlQnlJdGVtSWQoaWQsIHBhcmFtcylcclxuICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG8sIGkgKiBjZWlsU2l6ZSwgaiAqIGNlaWxTaXplKVxyXG4gICAgICByZXR1cm4gW28sIGksIGpdXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJlZ2lzdGVyT24gPSAoW28sIGksIGpdKSA9PiB7XHJcbiAgICAgIG8ub24oJ3VzZScsICgpID0+IHRoaXMuZW1pdCgndXNlJywgbykpXHJcbiAgICAgIG8ub24oJ2FkZE9iamVjdCcsIG9iamVjdEV2ZW50LmFkZE9iamVjdC5iaW5kKHRoaXMsIG8pKVxyXG4gICAgICAvLyBUT0RPOiByZW1vdmUgbWFwIGl0ZW1cclxuICAgICAgLy8gZGVsZXRlIGl0ZW1zW2ldXHJcbiAgICAgIHJldHVybiBbbywgaSwgal1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHM7IGkrKykge1xyXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJvd3M7IGorKykge1xyXG4gICAgICAgIHBpcGUoYWRkR2FtZU9iamVjdCwgcmVnaXN0ZXJPbikoaSwgaiwgdGlsZXNbaiAqIGNvbHMgKyBpXSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgbGV0IFsgaWQsIFtpLCBqXSwgcGFyYW1zIF0gPSBpdGVtXHJcbiAgICAgIHBpcGUoYWRkR2FtZU9iamVjdCwgcmVnaXN0ZXJPbikoaSwgaiwgaWQsIHBhcmFtcylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBhZGRQbGF5ZXIgKHBsYXllciwgdG9Qb3NpdGlvbikge1xyXG4gICAgLy8g6Ki75YaK5LqL5Lu2XHJcbiAgICBPYmplY3QuZW50cmllcyhvYmplY3RFdmVudCkuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcclxuICAgICAgbGV0IGVJbnN0YW5jZSA9IGhhbmRsZXIuYmluZCh0aGlzLCBwbGF5ZXIpXHJcbiAgICAgIHBsYXllci5vbihldmVudE5hbWUsIGVJbnN0YW5jZSlcclxuICAgICAgcGxheWVyLm9uY2UoJ3JlbW92ZWQnLCBwbGF5ZXIub2ZmLmJpbmQocGxheWVyLCBldmVudE5hbWUsIGVJbnN0YW5jZSkpXHJcbiAgICB9KVxyXG4gICAgLy8g5paw5aKe6Iez5Zyw5ZyW5LiKXHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QoXHJcbiAgICAgIHBsYXllcixcclxuICAgICAgdG9Qb3NpdGlvblswXSAqIHRoaXMuY2VpbFNpemUsXHJcbiAgICAgIHRvUG9zaXRpb25bMV0gKiB0aGlzLmNlaWxTaXplKVxyXG5cclxuICAgIC8vIHBsYXllciDnva7poILpoa/npLpcclxuICAgIHBsYXllci5wYXJlbnRHcm91cCA9IHRoaXMucGxheWVyR3JvdXBcclxuXHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllclxyXG4gIH1cclxuXHJcbiAgdGljayAoZGVsdGEpIHtcclxuICAgIGlmIChpc0dhbWVPdmVyKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5vYmplY3RzW1NUQVldLmZvckVhY2gobyA9PiBvLnRpY2soZGVsdGEpKVxyXG4gICAgdGhpcy5vYmplY3RzW1JFUExZXS5mb3JFYWNoKG8gPT4gby50aWNrKGRlbHRhKSlcclxuICAgIHRoaXMubWFwV29ybGQudXBkYXRlKGRlbHRhKVxyXG4gICAgdGhpcy53aWxsUmVtb3ZlZC5mb3JFYWNoKGNoaWxkID0+IHtcclxuICAgICAgdGhpcy5tYXAucmVtb3ZlQ2hpbGQoY2hpbGQpXHJcbiAgICAgIC8vIGNoaWxkLmRlc3Ryb3koKXdhZHdhXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgYWRkR2FtZU9iamVjdCAobywgeCA9IHVuZGVmaW5lZCwgeSA9IHVuZGVmaW5lZCkge1xyXG4gICAgaWYgKHggIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBvLnBvc2l0aW9uRXguc2V0KHgsIHkpXHJcbiAgICB9XHJcbiAgICBvLmFuY2hvci5zZXQoMC41LCAwLjUpXHJcblxyXG4gICAgbGV0IG9BcnJheSA9IHRoaXMub2JqZWN0c1tvLnR5cGVdXHJcbiAgICBvQXJyYXkucHVzaChvKVxyXG4gICAgby5vbmNlKCdyZW1vdmVkJywgKCkgPT4ge1xyXG4gICAgICBsZXQgaW54ID0gb0FycmF5LmluZGV4T2YobylcclxuICAgICAgb0FycmF5LnNwbGljZShpbngsIDEpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGFkZCB0byB3b3JsZFxyXG4gICAgdGhpcy5tYXBXb3JsZC5hZGQobylcclxuICAgIHRoaXMubWFwLmFkZENoaWxkKG8pXHJcbiAgfVxyXG5cclxuICBzZXRTY2FsZSAoc2NhbGUpIHtcclxuICAgIHRoaXMuc2NhbGUuc2V0KHNjYWxlKVxyXG4gICAgdGhpcy5tYXBXb3JsZC5zY2FsZShzY2FsZSlcclxuICB9XHJcblxyXG4gIHNldFBvc2l0aW9uICh4LCB5KSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxyXG4gIH1cclxuXHJcbiAgZGVidWcgKG9wdCkge1xyXG4gICAgdGhpcy5tYXBXb3JsZC5lbmFibGVSZW5kZXIob3B0KVxyXG4gICAgdGhpcy5tYXBXb3JsZC5mb2xsb3codGhpcy5wbGF5ZXIuYm9keSlcclxuICB9XHJcblxyXG4gIHdpbGxSZW1vdmVDaGlsZCAoY2hpbGQpIHtcclxuICAgIHRoaXMud2lsbFJlbW92ZWQucHVzaChjaGlsZClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hcFxyXG4iLCJpbXBvcnQgeyBDb250YWluZXIsIGRpc3BsYXksIEJMRU5EX01PREVTLCBTcHJpdGUgfSBmcm9tICcuL1BJWEknXHJcblxyXG5jbGFzcyBNYXBGb2cgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKClcclxuICAgIGxldCBsaWdodGluZyA9IG5ldyBkaXNwbGF5LkxheWVyKClcclxuICAgIGxpZ2h0aW5nLm9uKCdkaXNwbGF5JywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgZWxlbWVudC5ibGVuZE1vZGUgPSBCTEVORF9NT0RFUy5BRERcclxuICAgIH0pXHJcbiAgICBsaWdodGluZy51c2VSZW5kZXJUZXh0dXJlID0gdHJ1ZVxyXG4gICAgbGlnaHRpbmcuY2xlYXJDb2xvciA9IFswLCAwLCAwLCAxXSAvLyBhbWJpZW50IGdyYXlcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nKVxyXG5cclxuICAgIHZhciBsaWdodGluZ1Nwcml0ZSA9IG5ldyBTcHJpdGUobGlnaHRpbmcuZ2V0UmVuZGVyVGV4dHVyZSgpKVxyXG4gICAgbGlnaHRpbmdTcHJpdGUuYmxlbmRNb2RlID0gQkxFTkRfTU9ERVMuTVVMVElQTFlcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nU3ByaXRlKVxyXG5cclxuICAgIHRoaXMubGlnaHRpbmcgPSBsaWdodGluZ1xyXG4gIH1cclxuXHJcbiAgZW5hYmxlIChtYXApIHtcclxuICAgIHRoaXMubGlnaHRpbmcuY2xlYXJDb2xvciA9IFswLCAwLCAwLCAxXVxyXG4gICAgbWFwLm1hcC5saWdodGluZyA9IHRoaXMubGlnaHRpbmdcclxuICB9XHJcblxyXG4gIC8vIOa2iOmZpOi/t+mcp1xyXG4gIGRpc2FibGUgKCkge1xyXG4gICAgdGhpcy5saWdodGluZy5jbGVhckNvbG9yID0gWzEsIDEsIDEsIDFdXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXBGb2dcclxuIiwiaW1wb3J0IHsgRW5naW5lLCBFdmVudHMsIFdvcmxkLCBSZW5kZXIsIE1vdXNlLCBNb3VzZUNvbnN0cmFpbnQsIEJvZHkgfSBmcm9tICcuL01hdHRlcidcbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmxldCBQQVJFTlQgPSBTeW1ib2woJ3BhcmVudCcpXG5cbmZ1bmN0aW9uIGZvbGxvdyAoYm9keSkge1xuICBsZXQgZW5naW5lID0gdGhpcy5lbmdpbmVcbiAgbGV0IGluaXRpYWxFbmdpbmVCb3VuZHNNYXhYID0gdGhpcy5pbml0aWFsRW5naW5lQm91bmRzTWF4WFxuICBsZXQgaW5pdGlhbEVuZ2luZUJvdW5kc01heFkgPSB0aGlzLmluaXRpYWxFbmdpbmVCb3VuZHNNYXhZXG4gIGxldCBjZW50ZXJYID0gLXRoaXMuY2VudGVyLnhcbiAgbGV0IGNlbnRlclkgPSAtdGhpcy5jZW50ZXIueVxuICBsZXQgYm91bmRzID0gZW5naW5lLnJlbmRlci5ib3VuZHNcbiAgbGV0IGJvZHlYID0gYm9keS5wb3NpdGlvbi54XG4gIGxldCBib2R5WSA9IGJvZHkucG9zaXRpb24ueVxuXG4gIC8vIEZhbGxvdyBIZXJvIFhcbiAgYm91bmRzLm1pbi54ID0gY2VudGVyWCArIGJvZHlYXG4gIGJvdW5kcy5tYXgueCA9IGNlbnRlclggKyBib2R5WCArIGluaXRpYWxFbmdpbmVCb3VuZHNNYXhYXG5cbiAgLy8gRmFsbG93IEhlcm8gWVxuICBib3VuZHMubWluLnkgPSBjZW50ZXJZICsgYm9keVlcbiAgYm91bmRzLm1heC55ID0gY2VudGVyWSArIGJvZHlZICsgaW5pdGlhbEVuZ2luZUJvdW5kc01heFlcblxuICBNb3VzZS5zZXRPZmZzZXQodGhpcy5tb3VzZUNvbnN0cmFpbnQubW91c2UsIGJvdW5kcy5taW4pXG59XG5cbmNsYXNzIE1hcFdvcmxkIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIHBoeXNpY1xuICAgIGxldCBlbmdpbmUgPSBFbmdpbmUuY3JlYXRlKClcblxuICAgIGxldCB3b3JsZCA9IGVuZ2luZS53b3JsZFxuICAgIHdvcmxkLmdyYXZpdHkueSA9IDBcbiAgICAvLyBhcHBseSBmb3JjZSBhdCBuZXh0IHVwZGF0ZVxuICAgIHdvcmxkLmZvcmNlc1dhaXRGb3JBcHBseSA9IFtdXG5cbiAgICBFdmVudHMub24oZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCBldmVudCA9PiB7XG4gICAgICB2YXIgcGFpcnMgPSBldmVudC5wYWlyc1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcGFpciA9IHBhaXJzW2ldXG4gICAgICAgIGxldCBvMSA9IHBhaXIuYm9keUFbUEFSRU5UXVxuICAgICAgICBsZXQgbzIgPSBwYWlyLmJvZHlCW1BBUkVOVF1cbiAgICAgICAgbzEuZW1pdCgnY29sbGlkZScsIG8yKVxuICAgICAgICBvMi5lbWl0KCdjb2xsaWRlJywgbzEpXG4gICAgICB9XG4gICAgfSlcbiAgICBFdmVudHMub24oZW5naW5lLCAnYmVmb3JlVXBkYXRlJywgZXZlbnQgPT4ge1xuICAgICAgd29ybGQuZm9yY2VzV2FpdEZvckFwcGx5LmZvckVhY2goKHtvd25lciwgdmVjdG9yfSkgPT4ge1xuICAgICAgICBpZiAob3duZXIpIHtcbiAgICAgICAgICBCb2R5LmFwcGx5Rm9yY2Uob3duZXIuYm9keSwgb3duZXIucG9zaXRpb25FeCwgdmVjdG9yKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgd29ybGQuZm9yY2VzV2FpdEZvckFwcGx5ID0gW11cbiAgICB9KVxuXG4gICAgdGhpcy5lbmdpbmUgPSBlbmdpbmVcbiAgICB0aGlzLm1vdXNlQ29uc3RyYWludCA9IE1vdXNlQ29uc3RyYWludC5jcmVhdGUoZW5naW5lKVxuICAgIFdvcmxkLmFkZChlbmdpbmUud29ybGQsIHRoaXMubW91c2VDb25zdHJhaW50KVxuICB9XG5cbiAgYWRkIChvKSB7XG4gICAgaWYgKG8udHlwZSA9PT0gU1RBVElDKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IHdvcmxkID0gdGhpcy5lbmdpbmUud29ybGRcbiAgICBvLmFkZEJvZHkoKVxuICAgIGxldCBib2R5ID0gby5ib2R5XG4gICAgby5vbmNlKCdyZW1vdmVkJywgKCkgPT4ge1xuICAgICAgV29ybGQucmVtb3ZlKHdvcmxkLCBib2R5KVxuICAgIH0pXG4gICAgYm9keVtQQVJFTlRdID0gb1xuICAgIGJvZHkud29ybGQgPSB3b3JsZFxuICAgIFdvcmxkLmFkZEJvZHkod29ybGQsIGJvZHkpXG4gIH1cblxuICB1cGRhdGUgKGRlbHRhKSB7XG4gICAgRW5naW5lLnVwZGF0ZSh0aGlzLmVuZ2luZSwgZGVsdGEgKiAxNi42NjYpXG4gIH1cblxuICBlbmFibGVSZW5kZXIgKHt3aWR0aCwgaGVpZ2h0fSkge1xuICAgIGxldCBlbmdpbmUgPSB0aGlzLmVuZ2luZVxuICAgIC8vIGNyZWF0ZSBhIHJlbmRlcmVyXG4gICAgdmFyIHJlbmRlciA9IFJlbmRlci5jcmVhdGUoe1xuICAgICAgZWxlbWVudDogZG9jdW1lbnQuYm9keSxcbiAgICAgIGVuZ2luZSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgd2lkdGg6IHdpZHRoICogMixcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHQgKiAyLFxuICAgICAgICB3aXJlZnJhbWVzOiB0cnVlLFxuICAgICAgICBoYXNCb3VuZHM6IHRydWUsXG4gICAgICAgIHdpcmVmcmFtZUJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCdcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gcnVuIHRoZSByZW5kZXJlclxuICAgIFJlbmRlci5ydW4ocmVuZGVyKVxuICAgIHRoaXMuZW5naW5lLnJlbmRlciA9IHJlbmRlclxuICAgIHRoaXMuaW5pdGlhbEVuZ2luZUJvdW5kc01heFggPSByZW5kZXIuYm91bmRzLm1heC54XG4gICAgdGhpcy5pbml0aWFsRW5naW5lQm91bmRzTWF4WSA9IHJlbmRlci5ib3VuZHMubWF4LnlcbiAgICB0aGlzLmNlbnRlciA9IHtcbiAgICAgIHg6IHdpZHRoIC8gMixcbiAgICAgIHk6IGhlaWdodCAvIDJcbiAgICB9XG4gIH1cblxuICBmb2xsb3cgKGJvZHkpIHtcbiAgICBFdmVudHMub24odGhpcy5lbmdpbmUsICdiZWZvcmVVcGRhdGUnLCBmb2xsb3cuYmluZCh0aGlzLCBib2R5KSlcbiAgfVxuXG4gIHNjYWxlIChzY2FsZVgsIHNjYWxlWSA9IHNjYWxlWCkge1xuICAgIE1vdXNlLnNldFNjYWxlKHRoaXMubW91c2VDb25zdHJhaW50Lm1vdXNlLCB7XG4gICAgICB4OiB0aGlzLnNjYWxlWCxcbiAgICAgIHk6IHRoaXMuc2NhbGVZXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYXBXb3JsZFxuIiwiLyogZ2xvYmFsIE1hdHRlciAqL1xuZXhwb3J0IGNvbnN0IEVuZ2luZSA9IE1hdHRlci5FbmdpbmVcbmV4cG9ydCBjb25zdCBSZW5kZXIgPSBNYXR0ZXIuUmVuZGVyXG5leHBvcnQgY29uc3QgV29ybGQgPSBNYXR0ZXIuV29ybGRcbmV4cG9ydCBjb25zdCBCb2RpZXMgPSBNYXR0ZXIuQm9kaWVzXG5leHBvcnQgY29uc3QgRXZlbnRzID0gTWF0dGVyLkV2ZW50c1xuZXhwb3J0IGNvbnN0IEJvZHkgPSBNYXR0ZXIuQm9keVxuZXhwb3J0IGNvbnN0IFZlY3RvciA9IE1hdHRlci5WZWN0b3JcbmV4cG9ydCBjb25zdCBDb21wb3NpdGUgPSBNYXR0ZXIuQ29tcG9zaXRlXG5leHBvcnQgY29uc3QgTW91c2UgPSBNYXR0ZXIuTW91c2VcbmV4cG9ydCBjb25zdCBNb3VzZUNvbnN0cmFpbnQgPSBNYXR0ZXIuTW91c2VDb25zdHJhaW50XG4iLCJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cydcblxuY29uc3QgTUFYX01FU1NBR0VfQ09VTlQgPSA1MDBcblxuY2xhc3MgTWVzc2FnZXMgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuX21lc3NhZ2VzID0gW11cbiAgfVxuXG4gIGdldCBsaXN0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXNcbiAgfVxuXG4gIGFkZCAobXNnKSB7XG4gICAgbGV0IGxlbmd0aCA9IHRoaXMuX21lc3NhZ2VzLnVuc2hpZnQobXNnKVxuICAgIGlmIChsZW5ndGggPiBNQVhfTUVTU0FHRV9DT1VOVCkge1xuICAgICAgdGhpcy5fbWVzc2FnZXMucG9wKClcbiAgICB9XG4gICAgdGhpcy5lbWl0KCdtb2RpZmllZCcpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1lc3NhZ2VzKClcbiIsIi8qIGdsb2JhbCBQSVhJICovXG5cbmV4cG9ydCBjb25zdCBBcHBsaWNhdGlvbiA9IFBJWEkuQXBwbGljYXRpb25cbmV4cG9ydCBjb25zdCBDb250YWluZXIgPSBQSVhJLkNvbnRhaW5lclxuZXhwb3J0IGNvbnN0IGxvYWRlciA9IFBJWEkubG9hZGVyXG5leHBvcnQgY29uc3QgcmVzb3VyY2VzID0gUElYSS5sb2FkZXIucmVzb3VyY2VzXG5leHBvcnQgY29uc3QgU3ByaXRlID0gUElYSS5TcHJpdGVcbmV4cG9ydCBjb25zdCBUZXh0ID0gUElYSS5UZXh0XG5leHBvcnQgY29uc3QgVGV4dFN0eWxlID0gUElYSS5UZXh0U3R5bGVcblxuZXhwb3J0IGNvbnN0IEdyYXBoaWNzID0gUElYSS5HcmFwaGljc1xuZXhwb3J0IGNvbnN0IEJMRU5EX01PREVTID0gUElYSS5CTEVORF9NT0RFU1xuZXhwb3J0IGNvbnN0IGRpc3BsYXkgPSBQSVhJLmRpc3BsYXlcbmV4cG9ydCBjb25zdCB1dGlscyA9IFBJWEkudXRpbHNcbmV4cG9ydCBjb25zdCBPYnNlcnZhYmxlUG9pbnQgPSBQSVhJLk9ic2VydmFibGVQb2ludFxuIiwiaW1wb3J0IHsgZGlzcGxheSB9IGZyb20gJy4vUElYSSdcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBkaXNwbGF5LkxheWVyIHtcbiAgY3JlYXRlICgpIHt9XG5cbiAgZGVzdHJveSAoKSB7fVxuXG4gIHRpY2sgKGRlbHRhKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTY2VuZVxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5cbmNvbnN0IFRleHR1cmUgPSB7XG4gIGdldCBUZXJyYWluQXRsYXMgKCkge1xuICAgIHJldHVybiByZXNvdXJjZXNbJ2ltYWdlcy90ZXJyYWluX2F0bGFzLmpzb24nXVxuICB9LFxuICBnZXQgQmFzZU91dEF0bGFzICgpIHtcbiAgICByZXR1cm4gcmVzb3VyY2VzWydpbWFnZXMvYmFzZV9vdXRfYXRsYXMuanNvbiddXG4gIH0sXG5cbiAgZ2V0IEFpciAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydlbXB0eS5wbmcnXVxuICB9LFxuICBnZXQgR3Jhc3MgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1snZ3Jhc3MucG5nJ11cbiAgfSxcbiAgZ2V0IEdyb3VuZCAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydicmljay10aWxlLnBuZyddXG4gIH0sXG5cbiAgZ2V0IFdhbGwgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1snd2FsbC5wbmcnXVxuICB9LFxuICBnZXQgSXJvbkZlbmNlICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ2lyb24tZmVuY2UucG5nJ11cbiAgfSxcbiAgZ2V0IFJvb3QgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1sncm9vdC5wbmcnXVxuICB9LFxuICBnZXQgVHJlZSAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWyd0cmVlLnBuZyddXG4gIH0sXG5cbiAgZ2V0IFRyZWFzdXJlICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ3RyZWFzdXJlLnBuZyddXG4gIH0sXG4gIGdldCBEb29yICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ2lyb24tZmVuY2UucG5nJ11cbiAgfSxcbiAgZ2V0IFRvcmNoICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ3RvcmNoLnBuZyddXG4gIH0sXG4gIGdldCBHcmFzc0RlY29yYXRlMSAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydncmFzcy1kZWNvcmF0ZS0xLnBuZyddXG4gIH0sXG4gIGdldCBCdWxsZXQgKCkge1xuICAgIHJldHVybiByZXNvdXJjZXNbJ2ltYWdlcy9maXJlX2JvbHQucG5nJ10udGV4dHVyZVxuICB9LFxuXG4gIGdldCBSb2NrICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ3JvY2sucG5nJ11cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlXG4iLCJjb25zdCBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSVxuXG5jbGFzcyBWZWN0b3Ige1xuICBjb25zdHJ1Y3RvciAoeCwgeSkge1xuICAgIHRoaXMueCA9IHhcbiAgICB0aGlzLnkgPSB5XG4gIH1cblxuICBzdGF0aWMgZnJvbVBvaW50IChwKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IocC54LCBwLnkpXG4gIH1cblxuICBzdGF0aWMgZnJvbVJhZExlbmd0aCAocmFkLCBsZW5ndGgpIHtcbiAgICBsZXQgeCA9IGxlbmd0aCAqIE1hdGguY29zKHJhZClcbiAgICBsZXQgeSA9IGxlbmd0aCAqIE1hdGguc2luKHJhZClcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih4LCB5KVxuICB9XG5cbiAgY2xvbmUgKCkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCwgdGhpcy55KVxuICB9XG5cbiAgYWRkICh2KSB7XG4gICAgdGhpcy54ICs9IHYueFxuICAgIHRoaXMueSArPSB2LnlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3ViICh2KSB7XG4gICAgdGhpcy54IC09IHYueFxuICAgIHRoaXMueSAtPSB2LnlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgaW52ZXJ0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhcigtMSlcbiAgfVxuXG4gIG11bHRpcGx5U2NhbGFyIChzKSB7XG4gICAgdGhpcy54ICo9IHNcbiAgICB0aGlzLnkgKj0gc1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkaXZpZGVTY2FsYXIgKHMpIHtcbiAgICBpZiAocyA9PT0gMCkge1xuICAgICAgdGhpcy54ID0gMFxuICAgICAgdGhpcy55ID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhcigxIC8gcylcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRvdCAodikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnlcbiAgfVxuXG4gIGdldCBsZW5ndGggKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KVxuICB9XG5cbiAgbGVuZ3RoU3EgKCkge1xuICAgIHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnlcbiAgfVxuXG4gIG5vcm1hbGl6ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2aWRlU2NhbGFyKHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgZGlzdGFuY2VUbyAodikge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0YW5jZVRvU3EodikpXG4gIH1cblxuICBkaXN0YW5jZVRvU3EgKHYpIHtcbiAgICBsZXQgZHggPSB0aGlzLnggLSB2LnhcbiAgICBsZXQgZHkgPSB0aGlzLnkgLSB2LnlcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHlcbiAgfVxuXG4gIHNldCAoeCwgeSkge1xuICAgIHRoaXMueCA9IHhcbiAgICB0aGlzLnkgPSB5XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFggKHgpIHtcbiAgICB0aGlzLnggPSB4XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFkgKHkpIHtcbiAgICB0aGlzLnkgPSB5XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldExlbmd0aCAobCkge1xuICAgIHZhciBvbGRMZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIGlmIChvbGRMZW5ndGggIT09IDAgJiYgbCAhPT0gb2xkTGVuZ3RoKSB7XG4gICAgICB0aGlzLm11bHRpcGx5U2NhbGFyKGwgLyBvbGRMZW5ndGgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBsZXJwICh2LCBhbHBoYSkge1xuICAgIHRoaXMueCArPSAodi54IC0gdGhpcy54KSAqIGFscGhhXG4gICAgdGhpcy55ICs9ICh2LnkgLSB0aGlzLnkpICogYWxwaGFcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0IHJhZCAoKSB7XG4gICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpXG4gIH1cblxuICBnZXQgZGVnICgpIHtcbiAgICByZXR1cm4gdGhpcy5yYWQgKiBkZWdyZWVzXG4gIH1cblxuICBlcXVhbHMgKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSB2LnggJiYgdGhpcy55ID09PSB2LnlcbiAgfVxuXG4gIHJvdGF0ZSAodGhldGEpIHtcbiAgICB2YXIgeHRlbXAgPSB0aGlzLnhcbiAgICB0aGlzLnggPSB0aGlzLnggKiBNYXRoLmNvcyh0aGV0YSkgLSB0aGlzLnkgKiBNYXRoLnNpbih0aGV0YSlcbiAgICB0aGlzLnkgPSB4dGVtcCAqIE1hdGguc2luKHRoZXRhKSArIHRoaXMueSAqIE1hdGguY29zKHRoZXRhKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmVjdG9yXG4iLCJjbGFzcyBHbG9iYWxFdmVudE1hbmFnZXIge1xuICBzZXRJbnRlcmFjdGlvbiAoaW50ZXJhY3Rpb24pIHtcbiAgICB0aGlzLmludGVyYWN0aW9uID0gaW50ZXJhY3Rpb25cbiAgfVxuXG4gIG9uIChldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmludGVyYWN0aW9uLm9uKGV2ZW50TmFtZSwgaGFuZGxlcilcbiAgfVxuXG4gIG9mZiAoZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5pbnRlcmFjdGlvbi5vZmYoZXZlbnROYW1lLCBoYW5kbGVyKVxuICB9XG5cbiAgZW1pdCAoZXZlbnROYW1lLCAuLi5hcmdzKSB7XG4gICAgdGhpcy5pbnRlcmFjdGlvbi5lbWl0KGV2ZW50TmFtZSwgLi4uYXJncylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgR2xvYmFsRXZlbnRNYW5hZ2VyKClcbiIsImltcG9ydCBXYWxsIGZyb20gJy4uL29iamVjdHMvV2FsbCdcclxuaW1wb3J0IEFpciBmcm9tICcuLi9vYmplY3RzL0FpcidcclxuaW1wb3J0IEdyYXNzIGZyb20gJy4uL29iamVjdHMvR3Jhc3MnXHJcbmltcG9ydCBUcmVhc3VyZSBmcm9tICcuLi9vYmplY3RzL1RyZWFzdXJlJ1xyXG5pbXBvcnQgRG9vciBmcm9tICcuLi9vYmplY3RzL0Rvb3InXHJcbmltcG9ydCBUb3JjaCBmcm9tICcuLi9vYmplY3RzL1RvcmNoJ1xyXG5pbXBvcnQgR3JvdW5kIGZyb20gJy4uL29iamVjdHMvR3JvdW5kJ1xyXG5pbXBvcnQgSXJvbkZlbmNlIGZyb20gJy4uL29iamVjdHMvSXJvbkZlbmNlJ1xyXG5pbXBvcnQgUm9vdCBmcm9tICcuLi9vYmplY3RzL1Jvb3QnXHJcbmltcG9ydCBUcmVlIGZyb20gJy4uL29iamVjdHMvVHJlZSdcclxuaW1wb3J0IEdyYXNzRGVjb3JhdGUxIGZyb20gJy4uL29iamVjdHMvR3Jhc3NEZWNvcmF0ZTEnXHJcbmltcG9ydCBGaXJlQm9sdCBmcm9tICcuLi9vYmplY3RzL3NraWxscy9GaXJlQm9sdCdcclxuaW1wb3J0IFdhbGxTaG9vdEJvbHQgZnJvbSAnLi4vb2JqZWN0cy9XYWxsU2hvb3RCb2x0J1xyXG5cclxuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcclxuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEnXHJcbmltcG9ydCBPcGVyYXRlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL09wZXJhdGUnXHJcblxyXG4vLyAweDAwMDAgfiAweDAwMGZcclxuY29uc3QgSXRlbXNTdGF0aWMgPSBbXHJcbiAgQWlyLCBHcmFzcywgR3JvdW5kXHJcbl1cclxuLy8gMHgwMDEwIH4gMHgwMGZmXHJcbmNvbnN0IEl0ZW1zU3RheSA9IFtcclxuICAvLyAweDAwMTAsIDB4MDAxMSwgMHgwMDEyXHJcbiAgV2FsbCwgSXJvbkZlbmNlLCBSb290LCBUcmVlXHJcbl1cclxuLy8gMHgwMTAwIH4gMHgwMWZmXHJcbmNvbnN0IEl0ZW1zT3RoZXIgPSBbXHJcbiAgVHJlYXN1cmUsIERvb3IsIFRvcmNoLCBHcmFzc0RlY29yYXRlMSwgRmlyZUJvbHQsIFdhbGxTaG9vdEJvbHRcclxuXVxyXG4vLyAweDAyMDAgfiAweDAyZmZcclxuY29uc3QgQWJpbGl0aWVzID0gW1xyXG4gIE1vdmUsIENhbWVyYSwgT3BlcmF0ZVxyXG5dXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFuY2VCeUl0ZW1JZCAoaXRlbUlkLCBwYXJhbXMpIHtcclxuICBsZXQgVHlwZXNcclxuICBpdGVtSWQgPSBwYXJzZUludChpdGVtSWQsIDE2KVxyXG4gIGlmICgoaXRlbUlkICYgMHhmZmYwKSA9PT0gMCkge1xyXG4gICAgLy8g5Zyw5p2/XHJcbiAgICBUeXBlcyA9IEl0ZW1zU3RhdGljXHJcbiAgfSBlbHNlIGlmICgoaXRlbUlkICYgMHhmZjAwKSA9PT0gMCkge1xyXG4gICAgVHlwZXMgPSBJdGVtc1N0YXlcclxuICAgIGl0ZW1JZCAtPSAweDAwMTBcclxuICB9IGVsc2UgaWYgKChpdGVtSWQgJiAweGZmMDApID4+PiA4ID09PSAxKSB7XHJcbiAgICBUeXBlcyA9IEl0ZW1zT3RoZXJcclxuICAgIGl0ZW1JZCAtPSAweDAxMDBcclxuICB9IGVsc2Uge1xyXG4gICAgVHlwZXMgPSBBYmlsaXRpZXNcclxuICAgIGl0ZW1JZCAtPSAweDAyMDBcclxuICB9XHJcbiAgcmV0dXJuIG5ldyBUeXBlc1tpdGVtSWRdKHBhcmFtcylcclxufVxyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgQWlyIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLkFpcilcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFpclxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5pbXBvcnQgeyBSRVBMWSwgQUJJTElUWV9NT1ZFLCBBQklMSVRZX0RBTUFHRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmltcG9ydCBMZWFybiBmcm9tICcuL2FiaWxpdGllcy9MZWFybidcbmltcG9ydCBNb3ZlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL01vdmUnXG5pbXBvcnQgSGVhbHRoIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0hlYWx0aCdcbmltcG9ydCBEYW1hZ2UgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvRGFtYWdlJ1xuXG5jb25zdCBIZWFsdGhQb2ludCA9IDFcblxuY2xhc3MgQnVsbGV0IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh7c3BlZWQgPSAxLCBkYW1hZ2UgPSAxLCBmb3JjZSA9IDB9ID0ge30pIHtcbiAgICBzdXBlcihUZXh0dXJlLkJ1bGxldClcblxuICAgIG5ldyBMZWFybigpLmNhcnJ5QnkodGhpcylcbiAgICAgIC5sZWFybihuZXcgTW92ZShbc3BlZWQsIDBdKSlcbiAgICAgIC5sZWFybihuZXcgSGVhbHRoKEhlYWx0aFBvaW50KSlcbiAgICAgIC5sZWFybihuZXcgRGFtYWdlKFtkYW1hZ2UsIGZvcmNlXSkpXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbignZGllJywgdGhpcy5vbkRpZS5iaW5kKHRoaXMpKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gUkVQTFkgfVxuXG4gIGJvZHlPcHQgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1NlbnNvcjogdHJ1ZSxcbiAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICBjYXRlZ29yeTogMGIxMDAsXG4gICAgICAgIG1hc2s6IDBiMTAxXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcbiAgICBpZiAodGhpcy5vd25lciA9PT0gb3BlcmF0b3IgfHxcbiAgICAgIHRoaXMub3duZXIgPT09IG9wZXJhdG9yLm93bmVyKSB7XG4gICAgICAvLyDpgb/lhY3oh6rmrrpcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgZGFtYWdlQWJpbGl0eSA9IHRoaXNbQUJJTElUWV9EQU1BR0VdXG4gICAgZGFtYWdlQWJpbGl0eS5lZmZlY3Qob3BlcmF0b3IpXG4gICAgLy8g6Ieq5oiR5q+A5ruFXG4gICAgdGhpcy5vbkRpZSgpXG4gIH1cblxuICBvbkRpZSAoKSB7XG4gICAgdGhpcy5wYXJlbnQud2lsbFJlbW92ZUNoaWxkKHRoaXMpXG4gIH1cblxuICBzZXRPd25lciAob3duZXIpIHtcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0J1bGxldCdcbiAgfVxuXG4gIHNheSAoKSB7XG4gICAgLy8gc2F5IG5vdGhpbmdcbiAgfVxuXG4gIHNldERpcmVjdGlvbiAodmVjdG9yKSB7XG4gICAgbGV0IG1vdmVBYmlsaXR5ID0gdGhpc1tBQklMSVRZX01PVkVdXG4gICAgaWYgKG1vdmVBYmlsaXR5KSB7XG4gICAgICBtb3ZlQWJpbGl0eS5zZXREaXJlY3Rpb24odmVjdG9yKVxuICAgICAgdGhpcy5yb3RhdGUodmVjdG9yLnJhZClcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQnVsbGV0XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcbmltcG9ydCB7IFJFUExZLCBBQklMSVRZX01BTkEgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5pbXBvcnQgTGVhcm4gZnJvbSAnLi9hYmlsaXRpZXMvTGVhcm4nXG5pbXBvcnQgTW92ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9Nb3ZlJ1xuaW1wb3J0IEtleU1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvS2V5TW92ZSdcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhJ1xuaW1wb3J0IENhcnJ5IGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0NhcnJ5J1xuaW1wb3J0IEZpcmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvRmlyZSdcbmltcG9ydCBLZXlGaXJlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0tleUZpcmUnXG5pbXBvcnQgUm90YXRlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL1JvdGF0ZSdcbmltcG9ydCBIZWFsdGggZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvSGVhbHRoJ1xuaW1wb3J0IE1hbmEgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTWFuYSdcbmltcG9ydCBGaXJlQm9sdCBmcm9tICcuLi9vYmplY3RzL3NraWxscy9GaXJlQm9sdCdcblxuY2xhc3MgQ2F0IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLlJvY2spXG5cbiAgICBsZXQgY2FycnkgPSBuZXcgQ2FycnkoMylcbiAgICBuZXcgTGVhcm4oKS5jYXJyeUJ5KHRoaXMpXG4gICAgICAubGVhcm4obmV3IE1vdmUoWzFdKSlcbiAgICAgIC5sZWFybihuZXcgS2V5TW92ZSgpKVxuICAgICAgLmxlYXJuKG5ldyBDYW1lcmEoNSkpXG4gICAgICAubGVhcm4oY2FycnkpXG4gICAgICAubGVhcm4obmV3IEZpcmUoKSlcbiAgICAgIC5sZWFybihuZXcgUm90YXRlKCkpXG4gICAgICAubGVhcm4obmV3IEtleUZpcmUoKSlcbiAgICAgIC5sZWFybihuZXcgSGVhbHRoKDIwKSlcbiAgICAgIC5sZWFybihuZXcgTWFuYSgyMCkpXG5cbiAgICBjYXJyeS50YWtlKG5ldyBGaXJlQm9sdCgwKSwgSW5maW5pdHkpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XG5cbiAgYm9keU9wdCAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICBjYXRlZ29yeTogMGIxLFxuICAgICAgICBtYXNrOiAwYjExMVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgdGhpc1tBQklMSVRZX01BTkFdLnRpY2soZGVsdGEpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd5b3UnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2F0XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgU1RBWSwgQUJJTElUWV9PUEVSQVRFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIERvb3IgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAobWFwKSB7XHJcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcclxuICAgIHN1cGVyKFRleHR1cmUuRG9vcilcclxuXHJcbiAgICB0aGlzLm1hcCA9IG1hcFswXVxyXG4gICAgdGhpcy50b1Bvc2l0aW9uID0gbWFwWzFdXHJcblxyXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XHJcblxyXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XHJcbiAgICBsZXQgYWJpbGl0eSA9IG9wZXJhdG9yW0FCSUxJVFlfT1BFUkFURV1cclxuICAgIGlmIChhYmlsaXR5KSB7XHJcbiAgICAgIGFiaWxpdHkodGhpcylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG9wZXJhdG9yLmVtaXQoJ2NvbGxpZGUnLCB0aGlzKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgW0FCSUxJVFlfT1BFUkFURV0gKCkge1xyXG4gICAgdGhpcy5zYXkoWydHZXQgaW4gJywgdGhpcy5tYXAsICcgbm93LiddLmpvaW4oJycpKVxyXG4gICAgdGhpcy5lbWl0KCd1c2UnKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdEb29yJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG9vclxyXG4iLCJpbXBvcnQgeyBTcHJpdGUsIE9ic2VydmFibGVQb2ludCB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IHsgQm9kaWVzLCBCb2R5IH0gZnJvbSAnLi4vbGliL01hdHRlcidcbmltcG9ydCB7IFNUQVksIFNUQVRJQywgQUJJTElUWV9NT1ZFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBtZXNzYWdlcyBmcm9tICcuLi9saWIvTWVzc2FnZXMnXG5cbmZ1bmN0aW9uIG9uU2NhbGUgKCkge1xuICB0aGlzLnNjYWxlLmNvcHkodGhpcy5zY2FsZUV4KVxuICBpZiAodGhpcy5ib2R5KSB7XG4gICAgQm9keS5zY2FsZSh0aGlzLmJvZHksIHRoaXMuc2NhbGVFeC54LCB0aGlzLnNjYWxlRXgueSlcbiAgfVxufVxuXG5mdW5jdGlvbiBvblBvc2l0aW9uICgpIHtcbiAgbGV0IHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkV4XG4gIHRoaXMucG9zaXRpb24uY29weShwb3NpdGlvbilcbiAgaWYgKHRoaXMuYm9keSkge1xuICAgIHRoaXMuYm9keS5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJvZHlPcHQgKCkge1xuICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzW0FCSUxJVFlfTU9WRV1cbiAgbGV0IGZyaWN0aW9uID0gKG1vdmVBYmlsaXR5ICYmIG1vdmVBYmlsaXR5LmZyaWN0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgPyBtb3ZlQWJpbGl0eS5mcmljdGlvblxuICAgIDogMC4xXG4gIGxldCBmcmljdGlvbkFpciA9IChtb3ZlQWJpbGl0eSAmJiBtb3ZlQWJpbGl0eS5mcmljdGlvbkFpciAhPT0gdW5kZWZpbmVkKVxuICAgID8gbW92ZUFiaWxpdHkuZnJpY3Rpb25BaXJcbiAgICA6IDAuMDFcbiAgbGV0IG1hc3MgPSB0aGlzLm1hc3MgPyB0aGlzLm1hc3MgOiAxXG4gIHJldHVybiB7XG4gICAgaXNTdGF0aWM6IHRoaXMudHlwZSA9PT0gU1RBWSxcbiAgICBmcmljdGlvbixcbiAgICBmcmljdGlvbkFpcixcbiAgICBmcmljdGlvblN0YXRpYzogZnJpY3Rpb24sXG4gICAgbWFzc1xuICB9XG59XG5cbmNsYXNzIEdhbWVPYmplY3QgZXh0ZW5kcyBTcHJpdGUge1xuICBjb25zdHJ1Y3RvciAoLi4uYXJncykge1xuICAgIHN1cGVyKC4uLmFyZ3MpXG4gICAgdGhpcy5zY2FsZUV4ID0gdGhpcy5zY2FsZSAvLyBuZXcgT2JzZXJ2YWJsZVBvaW50KG9uU2NhbGUsIHRoaXMpXG4gICAgdGhpcy5wb3NpdGlvbkV4ID0gdGhpcy5wb3NpdGlvbiAvLyBuZXcgT2JzZXJ2YWJsZVBvaW50KG9uUG9zaXRpb24sIHRoaXMpXG4gIH1cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cblxuICBib2R5T3B0ICgpIHtcbiAgICByZXR1cm4ge31cbiAgfVxuXG4gIGFkZEJvZHkgKCkge1xuICAgIGlmICh0aGlzLmJvZHkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgb3B0ID0gT2JqZWN0LmFzc2lnbihib2R5T3B0LmNhbGwodGhpcyksIHRoaXMuYm9keU9wdCgpKVxuICAgIGxldCBib2R5ID0gQm9kaWVzLnJlY3RhbmdsZSh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIG9wdClcbiAgICAvLyBzeW5jIHBoeXNpYyBib2R5ICYgZGlzcGxheSBwb3NpdGlvblxuICAgIGJvZHkucG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uRXhcbiAgICB0aGlzLmJvZHkgPSBib2R5XG4gIH1cblxuICByb3RhdGUgKHJhZCwgZGVsdGEgPSBmYWxzZSkge1xuICAgIHRoaXMucm90YXRpb24gPSBkZWx0YSA/IHRoaXMucm90YXRpb24gKyByYWQgOiByYWRcbiAgICBpZiAodGhpcy5ib2R5KSB7XG4gICAgICBCb2R5LnNldEFuZ2xlKHRoaXMuYm9keSwgcmFkKVxuICAgIH1cbiAgfVxuXG4gIHNheSAobXNnKSB7XG4gICAgbWVzc2FnZXMuYWRkKG1zZylcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYW1lT2JqZWN0XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR3Jhc3MgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuR3Jhc3MpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFzc1xuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdyYXNzRGVjb3JhdGUxIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLkdyYXNzRGVjb3JhdGUxKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdHcmFzc0RlY29yYXRlMSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFzc0RlY29yYXRlMVxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEdyb3VuZCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5Hcm91bmQpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0dyb3VuZCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcm91bmRcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgSXJvbkZlbmNlIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICBzdXBlcihUZXh0dXJlLklyb25GZW5jZSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJcm9uRmVuY2VcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgUm9vdCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5Sb290KVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvb3RcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xyXG5pbXBvcnQgTGlnaHQgZnJvbSAnLi4vbGliL0xpZ2h0J1xyXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXHJcblxyXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuY2xhc3MgVG9yY2ggZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcihUZXh0dXJlLlRvcmNoKVxyXG5cclxuICAgIGxldCByYWRpdXMgPSAyXHJcblxyXG4gICAgdGhpcy5vbignYWRkZWQnLCBMaWdodC5saWdodE9uLmJpbmQobnVsbCwgdGhpcywgcmFkaXVzLCAwLjk1KSlcclxuICAgIHRoaXMub24oJ3JlbW92ZWVkJywgTGlnaHQubGlnaHRPZmYuYmluZChudWxsLCB0aGlzKSlcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAndG9yY2gnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUb3JjaFxyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgUkVQTFksIEFCSUxJVFlfQ0FSUlkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBpbnN0YW5jZUJ5SXRlbUlkIH0gZnJvbSAnLi4vbGliL3V0aWxzJ1xyXG5cclxuY2xhc3MgU2xvdCB7XHJcbiAgY29uc3RydWN0b3IgKFtpdGVtSWQsIHBhcmFtcywgY291bnRdKSB7XHJcbiAgICB0aGlzLml0ZW0gPSBpbnN0YW5jZUJ5SXRlbUlkKGl0ZW1JZCwgcGFyYW1zKVxyXG4gICAgdGhpcy5jb3VudCA9IGNvdW50XHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gW3RoaXMuaXRlbS50b1N0cmluZygpLCAnKCcsIHRoaXMuY291bnQsICcpJ10uam9pbignJylcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFRyZWFzdXJlIGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKGludmVudG9yaWVzID0gW10pIHtcclxuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxyXG4gICAgc3VwZXIoVGV4dHVyZS5UcmVhc3VyZSlcclxuXHJcbiAgICB0aGlzLmludmVudG9yaWVzID0gaW52ZW50b3JpZXMubWFwKHRyZWFzdXJlID0+IG5ldyBTbG90KHRyZWFzdXJlKSlcclxuXHJcbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XHJcblxyXG4gIGJvZHlPcHQgKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaXNTZW5zb3I6IHRydWUsXHJcbiAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xyXG4gICAgICAgIGNhdGVnb3J5OiAwYjEwLFxyXG4gICAgICAgIG1hc2s6IDBiMVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xyXG4gICAgbGV0IGNhcnJ5QWJpbGl0eSA9IG9wZXJhdG9yW0FCSUxJVFlfQ0FSUlldXHJcbiAgICBpZiAoIWNhcnJ5QWJpbGl0eSkge1xyXG4gICAgICBvcGVyYXRvci5zYXkoJ0kgY2FuXFwndCBjYXJyeSBpdGVtcyBub3QgeWV0LicpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW52ZW50b3JpZXMuZm9yRWFjaChcclxuICAgICAgdHJlYXN1cmUgPT4gY2FycnlBYmlsaXR5LnRha2UodHJlYXN1cmUuaXRlbSwgdHJlYXN1cmUuY291bnQpKVxyXG4gICAgb3BlcmF0b3Iuc2F5KFsnSSB0YWtlZCAnLCB0aGlzLnRvU3RyaW5nKCldLmpvaW4oJycpKVxyXG5cclxuICAgIHRoaXMucGFyZW50LndpbGxSZW1vdmVDaGlsZCh0aGlzKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgJ3RyZWFzdXJlOiBbJyxcclxuICAgICAgdGhpcy5pbnZlbnRvcmllcy5qb2luKCcsICcpLFxyXG4gICAgICAnXSdcclxuICAgIF0uam9pbignJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRyZWFzdXJlXHJcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgVHJlZSBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoVGV4dHVyZS5UcmVlKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyZWVcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgV2FsbCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5XYWxsKVxuXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG5cbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcbiAgICBvcGVyYXRvci5lbWl0KCdjb2xsaWRlJywgdGhpcylcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ1dhbGwnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2FsbFxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVksIEFCSUxJVFlfRklSRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmltcG9ydCBMZWFybiBmcm9tICcuL2FiaWxpdGllcy9MZWFybidcbmltcG9ydCBDYXJyeSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYXJyeSdcbmltcG9ydCBGaXJlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0ZpcmUnXG5pbXBvcnQgSGVhbHRoIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0hlYWx0aCdcbmltcG9ydCBGaXJlQm9sdCBmcm9tICcuLi9vYmplY3RzL3NraWxscy9GaXJlQm9sdCdcblxuY2xhc3MgV2FsbFNob290Qm9sdCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5XYWxsKVxuXG4gICAgbGV0IGNhcnJ5ID0gbmV3IENhcnJ5KDMpXG4gICAgbmV3IExlYXJuKCkuY2FycnlCeSh0aGlzKVxuICAgICAgLmxlYXJuKG5ldyBGaXJlKCkpXG4gICAgICAubGVhcm4oY2FycnkpXG4gICAgICAubGVhcm4obmV3IEhlYWx0aCgxMCkpXG5cbiAgICBjYXJyeS50YWtlKG5ldyBGaXJlQm9sdCgwKSwgSW5maW5pdHkpXG5cbiAgICB0aGlzLmxpZmUgPSAwXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxuICAgIHRoaXMub24oJ2RpZScsIHRoaXMub25EaWUuYmluZCh0aGlzKSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxuXG4gIGJvZHlPcHQgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1N0YXRpYzogdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XG4gICAgb3BlcmF0b3IuZW1pdCgnY29sbGlkZScsIHRoaXMpXG4gIH1cblxuICBvbkRpZSAoKSB7XG4gICAgdGhpcy5wYXJlbnQud2lsbFJlbW92ZUNoaWxkKHRoaXMpXG4gIH1cblxuICB0aWNrIChkZWx0YSkge1xuICAgIHRoaXMubGlmZSsrXG4gICAgaWYgKHRoaXMubGlmZSAlIDEwICE9PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5saWZlID0gMFxuICAgIHRoaXMucm90YXRlKE1hdGguUEkgLyAxMCwgdHJ1ZSlcblxuICAgIGxldCByYWQgPSB0aGlzLnJvdGF0aW9uXG4gICAgdGhpc1tBQklMSVRZX0ZJUkVdLmZpcmUocmFkKVxuICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZCArIE1hdGguUEkgLyAyKVxuICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZCArIE1hdGguUEkpXG4gICAgdGhpc1tBQklMSVRZX0ZJUkVdLmZpcmUocmFkICsgTWF0aC5QSSAvIDIgKiAzKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnV2FsbFNob290Qm9sdCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXYWxsU2hvb3RCb2x0XG4iLCJjb25zdCB0eXBlID0gU3ltYm9sKCdhYmlsaXR5JylcblxuY2xhc3MgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIHR5cGUgfVxuXG4gIGdldFNhbWVUeXBlQWJpbGl0eSAob3duZXIpIHtcbiAgICByZXR1cm4gb3duZXIuYWJpbGl0aWVzW3RoaXMudHlwZV1cbiAgfVxuXG4gIC8vIOaYr+WQpumcgOe9ruaPm1xuICBoYXNUb1JlcGxhY2UgKG93bmVyLCBhYmlsaXR5TmV3KSB7XG4gICAgbGV0IGFiaWxpdHlPbGQgPSB0aGlzLmdldFNhbWVUeXBlQWJpbGl0eShvd25lcilcbiAgICByZXR1cm4gIWFiaWxpdHlPbGQgfHwgYWJpbGl0eU5ldy5pc0JldHRlcihhYmlsaXR5T2xkKVxuICB9XG5cbiAgLy8g5paw6IiK5q+U6LyDXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBsZXQgYWJpbGl0eU9sZCA9IHRoaXMuZ2V0U2FtZVR5cGVBYmlsaXR5KG93bmVyKVxuICAgIGlmIChhYmlsaXR5T2xkKSB7XG4gICAgICAvLyBmaXJzdCBnZXQgdGhpcyB0eXBlIGFiaWxpdHlcbiAgICAgIGFiaWxpdHlPbGQucmVwbGFjZWRCeSh0aGlzLCBvd25lcilcbiAgICB9XG4gICAgb3duZXIuYWJpbGl0aWVzW3RoaXMudHlwZV0gPSB0aGlzXG4gIH1cblxuICByZXBsYWNlZEJ5IChvdGhlciwgb3duZXIpIHt9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIGRlbGV0ZSBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAncGx6IGV4dGVuZCB0aGlzIGNsYXNzJ1xuICB9XG5cbiAgc2VyaWFsaXplICgpIHtcbiAgICByZXR1cm4ge31cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBYmlsaXR5XG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXHJcbmltcG9ydCBMaWdodCBmcm9tICcuLi8uLi9saWIvTGlnaHQnXHJcbmltcG9ydCB7IEFCSUxJVFlfQ0FNRVJBIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIENhbWVyYSBleHRlbmRzIEFiaWxpdHkge1xyXG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5yYWRpdXMgPSB2YWx1ZVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9DQU1FUkEgfVxyXG5cclxuICBpc0JldHRlciAob3RoZXIpIHtcclxuICAgIC8vIOWPquacg+iuiuWkp1xyXG4gICAgcmV0dXJuIHRoaXMucmFkaXVzID49IG90aGVyLnJhZGl1c1xyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XHJcbiAgY2FycnlCeSAob3duZXIpIHtcclxuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXHJcbiAgICBpZiAob3duZXIucGFyZW50KSB7XHJcbiAgICAgIHRoaXMuc2V0dXAob3duZXIsIG93bmVyLnBhcmVudClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG93bmVyLm9uY2UoJ2FkZGVkJywgY29udGFpbmVyID0+IHRoaXMuc2V0dXAob3duZXIsIGNvbnRhaW5lcikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXBsYWNlZEJ5IChvdGhlciwgb3duZXIpIHtcclxuICAgIHRoaXMuZHJvcEJ5KG93bmVyKVxyXG4gIH1cclxuXHJcbiAgc2V0dXAgKG93bmVyLCBjb250YWluZXIpIHtcclxuICAgIExpZ2h0LmxpZ2h0T24ob3duZXIsIHRoaXMucmFkaXVzKVxyXG4gICAgLy8g5aaC5p6cIG93bmVyIOS4jeiiq+mhr+ekulxyXG4gICAgb3duZXIucmVtb3ZlZCA9IHRoaXMub25SZW1vdmVkLmJpbmQodGhpcywgb3duZXIpXHJcbiAgICBvd25lci5vbmNlKCdyZW1vdmVkJywgb3duZXIucmVtb3ZlZClcclxuICB9XHJcblxyXG4gIG9uUmVtb3ZlZCAob3duZXIpIHtcclxuICAgIHRoaXMuZHJvcEJ5KG93bmVyKVxyXG4gICAgLy8gb3duZXIg6YeN5paw6KKr6aGv56S6XHJcbiAgICBvd25lci5vbmNlKCdhZGRlZCcsIGNvbnRhaW5lciA9PiB0aGlzLnNldHVwKG93bmVyLCBjb250YWluZXIpKVxyXG4gIH1cclxuXHJcbiAgZHJvcEJ5IChvd25lcikge1xyXG4gICAgTGlnaHQubGlnaHRPZmYob3duZXIpXHJcbiAgICAvLyByZW1vdmUgbGlzdGVuZXJcclxuICAgIG93bmVyLm9mZigncmVtb3ZlZCcsIG93bmVyLnJlbW92ZWQpXHJcbiAgICBkZWxldGUgb3duZXIucmVtb3ZlZFxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdsaWdodCBhcmVhOiAnICsgdGhpcy5yYWRpdXNcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhbWVyYVxyXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0NBUlJZLCBBQklMSVRZX0xFQVJOIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuZnVuY3Rpb24gbmV3U2xvdCAoc2tpbGwsIGNvdW50KSB7XG4gIHJldHVybiB7XG4gICAgc2tpbGwsXG4gICAgY291bnQsXG4gICAgdG9TdHJpbmcgKCkge1xuICAgICAgcmV0dXJuIFtza2lsbC50b1N0cmluZygpLCAnKCcsIHRoaXMuY291bnQsICcpJ10uam9pbignJylcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ2FycnkgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgY29uc3RydWN0b3IgKGluaXRTbG90cykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmN1cnJlbnQgPSAwXG4gICAgdGhpcy5iYWdzID0gQXJyYXkoaW5pdFNsb3RzKS5maWxsKClcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfQ0FSUlkgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX0NBUlJZXSA9IHRoaXNcbiAgfVxuXG4gIC8vIOaaq+aZguaykuaciemZkOWItuaWveaUvuasoeaVuFxuICB0YWtlIChza2lsbCwgY291bnQgPSBJbmZpbml0eSkge1xuICAgIGxldCBvd25lciA9IHRoaXMub3duZXJcbiAgICBpZiAoc2tpbGwgaW5zdGFuY2VvZiBBYmlsaXR5ICYmIG93bmVyW0FCSUxJVFlfTEVBUk5dKSB7XG4gICAgICAvLyDlj5blvpfog73liptcbiAgICAgIG93bmVyW0FCSUxJVFlfTEVBUk5dLmxlYXJuKHNraWxsKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBrZXkgPSBza2lsbC50b1N0cmluZygpXG4gICAgbGV0IGZpcnN0RW1wdHlTbG90XG4gICAgbGV0IGZvdW5kID0gdGhpcy5iYWdzLnNvbWUoKHNsb3QsIHNpKSA9PiB7XG4gICAgICAvLyDmmqvlrZjnrKzkuIDlgIvnqbrmoLxcbiAgICAgIGlmIChzbG90ID09PSB1bmRlZmluZWQgJiYgZmlyc3RFbXB0eVNsb3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBmaXJzdEVtcHR5U2xvdCA9IHNpXG4gICAgICB9XG4gICAgICAvLyDmioDog73ljYfntJoo5ZCM6aGe5Z6LKVxuICAgICAgaWYgKHNsb3QgJiYgc2xvdC5za2lsbC50b1N0cmluZygpID09PSBrZXkgJiZcbiAgICAgICAgc2tpbGwubGV2ZWwgPiBzbG90LnNraWxsLmxldmVsKSB7XG4gICAgICAgIHRoaXMuYmFnc1tzaV0gPSBuZXdTbG90KHNraWxsLCBjb3VudClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0pXG4gICAgaWYgKCFmb3VuZCkge1xuICAgICAgaWYgKGZpcnN0RW1wdHlTbG90ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8g5rKS5pyJ56m65qC85Y+v5pS+54mp5ZOBXG4gICAgICAgIG93bmVyLnNheSgnbm8gZW1wdHkgc2xvdCBmb3IgbmV3IHNraWxsIGdvdC4nKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIOaUvuWFpeesrOS4gOWAi+epuuagvFxuICAgICAgdGhpcy5iYWdzW2ZpcnN0RW1wdHlTbG90XSA9IG5ld1Nsb3Qoc2tpbGwsIGNvdW50KVxuICAgIH1cbiAgICBvd25lci5lbWl0KCdpbnZlbnRvcnktbW9kaWZpZWQnLCBza2lsbClcbiAgfVxuXG4gIGdldFNsb3RJdGVtIChzbG90SW54KSB7XG4gICAgbGV0IHNpXG4gICAgLy8g54Wn6JGX5YyF5YyF5Yqg5YWl6aCG5bqP5p+l5om+XG4gICAgbGV0IGZvdW5kID0gdGhpcy5iYWdzLmZpbmQoKHNsb3QsIHMpID0+IHtcbiAgICAgIHNpID0gc1xuICAgICAgcmV0dXJuIHNsb3RJbngtLSA9PT0gMFxuICAgIH0pXG4gICAgbGV0IHNraWxsXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICBmb3VuZCA9IHRoaXMuYmFnc1tzaV1cbiAgICAgIHNraWxsID0gZm91bmQuc2tpbGxcbiAgICAgIC8vIOWPluWHuuW+jOa4m+S4gFxuICAgICAgaWYgKC0tZm91bmQuY291bnQgPT09IDApIHtcbiAgICAgICAgdGhpcy5iYWdzW3NpXSA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgdGhpcy5vd25lci5lbWl0KCdpbnZlbnRvcnktbW9kaWZpZWQnLCBza2lsbClcbiAgICB9XG4gICAgcmV0dXJuIHNraWxsXG4gIH1cblxuICBnZXRDdXJyZW50ICgpIHtcbiAgICBsZXQgZm91bmQgPSB0aGlzLmJhZ3NbdGhpcy5jdXJyZW50XVxuICAgIGxldCBza2lsbFxuICAgIGlmIChmb3VuZCkge1xuICAgICAgc2tpbGwgPSBmb3VuZC5za2lsbFxuICAgICAgLy8g5Y+W5Ye65b6M5rib5LiAXG4gICAgICBpZiAoLS1mb3VuZC5jb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLmJhZ3NbdGhpcy5jdXJyZW50XSA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgdGhpcy5vd25lci5lbWl0KCdpbnZlbnRvcnktbW9kaWZpZWQnLCBza2lsbClcbiAgICB9XG4gICAgcmV0dXJuIHNraWxsXG4gIH1cblxuICBzZXRDdXJyZW50IChjdXJyZW50KSB7XG4gICAgdGhpcy5jdXJyZW50ID0gY3VycmVudFxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbJ2NhcnJ5OiAnLCB0aGlzLmJhZ3Muam9pbignLCAnKV0uam9pbignJylcbiAgfVxuXG4gIC8vIFRPRE86IHNhdmUgZGF0YVxuICBzZXJpYWxpemUgKCkge1xuICAgIHJldHVybiB0aGlzLmJhZ3NcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDYXJyeVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9EQU1BR0UsIEFCSUxJVFlfSEVBTFRIIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgRGFtYWdlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yIChbZGFtYWdlID0gMSwgZm9yY2UgPSAwLjAxXSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmRhbWFnZSA9IGRhbWFnZVxuICAgIHRoaXMuZm9yY2UgPSBmb3JjZVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9EQU1BR0UgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX0RBTUFHRV0gPSB0aGlzXG4gIH1cblxuICBlZmZlY3QgKG90aGVyKSB7XG4gICAgbGV0IGhlYWx0aEFiaWxpdHkgPSBvdGhlcltBQklMSVRZX0hFQUxUSF1cbiAgICAvLyDlgrflrrPku5bkurpcbiAgICBpZiAoaGVhbHRoQWJpbGl0eSkge1xuICAgICAgaGVhbHRoQWJpbGl0eS5nZXRIdXJ0KHRoaXMub3duZXIpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbXG4gICAgICAnRGFtYWdlOiAnLFxuICAgICAgdGhpcy5kYW1hZ2UsXG4gICAgICAnLCAnLFxuICAgICAgdGhpcy5mb3JjZVxuICAgIF0uam9pbignJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEYW1hZ2VcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfRklSRSwgQUJJTElUWV9DQVJSWSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEZpcmUgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9GSVJFIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9GSVJFXSA9IHRoaXNcbiAgfVxuXG4gIGZpcmUgKHJhZCkge1xuICAgIGxldCBjYXN0ZXIgPSB0aGlzLm93bmVyXG5cbiAgICBsZXQgY2FycnlBYmlsaXR5ID0gY2FzdGVyW0FCSUxJVFlfQ0FSUlldXG4gICAgbGV0IEJ1bGxldFR5cGUgPSBjYXJyeUFiaWxpdHkuZ2V0Q3VycmVudCgpXG4gICAgaWYgKCFCdWxsZXRUeXBlKSB7XG4gICAgICAvLyBubyBza2lsbCBhdCBpbnZlbnRvcnlcbiAgICAgIGNvbnNvbGUubG9nKCdubyBza2lsbCBhdCBpbnZlbnRvcnknKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIEJ1bGxldFR5cGUuY2FzdCh7Y2FzdGVyLCByYWR9KVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnRmlyZSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaXJlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0hFQUxUSCwgQUJJTElUWV9EQU1BR0UsIEFCSUxJVFlfTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXG5cbmNsYXNzIEhlYWx0aCBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAodmFsdWUgPSAxKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMudmFsdWVNYXggPSB2YWx1ZVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9IRUFMVEggfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX0hFQUxUSF0gPSB0aGlzXG4gIH1cblxuICBnZXRIdXJ0IChmcm9tKSB7XG4gICAgbGV0IGRhbWFnZUFiaWxpdHkgPSBmcm9tW0FCSUxJVFlfREFNQUdFXVxuICAgIGlmICghZGFtYWdlQWJpbGl0eSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBmb3JjZSA9IGRhbWFnZUFiaWxpdHkuZm9yY2VcbiAgICBsZXQgZGFtYWdlID0gZGFtYWdlQWJpbGl0eS5kYW1hZ2VcbiAgICBsZXQgcHJlSHAgPSB0aGlzLnZhbHVlXG4gICAgbGV0IHN1ZkhwID0gTWF0aC5tYXgodGhpcy52YWx1ZSAtIGRhbWFnZSwgMClcbiAgICBsZXQgdmVjdG9yID0gVmVjdG9yLmZyb21Qb2ludCh0aGlzLm93bmVyLnBvc2l0aW9uKVxuICAgICAgLnN1Yihmcm9tLnBvc2l0aW9uKVxuICAgICAgLnNldExlbmd0aChmb3JjZSlcblxuICAgIHRoaXMub3duZXIuc2F5KFtcbiAgICAgIHRoaXMub3duZXIudG9TdHJpbmcoKSxcbiAgICAgICcgZ2V0IGh1cnQgJyxcbiAgICAgIGRhbWFnZSxcbiAgICAgICc6ICcsXG4gICAgICBwcmVIcCxcbiAgICAgICcgLT4gJyxcbiAgICAgIHN1ZkhwXG4gICAgXS5qb2luKCcnKSlcblxuICAgIGxldCBtb3ZlQWJpbGl0eSA9IHRoaXMub3duZXJbQUJJTElUWV9NT1ZFXVxuICAgIGlmIChtb3ZlQWJpbGl0eSkge1xuICAgICAgbW92ZUFiaWxpdHkucHVuY2godmVjdG9yKVxuICAgIH1cblxuICAgIHRoaXMudmFsdWUgPSBzdWZIcFxuXG4gICAgdGhpcy5vd25lci5lbWl0KCdoZWFsdGgtY2hhbmdlJylcbiAgICBpZiAodGhpcy52YWx1ZSA8PSAwKSB7XG4gICAgICB0aGlzLm93bmVyLmVtaXQoJ2RpZScpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbXG4gICAgICAnSGVhbHRoOiAnLFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgICcgLyAnLFxuICAgICAgdGhpcy52YWx1ZU1heFxuICAgIF0uam9pbignJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBIZWFsdGhcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfRklSRSwgQUJJTElUWV9LRVlfRklSRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgZ2xvYmFsRXZlbnRNYW5hZ2VyIGZyb20gJy4uLy4uL2xpYi9nbG9iYWxFdmVudE1hbmFnZXInXG5cbmNvbnN0IEtFWVMgPSBTeW1ib2woJ2tleXMnKVxuXG5jbGFzcyBLZXlGaXJlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfS0VZX0ZJUkUgfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICBvd25lcltBQklMSVRZX0tFWV9GSVJFXSA9IHRoaXNcbiAgICB0aGlzLnNldHVwKG93bmVyKVxuICB9XG5cbiAgc2V0dXAgKG93bmVyKSB7XG4gICAgbGV0IGZpcmVBYmlsaXR5ID0gb3duZXJbQUJJTElUWV9GSVJFXVxuICAgIGxldCBtb3VzZUhhbmRsZXIgPSBlID0+IHtcbiAgICAgIGlmIChlLnN0b3BwZWQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgnZmlyZScpXG4gICAgfVxuICAgIGxldCBmaXJlSGFuZGxlciA9IGZpcmVBYmlsaXR5LmZpcmUuYmluZChmaXJlQWJpbGl0eSlcblxuICAgIG93bmVyW0tFWVNdID0ge1xuICAgICAgbW91c2Vkb3duOiBtb3VzZUhhbmRsZXIsXG4gICAgICBmaXJlOiBmaXJlSGFuZGxlclxuICAgIH1cbiAgICBPYmplY3QuZW50cmllcyhvd25lcltLRVlTXSkuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5vbihldmVudE5hbWUsIGhhbmRsZXIpXG4gICAgfSlcbiAgfVxuXG4gIGRyb3BCeSAob3duZXIpIHtcbiAgICBzdXBlci5kcm9wQnkob3duZXIpXG4gICAgT2JqZWN0LmVudHJpZXMob3duZXJbS0VZU10pLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIub2ZmKGV2ZW50TmFtZSwgaGFuZGxlcilcbiAgICB9KVxuICAgIGRlbGV0ZSBvd25lcltLRVlTXVxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX0tFWV9GSVJFXVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAna2V5IGZpcmUnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS2V5RmlyZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcbmltcG9ydCB7IExFRlQsIFVQLCBSSUdIVCwgRE9XTiB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb250cm9sJ1xuaW1wb3J0IHsgQUJJTElUWV9NT1ZFLCBBQklMSVRZX0tFWV9NT1ZFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vLi4vbGliL1ZlY3RvcidcblxuY29uc3QgS0VZUyA9IFN5bWJvbCgna2V5cycpXG5cbmNsYXNzIEtleU1vdmUgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9LRVlfTU9WRSB9XG5cbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIG93bmVyW0FCSUxJVFlfS0VZX01PVkVdID0gdGhpc1xuICAgIHRoaXMuc2V0dXAob3duZXIpXG4gIH1cblxuICBzZXR1cCAob3duZXIpIHtcbiAgICBsZXQgZGlyID0ge31cbiAgICBsZXQgY2FsY0RpciA9ICgpID0+IHtcbiAgICAgIGxldCB2ZWN0b3IgPSBuZXcgVmVjdG9yKC1kaXJbTEVGVF0gKyBkaXJbUklHSFRdLCAtZGlyW1VQXSArIGRpcltET1dOXSlcbiAgICAgIGlmICh2ZWN0b3IubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdmVjdG9yLm11bHRpcGx5U2NhbGFyKDAuMTcpXG4gICAgICBvd25lcltBQklMSVRZX01PVkVdLmFkZERpcmVjdGlvbih2ZWN0b3IpXG4gICAgfVxuICAgIGxldCBiaW5kID0gY29kZSA9PiB7XG4gICAgICBkaXJbY29kZV0gPSAwXG4gICAgICBsZXQgcHJlSGFuZGxlciA9IGUgPT4ge1xuICAgICAgICBlLnByZXZlbnRSZXBlYXQoKVxuICAgICAgICBkaXJbY29kZV0gPSAxXG4gICAgICAgIG93bmVyW0FCSUxJVFlfTU9WRV0uY2xlYXJQYXRoKClcbiAgICAgIH1cbiAgICAgIGtleWJvYXJkSlMuYmluZChjb2RlLCBwcmVIYW5kbGVyLCAoKSA9PiB7XG4gICAgICAgIGRpcltjb2RlXSA9IDBcbiAgICAgIH0pXG4gICAgICByZXR1cm4gcHJlSGFuZGxlclxuICAgIH1cblxuICAgIGtleWJvYXJkSlMuc2V0Q29udGV4dCgnJylcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBvd25lcltLRVlTXSA9IHtcbiAgICAgICAgW0xFRlRdOiBiaW5kKExFRlQpLFxuICAgICAgICBbVVBdOiBiaW5kKFVQKSxcbiAgICAgICAgW1JJR0hUXTogYmluZChSSUdIVCksXG4gICAgICAgIFtET1dOXTogYmluZChET1dOKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoY2FsY0RpciwgMTcpXG4gIH1cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgc3VwZXIuZHJvcEJ5KG93bmVyKVxuICAgIGtleWJvYXJkSlMud2l0aENvbnRleHQoJycsICgpID0+IHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW0tFWVNdKS5mb3JFYWNoKChba2V5LCBoYW5kbGVyXSkgPT4ge1xuICAgICAgICBrZXlib2FyZEpTLnVuYmluZChrZXksIGhhbmRsZXIpXG4gICAgICB9KVxuICAgIH0pXG4gICAgZGVsZXRlIG93bmVyW0tFWVNdXG4gICAgZGVsZXRlIG93bmVyW0FCSUxJVFlfS0VZX01PVkVdXG5cbiAgICBjbGVhckludGVydmFsKHRoaXMudGltZXIpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdrZXkgY29udHJvbCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLZXlNb3ZlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0xFQVJOIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgTGVhcm4gZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9MRUFSTiB9XG5cbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIGlmICghb3duZXIuYWJpbGl0aWVzKSB7XG4gICAgICBvd25lci5hYmlsaXRpZXMgPSB7fVxuICAgICAgb3duZXIudGlja0FiaWxpdGllcyA9IHt9XG4gICAgfVxuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9MRUFSTl0gPSB0aGlzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGxlYXJuIChhYmlsaXR5KSB7XG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxuICAgIGlmIChhYmlsaXR5Lmhhc1RvUmVwbGFjZShvd25lciwgYWJpbGl0eSkpIHtcbiAgICAgIGFiaWxpdHkuY2FycnlCeShvd25lcilcbiAgICAgIG93bmVyLmVtaXQoJ2FiaWxpdHktY2FycnknLCBhYmlsaXR5KVxuICAgIH1cbiAgICByZXR1cm4gb3duZXJbQUJJTElUWV9MRUFSTl1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2xlYXJuaW5nJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExlYXJuXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX01BTkEgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBNYW5hIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yICh2YWx1ZSA9IDEsIHJlZmlsbCA9IDAuMDUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gICAgdGhpcy52YWx1ZU1heCA9IHZhbHVlXG4gICAgdGhpcy5yZWZpbGwgPSByZWZpbGxcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfTUFOQSB9XG5cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMub3duZXIgPSBvd25lclxuICAgIG93bmVyW0FCSUxJVFlfTUFOQV0gPSB0aGlzXG4gIH1cblxuICBpc0Vub3VnaCAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZSAtIHZhbHVlID49IDBcbiAgfVxuXG4gIHJlZHVjZSAodmFsdWUpIHtcbiAgICB0aGlzLnZhbHVlID0gTWF0aC5tYXgodGhpcy52YWx1ZSAtIHZhbHVlLCAwKVxuICAgIHRoaXMub3duZXIuZW1pdCgnbWFuYS1jaGFuZ2UnKVxuICB9XG5cbiAgYWRkICh2YWx1ZSkge1xuICAgIHRoaXMudmFsdWUgPSBNYXRoLm1pbih0aGlzLnZhbHVlICsgdmFsdWUsIHRoaXMudmFsdWVNYXgpXG4gICAgdGhpcy5vd25lci5lbWl0KCdtYW5hLWNoYW5nZScpXG4gIH1cblxuICB0aWNrIChkZWx0YSkge1xuICAgIHRoaXMuYWRkKHRoaXMucmVmaWxsICogZGVsdGEpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICdNYW5hOiAnLFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgICcgLyAnLFxuICAgICAgdGhpcy52YWx1ZU1heFxuICAgIF0uam9pbignJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYW5hXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXHJcbmltcG9ydCB7IEFCSUxJVFlfTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vLi4vbGliL1ZlY3RvcidcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4uLy4uL2xpYi9NYXR0ZXInXHJcblxyXG5jb25zdCBESVNUQU5DRV9USFJFU0hPTEQgPSAxXHJcblxyXG5jbGFzcyBNb3ZlIGV4dGVuZHMgQWJpbGl0eSB7XHJcbiAgLyoqXHJcbiAgICog56e75YuV6IO95YqbXHJcbiAgICogQHBhcmFtICB7aW50fSB2YWx1ZSAgICDnp7vli5XpgJ/luqZcclxuICAgKiBAcGFyYW0gIHtmbG9hdH0gZnJpY3Rpb25BaXIgICAg56m66ZaT5pGp5pOm5YqbXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKFt2YWx1ZSwgZnJpY3Rpb25BaXJdKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcclxuICAgIHRoaXMuZnJpY3Rpb25BaXIgPSBmcmljdGlvbkFpclxyXG4gICAgdGhpcy52ZWN0b3IgPSBuZXcgVmVjdG9yKDAsIDApXHJcbiAgICB0aGlzLnBhdGggPSBbXVxyXG4gICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gdW5kZWZpbmVkXHJcbiAgICB0aGlzLmRpc3RhbmNlVGhyZXNob2xkID0gdGhpcy52YWx1ZSAqIERJU1RBTkNFX1RIUkVTSE9MRFxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9NT1ZFIH1cclxuXHJcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XHJcbiAgICAvLyDlj6rmnIPliqDlv6tcclxuICAgIHJldHVybiB0aGlzLnZhbHVlID4gb3RoZXIudmFsdWVcclxuICB9XHJcblxyXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxyXG4gIGNhcnJ5QnkgKG93bmVyKSB7XHJcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxyXG4gICAgdGhpcy5vd25lciA9IG93bmVyXHJcbiAgICBvd25lcltBQklMSVRZX01PVkVdID0gdGhpc1xyXG4gIH1cclxuXHJcbiAgcmVwbGFjZWRCeSAob3RoZXIsIG93bmVyKSB7XHJcbiAgICBvdGhlci52ZWN0b3IgPSB0aGlzLnZlY3RvclxyXG4gICAgb3RoZXIucGF0aCA9IHRoaXMucGF0aFxyXG4gICAgb3RoZXIubW92aW5nVG9Qb2ludCA9IHRoaXMubW92aW5nVG9Qb2ludFxyXG4gIH1cclxuXHJcbiAgLy8g6Kit5a6a5pa55ZCR5pyA5aSn6YCf5bqmXHJcbiAgc2V0RGlyZWN0aW9uICh2ZWN0b3IpIHtcclxuICAgIEJvZHkuc2V0VmVsb2NpdHkodGhpcy5vd25lci5ib2R5LCB2ZWN0b3Iuc2V0TGVuZ3RoKHRoaXMudmFsdWUpKVxyXG4gIH1cclxuXHJcbiAgLy8g5pa95LqI5YqbXHJcbiAgYWRkRGlyZWN0aW9uICh2ZWN0b3IpIHtcclxuICAgIGxldCBvd25lciA9IHRoaXMub3duZXJcclxuICAgIGlmICghb3duZXIuYm9keSkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMucHVuY2godmVjdG9yLm11bHRpcGx5U2NhbGFyKHRoaXMudmFsdWUgLyAzMDApKVxyXG4gIH1cclxuXHJcbiAgcHVuY2ggKHZlY3Rvcikge1xyXG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxyXG4gICAgaWYgKCFvd25lci5ib2R5KSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgb3duZXIuYm9keS53b3JsZC5mb3JjZXNXYWl0Rm9yQXBwbHkucHVzaCh7b3duZXIsIHZlY3Rvcn0pXHJcbiAgfVxyXG5cclxuICAvLyDnp7vli5XliLDpu55cclxuICBtb3ZlVG8gKHBvaW50KSB7XHJcbiAgICBsZXQgdmVjdG9yID0gbmV3IFZlY3Rvcihwb2ludC54IC0gdGhpcy5vd25lci54LCBwb2ludC55IC0gdGhpcy5vd25lci55KVxyXG4gICAgdGhpcy5zZXREaXJlY3Rpb24odmVjdG9yKVxyXG4gIH1cclxuXHJcbiAgLy8g6Kit5a6a56e75YuV6Lev5b6RXHJcbiAgc2V0UGF0aCAocGF0aCkge1xyXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIC8vIOaKtemBlOe1gum7nlxyXG4gICAgICB0aGlzLm1vdmluZ1RvUG9pbnQgPSB1bmRlZmluZWRcclxuICAgICAgdGhpcy52ZWN0b3IgPSBuZXcgVmVjdG9yKDAsIDApXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5wYXRoID0gcGF0aFxyXG4gICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gcGF0aC5wb3AoKVxyXG4gICAgdGhpcy5tb3ZlVG8odGhpcy5tb3ZpbmdUb1BvaW50KVxyXG4gIH1cclxuXHJcbiAgY2xlYXJQYXRoICgpIHtcclxuICAgIHRoaXMubW92aW5nVG9Qb2ludCA9IHVuZGVmaW5lZFxyXG4gICAgdGhpcy5wYXRoID0gW11cclxuICB9XHJcblxyXG4gIGFkZFBhdGggKHBhdGgpIHtcclxuICAgIHRoaXMuc2V0UGF0aChwYXRoLmNvbmNhdCh0aGlzLnBhdGgpKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdtb3ZlIGxldmVsOiAnICsgdGhpcy52YWx1ZVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW92ZVxyXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX09QRVJBVEUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBPcGVyYXRlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnNldCA9IG5ldyBTZXQoW3ZhbHVlXSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfT1BFUkFURSB9XG5cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIG93bmVyW0FCSUxJVFlfT1BFUkFURV0gPSB0aGlzW0FCSUxJVFlfT1BFUkFURV0uYmluZCh0aGlzLCBvd25lcilcbiAgICByZXR1cm4gb3duZXJbQUJJTElUWV9PUEVSQVRFXVxuICB9XG5cbiAgcmVwbGFjZWRCeSAob3RoZXIpIHtcbiAgICB0aGlzLnNldC5mb3JFYWNoKG90aGVyLnNldC5hZGQuYmluZChvdGhlci5zZXQpKVxuICB9XG5cbiAgW0FCSUxJVFlfT1BFUkFURV0gKG9wZXJhdG9yLCB0YXJnZXQpIHtcbiAgICBpZiAodGhpcy5zZXQuaGFzKHRhcmdldC5tYXApKSB7XG4gICAgICBvcGVyYXRvci5zYXkob3BlcmF0b3IudG9TdHJpbmcoKSArICcgdXNlIGFiaWxpdHkgdG8gb3BlbiAnICsgdGFyZ2V0Lm1hcClcbiAgICAgIHRhcmdldFt0aGlzLnR5cGVdKClcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIFsna2V5czogJywgQXJyYXkuZnJvbSh0aGlzLnNldCkuam9pbignLCAnKV0uam9pbignJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPcGVyYXRlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXHJcbmltcG9ydCB7IEFCSUxJVFlfUk9UQVRFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi8uLi9saWIvVmVjdG9yJ1xyXG5pbXBvcnQgZ2xvYmFsRXZlbnRNYW5hZ2VyIGZyb20gJy4uLy4uL2xpYi9nbG9iYWxFdmVudE1hbmFnZXInXHJcblxyXG5jb25zdCBNT1VTRU1PVkUgPSBTeW1ib2woJ21vdXNlbW92ZScpXHJcblxyXG5jbGFzcyBSb3RhdGUgZXh0ZW5kcyBBYmlsaXR5IHtcclxuICBjb25zdHJ1Y3RvciAoaW5pdFJhZCA9IDApIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMuaW5pdFJhZCA9IGluaXRSYWRcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfUk9UQVRFIH1cclxuXHJcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIGdldCBmYWNlUmFkICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9mYWNlUmFkXHJcbiAgfVxyXG5cclxuICAvLyDphY3lgpnmraTmioDog71cclxuICBjYXJyeUJ5IChvd25lcikge1xyXG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcclxuXHJcbiAgICB0aGlzLm93bmVyID0gb3duZXJcclxuICAgIG93bmVyW0FCSUxJVFlfUk9UQVRFXSA9IHRoaXNcclxuICAgIG93bmVyLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgbGV0IG1vdXNlSGFuZGxlciA9IGUgPT4ge1xyXG4gICAgICBsZXQgb3duZXJQb2ludCA9IHRoaXMub3duZXIuZ2V0R2xvYmFsUG9zaXRpb24oKVxyXG4gICAgICBsZXQgcG9pbnRlciA9IGUuZGF0YS5nbG9iYWxcclxuICAgICAgbGV0IHZlY3RvciA9IG5ldyBWZWN0b3IoXHJcbiAgICAgICAgcG9pbnRlci54IC0gb3duZXJQb2ludC54LFxyXG4gICAgICAgIHBvaW50ZXIueSAtIG93bmVyUG9pbnQueSlcclxuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoJ3JvdGF0ZScsIHZlY3RvcilcclxuICAgIH1cclxuICAgIGxldCByb3RhdGVIYW5kbGVyID0gdGhpcy5zZXRGYWNlUmFkLmJpbmQodGhpcylcclxuXHJcbiAgICBvd25lcltNT1VTRU1PVkVdID0ge1xyXG4gICAgICByb3RhdGU6IHJvdGF0ZUhhbmRsZXIsXHJcbiAgICAgIG1vdXNlbW92ZTogbW91c2VIYW5kbGVyXHJcbiAgICB9XHJcbiAgICBPYmplY3QuZW50cmllcyhvd25lcltNT1VTRU1PVkVdKS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xyXG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIub24oZXZlbnROYW1lLCBoYW5kbGVyKVxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLnNldEZhY2VSYWQobmV3IFZlY3RvcigwLCAwKSlcclxuICB9XHJcblxyXG4gIGRyb3BCeSAob3duZXIpIHtcclxuICAgIHN1cGVyLmRyb3BCeShvd25lcilcclxuICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW01PVVNFTU9WRV0pLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XHJcbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5vZmYoZXZlbnROYW1lLCBoYW5kbGVyKVxyXG4gICAgfSlcclxuICAgIGRlbGV0ZSBvd25lcltNT1VTRU1PVkVdXHJcbiAgICBkZWxldGUgb3duZXJbQUJJTElUWV9ST1RBVEVdXHJcbiAgfVxyXG5cclxuICBzZXRGYWNlUmFkICh2ZWN0b3IpIHtcclxuICAgIHRoaXMuX2ZhY2VSYWQgPSB2ZWN0b3IucmFkIC0gdGhpcy5pbml0UmFkXHJcbiAgICB0aGlzLm93bmVyLnJvdGF0ZSh0aGlzLl9mYWNlUmFkKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdSb3RhdGUnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSb3RhdGVcclxuIiwiaW1wb3J0IFNraWxsIGZyb20gJy4vU2tpbGwnXG5pbXBvcnQgVGV4dHVyZSBmcm9tICcuLi8uLi9saWIvVGV4dHVyZSdcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuaW1wb3J0IFZlY3RvciBmcm9tICcuLi8uLi9saWIvVmVjdG9yJ1xuaW1wb3J0IHsgQUJJTElUWV9ST1RBVEUsIEFCSUxJVFlfTU9WRSwgQUJJTElUWV9NQU5BIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY29uc3QgUEkgPSBNYXRoLlBJXG5cbmZ1bmN0aW9uIGNhbGNBcG90aGVtIChvLCByYWQpIHtcbiAgbGV0IHdpZHRoID0gby53aWR0aCAvIDJcbiAgbGV0IGhlaWdodCA9IG8uaGVpZ2h0IC8gMlxuICBsZXQgcmVjdFJhZCA9IE1hdGguYXRhbjIoaGVpZ2h0LCB3aWR0aClcbiAgbGV0IGxlblxuICAvLyDlpoLmnpzlsITlh7rop5Lnqb/pgY4gd2lkdGhcbiAgbGV0IHIxID0gTWF0aC5hYnMocmFkICUgUEkpXG4gIGxldCByMiA9IE1hdGguYWJzKHJlY3RSYWQgJSBQSSlcbiAgaWYgKHIxIDwgcjIgfHwgcjEgPiByMiArIFBJIC8gMikge1xuICAgIGxlbiA9IHdpZHRoIC8gTWF0aC5jb3MocmFkKVxuICB9IGVsc2Uge1xuICAgIGxlbiA9IGhlaWdodCAvIE1hdGguc2luKHJhZClcbiAgfVxuICByZXR1cm4gTWF0aC5hYnMobGVuKVxufVxuXG5jb25zdCBsZXZlbHMgPSBbXG4gIC8vIGNvc3QsIHJlYWN0Rm9yY2UsIHNwZWVkLCBkYW1hZ2UsIGZvcmNlLCBzY2FsZVxuICBbMSwgMC4wMDEsIDYsIDEsIDAuMDFdLFxuICBbMywgMC4wMDEsIDEwLCAzLCA1LCAyXVxuXVxuXG5jbGFzcyBGaXJlQm9sdCBleHRlbmRzIFNraWxsIHtcbiAgc3ByaXRlICgpIHtcbiAgICByZXR1cm4gU2tpbGwuc3ByaXRlKFRleHR1cmUuQnVsbGV0KVxuICB9XG5cbiAgX2Nvc3QgKGNhc3RlciwgY29zdCkge1xuICAgIGxldCBtYW5hQWJpbGl0eSA9IGNhc3RlcltBQklMSVRZX01BTkFdXG4gICAgaWYgKCFtYW5hQWJpbGl0eSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgaWYgKCFtYW5hQWJpbGl0eS5pc0Vub3VnaChjb3N0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIG1hbmFBYmlsaXR5LnJlZHVjZShjb3N0KVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyDlu7rnq4vlr6bpq5TkuKbph4vmlL5cbiAgY2FzdCAoe2Nhc3RlciwgcmFkID0gdW5kZWZpbmVkfSkge1xuICAgIGxldCBbIGNvc3QsIHJlYWN0Rm9yY2UsIHNwZWVkID0gMSwgZGFtYWdlID0gMSwgZm9yY2UgPSAwLCBzY2FsZSA9IDEgXSA9IGxldmVsc1t0aGlzLmxldmVsXVxuICAgIGlmICghdGhpcy5fY29zdChjYXN0ZXIsIGNvc3QpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoe3NwZWVkLCBkYW1hZ2UsIGZvcmNlfSlcblxuICAgIC8vIHNldCBkaXJlY3Rpb25cbiAgICBpZiAocmFkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIOWmguaenOaykuaMh+WumuaWueWQke+8jOWwseeUqOebruWJjemdouWwjeaWueWQkVxuICAgICAgbGV0IHJvdGF0ZUFiaWxpdHkgPSBjYXN0ZXJbQUJJTElUWV9ST1RBVEVdXG4gICAgICByYWQgPSByb3RhdGVBYmlsaXR5ID8gcm90YXRlQWJpbGl0eS5mYWNlUmFkIDogMFxuICAgIH1cbiAgICBsZXQgdmVjdG9yID0gVmVjdG9yLmZyb21SYWRMZW5ndGgocmFkLCAxKVxuICAgIGJ1bGxldC5zY2FsZS5zZXQoc2NhbGUpXG4gICAgYnVsbGV0LnNldE93bmVyKGNhc3RlcilcblxuICAgIC8vIHNldCBwb3NpdGlvblxuICAgIGxldCByZWN0TGVuID0gY2FsY0Fwb3RoZW0oY2FzdGVyLCByYWQgKyBjYXN0ZXIucm90YXRpb24pXG4gICAgbGV0IGJ1bGxldExlbiA9IGJ1bGxldC5oZWlnaHQgLyAyIC8vIOWwhOWHuuinkuetieaWvOiHqui6q+aXi+inku+8jOaJgOS7peWFjeWOu+mBi+eul1xuICAgIGxldCBsZW4gPSByZWN0TGVuICsgYnVsbGV0TGVuXG4gICAgbGV0IHBvc2l0aW9uID0gVmVjdG9yLmZyb21SYWRMZW5ndGgocmFkLCBsZW4pXG4gICAgICAuYWRkKFZlY3Rvci5mcm9tUG9pbnQoY2FzdGVyLnBvc2l0aW9uRXgpKVxuICAgIGJ1bGxldC5wb3NpdGlvbkV4LnNldChwb3NpdGlvbi54LCBwb3NpdGlvbi55KVxuXG4gICAgYnVsbGV0Lm9uY2UoJ2FkZGVkJywgKCkgPT4ge1xuICAgICAgYnVsbGV0LnNldERpcmVjdGlvbih2ZWN0b3IpXG5cbiAgICAgIGxldCBtb3ZlQWJpbGl0eSA9IGNhc3RlcltBQklMSVRZX01PVkVdXG4gICAgICBpZiAobW92ZUFiaWxpdHkpIHtcbiAgICAgICAgbW92ZUFiaWxpdHkucHVuY2godmVjdG9yLmNsb25lKCkuc2V0TGVuZ3RoKHJlYWN0Rm9yY2UpLmludmVydCgpKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBjYXN0ZXIuZW1pdCgnYWRkT2JqZWN0JywgYnVsbGV0KVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnRmlyZUJvbHQnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlyZUJvbHRcbiIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4uLy4uL2xpYi9QSVhJJ1xuXG5jbGFzcyBTa2lsbCB7XG4gIGNvbnN0cnVjdG9yIChsZXZlbCkge1xuICAgIHRoaXMubGV2ZWwgPSBsZXZlbFxuICB9XG5cbiAgY29zdCAoKSB7XG4gICAgXG4gIH1cblxuICBzdGF0aWMgc3ByaXRlICh0ZXh0dXJlKSB7XG4gICAgcmV0dXJuIG5ldyBTcHJpdGUodGV4dHVyZSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTa2lsbFxuIiwiaW1wb3J0IHsgVGV4dCwgVGV4dFN0eWxlLCBsb2FkZXIgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2xpYi9TY2VuZSdcclxuaW1wb3J0IFBsYXlTY2VuZSBmcm9tICcuL1BsYXlTY2VuZSdcclxuXHJcbmxldCB0ZXh0ID0gJ2xvYWRpbmcnXHJcblxyXG5jbGFzcyBMb2FkaW5nU2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIHRoaXMubGlmZSA9IDBcclxuICB9XHJcblxyXG4gIGNyZWF0ZSAoKSB7XHJcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcclxuICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgICAgZm9udFNpemU6IDM2LFxyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICcjZmYzMzAwJyxcclxuICAgICAgc3Ryb2tlVGhpY2tuZXNzOiA0LFxyXG4gICAgICBkcm9wU2hhZG93OiB0cnVlLFxyXG4gICAgICBkcm9wU2hhZG93Q29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgZHJvcFNoYWRvd0JsdXI6IDQsXHJcbiAgICAgIGRyb3BTaGFkb3dBbmdsZTogTWF0aC5QSSAvIDYsXHJcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZTogNlxyXG4gICAgfSlcclxuICAgIHRoaXMudGV4dExvYWRpbmcgPSBuZXcgVGV4dCh0ZXh0LCBzdHlsZSlcclxuXHJcbiAgICAvLyBBZGQgdGhlIGNhdCB0byB0aGUgc3RhZ2VcclxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50ZXh0TG9hZGluZylcclxuXHJcbiAgICAvLyBsb2FkIGFuIGltYWdlIGFuZCBydW4gdGhlIGBzZXR1cGAgZnVuY3Rpb24gd2hlbiBpdCdzIGRvbmVcclxuICAgIGxvYWRlclxyXG4gICAgICAuYWRkKCdpbWFnZXMvdGVycmFpbl9hdGxhcy5qc29uJylcclxuICAgICAgLmFkZCgnaW1hZ2VzL2Jhc2Vfb3V0X2F0bGFzLmpzb24nKVxyXG4gICAgICAuYWRkKCdpbWFnZXMvZmlyZV9ib2x0LnBuZycpXHJcbiAgICAgIC5sb2FkKCgpID0+IHRoaXMuZW1pdCgnY2hhbmdlU2NlbmUnLCBQbGF5U2NlbmUsIHtcclxuICAgICAgICBtYXBGaWxlOiAnVzBOMCcsXHJcbiAgICAgICAgcG9zaXRpb246IFsxLCAxXVxyXG4gICAgICB9KSlcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICB0aGlzLmxpZmUgKz0gZGVsdGEgLyAzMCAvLyBibGVuZCBzcGVlZFxyXG4gICAgdGhpcy50ZXh0TG9hZGluZy50ZXh0ID0gdGV4dCArIEFycmF5KE1hdGguZmxvb3IodGhpcy5saWZlKSAlIDQgKyAxKS5qb2luKCcuJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExvYWRpbmdTY2VuZVxyXG4iLCJpbXBvcnQgeyBsb2FkZXIsIHJlc291cmNlcywgZGlzcGxheSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbGliL1NjZW5lJ1xyXG5pbXBvcnQgTWFwIGZyb20gJy4uL2xpYi9NYXAnXHJcbmltcG9ydCBNYXBGb2cgZnJvbSAnLi4vbGliL01hcEZvZydcclxuaW1wb3J0IHsgSVNfTU9CSUxFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmltcG9ydCBDYXQgZnJvbSAnLi4vb2JqZWN0cy9DYXQnXHJcblxyXG5pbXBvcnQgTWVzc2FnZVdpbmRvdyBmcm9tICcuLi91aS9NZXNzYWdlV2luZG93J1xyXG5pbXBvcnQgUGxheWVyV2luZG93IGZyb20gJy4uL3VpL1BsYXllcldpbmRvdydcclxuaW1wb3J0IEludmVudG9yeVdpbmRvdyBmcm9tICcuLi91aS9JbnZlbnRvcnlXaW5kb3cnXHJcbmltcG9ydCBUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCBmcm9tICcuLi91aS9Ub3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCdcclxuaW1wb3J0IFRvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsIGZyb20gJy4uL3VpL1RvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsJ1xyXG5pbXBvcnQgZ2xvYmFsRXZlbnRNYW5hZ2VyIGZyb20gJy4uL2xpYi9nbG9iYWxFdmVudE1hbmFnZXInXHJcblxyXG5sZXQgc2NlbmVXaWR0aFxyXG5sZXQgc2NlbmVIZWlnaHRcclxuXHJcbmZ1bmN0aW9uIGdldE1lc3NhZ2VXaW5kb3dPcHQgKCkge1xyXG4gIGxldCBvcHQgPSB7fVxyXG4gIGlmIChJU19NT0JJTEUpIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGhcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDMwXHJcbiAgICBvcHQuc2Nyb2xsQmFyV2lkdGggPSA1MFxyXG4gICAgb3B0LnNjcm9sbEJhck1pbkhlaWdodCA9IDcwXHJcbiAgfSBlbHNlIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggPCA0MDAgPyBzY2VuZVdpZHRoIDogc2NlbmVXaWR0aCAvIDJcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDYwXHJcbiAgfVxyXG4gIG9wdC5oZWlnaHQgPSBzY2VuZUhlaWdodCAvIDZcclxuICBvcHQueCA9IDBcclxuICBvcHQueSA9IHNjZW5lSGVpZ2h0IC0gb3B0LmhlaWdodFxyXG5cclxuICByZXR1cm4gb3B0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFBsYXllcldpbmRvd09wdCAocGxheWVyKSB7XHJcbiAgbGV0IG9wdCA9IHtcclxuICAgIHBsYXllclxyXG4gIH1cclxuICBvcHQueCA9IDBcclxuICBvcHQueSA9IDBcclxuICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIC8gNFxyXG4gICAgb3B0LmhlaWdodCA9IHNjZW5lSGVpZ2h0IC8gNlxyXG4gICAgb3B0LmZvbnRTaXplID0gb3B0LndpZHRoIC8gMTBcclxuICB9IGVsc2Uge1xyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aCA8IDQwMCA/IHNjZW5lV2lkdGggLyAyIDogc2NlbmVXaWR0aCAvIDRcclxuICAgIG9wdC5oZWlnaHQgPSBzY2VuZUhlaWdodCAvIDNcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDIwXHJcbiAgfVxyXG4gIHJldHVybiBvcHRcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0SW52ZW50b3J5V2luZG93T3B0IChwbGF5ZXIpIHtcclxuICBsZXQgb3B0ID0ge1xyXG4gICAgcGxheWVyXHJcbiAgfVxyXG4gIG9wdC55ID0gMFxyXG4gIGlmIChJU19NT0JJTEUpIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggLyA2XHJcbiAgfSBlbHNlIHtcclxuICAgIGxldCBkaXZpZGUgPSBzY2VuZVdpZHRoIDwgNDAwID8gNiA6IHNjZW5lV2lkdGggPCA4MDAgPyAxMiA6IDIwXHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIC8gZGl2aWRlXHJcbiAgfVxyXG4gIG9wdC54ID0gc2NlbmVXaWR0aCAtIG9wdC53aWR0aFxyXG4gIHJldHVybiBvcHRcclxufVxyXG5cclxuY2xhc3MgUGxheVNjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yICh7IG1hcEZpbGUsIHBvc2l0aW9uIH0pIHtcclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLm1hcEZpbGUgPSBtYXBGaWxlXHJcbiAgICB0aGlzLnRvUG9zaXRpb24gPSBwb3NpdGlvblxyXG4gICAgdGhpcy5ncm91cC5lbmFibGVTb3J0ID0gdHJ1ZVxyXG4gICAgdGhpcy5tYXBTY2FsZSA9IElTX01PQklMRSA/IDIgOiAwLjVcclxuICAgIHRoaXMubWFwRm9nID0gbmV3IE1hcEZvZygpXHJcbiAgfVxyXG5cclxuICBjcmVhdGUgKCkge1xyXG4gICAgc2NlbmVXaWR0aCA9IHRoaXMucGFyZW50LndpZHRoXHJcbiAgICBzY2VuZUhlaWdodCA9IHRoaXMucGFyZW50LmhlaWdodFxyXG4gICAgdGhpcy5pc01hcExvYWRlZCA9IGZhbHNlXHJcbiAgICB0aGlzLmxvYWRNYXAoKVxyXG4gICAgdGhpcy5pbml0UGxheWVyKClcclxuICAgIHRoaXMuaW5pdFVpKClcclxuICAgIC8vIHNldEludGVydmFsKCgpID0+IHtcclxuICAgIC8vICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoJ2ZpcmUnKVxyXG4gICAgLy8gfSwgMTAwKVxyXG4gIH1cclxuXHJcbiAgaW5pdFVpICgpIHtcclxuICAgIGxldCB1aUdyb3VwID0gbmV3IGRpc3BsYXkuR3JvdXAoMSwgdHJ1ZSlcclxuICAgIGxldCB1aUxheWVyID0gbmV3IGRpc3BsYXkuTGF5ZXIodWlHcm91cClcclxuICAgIHVpTGF5ZXIucGFyZW50TGF5ZXIgPSB0aGlzXHJcbiAgICB0aGlzLmFkZENoaWxkKHVpTGF5ZXIpXHJcblxyXG4gICAgbGV0IG1lc3NhZ2VXaW5kb3cgPSBuZXcgTWVzc2FnZVdpbmRvdyhnZXRNZXNzYWdlV2luZG93T3B0KCkpXHJcbiAgICBsZXQgcGxheWVyV2luZG93ID0gbmV3IFBsYXllcldpbmRvdyhnZXRQbGF5ZXJXaW5kb3dPcHQodGhpcy5jYXQpKVxyXG4gICAgbGV0IGludmVudG9yeVdpbmRvdyA9IG5ldyBJbnZlbnRvcnlXaW5kb3coZ2V0SW52ZW50b3J5V2luZG93T3B0KHRoaXMuY2F0KSlcclxuXHJcbiAgICAvLyDorpNVSemhr+ekuuWcqOmgguWxpFxyXG4gICAgbWVzc2FnZVdpbmRvdy5wYXJlbnRHcm91cCA9IHVpR3JvdXBcclxuICAgIHBsYXllcldpbmRvdy5wYXJlbnRHcm91cCA9IHVpR3JvdXBcclxuICAgIGludmVudG9yeVdpbmRvdy5wYXJlbnRHcm91cCA9IHVpR3JvdXBcclxuICAgIHVpTGF5ZXIuYWRkQ2hpbGQobWVzc2FnZVdpbmRvdylcclxuICAgIHVpTGF5ZXIuYWRkQ2hpbGQocGxheWVyV2luZG93KVxyXG4gICAgdWlMYXllci5hZGRDaGlsZChpbnZlbnRvcnlXaW5kb3cpXHJcblxyXG4gICAgaWYgKElTX01PQklMRSkge1xyXG4gICAgICAvLyDlj6rmnInmiYvmqZ/opoHop7jmjqfmnb9cclxuICAgICAgLy8g5pa55ZCR5o6n5Yi2XHJcbiAgICAgIGxldCBkaXJlY3Rpb25QYW5lbCA9IG5ldyBUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCh7XHJcbiAgICAgICAgeDogc2NlbmVXaWR0aCAvIDQsXHJcbiAgICAgICAgeTogc2NlbmVIZWlnaHQgKiA0IC8gNixcclxuICAgICAgICByYWRpdXM6IHNjZW5lV2lkdGggLyA4XHJcbiAgICAgIH0pXHJcbiAgICAgIGRpcmVjdGlvblBhbmVsLnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG5cclxuICAgICAgLy8g5pON5L2c5o6n5Yi2XHJcbiAgICAgIGxldCBvcGVyYXRpb25QYW5lbCA9IG5ldyBUb3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCh7XHJcbiAgICAgICAgeDogc2NlbmVXaWR0aCAvIDUgKiAzLFxyXG4gICAgICAgIHk6IHNjZW5lSGVpZ2h0IC8gNSAqIDMsXHJcbiAgICAgICAgd2lkdGg6IHNjZW5lV2lkdGggLyAzLFxyXG4gICAgICAgIGhlaWdodDogc2NlbmVIZWlnaHQgLyA1XHJcbiAgICAgIH0pXHJcbiAgICAgIG9wZXJhdGlvblBhbmVsLnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG5cclxuICAgICAgdWlMYXllci5hZGRDaGlsZChkaXJlY3Rpb25QYW5lbClcclxuICAgICAgdWlMYXllci5hZGRDaGlsZChvcGVyYXRpb25QYW5lbClcclxuICAgICAgLy8gcmVxdWlyZSgnLi4vbGliL2RlbW8nKVxyXG4gICAgfVxyXG4gICAgbWVzc2FnZVdpbmRvdy5hZGQoWydzY2VuZSBzaXplOiAoJywgc2NlbmVXaWR0aCwgJywgJywgc2NlbmVIZWlnaHQsICcpLiddLmpvaW4oJycpKVxyXG4gIH1cclxuXHJcbiAgaW5pdFBsYXllciAoKSB7XHJcbiAgICBpZiAoIXRoaXMuY2F0KSB7XHJcbiAgICAgIHRoaXMuY2F0ID0gbmV3IENhdCgpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBsb2FkTWFwICgpIHtcclxuICAgIGxldCBmaWxlTmFtZSA9ICd3b3JsZC8nICsgdGhpcy5tYXBGaWxlXHJcblxyXG4gICAgLy8gaWYgbWFwIG5vdCBsb2FkZWQgeWV0XHJcbiAgICBpZiAoIXJlc291cmNlc1tmaWxlTmFtZV0pIHtcclxuICAgICAgbG9hZGVyXHJcbiAgICAgICAgLmFkZChmaWxlTmFtZSwgZmlsZU5hbWUgKyAnLmpzb24nKVxyXG4gICAgICAgIC5sb2FkKHRoaXMuc3Bhd25NYXAuYmluZCh0aGlzLCBmaWxlTmFtZSkpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNwYXduTWFwKGZpbGVOYW1lKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3Bhd25NYXAgKGZpbGVOYW1lKSB7XHJcbiAgICBsZXQgbWFwR3JvdXAgPSBuZXcgZGlzcGxheS5Hcm91cCgwLCB0cnVlKVxyXG4gICAgbGV0IG1hcExheWVyID0gbmV3IGRpc3BsYXkuTGF5ZXIobWFwR3JvdXApXHJcbiAgICBtYXBMYXllci5wYXJlbnRMYXllciA9IHRoaXNcclxuICAgIG1hcExheWVyLmdyb3VwLmVuYWJsZVNvcnQgPSB0cnVlXHJcbiAgICBtYXBMYXllci5wb3NpdGlvbi5zZXQoc2NlbmVXaWR0aCAvIDIsIHNjZW5lSGVpZ2h0IC8gMilcclxuICAgIHRoaXMuYWRkQ2hpbGQobWFwTGF5ZXIpXHJcblxyXG4gICAgbGV0IG1hcERhdGEgPSByZXNvdXJjZXNbZmlsZU5hbWVdLmRhdGFcclxuXHJcbiAgICBsZXQgbWFwID0gbmV3IE1hcCgpXHJcbiAgICBtYXBMYXllci5hZGRDaGlsZChtYXApXHJcbiAgICAvLyBlbmFibGUgZm9nXHJcbiAgICBpZiAoIW1hcERhdGEuaGFzRm9nKSB7XHJcbiAgICAgIHRoaXMubWFwRm9nLmRpc2FibGUoKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5tYXBGb2cuZW5hYmxlKG1hcClcclxuICAgIH1cclxuICAgIC8vIHRoaXMubWFwRm9nLnBvc2l0aW9uLnNldCgtc2NlbmVXaWR0aCAvIDIsIC1zY2VuZUhlaWdodCAvIDIpXHJcbiAgICBtYXBMYXllci5hZGRDaGlsZCh0aGlzLm1hcEZvZylcclxuICAgIG1hcC5sb2FkKG1hcERhdGEpXHJcblxyXG4gICAgbWFwLm9uKCd1c2UnLCBvID0+IHtcclxuICAgICAgdGhpcy5pc01hcExvYWRlZCA9IGZhbHNlXHJcbiAgICAgIC8vIGNsZWFyIG9sZCBtYXBcclxuICAgICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLm1hcClcclxuICAgICAgdGhpcy5tYXAuZGVzdHJveSgpXHJcblxyXG4gICAgICB0aGlzLm1hcEZpbGUgPSBvLm1hcFxyXG4gICAgICB0aGlzLnRvUG9zaXRpb24gPSBvLnRvUG9zaXRpb25cclxuICAgICAgdGhpcy5sb2FkTWFwKClcclxuICAgIH0pXHJcblxyXG4gICAgbWFwLmFkZFBsYXllcih0aGlzLmNhdCwgdGhpcy50b1Bvc2l0aW9uKVxyXG4gICAgLy8gVE9ETzogZGVidWcgcmVuZGVyXHJcbiAgICAvLyBtYXAuZGVidWcoe3dpZHRoOiBzY2VuZVdpZHRoLCBoZWlnaHQ6IHNjZW5lSGVpZ2h0fSlcclxuICAgIG1hcC5zZXRTY2FsZSh0aGlzLm1hcFNjYWxlKVxyXG4gICAgdGhpcy5tYXAgPSBtYXBcclxuXHJcbiAgICB0aGlzLmlzTWFwTG9hZGVkID0gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgdGljayAoZGVsdGEpIHtcclxuICAgIGlmICghdGhpcy5pc01hcExvYWRlZCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMubWFwLnRpY2soZGVsdGEpXHJcbiAgICAvLyBGSVhNRTogZ2FwIGJldHdlZW4gdGlsZXMgb24gaVBob25lIFNhZmFyaVxyXG4gICAgdGhpcy5tYXAuc2V0UG9zaXRpb24oXHJcbiAgICAgIC10aGlzLmNhdC54ICogdGhpcy5tYXBTY2FsZSxcclxuICAgICAgLXRoaXMuY2F0LnkgKiB0aGlzLm1hcFNjYWxlKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxheVNjZW5lXHJcbiIsImltcG9ydCBXaW5kb3cgZnJvbSAnLi9XaW5kb3cnXG5pbXBvcnQgeyBDb250YWluZXIsIEdyYXBoaWNzLCBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCB7IEFCSUxJVFlfQ0FSUlkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcbmltcG9ydCB7IFNXSVRDSDEsIFNXSVRDSDIsIFNXSVRDSDMsIFNXSVRDSDQgfSBmcm9tICcuLi9jb25maWcvY29udHJvbCdcblxuY29uc3QgU0xPVFMgPSBbIFNXSVRDSDEsIFNXSVRDSDIsIFNXSVRDSDMsIFNXSVRDSDQgXVxuXG5jbGFzcyBTbG90IGV4dGVuZHMgQ29udGFpbmVyIHtcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXG5cbiAgICBsZXQgcmVjdCA9IG5ldyBHcmFwaGljcygpXG4gICAgcmVjdC5iZWdpbkZpbGwoMHhBMkEyQTIpXG4gICAgcmVjdC5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgNSlcbiAgICByZWN0LmVuZEZpbGwoKVxuICAgIHRoaXMuYWRkQ2hpbGQocmVjdClcblxuICAgIGxldCBib3JkZXJSZWN0ID0gbmV3IEdyYXBoaWNzKClcbiAgICBib3JkZXJSZWN0LmxpbmVTdHlsZSgzLCAweEZGMDAwMCwgMSlcbiAgICBib3JkZXJSZWN0LmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpXG4gICAgYm9yZGVyUmVjdC5lbmRGaWxsKClcbiAgICBib3JkZXJSZWN0LnZpc2libGUgPSBmYWxzZVxuICAgIHRoaXMuYWRkQ2hpbGQoYm9yZGVyUmVjdClcblxuICAgIHRoaXMuYm9yZGVyUmVjdCA9IGJvcmRlclJlY3RcbiAgfVxuXG4gIHNldENvbnRleHQgKHNraWxsLCBjb3VudCkge1xuICAgIHRoaXMuY2xlYXJDb250ZXh0KClcblxuICAgIGxldCB3aWR0aCA9IHRoaXMud2lkdGhcbiAgICBsZXQgaGVpZ2h0ID0gdGhpcy5oZWlnaHRcbiAgICAvLyDnva7kuK1cbiAgICBsZXQgc3ByaXRlID0gc2tpbGwuc3ByaXRlKClcbiAgICBsZXQgbWF4U2lkZSA9IE1hdGgubWF4KHNwcml0ZS53aWR0aCwgc3ByaXRlLmhlaWdodClcbiAgICBsZXQgc2NhbGUgPSB3aWR0aCAvIG1heFNpZGVcbiAgICBzcHJpdGUuc2NhbGUuc2V0KHNjYWxlKVxuICAgIHNwcml0ZS5hbmNob3Iuc2V0KDAuNSwgMC41KVxuICAgIHNwcml0ZS5wb3NpdGlvbi5zZXQod2lkdGggLyAyLCBoZWlnaHQgLyAyKVxuICAgIHRoaXMuYWRkQ2hpbGQoc3ByaXRlKVxuXG4gICAgLy8g5pW46YePXG4gICAgbGV0IGZvbnRTaXplID0gdGhpcy53aWR0aCAqIDAuM1xuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgZmlsbDogJ3JlZCcsXG4gICAgICBmb250V2VpZ2h0OiAnNjAwJyxcbiAgICAgIGxpbmVIZWlnaHQ6IGZvbnRTaXplXG4gICAgfSlcbiAgICBsZXQgY291bnRUZXh0ID0gY291bnQgPT09IEluZmluaXR5ID8gJ+KInicgOiBjb3VudFxuICAgIGxldCB0ZXh0ID0gbmV3IFRleHQoY291bnRUZXh0LCBzdHlsZSlcbiAgICB0ZXh0LnBvc2l0aW9uLnNldCh3aWR0aCAqIDAuOTUsIGhlaWdodClcbiAgICB0ZXh0LmFuY2hvci5zZXQoMSwgMSlcbiAgICB0aGlzLmFkZENoaWxkKHRleHQpXG5cbiAgICB0aGlzLnNwcml0ZSA9IHNwcml0ZVxuICAgIHRoaXMudGV4dCA9IHRleHRcbiAgfVxuXG4gIGNsZWFyQ29udGV4dCAoKSB7XG4gICAgaWYgKHRoaXMuc3ByaXRlKSB7XG4gICAgICB0aGlzLnNwcml0ZS5kZXN0cm95KClcbiAgICAgIHRoaXMudGV4dC5kZXN0cm95KClcbiAgICAgIGRlbGV0ZSB0aGlzLnNwcml0ZVxuICAgICAgZGVsZXRlIHRoaXMudGV4dFxuICAgIH1cbiAgfVxuXG4gIHNlbGVjdCAoKSB7XG4gICAgdGhpcy5ib3JkZXJSZWN0LnZpc2libGUgPSB0cnVlXG4gIH1cblxuICBkZXNlbGVjdCAoKSB7XG4gICAgdGhpcy5ib3JkZXJSZWN0LnZpc2libGUgPSBmYWxzZVxuICB9XG59XG5cbmNsYXNzIEludmVudG9yeVdpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBsZXQgeyBwbGF5ZXIsIHdpZHRoIH0gPSBvcHRcbiAgICBsZXQgcGFkZGluZyA9IHdpZHRoICogMC4xXG4gICAgbGV0IGNlaWxTaXplID0gd2lkdGggLSBwYWRkaW5nICogMlxuICAgIGxldCBjZWlsT3B0ID0ge1xuICAgICAgeDogcGFkZGluZyxcbiAgICAgIHk6IHBhZGRpbmcsXG4gICAgICB3aWR0aDogY2VpbFNpemUsXG4gICAgICBoZWlnaHQ6IGNlaWxTaXplXG4gICAgfVxuICAgIGxldCBzbG90Q291bnQgPSA0XG4gICAgb3B0LmhlaWdodCA9ICh3aWR0aCAtIHBhZGRpbmcpICogc2xvdENvdW50ICsgcGFkZGluZ1xuXG4gICAgc3VwZXIob3B0KVxuXG4gICAgdGhpcy5fb3B0ID0gb3B0XG4gICAgcGxheWVyLm9uKCdpbnZlbnRvcnktbW9kaWZpZWQnLCB0aGlzLm9uSW52ZW50b3J5TW9kaWZpZWQuYmluZCh0aGlzLCBwbGF5ZXIpKVxuXG4gICAgdGhpcy5zbG90Q29udGFpbmVycyA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbG90Q291bnQ7IGkrKykge1xuICAgICAgbGV0IHNsb3QgPSBuZXcgU2xvdChjZWlsT3B0KVxuICAgICAgdGhpcy5hZGRDaGlsZChzbG90KVxuICAgICAgdGhpcy5zbG90Q29udGFpbmVycy5wdXNoKHNsb3QpXG4gICAgICBjZWlsT3B0LnkgKz0gY2VpbFNpemUgKyBwYWRkaW5nXG4gICAgfVxuICAgIC8vIGRlZmF1bHQgdXNlIGZpcnN0IG9uZVxuICAgIHRoaXMuc2xvdENvbnRhaW5lcnNbMF0uc2VsZWN0KClcblxuICAgIHRoaXMub25JbnZlbnRvcnlNb2RpZmllZChwbGF5ZXIpXG4gICAgdGhpcy5zZXR1cChwbGF5ZXIpXG4gIH1cblxuICBvbkludmVudG9yeU1vZGlmaWVkIChwbGF5ZXIpIHtcbiAgICBsZXQgY2FycnlBYmlsaXR5ID0gcGxheWVyW0FCSUxJVFlfQ0FSUlldXG4gICAgaWYgKCFjYXJyeUFiaWxpdHkpIHtcbiAgICAgIC8vIG5vIGludmVudG9yeSB5ZXRcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgc2xvdHMgPSBbXVxuICAgIGxldCBpID0gMFxuICAgIGNhcnJ5QWJpbGl0eS5iYWdzLmZvckVhY2goc2xvdCA9PiB7XG4gICAgICBzbG90c1tpXSA9IHNsb3RcbiAgICAgIGkrK1xuICAgIH0pXG4gICAgdGhpcy5zbG90Q29udGFpbmVycy5mb3JFYWNoKChjb250YWluZXIsIGkpID0+IHtcbiAgICAgIGxldCBzbG90ID0gc2xvdHNbaV1cbiAgICAgIGlmIChzbG90KSB7XG4gICAgICAgIGNvbnRhaW5lci5zZXRDb250ZXh0KHNsb3Quc2tpbGwsIHNsb3QuY291bnQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250YWluZXIuY2xlYXJDb250ZXh0KClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgc2V0dXAgKHBsYXllcikge1xuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBwbGF5ZXJbQUJJTElUWV9DQVJSWV1cbiAgICBsZXQgYmluZCA9IGtleSA9PiB7XG4gICAgICBsZXQgc2xvdElueCA9IFNMT1RTLmluZGV4T2Yoa2V5KVxuICAgICAgbGV0IGhhbmRsZXIgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50UmVwZWF0KClcbiAgICAgICAgY2FycnlBYmlsaXR5LnNldEN1cnJlbnQoc2xvdElueClcbiAgICAgICAgdGhpcy5zbG90Q29udGFpbmVycy5mb3JFYWNoKChjb250YWluZXIsIGkpID0+IHtcbiAgICAgICAgICBpZiAoaSA9PT0gc2xvdElueCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnNlbGVjdCgpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5kZXNlbGVjdCgpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAga2V5Ym9hcmRKUy5iaW5kKGtleSwgaGFuZGxlciwgKCkgPT4ge30pXG4gICAgICByZXR1cm4gaGFuZGxlclxuICAgIH1cblxuICAgIGxldCBiaW5kc1xuICAgIGtleWJvYXJkSlMuc2V0Q29udGV4dCgnJylcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBiaW5kcyA9IHtcbiAgICAgICAgU1dJVENIMTogYmluZChTV0lUQ0gxKSxcbiAgICAgICAgU1dJVENIMjogYmluZChTV0lUQ0gyKSxcbiAgICAgICAgU1dJVENIMzogYmluZChTV0lUQ0gzKSxcbiAgICAgICAgU1dJVENINDogYmluZChTV0lUQ0g0KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBwbGF5ZXIub25jZSgncmVtb3ZlZCcsICgpID0+IHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKGJpbmRzKS5mb3JFYWNoKChba2V5LCBoYW5kbGVyXSkgPT4ge1xuICAgICAgICBrZXlib2FyZEpTLnVuYmluZChrZXksIGhhbmRsZXIpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW52ZW50b3J5V2luZG93XG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcblxuaW1wb3J0IFNjcm9sbGFibGVXaW5kb3cgZnJvbSAnLi9TY3JvbGxhYmxlV2luZG93J1xuaW1wb3J0IG1lc3NhZ2VzIGZyb20gJy4uL2xpYi9NZXNzYWdlcydcblxuY2xhc3MgTWVzc2FnZVdpbmRvdyBleHRlbmRzIFNjcm9sbGFibGVXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIob3B0KVxuXG4gICAgbGV0IHsgZm9udFNpemUgPSAxMiB9ID0gb3B0XG5cbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgIGZpbGw6ICdncmVlbicsXG4gICAgICBicmVha1dvcmRzOiB0cnVlLFxuICAgICAgd29yZFdyYXA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoOiB0aGlzLndpbmRvd1dpZHRoXG4gICAgfSlcbiAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KCcnLCBzdHlsZSlcblxuICAgIHRoaXMuYWRkV2luZG93Q2hpbGQodGV4dClcbiAgICB0aGlzLnRleHQgPSB0ZXh0XG5cbiAgICB0aGlzLmF1dG9TY3JvbGxUb0JvdHRvbSA9IHRydWVcblxuICAgIG1lc3NhZ2VzLm9uKCdtb2RpZmllZCcsIHRoaXMubW9kaWZpZWQuYmluZCh0aGlzKSlcbiAgfVxuXG4gIG1vZGlmaWVkICgpIHtcbiAgICBsZXQgc2Nyb2xsUGVyY2VudCA9IHRoaXMuc2Nyb2xsUGVyY2VudFxuICAgIHRoaXMudGV4dC50ZXh0ID0gW10uY29uY2F0KG1lc3NhZ2VzLmxpc3QpLnJldmVyc2UoKS5qb2luKCdcXG4nKVxuICAgIHRoaXMudXBkYXRlU2Nyb2xsQmFyTGVuZ3RoKClcblxuICAgIC8vIOiLpXNjcm9sbOe9ruW6le+8jOiHquWLleaNsuWLlee9ruW6lVxuICAgIGlmIChzY3JvbGxQZXJjZW50ID09PSAxKSB7XG4gICAgICB0aGlzLnNjcm9sbFRvKDEpXG4gICAgfVxuICB9XG5cbiAgYWRkIChtc2cpIHtcbiAgICBtZXNzYWdlcy5hZGQobXNnKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnbWVzc2FnZS13aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZVdpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBWYWx1ZUJhciBmcm9tICcuL1ZhbHVlQmFyJ1xuXG5pbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IHsgQUJJTElUWV9NT1ZFLCBBQklMSVRZX0NBTUVSQSwgQUJJTElUWV9IRUFMVEgsIEFCSUxJVFlfTUFOQSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IGZsb29yID0gTWF0aC5mbG9vclxuXG5jb25zdCBBQklMSVRJRVNfQUxMID0gW1xuICBBQklMSVRZX01PVkUsXG4gIEFCSUxJVFlfQ0FNRVJBLFxuICBBQklMSVRZX0hFQUxUSFxuXVxuXG5jbGFzcyBQbGF5ZXJXaW5kb3cgZXh0ZW5kcyBXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIob3B0KVxuICAgIGxldCB7IHBsYXllciB9ID0gb3B0XG4gICAgdGhpcy5fb3B0ID0gb3B0XG5cbiAgICB0aGlzLmhlYWx0aEJhciA9IHRoaXMucmVuZGVyQmFyKHt4OiA1LCB5OiA1LCBjb2xvcjogMHhEMjMyMDB9KVxuICAgIHRoaXMubWFuYUJhciA9IHRoaXMucmVuZGVyQmFyKHt4OiA1LCB5OiAxNywgY29sb3I6IDB4MDAzMkQyfSlcbiAgICB0aGlzLnJlbmRlckFiaWxpdHkoe3g6IDUsIHk6IDMyfSlcblxuICAgIHRoaXMub25BYmlsaXR5Q2FycnkocGxheWVyKVxuXG4gICAgcGxheWVyLm9uKCdhYmlsaXR5LWNhcnJ5JywgdGhpcy5vbkFiaWxpdHlDYXJyeS5iaW5kKHRoaXMsIHBsYXllcikpXG4gICAgcGxheWVyLm9uKCdoZWFsdGgtY2hhbmdlJywgdGhpcy5vbkhlYWx0aENoYW5nZS5iaW5kKHRoaXMsIHBsYXllcikpXG4gICAgcGxheWVyLm9uKCdtYW5hLWNoYW5nZScsIHRoaXMub25NYW5hQ2hhbmdlLmJpbmQodGhpcywgcGxheWVyKSlcbiAgfVxuXG4gIHJlbmRlckFiaWxpdHkgKHt4LCB5fSkge1xuICAgIGxldCBhYmlsaXR5VGV4dENvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKVxuICAgIGFiaWxpdHlUZXh0Q29udGFpbmVyLnBvc2l0aW9uLnNldCh4LCB5KVxuICAgIHRoaXMuYWRkQ2hpbGQoYWJpbGl0eVRleHRDb250YWluZXIpXG4gICAgdGhpcy5hYmlsaXR5VGV4dENvbnRhaW5lciA9IGFiaWxpdHlUZXh0Q29udGFpbmVyXG4gIH1cblxuICByZW5kZXJCYXIgKHt4LCB5LCBjb2xvcn0pIHtcbiAgICBsZXQge3dpZHRofSA9IHRoaXMuX29wdFxuICAgIHdpZHRoIC89IDJcbiAgICBsZXQgaGVpZ2h0ID0gMTBcbiAgICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpXG4gICAgY29udGFpbmVyLnBvc2l0aW9uLnNldCh4LCB5KVxuICAgIGxldCBiYXIgPSBuZXcgVmFsdWVCYXIoe3dpZHRoLCBoZWlnaHQsIGNvbG9yfSlcbiAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KCcoMTAvMjApJywgdGhpcy5fZ2V0VGV4dFN0eWxlKCkpXG4gICAgdGV4dC54ID0gd2lkdGggKyAzXG4gICAgdGV4dC55ID0gLTNcblxuICAgIGNvbnRhaW5lci5hZGRDaGlsZChiYXIpXG4gICAgY29udGFpbmVyLmFkZENoaWxkKHRleHQpXG4gICAgdGhpcy5hZGRDaGlsZChjb250YWluZXIpXG5cbiAgICBjb250YWluZXIuYmFyID0gYmFyXG4gICAgY29udGFpbmVyLnRleHQgPSB0ZXh0XG5cbiAgICByZXR1cm4gY29udGFpbmVyXG4gIH1cblxuICBfZ2V0VGV4dFN0eWxlICgpIHtcbiAgICBsZXQgeyBmb250U2l6ZSA9IDEwIH0gPSB0aGlzLl9vcHRcbiAgICByZXR1cm4gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgbGluZUhlaWdodDogZm9udFNpemVcbiAgICB9KVxuICB9XG5cbiAgb25BYmlsaXR5Q2FycnkgKHBsYXllcikge1xuICAgIGxldCBpID0gMFxuXG4gICAgLy8g5pu05paw6Z2i5p2/5pW45pOaXG4gICAgbGV0IGNvbnRpYW5lciA9IHRoaXMuYWJpbGl0eVRleHRDb250YWluZXJcbiAgICBjb250aWFuZXIucmVtb3ZlQ2hpbGRyZW4oKVxuICAgIEFCSUxJVElFU19BTEwuZm9yRWFjaChhYmlsaXR5U3ltYm9sID0+IHtcbiAgICAgIGxldCBhYmlsaXR5ID0gcGxheWVyLmFiaWxpdGllc1thYmlsaXR5U3ltYm9sXVxuICAgICAgaWYgKGFiaWxpdHkpIHtcbiAgICAgICAgbGV0IHRleHQgPSBuZXcgVGV4dChhYmlsaXR5LnRvU3RyaW5nKCksIHRoaXMuX2dldFRleHRTdHlsZSgpKVxuICAgICAgICB0ZXh0LnkgPSBpICogKHRleHQuaGVpZ2h0KVxuXG4gICAgICAgIGNvbnRpYW5lci5hZGRDaGlsZCh0ZXh0KVxuXG4gICAgICAgIGkrK1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBvbkhlYWx0aENoYW5nZSAocGxheWVyKSB7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWVCYXIodGhpcy5oZWFsdGhCYXIsIHBsYXllcltBQklMSVRZX0hFQUxUSF0pXG4gIH1cblxuICBvbk1hbmFDaGFuZ2UgKHBsYXllcikge1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlQmFyKHRoaXMubWFuYUJhciwgcGxheWVyW0FCSUxJVFlfTUFOQV0pXG4gIH1cblxuICBfdXBkYXRlVmFsdWVCYXIgKHBhbmVsLCBhYmlsaXR5KSB7XG4gICAgaWYgKCFhYmlsaXR5KSB7XG4gICAgICBwYW5lbC52aXNpYmxlID0gZmFsc2VcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIXBhbmVsLnZpc2libGUpIHtcbiAgICAgIHBhbmVsLnZpc2libGUgPSB0cnVlXG4gICAgfVxuXG4gICAgcGFuZWwudGV4dC50ZXh0ID0gW1xuICAgICAgJygnLCBmbG9vcihhYmlsaXR5LnZhbHVlKSwgJy8nLCBmbG9vcihhYmlsaXR5LnZhbHVlTWF4KSwgJyknXG4gICAgXS5qb2luKCcnKVxuICAgIHBhbmVsLmJhci5lbWl0KCd2YWx1ZS1jaGFuZ2UnLCBhYmlsaXR5LnZhbHVlIC8gYWJpbGl0eS52YWx1ZU1heClcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3dpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXJXaW5kb3dcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuaW1wb3J0IFdpbmRvdyBmcm9tICcuL1dpbmRvdydcbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vV3JhcHBlcidcblxuY2xhc3MgU2Nyb2xsYWJsZVdpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG4gICAgbGV0IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcGFkZGluZyA9IDgsXG4gICAgICBzY3JvbGxCYXJXaWR0aCA9IDEwXG4gICAgfSA9IG9wdFxuICAgIHRoaXMuX29wdCA9IG9wdFxuXG4gICAgdGhpcy5faW5pdFNjcm9sbGFibGVBcmVhKFxuICAgICAgd2lkdGggLSBwYWRkaW5nICogMiAtIHNjcm9sbEJhcldpZHRoIC0gNSxcbiAgICAgIGhlaWdodCAtIHBhZGRpbmcgKiAyLFxuICAgICAgcGFkZGluZylcbiAgICB0aGlzLl9pbml0U2Nyb2xsQmFyKHtcbiAgICAgIC8vIHdpbmRvdyB3aWR0aCAtIHdpbmRvdyBwYWRkaW5nIC0gYmFyIHdpZHRoXG4gICAgICB4OiB3aWR0aCAtIHBhZGRpbmcgLSBzY3JvbGxCYXJXaWR0aCxcbiAgICAgIHk6IHBhZGRpbmcsXG4gICAgICB3aWR0aDogc2Nyb2xsQmFyV2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodCAtIHBhZGRpbmcgKiAyXG4gICAgfSlcbiAgfVxuXG4gIF9pbml0U2Nyb2xsYWJsZUFyZWEgKHdpZHRoLCBoZWlnaHQsIHBhZGRpbmcpIHtcbiAgICAvLyBob2xkIHBhZGRpbmdcbiAgICBsZXQgX21haW5WaWV3ID0gbmV3IENvbnRhaW5lcigpXG4gICAgX21haW5WaWV3LnBvc2l0aW9uLnNldChwYWRkaW5nLCBwYWRkaW5nKVxuICAgIHRoaXMuYWRkQ2hpbGQoX21haW5WaWV3KVxuXG4gICAgdGhpcy5tYWluVmlldyA9IG5ldyBDb250YWluZXIoKVxuICAgIF9tYWluVmlldy5hZGRDaGlsZCh0aGlzLm1haW5WaWV3KVxuXG4gICAgLy8gaGlkZSBtYWluVmlldydzIG92ZXJmbG93XG4gICAgbGV0IG1hc2sgPSBuZXcgR3JhcGhpY3MoKVxuICAgIG1hc2suYmVnaW5GaWxsKDB4RkZGRkZGKVxuICAgIG1hc2suZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDUpXG4gICAgbWFzay5lbmRGaWxsKClcbiAgICB0aGlzLm1haW5WaWV3Lm1hc2sgPSBtYXNrXG4gICAgX21haW5WaWV3LmFkZENoaWxkKG1hc2spXG5cbiAgICAvLyB3aW5kb3cgd2lkdGggLSB3aW5kb3cgcGFkZGluZyAqIDIgLSBiYXIgd2lkdGggLSBiZXR3ZWVuIHNwYWNlXG4gICAgdGhpcy5fd2luZG93V2lkdGggPSB3aWR0aFxuICAgIHRoaXMuX3dpbmRvd0hlaWdodCA9IGhlaWdodFxuICB9XG5cbiAgX2luaXRTY3JvbGxCYXIgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgbGV0IGNvbmF0aW5lciA9IG5ldyBDb250YWluZXIoKVxuICAgIGNvbmF0aW5lci54ID0geFxuICAgIGNvbmF0aW5lci55ID0geVxuXG4gICAgbGV0IHNjcm9sbEJhckJnID0gbmV3IEdyYXBoaWNzKClcbiAgICBzY3JvbGxCYXJCZy5iZWdpbkZpbGwoMHhBOEE4QTgpXG4gICAgc2Nyb2xsQmFyQmcuZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDIpXG4gICAgc2Nyb2xsQmFyQmcuZW5kRmlsbCgpXG5cbiAgICBsZXQgc2Nyb2xsQmFyID0gbmV3IEdyYXBoaWNzKClcbiAgICBzY3JvbGxCYXIuYmVnaW5GaWxsKDB4MjIyMjIyKVxuICAgIHNjcm9sbEJhci5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgMylcbiAgICBzY3JvbGxCYXIuZW5kRmlsbCgpXG4gICAgc2Nyb2xsQmFyLnRvU3RyaW5nID0gKCkgPT4gJ3Njcm9sbEJhcidcbiAgICBXcmFwcGVyLmRyYWdnYWJsZShzY3JvbGxCYXIsIHtcbiAgICAgIGJvdW5kYXJ5OiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDAsXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgIH1cbiAgICB9KVxuICAgIHNjcm9sbEJhci5vbignZHJhZycsIHRoaXMuc2Nyb2xsTWFpblZpZXcuYmluZCh0aGlzKSlcblxuICAgIGNvbmF0aW5lci5hZGRDaGlsZChzY3JvbGxCYXJCZylcbiAgICBjb25hdGluZXIuYWRkQ2hpbGQoc2Nyb2xsQmFyKVxuICAgIHRoaXMuYWRkQ2hpbGQoY29uYXRpbmVyKVxuICAgIHRoaXMuc2Nyb2xsQmFyID0gc2Nyb2xsQmFyXG4gICAgdGhpcy5zY3JvbGxCYXJCZyA9IHNjcm9sbEJhckJnXG4gIH1cblxuICAvLyDmjbLli5XoppbnqpdcbiAgc2Nyb2xsTWFpblZpZXcgKCkge1xuICAgIHRoaXMubWFpblZpZXcueSA9ICh0aGlzLndpbmRvd0hlaWdodCAtIHRoaXMubWFpblZpZXcuaGVpZ2h0KSAqIHRoaXMuc2Nyb2xsUGVyY2VudFxuICB9XG5cbiAgLy8g5paw5aKe54mp5Lu26Iez6KaW56qXXG4gIGFkZFdpbmRvd0NoaWxkIChjaGlsZCkge1xuICAgIHRoaXMubWFpblZpZXcuYWRkQ2hpbGQoY2hpbGQpXG4gIH1cblxuICAvLyDmm7TmlrDmjbLli5Xmo5LlpKflsI8sIOS4jeS4gOWumuimgeiqv+eUqFxuICB1cGRhdGVTY3JvbGxCYXJMZW5ndGggKCkge1xuICAgIGxldCB7IHNjcm9sbEJhck1pbkhlaWdodCA9IDIwIH0gPSB0aGlzLl9vcHRcblxuICAgIGxldCBkaCA9IHRoaXMubWFpblZpZXcuaGVpZ2h0IC8gdGhpcy53aW5kb3dIZWlnaHRcbiAgICBpZiAoZGggPCAxKSB7XG4gICAgICB0aGlzLnNjcm9sbEJhci5oZWlnaHQgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNjcm9sbEJhci5oZWlnaHQgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodCAvIGRoXG4gICAgICAvLyDpgb/lhY3lpKrlsI/lvojpm6Pmi5bmm7NcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IE1hdGgubWF4KHNjcm9sbEJhck1pbkhlaWdodCwgdGhpcy5zY3JvbGxCYXIuaGVpZ2h0KVxuICAgIH1cbiAgICB0aGlzLnNjcm9sbEJhci5mYWxsYmFja1RvQm91bmRhcnkoKVxuICB9XG5cbiAgLy8g5o2y5YuV55m+5YiG5q+UXG4gIGdldCBzY3JvbGxQZXJjZW50ICgpIHtcbiAgICBsZXQgZGVsdGEgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodCAtIHRoaXMuc2Nyb2xsQmFyLmhlaWdodFxuICAgIHJldHVybiBkZWx0YSA9PT0gMCA/IDEgOiB0aGlzLnNjcm9sbEJhci55IC8gZGVsdGFcbiAgfVxuXG4gIC8vIOaNsuWLleiHs+eZvuWIhuavlFxuICBzY3JvbGxUbyAocGVyY2VudCkge1xuICAgIGxldCBkZWx0YSA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC0gdGhpcy5zY3JvbGxCYXIuaGVpZ2h0XG4gICAgbGV0IHkgPSAwXG4gICAgaWYgKGRlbHRhICE9PSAwKSB7XG4gICAgICB5ID0gZGVsdGEgKiBwZXJjZW50XG4gICAgfVxuICAgIHRoaXMuc2Nyb2xsQmFyLnkgPSB5XG4gICAgdGhpcy5zY3JvbGxNYWluVmlldygpXG4gIH1cblxuICBnZXQgd2luZG93V2lkdGggKCkge1xuICAgIHJldHVybiB0aGlzLl93aW5kb3dXaWR0aFxuICB9XG5cbiAgZ2V0IHdpbmRvd0hlaWdodCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpbmRvd0hlaWdodFxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjcm9sbGFibGVXaW5kb3dcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi9saWIvVmVjdG9yJ1xyXG5cclxuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcclxuaW1wb3J0IHsgTEVGVCwgVVAsIFJJR0hULCBET1dOIH0gZnJvbSAnLi4vY29uZmlnL2NvbnRyb2wnXHJcblxyXG5jb25zdCBBTExfS0VZUyA9IFtSSUdIVCwgTEVGVCwgVVAsIERPV05dXHJcblxyXG5jbGFzcyBUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgcmFkaXVzIH0pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXHJcblxyXG4gICAgbGV0IHRvdWNoQXJlYSA9IG5ldyBHcmFwaGljcygpXHJcbiAgICB0b3VjaEFyZWEuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXHJcbiAgICB0b3VjaEFyZWEuZHJhd0NpcmNsZSgwLCAwLCByYWRpdXMpXHJcbiAgICB0b3VjaEFyZWEuZW5kRmlsbCgpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRvdWNoQXJlYSlcclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzXHJcblxyXG4gICAgdGhpcy5zZXR1cFRvdWNoKClcclxuICB9XHJcblxyXG4gIHNldHVwVG91Y2ggKCkge1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgIGxldCBmID0gdGhpcy5vblRvdWNoLmJpbmQodGhpcylcclxuICAgIHRoaXMub24oJ3RvdWNoc3RhcnQnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2hlbmQnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2htb3ZlJywgZilcclxuICAgIHRoaXMub24oJ3RvdWNoZW5kb3V0c2lkZScsIGYpXHJcbiAgfVxyXG5cclxuICBvblRvdWNoIChlKSB7XHJcbiAgICBsZXQgdHlwZSA9IGUudHlwZVxyXG4gICAgbGV0IHByb3BhZ2F0aW9uID0gZmFsc2VcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcclxuICAgICAgICB0aGlzLmRyYWcgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcclxuICAgICAgICB0aGlzLmNyZWF0ZURyYWdQb2ludCgpXHJcbiAgICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbiA9IHtcclxuICAgICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICAgIHk6IHRoaXMueVxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICd0b3VjaGVuZCc6XHJcbiAgICAgIGNhc2UgJ3RvdWNoZW5kb3V0c2lkZSc6XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgICAgdGhpcy5kcmFnID0gZmFsc2VcclxuICAgICAgICAgIHRoaXMuZGVzdHJveURyYWdQb2ludCgpXHJcbiAgICAgICAgICB0aGlzLnJlbGVhc2VLZXlzKClcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAndG91Y2htb3ZlJzpcclxuICAgICAgICBpZiAoIXRoaXMuZHJhZykge1xyXG4gICAgICAgICAgcHJvcGFnYXRpb24gPSB0cnVlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZXNzS2V5cyhlLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzKSlcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgaWYgKCFwcm9wYWdhdGlvbikge1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjcmVhdGVEcmFnUG9pbnQgKCkge1xyXG4gICAgbGV0IGRyYWdQb2ludCA9IG5ldyBHcmFwaGljcygpXHJcbiAgICBkcmFnUG9pbnQuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXHJcbiAgICBkcmFnUG9pbnQuZHJhd0NpcmNsZSgwLCAwLCAyMClcclxuICAgIGRyYWdQb2ludC5lbmRGaWxsKClcclxuICAgIHRoaXMuYWRkQ2hpbGQoZHJhZ1BvaW50KVxyXG4gICAgdGhpcy5kcmFnUG9pbnQgPSBkcmFnUG9pbnRcclxuICB9XHJcblxyXG4gIGRlc3Ryb3lEcmFnUG9pbnQgKCkge1xyXG4gICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLmRyYWdQb2ludClcclxuICAgIHRoaXMuZHJhZ1BvaW50LmRlc3Ryb3koKVxyXG4gIH1cclxuXHJcbiAgcHJlc3NLZXlzIChuZXdQb2ludCkge1xyXG4gICAgdGhpcy5yZWxlYXNlS2V5cygpXHJcbiAgICAvLyDmhJ/mh4npnYjmlY/luqZcclxuICAgIGxldCB0aHJlc2hvbGQgPSAzMFxyXG5cclxuICAgIGxldCB2ZWN0b3IgPSBWZWN0b3IuZnJvbVBvaW50KG5ld1BvaW50KVxyXG4gICAgbGV0IGRlZyA9IHZlY3Rvci5kZWdcclxuICAgIGxldCBsZW4gPSB2ZWN0b3IubGVuZ3RoXHJcblxyXG4gICAgaWYgKGxlbiA8IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGxldCBkZWdBYnMgPSBNYXRoLmFicyhkZWcpXHJcbiAgICBsZXQgZHggPSBkZWdBYnMgPCA2Ny41ID8gUklHSFQgOiAoZGVnQWJzID4gMTEyLjUgPyBMRUZUIDogZmFsc2UpXHJcbiAgICBsZXQgZHkgPSBkZWdBYnMgPCAyMi41IHx8IGRlZ0FicyA+IDE1Ny41ID8gZmFsc2UgOiAoZGVnIDwgMCA/IFVQIDogRE9XTilcclxuXHJcbiAgICBpZiAoZHggfHwgZHkpIHtcclxuICAgICAgaWYgKGR4KSB7XHJcbiAgICAgICAga2V5Ym9hcmRKUy5wcmVzc0tleShkeClcclxuICAgICAgfVxyXG4gICAgICBpZiAoZHkpIHtcclxuICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KGR5KVxyXG4gICAgICB9XHJcbiAgICAgIHZlY3Rvci5tdWx0aXBseVNjYWxhcih0aGlzLnJhZGl1cyAvIGxlbilcclxuICAgICAgdGhpcy5kcmFnUG9pbnQucG9zaXRpb24uc2V0KFxyXG4gICAgICAgIHZlY3Rvci54LFxyXG4gICAgICAgIHZlY3Rvci55XHJcbiAgICAgIClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbGVhc2VLZXlzICgpIHtcclxuICAgIEFMTF9LRVlTLmZvckVhY2goa2V5ID0+IGtleWJvYXJkSlMucmVsZWFzZUtleShrZXkpKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsXHJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi9saWIvVmVjdG9yJ1xyXG5cclxuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xyXG5cclxuY2xhc3MgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcclxuXHJcbiAgICBsZXQgdG91Y2hBcmVhID0gbmV3IEdyYXBoaWNzKClcclxuICAgIHRvdWNoQXJlYS5iZWdpbkZpbGwoMHhGMkYyRjIsIDAuNSlcclxuICAgIHRvdWNoQXJlYS5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxyXG4gICAgdG91Y2hBcmVhLmVuZEZpbGwoKVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0b3VjaEFyZWEpXHJcblxyXG4gICAgdGhpcy5zZXR1cFRvdWNoKClcclxuICB9XHJcblxyXG4gIHNldHVwVG91Y2ggKCkge1xyXG4gICAgdGhpcy5jZW50ZXIgPSBuZXcgVmVjdG9yKHRoaXMud2lkdGggLyAyLCB0aGlzLmhlaWdodCAvIDIpXHJcbiAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgbGV0IGYgPSB0aGlzLm9uVG91Y2guYmluZCh0aGlzKVxyXG4gICAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXHJcbiAgfVxyXG5cclxuICBvblRvdWNoIChlKSB7XHJcbiAgICBsZXQgcG9pbnRlciA9IGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpXHJcbiAgICBsZXQgdmVjdG9yID0gVmVjdG9yLmZyb21Qb2ludChwb2ludGVyKS5zdWIodGhpcy5jZW50ZXIpXHJcbiAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgncm90YXRlJywgdmVjdG9yKVxyXG4gICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoJ2ZpcmUnKVxyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdUb3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsXHJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY2xhc3MgVmFsdWVCYXIgZXh0ZW5kcyBDb250YWluZXIge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIoKVxuICAgIGxldCB7IHggPSAwLCB5ID0gMCwgd2lkdGgsIGhlaWdodCwgY29sb3IgfSA9IG9wdFxuXG4gICAgLy8gYmFja2dyb3VuZFxuICAgIGxldCBocEJhckJnID0gbmV3IEdyYXBoaWNzKClcbiAgICBocEJhckJnLmJlZ2luRmlsbCgweEEyQTJBMilcbiAgICBocEJhckJnLmxpbmVTdHlsZSgxLCAweDIyMjIyMiwgMSlcbiAgICBocEJhckJnLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpXG4gICAgaHBCYXJCZy5lbmRGaWxsKClcblxuICAgIC8vIG1hc2tcbiAgICBsZXQgbWFzayA9IG5ldyBHcmFwaGljcygpXG4gICAgbWFzay5iZWdpbkZpbGwoMHhGRkZGRkYpXG4gICAgbWFzay5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxuICAgIG1hc2suZW5kRmlsbCgpXG4gICAgdGhpcy5hZGRDaGlsZChtYXNrKVxuICAgIHRoaXMuYmFyTWFzayA9IG1hc2tcblxuICAgIHRoaXMuYWRkQ2hpbGQoaHBCYXJCZylcbiAgICB0aGlzLmhwQmFyQmcgPSBocEJhckJnXG5cbiAgICAvLyBiYXJcbiAgICB0aGlzLl9yZW5kZXJCYXIoe2NvbG9yLCB3aWR0aCwgaGVpZ2h0fSlcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxuICAgIHRoaXMuX29wdCA9IG9wdFxuXG4gICAgdGhpcy5vbigndmFsdWUtY2hhbmdlJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSlcbiAgfVxuXG4gIHVwZGF0ZSAocmF0ZSkge1xuICAgIHRoaXMucmVtb3ZlQ2hpbGQodGhpcy5ocEJhcklubmVyKVxuICAgIHRoaXMuaHBCYXJJbm5lci5kZXN0cm95KClcbiAgICBsZXQgeyBjb2xvciwgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5fb3B0XG4gICAgdGhpcy5fcmVuZGVyQmFyKHtcbiAgICAgIGNvbG9yLFxuICAgICAgd2lkdGg6IHdpZHRoICogcmF0ZSxcbiAgICAgIGhlaWdodFxuICAgIH0pXG4gIH1cblxuICBfcmVuZGVyQmFyICh7Y29sb3IsIHdpZHRoLCBoZWlnaHR9KSB7XG4gICAgbGV0IGhwQmFySW5uZXIgPSBuZXcgR3JhcGhpY3MoKVxuICAgIGhwQmFySW5uZXIuYmVnaW5GaWxsKGNvbG9yKVxuICAgIGhwQmFySW5uZXIuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodClcbiAgICBocEJhcklubmVyLmVuZEZpbGwoKVxuICAgIGhwQmFySW5uZXIubWFzayA9IHRoaXMuYmFyTWFza1xuXG4gICAgdGhpcy5hZGRDaGlsZChocEJhcklubmVyKVxuICAgIHRoaXMuaHBCYXJJbm5lciA9IGhwQmFySW5uZXJcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWYWx1ZUJhclxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5jbGFzcyBXaW5kb3cgZXh0ZW5kcyBDb250YWluZXIge1xuICBjb25zdHJ1Y3RvciAoeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcblxuICAgIGxldCBsaW5lV2lkdGggPSAzXG5cbiAgICBsZXQgd2luZG93QmcgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHdpbmRvd0JnLmJlZ2luRmlsbCgweEYyRjJGMilcbiAgICB3aW5kb3dCZy5saW5lU3R5bGUobGluZVdpZHRoLCAweDIyMjIyMiwgMSlcbiAgICB3aW5kb3dCZy5kcmF3Um91bmRlZFJlY3QoXG4gICAgICAwLCAwLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICA1KVxuICAgIHdpbmRvd0JnLmVuZEZpbGwoKVxuICAgIHRoaXMuYWRkQ2hpbGQod2luZG93QmcpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2luZG93XG4iLCJjb25zdCBPUFQgPSBTeW1ib2woJ29wdCcpXG5cbmZ1bmN0aW9uIF9lbmFibGVEcmFnZ2FibGUgKCkge1xuICB0aGlzLmRyYWcgPSBmYWxzZVxuICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxuICBsZXQgZiA9IF9vblRvdWNoLmJpbmQodGhpcylcbiAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXG4gIHRoaXMub24oJ3RvdWNoZW5kJywgZilcbiAgdGhpcy5vbigndG91Y2htb3ZlJywgZilcbiAgdGhpcy5vbigndG91Y2hlbmRvdXRzaWRlJywgZilcbiAgdGhpcy5vbignbW91c2Vkb3duJywgZilcbiAgdGhpcy5vbignbW91c2V1cCcsIGYpXG4gIHRoaXMub24oJ21vdXNlbW92ZScsIGYpXG4gIHRoaXMub24oJ21vdXNldXBvdXRzaWRlJywgZilcbn1cblxuZnVuY3Rpb24gX29uVG91Y2ggKGUpIHtcbiAgbGV0IHR5cGUgPSBlLnR5cGVcbiAgbGV0IHByb3BhZ2F0aW9uID0gZmFsc2VcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAndG91Y2hzdGFydCc6XG4gICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgIHRoaXMuZHJhZyA9IGUuZGF0YS5nbG9iYWwuY2xvbmUoKVxuICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbiA9IHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnlcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndG91Y2hlbmQnOlxuICAgIGNhc2UgJ3RvdWNoZW5kb3V0c2lkZSc6XG4gICAgY2FzZSAnbW91c2V1cCc6XG4gICAgY2FzZSAnbW91c2V1cG91dHNpZGUnOlxuICAgICAgdGhpcy5kcmFnID0gZmFsc2VcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndG91Y2htb3ZlJzpcbiAgICBjYXNlICdtb3VzZW1vdmUnOlxuICAgICAgaWYgKCF0aGlzLmRyYWcpIHtcbiAgICAgICAgcHJvcGFnYXRpb24gPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBsZXQgbmV3UG9pbnQgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcbiAgICAgIHRoaXMucG9zaXRpb24uc2V0KFxuICAgICAgICB0aGlzLm9yaWdpblBvc2l0aW9uLnggKyBuZXdQb2ludC54IC0gdGhpcy5kcmFnLngsXG4gICAgICAgIHRoaXMub3JpZ2luUG9zaXRpb24ueSArIG5ld1BvaW50LnkgLSB0aGlzLmRyYWcueVxuICAgICAgKVxuICAgICAgX2ZhbGxiYWNrVG9Cb3VuZGFyeS5jYWxsKHRoaXMpXG4gICAgICB0aGlzLmVtaXQoJ2RyYWcnKSAvLyBtYXliZSBjYW4gcGFzcyBwYXJhbSBmb3Igc29tZSByZWFzb246IGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpXG4gICAgICBicmVha1xuICB9XG4gIGlmICghcHJvcGFnYXRpb24pIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cbn1cblxuLy8g6YCA5Zue6YKK55WMXG5mdW5jdGlvbiBfZmFsbGJhY2tUb0JvdW5kYXJ5ICgpIHtcbiAgbGV0IHsgd2lkdGggPSB0aGlzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmhlaWdodCwgYm91bmRhcnkgfSA9IHRoaXNbT1BUXVxuICB0aGlzLnggPSBNYXRoLm1heCh0aGlzLngsIGJvdW5kYXJ5LngpXG4gIHRoaXMueCA9IE1hdGgubWluKHRoaXMueCwgYm91bmRhcnkueCArIGJvdW5kYXJ5LndpZHRoIC0gd2lkdGgpXG4gIHRoaXMueSA9IE1hdGgubWF4KHRoaXMueSwgYm91bmRhcnkueSlcbiAgdGhpcy55ID0gTWF0aC5taW4odGhpcy55LCBib3VuZGFyeS55ICsgYm91bmRhcnkuaGVpZ2h0IC0gaGVpZ2h0KVxufVxuY2xhc3MgV3JhcHBlciB7XG4gIC8qKlxuICAgKiBkaXNwbGF5T2JqZWN0OiB3aWxsIHdyYXBwZWQgRGlzcGxheU9iamVjdFxuICAgKiBvcHQ6IHtcbiAgICogIGJvdW5kYXJ5OiDmi5bmm7PpgornlYwgeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH1cbiAgICogIFssIHdpZHRoXTog6YKK55WM56Kw5pKe5a+sKGRlZmF1bHQ6IGRpc3BsYXlPYmplY3Qud2lkdGgpXG4gICAqICBbLCBoZWlnaHRdOiDpgornlYznorDmkp7pq5goZGVmYXVsdDogZGlzcGxheU9iamVjdC5oZWlnaHQpXG4gICAqICB9XG4gICAqL1xuICBzdGF0aWMgZHJhZ2dhYmxlIChkaXNwbGF5T2JqZWN0LCBvcHQpIHtcbiAgICBkaXNwbGF5T2JqZWN0W09QVF0gPSBvcHRcbiAgICBfZW5hYmxlRHJhZ2dhYmxlLmNhbGwoZGlzcGxheU9iamVjdClcbiAgICBkaXNwbGF5T2JqZWN0LmZhbGxiYWNrVG9Cb3VuZGFyeSA9IF9mYWxsYmFja1RvQm91bmRhcnlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXcmFwcGVyXG4iXX0=
