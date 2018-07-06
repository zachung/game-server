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

},{"./lib/Application":10,"./scenes/LoadingScene":32}],8:[function(require,module,exports){
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

},{"./PIXI":15}],11:[function(require,module,exports){
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
        console.error('container does NOT has lighting property');
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

},{"../config/constants":8,"./PIXI":15}],13:[function(require,module,exports){
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
    var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    _classCallCheck(this, Map);

    var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this));

    _this.ceilSize = scale * _constants.CEIL_SIZE;
    _this.mapScale = scale;

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

      var ceilSize = this.ceilSize;
      var mapScale = this.mapScale;

      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var id = tiles[j * cols + i];
          var o = (0, _utils.instanceByItemId)(id);
          o.position.set(i * ceilSize, j * ceilSize);
          o.scale.set(mapScale, mapScale);
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
        var _item = _slicedToArray(item, 3),
            type = _item[0],
            pos = _item[1],
            params = _item[2];

        var o = (0, _utils.instanceByItemId)(type, params);
        o.position.set(pos[0] * ceilSize, pos[1] * ceilSize);
        o.scale.set(mapScale, mapScale);
        _this2.map.addChild(o);
        switch (o.type) {
          case _constants.STATIC:
            return;
          case _constants.STAY:
            // 靜態物件
            _this2.collideObjects.push(o);
            break;
          default:
            _this2.replyObjects.push(o);
        }
        o.on('use', function () {
          return _this2.emit('use', o);
        });
        o.on('removed', function () {
          var inx = _this2.replyObjects.indexOf(o);
          _this2.replyObjects.splice(inx, 1);
          delete items[i];
        });
      });
    }
  }, {
    key: 'addPlayer',
    value: function addPlayer(player, toPosition) {
      player.position.set(toPosition[0] * this.ceilSize, toPosition[1] * this.ceilSize);
      player.scale.set(this.mapScale, this.mapScale);
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

},{"../config/constants":8,"../lib/Bump":11,"./PIXI":15,"./utils":19}],14:[function(require,module,exports){
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

},{"events":1}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./PIXI":15}],17:[function(require,module,exports){
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

var Texture = function () {
  function Texture() {
    _classCallCheck(this, Texture);
  }

  _createClass(Texture, null, [{
    key: 'TerrainAtlas',
    get: function get() {
      return _PIXI.resources['images/terrain_atlas.json'];
    }
  }, {
    key: 'BaseOutAtlas',
    get: function get() {
      return _PIXI.resources['images/base_out_atlas.json'];
    }
  }, {
    key: 'Rock',
    get: function get() {
      return Texture.TerrainAtlas.textures['rock.png'];
    }
  }, {
    key: 'Wall',
    get: function get() {
      return Texture.TerrainAtlas.textures['wall.png'];
    }
  }, {
    key: 'Grass',
    get: function get() {
      return Texture.TerrainAtlas.textures['grass.png'];
    }
  }, {
    key: 'Door',
    get: function get() {
      return Texture.BaseOutAtlas.textures['door.png'];
    }
  }, {
    key: 'Torch',
    get: function get() {
      return Texture.BaseOutAtlas.textures['torch.png'];
    }
  }, {
    key: 'Treasure',
    get: function get() {
      return Texture.BaseOutAtlas.textures['treasure.png'];
    }
  }]);

  return Texture;
}();

exports.default = Texture;

},{"../lib/PIXI":15}],18:[function(require,module,exports){
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
      return this.divideScalar(this.length());
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
      var oldLength = this.length();
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
    key: "rad",
    value: function rad() {
      return Math.atan2(this.y, this.x);
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
    key: "deg",
    get: function get() {
      return this.rad() * degrees;
    }
  }], [{
    key: "fromPoint",
    value: function fromPoint(p) {
      return new Vector(p.x, p.y);
    }
  }, {
    key: "fromDegLength",
    value: function fromDegLength(deg, length) {
      var x = length * Math.cos(deg);
      var y = length * Math.sin(deg);
      return new Vector(x, y);
    }
  }]);

  return Vector;
}();

exports.default = Vector;

},{}],19:[function(require,module,exports){
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

var _Torch = require('../objects/Torch');

var _Torch2 = _interopRequireDefault(_Torch);

var _Move = require('../objects/abilities/Move');

var _Move2 = _interopRequireDefault(_Move);

var _Camera = require('../objects/abilities/Camera');

var _Camera2 = _interopRequireDefault(_Camera);

var _Operate = require('../objects/abilities/Operate');

var _Operate2 = _interopRequireDefault(_Operate);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Items = [_Grass2.default, _Wall2.default, _Treasure2.default, _Door2.default, _Torch2.default];

var Abilities = [_Move2.default, _Camera2.default, _Operate2.default];

function instanceByItemId(itemId, params) {
  return new Items[itemId](params);
}

function instanceByAbilityId(abilityId, params) {
  return new Abilities[abilityId](params);
}

},{"../objects/Door":21,"../objects/Grass":23,"../objects/Torch":24,"../objects/Treasure":25,"../objects/Wall":26,"../objects/abilities/Camera":28,"../objects/abilities/Move":30,"../objects/abilities/Operate":31}],20:[function(require,module,exports){
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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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
    var _this = _possibleConstructorReturn(this, (Cat.__proto__ || Object.getPrototypeOf(Cat)).call(this, _Texture2.default.Rock));
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

},{"../lib/Texture":17,"./GameObject":22}],21:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":17,"./GameObject":22}],22:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Messages":14,"../lib/PIXI":15}],23:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/Texture":17,"./GameObject":22}],24:[function(require,module,exports){
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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Torch = function (_GameObject) {
  _inherits(Torch, _GameObject);

  function Torch() {
    _classCallCheck(this, Torch);

    var _this = _possibleConstructorReturn(this, (Torch.__proto__ || Object.getPrototypeOf(Torch)).call(this, _Texture2.default.Torch));

    var radius = 3;

    _this.on('added', _Light2.default.lightOn.bind(null, _this, radius, 0.95));
    _this.on('removeed', _Light2.default.lightOff.bind(null, _this));
    return _this;
  }

  _createClass(Torch, [{
    key: 'type',
    get: function get() {
      return _constants.STATIC;
    }
  }]);

  return Torch;
}(_GameObject3.default);

exports.default = Torch;

},{"../config/constants":8,"../lib/Light":12,"../lib/Texture":17,"./GameObject":22}],25:[function(require,module,exports){
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

var _Texture = require('../lib/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

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

    var _this = _possibleConstructorReturn(this, (Treasure.__proto__ || Object.getPrototypeOf(Treasure)).call(this, _Texture2.default.Treasure));
    // Create the cat sprite


    _this.inventories = inventories.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          abilityId = _ref2[0],
          params = _ref2[1];

      return (0, _utils.instanceByAbilityId)(abilityId, params);
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

        this.parent.removeChild(this);
        this.destroy();
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

},{"../config/constants":8,"../lib/Texture":17,"../lib/utils":19,"./GameObject":22}],26:[function(require,module,exports){
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
    return _possibleConstructorReturn(this, (Wall.__proto__ || Object.getPrototypeOf(Wall)).call(this, _Texture2.default.Wall));
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

},{"../config/constants":8,"../lib/Texture":17,"./GameObject":22}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
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

},{"../../config/constants":8,"../../lib/Light":12,"./Ability":27}],29:[function(require,module,exports){
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

},{"../../config/constants":8,"../../config/control":9,"./Ability":27,"keyboardjs":2}],30:[function(require,module,exports){
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
      // NOTICE: 假設自己是正方形
      var scale = owner.scale.x;
      owner.x += owner.dx * this.value * scale * delta;
      owner.y += owner.dy * this.value * scale * delta;
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

},{"../../config/constants":8,"./Ability":27}],31:[function(require,module,exports){
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

},{"../../config/constants":8,"./Ability":27}],32:[function(require,module,exports){
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
      _PIXI.loader.add('images/terrain_atlas.json').add('images/base_out_atlas.json').load(function () {
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

},{"../lib/PIXI":15,"../lib/Scene":16,"./PlayScene":33}],33:[function(require,module,exports){
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

function getPlayerWindowOpt() {
  var opt = {};
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

      var playerWindow = new _PlayerWindow2.default(Object.assign({
        player: this.cat
      }, getPlayerWindowOpt()));

      uiLayer.addChild(messageWindow);
      uiLayer.addChild(playerWindow);

      if (_constants.IS_MOBILE) {
        // 只有手機要觸控板
        var touchControlPanel = new _TouchControlPanel2.default({
          x: sceneWidth / 4,
          y: sceneHeight * 4 / 6,
          radius: sceneWidth / 10
        });
        touchControlPanel.parentGroup = uiGroup;

        uiLayer.addChild(touchControlPanel);
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
      var mapScale = _constants.IS_MOBILE ? 1 : 0.5;

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

},{"../config/constants":8,"../lib/Map":13,"../lib/PIXI":15,"../lib/Scene":16,"../objects/Cat":20,"../objects/abilities/Camera":28,"../objects/abilities/KeyMove":29,"../objects/abilities/Move":30,"../objects/abilities/Operate":31,"../ui/MessageWindow":34,"../ui/PlayerWindow":35,"../ui/TouchControlPanel":37}],34:[function(require,module,exports){
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

},{"../lib/Messages":14,"../lib/PIXI":15,"./ScrollableWindow":36}],35:[function(require,module,exports){
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

},{"../config/constants":8,"../lib/PIXI":15,"./Window":38}],36:[function(require,module,exports){
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

},{"../lib/PIXI":15,"./Window":38,"./Wrapper":39}],37:[function(require,module,exports){
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
  }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var ALL_KEYS = [_control.RIGHT, _control.LEFT, _control.UP, _control.DOWN];

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
    _this.radius = radius;

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
      return 'TouchControlPanel';
    }
  }]);

  return TouchControlPanel;
}(_PIXI.Container);

exports.default = TouchControlPanel;

},{"../config/control":9,"../lib/PIXI":15,"../lib/Vector":18,"keyboardjs":2}],38:[function(require,module,exports){
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

},{"../lib/PIXI":15}],39:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2tleWJvYXJkanMvbGliL2tleS1jb21iby5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9rZXlib2FyZC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9sb2NhbGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMva2V5Ym9hcmRqcy9sb2NhbGVzL3VzLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jb25maWcvY29uc3RhbnRzLmpzIiwic3JjL2NvbmZpZy9jb250cm9sLmpzIiwic3JjL2xpYi9BcHBsaWNhdGlvbi5qcyIsInNyYy9saWIvQnVtcC5qcyIsInNyYy9saWIvTGlnaHQuanMiLCJzcmMvbGliL01hcC5qcyIsInNyYy9saWIvTWVzc2FnZXMuanMiLCJzcmMvbGliL1BJWEkuanMiLCJzcmMvbGliL1NjZW5lLmpzIiwic3JjL2xpYi9UZXh0dXJlLmpzIiwic3JjL2xpYi9WZWN0b3IuanMiLCJzcmMvbGliL3V0aWxzLmpzIiwic3JjL29iamVjdHMvQ2F0LmpzIiwic3JjL29iamVjdHMvRG9vci5qcyIsInNyYy9vYmplY3RzL0dhbWVPYmplY3QuanMiLCJzcmMvb2JqZWN0cy9HcmFzcy5qcyIsInNyYy9vYmplY3RzL1RvcmNoLmpzIiwic3JjL29iamVjdHMvVHJlYXN1cmUuanMiLCJzcmMvb2JqZWN0cy9XYWxsLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0tleU1vdmUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvTW92ZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9PcGVyYXRlLmpzIiwic3JjL3NjZW5lcy9Mb2FkaW5nU2NlbmUuanMiLCJzcmMvc2NlbmVzL1BsYXlTY2VuZS5qcyIsInNyYy91aS9NZXNzYWdlV2luZG93LmpzIiwic3JjL3VpL1BsYXllcldpbmRvdy5qcyIsInNyYy91aS9TY3JvbGxhYmxlV2luZG93LmpzIiwic3JjL3VpL1RvdWNoQ29udHJvbFBhbmVsLmpzIiwic3JjL3VpL1dpbmRvdy5qcyIsInNyYy91aS9XcmFwcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcEpBLElBQUEsZUFBQSxRQUFBLG1CQUFBLENBQUE7Ozs7QUFDQSxJQUFBLGdCQUFBLFFBQUEsdUJBQUEsQ0FBQTs7Ozs7Ozs7QUFFQTtBQUNBLElBQUksTUFBTSxJQUFJLGNBQUosT0FBQSxDQUFnQjtBQUN4QixTQUR3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QUEsR0FBUyxLQUFBLEdBQUEsQ0FBUyxLQUFULENBQUEsRUFBaUIsU0FBMUIsQ0FBUyxDQUFUO0FBQ0EsT0FBQSxDQUFBLEdBQVMsS0FBQSxHQUFBLENBQVMsS0FBVCxDQUFBLEVBQWlCLFNBQUEsQ0FBQSxHQUFhLFNBQWIsS0FBQSxHQUExQixLQUFTLENBQVQ7QUFDQSxPQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBUyxLQUFULENBQUEsRUFBaUIsU0FBMUIsQ0FBUyxDQUFUO0FBQ0EsT0FBQSxDQUFBLEdBQVMsS0FBQSxHQUFBLENBQVMsS0FBVCxDQUFBLEVBQWlCLFNBQUEsQ0FBQSxHQUFhLFNBQWIsTUFBQSxHQUExQixNQUFTLENBQVQ7QUFDRDs7SUFDSyxVOzs7Ozs7OztBQUNKOzs7Ozs7Ozs4QkFRa0IsYSxFQUFlLEcsRUFBSztBQUNwQyxvQkFBQSxHQUFBLElBQUEsR0FBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQSxhQUFBO0FBQ0Esb0JBQUEsa0JBQUEsR0FBQSxtQkFBQTtBQUNEOzs7Ozs7a0JBR1ksTyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgb2JqZWN0Q3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBvYmplY3RDcmVhdGVQb2x5ZmlsbFxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBvYmplY3RLZXlzUG9seWZpbGxcbnZhciBiaW5kID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgfHwgZnVuY3Rpb25CaW5kUG9seWZpbGxcblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfZXZlbnRzJykpIHtcbiAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxudmFyIGhhc0RlZmluZVByb3BlcnR5O1xudHJ5IHtcbiAgdmFyIG8gPSB7fTtcbiAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sICd4JywgeyB2YWx1ZTogMCB9KTtcbiAgaGFzRGVmaW5lUHJvcGVydHkgPSBvLnggPT09IDA7XG59IGNhdGNoIChlcnIpIHsgaGFzRGVmaW5lUHJvcGVydHkgPSBmYWxzZSB9XG5pZiAoaGFzRGVmaW5lUHJvcGVydHkpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50RW1pdHRlciwgJ2RlZmF1bHRNYXhMaXN0ZW5lcnMnLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGUgaW5wdXQgaXMgYSBwb3NpdGl2ZSBudW1iZXIgKHdob3NlIHZhbHVlIGlzIHplcm8gb3JcbiAgICAgIC8vIGdyZWF0ZXIgYW5kIG5vdCBhIE5hTikuXG4gICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ251bWJlcicgfHwgYXJnIDwgMCB8fCBhcmcgIT09IGFyZylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJkZWZhdWx0TWF4TGlzdGVuZXJzXCIgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICAgICAgZGVmYXVsdE1heExpc3RlbmVycyA9IGFyZztcbiAgICB9XG4gIH0pO1xufSBlbHNlIHtcbiAgRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xufVxuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiblwiIGFyZ3VtZW50IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiAkZ2V0TWF4TGlzdGVuZXJzKHRoYXQpIHtcbiAgaWYgKHRoYXQuX21heExpc3RlbmVycyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgcmV0dXJuIHRoYXQuX21heExpc3RlbmVycztcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiAkZ2V0TWF4TGlzdGVuZXJzKHRoaXMpO1xufTtcblxuLy8gVGhlc2Ugc3RhbmRhbG9uZSBlbWl0KiBmdW5jdGlvbnMgYXJlIHVzZWQgdG8gb3B0aW1pemUgY2FsbGluZyBvZiBldmVudFxuLy8gaGFuZGxlcnMgZm9yIGZhc3QgY2FzZXMgYmVjYXVzZSBlbWl0KCkgaXRzZWxmIG9mdGVuIGhhcyBhIHZhcmlhYmxlIG51bWJlciBvZlxuLy8gYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYmVjYXVzZSBvZiB0aGF0LiBUaGVzZSBmdW5jdGlvbnMgYWx3YXlzIGhhdmVcbi8vIHRoZSBzYW1lIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIHRodXMgZG8gbm90IGdldCBkZW9wdGltaXplZCwgc28gdGhlIGNvZGVcbi8vIGluc2lkZSB0aGVtIGNhbiBleGVjdXRlIGZhc3Rlci5cbmZ1bmN0aW9uIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHNlbGYpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRPbmUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSkge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMiwgYXJnMykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmdzKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuYXBwbHkoc2VsZiwgYXJncyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBldmVudHM7XG4gIHZhciBkb0Vycm9yID0gKHR5cGUgPT09ICdlcnJvcicpO1xuXG4gIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgaWYgKGV2ZW50cylcbiAgICBkb0Vycm9yID0gKGRvRXJyb3IgJiYgZXZlbnRzLmVycm9yID09IG51bGwpO1xuICBlbHNlIGlmICghZG9FcnJvcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAoZG9FcnJvcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSlcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5oYW5kbGVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBoYW5kbGVyID0gZXZlbnRzW3R5cGVdO1xuXG4gIGlmICghaGFuZGxlcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGlzRm4gPSB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJztcbiAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgc3dpdGNoIChsZW4pIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICBjYXNlIDE6XG4gICAgICBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIGVtaXRPbmUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzpcbiAgICAgIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA0OlxuICAgICAgZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdLCBhcmd1bWVudHNbM10pO1xuICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICBkZWZhdWx0OlxuICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgdmFyIG07XG4gIHZhciBldmVudHM7XG4gIHZhciBleGlzdGluZztcblxuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgaWYgKCFldmVudHMpIHtcbiAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0YXJnZXQuX2V2ZW50c0NvdW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgICBpZiAoZXZlbnRzLm5ld0xpc3RlbmVyKSB7XG4gICAgICB0YXJnZXQuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgICAgIC8vIFJlLWFzc2lnbiBgZXZlbnRzYCBiZWNhdXNlIGEgbmV3TGlzdGVuZXIgaGFuZGxlciBjb3VsZCBoYXZlIGNhdXNlZCB0aGVcbiAgICAgIC8vIHRoaXMuX2V2ZW50cyB0byBiZSBhc3NpZ25lZCB0byBhIG5ldyBvYmplY3RcbiAgICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICAgIH1cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIGlmICghZXhpc3RpbmcpIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICAgICsrdGFyZ2V0Ll9ldmVudHNDb3VudDtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGV4aXN0aW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID1cbiAgICAgICAgICBwcmVwZW5kID8gW2xpc3RlbmVyLCBleGlzdGluZ10gOiBbZXhpc3RpbmcsIGxpc3RlbmVyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgICAgaWYgKHByZXBlbmQpIHtcbiAgICAgICAgZXhpc3RpbmcudW5zaGlmdChsaXN0ZW5lcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleGlzdGluZy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIGlmICghZXhpc3Rpbmcud2FybmVkKSB7XG4gICAgICBtID0gJGdldE1heExpc3RlbmVycyh0YXJnZXQpO1xuICAgICAgaWYgKG0gJiYgbSA+IDAgJiYgZXhpc3RpbmcubGVuZ3RoID4gbSkge1xuICAgICAgICBleGlzdGluZy53YXJuZWQgPSB0cnVlO1xuICAgICAgICB2YXIgdyA9IG5ldyBFcnJvcignUG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSBsZWFrIGRldGVjdGVkLiAnICtcbiAgICAgICAgICAgIGV4aXN0aW5nLmxlbmd0aCArICcgXCInICsgU3RyaW5nKHR5cGUpICsgJ1wiIGxpc3RlbmVycyAnICtcbiAgICAgICAgICAgICdhZGRlZC4gVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gJyArXG4gICAgICAgICAgICAnaW5jcmVhc2UgbGltaXQuJyk7XG4gICAgICAgIHcubmFtZSA9ICdNYXhMaXN0ZW5lcnNFeGNlZWRlZFdhcm5pbmcnO1xuICAgICAgICB3LmVtaXR0ZXIgPSB0YXJnZXQ7XG4gICAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICAgIHcuY291bnQgPSBleGlzdGluZy5sZW5ndGg7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCcgJiYgY29uc29sZS53YXJuKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCclczogJXMnLCB3Lm5hbWUsIHcubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24gYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZExpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIHRydWUpO1xuICAgIH07XG5cbmZ1bmN0aW9uIG9uY2VXcmFwcGVyKCkge1xuICBpZiAoIXRoaXMuZmlyZWQpIHtcbiAgICB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMud3JhcEZuKTtcbiAgICB0aGlzLmZpcmVkID0gdHJ1ZTtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCk7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSk7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0sXG4gICAgICAgICAgICBhcmd1bWVudHNbMl0pO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSlcbiAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB0aGlzLmxpc3RlbmVyLmFwcGx5KHRoaXMudGFyZ2V0LCBhcmdzKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHN0YXRlID0geyBmaXJlZDogZmFsc2UsIHdyYXBGbjogdW5kZWZpbmVkLCB0YXJnZXQ6IHRhcmdldCwgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyIH07XG4gIHZhciB3cmFwcGVkID0gYmluZC5jYWxsKG9uY2VXcmFwcGVyLCBzdGF0ZSk7XG4gIHdyYXBwZWQubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgc3RhdGUud3JhcEZuID0gd3JhcHBlZDtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIHRoaXMub24odHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kT25jZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kT25jZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB0aGlzLnByZXBlbmRMaXN0ZW5lcih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbi8vIEVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZiBhbmQgb25seSBpZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGxpc3QsIGV2ZW50cywgcG9zaXRpb24sIGksIG9yaWdpbmFsTGlzdGVuZXI7XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBsaXN0ID0gZXZlbnRzW3R5cGVdO1xuICAgICAgaWYgKCFsaXN0KVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8IGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3QubGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaXN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBvc2l0aW9uID0gLTE7XG5cbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fCBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgb3JpZ2luYWxMaXN0ZW5lciA9IGxpc3RbaV0ubGlzdGVuZXI7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMClcbiAgICAgICAgICBsaXN0LnNoaWZ0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzcGxpY2VPbmUobGlzdCwgcG9zaXRpb24pO1xuXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSlcbiAgICAgICAgICBldmVudHNbdHlwZV0gPSBsaXN0WzBdO1xuXG4gICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIG9yaWdpbmFsTGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsIGV2ZW50cywgaTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gICAgICBpZiAoIWV2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRzW3R5cGVdKSB7XG4gICAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IG9iamVjdEtleXMoZXZlbnRzKTtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbGlzdGVuZXJzID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gICAgICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgICAgICAvLyBMSUZPIG9yZGVyXG4gICAgICAgIGZvciAoaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5mdW5jdGlvbiBfbGlzdGVuZXJzKHRhcmdldCwgdHlwZSwgdW53cmFwKSB7XG4gIHZhciBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcblxuICBpZiAoIWV2ZW50cylcbiAgICByZXR1cm4gW107XG5cbiAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG4gIGlmICghZXZsaXN0ZW5lcilcbiAgICByZXR1cm4gW107XG5cbiAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB1bndyYXAgPyBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXSA6IFtldmxpc3RlbmVyXTtcblxuICByZXR1cm4gdW53cmFwID8gdW53cmFwTGlzdGVuZXJzKGV2bGlzdGVuZXIpIDogYXJyYXlDbG9uZShldmxpc3RlbmVyLCBldmxpc3RlbmVyLmxlbmd0aCk7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgdHJ1ZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJhd0xpc3RlbmVycyA9IGZ1bmN0aW9uIHJhd0xpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIubGlzdGVuZXJDb3VudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGxpc3RlbmVyQ291bnQuY2FsbChlbWl0dGVyLCB0eXBlKTtcbiAgfVxufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gbGlzdGVuZXJDb3VudDtcbmZ1bmN0aW9uIGxpc3RlbmVyQ291bnQodHlwZSkge1xuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuXG4gIGlmIChldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcblxuICAgIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmIChldmxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHJldHVybiB0aGlzLl9ldmVudHNDb3VudCA+IDAgPyBSZWZsZWN0Lm93bktleXModGhpcy5fZXZlbnRzKSA6IFtdO1xufTtcblxuLy8gQWJvdXQgMS41eCBmYXN0ZXIgdGhhbiB0aGUgdHdvLWFyZyB2ZXJzaW9uIG9mIEFycmF5I3NwbGljZSgpLlxuZnVuY3Rpb24gc3BsaWNlT25lKGxpc3QsIGluZGV4KSB7XG4gIGZvciAodmFyIGkgPSBpbmRleCwgayA9IGkgKyAxLCBuID0gbGlzdC5sZW5ndGg7IGsgPCBuOyBpICs9IDEsIGsgKz0gMSlcbiAgICBsaXN0W2ldID0gbGlzdFtrXTtcbiAgbGlzdC5wb3AoKTtcbn1cblxuZnVuY3Rpb24gYXJyYXlDbG9uZShhcnIsIG4pIHtcbiAgdmFyIGNvcHkgPSBuZXcgQXJyYXkobik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKVxuICAgIGNvcHlbaV0gPSBhcnJbaV07XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiB1bndyYXBMaXN0ZW5lcnMoYXJyKSB7XG4gIHZhciByZXQgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmV0Lmxlbmd0aDsgKytpKSB7XG4gICAgcmV0W2ldID0gYXJyW2ldLmxpc3RlbmVyIHx8IGFycltpXTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBvYmplY3RDcmVhdGVQb2x5ZmlsbChwcm90bykge1xuICB2YXIgRiA9IGZ1bmN0aW9uKCkge307XG4gIEYucHJvdG90eXBlID0gcHJvdG87XG4gIHJldHVybiBuZXcgRjtcbn1cbmZ1bmN0aW9uIG9iamVjdEtleXNQb2x5ZmlsbChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIgayBpbiBvYmopIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrKSkge1xuICAgIGtleXMucHVzaChrKTtcbiAgfVxuICByZXR1cm4gaztcbn1cbmZ1bmN0aW9uIGZ1bmN0aW9uQmluZFBvbHlmaWxsKGNvbnRleHQpIHtcbiAgdmFyIGZuID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cbiIsIlxudmFyIEtleWJvYXJkID0gcmVxdWlyZSgnLi9saWIva2V5Ym9hcmQnKTtcbnZhciBMb2NhbGUgICA9IHJlcXVpcmUoJy4vbGliL2xvY2FsZScpO1xudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9saWIva2V5LWNvbWJvJyk7XG5cbnZhciBrZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xuXG5rZXlib2FyZC5zZXRMb2NhbGUoJ3VzJywgcmVxdWlyZSgnLi9sb2NhbGVzL3VzJykpO1xuXG5leHBvcnRzICAgICAgICAgID0gbW9kdWxlLmV4cG9ydHMgPSBrZXlib2FyZDtcbmV4cG9ydHMuS2V5Ym9hcmQgPSBLZXlib2FyZDtcbmV4cG9ydHMuTG9jYWxlICAgPSBMb2NhbGU7XG5leHBvcnRzLktleUNvbWJvID0gS2V5Q29tYm87XG4iLCJcbmZ1bmN0aW9uIEtleUNvbWJvKGtleUNvbWJvU3RyKSB7XG4gIHRoaXMuc291cmNlU3RyID0ga2V5Q29tYm9TdHI7XG4gIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gIHRoaXMua2V5TmFtZXMgID0gdGhpcy5zdWJDb21ib3MucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIG5leHRTdWJDb21ibykge1xuICAgIHJldHVybiBtZW1vLmNvbmNhdChuZXh0U3ViQ29tYm8pO1xuICB9LCBbXSk7XG59XG5cbi8vIFRPRE86IEFkZCBzdXBwb3J0IGZvciBrZXkgY29tYm8gc2VxdWVuY2VzXG5LZXlDb21iby5zZXF1ZW5jZURlbGltaW5hdG9yID0gJz4+JztcbktleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgICAgPSAnPic7XG5LZXlDb21iby5rZXlEZWxpbWluYXRvciAgICAgID0gJysnO1xuXG5LZXlDb21iby5wYXJzZUNvbWJvU3RyID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIpIHtcbiAgdmFyIHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIHZhciBjb21ibyAgICAgICAgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMCA7IGkgPCBzdWJDb21ib1N0cnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBjb21iby5wdXNoKEtleUNvbWJvLl9zcGxpdFN0cihzdWJDb21ib1N0cnNbaV0sIEtleUNvbWJvLmtleURlbGltaW5hdG9yKSk7XG4gIH1cbiAgcmV0dXJuIGNvbWJvO1xufTtcblxuS2V5Q29tYm8ucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24ocHJlc3NlZEtleU5hbWVzKSB7XG4gIHZhciBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBzdGFydGluZ0tleU5hbWVJbmRleCA9IHRoaXMuX2NoZWNrU3ViQ29tYm8oXG4gICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgIHN0YXJ0aW5nS2V5TmFtZUluZGV4LFxuICAgICAgcHJlc3NlZEtleU5hbWVzXG4gICAgKTtcbiAgICBpZiAoc3RhcnRpbmdLZXlOYW1lSW5kZXggPT09IC0xKSB7IHJldHVybiBmYWxzZTsgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuS2V5Q29tYm8ucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbihvdGhlcktleUNvbWJvKSB7XG4gIGlmIChcbiAgICAhb3RoZXJLZXlDb21ibyB8fFxuICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgaWYgKHR5cGVvZiBvdGhlcktleUNvbWJvID09PSAnc3RyaW5nJykge1xuICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gIH1cblxuICBpZiAodGhpcy5zdWJDb21ib3MubGVuZ3RoICE9PSBvdGhlcktleUNvbWJvLnN1YkNvbWJvcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgIHZhciBvdGhlclN1YkNvbWJvID0gb3RoZXJLZXlDb21iby5zdWJDb21ib3NbaV0uc2xpY2UoMCk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICB2YXIga2V5TmFtZSA9IHN1YkNvbWJvW2pdO1xuICAgICAgdmFyIGluZGV4ICAgPSBvdGhlclN1YkNvbWJvLmluZGV4T2Yoa2V5TmFtZSk7XG5cbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5LZXlDb21iby5fc3BsaXRTdHIgPSBmdW5jdGlvbihzdHIsIGRlbGltaW5hdG9yKSB7XG4gIHZhciBzICA9IHN0cjtcbiAgdmFyIGQgID0gZGVsaW1pbmF0b3I7XG4gIHZhciBjICA9ICcnO1xuICB2YXIgY2EgPSBbXTtcblxuICBmb3IgKHZhciBjaSA9IDA7IGNpIDwgcy5sZW5ndGg7IGNpICs9IDEpIHtcbiAgICBpZiAoY2kgPiAwICYmIHNbY2ldID09PSBkICYmIHNbY2kgLSAxXSAhPT0gJ1xcXFwnKSB7XG4gICAgICBjYS5wdXNoKGMudHJpbSgpKTtcbiAgICAgIGMgPSAnJztcbiAgICAgIGNpICs9IDE7XG4gICAgfVxuICAgIGMgKz0gc1tjaV07XG4gIH1cbiAgaWYgKGMpIHsgY2EucHVzaChjLnRyaW0oKSk7IH1cblxuICByZXR1cm4gY2E7XG59O1xuXG5LZXlDb21iby5wcm90b3R5cGUuX2NoZWNrU3ViQ29tYm8gPSBmdW5jdGlvbihzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICBzdWJDb21ibyA9IHN1YkNvbWJvLnNsaWNlKDApO1xuICBwcmVzc2VkS2V5TmFtZXMgPSBwcmVzc2VkS2V5TmFtZXMuc2xpY2Uoc3RhcnRpbmdLZXlOYW1lSW5kZXgpO1xuXG4gIHZhciBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YkNvbWJvLmxlbmd0aDsgaSArPSAxKSB7XG5cbiAgICB2YXIga2V5TmFtZSA9IHN1YkNvbWJvW2ldO1xuICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgIHZhciBlc2NhcGVkS2V5TmFtZSA9IGtleU5hbWUuc2xpY2UoMSk7XG4gICAgICBpZiAoXG4gICAgICAgIGVzY2FwZWRLZXlOYW1lID09PSBLZXlDb21iby5jb21ib0RlbGltaW5hdG9yIHx8XG4gICAgICAgIGVzY2FwZWRLZXlOYW1lID09PSBLZXlDb21iby5rZXlEZWxpbWluYXRvclxuICAgICAgKSB7XG4gICAgICAgIGtleU5hbWUgPSBlc2NhcGVkS2V5TmFtZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSBwcmVzc2VkS2V5TmFtZXMuaW5kZXhPZihrZXlOYW1lKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgc3ViQ29tYm8uc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgZW5kSW5kZXggPSBpbmRleDtcbiAgICAgIH1cbiAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGVuZEluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Q29tYm87XG4iLCJcbnZhciBMb2NhbGUgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9rZXktY29tYm8nKTtcblxuXG5mdW5jdGlvbiBLZXlib2FyZCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcbiAgdGhpcy5fbG9jYWxlICAgICAgICAgICAgICAgPSBudWxsO1xuICB0aGlzLl9jdXJyZW50Q29udGV4dCAgICAgICA9IG51bGw7XG4gIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gIHRoaXMuX2xpc3RlbmVycyAgICAgICAgICAgID0gW107XG4gIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMgICAgID0gW107XG4gIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgICAgICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgICAgICA9ICcnO1xuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgICAgICA9IGZhbHNlO1xuICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nICAgPSBudWxsO1xuICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuICB0aGlzLl9jYWxsZXJIYW5kbGVyICAgICAgICA9IG51bGw7XG5cbiAgdGhpcy5zZXRDb250ZXh0KCdnbG9iYWwnKTtcbiAgdGhpcy53YXRjaCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpO1xufVxuXG5LZXlib2FyZC5wcm90b3R5cGUuc2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxlTmFtZSwgbG9jYWxlQnVpbGRlcikge1xuICB2YXIgbG9jYWxlID0gbnVsbDtcbiAgaWYgKHR5cGVvZiBsb2NhbGVOYW1lID09PSAnc3RyaW5nJykge1xuXG4gICAgaWYgKGxvY2FsZUJ1aWxkZXIpIHtcbiAgICAgIGxvY2FsZSA9IG5ldyBMb2NhbGUobG9jYWxlTmFtZSk7XG4gICAgICBsb2NhbGVCdWlsZGVyKGxvY2FsZSwgdGhpcy5fdGFyZ2V0UGxhdGZvcm0sIHRoaXMuX3RhcmdldFVzZXJBZ2VudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsZSA9IHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gfHwgbnVsbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxlICAgICA9IGxvY2FsZU5hbWU7XG4gICAgbG9jYWxlTmFtZSA9IGxvY2FsZS5fbG9jYWxlTmFtZTtcbiAgfVxuXG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgPSBsb2NhbGU7XG4gIHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gPSBsb2NhbGU7XG4gIGlmIChsb2NhbGUpIHtcbiAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMgPSBsb2NhbGUucHJlc3NlZEtleXM7XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5nZXRMb2NhbGUgPSBmdW5jdGlvbihsb2NhbE5hbWUpIHtcbiAgbG9jYWxOYW1lIHx8IChsb2NhbE5hbWUgPSB0aGlzLl9sb2NhbGUubG9jYWxlTmFtZSk7XG4gIHJldHVybiB0aGlzLl9sb2NhbGVzW2xvY2FsTmFtZV0gfHwgbnVsbDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgPSByZWxlYXNlSGFuZGxlcjtcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgID0gcHJlc3NIYW5kbGVyO1xuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgPSBrZXlDb21ib1N0cjtcbiAgICBrZXlDb21ib1N0ciAgICAgICAgICAgID0gbnVsbDtcbiAgfVxuXG4gIGlmIChcbiAgICBrZXlDb21ib1N0ciAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xuICApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9saXN0ZW5lcnMucHVzaCh7XG4gICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IGtleUNvbWJvU3RyID8gbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSA6IG51bGwsXG4gICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IHByZXNzSGFuZGxlciAgICAgICAgICAgfHwgbnVsbCxcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogcmVsZWFzZUhhbmRsZXIgICAgICAgICB8fCBudWxsLFxuICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlLFxuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlXG4gIH0pO1xufTtcbktleWJvYXJkLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xuS2V5Ym9hcmQucHJvdG90eXBlLm9uICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQ7XG5cbktleWJvYXJkLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmVsZWFzZUhhbmRsZXIgPSBwcmVzc0hhbmRsZXI7XG4gICAgcHJlc3NIYW5kbGVyICAgPSBrZXlDb21ib1N0cjtcbiAgICBrZXlDb21ib1N0ciA9IG51bGw7XG4gIH1cblxuICBpZiAoXG4gICAga2V5Q29tYm9TdHIgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy51bmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcblxuICAgIHZhciBjb21ib01hdGNoZXMgICAgICAgICAgPSAha2V5Q29tYm9TdHIgJiYgIWxpc3RlbmVyLmtleUNvbWJvIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmtleUNvbWJvICYmIGxpc3RlbmVyLmtleUNvbWJvLmlzRXF1YWwoa2V5Q29tYm9TdHIpO1xuICAgIHZhciBwcmVzc0hhbmRsZXJNYXRjaGVzICAgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmVzc0hhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc3NIYW5kbGVyID09PSBsaXN0ZW5lci5wcmVzc0hhbmRsZXI7XG4gICAgdmFyIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcyA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFyZWxlYXNlSGFuZGxlciAmJiAhbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgPT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xuXG4gICAgaWYgKGNvbWJvTWF0Y2hlcyAmJiBwcmVzc0hhbmRsZXJNYXRjaGVzICYmIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcykge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICB9XG4gIH1cbn07XG5LZXlib2FyZC5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUudW5iaW5kO1xuS2V5Ym9hcmQucHJvdG90eXBlLm9mZiAgICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnNldENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSkge1xuICBpZih0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG5cbiAgaWYgKCF0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0pIHtcbiAgICB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0gPSBbXTtcbiAgfVxuICB0aGlzLl9saXN0ZW5lcnMgICAgICA9IHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXTtcbiAgdGhpcy5fY3VycmVudENvbnRleHQgPSBjb250ZXh0TmFtZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9jdXJyZW50Q29udGV4dDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS53aXRoQ29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHROYW1lLCBjYWxsYmFjaykge1xuICB2YXIgcHJldmlvdXNDb250ZXh0TmFtZSA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuICB0aGlzLnNldENvbnRleHQoY29udGV4dE5hbWUpO1xuXG4gIGNhbGxiYWNrKCk7XG5cbiAgdGhpcy5zZXRDb250ZXh0KHByZXZpb3VzQ29udGV4dE5hbWUpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24odGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCB0YXJnZXRQbGF0Zm9ybSwgdGFyZ2V0VXNlckFnZW50KSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdGhpcy5zdG9wKCk7XG5cbiAgaWYgKCF0YXJnZXRXaW5kb3cpIHtcbiAgICBpZiAoIWdsb2JhbC5hZGRFdmVudExpc3RlbmVyICYmICFnbG9iYWwuYXR0YWNoRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgZ2xvYmFsIGZ1bmN0aW9ucyBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50LicpO1xuICAgIH1cbiAgICB0YXJnZXRXaW5kb3cgPSBnbG9iYWw7XG4gIH1cblxuICBpZiAodHlwZW9mIHRhcmdldFdpbmRvdy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICB0YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgICB0YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRFbGVtZW50O1xuICAgIHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdztcbiAgICB0YXJnZXRXaW5kb3cgICAgPSBnbG9iYWw7XG4gIH1cblxuICBpZiAoIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmICF0YXJnZXRXaW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQgbWV0aG9kcyBvbiB0YXJnZXRXaW5kb3cuJyk7XG4gIH1cblxuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuXG4gIHZhciB1c2VyQWdlbnQgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnO1xuICB2YXIgcGxhdGZvcm0gID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICB8fCAnJztcblxuICB0YXJnZXRFbGVtZW50ICAgJiYgdGFyZ2V0RWxlbWVudCAgICE9PSBudWxsIHx8ICh0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3cuZG9jdW1lbnQpO1xuICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XG4gIHRhcmdldFVzZXJBZ2VudCAmJiB0YXJnZXRVc2VyQWdlbnQgIT09IG51bGwgfHwgKHRhcmdldFVzZXJBZ2VudCA9IHVzZXJBZ2VudCk7XG5cbiAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICBfdGhpcy5faGFuZGxlQ29tbWFuZEJ1ZyhldmVudCwgcGxhdGZvcm0pO1xuICB9O1xuICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnJlbGVhc2VLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xuICB9O1xuICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnJlbGVhc2VBbGxLZXlzKGV2ZW50KVxuICB9O1xuXG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICB0aGlzLl90YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRFbGVtZW50O1xuICB0aGlzLl90YXJnZXRXaW5kb3cgICAgPSB0YXJnZXRXaW5kb3c7XG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICA9IHRhcmdldFBsYXRmb3JtO1xuICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRVc2VyQWdlbnQ7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIGlmICghdGhpcy5fdGFyZ2V0RWxlbWVudCB8fCAhdGhpcy5fdGFyZ2V0V2luZG93KSB7IHJldHVybjsgfVxuXG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuXG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRFbGVtZW50ID0gbnVsbDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5wcmVzc0tleSA9IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gIHRoaXMuX2xvY2FsZS5wcmVzc0tleShrZXlDb2RlKTtcbiAgdGhpcy5fYXBwbHlCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVsZWFzZUtleSA9IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gIHRoaXMuX2xvY2FsZS5yZWxlYXNlS2V5KGtleUNvZGUpO1xuICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZWxlYXNlQWxsS2V5cyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xuICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7XG4gIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPSAwO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgdGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICB0YXJnZXRFbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl91bmJpbmRFdmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICB0YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgIHRhcmdldEVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2dldEdyb3VwZWRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxpc3RlbmVyR3JvdXBzICAgPSBbXTtcbiAgdmFyIGxpc3RlbmVyR3JvdXBNYXAgPSBbXTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICBpZiAodGhpcy5fY3VycmVudENvbnRleHQgIT09ICdnbG9iYWwnKSB7XG4gICAgbGlzdGVuZXJzID0gW10uY29uY2F0KGxpc3RlbmVycywgdGhpcy5fY29udGV4dHMuZ2xvYmFsKTtcbiAgfVxuXG4gIGxpc3RlbmVycy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gKGIua2V5Q29tYm8gPyBiLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApIC0gKGEua2V5Q29tYm8gPyBhLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApO1xuICB9KS5mb3JFYWNoKGZ1bmN0aW9uKGwpIHtcbiAgICB2YXIgbWFwSW5kZXggPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmIChsaXN0ZW5lckdyb3VwTWFwW2ldID09PSBudWxsICYmIGwua2V5Q29tYm8gPT09IG51bGwgfHxcbiAgICAgICAgICBsaXN0ZW5lckdyb3VwTWFwW2ldICE9PSBudWxsICYmIGxpc3RlbmVyR3JvdXBNYXBbaV0uaXNFcXVhbChsLmtleUNvbWJvKSkge1xuICAgICAgICBtYXBJbmRleCA9IGk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChtYXBJbmRleCA9PT0gLTEpIHtcbiAgICAgIG1hcEluZGV4ID0gbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7XG4gICAgICBsaXN0ZW5lckdyb3VwTWFwLnB1c2gobC5rZXlDb21ibyk7XG4gICAgfVxuICAgIGlmICghbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdKSB7XG4gICAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0gPSBbXTtcbiAgICB9XG4gICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdLnB1c2gobCk7XG4gIH0pO1xuICByZXR1cm4gbGlzdGVuZXJHcm91cHM7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2FwcGx5QmluZGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xuICB2YXIgcHJldmVudFJlcGVhdCA9IGZhbHNlO1xuXG4gIGV2ZW50IHx8IChldmVudCA9IHt9KTtcbiAgZXZlbnQucHJldmVudFJlcGVhdCA9IGZ1bmN0aW9uKCkgeyBwcmV2ZW50UmVwZWF0ID0gdHJ1ZTsgfTtcbiAgZXZlbnQucHJlc3NlZEtleXMgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcblxuICB2YXIgcHJlc3NlZEtleXMgICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG4gIHZhciBsaXN0ZW5lckdyb3VwcyA9IHRoaXMuX2dldEdyb3VwZWRMaXN0ZW5lcnMoKTtcblxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gbGlzdGVuZXJHcm91cHNbaV07XG4gICAgdmFyIGtleUNvbWJvICA9IGxpc3RlbmVyc1swXS5rZXlDb21ibztcblxuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCBrZXlDb21iby5jaGVjayhwcmVzc2VkS2V5cykpIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGlzdGVuZXJzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tqXTtcblxuICAgICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwpIHtcbiAgICAgICAgICBsaXN0ZW5lciA9IHtcbiAgICAgICAgICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBuZXcgS2V5Q29tYm8ocHJlc3NlZEtleXMuam9pbignKycpKSxcbiAgICAgICAgICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBsaXN0ZW5lci5wcmVzc0hhbmRsZXIsXG4gICAgICAgICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIsXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogbGlzdGVuZXIucHJldmVudFJlcGVhdCxcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0ZW5lci5wcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXZlbnRSZXBlYXQpIHtcbiAgICAgICAgICBsaXN0ZW5lci5wcmVzc0hhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgaWYgKHByZXZlbnRSZXBlYXQpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBwcmV2ZW50UmVwZWF0O1xuICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciAmJiB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGtleUNvbWJvKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICB2YXIgaW5kZXggPSBwcmVzc2VkS2V5cy5pbmRleE9mKGtleUNvbWJvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBwcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgaiAtPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9jbGVhckJpbmRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZExpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnNbaV07XG4gICAgdmFyIGtleUNvbWJvID0gbGlzdGVuZXIua2V5Q29tYm87XG4gICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8ICFrZXlDb21iby5jaGVjayh0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMpKSB7XG4gICAgICBpZiAodGhpcy5fY2FsbGVySGFuZGxlciAhPT0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIpIHtcbiAgICAgICAgdmFyIG9sZENhbGxlciA9IHRoaXMuX2NhbGxlckhhbmRsZXI7XG4gICAgICAgIHRoaXMuX2NhbGxlckhhbmRsZXIgPSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcbiAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHQ7XG4gICAgICAgIGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICB0aGlzLl9jYWxsZXJIYW5kbGVyID0gb2xkQ2FsbGVyO1xuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2hhbmRsZUNvbW1hbmRCdWcgPSBmdW5jdGlvbihldmVudCwgcGxhdGZvcm0pIHtcbiAgLy8gT24gTWFjIHdoZW4gdGhlIGNvbW1hbmQga2V5IGlzIGtlcHQgcHJlc3NlZCwga2V5dXAgaXMgbm90IHRyaWdnZXJlZCBmb3IgYW55IG90aGVyIGtleS5cbiAgLy8gSW4gdGhpcyBjYXNlIGZvcmNlIGEga2V5dXAgZm9yIG5vbi1tb2RpZmllciBrZXlzIGRpcmVjdGx5IGFmdGVyIHRoZSBrZXlwcmVzcy5cbiAgdmFyIG1vZGlmaWVyS2V5cyA9IFtcInNoaWZ0XCIsIFwiY3RybFwiLCBcImFsdFwiLCBcImNhcHNsb2NrXCIsIFwidGFiXCIsIFwiY29tbWFuZFwiXTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpICYmIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5pbmNsdWRlcyhcImNvbW1hbmRcIikgJiZcbiAgICAgICFtb2RpZmllcktleXMuaW5jbHVkZXModGhpcy5fbG9jYWxlLmdldEtleU5hbWVzKGV2ZW50LmtleUNvZGUpWzBdKSkge1xuICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyhldmVudCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG4iLCJcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4va2V5LWNvbWJvJyk7XG5cblxuZnVuY3Rpb24gTG9jYWxlKG5hbWUpIHtcbiAgdGhpcy5sb2NhbGVOYW1lICAgICA9IG5hbWU7XG4gIHRoaXMucHJlc3NlZEtleXMgICAgPSBbXTtcbiAgdGhpcy5fYXBwbGllZE1hY3JvcyA9IFtdO1xuICB0aGlzLl9rZXlNYXAgICAgICAgID0ge307XG4gIHRoaXMuX2tpbGxLZXlDb2RlcyAgPSBbXTtcbiAgdGhpcy5fbWFjcm9zICAgICAgICA9IFtdO1xufVxuXG5Mb2NhbGUucHJvdG90eXBlLmJpbmRLZXlDb2RlID0gZnVuY3Rpb24oa2V5Q29kZSwga2V5TmFtZXMpIHtcbiAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ3N0cmluZycpIHtcbiAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gIH1cblxuICB0aGlzLl9rZXlNYXBba2V5Q29kZV0gPSBrZXlOYW1lcztcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuYmluZE1hY3JvID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIGtleU5hbWVzKSB7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAga2V5TmFtZXMgPSBbIGtleU5hbWVzIF07XG4gIH1cblxuICB2YXIgaGFuZGxlciA9IG51bGw7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBoYW5kbGVyID0ga2V5TmFtZXM7XG4gICAga2V5TmFtZXMgPSBudWxsO1xuICB9XG5cbiAgdmFyIG1hY3JvID0ge1xuICAgIGtleUNvbWJvIDogbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSxcbiAgICBrZXlOYW1lcyA6IGtleU5hbWVzLFxuICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICB9O1xuXG4gIHRoaXMuX21hY3Jvcy5wdXNoKG1hY3JvKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuZ2V0S2V5Q29kZXMgPSBmdW5jdGlvbihrZXlOYW1lKSB7XG4gIHZhciBrZXlDb2RlcyA9IFtdO1xuICBmb3IgKHZhciBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX2tleU1hcFtrZXlDb2RlXS5pbmRleE9mKGtleU5hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICB9XG4gIHJldHVybiBrZXlDb2Rlcztcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuZ2V0S2V5TmFtZXMgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLnNldEtpbGxLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMuc2V0S2lsbEtleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5wcmVzc0tleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5wcmVzc0tleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBrZXlOYW1lcyA9IHRoaXMuZ2V0S2V5TmFtZXMoa2V5Q29kZSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMucHJlc3NlZEtleXMucHVzaChrZXlOYW1lc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5fYXBwbHlNYWNyb3MoKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUucmVsZWFzZUtleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICB9XG4gIH1cblxuICBlbHNlIHtcbiAgICB2YXIga2V5TmFtZXMgICAgICAgICA9IHRoaXMuZ2V0S2V5TmFtZXMoa2V5Q29kZSk7XG4gICAgdmFyIGtpbGxLZXlDb2RlSW5kZXggPSB0aGlzLl9raWxsS2V5Q29kZXMuaW5kZXhPZihrZXlDb2RlKTtcbiAgICBcbiAgICBpZiAoa2lsbEtleUNvZGVJbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jbGVhck1hY3JvcygpO1xuICB9XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLl9hcHBseU1hY3JvcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbWFjcm9zID0gdGhpcy5fbWFjcm9zLnNsaWNlKDApO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBtYWNybyA9IG1hY3Jvc1tpXTtcbiAgICBpZiAobWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgIG1hY3JvLmtleU5hbWVzID0gbWFjcm8uaGFuZGxlcih0aGlzLnByZXNzZWRLZXlzKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSkgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5wdXNoKG1hY3JvKTtcbiAgICB9XG4gIH1cbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuX2NsZWFyTWFjcm9zID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZE1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBtYWNybyA9IHRoaXMuX2FwcGxpZWRNYWNyb3NbaV07XG4gICAgaWYgKCFtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgbWFjcm8ua2V5TmFtZXMgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxlO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxvY2FsZSwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xuXG4gIC8vIGdlbmVyYWxcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMsICAgWydjYW5jZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg4LCAgIFsnYmFja3NwYWNlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOSwgICBbJ3RhYiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyLCAgWydjbGVhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzLCAgWydlbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE2LCAgWydzaGlmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE3LCAgWydjdHJsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTgsICBbJ2FsdCcsICdtZW51J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTksICBbJ3BhdXNlJywgJ2JyZWFrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjAsICBbJ2NhcHNsb2NrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjcsICBbJ2VzY2FwZScsICdlc2MnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMiwgIFsnc3BhY2UnLCAnc3BhY2ViYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMywgIFsncGFnZXVwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzQsICBbJ3BhZ2Vkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzUsICBbJ2VuZCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM2LCAgWydob21lJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzcsICBbJ2xlZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOCwgIFsndXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOSwgIFsncmlnaHQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MCwgIFsnZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQxLCAgWydzZWxlY3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MiwgIFsncHJpbnRzY3JlZW4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MywgIFsnZXhlY3V0ZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ0LCAgWydzbmFwc2hvdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ1LCAgWydpbnNlcnQnLCAnaW5zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDYsICBbJ2RlbGV0ZScsICdkZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NywgIFsnaGVscCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NSwgWydzY3JvbGxsb2NrJywgJ3Njcm9sbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4NywgWydlcXVhbCcsICdlcXVhbHNpZ24nLCAnPSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4OCwgWydjb21tYScsICcsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkwLCBbJ3BlcmlvZCcsICcuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkxLCBbJ3NsYXNoJywgJ2ZvcndhcmRzbGFzaCcsICcvJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkyLCBbJ2dyYXZlYWNjZW50JywgJ2AnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMTksIFsnb3BlbmJyYWNrZXQnLCAnWyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMCwgWydiYWNrc2xhc2gnLCAnXFxcXCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMSwgWydjbG9zZWJyYWNrZXQnLCAnXSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMiwgWydhcG9zdHJvcGhlJywgJ1xcJyddKTtcblxuICAvLyAwLTlcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ4LCBbJ3plcm8nLCAnMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ5LCBbJ29uZScsICcxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTAsIFsndHdvJywgJzInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MSwgWyd0aHJlZScsICczJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTIsIFsnZm91cicsICc0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTMsIFsnZml2ZScsICc1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTQsIFsnc2l4JywgJzYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NSwgWydzZXZlbicsICc3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTYsIFsnZWlnaHQnLCAnOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU3LCBbJ25pbmUnLCAnOSddKTtcblxuICAvLyBudW1wYWRcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk2LCBbJ251bXplcm8nLCAnbnVtMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk3LCBbJ251bW9uZScsICdudW0xJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTgsIFsnbnVtdHdvJywgJ251bTInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OSwgWydudW10aHJlZScsICdudW0zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAwLCBbJ251bWZvdXInLCAnbnVtNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMSwgWydudW1maXZlJywgJ251bTUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDIsIFsnbnVtc2l4JywgJ251bTYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDMsIFsnbnVtc2V2ZW4nLCAnbnVtNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNCwgWydudW1laWdodCcsICdudW04J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA1LCBbJ251bW5pbmUnLCAnbnVtOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNiwgWydudW1tdWx0aXBseScsICdudW0qJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA3LCBbJ251bWFkZCcsICdudW0rJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA4LCBbJ251bWVudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA5LCBbJ251bXN1YnRyYWN0JywgJ251bS0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTAsIFsnbnVtZGVjaW1hbCcsICdudW0uJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTExLCBbJ251bWRpdmlkZScsICdudW0vJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ0LCBbJ251bWxvY2snLCAnbnVtJ10pO1xuXG4gIC8vIGZ1bmN0aW9uIGtleXNcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMiwgWydmMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMywgWydmMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNCwgWydmMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNSwgWydmNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNiwgWydmNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNywgWydmNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOCwgWydmNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOSwgWydmOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMCwgWydmOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMSwgWydmMTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjIsIFsnZjExJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIzLCBbJ2YxMiddKTtcblxuICAvLyBzZWNvbmRhcnkga2V5IHN5bWJvbHNcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBgJywgWyd0aWxkZScsICd+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDEnLCBbJ2V4Y2xhbWF0aW9uJywgJ2V4Y2xhbWF0aW9ucG9pbnQnLCAnISddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAyJywgWydhdCcsICdAJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDMnLCBbJ251bWJlcicsICcjJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDQnLCBbJ2RvbGxhcicsICdkb2xsYXJzJywgJ2RvbGxhcnNpZ24nLCAnJCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA1JywgWydwZXJjZW50JywgJyUnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNicsIFsnY2FyZXQnLCAnXiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA3JywgWydhbXBlcnNhbmQnLCAnYW5kJywgJyYnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOCcsIFsnYXN0ZXJpc2snLCAnKiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA5JywgWydvcGVucGFyZW4nLCAnKCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAwJywgWydjbG9zZXBhcmVuJywgJyknXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLScsIFsndW5kZXJzY29yZScsICdfJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArID0nLCBbJ3BsdXMnLCAnKyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBbJywgWydvcGVuY3VybHlicmFjZScsICdvcGVuY3VybHlicmFja2V0JywgJ3snXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXScsIFsnY2xvc2VjdXJseWJyYWNlJywgJ2Nsb3NlY3VybHlicmFja2V0JywgJ30nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFxcXCcsIFsndmVydGljYWxiYXInLCAnfCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA7JywgWydjb2xvbicsICc6J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcJycsIFsncXVvdGF0aW9ubWFyaycsICdcXCcnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgISwnLCBbJ29wZW5hbmdsZWJyYWNrZXQnLCAnPCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAuJywgWydjbG9zZWFuZ2xlYnJhY2tldCcsICc+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC8nLCBbJ3F1ZXN0aW9ubWFyaycsICc/J10pO1xuICBcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSkge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2NvbW1hbmQnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfSBlbHNlIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjdHJsJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH1cblxuICAvL2EteiBhbmQgQS1aXG4gIGZvciAodmFyIGtleUNvZGUgPSA2NTsga2V5Q29kZSA8PSA5MDsga2V5Q29kZSArPSAxKSB7XG4gICAgdmFyIGtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUgKyAzMik7XG4gICAgdmFyIGNhcGl0YWxLZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcbiAgXHRsb2NhbGUuYmluZEtleUNvZGUoa2V5Q29kZSwga2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ2NhcHNsb2NrICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgfVxuXG4gIC8vIGJyb3dzZXIgY2F2ZWF0c1xuICB2YXIgc2VtaWNvbG9uS2V5Q29kZSA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNTkgIDogMTg2O1xuICB2YXIgZGFzaEtleUNvZGUgICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gMTczIDogMTg5O1xuICB2YXIgbGVmdENvbW1hbmRLZXlDb2RlO1xuICB2YXIgcmlnaHRDb21tYW5kS2V5Q29kZTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiAodXNlckFnZW50Lm1hdGNoKCdTYWZhcmknKSB8fCB1c2VyQWdlbnQubWF0Y2goJ0Nocm9tZScpKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSA5MTtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gOTM7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdPcGVyYScpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDE3O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAxNztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAyMjQ7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDIyNDtcbiAgfVxuICBsb2NhbGUuYmluZEtleUNvZGUoc2VtaWNvbG9uS2V5Q29kZSwgICAgWydzZW1pY29sb24nLCAnOyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGRhc2hLZXlDb2RlLCAgICAgICAgIFsnZGFzaCcsICctJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUobGVmdENvbW1hbmRLZXlDb2RlLCAgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ2xlZnRjb21tYW5kJywgJ2xlZnR3aW5kb3dzJywgJ2xlZnR3aW4nLCAnbGVmdHN1cGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUocmlnaHRDb21tYW5kS2V5Q29kZSwgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ3JpZ2h0Y29tbWFuZCcsICdyaWdodHdpbmRvd3MnLCAncmlnaHR3aW4nLCAncmlnaHRzdXBlciddKTtcblxuICAvLyBraWxsIGtleXNcbiAgbG9jYWxlLnNldEtpbGxLZXkoJ2NvbW1hbmQnKTtcbn07XG4iLCJpbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi9saWIvQXBwbGljYXRpb24nXG5pbXBvcnQgTG9hZGluZ1NjZW5lIGZyb20gJy4vc2NlbmVzL0xvYWRpbmdTY2VuZSdcblxuLy8gQ3JlYXRlIGEgUGl4aSBBcHBsaWNhdGlvblxubGV0IGFwcCA9IG5ldyBBcHBsaWNhdGlvbih7XG4gIHdpZHRoOiAyNTYsXG4gIGhlaWdodDogMjU2LFxuICByb3VuZFBpeGVsczogdHJ1ZSxcbiAgYXV0b1Jlc2l6ZTogdHJ1ZSxcbiAgcmVzb2x1dGlvbjogMSxcbiAgYXV0b1N0YXJ0OiBmYWxzZVxufSlcblxuYXBwLnJlbmRlcmVyLnZpZXcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5hcHAucmVuZGVyZXIudmlldy5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuYXBwLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXG4vLyBBZGQgdGhlIGNhbnZhcyB0aGF0IFBpeGkgYXV0b21hdGljYWxseSBjcmVhdGVkIGZvciB5b3UgdG8gdGhlIEhUTUwgZG9jdW1lbnRcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpXG5cbmFwcC5jaGFuZ2VTdGFnZSgpXG5hcHAuc3RhcnQoKVxuYXBwLmNoYW5nZVNjZW5lKExvYWRpbmdTY2VuZSlcbiIsImV4cG9ydCBjb25zdCBJU19NT0JJTEUgPSAoKGEpID0+IC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm8vaS50ZXN0KGEpIHx8XG4gIC8xMjA3fDYzMTB8NjU5MHwzZ3NvfDR0aHB8NTBbMS02XWl8Nzcwc3w4MDJzfGEgd2F8YWJhY3xhYyhlcnxvb3xzLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3LShufHUpfGM1NVxcL3xjYXBpfGNjd2F8Y2RtLXxjZWxsfGNodG18Y2xkY3xjbWQtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjLXN8ZGV2aXxkaWNhfGRtb2J8ZG8oY3xwKW98ZHMoMTJ8LWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseSgtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmLTV8Zy1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkLShtfHB8dCl8aGVpLXxoaShwdHx0YSl8aHAoIGl8aXApfGhzLWN8aHQoYygtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aS0oMjB8Z298bWEpfGkyMzB8aWFjKCB8LXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHwtW2Etd10pfGxpYnd8bHlueHxtMS13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bS1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dCgtfCB8b3x2KXx6eil8bXQoNTB8cDF8diApfG13YnB8bXl3YXxuMTBbMC0yXXxuMjBbMi0zXXxuMzAoMHwyKXxuNTAoMHwyfDUpfG43KDAoMHwxKXwxMCl8bmUoKGN8bSktfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3wtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuLTJ8cG8oY2t8cnR8c2UpfHByb3h8cHNpb3xwdC1nfHFhLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8LVsyLTddfGktKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aC18b298cC0pfHNka1xcL3xzZShjKC18MHwxKXw0N3xtY3xuZHxyaSl8c2doLXxzaGFyfHNpZSgtfG0pfHNrLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aC18di18diApfHN5KDAxfG1iKXx0MigxOHw1MCl8dDYoMDB8MTB8MTgpfHRhKGd0fGxrKXx0Y2wtfHRkZy18dGVsKGl8bSl8dGltLXx0LW1vfHRvKHBsfHNoKXx0cyg3MHxtLXxtM3xtNSl8dHgtOXx1cChcXC5ifGcxfHNpKXx1dHN0fHY0MDB8djc1MHx2ZXJpfHZpKHJnfHRlKXx2ayg0MHw1WzAtM118LXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhcy18eW91cnx6ZXRvfHp0ZS0vaS50ZXN0KGEuc3Vic3RyKDAsIDQpKVxuKShuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgd2luZG93Lm9wZXJhKVxuXG5leHBvcnQgY29uc3QgQ0VJTF9TSVpFID0gMzJcblxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfTU9WRSA9IFN5bWJvbCgnbW92ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9DQU1FUkEgPSBTeW1ib2woJ2NhbWVyYScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9PUEVSQVRFID0gU3ltYm9sKCdvcGVyYXRlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0tFWV9NT1ZFID0gU3ltYm9sKCdrZXktbW92ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9MSUZFID0gU3ltYm9sKCdsaWZlJylcbmV4cG9ydCBjb25zdCBBQklMSVRJRVNfQUxMID0gW1xuICBBQklMSVRZX01PVkUsXG4gIEFCSUxJVFlfQ0FNRVJBLFxuICBBQklMSVRZX09QRVJBVEUsXG4gIEFCSUxJVFlfS0VZX01PVkUsXG4gIEFCSUxJVFlfTElGRVxuXVxuXG4vLyBvYmplY3QgdHlwZSwgc3RhdGljIG9iamVjdCwgbm90IGNvbGxpZGUgd2l0aFxuZXhwb3J0IGNvbnN0IFNUQVRJQyA9ICdzdGF0aWMnXG4vLyBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFZID0gJ3N0YXknXG4vLyB0b3VjaCB3aWxsIHJlcGx5XG5leHBvcnQgY29uc3QgUkVQTFkgPSAncmVwbHknXG4iLCJleHBvcnQgY29uc3QgTEVGVCA9ICdhJ1xuZXhwb3J0IGNvbnN0IFVQID0gJ3cnXG5leHBvcnQgY29uc3QgUklHSFQgPSAnZCdcbmV4cG9ydCBjb25zdCBET1dOID0gJ3MnXG4iLCJpbXBvcnQgeyBBcHBsaWNhdGlvbiBhcyBQaXhpQXBwbGljYXRpb24sIEdyYXBoaWNzLCBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xuXG5jbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIFBpeGlBcHBsaWNhdGlvbiB7XG4gIGNoYW5nZVN0YWdlICgpIHtcbiAgICB0aGlzLnN0YWdlID0gbmV3IGRpc3BsYXkuU3RhZ2UoKVxuICB9XG5cbiAgY2hhbmdlU2NlbmUgKFNjZW5lTmFtZSwgcGFyYW1zKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFNjZW5lKSB7XG4gICAgICAvLyBtYXliZSB1c2UgcHJvbWlzZSBmb3IgYW5pbWF0aW9uXG4gICAgICAvLyByZW1vdmUgZ2FtZWxvb3A/XG4gICAgICB0aGlzLmN1cnJlbnRTY2VuZS5kZXN0cm95KClcbiAgICAgIHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQodGhpcy5jdXJyZW50U2NlbmUpXG4gICAgfVxuXG4gICAgbGV0IHNjZW5lID0gbmV3IFNjZW5lTmFtZShwYXJhbXMpXG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChzY2VuZSlcbiAgICBzY2VuZS5jcmVhdGUoKVxuICAgIHNjZW5lLm9uKCdjaGFuZ2VTY2VuZScsIHRoaXMuY2hhbmdlU2NlbmUuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuY3VycmVudFNjZW5lID0gc2NlbmVcbiAgfVxuXG4gIHN0YXJ0ICguLi5hcmdzKSB7XG4gICAgc3VwZXIuc3RhcnQoLi4uYXJncylcblxuICAgIC8vIGNyZWF0ZSBhIGJhY2tncm91bmQgbWFrZSBzdGFnZSBoYXMgd2lkdGggJiBoZWlnaHRcbiAgICBsZXQgdmlldyA9IHRoaXMucmVuZGVyZXIudmlld1xuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoXG4gICAgICBuZXcgR3JhcGhpY3MoKS5kcmF3UmVjdCgwLCAwLCB2aWV3LndpZHRoLCB2aWV3LmhlaWdodClcbiAgICApXG5cbiAgICAvLyBTdGFydCB0aGUgZ2FtZSBsb29wXG4gICAgdGhpcy50aWNrZXIuYWRkKGRlbHRhID0+IHRoaXMuZ2FtZUxvb3AuYmluZCh0aGlzKShkZWx0YSkpXG4gIH1cblxuICBnYW1lTG9vcCAoZGVsdGEpIHtcbiAgICAvLyBVcGRhdGUgdGhlIGN1cnJlbnQgZ2FtZSBzdGF0ZTpcbiAgICB0aGlzLmN1cnJlbnRTY2VuZS50aWNrKGRlbHRhKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcGxpY2F0aW9uXG4iLCIvKiBnbG9iYWwgUElYSSwgQnVtcCAqL1xuXG5leHBvcnQgZGVmYXVsdCBuZXcgQnVtcChQSVhJKVxuIiwiaW1wb3J0IHsgR3JhcGhpY3MgfSBmcm9tICcuL1BJWEknXG5pbXBvcnQgeyBDRUlMX1NJWkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jb25zdCBMSUdIVCA9IFN5bWJvbCgnbGlnaHQnKVxuXG5jbGFzcyBMaWdodCB7XG4gIHN0YXRpYyBsaWdodE9uICh0YXJnZXQsIHJhZGl1cywgcmFuZCA9IDEpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGFyZ2V0LnBhcmVudFxuICAgIGlmICghY29udGFpbmVyLmxpZ2h0aW5nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdjb250YWluZXIgZG9lcyBOT1QgaGFzIGxpZ2h0aW5nIHByb3BlcnR5JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgbGlnaHRidWxiID0gbmV3IEdyYXBoaWNzKClcbiAgICB2YXIgcnIgPSAweGZmXG4gICAgdmFyIHJnID0gMHhmZlxuICAgIHZhciByYiA9IDB4ZmZcbiAgICB2YXIgcmFkID0gcmFkaXVzICogQ0VJTF9TSVpFXG5cbiAgICBsZXQgeCA9IHRhcmdldC53aWR0aCAvIDIgLyB0YXJnZXQuc2NhbGUueFxuICAgIGxldCB5ID0gdGFyZ2V0LmhlaWdodCAvIDIgLyB0YXJnZXQuc2NhbGUueVxuICAgIGxpZ2h0YnVsYi5iZWdpbkZpbGwoKHJyIDw8IDE2KSArIChyZyA8PCA4KSArIHJiLCAxLjApXG4gICAgbGlnaHRidWxiLmRyYXdDaXJjbGUoeCwgeSwgcmFkKVxuICAgIGxpZ2h0YnVsYi5lbmRGaWxsKClcbiAgICBsaWdodGJ1bGIucGFyZW50TGF5ZXIgPSBjb250YWluZXIubGlnaHRpbmcgLy8gbXVzdCBoYXMgcHJvcGVydHk6IGxpZ2h0aW5nXG5cbiAgICB0YXJnZXRbTElHSFRdID0ge1xuICAgICAgbGlnaHQ6IGxpZ2h0YnVsYlxuICAgIH1cbiAgICB0YXJnZXQuYWRkQ2hpbGQobGlnaHRidWxiKVxuXG4gICAgaWYgKHJhbmQgIT09IDEpIHtcbiAgICAgIGxldCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IGRTY2FsZSA9IE1hdGgucmFuZG9tKCkgKiAoMSAtIHJhbmQpXG4gICAgICAgIGlmIChsaWdodGJ1bGIuc2NhbGUueCA+IDEpIHtcbiAgICAgICAgICBkU2NhbGUgPSAtZFNjYWxlXG4gICAgICAgIH1cbiAgICAgICAgbGlnaHRidWxiLnNjYWxlLnggKz0gZFNjYWxlXG4gICAgICAgIGxpZ2h0YnVsYi5zY2FsZS55ICs9IGRTY2FsZVxuICAgICAgICBsaWdodGJ1bGIuYWxwaGEgKz0gZFNjYWxlXG4gICAgICB9LCAxMDAwIC8gMTIpXG4gICAgICB0YXJnZXRbTElHSFRdLmludGVydmFsID0gaW50ZXJ2YWxcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbGlnaHRPZmYgKHRhcmdldCkge1xuICAgIC8vIHJlbW92ZSBsaWdodFxuICAgIHRhcmdldC5yZW1vdmVDaGlsZCh0YXJnZXRbTElHSFRdLmxpZ2h0KVxuICAgIC8vIHJlbW92ZSBpbnRlcnZhbFxuICAgIGNsZWFySW50ZXJ2YWwodGFyZ2V0W0xJR0hUXS5pbnRlcnZhbClcbiAgICBkZWxldGUgdGFyZ2V0W0xJR0hUXVxuICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgIHRhcmdldC5vZmYoJ3JlbW92ZWQnLCBMaWdodC5saWdodE9mZilcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaWdodFxuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBkaXNwbGF5LCBCTEVORF9NT0RFUywgU3ByaXRlIH0gZnJvbSAnLi9QSVhJJ1xyXG5cclxuaW1wb3J0IHsgU1RBWSwgU1RBVElDLCBDRUlMX1NJWkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBpbnN0YW5jZUJ5SXRlbUlkIH0gZnJvbSAnLi91dGlscydcclxuaW1wb3J0IGJ1bXAgZnJvbSAnLi4vbGliL0J1bXAnXHJcblxyXG4vKipcclxuICogZXZlbnRzOlxyXG4gKiAgdXNlOiBvYmplY3RcclxuICovXHJcbmNsYXNzIE1hcCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKHNjYWxlID0gMSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5jZWlsU2l6ZSA9IHNjYWxlICogQ0VJTF9TSVpFXHJcbiAgICB0aGlzLm1hcFNjYWxlID0gc2NhbGVcclxuXHJcbiAgICB0aGlzLmNvbGxpZGVPYmplY3RzID0gW11cclxuICAgIHRoaXMucmVwbHlPYmplY3RzID0gW11cclxuICAgIHRoaXMubWFwID0gbmV3IENvbnRhaW5lcigpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMubWFwKVxyXG5cclxuICAgIHRoaXMub25jZSgnYWRkZWQnLCB0aGlzLmVuYWJsZUZvZy5iaW5kKHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgZW5hYmxlRm9nICgpIHtcclxuICAgIGxldCBsaWdodGluZyA9IG5ldyBkaXNwbGF5LkxheWVyKClcclxuICAgIGxpZ2h0aW5nLm9uKCdkaXNwbGF5JywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgZWxlbWVudC5ibGVuZE1vZGUgPSBCTEVORF9NT0RFUy5BRERcclxuICAgIH0pXHJcbiAgICBsaWdodGluZy51c2VSZW5kZXJUZXh0dXJlID0gdHJ1ZVxyXG4gICAgbGlnaHRpbmcuY2xlYXJDb2xvciA9IFswLCAwLCAwLCAxXSAvLyBhbWJpZW50IGdyYXlcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nKVxyXG5cclxuICAgIHZhciBsaWdodGluZ1Nwcml0ZSA9IG5ldyBTcHJpdGUobGlnaHRpbmcuZ2V0UmVuZGVyVGV4dHVyZSgpKVxyXG4gICAgbGlnaHRpbmdTcHJpdGUuYmxlbmRNb2RlID0gQkxFTkRfTU9ERVMuTVVMVElQTFlcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nU3ByaXRlKVxyXG5cclxuICAgIHRoaXMubWFwLmxpZ2h0aW5nID0gbGlnaHRpbmdcclxuICB9XHJcblxyXG4gIC8vIOa2iOmZpOi/t+mcp1xyXG4gIGRpc2FibGVGb2cgKCkge1xyXG4gICAgdGhpcy5saWdodGluZy5jbGVhckNvbG9yID0gWzEsIDEsIDEsIDFdXHJcbiAgfVxyXG5cclxuICBsb2FkIChtYXBEYXRhKSB7XHJcbiAgICBsZXQgdGlsZXMgPSBtYXBEYXRhLnRpbGVzXHJcbiAgICBsZXQgY29scyA9IG1hcERhdGEuY29sc1xyXG4gICAgbGV0IHJvd3MgPSBtYXBEYXRhLnJvd3NcclxuICAgIGxldCBpdGVtcyA9IG1hcERhdGEuaXRlbXNcclxuXHJcbiAgICBsZXQgY2VpbFNpemUgPSB0aGlzLmNlaWxTaXplXHJcbiAgICBsZXQgbWFwU2NhbGUgPSB0aGlzLm1hcFNjYWxlXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xzOyBpKyspIHtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dzOyBqKyspIHtcclxuICAgICAgICBsZXQgaWQgPSB0aWxlc1tqICogY29scyArIGldXHJcbiAgICAgICAgbGV0IG8gPSBpbnN0YW5jZUJ5SXRlbUlkKGlkKVxyXG4gICAgICAgIG8ucG9zaXRpb24uc2V0KGkgKiBjZWlsU2l6ZSwgaiAqIGNlaWxTaXplKVxyXG4gICAgICAgIG8uc2NhbGUuc2V0KG1hcFNjYWxlLCBtYXBTY2FsZSlcclxuICAgICAgICBzd2l0Y2ggKG8udHlwZSkge1xyXG4gICAgICAgICAgY2FzZSBTVEFZOlxyXG4gICAgICAgICAgICAvLyDpnZzmhYvnianku7ZcclxuICAgICAgICAgICAgdGhpcy5jb2xsaWRlT2JqZWN0cy5wdXNoKG8pXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWFwLmFkZENoaWxkKG8pXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XHJcbiAgICAgIGxldCBbIHR5cGUsIHBvcywgcGFyYW1zIF0gPSBpdGVtXHJcbiAgICAgIGxldCBvID0gaW5zdGFuY2VCeUl0ZW1JZCh0eXBlLCBwYXJhbXMpXHJcbiAgICAgIG8ucG9zaXRpb24uc2V0KHBvc1swXSAqIGNlaWxTaXplLCBwb3NbMV0gKiBjZWlsU2l6ZSlcclxuICAgICAgby5zY2FsZS5zZXQobWFwU2NhbGUsIG1hcFNjYWxlKVxyXG4gICAgICB0aGlzLm1hcC5hZGRDaGlsZChvKVxyXG4gICAgICBzd2l0Y2ggKG8udHlwZSkge1xyXG4gICAgICAgIGNhc2UgU1RBVElDOlxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgY2FzZSBTVEFZOlxyXG4gICAgICAgICAgLy8g6Z2c5oWL54mp5Lu2XHJcbiAgICAgICAgICB0aGlzLmNvbGxpZGVPYmplY3RzLnB1c2gobylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHRoaXMucmVwbHlPYmplY3RzLnB1c2gobylcclxuICAgICAgfVxyXG4gICAgICBvLm9uKCd1c2UnLCAoKSA9PiB0aGlzLmVtaXQoJ3VzZScsIG8pKVxyXG4gICAgICBvLm9uKCdyZW1vdmVkJywgKCkgPT4ge1xyXG4gICAgICAgIGxldCBpbnggPSB0aGlzLnJlcGx5T2JqZWN0cy5pbmRleE9mKG8pXHJcbiAgICAgICAgdGhpcy5yZXBseU9iamVjdHMuc3BsaWNlKGlueCwgMSlcclxuICAgICAgICBkZWxldGUgaXRlbXNbaV1cclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBhZGRQbGF5ZXIgKHBsYXllciwgdG9Qb3NpdGlvbikge1xyXG4gICAgcGxheWVyLnBvc2l0aW9uLnNldChcclxuICAgICAgdG9Qb3NpdGlvblswXSAqIHRoaXMuY2VpbFNpemUsXHJcbiAgICAgIHRvUG9zaXRpb25bMV0gKiB0aGlzLmNlaWxTaXplXHJcbiAgICApXHJcbiAgICBwbGF5ZXIuc2NhbGUuc2V0KHRoaXMubWFwU2NhbGUsIHRoaXMubWFwU2NhbGUpXHJcbiAgICB0aGlzLm1hcC5hZGRDaGlsZChwbGF5ZXIpXHJcblxyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXJcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICB0aGlzLnBsYXllci50aWNrKGRlbHRhKVxyXG5cclxuICAgIC8vIGNvbGxpZGUgZGV0ZWN0XHJcbiAgICB0aGlzLmNvbGxpZGVPYmplY3RzLmZvckVhY2gobyA9PiB7XHJcbiAgICAgIGlmIChidW1wLnJlY3RhbmdsZUNvbGxpc2lvbih0aGlzLnBsYXllciwgbywgdHJ1ZSkpIHtcclxuICAgICAgICBvLmVtaXQoJ2NvbGxpZGUnLCB0aGlzLnBsYXllcilcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLnJlcGx5T2JqZWN0cy5mb3JFYWNoKG8gPT4ge1xyXG4gICAgICBpZiAoYnVtcC5oaXRUZXN0UmVjdGFuZ2xlKHRoaXMucGxheWVyLCBvKSkge1xyXG4gICAgICAgIG8uZW1pdCgnY29sbGlkZScsIHRoaXMucGxheWVyKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLy8gZm9nIOeahCBwYXJlbnQgY29udGFpbmVyIOS4jeiDveiiq+enu+WLlSjmnIPpjK/kvY0p77yM5Zug5q2k5pS55oiQ5L+u5pS5IG1hcCDkvY3nva5cclxuICBnZXQgcG9zaXRpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWFwLnBvc2l0aW9uXHJcbiAgfVxyXG5cclxuICBnZXQgeCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXAueFxyXG4gIH1cclxuXHJcbiAgZ2V0IHkgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWFwLnlcclxuICB9XHJcblxyXG4gIHNldCB4ICh4KSB7XHJcbiAgICB0aGlzLm1hcC54ID0geFxyXG4gIH1cclxuXHJcbiAgc2V0IHkgKHkpIHtcclxuICAgIHRoaXMubWFwLnkgPSB5XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXBcclxuIiwiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnXG5cbmNvbnN0IE1BWF9NRVNTQUdFX0NPVU5UID0gNTAwXG5cbmNsYXNzIE1lc3NhZ2VzIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLl9tZXNzYWdlcyA9IFtdXG4gIH1cblxuICBnZXQgbGlzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzXG4gIH1cblxuICBhZGQgKG1zZykge1xuICAgIGxldCBsZW5ndGggPSB0aGlzLl9tZXNzYWdlcy51bnNoaWZ0KG1zZylcbiAgICBpZiAobGVuZ3RoID4gTUFYX01FU1NBR0VfQ09VTlQpIHtcbiAgICAgIHRoaXMuX21lc3NhZ2VzLnBvcCgpXG4gICAgfVxuICAgIHRoaXMuZW1pdCgnbW9kaWZpZWQnKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBNZXNzYWdlcygpXG4iLCIvKiBnbG9iYWwgUElYSSAqL1xuXG5leHBvcnQgY29uc3QgQXBwbGljYXRpb24gPSBQSVhJLkFwcGxpY2F0aW9uXG5leHBvcnQgY29uc3QgQ29udGFpbmVyID0gUElYSS5Db250YWluZXJcbmV4cG9ydCBjb25zdCBsb2FkZXIgPSBQSVhJLmxvYWRlclxuZXhwb3J0IGNvbnN0IHJlc291cmNlcyA9IFBJWEkubG9hZGVyLnJlc291cmNlc1xuZXhwb3J0IGNvbnN0IFNwcml0ZSA9IFBJWEkuU3ByaXRlXG5leHBvcnQgY29uc3QgVGV4dCA9IFBJWEkuVGV4dFxuZXhwb3J0IGNvbnN0IFRleHRTdHlsZSA9IFBJWEkuVGV4dFN0eWxlXG5cbmV4cG9ydCBjb25zdCBHcmFwaGljcyA9IFBJWEkuR3JhcGhpY3NcbmV4cG9ydCBjb25zdCBCTEVORF9NT0RFUyA9IFBJWEkuQkxFTkRfTU9ERVNcbmV4cG9ydCBjb25zdCBkaXNwbGF5ID0gUElYSS5kaXNwbGF5XG5leHBvcnQgY29uc3QgdXRpbHMgPSBQSVhJLnV0aWxzXG4iLCJpbXBvcnQgeyBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIGRpc3BsYXkuTGF5ZXIge1xuICBjcmVhdGUgKCkge31cblxuICBkZXN0cm95ICgpIHt9XG5cbiAgdGljayAoZGVsdGEpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lXG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY2xhc3MgVGV4dHVyZSB7XG4gIHN0YXRpYyBnZXQgVGVycmFpbkF0bGFzICgpIHtcbiAgICByZXR1cm4gcmVzb3VyY2VzWydpbWFnZXMvdGVycmFpbl9hdGxhcy5qc29uJ11cbiAgfVxuICBzdGF0aWMgZ2V0IEJhc2VPdXRBdGxhcyAoKSB7XG4gICAgcmV0dXJuIHJlc291cmNlc1snaW1hZ2VzL2Jhc2Vfb3V0X2F0bGFzLmpzb24nXVxuICB9XG4gIHN0YXRpYyBnZXQgUm9jayAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydyb2NrLnBuZyddXG4gIH1cbiAgc3RhdGljIGdldCBXYWxsICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ3dhbGwucG5nJ11cbiAgfVxuICBzdGF0aWMgZ2V0IEdyYXNzICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2dyYXNzLnBuZyddXG4gIH1cbiAgc3RhdGljIGdldCBEb29yICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ2Rvb3IucG5nJ11cbiAgfVxuICBzdGF0aWMgZ2V0IFRvcmNoICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ3RvcmNoLnBuZyddXG4gIH1cbiAgc3RhdGljIGdldCBUcmVhc3VyZSAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuQmFzZU91dEF0bGFzLnRleHR1cmVzWyd0cmVhc3VyZS5wbmcnXVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHR1cmVcbiIsImNvbnN0IGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJXG5cbmNsYXNzIFZlY3RvciB7XG4gIGNvbnN0cnVjdG9yICh4LCB5KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUG9pbnQgKHApIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihwLngsIHAueSlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tRGVnTGVuZ3RoIChkZWcsIGxlbmd0aCkge1xuICAgIGxldCB4ID0gbGVuZ3RoICogTWF0aC5jb3MoZGVnKVxuICAgIGxldCB5ID0gbGVuZ3RoICogTWF0aC5zaW4oZGVnKVxuICAgIHJldHVybiBuZXcgVmVjdG9yKHgsIHkpXG4gIH1cblxuICBjbG9uZSAoKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnkpXG4gIH1cblxuICBhZGQgKHYpIHtcbiAgICB0aGlzLnggKz0gdi54XG4gICAgdGhpcy55ICs9IHYueVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdWIgKHYpIHtcbiAgICB0aGlzLnggLT0gdi54XG4gICAgdGhpcy55IC09IHYueVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbnZlcnQgKCkge1xuICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKC0xKVxuICB9XG5cbiAgbXVsdGlwbHlTY2FsYXIgKHMpIHtcbiAgICB0aGlzLnggKj0gc1xuICAgIHRoaXMueSAqPSBzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRpdmlkZVNjYWxhciAocykge1xuICAgIGlmIChzID09PSAwKSB7XG4gICAgICB0aGlzLnggPSAwXG4gICAgICB0aGlzLnkgPSAwXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKDEgLyBzKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZG90ICh2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueVxuICB9XG5cbiAgZ2V0IGxlbmd0aCAoKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkpXG4gIH1cblxuICBsZW5ndGhTcSAoKSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueVxuICB9XG5cbiAgbm9ybWFsaXplICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIodGhpcy5sZW5ndGgoKSlcbiAgfVxuXG4gIGRpc3RhbmNlVG8gKHYpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMuZGlzdGFuY2VUb1NxKHYpKVxuICB9XG5cbiAgZGlzdGFuY2VUb1NxICh2KSB7XG4gICAgbGV0IGR4ID0gdGhpcy54IC0gdi54XG4gICAgbGV0IGR5ID0gdGhpcy55IC0gdi55XG4gICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5XG4gIH1cblxuICBzZXQgKHgsIHkpIHtcbiAgICB0aGlzLnggPSB4XG4gICAgdGhpcy55ID0geVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRYICh4KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRZICh5KSB7XG4gICAgdGhpcy55ID0geVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRMZW5ndGggKGwpIHtcbiAgICB2YXIgb2xkTGVuZ3RoID0gdGhpcy5sZW5ndGgoKVxuICAgIGlmIChvbGRMZW5ndGggIT09IDAgJiYgbCAhPT0gb2xkTGVuZ3RoKSB7XG4gICAgICB0aGlzLm11bHRpcGx5U2NhbGFyKGwgLyBvbGRMZW5ndGgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBsZXJwICh2LCBhbHBoYSkge1xuICAgIHRoaXMueCArPSAodi54IC0gdGhpcy54KSAqIGFscGhhXG4gICAgdGhpcy55ICs9ICh2LnkgLSB0aGlzLnkpICogYWxwaGFcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcmFkICgpIHtcbiAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueClcbiAgfVxuXG4gIGdldCBkZWcgKCkge1xuICAgIHJldHVybiB0aGlzLnJhZCgpICogZGVncmVlc1xuICB9XG5cbiAgZXF1YWxzICh2KSB7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gdi54ICYmIHRoaXMueSA9PT0gdi55XG4gIH1cblxuICByb3RhdGUgKHRoZXRhKSB7XG4gICAgdmFyIHh0ZW1wID0gdGhpcy54XG4gICAgdGhpcy54ID0gdGhpcy54ICogTWF0aC5jb3ModGhldGEpIC0gdGhpcy55ICogTWF0aC5zaW4odGhldGEpXG4gICAgdGhpcy55ID0geHRlbXAgKiBNYXRoLnNpbih0aGV0YSkgKyB0aGlzLnkgKiBNYXRoLmNvcyh0aGV0YSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZlY3RvclxuIiwiaW1wb3J0IFcgZnJvbSAnLi4vb2JqZWN0cy9XYWxsJ1xyXG5pbXBvcnQgRyBmcm9tICcuLi9vYmplY3RzL0dyYXNzJ1xyXG5pbXBvcnQgVCBmcm9tICcuLi9vYmplY3RzL1RyZWFzdXJlJ1xyXG5pbXBvcnQgRCBmcm9tICcuLi9vYmplY3RzL0Rvb3InXHJcbmltcG9ydCBUb3JjaCBmcm9tICcuLi9vYmplY3RzL1RvcmNoJ1xyXG5cclxuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcclxuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEnXHJcbmltcG9ydCBPcGVyYXRlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL09wZXJhdGUnXHJcblxyXG5jb25zdCBJdGVtcyA9IFtcclxuICBHLCBXLCBULCBELCBUb3JjaFxyXG5dXHJcblxyXG5jb25zdCBBYmlsaXRpZXMgPSBbXHJcbiAgTW92ZSwgQ2FtZXJhLCBPcGVyYXRlXHJcbl1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnN0YW5jZUJ5SXRlbUlkIChpdGVtSWQsIHBhcmFtcykge1xyXG4gIHJldHVybiBuZXcgSXRlbXNbaXRlbUlkXShwYXJhbXMpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnN0YW5jZUJ5QWJpbGl0eUlkIChhYmlsaXR5SWQsIHBhcmFtcykge1xyXG4gIHJldHVybiBuZXcgQWJpbGl0aWVzW2FiaWxpdHlJZF0ocGFyYW1zKVxyXG59XHJcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5jbGFzcyBDYXQgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuUm9jaylcblxuICAgIC8vIENoYW5nZSB0aGUgc3ByaXRlJ3MgcG9zaXRpb25cbiAgICB0aGlzLmR4ID0gMFxuICAgIHRoaXMuZHkgPSAwXG5cbiAgICB0aGlzLnRpY2tBYmlsaXRpZXMgPSB7fVxuICAgIHRoaXMuYWJpbGl0aWVzID0ge31cbiAgfVxuXG4gIHRha2VBYmlsaXR5IChhYmlsaXR5KSB7XG4gICAgaWYgKGFiaWxpdHkuaGFzVG9SZXBsYWNlKHRoaXMsIGFiaWxpdHkpKSB7XG4gICAgICBhYmlsaXR5LmNhcnJ5QnkodGhpcylcbiAgICAgIHRoaXMuZW1pdCgnYWJpbGl0eS1jYXJyeScsIGFiaWxpdHkpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAneW91J1xuICB9XG5cbiAgdGljayAoZGVsdGEpIHtcbiAgICBPYmplY3QudmFsdWVzKHRoaXMudGlja0FiaWxpdGllcykuZm9yRWFjaChhYmlsaXR5ID0+IGFiaWxpdHkudGljayhkZWx0YSwgdGhpcykpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2F0XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgU1RBWSwgQUJJTElUWV9PUEVSQVRFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIERvb3IgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAobWFwKSB7XHJcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcclxuICAgIHN1cGVyKFRleHR1cmUuRG9vcilcclxuXHJcbiAgICB0aGlzLm1hcCA9IG1hcFswXVxyXG4gICAgdGhpcy50b1Bvc2l0aW9uID0gbWFwWzFdXHJcblxyXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XHJcblxyXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XHJcbiAgICBsZXQgYWJpbGl0eSA9IG9wZXJhdG9yLmFiaWxpdGllc1tBQklMSVRZX09QRVJBVEVdXHJcbiAgICBpZiAoIWFiaWxpdHkpIHtcclxuICAgICAgdGhpcy5zYXkoW1xyXG4gICAgICAgIG9wZXJhdG9yLnRvU3RyaW5nKCksXHJcbiAgICAgICAgJyBkb3NlblxcJ3QgaGFzIGFiaWxpdHkgdG8gdXNlIHRoaXMgZG9vciAnLFxyXG4gICAgICAgIHRoaXMubWFwLFxyXG4gICAgICAgICcuJ1xyXG4gICAgICBdLmpvaW4oJycpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWJpbGl0eS51c2Uob3BlcmF0b3IsIHRoaXMpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBbQUJJTElUWV9PUEVSQVRFXSAoKSB7XHJcbiAgICB0aGlzLnNheShbJ0dldCBpbiAnLCB0aGlzLm1hcCwgJyBub3cuJ10uam9pbignJykpXHJcbiAgICB0aGlzLmVtaXQoJ3VzZScpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEb29yXHJcbiIsImltcG9ydCB7IFNwcml0ZSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBtZXNzYWdlcyBmcm9tICcuLi9saWIvTWVzc2FnZXMnXG5cbmNsYXNzIEdhbWVPYmplY3QgZXh0ZW5kcyBTcHJpdGUge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxuICBzYXkgKG1zZykge1xuICAgIG1lc3NhZ2VzLmFkZChtc2cpXG4gICAgY29uc29sZS5sb2cobXNnKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVPYmplY3RcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBHcmFzcyBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAodHJlYXN1cmVzKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5HcmFzcylcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyYXNzXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IExpZ2h0IGZyb20gJy4uL2xpYi9MaWdodCdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIFRvcmNoIGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgc3VwZXIoVGV4dHVyZS5Ub3JjaClcclxuXHJcbiAgICBsZXQgcmFkaXVzID0gM1xyXG5cclxuICAgIHRoaXMub24oJ2FkZGVkJywgTGlnaHQubGlnaHRPbi5iaW5kKG51bGwsIHRoaXMsIHJhZGl1cywgMC45NSkpXHJcbiAgICB0aGlzLm9uKCdyZW1vdmVlZCcsIExpZ2h0LmxpZ2h0T2ZmLmJpbmQobnVsbCwgdGhpcykpXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUb3JjaFxyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcclxuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xyXG5cclxuaW1wb3J0IHsgUkVQTFkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBpbnN0YW5jZUJ5QWJpbGl0eUlkIH0gZnJvbSAnLi4vbGliL3V0aWxzJ1xyXG5cclxuY2xhc3MgVHJlYXN1cmUgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAoaW52ZW50b3JpZXMgPSBbXSkge1xyXG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXHJcbiAgICBzdXBlcihUZXh0dXJlLlRyZWFzdXJlKVxyXG5cclxuICAgIHRoaXMuaW52ZW50b3JpZXMgPSBpbnZlbnRvcmllcy5tYXAoKFthYmlsaXR5SWQsIHBhcmFtc10pID0+IHtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlQnlBYmlsaXR5SWQoYWJpbGl0eUlkLCBwYXJhbXMpXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICd0cmVhc3VyZTogWycsXHJcbiAgICAgIHRoaXMuaW52ZW50b3JpZXMuam9pbignLCAnKSxcclxuICAgICAgJ10nXHJcbiAgICBdLmpvaW4oJycpXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XHJcblxyXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yLCBhY3Rpb24gPSAndGFrZUFiaWxpdHknKSB7XHJcbiAgICAvLyBGSVhNRTog5pqr5pmC55So6aCQ6Kit5Y+D5pW4IHRha2VBYmlsaXR5XHJcbiAgICBpZiAodHlwZW9mIG9wZXJhdG9yW2FjdGlvbl0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpcy5pbnZlbnRvcmllcy5mb3JFYWNoKHRyZWFzdXJlID0+IG9wZXJhdG9yW2FjdGlvbl0odHJlYXN1cmUpKVxyXG4gICAgICB0aGlzLnNheShbXHJcbiAgICAgICAgb3BlcmF0b3IudG9TdHJpbmcoKSxcclxuICAgICAgICAnIHRha2VkICcsXHJcbiAgICAgICAgdGhpcy50b1N0cmluZygpXHJcbiAgICAgIF0uam9pbignJykpXHJcblxyXG4gICAgICB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKVxyXG4gICAgICB0aGlzLmRlc3Ryb3koKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJlYXN1cmVcclxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBXYWxsIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLldhbGwpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2FsbFxuIiwiY29uc3QgdHlwZSA9IFN5bWJvbCgnYWJpbGl0eScpXG5cbmNsYXNzIEFiaWxpdHkge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiB0eXBlIH1cblxuICBnZXRTYW1lVHlwZUFiaWxpdHkgKG93bmVyKSB7XG4gICAgcmV0dXJuIG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdXG4gIH1cblxuICAvLyDmmK/lkKbpnIDnva7mj5tcbiAgaGFzVG9SZXBsYWNlIChvd25lciwgYWJpbGl0eU5ldykge1xuICAgIGxldCBhYmlsaXR5T2xkID0gdGhpcy5nZXRTYW1lVHlwZUFiaWxpdHkob3duZXIpXG4gICAgcmV0dXJuICFhYmlsaXR5T2xkIHx8IGFiaWxpdHlOZXcuaXNCZXR0ZXIoYWJpbGl0eU9sZClcbiAgfVxuXG4gIC8vIOaWsOiIiuavlOi8g1xuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgbGV0IGFiaWxpdHlPbGQgPSB0aGlzLmdldFNhbWVUeXBlQWJpbGl0eShvd25lcilcbiAgICBpZiAoYWJpbGl0eU9sZCkge1xuICAgICAgLy8gZmlyc3QgZ2V0IHRoaXMgdHlwZSBhYmlsaXR5XG4gICAgICBhYmlsaXR5T2xkLnJlcGxhY2VkQnkodGhpcywgb3duZXIpXG4gICAgfVxuICAgIG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdID0gdGhpc1xuICB9XG5cbiAgcmVwbGFjZWRCeSAob3RoZXIsIG93bmVyKSB7fVxuXG4gIGRyb3BCeSAob3duZXIpIHtcbiAgICBkZWxldGUgb3duZXIuYWJpbGl0aWVzW3RoaXMudHlwZV1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3BseiBleHRlbmQgdGhpcyBjbGFzcydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBYmlsaXR5XG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXHJcbmltcG9ydCBMaWdodCBmcm9tICcuLi8uLi9saWIvTGlnaHQnXHJcbmltcG9ydCB7IEFCSUxJVFlfQ0FNRVJBIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcclxuXHJcbmNsYXNzIENhbWVyYSBleHRlbmRzIEFiaWxpdHkge1xyXG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5yYWRpdXMgPSB2YWx1ZVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9DQU1FUkEgfVxyXG5cclxuICBpc0JldHRlciAob3RoZXIpIHtcclxuICAgIC8vIOWPquacg+iuiuWkp1xyXG4gICAgcmV0dXJuIHRoaXMucmFkaXVzID49IG90aGVyLnJhZGl1c1xyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XHJcbiAgY2FycnlCeSAob3duZXIpIHtcclxuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXHJcbiAgICBpZiAob3duZXIucGFyZW50KSB7XHJcbiAgICAgIHRoaXMuc2V0dXAob3duZXIsIG93bmVyLnBhcmVudClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG93bmVyLm9uY2UoJ2FkZGVkJywgY29udGFpbmVyID0+IHRoaXMuc2V0dXAob3duZXIsIGNvbnRhaW5lcikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXBsYWNlZEJ5IChvdGhlciwgb3duZXIpIHtcclxuICAgIHRoaXMuZHJvcEJ5KG93bmVyKVxyXG4gIH1cclxuXHJcbiAgc2V0dXAgKG93bmVyLCBjb250YWluZXIpIHtcclxuICAgIExpZ2h0LmxpZ2h0T24ob3duZXIsIHRoaXMucmFkaXVzKVxyXG4gICAgLy8g5aaC5p6cIG93bmVyIOS4jeiiq+mhr+ekulxyXG4gICAgb3duZXIucmVtb3ZlZCA9IHRoaXMub25SZW1vdmVkLmJpbmQodGhpcywgb3duZXIpXHJcbiAgICBvd25lci5vbmNlKCdyZW1vdmVkJywgb3duZXIucmVtb3ZlZClcclxuICB9XHJcblxyXG4gIG9uUmVtb3ZlZCAob3duZXIpIHtcclxuICAgIHRoaXMuZHJvcEJ5KG93bmVyKVxyXG4gICAgLy8gb3duZXIg6YeN5paw6KKr6aGv56S6XHJcbiAgICBvd25lci5vbmNlKCdhZGRlZCcsIGNvbnRhaW5lciA9PiB0aGlzLnNldHVwKG93bmVyLCBjb250YWluZXIpKVxyXG4gIH1cclxuXHJcbiAgZHJvcEJ5IChvd25lcikge1xyXG4gICAgTGlnaHQubGlnaHRPZmYob3duZXIpXHJcbiAgICAvLyByZW1vdmUgbGlzdGVuZXJcclxuICAgIG93bmVyLm9mZigncmVtb3ZlZCcsIG93bmVyLnJlbW92ZWQpXHJcbiAgICBkZWxldGUgb3duZXIucmVtb3ZlZFxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdsaWdodCBhcmVhOiAnICsgdGhpcy5yYWRpdXNcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhbWVyYVxyXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQga2V5Ym9hcmRKUyBmcm9tICdrZXlib2FyZGpzJ1xuaW1wb3J0IHsgTEVGVCwgVVAsIFJJR0hULCBET1dOIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnRyb2wnXG5pbXBvcnQgeyBBQklMSVRZX0tFWV9NT1ZFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgS2V5TW92ZSBleHRlbmRzIEFiaWxpdHkge1xuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0tFWV9NT1ZFIH1cblxuICBpc0JldHRlciAob3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5zZXR1cChvd25lcilcbiAgfVxuXG4gIHNldHVwIChvd25lcikge1xuICAgIGxldCBkaXIgPSB7fVxuICAgIGxldCBjYWxjRGlyID0gKCkgPT4ge1xuICAgICAgb3duZXIuZHggPSAtZGlyW0xFRlRdICsgZGlyW1JJR0hUXVxuICAgICAgb3duZXIuZHkgPSAtZGlyW1VQXSArIGRpcltET1dOXVxuICAgIH1cbiAgICBsZXQgYmluZCA9IGNvZGUgPT4ge1xuICAgICAgZGlyW2NvZGVdID0gMFxuICAgICAgbGV0IHByZUhhbmRsZXIgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50UmVwZWF0KClcbiAgICAgICAgZGlyW2NvZGVdID0gMVxuICAgICAgICBjYWxjRGlyKClcbiAgICAgIH1cbiAgICAgIGtleWJvYXJkSlMuYmluZChjb2RlLCBwcmVIYW5kbGVyLCAoKSA9PiB7XG4gICAgICAgIGRpcltjb2RlXSA9IDBcbiAgICAgICAgY2FsY0RpcigpXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHByZUhhbmRsZXJcbiAgICB9XG5cbiAgICBrZXlib2FyZEpTLnNldENvbnRleHQoJycpXG4gICAga2V5Ym9hcmRKUy53aXRoQ29udGV4dCgnJywgKCkgPT4ge1xuICAgICAgb3duZXJbQUJJTElUWV9LRVlfTU9WRV0gPSB7XG4gICAgICAgIFtMRUZUXTogYmluZChMRUZUKSxcbiAgICAgICAgW1VQXTogYmluZChVUCksXG4gICAgICAgIFtSSUdIVF06IGJpbmQoUklHSFQpLFxuICAgICAgICBbRE9XTl06IGJpbmQoRE9XTilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIHN1cGVyLmRyb3BCeShvd25lcilcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBPYmplY3QuZW50cmllcyhvd25lcltBQklMSVRZX0tFWV9NT1ZFXSkuZm9yRWFjaCgoW2tleSwgaGFuZGxlcl0pID0+IHtcbiAgICAgICAga2V5Ym9hcmRKUy51bmJpbmQoa2V5LCBoYW5kbGVyKVxuICAgICAgfSlcbiAgICB9KVxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX0tFWV9NT1ZFXVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAna2V5IGNvbnRyb2wnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS2V5TW92ZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xyXG5pbXBvcnQgeyBBQklMSVRZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuY2xhc3MgTW92ZSBleHRlbmRzIEFiaWxpdHkge1xyXG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX01PVkUgfVxyXG5cclxuICBpc0JldHRlciAob3RoZXIpIHtcclxuICAgIC8vIOWPquacg+WKoOW/q1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWUgPiBvdGhlci52YWx1ZVxyXG4gIH1cclxuXHJcbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XHJcbiAgY2FycnlCeSAob3duZXIpIHtcclxuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXHJcbiAgICBvd25lci50aWNrQWJpbGl0aWVzW3RoaXMudHlwZS50b1N0cmluZygpXSA9IHRoaXNcclxuICB9XHJcblxyXG4gIC8vIHRpY2tcclxuICB0aWNrIChkZWx0YSwgb3duZXIpIHtcclxuICAgIC8vIE5PVElDRTog5YGH6Kit6Ieq5bex5piv5q2j5pa55b2iXHJcbiAgICBsZXQgc2NhbGUgPSBvd25lci5zY2FsZS54XHJcbiAgICBvd25lci54ICs9IG93bmVyLmR4ICogdGhpcy52YWx1ZSAqIHNjYWxlICogZGVsdGFcclxuICAgIG93bmVyLnkgKz0gb3duZXIuZHkgKiB0aGlzLnZhbHVlICogc2NhbGUgKiBkZWx0YVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdtb3ZlIGxldmVsOiAnICsgdGhpcy52YWx1ZVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW92ZVxyXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX09QRVJBVEUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBPcGVyYXRlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnNldCA9IG5ldyBTZXQoW3ZhbHVlXSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfT1BFUkFURSB9XG5cbiAgcmVwbGFjZWRCeSAob3RoZXIpIHtcbiAgICB0aGlzLnNldC5mb3JFYWNoKG90aGVyLnNldC5hZGQuYmluZChvdGhlci5zZXQpKVxuICB9XG5cbiAgdXNlIChvcGVyYXRvciwgdGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMuc2V0Lmhhcyh0YXJnZXQubWFwKSkge1xuICAgICAgb3BlcmF0b3Iuc2F5KG9wZXJhdG9yLnRvU3RyaW5nKCkgKyAnIHVzZSBhYmlsaXR5IHRvIG9wZW4gJyArIHRhcmdldC5tYXApXG4gICAgICB0YXJnZXRbdGhpcy50eXBlXSgpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbJ2tleXM6ICcsIEFycmF5LmZyb20odGhpcy5zZXQpLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0ZVxuIiwiaW1wb3J0IHsgVGV4dCwgVGV4dFN0eWxlLCBsb2FkZXIgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2xpYi9TY2VuZSdcclxuaW1wb3J0IFBsYXlTY2VuZSBmcm9tICcuL1BsYXlTY2VuZSdcclxuXHJcbmxldCB0ZXh0ID0gJ2xvYWRpbmcnXHJcblxyXG5jbGFzcyBMb2FkaW5nU2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIHRoaXMubGlmZSA9IDBcclxuICB9XHJcblxyXG4gIGNyZWF0ZSAoKSB7XHJcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcclxuICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgICAgZm9udFNpemU6IDM2LFxyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICcjZmYzMzAwJyxcclxuICAgICAgc3Ryb2tlVGhpY2tuZXNzOiA0LFxyXG4gICAgICBkcm9wU2hhZG93OiB0cnVlLFxyXG4gICAgICBkcm9wU2hhZG93Q29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgZHJvcFNoYWRvd0JsdXI6IDQsXHJcbiAgICAgIGRyb3BTaGFkb3dBbmdsZTogTWF0aC5QSSAvIDYsXHJcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZTogNlxyXG4gICAgfSlcclxuICAgIHRoaXMudGV4dExvYWRpbmcgPSBuZXcgVGV4dCh0ZXh0LCBzdHlsZSlcclxuXHJcbiAgICAvLyBBZGQgdGhlIGNhdCB0byB0aGUgc3RhZ2VcclxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50ZXh0TG9hZGluZylcclxuXHJcbiAgICAvLyBsb2FkIGFuIGltYWdlIGFuZCBydW4gdGhlIGBzZXR1cGAgZnVuY3Rpb24gd2hlbiBpdCdzIGRvbmVcclxuICAgIGxvYWRlclxyXG4gICAgICAuYWRkKCdpbWFnZXMvdGVycmFpbl9hdGxhcy5qc29uJylcclxuICAgICAgLmFkZCgnaW1hZ2VzL2Jhc2Vfb3V0X2F0bGFzLmpzb24nKVxyXG4gICAgICAubG9hZCgoKSA9PiB0aGlzLmVtaXQoJ2NoYW5nZVNjZW5lJywgUGxheVNjZW5lLCB7XHJcbiAgICAgICAgbWFwRmlsZTogJ0UwTjAnLFxyXG4gICAgICAgIHBvc2l0aW9uOiBbMSwgMV1cclxuICAgICAgfSkpXHJcbiAgfVxyXG5cclxuICB0aWNrIChkZWx0YSkge1xyXG4gICAgdGhpcy5saWZlICs9IGRlbHRhIC8gMzAgLy8gYmxlbmQgc3BlZWRcclxuICAgIHRoaXMudGV4dExvYWRpbmcudGV4dCA9IHRleHQgKyBBcnJheShNYXRoLmZsb29yKHRoaXMubGlmZSkgJSA0ICsgMSkuam9pbignLicpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMb2FkaW5nU2NlbmVcclxuIiwiaW1wb3J0IHsgbG9hZGVyLCByZXNvdXJjZXMsIGRpc3BsYXkgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4uL2xpYi9TY2VuZSdcclxuaW1wb3J0IE1hcCBmcm9tICcuLi9saWIvTWFwJ1xyXG5pbXBvcnQgeyBJU19NT0JJTEUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuaW1wb3J0IENhdCBmcm9tICcuLi9vYmplY3RzL0NhdCdcclxuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcclxuaW1wb3J0IEtleU1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvS2V5TW92ZSdcclxuaW1wb3J0IE9wZXJhdGUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvT3BlcmF0ZSdcclxuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEnXHJcblxyXG5pbXBvcnQgTWVzc2FnZVdpbmRvdyBmcm9tICcuLi91aS9NZXNzYWdlV2luZG93J1xyXG5pbXBvcnQgUGxheWVyV2luZG93IGZyb20gJy4uL3VpL1BsYXllcldpbmRvdydcclxuaW1wb3J0IFRvdWNoQ29udHJvbFBhbmVsIGZyb20gJy4uL3VpL1RvdWNoQ29udHJvbFBhbmVsJ1xyXG5cclxubGV0IHNjZW5lV2lkdGhcclxubGV0IHNjZW5lSGVpZ2h0XHJcblxyXG5mdW5jdGlvbiBnZXRNZXNzYWdlV2luZG93T3B0ICgpIHtcclxuICBsZXQgb3B0ID0ge31cclxuICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoXHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyAzMFxyXG4gICAgb3B0LnNjcm9sbEJhcldpZHRoID0gNTBcclxuICAgIG9wdC5zY3JvbGxCYXJNaW5IZWlnaHQgPSA3MFxyXG4gIH0gZWxzZSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIDwgNDAwID8gc2NlbmVXaWR0aCA6IHNjZW5lV2lkdGggLyAyXHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyA2MFxyXG4gIH1cclxuICBvcHQuaGVpZ2h0ID0gc2NlbmVIZWlnaHQgLyA2XHJcbiAgb3B0LnggPSAwXHJcbiAgb3B0LnkgPSBzY2VuZUhlaWdodCAtIG9wdC5oZWlnaHRcclxuXHJcbiAgcmV0dXJuIG9wdFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQbGF5ZXJXaW5kb3dPcHQgKCkge1xyXG4gIGxldCBvcHQgPSB7fVxyXG4gIG9wdC54ID0gMFxyXG4gIG9wdC55ID0gMFxyXG4gIGlmIChJU19NT0JJTEUpIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggLyA0XHJcbiAgICBvcHQuaGVpZ2h0ID0gc2NlbmVIZWlnaHQgLyA2XHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyAxMFxyXG4gIH0gZWxzZSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIDwgNDAwID8gc2NlbmVXaWR0aCAvIDIgOiBzY2VuZVdpZHRoIC8gNFxyXG4gICAgb3B0LmhlaWdodCA9IHNjZW5lSGVpZ2h0IC8gM1xyXG4gICAgb3B0LmZvbnRTaXplID0gb3B0LndpZHRoIC8gMjBcclxuICB9XHJcbiAgcmV0dXJuIG9wdFxyXG59XHJcblxyXG5jbGFzcyBQbGF5U2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcbiAgY29uc3RydWN0b3IgKHsgbWFwRmlsZSwgcG9zaXRpb24gfSkge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIHRoaXMubWFwRmlsZSA9IG1hcEZpbGVcclxuICAgIHRoaXMudG9Qb3NpdGlvbiA9IHBvc2l0aW9uXHJcbiAgfVxyXG5cclxuICBjcmVhdGUgKCkge1xyXG4gICAgc2NlbmVXaWR0aCA9IHRoaXMucGFyZW50LndpZHRoXHJcbiAgICBzY2VuZUhlaWdodCA9IHRoaXMucGFyZW50LmhlaWdodFxyXG4gICAgdGhpcy5pc01hcExvYWRlZCA9IGZhbHNlXHJcbiAgICB0aGlzLmxvYWRNYXAoKVxyXG4gICAgdGhpcy5pbml0UGxheWVyKClcclxuICAgIHRoaXMuaW5pdFVpKClcclxuICB9XHJcblxyXG4gIGluaXRVaSAoKSB7XHJcbiAgICBsZXQgdWlHcm91cCA9IG5ldyBkaXNwbGF5Lkdyb3VwKDAsIHRydWUpXHJcbiAgICBsZXQgdWlMYXllciA9IG5ldyBkaXNwbGF5LkxheWVyKHVpR3JvdXApXHJcbiAgICB1aUxheWVyLnBhcmVudExheWVyID0gdGhpc1xyXG4gICAgdWlMYXllci5ncm91cC5lbmFibGVTb3J0ID0gdHJ1ZVxyXG4gICAgdGhpcy5hZGRDaGlsZCh1aUxheWVyKVxyXG5cclxuICAgIGxldCBtZXNzYWdlV2luZG93ID0gbmV3IE1lc3NhZ2VXaW5kb3coZ2V0TWVzc2FnZVdpbmRvd09wdCgpKVxyXG4gICAgLy8g6K6TVUnpoa/npLrlnKjpoILlsaRcclxuICAgIG1lc3NhZ2VXaW5kb3cucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcbiAgICBtZXNzYWdlV2luZG93LmFkZChbJ3NjZW5lIHNpemU6ICgnLCBzY2VuZVdpZHRoLCAnLCAnLCBzY2VuZUhlaWdodCwgJykuJ10uam9pbignJykpXHJcblxyXG4gICAgbGV0IHBsYXllcldpbmRvdyA9IG5ldyBQbGF5ZXJXaW5kb3coT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgIHBsYXllcjogdGhpcy5jYXRcclxuICAgIH0sIGdldFBsYXllcldpbmRvd09wdCgpKSlcclxuXHJcbiAgICB1aUxheWVyLmFkZENoaWxkKG1lc3NhZ2VXaW5kb3cpXHJcbiAgICB1aUxheWVyLmFkZENoaWxkKHBsYXllcldpbmRvdylcclxuXHJcbiAgICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICAgIC8vIOWPquacieaJi+apn+imgeinuOaOp+adv1xyXG4gICAgICBsZXQgdG91Y2hDb250cm9sUGFuZWwgPSBuZXcgVG91Y2hDb250cm9sUGFuZWwoe1xyXG4gICAgICAgIHg6IHNjZW5lV2lkdGggLyA0LFxyXG4gICAgICAgIHk6IHNjZW5lSGVpZ2h0ICogNCAvIDYsXHJcbiAgICAgICAgcmFkaXVzOiBzY2VuZVdpZHRoIC8gMTBcclxuICAgICAgfSlcclxuICAgICAgdG91Y2hDb250cm9sUGFuZWwucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcblxyXG4gICAgICB1aUxheWVyLmFkZENoaWxkKHRvdWNoQ29udHJvbFBhbmVsKVxyXG4gICAgICAvLyByZXF1aXJlKCcuLi9saWIvZGVtbycpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpbml0UGxheWVyICgpIHtcclxuICAgIGlmICghdGhpcy5jYXQpIHtcclxuICAgICAgdGhpcy5jYXQgPSBuZXcgQ2F0KClcclxuICAgICAgdGhpcy5jYXQudGFrZUFiaWxpdHkobmV3IE1vdmUoMSkpXHJcbiAgICAgIHRoaXMuY2F0LnRha2VBYmlsaXR5KG5ldyBPcGVyYXRlKCdFME4wJykpXHJcbiAgICAgIHRoaXMuY2F0LnRha2VBYmlsaXR5KG5ldyBLZXlNb3ZlKCkpXHJcbiAgICAgIHRoaXMuY2F0LnRha2VBYmlsaXR5KG5ldyBDYW1lcmEoMSkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBsb2FkTWFwICgpIHtcclxuICAgIGxldCBmaWxlTmFtZSA9ICd3b3JsZC8nICsgdGhpcy5tYXBGaWxlXHJcblxyXG4gICAgLy8gaWYgbWFwIG5vdCBsb2FkZWQgeWV0XHJcbiAgICBpZiAoIXJlc291cmNlc1tmaWxlTmFtZV0pIHtcclxuICAgICAgbG9hZGVyXHJcbiAgICAgICAgLmFkZChmaWxlTmFtZSwgZmlsZU5hbWUgKyAnLmpzb24nKVxyXG4gICAgICAgIC5sb2FkKHRoaXMuc3Bhd25NYXAuYmluZCh0aGlzLCBmaWxlTmFtZSkpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNwYXduTWFwKGZpbGVOYW1lKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3Bhd25NYXAgKGZpbGVOYW1lKSB7XHJcbiAgICBsZXQgbWFwRGF0YSA9IHJlc291cmNlc1tmaWxlTmFtZV0uZGF0YVxyXG4gICAgbGV0IG1hcFNjYWxlID0gSVNfTU9CSUxFID8gMSA6IDAuNVxyXG5cclxuICAgIGxldCBtYXAgPSBuZXcgTWFwKG1hcFNjYWxlKVxyXG4gICAgdGhpcy5hZGRDaGlsZChtYXApXHJcbiAgICBtYXAubG9hZChtYXBEYXRhKVxyXG5cclxuICAgIG1hcC5vbigndXNlJywgbyA9PiB7XHJcbiAgICAgIHRoaXMuaXNNYXBMb2FkZWQgPSBmYWxzZVxyXG4gICAgICAvLyBjbGVhciBvbGQgbWFwXHJcbiAgICAgIHRoaXMucmVtb3ZlQ2hpbGQodGhpcy5tYXApXHJcbiAgICAgIHRoaXMubWFwLmRlc3Ryb3koKVxyXG5cclxuICAgICAgdGhpcy5tYXBGaWxlID0gby5tYXBcclxuICAgICAgdGhpcy50b1Bvc2l0aW9uID0gby50b1Bvc2l0aW9uXHJcbiAgICAgIHRoaXMubG9hZE1hcCgpXHJcbiAgICB9KVxyXG5cclxuICAgIG1hcC5hZGRQbGF5ZXIodGhpcy5jYXQsIHRoaXMudG9Qb3NpdGlvbilcclxuICAgIHRoaXMubWFwID0gbWFwXHJcblxyXG4gICAgdGhpcy5pc01hcExvYWRlZCA9IHRydWVcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNNYXBMb2FkZWQpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcC50aWNrKGRlbHRhKVxyXG4gICAgLy8gRklYTUU6IGdhcCBiZXR3ZWVuIHRpbGVzIG9uIGlQaG9uZSBTYWZhcmlcclxuICAgIHRoaXMubWFwLnBvc2l0aW9uLnNldChcclxuICAgICAgTWF0aC5mbG9vcihzY2VuZVdpZHRoIC8gMiAtIHRoaXMuY2F0LngpLFxyXG4gICAgICBNYXRoLmZsb29yKHNjZW5lSGVpZ2h0IC8gMiAtIHRoaXMuY2F0LnkpXHJcbiAgICApXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGF5U2NlbmVcclxuIiwiaW1wb3J0IHsgVGV4dCwgVGV4dFN0eWxlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5cbmltcG9ydCBTY3JvbGxhYmxlV2luZG93IGZyb20gJy4vU2Nyb2xsYWJsZVdpbmRvdydcbmltcG9ydCBtZXNzYWdlcyBmcm9tICcuLi9saWIvTWVzc2FnZXMnXG5cbmNsYXNzIE1lc3NhZ2VXaW5kb3cgZXh0ZW5kcyBTY3JvbGxhYmxlV2luZG93IHtcbiAgY29uc3RydWN0b3IgKG9wdCkge1xuICAgIHN1cGVyKG9wdClcblxuICAgIGxldCB7IGZvbnRTaXplID0gMTIgfSA9IG9wdFxuXG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgYnJlYWtXb3JkczogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwOiB0cnVlLFxuICAgICAgd29yZFdyYXBXaWR0aDogdGhpcy53aW5kb3dXaWR0aFxuICAgIH0pXG4gICAgbGV0IHRleHQgPSBuZXcgVGV4dCgnJywgc3R5bGUpXG5cbiAgICB0aGlzLmFkZFdpbmRvd0NoaWxkKHRleHQpXG4gICAgdGhpcy50ZXh0ID0gdGV4dFxuXG4gICAgdGhpcy5hdXRvU2Nyb2xsVG9Cb3R0b20gPSB0cnVlXG5cbiAgICBtZXNzYWdlcy5vbignbW9kaWZpZWQnLCB0aGlzLm1vZGlmaWVkLmJpbmQodGhpcykpXG4gIH1cblxuICBtb2RpZmllZCAoKSB7XG4gICAgbGV0IHNjcm9sbFBlcmNlbnQgPSB0aGlzLnNjcm9sbFBlcmNlbnRcbiAgICB0aGlzLnRleHQudGV4dCA9IFtdLmNvbmNhdChtZXNzYWdlcy5saXN0KS5yZXZlcnNlKCkuam9pbignXFxuJylcbiAgICB0aGlzLnVwZGF0ZVNjcm9sbEJhckxlbmd0aCgpXG5cbiAgICAvLyDoi6VzY3JvbGznva7lupXvvIzoh6rli5XmjbLli5Xnva7lupVcbiAgICBpZiAoc2Nyb2xsUGVyY2VudCA9PT0gMSkge1xuICAgICAgdGhpcy5zY3JvbGxUbygxKVxuICAgIH1cbiAgfVxuXG4gIGFkZCAobXNnKSB7XG4gICAgbWVzc2FnZXMuYWRkKG1zZylcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ21lc3NhZ2Utd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VXaW5kb3dcbiIsImltcG9ydCB7IENvbnRhaW5lciwgVGV4dCwgVGV4dFN0eWxlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5cbmltcG9ydCBXaW5kb3cgZnJvbSAnLi9XaW5kb3cnXG5pbXBvcnQgeyBBQklMSVRJRVNfQUxMIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgUGxheWVyV2luZG93IGV4dGVuZHMgV2luZG93IHtcbiAgY29uc3RydWN0b3IgKG9wdCkge1xuICAgIHN1cGVyKG9wdClcbiAgICBsZXQgeyBwbGF5ZXIgfSA9IG9wdFxuICAgIHRoaXMuX29wdCA9IG9wdFxuICAgIHBsYXllci5vbignYWJpbGl0eS1jYXJyeScsIHRoaXMub25BYmlsaXR5Q2FycnkuYmluZCh0aGlzLCBwbGF5ZXIpKVxuXG4gICAgdGhpcy5hYmlsaXR5VGV4dENvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKVxuICAgIHRoaXMuYWJpbGl0eVRleHRDb250YWluZXIueCA9IDVcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMuYWJpbGl0eVRleHRDb250YWluZXIpXG5cbiAgICB0aGlzLm9uQWJpbGl0eUNhcnJ5KHBsYXllcilcbiAgfVxuXG4gIG9uQWJpbGl0eUNhcnJ5IChwbGF5ZXIpIHtcbiAgICBsZXQgaSA9IDBcbiAgICBsZXQgeyBmb250U2l6ZSA9IDEwIH0gPSB0aGlzLl9vcHRcbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgIGZpbGw6ICdncmVlbicsXG4gICAgICBsaW5lSGVpZ2h0OiBmb250U2l6ZVxuICAgIH0pXG5cbiAgICBsZXQgY29udGlhbmVyID0gdGhpcy5hYmlsaXR5VGV4dENvbnRhaW5lclxuICAgIGNvbnRpYW5lci5yZW1vdmVDaGlsZHJlbigpXG4gICAgQUJJTElUSUVTX0FMTC5mb3JFYWNoKGFiaWxpdHlTeW1ib2wgPT4ge1xuICAgICAgbGV0IGFiaWxpdHkgPSBwbGF5ZXIuYWJpbGl0aWVzW2FiaWxpdHlTeW1ib2xdXG4gICAgICBpZiAoYWJpbGl0eSkge1xuICAgICAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KGFiaWxpdHkudG9TdHJpbmcoKSwgc3R5bGUpXG4gICAgICAgIHRleHQueSA9IGkgKiAoZm9udFNpemUgKyA1KVxuXG4gICAgICAgIGNvbnRpYW5lci5hZGRDaGlsZCh0ZXh0KVxuXG4gICAgICAgIGkrK1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyV2luZG93XG4iLCJpbXBvcnQgeyBDb250YWluZXIsIEdyYXBoaWNzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5cbmltcG9ydCBXaW5kb3cgZnJvbSAnLi9XaW5kb3cnXG5pbXBvcnQgV3JhcHBlciBmcm9tICcuL1dyYXBwZXInXG5cbmNsYXNzIFNjcm9sbGFibGVXaW5kb3cgZXh0ZW5kcyBXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIob3B0KVxuICAgIGxldCB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHBhZGRpbmcgPSA4LFxuICAgICAgc2Nyb2xsQmFyV2lkdGggPSAxMFxuICAgIH0gPSBvcHRcbiAgICB0aGlzLl9vcHQgPSBvcHRcblxuICAgIHRoaXMuX2luaXRTY3JvbGxhYmxlQXJlYShcbiAgICAgIHdpZHRoIC0gcGFkZGluZyAqIDIgLSBzY3JvbGxCYXJXaWR0aCAtIDUsXG4gICAgICBoZWlnaHQgLSBwYWRkaW5nICogMixcbiAgICAgIHBhZGRpbmcpXG4gICAgdGhpcy5faW5pdFNjcm9sbEJhcih7XG4gICAgICAvLyB3aW5kb3cgd2lkdGggLSB3aW5kb3cgcGFkZGluZyAtIGJhciB3aWR0aFxuICAgICAgeDogd2lkdGggLSBwYWRkaW5nIC0gc2Nyb2xsQmFyV2lkdGgsXG4gICAgICB5OiBwYWRkaW5nLFxuICAgICAgd2lkdGg6IHNjcm9sbEJhcldpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQgLSBwYWRkaW5nICogMlxuICAgIH0pXG4gIH1cblxuICBfaW5pdFNjcm9sbGFibGVBcmVhICh3aWR0aCwgaGVpZ2h0LCBwYWRkaW5nKSB7XG4gICAgLy8gaG9sZCBwYWRkaW5nXG4gICAgbGV0IF9tYWluVmlldyA9IG5ldyBDb250YWluZXIoKVxuICAgIF9tYWluVmlldy5wb3NpdGlvbi5zZXQocGFkZGluZywgcGFkZGluZylcbiAgICB0aGlzLmFkZENoaWxkKF9tYWluVmlldylcblxuICAgIHRoaXMubWFpblZpZXcgPSBuZXcgQ29udGFpbmVyKClcbiAgICBfbWFpblZpZXcuYWRkQ2hpbGQodGhpcy5tYWluVmlldylcblxuICAgIC8vIGhpZGUgbWFpblZpZXcncyBvdmVyZmxvd1xuICAgIGxldCBtYXNrID0gbmV3IEdyYXBoaWNzKClcbiAgICBtYXNrLmJlZ2luRmlsbCgweEZGRkZGRilcbiAgICBtYXNrLmRyYXdSb3VuZGVkUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0LCA1KVxuICAgIG1hc2suZW5kRmlsbCgpXG4gICAgdGhpcy5tYWluVmlldy5tYXNrID0gbWFza1xuICAgIF9tYWluVmlldy5hZGRDaGlsZChtYXNrKVxuXG4gICAgLy8gd2luZG93IHdpZHRoIC0gd2luZG93IHBhZGRpbmcgKiAyIC0gYmFyIHdpZHRoIC0gYmV0d2VlbiBzcGFjZVxuICAgIHRoaXMuX3dpbmRvd1dpZHRoID0gd2lkdGhcbiAgICB0aGlzLl93aW5kb3dIZWlnaHQgPSBoZWlnaHRcbiAgfVxuXG4gIF9pbml0U2Nyb2xsQmFyICh7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSkge1xuICAgIGxldCBjb25hdGluZXIgPSBuZXcgQ29udGFpbmVyKClcbiAgICBjb25hdGluZXIueCA9IHhcbiAgICBjb25hdGluZXIueSA9IHlcblxuICAgIGxldCBzY3JvbGxCYXJCZyA9IG5ldyBHcmFwaGljcygpXG4gICAgc2Nyb2xsQmFyQmcuYmVnaW5GaWxsKDB4QThBOEE4KVxuICAgIHNjcm9sbEJhckJnLmRyYXdSb3VuZGVkUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0LCAyKVxuICAgIHNjcm9sbEJhckJnLmVuZEZpbGwoKVxuXG4gICAgbGV0IHNjcm9sbEJhciA9IG5ldyBHcmFwaGljcygpXG4gICAgc2Nyb2xsQmFyLmJlZ2luRmlsbCgweDIyMjIyMilcbiAgICBzY3JvbGxCYXIuZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDMpXG4gICAgc2Nyb2xsQmFyLmVuZEZpbGwoKVxuICAgIHNjcm9sbEJhci50b1N0cmluZyA9ICgpID0+ICdzY3JvbGxCYXInXG4gICAgV3JhcHBlci5kcmFnZ2FibGUoc2Nyb2xsQmFyLCB7XG4gICAgICBib3VuZGFyeToge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwLFxuICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICB9XG4gICAgfSlcbiAgICBzY3JvbGxCYXIub24oJ2RyYWcnLCB0aGlzLnNjcm9sbE1haW5WaWV3LmJpbmQodGhpcykpXG5cbiAgICBjb25hdGluZXIuYWRkQ2hpbGQoc2Nyb2xsQmFyQmcpXG4gICAgY29uYXRpbmVyLmFkZENoaWxkKHNjcm9sbEJhcilcbiAgICB0aGlzLmFkZENoaWxkKGNvbmF0aW5lcilcbiAgICB0aGlzLnNjcm9sbEJhciA9IHNjcm9sbEJhclxuICAgIHRoaXMuc2Nyb2xsQmFyQmcgPSBzY3JvbGxCYXJCZ1xuICB9XG5cbiAgLy8g5o2y5YuV6KaW56qXXG4gIHNjcm9sbE1haW5WaWV3ICgpIHtcbiAgICB0aGlzLm1haW5WaWV3LnkgPSAodGhpcy53aW5kb3dIZWlnaHQgLSB0aGlzLm1haW5WaWV3LmhlaWdodCkgKiB0aGlzLnNjcm9sbFBlcmNlbnRcbiAgfVxuXG4gIC8vIOaWsOWinueJqeS7tuiHs+imlueql1xuICBhZGRXaW5kb3dDaGlsZCAoY2hpbGQpIHtcbiAgICB0aGlzLm1haW5WaWV3LmFkZENoaWxkKGNoaWxkKVxuICB9XG5cbiAgLy8g5pu05paw5o2y5YuV5qOS5aSn5bCPLCDkuI3kuIDlrpropoHoqr/nlKhcbiAgdXBkYXRlU2Nyb2xsQmFyTGVuZ3RoICgpIHtcbiAgICBsZXQgeyBzY3JvbGxCYXJNaW5IZWlnaHQgPSAyMCB9ID0gdGhpcy5fb3B0XG5cbiAgICBsZXQgZGggPSB0aGlzLm1haW5WaWV3LmhlaWdodCAvIHRoaXMud2luZG93SGVpZ2h0XG4gICAgaWYgKGRoIDwgMSkge1xuICAgICAgdGhpcy5zY3JvbGxCYXIuaGVpZ2h0ID0gdGhpcy5zY3JvbGxCYXJCZy5oZWlnaHRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zY3JvbGxCYXIuaGVpZ2h0ID0gdGhpcy5zY3JvbGxCYXJCZy5oZWlnaHQgLyBkaFxuICAgICAgLy8g6YG/5YWN5aSq5bCP5b6I6Zuj5ouW5puzXG4gICAgICB0aGlzLnNjcm9sbEJhci5oZWlnaHQgPSBNYXRoLm1heChzY3JvbGxCYXJNaW5IZWlnaHQsIHRoaXMuc2Nyb2xsQmFyLmhlaWdodClcbiAgICB9XG4gICAgdGhpcy5zY3JvbGxCYXIuZmFsbGJhY2tUb0JvdW5kYXJ5KClcbiAgfVxuXG4gIC8vIOaNsuWLleeZvuWIhuavlFxuICBnZXQgc2Nyb2xsUGVyY2VudCAoKSB7XG4gICAgbGV0IGRlbHRhID0gdGhpcy5zY3JvbGxCYXJCZy5oZWlnaHQgLSB0aGlzLnNjcm9sbEJhci5oZWlnaHRcbiAgICByZXR1cm4gZGVsdGEgPT09IDAgPyAxIDogdGhpcy5zY3JvbGxCYXIueSAvIGRlbHRhXG4gIH1cblxuICAvLyDmjbLli5Xoh7Pnmb7liIbmr5RcbiAgc2Nyb2xsVG8gKHBlcmNlbnQpIHtcbiAgICBsZXQgZGVsdGEgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodCAtIHRoaXMuc2Nyb2xsQmFyLmhlaWdodFxuICAgIGxldCB5ID0gMFxuICAgIGlmIChkZWx0YSAhPT0gMCkge1xuICAgICAgeSA9IGRlbHRhICogcGVyY2VudFxuICAgIH1cbiAgICB0aGlzLnNjcm9sbEJhci55ID0geVxuICAgIHRoaXMuc2Nyb2xsTWFpblZpZXcoKVxuICB9XG5cbiAgZ2V0IHdpbmRvd1dpZHRoICgpIHtcbiAgICByZXR1cm4gdGhpcy5fd2luZG93V2lkdGhcbiAgfVxuXG4gIGdldCB3aW5kb3dIZWlnaHQgKCkge1xuICAgIHJldHVybiB0aGlzLl93aW5kb3dIZWlnaHRcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3dpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTY3JvbGxhYmxlV2luZG93XG4iLCJpbXBvcnQgeyBDb250YWluZXIsIEdyYXBoaWNzIH0gZnJvbSAnLi4vbGliL1BJWEknXHJcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vbGliL1ZlY3RvcidcclxuXHJcbmltcG9ydCBrZXlib2FyZEpTIGZyb20gJ2tleWJvYXJkanMnXHJcbmltcG9ydCB7IExFRlQsIFVQLCBSSUdIVCwgRE9XTiB9IGZyb20gJy4uL2NvbmZpZy9jb250cm9sJ1xyXG5cclxuY29uc3QgQUxMX0tFWVMgPSBbUklHSFQsIExFRlQsIFVQLCBET1dOXVxyXG5cclxuY2xhc3MgVG91Y2hDb250cm9sUGFuZWwgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHJhZGl1cyB9KSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxyXG5cclxuICAgIGxldCB0b3VjaEFyZWEgPSBuZXcgR3JhcGhpY3MoKVxyXG4gICAgdG91Y2hBcmVhLmJlZ2luRmlsbCgweEYyRjJGMiwgMC41KVxyXG4gICAgdG91Y2hBcmVhLmRyYXdDaXJjbGUoMCwgMCwgcmFkaXVzKVxyXG4gICAgdG91Y2hBcmVhLmVuZEZpbGwoKVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0b3VjaEFyZWEpXHJcbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1c1xyXG5cclxuICAgIHRoaXMuc2V0dXBUb3VjaCgpXHJcbiAgfVxyXG5cclxuICBzZXR1cFRvdWNoICgpIHtcclxuICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICBsZXQgZiA9IHRoaXMub25Ub3VjaC5iaW5kKHRoaXMpXHJcbiAgICB0aGlzLm9uKCd0b3VjaHN0YXJ0JywgZilcclxuICAgIHRoaXMub24oJ3RvdWNoZW5kJywgZilcclxuICAgIHRoaXMub24oJ3RvdWNobW92ZScsIGYpXHJcbiAgICB0aGlzLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBmKVxyXG4gIH1cclxuXHJcbiAgb25Ub3VjaCAoZSkge1xyXG4gICAgbGV0IHR5cGUgPSBlLnR5cGVcclxuICAgIGxldCBwcm9wYWdhdGlvbiA9IGZhbHNlXHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgY2FzZSAndG91Y2hzdGFydCc6XHJcbiAgICAgICAgdGhpcy5kcmFnID0gZS5kYXRhLmdsb2JhbC5jbG9uZSgpXHJcbiAgICAgICAgdGhpcy5jcmVhdGVEcmFnUG9pbnQoKVxyXG4gICAgICAgIHRoaXMub3JpZ2luUG9zaXRpb24gPSB7XHJcbiAgICAgICAgICB4OiB0aGlzLngsXHJcbiAgICAgICAgICB5OiB0aGlzLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAndG91Y2hlbmQnOlxyXG4gICAgICBjYXNlICd0b3VjaGVuZG91dHNpZGUnOlxyXG4gICAgICAgIGlmICh0aGlzLmRyYWcpIHtcclxuICAgICAgICAgIHRoaXMuZHJhZyA9IGZhbHNlXHJcbiAgICAgICAgICB0aGlzLmRlc3Ryb3lEcmFnUG9pbnQoKVxyXG4gICAgICAgICAgdGhpcy5yZWxlYXNlS2V5cygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ3RvdWNobW92ZSc6XHJcbiAgICAgICAgaWYgKCF0aGlzLmRyYWcpIHtcclxuICAgICAgICAgIHByb3BhZ2F0aW9uID0gdHJ1ZVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcmVzc0tleXMoZS5kYXRhLmdldExvY2FsUG9zaXRpb24odGhpcykpXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuICAgIGlmICghcHJvcGFnYXRpb24pIHtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY3JlYXRlRHJhZ1BvaW50ICgpIHtcclxuICAgIGxldCBkcmFnUG9pbnQgPSBuZXcgR3JhcGhpY3MoKVxyXG4gICAgZHJhZ1BvaW50LmJlZ2luRmlsbCgweEYyRjJGMiwgMC41KVxyXG4gICAgZHJhZ1BvaW50LmRyYXdDaXJjbGUoMCwgMCwgMjApXHJcbiAgICBkcmFnUG9pbnQuZW5kRmlsbCgpXHJcbiAgICB0aGlzLmFkZENoaWxkKGRyYWdQb2ludClcclxuICAgIHRoaXMuZHJhZ1BvaW50ID0gZHJhZ1BvaW50XHJcbiAgfVxyXG5cclxuICBkZXN0cm95RHJhZ1BvaW50ICgpIHtcclxuICAgIHRoaXMucmVtb3ZlQ2hpbGQodGhpcy5kcmFnUG9pbnQpXHJcbiAgICB0aGlzLmRyYWdQb2ludC5kZXN0cm95KClcclxuICB9XHJcblxyXG4gIHByZXNzS2V5cyAobmV3UG9pbnQpIHtcclxuICAgIHRoaXMucmVsZWFzZUtleXMoKVxyXG4gICAgLy8g5oSf5oeJ6Z2I5pWP5bqmXHJcbiAgICBsZXQgdGhyZXNob2xkID0gMzBcclxuXHJcbiAgICBsZXQgdmVjdG9yID0gVmVjdG9yLmZyb21Qb2ludChuZXdQb2ludClcclxuICAgIGxldCBkZWcgPSB2ZWN0b3IuZGVnXHJcbiAgICBsZXQgbGVuID0gdmVjdG9yLmxlbmd0aFxyXG5cclxuICAgIGlmIChsZW4gPCB0aHJlc2hvbGQpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBsZXQgZGVnQWJzID0gTWF0aC5hYnMoZGVnKVxyXG4gICAgbGV0IGR4ID0gZGVnQWJzIDwgNjcuNSA/IFJJR0hUIDogKGRlZ0FicyA+IDExMi41ID8gTEVGVCA6IGZhbHNlKVxyXG4gICAgbGV0IGR5ID0gZGVnQWJzIDwgMjIuNSB8fCBkZWdBYnMgPiAxNTcuNSA/IGZhbHNlIDogKGRlZyA8IDAgPyBVUCA6IERPV04pXHJcblxyXG4gICAgaWYgKGR4IHx8IGR5KSB7XHJcbiAgICAgIGlmIChkeCkge1xyXG4gICAgICAgIGtleWJvYXJkSlMucHJlc3NLZXkoZHgpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKGR5KSB7XHJcbiAgICAgICAga2V5Ym9hcmRKUy5wcmVzc0tleShkeSlcclxuICAgICAgfVxyXG4gICAgICB2ZWN0b3IubXVsdGlwbHlTY2FsYXIodGhpcy5yYWRpdXMgLyBsZW4pXHJcbiAgICAgIHRoaXMuZHJhZ1BvaW50LnBvc2l0aW9uLnNldChcclxuICAgICAgICB2ZWN0b3IueCxcclxuICAgICAgICB2ZWN0b3IueVxyXG4gICAgICApXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZWxlYXNlS2V5cyAoKSB7XHJcbiAgICBBTExfS0VZUy5mb3JFYWNoKGtleSA9PiBrZXlib2FyZEpTLnJlbGVhc2VLZXkoa2V5KSlcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnVG91Y2hDb250cm9sUGFuZWwnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUb3VjaENvbnRyb2xQYW5lbFxyXG4iLCJpbXBvcnQgeyBDb250YWluZXIsIEdyYXBoaWNzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5cbmNsYXNzIFdpbmRvdyBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxuXG4gICAgbGV0IGxpbmVXaWR0aCA9IDNcblxuICAgIGxldCB3aW5kb3dCZyA9IG5ldyBHcmFwaGljcygpXG4gICAgd2luZG93QmcuYmVnaW5GaWxsKDB4RjJGMkYyKVxuICAgIHdpbmRvd0JnLmxpbmVTdHlsZShsaW5lV2lkdGgsIDB4MjIyMjIyLCAxKVxuICAgIHdpbmRvd0JnLmRyYXdSb3VuZGVkUmVjdChcbiAgICAgIDAsIDAsXG4gICAgICB3aWR0aCAtIGxpbmVXaWR0aCxcbiAgICAgIGhlaWdodCAtIGxpbmVXaWR0aCxcbiAgICAgIDUpXG4gICAgd2luZG93QmcuZW5kRmlsbCgpXG4gICAgdGhpcy5hZGRDaGlsZCh3aW5kb3dCZylcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3dpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXaW5kb3dcbiIsImNvbnN0IE9QVCA9IFN5bWJvbCgnb3B0JylcblxuZnVuY3Rpb24gX2VuYWJsZURyYWdnYWJsZSAoKSB7XG4gIHRoaXMuZHJhZyA9IGZhbHNlXG4gIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXG4gIGxldCBmID0gX29uVG91Y2guYmluZCh0aGlzKVxuICB0aGlzLm9uKCd0b3VjaHN0YXJ0JywgZilcbiAgdGhpcy5vbigndG91Y2hlbmQnLCBmKVxuICB0aGlzLm9uKCd0b3VjaG1vdmUnLCBmKVxuICB0aGlzLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBmKVxuICB0aGlzLm9uKCdtb3VzZWRvd24nLCBmKVxuICB0aGlzLm9uKCdtb3VzZXVwJywgZilcbiAgdGhpcy5vbignbW91c2Vtb3ZlJywgZilcbiAgdGhpcy5vbignbW91c2V1cG91dHNpZGUnLCBmKVxufVxuXG5mdW5jdGlvbiBfb25Ub3VjaCAoZSkge1xuICBsZXQgdHlwZSA9IGUudHlwZVxuICBsZXQgcHJvcGFnYXRpb24gPSBmYWxzZVxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd0b3VjaHN0YXJ0JzpcbiAgICBjYXNlICdtb3VzZWRvd24nOlxuICAgICAgdGhpcy5kcmFnID0gZS5kYXRhLmdsb2JhbC5jbG9uZSgpXG4gICAgICB0aGlzLm9yaWdpblBvc2l0aW9uID0ge1xuICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgIHk6IHRoaXMueVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd0b3VjaGVuZCc6XG4gICAgY2FzZSAndG91Y2hlbmRvdXRzaWRlJzpcbiAgICBjYXNlICdtb3VzZXVwJzpcbiAgICBjYXNlICdtb3VzZXVwb3V0c2lkZSc6XG4gICAgICB0aGlzLmRyYWcgPSBmYWxzZVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd0b3VjaG1vdmUnOlxuICAgIGNhc2UgJ21vdXNlbW92ZSc6XG4gICAgICBpZiAoIXRoaXMuZHJhZykge1xuICAgICAgICBwcm9wYWdhdGlvbiA9IHRydWVcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGxldCBuZXdQb2ludCA9IGUuZGF0YS5nbG9iYWwuY2xvbmUoKVxuICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoXG4gICAgICAgIHRoaXMub3JpZ2luUG9zaXRpb24ueCArIG5ld1BvaW50LnggLSB0aGlzLmRyYWcueCxcbiAgICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbi55ICsgbmV3UG9pbnQueSAtIHRoaXMuZHJhZy55XG4gICAgICApXG4gICAgICBfZmFsbGJhY2tUb0JvdW5kYXJ5LmNhbGwodGhpcylcbiAgICAgIHRoaXMuZW1pdCgnZHJhZycpIC8vIG1heWJlIGNhbiBwYXNzIHBhcmFtIGZvciBzb21lIHJlYXNvbjogZS5kYXRhLmdldExvY2FsUG9zaXRpb24odGhpcylcbiAgICAgIGJyZWFrXG4gIH1cbiAgaWYgKCFwcm9wYWdhdGlvbikge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxufVxuXG4vLyDpgIDlm57pgornlYxcbmZ1bmN0aW9uIF9mYWxsYmFja1RvQm91bmRhcnkgKCkge1xuICBsZXQgeyB3aWR0aCA9IHRoaXMud2lkdGgsIGhlaWdodCA9IHRoaXMuaGVpZ2h0LCBib3VuZGFyeSB9ID0gdGhpc1tPUFRdXG4gIHRoaXMueCA9IE1hdGgubWF4KHRoaXMueCwgYm91bmRhcnkueClcbiAgdGhpcy54ID0gTWF0aC5taW4odGhpcy54LCBib3VuZGFyeS54ICsgYm91bmRhcnkud2lkdGggLSB3aWR0aClcbiAgdGhpcy55ID0gTWF0aC5tYXgodGhpcy55LCBib3VuZGFyeS55KVxuICB0aGlzLnkgPSBNYXRoLm1pbih0aGlzLnksIGJvdW5kYXJ5LnkgKyBib3VuZGFyeS5oZWlnaHQgLSBoZWlnaHQpXG59XG5jbGFzcyBXcmFwcGVyIHtcbiAgLyoqXG4gICAqIGRpc3BsYXlPYmplY3Q6IHdpbGwgd3JhcHBlZCBEaXNwbGF5T2JqZWN0XG4gICAqIG9wdDoge1xuICAgKiAgYm91bmRhcnk6IOaLluabs+mCiueVjCB7IHgsIHksIHdpZHRoLCBoZWlnaHQgfVxuICAgKiAgWywgd2lkdGhdOiDpgornlYznorDmkp7lr6woZGVmYXVsdDogZGlzcGxheU9iamVjdC53aWR0aClcbiAgICogIFssIGhlaWdodF06IOmCiueVjOeisOaSnumrmChkZWZhdWx0OiBkaXNwbGF5T2JqZWN0LmhlaWdodClcbiAgICogIH1cbiAgICovXG4gIHN0YXRpYyBkcmFnZ2FibGUgKGRpc3BsYXlPYmplY3QsIG9wdCkge1xuICAgIGRpc3BsYXlPYmplY3RbT1BUXSA9IG9wdFxuICAgIF9lbmFibGVEcmFnZ2FibGUuY2FsbChkaXNwbGF5T2JqZWN0KVxuICAgIGRpc3BsYXlPYmplY3QuZmFsbGJhY2tUb0JvdW5kYXJ5ID0gX2ZhbGxiYWNrVG9Cb3VuZGFyeVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdyYXBwZXJcbiJdfQ==
