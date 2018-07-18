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
    new _Learn2.default().carryBy(_this).learn(new _Move2.default([1])).learn(new _KeyMove2.default()).learn(new _Place2.default()).learn(new _KeyPlace2.default()).learn(new _Camera2.default(1)).learn(carry).learn(new _Fire2.default([3, 3])).learn(new _Rotate2.default()).learn(new _KeyFire2.default()).learn(new _Health2.default(1));

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
    new _Learn2.default().carryBy(_this).learn(new _Fire2.default([3, 3])).learn(carry).learn(new _Health2.default(1000));

    var bullet = new _Bullet2.default();
    carry.take(bullet, Infinity);

    _this.on('collide', _this.actionWith.bind(_this));
    _this.on('die', _this.onDie.bind(_this));

    setInterval(function () {
      var rad = _this.rotation;
      _this[_constants.ABILITY_FIRE].fire(rad);
      _this[_constants.ABILITY_FIRE].fire(rad + Math.PI / 2);
      _this[_constants.ABILITY_FIRE].fire(rad + Math.PI);
      _this[_constants.ABILITY_FIRE].fire(rad + Math.PI / 2 * 3);
    }, 200);

    setInterval(function () {
      _this.rotate(Math.PI / 30 / 10, true);
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
      setInterval(function () {
        _globalEventManager2.default.emit('fire');
      }, 100);
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

},{"../config/constants":19,"../lib/PIXI":29,"./Window":71}],66:[function(require,module,exports){
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

},{"../config/constants":19,"../lib/PIXI":29,"./Window":71}],68:[function(require,module,exports){
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

},{"../lib/PIXI":29,"./Window":71,"./Wrapper":72}],69:[function(require,module,exports){
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

},{"../lib/PIXI":29}],72:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tleWJvYXJkanMvbGliL2tleS1jb21iby5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9rZXlib2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9rZXlib2FyZGpzL2xpYi9sb2NhbGUuanMiLCJub2RlX21vZHVsZXMva2V5Ym9hcmRqcy9sb2NhbGVzL3VzLmpzIiwibm9kZV9tb2R1bGVzL25ncmFwaC5ldmVudHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLmdyYXBoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL25ncmFwaC5wYXRoL2Etc3Rhci9Ob2RlSGVhcC5qcyIsIm5vZGVfbW9kdWxlcy9uZ3JhcGgucGF0aC9hLXN0YXIvYS1ncmVlZHktc3Rhci5qcyIsIm5vZGVfbW9kdWxlcy9uZ3JhcGgucGF0aC9hLXN0YXIvYS1zdGFyLmpzIiwibm9kZV9tb2R1bGVzL25ncmFwaC5wYXRoL2Etc3Rhci9kZWZhdWx0U2V0dGluZ3MuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvYS1zdGFyL2hldXJpc3RpY3MuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvYS1zdGFyL21ha2VTZWFyY2hTdGF0ZVBvb2wuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvYS1zdGFyL25iYS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9uZ3JhcGgucGF0aC9hLXN0YXIvbmJhL21ha2VOQkFTZWFyY2hTdGF0ZVBvb2wuanMiLCJub2RlX21vZHVsZXMvbmdyYXBoLnBhdGgvaW5kZXguanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbmZpZy9jb25zdGFudHMuanMiLCJzcmMvY29uZmlnL2NvbnRyb2wuanMiLCJzcmMvbGliL0FwcGxpY2F0aW9uLmpzIiwic3JjL2xpYi9HYW1lT2JqZWN0cy5qcyIsInNyYy9saWIvTGlnaHQuanMiLCJzcmMvbGliL01hcC5qcyIsInNyYy9saWIvTWFwR3JhcGguanMiLCJzcmMvbGliL01hcFdvcmxkLmpzIiwic3JjL2xpYi9NYXR0ZXIuanMiLCJzcmMvbGliL01lc3NhZ2VzLmpzIiwic3JjL2xpYi9QSVhJLmpzIiwic3JjL2xpYi9TY2VuZS5qcyIsInNyYy9saWIvVGV4dHVyZS5qcyIsInNyYy9saWIvVmVjdG9yLmpzIiwic3JjL2xpYi9nbG9iYWxFdmVudE1hbmFnZXIuanMiLCJzcmMvbGliL3V0aWxzLmpzIiwic3JjL29iamVjdHMvQWlyLmpzIiwic3JjL29iamVjdHMvQnVsbGV0LmpzIiwic3JjL29iamVjdHMvQ2F0LmpzIiwic3JjL29iamVjdHMvRG9vci5qcyIsInNyYy9vYmplY3RzL0dhbWVPYmplY3QuanMiLCJzcmMvb2JqZWN0cy9HcmFzcy5qcyIsInNyYy9vYmplY3RzL0dyYXNzRGVjb3JhdGUxLmpzIiwic3JjL29iamVjdHMvR3JvdW5kLmpzIiwic3JjL29iamVjdHMvSXJvbkZlbmNlLmpzIiwic3JjL29iamVjdHMvUm9vdC5qcyIsInNyYy9vYmplY3RzL1RvcmNoLmpzIiwic3JjL29iamVjdHMvVHJlYXN1cmUuanMiLCJzcmMvb2JqZWN0cy9UcmVlLmpzIiwic3JjL29iamVjdHMvV2FsbC5qcyIsInNyYy9vYmplY3RzL1dhbGxTaG9vdEJvbHQuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvQWJpbGl0eS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9DYW1lcmEuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvQ2FycnkuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvRmlyZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9IZWFsdGguanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvS2V5RmlyZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9LZXlNb3ZlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0tleVBsYWNlLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL0xlYXJuLmpzIiwic3JjL29iamVjdHMvYWJpbGl0aWVzL01vdmUuanMiLCJzcmMvb2JqZWN0cy9hYmlsaXRpZXMvT3BlcmF0ZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9QbGFjZS5qcyIsInNyYy9vYmplY3RzL2FiaWxpdGllcy9Sb3RhdGUuanMiLCJzcmMvc2NlbmVzL0xvYWRpbmdTY2VuZS5qcyIsInNyYy9zY2VuZXMvUGxheVNjZW5lLmpzIiwic3JjL3VpL0ludmVudG9yeVdpbmRvdy5qcyIsInNyYy91aS9NZXNzYWdlV2luZG93LmpzIiwic3JjL3VpL1BsYXllcldpbmRvdy5qcyIsInNyYy91aS9TY3JvbGxhYmxlV2luZG93LmpzIiwic3JjL3VpL1RvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsLmpzIiwic3JjL3VpL1RvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsLmpzIiwic3JjL3VpL1dpbmRvdy5qcyIsInNyYy91aS9XcmFwcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3psQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFBLEdBQVMsS0FBQSxHQUFBLENBQVMsS0FBVCxDQUFBLEVBQWlCLFNBQUEsQ0FBQSxHQUFhLFNBQWIsS0FBQSxHQUExQixLQUFTLENBQVQ7QUFDQSxPQUFBLENBQUEsR0FBUyxLQUFBLEdBQUEsQ0FBUyxLQUFULENBQUEsRUFBaUIsU0FBMUIsQ0FBUyxDQUFUO0FBQ0EsT0FBQSxDQUFBLEdBQVMsS0FBQSxHQUFBLENBQVMsS0FBVCxDQUFBLEVBQWlCLFNBQUEsQ0FBQSxHQUFhLFNBQWIsTUFBQSxHQUExQixNQUFTLENBQVQ7QUFDRDs7SUFDSyxVOzs7Ozs7OztBQUNKOzs7Ozs7Ozs4QkFRa0IsYSxFQUFlLEcsRUFBSztBQUNwQyxvQkFBQSxHQUFBLElBQUEsR0FBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQSxhQUFBO0FBQ0Esb0JBQUEsa0JBQUEsR0FBQSxtQkFBQTtBQUNEOzs7Ozs7a0JBR1ksTyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgb2JqZWN0Q3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBvYmplY3RDcmVhdGVQb2x5ZmlsbFxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBvYmplY3RLZXlzUG9seWZpbGxcbnZhciBiaW5kID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgfHwgZnVuY3Rpb25CaW5kUG9seWZpbGxcblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdfZXZlbnRzJykpIHtcbiAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxudmFyIGhhc0RlZmluZVByb3BlcnR5O1xudHJ5IHtcbiAgdmFyIG8gPSB7fTtcbiAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sICd4JywgeyB2YWx1ZTogMCB9KTtcbiAgaGFzRGVmaW5lUHJvcGVydHkgPSBvLnggPT09IDA7XG59IGNhdGNoIChlcnIpIHsgaGFzRGVmaW5lUHJvcGVydHkgPSBmYWxzZSB9XG5pZiAoaGFzRGVmaW5lUHJvcGVydHkpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50RW1pdHRlciwgJ2RlZmF1bHRNYXhMaXN0ZW5lcnMnLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGUgaW5wdXQgaXMgYSBwb3NpdGl2ZSBudW1iZXIgKHdob3NlIHZhbHVlIGlzIHplcm8gb3JcbiAgICAgIC8vIGdyZWF0ZXIgYW5kIG5vdCBhIE5hTikuXG4gICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ251bWJlcicgfHwgYXJnIDwgMCB8fCBhcmcgIT09IGFyZylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJkZWZhdWx0TWF4TGlzdGVuZXJzXCIgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICAgICAgZGVmYXVsdE1heExpc3RlbmVycyA9IGFyZztcbiAgICB9XG4gIH0pO1xufSBlbHNlIHtcbiAgRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xufVxuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiblwiIGFyZ3VtZW50IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiAkZ2V0TWF4TGlzdGVuZXJzKHRoYXQpIHtcbiAgaWYgKHRoYXQuX21heExpc3RlbmVycyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgcmV0dXJuIHRoYXQuX21heExpc3RlbmVycztcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiAkZ2V0TWF4TGlzdGVuZXJzKHRoaXMpO1xufTtcblxuLy8gVGhlc2Ugc3RhbmRhbG9uZSBlbWl0KiBmdW5jdGlvbnMgYXJlIHVzZWQgdG8gb3B0aW1pemUgY2FsbGluZyBvZiBldmVudFxuLy8gaGFuZGxlcnMgZm9yIGZhc3QgY2FzZXMgYmVjYXVzZSBlbWl0KCkgaXRzZWxmIG9mdGVuIGhhcyBhIHZhcmlhYmxlIG51bWJlciBvZlxuLy8gYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYmVjYXVzZSBvZiB0aGF0LiBUaGVzZSBmdW5jdGlvbnMgYWx3YXlzIGhhdmVcbi8vIHRoZSBzYW1lIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIHRodXMgZG8gbm90IGdldCBkZW9wdGltaXplZCwgc28gdGhlIGNvZGVcbi8vIGluc2lkZSB0aGVtIGNhbiBleGVjdXRlIGZhc3Rlci5cbmZ1bmN0aW9uIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHNlbGYpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRPbmUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSkge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMiwgYXJnMykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmdzKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuYXBwbHkoc2VsZiwgYXJncyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBldmVudHM7XG4gIHZhciBkb0Vycm9yID0gKHR5cGUgPT09ICdlcnJvcicpO1xuXG4gIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgaWYgKGV2ZW50cylcbiAgICBkb0Vycm9yID0gKGRvRXJyb3IgJiYgZXZlbnRzLmVycm9yID09IG51bGwpO1xuICBlbHNlIGlmICghZG9FcnJvcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAoZG9FcnJvcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSlcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5oYW5kbGVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBoYW5kbGVyID0gZXZlbnRzW3R5cGVdO1xuXG4gIGlmICghaGFuZGxlcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGlzRm4gPSB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJztcbiAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgc3dpdGNoIChsZW4pIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICBjYXNlIDE6XG4gICAgICBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIGVtaXRPbmUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzpcbiAgICAgIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA0OlxuICAgICAgZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdLCBhcmd1bWVudHNbM10pO1xuICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICBkZWZhdWx0OlxuICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgdmFyIG07XG4gIHZhciBldmVudHM7XG4gIHZhciBleGlzdGluZztcblxuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgaWYgKCFldmVudHMpIHtcbiAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0YXJnZXQuX2V2ZW50c0NvdW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgICBpZiAoZXZlbnRzLm5ld0xpc3RlbmVyKSB7XG4gICAgICB0YXJnZXQuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgICAgIC8vIFJlLWFzc2lnbiBgZXZlbnRzYCBiZWNhdXNlIGEgbmV3TGlzdGVuZXIgaGFuZGxlciBjb3VsZCBoYXZlIGNhdXNlZCB0aGVcbiAgICAgIC8vIHRoaXMuX2V2ZW50cyB0byBiZSBhc3NpZ25lZCB0byBhIG5ldyBvYmplY3RcbiAgICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICAgIH1cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIGlmICghZXhpc3RpbmcpIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICAgICsrdGFyZ2V0Ll9ldmVudHNDb3VudDtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGV4aXN0aW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID1cbiAgICAgICAgICBwcmVwZW5kID8gW2xpc3RlbmVyLCBleGlzdGluZ10gOiBbZXhpc3RpbmcsIGxpc3RlbmVyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgICAgaWYgKHByZXBlbmQpIHtcbiAgICAgICAgZXhpc3RpbmcudW5zaGlmdChsaXN0ZW5lcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBleGlzdGluZy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIGlmICghZXhpc3Rpbmcud2FybmVkKSB7XG4gICAgICBtID0gJGdldE1heExpc3RlbmVycyh0YXJnZXQpO1xuICAgICAgaWYgKG0gJiYgbSA+IDAgJiYgZXhpc3RpbmcubGVuZ3RoID4gbSkge1xuICAgICAgICBleGlzdGluZy53YXJuZWQgPSB0cnVlO1xuICAgICAgICB2YXIgdyA9IG5ldyBFcnJvcignUG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSBsZWFrIGRldGVjdGVkLiAnICtcbiAgICAgICAgICAgIGV4aXN0aW5nLmxlbmd0aCArICcgXCInICsgU3RyaW5nKHR5cGUpICsgJ1wiIGxpc3RlbmVycyAnICtcbiAgICAgICAgICAgICdhZGRlZC4gVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gJyArXG4gICAgICAgICAgICAnaW5jcmVhc2UgbGltaXQuJyk7XG4gICAgICAgIHcubmFtZSA9ICdNYXhMaXN0ZW5lcnNFeGNlZWRlZFdhcm5pbmcnO1xuICAgICAgICB3LmVtaXR0ZXIgPSB0YXJnZXQ7XG4gICAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICAgIHcuY291bnQgPSBleGlzdGluZy5sZW5ndGg7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCcgJiYgY29uc29sZS53YXJuKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCclczogJXMnLCB3Lm5hbWUsIHcubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24gYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZExpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIHRydWUpO1xuICAgIH07XG5cbmZ1bmN0aW9uIG9uY2VXcmFwcGVyKCkge1xuICBpZiAoIXRoaXMuZmlyZWQpIHtcbiAgICB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMud3JhcEZuKTtcbiAgICB0aGlzLmZpcmVkID0gdHJ1ZTtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCk7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSk7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0sXG4gICAgICAgICAgICBhcmd1bWVudHNbMl0pO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSlcbiAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB0aGlzLmxpc3RlbmVyLmFwcGx5KHRoaXMudGFyZ2V0LCBhcmdzKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHN0YXRlID0geyBmaXJlZDogZmFsc2UsIHdyYXBGbjogdW5kZWZpbmVkLCB0YXJnZXQ6IHRhcmdldCwgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyIH07XG4gIHZhciB3cmFwcGVkID0gYmluZC5jYWxsKG9uY2VXcmFwcGVyLCBzdGF0ZSk7XG4gIHdyYXBwZWQubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgc3RhdGUud3JhcEZuID0gd3JhcHBlZDtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIHRoaXMub24odHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kT25jZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kT25jZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICB0aGlzLnByZXBlbmRMaXN0ZW5lcih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbi8vIEVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZiBhbmQgb25seSBpZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGxpc3QsIGV2ZW50cywgcG9zaXRpb24sIGksIG9yaWdpbmFsTGlzdGVuZXI7XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBsaXN0ID0gZXZlbnRzW3R5cGVdO1xuICAgICAgaWYgKCFsaXN0KVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8IGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3QubGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaXN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBvc2l0aW9uID0gLTE7XG5cbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fCBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgb3JpZ2luYWxMaXN0ZW5lciA9IGxpc3RbaV0ubGlzdGVuZXI7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMClcbiAgICAgICAgICBsaXN0LnNoaWZ0KCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzcGxpY2VPbmUobGlzdCwgcG9zaXRpb24pO1xuXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSlcbiAgICAgICAgICBldmVudHNbdHlwZV0gPSBsaXN0WzBdO1xuXG4gICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIG9yaWdpbmFsTGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsIGV2ZW50cywgaTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKCFldmVudHMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gICAgICBpZiAoIWV2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRzW3R5cGVdKSB7XG4gICAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IG9iamVjdEtleXMoZXZlbnRzKTtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbGlzdGVuZXJzID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gICAgICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgICAgICAvLyBMSUZPIG9yZGVyXG4gICAgICAgIGZvciAoaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5mdW5jdGlvbiBfbGlzdGVuZXJzKHRhcmdldCwgdHlwZSwgdW53cmFwKSB7XG4gIHZhciBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcblxuICBpZiAoIWV2ZW50cylcbiAgICByZXR1cm4gW107XG5cbiAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG4gIGlmICghZXZsaXN0ZW5lcilcbiAgICByZXR1cm4gW107XG5cbiAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB1bndyYXAgPyBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXSA6IFtldmxpc3RlbmVyXTtcblxuICByZXR1cm4gdW53cmFwID8gdW53cmFwTGlzdGVuZXJzKGV2bGlzdGVuZXIpIDogYXJyYXlDbG9uZShldmxpc3RlbmVyLCBldmxpc3RlbmVyLmxlbmd0aCk7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgdHJ1ZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJhd0xpc3RlbmVycyA9IGZ1bmN0aW9uIHJhd0xpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIubGlzdGVuZXJDb3VudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGxpc3RlbmVyQ291bnQuY2FsbChlbWl0dGVyLCB0eXBlKTtcbiAgfVxufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gbGlzdGVuZXJDb3VudDtcbmZ1bmN0aW9uIGxpc3RlbmVyQ291bnQodHlwZSkge1xuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuXG4gIGlmIChldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcblxuICAgIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmIChldmxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHJldHVybiB0aGlzLl9ldmVudHNDb3VudCA+IDAgPyBSZWZsZWN0Lm93bktleXModGhpcy5fZXZlbnRzKSA6IFtdO1xufTtcblxuLy8gQWJvdXQgMS41eCBmYXN0ZXIgdGhhbiB0aGUgdHdvLWFyZyB2ZXJzaW9uIG9mIEFycmF5I3NwbGljZSgpLlxuZnVuY3Rpb24gc3BsaWNlT25lKGxpc3QsIGluZGV4KSB7XG4gIGZvciAodmFyIGkgPSBpbmRleCwgayA9IGkgKyAxLCBuID0gbGlzdC5sZW5ndGg7IGsgPCBuOyBpICs9IDEsIGsgKz0gMSlcbiAgICBsaXN0W2ldID0gbGlzdFtrXTtcbiAgbGlzdC5wb3AoKTtcbn1cblxuZnVuY3Rpb24gYXJyYXlDbG9uZShhcnIsIG4pIHtcbiAgdmFyIGNvcHkgPSBuZXcgQXJyYXkobik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKVxuICAgIGNvcHlbaV0gPSBhcnJbaV07XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiB1bndyYXBMaXN0ZW5lcnMoYXJyKSB7XG4gIHZhciByZXQgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmV0Lmxlbmd0aDsgKytpKSB7XG4gICAgcmV0W2ldID0gYXJyW2ldLmxpc3RlbmVyIHx8IGFycltpXTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBvYmplY3RDcmVhdGVQb2x5ZmlsbChwcm90bykge1xuICB2YXIgRiA9IGZ1bmN0aW9uKCkge307XG4gIEYucHJvdG90eXBlID0gcHJvdG87XG4gIHJldHVybiBuZXcgRjtcbn1cbmZ1bmN0aW9uIG9iamVjdEtleXNQb2x5ZmlsbChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIgayBpbiBvYmopIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrKSkge1xuICAgIGtleXMucHVzaChrKTtcbiAgfVxuICByZXR1cm4gaztcbn1cbmZ1bmN0aW9uIGZ1bmN0aW9uQmluZFBvbHlmaWxsKGNvbnRleHQpIHtcbiAgdmFyIGZuID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cbiIsIlxudmFyIEtleWJvYXJkID0gcmVxdWlyZSgnLi9saWIva2V5Ym9hcmQnKTtcbnZhciBMb2NhbGUgICA9IHJlcXVpcmUoJy4vbGliL2xvY2FsZScpO1xudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9saWIva2V5LWNvbWJvJyk7XG5cbnZhciBrZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xuXG5rZXlib2FyZC5zZXRMb2NhbGUoJ3VzJywgcmVxdWlyZSgnLi9sb2NhbGVzL3VzJykpO1xuXG5leHBvcnRzICAgICAgICAgID0gbW9kdWxlLmV4cG9ydHMgPSBrZXlib2FyZDtcbmV4cG9ydHMuS2V5Ym9hcmQgPSBLZXlib2FyZDtcbmV4cG9ydHMuTG9jYWxlICAgPSBMb2NhbGU7XG5leHBvcnRzLktleUNvbWJvID0gS2V5Q29tYm87XG4iLCJcbmZ1bmN0aW9uIEtleUNvbWJvKGtleUNvbWJvU3RyKSB7XG4gIHRoaXMuc291cmNlU3RyID0ga2V5Q29tYm9TdHI7XG4gIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gIHRoaXMua2V5TmFtZXMgID0gdGhpcy5zdWJDb21ib3MucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIG5leHRTdWJDb21ibykge1xuICAgIHJldHVybiBtZW1vLmNvbmNhdChuZXh0U3ViQ29tYm8pO1xuICB9LCBbXSk7XG59XG5cbi8vIFRPRE86IEFkZCBzdXBwb3J0IGZvciBrZXkgY29tYm8gc2VxdWVuY2VzXG5LZXlDb21iby5zZXF1ZW5jZURlbGltaW5hdG9yID0gJz4+JztcbktleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgICAgPSAnPic7XG5LZXlDb21iby5rZXlEZWxpbWluYXRvciAgICAgID0gJysnO1xuXG5LZXlDb21iby5wYXJzZUNvbWJvU3RyID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIpIHtcbiAgdmFyIHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIHZhciBjb21ibyAgICAgICAgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMCA7IGkgPCBzdWJDb21ib1N0cnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBjb21iby5wdXNoKEtleUNvbWJvLl9zcGxpdFN0cihzdWJDb21ib1N0cnNbaV0sIEtleUNvbWJvLmtleURlbGltaW5hdG9yKSk7XG4gIH1cbiAgcmV0dXJuIGNvbWJvO1xufTtcblxuS2V5Q29tYm8ucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24ocHJlc3NlZEtleU5hbWVzKSB7XG4gIHZhciBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBzdGFydGluZ0tleU5hbWVJbmRleCA9IHRoaXMuX2NoZWNrU3ViQ29tYm8oXG4gICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgIHN0YXJ0aW5nS2V5TmFtZUluZGV4LFxuICAgICAgcHJlc3NlZEtleU5hbWVzXG4gICAgKTtcbiAgICBpZiAoc3RhcnRpbmdLZXlOYW1lSW5kZXggPT09IC0xKSB7IHJldHVybiBmYWxzZTsgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuS2V5Q29tYm8ucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbihvdGhlcktleUNvbWJvKSB7XG4gIGlmIChcbiAgICAhb3RoZXJLZXlDb21ibyB8fFxuICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgaWYgKHR5cGVvZiBvdGhlcktleUNvbWJvID09PSAnc3RyaW5nJykge1xuICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gIH1cblxuICBpZiAodGhpcy5zdWJDb21ib3MubGVuZ3RoICE9PSBvdGhlcktleUNvbWJvLnN1YkNvbWJvcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgIHZhciBvdGhlclN1YkNvbWJvID0gb3RoZXJLZXlDb21iby5zdWJDb21ib3NbaV0uc2xpY2UoMCk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICB2YXIga2V5TmFtZSA9IHN1YkNvbWJvW2pdO1xuICAgICAgdmFyIGluZGV4ICAgPSBvdGhlclN1YkNvbWJvLmluZGV4T2Yoa2V5TmFtZSk7XG5cbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5LZXlDb21iby5fc3BsaXRTdHIgPSBmdW5jdGlvbihzdHIsIGRlbGltaW5hdG9yKSB7XG4gIHZhciBzICA9IHN0cjtcbiAgdmFyIGQgID0gZGVsaW1pbmF0b3I7XG4gIHZhciBjICA9ICcnO1xuICB2YXIgY2EgPSBbXTtcblxuICBmb3IgKHZhciBjaSA9IDA7IGNpIDwgcy5sZW5ndGg7IGNpICs9IDEpIHtcbiAgICBpZiAoY2kgPiAwICYmIHNbY2ldID09PSBkICYmIHNbY2kgLSAxXSAhPT0gJ1xcXFwnKSB7XG4gICAgICBjYS5wdXNoKGMudHJpbSgpKTtcbiAgICAgIGMgPSAnJztcbiAgICAgIGNpICs9IDE7XG4gICAgfVxuICAgIGMgKz0gc1tjaV07XG4gIH1cbiAgaWYgKGMpIHsgY2EucHVzaChjLnRyaW0oKSk7IH1cblxuICByZXR1cm4gY2E7XG59O1xuXG5LZXlDb21iby5wcm90b3R5cGUuX2NoZWNrU3ViQ29tYm8gPSBmdW5jdGlvbihzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICBzdWJDb21ibyA9IHN1YkNvbWJvLnNsaWNlKDApO1xuICBwcmVzc2VkS2V5TmFtZXMgPSBwcmVzc2VkS2V5TmFtZXMuc2xpY2Uoc3RhcnRpbmdLZXlOYW1lSW5kZXgpO1xuXG4gIHZhciBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YkNvbWJvLmxlbmd0aDsgaSArPSAxKSB7XG5cbiAgICB2YXIga2V5TmFtZSA9IHN1YkNvbWJvW2ldO1xuICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgIHZhciBlc2NhcGVkS2V5TmFtZSA9IGtleU5hbWUuc2xpY2UoMSk7XG4gICAgICBpZiAoXG4gICAgICAgIGVzY2FwZWRLZXlOYW1lID09PSBLZXlDb21iby5jb21ib0RlbGltaW5hdG9yIHx8XG4gICAgICAgIGVzY2FwZWRLZXlOYW1lID09PSBLZXlDb21iby5rZXlEZWxpbWluYXRvclxuICAgICAgKSB7XG4gICAgICAgIGtleU5hbWUgPSBlc2NhcGVkS2V5TmFtZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSBwcmVzc2VkS2V5TmFtZXMuaW5kZXhPZihrZXlOYW1lKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgc3ViQ29tYm8uc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgZW5kSW5kZXggPSBpbmRleDtcbiAgICAgIH1cbiAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGVuZEluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Q29tYm87XG4iLCJcbnZhciBMb2NhbGUgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9rZXktY29tYm8nKTtcblxuXG5mdW5jdGlvbiBLZXlib2FyZCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcbiAgdGhpcy5fbG9jYWxlICAgICAgICAgICAgICAgPSBudWxsO1xuICB0aGlzLl9jdXJyZW50Q29udGV4dCAgICAgICA9IG51bGw7XG4gIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gIHRoaXMuX2xpc3RlbmVycyAgICAgICAgICAgID0gW107XG4gIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMgICAgID0gW107XG4gIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgICAgICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgICAgICA9ICcnO1xuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgICAgICA9IGZhbHNlO1xuICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nICAgPSBudWxsO1xuICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuICB0aGlzLl9jYWxsZXJIYW5kbGVyICAgICAgICA9IG51bGw7XG5cbiAgdGhpcy5zZXRDb250ZXh0KCdnbG9iYWwnKTtcbiAgdGhpcy53YXRjaCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpO1xufVxuXG5LZXlib2FyZC5wcm90b3R5cGUuc2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxlTmFtZSwgbG9jYWxlQnVpbGRlcikge1xuICB2YXIgbG9jYWxlID0gbnVsbDtcbiAgaWYgKHR5cGVvZiBsb2NhbGVOYW1lID09PSAnc3RyaW5nJykge1xuXG4gICAgaWYgKGxvY2FsZUJ1aWxkZXIpIHtcbiAgICAgIGxvY2FsZSA9IG5ldyBMb2NhbGUobG9jYWxlTmFtZSk7XG4gICAgICBsb2NhbGVCdWlsZGVyKGxvY2FsZSwgdGhpcy5fdGFyZ2V0UGxhdGZvcm0sIHRoaXMuX3RhcmdldFVzZXJBZ2VudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsZSA9IHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gfHwgbnVsbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxlICAgICA9IGxvY2FsZU5hbWU7XG4gICAgbG9jYWxlTmFtZSA9IGxvY2FsZS5fbG9jYWxlTmFtZTtcbiAgfVxuXG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgPSBsb2NhbGU7XG4gIHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gPSBsb2NhbGU7XG4gIGlmIChsb2NhbGUpIHtcbiAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMgPSBsb2NhbGUucHJlc3NlZEtleXM7XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5nZXRMb2NhbGUgPSBmdW5jdGlvbihsb2NhbE5hbWUpIHtcbiAgbG9jYWxOYW1lIHx8IChsb2NhbE5hbWUgPSB0aGlzLl9sb2NhbGUubG9jYWxlTmFtZSk7XG4gIHJldHVybiB0aGlzLl9sb2NhbGVzW2xvY2FsTmFtZV0gfHwgbnVsbDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgPSByZWxlYXNlSGFuZGxlcjtcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgID0gcHJlc3NIYW5kbGVyO1xuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgPSBrZXlDb21ib1N0cjtcbiAgICBrZXlDb21ib1N0ciAgICAgICAgICAgID0gbnVsbDtcbiAgfVxuXG4gIGlmIChcbiAgICBrZXlDb21ib1N0ciAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xuICApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9saXN0ZW5lcnMucHVzaCh7XG4gICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IGtleUNvbWJvU3RyID8gbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSA6IG51bGwsXG4gICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IHByZXNzSGFuZGxlciAgICAgICAgICAgfHwgbnVsbCxcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogcmVsZWFzZUhhbmRsZXIgICAgICAgICB8fCBudWxsLFxuICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlLFxuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlXG4gIH0pO1xufTtcbktleWJvYXJkLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xuS2V5Ym9hcmQucHJvdG90eXBlLm9uICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQ7XG5cbktleWJvYXJkLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmVsZWFzZUhhbmRsZXIgPSBwcmVzc0hhbmRsZXI7XG4gICAgcHJlc3NIYW5kbGVyICAgPSBrZXlDb21ib1N0cjtcbiAgICBrZXlDb21ib1N0ciA9IG51bGw7XG4gIH1cblxuICBpZiAoXG4gICAga2V5Q29tYm9TdHIgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy51bmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcblxuICAgIHZhciBjb21ib01hdGNoZXMgICAgICAgICAgPSAha2V5Q29tYm9TdHIgJiYgIWxpc3RlbmVyLmtleUNvbWJvIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmtleUNvbWJvICYmIGxpc3RlbmVyLmtleUNvbWJvLmlzRXF1YWwoa2V5Q29tYm9TdHIpO1xuICAgIHZhciBwcmVzc0hhbmRsZXJNYXRjaGVzICAgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmVzc0hhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc3NIYW5kbGVyID09PSBsaXN0ZW5lci5wcmVzc0hhbmRsZXI7XG4gICAgdmFyIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcyA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFyZWxlYXNlSGFuZGxlciAmJiAhbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgPT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xuXG4gICAgaWYgKGNvbWJvTWF0Y2hlcyAmJiBwcmVzc0hhbmRsZXJNYXRjaGVzICYmIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcykge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICB9XG4gIH1cbn07XG5LZXlib2FyZC5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUudW5iaW5kO1xuS2V5Ym9hcmQucHJvdG90eXBlLm9mZiAgICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnNldENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSkge1xuICBpZih0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG5cbiAgaWYgKCF0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0pIHtcbiAgICB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0gPSBbXTtcbiAgfVxuICB0aGlzLl9saXN0ZW5lcnMgICAgICA9IHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXTtcbiAgdGhpcy5fY3VycmVudENvbnRleHQgPSBjb250ZXh0TmFtZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9jdXJyZW50Q29udGV4dDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS53aXRoQ29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHROYW1lLCBjYWxsYmFjaykge1xuICB2YXIgcHJldmlvdXNDb250ZXh0TmFtZSA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuICB0aGlzLnNldENvbnRleHQoY29udGV4dE5hbWUpO1xuXG4gIGNhbGxiYWNrKCk7XG5cbiAgdGhpcy5zZXRDb250ZXh0KHByZXZpb3VzQ29udGV4dE5hbWUpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24odGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCB0YXJnZXRQbGF0Zm9ybSwgdGFyZ2V0VXNlckFnZW50KSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdGhpcy5zdG9wKCk7XG5cbiAgaWYgKCF0YXJnZXRXaW5kb3cpIHtcbiAgICBpZiAoIWdsb2JhbC5hZGRFdmVudExpc3RlbmVyICYmICFnbG9iYWwuYXR0YWNoRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgZ2xvYmFsIGZ1bmN0aW9ucyBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50LicpO1xuICAgIH1cbiAgICB0YXJnZXRXaW5kb3cgPSBnbG9iYWw7XG4gIH1cblxuICBpZiAodHlwZW9mIHRhcmdldFdpbmRvdy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICB0YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgICB0YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRFbGVtZW50O1xuICAgIHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdztcbiAgICB0YXJnZXRXaW5kb3cgICAgPSBnbG9iYWw7XG4gIH1cblxuICBpZiAoIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmICF0YXJnZXRXaW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQgbWV0aG9kcyBvbiB0YXJnZXRXaW5kb3cuJyk7XG4gIH1cblxuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuXG4gIHZhciB1c2VyQWdlbnQgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnO1xuICB2YXIgcGxhdGZvcm0gID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICB8fCAnJztcblxuICB0YXJnZXRFbGVtZW50ICAgJiYgdGFyZ2V0RWxlbWVudCAgICE9PSBudWxsIHx8ICh0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3cuZG9jdW1lbnQpO1xuICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XG4gIHRhcmdldFVzZXJBZ2VudCAmJiB0YXJnZXRVc2VyQWdlbnQgIT09IG51bGwgfHwgKHRhcmdldFVzZXJBZ2VudCA9IHVzZXJBZ2VudCk7XG5cbiAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICBfdGhpcy5faGFuZGxlQ29tbWFuZEJ1ZyhldmVudCwgcGxhdGZvcm0pO1xuICB9O1xuICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnJlbGVhc2VLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xuICB9O1xuICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnJlbGVhc2VBbGxLZXlzKGV2ZW50KVxuICB9O1xuXG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICB0aGlzLl90YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRFbGVtZW50O1xuICB0aGlzLl90YXJnZXRXaW5kb3cgICAgPSB0YXJnZXRXaW5kb3c7XG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICA9IHRhcmdldFBsYXRmb3JtO1xuICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRVc2VyQWdlbnQ7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIGlmICghdGhpcy5fdGFyZ2V0RWxlbWVudCB8fCAhdGhpcy5fdGFyZ2V0V2luZG93KSB7IHJldHVybjsgfVxuXG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuXG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRFbGVtZW50ID0gbnVsbDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5wcmVzc0tleSA9IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gIHRoaXMuX2xvY2FsZS5wcmVzc0tleShrZXlDb2RlKTtcbiAgdGhpcy5fYXBwbHlCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVsZWFzZUtleSA9IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gIHRoaXMuX2xvY2FsZS5yZWxlYXNlS2V5KGtleUNvZGUpO1xuICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZWxlYXNlQWxsS2V5cyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xuICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7XG4gIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPSAwO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgdGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICB0YXJnZXRFbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl91bmJpbmRFdmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICB0YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgIHRhcmdldEVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2dldEdyb3VwZWRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxpc3RlbmVyR3JvdXBzICAgPSBbXTtcbiAgdmFyIGxpc3RlbmVyR3JvdXBNYXAgPSBbXTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICBpZiAodGhpcy5fY3VycmVudENvbnRleHQgIT09ICdnbG9iYWwnKSB7XG4gICAgbGlzdGVuZXJzID0gW10uY29uY2F0KGxpc3RlbmVycywgdGhpcy5fY29udGV4dHMuZ2xvYmFsKTtcbiAgfVxuXG4gIGxpc3RlbmVycy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gKGIua2V5Q29tYm8gPyBiLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApIC0gKGEua2V5Q29tYm8gPyBhLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApO1xuICB9KS5mb3JFYWNoKGZ1bmN0aW9uKGwpIHtcbiAgICB2YXIgbWFwSW5kZXggPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmIChsaXN0ZW5lckdyb3VwTWFwW2ldID09PSBudWxsICYmIGwua2V5Q29tYm8gPT09IG51bGwgfHxcbiAgICAgICAgICBsaXN0ZW5lckdyb3VwTWFwW2ldICE9PSBudWxsICYmIGxpc3RlbmVyR3JvdXBNYXBbaV0uaXNFcXVhbChsLmtleUNvbWJvKSkge1xuICAgICAgICBtYXBJbmRleCA9IGk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChtYXBJbmRleCA9PT0gLTEpIHtcbiAgICAgIG1hcEluZGV4ID0gbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7XG4gICAgICBsaXN0ZW5lckdyb3VwTWFwLnB1c2gobC5rZXlDb21ibyk7XG4gICAgfVxuICAgIGlmICghbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdKSB7XG4gICAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0gPSBbXTtcbiAgICB9XG4gICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdLnB1c2gobCk7XG4gIH0pO1xuICByZXR1cm4gbGlzdGVuZXJHcm91cHM7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2FwcGx5QmluZGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xuICB2YXIgcHJldmVudFJlcGVhdCA9IGZhbHNlO1xuXG4gIGV2ZW50IHx8IChldmVudCA9IHt9KTtcbiAgZXZlbnQucHJldmVudFJlcGVhdCA9IGZ1bmN0aW9uKCkgeyBwcmV2ZW50UmVwZWF0ID0gdHJ1ZTsgfTtcbiAgZXZlbnQucHJlc3NlZEtleXMgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcblxuICB2YXIgcHJlc3NlZEtleXMgICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG4gIHZhciBsaXN0ZW5lckdyb3VwcyA9IHRoaXMuX2dldEdyb3VwZWRMaXN0ZW5lcnMoKTtcblxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gbGlzdGVuZXJHcm91cHNbaV07XG4gICAgdmFyIGtleUNvbWJvICA9IGxpc3RlbmVyc1swXS5rZXlDb21ibztcblxuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCBrZXlDb21iby5jaGVjayhwcmVzc2VkS2V5cykpIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGlzdGVuZXJzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tqXTtcblxuICAgICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwpIHtcbiAgICAgICAgICBsaXN0ZW5lciA9IHtcbiAgICAgICAgICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBuZXcgS2V5Q29tYm8ocHJlc3NlZEtleXMuam9pbignKycpKSxcbiAgICAgICAgICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBsaXN0ZW5lci5wcmVzc0hhbmRsZXIsXG4gICAgICAgICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIsXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogbGlzdGVuZXIucHJldmVudFJlcGVhdCxcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0ZW5lci5wcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXZlbnRSZXBlYXQpIHtcbiAgICAgICAgICBsaXN0ZW5lci5wcmVzc0hhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgaWYgKHByZXZlbnRSZXBlYXQpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBwcmV2ZW50UmVwZWF0O1xuICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciAmJiB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGtleUNvbWJvKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICB2YXIgaW5kZXggPSBwcmVzc2VkS2V5cy5pbmRleE9mKGtleUNvbWJvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBwcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgaiAtPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9jbGVhckJpbmRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZExpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnNbaV07XG4gICAgdmFyIGtleUNvbWJvID0gbGlzdGVuZXIua2V5Q29tYm87XG4gICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8ICFrZXlDb21iby5jaGVjayh0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMpKSB7XG4gICAgICBpZiAodGhpcy5fY2FsbGVySGFuZGxlciAhPT0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIpIHtcbiAgICAgICAgdmFyIG9sZENhbGxlciA9IHRoaXMuX2NhbGxlckhhbmRsZXI7XG4gICAgICAgIHRoaXMuX2NhbGxlckhhbmRsZXIgPSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcbiAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHQ7XG4gICAgICAgIGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICB0aGlzLl9jYWxsZXJIYW5kbGVyID0gb2xkQ2FsbGVyO1xuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2hhbmRsZUNvbW1hbmRCdWcgPSBmdW5jdGlvbihldmVudCwgcGxhdGZvcm0pIHtcbiAgLy8gT24gTWFjIHdoZW4gdGhlIGNvbW1hbmQga2V5IGlzIGtlcHQgcHJlc3NlZCwga2V5dXAgaXMgbm90IHRyaWdnZXJlZCBmb3IgYW55IG90aGVyIGtleS5cbiAgLy8gSW4gdGhpcyBjYXNlIGZvcmNlIGEga2V5dXAgZm9yIG5vbi1tb2RpZmllciBrZXlzIGRpcmVjdGx5IGFmdGVyIHRoZSBrZXlwcmVzcy5cbiAgdmFyIG1vZGlmaWVyS2V5cyA9IFtcInNoaWZ0XCIsIFwiY3RybFwiLCBcImFsdFwiLCBcImNhcHNsb2NrXCIsIFwidGFiXCIsIFwiY29tbWFuZFwiXTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpICYmIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5pbmNsdWRlcyhcImNvbW1hbmRcIikgJiZcbiAgICAgICFtb2RpZmllcktleXMuaW5jbHVkZXModGhpcy5fbG9jYWxlLmdldEtleU5hbWVzKGV2ZW50LmtleUNvZGUpWzBdKSkge1xuICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyhldmVudCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG4iLCJcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4va2V5LWNvbWJvJyk7XG5cblxuZnVuY3Rpb24gTG9jYWxlKG5hbWUpIHtcbiAgdGhpcy5sb2NhbGVOYW1lICAgICA9IG5hbWU7XG4gIHRoaXMucHJlc3NlZEtleXMgICAgPSBbXTtcbiAgdGhpcy5fYXBwbGllZE1hY3JvcyA9IFtdO1xuICB0aGlzLl9rZXlNYXAgICAgICAgID0ge307XG4gIHRoaXMuX2tpbGxLZXlDb2RlcyAgPSBbXTtcbiAgdGhpcy5fbWFjcm9zICAgICAgICA9IFtdO1xufVxuXG5Mb2NhbGUucHJvdG90eXBlLmJpbmRLZXlDb2RlID0gZnVuY3Rpb24oa2V5Q29kZSwga2V5TmFtZXMpIHtcbiAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ3N0cmluZycpIHtcbiAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gIH1cblxuICB0aGlzLl9rZXlNYXBba2V5Q29kZV0gPSBrZXlOYW1lcztcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuYmluZE1hY3JvID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIGtleU5hbWVzKSB7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAga2V5TmFtZXMgPSBbIGtleU5hbWVzIF07XG4gIH1cblxuICB2YXIgaGFuZGxlciA9IG51bGw7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBoYW5kbGVyID0ga2V5TmFtZXM7XG4gICAga2V5TmFtZXMgPSBudWxsO1xuICB9XG5cbiAgdmFyIG1hY3JvID0ge1xuICAgIGtleUNvbWJvIDogbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSxcbiAgICBrZXlOYW1lcyA6IGtleU5hbWVzLFxuICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICB9O1xuXG4gIHRoaXMuX21hY3Jvcy5wdXNoKG1hY3JvKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuZ2V0S2V5Q29kZXMgPSBmdW5jdGlvbihrZXlOYW1lKSB7XG4gIHZhciBrZXlDb2RlcyA9IFtdO1xuICBmb3IgKHZhciBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX2tleU1hcFtrZXlDb2RlXS5pbmRleE9mKGtleU5hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICB9XG4gIHJldHVybiBrZXlDb2Rlcztcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuZ2V0S2V5TmFtZXMgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLnNldEtpbGxLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMuc2V0S2lsbEtleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5wcmVzc0tleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5wcmVzc0tleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBrZXlOYW1lcyA9IHRoaXMuZ2V0S2V5TmFtZXMoa2V5Q29kZSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMucHJlc3NlZEtleXMucHVzaChrZXlOYW1lc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5fYXBwbHlNYWNyb3MoKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUucmVsZWFzZUtleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICB9XG4gIH1cblxuICBlbHNlIHtcbiAgICB2YXIga2V5TmFtZXMgICAgICAgICA9IHRoaXMuZ2V0S2V5TmFtZXMoa2V5Q29kZSk7XG4gICAgdmFyIGtpbGxLZXlDb2RlSW5kZXggPSB0aGlzLl9raWxsS2V5Q29kZXMuaW5kZXhPZihrZXlDb2RlKTtcbiAgICBcbiAgICBpZiAoa2lsbEtleUNvZGVJbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jbGVhck1hY3JvcygpO1xuICB9XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLl9hcHBseU1hY3JvcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbWFjcm9zID0gdGhpcy5fbWFjcm9zLnNsaWNlKDApO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBtYWNybyA9IG1hY3Jvc1tpXTtcbiAgICBpZiAobWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgIG1hY3JvLmtleU5hbWVzID0gbWFjcm8uaGFuZGxlcih0aGlzLnByZXNzZWRLZXlzKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSkgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5wdXNoKG1hY3JvKTtcbiAgICB9XG4gIH1cbn07XG5cbkxvY2FsZS5wcm90b3R5cGUuX2NsZWFyTWFjcm9zID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZE1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBtYWNybyA9IHRoaXMuX2FwcGxpZWRNYWNyb3NbaV07XG4gICAgaWYgKCFtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgbWFjcm8ua2V5TmFtZXMgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxlO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxvY2FsZSwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xuXG4gIC8vIGdlbmVyYWxcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMsICAgWydjYW5jZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg4LCAgIFsnYmFja3NwYWNlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOSwgICBbJ3RhYiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyLCAgWydjbGVhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzLCAgWydlbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE2LCAgWydzaGlmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE3LCAgWydjdHJsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTgsICBbJ2FsdCcsICdtZW51J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTksICBbJ3BhdXNlJywgJ2JyZWFrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjAsICBbJ2NhcHNsb2NrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjcsICBbJ2VzY2FwZScsICdlc2MnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMiwgIFsnc3BhY2UnLCAnc3BhY2ViYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMywgIFsncGFnZXVwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzQsICBbJ3BhZ2Vkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzUsICBbJ2VuZCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM2LCAgWydob21lJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzcsICBbJ2xlZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOCwgIFsndXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOSwgIFsncmlnaHQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MCwgIFsnZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQxLCAgWydzZWxlY3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MiwgIFsncHJpbnRzY3JlZW4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MywgIFsnZXhlY3V0ZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ0LCAgWydzbmFwc2hvdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ1LCAgWydpbnNlcnQnLCAnaW5zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDYsICBbJ2RlbGV0ZScsICdkZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NywgIFsnaGVscCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NSwgWydzY3JvbGxsb2NrJywgJ3Njcm9sbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4NywgWydlcXVhbCcsICdlcXVhbHNpZ24nLCAnPSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4OCwgWydjb21tYScsICcsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkwLCBbJ3BlcmlvZCcsICcuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkxLCBbJ3NsYXNoJywgJ2ZvcndhcmRzbGFzaCcsICcvJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkyLCBbJ2dyYXZlYWNjZW50JywgJ2AnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMTksIFsnb3BlbmJyYWNrZXQnLCAnWyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMCwgWydiYWNrc2xhc2gnLCAnXFxcXCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMSwgWydjbG9zZWJyYWNrZXQnLCAnXSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMiwgWydhcG9zdHJvcGhlJywgJ1xcJyddKTtcblxuICAvLyAwLTlcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ4LCBbJ3plcm8nLCAnMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ5LCBbJ29uZScsICcxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTAsIFsndHdvJywgJzInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MSwgWyd0aHJlZScsICczJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTIsIFsnZm91cicsICc0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTMsIFsnZml2ZScsICc1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTQsIFsnc2l4JywgJzYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NSwgWydzZXZlbicsICc3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTYsIFsnZWlnaHQnLCAnOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU3LCBbJ25pbmUnLCAnOSddKTtcblxuICAvLyBudW1wYWRcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk2LCBbJ251bXplcm8nLCAnbnVtMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk3LCBbJ251bW9uZScsICdudW0xJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTgsIFsnbnVtdHdvJywgJ251bTInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OSwgWydudW10aHJlZScsICdudW0zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAwLCBbJ251bWZvdXInLCAnbnVtNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMSwgWydudW1maXZlJywgJ251bTUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDIsIFsnbnVtc2l4JywgJ251bTYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDMsIFsnbnVtc2V2ZW4nLCAnbnVtNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNCwgWydudW1laWdodCcsICdudW04J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA1LCBbJ251bW5pbmUnLCAnbnVtOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNiwgWydudW1tdWx0aXBseScsICdudW0qJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA3LCBbJ251bWFkZCcsICdudW0rJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA4LCBbJ251bWVudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA5LCBbJ251bXN1YnRyYWN0JywgJ251bS0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTAsIFsnbnVtZGVjaW1hbCcsICdudW0uJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTExLCBbJ251bWRpdmlkZScsICdudW0vJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ0LCBbJ251bWxvY2snLCAnbnVtJ10pO1xuXG4gIC8vIGZ1bmN0aW9uIGtleXNcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMiwgWydmMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMywgWydmMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNCwgWydmMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNSwgWydmNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNiwgWydmNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNywgWydmNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOCwgWydmNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOSwgWydmOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMCwgWydmOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMSwgWydmMTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjIsIFsnZjExJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIzLCBbJ2YxMiddKTtcblxuICAvLyBzZWNvbmRhcnkga2V5IHN5bWJvbHNcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBgJywgWyd0aWxkZScsICd+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDEnLCBbJ2V4Y2xhbWF0aW9uJywgJ2V4Y2xhbWF0aW9ucG9pbnQnLCAnISddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAyJywgWydhdCcsICdAJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDMnLCBbJ251bWJlcicsICcjJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDQnLCBbJ2RvbGxhcicsICdkb2xsYXJzJywgJ2RvbGxhcnNpZ24nLCAnJCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA1JywgWydwZXJjZW50JywgJyUnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNicsIFsnY2FyZXQnLCAnXiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA3JywgWydhbXBlcnNhbmQnLCAnYW5kJywgJyYnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOCcsIFsnYXN0ZXJpc2snLCAnKiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA5JywgWydvcGVucGFyZW4nLCAnKCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAwJywgWydjbG9zZXBhcmVuJywgJyknXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLScsIFsndW5kZXJzY29yZScsICdfJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArID0nLCBbJ3BsdXMnLCAnKyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBbJywgWydvcGVuY3VybHlicmFjZScsICdvcGVuY3VybHlicmFja2V0JywgJ3snXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXScsIFsnY2xvc2VjdXJseWJyYWNlJywgJ2Nsb3NlY3VybHlicmFja2V0JywgJ30nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFxcXCcsIFsndmVydGljYWxiYXInLCAnfCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA7JywgWydjb2xvbicsICc6J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcJycsIFsncXVvdGF0aW9ubWFyaycsICdcXCcnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgISwnLCBbJ29wZW5hbmdsZWJyYWNrZXQnLCAnPCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAuJywgWydjbG9zZWFuZ2xlYnJhY2tldCcsICc+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC8nLCBbJ3F1ZXN0aW9ubWFyaycsICc/J10pO1xuICBcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSkge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2NvbW1hbmQnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfSBlbHNlIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjdHJsJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH1cblxuICAvL2EteiBhbmQgQS1aXG4gIGZvciAodmFyIGtleUNvZGUgPSA2NTsga2V5Q29kZSA8PSA5MDsga2V5Q29kZSArPSAxKSB7XG4gICAgdmFyIGtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUgKyAzMik7XG4gICAgdmFyIGNhcGl0YWxLZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcbiAgXHRsb2NhbGUuYmluZEtleUNvZGUoa2V5Q29kZSwga2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ2NhcHNsb2NrICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgfVxuXG4gIC8vIGJyb3dzZXIgY2F2ZWF0c1xuICB2YXIgc2VtaWNvbG9uS2V5Q29kZSA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNTkgIDogMTg2O1xuICB2YXIgZGFzaEtleUNvZGUgICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gMTczIDogMTg5O1xuICB2YXIgbGVmdENvbW1hbmRLZXlDb2RlO1xuICB2YXIgcmlnaHRDb21tYW5kS2V5Q29kZTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiAodXNlckFnZW50Lm1hdGNoKCdTYWZhcmknKSB8fCB1c2VyQWdlbnQubWF0Y2goJ0Nocm9tZScpKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSA5MTtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gOTM7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdPcGVyYScpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDE3O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAxNztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAyMjQ7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDIyNDtcbiAgfVxuICBsb2NhbGUuYmluZEtleUNvZGUoc2VtaWNvbG9uS2V5Q29kZSwgICAgWydzZW1pY29sb24nLCAnOyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGRhc2hLZXlDb2RlLCAgICAgICAgIFsnZGFzaCcsICctJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUobGVmdENvbW1hbmRLZXlDb2RlLCAgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ2xlZnRjb21tYW5kJywgJ2xlZnR3aW5kb3dzJywgJ2xlZnR3aW4nLCAnbGVmdHN1cGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUocmlnaHRDb21tYW5kS2V5Q29kZSwgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ3JpZ2h0Y29tbWFuZCcsICdyaWdodHdpbmRvd3MnLCAncmlnaHR3aW4nLCAncmlnaHRzdXBlciddKTtcblxuICAvLyBraWxsIGtleXNcbiAgbG9jYWxlLnNldEtpbGxLZXkoJ2NvbW1hbmQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN1YmplY3QpIHtcbiAgdmFsaWRhdGVTdWJqZWN0KHN1YmplY3QpO1xuXG4gIHZhciBldmVudHNTdG9yYWdlID0gY3JlYXRlRXZlbnRzU3RvcmFnZShzdWJqZWN0KTtcbiAgc3ViamVjdC5vbiA9IGV2ZW50c1N0b3JhZ2Uub247XG4gIHN1YmplY3Qub2ZmID0gZXZlbnRzU3RvcmFnZS5vZmY7XG4gIHN1YmplY3QuZmlyZSA9IGV2ZW50c1N0b3JhZ2UuZmlyZTtcbiAgcmV0dXJuIHN1YmplY3Q7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVFdmVudHNTdG9yYWdlKHN1YmplY3QpIHtcbiAgLy8gU3RvcmUgYWxsIGV2ZW50IGxpc3RlbmVycyB0byB0aGlzIGhhc2guIEtleSBpcyBldmVudCBuYW1lLCB2YWx1ZSBpcyBhcnJheVxuICAvLyBvZiBjYWxsYmFjayByZWNvcmRzLlxuICAvL1xuICAvLyBBIGNhbGxiYWNrIHJlY29yZCBjb25zaXN0cyBvZiBjYWxsYmFjayBmdW5jdGlvbiBhbmQgaXRzIG9wdGlvbmFsIGNvbnRleHQ6XG4gIC8vIHsgJ2V2ZW50TmFtZScgPT4gW3tjYWxsYmFjazogZnVuY3Rpb24sIGN0eDogb2JqZWN0fV0gfVxuICB2YXIgcmVnaXN0ZXJlZEV2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHtcbiAgICBvbjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbGxiYWNrIGlzIGV4cGVjdGVkIHRvIGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIH1cbiAgICAgIHZhciBoYW5kbGVycyA9IHJlZ2lzdGVyZWRFdmVudHNbZXZlbnROYW1lXTtcbiAgICAgIGlmICghaGFuZGxlcnMpIHtcbiAgICAgICAgaGFuZGxlcnMgPSByZWdpc3RlcmVkRXZlbnRzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGhhbmRsZXJzLnB1c2goe2NhbGxiYWNrOiBjYWxsYmFjaywgY3R4OiBjdHh9KTtcblxuICAgICAgcmV0dXJuIHN1YmplY3Q7XG4gICAgfSxcblxuICAgIG9mZjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciB3YW50VG9SZW1vdmVBbGwgPSAodHlwZW9mIGV2ZW50TmFtZSA9PT0gJ3VuZGVmaW5lZCcpO1xuICAgICAgaWYgKHdhbnRUb1JlbW92ZUFsbCkge1xuICAgICAgICAvLyBLaWxsaW5nIG9sZCBldmVudHMgc3RvcmFnZSBzaG91bGQgYmUgZW5vdWdoIGluIHRoaXMgY2FzZTpcbiAgICAgICAgcmVnaXN0ZXJlZEV2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHJldHVybiBzdWJqZWN0O1xuICAgICAgfVxuXG4gICAgICBpZiAocmVnaXN0ZXJlZEV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICAgIHZhciBkZWxldGVBbGxDYWxsYmFja3NGb3JFdmVudCA9ICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpO1xuICAgICAgICBpZiAoZGVsZXRlQWxsQ2FsbGJhY2tzRm9yRXZlbnQpIHtcbiAgICAgICAgICBkZWxldGUgcmVnaXN0ZXJlZEV2ZW50c1tldmVudE5hbWVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBjYWxsYmFja3MgPSByZWdpc3RlcmVkRXZlbnRzW2V2ZW50TmFtZV07XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFja3NbaV0uY2FsbGJhY2sgPT09IGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdWJqZWN0O1xuICAgIH0sXG5cbiAgICBmaXJlOiBmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICB2YXIgY2FsbGJhY2tzID0gcmVnaXN0ZXJlZEV2ZW50c1tldmVudE5hbWVdO1xuICAgICAgaWYgKCFjYWxsYmFja3MpIHtcbiAgICAgICAgcmV0dXJuIHN1YmplY3Q7XG4gICAgICB9XG5cbiAgICAgIHZhciBmaXJlQXJndW1lbnRzO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZpcmVBcmd1bWVudHMgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIH1cbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrSW5mbyA9IGNhbGxiYWNrc1tpXTtcbiAgICAgICAgY2FsbGJhY2tJbmZvLmNhbGxiYWNrLmFwcGx5KGNhbGxiYWNrSW5mby5jdHgsIGZpcmVBcmd1bWVudHMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3ViamVjdDtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU3ViamVjdChzdWJqZWN0KSB7XG4gIGlmICghc3ViamVjdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXZlbnRpZnkgY2Fubm90IHVzZSBmYWxzeSBvYmplY3QgYXMgZXZlbnRzIHN1YmplY3QnKTtcbiAgfVxuICB2YXIgcmVzZXJ2ZWRXb3JkcyA9IFsnb24nLCAnZmlyZScsICdvZmYnXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXNlcnZlZFdvcmRzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKHN1YmplY3QuaGFzT3duUHJvcGVydHkocmVzZXJ2ZWRXb3Jkc1tpXSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlN1YmplY3QgY2Fubm90IGJlIGV2ZW50aWZpZWQsIHNpbmNlIGl0IGFscmVhZHkgaGFzIHByb3BlcnR5ICdcIiArIHJlc2VydmVkV29yZHNbaV0gKyBcIidcIik7XG4gICAgfVxuICB9XG59XG4iLCIvKipcbiAqIEBmaWxlT3ZlcnZpZXcgQ29udGFpbnMgZGVmaW5pdGlvbiBvZiB0aGUgY29yZSBncmFwaCBvYmplY3QuXG4gKi9cblxuLy8gVE9ETzogbmVlZCB0byBjaGFuZ2Ugc3RvcmFnZSBsYXllcjpcbi8vIDEuIEJlIGFibGUgdG8gZ2V0IGFsbCBub2RlcyBPKDEpXG4vLyAyLiBCZSBhYmxlIHRvIGdldCBudW1iZXIgb2YgbGlua3MgTygxKVxuXG4vKipcbiAqIEBleGFtcGxlXG4gKiAgdmFyIGdyYXBoID0gcmVxdWlyZSgnbmdyYXBoLmdyYXBoJykoKTtcbiAqICBncmFwaC5hZGROb2RlKDEpOyAgICAgLy8gZ3JhcGggaGFzIG9uZSBub2RlLlxuICogIGdyYXBoLmFkZExpbmsoMiwgMyk7ICAvLyBub3cgZ3JhcGggY29udGFpbnMgdGhyZWUgbm9kZXMgYW5kIG9uZSBsaW5rLlxuICpcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVHcmFwaDtcblxudmFyIGV2ZW50aWZ5ID0gcmVxdWlyZSgnbmdyYXBoLmV2ZW50cycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZ3JhcGhcbiAqL1xuZnVuY3Rpb24gY3JlYXRlR3JhcGgob3B0aW9ucykge1xuICAvLyBHcmFwaCBzdHJ1Y3R1cmUgaXMgbWFpbnRhaW5lZCBhcyBkaWN0aW9uYXJ5IG9mIG5vZGVzXG4gIC8vIGFuZCBhcnJheSBvZiBsaW5rcy4gRWFjaCBub2RlIGhhcyAnbGlua3MnIHByb3BlcnR5IHdoaWNoXG4gIC8vIGhvbGQgYWxsIGxpbmtzIHJlbGF0ZWQgdG8gdGhhdCBub2RlLiBBbmQgZ2VuZXJhbCBsaW5rc1xuICAvLyBhcnJheSBpcyB1c2VkIHRvIHNwZWVkIHVwIGFsbCBsaW5rcyBlbnVtZXJhdGlvbi4gVGhpcyBpcyBpbmVmZmljaWVudFxuICAvLyBpbiB0ZXJtcyBvZiBtZW1vcnksIGJ1dCBzaW1wbGlmaWVzIGNvZGluZy5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGlmICgndW5pcXVlTGlua0lkJyBpbiBvcHRpb25zKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ25ncmFwaC5ncmFwaDogU3RhcnRpbmcgZnJvbSB2ZXJzaW9uIDAuMTQgYHVuaXF1ZUxpbmtJZGAgaXMgZGVwcmVjYXRlZC5cXG4nICtcbiAgICAgICdVc2UgYG11bHRpZ3JhcGhgIG9wdGlvbiBpbnN0ZWFkXFxuJyxcbiAgICAgICdcXG4nLFxuICAgICAgJ05vdGU6IHRoZXJlIGlzIGFsc28gY2hhbmdlIGluIGRlZmF1bHQgYmVoYXZpb3I6IEZyb20gbm93IG93biBlYWNoIGdyYXBoXFxuJytcbiAgICAgICdpcyBjb25zaWRlcmVkIHRvIGJlIG5vdCBhIG11bHRpZ3JhcGggYnkgZGVmYXVsdCAoZWFjaCBlZGdlIGlzIHVuaXF1ZSkuJ1xuICAgICk7XG5cbiAgICBvcHRpb25zLm11bHRpZ3JhcGggPSBvcHRpb25zLnVuaXF1ZUxpbmtJZDtcbiAgfVxuXG4gIC8vIERlYXIgcmVhZGVyLCB0aGUgbm9uLW11bHRpZ3JhcGhzIGRvIG5vdCBndWFyYW50ZWUgdGhhdCB0aGVyZSBpcyBvbmx5XG4gIC8vIG9uZSBsaW5rIGZvciBhIGdpdmVuIHBhaXIgb2Ygbm9kZS4gV2hlbiB0aGlzIG9wdGlvbiBpcyBzZXQgdG8gZmFsc2VcbiAgLy8gd2UgY2FuIHNhdmUgc29tZSBtZW1vcnkgYW5kIENQVSAoMTglIGZhc3RlciBmb3Igbm9uLW11bHRpZ3JhcGgpO1xuICBpZiAob3B0aW9ucy5tdWx0aWdyYXBoID09PSB1bmRlZmluZWQpIG9wdGlvbnMubXVsdGlncmFwaCA9IGZhbHNlO1xuXG4gIHZhciBub2RlcyA9IHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nID8gT2JqZWN0LmNyZWF0ZShudWxsKSA6IHt9LFxuICAgIGxpbmtzID0gW10sXG4gICAgLy8gSGFzaCBvZiBtdWx0aS1lZGdlcy4gVXNlZCB0byB0cmFjayBpZHMgb2YgZWRnZXMgYmV0d2VlbiBzYW1lIG5vZGVzXG4gICAgbXVsdGlFZGdlcyA9IHt9LFxuICAgIG5vZGVzQ291bnQgPSAwLFxuICAgIHN1c3BlbmRFdmVudHMgPSAwLFxuXG4gICAgZm9yRWFjaE5vZGUgPSBjcmVhdGVOb2RlSXRlcmF0b3IoKSxcbiAgICBjcmVhdGVMaW5rID0gb3B0aW9ucy5tdWx0aWdyYXBoID8gY3JlYXRlVW5pcXVlTGluayA6IGNyZWF0ZVNpbmdsZUxpbmssXG5cbiAgICAvLyBPdXIgZ3JhcGggQVBJIHByb3ZpZGVzIG1lYW5zIHRvIGxpc3RlbiB0byBncmFwaCBjaGFuZ2VzLiBVc2VycyBjYW4gc3Vic2NyaWJlXG4gICAgLy8gdG8gYmUgbm90aWZpZWQgYWJvdXQgY2hhbmdlcyBpbiB0aGUgZ3JhcGggYnkgdXNpbmcgYG9uYCBtZXRob2QuIEhvd2V2ZXJcbiAgICAvLyBpbiBzb21lIGNhc2VzIHRoZXkgZG9uJ3QgdXNlIGl0LiBUbyBhdm9pZCB1bm5lY2Vzc2FyeSBtZW1vcnkgY29uc3VtcHRpb25cbiAgICAvLyB3ZSB3aWxsIG5vdCByZWNvcmQgZ3JhcGggY2hhbmdlcyB1bnRpbCB3ZSBoYXZlIGF0IGxlYXN0IG9uZSBzdWJzY3JpYmVyLlxuICAgIC8vIENvZGUgYmVsb3cgc3VwcG9ydHMgdGhpcyBvcHRpbWl6YXRpb24uXG4gICAgLy9cbiAgICAvLyBBY2N1bXVsYXRlcyBhbGwgY2hhbmdlcyBtYWRlIGR1cmluZyBncmFwaCB1cGRhdGVzLlxuICAgIC8vIEVhY2ggY2hhbmdlIGVsZW1lbnQgY29udGFpbnM6XG4gICAgLy8gIGNoYW5nZVR5cGUgLSBvbmUgb2YgdGhlIHN0cmluZ3M6ICdhZGQnLCAncmVtb3ZlJyBvciAndXBkYXRlJztcbiAgICAvLyAgbm9kZSAtIGlmIGNoYW5nZSBpcyByZWxhdGVkIHRvIG5vZGUgdGhpcyBwcm9wZXJ0eSBpcyBzZXQgdG8gY2hhbmdlZCBncmFwaCdzIG5vZGU7XG4gICAgLy8gIGxpbmsgLSBpZiBjaGFuZ2UgaXMgcmVsYXRlZCB0byBsaW5rIHRoaXMgcHJvcGVydHkgaXMgc2V0IHRvIGNoYW5nZWQgZ3JhcGgncyBsaW5rO1xuICAgIGNoYW5nZXMgPSBbXSxcbiAgICByZWNvcmRMaW5rQ2hhbmdlID0gbm9vcCxcbiAgICByZWNvcmROb2RlQ2hhbmdlID0gbm9vcCxcbiAgICBlbnRlck1vZGlmaWNhdGlvbiA9IG5vb3AsXG4gICAgZXhpdE1vZGlmaWNhdGlvbiA9IG5vb3A7XG5cbiAgLy8gdGhpcyBpcyBvdXIgcHVibGljIEFQSTpcbiAgdmFyIGdyYXBoUGFydCA9IHtcbiAgICAvKipcbiAgICAgKiBBZGRzIG5vZGUgdG8gdGhlIGdyYXBoLiBJZiBub2RlIHdpdGggZ2l2ZW4gaWQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGdyYXBoXG4gICAgICogaXRzIGRhdGEgaXMgZXh0ZW5kZWQgd2l0aCB3aGF0ZXZlciBjb21lcyBpbiAnZGF0YScgYXJndW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbm9kZUlkIHRoZSBub2RlJ3MgaWRlbnRpZmllci4gQSBzdHJpbmcgb3IgbnVtYmVyIGlzIHByZWZlcnJlZC5cbiAgICAgKiBAcGFyYW0gW2RhdGFdIGFkZGl0aW9uYWwgZGF0YSBmb3IgdGhlIG5vZGUgYmVpbmcgYWRkZWQuIElmIG5vZGUgYWxyZWFkeVxuICAgICAqICAgZXhpc3RzIGl0cyBkYXRhIG9iamVjdCBpcyBhdWdtZW50ZWQgd2l0aCB0aGUgbmV3IG9uZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge25vZGV9IFRoZSBuZXdseSBhZGRlZCBub2RlIG9yIG5vZGUgd2l0aCBnaXZlbiBpZCBpZiBpdCBhbHJlYWR5IGV4aXN0cy5cbiAgICAgKi9cbiAgICBhZGROb2RlOiBhZGROb2RlLFxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpbmsgdG8gdGhlIGdyYXBoLiBUaGUgZnVuY3Rpb24gYWx3YXlzIGNyZWF0ZSBhIG5ld1xuICAgICAqIGxpbmsgYmV0d2VlbiB0d28gbm9kZXMuIElmIG9uZSBvZiB0aGUgbm9kZXMgZG9lcyBub3QgZXhpc3RzXG4gICAgICogYSBuZXcgbm9kZSBpcyBjcmVhdGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIGZyb21JZCBsaW5rIHN0YXJ0IG5vZGUgaWQ7XG4gICAgICogQHBhcmFtIHRvSWQgbGluayBlbmQgbm9kZSBpZDtcbiAgICAgKiBAcGFyYW0gW2RhdGFdIGFkZGl0aW9uYWwgZGF0YSB0byBiZSBzZXQgb24gdGhlIG5ldyBsaW5rO1xuICAgICAqXG4gICAgICogQHJldHVybiB7bGlua30gVGhlIG5ld2x5IGNyZWF0ZWQgbGlua1xuICAgICAqL1xuICAgIGFkZExpbms6IGFkZExpbmssXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGxpbmsgZnJvbSB0aGUgZ3JhcGguIElmIGxpbmsgZG9lcyBub3QgZXhpc3QgZG9lcyBub3RoaW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtIGxpbmsgLSBvYmplY3QgcmV0dXJuZWQgYnkgYWRkTGluaygpIG9yIGdldExpbmtzKCkgbWV0aG9kcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgbGluayB3YXMgcmVtb3ZlZDsgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHJlbW92ZUxpbms6IHJlbW92ZUxpbmssXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIG5vZGUgd2l0aCBnaXZlbiBpZCBmcm9tIHRoZSBncmFwaC4gSWYgbm9kZSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgZ3JhcGhcbiAgICAgKiBkb2VzIG5vdGhpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbm9kZUlkIG5vZGUncyBpZGVudGlmaWVyIHBhc3NlZCB0byBhZGROb2RlKCkgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIG5vZGUgd2FzIHJlbW92ZWQ7IGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICByZW1vdmVOb2RlOiByZW1vdmVOb2RlLFxuXG4gICAgLyoqXG4gICAgICogR2V0cyBub2RlIHdpdGggZ2l2ZW4gaWRlbnRpZmllci4gSWYgbm9kZSBkb2VzIG5vdCBleGlzdCB1bmRlZmluZWQgdmFsdWUgaXMgcmV0dXJuZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbm9kZUlkIHJlcXVlc3RlZCBub2RlIGlkZW50aWZpZXI7XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtub2RlfSBpbiB3aXRoIHJlcXVlc3RlZCBpZGVudGlmaWVyIG9yIHVuZGVmaW5lZCBpZiBubyBzdWNoIG5vZGUgZXhpc3RzLlxuICAgICAqL1xuICAgIGdldE5vZGU6IGdldE5vZGUsXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIG51bWJlciBvZiBub2RlcyBpbiB0aGlzIGdyYXBoLlxuICAgICAqXG4gICAgICogQHJldHVybiBudW1iZXIgb2Ygbm9kZXMgaW4gdGhlIGdyYXBoLlxuICAgICAqL1xuICAgIGdldE5vZGVzQ291bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBub2Rlc0NvdW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRvdGFsIG51bWJlciBvZiBsaW5rcyBpbiB0aGUgZ3JhcGguXG4gICAgICovXG4gICAgZ2V0TGlua3NDb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGxpbmtzLmxlbmd0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbGwgbGlua3MgKGluYm91bmQgYW5kIG91dGJvdW5kKSBmcm9tIHRoZSBub2RlIHdpdGggZ2l2ZW4gaWQuXG4gICAgICogSWYgbm9kZSB3aXRoIGdpdmVuIGlkIGlzIG5vdCBmb3VuZCBudWxsIGlzIHJldHVybmVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5vZGVJZCByZXF1ZXN0ZWQgbm9kZSBpZGVudGlmaWVyLlxuICAgICAqXG4gICAgICogQHJldHVybiBBcnJheSBvZiBsaW5rcyBmcm9tIGFuZCB0byByZXF1ZXN0ZWQgbm9kZSBpZiBzdWNoIG5vZGUgZXhpc3RzO1xuICAgICAqICAgb3RoZXJ3aXNlIG51bGwgaXMgcmV0dXJuZWQuXG4gICAgICovXG4gICAgZ2V0TGlua3M6IGdldExpbmtzLFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlcyBjYWxsYmFjayBvbiBlYWNoIG5vZGUgb2YgdGhlIGdyYXBoLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbihub2RlKX0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gYmUgaW52b2tlZC4gVGhlIGZ1bmN0aW9uXG4gICAgICogICBpcyBwYXNzZWQgb25lIGFyZ3VtZW50OiB2aXNpdGVkIG5vZGUuXG4gICAgICovXG4gICAgZm9yRWFjaE5vZGU6IGZvckVhY2hOb2RlLFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlcyBjYWxsYmFjayBvbiBldmVyeSBsaW5rZWQgKGFkamFjZW50KSBub2RlIHRvIHRoZSBnaXZlbiBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbm9kZUlkIElkZW50aWZpZXIgb2YgdGhlIHJlcXVlc3RlZCBub2RlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb24obm9kZSwgbGluayl9IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBhbGwgbGlua2VkIG5vZGVzLlxuICAgICAqICAgVGhlIGZ1bmN0aW9uIGlzIHBhc3NlZCB0d28gcGFyYW1ldGVyczogYWRqYWNlbnQgbm9kZSBhbmQgbGluayBvYmplY3QgaXRzZWxmLlxuICAgICAqIEBwYXJhbSBvcmllbnRlZCBpZiB0cnVlIGdyYXBoIHRyZWF0ZWQgYXMgb3JpZW50ZWQuXG4gICAgICovXG4gICAgZm9yRWFjaExpbmtlZE5vZGU6IGZvckVhY2hMaW5rZWROb2RlLFxuXG4gICAgLyoqXG4gICAgICogRW51bWVyYXRlcyBhbGwgbGlua3MgaW4gdGhlIGdyYXBoXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9uKGxpbmspfSBjYWxsYmFjayBGdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYWxsIGxpbmtzIGluIHRoZSBncmFwaC5cbiAgICAgKiAgIFRoZSBmdW5jdGlvbiBpcyBwYXNzZWQgb25lIHBhcmFtZXRlcjogZ3JhcGgncyBsaW5rIG9iamVjdC5cbiAgICAgKlxuICAgICAqIExpbmsgb2JqZWN0IGNvbnRhaW5zIGF0IGxlYXN0IHRoZSBmb2xsb3dpbmcgZmllbGRzOlxuICAgICAqICBmcm9tSWQgLSBub2RlIGlkIHdoZXJlIGxpbmsgc3RhcnRzO1xuICAgICAqICB0b0lkIC0gbm9kZSBpZCB3aGVyZSBsaW5rIGVuZHMsXG4gICAgICogIGRhdGEgLSBhZGRpdGlvbmFsIGRhdGEgcGFzc2VkIHRvIGdyYXBoLmFkZExpbmsoKSBtZXRob2QuXG4gICAgICovXG4gICAgZm9yRWFjaExpbms6IGZvckVhY2hMaW5rLFxuXG4gICAgLyoqXG4gICAgICogU3VzcGVuZCBhbGwgbm90aWZpY2F0aW9ucyBhYm91dCBncmFwaCBjaGFuZ2VzIHVudGlsXG4gICAgICogZW5kVXBkYXRlIGlzIGNhbGxlZC5cbiAgICAgKi9cbiAgICBiZWdpblVwZGF0ZTogZW50ZXJNb2RpZmljYXRpb24sXG5cbiAgICAvKipcbiAgICAgKiBSZXN1bWVzIGFsbCBub3RpZmljYXRpb25zIGFib3V0IGdyYXBoIGNoYW5nZXMgYW5kIGZpcmVzXG4gICAgICogZ3JhcGggJ2NoYW5nZWQnIGV2ZW50IGluIGNhc2UgdGhlcmUgYXJlIGFueSBwZW5kaW5nIGNoYW5nZXMuXG4gICAgICovXG4gICAgZW5kVXBkYXRlOiBleGl0TW9kaWZpY2F0aW9uLFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgbm9kZXMgYW5kIGxpbmtzIGZyb20gdGhlIGdyYXBoLlxuICAgICAqL1xuICAgIGNsZWFyOiBjbGVhcixcblxuICAgIC8qKlxuICAgICAqIERldGVjdHMgd2hldGhlciB0aGVyZSBpcyBhIGxpbmsgYmV0d2VlbiB0d28gbm9kZXMuXG4gICAgICogT3BlcmF0aW9uIGNvbXBsZXhpdHkgaXMgTyhuKSB3aGVyZSBuIC0gbnVtYmVyIG9mIGxpbmtzIG9mIGEgbm9kZS5cbiAgICAgKiBOT1RFOiB0aGlzIGZ1bmN0aW9uIGlzIHN5bm9uaW0gZm9yIGdldExpbmsoKVxuICAgICAqXG4gICAgICogQHJldHVybnMgbGluayBpZiB0aGVyZSBpcyBvbmUuIG51bGwgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGhhc0xpbms6IGdldExpbmssXG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3RzIHdoZXRoZXIgdGhlcmUgaXMgYSBub2RlIHdpdGggZ2l2ZW4gaWRcbiAgICAgKiBcbiAgICAgKiBPcGVyYXRpb24gY29tcGxleGl0eSBpcyBPKDEpXG4gICAgICogTk9URTogdGhpcyBmdW5jdGlvbiBpcyBzeW5vbmltIGZvciBnZXROb2RlKClcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIG5vZGUgaWYgdGhlcmUgaXMgb25lOyBGYWxzeSB2YWx1ZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgaGFzTm9kZTogZ2V0Tm9kZSxcblxuICAgIC8qKlxuICAgICAqIEdldHMgYW4gZWRnZSBiZXR3ZWVuIHR3byBub2Rlcy5cbiAgICAgKiBPcGVyYXRpb24gY29tcGxleGl0eSBpcyBPKG4pIHdoZXJlIG4gLSBudW1iZXIgb2YgbGlua3Mgb2YgYSBub2RlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZyb21JZCBsaW5rIHN0YXJ0IGlkZW50aWZpZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdG9JZCBsaW5rIGVuZCBpZGVudGlmaWVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBsaW5rIGlmIHRoZXJlIGlzIG9uZS4gbnVsbCBvdGhlcndpc2UuXG4gICAgICovXG4gICAgZ2V0TGluazogZ2V0TGlua1xuICB9O1xuXG4gIC8vIHRoaXMgd2lsbCBhZGQgYG9uKClgIGFuZCBgZmlyZSgpYCBtZXRob2RzLlxuICBldmVudGlmeShncmFwaFBhcnQpO1xuXG4gIG1vbml0b3JTdWJzY3JpYmVycygpO1xuXG4gIHJldHVybiBncmFwaFBhcnQ7XG5cbiAgZnVuY3Rpb24gbW9uaXRvclN1YnNjcmliZXJzKCkge1xuICAgIHZhciByZWFsT24gPSBncmFwaFBhcnQub247XG5cbiAgICAvLyByZXBsYWNlIHJlYWwgYG9uYCB3aXRoIG91ciB0ZW1wb3Jhcnkgb24sIHdoaWNoIHdpbGwgdHJpZ2dlciBjaGFuZ2VcbiAgICAvLyBtb2RpZmljYXRpb24gbW9uaXRvcmluZzpcbiAgICBncmFwaFBhcnQub24gPSBvbjtcblxuICAgIGZ1bmN0aW9uIG9uKCkge1xuICAgICAgLy8gbm93IGl0J3MgdGltZSB0byBzdGFydCB0cmFja2luZyBzdHVmZjpcbiAgICAgIGdyYXBoUGFydC5iZWdpblVwZGF0ZSA9IGVudGVyTW9kaWZpY2F0aW9uID0gZW50ZXJNb2RpZmljYXRpb25SZWFsO1xuICAgICAgZ3JhcGhQYXJ0LmVuZFVwZGF0ZSA9IGV4aXRNb2RpZmljYXRpb24gPSBleGl0TW9kaWZpY2F0aW9uUmVhbDtcbiAgICAgIHJlY29yZExpbmtDaGFuZ2UgPSByZWNvcmRMaW5rQ2hhbmdlUmVhbDtcbiAgICAgIHJlY29yZE5vZGVDaGFuZ2UgPSByZWNvcmROb2RlQ2hhbmdlUmVhbDtcblxuICAgICAgLy8gdGhpcyB3aWxsIHJlcGxhY2UgY3VycmVudCBgb25gIG1ldGhvZCB3aXRoIHJlYWwgcHViL3N1YiBmcm9tIGBldmVudGlmeWAuXG4gICAgICBncmFwaFBhcnQub24gPSByZWFsT247XG4gICAgICAvLyBkZWxlZ2F0ZSB0byByZWFsIGBvbmAgaGFuZGxlcjpcbiAgICAgIHJldHVybiByZWFsT24uYXBwbHkoZ3JhcGhQYXJ0LCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY29yZExpbmtDaGFuZ2VSZWFsKGxpbmssIGNoYW5nZVR5cGUpIHtcbiAgICBjaGFuZ2VzLnB1c2goe1xuICAgICAgbGluazogbGluayxcbiAgICAgIGNoYW5nZVR5cGU6IGNoYW5nZVR5cGVcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY29yZE5vZGVDaGFuZ2VSZWFsKG5vZGUsIGNoYW5nZVR5cGUpIHtcbiAgICBjaGFuZ2VzLnB1c2goe1xuICAgICAgbm9kZTogbm9kZSxcbiAgICAgIGNoYW5nZVR5cGU6IGNoYW5nZVR5cGVcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZE5vZGUobm9kZUlkLCBkYXRhKSB7XG4gICAgaWYgKG5vZGVJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbm9kZSBpZGVudGlmaWVyJyk7XG4gICAgfVxuXG4gICAgZW50ZXJNb2RpZmljYXRpb24oKTtcblxuICAgIHZhciBub2RlID0gZ2V0Tm9kZShub2RlSWQpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgbm9kZSA9IG5ldyBOb2RlKG5vZGVJZCwgZGF0YSk7XG4gICAgICBub2Rlc0NvdW50Kys7XG4gICAgICByZWNvcmROb2RlQ2hhbmdlKG5vZGUsICdhZGQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS5kYXRhID0gZGF0YTtcbiAgICAgIHJlY29yZE5vZGVDaGFuZ2Uobm9kZSwgJ3VwZGF0ZScpO1xuICAgIH1cblxuICAgIG5vZGVzW25vZGVJZF0gPSBub2RlO1xuXG4gICAgZXhpdE1vZGlmaWNhdGlvbigpO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Tm9kZShub2RlSWQpIHtcbiAgICByZXR1cm4gbm9kZXNbbm9kZUlkXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU5vZGUobm9kZUlkKSB7XG4gICAgdmFyIG5vZGUgPSBnZXROb2RlKG5vZGVJZCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZW50ZXJNb2RpZmljYXRpb24oKTtcblxuICAgIHZhciBwcmV2TGlua3MgPSBub2RlLmxpbmtzO1xuICAgIGlmIChwcmV2TGlua3MpIHtcbiAgICAgIG5vZGUubGlua3MgPSBudWxsO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHByZXZMaW5rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICByZW1vdmVMaW5rKHByZXZMaW5rc1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVsZXRlIG5vZGVzW25vZGVJZF07XG4gICAgbm9kZXNDb3VudC0tO1xuXG4gICAgcmVjb3JkTm9kZUNoYW5nZShub2RlLCAncmVtb3ZlJyk7XG5cbiAgICBleGl0TW9kaWZpY2F0aW9uKCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gYWRkTGluayhmcm9tSWQsIHRvSWQsIGRhdGEpIHtcbiAgICBlbnRlck1vZGlmaWNhdGlvbigpO1xuXG4gICAgdmFyIGZyb21Ob2RlID0gZ2V0Tm9kZShmcm9tSWQpIHx8IGFkZE5vZGUoZnJvbUlkKTtcbiAgICB2YXIgdG9Ob2RlID0gZ2V0Tm9kZSh0b0lkKSB8fCBhZGROb2RlKHRvSWQpO1xuXG4gICAgdmFyIGxpbmsgPSBjcmVhdGVMaW5rKGZyb21JZCwgdG9JZCwgZGF0YSk7XG5cbiAgICBsaW5rcy5wdXNoKGxpbmspO1xuXG4gICAgLy8gVE9ETzogdGhpcyBpcyBub3QgY29vbC4gT24gbGFyZ2UgZ3JhcGhzIHBvdGVudGlhbGx5IHdvdWxkIGNvbnN1bWUgbW9yZSBtZW1vcnkuXG4gICAgYWRkTGlua1RvTm9kZShmcm9tTm9kZSwgbGluayk7XG4gICAgaWYgKGZyb21JZCAhPT0gdG9JZCkge1xuICAgICAgLy8gbWFrZSBzdXJlIHdlIGFyZSBub3QgZHVwbGljYXRpbmcgbGlua3MgZm9yIHNlbGYtbG9vcHNcbiAgICAgIGFkZExpbmtUb05vZGUodG9Ob2RlLCBsaW5rKTtcbiAgICB9XG5cbiAgICByZWNvcmRMaW5rQ2hhbmdlKGxpbmssICdhZGQnKTtcblxuICAgIGV4aXRNb2RpZmljYXRpb24oKTtcblxuICAgIHJldHVybiBsaW5rO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlU2luZ2xlTGluayhmcm9tSWQsIHRvSWQsIGRhdGEpIHtcbiAgICB2YXIgbGlua0lkID0gbWFrZUxpbmtJZChmcm9tSWQsIHRvSWQpO1xuICAgIHJldHVybiBuZXcgTGluayhmcm9tSWQsIHRvSWQsIGRhdGEsIGxpbmtJZCk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVVbmlxdWVMaW5rKGZyb21JZCwgdG9JZCwgZGF0YSkge1xuICAgIC8vIFRPRE86IEdldCByaWQgb2YgdGhpcyBtZXRob2QuXG4gICAgdmFyIGxpbmtJZCA9IG1ha2VMaW5rSWQoZnJvbUlkLCB0b0lkKTtcbiAgICB2YXIgaXNNdWx0aUVkZ2UgPSBtdWx0aUVkZ2VzLmhhc093blByb3BlcnR5KGxpbmtJZCk7XG4gICAgaWYgKGlzTXVsdGlFZGdlIHx8IGdldExpbmsoZnJvbUlkLCB0b0lkKSkge1xuICAgICAgaWYgKCFpc011bHRpRWRnZSkge1xuICAgICAgICBtdWx0aUVkZ2VzW2xpbmtJZF0gPSAwO1xuICAgICAgfVxuICAgICAgdmFyIHN1ZmZpeCA9ICdAJyArICgrK211bHRpRWRnZXNbbGlua0lkXSk7XG4gICAgICBsaW5rSWQgPSBtYWtlTGlua0lkKGZyb21JZCArIHN1ZmZpeCwgdG9JZCArIHN1ZmZpeCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBMaW5rKGZyb21JZCwgdG9JZCwgZGF0YSwgbGlua0lkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExpbmtzKG5vZGVJZCkge1xuICAgIHZhciBub2RlID0gZ2V0Tm9kZShub2RlSWQpO1xuICAgIHJldHVybiBub2RlID8gbm9kZS5saW5rcyA6IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVMaW5rKGxpbmspIHtcbiAgICBpZiAoIWxpbmspIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGlkeCA9IGluZGV4T2ZFbGVtZW50SW5BcnJheShsaW5rLCBsaW5rcyk7XG4gICAgaWYgKGlkeCA8IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBlbnRlck1vZGlmaWNhdGlvbigpO1xuXG4gICAgbGlua3Muc3BsaWNlKGlkeCwgMSk7XG5cbiAgICB2YXIgZnJvbU5vZGUgPSBnZXROb2RlKGxpbmsuZnJvbUlkKTtcbiAgICB2YXIgdG9Ob2RlID0gZ2V0Tm9kZShsaW5rLnRvSWQpO1xuXG4gICAgaWYgKGZyb21Ob2RlKSB7XG4gICAgICBpZHggPSBpbmRleE9mRWxlbWVudEluQXJyYXkobGluaywgZnJvbU5vZGUubGlua3MpO1xuICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgIGZyb21Ob2RlLmxpbmtzLnNwbGljZShpZHgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0b05vZGUpIHtcbiAgICAgIGlkeCA9IGluZGV4T2ZFbGVtZW50SW5BcnJheShsaW5rLCB0b05vZGUubGlua3MpO1xuICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgIHRvTm9kZS5saW5rcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWNvcmRMaW5rQ2hhbmdlKGxpbmssICdyZW1vdmUnKTtcblxuICAgIGV4aXRNb2RpZmljYXRpb24oKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGluayhmcm9tTm9kZUlkLCB0b05vZGVJZCkge1xuICAgIC8vIFRPRE86IFVzZSBzb3J0ZWQgbGlua3MgdG8gc3BlZWQgdGhpcyB1cFxuICAgIHZhciBub2RlID0gZ2V0Tm9kZShmcm9tTm9kZUlkKSxcbiAgICAgIGk7XG4gICAgaWYgKCFub2RlIHx8ICFub2RlLmxpbmtzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbm9kZS5saW5rcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxpbmsgPSBub2RlLmxpbmtzW2ldO1xuICAgICAgaWYgKGxpbmsuZnJvbUlkID09PSBmcm9tTm9kZUlkICYmIGxpbmsudG9JZCA9PT0gdG9Ob2RlSWQpIHtcbiAgICAgICAgcmV0dXJuIGxpbms7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7IC8vIG5vIGxpbmsuXG4gIH1cblxuICBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICBlbnRlck1vZGlmaWNhdGlvbigpO1xuICAgIGZvckVhY2hOb2RlKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHJlbW92ZU5vZGUobm9kZS5pZCk7XG4gICAgfSk7XG4gICAgZXhpdE1vZGlmaWNhdGlvbigpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9yRWFjaExpbmsoY2FsbGJhY2spIHtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGxpbmtzLmxlbmd0aDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNhbGxiYWNrKGxpbmtzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmb3JFYWNoTGlua2VkTm9kZShub2RlSWQsIGNhbGxiYWNrLCBvcmllbnRlZCkge1xuICAgIHZhciBub2RlID0gZ2V0Tm9kZShub2RlSWQpO1xuXG4gICAgaWYgKG5vZGUgJiYgbm9kZS5saW5rcyAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChvcmllbnRlZCkge1xuICAgICAgICByZXR1cm4gZm9yRWFjaE9yaWVudGVkTGluayhub2RlLmxpbmtzLCBub2RlSWQsIGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmb3JFYWNoTm9uT3JpZW50ZWRMaW5rKG5vZGUubGlua3MsIG5vZGVJZCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZvckVhY2hOb25PcmllbnRlZExpbmsobGlua3MsIG5vZGVJZCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcXVpdEZhc3Q7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5rcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxpbmsgPSBsaW5rc1tpXTtcbiAgICAgIHZhciBsaW5rZWROb2RlSWQgPSBsaW5rLmZyb21JZCA9PT0gbm9kZUlkID8gbGluay50b0lkIDogbGluay5mcm9tSWQ7XG5cbiAgICAgIHF1aXRGYXN0ID0gY2FsbGJhY2sobm9kZXNbbGlua2VkTm9kZUlkXSwgbGluayk7XG4gICAgICBpZiAocXVpdEZhc3QpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIENsaWVudCBkb2VzIG5vdCBuZWVkIG1vcmUgaXRlcmF0aW9ucy4gQnJlYWsgbm93LlxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZvckVhY2hPcmllbnRlZExpbmsobGlua3MsIG5vZGVJZCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcXVpdEZhc3Q7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5rcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxpbmsgPSBsaW5rc1tpXTtcbiAgICAgIGlmIChsaW5rLmZyb21JZCA9PT0gbm9kZUlkKSB7XG4gICAgICAgIHF1aXRGYXN0ID0gY2FsbGJhY2sobm9kZXNbbGluay50b0lkXSwgbGluayk7XG4gICAgICAgIGlmIChxdWl0RmFzdCkge1xuICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBDbGllbnQgZG9lcyBub3QgbmVlZCBtb3JlIGl0ZXJhdGlvbnMuIEJyZWFrIG5vdy5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHdlIHdpbGwgbm90IGZpcmUgYW55dGhpbmcgdW50aWwgdXNlcnMgb2YgdGhpcyBsaWJyYXJ5IGV4cGxpY2l0bHkgY2FsbCBgb24oKWBcbiAgLy8gbWV0aG9kLlxuICBmdW5jdGlvbiBub29wKCkge31cblxuICAvLyBFbnRlciwgRXhpdCBtb2RpZmljYXRpb24gYWxsb3dzIGJ1bGsgZ3JhcGggdXBkYXRlcyB3aXRob3V0IGZpcmluZyBldmVudHMuXG4gIGZ1bmN0aW9uIGVudGVyTW9kaWZpY2F0aW9uUmVhbCgpIHtcbiAgICBzdXNwZW5kRXZlbnRzICs9IDE7XG4gIH1cblxuICBmdW5jdGlvbiBleGl0TW9kaWZpY2F0aW9uUmVhbCgpIHtcbiAgICBzdXNwZW5kRXZlbnRzIC09IDE7XG4gICAgaWYgKHN1c3BlbmRFdmVudHMgPT09IDAgJiYgY2hhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgICBncmFwaFBhcnQuZmlyZSgnY2hhbmdlZCcsIGNoYW5nZXMpO1xuICAgICAgY2hhbmdlcy5sZW5ndGggPSAwO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU5vZGVJdGVyYXRvcigpIHtcbiAgICAvLyBPYmplY3Qua2V5cyBpdGVyYXRvciBpcyAxLjN4IGZhc3RlciB0aGFuIGBmb3IgaW5gIGxvb3AuXG4gICAgLy8gU2VlIGBodHRwczovL2dpdGh1Yi5jb20vYW52YWthL25ncmFwaC5ncmFwaC90cmVlL2JlbmNoLWZvci1pbi12cy1vYmota2V5c2BcbiAgICAvLyBicmFuY2ggZm9yIHBlcmYgdGVzdFxuICAgIHJldHVybiBPYmplY3Qua2V5cyA/IG9iamVjdEtleXNJdGVyYXRvciA6IGZvckluSXRlcmF0b3I7XG4gIH1cblxuICBmdW5jdGlvbiBvYmplY3RLZXlzSXRlcmF0b3IoY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhub2Rlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoY2FsbGJhY2sobm9kZXNba2V5c1tpXV0pKSB7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBjbGllbnQgZG9lc24ndCB3YW50IHRvIHByb2NlZWQuIFJldHVybi5cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmb3JJbkl0ZXJhdG9yKGNhbGxiYWNrKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgbm9kZTtcblxuICAgIGZvciAobm9kZSBpbiBub2Rlcykge1xuICAgICAgaWYgKGNhbGxiYWNrKG5vZGVzW25vZGVdKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gY2xpZW50IGRvZXNuJ3Qgd2FudCB0byBwcm9jZWVkLiBSZXR1cm4uXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIG5lZWQgdGhpcyBmb3Igb2xkIGJyb3dzZXJzLiBTaG91bGQgdGhpcyBiZSBhIHNlcGFyYXRlIG1vZHVsZT9cbmZ1bmN0aW9uIGluZGV4T2ZFbGVtZW50SW5BcnJheShlbGVtZW50LCBhcnJheSkge1xuICBpZiAoIWFycmF5KSByZXR1cm4gLTE7XG5cbiAgaWYgKGFycmF5LmluZGV4T2YpIHtcbiAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihlbGVtZW50KTtcbiAgfVxuXG4gIHZhciBsZW4gPSBhcnJheS5sZW5ndGgsXG4gICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICBpZiAoYXJyYXlbaV0gPT09IGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCBzdHJ1Y3R1cmUgdG8gcmVwcmVzZW50IG5vZGU7XG4gKi9cbmZ1bmN0aW9uIE5vZGUoaWQsIGRhdGEpIHtcbiAgdGhpcy5pZCA9IGlkO1xuICB0aGlzLmxpbmtzID0gbnVsbDtcbiAgdGhpcy5kYXRhID0gZGF0YTtcbn1cblxuZnVuY3Rpb24gYWRkTGlua1RvTm9kZShub2RlLCBsaW5rKSB7XG4gIGlmIChub2RlLmxpbmtzKSB7XG4gICAgbm9kZS5saW5rcy5wdXNoKGxpbmspO1xuICB9IGVsc2Uge1xuICAgIG5vZGUubGlua3MgPSBbbGlua107XG4gIH1cbn1cblxuLyoqXG4gKiBJbnRlcm5hbCBzdHJ1Y3R1cmUgdG8gcmVwcmVzZW50IGxpbmtzO1xuICovXG5mdW5jdGlvbiBMaW5rKGZyb21JZCwgdG9JZCwgZGF0YSwgaWQpIHtcbiAgdGhpcy5mcm9tSWQgPSBmcm9tSWQ7XG4gIHRoaXMudG9JZCA9IHRvSWQ7XG4gIHRoaXMuZGF0YSA9IGRhdGE7XG4gIHRoaXMuaWQgPSBpZDtcbn1cblxuZnVuY3Rpb24gaGFzaENvZGUoc3RyKSB7XG4gIHZhciBoYXNoID0gMCwgaSwgY2hyLCBsZW47XG4gIGlmIChzdHIubGVuZ3RoID09IDApIHJldHVybiBoYXNoO1xuICBmb3IgKGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBjaHIgICA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgIGhhc2ggID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBjaHI7XG4gICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgfVxuICByZXR1cm4gaGFzaDtcbn1cblxuZnVuY3Rpb24gbWFrZUxpbmtJZChmcm9tSWQsIHRvSWQpIHtcbiAgcmV0dXJuIGZyb21JZC50b1N0cmluZygpICsgJ/CfkYkgJyArIHRvSWQudG9TdHJpbmcoKTtcbn1cbiIsIi8qKlxuICogQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL21vdXJuZXIvdGlueXF1ZXVlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcsIFZsYWRpbWlyIEFnYWZvbmtpbiBodHRwczovL2dpdGh1Yi5jb20vbW91cm5lci90aW55cXVldWUvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICogXG4gKiBBZGFwdGVkIGZvciBQYXRoRmluZGluZyBuZWVkcyBieSBAYW52YWthXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcsIEFuZHJlaSBLYXNoY2hhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gTm9kZUhlYXA7XG5cbmZ1bmN0aW9uIE5vZGVIZWFwKGRhdGEsIG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE5vZGVIZWFwKSkgcmV0dXJuIG5ldyBOb2RlSGVhcChkYXRhLCBvcHRpb25zKTtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAvLyBhc3N1bWUgZmlyc3QgYXJndW1lbnQgaXMgb3VyIGNvbmZpZyBvYmplY3Q7XG4gICAgb3B0aW9ucyA9IGRhdGE7XG4gICAgZGF0YSA9IFtdO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdGhpcy5kYXRhID0gZGF0YSB8fCBbXTtcbiAgdGhpcy5sZW5ndGggPSB0aGlzLmRhdGEubGVuZ3RoO1xuICB0aGlzLmNvbXBhcmUgPSBvcHRpb25zLmNvbXBhcmUgfHwgZGVmYXVsdENvbXBhcmU7XG4gIHRoaXMuc2V0Tm9kZUlkID0gb3B0aW9ucy5zZXROb2RlSWQgfHwgbm9vcDtcblxuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgZm9yICh2YXIgaSA9ICh0aGlzLmxlbmd0aCA+PiAxKTsgaSA+PSAwOyBpLS0pIHRoaXMuX2Rvd24oaSk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5zZXROb2RlSWQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMuc2V0Tm9kZUlkKHRoaXMuZGF0YVtpXSwgaSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5mdW5jdGlvbiBkZWZhdWx0Q29tcGFyZShhLCBiKSB7XG4gIHJldHVybiBhIC0gYjtcbn1cblxuTm9kZUhlYXAucHJvdG90eXBlID0ge1xuXG4gIHB1c2g6IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdGhpcy5kYXRhLnB1c2goaXRlbSk7XG4gICAgdGhpcy5zZXROb2RlSWQoaXRlbSwgdGhpcy5sZW5ndGgpO1xuICAgIHRoaXMubGVuZ3RoKys7XG4gICAgdGhpcy5fdXAodGhpcy5sZW5ndGggLSAxKTtcbiAgfSxcblxuICBwb3A6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICB2YXIgdG9wID0gdGhpcy5kYXRhWzBdO1xuICAgIHRoaXMubGVuZ3RoLS07XG5cbiAgICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmRhdGFbMF0gPSB0aGlzLmRhdGFbdGhpcy5sZW5ndGhdO1xuICAgICAgdGhpcy5zZXROb2RlSWQodGhpcy5kYXRhWzBdLCAwKTtcbiAgICAgIHRoaXMuX2Rvd24oMCk7XG4gICAgfVxuICAgIHRoaXMuZGF0YS5wb3AoKTtcblxuICAgIHJldHVybiB0b3A7XG4gIH0sXG5cbiAgcGVlazogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGFbMF07XG4gIH0sXG5cbiAgdXBkYXRlSXRlbTogZnVuY3Rpb24gKHBvcykge1xuICAgIHRoaXMuX2Rvd24ocG9zKTtcbiAgICB0aGlzLl91cChwb3MpO1xuICB9LFxuXG4gIF91cDogZnVuY3Rpb24gKHBvcykge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBjb21wYXJlID0gdGhpcy5jb21wYXJlO1xuICAgIHZhciBzZXROb2RlSWQgPSB0aGlzLnNldE5vZGVJZDtcbiAgICB2YXIgaXRlbSA9IGRhdGFbcG9zXTtcblxuICAgIHdoaWxlIChwb3MgPiAwKSB7XG4gICAgICB2YXIgcGFyZW50ID0gKHBvcyAtIDEpID4+IDE7XG4gICAgICB2YXIgY3VycmVudCA9IGRhdGFbcGFyZW50XTtcbiAgICAgIGlmIChjb21wYXJlKGl0ZW0sIGN1cnJlbnQpID49IDApIGJyZWFrO1xuICAgICAgICBkYXRhW3Bvc10gPSBjdXJyZW50O1xuXG4gICAgICAgc2V0Tm9kZUlkKGN1cnJlbnQsIHBvcyk7XG4gICAgICAgcG9zID0gcGFyZW50O1xuICAgIH1cblxuICAgIGRhdGFbcG9zXSA9IGl0ZW07XG4gICAgc2V0Tm9kZUlkKGl0ZW0sIHBvcyk7XG4gIH0sXG5cbiAgX2Rvd246IGZ1bmN0aW9uIChwb3MpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgY29tcGFyZSA9IHRoaXMuY29tcGFyZTtcbiAgICB2YXIgaGFsZkxlbmd0aCA9IHRoaXMubGVuZ3RoID4+IDE7XG4gICAgdmFyIGl0ZW0gPSBkYXRhW3Bvc107XG4gICAgdmFyIHNldE5vZGVJZCA9IHRoaXMuc2V0Tm9kZUlkO1xuXG4gICAgd2hpbGUgKHBvcyA8IGhhbGZMZW5ndGgpIHtcbiAgICAgIHZhciBsZWZ0ID0gKHBvcyA8PCAxKSArIDE7XG4gICAgICB2YXIgcmlnaHQgPSBsZWZ0ICsgMTtcbiAgICAgIHZhciBiZXN0ID0gZGF0YVtsZWZ0XTtcblxuICAgICAgaWYgKHJpZ2h0IDwgdGhpcy5sZW5ndGggJiYgY29tcGFyZShkYXRhW3JpZ2h0XSwgYmVzdCkgPCAwKSB7XG4gICAgICAgIGxlZnQgPSByaWdodDtcbiAgICAgICAgYmVzdCA9IGRhdGFbcmlnaHRdO1xuICAgICAgfVxuICAgICAgaWYgKGNvbXBhcmUoYmVzdCwgaXRlbSkgPj0gMCkgYnJlYWs7XG5cbiAgICAgIGRhdGFbcG9zXSA9IGJlc3Q7XG4gICAgICBzZXROb2RlSWQoYmVzdCwgcG9zKTtcbiAgICAgIHBvcyA9IGxlZnQ7XG4gICAgfVxuXG4gICAgZGF0YVtwb3NdID0gaXRlbTtcbiAgICBzZXROb2RlSWQoaXRlbSwgcG9zKTtcbiAgfVxufTsiLCIvKipcbiAqIFBlcmZvcm1zIHN1Ym9wdGltYWwsIGdyZWVkIEEgU3RhciBwYXRoIGZpbmRpbmcuXG4gKiBUaGlzIGZpbmRlciBkb2VzIG5vdCBuZWNlc3NhcnkgZmluZHMgdGhlIHNob3J0ZXN0IHBhdGguIFRoZSBwYXRoXG4gKiB0aGF0IGl0IGZpbmRzIGlzIHZlcnkgY2xvc2UgdG8gdGhlIHNob3J0ZXN0IG9uZS4gSXQgaXMgdmVyeSBmYXN0IHRob3VnaC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhU3RhckJpO1xuXG52YXIgTm9kZUhlYXAgPSByZXF1aXJlKCcuL05vZGVIZWFwJyk7XG52YXIgbWFrZVNlYXJjaFN0YXRlUG9vbCA9IHJlcXVpcmUoJy4vbWFrZVNlYXJjaFN0YXRlUG9vbCcpO1xudmFyIGhldXJpc3RpY3MgPSByZXF1aXJlKCcuL2hldXJpc3RpY3MnKTtcbnZhciBkZWZhdWx0U2V0dGluZ3MgPSByZXF1aXJlKCcuL2RlZmF1bHRTZXR0aW5ncycpO1xuXG52YXIgQllfRlJPTSA9IDE7XG52YXIgQllfVE8gPSAyO1xudmFyIE5PX1BBVEggPSBkZWZhdWx0U2V0dGluZ3MuTk9fUEFUSDtcblxubW9kdWxlLmV4cG9ydHMubDIgPSBoZXVyaXN0aWNzLmwyO1xubW9kdWxlLmV4cG9ydHMubDEgPSBoZXVyaXN0aWNzLmwxO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgcGF0aGZpbmRlci4gQSBwYXRoZmluZGVyIGhhcyBqdXN0IG9uZSBtZXRob2Q6XG4gKiBgZmluZChmcm9tSWQsIHRvSWQpYCwgaXQgbWF5IGJlIGV4dGVuZGVkIGluIGZ1dHVyZS5cbiAqIFxuICogTk9URTogQWxnb3JpdGhtIGltcGxlbWVudGVkIGluIHRoaXMgY29kZSBET0VTIE5PVCBmaW5kIG9wdGltYWwgcGF0aC5cbiAqIFlldCB0aGUgcGF0aCB0aGF0IGl0IGZpbmRzIGlzIGFsd2F5cyBuZWFyIG9wdGltYWwsIGFuZCBpdCBmaW5kcyBpdCB2ZXJ5IGZhc3QuXG4gKiBcbiAqIEBwYXJhbSB7bmdyYXBoLmdyYXBofSBncmFwaCBpbnN0YW5jZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnZha2EvbmdyYXBoLmdyYXBoXG4gKiBcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIHRoYXQgY29uZmlndXJlcyBzZWFyY2hcbiAqIEBwYXJhbSB7RnVuY3Rpb24oYSwgYil9IG9wdGlvbnMuaGV1cmlzdGljIC0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgZXN0aW1hdGVkIGRpc3RhbmNlIGJldHdlZW5cbiAqIG5vZGVzIGBhYCBhbmQgYGJgLiAgRGVmYXVsdHMgZnVuY3Rpb24gcmV0dXJucyAwLCB3aGljaCBtYWtlcyB0aGlzIHNlYXJjaCBlcXVpdmFsZW50IHRvIERpamtzdHJhIHNlYXJjaC5cbiAqIEBwYXJhbSB7RnVuY3Rpb24oYSwgYil9IG9wdGlvbnMuZGlzdGFuY2UgLSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhY3R1YWwgZGlzdGFuY2UgYmV0d2VlbiB0d29cbiAqIG5vZGVzIGBhYCBhbmQgYGJgLiBCeSBkZWZhdWx0IHRoaXMgaXMgc2V0IHRvIHJldHVybiBncmFwaC10aGVvcmV0aWNhbCBkaXN0YW5jZSAoYWx3YXlzIDEpO1xuICogXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBIHBhdGhmaW5kZXIgd2l0aCBzaW5nbGUgbWV0aG9kIGBmaW5kKClgLlxuICovXG5mdW5jdGlvbiBhU3RhckJpKGdyYXBoLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAvLyB3aGV0aGVyIHRyYXZlcnNhbCBzaG91bGQgYmUgY29uc2lkZXJlZCBvdmVyIG9yaWVudGVkIGdyYXBoLlxuICB2YXIgb3JpZW50ZWQgPSBvcHRpb25zLm9yaWVudGVkO1xuXG4gIHZhciBoZXVyaXN0aWMgPSBvcHRpb25zLmhldXJpc3RpYztcbiAgaWYgKCFoZXVyaXN0aWMpIGhldXJpc3RpYyA9IGRlZmF1bHRTZXR0aW5ncy5oZXVyaXN0aWM7XG5cbiAgdmFyIGRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZTtcbiAgaWYgKCFkaXN0YW5jZSkgZGlzdGFuY2UgPSBkZWZhdWx0U2V0dGluZ3MuZGlzdGFuY2U7XG4gIHZhciBwb29sID0gbWFrZVNlYXJjaFN0YXRlUG9vbCgpO1xuXG4gIHJldHVybiB7XG4gICAgZmluZDogZmluZFxuICB9O1xuXG4gIGZ1bmN0aW9uIGZpbmQoZnJvbUlkLCB0b0lkKSB7XG4gICAgLy8gTm90IHN1cmUgaWYgd2Ugc2hvdWxkIHJldHVybiBOT19QQVRIIG9yIHRocm93LiBUaHJvdyBzZWVtIHRvIGJlIG1vcmVcbiAgICAvLyBoZWxwZnVsIHRvIGRlYnVnIGVycm9ycy4gU28sIHRocm93aW5nLlxuICAgIHZhciBmcm9tID0gZ3JhcGguZ2V0Tm9kZShmcm9tSWQpO1xuICAgIGlmICghZnJvbSkgdGhyb3cgbmV3IEVycm9yKCdmcm9tSWQgaXMgbm90IGRlZmluZWQgaW4gdGhpcyBncmFwaDogJyArIGZyb21JZCk7XG4gICAgdmFyIHRvID0gZ3JhcGguZ2V0Tm9kZSh0b0lkKTtcbiAgICBpZiAoIXRvKSB0aHJvdyBuZXcgRXJyb3IoJ3RvSWQgaXMgbm90IGRlZmluZWQgaW4gdGhpcyBncmFwaDogJyArIHRvSWQpO1xuXG4gICAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gW2Zyb21dOyAvLyB0cml2aWFsIGNhc2UuXG5cbiAgICBwb29sLnJlc2V0KCk7XG5cbiAgICB2YXIgY2FsbFZpc2l0b3IgPSBvcmllbnRlZCA/IG9yaWVudGVkVmlzaXRvciA6IG5vbk9yaWVudGVkVmlzaXRvcjtcblxuICAgIC8vIE1hcHMgbm9kZUlkIHRvIE5vZGVTZWFyY2hTdGF0ZS5cbiAgICB2YXIgbm9kZVN0YXRlID0gbmV3IE1hcCgpO1xuXG4gICAgdmFyIG9wZW5TZXRGcm9tID0gbmV3IE5vZGVIZWFwKHtcbiAgICAgIGNvbXBhcmU6IGRlZmF1bHRTZXR0aW5ncy5jb21wYXJlRlNjb3JlLFxuICAgICAgc2V0Tm9kZUlkOiBkZWZhdWx0U2V0dGluZ3Muc2V0SGVhcEluZGV4XG4gICAgfSk7XG5cbiAgICB2YXIgb3BlblNldFRvID0gbmV3IE5vZGVIZWFwKHtcbiAgICAgIGNvbXBhcmU6IGRlZmF1bHRTZXR0aW5ncy5jb21wYXJlRlNjb3JlLFxuICAgICAgc2V0Tm9kZUlkOiBkZWZhdWx0U2V0dGluZ3Muc2V0SGVhcEluZGV4XG4gICAgfSk7XG5cblxuICAgIHZhciBzdGFydE5vZGUgPSBwb29sLmNyZWF0ZU5ld1N0YXRlKGZyb20pO1xuICAgIG5vZGVTdGF0ZS5zZXQoZnJvbUlkLCBzdGFydE5vZGUpO1xuXG4gICAgLy8gRm9yIHRoZSBmaXJzdCBub2RlLCBmU2NvcmUgaXMgY29tcGxldGVseSBoZXVyaXN0aWMuXG4gICAgc3RhcnROb2RlLmZTY29yZSA9IGhldXJpc3RpYyhmcm9tLCB0byk7XG4gICAgLy8gVGhlIGNvc3Qgb2YgZ29pbmcgZnJvbSBzdGFydCB0byBzdGFydCBpcyB6ZXJvLlxuICAgIHN0YXJ0Tm9kZS5kaXN0YW5jZVRvU291cmNlID0gMDtcbiAgICBvcGVuU2V0RnJvbS5wdXNoKHN0YXJ0Tm9kZSk7XG4gICAgc3RhcnROb2RlLm9wZW4gPSBCWV9GUk9NO1xuXG4gICAgdmFyIGVuZE5vZGUgPSBwb29sLmNyZWF0ZU5ld1N0YXRlKHRvKTtcbiAgICBlbmROb2RlLmZTY29yZSA9IGhldXJpc3RpYyh0bywgZnJvbSk7XG4gICAgZW5kTm9kZS5kaXN0YW5jZVRvU291cmNlID0gMDtcbiAgICBvcGVuU2V0VG8ucHVzaChlbmROb2RlKTtcbiAgICBlbmROb2RlLm9wZW4gPSBCWV9UTztcblxuICAgIC8vIENvc3Qgb2YgdGhlIGJlc3Qgc29sdXRpb24gZm91bmQgc28gZmFyLiBVc2VkIGZvciBhY2N1cmF0ZSB0ZXJtaW5hdGlvblxuICAgIHZhciBsTWluID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIHZhciBtaW5Gcm9tO1xuICAgIHZhciBtaW5UbztcblxuICAgIHZhciBjdXJyZW50U2V0ID0gb3BlblNldEZyb207XG4gICAgdmFyIGN1cnJlbnRPcGVuZXIgPSBCWV9GUk9NO1xuXG4gICAgd2hpbGUgKG9wZW5TZXRGcm9tLmxlbmd0aCA+IDAgJiYgb3BlblNldFRvLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChvcGVuU2V0RnJvbS5sZW5ndGggPCBvcGVuU2V0VG8ubGVuZ3RoKSB7XG4gICAgICAgIC8vIHdlIHBpY2sgYSBzZXQgd2l0aCBsZXNzIGVsZW1lbnRzXG4gICAgICAgIGN1cnJlbnRPcGVuZXIgPSBCWV9GUk9NO1xuICAgICAgICBjdXJyZW50U2V0ID0gb3BlblNldEZyb207XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50T3BlbmVyID0gQllfVE87XG4gICAgICAgIGN1cnJlbnRTZXQgPSBvcGVuU2V0VG87XG4gICAgICB9XG5cbiAgICAgIHZhciBjdXJyZW50ID0gY3VycmVudFNldC5wb3AoKTtcblxuICAgICAgLy8gbm8gbmVlZCB0byB2aXNpdCB0aGlzIG5vZGUgYW55bW9yZVxuICAgICAgY3VycmVudC5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICBpZiAoY3VycmVudC5kaXN0YW5jZVRvU291cmNlID4gbE1pbikgY29udGludWU7XG5cbiAgICAgIGdyYXBoLmZvckVhY2hMaW5rZWROb2RlKGN1cnJlbnQubm9kZS5pZCwgY2FsbFZpc2l0b3IpO1xuXG4gICAgICBpZiAobWluRnJvbSAmJiBtaW5Ubykge1xuICAgICAgICAvLyBUaGlzIGlzIG5vdCBuZWNlc3NhcnkgdGhlIGJlc3QgcGF0aCwgYnV0IHdlIGFyZSBzbyBncmVlZHkgdGhhdCB3ZVxuICAgICAgICAvLyBjYW4ndCByZXNpc3Q6XG4gICAgICAgIHJldHVybiByZWNvbnN0cnVjdEJpRGlyZWN0aW9uYWxQYXRoKG1pbkZyb20sIG1pblRvKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gTk9fUEFUSDsgLy8gTm8gcGF0aC5cblxuICAgIGZ1bmN0aW9uIG5vbk9yaWVudGVkVmlzaXRvcihvdGhlck5vZGUsIGxpbmspIHtcbiAgICAgIHJldHVybiB2aXNpdE5vZGUob3RoZXJOb2RlLCBsaW5rLCBjdXJyZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvcmllbnRlZFZpc2l0b3Iob3RoZXJOb2RlLCBsaW5rKSB7XG4gICAgICAvLyBGb3Igb3JpdG5lZCBncmFwaHMgd2UgbmVlZCB0byByZXZlcnNlIGdyYXBoLCB3aGVuIHRyYXZlbGluZ1xuICAgICAgLy8gYmFja3dhcmRzLiBTbywgd2UgdXNlIG5vbi1vcmllbnRlZCBuZ3JhcGgncyB0cmF2ZXJzYWwsIGFuZCBcbiAgICAgIC8vIGZpbHRlciBsaW5rIG9yaWVudGF0aW9uIGhlcmUuXG4gICAgICBpZiAoY3VycmVudE9wZW5lciA9PT0gQllfRlJPTSkge1xuICAgICAgICBpZiAobGluay5mcm9tSWQgPT09IGN1cnJlbnQubm9kZS5pZCkgcmV0dXJuIHZpc2l0Tm9kZShvdGhlck5vZGUsIGxpbmssIGN1cnJlbnQpXG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnRPcGVuZXIgPT09IEJZX1RPKSB7XG4gICAgICAgIGlmIChsaW5rLnRvSWQgPT09IGN1cnJlbnQubm9kZS5pZCkgcmV0dXJuIHZpc2l0Tm9kZShvdGhlck5vZGUsIGxpbmssIGN1cnJlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbkV4aXQoY3VycmVudE5vZGUpIHtcbiAgICAgIHZhciBvcGVuZXIgPSBjdXJyZW50Tm9kZS5vcGVuXG4gICAgICBpZiAob3BlbmVyICYmIG9wZW5lciAhPT0gY3VycmVudE9wZW5lcikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlY29uc3RydWN0QmlEaXJlY3Rpb25hbFBhdGgoYSwgYikge1xuICAgICAgdmFyIHBhdGhPZk5vZGVzID0gW107XG4gICAgICB2YXIgYVBhcmVudCA9IGE7XG4gICAgICB3aGlsZShhUGFyZW50KSB7XG4gICAgICAgIHBhdGhPZk5vZGVzLnB1c2goYVBhcmVudC5ub2RlKTtcbiAgICAgICAgYVBhcmVudCA9IGFQYXJlbnQucGFyZW50O1xuICAgICAgfVxuICAgICAgdmFyIGJQYXJlbnQgPSBiO1xuICAgICAgd2hpbGUgKGJQYXJlbnQpIHtcbiAgICAgICAgcGF0aE9mTm9kZXMudW5zaGlmdChiUGFyZW50Lm5vZGUpO1xuICAgICAgICBiUGFyZW50ID0gYlBhcmVudC5wYXJlbnRcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXRoT2ZOb2RlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2aXNpdE5vZGUob3RoZXJOb2RlLCBsaW5rLCBjYW1lRnJvbSkge1xuICAgICAgdmFyIG90aGVyU2VhcmNoU3RhdGUgPSBub2RlU3RhdGUuZ2V0KG90aGVyTm9kZS5pZCk7XG4gICAgICBpZiAoIW90aGVyU2VhcmNoU3RhdGUpIHtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZSA9IHBvb2wuY3JlYXRlTmV3U3RhdGUob3RoZXJOb2RlKTtcbiAgICAgICAgbm9kZVN0YXRlLnNldChvdGhlck5vZGUuaWQsIG90aGVyU2VhcmNoU3RhdGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3RoZXJTZWFyY2hTdGF0ZS5jbG9zZWQpIHtcbiAgICAgICAgLy8gQWxyZWFkeSBwcm9jZXNzZWQgdGhpcyBub2RlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChjYW5FeGl0KG90aGVyU2VhcmNoU3RhdGUsIGNhbWVGcm9tKSkge1xuICAgICAgICAvLyB0aGlzIG5vZGUgd2FzIG9wZW5lZCBieSBhbHRlcm5hdGl2ZSBvcGVuZXIuIFRoZSBzZXRzIGludGVyc2VjdCBub3csXG4gICAgICAgIC8vIHdlIGZvdW5kIGFuIG9wdGltYWwgcGF0aCwgdGhhdCBnb2VzIHRocm91Z2ggKnRoaXMqIG5vZGUuIEhvd2V2ZXIsIHRoZXJlXG4gICAgICAgIC8vIGlzIG5vIGd1YXJhbnRlZSB0aGF0IHRoaXMgaXMgdGhlIGdsb2JhbCBvcHRpbWFsIHNvbHV0aW9uIHBhdGguXG5cbiAgICAgICAgdmFyIHBvdGVudGlhbExNaW4gPSBvdGhlclNlYXJjaFN0YXRlLmRpc3RhbmNlVG9Tb3VyY2UgKyBjYW1lRnJvbS5kaXN0YW5jZVRvU291cmNlO1xuICAgICAgICBpZiAocG90ZW50aWFsTE1pbiA8IGxNaW4pIHtcbiAgICAgICAgICBtaW5Gcm9tID0gb3RoZXJTZWFyY2hTdGF0ZTtcbiAgICAgICAgICBtaW5UbyA9IGNhbWVGcm9tXG4gICAgICAgICAgbE1pbiA9IHBvdGVudGlhbExNaW47XG4gICAgICAgIH1cbiAgICAgICAgLy8gd2UgYXJlIGRvbmUgd2l0aCB0aGlzIG5vZGUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHRlbnRhdGl2ZURpc3RhbmNlID0gY2FtZUZyb20uZGlzdGFuY2VUb1NvdXJjZSArIGRpc3RhbmNlKG90aGVyU2VhcmNoU3RhdGUubm9kZSwgY2FtZUZyb20ubm9kZSwgbGluayk7XG5cbiAgICAgIGlmICh0ZW50YXRpdmVEaXN0YW5jZSA+PSBvdGhlclNlYXJjaFN0YXRlLmRpc3RhbmNlVG9Tb3VyY2UpIHtcbiAgICAgICAgLy8gVGhpcyB3b3VsZCBvbmx5IG1ha2Ugb3VyIHBhdGggbG9uZ2VyLiBJZ25vcmUgdGhpcyByb3V0ZS5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDaG9vc2UgdGFyZ2V0IGJhc2VkIG9uIGN1cnJlbnQgd29ya2luZyBzZXQ6XG4gICAgICB2YXIgdGFyZ2V0ID0gKGN1cnJlbnRPcGVuZXIgPT09IEJZX0ZST00pID8gdG8gOiBmcm9tO1xuICAgICAgdmFyIG5ld0ZTY29yZSA9IHRlbnRhdGl2ZURpc3RhbmNlICsgaGV1cmlzdGljKG90aGVyU2VhcmNoU3RhdGUubm9kZSwgdGFyZ2V0KTtcbiAgICAgIGlmIChuZXdGU2NvcmUgPj0gbE1pbikge1xuICAgICAgICAvLyB0aGlzIGNhbid0IGJlIG9wdGltYWwgcGF0aCwgYXMgd2UgaGF2ZSBhbHJlYWR5IGZvdW5kIGEgc2hvcnRlciBwYXRoLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBvdGhlclNlYXJjaFN0YXRlLmZTY29yZSA9IG5ld0ZTY29yZTtcblxuICAgICAgaWYgKG90aGVyU2VhcmNoU3RhdGUub3BlbiA9PT0gMCkge1xuICAgICAgICAvLyBSZW1lbWJlciB0aGlzIG5vZGUgaW4gdGhlIGN1cnJlbnQgc2V0XG4gICAgICAgIGN1cnJlbnRTZXQucHVzaChvdGhlclNlYXJjaFN0YXRlKTtcbiAgICAgICAgY3VycmVudFNldC51cGRhdGVJdGVtKG90aGVyU2VhcmNoU3RhdGUuaGVhcEluZGV4KTtcblxuICAgICAgICBvdGhlclNlYXJjaFN0YXRlLm9wZW4gPSBjdXJyZW50T3BlbmVyO1xuICAgICAgfVxuXG4gICAgICAvLyBiaW5nbyEgd2UgZm91bmQgc2hvcnRlciBwYXRoOlxuICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5wYXJlbnQgPSBjYW1lRnJvbTtcbiAgICAgIG90aGVyU2VhcmNoU3RhdGUuZGlzdGFuY2VUb1NvdXJjZSA9IHRlbnRhdGl2ZURpc3RhbmNlO1xuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBQZXJmb3JtcyBhIHVuaS1kaXJlY3Rpb25hbCBBIFN0YXIgc2VhcmNoIG9uIGdyYXBoLlxuICogXG4gKiBXZSB3aWxsIHRyeSB0byBtaW5pbWl6ZSBmKG4pID0gZyhuKSArIGgobiksIHdoZXJlXG4gKiBnKG4pIGlzIGFjdHVhbCBkaXN0YW5jZSBmcm9tIHNvdXJjZSBub2RlIHRvIGBuYCwgYW5kXG4gKiBoKG4pIGlzIGhldXJpc3RpYyBkaXN0YW5jZSBmcm9tIGBuYCB0byB0YXJnZXQgbm9kZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhU3RhclBhdGhTZWFyY2g7XG5cbnZhciBOb2RlSGVhcCA9IHJlcXVpcmUoJy4vTm9kZUhlYXAnKTtcbnZhciBtYWtlU2VhcmNoU3RhdGVQb29sID0gcmVxdWlyZSgnLi9tYWtlU2VhcmNoU3RhdGVQb29sJyk7XG52YXIgaGV1cmlzdGljcyA9IHJlcXVpcmUoJy4vaGV1cmlzdGljcycpO1xudmFyIGRlZmF1bHRTZXR0aW5ncyA9IHJlcXVpcmUoJy4vZGVmYXVsdFNldHRpbmdzLmpzJyk7XG5cbnZhciBOT19QQVRIID0gZGVmYXVsdFNldHRpbmdzLk5PX1BBVEg7XG5cbm1vZHVsZS5leHBvcnRzLmwyID0gaGV1cmlzdGljcy5sMjtcbm1vZHVsZS5leHBvcnRzLmwxID0gaGV1cmlzdGljcy5sMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHBhdGhmaW5kZXIuIEEgcGF0aGZpbmRlciBoYXMganVzdCBvbmUgbWV0aG9kOlxuICogYGZpbmQoZnJvbUlkLCB0b0lkKWAsIGl0IG1heSBiZSBleHRlbmRlZCBpbiBmdXR1cmUuXG4gKiBcbiAqIEBwYXJhbSB7bmdyYXBoLmdyYXBofSBncmFwaCBpbnN0YW5jZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnZha2EvbmdyYXBoLmdyYXBoXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyB0aGF0IGNvbmZpZ3VyZXMgc2VhcmNoXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKGEsIGIpfSBvcHRpb25zLmhldXJpc3RpYyAtIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGVzdGltYXRlZCBkaXN0YW5jZSBiZXR3ZWVuXG4gKiBub2RlcyBgYWAgYW5kIGBiYC4gVGhpcyBmdW5jdGlvbiBzaG91bGQgbmV2ZXIgb3ZlcmVzdGltYXRlIGFjdHVhbCBkaXN0YW5jZSBiZXR3ZWVuIHR3b1xuICogbm9kZXMgKG90aGVyd2lzZSB0aGUgZm91bmQgcGF0aCB3aWxsIG5vdCBiZSB0aGUgc2hvcnRlc3QpLiBEZWZhdWx0cyBmdW5jdGlvbiByZXR1cm5zIDAsXG4gKiB3aGljaCBtYWtlcyB0aGlzIHNlYXJjaCBlcXVpdmFsZW50IHRvIERpamtzdHJhIHNlYXJjaC5cbiAqIEBwYXJhbSB7RnVuY3Rpb24oYSwgYil9IG9wdGlvbnMuZGlzdGFuY2UgLSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhY3R1YWwgZGlzdGFuY2UgYmV0d2VlbiB0d29cbiAqIG5vZGVzIGBhYCBhbmQgYGJgLiBCeSBkZWZhdWx0IHRoaXMgaXMgc2V0IHRvIHJldHVybiBncmFwaC10aGVvcmV0aWNhbCBkaXN0YW5jZSAoYWx3YXlzIDEpO1xuICogXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBIHBhdGhmaW5kZXIgd2l0aCBzaW5nbGUgbWV0aG9kIGBmaW5kKClgLlxuICovXG5mdW5jdGlvbiBhU3RhclBhdGhTZWFyY2goZ3JhcGgsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIC8vIHdoZXRoZXIgdHJhdmVyc2FsIHNob3VsZCBiZSBjb25zaWRlcmVkIG92ZXIgb3JpZW50ZWQgZ3JhcGguXG4gIHZhciBvcmllbnRlZCA9IG9wdGlvbnMub3JpZW50ZWQ7XG5cbiAgdmFyIGhldXJpc3RpYyA9IG9wdGlvbnMuaGV1cmlzdGljO1xuICBpZiAoIWhldXJpc3RpYykgaGV1cmlzdGljID0gZGVmYXVsdFNldHRpbmdzLmhldXJpc3RpYztcblxuICB2YXIgZGlzdGFuY2UgPSBvcHRpb25zLmRpc3RhbmNlO1xuICBpZiAoIWRpc3RhbmNlKSBkaXN0YW5jZSA9IGRlZmF1bHRTZXR0aW5ncy5kaXN0YW5jZTtcbiAgdmFyIHBvb2wgPSBtYWtlU2VhcmNoU3RhdGVQb29sKCk7XG5cbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBGaW5kcyBhIHBhdGggYmV0d2VlbiBub2RlIGBmcm9tSWRgIGFuZCBgdG9JZGAuXG4gICAgICogQHJldHVybnMge0FycmF5fSBvZiBub2RlcyBiZXR3ZWVuIGB0b0lkYCBhbmQgYGZyb21JZGAuIEVtcHR5IGFycmF5IGlzIHJldHVybmVkXG4gICAgICogaWYgbm8gcGF0aCBpcyBmb3VuZC5cbiAgICAgKi9cbiAgICBmaW5kOiBmaW5kXG4gIH07XG5cbiAgZnVuY3Rpb24gZmluZChmcm9tSWQsIHRvSWQpIHtcbiAgICB2YXIgZnJvbSA9IGdyYXBoLmdldE5vZGUoZnJvbUlkKTtcbiAgICBpZiAoIWZyb20pIHRocm93IG5ldyBFcnJvcignZnJvbUlkIGlzIG5vdCBkZWZpbmVkIGluIHRoaXMgZ3JhcGg6ICcgKyBmcm9tSWQpO1xuICAgIHZhciB0byA9IGdyYXBoLmdldE5vZGUodG9JZCk7XG4gICAgaWYgKCF0bykgdGhyb3cgbmV3IEVycm9yKCd0b0lkIGlzIG5vdCBkZWZpbmVkIGluIHRoaXMgZ3JhcGg6ICcgKyB0b0lkKTtcbiAgICBwb29sLnJlc2V0KCk7XG5cbiAgICAvLyBNYXBzIG5vZGVJZCB0byBOb2RlU2VhcmNoU3RhdGUuXG4gICAgdmFyIG5vZGVTdGF0ZSA9IG5ldyBNYXAoKTtcblxuICAgIC8vIHRoZSBub2RlcyB0aGF0IHdlIHN0aWxsIG5lZWQgdG8gZXZhbHVhdGVcbiAgICB2YXIgb3BlblNldCA9IG5ldyBOb2RlSGVhcCh7XG4gICAgICBjb21wYXJlOiBkZWZhdWx0U2V0dGluZ3MuY29tcGFyZUZTY29yZSxcbiAgICAgIHNldE5vZGVJZDogZGVmYXVsdFNldHRpbmdzLnNldEhlYXBJbmRleFxuICAgIH0pO1xuXG4gICAgdmFyIHN0YXJ0Tm9kZSA9IHBvb2wuY3JlYXRlTmV3U3RhdGUoZnJvbSk7XG4gICAgbm9kZVN0YXRlLnNldChmcm9tSWQsIHN0YXJ0Tm9kZSk7XG5cbiAgICAvLyBGb3IgdGhlIGZpcnN0IG5vZGUsIGZTY29yZSBpcyBjb21wbGV0ZWx5IGhldXJpc3RpYy5cbiAgICBzdGFydE5vZGUuZlNjb3JlID0gaGV1cmlzdGljKGZyb20sIHRvKTtcblxuICAgIC8vIFRoZSBjb3N0IG9mIGdvaW5nIGZyb20gc3RhcnQgdG8gc3RhcnQgaXMgemVyby5cbiAgICBzdGFydE5vZGUuZGlzdGFuY2VUb1NvdXJjZSA9IDA7XG4gICAgb3BlblNldC5wdXNoKHN0YXJ0Tm9kZSk7XG4gICAgc3RhcnROb2RlLm9wZW4gPSAxO1xuXG4gICAgdmFyIGNhbWVGcm9tO1xuXG4gICAgd2hpbGUgKG9wZW5TZXQubGVuZ3RoID4gMCkge1xuICAgICAgY2FtZUZyb20gPSBvcGVuU2V0LnBvcCgpO1xuICAgICAgaWYgKGdvYWxSZWFjaGVkKGNhbWVGcm9tLCB0bykpIHJldHVybiByZWNvbnN0cnVjdFBhdGgoY2FtZUZyb20pO1xuXG4gICAgICAvLyBubyBuZWVkIHRvIHZpc2l0IHRoaXMgbm9kZSBhbnltb3JlXG4gICAgICBjYW1lRnJvbS5jbG9zZWQgPSB0cnVlO1xuICAgICAgZ3JhcGguZm9yRWFjaExpbmtlZE5vZGUoY2FtZUZyb20ubm9kZS5pZCwgdmlzaXROZWlnaGJvdXIsIG9yaWVudGVkKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBnb3QgaGVyZSwgdGhlbiB0aGVyZSBpcyBubyBwYXRoLlxuICAgIHJldHVybiBOT19QQVRIO1xuXG4gICAgZnVuY3Rpb24gdmlzaXROZWlnaGJvdXIob3RoZXJOb2RlLCBsaW5rKSB7XG4gICAgICB2YXIgb3RoZXJTZWFyY2hTdGF0ZSA9IG5vZGVTdGF0ZS5nZXQob3RoZXJOb2RlLmlkKTtcbiAgICAgIGlmICghb3RoZXJTZWFyY2hTdGF0ZSkge1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlID0gcG9vbC5jcmVhdGVOZXdTdGF0ZShvdGhlck5vZGUpO1xuICAgICAgICBub2RlU3RhdGUuc2V0KG90aGVyTm9kZS5pZCwgb3RoZXJTZWFyY2hTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvdGhlclNlYXJjaFN0YXRlLmNsb3NlZCkge1xuICAgICAgICAvLyBBbHJlYWR5IHByb2Nlc3NlZCB0aGlzIG5vZGUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChvdGhlclNlYXJjaFN0YXRlLm9wZW4gPT09IDApIHtcbiAgICAgICAgLy8gUmVtZW1iZXIgdGhpcyBub2RlLlxuICAgICAgICBvcGVuU2V0LnB1c2gob3RoZXJTZWFyY2hTdGF0ZSk7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUub3BlbiA9IDE7XG4gICAgICB9XG5cbiAgICAgIHZhciB0ZW50YXRpdmVEaXN0YW5jZSA9IGNhbWVGcm9tLmRpc3RhbmNlVG9Tb3VyY2UgKyBkaXN0YW5jZShvdGhlck5vZGUsIGNhbWVGcm9tLm5vZGUsIGxpbmspO1xuICAgICAgaWYgKHRlbnRhdGl2ZURpc3RhbmNlID49IG90aGVyU2VhcmNoU3RhdGUuZGlzdGFuY2VUb1NvdXJjZSkge1xuICAgICAgICAvLyBUaGlzIHdvdWxkIG9ubHkgbWFrZSBvdXIgcGF0aCBsb25nZXIuIElnbm9yZSB0aGlzIHJvdXRlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGJpbmdvISB3ZSBmb3VuZCBzaG9ydGVyIHBhdGg6XG4gICAgICBvdGhlclNlYXJjaFN0YXRlLnBhcmVudCA9IGNhbWVGcm9tO1xuICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5kaXN0YW5jZVRvU291cmNlID0gdGVudGF0aXZlRGlzdGFuY2U7XG4gICAgICBvdGhlclNlYXJjaFN0YXRlLmZTY29yZSA9IHRlbnRhdGl2ZURpc3RhbmNlICsgaGV1cmlzdGljKG90aGVyU2VhcmNoU3RhdGUubm9kZSwgdG8pO1xuXG4gICAgICBvcGVuU2V0LnVwZGF0ZUl0ZW0ob3RoZXJTZWFyY2hTdGF0ZS5oZWFwSW5kZXgpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnb2FsUmVhY2hlZChzZWFyY2hTdGF0ZSwgdGFyZ2V0Tm9kZSkge1xuICByZXR1cm4gc2VhcmNoU3RhdGUubm9kZSA9PT0gdGFyZ2V0Tm9kZTtcbn1cblxuZnVuY3Rpb24gcmVjb25zdHJ1Y3RQYXRoKHNlYXJjaFN0YXRlKSB7XG4gIHZhciBwYXRoID0gW3NlYXJjaFN0YXRlLm5vZGVdO1xuICB2YXIgcGFyZW50ID0gc2VhcmNoU3RhdGUucGFyZW50O1xuXG4gIHdoaWxlIChwYXJlbnQpIHtcbiAgICBwYXRoLnB1c2gocGFyZW50Lm5vZGUpO1xuICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gIH1cblxuICByZXR1cm4gcGF0aDtcbn1cbiIsIi8vIFdlIHJldXNlIGluc3RhbmNlIG9mIGFycmF5LCBidXQgd2UgdHJpZSB0byBmcmVlemUgaXQgYXMgd2VsbCxcbi8vIHNvIHRoYXQgY29uc3VtZXJzIGRvbid0IG1vZGlmeSBpdC4gTWF5YmUgaXQncyBhIGJhZCBpZGVhLlxudmFyIE5PX1BBVEggPSBbXTtcbmlmICh0eXBlb2YgT2JqZWN0LmZyZWV6ZSA9PT0gJ2Z1bmN0aW9uJykgT2JqZWN0LmZyZWV6ZShOT19QQVRIKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIFBhdGggc2VhcmNoIHNldHRpbmdzXG4gIGhldXJpc3RpYzogYmxpbmRIZXVyaXN0aWMsXG4gIGRpc3RhbmNlOiBjb25zdGFudERpc3RhbmNlLFxuICBjb21wYXJlRlNjb3JlOiBjb21wYXJlRlNjb3JlLFxuICBOT19QQVRIOiBOT19QQVRILFxuXG4gIC8vIGhlYXAgc2V0dGluZ3NcbiAgc2V0SGVhcEluZGV4OiBzZXRIZWFwSW5kZXgsXG5cbiAgLy8gbmJhOlxuICBzZXRIMTogc2V0SDEsXG4gIHNldEgyOiBzZXRIMixcbiAgY29tcGFyZUYxU2NvcmU6IGNvbXBhcmVGMVNjb3JlLFxuICBjb21wYXJlRjJTY29yZTogY29tcGFyZUYyU2NvcmUsXG59XG5cbmZ1bmN0aW9uIGJsaW5kSGV1cmlzdGljKC8qIGEsIGIgKi8pIHtcbiAgLy8gYmxpbmQgaGV1cmlzdGljIG1ha2VzIHRoaXMgc2VhcmNoIGVxdWFsIHRvIHBsYWluIERpamtzdHJhIHBhdGggc2VhcmNoLlxuICByZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gY29uc3RhbnREaXN0YW5jZSgvKiBhLCBiICovKSB7XG4gIHJldHVybiAxO1xufVxuXG5mdW5jdGlvbiBjb21wYXJlRlNjb3JlKGEsIGIpIHtcbiAgdmFyIHJlc3VsdCA9IGEuZlNjb3JlIC0gYi5mU2NvcmU7XG4gIC8vIFRPRE86IENhbiBJIGltcHJvdmUgc3BlZWQgd2l0aCBzbWFydGVyIHRpZXMtYnJlYWtpbmc/XG4gIC8vIEkgdHJpZWQgZGlzdGFuY2VUb1NvdXJjZSwgYnV0IGl0IGRpZG4ndCBzZWVtIHRvIGhhdmUgbXVjaCBlZmZlY3RcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gc2V0SGVhcEluZGV4KG5vZGVTZWFyY2hTdGF0ZSwgaGVhcEluZGV4KSB7XG4gIG5vZGVTZWFyY2hTdGF0ZS5oZWFwSW5kZXggPSBoZWFwSW5kZXg7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVGMVNjb3JlKGEsIGIpIHtcbiAgcmV0dXJuIGEuZjEgLSBiLmYxO1xufVxuXG5mdW5jdGlvbiBjb21wYXJlRjJTY29yZShhLCBiKSB7XG4gIHJldHVybiBhLmYyIC0gYi5mMjtcbn1cblxuZnVuY3Rpb24gc2V0SDEobm9kZSwgaGVhcEluZGV4KSB7XG4gIG5vZGUuaDEgPSBoZWFwSW5kZXg7XG59XG5cbmZ1bmN0aW9uIHNldEgyKG5vZGUsIGhlYXBJbmRleCkge1xuICBub2RlLmgyID0gaGVhcEluZGV4O1xufSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBsMjogbDIsXG4gIGwxOiBsMVxufTtcblxuLyoqXG4gKiBFdWNsaWQgZGlzdGFuY2UgKGwyIG5vcm0pO1xuICogXG4gKiBAcGFyYW0geyp9IGEgXG4gKiBAcGFyYW0geyp9IGIgXG4gKi9cbmZ1bmN0aW9uIGwyKGEsIGIpIHtcbiAgdmFyIGR4ID0gYS54IC0gYi54O1xuICB2YXIgZHkgPSBhLnkgLSBiLnk7XG4gIHJldHVybiBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xufVxuXG4vKipcbiAqIE1hbmhhdHRhbiBkaXN0YW5jZSAobDEgbm9ybSk7XG4gKiBAcGFyYW0geyp9IGEgXG4gKiBAcGFyYW0geyp9IGIgXG4gKi9cbmZ1bmN0aW9uIGwxKGEsIGIpIHtcbiAgdmFyIGR4ID0gYS54IC0gYi54O1xuICB2YXIgZHkgPSBhLnkgLSBiLnk7XG4gIHJldHVybiBNYXRoLmFicyhkeCkgKyBNYXRoLmFicyhkeSk7XG59XG4iLCIvKipcbiAqIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhIHNpbmdsZSBzZWFyY2ggbm9kZSBpbiB0aGUgZXhwbG9yYXRpb24gdHJlZSBmb3JcbiAqIEEqIGFsZ29yaXRobS5cbiAqIFxuICogQHBhcmFtIHtPYmplY3R9IG5vZGUgIG9yaWdpbmFsIG5vZGUgaW4gdGhlIGdyYXBoXG4gKi9cbmZ1bmN0aW9uIE5vZGVTZWFyY2hTdGF0ZShub2RlKSB7XG4gIHRoaXMubm9kZSA9IG5vZGU7XG5cbiAgLy8gSG93IHdlIGNhbWUgdG8gdGhpcyBub2RlP1xuICB0aGlzLnBhcmVudCA9IG51bGw7XG5cbiAgdGhpcy5jbG9zZWQgPSBmYWxzZTtcbiAgdGhpcy5vcGVuID0gMDtcblxuICB0aGlzLmRpc3RhbmNlVG9Tb3VyY2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gIC8vIHRoZSBmKG4pID0gZyhuKSArIGgobikgdmFsdWVcbiAgdGhpcy5mU2NvcmUgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbiAgLy8gdXNlZCB0byByZWNvbnN0cnVjdCBoZWFwIHdoZW4gZlNjb3JlIGlzIHVwZGF0ZWQuXG4gIHRoaXMuaGVhcEluZGV4ID0gLTE7XG59O1xuXG5mdW5jdGlvbiBtYWtlU2VhcmNoU3RhdGVQb29sKCkge1xuICB2YXIgY3VycmVudEluQ2FjaGUgPSAwO1xuICB2YXIgbm9kZUNhY2hlID0gW107XG5cbiAgcmV0dXJuIHtcbiAgICBjcmVhdGVOZXdTdGF0ZTogY3JlYXRlTmV3U3RhdGUsXG4gICAgcmVzZXQ6IHJlc2V0XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgY3VycmVudEluQ2FjaGUgPSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlTmV3U3RhdGUobm9kZSkge1xuICAgIHZhciBjYWNoZWQgPSBub2RlQ2FjaGVbY3VycmVudEluQ2FjaGVdO1xuICAgIGlmIChjYWNoZWQpIHtcbiAgICAgIC8vIFRPRE86IFRoaXMgYWxtb3N0IGR1cGxpY2F0ZXMgY29uc3RydWN0b3IgY29kZS4gTm90IHN1cmUgaWZcbiAgICAgIC8vIGl0IHdvdWxkIGltcGFjdCBwZXJmb3JtYW5jZSBpZiBJIG1vdmUgdGhpcyBjb2RlIGludG8gYSBmdW5jdGlvblxuICAgICAgY2FjaGVkLm5vZGUgPSBub2RlO1xuICAgICAgLy8gSG93IHdlIGNhbWUgdG8gdGhpcyBub2RlP1xuICAgICAgY2FjaGVkLnBhcmVudCA9IG51bGw7XG5cbiAgICAgIGNhY2hlZC5jbG9zZWQgPSBmYWxzZTtcbiAgICAgIGNhY2hlZC5vcGVuID0gMDtcblxuICAgICAgY2FjaGVkLmRpc3RhbmNlVG9Tb3VyY2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgICAvLyB0aGUgZihuKSA9IGcobikgKyBoKG4pIHZhbHVlXG4gICAgICBjYWNoZWQuZlNjb3JlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gICAgICAvLyB1c2VkIHRvIHJlY29uc3RydWN0IGhlYXAgd2hlbiBmU2NvcmUgaXMgdXBkYXRlZC5cbiAgICAgIGNhY2hlZC5oZWFwSW5kZXggPSAtMTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBjYWNoZWQgPSBuZXcgTm9kZVNlYXJjaFN0YXRlKG5vZGUpO1xuICAgICAgbm9kZUNhY2hlW2N1cnJlbnRJbkNhY2hlXSA9IGNhY2hlZDtcbiAgICB9XG4gICAgY3VycmVudEluQ2FjaGUrKztcbiAgICByZXR1cm4gY2FjaGVkO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IG1ha2VTZWFyY2hTdGF0ZVBvb2w7IiwibW9kdWxlLmV4cG9ydHMgPSBuYmE7XG5cbnZhciBOb2RlSGVhcCA9IHJlcXVpcmUoJy4uL05vZGVIZWFwJyk7XG52YXIgaGV1cmlzdGljcyA9IHJlcXVpcmUoJy4uL2hldXJpc3RpY3MnKTtcbnZhciBkZWZhdWx0U2V0dGluZ3MgPSByZXF1aXJlKCcuLi9kZWZhdWx0U2V0dGluZ3MuanMnKTtcbnZhciBtYWtlTkJBU2VhcmNoU3RhdGVQb29sID0gcmVxdWlyZSgnLi9tYWtlTkJBU2VhcmNoU3RhdGVQb29sLmpzJyk7XG5cbnZhciBOT19QQVRIID0gZGVmYXVsdFNldHRpbmdzLk5PX1BBVEg7XG5cbm1vZHVsZS5leHBvcnRzLmwyID0gaGV1cmlzdGljcy5sMjtcbm1vZHVsZS5leHBvcnRzLmwxID0gaGV1cmlzdGljcy5sMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHBhdGhmaW5kZXIuIEEgcGF0aGZpbmRlciBoYXMganVzdCBvbmUgbWV0aG9kOlxuICogYGZpbmQoZnJvbUlkLCB0b0lkKWAuXG4gKiBcbiAqIFRoaXMgaXMgaW1wbGVtZW50YXRpb24gb2YgdGhlIE5CQSogYWxnb3JpdGhtIGRlc2NyaWJlZCBpbiBcbiAqIFxuICogIFwiWWV0IGFub3RoZXIgYmlkaXJlY3Rpb25hbCBhbGdvcml0aG0gZm9yIHNob3J0ZXN0IHBhdGhzXCIgcGFwZXIgYnkgV2ltIFBpamxzIGFuZCBIZW5rIFBvc3RcbiAqIFxuICogVGhlIHBhcGVyIGlzIGF2YWlsYWJsZSBoZXJlOiBodHRwczovL3JlcHViLmV1ci5ubC9wdWIvMTYxMDAvZWkyMDA5LTEwLnBkZlxuICogXG4gKiBAcGFyYW0ge25ncmFwaC5ncmFwaH0gZ3JhcGggaW5zdGFuY2UuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW52YWthL25ncmFwaC5ncmFwaFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgdGhhdCBjb25maWd1cmVzIHNlYXJjaFxuICogQHBhcmFtIHtGdW5jdGlvbihhLCBiKX0gb3B0aW9ucy5oZXVyaXN0aWMgLSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBlc3RpbWF0ZWQgZGlzdGFuY2UgYmV0d2VlblxuICogbm9kZXMgYGFgIGFuZCBgYmAuIFRoaXMgZnVuY3Rpb24gc2hvdWxkIG5ldmVyIG92ZXJlc3RpbWF0ZSBhY3R1YWwgZGlzdGFuY2UgYmV0d2VlbiB0d29cbiAqIG5vZGVzIChvdGhlcndpc2UgdGhlIGZvdW5kIHBhdGggd2lsbCBub3QgYmUgdGhlIHNob3J0ZXN0KS4gRGVmYXVsdHMgZnVuY3Rpb24gcmV0dXJucyAwLFxuICogd2hpY2ggbWFrZXMgdGhpcyBzZWFyY2ggZXF1aXZhbGVudCB0byBEaWprc3RyYSBzZWFyY2guXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKGEsIGIpfSBvcHRpb25zLmRpc3RhbmNlIC0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYWN0dWFsIGRpc3RhbmNlIGJldHdlZW4gdHdvXG4gKiBub2RlcyBgYWAgYW5kIGBiYC4gQnkgZGVmYXVsdCB0aGlzIGlzIHNldCB0byByZXR1cm4gZ3JhcGgtdGhlb3JldGljYWwgZGlzdGFuY2UgKGFsd2F5cyAxKTtcbiAqIFxuICogQHJldHVybnMge09iamVjdH0gQSBwYXRoZmluZGVyIHdpdGggc2luZ2xlIG1ldGhvZCBgZmluZCgpYC5cbiAqL1xuZnVuY3Rpb24gbmJhKGdyYXBoLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAvLyB3aGV0aGVyIHRyYXZlcnNhbCBzaG91bGQgYmUgY29uc2lkZXJlZCBvdmVyIG9yaWVudGVkIGdyYXBoLlxuICB2YXIgb3JpZW50ZWQgPSBvcHRpb25zLm9yaWVudGVkO1xuICB2YXIgcXVpdEZhc3QgPSBvcHRpb25zLnF1aXRGYXN0O1xuXG4gIHZhciBoZXVyaXN0aWMgPSBvcHRpb25zLmhldXJpc3RpYztcbiAgaWYgKCFoZXVyaXN0aWMpIGhldXJpc3RpYyA9IGRlZmF1bHRTZXR0aW5ncy5oZXVyaXN0aWM7XG5cbiAgdmFyIGRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZTtcbiAgaWYgKCFkaXN0YW5jZSkgZGlzdGFuY2UgPSBkZWZhdWx0U2V0dGluZ3MuZGlzdGFuY2U7XG5cbiAgLy8gRHVyaW5nIHN0cmVzcyB0ZXN0cyBJIG5vdGljZWQgdGhhdCBnYXJiYWdlIGNvbGxlY3Rpb24gd2FzIG9uZSBvZiB0aGUgaGVhdmllc3RcbiAgLy8gY29udHJpYnV0b3JzIHRvIHRoZSBhbGdvcml0aG0ncyBzcGVlZC4gU28gSSdtIHVzaW5nIGFuIG9iamVjdCBwb29sIHRvIHJlY3ljbGUgbm9kZXMuXG4gIHZhciBwb29sID0gbWFrZU5CQVNlYXJjaFN0YXRlUG9vbCgpO1xuXG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogRmluZHMgYSBwYXRoIGJldHdlZW4gbm9kZSBgZnJvbUlkYCBhbmQgYHRvSWRgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gb2Ygbm9kZXMgYmV0d2VlbiBgdG9JZGAgYW5kIGBmcm9tSWRgLiBFbXB0eSBhcnJheSBpcyByZXR1cm5lZFxuICAgICAqIGlmIG5vIHBhdGggaXMgZm91bmQuXG4gICAgICovXG4gICAgZmluZDogZmluZFxuICB9O1xuXG4gIGZ1bmN0aW9uIGZpbmQoZnJvbUlkLCB0b0lkKSB7XG4gICAgLy8gSSBtdXN0IGFwb2xvZ2l6ZSBmb3IgdGhlIGNvZGUgZHVwbGljYXRpb24uIFRoaXMgd2FzIHRoZSBlYXNpZXN0IHdheSBmb3IgbWUgdG9cbiAgICAvLyBpbXBsZW1lbnQgdGhlIGFsZ29yaXRobSBmYXN0LlxuICAgIHZhciBmcm9tID0gZ3JhcGguZ2V0Tm9kZShmcm9tSWQpO1xuICAgIGlmICghZnJvbSkgdGhyb3cgbmV3IEVycm9yKCdmcm9tSWQgaXMgbm90IGRlZmluZWQgaW4gdGhpcyBncmFwaDogJyArIGZyb21JZCk7XG4gICAgdmFyIHRvID0gZ3JhcGguZ2V0Tm9kZSh0b0lkKTtcbiAgICBpZiAoIXRvKSB0aHJvdyBuZXcgRXJyb3IoJ3RvSWQgaXMgbm90IGRlZmluZWQgaW4gdGhpcyBncmFwaDogJyArIHRvSWQpO1xuXG4gICAgcG9vbC5yZXNldCgpO1xuXG4gICAgLy8gSSBtdXN0IGFsc28gYXBvbG9naXplIGZvciBzb21ld2hhdCBjcnlwdGljIG5hbWVzLiBUaGUgTkJBKiBpcyBiaS1kaXJlY3Rpb25hbFxuICAgIC8vIHNlYXJjaCBhbGdvcml0aG0sIHdoaWNoIG1lYW5zIGl0IHJ1bnMgdHdvIHNlYXJjaGVzIGluIHBhcmFsbGVsLiBPbmUgcnVuc1xuICAgIC8vIGZyb20gc291cmNlIG5vZGUgdG8gdGFyZ2V0LCB3aGlsZSB0aGUgb3RoZXIgb25lIHJ1bnMgZnJvbSB0YXJnZXQgdG8gc291cmNlLlxuICAgIC8vIEV2ZXJ5d2hlcmUgd2hlcmUgeW91IHNlZSBgMWAgaXQgbWVhbnMgaXQncyBmb3IgdGhlIGZvcndhcmQgc2VhcmNoLiBgMmAgaXMgZm9yIFxuICAgIC8vIGJhY2t3YXJkIHNlYXJjaC5cblxuICAgIC8vIEZvciBvcmllbnRlZCBncmFwaCBwYXRoIGZpbmRpbmcsIHdlIG5lZWQgdG8gcmV2ZXJzZSB0aGUgZ3JhcGgsIHNvIHRoYXRcbiAgICAvLyBiYWNrd2FyZCBzZWFyY2ggdmlzaXRzIGNvcnJlY3QgbGluay4gT2J2aW91c2x5IHdlIGRvbid0IHdhbnQgdG8gZHVwbGljYXRlXG4gICAgLy8gdGhlIGdyYXBoLCBpbnN0ZWFkIHdlIGFsd2F5cyB0cmF2ZXJzZSB0aGUgZ3JhcGggYXMgbm9uLW9yaWVudGVkLCBhbmQgZmlsdGVyXG4gICAgLy8gZWRnZXMgaW4gYHZpc2l0TjFPcmllbnRlZC92aXNpdE4yT3JpdGVudGVkYFxuICAgIHZhciBmb3J3YXJkVmlzaXRvciA9IG9yaWVudGVkID8gdmlzaXROMU9yaWVudGVkIDogdmlzaXROMTtcbiAgICB2YXIgcmV2ZXJzZVZpc2l0b3IgPSBvcmllbnRlZCA/IHZpc2l0TjJPcmllbnRlZCA6IHZpc2l0TjI7XG5cbiAgICAvLyBNYXBzIG5vZGVJZCB0byBOQkFTZWFyY2hTdGF0ZS5cbiAgICB2YXIgbm9kZVN0YXRlID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gVGhlc2UgdHdvIGhlYXBzIHN0b3JlIG5vZGVzIGJ5IHRoZWlyIHVuZGVyZXN0aW1hdGVkIHZhbHVlcy5cbiAgICB2YXIgb3BlbjFTZXQgPSBuZXcgTm9kZUhlYXAoe1xuICAgICAgY29tcGFyZTogZGVmYXVsdFNldHRpbmdzLmNvbXBhcmVGMVNjb3JlLFxuICAgICAgc2V0Tm9kZUlkOiBkZWZhdWx0U2V0dGluZ3Muc2V0SDFcbiAgICB9KTtcbiAgICB2YXIgb3BlbjJTZXQgPSBuZXcgTm9kZUhlYXAoe1xuICAgICAgY29tcGFyZTogZGVmYXVsdFNldHRpbmdzLmNvbXBhcmVGMlNjb3JlLFxuICAgICAgc2V0Tm9kZUlkOiBkZWZhdWx0U2V0dGluZ3Muc2V0SDJcbiAgICB9KTtcblxuICAgIC8vIFRoaXMgaXMgd2hlcmUgYm90aCBzZWFyY2hlcyB3aWxsIG1lZXQuXG4gICAgdmFyIG1pbk5vZGU7XG5cbiAgICAvLyBUaGUgc21hbGxlc3QgcGF0aCBsZW5ndGggc2VlbiBzbyBmYXIgaXMgc3RvcmVkIGhlcmU6XG4gICAgdmFyIGxNaW4gPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbiAgICAvLyBXZSBzdGFydCBieSBwdXR0aW5nIHN0YXJ0L2VuZCBub2RlcyB0byB0aGUgY29ycmVzcG9uZGluZyBoZWFwc1xuICAgIHZhciBzdGFydE5vZGUgPSBwb29sLmNyZWF0ZU5ld1N0YXRlKGZyb20pO1xuICAgIG5vZGVTdGF0ZS5zZXQoZnJvbUlkLCBzdGFydE5vZGUpOyBcbiAgICBzdGFydE5vZGUuZzEgPSAwO1xuICAgIHZhciBmMSA9IGhldXJpc3RpYyhmcm9tLCB0byk7XG4gICAgc3RhcnROb2RlLmYxID0gZjE7XG4gICAgb3BlbjFTZXQucHVzaChzdGFydE5vZGUpO1xuXG4gICAgdmFyIGVuZE5vZGUgPSBwb29sLmNyZWF0ZU5ld1N0YXRlKHRvKTtcbiAgICBub2RlU3RhdGUuc2V0KHRvSWQsIGVuZE5vZGUpO1xuICAgIGVuZE5vZGUuZzIgPSAwO1xuICAgIHZhciBmMiA9IGYxOyAvLyB0aGV5IHNob3VsZCBhZ3JlZSBvcmlnaW5hbGx5XG4gICAgZW5kTm9kZS5mMiA9IGYyO1xuICAgIG9wZW4yU2V0LnB1c2goZW5kTm9kZSlcblxuICAgIC8vIHRoZSBgY2FtZUZyb21gIHZhcmlhYmxlIGlzIGFjY2Vzc2VkIGJ5IGJvdGggc2VhcmNoZXMsIHNvIHRoYXQgd2UgY2FuIHN0b3JlIHBhcmVudHMuXG4gICAgdmFyIGNhbWVGcm9tO1xuXG4gICAgLy8gdGhpcyBpcyB0aGUgbWFpbiBhbGdvcml0aG0gbG9vcDpcbiAgICB3aGlsZSAob3BlbjJTZXQubGVuZ3RoICYmIG9wZW4xU2V0Lmxlbmd0aCkge1xuICAgICAgaWYgKG9wZW4xU2V0Lmxlbmd0aCA8IG9wZW4yU2V0Lmxlbmd0aCkge1xuICAgICAgICBmb3J3YXJkU2VhcmNoKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXZlcnNlU2VhcmNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChxdWl0RmFzdCAmJiBtaW5Ob2RlKSBicmVhaztcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBnb3QgaGVyZSwgdGhlbiB0aGVyZSBpcyBubyBwYXRoLlxuICAgIHZhciBwYXRoID0gcmVjb25zdHJ1Y3RQYXRoKG1pbk5vZGUpO1xuICAgIHJldHVybiBwYXRoOyAvLyB0aGUgcHVibGljIEFQSSBpcyBvdmVyXG5cbiAgICBmdW5jdGlvbiBmb3J3YXJkU2VhcmNoKCkge1xuICAgICAgY2FtZUZyb20gPSBvcGVuMVNldC5wb3AoKTtcbiAgICAgIGlmIChjYW1lRnJvbS5jbG9zZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjYW1lRnJvbS5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICBpZiAoY2FtZUZyb20uZjEgPCBsTWluICYmIChjYW1lRnJvbS5nMSArIGYyIC0gaGV1cmlzdGljKGZyb20sIGNhbWVGcm9tLm5vZGUpKSA8IGxNaW4pIHtcbiAgICAgICAgZ3JhcGguZm9yRWFjaExpbmtlZE5vZGUoY2FtZUZyb20ubm9kZS5pZCwgZm9yd2FyZFZpc2l0b3IpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3BlbjFTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICBmMSA9IG9wZW4xU2V0LnBlZWsoKS5mMTtcbiAgICAgIH0gXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmV2ZXJzZVNlYXJjaCgpIHtcbiAgICAgIGNhbWVGcm9tID0gb3BlbjJTZXQucG9wKCk7XG4gICAgICBpZiAoY2FtZUZyb20uY2xvc2VkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNhbWVGcm9tLmNsb3NlZCA9IHRydWU7XG5cbiAgICAgIGlmIChjYW1lRnJvbS5mMiA8IGxNaW4gJiYgKGNhbWVGcm9tLmcyICsgZjEgLSBoZXVyaXN0aWMoY2FtZUZyb20ubm9kZSwgdG8pKSA8IGxNaW4pIHtcbiAgICAgICAgZ3JhcGguZm9yRWFjaExpbmtlZE5vZGUoY2FtZUZyb20ubm9kZS5pZCwgcmV2ZXJzZVZpc2l0b3IpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3BlbjJTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICBmMiA9IG9wZW4yU2V0LnBlZWsoKS5mMjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2aXNpdE4xKG90aGVyTm9kZSwgbGluaykge1xuICAgICAgdmFyIG90aGVyU2VhcmNoU3RhdGUgPSBub2RlU3RhdGUuZ2V0KG90aGVyTm9kZS5pZCk7XG4gICAgICBpZiAoIW90aGVyU2VhcmNoU3RhdGUpIHtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZSA9IHBvb2wuY3JlYXRlTmV3U3RhdGUob3RoZXJOb2RlKTtcbiAgICAgICAgbm9kZVN0YXRlLnNldChvdGhlck5vZGUuaWQsIG90aGVyU2VhcmNoU3RhdGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3RoZXJTZWFyY2hTdGF0ZS5jbG9zZWQpIHJldHVybjtcblxuICAgICAgdmFyIHRlbnRhdGl2ZURpc3RhbmNlID0gY2FtZUZyb20uZzEgKyBkaXN0YW5jZShjYW1lRnJvbS5ub2RlLCBvdGhlck5vZGUsIGxpbmspO1xuXG4gICAgICBpZiAodGVudGF0aXZlRGlzdGFuY2UgPCBvdGhlclNlYXJjaFN0YXRlLmcxKSB7XG4gICAgICAgIG90aGVyU2VhcmNoU3RhdGUuZzEgPSB0ZW50YXRpdmVEaXN0YW5jZTtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5mMSA9IHRlbnRhdGl2ZURpc3RhbmNlICsgaGV1cmlzdGljKG90aGVyU2VhcmNoU3RhdGUubm9kZSwgdG8pO1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlLnAxID0gY2FtZUZyb207XG4gICAgICAgIGlmIChvdGhlclNlYXJjaFN0YXRlLmgxIDwgMCkge1xuICAgICAgICAgIG9wZW4xU2V0LnB1c2gob3RoZXJTZWFyY2hTdGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3BlbjFTZXQudXBkYXRlSXRlbShvdGhlclNlYXJjaFN0YXRlLmgxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHBvdGVudGlhbE1pbiA9IG90aGVyU2VhcmNoU3RhdGUuZzEgKyBvdGhlclNlYXJjaFN0YXRlLmcyO1xuICAgICAgaWYgKHBvdGVudGlhbE1pbiA8IGxNaW4pIHsgXG4gICAgICAgIGxNaW4gPSBwb3RlbnRpYWxNaW47XG4gICAgICAgIG1pbk5vZGUgPSBvdGhlclNlYXJjaFN0YXRlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZpc2l0TjIob3RoZXJOb2RlLCBsaW5rKSB7XG4gICAgICB2YXIgb3RoZXJTZWFyY2hTdGF0ZSA9IG5vZGVTdGF0ZS5nZXQob3RoZXJOb2RlLmlkKTtcbiAgICAgIGlmICghb3RoZXJTZWFyY2hTdGF0ZSkge1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlID0gcG9vbC5jcmVhdGVOZXdTdGF0ZShvdGhlck5vZGUpO1xuICAgICAgICBub2RlU3RhdGUuc2V0KG90aGVyTm9kZS5pZCwgb3RoZXJTZWFyY2hTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvdGhlclNlYXJjaFN0YXRlLmNsb3NlZCkgcmV0dXJuO1xuXG4gICAgICB2YXIgdGVudGF0aXZlRGlzdGFuY2UgPSBjYW1lRnJvbS5nMiArIGRpc3RhbmNlKGNhbWVGcm9tLm5vZGUsIG90aGVyTm9kZSwgbGluayk7XG5cbiAgICAgIGlmICh0ZW50YXRpdmVEaXN0YW5jZSA8IG90aGVyU2VhcmNoU3RhdGUuZzIpIHtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5nMiA9IHRlbnRhdGl2ZURpc3RhbmNlO1xuICAgICAgICBvdGhlclNlYXJjaFN0YXRlLmYyID0gdGVudGF0aXZlRGlzdGFuY2UgKyBoZXVyaXN0aWMoZnJvbSwgb3RoZXJTZWFyY2hTdGF0ZS5ub2RlKTtcbiAgICAgICAgb3RoZXJTZWFyY2hTdGF0ZS5wMiA9IGNhbWVGcm9tO1xuICAgICAgICBpZiAob3RoZXJTZWFyY2hTdGF0ZS5oMiA8IDApIHtcbiAgICAgICAgICBvcGVuMlNldC5wdXNoKG90aGVyU2VhcmNoU3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9wZW4yU2V0LnVwZGF0ZUl0ZW0ob3RoZXJTZWFyY2hTdGF0ZS5oMik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBwb3RlbnRpYWxNaW4gPSBvdGhlclNlYXJjaFN0YXRlLmcxICsgb3RoZXJTZWFyY2hTdGF0ZS5nMjtcbiAgICAgIGlmIChwb3RlbnRpYWxNaW4gPCBsTWluKSB7XG4gICAgICAgIGxNaW4gPSBwb3RlbnRpYWxNaW47XG4gICAgICAgIG1pbk5vZGUgPSBvdGhlclNlYXJjaFN0YXRlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZpc2l0TjJPcmllbnRlZChvdGhlck5vZGUsIGxpbmspIHtcbiAgICAgIC8vIHdlIGFyZSBnb2luZyBiYWNrd2FyZHMsIGdyYXBoIG5lZWRzIHRvIGJlIHJldmVyc2VkLiBcbiAgICAgIGlmIChsaW5rLnRvSWQgPT09IGNhbWVGcm9tLm5vZGUuaWQpIHJldHVybiB2aXNpdE4yKG90aGVyTm9kZSwgbGluayk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHZpc2l0TjFPcmllbnRlZChvdGhlck5vZGUsIGxpbmspIHtcbiAgICAgIC8vIHRoaXMgaXMgZm9yd2FyZCBkaXJlY3Rpb24sIHNvIHdlIHNob3VsZCBiZSBjb21pbmcgRlJPTTpcbiAgICAgIGlmIChsaW5rLmZyb21JZCA9PT0gY2FtZUZyb20ubm9kZS5pZCkgcmV0dXJuIHZpc2l0TjEob3RoZXJOb2RlLCBsaW5rKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVjb25zdHJ1Y3RQYXRoKHNlYXJjaFN0YXRlKSB7XG4gIGlmICghc2VhcmNoU3RhdGUpIHJldHVybiBOT19QQVRIO1xuXG4gIHZhciBwYXRoID0gW3NlYXJjaFN0YXRlLm5vZGVdO1xuICB2YXIgcGFyZW50ID0gc2VhcmNoU3RhdGUucDE7XG5cbiAgd2hpbGUgKHBhcmVudCkge1xuICAgIHBhdGgucHVzaChwYXJlbnQubm9kZSk7XG4gICAgcGFyZW50ID0gcGFyZW50LnAxO1xuICB9XG5cbiAgdmFyIGNoaWxkID0gc2VhcmNoU3RhdGUucDI7XG5cbiAgd2hpbGUgKGNoaWxkKSB7XG4gICAgcGF0aC51bnNoaWZ0KGNoaWxkLm5vZGUpO1xuICAgIGNoaWxkID0gY2hpbGQucDI7XG4gIH1cbiAgcmV0dXJuIHBhdGg7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IG1ha2VOQkFTZWFyY2hTdGF0ZVBvb2w7XG5cbi8qKlxuICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgTkJBU2VhcmNoU3RhdGUuIFRoZSBpbnN0YW5jZSBzdG9yZXMgaW5mb3JtYXRpb25cbiAqIGFib3V0IHNlYXJjaCBzdGF0ZSwgYW5kIGlzIHVzZWQgYnkgTkJBKiBhbGdvcml0aG0uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG5vZGUgLSBvcmlnaW5hbCBncmFwaCBub2RlXG4gKi9cbmZ1bmN0aW9uIE5CQVNlYXJjaFN0YXRlKG5vZGUpIHtcbiAgLyoqXG4gICAqIE9yaWdpbmFsIGdyYXBoIG5vZGUuXG4gICAqL1xuICB0aGlzLm5vZGUgPSBub2RlO1xuXG4gIC8qKlxuICAgKiBQYXJlbnQgb2YgdGhpcyBub2RlIGluIGZvcndhcmQgc2VhcmNoXG4gICAqL1xuICB0aGlzLnAxID0gbnVsbDtcblxuICAvKipcbiAgICogUGFyZW50IG9mIHRoaXMgbm9kZSBpbiByZXZlcnNlIHNlYXJjaFxuICAgKi9cbiAgdGhpcy5wMiA9IG51bGw7XG5cbiAgLyoqXG4gICAqIElmIHRoaXMgaXMgc2V0IHRvIHRydWUsIHRoZW4gdGhlIG5vZGUgd2FzIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAqIGFuZCB3ZSBzaG91bGQgbm90IHRvdWNoIGl0IGFueW1vcmUuXG4gICAqL1xuICB0aGlzLmNsb3NlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBBY3R1YWwgZGlzdGFuY2UgZnJvbSB0aGlzIG5vZGUgdG8gaXRzIHBhcmVudCBpbiBmb3J3YXJkIHNlYXJjaFxuICAgKi9cbiAgdGhpcy5nMSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuICAvKipcbiAgICogQWN0dWFsIGRpc3RhbmNlIGZyb20gdGhpcyBub2RlIHRvIGl0cyBwYXJlbnQgaW4gcmV2ZXJzZSBzZWFyY2hcbiAgICovXG4gIHRoaXMuZzIgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cblxuICAvKipcbiAgICogVW5kZXJlc3RpbWF0ZWQgZGlzdGFuY2UgZnJvbSB0aGlzIG5vZGUgdG8gdGhlIHBhdGgtZmluZGluZyBzb3VyY2UuXG4gICAqL1xuICB0aGlzLmYxID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gIC8qKlxuICAgKiBVbmRlcmVzdGltYXRlZCBkaXN0YW5jZSBmcm9tIHRoaXMgbm9kZSB0byB0aGUgcGF0aC1maW5kaW5nIHRhcmdldC5cbiAgICovXG4gIHRoaXMuZjIgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbiAgLy8gdXNlZCB0byByZWNvbnN0cnVjdCBoZWFwIHdoZW4gZlNjb3JlIGlzIHVwZGF0ZWQuIFRPRE86IGRvIEkgbmVlZCB0aGVtIGJvdGg/XG5cbiAgLyoqXG4gICAqIEluZGV4IG9mIHRoaXMgbm9kZSBpbiB0aGUgZm9yd2FyZCBoZWFwLlxuICAgKi9cbiAgdGhpcy5oMSA9IC0xO1xuXG4gIC8qKlxuICAgKiBJbmRleCBvZiB0aGlzIG5vZGUgaW4gdGhlIHJldmVyc2UgaGVhcC5cbiAgICovXG4gIHRoaXMuaDIgPSAtMTtcbn1cblxuLyoqXG4gKiBBcyBwYXRoLWZpbmRpbmcgaXMgbWVtb3J5LWludGVuc2l2ZSBwcm9jZXNzLCB3ZSB3YW50IHRvIHJlZHVjZSBwcmVzc3VyZSBvblxuICogZ2FyYmFnZSBjb2xsZWN0b3IuIFRoaXMgY2xhc3MgaGVscHMgdXMgdG8gcmVjeWNsZSBwYXRoLWZpbmRpbmcgbm9kZXMgYW5kIHNpZ25pZmljYW50bHlcbiAqIHJlZHVjZXMgdGhlIHNlYXJjaCB0aW1lICh+MjAlIGZhc3RlciB0aGFuIHdpdGhvdXQgaXQpLlxuICovXG5mdW5jdGlvbiBtYWtlTkJBU2VhcmNoU3RhdGVQb29sKCkge1xuICB2YXIgY3VycmVudEluQ2FjaGUgPSAwO1xuICB2YXIgbm9kZUNhY2hlID0gW107XG5cbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IE5CQVNlYXJjaFN0YXRlIGluc3RhbmNlXG4gICAgICovXG4gICAgY3JlYXRlTmV3U3RhdGU6IGNyZWF0ZU5ld1N0YXRlLFxuXG4gICAgLyoqXG4gICAgICogTWFya3MgYWxsIGNyZWF0ZWQgaW5zdGFuY2VzIGF2YWlsYWJsZSBmb3IgcmVjeWNsaW5nLlxuICAgICAqL1xuICAgIHJlc2V0OiByZXNldFxuICB9O1xuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGN1cnJlbnRJbkNhY2hlID0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU5ld1N0YXRlKG5vZGUpIHtcbiAgICB2YXIgY2FjaGVkID0gbm9kZUNhY2hlW2N1cnJlbnRJbkNhY2hlXTtcbiAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAvLyBUT0RPOiBUaGlzIGFsbW9zdCBkdXBsaWNhdGVzIGNvbnN0cnVjdG9yIGNvZGUuIE5vdCBzdXJlIGlmXG4gICAgICAvLyBpdCB3b3VsZCBpbXBhY3QgcGVyZm9ybWFuY2UgaWYgSSBtb3ZlIHRoaXMgY29kZSBpbnRvIGEgZnVuY3Rpb25cbiAgICAgIGNhY2hlZC5ub2RlID0gbm9kZTtcblxuICAgICAgLy8gSG93IHdlIGNhbWUgdG8gdGhpcyBub2RlP1xuICAgICAgY2FjaGVkLnAxID0gbnVsbDtcbiAgICAgIGNhY2hlZC5wMiA9IG51bGw7XG5cbiAgICAgIGNhY2hlZC5jbG9zZWQgPSBmYWxzZTtcblxuICAgICAgY2FjaGVkLmcxID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgICAgY2FjaGVkLmcyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgICAgY2FjaGVkLmYxID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgICAgY2FjaGVkLmYyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gICAgICAvLyB1c2VkIHRvIHJlY29uc3RydWN0IGhlYXAgd2hlbiBmU2NvcmUgaXMgdXBkYXRlZC5cbiAgICAgIGNhY2hlZC5oMSA9IC0xO1xuICAgICAgY2FjaGVkLmgyID0gLTE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhY2hlZCA9IG5ldyBOQkFTZWFyY2hTdGF0ZShub2RlKTtcbiAgICAgIG5vZGVDYWNoZVtjdXJyZW50SW5DYWNoZV0gPSBjYWNoZWQ7XG4gICAgfVxuICAgIGN1cnJlbnRJbkNhY2hlKys7XG4gICAgcmV0dXJuIGNhY2hlZDtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFTdGFyOiByZXF1aXJlKCcuL2Etc3Rhci9hLXN0YXIuanMnKSxcbiAgYUdyZWVkeTogcmVxdWlyZSgnLi9hLXN0YXIvYS1ncmVlZHktc3RhcicpLFxuICBuYmE6IHJlcXVpcmUoJy4vYS1zdGFyL25iYS9pbmRleC5qcycpLFxufVxuIiwiaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4vbGliL0FwcGxpY2F0aW9uJ1xuaW1wb3J0IExvYWRpbmdTY2VuZSBmcm9tICcuL3NjZW5lcy9Mb2FkaW5nU2NlbmUnXG5cbi8vIENyZWF0ZSBhIFBpeGkgQXBwbGljYXRpb25cbmxldCBhcHAgPSBuZXcgQXBwbGljYXRpb24oe1xuICB3aWR0aDogMjU2LFxuICBoZWlnaHQ6IDI1NixcbiAgcm91bmRQaXhlbHM6IHRydWUsXG4gIGF1dG9SZXNpemU6IHRydWUsXG4gIHJlc29sdXRpb246IDEsXG4gIGF1dG9TdGFydDogZmFsc2Vcbn0pXG5cbmFwcC5yZW5kZXJlci52aWV3LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuYXBwLnJlbmRlcmVyLnZpZXcuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbmFwcC5yZW5kZXJlci5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcblxuLy8gQWRkIHRoZSBjYW52YXMgdGhhdCBQaXhpIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBmb3IgeW91IHRvIHRoZSBIVE1MIGRvY3VtZW50XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFwcC52aWV3KVxuXG5hcHAuY2hhbmdlU3RhZ2UoKVxuYXBwLnN0YXJ0KClcbmFwcC5jaGFuZ2VTY2VuZShMb2FkaW5nU2NlbmUpXG4iLCJleHBvcnQgY29uc3QgSVNfTU9CSUxFID0gKChhKSA9PiAvKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vL2kudGVzdChhKSB8fFxuICAvMTIwN3w2MzEwfDY1OTB8M2dzb3w0dGhwfDUwWzEtNl1pfDc3MHN8ODAyc3xhIHdhfGFiYWN8YWMoZXJ8b298cy0pfGFpKGtvfHJuKXxhbChhdnxjYXxjbyl8YW1vaXxhbihleHxueXx5dyl8YXB0dXxhcihjaHxnbyl8YXModGV8dXMpfGF0dHd8YXUoZGl8LW18ciB8cyApfGF2YW58YmUoY2t8bGx8bnEpfGJpKGxifHJkKXxibChhY3xheil8YnIoZXx2KXd8YnVtYnxidy0obnx1KXxjNTVcXC98Y2FwaXxjY3dhfGNkbS18Y2VsbHxjaHRtfGNsZGN8Y21kLXxjbyhtcHxuZCl8Y3Jhd3xkYShpdHxsbHxuZyl8ZGJ0ZXxkYy1zfGRldml8ZGljYXxkbW9ifGRvKGN8cClvfGRzKDEyfC1kKXxlbCg0OXxhaSl8ZW0obDJ8dWwpfGVyKGljfGswKXxlc2w4fGV6KFs0LTddMHxvc3x3YXx6ZSl8ZmV0Y3xmbHkoLXxfKXxnMSB1fGc1NjB8Z2VuZXxnZi01fGctbW98Z28oXFwud3xvZCl8Z3IoYWR8dW4pfGhhaWV8aGNpdHxoZC0obXxwfHQpfGhlaS18aGkocHR8dGEpfGhwKCBpfGlwKXxocy1jfGh0KGMoLXwgfF98YXxnfHB8c3x0KXx0cCl8aHUoYXd8dGMpfGktKDIwfGdvfG1hKXxpMjMwfGlhYyggfC18XFwvKXxpYnJvfGlkZWF8aWcwMXxpa29tfGltMWt8aW5ub3xpcGFxfGlyaXN8amEodHx2KWF8amJyb3xqZW11fGppZ3N8a2RkaXxrZWppfGtndCggfFxcLyl8a2xvbnxrcHQgfGt3Yy18a3lvKGN8ayl8bGUobm98eGkpfGxnKCBnfFxcLyhrfGx8dSl8NTB8NTR8LVthLXddKXxsaWJ3fGx5bnh8bTEtd3xtM2dhfG01MFxcL3xtYSh0ZXx1aXx4byl8bWMoMDF8MjF8Y2EpfG0tY3J8bWUocmN8cmkpfG1pKG84fG9hfHRzKXxtbWVmfG1vKDAxfDAyfGJpfGRlfGRvfHQoLXwgfG98dil8enopfG10KDUwfHAxfHYgKXxtd2JwfG15d2F8bjEwWzAtMl18bjIwWzItM118bjMwKDB8Mil8bjUwKDB8Mnw1KXxuNygwKDB8MSl8MTApfG5lKChjfG0pLXxvbnx0Znx3Znx3Z3x3dCl8bm9rKDZ8aSl8bnpwaHxvMmltfG9wKHRpfHd2KXxvcmFufG93ZzF8cDgwMHxwYW4oYXxkfHQpfHBkeGd8cGcoMTN8LShbMS04XXxjKSl8cGhpbHxwaXJlfHBsKGF5fHVjKXxwbi0yfHBvKGNrfHJ0fHNlKXxwcm94fHBzaW98cHQtZ3xxYS1hfHFjKDA3fDEyfDIxfDMyfDYwfC1bMi03XXxpLSl8cXRla3xyMzgwfHI2MDB8cmFrc3xyaW05fHJvKHZlfHpvKXxzNTVcXC98c2EoZ2V8bWF8bW18bXN8bnl8dmEpfHNjKDAxfGgtfG9vfHAtKXxzZGtcXC98c2UoYygtfDB8MSl8NDd8bWN8bmR8cmkpfHNnaC18c2hhcnxzaWUoLXxtKXxzay0wfHNsKDQ1fGlkKXxzbShhbHxhcnxiM3xpdHx0NSl8c28oZnR8bnkpfHNwKDAxfGgtfHYtfHYgKXxzeSgwMXxtYil8dDIoMTh8NTApfHQ2KDAwfDEwfDE4KXx0YShndHxsayl8dGNsLXx0ZGctfHRlbChpfG0pfHRpbS18dC1tb3x0byhwbHxzaCl8dHMoNzB8bS18bTN8bTUpfHR4LTl8dXAoXFwuYnxnMXxzaSl8dXRzdHx2NDAwfHY3NTB8dmVyaXx2aShyZ3x0ZSl8dmsoNDB8NVswLTNdfC12KXx2bTQwfHZvZGF8dnVsY3x2eCg1Mnw1M3w2MHw2MXw3MHw4MHw4MXw4M3w4NXw5OCl8dzNjKC18ICl8d2ViY3x3aGl0fHdpKGcgfG5jfG53KXx3bWxifHdvbnV8eDcwMHx5YXMtfHlvdXJ8emV0b3x6dGUtL2kudGVzdChhLnN1YnN0cigwLCA0KSlcbikobmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudmVuZG9yIHx8IHdpbmRvdy5vcGVyYSlcblxuZXhwb3J0IGNvbnN0IENFSUxfU0laRSA9IDMyXG5cbmV4cG9ydCBjb25zdCBBQklMSVRZX01PVkUgPSBTeW1ib2woJ21vdmUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfQ0FNRVJBID0gU3ltYm9sKCdjYW1lcmEnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfT1BFUkFURSA9IFN5bWJvbCgnb3BlcmF0ZScpXG5leHBvcnQgY29uc3QgQUJJTElUWV9LRVlfTU9WRSA9IFN5bWJvbCgna2V5LW1vdmUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfSEVBTFRIID0gU3ltYm9sKCdoZWFsdGgnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfQ0FSUlkgPSBTeW1ib2woJ2NhcnJ5JylcbmV4cG9ydCBjb25zdCBBQklMSVRZX0xFQVJOID0gU3ltYm9sKCdsZWFybicpXG5leHBvcnQgY29uc3QgQUJJTElUWV9QTEFDRSA9IFN5bWJvbCgncGxhY2UnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfS0VZX1BMQUNFID0gU3ltYm9sKCdrZXktcGxhY2UnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfS0VZX0ZJUkUgPSBTeW1ib2woJ2ZpcmUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVFlfUk9UQVRFID0gU3ltYm9sKCdyb3RhdGUnKVxuZXhwb3J0IGNvbnN0IEFCSUxJVElFU19BTEwgPSBbXG4gIEFCSUxJVFlfTU9WRSxcbiAgQUJJTElUWV9DQU1FUkEsXG4gIEFCSUxJVFlfT1BFUkFURSxcbiAgQUJJTElUWV9LRVlfTU9WRSxcbiAgQUJJTElUWV9IRUFMVEgsXG4gIEFCSUxJVFlfQ0FSUlksXG4gIEFCSUxJVFlfTEVBUk4sXG4gIEFCSUxJVFlfUExBQ0UsXG4gIEFCSUxJVFlfS0VZX1BMQUNFLFxuICBBQklMSVRZX0tFWV9GSVJFLFxuICBBQklMSVRZX1JPVEFURVxuXVxuXG4vLyBvYmplY3QgdHlwZSwgc3RhdGljIG9iamVjdCwgbm90IGNvbGxpZGUgd2l0aFxuZXhwb3J0IGNvbnN0IFNUQVRJQyA9ICdzdGF0aWMnXG4vLyBjb2xsaWRlIHdpdGhcbmV4cG9ydCBjb25zdCBTVEFZID0gJ3N0YXknXG4vLyB0b3VjaCB3aWxsIHJlcGx5XG5leHBvcnQgY29uc3QgUkVQTFkgPSAncmVwbHknXG4iLCJleHBvcnQgY29uc3QgTEVGVCA9ICdhJ1xuZXhwb3J0IGNvbnN0IFVQID0gJ3cnXG5leHBvcnQgY29uc3QgUklHSFQgPSAnZCdcbmV4cG9ydCBjb25zdCBET1dOID0gJ3MnXG5leHBvcnQgY29uc3QgUExBQ0UxID0gJzEnXG5leHBvcnQgY29uc3QgUExBQ0UyID0gJzInXG5leHBvcnQgY29uc3QgUExBQ0UzID0gJzMnXG5leHBvcnQgY29uc3QgUExBQ0U0ID0gJzQnXG5leHBvcnQgY29uc3QgRklSRSA9ICdmJ1xuIiwiaW1wb3J0IHsgQXBwbGljYXRpb24gYXMgUGl4aUFwcGxpY2F0aW9uLCBHcmFwaGljcywgZGlzcGxheSB9IGZyb20gJy4vUElYSSdcbmltcG9ydCBnbG9iYWxFdmVudE1hbmFnZXIgZnJvbSAnLi9nbG9iYWxFdmVudE1hbmFnZXInXG5cbmxldCBhcHBcblxuY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBQaXhpQXBwbGljYXRpb24ge1xuICBjb25zdHJ1Y3RvciAoLi4uYXJncykge1xuICAgIHN1cGVyKC4uLmFyZ3MpXG4gICAgYXBwID0gdGhpc1xuICB9XG5cbiAgLy8gb25seSBvbmUgaW5zdGFuY2UgZm9yIG5vd1xuICBzdGF0aWMgZ2V0QXBwICgpIHtcbiAgICByZXR1cm4gYXBwXG4gIH1cblxuICBjaGFuZ2VTdGFnZSAoKSB7XG4gICAgdGhpcy5zdGFnZSA9IG5ldyBkaXNwbGF5LlN0YWdlKClcbiAgfVxuXG4gIGNoYW5nZVNjZW5lIChTY2VuZU5hbWUsIHBhcmFtcykge1xuICAgIGlmICh0aGlzLmN1cnJlbnRTY2VuZSkge1xuICAgICAgLy8gbWF5YmUgdXNlIHByb21pc2UgZm9yIGFuaW1hdGlvblxuICAgICAgLy8gcmVtb3ZlIGdhbWVsb29wP1xuICAgICAgdGhpcy5jdXJyZW50U2NlbmUuZGVzdHJveSgpXG4gICAgICB0aGlzLnN0YWdlLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudFNjZW5lKVxuICAgIH1cblxuICAgIGxldCBzY2VuZSA9IG5ldyBTY2VuZU5hbWUocGFyYW1zKVxuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoc2NlbmUpXG4gICAgc2NlbmUuY3JlYXRlKClcbiAgICBzY2VuZS5vbignY2hhbmdlU2NlbmUnLCB0aGlzLmNoYW5nZVNjZW5lLmJpbmQodGhpcykpXG5cbiAgICB0aGlzLmN1cnJlbnRTY2VuZSA9IHNjZW5lXG4gIH1cblxuICBzdGFydCAoLi4uYXJncykge1xuICAgIHN1cGVyLnN0YXJ0KC4uLmFyZ3MpXG5cbiAgICAvLyBjcmVhdGUgYSBiYWNrZ3JvdW5kIG1ha2Ugc3RhZ2UgaGFzIHdpZHRoICYgaGVpZ2h0XG4gICAgbGV0IHZpZXcgPSB0aGlzLnJlbmRlcmVyLnZpZXdcbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKFxuICAgICAgbmV3IEdyYXBoaWNzKCkuZHJhd1JlY3QoMCwgMCwgdmlldy53aWR0aCwgdmlldy5oZWlnaHQpXG4gICAgKVxuXG4gICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLnNldEludGVyYWN0aW9uKHRoaXMucmVuZGVyZXIucGx1Z2lucy5pbnRlcmFjdGlvbilcblxuICAgIC8vIFN0YXJ0IHRoZSBnYW1lIGxvb3BcbiAgICB0aGlzLnRpY2tlci5hZGQoZGVsdGEgPT4gdGhpcy5nYW1lTG9vcC5iaW5kKHRoaXMpKGRlbHRhKSlcbiAgfVxuXG4gIGdhbWVMb29wIChkZWx0YSkge1xuICAgIC8vIFVwZGF0ZSB0aGUgY3VycmVudCBnYW1lIHN0YXRlOlxuICAgIHRoaXMuY3VycmVudFNjZW5lLnRpY2soZGVsdGEpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwbGljYXRpb25cbiIsImltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuY29uc3QgbyA9IHtcclxuICBnZXQgKHRhcmdldCwgcHJvcGVydHkpIHtcclxuICAgIC8vIGhhcyBTVEFZIG9iamVjdCB3aWxsIHJldHVybiAxLCBvdGhlcndpc2UgMFxyXG4gICAgaWYgKHByb3BlcnR5ID09PSAnd2VpZ2h0Jykge1xyXG4gICAgICByZXR1cm4gdGFyZ2V0LnNvbWUobyA9PiBvLnR5cGUgPT09IFNUQVkpID8gMSA6IDBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0YXJnZXRbcHJvcGVydHldXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBHYW1lT2JqZWN0cyB7XHJcbiAgY29uc3RydWN0b3IgKC4uLml0ZW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb3h5KFsuLi5pdGVtc10sIG8pXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHYW1lT2JqZWN0c1xyXG4iLCJpbXBvcnQgeyBHcmFwaGljcyB9IGZyb20gJy4vUElYSSdcbmltcG9ydCB7IENFSUxfU0laRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IExJR0hUID0gU3ltYm9sKCdsaWdodCcpXG5cbmNsYXNzIExpZ2h0IHtcbiAgc3RhdGljIGxpZ2h0T24gKHRhcmdldCwgcmFkaXVzLCByYW5kID0gMSkge1xuICAgIGxldCBjb250YWluZXIgPSB0YXJnZXQucGFyZW50XG4gICAgaWYgKCFjb250YWluZXIubGlnaHRpbmcpIHtcbiAgICAgIC8vIGNvbnRhaW5lciBkb2VzIE5PVCBoYXMgbGlnaHRpbmcgcHJvcGVydHlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgbGlnaHRidWxiID0gbmV3IEdyYXBoaWNzKClcbiAgICB2YXIgcnIgPSAweGZmXG4gICAgdmFyIHJnID0gMHhmZlxuICAgIHZhciByYiA9IDB4ZmZcbiAgICB2YXIgcmFkID0gcmFkaXVzICogQ0VJTF9TSVpFXG5cbiAgICBsZXQgeCA9IHRhcmdldC53aWR0aCAvIDIgLyB0YXJnZXQuc2NhbGUueFxuICAgIGxldCB5ID0gdGFyZ2V0LmhlaWdodCAvIDIgLyB0YXJnZXQuc2NhbGUueVxuICAgIGxpZ2h0YnVsYi5iZWdpbkZpbGwoKHJyIDw8IDE2KSArIChyZyA8PCA4KSArIHJiLCAxLjApXG4gICAgbGlnaHRidWxiLmRyYXdDaXJjbGUoeCwgeSwgcmFkKVxuICAgIGxpZ2h0YnVsYi5lbmRGaWxsKClcbiAgICBsaWdodGJ1bGIucGFyZW50TGF5ZXIgPSBjb250YWluZXIubGlnaHRpbmcgLy8gbXVzdCBoYXMgcHJvcGVydHk6IGxpZ2h0aW5nXG5cbiAgICB0YXJnZXRbTElHSFRdID0ge1xuICAgICAgbGlnaHQ6IGxpZ2h0YnVsYlxuICAgIH1cbiAgICB0YXJnZXQuYWRkQ2hpbGQobGlnaHRidWxiKVxuXG4gICAgaWYgKHJhbmQgIT09IDEpIHtcbiAgICAgIGxldCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IGRTY2FsZSA9IE1hdGgucmFuZG9tKCkgKiAoMSAtIHJhbmQpXG4gICAgICAgIGlmIChsaWdodGJ1bGIuc2NhbGUueCA+IDEpIHtcbiAgICAgICAgICBkU2NhbGUgPSAtZFNjYWxlXG4gICAgICAgIH1cbiAgICAgICAgbGlnaHRidWxiLnNjYWxlLnggKz0gZFNjYWxlXG4gICAgICAgIGxpZ2h0YnVsYi5zY2FsZS55ICs9IGRTY2FsZVxuICAgICAgICBsaWdodGJ1bGIuYWxwaGEgKz0gZFNjYWxlXG4gICAgICB9LCAxMDAwIC8gMTIpXG4gICAgICB0YXJnZXRbTElHSFRdLmludGVydmFsID0gaW50ZXJ2YWxcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgbGlnaHRPZmYgKHRhcmdldCkge1xuICAgIGlmICghdGFyZ2V0W0xJR0hUXSkge1xuICAgICAgLy8gbm8gbGlnaHQgdG8gcmVtb3ZlXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy8gcmVtb3ZlIGxpZ2h0XG4gICAgdGFyZ2V0LnJlbW92ZUNoaWxkKHRhcmdldFtMSUdIVF0ubGlnaHQpXG4gICAgLy8gcmVtb3ZlIGludGVydmFsXG4gICAgY2xlYXJJbnRlcnZhbCh0YXJnZXRbTElHSFRdLmludGVydmFsKVxuICAgIGRlbGV0ZSB0YXJnZXRbTElHSFRdXG4gICAgLy8gcmVtb3ZlIGxpc3RlbmVyXG4gICAgdGFyZ2V0Lm9mZigncmVtb3ZlZCcsIExpZ2h0LmxpZ2h0T2ZmKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpZ2h0XG4iLCJpbXBvcnQgeyBDb250YWluZXIsIGRpc3BsYXksIEJMRU5EX01PREVTLCBTcHJpdGUgfSBmcm9tICcuL1BJWEknXHJcblxyXG5pbXBvcnQgeyBTVEFZLCBTVEFUSUMsIFJFUExZLCBDRUlMX1NJWkUsIEFCSUxJVFlfTU9WRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCB7IGluc3RhbmNlQnlJdGVtSWQgfSBmcm9tICcuL3V0aWxzJ1xyXG5pbXBvcnQgTWFwR3JhcGggZnJvbSAnLi9NYXBHcmFwaCdcclxuaW1wb3J0IE1hcFdvcmxkIGZyb20gJy4uL2xpYi9NYXBXb3JsZCdcclxuXHJcbmNvbnN0IHBpcGUgPSAoZmlyc3QsIC4uLm1vcmUpID0+XHJcbiAgbW9yZS5yZWR1Y2UoKGFjYywgY3VycikgPT4gKC4uLmFyZ3MpID0+IGN1cnIoYWNjKC4uLmFyZ3MpKSwgZmlyc3QpXHJcblxyXG5jb25zdCBvYmplY3RFdmVudCA9IHtcclxuICBwbGFjZSAob2JqZWN0LCBwbGFjZWQpIHtcclxuICAgIGxldCBwb3NpdGlvbiA9IG9iamVjdC5wb3NpdGlvblxyXG4gICAgdGhpcy5hZGRHYW1lT2JqZWN0KHBsYWNlZCwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSlcclxuICB9LFxyXG4gIGZpcmUgKG9iamVjdCwgYnVsbGV0KSB7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QoYnVsbGV0KVxyXG4gIH0sXHJcbiAgZGllIChvYmplY3QpIHtcclxuICAgIG9iamVjdC5zYXkoJ1lvdSBkaWUuJylcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBldmVudHM6XHJcbiAqICB1c2U6IG9iamVjdFxyXG4gKi9cclxuY2xhc3MgTWFwIGV4dGVuZHMgQ29udGFpbmVyIHtcclxuICBjb25zdHJ1Y3RvciAoc2NhbGUgPSAxKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmNlaWxTaXplID0gc2NhbGUgKiBDRUlMX1NJWkVcclxuICAgIHRoaXMubWFwU2NhbGUgPSBzY2FsZVxyXG5cclxuICAgIHRoaXMub2JqZWN0cyA9IHtcclxuICAgICAgW1NUQVRJQ106IFtdLFxyXG4gICAgICBbU1RBWV06IFtdLFxyXG4gICAgICBbUkVQTFldOiBbXVxyXG4gICAgfVxyXG4gICAgdGhpcy5tYXAgPSBuZXcgQ29udGFpbmVyKClcclxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5tYXApXHJcblxyXG4gICAgLy8gcGxheWVyIGdyb3VwXHJcbiAgICB0aGlzLnBsYXllckdyb3VwID0gbmV3IGRpc3BsYXkuR3JvdXAoKVxyXG4gICAgbGV0IHBsYXllckxheWVyID0gbmV3IGRpc3BsYXkuTGF5ZXIodGhpcy5wbGF5ZXJHcm91cClcclxuICAgIHRoaXMuYWRkQ2hpbGQocGxheWVyTGF5ZXIpXHJcbiAgICB0aGlzLm1hcEdyYXBoID0gbmV3IE1hcEdyYXBoKClcclxuXHJcbiAgICAvLyBwaHlzaWNcclxuICAgIHRoaXMubWFwV29ybGQgPSBuZXcgTWFwV29ybGQoKVxyXG4gIH1cclxuXHJcbiAgZW5hYmxlRm9nICgpIHtcclxuICAgIGxldCBsaWdodGluZyA9IG5ldyBkaXNwbGF5LkxheWVyKClcclxuICAgIGxpZ2h0aW5nLm9uKCdkaXNwbGF5JywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgZWxlbWVudC5ibGVuZE1vZGUgPSBCTEVORF9NT0RFUy5BRERcclxuICAgIH0pXHJcbiAgICBsaWdodGluZy51c2VSZW5kZXJUZXh0dXJlID0gdHJ1ZVxyXG4gICAgbGlnaHRpbmcuY2xlYXJDb2xvciA9IFswLCAwLCAwLCAxXSAvLyBhbWJpZW50IGdyYXlcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nKVxyXG5cclxuICAgIHZhciBsaWdodGluZ1Nwcml0ZSA9IG5ldyBTcHJpdGUobGlnaHRpbmcuZ2V0UmVuZGVyVGV4dHVyZSgpKVxyXG4gICAgbGlnaHRpbmdTcHJpdGUuYmxlbmRNb2RlID0gQkxFTkRfTU9ERVMuTVVMVElQTFlcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKGxpZ2h0aW5nU3ByaXRlKVxyXG5cclxuICAgIHRoaXMubWFwLmxpZ2h0aW5nID0gbGlnaHRpbmdcclxuICB9XHJcblxyXG4gIC8vIOa2iOmZpOi/t+mcp1xyXG4gIGRpc2FibGVGb2cgKCkge1xyXG4gICAgdGhpcy5saWdodGluZy5jbGVhckNvbG9yID0gWzEsIDEsIDEsIDFdXHJcbiAgfVxyXG5cclxuICBsb2FkIChtYXBEYXRhKSB7XHJcbiAgICBsZXQgdGlsZXMgPSBtYXBEYXRhLnRpbGVzXHJcbiAgICBsZXQgY29scyA9IG1hcERhdGEuY29sc1xyXG4gICAgbGV0IHJvd3MgPSBtYXBEYXRhLnJvd3NcclxuICAgIGxldCBpdGVtcyA9IG1hcERhdGEuaXRlbXNcclxuXHJcbiAgICBsZXQgY2VpbFNpemUgPSB0aGlzLmNlaWxTaXplXHJcblxyXG4gICAgaWYgKG1hcERhdGEuaGFzRm9nKSB7XHJcbiAgICAgIHRoaXMuZW5hYmxlRm9nKClcclxuICAgIH1cclxuICAgIGxldCBtYXBHcmFwaCA9IHRoaXMubWFwR3JhcGhcclxuXHJcbiAgICBsZXQgYWRkR2FtZU9iamVjdCA9IChpLCBqLCBpZCwgcGFyYW1zKSA9PiB7XHJcbiAgICAgIGxldCBvID0gaW5zdGFuY2VCeUl0ZW1JZChpZCwgcGFyYW1zKVxyXG4gICAgICB0aGlzLmFkZEdhbWVPYmplY3QobywgaSAqIGNlaWxTaXplLCBqICogY2VpbFNpemUpXHJcbiAgICAgIHJldHVybiBbbywgaSwgal1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgYWRkR3JhcGggPSAoW28sIGksIGpdKSA9PiBtYXBHcmFwaC5hZGRPYmplY3QobywgaSwgailcclxuXHJcbiAgICBsZXQgcmVnaXN0ZXJPbiA9IChbbywgaSwgal0pID0+IHtcclxuICAgICAgby5vbigndXNlJywgKCkgPT4gdGhpcy5lbWl0KCd1c2UnLCBvKSlcclxuICAgICAgby5vbignZmlyZScsIG9iamVjdEV2ZW50LmZpcmUuYmluZCh0aGlzLCBvKSlcclxuICAgICAgLy8gVE9ETzogcmVtb3ZlIG1hcCBpdGVtXHJcbiAgICAgIC8vIGRlbGV0ZSBpdGVtc1tpXVxyXG4gICAgICByZXR1cm4gW28sIGksIGpdXHJcbiAgICB9XHJcblxyXG4gICAgbWFwR3JhcGguYmVnaW5VcGRhdGUoKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sczsgaSsrKSB7XHJcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm93czsgaisrKSB7XHJcbiAgICAgICAgcGlwZShhZGRHYW1lT2JqZWN0LCByZWdpc3Rlck9uLCBhZGRHcmFwaCkoaSwgaiwgdGlsZXNbaiAqIGNvbHMgKyBpXSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgbGV0IFsgaWQsIFtpLCBqXSwgcGFyYW1zIF0gPSBpdGVtXHJcbiAgICAgIHBpcGUoYWRkR2FtZU9iamVjdCwgcmVnaXN0ZXJPbiwgYWRkR3JhcGgpKGksIGosIGlkLCBwYXJhbXMpXHJcbiAgICB9KVxyXG5cclxuICAgIG1hcEdyYXBoLmVuZFVwZGF0ZSgpXHJcbiAgfVxyXG5cclxuICBhZGRQbGF5ZXIgKHBsYXllciwgdG9Qb3NpdGlvbikge1xyXG4gICAgLy8g6Ki75YaK5LqL5Lu2XHJcbiAgICBPYmplY3QuZW50cmllcyhvYmplY3RFdmVudCkuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcclxuICAgICAgbGV0IGVJbnN0YW5jZSA9IGhhbmRsZXIuYmluZCh0aGlzLCBwbGF5ZXIpXHJcbiAgICAgIHBsYXllci5vbihldmVudE5hbWUsIGVJbnN0YW5jZSlcclxuICAgICAgcGxheWVyLm9uY2UoJ3JlbW92ZWQnLCBwbGF5ZXIub2ZmLmJpbmQocGxheWVyLCBldmVudE5hbWUsIGVJbnN0YW5jZSkpXHJcbiAgICB9KVxyXG4gICAgLy8g5paw5aKe6Iez5Zyw5ZyW5LiKXHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QoXHJcbiAgICAgIHBsYXllcixcclxuICAgICAgdG9Qb3NpdGlvblswXSAqIHRoaXMuY2VpbFNpemUsXHJcbiAgICAgIHRvUG9zaXRpb25bMV0gKiB0aGlzLmNlaWxTaXplKVxyXG5cclxuICAgIC8vIHBsYXllciDnva7poILpoa/npLpcclxuICAgIHBsYXllci5wYXJlbnRHcm91cCA9IHRoaXMucGxheWVyR3JvdXBcclxuXHJcbiAgICAvLyDoh6rli5Xmib7ot69cclxuICAgIC8vIGxldCBtb3ZlQWJpbGl0eSA9IHBsYXllcltBQklMSVRZX01PVkVdXHJcbiAgICAvLyBpZiAobW92ZUFiaWxpdHkpIHtcclxuICAgIC8vICAgbGV0IHBvaW50cyA9IFsnNCwxJywgJzQsNCcsICcxMSwxJywgJzYsMTAnXVxyXG4gICAgLy8gICBwb2ludHMucmVkdWNlKChhY2MsIGN1cikgPT4ge1xyXG4gICAgLy8gICAgIGxldCBwYXRoID0gdGhpcy5tYXBHcmFwaC5maW5kKGFjYywgY3VyKS5tYXAobm9kZSA9PiB7XHJcbiAgICAvLyAgICAgICBsZXQgW2ksIGpdID0gbm9kZS5pZC5zcGxpdCgnLCcpXHJcbiAgICAvLyAgICAgICByZXR1cm4ge3g6IGkgKiB0aGlzLmNlaWxTaXplLCB5OiBqICogdGhpcy5jZWlsU2l6ZX1cclxuICAgIC8vICAgICB9KVxyXG4gICAgLy8gICAgIG1vdmVBYmlsaXR5LmFkZFBhdGgocGF0aClcclxuICAgIC8vICAgICByZXR1cm4gY3VyXHJcbiAgICAvLyAgIH0pXHJcbiAgICAvLyB9XHJcbiAgfVxyXG5cclxuICB0aWNrIChkZWx0YSkge1xyXG4gIH1cclxuXHJcbiAgYWRkR2FtZU9iamVjdCAobywgeCA9IHVuZGVmaW5lZCwgeSA9IHVuZGVmaW5lZCkge1xyXG4gICAgbGV0IG1hcFNjYWxlID0gdGhpcy5tYXBTY2FsZVxyXG4gICAgaWYgKHggIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBvLnBvc2l0aW9uLnNldCh4LCB5KVxyXG4gICAgfVxyXG4gICAgby5zY2FsZS5zZXQobWFwU2NhbGUsIG1hcFNjYWxlKVxyXG4gICAgby5hbmNob3Iuc2V0KDAuNSwgMC41KVxyXG5cclxuICAgIGxldCBvQXJyYXkgPSB0aGlzLm9iamVjdHNbby50eXBlXVxyXG4gICAgb0FycmF5LnB1c2gobylcclxuICAgIG8ub25jZSgncmVtb3ZlZCcsICgpID0+IHtcclxuICAgICAgbGV0IGlueCA9IG9BcnJheS5pbmRleE9mKG8pXHJcbiAgICAgIG9BcnJheS5zcGxpY2UoaW54LCAxKVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBhZGQgdG8gd29ybGRcclxuICAgIHRoaXMubWFwV29ybGQuYWRkKG8pXHJcbiAgICB0aGlzLm1hcC5hZGRDaGlsZChvKVxyXG4gIH1cclxuXHJcbiAgLy8gZm9nIOeahCBwYXJlbnQgY29udGFpbmVyIOS4jeiDveiiq+enu+WLlSjmnIPpjK/kvY0p77yM5Zug5q2k5pS55oiQ5L+u5pS5IG1hcCDkvY3nva5cclxuICBnZXQgcG9zaXRpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWFwLnBvc2l0aW9uXHJcbiAgfVxyXG5cclxuICBnZXQgeCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXAueFxyXG4gIH1cclxuXHJcbiAgZ2V0IHkgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWFwLnlcclxuICB9XHJcblxyXG4gIHNldCB4ICh4KSB7XHJcbiAgICB0aGlzLm1hcC54ID0geFxyXG4gIH1cclxuXHJcbiAgc2V0IHkgKHkpIHtcclxuICAgIHRoaXMubWFwLnkgPSB5XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXBcclxuIiwiaW1wb3J0IGNyZWF0ZUdyYXBoIGZyb20gJ25ncmFwaC5ncmFwaCdcclxuaW1wb3J0IHBhdGggZnJvbSAnbmdyYXBoLnBhdGgnXHJcbmltcG9ydCBHYW1lT2JqZWN0cyBmcm9tICcuL0dhbWVPYmplY3RzJ1xyXG5cclxuY2xhc3MgTWFwR3JhcGgge1xyXG4gIGNvbnN0cnVjdG9yIChzY2FsZSA9IDEpIHtcclxuICAgIHRoaXMuX2dyYXBoID0gY3JlYXRlR3JhcGgoKVxyXG4gICAgdGhpcy5fZmluZGVyID0gcGF0aC5hU3Rhcih0aGlzLl9ncmFwaCwge1xyXG4gICAgICAvLyBXZSB0ZWxsIG91ciBwYXRoZmluZGVyIHdoYXQgc2hvdWxkIGl0IHVzZSBhcyBhIGRpc3RhbmNlIGZ1bmN0aW9uOlxyXG4gICAgICBkaXN0YW5jZSAoZnJvbU5vZGUsIHRvTm9kZSwgbGluaykge1xyXG4gICAgICAgIHJldHVybiBmcm9tTm9kZS5kYXRhLndlaWdodCArIHRvTm9kZS5kYXRhLndlaWdodCArIDFcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGFkZE9iamVjdCAobywgaSwgaikge1xyXG4gICAgbGV0IGdyYXBoID0gdGhpcy5fZ3JhcGhcclxuXHJcbiAgICBsZXQgc2VsZk5hbWUgPSBbaSwgal0uam9pbignLCcpXHJcbiAgICBsZXQgbm9kZSA9IGdyYXBoLmdldE5vZGUoc2VsZk5hbWUpXHJcbiAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgbm9kZSA9IGdyYXBoLmFkZE5vZGUoc2VsZk5hbWUsIG5ldyBHYW1lT2JqZWN0cyhvKSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5vZGUuZGF0YS5wdXNoKG8pXHJcbiAgICB9XHJcbiAgICBsZXQgbGluayA9IChzZWxmTm9kZSwgb3RoZXJOb2RlKSA9PiB7XHJcbiAgICAgIGlmICghc2VsZk5vZGUgfHwgIW90aGVyTm9kZSB8fCBncmFwaC5nZXRMaW5rKHNlbGZOb2RlLmlkLCBvdGhlck5vZGUuaWQpKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgbGV0IHdlaWdodCA9IHNlbGZOb2RlLmRhdGEud2VpZ2h0ICsgb3RoZXJOb2RlLmRhdGEud2VpZ2h0XHJcbiAgICAgIGlmICh3ZWlnaHQgPT09IDApIHtcclxuICAgICAgICBncmFwaC5hZGRMaW5rKHNlbGZOb2RlLmlkLCBvdGhlck5vZGUuaWQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChub2RlLmRhdGEud2VpZ2h0ICE9PSAwKSB7XHJcbiAgICAgIC8vIOatpOm7nuS4jemAmu+8jOenu+mZpOaJgOaciemAo+e1kFxyXG4gICAgICBncmFwaC5mb3JFYWNoTGlua2VkTm9kZShzZWxmTmFtZSwgZnVuY3Rpb24gKGxpbmtlZE5vZGUsIGxpbmspIHtcclxuICAgICAgICBncmFwaC5yZW1vdmVMaW5rKGxpbmspXHJcbiAgICAgIH0pXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgbGluayhub2RlLCBncmFwaC5nZXROb2RlKFtpIC0gMSwgal0uam9pbignLCcpKSlcclxuICAgIGxpbmsobm9kZSwgZ3JhcGguZ2V0Tm9kZShbaSwgaiAtIDFdLmpvaW4oJywnKSkpXHJcbiAgICBsaW5rKGdyYXBoLmdldE5vZGUoW2kgKyAxLCBqXS5qb2luKCcsJykpLCBub2RlKVxyXG4gICAgbGluayhncmFwaC5nZXROb2RlKFtpLCBqICsgMV0uam9pbignLCcpKSwgbm9kZSlcclxuICB9XHJcblxyXG4gIGZpbmQgKGZyb20sIHRvKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZmluZGVyLmZpbmQoZnJvbSwgdG8pXHJcbiAgfVxyXG5cclxuICBiZWdpblVwZGF0ZSAoKSB7XHJcbiAgICB0aGlzLl9ncmFwaC5iZWdpblVwZGF0ZSgpXHJcbiAgfVxyXG5cclxuICBlbmRVcGRhdGUgKCkge1xyXG4gICAgdGhpcy5fZ3JhcGguZW5kVXBkYXRlKClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hcEdyYXBoXHJcbiIsImltcG9ydCB7IEVuZ2luZSwgRXZlbnRzLCBXb3JsZCB9IGZyb20gJy4vTWF0dGVyJ1xuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxubGV0IFBBUkVOVCA9IFN5bWJvbCgncGFyZW50JylcblxuY2xhc3MgTWFwV29ybGQge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gcGh5c2ljXG4gICAgbGV0IGVuZ2luZSA9IEVuZ2luZS5jcmVhdGUoKVxuICAgIEV2ZW50cy5vbihlbmdpbmUsICdjb2xsaXNpb25TdGFydCcsIGV2ZW50ID0+IHtcbiAgICAgIHZhciBwYWlycyA9IGV2ZW50LnBhaXJzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBwYWlyID0gcGFpcnNbaV1cbiAgICAgICAgbGV0IG8xID0gcGFpci5ib2R5QVtQQVJFTlRdXG4gICAgICAgIGxldCBvMiA9IHBhaXIuYm9keUJbUEFSRU5UXVxuICAgICAgICBvMS5lbWl0KCdjb2xsaWRlJywgbzIpXG4gICAgICAgIG8yLmVtaXQoJ2NvbGxpZGUnLCBvMSlcbiAgICAgIH1cbiAgICB9KVxuICAgIEVuZ2luZS5ydW4oZW5naW5lKVxuXG4gICAgbGV0IHdvcmxkID0gZW5naW5lLndvcmxkXG4gICAgd29ybGQuZ3Jhdml0eS55ID0gMFxuXG4gICAgdGhpcy53b3JsZCA9IHdvcmxkXG4gIH1cblxuICBhZGQgKG8pIHtcbiAgICBpZiAoby50eXBlID09PSBTVEFUSUMpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBvLmFkZEJvZHkoKVxuICAgIGxldCBib2R5ID0gby5ib2R5XG4gICAgby5vbmNlKCdyZW1vdmVkJywgKCkgPT4ge1xuICAgICAgV29ybGQucmVtb3ZlKHRoaXMud29ybGQsIGJvZHkpXG4gICAgfSlcbiAgICBib2R5W1BBUkVOVF0gPSBvXG4gICAgV29ybGQuYWRkKHRoaXMud29ybGQsIGJvZHkpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFwV29ybGRcbiIsIi8qIGdsb2JhbCBNYXR0ZXIgKi9cbmV4cG9ydCBjb25zdCBFbmdpbmUgPSBNYXR0ZXIuRW5naW5lXG5leHBvcnQgY29uc3QgUmVuZGVyID0gTWF0dGVyLlJlbmRlclxuZXhwb3J0IGNvbnN0IFdvcmxkID0gTWF0dGVyLldvcmxkXG5leHBvcnQgY29uc3QgQm9kaWVzID0gTWF0dGVyLkJvZGllc1xuZXhwb3J0IGNvbnN0IEV2ZW50cyA9IE1hdHRlci5FdmVudHNcbmV4cG9ydCBjb25zdCBCb2R5ID0gTWF0dGVyLkJvZHlcbmV4cG9ydCBjb25zdCBWZWN0b3IgPSBNYXR0ZXIuVmVjdG9yXG4iLCJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cydcblxuY29uc3QgTUFYX01FU1NBR0VfQ09VTlQgPSA1MDBcblxuY2xhc3MgTWVzc2FnZXMgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuX21lc3NhZ2VzID0gW11cbiAgfVxuXG4gIGdldCBsaXN0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXNcbiAgfVxuXG4gIGFkZCAobXNnKSB7XG4gICAgbGV0IGxlbmd0aCA9IHRoaXMuX21lc3NhZ2VzLnVuc2hpZnQobXNnKVxuICAgIGlmIChsZW5ndGggPiBNQVhfTUVTU0FHRV9DT1VOVCkge1xuICAgICAgdGhpcy5fbWVzc2FnZXMucG9wKClcbiAgICB9XG4gICAgdGhpcy5lbWl0KCdtb2RpZmllZCcpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1lc3NhZ2VzKClcbiIsIi8qIGdsb2JhbCBQSVhJICovXG5cbmV4cG9ydCBjb25zdCBBcHBsaWNhdGlvbiA9IFBJWEkuQXBwbGljYXRpb25cbmV4cG9ydCBjb25zdCBDb250YWluZXIgPSBQSVhJLkNvbnRhaW5lclxuZXhwb3J0IGNvbnN0IGxvYWRlciA9IFBJWEkubG9hZGVyXG5leHBvcnQgY29uc3QgcmVzb3VyY2VzID0gUElYSS5sb2FkZXIucmVzb3VyY2VzXG5leHBvcnQgY29uc3QgU3ByaXRlID0gUElYSS5TcHJpdGVcbmV4cG9ydCBjb25zdCBUZXh0ID0gUElYSS5UZXh0XG5leHBvcnQgY29uc3QgVGV4dFN0eWxlID0gUElYSS5UZXh0U3R5bGVcblxuZXhwb3J0IGNvbnN0IEdyYXBoaWNzID0gUElYSS5HcmFwaGljc1xuZXhwb3J0IGNvbnN0IEJMRU5EX01PREVTID0gUElYSS5CTEVORF9NT0RFU1xuZXhwb3J0IGNvbnN0IGRpc3BsYXkgPSBQSVhJLmRpc3BsYXlcbmV4cG9ydCBjb25zdCB1dGlscyA9IFBJWEkudXRpbHNcbmV4cG9ydCBjb25zdCBPYnNlcnZhYmxlUG9pbnQgPSBQSVhJLk9ic2VydmFibGVQb2ludFxuIiwiaW1wb3J0IHsgZGlzcGxheSB9IGZyb20gJy4vUElYSSdcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBkaXNwbGF5LkxheWVyIHtcbiAgY3JlYXRlICgpIHt9XG5cbiAgZGVzdHJveSAoKSB7fVxuXG4gIHRpY2sgKGRlbHRhKSB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTY2VuZVxuIiwiaW1wb3J0IHsgcmVzb3VyY2VzIH0gZnJvbSAnLi4vbGliL1BJWEknXG5cbmNvbnN0IFRleHR1cmUgPSB7XG4gIGdldCBUZXJyYWluQXRsYXMgKCkge1xuICAgIHJldHVybiByZXNvdXJjZXNbJ2ltYWdlcy90ZXJyYWluX2F0bGFzLmpzb24nXVxuICB9LFxuICBnZXQgQmFzZU91dEF0bGFzICgpIHtcbiAgICByZXR1cm4gcmVzb3VyY2VzWydpbWFnZXMvYmFzZV9vdXRfYXRsYXMuanNvbiddXG4gIH0sXG5cbiAgZ2V0IEFpciAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydlbXB0eS5wbmcnXVxuICB9LFxuICBnZXQgR3Jhc3MgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1snZ3Jhc3MucG5nJ11cbiAgfSxcbiAgZ2V0IEdyb3VuZCAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydicmljay10aWxlLnBuZyddXG4gIH0sXG5cbiAgZ2V0IFdhbGwgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1snd2FsbC5wbmcnXVxuICB9LFxuICBnZXQgSXJvbkZlbmNlICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ2lyb24tZmVuY2UucG5nJ11cbiAgfSxcbiAgZ2V0IFJvb3QgKCkge1xuICAgIHJldHVybiBUZXh0dXJlLlRlcnJhaW5BdGxhcy50ZXh0dXJlc1sncm9vdC5wbmcnXVxuICB9LFxuICBnZXQgVHJlZSAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWyd0cmVlLnBuZyddXG4gIH0sXG5cbiAgZ2V0IFRyZWFzdXJlICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ3RyZWFzdXJlLnBuZyddXG4gIH0sXG4gIGdldCBEb29yICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ2lyb24tZmVuY2UucG5nJ11cbiAgfSxcbiAgZ2V0IFRvcmNoICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5CYXNlT3V0QXRsYXMudGV4dHVyZXNbJ3RvcmNoLnBuZyddXG4gIH0sXG4gIGdldCBHcmFzc0RlY29yYXRlMSAoKSB7XG4gICAgcmV0dXJuIFRleHR1cmUuVGVycmFpbkF0bGFzLnRleHR1cmVzWydncmFzcy1kZWNvcmF0ZS0xLnBuZyddXG4gIH0sXG4gIGdldCBCdWxsZXQgKCkge1xuICAgIHJldHVybiByZXNvdXJjZXNbJ2ltYWdlcy9maXJlX2JvbHQucG5nJ10udGV4dHVyZVxuICB9LFxuXG4gIGdldCBSb2NrICgpIHtcbiAgICByZXR1cm4gVGV4dHVyZS5UZXJyYWluQXRsYXMudGV4dHVyZXNbJ3JvY2sucG5nJ11cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlXG4iLCJjb25zdCBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSVxuXG5jbGFzcyBWZWN0b3Ige1xuICBjb25zdHJ1Y3RvciAoeCwgeSkge1xuICAgIHRoaXMueCA9IHhcbiAgICB0aGlzLnkgPSB5XG4gIH1cblxuICBzdGF0aWMgZnJvbVBvaW50IChwKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IocC54LCBwLnkpXG4gIH1cblxuICBzdGF0aWMgZnJvbVJhZExlbmd0aCAocmFkLCBsZW5ndGgpIHtcbiAgICBsZXQgeCA9IGxlbmd0aCAqIE1hdGguY29zKHJhZClcbiAgICBsZXQgeSA9IGxlbmd0aCAqIE1hdGguc2luKHJhZClcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih4LCB5KVxuICB9XG5cbiAgY2xvbmUgKCkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCwgdGhpcy55KVxuICB9XG5cbiAgYWRkICh2KSB7XG4gICAgdGhpcy54ICs9IHYueFxuICAgIHRoaXMueSArPSB2LnlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3ViICh2KSB7XG4gICAgdGhpcy54IC09IHYueFxuICAgIHRoaXMueSAtPSB2LnlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgaW52ZXJ0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhcigtMSlcbiAgfVxuXG4gIG11bHRpcGx5U2NhbGFyIChzKSB7XG4gICAgdGhpcy54ICo9IHNcbiAgICB0aGlzLnkgKj0gc1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkaXZpZGVTY2FsYXIgKHMpIHtcbiAgICBpZiAocyA9PT0gMCkge1xuICAgICAgdGhpcy54ID0gMFxuICAgICAgdGhpcy55ID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhcigxIC8gcylcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRvdCAodikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnlcbiAgfVxuXG4gIGdldCBsZW5ndGggKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KVxuICB9XG5cbiAgbGVuZ3RoU3EgKCkge1xuICAgIHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnlcbiAgfVxuXG4gIG5vcm1hbGl6ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2aWRlU2NhbGFyKHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgZGlzdGFuY2VUbyAodikge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0YW5jZVRvU3EodikpXG4gIH1cblxuICBkaXN0YW5jZVRvU3EgKHYpIHtcbiAgICBsZXQgZHggPSB0aGlzLnggLSB2LnhcbiAgICBsZXQgZHkgPSB0aGlzLnkgLSB2LnlcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHlcbiAgfVxuXG4gIHNldCAoeCwgeSkge1xuICAgIHRoaXMueCA9IHhcbiAgICB0aGlzLnkgPSB5XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFggKHgpIHtcbiAgICB0aGlzLnggPSB4XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFkgKHkpIHtcbiAgICB0aGlzLnkgPSB5XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldExlbmd0aCAobCkge1xuICAgIHZhciBvbGRMZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIGlmIChvbGRMZW5ndGggIT09IDAgJiYgbCAhPT0gb2xkTGVuZ3RoKSB7XG4gICAgICB0aGlzLm11bHRpcGx5U2NhbGFyKGwgLyBvbGRMZW5ndGgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBsZXJwICh2LCBhbHBoYSkge1xuICAgIHRoaXMueCArPSAodi54IC0gdGhpcy54KSAqIGFscGhhXG4gICAgdGhpcy55ICs9ICh2LnkgLSB0aGlzLnkpICogYWxwaGFcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0IHJhZCAoKSB7XG4gICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpXG4gIH1cblxuICBnZXQgZGVnICgpIHtcbiAgICByZXR1cm4gdGhpcy5yYWQgKiBkZWdyZWVzXG4gIH1cblxuICBlcXVhbHMgKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSB2LnggJiYgdGhpcy55ID09PSB2LnlcbiAgfVxuXG4gIHJvdGF0ZSAodGhldGEpIHtcbiAgICB2YXIgeHRlbXAgPSB0aGlzLnhcbiAgICB0aGlzLnggPSB0aGlzLnggKiBNYXRoLmNvcyh0aGV0YSkgLSB0aGlzLnkgKiBNYXRoLnNpbih0aGV0YSlcbiAgICB0aGlzLnkgPSB4dGVtcCAqIE1hdGguc2luKHRoZXRhKSArIHRoaXMueSAqIE1hdGguY29zKHRoZXRhKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmVjdG9yXG4iLCJjbGFzcyBHbG9iYWxFdmVudE1hbmFnZXIge1xuICBzZXRJbnRlcmFjdGlvbiAoaW50ZXJhY3Rpb24pIHtcbiAgICB0aGlzLmludGVyYWN0aW9uID0gaW50ZXJhY3Rpb25cbiAgfVxuXG4gIG9uIChldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmludGVyYWN0aW9uLm9uKGV2ZW50TmFtZSwgaGFuZGxlcilcbiAgfVxuXG4gIG9mZiAoZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5pbnRlcmFjdGlvbi5vZmYoZXZlbnROYW1lLCBoYW5kbGVyKVxuICB9XG5cbiAgZW1pdCAoZXZlbnROYW1lLCAuLi5hcmdzKSB7XG4gICAgdGhpcy5pbnRlcmFjdGlvbi5lbWl0KGV2ZW50TmFtZSwgLi4uYXJncylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgR2xvYmFsRXZlbnRNYW5hZ2VyKClcbiIsImltcG9ydCBXYWxsIGZyb20gJy4uL29iamVjdHMvV2FsbCdcclxuaW1wb3J0IEFpciBmcm9tICcuLi9vYmplY3RzL0FpcidcclxuaW1wb3J0IEdyYXNzIGZyb20gJy4uL29iamVjdHMvR3Jhc3MnXHJcbmltcG9ydCBUcmVhc3VyZSBmcm9tICcuLi9vYmplY3RzL1RyZWFzdXJlJ1xyXG5pbXBvcnQgRG9vciBmcm9tICcuLi9vYmplY3RzL0Rvb3InXHJcbmltcG9ydCBUb3JjaCBmcm9tICcuLi9vYmplY3RzL1RvcmNoJ1xyXG5pbXBvcnQgR3JvdW5kIGZyb20gJy4uL29iamVjdHMvR3JvdW5kJ1xyXG5pbXBvcnQgSXJvbkZlbmNlIGZyb20gJy4uL29iamVjdHMvSXJvbkZlbmNlJ1xyXG5pbXBvcnQgUm9vdCBmcm9tICcuLi9vYmplY3RzL1Jvb3QnXHJcbmltcG9ydCBUcmVlIGZyb20gJy4uL29iamVjdHMvVHJlZSdcclxuaW1wb3J0IEdyYXNzRGVjb3JhdGUxIGZyb20gJy4uL29iamVjdHMvR3Jhc3NEZWNvcmF0ZTEnXHJcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vb2JqZWN0cy9CdWxsZXQnXHJcbmltcG9ydCBXYWxsU2hvb3RCb2x0IGZyb20gJy4uL29iamVjdHMvV2FsbFNob290Qm9sdCdcclxuXHJcbmltcG9ydCBNb3ZlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL01vdmUnXHJcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FtZXJhJ1xyXG5pbXBvcnQgT3BlcmF0ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9PcGVyYXRlJ1xyXG5cclxuLy8gMHgwMDAwIH4gMHgwMDBmXHJcbmNvbnN0IEl0ZW1zU3RhdGljID0gW1xyXG4gIEFpciwgR3Jhc3MsIEdyb3VuZFxyXG5dXHJcbi8vIDB4MDAxMCB+IDB4MDBmZlxyXG5jb25zdCBJdGVtc1N0YXkgPSBbXHJcbiAgLy8gMHgwMDEwLCAweDAwMTEsIDB4MDAxMlxyXG4gIFdhbGwsIElyb25GZW5jZSwgUm9vdCwgVHJlZVxyXG5dXHJcbi8vIDB4MDEwMCB+IDB4MDFmZlxyXG5jb25zdCBJdGVtc090aGVyID0gW1xyXG4gIFRyZWFzdXJlLCBEb29yLCBUb3JjaCwgR3Jhc3NEZWNvcmF0ZTEsIEJ1bGxldCwgV2FsbFNob290Qm9sdFxyXG5dXHJcbi8vIDB4MDIwMCB+IDB4MDJmZlxyXG5jb25zdCBBYmlsaXRpZXMgPSBbXHJcbiAgTW92ZSwgQ2FtZXJhLCBPcGVyYXRlXHJcbl1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnN0YW5jZUJ5SXRlbUlkIChpdGVtSWQsIHBhcmFtcykge1xyXG4gIGxldCBUeXBlc1xyXG4gIGl0ZW1JZCA9IHBhcnNlSW50KGl0ZW1JZCwgMTYpXHJcbiAgaWYgKChpdGVtSWQgJiAweGZmZjApID09PSAwKSB7XHJcbiAgICAvLyDlnLDmnb9cclxuICAgIFR5cGVzID0gSXRlbXNTdGF0aWNcclxuICB9IGVsc2UgaWYgKChpdGVtSWQgJiAweGZmMDApID09PSAwKSB7XHJcbiAgICBUeXBlcyA9IEl0ZW1zU3RheVxyXG4gICAgaXRlbUlkIC09IDB4MDAxMFxyXG4gIH0gZWxzZSBpZiAoKGl0ZW1JZCAmIDB4ZmYwMCkgPj4+IDggPT09IDEpIHtcclxuICAgIFR5cGVzID0gSXRlbXNPdGhlclxyXG4gICAgaXRlbUlkIC09IDB4MDEwMFxyXG4gIH0gZWxzZSB7XHJcbiAgICBUeXBlcyA9IEFiaWxpdGllc1xyXG4gICAgaXRlbUlkIC09IDB4MDIwMFxyXG4gIH1cclxuICByZXR1cm4gbmV3IFR5cGVzW2l0ZW1JZF0ocGFyYW1zKVxyXG59XHJcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBBaXIgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuQWlyKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQWlyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcbmltcG9ydCB7IFJFUExZLCBBQklMSVRZX01PVkUsIEFCSUxJVFlfSEVBTFRIIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuaW1wb3J0IExlYXJuIGZyb20gJy4vYWJpbGl0aWVzL0xlYXJuJ1xuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcbmltcG9ydCBIZWFsdGggZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvSGVhbHRoJ1xuXG5jb25zdCBIZWFsdGhQb2ludCA9IDFcblxuY2xhc3MgQnVsbGV0IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcihUZXh0dXJlLkJ1bGxldClcblxuICAgIG5ldyBMZWFybigpLmNhcnJ5QnkodGhpcylcbiAgICAgIC5sZWFybihuZXcgTW92ZShbMiwgMF0pKVxuICAgICAgLmxlYXJuKG5ldyBIZWFsdGgoSGVhbHRoUG9pbnQpKVxuXG4gICAgdGhpcy5vbignY29sbGlkZScsIHRoaXMuYWN0aW9uV2l0aC5iaW5kKHRoaXMpKVxuICAgIHRoaXMub24oJ2RpZScsIHRoaXMub25EaWUuYmluZCh0aGlzKSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFJFUExZIH1cblxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xuICAgIGlmICh0aGlzLm93bmVyID09PSBvcGVyYXRvciB8fFxuICAgICAgdGhpcy5vd25lciA9PT0gb3BlcmF0b3Iub3duZXIpIHtcbiAgICAgIC8vIOmBv+WFjeiHquauulxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBoZWFsdGhBYmlsaXR5ID0gb3BlcmF0b3JbQUJJTElUWV9IRUFMVEhdXG4gICAgLy8g5YK35a6z5LuW5Lq6XG4gICAgaWYgKGhlYWx0aEFiaWxpdHkpIHtcbiAgICAgIGhlYWx0aEFiaWxpdHkuZ2V0SHVydCh7XG4gICAgICAgIGRhbWFnZTogMVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8g6Ieq5oiR5q+A5ruFXG4gICAgdGhpc1tBQklMSVRZX0hFQUxUSF0uZ2V0SHVydCh7XG4gICAgICBkYW1hZ2U6IEhlYWx0aFBvaW50XG4gICAgfSlcbiAgfVxuXG4gIG9uRGllICgpIHtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKVxuICAgIHRoaXMuZGVzdHJveSgpXG4gIH1cblxuICBzZXRPd25lciAob3duZXIpIHtcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0J1bGxldCdcbiAgfVxuXG4gIHNheSAoKSB7XG4gICAgLy8gc2F5IG5vdGhpbmdcbiAgfVxuXG4gIHNldERpcmVjdGlvbiAodmVjdG9yKSB7XG4gICAgbGV0IG1vdmVBYmlsaXR5ID0gdGhpc1tBQklMSVRZX01PVkVdXG4gICAgaWYgKG1vdmVBYmlsaXR5KSB7XG4gICAgICBtb3ZlQWJpbGl0eS5zZXREaXJlY3Rpb24odmVjdG9yKVxuICAgICAgdGhpcy5yb3RhdGUodmVjdG9yLnJhZClcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQnVsbGV0XG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcbmltcG9ydCB7IFJFUExZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuaW1wb3J0IExlYXJuIGZyb20gJy4vYWJpbGl0aWVzL0xlYXJuJ1xuaW1wb3J0IE1vdmUgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvTW92ZSdcbmltcG9ydCBLZXlNb3ZlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0tleU1vdmUnXG5pbXBvcnQgQ2FtZXJhIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0NhbWVyYSdcbmltcG9ydCBDYXJyeSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9DYXJyeSdcbmltcG9ydCBQbGFjZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9QbGFjZSdcbmltcG9ydCBLZXlQbGFjZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9LZXlQbGFjZSdcbmltcG9ydCBGaXJlIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0ZpcmUnXG5pbXBvcnQgS2V5RmlyZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9LZXlGaXJlJ1xuaW1wb3J0IFJvdGF0ZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9Sb3RhdGUnXG5pbXBvcnQgSGVhbHRoIGZyb20gJy4uL29iamVjdHMvYWJpbGl0aWVzL0hlYWx0aCdcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vb2JqZWN0cy9CdWxsZXQnXG5cbmNsYXNzIENhdCBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoVGV4dHVyZS5Sb2NrKVxuXG4gICAgbGV0IGNhcnJ5ID0gbmV3IENhcnJ5KDMpXG4gICAgbmV3IExlYXJuKCkuY2FycnlCeSh0aGlzKVxuICAgICAgLmxlYXJuKG5ldyBNb3ZlKFsxXSkpXG4gICAgICAubGVhcm4obmV3IEtleU1vdmUoKSlcbiAgICAgIC5sZWFybihuZXcgUGxhY2UoKSlcbiAgICAgIC5sZWFybihuZXcgS2V5UGxhY2UoKSlcbiAgICAgIC5sZWFybihuZXcgQ2FtZXJhKDEpKVxuICAgICAgLmxlYXJuKGNhcnJ5KVxuICAgICAgLmxlYXJuKG5ldyBGaXJlKFszLCAzXSkpXG4gICAgICAubGVhcm4obmV3IFJvdGF0ZSgpKVxuICAgICAgLmxlYXJuKG5ldyBLZXlGaXJlKCkpXG4gICAgICAubGVhcm4obmV3IEhlYWx0aCgxKSlcblxuICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0KClcbiAgICBjYXJyeS50YWtlKGJ1bGxldCwgSW5maW5pdHkpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBSRVBMWSB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAneW91J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhdFxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXHJcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcclxuXHJcbmltcG9ydCB7IFNUQVksIEFCSUxJVFlfT1BFUkFURSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcblxyXG5jbGFzcyBEb29yIGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgY29uc3RydWN0b3IgKG1hcCkge1xyXG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXHJcbiAgICBzdXBlcihUZXh0dXJlLkRvb3IpXHJcblxyXG4gICAgdGhpcy5tYXAgPSBtYXBbMF1cclxuICAgIHRoaXMudG9Qb3NpdGlvbiA9IG1hcFsxXVxyXG5cclxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxyXG5cclxuICBhY3Rpb25XaXRoIChvcGVyYXRvcikge1xyXG4gICAgbGV0IGFiaWxpdHkgPSBvcGVyYXRvcltBQklMSVRZX09QRVJBVEVdXHJcbiAgICBpZiAoYWJpbGl0eSkge1xyXG4gICAgICBhYmlsaXR5KHRoaXMpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvcGVyYXRvci5lbWl0KCdjb2xsaWRlJywgdGhpcylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFtBQklMSVRZX09QRVJBVEVdICgpIHtcclxuICAgIHRoaXMuc2F5KFsnR2V0IGluICcsIHRoaXMubWFwLCAnIG5vdy4nXS5qb2luKCcnKSlcclxuICAgIHRoaXMuZW1pdCgndXNlJylcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnRG9vcidcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERvb3JcclxuIiwiaW1wb3J0IHsgU3ByaXRlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgeyBCb2RpZXMsIEJvZHkgfSBmcm9tICcuLi9saWIvTWF0dGVyJ1xuaW1wb3J0IHsgU1RBWSwgU1RBVElDLCBBQklMSVRZX01PVkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IG1lc3NhZ2VzIGZyb20gJy4uL2xpYi9NZXNzYWdlcydcblxuY2xhc3MgR2FtZU9iamVjdCBleHRlbmRzIFNwcml0ZSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG4gIHNheSAobXNnKSB7XG4gICAgbWVzc2FnZXMuYWRkKG1zZylcbiAgfVxuXG4gIGFkZEJvZHkgKCkge1xuICAgIGlmICh0aGlzLmJvZHkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgbW92ZUFiaWxpdHkgPSB0aGlzW0FCSUxJVFlfTU9WRV1cbiAgICBsZXQgZnJpY3Rpb24gPSAobW92ZUFiaWxpdHkgJiYgbW92ZUFiaWxpdHkuZnJpY3Rpb24gIT09IHVuZGVmaW5lZClcbiAgICAgID8gbW92ZUFiaWxpdHkuZnJpY3Rpb25cbiAgICAgIDogMC4xXG4gICAgbGV0IGZyaWN0aW9uQWlyID0gKG1vdmVBYmlsaXR5ICYmIG1vdmVBYmlsaXR5LmZyaWN0aW9uQWlyICE9PSB1bmRlZmluZWQpXG4gICAgICA/IG1vdmVBYmlsaXR5LmZyaWN0aW9uQWlyXG4gICAgICA6IDAuMDFcbiAgICBsZXQgbWFzcyA9IHRoaXMubWFzcyA/IHRoaXMubWFzcyA6IDFcbiAgICBsZXQgYm9keSA9IEJvZGllcy5yZWN0YW5nbGUodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB7XG4gICAgICBpc1N0YXRpYzogdGhpcy50eXBlID09PSBTVEFZLFxuICAgICAgZnJpY3Rpb25TdGF0aWM6IGZyaWN0aW9uLFxuICAgICAgZnJpY3Rpb25BaXI6IGZyaWN0aW9uQWlyLFxuICAgICAgZnJpY3Rpb24sXG4gICAgICBtYXNzOiBtYXNzXG4gICAgfSlcbiAgICBib2R5LnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblxuICAgIHRoaXMuYm9keSA9IGJvZHlcbiAgfVxuXG4gIHJvdGF0ZSAocmFkLCBkZWx0YSA9IGZhbHNlKSB7XG4gICAgdGhpcy5yb3RhdGlvbiA9IGRlbHRhID8gdGhpcy5yb3RhdGlvbiArIHJhZCA6IHJhZFxuICAgIGlmICh0aGlzLmJvZHkpIHtcbiAgICAgIEJvZHkuc2V0QW5nbGUodGhpcy5ib2R5LCByYWQpXG4gICAgfVxuICB9XG5cbiAgdGljayAoZGVsdGEpIHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVPYmplY3RcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFUSUMgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBHcmFzcyBleHRlbmRzIEdhbWVPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXG4gICAgc3VwZXIoVGV4dHVyZS5HcmFzcylcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyYXNzXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR3Jhc3NEZWNvcmF0ZTEgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFRleHR1cmUuR3Jhc3NEZWNvcmF0ZTEpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFUSUMgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0dyYXNzRGVjb3JhdGUxJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyYXNzRGVjb3JhdGUxXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBVElDIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgR3JvdW5kIGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLkdyb3VuZClcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVRJQyB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnR3JvdW5kJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyb3VuZFxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBJcm9uRmVuY2UgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIHN1cGVyKFRleHR1cmUuSXJvbkZlbmNlKVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IElyb25GZW5jZVxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXG5cbmltcG9ydCB7IFNUQVkgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5jbGFzcyBSb290IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLlJvb3QpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBTVEFZIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm9vdFxuIiwiaW1wb3J0IFRleHR1cmUgZnJvbSAnLi4vbGliL1RleHR1cmUnXHJcbmltcG9ydCBMaWdodCBmcm9tICcuLi9saWIvTGlnaHQnXHJcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcclxuXHJcbmltcG9ydCB7IFNUQVRJQyB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcblxyXG5jbGFzcyBUb3JjaCBleHRlbmRzIEdhbWVPYmplY3Qge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKFRleHR1cmUuVG9yY2gpXHJcblxyXG4gICAgbGV0IHJhZGl1cyA9IDJcclxuXHJcbiAgICB0aGlzLm9uKCdhZGRlZCcsIExpZ2h0LmxpZ2h0T24uYmluZChudWxsLCB0aGlzLCByYWRpdXMsIDAuOTUpKVxyXG4gICAgdGhpcy5vbigncmVtb3ZlZWQnLCBMaWdodC5saWdodE9mZi5iaW5kKG51bGwsIHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBVElDIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICd0b3JjaCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvcmNoXHJcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xyXG5pbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnXHJcblxyXG5pbXBvcnQgeyBSRVBMWSwgQUJJTElUWV9DQVJSWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCB7IGluc3RhbmNlQnlJdGVtSWQgfSBmcm9tICcuLi9saWIvdXRpbHMnXHJcblxyXG5jbGFzcyBTbG90IHtcclxuICBjb25zdHJ1Y3RvciAoW2l0ZW1JZCwgcGFyYW1zLCBjb3VudF0pIHtcclxuICAgIHRoaXMuaXRlbSA9IGluc3RhbmNlQnlJdGVtSWQoaXRlbUlkLCBwYXJhbXMpXHJcbiAgICB0aGlzLmNvdW50ID0gY291bnRcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiBbdGhpcy5pdGVtLnRvU3RyaW5nKCksICcoJywgdGhpcy5jb3VudCwgJyknXS5qb2luKCcnKVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgVHJlYXN1cmUgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcclxuICBjb25zdHJ1Y3RvciAoaW52ZW50b3JpZXMgPSBbXSkge1xyXG4gICAgLy8gQ3JlYXRlIHRoZSBjYXQgc3ByaXRlXHJcbiAgICBzdXBlcihUZXh0dXJlLlRyZWFzdXJlKVxyXG5cclxuICAgIHRoaXMuaW52ZW50b3JpZXMgPSBpbnZlbnRvcmllcy5tYXAodHJlYXN1cmUgPT4gbmV3IFNsb3QodHJlYXN1cmUpKVxyXG5cclxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcclxuICB9XHJcblxyXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFJFUExZIH1cclxuXHJcbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcclxuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBvcGVyYXRvcltBQklMSVRZX0NBUlJZXVxyXG4gICAgaWYgKCFjYXJyeUFiaWxpdHkpIHtcclxuICAgICAgb3BlcmF0b3Iuc2F5KCdJIGNhblxcJ3QgY2FycnkgaXRlbXMgbm90IHlldC4nKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmludmVudG9yaWVzLmZvckVhY2goXHJcbiAgICAgIHRyZWFzdXJlID0+IGNhcnJ5QWJpbGl0eS50YWtlKHRyZWFzdXJlLml0ZW0sIHRyZWFzdXJlLmNvdW50KSlcclxuICAgIG9wZXJhdG9yLnNheShbJ0kgdGFrZWQgJywgdGhpcy50b1N0cmluZygpXS5qb2luKCcnKSlcclxuXHJcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKVxyXG4gICAgdGhpcy5kZXN0cm95KClcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICd0cmVhc3VyZTogWycsXHJcbiAgICAgIHRoaXMuaW52ZW50b3JpZXMuam9pbignLCAnKSxcclxuICAgICAgJ10nXHJcbiAgICBdLmpvaW4oJycpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmVhc3VyZVxyXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFRyZWUgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKFRleHR1cmUuVHJlZSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmVlXG4iLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuLi9saWIvVGV4dHVyZSdcbmltcG9ydCBHYW1lT2JqZWN0IGZyb20gJy4vR2FtZU9iamVjdCdcblxuaW1wb3J0IHsgU1RBWSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFdhbGwgZXh0ZW5kcyBHYW1lT2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKHRyZWFzdXJlcykge1xuICAgIC8vIENyZWF0ZSB0aGUgY2F0IHNwcml0ZVxuICAgIHN1cGVyKFRleHR1cmUuV2FsbClcblxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIFNUQVkgfVxuXG4gIGFjdGlvbldpdGggKG9wZXJhdG9yKSB7XG4gICAgb3BlcmF0b3IuZW1pdCgnY29sbGlkZScsIHRoaXMpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdXYWxsJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdhbGxcbiIsImltcG9ydCBUZXh0dXJlIGZyb20gJy4uL2xpYi9UZXh0dXJlJ1xuaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0J1xuXG5pbXBvcnQgeyBTVEFZLCBBQklMSVRZX0ZJUkUgfSBmcm9tICcuLi9jb25maWcvY29uc3RhbnRzJ1xuXG5pbXBvcnQgTGVhcm4gZnJvbSAnLi9hYmlsaXRpZXMvTGVhcm4nXG5pbXBvcnQgQ2FycnkgZnJvbSAnLi4vb2JqZWN0cy9hYmlsaXRpZXMvQ2FycnknXG5pbXBvcnQgRmlyZSBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9GaXJlJ1xuaW1wb3J0IEhlYWx0aCBmcm9tICcuLi9vYmplY3RzL2FiaWxpdGllcy9IZWFsdGgnXG5pbXBvcnQgQnVsbGV0IGZyb20gJy4uL29iamVjdHMvQnVsbGV0J1xuXG5jbGFzcyBXYWxsU2hvb3RCb2x0IGV4dGVuZHMgR2FtZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICh0cmVhc3VyZXMpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGNhdCBzcHJpdGVcbiAgICBzdXBlcihUZXh0dXJlLldhbGwpXG5cbiAgICBsZXQgY2FycnkgPSBuZXcgQ2FycnkoMylcbiAgICBuZXcgTGVhcm4oKS5jYXJyeUJ5KHRoaXMpXG4gICAgICAubGVhcm4obmV3IEZpcmUoWzMsIDNdKSlcbiAgICAgIC5sZWFybihjYXJyeSlcbiAgICAgIC5sZWFybihuZXcgSGVhbHRoKDEwMDApKVxuXG4gICAgbGV0IGJ1bGxldCA9IG5ldyBCdWxsZXQoKVxuICAgIGNhcnJ5LnRha2UoYnVsbGV0LCBJbmZpbml0eSlcblxuICAgIHRoaXMub24oJ2NvbGxpZGUnLCB0aGlzLmFjdGlvbldpdGguYmluZCh0aGlzKSlcbiAgICB0aGlzLm9uKCdkaWUnLCB0aGlzLm9uRGllLmJpbmQodGhpcykpXG5cbiAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBsZXQgcmFkID0gdGhpcy5yb3RhdGlvblxuICAgICAgdGhpc1tBQklMSVRZX0ZJUkVdLmZpcmUocmFkKVxuICAgICAgdGhpc1tBQklMSVRZX0ZJUkVdLmZpcmUocmFkICsgTWF0aC5QSSAvIDIpXG4gICAgICB0aGlzW0FCSUxJVFlfRklSRV0uZmlyZShyYWQgKyBNYXRoLlBJKVxuICAgICAgdGhpc1tBQklMSVRZX0ZJUkVdLmZpcmUocmFkICsgTWF0aC5QSSAvIDIgKiAzKVxuICAgIH0sIDIwMClcblxuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHRoaXMucm90YXRlKE1hdGguUEkgLyAzMCAvIDEwLCB0cnVlKVxuICAgIH0sIDE3KVxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gU1RBWSB9XG5cbiAgYWN0aW9uV2l0aCAob3BlcmF0b3IpIHtcbiAgICBvcGVyYXRvci5lbWl0KCdjb2xsaWRlJywgdGhpcylcbiAgfVxuXG4gIG9uRGllICgpIHtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKVxuICAgIHRoaXMuZGVzdHJveSgpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdXYWxsU2hvb3RCb2x0J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdhbGxTaG9vdEJvbHRcbiIsImNvbnN0IHR5cGUgPSBTeW1ib2woJ2FiaWxpdHknKVxuXG5jbGFzcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gdHlwZSB9XG5cbiAgZ2V0U2FtZVR5cGVBYmlsaXR5IChvd25lcikge1xuICAgIHJldHVybiBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXVxuICB9XG5cbiAgLy8g5piv5ZCm6ZyA572u5o+bXG4gIGhhc1RvUmVwbGFjZSAob3duZXIsIGFiaWxpdHlOZXcpIHtcbiAgICBsZXQgYWJpbGl0eU9sZCA9IHRoaXMuZ2V0U2FtZVR5cGVBYmlsaXR5KG93bmVyKVxuICAgIHJldHVybiAhYWJpbGl0eU9sZCB8fCBhYmlsaXR5TmV3LmlzQmV0dGVyKGFiaWxpdHlPbGQpXG4gIH1cblxuICAvLyDmlrDoiIrmr5TovINcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIGxldCBhYmlsaXR5T2xkID0gdGhpcy5nZXRTYW1lVHlwZUFiaWxpdHkob3duZXIpXG4gICAgaWYgKGFiaWxpdHlPbGQpIHtcbiAgICAgIC8vIGZpcnN0IGdldCB0aGlzIHR5cGUgYWJpbGl0eVxuICAgICAgYWJpbGl0eU9sZC5yZXBsYWNlZEJ5KHRoaXMsIG93bmVyKVxuICAgIH1cbiAgICBvd25lci5hYmlsaXRpZXNbdGhpcy50eXBlXSA9IHRoaXNcbiAgfVxuXG4gIHJlcGxhY2VkQnkgKG90aGVyLCBvd25lcikge31cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgZGVsZXRlIG93bmVyLmFiaWxpdGllc1t0aGlzLnR5cGVdXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdwbHogZXh0ZW5kIHRoaXMgY2xhc3MnXG4gIH1cblxuICBzZXJpYWxpemUgKCkge1xuICAgIHJldHVybiB7fVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFiaWxpdHlcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcclxuaW1wb3J0IExpZ2h0IGZyb20gJy4uLy4uL2xpYi9MaWdodCdcclxuaW1wb3J0IHsgQUJJTElUWV9DQU1FUkEgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5cclxuY2xhc3MgQ2FtZXJhIGV4dGVuZHMgQWJpbGl0eSB7XHJcbiAgY29uc3RydWN0b3IgKHZhbHVlKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnJhZGl1cyA9IHZhbHVlXHJcbiAgfVxyXG5cclxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0NBTUVSQSB9XHJcblxyXG4gIGlzQmV0dGVyIChvdGhlcikge1xyXG4gICAgLy8g5Y+q5pyD6K6K5aSnXHJcbiAgICByZXR1cm4gdGhpcy5yYWRpdXMgPj0gb3RoZXIucmFkaXVzXHJcbiAgfVxyXG5cclxuICAvLyDphY3lgpnmraTmioDog71cclxuICBjYXJyeUJ5IChvd25lcikge1xyXG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcclxuICAgIGlmIChvd25lci5wYXJlbnQpIHtcclxuICAgICAgdGhpcy5zZXR1cChvd25lciwgb3duZXIucGFyZW50KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3duZXIub25jZSgnYWRkZWQnLCBjb250YWluZXIgPT4gdGhpcy5zZXR1cChvd25lciwgY29udGFpbmVyKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlcGxhY2VkQnkgKG90aGVyLCBvd25lcikge1xyXG4gICAgdGhpcy5kcm9wQnkob3duZXIpXHJcbiAgfVxyXG5cclxuICBzZXR1cCAob3duZXIsIGNvbnRhaW5lcikge1xyXG4gICAgTGlnaHQubGlnaHRPbihvd25lciwgdGhpcy5yYWRpdXMpXHJcbiAgICAvLyDlpoLmnpwgb3duZXIg5LiN6KKr6aGv56S6XHJcbiAgICBvd25lci5yZW1vdmVkID0gdGhpcy5vblJlbW92ZWQuYmluZCh0aGlzLCBvd25lcilcclxuICAgIG93bmVyLm9uY2UoJ3JlbW92ZWQnLCBvd25lci5yZW1vdmVkKVxyXG4gIH1cclxuXHJcbiAgb25SZW1vdmVkIChvd25lcikge1xyXG4gICAgdGhpcy5kcm9wQnkob3duZXIpXHJcbiAgICAvLyBvd25lciDph43mlrDooqvpoa/npLpcclxuICAgIG93bmVyLm9uY2UoJ2FkZGVkJywgY29udGFpbmVyID0+IHRoaXMuc2V0dXAob3duZXIsIGNvbnRhaW5lcikpXHJcbiAgfVxyXG5cclxuICBkcm9wQnkgKG93bmVyKSB7XHJcbiAgICBMaWdodC5saWdodE9mZihvd25lcilcclxuICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxyXG4gICAgb3duZXIub2ZmKCdyZW1vdmVkJywgb3duZXIucmVtb3ZlZClcclxuICAgIGRlbGV0ZSBvd25lci5yZW1vdmVkXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ2xpZ2h0IGFyZWE6ICcgKyB0aGlzLnJhZGl1c1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FtZXJhXHJcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfQ0FSUlksIEFCSUxJVFlfTEVBUk4gfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuXG5mdW5jdGlvbiBuZXdTbG90IChpdGVtLCBjb3VudCkge1xuICByZXR1cm4ge1xuICAgIGl0ZW0sXG4gICAgY291bnQsXG4gICAgdG9TdHJpbmcgKCkge1xuICAgICAgcmV0dXJuIFtpdGVtLnRvU3RyaW5nKCksICcoJywgdGhpcy5jb3VudCwgJyknXS5qb2luKCcnKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDYXJyeSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAoaW5pdFNsb3RzKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuYmFncyA9IFtdXG4gICAgdGhpcy5iYWdzLnB1c2goQXJyYXkoaW5pdFNsb3RzKS5maWxsKCkpXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX0NBUlJZIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9DQVJSWV0gPSB0aGlzXG4gIH1cblxuICB0YWtlIChpdGVtLCBjb3VudCA9IDEpIHtcbiAgICBsZXQgb3duZXIgPSB0aGlzLm93bmVyXG4gICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBBYmlsaXR5ICYmIG93bmVyW0FCSUxJVFlfTEVBUk5dKSB7XG4gICAgICAvLyDlj5blvpfog73liptcbiAgICAgIG93bmVyW0FCSUxJVFlfTEVBUk5dLmxlYXJuKGl0ZW0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGtleSA9IGl0ZW0udG9TdHJpbmcoKVxuICAgIGxldCBmaXJzdEVtcHR5U2xvdFxuICAgIGxldCBmb3VuZCA9IHRoaXMuYmFncy5zb21lKChiYWcsIGJpKSA9PiB7XG4gICAgICByZXR1cm4gYmFnLnNvbWUoKHNsb3QsIHNpKSA9PiB7XG4gICAgICAgIC8vIOaaq+WtmOesrOS4gOWAi+epuuagvFxuICAgICAgICBpZiAoIXNsb3QgJiYgIWZpcnN0RW1wdHlTbG90KSB7XG4gICAgICAgICAgZmlyc3RFbXB0eVNsb3QgPSB7c2ksIGJpfVxuICAgICAgICB9XG4gICAgICAgIC8vIOeJqeWTgeeWiuWKoCjlkIzpoZ7lnospXG4gICAgICAgIGlmIChzbG90ICYmIHNsb3QuaXRlbS50b1N0cmluZygpID09PSBrZXkpIHtcbiAgICAgICAgICBzbG90LmNvdW50ICs9IGNvdW50XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0pXG4gICAgfSlcbiAgICBpZiAoIWZvdW5kKSB7XG4gICAgICBpZiAoIWZpcnN0RW1wdHlTbG90KSB7XG4gICAgICAgIC8vIOaykuacieepuuagvOWPr+aUvueJqeWTgVxuICAgICAgICBvd25lci5zYXkoJ25vIGVtcHR5IHNsb3QgZm9yIG5ldyBpdGVtIGdvdC4nKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIOaUvuWFpeesrOS4gOWAi+epuuagvFxuICAgICAgdGhpcy5iYWdzW2ZpcnN0RW1wdHlTbG90LmJpXVtmaXJzdEVtcHR5U2xvdC5zaV0gPSBuZXdTbG90KGl0ZW0sIGNvdW50KVxuICAgIH1cbiAgICBvd25lci5lbWl0KCdpbnZlbnRvcnktbW9kaWZpZWQnLCBpdGVtKVxuICB9XG5cbiAgZ2V0U2xvdEl0ZW0gKHNsb3RJbngpIHtcbiAgICBsZXQgYmlcbiAgICBsZXQgc2lcbiAgICAvLyDnhafokZfljIXljIXliqDlhaXpoIbluo/mn6Xmib5cbiAgICBsZXQgZm91bmQgPSB0aGlzLmJhZ3MuZmluZCgoYmFnLCBiKSA9PiB7XG4gICAgICBiaSA9IGJcbiAgICAgIHJldHVybiBiYWcuZmluZCgoc2xvdCwgcykgPT4ge1xuICAgICAgICBzaSA9IHNcbiAgICAgICAgcmV0dXJuIHNsb3RJbngtLSA9PT0gMFxuICAgICAgfSlcbiAgICB9KVxuICAgIGxldCBpdGVtXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICBmb3VuZCA9IHRoaXMuYmFnc1tiaV1bc2ldXG4gICAgICBpdGVtID0gZm91bmQuaXRlbVxuICAgICAgLy8g5Y+W5Ye65b6M5rib5LiAXG4gICAgICBpZiAoLS1mb3VuZC5jb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLmJhZ3NbYmldW3NpXSA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgdGhpcy5vd25lci5lbWl0KCdpbnZlbnRvcnktbW9kaWZpZWQnLCBpdGVtKVxuICAgIH1cbiAgICByZXR1cm4gaXRlbVxuICB9XG5cbiAgZ2V0SXRlbUJ5VHlwZSAodHlwZSkge1xuICAgIGxldCBiaVxuICAgIGxldCBzaVxuICAgIGxldCBmb3VuZCA9IHRoaXMuYmFncy5maW5kKChiYWcsIGIpID0+IHtcbiAgICAgIGJpID0gYlxuICAgICAgcmV0dXJuIGJhZy5maW5kKChzbG90LCBzKSA9PiB7XG4gICAgICAgIHNpID0gc1xuICAgICAgICByZXR1cm4gc2xvdCAmJiBzbG90Lml0ZW0gaW5zdGFuY2VvZiB0eXBlXG4gICAgICB9KVxuICAgIH0pXG4gICAgbGV0IGl0ZW1cbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIGZvdW5kID0gdGhpcy5iYWdzW2JpXVtzaV1cbiAgICAgIGl0ZW0gPSBmb3VuZC5pdGVtXG4gICAgICAvLyDlj5blh7rlvozmuJvkuIBcbiAgICAgIGlmICgtLWZvdW5kLmNvdW50ID09PSAwKSB7XG4gICAgICAgIHRoaXMuYmFnc1tiaV1bc2ldID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICB0aGlzLm93bmVyLmVtaXQoJ2ludmVudG9yeS1tb2RpZmllZCcsIGl0ZW0pXG4gICAgfVxuICAgIHJldHVybiBpdGVtXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIFsnY2Fycnk6ICcsIHRoaXMuYmFncy5qb2luKCcsICcpXS5qb2luKCcnKVxuICB9XG5cbiAgLy8gVE9ETzogc2F2ZSBkYXRhXG4gIHNlcmlhbGl6ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFnc1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhcnJ5XG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0ZJUkUsIEFCSUxJVFlfQ0FSUlksIEFCSUxJVFlfUk9UQVRFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcbmltcG9ydCBCdWxsZXQgZnJvbSAnLi4vQnVsbGV0J1xuaW1wb3J0IFZlY3RvciBmcm9tICcuLi8uLi9saWIvVmVjdG9yJ1xuXG5jb25zdCBQSSA9IE1hdGguUElcblxuZnVuY3Rpb24gY2FsY0Fwb3RoZW0gKG8sIHJhZCkge1xuICBsZXQgd2lkdGggPSBvLndpZHRoIC8gMlxuICBsZXQgaGVpZ2h0ID0gby5oZWlnaHQgLyAyXG4gIGxldCByZWN0UmFkID0gTWF0aC5hdGFuMihoZWlnaHQsIHdpZHRoKVxuICBsZXQgbGVuXG4gIC8vIOWmguaenOWwhOWHuuinkuepv+mBjiB3aWR0aFxuICBsZXQgcjEgPSBNYXRoLmFicyhyYWQgJSBQSSlcbiAgbGV0IHIyID0gTWF0aC5hYnMocmVjdFJhZCAlIFBJKVxuICBpZiAocjEgPCByMiB8fCByMSA+IHIyICsgUEkgLyAyKSB7XG4gICAgbGVuID0gd2lkdGggLyBNYXRoLmNvcyhyYWQpXG4gIH0gZWxzZSB7XG4gICAgbGVuID0gaGVpZ2h0IC8gTWF0aC5zaW4ocmFkKVxuICB9XG4gIHJldHVybiBNYXRoLmFicyhsZW4pXG59XG5cbmNsYXNzIEZpcmUgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgY29uc3RydWN0b3IgKFsgcG93ZXIgXSkge1xuICAgIHN1cGVyKClcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnRcbiAgICB0aGlzLnBvd2VyID0gcG93ZXJcbiAgfVxuXG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfRklSRSB9XG5cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMub3duZXIgPSBvd25lclxuICAgIG93bmVyW0FCSUxJVFlfRklSRV0gPSB0aGlzXG4gIH1cblxuICBmaXJlIChyYWQgPSB1bmRlZmluZWQpIHtcbiAgICBsZXQgb3duZXIgPSB0aGlzLm93bmVyXG4gICAgbGV0IHNjYWxlID0gb3duZXIuc2NhbGUueFxuXG4gICAgbGV0IGNhcnJ5QWJpbGl0eSA9IG93bmVyW0FCSUxJVFlfQ0FSUlldXG4gICAgbGV0IEJ1bGxldFR5cGUgPSBjYXJyeUFiaWxpdHkuZ2V0SXRlbUJ5VHlwZShCdWxsZXQpXG4gICAgaWYgKCFCdWxsZXRUeXBlKSB7XG4gICAgICAvLyBubyBtb3JlIGJ1bGxldCBpbiBpbnZlbnRvcnlcbiAgICAgIGNvbnNvbGUubG9nKCdubyBtb3JlIGJ1bGxldCBpbiBpbnZlbnRvcnknKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBidWxsZXQgPSBuZXcgQnVsbGV0VHlwZS5jb25zdHJ1Y3RvcigpXG5cbiAgICAvLyBzZXQgZGlyZWN0aW9uXG4gICAgaWYgKHJhZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyDlpoLmnpzmspLmjIflrprmlrnlkJHvvIzlsLHnlKjnm67liY3pnaLlsI3mlrnlkJFcbiAgICAgIGxldCByb3RhdGVBYmlsaXR5ID0gb3duZXJbQUJJTElUWV9ST1RBVEVdXG4gICAgICByYWQgPSByb3RhdGVBYmlsaXR5ID8gcm90YXRlQWJpbGl0eS5mYWNlUmFkIDogMFxuICAgIH1cbiAgICBsZXQgdmVjdG9yID0gVmVjdG9yLmZyb21SYWRMZW5ndGgocmFkLCAxKVxuICAgIGJ1bGxldC5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlKVxuICAgIGJ1bGxldC5zZXRPd25lcihvd25lcilcblxuICAgIC8vIHNldCBwb3NpdGlvblxuICAgIGxldCByZWN0TGVuID0gY2FsY0Fwb3RoZW0ob3duZXIsIHJhZCArIG93bmVyLnJvdGF0aW9uKVxuICAgIGxldCBidWxsZXRMZW4gPSBidWxsZXQuaGVpZ2h0IC8gMiAvLyDlsITlh7rop5LnrYnmlrzoh6rouqvml4vop5LvvIzmiYDku6XlhY3ljrvpgYvnrpdcbiAgICBsZXQgbGVuID0gcmVjdExlbiArIGJ1bGxldExlblxuICAgIGxldCBwb3NpdGlvbiA9IFZlY3Rvci5mcm9tUmFkTGVuZ3RoKHJhZCwgbGVuKVxuICAgICAgLmFkZChWZWN0b3IuZnJvbVBvaW50KG93bmVyLnBvc2l0aW9uKSlcbiAgICBidWxsZXQucG9zaXRpb24uc2V0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpXG5cbiAgICBidWxsZXQub25jZSgnYWRkZWQnLCAoKSA9PiB7XG4gICAgICBidWxsZXQuc2V0RGlyZWN0aW9uKHZlY3RvcilcbiAgICAgIGJ1bGxldC5ib2R5LmlzU2Vuc29yID0gdHJ1ZVxuICAgIH0pXG5cbiAgICBvd25lci5lbWl0KCdmaXJlJywgYnVsbGV0KVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnRmlyZSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaXJlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0hFQUxUSCB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIEhlYWx0aCBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAoaGVhbHRoUG9pbnQgPSAxKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaGVhbHRoUG9pbnQgPSBoZWFsdGhQb2ludFxuICAgIHRoaXMubWFwSGVhbHRoUG9pbnQgPSBoZWFsdGhQb2ludFxuICB9XG5cbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9IRUFMVEggfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX0hFQUxUSF0gPSB0aGlzXG4gIH1cblxuICBnZXRIdXJ0IChodXJ0KSB7XG4gICAgbGV0IHByZUhwID0gdGhpcy5oZWFsdGhQb2ludFxuICAgIHRoaXMuaGVhbHRoUG9pbnQgLT0gaHVydC5kYW1hZ2VcbiAgICBsZXQgc3VmSHAgPSB0aGlzLmhlYWx0aFBvaW50XG4gICAgdGhpcy5vd25lci5zYXkoW1xuICAgICAgdGhpcy5vd25lci50b1N0cmluZygpLFxuICAgICAgJyBnZXQgaHVydCAnLFxuICAgICAgaHVydC5kYW1hZ2UsXG4gICAgICAnOiAnLFxuICAgICAgcHJlSHAsXG4gICAgICAnIC0+ICcsXG4gICAgICBzdWZIcFxuICAgIF0uam9pbignJykpXG4gICAgaWYgKHRoaXMuaGVhbHRoUG9pbnQgPD0gMCkge1xuICAgICAgdGhpcy5vd25lci5lbWl0KCdkaWUnKVxuICAgIH1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ0hlYWx0aCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBIZWFsdGhcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcbmltcG9ydCB7IEFCSUxJVFlfRklSRSwgQUJJTElUWV9LRVlfRklSRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5pbXBvcnQgZ2xvYmFsRXZlbnRNYW5hZ2VyIGZyb20gJy4uLy4uL2xpYi9nbG9iYWxFdmVudE1hbmFnZXInXG5cbmNsYXNzIEtleUZpcmUgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9LRVlfRklSRSB9XG5cbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyDphY3lgpnmraTmioDog71cbiAgY2FycnlCeSAob3duZXIpIHtcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxuICAgIHRoaXMuc2V0dXAob3duZXIpXG4gIH1cblxuICBzZXR1cCAob3duZXIpIHtcbiAgICBsZXQgZmlyZUFiaWxpdHkgPSBvd25lcltBQklMSVRZX0ZJUkVdXG4gICAgbGV0IG1vdXNlSGFuZGxlciA9IGUgPT4ge1xuICAgICAgaWYgKGUuc3RvcHBlZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5lbWl0KCdmaXJlJylcbiAgICB9XG4gICAgbGV0IGZpcmVIYW5kbGVyID0gZmlyZUFiaWxpdHkuZmlyZS5iaW5kKGZpcmVBYmlsaXR5KVxuXG4gICAgb3duZXJbQUJJTElUWV9LRVlfRklSRV0gPSB7XG4gICAgICBtb3VzZWRvd246IG1vdXNlSGFuZGxlcixcbiAgICAgIGZpcmU6IGZpcmVIYW5kbGVyXG4gICAgfVxuICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW0FCSUxJVFlfS0VZX0ZJUkVdKS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLm9uKGV2ZW50TmFtZSwgaGFuZGxlcilcbiAgICB9KVxuICB9XG5cbiAgZHJvcEJ5IChvd25lcikge1xuICAgIHN1cGVyLmRyb3BCeShvd25lcilcbiAgICBPYmplY3QuZW50cmllcyhvd25lcltBQklMSVRZX0tFWV9GSVJFXSkuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5vZmYoZXZlbnROYW1lLCBoYW5kbGVyKVxuICAgIH0pXG4gICAgZGVsZXRlIG93bmVyW0FCSUxJVFlfS0VZX0ZJUkVdXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdrZXkgZmlyZSdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLZXlGaXJlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQga2V5Ym9hcmRKUyBmcm9tICdrZXlib2FyZGpzJ1xuaW1wb3J0IHsgTEVGVCwgVVAsIFJJR0hULCBET1dOIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnRyb2wnXG5pbXBvcnQgeyBBQklMSVRZX01PVkUsIEFCSUxJVFlfS0VZX01PVkUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xuaW1wb3J0IFZlY3RvciBmcm9tICcuLi8uLi9saWIvVmVjdG9yJ1xuXG5jbGFzcyBLZXlNb3ZlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfS0VZX01PVkUgfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLnNldHVwKG93bmVyKVxuICB9XG5cbiAgc2V0dXAgKG93bmVyKSB7XG4gICAgbGV0IGRpciA9IHt9XG4gICAgbGV0IGNhbGNEaXIgPSAoKSA9PiB7XG4gICAgICBsZXQgdmVjdG9yID0gbmV3IFZlY3RvcigtZGlyW0xFRlRdICsgZGlyW1JJR0hUXSwgLWRpcltVUF0gKyBkaXJbRE9XTl0pXG4gICAgICBvd25lcltBQklMSVRZX01PVkVdLmFkZERpcmVjdGlvbih2ZWN0b3IpXG4gICAgfVxuICAgIGxldCBiaW5kID0gY29kZSA9PiB7XG4gICAgICBkaXJbY29kZV0gPSAwXG4gICAgICBsZXQgcHJlSGFuZGxlciA9IGUgPT4ge1xuICAgICAgICBlLnByZXZlbnRSZXBlYXQoKVxuICAgICAgICBkaXJbY29kZV0gPSAxXG4gICAgICAgIG93bmVyW0FCSUxJVFlfTU9WRV0uY2xlYXJQYXRoKClcbiAgICAgIH1cbiAgICAgIGtleWJvYXJkSlMuYmluZChjb2RlLCBwcmVIYW5kbGVyLCAoKSA9PiB7XG4gICAgICAgIGRpcltjb2RlXSA9IDBcbiAgICAgIH0pXG4gICAgICByZXR1cm4gcHJlSGFuZGxlclxuICAgIH1cblxuICAgIGtleWJvYXJkSlMuc2V0Q29udGV4dCgnJylcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBvd25lcltBQklMSVRZX0tFWV9NT1ZFXSA9IHtcbiAgICAgICAgW0xFRlRdOiBiaW5kKExFRlQpLFxuICAgICAgICBbVVBdOiBiaW5kKFVQKSxcbiAgICAgICAgW1JJR0hUXTogYmluZChSSUdIVCksXG4gICAgICAgIFtET1dOXTogYmluZChET1dOKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoY2FsY0RpciwgMTcpXG4gIH1cblxuICBkcm9wQnkgKG93bmVyKSB7XG4gICAgc3VwZXIuZHJvcEJ5KG93bmVyKVxuICAgIGtleWJvYXJkSlMud2l0aENvbnRleHQoJycsICgpID0+IHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW0FCSUxJVFlfS0VZX01PVkVdKS5mb3JFYWNoKChba2V5LCBoYW5kbGVyXSkgPT4ge1xuICAgICAgICBrZXlib2FyZEpTLnVuYmluZChrZXksIGhhbmRsZXIpXG4gICAgICB9KVxuICAgIH0pXG4gICAgZGVsZXRlIG93bmVyW0FCSUxJVFlfS0VZX01PVkVdXG5cbiAgICBjbGVhckludGVydmFsKHRoaXMudGltZXIpXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICdrZXkgY29udHJvbCdcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBLZXlNb3ZlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQga2V5Ym9hcmRKUyBmcm9tICdrZXlib2FyZGpzJ1xuaW1wb3J0IHsgUExBQ0UxLCBQTEFDRTIsIFBMQUNFMywgUExBQ0U0IH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnRyb2wnXG5pbXBvcnQgeyBBQklMSVRZX1BMQUNFLCBBQklMSVRZX0tFWV9QTEFDRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IFNMT1RTID0gW1xuICBQTEFDRTEsIFBMQUNFMiwgUExBQ0UzLCBQTEFDRTRcbl1cblxuY2xhc3MgS2V5UGxhY2UgZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9LRVlfUExBQ0UgfVxuXG4gIGlzQmV0dGVyIChvdGhlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8g6YWN5YKZ5q2k5oqA6IO9XG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLnNldHVwKG93bmVyKVxuICB9XG5cbiAgc2V0dXAgKG93bmVyKSB7XG4gICAgbGV0IHBsYWNlQWJpbGl0eSA9IG93bmVyW0FCSUxJVFlfUExBQ0VdXG4gICAgbGV0IGJpbmQgPSBrZXkgPT4ge1xuICAgICAgbGV0IHNsb3RJbnggPSBTTE9UUy5pbmRleE9mKGtleSlcbiAgICAgIGxldCBoYW5kbGVyID0gZSA9PiB7XG4gICAgICAgIGUucHJldmVudFJlcGVhdCgpXG4gICAgICAgIHBsYWNlQWJpbGl0eS5wbGFjZShzbG90SW54KVxuICAgICAgfVxuICAgICAga2V5Ym9hcmRKUy5iaW5kKGtleSwgaGFuZGxlciwgKCkgPT4ge30pXG4gICAgICByZXR1cm4gaGFuZGxlclxuICAgIH1cblxuICAgIGtleWJvYXJkSlMuc2V0Q29udGV4dCgnJylcbiAgICBrZXlib2FyZEpTLndpdGhDb250ZXh0KCcnLCAoKSA9PiB7XG4gICAgICBvd25lcltBQklMSVRZX0tFWV9QTEFDRV0gPSB7XG4gICAgICAgIFBMQUNFMTogYmluZChQTEFDRTEpLFxuICAgICAgICBQTEFDRTI6IGJpbmQoUExBQ0UyKSxcbiAgICAgICAgUExBQ0UzOiBiaW5kKFBMQUNFMyksXG4gICAgICAgIFBMQUNFNDogYmluZChQTEFDRTQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGRyb3BCeSAob3duZXIpIHtcbiAgICBzdXBlci5kcm9wQnkob3duZXIpXG4gICAga2V5Ym9hcmRKUy53aXRoQ29udGV4dCgnJywgKCkgPT4ge1xuICAgICAgT2JqZWN0LmVudHJpZXMob3duZXJbQUJJTElUWV9LRVlfUExBQ0VdKS5mb3JFYWNoKChba2V5LCBoYW5kbGVyXSkgPT4ge1xuICAgICAgICBrZXlib2FyZEpTLnVuYmluZChrZXksIGhhbmRsZXIpXG4gICAgICB9KVxuICAgIH0pXG4gICAgZGVsZXRlIG93bmVyW0FCSUxJVFlfS0VZX1BMQUNFXVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAna2V5IHBsYWNlJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEtleVBsYWNlXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXG5pbXBvcnQgeyBBQklMSVRZX0xFQVJOIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgTGVhcm4gZXh0ZW5kcyBBYmlsaXR5IHtcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9MRUFSTiB9XG5cbiAgaXNCZXR0ZXIgKG90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjYXJyeUJ5IChvd25lcikge1xuICAgIGlmICghb3duZXIuYWJpbGl0aWVzKSB7XG4gICAgICBvd25lci5hYmlsaXRpZXMgPSB7fVxuICAgICAgb3duZXIudGlja0FiaWxpdGllcyA9IHt9XG4gICAgfVxuICAgIHN1cGVyLmNhcnJ5Qnkob3duZXIpXG4gICAgdGhpcy5vd25lciA9IG93bmVyXG4gICAgb3duZXJbQUJJTElUWV9MRUFSTl0gPSB0aGlzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGxlYXJuIChhYmlsaXR5KSB7XG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxuICAgIGlmIChhYmlsaXR5Lmhhc1RvUmVwbGFjZShvd25lciwgYWJpbGl0eSkpIHtcbiAgICAgIGFiaWxpdHkuY2FycnlCeShvd25lcilcbiAgICAgIG93bmVyLmVtaXQoJ2FiaWxpdHktY2FycnknLCBhYmlsaXR5KVxuICAgIH1cbiAgICByZXR1cm4gb3duZXJbQUJJTElUWV9MRUFSTl1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ2xlYXJuaW5nJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExlYXJuXG4iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknXHJcbmltcG9ydCB7IEFCSUxJVFlfTU9WRSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXHJcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vLi4vbGliL1ZlY3RvcidcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4uLy4uL2xpYi9NYXR0ZXInXHJcblxyXG5jb25zdCBESVNUQU5DRV9USFJFU0hPTEQgPSAxXHJcblxyXG5jbGFzcyBNb3ZlIGV4dGVuZHMgQWJpbGl0eSB7XHJcbiAgLyoqXHJcbiAgICog56e75YuV6IO95YqbXHJcbiAgICogQHBhcmFtICB7aW50fSB2YWx1ZSAgICDnp7vli5XpgJ/luqZcclxuICAgKiBAcGFyYW0gIHtmbG9hdH0gZnJpY3Rpb25BaXIgICAg56m66ZaT5pGp5pOm5YqbXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKFt2YWx1ZSwgZnJpY3Rpb25BaXJdKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcclxuICAgIHRoaXMuZnJpY3Rpb25BaXIgPSBmcmljdGlvbkFpclxyXG4gICAgdGhpcy52ZWN0b3IgPSBuZXcgVmVjdG9yKDAsIDApXHJcbiAgICB0aGlzLnBhdGggPSBbXVxyXG4gICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gdW5kZWZpbmVkXHJcbiAgICB0aGlzLmRpc3RhbmNlVGhyZXNob2xkID0gdGhpcy52YWx1ZSAqIERJU1RBTkNFX1RIUkVTSE9MRFxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9NT1ZFIH1cclxuXHJcbiAgaXNCZXR0ZXIgKG90aGVyKSB7XHJcbiAgICAvLyDlj6rmnIPliqDlv6tcclxuICAgIHJldHVybiB0aGlzLnZhbHVlID4gb3RoZXIudmFsdWVcclxuICB9XHJcblxyXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxyXG4gIGNhcnJ5QnkgKG93bmVyKSB7XHJcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxyXG4gICAgdGhpcy5vd25lciA9IG93bmVyXHJcbiAgICBvd25lcltBQklMSVRZX01PVkVdID0gdGhpc1xyXG4gIH1cclxuXHJcbiAgcmVwbGFjZWRCeSAob3RoZXIsIG93bmVyKSB7XHJcbiAgICBvdGhlci52ZWN0b3IgPSB0aGlzLnZlY3RvclxyXG4gICAgb3RoZXIucGF0aCA9IHRoaXMucGF0aFxyXG4gICAgb3RoZXIubW92aW5nVG9Qb2ludCA9IHRoaXMubW92aW5nVG9Qb2ludFxyXG4gIH1cclxuXHJcbiAgLy8g6Kit5a6a5pa55ZCR5pyA5aSn6YCf5bqmXHJcbiAgc2V0RGlyZWN0aW9uICh2ZWN0b3IpIHtcclxuICAgIEJvZHkuc2V0VmVsb2NpdHkodGhpcy5vd25lci5ib2R5LCB2ZWN0b3Iuc2V0TGVuZ3RoKHRoaXMudmFsdWUpKVxyXG4gIH1cclxuXHJcbiAgLy8g5pa95LqI5YqbXHJcbiAgYWRkRGlyZWN0aW9uICh2ZWN0b3IsIGZvcmNlRGl2aWRlID0gMC4xNykge1xyXG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxyXG4gICAgaWYgKCFvd25lci5ib2R5KSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgQm9keS5hcHBseUZvcmNlKFxyXG4gICAgICBvd25lci5ib2R5LFxyXG4gICAgICBvd25lci5wb3NpdGlvbixcclxuICAgICAgdmVjdG9yLm11bHRpcGx5U2NhbGFyKHRoaXMudmFsdWUgKiBmb3JjZURpdmlkZSAvIDEwMDApKVxyXG4gIH1cclxuXHJcbiAgLy8g56e75YuV5Yiw6bueXHJcbiAgbW92ZVRvIChwb2ludCkge1xyXG4gICAgbGV0IHZlY3RvciA9IG5ldyBWZWN0b3IocG9pbnQueCAtIHRoaXMub3duZXIueCwgcG9pbnQueSAtIHRoaXMub3duZXIueSlcclxuICAgIHRoaXMuc2V0RGlyZWN0aW9uKHZlY3RvcilcclxuICB9XHJcblxyXG4gIC8vIOioreWumuenu+WLlei3r+W+kVxyXG4gIHNldFBhdGggKHBhdGgpIHtcclxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAvLyDmirXpgZTntYLpu55cclxuICAgICAgdGhpcy5tb3ZpbmdUb1BvaW50ID0gdW5kZWZpbmVkXHJcbiAgICAgIHRoaXMudmVjdG9yID0gbmV3IFZlY3RvcigwLCAwKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMucGF0aCA9IHBhdGhcclxuICAgIHRoaXMubW92aW5nVG9Qb2ludCA9IHBhdGgucG9wKClcclxuICAgIHRoaXMubW92ZVRvKHRoaXMubW92aW5nVG9Qb2ludClcclxuICB9XHJcblxyXG4gIGNsZWFyUGF0aCAoKSB7XHJcbiAgICB0aGlzLm1vdmluZ1RvUG9pbnQgPSB1bmRlZmluZWRcclxuICAgIHRoaXMucGF0aCA9IFtdXHJcbiAgfVxyXG5cclxuICBhZGRQYXRoIChwYXRoKSB7XHJcbiAgICB0aGlzLnNldFBhdGgocGF0aC5jb25jYXQodGhpcy5wYXRoKSlcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnbW92ZSBsZXZlbDogJyArIHRoaXMudmFsdWVcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vdmVcclxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9PUEVSQVRFIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgT3BlcmF0ZSBleHRlbmRzIEFiaWxpdHkge1xuICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5zZXQgPSBuZXcgU2V0KFt2YWx1ZV0pXG4gIH1cblxuICBnZXQgdHlwZSAoKSB7IHJldHVybiBBQklMSVRZX09QRVJBVEUgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICBvd25lcltBQklMSVRZX09QRVJBVEVdID0gdGhpc1tBQklMSVRZX09QRVJBVEVdLmJpbmQodGhpcywgb3duZXIpXG4gICAgcmV0dXJuIG93bmVyW0FCSUxJVFlfT1BFUkFURV1cbiAgfVxuXG4gIHJlcGxhY2VkQnkgKG90aGVyKSB7XG4gICAgdGhpcy5zZXQuZm9yRWFjaChvdGhlci5zZXQuYWRkLmJpbmQob3RoZXIuc2V0KSlcbiAgfVxuXG4gIFtBQklMSVRZX09QRVJBVEVdIChvcGVyYXRvciwgdGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMuc2V0Lmhhcyh0YXJnZXQubWFwKSkge1xuICAgICAgb3BlcmF0b3Iuc2F5KG9wZXJhdG9yLnRvU3RyaW5nKCkgKyAnIHVzZSBhYmlsaXR5IHRvIG9wZW4gJyArIHRhcmdldC5tYXApXG4gICAgICB0YXJnZXRbdGhpcy50eXBlXSgpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBbJ2tleXM6ICcsIEFycmF5LmZyb20odGhpcy5zZXQpLmpvaW4oJywgJyldLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3BlcmF0ZVxuIiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5J1xuaW1wb3J0IHsgQUJJTElUWV9QTEFDRSwgQUJJTElUWV9DQVJSWSB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNsYXNzIFBsYWNlIGV4dGVuZHMgQWJpbGl0eSB7XG4gIGdldCB0eXBlICgpIHsgcmV0dXJuIEFCSUxJVFlfUExBQ0UgfVxuXG4gIGNhcnJ5QnkgKG93bmVyKSB7XG4gICAgc3VwZXIuY2FycnlCeShvd25lcilcbiAgICB0aGlzLm93bmVyID0gb3duZXJcbiAgICBvd25lcltBQklMSVRZX1BMQUNFXSA9IHRoaXNcbiAgfVxuXG4gIHBsYWNlIChzbG90SW54KSB7XG4gICAgbGV0IG93bmVyID0gdGhpcy5vd25lclxuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBvd25lcltBQklMSVRZX0NBUlJZXVxuICAgIGxldCBpdGVtID0gY2FycnlBYmlsaXR5LmdldFNsb3RJdGVtKHNsb3RJbngpXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIG93bmVyLmVtaXQoJ3BsYWNlJywgbmV3IGl0ZW0uY29uc3RydWN0b3IoKSlcblxuICAgICAgbGV0IHBvc2l0aW9uID0gb3duZXIucG9zaXRpb25cbiAgICAgIG93bmVyLnNheShbJ3BsYWNlICcsIGl0ZW0udG9TdHJpbmcoKSwgJyBhdCAnLFxuICAgICAgICBbJygnLCBwb3NpdGlvbi54LnRvRml4ZWQoMCksICcsICcsIHBvc2l0aW9uLnkudG9GaXhlZCgwKSwgJyknXS5qb2luKCcnKV0uam9pbignJykpXG4gICAgfVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAncGxhY2UnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxhY2VcbiIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSdcclxuaW1wb3J0IHsgQUJJTElUWV9ST1RBVEUgfSBmcm9tICcuLi8uLi9jb25maWcvY29uc3RhbnRzJ1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uLy4uL2xpYi9WZWN0b3InXHJcbmltcG9ydCBnbG9iYWxFdmVudE1hbmFnZXIgZnJvbSAnLi4vLi4vbGliL2dsb2JhbEV2ZW50TWFuYWdlcidcclxuXHJcbmNvbnN0IE1PVVNFTU9WRSA9IFN5bWJvbCgnbW91c2Vtb3ZlJylcclxuXHJcbmNsYXNzIFJvdGF0ZSBleHRlbmRzIEFiaWxpdHkge1xyXG4gIGNvbnN0cnVjdG9yIChpbml0UmFkID0gMCkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5pbml0UmFkID0gaW5pdFJhZFxyXG4gIH1cclxuXHJcbiAgZ2V0IHR5cGUgKCkgeyByZXR1cm4gQUJJTElUWV9ST1RBVEUgfVxyXG5cclxuICBpc0JldHRlciAob3RoZXIpIHtcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgZ2V0IGZhY2VSYWQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZhY2VSYWRcclxuICB9XHJcblxyXG4gIC8vIOmFjeWCmeatpOaKgOiDvVxyXG4gIGNhcnJ5QnkgKG93bmVyKSB7XHJcbiAgICBzdXBlci5jYXJyeUJ5KG93bmVyKVxyXG5cclxuICAgIHRoaXMub3duZXIgPSBvd25lclxyXG4gICAgb3duZXJbQUJJTElUWV9ST1RBVEVdID0gdGhpc1xyXG4gICAgb3duZXIuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICBsZXQgbW91c2VIYW5kbGVyID0gZSA9PiB7XHJcbiAgICAgIGxldCBvd25lclBvaW50ID0gdGhpcy5vd25lci5nZXRHbG9iYWxQb3NpdGlvbigpXHJcbiAgICAgIGxldCBwb2ludGVyID0gZS5kYXRhLmdsb2JhbFxyXG4gICAgICBsZXQgdmVjdG9yID0gbmV3IFZlY3RvcihcclxuICAgICAgICBwb2ludGVyLnggLSBvd25lclBvaW50LngsXHJcbiAgICAgICAgcG9pbnRlci55IC0gb3duZXJQb2ludC55KVxyXG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgncm90YXRlJywgdmVjdG9yKVxyXG4gICAgfVxyXG4gICAgbGV0IHJvdGF0ZUhhbmRsZXIgPSB0aGlzLnNldEZhY2VSYWQuYmluZCh0aGlzKVxyXG5cclxuICAgIG93bmVyW01PVVNFTU9WRV0gPSB7XHJcbiAgICAgIHJvdGF0ZTogcm90YXRlSGFuZGxlcixcclxuICAgICAgbW91c2Vtb3ZlOiBtb3VzZUhhbmRsZXJcclxuICAgIH1cclxuICAgIE9iamVjdC5lbnRyaWVzKG93bmVyW01PVVNFTU9WRV0pLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XHJcbiAgICAgIGdsb2JhbEV2ZW50TWFuYWdlci5vbihldmVudE5hbWUsIGhhbmRsZXIpXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMuc2V0RmFjZVJhZChuZXcgVmVjdG9yKDAsIDApKVxyXG4gIH1cclxuXHJcbiAgZHJvcEJ5IChvd25lcikge1xyXG4gICAgc3VwZXIuZHJvcEJ5KG93bmVyKVxyXG4gICAgT2JqZWN0LmVudHJpZXMob3duZXJbTU9VU0VNT1ZFXSkuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcclxuICAgICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLm9mZihldmVudE5hbWUsIGhhbmRsZXIpXHJcbiAgICB9KVxyXG4gICAgZGVsZXRlIG93bmVyW01PVVNFTU9WRV1cclxuICAgIGRlbGV0ZSBvd25lcltBQklMSVRZX1JPVEFURV1cclxuICB9XHJcblxyXG4gIHNldEZhY2VSYWQgKHZlY3Rvcikge1xyXG4gICAgdGhpcy5fZmFjZVJhZCA9IHZlY3Rvci5yYWQgLSB0aGlzLmluaXRSYWRcclxuICAgIHRoaXMub3duZXIucm90YXRlKHRoaXMuX2ZhY2VSYWQpXHJcbiAgfVxyXG5cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gJ1JvdGF0ZSdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJvdGF0ZVxyXG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUsIGxvYWRlciB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbGliL1NjZW5lJ1xyXG5pbXBvcnQgUGxheVNjZW5lIGZyb20gJy4vUGxheVNjZW5lJ1xyXG5cclxubGV0IHRleHQgPSAnbG9hZGluZydcclxuXHJcbmNsYXNzIExvYWRpbmdTY2VuZSBleHRlbmRzIFNjZW5lIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5saWZlID0gMFxyXG4gIH1cclxuXHJcbiAgY3JlYXRlICgpIHtcclxuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xyXG4gICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxyXG4gICAgICBmb250U2l6ZTogMzYsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHN0cm9rZTogJyNmZjMzMDAnLFxyXG4gICAgICBzdHJva2VUaGlja25lc3M6IDQsXHJcbiAgICAgIGRyb3BTaGFkb3c6IHRydWUsXHJcbiAgICAgIGRyb3BTaGFkb3dDb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICBkcm9wU2hhZG93Qmx1cjogNCxcclxuICAgICAgZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcclxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlOiA2XHJcbiAgICB9KVxyXG4gICAgdGhpcy50ZXh0TG9hZGluZyA9IG5ldyBUZXh0KHRleHQsIHN0eWxlKVxyXG5cclxuICAgIC8vIEFkZCB0aGUgY2F0IHRvIHRoZSBzdGFnZVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRleHRMb2FkaW5nKVxyXG5cclxuICAgIC8vIGxvYWQgYW4gaW1hZ2UgYW5kIHJ1biB0aGUgYHNldHVwYCBmdW5jdGlvbiB3aGVuIGl0J3MgZG9uZVxyXG4gICAgbG9hZGVyXHJcbiAgICAgIC5hZGQoJ2ltYWdlcy90ZXJyYWluX2F0bGFzLmpzb24nKVxyXG4gICAgICAuYWRkKCdpbWFnZXMvYmFzZV9vdXRfYXRsYXMuanNvbicpXHJcbiAgICAgIC5hZGQoJ2ltYWdlcy9maXJlX2JvbHQucG5nJylcclxuICAgICAgLmxvYWQoKCkgPT4gdGhpcy5lbWl0KCdjaGFuZ2VTY2VuZScsIFBsYXlTY2VuZSwge1xyXG4gICAgICAgIG1hcEZpbGU6ICdXME4wJyxcclxuICAgICAgICBwb3NpdGlvbjogWzYsIDEyXVxyXG4gICAgICB9KSlcclxuICB9XHJcblxyXG4gIHRpY2sgKGRlbHRhKSB7XHJcbiAgICB0aGlzLmxpZmUgKz0gZGVsdGEgLyAzMCAvLyBibGVuZCBzcGVlZFxyXG4gICAgdGhpcy50ZXh0TG9hZGluZy50ZXh0ID0gdGV4dCArIEFycmF5KE1hdGguZmxvb3IodGhpcy5saWZlKSAlIDQgKyAxKS5qb2luKCcuJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExvYWRpbmdTY2VuZVxyXG4iLCJpbXBvcnQgeyBsb2FkZXIsIHJlc291cmNlcywgZGlzcGxheSB9IGZyb20gJy4uL2xpYi9QSVhJJ1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbGliL1NjZW5lJ1xyXG5pbXBvcnQgTWFwIGZyb20gJy4uL2xpYi9NYXAnXHJcbmltcG9ydCB7IElTX01PQklMRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXHJcblxyXG5pbXBvcnQgQ2F0IGZyb20gJy4uL29iamVjdHMvQ2F0J1xyXG5cclxuaW1wb3J0IE1lc3NhZ2VXaW5kb3cgZnJvbSAnLi4vdWkvTWVzc2FnZVdpbmRvdydcclxuaW1wb3J0IFBsYXllcldpbmRvdyBmcm9tICcuLi91aS9QbGF5ZXJXaW5kb3cnXHJcbmltcG9ydCBJbnZlbnRvcnlXaW5kb3cgZnJvbSAnLi4vdWkvSW52ZW50b3J5V2luZG93J1xyXG5pbXBvcnQgVG91Y2hEaXJlY3Rpb25Db250cm9sUGFuZWwgZnJvbSAnLi4vdWkvVG91Y2hEaXJlY3Rpb25Db250cm9sUGFuZWwnXHJcbmltcG9ydCBUb3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCBmcm9tICcuLi91aS9Ub3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCdcclxuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xyXG5cclxubGV0IHNjZW5lV2lkdGhcclxubGV0IHNjZW5lSGVpZ2h0XHJcblxyXG5mdW5jdGlvbiBnZXRNZXNzYWdlV2luZG93T3B0ICgpIHtcclxuICBsZXQgb3B0ID0ge31cclxuICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoXHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyAzMFxyXG4gICAgb3B0LnNjcm9sbEJhcldpZHRoID0gNTBcclxuICAgIG9wdC5zY3JvbGxCYXJNaW5IZWlnaHQgPSA3MFxyXG4gIH0gZWxzZSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIDwgNDAwID8gc2NlbmVXaWR0aCA6IHNjZW5lV2lkdGggLyAyXHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyA2MFxyXG4gIH1cclxuICBvcHQuaGVpZ2h0ID0gc2NlbmVIZWlnaHQgLyA2XHJcbiAgb3B0LnggPSAwXHJcbiAgb3B0LnkgPSBzY2VuZUhlaWdodCAtIG9wdC5oZWlnaHRcclxuXHJcbiAgcmV0dXJuIG9wdFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQbGF5ZXJXaW5kb3dPcHQgKHBsYXllcikge1xyXG4gIGxldCBvcHQgPSB7XHJcbiAgICBwbGF5ZXJcclxuICB9XHJcbiAgb3B0LnggPSAwXHJcbiAgb3B0LnkgPSAwXHJcbiAgaWYgKElTX01PQklMRSkge1xyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aCAvIDRcclxuICAgIG9wdC5oZWlnaHQgPSBzY2VuZUhlaWdodCAvIDZcclxuICAgIG9wdC5mb250U2l6ZSA9IG9wdC53aWR0aCAvIDEwXHJcbiAgfSBlbHNlIHtcclxuICAgIG9wdC53aWR0aCA9IHNjZW5lV2lkdGggPCA0MDAgPyBzY2VuZVdpZHRoIC8gMiA6IHNjZW5lV2lkdGggLyA0XHJcbiAgICBvcHQuaGVpZ2h0ID0gc2NlbmVIZWlnaHQgLyAzXHJcbiAgICBvcHQuZm9udFNpemUgPSBvcHQud2lkdGggLyAyMFxyXG4gIH1cclxuICByZXR1cm4gb3B0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEludmVudG9yeVdpbmRvd09wdCAocGxheWVyKSB7XHJcbiAgbGV0IG9wdCA9IHtcclxuICAgIHBsYXllclxyXG4gIH1cclxuICBvcHQueSA9IDBcclxuICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICBvcHQud2lkdGggPSBzY2VuZVdpZHRoIC8gNlxyXG4gIH0gZWxzZSB7XHJcbiAgICBsZXQgZGl2aWRlID0gc2NlbmVXaWR0aCA8IDQwMCA/IDYgOiBzY2VuZVdpZHRoIDwgODAwID8gMTIgOiAyMFxyXG4gICAgb3B0LndpZHRoID0gc2NlbmVXaWR0aCAvIGRpdmlkZVxyXG4gIH1cclxuICBvcHQueCA9IHNjZW5lV2lkdGggLSBvcHQud2lkdGhcclxuICByZXR1cm4gb3B0XHJcbn1cclxuXHJcbmNsYXNzIFBsYXlTY2VuZSBleHRlbmRzIFNjZW5lIHtcclxuICBjb25zdHJ1Y3RvciAoeyBtYXBGaWxlLCBwb3NpdGlvbiB9KSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5tYXBGaWxlID0gbWFwRmlsZVxyXG4gICAgdGhpcy50b1Bvc2l0aW9uID0gcG9zaXRpb25cclxuICAgIHRoaXMuZ3JvdXAuZW5hYmxlU29ydCA9IHRydWVcclxuICB9XHJcblxyXG4gIGNyZWF0ZSAoKSB7XHJcbiAgICBzY2VuZVdpZHRoID0gdGhpcy5wYXJlbnQud2lkdGhcclxuICAgIHNjZW5lSGVpZ2h0ID0gdGhpcy5wYXJlbnQuaGVpZ2h0XHJcbiAgICB0aGlzLmlzTWFwTG9hZGVkID0gZmFsc2VcclxuICAgIHRoaXMubG9hZE1hcCgpXHJcbiAgICB0aGlzLmluaXRQbGF5ZXIoKVxyXG4gICAgdGhpcy5pbml0VWkoKVxyXG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgnZmlyZScpXHJcbiAgICB9LCAxMDApXHJcbiAgfVxyXG5cclxuICBpbml0VWkgKCkge1xyXG4gICAgbGV0IHVpR3JvdXAgPSBuZXcgZGlzcGxheS5Hcm91cCgxLCB0cnVlKVxyXG4gICAgbGV0IHVpTGF5ZXIgPSBuZXcgZGlzcGxheS5MYXllcih1aUdyb3VwKVxyXG4gICAgdWlMYXllci5wYXJlbnRMYXllciA9IHRoaXNcclxuICAgIHRoaXMuYWRkQ2hpbGQodWlMYXllcilcclxuXHJcbiAgICBsZXQgbWVzc2FnZVdpbmRvdyA9IG5ldyBNZXNzYWdlV2luZG93KGdldE1lc3NhZ2VXaW5kb3dPcHQoKSlcclxuICAgIGxldCBwbGF5ZXJXaW5kb3cgPSBuZXcgUGxheWVyV2luZG93KGdldFBsYXllcldpbmRvd09wdCh0aGlzLmNhdCkpXHJcbiAgICBsZXQgaW52ZW50b3J5V2luZG93ID0gbmV3IEludmVudG9yeVdpbmRvdyhnZXRJbnZlbnRvcnlXaW5kb3dPcHQodGhpcy5jYXQpKVxyXG5cclxuICAgIC8vIOiuk1VJ6aGv56S65Zyo6aCC5bGkXHJcbiAgICBtZXNzYWdlV2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgcGxheWVyV2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgaW52ZW50b3J5V2luZG93LnBhcmVudEdyb3VwID0gdWlHcm91cFxyXG4gICAgdWlMYXllci5hZGRDaGlsZChtZXNzYWdlV2luZG93KVxyXG4gICAgdWlMYXllci5hZGRDaGlsZChwbGF5ZXJXaW5kb3cpXHJcbiAgICB1aUxheWVyLmFkZENoaWxkKGludmVudG9yeVdpbmRvdylcclxuXHJcbiAgICBpZiAoSVNfTU9CSUxFKSB7XHJcbiAgICAgIC8vIOWPquacieaJi+apn+imgeinuOaOp+adv1xyXG4gICAgICAvLyDmlrnlkJHmjqfliLZcclxuICAgICAgbGV0IGRpcmVjdGlvblBhbmVsID0gbmV3IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsKHtcclxuICAgICAgICB4OiBzY2VuZVdpZHRoIC8gNCxcclxuICAgICAgICB5OiBzY2VuZUhlaWdodCAqIDQgLyA2LFxyXG4gICAgICAgIHJhZGl1czogc2NlbmVXaWR0aCAvIDhcclxuICAgICAgfSlcclxuICAgICAgZGlyZWN0aW9uUGFuZWwucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcblxyXG4gICAgICAvLyDmk43kvZzmjqfliLZcclxuICAgICAgbGV0IG9wZXJhdGlvblBhbmVsID0gbmV3IFRvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsKHtcclxuICAgICAgICB4OiBzY2VuZVdpZHRoIC8gNSAqIDMsXHJcbiAgICAgICAgeTogc2NlbmVIZWlnaHQgLyA1ICogMyxcclxuICAgICAgICB3aWR0aDogc2NlbmVXaWR0aCAvIDMsXHJcbiAgICAgICAgaGVpZ2h0OiBzY2VuZUhlaWdodCAvIDVcclxuICAgICAgfSlcclxuICAgICAgb3BlcmF0aW9uUGFuZWwucGFyZW50R3JvdXAgPSB1aUdyb3VwXHJcblxyXG4gICAgICB1aUxheWVyLmFkZENoaWxkKGRpcmVjdGlvblBhbmVsKVxyXG4gICAgICB1aUxheWVyLmFkZENoaWxkKG9wZXJhdGlvblBhbmVsKVxyXG4gICAgICAvLyByZXF1aXJlKCcuLi9saWIvZGVtbycpXHJcbiAgICB9XHJcbiAgICBtZXNzYWdlV2luZG93LmFkZChbJ3NjZW5lIHNpemU6ICgnLCBzY2VuZVdpZHRoLCAnLCAnLCBzY2VuZUhlaWdodCwgJykuJ10uam9pbignJykpXHJcbiAgfVxyXG5cclxuICBpbml0UGxheWVyICgpIHtcclxuICAgIGlmICghdGhpcy5jYXQpIHtcclxuICAgICAgdGhpcy5jYXQgPSBuZXcgQ2F0KClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxvYWRNYXAgKCkge1xyXG4gICAgbGV0IGZpbGVOYW1lID0gJ3dvcmxkLycgKyB0aGlzLm1hcEZpbGVcclxuXHJcbiAgICAvLyBpZiBtYXAgbm90IGxvYWRlZCB5ZXRcclxuICAgIGlmICghcmVzb3VyY2VzW2ZpbGVOYW1lXSkge1xyXG4gICAgICBsb2FkZXJcclxuICAgICAgICAuYWRkKGZpbGVOYW1lLCBmaWxlTmFtZSArICcuanNvbicpXHJcbiAgICAgICAgLmxvYWQodGhpcy5zcGF3bk1hcC5iaW5kKHRoaXMsIGZpbGVOYW1lKSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc3Bhd25NYXAoZmlsZU5hbWUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzcGF3bk1hcCAoZmlsZU5hbWUpIHtcclxuICAgIGxldCBtYXBHcm91cCA9IG5ldyBkaXNwbGF5Lkdyb3VwKDAsIHRydWUpXHJcbiAgICBsZXQgbWFwTGF5ZXIgPSBuZXcgZGlzcGxheS5MYXllcihtYXBHcm91cClcclxuICAgIG1hcExheWVyLnBhcmVudExheWVyID0gdGhpc1xyXG4gICAgbWFwTGF5ZXIuZ3JvdXAuZW5hYmxlU29ydCA9IHRydWVcclxuICAgIHRoaXMuYWRkQ2hpbGQobWFwTGF5ZXIpXHJcblxyXG4gICAgbGV0IG1hcERhdGEgPSByZXNvdXJjZXNbZmlsZU5hbWVdLmRhdGFcclxuICAgIGxldCBtYXBTY2FsZSA9IElTX01PQklMRSA/IDIgOiAwLjVcclxuXHJcbiAgICBsZXQgbWFwID0gbmV3IE1hcChtYXBTY2FsZSlcclxuICAgIG1hcExheWVyLmFkZENoaWxkKG1hcClcclxuICAgIG1hcC5sb2FkKG1hcERhdGEpXHJcblxyXG4gICAgbWFwLm9uKCd1c2UnLCBvID0+IHtcclxuICAgICAgdGhpcy5pc01hcExvYWRlZCA9IGZhbHNlXHJcbiAgICAgIC8vIGNsZWFyIG9sZCBtYXBcclxuICAgICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLm1hcClcclxuICAgICAgdGhpcy5tYXAuZGVzdHJveSgpXHJcblxyXG4gICAgICB0aGlzLm1hcEZpbGUgPSBvLm1hcFxyXG4gICAgICB0aGlzLnRvUG9zaXRpb24gPSBvLnRvUG9zaXRpb25cclxuICAgICAgdGhpcy5sb2FkTWFwKClcclxuICAgIH0pXHJcblxyXG4gICAgbWFwLmFkZFBsYXllcih0aGlzLmNhdCwgdGhpcy50b1Bvc2l0aW9uKVxyXG4gICAgdGhpcy5tYXAgPSBtYXBcclxuXHJcbiAgICB0aGlzLmlzTWFwTG9hZGVkID0gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgdGljayAoZGVsdGEpIHtcclxuICAgIGlmICghdGhpcy5pc01hcExvYWRlZCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRoaXMubWFwLnRpY2soZGVsdGEpXHJcbiAgICAvLyBGSVhNRTogZ2FwIGJldHdlZW4gdGlsZXMgb24gaVBob25lIFNhZmFyaVxyXG4gICAgdGhpcy5tYXAucG9zaXRpb24uc2V0KFxyXG4gICAgICBNYXRoLmZsb29yKHNjZW5lV2lkdGggLyAyIC0gdGhpcy5jYXQueCksXHJcbiAgICAgIE1hdGguZmxvb3Ioc2NlbmVIZWlnaHQgLyAyIC0gdGhpcy5jYXQueSlcclxuICAgIClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYXlTY2VuZVxyXG4iLCJpbXBvcnQgV2luZG93IGZyb20gJy4vV2luZG93J1xuaW1wb3J0IHsgQ29udGFpbmVyLCBHcmFwaGljcywgVGV4dCwgVGV4dFN0eWxlIH0gZnJvbSAnLi4vbGliL1BJWEknXG5pbXBvcnQgeyBBQklMSVRZX0NBUlJZIH0gZnJvbSAnLi4vY29uZmlnL2NvbnN0YW50cydcblxuY2xhc3MgU2xvdCBleHRlbmRzIENvbnRhaW5lciB7XG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KVxuXG4gICAgbGV0IHJlY3QgPSBuZXcgR3JhcGhpY3MoKVxuICAgIHJlY3QuYmVnaW5GaWxsKDB4QTJBMkEyKVxuICAgIHJlY3QuZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDUpXG4gICAgcmVjdC5lbmRGaWxsKClcbiAgICB0aGlzLmFkZENoaWxkKHJlY3QpXG4gIH1cblxuICBzZXRDb250ZXh0IChpdGVtLCBjb3VudCkge1xuICAgIHRoaXMuY2xlYXJDb250ZXh0KClcblxuICAgIGxldCB3aWR0aCA9IHRoaXMud2lkdGhcbiAgICBsZXQgaGVpZ2h0ID0gdGhpcy5oZWlnaHRcbiAgICAvLyDnva7kuK1cbiAgICBpdGVtID0gbmV3IGl0ZW0uY29uc3RydWN0b3IoKVxuICAgIGxldCBtYXhTaWRlID0gTWF0aC5tYXgoaXRlbS53aWR0aCwgaXRlbS5oZWlnaHQpXG4gICAgbGV0IHNjYWxlID0gd2lkdGggLyBtYXhTaWRlXG4gICAgaXRlbS5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlKVxuICAgIGl0ZW0uYW5jaG9yLnNldCgwLjUsIDAuNSlcbiAgICBpdGVtLnBvc2l0aW9uLnNldCh3aWR0aCAvIDIsIGhlaWdodCAvIDIpXG4gICAgdGhpcy5hZGRDaGlsZChpdGVtKVxuXG4gICAgLy8g5pW46YePXG4gICAgbGV0IGZvbnRTaXplID0gdGhpcy53aWR0aCAqIDAuM1xuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgZmlsbDogJ3JlZCcsXG4gICAgICBmb250V2VpZ2h0OiAnNjAwJyxcbiAgICAgIGxpbmVIZWlnaHQ6IGZvbnRTaXplXG4gICAgfSlcbiAgICBsZXQgY291bnRUZXh0ID0gY291bnQgPT09IEluZmluaXR5ID8gJ+KInicgOiBjb3VudFxuICAgIGxldCB0ZXh0ID0gbmV3IFRleHQoY291bnRUZXh0LCBzdHlsZSlcbiAgICB0ZXh0LnBvc2l0aW9uLnNldCh3aWR0aCAqIDAuOTUsIGhlaWdodClcbiAgICB0ZXh0LmFuY2hvci5zZXQoMSwgMSlcbiAgICB0aGlzLmFkZENoaWxkKHRleHQpXG5cbiAgICB0aGlzLml0ZW0gPSBpdGVtXG4gICAgdGhpcy50ZXh0ID0gdGV4dFxuICB9XG5cbiAgY2xlYXJDb250ZXh0ICgpIHtcbiAgICBpZiAodGhpcy5pdGVtKSB7XG4gICAgICB0aGlzLml0ZW0uZGVzdHJveSgpXG4gICAgICB0aGlzLnRleHQuZGVzdHJveSgpXG4gICAgICBkZWxldGUgdGhpcy5pdGVtXG4gICAgICBkZWxldGUgdGhpcy50ZXh0XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEludmVudG9yeVdpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBsZXQgeyBwbGF5ZXIsIHdpZHRoIH0gPSBvcHRcbiAgICBsZXQgcGFkZGluZyA9IHdpZHRoICogMC4xXG4gICAgbGV0IGNlaWxTaXplID0gd2lkdGggLSBwYWRkaW5nICogMlxuICAgIGxldCBjZWlsT3B0ID0ge1xuICAgICAgeDogcGFkZGluZyxcbiAgICAgIHk6IHBhZGRpbmcsXG4gICAgICB3aWR0aDogY2VpbFNpemUsXG4gICAgICBoZWlnaHQ6IGNlaWxTaXplXG4gICAgfVxuICAgIGxldCBzbG90Q291bnQgPSA0XG4gICAgb3B0LmhlaWdodCA9ICh3aWR0aCAtIHBhZGRpbmcpICogc2xvdENvdW50ICsgcGFkZGluZ1xuXG4gICAgc3VwZXIob3B0KVxuXG4gICAgdGhpcy5fb3B0ID0gb3B0XG4gICAgcGxheWVyLm9uKCdpbnZlbnRvcnktbW9kaWZpZWQnLCB0aGlzLm9uSW52ZW50b3J5TW9kaWZpZWQuYmluZCh0aGlzLCBwbGF5ZXIpKVxuXG4gICAgdGhpcy5zbG90Q29udGFpbmVycyA9IFtdXG4gICAgdGhpcy5zbG90cyA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbG90Q291bnQ7IGkrKykge1xuICAgICAgbGV0IHNsb3QgPSBuZXcgU2xvdChjZWlsT3B0KVxuICAgICAgdGhpcy5hZGRDaGlsZChzbG90KVxuICAgICAgdGhpcy5zbG90Q29udGFpbmVycy5wdXNoKHNsb3QpXG4gICAgICBjZWlsT3B0LnkgKz0gY2VpbFNpemUgKyBwYWRkaW5nXG4gICAgfVxuXG4gICAgdGhpcy5vbkludmVudG9yeU1vZGlmaWVkKHBsYXllcilcbiAgfVxuXG4gIG9uSW52ZW50b3J5TW9kaWZpZWQgKHBsYXllcikge1xuICAgIGxldCBjYXJyeUFiaWxpdHkgPSBwbGF5ZXJbQUJJTElUWV9DQVJSWV1cbiAgICBpZiAoIWNhcnJ5QWJpbGl0eSkge1xuICAgICAgLy8gbm8gaW52ZW50b3J5IHlldFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBpID0gMFxuICAgIGNhcnJ5QWJpbGl0eS5iYWdzLmZvckVhY2goYmFnID0+IGJhZy5mb3JFYWNoKHNsb3QgPT4ge1xuICAgICAgdGhpcy5zbG90c1tpXSA9IHNsb3RcbiAgICAgIGkrK1xuICAgIH0pKVxuICAgIHRoaXMuc2xvdENvbnRhaW5lcnMuZm9yRWFjaCgoY29udGFpbmVyLCBpKSA9PiB7XG4gICAgICBsZXQgc2xvdCA9IHRoaXMuc2xvdHNbaV1cbiAgICAgIGlmIChzbG90KSB7XG4gICAgICAgIGNvbnRhaW5lci5zZXRDb250ZXh0KHNsb3QuaXRlbSwgc2xvdC5jb3VudClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRhaW5lci5jbGVhckNvbnRleHQoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuICd3aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW52ZW50b3J5V2luZG93XG4iLCJpbXBvcnQgeyBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcblxuaW1wb3J0IFNjcm9sbGFibGVXaW5kb3cgZnJvbSAnLi9TY3JvbGxhYmxlV2luZG93J1xuaW1wb3J0IG1lc3NhZ2VzIGZyb20gJy4uL2xpYi9NZXNzYWdlcydcblxuY2xhc3MgTWVzc2FnZVdpbmRvdyBleHRlbmRzIFNjcm9sbGFibGVXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIob3B0KVxuXG4gICAgbGV0IHsgZm9udFNpemUgPSAxMiB9ID0gb3B0XG5cbiAgICBsZXQgc3R5bGUgPSBuZXcgVGV4dFN0eWxlKHtcbiAgICAgIGZvbnRTaXplOiBmb250U2l6ZSxcbiAgICAgIGZpbGw6ICdncmVlbicsXG4gICAgICBicmVha1dvcmRzOiB0cnVlLFxuICAgICAgd29yZFdyYXA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoOiB0aGlzLndpbmRvd1dpZHRoXG4gICAgfSlcbiAgICBsZXQgdGV4dCA9IG5ldyBUZXh0KCcnLCBzdHlsZSlcblxuICAgIHRoaXMuYWRkV2luZG93Q2hpbGQodGV4dClcbiAgICB0aGlzLnRleHQgPSB0ZXh0XG5cbiAgICB0aGlzLmF1dG9TY3JvbGxUb0JvdHRvbSA9IHRydWVcblxuICAgIG1lc3NhZ2VzLm9uKCdtb2RpZmllZCcsIHRoaXMubW9kaWZpZWQuYmluZCh0aGlzKSlcbiAgfVxuXG4gIG1vZGlmaWVkICgpIHtcbiAgICBsZXQgc2Nyb2xsUGVyY2VudCA9IHRoaXMuc2Nyb2xsUGVyY2VudFxuICAgIHRoaXMudGV4dC50ZXh0ID0gW10uY29uY2F0KG1lc3NhZ2VzLmxpc3QpLnJldmVyc2UoKS5qb2luKCdcXG4nKVxuICAgIHRoaXMudXBkYXRlU2Nyb2xsQmFyTGVuZ3RoKClcblxuICAgIC8vIOiLpXNjcm9sbOe9ruW6le+8jOiHquWLleaNsuWLlee9ruW6lVxuICAgIGlmIChzY3JvbGxQZXJjZW50ID09PSAxKSB7XG4gICAgICB0aGlzLnNjcm9sbFRvKDEpXG4gICAgfVxuICB9XG5cbiAgYWRkIChtc2cpIHtcbiAgICBtZXNzYWdlcy5hZGQobXNnKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnbWVzc2FnZS13aW5kb3cnXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZVdpbmRvd1xuIiwiaW1wb3J0IHsgQ29udGFpbmVyLCBUZXh0LCBUZXh0U3R5bGUgfSBmcm9tICcuLi9saWIvUElYSSdcblxuaW1wb3J0IFdpbmRvdyBmcm9tICcuL1dpbmRvdydcbmltcG9ydCB7IEFCSUxJVFlfTU9WRSwgQUJJTElUWV9DQU1FUkEsIEFCSUxJVFlfT1BFUkFURSwgQUJJTElUWV9DQVJSWSwgQUJJTElUWV9QTEFDRSB9IGZyb20gJy4uL2NvbmZpZy9jb25zdGFudHMnXG5cbmNvbnN0IEFCSUxJVElFU19BTEwgPSBbXG4gIEFCSUxJVFlfTU9WRSxcbiAgQUJJTElUWV9DQU1FUkEsXG4gIEFCSUxJVFlfT1BFUkFURSxcbiAgQUJJTElUWV9QTEFDRVxuXVxuXG5jbGFzcyBQbGF5ZXJXaW5kb3cgZXh0ZW5kcyBXaW5kb3cge1xuICBjb25zdHJ1Y3RvciAob3B0KSB7XG4gICAgc3VwZXIob3B0KVxuICAgIGxldCB7IHBsYXllciB9ID0gb3B0XG4gICAgdGhpcy5fb3B0ID0gb3B0XG4gICAgcGxheWVyLm9uKCdhYmlsaXR5LWNhcnJ5JywgdGhpcy5vbkFiaWxpdHlDYXJyeS5iaW5kKHRoaXMsIHBsYXllcikpXG5cbiAgICB0aGlzLmFiaWxpdHlUZXh0Q29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpXG4gICAgdGhpcy5hYmlsaXR5VGV4dENvbnRhaW5lci54ID0gNVxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5hYmlsaXR5VGV4dENvbnRhaW5lcilcblxuICAgIHRoaXMub25BYmlsaXR5Q2FycnkocGxheWVyKVxuICB9XG5cbiAgb25BYmlsaXR5Q2FycnkgKHBsYXllcikge1xuICAgIGxldCBpID0gMFxuICAgIGxldCB7IGZvbnRTaXplID0gMTAgfSA9IHRoaXMuX29wdFxuICAgIGxldCBzdHlsZSA9IG5ldyBUZXh0U3R5bGUoe1xuICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgZmlsbDogJ2dyZWVuJyxcbiAgICAgIGxpbmVIZWlnaHQ6IGZvbnRTaXplXG4gICAgfSlcblxuICAgIC8vIOabtOaWsOmdouadv+aVuOaTmlxuICAgIGxldCBjb250aWFuZXIgPSB0aGlzLmFiaWxpdHlUZXh0Q29udGFpbmVyXG4gICAgY29udGlhbmVyLnJlbW92ZUNoaWxkcmVuKClcbiAgICBBQklMSVRJRVNfQUxMLmZvckVhY2goYWJpbGl0eVN5bWJvbCA9PiB7XG4gICAgICBsZXQgYWJpbGl0eSA9IHBsYXllci5hYmlsaXRpZXNbYWJpbGl0eVN5bWJvbF1cbiAgICAgIGlmIChhYmlsaXR5KSB7XG4gICAgICAgIGxldCB0ZXh0ID0gbmV3IFRleHQoYWJpbGl0eS50b1N0cmluZygpLCBzdHlsZSlcbiAgICAgICAgdGV4dC55ID0gaSAqIChmb250U2l6ZSArIDUpXG5cbiAgICAgICAgY29udGlhbmVyLmFkZENoaWxkKHRleHQpXG5cbiAgICAgICAgaSsrXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gJ3dpbmRvdydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXJXaW5kb3dcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuaW1wb3J0IFdpbmRvdyBmcm9tICcuL1dpbmRvdydcbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vV3JhcHBlcidcblxuY2xhc3MgU2Nyb2xsYWJsZVdpbmRvdyBleHRlbmRzIFdpbmRvdyB7XG4gIGNvbnN0cnVjdG9yIChvcHQpIHtcbiAgICBzdXBlcihvcHQpXG4gICAgbGV0IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcGFkZGluZyA9IDgsXG4gICAgICBzY3JvbGxCYXJXaWR0aCA9IDEwXG4gICAgfSA9IG9wdFxuICAgIHRoaXMuX29wdCA9IG9wdFxuXG4gICAgdGhpcy5faW5pdFNjcm9sbGFibGVBcmVhKFxuICAgICAgd2lkdGggLSBwYWRkaW5nICogMiAtIHNjcm9sbEJhcldpZHRoIC0gNSxcbiAgICAgIGhlaWdodCAtIHBhZGRpbmcgKiAyLFxuICAgICAgcGFkZGluZylcbiAgICB0aGlzLl9pbml0U2Nyb2xsQmFyKHtcbiAgICAgIC8vIHdpbmRvdyB3aWR0aCAtIHdpbmRvdyBwYWRkaW5nIC0gYmFyIHdpZHRoXG4gICAgICB4OiB3aWR0aCAtIHBhZGRpbmcgLSBzY3JvbGxCYXJXaWR0aCxcbiAgICAgIHk6IHBhZGRpbmcsXG4gICAgICB3aWR0aDogc2Nyb2xsQmFyV2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodCAtIHBhZGRpbmcgKiAyXG4gICAgfSlcbiAgfVxuXG4gIF9pbml0U2Nyb2xsYWJsZUFyZWEgKHdpZHRoLCBoZWlnaHQsIHBhZGRpbmcpIHtcbiAgICAvLyBob2xkIHBhZGRpbmdcbiAgICBsZXQgX21haW5WaWV3ID0gbmV3IENvbnRhaW5lcigpXG4gICAgX21haW5WaWV3LnBvc2l0aW9uLnNldChwYWRkaW5nLCBwYWRkaW5nKVxuICAgIHRoaXMuYWRkQ2hpbGQoX21haW5WaWV3KVxuXG4gICAgdGhpcy5tYWluVmlldyA9IG5ldyBDb250YWluZXIoKVxuICAgIF9tYWluVmlldy5hZGRDaGlsZCh0aGlzLm1haW5WaWV3KVxuXG4gICAgLy8gaGlkZSBtYWluVmlldydzIG92ZXJmbG93XG4gICAgbGV0IG1hc2sgPSBuZXcgR3JhcGhpY3MoKVxuICAgIG1hc2suYmVnaW5GaWxsKDB4RkZGRkZGKVxuICAgIG1hc2suZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDUpXG4gICAgbWFzay5lbmRGaWxsKClcbiAgICB0aGlzLm1haW5WaWV3Lm1hc2sgPSBtYXNrXG4gICAgX21haW5WaWV3LmFkZENoaWxkKG1hc2spXG5cbiAgICAvLyB3aW5kb3cgd2lkdGggLSB3aW5kb3cgcGFkZGluZyAqIDIgLSBiYXIgd2lkdGggLSBiZXR3ZWVuIHNwYWNlXG4gICAgdGhpcy5fd2luZG93V2lkdGggPSB3aWR0aFxuICAgIHRoaXMuX3dpbmRvd0hlaWdodCA9IGhlaWdodFxuICB9XG5cbiAgX2luaXRTY3JvbGxCYXIgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgbGV0IGNvbmF0aW5lciA9IG5ldyBDb250YWluZXIoKVxuICAgIGNvbmF0aW5lci54ID0geFxuICAgIGNvbmF0aW5lci55ID0geVxuXG4gICAgbGV0IHNjcm9sbEJhckJnID0gbmV3IEdyYXBoaWNzKClcbiAgICBzY3JvbGxCYXJCZy5iZWdpbkZpbGwoMHhBOEE4QTgpXG4gICAgc2Nyb2xsQmFyQmcuZHJhd1JvdW5kZWRSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQsIDIpXG4gICAgc2Nyb2xsQmFyQmcuZW5kRmlsbCgpXG5cbiAgICBsZXQgc2Nyb2xsQmFyID0gbmV3IEdyYXBoaWNzKClcbiAgICBzY3JvbGxCYXIuYmVnaW5GaWxsKDB4MjIyMjIyKVxuICAgIHNjcm9sbEJhci5kcmF3Um91bmRlZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgMylcbiAgICBzY3JvbGxCYXIuZW5kRmlsbCgpXG4gICAgc2Nyb2xsQmFyLnRvU3RyaW5nID0gKCkgPT4gJ3Njcm9sbEJhcidcbiAgICBXcmFwcGVyLmRyYWdnYWJsZShzY3JvbGxCYXIsIHtcbiAgICAgIGJvdW5kYXJ5OiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDAsXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgIH1cbiAgICB9KVxuICAgIHNjcm9sbEJhci5vbignZHJhZycsIHRoaXMuc2Nyb2xsTWFpblZpZXcuYmluZCh0aGlzKSlcblxuICAgIGNvbmF0aW5lci5hZGRDaGlsZChzY3JvbGxCYXJCZylcbiAgICBjb25hdGluZXIuYWRkQ2hpbGQoc2Nyb2xsQmFyKVxuICAgIHRoaXMuYWRkQ2hpbGQoY29uYXRpbmVyKVxuICAgIHRoaXMuc2Nyb2xsQmFyID0gc2Nyb2xsQmFyXG4gICAgdGhpcy5zY3JvbGxCYXJCZyA9IHNjcm9sbEJhckJnXG4gIH1cblxuICAvLyDmjbLli5XoppbnqpdcbiAgc2Nyb2xsTWFpblZpZXcgKCkge1xuICAgIHRoaXMubWFpblZpZXcueSA9ICh0aGlzLndpbmRvd0hlaWdodCAtIHRoaXMubWFpblZpZXcuaGVpZ2h0KSAqIHRoaXMuc2Nyb2xsUGVyY2VudFxuICB9XG5cbiAgLy8g5paw5aKe54mp5Lu26Iez6KaW56qXXG4gIGFkZFdpbmRvd0NoaWxkIChjaGlsZCkge1xuICAgIHRoaXMubWFpblZpZXcuYWRkQ2hpbGQoY2hpbGQpXG4gIH1cblxuICAvLyDmm7TmlrDmjbLli5Xmo5LlpKflsI8sIOS4jeS4gOWumuimgeiqv+eUqFxuICB1cGRhdGVTY3JvbGxCYXJMZW5ndGggKCkge1xuICAgIGxldCB7IHNjcm9sbEJhck1pbkhlaWdodCA9IDIwIH0gPSB0aGlzLl9vcHRcblxuICAgIGxldCBkaCA9IHRoaXMubWFpblZpZXcuaGVpZ2h0IC8gdGhpcy53aW5kb3dIZWlnaHRcbiAgICBpZiAoZGggPCAxKSB7XG4gICAgICB0aGlzLnNjcm9sbEJhci5oZWlnaHQgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNjcm9sbEJhci5oZWlnaHQgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodCAvIGRoXG4gICAgICAvLyDpgb/lhY3lpKrlsI/lvojpm6Pmi5bmm7NcbiAgICAgIHRoaXMuc2Nyb2xsQmFyLmhlaWdodCA9IE1hdGgubWF4KHNjcm9sbEJhck1pbkhlaWdodCwgdGhpcy5zY3JvbGxCYXIuaGVpZ2h0KVxuICAgIH1cbiAgICB0aGlzLnNjcm9sbEJhci5mYWxsYmFja1RvQm91bmRhcnkoKVxuICB9XG5cbiAgLy8g5o2y5YuV55m+5YiG5q+UXG4gIGdldCBzY3JvbGxQZXJjZW50ICgpIHtcbiAgICBsZXQgZGVsdGEgPSB0aGlzLnNjcm9sbEJhckJnLmhlaWdodCAtIHRoaXMuc2Nyb2xsQmFyLmhlaWdodFxuICAgIHJldHVybiBkZWx0YSA9PT0gMCA/IDEgOiB0aGlzLnNjcm9sbEJhci55IC8gZGVsdGFcbiAgfVxuXG4gIC8vIOaNsuWLleiHs+eZvuWIhuavlFxuICBzY3JvbGxUbyAocGVyY2VudCkge1xuICAgIGxldCBkZWx0YSA9IHRoaXMuc2Nyb2xsQmFyQmcuaGVpZ2h0IC0gdGhpcy5zY3JvbGxCYXIuaGVpZ2h0XG4gICAgbGV0IHkgPSAwXG4gICAgaWYgKGRlbHRhICE9PSAwKSB7XG4gICAgICB5ID0gZGVsdGEgKiBwZXJjZW50XG4gICAgfVxuICAgIHRoaXMuc2Nyb2xsQmFyLnkgPSB5XG4gICAgdGhpcy5zY3JvbGxNYWluVmlldygpXG4gIH1cblxuICBnZXQgd2luZG93V2lkdGggKCkge1xuICAgIHJldHVybiB0aGlzLl93aW5kb3dXaWR0aFxuICB9XG5cbiAgZ2V0IHdpbmRvd0hlaWdodCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpbmRvd0hlaWdodFxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjcm9sbGFibGVXaW5kb3dcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi9saWIvVmVjdG9yJ1xyXG5cclxuaW1wb3J0IGtleWJvYXJkSlMgZnJvbSAna2V5Ym9hcmRqcydcclxuaW1wb3J0IHsgTEVGVCwgVVAsIFJJR0hULCBET1dOIH0gZnJvbSAnLi4vY29uZmlnL2NvbnRyb2wnXHJcblxyXG5jb25zdCBBTExfS0VZUyA9IFtSSUdIVCwgTEVGVCwgVVAsIERPV05dXHJcblxyXG5jbGFzcyBUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgcmFkaXVzIH0pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXHJcblxyXG4gICAgbGV0IHRvdWNoQXJlYSA9IG5ldyBHcmFwaGljcygpXHJcbiAgICB0b3VjaEFyZWEuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXHJcbiAgICB0b3VjaEFyZWEuZHJhd0NpcmNsZSgwLCAwLCByYWRpdXMpXHJcbiAgICB0b3VjaEFyZWEuZW5kRmlsbCgpXHJcbiAgICB0aGlzLmFkZENoaWxkKHRvdWNoQXJlYSlcclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzXHJcblxyXG4gICAgdGhpcy5zZXR1cFRvdWNoKClcclxuICB9XHJcblxyXG4gIHNldHVwVG91Y2ggKCkge1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgIGxldCBmID0gdGhpcy5vblRvdWNoLmJpbmQodGhpcylcclxuICAgIHRoaXMub24oJ3RvdWNoc3RhcnQnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2hlbmQnLCBmKVxyXG4gICAgdGhpcy5vbigndG91Y2htb3ZlJywgZilcclxuICAgIHRoaXMub24oJ3RvdWNoZW5kb3V0c2lkZScsIGYpXHJcbiAgfVxyXG5cclxuICBvblRvdWNoIChlKSB7XHJcbiAgICBsZXQgdHlwZSA9IGUudHlwZVxyXG4gICAgbGV0IHByb3BhZ2F0aW9uID0gZmFsc2VcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcclxuICAgICAgICB0aGlzLmRyYWcgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcclxuICAgICAgICB0aGlzLmNyZWF0ZURyYWdQb2ludCgpXHJcbiAgICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbiA9IHtcclxuICAgICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICAgIHk6IHRoaXMueVxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICd0b3VjaGVuZCc6XHJcbiAgICAgIGNhc2UgJ3RvdWNoZW5kb3V0c2lkZSc6XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgICAgdGhpcy5kcmFnID0gZmFsc2VcclxuICAgICAgICAgIHRoaXMuZGVzdHJveURyYWdQb2ludCgpXHJcbiAgICAgICAgICB0aGlzLnJlbGVhc2VLZXlzKClcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAndG91Y2htb3ZlJzpcclxuICAgICAgICBpZiAoIXRoaXMuZHJhZykge1xyXG4gICAgICAgICAgcHJvcGFnYXRpb24gPSB0cnVlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZXNzS2V5cyhlLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzKSlcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gICAgaWYgKCFwcm9wYWdhdGlvbikge1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjcmVhdGVEcmFnUG9pbnQgKCkge1xyXG4gICAgbGV0IGRyYWdQb2ludCA9IG5ldyBHcmFwaGljcygpXHJcbiAgICBkcmFnUG9pbnQuYmVnaW5GaWxsKDB4RjJGMkYyLCAwLjUpXHJcbiAgICBkcmFnUG9pbnQuZHJhd0NpcmNsZSgwLCAwLCAyMClcclxuICAgIGRyYWdQb2ludC5lbmRGaWxsKClcclxuICAgIHRoaXMuYWRkQ2hpbGQoZHJhZ1BvaW50KVxyXG4gICAgdGhpcy5kcmFnUG9pbnQgPSBkcmFnUG9pbnRcclxuICB9XHJcblxyXG4gIGRlc3Ryb3lEcmFnUG9pbnQgKCkge1xyXG4gICAgdGhpcy5yZW1vdmVDaGlsZCh0aGlzLmRyYWdQb2ludClcclxuICAgIHRoaXMuZHJhZ1BvaW50LmRlc3Ryb3koKVxyXG4gIH1cclxuXHJcbiAgcHJlc3NLZXlzIChuZXdQb2ludCkge1xyXG4gICAgdGhpcy5yZWxlYXNlS2V5cygpXHJcbiAgICAvLyDmhJ/mh4npnYjmlY/luqZcclxuICAgIGxldCB0aHJlc2hvbGQgPSAzMFxyXG5cclxuICAgIGxldCB2ZWN0b3IgPSBWZWN0b3IuZnJvbVBvaW50KG5ld1BvaW50KVxyXG4gICAgbGV0IGRlZyA9IHZlY3Rvci5kZWdcclxuICAgIGxldCBsZW4gPSB2ZWN0b3IubGVuZ3RoXHJcblxyXG4gICAgaWYgKGxlbiA8IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGxldCBkZWdBYnMgPSBNYXRoLmFicyhkZWcpXHJcbiAgICBsZXQgZHggPSBkZWdBYnMgPCA2Ny41ID8gUklHSFQgOiAoZGVnQWJzID4gMTEyLjUgPyBMRUZUIDogZmFsc2UpXHJcbiAgICBsZXQgZHkgPSBkZWdBYnMgPCAyMi41IHx8IGRlZ0FicyA+IDE1Ny41ID8gZmFsc2UgOiAoZGVnIDwgMCA/IFVQIDogRE9XTilcclxuXHJcbiAgICBpZiAoZHggfHwgZHkpIHtcclxuICAgICAgaWYgKGR4KSB7XHJcbiAgICAgICAga2V5Ym9hcmRKUy5wcmVzc0tleShkeClcclxuICAgICAgfVxyXG4gICAgICBpZiAoZHkpIHtcclxuICAgICAgICBrZXlib2FyZEpTLnByZXNzS2V5KGR5KVxyXG4gICAgICB9XHJcbiAgICAgIHZlY3Rvci5tdWx0aXBseVNjYWxhcih0aGlzLnJhZGl1cyAvIGxlbilcclxuICAgICAgdGhpcy5kcmFnUG9pbnQucG9zaXRpb24uc2V0KFxyXG4gICAgICAgIHZlY3Rvci54LFxyXG4gICAgICAgIHZlY3Rvci55XHJcbiAgICAgIClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbGVhc2VLZXlzICgpIHtcclxuICAgIEFMTF9LRVlTLmZvckVhY2goa2V5ID0+IGtleWJvYXJkSlMucmVsZWFzZUtleShrZXkpKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdUb3VjaERpcmVjdGlvbkNvbnRyb2xQYW5lbCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvdWNoRGlyZWN0aW9uQ29udHJvbFBhbmVsXHJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcclxuaW1wb3J0IFZlY3RvciBmcm9tICcuLi9saWIvVmVjdG9yJ1xyXG5cclxuaW1wb3J0IGdsb2JhbEV2ZW50TWFuYWdlciBmcm9tICcuLi9saWIvZ2xvYmFsRXZlbnRNYW5hZ2VyJ1xyXG5cclxuY2xhc3MgVG91Y2hPcGVyYXRpb25Db250cm9sUGFuZWwgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yICh7IHgsIHksIHdpZHRoLCBoZWlnaHQgfSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSlcclxuXHJcbiAgICBsZXQgdG91Y2hBcmVhID0gbmV3IEdyYXBoaWNzKClcclxuICAgIHRvdWNoQXJlYS5iZWdpbkZpbGwoMHhGMkYyRjIsIDAuNSlcclxuICAgIHRvdWNoQXJlYS5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KVxyXG4gICAgdG91Y2hBcmVhLmVuZEZpbGwoKVxyXG4gICAgdGhpcy5hZGRDaGlsZCh0b3VjaEFyZWEpXHJcblxyXG4gICAgdGhpcy5zZXR1cFRvdWNoKClcclxuICB9XHJcblxyXG4gIHNldHVwVG91Y2ggKCkge1xyXG4gICAgdGhpcy5jZW50ZXIgPSBuZXcgVmVjdG9yKHRoaXMud2lkdGggLyAyLCB0aGlzLmhlaWdodCAvIDIpXHJcbiAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgbGV0IGYgPSB0aGlzLm9uVG91Y2guYmluZCh0aGlzKVxyXG4gICAgdGhpcy5vbigndG91Y2hzdGFydCcsIGYpXHJcbiAgfVxyXG5cclxuICBvblRvdWNoIChlKSB7XHJcbiAgICBsZXQgcG9pbnRlciA9IGUuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHRoaXMpXHJcbiAgICBsZXQgdmVjdG9yID0gVmVjdG9yLmZyb21Qb2ludChwb2ludGVyKS5zdWIodGhpcy5jZW50ZXIpXHJcbiAgICBnbG9iYWxFdmVudE1hbmFnZXIuZW1pdCgncm90YXRlJywgdmVjdG9yKVxyXG4gICAgZ2xvYmFsRXZlbnRNYW5hZ2VyLmVtaXQoJ2ZpcmUnKVxyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuICdUb3VjaE9wZXJhdGlvbkNvbnRyb2xQYW5lbCdcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRvdWNoT3BlcmF0aW9uQ29udHJvbFBhbmVsXHJcbiIsImltcG9ydCB7IENvbnRhaW5lciwgR3JhcGhpY3MgfSBmcm9tICcuLi9saWIvUElYSSdcblxuY2xhc3MgV2luZG93IGV4dGVuZHMgQ29udGFpbmVyIHtcbiAgY29uc3RydWN0b3IgKHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHkpXG5cbiAgICBsZXQgbGluZVdpZHRoID0gM1xuXG4gICAgbGV0IHdpbmRvd0JnID0gbmV3IEdyYXBoaWNzKClcbiAgICB3aW5kb3dCZy5iZWdpbkZpbGwoMHhGMkYyRjIpXG4gICAgd2luZG93QmcubGluZVN0eWxlKGxpbmVXaWR0aCwgMHgyMjIyMjIsIDEpXG4gICAgd2luZG93QmcuZHJhd1JvdW5kZWRSZWN0KFxuICAgICAgMCwgMCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgNSlcbiAgICB3aW5kb3dCZy5lbmRGaWxsKClcbiAgICB0aGlzLmFkZENoaWxkKHdpbmRvd0JnKVxuICB9XG5cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiAnd2luZG93J1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpbmRvd1xuIiwiY29uc3QgT1BUID0gU3ltYm9sKCdvcHQnKVxuXG5mdW5jdGlvbiBfZW5hYmxlRHJhZ2dhYmxlICgpIHtcbiAgdGhpcy5kcmFnID0gZmFsc2VcbiAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcbiAgbGV0IGYgPSBfb25Ub3VjaC5iaW5kKHRoaXMpXG4gIHRoaXMub24oJ3RvdWNoc3RhcnQnLCBmKVxuICB0aGlzLm9uKCd0b3VjaGVuZCcsIGYpXG4gIHRoaXMub24oJ3RvdWNobW92ZScsIGYpXG4gIHRoaXMub24oJ3RvdWNoZW5kb3V0c2lkZScsIGYpXG4gIHRoaXMub24oJ21vdXNlZG93bicsIGYpXG4gIHRoaXMub24oJ21vdXNldXAnLCBmKVxuICB0aGlzLm9uKCdtb3VzZW1vdmUnLCBmKVxuICB0aGlzLm9uKCdtb3VzZXVwb3V0c2lkZScsIGYpXG59XG5cbmZ1bmN0aW9uIF9vblRvdWNoIChlKSB7XG4gIGxldCB0eXBlID0gZS50eXBlXG4gIGxldCBwcm9wYWdhdGlvbiA9IGZhbHNlXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxuICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICB0aGlzLmRyYWcgPSBlLmRhdGEuZ2xvYmFsLmNsb25lKClcbiAgICAgIHRoaXMub3JpZ2luUG9zaXRpb24gPSB7XG4gICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgeTogdGhpcy55XG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ3RvdWNoZW5kJzpcbiAgICBjYXNlICd0b3VjaGVuZG91dHNpZGUnOlxuICAgIGNhc2UgJ21vdXNldXAnOlxuICAgIGNhc2UgJ21vdXNldXBvdXRzaWRlJzpcbiAgICAgIHRoaXMuZHJhZyA9IGZhbHNlXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3RvdWNobW92ZSc6XG4gICAgY2FzZSAnbW91c2Vtb3ZlJzpcbiAgICAgIGlmICghdGhpcy5kcmFnKSB7XG4gICAgICAgIHByb3BhZ2F0aW9uID0gdHJ1ZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgbGV0IG5ld1BvaW50ID0gZS5kYXRhLmdsb2JhbC5jbG9uZSgpXG4gICAgICB0aGlzLnBvc2l0aW9uLnNldChcbiAgICAgICAgdGhpcy5vcmlnaW5Qb3NpdGlvbi54ICsgbmV3UG9pbnQueCAtIHRoaXMuZHJhZy54LFxuICAgICAgICB0aGlzLm9yaWdpblBvc2l0aW9uLnkgKyBuZXdQb2ludC55IC0gdGhpcy5kcmFnLnlcbiAgICAgIClcbiAgICAgIF9mYWxsYmFja1RvQm91bmRhcnkuY2FsbCh0aGlzKVxuICAgICAgdGhpcy5lbWl0KCdkcmFnJykgLy8gbWF5YmUgY2FuIHBhc3MgcGFyYW0gZm9yIHNvbWUgcmVhc29uOiBlLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzKVxuICAgICAgYnJlYWtcbiAgfVxuICBpZiAoIXByb3BhZ2F0aW9uKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICB9XG59XG5cbi8vIOmAgOWbnumCiueVjFxuZnVuY3Rpb24gX2ZhbGxiYWNrVG9Cb3VuZGFyeSAoKSB7XG4gIGxldCB7IHdpZHRoID0gdGhpcy53aWR0aCwgaGVpZ2h0ID0gdGhpcy5oZWlnaHQsIGJvdW5kYXJ5IH0gPSB0aGlzW09QVF1cbiAgdGhpcy54ID0gTWF0aC5tYXgodGhpcy54LCBib3VuZGFyeS54KVxuICB0aGlzLnggPSBNYXRoLm1pbih0aGlzLngsIGJvdW5kYXJ5LnggKyBib3VuZGFyeS53aWR0aCAtIHdpZHRoKVxuICB0aGlzLnkgPSBNYXRoLm1heCh0aGlzLnksIGJvdW5kYXJ5LnkpXG4gIHRoaXMueSA9IE1hdGgubWluKHRoaXMueSwgYm91bmRhcnkueSArIGJvdW5kYXJ5LmhlaWdodCAtIGhlaWdodClcbn1cbmNsYXNzIFdyYXBwZXIge1xuICAvKipcbiAgICogZGlzcGxheU9iamVjdDogd2lsbCB3cmFwcGVkIERpc3BsYXlPYmplY3RcbiAgICogb3B0OiB7XG4gICAqICBib3VuZGFyeTog5ouW5puz6YKK55WMIHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9XG4gICAqICBbLCB3aWR0aF06IOmCiueVjOeisOaSnuWvrChkZWZhdWx0OiBkaXNwbGF5T2JqZWN0LndpZHRoKVxuICAgKiAgWywgaGVpZ2h0XTog6YKK55WM56Kw5pKe6auYKGRlZmF1bHQ6IGRpc3BsYXlPYmplY3QuaGVpZ2h0KVxuICAgKiAgfVxuICAgKi9cbiAgc3RhdGljIGRyYWdnYWJsZSAoZGlzcGxheU9iamVjdCwgb3B0KSB7XG4gICAgZGlzcGxheU9iamVjdFtPUFRdID0gb3B0XG4gICAgX2VuYWJsZURyYWdnYWJsZS5jYWxsKGRpc3BsYXlPYmplY3QpXG4gICAgZGlzcGxheU9iamVjdC5mYWxsYmFja1RvQm91bmRhcnkgPSBfZmFsbGJhY2tUb0JvdW5kYXJ5XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV3JhcHBlclxuIl19
