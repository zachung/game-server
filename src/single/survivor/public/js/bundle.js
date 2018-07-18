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

},{"./lib/Application":21,"./scenes/LoadingScene":63}],19:[function(require,module,exports){
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

},{"./PIXI":29,"./globalEventManager":33}],22:[function(require,module,exports){
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

},{"../config/constants":19}],23:[function(require,module,exports){
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

},{"../config/constants":19,"./PIXI":29}],24:[function(require,module,exports){
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

    // physic
    _this.mapWorld = new _MapWorld2.default();
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
      this.addGameObject(player, toPosition[0] * this.ceilSize, toPosition[1] * this.ceilSize);

      // player 置頂顯示
      player.parentGroup = this.playerGroup;

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
    value: function tick(delta) {}
  }, {
    key: 'addGameObject',
    value: function addGameObject(o) {
      var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      var mapScale = this.mapScale;
      if (x !== undefined) {
        o.position.set(x, y);
      }
      o.scale.set(mapScale, mapScale);
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

},{"../config/constants":19,"../lib/MapWorld":26,"./MapGraph":25,"./PIXI":29,"./utils":34}],25:[function(require,module,exports){
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

},{"./GameObjects":22,"ngraph.graph":8,"ngraph.path":17}],26:[function(require,module,exports){
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

var MapWorld = function () {
  function MapWorld() {
    _classCallCheck(this, MapWorld);

    // physic
    var engine = _Matter.Engine.create();
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
    _Matter.Engine.run(engine);

    var world = engine.world;
    world.gravity.y = 0;

    this.world = world;
  }

  _createClass(MapWorld, [{
    key: 'add',
    value: function add(o) {
      var _this = this;

      if (o.type === _constants.STATIC) {
        return;
      }
      o.addBody();
      var body = o.body;
      o.once('removed', function () {
        _Matter.World.remove(_this.world, body);
      });
      body[PARENT] = o;
      _Matter.World.add(this.world, body);
    }
  }]);

  return MapWorld;
}();

exports.default = MapWorld;

},{"../config/constants":19,"./Matter":27}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{"events":1}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{"./PIXI":29}],31:[function(require,module,exports){
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

},{"../lib/PIXI":29}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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

},{"../objects/Air":35,"../objects/Bullet":36,"../objects/Door":38,"../objects/Grass":40,"../objects/GrassDecorate1":41,"../objects/Ground":42,"../objects/IronFence":43,"../objects/Root":44,"../objects/Torch":45,"../objects/Treasure":46,"../objects/Tree":47,"../objects/Wall":48,"../objects/WallShootBolt":49,"../objects/abilities/Camera":51,"../objects/abilities/Move":59,"../objects/abilities/Operate":60}],35:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"./GameObject":39}],36:[function(require,module,exports){
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

    new _Learn2.default().carryBy(_this).learn(new _Move2.default([2, 0])).learn(new _Health2.default(HealthPoint));

    _this.on('collide', _this.actionWith.bind(_this));
    _this.on('die', _this.onDie.bind(_this));
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
      // 傷害他人
      if (healthAbility) {
        healthAbility.getHurt({
          damage: 1
        });
      }
      // 自我毀滅
      this[_constants.ABILITY_HEALTH].getHurt({
        damage: HealthPoint
      });
    }
  }, {
    key: 'onDie',
    value: function onDie() {
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

},{"../config/constants":19,"../lib/Texture":31,"../objects/abilities/Health":54,"../objects/abilities/Move":59,"./GameObject":39,"./abilities/Learn":58}],37:[function(require,module,exports){
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
    new _Learn2.default().carryBy(_this).learn(new _Move2.default([1])).learn(new _KeyMove2.default()).learn(new _Place2.default()).learn(new _KeyPlace2.default()).learn(new _Camera2.default(1)).learn(carry).learn(new _Fire2.default([3, 3])).learn(new _Rotate2.default()).learn(new _KeyFire2.default()).learn(new _Health2.default(10));

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
    key: 'type',
    get: function get() {
      return _constants.REPLY;
    }
  }]);

  return Cat;
}(_GameObject3.default);

exports.default = Cat;

},{"../config/constants":19,"../lib/Texture":31,"../objects/Bullet":36,"../objects/abilities/Camera":51,"../objects/abilities/Carry":52,"../objects/abilities/Fire":53,"../objects/abilities/Health":54,"../objects/abilities/KeyFire":55,"../objects/abilities/KeyMove":56,"../objects/abilities/KeyPlace":57,"../objects/abilities/Move":59,"../objects/abilities/Place":61,"../objects/abilities/Rotate":62,"./GameObject":39,"./abilities/Learn":58}],38:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"./GameObject":39}],39:[function(require,module,exports){
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
    }
  }, {
    key: 'addBody',
    value: function addBody() {
      if (this.body) {
        return;
      }
      var moveAbility = this[_constants.ABILITY_MOVE];
      var friction = moveAbility && moveAbility.friction !== undefined ? moveAbility.friction : 0.1;
      var frictionAir = moveAbility && moveAbility.frictionAir !== undefined ? moveAbility.frictionAir : 0.01;
      var mass = this.mass ? this.mass : 1;
      var body = _Matter.Bodies.rectangle(this.x, this.y, this.width, this.height, {
        isStatic: this.type === _constants.STAY,
        frictionStatic: friction,
        frictionAir: frictionAir,
        friction: friction,
        mass: mass
      });
      body.position = this.position;
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

},{"../config/constants":19,"../lib/Matter":27,"../lib/Messages":28,"../lib/PIXI":29}],40:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"./GameObject":39}],41:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"./GameObject":39}],42:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"./GameObject":39}],43:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"./GameObject":39}],44:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"./GameObject":39}],45:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Light":23,"../lib/Texture":31,"./GameObject":39}],46:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"../lib/utils":34,"./GameObject":39}],47:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"./GameObject":39}],48:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/Texture":31,"./GameObject":39}],49:[function(require,module,exports){
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
    new _Learn2.default().carryBy(_this).learn(new _Fire2.default([3, 3])).learn(carry).learn(new _Health2.default(10));

    var bullet = new _Bullet2.default();
    carry.take(bullet, Infinity);

    _this.on('collide', _this.actionWith.bind(_this));
    _this.on('die', _this.onDie.bind(_this));
    _this.once('added', _this.setup.bind(_this));
    return _this;
  }

  _createClass(WallShootBolt, [{
    key: 'setup',
    value: function setup() {
      var _this2 = this;

      this.timer = setInterval(function () {
        _this2.rotate(Math.PI / 10, true);

        var rad = _this2.rotation;
        _this2[_constants.ABILITY_FIRE].fire(rad);
        _this2[_constants.ABILITY_FIRE].fire(rad + Math.PI / 2);
        _this2[_constants.ABILITY_FIRE].fire(rad + Math.PI);
        _this2[_constants.ABILITY_FIRE].fire(rad + Math.PI / 2 * 3);
      }, 200);
    }
  }, {
    key: 'actionWith',
    value: function actionWith(operator) {
      operator.emit('collide', this);
    }
  }, {
    key: 'onDie',
    value: function onDie() {
      clearInterval(this.timer);
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

},{"../config/constants":19,"../lib/Texture":31,"../objects/Bullet":36,"../objects/abilities/Carry":52,"../objects/abilities/Fire":53,"../objects/abilities/Health":54,"./GameObject":39,"./abilities/Learn":58}],50:[function(require,module,exports){
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

},{}],51:[function(require,module,exports){
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

},{"../../config/constants":19,"../../lib/Light":23,"./Ability":50}],52:[function(require,module,exports){
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

},{"../../config/constants":19,"./Ability":50}],53:[function(require,module,exports){
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
      if (rad === undefined) {
        // 如果沒指定方向，就用目前面對方向
        var rotateAbility = owner[_constants.ABILITY_ROTATE];
        rad = rotateAbility ? rotateAbility.faceRad : 0;
      }
      var vector = _Vector2.default.fromRadLength(rad, 1);
      bullet.scale.set(scale, scale);
      bullet.setOwner(owner);

      // set position
      var rectLen = calcApothem(owner, rad + owner.rotation);
      var bulletLen = bullet.height / 2; // 射出角等於自身旋角，所以免去運算
      var len = rectLen + bulletLen;
      var position = _Vector2.default.fromRadLength(rad, len).add(_Vector2.default.fromPoint(owner.position));
      bullet.position.set(position.x, position.y);

      bullet.once('added', function () {
        bullet.setDirection(vector);
        bullet.body.isSensor = true;
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

},{"../../config/constants":19,"../../lib/Vector":32,"../Bullet":36,"./Ability":50}],54:[function(require,module,exports){
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
    value: function getHurt(hurt) {
      var preHp = this.hp;
      this.hp -= hurt.damage;
      var sufHp = this.hp;
      this.owner.say([this.owner.toString(), ' get hurt ', hurt.damage, ': ', preHp, ' -> ', sufHp].join(''));
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

},{"../../config/constants":19,"./Ability":50}],55:[function(require,module,exports){
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
      var mouseHandler = function mouseHandler(e) {
        if (e.stopped) {
          return;
        }
        _globalEventManager2.default.emit('fire');
      };
      var fireHandler = fireAbility.fire.bind(fireAbility);

      owner[_constants.ABILITY_KEY_FIRE] = {
        mousedown: mouseHandler,
        fire: fireHandler
      };
      Object.entries(owner[_constants.ABILITY_KEY_FIRE]).forEach(function (_ref) {
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
      Object.entries(owner[_constants.ABILITY_KEY_FIRE]).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            eventName = _ref4[0],
            handler = _ref4[1];

        _globalEventManager2.default.off(eventName, handler);
      });
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

},{"../../config/constants":19,"../../lib/globalEventManager":33,"./Ability":50}],56:[function(require,module,exports){
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

},{"../../config/constants":19,"../../config/control":20,"../../lib/Vector":32,"./Ability":50,"keyboardjs":2}],57:[function(require,module,exports){
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

},{"../../config/constants":19,"../../config/control":20,"./Ability":50,"keyboardjs":2}],58:[function(require,module,exports){
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

},{"../../config/constants":19,"./Ability":50}],59:[function(require,module,exports){
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
      var forceDivide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.17;

      var owner = this.owner;
      if (!owner.body) {
        return;
      }
      _Matter.Body.applyForce(owner.body, owner.position, vector.multiplyScalar(this.value * forceDivide / 1000));
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

},{"../../config/constants":19,"../../lib/Matter":27,"../../lib/Vector":32,"./Ability":50}],60:[function(require,module,exports){
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

},{"../../config/constants":19,"./Ability":50}],61:[function(require,module,exports){
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

},{"../../config/constants":19,"./Ability":50}],62:[function(require,module,exports){
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

},{"../../config/constants":19,"../../lib/Vector":32,"../../lib/globalEventManager":33,"./Ability":50}],63:[function(require,module,exports){
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

},{"../lib/PIXI":29,"../lib/Scene":30,"./PlayScene":64}],64:[function(require,module,exports){
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
      this.addChild(mapLayer);

      var mapData = _PIXI.resources[fileName].data;
      var mapScale = _constants.IS_MOBILE ? 2 : 0.5;

      var map = new _Map2.default(mapScale);
      mapLayer.addChild(map);
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

},{"../config/constants":19,"../lib/Map":24,"../lib/PIXI":29,"../lib/Scene":30,"../lib/globalEventManager":33,"../objects/Cat":37,"../ui/InventoryWindow":65,"../ui/MessageWindow":66,"../ui/PlayerWindow":67,"../ui/TouchDirectionControlPanel":69,"../ui/TouchOperationControlPanel":70}],65:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/PIXI":29,"./Window":72}],66:[function(require,module,exports){
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

},{"../lib/Messages":28,"../lib/PIXI":29,"./ScrollableWindow":68}],67:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/PIXI":29,"./ValueBar":71,"./Window":72}],68:[function(require,module,exports){
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

},{"../lib/PIXI":29,"./Window":72,"./Wrapper":73}],69:[function(require,module,exports){
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

},{"../config/control":20,"../lib/PIXI":29,"../lib/Vector":32,"keyboardjs":2}],70:[function(require,module,exports){
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

},{"../lib/PIXI":29,"../lib/Vector":32,"../lib/globalEventManager":33}],71:[function(require,module,exports){
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

},{"../lib/PIXI":29}],72:[function(require,module,exports){
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

},{"../lib/PIXI":29}],73:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tleWJvYXJkanMvbGliL2tleS1jb21iby5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9rZXlib2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9sb2NhbGUuanMiLCJub2RlX21vZHVsZXMva2V5Ym9hcmRqcy9sb2NhbGVzL3VzLmpzIiwibm9kZV9tb2R1bGVzL25ncmFwaC5ldmVudHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLmdyYXBoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL25ncmFwaC5wYXRoL2Etc3Rhci9Ob2RlSGVhcC5qcyIsIm5vZGVfbW9kdWxlcy9uZ3JhcGgucGF0aC9hLXN0YXIvYS1ncmVlZHktc3Rhci5qcyIsIm5vZGVfbW9kdWxlcy9uZ3JhcGgucGF0aC9hLXN0YXIvYS1zdGFyLmpzIiwibm9kZV9tb2R1bGVzL25ncmFwaC5wYXRoL2Etc3Rhci9kZWZhdWx0U2V0dGluZ3MuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvYS1zdGFyL2hldXJpc3RpY3MuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvYS1zdGFyL21ha2VTZWFyY2hTdGF0ZVBvb2wuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvYS1zdGFyL25iYS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9uZ3JhcGgucGF0aC9hLXN0YXIvbmJhL21ha2VOQkFTZWFyY2hTdGF0ZVBvb2wuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvaW5kZXguanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbmZpZy9jb25zdGFudHMuanMiLCJzcmMvY29uZmlnL2NvbnRyb2wuanMiLCJzcmMvbGliL0FwcGxpY2F0aW9uLmpzIiwic3JjL2xpYi9HYW1lT2JqZWN0cy5qcyIsInNyYy9saWIvTGlnaHQuanMiLCJzcmMvbGliL01hcC5qcyIsInNyYy9saWIvTWFwR3JhcGguanMiLCJzcmMvbGliL01hcFdvcmxkLmpzIiwic3JjL2xpYi9NYXR0ZXIuanMiLCJzcmMvbGliL01lc3NhZ2VzLmpzIiwic3JjL2xpYi9QSVhJLmpzIiwic3JjL2xpYi9TY2VuZS5qcyIsInNyYy9saWIvVGV4dHVyZS5qcyIsInNyYy9saWIvVmVjdG9yLmpzIiwic3JjL2xpYi9nbG9iYWxFdmVudE1hbmFnZXIuanMiLCJzcmMvbGliL3V0aWxzLmpzIiwic3JjL29iamVjdHMvQWlyLmpzIiwic3JjL29iamVjdHMvQnVsbGV0LmpzIiwic3JjL29iamVjdHMvQ2F0LmpzIiwic3JjL29iamVjdHMvRG9vci5qcyIsInNyYy9vYmplY3RzL0dhbWVPYmplY3QuanMiLCJzcmMvb2JqZWN0cy9HcmFzcy5qcyIsInNyYy9vYmplY3RzL0dyYXNzRGVjb3JhdGUxLmpzIiwic3JjL29iamVjdHMvR3JvdW5kLmpzIiwic3JjL29iamVjdHMvSXJvbkZlbmNlLmpzIiwic3JjL29iamVjdHMvUm9vdC5qcyIsInNyYy9vYmplY3RzL1RvcmNoLmpzIiwic3JjL29iamVjdHMvVHJlYXN1cmUuanMiLCJzcmMvb2JqZWN0cy9UcmVlLmpzIiwic3JjL29iamVjdHMvV2FsbC5qcyIsInNyYy9vYmplY3RzL1dhbGxTaG9vdEJvbHQuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvQWJpbGl0eS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvQ2FycnkuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvRmlyZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9IZWFsdGguanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvS2V5RmlyZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9LZXlNb3ZlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0tleVBsYWNlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0xlYXJuLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL01vdmUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvT3BlcmF0ZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9QbGFjZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9Sb3RhdGUuanMiLCJzcmMvc2NlbmVzL0xvYWRpbmdTY2VuZS5qcyIsInNyYy9zY2VuZXMvUGxheVNjZW5lLmpzIiwic3JjL3VpL0ludmVudG9yeVdpbmRvdy5qcyIsInNyYy91aS9NZXNzYWdlV2luZG93LmpzIiwic3JjL3VpL1BsYXllcldpbmRvdy5qcyIsInNyYy91aS9TY3JvbGxhYmxlV2luZG93LmpzIiwic3JjL3VpL1RvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsLmpzIiwic3JjL3VpL1RvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsLmpzIiwic3JjL3VpL1ZhbHVlQmFyLmpzIiwic3JjL3VpL1dpbmRvdy5qcyIsInNyYy91aS9XcmFwcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3psQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFTLENBQVQ7QUFDQSxPQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBUyxLQUFULENBQUEsRUFBaUIsU0FBQSxDQUFBLEdBQWEsU0FBYixLQUFBLEdBQTFCLEtBQVMsQ0FBVDtBQUNBLE9BQUEsQ0FBQSxHQUFTLEtBQUEsR0FBQSxDQUFTLEtBQVQsQ0FBQSxFQUFpQixTQUExQixDQUFTLENBQVQ7QUFDQSxPQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBUyxLQUFULENBQUEsRUFBaUIsU0FBQSxDQUFBLEdBQWEsU0FBYixNQUFBLEdBQTFCLE1BQVMsQ0FBVDtBQUNEOztJQUNLLFU7Ozs7Ozs7O0FBQ0o7Ozs7Ozs7OzhCQVFrQixhLEVBQWUsRyxFQUFLO0FBQ3BDLG9CQUFBLEdBQUEsSUFBQSxHQUFBO0FBQ0EsdUJBQUEsSUFBQSxDQUFBLGFBQUE7QUFDQSxvQkFBQSxrQkFBQSxHQUFBLG1CQUFBO0FBQ0Q7Ozs7OztrQkFHWSxPIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IG9iamVjdENyZWF0ZVBvbHlmaWxsXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IG9iamVjdEtleXNQb2x5ZmlsbFxudmFyIGJpbmQgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fCBmdW5jdGlvbkJpbmRQb2x5ZmlsbFxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19ldmVudHMnKSkge1xuICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG52YXIgaGFzRGVmaW5lUHJvcGVydHk7XG50cnkge1xuICB2YXIgbyA9IHt9O1xuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgJ3gnLCB7IHZhbHVlOiAwIH0pO1xuICBoYXNEZWZpbmVQcm9wZXJ0eSA9IG8ueCA9PT0gMDtcbn0gY2F0Y2ggKGVycikgeyBoYXNEZWZpbmVQcm9wZXJ0eSA9IGZhbHNlIH1cbmlmIChoYXNEZWZpbmVQcm9wZXJ0eSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRFbWl0dGVyLCAnZGVmYXVsdE1heExpc3RlbmVycycsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBpbnB1dCBpcyBhIHBvc2l0aXZlIG51bWJlciAod2hvc2UgdmFsdWUgaXMgemVybyBvclxuICAgICAgLy8gZ3JlYXRlciBhbmQgbm90IGEgTmFOKS5cbiAgICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IGFyZyAhPT0gYXJnKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgICBkZWZhdWx0TWF4TGlzdGVuZXJzID0gYXJnO1xuICAgIH1cbiAgfSk7XG59IGVsc2Uge1xuICBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJuXCIgYXJndW1lbnQgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uICRnZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuICRnZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG4vLyBUaGVzZSBzdGFuZGFsb25lIGVtaXQqIGZ1bmN0aW9ucyBhcmUgdXNlZCB0byBvcHRpbWl6ZSBjYWxsaW5nIG9mIGV2ZW50XG4vLyBoYW5kbGVycyBmb3IgZmFzdCBjYXNlcyBiZWNhdXNlIGVtaXQoKSBpdHNlbGYgb2Z0ZW4gaGFzIGEgdmFyaWFibGUgbnVtYmVyIG9mXG4vLyBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBiZWNhdXNlIG9mIHRoYXQuIFRoZXNlIGZ1bmN0aW9ucyBhbHdheXMgaGF2ZVxuLy8gdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgdGh1cyBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLCBzbyB0aGUgY29kZVxuLy8gaW5zaWRlIHRoZW0gY2FuIGV4ZWN1dGUgZmFzdGVyLlxuZnVuY3Rpb24gZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgc2VsZikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyLCBhcmczKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZ3MpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5hcHBseShzZWxmLCBhcmdzKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGV2ZW50cztcbiAgdmFyIGRvRXJyb3IgPSAodHlwZSA9PT0gJ2Vycm9yJyk7XG5cbiAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzKVxuICAgIGRvRXJyb3IgPSAoZG9FcnJvciAmJiBldmVudHMuZXJyb3IgPT0gbnVsbCk7XG4gIGVsc2UgaWYgKCFkb0Vycm9yKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmIChkb0Vycm9yKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKVxuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKCFoYW5kbGVyKVxuICAgIHJldHVybiBmYWxzZTtcblxuICB2YXIgaXNGbiA9IHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nO1xuICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICBzd2l0Y2ggKGxlbikge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgIGNhc2UgMTpcbiAgICAgIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHRoaXMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7XG4gICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgIGRlZmF1bHQ6XG4gICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBfYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgcHJlcGVuZCkge1xuICB2YXIgbTtcbiAgdmFyIGV2ZW50cztcbiAgdmFyIGV4aXN0aW5nO1xuXG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICBpZiAoIWV2ZW50cykge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICAgICAgLy8gUmUtYXNzaWduIGBldmVudHNgIGJlY2F1c2UgYSBuZXdMaXN0ZW5lciBoYW5kbGVyIGNvdWxkIGhhdmUgY2F1c2VkIHRoZVxuICAgICAgLy8gdGhpcy5fZXZlbnRzIHRvIGJlIGFzc2lnbmVkIHRvIGEgbmV3IG9iamVjdFxuICAgICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gICAgfVxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgaWYgKCFleGlzdGluZykge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgICBpZiAocHJlcGVuZCkge1xuICAgICAgICBleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCFleGlzdGluZy53YXJuZWQpIHtcbiAgICAgIG0gPSAkZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgICBpZiAobSAmJiBtID4gMCAmJiBleGlzdGluZy5sZW5ndGggPiBtKSB7XG4gICAgICAgIGV4aXN0aW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgZXhpc3RpbmcubGVuZ3RoICsgJyBcIicgKyBTdHJpbmcodHlwZSkgKyAnXCIgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICdpbmNyZWFzZSBsaW1pdC4nKTtcbiAgICAgICAgdy5uYW1lID0gJ01heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyc7XG4gICAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgICAgdy5jb3VudCA9IGV4aXN0aW5nLmxlbmd0aDtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0JyAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJyVzOiAlcycsIHcubmFtZSwgdy5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdKTtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSxcbiAgICAgICAgICAgIGFyZ3VtZW50c1syXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKVxuICAgICAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3MpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBiaW5kLmNhbGwob25jZVdyYXBwZXIsIHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAoIWxpc3QpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdC5saXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxpc3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcG9zaXRpb24gPSAtMTtcblxuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8IGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBvcmlnaW5hbExpc3RlbmVyID0gbGlzdFtpXS5saXN0ZW5lcjtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgb3JpZ2luYWxMaXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgICAgIGlmICghZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0pIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gb2JqZWN0S2V5cyhldmVudHMpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIC8vIExJRk8gb3JkZXJcbiAgICAgICAgZm9yIChpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbmZ1bmN0aW9uIF9saXN0ZW5lcnModGFyZ2V0LCB0eXBlLCB1bndyYXApIHtcbiAgdmFyIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuXG4gIGlmICghZXZlbnRzKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKCFldmxpc3RlbmVyKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgPyB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGV2bGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3Qub3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG4vLyBBYm91dCAxLjV4IGZhc3RlciB0aGFuIHRoZSB0d28tYXJnIHZlcnNpb24gb2YgQXJyYXkjc3BsaWNlKCkuXG5mdW5jdGlvbiBzcGxpY2VPbmUobGlzdCwgaW5kZXgpIHtcbiAgZm9yICh2YXIgaSA9IGluZGV4LCBrID0gaSArIDEsIG4gPSBsaXN0Lmxlbmd0aDsgayA8IG47IGkgKz0gMSwgayArPSAxKVxuICAgIGxpc3RbaV0gPSBsaXN0W2tdO1xuICBsaXN0LnBvcCgpO1xufVxuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9iamVjdENyZWF0ZVBvbHlmaWxsKHByb3RvKSB7XG4gIHZhciBGID0gZnVuY3Rpb24oKSB7fTtcbiAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgcmV0dXJuIG5ldyBGO1xufVxuZnVuY3Rpb24gb2JqZWN0S2V5c1BvbHlmaWxsKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrIGluIG9iaikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGspKSB7XG4gICAga2V5cy5wdXNoKGspO1xuICB9XG4gIHJldHVybiBrO1xufVxuZnVuY3Rpb24gZnVuY3Rpb25CaW5kUG9seWZpbGwoY29udGV4dCkge1xuICB2YXIgZm4gPSB0aGlzO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICB9O1xufVxuIiwiXG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKCcuL2xpYi9rZXlib2FyZCcpO1xudmFyIExvY2FsZSAgID0gcmVxdWlyZSgnLi9saWIvbG9jYWxlJyk7XG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2xpYi9rZXktY29tYm8nKTtcblxudmFyIGtleWJvYXJkID0gbmV3IEtleWJvYXJkKCk7XG5cbmtleWJvYXJkLnNldExvY2FsZSgndXMnLCByZXF1aXJlKCcuL2xvY2FsZXMvdXMnKSk7XG5cbmV4cG9ydHMgICAgICAgICAgPSBtb2R1bGUuZXhwb3J0cyA9IGtleWJvYXJkO1xuZXhwb3J0cy5LZXlib2FyZCA9IEtleWJvYXJkO1xuZXhwb3J0cy5Mb2NhbGUgICA9IExvY2FsZTtcbmV4cG9ydHMuS2V5Q29tYm8gPSBLZXlDb21ibztcbiIsIlxuZnVuY3Rpb24gS2V5Q29tYm8oa2V5Q29tYm9TdHIpIHtcbiAgdGhpcy5zb3VyY2VTdHIgPSBrZXlDb21ib1N0cjtcbiAgdGhpcy5zdWJDb21ib3MgPSBLZXlDb21iby5wYXJzZUNvbWJvU3RyKGtleUNvbWJvU3RyKTtcbiAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoZnVuY3Rpb24obWVtbywgbmV4dFN1YkNvbWJvKSB7XG4gICAgcmV0dXJuIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyk7XG4gIH0sIFtdKTtcbn1cblxuLy8gVE9ETzogQWRkIHN1cHBvcnQgZm9yIGtleSBjb21ibyBzZXF1ZW5jZXNcbktleUNvbWJvLnNlcXVlbmNlRGVsaW1pbmF0b3IgPSAnPj4nO1xuS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvciAgICA9ICc+JztcbktleUNvbWJvLmtleURlbGltaW5hdG9yICAgICAgPSAnKyc7XG5cbktleUNvbWJvLnBhcnNlQ29tYm9TdHIgPSBmdW5jdGlvbihrZXlDb21ib1N0cikge1xuICB2YXIgc3ViQ29tYm9TdHJzID0gS2V5Q29tYm8uX3NwbGl0U3RyKGtleUNvbWJvU3RyLCBLZXlDb21iby5jb21ib0RlbGltaW5hdG9yKTtcbiAgdmFyIGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59O1xuXG5LZXlDb21iby5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbihwcmVzc2VkS2V5TmFtZXMpIHtcbiAgdmFyIHN0YXJ0aW5nS2V5TmFtZUluZGV4ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHN0YXJ0aW5nS2V5TmFtZUluZGV4ID0gdGhpcy5fY2hlY2tTdWJDb21ibyhcbiAgICAgIHRoaXMuc3ViQ29tYm9zW2ldLFxuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICBwcmVzc2VkS2V5TmFtZXNcbiAgICApO1xuICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5LZXlDb21iby5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uKG90aGVyS2V5Q29tYm8pIHtcbiAgaWYgKFxuICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgdHlwZW9mIG90aGVyS2V5Q29tYm8gIT09ICdzdHJpbmcnICYmXG4gICAgdHlwZW9mIG90aGVyS2V5Q29tYm8gIT09ICdvYmplY3QnXG4gICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBpZiAodHlwZW9mIG90aGVyS2V5Q29tYm8gPT09ICdzdHJpbmcnKSB7XG4gICAgb3RoZXJLZXlDb21ibyA9IG5ldyBLZXlDb21ibyhvdGhlcktleUNvbWJvKTtcbiAgfVxuXG4gIGlmICh0aGlzLnN1YkNvbWJvcy5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zW2ldLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3NbaV0ubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBzdWJDb21ibyAgICAgID0gdGhpcy5zdWJDb21ib3NbaV07XG4gICAgdmFyIG90aGVyU3ViQ29tYm8gPSBvdGhlcktleUNvbWJvLnN1YkNvbWJvc1tpXS5zbGljZSgwKTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViQ29tYm8ubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgIHZhciBrZXlOYW1lID0gc3ViQ29tYm9bal07XG4gICAgICB2YXIgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgb3RoZXJTdWJDb21iby5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3RoZXJTdWJDb21iby5sZW5ndGggIT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgdmFyIHMgID0gc3RyO1xuICB2YXIgZCAgPSBkZWxpbWluYXRvcjtcbiAgdmFyIGMgID0gJyc7XG4gIHZhciBjYSA9IFtdO1xuXG4gIGZvciAodmFyIGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG5cbktleUNvbWJvLnByb3RvdHlwZS5fY2hlY2tTdWJDb21ibyA9IGZ1bmN0aW9uKHN1YkNvbWJvLCBzdGFydGluZ0tleU5hbWVJbmRleCwgcHJlc3NlZEtleU5hbWVzKSB7XG4gIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gIHByZXNzZWRLZXlOYW1lcyA9IHByZXNzZWRLZXlOYW1lcy5zbGljZShzdGFydGluZ0tleU5hbWVJbmRleCk7XG5cbiAgdmFyIGVuZEluZGV4ID0gc3RhcnRpbmdLZXlOYW1lSW5kZXg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgIHZhciBrZXlOYW1lID0gc3ViQ29tYm9baV07XG4gICAgaWYgKGtleU5hbWVbMF0gPT09ICdcXFxcJykge1xuICAgICAgdmFyIGVzY2FwZWRLZXlOYW1lID0ga2V5TmFtZS5zbGljZSgxKTtcbiAgICAgIGlmIChcbiAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmtleURlbGltaW5hdG9yXG4gICAgICApIHtcbiAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpbmRleCA9IHByZXNzZWRLZXlOYW1lcy5pbmRleE9mKGtleU5hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgICBpZiAoaW5kZXggPiBlbmRJbmRleCkge1xuICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgfVxuICAgICAgaWYgKHN1YkNvbWJvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBLZXlDb21ibztcbiIsIlxudmFyIExvY2FsZSA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xuXG5cbmZ1bmN0aW9uIEtleWJvYXJkKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgICA9IG51bGw7XG4gIHRoaXMuX2N1cnJlbnRDb250ZXh0ICAgICAgID0gbnVsbDtcbiAgdGhpcy5fY29udGV4dHMgICAgICAgICAgICAgPSB7fTtcbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcbiAgdGhpcy5fYXBwbGllZExpc3RlbmVycyAgICAgPSBbXTtcbiAgdGhpcy5fbG9jYWxlcyAgICAgICAgICAgICAgPSB7fTtcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRXaW5kb3cgICAgICAgICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICAgICAgID0gJyc7XG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XG4gIHRoaXMuX2lzTW9kZXJuQnJvd3NlciAgICAgID0gZmFsc2U7XG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcgICA9IG51bGw7XG4gIHRoaXMuX3BhdXNlZCAgICAgICAgICAgICAgID0gZmFsc2U7XG4gIHRoaXMuX2NhbGxlckhhbmRsZXIgICAgICAgID0gbnVsbDtcblxuICB0aGlzLnNldENvbnRleHQoJ2dsb2JhbCcpO1xuICB0aGlzLndhdGNoKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCk7XG59XG5cbktleWJvYXJkLnByb3RvdHlwZS5zZXRMb2NhbGUgPSBmdW5jdGlvbihsb2NhbGVOYW1lLCBsb2NhbGVCdWlsZGVyKSB7XG4gIHZhciBsb2NhbGUgPSBudWxsO1xuICBpZiAodHlwZW9mIGxvY2FsZU5hbWUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICBpZiAobG9jYWxlQnVpbGRlcikge1xuICAgICAgbG9jYWxlID0gbmV3IExvY2FsZShsb2NhbGVOYW1lKTtcbiAgICAgIGxvY2FsZUJ1aWxkZXIobG9jYWxlLCB0aGlzLl90YXJnZXRQbGF0Zm9ybSwgdGhpcy5fdGFyZ2V0VXNlckFnZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9jYWxlID0gdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSB8fCBudWxsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsb2NhbGUgICAgID0gbG9jYWxlTmFtZTtcbiAgICBsb2NhbGVOYW1lID0gbG9jYWxlLl9sb2NhbGVOYW1lO1xuICB9XG5cbiAgdGhpcy5fbG9jYWxlICAgICAgICAgICAgICA9IGxvY2FsZTtcbiAgdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSA9IGxvY2FsZTtcbiAgaWYgKGxvY2FsZSkge1xuICAgIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cyA9IGxvY2FsZS5wcmVzc2VkS2V5cztcbiAgfVxufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLmdldExvY2FsZSA9IGZ1bmN0aW9uKGxvY2FsTmFtZSkge1xuICBsb2NhbE5hbWUgfHwgKGxvY2FsTmFtZSA9IHRoaXMuX2xvY2FsZS5sb2NhbGVOYW1lKTtcbiAgcmV0dXJuIHRoaXMuX2xvY2FsZXNbbG9jYWxOYW1lXSB8fCBudWxsO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA9IHJlbGVhc2VIYW5kbGVyO1xuICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgPSBwcmVzc0hhbmRsZXI7XG4gICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA9IGtleUNvbWJvU3RyO1xuICAgIGtleUNvbWJvU3RyICAgICAgICAgICAgPSBudWxsO1xuICB9XG5cbiAgaWYgKFxuICAgIGtleUNvbWJvU3RyICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuX2xpc3RlbmVycy5wdXNoKHtcbiAgICBrZXlDb21ibyAgICAgICAgICAgICAgIDoga2V5Q29tYm9TdHIgPyBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpIDogbnVsbCxcbiAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogcHJlc3NIYW5kbGVyICAgICAgICAgICB8fCBudWxsLFxuICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgOiByZWxlYXNlSGFuZGxlciAgICAgICAgIHx8IG51bGwsXG4gICAgcHJldmVudFJlcGVhdCAgICAgICAgICA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2UsXG4gICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2VcbiAgfSk7XG59O1xuS2V5Ym9hcmQucHJvdG90eXBlLmFkZExpc3RlbmVyID0gS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQ7XG5LZXlib2FyZC5wcm90b3R5cGUub24gICAgICAgICAgPSBLZXlib2FyZC5wcm90b3R5cGUuYmluZDtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKSB7XG4gIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZWxlYXNlSGFuZGxlciA9IHByZXNzSGFuZGxlcjtcbiAgICBwcmVzc0hhbmRsZXIgICA9IGtleUNvbWJvU3RyO1xuICAgIGtleUNvbWJvU3RyID0gbnVsbDtcbiAgfVxuXG4gIGlmIChcbiAgICBrZXlDb21ib1N0ciAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xuICApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnVuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2ldO1xuXG4gICAgdmFyIGNvbWJvTWF0Y2hlcyAgICAgICAgICA9ICFrZXlDb21ib1N0ciAmJiAhbGlzdGVuZXIua2V5Q29tYm8gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIua2V5Q29tYm8gJiYgbGlzdGVuZXIua2V5Q29tYm8uaXNFcXVhbChrZXlDb21ib1N0cik7XG4gICAgdmFyIHByZXNzSGFuZGxlck1hdGNoZXMgICA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFwcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXNzSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzc0hhbmRsZXIgPT09IGxpc3RlbmVyLnByZXNzSGFuZGxlcjtcbiAgICB2YXIgcmVsZWFzZUhhbmRsZXJNYXRjaGVzID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXJlbGVhc2VIYW5kbGVyICYmICFsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlSGFuZGxlciA9PT0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XG5cbiAgICBpZiAoY29tYm9NYXRjaGVzICYmIHByZXNzSGFuZGxlck1hdGNoZXMgJiYgcmVsZWFzZUhhbmRsZXJNYXRjaGVzKSB7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcbktleWJvYXJkLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IEtleWJvYXJkLnByb3RvdHlwZS51bmJpbmQ7XG5LZXlib2FyZC5wcm90b3R5cGUub2ZmICAgICAgICAgICAgPSBLZXlib2FyZC5wcm90b3R5cGUudW5iaW5kO1xuXG5LZXlib2FyZC5wcm90b3R5cGUuc2V0Q29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHROYW1lKSB7XG4gIGlmKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cblxuICBpZiAoIXRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXSkge1xuICAgIHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXSA9IFtdO1xuICB9XG4gIHRoaXMuX2xpc3RlbmVycyAgICAgID0gdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdO1xuICB0aGlzLl9jdXJyZW50Q29udGV4dCA9IGNvbnRleHROYW1lO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2N1cnJlbnRDb250ZXh0O1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLndpdGhDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUsIGNhbGxiYWNrKSB7XG4gIHZhciBwcmV2aW91c0NvbnRleHROYW1lID0gdGhpcy5nZXRDb250ZXh0KCk7XG4gIHRoaXMuc2V0Q29udGV4dChjb250ZXh0TmFtZSk7XG5cbiAgY2FsbGJhY2soKTtcblxuICB0aGlzLnNldENvbnRleHQocHJldmlvdXNDb250ZXh0TmFtZSk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUud2F0Y2ggPSBmdW5jdGlvbih0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHRhcmdldFBsYXRmb3JtLCB0YXJnZXRVc2VyQWdlbnQpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB0aGlzLnN0b3AoKTtcblxuICBpZiAoIXRhcmdldFdpbmRvdykge1xuICAgIGlmICghZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgJiYgIWdsb2JhbC5hdHRhY2hFdmVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBnbG9iYWwgZnVuY3Rpb25zIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XG4gICAgfVxuICAgIHRhcmdldFdpbmRvdyA9IGdsb2JhbDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdGFyZ2V0V2luZG93Lm5vZGVUeXBlID09PSAnbnVtYmVyJykge1xuICAgIHRhcmdldFVzZXJBZ2VudCA9IHRhcmdldFBsYXRmb3JtO1xuICAgIHRhcmdldFBsYXRmb3JtICA9IHRhcmdldEVsZW1lbnQ7XG4gICAgdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93O1xuICAgIHRhcmdldFdpbmRvdyAgICA9IGdsb2JhbDtcbiAgfVxuXG4gIGlmICghdGFyZ2V0V2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJiYgIXRhcmdldFdpbmRvdy5hdHRhY2hFdmVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudCBtZXRob2RzIG9uIHRhcmdldFdpbmRvdy4nKTtcbiAgfVxuXG4gIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA9ICEhdGFyZ2V0V2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5cbiAgdmFyIHVzZXJBZ2VudCA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgfHwgJyc7XG4gIHZhciBwbGF0Zm9ybSAgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm0gIHx8ICcnO1xuXG4gIHRhcmdldEVsZW1lbnQgICAmJiB0YXJnZXRFbGVtZW50ICAgIT09IG51bGwgfHwgKHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdy5kb2N1bWVudCk7XG4gIHRhcmdldFBsYXRmb3JtICAmJiB0YXJnZXRQbGF0Zm9ybSAgIT09IG51bGwgfHwgKHRhcmdldFBsYXRmb3JtICA9IHBsYXRmb3JtKTtcbiAgdGFyZ2V0VXNlckFnZW50ICYmIHRhcmdldFVzZXJBZ2VudCAhPT0gbnVsbCB8fCAodGFyZ2V0VXNlckFnZW50ID0gdXNlckFnZW50KTtcblxuICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMucHJlc3NLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xuICAgIF90aGlzLl9oYW5kbGVDb21tYW5kQnVnKGV2ZW50LCBwbGF0Zm9ybSk7XG4gIH07XG4gIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMucmVsZWFzZUtleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gIH07XG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMucmVsZWFzZUFsbEtleXMoZXZlbnQpXG4gIH07XG5cbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuXG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgICA9IHRhcmdldEVsZW1lbnQ7XG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgICA9IHRhcmdldFdpbmRvdztcbiAgdGhpcy5fdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0UGxhdGZvcm07XG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCA9IHRhcmdldFVzZXJBZ2VudDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgaWYgKCF0aGlzLl90YXJnZXRFbGVtZW50IHx8ICF0aGlzLl90YXJnZXRXaW5kb3cpIHsgcmV0dXJuOyB9XG5cbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgdGhpcy5fdGFyZ2V0V2luZG93ICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgPSBudWxsO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnByZXNzS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgdGhpcy5fbG9jYWxlLnByZXNzS2V5KGtleUNvZGUpO1xuICB0aGlzLl9hcHBseUJpbmRpbmdzKGV2ZW50KTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZWxlYXNlS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgdGhpcy5fbG9jYWxlLnJlbGVhc2VLZXkoa2V5Q29kZSk7XG4gIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VBbGxLZXlzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XG4gIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICh0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG4gIHRoaXMuX3BhdXNlZCA9IHRydWU7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmVsZWFzZUFsbEtleXMoKTtcbiAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2JpbmRFdmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICB0YXJnZXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgIHRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX3VuYmluZEV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgIHRhcmdldEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgdGFyZ2V0RWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fZ2V0R3JvdXBlZExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGlzdGVuZXJHcm91cHMgICA9IFtdO1xuICB2YXIgbGlzdGVuZXJHcm91cE1hcCA9IFtdO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gIGlmICh0aGlzLl9jdXJyZW50Q29udGV4dCAhPT0gJ2dsb2JhbCcpIHtcbiAgICBsaXN0ZW5lcnMgPSBbXS5jb25jYXQobGlzdGVuZXJzLCB0aGlzLl9jb250ZXh0cy5nbG9iYWwpO1xuICB9XG5cbiAgbGlzdGVuZXJzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiAoYi5rZXlDb21ibyA/IGIua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCkgLSAoYS5rZXlDb21ibyA/IGEua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCk7XG4gIH0pLmZvckVhY2goZnVuY3Rpb24obCkge1xuICAgIHZhciBtYXBJbmRleCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgaWYgKGxpc3RlbmVyR3JvdXBNYXBbaV0gPT09IG51bGwgJiYgbC5rZXlDb21ibyA9PT0gbnVsbCB8fFxuICAgICAgICAgIGxpc3RlbmVyR3JvdXBNYXBbaV0gIT09IG51bGwgJiYgbGlzdGVuZXJHcm91cE1hcFtpXS5pc0VxdWFsKGwua2V5Q29tYm8pKSB7XG4gICAgICAgIG1hcEluZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1hcEluZGV4ID09PSAtMSkge1xuICAgICAgbWFwSW5kZXggPSBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDtcbiAgICAgIGxpc3RlbmVyR3JvdXBNYXAucHVzaChsLmtleUNvbWJvKTtcbiAgICB9XG4gICAgaWYgKCFsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0pIHtcbiAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSA9IFtdO1xuICAgIH1cbiAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0ucHVzaChsKTtcbiAgfSk7XG4gIHJldHVybiBsaXN0ZW5lckdyb3Vwcztcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fYXBwbHlCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBwcmV2ZW50UmVwZWF0ID0gZmFsc2U7XG5cbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuICBldmVudC5wcmV2ZW50UmVwZWF0ID0gZnVuY3Rpb24oKSB7IHByZXZlbnRSZXBlYXQgPSB0cnVlOyB9O1xuICBldmVudC5wcmVzc2VkS2V5cyAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuXG4gIHZhciBwcmVzc2VkS2V5cyAgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcbiAgdmFyIGxpc3RlbmVyR3JvdXBzID0gdGhpcy5fZ2V0R3JvdXBlZExpc3RlbmVycygpO1xuXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3Vwcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBsaXN0ZW5lckdyb3Vwc1tpXTtcbiAgICB2YXIga2V5Q29tYm8gID0gbGlzdGVuZXJzWzBdLmtleUNvbWJvO1xuXG4gICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8IGtleUNvbWJvLmNoZWNrKHByZXNzZWRLZXlzKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBsaXN0ZW5lcnMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2pdO1xuXG4gICAgICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCkge1xuICAgICAgICAgIGxpc3RlbmVyID0ge1xuICAgICAgICAgICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IG5ldyBLZXlDb21ibyhwcmVzc2VkS2V5cy5qb2luKCcrJykpLFxuICAgICAgICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IGxpc3RlbmVyLnByZXNzSGFuZGxlcixcbiAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgOiBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcixcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0LFxuICAgICAgICAgICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA6IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHRcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVyLnByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJldmVudFJlcGVhdCkge1xuICAgICAgICAgIGxpc3RlbmVyLnByZXNzSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICBpZiAocHJldmVudFJlcGVhdCkge1xuICAgICAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IHByZXZlbnRSZXBlYXQ7XG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyICYmIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcikgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoa2V5Q29tYm8pIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrZXlDb21iby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgIHZhciBpbmRleCA9IHByZXNzZWRLZXlzLmluZGV4T2Yoa2V5Q29tYm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2NsZWFyQmluZGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xuICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5fYXBwbGllZExpc3RlbmVyc1tpXTtcbiAgICB2YXIga2V5Q29tYm8gPSBsaXN0ZW5lci5rZXlDb21ibztcbiAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwgIWtleUNvbWJvLmNoZWNrKHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGlmICh0aGlzLl9jYWxsZXJIYW5kbGVyICE9PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcikge1xuICAgICAgICB2YXIgb2xkQ2FsbGVyID0gdGhpcy5fY2FsbGVySGFuZGxlcjtcbiAgICAgICAgdGhpcy5fY2FsbGVySGFuZGxlciA9IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xuICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdDtcbiAgICAgICAgbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgIHRoaXMuX2NhbGxlckhhbmRsZXIgPSBvbGRDYWxsZXI7XG4gICAgICB9XG4gICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICB9XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5faGFuZGxlQ29tbWFuZEJ1ZyA9IGZ1bmN0aW9uKGV2ZW50LCBwbGF0Zm9ybSkge1xuICAvLyBPbiBNYWMgd2hlbiB0aGUgY29tbWFuZCBrZXkgaXMga2VwdCBwcmVzc2VkLCBrZXl1cCBpcyBub3QgdHJpZ2dlcmVkIGZvciBhbnkgb3RoZXIga2V5LlxuICAvLyBJbiB0aGlzIGNhc2UgZm9yY2UgYSBrZXl1cCBmb3Igbm9uLW1vZGlmaWVyIGtleXMgZGlyZWN0bHkgYWZ0ZXIgdGhlIGtleXByZXNzLlxuICB2YXIgbW9kaWZpZXJLZXlzID0gW1wic2hpZnRcIiwgXCJjdHJsXCIsIFwiYWx0XCIsIFwiY2Fwc2xvY2tcIiwgXCJ0YWJcIiwgXCJjb21tYW5kXCJdO1xuICBpZiAocGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgJiYgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmluY2x1ZGVzKFwiY29tbWFuZFwiKSAmJlxuICAgICAgIW1vZGlmaWVyS2V5cy5pbmNsdWRlcyh0aGlzLl9sb2NhbGUuZ2V0S2V5TmFtZXMoZXZlbnQua2V5Q29kZSlbMF0pKSB7XG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKGV2ZW50KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcbiIsIlxudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9rZXktY29tYm8nKTtcblxuXG5mdW5jdGlvbiBMb2NhbGUobmFtZSkge1xuICB0aGlzLmxvY2FsZU5hbWUgICAgID0gbmFtZTtcbiAgdGhpcy5wcmVzc2VkS2V5cyAgICA9IFtdO1xuICB0aGlzLl9hcHBsaWVkTWFjcm9zID0gW107XG4gIHRoaXMuX2tleU1hcCAgICAgICAgPSB7fTtcbiAgdGhpcy5fa2lsbEtleUNvZGVzICA9IFtdO1xuICB0aGlzLl9tYWNyb3MgICAgICAgID0gW107XG59XG5cbkxvY2FsZS5wcm90b3R5cGUuYmluZEtleUNvZGUgPSBmdW5jdGlvbihrZXlDb2RlLCBrZXlOYW1lcykge1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnc3RyaW5nJykge1xuICAgIGtleU5hbWVzID0gW2tleU5hbWVzXTtcbiAgfVxuXG4gIHRoaXMuX2tleU1hcFtrZXlDb2RlXSA9IGtleU5hbWVzO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5iaW5kTWFjcm8gPSBmdW5jdGlvbihrZXlDb21ib1N0ciwga2V5TmFtZXMpIHtcbiAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ3N0cmluZycpIHtcbiAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gbnVsbDtcbiAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGhhbmRsZXIgPSBrZXlOYW1lcztcbiAgICBrZXlOYW1lcyA9IG51bGw7XG4gIH1cblxuICB2YXIgbWFjcm8gPSB7XG4gICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxuICAgIGtleU5hbWVzIDoga2V5TmFtZXMsXG4gICAgaGFuZGxlciAgOiBoYW5kbGVyXG4gIH07XG5cbiAgdGhpcy5fbWFjcm9zLnB1c2gobWFjcm8pO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5nZXRLZXlDb2RlcyA9IGZ1bmN0aW9uKGtleU5hbWUpIHtcbiAgdmFyIGtleUNvZGVzID0gW107XG4gIGZvciAodmFyIGtleUNvZGUgaW4gdGhpcy5fa2V5TWFwKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fa2V5TWFwW2tleUNvZGVdLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHsga2V5Q29kZXMucHVzaChrZXlDb2RlfDApOyB9XG4gIH1cbiAgcmV0dXJuIGtleUNvZGVzO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5nZXRLZXlOYW1lcyA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgcmV0dXJuIHRoaXMuX2tleU1hcFtrZXlDb2RlXSB8fCBbXTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuc2V0S2lsbEtleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5zZXRLaWxsS2V5KGtleUNvZGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fa2lsbEtleUNvZGVzLnB1c2goa2V5Q29kZSk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLnByZXNzS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnByZXNzS2V5KGtleUNvZGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlOYW1lcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5TmFtZXNbaV0pID09PSAtMSkge1xuICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLl9hcHBseU1hY3JvcygpO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5yZWxlYXNlS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnJlbGVhc2VLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIGVsc2Uge1xuICAgIHZhciBrZXlOYW1lcyAgICAgICAgID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICB2YXIga2lsbEtleUNvZGVJbmRleCA9IHRoaXMuX2tpbGxLZXlDb2Rlcy5pbmRleE9mKGtleUNvZGUpO1xuICAgIFxuICAgIGlmIChraWxsS2V5Q29kZUluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlOYW1lcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5TmFtZXNbaV0pO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2NsZWFyTWFjcm9zKCk7XG4gIH1cbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuX2FwcGx5TWFjcm9zID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtYWNyb3MgPSB0aGlzLl9tYWNyb3Muc2xpY2UoMCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIG1hY3JvID0gbWFjcm9zW2ldO1xuICAgIGlmIChtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgbWFjcm8ua2V5TmFtZXMgPSBtYWNyby5oYW5kbGVyKHRoaXMucHJlc3NlZEtleXMpO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKG1hY3JvLmtleU5hbWVzW2pdKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2gobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9hcHBsaWVkTWFjcm9zLnB1c2gobWFjcm8pO1xuICAgIH1cbiAgfVxufTtcblxuTG9jYWxlLnByb3RvdHlwZS5fY2xlYXJNYWNyb3MgPSBmdW5jdGlvbigpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIG1hY3JvID0gdGhpcy5fYXBwbGllZE1hY3Jvc1tpXTtcbiAgICBpZiAoIW1hY3JvLmtleUNvbWJvLmNoZWNrKHRoaXMucHJlc3NlZEtleXMpKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xuICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLl9hcHBsaWVkTWFjcm9zLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICB9XG4gIH1cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbGU7XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obG9jYWxlLCBwbGF0Zm9ybSwgdXNlckFnZW50KSB7XG5cbiAgLy8gZ2VuZXJhbFxuICBsb2NhbGUuYmluZEtleUNvZGUoMywgICBbJ2NhbmNlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDgsICAgWydiYWNrc3BhY2UnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5LCAgIFsndGFiJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIsICBbJ2NsZWFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMsICBbJ2VudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTYsICBbJ3NoaWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTcsICBbJ2N0cmwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOCwgIFsnYWx0JywgJ21lbnUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOSwgIFsncGF1c2UnLCAnYnJlYWsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMCwgIFsnY2Fwc2xvY2snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyNywgIFsnZXNjYXBlJywgJ2VzYyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMyLCAgWydzcGFjZScsICdzcGFjZWJhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMzLCAgWydwYWdldXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNCwgIFsncGFnZWRvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNSwgIFsnZW5kJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzYsICBbJ2hvbWUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNywgIFsnbGVmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM4LCAgWyd1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM5LCAgWydyaWdodCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQwLCAgWydkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDEsICBbJ3NlbGVjdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQyLCAgWydwcmludHNjcmVlbiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQzLCAgWydleGVjdXRlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDQsICBbJ3NuYXBzaG90J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDUsICBbJ2luc2VydCcsICdpbnMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NiwgIFsnZGVsZXRlJywgJ2RlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ3LCAgWydoZWxwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ1LCBbJ3Njcm9sbGxvY2snLCAnc2Nyb2xsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTg3LCBbJ2VxdWFsJywgJ2VxdWFsc2lnbicsICc9J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTg4LCBbJ2NvbW1hJywgJywnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTAsIFsncGVyaW9kJywgJy4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTEsIFsnc2xhc2gnLCAnZm9yd2FyZHNsYXNoJywgJy8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTIsIFsnZ3JhdmVhY2NlbnQnLCAnYCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIxOSwgWydvcGVuYnJhY2tldCcsICdbJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIwLCBbJ2JhY2tzbGFzaCcsICdcXFxcJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIxLCBbJ2Nsb3NlYnJhY2tldCcsICddJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIyLCBbJ2Fwb3N0cm9waGUnLCAnXFwnJ10pO1xuXG4gIC8vIDAtOVxuICBsb2NhbGUuYmluZEtleUNvZGUoNDgsIFsnemVybycsICcwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDksIFsnb25lJywgJzEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MCwgWyd0d28nLCAnMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUxLCBbJ3RocmVlJywgJzMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MiwgWydmb3VyJywgJzQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MywgWydmaXZlJywgJzUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NCwgWydzaXgnLCAnNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU1LCBbJ3NldmVuJywgJzcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NiwgWydlaWdodCcsICc4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTcsIFsnbmluZScsICc5J10pO1xuXG4gIC8vIG51bXBhZFxuICBsb2NhbGUuYmluZEtleUNvZGUoOTYsIFsnbnVtemVybycsICdudW0wJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTcsIFsnbnVtb25lJywgJ251bTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OCwgWydudW10d28nLCAnbnVtMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk5LCBbJ251bXRocmVlJywgJ251bTMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDAsIFsnbnVtZm91cicsICdudW00J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAxLCBbJ251bWZpdmUnLCAnbnVtNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMiwgWydudW1zaXgnLCAnbnVtNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMywgWydudW1zZXZlbicsICdudW03J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA0LCBbJ251bWVpZ2h0JywgJ251bTgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDUsIFsnbnVtbmluZScsICdudW05J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA2LCBbJ251bW11bHRpcGx5JywgJ251bSonXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDcsIFsnbnVtYWRkJywgJ251bSsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDgsIFsnbnVtZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDksIFsnbnVtc3VidHJhY3QnLCAnbnVtLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMCwgWydudW1kZWNpbWFsJywgJ251bS4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTEsIFsnbnVtZGl2aWRlJywgJ251bS8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDQsIFsnbnVtbG9jaycsICdudW0nXSk7XG5cbiAgLy8gZnVuY3Rpb24ga2V5c1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEyLCBbJ2YxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEzLCBbJ2YyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE0LCBbJ2YzJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE1LCBbJ2Y0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE2LCBbJ2Y1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE3LCBbJ2Y2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE4LCBbJ2Y3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE5LCBbJ2Y4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIwLCBbJ2Y5J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIxLCBbJ2YxMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMiwgWydmMTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjMsIFsnZjEyJ10pO1xuXG4gIC8vIHNlY29uZGFyeSBrZXkgc3ltYm9sc1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIGAnLCBbJ3RpbGRlJywgJ34nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMScsIFsnZXhjbGFtYXRpb24nLCAnZXhjbGFtYXRpb25wb2ludCcsICchJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDInLCBbJ2F0JywgJ0AnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMycsIFsnbnVtYmVyJywgJyMnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNCcsIFsnZG9sbGFyJywgJ2RvbGxhcnMnLCAnZG9sbGFyc2lnbicsICckJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDUnLCBbJ3BlcmNlbnQnLCAnJSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA2JywgWydjYXJldCcsICdeJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDcnLCBbJ2FtcGVyc2FuZCcsICdhbmQnLCAnJiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA4JywgWydhc3RlcmlzaycsICcqJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDknLCBbJ29wZW5wYXJlbicsICcoJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDAnLCBbJ2Nsb3NlcGFyZW4nLCAnKSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAtJywgWyd1bmRlcnNjb3JlJywgJ18nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgPScsIFsncGx1cycsICcrJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFsnLCBbJ29wZW5jdXJseWJyYWNlJywgJ29wZW5jdXJseWJyYWNrZXQnLCAneyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBdJywgWydjbG9zZWN1cmx5YnJhY2UnLCAnY2xvc2VjdXJseWJyYWNrZXQnLCAnfSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXFxcJywgWyd2ZXJ0aWNhbGJhcicsICd8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDsnLCBbJ2NvbG9uJywgJzonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFwnJywgWydxdW90YXRpb25tYXJrJywgJ1xcJyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAhLCcsIFsnb3BlbmFuZ2xlYnJhY2tldCcsICc8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC4nLCBbJ2Nsb3NlYW5nbGVicmFja2V0JywgJz4nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLycsIFsncXVlc3Rpb25tYXJrJywgJz8nXSk7XG4gIFxuICBpZiAocGxhdGZvcm0ubWF0Y2goJ01hYycpKSB7XG4gICAgbG9jYWxlLmJpbmRNYWNybygnY29tbWFuZCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xuICB9IGVsc2Uge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2N0cmwnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfVxuXG4gIC8vYS16IGFuZCBBLVpcbiAgZm9yICh2YXIga2V5Q29kZSA9IDY1OyBrZXlDb2RlIDw9IDkwOyBrZXlDb2RlICs9IDEpIHtcbiAgICB2YXIga2V5TmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSArIDMyKTtcbiAgICB2YXIgY2FwaXRhbEtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUpO1xuICBcdGxvY2FsZS5iaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lKTtcbiAgXHRsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICcgKyBrZXlOYW1lLCBjYXBpdGFsS2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnY2Fwc2xvY2sgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICB9XG5cbiAgLy8gYnJvd3NlciBjYXZlYXRzXG4gIHZhciBzZW1pY29sb25LZXlDb2RlID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyA1OSAgOiAxODY7XG4gIHZhciBkYXNoS2V5Q29kZSAgICAgID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyAxNzMgOiAxODk7XG4gIHZhciBsZWZ0Q29tbWFuZEtleUNvZGU7XG4gIHZhciByaWdodENvbW1hbmRLZXlDb2RlO1xuICBpZiAocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmICh1c2VyQWdlbnQubWF0Y2goJ1NhZmFyaScpIHx8IHVzZXJBZ2VudC5tYXRjaCgnQ2hyb21lJykpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDkxO1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSA5MztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ09wZXJhJykpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMTc7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDE3O1xuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDIyNDtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMjI0O1xuICB9XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShzZW1pY29sb25LZXlDb2RlLCAgICBbJ3NlbWljb2xvbicsICc7J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoZGFzaEtleUNvZGUsICAgICAgICAgWydkYXNoJywgJy0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShsZWZ0Q29tbWFuZEtleUNvZGUsICBbJ2NvbW1hbmQnLCAnd2luZG93cycsICd3aW4nLCAnc3VwZXInLCAnbGVmdGNvbW1hbmQnLCAnbGVmdHdpbmRvd3MnLCAnbGVmdHdpbicsICdsZWZ0c3VwZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShyaWdodENvbW1hbmRLZXlDb2RlLCBbJ2NvbW1hbmQnLCAnd2luZG93cycsICd3aW4nLCAnc3VwZXInLCAncmlnaHRjb21tYW5kJywgJ3JpZ2h0d2luZG93cycsICdyaWdodHdpbicsICdyaWdodHN1cGVyJ10pO1xuXG4gIC8vIGtpbGwga2V5c1xuICBsb2NhbGUuc2V0S2lsbEtleSgnY29tbWFuZCcpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3ViamVjdCkge1xuICB2YWxpZGF0ZVN1YmplY3Qoc3ViamVjdCk7XG5cbiAgdmFyIGV2ZW50c1N0b3JhZ2UgPSBjcmVhdGVFdmVudHNTdG9yYWdlKHN1YmplY3QpO1xuICBzdWJqZWN0Lm9uID0gZXZlbnRzU3RvcmFnZS5vbjtcbiAgc3ViamVjdC5vZmYgPSBldmVudHNTdG9yYWdlLm9mZjtcbiAgc3ViamVjdC5maXJlID0gZXZlbnRzU3RvcmFnZS5maXJlO1xuICByZXR1cm4gc3ViamVjdDtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50c1N0b3JhZ2Uoc3ViamVjdCkge1xuICAvLyBTdG9yZSBhbGwgZXZlbnQgbGlzdGVuZXJzIHRvIHRoaXMgaGFzaC4gS2V5IGlzIGV2ZW50IG5hbWUsIHZhbHVlIGlzIGFycmF5XG4gIC8vIG9mIGNhbGxiYWNrIHJlY29yZHMuXG4gIC8vXG4gIC8vIEEgY2FsbGJhY2sgcmVjb3JkIGNvbnNpc3RzIG9mIGNhbGxiYWNrIGZ1bmN0aW9uIGFuZCBpdHMgb3B0aW9uYWwgY29udGV4dDpcbiAgLy8geyAnZXZlbnROYW1lJyA9PiBbe2NhbGxiYWNrOiBmdW5jdGlvbiwgY3R4OiBvYmplY3R9XSB9XG4gIHZhciByZWdpc3RlcmVkRXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICByZXR1cm4ge1xuICAgIG9uOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY2FsbGJhY2sgaXMgZXhwZWN0ZWQgdG8gYmUgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgdmFyIGhhbmRsZXJzID0gcmVnaXN0ZXJlZEV2ZW50c1tldmVudE5hbWVdO1xuICAgICAgaWYgKCFoYW5kbGVycykge1xuICAgICAgICBoYW5kbGVycyA9IHJlZ2lzdGVyZWRFdmVudHNbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgfVxuICAgICAgaGFuZGxlcnMucHVzaCh7Y2FsbGJhY2s6IGNhbGxiYWNrLCBjdHg6IGN0eH0pO1xuXG4gICAgICByZXR1cm4gc3ViamVjdDtcbiAgICB9LFxuXG4gICAgb2ZmOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHdhbnRUb1JlbW92ZUFsbCA9ICh0eXBlb2YgZXZlbnROYW1lID09PSAndW5kZWZpbmVkJyk7XG4gICAgICBpZiAod2FudFRvUmVtb3ZlQWxsKSB7XG4gICAgICAgIC8vIEtpbGxpbmcgb2xkIGV2ZW50cyBzdG9yYWdlIHNob3VsZCBiZSBlbm91Z2ggaW4gdGhpcyBjYXNlOlxuICAgICAgICByZWdpc3RlcmVkRXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgcmV0dXJuIHN1YmplY3Q7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWdpc3RlcmVkRXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgdmFyIGRlbGV0ZUFsbENhbGxiYWNrc0ZvckV2ZW50ID0gKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJyk7XG4gICAgICAgIGlmIChkZWxldGVBbGxDYWxsYmFja3NGb3JFdmVudCkge1xuICAgICAgICAgIGRlbGV0ZSByZWdpc3RlcmVkRXZlbnRzW2V2ZW50TmFtZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGNhbGxiYWNrcyA9IHJlZ2lzdGVyZWRFdmVudHNbZXZlbnROYW1lXTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrc1tpXS5jYWxsYmFjayA9PT0gY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN1YmplY3Q7XG4gICAgfSxcblxuICAgIGZpcmU6IGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIHZhciBjYWxsYmFja3MgPSByZWdpc3RlcmVkRXZlbnRzW2V2ZW50TmFtZV07XG4gICAgICBpZiAoIWNhbGxiYWNrcykge1xuICAgICAgICByZXR1cm4gc3ViamVjdDtcbiAgICAgIH1cblxuICAgICAgdmFyIGZpcmVBcmd1bWVudHM7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZmlyZUFyZ3VtZW50cyA9IEFycmF5LnByb3RvdHlwZS5zcGxpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgfVxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgY2FsbGJhY2tJbmZvID0gY2FsbGJhY2tzW2ldO1xuICAgICAgICBjYWxsYmFja0luZm8uY2FsbGJhY2suYXBwbHkoY2FsbGJhY2tJbmZvLmN0eCwgZmlyZUFyZ3VtZW50cyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdWJqZWN0O1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVTdWJqZWN0KHN1YmplY3QpIHtcbiAgaWYgKCFzdWJqZWN0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFdmVudGlmeSBjYW5ub3QgdXNlIGZhbHN5IG9iamVjdCBhcyBldmVudHMgc3ViamVjdCcpO1xuICB9XG4gIHZhciByZXNlcnZlZFdvcmRzID0gWydvbicsICdmaXJlJywgJ29mZiddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc2VydmVkV29yZHMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoc3ViamVjdC5oYXNPd25Qcm9wZXJ0eShyZXNlcnZlZFdvcmRzW2ldKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3ViamVjdCBjYW5ub3QgYmUgZXZlbnRpZmllZCwgc2luY2UgaXQgYWxyZWFkeSBoYXMgcHJvcGVydHkgJ1wiICsgcmVzZXJ2ZWRXb3Jkc1tpXSArIFwiJ1wiKTtcbiAgICB9XG4gIH1cbn1cbiIsIi8qKlxuICogQGZpbGVPdmVydmlldyBDb250YWlucyBkZWZpbml0aW9uIG9mIHRoZSBjb3JlIGdyYXBoIG9iamVjdC5cbiAqL1xuXG4vLyBUT0RPOiBuZWVkIHRvIGNoYW5nZSBzdG9yYWdlIGxheWVyOlxuLy8gMS4gQmUgYWJsZSB0byBnZXQgYWxsIG5vZGVzIE8oMSlcbi8vIDIuIEJlIGFibGUgdG8gZ2V0IG51bWJlciBvZiBsaW5rcyBPKDEpXG5cbi8qKlxuICogQGV4YW1wbGVcbiAqICB2YXIgZ3JhcGggPSByZXF1aXJlKCduZ3JhcGguZ3JhcGgnKSgpO1xuICogIGdyYXBoLmFkZE5vZGUoMSk7ICAgICAvLyBncmFwaCBoYXMgb25lIG5vZGUuXG4gKiAgZ3JhcGguYWRkTGluaygyLCAzKTsgIC8vIG5vdyBncmFwaCBjb250YWlucyB0aHJlZSBub2RlcyBhbmQgb25lIGxpbmsuXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUdyYXBoO1xuXG52YXIgZXZlbnRpZnkgPSByZXF1aXJlKCduZ3JhcGguZXZlbnRzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBncmFwaFxuICovXG5mdW5jdGlvbiBjcmVhdGVHcmFwaChvcHRpb25zKSB7XG4gIC8vIEdyYXBoIHN0cnVjdHVyZSBpcyBtYWludGFpbmVkIGFzIGRpY3Rpb25hcnkgb2Ygbm9kZXNcbiAgLy8gYW5kIGFycmF5IG9mIGxpbmtzLiBFYWNoIG5vZGUgaGFzICdsaW5rcycgcHJvcGVydHkgd2hpY2hcbiAgLy8gaG9sZCBhbGwgbGlua3MgcmVsYXRlZCB0byB0aGF0IG5vZGUuIEFuZCBnZW5lcmFsIGxpbmtzXG4gIC8vIGFycmF5IGlzIHVzZWQgdG8gc3BlZWQgdXAgYWxsIGxpbmtzIGVudW1lcmF0aW9uLiBUaGlzIGlzIGluZWZmaWNpZW50XG4gIC8vIGluIHRlcm1zIG9mIG1lbW9yeSwgYnV0IHNpbXBsaWZpZXMgY29kaW5nLlxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgaWYgKCd1bmlxdWVMaW5rSWQnIGluIG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnbmdyYXBoLmdyYXBoOiBTdGFydGluZyBmcm9tIHZlcnNpb24gMC4xNCBgdW5pcXVlTGlua0lkYCBpcyBkZXByZWNhdGVkLlxcbicgK1xuICAgICAgJ1VzZSBgbXVsdGlncmFwaGAgb3B0aW9uIGluc3RlYWRcXG4nLFxuICAgICAgJ1xcbicsXG4gICAgICAnTm90ZTogdGhlcmUgaXMgYWxzbyBjaGFuZ2UgaW4gZGVmYXVsdCBiZWhhdmlvcjogRnJvbSBub3cgb3duIGVhY2ggZ3JhcGhcXG4nK1xuICAgICAgJ2lzIGNvbnNpZGVyZWQgdG8gYmUgbm90IGEgbXVsdGlncmFwaCBieSBkZWZhdWx0IChlYWNoIGVkZ2UgaXMgdW5pcXVlKS4nXG4gICAgKTtcblxuICAgIG9wdGlvbnMubXVsdGlncmFwaCA9IG9wdGlvbnMudW5pcXVlTGlua0lkO1xuICB9XG5cbiAgLy8gRGVhciByZWFkZXIsIHRoZSBub24tbXVsdGlncmFwaHMgZG8gbm90IGd1YXJhbnRlZSB0aGF0IHRoZXJlIGlzIG9ubHlcbiAgLy8gb25lIGxpbmsgZm9yIGEgZ2l2ZW4gcGFpciBvZiBub2RlLiBXaGVuIHRoaXMgb3B0aW9uIGlzIHNldCB0byBmYWxzZVxuICAvLyB3ZSBjYW4gc2F2ZSBzb21lIG1lbW9yeSBhbmQgQ1BVICgxOCUgZmFzdGVyIGZvciBub24tbXVsdGlncmFwaCk7XG4gIGlmIChvcHRpb25zLm11bHRpZ3JhcGggPT09IHVuZGVmaW5lZCkgb3B0aW9ucy5tdWx0aWdyYXBoID0gZmFsc2U7XG5cbiAgdmFyIG5vZGVzID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicgPyBPYmplY3QuY3JlYXRlKG51bGwpIDoge30sXG4gICAgbGlua3MgPSBbXSxcbiAgICAvLyBIYXNoIG9mIG11bHRpLWVkZ2VzLiBVc2VkIHRvIHRyYWNrIGlkcyBvZiBlZGdlcyBiZXR3ZWVuIHNhbWUgbm9kZXNcbiAgICBtdWx0aUVkZ2VzID0ge30sXG4gICAgbm9kZXNDb3VudCA9IDAsXG4gICAgc3VzcGVuZEV2ZW50cyA9IDAsXG5cbiAgICBmb3JFYWNoTm9kZSA9IGNyZWF0ZU5vZGVJdGVyYXRvcigpLFxuICAgIGNyZWF0ZUxpbmsgPSBvcHRpb25zLm11bHRpZ3JhcGggPyBjcmVhdGVVbmlxdWVMaW5rIDogY3JlYXRlU2luZ2xlTGluayxcblxuICAgIC8vIE91ciBncmFwaCBBUEkgcHJvdmlkZXMgbWVhbnMgdG8gbGlzdGVuIHRvIGdyYXBoIGNoYW5nZXMuIFVzZXJzIGNhbiBzdWJzY3JpYmVcbiAgICAvLyB0byBiZSBub3RpZmllZCBhYm91dCBjaGFuZ2VzIGluIHRoZSBncmFwaCBieSB1c2luZyBgb25gIG1ldGhvZC4gSG93ZXZlclxuICAgIC8vIGluIHNvbWUgY2FzZXMgdGhleSBkb24ndCB1c2UgaXQuIFRvIGF2b2lkIHVubmVjZXNzYXJ5IG1lbW9yeSBjb25zdW1wdGlvblxuICAgIC8vIHdlIHdpbGwgbm90IHJlY29yZCBncmFwaCBjaGFuZ2VzIHVudGlsIHdlIGhhdmUgYXQgbGVhc3Qgb25lIHN1YnNjcmliZXIuXG4gICAgLy8gQ29kZSBiZWxvdyBzdXBwb3J0cyB0aGlzIG9wdGltaXphdGlvbi5cbiAgICAvL1xuICAgIC8vIEFjY3VtdWxhdGVzIGFsbCBjaGFuZ2VzIG1hZGUgZHVyaW5nIGdyYXBoIHVwZGF0ZXMuXG4gICAgLy8gRWFjaCBjaGFuZ2UgZWxlbWVudCBjb250YWluczpcbiAgICAvLyAgY2hhbmdlVHlwZSAtIG9uZSBvZiB0aGUgc3RyaW5nczogJ2FkZCcsICdyZW1vdmUnIG9yICd1cGRhdGUnO1xuICAgIC8vICBub2RlIC0gaWYgY2hhbmdlIGlzIHJlbGF0ZWQgdG8gbm9kZSB0aGlzIHByb3BlcnR5IGlzIHNldCB0byBjaGFuZ2VkIGdyYXBoJ3Mgbm9kZTtcbiAgICAvLyAgbGluayAtIGlmIGNoYW5nZSBpcyByZWxhdGVkIHRvIGxpbmsgdGhpcyBwcm9wZXJ0eSBpcyBzZXQgdG8gY2hhbmdlZCBncmFwaCdzIGxpbms7XG4gICAgY2hhbmdlcyA9IFtdLFxuICAgIHJlY29yZExpbmtDaGFuZ2UgPSBub29wLFxuICAgIHJlY29yZE5vZGVDaGFuZ2UgPSBub29wLFxuICAgIGVudGVyTW9kaWZpY2F0aW9uID0gbm9vcCxcbiAgICBleGl0TW9kaWZpY2F0aW9uID0gbm9vcDtcblxuICAvLyB0aGlzIGlzIG91ciBwdWJsaWMgQVBJOlxuICB2YXIgZ3JhcGhQYXJ0ID0ge1xuICAgIC8qKlxuICAgICAqIEFkZHMgbm9kZSB0byB0aGUgZ3JhcGguIElmIG5vZGUgd2l0aCBnaXZlbiBpZCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgZ3JhcGhcbiAgICAgKiBpdHMgZGF0YSBpcyBleHRlbmRlZCB3aXRoIHdoYXRldmVyIGNvbWVzIGluICdkYXRhJyBhcmd1bWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBub2RlSWQgdGhlIG5vZGUncyBpZGVudGlmaWVyLiBBIHN0cmluZyBvciBudW1iZXIgaXMgcHJlZmVycmVkLlxuICAgICAqIEBwYXJhbSBbZGF0YV0gYWRkaXRpb25hbCBkYXRhIGZvciB0aGUgbm9kZSBiZWluZyBhZGRlZC4gSWYgbm9kZSBhbHJlYWR5XG4gICAgICogICBleGlzdHMgaXRzIGRhdGEgb2JqZWN0IGlzIGF1Z21lbnRlZCB3aXRoIHRoZSBuZXcgb25lLlxuICAgICAqXG4gICAgICogQHJldHVybiB7bm9kZX0gVGhlIG5ld2x5IGFkZGVkIG5vZGUgb3Igbm9kZSB3aXRoIGdpdmVuIGlkIGlmIGl0IGFscmVhZHkgZXhpc3RzLlxuICAgICAqL1xuICAgIGFkZE5vZGU6IGFkZE5vZGUsXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGluayB0byB0aGUgZ3JhcGguIFRoZSBmdW5jdGlvbiBhbHdheXMgY3JlYXRlIGEgbmV3XG4gICAgICogbGluayBiZXR3ZWVuIHR3byBub2Rlcy4gSWYgb25lIG9mIHRoZSBub2RlcyBkb2VzIG5vdCBleGlzdHNcbiAgICAgKiBhIG5ldyBub2RlIGlzIGNyZWF0ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZnJvbUlkIGxpbmsgc3RhcnQgbm9kZSBpZDtcbiAgICAgKiBAcGFyYW0gdG9JZCBsaW5rIGVuZCBub2RlIGlkO1xuICAgICAqIEBwYXJhbSBbZGF0YV0gYWRkaXRpb25hbCBkYXRhIHRvIGJlIHNldCBvbiB0aGUgbmV3IGxpbms7XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtsaW5rfSBUaGUgbmV3bHkgY3JlYXRlZCBsaW5rXG4gICAgICovXG4gICAgYWRkTGluazogYWRkTGluayxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgbGluayBmcm9tIHRoZSBncmFwaC4gSWYgbGluayBkb2VzIG5vdCBleGlzdCBkb2VzIG5vdGhpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbGluayAtIG9iamVjdCByZXR1cm5lZCBieSBhZGRMaW5rKCkgb3IgZ2V0TGlua3MoKSBtZXRob2RzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiBsaW5rIHdhcyByZW1vdmVkOyBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgcmVtb3ZlTGluazogcmVtb3ZlTGluayxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgbm9kZSB3aXRoIGdpdmVuIGlkIGZyb20gdGhlIGdyYXBoLiBJZiBub2RlIGRvZXMgbm90IGV4aXN0IGluIHRoZSBncmFwaFxuICAgICAqIGRvZXMgbm90aGluZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBub2RlSWQgbm9kZSdzIGlkZW50aWZpZXIgcGFzc2VkIHRvIGFkZE5vZGUoKSBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgbm9kZSB3YXMgcmVtb3ZlZDsgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHJlbW92ZU5vZGU6IHJlbW92ZU5vZGUsXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIG5vZGUgd2l0aCBnaXZlbiBpZGVudGlmaWVyLiBJZiBub2RlIGRvZXMgbm90IGV4aXN0IHVuZGVmaW5lZCB2YWx1ZSBpcyByZXR1cm5lZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBub2RlSWQgcmVxdWVzdGVkIG5vZGUgaWRlbnRpZmllcjtcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge25vZGV9IGluIHdpdGggcmVxdWVzdGVkIGlkZW50aWZpZXIgb3IgdW5kZWZpbmVkIGlmIG5vIHN1Y2ggbm9kZSBleGlzdHMuXG4gICAgICovXG4gICAgZ2V0Tm9kZTogZ2V0Tm9kZSxcblxuICAgIC8qKlxuICAgICAqIEdldHMgbnVtYmVyIG9mIG5vZGVzIGluIHRoaXMgZ3JhcGguXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIG51bWJlciBvZiBub2RlcyBpbiB0aGUgZ3JhcGguXG4gICAgICovXG4gICAgZ2V0Tm9kZXNDb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5vZGVzQ291bnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldHMgdG90YWwgbnVtYmVyIG9mIGxpbmtzIGluIHRoZSBncmFwaC5cbiAgICAgKi9cbiAgICBnZXRMaW5rc0NvdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbGlua3MubGVuZ3RoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFsbCBsaW5rcyAoaW5ib3VuZCBhbmQgb3V0Ym91bmQpIGZyb20gdGhlIG5vZGUgd2l0aCBnaXZlbiBpZC5cbiAgICAgKiBJZiBub2RlIHdpdGggZ2l2ZW4gaWQgaXMgbm90IGZvdW5kIG51bGwgaXMgcmV0dXJuZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbm9kZUlkIHJlcXVlc3RlZCBub2RlIGlkZW50aWZpZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIEFycmF5IG9mIGxpbmtzIGZyb20gYW5kIHRvIHJlcXVlc3RlZCBub2RlIGlmIHN1Y2ggbm9kZSBleGlzdHM7XG4gICAgICogICBvdGhlcndpc2UgbnVsbCBpcyByZXR1cm5lZC5cbiAgICAgKi9cbiAgICBnZXRMaW5rczogZ2V0TGlua3MsXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VzIGNhbGxiYWNrIG9uIGVhY2ggbm9kZSBvZiB0aGUgZ3JhcGguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9uKG5vZGUpfSBjYWxsYmFjayBGdW5jdGlvbiB0byBiZSBpbnZva2VkLiBUaGUgZnVuY3Rpb25cbiAgICAgKiAgIGlzIHBhc3NlZCBvbmUgYXJndW1lbnQ6IHZpc2l0ZWQgbm9kZS5cbiAgICAgKi9cbiAgICBmb3JFYWNoTm9kZTogZm9yRWFjaE5vZGUsXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VzIGNhbGxiYWNrIG9uIGV2ZXJ5IGxpbmtlZCAoYWRqYWNlbnQpIG5vZGUgdG8gdGhlIGdpdmVuIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBub2RlSWQgSWRlbnRpZmllciBvZiB0aGUgcmVxdWVzdGVkIG5vZGUuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbihub2RlLCBsaW5rKX0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGFsbCBsaW5rZWQgbm9kZXMuXG4gICAgICogICBUaGUgZnVuY3Rpb24gaXMgcGFzc2VkIHR3byBwYXJhbWV0ZXJzOiBhZGphY2VudCBub2RlIGFuZCBsaW5rIG9iamVjdCBpdHNlbGYuXG4gICAgICogQHBhcmFtIG9yaWVudGVkIGlmIHRydWUgZ3JhcGggdHJlYXRlZCBhcyBvcmllbnRlZC5cbiAgICAgKi9cbiAgICBmb3JFYWNoTGlua2VkTm9kZTogZm9yRWFjaExpbmtlZE5vZGUsXG5cbiAgICAvKipcbiAgICAgKiBFbnVtZXJhdGVzIGFsbCBsaW5rcyBpbiB0aGUgZ3JhcGhcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb24obGluayl9IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBhbGwgbGlua3MgaW4gdGhlIGdyYXBoLlxuICAgICAqICAgVGhlIGZ1bmN0aW9uIGlzIHBhc3NlZCBvbmUgcGFyYW1ldGVyOiBncmFwaCdzIGxpbmsgb2JqZWN0LlxuICAgICAqXG4gICAgICogTGluayBvYmplY3QgY29udGFpbnMgYXQgbGVhc3QgdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gICAgICogIGZyb21JZCAtIG5vZGUgaWQgd2hlcmUgbGluayBzdGFydHM7XG4gICAgICogIHRvSWQgLSBub2RlIGlkIHdoZXJlIGxpbmsgZW5kcyxcbiAgICAgKiAgZGF0YSAtIGFkZGl0aW9uYWwgZGF0YSBwYXNzZWQgdG8gZ3JhcGguYWRkTGluaygpIG1ldGhvZC5cbiAgICAgKi9cbiAgICBmb3JFYWNoTGluazogZm9yRWFjaExpbmssXG5cbiAgICAvKipcbiAgICAgKiBTdXNwZW5kIGFsbCBub3RpZmljYXRpb25zIGFib3V0IGdyYXBoIGNoYW5nZXMgdW50aWxcbiAgICAgKiBlbmRVcGRhdGUgaXMgY2FsbGVkLlxuICAgICAqL1xuICAgIGJlZ2luVXBkYXRlOiBlbnRlck1vZGlmaWNhdGlvbixcblxuICAgIC8qKlxuICAgICAqIFJlc3VtZXMgYWxsIG5vdGlmaWNhdGlvbnMgYWJvdXQgZ3JhcGggY2hhbmdlcyBhbmQgZmlyZXNcbiAgICAgKiBncmFwaCAnY2hhbmdlZCcgZXZlbnQgaW4gY2FzZSB0aGVyZSBhcmUgYW55IHBlbmRpbmcgY2hhbmdlcy5cbiAgICAgKi9cbiAgICBlbmRVcGRhdGU6IGV4aXRNb2RpZmljYXRpb24sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBub2RlcyBhbmQgbGlua3MgZnJvbSB0aGUgZ3JhcGguXG4gICAgICovXG4gICAgY2xlYXI6IGNsZWFyLFxuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0cyB3aGV0aGVyIHRoZXJlIGlzIGEgbGluayBiZXR3ZWVuIHR3byBub2Rlcy5cbiAgICAgKiBPcGVyYXRpb24gY29tcGxleGl0eSBpcyBPKG4pIHdoZXJlIG4gLSBudW1iZXIgb2YgbGlua3Mgb2YgYSBub2RlLlxuICAgICAqIE5PVEU6IHRoaXMgZnVuY3Rpb24gaXMgc3lub25pbSBmb3IgZ2V0TGluaygpXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBsaW5rIGlmIHRoZXJlIGlzIG9uZS4gbnVsbCBvdGhlcndpc2UuXG4gICAgICovXG4gICAgaGFzTGluazogZ2V0TGluayxcblxuICAgIC8qKlxuICAgICAqIERldGVjdHMgd2hldGhlciB0aGVyZSBpcyBhIG5vZGUgd2l0aCBnaXZlbiBpZFxuICAgICAqIFxuICAgICAqIE9wZXJhdGlvbiBjb21wbGV4aXR5IGlzIE8oMSlcbiAgICAgKiBOT1RFOiB0aGlzIGZ1bmN0aW9uIGlzIHN5bm9uaW0gZm9yIGdldE5vZGUoKVxuICAgICAqXG4gICAgICogQHJldHVybnMgbm9kZSBpZiB0aGVyZSBpcyBvbmU7IEZhbHN5IHZhbHVlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBoYXNOb2RlOiBnZXROb2RlLFxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBlZGdlIGJldHdlZW4gdHdvIG5vZGVzLlxuICAgICAqIE9wZXJhdGlvbiBjb21wbGV4aXR5IGlzIE8obikgd2hlcmUgbiAtIG51bWJlciBvZiBsaW5rcyBvZiBhIG5vZGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZnJvbUlkIGxpbmsgc3RhcnQgaWRlbnRpZmllclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0b0lkIGxpbmsgZW5kIGlkZW50aWZpZXJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGxpbmsgaWYgdGhlcmUgaXMgb25lLiBudWxsIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBnZXRMaW5rOiBnZXRMaW5rXG4gIH07XG5cbiAgLy8gdGhpcyB3aWxsIGFkZCBgb24oKWAgYW5kIGBmaXJlKClgIG1ldGhvZHMuXG4gIGV2ZW50aWZ5KGdyYXBoUGFydCk7XG5cbiAgbW9uaXRvclN1YnNjcmliZXJzKCk7XG5cbiAgcmV0dXJuIGdyYXBoUGFydDtcblxuICBmdW5jdGlvbiBtb25pdG9yU3Vic2NyaWJlcnMoKSB7XG4gICAgdmFyIHJlYWxPbiA9IGdyYXBoUGFydC5vbjtcblxuICAgIC8vIHJlcGxhY2UgcmVhbCBgb25gIHdpdGggb3VyIHRlbXBvcmFyeSBvbiwgd2hpY2ggd2lsbCB0cmlnZ2VyIGNoYW5nZVxuICAgIC8vIG1vZGlmaWNhdGlvbiBtb25pdG9yaW5nOlxuICAgIGdyYXBoUGFydC5vbiA9IG9uO1xuXG4gICAgZnVuY3Rpb24gb24oKSB7XG4gICAgICAvLyBub3cgaXQncyB0aW1lIHRvIHN0YXJ0IHRyYWNraW5nIHN0dWZmOlxuICAgICAgZ3JhcGhQYXJ0LmJlZ2luVXBkYXRlID0gZW50ZXJNb2RpZmljYXRpb24gPSBlbnRlck1vZGlmaWNhdGlvblJlYWw7XG4gICAgICBncmFwaFBhcnQuZW5kVXBkYXRlID0gZXhpdE1vZGlmaWNhdGlvbiA9IGV4aXRNb2RpZmljYXRpb25SZWFsO1xuICAgICAgcmVjb3JkTGlua0NoYW5nZSA9IHJlY29yZExpbmtDaGFuZ2VSZWFsO1xuICAgICAgcmVjb3JkTm9kZUNoYW5nZSA9IHJlY29yZE5vZGVDaGFuZ2VSZWFsO1xuXG4gICAgICAvLyB0aGlzIHdpbGwgcmVwbGFjZSBjdXJyZW50IGBvbmAgbWV0aG9kIHdpdGggcmVhbCBwdWIvc3ViIGZyb20gYGV2ZW50aWZ5YC5cbiAgICAgIGdyYXBoUGFydC5vbiA9IHJlYWxPbjtcbiAgICAgIC8vIGRlbGVnYXRlIHRvIHJlYWwgYG9uYCBoYW5kbGVyOlxuICAgICAgcmV0dXJuIHJlYWxPbi5hcHBseShncmFwaFBhcnQsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVjb3JkTGlua0NoYW5nZVJlYWwobGluaywgY2hhbmdlVHlwZSkge1xuICAgIGNoYW5nZXMucHVzaCh7XG4gICAgICBsaW5rOiBsaW5rLFxuICAgICAgY2hhbmdlVHlwZTogY2hhbmdlVHlwZVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVjb3JkTm9kZUNoYW5nZVJlYWwobm9kZSwgY2hhbmdlVHlwZSkge1xuICAgIGNoYW5nZXMucHVzaCh7XG4gICAgICBub2RlOiBub2RlLFxuICAgICAgY2hhbmdlVHlwZTogY2hhbmdlVHlwZVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkTm9kZShub2RlSWQsIGRhdGEpIHtcbiAgICBpZiAobm9kZUlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBub2RlIGlkZW50aWZpZXInKTtcbiAgICB9XG5cbiAgICBlbnRlck1vZGlmaWNhdGlvbigpO1xuXG4gICAgdmFyIG5vZGUgPSBnZXROb2RlKG5vZGVJZCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICBub2RlID0gbmV3IE5vZGUobm9kZUlkLCBkYXRhKTtcbiAgICAgIG5vZGVzQ291bnQrKztcbiAgICAgIHJlY29yZE5vZGVDaGFuZ2Uobm9kZSwgJ2FkZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLmRhdGEgPSBkYXRhO1xuICAgICAgcmVjb3JkTm9kZUNoYW5nZShub2RlLCAndXBkYXRlJyk7XG4gICAgfVxuXG4gICAgbm9kZXNbbm9kZUlkXSA9IG5vZGU7XG5cbiAgICBleGl0TW9kaWZpY2F0aW9uKCk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBmdW5jdGlvbiBnZXROb2RlKG5vZGVJZCkge1xuICAgIHJldHVybiBub2Rlc1tub2RlSWRdO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlSWQpIHtcbiAgICB2YXIgbm9kZSA9IGdldE5vZGUobm9kZUlkKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBlbnRlck1vZGlmaWNhdGlvbigpO1xuXG4gICAgdmFyIHByZXZMaW5rcyA9IG5vZGUubGlua3M7XG4gICAgaWYgKHByZXZMaW5rcykge1xuICAgICAgbm9kZS5saW5rcyA9IG51bGw7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcHJldkxpbmtzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHJlbW92ZUxpbmsocHJldkxpbmtzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkZWxldGUgbm9kZXNbbm9kZUlkXTtcbiAgICBub2Rlc0NvdW50LS07XG5cbiAgICByZWNvcmROb2RlQ2hhbmdlKG5vZGUsICdyZW1vdmUnKTtcblxuICAgIGV4aXRNb2RpZmljYXRpb24oKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICBmdW5jdGlvbiBhZGRMaW5rKGZyb21JZCwgdG9JZCwgZGF0YSkge1xuICAgIGVudGVyTW9kaWZpY2F0aW9uKCk7XG5cbiAgICB2YXIgZnJvbU5vZGUgPSBnZXROb2RlKGZyb21JZCkgfHwgYWRkTm9kZShmcm9tSWQpO1xuICAgIHZhciB0b05vZGUgPSBnZXROb2RlKHRvSWQpIHx8IGFkZE5vZGUodG9JZCk7XG5cbiAgICB2YXIgbGluayA9IGNyZWF0ZUxpbmsoZnJvbUlkLCB0b0lkLCBkYXRhKTtcblxuICAgIGxpbmtzLnB1c2gobGluayk7XG5cbiAgICAvLyBUT0RPOiB0aGlzIGlzIG5vdCBjb29sLiBPbiBsYXJnZSBncmFwaHMgcG90ZW50aWFsbHkgd291bGQgY29uc3VtZSBtb3JlIG1lbW9yeS5cbiAgICBhZGRMaW5rVG9Ob2RlKGZyb21Ob2RlLCBsaW5rKTtcbiAgICBpZiAoZnJvbUlkICE9PSB0b0lkKSB7XG4gICAgICAvLyBtYWtlIHN1cmUgd2UgYXJlIG5vdCBkdXBsaWNhdGluZyBsaW5rcyBmb3Igc2VsZi1sb29wc1xuICAgICAgYWRkTGlua1RvTm9kZSh0b05vZGUsIGxpbmspO1xuICAgIH1cblxuICAgIHJlY29yZExpbmtDaGFuZ2UobGluaywgJ2FkZCcpO1xuXG4gICAgZXhpdE1vZGlmaWNhdGlvbigpO1xuXG4gICAgcmV0dXJuIGxpbms7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVTaW5nbGVMaW5rKGZyb21JZCwgdG9JZCwgZGF0YSkge1xuICAgIHZhciBsaW5rSWQgPSBtYWtlTGlua0lkKGZyb21JZCwgdG9JZCk7XG4gICAgcmV0dXJuIG5ldyBMaW5rKGZyb21JZCwgdG9JZCwgZGF0YSwgbGlua0lkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVVuaXF1ZUxpbmsoZnJvbUlkLCB0b0lkLCBkYXRhKSB7XG4gICAgLy8gVE9ETzogR2V0IHJpZCBvZiB0aGlzIG1ldGhvZC5cbiAgICB2YXIgbGlua0lkID0gbWFrZUxpbmtJZChmcm9tSWQsIHRvSWQpO1xuICAgIHZhciBpc011bHRpRWRnZSA9IG11bHRpRWRnZXMuaGFzT3duUHJvcGVydHkobGlua0lkKTtcbiAgICBpZiAoaXNNdWx0aUVkZ2UgfHwgZ2V0TGluayhmcm9tSWQsIHRvSWQpKSB7XG4gICAgICBpZiAoIWlzTXVsdGlFZGdlKSB7XG4gICAgICAgIG11bHRpRWRnZXNbbGlua0lkXSA9IDA7XG4gICAgICB9XG4gICAgICB2YXIgc3VmZml4ID0gJ0AnICsgKCsrbXVsdGlFZGdlc1tsaW5rSWRdKTtcbiAgICAgIGxpbmtJZCA9IG1ha2VMaW5rSWQoZnJvbUlkICsgc3VmZml4LCB0b0lkICsgc3VmZml4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IExpbmsoZnJvbUlkLCB0b0lkLCBkYXRhLCBsaW5rSWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGlua3Mobm9kZUlkKSB7XG4gICAgdmFyIG5vZGUgPSBnZXROb2RlKG5vZGVJZCk7XG4gICAgcmV0dXJuIG5vZGUgPyBub2RlLmxpbmtzIDogbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUxpbmsobGluaykge1xuICAgIGlmICghbGluaykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgaWR4ID0gaW5kZXhPZkVsZW1lbnRJbkFycmF5KGxpbmssIGxpbmtzKTtcbiAgICBpZiAoaWR4IDwgMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGVudGVyTW9kaWZpY2F0aW9uKCk7XG5cbiAgICBsaW5rcy5zcGxpY2UoaWR4LCAxKTtcblxuICAgIHZhciBmcm9tTm9kZSA9IGdldE5vZGUobGluay5mcm9tSWQpO1xuICAgIHZhciB0b05vZGUgPSBnZXROb2RlKGxpbmsudG9JZCk7XG5cbiAgICBpZiAoZnJvbU5vZGUpIHtcbiAgICAgIGlkeCA9IGluZGV4T2ZFbGVtZW50SW5BcnJheShsaW5rLCBmcm9tTm9kZS5saW5rcyk7XG4gICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgZnJvbU5vZGUubGlua3Muc3BsaWNlKGlkeCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRvTm9kZSkge1xuICAgICAgaWR4ID0gaW5kZXhPZkVsZW1lbnRJbkFycmF5KGxpbmssIHRvTm9kZS5saW5rcyk7XG4gICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgdG9Ob2RlLmxpbmtzLnNwbGljZShpZHgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlY29yZExpbmtDaGFuZ2UobGluaywgJ3JlbW92ZScpO1xuXG4gICAgZXhpdE1vZGlmaWNhdGlvbigpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRMaW5rKGZyb21Ob2RlSWQsIHRvTm9kZUlkKSB7XG4gICAgLy8gVE9ETzogVXNlIHNvcnRlZCBsaW5rcyB0byBzcGVlZCB0aGlzIHVwXG4gICAgdmFyIG5vZGUgPSBnZXROb2RlKGZyb21Ob2RlSWQpLFxuICAgICAgaTtcbiAgICBpZiAoIW5vZGUgfHwgIW5vZGUubGlua3MpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBub2RlLmxpbmtzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbGluayA9IG5vZGUubGlua3NbaV07XG4gICAgICBpZiAobGluay5mcm9tSWQgPT09IGZyb21Ob2RlSWQgJiYgbGluay50b0lkID09PSB0b05vZGVJZCkge1xuICAgICAgICByZXR1cm4gbGluaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDsgLy8gbm8gbGluay5cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIGVudGVyTW9kaWZpY2F0aW9uKCk7XG4gICAgZm9yRWFjaE5vZGUoZnVuY3Rpb24obm9kZSkge1xuICAgICAgcmVtb3ZlTm9kZShub2RlLmlkKTtcbiAgICB9KTtcbiAgICBleGl0TW9kaWZpY2F0aW9uKCk7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JFYWNoTGluayhjYWxsYmFjaykge1xuICAgIHZhciBpLCBsZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gbGlua3MubGVuZ3RoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY2FsbGJhY2sobGlua3NbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZvckVhY2hMaW5rZWROb2RlKG5vZGVJZCwgY2FsbGJhY2ssIG9yaWVudGVkKSB7XG4gICAgdmFyIG5vZGUgPSBnZXROb2RlKG5vZGVJZCk7XG5cbiAgICBpZiAobm9kZSAmJiBub2RlLmxpbmtzICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKG9yaWVudGVkKSB7XG4gICAgICAgIHJldHVybiBmb3JFYWNoT3JpZW50ZWRMaW5rKG5vZGUubGlua3MsIG5vZGVJZCwgY2FsbGJhY2spO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZvckVhY2hOb25PcmllbnRlZExpbmsobm9kZS5saW5rcywgbm9kZUlkLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZm9yRWFjaE5vbk9yaWVudGVkTGluayhsaW5rcywgbm9kZUlkLCBjYWxsYmFjaykge1xuICAgIHZhciBxdWl0RmFzdDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmtzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbGluayA9IGxpbmtzW2ldO1xuICAgICAgdmFyIGxpbmtlZE5vZGVJZCA9IGxpbmsuZnJvbUlkID09PSBub2RlSWQgPyBsaW5rLnRvSWQgOiBsaW5rLmZyb21JZDtcblxuICAgICAgcXVpdEZhc3QgPSBjYWxsYmFjayhub2Rlc1tsaW5rZWROb2RlSWRdLCBsaW5rKTtcbiAgICAgIGlmIChxdWl0RmFzdCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gQ2xpZW50IGRvZXMgbm90IG5lZWQgbW9yZSBpdGVyYXRpb25zLiBCcmVhayBub3cuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZm9yRWFjaE9yaWVudGVkTGluayhsaW5rcywgbm9kZUlkLCBjYWxsYmFjaykge1xuICAgIHZhciBxdWl0RmFzdDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmtzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbGluayA9IGxpbmtzW2ldO1xuICAgICAgaWYgKGxpbmsuZnJvbUlkID09PSBub2RlSWQpIHtcbiAgICAgICAgcXVpdEZhc3QgPSBjYWxsYmFjayhub2Rlc1tsaW5rLnRvSWRdLCBsaW5rKTtcbiAgICAgICAgaWYgKHF1aXRGYXN0KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7IC8vIENsaWVudCBkb2VzIG5vdCBuZWVkIG1vcmUgaXRlcmF0aW9ucy4gQnJlYWsgbm93LlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gd2Ugd2lsbCBub3QgZmlyZSBhbnl0aGluZyB1bnRpbCB1c2VycyBvZiB0aGlzIGxpYnJhcnkgZXhwbGljaXRseSBjYWxsIGBvbigpYFxuICAvLyBtZXRob2QuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4gIC8vIEVudGVyLCBFeGl0IG1vZGlmaWNhdGlvbiBhbGxvd3MgYnVsayBncmFwaCB1cGRhdGVzIHdpdGhvdXQgZmlyaW5nIGV2ZW50cy5cbiAgZnVuY3Rpb24gZW50ZXJNb2RpZmljYXRpb25SZWFsKCkge1xuICAgIHN1c3BlbmRFdmVudHMgKz0gMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4aXRNb2RpZmljYXRpb25SZWFsKCkge1xuICAgIHN1c3BlbmRFdmVudHMgLT0gMTtcbiAgICBpZiAoc3VzcGVuZEV2ZW50cyA9PT0gMCAmJiBjaGFuZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGdyYXBoUGFydC5maXJlKCdjaGFuZ2VkJywgY2hhbmdlcyk7XG4gICAgICBjaGFuZ2VzLmxlbmd0aCA9IDA7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlTm9kZUl0ZXJhdG9yKCkge1xuICAgIC8vIE9iamVjdC5rZXlzIGl0ZXJhdG9yIGlzIDEuM3ggZmFzdGVyIHRoYW4gYGZvciBpbmAgbG9vcC5cbiAgICAvLyBTZWUgYGh0dHBzOi8vZ2l0aHViLmNvbS9hbnZha2EvbmdyYXBoLmdyYXBoL3RyZWUvYmVuY2gtZm9yLWluLXZzLW9iai1rZXlzYFxuICAgIC8vIGJyYW5jaCBmb3IgcGVyZiB0ZXN0XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzID8gb2JqZWN0S2V5c0l0ZXJhdG9yIDogZm9ySW5JdGVyYXRvcjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9iamVjdEtleXNJdGVyYXRvcihjYWxsYmFjaykge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG5vZGVzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChjYWxsYmFjayhub2Rlc1trZXlzW2ldXSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIGNsaWVudCBkb2Vzbid0IHdhbnQgdG8gcHJvY2VlZC4gUmV0dXJuLlxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZvckluSXRlcmF0b3IoY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBub2RlO1xuXG4gICAgZm9yIChub2RlIGluIG5vZGVzKSB7XG4gICAgICBpZiAoY2FsbGJhY2sobm9kZXNbbm9kZV0pKSB7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBjbGllbnQgZG9lc24ndCB3YW50IHRvIHByb2NlZWQuIFJldHVybi5cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gbmVlZCB0aGlzIGZvciBvbGQgYnJvd3NlcnMuIFNob3VsZCB0aGlzIGJlIGEgc2VwYXJhdGUgbW9kdWxlP1xuZnVuY3Rpb24gaW5kZXhPZkVsZW1lbnRJbkFycmF5KGVsZW1lbnQsIGFycmF5KSB7XG4gIGlmICghYXJyYXkpIHJldHVybiAtMTtcblxuICBpZiAoYXJyYXkuaW5kZXhPZikge1xuICAgIHJldHVybiBhcnJheS5pbmRleE9mKGVsZW1lbnQpO1xuICB9XG5cbiAgdmFyIGxlbiA9IGFycmF5Lmxlbmd0aCxcbiAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgIGlmIChhcnJheVtpXSA9PT0gZWxlbWVudCkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIEludGVybmFsIHN0cnVjdHVyZSB0byByZXByZXNlbnQgbm9kZTtcbiAqL1xuZnVuY3Rpb24gTm9kZShpZCwgZGF0YSkge1xuICB0aGlzLmlkID0gaWQ7XG4gIHRoaXMubGlua3MgPSBudWxsO1xuICB0aGlzLmRhdGEgPSBkYXRhO1xufVxuXG5mdW5jdGlvbiBhZGRMaW5rVG9Ob2RlKG5vZGUsIGxpbmspIHtcbiAgaWYgKG5vZGUubGlua3MpIHtcbiAgICBub2RlLmxpbmtzLnB1c2gobGluayk7XG4gIH0gZWxzZSB7XG4gICAgbm9kZS5saW5rcyA9IFtsaW5rXTtcbiAgfVxufVxuXG4vKipcbiAqIEludGVybmFsIHN0cnVjdHVyZSB0byByZXByZXNlbnQgbGlua3M7XG4gKi9cbmZ1bmN0aW9uIExpbmsoZnJvbUlkLCB0b0lkLCBkYXRhLCBpZCkge1xuICB0aGlzLmZyb21JZCA9IGZyb21JZDtcbiAgdGhpcy50b0lkID0gdG9JZDtcbiAgdGhpcy5kYXRhID0gZGF0YTtcbiAgdGhpcy5pZCA9IGlkO1xufVxuXG5mdW5jdGlvbiBoYXNoQ29kZShzdHIpIHtcbiAgdmFyIGhhc2ggPSAwLCBpLCBjaHIsIGxlbjtcbiAgaWYgKHN0ci5sZW5ndGggPT0gMCkgcmV0dXJuIGhhc2g7XG4gIGZvciAoaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNociAgID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCAgPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIGNocjtcbiAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICB9XG4gIHJldHVybiBoYXNoO1xufVxuXG5mdW5jdGlvbiBtYWtlTGlua0lkKGZyb21JZCwgdG9JZCkge1xuICByZXR1cm4gZnJvbUlkLnRvU3RyaW5nKCkgKyAn8J+RiSAnICsgdG9JZC50b1N0cmluZygpO1xufVxuIiwiLyoqXG4gKiBCYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vbW91cm5lci90aW55cXVldWVcbiAqIENvcHlyaWdodCAoYykgMjAxNywgVmxhZGltaXIgQWdhZm9ua2luIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3VybmVyL3RpbnlxdWV1ZS9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKiBcbiAqIEFkYXB0ZWQgZm9yIFBhdGhGaW5kaW5nIG5lZWRzIGJ5IEBhbnZha2FcbiAqIENvcHlyaWdodCAoYykgMjAxNywgQW5kcmVpIEthc2hjaGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBOb2RlSGVhcDtcblxuZnVuY3Rpb24gTm9kZUhlYXAoZGF0YSwgb3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTm9kZUhlYXApKSByZXR1cm4gbmV3IE5vZGVIZWFwKGRhdGEsIG9wdGlvbnMpO1xuXG4gIGlmICghQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgIC8vIGFzc3VtZSBmaXJzdCBhcmd1bWVudCBpcyBvdXIgY29uZmlnIG9iamVjdDtcbiAgICBvcHRpb25zID0gZGF0YTtcbiAgICBkYXRhID0gW107XG4gIH1cblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0aGlzLmRhdGEgPSBkYXRhIHx8IFtdO1xuICB0aGlzLmxlbmd0aCA9IHRoaXMuZGF0YS5sZW5ndGg7XG4gIHRoaXMuY29tcGFyZSA9IG9wdGlvbnMuY29tcGFyZSB8fCBkZWZhdWx0Q29tcGFyZTtcbiAgdGhpcy5zZXROb2RlSWQgPSBvcHRpb25zLnNldE5vZGVJZCB8fCBub29wO1xuXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKHZhciBpID0gKHRoaXMubGVuZ3RoID4+IDEpOyBpID49IDA7IGktLSkgdGhpcy5fZG93bihpKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnNldE5vZGVJZCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy5zZXROb2RlSWQodGhpcy5kYXRhW2ldLCBpKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmZ1bmN0aW9uIGRlZmF1bHRDb21wYXJlKGEsIGIpIHtcbiAgcmV0dXJuIGEgLSBiO1xufVxuXG5Ob2RlSGVhcC5wcm90b3R5cGUgPSB7XG5cbiAgcHVzaDogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB0aGlzLmRhdGEucHVzaChpdGVtKTtcbiAgICB0aGlzLnNldE5vZGVJZChpdGVtLCB0aGlzLmxlbmd0aCk7XG4gICAgdGhpcy5sZW5ndGgrKztcbiAgICB0aGlzLl91cCh0aGlzLmxlbmd0aCAtIDEpO1xuICB9LFxuXG4gIHBvcDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgIHZhciB0b3AgPSB0aGlzLmRhdGFbMF07XG4gICAgdGhpcy5sZW5ndGgtLTtcblxuICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZGF0YVswXSA9IHRoaXMuZGF0YVt0aGlzLmxlbmd0aF07XG4gICAgICB0aGlzLnNldE5vZGVJZCh0aGlzLmRhdGFbMF0sIDApO1xuICAgICAgdGhpcy5fZG93bigwKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhLnBvcCgpO1xuXG4gICAgcmV0dXJuIHRvcDtcbiAgfSxcblxuICBwZWVrOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVswXTtcbiAgfSxcblxuICB1cGRhdGVJdGVtOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgdGhpcy5fZG93bihwb3MpO1xuICAgIHRoaXMuX3VwKHBvcyk7XG4gIH0sXG5cbiAgX3VwOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGNvbXBhcmUgPSB0aGlzLmNvbXBhcmU7XG4gICAgdmFyIHNldE5vZGVJZCA9IHRoaXMuc2V0Tm9kZUlkO1xuICAgIHZhciBpdGVtID0gZGF0YVtwb3NdO1xuXG4gICAgd2hpbGUgKHBvcyA+IDApIHtcbiAgICAgIHZhciBwYXJlbnQgPSAocG9zIC0gMSkgPj4gMTtcbiAgICAgIHZhciBjdXJyZW50ID0gZGF0YVtwYXJlbnRdO1xuICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgY3VycmVudCkgPj0gMCkgYnJlYWs7XG4gICAgICAgIGRhdGFbcG9zXSA9IGN1cnJlbnQ7XG5cbiAgICAgICBzZXROb2RlSWQoY3VycmVudCwgcG9zKTtcbiAgICAgICBwb3MgPSBwYXJlbnQ7XG4gICAgfVxuXG4gICAgZGF0YVtwb3NdID0gaXRlbTtcbiAgICBzZXROb2RlSWQoaXRlbSwgcG9zKTtcbiAgfSxcblxuICBfZG93bjogZnVuY3Rpb24gKHBvcykge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBjb21wYXJlID0gdGhpcy5jb21wYXJlO1xuICAgIHZhciBoYWxmTGVuZ3RoID0gdGhpcy5sZW5ndGggPj4gMTtcbiAgICB2YXIgaXRlbSA9IGRhdGFbcG9zXTtcbiAgICB2YXIgc2V0Tm9kZUlkID0gdGhpcy5zZXROb2RlSWQ7XG5cbiAgICB3aGlsZSAocG9zIDwgaGFsZkxlbmd0aCkge1xuICAgICAgdmFyIGxlZnQgPSAocG9zIDw8IDEpICsgMTtcbiAgICAgIHZhciByaWdodCA9IGxlZnQgKyAxO1xuICAgICAgdmFyIGJlc3QgPSBkYXRhW2xlZnRdO1xuXG4gICAgICBpZiAocmlnaHQgPCB0aGlzLmxlbmd0aCAmJiBjb21wYXJlKGRhdGFbcmlnaHRdLCBiZXN0KSA8IDApIHtcbiAgICAgICAgbGVmdCA9IHJpZ2h0O1xuICAgICAgICBiZXN0ID0gZGF0YVtyaWdodF07XG4gICAgICB9XG4gICAgICBpZiAoY29tcGFyZShiZXN0LCBpdGVtKSA+PSAwKSBicmVhaztcblxuICAgICAgZGF0YVtwb3NdID0gYmVzdDtcbiAgICAgIHNldE5vZGVJZChiZXN0LCBwb3MpO1xuICAgICAgcG9zID0gbGVmdDtcbiAgICB9XG5cbiAgICBkYXRhW3Bvc10gPSBpdGVtO1xuICAgIHNldE5vZGVJZChpdGVtLCBwb3MpO1xuICB9XG59OyIsIi8qKlxuICogUGVyZm9ybXMgc3Vib3B0aW1hbCwgZ3JlZWQgQSBTdGFyIHBhdGggZmluZGluZy5cbiAqIFRoaXMgZmluZGVyIGRvZXMgbm90IG5lY2Vzc2FyeSBmaW5kcyB0aGUgc2hvcnRlc3QgcGF0aC4gVGhlIHBhdGhcbiAqIHRoYXQgaXQgZmluZHMgaXMgdmVyeSBjbG9zZSB0byB0aGUgc2hvcnRlc3Qgb25lLiBJdCBpcyB2ZXJ5IGZhc3QgdGhvdWdoLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFTdGFyQmk7XG5cbnZhciBOb2RlSGVhcCA9IHJlcXVpcmUoJy4vTm9kZUhlYXAnKTtcbnZhciBtYWtlU2VhcmNoU3RhdGVQb29sID0gcmVxdWlyZSgnLi9tYWtlU2VhcmNoU3RhdGVQb29sJyk7XG52YXIgaGV1cmlzdGljcyA9IHJlcXVpcmUoJy4vaGV1cmlzdGljcycpO1xudmFyIGRlZmF1bHRTZXR0aW5ncyA9IHJlcXVpcmUoJy4vZGVmYXVsdFNldHRpbmdzJyk7XG5cbnZhciBCWV9GUk9NID0gMTtcbnZhciBCWV9UTyA9IDI7XG52YXIgTk9fUEFUSCA9IGRlZmF1bHRTZXR0aW5ncy5OT19QQVRIO1xuXG5tb2R1bGUuZXhwb3J0cy5sMiA9IGhldXJpc3RpY3MubDI7XG5tb2R1bGUuZXhwb3J0cy5sMSA9IGhldXJpc3RpY3MubDE7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBwYXRoZmluZGVyLiBBIHBhdGhmaW5kZXIgaGFzIGp1c3Qgb25lIG1ldGhvZDpcbiAqIGBmaW5kKGZyb21JZCwgdG9JZClgLCBpdCBtYXkgYmUgZXh0ZW5kZWQgaW4gZnV0dXJlLlxuICogXG4gKiBOT1RFOiBBbGdvcml0aG0gaW1wbGVtZW50ZWQgaW4gdGhpcyBjb2RlIERPRVMgTk9UIGZpbmQgb3B0aW1hbCBwYXRoLlxuICogWWV0IHRoZSBwYXRoIHRoYXQgaXQgZmluZHMgaXMgYWx3YXlzIG5lYXIgb3B0aW1hbCwgYW5kIGl0IGZpbmRzIGl0IHZlcnkgZmFzdC5cbiAqIFxuICogQHBhcmFtIHtuZ3JhcGguZ3JhcGh9IGdyYXBoIGluc3RhbmNlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FudmFrYS9uZ3JhcGguZ3JhcGhcbiAqIFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgdGhhdCBjb25maWd1cmVzIHNlYXJjaFxuICogQHBhcmFtIHtGdW5jdGlvbihhLCBiKX0gb3B0aW9ucy5oZXVyaXN0aWMgLSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBlc3RpbWF0ZWQgZGlzdGFuY2UgYmV0d2VlblxuICogbm9kZXMgYGFgIGFuZCBgYmAuICBEZWZhdWx0cyBmdW5jdGlvbiByZXR1cm5zIDAsIHdoaWNoIG1ha2VzIHRoaXMgc2VhcmNoIGVxdWl2YWxlbnQgdG8gRGlqa3N0cmEgc2VhcmNoLlxuICogQHBhcmFtIHtGdW5jdGlvbihhLCBiKX0gb3B0aW9ucy5kaXN0YW5jZSAtIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFjdHVhbCBkaXN0YW5jZSBiZXR3ZWVuIHR3b1xuICogbm9kZXMgYGFgIGFuZCBgYmAuIEJ5IGRlZmF1bHQgdGhpcyBpcyBzZXQgdG8gcmV0dXJuIGdyYXBoLXRoZW9yZXRpY2FsIGRpc3RhbmNlIChhbHdheXMgMSk7XG4gKiBcbiAqIEByZXR1cm5zIHtPYmplY3R9IEEgcGF0aGZpbmRlciB3aXRoIHNpbmdsZSBtZXRob2QgYGZpbmQoKWAuXG4gKi9cbmZ1bmN0aW9uIGFTdGFyQmkoZ3JhcGgsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIC8vIHdoZXRoZXIgdHJhdmVyc2FsIHNob3VsZCBiZSBjb25zaWRlcmVkIG92ZXIgb3JpZW50ZWQgZ3JhcGguXG4gIHZhciBvcmllbnRlZCA9IG9wdGlvbnMub3JpZW50ZWQ7XG5cbiAgdmFyIGhldXJpc3RpYyA9IG9wdGlvbnMuaGV1cmlzdGljO1xuICBpZiAoIWhldXJpc3RpYykgaGV1cmlzdGljID0gZGVmYXVsdFNldHRpbmdzLmhldXJpc3RpYztcblxuICB2YXIgZGlzdGFuY2UgPSBvcHRpb25zLmRpc3RhbmNlO1xuICBpZiAoIWRpc3RhbmNlKSBkaXN0YW5jZSA9IGRlZmF1bHRTZXR0aW5ncy5kaXN0YW5jZTtcbiAgdmFyIHBvb2wgPSBtYWtlU2VhcmNoU3RhdGVQb29sKCk7XG5cbiAgcmV0dXJuIHtcbiAgICBmaW5kOiBmaW5kXG4gIH07XG5cbiAgZnVuY3Rpb24gZmluZChmcm9tSWQsIHRvSWQpIHtcbiAgICAvLyBOb3Qgc3VyZSBpZiB3ZSBzaG91bGQgcmV0dXJuIE5PX1BBVEggb3IgdGhyb3cuIFRocm93IHNlZW0gdG8gYmUgbW9yZVxuICAgIC8vIGhlbHBmdWwgdG8gZGVidWcgZXJyb3JzLiBTbywgdGhyb3dpbmcuXG4gICAgdmFyIGZyb20gPSBncmFwaC5nZXROb2RlKGZyb21JZCk7XG4gICAgaWYgKCFmcm9tKSB0aHJvdyBuZXcgRXJyb3IoJ2Zyb21JZCBpcyBub3QgZGVmaW5lZCBpbiB0aGlzIGdyYXBoOiAnICsgZnJvbUlkKTtcbiAgICB2YXIgdG8gPSBncmFwaC5nZXROb2RlKHRvSWQpO1xuICAgIGlmICghdG8pIHRocm93IG5ldyBFcnJvcigndG9JZCBpcyBub3QgZGVmaW5lZCBpbiB0aGlzIGdyYXBoOiAnICsgdG9JZCk7XG5cbiAgICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiBbZnJvbV07IC8vIHRyaXZpYWwgY2FzZS5cblxuICAgIHBvb2wucmVzZXQoKTtcblxuICAgIHZhciBjYWxsVmlzaXRvciA9IG9yaWVudGVkID8gb3JpZW50ZWRWaXNpdG9yIDogbm9uT3JpZW50ZWRWaXNpdG9yO1xuXG4gICAgLy8gTWFwcyBub2RlSWQgdG8gTm9kZVNlYXJjaFN0YXRlLlxuICAgIHZhciBub2RlU3RhdGUgPSBuZXcgTWFwKCk7XG5cbiAgICB2YXIgb3BlblNldEZyb20gPSBuZXcgTm9kZUhlYXAoe1xuICAgICAgY29tcGFyZTogZGVmYXVsdFNldHRpbmdzLmNvbXBhcmVGU2NvcmUsXG4gICAgICBzZXROb2RlSWQ6IGRlZmF1bHRTZXR0aW5ncy5zZXRIZWFwSW5kZXhcbiAgICB9KTtcblxuICAgIHZhciBvcGVuU2V0VG8gPSBuZXcgTm9kZUhlYXAoe1xuICAgICAgY29tcGFyZTogZGVmYXVsdFNldHRpbmdzLmNvbXBhcmVGU2NvcmUsXG4gICAgICBzZXROb2RlSWQ6IGRlZmF1bHRTZXR0aW5ncy5zZXRIZWFwSW5kZXhcbiAgICB9KTtcblxuXG4gICAgdmFyIHN0YXJ0Tm9kZSA9IHBvb2wuY3JlYXRlTmV3U3RhdGUoZnJvbSk7XG4gICAgbm9kZVN0YXRlLnNldChmcm9tSWQsIHN0YXJ0Tm9kZSk7XG5cbiAgICAvLyBGb3IgdGhlIGZpcnN0IG5vZGUsIGZTY29yZSBpcyBjb21wbGV0ZWx5IGhldXJpc3RpYy5cbiAgICBzdGFydE5vZGUuZlNjb3JlID0gaGV1cmlzdGljKGZyb20sIHRvKTtcbiAgICAvLyBUaGUgY29zdCBvZiBnb2luZyBmcm9tIHN0YXJ0IHRvIHN0YXJ0IGlzIHplcm8uXG4gICAgc3RhcnROb2RlLmRpc3RhbmNlVG9Tb3VyY2UgPSAwO1xuICAgIG9wZW5TZXRGcm9tLnB1c2goc3RhcnROb2RlKTtcbiAgICBzdGFydE5vZGUub3BlbiA9IEJZX0ZST007XG5cbiAgICB2YXIgZW5kTm9kZSA9IHBvb2wuY3JlYXRlTmV3U3RhdGUodG8pO1xuICAgIGVuZE5vZGUuZlNjb3JlID0gaGV1cmlzdGljKHRvLCBmcm9tKTtcbiAgICBlbmROb2RlLmRpc3RhbmNlVG9Tb3VyY2UgPSAwO1xuICAgIG9wZW5TZXRUby5wdXNoKGVuZE5vZGUpO1xuICAgIGVuZE5vZGUub3BlbiA9IEJZX1RPO1xuXG4gICAgLy8gQ29zdCBvZiB0aGUgYmVzdCBzb2x1dGlvbiBmb3VuZCBzbyBmYXIuIFVzZWQgZm9yIGFjY3VyYXRlIHRlcm1pbmF0aW9uXG4gICAgdmFyIGxNaW4gPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgdmFyIG1pbkZyb207XG4gICAgdmFyIG1pblRvO1xuXG4gICAgdmFyIGN1cnJlbnRTZXQgPSBvcGVuU2V0RnJvbTtcbiAgICB2YXIgY3VycmVudE9wZW5lciA9IEJZX0ZST007XG5cbiAgICB3aGlsZSAob3BlblNldEZyb20ubGVuZ3RoID4gMCAmJiBvcGVuU2V0VG8ubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKG9wZW5TZXRGcm9tLmxlbmd0aCA8IG9wZW5TZXRUby5sZW5ndGgpIHtcbiAgICAgICAgLy8gd2UgcGljayBhIHNldCB3aXRoIGxlc3MgZWxlbWVudHNcbiAgICAgICAgY3VycmVudE9wZW5lciA9IEJZX0ZST007XG4gICAgICAgIGN1cnJlbnRTZXQgPSBvcGVuU2V0RnJvbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnRPcGVuZXIgPSBCWV9UTztcbiAgICAgICAgY3VycmVudFNldCA9IG9wZW5TZXRUbztcbiAgICAgIH1cblxuICAgICAgdmFyIGN1cnJlbnQgPSBjdXJyZW50U2V0LnBvcCgpO1xuXG4gICAgICAvLyBubyBuZWVkIHRvIHZpc2l0IHRoaXMgbm9kZSBhbnltb3JlXG4gICAgICBjdXJyZW50LmNsb3NlZCA9IHRydWU7XG5cbiAgICAgIGlmIChjdXJyZW50LmRpc3RhbmNlVG9Tb3VyY2UgPiBsTWluKSBjb250aW51ZTtcblxuICAgICAgZ3JhcGguZm9yRWFjaExpbmtlZE5vZGUoY3VycmVudC5ub2RlLmlkLCBjYWxsVmlzaXRvcik7XG5cbiAgICAgIGlmIChtaW5Gcm9tICYmIG1pblRvKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgbm90IG5lY2Vzc2FyeSB0aGUgYmVzdCBwYXRoLCBidXQgd2UgYXJlIHNvIGdyZWVkeSB0aGF0IHdlXG4gICAgICAgIC8vIGNhbid0IHJlc2lzdDpcbiAgICAgICAgcmV0dXJuIHJlY29uc3RydWN0QmlEaXJlY3Rpb25hbFBhdGgobWluRnJvbSwgbWluVG8pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBOT19QQVRIOyAvLyBObyBwYXRoLlxuXG4gICAgZnVuY3Rpb24gbm9uT3JpZW50ZWRWaXNpdG9yKG90aGVyTm9kZSwgbGluaykge1xuICAgICAgcmV0dXJuIHZpc2l0Tm9kZShvdGhlck5vZGUsIGxpbmssIGN1cnJlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9yaWVudGVkVmlzaXRvcihvdGhlck5vZGUsIGxpbmspIHtcbiAgICAgIC8vIEZvciBvcml0bmVkIGdyYXBocyB3ZSBuZWVkIHRvIHJldmVyc2UgZ3JhcGgsIHdoZW4gdHJhdmVsaW5nXG4gICAgICAvLyBiYWNrd2FyZHMuIFNvLCB3ZSB1c2Ugbm9uLW9yaWVudGVkIG5ncmFwaCdzIHRyYXZlcnNhbCwgYW5kIFxuICAgICAgLy8gZmlsdGVyIGxpbmsgb3JpZW50YXRpb24gaGVyZS5cbiAgICAgIGlmIChjdXJyZW50T3BlbmVyID09PSBCWV9GUk9NKSB7XG4gICAgICAgIGlmIChsaW5rLmZyb21JZCA9PT0gY3VycmVudC5ub2RlLmlkKSByZXR1cm4gdmlzaXROb2RlKG90aGVyTm9kZSwgbGluaywgY3VycmVudClcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudE9wZW5lciA9PT0gQllfVE8pIHtcbiAgICAgICAgaWYgKGxpbmsudG9JZCA9PT0gY3VycmVudC5ub2RlLmlkKSByZXR1cm4gdmlzaXROb2RlKG90aGVyTm9kZSwgbGluaywgY3VycmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuRXhpdChjdXJyZW50Tm9kZSkge1xuICAgICAgdmFyIG9wZW5lciA9IGN1cnJlbnROb2RlLm9wZW5cbiAgICAgIGlmIChvcGVuZXIgJiYgb3BlbmVyICE9PSBjdXJyZW50T3BlbmVyKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVjb25zdHJ1Y3RCaURpcmVjdGlvbmFsUGF0aChhLCBiKSB7XG4gICAgICB2YXIgcGF0aE9mTm9kZXMgPSBbXTtcbiAgICAgIHZhciBhUGFyZW50ID0gYTtcbiAgICAgIHdoaWxlKGFQYXJlbnQpIHtcbiAgICAgICAgcGF0aE9mTm9kZXMucHVzaChhUGFyZW50Lm5vZGUpO1xuICAgICAgICBhUGFyZW50ID0gYVBhcmVudC5wYXJlbnQ7XG4gICAgICB9XG4gICAgICB2YXIgYlBhcmVudCA9IGI7XG4gICAgICB3aGlsZSAoYlBhcmVudCkge1xuICAgICAgICBwYXRoT2ZOb2Rlcy51bnNoaWZ0KGJQYXJlbnQubm9kZSk7XG4gICAgICAgIGJQYXJlbnQgPSBiUGFyZW50LnBhcmVudFxuICAgICAgfVxuICAgICAgcmV0dXJuIHBhdGhPZk5vZGVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZpc2l0Tm9kZShvdGhlck5vZGUsIGxpbmssIGNhbWVGcm9tKSB7XG4gICAgICB2YXIgb3RoZXJTZWFyY2hTdGF0ZSA9IG5vZGVTdGF0ZS5nZXQob3RoZXJOb2RlLmlkKTtcbiAgICAgIGlmICghb3RoZXJTZWFyY2hTdGF0ZSkge1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlID0gcG9vbC5jcmVhdGVOZXdTdGF0ZShvdGhlck5vZGUpO1xuICAgICAgICBub2RlU3RhdGUuc2V0KG90aGVyTm9kZS5pZCwgb3RoZXJTZWFyY2hTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvdGhlclNlYXJjaFN0YXRlLmNsb3NlZCkge1xuICAgICAgICAvLyBBbHJlYWR5IHByb2Nlc3NlZCB0aGlzIG5vZGUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGNhbkV4aXQob3RoZXJTZWFyY2hTdGF0ZSwgY2FtZUZyb20pKSB7XG4gICAgICAgIC8vIHRoaXMgbm9kZSB3YXMgb3BlbmVkIGJ5IGFsdGVybmF0aXZlIG9wZW5lci4gVGhlIHNldHMgaW50ZXJzZWN0IG5vdyxcbiAgICAgICAgLy8gd2UgZm91bmQgYW4gb3B0aW1hbCBwYXRoLCB0aGF0IGdvZXMgdGhyb3VnaCAqdGhpcyogbm9kZS4gSG93ZXZlciwgdGhlcmVcbiAgICAgICAgLy8gaXMgbm8gZ3VhcmFudGVlIHRoYXQgdGhpcyBpcyB0aGUgZ2xvYmFsIG9wdGltYWwgc29sdXRpb24gcGF0aC5cblxuICAgICAgICB2YXIgcG90ZW50aWFsTE1pbiA9IG90aGVyU2VhcmNoU3RhdGUuZGlzdGFuY2VUb1NvdXJjZSArIGNhbWVGcm9tLmRpc3RhbmNlVG9Tb3VyY2U7XG4gICAgICAgIGlmIChwb3RlbnRpYWxMTWluIDwgbE1pbikge1xuICAgICAgICAgIG1pbkZyb20gPSBvdGhlclNlYXJjaFN0YXRlO1xuICAgICAgICAgIG1pblRvID0gY2FtZUZyb21cbiAgICAgICAgICBsTWluID0gcG90ZW50aWFsTE1pbjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZSBhcmUgZG9uZSB3aXRoIHRoaXMgbm9kZS5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGVudGF0aXZlRGlzdGFuY2UgPSBjYW1lRnJvbS5kaXN0YW5jZVRvU291cmNlICsgZGlzdGFuY2Uob3RoZXJTZWFyY2hTdGF0ZS5ub2RlLCBjYW1lRnJvbS5ub2RlLCBsaW5rKTtcblxuICAgICAgaWYgKHRlbnRhdGl2ZURpc3RhbmNlID49IG90aGVyU2VhcmNoU3RhdGUuZGlzdGFuY2VUb1NvdXJjZSkge1xuICAgICAgICAvLyBUaGlzIHdvdWxkIG9ubHkgbWFrZSBvdXIgcGF0aCBsb25nZXIuIElnbm9yZSB0aGlzIHJvdXRlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENob29zZSB0YXJnZXQgYmFzZWQgb24gY3VycmVudCB3b3JraW5nIHNldDpcbiAgICAgIHZhciB0YXJnZXQgPSAoY3VycmVudE9wZW5lciA9PT0gQllfRlJPTSkgPyB0byA6IGZyb207XG4gICAgICB2YXIgbmV3RlNjb3JlID0gdGVudGF0aXZlRGlzdGFuY2UgKyBoZXVyaXN0aWMob3RoZXJTZWFyY2hTdGF0ZS5ub2RlLCB0YXJnZXQpO1xuICAgICAgaWYgKG5ld0ZTY29yZSA+PSBsTWluKSB7XG4gICAgICAgIC8vIHRoaXMgY2FuJ3QgYmUgb3B0aW1hbCBwYXRoLCBhcyB3ZSBoYXZlIGFscmVhZHkgZm91bmQgYSBzaG9ydGVyIHBhdGguXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG90aGVyU2VhcmNoU3RhdGUuZlNjb3JlID0gbmV3RlNjb3JlO1xuXG4gICAgICBpZiAob3RoZXJTZWFyY2hTdGF0ZS5vcGVuID09PSAwKSB7XG4gICAgICAgIC8vIFJlbWVtYmVyIHRoaXMgbm9kZSBpbiB0aGUgY3VycmVudCBzZXRcbiAgICAgICAgY3VycmVudFNldC5wdXNoKG90aGVyU2VhcmNoU3RhdGUpO1xuICAgICAgICBjdXJyZW50U2V0LnVwZGF0ZUl0ZW0ob3RoZXJTZWFyY2hTdGF0ZS5oZWFwSW5kZXgpO1xuXG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUub3BlbiA9IGN1cnJlbnRPcGVuZXI7XG4gICAgICB9XG5cbiAgICAgIC8vIGJpbmdvISB3ZSBmb3VuZCBzaG9ydGVyIHBhdGg6XG4gICAgICBvdGhlclNlYXJjaFN0YXRlLnBhcmVudCA9IGNhbWVGcm9tO1xuICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5kaXN0YW5jZVRvU291cmNlID0gdGVudGF0aXZlRGlzdGFuY2U7XG4gICAgfVxuICB9XG59XG4iLCIvKipcbiAqIFBlcmZvcm1zIGEgdW5pLWRpcmVjdGlvbmFsIEEgU3RhciBzZWFyY2ggb24gZ3JhcGguXG4gKiBcbiAqIFdlIHdpbGwgdHJ5IHRvIG1pbmltaXplIGYobikgPSBnKG4pICsgaChuKSwgd2hlcmVcbiAqIGcobikgaXMgYWN0dWFsIGRpc3RhbmNlIGZyb20gc291cmNlIG5vZGUgdG8gYG5gLCBhbmRcbiAqIGgobikgaXMgaGV1cmlzdGljIGRpc3RhbmNlIGZyb20gYG5gIHRvIHRhcmdldCBub2RlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFTdGFyUGF0aFNlYXJjaDtcblxudmFyIE5vZGVIZWFwID0gcmVxdWlyZSgnLi9Ob2RlSGVhcCcpO1xudmFyIG1ha2VTZWFyY2hTdGF0ZVBvb2wgPSByZXF1aXJlKCcuL21ha2VTZWFyY2hTdGF0ZVBvb2wnKTtcbnZhciBoZXVyaXN0aWNzID0gcmVxdWlyZSgnLi9oZXVyaXN0aWNzJyk7XG52YXIgZGVmYXVsdFNldHRpbmdzID0gcmVxdWlyZSgnLi9kZWZhdWx0U2V0dGluZ3MuanMnKTtcblxudmFyIE5PX1BBVEggPSBkZWZhdWx0U2V0dGluZ3MuTk9fUEFUSDtcblxubW9kdWxlLmV4cG9ydHMubDIgPSBoZXVyaXN0aWNzLmwyO1xubW9kdWxlLmV4cG9ydHMubDEgPSBoZXVyaXN0aWNzLmwxO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgcGF0aGZpbmRlci4gQSBwYXRoZmluZGVyIGhhcyBqdXN0IG9uZSBtZXRob2Q6XG4gKiBgZmluZChmcm9tSWQsIHRvSWQpYCwgaXQgbWF5IGJlIGV4dGVuZGVkIGluIGZ1dHVyZS5cbiAqIFxuICogQHBhcmFtIHtuZ3JhcGguZ3JhcGh9IGdyYXBoIGluc3RhbmNlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FudmFrYS9uZ3JhcGguZ3JhcGhcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIHRoYXQgY29uZmlndXJlcyBzZWFyY2hcbiAqIEBwYXJhbSB7RnVuY3Rpb24oYSwgYil9IG9wdGlvbnMuaGV1cmlzdGljIC0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgZXN0aW1hdGVkIGRpc3RhbmNlIGJldHdlZW5cbiAqIG5vZGVzIGBhYCBhbmQgYGJgLiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBuZXZlciBvdmVyZXN0aW1hdGUgYWN0dWFsIGRpc3RhbmNlIGJldHdlZW4gdHdvXG4gKiBub2RlcyAob3RoZXJ3aXNlIHRoZSBmb3VuZCBwYXRoIHdpbGwgbm90IGJlIHRoZSBzaG9ydGVzdCkuIERlZmF1bHRzIGZ1bmN0aW9uIHJldHVybnMgMCxcbiAqIHdoaWNoIG1ha2VzIHRoaXMgc2VhcmNoIGVxdWl2YWxlbnQgdG8gRGlqa3N0cmEgc2VhcmNoLlxuICogQHBhcmFtIHtGdW5jdGlvbihhLCBiKX0gb3B0aW9ucy5kaXN0YW5jZSAtIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFjdHVhbCBkaXN0YW5jZSBiZXR3ZWVuIHR3b1xuICogbm9kZXMgYGFgIGFuZCBgYmAuIEJ5IGRlZmF1bHQgdGhpcyBpcyBzZXQgdG8gcmV0dXJuIGdyYXBoLXRoZW9yZXRpY2FsIGRpc3RhbmNlIChhbHdheXMgMSk7XG4gKiBcbiAqIEByZXR1cm5zIHtPYmplY3R9IEEgcGF0aGZpbmRlciB3aXRoIHNpbmdsZSBtZXRob2QgYGZpbmQoKWAuXG4gKi9cbmZ1bmN0aW9uIGFTdGFyUGF0aFNlYXJjaChncmFwaCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgLy8gd2hldGhlciB0cmF2ZXJzYWwgc2hvdWxkIGJlIGNvbnNpZGVyZWQgb3ZlciBvcmllbnRlZCBncmFwaC5cbiAgdmFyIG9yaWVudGVkID0gb3B0aW9ucy5vcmllbnRlZDtcblxuICB2YXIgaGV1cmlzdGljID0gb3B0aW9ucy5oZXVyaXN0aWM7XG4gIGlmICghaGV1cmlzdGljKSBoZXVyaXN0aWMgPSBkZWZhdWx0U2V0dGluZ3MuaGV1cmlzdGljO1xuXG4gIHZhciBkaXN0YW5jZSA9IG9wdGlvbnMuZGlzdGFuY2U7XG4gIGlmICghZGlzdGFuY2UpIGRpc3RhbmNlID0gZGVmYXVsdFNldHRpbmdzLmRpc3RhbmNlO1xuICB2YXIgcG9vbCA9IG1ha2VTZWFyY2hTdGF0ZVBvb2woKTtcblxuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIEZpbmRzIGEgcGF0aCBiZXR3ZWVuIG5vZGUgYGZyb21JZGAgYW5kIGB0b0lkYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IG9mIG5vZGVzIGJldHdlZW4gYHRvSWRgIGFuZCBgZnJvbUlkYC4gRW1wdHkgYXJyYXkgaXMgcmV0dXJuZWRcbiAgICAgKiBpZiBubyBwYXRoIGlzIGZvdW5kLlxuICAgICAqL1xuICAgIGZpbmQ6IGZpbmRcbiAgfTtcblxuICBmdW5jdGlvbiBmaW5kKGZyb21JZCwgdG9JZCkge1xuICAgIHZhciBmcm9tID0gZ3JhcGguZ2V0Tm9kZShmcm9tSWQpO1xuICAgIGlmICghZnJvbSkgdGhyb3cgbmV3IEVycm9yKCdmcm9tSWQgaXMgbm90IGRlZmluZWQgaW4gdGhpcyBncmFwaDogJyArIGZyb21JZCk7XG4gICAgdmFyIHRvID0gZ3JhcGguZ2V0Tm9kZSh0b0lkKTtcbiAgICBpZiAoIXRvKSB0aHJvdyBuZXcgRXJyb3IoJ3RvSWQgaXMgbm90IGRlZmluZWQgaW4gdGhpcyBncmFwaDogJyArIHRvSWQpO1xuICAgIHBvb2wucmVzZXQoKTtcblxuICAgIC8vIE1hcHMgbm9kZUlkIHRvIE5vZGVTZWFyY2hTdGF0ZS5cbiAgICB2YXIgbm9kZVN0YXRlID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gdGhlIG5vZGVzIHRoYXQgd2Ugc3RpbGwgbmVlZCB0byBldmFsdWF0ZVxuICAgIHZhciBvcGVuU2V0ID0gbmV3IE5vZGVIZWFwKHtcbiAgICAgIGNvbXBhcmU6IGRlZmF1bHRTZXR0aW5ncy5jb21wYXJlRlNjb3JlLFxuICAgICAgc2V0Tm9kZUlkOiBkZWZhdWx0U2V0dGluZ3Muc2V0SGVhcEluZGV4XG4gICAgfSk7XG5cbiAgICB2YXIgc3RhcnROb2RlID0gcG9vbC5jcmVhdGVOZXdTdGF0ZShmcm9tKTtcbiAgICBub2RlU3RhdGUuc2V0KGZyb21JZCwgc3RhcnROb2RlKTtcblxuICAgIC8vIEZvciB0aGUgZmlyc3Qgbm9kZSwgZlNjb3JlIGlzIGNvbXBsZXRlbHkgaGV1cmlzdGljLlxuICAgIHN0YXJ0Tm9kZS5mU2NvcmUgPSBoZXVyaXN0aWMoZnJvbSwgdG8pO1xuXG4gICAgLy8gVGhlIGNvc3Qgb2YgZ29pbmcgZnJvbSBzdGFydCB0byBzdGFydCBpcyB6ZXJvLlxuICAgIHN0YXJ0Tm9kZS5kaXN0YW5jZVRvU291cmNlID0gMDtcbiAgICBvcGVuU2V0LnB1c2goc3RhcnROb2RlKTtcbiAgICBzdGFydE5vZGUub3BlbiA9IDE7XG5cbiAgICB2YXIgY2FtZUZyb207XG5cbiAgICB3aGlsZSAob3BlblNldC5sZW5ndGggPiAwKSB7XG4gICAgICBjYW1lRnJvbSA9IG9wZW5TZXQucG9wKCk7XG4gICAgICBpZiAoZ29hbFJlYWNoZWQoY2FtZUZyb20sIHRvKSkgcmV0dXJuIHJlY29uc3RydWN0UGF0aChjYW1lRnJvbSk7XG5cbiAgICAgIC8vIG5vIG5lZWQgdG8gdmlzaXQgdGhpcyBub2RlIGFueW1vcmVcbiAgICAgIGNhbWVGcm9tLmNsb3NlZCA9IHRydWU7XG4gICAgICBncmFwaC5mb3JFYWNoTGlua2VkTm9kZShjYW1lRnJvbS5ub2RlLmlkLCB2aXNpdE5laWdoYm91ciwgb3JpZW50ZWQpO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGdvdCBoZXJlLCB0aGVuIHRoZXJlIGlzIG5vIHBhdGguXG4gICAgcmV0dXJuIE5PX1BBVEg7XG5cbiAgICBmdW5jdGlvbiB2aXNpdE5laWdoYm91cihvdGhlck5vZGUsIGxpbmspIHtcbiAgICAgIHZhciBvdGhlclNlYXJjaFN0YXRlID0gbm9kZVN0YXRlLmdldChvdGhlck5vZGUuaWQpO1xuICAgICAgaWYgKCFvdGhlclNlYXJjaFN0YXRlKSB7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUgPSBwb29sLmNyZWF0ZU5ld1N0YXRlKG90aGVyTm9kZSk7XG4gICAgICAgIG5vZGVTdGF0ZS5zZXQob3RoZXJOb2RlLmlkLCBvdGhlclNlYXJjaFN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG90aGVyU2VhcmNoU3RhdGUuY2xvc2VkKSB7XG4gICAgICAgIC8vIEFscmVhZHkgcHJvY2Vzc2VkIHRoaXMgbm9kZS5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKG90aGVyU2VhcmNoU3RhdGUub3BlbiA9PT0gMCkge1xuICAgICAgICAvLyBSZW1lbWJlciB0aGlzIG5vZGUuXG4gICAgICAgIG9wZW5TZXQucHVzaChvdGhlclNlYXJjaFN0YXRlKTtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5vcGVuID0gMTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRlbnRhdGl2ZURpc3RhbmNlID0gY2FtZUZyb20uZGlzdGFuY2VUb1NvdXJjZSArIGRpc3RhbmNlKG90aGVyTm9kZSwgY2FtZUZyb20ubm9kZSwgbGluayk7XG4gICAgICBpZiAodGVudGF0aXZlRGlzdGFuY2UgPj0gb3RoZXJTZWFyY2hTdGF0ZS5kaXN0YW5jZVRvU291cmNlKSB7XG4gICAgICAgIC8vIFRoaXMgd291bGQgb25seSBtYWtlIG91ciBwYXRoIGxvbmdlci4gSWdub3JlIHRoaXMgcm91dGUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gYmluZ28hIHdlIGZvdW5kIHNob3J0ZXIgcGF0aDpcbiAgICAgIG90aGVyU2VhcmNoU3RhdGUucGFyZW50ID0gY2FtZUZyb207XG4gICAgICBvdGhlclNlYXJjaFN0YXRlLmRpc3RhbmNlVG9Tb3VyY2UgPSB0ZW50YXRpdmVEaXN0YW5jZTtcbiAgICAgIG90aGVyU2VhcmNoU3RhdGUuZlNjb3JlID0gdGVudGF0aXZlRGlzdGFuY2UgKyBoZXVyaXN0aWMob3RoZXJTZWFyY2hTdGF0ZS5ub2RlLCB0byk7XG5cbiAgICAgIG9wZW5TZXQudXBkYXRlSXRlbShvdGhlclNlYXJjaFN0YXRlLmhlYXBJbmRleCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdvYWxSZWFjaGVkKHNlYXJjaFN0YXRlLCB0YXJnZXROb2RlKSB7XG4gIHJldHVybiBzZWFyY2hTdGF0ZS5ub2RlID09PSB0YXJnZXROb2RlO1xufVxuXG5mdW5jdGlvbiByZWNvbnN0cnVjdFBhdGgoc2VhcmNoU3RhdGUpIHtcbiAgdmFyIHBhdGggPSBbc2VhcmNoU3RhdGUubm9kZV07XG4gIHZhciBwYXJlbnQgPSBzZWFyY2hTdGF0ZS5wYXJlbnQ7XG5cbiAgd2hpbGUgKHBhcmVudCkge1xuICAgIHBhdGgucHVzaChwYXJlbnQubm9kZSk7XG4gICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgfVxuXG4gIHJldHVybiBwYXRoO1xufVxuIiwiLy8gV2UgcmV1c2UgaW5zdGFuY2Ugb2YgYXJyYXksIGJ1dCB3ZSB0cmllIHRvIGZyZWV6ZSBpdCBhcyB3ZWxsLFxuLy8gc28gdGhhdCBjb25zdW1lcnMgZG9uJ3QgbW9kaWZ5IGl0LiBNYXliZSBpdCdzIGEgYmFkIGlkZWEuXG52YXIgTk9fUEFUSCA9IFtdO1xuaWYgKHR5cGVvZiBPYmplY3QuZnJlZXplID09PSAnZnVuY3Rpb24nKSBPYmplY3QuZnJlZXplKE5PX1BBVEgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gUGF0aCBzZWFyY2ggc2V0dGluZ3NcbiAgaGV1cmlzdGljOiBibGluZEhldXJpc3RpYyxcbiAgZGlzdGFuY2U6IGNvbnN0YW50RGlzdGFuY2UsXG4gIGNvbXBhcmVGU2NvcmU6IGNvbXBhcmVGU2NvcmUsXG4gIE5PX1BBVEg6IE5PX1BBVEgsXG5cbiAgLy8gaGVhcCBzZXR0aW5nc1xuICBzZXRIZWFwSW5kZXg6IHNldEhlYXBJbmRleCxcblxuICAvLyBuYmE6XG4gIHNldEgxOiBzZXRIMSxcbiAgc2V0SDI6IHNldEgyLFxuICBjb21wYXJlRjFTY29yZTogY29tcGFyZUYxU2NvcmUsXG4gIGNvbXBhcmVGMlNjb3JlOiBjb21wYXJlRjJTY29yZSxcbn1cblxuZnVuY3Rpb24gYmxpbmRIZXVyaXN0aWMoLyogYSwgYiAqLykge1xuICAvLyBibGluZCBoZXVyaXN0aWMgbWFrZXMgdGhpcyBzZWFyY2ggZXF1YWwgdG8gcGxhaW4gRGlqa3N0cmEgcGF0aCBzZWFyY2guXG4gIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiBjb25zdGFudERpc3RhbmNlKC8qIGEsIGIgKi8pIHtcbiAgcmV0dXJuIDE7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVGU2NvcmUoYSwgYikge1xuICB2YXIgcmVzdWx0ID0gYS5mU2NvcmUgLSBiLmZTY29yZTtcbiAgLy8gVE9ETzogQ2FuIEkgaW1wcm92ZSBzcGVlZCB3aXRoIHNtYXJ0ZXIgdGllcy1icmVha2luZz9cbiAgLy8gSSB0cmllZCBkaXN0YW5jZVRvU291cmNlLCBidXQgaXQgZGlkbid0IHNlZW0gdG8gaGF2ZSBtdWNoIGVmZmVjdFxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBzZXRIZWFwSW5kZXgobm9kZVNlYXJjaFN0YXRlLCBoZWFwSW5kZXgpIHtcbiAgbm9kZVNlYXJjaFN0YXRlLmhlYXBJbmRleCA9IGhlYXBJbmRleDtcbn1cblxuZnVuY3Rpb24gY29tcGFyZUYxU2NvcmUoYSwgYikge1xuICByZXR1cm4gYS5mMSAtIGIuZjE7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVGMlNjb3JlKGEsIGIpIHtcbiAgcmV0dXJuIGEuZjIgLSBiLmYyO1xufVxuXG5mdW5jdGlvbiBzZXRIMShub2RlLCBoZWFwSW5kZXgpIHtcbiAgbm9kZS5oMSA9IGhlYXBJbmRleDtcbn1cblxuZnVuY3Rpb24gc2V0SDIobm9kZSwgaGVhcEluZGV4KSB7XG4gIG5vZGUuaDIgPSBoZWFwSW5kZXg7XG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGwyOiBsMixcbiAgbDE6IGwxXG59O1xuXG4vKipcbiAqIEV1Y2xpZCBkaXN0YW5jZSAobDIgbm9ybSk7XG4gKiBcbiAqIEBwYXJhbSB7Kn0gYSBcbiAqIEBwYXJhbSB7Kn0gYiBcbiAqL1xuZnVuY3Rpb24gbDIoYSwgYikge1xuICB2YXIgZHggPSBhLnggLSBiLng7XG4gIHZhciBkeSA9IGEueSAtIGIueTtcbiAgcmV0dXJuIE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG59XG5cbi8qKlxuICogTWFuaGF0dGFuIGRpc3RhbmNlIChsMSBub3JtKTtcbiAqIEBwYXJhbSB7Kn0gYSBcbiAqIEBwYXJhbSB7Kn0gYiBcbiAqL1xuZnVuY3Rpb24gbDEoYSwgYikge1xuICB2YXIgZHggPSBhLnggLSBiLng7XG4gIHZhciBkeSA9IGEueSAtIGIueTtcbiAgcmV0dXJuIE1hdGguYWJzKGR4KSArIE1hdGguYWJzKGR5KTtcbn1cbiIsIi8qKlxuICogVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgc2luZ2xlIHNlYXJjaCBub2RlIGluIHRoZSBleHBsb3JhdGlvbiB0cmVlIGZvclxuICogQSogYWxnb3JpdGhtLlxuICogXG4gKiBAcGFyYW0ge09iamVjdH0gbm9kZSAgb3JpZ2luYWwgbm9kZSBpbiB0aGUgZ3JhcGhcbiAqL1xuZnVuY3Rpb24gTm9kZVNlYXJjaFN0YXRlKG5vZGUpIHtcbiAgdGhpcy5ub2RlID0gbm9kZTtcblxuICAvLyBIb3cgd2UgY2FtZSB0byB0aGlzIG5vZGU/XG4gIHRoaXMucGFyZW50ID0gbnVsbDtcblxuICB0aGlzLmNsb3NlZCA9IGZhbHNlO1xuICB0aGlzLm9wZW4gPSAwO1xuXG4gIHRoaXMuZGlzdGFuY2VUb1NvdXJjZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgLy8gdGhlIGYobikgPSBnKG4pICsgaChuKSB2YWx1ZVxuICB0aGlzLmZTY29yZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuICAvLyB1c2VkIHRvIHJlY29uc3RydWN0IGhlYXAgd2hlbiBmU2NvcmUgaXMgdXBkYXRlZC5cbiAgdGhpcy5oZWFwSW5kZXggPSAtMTtcbn07XG5cbmZ1bmN0aW9uIG1ha2VTZWFyY2hTdGF0ZVBvb2woKSB7XG4gIHZhciBjdXJyZW50SW5DYWNoZSA9IDA7XG4gIHZhciBub2RlQ2FjaGUgPSBbXTtcblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZU5ld1N0YXRlOiBjcmVhdGVOZXdTdGF0ZSxcbiAgICByZXNldDogcmVzZXRcbiAgfTtcblxuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBjdXJyZW50SW5DYWNoZSA9IDA7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVOZXdTdGF0ZShub2RlKSB7XG4gICAgdmFyIGNhY2hlZCA9IG5vZGVDYWNoZVtjdXJyZW50SW5DYWNoZV07XG4gICAgaWYgKGNhY2hlZCkge1xuICAgICAgLy8gVE9ETzogVGhpcyBhbG1vc3QgZHVwbGljYXRlcyBjb25zdHJ1Y3RvciBjb2RlLiBOb3Qgc3VyZSBpZlxuICAgICAgLy8gaXQgd291bGQgaW1wYWN0IHBlcmZvcm1hbmNlIGlmIEkgbW92ZSB0aGlzIGNvZGUgaW50byBhIGZ1bmN0aW9uXG4gICAgICBjYWNoZWQubm9kZSA9IG5vZGU7XG4gICAgICAvLyBIb3cgd2UgY2FtZSB0byB0aGlzIG5vZGU/XG4gICAgICBjYWNoZWQucGFyZW50ID0gbnVsbDtcblxuICAgICAgY2FjaGVkLmNsb3NlZCA9IGZhbHNlO1xuICAgICAgY2FjaGVkLm9wZW4gPSAwO1xuXG4gICAgICBjYWNoZWQuZGlzdGFuY2VUb1NvdXJjZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgIC8vIHRoZSBmKG4pID0gZyhuKSArIGgobikgdmFsdWVcbiAgICAgIGNhY2hlZC5mU2NvcmUgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbiAgICAgIC8vIHVzZWQgdG8gcmVjb25zdHJ1Y3QgaGVhcCB3aGVuIGZTY29yZSBpcyB1cGRhdGVkLlxuICAgICAgY2FjaGVkLmhlYXBJbmRleCA9IC0xO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGNhY2hlZCA9IG5ldyBOb2RlU2VhcmNoU3RhdGUobm9kZSk7XG4gICAgICBub2RlQ2FjaGVbY3VycmVudEluQ2FjaGVdID0gY2FjaGVkO1xuICAgIH1cbiAgICBjdXJyZW50SW5DYWNoZSsrO1xuICAgIHJldHVybiBjYWNoZWQ7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gbWFrZVNlYXJjaFN0YXRlUG9vbDsiLCJtb2R1bGUuZXhwb3J0cyA9IG5iYTtcblxudmFyIE5vZGVIZWFwID0gcmVxdWlyZSgnLi4vTm9kZUhlYXAnKTtcbnZhciBoZXVyaXN0aWNzID0gcmVxdWlyZSgnLi4vaGV1cmlzdGljcycpO1xudmFyIGRlZmF1bHRTZXR0aW5ncyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRTZXR0aW5ncy5qcycpO1xudmFyIG1ha2VOQkFTZWFyY2hTdGF0ZVBvb2wgPSByZXF1aXJlKCcuL21ha2VOQkFTZWFyY2hTdGF0ZVBvb2wuanMnKTtcblxudmFyIE5PX1BBVEggPSBkZWZhdWx0U2V0dGluZ3MuTk9fUEFUSDtcblxubW9kdWxlLmV4cG9ydHMubDIgPSBoZXVyaXN0aWNzLmwyO1xubW9kdWxlLmV4cG9ydHMubDEgPSBoZXVyaXN0aWNzLmwxO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgcGF0aGZpbmRlci4gQSBwYXRoZmluZGVyIGhhcyBqdXN0IG9uZSBtZXRob2Q6XG4gKiBgZmluZChmcm9tSWQsIHRvSWQpYC5cbiAqIFxuICogVGhpcyBpcyBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgTkJBKiBhbGdvcml0aG0gZGVzY3JpYmVkIGluIFxuICogXG4gKiAgXCJZZXQgYW5vdGhlciBiaWRpcmVjdGlvbmFsIGFsZ29yaXRobSBmb3Igc2hvcnRlc3QgcGF0aHNcIiBwYXBlciBieSBXaW0gUGlqbHMgYW5kIEhlbmsgUG9zdFxuICogXG4gKiBUaGUgcGFwZXIgaXMgYXZhaWxhYmxlIGhlcmU6IGh0dHBzOi8vcmVwdWIuZXVyLm5sL3B1Yi8xNjEwMC9laTIwMDktMTAucGRmXG4gKiBcbiAqIEBwYXJhbSB7bmdyYXBoLmdyYXBofSBncmFwaCBpbnN0YW5jZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnZha2EvbmdyYXBoLmdyYXBoXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyB0aGF0IGNvbmZpZ3VyZXMgc2VhcmNoXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKGEsIGIpfSBvcHRpb25zLmhldXJpc3RpYyAtIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGVzdGltYXRlZCBkaXN0YW5jZSBiZXR3ZWVuXG4gKiBub2RlcyBgYWAgYW5kIGBiYC4gVGhpcyBmdW5jdGlvbiBzaG91bGQgbmV2ZXIgb3ZlcmVzdGltYXRlIGFjdHVhbCBkaXN0YW5jZSBiZXR3ZWVuIHR3b1xuICogbm9kZXMgKG90aGVyd2lzZSB0aGUgZm91bmQgcGF0aCB3aWxsIG5vdCBiZSB0aGUgc2hvcnRlc3QpLiBEZWZhdWx0cyBmdW5jdGlvbiByZXR1cm5zIDAsXG4gKiB3aGljaCBtYWtlcyB0aGlzIHNlYXJjaCBlcXVpdmFsZW50IHRvIERpamtzdHJhIHNlYXJjaC5cbiAqIEBwYXJhbSB7RnVuY3Rpb24oYSwgYil9IG9wdGlvbnMuZGlzdGFuY2UgLSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhY3R1YWwgZGlzdGFuY2UgYmV0d2VlbiB0d29cbiAqIG5vZGVzIGBhYCBhbmQgYGJgLiBCeSBkZWZhdWx0IHRoaXMgaXMgc2V0IHRvIHJldHVybiBncmFwaC10aGVvcmV0aWNhbCBkaXN0YW5jZSAoYWx3YXlzIDEpO1xuICogXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBIHBhdGhmaW5kZXIgd2l0aCBzaW5nbGUgbWV0aG9kIGBmaW5kKClgLlxuICovXG5mdW5jdGlvbiBuYmEoZ3JhcGgsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIC8vIHdoZXRoZXIgdHJhdmVyc2FsIHNob3VsZCBiZSBjb25zaWRlcmVkIG92ZXIgb3JpZW50ZWQgZ3JhcGguXG4gIHZhciBvcmllbnRlZCA9IG9wdGlvbnMub3JpZW50ZWQ7XG4gIHZhciBxdWl0RmFzdCA9IG9wdGlvbnMucXVpdEZhc3Q7XG5cbiAgdmFyIGhldXJpc3RpYyA9IG9wdGlvbnMuaGV1cmlzdGljO1xuICBpZiAoIWhldXJpc3RpYykgaGV1cmlzdGljID0gZGVmYXVsdFNldHRpbmdzLmhldXJpc3RpYztcblxuICB2YXIgZGlzdGFuY2UgPSBvcHRpb25zLmRpc3RhbmNlO1xuICBpZiAoIWRpc3RhbmNlKSBkaXN0YW5jZSA9IGRlZmF1bHRTZXR0aW5ncy5kaXN0YW5jZTtcblxuICAvLyBEdXJpbmcgc3RyZXNzIHRlc3RzIEkgbm90aWNlZCB0aGF0IGdhcmJhZ2UgY29sbGVjdGlvbiB3YXMgb25lIG9mIHRoZSBoZWF2aWVzdFxuICAvLyBjb250cmlidXRvcnMgdG8gdGhlIGFsZ29yaXRobSdzIHNwZWVkLiBTbyBJJ20gdXNpbmcgYW4gb2JqZWN0IHBvb2wgdG8gcmVjeWNsZSBub2Rlcy5cbiAgdmFyIHBvb2wgPSBtYWtlTkJBU2VhcmNoU3RhdGVQb29sKCk7XG5cbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBGaW5kcyBhIHBhdGggYmV0d2VlbiBub2RlIGBmcm9tSWRgIGFuZCBgdG9JZGAuXG4gICAgICogQHJldHVybnMge0FycmF5fSBvZiBub2RlcyBiZXR3ZWVuIGB0b0lkYCBhbmQgYGZyb21JZGAuIEVtcHR5IGFycmF5IGlzIHJldHVybmVkXG4gICAgICogaWYgbm8gcGF0aCBpcyBmb3VuZC5cbiAgICAgKi9cbiAgICBmaW5kOiBmaW5kXG4gIH07XG5cbiAgZnVuY3Rpb24gZmluZChmcm9tSWQsIHRvSWQpIHtcbiAgICAvLyBJIG11c3QgYXBvbG9naXplIGZvciB0aGUgY29kZSBkdXBsaWNhdGlvbi4gVGhpcyB3YXMgdGhlIGVhc2llc3Qgd2F5IGZvciBtZSB0b1xuICAgIC8vIGltcGxlbWVudCB0aGUgYWxnb3JpdGhtIGZhc3QuXG4gICAgdmFyIGZyb20gPSBncmFwaC5nZXROb2RlKGZyb21JZCk7XG4gICAgaWYgKCFmcm9tKSB0aHJvdyBuZXcgRXJyb3IoJ2Zyb21JZCBpcyBub3QgZGVmaW5lZCBpbiB0aGlzIGdyYXBoOiAnICsgZnJvbUlkKTtcbiAgICB2YXIgdG8gPSBncmFwaC5nZXROb2RlKHRvSWQpO1xuICAgIGlmICghdG8pIHRocm93IG5ldyBFcnJvcigndG9JZCBpcyBub3QgZGVmaW5lZCBpbiB0aGlzIGdyYXBoOiAnICsgdG9JZCk7XG5cbiAgICBwb29sLnJlc2V0KCk7XG5cbiAgICAvLyBJIG11c3QgYWxzbyBhcG9sb2dpemUgZm9yIHNvbWV3aGF0IGNyeXB0aWMgbmFtZXMuIFRoZSBOQkEqIGlzIGJpLWRpcmVjdGlvbmFsXG4gICAgLy8gc2VhcmNoIGFsZ29yaXRobSwgd2hpY2ggbWVhbnMgaXQgcnVucyB0d28gc2VhcmNoZXMgaW4gcGFyYWxsZWwuIE9uZSBydW5zXG4gICAgLy8gZnJvbSBzb3VyY2Ugbm9kZSB0byB0YXJnZXQsIHdoaWxlIHRoZSBvdGhlciBvbmUgcnVucyBmcm9tIHRhcmdldCB0byBzb3VyY2UuXG4gICAgLy8gRXZlcnl3aGVyZSB3aGVyZSB5b3Ugc2VlIGAxYCBpdCBtZWFucyBpdCdzIGZvciB0aGUgZm9yd2FyZCBzZWFyY2guIGAyYCBpcyBmb3IgXG4gICAgLy8gYmFja3dhcmQgc2VhcmNoLlxuXG4gICAgLy8gRm9yIG9yaWVudGVkIGdyYXBoIHBhdGggZmluZGluZywgd2UgbmVlZCB0byByZXZlcnNlIHRoZSBncmFwaCwgc28gdGhhdFxuICAgIC8vIGJhY2t3YXJkIHNlYXJjaCB2aXNpdHMgY29ycmVjdCBsaW5rLiBPYnZpb3VzbHkgd2UgZG9uJ3Qgd2FudCB0byBkdXBsaWNhdGVcbiAgICAvLyB0aGUgZ3JhcGgsIGluc3RlYWQgd2UgYWx3YXlzIHRyYXZlcnNlIHRoZSBncmFwaCBhcyBub24tb3JpZW50ZWQsIGFuZCBmaWx0ZXJcbiAgICAvLyBlZGdlcyBpbiBgdmlzaXROMU9yaWVudGVkL3Zpc2l0TjJPcml0ZW50ZWRgXG4gICAgdmFyIGZvcndhcmRWaXNpdG9yID0gb3JpZW50ZWQgPyB2aXNpdE4xT3JpZW50ZWQgOiB2aXNpdE4xO1xuICAgIHZhciByZXZlcnNlVmlzaXRvciA9IG9yaWVudGVkID8gdmlzaXROMk9yaWVudGVkIDogdmlzaXROMjtcblxuICAgIC8vIE1hcHMgbm9kZUlkIHRvIE5CQVNlYXJjaFN0YXRlLlxuICAgIHZhciBub2RlU3RhdGUgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBUaGVzZSB0d28gaGVhcHMgc3RvcmUgbm9kZXMgYnkgdGhlaXIgdW5kZXJlc3RpbWF0ZWQgdmFsdWVzLlxuICAgIHZhciBvcGVuMVNldCA9IG5ldyBOb2RlSGVhcCh7XG4gICAgICBjb21wYXJlOiBkZWZhdWx0U2V0dGluZ3MuY29tcGFyZUYxU2NvcmUsXG4gICAgICBzZXROb2RlSWQ6IGRlZmF1bHRTZXR0aW5ncy5zZXRIMVxuICAgIH0pO1xuICAgIHZhciBvcGVuMlNldCA9IG5ldyBOb2RlSGVhcCh7XG4gICAgICBjb21wYXJlOiBkZWZhdWx0U2V0dGluZ3MuY29tcGFyZUYyU2NvcmUsXG4gICAgICBzZXROb2RlSWQ6IGRlZmF1bHRTZXR0aW5ncy5zZXRIMlxuICAgIH0pO1xuXG4gICAgLy8gVGhpcyBpcyB3aGVyZSBib3RoIHNlYXJjaGVzIHdpbGwgbWVldC5cbiAgICB2YXIgbWluTm9kZTtcblxuICAgIC8vIFRoZSBzbWFsbGVzdCBwYXRoIGxlbmd0aCBzZWVuIHNvIGZhciBpcyBzdG9yZWQgaGVyZTpcbiAgICB2YXIgbE1pbiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuICAgIC8vIFdlIHN0YXJ0IGJ5IHB1dHRpbmcgc3RhcnQvZW5kIG5vZGVzIHRvIHRoZSBjb3JyZXNwb25kaW5nIGhlYXBzXG4gICAgdmFyIHN0YXJ0Tm9kZSA9IHBvb2wuY3JlYXRlTmV3U3RhdGUoZnJvbSk7XG4gICAgbm9kZVN0YXRlLnNldChmcm9tSWQsIHN0YXJ0Tm9kZSk7IFxuICAgIHN0YXJ0Tm9kZS5nMSA9IDA7XG4gICAgdmFyIGYxID0gaGV1cmlzdGljKGZyb20sIHRvKTtcbiAgICBzdGFydE5vZGUuZjEgPSBmMTtcbiAgICBvcGVuMVNldC5wdXNoKHN0YXJ0Tm9kZSk7XG5cbiAgICB2YXIgZW5kTm9kZSA9IHBvb2wuY3JlYXRlTmV3U3RhdGUodG8pO1xuICAgIG5vZGVTdGF0ZS5zZXQodG9JZCwgZW5kTm9kZSk7XG4gICAgZW5kTm9kZS5nMiA9IDA7XG4gICAgdmFyIGYyID0gZjE7IC8vIHRoZXkgc2hvdWxkIGFncmVlIG9yaWdpbmFsbHlcbiAgICBlbmROb2RlLmYyID0gZjI7XG4gICAgb3BlbjJTZXQucHVzaChlbmROb2RlKVxuXG4gICAgLy8gdGhlIGBjYW1lRnJvbWAgdmFyaWFibGUgaXMgYWNjZXNzZWQgYnkgYm90aCBzZWFyY2hlcywgc28gdGhhdCB3ZSBjYW4gc3RvcmUgcGFyZW50cy5cbiAgICB2YXIgY2FtZUZyb207XG5cbiAgICAvLyB0aGlzIGlzIHRoZSBtYWluIGFsZ29yaXRobSBsb29wOlxuICAgIHdoaWxlIChvcGVuMlNldC5sZW5ndGggJiYgb3BlbjFTZXQubGVuZ3RoKSB7XG4gICAgICBpZiAob3BlbjFTZXQubGVuZ3RoIDwgb3BlbjJTZXQubGVuZ3RoKSB7XG4gICAgICAgIGZvcndhcmRTZWFyY2goKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldmVyc2VTZWFyY2goKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHF1aXRGYXN0ICYmIG1pbk5vZGUpIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGdvdCBoZXJlLCB0aGVuIHRoZXJlIGlzIG5vIHBhdGguXG4gICAgdmFyIHBhdGggPSByZWNvbnN0cnVjdFBhdGgobWluTm9kZSk7XG4gICAgcmV0dXJuIHBhdGg7IC8vIHRoZSBwdWJsaWMgQVBJIGlzIG92ZXJcblxuICAgIGZ1bmN0aW9uIGZvcndhcmRTZWFyY2goKSB7XG4gICAgICBjYW1lRnJvbSA9IG9wZW4xU2V0LnBvcCgpO1xuICAgICAgaWYgKGNhbWVGcm9tLmNsb3NlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNhbWVGcm9tLmNsb3NlZCA9IHRydWU7XG5cbiAgICAgIGlmIChjYW1lRnJvbS5mMSA8IGxNaW4gJiYgKGNhbWVGcm9tLmcxICsgZjIgLSBoZXVyaXN0aWMoZnJvbSwgY2FtZUZyb20ubm9kZSkpIDwgbE1pbikge1xuICAgICAgICBncmFwaC5mb3JFYWNoTGlua2VkTm9kZShjYW1lRnJvbS5ub2RlLmlkLCBmb3J3YXJkVmlzaXRvcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcGVuMVNldC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGYxID0gb3BlbjFTZXQucGVlaygpLmYxO1xuICAgICAgfSBcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXZlcnNlU2VhcmNoKCkge1xuICAgICAgY2FtZUZyb20gPSBvcGVuMlNldC5wb3AoKTtcbiAgICAgIGlmIChjYW1lRnJvbS5jbG9zZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY2FtZUZyb20uY2xvc2VkID0gdHJ1ZTtcblxuICAgICAgaWYgKGNhbWVGcm9tLmYyIDwgbE1pbiAmJiAoY2FtZUZyb20uZzIgKyBmMSAtIGhldXJpc3RpYyhjYW1lRnJvbS5ub2RlLCB0bykpIDwgbE1pbikge1xuICAgICAgICBncmFwaC5mb3JFYWNoTGlua2VkTm9kZShjYW1lRnJvbS5ub2RlLmlkLCByZXZlcnNlVmlzaXRvcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcGVuMlNldC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGYyID0gb3BlbjJTZXQucGVlaygpLmYyO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZpc2l0TjEob3RoZXJOb2RlLCBsaW5rKSB7XG4gICAgICB2YXIgb3RoZXJTZWFyY2hTdGF0ZSA9IG5vZGVTdGF0ZS5nZXQob3RoZXJOb2RlLmlkKTtcbiAgICAgIGlmICghb3RoZXJTZWFyY2hTdGF0ZSkge1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlID0gcG9vbC5jcmVhdGVOZXdTdGF0ZShvdGhlck5vZGUpO1xuICAgICAgICBub2RlU3RhdGUuc2V0KG90aGVyTm9kZS5pZCwgb3RoZXJTZWFyY2hTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvdGhlclNlYXJjaFN0YXRlLmNsb3NlZCkgcmV0dXJuO1xuXG4gICAgICB2YXIgdGVudGF0aXZlRGlzdGFuY2UgPSBjYW1lRnJvbS5nMSArIGRpc3RhbmNlKGNhbWVGcm9tLm5vZGUsIG90aGVyTm9kZSwgbGluayk7XG5cbiAgICAgIGlmICh0ZW50YXRpdmVEaXN0YW5jZSA8IG90aGVyU2VhcmNoU3RhdGUuZzEpIHtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5nMSA9IHRlbnRhdGl2ZURpc3RhbmNlO1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlLmYxID0gdGVudGF0aXZlRGlzdGFuY2UgKyBoZXVyaXN0aWMob3RoZXJTZWFyY2hTdGF0ZS5ub2RlLCB0byk7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUucDEgPSBjYW1lRnJvbTtcbiAgICAgICAgaWYgKG90aGVyU2VhcmNoU3RhdGUuaDEgPCAwKSB7XG4gICAgICAgICAgb3BlbjFTZXQucHVzaChvdGhlclNlYXJjaFN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvcGVuMVNldC51cGRhdGVJdGVtKG90aGVyU2VhcmNoU3RhdGUuaDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgcG90ZW50aWFsTWluID0gb3RoZXJTZWFyY2hTdGF0ZS5nMSArIG90aGVyU2VhcmNoU3RhdGUuZzI7XG4gICAgICBpZiAocG90ZW50aWFsTWluIDwgbE1pbikgeyBcbiAgICAgICAgbE1pbiA9IHBvdGVudGlhbE1pbjtcbiAgICAgICAgbWluTm9kZSA9IG90aGVyU2VhcmNoU3RhdGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmlzaXROMihvdGhlck5vZGUsIGxpbmspIHtcbiAgICAgIHZhciBvdGhlclNlYXJjaFN0YXRlID0gbm9kZVN0YXRlLmdldChvdGhlck5vZGUuaWQpO1xuICAgICAgaWYgKCFvdGhlclNlYXJjaFN0YXRlKSB7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUgPSBwb29sLmNyZWF0ZU5ld1N0YXRlKG90aGVyTm9kZSk7XG4gICAgICAgIG5vZGVTdGF0ZS5zZXQob3RoZXJOb2RlLmlkLCBvdGhlclNlYXJjaFN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG90aGVyU2VhcmNoU3RhdGUuY2xvc2VkKSByZXR1cm47XG5cbiAgICAgIHZhciB0ZW50YXRpdmVEaXN0YW5jZSA9IGNhbWVGcm9tLmcyICsgZGlzdGFuY2UoY2FtZUZyb20ubm9kZSwgb3RoZXJOb2RlLCBsaW5rKTtcblxuICAgICAgaWYgKHRlbnRhdGl2ZURpc3RhbmNlIDwgb3RoZXJTZWFyY2hTdGF0ZS5nMikge1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlLmcyID0gdGVudGF0aXZlRGlzdGFuY2U7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUuZjIgPSB0ZW50YXRpdmVEaXN0YW5jZSArIGhldXJpc3RpYyhmcm9tLCBvdGhlclNlYXJjaFN0YXRlLm5vZGUpO1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlLnAyID0gY2FtZUZyb207XG4gICAgICAgIGlmIChvdGhlclNlYXJjaFN0YXRlLmgyIDwgMCkge1xuICAgICAgICAgIG9wZW4yU2V0LnB1c2gob3RoZXJTZWFyY2hTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3BlbjJTZXQudXBkYXRlSXRlbShvdGhlclNlYXJjaFN0YXRlLmgyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHBvdGVudGlhbE1pbiA9IG90aGVyU2VhcmNoU3RhdGUuZzEgKyBvdGhlclNlYXJjaFN0YXRlLmcyO1xuICAgICAgaWYgKHBvdGVudGlhbE1pbiA8IGxNaW4pIHtcbiAgICAgICAgbE1pbiA9IHBvdGVudGlhbE1pbjtcbiAgICAgICAgbWluTm9kZSA9IG90aGVyU2VhcmNoU3RhdGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmlzaXROMk9yaWVudGVkKG90aGVyTm9kZSwgbGluaykge1xuICAgICAgLy8gd2UgYXJlIGdvaW5nIGJhY2t3YXJkcywgZ3JhcGggbmVlZHMgdG8gYmUgcmV2ZXJzZWQuIFxuICAgICAgaWYgKGxpbmsudG9JZCA9PT0gY2FtZUZyb20ubm9kZS5pZCkgcmV0dXJuIHZpc2l0TjIob3RoZXJOb2RlLCBsaW5rKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdmlzaXROMU9yaWVudGVkKG90aGVyTm9kZSwgbGluaykge1xuICAgICAgLy8gdGhpcyBpcyBmb3J3YXJkIGRpcmVjdGlvbiwgc28gd2Ugc2hvdWxkIGJlIGNvbWluZyBGUk9NOlxuICAgICAgaWYgKGxpbmsuZnJvbUlkID09PSBjYW1lRnJvbS5ub2RlLmlkKSByZXR1cm4gdmlzaXROMShvdGhlck5vZGUsIGxpbmspO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZWNvbnN0cnVjdFBhdGgoc2VhcmNoU3RhdGUpIHtcbiAgaWYgKCFzZWFyY2hTdGF0ZSkgcmV0dXJuIE5PX1BBVEg7XG5cbiAgdmFyIHBhdGggPSBbc2VhcmNoU3RhdGUubm9kZV07XG4gIHZhciBwYXJlbnQgPSBzZWFyY2hTdGF0ZS5wMTtcblxuICB3aGlsZSAocGFyZW50KSB7XG4gICAgcGF0aC5wdXNoKHBhcmVudC5ub2RlKTtcbiAgICBwYXJlbnQgPSBwYXJlbnQucDE7XG4gIH1cblxuICB2YXIgY2hpbGQgPSBzZWFyY2hTdGF0ZS5wMjtcblxuICB3aGlsZSAoY2hpbGQpIHtcbiAgICBwYXRoLnVuc2hpZnQoY2hpbGQubm9kZSk7XG4gICAgY2hpbGQgPSBjaGlsZC5wMjtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gbWFrZU5CQVNlYXJjaFN0YXRlUG9vbDtcblxuLyoqXG4gKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBOQkFTZWFyY2hTdGF0ZS4gVGhlIGluc3RhbmNlIHN0b3JlcyBpbmZvcm1hdGlvblxuICogYWJvdXQgc2VhcmNoIHN0YXRlLCBhbmQgaXMgdXNlZCBieSBOQkEqIGFsZ29yaXRobS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbm9kZSAtIG9yaWdpbmFsIGdyYXBoIG5vZGVcbiAqL1xuZnVuY3Rpb24gTkJBU2VhcmNoU3RhdGUobm9kZSkge1xuICAvKipcbiAgICogT3JpZ2luYWwgZ3JhcGggbm9kZS5cbiAgICovXG4gIHRoaXMubm9kZSA9IG5vZGU7XG5cbiAgLyoqXG4gICAqIFBhcmVudCBvZiB0aGlzIG5vZGUgaW4gZm9yd2FyZCBzZWFyY2hcbiAgICovXG4gIHRoaXMucDEgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBQYXJlbnQgb2YgdGhpcyBub2RlIGluIHJldmVyc2Ugc2VhcmNoXG4gICAqL1xuICB0aGlzLnAyID0gbnVsbDtcblxuICAvKipcbiAgICogSWYgdGhpcyBpcyBzZXQgdG8gdHJ1ZSwgdGhlbiB0aGUgbm9kZSB3YXMgYWxyZWFkeSBwcm9jZXNzZWRcbiAgICogYW5kIHdlIHNob3VsZCBub3QgdG91Y2ggaXQgYW55bW9yZS5cbiAgICovXG4gIHRoaXMuY2xvc2VkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEFjdHVhbCBkaXN0YW5jZSBmcm9tIHRoaXMgbm9kZSB0byBpdHMgcGFyZW50IGluIGZvcndhcmQgc2VhcmNoXG4gICAqL1xuICB0aGlzLmcxID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gIC8qKlxuICAgKiBBY3R1YWwgZGlzdGFuY2UgZnJvbSB0aGlzIG5vZGUgdG8gaXRzIHBhcmVudCBpbiByZXZlcnNlIHNlYXJjaFxuICAgKi9cbiAgdGhpcy5nMiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuXG4gIC8qKlxuICAgKiBVbmRlcmVzdGltYXRlZCBkaXN0YW5jZSBmcm9tIHRoaXMgbm9kZSB0byB0aGUgcGF0aC1maW5kaW5nIHNvdXJjZS5cbiAgICovXG4gIHRoaXMuZjEgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbiAgLyoqXG4gICAqIFVuZGVyZXN0aW1hdGVkIGRpc3RhbmNlIGZyb20gdGhpcyBub2RlIHRvIHRoZSBwYXRoLWZpbmRpbmcgdGFyZ2V0LlxuICAgKi9cbiAgdGhpcy5mMiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuICAvLyB1c2VkIHRvIHJlY29uc3RydWN0IGhlYXAgd2hlbiBmU2NvcmUgaXMgdXBkYXRlZC4gVE9ETzogZG8gSSBuZWVkIHRoZW0gYm90aD9cblxuICAvKipcbiAgICogSW5kZXggb2YgdGhpcyBub2RlIGluIHRoZSBmb3J3YXJkIGhlYXAuXG4gICAqL1xuICB0aGlzLmgxID0gLTE7XG5cbiAgLyoqXG4gICAqIEluZGV4IG9mIHRoaXMgbm9kZSBpbiB0aGUgcmV2ZXJzZSBoZWFwLlxuICAgKi9cbiAgdGhpcy5oMiA9IC0xO1xufVxuXG4vKipcbiAqIEFzIHBhdGgtZmluZGluZyBpcyBtZW1vcnktaW50ZW5zaXZlIHByb2Nlc3MsIHdlIHdhbnQgdG8gcmVkdWNlIHByZXNzdXJlIG9uXG4gKiBnYXJiYWdlIGNvbGxlY3Rvci4gVGhpcyBjbGFzcyBoZWxwcyB1cyB0byByZWN5Y2xlIHBhdGgtZmluZGluZyBub2RlcyBhbmQgc2lnbmlmaWNhbnRseVxuICogcmVkdWNlcyB0aGUgc2VhcmNoIHRpbWUgKH4yMCUgZmFzdGVyIHRoYW4gd2l0aG91dCBpdCkuXG4gKi9cbmZ1bmN0aW9uIG1ha2VOQkFTZWFyY2hTdGF0ZVBvb2woKSB7XG4gIHZhciBjdXJyZW50SW5DYWNoZSA9IDA7XG4gIHZhciBub2RlQ2FjaGUgPSBbXTtcblxuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTkJBU2VhcmNoU3RhdGUgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjcmVhdGVOZXdTdGF0ZTogY3JlYXRlTmV3U3RhdGUsXG5cbiAgICAvKipcbiAgICAgKiBNYXJrcyBhbGwgY3JlYXRlZCBpbnN0YW5jZXMgYXZhaWxhYmxlIGZvciByZWN5Y2xpbmcuXG4gICAgICovXG4gICAgcmVzZXQ6IHJlc2V0XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgY3VycmVudEluQ2FjaGUgPSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlTmV3U3RhdGUobm9kZSkge1xuICAgIHZhciBjYWNoZWQgPSBub2RlQ2FjaGVbY3VycmVudEluQ2FjaGVdO1xuICAgIGlmIChjYWNoZWQpIHtcbiAgICAgIC8vIFRPRE86IFRoaXMgYWxtb3N0IGR1cGxpY2F0ZXMgY29uc3RydWN0b3IgY29kZS4gTm90IHN1cmUgaWZcbiAgICAgIC8vIGl0IHdvdWxkIGltcGFjdCBwZXJmb3JtYW5jZSBpZiBJIG1vdmUgdGhpcyBjb2RlIGludG8gYSBmdW5jdGlvblxuICAgICAgY2FjaGVkLm5vZGUgPSBub2RlO1xuXG4gICAgICAvLyBIb3cgd2UgY2FtZSB0byB0aGlzIG5vZGU/XG4gICAgICBjYWNoZWQucDEgPSBudWxsO1xuICAgICAgY2FjaGVkLnAyID0gbnVsbDtcblxuICAgICAgY2FjaGVkLmNsb3NlZCA9IGZhbHNlO1xuXG4gICAgICBjYWNoZWQuZzEgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgICBjYWNoZWQuZzIgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgICBjYWNoZWQuZjEgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgICBjYWNoZWQuZjIgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbiAgICAgIC8vIHVzZWQgdG8gcmVjb25zdHJ1Y3QgaGVhcCB3aGVuIGZTY29yZSBpcyB1cGRhdGVkLlxuICAgICAgY2FjaGVkLmgxID0gLTE7XG4gICAgICBjYWNoZWQuaDIgPSAtMTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FjaGVkID0gbmV3IE5CQVNlYXJjaFN0YXRlKG5vZGUpO1xuICAgICAgbm9kZUNhY2hlW2N1cnJlbnRJbkNhY2hlXSA9IGNhY2hlZDtcbiAgICB9XG4gICAgY3VycmVudEluQ2FjaGUrKztcbiAgICByZXR1cm4gY2FjaGVkO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYVN0YXI6IHJlcXVpcmUoJy4vYS1zdGFyL2Etc3Rhci5qcycpLFxuICBhR3JlZWR5OiByZXF1aXJlKCcuL2Etc3Rhci9hLWdyZWVkeS1zdGFyJyksXG4gIG5iYTogcmVxdWlyZSgnLi9hLXN0YXIvbmJhL2luZGV4LmpzJyksXG59XG4iLCJpbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi9saWIvQXBwbGljYXRpb24nXG5pbXBvcnQgTG9hZGluZ1NjZW5lIGZyb20gJy4vc2NlbmVzL0xvYWRpbmdTY2VuZSdcblxuLy8gQ3JlYXRlIGEgUGl4aSBBcHBsaWNhdGlvblxubGV0IGFwcCA9IG5ldyBBcHBsaWNhdGlvbih7XG4gIHdpZHRoOiAyNTYsXG4gIGhlaWdodDogMjU2LFxuICByb3VuZFBpeGVsczogdHJ1ZSxcbiAgYXV0b1Jlc2l6ZTogdHJ1ZSxcbiAgcmVzb2x1dGlvbjogMSxcbiAgYXV0b1N0YXJ0OiBmYWxzZVxufSlcblxuYXBwLnJlbmRlcmVyLnZpZXcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5hcHAucmVuZGVyZXIudmlldy5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuYXBwLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXG4vLyBBZGQgdGhlIGNhbnZhcyB0aGF0IFBpeGkgYXV0b21hdGljYWxseSBjcmVhdGVkIGZvciB5b3UgdG8gdGhlIEhUTUwgZG9jdW1lbnRcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpXG5cbmFwcC5jaGFuZ2VTdGFnZSgpXG5hcHAuc3RhcnQoKVxuYXBwLmNoYW5nZVNjZW5lKExvYWRpbmdTY2VuZSlcbiIsImV4cG9ydCBjb25zdCBJU19NT0JJTEUgPSAoKGEpID0+IC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm8vaS50ZXN0KGEpIHx8XG4gIC8xMjA3fDYzMTB8NjU5MHwzZ3NvfDR0aHB8NTBbMS02XWl8Nzcwc3w4MDJzfGEgd2F8YWJhY3xhYyhlcnxvb3xzLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3LShufHUpfGM1NVxcL3xjYXBpfGNjd2F8Y2RtLXxjZWxsfGNodG18Y2xkY3xjbWQtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjLXN8ZGV2aXxkaWNhfGRtb2J8ZG8oY3xwKW98ZHMoMTJ8LWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseSgtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmLTV8Zy1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkLShtfHB8dCl8aGVpLXxoaShwdHx0YSl8aHAoIGl8aXApfGhzLWN8aHQoYygtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aS0oMjB8Z298bWEpfGkyMzB8aWFjKCB8LXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHwtW2Etd10pfGxpYnd8bHlueHxtMS13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bS1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dCgtfCB8b3x2KXx6eil8bXQoNTB8cDF8diApfG13YnB8bXl3YXxuMTBbMC0yXXxuMjBbMi0zXXxuMzAoMHwyKXxuNTAoMHwyfDUpfG43KDAoMHwxKXwxMCl8bmUoKGN8bSktfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3wtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuLTJ8cG8oY2t8cnR8c2UpfHByb3h8cHNpb3xwdC1nfHFhLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8LVsyLTddfGktKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aC18b298cC0pfHNka1xcL3xzZShjKC18MHwxKXw0N3xtY3xuZHxyaSl8c2doLXxzaGFyfHNpZSgtfG0pfHNrLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aC18di18diApfHN5KDAxfG1iKXx0MigxOHw1MCl8dDYoMDB8MTB8MTgpfHRhKGd0fGxrKXx0Y2wtfHRkZy18dGVsKGl8bSl8dGltLXx0LW1vfHRvKHBsfHNoKXx0cyg3MHxtLXxtM3xtNSl8dHgtOXx1cChcXC5ifGcxfHNpKXx1dHN0fHY0MDB8djc1MHx2ZXJpfHZpKHJnfHRlKXx2ayg0MHw1WzAtM118LXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhcy18eW91cnx6ZXRvfHp0ZS0vaS50ZXN0KGEuc3Vic3RyKDAsIDQpKVxuKShuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgd2luZG93Lm9wZXJhKVxuXG5leHBvcnQgY29uc3QgQ0VJTF9TSVpFID0gMzJcblxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfTU9WRSA9IFN5bWJvbCgnbW92ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9DQU1FUkEgPSBTeW1ib2woJ2NhbWVyYScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9PUEVSQVRFID0gU3ltYm9sKCdvcGVyYXRlJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0tFWV9NT1ZFID0gU3ltYm9sKCdrZXktbW92ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9IRUFMVEggPSBTeW1ib2woJ2hlYWx0aCcpXG5leHBvcnQgY29uc3QgQUJJTElUWV9DQVJSWSA9IFN5bWJvbCgnY2FycnknKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfTEVBUk4gPSBTeW1ib2woJ2xlYXJuJylcbmV4cG9ydCBjb25zdCBBQklMSVRZX1BMQUNFID0gU3ltYm9sKCdwbGFjZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9LRVlfUExBQ0UgPSBTeW1ib2woJ2tleS1wbGFjZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9LRVlfRklSRSA9IFN5bWJvbCgnZmlyZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9ST1RBVEUgPSBTeW1ib2woJ3JvdGF0ZScpXG5leHBvcnQgY29uc3QgQUJJTElUSUVTX0FMTCA9IFtcbiAgQUJJTElUWV9NT1ZFLFxuICBBQklMSVRZX0NBTUVSQSxcbiAgQUJJTElUWV9PUEVSQVRFLFxuICBBQklMSVRZX0tFWV9NT1ZFLFxuICBBQklMSVRZX0hFQUxUSCxcbiAgQUJJTElUWV9DQVJSWSxcbiAgQUJJTElUWV9MRUFSTixcbiAgQUJJTElUWV9QTEFDRSxcbiAgQUJJTElUWV9LRVlfUExBQ0UsXG4gIEFCSUxJVFlfS0VZX0ZJUkUsXG4gIEFCSUxJVFlfUk9UQVRFXG5dXG5cbi8vIG9iamVjdCB0eXBlLCBzdGF0aWMgb2JqZWN0LCBub3QgY29sbGlkZSB3aXRoXG5leHBvcnQgY29uc3QgU1RBVElDID0gJ3N0YXRpYydcbi8vIGNvbGxpZGUgd2l0aFxuZXhwb3J0IGNvbnN0IFNUQVkgPSAnc3RheSdcbi8vIHRvdWNoIHdpbGwgcmVwbHlcbmV4cG9ydCBjb25zdCBSRVBMWSA9ICdyZXBseSdcbiIsImV4cG9ydCBjb25zdCBMRUZUID0gJ2EnXG5leHBvcnQgY29uc3QgVVAgPSAndydcbmV4cG9ydCBjb25zdCBSSUdIVCA9ICdkJ1xuZXhwb3J0IGNvbnN0IERPV04gPSAncydcbmV4cG9ydCBjb25zdCBQTEFDRTEgPSAnMSdcbmV4cG9ydCBjb25zdCBQTEFDRTIgPSAnMidcbmV4cG9ydCBjb25zdCBQTEFDRTMgPSAnMydcbmV4cG9ydCBjb25zdCBQTEFDRTQgPSAnNCdcbmV4cG9ydCBjb25zdCBGSVJFID0gJ2YnXG4iLCJpbXBvcnQgeyBBcHBsaWNhdGlvbiBhcyBQaXhpQXBwbGljYXRpb24sIEdyYXBoaWNzLCBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuL2dsb2JhbEV2ZW50TWFuYWdlcidcblxubGV0IGFwcFxuXG5jbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIFBpeGlBcHBsaWNhdGlvbiB7XG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncylcbiAgICBhcHAgPSB0aGlzXG4gIH1cblxuICAvLyBvbmx5IG9uZSBpbnN0YW5jZSBmb3Igbm93XG4gIHN0YXRpYyBnZXRBcHAgKCkge1xuICAgIHJldHVybiBhcHBcbiAgfVxuXG4gIGNoYW5nZVN0YWdlICgpIHtcbiAgICB0aGlzLnN0YWdlID0gbmV3IGRpc3BsYXkuU3RhZ2UoKVxuICB9XG5cbiAgY2hhbmdlU2NlbmUgKFNjZW5lTmFtZSwgcGFyYW1zKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFNjZW5lKSB7XG4gICAgICAvLyBtYXliZSB1c2UgcHJvbWlzZSBmb3IgYW5pbWF0aW9uXG4gICAgICAvLyByZW1vdmUgZ2FtZWxvb3A/XG4gICAgICB0aGlzLmN1cnJlbnRTY2VuZS5kZXN0cm95KClcbiAgICAgIHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQodGhpcy5jdXJyZW50U2NlbmUpXG4gICAgfVxuXG4gICAgbGV0IHNjZW5lID0gbmV3IFNjZW5lTmFtZShwYXJhbXMpXG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChzY2VuZSlcbiAgICBzY2VuZS5jcmVhdGUoKVxuICAgIHNjZW5lLm9uKCdjaGFuZ2VTY2VuZScsIHRoaXMuY2hhbmdlU2NlbmUuYmluZCh0aGlzKSlcblxuICAgIHRoaXMuY3VycmVudFNjZW5lID0gc2NlbmVcbiAgfVxuXG4gIHN0YXJ0ICguLi5hcmdzKSB7XG4gICAgc3VwZXIuc3RhcnQoLi4uYXJncylcblxuICAgIC8vIGNyZWF0ZSBhIGJhY2tncm91bmQgbWFrZSBzdGFnZSBoYXMgd2lkdGggJiBoZWlnaHRcbiAgICBsZXQgdmlldyA9IHRoaXMucmVuZGVyZXIudmlld1xuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoXG4gICAgICBuZXcgR3JhcGhpY3MoKS5kcmF3UmVjdCgwLCAwLCB2aWV3LndpZHRoLCB2aWV3LmhlaWdodClcbiAgICApXG5cbiAgICBnbG9iYWxFdmVudE1hbmFnZXIuc2V0SW50ZXJhY3Rpb24odGhpcy5yZW5kZXJlci5wbHVnaW5zLmludGVyYWN0aW9uKVxuXG4gICAgLy8gU3RhcnQgdGhlIGdhbWUgbG9vcFxuICAgIHRoaXMudGlja2VyLmFkZChkZWx0YSA9PiB0aGlzLmdhbWVMb29wLmJpbmQodGhpcykoZGVsdGEpKVxuICB9XG5cbiAgZ2FtZUxvb3AgKGRlbHRhKSB7XG4gICAgLy8gVXBkYXRlIHRoZSBjdXJyZW50IGdhbWUgc3RhdGU6XG4gICAgdGhpcy5jdXJyZW50U2NlbmUudGljayhkZWx0YSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBsaWNhdGlvblxuIiwiaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcblxyXG5jb25zdCBvID0ge1xyXG4gIGdldCAodGFyZ2V0LCBwcm9wZXJ0eSkge1xyXG4gICAgLy8gaGFzIFNUQVkgb2JqZWN0IHdpbGwgcmV0dXJuIDEsIG90aGVyd2lzZSAwXHJcbiAgICBpZiAocHJvcGVydHkgPT09ICd3ZWlnaHQnKSB7XHJcbiAgICAgIHJldHVybiB0YXJnZXQuc29tZShvID0+IG8udHlwZSA9PT0gU1RBWSkgPyAxIDogMFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRhcmdldFtwcm9wZXJ0eV1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEdhbWVPYmplY3RzIHtcclxuICBjb25zdHJ1Y3RvciAoLi4uaXRlbXMpIHtcclxuICAgIHJldHVybiBuZXcgUHJveHkoWy4uLml0ZW1zXSwgbylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdhbWVPYmplY3RzXHJcbiIsImltcG9ydCB7IEdyYXBoaWNzIH0gZnJvbSAnLi9QSVhJJ1xuaW1wb3J0IHsgQ0VJTF9TSVpFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY29uc3QgTElHSFQgPSBTeW1ib2woJ2xpZ2h0JylcblxuY2xhc3MgTGlnaHQge1xuICBzdGF0aWMgbGlnaHRPbiAodGFyZ2V0LCByYWRpdXMsIHJhbmQgPSAxKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IHRhcmdldC5wYXJlbnRcbiAgICBpZiAoIWNvbnRhaW5lci5saWdodGluZykge1xuICAgICAgLy8gY29udGFpbmVyIGRvZXMgTk9UIGhhcyBsaWdodGluZyBwcm9wZXJ0eVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBsaWdodGJ1bGIgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHZhciByciA9IDB4ZmZcbiAgICB2YXIgcmcgPSAweGZmXG4gICAgdmFyIHJiID0gMHhmZlxuICAgIHZhciByYWQgPSByYWRpdXMgKiBDRUlMX1NJWkVcblxuICAgIGxldCB4ID0gdGFyZ2V0LndpZHRoIC8gMiAvIHRhcmdldC5zY2FsZS54XG4gICAgbGV0IHkgPSB0YXJnZXQuaGVpZ2h0IC8gMiAvIHRhcmdldC5zY2FsZS55XG4gICAgbGlnaHRidWxiLmJlZ2luRmlsbCgocnIgPDwgMTYpICsgKHJnIDw8IDgpICsgcmIsIDEuMClcbiAgICBsaWdodGJ1bGIuZHJhd0NpcmNsZSh4LCB5LCByYWQpXG4gICAgbGlnaHRidWxiLmVuZEZpbGwoKVxuICAgIGxpZ2h0YnVsYi5wYXJlbnRMYXllciA9IGNvbnRhaW5lci5saWdodGluZyAvLyBtdXN0IGhhcyBwcm9wZXJ0eTogbGlnaHRpbmdcblxuICAgIHRhcmdldFtMSUdIVF0gPSB7XG4gICAgICBsaWdodDogbGlnaHRidWxiXG4gICAgfVxuICAgIHRhcmdldC5hZGRDaGlsZChsaWdodGJ1bGIpXG5cbiAgICBpZiAocmFuZCAhPT0gMSkge1xuICAgICAgbGV0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgZFNjYWxlID0gTWF0aC5yYW5kb20oKSAqICgxIC0gcmFuZClcbiAgICAgICAgaWYgKGxpZ2h0YnVsYi5zY2FsZS54ID4gMSkge1xuICAgICAgICAgIGRTY2FsZSA9IC1kU2NhbGVcbiAgICAgICAgfVxuICAgICAgICBsaWdodGJ1bGIuc2NhbGUueCArPSBkU2NhbGVcbiAgICAgICAgbGlnaHRidWxiLnNjYWxlLnkgKz0gZFNjYWxlXG4gICAgICAgIGxpZ2h0YnVsYi5hbHBoYSArPSBkU2NhbGVcbiAgICAgIH0sIDEwMDAgLyAxMilcbiAgICAgIHRhcmdldFtMSUdIVF0uaW50ZXJ2YWwgPSBpbnRlcnZhbFxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBsaWdodE9mZiAodGFyZ2V0KSB7XG4gICAgaWYgKCF0YXJnZXRbTElHSFRdKSB7XG4gICAgICAvLyBubyBsaWdodCB0byByZW1vdmVcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyByZW1vdmUgbGlnaHRcbiAgICB0YXJnZXQucmVtb3ZlQ2hpbGQodGFyZ2V0W0xJR0hUXS5saWdodClcbiAgICAvLyByZW1vdmUgaW50ZXJ2YWxcbiAgICBjbGVhckludGVydmFsKHRhcmdldFtMSUdIVF0uaW50ZXJ2YWwpXG4gICAgZGVsZXRlIHRhcmdldFtMSUdIVF1cbiAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICB0YXJnZXQub2ZmKCdyZW1vdmVkJywgTGlnaHQubGlnaHRPZmYpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGlnaHRcbiIsImltcG9ydCB7IENvbnRhaW5lciwgZGlzcGxheSwgQkxFTkRfTU9ERVMsIFNwcml0ZSB9IGZyb20gJy4vUElYSSdcclxuXHJcbmltcG9ydCB7IFNUQVksIFNUQVRJQywgUkVQTFksIENFSUxfU0laRSwgQUJJTElUWV9NT1ZFIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcclxuaW1wb3J0IHsgaW5zdGFuY2VCeUl0ZW1JZCB9IGZyb20gJy4vdXRpbHMnXHJcbmltcG9ydCBNYXBHcmFwaCBmcm9tICcuL01hcEdyYXBoJ1xyXG5pbXBvcnQgTWFwV29ybGQgZnJvbSAnLi4vbGliL01hcFdvcmxkJ1xyXG5cclxuY29uc3QgcGlwZSA9IChmaXJzdCwgLi4ubW9yZSkgPT5cclxuICBtb3JlLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiAoLi4uYXJncykgPT4gY3VycihhY2MoLi4uYXJncykpLCBmaXJzdClcclxuXHJcbmNvbnN0IG9iamVjdEV2ZW50ID0ge1xyXG4gIHBsYWNlIChvYmplY3QsIHBsYWNlZCkge1xyXG4gICAgbGV0IHBvc2l0aW9uID0gb2JqZWN0LnBvc2l0aW9uXHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QocGxhY2VkLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KVxyXG4gIH0sXHJcbiAgZmlyZSAob2JqZWN0LCBidWxsZXQpIHtcclxuICAgIHRoaXMuYWRkR2FtZU9iamVjdChidWxsZXQpXHJcbiAgfSxcclxuICBkaWUgKG9iamVjdCkge1xyXG4gICAgb2JqZWN0LnNheSgnWW91IGRpZS4nKVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGV2ZW50czpcclxuICogIHVzZTogb2JqZWN0XHJcbiAqL1xyXG5jbGFzcyBNYXAgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yIChzY2FsZSA9IDEpIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMuY2VpbFNpemUgPSBzY2FsZSAqIENFSUxfU0laRVxyXG4gICAgdGhpcy5tYXBTY2FsZSA9IHNjYWxlXHJcblxyXG4gICAgdGhpcy5vYmplY3RzID0ge1xyXG4gICAgICBbU1RBVElDXTogW10sXHJcbiAgICAgIFtTVEFZXTogW10sXHJcbiAgICAgIFtSRVBMWV06IFtdXHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcCA9IG5ldyBDb250YWluZXIoKVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLm1hcClcclxuXHJcbiAgICAvLyBwbGF5ZXIgZ3JvdXBcclxuICAgIHRoaXMucGxheWVyR3JvdXAgPSBuZXcgZGlzcGxheS5Hcm91cCgpXHJcbiAgICBsZXQgcGxheWVyTGF5ZXIgPSBuZXcgZGlzcGxheS5MYXllcih0aGlzLnBsYXllckdyb3VwKVxyXG4gICAgdGhpcy5hZGRDaGlsZChwbGF5ZXJMYXllcilcclxuICAgIHRoaXMubWFwR3JhcGggPSBuZXcgTWFwR3JhcGgoKVxyXG5cclxuICAgIC8vIHBoeXNpY1xyXG4gICAgdGhpcy5tYXBXb3JsZCA9IG5ldyBNYXBXb3JsZCgpXHJcbiAgfVxyXG5cclxuICBlbmFibGVGb2cgKCkge1xyXG4gICAgbGV0IGxpZ2h0aW5nID0gbmV3IGRpc3BsYXkuTGF5ZXIoKVxyXG4gICAgbGlnaHRpbmcub24oJ2Rpc3BsYXknLCBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICBlbGVtZW50LmJsZW5kTW9kZSA9IEJMRU5EX01PREVTLkFERFxyXG4gICAgfSlcclxuICAgIGxpZ2h0aW5nLnVzZVJlbmRlclRleHR1cmUgPSB0cnVlXHJcbiAgICBsaWdodGluZy5jbGVhckNvbG9yID0gWzAsIDAsIDAsIDFdIC8vIGFtYmllbnQgZ3JheVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQobGlnaHRpbmcpXHJcblxyXG4gICAgdmFyIGxpZ2h0aW5nU3ByaXRlID0gbmV3IFNwcml0ZShsaWdodGluZy5nZXRSZW5kZXJUZXh0dXJlKCkpXHJcbiAgICBsaWdodGluZ1Nwcml0ZS5ibGVuZE1vZGUgPSBCTEVORF9NT0RFUy5NVUxUSVBMWVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQobGlnaHRpbmdTcHJpdGUpXHJcblxyXG4gICAgdGhpcy5tYXAubGlnaHRpbmcgPSBsaWdodGluZ1xyXG4gIH1cclxuXHJcbiAgLy8g5raI6Zmk6L+36ZynXHJcbiAgZGlzYWJsZUZvZyAoKSB7XHJcbiAgICB0aGlzLmxpZ2h0aW5nLmNsZWFyQ29sb3IgPSBbMSwgMSwgMSwgMV1cclxuICB9XHJcblxyXG4gIGxvYWQgKG1hcERhdGEpIHtcclxuICAgIGxldCB0aWxlcyA9IG1hcERhdGEudGlsZXNcclxuICAgIGxldCBjb2xzID0gbWFwRGF0YS5jb2xzXHJcbiAgICBsZXQgcm93cyA9IG1hcERhdGEucm93c1xyXG4gICAgbGV0IGl0ZW1zID0gbWFwRGF0YS5pdGVtc1xyXG5cclxuICAgIGxldCBjZWlsU2l6ZSA9IHRoaXMuY2VpbFNpemVcclxuXHJcbiAgICBpZiAobWFwRGF0YS5oYXNGb2cpIHtcclxuICAgICAgdGhpcy5lbmFibGVGb2coKVxyXG4gICAgfVxyXG4gICAgbGV0IG1hcEdyYXBoID0gdGhpcy5tYXBHcmFwaFxyXG5cclxuICAgIGxldCBhZGRHYW1lT2JqZWN0ID0gKGksIGosIGlkLCBwYXJhbXMpID0+IHtcclxuICAgICAgbGV0IG8gPSBpbnN0YW5jZUJ5SXRlbUlkKGlkLCBwYXJhbXMpXHJcbiAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChvLCBpICogY2VpbFNpemUsIGogKiBjZWlsU2l6ZSlcclxuICAgICAgcmV0dXJuIFtvLCBpLCBqXVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBhZGRHcmFwaCA9IChbbywgaSwgal0pID0+IG1hcEdyYXBoLmFkZE9iamVjdChvLCBpLCBqKVxyXG5cclxuICAgIGxldCByZWdpc3Rlck9uID0gKFtvLCBpLCBqXSkgPT4ge1xyXG4gICAgICBvLm9uKCd1c2UnLCAoKSA9PiB0aGlzLmVtaXQoJ3VzZScsIG8pKVxyXG4gICAgICBvLm9uKCdmaXJlJywgb2JqZWN0RXZlbnQuZmlyZS5iaW5kKHRoaXMsIG8pKVxyXG4gICAgICAvLyBUT0RPOiByZW1vdmUgbWFwIGl0ZW1cclxuICAgICAgLy8gZGVsZXRlIGl0ZW1zW2ldXHJcbiAgICAgIHJldHVybiBbbywgaSwgal1cclxuICAgIH1cclxuXHJcbiAgICBtYXBHcmFwaC5iZWdpblVwZGF0ZSgpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xzOyBpKyspIHtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dzOyBqKyspIHtcclxuICAgICAgICBwaXBlKGFkZEdhbWVPYmplY3QsIHJlZ2lzdGVyT24sIGFkZEdyYXBoKShpLCBqLCB0aWxlc1tqICogY29scyArIGldKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICBsZXQgWyBpZCwgW2ksIGpdLCBwYXJhbXMgXSA9IGl0ZW1cclxuICAgICAgcGlwZShhZGRHYW1lT2JqZWN0LCByZWdpc3Rlck9uLCBhZGRHcmFwaCkoaSwgaiwgaWQsIHBhcmFtcylcclxuICAgIH0pXHJcblxyXG4gICAgbWFwR3JhcGguZW5kVXBkYXRlKClcclxuICB9XHJcblxyXG4gIGFkZFBsYXllciAocGxheWVyLCB0b1Bvc2l0aW9uKSB7XHJcbiAgICAvLyDoqLvlhorkuovku7ZcclxuICAgIE9iamVjdC5lbnRyaWVzKG9iamVjdEV2ZW50KS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xyXG4gICAgICBsZXQgZUluc3RhbmNlID0gaGFuZGxlci5iaW5kKHRoaXMsIHBsYXllcilcclxuICAgICAgcGxheWVyLm9uKGV2ZW50TmFtZSwgZUluc3RhbmNlKVxyXG4gICAgICBwbGF5ZXIub25jZSgncmVtb3ZlZCcsIHBsYXllci5vZmYuYmluZChwbGF5ZXIsIGV2ZW50TmFtZSwgZUluc3RhbmNlKSlcclxuICAgIH0pXHJcbiAgICAvLyDmlrDlop7oh7PlnLDlnJbkuIpcclxuICAgIHRoaXMuYWRkR2FtZU9iamVjdChcclxuICAgICAgcGxheWVyLFxyXG4gICAgICB0b1Bvc2l0aW9uWzBdICogdGhpcy5jZWlsU2l6ZSxcclxuICAgICAgdG9Qb3NpdGlvblsxXSAqIHRoaXMuY2VpbFNpemUpXHJcblxyXG4gICAgLy8gcGxheWVyIOe9rumggumhr+ekulxyXG4gICAgcGxheWVyLnBhcmVudEdyb3VwID0gdGhpcy5wbGF5ZXJHcm91cFxyXG5cclxuICAgIC8vIOiHquWLleaJvui3r1xyXG4gICAgLy8gbGV0IG1vdmVBYmlsaXR5ID0gcGxheWVyW0FCSUxJVFlfTU9WRV1cclxuICAgIC8vIGlmIChtb3ZlQWJpbGl0eSkge1xyXG4gICAgLy8gICBsZXQgcG9pbnRzID0gWyc0LDEnLCAnNCw0JywgJzExLDEnLCAnNiwxMCddXHJcbiAgICAvLyAgIHBvaW50cy5yZWR1Y2UoKGFjYywgY3VyKSA9PiB7XHJcbiAgICAvLyAgICAgbGV0IHBhdGggPSB0aGlzLm1hcEdyYXBoLmZpbmQoYWNjLCBjdXIpLm1hcChub2RlID0+IHtcclxuICAgIC8vICAgICAgIGxldCBbaSwgal0gPSBub2RlLmlkLnNwbGl0KCcsJylcclxuICAgIC8vICAgICAgIHJldHVybiB7eDogaSAqIHRoaXMuY2VpbFNpemUsIHk6IGogKiB0aGlzLmNlaWxTaXplfVxyXG4gICAgLy8gICAgIH0pXHJcbiAgICAvLyAgICAgbW92ZUFiaWxpdHkuYWRkUGF0aChwYXRoKVxyXG4gICAgLy8gICAgIHJldHVybiBjdXJcclxuICAgIC8vICAgfSlcclxuICAgIC8vIH1cclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgfVxyXG5cclxuICBhZGRHYW1lT2JqZWN0IChvLCB4ID0gdW5kZWZpbmVkLCB5ID0gdW5kZWZpbmVkKSB7XHJcbiAgICBsZXQgbWFwU2NhbGUgPSB0aGlzLm1hcFNjYWxlXHJcbiAgICBpZiAoeCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIG8ucG9zaXRpb24uc2V0KHgsIHkpXHJcbiAgICB9XHJcbiAgICBvLnNjYWxlLnNldChtYXBTY2FsZSwgbWFwU2NhbGUpXHJcbiAgICBvLmFuY2hvci5zZXQoMC41LCAwLjUpXHJcblxyXG4gICAgbGV0IG9BcnJheSA9IHRoaXMub2JqZWN0c1tvLnR5cGVdXHJcbiAgICBvQXJyYXkucHVzaChvKVxyXG4gICAgby5vbmNlKCdyZW1vdmVkJywgKCkgPT4ge1xyXG4gICAgICBsZXQgaW54ID0gb0FycmF5LmluZGV4T2YobylcclxuICAgICAgb0FycmF5LnNwbGljZShpbngsIDEpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGFkZCB0byB3b3JsZFxyXG4gICAgdGhpcy5tYXBXb3JsZC5hZGQobylcclxuICAgIHRoaXMubWFwLmFkZENoaWxkKG8pXHJcbiAgfVxyXG5cclxuICAvLyBmb2cg55qEIHBhcmVudCBjb250YWluZXIg5LiN6IO96KKr56e75YuVKOacg+mMr+S9jSnvvIzlm6DmraTmlLnmiJDkv67mlLkgbWFwIOS9jee9rlxyXG4gIGdldCBwb3NpdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXAucG9zaXRpb25cclxuICB9XHJcblxyXG4gIGdldCB4ICgpIHtcclxuICAgIHJldHVybiB0aGlzLm1hcC54XHJcbiAgfVxyXG5cclxuICBnZXQgeSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXAueVxyXG4gIH1cclxuXHJcbiAgc2V0IHggKHgpIHtcclxuICAgIHRoaXMubWFwLnggPSB4XHJcbiAgfVxyXG5cclxuICBzZXQgeSAoeSkge1xyXG4gICAgdGhpcy5tYXAueSA9IHlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hcFxyXG4iLCJpbXBvcnQgY3JlYXRlR3JhcGggZnJvbSAnbmdyYXBoLmdyYXBoJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICduZ3JhcGgucGF0aCdcclxuaW1wb3J0IEdhbWVPYmplY3RzIGZyb20gJy4vR2FtZU9iamVjdHMnXHJcblxyXG5jbGFzcyBNYXBHcmFwaCB7XHJcbiAgY29uc3RydWN0b3IgKHNjYWxlID0gMSkge1xyXG4gICAgdGhpcy5fZ3JhcGggPSBjcmVhdGVHcmFwaCgpXHJcbiAgICB0aGlzLl9maW5kZXIgPSBwYXRoLmFTdGFyKHRoaXMuX2dyYXBoLCB7XHJcbiAgICAgIC8vIFdlIHRlbGwgb3VyIHBhdGhmaW5kZXIgd2hhdCBzaG91bGQgaXQgdXNlIGFzIGEgZGlzdGFuY2UgZnVuY3Rpb246XHJcbiAgICAgIGRpc3RhbmNlIChmcm9tTm9kZSwgdG9Ob2RlLCBsaW5rKSB7XHJcbiAgICAgICAgcmV0dXJuIGZyb21Ob2RlLmRhdGEud2VpZ2h0ICsgdG9Ob2RlLmRhdGEud2VpZ2h0ICsgMVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgYWRkT2JqZWN0IChvLCBpLCBqKSB7XHJcbiAgICBsZXQgZ3JhcGggPSB0aGlzLl9ncmFwaFxyXG5cclxuICAgIGxldCBzZWxmTmFtZSA9IFtpLCBqXS5qb2luKCcsJylcclxuICAgIGxldCBub2RlID0gZ3JhcGguZ2V0Tm9kZShzZWxmTmFtZSlcclxuICAgIGlmICghbm9kZSkge1xyXG4gICAgICBub2RlID0gZ3JhcGguYWRkTm9kZShzZWxmTmFtZSwgbmV3IEdhbWVPYmplY3RzKG8pKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbm9kZS5kYXRhLnB1c2gobylcclxuICAgIH1cclxuICAgIGxldCBsaW5rID0gKHNlbGZOb2RlLCBvdGhlck5vZGUpID0+IHtcclxuICAgICAgaWYgKCFzZWxmTm9kZSB8fCAhb3RoZXJOb2RlIHx8IGdyYXBoLmdldExpbmsoc2VsZk5vZGUuaWQsIG90aGVyTm9kZS5pZCkpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBsZXQgd2VpZ2h0ID0gc2VsZk5vZGUuZGF0YS53ZWlnaHQgKyBvdGhlck5vZGUuZGF0YS53ZWlnaHRcclxuICAgICAgaWYgKHdlaWdodCA9PT0gMCkge1xyXG4gICAgICAgIGdyYXBoLmFkZExpbmsoc2VsZk5vZGUuaWQsIG90aGVyTm9kZS5pZClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZGF0YS53ZWlnaHQgIT09IDApIHtcclxuICAgICAgLy8g5q2k6bue5LiN6YCa77yM56e76Zmk5omA5pyJ6YCj57WQXHJcbiAgICAgIGdyYXBoLmZvckVhY2hMaW5rZWROb2RlKHNlbGZOYW1lLCBmdW5jdGlvbiAobGlua2VkTm9kZSwgbGluaykge1xyXG4gICAgICAgIGdyYXBoLnJlbW92ZUxpbmsobGluaylcclxuICAgICAgfSlcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBsaW5rKG5vZGUsIGdyYXBoLmdldE5vZGUoW2kgLSAxLCBqXS5qb2luKCcsJykpKVxyXG4gICAgbGluayhub2RlLCBncmFwaC5nZXROb2RlKFtpLCBqIC0gMV0uam9pbignLCcpKSlcclxuICAgIGxpbmsoZ3JhcGguZ2V0Tm9kZShbaSArIDEsIGpdLmpvaW4oJywnKSksIG5vZGUpXHJcbiAgICBsaW5rKGdyYXBoLmdldE5vZGUoW2ksIGogKyAxXS5qb2luKCcsJykpLCBub2RlKVxyXG4gIH1cclxuXHJcbiAgZmluZCAoZnJvbSwgdG8pIHtcclxuICAgIHJldHVybiB0aGlzLl9maW5kZXIuZmluZChmcm9tLCB0bylcclxuICB9XHJcblxyXG4gIGJlZ2luVXBkYXRlICgpIHtcclxuICAgIHRoaXMuX2dyYXBoLmJlZ2luVXBkYXRlKClcclxuICB9XHJcblxyXG4gIGVuZFVwZGF0ZSAoKSB7XHJcbiAgICB0aGlzLl9ncmFwaC5lbmRVcGRhdGUoKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWFwR3JhcGhcclxuIiwiaW1wb3J0IHsgRW5naW5lLCBFdmVudHMsIFdvcmxkIH0gZnJvbSAnLi9NYXR0ZXInXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5sZXQgUEFSRU5UID0gU3ltYm9sKCdwYXJlbnQnKVxuXG5jbGFzcyBNYXBXb3JsZCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvLyBwaHlzaWNcbiAgICBsZXQgZW5naW5lID0gRW5naW5lLmNyZWF0ZSgpXG4gICAgRXZlbnRzLm9uKGVuZ2luZSwgJ2NvbGxpc2lvblN0YXJ0JywgZXZlbnQgPT4ge1xuICAgICAgdmFyIHBhaXJzID0gZXZlbnQucGFpcnNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHBhaXIgPSBwYWlyc1tpXVxuICAgICAgICBsZXQgbzEgPSBwYWlyLmJvZHlBW1BBUkVOVF1cbiAgICAgICAgbGV0IG8yID0gcGFpci5ib2R5QltQQVJFTlRdXG4gICAgICAgIG8xLmVtaXQoJ2NvbGxpZGUnLCBvMilcbiAgICAgICAgbzIuZW1pdCgnY29sbGlkZScsIG8xKVxuICAgICAgfVxuICAgIH0pXG4gICAgRW5naW5lLnJ1bihlbmdpbmUpXG5cbiAgICBsZXQgd29ybGQgPSBlbmdpbmUud29ybGRcbiAgICB3b3JsZC5ncmF2aXR5LnkgPSAwXG5cbiAgICB0aGlzLndvcmxkID0gd29ybGRcbiAgfVxuXG4gIGFkZCAobykge1xuICAgIGlmIChvLnR5cGUgPT09IFNUQVRJQykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG8uYWRkQm9keSgpXG4gICAgbGV0IGJvZHkgPSBvLmJvZHlcbiAgICBvLm9uY2UoJ3JlbW92ZWQnLCAoKSA9PiB7XG4gICAgICBXb3JsZC5yZW1vdmUodGhpcy53b3JsZCwgYm9keSlcbiAgICB9KVxuICAgIGJvZHlbUEFSRU5UXSA9IG9cbiAgICBXb3JsZC5hZGQodGhpcy53b3JsZCwgYm9keSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYXBXb3JsZFxuIiwiLyogZ2xvYmFsIE1hdHRlciAqL1xuZXhwb3J0IGNvbnN0IEVuZ2luZSA9IE1hdHRlci5FbmdpbmVcbmV4cG9ydCBjb25zdCBSZW5kZXIgPSBNYXR0ZXIuUmVuZGVyXG5leHBvcnQgY29uc3QgV29ybGQgPSBNYXR0ZXIuV29ybGRcbmV4cG9ydCBjb25zdCBCb2RpZXMgPSBNYXR0ZXIuQm9kaWVzXG5leHBvcnQgY29uc3QgRXZlbnRzID0gTWF0dGVyLkV2ZW50c1xuZXhwb3J0IGNvbnN0IEJvZHkgPSBNYXR0ZXIuQm9keVxuZXhwb3J0IGNvbnN0IFZlY3RvciA9IE1hdHRlci5WZWN0b3JcbiIsImltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJ1xuXG5jb25zdCBNQVhfTUVTU0FHRV9DT1VOVCA9IDUwMFxuXG5jbGFzcyBNZXNzYWdlcyBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5fbWVzc2FnZXMgPSBbXVxuICB9XG5cbiAgZ2V0IGxpc3QgKCkge1xuICAgIHJldHVybiB0aGlzLl9tZXNzYWdlc1xuICB9XG5cbiAgYWRkIChtc2cpIHtcbiAgICBsZXQgbGVuZ3RoID0gdGhpcy5fbWVzc2FnZXMudW5zaGlmdChtc2cpXG4gICAgaWYgKGxlbmd0aCA+IE1BWF9NRVNTQUdFX0NPVU5UKSB7XG4gICAgICB0aGlzLl9tZXNzYWdlcy5wb3AoKVxuICAgIH1cbiAgICB0aGlzLmVtaXQoJ21vZGlmaWVkJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgTWVzc2FnZXMoKVxuIiwiLyogZ2xvYmFsIFBJWEkgKi9cblxuZXhwb3J0IGNvbnN0IEFwcGxpY2F0aW9uID0gUElYSS5BcHBsaWNhdGlvblxuZXhwb3J0IGNvbnN0IENvbnRhaW5lciA9IFBJWEkuQ29udGFpbmVyXG5leHBvcnQgY29uc3QgbG9hZGVyID0gUElYSS5sb2FkZXJcbmV4cG9ydCBjb25zdCByZXNvdXJjZXMgPSBQSVhJLmxvYWRlci5yZXNvdXJjZXNcbmV4cG9ydCBjb25zdCBTcHJpdGUgPSBQSVhJLlNwcml0ZVxuZXhwb3J0IGNvbnN0IFRleHQgPSBQSVhJLlRleHRcbmV4cG9ydCBjb25zdCBUZXh0U3R5bGUgPSBQSVhJLlRleHRTdHlsZVxuXG5leHBvcnQgY29uc3QgR3JhcGhpY3MgPSBQSVhJLkdyYXBoaWNzXG5leHBvcnQgY29uc3QgQkxFTkRfTU9ERVMgPSBQSVhJLkJMRU5EX01PREVTXG5leHBvcnQgY29uc3QgZGlzcGxheSA9IFBJWEkuZGlzcGxheVxuZXhwb3J0IGNvbnN0IHV0aWxzID0gUElYSS51dGlsc1xuZXhwb3J0IGNvbnN0IE9ic2VydmFibGVQb2ludCA9IFBJWEkuT2JzZXJ2YWJsZVBvaW50XG4iLCJpbXBvcnQgeyBkaXNwbGF5IH0gZnJvbSAnLi9QSVhJJ1xuXG5jbGFzcyBTY2VuZSBleHRlbmRzIGRpc3BsYXkuTGF5ZXIge1xuICBjcmVhdGUgKCkge31cblxuICBkZXN0cm95ICgpIHt9XG5cbiAgdGljayAoZGVsdGEpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lXG4iLCJpbXBvcnQgeyByZXNvdXJjZXMgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY29uc3QgVGV4dHVyZSA9IHtcbiAgZ2V0IFRlcnJhaW5BdGxhcyAoKSB7XG4gICAgcmV0dXJuIHJlc291cmNlc1snaW1hZ2VzL3RlcnJhaW5fYXRsYXMuanNvbiddXG4gIH0sXG4gIGdldCBCYXNlT3V0QXRsYXMgKCkge1xuICAgIHJldHVybiByZXNvdXJjZXNbJ2ltYWdlcy9iYXNlX291dF9hdGxhcy5qc29uJ11cbiAgfSxcblxuICBnZXQgQWlyICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2VtcHR5LnBuZyddXG4gIH0sXG4gIGdldCBHcmFzcyAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydncmFzcy5wbmcnXVxuICB9LFxuICBnZXQgR3JvdW5kICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2JyaWNrLXRpbGUucG5nJ11cbiAgfSxcblxuICBnZXQgV2FsbCAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWyd3YWxsLnBuZyddXG4gIH0sXG4gIGdldCBJcm9uRmVuY2UgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1snaXJvbi1mZW5jZS5wbmcnXVxuICB9LFxuICBnZXQgUm9vdCAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydyb290LnBuZyddXG4gIH0sXG4gIGdldCBUcmVlICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ3RyZWUucG5nJ11cbiAgfSxcblxuICBnZXQgVHJlYXN1cmUgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1sndHJlYXN1cmUucG5nJ11cbiAgfSxcbiAgZ2V0IERvb3IgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1snaXJvbi1mZW5jZS5wbmcnXVxuICB9LFxuICBnZXQgVG9yY2ggKCkge1xuICAgIHJldHVybiBUZXh0dXJlLkJhc2VPdXRBdGxhcy50ZXh0dXJlc1sndG9yY2gucG5nJ11cbiAgfSxcbiAgZ2V0IEdyYXNzRGVjb3JhdGUxICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ2dyYXNzLWRlY29yYXRlLTEucG5nJ11cbiAgfSxcbiAgZ2V0IEJ1bGxldCAoKSB7XG4gICAgcmV0dXJuIHJlc291cmNlc1snaW1hZ2VzL2ZpcmVfYm9sdC5wbmcnXS50ZXh0dXJlXG4gIH0sXG5cbiAgZ2V0IFJvY2sgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1sncm9jay5wbmcnXVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHR1cmVcbiIsImNvbnN0IGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJXG5cbmNsYXNzIFZlY3RvciB7XG4gIGNvbnN0cnVjdG9yICh4LCB5KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUG9pbnQgKHApIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihwLngsIHAueSlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUmFkTGVuZ3RoIChyYWQsIGxlbmd0aCkge1xuICAgIGxldCB4ID0gbGVuZ3RoICogTWF0aC5jb3MocmFkKVxuICAgIGxldCB5ID0gbGVuZ3RoICogTWF0aC5zaW4ocmFkKVxuICAgIHJldHVybiBuZXcgVmVjdG9yKHgsIHkpXG4gIH1cblxuICBjbG9uZSAoKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnkpXG4gIH1cblxuICBhZGQgKHYpIHtcbiAgICB0aGlzLnggKz0gdi54XG4gICAgdGhpcy55ICs9IHYueVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdWIgKHYpIHtcbiAgICB0aGlzLnggLT0gdi54XG4gICAgdGhpcy55IC09IHYueVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbnZlcnQgKCkge1xuICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKC0xKVxuICB9XG5cbiAgbXVsdGlwbHlTY2FsYXIgKHMpIHtcbiAgICB0aGlzLnggKj0gc1xuICAgIHRoaXMueSAqPSBzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRpdmlkZVNjYWxhciAocykge1xuICAgIGlmIChzID09PSAwKSB7XG4gICAgICB0aGlzLnggPSAwXG4gICAgICB0aGlzLnkgPSAwXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKDEgLyBzKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZG90ICh2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueVxuICB9XG5cbiAgZ2V0IGxlbmd0aCAoKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkpXG4gIH1cblxuICBsZW5ndGhTcSAoKSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueVxuICB9XG5cbiAgbm9ybWFsaXplICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIodGhpcy5sZW5ndGgpXG4gIH1cblxuICBkaXN0YW5jZVRvICh2KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3RhbmNlVG9TcSh2KSlcbiAgfVxuXG4gIGRpc3RhbmNlVG9TcSAodikge1xuICAgIGxldCBkeCA9IHRoaXMueCAtIHYueFxuICAgIGxldCBkeSA9IHRoaXMueSAtIHYueVxuICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeVxuICB9XG5cbiAgc2V0ICh4LCB5KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0WCAoeCkge1xuICAgIHRoaXMueCA9IHhcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0WSAoeSkge1xuICAgIHRoaXMueSA9IHlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0TGVuZ3RoIChsKSB7XG4gICAgdmFyIG9sZExlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgaWYgKG9sZExlbmd0aCAhPT0gMCAmJiBsICE9PSBvbGRMZW5ndGgpIHtcbiAgICAgIHRoaXMubXVsdGlwbHlTY2FsYXIobCAvIG9sZExlbmd0aClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGxlcnAgKHYsIGFscGhhKSB7XG4gICAgdGhpcy54ICs9ICh2LnggLSB0aGlzLngpICogYWxwaGFcbiAgICB0aGlzLnkgKz0gKHYueSAtIHRoaXMueSkgKiBhbHBoYVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBnZXQgcmFkICgpIHtcbiAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueClcbiAgfVxuXG4gIGdldCBkZWcgKCkge1xuICAgIHJldHVybiB0aGlzLnJhZCAqIGRlZ3JlZXNcbiAgfVxuXG4gIGVxdWFscyAodikge1xuICAgIHJldHVybiB0aGlzLnggPT09IHYueCAmJiB0aGlzLnkgPT09IHYueVxuICB9XG5cbiAgcm90YXRlICh0aGV0YSkge1xuICAgIHZhciB4dGVtcCA9IHRoaXMueFxuICAgIHRoaXMueCA9IHRoaXMueCAqIE1hdGguY29zKHRoZXRhKSAtIHRoaXMueSAqIE1hdGguc2luKHRoZXRhKVxuICAgIHRoaXMueSA9IHh0ZW1wICogTWF0aC5zaW4odGhldGEpICsgdGhpcy55ICogTWF0aC5jb3ModGhldGEpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWZWN0b3JcbiIsImNsYXNzIEdsb2JhbEV2ZW50TWFuYWdlciB7XG4gIHNldEludGVyYWN0aW9uIChpbnRlcmFjdGlvbikge1xuICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBpbnRlcmFjdGlvblxuICB9XG5cbiAgb24gKGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIHRoaXMuaW50ZXJhY3Rpb24ub24oZXZlbnROYW1lLCBoYW5kbGVyKVxuICB9XG5cbiAgb2ZmIChldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmludGVyYWN0aW9uLm9mZihldmVudE5hbWUsIGhhbmRsZXIpXG4gIH1cblxuICBlbWl0IChldmVudE5hbWUsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLmludGVyYWN0aW9uLmVtaXQoZXZlbnROYW1lLCAuLi5hcmdzKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBHbG9iYWxFdmVudE1hbmFnZXIoKVxuIiwiaW1wb3J0IFdhbGwgZnJvbSAnLi4vb2JqZWN0cy9XYWxsJ1xyXG5pbXBvcnQgQWlyIGZyb20gJy4uL29iamVjdHMvQWlyJ1xyXG5pbXBvcnQgR3Jhc3MgZnJvbSAnLi4vb2JqZWN0cy9HcmFzcydcclxuaW1wb3J0IFRyZWFzdXJlIGZyb20gJy4uL29iamVjdHMvVHJlYXN1cmUnXHJcbmltcG9ydCBEb29yIGZyb20gJy4uL29iamVjdHMvRG9vcidcclxuaW1wb3J0IFRvcmNoIGZyb20gJy4uL29iamVjdHMvVG9yY2gnXHJcbmltcG9ydCBHcm91bmQgZnJvbSAnLi4vb2JqZWN0cy9Hcm91bmQnXHJcbmltcG9ydCBJcm9uRmVuY2UgZnJvbSAnLi4vb2JqZWN0cy9Jcm9uRmVuY2UnXHJcbmltcG9ydCBSb290IGZyb20gJy4uL29iamVjdHMvUm9vdCdcclxuaW1wb3J0IFRyZWUgZnJvbSAnLi4vb2JqZWN0cy9UcmVlJ1xyXG5pbXBvcnQgR3Jhc3NEZWNvcmF0ZTEgZnJvbSAnLi4vb2JqZWN0cy9HcmFzc0RlY29yYXRlMSdcclxuaW1wb3J0IEJ1bGxldCBmcm9tICcuLi9vYmplY3RzL0J1bGxldCdcclxuaW1wb3J0IFdhbGxTaG9vdEJvbHQgZnJvbSAnLi4vb2JqZWN0cy9XYWxsU2hvb3RCb2x0J1xyXG5cclxuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcclxuaW1wb3J0IENhbWVyYSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEnXHJcbmltcG9ydCBPcGVyYXRlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL09wZXJhdGUnXHJcblxyXG4vLyAweDAwMDAgfiAweDAwMGZcclxuY29uc3QgSXRlbXNTdGF0aWMgPSBbXHJcbiAgQWlyLCBHcmFzcywgR3JvdW5kXHJcbl1cclxuLy8gMHgwMDEwIH4gMHgwMGZmXHJcbmNvbnN0IEl0ZW1zU3RheSA9IFtcclxuICAvLyAweDAwMTAsIDB4MDAxMSwgMHgwMDEyXHJcbiAgV2FsbCwgSXJvbkZlbmNlLCBSb290LCBUcmVlXHJcbl1cclxuLy8gMHgwMTAwIH4gMHgwMWZmXHJcbmNvbnN0IEl0ZW1zT3RoZXIgPSBbXHJcbiAgVHJlYXN1cmUsIERvb3IsIFRvcmNoLCBHcmFzc0RlY29yYXRlMSwgQnVsbGV0LCBXYWxsU2hvb3RCb2x0XHJcbl1cclxuLy8gMHgwMjAwIH4gMHgwMmZmXHJcbmNvbnN0IEFiaWxpdGllcyA9IFtcclxuICBNb3ZlLCBDYW1lcmEsIE9wZXJhdGVcclxuXVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbmNlQnlJdGVtSWQgKGl0ZW1JZCwgcGFyYW1zKSB7XHJcbiAgbGV0IFR5cGVzXHJcbiAgaXRlbUlkID0gcGFyc2VJbnQoaXRlbUlkLCAxNilcclxuICBpZiAoKGl0ZW1JZCAmIDB4ZmZmMCkgPT09IDApIHtcclxuICAgIC8vIOWcsOadv1xyXG4gICAgVHlwZXMgPSBJdGVtc1N0YXRpY1xyXG4gIH0gZWxzZSBpZiAoKGl0ZW1JZCAmIDB4ZmYwMCkgPT09IDApIHtcclxuICAgIFR5cGVzID0gSXRlbXNTdGF5XHJcbiAgICBpdGVtSWQgLT0gMHgwMDEwXHJcbiAgfSBlbHNlIGlmICgoaXRlbUlkICYgMHhmZjAwKSA+Pj4gOCA9PT0gMSkge1xyXG4gICAgVHlwZXMgPSBJdGVtc090aGVyXHJcbiAgICBpdGVtSWQgLT0gMHgwMTAwXHJcbiAgfSBlbHNlIHtcclxuICAgIFR5cGVzID0gQWJpbGl0aWVzXHJcbiAgICBpdGVtSWQgLT0gMHgwMjAwXHJcbiAgfVxyXG4gIHJldHVybiBuZXcgVHlwZXNbaXRlbUlkXShwYXJhbXMpXHJcbn1cclxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEFpciBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5BaXIpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBaXJcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuaW1wb3J0IHsgUkVQTFksIEFCSUxJVFlfTU9WRSwgQUJJTElUWV9IRUFMVEggfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5pbXBvcnQgTGVhcm4gZnJvbSAnLi9hYmlsaXRpZXMvTGVhcm4nXG5pbXBvcnQgTW92ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9Nb3ZlJ1xuaW1wb3J0IEhlYWx0aCBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9IZWFsdGgnXG5cbmNvbnN0IEhlYWx0aFBvaW50ID0gMVxuXG5jbGFzcyBCdWxsZXQgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFRleHR1cmUuQnVsbGV0KVxuXG4gICAgbmV3IExlYXJuKCkuY2FycnlCeSh0aGlzKVxuICAgICAgLmxlYXJuKG5ldyBNb3ZlKFsyLCAwXSkpXG4gICAgICAubGVhcm4obmV3IEhlYWx0aChIZWFsdGhQb2ludCkpXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbignZGllJywgdGhpcy5vbkRpZS5iaW5kKHRoaXMpKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gUkVQTFkgfVxuXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XG4gICAgaWYgKHRoaXMub3duZXIgPT09IG9wZXJhdG9yIHx8XG4gICAgICB0aGlzLm93bmVyID09PSBvcGVyYXRvci5vd25lcikge1xuICAgICAgLy8g6YG/5YWN6Ieq5q66XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGhlYWx0aEFiaWxpdHkgPSBvcGVyYXRvcltBQklMSVRZX0hFQUxUSF1cbiAgICAvLyDlgrflrrPku5bkurpcbiAgICBpZiAoaGVhbHRoQWJpbGl0eSkge1xuICAgICAgaGVhbHRoQWJpbGl0eS5nZXRIdXJ0KHtcbiAgICAgICAgZGFtYWdlOiAxXG4gICAgICB9KVxuICAgIH1cbiAgICAvLyDoh6rmiJHmr4Dmu4VcbiAgICB0aGlzW0FCSUxJVFlfSEVBTFRIXS5nZXRIdXJ0KHtcbiAgICAgIGRhbWFnZTogSGVhbHRoUG9pbnRcbiAgICB9KVxuICB9XG5cbiAgb25EaWUgKCkge1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpXG4gICAgdGhpcy5kZXN0cm95KClcbiAgfVxuXG4gIHNldE93bmVyIChvd25lcikge1xuICAgIHRoaXMub3duZXIgPSBvd25lclxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnQnVsbGV0J1xuICB9XG5cbiAgc2F5ICgpIHtcbiAgICAvLyBzYXkgbm90aGluZ1xuICB9XG5cbiAgc2V0RGlyZWN0aW9uICh2ZWN0b3IpIHtcbiAgICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzW0FCSUxJVFlfTU9WRV1cbiAgICBpZiAobW92ZUFiaWxpdHkpIHtcbiAgICAgIG1vdmVBYmlsaXR5LnNldERpcmVjdGlvbih2ZWN0b3IpXG4gICAgICB0aGlzLnJvdGF0ZSh2ZWN0b3IucmFkKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCdWxsZXRcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuaW1wb3J0IHsgUkVQTFkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5pbXBvcnQgTGVhcm4gZnJvbSAnLi9hYmlsaXRpZXMvTGVhcm4nXG5pbXBvcnQgTW92ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9Nb3ZlJ1xuaW1wb3J0IEtleU1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvS2V5TW92ZSdcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhJ1xuaW1wb3J0IENhcnJ5IGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0NhcnJ5J1xuaW1wb3J0IFBsYWNlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL1BsYWNlJ1xuaW1wb3J0IEtleVBsYWNlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0tleVBsYWNlJ1xuaW1wb3J0IEZpcmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvRmlyZSdcbmltcG9ydCBLZXlGaXJlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0tleUZpcmUnXG5pbXBvcnQgUm90YXRlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL1JvdGF0ZSdcbmltcG9ydCBIZWFsdGggZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvSGVhbHRoJ1xuaW1wb3J0IEJ1bGxldCBmcm9tICcuLi9vYmplY3RzL0J1bGxldCdcblxuY2xhc3MgQ2F0IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLlJvY2spXG5cbiAgICBsZXQgY2FycnkgPSBuZXcgQ2FycnkoMylcbiAgICBuZXcgTGVhcm4oKS5jYXJyeUJ5KHRoaXMpXG4gICAgICAubGVhcm4obmV3IE1vdmUoWzFdKSlcbiAgICAgIC5sZWFybihuZXcgS2V5TW92ZSgpKVxuICAgICAgLmxlYXJuKG5ldyBQbGFjZSgpKVxuICAgICAgLmxlYXJuKG5ldyBLZXlQbGFjZSgpKVxuICAgICAgLmxlYXJuKG5ldyBDYW1lcmEoMSkpXG4gICAgICAubGVhcm4oY2FycnkpXG4gICAgICAubGVhcm4obmV3IEZpcmUoWzMsIDNdKSlcbiAgICAgIC5sZWFybihuZXcgUm90YXRlKCkpXG4gICAgICAubGVhcm4obmV3IEtleUZpcmUoKSlcbiAgICAgIC5sZWFybihuZXcgSGVhbHRoKDEwKSlcblxuICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KClcbiAgICBjYXJyeS50YWtlKGJ1bGxldCwgSW5maW5pdHkpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAneW91J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhdFxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXHJcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcclxuXHJcbmltcG9ydCB7IFNUQVksIEFCSUxJVFlfT1BFUkFURSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcblxyXG5jbGFzcyBEb29yIGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKG1hcCkge1xyXG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXHJcbiAgICBzdXBlcihUZXh0dXJlLkRvb3IpXHJcblxyXG4gICAgdGhpcy5tYXAgPSBtYXBbMF1cclxuICAgIHRoaXMudG9Qb3NpdGlvbiA9IG1hcFsxXVxyXG5cclxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxyXG5cclxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xyXG4gICAgbGV0IGFiaWxpdHkgPSBvcGVyYXRvcltBQklMSVRZX09QRVJBVEVdXHJcbiAgICBpZiAoYWJpbGl0eSkge1xyXG4gICAgICBhYmlsaXR5KHRoaXMpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvcGVyYXRvci5lbWl0KCdjb2xsaWRlJywgdGhpcylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFtBQklMSVRZX09QRVJBVEVdICgpIHtcclxuICAgIHRoaXMuc2F5KFsnR2V0IGluICcsIHRoaXMubWFwLCAnIG5vdy4nXS5qb2luKCcnKSlcclxuICAgIHRoaXMuZW1pdCgndXNlJylcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnRG9vcidcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERvb3JcclxuIiwiaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgeyBCb2RpZXMsIEJvZHkgfSBmcm9tICcuLi9saWIvTWF0dGVyJ1xuaW1wb3J0IHsgU1RBWSwgU1RBVElDLCBBQklMSVRZX01PVkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IG1lc3NhZ2VzIGZyb20gJy4uL2xpYi9NZXNzYWdlcydcblxuY2xhc3MgR2FtZU9iamVjdCBleHRlbmRzIFNwcml0ZSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG4gIHNheSAobXNnKSB7XG4gICAgbWVzc2FnZXMuYWRkKG1zZylcbiAgfVxuXG4gIGFkZEJvZHkgKCkge1xuICAgIGlmICh0aGlzLmJvZHkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzW0FCSUxJVFlfTU9WRV1cbiAgICBsZXQgZnJpY3Rpb24gPSAobW92ZUFiaWxpdHkgJiYgbW92ZUFiaWxpdHkuZnJpY3Rpb24gIT09IHVuZGVmaW5lZClcbiAgICAgID8gbW92ZUFiaWxpdHkuZnJpY3Rpb25cbiAgICAgIDogMC4xXG4gICAgbGV0IGZyaWN0aW9uQWlyID0gKG1vdmVBYmlsaXR5ICYmIG1vdmVBYmlsaXR5LmZyaWN0aW9uQWlyICE9PSB1bmRlZmluZWQpXG4gICAgICA/IG1vdmVBYmlsaXR5LmZyaWN0aW9uQWlyXG4gICAgICA6IDAuMDFcbiAgICBsZXQgbWFzcyA9IHRoaXMubWFzcyA/IHRoaXMubWFzcyA6IDFcbiAgICBsZXQgYm9keSA9IEJvZGllcy5yZWN0YW5nbGUodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB7XG4gICAgICBpc1N0YXRpYzogdGhpcy50eXBlID09PSBTVEFZLFxuICAgICAgZnJpY3Rpb25TdGF0aWM6IGZyaWN0aW9uLFxuICAgICAgZnJpY3Rpb25BaXI6IGZyaWN0aW9uQWlyLFxuICAgICAgZnJpY3Rpb24sXG4gICAgICBtYXNzOiBtYXNzXG4gICAgfSlcbiAgICBib2R5LnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblxuICAgIHRoaXMuYm9keSA9IGJvZHlcbiAgfVxuXG4gIHJvdGF0ZSAocmFkLCBkZWx0YSA9IGZhbHNlKSB7XG4gICAgdGhpcy5yb3RhdGlvbiA9IGRlbHRhID8gdGhpcy5yb3RhdGlvbiArIHJhZCA6IHJhZFxuICAgIGlmICh0aGlzLmJvZHkpIHtcbiAgICAgIEJvZHkuc2V0QW5nbGUodGhpcy5ib2R5LCByYWQpXG4gICAgfVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVPYmplY3RcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBHcmFzcyBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5HcmFzcylcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyYXNzXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR3Jhc3NEZWNvcmF0ZTEgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFRleHR1cmUuR3Jhc3NEZWNvcmF0ZTEpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0dyYXNzRGVjb3JhdGUxJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyYXNzRGVjb3JhdGUxXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR3JvdW5kIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLkdyb3VuZClcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnR3JvdW5kJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyb3VuZFxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBJcm9uRmVuY2UgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIHN1cGVyKFRleHR1cmUuSXJvbkZlbmNlKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IElyb25GZW5jZVxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBSb290IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLlJvb3QpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm9vdFxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXHJcbmltcG9ydCBMaWdodCBmcm9tICcuLi9saWIvTGlnaHQnXHJcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcclxuXHJcbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcblxyXG5jbGFzcyBUb3JjaCBleHRlbmRzIEdhbWVPYmplY3Qge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKFRleHR1cmUuVG9yY2gpXHJcblxyXG4gICAgbGV0IHJhZGl1cyA9IDJcclxuXHJcbiAgICB0aGlzLm9uKCdhZGRlZCcsIExpZ2h0LmxpZ2h0T24uYmluZChudWxsLCB0aGlzLCByYWRpdXMsIDAuOTUpKVxyXG4gICAgdGhpcy5vbigncmVtb3ZlZWQnLCBMaWdodC5saWdodE9mZi5iaW5kKG51bGwsIHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICd0b3JjaCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvcmNoXHJcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xyXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXHJcblxyXG5pbXBvcnQgeyBSRVBMWSwgQUJJTElUWV9DQVJSWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCB7IGluc3RhbmNlQnlJdGVtSWQgfSBmcm9tICcuLi9saWIvdXRpbHMnXHJcblxyXG5jbGFzcyBTbG90IHtcclxuICBjb25zdHJ1Y3RvciAoW2l0ZW1JZCwgcGFyYW1zLCBjb3VudF0pIHtcclxuICAgIHRoaXMuaXRlbSA9IGluc3RhbmNlQnlJdGVtSWQoaXRlbUlkLCBwYXJhbXMpXHJcbiAgICB0aGlzLmNvdW50ID0gY291bnRcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiBbdGhpcy5pdGVtLnRvU3RyaW5nKCksICcoJywgdGhpcy5jb3VudCwgJyknXS5qb2luKCcnKVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgVHJlYXN1cmUgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAoaW52ZW50b3JpZXMgPSBbXSkge1xyXG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXHJcbiAgICBzdXBlcihUZXh0dXJlLlRyZWFzdXJlKVxyXG5cclxuICAgIHRoaXMuaW52ZW50b3JpZXMgPSBpbnZlbnRvcmllcy5tYXAodHJlYXN1cmUgPT4gbmV3IFNsb3QodHJlYXN1cmUpKVxyXG5cclxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFJFUExZIH1cclxuXHJcbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcclxuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBvcGVyYXRvcltBQklMSVRZX0NBUlJZXVxyXG4gICAgaWYgKCFjYXJyeUFiaWxpdHkpIHtcclxuICAgICAgb3BlcmF0b3Iuc2F5KCdJIGNhblxcJ3QgY2FycnkgaXRlbXMgbm90IHlldC4nKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmludmVudG9yaWVzLmZvckVhY2goXHJcbiAgICAgIHRyZWFzdXJlID0+IGNhcnJ5QWJpbGl0eS50YWtlKHRyZWFzdXJlLml0ZW0sIHRyZWFzdXJlLmNvdW50KSlcclxuICAgIG9wZXJhdG9yLnNheShbJ0kgdGFrZWQgJywgdGhpcy50b1N0cmluZygpXS5qb2luKCcnKSlcclxuXHJcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKVxyXG4gICAgdGhpcy5kZXN0cm95KClcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICd0cmVhc3VyZTogWycsXHJcbiAgICAgIHRoaXMuaW52ZW50b3JpZXMuam9pbignLCAnKSxcclxuICAgICAgJ10nXHJcbiAgICBdLmpvaW4oJycpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmVhc3VyZVxyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFRyZWUgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFRleHR1cmUuVHJlZSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmVlXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFdhbGwgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuV2FsbClcblxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxuXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XG4gICAgb3BlcmF0b3IuZW1pdCgnY29sbGlkZScsIHRoaXMpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdXYWxsJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdhbGxcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZLCBBQklMSVRZX0ZJUkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5pbXBvcnQgTGVhcm4gZnJvbSAnLi9hYmlsaXRpZXMvTGVhcm4nXG5pbXBvcnQgQ2FycnkgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FycnknXG5pbXBvcnQgRmlyZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9GaXJlJ1xuaW1wb3J0IEhlYWx0aCBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9IZWFsdGgnXG5pbXBvcnQgQnVsbGV0IGZyb20gJy4uL29iamVjdHMvQnVsbGV0J1xuXG5jbGFzcyBXYWxsU2hvb3RCb2x0IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLldhbGwpXG5cbiAgICBsZXQgY2FycnkgPSBuZXcgQ2FycnkoMylcbiAgICBuZXcgTGVhcm4oKS5jYXJyeUJ5KHRoaXMpXG4gICAgICAubGVhcm4obmV3IEZpcmUoWzMsIDNdKSlcbiAgICAgIC5sZWFybihjYXJyeSlcbiAgICAgIC5sZWFybihuZXcgSGVhbHRoKDEwKSlcblxuICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KClcbiAgICBjYXJyeS50YWtlKGJ1bGxldCwgSW5maW5pdHkpXG5cbiAgICB0aGlzLm9uKCdjb2xsaWRlJywgdGhpcy5hY3Rpb25XaXRoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbignZGllJywgdGhpcy5vbkRpZS5iaW5kKHRoaXMpKVxuICAgIHRoaXMub25jZSgnYWRkZWQnLCB0aGlzLnNldHVwLmJpbmQodGhpcykpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cblxuICBzZXR1cCAoKSB7XG4gICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHRoaXMucm90YXRlKE1hdGguUEkgLyAxMCwgdHJ1ZSlcblxuICAgICAgbGV0IHJhZCA9IHRoaXMucm90YXRpb25cbiAgICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZClcbiAgICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZCArIE1hdGguUEkgLyAyKVxuICAgICAgdGhpc1tBQklMSVRZX0ZJUkVdLmZpcmUocmFkICsgTWF0aC5QSSlcbiAgICAgIHRoaXNbQUJJTElUWV9GSVJFXS5maXJlKHJhZCArIE1hdGguUEkgLyAyICogMylcbiAgICB9LCAyMDApXG4gIH1cblxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xuICAgIG9wZXJhdG9yLmVtaXQoJ2NvbGxpZGUnLCB0aGlzKVxuICB9XG5cbiAgb25EaWUgKCkge1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcilcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKVxuICAgIHRoaXMuZGVzdHJveSgpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdXYWxsU2hvb3RCb2x0J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdhbGxTaG9vdEJvbHRcbiIsImNvbnN0IHR5cGUgPSBTeW1ib2woJ2FiaWxpdHknKVxuXG5jbGFzcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gdHlwZSB9XG5cbiAgZ2V0U2FtZVR5cGVBYmlsaXR5IChvd25lcikge1xuICAgIHJldHVybiBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXVxuICB9XG5cbiAgLy8g5piv5ZCm6ZyA572u5o+bXG4gIGhhc1RvUmVwbGFjZSAob3duZXIsIGFiaWxpdHlOZXcpIHtcbiAgICBsZXQgYWJpbGl0eU9sZCA9IHRoaXMuZ2V0U2FtZVR5cGVBYmlsaXR5KG93bmVyKVxuICAgIHJldHVybiAhYWJpbGl0eU9sZCB8fCBhYmlsaXR5TmV3LmlzQmV0dGVyKGFiaWxpdHlPbGQpXG4gIH1cblxuICAvLyDmlrDoiIrmr5TovINcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIGxldCBhYmlsaXR5T2xkID0gdGhpcy5nZXRTYW1lVHlwZUFiaWxpdHkob3duZXIpXG4gICAgaWYgKGFiaWxpdHlPbGQpIHtcbiAgICAgIC8vIGZpcnN0IGdldCB0aGlzIHR5cGUgYWJpbGl0eVxuICAgICAgYWJpbGl0eU9sZC5yZXBsYWNlZEJ5KHRoaXMsIG93bmVyKVxuICAgIH1cbiAgICBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXSA9IHRoaXNcbiAgfVxuXG4gIHJlcGxhY2VkQnkgKG90aGVyLCBvd25lcikge31cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgZGVsZXRlIG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdwbHogZXh0ZW5kIHRoaXMgY2xhc3MnXG4gIH1cblxuICBzZXJpYWxpemUgKCkge1xuICAgIHJldHVybiB7fVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFiaWxpdHlcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcclxuaW1wb3J0IExpZ2h0IGZyb20gJy4uLy4uL2xpYi9MaWdodCdcclxuaW1wb3J0IHsgQUJJTElUWV9DQU1FUkEgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuY2xhc3MgQ2FtZXJhIGV4dGVuZHMgQWJpbGl0eSB7XHJcbiAgY29uc3RydWN0b3IgKHZhbHVlKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnJhZGl1cyA9IHZhbHVlXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0NBTUVSQSB9XHJcblxyXG4gIGlzQmV0dGVyIChvdGhlcikge1xyXG4gICAgLy8g5Y+q5pyD6K6K5aSnXHJcbiAgICByZXR1cm4gdGhpcy5yYWRpdXMgPj0gb3RoZXIucmFkaXVzXHJcbiAgfVxyXG5cclxuICAvLyDphY3lgpnmraTmioDog71cclxuICBjYXJyeUJ5IChvd25lcikge1xyXG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcclxuICAgIGlmIChvd25lci5wYXJlbnQpIHtcclxuICAgICAgdGhpcy5zZXR1cChvd25lciwgb3duZXIucGFyZW50KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3duZXIub25jZSgnYWRkZWQnLCBjb250YWluZXIgPT4gdGhpcy5zZXR1cChvd25lciwgY29udGFpbmVyKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlcGxhY2VkQnkgKG90aGVyLCBvd25lcikge1xyXG4gICAgdGhpcy5kcm9wQnkob3duZXIpXHJcbiAgfVxyXG5cclxuICBzZXR1cCAob3duZXIsIGNvbnRhaW5lcikge1xyXG4gICAgTGlnaHQubGlnaHRPbihvd25lciwgdGhpcy5yYWRpdXMpXHJcbiAgICAvLyDlpoLmnpwgb3duZXIg5LiN6KKr6aGv56S6XHJcbiAgICBvd25lci5yZW1vdmVkID0gdGhpcy5vblJlbW92ZWQuYmluZCh0aGlzLCBvd25lcilcclxuICAgIG93bmVyLm9uY2UoJ3JlbW92ZWQnLCBvd25lci5yZW1vdmVkKVxyXG4gIH1cclxuXHJcbiAgb25SZW1vdmVkIChvd25lcikge1xyXG4gICAgdGhpcy5kcm9wQnkob3duZXIpXHJcbiAgICAvLyBvd25lciDph43mlrDooqvpoa/npLpcclxuICAgIG93bmVyLm9uY2UoJ2FkZGVkJywgY29udGFpbmVyID0+IHRoaXMuc2V0dXAob3duZXIsIGNvbnRhaW5lcikpXHJcbiAgfVxyXG5cclxuICBkcm9wQnkgKG93bmVyKSB7XHJcbiAgICBMaWdodC5saWdodE9mZihvd25lcilcclxuICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxyXG4gICAgb3duZXIub2ZmKCdyZW1vdmVkJywgb3duZXIucmVtb3ZlZClcclxuICAgIGRlbGV0ZSBvd25lci5yZW1vdmVkXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ2xpZ2h0IGFyZWE6ICcgKyB0aGlzLnJhZGl1c1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FtZXJhXHJcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfQ0FSUlksIEFCSUxJVFlfTEVBUk4gfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5mdW5jdGlvbiBuZXdTbG90IChpdGVtLCBjb3VudCkge1xuICByZXR1cm4ge1xuICAgIGl0ZW0sXG4gICAgY291bnQsXG4gICAgdG9TdHJpbmcgKCkge1xuICAgICAgcmV0dXJuIFtpdGVtLnRvU3RyaW5nKCksICcoJywgdGhpcy5jb3VudCwgJyknXS5qb2luKCcnKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDYXJyeSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAoaW5pdFNsb3RzKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuYmFncyA9IFtdXG4gICAgdGhpcy5iYWdzLnB1c2goQXJyYXkoaW5pdFNsb3RzKS5maWxsKCkpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0NBUlJZIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9DQVJSWV0gPSB0aGlzXG4gIH1cblxuICB0YWtlIChpdGVtLCBjb3VudCA9IDEpIHtcbiAgICBsZXQgb3duZXIgPSB0aGlzLm93bmVyXG4gICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBBYmlsaXR5ICYmIG93bmVyW0FCSUxJVFlfTEVBUk5dKSB7XG4gICAgICAvLyDlj5blvpfog73liptcbiAgICAgIG93bmVyW0FCSUxJVFlfTEVBUk5dLmxlYXJuKGl0ZW0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGtleSA9IGl0ZW0udG9TdHJpbmcoKVxuICAgIGxldCBmaXJzdEVtcHR5U2xvdFxuICAgIGxldCBmb3VuZCA9IHRoaXMuYmFncy5zb21lKChiYWcsIGJpKSA9PiB7XG4gICAgICByZXR1cm4gYmFnLnNvbWUoKHNsb3QsIHNpKSA9PiB7XG4gICAgICAgIC8vIOaaq+WtmOesrOS4gOWAi+epuuagvFxuICAgICAgICBpZiAoIXNsb3QgJiYgIWZpcnN0RW1wdHlTbG90KSB7XG4gICAgICAgICAgZmlyc3RFbXB0eVNsb3QgPSB7c2ksIGJpfVxuICAgICAgICB9XG4gICAgICAgIC8vIOeJqeWTgeeWiuWKoCjlkIzpoZ7lnospXG4gICAgICAgIGlmIChzbG90ICYmIHNsb3QuaXRlbS50b1N0cmluZygpID09PSBrZXkpIHtcbiAgICAgICAgICBzbG90LmNvdW50ICs9IGNvdW50XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0pXG4gICAgfSlcbiAgICBpZiAoIWZvdW5kKSB7XG4gICAgICBpZiAoIWZpcnN0RW1wdHlTbG90KSB7XG4gICAgICAgIC8vIOaykuacieepuuagvOWPr+aUvueJqeWTgVxuICAgICAgICBvd25lci5zYXkoJ25vIGVtcHR5IHNsb3QgZm9yIG5ldyBpdGVtIGdvdC4nKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIOaUvuWFpeesrOS4gOWAi+epuuagvFxuICAgICAgdGhpcy5iYWdzW2ZpcnN0RW1wdHlTbG90LmJpXVtmaXJzdEVtcHR5U2xvdC5zaV0gPSBuZXdTbG90KGl0ZW0sIGNvdW50KVxuICAgIH1cbiAgICBvd25lci5lbWl0KCdpbnZlbnRvcnktbW9kaWZpZWQnLCBpdGVtKVxuICB9XG5cbiAgZ2V0U2xvdEl0ZW0gKHNsb3RJbngpIHtcbiAgICBsZXQgYmlcbiAgICBsZXQgc2lcbiAgICAvLyDnhafokZfljIXljIXliqDlhaXpoIbluo/mn6Xmib5cbiAgICBsZXQgZm91bmQgPSB0aGlzLmJhZ3MuZmluZCgoYmFnLCBiKSA9PiB7XG4gICAgICBiaSA9IGJcbiAgICAgIHJldHVybiBiYWcuZmluZCgoc2xvdCwgcykgPT4ge1xuICAgICAgICBzaSA9IHNcbiAgICAgICAgcmV0dXJuIHNsb3RJbngtLSA9PT0gMFxuICAgICAgfSlcbiAgICB9KVxuICAgIGxldCBpdGVtXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICBmb3VuZCA9IHRoaXMuYmFnc1tiaV1bc2ldXG4gICAgICBpdGVtID0gZm91bmQuaXRlbVxuICAgICAgLy8g5Y+W5Ye65b6M5rib5LiAXG4gICAgICBpZiAoLS1mb3VuZC5jb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLmJhZ3NbYmldW3NpXSA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgdGhpcy5vd25lci5lbWl0KCdpbnZlbnRvcnktbW9kaWZpZWQnLCBpdGVtKVxuICAgIH1cbiAgICByZXR1cm4gaXRlbVxuICB9XG5cbiAgZ2V0SXRlbUJ5VHlwZSAodHlwZSkge1xuICAgIGxldCBiaVxuICAgIGxldCBzaVxuICAgIGxldCBmb3VuZCA9IHRoaXMuYmFncy5maW5kKChiYWcsIGIpID0+IHtcbiAgICAgIGJpID0gYlxuICAgICAgcmV0dXJuIGJhZy5maW5kKChzbG90LCBzKSA9PiB7XG4gICAgICAgIHNpID0gc1xuICAgICAgICByZXR1cm4gc2xvdCAmJiBzbG90Lml0ZW0gaW5zdGFuY2VvZiB0eXBlXG4gICAgICB9KVxuICAgIH0pXG4gICAgbGV0IGl0ZW1cbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIGZvdW5kID0gdGhpcy5iYWdzW2JpXVtzaV1cbiAgICAgIGl0ZW0gPSBmb3VuZC5pdGVtXG4gICAgICAvLyDlj5blh7rlvozmuJvkuIBcbiAgICAgIGlmICgtLWZvdW5kLmNvdW50ID09PSAwKSB7XG4gICAgICAgIHRoaXMuYmFnc1tiaV1bc2ldID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICB0aGlzLm93bmVyLmVtaXQoJ2ludmVudG9yeS1tb2RpZmllZCcsIGl0ZW0pXG4gICAgfVxuICAgIHJldHVybiBpdGVtXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIFsnY2Fycnk6ICcsIHRoaXMuYmFncy5qb2luKCcsICcpXS5qb2luKCcnKVxuICB9XG5cbiAgLy8gVE9ETzogc2F2ZSBkYXRhXG4gIHNlcmlhbGl6ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFnc1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhcnJ5XG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0ZJUkUsIEFCSUxJVFlfQ0FSUlksIEFCSUxJVFlfUk9UQVRFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuaW1wb3J0IFZlY3RvciBmcm9tICcuLi8uLi9saWIvVmVjdG9yJ1xuXG5jb25zdCBQSSA9IE1hdGguUElcblxuZnVuY3Rpb24gY2FsY0Fwb3RoZW0gKG8sIHJhZCkge1xuICBsZXQgd2lkdGggPSBvLndpZHRoIC8gMlxuICBsZXQgaGVpZ2h0ID0gby5oZWlnaHQgLyAyXG4gIGxldCByZWN0UmFkID0gTWF0aC5hdGFuMihoZWlnaHQsIHdpZHRoKVxuICBsZXQgbGVuXG4gIC8vIOWmguaenOWwhOWHuuinkuepv+mBjiB3aWR0aFxuICBsZXQgcjEgPSBNYXRoLmFicyhyYWQgJSBQSSlcbiAgbGV0IHIyID0gTWF0aC5hYnMocmVjdFJhZCAlIFBJKVxuICBpZiAocjEgPCByMiB8fCByMSA+IHIyICsgUEkgLyAyKSB7XG4gICAgbGVuID0gd2lkdGggLyBNYXRoLmNvcyhyYWQpXG4gIH0gZWxzZSB7XG4gICAgbGVuID0gaGVpZ2h0IC8gTWF0aC5zaW4ocmFkKVxuICB9XG4gIHJldHVybiBNYXRoLmFicyhsZW4pXG59XG5cbmNsYXNzIEZpcmUgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgY29uc3RydWN0b3IgKFsgcG93ZXIgXSkge1xuICAgIHN1cGVyKClcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnRcbiAgICB0aGlzLnBvd2VyID0gcG93ZXJcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfRklSRSB9XG5cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMub3duZXIgPSBvd25lclxuICAgIG93bmVyW0FCSUxJVFlfRklSRV0gPSB0aGlzXG4gIH1cblxuICBmaXJlIChyYWQgPSB1bmRlZmluZWQpIHtcbiAgICBsZXQgb3duZXIgPSB0aGlzLm93bmVyXG4gICAgbGV0IHNjYWxlID0gb3duZXIuc2NhbGUueFxuXG4gICAgbGV0IGNhcnJ5QWJpbGl0eSA9IG93bmVyW0FCSUxJVFlfQ0FSUlldXG4gICAgbGV0IEJ1bGxldFR5cGUgPSBjYXJyeUFiaWxpdHkuZ2V0SXRlbUJ5VHlwZShCdWxsZXQpXG4gICAgaWYgKCFCdWxsZXRUeXBlKSB7XG4gICAgICAvLyBubyBtb3JlIGJ1bGxldCBpbiBpbnZlbnRvcnlcbiAgICAgIGNvbnNvbGUubG9nKCdubyBtb3JlIGJ1bGxldCBpbiBpbnZlbnRvcnknKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0VHlwZS5jb25zdHJ1Y3RvcigpXG5cbiAgICAvLyBzZXQgZGlyZWN0aW9uXG4gICAgaWYgKHJhZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyDlpoLmnpzmspLmjIflrprmlrnlkJHvvIzlsLHnlKjnm67liY3pnaLlsI3mlrnlkJFcbiAgICAgIGxldCByb3RhdGVBYmlsaXR5ID0gb3duZXJbQUJJTElUWV9ST1RBVEVdXG4gICAgICByYWQgPSByb3RhdGVBYmlsaXR5ID8gcm90YXRlQWJpbGl0eS5mYWNlUmFkIDogMFxuICAgIH1cbiAgICBsZXQgdmVjdG9yID0gVmVjdG9yLmZyb21SYWRMZW5ndGgocmFkLCAxKVxuICAgIGJ1bGxldC5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlKVxuICAgIGJ1bGxldC5zZXRPd25lcihvd25lcilcblxuICAgIC8vIHNldCBwb3NpdGlvblxuICAgIGxldCByZWN0TGVuID0gY2FsY0Fwb3RoZW0ob3duZXIsIHJhZCArIG93bmVyLnJvdGF0aW9uKVxuICAgIGxldCBidWxsZXRMZW4gPSBidWxsZXQuaGVpZ2h0IC8gMiAvLyDlsITlh7rop5LnrYnmlrzoh6rouqvml4vop5LvvIzmiYDku6XlhY3ljrvpgYvnrpdcbiAgICBsZXQgbGVuID0gcmVjdExlbiArIGJ1bGxldExlblxuICAgIGxldCBwb3NpdGlvbiA9IFZlY3Rvci5mcm9tUmFkTGVuZ3RoKHJhZCwgbGVuKVxuICAgICAgLmFkZChWZWN0b3IuZnJvbVBvaW50KG93bmVyLnBvc2l0aW9uKSlcbiAgICBidWxsZXQucG9zaXRpb24uc2V0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpXG5cbiAgICBidWxsZXQub25jZSgnYWRkZWQnLCAoKSA9PiB7XG4gICAgICBidWxsZXQuc2V0RGlyZWN0aW9uKHZlY3RvcilcbiAgICAgIGJ1bGxldC5ib2R5LmlzU2Vuc29yID0gdHJ1ZVxuICAgIH0pXG5cbiAgICBvd25lci5lbWl0KCdmaXJlJywgYnVsbGV0KVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnRmlyZSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaXJlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0hFQUxUSCB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEhlYWx0aCBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAoaHAgPSAxKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaHAgPSBocFxuICAgIHRoaXMuaHBNYXggPSBocFxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9IRUFMVEggfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX0hFQUxUSF0gPSB0aGlzXG4gIH1cblxuICBnZXRIdXJ0IChodXJ0KSB7XG4gICAgbGV0IHByZUhwID0gdGhpcy5ocFxuICAgIHRoaXMuaHAgLT0gaHVydC5kYW1hZ2VcbiAgICBsZXQgc3VmSHAgPSB0aGlzLmhwXG4gICAgdGhpcy5vd25lci5zYXkoW1xuICAgICAgdGhpcy5vd25lci50b1N0cmluZygpLFxuICAgICAgJyBnZXQgaHVydCAnLFxuICAgICAgaHVydC5kYW1hZ2UsXG4gICAgICAnOiAnLFxuICAgICAgcHJlSHAsXG4gICAgICAnIC0+ICcsXG4gICAgICBzdWZIcFxuICAgIF0uam9pbignJykpXG4gICAgdGhpcy5vd25lci5lbWl0KCdoZWFsdGgtY2hhbmdlJylcbiAgICBpZiAodGhpcy5ocCA8PSAwKSB7XG4gICAgICB0aGlzLm93bmVyLmVtaXQoJ2RpZScpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbXG4gICAgICAnSGVhbHRoOiAnLFxuICAgICAgdGhpcy5ocCxcbiAgICAgICcgLyAnLFxuICAgICAgdGhpcy5ocE1heFxuICAgIF0uam9pbignJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBIZWFsdGhcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfRklSRSwgQUJJTElUWV9LRVlfRklSRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgZ2xvYmFsRXZlbnRNYW5hZ2VyIGZyb20gJy4uLy4uL2xpYi9nbG9iYWxFdmVudE1hbmFnZXInXG5cbmNsYXNzIEtleUZpcmUgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9LRVlfRklSRSB9XG5cbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMuc2V0dXAob3duZXIpXG4gIH1cblxuICBzZXR1cCAob3duZXIpIHtcbiAgICBsZXQgZmlyZUFiaWxpdHkgPSBvd25lcltBQklMSVRZX0ZJUkVdXG4gICAgbGV0IG1vdXNlSGFuZGxlciA9IGUgPT4ge1xuICAgICAgaWYgKGUuc3RvcHBlZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KCdmaXJlJylcbiAgICB9XG4gICAgbGV0IGZpcmVIYW5kbGVyID0gZmlyZUFiaWxpdHkuZmlyZS5iaW5kKGZpcmVBYmlsaXR5KVxuXG4gICAgb3duZXJbQUJJTElUWV9LRVlfRklSRV0gPSB7XG4gICAgICBtb3VzZWRvd246IG1vdXNlSGFuZGxlcixcbiAgICAgIGZpcmU6IGZpcmVIYW5kbGVyXG4gICAgfVxuICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW0FCSUxJVFlfS0VZX0ZJUkVdKS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLm9uKGV2ZW50TmFtZSwgaGFuZGxlcilcbiAgICB9KVxuICB9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIHN1cGVyLmRyb3BCeShvd25lcilcbiAgICBPYmplY3QuZW50cmllcyhvd25lcltBQklMSVRZX0tFWV9GSVJFXSkuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5vZmYoZXZlbnROYW1lLCBoYW5kbGVyKVxuICAgIH0pXG4gICAgZGVsZXRlIG93bmVyW0FCSUxJVFlfS0VZX0ZJUkVdXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdrZXkgZmlyZSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLZXlGaXJlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQga2V5Ym9hcmRKUyBmcm9tICdrZXlib2FyZGpzJ1xuaW1wb3J0IHsgTEVGVCwgVVAsIFJJR0hULCBET1dOIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnRyb2wnXG5pbXBvcnQgeyBBQklMSVRZX01PVkUsIEFCSUxJVFlfS0VZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IFZlY3RvciBmcm9tICcuLi8uLi9saWIvVmVjdG9yJ1xuXG5jbGFzcyBLZXlNb3ZlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfS0VZX01PVkUgfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLnNldHVwKG93bmVyKVxuICB9XG5cbiAgc2V0dXAgKG93bmVyKSB7XG4gICAgbGV0IGRpciA9IHt9XG4gICAgbGV0IGNhbGNEaXIgPSAoKSA9PiB7XG4gICAgICBsZXQgdmVjdG9yID0gbmV3IFZlY3RvcigtZGlyW0xFRlRdICsgZGlyW1JJR0hUXSwgLWRpcltVUF0gKyBkaXJbRE9XTl0pXG4gICAgICBvd25lcltBQklMSVRZX01PVkVdLmFkZERpcmVjdGlvbih2ZWN0b3IpXG4gICAgfVxuICAgIGxldCBiaW5kID0gY29kZSA9PiB7XG4gICAgICBkaXJbY29kZV0gPSAwXG4gICAgICBsZXQgcHJlSGFuZGxlciA9IGUgPT4ge1xuICAgICAgICBlLnByZXZlbnRSZXBlYXQoKVxuICAgICAgICBkaXJbY29kZV0gPSAxXG4gICAgICAgIG93bmVyW0FCSUxJVFlfTU9WRV0uY2xlYXJQYXRoKClcbiAgICAgIH1cbiAgICAgIGtleWJvYXJkSlMuYmluZChjb2RlLCBwcmVIYW5kbGVyLCAoKSA9PiB7XG4gICAgICAgIGRpcltjb2RlXSA9IDBcbiAgICAgIH0pXG4gICAgICByZXR1cm4gcHJlSGFuZGxlclxuICAgIH1cblxuICAgIGtleWJvYXJkSlMuc2V0Q29udGV4dCgnJylcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBvd25lcltBQklMSVRZX0tFWV9NT1ZFXSA9IHtcbiAgICAgICAgW0xFRlRdOiBiaW5kKExFRlQpLFxuICAgICAgICBbVVBdOiBiaW5kKFVQKSxcbiAgICAgICAgW1JJR0hUXTogYmluZChSSUdIVCksXG4gICAgICAgIFtET1dOXTogYmluZChET1dOKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoY2FsY0RpciwgMTcpXG4gIH1cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgc3VwZXIuZHJvcEJ5KG93bmVyKVxuICAgIGtleWJvYXJkSlMud2l0aENvbnRleHQoJycsICgpID0+IHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW0FCSUxJVFlfS0VZX01PVkVdKS5mb3JFYWNoKChba2V5LCBoYW5kbGVyXSkgPT4ge1xuICAgICAgICBrZXlib2FyZEpTLnVuYmluZChrZXksIGhhbmRsZXIpXG4gICAgICB9KVxuICAgIH0pXG4gICAgZGVsZXRlIG93bmVyW0FCSUxJVFlfS0VZX01PVkVdXG5cbiAgICBjbGVhckludGVydmFsKHRoaXMudGltZXIpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdrZXkgY29udHJvbCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLZXlNb3ZlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQga2V5Ym9hcmRKUyBmcm9tICdrZXlib2FyZGpzJ1xuaW1wb3J0IHsgUExBQ0UxLCBQTEFDRTIsIFBMQUNFMywgUExBQ0U0IH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnRyb2wnXG5pbXBvcnQgeyBBQklMSVRZX1BMQUNFLCBBQklMSVRZX0tFWV9QTEFDRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IFNMT1RTID0gW1xuICBQTEFDRTEsIFBMQUNFMiwgUExBQ0UzLCBQTEFDRTRcbl1cblxuY2xhc3MgS2V5UGxhY2UgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9LRVlfUExBQ0UgfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLnNldHVwKG93bmVyKVxuICB9XG5cbiAgc2V0dXAgKG93bmVyKSB7XG4gICAgbGV0IHBsYWNlQWJpbGl0eSA9IG93bmVyW0FCSUxJVFlfUExBQ0VdXG4gICAgbGV0IGJpbmQgPSBrZXkgPT4ge1xuICAgICAgbGV0IHNsb3RJbnggPSBTTE9UUy5pbmRleE9mKGtleSlcbiAgICAgIGxldCBoYW5kbGVyID0gZSA9PiB7XG4gICAgICAgIGUucHJldmVudFJlcGVhdCgpXG4gICAgICAgIHBsYWNlQWJpbGl0eS5wbGFjZShzbG90SW54KVxuICAgICAgfVxuICAgICAga2V5Ym9hcmRKUy5iaW5kKGtleSwgaGFuZGxlciwgKCkgPT4ge30pXG4gICAgICByZXR1cm4gaGFuZGxlclxuICAgIH1cblxuICAgIGtleWJvYXJkSlMuc2V0Q29udGV4dCgnJylcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBvd25lcltBQklMSVRZX0tFWV9QTEFDRV0gPSB7XG4gICAgICAgIFBMQUNFMTogYmluZChQTEFDRTEpLFxuICAgICAgICBQTEFDRTI6IGJpbmQoUExBQ0UyKSxcbiAgICAgICAgUExBQ0UzOiBiaW5kKFBMQUNFMyksXG4gICAgICAgIFBMQUNFNDogYmluZChQTEFDRTQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGRyb3BCeSAob3duZXIpIHtcbiAgICBzdXBlci5kcm9wQnkob3duZXIpXG4gICAga2V5Ym9hcmRKUy53aXRoQ29udGV4dCgnJywgKCkgPT4ge1xuICAgICAgT2JqZWN0LmVudHJpZXMob3duZXJbQUJJTElUWV9LRVlfUExBQ0VdKS5mb3JFYWNoKChba2V5LCBoYW5kbGVyXSkgPT4ge1xuICAgICAgICBrZXlib2FyZEpTLnVuYmluZChrZXksIGhhbmRsZXIpXG4gICAgICB9KVxuICAgIH0pXG4gICAgZGVsZXRlIG93bmVyW0FCSUxJVFlfS0VZX1BMQUNFXVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAna2V5IHBsYWNlJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEtleVBsYWNlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0xFQVJOIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgTGVhcm4gZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9MRUFSTiB9XG5cbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIGlmICghb3duZXIuYWJpbGl0aWVzKSB7XG4gICAgICBvd25lci5hYmlsaXRpZXMgPSB7fVxuICAgICAgb3duZXIudGlja0FiaWxpdGllcyA9IHt9XG4gICAgfVxuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9MRUFSTl0gPSB0aGlzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGxlYXJuIChhYmlsaXR5KSB7XG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxuICAgIGlmIChhYmlsaXR5Lmhhc1RvUmVwbGFjZShvd25lciwgYWJpbGl0eSkpIHtcbiAgICAgIGFiaWxpdHkuY2FycnlCeShvd25lcilcbiAgICAgIG93bmVyLmVtaXQoJ2FiaWxpdHktY2FycnknLCBhYmlsaXR5KVxuICAgIH1cbiAgICByZXR1cm4gb3duZXJbQUJJTElUWV9MRUFSTl1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2xlYXJuaW5nJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExlYXJuXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXHJcbmltcG9ydCB7IEFCSUxJVFlfTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vLi4vbGliL1ZlY3RvcidcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4uLy4uL2xpYi9NYXR0ZXInXHJcblxyXG5jb25zdCBESVNUQU5DRV9USFJFU0hPTEQgPSAxXHJcblxyXG5jbGFzcyBNb3ZlIGV4dGVuZHMgQWJpbGl0eSB7XHJcbiAgLyoqXHJcbiAgICog56e75YuV6IO95YqbXHJcbiAgICogQHBhcmFtICB7aW50fSB2YWx1ZSAgICDnp7vli5XpgJ/luqZcclxuICAgKiBAcGFyYW0gIHtmbG9hdH0gZnJpY3Rpb25BaXIgICAg56m66ZaT5pGp5pOm5YqbXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKFt2YWx1ZSwgZnJpY3Rpb25BaXJdKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcclxuICAgIHRoaXMuZnJpY3Rpb25BaXIgPSBmcmljdGlvbkFpclxyXG4gICAgdGhpcy52ZWN0b3IgPSBuZXcgVmVjdG9yKDAsIDApXHJcbiAgICB0aGlzLnBhdGggPSBbXVxyXG4gICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gdW5kZWZpbmVkXHJcbiAgICB0aGlzLmRpc3RhbmNlVGhyZXNob2xkID0gdGhpcy52YWx1ZSAqIERJU1RBTkNFX1RIUkVTSE9MRFxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9NT1ZFIH1cclxuXHJcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XHJcbiAgICAvLyDlj6rmnIPliqDlv6tcclxuICAgIHJldHVybiB0aGlzLnZhbHVlID4gb3RoZXIudmFsdWVcclxuICB9XHJcblxyXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxyXG4gIGNhcnJ5QnkgKG93bmVyKSB7XHJcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxyXG4gICAgdGhpcy5vd25lciA9IG93bmVyXHJcbiAgICBvd25lcltBQklMSVRZX01PVkVdID0gdGhpc1xyXG4gIH1cclxuXHJcbiAgcmVwbGFjZWRCeSAob3RoZXIsIG93bmVyKSB7XHJcbiAgICBvdGhlci52ZWN0b3IgPSB0aGlzLnZlY3RvclxyXG4gICAgb3RoZXIucGF0aCA9IHRoaXMucGF0aFxyXG4gICAgb3RoZXIubW92aW5nVG9Qb2ludCA9IHRoaXMubW92aW5nVG9Qb2ludFxyXG4gIH1cclxuXHJcbiAgLy8g6Kit5a6a5pa55ZCR5pyA5aSn6YCf5bqmXHJcbiAgc2V0RGlyZWN0aW9uICh2ZWN0b3IpIHtcclxuICAgIEJvZHkuc2V0VmVsb2NpdHkodGhpcy5vd25lci5ib2R5LCB2ZWN0b3Iuc2V0TGVuZ3RoKHRoaXMudmFsdWUpKVxyXG4gIH1cclxuXHJcbiAgLy8g5pa95LqI5YqbXHJcbiAgYWRkRGlyZWN0aW9uICh2ZWN0b3IsIGZvcmNlRGl2aWRlID0gMC4xNykge1xyXG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxyXG4gICAgaWYgKCFvd25lci5ib2R5KSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgQm9keS5hcHBseUZvcmNlKFxyXG4gICAgICBvd25lci5ib2R5LFxyXG4gICAgICBvd25lci5wb3NpdGlvbixcclxuICAgICAgdmVjdG9yLm11bHRpcGx5U2NhbGFyKHRoaXMudmFsdWUgKiBmb3JjZURpdmlkZSAvIDEwMDApKVxyXG4gIH1cclxuXHJcbiAgLy8g56e75YuV5Yiw6bueXHJcbiAgbW92ZVRvIChwb2ludCkge1xyXG4gICAgbGV0IHZlY3RvciA9IG5ldyBWZWN0b3IocG9pbnQueCAtIHRoaXMub3duZXIueCwgcG9pbnQueSAtIHRoaXMub3duZXIueSlcclxuICAgIHRoaXMuc2V0RGlyZWN0aW9uKHZlY3RvcilcclxuICB9XHJcblxyXG4gIC8vIOioreWumuenu+WLlei3r+W+kVxyXG4gIHNldFBhdGggKHBhdGgpIHtcclxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAvLyDmirXpgZTntYLpu55cclxuICAgICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gdW5kZWZpbmVkXHJcbiAgICAgIHRoaXMudmVjdG9yID0gbmV3IFZlY3RvcigwLCAwKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMucGF0aCA9IHBhdGhcclxuICAgIHRoaXMubW92aW5nVG9Qb2ludCA9IHBhdGgucG9wKClcclxuICAgIHRoaXMubW92ZVRvKHRoaXMubW92aW5nVG9Qb2ludClcclxuICB9XHJcblxyXG4gIGNsZWFyUGF0aCAoKSB7XHJcbiAgICB0aGlzLm1vdmluZ1RvUG9pbnQgPSB1bmRlZmluZWRcclxuICAgIHRoaXMucGF0aCA9IFtdXHJcbiAgfVxyXG5cclxuICBhZGRQYXRoIChwYXRoKSB7XHJcbiAgICB0aGlzLnNldFBhdGgocGF0aC5jb25jYXQodGhpcy5wYXRoKSlcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnbW92ZSBsZXZlbDogJyArIHRoaXMudmFsdWVcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vdmVcclxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9PUEVSQVRFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgT3BlcmF0ZSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5zZXQgPSBuZXcgU2V0KFt2YWx1ZV0pXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX09QRVJBVEUgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICBvd25lcltBQklMSVRZX09QRVJBVEVdID0gdGhpc1tBQklMSVRZX09QRVJBVEVdLmJpbmQodGhpcywgb3duZXIpXG4gICAgcmV0dXJuIG93bmVyW0FCSUxJVFlfT1BFUkFURV1cbiAgfVxuXG4gIHJlcGxhY2VkQnkgKG90aGVyKSB7XG4gICAgdGhpcy5zZXQuZm9yRWFjaChvdGhlci5zZXQuYWRkLmJpbmQob3RoZXIuc2V0KSlcbiAgfVxuXG4gIFtBQklMSVRZX09QRVJBVEVdIChvcGVyYXRvciwgdGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMuc2V0Lmhhcyh0YXJnZXQubWFwKSkge1xuICAgICAgb3BlcmF0b3Iuc2F5KG9wZXJhdG9yLnRvU3RyaW5nKCkgKyAnIHVzZSBhYmlsaXR5IHRvIG9wZW4gJyArIHRhcmdldC5tYXApXG4gICAgICB0YXJnZXRbdGhpcy50eXBlXSgpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbJ2tleXM6ICcsIEFycmF5LmZyb20odGhpcy5zZXQpLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0ZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9QTEFDRSwgQUJJTElUWV9DQVJSWSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFBsYWNlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfUExBQ0UgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX1BMQUNFXSA9IHRoaXNcbiAgfVxuXG4gIHBsYWNlIChzbG90SW54KSB7XG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBvd25lcltBQklMSVRZX0NBUlJZXVxuICAgIGxldCBpdGVtID0gY2FycnlBYmlsaXR5LmdldFNsb3RJdGVtKHNsb3RJbngpXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIG93bmVyLmVtaXQoJ3BsYWNlJywgbmV3IGl0ZW0uY29uc3RydWN0b3IoKSlcblxuICAgICAgbGV0IHBvc2l0aW9uID0gb3duZXIucG9zaXRpb25cbiAgICAgIG93bmVyLnNheShbJ3BsYWNlICcsIGl0ZW0udG9TdHJpbmcoKSwgJyBhdCAnLFxuICAgICAgICBbJygnLCBwb3NpdGlvbi54LnRvRml4ZWQoMCksICcsICcsIHBvc2l0aW9uLnkudG9GaXhlZCgwKSwgJyknXS5qb2luKCcnKV0uam9pbignJykpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAncGxhY2UnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxhY2VcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcclxuaW1wb3J0IHsgQUJJTElUWV9ST1RBVEUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXHJcbmltcG9ydCBnbG9iYWxFdmVudE1hbmFnZXIgZnJvbSAnLi4vLi4vbGliL2dsb2JhbEV2ZW50TWFuYWdlcidcclxuXHJcbmNvbnN0IE1PVVNFTU9WRSA9IFN5bWJvbCgnbW91c2Vtb3ZlJylcclxuXHJcbmNsYXNzIFJvdGF0ZSBleHRlbmRzIEFiaWxpdHkge1xyXG4gIGNvbnN0cnVjdG9yIChpbml0UmFkID0gMCkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5pbml0UmFkID0gaW5pdFJhZFxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9ST1RBVEUgfVxyXG5cclxuICBpc0JldHRlciAob3RoZXIpIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgZ2V0IGZhY2VSYWQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZhY2VSYWRcclxuICB9XHJcblxyXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxyXG4gIGNhcnJ5QnkgKG93bmVyKSB7XHJcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxyXG5cclxuICAgIHRoaXMub3duZXIgPSBvd25lclxyXG4gICAgb3duZXJbQUJJTElUWV9ST1RBVEVdID0gdGhpc1xyXG4gICAgb3duZXIuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICBsZXQgbW91c2VIYW5kbGVyID0gZSA9PiB7XHJcbiAgICAgIGxldCBvd25lclBvaW50ID0gdGhpcy5vd25lci5nZXRHbG9iYWxQb3NpdGlvbigpXHJcbiAgICAgIGxldCBwb2ludGVyID0gZS5kYXRhLmdsb2JhbFxyXG4gICAgICBsZXQgdmVjdG9yID0gbmV3IFZlY3RvcihcclxuICAgICAgICBwb2ludGVyLnggLSBvd25lclBvaW50LngsXHJcbiAgICAgICAgcG9pbnRlci55IC0gb3duZXJQb2ludC55KVxyXG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgncm90YXRlJywgdmVjdG9yKVxyXG4gICAgfVxyXG4gICAgbGV0IHJvdGF0ZUhhbmRsZXIgPSB0aGlzLnNldEZhY2VSYWQuYmluZCh0aGlzKVxyXG5cclxuICAgIG93bmVyW01PVVNFTU9WRV0gPSB7XHJcbiAgICAgIHJvdGF0ZTogcm90YXRlSGFuZGxlcixcclxuICAgICAgbW91c2Vtb3ZlOiBtb3VzZUhhbmRsZXJcclxuICAgIH1cclxuICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW01PVVNFTU9WRV0pLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XHJcbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5vbihldmVudE5hbWUsIGhhbmRsZXIpXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMuc2V0RmFjZVJhZChuZXcgVmVjdG9yKDAsIDApKVxyXG4gIH1cclxuXHJcbiAgZHJvcEJ5IChvd25lcikge1xyXG4gICAgc3VwZXIuZHJvcEJ5KG93bmVyKVxyXG4gICAgT2JqZWN0LmVudHJpZXMob3duZXJbTU9VU0VNT1ZFXSkuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcclxuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLm9mZihldmVudE5hbWUsIGhhbmRsZXIpXHJcbiAgICB9KVxyXG4gICAgZGVsZXRlIG93bmVyW01PVVNFTU9WRV1cclxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX1JPVEFURV1cclxuICB9XHJcblxyXG4gIHNldEZhY2VSYWQgKHZlY3Rvcikge1xyXG4gICAgdGhpcy5fZmFjZVJhZCA9IHZlY3Rvci5yYWQgLSB0aGlzLmluaXRSYWRcclxuICAgIHRoaXMub3duZXIucm90YXRlKHRoaXMuX2ZhY2VSYWQpXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ1JvdGF0ZSdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJvdGF0ZVxyXG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUsIGxvYWRlciB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbGliL1NjZW5lJ1xyXG5pbXBvcnQgUGxheVNjZW5lIGZyb20gJy4vUGxheVNjZW5lJ1xyXG5cclxubGV0IHRleHQgPSAnbG9hZGluZydcclxuXHJcbmNsYXNzIExvYWRpbmdTY2VuZSBleHRlbmRzIFNjZW5lIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5saWZlID0gMFxyXG4gIH1cclxuXHJcbiAgY3JlYXRlICgpIHtcclxuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xyXG4gICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxyXG4gICAgICBmb250U2l6ZTogMzYsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHN0cm9rZTogJyNmZjMzMDAnLFxyXG4gICAgICBzdHJva2VUaGlja25lc3M6IDQsXHJcbiAgICAgIGRyb3BTaGFkb3c6IHRydWUsXHJcbiAgICAgIGRyb3BTaGFkb3dDb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICBkcm9wU2hhZG93Qmx1cjogNCxcclxuICAgICAgZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcclxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlOiA2XHJcbiAgICB9KVxyXG4gICAgdGhpcy50ZXh0TG9hZGluZyA9IG5ldyBUZXh0KHRleHQsIHN0eWxlKVxyXG5cclxuICAgIC8vIEFkZCB0aGUgY2F0IHRvIHRoZSBzdGFnZVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRleHRMb2FkaW5nKVxyXG5cclxuICAgIC8vIGxvYWQgYW4gaW1hZ2UgYW5kIHJ1biB0aGUgYHNldHVwYCBmdW5jdGlvbiB3aGVuIGl0J3MgZG9uZVxyXG4gICAgbG9hZGVyXHJcbiAgICAgIC5hZGQoJ2ltYWdlcy90ZXJyYWluX2F0bGFzLmpzb24nKVxyXG4gICAgICAuYWRkKCdpbWFnZXMvYmFzZV9vdXRfYXRsYXMuanNvbicpXHJcbiAgICAgIC5hZGQoJ2ltYWdlcy9maXJlX2JvbHQucG5nJylcclxuICAgICAgLmxvYWQoKCkgPT4gdGhpcy5lbWl0KCdjaGFuZ2VTY2VuZScsIFBsYXlTY2VuZSwge1xyXG4gICAgICAgIG1hcEZpbGU6ICdXME4wJyxcclxuICAgICAgICBwb3NpdGlvbjogWzYsIDEyXVxyXG4gICAgICB9KSlcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICB0aGlzLmxpZmUgKz0gZGVsdGEgLyAzMCAvLyBibGVuZCBzcGVlZFxyXG4gICAgdGhpcy50ZXh0TG9hZGluZy50ZXh0ID0gdGV4dCArIEFycmF5KE1hdGguZmxvb3IodGhpcy5saWZlKSAlIDQgKyAxKS5qb2luKCcuJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExvYWRpbmdTY2VuZVxyXG4iLCJpbXBvcnQgeyBsb2FkZXIsIHJlc291cmNlcywgZGlzcGxheSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbGliL1NjZW5lJ1xyXG5pbXBvcnQgTWFwIGZyb20gJy4uL2xpYi9NYXAnXHJcbmltcG9ydCB7IElTX01PQklMRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcblxyXG5pbXBvcnQgQ2F0IGZyb20gJy4uL29iamVjdHMvQ2F0J1xyXG5cclxuaW1wb3J0IE1lc3NhZ2VXaW5kb3cgZnJvbSAnLi4vdWkvTWVzc2FnZVdpbmRvdydcclxuaW1wb3J0IFBsYXllcldpbmRvdyBmcm9tICcuLi91aS9QbGF5ZXJXaW5kb3cnXHJcbmltcG9ydCBJbnZlbnRvcnlXaW5kb3cgZnJvbSAnLi4vdWkvSW52ZW50b3J5V2luZG93J1xyXG5pbXBvcnQgVG91Y2hEaXJlY3Rpb25Db250cm9sUGFuZWwgZnJvbSAnLi4vdWkvVG91Y2hEaXJlY3Rpb25Db250cm9sUGFuZWwnXHJcbmltcG9ydCBUb3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCBmcm9tICcuLi91aS9Ub3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCdcclxuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xyXG5cclxubGV0IHNjZW5lV2lkdGhcclxubGV0IHNjZW5lSGVpZ2h0XHJcblxyXG5mdW5jdGlvbiBnZXRNZXNzYWdlV2luZG93T3B0ICgpIHtcclxuICBsZXQgb3B0ID0ge31cclxuICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoXHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyAzMFxyXG4gICAgb3B0LnNjcm9sbEJhcldpZHRoID0gNTBcclxuICAgIG9wdC5zY3JvbGxCYXJNaW5IZWlnaHQgPSA3MFxyXG4gIH0gZWxzZSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIDwgNDAwID8gc2NlbmVXaWR0aCA6IHNjZW5lV2lkdGggLyAyXHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyA2MFxyXG4gIH1cclxuICBvcHQuaGVpZ2h0ID0gc2NlbmVIZWlnaHQgLyA2XHJcbiAgb3B0LnggPSAwXHJcbiAgb3B0LnkgPSBzY2VuZUhlaWdodCAtIG9wdC5oZWlnaHRcclxuXHJcbiAgcmV0dXJuIG9wdFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQbGF5ZXJXaW5kb3dPcHQgKHBsYXllcikge1xyXG4gIGxldCBvcHQgPSB7XHJcbiAgICBwbGF5ZXJcclxuICB9XHJcbiAgb3B0LnggPSAwXHJcbiAgb3B0LnkgPSAwXHJcbiAgaWYgKElTX01PQklMRSkge1xyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aCAvIDRcclxuICAgIG9wdC5oZWlnaHQgPSBzY2VuZUhlaWdodCAvIDZcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDEwXHJcbiAgfSBlbHNlIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggPCA0MDAgPyBzY2VuZVdpZHRoIC8gMiA6IHNjZW5lV2lkdGggLyA0XHJcbiAgICBvcHQuaGVpZ2h0ID0gc2NlbmVIZWlnaHQgLyAzXHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyAyMFxyXG4gIH1cclxuICByZXR1cm4gb3B0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEludmVudG9yeVdpbmRvd09wdCAocGxheWVyKSB7XHJcbiAgbGV0IG9wdCA9IHtcclxuICAgIHBsYXllclxyXG4gIH1cclxuICBvcHQueSA9IDBcclxuICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIC8gNlxyXG4gIH0gZWxzZSB7XHJcbiAgICBsZXQgZGl2aWRlID0gc2NlbmVXaWR0aCA8IDQwMCA/IDYgOiBzY2VuZVdpZHRoIDwgODAwID8gMTIgOiAyMFxyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aCAvIGRpdmlkZVxyXG4gIH1cclxuICBvcHQueCA9IHNjZW5lV2lkdGggLSBvcHQud2lkdGhcclxuICByZXR1cm4gb3B0XHJcbn1cclxuXHJcbmNsYXNzIFBsYXlTY2VuZSBleHRlbmRzIFNjZW5lIHtcclxuICBjb25zdHJ1Y3RvciAoeyBtYXBGaWxlLCBwb3NpdGlvbiB9KSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5tYXBGaWxlID0gbWFwRmlsZVxyXG4gICAgdGhpcy50b1Bvc2l0aW9uID0gcG9zaXRpb25cclxuICAgIHRoaXMuZ3JvdXAuZW5hYmxlU29ydCA9IHRydWVcclxuICB9XHJcblxyXG4gIGNyZWF0ZSAoKSB7XHJcbiAgICBzY2VuZVdpZHRoID0gdGhpcy5wYXJlbnQud2lkdGhcclxuICAgIHNjZW5lSGVpZ2h0ID0gdGhpcy5wYXJlbnQuaGVpZ2h0XHJcbiAgICB0aGlzLmlzTWFwTG9hZGVkID0gZmFsc2VcclxuICAgIHRoaXMubG9hZE1hcCgpXHJcbiAgICB0aGlzLmluaXRQbGF5ZXIoKVxyXG4gICAgdGhpcy5pbml0VWkoKVxyXG4gICAgLy8gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgLy8gICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgnZmlyZScpXHJcbiAgICAvLyB9LCAxMDApXHJcbiAgfVxyXG5cclxuICBpbml0VWkgKCkge1xyXG4gICAgbGV0IHVpR3JvdXAgPSBuZXcgZGlzcGxheS5Hcm91cCgxLCB0cnVlKVxyXG4gICAgbGV0IHVpTGF5ZXIgPSBuZXcgZGlzcGxheS5MYXllcih1aUdyb3VwKVxyXG4gICAgdWlMYXllci5wYXJlbnRMYXllciA9IHRoaXNcclxuICAgIHRoaXMuYWRkQ2hpbGQodWlMYXllcilcclxuXHJcbiAgICBsZXQgbWVzc2FnZVdpbmRvdyA9IG5ldyBNZXNzYWdlV2luZG93KGdldE1lc3NhZ2VXaW5kb3dPcHQoKSlcclxuICAgIGxldCBwbGF5ZXJXaW5kb3cgPSBuZXcgUGxheWVyV2luZG93KGdldFBsYXllcldpbmRvd09wdCh0aGlzLmNhdCkpXHJcbiAgICBsZXQgaW52ZW50b3J5V2luZG93ID0gbmV3IEludmVudG9yeVdpbmRvdyhnZXRJbnZlbnRvcnlXaW5kb3dPcHQodGhpcy5jYXQpKVxyXG5cclxuICAgIC8vIOiuk1VJ6aGv56S65Zyo6aCC5bGkXHJcbiAgICBtZXNzYWdlV2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgcGxheWVyV2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgaW52ZW50b3J5V2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgdWlMYXllci5hZGRDaGlsZChtZXNzYWdlV2luZG93KVxyXG4gICAgdWlMYXllci5hZGRDaGlsZChwbGF5ZXJXaW5kb3cpXHJcbiAgICB1aUxheWVyLmFkZENoaWxkKGludmVudG9yeVdpbmRvdylcclxuXHJcbiAgICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICAgIC8vIOWPquacieaJi+apn+imgeinuOaOp+adv1xyXG4gICAgICAvLyDmlrnlkJHmjqfliLZcclxuICAgICAgbGV0IGRpcmVjdGlvblBhbmVsID0gbmV3IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsKHtcclxuICAgICAgICB4OiBzY2VuZVdpZHRoIC8gNCxcclxuICAgICAgICB5OiBzY2VuZUhlaWdodCAqIDQgLyA2LFxyXG4gICAgICAgIHJhZGl1czogc2NlbmVXaWR0aCAvIDhcclxuICAgICAgfSlcclxuICAgICAgZGlyZWN0aW9uUGFuZWwucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcblxyXG4gICAgICAvLyDmk43kvZzmjqfliLZcclxuICAgICAgbGV0IG9wZXJhdGlvblBhbmVsID0gbmV3IFRvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsKHtcclxuICAgICAgICB4OiBzY2VuZVdpZHRoIC8gNSAqIDMsXHJcbiAgICAgICAgeTogc2NlbmVIZWlnaHQgLyA1ICogMyxcclxuICAgICAgICB3aWR0aDogc2NlbmVXaWR0aCAvIDMsXHJcbiAgICAgICAgaGVpZ2h0OiBzY2VuZUhlaWdodCAvIDVcclxuICAgICAgfSlcclxuICAgICAgb3BlcmF0aW9uUGFuZWwucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcblxyXG4gICAgICB1aUxheWVyLmFkZENoaWxkKGRpcmVjdGlvblBhbmVsKVxyXG4gICAgICB1aUxheWVyLmFkZENoaWxkKG9wZXJhdGlvblBhbmVsKVxyXG4gICAgICAvLyByZXF1aXJlKCcuLi9saWIvZGVtbycpXHJcbiAgICB9XHJcbiAgICBtZXNzYWdlV2luZG93LmFkZChbJ3NjZW5lIHNpemU6ICgnLCBzY2VuZVdpZHRoLCAnLCAnLCBzY2VuZUhlaWdodCwgJykuJ10uam9pbignJykpXHJcbiAgfVxyXG5cclxuICBpbml0UGxheWVyICgpIHtcclxuICAgIGlmICghdGhpcy5jYXQpIHtcclxuICAgICAgdGhpcy5jYXQgPSBuZXcgQ2F0KClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxvYWRNYXAgKCkge1xyXG4gICAgbGV0IGZpbGVOYW1lID0gJ3dvcmxkLycgKyB0aGlzLm1hcEZpbGVcclxuXHJcbiAgICAvLyBpZiBtYXAgbm90IGxvYWRlZCB5ZXRcclxuICAgIGlmICghcmVzb3VyY2VzW2ZpbGVOYW1lXSkge1xyXG4gICAgICBsb2FkZXJcclxuICAgICAgICAuYWRkKGZpbGVOYW1lLCBmaWxlTmFtZSArICcuanNvbicpXHJcbiAgICAgICAgLmxvYWQodGhpcy5zcGF3bk1hcC5iaW5kKHRoaXMsIGZpbGVOYW1lKSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3Bhd25NYXAoZmlsZU5hbWUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzcGF3bk1hcCAoZmlsZU5hbWUpIHtcclxuICAgIGxldCBtYXBHcm91cCA9IG5ldyBkaXNwbGF5Lkdyb3VwKDAsIHRydWUpXHJcbiAgICBsZXQgbWFwTGF5ZXIgPSBuZXcgZGlzcGxheS5MYXllcihtYXBHcm91cClcclxuICAgIG1hcExheWVyLnBhcmVudExheWVyID0gdGhpc1xyXG4gICAgbWFwTGF5ZXIuZ3JvdXAuZW5hYmxlU29ydCA9IHRydWVcclxuICAgIHRoaXMuYWRkQ2hpbGQobWFwTGF5ZXIpXHJcblxyXG4gICAgbGV0IG1hcERhdGEgPSByZXNvdXJjZXNbZmlsZU5hbWVdLmRhdGFcclxuICAgIGxldCBtYXBTY2FsZSA9IElTX01PQklMRSA/IDIgOiAwLjVcclxuXHJcbiAgICBsZXQgbWFwID0gbmV3IE1hcChtYXBTY2FsZSlcclxuICAgIG1hcExheWVyLmFkZENoaWxkKG1hcClcclxuICAgIG1hcC5sb2FkKG1hcERhdGEpXHJcblxyXG4gICAgbWFwLm9uKCd1c2UnLCBvID0+IHtcclxuICAgICAgdGhpcy5pc01hcExvYWRlZCA9IGZhbHNlXHJcbiAgICAgIC8vIGNsZWFyIG9sZCBtYXBcclxuICAgICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLm1hcClcclxuICAgICAgdGhpcy5tYXAuZGVzdHJveSgpXHJcblxyXG4gICAgICB0aGlzLm1hcEZpbGUgPSBvLm1hcFxyXG4gICAgICB0aGlzLnRvUG9zaXRpb24gPSBvLnRvUG9zaXRpb25cclxuICAgICAgdGhpcy5sb2FkTWFwKClcclxuICAgIH0pXHJcblxyXG4gICAgbWFwLmFkZFBsYXllcih0aGlzLmNhdCwgdGhpcy50b1Bvc2l0aW9uKVxyXG4gICAgdGhpcy5tYXAgPSBtYXBcclxuXHJcbiAgICB0aGlzLmlzTWFwTG9hZGVkID0gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgdGljayAoZGVsdGEpIHtcclxuICAgIGlmICghdGhpcy5pc01hcExvYWRlZCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMubWFwLnRpY2soZGVsdGEpXHJcbiAgICAvLyBGSVhNRTogZ2FwIGJldHdlZW4gdGlsZXMgb24gaVBob25lIFNhZmFyaVxyXG4gICAgdGhpcy5tYXAucG9zaXRpb24uc2V0KFxyXG4gICAgICBNYXRoLmZsb29yKHNjZW5lV2lkdGggLyAyIC0gdGhpcy5jYXQueCksXHJcbiAgICAgIE1hdGguZmxvb3Ioc2NlbmVIZWlnaHQgLyAyIC0gdGhpcy5jYXQueSlcclxuICAgIClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYXlTY2VuZVxyXG4iLCJpbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcywgVGV4dCwgVGV4dFN0eWxlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgeyBBQklMSVRZX0NBUlJZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgU2xvdCBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxuXG4gICAgbGV0IHJlY3QgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHJlY3QuYmVnaW5GaWxsKDB4QTJBMkEyKVxuICAgIHJlY3QuZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDUpXG4gICAgcmVjdC5lbmRGaWxsKClcbiAgICB0aGlzLmFkZENoaWxkKHJlY3QpXG4gIH1cblxuICBzZXRDb250ZXh0IChpdGVtLCBjb3VudCkge1xuICAgIHRoaXMuY2xlYXJDb250ZXh0KClcblxuICAgIGxldCB3aWR0aCA9IHRoaXMud2lkdGhcbiAgICBsZXQgaGVpZ2h0ID0gdGhpcy5oZWlnaHRcbiAgICAvLyDnva7kuK1cbiAgICBpdGVtID0gbmV3IGl0ZW0uY29uc3RydWN0b3IoKVxuICAgIGxldCBtYXhTaWRlID0gTWF0aC5tYXgoaXRlbS53aWR0aCwgaXRlbS5oZWlnaHQpXG4gICAgbGV0IHNjYWxlID0gd2lkdGggLyBtYXhTaWRlXG4gICAgaXRlbS5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlKVxuICAgIGl0ZW0uYW5jaG9yLnNldCgwLjUsIDAuNSlcbiAgICBpdGVtLnBvc2l0aW9uLnNldCh3aWR0aCAvIDIsIGhlaWdodCAvIDIpXG4gICAgdGhpcy5hZGRDaGlsZChpdGVtKVxuXG4gICAgLy8g5pW46YePXG4gICAgbGV0IGZvbnRTaXplID0gdGhpcy53aWR0aCAqIDAuM1xuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgZmlsbDogJ3JlZCcsXG4gICAgICBmb250V2VpZ2h0OiAnNjAwJyxcbiAgICAgIGxpbmVIZWlnaHQ6IGZvbnRTaXplXG4gICAgfSlcbiAgICBsZXQgY291bnRUZXh0ID0gY291bnQgPT09IEluZmluaXR5ID8gJ+KInicgOiBjb3VudFxuICAgIGxldCB0ZXh0ID0gbmV3IFRleHQoY291bnRUZXh0LCBzdHlsZSlcbiAgICB0ZXh0LnBvc2l0aW9uLnNldCh3aWR0aCAqIDAuOTUsIGhlaWdodClcbiAgICB0ZXh0LmFuY2hvci5zZXQoMSwgMSlcbiAgICB0aGlzLmFkZENoaWxkKHRleHQpXG5cbiAgICB0aGlzLml0ZW0gPSBpdGVtXG4gICAgdGhpcy50ZXh0ID0gdGV4dFxuICB9XG5cbiAgY2xlYXJDb250ZXh0ICgpIHtcbiAgICBpZiAodGhpcy5pdGVtKSB7XG4gICAgICB0aGlzLml0ZW0uZGVzdHJveSgpXG4gICAgICB0aGlzLnRleHQuZGVzdHJveSgpXG4gICAgICBkZWxldGUgdGhpcy5pdGVtXG4gICAgICBkZWxldGUgdGhpcy50ZXh0XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEludmVudG9yeVdpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBsZXQgeyBwbGF5ZXIsIHdpZHRoIH0gPSBvcHRcbiAgICBsZXQgcGFkZGluZyA9IHdpZHRoICogMC4xXG4gICAgbGV0IGNlaWxTaXplID0gd2lkdGggLSBwYWRkaW5nICogMlxuICAgIGxldCBjZWlsT3B0ID0ge1xuICAgICAgeDogcGFkZGluZyxcbiAgICAgIHk6IHBhZGRpbmcsXG4gICAgICB3aWR0aDogY2VpbFNpemUsXG4gICAgICBoZWlnaHQ6IGNlaWxTaXplXG4gICAgfVxuICAgIGxldCBzbG90Q291bnQgPSA0XG4gICAgb3B0LmhlaWdodCA9ICh3aWR0aCAtIHBhZGRpbmcpICogc2xvdENvdW50ICsgcGFkZGluZ1xuXG4gICAgc3VwZXIob3B0KVxuXG4gICAgdGhpcy5fb3B0ID0gb3B0XG4gICAgcGxheWVyLm9uKCdpbnZlbnRvcnktbW9kaWZpZWQnLCB0aGlzLm9uSW52ZW50b3J5TW9kaWZpZWQuYmluZCh0aGlzLCBwbGF5ZXIpKVxuXG4gICAgdGhpcy5zbG90Q29udGFpbmVycyA9IFtdXG4gICAgdGhpcy5zbG90cyA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbG90Q291bnQ7IGkrKykge1xuICAgICAgbGV0IHNsb3QgPSBuZXcgU2xvdChjZWlsT3B0KVxuICAgICAgdGhpcy5hZGRDaGlsZChzbG90KVxuICAgICAgdGhpcy5zbG90Q29udGFpbmVycy5wdXNoKHNsb3QpXG4gICAgICBjZWlsT3B0LnkgKz0gY2VpbFNpemUgKyBwYWRkaW5nXG4gICAgfVxuXG4gICAgdGhpcy5vbkludmVudG9yeU1vZGlmaWVkKHBsYXllcilcbiAgfVxuXG4gIG9uSW52ZW50b3J5TW9kaWZpZWQgKHBsYXllcikge1xuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBwbGF5ZXJbQUJJTElUWV9DQVJSWV1cbiAgICBpZiAoIWNhcnJ5QWJpbGl0eSkge1xuICAgICAgLy8gbm8gaW52ZW50b3J5IHlldFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBpID0gMFxuICAgIGNhcnJ5QWJpbGl0eS5iYWdzLmZvckVhY2goYmFnID0+IGJhZy5mb3JFYWNoKHNsb3QgPT4ge1xuICAgICAgdGhpcy5zbG90c1tpXSA9IHNsb3RcbiAgICAgIGkrK1xuICAgIH0pKVxuICAgIHRoaXMuc2xvdENvbnRhaW5lcnMuZm9yRWFjaCgoY29udGFpbmVyLCBpKSA9PiB7XG4gICAgICBsZXQgc2xvdCA9IHRoaXMuc2xvdHNbaV1cbiAgICAgIGlmIChzbG90KSB7XG4gICAgICAgIGNvbnRhaW5lci5zZXRDb250ZXh0KHNsb3QuaXRlbSwgc2xvdC5jb3VudClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRhaW5lci5jbGVhckNvbnRleHQoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW52ZW50b3J5V2luZG93XG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcblxuaW1wb3J0IFNjcm9sbGFibGVXaW5kb3cgZnJvbSAnLi9TY3JvbGxhYmxlV2luZG93J1xuaW1wb3J0IG1lc3NhZ2VzIGZyb20gJy4uL2xpYi9NZXNzYWdlcydcblxuY2xhc3MgTWVzc2FnZVdpbmRvdyBleHRlbmRzIFNjcm9sbGFibGVXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIob3B0KVxuXG4gICAgbGV0IHsgZm9udFNpemUgPSAxMiB9ID0gb3B0XG5cbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgIGZpbGw6ICdncmVlbicsXG4gICAgICBicmVha1dvcmRzOiB0cnVlLFxuICAgICAgd29yZFdyYXA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoOiB0aGlzLndpbmRvd1dpZHRoXG4gICAgfSlcbiAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KCcnLCBzdHlsZSlcblxuICAgIHRoaXMuYWRkV2luZG93Q2hpbGQodGV4dClcbiAgICB0aGlzLnRleHQgPSB0ZXh0XG5cbiAgICB0aGlzLmF1dG9TY3JvbGxUb0JvdHRvbSA9IHRydWVcblxuICAgIG1lc3NhZ2VzLm9uKCdtb2RpZmllZCcsIHRoaXMubW9kaWZpZWQuYmluZCh0aGlzKSlcbiAgfVxuXG4gIG1vZGlmaWVkICgpIHtcbiAgICBsZXQgc2Nyb2xsUGVyY2VudCA9IHRoaXMuc2Nyb2xsUGVyY2VudFxuICAgIHRoaXMudGV4dC50ZXh0ID0gW10uY29uY2F0KG1lc3NhZ2VzLmxpc3QpLnJldmVyc2UoKS5qb2luKCdcXG4nKVxuICAgIHRoaXMudXBkYXRlU2Nyb2xsQmFyTGVuZ3RoKClcblxuICAgIC8vIOiLpXNjcm9sbOe9ruW6le+8jOiHquWLleaNsuWLlee9ruW6lVxuICAgIGlmIChzY3JvbGxQZXJjZW50ID09PSAxKSB7XG4gICAgICB0aGlzLnNjcm9sbFRvKDEpXG4gICAgfVxuICB9XG5cbiAgYWRkIChtc2cpIHtcbiAgICBtZXNzYWdlcy5hZGQobXNnKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnbWVzc2FnZS13aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZVdpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcbmltcG9ydCBWYWx1ZUJhciBmcm9tICcuL1ZhbHVlQmFyJ1xuXG5pbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IHsgQUJJTElUWV9NT1ZFLCBBQklMSVRZX0NBTUVSQSwgQUJJTElUWV9IRUFMVEggfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jb25zdCBBQklMSVRJRVNfQUxMID0gW1xuICBBQklMSVRZX01PVkUsXG4gIEFCSUxJVFlfQ0FNRVJBLFxuICBBQklMSVRZX0hFQUxUSFxuXVxuXG5jbGFzcyBQbGF5ZXJXaW5kb3cgZXh0ZW5kcyBXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIob3B0KVxuICAgIGxldCB7IHBsYXllciB9ID0gb3B0XG4gICAgdGhpcy5fb3B0ID0gb3B0XG5cbiAgICB0aGlzLnJlbmRlckhlYWx0aEJhcih7eDogNSwgeTogNX0pXG4gICAgdGhpcy5yZW5kZXJBYmlsaXR5KHt4OiA1LCB5OiAyMH0pXG5cbiAgICB0aGlzLm9uQWJpbGl0eUNhcnJ5KHBsYXllcilcblxuICAgIHBsYXllci5vbignYWJpbGl0eS1jYXJyeScsIHRoaXMub25BYmlsaXR5Q2FycnkuYmluZCh0aGlzLCBwbGF5ZXIpKVxuICAgIHBsYXllci5vbignaGVhbHRoLWNoYW5nZScsIHRoaXMub25IZWFsdGhDaGFuZ2UuYmluZCh0aGlzLCBwbGF5ZXIpKVxuICB9XG5cbiAgcmVuZGVyQWJpbGl0eSAoe3gsIHl9KSB7XG4gICAgbGV0IGFiaWxpdHlUZXh0Q29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpXG4gICAgYWJpbGl0eVRleHRDb250YWluZXIucG9zaXRpb24uc2V0KHgsIHkpXG4gICAgdGhpcy5hZGRDaGlsZChhYmlsaXR5VGV4dENvbnRhaW5lcilcbiAgICB0aGlzLmFiaWxpdHlUZXh0Q29udGFpbmVyID0gYWJpbGl0eVRleHRDb250YWluZXJcbiAgfVxuXG4gIHJlbmRlckhlYWx0aEJhciAoe3gsIHl9KSB7XG4gICAgbGV0IHt3aWR0aH0gPSB0aGlzLl9vcHRcbiAgICB3aWR0aCAvPSAyXG4gICAgbGV0IGhlaWdodCA9IDEwXG4gICAgbGV0IGNvbG9yID0gMHhEMjMyMDBcbiAgICBsZXQgaGVhbHRoQmFyID0gbmV3IFZhbHVlQmFyKHt4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb2xvcn0pXG5cbiAgICB0aGlzLmFkZENoaWxkKGhlYWx0aEJhcilcblxuICAgIHRoaXMuaGVhbHRoQmFyID0gaGVhbHRoQmFyXG4gIH1cblxuICBvbkFiaWxpdHlDYXJyeSAocGxheWVyKSB7XG4gICAgbGV0IGkgPSAwXG4gICAgbGV0IHsgZm9udFNpemUgPSAxMCB9ID0gdGhpcy5fb3B0XG4gICAgbGV0IHN0eWxlID0gbmV3IFRleHRTdHlsZSh7XG4gICAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgbGluZUhlaWdodDogZm9udFNpemVcbiAgICB9KVxuXG4gICAgLy8g5pu05paw6Z2i5p2/5pW45pOaXG4gICAgbGV0IGNvbnRpYW5lciA9IHRoaXMuYWJpbGl0eVRleHRDb250YWluZXJcbiAgICBjb250aWFuZXIucmVtb3ZlQ2hpbGRyZW4oKVxuICAgIEFCSUxJVElFU19BTEwuZm9yRWFjaChhYmlsaXR5U3ltYm9sID0+IHtcbiAgICAgIGxldCBhYmlsaXR5ID0gcGxheWVyLmFiaWxpdGllc1thYmlsaXR5U3ltYm9sXVxuICAgICAgaWYgKGFiaWxpdHkpIHtcbiAgICAgICAgbGV0IHRleHQgPSBuZXcgVGV4dChhYmlsaXR5LnRvU3RyaW5nKCksIHN0eWxlKVxuICAgICAgICB0ZXh0LnkgPSBpICogKGZvbnRTaXplICsgNSlcblxuICAgICAgICBjb250aWFuZXIuYWRkQ2hpbGQodGV4dClcblxuICAgICAgICBpKytcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgb25IZWFsdGhDaGFuZ2UgKHBsYXllcikge1xuICAgIGxldCBoZWFsdGhBYmlsaXR5ID0gcGxheWVyW0FCSUxJVFlfSEVBTFRIXVxuICAgIGlmICghaGVhbHRoQWJpbGl0eSkge1xuICAgICAgdGhpcy5oZWFsdGhCYXIudmlzaWJsZSA9IGZhbHNlXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCF0aGlzLmhlYWx0aEJhci52aXNpYmxlKSB7XG4gICAgICB0aGlzLmhlYWx0aEJhci52aXNpYmxlID0gdHJ1ZVxuICAgIH1cbiAgICB0aGlzLmhlYWx0aEJhci5lbWl0KCd2YWx1ZS1jaGFuZ2UnLCBoZWFsdGhBYmlsaXR5LmhwIC8gaGVhbHRoQWJpbGl0eS5ocE1heClcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3dpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXJXaW5kb3dcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuaW1wb3J0IFdpbmRvdyBmcm9tICcuL1dpbmRvdydcbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vV3JhcHBlcidcblxuY2xhc3MgU2Nyb2xsYWJsZVdpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG4gICAgbGV0IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcGFkZGluZyA9IDgsXG4gICAgICBzY3JvbGxCYXJXaWR0aCA9IDEwXG4gICAgfSA9IG9wdFxuICAgIHRoaXMuX29wdCA9IG9wdFxuXG4gICAgdGhpcy5faW5pdFNjcm9sbGFibGVBcmVhKFxuICAgICAgd2lkdGggLSBwYWRkaW5nICogMiAtIHNjcm9sbEJhcldpZHRoIC0gNSxcbiAgICAgIGhlaWdodCAtIHBhZGRpbmcgKiAyLFxuICAgICAgcGFkZGluZylcbiAgICB0aGlzLl9pbml0U2Nyb2xsQmFyKHtcbiAgICAgIC8vIHdpbmRvdyB3aWR0aCAtIHdpbmRvdyBwYWRkaW5nIC0gYmFyIHdpZHRoXG4gICAgICB4OiB3aWR0aCAtIHBhZGRpbmcgLSBzY3JvbGxCYXJXaWR0aCxcbiAgICAgIHk6IHBhZGRpbmcsXG4gICAgICB3aWR0aDogc2Nyb2xsQmFyV2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodCAtIHBhZGRpbmcgKiAyXG4gICAgfSlcbiAgfVxuXG4gIF9pbml0U2Nyb2xsYWJsZUFyZWEgKHdpZHRoLCBoZWlnaHQsIHBhZGRpbmcpIHtcbiAgICAvLyBob2xkIHBhZGRpbmdcbiAgICBsZXQgX21haW5WaWV3ID0gbmV3IENvbnRhaW5lcigpXG4gICAgX21haW5WaWV3LnBvc2l0aW9uLnNldChwYWRkaW5nLCBwYWRkaW5nKVxuICAgIHRoaXMuYWRkQ2hpbGQoX21haW5WaWV3KVxuXG4gICAgdGhpcy5tYWluVmlldyA9IG5ldyBDb250YWluZXIoKVxuICAgIF9tYWluVmlldy5hZGRDaGlsZCh0aGlzLm1haW5WaWV3KVxuXG4gICAgLy8gaGlkZSBtYWluVmlldydzIG92ZXJmbG93XG4gICAgbGV0IG1hc2sgPSBuZXcgR3JhcGhpY3MoKVxuICAgIG1hc2suYmVnaW5GaWxsKDB4RkZGRkZGKVxuICAgIG1hc2suZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDUpXG4gICAgbWFzay5lbmRGaWxsKClcbiAgICB0aGlzLm1haW5WaWV3Lm1hc2sgPSBtYXNrXG4gICAgX21haW5WaWV3LmFkZENoaWxkKG1hc2spXG5cbiAgICAvLyB3aW5kb3cgd2lkdGggLSB3aW5kb3cgcGFkZGluZyAqIDIgLSBiYXIgd2lkdGggLSBiZXR3ZWVuIHNwYWNlXG4gICAgdGhpcy5fd2luZG93V2lkdGggPSB3aWR0aFxuICAgIHRoaXMuX3dpbmRvd0hlaWdodCA9IGhlaWdodFxuICB9XG5cbiAgX2luaXRTY3JvbGxCYXIgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgbGV0IGNvbmF0aW5lciA9IG5ldyBDb250YWluZXIoKVxuICAgIGNvbmF0aW5lci54ID0geFxuICAgIGNvbmF0aW5lci55ID0geVxuXG4gICAgbGV0IHNjcm9sbEJhckJnID0gbmV3IEdyYXBoaWNzKClcbiAgICBzY3JvbGxCYXJCZy5iZWdpbkZpbGwoMHhBOEE4QTgpXG4gICAgc2Nyb2xsQmFyQmcuZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDIpXG4gICAgc2Nyb2xsQmFyQmcuZW5kRmlsbCgpXG5cbiAgICBsZXQgc2Nyb2xsQmFyID0gbmV3IEdyYXBoaWNzKClcbiAgICBzY3JvbGxCYXIuYmVnaW5GaWxsKDB4MjIyMjIyKVxuICAgIHNjcm9sbEJhci5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgMylcbiAgICBzY3JvbGxCYXIuZW5kRmlsbCgpXG4gICAgc2Nyb2xsQmFyLnRvU3RyaW5nID0gKCkgPT4gJ3Njcm9sbEJhcidcbiAgICBXcmFwcGVyLmRyYWdnYWJsZShzY3JvbGxCYXIsIHtcbiAgICAgIGJvdW5kYXJ5OiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDAsXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgIH1cbiAgICB9KVxuICAgIHNjcm9sbEJhci5vbignZHJhZycsIHRoaXMuc2Nyb2xsTWFpblZpZXcuYmluZCh0aGlzKSlcblxuICAgIGNvbmF0aW5lci5hZGRDaGlsZChzY3JvbGxCYXJCZylcbiAgICBjb25hdGluZXIuYWRkQ2hpbGQoc2Nyb2xsQmFyKVxuICAgIHRoaXMuYWRkQ2hpbGQoY29uYXRpbmVyKVxuICAgIHRoaXMuc2Nyb2xsQmFyID0gc2Nyb2xsQmFyXG4gICAgdGhpcy5zY3JvbGxCYXJCZyA9IHNjcm9sbEJhckJnXG4gIH1cblxuICAvLyDmjbLli5XoppbnqpdcbiAgc2Nyb2xsTWFpblZpZXcgKCkge1xuICAgIHRoaXMubWFpblZpZXcueSA9ICh0aGlzLndpbmRvd0hlaWdodCAtIHRoaXMubWFpblZpZXcuaGVpZ2h0KSAqIHRoaXMuc2Nyb2xsUGVyY2VudFxuICB9XG5cbiAgLy8g5paw5aKe54mp5Lu26Iez6KaW56qXXG4gIGFkZFdpbmRvd0NoaWxkIChjaGlsZCkge1xuICAgIHRoaXMubWFpblZpZXcuYWRkQ2hpbGQoY2hpbGQpXG4gIH1cblxuICAvLyDmm7TmlrDmjbLli5Xmo5LlpKflsI8sIOS4jeS4gOWumuimgeiqv+eUqFxuICB1cGRhdGVTY3JvbGxCYXJMZW5ndGggKCkge1xuICAgIGxldCB7IHNjcm9sbEJhck1pbkhlaWdodCA9IDIwIH0gPSB0aGlzLl9vcHRcblxuICAgIGxldCBkaCA9IHRoaXMubWFpblZpZXcuaGVpZ2h0IC8gdGhpcy53aW5kb3dIZWlnaHRcbiAgICBpZiAoZGggPCAxKSB7XG4gICAgICB0aGlzLnNjcm9sbEJhci5oZWlnaHQgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNjcm9sbEJhci5oZWlnaHQgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodCAvIGRoXG4gICAgICAvLyDpgb/lhY3lpKrlsI/lvojpm6Pmi5bmm7NcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IE1hdGgubWF4KHNjcm9sbEJhck1pbkhlaWdodCwgdGhpcy5zY3JvbGxCYXIuaGVpZ2h0KVxuICAgIH1cbiAgICB0aGlzLnNjcm9sbEJhci5mYWxsYmFja1RvQm91bmRhcnkoKVxuICB9XG5cbiAgLy8g5o2y5YuV55m+5YiG5q+UXG4gIGdldCBzY3JvbGxQZXJjZW50ICgpIHtcbiAgICBsZXQgZGVsdGEgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodCAtIHRoaXMuc2Nyb2xsQmFyLmhlaWdodFxuICAgIHJldHVybiBkZWx0YSA9PT0gMCA/IDEgOiB0aGlzLnNjcm9sbEJhci55IC8gZGVsdGFcbiAgfVxuXG4gIC8vIOaNsuWLleiHs+eZvuWIhuavlFxuICBzY3JvbGxUbyAocGVyY2VudCkge1xuICAgIGxldCBkZWx0YSA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC0gdGhpcy5zY3JvbGxCYXIuaGVpZ2h0XG4gICAgbGV0IHkgPSAwXG4gICAgaWYgKGRlbHRhICE9PSAwKSB7XG4gICAgICB5ID0gZGVsdGEgKiBwZXJjZW50XG4gICAgfVxuICAgIHRoaXMuc2Nyb2xsQmFyLnkgPSB5XG4gICAgdGhpcy5zY3JvbGxNYWluVmlldygpXG4gIH1cblxuICBnZXQgd2luZG93V2lkdGggKCkge1xuICAgIHJldHVybiB0aGlzLl93aW5kb3dXaWR0aFxuICB9XG5cbiAgZ2V0IHdpbmRvd0hlaWdodCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpbmRvd0hlaWdodFxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjcm9sbGFibGVXaW5kb3dcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi9saWIvVmVjdG9yJ1xyXG5cclxuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcclxuaW1wb3J0IHsgTEVGVCwgVVAsIFJJR0hULCBET1dOIH0gZnJvbSAnLi4vY29uZmlnL2NvbnRyb2wnXHJcblxyXG5jb25zdCBBTExfS0VZUyA9IFtSSUdIVCwgTEVGVCwgVVAsIERPV05dXHJcblxyXG5jbGFzcyBUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgcmFkaXVzIH0pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXHJcblxyXG4gICAgbGV0IHRvdWNoQXJlYSA9IG5ldyBHcmFwaGljcygpXHJcbiAgICB0b3VjaEFyZWEuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXHJcbiAgICB0b3VjaEFyZWEuZHJhd0NpcmNsZSgwLCAwLCByYWRpdXMpXHJcbiAgICB0b3VjaEFyZWEuZW5kRmlsbCgpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRvdWNoQXJlYSlcclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzXHJcblxyXG4gICAgdGhpcy5zZXR1cFRvdWNoKClcclxuICB9XHJcblxyXG4gIHNldHVwVG91Y2ggKCkge1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgIGxldCBmID0gdGhpcy5vblRvdWNoLmJpbmQodGhpcylcclxuICAgIHRoaXMub24oJ3RvdWNoc3RhcnQnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2hlbmQnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2htb3ZlJywgZilcclxuICAgIHRoaXMub24oJ3RvdWNoZW5kb3V0c2lkZScsIGYpXHJcbiAgfVxyXG5cclxuICBvblRvdWNoIChlKSB7XHJcbiAgICBsZXQgdHlwZSA9IGUudHlwZVxyXG4gICAgbGV0IHByb3BhZ2F0aW9uID0gZmFsc2VcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcclxuICAgICAgICB0aGlzLmRyYWcgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcclxuICAgICAgICB0aGlzLmNyZWF0ZURyYWdQb2ludCgpXHJcbiAgICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbiA9IHtcclxuICAgICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICAgIHk6IHRoaXMueVxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICd0b3VjaGVuZCc6XHJcbiAgICAgIGNhc2UgJ3RvdWNoZW5kb3V0c2lkZSc6XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgICAgdGhpcy5kcmFnID0gZmFsc2VcclxuICAgICAgICAgIHRoaXMuZGVzdHJveURyYWdQb2ludCgpXHJcbiAgICAgICAgICB0aGlzLnJlbGVhc2VLZXlzKClcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAndG91Y2htb3ZlJzpcclxuICAgICAgICBpZiAoIXRoaXMuZHJhZykge1xyXG4gICAgICAgICAgcHJvcGFnYXRpb24gPSB0cnVlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZXNzS2V5cyhlLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzKSlcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgaWYgKCFwcm9wYWdhdGlvbikge1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjcmVhdGVEcmFnUG9pbnQgKCkge1xyXG4gICAgbGV0IGRyYWdQb2ludCA9IG5ldyBHcmFwaGljcygpXHJcbiAgICBkcmFnUG9pbnQuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXHJcbiAgICBkcmFnUG9pbnQuZHJhd0NpcmNsZSgwLCAwLCAyMClcclxuICAgIGRyYWdQb2ludC5lbmRGaWxsKClcclxuICAgIHRoaXMuYWRkQ2hpbGQoZHJhZ1BvaW50KVxyXG4gICAgdGhpcy5kcmFnUG9pbnQgPSBkcmFnUG9pbnRcclxuICB9XHJcblxyXG4gIGRlc3Ryb3lEcmFnUG9pbnQgKCkge1xyXG4gICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLmRyYWdQb2ludClcclxuICAgIHRoaXMuZHJhZ1BvaW50LmRlc3Ryb3koKVxyXG4gIH1cclxuXHJcbiAgcHJlc3NLZXlzIChuZXdQb2ludCkge1xyXG4gICAgdGhpcy5yZWxlYXNlS2V5cygpXHJcbiAgICAvLyDmhJ/mh4npnYjmlY/luqZcclxuICAgIGxldCB0aHJlc2hvbGQgPSAzMFxyXG5cclxuICAgIGxldCB2ZWN0b3IgPSBWZWN0b3IuZnJvbVBvaW50KG5ld1BvaW50KVxyXG4gICAgbGV0IGRlZyA9IHZlY3Rvci5kZWdcclxuICAgIGxldCBsZW4gPSB2ZWN0b3IubGVuZ3RoXHJcblxyXG4gICAgaWYgKGxlbiA8IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGxldCBkZWdBYnMgPSBNYXRoLmFicyhkZWcpXHJcbiAgICBsZXQgZHggPSBkZWdBYnMgPCA2Ny41ID8gUklHSFQgOiAoZGVnQWJzID4gMTEyLjUgPyBMRUZUIDogZmFsc2UpXHJcbiAgICBsZXQgZHkgPSBkZWdBYnMgPCAyMi41IHx8IGRlZ0FicyA+IDE1Ny41ID8gZmFsc2UgOiAoZGVnIDwgMCA/IFVQIDogRE9XTilcclxuXHJcbiAgICBpZiAoZHggfHwgZHkpIHtcclxuICAgICAgaWYgKGR4KSB7XHJcbiAgICAgICAga2V5Ym9hcmRKUy5wcmVzc0tleShkeClcclxuICAgICAgfVxyXG4gICAgICBpZiAoZHkpIHtcclxuICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KGR5KVxyXG4gICAgICB9XHJcbiAgICAgIHZlY3Rvci5tdWx0aXBseVNjYWxhcih0aGlzLnJhZGl1cyAvIGxlbilcclxuICAgICAgdGhpcy5kcmFnUG9pbnQucG9zaXRpb24uc2V0KFxyXG4gICAgICAgIHZlY3Rvci54LFxyXG4gICAgICAgIHZlY3Rvci55XHJcbiAgICAgIClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbGVhc2VLZXlzICgpIHtcclxuICAgIEFMTF9LRVlTLmZvckVhY2goa2V5ID0+IGtleWJvYXJkSlMucmVsZWFzZUtleShrZXkpKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsXHJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi9saWIvVmVjdG9yJ1xyXG5cclxuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xyXG5cclxuY2xhc3MgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcclxuXHJcbiAgICBsZXQgdG91Y2hBcmVhID0gbmV3IEdyYXBoaWNzKClcclxuICAgIHRvdWNoQXJlYS5iZWdpbkZpbGwoMHhGMkYyRjIsIDAuNSlcclxuICAgIHRvdWNoQXJlYS5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxyXG4gICAgdG91Y2hBcmVhLmVuZEZpbGwoKVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0b3VjaEFyZWEpXHJcblxyXG4gICAgdGhpcy5zZXR1cFRvdWNoKClcclxuICB9XHJcblxyXG4gIHNldHVwVG91Y2ggKCkge1xyXG4gICAgdGhpcy5jZW50ZXIgPSBuZXcgVmVjdG9yKHRoaXMud2lkdGggLyAyLCB0aGlzLmhlaWdodCAvIDIpXHJcbiAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgbGV0IGYgPSB0aGlzLm9uVG91Y2guYmluZCh0aGlzKVxyXG4gICAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXHJcbiAgfVxyXG5cclxuICBvblRvdWNoIChlKSB7XHJcbiAgICBsZXQgcG9pbnRlciA9IGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpXHJcbiAgICBsZXQgdmVjdG9yID0gVmVjdG9yLmZyb21Qb2ludChwb2ludGVyKS5zdWIodGhpcy5jZW50ZXIpXHJcbiAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgncm90YXRlJywgdmVjdG9yKVxyXG4gICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoJ2ZpcmUnKVxyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdUb3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsXHJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY2xhc3MgVmFsdWVCYXIgZXh0ZW5kcyBDb250YWluZXIge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIoKVxuICAgIGxldCB7IHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvbG9yIH0gPSBvcHRcblxuICAgIC8vIGJhY2tncm91bmRcbiAgICBsZXQgaHBCYXJCZyA9IG5ldyBHcmFwaGljcygpXG4gICAgaHBCYXJCZy5iZWdpbkZpbGwoMHhBMkEyQTIpXG4gICAgaHBCYXJCZy5saW5lU3R5bGUoMSwgMHgyMjIyMjIsIDEpXG4gICAgaHBCYXJCZy5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxuICAgIGhwQmFyQmcuZW5kRmlsbCgpXG5cbiAgICAvLyBtYXNrXG4gICAgbGV0IG1hc2sgPSBuZXcgR3JhcGhpY3MoKVxuICAgIG1hc2suYmVnaW5GaWxsKDB4RkZGRkZGKVxuICAgIG1hc2suZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodClcbiAgICBtYXNrLmVuZEZpbGwoKVxuICAgIHRoaXMuYWRkQ2hpbGQobWFzaylcbiAgICB0aGlzLmJhck1hc2sgPSBtYXNrXG5cbiAgICB0aGlzLmFkZENoaWxkKGhwQmFyQmcpXG4gICAgdGhpcy5ocEJhckJnID0gaHBCYXJCZ1xuXG4gICAgLy8gYmFyXG4gICAgdGhpcy5fcmVuZGVyQmFyKHtjb2xvciwgd2lkdGgsIGhlaWdodH0pXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcbiAgICB0aGlzLl9vcHQgPSBvcHRcblxuICAgIHRoaXMub24oJ3ZhbHVlLWNoYW5nZScsIHRoaXMudXBkYXRlLmJpbmQodGhpcykpXG4gIH1cblxuICB1cGRhdGUgKHJhdGUpIHtcbiAgICB0aGlzLnJlbW92ZUNoaWxkKHRoaXMuaHBCYXJJbm5lcilcbiAgICB0aGlzLmhwQmFySW5uZXIuZGVzdHJveSgpXG4gICAgbGV0IHsgY29sb3IsIHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuX29wdFxuICAgIHRoaXMuX3JlbmRlckJhcih7XG4gICAgICBjb2xvcixcbiAgICAgIHdpZHRoOiB3aWR0aCAqIHJhdGUsXG4gICAgICBoZWlnaHRcbiAgICB9KVxuICB9XG5cbiAgX3JlbmRlckJhciAoe2NvbG9yLCB3aWR0aCwgaGVpZ2h0fSkge1xuICAgIGxldCBocEJhcklubmVyID0gbmV3IEdyYXBoaWNzKClcbiAgICBocEJhcklubmVyLmJlZ2luRmlsbChjb2xvcilcbiAgICBocEJhcklubmVyLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpXG4gICAgaHBCYXJJbm5lci5lbmRGaWxsKClcbiAgICBocEJhcklubmVyLm1hc2sgPSB0aGlzLmJhck1hc2tcblxuICAgIHRoaXMuYWRkQ2hpbGQoaHBCYXJJbm5lcilcbiAgICB0aGlzLmhwQmFySW5uZXIgPSBocEJhcklubmVyXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmFsdWVCYXJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY2xhc3MgV2luZG93IGV4dGVuZHMgQ29udGFpbmVyIHtcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXG5cbiAgICBsZXQgbGluZVdpZHRoID0gM1xuXG4gICAgbGV0IHdpbmRvd0JnID0gbmV3IEdyYXBoaWNzKClcbiAgICB3aW5kb3dCZy5iZWdpbkZpbGwoMHhGMkYyRjIpXG4gICAgd2luZG93QmcubGluZVN0eWxlKGxpbmVXaWR0aCwgMHgyMjIyMjIsIDEpXG4gICAgd2luZG93QmcuZHJhd1JvdW5kZWRSZWN0KFxuICAgICAgMCwgMCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgNSlcbiAgICB3aW5kb3dCZy5lbmRGaWxsKClcbiAgICB0aGlzLmFkZENoaWxkKHdpbmRvd0JnKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpbmRvd1xuIiwiY29uc3QgT1BUID0gU3ltYm9sKCdvcHQnKVxuXG5mdW5jdGlvbiBfZW5hYmxlRHJhZ2dhYmxlICgpIHtcbiAgdGhpcy5kcmFnID0gZmFsc2VcbiAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcbiAgbGV0IGYgPSBfb25Ub3VjaC5iaW5kKHRoaXMpXG4gIHRoaXMub24oJ3RvdWNoc3RhcnQnLCBmKVxuICB0aGlzLm9uKCd0b3VjaGVuZCcsIGYpXG4gIHRoaXMub24oJ3RvdWNobW92ZScsIGYpXG4gIHRoaXMub24oJ3RvdWNoZW5kb3V0c2lkZScsIGYpXG4gIHRoaXMub24oJ21vdXNlZG93bicsIGYpXG4gIHRoaXMub24oJ21vdXNldXAnLCBmKVxuICB0aGlzLm9uKCdtb3VzZW1vdmUnLCBmKVxuICB0aGlzLm9uKCdtb3VzZXVwb3V0c2lkZScsIGYpXG59XG5cbmZ1bmN0aW9uIF9vblRvdWNoIChlKSB7XG4gIGxldCB0eXBlID0gZS50eXBlXG4gIGxldCBwcm9wYWdhdGlvbiA9IGZhbHNlXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxuICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICB0aGlzLmRyYWcgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcbiAgICAgIHRoaXMub3JpZ2luUG9zaXRpb24gPSB7XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ3RvdWNoZW5kJzpcbiAgICBjYXNlICd0b3VjaGVuZG91dHNpZGUnOlxuICAgIGNhc2UgJ21vdXNldXAnOlxuICAgIGNhc2UgJ21vdXNldXBvdXRzaWRlJzpcbiAgICAgIHRoaXMuZHJhZyA9IGZhbHNlXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3RvdWNobW92ZSc6XG4gICAgY2FzZSAnbW91c2Vtb3ZlJzpcbiAgICAgIGlmICghdGhpcy5kcmFnKSB7XG4gICAgICAgIHByb3BhZ2F0aW9uID0gdHJ1ZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgbGV0IG5ld1BvaW50ID0gZS5kYXRhLmdsb2JhbC5jbG9uZSgpXG4gICAgICB0aGlzLnBvc2l0aW9uLnNldChcbiAgICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbi54ICsgbmV3UG9pbnQueCAtIHRoaXMuZHJhZy54LFxuICAgICAgICB0aGlzLm9yaWdpblBvc2l0aW9uLnkgKyBuZXdQb2ludC55IC0gdGhpcy5kcmFnLnlcbiAgICAgIClcbiAgICAgIF9mYWxsYmFja1RvQm91bmRhcnkuY2FsbCh0aGlzKVxuICAgICAgdGhpcy5lbWl0KCdkcmFnJykgLy8gbWF5YmUgY2FuIHBhc3MgcGFyYW0gZm9yIHNvbWUgcmVhc29uOiBlLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzKVxuICAgICAgYnJlYWtcbiAgfVxuICBpZiAoIXByb3BhZ2F0aW9uKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICB9XG59XG5cbi8vIOmAgOWbnumCiueVjFxuZnVuY3Rpb24gX2ZhbGxiYWNrVG9Cb3VuZGFyeSAoKSB7XG4gIGxldCB7IHdpZHRoID0gdGhpcy53aWR0aCwgaGVpZ2h0ID0gdGhpcy5oZWlnaHQsIGJvdW5kYXJ5IH0gPSB0aGlzW09QVF1cbiAgdGhpcy54ID0gTWF0aC5tYXgodGhpcy54LCBib3VuZGFyeS54KVxuICB0aGlzLnggPSBNYXRoLm1pbih0aGlzLngsIGJvdW5kYXJ5LnggKyBib3VuZGFyeS53aWR0aCAtIHdpZHRoKVxuICB0aGlzLnkgPSBNYXRoLm1heCh0aGlzLnksIGJvdW5kYXJ5LnkpXG4gIHRoaXMueSA9IE1hdGgubWluKHRoaXMueSwgYm91bmRhcnkueSArIGJvdW5kYXJ5LmhlaWdodCAtIGhlaWdodClcbn1cbmNsYXNzIFdyYXBwZXIge1xuICAvKipcbiAgICogZGlzcGxheU9iamVjdDogd2lsbCB3cmFwcGVkIERpc3BsYXlPYmplY3RcbiAgICogb3B0OiB7XG4gICAqICBib3VuZGFyeTog5ouW5puz6YKK55WMIHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9XG4gICAqICBbLCB3aWR0aF06IOmCiueVjOeisOaSnuWvrChkZWZhdWx0OiBkaXNwbGF5T2JqZWN0LndpZHRoKVxuICAgKiAgWywgaGVpZ2h0XTog6YKK55WM56Kw5pKe6auYKGRlZmF1bHQ6IGRpc3BsYXlPYmplY3QuaGVpZ2h0KVxuICAgKiAgfVxuICAgKi9cbiAgc3RhdGljIGRyYWdnYWJsZSAoZGlzcGxheU9iamVjdCwgb3B0KSB7XG4gICAgZGlzcGxheU9iamVjdFtPUFRdID0gb3B0XG4gICAgX2VuYWJsZURyYWdnYWJsZS5jYWxsKGRpc3BsYXlPYmplY3QpXG4gICAgZGlzcGxheU9iamVjdC5mYWxsYmFja1RvQm91bmRhcnkgPSBfZmFsbGJhY2tUb0JvdW5kYXJ5XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV3JhcHBlclxuIl19
