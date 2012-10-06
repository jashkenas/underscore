var objects = require('./objects'),
    utils = require('./utils'),
    each = require('./collections').each,
    nativeBind = Function.prototype.bind,
    ArrayProto = Array.prototype,
    push = ArrayProto.push,
    slice = ArrayProto.slice;

// Reusable constructor function for prototype setting.
var ctor = function(){};

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally). Binding with arguments is also known as `curry`.
// Delegates to **ECMAScript 5**'s native `Function.bind` if available.
// We check for `func.bind` first, to fail fast when `func` is undefined.
exports.bind = function bind(func, context) {
  var bound, args;
  if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
  if (!objects.isFunction(func)) throw new TypeError;
  args = slice.call(arguments, 2);
  return bound = function() {
    if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
    ctor.prototype = func.prototype;
    var self = new ctor;
    var result = func.apply(self, args.concat(slice.call(arguments)));
    if (Object(result) === result) return result;
    return self;
  };
};

// Bind all of an object's methods to that object. Useful for ensuring that
// all callbacks defined on an object belong to it.
exports.bindAll = function(obj) {
  var funcs = slice.call(arguments, 1);
  if (funcs.length == 0) funcs = objects.functions(obj);
  each(funcs, function(f) { obj[f] = exports.bind(obj[f], obj); });
  return obj;
};

// Memoize an expensive function by storing its results.
exports.memoize = function(func, hasher) {
  var memo = {};
  hasher || (hasher = utils.identity);
  return function() {
    var key = hasher.apply(this, arguments);
    return objects.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
  };
};

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
exports.delay = function(func, wait) {
  var args = slice.call(arguments, 2);
  return setTimeout(function(){ return func.apply(null, args); }, wait);
};

// Defers a function, scheduling it to run after the current call stack has
// cleared.
exports.defer = function(func) {
  return exports.delay.apply(exports, [func, 1].concat(slice.call(arguments, 1)));
};

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time.
exports.throttle = function(func, wait) {
  var context, args, timeout, throttling, more, result;
  var whenDone = exports.debounce(function(){ more = throttling = false; }, wait);
  return function() {
    context = this; args = arguments;
    var later = function() {
      timeout = null;
      if (more) {
        result = func.apply(context, args);
      }
      whenDone();
    };
    if (!timeout) timeout = setTimeout(later, wait);
    if (throttling) {
      more = true;
    } else {
      throttling = true;
      result = func.apply(context, args);
    }
    whenDone();
    return result;
  };
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
exports.debounce = function(func, wait, immediate) {
  var timeout, result;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) result = func.apply(context, args);
    return result;
  };
};

// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
exports.once = function(func) {
  var ran = false, memo;
  return function() {
    if (ran) return memo;
    ran = true;
    memo = func.apply(this, arguments);
    func = null;
    return memo;
  };
};

// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
exports.wrap = function(func, wrapper) {
  return function() {
    var args = [func];
    push.apply(args, arguments);
    return wrapper.apply(this, args);
  };
};

// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
exports.compose = function() {
  var funcs = arguments;
  return function() {
    var args = arguments;
    for (var i = funcs.length - 1; i >= 0; i--) {
      args = [funcs[i].apply(this, args)];
    }
    return args[0];
  };
};

// Returns a function that will only be executed after being called N times.
exports.after = function(times, func) {
  if (times <= 0) return func();
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
};
