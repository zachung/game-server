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

app.changeStage();
app.start();
app.changeScene(_LoadingScene2.default);

},{"./lib/Application":10,"./scenes/LoadingScene":28}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var IS_MOBILE = exports.IS_MOBILE = function (a) {
  return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))
  );
}(navigator.userAgent || navigator.vendor || window.opera);

var CEIL_SIZE = exports.CEIL_SIZE = 16;

var ABILITY_MOVE = exports.ABILITY_MOVE = Symbol('move');
var ABILITY_CAMERA = exports.ABILITY_CAMERA = Symbol('camera');
var ABILITY_OPERATE = exports.ABILITY_OPERATE = Symbol('operate');
var ABILITY_KEY_MOVE = exports.ABILITY_KEY_MOVE = Symbol('key-move');
var ABILITY_LIFE = exports.ABILITY_LIFE = Symbol('life');
var ABILITIES_ALL = exports.ABILITIES_ALL = [ABILITY_MOVE, ABILITY_CAMERA, ABILITY_OPERATE, ABILITY_KEY_MOVE, ABILITY_LIFE];

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

},{}],10:[function(require,module,exports){
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

},{"./PIXI":14}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global PIXI, Bump */

exports.default = new Bump(PIXI);

},{}],12:[function(require,module,exports){
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
    _this.map = new _PIXI.Container();
    _this.addChild(_this.map);

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
          this.map.addChild(o);
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
        _this2.map.addChild(o);
      });
    }
  }, {
    key: 'addPlayer',
    value: function addPlayer(player, toPosition) {
      player.position.set(toPosition[0] * _constants.CEIL_SIZE, toPosition[1] * _constants.CEIL_SIZE);
      this.map.addChild(player);

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

},{"../config/constants":8,"../lib/Bump":11,"./PIXI":14,"./utils":16}],13:[function(require,module,exports){
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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
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

},{"events":1}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"./PIXI":14}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.instanceByItemId = instanceByItemId;
exports.instanceByAbilityId = instanceByAbilityId;

var _Wall = require('../objects/Wall');

var _Wall2 = _interopRequireDefault(_Wall);

var _Grass = require('../objects/Grass');

var _Grass2 = _interopRequireDefault(_Grass);

var _Treasure = require('../objects/Treasure');

var _Treasure2 = _interopRequireDefault(_Treasure);

var _Door = require('../objects/Door');

var _Door2 = _interopRequireDefault(_Door);

var _Move = require('../objects/abilities/Move');

var _Move2 = _interopRequireDefault(_Move);

var _Camera = require('../objects/abilities/Camera');

var _Camera2 = _interopRequireDefault(_Camera);

var _Operate = require('../objects/abilities/Operate');

var _Operate2 = _interopRequireDefault(_Operate);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Items = [_Grass2.default, _Wall2.default, _Treasure2.default, _Door2.default];

var Abilities = [_Move2.default, _Camera2.default, _Operate2.default];

function instanceByItemId(itemId, params) {
  return new Items[itemId](params);
}

function instanceByAbilityId(abilityId, params) {
  return new Abilities[abilityId](params);
}

},{"../objects/Door":18,"../objects/Grass":20,"../objects/Treasure":21,"../objects/Wall":22,"../objects/abilities/Camera":24,"../objects/abilities/Move":26,"../objects/abilities/Operate":27}],17:[function(require,module,exports){
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

    _this.tickAbilities = {};
    _this.abilities = {};
    return _this;
  }

  _createClass(Cat, [{
    key: 'takeAbility',
    value: function takeAbility(ability) {
      if (ability.hasToReplace(this, ability)) {
        ability.carryBy(this);
        this.emit('ability-carry', ability);
      }
    }
  }, {
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

},{"../lib/PIXI":14,"./GameObject":19}],18:[function(require,module,exports){
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
      var ability = operator.abilities[_constants.ABILITY_OPERATE];
      if (!ability) {
        this.say([operator.toString(), ' dosen\'t has ability to use this door ', this.map, '.'].join(''));
      } else {
        ability.use(operator, this);
      }
    }
  }, {
    key: _constants.ABILITY_OPERATE,
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

},{"../config/constants":8,"../lib/PIXI":14,"./GameObject":19}],19:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Messages":13,"../lib/PIXI":14}],20:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/PIXI":14,"./GameObject":19}],21:[function(require,module,exports){
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
      return (0, _utils.instanceByAbilityId)(conf[0], conf[1]);
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

},{"../config/constants":8,"../lib/PIXI":14,"../lib/utils":16,"./GameObject":19}],22:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/PIXI":14,"./GameObject":19}],23:[function(require,module,exports){
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
    key: 'type',
    get: function get() {
      return type;
    }
  }]);

  return Ability;
}();

exports.default = Ability;

},{}],24:[function(require,module,exports){
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

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _PIXI = require('../../lib/PIXI');

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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var LIGHT = Symbol('light');

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
      this.removeCamera(owner);
    }
  }, {
    key: 'setup',
    value: function setup(owner, container) {
      if (!container.lighting) {
        console.error('container does NOT has lighting property');
        return;
      }
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

      owner[LIGHT] = lightbulb;
      owner.addChild(lightbulb);

      owner.removed = this.onRemoved.bind(this, owner);
      owner.once('removed', owner.removed);
    }
  }, {
    key: 'onRemoved',
    value: function onRemoved(owner) {
      var _this3 = this;

      this.removeCamera(owner);
      owner.once('added', function (container) {
        return _this3.setup(owner, container);
      });
    }
  }, {
    key: 'removeCamera',
    value: function removeCamera(owner) {
      // remove light
      owner.removeChild(owner[LIGHT]);
      delete owner[LIGHT];
      // remove listener
      owner.off('removed', this.removed);
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

},{"../../config/constants":8,"../../lib/PIXI":14,"./Ability":23}],25:[function(require,module,exports){
'use strict';

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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
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
        owner.dx = -dir[_control.LEFT] + dir[_control.RIGHT];
        owner.dy = -dir[_control.UP] + dir[_control.DOWN];
      };
      var bind = function bind(code) {
        dir[code] = 0;
        var preHandler = function preHandler(e) {
          e.preventRepeat();
          dir[code] = 1;
          calcDir();
        };
        _keyboardjs2.default.bind(code, preHandler, function () {
          dir[code] = 0;
          calcDir();
        });
        return preHandler;
      };

      _keyboardjs2.default.setContext('');
      _keyboardjs2.default.withContext('', function () {
        var _owner$ABILITY_KEY_MO;

        owner[_constants.ABILITY_KEY_MOVE] = (_owner$ABILITY_KEY_MO = {}, _defineProperty(_owner$ABILITY_KEY_MO, _control.LEFT, bind(_control.LEFT)), _defineProperty(_owner$ABILITY_KEY_MO, _control.UP, bind(_control.UP)), _defineProperty(_owner$ABILITY_KEY_MO, _control.RIGHT, bind(_control.RIGHT)), _defineProperty(_owner$ABILITY_KEY_MO, _control.DOWN, bind(_control.DOWN)), _owner$ABILITY_KEY_MO);
      });
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

},{"../../config/constants":8,"../../config/control":9,"./Ability":23,"keyboardjs":2}],26:[function(require,module,exports){
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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Move = function (_Ability) {
  _inherits(Move, _Ability);

  function Move(value) {
    _classCallCheck(this, Move);

    var _this = _possibleConstructorReturn(this, (Move.__proto__ || Object.getPrototypeOf(Move)).call(this));

    _this.value = value;
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
      owner.tickAbilities[this.type.toString()] = this;
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
  }, {
    key: 'type',
    get: function get() {
      return _constants.ABILITY_MOVE;
    }
  }]);

  return Move;
}(_Ability3.default);

exports.default = Move;

},{"../../config/constants":8,"./Ability":23}],27:[function(require,module,exports){
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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
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
    key: 'replacedBy',
    value: function replacedBy(other) {
      this.set.forEach(other.set.add.bind(other.set));
    }
  }, {
    key: 'use',
    value: function use(operator, target) {
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

},{"../../config/constants":8,"./Ability":23}],28:[function(require,module,exports){
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
          mapFile: 'E0N0',
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

},{"../lib/PIXI":14,"../lib/Scene":15,"./PlayScene":29}],29:[function(require,module,exports){
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

var _constants = require('../config/constants');

var _Cat = require('../objects/Cat');

var _Cat2 = _interopRequireDefault(_Cat);

var _Move = require('../objects/abilities/Move');

var _Move2 = _interopRequireDefault(_Move);

var _KeyMove = require('../objects/abilities/KeyMove');

var _KeyMove2 = _interopRequireDefault(_KeyMove);

var _Operate = require('../objects/abilities/Operate');

var _Operate2 = _interopRequireDefault(_Operate);

var _Camera = require('../objects/abilities/Camera');

var _Camera2 = _interopRequireDefault(_Camera);

var _MessageWindow = require('../ui/MessageWindow');

var _MessageWindow2 = _interopRequireDefault(_MessageWindow);

var _PlayerWindow = require('../ui/PlayerWindow');

var _PlayerWindow2 = _interopRequireDefault(_PlayerWindow);

var _TouchControlPanel = require('../ui/TouchControlPanel');

var _TouchControlPanel2 = _interopRequireDefault(_TouchControlPanel);

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
      // 讓UI顯示在頂層
      messageWindow.parentGroup = uiGroup;
      messageWindow.add(['scene size: (', sceneWidth, ', ', sceneHeight, ').'].join(''));

      var playerWindow = new _PlayerWindow2.default({
        x: 0,
        y: 0,
        width: 100,
        height: 80,
        player: this.cat
      });

      var touchControlPanel = new _TouchControlPanel2.default({
        x: 100,
        y: 200,
        radius: 50
      });
      touchControlPanel.parentGroup = uiGroup;

      uiLayer.addChild(messageWindow);
      uiLayer.addChild(playerWindow);
      uiLayer.addChild(touchControlPanel);

      if (_constants.IS_MOBILE) {
        // require('../lib/demo')
      }
    }
  }, {
    key: 'initPlayer',
    value: function initPlayer() {
      if (!this.cat) {
        this.cat = new _Cat2.default();
        this.cat.takeAbility(new _Move2.default(1));
        this.cat.takeAbility(new _Operate2.default('E0N0'));
        this.cat.takeAbility(new _KeyMove2.default());
        this.cat.takeAbility(new _Camera2.default(1));
        this.cat.width = 10;
        this.cat.height = 10;
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

      var map = new _Map2.default();
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

      this.addChild(map);
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
      this.map.position.set(sceneWidth / 2 - this.cat.x, sceneHeight / 2 - this.cat.y);
    }
  }]);

  return PlayScene;
}(_Scene3.default);

exports.default = PlayScene;

},{"../config/constants":8,"../lib/Map":12,"../lib/PIXI":14,"../lib/Scene":15,"../objects/Cat":17,"../objects/abilities/Camera":24,"../objects/abilities/KeyMove":25,"../objects/abilities/Move":26,"../objects/abilities/Operate":27,"../ui/MessageWindow":30,"../ui/PlayerWindow":31,"../ui/TouchControlPanel":33}],30:[function(require,module,exports){
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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
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

},{"../lib/Messages":13,"../lib/PIXI":14,"./ScrollableWindow":32}],31:[function(require,module,exports){
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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

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

      var contianer = this.abilityTextContainer;
      contianer.removeChildren();
      _constants.ABILITIES_ALL.forEach(function (abilitySymbol) {
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

},{"../config/constants":8,"../lib/PIXI":14,"./Window":34}],32:[function(require,module,exports){
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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
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

},{"../lib/PIXI":14,"./Window":34,"./Wrapper":35}],33:[function(require,module,exports){
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

var _Messages = require('../lib/Messages');

var _Messages2 = _interopRequireDefault(_Messages);

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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var TouchControlPanel = function (_Container) {
  _inherits(TouchControlPanel, _Container);

  function TouchControlPanel(_ref) {
    var x = _ref.x,
        y = _ref.y,
        radius = _ref.radius;

    _classCallCheck(this, TouchControlPanel);

    var _this = _possibleConstructorReturn(this, (TouchControlPanel.__proto__ || Object.getPrototypeOf(TouchControlPanel)).call(this));

    _this.position.set(x, y);

    var touchArea = new _PIXI.Graphics();
    touchArea.beginFill(0xF2F2F2, 0.5);
    touchArea.drawCircle(0, 0, radius);
    touchArea.endFill();
    _this.addChild(touchArea);

    _this.setupTouch();
    return _this;
  }

  _createClass(TouchControlPanel, [{
    key: 'setupTouch',
    value: function setupTouch() {
      this.interactive = true;
      var f = this.onTouch.bind(this);
      this.on('touchstart', f);
      this.on('touchend', f);
      this.on('touchmove', f);
      this.on('touchendoutside', f);
      this.on('mousedown', f);
      this.on('mouseup', f);
      this.on('mousemove', f);
      this.on('mouseupoutside', f);
    }
  }, {
    key: 'onTouch',
    value: function onTouch(e) {
      var type = e.type;
      var propagation = false;
      _Messages2.default.add(type);
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
          var x = newPoint.x - this.drag.x;
          var y = newPoint.y - this.drag.y;
          var dx = 0;
          var dy = 0;
          var thred = 10;
          _keyboardjs2.default.releaseKey(_control.RIGHT);
          _keyboardjs2.default.releaseKey(_control.LEFT);
          _keyboardjs2.default.releaseKey(_control.UP);
          _keyboardjs2.default.releaseKey(_control.DOWN);
          _Messages2.default.add(['(', x.toFixed(2), ', ', y.toFixed(2), ')'].join(''));
          if (x > thred) {
            dx = 1;
            _keyboardjs2.default.pressKey(_control.RIGHT);
          } else if (x < -thred) {
            dx = -1;
            _keyboardjs2.default.pressKey(_control.LEFT);
          }
          if (y > thred) {
            dy = 1;
            _keyboardjs2.default.pressKey(_control.DOWN);
          } else if (y < -thred) {
            dy = -1;
            _keyboardjs2.default.pressKey(_control.UP);
          }
          _Messages2.default.add([dx, dy].join(', '));
          break;
      }
      if (!propagation) {
        e.stopPropagation();
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'TouchControlPanel';
    }
  }]);

  return TouchControlPanel;
}(_PIXI.Container);

exports.default = TouchControlPanel;

},{"../config/control":9,"../lib/Messages":13,"../lib/PIXI":14,"keyboardjs":2}],34:[function(require,module,exports){
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
    windowBg.drawRoundedRect(0, 0, width - lineWidth, height - lineWidth, 5);
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

},{"../lib/PIXI":14}],35:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2tleWJvYXJkanMvbGliL2tleS1jb21iby5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9rZXlib2FyZC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9sb2NhbGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMva2V5Ym9hcmRqcy9sb2NhbGVzL3VzLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jb25maWcvY29uc3RhbnRzLmpzIiwic3JjL2NvbmZpZy9jb250cm9sLmpzIiwic3JjL2xpYi9BcHBsaWNhdGlvbi5qcyIsInNyYy9saWIvQnVtcC5qcyIsInNyYy9saWIvTWFwLmpzIiwic3JjL2xpYi9NZXNzYWdlcy5qcyIsInNyYy9saWIvUElYSS5qcyIsInNyYy9saWIvU2NlbmUuanMiLCJzcmMvbGliL3V0aWxzLmpzIiwic3JjL29iamVjdHMvQ2F0LmpzIiwic3JjL29iamVjdHMvRG9vci5qcyIsInNyYy9vYmplY3RzL0dhbWVPYmplY3QuanMiLCJzcmMvb2JqZWN0cy9HcmFzcy5qcyIsInNyYy9vYmplY3RzL1RyZWFzdXJlLmpzIiwic3JjL29iamVjdHMvV2FsbC5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9BYmlsaXR5LmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0NhbWVyYS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9LZXlNb3ZlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL01vdmUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvT3BlcmF0ZS5qcyIsInNyYy9zY2VuZXMvTG9hZGluZ1NjZW5lLmpzIiwic3JjL3NjZW5lcy9QbGF5U2NlbmUuanMiLCJzcmMvdWkvTWVzc2FnZVdpbmRvdy5qcyIsInNyYy91aS9QbGF5ZXJXaW5kb3cuanMiLCJzcmMvdWkvU2Nyb2xsYWJsZVdpbmRvdy5qcyIsInNyYy91aS9Ub3VjaENvbnRyb2xQYW5lbC5qcyIsInNyYy91aS9XaW5kb3cuanMiLCJzcmMvdWkvV3JhcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BKQSxJQUFBLGVBQUEsUUFBQSxtQkFBQSxDQUFBOzs7O0FBQ0EsSUFBQSxnQkFBQSxRQUFBLHVCQUFBLENBQUE7Ozs7Ozs7O0FBRUE7QUFDQSxJQUFJLE1BQU0sSUFBSSxjQUFKLE9BQUEsQ0FBZ0I7QUFDeEIsU0FEd0IsR0FBQTtBQUV4QixVQUZ3QixHQUFBO0FBR3hCLGFBSHdCLElBQUE7QUFJeEIsZUFKd0IsS0FBQTtBQUt4QixjQUx3QixDQUFBO0FBTXhCLGFB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QVQsQ0FBQSxFQUFpQixTQUFBLENBQUEsR0FBYSxTQUFiLE1BQUEsR0FBMUIsTUFBUyxDQUFUO0FBQ0Q7O0lBQ0ssVTs7Ozs7Ozs7QUFDSjs7Ozs7Ozs7OEJBUWtCLGEsRUFBZSxHLEVBQUs7QUFDcEMsb0JBQUEsR0FBQSxJQUFBLEdBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUEsYUFBQTtBQUNBLG9CQUFBLGtCQUFBLEdBQUEsbUJBQUE7QUFDRDs7Ozs7O2tCQUdZLE8iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgb2JqZWN0Q3JlYXRlUG9seWZpbGxcbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgb2JqZWN0S2V5c1BvbHlmaWxsXG52YXIgYmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGZ1bmN0aW9uQmluZFBvbHlmaWxsXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbnZhciBoYXNEZWZpbmVQcm9wZXJ0eTtcbnRyeSB7XG4gIHZhciBvID0ge307XG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCAneCcsIHsgdmFsdWU6IDAgfSk7XG4gIGhhc0RlZmluZVByb3BlcnR5ID0gby54ID09PSAwO1xufSBjYXRjaCAoZXJyKSB7IGhhc0RlZmluZVByb3BlcnR5ID0gZmFsc2UgfVxuaWYgKGhhc0RlZmluZVByb3BlcnR5KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIGlucHV0IGlzIGEgcG9zaXRpdmUgbnVtYmVyICh3aG9zZSB2YWx1ZSBpcyB6ZXJvIG9yXG4gICAgICAvLyBncmVhdGVyIGFuZCBub3QgYSBOYU4pLlxuICAgICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgYXJnICE9PSBhcmcpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZGVmYXVsdE1heExpc3RlbmVyc1wiIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gICAgfVxuICB9KTtcbn0gZWxzZSB7XG4gIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcIm5cIiBhcmd1bWVudCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gJGdldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gJGdldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbi8vIFRoZXNlIHN0YW5kYWxvbmUgZW1pdCogZnVuY3Rpb25zIGFyZSB1c2VkIHRvIG9wdGltaXplIGNhbGxpbmcgb2YgZXZlbnRcbi8vIGhhbmRsZXJzIGZvciBmYXN0IGNhc2VzIGJlY2F1c2UgZW1pdCgpIGl0c2VsZiBvZnRlbiBoYXMgYSB2YXJpYWJsZSBudW1iZXIgb2Zcbi8vIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGJlY2F1c2Ugb2YgdGhhdC4gVGhlc2UgZnVuY3Rpb25zIGFsd2F5cyBoYXZlXG4vLyB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCB0aHVzIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQsIHNvIHRoZSBjb2RlXG4vLyBpbnNpZGUgdGhlbSBjYW4gZXhlY3V0ZSBmYXN0ZXIuXG5mdW5jdGlvbiBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJncykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgZXZlbnRzO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PSBudWxsKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpXG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoIWhhbmRsZXIpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBpc0ZuID0gdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbic7XG4gIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgY2FzZSAxOlxuICAgICAgZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgdGhpcyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDpcbiAgICAgIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTtcbiAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgZGVmYXVsdDpcbiAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmICghZXZlbnRzKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lcikge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgICAgcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDogW2V4aXN0aW5nLCBsaXN0ZW5lcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICAgIGlmIChwcmVwZW5kKSB7XG4gICAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXhpc3RpbmcucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBpZiAoIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgbSA9ICRnZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICAgIGlmIChtICYmIG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnIFwiJyArIFN0cmluZyh0eXBlKSArICdcIiBsaXN0ZW5lcnMgJyArXG4gICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0LicpO1xuICAgICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgICB3LnR5cGUgPSB0eXBlO1xuICAgICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignJXM6ICVzJywgdy5uYW1lLCB3Lm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0pO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzJdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpXG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9vbmNlV3JhcCh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzdGF0ZSA9IHsgZmlyZWQ6IGZhbHNlLCB3cmFwRm46IHVuZGVmaW5lZCwgdGFyZ2V0OiB0YXJnZXQsIHR5cGU6IHR5cGUsIGxpc3RlbmVyOiBsaXN0ZW5lciB9O1xuICB2YXIgd3JhcHBlZCA9IGJpbmQuY2FsbChvbmNlV3JhcHBlciwgc3RhdGUpO1xuICB3cmFwcGVkLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHN0YXRlLndyYXBGbiA9IHdyYXBwZWQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB0aGlzLm9uKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZE9uY2VMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmICghbGlzdClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fCBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgc3BsaWNlT25lKGxpc3QsIHBvc2l0aW9uKTtcblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHMsIGk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKCFldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50c1t0eXBlXSkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGtleXMgPSBvYmplY3RLZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKCFldmVudHMpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoIWV2bGlzdGVuZXIpXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXR1cm4gdW53cmFwID8gW2V2bGlzdGVuZXIubGlzdGVuZXIgfHwgZXZsaXN0ZW5lcl0gOiBbZXZsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHVud3JhcCA/IHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICByZXR1cm4gdGhpcy5fZXZlbnRzQ291bnQgPiAwID8gUmVmbGVjdC5vd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbi8vIEFib3V0IDEuNXggZmFzdGVyIHRoYW4gdGhlIHR3by1hcmcgdmVyc2lvbiBvZiBBcnJheSNzcGxpY2UoKS5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKHZhciBpID0gaW5kZXgsIGsgPSBpICsgMSwgbiA9IGxpc3QubGVuZ3RoOyBrIDwgbjsgaSArPSAxLCBrICs9IDEpXG4gICAgbGlzdFtpXSA9IGxpc3Rba107XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb2JqZWN0Q3JlYXRlUG9seWZpbGwocHJvdG8pIHtcbiAgdmFyIEYgPSBmdW5jdGlvbigpIHt9O1xuICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICByZXR1cm4gbmV3IEY7XG59XG5mdW5jdGlvbiBvYmplY3RLZXlzUG9seWZpbGwob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGsgaW4gb2JqKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaykpIHtcbiAgICBrZXlzLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIGs7XG59XG5mdW5jdGlvbiBmdW5jdGlvbkJpbmRQb2x5ZmlsbChjb250ZXh0KSB7XG4gIHZhciBmbiA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG4iLCJcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoJy4vbGliL2tleWJvYXJkJyk7XG52YXIgTG9jYWxlICAgPSByZXF1aXJlKCcuL2xpYi9sb2NhbGUnKTtcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4vbGliL2tleS1jb21ibycpO1xuXG52YXIga2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoKTtcblxua2V5Ym9hcmQuc2V0TG9jYWxlKCd1cycsIHJlcXVpcmUoJy4vbG9jYWxlcy91cycpKTtcblxuZXhwb3J0cyAgICAgICAgICA9IG1vZHVsZS5leHBvcnRzID0ga2V5Ym9hcmQ7XG5leHBvcnRzLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5leHBvcnRzLkxvY2FsZSAgID0gTG9jYWxlO1xuZXhwb3J0cy5LZXlDb21ibyA9IEtleUNvbWJvO1xuIiwiXG5mdW5jdGlvbiBLZXlDb21ibyhrZXlDb21ib1N0cikge1xuICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICB0aGlzLnN1YkNvbWJvcyA9IEtleUNvbWJvLnBhcnNlQ29tYm9TdHIoa2V5Q29tYm9TdHIpO1xuICB0aGlzLmtleU5hbWVzICA9IHRoaXMuc3ViQ29tYm9zLnJlZHVjZShmdW5jdGlvbihtZW1vLCBuZXh0U3ViQ29tYm8pIHtcbiAgICByZXR1cm4gbWVtby5jb25jYXQobmV4dFN1YkNvbWJvKTtcbiAgfSwgW10pO1xufVxuXG4vLyBUT0RPOiBBZGQgc3VwcG9ydCBmb3Iga2V5IGNvbWJvIHNlcXVlbmNlc1xuS2V5Q29tYm8uc2VxdWVuY2VEZWxpbWluYXRvciA9ICc+Pic7XG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yICAgID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICAgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIHZhciBzdWJDb21ib1N0cnMgPSBLZXlDb21iby5fc3BsaXRTdHIoa2V5Q29tYm9TdHIsIEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IpO1xuICB2YXIgY29tYm8gICAgICAgID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDAgOyBpIDwgc3ViQ29tYm9TdHJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgY29tYm8ucHVzaChLZXlDb21iby5fc3BsaXRTdHIoc3ViQ29tYm9TdHJzW2ldLCBLZXlDb21iby5rZXlEZWxpbWluYXRvcikpO1xuICB9XG4gIHJldHVybiBjb21ibztcbn07XG5cbktleUNvbWJvLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKHByZXNzZWRLZXlOYW1lcykge1xuICB2YXIgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgdGhpcy5zdWJDb21ib3NbaV0sXG4gICAgICBzdGFydGluZ0tleU5hbWVJbmRleCxcbiAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICk7XG4gICAgaWYgKHN0YXJ0aW5nS2V5TmFtZUluZGV4ID09PSAtMSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbktleUNvbWJvLnByb3RvdHlwZS5pc0VxdWFsID0gZnVuY3Rpb24ob3RoZXJLZXlDb21ibykge1xuICBpZiAoXG4gICAgIW90aGVyS2V5Q29tYm8gfHxcbiAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ29iamVjdCdcbiAgKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICBvdGhlcktleUNvbWJvID0gbmV3IEtleUNvbWJvKG90aGVyS2V5Q29tYm8pO1xuICB9XG5cbiAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAodGhpcy5zdWJDb21ib3NbaV0ubGVuZ3RoICE9PSBvdGhlcktleUNvbWJvLnN1YkNvbWJvc1tpXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIHN1YkNvbWJvICAgICAgPSB0aGlzLnN1YkNvbWJvc1tpXTtcbiAgICB2YXIgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdWJDb21iby5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgdmFyIGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgIHZhciBpbmRleCAgID0gb3RoZXJTdWJDb21iby5pbmRleE9mKGtleU5hbWUpO1xuXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBvdGhlclN1YkNvbWJvLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvdGhlclN1YkNvbWJvLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuS2V5Q29tYm8uX3NwbGl0U3RyID0gZnVuY3Rpb24oc3RyLCBkZWxpbWluYXRvcikge1xuICB2YXIgcyAgPSBzdHI7XG4gIHZhciBkICA9IGRlbGltaW5hdG9yO1xuICB2YXIgYyAgPSAnJztcbiAgdmFyIGNhID0gW107XG5cbiAgZm9yICh2YXIgY2kgPSAwOyBjaSA8IHMubGVuZ3RoOyBjaSArPSAxKSB7XG4gICAgaWYgKGNpID4gMCAmJiBzW2NpXSA9PT0gZCAmJiBzW2NpIC0gMV0gIT09ICdcXFxcJykge1xuICAgICAgY2EucHVzaChjLnRyaW0oKSk7XG4gICAgICBjID0gJyc7XG4gICAgICBjaSArPSAxO1xuICAgIH1cbiAgICBjICs9IHNbY2ldO1xuICB9XG4gIGlmIChjKSB7IGNhLnB1c2goYy50cmltKCkpOyB9XG5cbiAgcmV0dXJuIGNhO1xufTtcblxuS2V5Q29tYm8ucHJvdG90eXBlLl9jaGVja1N1YkNvbWJvID0gZnVuY3Rpb24oc3ViQ29tYm8sIHN0YXJ0aW5nS2V5TmFtZUluZGV4LCBwcmVzc2VkS2V5TmFtZXMpIHtcbiAgc3ViQ29tYm8gPSBzdWJDb21iby5zbGljZSgwKTtcbiAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICB2YXIgZW5kSW5kZXggPSBzdGFydGluZ0tleU5hbWVJbmRleDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJDb21iby5sZW5ndGg7IGkgKz0gMSkge1xuXG4gICAgdmFyIGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICBpZiAoa2V5TmFtZVswXSA9PT0gJ1xcXFwnKSB7XG4gICAgICB2YXIgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgaWYgKFxuICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvciB8fFxuICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICkge1xuICAgICAgICBrZXlOYW1lID0gZXNjYXBlZEtleU5hbWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHN1YkNvbWJvLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICAgIGlmIChpbmRleCA+IGVuZEluZGV4KSB7XG4gICAgICAgIGVuZEluZGV4ID0gaW5kZXg7XG4gICAgICB9XG4gICAgICBpZiAoc3ViQ29tYm8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBlbmRJbmRleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleUNvbWJvO1xuIiwiXG52YXIgTG9jYWxlID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4va2V5LWNvbWJvJyk7XG5cblxuZnVuY3Rpb24gS2V5Ym9hcmQodGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KSB7XG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fY3VycmVudENvbnRleHQgICAgICAgPSBudWxsO1xuICB0aGlzLl9jb250ZXh0cyAgICAgICAgICAgICA9IHt9O1xuICB0aGlzLl9saXN0ZW5lcnMgICAgICAgICAgICA9IFtdO1xuICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xuICB0aGlzLl9sb2NhbGVzICAgICAgICAgICAgICA9IHt9O1xuICB0aGlzLl90YXJnZXRFbGVtZW50ICAgICAgICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0UGxhdGZvcm0gICAgICAgPSAnJztcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ICAgICAgPSAnJztcbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcbiAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSBudWxsO1xuICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcbiAgdGhpcy5fcGF1c2VkICAgICAgICAgICAgICAgPSBmYWxzZTtcbiAgdGhpcy5fY2FsbGVySGFuZGxlciAgICAgICAgPSBudWxsO1xuXG4gIHRoaXMuc2V0Q29udGV4dCgnZ2xvYmFsJyk7XG4gIHRoaXMud2F0Y2godGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KTtcbn1cblxuS2V5Ym9hcmQucHJvdG90eXBlLnNldExvY2FsZSA9IGZ1bmN0aW9uKGxvY2FsZU5hbWUsIGxvY2FsZUJ1aWxkZXIpIHtcbiAgdmFyIGxvY2FsZSA9IG51bGw7XG4gIGlmICh0eXBlb2YgbG9jYWxlTmFtZSA9PT0gJ3N0cmluZycpIHtcblxuICAgIGlmIChsb2NhbGVCdWlsZGVyKSB7XG4gICAgICBsb2NhbGUgPSBuZXcgTG9jYWxlKGxvY2FsZU5hbWUpO1xuICAgICAgbG9jYWxlQnVpbGRlcihsb2NhbGUsIHRoaXMuX3RhcmdldFBsYXRmb3JtLCB0aGlzLl90YXJnZXRVc2VyQWdlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2NhbGUgPSB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdIHx8IG51bGw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxvY2FsZSAgICAgPSBsb2NhbGVOYW1lO1xuICAgIGxvY2FsZU5hbWUgPSBsb2NhbGUuX2xvY2FsZU5hbWU7XG4gIH1cblxuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgID0gbG9jYWxlO1xuICB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdID0gbG9jYWxlO1xuICBpZiAobG9jYWxlKSB7XG4gICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzID0gbG9jYWxlLnByZXNzZWRLZXlzO1xuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxOYW1lKSB7XG4gIGxvY2FsTmFtZSB8fCAobG9jYWxOYW1lID0gdGhpcy5fbG9jYWxlLmxvY2FsZU5hbWUpO1xuICByZXR1cm4gdGhpcy5fbG9jYWxlc1tsb2NhbE5hbWVdIHx8IG51bGw7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0ID0gcmVsZWFzZUhhbmRsZXI7XG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA9IHByZXNzSGFuZGxlcjtcbiAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgID0ga2V5Q29tYm9TdHI7XG4gICAga2V5Q29tYm9TdHIgICAgICAgICAgICA9IG51bGw7XG4gIH1cblxuICBpZiAoXG4gICAga2V5Q29tYm9TdHIgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fbGlzdGVuZXJzLnB1c2goe1xuICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBrZXlDb21ib1N0ciA/IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0cikgOiBudWxsLFxuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBwcmVzc0hhbmRsZXIgICAgICAgICAgIHx8IG51bGwsXG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IHJlbGVhc2VIYW5kbGVyICAgICAgICAgfHwgbnVsbCxcbiAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZSxcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZVxuICB9KTtcbn07XG5LZXlib2FyZC5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUuYmluZDtcbktleWJvYXJkLnByb3RvdHlwZS5vbiAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xuXG5LZXlib2FyZC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJlbGVhc2VIYW5kbGVyID0gcHJlc3NIYW5kbGVyO1xuICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XG4gICAga2V5Q29tYm9TdHIgPSBudWxsO1xuICB9XG5cbiAgaWYgKFxuICAgIGtleUNvbWJvU3RyICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbaV07XG5cbiAgICB2YXIgY29tYm9NYXRjaGVzICAgICAgICAgID0gIWtleUNvbWJvU3RyICYmICFsaXN0ZW5lci5rZXlDb21ibyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5rZXlDb21ibyAmJiBsaXN0ZW5lci5rZXlDb21iby5pc0VxdWFsKGtleUNvbWJvU3RyKTtcbiAgICB2YXIgcHJlc3NIYW5kbGVyTWF0Y2hlcyAgID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJlc3NIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXNzSGFuZGxlciA9PT0gbGlzdGVuZXIucHJlc3NIYW5kbGVyO1xuICAgIHZhciByZWxlYXNlSGFuZGxlck1hdGNoZXMgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcmVsZWFzZUhhbmRsZXIgJiYgIWxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyID09PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcblxuICAgIGlmIChjb21ib01hdGNoZXMgJiYgcHJlc3NIYW5kbGVyTWF0Y2hlcyAmJiByZWxlYXNlSGFuZGxlck1hdGNoZXMpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuS2V5Ym9hcmQucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcbktleWJvYXJkLnByb3RvdHlwZS5vZmYgICAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS51bmJpbmQ7XG5cbktleWJvYXJkLnByb3RvdHlwZS5zZXRDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUpIHtcbiAgaWYodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuXG4gIGlmICghdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdKSB7XG4gICAgdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdID0gW107XG4gIH1cbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgPSB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV07XG4gIHRoaXMuX2N1cnJlbnRDb250ZXh0ID0gY29udGV4dE5hbWU7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fY3VycmVudENvbnRleHQ7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUud2l0aENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSwgY2FsbGJhY2spIHtcbiAgdmFyIHByZXZpb3VzQ29udGV4dE5hbWUgPSB0aGlzLmdldENvbnRleHQoKTtcbiAgdGhpcy5zZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICBjYWxsYmFjaygpO1xuXG4gIHRoaXMuc2V0Q29udGV4dChwcmV2aW91c0NvbnRleHROYW1lKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHRoaXMuc3RvcCgpO1xuXG4gIGlmICghdGFyZ2V0V2luZG93KSB7XG4gICAgaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiAhZ2xvYmFsLmF0dGFjaEV2ZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGdsb2JhbCBmdW5jdGlvbnMgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcbiAgICB9XG4gICAgdGFyZ2V0V2luZG93ID0gZ2xvYmFsO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0YXJnZXRXaW5kb3cubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0UGxhdGZvcm07XG4gICAgdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0RWxlbWVudDtcbiAgICB0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3c7XG4gICAgdGFyZ2V0V2luZG93ICAgID0gZ2xvYmFsO1xuICB9XG5cbiAgaWYgKCF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAmJiAhdGFyZ2V0V2luZG93LmF0dGFjaEV2ZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50IG1ldGhvZHMgb24gdGFyZ2V0V2luZG93LicpO1xuICB9XG5cbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyID0gISF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcblxuICB2YXIgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgdmFyIHBsYXRmb3JtICA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSAgfHwgJyc7XG5cbiAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcbiAgdGFyZ2V0UGxhdGZvcm0gICYmIHRhcmdldFBsYXRmb3JtICAhPT0gbnVsbCB8fCAodGFyZ2V0UGxhdGZvcm0gID0gcGxhdGZvcm0pO1xuICB0YXJnZXRVc2VyQWdlbnQgJiYgdGFyZ2V0VXNlckFnZW50ICE9PSBudWxsIHx8ICh0YXJnZXRVc2VyQWdlbnQgPSB1c2VyQWdlbnQpO1xuXG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5wcmVzc0tleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gICAgX3RoaXMuX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKTtcbiAgfTtcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgfTtcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudClcbiAgfTtcblxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0RWxlbWVudDtcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0VXNlckFnZW50O1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBpZiAoIXRoaXMuX3RhcmdldEVsZW1lbnQgfHwgIXRoaXMuX3RhcmdldFdpbmRvdykgeyByZXR1cm47IH1cblxuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICB0aGlzLl90YXJnZXRXaW5kb3cgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCA9IG51bGw7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucHJlc3NLZXkoa2V5Q29kZSk7XG4gIHRoaXMuX2FwcGx5QmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucmVsZWFzZUtleShrZXlDb2RlKTtcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVsZWFzZUFsbEtleXMgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cbiAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yZWxlYXNlQWxsS2V5cygpO1xuICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fYmluZEV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgIHRhcmdldEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgdGFyZ2V0RWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fdW5iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgdGFyZ2V0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICB0YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9nZXRHcm91cGVkTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsaXN0ZW5lckdyb3VwcyAgID0gW107XG4gIHZhciBsaXN0ZW5lckdyb3VwTWFwID0gW107XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ICE9PSAnZ2xvYmFsJykge1xuICAgIGxpc3RlbmVycyA9IFtdLmNvbmNhdChsaXN0ZW5lcnMsIHRoaXMuX2NvbnRleHRzLmdsb2JhbCk7XG4gIH1cblxuICBsaXN0ZW5lcnMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIChiLmtleUNvbWJvID8gYi5rZXlDb21iby5rZXlOYW1lcy5sZW5ndGggOiAwKSAtIChhLmtleUNvbWJvID8gYS5rZXlDb21iby5rZXlOYW1lcy5sZW5ndGggOiAwKTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbihsKSB7XG4gICAgdmFyIG1hcEluZGV4ID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXSA9PT0gbnVsbCAmJiBsLmtleUNvbWJvID09PSBudWxsIHx8XG4gICAgICAgICAgbGlzdGVuZXJHcm91cE1hcFtpXSAhPT0gbnVsbCAmJiBsaXN0ZW5lckdyb3VwTWFwW2ldLmlzRXF1YWwobC5rZXlDb21ibykpIHtcbiAgICAgICAgbWFwSW5kZXggPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobWFwSW5kZXggPT09IC0xKSB7XG4gICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xuICAgICAgbGlzdGVuZXJHcm91cE1hcC5wdXNoKGwua2V5Q29tYm8pO1xuICAgIH1cbiAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xuICAgICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdID0gW107XG4gICAgfVxuICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xuICB9KTtcbiAgcmV0dXJuIGxpc3RlbmVyR3JvdXBzO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9hcHBseUJpbmRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgdmFyIHByZXZlbnRSZXBlYXQgPSBmYWxzZTtcblxuICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gIGV2ZW50LnByZXZlbnRSZXBlYXQgPSBmdW5jdGlvbigpIHsgcHJldmVudFJlcGVhdCA9IHRydWU7IH07XG4gIGV2ZW50LnByZXNzZWRLZXlzICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgdmFyIHByZXNzZWRLZXlzICAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuICB2YXIgbGlzdGVuZXJHcm91cHMgPSB0aGlzLl9nZXRHcm91cGVkTGlzdGVuZXJzKCk7XG5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGxpc3RlbmVycyA9IGxpc3RlbmVyR3JvdXBzW2ldO1xuICAgIHZhciBrZXlDb21ibyAgPSBsaXN0ZW5lcnNbMF0ua2V5Q29tYm87XG5cbiAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwga2V5Q29tYm8uY2hlY2socHJlc3NlZEtleXMpKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxpc3RlbmVycy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbal07XG5cbiAgICAgICAgaWYgKGtleUNvbWJvID09PSBudWxsKSB7XG4gICAgICAgICAgbGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBrZXlDb21ibyAgICAgICAgICAgICAgIDogbmV3IEtleUNvbWJvKHByZXNzZWRLZXlzLmpvaW4oJysnKSksXG4gICAgICAgICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogbGlzdGVuZXIucHJlc3NIYW5kbGVyLFxuICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLFxuICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA6IGxpc3RlbmVyLnByZXZlbnRSZXBlYXQsXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXIucHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgbGlzdGVuZXIucHJlc3NIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgIGlmIChwcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gcHJldmVudFJlcGVhdDtcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgJiYgdGhpcy5fYXBwbGllZExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChrZXlDb21ibykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleXMuaW5kZXhPZihrZXlDb21iby5rZXlOYW1lc1tqXSk7XG4gICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgcHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIGogLT0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fY2xlYXJCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50IHx8IChldmVudCA9IHt9KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzW2ldO1xuICAgIHZhciBrZXlDb21ibyA9IGxpc3RlbmVyLmtleUNvbWJvO1xuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCAha2V5Q29tYm8uY2hlY2sodGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzKSkge1xuICAgICAgaWYgKHRoaXMuX2NhbGxlckhhbmRsZXIgIT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyKSB7XG4gICAgICAgIHZhciBvbGRDYWxsZXIgPSB0aGlzLl9jYWxsZXJIYW5kbGVyO1xuICAgICAgICB0aGlzLl9jYWxsZXJIYW5kbGVyID0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XG4gICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0O1xuICAgICAgICBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgdGhpcy5fY2FsbGVySGFuZGxlciA9IG9sZENhbGxlcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9oYW5kbGVDb21tYW5kQnVnID0gZnVuY3Rpb24oZXZlbnQsIHBsYXRmb3JtKSB7XG4gIC8vIE9uIE1hYyB3aGVuIHRoZSBjb21tYW5kIGtleSBpcyBrZXB0IHByZXNzZWQsIGtleXVwIGlzIG5vdCB0cmlnZ2VyZWQgZm9yIGFueSBvdGhlciBrZXkuXG4gIC8vIEluIHRoaXMgY2FzZSBmb3JjZSBhIGtleXVwIGZvciBub24tbW9kaWZpZXIga2V5cyBkaXJlY3RseSBhZnRlciB0aGUga2V5cHJlc3MuXG4gIHZhciBtb2RpZmllcktleXMgPSBbXCJzaGlmdFwiLCBcImN0cmxcIiwgXCJhbHRcIiwgXCJjYXBzbG9ja1wiLCBcInRhYlwiLCBcImNvbW1hbmRcIl07XG4gIGlmIChwbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSAmJiB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuaW5jbHVkZXMoXCJjb21tYW5kXCIpICYmXG4gICAgICAhbW9kaWZpZXJLZXlzLmluY2x1ZGVzKHRoaXMuX2xvY2FsZS5nZXRLZXlOYW1lcyhldmVudC5rZXlDb2RlKVswXSkpIHtcbiAgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcoZXZlbnQpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xuIiwiXG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xuXG5cbmZ1bmN0aW9uIExvY2FsZShuYW1lKSB7XG4gIHRoaXMubG9jYWxlTmFtZSAgICAgPSBuYW1lO1xuICB0aGlzLnByZXNzZWRLZXlzICAgID0gW107XG4gIHRoaXMuX2FwcGxpZWRNYWNyb3MgPSBbXTtcbiAgdGhpcy5fa2V5TWFwICAgICAgICA9IHt9O1xuICB0aGlzLl9raWxsS2V5Q29kZXMgID0gW107XG4gIHRoaXMuX21hY3JvcyAgICAgICAgPSBbXTtcbn1cblxuTG9jYWxlLnByb3RvdHlwZS5iaW5kS2V5Q29kZSA9IGZ1bmN0aW9uKGtleUNvZGUsIGtleU5hbWVzKSB7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAga2V5TmFtZXMgPSBba2V5TmFtZXNdO1xuICB9XG5cbiAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmJpbmRNYWNybyA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnc3RyaW5nJykge1xuICAgIGtleU5hbWVzID0gWyBrZXlOYW1lcyBdO1xuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBudWxsO1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgIGtleU5hbWVzID0gbnVsbDtcbiAgfVxuXG4gIHZhciBtYWNybyA9IHtcbiAgICBrZXlDb21ibyA6IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0ciksXG4gICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICBoYW5kbGVyICA6IGhhbmRsZXJcbiAgfTtcblxuICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmdldEtleUNvZGVzID0gZnVuY3Rpb24oa2V5TmFtZSkge1xuICB2YXIga2V5Q29kZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5Q29kZSBpbiB0aGlzLl9rZXlNYXApIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICBpZiAoaW5kZXggPiAtMSkgeyBrZXlDb2Rlcy5wdXNoKGtleUNvZGV8MCk7IH1cbiAgfVxuICByZXR1cm4ga2V5Q29kZXM7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmdldEtleU5hbWVzID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICByZXR1cm4gdGhpcy5fa2V5TWFwW2tleUNvZGVdIHx8IFtdO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5zZXRLaWxsS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9raWxsS2V5Q29kZXMucHVzaChrZXlDb2RlKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIga2V5TmFtZXMgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSkgPT09IC0xKSB7XG4gICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2goa2V5TmFtZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuX2FwcGx5TWFjcm9zKCk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMucmVsZWFzZUtleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgZWxzZSB7XG4gICAgdmFyIGtleU5hbWVzICAgICAgICAgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICAgIHZhciBraWxsS2V5Q29kZUluZGV4ID0gdGhpcy5fa2lsbEtleUNvZGVzLmluZGV4T2Yoa2V5Q29kZSk7XG4gICAgXG4gICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY2xlYXJNYWNyb3MoKTtcbiAgfVxufTtcblxuTG9jYWxlLnByb3RvdHlwZS5fYXBwbHlNYWNyb3MgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1hY3JvcyA9IHRoaXMuX21hY3Jvcy5zbGljZSgwKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYWNyb3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbWFjcm8gPSBtYWNyb3NbaV07XG4gICAgaWYgKG1hY3JvLmtleUNvbWJvLmNoZWNrKHRoaXMucHJlc3NlZEtleXMpKSB7XG4gICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xuICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG1hY3JvLmhhbmRsZXIodGhpcy5wcmVzc2VkS2V5cyk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pID09PSAtMSkge1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMucHVzaChtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3MucHVzaChtYWNybyk7XG4gICAgfVxuICB9XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLl9jbGVhck1hY3JvcyA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRNYWNyb3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbWFjcm8gPSB0aGlzLl9hcHBsaWVkTWFjcm9zW2ldO1xuICAgIGlmICghbWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgIG1hY3JvLmtleU5hbWVzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3Muc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsZTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsb2NhbGUsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcblxuICAvLyBnZW5lcmFsXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzLCAgIFsnY2FuY2VsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOCwgICBbJ2JhY2tzcGFjZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDksICAgWyd0YWInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMiwgIFsnY2xlYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMywgIFsnZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNiwgIFsnc2hpZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNywgIFsnY3RybCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4LCAgWydhbHQnLCAnbWVudSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5LCAgWydwYXVzZScsICdicmVhayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIwLCAgWydjYXBzbG9jayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDI3LCAgWydlc2NhcGUnLCAnZXNjJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzIsICBbJ3NwYWNlJywgJ3NwYWNlYmFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzMsICBbJ3BhZ2V1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM0LCAgWydwYWdlZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM1LCAgWydlbmQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNiwgIFsnaG9tZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM3LCAgWydsZWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzgsICBbJ3VwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzksICBbJ3JpZ2h0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDAsICBbJ2Rvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MSwgIFsnc2VsZWN0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDIsICBbJ3ByaW50c2NyZWVuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDMsICBbJ2V4ZWN1dGUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NCwgIFsnc25hcHNob3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NSwgIFsnaW5zZXJ0JywgJ2lucyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ2LCAgWydkZWxldGUnLCAnZGVsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDcsICBbJ2hlbHAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDUsIFsnc2Nyb2xsbG9jaycsICdzY3JvbGwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODcsIFsnZXF1YWwnLCAnZXF1YWxzaWduJywgJz0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODgsIFsnY29tbWEnLCAnLCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MCwgWydwZXJpb2QnLCAnLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MSwgWydzbGFzaCcsICdmb3J3YXJkc2xhc2gnLCAnLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MiwgWydncmF2ZWFjY2VudCcsICdgJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjE5LCBbJ29wZW5icmFja2V0JywgJ1snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjAsIFsnYmFja3NsYXNoJywgJ1xcXFwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjEsIFsnY2xvc2VicmFja2V0JywgJ10nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjIsIFsnYXBvc3Ryb3BoZScsICdcXCcnXSk7XG5cbiAgLy8gMC05XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OCwgWyd6ZXJvJywgJzAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OSwgWydvbmUnLCAnMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUwLCBbJ3R3bycsICcyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTEsIFsndGhyZWUnLCAnMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUyLCBbJ2ZvdXInLCAnNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUzLCBbJ2ZpdmUnLCAnNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU0LCBbJ3NpeCcsICc2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTUsIFsnc2V2ZW4nLCAnNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU2LCBbJ2VpZ2h0JywgJzgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NywgWyduaW5lJywgJzknXSk7XG5cbiAgLy8gbnVtcGFkXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NiwgWydudW16ZXJvJywgJ251bTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NywgWydudW1vbmUnLCAnbnVtMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk4LCBbJ251bXR3bycsICdudW0yJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTksIFsnbnVtdGhyZWUnLCAnbnVtMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMCwgWydudW1mb3VyJywgJ251bTQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDEsIFsnbnVtZml2ZScsICdudW01J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAyLCBbJ251bXNpeCcsICdudW02J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAzLCBbJ251bXNldmVuJywgJ251bTcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDQsIFsnbnVtZWlnaHQnLCAnbnVtOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNSwgWydudW1uaW5lJywgJ251bTknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDYsIFsnbnVtbXVsdGlwbHknLCAnbnVtKiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNywgWydudW1hZGQnLCAnbnVtKyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOCwgWydudW1lbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOSwgWydudW1zdWJ0cmFjdCcsICdudW0tJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEwLCBbJ251bWRlY2ltYWwnLCAnbnVtLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMSwgWydudW1kaXZpZGUnLCAnbnVtLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NCwgWydudW1sb2NrJywgJ251bSddKTtcblxuICAvLyBmdW5jdGlvbiBrZXlzXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTIsIFsnZjEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTMsIFsnZjInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTQsIFsnZjMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTUsIFsnZjQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTYsIFsnZjUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTcsIFsnZjYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTgsIFsnZjcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTksIFsnZjgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjAsIFsnZjknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjEsIFsnZjEwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIyLCBbJ2YxMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMywgWydmMTInXSk7XG5cbiAgLy8gc2Vjb25kYXJ5IGtleSBzeW1ib2xzXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgYCcsIFsndGlsZGUnLCAnfiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAxJywgWydleGNsYW1hdGlvbicsICdleGNsYW1hdGlvbnBvaW50JywgJyEnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMicsIFsnYXQnLCAnQCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAzJywgWydudW1iZXInLCAnIyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA0JywgWydkb2xsYXInLCAnZG9sbGFycycsICdkb2xsYXJzaWduJywgJyQnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNScsIFsncGVyY2VudCcsICclJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDYnLCBbJ2NhcmV0JywgJ14nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNycsIFsnYW1wZXJzYW5kJywgJ2FuZCcsICcmJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDgnLCBbJ2FzdGVyaXNrJywgJyonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOScsIFsnb3BlbnBhcmVuJywgJygnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMCcsIFsnY2xvc2VwYXJlbicsICcpJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC0nLCBbJ3VuZGVyc2NvcmUnLCAnXyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA9JywgWydwbHVzJywgJysnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgWycsIFsnb3BlbmN1cmx5YnJhY2UnLCAnb3BlbmN1cmx5YnJhY2tldCcsICd7J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIF0nLCBbJ2Nsb3NlY3VybHlicmFjZScsICdjbG9zZWN1cmx5YnJhY2tldCcsICd9J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcXFwnLCBbJ3ZlcnRpY2FsYmFyJywgJ3wnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOycsIFsnY29sb24nLCAnOiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXCcnLCBbJ3F1b3RhdGlvbm1hcmsnLCAnXFwnJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICEsJywgWydvcGVuYW5nbGVicmFja2V0JywgJzwnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLicsIFsnY2xvc2VhbmdsZWJyYWNrZXQnLCAnPiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAvJywgWydxdWVzdGlvbm1hcmsnLCAnPyddKTtcbiAgXG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykpIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjb21tYW5kJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxlLmJpbmRNYWNybygnY3RybCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xuICB9XG5cbiAgLy9hLXogYW5kIEEtWlxuICBmb3IgKHZhciBrZXlDb2RlID0gNjU7IGtleUNvZGUgPD0gOTA7IGtleUNvZGUgKz0gMSkge1xuICAgIHZhciBrZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlICsgMzIpO1xuICAgIHZhciBjYXBpdGFsS2V5TmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSk7XG4gIFx0bG9jYWxlLmJpbmRLZXlDb2RlKGtleUNvZGUsIGtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgXHRsb2NhbGUuYmluZE1hY3JvKCdjYXBzbG9jayArICcgKyBrZXlOYW1lLCBjYXBpdGFsS2V5TmFtZSk7XG4gIH1cblxuICAvLyBicm93c2VyIGNhdmVhdHNcbiAgdmFyIHNlbWljb2xvbktleUNvZGUgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDU5ICA6IDE4NjtcbiAgdmFyIGRhc2hLZXlDb2RlICAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDE3MyA6IDE4OTtcbiAgdmFyIGxlZnRDb21tYW5kS2V5Q29kZTtcbiAgdmFyIHJpZ2h0Q29tbWFuZEtleUNvZGU7XG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgKHVzZXJBZ2VudC5tYXRjaCgnU2FmYXJpJykgfHwgdXNlckFnZW50Lm1hdGNoKCdDaHJvbWUnKSkpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gOTE7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDkzO1xuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnT3BlcmEnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAxNztcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMTc7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMjI0O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAyMjQ7XG4gIH1cbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHNlbWljb2xvbktleUNvZGUsICAgIFsnc2VtaWNvbG9uJywgJzsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShkYXNoS2V5Q29kZSwgICAgICAgICBbJ2Rhc2gnLCAnLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGxlZnRDb21tYW5kS2V5Q29kZSwgIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdsZWZ0Y29tbWFuZCcsICdsZWZ0d2luZG93cycsICdsZWZ0d2luJywgJ2xlZnRzdXBlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHJpZ2h0Q29tbWFuZEtleUNvZGUsIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdyaWdodGNvbW1hbmQnLCAncmlnaHR3aW5kb3dzJywgJ3JpZ2h0d2luJywgJ3JpZ2h0c3VwZXInXSk7XG5cbiAgLy8ga2lsbCBrZXlzXG4gIGxvY2FsZS5zZXRLaWxsS2V5KCdjb21tYW5kJyk7XG59O1xuIiwiaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4vbGliL0FwcGxpY2F0aW9uJ1xuaW1wb3J0IExvYWRpbmdTY2VuZSBmcm9tICcuL3NjZW5lcy9Mb2FkaW5nU2NlbmUnXG5cbi8vIENyZWF0ZSBhIFBpeGkgQXBwbGljYXRpb25cbmxldCBhcHAgPSBuZXcgQXBwbGljYXRpb24oe1xuICB3aWR0aDogMjU2LFxuICBoZWlnaHQ6IDI1NixcbiAgYW50aWFsaWFzOiB0cnVlLFxuICB0cmFuc3BhcmVudDogZmFsc2UsXG4gIHJlc29sdXRpb246IDEsXG4gIGF1dG9TdGFydDogZmFsc2Vcbn0pXG5cbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuYXBwLnJlbmRlcmVyLnZpZXcuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbmFwcC5yZW5kZXJlci5hdXRvUmVzaXplID0gdHJ1ZVxuYXBwLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXG4vLyBBZGQgdGhlIGNhbnZhcyB0aGF0IFBpeGkgYXV0b21hdGljYWxseSBjcmVhdGVkIGZvciB5b3UgdG8gdGhlIEhUTUwgZG9jdW1lbnRcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpXG5cbmFwcC5jaGFuZ2VTdGFnZSgpXG5hcHAuc3RhcnQoKVxuYXBwLmNoYW5nZVNjZW5lKExvYWRpbmdTY2VuZSlcbiIsImV4cG9ydCBjb25zdCBJU19NT0JJTEUgPSAoKGEpID0+IC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm8vaS50ZXN0KGEpIHx8XG4gIC8xMjA3fDYzMTB8NjU5MHwzZ3NvfDR0aHB8NTBbMS02XWl8Nzcwc3w4MDJzfGEgd2F8YWJhY3xhYyhlcnxvb3xzLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3LShufHUpfGM1NVxcL3xjYXBpfGNjd2F8Y2RtLXxjZWxsfGNodG18Y2xkY3xjbWQtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjLXN8ZGV2aXxkaWNhfGRtb2J8ZG8oY3xwKW98ZHMoMTJ8LWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseSgtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmLTV8Zy1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkLShtfHB8dCl8aGVpLXxoaShwdHx0YSl8aHAoIGl8aXApfGhzLWN8aHQoYygtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aS0oMjB8Z298bWEpfGkyMzB8aWFjKCB8LXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHwtW2Etd10pfGxpYnd8bHlueHxtMS13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bS1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dCgtfCB8b3x2KXx6eil8bXQoNTB8cDF8diApfG13YnB8bXl3YXxuMTBbMC0yXXxuMjBbMi0zXXxuMzAoMHwyKXxuNTAoMHwyfDUpfG43KDAoMHwxKXwxMCl8bmUoKGN8bSktfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3wtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuLTJ8cG8oY2t8cnR8c2UpfHByb3h8cHNpb3xwdC1nfHFhLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8LVsyLTddfGktKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aC18b298cC0pfHNka1xcL3xzZShjKC18MHwxKXw0N3xtY3xuZHxyaSl8c2doLXxzaGFyfHNpZSgtfG0pfHNrLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aC18di18diApfHN5KDAxfG1iKXx0MigxOHw1MCl8dDYoMDB8MTB8MTgpfHRhKGd0fGxrKXx0Y2wtfHRkZy18dGVsKGl8bSl8dGltLXx0LW1vfHRvKHBsfHNoKXx0cyg3MHxtLXxtM3xtNSl8dHgtOXx1cChcXC5ifGcxfHNpKXx1dHN0fHY0MDB8djc1MHx2ZXJpfHZpKHJnfHRlKXx2ayg0MHw1WzAtM118LXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhcy18eW91cnx6ZXRvfHp0ZS0vaS50ZXN0KGEuc3Vic3RyKDAsIDQpKVxuKShuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgd2luZG93Lm9wZXJhKVxuXG5leHBvcnQgY29uc3QgQ0VJTF9TSVpFID0gMTZcblxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfTU9WRSA9IFN5bWJvbCgnbW92ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9DQU1FUkEgPSBTeW1ib2woJ2NhbWVyYScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9PUEVSQVRFID0gU3ltYm9sKCdvcGVyYXRlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0tFWV9NT1ZFID0gU3ltYm9sKCdrZXktbW92ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9MSUZFID0gU3ltYm9sKCdsaWZlJylcbmV4cG9ydCBjb25zdCBBQklMSVRJRVNfQUxMID0gW1xuICBBQklMSVRZX01PVkUsXG4gIEFCSUxJVFlfQ0FNRVJBLFxuICBBQklMSVRZX09QRVJBVEUsXG4gIEFCSUxJVFlfS0VZX01PVkUsXG4gIEFCSUxJVFlfTElGRVxuXVxuXG4vLyBvYmplY3QgdHlwZSwgc3RhdGljIG9iamVjdCwgbm90IGNvbGxpZGUgd2l0aFxuZXhwb3J0IGNvbnN0IFNUQVRJQyA9ICdzdGF0aWMnXG4vLyBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFZID0gJ3N0YXknXG4vLyB0b3VjaCB3aWxsIHJlcGx5XG5leHBvcnQgY29uc3QgUkVQTFkgPSAncmVwbHknXG4iLCJleHBvcnQgY29uc3QgTEVGVCA9ICdhJ1xuZXhwb3J0IGNvbnN0IFVQID0gJ3cnXG5leHBvcnQgY29uc3QgUklHSFQgPSAnZCdcbmV4cG9ydCBjb25zdCBET1dOID0gJ3MnXG4iLCJpbXBvcnQgeyBBcHBsaWNhdGlvbiBhcyBQaXhpQXBwbGljYXRpb24sIEdyYXBoaWNzLCBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xuXG5jbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIFBpeGlBcHBsaWNhdGlvbiB7XG4gIGNoYW5nZVN0YWdlICgpIHtcbiAgICB0aGlzLnN0YWdlID0gbmV3IGRpc3BsYXkuU3RhZ2UoKVxuICB9XG5cbiAgY2hhbmdlU2NlbmUgKFNjZW5lTmFtZSwgcGFyYW1zKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFNjZW5lKSB7XG4gICAgICAvLyBtYXliZSB1c2UgcHJvbWlzZSBmb3IgYW5pbWF0aW9uXG4gICAgICAvLyByZW1vdmUgZ2FtZWxvb3A/XG4gICAgICB0aGlzLmN1cnJlbnRTY2VuZS5kZXN0cm95KClcbiAgICAgIHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQodGhpcy5jdXJyZW50U2NlbmUpXG4gICAgfVxuXG4gICAgbGV0IHNjZW5lID0gbmV3IFNjZW5lTmFtZShwYXJhbXMpXG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChzY2VuZSlcbiAgICBzY2VuZS5jcmVhdGUoKVxuICAgIHNjZW5lLm9uKCdjaGFuZ2VTY2VuZScsIHRoaXMuY2hhbmdlU2NlbmUuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuY3VycmVudFNjZW5lID0gc2NlbmVcbiAgfVxuXG4gIHN0YXJ0ICguLi5hcmdzKSB7XG4gICAgc3VwZXIuc3RhcnQoLi4uYXJncylcblxuICAgIC8vIGNyZWF0ZSBhIGJhY2tncm91bmQgbWFrZSBzdGFnZSBoYXMgd2lkdGggJiBoZWlnaHRcbiAgICBsZXQgdmlldyA9IHRoaXMucmVuZGVyZXIudmlld1xuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoXG4gICAgICBuZXcgR3JhcGhpY3MoKS5kcmF3UmVjdCgwLCAwLCB2aWV3LndpZHRoLCB2aWV3LmhlaWdodClcbiAgICApXG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgdGhpcy50aWNrZXIuYWRkKGRlbHRhID0+IHRoaXMuZ2FtZUxvb3AuYmluZCh0aGlzKShkZWx0YSkpXG4gIH1cblxuICBnYW1lTG9vcCAoZGVsdGEpIHtcbiAgICAvLyBVcGRhdGUgdGhlIGN1cnJlbnQgZ2FtZSBzdGF0ZTpcbiAgICB0aGlzLmN1cnJlbnRTY2VuZS50aWNrKGRlbHRhKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcGxpY2F0aW9uXG4iLCIvKiBnbG9iYWwgUElYSSwgQnVtcCAqL1xuXG5leHBvcnQgZGVmYXVsdCBuZXcgQnVtcChQSVhJKVxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBkaXNwbGF5LCBCTEVORF9NT0RFUywgU3ByaXRlIH0gZnJvbSAnLi9QSVhJJ1xuXG5pbXBvcnQgeyBTVEFZLCBDRUlMX1NJWkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IHsgaW5zdGFuY2VCeUl0ZW1JZCB9IGZyb20gJy4vdXRpbHMnXG5pbXBvcnQgYnVtcCBmcm9tICcuLi9saWIvQnVtcCdcblxuLyoqXG4gKiBldmVudHM6XG4gKiAgdXNlOiBvYmplY3RcbiAqL1xuY2xhc3MgTWFwIGV4dGVuZHMgQ29udGFpbmVyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmNvbGxpZGVPYmplY3RzID0gW11cbiAgICB0aGlzLnJlcGx5T2JqZWN0cyA9IFtdXG4gICAgdGhpcy5tYXAgPSBuZXcgQ29udGFpbmVyKClcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMubWFwKVxuXG4gICAgdGhpcy5vbmNlKCdhZGRlZCcsIHRoaXMuZW5hYmxlRm9nLmJpbmQodGhpcykpXG4gIH1cblxuICBlbmFibGVGb2cgKCkge1xuICAgIGxldCBsaWdodGluZyA9IG5ldyBkaXNwbGF5LkxheWVyKClcbiAgICBsaWdodGluZy5vbignZGlzcGxheScsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LmJsZW5kTW9kZSA9IEJMRU5EX01PREVTLkFERFxuICAgIH0pXG4gICAgbGlnaHRpbmcudXNlUmVuZGVyVGV4dHVyZSA9IHRydWVcbiAgICBsaWdodGluZy5jbGVhckNvbG9yID0gWzAsIDAsIDAsIDFdIC8vIGFtYmllbnQgZ3JheVxuXG4gICAgdGhpcy5hZGRDaGlsZChsaWdodGluZylcblxuICAgIHZhciBsaWdodGluZ1Nwcml0ZSA9IG5ldyBTcHJpdGUobGlnaHRpbmcuZ2V0UmVuZGVyVGV4dHVyZSgpKVxuICAgIGxpZ2h0aW5nU3ByaXRlLmJsZW5kTW9kZSA9IEJMRU5EX01PREVTLk1VTFRJUExZXG5cbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nU3ByaXRlKVxuXG4gICAgdGhpcy5tYXAubGlnaHRpbmcgPSBsaWdodGluZ1xuICB9XG5cbiAgLy8g5raI6Zmk6L+36ZynXG4gIGRpc2FibGVGb2cgKCkge1xuICAgIHRoaXMubGlnaHRpbmcuY2xlYXJDb2xvciA9IFsxLCAxLCAxLCAxXVxuICB9XG5cbiAgbG9hZCAobWFwRGF0YSkge1xuICAgIGxldCB0aWxlcyA9IG1hcERhdGEudGlsZXNcbiAgICBsZXQgY29scyA9IG1hcERhdGEuY29sc1xuICAgIGxldCByb3dzID0gbWFwRGF0YS5yb3dzXG4gICAgbGV0IGl0ZW1zID0gbWFwRGF0YS5pdGVtc1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xzOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm93czsgaisrKSB7XG4gICAgICAgIGxldCBpZCA9IHRpbGVzW2ogKiBjb2xzICsgaV1cbiAgICAgICAgbGV0IG8gPSBpbnN0YW5jZUJ5SXRlbUlkKGlkKVxuICAgICAgICBvLnBvc2l0aW9uLnNldChpICogQ0VJTF9TSVpFLCBqICogQ0VJTF9TSVpFKVxuICAgICAgICBzd2l0Y2ggKG8udHlwZSkge1xuICAgICAgICAgIGNhc2UgU1RBWTpcbiAgICAgICAgICAgIC8vIOmdnOaFi+eJqeS7tlxuICAgICAgICAgICAgdGhpcy5jb2xsaWRlT2JqZWN0cy5wdXNoKG8pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFwLmFkZENoaWxkKG8pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuICAgICAgbGV0IG8gPSBpbnN0YW5jZUJ5SXRlbUlkKGl0ZW0uVHlwZSwgaXRlbS5wYXJhbXMpXG4gICAgICBvLnBvc2l0aW9uLnNldChpdGVtLnBvc1swXSAqIENFSUxfU0laRSwgaXRlbS5wb3NbMV0gKiBDRUlMX1NJWkUpXG4gICAgICBzd2l0Y2ggKG8udHlwZSkge1xuICAgICAgICBjYXNlIFNUQVk6XG4gICAgICAgICAgLy8g6Z2c5oWL54mp5Lu2XG4gICAgICAgICAgdGhpcy5jb2xsaWRlT2JqZWN0cy5wdXNoKG8pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aGlzLnJlcGx5T2JqZWN0cy5wdXNoKG8pXG4gICAgICB9XG4gICAgICBvLm9uKCd0YWtlJywgKCkgPT4ge1xuICAgICAgICAvLyBkZXN0cm95IHRyZWFzdXJlXG4gICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQobylcbiAgICAgICAgby5kZXN0cm95KClcbiAgICAgICAgbGV0IGlueCA9IHRoaXMucmVwbHlPYmplY3RzLmluZGV4T2YobylcbiAgICAgICAgdGhpcy5yZXBseU9iamVjdHMuc3BsaWNlKGlueCwgMSlcblxuICAgICAgICAvLyByZW1vdmUgaXRlbSBmcm9tIHRoZSBtYXBcbiAgICAgICAgZGVsZXRlIGl0ZW1zW2ldXG4gICAgICB9KVxuICAgICAgby5vbigndXNlJywgKCkgPT4gdGhpcy5lbWl0KCd1c2UnLCBvKSlcbiAgICAgIHRoaXMubWFwLmFkZENoaWxkKG8pXG4gICAgfSlcbiAgfVxuXG4gIGFkZFBsYXllciAocGxheWVyLCB0b1Bvc2l0aW9uKSB7XG4gICAgcGxheWVyLnBvc2l0aW9uLnNldChcbiAgICAgIHRvUG9zaXRpb25bMF0gKiBDRUlMX1NJWkUsXG4gICAgICB0b1Bvc2l0aW9uWzFdICogQ0VJTF9TSVpFXG4gICAgKVxuICAgIHRoaXMubWFwLmFkZENoaWxkKHBsYXllcilcblxuICAgIHRoaXMucGxheWVyID0gcGxheWVyXG4gIH1cblxuICB0aWNrIChkZWx0YSkge1xuICAgIHRoaXMucGxheWVyLnRpY2soZGVsdGEpXG5cbiAgICAvLyBjb2xsaWRlIGRldGVjdFxuICAgIHRoaXMuY29sbGlkZU9iamVjdHMuZm9yRWFjaChvID0+IHtcbiAgICAgIGlmIChidW1wLnJlY3RhbmdsZUNvbGxpc2lvbih0aGlzLnBsYXllciwgbywgdHJ1ZSkpIHtcbiAgICAgICAgby5lbWl0KCdjb2xsaWRlJywgdGhpcy5wbGF5ZXIpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMucmVwbHlPYmplY3RzLmZvckVhY2gobyA9PiB7XG4gICAgICBpZiAoYnVtcC5oaXRUZXN0UmVjdGFuZ2xlKHRoaXMucGxheWVyLCBvKSkge1xuICAgICAgICBvLmVtaXQoJ2NvbGxpZGUnLCB0aGlzLnBsYXllcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLy8gZm9nIOeahCBwYXJlbnQgY29udGFpbmVyIOS4jeiDveiiq+enu+WLlSjmnIPpjK/kvY0p77yM5Zug5q2k5pS55oiQ5L+u5pS5IG1hcCDkvY3nva5cbiAgZ2V0IHBvc2l0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAucG9zaXRpb25cbiAgfVxuXG4gIGdldCB4ICgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAueFxuICB9XG5cbiAgZ2V0IHkgKCkge1xuICAgIHJldHVybiB0aGlzLm1hcC55XG4gIH1cblxuICBzZXQgeCAoeCkge1xuICAgIHRoaXMubWFwLnggPSB4XG4gIH1cblxuICBzZXQgeSAoeSkge1xuICAgIHRoaXMubWFwLnkgPSB5XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFwXG4iLCJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cydcblxuY29uc3QgTUFYX01FU1NBR0VfQ09VTlQgPSA1MDBcblxuY2xhc3MgTWVzc2FnZXMgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuX21lc3NhZ2VzID0gW11cbiAgfVxuXG4gIGdldCBsaXN0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXNcbiAgfVxuXG4gIGFkZCAobXNnKSB7XG4gICAgbGV0IGxlbmd0aCA9IHRoaXMuX21lc3NhZ2VzLnVuc2hpZnQobXNnKVxuICAgIGlmIChsZW5ndGggPiBNQVhfTUVTU0FHRV9DT1VOVCkge1xuICAgICAgdGhpcy5fbWVzc2FnZXMucG9wKClcbiAgICB9XG4gICAgdGhpcy5lbWl0KCdtb2RpZmllZCcpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1lc3NhZ2VzKClcbiIsIi8qIGdsb2JhbCBQSVhJICovXG5cbmV4cG9ydCBjb25zdCBBcHBsaWNhdGlvbiA9IFBJWEkuQXBwbGljYXRpb25cbmV4cG9ydCBjb25zdCBDb250YWluZXIgPSBQSVhJLkNvbnRhaW5lclxuZXhwb3J0IGNvbnN0IGxvYWRlciA9IFBJWEkubG9hZGVyXG5leHBvcnQgY29uc3QgcmVzb3VyY2VzID0gUElYSS5sb2FkZXIucmVzb3VyY2VzXG5leHBvcnQgY29uc3QgU3ByaXRlID0gUElYSS5TcHJpdGVcbmV4cG9ydCBjb25zdCBUZXh0ID0gUElYSS5UZXh0XG5leHBvcnQgY29uc3QgVGV4dFN0eWxlID0gUElYSS5UZXh0U3R5bGVcblxuZXhwb3J0IGNvbnN0IEdyYXBoaWNzID0gUElYSS5HcmFwaGljc1xuZXhwb3J0IGNvbnN0IEJMRU5EX01PREVTID0gUElYSS5CTEVORF9NT0RFU1xuZXhwb3J0IGNvbnN0IGRpc3BsYXkgPSBQSVhJLmRpc3BsYXlcbmV4cG9ydCBjb25zdCB1dGlscyA9IFBJWEkudXRpbHNcbiIsImltcG9ydCB7IGRpc3BsYXkgfSBmcm9tICcuL1BJWEknXG5cbmNsYXNzIFNjZW5lIGV4dGVuZHMgZGlzcGxheS5MYXllciB7XG4gIGNyZWF0ZSAoKSB7fVxuXG4gIGRlc3Ryb3kgKCkge31cblxuICB0aWNrIChkZWx0YSkge31cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVcbiIsImltcG9ydCBXIGZyb20gJy4uL29iamVjdHMvV2FsbCdcbmltcG9ydCBHIGZyb20gJy4uL29iamVjdHMvR3Jhc3MnXG5pbXBvcnQgVCBmcm9tICcuLi9vYmplY3RzL1RyZWFzdXJlJ1xuaW1wb3J0IEQgZnJvbSAnLi4vb2JqZWN0cy9Eb29yJ1xuXG5pbXBvcnQgTW92ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9Nb3ZlJ1xuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEnXG5pbXBvcnQgT3BlcmF0ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9PcGVyYXRlJ1xuXG5jb25zdCBJdGVtcyA9IFtcbiAgRywgVywgVCwgRFxuXVxuXG5jb25zdCBBYmlsaXRpZXMgPSBbXG4gIE1vdmUsIENhbWVyYSwgT3BlcmF0ZVxuXVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFuY2VCeUl0ZW1JZCAoaXRlbUlkLCBwYXJhbXMpIHtcbiAgcmV0dXJuIG5ldyBJdGVtc1tpdGVtSWRdKHBhcmFtcylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbmNlQnlBYmlsaXR5SWQgKGFiaWxpdHlJZCwgcGFyYW1zKSB7XG4gIHJldHVybiBuZXcgQWJpbGl0aWVzW2FiaWxpdHlJZF0ocGFyYW1zKVxufVxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmNsYXNzIENhdCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIocmVzb3VyY2VzWydpbWFnZXMvdG93bl90aWxlcy5qc29uJ10udGV4dHVyZXNbJ3dhbGwucG5nJ10pXG5cbiAgICAvLyBDaGFuZ2UgdGhlIHNwcml0ZSdzIHBvc2l0aW9uXG4gICAgdGhpcy5keCA9IDBcbiAgICB0aGlzLmR5ID0gMFxuXG4gICAgdGhpcy50aWNrQWJpbGl0aWVzID0ge31cbiAgICB0aGlzLmFiaWxpdGllcyA9IHt9XG4gIH1cblxuICB0YWtlQWJpbGl0eSAoYWJpbGl0eSkge1xuICAgIGlmIChhYmlsaXR5Lmhhc1RvUmVwbGFjZSh0aGlzLCBhYmlsaXR5KSkge1xuICAgICAgYWJpbGl0eS5jYXJyeUJ5KHRoaXMpXG4gICAgICB0aGlzLmVtaXQoJ2FiaWxpdHktY2FycnknLCBhYmlsaXR5KVxuICAgIH1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3lvdSdcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLnRpY2tBYmlsaXRpZXMpLmZvckVhY2goYWJpbGl0eSA9PiBhYmlsaXR5LnRpY2soZGVsdGEsIHRoaXMpKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhdFxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVksIEFCSUxJVFlfT1BFUkFURSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIERvb3IgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKG1hcCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWydkb29yLnBuZyddKVxuXG4gICAgdGhpcy5tYXAgPSBtYXBbMF1cbiAgICB0aGlzLnRvUG9zaXRpb24gPSBtYXBbMV1cblxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxuXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XG4gICAgbGV0IGFiaWxpdHkgPSBvcGVyYXRvci5hYmlsaXRpZXNbQUJJTElUWV9PUEVSQVRFXVxuICAgIGlmICghYWJpbGl0eSkge1xuICAgICAgdGhpcy5zYXkoW1xuICAgICAgICBvcGVyYXRvci50b1N0cmluZygpLFxuICAgICAgICAnIGRvc2VuXFwndCBoYXMgYWJpbGl0eSB0byB1c2UgdGhpcyBkb29yICcsXG4gICAgICAgIHRoaXMubWFwLFxuICAgICAgICAnLidcbiAgICAgIF0uam9pbignJykpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFiaWxpdHkudXNlKG9wZXJhdG9yLCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIFtBQklMSVRZX09QRVJBVEVdICgpIHtcbiAgICB0aGlzLnNheShbJ0dldCBpbiAnLCB0aGlzLm1hcCwgJyBub3cuJ10uam9pbignJykpXG4gICAgdGhpcy5lbWl0KCd1c2UnKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERvb3JcbiIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBtZXNzYWdlcyBmcm9tICcuLi9saWIvTWVzc2FnZXMnXG5cbmNsYXNzIEdhbWVPYmplY3QgZXh0ZW5kcyBTcHJpdGUge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxuICBzYXkgKG1zZykge1xuICAgIG1lc3NhZ2VzLmFkZChtc2cpXG4gICAgY29uc29sZS5sb2cobXNnKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVPYmplY3RcbiIsImltcG9ydCB7IHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBHcmFzcyBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIocmVzb3VyY2VzWydpbWFnZXMvdG93bl90aWxlcy5qc29uJ10udGV4dHVyZXNbJ2dyYXNzLnBuZyddKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3Jhc3NcbiIsImltcG9ydCB7IHJlc291cmNlcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBSRVBMWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgeyBpbnN0YW5jZUJ5QWJpbGl0eUlkIH0gZnJvbSAnLi4vbGliL3V0aWxzJ1xuXG5jbGFzcyBUcmVhc3VyZSBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoaW52ZW50b3JpZXMgPSBbXSkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKHJlc291cmNlc1snaW1hZ2VzL3Rvd25fdGlsZXMuanNvbiddLnRleHR1cmVzWyd0cmVhc3VyZS5wbmcnXSlcblxuICAgIHRoaXMuaW52ZW50b3JpZXMgPSBpbnZlbnRvcmllcy5tYXAoY29uZiA9PiB7XG4gICAgICByZXR1cm4gaW5zdGFuY2VCeUFiaWxpdHlJZChjb25mWzBdLCBjb25mWzFdKVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICd0cmVhc3VyZTogWycsXG4gICAgICB0aGlzLmludmVudG9yaWVzLmpvaW4oJywgJyksXG4gICAgICAnXSdcbiAgICBdLmpvaW4oJycpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XG5cbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IsIGFjdGlvbiA9ICd0YWtlQWJpbGl0eScpIHtcbiAgICAvLyBGSVhNRTog5pqr5pmC55So6aCQ6Kit5Y+D5pW4IHRha2VBYmlsaXR5XG4gICAgaWYgKHR5cGVvZiBvcGVyYXRvclthY3Rpb25dID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmludmVudG9yaWVzLmZvckVhY2godHJlYXN1cmUgPT4gb3BlcmF0b3JbYWN0aW9uXSh0cmVhc3VyZSkpXG4gICAgICB0aGlzLnNheShbXG4gICAgICAgIG9wZXJhdG9yLnRvU3RyaW5nKCksXG4gICAgICAgICcgdGFrZWQgJyxcbiAgICAgICAgdGhpcy50b1N0cmluZygpXG4gICAgICBdLmpvaW4oJycpKVxuXG4gICAgICB0aGlzLmVtaXQoJ3Rha2UnKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmVhc3VyZVxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBXYWxsIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihyZXNvdXJjZXNbJ2ltYWdlcy90b3duX3RpbGVzLmpzb24nXS50ZXh0dXJlc1snd2FsbC5wbmcnXSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXYWxsXG4iLCJjb25zdCB0eXBlID0gU3ltYm9sKCdhYmlsaXR5JylcblxuY2xhc3MgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIHR5cGUgfVxuXG4gIGdldFNhbWVUeXBlQWJpbGl0eSAob3duZXIpIHtcbiAgICByZXR1cm4gb3duZXIuYWJpbGl0aWVzW3RoaXMudHlwZV1cbiAgfVxuXG4gIC8vIOaYr+WQpumcgOe9ruaPm1xuICBoYXNUb1JlcGxhY2UgKG93bmVyLCBhYmlsaXR5TmV3KSB7XG4gICAgbGV0IGFiaWxpdHlPbGQgPSB0aGlzLmdldFNhbWVUeXBlQWJpbGl0eShvd25lcilcbiAgICByZXR1cm4gIWFiaWxpdHlPbGQgfHwgYWJpbGl0eU5ldy5pc0JldHRlcihhYmlsaXR5T2xkKVxuICB9XG5cbiAgLy8g5paw6IiK5q+U6LyDXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBsZXQgYWJpbGl0eU9sZCA9IHRoaXMuZ2V0U2FtZVR5cGVBYmlsaXR5KG93bmVyKVxuICAgIGlmIChhYmlsaXR5T2xkKSB7XG4gICAgICAvLyBmaXJzdCBnZXQgdGhpcyB0eXBlIGFiaWxpdHlcbiAgICAgIGFiaWxpdHlPbGQucmVwbGFjZWRCeSh0aGlzLCBvd25lcilcbiAgICB9XG4gICAgb3duZXIuYWJpbGl0aWVzW3RoaXMudHlwZV0gPSB0aGlzXG4gIH1cblxuICByZXBsYWNlZEJ5IChvdGhlciwgb3duZXIpIHt9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIGRlbGV0ZSBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAncGx6IGV4dGVuZCB0aGlzIGNsYXNzJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFiaWxpdHlcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEdyYXBoaWNzIH0gZnJvbSAnLi4vLi4vbGliL1BJWEknXG5pbXBvcnQgeyBBQklMSVRZX0NBTUVSQSwgQ0VJTF9TSVpFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY29uc3QgTElHSFQgPSBTeW1ib2woJ2xpZ2h0JylcblxuY2xhc3MgQ2FtZXJhIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnJhZGl1cyA9IHZhbHVlXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0NBTUVSQSB9XG5cbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgLy8g5Y+q5pyD6K6K5aSnXG4gICAgcmV0dXJuIHRoaXMucmFkaXVzID49IG90aGVyLnJhZGl1c1xuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICBpZiAob3duZXIucGFyZW50KSB7XG4gICAgICB0aGlzLnNldHVwKG93bmVyLCBvd25lci5wYXJlbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIG93bmVyLm9uY2UoJ2FkZGVkJywgY29udGFpbmVyID0+IHRoaXMuc2V0dXAob3duZXIsIGNvbnRhaW5lcikpXG4gICAgfVxuICB9XG5cbiAgcmVwbGFjZWRCeSAob3RoZXIsIG93bmVyKSB7XG4gICAgdGhpcy5yZW1vdmVDYW1lcmEob3duZXIpXG4gIH1cblxuICBzZXR1cCAob3duZXIsIGNvbnRhaW5lcikge1xuICAgIGlmICghY29udGFpbmVyLmxpZ2h0aW5nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdjb250YWluZXIgZG9lcyBOT1QgaGFzIGxpZ2h0aW5nIHByb3BlcnR5JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgbGlnaHRidWxiID0gbmV3IEdyYXBoaWNzKClcbiAgICB2YXIgcnIgPSAweGZmXG4gICAgdmFyIHJnID0gMHhmZlxuICAgIHZhciByYiA9IDB4ZmZcbiAgICB2YXIgcmFkID0gdGhpcy5yYWRpdXMgLyBvd25lci5zY2FsZS54ICogQ0VJTF9TSVpFXG5cbiAgICBsZXQgeCA9IG93bmVyLndpZHRoIC8gMiAvIG93bmVyLnNjYWxlLnhcbiAgICBsZXQgeSA9IG93bmVyLmhlaWdodCAvIDIgLyBvd25lci5zY2FsZS55XG4gICAgbGlnaHRidWxiLmJlZ2luRmlsbCgocnIgPDwgMTYpICsgKHJnIDw8IDgpICsgcmIsIDEuMClcbiAgICBsaWdodGJ1bGIuZHJhd0NpcmNsZSh4LCB5LCByYWQpXG4gICAgbGlnaHRidWxiLmVuZEZpbGwoKVxuICAgIGxpZ2h0YnVsYi5wYXJlbnRMYXllciA9IGNvbnRhaW5lci5saWdodGluZyAvLyBtdXN0IGhhcyBwcm9wZXJ0eTogbGlnaHRpbmdcblxuICAgIG93bmVyW0xJR0hUXSA9IGxpZ2h0YnVsYlxuICAgIG93bmVyLmFkZENoaWxkKGxpZ2h0YnVsYilcblxuICAgIG93bmVyLnJlbW92ZWQgPSB0aGlzLm9uUmVtb3ZlZC5iaW5kKHRoaXMsIG93bmVyKVxuICAgIG93bmVyLm9uY2UoJ3JlbW92ZWQnLCBvd25lci5yZW1vdmVkKVxuICB9XG5cbiAgb25SZW1vdmVkIChvd25lcikge1xuICAgIHRoaXMucmVtb3ZlQ2FtZXJhKG93bmVyKVxuICAgIG93bmVyLm9uY2UoJ2FkZGVkJywgY29udGFpbmVyID0+IHRoaXMuc2V0dXAob3duZXIsIGNvbnRhaW5lcikpXG4gIH1cblxuICByZW1vdmVDYW1lcmEgKG93bmVyKSB7XG4gICAgLy8gcmVtb3ZlIGxpZ2h0XG4gICAgb3duZXIucmVtb3ZlQ2hpbGQob3duZXJbTElHSFRdKVxuICAgIGRlbGV0ZSBvd25lcltMSUdIVF1cbiAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICBvd25lci5vZmYoJ3JlbW92ZWQnLCB0aGlzLnJlbW92ZWQpXG4gICAgZGVsZXRlIG93bmVyLnJlbW92ZWRcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2xpZ2h0IGFyZWE6ICcgKyB0aGlzLnJhZGl1c1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhbWVyYVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcbmltcG9ydCB7IExFRlQsIFVQLCBSSUdIVCwgRE9XTiB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb250cm9sJ1xuaW1wb3J0IHsgQUJJTElUWV9LRVlfTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEtleU1vdmUgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9LRVlfTU9WRSB9XG5cbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMuc2V0dXAob3duZXIpXG4gIH1cblxuICBzZXR1cCAob3duZXIpIHtcbiAgICBsZXQgZGlyID0ge31cbiAgICBsZXQgY2FsY0RpciA9ICgpID0+IHtcbiAgICAgIG93bmVyLmR4ID0gLWRpcltMRUZUXSArIGRpcltSSUdIVF1cbiAgICAgIG93bmVyLmR5ID0gLWRpcltVUF0gKyBkaXJbRE9XTl1cbiAgICB9XG4gICAgbGV0IGJpbmQgPSBjb2RlID0+IHtcbiAgICAgIGRpcltjb2RlXSA9IDBcbiAgICAgIGxldCBwcmVIYW5kbGVyID0gZSA9PiB7XG4gICAgICAgIGUucHJldmVudFJlcGVhdCgpXG4gICAgICAgIGRpcltjb2RlXSA9IDFcbiAgICAgICAgY2FsY0RpcigpXG4gICAgICB9XG4gICAgICBrZXlib2FyZEpTLmJpbmQoY29kZSwgcHJlSGFuZGxlciwgKCkgPT4ge1xuICAgICAgICBkaXJbY29kZV0gPSAwXG4gICAgICAgIGNhbGNEaXIoKVxuICAgICAgfSlcbiAgICAgIHJldHVybiBwcmVIYW5kbGVyXG4gICAgfVxuXG4gICAga2V5Ym9hcmRKUy5zZXRDb250ZXh0KCcnKVxuICAgIGtleWJvYXJkSlMud2l0aENvbnRleHQoJycsICgpID0+IHtcbiAgICAgIG93bmVyW0FCSUxJVFlfS0VZX01PVkVdID0ge1xuICAgICAgICBbTEVGVF06IGJpbmQoTEVGVCksXG4gICAgICAgIFtVUF06IGJpbmQoVVApLFxuICAgICAgICBbUklHSFRdOiBiaW5kKFJJR0hUKSxcbiAgICAgICAgW0RPV05dOiBiaW5kKERPV04pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGRyb3BCeSAob3duZXIpIHtcbiAgICBzdXBlci5kcm9wQnkob3duZXIpXG4gICAga2V5Ym9hcmRKUy53aXRoQ29udGV4dCgnJywgKCkgPT4ge1xuICAgICAgT2JqZWN0LmVudHJpZXMob3duZXJbQUJJTElUWV9LRVlfTU9WRV0pLmZvckVhY2goKFtrZXksIGhhbmRsZXJdKSA9PiB7XG4gICAgICAgIGtleWJvYXJkSlMudW5iaW5kKGtleSwgaGFuZGxlcilcbiAgICAgIH0pXG4gICAgfSlcbiAgICBkZWxldGUgb3duZXJbQUJJTElUWV9LRVlfTU9WRV1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2tleSBjb250cm9sJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEtleU1vdmVcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIE1vdmUgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgY29uc3RydWN0b3IgKHZhbHVlKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9NT1ZFIH1cblxuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICAvLyDlj6rmnIPliqDlv6tcbiAgICByZXR1cm4gdGhpcy52YWx1ZSA+IG90aGVyLnZhbHVlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIG93bmVyLnRpY2tBYmlsaXRpZXNbdGhpcy50eXBlLnRvU3RyaW5nKCldID0gdGhpc1xuICB9XG5cbiAgLy8gdGlja1xuICB0aWNrIChkZWx0YSwgb3duZXIpIHtcbiAgICBvd25lci54ICs9IG93bmVyLmR4ICogdGhpcy52YWx1ZSAqIGRlbHRhXG4gICAgb3duZXIueSArPSBvd25lci5keSAqIHRoaXMudmFsdWUgKiBkZWx0YVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnbW92ZSBsZXZlbDogJyArIHRoaXMudmFsdWVcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNb3ZlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX09QRVJBVEUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBPcGVyYXRlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnNldCA9IG5ldyBTZXQoW3ZhbHVlXSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfT1BFUkFURSB9XG5cbiAgcmVwbGFjZWRCeSAob3RoZXIpIHtcbiAgICB0aGlzLnNldC5mb3JFYWNoKG90aGVyLnNldC5hZGQuYmluZChvdGhlci5zZXQpKVxuICB9XG5cbiAgdXNlIChvcGVyYXRvciwgdGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMuc2V0Lmhhcyh0YXJnZXQubWFwKSkge1xuICAgICAgb3BlcmF0b3Iuc2F5KG9wZXJhdG9yLnRvU3RyaW5nKCkgKyAnIHVzZSBhYmlsaXR5IHRvIG9wZW4gJyArIHRhcmdldC5tYXApXG4gICAgICB0YXJnZXRbdGhpcy50eXBlXSgpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbJ2tleXM6ICcsIEFycmF5LmZyb20odGhpcy5zZXQpLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0ZVxuIiwiaW1wb3J0IHsgVGV4dCwgVGV4dFN0eWxlLCBsb2FkZXIgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9saWIvU2NlbmUnXG5pbXBvcnQgUGxheVNjZW5lIGZyb20gJy4vUGxheVNjZW5lJ1xuXG5sZXQgdGV4dCA9ICdsb2FkaW5nJ1xuXG5jbGFzcyBMb2FkaW5nU2NlbmUgZXh0ZW5kcyBTY2VuZSB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcigpXG5cbiAgICB0aGlzLmxpZmUgPSAwXG4gIH1cblxuICBjcmVhdGUgKCkge1xuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcbiAgICAgIGZvbnRTaXplOiAzNixcbiAgICAgIGZpbGw6ICd3aGl0ZScsXG4gICAgICBzdHJva2U6ICcjZmYzMzAwJyxcbiAgICAgIHN0cm9rZVRoaWNrbmVzczogNCxcbiAgICAgIGRyb3BTaGFkb3c6IHRydWUsXG4gICAgICBkcm9wU2hhZG93Q29sb3I6ICcjMDAwMDAwJyxcbiAgICAgIGRyb3BTaGFkb3dCbHVyOiA0LFxuICAgICAgZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZTogNlxuICAgIH0pXG4gICAgdGhpcy50ZXh0TG9hZGluZyA9IG5ldyBUZXh0KHRleHQsIHN0eWxlKVxuXG4gICAgLy8gQWRkIHRoZSBjYXQgdG8gdGhlIHN0YWdlXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRleHRMb2FkaW5nKVxuXG4gICAgLy8gbG9hZCBhbiBpbWFnZSBhbmQgcnVuIHRoZSBgc2V0dXBgIGZ1bmN0aW9uIHdoZW4gaXQncyBkb25lXG4gICAgbG9hZGVyXG4gICAgICAuYWRkKCdpbWFnZXMvdG93bl90aWxlcy5qc29uJylcbiAgICAgIC5sb2FkKCgpID0+IHRoaXMuZW1pdCgnY2hhbmdlU2NlbmUnLCBQbGF5U2NlbmUsIHtcbiAgICAgICAgbWFwRmlsZTogJ0UwTjAnLFxuICAgICAgICBwb3NpdGlvbjogWzEsIDFdXG4gICAgICB9KSlcbiAgfVxuXG4gIHRpY2sgKGRlbHRhKSB7XG4gICAgdGhpcy5saWZlICs9IGRlbHRhIC8gMzAgLy8gYmxlbmQgc3BlZWRcbiAgICB0aGlzLnRleHRMb2FkaW5nLnRleHQgPSB0ZXh0ICsgQXJyYXkoTWF0aC5mbG9vcih0aGlzLmxpZmUpICUgNCArIDEpLmpvaW4oJy4nKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExvYWRpbmdTY2VuZVxuIiwiaW1wb3J0IHsgbG9hZGVyLCByZXNvdXJjZXMsIGRpc3BsYXkgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9saWIvU2NlbmUnXG5pbXBvcnQgTWFwIGZyb20gJy4uL2xpYi9NYXAnXG5pbXBvcnQgeyBJU19NT0JJTEUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5pbXBvcnQgQ2F0IGZyb20gJy4uL29iamVjdHMvQ2F0J1xuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcbmltcG9ydCBLZXlNb3ZlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0tleU1vdmUnXG5pbXBvcnQgT3BlcmF0ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9PcGVyYXRlJ1xuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEnXG5cbmltcG9ydCBNZXNzYWdlV2luZG93IGZyb20gJy4uL3VpL01lc3NhZ2VXaW5kb3cnXG5pbXBvcnQgUGxheWVyV2luZG93IGZyb20gJy4uL3VpL1BsYXllcldpbmRvdydcbmltcG9ydCBUb3VjaENvbnRyb2xQYW5lbCBmcm9tICcuLi91aS9Ub3VjaENvbnRyb2xQYW5lbCdcblxubGV0IHNjZW5lV2lkdGhcbmxldCBzY2VuZUhlaWdodFxuXG5mdW5jdGlvbiBnZXRNZXNzYWdlV2luZG93T3B0ICgpIHtcbiAgbGV0IG9wdCA9IHt9XG4gIGlmIChJU19NT0JJTEUpIHtcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoXG4gICAgb3B0LmZvbnRTaXplID0gb3B0LndpZHRoIC8gMzBcbiAgICBvcHQuc2Nyb2xsQmFyV2lkdGggPSA1MFxuICAgIG9wdC5zY3JvbGxCYXJNaW5IZWlnaHQgPSA3MFxuICB9IGVsc2Uge1xuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggPCA0MDAgPyBzY2VuZVdpZHRoIDogc2NlbmVXaWR0aCAvIDJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyA2MFxuICB9XG4gIG9wdC5oZWlnaHQgPSBzY2VuZUhlaWdodCAvIDZcbiAgb3B0LnggPSAwXG4gIG9wdC55ID0gc2NlbmVIZWlnaHQgLSBvcHQuaGVpZ2h0XG5cbiAgcmV0dXJuIG9wdFxufVxuXG5jbGFzcyBQbGF5U2NlbmUgZXh0ZW5kcyBTY2VuZSB7XG4gIGNvbnN0cnVjdG9yICh7IG1hcEZpbGUsIHBvc2l0aW9uIH0pIHtcbiAgICBzdXBlcigpXG5cbiAgICB0aGlzLm1hcEZpbGUgPSBtYXBGaWxlXG4gICAgdGhpcy50b1Bvc2l0aW9uID0gcG9zaXRpb25cbiAgfVxuXG4gIGNyZWF0ZSAoKSB7XG4gICAgc2NlbmVXaWR0aCA9IHRoaXMucGFyZW50LndpZHRoXG4gICAgc2NlbmVIZWlnaHQgPSB0aGlzLnBhcmVudC5oZWlnaHRcbiAgICB0aGlzLmlzTWFwTG9hZGVkID0gZmFsc2VcbiAgICB0aGlzLmxvYWRNYXAoKVxuICAgIHRoaXMuaW5pdFBsYXllcigpXG4gICAgdGhpcy5pbml0VWkoKVxuICB9XG5cbiAgaW5pdFVpICgpIHtcbiAgICBsZXQgdWlHcm91cCA9IG5ldyBkaXNwbGF5Lkdyb3VwKDAsIHRydWUpXG4gICAgbGV0IHVpTGF5ZXIgPSBuZXcgZGlzcGxheS5MYXllcih1aUdyb3VwKVxuICAgIHVpTGF5ZXIucGFyZW50TGF5ZXIgPSB0aGlzXG4gICAgdWlMYXllci5ncm91cC5lbmFibGVTb3J0ID0gdHJ1ZVxuICAgIHRoaXMuYWRkQ2hpbGQodWlMYXllcilcblxuICAgIGxldCBtZXNzYWdlV2luZG93ID0gbmV3IE1lc3NhZ2VXaW5kb3coZ2V0TWVzc2FnZVdpbmRvd09wdCgpKVxuICAgIC8vIOiuk1VJ6aGv56S65Zyo6aCC5bGkXG4gICAgbWVzc2FnZVdpbmRvdy5wYXJlbnRHcm91cCA9IHVpR3JvdXBcbiAgICBtZXNzYWdlV2luZG93LmFkZChbJ3NjZW5lIHNpemU6ICgnLCBzY2VuZVdpZHRoLCAnLCAnLCBzY2VuZUhlaWdodCwgJykuJ10uam9pbignJykpXG5cbiAgICBsZXQgcGxheWVyV2luZG93ID0gbmV3IFBsYXllcldpbmRvdyh7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIHdpZHRoOiAxMDAsXG4gICAgICBoZWlnaHQ6IDgwLFxuICAgICAgcGxheWVyOiB0aGlzLmNhdFxuICAgIH0pXG5cbiAgICBsZXQgdG91Y2hDb250cm9sUGFuZWwgPSBuZXcgVG91Y2hDb250cm9sUGFuZWwoe1xuICAgICAgeDogMTAwLFxuICAgICAgeTogMjAwLFxuICAgICAgcmFkaXVzOiA1MFxuICAgIH0pXG4gICAgdG91Y2hDb250cm9sUGFuZWwucGFyZW50R3JvdXAgPSB1aUdyb3VwXG5cbiAgICB1aUxheWVyLmFkZENoaWxkKG1lc3NhZ2VXaW5kb3cpXG4gICAgdWlMYXllci5hZGRDaGlsZChwbGF5ZXJXaW5kb3cpXG4gICAgdWlMYXllci5hZGRDaGlsZCh0b3VjaENvbnRyb2xQYW5lbClcblxuICAgIGlmIChJU19NT0JJTEUpIHtcbiAgICAgIC8vIHJlcXVpcmUoJy4uL2xpYi9kZW1vJylcbiAgICB9XG4gIH1cblxuICBpbml0UGxheWVyICgpIHtcbiAgICBpZiAoIXRoaXMuY2F0KSB7XG4gICAgICB0aGlzLmNhdCA9IG5ldyBDYXQoKVxuICAgICAgdGhpcy5jYXQudGFrZUFiaWxpdHkobmV3IE1vdmUoMSkpXG4gICAgICB0aGlzLmNhdC50YWtlQWJpbGl0eShuZXcgT3BlcmF0ZSgnRTBOMCcpKVxuICAgICAgdGhpcy5jYXQudGFrZUFiaWxpdHkobmV3IEtleU1vdmUoKSlcbiAgICAgIHRoaXMuY2F0LnRha2VBYmlsaXR5KG5ldyBDYW1lcmEoMSkpXG4gICAgICB0aGlzLmNhdC53aWR0aCA9IDEwXG4gICAgICB0aGlzLmNhdC5oZWlnaHQgPSAxMFxuICAgIH1cbiAgfVxuXG4gIGxvYWRNYXAgKCkge1xuICAgIGxldCBmaWxlTmFtZSA9ICd3b3JsZC8nICsgdGhpcy5tYXBGaWxlXG5cbiAgICAvLyBpZiBtYXAgbm90IGxvYWRlZCB5ZXRcbiAgICBpZiAoIXJlc291cmNlc1tmaWxlTmFtZV0pIHtcbiAgICAgIGxvYWRlclxuICAgICAgICAuYWRkKGZpbGVOYW1lLCBmaWxlTmFtZSArICcuanNvbicpXG4gICAgICAgIC5sb2FkKHRoaXMuc3Bhd25NYXAuYmluZCh0aGlzLCBmaWxlTmFtZSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3Bhd25NYXAoZmlsZU5hbWUpXG4gICAgfVxuICB9XG5cbiAgc3Bhd25NYXAgKGZpbGVOYW1lKSB7XG4gICAgbGV0IG1hcERhdGEgPSByZXNvdXJjZXNbZmlsZU5hbWVdLmRhdGFcblxuICAgIGxldCBtYXAgPSBuZXcgTWFwKClcbiAgICBtYXAubG9hZChtYXBEYXRhKVxuXG4gICAgbWFwLm9uKCd1c2UnLCBvID0+IHtcbiAgICAgIHRoaXMuaXNNYXBMb2FkZWQgPSBmYWxzZVxuICAgICAgLy8gY2xlYXIgb2xkIG1hcFxuICAgICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLm1hcClcbiAgICAgIHRoaXMubWFwLmRlc3Ryb3koKVxuXG4gICAgICB0aGlzLm1hcEZpbGUgPSBvLm1hcFxuICAgICAgdGhpcy50b1Bvc2l0aW9uID0gby50b1Bvc2l0aW9uXG4gICAgICB0aGlzLmxvYWRNYXAoKVxuICAgIH0pXG5cbiAgICB0aGlzLmFkZENoaWxkKG1hcClcbiAgICBtYXAuYWRkUGxheWVyKHRoaXMuY2F0LCB0aGlzLnRvUG9zaXRpb24pXG4gICAgdGhpcy5tYXAgPSBtYXBcblxuICAgIHRoaXMuaXNNYXBMb2FkZWQgPSB0cnVlXG4gIH1cblxuICB0aWNrIChkZWx0YSkge1xuICAgIGlmICghdGhpcy5pc01hcExvYWRlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMubWFwLnRpY2soZGVsdGEpXG4gICAgdGhpcy5tYXAucG9zaXRpb24uc2V0KFxuICAgICAgc2NlbmVXaWR0aCAvIDIgLSB0aGlzLmNhdC54LFxuICAgICAgc2NlbmVIZWlnaHQgLyAyIC0gdGhpcy5jYXQueVxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5U2NlbmVcbiIsImltcG9ydCB7IFRleHQsIFRleHRTdHlsZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgU2Nyb2xsYWJsZVdpbmRvdyBmcm9tICcuL1Njcm9sbGFibGVXaW5kb3cnXG5pbXBvcnQgbWVzc2FnZXMgZnJvbSAnLi4vbGliL01lc3NhZ2VzJ1xuXG5jbGFzcyBNZXNzYWdlV2luZG93IGV4dGVuZHMgU2Nyb2xsYWJsZVdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG5cbiAgICBsZXQgeyBmb250U2l6ZSA9IDEyIH0gPSBvcHRcblxuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgZmlsbDogJ2dyZWVuJyxcbiAgICAgIGJyZWFrV29yZHM6IHRydWUsXG4gICAgICB3b3JkV3JhcDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGg6IHRoaXMud2luZG93V2lkdGhcbiAgICB9KVxuICAgIGxldCB0ZXh0ID0gbmV3IFRleHQoJycsIHN0eWxlKVxuXG4gICAgdGhpcy5hZGRXaW5kb3dDaGlsZCh0ZXh0KVxuICAgIHRoaXMudGV4dCA9IHRleHRcblxuICAgIHRoaXMuYXV0b1Njcm9sbFRvQm90dG9tID0gdHJ1ZVxuXG4gICAgbWVzc2FnZXMub24oJ21vZGlmaWVkJywgdGhpcy5tb2RpZmllZC5iaW5kKHRoaXMpKVxuICB9XG5cbiAgbW9kaWZpZWQgKCkge1xuICAgIGxldCBzY3JvbGxQZXJjZW50ID0gdGhpcy5zY3JvbGxQZXJjZW50XG4gICAgdGhpcy50ZXh0LnRleHQgPSBbXS5jb25jYXQobWVzc2FnZXMubGlzdCkucmV2ZXJzZSgpLmpvaW4oJ1xcbicpXG4gICAgdGhpcy51cGRhdGVTY3JvbGxCYXJMZW5ndGgoKVxuXG4gICAgLy8g6Iulc2Nyb2xs572u5bqV77yM6Ieq5YuV5o2y5YuV572u5bqVXG4gICAgaWYgKHNjcm9sbFBlcmNlbnQgPT09IDEpIHtcbiAgICAgIHRoaXMuc2Nyb2xsVG8oMSlcbiAgICB9XG4gIH1cblxuICBhZGQgKG1zZykge1xuICAgIG1lc3NhZ2VzLmFkZChtc2cpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdtZXNzYWdlLXdpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlV2luZG93XG4iLCJpbXBvcnQgeyBDb250YWluZXIsIFRleHQsIFRleHRTdHlsZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IHsgQUJJTElUSUVTX0FMTCB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFBsYXllcldpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG4gICAgbGV0IHsgcGxheWVyIH0gPSBvcHRcbiAgICB0aGlzLl9vcHQgPSBvcHRcbiAgICBwbGF5ZXIub24oJ2FiaWxpdHktY2FycnknLCB0aGlzLm9uQWJpbGl0eUNhcnJ5LmJpbmQodGhpcywgcGxheWVyKSlcblxuICAgIHRoaXMuYWJpbGl0eVRleHRDb250YWluZXIgPSBuZXcgQ29udGFpbmVyKClcbiAgICB0aGlzLmFiaWxpdHlUZXh0Q29udGFpbmVyLnggPSA1XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLmFiaWxpdHlUZXh0Q29udGFpbmVyKVxuXG4gICAgdGhpcy5vbkFiaWxpdHlDYXJyeShwbGF5ZXIpXG4gIH1cblxuICBvbkFiaWxpdHlDYXJyeSAocGxheWVyKSB7XG4gICAgbGV0IGkgPSAwXG4gICAgbGV0IHsgZm9udFNpemUgPSAxMCB9ID0gdGhpcy5fb3B0XG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgbGluZUhlaWdodDogZm9udFNpemVcbiAgICB9KVxuXG4gICAgbGV0IGNvbnRpYW5lciA9IHRoaXMuYWJpbGl0eVRleHRDb250YWluZXJcbiAgICBjb250aWFuZXIucmVtb3ZlQ2hpbGRyZW4oKVxuICAgIEFCSUxJVElFU19BTEwuZm9yRWFjaChhYmlsaXR5U3ltYm9sID0+IHtcbiAgICAgIGxldCBhYmlsaXR5ID0gcGxheWVyLmFiaWxpdGllc1thYmlsaXR5U3ltYm9sXVxuICAgICAgaWYgKGFiaWxpdHkpIHtcbiAgICAgICAgbGV0IHRleHQgPSBuZXcgVGV4dChhYmlsaXR5LnRvU3RyaW5nKCksIHN0eWxlKVxuICAgICAgICB0ZXh0LnkgPSBpICogKGZvbnRTaXplICsgNSlcblxuICAgICAgICBjb250aWFuZXIuYWRkQ2hpbGQodGV4dClcblxuICAgICAgICBpKytcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllcldpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IFdyYXBwZXIgZnJvbSAnLi9XcmFwcGVyJ1xuXG5jbGFzcyBTY3JvbGxhYmxlV2luZG93IGV4dGVuZHMgV2luZG93IHtcbiAgY29uc3RydWN0b3IgKG9wdCkge1xuICAgIHN1cGVyKG9wdClcbiAgICBsZXQge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBwYWRkaW5nID0gOCxcbiAgICAgIHNjcm9sbEJhcldpZHRoID0gMTBcbiAgICB9ID0gb3B0XG4gICAgdGhpcy5fb3B0ID0gb3B0XG5cbiAgICB0aGlzLl9pbml0U2Nyb2xsYWJsZUFyZWEoXG4gICAgICB3aWR0aCAtIHBhZGRpbmcgKiAyIC0gc2Nyb2xsQmFyV2lkdGggLSA1LFxuICAgICAgaGVpZ2h0IC0gcGFkZGluZyAqIDIsXG4gICAgICBwYWRkaW5nKVxuICAgIHRoaXMuX2luaXRTY3JvbGxCYXIoe1xuICAgICAgLy8gd2luZG93IHdpZHRoIC0gd2luZG93IHBhZGRpbmcgLSBiYXIgd2lkdGhcbiAgICAgIHg6IHdpZHRoIC0gcGFkZGluZyAtIHNjcm9sbEJhcldpZHRoLFxuICAgICAgeTogcGFkZGluZyxcbiAgICAgIHdpZHRoOiBzY3JvbGxCYXJXaWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0IC0gcGFkZGluZyAqIDJcbiAgICB9KVxuICB9XG5cbiAgX2luaXRTY3JvbGxhYmxlQXJlYSAod2lkdGgsIGhlaWdodCwgcGFkZGluZykge1xuICAgIC8vIGhvbGQgcGFkZGluZ1xuICAgIGxldCBfbWFpblZpZXcgPSBuZXcgQ29udGFpbmVyKClcbiAgICBfbWFpblZpZXcucG9zaXRpb24uc2V0KHBhZGRpbmcsIHBhZGRpbmcpXG4gICAgdGhpcy5hZGRDaGlsZChfbWFpblZpZXcpXG5cbiAgICB0aGlzLm1haW5WaWV3ID0gbmV3IENvbnRhaW5lcigpXG4gICAgX21haW5WaWV3LmFkZENoaWxkKHRoaXMubWFpblZpZXcpXG5cbiAgICAvLyBoaWRlIG1haW5WaWV3J3Mgb3ZlcmZsb3dcbiAgICBsZXQgbWFzayA9IG5ldyBHcmFwaGljcygpXG4gICAgbWFzay5iZWdpbkZpbGwoMHhGRkZGRkYpXG4gICAgbWFzay5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgNSlcbiAgICBtYXNrLmVuZEZpbGwoKVxuICAgIHRoaXMubWFpblZpZXcubWFzayA9IG1hc2tcbiAgICBfbWFpblZpZXcuYWRkQ2hpbGQobWFzaylcblxuICAgIC8vIHdpbmRvdyB3aWR0aCAtIHdpbmRvdyBwYWRkaW5nICogMiAtIGJhciB3aWR0aCAtIGJldHdlZW4gc3BhY2VcbiAgICB0aGlzLl93aW5kb3dXaWR0aCA9IHdpZHRoXG4gICAgdGhpcy5fd2luZG93SGVpZ2h0ID0gaGVpZ2h0XG4gIH1cblxuICBfaW5pdFNjcm9sbEJhciAoeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0pIHtcbiAgICBsZXQgY29uYXRpbmVyID0gbmV3IENvbnRhaW5lcigpXG4gICAgY29uYXRpbmVyLnggPSB4XG4gICAgY29uYXRpbmVyLnkgPSB5XG5cbiAgICBsZXQgc2Nyb2xsQmFyQmcgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHNjcm9sbEJhckJnLmJlZ2luRmlsbCgweEE4QThBOClcbiAgICBzY3JvbGxCYXJCZy5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgMilcbiAgICBzY3JvbGxCYXJCZy5lbmRGaWxsKClcblxuICAgIGxldCBzY3JvbGxCYXIgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHNjcm9sbEJhci5iZWdpbkZpbGwoMHgyMjIyMjIpXG4gICAgc2Nyb2xsQmFyLmRyYXdSb3VuZGVkUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0LCAzKVxuICAgIHNjcm9sbEJhci5lbmRGaWxsKClcbiAgICBzY3JvbGxCYXIudG9TdHJpbmcgPSAoKSA9PiAnc2Nyb2xsQmFyJ1xuICAgIFdyYXBwZXIuZHJhZ2dhYmxlKHNjcm9sbEJhciwge1xuICAgICAgYm91bmRhcnk6IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMCxcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgfVxuICAgIH0pXG4gICAgc2Nyb2xsQmFyLm9uKCdkcmFnJywgdGhpcy5zY3JvbGxNYWluVmlldy5iaW5kKHRoaXMpKVxuXG4gICAgY29uYXRpbmVyLmFkZENoaWxkKHNjcm9sbEJhckJnKVxuICAgIGNvbmF0aW5lci5hZGRDaGlsZChzY3JvbGxCYXIpXG4gICAgdGhpcy5hZGRDaGlsZChjb25hdGluZXIpXG4gICAgdGhpcy5zY3JvbGxCYXIgPSBzY3JvbGxCYXJcbiAgICB0aGlzLnNjcm9sbEJhckJnID0gc2Nyb2xsQmFyQmdcbiAgfVxuXG4gIC8vIOaNsuWLleimlueql1xuICBzY3JvbGxNYWluVmlldyAoKSB7XG4gICAgdGhpcy5tYWluVmlldy55ID0gKHRoaXMud2luZG93SGVpZ2h0IC0gdGhpcy5tYWluVmlldy5oZWlnaHQpICogdGhpcy5zY3JvbGxQZXJjZW50XG4gIH1cblxuICAvLyDmlrDlop7nianku7boh7PoppbnqpdcbiAgYWRkV2luZG93Q2hpbGQgKGNoaWxkKSB7XG4gICAgdGhpcy5tYWluVmlldy5hZGRDaGlsZChjaGlsZClcbiAgfVxuXG4gIC8vIOabtOaWsOaNsuWLleajkuWkp+Wwjywg5LiN5LiA5a6a6KaB6Kq/55SoXG4gIHVwZGF0ZVNjcm9sbEJhckxlbmd0aCAoKSB7XG4gICAgbGV0IHsgc2Nyb2xsQmFyTWluSGVpZ2h0ID0gMjAgfSA9IHRoaXMuX29wdFxuXG4gICAgbGV0IGRoID0gdGhpcy5tYWluVmlldy5oZWlnaHQgLyB0aGlzLndpbmRvd0hlaWdodFxuICAgIGlmIChkaCA8IDEpIHtcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC8gZGhcbiAgICAgIC8vIOmBv+WFjeWkquWwj+W+iOmbo+aLluabs1xuICAgICAgdGhpcy5zY3JvbGxCYXIuaGVpZ2h0ID0gTWF0aC5tYXgoc2Nyb2xsQmFyTWluSGVpZ2h0LCB0aGlzLnNjcm9sbEJhci5oZWlnaHQpXG4gICAgfVxuICAgIHRoaXMuc2Nyb2xsQmFyLmZhbGxiYWNrVG9Cb3VuZGFyeSgpXG4gIH1cblxuICAvLyDmjbLli5Xnmb7liIbmr5RcbiAgZ2V0IHNjcm9sbFBlcmNlbnQgKCkge1xuICAgIGxldCBkZWx0YSA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC0gdGhpcy5zY3JvbGxCYXIuaGVpZ2h0XG4gICAgcmV0dXJuIGRlbHRhID09PSAwID8gMSA6IHRoaXMuc2Nyb2xsQmFyLnkgLyBkZWx0YVxuICB9XG5cbiAgLy8g5o2y5YuV6Iez55m+5YiG5q+UXG4gIHNjcm9sbFRvIChwZXJjZW50KSB7XG4gICAgbGV0IGRlbHRhID0gdGhpcy5zY3JvbGxCYXJCZy5oZWlnaHQgLSB0aGlzLnNjcm9sbEJhci5oZWlnaHRcbiAgICBsZXQgeSA9IDBcbiAgICBpZiAoZGVsdGEgIT09IDApIHtcbiAgICAgIHkgPSBkZWx0YSAqIHBlcmNlbnRcbiAgICB9XG4gICAgdGhpcy5zY3JvbGxCYXIueSA9IHlcbiAgICB0aGlzLnNjcm9sbE1haW5WaWV3KClcbiAgfVxuXG4gIGdldCB3aW5kb3dXaWR0aCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpbmRvd1dpZHRoXG4gIH1cblxuICBnZXQgd2luZG93SGVpZ2h0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fd2luZG93SGVpZ2h0XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2Nyb2xsYWJsZVdpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcyB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuXG5pbXBvcnQgbWVzc2FnZXMgZnJvbSAnLi4vbGliL01lc3NhZ2VzJ1xuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcbmltcG9ydCB7IExFRlQsIFVQLCBSSUdIVCwgRE9XTiB9IGZyb20gJy4uL2NvbmZpZy9jb250cm9sJ1xuXG5jbGFzcyBUb3VjaENvbnRyb2xQYW5lbCBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHJhZGl1cyB9KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXG5cbiAgICBsZXQgdG91Y2hBcmVhID0gbmV3IEdyYXBoaWNzKClcbiAgICB0b3VjaEFyZWEuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXG4gICAgdG91Y2hBcmVhLmRyYXdDaXJjbGUoMCwgMCwgcmFkaXVzKVxuICAgIHRvdWNoQXJlYS5lbmRGaWxsKClcbiAgICB0aGlzLmFkZENoaWxkKHRvdWNoQXJlYSlcblxuICAgIHRoaXMuc2V0dXBUb3VjaCgpXG4gIH1cblxuICBzZXR1cFRvdWNoICgpIHtcbiAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxuICAgIGxldCBmID0gdGhpcy5vblRvdWNoLmJpbmQodGhpcylcbiAgICB0aGlzLm9uKCd0b3VjaHN0YXJ0JywgZilcbiAgICB0aGlzLm9uKCd0b3VjaGVuZCcsIGYpXG4gICAgdGhpcy5vbigndG91Y2htb3ZlJywgZilcbiAgICB0aGlzLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBmKVxuICAgIHRoaXMub24oJ21vdXNlZG93bicsIGYpXG4gICAgdGhpcy5vbignbW91c2V1cCcsIGYpXG4gICAgdGhpcy5vbignbW91c2Vtb3ZlJywgZilcbiAgICB0aGlzLm9uKCdtb3VzZXVwb3V0c2lkZScsIGYpXG4gIH1cblxuICBvblRvdWNoIChlKSB7XG4gICAgbGV0IHR5cGUgPSBlLnR5cGVcbiAgICBsZXQgcHJvcGFnYXRpb24gPSBmYWxzZVxuICAgIG1lc3NhZ2VzLmFkZCh0eXBlKVxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAndG91Y2hzdGFydCc6XG4gICAgICBjYXNlICdtb3VzZWRvd24nOlxuICAgICAgICB0aGlzLmRyYWcgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcbiAgICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbiA9IHtcbiAgICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgICAgeTogdGhpcy55XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3RvdWNoZW5kJzpcbiAgICAgIGNhc2UgJ3RvdWNoZW5kb3V0c2lkZSc6XG4gICAgICBjYXNlICdtb3VzZXVwJzpcbiAgICAgIGNhc2UgJ21vdXNldXBvdXRzaWRlJzpcbiAgICAgICAgdGhpcy5kcmFnID0gZmFsc2VcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3RvdWNobW92ZSc6XG4gICAgICBjYXNlICdtb3VzZW1vdmUnOlxuICAgICAgICBpZiAoIXRoaXMuZHJhZykge1xuICAgICAgICAgIHByb3BhZ2F0aW9uID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5ld1BvaW50ID0gZS5kYXRhLmdsb2JhbC5jbG9uZSgpXG4gICAgICAgIGxldCB4ID0gbmV3UG9pbnQueCAtIHRoaXMuZHJhZy54XG4gICAgICAgIGxldCB5ID0gbmV3UG9pbnQueSAtIHRoaXMuZHJhZy55XG4gICAgICAgIGxldCBkeCA9IDBcbiAgICAgICAgbGV0IGR5ID0gMFxuICAgICAgICBsZXQgdGhyZWQgPSAxMFxuICAgICAgICBrZXlib2FyZEpTLnJlbGVhc2VLZXkoUklHSFQpXG4gICAgICAgIGtleWJvYXJkSlMucmVsZWFzZUtleShMRUZUKVxuICAgICAgICBrZXlib2FyZEpTLnJlbGVhc2VLZXkoVVApXG4gICAgICAgIGtleWJvYXJkSlMucmVsZWFzZUtleShET1dOKVxuICAgICAgICBtZXNzYWdlcy5hZGQoWycoJywgeC50b0ZpeGVkKDIpLCAnLCAnLCB5LnRvRml4ZWQoMiksICcpJ10uam9pbignJykpXG4gICAgICAgIGlmICh4ID4gdGhyZWQpIHtcbiAgICAgICAgICBkeCA9IDFcbiAgICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KFJJR0hUKVxuICAgICAgICB9IGVsc2UgaWYgKHggPCAtdGhyZWQpIHtcbiAgICAgICAgICBkeCA9IC0xXG4gICAgICAgICAga2V5Ym9hcmRKUy5wcmVzc0tleShMRUZUKVxuICAgICAgICB9XG4gICAgICAgIGlmICh5ID4gdGhyZWQpIHtcbiAgICAgICAgICBkeSA9IDFcbiAgICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KERPV04pXG4gICAgICAgIH0gZWxzZSBpZiAoeSA8IC10aHJlZCkge1xuICAgICAgICAgIGR5ID0gLTFcbiAgICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KFVQKVxuICAgICAgICB9XG4gICAgICAgIG1lc3NhZ2VzLmFkZChbZHgsIGR5XS5qb2luKCcsICcpKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgICBpZiAoIXByb3BhZ2F0aW9uKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnVG91Y2hDb250cm9sUGFuZWwnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVG91Y2hDb250cm9sUGFuZWxcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY2xhc3MgV2luZG93IGV4dGVuZHMgQ29udGFpbmVyIHtcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXG5cbiAgICBsZXQgbGluZVdpZHRoID0gM1xuXG4gICAgbGV0IHdpbmRvd0JnID0gbmV3IEdyYXBoaWNzKClcbiAgICB3aW5kb3dCZy5iZWdpbkZpbGwoMHhGMkYyRjIpXG4gICAgd2luZG93QmcubGluZVN0eWxlKGxpbmVXaWR0aCwgMHgyMjIyMjIsIDEpXG4gICAgd2luZG93QmcuZHJhd1JvdW5kZWRSZWN0KFxuICAgICAgMCwgMCxcbiAgICAgIHdpZHRoIC0gbGluZVdpZHRoLFxuICAgICAgaGVpZ2h0IC0gbGluZVdpZHRoLFxuICAgICAgNSlcbiAgICB3aW5kb3dCZy5lbmRGaWxsKClcbiAgICB0aGlzLmFkZENoaWxkKHdpbmRvd0JnKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpbmRvd1xuIiwiY29uc3QgT1BUID0gU3ltYm9sKCdvcHQnKVxuXG5mdW5jdGlvbiBfZW5hYmxlRHJhZ2dhYmxlICgpIHtcbiAgdGhpcy5kcmFnID0gZmFsc2VcbiAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcbiAgbGV0IGYgPSBfb25Ub3VjaC5iaW5kKHRoaXMpXG4gIHRoaXMub24oJ3RvdWNoc3RhcnQnLCBmKVxuICB0aGlzLm9uKCd0b3VjaGVuZCcsIGYpXG4gIHRoaXMub24oJ3RvdWNobW92ZScsIGYpXG4gIHRoaXMub24oJ3RvdWNoZW5kb3V0c2lkZScsIGYpXG4gIHRoaXMub24oJ21vdXNlZG93bicsIGYpXG4gIHRoaXMub24oJ21vdXNldXAnLCBmKVxuICB0aGlzLm9uKCdtb3VzZW1vdmUnLCBmKVxuICB0aGlzLm9uKCdtb3VzZXVwb3V0c2lkZScsIGYpXG59XG5cbmZ1bmN0aW9uIF9vblRvdWNoIChlKSB7XG4gIGxldCB0eXBlID0gZS50eXBlXG4gIGxldCBwcm9wYWdhdGlvbiA9IGZhbHNlXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxuICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICB0aGlzLmRyYWcgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcbiAgICAgIHRoaXMub3JpZ2luUG9zaXRpb24gPSB7XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ3RvdWNoZW5kJzpcbiAgICBjYXNlICd0b3VjaGVuZG91dHNpZGUnOlxuICAgIGNhc2UgJ21vdXNldXAnOlxuICAgIGNhc2UgJ21vdXNldXBvdXRzaWRlJzpcbiAgICAgIHRoaXMuZHJhZyA9IGZhbHNlXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3RvdWNobW92ZSc6XG4gICAgY2FzZSAnbW91c2Vtb3ZlJzpcbiAgICAgIGlmICghdGhpcy5kcmFnKSB7XG4gICAgICAgIHByb3BhZ2F0aW9uID0gdHJ1ZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgbGV0IG5ld1BvaW50ID0gZS5kYXRhLmdsb2JhbC5jbG9uZSgpXG4gICAgICB0aGlzLnBvc2l0aW9uLnNldChcbiAgICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbi54ICsgbmV3UG9pbnQueCAtIHRoaXMuZHJhZy54LFxuICAgICAgICB0aGlzLm9yaWdpblBvc2l0aW9uLnkgKyBuZXdQb2ludC55IC0gdGhpcy5kcmFnLnlcbiAgICAgIClcbiAgICAgIF9mYWxsYmFja1RvQm91bmRhcnkuY2FsbCh0aGlzKVxuICAgICAgdGhpcy5lbWl0KCdkcmFnJykgLy8gbWF5YmUgY2FuIHBhc3MgcGFyYW0gZm9yIHNvbWUgcmVhc29uOiBlLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzKVxuICAgICAgYnJlYWtcbiAgfVxuICBpZiAoIXByb3BhZ2F0aW9uKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICB9XG59XG5cbi8vIOmAgOWbnumCiueVjFxuZnVuY3Rpb24gX2ZhbGxiYWNrVG9Cb3VuZGFyeSAoKSB7XG4gIGxldCB7IHdpZHRoID0gdGhpcy53aWR0aCwgaGVpZ2h0ID0gdGhpcy5oZWlnaHQsIGJvdW5kYXJ5IH0gPSB0aGlzW09QVF1cbiAgdGhpcy54ID0gTWF0aC5tYXgodGhpcy54LCBib3VuZGFyeS54KVxuICB0aGlzLnggPSBNYXRoLm1pbih0aGlzLngsIGJvdW5kYXJ5LnggKyBib3VuZGFyeS53aWR0aCAtIHdpZHRoKVxuICB0aGlzLnkgPSBNYXRoLm1heCh0aGlzLnksIGJvdW5kYXJ5LnkpXG4gIHRoaXMueSA9IE1hdGgubWluKHRoaXMueSwgYm91bmRhcnkueSArIGJvdW5kYXJ5LmhlaWdodCAtIGhlaWdodClcbn1cbmNsYXNzIFdyYXBwZXIge1xuICAvKipcbiAgICogZGlzcGxheU9iamVjdDogd2lsbCB3cmFwcGVkIERpc3BsYXlPYmplY3RcbiAgICogb3B0OiB7XG4gICAqICBib3VuZGFyeTog5ouW5puz6YKK55WMIHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9XG4gICAqICBbLCB3aWR0aF06IOmCiueVjOeisOaSnuWvrChkZWZhdWx0OiBkaXNwbGF5T2JqZWN0LndpZHRoKVxuICAgKiAgWywgaGVpZ2h0XTog6YKK55WM56Kw5pKe6auYKGRlZmF1bHQ6IGRpc3BsYXlPYmplY3QuaGVpZ2h0KVxuICAgKiAgfVxuICAgKi9cbiAgc3RhdGljIGRyYWdnYWJsZSAoZGlzcGxheU9iamVjdCwgb3B0KSB7XG4gICAgZGlzcGxheU9iamVjdFtPUFRdID0gb3B0XG4gICAgX2VuYWJsZURyYWdnYWJsZS5jYWxsKGRpc3BsYXlPYmplY3QpXG4gICAgZGlzcGxheU9iamVjdC5mYWxsYmFja1RvQm91bmRhcnkgPSBfZmFsbGJhY2tUb0JvdW5kYXJ5XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV3JhcHBlclxuIl19
