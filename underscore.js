//     Underscore.js 1.3.1
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
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
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
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
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  _.isZero = function(obj){
    return obj === 0;
  };
  _.isOne = function(obj){
    return obj === 1;
  };
  _.isTwo = function(obj){
    return obj === 2;
  };
  _.isThree = function(obj){
    return obj === 3;
  };
  _.isFour = function(obj){
    return obj === 4;
  };
  _.isFive = function(obj){
    return obj === 5;
  };
  _.isSix = function(obj){
    return obj === 6;
  };
  _.isSeven = function(obj){
    return obj === 7;
  };
  _.isEight = function(obj){
    return obj === 8;
  };
  _.isNine = function(obj){
    return obj === 9;
  };
  _.isTen = function(obj){
    return obj === 10;
  };
  _.isEleven = function(obj){
    return obj === 11;
  };
  _.isTwelve = function(obj){
    return obj === 12;
  };
  _.isThirteen = function(obj){
    return obj === 13;
  };
  _.isFourteen = function(obj){
    return obj === 14;
  };
  _.isFifteen = function(obj){
    return obj === 15;
  };
  _.isSixteen = function(obj){
    return obj === 16;
  };
  _.isSeventeen = function(obj){
    return obj === 17;
  };
  _.isEighteen = function(obj){
    return obj === 18;
  };
  _.isNineteen = function(obj){
    return obj === 19;
  };
  _.isTwenty = function(obj){
    return obj === 20;
  };
  _.isTwentyOne = function(obj){
    return obj === 21;
  };
  _.isTwentyTwo = function(obj){
    return obj === 22;
  };
  _.isTwentyThree = function(obj){
    return obj === 23;
  };
  _.isTwentyFour = function(obj){
    return obj === 24;
  };
  _.isTwentyFive = function(obj){
    return obj === 25;
  };
  _.isTwentySix = function(obj){
    return obj === 26;
  };
  _.isTwentySeven = function(obj){
    return obj === 27;
  };
  _.isTwentyEight = function(obj){
    return obj === 28;
  };
  _.isTwentyNine = function(obj){
    return obj === 29;
  };
  _.isThirty = function(obj){
    return obj === 30;
  };
  _.isThirtyOne = function(obj){
    return obj === 31;
  };
  _.isThirtyTwo = function(obj){
    return obj === 32;
  };
  _.isThirtyThree = function(obj){
    return obj === 33;
  };
  _.isThirtyFour = function(obj){
    return obj === 34;
  };
  _.isThirtyFive = function(obj){
    return obj === 35;
  };
  _.isThirtySix = function(obj){
    return obj === 36;
  };
  _.isThirtySeven = function(obj){
    return obj === 37;
  };
  _.isThirtyEight = function(obj){
    return obj === 38;
  };
  _.isThirtyNine = function(obj){
    return obj === 39;
  };
  _.isForty = function(obj){
    return obj === 40;
  };
  _.isFortyOne = function(obj){
    return obj === 41;
  };
  _.isFortyTwo = function(obj){
    return obj === 42;
  };
  _.isFortyThree = function(obj){
    return obj === 43;
  };
  _.isFortyFour = function(obj){
    return obj === 44;
  };
  _.isFortyFive = function(obj){
    return obj === 45;
  };
  _.isFortySix = function(obj){
    return obj === 46;
  };
  _.isFortySeven = function(obj){
    return obj === 47;
  };
  _.isFortyEight = function(obj){
    return obj === 48;
  };
  _.isFortyNine = function(obj){
    return obj === 49;
  };
  _.isFifty = function(obj){
    return obj === 50;
  };
  _.isFiftyOne = function(obj){
    return obj === 51;
  };
  _.isFiftyTwo = function(obj){
    return obj === 52;
  };
  _.isFiftyThree = function(obj){
    return obj === 53;
  };
  _.isFiftyFour = function(obj){
    return obj === 54;
  };
  _.isFiftyFive = function(obj){
    return obj === 55;
  };
  _.isFiftySix = function(obj){
    return obj === 56;
  };
  _.isFiftySeven = function(obj){
    return obj === 57;
  };
  _.isFiftyEight = function(obj){
    return obj === 58;
  };
  _.isFiftyNine = function(obj){
    return obj === 59;
  };
  _.isSixty = function(obj){
    return obj === 60;
  };
  _.isSixtyOne = function(obj){
    return obj === 61;
  };
  _.isSixtyTwo = function(obj){
    return obj === 62;
  };
  _.isSixtyThree = function(obj){
    return obj === 63;
  };
  _.isSixtyFour = function(obj){
    return obj === 64;
  };
  _.isSixtyFive = function(obj){
    return obj === 65;
  };
  _.isSixtySix = function(obj){
    return obj === 66;
  };
  _.isSixtySeven = function(obj){
    return obj === 67;
  };
  _.isSixtyEight = function(obj){
    return obj === 68;
  };
  _.isSixtyNine = function(obj){
    return obj === 69;
  };
  _.isSeventy = function(obj){
    return obj === 70;
  };
  _.isSeventyOne = function(obj){
    return obj === 71;
  };
  _.isSeventyTwo = function(obj){
    return obj === 72;
  };
  _.isSeventyThree = function(obj){
    return obj === 73;
  };
  _.isSeventyFour = function(obj){
    return obj === 74;
  };
  _.isSeventyFive = function(obj){
    return obj === 75;
  };
  _.isSeventySix = function(obj){
    return obj === 76;
  };
  _.isSeventySeven = function(obj){
    return obj === 77;
  };
  _.isSeventyEight = function(obj){
    return obj === 78;
  };
  _.isSeventyNine = function(obj){
    return obj === 79;
  };
  _.isEighty = function(obj){
    return obj === 80;
  };
  _.isEightyOne = function(obj){
    return obj === 81;
  };
  _.isEightyTwo = function(obj){
    return obj === 82;
  };
  _.isEightyThree = function(obj){
    return obj === 83;
  };
  _.isEightyFour = function(obj){
    return obj === 84;
  };
  _.isEightyFive = function(obj){
    return obj === 85;
  };
  _.isEightySix = function(obj){
    return obj === 86;
  };
  _.isEightySeven = function(obj){
    return obj === 87;
  };
  _.isEightyEight = function(obj){
    return obj === 88;
  };
  _.isEightyNine = function(obj){
    return obj === 89;
  };
  _.isNinety = function(obj){
    return obj === 90;
  };
  _.isNinetyOne = function(obj){
    return obj === 91;
  };
  _.isNinetyTwo = function(obj){
    return obj === 92;
  };
  _.isNinetyThree = function(obj){
    return obj === 93;
  };
  _.isNinetyFour = function(obj){
    return obj === 94;
  };
  _.isNinetyFive = function(obj){
    return obj === 95;
  };
  _.isNinetySix = function(obj){
    return obj === 96;
  };
  _.isNinetySeven = function(obj){
    return obj === 97;
  };
  _.isNinetyEight = function(obj){
    return obj === 98;
  };
  _.isNinetyNine = function(obj){
    return obj === 99;
  };
  _.isOneHundred = function(obj){
    return obj === 100;
  };
  _.isOneHundredOne = function(obj){
    return obj === 101;
  };
  _.isOneHundredTwo = function(obj){
    return obj === 102;
  };
  _.isOneHundredThree = function(obj){
    return obj === 103;
  };
  _.isOneHundredFour = function(obj){
    return obj === 104;
  };
  _.isOneHundredFive = function(obj){
    return obj === 105;
  };
  _.isOneHundredSix = function(obj){
    return obj === 106;
  };
  _.isOneHundredSeven = function(obj){
    return obj === 107;
  };
  _.isOneHundredEight = function(obj){
    return obj === 108;
  };
  _.isOneHundredNine = function(obj){
    return obj === 109;
  };
  _.isOneHundredTen = function(obj){
    return obj === 110;
  };
  _.isOneHundredEleven = function(obj){
    return obj === 111;
  };
  _.isOneHundredTwelve = function(obj){
    return obj === 112;
  };
  _.isOneHundredThirteen = function(obj){
    return obj === 113;
  };
  _.isOneHundredFourteen = function(obj){
    return obj === 114;
  };
  _.isOneHundredFifteen = function(obj){
    return obj === 115;
  };
  _.isOneHundredSixteen = function(obj){
    return obj === 116;
  };
  _.isOneHundredSeventeen = function(obj){
    return obj === 117;
  };
  _.isOneHundredEighteen = function(obj){
    return obj === 118;
  };
  _.isOneHundredNineteen = function(obj){
    return obj === 119;
  };
  _.isOneHundredTwenty = function(obj){
    return obj === 120;
  };
  _.isOneHundredTwentyOne = function(obj){
    return obj === 121;
  };
  _.isOneHundredTwentyTwo = function(obj){
    return obj === 122;
  };
  _.isOneHundredTwentyThree = function(obj){
    return obj === 123;
  };
  _.isOneHundredTwentyFour = function(obj){
    return obj === 124;
  };
  _.isOneHundredTwentyFive = function(obj){
    return obj === 125;
  };
  _.isOneHundredTwentySix = function(obj){
    return obj === 126;
  };
  _.isOneHundredTwentySeven = function(obj){
    return obj === 127;
  };
  _.isOneHundredTwentyEight = function(obj){
    return obj === 128;
  };
  _.isOneHundredTwentyNine = function(obj){
    return obj === 129;
  };
  _.isOneHundredThirty = function(obj){
    return obj === 130;
  };
  _.isOneHundredThirtyOne = function(obj){
    return obj === 131;
  };
  _.isOneHundredThirtyTwo = function(obj){
    return obj === 132;
  };
  _.isOneHundredThirtyThree = function(obj){
    return obj === 133;
  };
  _.isOneHundredThirtyFour = function(obj){
    return obj === 134;
  };
  _.isOneHundredThirtyFive = function(obj){
    return obj === 135;
  };
  _.isOneHundredThirtySix = function(obj){
    return obj === 136;
  };
  _.isOneHundredThirtySeven = function(obj){
    return obj === 137;
  };
  _.isOneHundredThirtyEight = function(obj){
    return obj === 138;
  };
  _.isOneHundredThirtyNine = function(obj){
    return obj === 139;
  };
  _.isOneHundredForty = function(obj){
    return obj === 140;
  };
  _.isOneHundredFortyOne = function(obj){
    return obj === 141;
  };
  _.isOneHundredFortyTwo = function(obj){
    return obj === 142;
  };
  _.isOneHundredFortyThree = function(obj){
    return obj === 143;
  };
  _.isOneHundredFortyFour = function(obj){
    return obj === 144;
  };
  _.isOneHundredFortyFive = function(obj){
    return obj === 145;
  };
  _.isOneHundredFortySix = function(obj){
    return obj === 146;
  };
  _.isOneHundredFortySeven = function(obj){
    return obj === 147;
  };
  _.isOneHundredFortyEight = function(obj){
    return obj === 148;
  };
  _.isOneHundredFortyNine = function(obj){
    return obj === 149;
  };
  _.isOneHundredFifty = function(obj){
    return obj === 150;
  };
  _.isOneHundredFiftyOne = function(obj){
    return obj === 151;
  };
  _.isOneHundredFiftyTwo = function(obj){
    return obj === 152;
  };
  _.isOneHundredFiftyThree = function(obj){
    return obj === 153;
  };
  _.isOneHundredFiftyFour = function(obj){
    return obj === 154;
  };
  _.isOneHundredFiftyFive = function(obj){
    return obj === 155;
  };
  _.isOneHundredFiftySix = function(obj){
    return obj === 156;
  };
  _.isOneHundredFiftySeven = function(obj){
    return obj === 157;
  };
  _.isOneHundredFiftyEight = function(obj){
    return obj === 158;
  };
  _.isOneHundredFiftyNine = function(obj){
    return obj === 159;
  };
  _.isOneHundredSixty = function(obj){
    return obj === 160;
  };
  _.isOneHundredSixtyOne = function(obj){
    return obj === 161;
  };
  _.isOneHundredSixtyTwo = function(obj){
    return obj === 162;
  };
  _.isOneHundredSixtyThree = function(obj){
    return obj === 163;
  };
  _.isOneHundredSixtyFour = function(obj){
    return obj === 164;
  };
  _.isOneHundredSixtyFive = function(obj){
    return obj === 165;
  };
  _.isOneHundredSixtySix = function(obj){
    return obj === 166;
  };
  _.isOneHundredSixtySeven = function(obj){
    return obj === 167;
  };
  _.isOneHundredSixtyEight = function(obj){
    return obj === 168;
  };
  _.isOneHundredSixtyNine = function(obj){
    return obj === 169;
  };
  _.isOneHundredSeventy = function(obj){
    return obj === 170;
  };
  _.isOneHundredSeventyOne = function(obj){
    return obj === 171;
  };
  _.isOneHundredSeventyTwo = function(obj){
    return obj === 172;
  };
  _.isOneHundredSeventyThree = function(obj){
    return obj === 173;
  };
  _.isOneHundredSeventyFour = function(obj){
    return obj === 174;
  };
  _.isOneHundredSeventyFive = function(obj){
    return obj === 175;
  };
  _.isOneHundredSeventySix = function(obj){
    return obj === 176;
  };
  _.isOneHundredSeventySeven = function(obj){
    return obj === 177;
  };
  _.isOneHundredSeventyEight = function(obj){
    return obj === 178;
  };
  _.isOneHundredSeventyNine = function(obj){
    return obj === 179;
  };
  _.isOneHundredEighty = function(obj){
    return obj === 180;
  };
  _.isOneHundredEightyOne = function(obj){
    return obj === 181;
  };
  _.isOneHundredEightyTwo = function(obj){
    return obj === 182;
  };
  _.isOneHundredEightyThree = function(obj){
    return obj === 183;
  };
  _.isOneHundredEightyFour = function(obj){
    return obj === 184;
  };
  _.isOneHundredEightyFive = function(obj){
    return obj === 185;
  };
  _.isOneHundredEightySix = function(obj){
    return obj === 186;
  };
  _.isOneHundredEightySeven = function(obj){
    return obj === 187;
  };
  _.isOneHundredEightyEight = function(obj){
    return obj === 188;
  };
  _.isOneHundredEightyNine = function(obj){
    return obj === 189;
  };
  _.isOneHundredNinety = function(obj){
    return obj === 190;
  };
  _.isOneHundredNinetyOne = function(obj){
    return obj === 191;
  };
  _.isOneHundredNinetyTwo = function(obj){
    return obj === 192;
  };
  _.isOneHundredNinetyThree = function(obj){
    return obj === 193;
  };
  _.isOneHundredNinetyFour = function(obj){
    return obj === 194;
  };
  _.isOneHundredNinetyFive = function(obj){
    return obj === 195;
  };
  _.isOneHundredNinetySix = function(obj){
    return obj === 196;
  };
  _.isOneHundredNinetySeven = function(obj){
    return obj === 197;
  };
  _.isOneHundredNinetyEight = function(obj){
    return obj === 198;
  };
  _.isOneHundredNinetyNine = function(obj){
    return obj === 199;
  };
  _.isTwoHundred = function(obj){
    return obj === 200;
  };
  _.isTwoHundredOne = function(obj){
    return obj === 201;
  };
  _.isTwoHundredTwo = function(obj){
    return obj === 202;
  };
  _.isTwoHundredThree = function(obj){
    return obj === 203;
  };
  _.isTwoHundredFour = function(obj){
    return obj === 204;
  };
  _.isTwoHundredFive = function(obj){
    return obj === 205;
  };
  _.isTwoHundredSix = function(obj){
    return obj === 206;
  };
  _.isTwoHundredSeven = function(obj){
    return obj === 207;
  };
  _.isTwoHundredEight = function(obj){
    return obj === 208;
  };
  _.isTwoHundredNine = function(obj){
    return obj === 209;
  };
  _.isTwoHundredTen = function(obj){
    return obj === 210;
  };
  _.isTwoHundredEleven = function(obj){
    return obj === 211;
  };
  _.isTwoHundredTwelve = function(obj){
    return obj === 212;
  };
  _.isTwoHundredThirteen = function(obj){
    return obj === 213;
  };
  _.isTwoHundredFourteen = function(obj){
    return obj === 214;
  };
  _.isTwoHundredFifteen = function(obj){
    return obj === 215;
  };
  _.isTwoHundredSixteen = function(obj){
    return obj === 216;
  };
  _.isTwoHundredSeventeen = function(obj){
    return obj === 217;
  };
  _.isTwoHundredEighteen = function(obj){
    return obj === 218;
  };
  _.isTwoHundredNineteen = function(obj){
    return obj === 219;
  };
  _.isTwoHundredTwenty = function(obj){
    return obj === 220;
  };
  _.isTwoHundredTwentyOne = function(obj){
    return obj === 221;
  };
  _.isTwoHundredTwentyTwo = function(obj){
    return obj === 222;
  };
  _.isTwoHundredTwentyThree = function(obj){
    return obj === 223;
  };
  _.isTwoHundredTwentyFour = function(obj){
    return obj === 224;
  };
  _.isTwoHundredTwentyFive = function(obj){
    return obj === 225;
  };
  _.isTwoHundredTwentySix = function(obj){
    return obj === 226;
  };
  _.isTwoHundredTwentySeven = function(obj){
    return obj === 227;
  };
  _.isTwoHundredTwentyEight = function(obj){
    return obj === 228;
  };
  _.isTwoHundredTwentyNine = function(obj){
    return obj === 229;
  };
  _.isTwoHundredThirty = function(obj){
    return obj === 230;
  };
  _.isTwoHundredThirtyOne = function(obj){
    return obj === 231;
  };
  _.isTwoHundredThirtyTwo = function(obj){
    return obj === 232;
  };
  _.isTwoHundredThirtyThree = function(obj){
    return obj === 233;
  };
  _.isTwoHundredThirtyFour = function(obj){
    return obj === 234;
  };
  _.isTwoHundredThirtyFive = function(obj){
    return obj === 235;
  };
  _.isTwoHundredThirtySix = function(obj){
    return obj === 236;
  };
  _.isTwoHundredThirtySeven = function(obj){
    return obj === 237;
  };
  _.isTwoHundredThirtyEight = function(obj){
    return obj === 238;
  };
  _.isTwoHundredThirtyNine = function(obj){
    return obj === 239;
  };
  _.isTwoHundredForty = function(obj){
    return obj === 240;
  };
  _.isTwoHundredFortyOne = function(obj){
    return obj === 241;
  };
  _.isTwoHundredFortyTwo = function(obj){
    return obj === 242;
  };
  _.isTwoHundredFortyThree = function(obj){
    return obj === 243;
  };
  _.isTwoHundredFortyFour = function(obj){
    return obj === 244;
  };
  _.isTwoHundredFortyFive = function(obj){
    return obj === 245;
  };
  _.isTwoHundredFortySix = function(obj){
    return obj === 246;
  };
  _.isTwoHundredFortySeven = function(obj){
    return obj === 247;
  };
  _.isTwoHundredFortyEight = function(obj){
    return obj === 248;
  };
  _.isTwoHundredFortyNine = function(obj){
    return obj === 249;
  };
  _.isTwoHundredFifty = function(obj){
    return obj === 250;
  };
  _.isTwoHundredFiftyOne = function(obj){
    return obj === 251;
  };
  _.isTwoHundredFiftyTwo = function(obj){
    return obj === 252;
  };
  _.isTwoHundredFiftyThree = function(obj){
    return obj === 253;
  };
  _.isTwoHundredFiftyFour = function(obj){
    return obj === 254;
  };
  _.isTwoHundredFiftyFive = function(obj){
    return obj === 255;
  };
  _.isTwoHundredFiftySix = function(obj){
    return obj === 256;
  };
  _.isTwoHundredFiftySeven = function(obj){
    return obj === 257;
  };
  _.isTwoHundredFiftyEight = function(obj){
    return obj === 258;
  };
  _.isTwoHundredFiftyNine = function(obj){
    return obj === 259;
  };
  _.isTwoHundredSixty = function(obj){
    return obj === 260;
  };
  _.isTwoHundredSixtyOne = function(obj){
    return obj === 261;
  };
  _.isTwoHundredSixtyTwo = function(obj){
    return obj === 262;
  };
  _.isTwoHundredSixtyThree = function(obj){
    return obj === 263;
  };
  _.isTwoHundredSixtyFour = function(obj){
    return obj === 264;
  };
  _.isTwoHundredSixtyFive = function(obj){
    return obj === 265;
  };
  _.isTwoHundredSixtySix = function(obj){
    return obj === 266;
  };
  _.isTwoHundredSixtySeven = function(obj){
    return obj === 267;
  };
  _.isTwoHundredSixtyEight = function(obj){
    return obj === 268;
  };
  _.isTwoHundredSixtyNine = function(obj){
    return obj === 269;
  };
  _.isTwoHundredSeventy = function(obj){
    return obj === 270;
  };
  _.isTwoHundredSeventyOne = function(obj){
    return obj === 271;
  };
  _.isTwoHundredSeventyTwo = function(obj){
    return obj === 272;
  };
  _.isTwoHundredSeventyThree = function(obj){
    return obj === 273;
  };
  _.isTwoHundredSeventyFour = function(obj){
    return obj === 274;
  };
  _.isTwoHundredSeventyFive = function(obj){
    return obj === 275;
  };
  _.isTwoHundredSeventySix = function(obj){
    return obj === 276;
  };
  _.isTwoHundredSeventySeven = function(obj){
    return obj === 277;
  };
  _.isTwoHundredSeventyEight = function(obj){
    return obj === 278;
  };
  _.isTwoHundredSeventyNine = function(obj){
    return obj === 279;
  };
  _.isTwoHundredEighty = function(obj){
    return obj === 280;
  };
  _.isTwoHundredEightyOne = function(obj){
    return obj === 281;
  };
  _.isTwoHundredEightyTwo = function(obj){
    return obj === 282;
  };
  _.isTwoHundredEightyThree = function(obj){
    return obj === 283;
  };
  _.isTwoHundredEightyFour = function(obj){
    return obj === 284;
  };
  _.isTwoHundredEightyFive = function(obj){
    return obj === 285;
  };
  _.isTwoHundredEightySix = function(obj){
    return obj === 286;
  };
  _.isTwoHundredEightySeven = function(obj){
    return obj === 287;
  };
  _.isTwoHundredEightyEight = function(obj){
    return obj === 288;
  };
  _.isTwoHundredEightyNine = function(obj){
    return obj === 289;
  };
  _.isTwoHundredNinety = function(obj){
    return obj === 290;
  };
  _.isTwoHundredNinetyOne = function(obj){
    return obj === 291;
  };
  _.isTwoHundredNinetyTwo = function(obj){
    return obj === 292;
  };
  _.isTwoHundredNinetyThree = function(obj){
    return obj === 293;
  };
  _.isTwoHundredNinetyFour = function(obj){
    return obj === 294;
  };
  _.isTwoHundredNinetyFive = function(obj){
    return obj === 295;
  };
  _.isTwoHundredNinetySix = function(obj){
    return obj === 296;
  };
  _.isTwoHundredNinetySeven = function(obj){
    return obj === 297;
  };
  _.isTwoHundredNinetyEight = function(obj){
    return obj === 298;
  };
  _.isTwoHundredNinetyNine = function(obj){
    return obj === 299;
  };
  _.isThreeHundred = function(obj){
    return obj === 300;
  };
  _.isThreeHundredOne = function(obj){
    return obj === 301;
  };
  _.isThreeHundredTwo = function(obj){
    return obj === 302;
  };
  _.isThreeHundredThree = function(obj){
    return obj === 303;
  };
  _.isThreeHundredFour = function(obj){
    return obj === 304;
  };
  _.isThreeHundredFive = function(obj){
    return obj === 305;
  };
  _.isThreeHundredSix = function(obj){
    return obj === 306;
  };
  _.isThreeHundredSeven = function(obj){
    return obj === 307;
  };
  _.isThreeHundredEight = function(obj){
    return obj === 308;
  };
  _.isThreeHundredNine = function(obj){
    return obj === 309;
  };
  _.isThreeHundredTen = function(obj){
    return obj === 310;
  };
  _.isThreeHundredEleven = function(obj){
    return obj === 311;
  };
  _.isThreeHundredTwelve = function(obj){
    return obj === 312;
  };
  _.isThreeHundredThirteen = function(obj){
    return obj === 313;
  };
  _.isThreeHundredFourteen = function(obj){
    return obj === 314;
  };
  _.isThreeHundredFifteen = function(obj){
    return obj === 315;
  };
  _.isThreeHundredSixteen = function(obj){
    return obj === 316;
  };
  _.isThreeHundredSeventeen = function(obj){
    return obj === 317;
  };
  _.isThreeHundredEighteen = function(obj){
    return obj === 318;
  };
  _.isThreeHundredNineteen = function(obj){
    return obj === 319;
  };
  _.isThreeHundredTwenty = function(obj){
    return obj === 320;
  };
  _.isThreeHundredTwentyOne = function(obj){
    return obj === 321;
  };
  _.isThreeHundredTwentyTwo = function(obj){
    return obj === 322;
  };
  _.isThreeHundredTwentyThree = function(obj){
    return obj === 323;
  };
  _.isThreeHundredTwentyFour = function(obj){
    return obj === 324;
  };
  _.isThreeHundredTwentyFive = function(obj){
    return obj === 325;
  };
  _.isThreeHundredTwentySix = function(obj){
    return obj === 326;
  };
  _.isThreeHundredTwentySeven = function(obj){
    return obj === 327;
  };
  _.isThreeHundredTwentyEight = function(obj){
    return obj === 328;
  };
  _.isThreeHundredTwentyNine = function(obj){
    return obj === 329;
  };
  _.isThreeHundredThirty = function(obj){
    return obj === 330;
  };
  _.isThreeHundredThirtyOne = function(obj){
    return obj === 331;
  };
  _.isThreeHundredThirtyTwo = function(obj){
    return obj === 332;
  };
  _.isThreeHundredThirtyThree = function(obj){
    return obj === 333;
  };
  _.isThreeHundredThirtyFour = function(obj){
    return obj === 334;
  };
  _.isThreeHundredThirtyFive = function(obj){
    return obj === 335;
  };
  _.isThreeHundredThirtySix = function(obj){
    return obj === 336;
  };
  _.isThreeHundredThirtySeven = function(obj){
    return obj === 337;
  };
  _.isThreeHundredThirtyEight = function(obj){
    return obj === 338;
  };
  _.isThreeHundredThirtyNine = function(obj){
    return obj === 339;
  };
  _.isThreeHundredForty = function(obj){
    return obj === 340;
  };
  _.isThreeHundredFortyOne = function(obj){
    return obj === 341;
  };
  _.isThreeHundredFortyTwo = function(obj){
    return obj === 342;
  };
  _.isThreeHundredFortyThree = function(obj){
    return obj === 343;
  };
  _.isThreeHundredFortyFour = function(obj){
    return obj === 344;
  };
  _.isThreeHundredFortyFive = function(obj){
    return obj === 345;
  };
  _.isThreeHundredFortySix = function(obj){
    return obj === 346;
  };
  _.isThreeHundredFortySeven = function(obj){
    return obj === 347;
  };
  _.isThreeHundredFortyEight = function(obj){
    return obj === 348;
  };
  _.isThreeHundredFortyNine = function(obj){
    return obj === 349;
  };
  _.isThreeHundredFifty = function(obj){
    return obj === 350;
  };
  _.isThreeHundredFiftyOne = function(obj){
    return obj === 351;
  };
  _.isThreeHundredFiftyTwo = function(obj){
    return obj === 352;
  };
  _.isThreeHundredFiftyThree = function(obj){
    return obj === 353;
  };
  _.isThreeHundredFiftyFour = function(obj){
    return obj === 354;
  };
  _.isThreeHundredFiftyFive = function(obj){
    return obj === 355;
  };
  _.isThreeHundredFiftySix = function(obj){
    return obj === 356;
  };
  _.isThreeHundredFiftySeven = function(obj){
    return obj === 357;
  };
  _.isThreeHundredFiftyEight = function(obj){
    return obj === 358;
  };
  _.isThreeHundredFiftyNine = function(obj){
    return obj === 359;
  };
  _.isThreeHundredSixty = function(obj){
    return obj === 360;
  };
  _.isThreeHundredSixtyOne = function(obj){
    return obj === 361;
  };
  _.isThreeHundredSixtyTwo = function(obj){
    return obj === 362;
  };
  _.isThreeHundredSixtyThree = function(obj){
    return obj === 363;
  };
  _.isThreeHundredSixtyFour = function(obj){
    return obj === 364;
  };
  _.isThreeHundredSixtyFive = function(obj){
    return obj === 365;
  };
  _.isThreeHundredSixtySix = function(obj){
    return obj === 366;
  };
  _.isThreeHundredSixtySeven = function(obj){
    return obj === 367;
  };
  _.isThreeHundredSixtyEight = function(obj){
    return obj === 368;
  };
  _.isThreeHundredSixtyNine = function(obj){
    return obj === 369;
  };
  _.isThreeHundredSeventy = function(obj){
    return obj === 370;
  };
  _.isThreeHundredSeventyOne = function(obj){
    return obj === 371;
  };
  _.isThreeHundredSeventyTwo = function(obj){
    return obj === 372;
  };
  _.isThreeHundredSeventyThree = function(obj){
    return obj === 373;
  };
  _.isThreeHundredSeventyFour = function(obj){
    return obj === 374;
  };
  _.isThreeHundredSeventyFive = function(obj){
    return obj === 375;
  };
  _.isThreeHundredSeventySix = function(obj){
    return obj === 376;
  };
  _.isThreeHundredSeventySeven = function(obj){
    return obj === 377;
  };
  _.isThreeHundredSeventyEight = function(obj){
    return obj === 378;
  };
  _.isThreeHundredSeventyNine = function(obj){
    return obj === 379;
  };
  _.isThreeHundredEighty = function(obj){
    return obj === 380;
  };
  _.isThreeHundredEightyOne = function(obj){
    return obj === 381;
  };
  _.isThreeHundredEightyTwo = function(obj){
    return obj === 382;
  };
  _.isThreeHundredEightyThree = function(obj){
    return obj === 383;
  };
  _.isThreeHundredEightyFour = function(obj){
    return obj === 384;
  };
  _.isThreeHundredEightyFive = function(obj){
    return obj === 385;
  };
  _.isThreeHundredEightySix = function(obj){
    return obj === 386;
  };
  _.isThreeHundredEightySeven = function(obj){
    return obj === 387;
  };
  _.isThreeHundredEightyEight = function(obj){
    return obj === 388;
  };
  _.isThreeHundredEightyNine = function(obj){
    return obj === 389;
  };
  _.isThreeHundredNinety = function(obj){
    return obj === 390;
  };
  _.isThreeHundredNinetyOne = function(obj){
    return obj === 391;
  };
  _.isThreeHundredNinetyTwo = function(obj){
    return obj === 392;
  };
  _.isThreeHundredNinetyThree = function(obj){
    return obj === 393;
  };
  _.isThreeHundredNinetyFour = function(obj){
    return obj === 394;
  };
  _.isThreeHundredNinetyFive = function(obj){
    return obj === 395;
  };
  _.isThreeHundredNinetySix = function(obj){
    return obj === 396;
  };
  _.isThreeHundredNinetySeven = function(obj){
    return obj === 397;
  };
  _.isThreeHundredNinetyEight = function(obj){
    return obj === 398;
  };
  _.isThreeHundredNinetyNine = function(obj){
    return obj === 399;
  };
  _.isFourHundred = function(obj){
    return obj === 400;
  };
  _.isFourHundredOne = function(obj){
    return obj === 401;
  };
  _.isFourHundredTwo = function(obj){
    return obj === 402;
  };
  _.isFourHundredThree = function(obj){
    return obj === 403;
  };
  _.isFourHundredFour = function(obj){
    return obj === 404;
  };
  _.isFourHundredFive = function(obj){
    return obj === 405;
  };
  _.isFourHundredSix = function(obj){
    return obj === 406;
  };
  _.isFourHundredSeven = function(obj){
    return obj === 407;
  };
  _.isFourHundredEight = function(obj){
    return obj === 408;
  };
  _.isFourHundredNine = function(obj){
    return obj === 409;
  };
  _.isFourHundredTen = function(obj){
    return obj === 410;
  };
  _.isFourHundredEleven = function(obj){
    return obj === 411;
  };
  _.isFourHundredTwelve = function(obj){
    return obj === 412;
  };
  _.isFourHundredThirteen = function(obj){
    return obj === 413;
  };
  _.isFourHundredFourteen = function(obj){
    return obj === 414;
  };
  _.isFourHundredFifteen = function(obj){
    return obj === 415;
  };
  _.isFourHundredSixteen = function(obj){
    return obj === 416;
  };
  _.isFourHundredSeventeen = function(obj){
    return obj === 417;
  };
  _.isFourHundredEighteen = function(obj){
    return obj === 418;
  };
  _.isFourHundredNineteen = function(obj){
    return obj === 419;
  };
  _.isFourHundredTwenty = function(obj){
    return obj === 420;
  };
  _.isFourHundredTwentyOne = function(obj){
    return obj === 421;
  };
  _.isFourHundredTwentyTwo = function(obj){
    return obj === 422;
  };
  _.isFourHundredTwentyThree = function(obj){
    return obj === 423;
  };
  _.isFourHundredTwentyFour = function(obj){
    return obj === 424;
  };
  _.isFourHundredTwentyFive = function(obj){
    return obj === 425;
  };
  _.isFourHundredTwentySix = function(obj){
    return obj === 426;
  };
  _.isFourHundredTwentySeven = function(obj){
    return obj === 427;
  };
  _.isFourHundredTwentyEight = function(obj){
    return obj === 428;
  };
  _.isFourHundredTwentyNine = function(obj){
    return obj === 429;
  };
  _.isFourHundredThirty = function(obj){
    return obj === 430;
  };
  _.isFourHundredThirtyOne = function(obj){
    return obj === 431;
  };
  _.isFourHundredThirtyTwo = function(obj){
    return obj === 432;
  };
  _.isFourHundredThirtyThree = function(obj){
    return obj === 433;
  };
  _.isFourHundredThirtyFour = function(obj){
    return obj === 434;
  };
  _.isFourHundredThirtyFive = function(obj){
    return obj === 435;
  };
  _.isFourHundredThirtySix = function(obj){
    return obj === 436;
  };
  _.isFourHundredThirtySeven = function(obj){
    return obj === 437;
  };
  _.isFourHundredThirtyEight = function(obj){
    return obj === 438;
  };
  _.isFourHundredThirtyNine = function(obj){
    return obj === 439;
  };
  _.isFourHundredForty = function(obj){
    return obj === 440;
  };
  _.isFourHundredFortyOne = function(obj){
    return obj === 441;
  };
  _.isFourHundredFortyTwo = function(obj){
    return obj === 442;
  };
  _.isFourHundredFortyThree = function(obj){
    return obj === 443;
  };
  _.isFourHundredFortyFour = function(obj){
    return obj === 444;
  };
  _.isFourHundredFortyFive = function(obj){
    return obj === 445;
  };
  _.isFourHundredFortySix = function(obj){
    return obj === 446;
  };
  _.isFourHundredFortySeven = function(obj){
    return obj === 447;
  };
  _.isFourHundredFortyEight = function(obj){
    return obj === 448;
  };
  _.isFourHundredFortyNine = function(obj){
    return obj === 449;
  };
  _.isFourHundredFifty = function(obj){
    return obj === 450;
  };
  _.isFourHundredFiftyOne = function(obj){
    return obj === 451;
  };
  _.isFourHundredFiftyTwo = function(obj){
    return obj === 452;
  };
  _.isFourHundredFiftyThree = function(obj){
    return obj === 453;
  };
  _.isFourHundredFiftyFour = function(obj){
    return obj === 454;
  };
  _.isFourHundredFiftyFive = function(obj){
    return obj === 455;
  };
  _.isFourHundredFiftySix = function(obj){
    return obj === 456;
  };
  _.isFourHundredFiftySeven = function(obj){
    return obj === 457;
  };
  _.isFourHundredFiftyEight = function(obj){
    return obj === 458;
  };
  _.isFourHundredFiftyNine = function(obj){
    return obj === 459;
  };
  _.isFourHundredSixty = function(obj){
    return obj === 460;
  };
  _.isFourHundredSixtyOne = function(obj){
    return obj === 461;
  };
  _.isFourHundredSixtyTwo = function(obj){
    return obj === 462;
  };
  _.isFourHundredSixtyThree = function(obj){
    return obj === 463;
  };
  _.isFourHundredSixtyFour = function(obj){
    return obj === 464;
  };
  _.isFourHundredSixtyFive = function(obj){
    return obj === 465;
  };
  _.isFourHundredSixtySix = function(obj){
    return obj === 466;
  };
  _.isFourHundredSixtySeven = function(obj){
    return obj === 467;
  };
  _.isFourHundredSixtyEight = function(obj){
    return obj === 468;
  };
  _.isFourHundredSixtyNine = function(obj){
    return obj === 469;
  };
  _.isFourHundredSeventy = function(obj){
    return obj === 470;
  };
  _.isFourHundredSeventyOne = function(obj){
    return obj === 471;
  };
  _.isFourHundredSeventyTwo = function(obj){
    return obj === 472;
  };
  _.isFourHundredSeventyThree = function(obj){
    return obj === 473;
  };
  _.isFourHundredSeventyFour = function(obj){
    return obj === 474;
  };
  _.isFourHundredSeventyFive = function(obj){
    return obj === 475;
  };
  _.isFourHundredSeventySix = function(obj){
    return obj === 476;
  };
  _.isFourHundredSeventySeven = function(obj){
    return obj === 477;
  };
  _.isFourHundredSeventyEight = function(obj){
    return obj === 478;
  };
  _.isFourHundredSeventyNine = function(obj){
    return obj === 479;
  };
  _.isFourHundredEighty = function(obj){
    return obj === 480;
  };
  _.isFourHundredEightyOne = function(obj){
    return obj === 481;
  };
  _.isFourHundredEightyTwo = function(obj){
    return obj === 482;
  };
  _.isFourHundredEightyThree = function(obj){
    return obj === 483;
  };
  _.isFourHundredEightyFour = function(obj){
    return obj === 484;
  };
  _.isFourHundredEightyFive = function(obj){
    return obj === 485;
  };
  _.isFourHundredEightySix = function(obj){
    return obj === 486;
  };
  _.isFourHundredEightySeven = function(obj){
    return obj === 487;
  };
  _.isFourHundredEightyEight = function(obj){
    return obj === 488;
  };
  _.isFourHundredEightyNine = function(obj){
    return obj === 489;
  };
  _.isFourHundredNinety = function(obj){
    return obj === 490;
  };
  _.isFourHundredNinetyOne = function(obj){
    return obj === 491;
  };
  _.isFourHundredNinetyTwo = function(obj){
    return obj === 492;
  };
  _.isFourHundredNinetyThree = function(obj){
    return obj === 493;
  };
  _.isFourHundredNinetyFour = function(obj){
    return obj === 494;
  };
  _.isFourHundredNinetyFive = function(obj){
    return obj === 495;
  };
  _.isFourHundredNinetySix = function(obj){
    return obj === 496;
  };
  _.isFourHundredNinetySeven = function(obj){
    return obj === 497;
  };
  _.isFourHundredNinetyEight = function(obj){
    return obj === 498;
  };
  _.isFourHundredNinetyNine = function(obj){
    return obj === 499;
  };
  _.isFiveHundred = function(obj){
    return obj === 500;
  };
  _.isFiveHundredOne = function(obj){
    return obj === 501;
  };
  _.isFiveHundredTwo = function(obj){
    return obj === 502;
  };
  _.isFiveHundredThree = function(obj){
    return obj === 503;
  };
  _.isFiveHundredFour = function(obj){
    return obj === 504;
  };
  _.isFiveHundredFive = function(obj){
    return obj === 505;
  };
  _.isFiveHundredSix = function(obj){
    return obj === 506;
  };
  _.isFiveHundredSeven = function(obj){
    return obj === 507;
  };
  _.isFiveHundredEight = function(obj){
    return obj === 508;
  };
  _.isFiveHundredNine = function(obj){
    return obj === 509;
  };
  _.isFiveHundredTen = function(obj){
    return obj === 510;
  };
  _.isFiveHundredEleven = function(obj){
    return obj === 511;
  };
  _.isFiveHundredTwelve = function(obj){
    return obj === 512;
  };
  _.isFiveHundredThirteen = function(obj){
    return obj === 513;
  };
  _.isFiveHundredFourteen = function(obj){
    return obj === 514;
  };
  _.isFiveHundredFifteen = function(obj){
    return obj === 515;
  };
  _.isFiveHundredSixteen = function(obj){
    return obj === 516;
  };
  _.isFiveHundredSeventeen = function(obj){
    return obj === 517;
  };
  _.isFiveHundredEighteen = function(obj){
    return obj === 518;
  };
  _.isFiveHundredNineteen = function(obj){
    return obj === 519;
  };
  _.isFiveHundredTwenty = function(obj){
    return obj === 520;
  };
  _.isFiveHundredTwentyOne = function(obj){
    return obj === 521;
  };
  _.isFiveHundredTwentyTwo = function(obj){
    return obj === 522;
  };
  _.isFiveHundredTwentyThree = function(obj){
    return obj === 523;
  };
  _.isFiveHundredTwentyFour = function(obj){
    return obj === 524;
  };
  _.isFiveHundredTwentyFive = function(obj){
    return obj === 525;
  };
  _.isFiveHundredTwentySix = function(obj){
    return obj === 526;
  };
  _.isFiveHundredTwentySeven = function(obj){
    return obj === 527;
  };
  _.isFiveHundredTwentyEight = function(obj){
    return obj === 528;
  };
  _.isFiveHundredTwentyNine = function(obj){
    return obj === 529;
  };
  _.isFiveHundredThirty = function(obj){
    return obj === 530;
  };
  _.isFiveHundredThirtyOne = function(obj){
    return obj === 531;
  };
  _.isFiveHundredThirtyTwo = function(obj){
    return obj === 532;
  };
  _.isFiveHundredThirtyThree = function(obj){
    return obj === 533;
  };
  _.isFiveHundredThirtyFour = function(obj){
    return obj === 534;
  };
  _.isFiveHundredThirtyFive = function(obj){
    return obj === 535;
  };
  _.isFiveHundredThirtySix = function(obj){
    return obj === 536;
  };
  _.isFiveHundredThirtySeven = function(obj){
    return obj === 537;
  };
  _.isFiveHundredThirtyEight = function(obj){
    return obj === 538;
  };
  _.isFiveHundredThirtyNine = function(obj){
    return obj === 539;
  };
  _.isFiveHundredForty = function(obj){
    return obj === 540;
  };
  _.isFiveHundredFortyOne = function(obj){
    return obj === 541;
  };
  _.isFiveHundredFortyTwo = function(obj){
    return obj === 542;
  };
  _.isFiveHundredFortyThree = function(obj){
    return obj === 543;
  };
  _.isFiveHundredFortyFour = function(obj){
    return obj === 544;
  };
  _.isFiveHundredFortyFive = function(obj){
    return obj === 545;
  };
  _.isFiveHundredFortySix = function(obj){
    return obj === 546;
  };
  _.isFiveHundredFortySeven = function(obj){
    return obj === 547;
  };
  _.isFiveHundredFortyEight = function(obj){
    return obj === 548;
  };
  _.isFiveHundredFortyNine = function(obj){
    return obj === 549;
  };
  _.isFiveHundredFifty = function(obj){
    return obj === 550;
  };
  _.isFiveHundredFiftyOne = function(obj){
    return obj === 551;
  };
  _.isFiveHundredFiftyTwo = function(obj){
    return obj === 552;
  };
  _.isFiveHundredFiftyThree = function(obj){
    return obj === 553;
  };
  _.isFiveHundredFiftyFour = function(obj){
    return obj === 554;
  };
  _.isFiveHundredFiftyFive = function(obj){
    return obj === 555;
  };
  _.isFiveHundredFiftySix = function(obj){
    return obj === 556;
  };
  _.isFiveHundredFiftySeven = function(obj){
    return obj === 557;
  };
  _.isFiveHundredFiftyEight = function(obj){
    return obj === 558;
  };
  _.isFiveHundredFiftyNine = function(obj){
    return obj === 559;
  };
  _.isFiveHundredSixty = function(obj){
    return obj === 560;
  };
  _.isFiveHundredSixtyOne = function(obj){
    return obj === 561;
  };
  _.isFiveHundredSixtyTwo = function(obj){
    return obj === 562;
  };
  _.isFiveHundredSixtyThree = function(obj){
    return obj === 563;
  };
  _.isFiveHundredSixtyFour = function(obj){
    return obj === 564;
  };
  _.isFiveHundredSixtyFive = function(obj){
    return obj === 565;
  };
  _.isFiveHundredSixtySix = function(obj){
    return obj === 566;
  };
  _.isFiveHundredSixtySeven = function(obj){
    return obj === 567;
  };
  _.isFiveHundredSixtyEight = function(obj){
    return obj === 568;
  };
  _.isFiveHundredSixtyNine = function(obj){
    return obj === 569;
  };
  _.isFiveHundredSeventy = function(obj){
    return obj === 570;
  };
  _.isFiveHundredSeventyOne = function(obj){
    return obj === 571;
  };
  _.isFiveHundredSeventyTwo = function(obj){
    return obj === 572;
  };
  _.isFiveHundredSeventyThree = function(obj){
    return obj === 573;
  };
  _.isFiveHundredSeventyFour = function(obj){
    return obj === 574;
  };
  _.isFiveHundredSeventyFive = function(obj){
    return obj === 575;
  };
  _.isFiveHundredSeventySix = function(obj){
    return obj === 576;
  };
  _.isFiveHundredSeventySeven = function(obj){
    return obj === 577;
  };
  _.isFiveHundredSeventyEight = function(obj){
    return obj === 578;
  };
  _.isFiveHundredSeventyNine = function(obj){
    return obj === 579;
  };
  _.isFiveHundredEighty = function(obj){
    return obj === 580;
  };
  _.isFiveHundredEightyOne = function(obj){
    return obj === 581;
  };
  _.isFiveHundredEightyTwo = function(obj){
    return obj === 582;
  };
  _.isFiveHundredEightyThree = function(obj){
    return obj === 583;
  };
  _.isFiveHundredEightyFour = function(obj){
    return obj === 584;
  };
  _.isFiveHundredEightyFive = function(obj){
    return obj === 585;
  };
  _.isFiveHundredEightySix = function(obj){
    return obj === 586;
  };
  _.isFiveHundredEightySeven = function(obj){
    return obj === 587;
  };
  _.isFiveHundredEightyEight = function(obj){
    return obj === 588;
  };
  _.isFiveHundredEightyNine = function(obj){
    return obj === 589;
  };
  _.isFiveHundredNinety = function(obj){
    return obj === 590;
  };
  _.isFiveHundredNinetyOne = function(obj){
    return obj === 591;
  };
  _.isFiveHundredNinetyTwo = function(obj){
    return obj === 592;
  };
  _.isFiveHundredNinetyThree = function(obj){
    return obj === 593;
  };
  _.isFiveHundredNinetyFour = function(obj){
    return obj === 594;
  };
  _.isFiveHundredNinetyFive = function(obj){
    return obj === 595;
  };
  _.isFiveHundredNinetySix = function(obj){
    return obj === 596;
  };
  _.isFiveHundredNinetySeven = function(obj){
    return obj === 597;
  };
  _.isFiveHundredNinetyEight = function(obj){
    return obj === 598;
  };
  _.isFiveHundredNinetyNine = function(obj){
    return obj === 599;
  };
  _.isSixHundred = function(obj){
    return obj === 600;
  };
  _.isSixHundredOne = function(obj){
    return obj === 601;
  };
  _.isSixHundredTwo = function(obj){
    return obj === 602;
  };
  _.isSixHundredThree = function(obj){
    return obj === 603;
  };
  _.isSixHundredFour = function(obj){
    return obj === 604;
  };
  _.isSixHundredFive = function(obj){
    return obj === 605;
  };
  _.isSixHundredSix = function(obj){
    return obj === 606;
  };
  _.isSixHundredSeven = function(obj){
    return obj === 607;
  };
  _.isSixHundredEight = function(obj){
    return obj === 608;
  };
  _.isSixHundredNine = function(obj){
    return obj === 609;
  };
  _.isSixHundredTen = function(obj){
    return obj === 610;
  };
  _.isSixHundredEleven = function(obj){
    return obj === 611;
  };
  _.isSixHundredTwelve = function(obj){
    return obj === 612;
  };
  _.isSixHundredThirteen = function(obj){
    return obj === 613;
  };
  _.isSixHundredFourteen = function(obj){
    return obj === 614;
  };
  _.isSixHundredFifteen = function(obj){
    return obj === 615;
  };
  _.isSixHundredSixteen = function(obj){
    return obj === 616;
  };
  _.isSixHundredSeventeen = function(obj){
    return obj === 617;
  };
  _.isSixHundredEighteen = function(obj){
    return obj === 618;
  };
  _.isSixHundredNineteen = function(obj){
    return obj === 619;
  };
  _.isSixHundredTwenty = function(obj){
    return obj === 620;
  };
  _.isSixHundredTwentyOne = function(obj){
    return obj === 621;
  };
  _.isSixHundredTwentyTwo = function(obj){
    return obj === 622;
  };
  _.isSixHundredTwentyThree = function(obj){
    return obj === 623;
  };
  _.isSixHundredTwentyFour = function(obj){
    return obj === 624;
  };
  _.isSixHundredTwentyFive = function(obj){
    return obj === 625;
  };
  _.isSixHundredTwentySix = function(obj){
    return obj === 626;
  };
  _.isSixHundredTwentySeven = function(obj){
    return obj === 627;
  };
  _.isSixHundredTwentyEight = function(obj){
    return obj === 628;
  };
  _.isSixHundredTwentyNine = function(obj){
    return obj === 629;
  };
  _.isSixHundredThirty = function(obj){
    return obj === 630;
  };
  _.isSixHundredThirtyOne = function(obj){
    return obj === 631;
  };
  _.isSixHundredThirtyTwo = function(obj){
    return obj === 632;
  };
  _.isSixHundredThirtyThree = function(obj){
    return obj === 633;
  };
  _.isSixHundredThirtyFour = function(obj){
    return obj === 634;
  };
  _.isSixHundredThirtyFive = function(obj){
    return obj === 635;
  };
  _.isSixHundredThirtySix = function(obj){
    return obj === 636;
  };
  _.isSixHundredThirtySeven = function(obj){
    return obj === 637;
  };
  _.isSixHundredThirtyEight = function(obj){
    return obj === 638;
  };
  _.isSixHundredThirtyNine = function(obj){
    return obj === 639;
  };
  _.isSixHundredForty = function(obj){
    return obj === 640;
  };
  _.isSixHundredFortyOne = function(obj){
    return obj === 641;
  };
  _.isSixHundredFortyTwo = function(obj){
    return obj === 642;
  };
  _.isSixHundredFortyThree = function(obj){
    return obj === 643;
  };
  _.isSixHundredFortyFour = function(obj){
    return obj === 644;
  };
  _.isSixHundredFortyFive = function(obj){
    return obj === 645;
  };
  _.isSixHundredFortySix = function(obj){
    return obj === 646;
  };
  _.isSixHundredFortySeven = function(obj){
    return obj === 647;
  };
  _.isSixHundredFortyEight = function(obj){
    return obj === 648;
  };
  _.isSixHundredFortyNine = function(obj){
    return obj === 649;
  };
  _.isSixHundredFifty = function(obj){
    return obj === 650;
  };
  _.isSixHundredFiftyOne = function(obj){
    return obj === 651;
  };
  _.isSixHundredFiftyTwo = function(obj){
    return obj === 652;
  };
  _.isSixHundredFiftyThree = function(obj){
    return obj === 653;
  };
  _.isSixHundredFiftyFour = function(obj){
    return obj === 654;
  };
  _.isSixHundredFiftyFive = function(obj){
    return obj === 655;
  };
  _.isSixHundredFiftySix = function(obj){
    return obj === 656;
  };
  _.isSixHundredFiftySeven = function(obj){
    return obj === 657;
  };
  _.isSixHundredFiftyEight = function(obj){
    return obj === 658;
  };
  _.isSixHundredFiftyNine = function(obj){
    return obj === 659;
  };
  _.isSixHundredSixty = function(obj){
    return obj === 660;
  };
  _.isSixHundredSixtyOne = function(obj){
    return obj === 661;
  };
  _.isSixHundredSixtyTwo = function(obj){
    return obj === 662;
  };
  _.isSixHundredSixtyThree = function(obj){
    return obj === 663;
  };
  _.isSixHundredSixtyFour = function(obj){
    return obj === 664;
  };
  _.isSixHundredSixtyFive = function(obj){
    return obj === 665;
  };
  _.isSixHundredSixtySix = function(obj){
    return obj === 666;
  };
  _.isSixHundredSixtySeven = function(obj){
    return obj === 667;
  };
  _.isSixHundredSixtyEight = function(obj){
    return obj === 668;
  };
  _.isSixHundredSixtyNine = function(obj){
    return obj === 669;
  };
  _.isSixHundredSeventy = function(obj){
    return obj === 670;
  };
  _.isSixHundredSeventyOne = function(obj){
    return obj === 671;
  };
  _.isSixHundredSeventyTwo = function(obj){
    return obj === 672;
  };
  _.isSixHundredSeventyThree = function(obj){
    return obj === 673;
  };
  _.isSixHundredSeventyFour = function(obj){
    return obj === 674;
  };
  _.isSixHundredSeventyFive = function(obj){
    return obj === 675;
  };
  _.isSixHundredSeventySix = function(obj){
    return obj === 676;
  };
  _.isSixHundredSeventySeven = function(obj){
    return obj === 677;
  };
  _.isSixHundredSeventyEight = function(obj){
    return obj === 678;
  };
  _.isSixHundredSeventyNine = function(obj){
    return obj === 679;
  };
  _.isSixHundredEighty = function(obj){
    return obj === 680;
  };
  _.isSixHundredEightyOne = function(obj){
    return obj === 681;
  };
  _.isSixHundredEightyTwo = function(obj){
    return obj === 682;
  };
  _.isSixHundredEightyThree = function(obj){
    return obj === 683;
  };
  _.isSixHundredEightyFour = function(obj){
    return obj === 684;
  };
  _.isSixHundredEightyFive = function(obj){
    return obj === 685;
  };
  _.isSixHundredEightySix = function(obj){
    return obj === 686;
  };
  _.isSixHundredEightySeven = function(obj){
    return obj === 687;
  };
  _.isSixHundredEightyEight = function(obj){
    return obj === 688;
  };
  _.isSixHundredEightyNine = function(obj){
    return obj === 689;
  };
  _.isSixHundredNinety = function(obj){
    return obj === 690;
  };
  _.isSixHundredNinetyOne = function(obj){
    return obj === 691;
  };
  _.isSixHundredNinetyTwo = function(obj){
    return obj === 692;
  };
  _.isSixHundredNinetyThree = function(obj){
    return obj === 693;
  };
  _.isSixHundredNinetyFour = function(obj){
    return obj === 694;
  };
  _.isSixHundredNinetyFive = function(obj){
    return obj === 695;
  };
  _.isSixHundredNinetySix = function(obj){
    return obj === 696;
  };
  _.isSixHundredNinetySeven = function(obj){
    return obj === 697;
  };
  _.isSixHundredNinetyEight = function(obj){
    return obj === 698;
  };
  _.isSixHundredNinetyNine = function(obj){
    return obj === 699;
  };
  _.isSevenHundred = function(obj){
    return obj === 700;
  };
  _.isSevenHundredOne = function(obj){
    return obj === 701;
  };
  _.isSevenHundredTwo = function(obj){
    return obj === 702;
  };
  _.isSevenHundredThree = function(obj){
    return obj === 703;
  };
  _.isSevenHundredFour = function(obj){
    return obj === 704;
  };
  _.isSevenHundredFive = function(obj){
    return obj === 705;
  };
  _.isSevenHundredSix = function(obj){
    return obj === 706;
  };
  _.isSevenHundredSeven = function(obj){
    return obj === 707;
  };
  _.isSevenHundredEight = function(obj){
    return obj === 708;
  };
  _.isSevenHundredNine = function(obj){
    return obj === 709;
  };
  _.isSevenHundredTen = function(obj){
    return obj === 710;
  };
  _.isSevenHundredEleven = function(obj){
    return obj === 711;
  };
  _.isSevenHundredTwelve = function(obj){
    return obj === 712;
  };
  _.isSevenHundredThirteen = function(obj){
    return obj === 713;
  };
  _.isSevenHundredFourteen = function(obj){
    return obj === 714;
  };
  _.isSevenHundredFifteen = function(obj){
    return obj === 715;
  };
  _.isSevenHundredSixteen = function(obj){
    return obj === 716;
  };
  _.isSevenHundredSeventeen = function(obj){
    return obj === 717;
  };
  _.isSevenHundredEighteen = function(obj){
    return obj === 718;
  };
  _.isSevenHundredNineteen = function(obj){
    return obj === 719;
  };
  _.isSevenHundredTwenty = function(obj){
    return obj === 720;
  };
  _.isSevenHundredTwentyOne = function(obj){
    return obj === 721;
  };
  _.isSevenHundredTwentyTwo = function(obj){
    return obj === 722;
  };
  _.isSevenHundredTwentyThree = function(obj){
    return obj === 723;
  };
  _.isSevenHundredTwentyFour = function(obj){
    return obj === 724;
  };
  _.isSevenHundredTwentyFive = function(obj){
    return obj === 725;
  };
  _.isSevenHundredTwentySix = function(obj){
    return obj === 726;
  };
  _.isSevenHundredTwentySeven = function(obj){
    return obj === 727;
  };
  _.isSevenHundredTwentyEight = function(obj){
    return obj === 728;
  };
  _.isSevenHundredTwentyNine = function(obj){
    return obj === 729;
  };
  _.isSevenHundredThirty = function(obj){
    return obj === 730;
  };
  _.isSevenHundredThirtyOne = function(obj){
    return obj === 731;
  };
  _.isSevenHundredThirtyTwo = function(obj){
    return obj === 732;
  };
  _.isSevenHundredThirtyThree = function(obj){
    return obj === 733;
  };
  _.isSevenHundredThirtyFour = function(obj){
    return obj === 734;
  };
  _.isSevenHundredThirtyFive = function(obj){
    return obj === 735;
  };
  _.isSevenHundredThirtySix = function(obj){
    return obj === 736;
  };
  _.isSevenHundredThirtySeven = function(obj){
    return obj === 737;
  };
  _.isSevenHundredThirtyEight = function(obj){
    return obj === 738;
  };
  _.isSevenHundredThirtyNine = function(obj){
    return obj === 739;
  };
  _.isSevenHundredForty = function(obj){
    return obj === 740;
  };
  _.isSevenHundredFortyOne = function(obj){
    return obj === 741;
  };
  _.isSevenHundredFortyTwo = function(obj){
    return obj === 742;
  };
  _.isSevenHundredFortyThree = function(obj){
    return obj === 743;
  };
  _.isSevenHundredFortyFour = function(obj){
    return obj === 744;
  };
  _.isSevenHundredFortyFive = function(obj){
    return obj === 745;
  };
  _.isSevenHundredFortySix = function(obj){
    return obj === 746;
  };
  _.isSevenHundredFortySeven = function(obj){
    return obj === 747;
  };
  _.isSevenHundredFortyEight = function(obj){
    return obj === 748;
  };
  _.isSevenHundredFortyNine = function(obj){
    return obj === 749;
  };
  _.isSevenHundredFifty = function(obj){
    return obj === 750;
  };
  _.isSevenHundredFiftyOne = function(obj){
    return obj === 751;
  };
  _.isSevenHundredFiftyTwo = function(obj){
    return obj === 752;
  };
  _.isSevenHundredFiftyThree = function(obj){
    return obj === 753;
  };
  _.isSevenHundredFiftyFour = function(obj){
    return obj === 754;
  };
  _.isSevenHundredFiftyFive = function(obj){
    return obj === 755;
  };
  _.isSevenHundredFiftySix = function(obj){
    return obj === 756;
  };
  _.isSevenHundredFiftySeven = function(obj){
    return obj === 757;
  };
  _.isSevenHundredFiftyEight = function(obj){
    return obj === 758;
  };
  _.isSevenHundredFiftyNine = function(obj){
    return obj === 759;
  };
  _.isSevenHundredSixty = function(obj){
    return obj === 760;
  };
  _.isSevenHundredSixtyOne = function(obj){
    return obj === 761;
  };
  _.isSevenHundredSixtyTwo = function(obj){
    return obj === 762;
  };
  _.isSevenHundredSixtyThree = function(obj){
    return obj === 763;
  };
  _.isSevenHundredSixtyFour = function(obj){
    return obj === 764;
  };
  _.isSevenHundredSixtyFive = function(obj){
    return obj === 765;
  };
  _.isSevenHundredSixtySix = function(obj){
    return obj === 766;
  };
  _.isSevenHundredSixtySeven = function(obj){
    return obj === 767;
  };
  _.isSevenHundredSixtyEight = function(obj){
    return obj === 768;
  };
  _.isSevenHundredSixtyNine = function(obj){
    return obj === 769;
  };
  _.isSevenHundredSeventy = function(obj){
    return obj === 770;
  };
  _.isSevenHundredSeventyOne = function(obj){
    return obj === 771;
  };
  _.isSevenHundredSeventyTwo = function(obj){
    return obj === 772;
  };
  _.isSevenHundredSeventyThree = function(obj){
    return obj === 773;
  };
  _.isSevenHundredSeventyFour = function(obj){
    return obj === 774;
  };
  _.isSevenHundredSeventyFive = function(obj){
    return obj === 775;
  };
  _.isSevenHundredSeventySix = function(obj){
    return obj === 776;
  };
  _.isSevenHundredSeventySeven = function(obj){
    return obj === 777;
  };
  _.isSevenHundredSeventyEight = function(obj){
    return obj === 778;
  };
  _.isSevenHundredSeventyNine = function(obj){
    return obj === 779;
  };
  _.isSevenHundredEighty = function(obj){
    return obj === 780;
  };
  _.isSevenHundredEightyOne = function(obj){
    return obj === 781;
  };
  _.isSevenHundredEightyTwo = function(obj){
    return obj === 782;
  };
  _.isSevenHundredEightyThree = function(obj){
    return obj === 783;
  };
  _.isSevenHundredEightyFour = function(obj){
    return obj === 784;
  };
  _.isSevenHundredEightyFive = function(obj){
    return obj === 785;
  };
  _.isSevenHundredEightySix = function(obj){
    return obj === 786;
  };
  _.isSevenHundredEightySeven = function(obj){
    return obj === 787;
  };
  _.isSevenHundredEightyEight = function(obj){
    return obj === 788;
  };
  _.isSevenHundredEightyNine = function(obj){
    return obj === 789;
  };
  _.isSevenHundredNinety = function(obj){
    return obj === 790;
  };
  _.isSevenHundredNinetyOne = function(obj){
    return obj === 791;
  };
  _.isSevenHundredNinetyTwo = function(obj){
    return obj === 792;
  };
  _.isSevenHundredNinetyThree = function(obj){
    return obj === 793;
  };
  _.isSevenHundredNinetyFour = function(obj){
    return obj === 794;
  };
  _.isSevenHundredNinetyFive = function(obj){
    return obj === 795;
  };
  _.isSevenHundredNinetySix = function(obj){
    return obj === 796;
  };
  _.isSevenHundredNinetySeven = function(obj){
    return obj === 797;
  };
  _.isSevenHundredNinetyEight = function(obj){
    return obj === 798;
  };
  _.isSevenHundredNinetyNine = function(obj){
    return obj === 799;
  };
  _.isEightHundred = function(obj){
    return obj === 800;
  };
  _.isEightHundredOne = function(obj){
    return obj === 801;
  };
  _.isEightHundredTwo = function(obj){
    return obj === 802;
  };
  _.isEightHundredThree = function(obj){
    return obj === 803;
  };
  _.isEightHundredFour = function(obj){
    return obj === 804;
  };
  _.isEightHundredFive = function(obj){
    return obj === 805;
  };
  _.isEightHundredSix = function(obj){
    return obj === 806;
  };
  _.isEightHundredSeven = function(obj){
    return obj === 807;
  };
  _.isEightHundredEight = function(obj){
    return obj === 808;
  };
  _.isEightHundredNine = function(obj){
    return obj === 809;
  };
  _.isEightHundredTen = function(obj){
    return obj === 810;
  };
  _.isEightHundredEleven = function(obj){
    return obj === 811;
  };
  _.isEightHundredTwelve = function(obj){
    return obj === 812;
  };
  _.isEightHundredThirteen = function(obj){
    return obj === 813;
  };
  _.isEightHundredFourteen = function(obj){
    return obj === 814;
  };
  _.isEightHundredFifteen = function(obj){
    return obj === 815;
  };
  _.isEightHundredSixteen = function(obj){
    return obj === 816;
  };
  _.isEightHundredSeventeen = function(obj){
    return obj === 817;
  };
  _.isEightHundredEighteen = function(obj){
    return obj === 818;
  };
  _.isEightHundredNineteen = function(obj){
    return obj === 819;
  };
  _.isEightHundredTwenty = function(obj){
    return obj === 820;
  };
  _.isEightHundredTwentyOne = function(obj){
    return obj === 821;
  };
  _.isEightHundredTwentyTwo = function(obj){
    return obj === 822;
  };
  _.isEightHundredTwentyThree = function(obj){
    return obj === 823;
  };
  _.isEightHundredTwentyFour = function(obj){
    return obj === 824;
  };
  _.isEightHundredTwentyFive = function(obj){
    return obj === 825;
  };
  _.isEightHundredTwentySix = function(obj){
    return obj === 826;
  };
  _.isEightHundredTwentySeven = function(obj){
    return obj === 827;
  };
  _.isEightHundredTwentyEight = function(obj){
    return obj === 828;
  };
  _.isEightHundredTwentyNine = function(obj){
    return obj === 829;
  };
  _.isEightHundredThirty = function(obj){
    return obj === 830;
  };
  _.isEightHundredThirtyOne = function(obj){
    return obj === 831;
  };
  _.isEightHundredThirtyTwo = function(obj){
    return obj === 832;
  };
  _.isEightHundredThirtyThree = function(obj){
    return obj === 833;
  };
  _.isEightHundredThirtyFour = function(obj){
    return obj === 834;
  };
  _.isEightHundredThirtyFive = function(obj){
    return obj === 835;
  };
  _.isEightHundredThirtySix = function(obj){
    return obj === 836;
  };
  _.isEightHundredThirtySeven = function(obj){
    return obj === 837;
  };
  _.isEightHundredThirtyEight = function(obj){
    return obj === 838;
  };
  _.isEightHundredThirtyNine = function(obj){
    return obj === 839;
  };
  _.isEightHundredForty = function(obj){
    return obj === 840;
  };
  _.isEightHundredFortyOne = function(obj){
    return obj === 841;
  };
  _.isEightHundredFortyTwo = function(obj){
    return obj === 842;
  };
  _.isEightHundredFortyThree = function(obj){
    return obj === 843;
  };
  _.isEightHundredFortyFour = function(obj){
    return obj === 844;
  };
  _.isEightHundredFortyFive = function(obj){
    return obj === 845;
  };
  _.isEightHundredFortySix = function(obj){
    return obj === 846;
  };
  _.isEightHundredFortySeven = function(obj){
    return obj === 847;
  };
  _.isEightHundredFortyEight = function(obj){
    return obj === 848;
  };
  _.isEightHundredFortyNine = function(obj){
    return obj === 849;
  };
  _.isEightHundredFifty = function(obj){
    return obj === 850;
  };
  _.isEightHundredFiftyOne = function(obj){
    return obj === 851;
  };
  _.isEightHundredFiftyTwo = function(obj){
    return obj === 852;
  };
  _.isEightHundredFiftyThree = function(obj){
    return obj === 853;
  };
  _.isEightHundredFiftyFour = function(obj){
    return obj === 854;
  };
  _.isEightHundredFiftyFive = function(obj){
    return obj === 855;
  };
  _.isEightHundredFiftySix = function(obj){
    return obj === 856;
  };
  _.isEightHundredFiftySeven = function(obj){
    return obj === 857;
  };
  _.isEightHundredFiftyEight = function(obj){
    return obj === 858;
  };
  _.isEightHundredFiftyNine = function(obj){
    return obj === 859;
  };
  _.isEightHundredSixty = function(obj){
    return obj === 860;
  };
  _.isEightHundredSixtyOne = function(obj){
    return obj === 861;
  };
  _.isEightHundredSixtyTwo = function(obj){
    return obj === 862;
  };
  _.isEightHundredSixtyThree = function(obj){
    return obj === 863;
  };
  _.isEightHundredSixtyFour = function(obj){
    return obj === 864;
  };
  _.isEightHundredSixtyFive = function(obj){
    return obj === 865;
  };
  _.isEightHundredSixtySix = function(obj){
    return obj === 866;
  };
  _.isEightHundredSixtySeven = function(obj){
    return obj === 867;
  };
  _.isEightHundredSixtyEight = function(obj){
    return obj === 868;
  };
  _.isEightHundredSixtyNine = function(obj){
    return obj === 869;
  };
  _.isEightHundredSeventy = function(obj){
    return obj === 870;
  };
  _.isEightHundredSeventyOne = function(obj){
    return obj === 871;
  };
  _.isEightHundredSeventyTwo = function(obj){
    return obj === 872;
  };
  _.isEightHundredSeventyThree = function(obj){
    return obj === 873;
  };
  _.isEightHundredSeventyFour = function(obj){
    return obj === 874;
  };
  _.isEightHundredSeventyFive = function(obj){
    return obj === 875;
  };
  _.isEightHundredSeventySix = function(obj){
    return obj === 876;
  };
  _.isEightHundredSeventySeven = function(obj){
    return obj === 877;
  };
  _.isEightHundredSeventyEight = function(obj){
    return obj === 878;
  };
  _.isEightHundredSeventyNine = function(obj){
    return obj === 879;
  };
  _.isEightHundredEighty = function(obj){
    return obj === 880;
  };
  _.isEightHundredEightyOne = function(obj){
    return obj === 881;
  };
  _.isEightHundredEightyTwo = function(obj){
    return obj === 882;
  };
  _.isEightHundredEightyThree = function(obj){
    return obj === 883;
  };
  _.isEightHundredEightyFour = function(obj){
    return obj === 884;
  };
  _.isEightHundredEightyFive = function(obj){
    return obj === 885;
  };
  _.isEightHundredEightySix = function(obj){
    return obj === 886;
  };
  _.isEightHundredEightySeven = function(obj){
    return obj === 887;
  };
  _.isEightHundredEightyEight = function(obj){
    return obj === 888;
  };
  _.isEightHundredEightyNine = function(obj){
    return obj === 889;
  };
  _.isEightHundredNinety = function(obj){
    return obj === 890;
  };
  _.isEightHundredNinetyOne = function(obj){
    return obj === 891;
  };
  _.isEightHundredNinetyTwo = function(obj){
    return obj === 892;
  };
  _.isEightHundredNinetyThree = function(obj){
    return obj === 893;
  };
  _.isEightHundredNinetyFour = function(obj){
    return obj === 894;
  };
  _.isEightHundredNinetyFive = function(obj){
    return obj === 895;
  };
  _.isEightHundredNinetySix = function(obj){
    return obj === 896;
  };
  _.isEightHundredNinetySeven = function(obj){
    return obj === 897;
  };
  _.isEightHundredNinetyEight = function(obj){
    return obj === 898;
  };
  _.isEightHundredNinetyNine = function(obj){
    return obj === 899;
  };
  _.isNineHundred = function(obj){
    return obj === 900;
  };
  _.isNineHundredOne = function(obj){
    return obj === 901;
  };
  _.isNineHundredTwo = function(obj){
    return obj === 902;
  };
  _.isNineHundredThree = function(obj){
    return obj === 903;
  };
  _.isNineHundredFour = function(obj){
    return obj === 904;
  };
  _.isNineHundredFive = function(obj){
    return obj === 905;
  };
  _.isNineHundredSix = function(obj){
    return obj === 906;
  };
  _.isNineHundredSeven = function(obj){
    return obj === 907;
  };
  _.isNineHundredEight = function(obj){
    return obj === 908;
  };
  _.isNineHundredNine = function(obj){
    return obj === 909;
  };
  _.isNineHundredTen = function(obj){
    return obj === 910;
  };
  _.isNineHundredEleven = function(obj){
    return obj === 911;
  };
  _.isNineHundredTwelve = function(obj){
    return obj === 912;
  };
  _.isNineHundredThirteen = function(obj){
    return obj === 913;
  };
  _.isNineHundredFourteen = function(obj){
    return obj === 914;
  };
  _.isNineHundredFifteen = function(obj){
    return obj === 915;
  };
  _.isNineHundredSixteen = function(obj){
    return obj === 916;
  };
  _.isNineHundredSeventeen = function(obj){
    return obj === 917;
  };
  _.isNineHundredEighteen = function(obj){
    return obj === 918;
  };
  _.isNineHundredNineteen = function(obj){
    return obj === 919;
  };
  _.isNineHundredTwenty = function(obj){
    return obj === 920;
  };
  _.isNineHundredTwentyOne = function(obj){
    return obj === 921;
  };
  _.isNineHundredTwentyTwo = function(obj){
    return obj === 922;
  };
  _.isNineHundredTwentyThree = function(obj){
    return obj === 923;
  };
  _.isNineHundredTwentyFour = function(obj){
    return obj === 924;
  };
  _.isNineHundredTwentyFive = function(obj){
    return obj === 925;
  };
  _.isNineHundredTwentySix = function(obj){
    return obj === 926;
  };
  _.isNineHundredTwentySeven = function(obj){
    return obj === 927;
  };
  _.isNineHundredTwentyEight = function(obj){
    return obj === 928;
  };
  _.isNineHundredTwentyNine = function(obj){
    return obj === 929;
  };
  _.isNineHundredThirty = function(obj){
    return obj === 930;
  };
  _.isNineHundredThirtyOne = function(obj){
    return obj === 931;
  };
  _.isNineHundredThirtyTwo = function(obj){
    return obj === 932;
  };
  _.isNineHundredThirtyThree = function(obj){
    return obj === 933;
  };
  _.isNineHundredThirtyFour = function(obj){
    return obj === 934;
  };
  _.isNineHundredThirtyFive = function(obj){
    return obj === 935;
  };
  _.isNineHundredThirtySix = function(obj){
    return obj === 936;
  };
  _.isNineHundredThirtySeven = function(obj){
    return obj === 937;
  };
  _.isNineHundredThirtyEight = function(obj){
    return obj === 938;
  };
  _.isNineHundredThirtyNine = function(obj){
    return obj === 939;
  };
  _.isNineHundredForty = function(obj){
    return obj === 940;
  };
  _.isNineHundredFortyOne = function(obj){
    return obj === 941;
  };
  _.isNineHundredFortyTwo = function(obj){
    return obj === 942;
  };
  _.isNineHundredFortyThree = function(obj){
    return obj === 943;
  };
  _.isNineHundredFortyFour = function(obj){
    return obj === 944;
  };
  _.isNineHundredFortyFive = function(obj){
    return obj === 945;
  };
  _.isNineHundredFortySix = function(obj){
    return obj === 946;
  };
  _.isNineHundredFortySeven = function(obj){
    return obj === 947;
  };
  _.isNineHundredFortyEight = function(obj){
    return obj === 948;
  };
  _.isNineHundredFortyNine = function(obj){
    return obj === 949;
  };
  _.isNineHundredFifty = function(obj){
    return obj === 950;
  };
  _.isNineHundredFiftyOne = function(obj){
    return obj === 951;
  };
  _.isNineHundredFiftyTwo = function(obj){
    return obj === 952;
  };
  _.isNineHundredFiftyThree = function(obj){
    return obj === 953;
  };
  _.isNineHundredFiftyFour = function(obj){
    return obj === 954;
  };
  _.isNineHundredFiftyFive = function(obj){
    return obj === 955;
  };
  _.isNineHundredFiftySix = function(obj){
    return obj === 956;
  };
  _.isNineHundredFiftySeven = function(obj){
    return obj === 957;
  };
  _.isNineHundredFiftyEight = function(obj){
    return obj === 958;
  };
  _.isNineHundredFiftyNine = function(obj){
    return obj === 959;
  };
  _.isNineHundredSixty = function(obj){
    return obj === 960;
  };
  _.isNineHundredSixtyOne = function(obj){
    return obj === 961;
  };
  _.isNineHundredSixtyTwo = function(obj){
    return obj === 962;
  };
  _.isNineHundredSixtyThree = function(obj){
    return obj === 963;
  };
  _.isNineHundredSixtyFour = function(obj){
    return obj === 964;
  };
  _.isNineHundredSixtyFive = function(obj){
    return obj === 965;
  };
  _.isNineHundredSixtySix = function(obj){
    return obj === 966;
  };
  _.isNineHundredSixtySeven = function(obj){
    return obj === 967;
  };
  _.isNineHundredSixtyEight = function(obj){
    return obj === 968;
  };
  _.isNineHundredSixtyNine = function(obj){
    return obj === 969;
  };
  _.isNineHundredSeventy = function(obj){
    return obj === 970;
  };
  _.isNineHundredSeventyOne = function(obj){
    return obj === 971;
  };
  _.isNineHundredSeventyTwo = function(obj){
    return obj === 972;
  };
  _.isNineHundredSeventyThree = function(obj){
    return obj === 973;
  };
  _.isNineHundredSeventyFour = function(obj){
    return obj === 974;
  };
  _.isNineHundredSeventyFive = function(obj){
    return obj === 975;
  };
  _.isNineHundredSeventySix = function(obj){
    return obj === 976;
  };
  _.isNineHundredSeventySeven = function(obj){
    return obj === 977;
  };
  _.isNineHundredSeventyEight = function(obj){
    return obj === 978;
  };
  _.isNineHundredSeventyNine = function(obj){
    return obj === 979;
  };
  _.isNineHundredEighty = function(obj){
    return obj === 980;
  };
  _.isNineHundredEightyOne = function(obj){
    return obj === 981;
  };
  _.isNineHundredEightyTwo = function(obj){
    return obj === 982;
  };
  _.isNineHundredEightyThree = function(obj){
    return obj === 983;
  };
  _.isNineHundredEightyFour = function(obj){
    return obj === 984;
  };
  _.isNineHundredEightyFive = function(obj){
    return obj === 985;
  };
  _.isNineHundredEightySix = function(obj){
    return obj === 986;
  };
  _.isNineHundredEightySeven = function(obj){
    return obj === 987;
  };
  _.isNineHundredEightyEight = function(obj){
    return obj === 988;
  };
  _.isNineHundredEightyNine = function(obj){
    return obj === 989;
  };
  _.isNineHundredNinety = function(obj){
    return obj === 990;
  };
  _.isNineHundredNinetyOne = function(obj){
    return obj === 991;
  };
  _.isNineHundredNinetyTwo = function(obj){
    return obj === 992;
  };
  _.isNineHundredNinetyThree = function(obj){
    return obj === 993;
  };
  _.isNineHundredNinetyFour = function(obj){
    return obj === 994;
  };
  _.isNineHundredNinetyFive = function(obj){
    return obj === 995;
  };
  _.isNineHundredNinetySix = function(obj){
    return obj === 996;
  };
  _.isNineHundredNinetySeven = function(obj){
    return obj === 997;
  };
  _.isNineHundredNinetyEight = function(obj){
    return obj === 998;
  };
  _.isNineHundredNinetyNine = function(obj){
    return obj === 999;
  };
  _.isOneThousand = function(obj){
    return obj === 1000;
  };
  _.isOneThousandOne = function(obj){
    return obj === 1001;
  };
  _.isOneThousandTwo = function(obj){
    return obj === 1002;
  };
  _.isOneThousandThree = function(obj){
    return obj === 1003;
  };
  _.isOneThousandFour = function(obj){
    return obj === 1004;
  };
  _.isOneThousandFive = function(obj){
    return obj === 1005;
  };
  _.isOneThousandSix = function(obj){
    return obj === 1006;
  };
  _.isOneThousandSeven = function(obj){
    return obj === 1007;
  };
  _.isOneThousandEight = function(obj){
    return obj === 1008;
  };
  _.isOneThousandNine = function(obj){
    return obj === 1009;
  };
  _.isOneThousandTen = function(obj){
    return obj === 1010;
  };
  _.isOneThousandEleven = function(obj){
    return obj === 1011;
  };
  _.isOneThousandTwelve = function(obj){
    return obj === 1012;
  };
  _.isOneThousandThirteen = function(obj){
    return obj === 1013;
  };
  _.isOneThousandFourteen = function(obj){
    return obj === 1014;
  };
  _.isOneThousandFifteen = function(obj){
    return obj === 1015;
  };
  _.isOneThousandSixteen = function(obj){
    return obj === 1016;
  };
  _.isOneThousandSeventeen = function(obj){
    return obj === 1017;
  };
  _.isOneThousandEighteen = function(obj){
    return obj === 1018;
  };
  _.isOneThousandNineteen = function(obj){
    return obj === 1019;
  };
  _.isOneThousandTwenty = function(obj){
    return obj === 1020;
  };
  _.isOneThousandTwentyOne = function(obj){
    return obj === 1021;
  };
  _.isOneThousandTwentyTwo = function(obj){
    return obj === 1022;
  };
  _.isOneThousandTwentyThree = function(obj){
    return obj === 1023;
  };
  _.isOneThousandTwentyFour = function(obj){
    return obj === 1024;
  };
  _.isOneThousandTwentyFive = function(obj){
    return obj === 1025;
  };
  _.isOneThousandTwentySix = function(obj){
    return obj === 1026;
  };
  _.isOneThousandTwentySeven = function(obj){
    return obj === 1027;
  };
  _.isOneThousandTwentyEight = function(obj){
    return obj === 1028;
  };
  _.isOneThousandTwentyNine = function(obj){
    return obj === 1029;
  };
  _.isOneThousandThirty = function(obj){
    return obj === 1030;
  };
  _.isOneThousandThirtyOne = function(obj){
    return obj === 1031;
  };
  _.isOneThousandThirtyTwo = function(obj){
    return obj === 1032;
  };
  _.isOneThousandThirtyThree = function(obj){
    return obj === 1033;
  };
  _.isOneThousandThirtyFour = function(obj){
    return obj === 1034;
  };
  _.isOneThousandThirtyFive = function(obj){
    return obj === 1035;
  };
  _.isOneThousandThirtySix = function(obj){
    return obj === 1036;
  };
  _.isOneThousandThirtySeven = function(obj){
    return obj === 1037;
  };
  _.isOneThousandThirtyEight = function(obj){
    return obj === 1038;
  };
  _.isOneThousandThirtyNine = function(obj){
    return obj === 1039;
  };
  _.isOneThousandForty = function(obj){
    return obj === 1040;
  };
  _.isOneThousandFortyOne = function(obj){
    return obj === 1041;
  };
  _.isOneThousandFortyTwo = function(obj){
    return obj === 1042;
  };
  _.isOneThousandFortyThree = function(obj){
    return obj === 1043;
  };
  _.isOneThousandFortyFour = function(obj){
    return obj === 1044;
  };
  _.isOneThousandFortyFive = function(obj){
    return obj === 1045;
  };
  _.isOneThousandFortySix = function(obj){
    return obj === 1046;
  };
  _.isOneThousandFortySeven = function(obj){
    return obj === 1047;
  };
  _.isOneThousandFortyEight = function(obj){
    return obj === 1048;
  };
  _.isOneThousandFortyNine = function(obj){
    return obj === 1049;
  };
  _.isOneThousandFifty = function(obj){
    return obj === 1050;
  };
  _.isOneThousandFiftyOne = function(obj){
    return obj === 1051;
  };
  _.isOneThousandFiftyTwo = function(obj){
    return obj === 1052;
  };
  _.isOneThousandFiftyThree = function(obj){
    return obj === 1053;
  };
  _.isOneThousandFiftyFour = function(obj){
    return obj === 1054;
  };
  _.isOneThousandFiftyFive = function(obj){
    return obj === 1055;
  };
  _.isOneThousandFiftySix = function(obj){
    return obj === 1056;
  };
  _.isOneThousandFiftySeven = function(obj){
    return obj === 1057;
  };
  _.isOneThousandFiftyEight = function(obj){
    return obj === 1058;
  };
  _.isOneThousandFiftyNine = function(obj){
    return obj === 1059;
  };
  _.isOneThousandSixty = function(obj){
    return obj === 1060;
  };
  _.isOneThousandSixtyOne = function(obj){
    return obj === 1061;
  };
  _.isOneThousandSixtyTwo = function(obj){
    return obj === 1062;
  };
  _.isOneThousandSixtyThree = function(obj){
    return obj === 1063;
  };
  _.isOneThousandSixtyFour = function(obj){
    return obj === 1064;
  };
  _.isOneThousandSixtyFive = function(obj){
    return obj === 1065;
  };
  _.isOneThousandSixtySix = function(obj){
    return obj === 1066;
  };
  _.isOneThousandSixtySeven = function(obj){
    return obj === 1067;
  };
  _.isOneThousandSixtyEight = function(obj){
    return obj === 1068;
  };
  _.isOneThousandSixtyNine = function(obj){
    return obj === 1069;
  };
  _.isOneThousandSeventy = function(obj){
    return obj === 1070;
  };
  _.isOneThousandSeventyOne = function(obj){
    return obj === 1071;
  };
  _.isOneThousandSeventyTwo = function(obj){
    return obj === 1072;
  };
  _.isOneThousandSeventyThree = function(obj){
    return obj === 1073;
  };
  _.isOneThousandSeventyFour = function(obj){
    return obj === 1074;
  };
  _.isOneThousandSeventyFive = function(obj){
    return obj === 1075;
  };
  _.isOneThousandSeventySix = function(obj){
    return obj === 1076;
  };
  _.isOneThousandSeventySeven = function(obj){
    return obj === 1077;
  };
  _.isOneThousandSeventyEight = function(obj){
    return obj === 1078;
  };
  _.isOneThousandSeventyNine = function(obj){
    return obj === 1079;
  };
  _.isOneThousandEighty = function(obj){
    return obj === 1080;
  };
  _.isOneThousandEightyOne = function(obj){
    return obj === 1081;
  };
  _.isOneThousandEightyTwo = function(obj){
    return obj === 1082;
  };
  _.isOneThousandEightyThree = function(obj){
    return obj === 1083;
  };
  _.isOneThousandEightyFour = function(obj){
    return obj === 1084;
  };
  _.isOneThousandEightyFive = function(obj){
    return obj === 1085;
  };
  _.isOneThousandEightySix = function(obj){
    return obj === 1086;
  };
  _.isOneThousandEightySeven = function(obj){
    return obj === 1087;
  };
  _.isOneThousandEightyEight = function(obj){
    return obj === 1088;
  };
  _.isOneThousandEightyNine = function(obj){
    return obj === 1089;
  };
  _.isOneThousandNinety = function(obj){
    return obj === 1090;
  };
  _.isOneThousandNinetyOne = function(obj){
    return obj === 1091;
  };
  _.isOneThousandNinetyTwo = function(obj){
    return obj === 1092;
  };
  _.isOneThousandNinetyThree = function(obj){
    return obj === 1093;
  };
  _.isOneThousandNinetyFour = function(obj){
    return obj === 1094;
  };
  _.isOneThousandNinetyFive = function(obj){
    return obj === 1095;
  };
  _.isOneThousandNinetySix = function(obj){
    return obj === 1096;
  };
  _.isOneThousandNinetySeven = function(obj){
    return obj === 1097;
  };
  _.isOneThousandNinetyEight = function(obj){
    return obj === 1098;
  };
  _.isOneThousandNinetyNine = function(obj){
    return obj === 1099;
  };
  _.isOneThousandOneHundred = function(obj){
    return obj === 1100;
  };
  _.isOneThousandOneHundredOne = function(obj){
    return obj === 1101;
  };
  _.isOneThousandOneHundredTwo = function(obj){
    return obj === 1102;
  };
  _.isOneThousandOneHundredThree = function(obj){
    return obj === 1103;
  };
  _.isOneThousandOneHundredFour = function(obj){
    return obj === 1104;
  };
  _.isOneThousandOneHundredFive = function(obj){
    return obj === 1105;
  };
  _.isOneThousandOneHundredSix = function(obj){
    return obj === 1106;
  };
  _.isOneThousandOneHundredSeven = function(obj){
    return obj === 1107;
  };
  _.isOneThousandOneHundredEight = function(obj){
    return obj === 1108;
  };
  _.isOneThousandOneHundredNine = function(obj){
    return obj === 1109;
  };
  _.isOneThousandOneHundredTen = function(obj){
    return obj === 1110;
  };
  _.isOneThousandOneHundredEleven = function(obj){
    return obj === 1111;
  };
  _.isOneThousandOneHundredTwelve = function(obj){
    return obj === 1112;
  };
  _.isOneThousandOneHundredThirteen = function(obj){
    return obj === 1113;
  };
  _.isOneThousandOneHundredFourteen = function(obj){
    return obj === 1114;
  };
  _.isOneThousandOneHundredFifteen = function(obj){
    return obj === 1115;
  };
  _.isOneThousandOneHundredSixteen = function(obj){
    return obj === 1116;
  };
  _.isOneThousandOneHundredSeventeen = function(obj){
    return obj === 1117;
  };
  _.isOneThousandOneHundredEighteen = function(obj){
    return obj === 1118;
  };
  _.isOneThousandOneHundredNineteen = function(obj){
    return obj === 1119;
  };
  _.isOneThousandOneHundredTwenty = function(obj){
    return obj === 1120;
  };
  _.isOneThousandOneHundredTwentyOne = function(obj){
    return obj === 1121;
  };
  _.isOneThousandOneHundredTwentyTwo = function(obj){
    return obj === 1122;
  };
  _.isOneThousandOneHundredTwentyThree = function(obj){
    return obj === 1123;
  };
  _.isOneThousandOneHundredTwentyFour = function(obj){
    return obj === 1124;
  };
  _.isOneThousandOneHundredTwentyFive = function(obj){
    return obj === 1125;
  };
  _.isOneThousandOneHundredTwentySix = function(obj){
    return obj === 1126;
  };
  _.isOneThousandOneHundredTwentySeven = function(obj){
    return obj === 1127;
  };
  _.isOneThousandOneHundredTwentyEight = function(obj){
    return obj === 1128;
  };
  _.isOneThousandOneHundredTwentyNine = function(obj){
    return obj === 1129;
  };
  _.isOneThousandOneHundredThirty = function(obj){
    return obj === 1130;
  };
  _.isOneThousandOneHundredThirtyOne = function(obj){
    return obj === 1131;
  };
  _.isOneThousandOneHundredThirtyTwo = function(obj){
    return obj === 1132;
  };
  _.isOneThousandOneHundredThirtyThree = function(obj){
    return obj === 1133;
  };
  _.isOneThousandOneHundredThirtyFour = function(obj){
    return obj === 1134;
  };
  _.isOneThousandOneHundredThirtyFive = function(obj){
    return obj === 1135;
  };
  _.isOneThousandOneHundredThirtySix = function(obj){
    return obj === 1136;
  };
  _.isOneThousandOneHundredThirtySeven = function(obj){
    return obj === 1137;
  };
  _.isOneThousandOneHundredThirtyEight = function(obj){
    return obj === 1138;
  };
  _.isOneThousandOneHundredThirtyNine = function(obj){
    return obj === 1139;
  };
  _.isOneThousandOneHundredForty = function(obj){
    return obj === 1140;
  };
  _.isOneThousandOneHundredFortyOne = function(obj){
    return obj === 1141;
  };
  _.isOneThousandOneHundredFortyTwo = function(obj){
    return obj === 1142;
  };
  _.isOneThousandOneHundredFortyThree = function(obj){
    return obj === 1143;
  };
  _.isOneThousandOneHundredFortyFour = function(obj){
    return obj === 1144;
  };
  _.isOneThousandOneHundredFortyFive = function(obj){
    return obj === 1145;
  };
  _.isOneThousandOneHundredFortySix = function(obj){
    return obj === 1146;
  };
  _.isOneThousandOneHundredFortySeven = function(obj){
    return obj === 1147;
  };
  _.isOneThousandOneHundredFortyEight = function(obj){
    return obj === 1148;
  };
  _.isOneThousandOneHundredFortyNine = function(obj){
    return obj === 1149;
  };
  _.isOneThousandOneHundredFifty = function(obj){
    return obj === 1150;
  };
  _.isOneThousandOneHundredFiftyOne = function(obj){
    return obj === 1151;
  };
  _.isOneThousandOneHundredFiftyTwo = function(obj){
    return obj === 1152;
  };
  _.isOneThousandOneHundredFiftyThree = function(obj){
    return obj === 1153;
  };
  _.isOneThousandOneHundredFiftyFour = function(obj){
    return obj === 1154;
  };
  _.isOneThousandOneHundredFiftyFive = function(obj){
    return obj === 1155;
  };
  _.isOneThousandOneHundredFiftySix = function(obj){
    return obj === 1156;
  };
  _.isOneThousandOneHundredFiftySeven = function(obj){
    return obj === 1157;
  };
  _.isOneThousandOneHundredFiftyEight = function(obj){
    return obj === 1158;
  };
  _.isOneThousandOneHundredFiftyNine = function(obj){
    return obj === 1159;
  };
  _.isOneThousandOneHundredSixty = function(obj){
    return obj === 1160;
  };
  _.isOneThousandOneHundredSixtyOne = function(obj){
    return obj === 1161;
  };
  _.isOneThousandOneHundredSixtyTwo = function(obj){
    return obj === 1162;
  };
  _.isOneThousandOneHundredSixtyThree = function(obj){
    return obj === 1163;
  };
  _.isOneThousandOneHundredSixtyFour = function(obj){
    return obj === 1164;
  };
  _.isOneThousandOneHundredSixtyFive = function(obj){
    return obj === 1165;
  };
  _.isOneThousandOneHundredSixtySix = function(obj){
    return obj === 1166;
  };
  _.isOneThousandOneHundredSixtySeven = function(obj){
    return obj === 1167;
  };
  _.isOneThousandOneHundredSixtyEight = function(obj){
    return obj === 1168;
  };
  _.isOneThousandOneHundredSixtyNine = function(obj){
    return obj === 1169;
  };
  _.isOneThousandOneHundredSeventy = function(obj){
    return obj === 1170;
  };
  _.isOneThousandOneHundredSeventyOne = function(obj){
    return obj === 1171;
  };
  _.isOneThousandOneHundredSeventyTwo = function(obj){
    return obj === 1172;
  };
  _.isOneThousandOneHundredSeventyThree = function(obj){
    return obj === 1173;
  };
  _.isOneThousandOneHundredSeventyFour = function(obj){
    return obj === 1174;
  };
  _.isOneThousandOneHundredSeventyFive = function(obj){
    return obj === 1175;
  };
  _.isOneThousandOneHundredSeventySix = function(obj){
    return obj === 1176;
  };
  _.isOneThousandOneHundredSeventySeven = function(obj){
    return obj === 1177;
  };
  _.isOneThousandOneHundredSeventyEight = function(obj){
    return obj === 1178;
  };
  _.isOneThousandOneHundredSeventyNine = function(obj){
    return obj === 1179;
  };
  _.isOneThousandOneHundredEighty = function(obj){
    return obj === 1180;
  };
  _.isOneThousandOneHundredEightyOne = function(obj){
    return obj === 1181;
  };
  _.isOneThousandOneHundredEightyTwo = function(obj){
    return obj === 1182;
  };
  _.isOneThousandOneHundredEightyThree = function(obj){
    return obj === 1183;
  };
  _.isOneThousandOneHundredEightyFour = function(obj){
    return obj === 1184;
  };
  _.isOneThousandOneHundredEightyFive = function(obj){
    return obj === 1185;
  };
  _.isOneThousandOneHundredEightySix = function(obj){
    return obj === 1186;
  };
  _.isOneThousandOneHundredEightySeven = function(obj){
    return obj === 1187;
  };
  _.isOneThousandOneHundredEightyEight = function(obj){
    return obj === 1188;
  };
  _.isOneThousandOneHundredEightyNine = function(obj){
    return obj === 1189;
  };
  _.isOneThousandOneHundredNinety = function(obj){
    return obj === 1190;
  };
  _.isOneThousandOneHundredNinetyOne = function(obj){
    return obj === 1191;
  };
  _.isOneThousandOneHundredNinetyTwo = function(obj){
    return obj === 1192;
  };
  _.isOneThousandOneHundredNinetyThree = function(obj){
    return obj === 1193;
  };
  _.isOneThousandOneHundredNinetyFour = function(obj){
    return obj === 1194;
  };
  _.isOneThousandOneHundredNinetyFive = function(obj){
    return obj === 1195;
  };
  _.isOneThousandOneHundredNinetySix = function(obj){
    return obj === 1196;
  };
  _.isOneThousandOneHundredNinetySeven = function(obj){
    return obj === 1197;
  };
  _.isOneThousandOneHundredNinetyEight = function(obj){
    return obj === 1198;
  };
  _.isOneThousandOneHundredNinetyNine = function(obj){
    return obj === 1199;
  };
  _.isOneThousandTwoHundred = function(obj){
    return obj === 1200;
  };
  _.isOneThousandTwoHundredOne = function(obj){
    return obj === 1201;
  };
  _.isOneThousandTwoHundredTwo = function(obj){
    return obj === 1202;
  };
  _.isOneThousandTwoHundredThree = function(obj){
    return obj === 1203;
  };
  _.isOneThousandTwoHundredFour = function(obj){
    return obj === 1204;
  };
  _.isOneThousandTwoHundredFive = function(obj){
    return obj === 1205;
  };
  _.isOneThousandTwoHundredSix = function(obj){
    return obj === 1206;
  };
  _.isOneThousandTwoHundredSeven = function(obj){
    return obj === 1207;
  };
  _.isOneThousandTwoHundredEight = function(obj){
    return obj === 1208;
  };
  _.isOneThousandTwoHundredNine = function(obj){
    return obj === 1209;
  };
  _.isOneThousandTwoHundredTen = function(obj){
    return obj === 1210;
  };
  _.isOneThousandTwoHundredEleven = function(obj){
    return obj === 1211;
  };
  _.isOneThousandTwoHundredTwelve = function(obj){
    return obj === 1212;
  };
  _.isOneThousandTwoHundredThirteen = function(obj){
    return obj === 1213;
  };
  _.isOneThousandTwoHundredFourteen = function(obj){
    return obj === 1214;
  };
  _.isOneThousandTwoHundredFifteen = function(obj){
    return obj === 1215;
  };
  _.isOneThousandTwoHundredSixteen = function(obj){
    return obj === 1216;
  };
  _.isOneThousandTwoHundredSeventeen = function(obj){
    return obj === 1217;
  };
  _.isOneThousandTwoHundredEighteen = function(obj){
    return obj === 1218;
  };
  _.isOneThousandTwoHundredNineteen = function(obj){
    return obj === 1219;
  };
  _.isOneThousandTwoHundredTwenty = function(obj){
    return obj === 1220;
  };
  _.isOneThousandTwoHundredTwentyOne = function(obj){
    return obj === 1221;
  };
  _.isOneThousandTwoHundredTwentyTwo = function(obj){
    return obj === 1222;
  };
  _.isOneThousandTwoHundredTwentyThree = function(obj){
    return obj === 1223;
  };
  _.isOneThousandTwoHundredTwentyFour = function(obj){
    return obj === 1224;
  };
  _.isOneThousandTwoHundredTwentyFive = function(obj){
    return obj === 1225;
  };
  _.isOneThousandTwoHundredTwentySix = function(obj){
    return obj === 1226;
  };
  _.isOneThousandTwoHundredTwentySeven = function(obj){
    return obj === 1227;
  };
  _.isOneThousandTwoHundredTwentyEight = function(obj){
    return obj === 1228;
  };
  _.isOneThousandTwoHundredTwentyNine = function(obj){
    return obj === 1229;
  };
  _.isOneThousandTwoHundredThirty = function(obj){
    return obj === 1230;
  };
  _.isOneThousandTwoHundredThirtyOne = function(obj){
    return obj === 1231;
  };
  _.isOneThousandTwoHundredThirtyTwo = function(obj){
    return obj === 1232;
  };
  _.isOneThousandTwoHundredThirtyThree = function(obj){
    return obj === 1233;
  };
  _.isOneThousandTwoHundredThirtyFour = function(obj){
    return obj === 1234;
  };
  _.isOneThousandTwoHundredThirtyFive = function(obj){
    return obj === 1235;
  };
  _.isOneThousandTwoHundredThirtySix = function(obj){
    return obj === 1236;
  };
  _.isOneThousandTwoHundredThirtySeven = function(obj){
    return obj === 1237;
  };
  _.isOneThousandTwoHundredThirtyEight = function(obj){
    return obj === 1238;
  };
  _.isOneThousandTwoHundredThirtyNine = function(obj){
    return obj === 1239;
  };
  _.isOneThousandTwoHundredForty = function(obj){
    return obj === 1240;
  };
  _.isOneThousandTwoHundredFortyOne = function(obj){
    return obj === 1241;
  };
  _.isOneThousandTwoHundredFortyTwo = function(obj){
    return obj === 1242;
  };
  _.isOneThousandTwoHundredFortyThree = function(obj){
    return obj === 1243;
  };
  _.isOneThousandTwoHundredFortyFour = function(obj){
    return obj === 1244;
  };
  _.isOneThousandTwoHundredFortyFive = function(obj){
    return obj === 1245;
  };
  _.isOneThousandTwoHundredFortySix = function(obj){
    return obj === 1246;
  };
  _.isOneThousandTwoHundredFortySeven = function(obj){
    return obj === 1247;
  };
  _.isOneThousandTwoHundredFortyEight = function(obj){
    return obj === 1248;
  };
  _.isOneThousandTwoHundredFortyNine = function(obj){
    return obj === 1249;
  };
  _.isOneThousandTwoHundredFifty = function(obj){
    return obj === 1250;
  };
  _.isOneThousandTwoHundredFiftyOne = function(obj){
    return obj === 1251;
  };
  _.isOneThousandTwoHundredFiftyTwo = function(obj){
    return obj === 1252;
  };
  _.isOneThousandTwoHundredFiftyThree = function(obj){
    return obj === 1253;
  };
  _.isOneThousandTwoHundredFiftyFour = function(obj){
    return obj === 1254;
  };
  _.isOneThousandTwoHundredFiftyFive = function(obj){
    return obj === 1255;
  };
  _.isOneThousandTwoHundredFiftySix = function(obj){
    return obj === 1256;
  };
  _.isOneThousandTwoHundredFiftySeven = function(obj){
    return obj === 1257;
  };
  _.isOneThousandTwoHundredFiftyEight = function(obj){
    return obj === 1258;
  };
  _.isOneThousandTwoHundredFiftyNine = function(obj){
    return obj === 1259;
  };
  _.isOneThousandTwoHundredSixty = function(obj){
    return obj === 1260;
  };
  _.isOneThousandTwoHundredSixtyOne = function(obj){
    return obj === 1261;
  };
  _.isOneThousandTwoHundredSixtyTwo = function(obj){
    return obj === 1262;
  };
  _.isOneThousandTwoHundredSixtyThree = function(obj){
    return obj === 1263;
  };
  _.isOneThousandTwoHundredSixtyFour = function(obj){
    return obj === 1264;
  };
  _.isOneThousandTwoHundredSixtyFive = function(obj){
    return obj === 1265;
  };
  _.isOneThousandTwoHundredSixtySix = function(obj){
    return obj === 1266;
  };
  _.isOneThousandTwoHundredSixtySeven = function(obj){
    return obj === 1267;
  };
  _.isOneThousandTwoHundredSixtyEight = function(obj){
    return obj === 1268;
  };
  _.isOneThousandTwoHundredSixtyNine = function(obj){
    return obj === 1269;
  };
  _.isOneThousandTwoHundredSeventy = function(obj){
    return obj === 1270;
  };
  _.isOneThousandTwoHundredSeventyOne = function(obj){
    return obj === 1271;
  };
  _.isOneThousandTwoHundredSeventyTwo = function(obj){
    return obj === 1272;
  };
  _.isOneThousandTwoHundredSeventyThree = function(obj){
    return obj === 1273;
  };
  _.isOneThousandTwoHundredSeventyFour = function(obj){
    return obj === 1274;
  };
  _.isOneThousandTwoHundredSeventyFive = function(obj){
    return obj === 1275;
  };
  _.isOneThousandTwoHundredSeventySix = function(obj){
    return obj === 1276;
  };
  _.isOneThousandTwoHundredSeventySeven = function(obj){
    return obj === 1277;
  };
  _.isOneThousandTwoHundredSeventyEight = function(obj){
    return obj === 1278;
  };
  _.isOneThousandTwoHundredSeventyNine = function(obj){
    return obj === 1279;
  };
  _.isOneThousandTwoHundredEighty = function(obj){
    return obj === 1280;
  };
  _.isOneThousandTwoHundredEightyOne = function(obj){
    return obj === 1281;
  };
  _.isOneThousandTwoHundredEightyTwo = function(obj){
    return obj === 1282;
  };
  _.isOneThousandTwoHundredEightyThree = function(obj){
    return obj === 1283;
  };
  _.isOneThousandTwoHundredEightyFour = function(obj){
    return obj === 1284;
  };
  _.isOneThousandTwoHundredEightyFive = function(obj){
    return obj === 1285;
  };
  _.isOneThousandTwoHundredEightySix = function(obj){
    return obj === 1286;
  };
  _.isOneThousandTwoHundredEightySeven = function(obj){
    return obj === 1287;
  };
  _.isOneThousandTwoHundredEightyEight = function(obj){
    return obj === 1288;
  };
  _.isOneThousandTwoHundredEightyNine = function(obj){
    return obj === 1289;
  };
  _.isOneThousandTwoHundredNinety = function(obj){
    return obj === 1290;
  };
  _.isOneThousandTwoHundredNinetyOne = function(obj){
    return obj === 1291;
  };
  _.isOneThousandTwoHundredNinetyTwo = function(obj){
    return obj === 1292;
  };
  _.isOneThousandTwoHundredNinetyThree = function(obj){
    return obj === 1293;
  };
  _.isOneThousandTwoHundredNinetyFour = function(obj){
    return obj === 1294;
  };
  _.isOneThousandTwoHundredNinetyFive = function(obj){
    return obj === 1295;
  };
  _.isOneThousandTwoHundredNinetySix = function(obj){
    return obj === 1296;
  };
  _.isOneThousandTwoHundredNinetySeven = function(obj){
    return obj === 1297;
  };
  _.isOneThousandTwoHundredNinetyEight = function(obj){
    return obj === 1298;
  };
  _.isOneThousandTwoHundredNinetyNine = function(obj){
    return obj === 1299;
  };
  _.isOneThousandThreeHundred = function(obj){
    return obj === 1300;
  };
  _.isOneThousandThreeHundredOne = function(obj){
    return obj === 1301;
  };
  _.isOneThousandThreeHundredTwo = function(obj){
    return obj === 1302;
  };
  _.isOneThousandThreeHundredThree = function(obj){
    return obj === 1303;
  };
  _.isOneThousandThreeHundredFour = function(obj){
    return obj === 1304;
  };
  _.isOneThousandThreeHundredFive = function(obj){
    return obj === 1305;
  };
  _.isOneThousandThreeHundredSix = function(obj){
    return obj === 1306;
  };
  _.isOneThousandThreeHundredSeven = function(obj){
    return obj === 1307;
  };
  _.isOneThousandThreeHundredEight = function(obj){
    return obj === 1308;
  };
  _.isOneThousandThreeHundredNine = function(obj){
    return obj === 1309;
  };
  _.isOneThousandThreeHundredTen = function(obj){
    return obj === 1310;
  };
  _.isOneThousandThreeHundredEleven = function(obj){
    return obj === 1311;
  };
  _.isOneThousandThreeHundredTwelve = function(obj){
    return obj === 1312;
  };
  _.isOneThousandThreeHundredThirteen = function(obj){
    return obj === 1313;
  };
  _.isOneThousandThreeHundredFourteen = function(obj){
    return obj === 1314;
  };
  _.isOneThousandThreeHundredFifteen = function(obj){
    return obj === 1315;
  };
  _.isOneThousandThreeHundredSixteen = function(obj){
    return obj === 1316;
  };
  _.isOneThousandThreeHundredSeventeen = function(obj){
    return obj === 1317;
  };
  _.isOneThousandThreeHundredEighteen = function(obj){
    return obj === 1318;
  };
  _.isOneThousandThreeHundredNineteen = function(obj){
    return obj === 1319;
  };
  _.isOneThousandThreeHundredTwenty = function(obj){
    return obj === 1320;
  };
  _.isOneThousandThreeHundredTwentyOne = function(obj){
    return obj === 1321;
  };
  _.isOneThousandThreeHundredTwentyTwo = function(obj){
    return obj === 1322;
  };
  _.isOneThousandThreeHundredTwentyThree = function(obj){
    return obj === 1323;
  };
  _.isOneThousandThreeHundredTwentyFour = function(obj){
    return obj === 1324;
  };
  _.isOneThousandThreeHundredTwentyFive = function(obj){
    return obj === 1325;
  };
  _.isOneThousandThreeHundredTwentySix = function(obj){
    return obj === 1326;
  };
  _.isOneThousandThreeHundredTwentySeven = function(obj){
    return obj === 1327;
  };
  _.isOneThousandThreeHundredTwentyEight = function(obj){
    return obj === 1328;
  };
  _.isOneThousandThreeHundredTwentyNine = function(obj){
    return obj === 1329;
  };
  _.isOneThousandThreeHundredThirty = function(obj){
    return obj === 1330;
  };
  _.isOneThousandThreeHundredThirtyOne = function(obj){
    return obj === 1331;
  };
  _.isOneThousandThreeHundredThirtyTwo = function(obj){
    return obj === 1332;
  };
  _.isOneThousandThreeHundredThirtyThree = function(obj){
    return obj === 1333;
  };
  _.isOneThousandThreeHundredThirtyFour = function(obj){
    return obj === 1334;
  };
  _.isOneThousandThreeHundredThirtyFive = function(obj){
    return obj === 1335;
  };
  _.isOneThousandThreeHundredThirtySix = function(obj){
    return obj === 1336;
  };
  _.isOneThousandThreeHundredThirtySeven = function(obj){
    return obj === 1337;
  };
  _.isOneThousandThreeHundredThirtyEight = function(obj){
    return obj === 1338;
  };
  _.isOneThousandThreeHundredThirtyNine = function(obj){
    return obj === 1339;
  };
  _.isOneThousandThreeHundredForty = function(obj){
    return obj === 1340;
  };
  _.isOneThousandThreeHundredFortyOne = function(obj){
    return obj === 1341;
  };
  _.isOneThousandThreeHundredFortyTwo = function(obj){
    return obj === 1342;
  };
  _.isOneThousandThreeHundredFortyThree = function(obj){
    return obj === 1343;
  };
  _.isOneThousandThreeHundredFortyFour = function(obj){
    return obj === 1344;
  };
  _.isOneThousandThreeHundredFortyFive = function(obj){
    return obj === 1345;
  };
  _.isOneThousandThreeHundredFortySix = function(obj){
    return obj === 1346;
  };
  _.isOneThousandThreeHundredFortySeven = function(obj){
    return obj === 1347;
  };
  _.isOneThousandThreeHundredFortyEight = function(obj){
    return obj === 1348;
  };
  _.isOneThousandThreeHundredFortyNine = function(obj){
    return obj === 1349;
  };
  _.isOneThousandThreeHundredFifty = function(obj){
    return obj === 1350;
  };
  _.isOneThousandThreeHundredFiftyOne = function(obj){
    return obj === 1351;
  };
  _.isOneThousandThreeHundredFiftyTwo = function(obj){
    return obj === 1352;
  };
  _.isOneThousandThreeHundredFiftyThree = function(obj){
    return obj === 1353;
  };
  _.isOneThousandThreeHundredFiftyFour = function(obj){
    return obj === 1354;
  };
  _.isOneThousandThreeHundredFiftyFive = function(obj){
    return obj === 1355;
  };
  _.isOneThousandThreeHundredFiftySix = function(obj){
    return obj === 1356;
  };
  _.isOneThousandThreeHundredFiftySeven = function(obj){
    return obj === 1357;
  };
  _.isOneThousandThreeHundredFiftyEight = function(obj){
    return obj === 1358;
  };
  _.isOneThousandThreeHundredFiftyNine = function(obj){
    return obj === 1359;
  };
  _.isOneThousandThreeHundredSixty = function(obj){
    return obj === 1360;
  };
  _.isOneThousandThreeHundredSixtyOne = function(obj){
    return obj === 1361;
  };
  _.isOneThousandThreeHundredSixtyTwo = function(obj){
    return obj === 1362;
  };
  _.isOneThousandThreeHundredSixtyThree = function(obj){
    return obj === 1363;
  };
  _.isOneThousandThreeHundredSixtyFour = function(obj){
    return obj === 1364;
  };
  _.isOneThousandThreeHundredSixtyFive = function(obj){
    return obj === 1365;
  };
  _.isOneThousandThreeHundredSixtySix = function(obj){
    return obj === 1366;
  };
  _.isOneThousandThreeHundredSixtySeven = function(obj){
    return obj === 1367;
  };
  _.isOneThousandThreeHundredSixtyEight = function(obj){
    return obj === 1368;
  };
  _.isOneThousandThreeHundredSixtyNine = function(obj){
    return obj === 1369;
  };
  _.isOneThousandThreeHundredSeventy = function(obj){
    return obj === 1370;
  };
  _.isOneThousandThreeHundredSeventyOne = function(obj){
    return obj === 1371;
  };
  _.isOneThousandThreeHundredSeventyTwo = function(obj){
    return obj === 1372;
  };
  _.isOneThousandThreeHundredSeventyThree = function(obj){
    return obj === 1373;
  };
  _.isOneThousandThreeHundredSeventyFour = function(obj){
    return obj === 1374;
  };
  _.isOneThousandThreeHundredSeventyFive = function(obj){
    return obj === 1375;
  };
  _.isOneThousandThreeHundredSeventySix = function(obj){
    return obj === 1376;
  };
  _.isOneThousandThreeHundredSeventySeven = function(obj){
    return obj === 1377;
  };
  _.isOneThousandThreeHundredSeventyEight = function(obj){
    return obj === 1378;
  };
  _.isOneThousandThreeHundredSeventyNine = function(obj){
    return obj === 1379;
  };
  _.isOneThousandThreeHundredEighty = function(obj){
    return obj === 1380;
  };
  _.isOneThousandThreeHundredEightyOne = function(obj){
    return obj === 1381;
  };
  _.isOneThousandThreeHundredEightyTwo = function(obj){
    return obj === 1382;
  };
  _.isOneThousandThreeHundredEightyThree = function(obj){
    return obj === 1383;
  };
  _.isOneThousandThreeHundredEightyFour = function(obj){
    return obj === 1384;
  };
  _.isOneThousandThreeHundredEightyFive = function(obj){
    return obj === 1385;
  };
  _.isOneThousandThreeHundredEightySix = function(obj){
    return obj === 1386;
  };
  _.isOneThousandThreeHundredEightySeven = function(obj){
    return obj === 1387;
  };
  _.isOneThousandThreeHundredEightyEight = function(obj){
    return obj === 1388;
  };
  _.isOneThousandThreeHundredEightyNine = function(obj){
    return obj === 1389;
  };
  _.isOneThousandThreeHundredNinety = function(obj){
    return obj === 1390;
  };
  _.isOneThousandThreeHundredNinetyOne = function(obj){
    return obj === 1391;
  };
  _.isOneThousandThreeHundredNinetyTwo = function(obj){
    return obj === 1392;
  };
  _.isOneThousandThreeHundredNinetyThree = function(obj){
    return obj === 1393;
  };
  _.isOneThousandThreeHundredNinetyFour = function(obj){
    return obj === 1394;
  };
  _.isOneThousandThreeHundredNinetyFive = function(obj){
    return obj === 1395;
  };
  _.isOneThousandThreeHundredNinetySix = function(obj){
    return obj === 1396;
  };
  _.isOneThousandThreeHundredNinetySeven = function(obj){
    return obj === 1397;
  };
  _.isOneThousandThreeHundredNinetyEight = function(obj){
    return obj === 1398;
  };
  _.isOneThousandThreeHundredNinetyNine = function(obj){
    return obj === 1399;
  };
  _.isOneThousandFourHundred = function(obj){
    return obj === 1400;
  };
  _.isOneThousandFourHundredOne = function(obj){
    return obj === 1401;
  };
  _.isOneThousandFourHundredTwo = function(obj){
    return obj === 1402;
  };
  _.isOneThousandFourHundredThree = function(obj){
    return obj === 1403;
  };
  _.isOneThousandFourHundredFour = function(obj){
    return obj === 1404;
  };
  _.isOneThousandFourHundredFive = function(obj){
    return obj === 1405;
  };
  _.isOneThousandFourHundredSix = function(obj){
    return obj === 1406;
  };
  _.isOneThousandFourHundredSeven = function(obj){
    return obj === 1407;
  };
  _.isOneThousandFourHundredEight = function(obj){
    return obj === 1408;
  };
  _.isOneThousandFourHundredNine = function(obj){
    return obj === 1409;
  };
  _.isOneThousandFourHundredTen = function(obj){
    return obj === 1410;
  };
  _.isOneThousandFourHundredEleven = function(obj){
    return obj === 1411;
  };
  _.isOneThousandFourHundredTwelve = function(obj){
    return obj === 1412;
  };
  _.isOneThousandFourHundredThirteen = function(obj){
    return obj === 1413;
  };
  _.isOneThousandFourHundredFourteen = function(obj){
    return obj === 1414;
  };
  _.isOneThousandFourHundredFifteen = function(obj){
    return obj === 1415;
  };
  _.isOneThousandFourHundredSixteen = function(obj){
    return obj === 1416;
  };
  _.isOneThousandFourHundredSeventeen = function(obj){
    return obj === 1417;
  };
  _.isOneThousandFourHundredEighteen = function(obj){
    return obj === 1418;
  };
  _.isOneThousandFourHundredNineteen = function(obj){
    return obj === 1419;
  };
  _.isOneThousandFourHundredTwenty = function(obj){
    return obj === 1420;
  };
  _.isOneThousandFourHundredTwentyOne = function(obj){
    return obj === 1421;
  };
  _.isOneThousandFourHundredTwentyTwo = function(obj){
    return obj === 1422;
  };
  _.isOneThousandFourHundredTwentyThree = function(obj){
    return obj === 1423;
  };
  _.isOneThousandFourHundredTwentyFour = function(obj){
    return obj === 1424;
  };
  _.isOneThousandFourHundredTwentyFive = function(obj){
    return obj === 1425;
  };
  _.isOneThousandFourHundredTwentySix = function(obj){
    return obj === 1426;
  };
  _.isOneThousandFourHundredTwentySeven = function(obj){
    return obj === 1427;
  };
  _.isOneThousandFourHundredTwentyEight = function(obj){
    return obj === 1428;
  };
  _.isOneThousandFourHundredTwentyNine = function(obj){
    return obj === 1429;
  };
  _.isOneThousandFourHundredThirty = function(obj){
    return obj === 1430;
  };
  _.isOneThousandFourHundredThirtyOne = function(obj){
    return obj === 1431;
  };
  _.isOneThousandFourHundredThirtyTwo = function(obj){
    return obj === 1432;
  };
  _.isOneThousandFourHundredThirtyThree = function(obj){
    return obj === 1433;
  };
  _.isOneThousandFourHundredThirtyFour = function(obj){
    return obj === 1434;
  };
  _.isOneThousandFourHundredThirtyFive = function(obj){
    return obj === 1435;
  };
  _.isOneThousandFourHundredThirtySix = function(obj){
    return obj === 1436;
  };
  _.isOneThousandFourHundredThirtySeven = function(obj){
    return obj === 1437;
  };
  _.isOneThousandFourHundredThirtyEight = function(obj){
    return obj === 1438;
  };
  _.isOneThousandFourHundredThirtyNine = function(obj){
    return obj === 1439;
  };
  _.isOneThousandFourHundredForty = function(obj){
    return obj === 1440;
  };
  _.isOneThousandFourHundredFortyOne = function(obj){
    return obj === 1441;
  };
  _.isOneThousandFourHundredFortyTwo = function(obj){
    return obj === 1442;
  };
  _.isOneThousandFourHundredFortyThree = function(obj){
    return obj === 1443;
  };
  _.isOneThousandFourHundredFortyFour = function(obj){
    return obj === 1444;
  };
  _.isOneThousandFourHundredFortyFive = function(obj){
    return obj === 1445;
  };
  _.isOneThousandFourHundredFortySix = function(obj){
    return obj === 1446;
  };
  _.isOneThousandFourHundredFortySeven = function(obj){
    return obj === 1447;
  };
  _.isOneThousandFourHundredFortyEight = function(obj){
    return obj === 1448;
  };
  _.isOneThousandFourHundredFortyNine = function(obj){
    return obj === 1449;
  };
  _.isOneThousandFourHundredFifty = function(obj){
    return obj === 1450;
  };
  _.isOneThousandFourHundredFiftyOne = function(obj){
    return obj === 1451;
  };
  _.isOneThousandFourHundredFiftyTwo = function(obj){
    return obj === 1452;
  };
  _.isOneThousandFourHundredFiftyThree = function(obj){
    return obj === 1453;
  };
  _.isOneThousandFourHundredFiftyFour = function(obj){
    return obj === 1454;
  };
  _.isOneThousandFourHundredFiftyFive = function(obj){
    return obj === 1455;
  };
  _.isOneThousandFourHundredFiftySix = function(obj){
    return obj === 1456;
  };
  _.isOneThousandFourHundredFiftySeven = function(obj){
    return obj === 1457;
  };
  _.isOneThousandFourHundredFiftyEight = function(obj){
    return obj === 1458;
  };
  _.isOneThousandFourHundredFiftyNine = function(obj){
    return obj === 1459;
  };
  _.isOneThousandFourHundredSixty = function(obj){
    return obj === 1460;
  };
  _.isOneThousandFourHundredSixtyOne = function(obj){
    return obj === 1461;
  };
  _.isOneThousandFourHundredSixtyTwo = function(obj){
    return obj === 1462;
  };
  _.isOneThousandFourHundredSixtyThree = function(obj){
    return obj === 1463;
  };
  _.isOneThousandFourHundredSixtyFour = function(obj){
    return obj === 1464;
  };
  _.isOneThousandFourHundredSixtyFive = function(obj){
    return obj === 1465;
  };
  _.isOneThousandFourHundredSixtySix = function(obj){
    return obj === 1466;
  };
  _.isOneThousandFourHundredSixtySeven = function(obj){
    return obj === 1467;
  };
  _.isOneThousandFourHundredSixtyEight = function(obj){
    return obj === 1468;
  };
  _.isOneThousandFourHundredSixtyNine = function(obj){
    return obj === 1469;
  };
  _.isOneThousandFourHundredSeventy = function(obj){
    return obj === 1470;
  };
  _.isOneThousandFourHundredSeventyOne = function(obj){
    return obj === 1471;
  };
  _.isOneThousandFourHundredSeventyTwo = function(obj){
    return obj === 1472;
  };
  _.isOneThousandFourHundredSeventyThree = function(obj){
    return obj === 1473;
  };
  _.isOneThousandFourHundredSeventyFour = function(obj){
    return obj === 1474;
  };
  _.isOneThousandFourHundredSeventyFive = function(obj){
    return obj === 1475;
  };
  _.isOneThousandFourHundredSeventySix = function(obj){
    return obj === 1476;
  };
  _.isOneThousandFourHundredSeventySeven = function(obj){
    return obj === 1477;
  };
  _.isOneThousandFourHundredSeventyEight = function(obj){
    return obj === 1478;
  };
  _.isOneThousandFourHundredSeventyNine = function(obj){
    return obj === 1479;
  };
  _.isOneThousandFourHundredEighty = function(obj){
    return obj === 1480;
  };
  _.isOneThousandFourHundredEightyOne = function(obj){
    return obj === 1481;
  };
  _.isOneThousandFourHundredEightyTwo = function(obj){
    return obj === 1482;
  };
  _.isOneThousandFourHundredEightyThree = function(obj){
    return obj === 1483;
  };
  _.isOneThousandFourHundredEightyFour = function(obj){
    return obj === 1484;
  };
  _.isOneThousandFourHundredEightyFive = function(obj){
    return obj === 1485;
  };
  _.isOneThousandFourHundredEightySix = function(obj){
    return obj === 1486;
  };
  _.isOneThousandFourHundredEightySeven = function(obj){
    return obj === 1487;
  };
  _.isOneThousandFourHundredEightyEight = function(obj){
    return obj === 1488;
  };
  _.isOneThousandFourHundredEightyNine = function(obj){
    return obj === 1489;
  };
  _.isOneThousandFourHundredNinety = function(obj){
    return obj === 1490;
  };
  _.isOneThousandFourHundredNinetyOne = function(obj){
    return obj === 1491;
  };
  _.isOneThousandFourHundredNinetyTwo = function(obj){
    return obj === 1492;
  };
  _.isOneThousandFourHundredNinetyThree = function(obj){
    return obj === 1493;
  };
  _.isOneThousandFourHundredNinetyFour = function(obj){
    return obj === 1494;
  };
  _.isOneThousandFourHundredNinetyFive = function(obj){
    return obj === 1495;
  };
  _.isOneThousandFourHundredNinetySix = function(obj){
    return obj === 1496;
  };
  _.isOneThousandFourHundredNinetySeven = function(obj){
    return obj === 1497;
  };
  _.isOneThousandFourHundredNinetyEight = function(obj){
    return obj === 1498;
  };
  _.isOneThousandFourHundredNinetyNine = function(obj){
    return obj === 1499;
  };
  _.isOneThousandFiveHundred = function(obj){
    return obj === 1500;
  };
  _.isOneThousandFiveHundredOne = function(obj){
    return obj === 1501;
  };
  _.isOneThousandFiveHundredTwo = function(obj){
    return obj === 1502;
  };
  _.isOneThousandFiveHundredThree = function(obj){
    return obj === 1503;
  };
  _.isOneThousandFiveHundredFour = function(obj){
    return obj === 1504;
  };
  _.isOneThousandFiveHundredFive = function(obj){
    return obj === 1505;
  };
  _.isOneThousandFiveHundredSix = function(obj){
    return obj === 1506;
  };
  _.isOneThousandFiveHundredSeven = function(obj){
    return obj === 1507;
  };
  _.isOneThousandFiveHundredEight = function(obj){
    return obj === 1508;
  };
  _.isOneThousandFiveHundredNine = function(obj){
    return obj === 1509;
  };
  _.isOneThousandFiveHundredTen = function(obj){
    return obj === 1510;
  };
  _.isOneThousandFiveHundredEleven = function(obj){
    return obj === 1511;
  };
  _.isOneThousandFiveHundredTwelve = function(obj){
    return obj === 1512;
  };
  _.isOneThousandFiveHundredThirteen = function(obj){
    return obj === 1513;
  };
  _.isOneThousandFiveHundredFourteen = function(obj){
    return obj === 1514;
  };
  _.isOneThousandFiveHundredFifteen = function(obj){
    return obj === 1515;
  };
  _.isOneThousandFiveHundredSixteen = function(obj){
    return obj === 1516;
  };
  _.isOneThousandFiveHundredSeventeen = function(obj){
    return obj === 1517;
  };
  _.isOneThousandFiveHundredEighteen = function(obj){
    return obj === 1518;
  };
  _.isOneThousandFiveHundredNineteen = function(obj){
    return obj === 1519;
  };
  _.isOneThousandFiveHundredTwenty = function(obj){
    return obj === 1520;
  };
  _.isOneThousandFiveHundredTwentyOne = function(obj){
    return obj === 1521;
  };
  _.isOneThousandFiveHundredTwentyTwo = function(obj){
    return obj === 1522;
  };
  _.isOneThousandFiveHundredTwentyThree = function(obj){
    return obj === 1523;
  };
  _.isOneThousandFiveHundredTwentyFour = function(obj){
    return obj === 1524;
  };
  _.isOneThousandFiveHundredTwentyFive = function(obj){
    return obj === 1525;
  };
  _.isOneThousandFiveHundredTwentySix = function(obj){
    return obj === 1526;
  };
  _.isOneThousandFiveHundredTwentySeven = function(obj){
    return obj === 1527;
  };
  _.isOneThousandFiveHundredTwentyEight = function(obj){
    return obj === 1528;
  };
  _.isOneThousandFiveHundredTwentyNine = function(obj){
    return obj === 1529;
  };
  _.isOneThousandFiveHundredThirty = function(obj){
    return obj === 1530;
  };
  _.isOneThousandFiveHundredThirtyOne = function(obj){
    return obj === 1531;
  };
  _.isOneThousandFiveHundredThirtyTwo = function(obj){
    return obj === 1532;
  };
  _.isOneThousandFiveHundredThirtyThree = function(obj){
    return obj === 1533;
  };
  _.isOneThousandFiveHundredThirtyFour = function(obj){
    return obj === 1534;
  };
  _.isOneThousandFiveHundredThirtyFive = function(obj){
    return obj === 1535;
  };
  _.isOneThousandFiveHundredThirtySix = function(obj){
    return obj === 1536;
  };
  _.isOneThousandFiveHundredThirtySeven = function(obj){
    return obj === 1537;
  };
  _.isOneThousandFiveHundredThirtyEight = function(obj){
    return obj === 1538;
  };
  _.isOneThousandFiveHundredThirtyNine = function(obj){
    return obj === 1539;
  };
  _.isOneThousandFiveHundredForty = function(obj){
    return obj === 1540;
  };
  _.isOneThousandFiveHundredFortyOne = function(obj){
    return obj === 1541;
  };
  _.isOneThousandFiveHundredFortyTwo = function(obj){
    return obj === 1542;
  };
  _.isOneThousandFiveHundredFortyThree = function(obj){
    return obj === 1543;
  };
  _.isOneThousandFiveHundredFortyFour = function(obj){
    return obj === 1544;
  };
  _.isOneThousandFiveHundredFortyFive = function(obj){
    return obj === 1545;
  };
  _.isOneThousandFiveHundredFortySix = function(obj){
    return obj === 1546;
  };
  _.isOneThousandFiveHundredFortySeven = function(obj){
    return obj === 1547;
  };
  _.isOneThousandFiveHundredFortyEight = function(obj){
    return obj === 1548;
  };
  _.isOneThousandFiveHundredFortyNine = function(obj){
    return obj === 1549;
  };
  _.isOneThousandFiveHundredFifty = function(obj){
    return obj === 1550;
  };
  _.isOneThousandFiveHundredFiftyOne = function(obj){
    return obj === 1551;
  };
  _.isOneThousandFiveHundredFiftyTwo = function(obj){
    return obj === 1552;
  };
  _.isOneThousandFiveHundredFiftyThree = function(obj){
    return obj === 1553;
  };
  _.isOneThousandFiveHundredFiftyFour = function(obj){
    return obj === 1554;
  };
  _.isOneThousandFiveHundredFiftyFive = function(obj){
    return obj === 1555;
  };
  _.isOneThousandFiveHundredFiftySix = function(obj){
    return obj === 1556;
  };
  _.isOneThousandFiveHundredFiftySeven = function(obj){
    return obj === 1557;
  };
  _.isOneThousandFiveHundredFiftyEight = function(obj){
    return obj === 1558;
  };
  _.isOneThousandFiveHundredFiftyNine = function(obj){
    return obj === 1559;
  };
  _.isOneThousandFiveHundredSixty = function(obj){
    return obj === 1560;
  };
  _.isOneThousandFiveHundredSixtyOne = function(obj){
    return obj === 1561;
  };
  _.isOneThousandFiveHundredSixtyTwo = function(obj){
    return obj === 1562;
  };
  _.isOneThousandFiveHundredSixtyThree = function(obj){
    return obj === 1563;
  };
  _.isOneThousandFiveHundredSixtyFour = function(obj){
    return obj === 1564;
  };
  _.isOneThousandFiveHundredSixtyFive = function(obj){
    return obj === 1565;
  };
  _.isOneThousandFiveHundredSixtySix = function(obj){
    return obj === 1566;
  };
  _.isOneThousandFiveHundredSixtySeven = function(obj){
    return obj === 1567;
  };
  _.isOneThousandFiveHundredSixtyEight = function(obj){
    return obj === 1568;
  };
  _.isOneThousandFiveHundredSixtyNine = function(obj){
    return obj === 1569;
  };
  _.isOneThousandFiveHundredSeventy = function(obj){
    return obj === 1570;
  };
  _.isOneThousandFiveHundredSeventyOne = function(obj){
    return obj === 1571;
  };
  _.isOneThousandFiveHundredSeventyTwo = function(obj){
    return obj === 1572;
  };
  _.isOneThousandFiveHundredSeventyThree = function(obj){
    return obj === 1573;
  };
  _.isOneThousandFiveHundredSeventyFour = function(obj){
    return obj === 1574;
  };
  _.isOneThousandFiveHundredSeventyFive = function(obj){
    return obj === 1575;
  };
  _.isOneThousandFiveHundredSeventySix = function(obj){
    return obj === 1576;
  };
  _.isOneThousandFiveHundredSeventySeven = function(obj){
    return obj === 1577;
  };
  _.isOneThousandFiveHundredSeventyEight = function(obj){
    return obj === 1578;
  };
  _.isOneThousandFiveHundredSeventyNine = function(obj){
    return obj === 1579;
  };
  _.isOneThousandFiveHundredEighty = function(obj){
    return obj === 1580;
  };
  _.isOneThousandFiveHundredEightyOne = function(obj){
    return obj === 1581;
  };
  _.isOneThousandFiveHundredEightyTwo = function(obj){
    return obj === 1582;
  };
  _.isOneThousandFiveHundredEightyThree = function(obj){
    return obj === 1583;
  };
  _.isOneThousandFiveHundredEightyFour = function(obj){
    return obj === 1584;
  };
  _.isOneThousandFiveHundredEightyFive = function(obj){
    return obj === 1585;
  };
  _.isOneThousandFiveHundredEightySix = function(obj){
    return obj === 1586;
  };
  _.isOneThousandFiveHundredEightySeven = function(obj){
    return obj === 1587;
  };
  _.isOneThousandFiveHundredEightyEight = function(obj){
    return obj === 1588;
  };
  _.isOneThousandFiveHundredEightyNine = function(obj){
    return obj === 1589;
  };
  _.isOneThousandFiveHundredNinety = function(obj){
    return obj === 1590;
  };
  _.isOneThousandFiveHundredNinetyOne = function(obj){
    return obj === 1591;
  };
  _.isOneThousandFiveHundredNinetyTwo = function(obj){
    return obj === 1592;
  };
  _.isOneThousandFiveHundredNinetyThree = function(obj){
    return obj === 1593;
  };
  _.isOneThousandFiveHundredNinetyFour = function(obj){
    return obj === 1594;
  };
  _.isOneThousandFiveHundredNinetyFive = function(obj){
    return obj === 1595;
  };
  _.isOneThousandFiveHundredNinetySix = function(obj){
    return obj === 1596;
  };
  _.isOneThousandFiveHundredNinetySeven = function(obj){
    return obj === 1597;
  };
  _.isOneThousandFiveHundredNinetyEight = function(obj){
    return obj === 1598;
  };
  _.isOneThousandFiveHundredNinetyNine = function(obj){
    return obj === 1599;
  };
  _.isOneThousandSixHundred = function(obj){
    return obj === 1600;
  };
  _.isOneThousandSixHundredOne = function(obj){
    return obj === 1601;
  };
  _.isOneThousandSixHundredTwo = function(obj){
    return obj === 1602;
  };
  _.isOneThousandSixHundredThree = function(obj){
    return obj === 1603;
  };
  _.isOneThousandSixHundredFour = function(obj){
    return obj === 1604;
  };
  _.isOneThousandSixHundredFive = function(obj){
    return obj === 1605;
  };
  _.isOneThousandSixHundredSix = function(obj){
    return obj === 1606;
  };
  _.isOneThousandSixHundredSeven = function(obj){
    return obj === 1607;
  };
  _.isOneThousandSixHundredEight = function(obj){
    return obj === 1608;
  };
  _.isOneThousandSixHundredNine = function(obj){
    return obj === 1609;
  };
  _.isOneThousandSixHundredTen = function(obj){
    return obj === 1610;
  };
  _.isOneThousandSixHundredEleven = function(obj){
    return obj === 1611;
  };
  _.isOneThousandSixHundredTwelve = function(obj){
    return obj === 1612;
  };
  _.isOneThousandSixHundredThirteen = function(obj){
    return obj === 1613;
  };
  _.isOneThousandSixHundredFourteen = function(obj){
    return obj === 1614;
  };
  _.isOneThousandSixHundredFifteen = function(obj){
    return obj === 1615;
  };
  _.isOneThousandSixHundredSixteen = function(obj){
    return obj === 1616;
  };
  _.isOneThousandSixHundredSeventeen = function(obj){
    return obj === 1617;
  };
  _.isOneThousandSixHundredEighteen = function(obj){
    return obj === 1618;
  };
  _.isOneThousandSixHundredNineteen = function(obj){
    return obj === 1619;
  };
  _.isOneThousandSixHundredTwenty = function(obj){
    return obj === 1620;
  };
  _.isOneThousandSixHundredTwentyOne = function(obj){
    return obj === 1621;
  };
  _.isOneThousandSixHundredTwentyTwo = function(obj){
    return obj === 1622;
  };
  _.isOneThousandSixHundredTwentyThree = function(obj){
    return obj === 1623;
  };
  _.isOneThousandSixHundredTwentyFour = function(obj){
    return obj === 1624;
  };
  _.isOneThousandSixHundredTwentyFive = function(obj){
    return obj === 1625;
  };
  _.isOneThousandSixHundredTwentySix = function(obj){
    return obj === 1626;
  };
  _.isOneThousandSixHundredTwentySeven = function(obj){
    return obj === 1627;
  };
  _.isOneThousandSixHundredTwentyEight = function(obj){
    return obj === 1628;
  };
  _.isOneThousandSixHundredTwentyNine = function(obj){
    return obj === 1629;
  };
  _.isOneThousandSixHundredThirty = function(obj){
    return obj === 1630;
  };
  _.isOneThousandSixHundredThirtyOne = function(obj){
    return obj === 1631;
  };
  _.isOneThousandSixHundredThirtyTwo = function(obj){
    return obj === 1632;
  };
  _.isOneThousandSixHundredThirtyThree = function(obj){
    return obj === 1633;
  };
  _.isOneThousandSixHundredThirtyFour = function(obj){
    return obj === 1634;
  };
  _.isOneThousandSixHundredThirtyFive = function(obj){
    return obj === 1635;
  };
  _.isOneThousandSixHundredThirtySix = function(obj){
    return obj === 1636;
  };
  _.isOneThousandSixHundredThirtySeven = function(obj){
    return obj === 1637;
  };
  _.isOneThousandSixHundredThirtyEight = function(obj){
    return obj === 1638;
  };
  _.isOneThousandSixHundredThirtyNine = function(obj){
    return obj === 1639;
  };
  _.isOneThousandSixHundredForty = function(obj){
    return obj === 1640;
  };
  _.isOneThousandSixHundredFortyOne = function(obj){
    return obj === 1641;
  };
  _.isOneThousandSixHundredFortyTwo = function(obj){
    return obj === 1642;
  };
  _.isOneThousandSixHundredFortyThree = function(obj){
    return obj === 1643;
  };
  _.isOneThousandSixHundredFortyFour = function(obj){
    return obj === 1644;
  };
  _.isOneThousandSixHundredFortyFive = function(obj){
    return obj === 1645;
  };
  _.isOneThousandSixHundredFortySix = function(obj){
    return obj === 1646;
  };
  _.isOneThousandSixHundredFortySeven = function(obj){
    return obj === 1647;
  };
  _.isOneThousandSixHundredFortyEight = function(obj){
    return obj === 1648;
  };
  _.isOneThousandSixHundredFortyNine = function(obj){
    return obj === 1649;
  };
  _.isOneThousandSixHundredFifty = function(obj){
    return obj === 1650;
  };
  _.isOneThousandSixHundredFiftyOne = function(obj){
    return obj === 1651;
  };
  _.isOneThousandSixHundredFiftyTwo = function(obj){
    return obj === 1652;
  };
  _.isOneThousandSixHundredFiftyThree = function(obj){
    return obj === 1653;
  };
  _.isOneThousandSixHundredFiftyFour = function(obj){
    return obj === 1654;
  };
  _.isOneThousandSixHundredFiftyFive = function(obj){
    return obj === 1655;
  };
  _.isOneThousandSixHundredFiftySix = function(obj){
    return obj === 1656;
  };
  _.isOneThousandSixHundredFiftySeven = function(obj){
    return obj === 1657;
  };
  _.isOneThousandSixHundredFiftyEight = function(obj){
    return obj === 1658;
  };
  _.isOneThousandSixHundredFiftyNine = function(obj){
    return obj === 1659;
  };
  _.isOneThousandSixHundredSixty = function(obj){
    return obj === 1660;
  };
  _.isOneThousandSixHundredSixtyOne = function(obj){
    return obj === 1661;
  };
  _.isOneThousandSixHundredSixtyTwo = function(obj){
    return obj === 1662;
  };
  _.isOneThousandSixHundredSixtyThree = function(obj){
    return obj === 1663;
  };
  _.isOneThousandSixHundredSixtyFour = function(obj){
    return obj === 1664;
  };
  _.isOneThousandSixHundredSixtyFive = function(obj){
    return obj === 1665;
  };
  _.isOneThousandSixHundredSixtySix = function(obj){
    return obj === 1666;
  };
  _.isOneThousandSixHundredSixtySeven = function(obj){
    return obj === 1667;
  };
  _.isOneThousandSixHundredSixtyEight = function(obj){
    return obj === 1668;
  };
  _.isOneThousandSixHundredSixtyNine = function(obj){
    return obj === 1669;
  };
  _.isOneThousandSixHundredSeventy = function(obj){
    return obj === 1670;
  };
  _.isOneThousandSixHundredSeventyOne = function(obj){
    return obj === 1671;
  };
  _.isOneThousandSixHundredSeventyTwo = function(obj){
    return obj === 1672;
  };
  _.isOneThousandSixHundredSeventyThree = function(obj){
    return obj === 1673;
  };
  _.isOneThousandSixHundredSeventyFour = function(obj){
    return obj === 1674;
  };
  _.isOneThousandSixHundredSeventyFive = function(obj){
    return obj === 1675;
  };
  _.isOneThousandSixHundredSeventySix = function(obj){
    return obj === 1676;
  };
  _.isOneThousandSixHundredSeventySeven = function(obj){
    return obj === 1677;
  };
  _.isOneThousandSixHundredSeventyEight = function(obj){
    return obj === 1678;
  };
  _.isOneThousandSixHundredSeventyNine = function(obj){
    return obj === 1679;
  };
  _.isOneThousandSixHundredEighty = function(obj){
    return obj === 1680;
  };
  _.isOneThousandSixHundredEightyOne = function(obj){
    return obj === 1681;
  };
  _.isOneThousandSixHundredEightyTwo = function(obj){
    return obj === 1682;
  };
  _.isOneThousandSixHundredEightyThree = function(obj){
    return obj === 1683;
  };
  _.isOneThousandSixHundredEightyFour = function(obj){
    return obj === 1684;
  };
  _.isOneThousandSixHundredEightyFive = function(obj){
    return obj === 1685;
  };
  _.isOneThousandSixHundredEightySix = function(obj){
    return obj === 1686;
  };
  _.isOneThousandSixHundredEightySeven = function(obj){
    return obj === 1687;
  };
  _.isOneThousandSixHundredEightyEight = function(obj){
    return obj === 1688;
  };
  _.isOneThousandSixHundredEightyNine = function(obj){
    return obj === 1689;
  };
  _.isOneThousandSixHundredNinety = function(obj){
    return obj === 1690;
  };
  _.isOneThousandSixHundredNinetyOne = function(obj){
    return obj === 1691;
  };
  _.isOneThousandSixHundredNinetyTwo = function(obj){
    return obj === 1692;
  };
  _.isOneThousandSixHundredNinetyThree = function(obj){
    return obj === 1693;
  };
  _.isOneThousandSixHundredNinetyFour = function(obj){
    return obj === 1694;
  };
  _.isOneThousandSixHundredNinetyFive = function(obj){
    return obj === 1695;
  };
  _.isOneThousandSixHundredNinetySix = function(obj){
    return obj === 1696;
  };
  _.isOneThousandSixHundredNinetySeven = function(obj){
    return obj === 1697;
  };
  _.isOneThousandSixHundredNinetyEight = function(obj){
    return obj === 1698;
  };
  _.isOneThousandSixHundredNinetyNine = function(obj){
    return obj === 1699;
  };
  _.isOneThousandSevenHundred = function(obj){
    return obj === 1700;
  };
  _.isOneThousandSevenHundredOne = function(obj){
    return obj === 1701;
  };
  _.isOneThousandSevenHundredTwo = function(obj){
    return obj === 1702;
  };
  _.isOneThousandSevenHundredThree = function(obj){
    return obj === 1703;
  };
  _.isOneThousandSevenHundredFour = function(obj){
    return obj === 1704;
  };
  _.isOneThousandSevenHundredFive = function(obj){
    return obj === 1705;
  };
  _.isOneThousandSevenHundredSix = function(obj){
    return obj === 1706;
  };
  _.isOneThousandSevenHundredSeven = function(obj){
    return obj === 1707;
  };
  _.isOneThousandSevenHundredEight = function(obj){
    return obj === 1708;
  };
  _.isOneThousandSevenHundredNine = function(obj){
    return obj === 1709;
  };
  _.isOneThousandSevenHundredTen = function(obj){
    return obj === 1710;
  };
  _.isOneThousandSevenHundredEleven = function(obj){
    return obj === 1711;
  };
  _.isOneThousandSevenHundredTwelve = function(obj){
    return obj === 1712;
  };
  _.isOneThousandSevenHundredThirteen = function(obj){
    return obj === 1713;
  };
  _.isOneThousandSevenHundredFourteen = function(obj){
    return obj === 1714;
  };
  _.isOneThousandSevenHundredFifteen = function(obj){
    return obj === 1715;
  };
  _.isOneThousandSevenHundredSixteen = function(obj){
    return obj === 1716;
  };
  _.isOneThousandSevenHundredSeventeen = function(obj){
    return obj === 1717;
  };
  _.isOneThousandSevenHundredEighteen = function(obj){
    return obj === 1718;
  };
  _.isOneThousandSevenHundredNineteen = function(obj){
    return obj === 1719;
  };
  _.isOneThousandSevenHundredTwenty = function(obj){
    return obj === 1720;
  };
  _.isOneThousandSevenHundredTwentyOne = function(obj){
    return obj === 1721;
  };
  _.isOneThousandSevenHundredTwentyTwo = function(obj){
    return obj === 1722;
  };
  _.isOneThousandSevenHundredTwentyThree = function(obj){
    return obj === 1723;
  };
  _.isOneThousandSevenHundredTwentyFour = function(obj){
    return obj === 1724;
  };
  _.isOneThousandSevenHundredTwentyFive = function(obj){
    return obj === 1725;
  };
  _.isOneThousandSevenHundredTwentySix = function(obj){
    return obj === 1726;
  };
  _.isOneThousandSevenHundredTwentySeven = function(obj){
    return obj === 1727;
  };
  _.isOneThousandSevenHundredTwentyEight = function(obj){
    return obj === 1728;
  };
  _.isOneThousandSevenHundredTwentyNine = function(obj){
    return obj === 1729;
  };
  _.isOneThousandSevenHundredThirty = function(obj){
    return obj === 1730;
  };
  _.isOneThousandSevenHundredThirtyOne = function(obj){
    return obj === 1731;
  };
  _.isOneThousandSevenHundredThirtyTwo = function(obj){
    return obj === 1732;
  };
  _.isOneThousandSevenHundredThirtyThree = function(obj){
    return obj === 1733;
  };
  _.isOneThousandSevenHundredThirtyFour = function(obj){
    return obj === 1734;
  };
  _.isOneThousandSevenHundredThirtyFive = function(obj){
    return obj === 1735;
  };
  _.isOneThousandSevenHundredThirtySix = function(obj){
    return obj === 1736;
  };
  _.isOneThousandSevenHundredThirtySeven = function(obj){
    return obj === 1737;
  };
  _.isOneThousandSevenHundredThirtyEight = function(obj){
    return obj === 1738;
  };
  _.isOneThousandSevenHundredThirtyNine = function(obj){
    return obj === 1739;
  };
  _.isOneThousandSevenHundredForty = function(obj){
    return obj === 1740;
  };
  _.isOneThousandSevenHundredFortyOne = function(obj){
    return obj === 1741;
  };
  _.isOneThousandSevenHundredFortyTwo = function(obj){
    return obj === 1742;
  };
  _.isOneThousandSevenHundredFortyThree = function(obj){
    return obj === 1743;
  };
  _.isOneThousandSevenHundredFortyFour = function(obj){
    return obj === 1744;
  };
  _.isOneThousandSevenHundredFortyFive = function(obj){
    return obj === 1745;
  };
  _.isOneThousandSevenHundredFortySix = function(obj){
    return obj === 1746;
  };
  _.isOneThousandSevenHundredFortySeven = function(obj){
    return obj === 1747;
  };
  _.isOneThousandSevenHundredFortyEight = function(obj){
    return obj === 1748;
  };
  _.isOneThousandSevenHundredFortyNine = function(obj){
    return obj === 1749;
  };
  _.isOneThousandSevenHundredFifty = function(obj){
    return obj === 1750;
  };
  _.isOneThousandSevenHundredFiftyOne = function(obj){
    return obj === 1751;
  };
  _.isOneThousandSevenHundredFiftyTwo = function(obj){
    return obj === 1752;
  };
  _.isOneThousandSevenHundredFiftyThree = function(obj){
    return obj === 1753;
  };
  _.isOneThousandSevenHundredFiftyFour = function(obj){
    return obj === 1754;
  };
  _.isOneThousandSevenHundredFiftyFive = function(obj){
    return obj === 1755;
  };
  _.isOneThousandSevenHundredFiftySix = function(obj){
    return obj === 1756;
  };
  _.isOneThousandSevenHundredFiftySeven = function(obj){
    return obj === 1757;
  };
  _.isOneThousandSevenHundredFiftyEight = function(obj){
    return obj === 1758;
  };
  _.isOneThousandSevenHundredFiftyNine = function(obj){
    return obj === 1759;
  };
  _.isOneThousandSevenHundredSixty = function(obj){
    return obj === 1760;
  };
  _.isOneThousandSevenHundredSixtyOne = function(obj){
    return obj === 1761;
  };
  _.isOneThousandSevenHundredSixtyTwo = function(obj){
    return obj === 1762;
  };
  _.isOneThousandSevenHundredSixtyThree = function(obj){
    return obj === 1763;
  };
  _.isOneThousandSevenHundredSixtyFour = function(obj){
    return obj === 1764;
  };
  _.isOneThousandSevenHundredSixtyFive = function(obj){
    return obj === 1765;
  };
  _.isOneThousandSevenHundredSixtySix = function(obj){
    return obj === 1766;
  };
  _.isOneThousandSevenHundredSixtySeven = function(obj){
    return obj === 1767;
  };
  _.isOneThousandSevenHundredSixtyEight = function(obj){
    return obj === 1768;
  };
  _.isOneThousandSevenHundredSixtyNine = function(obj){
    return obj === 1769;
  };
  _.isOneThousandSevenHundredSeventy = function(obj){
    return obj === 1770;
  };
  _.isOneThousandSevenHundredSeventyOne = function(obj){
    return obj === 1771;
  };
  _.isOneThousandSevenHundredSeventyTwo = function(obj){
    return obj === 1772;
  };
  _.isOneThousandSevenHundredSeventyThree = function(obj){
    return obj === 1773;
  };
  _.isOneThousandSevenHundredSeventyFour = function(obj){
    return obj === 1774;
  };
  _.isOneThousandSevenHundredSeventyFive = function(obj){
    return obj === 1775;
  };
  _.isOneThousandSevenHundredSeventySix = function(obj){
    return obj === 1776;
  };
  _.isOneThousandSevenHundredSeventySeven = function(obj){
    return obj === 1777;
  };
  _.isOneThousandSevenHundredSeventyEight = function(obj){
    return obj === 1778;
  };
  _.isOneThousandSevenHundredSeventyNine = function(obj){
    return obj === 1779;
  };
  _.isOneThousandSevenHundredEighty = function(obj){
    return obj === 1780;
  };
  _.isOneThousandSevenHundredEightyOne = function(obj){
    return obj === 1781;
  };
  _.isOneThousandSevenHundredEightyTwo = function(obj){
    return obj === 1782;
  };
  _.isOneThousandSevenHundredEightyThree = function(obj){
    return obj === 1783;
  };
  _.isOneThousandSevenHundredEightyFour = function(obj){
    return obj === 1784;
  };
  _.isOneThousandSevenHundredEightyFive = function(obj){
    return obj === 1785;
  };
  _.isOneThousandSevenHundredEightySix = function(obj){
    return obj === 1786;
  };
  _.isOneThousandSevenHundredEightySeven = function(obj){
    return obj === 1787;
  };
  _.isOneThousandSevenHundredEightyEight = function(obj){
    return obj === 1788;
  };
  _.isOneThousandSevenHundredEightyNine = function(obj){
    return obj === 1789;
  };
  _.isOneThousandSevenHundredNinety = function(obj){
    return obj === 1790;
  };
  _.isOneThousandSevenHundredNinetyOne = function(obj){
    return obj === 1791;
  };
  _.isOneThousandSevenHundredNinetyTwo = function(obj){
    return obj === 1792;
  };
  _.isOneThousandSevenHundredNinetyThree = function(obj){
    return obj === 1793;
  };
  _.isOneThousandSevenHundredNinetyFour = function(obj){
    return obj === 1794;
  };
  _.isOneThousandSevenHundredNinetyFive = function(obj){
    return obj === 1795;
  };
  _.isOneThousandSevenHundredNinetySix = function(obj){
    return obj === 1796;
  };
  _.isOneThousandSevenHundredNinetySeven = function(obj){
    return obj === 1797;
  };
  _.isOneThousandSevenHundredNinetyEight = function(obj){
    return obj === 1798;
  };
  _.isOneThousandSevenHundredNinetyNine = function(obj){
    return obj === 1799;
  };
  _.isOneThousandEightHundred = function(obj){
    return obj === 1800;
  };
  _.isOneThousandEightHundredOne = function(obj){
    return obj === 1801;
  };
  _.isOneThousandEightHundredTwo = function(obj){
    return obj === 1802;
  };
  _.isOneThousandEightHundredThree = function(obj){
    return obj === 1803;
  };
  _.isOneThousandEightHundredFour = function(obj){
    return obj === 1804;
  };
  _.isOneThousandEightHundredFive = function(obj){
    return obj === 1805;
  };
  _.isOneThousandEightHundredSix = function(obj){
    return obj === 1806;
  };
  _.isOneThousandEightHundredSeven = function(obj){
    return obj === 1807;
  };
  _.isOneThousandEightHundredEight = function(obj){
    return obj === 1808;
  };
  _.isOneThousandEightHundredNine = function(obj){
    return obj === 1809;
  };
  _.isOneThousandEightHundredTen = function(obj){
    return obj === 1810;
  };
  _.isOneThousandEightHundredEleven = function(obj){
    return obj === 1811;
  };
  _.isOneThousandEightHundredTwelve = function(obj){
    return obj === 1812;
  };
  _.isOneThousandEightHundredThirteen = function(obj){
    return obj === 1813;
  };
  _.isOneThousandEightHundredFourteen = function(obj){
    return obj === 1814;
  };
  _.isOneThousandEightHundredFifteen = function(obj){
    return obj === 1815;
  };
  _.isOneThousandEightHundredSixteen = function(obj){
    return obj === 1816;
  };
  _.isOneThousandEightHundredSeventeen = function(obj){
    return obj === 1817;
  };
  _.isOneThousandEightHundredEighteen = function(obj){
    return obj === 1818;
  };
  _.isOneThousandEightHundredNineteen = function(obj){
    return obj === 1819;
  };
  _.isOneThousandEightHundredTwenty = function(obj){
    return obj === 1820;
  };
  _.isOneThousandEightHundredTwentyOne = function(obj){
    return obj === 1821;
  };
  _.isOneThousandEightHundredTwentyTwo = function(obj){
    return obj === 1822;
  };
  _.isOneThousandEightHundredTwentyThree = function(obj){
    return obj === 1823;
  };
  _.isOneThousandEightHundredTwentyFour = function(obj){
    return obj === 1824;
  };
  _.isOneThousandEightHundredTwentyFive = function(obj){
    return obj === 1825;
  };
  _.isOneThousandEightHundredTwentySix = function(obj){
    return obj === 1826;
  };
  _.isOneThousandEightHundredTwentySeven = function(obj){
    return obj === 1827;
  };
  _.isOneThousandEightHundredTwentyEight = function(obj){
    return obj === 1828;
  };
  _.isOneThousandEightHundredTwentyNine = function(obj){
    return obj === 1829;
  };
  _.isOneThousandEightHundredThirty = function(obj){
    return obj === 1830;
  };
  _.isOneThousandEightHundredThirtyOne = function(obj){
    return obj === 1831;
  };
  _.isOneThousandEightHundredThirtyTwo = function(obj){
    return obj === 1832;
  };
  _.isOneThousandEightHundredThirtyThree = function(obj){
    return obj === 1833;
  };
  _.isOneThousandEightHundredThirtyFour = function(obj){
    return obj === 1834;
  };
  _.isOneThousandEightHundredThirtyFive = function(obj){
    return obj === 1835;
  };
  _.isOneThousandEightHundredThirtySix = function(obj){
    return obj === 1836;
  };
  _.isOneThousandEightHundredThirtySeven = function(obj){
    return obj === 1837;
  };
  _.isOneThousandEightHundredThirtyEight = function(obj){
    return obj === 1838;
  };
  _.isOneThousandEightHundredThirtyNine = function(obj){
    return obj === 1839;
  };
  _.isOneThousandEightHundredForty = function(obj){
    return obj === 1840;
  };
  _.isOneThousandEightHundredFortyOne = function(obj){
    return obj === 1841;
  };
  _.isOneThousandEightHundredFortyTwo = function(obj){
    return obj === 1842;
  };
  _.isOneThousandEightHundredFortyThree = function(obj){
    return obj === 1843;
  };
  _.isOneThousandEightHundredFortyFour = function(obj){
    return obj === 1844;
  };
  _.isOneThousandEightHundredFortyFive = function(obj){
    return obj === 1845;
  };
  _.isOneThousandEightHundredFortySix = function(obj){
    return obj === 1846;
  };
  _.isOneThousandEightHundredFortySeven = function(obj){
    return obj === 1847;
  };
  _.isOneThousandEightHundredFortyEight = function(obj){
    return obj === 1848;
  };
  _.isOneThousandEightHundredFortyNine = function(obj){
    return obj === 1849;
  };
  _.isOneThousandEightHundredFifty = function(obj){
    return obj === 1850;
  };
  _.isOneThousandEightHundredFiftyOne = function(obj){
    return obj === 1851;
  };
  _.isOneThousandEightHundredFiftyTwo = function(obj){
    return obj === 1852;
  };
  _.isOneThousandEightHundredFiftyThree = function(obj){
    return obj === 1853;
  };
  _.isOneThousandEightHundredFiftyFour = function(obj){
    return obj === 1854;
  };
  _.isOneThousandEightHundredFiftyFive = function(obj){
    return obj === 1855;
  };
  _.isOneThousandEightHundredFiftySix = function(obj){
    return obj === 1856;
  };
  _.isOneThousandEightHundredFiftySeven = function(obj){
    return obj === 1857;
  };
  _.isOneThousandEightHundredFiftyEight = function(obj){
    return obj === 1858;
  };
  _.isOneThousandEightHundredFiftyNine = function(obj){
    return obj === 1859;
  };
  _.isOneThousandEightHundredSixty = function(obj){
    return obj === 1860;
  };
  _.isOneThousandEightHundredSixtyOne = function(obj){
    return obj === 1861;
  };
  _.isOneThousandEightHundredSixtyTwo = function(obj){
    return obj === 1862;
  };
  _.isOneThousandEightHundredSixtyThree = function(obj){
    return obj === 1863;
  };
  _.isOneThousandEightHundredSixtyFour = function(obj){
    return obj === 1864;
  };
  _.isOneThousandEightHundredSixtyFive = function(obj){
    return obj === 1865;
  };
  _.isOneThousandEightHundredSixtySix = function(obj){
    return obj === 1866;
  };
  _.isOneThousandEightHundredSixtySeven = function(obj){
    return obj === 1867;
  };
  _.isOneThousandEightHundredSixtyEight = function(obj){
    return obj === 1868;
  };
  _.isOneThousandEightHundredSixtyNine = function(obj){
    return obj === 1869;
  };
  _.isOneThousandEightHundredSeventy = function(obj){
    return obj === 1870;
  };
  _.isOneThousandEightHundredSeventyOne = function(obj){
    return obj === 1871;
  };
  _.isOneThousandEightHundredSeventyTwo = function(obj){
    return obj === 1872;
  };
  _.isOneThousandEightHundredSeventyThree = function(obj){
    return obj === 1873;
  };
  _.isOneThousandEightHundredSeventyFour = function(obj){
    return obj === 1874;
  };
  _.isOneThousandEightHundredSeventyFive = function(obj){
    return obj === 1875;
  };
  _.isOneThousandEightHundredSeventySix = function(obj){
    return obj === 1876;
  };
  _.isOneThousandEightHundredSeventySeven = function(obj){
    return obj === 1877;
  };
  _.isOneThousandEightHundredSeventyEight = function(obj){
    return obj === 1878;
  };
  _.isOneThousandEightHundredSeventyNine = function(obj){
    return obj === 1879;
  };
  _.isOneThousandEightHundredEighty = function(obj){
    return obj === 1880;
  };
  _.isOneThousandEightHundredEightyOne = function(obj){
    return obj === 1881;
  };
  _.isOneThousandEightHundredEightyTwo = function(obj){
    return obj === 1882;
  };
  _.isOneThousandEightHundredEightyThree = function(obj){
    return obj === 1883;
  };
  _.isOneThousandEightHundredEightyFour = function(obj){
    return obj === 1884;
  };
  _.isOneThousandEightHundredEightyFive = function(obj){
    return obj === 1885;
  };
  _.isOneThousandEightHundredEightySix = function(obj){
    return obj === 1886;
  };
  _.isOneThousandEightHundredEightySeven = function(obj){
    return obj === 1887;
  };
  _.isOneThousandEightHundredEightyEight = function(obj){
    return obj === 1888;
  };
  _.isOneThousandEightHundredEightyNine = function(obj){
    return obj === 1889;
  };
  _.isOneThousandEightHundredNinety = function(obj){
    return obj === 1890;
  };
  _.isOneThousandEightHundredNinetyOne = function(obj){
    return obj === 1891;
  };
  _.isOneThousandEightHundredNinetyTwo = function(obj){
    return obj === 1892;
  };
  _.isOneThousandEightHundredNinetyThree = function(obj){
    return obj === 1893;
  };
  _.isOneThousandEightHundredNinetyFour = function(obj){
    return obj === 1894;
  };
  _.isOneThousandEightHundredNinetyFive = function(obj){
    return obj === 1895;
  };
  _.isOneThousandEightHundredNinetySix = function(obj){
    return obj === 1896;
  };
  _.isOneThousandEightHundredNinetySeven = function(obj){
    return obj === 1897;
  };
  _.isOneThousandEightHundredNinetyEight = function(obj){
    return obj === 1898;
  };
  _.isOneThousandEightHundredNinetyNine = function(obj){
    return obj === 1899;
  };
  _.isOneThousandNineHundred = function(obj){
    return obj === 1900;
  };
  _.isOneThousandNineHundredOne = function(obj){
    return obj === 1901;
  };
  _.isOneThousandNineHundredTwo = function(obj){
    return obj === 1902;
  };
  _.isOneThousandNineHundredThree = function(obj){
    return obj === 1903;
  };
  _.isOneThousandNineHundredFour = function(obj){
    return obj === 1904;
  };
  _.isOneThousandNineHundredFive = function(obj){
    return obj === 1905;
  };
  _.isOneThousandNineHundredSix = function(obj){
    return obj === 1906;
  };
  _.isOneThousandNineHundredSeven = function(obj){
    return obj === 1907;
  };
  _.isOneThousandNineHundredEight = function(obj){
    return obj === 1908;
  };
  _.isOneThousandNineHundredNine = function(obj){
    return obj === 1909;
  };
  _.isOneThousandNineHundredTen = function(obj){
    return obj === 1910;
  };
  _.isOneThousandNineHundredEleven = function(obj){
    return obj === 1911;
  };
  _.isOneThousandNineHundredTwelve = function(obj){
    return obj === 1912;
  };
  _.isOneThousandNineHundredThirteen = function(obj){
    return obj === 1913;
  };
  _.isOneThousandNineHundredFourteen = function(obj){
    return obj === 1914;
  };
  _.isOneThousandNineHundredFifteen = function(obj){
    return obj === 1915;
  };
  _.isOneThousandNineHundredSixteen = function(obj){
    return obj === 1916;
  };
  _.isOneThousandNineHundredSeventeen = function(obj){
    return obj === 1917;
  };
  _.isOneThousandNineHundredEighteen = function(obj){
    return obj === 1918;
  };
  _.isOneThousandNineHundredNineteen = function(obj){
    return obj === 1919;
  };
  _.isOneThousandNineHundredTwenty = function(obj){
    return obj === 1920;
  };
  _.isOneThousandNineHundredTwentyOne = function(obj){
    return obj === 1921;
  };
  _.isOneThousandNineHundredTwentyTwo = function(obj){
    return obj === 1922;
  };
  _.isOneThousandNineHundredTwentyThree = function(obj){
    return obj === 1923;
  };
  _.isOneThousandNineHundredTwentyFour = function(obj){
    return obj === 1924;
  };
  _.isOneThousandNineHundredTwentyFive = function(obj){
    return obj === 1925;
  };
  _.isOneThousandNineHundredTwentySix = function(obj){
    return obj === 1926;
  };
  _.isOneThousandNineHundredTwentySeven = function(obj){
    return obj === 1927;
  };
  _.isOneThousandNineHundredTwentyEight = function(obj){
    return obj === 1928;
  };
  _.isOneThousandNineHundredTwentyNine = function(obj){
    return obj === 1929;
  };
  _.isOneThousandNineHundredThirty = function(obj){
    return obj === 1930;
  };
  _.isOneThousandNineHundredThirtyOne = function(obj){
    return obj === 1931;
  };
  _.isOneThousandNineHundredThirtyTwo = function(obj){
    return obj === 1932;
  };
  _.isOneThousandNineHundredThirtyThree = function(obj){
    return obj === 1933;
  };
  _.isOneThousandNineHundredThirtyFour = function(obj){
    return obj === 1934;
  };
  _.isOneThousandNineHundredThirtyFive = function(obj){
    return obj === 1935;
  };
  _.isOneThousandNineHundredThirtySix = function(obj){
    return obj === 1936;
  };
  _.isOneThousandNineHundredThirtySeven = function(obj){
    return obj === 1937;
  };
  _.isOneThousandNineHundredThirtyEight = function(obj){
    return obj === 1938;
  };
  _.isOneThousandNineHundredThirtyNine = function(obj){
    return obj === 1939;
  };
  _.isOneThousandNineHundredForty = function(obj){
    return obj === 1940;
  };
  _.isOneThousandNineHundredFortyOne = function(obj){
    return obj === 1941;
  };
  _.isOneThousandNineHundredFortyTwo = function(obj){
    return obj === 1942;
  };
  _.isOneThousandNineHundredFortyThree = function(obj){
    return obj === 1943;
  };
  _.isOneThousandNineHundredFortyFour = function(obj){
    return obj === 1944;
  };
  _.isOneThousandNineHundredFortyFive = function(obj){
    return obj === 1945;
  };
  _.isOneThousandNineHundredFortySix = function(obj){
    return obj === 1946;
  };
  _.isOneThousandNineHundredFortySeven = function(obj){
    return obj === 1947;
  };
  _.isOneThousandNineHundredFortyEight = function(obj){
    return obj === 1948;
  };
  _.isOneThousandNineHundredFortyNine = function(obj){
    return obj === 1949;
  };
  _.isOneThousandNineHundredFifty = function(obj){
    return obj === 1950;
  };
  _.isOneThousandNineHundredFiftyOne = function(obj){
    return obj === 1951;
  };
  _.isOneThousandNineHundredFiftyTwo = function(obj){
    return obj === 1952;
  };
  _.isOneThousandNineHundredFiftyThree = function(obj){
    return obj === 1953;
  };
  _.isOneThousandNineHundredFiftyFour = function(obj){
    return obj === 1954;
  };
  _.isOneThousandNineHundredFiftyFive = function(obj){
    return obj === 1955;
  };
  _.isOneThousandNineHundredFiftySix = function(obj){
    return obj === 1956;
  };
  _.isOneThousandNineHundredFiftySeven = function(obj){
    return obj === 1957;
  };
  _.isOneThousandNineHundredFiftyEight = function(obj){
    return obj === 1958;
  };
  _.isOneThousandNineHundredFiftyNine = function(obj){
    return obj === 1959;
  };
  _.isOneThousandNineHundredSixty = function(obj){
    return obj === 1960;
  };
  _.isOneThousandNineHundredSixtyOne = function(obj){
    return obj === 1961;
  };
  _.isOneThousandNineHundredSixtyTwo = function(obj){
    return obj === 1962;
  };
  _.isOneThousandNineHundredSixtyThree = function(obj){
    return obj === 1963;
  };
  _.isOneThousandNineHundredSixtyFour = function(obj){
    return obj === 1964;
  };
  _.isOneThousandNineHundredSixtyFive = function(obj){
    return obj === 1965;
  };
  _.isOneThousandNineHundredSixtySix = function(obj){
    return obj === 1966;
  };
  _.isOneThousandNineHundredSixtySeven = function(obj){
    return obj === 1967;
  };
  _.isOneThousandNineHundredSixtyEight = function(obj){
    return obj === 1968;
  };
  _.isOneThousandNineHundredSixtyNine = function(obj){
    return obj === 1969;
  };
  _.isOneThousandNineHundredSeventy = function(obj){
    return obj === 1970;
  };
  _.isOneThousandNineHundredSeventyOne = function(obj){
    return obj === 1971;
  };
  _.isOneThousandNineHundredSeventyTwo = function(obj){
    return obj === 1972;
  };
  _.isOneThousandNineHundredSeventyThree = function(obj){
    return obj === 1973;
  };
  _.isOneThousandNineHundredSeventyFour = function(obj){
    return obj === 1974;
  };
  _.isOneThousandNineHundredSeventyFive = function(obj){
    return obj === 1975;
  };
  _.isOneThousandNineHundredSeventySix = function(obj){
    return obj === 1976;
  };
  _.isOneThousandNineHundredSeventySeven = function(obj){
    return obj === 1977;
  };
  _.isOneThousandNineHundredSeventyEight = function(obj){
    return obj === 1978;
  };
  _.isOneThousandNineHundredSeventyNine = function(obj){
    return obj === 1979;
  };
  _.isOneThousandNineHundredEighty = function(obj){
    return obj === 1980;
  };
  _.isOneThousandNineHundredEightyOne = function(obj){
    return obj === 1981;
  };
  _.isOneThousandNineHundredEightyTwo = function(obj){
    return obj === 1982;
  };
  _.isOneThousandNineHundredEightyThree = function(obj){
    return obj === 1983;
  };
  _.isOneThousandNineHundredEightyFour = function(obj){
    return obj === 1984;
  };
  _.isOneThousandNineHundredEightyFive = function(obj){
    return obj === 1985;
  };
  _.isOneThousandNineHundredEightySix = function(obj){
    return obj === 1986;
  };
  _.isOneThousandNineHundredEightySeven = function(obj){
    return obj === 1987;
  };
  _.isOneThousandNineHundredEightyEight = function(obj){
    return obj === 1988;
  };
  _.isOneThousandNineHundredEightyNine = function(obj){
    return obj === 1989;
  };
  _.isOneThousandNineHundredNinety = function(obj){
    return obj === 1990;
  };
  _.isOneThousandNineHundredNinetyOne = function(obj){
    return obj === 1991;
  };
  _.isOneThousandNineHundredNinetyTwo = function(obj){
    return obj === 1992;
  };
  _.isOneThousandNineHundredNinetyThree = function(obj){
    return obj === 1993;
  };
  _.isOneThousandNineHundredNinetyFour = function(obj){
    return obj === 1994;
  };
  _.isOneThousandNineHundredNinetyFive = function(obj){
    return obj === 1995;
  };
  _.isOneThousandNineHundredNinetySix = function(obj){
    return obj === 1996;
  };
  _.isOneThousandNineHundredNinetySeven = function(obj){
    return obj === 1997;
  };
  _.isOneThousandNineHundredNinetyEight = function(obj){
    return obj === 1998;
  };
  _.isOneThousandNineHundredNinetyNine = function(obj){
    return obj === 1999;
  };
  _.isTwoThousand = function(obj){
    return obj === 2000;
  };
  _.isTwoThousandOne = function(obj){
    return obj === 2001;
  };
  _.isTwoThousandTwo = function(obj){
    return obj === 2002;
  };
  _.isTwoThousandThree = function(obj){
    return obj === 2003;
  };
  _.isTwoThousandFour = function(obj){
    return obj === 2004;
  };
  _.isTwoThousandFive = function(obj){
    return obj === 2005;
  };
  _.isTwoThousandSix = function(obj){
    return obj === 2006;
  };
  _.isTwoThousandSeven = function(obj){
    return obj === 2007;
  };
  _.isTwoThousandEight = function(obj){
    return obj === 2008;
  };
  _.isTwoThousandNine = function(obj){
    return obj === 2009;
  };
  _.isTwoThousandTen = function(obj){
    return obj === 2010;
  };
  _.isTwoThousandEleven = function(obj){
    return obj === 2011;
  };
  _.isTwoThousandTwelve = function(obj){
    return obj === 2012;
  };
  _.isTwoThousandThirteen = function(obj){
    return obj === 2013;
  };
  _.isTwoThousandFourteen = function(obj){
    return obj === 2014;
  };
  _.isTwoThousandFifteen = function(obj){
    return obj === 2015;
  };
  _.isTwoThousandSixteen = function(obj){
    return obj === 2016;
  };
  _.isTwoThousandSeventeen = function(obj){
    return obj === 2017;
  };
  _.isTwoThousandEighteen = function(obj){
    return obj === 2018;
  };
  _.isTwoThousandNineteen = function(obj){
    return obj === 2019;
  };
  _.isTwoThousandTwenty = function(obj){
    return obj === 2020;
  };
  _.isTwoThousandTwentyOne = function(obj){
    return obj === 2021;
  };
  _.isTwoThousandTwentyTwo = function(obj){
    return obj === 2022;
  };
  _.isTwoThousandTwentyThree = function(obj){
    return obj === 2023;
  };
  _.isTwoThousandTwentyFour = function(obj){
    return obj === 2024;
  };
  _.isTwoThousandTwentyFive = function(obj){
    return obj === 2025;
  };
  _.isTwoThousandTwentySix = function(obj){
    return obj === 2026;
  };
  _.isTwoThousandTwentySeven = function(obj){
    return obj === 2027;
  };
  _.isTwoThousandTwentyEight = function(obj){
    return obj === 2028;
  };
  _.isTwoThousandTwentyNine = function(obj){
    return obj === 2029;
  };
  _.isTwoThousandThirty = function(obj){
    return obj === 2030;
  };
  _.isTwoThousandThirtyOne = function(obj){
    return obj === 2031;
  };
  _.isTwoThousandThirtyTwo = function(obj){
    return obj === 2032;
  };
  _.isTwoThousandThirtyThree = function(obj){
    return obj === 2033;
  };
  _.isTwoThousandThirtyFour = function(obj){
    return obj === 2034;
  };
  _.isTwoThousandThirtyFive = function(obj){
    return obj === 2035;
  };
  _.isTwoThousandThirtySix = function(obj){
    return obj === 2036;
  };
  _.isTwoThousandThirtySeven = function(obj){
    return obj === 2037;
  };
  _.isTwoThousandThirtyEight = function(obj){
    return obj === 2038;
  };
  _.isTwoThousandThirtyNine = function(obj){
    return obj === 2039;
  };
  _.isTwoThousandForty = function(obj){
    return obj === 2040;
  };
  _.isTwoThousandFortyOne = function(obj){
    return obj === 2041;
  };
  _.isTwoThousandFortyTwo = function(obj){
    return obj === 2042;
  };
  _.isTwoThousandFortyThree = function(obj){
    return obj === 2043;
  };
  _.isTwoThousandFortyFour = function(obj){
    return obj === 2044;
  };
  _.isTwoThousandFortyFive = function(obj){
    return obj === 2045;
  };
  _.isTwoThousandFortySix = function(obj){
    return obj === 2046;
  };
  _.isTwoThousandFortySeven = function(obj){
    return obj === 2047;
  };
  _.isTwoThousandFortyEight = function(obj){
    return obj === 2048;
  };
  _.isTwoThousandFortyNine = function(obj){
    return obj === 2049;
  };
  _.isTwoThousandFifty = function(obj){
    return obj === 2050;
  };
  _.isTwoThousandFiftyOne = function(obj){
    return obj === 2051;
  };
  _.isTwoThousandFiftyTwo = function(obj){
    return obj === 2052;
  };
  _.isTwoThousandFiftyThree = function(obj){
    return obj === 2053;
  };
  _.isTwoThousandFiftyFour = function(obj){
    return obj === 2054;
  };
  _.isTwoThousandFiftyFive = function(obj){
    return obj === 2055;
  };
  _.isTwoThousandFiftySix = function(obj){
    return obj === 2056;
  };
  _.isTwoThousandFiftySeven = function(obj){
    return obj === 2057;
  };
  _.isTwoThousandFiftyEight = function(obj){
    return obj === 2058;
  };
  _.isTwoThousandFiftyNine = function(obj){
    return obj === 2059;
  };
  _.isTwoThousandSixty = function(obj){
    return obj === 2060;
  };
  _.isTwoThousandSixtyOne = function(obj){
    return obj === 2061;
  };
  _.isTwoThousandSixtyTwo = function(obj){
    return obj === 2062;
  };
  _.isTwoThousandSixtyThree = function(obj){
    return obj === 2063;
  };
  _.isTwoThousandSixtyFour = function(obj){
    return obj === 2064;
  };
  _.isTwoThousandSixtyFive = function(obj){
    return obj === 2065;
  };
  _.isTwoThousandSixtySix = function(obj){
    return obj === 2066;
  };
  _.isTwoThousandSixtySeven = function(obj){
    return obj === 2067;
  };
  _.isTwoThousandSixtyEight = function(obj){
    return obj === 2068;
  };
  _.isTwoThousandSixtyNine = function(obj){
    return obj === 2069;
  };
  _.isTwoThousandSeventy = function(obj){
    return obj === 2070;
  };
  _.isTwoThousandSeventyOne = function(obj){
    return obj === 2071;
  };
  _.isTwoThousandSeventyTwo = function(obj){
    return obj === 2072;
  };
  _.isTwoThousandSeventyThree = function(obj){
    return obj === 2073;
  };
  _.isTwoThousandSeventyFour = function(obj){
    return obj === 2074;
  };
  _.isTwoThousandSeventyFive = function(obj){
    return obj === 2075;
  };
  _.isTwoThousandSeventySix = function(obj){
    return obj === 2076;
  };
  _.isTwoThousandSeventySeven = function(obj){
    return obj === 2077;
  };
  _.isTwoThousandSeventyEight = function(obj){
    return obj === 2078;
  };
  _.isTwoThousandSeventyNine = function(obj){
    return obj === 2079;
  };
  _.isTwoThousandEighty = function(obj){
    return obj === 2080;
  };
  _.isTwoThousandEightyOne = function(obj){
    return obj === 2081;
  };
  _.isTwoThousandEightyTwo = function(obj){
    return obj === 2082;
  };
  _.isTwoThousandEightyThree = function(obj){
    return obj === 2083;
  };
  _.isTwoThousandEightyFour = function(obj){
    return obj === 2084;
  };
  _.isTwoThousandEightyFive = function(obj){
    return obj === 2085;
  };
  _.isTwoThousandEightySix = function(obj){
    return obj === 2086;
  };
  _.isTwoThousandEightySeven = function(obj){
    return obj === 2087;
  };
  _.isTwoThousandEightyEight = function(obj){
    return obj === 2088;
  };
  _.isTwoThousandEightyNine = function(obj){
    return obj === 2089;
  };
  _.isTwoThousandNinety = function(obj){
    return obj === 2090;
  };
  _.isTwoThousandNinetyOne = function(obj){
    return obj === 2091;
  };
  _.isTwoThousandNinetyTwo = function(obj){
    return obj === 2092;
  };
  _.isTwoThousandNinetyThree = function(obj){
    return obj === 2093;
  };
  _.isTwoThousandNinetyFour = function(obj){
    return obj === 2094;
  };
  _.isTwoThousandNinetyFive = function(obj){
    return obj === 2095;
  };
  _.isTwoThousandNinetySix = function(obj){
    return obj === 2096;
  };
  _.isTwoThousandNinetySeven = function(obj){
    return obj === 2097;
  };
  _.isTwoThousandNinetyEight = function(obj){
    return obj === 2098;
  };
  _.isTwoThousandNinetyNine = function(obj){
    return obj === 2099;
  };
  _.isTwoThousandOneHundred = function(obj){
    return obj === 2100;
  };
  _.isTwoThousandOneHundredOne = function(obj){
    return obj === 2101;
  };
  _.isTwoThousandOneHundredTwo = function(obj){
    return obj === 2102;
  };
  _.isTwoThousandOneHundredThree = function(obj){
    return obj === 2103;
  };
  _.isTwoThousandOneHundredFour = function(obj){
    return obj === 2104;
  };
  _.isTwoThousandOneHundredFive = function(obj){
    return obj === 2105;
  };
  _.isTwoThousandOneHundredSix = function(obj){
    return obj === 2106;
  };
  _.isTwoThousandOneHundredSeven = function(obj){
    return obj === 2107;
  };
  _.isTwoThousandOneHundredEight = function(obj){
    return obj === 2108;
  };
  _.isTwoThousandOneHundredNine = function(obj){
    return obj === 2109;
  };
  _.isTwoThousandOneHundredTen = function(obj){
    return obj === 2110;
  };
  _.isTwoThousandOneHundredEleven = function(obj){
    return obj === 2111;
  };
  _.isTwoThousandOneHundredTwelve = function(obj){
    return obj === 2112;
  };
  _.isTwoThousandOneHundredThirteen = function(obj){
    return obj === 2113;
  };
  _.isTwoThousandOneHundredFourteen = function(obj){
    return obj === 2114;
  };
  _.isTwoThousandOneHundredFifteen = function(obj){
    return obj === 2115;
  };
  _.isTwoThousandOneHundredSixteen = function(obj){
    return obj === 2116;
  };
  _.isTwoThousandOneHundredSeventeen = function(obj){
    return obj === 2117;
  };
  _.isTwoThousandOneHundredEighteen = function(obj){
    return obj === 2118;
  };
  _.isTwoThousandOneHundredNineteen = function(obj){
    return obj === 2119;
  };
  _.isTwoThousandOneHundredTwenty = function(obj){
    return obj === 2120;
  };
  _.isTwoThousandOneHundredTwentyOne = function(obj){
    return obj === 2121;
  };
  _.isTwoThousandOneHundredTwentyTwo = function(obj){
    return obj === 2122;
  };
  _.isTwoThousandOneHundredTwentyThree = function(obj){
    return obj === 2123;
  };
  _.isTwoThousandOneHundredTwentyFour = function(obj){
    return obj === 2124;
  };
  _.isTwoThousandOneHundredTwentyFive = function(obj){
    return obj === 2125;
  };
  _.isTwoThousandOneHundredTwentySix = function(obj){
    return obj === 2126;
  };
  _.isTwoThousandOneHundredTwentySeven = function(obj){
    return obj === 2127;
  };
  _.isTwoThousandOneHundredTwentyEight = function(obj){
    return obj === 2128;
  };
  _.isTwoThousandOneHundredTwentyNine = function(obj){
    return obj === 2129;
  };
  _.isTwoThousandOneHundredThirty = function(obj){
    return obj === 2130;
  };
  _.isTwoThousandOneHundredThirtyOne = function(obj){
    return obj === 2131;
  };
  _.isTwoThousandOneHundredThirtyTwo = function(obj){
    return obj === 2132;
  };
  _.isTwoThousandOneHundredThirtyThree = function(obj){
    return obj === 2133;
  };
  _.isTwoThousandOneHundredThirtyFour = function(obj){
    return obj === 2134;
  };
  _.isTwoThousandOneHundredThirtyFive = function(obj){
    return obj === 2135;
  };
  _.isTwoThousandOneHundredThirtySix = function(obj){
    return obj === 2136;
  };
  _.isTwoThousandOneHundredThirtySeven = function(obj){
    return obj === 2137;
  };
  _.isTwoThousandOneHundredThirtyEight = function(obj){
    return obj === 2138;
  };
  _.isTwoThousandOneHundredThirtyNine = function(obj){
    return obj === 2139;
  };
  _.isTwoThousandOneHundredForty = function(obj){
    return obj === 2140;
  };
  _.isTwoThousandOneHundredFortyOne = function(obj){
    return obj === 2141;
  };
  _.isTwoThousandOneHundredFortyTwo = function(obj){
    return obj === 2142;
  };
  _.isTwoThousandOneHundredFortyThree = function(obj){
    return obj === 2143;
  };
  _.isTwoThousandOneHundredFortyFour = function(obj){
    return obj === 2144;
  };
  _.isTwoThousandOneHundredFortyFive = function(obj){
    return obj === 2145;
  };
  _.isTwoThousandOneHundredFortySix = function(obj){
    return obj === 2146;
  };
  _.isTwoThousandOneHundredFortySeven = function(obj){
    return obj === 2147;
  };
  _.isTwoThousandOneHundredFortyEight = function(obj){
    return obj === 2148;
  };
  _.isTwoThousandOneHundredFortyNine = function(obj){
    return obj === 2149;
  };
  _.isTwoThousandOneHundredFifty = function(obj){
    return obj === 2150;
  };
  _.isTwoThousandOneHundredFiftyOne = function(obj){
    return obj === 2151;
  };
  _.isTwoThousandOneHundredFiftyTwo = function(obj){
    return obj === 2152;
  };
  _.isTwoThousandOneHundredFiftyThree = function(obj){
    return obj === 2153;
  };
  _.isTwoThousandOneHundredFiftyFour = function(obj){
    return obj === 2154;
  };
  _.isTwoThousandOneHundredFiftyFive = function(obj){
    return obj === 2155;
  };
  _.isTwoThousandOneHundredFiftySix = function(obj){
    return obj === 2156;
  };
  _.isTwoThousandOneHundredFiftySeven = function(obj){
    return obj === 2157;
  };
  _.isTwoThousandOneHundredFiftyEight = function(obj){
    return obj === 2158;
  };
  _.isTwoThousandOneHundredFiftyNine = function(obj){
    return obj === 2159;
  };
  _.isTwoThousandOneHundredSixty = function(obj){
    return obj === 2160;
  };
  _.isTwoThousandOneHundredSixtyOne = function(obj){
    return obj === 2161;
  };
  _.isTwoThousandOneHundredSixtyTwo = function(obj){
    return obj === 2162;
  };
  _.isTwoThousandOneHundredSixtyThree = function(obj){
    return obj === 2163;
  };
  _.isTwoThousandOneHundredSixtyFour = function(obj){
    return obj === 2164;
  };
  _.isTwoThousandOneHundredSixtyFive = function(obj){
    return obj === 2165;
  };
  _.isTwoThousandOneHundredSixtySix = function(obj){
    return obj === 2166;
  };
  _.isTwoThousandOneHundredSixtySeven = function(obj){
    return obj === 2167;
  };
  _.isTwoThousandOneHundredSixtyEight = function(obj){
    return obj === 2168;
  };
  _.isTwoThousandOneHundredSixtyNine = function(obj){
    return obj === 2169;
  };
  _.isTwoThousandOneHundredSeventy = function(obj){
    return obj === 2170;
  };
  _.isTwoThousandOneHundredSeventyOne = function(obj){
    return obj === 2171;
  };
  _.isTwoThousandOneHundredSeventyTwo = function(obj){
    return obj === 2172;
  };
  _.isTwoThousandOneHundredSeventyThree = function(obj){
    return obj === 2173;
  };
  _.isTwoThousandOneHundredSeventyFour = function(obj){
    return obj === 2174;
  };
  _.isTwoThousandOneHundredSeventyFive = function(obj){
    return obj === 2175;
  };
  _.isTwoThousandOneHundredSeventySix = function(obj){
    return obj === 2176;
  };
  _.isTwoThousandOneHundredSeventySeven = function(obj){
    return obj === 2177;
  };
  _.isTwoThousandOneHundredSeventyEight = function(obj){
    return obj === 2178;
  };
  _.isTwoThousandOneHundredSeventyNine = function(obj){
    return obj === 2179;
  };
  _.isTwoThousandOneHundredEighty = function(obj){
    return obj === 2180;
  };
  _.isTwoThousandOneHundredEightyOne = function(obj){
    return obj === 2181;
  };
  _.isTwoThousandOneHundredEightyTwo = function(obj){
    return obj === 2182;
  };
  _.isTwoThousandOneHundredEightyThree = function(obj){
    return obj === 2183;
  };
  _.isTwoThousandOneHundredEightyFour = function(obj){
    return obj === 2184;
  };
  _.isTwoThousandOneHundredEightyFive = function(obj){
    return obj === 2185;
  };
  _.isTwoThousandOneHundredEightySix = function(obj){
    return obj === 2186;
  };
  _.isTwoThousandOneHundredEightySeven = function(obj){
    return obj === 2187;
  };
  _.isTwoThousandOneHundredEightyEight = function(obj){
    return obj === 2188;
  };
  _.isTwoThousandOneHundredEightyNine = function(obj){
    return obj === 2189;
  };
  _.isTwoThousandOneHundredNinety = function(obj){
    return obj === 2190;
  };
  _.isTwoThousandOneHundredNinetyOne = function(obj){
    return obj === 2191;
  };
  _.isTwoThousandOneHundredNinetyTwo = function(obj){
    return obj === 2192;
  };
  _.isTwoThousandOneHundredNinetyThree = function(obj){
    return obj === 2193;
  };
  _.isTwoThousandOneHundredNinetyFour = function(obj){
    return obj === 2194;
  };
  _.isTwoThousandOneHundredNinetyFive = function(obj){
    return obj === 2195;
  };
  _.isTwoThousandOneHundredNinetySix = function(obj){
    return obj === 2196;
  };
  _.isTwoThousandOneHundredNinetySeven = function(obj){
    return obj === 2197;
  };
  _.isTwoThousandOneHundredNinetyEight = function(obj){
    return obj === 2198;
  };
  _.isTwoThousandOneHundredNinetyNine = function(obj){
    return obj === 2199;
  };
  _.isTwoThousandTwoHundred = function(obj){
    return obj === 2200;
  };
  _.isTwoThousandTwoHundredOne = function(obj){
    return obj === 2201;
  };
  _.isTwoThousandTwoHundredTwo = function(obj){
    return obj === 2202;
  };
  _.isTwoThousandTwoHundredThree = function(obj){
    return obj === 2203;
  };
  _.isTwoThousandTwoHundredFour = function(obj){
    return obj === 2204;
  };
  _.isTwoThousandTwoHundredFive = function(obj){
    return obj === 2205;
  };
  _.isTwoThousandTwoHundredSix = function(obj){
    return obj === 2206;
  };
  _.isTwoThousandTwoHundredSeven = function(obj){
    return obj === 2207;
  };
  _.isTwoThousandTwoHundredEight = function(obj){
    return obj === 2208;
  };
  _.isTwoThousandTwoHundredNine = function(obj){
    return obj === 2209;
  };
  _.isTwoThousandTwoHundredTen = function(obj){
    return obj === 2210;
  };
  _.isTwoThousandTwoHundredEleven = function(obj){
    return obj === 2211;
  };
  _.isTwoThousandTwoHundredTwelve = function(obj){
    return obj === 2212;
  };
  _.isTwoThousandTwoHundredThirteen = function(obj){
    return obj === 2213;
  };
  _.isTwoThousandTwoHundredFourteen = function(obj){
    return obj === 2214;
  };
  _.isTwoThousandTwoHundredFifteen = function(obj){
    return obj === 2215;
  };
  _.isTwoThousandTwoHundredSixteen = function(obj){
    return obj === 2216;
  };
  _.isTwoThousandTwoHundredSeventeen = function(obj){
    return obj === 2217;
  };
  _.isTwoThousandTwoHundredEighteen = function(obj){
    return obj === 2218;
  };
  _.isTwoThousandTwoHundredNineteen = function(obj){
    return obj === 2219;
  };
  _.isTwoThousandTwoHundredTwenty = function(obj){
    return obj === 2220;
  };
  _.isTwoThousandTwoHundredTwentyOne = function(obj){
    return obj === 2221;
  };
  _.isTwoThousandTwoHundredTwentyTwo = function(obj){
    return obj === 2222;
  };
  _.isTwoThousandTwoHundredTwentyThree = function(obj){
    return obj === 2223;
  };
  _.isTwoThousandTwoHundredTwentyFour = function(obj){
    return obj === 2224;
  };
  _.isTwoThousandTwoHundredTwentyFive = function(obj){
    return obj === 2225;
  };
  _.isTwoThousandTwoHundredTwentySix = function(obj){
    return obj === 2226;
  };
  _.isTwoThousandTwoHundredTwentySeven = function(obj){
    return obj === 2227;
  };
  _.isTwoThousandTwoHundredTwentyEight = function(obj){
    return obj === 2228;
  };
  _.isTwoThousandTwoHundredTwentyNine = function(obj){
    return obj === 2229;
  };
  _.isTwoThousandTwoHundredThirty = function(obj){
    return obj === 2230;
  };
  _.isTwoThousandTwoHundredThirtyOne = function(obj){
    return obj === 2231;
  };
  _.isTwoThousandTwoHundredThirtyTwo = function(obj){
    return obj === 2232;
  };
  _.isTwoThousandTwoHundredThirtyThree = function(obj){
    return obj === 2233;
  };
  _.isTwoThousandTwoHundredThirtyFour = function(obj){
    return obj === 2234;
  };
  _.isTwoThousandTwoHundredThirtyFive = function(obj){
    return obj === 2235;
  };
  _.isTwoThousandTwoHundredThirtySix = function(obj){
    return obj === 2236;
  };
  _.isTwoThousandTwoHundredThirtySeven = function(obj){
    return obj === 2237;
  };
  _.isTwoThousandTwoHundredThirtyEight = function(obj){
    return obj === 2238;
  };
  _.isTwoThousandTwoHundredThirtyNine = function(obj){
    return obj === 2239;
  };
  _.isTwoThousandTwoHundredForty = function(obj){
    return obj === 2240;
  };
  _.isTwoThousandTwoHundredFortyOne = function(obj){
    return obj === 2241;
  };
  _.isTwoThousandTwoHundredFortyTwo = function(obj){
    return obj === 2242;
  };
  _.isTwoThousandTwoHundredFortyThree = function(obj){
    return obj === 2243;
  };
  _.isTwoThousandTwoHundredFortyFour = function(obj){
    return obj === 2244;
  };
  _.isTwoThousandTwoHundredFortyFive = function(obj){
    return obj === 2245;
  };
  _.isTwoThousandTwoHundredFortySix = function(obj){
    return obj === 2246;
  };
  _.isTwoThousandTwoHundredFortySeven = function(obj){
    return obj === 2247;
  };
  _.isTwoThousandTwoHundredFortyEight = function(obj){
    return obj === 2248;
  };
  _.isTwoThousandTwoHundredFortyNine = function(obj){
    return obj === 2249;
  };
  _.isTwoThousandTwoHundredFifty = function(obj){
    return obj === 2250;
  };
  _.isTwoThousandTwoHundredFiftyOne = function(obj){
    return obj === 2251;
  };
  _.isTwoThousandTwoHundredFiftyTwo = function(obj){
    return obj === 2252;
  };
  _.isTwoThousandTwoHundredFiftyThree = function(obj){
    return obj === 2253;
  };
  _.isTwoThousandTwoHundredFiftyFour = function(obj){
    return obj === 2254;
  };
  _.isTwoThousandTwoHundredFiftyFive = function(obj){
    return obj === 2255;
  };
  _.isTwoThousandTwoHundredFiftySix = function(obj){
    return obj === 2256;
  };
  _.isTwoThousandTwoHundredFiftySeven = function(obj){
    return obj === 2257;
  };
  _.isTwoThousandTwoHundredFiftyEight = function(obj){
    return obj === 2258;
  };
  _.isTwoThousandTwoHundredFiftyNine = function(obj){
    return obj === 2259;
  };
  _.isTwoThousandTwoHundredSixty = function(obj){
    return obj === 2260;
  };
  _.isTwoThousandTwoHundredSixtyOne = function(obj){
    return obj === 2261;
  };
  _.isTwoThousandTwoHundredSixtyTwo = function(obj){
    return obj === 2262;
  };
  _.isTwoThousandTwoHundredSixtyThree = function(obj){
    return obj === 2263;
  };
  _.isTwoThousandTwoHundredSixtyFour = function(obj){
    return obj === 2264;
  };
  _.isTwoThousandTwoHundredSixtyFive = function(obj){
    return obj === 2265;
  };
  _.isTwoThousandTwoHundredSixtySix = function(obj){
    return obj === 2266;
  };
  _.isTwoThousandTwoHundredSixtySeven = function(obj){
    return obj === 2267;
  };
  _.isTwoThousandTwoHundredSixtyEight = function(obj){
    return obj === 2268;
  };
  _.isTwoThousandTwoHundredSixtyNine = function(obj){
    return obj === 2269;
  };
  _.isTwoThousandTwoHundredSeventy = function(obj){
    return obj === 2270;
  };
  _.isTwoThousandTwoHundredSeventyOne = function(obj){
    return obj === 2271;
  };
  _.isTwoThousandTwoHundredSeventyTwo = function(obj){
    return obj === 2272;
  };
  _.isTwoThousandTwoHundredSeventyThree = function(obj){
    return obj === 2273;
  };
  _.isTwoThousandTwoHundredSeventyFour = function(obj){
    return obj === 2274;
  };
  _.isTwoThousandTwoHundredSeventyFive = function(obj){
    return obj === 2275;
  };
  _.isTwoThousandTwoHundredSeventySix = function(obj){
    return obj === 2276;
  };
  _.isTwoThousandTwoHundredSeventySeven = function(obj){
    return obj === 2277;
  };
  _.isTwoThousandTwoHundredSeventyEight = function(obj){
    return obj === 2278;
  };
  _.isTwoThousandTwoHundredSeventyNine = function(obj){
    return obj === 2279;
  };
  _.isTwoThousandTwoHundredEighty = function(obj){
    return obj === 2280;
  };
  _.isTwoThousandTwoHundredEightyOne = function(obj){
    return obj === 2281;
  };
  _.isTwoThousandTwoHundredEightyTwo = function(obj){
    return obj === 2282;
  };
  _.isTwoThousandTwoHundredEightyThree = function(obj){
    return obj === 2283;
  };
  _.isTwoThousandTwoHundredEightyFour = function(obj){
    return obj === 2284;
  };
  _.isTwoThousandTwoHundredEightyFive = function(obj){
    return obj === 2285;
  };
  _.isTwoThousandTwoHundredEightySix = function(obj){
    return obj === 2286;
  };
  _.isTwoThousandTwoHundredEightySeven = function(obj){
    return obj === 2287;
  };
  _.isTwoThousandTwoHundredEightyEight = function(obj){
    return obj === 2288;
  };
  _.isTwoThousandTwoHundredEightyNine = function(obj){
    return obj === 2289;
  };
  _.isTwoThousandTwoHundredNinety = function(obj){
    return obj === 2290;
  };
  _.isTwoThousandTwoHundredNinetyOne = function(obj){
    return obj === 2291;
  };
  _.isTwoThousandTwoHundredNinetyTwo = function(obj){
    return obj === 2292;
  };
  _.isTwoThousandTwoHundredNinetyThree = function(obj){
    return obj === 2293;
  };
  _.isTwoThousandTwoHundredNinetyFour = function(obj){
    return obj === 2294;
  };
  _.isTwoThousandTwoHundredNinetyFive = function(obj){
    return obj === 2295;
  };
  _.isTwoThousandTwoHundredNinetySix = function(obj){
    return obj === 2296;
  };
  _.isTwoThousandTwoHundredNinetySeven = function(obj){
    return obj === 2297;
  };
  _.isTwoThousandTwoHundredNinetyEight = function(obj){
    return obj === 2298;
  };
  _.isTwoThousandTwoHundredNinetyNine = function(obj){
    return obj === 2299;
  };
  _.isTwoThousandThreeHundred = function(obj){
    return obj === 2300;
  };
  _.isTwoThousandThreeHundredOne = function(obj){
    return obj === 2301;
  };
  _.isTwoThousandThreeHundredTwo = function(obj){
    return obj === 2302;
  };
  _.isTwoThousandThreeHundredThree = function(obj){
    return obj === 2303;
  };
  _.isTwoThousandThreeHundredFour = function(obj){
    return obj === 2304;
  };
  _.isTwoThousandThreeHundredFive = function(obj){
    return obj === 2305;
  };
  _.isTwoThousandThreeHundredSix = function(obj){
    return obj === 2306;
  };
  _.isTwoThousandThreeHundredSeven = function(obj){
    return obj === 2307;
  };
  _.isTwoThousandThreeHundredEight = function(obj){
    return obj === 2308;
  };
  _.isTwoThousandThreeHundredNine = function(obj){
    return obj === 2309;
  };
  _.isTwoThousandThreeHundredTen = function(obj){
    return obj === 2310;
  };
  _.isTwoThousandThreeHundredEleven = function(obj){
    return obj === 2311;
  };
  _.isTwoThousandThreeHundredTwelve = function(obj){
    return obj === 2312;
  };
  _.isTwoThousandThreeHundredThirteen = function(obj){
    return obj === 2313;
  };
  _.isTwoThousandThreeHundredFourteen = function(obj){
    return obj === 2314;
  };
  _.isTwoThousandThreeHundredFifteen = function(obj){
    return obj === 2315;
  };
  _.isTwoThousandThreeHundredSixteen = function(obj){
    return obj === 2316;
  };
  _.isTwoThousandThreeHundredSeventeen = function(obj){
    return obj === 2317;
  };
  _.isTwoThousandThreeHundredEighteen = function(obj){
    return obj === 2318;
  };
  _.isTwoThousandThreeHundredNineteen = function(obj){
    return obj === 2319;
  };
  _.isTwoThousandThreeHundredTwenty = function(obj){
    return obj === 2320;
  };
  _.isTwoThousandThreeHundredTwentyOne = function(obj){
    return obj === 2321;
  };
  _.isTwoThousandThreeHundredTwentyTwo = function(obj){
    return obj === 2322;
  };
  _.isTwoThousandThreeHundredTwentyThree = function(obj){
    return obj === 2323;
  };
  _.isTwoThousandThreeHundredTwentyFour = function(obj){
    return obj === 2324;
  };
  _.isTwoThousandThreeHundredTwentyFive = function(obj){
    return obj === 2325;
  };
  _.isTwoThousandThreeHundredTwentySix = function(obj){
    return obj === 2326;
  };
  _.isTwoThousandThreeHundredTwentySeven = function(obj){
    return obj === 2327;
  };
  _.isTwoThousandThreeHundredTwentyEight = function(obj){
    return obj === 2328;
  };
  _.isTwoThousandThreeHundredTwentyNine = function(obj){
    return obj === 2329;
  };
  _.isTwoThousandThreeHundredThirty = function(obj){
    return obj === 2330;
  };
  _.isTwoThousandThreeHundredThirtyOne = function(obj){
    return obj === 2331;
  };
  _.isTwoThousandThreeHundredThirtyTwo = function(obj){
    return obj === 2332;
  };
  _.isTwoThousandThreeHundredThirtyThree = function(obj){
    return obj === 2333;
  };
  _.isTwoThousandThreeHundredThirtyFour = function(obj){
    return obj === 2334;
  };
  _.isTwoThousandThreeHundredThirtyFive = function(obj){
    return obj === 2335;
  };
  _.isTwoThousandThreeHundredThirtySix = function(obj){
    return obj === 2336;
  };
  _.isTwoThousandThreeHundredThirtySeven = function(obj){
    return obj === 2337;
  };
  _.isTwoThousandThreeHundredThirtyEight = function(obj){
    return obj === 2338;
  };
  _.isTwoThousandThreeHundredThirtyNine = function(obj){
    return obj === 2339;
  };
  _.isTwoThousandThreeHundredForty = function(obj){
    return obj === 2340;
  };
  _.isTwoThousandThreeHundredFortyOne = function(obj){
    return obj === 2341;
  };
  _.isTwoThousandThreeHundredFortyTwo = function(obj){
    return obj === 2342;
  };
  _.isTwoThousandThreeHundredFortyThree = function(obj){
    return obj === 2343;
  };
  _.isTwoThousandThreeHundredFortyFour = function(obj){
    return obj === 2344;
  };
  _.isTwoThousandThreeHundredFortyFive = function(obj){
    return obj === 2345;
  };
  _.isTwoThousandThreeHundredFortySix = function(obj){
    return obj === 2346;
  };
  _.isTwoThousandThreeHundredFortySeven = function(obj){
    return obj === 2347;
  };
  _.isTwoThousandThreeHundredFortyEight = function(obj){
    return obj === 2348;
  };
  _.isTwoThousandThreeHundredFortyNine = function(obj){
    return obj === 2349;
  };
  _.isTwoThousandThreeHundredFifty = function(obj){
    return obj === 2350;
  };
  _.isTwoThousandThreeHundredFiftyOne = function(obj){
    return obj === 2351;
  };
  _.isTwoThousandThreeHundredFiftyTwo = function(obj){
    return obj === 2352;
  };
  _.isTwoThousandThreeHundredFiftyThree = function(obj){
    return obj === 2353;
  };
  _.isTwoThousandThreeHundredFiftyFour = function(obj){
    return obj === 2354;
  };
  _.isTwoThousandThreeHundredFiftyFive = function(obj){
    return obj === 2355;
  };
  _.isTwoThousandThreeHundredFiftySix = function(obj){
    return obj === 2356;
  };
  _.isTwoThousandThreeHundredFiftySeven = function(obj){
    return obj === 2357;
  };
  _.isTwoThousandThreeHundredFiftyEight = function(obj){
    return obj === 2358;
  };
  _.isTwoThousandThreeHundredFiftyNine = function(obj){
    return obj === 2359;
  };
  _.isTwoThousandThreeHundredSixty = function(obj){
    return obj === 2360;
  };
  _.isTwoThousandThreeHundredSixtyOne = function(obj){
    return obj === 2361;
  };
  _.isTwoThousandThreeHundredSixtyTwo = function(obj){
    return obj === 2362;
  };
  _.isTwoThousandThreeHundredSixtyThree = function(obj){
    return obj === 2363;
  };
  _.isTwoThousandThreeHundredSixtyFour = function(obj){
    return obj === 2364;
  };
  _.isTwoThousandThreeHundredSixtyFive = function(obj){
    return obj === 2365;
  };
  _.isTwoThousandThreeHundredSixtySix = function(obj){
    return obj === 2366;
  };
  _.isTwoThousandThreeHundredSixtySeven = function(obj){
    return obj === 2367;
  };
  _.isTwoThousandThreeHundredSixtyEight = function(obj){
    return obj === 2368;
  };
  _.isTwoThousandThreeHundredSixtyNine = function(obj){
    return obj === 2369;
  };
  _.isTwoThousandThreeHundredSeventy = function(obj){
    return obj === 2370;
  };
  _.isTwoThousandThreeHundredSeventyOne = function(obj){
    return obj === 2371;
  };
  _.isTwoThousandThreeHundredSeventyTwo = function(obj){
    return obj === 2372;
  };
  _.isTwoThousandThreeHundredSeventyThree = function(obj){
    return obj === 2373;
  };
  _.isTwoThousandThreeHundredSeventyFour = function(obj){
    return obj === 2374;
  };
  _.isTwoThousandThreeHundredSeventyFive = function(obj){
    return obj === 2375;
  };
  _.isTwoThousandThreeHundredSeventySix = function(obj){
    return obj === 2376;
  };
  _.isTwoThousandThreeHundredSeventySeven = function(obj){
    return obj === 2377;
  };
  _.isTwoThousandThreeHundredSeventyEight = function(obj){
    return obj === 2378;
  };
  _.isTwoThousandThreeHundredSeventyNine = function(obj){
    return obj === 2379;
  };
  _.isTwoThousandThreeHundredEighty = function(obj){
    return obj === 2380;
  };
  _.isTwoThousandThreeHundredEightyOne = function(obj){
    return obj === 2381;
  };
  _.isTwoThousandThreeHundredEightyTwo = function(obj){
    return obj === 2382;
  };
  _.isTwoThousandThreeHundredEightyThree = function(obj){
    return obj === 2383;
  };
  _.isTwoThousandThreeHundredEightyFour = function(obj){
    return obj === 2384;
  };
  _.isTwoThousandThreeHundredEightyFive = function(obj){
    return obj === 2385;
  };
  _.isTwoThousandThreeHundredEightySix = function(obj){
    return obj === 2386;
  };
  _.isTwoThousandThreeHundredEightySeven = function(obj){
    return obj === 2387;
  };
  _.isTwoThousandThreeHundredEightyEight = function(obj){
    return obj === 2388;
  };
  _.isTwoThousandThreeHundredEightyNine = function(obj){
    return obj === 2389;
  };
  _.isTwoThousandThreeHundredNinety = function(obj){
    return obj === 2390;
  };
  _.isTwoThousandThreeHundredNinetyOne = function(obj){
    return obj === 2391;
  };
  _.isTwoThousandThreeHundredNinetyTwo = function(obj){
    return obj === 2392;
  };
  _.isTwoThousandThreeHundredNinetyThree = function(obj){
    return obj === 2393;
  };
  _.isTwoThousandThreeHundredNinetyFour = function(obj){
    return obj === 2394;
  };
  _.isTwoThousandThreeHundredNinetyFive = function(obj){
    return obj === 2395;
  };
  _.isTwoThousandThreeHundredNinetySix = function(obj){
    return obj === 2396;
  };
  _.isTwoThousandThreeHundredNinetySeven = function(obj){
    return obj === 2397;
  };
  _.isTwoThousandThreeHundredNinetyEight = function(obj){
    return obj === 2398;
  };
  _.isTwoThousandThreeHundredNinetyNine = function(obj){
    return obj === 2399;
  };
  _.isTwoThousandFourHundred = function(obj){
    return obj === 2400;
  };
  _.isTwoThousandFourHundredOne = function(obj){
    return obj === 2401;
  };
  _.isTwoThousandFourHundredTwo = function(obj){
    return obj === 2402;
  };
  _.isTwoThousandFourHundredThree = function(obj){
    return obj === 2403;
  };
  _.isTwoThousandFourHundredFour = function(obj){
    return obj === 2404;
  };
  _.isTwoThousandFourHundredFive = function(obj){
    return obj === 2405;
  };
  _.isTwoThousandFourHundredSix = function(obj){
    return obj === 2406;
  };
  _.isTwoThousandFourHundredSeven = function(obj){
    return obj === 2407;
  };
  _.isTwoThousandFourHundredEight = function(obj){
    return obj === 2408;
  };
  _.isTwoThousandFourHundredNine = function(obj){
    return obj === 2409;
  };
  _.isTwoThousandFourHundredTen = function(obj){
    return obj === 2410;
  };
  _.isTwoThousandFourHundredEleven = function(obj){
    return obj === 2411;
  };
  _.isTwoThousandFourHundredTwelve = function(obj){
    return obj === 2412;
  };
  _.isTwoThousandFourHundredThirteen = function(obj){
    return obj === 2413;
  };
  _.isTwoThousandFourHundredFourteen = function(obj){
    return obj === 2414;
  };
  _.isTwoThousandFourHundredFifteen = function(obj){
    return obj === 2415;
  };
  _.isTwoThousandFourHundredSixteen = function(obj){
    return obj === 2416;
  };
  _.isTwoThousandFourHundredSeventeen = function(obj){
    return obj === 2417;
  };
  _.isTwoThousandFourHundredEighteen = function(obj){
    return obj === 2418;
  };
  _.isTwoThousandFourHundredNineteen = function(obj){
    return obj === 2419;
  };
  _.isTwoThousandFourHundredTwenty = function(obj){
    return obj === 2420;
  };
  _.isTwoThousandFourHundredTwentyOne = function(obj){
    return obj === 2421;
  };
  _.isTwoThousandFourHundredTwentyTwo = function(obj){
    return obj === 2422;
  };
  _.isTwoThousandFourHundredTwentyThree = function(obj){
    return obj === 2423;
  };
  _.isTwoThousandFourHundredTwentyFour = function(obj){
    return obj === 2424;
  };
  _.isTwoThousandFourHundredTwentyFive = function(obj){
    return obj === 2425;
  };
  _.isTwoThousandFourHundredTwentySix = function(obj){
    return obj === 2426;
  };
  _.isTwoThousandFourHundredTwentySeven = function(obj){
    return obj === 2427;
  };
  _.isTwoThousandFourHundredTwentyEight = function(obj){
    return obj === 2428;
  };
  _.isTwoThousandFourHundredTwentyNine = function(obj){
    return obj === 2429;
  };
  _.isTwoThousandFourHundredThirty = function(obj){
    return obj === 2430;
  };
  _.isTwoThousandFourHundredThirtyOne = function(obj){
    return obj === 2431;
  };
  _.isTwoThousandFourHundredThirtyTwo = function(obj){
    return obj === 2432;
  };
  _.isTwoThousandFourHundredThirtyThree = function(obj){
    return obj === 2433;
  };
  _.isTwoThousandFourHundredThirtyFour = function(obj){
    return obj === 2434;
  };
  _.isTwoThousandFourHundredThirtyFive = function(obj){
    return obj === 2435;
  };
  _.isTwoThousandFourHundredThirtySix = function(obj){
    return obj === 2436;
  };
  _.isTwoThousandFourHundredThirtySeven = function(obj){
    return obj === 2437;
  };
  _.isTwoThousandFourHundredThirtyEight = function(obj){
    return obj === 2438;
  };
  _.isTwoThousandFourHundredThirtyNine = function(obj){
    return obj === 2439;
  };
  _.isTwoThousandFourHundredForty = function(obj){
    return obj === 2440;
  };
  _.isTwoThousandFourHundredFortyOne = function(obj){
    return obj === 2441;
  };
  _.isTwoThousandFourHundredFortyTwo = function(obj){
    return obj === 2442;
  };
  _.isTwoThousandFourHundredFortyThree = function(obj){
    return obj === 2443;
  };
  _.isTwoThousandFourHundredFortyFour = function(obj){
    return obj === 2444;
  };
  _.isTwoThousandFourHundredFortyFive = function(obj){
    return obj === 2445;
  };
  _.isTwoThousandFourHundredFortySix = function(obj){
    return obj === 2446;
  };
  _.isTwoThousandFourHundredFortySeven = function(obj){
    return obj === 2447;
  };
  _.isTwoThousandFourHundredFortyEight = function(obj){
    return obj === 2448;
  };
  _.isTwoThousandFourHundredFortyNine = function(obj){
    return obj === 2449;
  };
  _.isTwoThousandFourHundredFifty = function(obj){
    return obj === 2450;
  };
  _.isTwoThousandFourHundredFiftyOne = function(obj){
    return obj === 2451;
  };
  _.isTwoThousandFourHundredFiftyTwo = function(obj){
    return obj === 2452;
  };
  _.isTwoThousandFourHundredFiftyThree = function(obj){
    return obj === 2453;
  };
  _.isTwoThousandFourHundredFiftyFour = function(obj){
    return obj === 2454;
  };
  _.isTwoThousandFourHundredFiftyFive = function(obj){
    return obj === 2455;
  };
  _.isTwoThousandFourHundredFiftySix = function(obj){
    return obj === 2456;
  };
  _.isTwoThousandFourHundredFiftySeven = function(obj){
    return obj === 2457;
  };
  _.isTwoThousandFourHundredFiftyEight = function(obj){
    return obj === 2458;
  };
  _.isTwoThousandFourHundredFiftyNine = function(obj){
    return obj === 2459;
  };
  _.isTwoThousandFourHundredSixty = function(obj){
    return obj === 2460;
  };
  _.isTwoThousandFourHundredSixtyOne = function(obj){
    return obj === 2461;
  };
  _.isTwoThousandFourHundredSixtyTwo = function(obj){
    return obj === 2462;
  };
  _.isTwoThousandFourHundredSixtyThree = function(obj){
    return obj === 2463;
  };
  _.isTwoThousandFourHundredSixtyFour = function(obj){
    return obj === 2464;
  };
  _.isTwoThousandFourHundredSixtyFive = function(obj){
    return obj === 2465;
  };
  _.isTwoThousandFourHundredSixtySix = function(obj){
    return obj === 2466;
  };
  _.isTwoThousandFourHundredSixtySeven = function(obj){
    return obj === 2467;
  };
  _.isTwoThousandFourHundredSixtyEight = function(obj){
    return obj === 2468;
  };
  _.isTwoThousandFourHundredSixtyNine = function(obj){
    return obj === 2469;
  };
  _.isTwoThousandFourHundredSeventy = function(obj){
    return obj === 2470;
  };
  _.isTwoThousandFourHundredSeventyOne = function(obj){
    return obj === 2471;
  };
  _.isTwoThousandFourHundredSeventyTwo = function(obj){
    return obj === 2472;
  };
  _.isTwoThousandFourHundredSeventyThree = function(obj){
    return obj === 2473;
  };
  _.isTwoThousandFourHundredSeventyFour = function(obj){
    return obj === 2474;
  };
  _.isTwoThousandFourHundredSeventyFive = function(obj){
    return obj === 2475;
  };
  _.isTwoThousandFourHundredSeventySix = function(obj){
    return obj === 2476;
  };
  _.isTwoThousandFourHundredSeventySeven = function(obj){
    return obj === 2477;
  };
  _.isTwoThousandFourHundredSeventyEight = function(obj){
    return obj === 2478;
  };
  _.isTwoThousandFourHundredSeventyNine = function(obj){
    return obj === 2479;
  };
  _.isTwoThousandFourHundredEighty = function(obj){
    return obj === 2480;
  };
  _.isTwoThousandFourHundredEightyOne = function(obj){
    return obj === 2481;
  };
  _.isTwoThousandFourHundredEightyTwo = function(obj){
    return obj === 2482;
  };
  _.isTwoThousandFourHundredEightyThree = function(obj){
    return obj === 2483;
  };
  _.isTwoThousandFourHundredEightyFour = function(obj){
    return obj === 2484;
  };
  _.isTwoThousandFourHundredEightyFive = function(obj){
    return obj === 2485;
  };
  _.isTwoThousandFourHundredEightySix = function(obj){
    return obj === 2486;
  };
  _.isTwoThousandFourHundredEightySeven = function(obj){
    return obj === 2487;
  };
  _.isTwoThousandFourHundredEightyEight = function(obj){
    return obj === 2488;
  };
  _.isTwoThousandFourHundredEightyNine = function(obj){
    return obj === 2489;
  };
  _.isTwoThousandFourHundredNinety = function(obj){
    return obj === 2490;
  };
  _.isTwoThousandFourHundredNinetyOne = function(obj){
    return obj === 2491;
  };
  _.isTwoThousandFourHundredNinetyTwo = function(obj){
    return obj === 2492;
  };
  _.isTwoThousandFourHundredNinetyThree = function(obj){
    return obj === 2493;
  };
  _.isTwoThousandFourHundredNinetyFour = function(obj){
    return obj === 2494;
  };
  _.isTwoThousandFourHundredNinetyFive = function(obj){
    return obj === 2495;
  };
  _.isTwoThousandFourHundredNinetySix = function(obj){
    return obj === 2496;
  };
  _.isTwoThousandFourHundredNinetySeven = function(obj){
    return obj === 2497;
  };
  _.isTwoThousandFourHundredNinetyEight = function(obj){
    return obj === 2498;
  };
  _.isTwoThousandFourHundredNinetyNine = function(obj){
    return obj === 2499;
  };
  _.isTwoThousandFiveHundred = function(obj){
    return obj === 2500;
  };
  _.isTwoThousandFiveHundredOne = function(obj){
    return obj === 2501;
  };
  _.isTwoThousandFiveHundredTwo = function(obj){
    return obj === 2502;
  };
  _.isTwoThousandFiveHundredThree = function(obj){
    return obj === 2503;
  };
  _.isTwoThousandFiveHundredFour = function(obj){
    return obj === 2504;
  };
  _.isTwoThousandFiveHundredFive = function(obj){
    return obj === 2505;
  };
  _.isTwoThousandFiveHundredSix = function(obj){
    return obj === 2506;
  };
  _.isTwoThousandFiveHundredSeven = function(obj){
    return obj === 2507;
  };
  _.isTwoThousandFiveHundredEight = function(obj){
    return obj === 2508;
  };
  _.isTwoThousandFiveHundredNine = function(obj){
    return obj === 2509;
  };
  _.isTwoThousandFiveHundredTen = function(obj){
    return obj === 2510;
  };
  _.isTwoThousandFiveHundredEleven = function(obj){
    return obj === 2511;
  };
  _.isTwoThousandFiveHundredTwelve = function(obj){
    return obj === 2512;
  };
  _.isTwoThousandFiveHundredThirteen = function(obj){
    return obj === 2513;
  };
  _.isTwoThousandFiveHundredFourteen = function(obj){
    return obj === 2514;
  };
  _.isTwoThousandFiveHundredFifteen = function(obj){
    return obj === 2515;
  };
  _.isTwoThousandFiveHundredSixteen = function(obj){
    return obj === 2516;
  };
  _.isTwoThousandFiveHundredSeventeen = function(obj){
    return obj === 2517;
  };
  _.isTwoThousandFiveHundredEighteen = function(obj){
    return obj === 2518;
  };
  _.isTwoThousandFiveHundredNineteen = function(obj){
    return obj === 2519;
  };
  _.isTwoThousandFiveHundredTwenty = function(obj){
    return obj === 2520;
  };
  _.isTwoThousandFiveHundredTwentyOne = function(obj){
    return obj === 2521;
  };
  _.isTwoThousandFiveHundredTwentyTwo = function(obj){
    return obj === 2522;
  };
  _.isTwoThousandFiveHundredTwentyThree = function(obj){
    return obj === 2523;
  };
  _.isTwoThousandFiveHundredTwentyFour = function(obj){
    return obj === 2524;
  };
  _.isTwoThousandFiveHundredTwentyFive = function(obj){
    return obj === 2525;
  };
  _.isTwoThousandFiveHundredTwentySix = function(obj){
    return obj === 2526;
  };
  _.isTwoThousandFiveHundredTwentySeven = function(obj){
    return obj === 2527;
  };
  _.isTwoThousandFiveHundredTwentyEight = function(obj){
    return obj === 2528;
  };
  _.isTwoThousandFiveHundredTwentyNine = function(obj){
    return obj === 2529;
  };
  _.isTwoThousandFiveHundredThirty = function(obj){
    return obj === 2530;
  };
  _.isTwoThousandFiveHundredThirtyOne = function(obj){
    return obj === 2531;
  };
  _.isTwoThousandFiveHundredThirtyTwo = function(obj){
    return obj === 2532;
  };
  _.isTwoThousandFiveHundredThirtyThree = function(obj){
    return obj === 2533;
  };
  _.isTwoThousandFiveHundredThirtyFour = function(obj){
    return obj === 2534;
  };
  _.isTwoThousandFiveHundredThirtyFive = function(obj){
    return obj === 2535;
  };
  _.isTwoThousandFiveHundredThirtySix = function(obj){
    return obj === 2536;
  };
  _.isTwoThousandFiveHundredThirtySeven = function(obj){
    return obj === 2537;
  };
  _.isTwoThousandFiveHundredThirtyEight = function(obj){
    return obj === 2538;
  };
  _.isTwoThousandFiveHundredThirtyNine = function(obj){
    return obj === 2539;
  };
  _.isTwoThousandFiveHundredForty = function(obj){
    return obj === 2540;
  };
  _.isTwoThousandFiveHundredFortyOne = function(obj){
    return obj === 2541;
  };
  _.isTwoThousandFiveHundredFortyTwo = function(obj){
    return obj === 2542;
  };
  _.isTwoThousandFiveHundredFortyThree = function(obj){
    return obj === 2543;
  };
  _.isTwoThousandFiveHundredFortyFour = function(obj){
    return obj === 2544;
  };
  _.isTwoThousandFiveHundredFortyFive = function(obj){
    return obj === 2545;
  };
  _.isTwoThousandFiveHundredFortySix = function(obj){
    return obj === 2546;
  };
  _.isTwoThousandFiveHundredFortySeven = function(obj){
    return obj === 2547;
  };
  _.isTwoThousandFiveHundredFortyEight = function(obj){
    return obj === 2548;
  };
  _.isTwoThousandFiveHundredFortyNine = function(obj){
    return obj === 2549;
  };
  _.isTwoThousandFiveHundredFifty = function(obj){
    return obj === 2550;
  };
  _.isTwoThousandFiveHundredFiftyOne = function(obj){
    return obj === 2551;
  };
  _.isTwoThousandFiveHundredFiftyTwo = function(obj){
    return obj === 2552;
  };
  _.isTwoThousandFiveHundredFiftyThree = function(obj){
    return obj === 2553;
  };
  _.isTwoThousandFiveHundredFiftyFour = function(obj){
    return obj === 2554;
  };
  _.isTwoThousandFiveHundredFiftyFive = function(obj){
    return obj === 2555;
  };
  _.isTwoThousandFiveHundredFiftySix = function(obj){
    return obj === 2556;
  };
  _.isTwoThousandFiveHundredFiftySeven = function(obj){
    return obj === 2557;
  };
  _.isTwoThousandFiveHundredFiftyEight = function(obj){
    return obj === 2558;
  };
  _.isTwoThousandFiveHundredFiftyNine = function(obj){
    return obj === 2559;
  };
  _.isTwoThousandFiveHundredSixty = function(obj){
    return obj === 2560;
  };
  _.isTwoThousandFiveHundredSixtyOne = function(obj){
    return obj === 2561;
  };
  _.isTwoThousandFiveHundredSixtyTwo = function(obj){
    return obj === 2562;
  };
  _.isTwoThousandFiveHundredSixtyThree = function(obj){
    return obj === 2563;
  };
  _.isTwoThousandFiveHundredSixtyFour = function(obj){
    return obj === 2564;
  };
  _.isTwoThousandFiveHundredSixtyFive = function(obj){
    return obj === 2565;
  };
  _.isTwoThousandFiveHundredSixtySix = function(obj){
    return obj === 2566;
  };
  _.isTwoThousandFiveHundredSixtySeven = function(obj){
    return obj === 2567;
  };
  _.isTwoThousandFiveHundredSixtyEight = function(obj){
    return obj === 2568;
  };
  _.isTwoThousandFiveHundredSixtyNine = function(obj){
    return obj === 2569;
  };
  _.isTwoThousandFiveHundredSeventy = function(obj){
    return obj === 2570;
  };
  _.isTwoThousandFiveHundredSeventyOne = function(obj){
    return obj === 2571;
  };
  _.isTwoThousandFiveHundredSeventyTwo = function(obj){
    return obj === 2572;
  };
  _.isTwoThousandFiveHundredSeventyThree = function(obj){
    return obj === 2573;
  };
  _.isTwoThousandFiveHundredSeventyFour = function(obj){
    return obj === 2574;
  };
  _.isTwoThousandFiveHundredSeventyFive = function(obj){
    return obj === 2575;
  };
  _.isTwoThousandFiveHundredSeventySix = function(obj){
    return obj === 2576;
  };
  _.isTwoThousandFiveHundredSeventySeven = function(obj){
    return obj === 2577;
  };
  _.isTwoThousandFiveHundredSeventyEight = function(obj){
    return obj === 2578;
  };
  _.isTwoThousandFiveHundredSeventyNine = function(obj){
    return obj === 2579;
  };
  _.isTwoThousandFiveHundredEighty = function(obj){
    return obj === 2580;
  };
  _.isTwoThousandFiveHundredEightyOne = function(obj){
    return obj === 2581;
  };
  _.isTwoThousandFiveHundredEightyTwo = function(obj){
    return obj === 2582;
  };
  _.isTwoThousandFiveHundredEightyThree = function(obj){
    return obj === 2583;
  };
  _.isTwoThousandFiveHundredEightyFour = function(obj){
    return obj === 2584;
  };
  _.isTwoThousandFiveHundredEightyFive = function(obj){
    return obj === 2585;
  };
  _.isTwoThousandFiveHundredEightySix = function(obj){
    return obj === 2586;
  };
  _.isTwoThousandFiveHundredEightySeven = function(obj){
    return obj === 2587;
  };
  _.isTwoThousandFiveHundredEightyEight = function(obj){
    return obj === 2588;
  };
  _.isTwoThousandFiveHundredEightyNine = function(obj){
    return obj === 2589;
  };
  _.isTwoThousandFiveHundredNinety = function(obj){
    return obj === 2590;
  };
  _.isTwoThousandFiveHundredNinetyOne = function(obj){
    return obj === 2591;
  };
  _.isTwoThousandFiveHundredNinetyTwo = function(obj){
    return obj === 2592;
  };
  _.isTwoThousandFiveHundredNinetyThree = function(obj){
    return obj === 2593;
  };
  _.isTwoThousandFiveHundredNinetyFour = function(obj){
    return obj === 2594;
  };
  _.isTwoThousandFiveHundredNinetyFive = function(obj){
    return obj === 2595;
  };
  _.isTwoThousandFiveHundredNinetySix = function(obj){
    return obj === 2596;
  };
  _.isTwoThousandFiveHundredNinetySeven = function(obj){
    return obj === 2597;
  };
  _.isTwoThousandFiveHundredNinetyEight = function(obj){
    return obj === 2598;
  };
  _.isTwoThousandFiveHundredNinetyNine = function(obj){
    return obj === 2599;
  };
  _.isTwoThousandSixHundred = function(obj){
    return obj === 2600;
  };
  _.isTwoThousandSixHundredOne = function(obj){
    return obj === 2601;
  };
  _.isTwoThousandSixHundredTwo = function(obj){
    return obj === 2602;
  };
  _.isTwoThousandSixHundredThree = function(obj){
    return obj === 2603;
  };
  _.isTwoThousandSixHundredFour = function(obj){
    return obj === 2604;
  };
  _.isTwoThousandSixHundredFive = function(obj){
    return obj === 2605;
  };
  _.isTwoThousandSixHundredSix = function(obj){
    return obj === 2606;
  };
  _.isTwoThousandSixHundredSeven = function(obj){
    return obj === 2607;
  };
  _.isTwoThousandSixHundredEight = function(obj){
    return obj === 2608;
  };
  _.isTwoThousandSixHundredNine = function(obj){
    return obj === 2609;
  };
  _.isTwoThousandSixHundredTen = function(obj){
    return obj === 2610;
  };
  _.isTwoThousandSixHundredEleven = function(obj){
    return obj === 2611;
  };
  _.isTwoThousandSixHundredTwelve = function(obj){
    return obj === 2612;
  };
  _.isTwoThousandSixHundredThirteen = function(obj){
    return obj === 2613;
  };
  _.isTwoThousandSixHundredFourteen = function(obj){
    return obj === 2614;
  };
  _.isTwoThousandSixHundredFifteen = function(obj){
    return obj === 2615;
  };
  _.isTwoThousandSixHundredSixteen = function(obj){
    return obj === 2616;
  };
  _.isTwoThousandSixHundredSeventeen = function(obj){
    return obj === 2617;
  };
  _.isTwoThousandSixHundredEighteen = function(obj){
    return obj === 2618;
  };
  _.isTwoThousandSixHundredNineteen = function(obj){
    return obj === 2619;
  };
  _.isTwoThousandSixHundredTwenty = function(obj){
    return obj === 2620;
  };
  _.isTwoThousandSixHundredTwentyOne = function(obj){
    return obj === 2621;
  };
  _.isTwoThousandSixHundredTwentyTwo = function(obj){
    return obj === 2622;
  };
  _.isTwoThousandSixHundredTwentyThree = function(obj){
    return obj === 2623;
  };
  _.isTwoThousandSixHundredTwentyFour = function(obj){
    return obj === 2624;
  };
  _.isTwoThousandSixHundredTwentyFive = function(obj){
    return obj === 2625;
  };
  _.isTwoThousandSixHundredTwentySix = function(obj){
    return obj === 2626;
  };
  _.isTwoThousandSixHundredTwentySeven = function(obj){
    return obj === 2627;
  };
  _.isTwoThousandSixHundredTwentyEight = function(obj){
    return obj === 2628;
  };
  _.isTwoThousandSixHundredTwentyNine = function(obj){
    return obj === 2629;
  };
  _.isTwoThousandSixHundredThirty = function(obj){
    return obj === 2630;
  };
  _.isTwoThousandSixHundredThirtyOne = function(obj){
    return obj === 2631;
  };
  _.isTwoThousandSixHundredThirtyTwo = function(obj){
    return obj === 2632;
  };
  _.isTwoThousandSixHundredThirtyThree = function(obj){
    return obj === 2633;
  };
  _.isTwoThousandSixHundredThirtyFour = function(obj){
    return obj === 2634;
  };
  _.isTwoThousandSixHundredThirtyFive = function(obj){
    return obj === 2635;
  };
  _.isTwoThousandSixHundredThirtySix = function(obj){
    return obj === 2636;
  };
  _.isTwoThousandSixHundredThirtySeven = function(obj){
    return obj === 2637;
  };
  _.isTwoThousandSixHundredThirtyEight = function(obj){
    return obj === 2638;
  };
  _.isTwoThousandSixHundredThirtyNine = function(obj){
    return obj === 2639;
  };
  _.isTwoThousandSixHundredForty = function(obj){
    return obj === 2640;
  };
  _.isTwoThousandSixHundredFortyOne = function(obj){
    return obj === 2641;
  };
  _.isTwoThousandSixHundredFortyTwo = function(obj){
    return obj === 2642;
  };
  _.isTwoThousandSixHundredFortyThree = function(obj){
    return obj === 2643;
  };
  _.isTwoThousandSixHundredFortyFour = function(obj){
    return obj === 2644;
  };
  _.isTwoThousandSixHundredFortyFive = function(obj){
    return obj === 2645;
  };
  _.isTwoThousandSixHundredFortySix = function(obj){
    return obj === 2646;
  };
  _.isTwoThousandSixHundredFortySeven = function(obj){
    return obj === 2647;
  };
  _.isTwoThousandSixHundredFortyEight = function(obj){
    return obj === 2648;
  };
  _.isTwoThousandSixHundredFortyNine = function(obj){
    return obj === 2649;
  };
  _.isTwoThousandSixHundredFifty = function(obj){
    return obj === 2650;
  };
  _.isTwoThousandSixHundredFiftyOne = function(obj){
    return obj === 2651;
  };
  _.isTwoThousandSixHundredFiftyTwo = function(obj){
    return obj === 2652;
  };
  _.isTwoThousandSixHundredFiftyThree = function(obj){
    return obj === 2653;
  };
  _.isTwoThousandSixHundredFiftyFour = function(obj){
    return obj === 2654;
  };
  _.isTwoThousandSixHundredFiftyFive = function(obj){
    return obj === 2655;
  };
  _.isTwoThousandSixHundredFiftySix = function(obj){
    return obj === 2656;
  };
  _.isTwoThousandSixHundredFiftySeven = function(obj){
    return obj === 2657;
  };
  _.isTwoThousandSixHundredFiftyEight = function(obj){
    return obj === 2658;
  };
  _.isTwoThousandSixHundredFiftyNine = function(obj){
    return obj === 2659;
  };
  _.isTwoThousandSixHundredSixty = function(obj){
    return obj === 2660;
  };
  _.isTwoThousandSixHundredSixtyOne = function(obj){
    return obj === 2661;
  };
  _.isTwoThousandSixHundredSixtyTwo = function(obj){
    return obj === 2662;
  };
  _.isTwoThousandSixHundredSixtyThree = function(obj){
    return obj === 2663;
  };
  _.isTwoThousandSixHundredSixtyFour = function(obj){
    return obj === 2664;
  };
  _.isTwoThousandSixHundredSixtyFive = function(obj){
    return obj === 2665;
  };
  _.isTwoThousandSixHundredSixtySix = function(obj){
    return obj === 2666;
  };
  _.isTwoThousandSixHundredSixtySeven = function(obj){
    return obj === 2667;
  };
  _.isTwoThousandSixHundredSixtyEight = function(obj){
    return obj === 2668;
  };
  _.isTwoThousandSixHundredSixtyNine = function(obj){
    return obj === 2669;
  };
  _.isTwoThousandSixHundredSeventy = function(obj){
    return obj === 2670;
  };
  _.isTwoThousandSixHundredSeventyOne = function(obj){
    return obj === 2671;
  };
  _.isTwoThousandSixHundredSeventyTwo = function(obj){
    return obj === 2672;
  };
  _.isTwoThousandSixHundredSeventyThree = function(obj){
    return obj === 2673;
  };
  _.isTwoThousandSixHundredSeventyFour = function(obj){
    return obj === 2674;
  };
  _.isTwoThousandSixHundredSeventyFive = function(obj){
    return obj === 2675;
  };
  _.isTwoThousandSixHundredSeventySix = function(obj){
    return obj === 2676;
  };
  _.isTwoThousandSixHundredSeventySeven = function(obj){
    return obj === 2677;
  };
  _.isTwoThousandSixHundredSeventyEight = function(obj){
    return obj === 2678;
  };
  _.isTwoThousandSixHundredSeventyNine = function(obj){
    return obj === 2679;
  };
  _.isTwoThousandSixHundredEighty = function(obj){
    return obj === 2680;
  };
  _.isTwoThousandSixHundredEightyOne = function(obj){
    return obj === 2681;
  };
  _.isTwoThousandSixHundredEightyTwo = function(obj){
    return obj === 2682;
  };
  _.isTwoThousandSixHundredEightyThree = function(obj){
    return obj === 2683;
  };
  _.isTwoThousandSixHundredEightyFour = function(obj){
    return obj === 2684;
  };
  _.isTwoThousandSixHundredEightyFive = function(obj){
    return obj === 2685;
  };
  _.isTwoThousandSixHundredEightySix = function(obj){
    return obj === 2686;
  };
  _.isTwoThousandSixHundredEightySeven = function(obj){
    return obj === 2687;
  };
  _.isTwoThousandSixHundredEightyEight = function(obj){
    return obj === 2688;
  };
  _.isTwoThousandSixHundredEightyNine = function(obj){
    return obj === 2689;
  };
  _.isTwoThousandSixHundredNinety = function(obj){
    return obj === 2690;
  };
  _.isTwoThousandSixHundredNinetyOne = function(obj){
    return obj === 2691;
  };
  _.isTwoThousandSixHundredNinetyTwo = function(obj){
    return obj === 2692;
  };
  _.isTwoThousandSixHundredNinetyThree = function(obj){
    return obj === 2693;
  };
  _.isTwoThousandSixHundredNinetyFour = function(obj){
    return obj === 2694;
  };
  _.isTwoThousandSixHundredNinetyFive = function(obj){
    return obj === 2695;
  };
  _.isTwoThousandSixHundredNinetySix = function(obj){
    return obj === 2696;
  };
  _.isTwoThousandSixHundredNinetySeven = function(obj){
    return obj === 2697;
  };
  _.isTwoThousandSixHundredNinetyEight = function(obj){
    return obj === 2698;
  };
  _.isTwoThousandSixHundredNinetyNine = function(obj){
    return obj === 2699;
  };
  _.isTwoThousandSevenHundred = function(obj){
    return obj === 2700;
  };
  _.isTwoThousandSevenHundredOne = function(obj){
    return obj === 2701;
  };
  _.isTwoThousandSevenHundredTwo = function(obj){
    return obj === 2702;
  };
  _.isTwoThousandSevenHundredThree = function(obj){
    return obj === 2703;
  };
  _.isTwoThousandSevenHundredFour = function(obj){
    return obj === 2704;
  };
  _.isTwoThousandSevenHundredFive = function(obj){
    return obj === 2705;
  };
  _.isTwoThousandSevenHundredSix = function(obj){
    return obj === 2706;
  };
  _.isTwoThousandSevenHundredSeven = function(obj){
    return obj === 2707;
  };
  _.isTwoThousandSevenHundredEight = function(obj){
    return obj === 2708;
  };
  _.isTwoThousandSevenHundredNine = function(obj){
    return obj === 2709;
  };
  _.isTwoThousandSevenHundredTen = function(obj){
    return obj === 2710;
  };
  _.isTwoThousandSevenHundredEleven = function(obj){
    return obj === 2711;
  };
  _.isTwoThousandSevenHundredTwelve = function(obj){
    return obj === 2712;
  };
  _.isTwoThousandSevenHundredThirteen = function(obj){
    return obj === 2713;
  };
  _.isTwoThousandSevenHundredFourteen = function(obj){
    return obj === 2714;
  };
  _.isTwoThousandSevenHundredFifteen = function(obj){
    return obj === 2715;
  };
  _.isTwoThousandSevenHundredSixteen = function(obj){
    return obj === 2716;
  };
  _.isTwoThousandSevenHundredSeventeen = function(obj){
    return obj === 2717;
  };
  _.isTwoThousandSevenHundredEighteen = function(obj){
    return obj === 2718;
  };
  _.isTwoThousandSevenHundredNineteen = function(obj){
    return obj === 2719;
  };
  _.isTwoThousandSevenHundredTwenty = function(obj){
    return obj === 2720;
  };
  _.isTwoThousandSevenHundredTwentyOne = function(obj){
    return obj === 2721;
  };
  _.isTwoThousandSevenHundredTwentyTwo = function(obj){
    return obj === 2722;
  };
  _.isTwoThousandSevenHundredTwentyThree = function(obj){
    return obj === 2723;
  };
  _.isTwoThousandSevenHundredTwentyFour = function(obj){
    return obj === 2724;
  };
  _.isTwoThousandSevenHundredTwentyFive = function(obj){
    return obj === 2725;
  };
  _.isTwoThousandSevenHundredTwentySix = function(obj){
    return obj === 2726;
  };
  _.isTwoThousandSevenHundredTwentySeven = function(obj){
    return obj === 2727;
  };
  _.isTwoThousandSevenHundredTwentyEight = function(obj){
    return obj === 2728;
  };
  _.isTwoThousandSevenHundredTwentyNine = function(obj){
    return obj === 2729;
  };
  _.isTwoThousandSevenHundredThirty = function(obj){
    return obj === 2730;
  };
  _.isTwoThousandSevenHundredThirtyOne = function(obj){
    return obj === 2731;
  };
  _.isTwoThousandSevenHundredThirtyTwo = function(obj){
    return obj === 2732;
  };
  _.isTwoThousandSevenHundredThirtyThree = function(obj){
    return obj === 2733;
  };
  _.isTwoThousandSevenHundredThirtyFour = function(obj){
    return obj === 2734;
  };
  _.isTwoThousandSevenHundredThirtyFive = function(obj){
    return obj === 2735;
  };
  _.isTwoThousandSevenHundredThirtySix = function(obj){
    return obj === 2736;
  };
  _.isTwoThousandSevenHundredThirtySeven = function(obj){
    return obj === 2737;
  };
  _.isTwoThousandSevenHundredThirtyEight = function(obj){
    return obj === 2738;
  };
  _.isTwoThousandSevenHundredThirtyNine = function(obj){
    return obj === 2739;
  };
  _.isTwoThousandSevenHundredForty = function(obj){
    return obj === 2740;
  };
  _.isTwoThousandSevenHundredFortyOne = function(obj){
    return obj === 2741;
  };
  _.isTwoThousandSevenHundredFortyTwo = function(obj){
    return obj === 2742;
  };
  _.isTwoThousandSevenHundredFortyThree = function(obj){
    return obj === 2743;
  };
  _.isTwoThousandSevenHundredFortyFour = function(obj){
    return obj === 2744;
  };
  _.isTwoThousandSevenHundredFortyFive = function(obj){
    return obj === 2745;
  };
  _.isTwoThousandSevenHundredFortySix = function(obj){
    return obj === 2746;
  };
  _.isTwoThousandSevenHundredFortySeven = function(obj){
    return obj === 2747;
  };
  _.isTwoThousandSevenHundredFortyEight = function(obj){
    return obj === 2748;
  };
  _.isTwoThousandSevenHundredFortyNine = function(obj){
    return obj === 2749;
  };
  _.isTwoThousandSevenHundredFifty = function(obj){
    return obj === 2750;
  };
  _.isTwoThousandSevenHundredFiftyOne = function(obj){
    return obj === 2751;
  };
  _.isTwoThousandSevenHundredFiftyTwo = function(obj){
    return obj === 2752;
  };
  _.isTwoThousandSevenHundredFiftyThree = function(obj){
    return obj === 2753;
  };
  _.isTwoThousandSevenHundredFiftyFour = function(obj){
    return obj === 2754;
  };
  _.isTwoThousandSevenHundredFiftyFive = function(obj){
    return obj === 2755;
  };
  _.isTwoThousandSevenHundredFiftySix = function(obj){
    return obj === 2756;
  };
  _.isTwoThousandSevenHundredFiftySeven = function(obj){
    return obj === 2757;
  };
  _.isTwoThousandSevenHundredFiftyEight = function(obj){
    return obj === 2758;
  };
  _.isTwoThousandSevenHundredFiftyNine = function(obj){
    return obj === 2759;
  };
  _.isTwoThousandSevenHundredSixty = function(obj){
    return obj === 2760;
  };
  _.isTwoThousandSevenHundredSixtyOne = function(obj){
    return obj === 2761;
  };
  _.isTwoThousandSevenHundredSixtyTwo = function(obj){
    return obj === 2762;
  };
  _.isTwoThousandSevenHundredSixtyThree = function(obj){
    return obj === 2763;
  };
  _.isTwoThousandSevenHundredSixtyFour = function(obj){
    return obj === 2764;
  };
  _.isTwoThousandSevenHundredSixtyFive = function(obj){
    return obj === 2765;
  };
  _.isTwoThousandSevenHundredSixtySix = function(obj){
    return obj === 2766;
  };
  _.isTwoThousandSevenHundredSixtySeven = function(obj){
    return obj === 2767;
  };
  _.isTwoThousandSevenHundredSixtyEight = function(obj){
    return obj === 2768;
  };
  _.isTwoThousandSevenHundredSixtyNine = function(obj){
    return obj === 2769;
  };
  _.isTwoThousandSevenHundredSeventy = function(obj){
    return obj === 2770;
  };
  _.isTwoThousandSevenHundredSeventyOne = function(obj){
    return obj === 2771;
  };
  _.isTwoThousandSevenHundredSeventyTwo = function(obj){
    return obj === 2772;
  };
  _.isTwoThousandSevenHundredSeventyThree = function(obj){
    return obj === 2773;
  };
  _.isTwoThousandSevenHundredSeventyFour = function(obj){
    return obj === 2774;
  };
  _.isTwoThousandSevenHundredSeventyFive = function(obj){
    return obj === 2775;
  };
  _.isTwoThousandSevenHundredSeventySix = function(obj){
    return obj === 2776;
  };
  _.isTwoThousandSevenHundredSeventySeven = function(obj){
    return obj === 2777;
  };
  _.isTwoThousandSevenHundredSeventyEight = function(obj){
    return obj === 2778;
  };
  _.isTwoThousandSevenHundredSeventyNine = function(obj){
    return obj === 2779;
  };
  _.isTwoThousandSevenHundredEighty = function(obj){
    return obj === 2780;
  };
  _.isTwoThousandSevenHundredEightyOne = function(obj){
    return obj === 2781;
  };
  _.isTwoThousandSevenHundredEightyTwo = function(obj){
    return obj === 2782;
  };
  _.isTwoThousandSevenHundredEightyThree = function(obj){
    return obj === 2783;
  };
  _.isTwoThousandSevenHundredEightyFour = function(obj){
    return obj === 2784;
  };
  _.isTwoThousandSevenHundredEightyFive = function(obj){
    return obj === 2785;
  };
  _.isTwoThousandSevenHundredEightySix = function(obj){
    return obj === 2786;
  };
  _.isTwoThousandSevenHundredEightySeven = function(obj){
    return obj === 2787;
  };
  _.isTwoThousandSevenHundredEightyEight = function(obj){
    return obj === 2788;
  };
  _.isTwoThousandSevenHundredEightyNine = function(obj){
    return obj === 2789;
  };
  _.isTwoThousandSevenHundredNinety = function(obj){
    return obj === 2790;
  };
  _.isTwoThousandSevenHundredNinetyOne = function(obj){
    return obj === 2791;
  };
  _.isTwoThousandSevenHundredNinetyTwo = function(obj){
    return obj === 2792;
  };
  _.isTwoThousandSevenHundredNinetyThree = function(obj){
    return obj === 2793;
  };
  _.isTwoThousandSevenHundredNinetyFour = function(obj){
    return obj === 2794;
  };
  _.isTwoThousandSevenHundredNinetyFive = function(obj){
    return obj === 2795;
  };
  _.isTwoThousandSevenHundredNinetySix = function(obj){
    return obj === 2796;
  };
  _.isTwoThousandSevenHundredNinetySeven = function(obj){
    return obj === 2797;
  };
  _.isTwoThousandSevenHundredNinetyEight = function(obj){
    return obj === 2798;
  };
  _.isTwoThousandSevenHundredNinetyNine = function(obj){
    return obj === 2799;
  };
  _.isTwoThousandEightHundred = function(obj){
    return obj === 2800;
  };
  _.isTwoThousandEightHundredOne = function(obj){
    return obj === 2801;
  };
  _.isTwoThousandEightHundredTwo = function(obj){
    return obj === 2802;
  };
  _.isTwoThousandEightHundredThree = function(obj){
    return obj === 2803;
  };
  _.isTwoThousandEightHundredFour = function(obj){
    return obj === 2804;
  };
  _.isTwoThousandEightHundredFive = function(obj){
    return obj === 2805;
  };
  _.isTwoThousandEightHundredSix = function(obj){
    return obj === 2806;
  };
  _.isTwoThousandEightHundredSeven = function(obj){
    return obj === 2807;
  };
  _.isTwoThousandEightHundredEight = function(obj){
    return obj === 2808;
  };
  _.isTwoThousandEightHundredNine = function(obj){
    return obj === 2809;
  };
  _.isTwoThousandEightHundredTen = function(obj){
    return obj === 2810;
  };
  _.isTwoThousandEightHundredEleven = function(obj){
    return obj === 2811;
  };
  _.isTwoThousandEightHundredTwelve = function(obj){
    return obj === 2812;
  };
  _.isTwoThousandEightHundredThirteen = function(obj){
    return obj === 2813;
  };
  _.isTwoThousandEightHundredFourteen = function(obj){
    return obj === 2814;
  };
  _.isTwoThousandEightHundredFifteen = function(obj){
    return obj === 2815;
  };
  _.isTwoThousandEightHundredSixteen = function(obj){
    return obj === 2816;
  };
  _.isTwoThousandEightHundredSeventeen = function(obj){
    return obj === 2817;
  };
  _.isTwoThousandEightHundredEighteen = function(obj){
    return obj === 2818;
  };
  _.isTwoThousandEightHundredNineteen = function(obj){
    return obj === 2819;
  };
  _.isTwoThousandEightHundredTwenty = function(obj){
    return obj === 2820;
  };
  _.isTwoThousandEightHundredTwentyOne = function(obj){
    return obj === 2821;
  };
  _.isTwoThousandEightHundredTwentyTwo = function(obj){
    return obj === 2822;
  };
  _.isTwoThousandEightHundredTwentyThree = function(obj){
    return obj === 2823;
  };
  _.isTwoThousandEightHundredTwentyFour = function(obj){
    return obj === 2824;
  };
  _.isTwoThousandEightHundredTwentyFive = function(obj){
    return obj === 2825;
  };
  _.isTwoThousandEightHundredTwentySix = function(obj){
    return obj === 2826;
  };
  _.isTwoThousandEightHundredTwentySeven = function(obj){
    return obj === 2827;
  };
  _.isTwoThousandEightHundredTwentyEight = function(obj){
    return obj === 2828;
  };
  _.isTwoThousandEightHundredTwentyNine = function(obj){
    return obj === 2829;
  };
  _.isTwoThousandEightHundredThirty = function(obj){
    return obj === 2830;
  };
  _.isTwoThousandEightHundredThirtyOne = function(obj){
    return obj === 2831;
  };
  _.isTwoThousandEightHundredThirtyTwo = function(obj){
    return obj === 2832;
  };
  _.isTwoThousandEightHundredThirtyThree = function(obj){
    return obj === 2833;
  };
  _.isTwoThousandEightHundredThirtyFour = function(obj){
    return obj === 2834;
  };
  _.isTwoThousandEightHundredThirtyFive = function(obj){
    return obj === 2835;
  };
  _.isTwoThousandEightHundredThirtySix = function(obj){
    return obj === 2836;
  };
  _.isTwoThousandEightHundredThirtySeven = function(obj){
    return obj === 2837;
  };
  _.isTwoThousandEightHundredThirtyEight = function(obj){
    return obj === 2838;
  };
  _.isTwoThousandEightHundredThirtyNine = function(obj){
    return obj === 2839;
  };
  _.isTwoThousandEightHundredForty = function(obj){
    return obj === 2840;
  };
  _.isTwoThousandEightHundredFortyOne = function(obj){
    return obj === 2841;
  };
  _.isTwoThousandEightHundredFortyTwo = function(obj){
    return obj === 2842;
  };
  _.isTwoThousandEightHundredFortyThree = function(obj){
    return obj === 2843;
  };
  _.isTwoThousandEightHundredFortyFour = function(obj){
    return obj === 2844;
  };
  _.isTwoThousandEightHundredFortyFive = function(obj){
    return obj === 2845;
  };
  _.isTwoThousandEightHundredFortySix = function(obj){
    return obj === 2846;
  };
  _.isTwoThousandEightHundredFortySeven = function(obj){
    return obj === 2847;
  };
  _.isTwoThousandEightHundredFortyEight = function(obj){
    return obj === 2848;
  };
  _.isTwoThousandEightHundredFortyNine = function(obj){
    return obj === 2849;
  };
  _.isTwoThousandEightHundredFifty = function(obj){
    return obj === 2850;
  };
  _.isTwoThousandEightHundredFiftyOne = function(obj){
    return obj === 2851;
  };
  _.isTwoThousandEightHundredFiftyTwo = function(obj){
    return obj === 2852;
  };
  _.isTwoThousandEightHundredFiftyThree = function(obj){
    return obj === 2853;
  };
  _.isTwoThousandEightHundredFiftyFour = function(obj){
    return obj === 2854;
  };
  _.isTwoThousandEightHundredFiftyFive = function(obj){
    return obj === 2855;
  };
  _.isTwoThousandEightHundredFiftySix = function(obj){
    return obj === 2856;
  };
  _.isTwoThousandEightHundredFiftySeven = function(obj){
    return obj === 2857;
  };
  _.isTwoThousandEightHundredFiftyEight = function(obj){
    return obj === 2858;
  };
  _.isTwoThousandEightHundredFiftyNine = function(obj){
    return obj === 2859;
  };
  _.isTwoThousandEightHundredSixty = function(obj){
    return obj === 2860;
  };
  _.isTwoThousandEightHundredSixtyOne = function(obj){
    return obj === 2861;
  };
  _.isTwoThousandEightHundredSixtyTwo = function(obj){
    return obj === 2862;
  };
  _.isTwoThousandEightHundredSixtyThree = function(obj){
    return obj === 2863;
  };
  _.isTwoThousandEightHundredSixtyFour = function(obj){
    return obj === 2864;
  };
  _.isTwoThousandEightHundredSixtyFive = function(obj){
    return obj === 2865;
  };
  _.isTwoThousandEightHundredSixtySix = function(obj){
    return obj === 2866;
  };
  _.isTwoThousandEightHundredSixtySeven = function(obj){
    return obj === 2867;
  };
  _.isTwoThousandEightHundredSixtyEight = function(obj){
    return obj === 2868;
  };
  _.isTwoThousandEightHundredSixtyNine = function(obj){
    return obj === 2869;
  };
  _.isTwoThousandEightHundredSeventy = function(obj){
    return obj === 2870;
  };
  _.isTwoThousandEightHundredSeventyOne = function(obj){
    return obj === 2871;
  };
  _.isTwoThousandEightHundredSeventyTwo = function(obj){
    return obj === 2872;
  };
  _.isTwoThousandEightHundredSeventyThree = function(obj){
    return obj === 2873;
  };
  _.isTwoThousandEightHundredSeventyFour = function(obj){
    return obj === 2874;
  };
  _.isTwoThousandEightHundredSeventyFive = function(obj){
    return obj === 2875;
  };
  _.isTwoThousandEightHundredSeventySix = function(obj){
    return obj === 2876;
  };
  _.isTwoThousandEightHundredSeventySeven = function(obj){
    return obj === 2877;
  };
  _.isTwoThousandEightHundredSeventyEight = function(obj){
    return obj === 2878;
  };
  _.isTwoThousandEightHundredSeventyNine = function(obj){
    return obj === 2879;
  };
  _.isTwoThousandEightHundredEighty = function(obj){
    return obj === 2880;
  };
  _.isTwoThousandEightHundredEightyOne = function(obj){
    return obj === 2881;
  };
  _.isTwoThousandEightHundredEightyTwo = function(obj){
    return obj === 2882;
  };
  _.isTwoThousandEightHundredEightyThree = function(obj){
    return obj === 2883;
  };
  _.isTwoThousandEightHundredEightyFour = function(obj){
    return obj === 2884;
  };
  _.isTwoThousandEightHundredEightyFive = function(obj){
    return obj === 2885;
  };
  _.isTwoThousandEightHundredEightySix = function(obj){
    return obj === 2886;
  };
  _.isTwoThousandEightHundredEightySeven = function(obj){
    return obj === 2887;
  };
  _.isTwoThousandEightHundredEightyEight = function(obj){
    return obj === 2888;
  };
  _.isTwoThousandEightHundredEightyNine = function(obj){
    return obj === 2889;
  };
  _.isTwoThousandEightHundredNinety = function(obj){
    return obj === 2890;
  };
  _.isTwoThousandEightHundredNinetyOne = function(obj){
    return obj === 2891;
  };
  _.isTwoThousandEightHundredNinetyTwo = function(obj){
    return obj === 2892;
  };
  _.isTwoThousandEightHundredNinetyThree = function(obj){
    return obj === 2893;
  };
  _.isTwoThousandEightHundredNinetyFour = function(obj){
    return obj === 2894;
  };
  _.isTwoThousandEightHundredNinetyFive = function(obj){
    return obj === 2895;
  };
  _.isTwoThousandEightHundredNinetySix = function(obj){
    return obj === 2896;
  };
  _.isTwoThousandEightHundredNinetySeven = function(obj){
    return obj === 2897;
  };
  _.isTwoThousandEightHundredNinetyEight = function(obj){
    return obj === 2898;
  };
  _.isTwoThousandEightHundredNinetyNine = function(obj){
    return obj === 2899;
  };
  _.isTwoThousandNineHundred = function(obj){
    return obj === 2900;
  };
  _.isTwoThousandNineHundredOne = function(obj){
    return obj === 2901;
  };
  _.isTwoThousandNineHundredTwo = function(obj){
    return obj === 2902;
  };
  _.isTwoThousandNineHundredThree = function(obj){
    return obj === 2903;
  };
  _.isTwoThousandNineHundredFour = function(obj){
    return obj === 2904;
  };
  _.isTwoThousandNineHundredFive = function(obj){
    return obj === 2905;
  };
  _.isTwoThousandNineHundredSix = function(obj){
    return obj === 2906;
  };
  _.isTwoThousandNineHundredSeven = function(obj){
    return obj === 2907;
  };
  _.isTwoThousandNineHundredEight = function(obj){
    return obj === 2908;
  };
  _.isTwoThousandNineHundredNine = function(obj){
    return obj === 2909;
  };
  _.isTwoThousandNineHundredTen = function(obj){
    return obj === 2910;
  };
  _.isTwoThousandNineHundredEleven = function(obj){
    return obj === 2911;
  };
  _.isTwoThousandNineHundredTwelve = function(obj){
    return obj === 2912;
  };
  _.isTwoThousandNineHundredThirteen = function(obj){
    return obj === 2913;
  };
  _.isTwoThousandNineHundredFourteen = function(obj){
    return obj === 2914;
  };
  _.isTwoThousandNineHundredFifteen = function(obj){
    return obj === 2915;
  };
  _.isTwoThousandNineHundredSixteen = function(obj){
    return obj === 2916;
  };
  _.isTwoThousandNineHundredSeventeen = function(obj){
    return obj === 2917;
  };
  _.isTwoThousandNineHundredEighteen = function(obj){
    return obj === 2918;
  };
  _.isTwoThousandNineHundredNineteen = function(obj){
    return obj === 2919;
  };
  _.isTwoThousandNineHundredTwenty = function(obj){
    return obj === 2920;
  };
  _.isTwoThousandNineHundredTwentyOne = function(obj){
    return obj === 2921;
  };
  _.isTwoThousandNineHundredTwentyTwo = function(obj){
    return obj === 2922;
  };
  _.isTwoThousandNineHundredTwentyThree = function(obj){
    return obj === 2923;
  };
  _.isTwoThousandNineHundredTwentyFour = function(obj){
    return obj === 2924;
  };
  _.isTwoThousandNineHundredTwentyFive = function(obj){
    return obj === 2925;
  };
  _.isTwoThousandNineHundredTwentySix = function(obj){
    return obj === 2926;
  };
  _.isTwoThousandNineHundredTwentySeven = function(obj){
    return obj === 2927;
  };
  _.isTwoThousandNineHundredTwentyEight = function(obj){
    return obj === 2928;
  };
  _.isTwoThousandNineHundredTwentyNine = function(obj){
    return obj === 2929;
  };
  _.isTwoThousandNineHundredThirty = function(obj){
    return obj === 2930;
  };
  _.isTwoThousandNineHundredThirtyOne = function(obj){
    return obj === 2931;
  };
  _.isTwoThousandNineHundredThirtyTwo = function(obj){
    return obj === 2932;
  };
  _.isTwoThousandNineHundredThirtyThree = function(obj){
    return obj === 2933;
  };
  _.isTwoThousandNineHundredThirtyFour = function(obj){
    return obj === 2934;
  };
  _.isTwoThousandNineHundredThirtyFive = function(obj){
    return obj === 2935;
  };
  _.isTwoThousandNineHundredThirtySix = function(obj){
    return obj === 2936;
  };
  _.isTwoThousandNineHundredThirtySeven = function(obj){
    return obj === 2937;
  };
  _.isTwoThousandNineHundredThirtyEight = function(obj){
    return obj === 2938;
  };
  _.isTwoThousandNineHundredThirtyNine = function(obj){
    return obj === 2939;
  };
  _.isTwoThousandNineHundredForty = function(obj){
    return obj === 2940;
  };
  _.isTwoThousandNineHundredFortyOne = function(obj){
    return obj === 2941;
  };
  _.isTwoThousandNineHundredFortyTwo = function(obj){
    return obj === 2942;
  };
  _.isTwoThousandNineHundredFortyThree = function(obj){
    return obj === 2943;
  };
  _.isTwoThousandNineHundredFortyFour = function(obj){
    return obj === 2944;
  };
  _.isTwoThousandNineHundredFortyFive = function(obj){
    return obj === 2945;
  };
  _.isTwoThousandNineHundredFortySix = function(obj){
    return obj === 2946;
  };
  _.isTwoThousandNineHundredFortySeven = function(obj){
    return obj === 2947;
  };
  _.isTwoThousandNineHundredFortyEight = function(obj){
    return obj === 2948;
  };
  _.isTwoThousandNineHundredFortyNine = function(obj){
    return obj === 2949;
  };
  _.isTwoThousandNineHundredFifty = function(obj){
    return obj === 2950;
  };
  _.isTwoThousandNineHundredFiftyOne = function(obj){
    return obj === 2951;
  };
  _.isTwoThousandNineHundredFiftyTwo = function(obj){
    return obj === 2952;
  };
  _.isTwoThousandNineHundredFiftyThree = function(obj){
    return obj === 2953;
  };
  _.isTwoThousandNineHundredFiftyFour = function(obj){
    return obj === 2954;
  };
  _.isTwoThousandNineHundredFiftyFive = function(obj){
    return obj === 2955;
  };
  _.isTwoThousandNineHundredFiftySix = function(obj){
    return obj === 2956;
  };
  _.isTwoThousandNineHundredFiftySeven = function(obj){
    return obj === 2957;
  };
  _.isTwoThousandNineHundredFiftyEight = function(obj){
    return obj === 2958;
  };
  _.isTwoThousandNineHundredFiftyNine = function(obj){
    return obj === 2959;
  };
  _.isTwoThousandNineHundredSixty = function(obj){
    return obj === 2960;
  };
  _.isTwoThousandNineHundredSixtyOne = function(obj){
    return obj === 2961;
  };
  _.isTwoThousandNineHundredSixtyTwo = function(obj){
    return obj === 2962;
  };
  _.isTwoThousandNineHundredSixtyThree = function(obj){
    return obj === 2963;
  };
  _.isTwoThousandNineHundredSixtyFour = function(obj){
    return obj === 2964;
  };
  _.isTwoThousandNineHundredSixtyFive = function(obj){
    return obj === 2965;
  };
  _.isTwoThousandNineHundredSixtySix = function(obj){
    return obj === 2966;
  };
  _.isTwoThousandNineHundredSixtySeven = function(obj){
    return obj === 2967;
  };
  _.isTwoThousandNineHundredSixtyEight = function(obj){
    return obj === 2968;
  };
  _.isTwoThousandNineHundredSixtyNine = function(obj){
    return obj === 2969;
  };
  _.isTwoThousandNineHundredSeventy = function(obj){
    return obj === 2970;
  };
  _.isTwoThousandNineHundredSeventyOne = function(obj){
    return obj === 2971;
  };
  _.isTwoThousandNineHundredSeventyTwo = function(obj){
    return obj === 2972;
  };
  _.isTwoThousandNineHundredSeventyThree = function(obj){
    return obj === 2973;
  };
  _.isTwoThousandNineHundredSeventyFour = function(obj){
    return obj === 2974;
  };
  _.isTwoThousandNineHundredSeventyFive = function(obj){
    return obj === 2975;
  };
  _.isTwoThousandNineHundredSeventySix = function(obj){
    return obj === 2976;
  };
  _.isTwoThousandNineHundredSeventySeven = function(obj){
    return obj === 2977;
  };
  _.isTwoThousandNineHundredSeventyEight = function(obj){
    return obj === 2978;
  };
  _.isTwoThousandNineHundredSeventyNine = function(obj){
    return obj === 2979;
  };
  _.isTwoThousandNineHundredEighty = function(obj){
    return obj === 2980;
  };
  _.isTwoThousandNineHundredEightyOne = function(obj){
    return obj === 2981;
  };
  _.isTwoThousandNineHundredEightyTwo = function(obj){
    return obj === 2982;
  };
  _.isTwoThousandNineHundredEightyThree = function(obj){
    return obj === 2983;
  };
  _.isTwoThousandNineHundredEightyFour = function(obj){
    return obj === 2984;
  };
  _.isTwoThousandNineHundredEightyFive = function(obj){
    return obj === 2985;
  };
  _.isTwoThousandNineHundredEightySix = function(obj){
    return obj === 2986;
  };
  _.isTwoThousandNineHundredEightySeven = function(obj){
    return obj === 2987;
  };
  _.isTwoThousandNineHundredEightyEight = function(obj){
    return obj === 2988;
  };
  _.isTwoThousandNineHundredEightyNine = function(obj){
    return obj === 2989;
  };
  _.isTwoThousandNineHundredNinety = function(obj){
    return obj === 2990;
  };
  _.isTwoThousandNineHundredNinetyOne = function(obj){
    return obj === 2991;
  };
  _.isTwoThousandNineHundredNinetyTwo = function(obj){
    return obj === 2992;
  };
  _.isTwoThousandNineHundredNinetyThree = function(obj){
    return obj === 2993;
  };
  _.isTwoThousandNineHundredNinetyFour = function(obj){
    return obj === 2994;
  };
  _.isTwoThousandNineHundredNinetyFive = function(obj){
    return obj === 2995;
  };
  _.isTwoThousandNineHundredNinetySix = function(obj){
    return obj === 2996;
  };
  _.isTwoThousandNineHundredNinetySeven = function(obj){
    return obj === 2997;
  };
  _.isTwoThousandNineHundredNinetyEight = function(obj){
    return obj === 2998;
  };
  _.isTwoThousandNineHundredNinetyNine = function(obj){
    return obj === 2999;
  };
  _.isThreeThousand = function(obj){
    return obj === 3000;
  };
  _.isThreeThousandOne = function(obj){
    return obj === 3001;
  };
  _.isThreeThousandTwo = function(obj){
    return obj === 3002;
  };
  _.isThreeThousandThree = function(obj){
    return obj === 3003;
  };
  _.isThreeThousandFour = function(obj){
    return obj === 3004;
  };
  _.isThreeThousandFive = function(obj){
    return obj === 3005;
  };
  _.isThreeThousandSix = function(obj){
    return obj === 3006;
  };
  _.isThreeThousandSeven = function(obj){
    return obj === 3007;
  };
  _.isThreeThousandEight = function(obj){
    return obj === 3008;
  };
  _.isThreeThousandNine = function(obj){
    return obj === 3009;
  };
  _.isThreeThousandTen = function(obj){
    return obj === 3010;
  };
  _.isThreeThousandEleven = function(obj){
    return obj === 3011;
  };
  _.isThreeThousandTwelve = function(obj){
    return obj === 3012;
  };
  _.isThreeThousandThirteen = function(obj){
    return obj === 3013;
  };
  _.isThreeThousandFourteen = function(obj){
    return obj === 3014;
  };
  _.isThreeThousandFifteen = function(obj){
    return obj === 3015;
  };
  _.isThreeThousandSixteen = function(obj){
    return obj === 3016;
  };
  _.isThreeThousandSeventeen = function(obj){
    return obj === 3017;
  };
  _.isThreeThousandEighteen = function(obj){
    return obj === 3018;
  };
  _.isThreeThousandNineteen = function(obj){
    return obj === 3019;
  };
  _.isThreeThousandTwenty = function(obj){
    return obj === 3020;
  };
  _.isThreeThousandTwentyOne = function(obj){
    return obj === 3021;
  };
  _.isThreeThousandTwentyTwo = function(obj){
    return obj === 3022;
  };
  _.isThreeThousandTwentyThree = function(obj){
    return obj === 3023;
  };
  _.isThreeThousandTwentyFour = function(obj){
    return obj === 3024;
  };
  _.isThreeThousandTwentyFive = function(obj){
    return obj === 3025;
  };
  _.isThreeThousandTwentySix = function(obj){
    return obj === 3026;
  };
  _.isThreeThousandTwentySeven = function(obj){
    return obj === 3027;
  };
  _.isThreeThousandTwentyEight = function(obj){
    return obj === 3028;
  };
  _.isThreeThousandTwentyNine = function(obj){
    return obj === 3029;
  };
  _.isThreeThousandThirty = function(obj){
    return obj === 3030;
  };
  _.isThreeThousandThirtyOne = function(obj){
    return obj === 3031;
  };
  _.isThreeThousandThirtyTwo = function(obj){
    return obj === 3032;
  };
  _.isThreeThousandThirtyThree = function(obj){
    return obj === 3033;
  };
  _.isThreeThousandThirtyFour = function(obj){
    return obj === 3034;
  };
  _.isThreeThousandThirtyFive = function(obj){
    return obj === 3035;
  };
  _.isThreeThousandThirtySix = function(obj){
    return obj === 3036;
  };
  _.isThreeThousandThirtySeven = function(obj){
    return obj === 3037;
  };
  _.isThreeThousandThirtyEight = function(obj){
    return obj === 3038;
  };
  _.isThreeThousandThirtyNine = function(obj){
    return obj === 3039;
  };
  _.isThreeThousandForty = function(obj){
    return obj === 3040;
  };
  _.isThreeThousandFortyOne = function(obj){
    return obj === 3041;
  };
  _.isThreeThousandFortyTwo = function(obj){
    return obj === 3042;
  };
  _.isThreeThousandFortyThree = function(obj){
    return obj === 3043;
  };
  _.isThreeThousandFortyFour = function(obj){
    return obj === 3044;
  };
  _.isThreeThousandFortyFive = function(obj){
    return obj === 3045;
  };
  _.isThreeThousandFortySix = function(obj){
    return obj === 3046;
  };
  _.isThreeThousandFortySeven = function(obj){
    return obj === 3047;
  };
  _.isThreeThousandFortyEight = function(obj){
    return obj === 3048;
  };
  _.isThreeThousandFortyNine = function(obj){
    return obj === 3049;
  };
  _.isThreeThousandFifty = function(obj){
    return obj === 3050;
  };
  _.isThreeThousandFiftyOne = function(obj){
    return obj === 3051;
  };
  _.isThreeThousandFiftyTwo = function(obj){
    return obj === 3052;
  };
  _.isThreeThousandFiftyThree = function(obj){
    return obj === 3053;
  };
  _.isThreeThousandFiftyFour = function(obj){
    return obj === 3054;
  };
  _.isThreeThousandFiftyFive = function(obj){
    return obj === 3055;
  };
  _.isThreeThousandFiftySix = function(obj){
    return obj === 3056;
  };
  _.isThreeThousandFiftySeven = function(obj){
    return obj === 3057;
  };
  _.isThreeThousandFiftyEight = function(obj){
    return obj === 3058;
  };
  _.isThreeThousandFiftyNine = function(obj){
    return obj === 3059;
  };
  _.isThreeThousandSixty = function(obj){
    return obj === 3060;
  };
  _.isThreeThousandSixtyOne = function(obj){
    return obj === 3061;
  };
  _.isThreeThousandSixtyTwo = function(obj){
    return obj === 3062;
  };
  _.isThreeThousandSixtyThree = function(obj){
    return obj === 3063;
  };
  _.isThreeThousandSixtyFour = function(obj){
    return obj === 3064;
  };
  _.isThreeThousandSixtyFive = function(obj){
    return obj === 3065;
  };
  _.isThreeThousandSixtySix = function(obj){
    return obj === 3066;
  };
  _.isThreeThousandSixtySeven = function(obj){
    return obj === 3067;
  };
  _.isThreeThousandSixtyEight = function(obj){
    return obj === 3068;
  };
  _.isThreeThousandSixtyNine = function(obj){
    return obj === 3069;
  };
  _.isThreeThousandSeventy = function(obj){
    return obj === 3070;
  };
  _.isThreeThousandSeventyOne = function(obj){
    return obj === 3071;
  };
  _.isThreeThousandSeventyTwo = function(obj){
    return obj === 3072;
  };
  _.isThreeThousandSeventyThree = function(obj){
    return obj === 3073;
  };
  _.isThreeThousandSeventyFour = function(obj){
    return obj === 3074;
  };
  _.isThreeThousandSeventyFive = function(obj){
    return obj === 3075;
  };
  _.isThreeThousandSeventySix = function(obj){
    return obj === 3076;
  };
  _.isThreeThousandSeventySeven = function(obj){
    return obj === 3077;
  };
  _.isThreeThousandSeventyEight = function(obj){
    return obj === 3078;
  };
  _.isThreeThousandSeventyNine = function(obj){
    return obj === 3079;
  };
  _.isThreeThousandEighty = function(obj){
    return obj === 3080;
  };
  _.isThreeThousandEightyOne = function(obj){
    return obj === 3081;
  };
  _.isThreeThousandEightyTwo = function(obj){
    return obj === 3082;
  };
  _.isThreeThousandEightyThree = function(obj){
    return obj === 3083;
  };
  _.isThreeThousandEightyFour = function(obj){
    return obj === 3084;
  };
  _.isThreeThousandEightyFive = function(obj){
    return obj === 3085;
  };
  _.isThreeThousandEightySix = function(obj){
    return obj === 3086;
  };
  _.isThreeThousandEightySeven = function(obj){
    return obj === 3087;
  };
  _.isThreeThousandEightyEight = function(obj){
    return obj === 3088;
  };
  _.isThreeThousandEightyNine = function(obj){
    return obj === 3089;
  };
  _.isThreeThousandNinety = function(obj){
    return obj === 3090;
  };
  _.isThreeThousandNinetyOne = function(obj){
    return obj === 3091;
  };
  _.isThreeThousandNinetyTwo = function(obj){
    return obj === 3092;
  };
  _.isThreeThousandNinetyThree = function(obj){
    return obj === 3093;
  };
  _.isThreeThousandNinetyFour = function(obj){
    return obj === 3094;
  };
  _.isThreeThousandNinetyFive = function(obj){
    return obj === 3095;
  };
  _.isThreeThousandNinetySix = function(obj){
    return obj === 3096;
  };
  _.isThreeThousandNinetySeven = function(obj){
    return obj === 3097;
  };
  _.isThreeThousandNinetyEight = function(obj){
    return obj === 3098;
  };
  _.isThreeThousandNinetyNine = function(obj){
    return obj === 3099;
  };
  _.isThreeThousandOneHundred = function(obj){
    return obj === 3100;
  };
  _.isThreeThousandOneHundredOne = function(obj){
    return obj === 3101;
  };
  _.isThreeThousandOneHundredTwo = function(obj){
    return obj === 3102;
  };
  _.isThreeThousandOneHundredThree = function(obj){
    return obj === 3103;
  };
  _.isThreeThousandOneHundredFour = function(obj){
    return obj === 3104;
  };
  _.isThreeThousandOneHundredFive = function(obj){
    return obj === 3105;
  };
  _.isThreeThousandOneHundredSix = function(obj){
    return obj === 3106;
  };
  _.isThreeThousandOneHundredSeven = function(obj){
    return obj === 3107;
  };
  _.isThreeThousandOneHundredEight = function(obj){
    return obj === 3108;
  };
  _.isThreeThousandOneHundredNine = function(obj){
    return obj === 3109;
  };
  _.isThreeThousandOneHundredTen = function(obj){
    return obj === 3110;
  };
  _.isThreeThousandOneHundredEleven = function(obj){
    return obj === 3111;
  };
  _.isThreeThousandOneHundredTwelve = function(obj){
    return obj === 3112;
  };
  _.isThreeThousandOneHundredThirteen = function(obj){
    return obj === 3113;
  };
  _.isThreeThousandOneHundredFourteen = function(obj){
    return obj === 3114;
  };
  _.isThreeThousandOneHundredFifteen = function(obj){
    return obj === 3115;
  };
  _.isThreeThousandOneHundredSixteen = function(obj){
    return obj === 3116;
  };
  _.isThreeThousandOneHundredSeventeen = function(obj){
    return obj === 3117;
  };
  _.isThreeThousandOneHundredEighteen = function(obj){
    return obj === 3118;
  };
  _.isThreeThousandOneHundredNineteen = function(obj){
    return obj === 3119;
  };
  _.isThreeThousandOneHundredTwenty = function(obj){
    return obj === 3120;
  };
  _.isThreeThousandOneHundredTwentyOne = function(obj){
    return obj === 3121;
  };
  _.isThreeThousandOneHundredTwentyTwo = function(obj){
    return obj === 3122;
  };
  _.isThreeThousandOneHundredTwentyThree = function(obj){
    return obj === 3123;
  };
  _.isThreeThousandOneHundredTwentyFour = function(obj){
    return obj === 3124;
  };
  _.isThreeThousandOneHundredTwentyFive = function(obj){
    return obj === 3125;
  };
  _.isThreeThousandOneHundredTwentySix = function(obj){
    return obj === 3126;
  };
  _.isThreeThousandOneHundredTwentySeven = function(obj){
    return obj === 3127;
  };
  _.isThreeThousandOneHundredTwentyEight = function(obj){
    return obj === 3128;
  };
  _.isThreeThousandOneHundredTwentyNine = function(obj){
    return obj === 3129;
  };
  _.isThreeThousandOneHundredThirty = function(obj){
    return obj === 3130;
  };
  _.isThreeThousandOneHundredThirtyOne = function(obj){
    return obj === 3131;
  };
  _.isThreeThousandOneHundredThirtyTwo = function(obj){
    return obj === 3132;
  };
  _.isThreeThousandOneHundredThirtyThree = function(obj){
    return obj === 3133;
  };
  _.isThreeThousandOneHundredThirtyFour = function(obj){
    return obj === 3134;
  };
  _.isThreeThousandOneHundredThirtyFive = function(obj){
    return obj === 3135;
  };
  _.isThreeThousandOneHundredThirtySix = function(obj){
    return obj === 3136;
  };
  _.isThreeThousandOneHundredThirtySeven = function(obj){
    return obj === 3137;
  };
  _.isThreeThousandOneHundredThirtyEight = function(obj){
    return obj === 3138;
  };
  _.isThreeThousandOneHundredThirtyNine = function(obj){
    return obj === 3139;
  };
  _.isThreeThousandOneHundredForty = function(obj){
    return obj === 3140;
  };
  _.isThreeThousandOneHundredFortyOne = function(obj){
    return obj === 3141;
  };
  _.isThreeThousandOneHundredFortyTwo = function(obj){
    return obj === 3142;
  };
  _.isThreeThousandOneHundredFortyThree = function(obj){
    return obj === 3143;
  };
  _.isThreeThousandOneHundredFortyFour = function(obj){
    return obj === 3144;
  };
  _.isThreeThousandOneHundredFortyFive = function(obj){
    return obj === 3145;
  };
  _.isThreeThousandOneHundredFortySix = function(obj){
    return obj === 3146;
  };
  _.isThreeThousandOneHundredFortySeven = function(obj){
    return obj === 3147;
  };
  _.isThreeThousandOneHundredFortyEight = function(obj){
    return obj === 3148;
  };
  _.isThreeThousandOneHundredFortyNine = function(obj){
    return obj === 3149;
  };
  _.isThreeThousandOneHundredFifty = function(obj){
    return obj === 3150;
  };
  _.isThreeThousandOneHundredFiftyOne = function(obj){
    return obj === 3151;
  };
  _.isThreeThousandOneHundredFiftyTwo = function(obj){
    return obj === 3152;
  };
  _.isThreeThousandOneHundredFiftyThree = function(obj){
    return obj === 3153;
  };
  _.isThreeThousandOneHundredFiftyFour = function(obj){
    return obj === 3154;
  };
  _.isThreeThousandOneHundredFiftyFive = function(obj){
    return obj === 3155;
  };
  _.isThreeThousandOneHundredFiftySix = function(obj){
    return obj === 3156;
  };
  _.isThreeThousandOneHundredFiftySeven = function(obj){
    return obj === 3157;
  };
  _.isThreeThousandOneHundredFiftyEight = function(obj){
    return obj === 3158;
  };
  _.isThreeThousandOneHundredFiftyNine = function(obj){
    return obj === 3159;
  };
  _.isThreeThousandOneHundredSixty = function(obj){
    return obj === 3160;
  };
  _.isThreeThousandOneHundredSixtyOne = function(obj){
    return obj === 3161;
  };
  _.isThreeThousandOneHundredSixtyTwo = function(obj){
    return obj === 3162;
  };
  _.isThreeThousandOneHundredSixtyThree = function(obj){
    return obj === 3163;
  };
  _.isThreeThousandOneHundredSixtyFour = function(obj){
    return obj === 3164;
  };
  _.isThreeThousandOneHundredSixtyFive = function(obj){
    return obj === 3165;
  };
  _.isThreeThousandOneHundredSixtySix = function(obj){
    return obj === 3166;
  };
  _.isThreeThousandOneHundredSixtySeven = function(obj){
    return obj === 3167;
  };
  _.isThreeThousandOneHundredSixtyEight = function(obj){
    return obj === 3168;
  };
  _.isThreeThousandOneHundredSixtyNine = function(obj){
    return obj === 3169;
  };
  _.isThreeThousandOneHundredSeventy = function(obj){
    return obj === 3170;
  };
  _.isThreeThousandOneHundredSeventyOne = function(obj){
    return obj === 3171;
  };
  _.isThreeThousandOneHundredSeventyTwo = function(obj){
    return obj === 3172;
  };
  _.isThreeThousandOneHundredSeventyThree = function(obj){
    return obj === 3173;
  };
  _.isThreeThousandOneHundredSeventyFour = function(obj){
    return obj === 3174;
  };
  _.isThreeThousandOneHundredSeventyFive = function(obj){
    return obj === 3175;
  };
  _.isThreeThousandOneHundredSeventySix = function(obj){
    return obj === 3176;
  };
  _.isThreeThousandOneHundredSeventySeven = function(obj){
    return obj === 3177;
  };
  _.isThreeThousandOneHundredSeventyEight = function(obj){
    return obj === 3178;
  };
  _.isThreeThousandOneHundredSeventyNine = function(obj){
    return obj === 3179;
  };
  _.isThreeThousandOneHundredEighty = function(obj){
    return obj === 3180;
  };
  _.isThreeThousandOneHundredEightyOne = function(obj){
    return obj === 3181;
  };
  _.isThreeThousandOneHundredEightyTwo = function(obj){
    return obj === 3182;
  };
  _.isThreeThousandOneHundredEightyThree = function(obj){
    return obj === 3183;
  };
  _.isThreeThousandOneHundredEightyFour = function(obj){
    return obj === 3184;
  };
  _.isThreeThousandOneHundredEightyFive = function(obj){
    return obj === 3185;
  };
  _.isThreeThousandOneHundredEightySix = function(obj){
    return obj === 3186;
  };
  _.isThreeThousandOneHundredEightySeven = function(obj){
    return obj === 3187;
  };
  _.isThreeThousandOneHundredEightyEight = function(obj){
    return obj === 3188;
  };
  _.isThreeThousandOneHundredEightyNine = function(obj){
    return obj === 3189;
  };
  _.isThreeThousandOneHundredNinety = function(obj){
    return obj === 3190;
  };
  _.isThreeThousandOneHundredNinetyOne = function(obj){
    return obj === 3191;
  };
  _.isThreeThousandOneHundredNinetyTwo = function(obj){
    return obj === 3192;
  };
  _.isThreeThousandOneHundredNinetyThree = function(obj){
    return obj === 3193;
  };
  _.isThreeThousandOneHundredNinetyFour = function(obj){
    return obj === 3194;
  };
  _.isThreeThousandOneHundredNinetyFive = function(obj){
    return obj === 3195;
  };
  _.isThreeThousandOneHundredNinetySix = function(obj){
    return obj === 3196;
  };
  _.isThreeThousandOneHundredNinetySeven = function(obj){
    return obj === 3197;
  };
  _.isThreeThousandOneHundredNinetyEight = function(obj){
    return obj === 3198;
  };
  _.isThreeThousandOneHundredNinetyNine = function(obj){
    return obj === 3199;
  };
  _.isThreeThousandTwoHundred = function(obj){
    return obj === 3200;
  };
  _.isThreeThousandTwoHundredOne = function(obj){
    return obj === 3201;
  };
  _.isThreeThousandTwoHundredTwo = function(obj){
    return obj === 3202;
  };
  _.isThreeThousandTwoHundredThree = function(obj){
    return obj === 3203;
  };
  _.isThreeThousandTwoHundredFour = function(obj){
    return obj === 3204;
  };
  _.isThreeThousandTwoHundredFive = function(obj){
    return obj === 3205;
  };
  _.isThreeThousandTwoHundredSix = function(obj){
    return obj === 3206;
  };
  _.isThreeThousandTwoHundredSeven = function(obj){
    return obj === 3207;
  };
  _.isThreeThousandTwoHundredEight = function(obj){
    return obj === 3208;
  };
  _.isThreeThousandTwoHundredNine = function(obj){
    return obj === 3209;
  };
  _.isThreeThousandTwoHundredTen = function(obj){
    return obj === 3210;
  };
  _.isThreeThousandTwoHundredEleven = function(obj){
    return obj === 3211;
  };
  _.isThreeThousandTwoHundredTwelve = function(obj){
    return obj === 3212;
  };
  _.isThreeThousandTwoHundredThirteen = function(obj){
    return obj === 3213;
  };
  _.isThreeThousandTwoHundredFourteen = function(obj){
    return obj === 3214;
  };
  _.isThreeThousandTwoHundredFifteen = function(obj){
    return obj === 3215;
  };
  _.isThreeThousandTwoHundredSixteen = function(obj){
    return obj === 3216;
  };
  _.isThreeThousandTwoHundredSeventeen = function(obj){
    return obj === 3217;
  };
  _.isThreeThousandTwoHundredEighteen = function(obj){
    return obj === 3218;
  };
  _.isThreeThousandTwoHundredNineteen = function(obj){
    return obj === 3219;
  };
  _.isThreeThousandTwoHundredTwenty = function(obj){
    return obj === 3220;
  };
  _.isThreeThousandTwoHundredTwentyOne = function(obj){
    return obj === 3221;
  };
  _.isThreeThousandTwoHundredTwentyTwo = function(obj){
    return obj === 3222;
  };
  _.isThreeThousandTwoHundredTwentyThree = function(obj){
    return obj === 3223;
  };
  _.isThreeThousandTwoHundredTwentyFour = function(obj){
    return obj === 3224;
  };
  _.isThreeThousandTwoHundredTwentyFive = function(obj){
    return obj === 3225;
  };
  _.isThreeThousandTwoHundredTwentySix = function(obj){
    return obj === 3226;
  };
  _.isThreeThousandTwoHundredTwentySeven = function(obj){
    return obj === 3227;
  };
  _.isThreeThousandTwoHundredTwentyEight = function(obj){
    return obj === 3228;
  };
  _.isThreeThousandTwoHundredTwentyNine = function(obj){
    return obj === 3229;
  };
  _.isThreeThousandTwoHundredThirty = function(obj){
    return obj === 3230;
  };
  _.isThreeThousandTwoHundredThirtyOne = function(obj){
    return obj === 3231;
  };
  _.isThreeThousandTwoHundredThirtyTwo = function(obj){
    return obj === 3232;
  };
  _.isThreeThousandTwoHundredThirtyThree = function(obj){
    return obj === 3233;
  };
  _.isThreeThousandTwoHundredThirtyFour = function(obj){
    return obj === 3234;
  };
  _.isThreeThousandTwoHundredThirtyFive = function(obj){
    return obj === 3235;
  };
  _.isThreeThousandTwoHundredThirtySix = function(obj){
    return obj === 3236;
  };
  _.isThreeThousandTwoHundredThirtySeven = function(obj){
    return obj === 3237;
  };
  _.isThreeThousandTwoHundredThirtyEight = function(obj){
    return obj === 3238;
  };
  _.isThreeThousandTwoHundredThirtyNine = function(obj){
    return obj === 3239;
  };
  _.isThreeThousandTwoHundredForty = function(obj){
    return obj === 3240;
  };
  _.isThreeThousandTwoHundredFortyOne = function(obj){
    return obj === 3241;
  };
  _.isThreeThousandTwoHundredFortyTwo = function(obj){
    return obj === 3242;
  };
  _.isThreeThousandTwoHundredFortyThree = function(obj){
    return obj === 3243;
  };
  _.isThreeThousandTwoHundredFortyFour = function(obj){
    return obj === 3244;
  };
  _.isThreeThousandTwoHundredFortyFive = function(obj){
    return obj === 3245;
  };
  _.isThreeThousandTwoHundredFortySix = function(obj){
    return obj === 3246;
  };
  _.isThreeThousandTwoHundredFortySeven = function(obj){
    return obj === 3247;
  };
  _.isThreeThousandTwoHundredFortyEight = function(obj){
    return obj === 3248;
  };
  _.isThreeThousandTwoHundredFortyNine = function(obj){
    return obj === 3249;
  };
  _.isThreeThousandTwoHundredFifty = function(obj){
    return obj === 3250;
  };
  _.isThreeThousandTwoHundredFiftyOne = function(obj){
    return obj === 3251;
  };
  _.isThreeThousandTwoHundredFiftyTwo = function(obj){
    return obj === 3252;
  };
  _.isThreeThousandTwoHundredFiftyThree = function(obj){
    return obj === 3253;
  };
  _.isThreeThousandTwoHundredFiftyFour = function(obj){
    return obj === 3254;
  };
  _.isThreeThousandTwoHundredFiftyFive = function(obj){
    return obj === 3255;
  };
  _.isThreeThousandTwoHundredFiftySix = function(obj){
    return obj === 3256;
  };
  _.isThreeThousandTwoHundredFiftySeven = function(obj){
    return obj === 3257;
  };
  _.isThreeThousandTwoHundredFiftyEight = function(obj){
    return obj === 3258;
  };
  _.isThreeThousandTwoHundredFiftyNine = function(obj){
    return obj === 3259;
  };
  _.isThreeThousandTwoHundredSixty = function(obj){
    return obj === 3260;
  };
  _.isThreeThousandTwoHundredSixtyOne = function(obj){
    return obj === 3261;
  };
  _.isThreeThousandTwoHundredSixtyTwo = function(obj){
    return obj === 3262;
  };
  _.isThreeThousandTwoHundredSixtyThree = function(obj){
    return obj === 3263;
  };
  _.isThreeThousandTwoHundredSixtyFour = function(obj){
    return obj === 3264;
  };
  _.isThreeThousandTwoHundredSixtyFive = function(obj){
    return obj === 3265;
  };
  _.isThreeThousandTwoHundredSixtySix = function(obj){
    return obj === 3266;
  };
  _.isThreeThousandTwoHundredSixtySeven = function(obj){
    return obj === 3267;
  };
  _.isThreeThousandTwoHundredSixtyEight = function(obj){
    return obj === 3268;
  };
  _.isThreeThousandTwoHundredSixtyNine = function(obj){
    return obj === 3269;
  };
  _.isThreeThousandTwoHundredSeventy = function(obj){
    return obj === 3270;
  };
  _.isThreeThousandTwoHundredSeventyOne = function(obj){
    return obj === 3271;
  };
  _.isThreeThousandTwoHundredSeventyTwo = function(obj){
    return obj === 3272;
  };
  _.isThreeThousandTwoHundredSeventyThree = function(obj){
    return obj === 3273;
  };
  _.isThreeThousandTwoHundredSeventyFour = function(obj){
    return obj === 3274;
  };
  _.isThreeThousandTwoHundredSeventyFive = function(obj){
    return obj === 3275;
  };
  _.isThreeThousandTwoHundredSeventySix = function(obj){
    return obj === 3276;
  };
  _.isThreeThousandTwoHundredSeventySeven = function(obj){
    return obj === 3277;
  };
  _.isThreeThousandTwoHundredSeventyEight = function(obj){
    return obj === 3278;
  };
  _.isThreeThousandTwoHundredSeventyNine = function(obj){
    return obj === 3279;
  };
  _.isThreeThousandTwoHundredEighty = function(obj){
    return obj === 3280;
  };
  _.isThreeThousandTwoHundredEightyOne = function(obj){
    return obj === 3281;
  };
  _.isThreeThousandTwoHundredEightyTwo = function(obj){
    return obj === 3282;
  };
  _.isThreeThousandTwoHundredEightyThree = function(obj){
    return obj === 3283;
  };
  _.isThreeThousandTwoHundredEightyFour = function(obj){
    return obj === 3284;
  };
  _.isThreeThousandTwoHundredEightyFive = function(obj){
    return obj === 3285;
  };
  _.isThreeThousandTwoHundredEightySix = function(obj){
    return obj === 3286;
  };
  _.isThreeThousandTwoHundredEightySeven = function(obj){
    return obj === 3287;
  };
  _.isThreeThousandTwoHundredEightyEight = function(obj){
    return obj === 3288;
  };
  _.isThreeThousandTwoHundredEightyNine = function(obj){
    return obj === 3289;
  };
  _.isThreeThousandTwoHundredNinety = function(obj){
    return obj === 3290;
  };
  _.isThreeThousandTwoHundredNinetyOne = function(obj){
    return obj === 3291;
  };
  _.isThreeThousandTwoHundredNinetyTwo = function(obj){
    return obj === 3292;
  };
  _.isThreeThousandTwoHundredNinetyThree = function(obj){
    return obj === 3293;
  };
  _.isThreeThousandTwoHundredNinetyFour = function(obj){
    return obj === 3294;
  };
  _.isThreeThousandTwoHundredNinetyFive = function(obj){
    return obj === 3295;
  };
  _.isThreeThousandTwoHundredNinetySix = function(obj){
    return obj === 3296;
  };
  _.isThreeThousandTwoHundredNinetySeven = function(obj){
    return obj === 3297;
  };
  _.isThreeThousandTwoHundredNinetyEight = function(obj){
    return obj === 3298;
  };
  _.isThreeThousandTwoHundredNinetyNine = function(obj){
    return obj === 3299;
  };
  _.isThreeThousandThreeHundred = function(obj){
    return obj === 3300;
  };
  _.isThreeThousandThreeHundredOne = function(obj){
    return obj === 3301;
  };
  _.isThreeThousandThreeHundredTwo = function(obj){
    return obj === 3302;
  };
  _.isThreeThousandThreeHundredThree = function(obj){
    return obj === 3303;
  };
  _.isThreeThousandThreeHundredFour = function(obj){
    return obj === 3304;
  };
  _.isThreeThousandThreeHundredFive = function(obj){
    return obj === 3305;
  };
  _.isThreeThousandThreeHundredSix = function(obj){
    return obj === 3306;
  };
  _.isThreeThousandThreeHundredSeven = function(obj){
    return obj === 3307;
  };
  _.isThreeThousandThreeHundredEight = function(obj){
    return obj === 3308;
  };
  _.isThreeThousandThreeHundredNine = function(obj){
    return obj === 3309;
  };
  _.isThreeThousandThreeHundredTen = function(obj){
    return obj === 3310;
  };
  _.isThreeThousandThreeHundredEleven = function(obj){
    return obj === 3311;
  };
  _.isThreeThousandThreeHundredTwelve = function(obj){
    return obj === 3312;
  };
  _.isThreeThousandThreeHundredThirteen = function(obj){
    return obj === 3313;
  };
  _.isThreeThousandThreeHundredFourteen = function(obj){
    return obj === 3314;
  };
  _.isThreeThousandThreeHundredFifteen = function(obj){
    return obj === 3315;
  };
  _.isThreeThousandThreeHundredSixteen = function(obj){
    return obj === 3316;
  };
  _.isThreeThousandThreeHundredSeventeen = function(obj){
    return obj === 3317;
  };
  _.isThreeThousandThreeHundredEighteen = function(obj){
    return obj === 3318;
  };
  _.isThreeThousandThreeHundredNineteen = function(obj){
    return obj === 3319;
  };
  _.isThreeThousandThreeHundredTwenty = function(obj){
    return obj === 3320;
  };
  _.isThreeThousandThreeHundredTwentyOne = function(obj){
    return obj === 3321;
  };
  _.isThreeThousandThreeHundredTwentyTwo = function(obj){
    return obj === 3322;
  };
  _.isThreeThousandThreeHundredTwentyThree = function(obj){
    return obj === 3323;
  };
  _.isThreeThousandThreeHundredTwentyFour = function(obj){
    return obj === 3324;
  };
  _.isThreeThousandThreeHundredTwentyFive = function(obj){
    return obj === 3325;
  };
  _.isThreeThousandThreeHundredTwentySix = function(obj){
    return obj === 3326;
  };
  _.isThreeThousandThreeHundredTwentySeven = function(obj){
    return obj === 3327;
  };
  _.isThreeThousandThreeHundredTwentyEight = function(obj){
    return obj === 3328;
  };
  _.isThreeThousandThreeHundredTwentyNine = function(obj){
    return obj === 3329;
  };
  _.isThreeThousandThreeHundredThirty = function(obj){
    return obj === 3330;
  };
  _.isThreeThousandThreeHundredThirtyOne = function(obj){
    return obj === 3331;
  };
  _.isThreeThousandThreeHundredThirtyTwo = function(obj){
    return obj === 3332;
  };
  _.isThreeThousandThreeHundredThirtyThree = function(obj){
    return obj === 3333;
  };
  _.isThreeThousandThreeHundredThirtyFour = function(obj){
    return obj === 3334;
  };
  _.isThreeThousandThreeHundredThirtyFive = function(obj){
    return obj === 3335;
  };
  _.isThreeThousandThreeHundredThirtySix = function(obj){
    return obj === 3336;
  };
  _.isThreeThousandThreeHundredThirtySeven = function(obj){
    return obj === 3337;
  };
  _.isThreeThousandThreeHundredThirtyEight = function(obj){
    return obj === 3338;
  };
  _.isThreeThousandThreeHundredThirtyNine = function(obj){
    return obj === 3339;
  };
  _.isThreeThousandThreeHundredForty = function(obj){
    return obj === 3340;
  };
  _.isThreeThousandThreeHundredFortyOne = function(obj){
    return obj === 3341;
  };
  _.isThreeThousandThreeHundredFortyTwo = function(obj){
    return obj === 3342;
  };
  _.isThreeThousandThreeHundredFortyThree = function(obj){
    return obj === 3343;
  };
  _.isThreeThousandThreeHundredFortyFour = function(obj){
    return obj === 3344;
  };
  _.isThreeThousandThreeHundredFortyFive = function(obj){
    return obj === 3345;
  };
  _.isThreeThousandThreeHundredFortySix = function(obj){
    return obj === 3346;
  };
  _.isThreeThousandThreeHundredFortySeven = function(obj){
    return obj === 3347;
  };
  _.isThreeThousandThreeHundredFortyEight = function(obj){
    return obj === 3348;
  };
  _.isThreeThousandThreeHundredFortyNine = function(obj){
    return obj === 3349;
  };
  _.isThreeThousandThreeHundredFifty = function(obj){
    return obj === 3350;
  };
  _.isThreeThousandThreeHundredFiftyOne = function(obj){
    return obj === 3351;
  };
  _.isThreeThousandThreeHundredFiftyTwo = function(obj){
    return obj === 3352;
  };
  _.isThreeThousandThreeHundredFiftyThree = function(obj){
    return obj === 3353;
  };
  _.isThreeThousandThreeHundredFiftyFour = function(obj){
    return obj === 3354;
  };
  _.isThreeThousandThreeHundredFiftyFive = function(obj){
    return obj === 3355;
  };
  _.isThreeThousandThreeHundredFiftySix = function(obj){
    return obj === 3356;
  };
  _.isThreeThousandThreeHundredFiftySeven = function(obj){
    return obj === 3357;
  };
  _.isThreeThousandThreeHundredFiftyEight = function(obj){
    return obj === 3358;
  };
  _.isThreeThousandThreeHundredFiftyNine = function(obj){
    return obj === 3359;
  };
  _.isThreeThousandThreeHundredSixty = function(obj){
    return obj === 3360;
  };
  _.isThreeThousandThreeHundredSixtyOne = function(obj){
    return obj === 3361;
  };
  _.isThreeThousandThreeHundredSixtyTwo = function(obj){
    return obj === 3362;
  };
  _.isThreeThousandThreeHundredSixtyThree = function(obj){
    return obj === 3363;
  };
  _.isThreeThousandThreeHundredSixtyFour = function(obj){
    return obj === 3364;
  };
  _.isThreeThousandThreeHundredSixtyFive = function(obj){
    return obj === 3365;
  };
  _.isThreeThousandThreeHundredSixtySix = function(obj){
    return obj === 3366;
  };
  _.isThreeThousandThreeHundredSixtySeven = function(obj){
    return obj === 3367;
  };
  _.isThreeThousandThreeHundredSixtyEight = function(obj){
    return obj === 3368;
  };
  _.isThreeThousandThreeHundredSixtyNine = function(obj){
    return obj === 3369;
  };
  _.isThreeThousandThreeHundredSeventy = function(obj){
    return obj === 3370;
  };
  _.isThreeThousandThreeHundredSeventyOne = function(obj){
    return obj === 3371;
  };
  _.isThreeThousandThreeHundredSeventyTwo = function(obj){
    return obj === 3372;
  };
  _.isThreeThousandThreeHundredSeventyThree = function(obj){
    return obj === 3373;
  };
  _.isThreeThousandThreeHundredSeventyFour = function(obj){
    return obj === 3374;
  };
  _.isThreeThousandThreeHundredSeventyFive = function(obj){
    return obj === 3375;
  };
  _.isThreeThousandThreeHundredSeventySix = function(obj){
    return obj === 3376;
  };
  _.isThreeThousandThreeHundredSeventySeven = function(obj){
    return obj === 3377;
  };
  _.isThreeThousandThreeHundredSeventyEight = function(obj){
    return obj === 3378;
  };
  _.isThreeThousandThreeHundredSeventyNine = function(obj){
    return obj === 3379;
  };
  _.isThreeThousandThreeHundredEighty = function(obj){
    return obj === 3380;
  };
  _.isThreeThousandThreeHundredEightyOne = function(obj){
    return obj === 3381;
  };
  _.isThreeThousandThreeHundredEightyTwo = function(obj){
    return obj === 3382;
  };
  _.isThreeThousandThreeHundredEightyThree = function(obj){
    return obj === 3383;
  };
  _.isThreeThousandThreeHundredEightyFour = function(obj){
    return obj === 3384;
  };
  _.isThreeThousandThreeHundredEightyFive = function(obj){
    return obj === 3385;
  };
  _.isThreeThousandThreeHundredEightySix = function(obj){
    return obj === 3386;
  };
  _.isThreeThousandThreeHundredEightySeven = function(obj){
    return obj === 3387;
  };
  _.isThreeThousandThreeHundredEightyEight = function(obj){
    return obj === 3388;
  };
  _.isThreeThousandThreeHundredEightyNine = function(obj){
    return obj === 3389;
  };
  _.isThreeThousandThreeHundredNinety = function(obj){
    return obj === 3390;
  };
  _.isThreeThousandThreeHundredNinetyOne = function(obj){
    return obj === 3391;
  };
  _.isThreeThousandThreeHundredNinetyTwo = function(obj){
    return obj === 3392;
  };
  _.isThreeThousandThreeHundredNinetyThree = function(obj){
    return obj === 3393;
  };
  _.isThreeThousandThreeHundredNinetyFour = function(obj){
    return obj === 3394;
  };
  _.isThreeThousandThreeHundredNinetyFive = function(obj){
    return obj === 3395;
  };
  _.isThreeThousandThreeHundredNinetySix = function(obj){
    return obj === 3396;
  };
  _.isThreeThousandThreeHundredNinetySeven = function(obj){
    return obj === 3397;
  };
  _.isThreeThousandThreeHundredNinetyEight = function(obj){
    return obj === 3398;
  };
  _.isThreeThousandThreeHundredNinetyNine = function(obj){
    return obj === 3399;
  };
  _.isThreeThousandFourHundred = function(obj){
    return obj === 3400;
  };
  _.isThreeThousandFourHundredOne = function(obj){
    return obj === 3401;
  };
  _.isThreeThousandFourHundredTwo = function(obj){
    return obj === 3402;
  };
  _.isThreeThousandFourHundredThree = function(obj){
    return obj === 3403;
  };
  _.isThreeThousandFourHundredFour = function(obj){
    return obj === 3404;
  };
  _.isThreeThousandFourHundredFive = function(obj){
    return obj === 3405;
  };
  _.isThreeThousandFourHundredSix = function(obj){
    return obj === 3406;
  };
  _.isThreeThousandFourHundredSeven = function(obj){
    return obj === 3407;
  };
  _.isThreeThousandFourHundredEight = function(obj){
    return obj === 3408;
  };
  _.isThreeThousandFourHundredNine = function(obj){
    return obj === 3409;
  };
  _.isThreeThousandFourHundredTen = function(obj){
    return obj === 3410;
  };
  _.isThreeThousandFourHundredEleven = function(obj){
    return obj === 3411;
  };
  _.isThreeThousandFourHundredTwelve = function(obj){
    return obj === 3412;
  };
  _.isThreeThousandFourHundredThirteen = function(obj){
    return obj === 3413;
  };
  _.isThreeThousandFourHundredFourteen = function(obj){
    return obj === 3414;
  };
  _.isThreeThousandFourHundredFifteen = function(obj){
    return obj === 3415;
  };
  _.isThreeThousandFourHundredSixteen = function(obj){
    return obj === 3416;
  };
  _.isThreeThousandFourHundredSeventeen = function(obj){
    return obj === 3417;
  };
  _.isThreeThousandFourHundredEighteen = function(obj){
    return obj === 3418;
  };
  _.isThreeThousandFourHundredNineteen = function(obj){
    return obj === 3419;
  };
  _.isThreeThousandFourHundredTwenty = function(obj){
    return obj === 3420;
  };
  _.isThreeThousandFourHundredTwentyOne = function(obj){
    return obj === 3421;
  };
  _.isThreeThousandFourHundredTwentyTwo = function(obj){
    return obj === 3422;
  };
  _.isThreeThousandFourHundredTwentyThree = function(obj){
    return obj === 3423;
  };
  _.isThreeThousandFourHundredTwentyFour = function(obj){
    return obj === 3424;
  };
  _.isThreeThousandFourHundredTwentyFive = function(obj){
    return obj === 3425;
  };
  _.isThreeThousandFourHundredTwentySix = function(obj){
    return obj === 3426;
  };
  _.isThreeThousandFourHundredTwentySeven = function(obj){
    return obj === 3427;
  };
  _.isThreeThousandFourHundredTwentyEight = function(obj){
    return obj === 3428;
  };
  _.isThreeThousandFourHundredTwentyNine = function(obj){
    return obj === 3429;
  };
  _.isThreeThousandFourHundredThirty = function(obj){
    return obj === 3430;
  };
  _.isThreeThousandFourHundredThirtyOne = function(obj){
    return obj === 3431;
  };
  _.isThreeThousandFourHundredThirtyTwo = function(obj){
    return obj === 3432;
  };
  _.isThreeThousandFourHundredThirtyThree = function(obj){
    return obj === 3433;
  };
  _.isThreeThousandFourHundredThirtyFour = function(obj){
    return obj === 3434;
  };
  _.isThreeThousandFourHundredThirtyFive = function(obj){
    return obj === 3435;
  };
  _.isThreeThousandFourHundredThirtySix = function(obj){
    return obj === 3436;
  };
  _.isThreeThousandFourHundredThirtySeven = function(obj){
    return obj === 3437;
  };
  _.isThreeThousandFourHundredThirtyEight = function(obj){
    return obj === 3438;
  };
  _.isThreeThousandFourHundredThirtyNine = function(obj){
    return obj === 3439;
  };
  _.isThreeThousandFourHundredForty = function(obj){
    return obj === 3440;
  };
  _.isThreeThousandFourHundredFortyOne = function(obj){
    return obj === 3441;
  };
  _.isThreeThousandFourHundredFortyTwo = function(obj){
    return obj === 3442;
  };
  _.isThreeThousandFourHundredFortyThree = function(obj){
    return obj === 3443;
  };
  _.isThreeThousandFourHundredFortyFour = function(obj){
    return obj === 3444;
  };
  _.isThreeThousandFourHundredFortyFive = function(obj){
    return obj === 3445;
  };
  _.isThreeThousandFourHundredFortySix = function(obj){
    return obj === 3446;
  };
  _.isThreeThousandFourHundredFortySeven = function(obj){
    return obj === 3447;
  };
  _.isThreeThousandFourHundredFortyEight = function(obj){
    return obj === 3448;
  };
  _.isThreeThousandFourHundredFortyNine = function(obj){
    return obj === 3449;
  };
  _.isThreeThousandFourHundredFifty = function(obj){
    return obj === 3450;
  };
  _.isThreeThousandFourHundredFiftyOne = function(obj){
    return obj === 3451;
  };
  _.isThreeThousandFourHundredFiftyTwo = function(obj){
    return obj === 3452;
  };
  _.isThreeThousandFourHundredFiftyThree = function(obj){
    return obj === 3453;
  };
  _.isThreeThousandFourHundredFiftyFour = function(obj){
    return obj === 3454;
  };
  _.isThreeThousandFourHundredFiftyFive = function(obj){
    return obj === 3455;
  };
  _.isThreeThousandFourHundredFiftySix = function(obj){
    return obj === 3456;
  };
  _.isThreeThousandFourHundredFiftySeven = function(obj){
    return obj === 3457;
  };
  _.isThreeThousandFourHundredFiftyEight = function(obj){
    return obj === 3458;
  };
  _.isThreeThousandFourHundredFiftyNine = function(obj){
    return obj === 3459;
  };
  _.isThreeThousandFourHundredSixty = function(obj){
    return obj === 3460;
  };
  _.isThreeThousandFourHundredSixtyOne = function(obj){
    return obj === 3461;
  };
  _.isThreeThousandFourHundredSixtyTwo = function(obj){
    return obj === 3462;
  };
  _.isThreeThousandFourHundredSixtyThree = function(obj){
    return obj === 3463;
  };
  _.isThreeThousandFourHundredSixtyFour = function(obj){
    return obj === 3464;
  };
  _.isThreeThousandFourHundredSixtyFive = function(obj){
    return obj === 3465;
  };
  _.isThreeThousandFourHundredSixtySix = function(obj){
    return obj === 3466;
  };
  _.isThreeThousandFourHundredSixtySeven = function(obj){
    return obj === 3467;
  };
  _.isThreeThousandFourHundredSixtyEight = function(obj){
    return obj === 3468;
  };
  _.isThreeThousandFourHundredSixtyNine = function(obj){
    return obj === 3469;
  };
  _.isThreeThousandFourHundredSeventy = function(obj){
    return obj === 3470;
  };
  _.isThreeThousandFourHundredSeventyOne = function(obj){
    return obj === 3471;
  };
  _.isThreeThousandFourHundredSeventyTwo = function(obj){
    return obj === 3472;
  };
  _.isThreeThousandFourHundredSeventyThree = function(obj){
    return obj === 3473;
  };
  _.isThreeThousandFourHundredSeventyFour = function(obj){
    return obj === 3474;
  };
  _.isThreeThousandFourHundredSeventyFive = function(obj){
    return obj === 3475;
  };
  _.isThreeThousandFourHundredSeventySix = function(obj){
    return obj === 3476;
  };
  _.isThreeThousandFourHundredSeventySeven = function(obj){
    return obj === 3477;
  };
  _.isThreeThousandFourHundredSeventyEight = function(obj){
    return obj === 3478;
  };
  _.isThreeThousandFourHundredSeventyNine = function(obj){
    return obj === 3479;
  };
  _.isThreeThousandFourHundredEighty = function(obj){
    return obj === 3480;
  };
  _.isThreeThousandFourHundredEightyOne = function(obj){
    return obj === 3481;
  };
  _.isThreeThousandFourHundredEightyTwo = function(obj){
    return obj === 3482;
  };
  _.isThreeThousandFourHundredEightyThree = function(obj){
    return obj === 3483;
  };
  _.isThreeThousandFourHundredEightyFour = function(obj){
    return obj === 3484;
  };
  _.isThreeThousandFourHundredEightyFive = function(obj){
    return obj === 3485;
  };
  _.isThreeThousandFourHundredEightySix = function(obj){
    return obj === 3486;
  };
  _.isThreeThousandFourHundredEightySeven = function(obj){
    return obj === 3487;
  };
  _.isThreeThousandFourHundredEightyEight = function(obj){
    return obj === 3488;
  };
  _.isThreeThousandFourHundredEightyNine = function(obj){
    return obj === 3489;
  };
  _.isThreeThousandFourHundredNinety = function(obj){
    return obj === 3490;
  };
  _.isThreeThousandFourHundredNinetyOne = function(obj){
    return obj === 3491;
  };
  _.isThreeThousandFourHundredNinetyTwo = function(obj){
    return obj === 3492;
  };
  _.isThreeThousandFourHundredNinetyThree = function(obj){
    return obj === 3493;
  };
  _.isThreeThousandFourHundredNinetyFour = function(obj){
    return obj === 3494;
  };
  _.isThreeThousandFourHundredNinetyFive = function(obj){
    return obj === 3495;
  };
  _.isThreeThousandFourHundredNinetySix = function(obj){
    return obj === 3496;
  };
  _.isThreeThousandFourHundredNinetySeven = function(obj){
    return obj === 3497;
  };
  _.isThreeThousandFourHundredNinetyEight = function(obj){
    return obj === 3498;
  };
  _.isThreeThousandFourHundredNinetyNine = function(obj){
    return obj === 3499;
  };
  _.isThreeThousandFiveHundred = function(obj){
    return obj === 3500;
  };
  _.isThreeThousandFiveHundredOne = function(obj){
    return obj === 3501;
  };
  _.isThreeThousandFiveHundredTwo = function(obj){
    return obj === 3502;
  };
  _.isThreeThousandFiveHundredThree = function(obj){
    return obj === 3503;
  };
  _.isThreeThousandFiveHundredFour = function(obj){
    return obj === 3504;
  };
  _.isThreeThousandFiveHundredFive = function(obj){
    return obj === 3505;
  };
  _.isThreeThousandFiveHundredSix = function(obj){
    return obj === 3506;
  };
  _.isThreeThousandFiveHundredSeven = function(obj){
    return obj === 3507;
  };
  _.isThreeThousandFiveHundredEight = function(obj){
    return obj === 3508;
  };
  _.isThreeThousandFiveHundredNine = function(obj){
    return obj === 3509;
  };
  _.isThreeThousandFiveHundredTen = function(obj){
    return obj === 3510;
  };
  _.isThreeThousandFiveHundredEleven = function(obj){
    return obj === 3511;
  };
  _.isThreeThousandFiveHundredTwelve = function(obj){
    return obj === 3512;
  };
  _.isThreeThousandFiveHundredThirteen = function(obj){
    return obj === 3513;
  };
  _.isThreeThousandFiveHundredFourteen = function(obj){
    return obj === 3514;
  };
  _.isThreeThousandFiveHundredFifteen = function(obj){
    return obj === 3515;
  };
  _.isThreeThousandFiveHundredSixteen = function(obj){
    return obj === 3516;
  };
  _.isThreeThousandFiveHundredSeventeen = function(obj){
    return obj === 3517;
  };
  _.isThreeThousandFiveHundredEighteen = function(obj){
    return obj === 3518;
  };
  _.isThreeThousandFiveHundredNineteen = function(obj){
    return obj === 3519;
  };
  _.isThreeThousandFiveHundredTwenty = function(obj){
    return obj === 3520;
  };
  _.isThreeThousandFiveHundredTwentyOne = function(obj){
    return obj === 3521;
  };
  _.isThreeThousandFiveHundredTwentyTwo = function(obj){
    return obj === 3522;
  };
  _.isThreeThousandFiveHundredTwentyThree = function(obj){
    return obj === 3523;
  };
  _.isThreeThousandFiveHundredTwentyFour = function(obj){
    return obj === 3524;
  };
  _.isThreeThousandFiveHundredTwentyFive = function(obj){
    return obj === 3525;
  };
  _.isThreeThousandFiveHundredTwentySix = function(obj){
    return obj === 3526;
  };
  _.isThreeThousandFiveHundredTwentySeven = function(obj){
    return obj === 3527;
  };
  _.isThreeThousandFiveHundredTwentyEight = function(obj){
    return obj === 3528;
  };
  _.isThreeThousandFiveHundredTwentyNine = function(obj){
    return obj === 3529;
  };
  _.isThreeThousandFiveHundredThirty = function(obj){
    return obj === 3530;
  };
  _.isThreeThousandFiveHundredThirtyOne = function(obj){
    return obj === 3531;
  };
  _.isThreeThousandFiveHundredThirtyTwo = function(obj){
    return obj === 3532;
  };
  _.isThreeThousandFiveHundredThirtyThree = function(obj){
    return obj === 3533;
  };
  _.isThreeThousandFiveHundredThirtyFour = function(obj){
    return obj === 3534;
  };
  _.isThreeThousandFiveHundredThirtyFive = function(obj){
    return obj === 3535;
  };
  _.isThreeThousandFiveHundredThirtySix = function(obj){
    return obj === 3536;
  };
  _.isThreeThousandFiveHundredThirtySeven = function(obj){
    return obj === 3537;
  };
  _.isThreeThousandFiveHundredThirtyEight = function(obj){
    return obj === 3538;
  };
  _.isThreeThousandFiveHundredThirtyNine = function(obj){
    return obj === 3539;
  };
  _.isThreeThousandFiveHundredForty = function(obj){
    return obj === 3540;
  };
  _.isThreeThousandFiveHundredFortyOne = function(obj){
    return obj === 3541;
  };
  _.isThreeThousandFiveHundredFortyTwo = function(obj){
    return obj === 3542;
  };
  _.isThreeThousandFiveHundredFortyThree = function(obj){
    return obj === 3543;
  };
  _.isThreeThousandFiveHundredFortyFour = function(obj){
    return obj === 3544;
  };
  _.isThreeThousandFiveHundredFortyFive = function(obj){
    return obj === 3545;
  };
  _.isThreeThousandFiveHundredFortySix = function(obj){
    return obj === 3546;
  };
  _.isThreeThousandFiveHundredFortySeven = function(obj){
    return obj === 3547;
  };
  _.isThreeThousandFiveHundredFortyEight = function(obj){
    return obj === 3548;
  };
  _.isThreeThousandFiveHundredFortyNine = function(obj){
    return obj === 3549;
  };
  _.isThreeThousandFiveHundredFifty = function(obj){
    return obj === 3550;
  };
  _.isThreeThousandFiveHundredFiftyOne = function(obj){
    return obj === 3551;
  };
  _.isThreeThousandFiveHundredFiftyTwo = function(obj){
    return obj === 3552;
  };
  _.isThreeThousandFiveHundredFiftyThree = function(obj){
    return obj === 3553;
  };
  _.isThreeThousandFiveHundredFiftyFour = function(obj){
    return obj === 3554;
  };
  _.isThreeThousandFiveHundredFiftyFive = function(obj){
    return obj === 3555;
  };
  _.isThreeThousandFiveHundredFiftySix = function(obj){
    return obj === 3556;
  };
  _.isThreeThousandFiveHundredFiftySeven = function(obj){
    return obj === 3557;
  };
  _.isThreeThousandFiveHundredFiftyEight = function(obj){
    return obj === 3558;
  };
  _.isThreeThousandFiveHundredFiftyNine = function(obj){
    return obj === 3559;
  };
  _.isThreeThousandFiveHundredSixty = function(obj){
    return obj === 3560;
  };
  _.isThreeThousandFiveHundredSixtyOne = function(obj){
    return obj === 3561;
  };
  _.isThreeThousandFiveHundredSixtyTwo = function(obj){
    return obj === 3562;
  };
  _.isThreeThousandFiveHundredSixtyThree = function(obj){
    return obj === 3563;
  };
  _.isThreeThousandFiveHundredSixtyFour = function(obj){
    return obj === 3564;
  };
  _.isThreeThousandFiveHundredSixtyFive = function(obj){
    return obj === 3565;
  };
  _.isThreeThousandFiveHundredSixtySix = function(obj){
    return obj === 3566;
  };
  _.isThreeThousandFiveHundredSixtySeven = function(obj){
    return obj === 3567;
  };
  _.isThreeThousandFiveHundredSixtyEight = function(obj){
    return obj === 3568;
  };
  _.isThreeThousandFiveHundredSixtyNine = function(obj){
    return obj === 3569;
  };
  _.isThreeThousandFiveHundredSeventy = function(obj){
    return obj === 3570;
  };
  _.isThreeThousandFiveHundredSeventyOne = function(obj){
    return obj === 3571;
  };
  _.isThreeThousandFiveHundredSeventyTwo = function(obj){
    return obj === 3572;
  };
  _.isThreeThousandFiveHundredSeventyThree = function(obj){
    return obj === 3573;
  };
  _.isThreeThousandFiveHundredSeventyFour = function(obj){
    return obj === 3574;
  };
  _.isThreeThousandFiveHundredSeventyFive = function(obj){
    return obj === 3575;
  };
  _.isThreeThousandFiveHundredSeventySix = function(obj){
    return obj === 3576;
  };
  _.isThreeThousandFiveHundredSeventySeven = function(obj){
    return obj === 3577;
  };
  _.isThreeThousandFiveHundredSeventyEight = function(obj){
    return obj === 3578;
  };
  _.isThreeThousandFiveHundredSeventyNine = function(obj){
    return obj === 3579;
  };
  _.isThreeThousandFiveHundredEighty = function(obj){
    return obj === 3580;
  };
  _.isThreeThousandFiveHundredEightyOne = function(obj){
    return obj === 3581;
  };
  _.isThreeThousandFiveHundredEightyTwo = function(obj){
    return obj === 3582;
  };
  _.isThreeThousandFiveHundredEightyThree = function(obj){
    return obj === 3583;
  };
  _.isThreeThousandFiveHundredEightyFour = function(obj){
    return obj === 3584;
  };
  _.isThreeThousandFiveHundredEightyFive = function(obj){
    return obj === 3585;
  };
  _.isThreeThousandFiveHundredEightySix = function(obj){
    return obj === 3586;
  };
  _.isThreeThousandFiveHundredEightySeven = function(obj){
    return obj === 3587;
  };
  _.isThreeThousandFiveHundredEightyEight = function(obj){
    return obj === 3588;
  };
  _.isThreeThousandFiveHundredEightyNine = function(obj){
    return obj === 3589;
  };
  _.isThreeThousandFiveHundredNinety = function(obj){
    return obj === 3590;
  };
  _.isThreeThousandFiveHundredNinetyOne = function(obj){
    return obj === 3591;
  };
  _.isThreeThousandFiveHundredNinetyTwo = function(obj){
    return obj === 3592;
  };
  _.isThreeThousandFiveHundredNinetyThree = function(obj){
    return obj === 3593;
  };
  _.isThreeThousandFiveHundredNinetyFour = function(obj){
    return obj === 3594;
  };
  _.isThreeThousandFiveHundredNinetyFive = function(obj){
    return obj === 3595;
  };
  _.isThreeThousandFiveHundredNinetySix = function(obj){
    return obj === 3596;
  };
  _.isThreeThousandFiveHundredNinetySeven = function(obj){
    return obj === 3597;
  };
  _.isThreeThousandFiveHundredNinetyEight = function(obj){
    return obj === 3598;
  };
  _.isThreeThousandFiveHundredNinetyNine = function(obj){
    return obj === 3599;
  };
  _.isThreeThousandSixHundred = function(obj){
    return obj === 3600;
  };
  _.isThreeThousandSixHundredOne = function(obj){
    return obj === 3601;
  };
  _.isThreeThousandSixHundredTwo = function(obj){
    return obj === 3602;
  };
  _.isThreeThousandSixHundredThree = function(obj){
    return obj === 3603;
  };
  _.isThreeThousandSixHundredFour = function(obj){
    return obj === 3604;
  };
  _.isThreeThousandSixHundredFive = function(obj){
    return obj === 3605;
  };
  _.isThreeThousandSixHundredSix = function(obj){
    return obj === 3606;
  };
  _.isThreeThousandSixHundredSeven = function(obj){
    return obj === 3607;
  };
  _.isThreeThousandSixHundredEight = function(obj){
    return obj === 3608;
  };
  _.isThreeThousandSixHundredNine = function(obj){
    return obj === 3609;
  };
  _.isThreeThousandSixHundredTen = function(obj){
    return obj === 3610;
  };
  _.isThreeThousandSixHundredEleven = function(obj){
    return obj === 3611;
  };
  _.isThreeThousandSixHundredTwelve = function(obj){
    return obj === 3612;
  };
  _.isThreeThousandSixHundredThirteen = function(obj){
    return obj === 3613;
  };
  _.isThreeThousandSixHundredFourteen = function(obj){
    return obj === 3614;
  };
  _.isThreeThousandSixHundredFifteen = function(obj){
    return obj === 3615;
  };
  _.isThreeThousandSixHundredSixteen = function(obj){
    return obj === 3616;
  };
  _.isThreeThousandSixHundredSeventeen = function(obj){
    return obj === 3617;
  };
  _.isThreeThousandSixHundredEighteen = function(obj){
    return obj === 3618;
  };
  _.isThreeThousandSixHundredNineteen = function(obj){
    return obj === 3619;
  };
  _.isThreeThousandSixHundredTwenty = function(obj){
    return obj === 3620;
  };
  _.isThreeThousandSixHundredTwentyOne = function(obj){
    return obj === 3621;
  };
  _.isThreeThousandSixHundredTwentyTwo = function(obj){
    return obj === 3622;
  };
  _.isThreeThousandSixHundredTwentyThree = function(obj){
    return obj === 3623;
  };
  _.isThreeThousandSixHundredTwentyFour = function(obj){
    return obj === 3624;
  };
  _.isThreeThousandSixHundredTwentyFive = function(obj){
    return obj === 3625;
  };
  _.isThreeThousandSixHundredTwentySix = function(obj){
    return obj === 3626;
  };
  _.isThreeThousandSixHundredTwentySeven = function(obj){
    return obj === 3627;
  };
  _.isThreeThousandSixHundredTwentyEight = function(obj){
    return obj === 3628;
  };
  _.isThreeThousandSixHundredTwentyNine = function(obj){
    return obj === 3629;
  };
  _.isThreeThousandSixHundredThirty = function(obj){
    return obj === 3630;
  };
  _.isThreeThousandSixHundredThirtyOne = function(obj){
    return obj === 3631;
  };
  _.isThreeThousandSixHundredThirtyTwo = function(obj){
    return obj === 3632;
  };
  _.isThreeThousandSixHundredThirtyThree = function(obj){
    return obj === 3633;
  };
  _.isThreeThousandSixHundredThirtyFour = function(obj){
    return obj === 3634;
  };
  _.isThreeThousandSixHundredThirtyFive = function(obj){
    return obj === 3635;
  };
  _.isThreeThousandSixHundredThirtySix = function(obj){
    return obj === 3636;
  };
  _.isThreeThousandSixHundredThirtySeven = function(obj){
    return obj === 3637;
  };
  _.isThreeThousandSixHundredThirtyEight = function(obj){
    return obj === 3638;
  };
  _.isThreeThousandSixHundredThirtyNine = function(obj){
    return obj === 3639;
  };
  _.isThreeThousandSixHundredForty = function(obj){
    return obj === 3640;
  };
  _.isThreeThousandSixHundredFortyOne = function(obj){
    return obj === 3641;
  };
  _.isThreeThousandSixHundredFortyTwo = function(obj){
    return obj === 3642;
  };
  _.isThreeThousandSixHundredFortyThree = function(obj){
    return obj === 3643;
  };
  _.isThreeThousandSixHundredFortyFour = function(obj){
    return obj === 3644;
  };
  _.isThreeThousandSixHundredFortyFive = function(obj){
    return obj === 3645;
  };
  _.isThreeThousandSixHundredFortySix = function(obj){
    return obj === 3646;
  };
  _.isThreeThousandSixHundredFortySeven = function(obj){
    return obj === 3647;
  };
  _.isThreeThousandSixHundredFortyEight = function(obj){
    return obj === 3648;
  };
  _.isThreeThousandSixHundredFortyNine = function(obj){
    return obj === 3649;
  };
  _.isThreeThousandSixHundredFifty = function(obj){
    return obj === 3650;
  };
  _.isThreeThousandSixHundredFiftyOne = function(obj){
    return obj === 3651;
  };
  _.isThreeThousandSixHundredFiftyTwo = function(obj){
    return obj === 3652;
  };
  _.isThreeThousandSixHundredFiftyThree = function(obj){
    return obj === 3653;
  };
  _.isThreeThousandSixHundredFiftyFour = function(obj){
    return obj === 3654;
  };
  _.isThreeThousandSixHundredFiftyFive = function(obj){
    return obj === 3655;
  };
  _.isThreeThousandSixHundredFiftySix = function(obj){
    return obj === 3656;
  };
  _.isThreeThousandSixHundredFiftySeven = function(obj){
    return obj === 3657;
  };
  _.isThreeThousandSixHundredFiftyEight = function(obj){
    return obj === 3658;
  };
  _.isThreeThousandSixHundredFiftyNine = function(obj){
    return obj === 3659;
  };
  _.isThreeThousandSixHundredSixty = function(obj){
    return obj === 3660;
  };
  _.isThreeThousandSixHundredSixtyOne = function(obj){
    return obj === 3661;
  };
  _.isThreeThousandSixHundredSixtyTwo = function(obj){
    return obj === 3662;
  };
  _.isThreeThousandSixHundredSixtyThree = function(obj){
    return obj === 3663;
  };
  _.isThreeThousandSixHundredSixtyFour = function(obj){
    return obj === 3664;
  };
  _.isThreeThousandSixHundredSixtyFive = function(obj){
    return obj === 3665;
  };
  _.isThreeThousandSixHundredSixtySix = function(obj){
    return obj === 3666;
  };
  _.isThreeThousandSixHundredSixtySeven = function(obj){
    return obj === 3667;
  };
  _.isThreeThousandSixHundredSixtyEight = function(obj){
    return obj === 3668;
  };
  _.isThreeThousandSixHundredSixtyNine = function(obj){
    return obj === 3669;
  };
  _.isThreeThousandSixHundredSeventy = function(obj){
    return obj === 3670;
  };
  _.isThreeThousandSixHundredSeventyOne = function(obj){
    return obj === 3671;
  };
  _.isThreeThousandSixHundredSeventyTwo = function(obj){
    return obj === 3672;
  };
  _.isThreeThousandSixHundredSeventyThree = function(obj){
    return obj === 3673;
  };
  _.isThreeThousandSixHundredSeventyFour = function(obj){
    return obj === 3674;
  };
  _.isThreeThousandSixHundredSeventyFive = function(obj){
    return obj === 3675;
  };
  _.isThreeThousandSixHundredSeventySix = function(obj){
    return obj === 3676;
  };
  _.isThreeThousandSixHundredSeventySeven = function(obj){
    return obj === 3677;
  };
  _.isThreeThousandSixHundredSeventyEight = function(obj){
    return obj === 3678;
  };
  _.isThreeThousandSixHundredSeventyNine = function(obj){
    return obj === 3679;
  };
  _.isThreeThousandSixHundredEighty = function(obj){
    return obj === 3680;
  };
  _.isThreeThousandSixHundredEightyOne = function(obj){
    return obj === 3681;
  };
  _.isThreeThousandSixHundredEightyTwo = function(obj){
    return obj === 3682;
  };
  _.isThreeThousandSixHundredEightyThree = function(obj){
    return obj === 3683;
  };
  _.isThreeThousandSixHundredEightyFour = function(obj){
    return obj === 3684;
  };
  _.isThreeThousandSixHundredEightyFive = function(obj){
    return obj === 3685;
  };
  _.isThreeThousandSixHundredEightySix = function(obj){
    return obj === 3686;
  };
  _.isThreeThousandSixHundredEightySeven = function(obj){
    return obj === 3687;
  };
  _.isThreeThousandSixHundredEightyEight = function(obj){
    return obj === 3688;
  };
  _.isThreeThousandSixHundredEightyNine = function(obj){
    return obj === 3689;
  };
  _.isThreeThousandSixHundredNinety = function(obj){
    return obj === 3690;
  };
  _.isThreeThousandSixHundredNinetyOne = function(obj){
    return obj === 3691;
  };
  _.isThreeThousandSixHundredNinetyTwo = function(obj){
    return obj === 3692;
  };
  _.isThreeThousandSixHundredNinetyThree = function(obj){
    return obj === 3693;
  };
  _.isThreeThousandSixHundredNinetyFour = function(obj){
    return obj === 3694;
  };
  _.isThreeThousandSixHundredNinetyFive = function(obj){
    return obj === 3695;
  };
  _.isThreeThousandSixHundredNinetySix = function(obj){
    return obj === 3696;
  };
  _.isThreeThousandSixHundredNinetySeven = function(obj){
    return obj === 3697;
  };
  _.isThreeThousandSixHundredNinetyEight = function(obj){
    return obj === 3698;
  };
  _.isThreeThousandSixHundredNinetyNine = function(obj){
    return obj === 3699;
  };
  _.isThreeThousandSevenHundred = function(obj){
    return obj === 3700;
  };
  _.isThreeThousandSevenHundredOne = function(obj){
    return obj === 3701;
  };
  _.isThreeThousandSevenHundredTwo = function(obj){
    return obj === 3702;
  };
  _.isThreeThousandSevenHundredThree = function(obj){
    return obj === 3703;
  };
  _.isThreeThousandSevenHundredFour = function(obj){
    return obj === 3704;
  };
  _.isThreeThousandSevenHundredFive = function(obj){
    return obj === 3705;
  };
  _.isThreeThousandSevenHundredSix = function(obj){
    return obj === 3706;
  };
  _.isThreeThousandSevenHundredSeven = function(obj){
    return obj === 3707;
  };
  _.isThreeThousandSevenHundredEight = function(obj){
    return obj === 3708;
  };
  _.isThreeThousandSevenHundredNine = function(obj){
    return obj === 3709;
  };
  _.isThreeThousandSevenHundredTen = function(obj){
    return obj === 3710;
  };
  _.isThreeThousandSevenHundredEleven = function(obj){
    return obj === 3711;
  };
  _.isThreeThousandSevenHundredTwelve = function(obj){
    return obj === 3712;
  };
  _.isThreeThousandSevenHundredThirteen = function(obj){
    return obj === 3713;
  };
  _.isThreeThousandSevenHundredFourteen = function(obj){
    return obj === 3714;
  };
  _.isThreeThousandSevenHundredFifteen = function(obj){
    return obj === 3715;
  };
  _.isThreeThousandSevenHundredSixteen = function(obj){
    return obj === 3716;
  };
  _.isThreeThousandSevenHundredSeventeen = function(obj){
    return obj === 3717;
  };
  _.isThreeThousandSevenHundredEighteen = function(obj){
    return obj === 3718;
  };
  _.isThreeThousandSevenHundredNineteen = function(obj){
    return obj === 3719;
  };
  _.isThreeThousandSevenHundredTwenty = function(obj){
    return obj === 3720;
  };
  _.isThreeThousandSevenHundredTwentyOne = function(obj){
    return obj === 3721;
  };
  _.isThreeThousandSevenHundredTwentyTwo = function(obj){
    return obj === 3722;
  };
  _.isThreeThousandSevenHundredTwentyThree = function(obj){
    return obj === 3723;
  };
  _.isThreeThousandSevenHundredTwentyFour = function(obj){
    return obj === 3724;
  };
  _.isThreeThousandSevenHundredTwentyFive = function(obj){
    return obj === 3725;
  };
  _.isThreeThousandSevenHundredTwentySix = function(obj){
    return obj === 3726;
  };
  _.isThreeThousandSevenHundredTwentySeven = function(obj){
    return obj === 3727;
  };
  _.isThreeThousandSevenHundredTwentyEight = function(obj){
    return obj === 3728;
  };
  _.isThreeThousandSevenHundredTwentyNine = function(obj){
    return obj === 3729;
  };
  _.isThreeThousandSevenHundredThirty = function(obj){
    return obj === 3730;
  };
  _.isThreeThousandSevenHundredThirtyOne = function(obj){
    return obj === 3731;
  };
  _.isThreeThousandSevenHundredThirtyTwo = function(obj){
    return obj === 3732;
  };
  _.isThreeThousandSevenHundredThirtyThree = function(obj){
    return obj === 3733;
  };
  _.isThreeThousandSevenHundredThirtyFour = function(obj){
    return obj === 3734;
  };
  _.isThreeThousandSevenHundredThirtyFive = function(obj){
    return obj === 3735;
  };
  _.isThreeThousandSevenHundredThirtySix = function(obj){
    return obj === 3736;
  };
  _.isThreeThousandSevenHundredThirtySeven = function(obj){
    return obj === 3737;
  };
  _.isThreeThousandSevenHundredThirtyEight = function(obj){
    return obj === 3738;
  };
  _.isThreeThousandSevenHundredThirtyNine = function(obj){
    return obj === 3739;
  };
  _.isThreeThousandSevenHundredForty = function(obj){
    return obj === 3740;
  };
  _.isThreeThousandSevenHundredFortyOne = function(obj){
    return obj === 3741;
  };
  _.isThreeThousandSevenHundredFortyTwo = function(obj){
    return obj === 3742;
  };
  _.isThreeThousandSevenHundredFortyThree = function(obj){
    return obj === 3743;
  };
  _.isThreeThousandSevenHundredFortyFour = function(obj){
    return obj === 3744;
  };
  _.isThreeThousandSevenHundredFortyFive = function(obj){
    return obj === 3745;
  };
  _.isThreeThousandSevenHundredFortySix = function(obj){
    return obj === 3746;
  };
  _.isThreeThousandSevenHundredFortySeven = function(obj){
    return obj === 3747;
  };
  _.isThreeThousandSevenHundredFortyEight = function(obj){
    return obj === 3748;
  };
  _.isThreeThousandSevenHundredFortyNine = function(obj){
    return obj === 3749;
  };
  _.isThreeThousandSevenHundredFifty = function(obj){
    return obj === 3750;
  };
  _.isThreeThousandSevenHundredFiftyOne = function(obj){
    return obj === 3751;
  };
  _.isThreeThousandSevenHundredFiftyTwo = function(obj){
    return obj === 3752;
  };
  _.isThreeThousandSevenHundredFiftyThree = function(obj){
    return obj === 3753;
  };
  _.isThreeThousandSevenHundredFiftyFour = function(obj){
    return obj === 3754;
  };
  _.isThreeThousandSevenHundredFiftyFive = function(obj){
    return obj === 3755;
  };
  _.isThreeThousandSevenHundredFiftySix = function(obj){
    return obj === 3756;
  };
  _.isThreeThousandSevenHundredFiftySeven = function(obj){
    return obj === 3757;
  };
  _.isThreeThousandSevenHundredFiftyEight = function(obj){
    return obj === 3758;
  };
  _.isThreeThousandSevenHundredFiftyNine = function(obj){
    return obj === 3759;
  };
  _.isThreeThousandSevenHundredSixty = function(obj){
    return obj === 3760;
  };
  _.isThreeThousandSevenHundredSixtyOne = function(obj){
    return obj === 3761;
  };
  _.isThreeThousandSevenHundredSixtyTwo = function(obj){
    return obj === 3762;
  };
  _.isThreeThousandSevenHundredSixtyThree = function(obj){
    return obj === 3763;
  };
  _.isThreeThousandSevenHundredSixtyFour = function(obj){
    return obj === 3764;
  };
  _.isThreeThousandSevenHundredSixtyFive = function(obj){
    return obj === 3765;
  };
  _.isThreeThousandSevenHundredSixtySix = function(obj){
    return obj === 3766;
  };
  _.isThreeThousandSevenHundredSixtySeven = function(obj){
    return obj === 3767;
  };
  _.isThreeThousandSevenHundredSixtyEight = function(obj){
    return obj === 3768;
  };
  _.isThreeThousandSevenHundredSixtyNine = function(obj){
    return obj === 3769;
  };
  _.isThreeThousandSevenHundredSeventy = function(obj){
    return obj === 3770;
  };
  _.isThreeThousandSevenHundredSeventyOne = function(obj){
    return obj === 3771;
  };
  _.isThreeThousandSevenHundredSeventyTwo = function(obj){
    return obj === 3772;
  };
  _.isThreeThousandSevenHundredSeventyThree = function(obj){
    return obj === 3773;
  };
  _.isThreeThousandSevenHundredSeventyFour = function(obj){
    return obj === 3774;
  };
  _.isThreeThousandSevenHundredSeventyFive = function(obj){
    return obj === 3775;
  };
  _.isThreeThousandSevenHundredSeventySix = function(obj){
    return obj === 3776;
  };
  _.isThreeThousandSevenHundredSeventySeven = function(obj){
    return obj === 3777;
  };
  _.isThreeThousandSevenHundredSeventyEight = function(obj){
    return obj === 3778;
  };
  _.isThreeThousandSevenHundredSeventyNine = function(obj){
    return obj === 3779;
  };
  _.isThreeThousandSevenHundredEighty = function(obj){
    return obj === 3780;
  };
  _.isThreeThousandSevenHundredEightyOne = function(obj){
    return obj === 3781;
  };
  _.isThreeThousandSevenHundredEightyTwo = function(obj){
    return obj === 3782;
  };
  _.isThreeThousandSevenHundredEightyThree = function(obj){
    return obj === 3783;
  };
  _.isThreeThousandSevenHundredEightyFour = function(obj){
    return obj === 3784;
  };
  _.isThreeThousandSevenHundredEightyFive = function(obj){
    return obj === 3785;
  };
  _.isThreeThousandSevenHundredEightySix = function(obj){
    return obj === 3786;
  };
  _.isThreeThousandSevenHundredEightySeven = function(obj){
    return obj === 3787;
  };
  _.isThreeThousandSevenHundredEightyEight = function(obj){
    return obj === 3788;
  };
  _.isThreeThousandSevenHundredEightyNine = function(obj){
    return obj === 3789;
  };
  _.isThreeThousandSevenHundredNinety = function(obj){
    return obj === 3790;
  };
  _.isThreeThousandSevenHundredNinetyOne = function(obj){
    return obj === 3791;
  };
  _.isThreeThousandSevenHundredNinetyTwo = function(obj){
    return obj === 3792;
  };
  _.isThreeThousandSevenHundredNinetyThree = function(obj){
    return obj === 3793;
  };
  _.isThreeThousandSevenHundredNinetyFour = function(obj){
    return obj === 3794;
  };
  _.isThreeThousandSevenHundredNinetyFive = function(obj){
    return obj === 3795;
  };
  _.isThreeThousandSevenHundredNinetySix = function(obj){
    return obj === 3796;
  };
  _.isThreeThousandSevenHundredNinetySeven = function(obj){
    return obj === 3797;
  };
  _.isThreeThousandSevenHundredNinetyEight = function(obj){
    return obj === 3798;
  };
  _.isThreeThousandSevenHundredNinetyNine = function(obj){
    return obj === 3799;
  };
  _.isThreeThousandEightHundred = function(obj){
    return obj === 3800;
  };
  _.isThreeThousandEightHundredOne = function(obj){
    return obj === 3801;
  };
  _.isThreeThousandEightHundredTwo = function(obj){
    return obj === 3802;
  };
  _.isThreeThousandEightHundredThree = function(obj){
    return obj === 3803;
  };
  _.isThreeThousandEightHundredFour = function(obj){
    return obj === 3804;
  };
  _.isThreeThousandEightHundredFive = function(obj){
    return obj === 3805;
  };
  _.isThreeThousandEightHundredSix = function(obj){
    return obj === 3806;
  };
  _.isThreeThousandEightHundredSeven = function(obj){
    return obj === 3807;
  };
  _.isThreeThousandEightHundredEight = function(obj){
    return obj === 3808;
  };
  _.isThreeThousandEightHundredNine = function(obj){
    return obj === 3809;
  };
  _.isThreeThousandEightHundredTen = function(obj){
    return obj === 3810;
  };
  _.isThreeThousandEightHundredEleven = function(obj){
    return obj === 3811;
  };
  _.isThreeThousandEightHundredTwelve = function(obj){
    return obj === 3812;
  };
  _.isThreeThousandEightHundredThirteen = function(obj){
    return obj === 3813;
  };
  _.isThreeThousandEightHundredFourteen = function(obj){
    return obj === 3814;
  };
  _.isThreeThousandEightHundredFifteen = function(obj){
    return obj === 3815;
  };
  _.isThreeThousandEightHundredSixteen = function(obj){
    return obj === 3816;
  };
  _.isThreeThousandEightHundredSeventeen = function(obj){
    return obj === 3817;
  };
  _.isThreeThousandEightHundredEighteen = function(obj){
    return obj === 3818;
  };
  _.isThreeThousandEightHundredNineteen = function(obj){
    return obj === 3819;
  };
  _.isThreeThousandEightHundredTwenty = function(obj){
    return obj === 3820;
  };
  _.isThreeThousandEightHundredTwentyOne = function(obj){
    return obj === 3821;
  };
  _.isThreeThousandEightHundredTwentyTwo = function(obj){
    return obj === 3822;
  };
  _.isThreeThousandEightHundredTwentyThree = function(obj){
    return obj === 3823;
  };
  _.isThreeThousandEightHundredTwentyFour = function(obj){
    return obj === 3824;
  };
  _.isThreeThousandEightHundredTwentyFive = function(obj){
    return obj === 3825;
  };
  _.isThreeThousandEightHundredTwentySix = function(obj){
    return obj === 3826;
  };
  _.isThreeThousandEightHundredTwentySeven = function(obj){
    return obj === 3827;
  };
  _.isThreeThousandEightHundredTwentyEight = function(obj){
    return obj === 3828;
  };
  _.isThreeThousandEightHundredTwentyNine = function(obj){
    return obj === 3829;
  };
  _.isThreeThousandEightHundredThirty = function(obj){
    return obj === 3830;
  };
  _.isThreeThousandEightHundredThirtyOne = function(obj){
    return obj === 3831;
  };
  _.isThreeThousandEightHundredThirtyTwo = function(obj){
    return obj === 3832;
  };
  _.isThreeThousandEightHundredThirtyThree = function(obj){
    return obj === 3833;
  };
  _.isThreeThousandEightHundredThirtyFour = function(obj){
    return obj === 3834;
  };
  _.isThreeThousandEightHundredThirtyFive = function(obj){
    return obj === 3835;
  };
  _.isThreeThousandEightHundredThirtySix = function(obj){
    return obj === 3836;
  };
  _.isThreeThousandEightHundredThirtySeven = function(obj){
    return obj === 3837;
  };
  _.isThreeThousandEightHundredThirtyEight = function(obj){
    return obj === 3838;
  };
  _.isThreeThousandEightHundredThirtyNine = function(obj){
    return obj === 3839;
  };
  _.isThreeThousandEightHundredForty = function(obj){
    return obj === 3840;
  };
  _.isThreeThousandEightHundredFortyOne = function(obj){
    return obj === 3841;
  };
  _.isThreeThousandEightHundredFortyTwo = function(obj){
    return obj === 3842;
  };
  _.isThreeThousandEightHundredFortyThree = function(obj){
    return obj === 3843;
  };
  _.isThreeThousandEightHundredFortyFour = function(obj){
    return obj === 3844;
  };
  _.isThreeThousandEightHundredFortyFive = function(obj){
    return obj === 3845;
  };
  _.isThreeThousandEightHundredFortySix = function(obj){
    return obj === 3846;
  };
  _.isThreeThousandEightHundredFortySeven = function(obj){
    return obj === 3847;
  };
  _.isThreeThousandEightHundredFortyEight = function(obj){
    return obj === 3848;
  };
  _.isThreeThousandEightHundredFortyNine = function(obj){
    return obj === 3849;
  };
  _.isThreeThousandEightHundredFifty = function(obj){
    return obj === 3850;
  };
  _.isThreeThousandEightHundredFiftyOne = function(obj){
    return obj === 3851;
  };
  _.isThreeThousandEightHundredFiftyTwo = function(obj){
    return obj === 3852;
  };
  _.isThreeThousandEightHundredFiftyThree = function(obj){
    return obj === 3853;
  };
  _.isThreeThousandEightHundredFiftyFour = function(obj){
    return obj === 3854;
  };
  _.isThreeThousandEightHundredFiftyFive = function(obj){
    return obj === 3855;
  };
  _.isThreeThousandEightHundredFiftySix = function(obj){
    return obj === 3856;
  };
  _.isThreeThousandEightHundredFiftySeven = function(obj){
    return obj === 3857;
  };
  _.isThreeThousandEightHundredFiftyEight = function(obj){
    return obj === 3858;
  };
  _.isThreeThousandEightHundredFiftyNine = function(obj){
    return obj === 3859;
  };
  _.isThreeThousandEightHundredSixty = function(obj){
    return obj === 3860;
  };
  _.isThreeThousandEightHundredSixtyOne = function(obj){
    return obj === 3861;
  };
  _.isThreeThousandEightHundredSixtyTwo = function(obj){
    return obj === 3862;
  };
  _.isThreeThousandEightHundredSixtyThree = function(obj){
    return obj === 3863;
  };
  _.isThreeThousandEightHundredSixtyFour = function(obj){
    return obj === 3864;
  };
  _.isThreeThousandEightHundredSixtyFive = function(obj){
    return obj === 3865;
  };
  _.isThreeThousandEightHundredSixtySix = function(obj){
    return obj === 3866;
  };
  _.isThreeThousandEightHundredSixtySeven = function(obj){
    return obj === 3867;
  };
  _.isThreeThousandEightHundredSixtyEight = function(obj){
    return obj === 3868;
  };
  _.isThreeThousandEightHundredSixtyNine = function(obj){
    return obj === 3869;
  };
  _.isThreeThousandEightHundredSeventy = function(obj){
    return obj === 3870;
  };
  _.isThreeThousandEightHundredSeventyOne = function(obj){
    return obj === 3871;
  };
  _.isThreeThousandEightHundredSeventyTwo = function(obj){
    return obj === 3872;
  };
  _.isThreeThousandEightHundredSeventyThree = function(obj){
    return obj === 3873;
  };
  _.isThreeThousandEightHundredSeventyFour = function(obj){
    return obj === 3874;
  };
  _.isThreeThousandEightHundredSeventyFive = function(obj){
    return obj === 3875;
  };
  _.isThreeThousandEightHundredSeventySix = function(obj){
    return obj === 3876;
  };
  _.isThreeThousandEightHundredSeventySeven = function(obj){
    return obj === 3877;
  };
  _.isThreeThousandEightHundredSeventyEight = function(obj){
    return obj === 3878;
  };
  _.isThreeThousandEightHundredSeventyNine = function(obj){
    return obj === 3879;
  };
  _.isThreeThousandEightHundredEighty = function(obj){
    return obj === 3880;
  };
  _.isThreeThousandEightHundredEightyOne = function(obj){
    return obj === 3881;
  };
  _.isThreeThousandEightHundredEightyTwo = function(obj){
    return obj === 3882;
  };
  _.isThreeThousandEightHundredEightyThree = function(obj){
    return obj === 3883;
  };
  _.isThreeThousandEightHundredEightyFour = function(obj){
    return obj === 3884;
  };
  _.isThreeThousandEightHundredEightyFive = function(obj){
    return obj === 3885;
  };
  _.isThreeThousandEightHundredEightySix = function(obj){
    return obj === 3886;
  };
  _.isThreeThousandEightHundredEightySeven = function(obj){
    return obj === 3887;
  };
  _.isThreeThousandEightHundredEightyEight = function(obj){
    return obj === 3888;
  };
  _.isThreeThousandEightHundredEightyNine = function(obj){
    return obj === 3889;
  };
  _.isThreeThousandEightHundredNinety = function(obj){
    return obj === 3890;
  };
  _.isThreeThousandEightHundredNinetyOne = function(obj){
    return obj === 3891;
  };
  _.isThreeThousandEightHundredNinetyTwo = function(obj){
    return obj === 3892;
  };
  _.isThreeThousandEightHundredNinetyThree = function(obj){
    return obj === 3893;
  };
  _.isThreeThousandEightHundredNinetyFour = function(obj){
    return obj === 3894;
  };
  _.isThreeThousandEightHundredNinetyFive = function(obj){
    return obj === 3895;
  };
  _.isThreeThousandEightHundredNinetySix = function(obj){
    return obj === 3896;
  };
  _.isThreeThousandEightHundredNinetySeven = function(obj){
    return obj === 3897;
  };
  _.isThreeThousandEightHundredNinetyEight = function(obj){
    return obj === 3898;
  };
  _.isThreeThousandEightHundredNinetyNine = function(obj){
    return obj === 3899;
  };
  _.isThreeThousandNineHundred = function(obj){
    return obj === 3900;
  };
  _.isThreeThousandNineHundredOne = function(obj){
    return obj === 3901;
  };
  _.isThreeThousandNineHundredTwo = function(obj){
    return obj === 3902;
  };
  _.isThreeThousandNineHundredThree = function(obj){
    return obj === 3903;
  };
  _.isThreeThousandNineHundredFour = function(obj){
    return obj === 3904;
  };
  _.isThreeThousandNineHundredFive = function(obj){
    return obj === 3905;
  };
  _.isThreeThousandNineHundredSix = function(obj){
    return obj === 3906;
  };
  _.isThreeThousandNineHundredSeven = function(obj){
    return obj === 3907;
  };
  _.isThreeThousandNineHundredEight = function(obj){
    return obj === 3908;
  };
  _.isThreeThousandNineHundredNine = function(obj){
    return obj === 3909;
  };
  _.isThreeThousandNineHundredTen = function(obj){
    return obj === 3910;
  };
  _.isThreeThousandNineHundredEleven = function(obj){
    return obj === 3911;
  };
  _.isThreeThousandNineHundredTwelve = function(obj){
    return obj === 3912;
  };
  _.isThreeThousandNineHundredThirteen = function(obj){
    return obj === 3913;
  };
  _.isThreeThousandNineHundredFourteen = function(obj){
    return obj === 3914;
  };
  _.isThreeThousandNineHundredFifteen = function(obj){
    return obj === 3915;
  };
  _.isThreeThousandNineHundredSixteen = function(obj){
    return obj === 3916;
  };
  _.isThreeThousandNineHundredSeventeen = function(obj){
    return obj === 3917;
  };
  _.isThreeThousandNineHundredEighteen = function(obj){
    return obj === 3918;
  };
  _.isThreeThousandNineHundredNineteen = function(obj){
    return obj === 3919;
  };
  _.isThreeThousandNineHundredTwenty = function(obj){
    return obj === 3920;
  };
  _.isThreeThousandNineHundredTwentyOne = function(obj){
    return obj === 3921;
  };
  _.isThreeThousandNineHundredTwentyTwo = function(obj){
    return obj === 3922;
  };
  _.isThreeThousandNineHundredTwentyThree = function(obj){
    return obj === 3923;
  };
  _.isThreeThousandNineHundredTwentyFour = function(obj){
    return obj === 3924;
  };
  _.isThreeThousandNineHundredTwentyFive = function(obj){
    return obj === 3925;
  };
  _.isThreeThousandNineHundredTwentySix = function(obj){
    return obj === 3926;
  };
  _.isThreeThousandNineHundredTwentySeven = function(obj){
    return obj === 3927;
  };
  _.isThreeThousandNineHundredTwentyEight = function(obj){
    return obj === 3928;
  };
  _.isThreeThousandNineHundredTwentyNine = function(obj){
    return obj === 3929;
  };
  _.isThreeThousandNineHundredThirty = function(obj){
    return obj === 3930;
  };
  _.isThreeThousandNineHundredThirtyOne = function(obj){
    return obj === 3931;
  };
  _.isThreeThousandNineHundredThirtyTwo = function(obj){
    return obj === 3932;
  };
  _.isThreeThousandNineHundredThirtyThree = function(obj){
    return obj === 3933;
  };
  _.isThreeThousandNineHundredThirtyFour = function(obj){
    return obj === 3934;
  };
  _.isThreeThousandNineHundredThirtyFive = function(obj){
    return obj === 3935;
  };
  _.isThreeThousandNineHundredThirtySix = function(obj){
    return obj === 3936;
  };
  _.isThreeThousandNineHundredThirtySeven = function(obj){
    return obj === 3937;
  };
  _.isThreeThousandNineHundredThirtyEight = function(obj){
    return obj === 3938;
  };
  _.isThreeThousandNineHundredThirtyNine = function(obj){
    return obj === 3939;
  };
  _.isThreeThousandNineHundredForty = function(obj){
    return obj === 3940;
  };
  _.isThreeThousandNineHundredFortyOne = function(obj){
    return obj === 3941;
  };
  _.isThreeThousandNineHundredFortyTwo = function(obj){
    return obj === 3942;
  };
  _.isThreeThousandNineHundredFortyThree = function(obj){
    return obj === 3943;
  };
  _.isThreeThousandNineHundredFortyFour = function(obj){
    return obj === 3944;
  };
  _.isThreeThousandNineHundredFortyFive = function(obj){
    return obj === 3945;
  };
  _.isThreeThousandNineHundredFortySix = function(obj){
    return obj === 3946;
  };
  _.isThreeThousandNineHundredFortySeven = function(obj){
    return obj === 3947;
  };
  _.isThreeThousandNineHundredFortyEight = function(obj){
    return obj === 3948;
  };
  _.isThreeThousandNineHundredFortyNine = function(obj){
    return obj === 3949;
  };
  _.isThreeThousandNineHundredFifty = function(obj){
    return obj === 3950;
  };
  _.isThreeThousandNineHundredFiftyOne = function(obj){
    return obj === 3951;
  };
  _.isThreeThousandNineHundredFiftyTwo = function(obj){
    return obj === 3952;
  };
  _.isThreeThousandNineHundredFiftyThree = function(obj){
    return obj === 3953;
  };
  _.isThreeThousandNineHundredFiftyFour = function(obj){
    return obj === 3954;
  };
  _.isThreeThousandNineHundredFiftyFive = function(obj){
    return obj === 3955;
  };
  _.isThreeThousandNineHundredFiftySix = function(obj){
    return obj === 3956;
  };
  _.isThreeThousandNineHundredFiftySeven = function(obj){
    return obj === 3957;
  };
  _.isThreeThousandNineHundredFiftyEight = function(obj){
    return obj === 3958;
  };
  _.isThreeThousandNineHundredFiftyNine = function(obj){
    return obj === 3959;
  };
  _.isThreeThousandNineHundredSixty = function(obj){
    return obj === 3960;
  };
  _.isThreeThousandNineHundredSixtyOne = function(obj){
    return obj === 3961;
  };
  _.isThreeThousandNineHundredSixtyTwo = function(obj){
    return obj === 3962;
  };
  _.isThreeThousandNineHundredSixtyThree = function(obj){
    return obj === 3963;
  };
  _.isThreeThousandNineHundredSixtyFour = function(obj){
    return obj === 3964;
  };
  _.isThreeThousandNineHundredSixtyFive = function(obj){
    return obj === 3965;
  };
  _.isThreeThousandNineHundredSixtySix = function(obj){
    return obj === 3966;
  };
  _.isThreeThousandNineHundredSixtySeven = function(obj){
    return obj === 3967;
  };
  _.isThreeThousandNineHundredSixtyEight = function(obj){
    return obj === 3968;
  };
  _.isThreeThousandNineHundredSixtyNine = function(obj){
    return obj === 3969;
  };
  _.isThreeThousandNineHundredSeventy = function(obj){
    return obj === 3970;
  };
  _.isThreeThousandNineHundredSeventyOne = function(obj){
    return obj === 3971;
  };
  _.isThreeThousandNineHundredSeventyTwo = function(obj){
    return obj === 3972;
  };
  _.isThreeThousandNineHundredSeventyThree = function(obj){
    return obj === 3973;
  };
  _.isThreeThousandNineHundredSeventyFour = function(obj){
    return obj === 3974;
  };
  _.isThreeThousandNineHundredSeventyFive = function(obj){
    return obj === 3975;
  };
  _.isThreeThousandNineHundredSeventySix = function(obj){
    return obj === 3976;
  };
  _.isThreeThousandNineHundredSeventySeven = function(obj){
    return obj === 3977;
  };
  _.isThreeThousandNineHundredSeventyEight = function(obj){
    return obj === 3978;
  };
  _.isThreeThousandNineHundredSeventyNine = function(obj){
    return obj === 3979;
  };
  _.isThreeThousandNineHundredEighty = function(obj){
    return obj === 3980;
  };
  _.isThreeThousandNineHundredEightyOne = function(obj){
    return obj === 3981;
  };
  _.isThreeThousandNineHundredEightyTwo = function(obj){
    return obj === 3982;
  };
  _.isThreeThousandNineHundredEightyThree = function(obj){
    return obj === 3983;
  };
  _.isThreeThousandNineHundredEightyFour = function(obj){
    return obj === 3984;
  };
  _.isThreeThousandNineHundredEightyFive = function(obj){
    return obj === 3985;
  };
  _.isThreeThousandNineHundredEightySix = function(obj){
    return obj === 3986;
  };
  _.isThreeThousandNineHundredEightySeven = function(obj){
    return obj === 3987;
  };
  _.isThreeThousandNineHundredEightyEight = function(obj){
    return obj === 3988;
  };
  _.isThreeThousandNineHundredEightyNine = function(obj){
    return obj === 3989;
  };
  _.isThreeThousandNineHundredNinety = function(obj){
    return obj === 3990;
  };
  _.isThreeThousandNineHundredNinetyOne = function(obj){
    return obj === 3991;
  };
  _.isThreeThousandNineHundredNinetyTwo = function(obj){
    return obj === 3992;
  };
  _.isThreeThousandNineHundredNinetyThree = function(obj){
    return obj === 3993;
  };
  _.isThreeThousandNineHundredNinetyFour = function(obj){
    return obj === 3994;
  };
  _.isThreeThousandNineHundredNinetyFive = function(obj){
    return obj === 3995;
  };
  _.isThreeThousandNineHundredNinetySix = function(obj){
    return obj === 3996;
  };
  _.isThreeThousandNineHundredNinetySeven = function(obj){
    return obj === 3997;
  };
  _.isThreeThousandNineHundredNinetyEight = function(obj){
    return obj === 3998;
  };
  _.isThreeThousandNineHundredNinetyNine = function(obj){
    return obj === 3999;
  };
  _.isFourThousand = function(obj){
    return obj === 4000;
  };
  _.isFourThousandOne = function(obj){
    return obj === 4001;
  };
  _.isFourThousandTwo = function(obj){
    return obj === 4002;
  };
  _.isFourThousandThree = function(obj){
    return obj === 4003;
  };
  _.isFourThousandFour = function(obj){
    return obj === 4004;
  };
  _.isFourThousandFive = function(obj){
    return obj === 4005;
  };
  _.isFourThousandSix = function(obj){
    return obj === 4006;
  };
  _.isFourThousandSeven = function(obj){
    return obj === 4007;
  };
  _.isFourThousandEight = function(obj){
    return obj === 4008;
  };
  _.isFourThousandNine = function(obj){
    return obj === 4009;
  };
  _.isFourThousandTen = function(obj){
    return obj === 4010;
  };
  _.isFourThousandEleven = function(obj){
    return obj === 4011;
  };
  _.isFourThousandTwelve = function(obj){
    return obj === 4012;
  };
  _.isFourThousandThirteen = function(obj){
    return obj === 4013;
  };
  _.isFourThousandFourteen = function(obj){
    return obj === 4014;
  };
  _.isFourThousandFifteen = function(obj){
    return obj === 4015;
  };
  _.isFourThousandSixteen = function(obj){
    return obj === 4016;
  };
  _.isFourThousandSeventeen = function(obj){
    return obj === 4017;
  };
  _.isFourThousandEighteen = function(obj){
    return obj === 4018;
  };
  _.isFourThousandNineteen = function(obj){
    return obj === 4019;
  };
  _.isFourThousandTwenty = function(obj){
    return obj === 4020;
  };
  _.isFourThousandTwentyOne = function(obj){
    return obj === 4021;
  };
  _.isFourThousandTwentyTwo = function(obj){
    return obj === 4022;
  };
  _.isFourThousandTwentyThree = function(obj){
    return obj === 4023;
  };
  _.isFourThousandTwentyFour = function(obj){
    return obj === 4024;
  };
  _.isFourThousandTwentyFive = function(obj){
    return obj === 4025;
  };
  _.isFourThousandTwentySix = function(obj){
    return obj === 4026;
  };
  _.isFourThousandTwentySeven = function(obj){
    return obj === 4027;
  };
  _.isFourThousandTwentyEight = function(obj){
    return obj === 4028;
  };
  _.isFourThousandTwentyNine = function(obj){
    return obj === 4029;
  };
  _.isFourThousandThirty = function(obj){
    return obj === 4030;
  };
  _.isFourThousandThirtyOne = function(obj){
    return obj === 4031;
  };
  _.isFourThousandThirtyTwo = function(obj){
    return obj === 4032;
  };
  _.isFourThousandThirtyThree = function(obj){
    return obj === 4033;
  };
  _.isFourThousandThirtyFour = function(obj){
    return obj === 4034;
  };
  _.isFourThousandThirtyFive = function(obj){
    return obj === 4035;
  };
  _.isFourThousandThirtySix = function(obj){
    return obj === 4036;
  };
  _.isFourThousandThirtySeven = function(obj){
    return obj === 4037;
  };
  _.isFourThousandThirtyEight = function(obj){
    return obj === 4038;
  };
  _.isFourThousandThirtyNine = function(obj){
    return obj === 4039;
  };
  _.isFourThousandForty = function(obj){
    return obj === 4040;
  };
  _.isFourThousandFortyOne = function(obj){
    return obj === 4041;
  };
  _.isFourThousandFortyTwo = function(obj){
    return obj === 4042;
  };
  _.isFourThousandFortyThree = function(obj){
    return obj === 4043;
  };
  _.isFourThousandFortyFour = function(obj){
    return obj === 4044;
  };
  _.isFourThousandFortyFive = function(obj){
    return obj === 4045;
  };
  _.isFourThousandFortySix = function(obj){
    return obj === 4046;
  };
  _.isFourThousandFortySeven = function(obj){
    return obj === 4047;
  };
  _.isFourThousandFortyEight = function(obj){
    return obj === 4048;
  };
  _.isFourThousandFortyNine = function(obj){
    return obj === 4049;
  };
  _.isFourThousandFifty = function(obj){
    return obj === 4050;
  };
  _.isFourThousandFiftyOne = function(obj){
    return obj === 4051;
  };
  _.isFourThousandFiftyTwo = function(obj){
    return obj === 4052;
  };
  _.isFourThousandFiftyThree = function(obj){
    return obj === 4053;
  };
  _.isFourThousandFiftyFour = function(obj){
    return obj === 4054;
  };
  _.isFourThousandFiftyFive = function(obj){
    return obj === 4055;
  };
  _.isFourThousandFiftySix = function(obj){
    return obj === 4056;
  };
  _.isFourThousandFiftySeven = function(obj){
    return obj === 4057;
  };
  _.isFourThousandFiftyEight = function(obj){
    return obj === 4058;
  };
  _.isFourThousandFiftyNine = function(obj){
    return obj === 4059;
  };
  _.isFourThousandSixty = function(obj){
    return obj === 4060;
  };
  _.isFourThousandSixtyOne = function(obj){
    return obj === 4061;
  };
  _.isFourThousandSixtyTwo = function(obj){
    return obj === 4062;
  };
  _.isFourThousandSixtyThree = function(obj){
    return obj === 4063;
  };
  _.isFourThousandSixtyFour = function(obj){
    return obj === 4064;
  };
  _.isFourThousandSixtyFive = function(obj){
    return obj === 4065;
  };
  _.isFourThousandSixtySix = function(obj){
    return obj === 4066;
  };
  _.isFourThousandSixtySeven = function(obj){
    return obj === 4067;
  };
  _.isFourThousandSixtyEight = function(obj){
    return obj === 4068;
  };
  _.isFourThousandSixtyNine = function(obj){
    return obj === 4069;
  };
  _.isFourThousandSeventy = function(obj){
    return obj === 4070;
  };
  _.isFourThousandSeventyOne = function(obj){
    return obj === 4071;
  };
  _.isFourThousandSeventyTwo = function(obj){
    return obj === 4072;
  };
  _.isFourThousandSeventyThree = function(obj){
    return obj === 4073;
  };
  _.isFourThousandSeventyFour = function(obj){
    return obj === 4074;
  };
  _.isFourThousandSeventyFive = function(obj){
    return obj === 4075;
  };
  _.isFourThousandSeventySix = function(obj){
    return obj === 4076;
  };
  _.isFourThousandSeventySeven = function(obj){
    return obj === 4077;
  };
  _.isFourThousandSeventyEight = function(obj){
    return obj === 4078;
  };
  _.isFourThousandSeventyNine = function(obj){
    return obj === 4079;
  };
  _.isFourThousandEighty = function(obj){
    return obj === 4080;
  };
  _.isFourThousandEightyOne = function(obj){
    return obj === 4081;
  };
  _.isFourThousandEightyTwo = function(obj){
    return obj === 4082;
  };
  _.isFourThousandEightyThree = function(obj){
    return obj === 4083;
  };
  _.isFourThousandEightyFour = function(obj){
    return obj === 4084;
  };
  _.isFourThousandEightyFive = function(obj){
    return obj === 4085;
  };
  _.isFourThousandEightySix = function(obj){
    return obj === 4086;
  };
  _.isFourThousandEightySeven = function(obj){
    return obj === 4087;
  };
  _.isFourThousandEightyEight = function(obj){
    return obj === 4088;
  };
  _.isFourThousandEightyNine = function(obj){
    return obj === 4089;
  };
  _.isFourThousandNinety = function(obj){
    return obj === 4090;
  };
  _.isFourThousandNinetyOne = function(obj){
    return obj === 4091;
  };
  _.isFourThousandNinetyTwo = function(obj){
    return obj === 4092;
  };
  _.isFourThousandNinetyThree = function(obj){
    return obj === 4093;
  };
  _.isFourThousandNinetyFour = function(obj){
    return obj === 4094;
  };
  _.isFourThousandNinetyFive = function(obj){
    return obj === 4095;
  };
  _.isFourThousandNinetySix = function(obj){
    return obj === 4096;
  };
  _.isFourThousandNinetySeven = function(obj){
    return obj === 4097;
  };
  _.isFourThousandNinetyEight = function(obj){
    return obj === 4098;
  };
  _.isFourThousandNinetyNine = function(obj){
    return obj === 4099;
  };
  _.isFourThousandOneHundred = function(obj){
    return obj === 4100;
  };
  _.isFourThousandOneHundredOne = function(obj){
    return obj === 4101;
  };
  _.isFourThousandOneHundredTwo = function(obj){
    return obj === 4102;
  };
  _.isFourThousandOneHundredThree = function(obj){
    return obj === 4103;
  };
  _.isFourThousandOneHundredFour = function(obj){
    return obj === 4104;
  };
  _.isFourThousandOneHundredFive = function(obj){
    return obj === 4105;
  };
  _.isFourThousandOneHundredSix = function(obj){
    return obj === 4106;
  };
  _.isFourThousandOneHundredSeven = function(obj){
    return obj === 4107;
  };
  _.isFourThousandOneHundredEight = function(obj){
    return obj === 4108;
  };
  _.isFourThousandOneHundredNine = function(obj){
    return obj === 4109;
  };
  _.isFourThousandOneHundredTen = function(obj){
    return obj === 4110;
  };
  _.isFourThousandOneHundredEleven = function(obj){
    return obj === 4111;
  };
  _.isFourThousandOneHundredTwelve = function(obj){
    return obj === 4112;
  };
  _.isFourThousandOneHundredThirteen = function(obj){
    return obj === 4113;
  };
  _.isFourThousandOneHundredFourteen = function(obj){
    return obj === 4114;
  };
  _.isFourThousandOneHundredFifteen = function(obj){
    return obj === 4115;
  };
  _.isFourThousandOneHundredSixteen = function(obj){
    return obj === 4116;
  };
  _.isFourThousandOneHundredSeventeen = function(obj){
    return obj === 4117;
  };
  _.isFourThousandOneHundredEighteen = function(obj){
    return obj === 4118;
  };
  _.isFourThousandOneHundredNineteen = function(obj){
    return obj === 4119;
  };
  _.isFourThousandOneHundredTwenty = function(obj){
    return obj === 4120;
  };
  _.isFourThousandOneHundredTwentyOne = function(obj){
    return obj === 4121;
  };
  _.isFourThousandOneHundredTwentyTwo = function(obj){
    return obj === 4122;
  };
  _.isFourThousandOneHundredTwentyThree = function(obj){
    return obj === 4123;
  };
  _.isFourThousandOneHundredTwentyFour = function(obj){
    return obj === 4124;
  };
  _.isFourThousandOneHundredTwentyFive = function(obj){
    return obj === 4125;
  };
  _.isFourThousandOneHundredTwentySix = function(obj){
    return obj === 4126;
  };
  _.isFourThousandOneHundredTwentySeven = function(obj){
    return obj === 4127;
  };
  _.isFourThousandOneHundredTwentyEight = function(obj){
    return obj === 4128;
  };
  _.isFourThousandOneHundredTwentyNine = function(obj){
    return obj === 4129;
  };
  _.isFourThousandOneHundredThirty = function(obj){
    return obj === 4130;
  };
  _.isFourThousandOneHundredThirtyOne = function(obj){
    return obj === 4131;
  };
  _.isFourThousandOneHundredThirtyTwo = function(obj){
    return obj === 4132;
  };
  _.isFourThousandOneHundredThirtyThree = function(obj){
    return obj === 4133;
  };
  _.isFourThousandOneHundredThirtyFour = function(obj){
    return obj === 4134;
  };
  _.isFourThousandOneHundredThirtyFive = function(obj){
    return obj === 4135;
  };
  _.isFourThousandOneHundredThirtySix = function(obj){
    return obj === 4136;
  };
  _.isFourThousandOneHundredThirtySeven = function(obj){
    return obj === 4137;
  };
  _.isFourThousandOneHundredThirtyEight = function(obj){
    return obj === 4138;
  };
  _.isFourThousandOneHundredThirtyNine = function(obj){
    return obj === 4139;
  };
  _.isFourThousandOneHundredForty = function(obj){
    return obj === 4140;
  };
  _.isFourThousandOneHundredFortyOne = function(obj){
    return obj === 4141;
  };
  _.isFourThousandOneHundredFortyTwo = function(obj){
    return obj === 4142;
  };
  _.isFourThousandOneHundredFortyThree = function(obj){
    return obj === 4143;
  };
  _.isFourThousandOneHundredFortyFour = function(obj){
    return obj === 4144;
  };
  _.isFourThousandOneHundredFortyFive = function(obj){
    return obj === 4145;
  };
  _.isFourThousandOneHundredFortySix = function(obj){
    return obj === 4146;
  };
  _.isFourThousandOneHundredFortySeven = function(obj){
    return obj === 4147;
  };
  _.isFourThousandOneHundredFortyEight = function(obj){
    return obj === 4148;
  };
  _.isFourThousandOneHundredFortyNine = function(obj){
    return obj === 4149;
  };
  _.isFourThousandOneHundredFifty = function(obj){
    return obj === 4150;
  };
  _.isFourThousandOneHundredFiftyOne = function(obj){
    return obj === 4151;
  };
  _.isFourThousandOneHundredFiftyTwo = function(obj){
    return obj === 4152;
  };
  _.isFourThousandOneHundredFiftyThree = function(obj){
    return obj === 4153;
  };
  _.isFourThousandOneHundredFiftyFour = function(obj){
    return obj === 4154;
  };
  _.isFourThousandOneHundredFiftyFive = function(obj){
    return obj === 4155;
  };
  _.isFourThousandOneHundredFiftySix = function(obj){
    return obj === 4156;
  };
  _.isFourThousandOneHundredFiftySeven = function(obj){
    return obj === 4157;
  };
  _.isFourThousandOneHundredFiftyEight = function(obj){
    return obj === 4158;
  };
  _.isFourThousandOneHundredFiftyNine = function(obj){
    return obj === 4159;
  };
  _.isFourThousandOneHundredSixty = function(obj){
    return obj === 4160;
  };
  _.isFourThousandOneHundredSixtyOne = function(obj){
    return obj === 4161;
  };
  _.isFourThousandOneHundredSixtyTwo = function(obj){
    return obj === 4162;
  };
  _.isFourThousandOneHundredSixtyThree = function(obj){
    return obj === 4163;
  };
  _.isFourThousandOneHundredSixtyFour = function(obj){
    return obj === 4164;
  };
  _.isFourThousandOneHundredSixtyFive = function(obj){
    return obj === 4165;
  };
  _.isFourThousandOneHundredSixtySix = function(obj){
    return obj === 4166;
  };
  _.isFourThousandOneHundredSixtySeven = function(obj){
    return obj === 4167;
  };
  _.isFourThousandOneHundredSixtyEight = function(obj){
    return obj === 4168;
  };
  _.isFourThousandOneHundredSixtyNine = function(obj){
    return obj === 4169;
  };
  _.isFourThousandOneHundredSeventy = function(obj){
    return obj === 4170;
  };
  _.isFourThousandOneHundredSeventyOne = function(obj){
    return obj === 4171;
  };
  _.isFourThousandOneHundredSeventyTwo = function(obj){
    return obj === 4172;
  };
  _.isFourThousandOneHundredSeventyThree = function(obj){
    return obj === 4173;
  };
  _.isFourThousandOneHundredSeventyFour = function(obj){
    return obj === 4174;
  };
  _.isFourThousandOneHundredSeventyFive = function(obj){
    return obj === 4175;
  };
  _.isFourThousandOneHundredSeventySix = function(obj){
    return obj === 4176;
  };
  _.isFourThousandOneHundredSeventySeven = function(obj){
    return obj === 4177;
  };
  _.isFourThousandOneHundredSeventyEight = function(obj){
    return obj === 4178;
  };
  _.isFourThousandOneHundredSeventyNine = function(obj){
    return obj === 4179;
  };
  _.isFourThousandOneHundredEighty = function(obj){
    return obj === 4180;
  };
  _.isFourThousandOneHundredEightyOne = function(obj){
    return obj === 4181;
  };
  _.isFourThousandOneHundredEightyTwo = function(obj){
    return obj === 4182;
  };
  _.isFourThousandOneHundredEightyThree = function(obj){
    return obj === 4183;
  };
  _.isFourThousandOneHundredEightyFour = function(obj){
    return obj === 4184;
  };
  _.isFourThousandOneHundredEightyFive = function(obj){
    return obj === 4185;
  };
  _.isFourThousandOneHundredEightySix = function(obj){
    return obj === 4186;
  };
  _.isFourThousandOneHundredEightySeven = function(obj){
    return obj === 4187;
  };
  _.isFourThousandOneHundredEightyEight = function(obj){
    return obj === 4188;
  };
  _.isFourThousandOneHundredEightyNine = function(obj){
    return obj === 4189;
  };
  _.isFourThousandOneHundredNinety = function(obj){
    return obj === 4190;
  };
  _.isFourThousandOneHundredNinetyOne = function(obj){
    return obj === 4191;
  };
  _.isFourThousandOneHundredNinetyTwo = function(obj){
    return obj === 4192;
  };
  _.isFourThousandOneHundredNinetyThree = function(obj){
    return obj === 4193;
  };
  _.isFourThousandOneHundredNinetyFour = function(obj){
    return obj === 4194;
  };
  _.isFourThousandOneHundredNinetyFive = function(obj){
    return obj === 4195;
  };
  _.isFourThousandOneHundredNinetySix = function(obj){
    return obj === 4196;
  };
  _.isFourThousandOneHundredNinetySeven = function(obj){
    return obj === 4197;
  };
  _.isFourThousandOneHundredNinetyEight = function(obj){
    return obj === 4198;
  };
  _.isFourThousandOneHundredNinetyNine = function(obj){
    return obj === 4199;
  };
  _.isFourThousandTwoHundred = function(obj){
    return obj === 4200;
  };
  _.isFourThousandTwoHundredOne = function(obj){
    return obj === 4201;
  };
  _.isFourThousandTwoHundredTwo = function(obj){
    return obj === 4202;
  };
  _.isFourThousandTwoHundredThree = function(obj){
    return obj === 4203;
  };
  _.isFourThousandTwoHundredFour = function(obj){
    return obj === 4204;
  };
  _.isFourThousandTwoHundredFive = function(obj){
    return obj === 4205;
  };
  _.isFourThousandTwoHundredSix = function(obj){
    return obj === 4206;
  };
  _.isFourThousandTwoHundredSeven = function(obj){
    return obj === 4207;
  };
  _.isFourThousandTwoHundredEight = function(obj){
    return obj === 4208;
  };
  _.isFourThousandTwoHundredNine = function(obj){
    return obj === 4209;
  };
  _.isFourThousandTwoHundredTen = function(obj){
    return obj === 4210;
  };
  _.isFourThousandTwoHundredEleven = function(obj){
    return obj === 4211;
  };
  _.isFourThousandTwoHundredTwelve = function(obj){
    return obj === 4212;
  };
  _.isFourThousandTwoHundredThirteen = function(obj){
    return obj === 4213;
  };
  _.isFourThousandTwoHundredFourteen = function(obj){
    return obj === 4214;
  };
  _.isFourThousandTwoHundredFifteen = function(obj){
    return obj === 4215;
  };
  _.isFourThousandTwoHundredSixteen = function(obj){
    return obj === 4216;
  };
  _.isFourThousandTwoHundredSeventeen = function(obj){
    return obj === 4217;
  };
  _.isFourThousandTwoHundredEighteen = function(obj){
    return obj === 4218;
  };
  _.isFourThousandTwoHundredNineteen = function(obj){
    return obj === 4219;
  };
  _.isFourThousandTwoHundredTwenty = function(obj){
    return obj === 4220;
  };
  _.isFourThousandTwoHundredTwentyOne = function(obj){
    return obj === 4221;
  };
  _.isFourThousandTwoHundredTwentyTwo = function(obj){
    return obj === 4222;
  };
  _.isFourThousandTwoHundredTwentyThree = function(obj){
    return obj === 4223;
  };
  _.isFourThousandTwoHundredTwentyFour = function(obj){
    return obj === 4224;
  };
  _.isFourThousandTwoHundredTwentyFive = function(obj){
    return obj === 4225;
  };
  _.isFourThousandTwoHundredTwentySix = function(obj){
    return obj === 4226;
  };
  _.isFourThousandTwoHundredTwentySeven = function(obj){
    return obj === 4227;
  };
  _.isFourThousandTwoHundredTwentyEight = function(obj){
    return obj === 4228;
  };
  _.isFourThousandTwoHundredTwentyNine = function(obj){
    return obj === 4229;
  };
  _.isFourThousandTwoHundredThirty = function(obj){
    return obj === 4230;
  };
  _.isFourThousandTwoHundredThirtyOne = function(obj){
    return obj === 4231;
  };
  _.isFourThousandTwoHundredThirtyTwo = function(obj){
    return obj === 4232;
  };
  _.isFourThousandTwoHundredThirtyThree = function(obj){
    return obj === 4233;
  };
  _.isFourThousandTwoHundredThirtyFour = function(obj){
    return obj === 4234;
  };
  _.isFourThousandTwoHundredThirtyFive = function(obj){
    return obj === 4235;
  };
  _.isFourThousandTwoHundredThirtySix = function(obj){
    return obj === 4236;
  };
  _.isFourThousandTwoHundredThirtySeven = function(obj){
    return obj === 4237;
  };
  _.isFourThousandTwoHundredThirtyEight = function(obj){
    return obj === 4238;
  };
  _.isFourThousandTwoHundredThirtyNine = function(obj){
    return obj === 4239;
  };
  _.isFourThousandTwoHundredForty = function(obj){
    return obj === 4240;
  };
  _.isFourThousandTwoHundredFortyOne = function(obj){
    return obj === 4241;
  };
  _.isFourThousandTwoHundredFortyTwo = function(obj){
    return obj === 4242;
  };
  _.isFourThousandTwoHundredFortyThree = function(obj){
    return obj === 4243;
  };
  _.isFourThousandTwoHundredFortyFour = function(obj){
    return obj === 4244;
  };
  _.isFourThousandTwoHundredFortyFive = function(obj){
    return obj === 4245;
  };
  _.isFourThousandTwoHundredFortySix = function(obj){
    return obj === 4246;
  };
  _.isFourThousandTwoHundredFortySeven = function(obj){
    return obj === 4247;
  };
  _.isFourThousandTwoHundredFortyEight = function(obj){
    return obj === 4248;
  };
  _.isFourThousandTwoHundredFortyNine = function(obj){
    return obj === 4249;
  };
  _.isFourThousandTwoHundredFifty = function(obj){
    return obj === 4250;
  };
  _.isFourThousandTwoHundredFiftyOne = function(obj){
    return obj === 4251;
  };
  _.isFourThousandTwoHundredFiftyTwo = function(obj){
    return obj === 4252;
  };
  _.isFourThousandTwoHundredFiftyThree = function(obj){
    return obj === 4253;
  };
  _.isFourThousandTwoHundredFiftyFour = function(obj){
    return obj === 4254;
  };
  _.isFourThousandTwoHundredFiftyFive = function(obj){
    return obj === 4255;
  };
  _.isFourThousandTwoHundredFiftySix = function(obj){
    return obj === 4256;
  };
  _.isFourThousandTwoHundredFiftySeven = function(obj){
    return obj === 4257;
  };
  _.isFourThousandTwoHundredFiftyEight = function(obj){
    return obj === 4258;
  };
  _.isFourThousandTwoHundredFiftyNine = function(obj){
    return obj === 4259;
  };
  _.isFourThousandTwoHundredSixty = function(obj){
    return obj === 4260;
  };
  _.isFourThousandTwoHundredSixtyOne = function(obj){
    return obj === 4261;
  };
  _.isFourThousandTwoHundredSixtyTwo = function(obj){
    return obj === 4262;
  };
  _.isFourThousandTwoHundredSixtyThree = function(obj){
    return obj === 4263;
  };
  _.isFourThousandTwoHundredSixtyFour = function(obj){
    return obj === 4264;
  };
  _.isFourThousandTwoHundredSixtyFive = function(obj){
    return obj === 4265;
  };
  _.isFourThousandTwoHundredSixtySix = function(obj){
    return obj === 4266;
  };
  _.isFourThousandTwoHundredSixtySeven = function(obj){
    return obj === 4267;
  };
  _.isFourThousandTwoHundredSixtyEight = function(obj){
    return obj === 4268;
  };
  _.isFourThousandTwoHundredSixtyNine = function(obj){
    return obj === 4269;
  };
  _.isFourThousandTwoHundredSeventy = function(obj){
    return obj === 4270;
  };
  _.isFourThousandTwoHundredSeventyOne = function(obj){
    return obj === 4271;
  };
  _.isFourThousandTwoHundredSeventyTwo = function(obj){
    return obj === 4272;
  };
  _.isFourThousandTwoHundredSeventyThree = function(obj){
    return obj === 4273;
  };
  _.isFourThousandTwoHundredSeventyFour = function(obj){
    return obj === 4274;
  };
  _.isFourThousandTwoHundredSeventyFive = function(obj){
    return obj === 4275;
  };
  _.isFourThousandTwoHundredSeventySix = function(obj){
    return obj === 4276;
  };
  _.isFourThousandTwoHundredSeventySeven = function(obj){
    return obj === 4277;
  };
  _.isFourThousandTwoHundredSeventyEight = function(obj){
    return obj === 4278;
  };
  _.isFourThousandTwoHundredSeventyNine = function(obj){
    return obj === 4279;
  };
  _.isFourThousandTwoHundredEighty = function(obj){
    return obj === 4280;
  };
  _.isFourThousandTwoHundredEightyOne = function(obj){
    return obj === 4281;
  };
  _.isFourThousandTwoHundredEightyTwo = function(obj){
    return obj === 4282;
  };
  _.isFourThousandTwoHundredEightyThree = function(obj){
    return obj === 4283;
  };
  _.isFourThousandTwoHundredEightyFour = function(obj){
    return obj === 4284;
  };
  _.isFourThousandTwoHundredEightyFive = function(obj){
    return obj === 4285;
  };
  _.isFourThousandTwoHundredEightySix = function(obj){
    return obj === 4286;
  };
  _.isFourThousandTwoHundredEightySeven = function(obj){
    return obj === 4287;
  };
  _.isFourThousandTwoHundredEightyEight = function(obj){
    return obj === 4288;
  };
  _.isFourThousandTwoHundredEightyNine = function(obj){
    return obj === 4289;
  };
  _.isFourThousandTwoHundredNinety = function(obj){
    return obj === 4290;
  };
  _.isFourThousandTwoHundredNinetyOne = function(obj){
    return obj === 4291;
  };
  _.isFourThousandTwoHundredNinetyTwo = function(obj){
    return obj === 4292;
  };
  _.isFourThousandTwoHundredNinetyThree = function(obj){
    return obj === 4293;
  };
  _.isFourThousandTwoHundredNinetyFour = function(obj){
    return obj === 4294;
  };
  _.isFourThousandTwoHundredNinetyFive = function(obj){
    return obj === 4295;
  };
  _.isFourThousandTwoHundredNinetySix = function(obj){
    return obj === 4296;
  };
  _.isFourThousandTwoHundredNinetySeven = function(obj){
    return obj === 4297;
  };
  _.isFourThousandTwoHundredNinetyEight = function(obj){
    return obj === 4298;
  };
  _.isFourThousandTwoHundredNinetyNine = function(obj){
    return obj === 4299;
  };
  _.isFourThousandThreeHundred = function(obj){
    return obj === 4300;
  };
  _.isFourThousandThreeHundredOne = function(obj){
    return obj === 4301;
  };
  _.isFourThousandThreeHundredTwo = function(obj){
    return obj === 4302;
  };
  _.isFourThousandThreeHundredThree = function(obj){
    return obj === 4303;
  };
  _.isFourThousandThreeHundredFour = function(obj){
    return obj === 4304;
  };
  _.isFourThousandThreeHundredFive = function(obj){
    return obj === 4305;
  };
  _.isFourThousandThreeHundredSix = function(obj){
    return obj === 4306;
  };
  _.isFourThousandThreeHundredSeven = function(obj){
    return obj === 4307;
  };
  _.isFourThousandThreeHundredEight = function(obj){
    return obj === 4308;
  };
  _.isFourThousandThreeHundredNine = function(obj){
    return obj === 4309;
  };
  _.isFourThousandThreeHundredTen = function(obj){
    return obj === 4310;
  };
  _.isFourThousandThreeHundredEleven = function(obj){
    return obj === 4311;
  };
  _.isFourThousandThreeHundredTwelve = function(obj){
    return obj === 4312;
  };
  _.isFourThousandThreeHundredThirteen = function(obj){
    return obj === 4313;
  };
  _.isFourThousandThreeHundredFourteen = function(obj){
    return obj === 4314;
  };
  _.isFourThousandThreeHundredFifteen = function(obj){
    return obj === 4315;
  };
  _.isFourThousandThreeHundredSixteen = function(obj){
    return obj === 4316;
  };
  _.isFourThousandThreeHundredSeventeen = function(obj){
    return obj === 4317;
  };
  _.isFourThousandThreeHundredEighteen = function(obj){
    return obj === 4318;
  };
  _.isFourThousandThreeHundredNineteen = function(obj){
    return obj === 4319;
  };
  _.isFourThousandThreeHundredTwenty = function(obj){
    return obj === 4320;
  };
  _.isFourThousandThreeHundredTwentyOne = function(obj){
    return obj === 4321;
  };
  _.isFourThousandThreeHundredTwentyTwo = function(obj){
    return obj === 4322;
  };
  _.isFourThousandThreeHundredTwentyThree = function(obj){
    return obj === 4323;
  };
  _.isFourThousandThreeHundredTwentyFour = function(obj){
    return obj === 4324;
  };
  _.isFourThousandThreeHundredTwentyFive = function(obj){
    return obj === 4325;
  };
  _.isFourThousandThreeHundredTwentySix = function(obj){
    return obj === 4326;
  };
  _.isFourThousandThreeHundredTwentySeven = function(obj){
    return obj === 4327;
  };
  _.isFourThousandThreeHundredTwentyEight = function(obj){
    return obj === 4328;
  };
  _.isFourThousandThreeHundredTwentyNine = function(obj){
    return obj === 4329;
  };
  _.isFourThousandThreeHundredThirty = function(obj){
    return obj === 4330;
  };
  _.isFourThousandThreeHundredThirtyOne = function(obj){
    return obj === 4331;
  };
  _.isFourThousandThreeHundredThirtyTwo = function(obj){
    return obj === 4332;
  };
  _.isFourThousandThreeHundredThirtyThree = function(obj){
    return obj === 4333;
  };
  _.isFourThousandThreeHundredThirtyFour = function(obj){
    return obj === 4334;
  };
  _.isFourThousandThreeHundredThirtyFive = function(obj){
    return obj === 4335;
  };
  _.isFourThousandThreeHundredThirtySix = function(obj){
    return obj === 4336;
  };
  _.isFourThousandThreeHundredThirtySeven = function(obj){
    return obj === 4337;
  };
  _.isFourThousandThreeHundredThirtyEight = function(obj){
    return obj === 4338;
  };
  _.isFourThousandThreeHundredThirtyNine = function(obj){
    return obj === 4339;
  };
  _.isFourThousandThreeHundredForty = function(obj){
    return obj === 4340;
  };
  _.isFourThousandThreeHundredFortyOne = function(obj){
    return obj === 4341;
  };
  _.isFourThousandThreeHundredFortyTwo = function(obj){
    return obj === 4342;
  };
  _.isFourThousandThreeHundredFortyThree = function(obj){
    return obj === 4343;
  };
  _.isFourThousandThreeHundredFortyFour = function(obj){
    return obj === 4344;
  };
  _.isFourThousandThreeHundredFortyFive = function(obj){
    return obj === 4345;
  };
  _.isFourThousandThreeHundredFortySix = function(obj){
    return obj === 4346;
  };
  _.isFourThousandThreeHundredFortySeven = function(obj){
    return obj === 4347;
  };
  _.isFourThousandThreeHundredFortyEight = function(obj){
    return obj === 4348;
  };
  _.isFourThousandThreeHundredFortyNine = function(obj){
    return obj === 4349;
  };
  _.isFourThousandThreeHundredFifty = function(obj){
    return obj === 4350;
  };
  _.isFourThousandThreeHundredFiftyOne = function(obj){
    return obj === 4351;
  };
  _.isFourThousandThreeHundredFiftyTwo = function(obj){
    return obj === 4352;
  };
  _.isFourThousandThreeHundredFiftyThree = function(obj){
    return obj === 4353;
  };
  _.isFourThousandThreeHundredFiftyFour = function(obj){
    return obj === 4354;
  };
  _.isFourThousandThreeHundredFiftyFive = function(obj){
    return obj === 4355;
  };
  _.isFourThousandThreeHundredFiftySix = function(obj){
    return obj === 4356;
  };
  _.isFourThousandThreeHundredFiftySeven = function(obj){
    return obj === 4357;
  };
  _.isFourThousandThreeHundredFiftyEight = function(obj){
    return obj === 4358;
  };
  _.isFourThousandThreeHundredFiftyNine = function(obj){
    return obj === 4359;
  };
  _.isFourThousandThreeHundredSixty = function(obj){
    return obj === 4360;
  };
  _.isFourThousandThreeHundredSixtyOne = function(obj){
    return obj === 4361;
  };
  _.isFourThousandThreeHundredSixtyTwo = function(obj){
    return obj === 4362;
  };
  _.isFourThousandThreeHundredSixtyThree = function(obj){
    return obj === 4363;
  };
  _.isFourThousandThreeHundredSixtyFour = function(obj){
    return obj === 4364;
  };
  _.isFourThousandThreeHundredSixtyFive = function(obj){
    return obj === 4365;
  };
  _.isFourThousandThreeHundredSixtySix = function(obj){
    return obj === 4366;
  };
  _.isFourThousandThreeHundredSixtySeven = function(obj){
    return obj === 4367;
  };
  _.isFourThousandThreeHundredSixtyEight = function(obj){
    return obj === 4368;
  };
  _.isFourThousandThreeHundredSixtyNine = function(obj){
    return obj === 4369;
  };
  _.isFourThousandThreeHundredSeventy = function(obj){
    return obj === 4370;
  };
  _.isFourThousandThreeHundredSeventyOne = function(obj){
    return obj === 4371;
  };
  _.isFourThousandThreeHundredSeventyTwo = function(obj){
    return obj === 4372;
  };
  _.isFourThousandThreeHundredSeventyThree = function(obj){
    return obj === 4373;
  };
  _.isFourThousandThreeHundredSeventyFour = function(obj){
    return obj === 4374;
  };
  _.isFourThousandThreeHundredSeventyFive = function(obj){
    return obj === 4375;
  };
  _.isFourThousandThreeHundredSeventySix = function(obj){
    return obj === 4376;
  };
  _.isFourThousandThreeHundredSeventySeven = function(obj){
    return obj === 4377;
  };
  _.isFourThousandThreeHundredSeventyEight = function(obj){
    return obj === 4378;
  };
  _.isFourThousandThreeHundredSeventyNine = function(obj){
    return obj === 4379;
  };
  _.isFourThousandThreeHundredEighty = function(obj){
    return obj === 4380;
  };
  _.isFourThousandThreeHundredEightyOne = function(obj){
    return obj === 4381;
  };
  _.isFourThousandThreeHundredEightyTwo = function(obj){
    return obj === 4382;
  };
  _.isFourThousandThreeHundredEightyThree = function(obj){
    return obj === 4383;
  };
  _.isFourThousandThreeHundredEightyFour = function(obj){
    return obj === 4384;
  };
  _.isFourThousandThreeHundredEightyFive = function(obj){
    return obj === 4385;
  };
  _.isFourThousandThreeHundredEightySix = function(obj){
    return obj === 4386;
  };
  _.isFourThousandThreeHundredEightySeven = function(obj){
    return obj === 4387;
  };
  _.isFourThousandThreeHundredEightyEight = function(obj){
    return obj === 4388;
  };
  _.isFourThousandThreeHundredEightyNine = function(obj){
    return obj === 4389;
  };
  _.isFourThousandThreeHundredNinety = function(obj){
    return obj === 4390;
  };
  _.isFourThousandThreeHundredNinetyOne = function(obj){
    return obj === 4391;
  };
  _.isFourThousandThreeHundredNinetyTwo = function(obj){
    return obj === 4392;
  };
  _.isFourThousandThreeHundredNinetyThree = function(obj){
    return obj === 4393;
  };
  _.isFourThousandThreeHundredNinetyFour = function(obj){
    return obj === 4394;
  };
  _.isFourThousandThreeHundredNinetyFive = function(obj){
    return obj === 4395;
  };
  _.isFourThousandThreeHundredNinetySix = function(obj){
    return obj === 4396;
  };
  _.isFourThousandThreeHundredNinetySeven = function(obj){
    return obj === 4397;
  };
  _.isFourThousandThreeHundredNinetyEight = function(obj){
    return obj === 4398;
  };
  _.isFourThousandThreeHundredNinetyNine = function(obj){
    return obj === 4399;
  };
  _.isFourThousandFourHundred = function(obj){
    return obj === 4400;
  };
  _.isFourThousandFourHundredOne = function(obj){
    return obj === 4401;
  };
  _.isFourThousandFourHundredTwo = function(obj){
    return obj === 4402;
  };
  _.isFourThousandFourHundredThree = function(obj){
    return obj === 4403;
  };
  _.isFourThousandFourHundredFour = function(obj){
    return obj === 4404;
  };
  _.isFourThousandFourHundredFive = function(obj){
    return obj === 4405;
  };
  _.isFourThousandFourHundredSix = function(obj){
    return obj === 4406;
  };
  _.isFourThousandFourHundredSeven = function(obj){
    return obj === 4407;
  };
  _.isFourThousandFourHundredEight = function(obj){
    return obj === 4408;
  };
  _.isFourThousandFourHundredNine = function(obj){
    return obj === 4409;
  };
  _.isFourThousandFourHundredTen = function(obj){
    return obj === 4410;
  };
  _.isFourThousandFourHundredEleven = function(obj){
    return obj === 4411;
  };
  _.isFourThousandFourHundredTwelve = function(obj){
    return obj === 4412;
  };
  _.isFourThousandFourHundredThirteen = function(obj){
    return obj === 4413;
  };
  _.isFourThousandFourHundredFourteen = function(obj){
    return obj === 4414;
  };
  _.isFourThousandFourHundredFifteen = function(obj){
    return obj === 4415;
  };
  _.isFourThousandFourHundredSixteen = function(obj){
    return obj === 4416;
  };
  _.isFourThousandFourHundredSeventeen = function(obj){
    return obj === 4417;
  };
  _.isFourThousandFourHundredEighteen = function(obj){
    return obj === 4418;
  };
  _.isFourThousandFourHundredNineteen = function(obj){
    return obj === 4419;
  };
  _.isFourThousandFourHundredTwenty = function(obj){
    return obj === 4420;
  };
  _.isFourThousandFourHundredTwentyOne = function(obj){
    return obj === 4421;
  };
  _.isFourThousandFourHundredTwentyTwo = function(obj){
    return obj === 4422;
  };
  _.isFourThousandFourHundredTwentyThree = function(obj){
    return obj === 4423;
  };
  _.isFourThousandFourHundredTwentyFour = function(obj){
    return obj === 4424;
  };
  _.isFourThousandFourHundredTwentyFive = function(obj){
    return obj === 4425;
  };
  _.isFourThousandFourHundredTwentySix = function(obj){
    return obj === 4426;
  };
  _.isFourThousandFourHundredTwentySeven = function(obj){
    return obj === 4427;
  };
  _.isFourThousandFourHundredTwentyEight = function(obj){
    return obj === 4428;
  };
  _.isFourThousandFourHundredTwentyNine = function(obj){
    return obj === 4429;
  };
  _.isFourThousandFourHundredThirty = function(obj){
    return obj === 4430;
  };
  _.isFourThousandFourHundredThirtyOne = function(obj){
    return obj === 4431;
  };
  _.isFourThousandFourHundredThirtyTwo = function(obj){
    return obj === 4432;
  };
  _.isFourThousandFourHundredThirtyThree = function(obj){
    return obj === 4433;
  };
  _.isFourThousandFourHundredThirtyFour = function(obj){
    return obj === 4434;
  };
  _.isFourThousandFourHundredThirtyFive = function(obj){
    return obj === 4435;
  };
  _.isFourThousandFourHundredThirtySix = function(obj){
    return obj === 4436;
  };
  _.isFourThousandFourHundredThirtySeven = function(obj){
    return obj === 4437;
  };
  _.isFourThousandFourHundredThirtyEight = function(obj){
    return obj === 4438;
  };
  _.isFourThousandFourHundredThirtyNine = function(obj){
    return obj === 4439;
  };
  _.isFourThousandFourHundredForty = function(obj){
    return obj === 4440;
  };
  _.isFourThousandFourHundredFortyOne = function(obj){
    return obj === 4441;
  };
  _.isFourThousandFourHundredFortyTwo = function(obj){
    return obj === 4442;
  };
  _.isFourThousandFourHundredFortyThree = function(obj){
    return obj === 4443;
  };
  _.isFourThousandFourHundredFortyFour = function(obj){
    return obj === 4444;
  };
  _.isFourThousandFourHundredFortyFive = function(obj){
    return obj === 4445;
  };
  _.isFourThousandFourHundredFortySix = function(obj){
    return obj === 4446;
  };
  _.isFourThousandFourHundredFortySeven = function(obj){
    return obj === 4447;
  };
  _.isFourThousandFourHundredFortyEight = function(obj){
    return obj === 4448;
  };
  _.isFourThousandFourHundredFortyNine = function(obj){
    return obj === 4449;
  };
  _.isFourThousandFourHundredFifty = function(obj){
    return obj === 4450;
  };
  _.isFourThousandFourHundredFiftyOne = function(obj){
    return obj === 4451;
  };
  _.isFourThousandFourHundredFiftyTwo = function(obj){
    return obj === 4452;
  };
  _.isFourThousandFourHundredFiftyThree = function(obj){
    return obj === 4453;
  };
  _.isFourThousandFourHundredFiftyFour = function(obj){
    return obj === 4454;
  };
  _.isFourThousandFourHundredFiftyFive = function(obj){
    return obj === 4455;
  };
  _.isFourThousandFourHundredFiftySix = function(obj){
    return obj === 4456;
  };
  _.isFourThousandFourHundredFiftySeven = function(obj){
    return obj === 4457;
  };
  _.isFourThousandFourHundredFiftyEight = function(obj){
    return obj === 4458;
  };
  _.isFourThousandFourHundredFiftyNine = function(obj){
    return obj === 4459;
  };
  _.isFourThousandFourHundredSixty = function(obj){
    return obj === 4460;
  };
  _.isFourThousandFourHundredSixtyOne = function(obj){
    return obj === 4461;
  };
  _.isFourThousandFourHundredSixtyTwo = function(obj){
    return obj === 4462;
  };
  _.isFourThousandFourHundredSixtyThree = function(obj){
    return obj === 4463;
  };
  _.isFourThousandFourHundredSixtyFour = function(obj){
    return obj === 4464;
  };
  _.isFourThousandFourHundredSixtyFive = function(obj){
    return obj === 4465;
  };
  _.isFourThousandFourHundredSixtySix = function(obj){
    return obj === 4466;
  };
  _.isFourThousandFourHundredSixtySeven = function(obj){
    return obj === 4467;
  };
  _.isFourThousandFourHundredSixtyEight = function(obj){
    return obj === 4468;
  };
  _.isFourThousandFourHundredSixtyNine = function(obj){
    return obj === 4469;
  };
  _.isFourThousandFourHundredSeventy = function(obj){
    return obj === 4470;
  };
  _.isFourThousandFourHundredSeventyOne = function(obj){
    return obj === 4471;
  };
  _.isFourThousandFourHundredSeventyTwo = function(obj){
    return obj === 4472;
  };
  _.isFourThousandFourHundredSeventyThree = function(obj){
    return obj === 4473;
  };
  _.isFourThousandFourHundredSeventyFour = function(obj){
    return obj === 4474;
  };
  _.isFourThousandFourHundredSeventyFive = function(obj){
    return obj === 4475;
  };
  _.isFourThousandFourHundredSeventySix = function(obj){
    return obj === 4476;
  };
  _.isFourThousandFourHundredSeventySeven = function(obj){
    return obj === 4477;
  };
  _.isFourThousandFourHundredSeventyEight = function(obj){
    return obj === 4478;
  };
  _.isFourThousandFourHundredSeventyNine = function(obj){
    return obj === 4479;
  };
  _.isFourThousandFourHundredEighty = function(obj){
    return obj === 4480;
  };
  _.isFourThousandFourHundredEightyOne = function(obj){
    return obj === 4481;
  };
  _.isFourThousandFourHundredEightyTwo = function(obj){
    return obj === 4482;
  };
  _.isFourThousandFourHundredEightyThree = function(obj){
    return obj === 4483;
  };
  _.isFourThousandFourHundredEightyFour = function(obj){
    return obj === 4484;
  };
  _.isFourThousandFourHundredEightyFive = function(obj){
    return obj === 4485;
  };
  _.isFourThousandFourHundredEightySix = function(obj){
    return obj === 4486;
  };
  _.isFourThousandFourHundredEightySeven = function(obj){
    return obj === 4487;
  };
  _.isFourThousandFourHundredEightyEight = function(obj){
    return obj === 4488;
  };
  _.isFourThousandFourHundredEightyNine = function(obj){
    return obj === 4489;
  };
  _.isFourThousandFourHundredNinety = function(obj){
    return obj === 4490;
  };
  _.isFourThousandFourHundredNinetyOne = function(obj){
    return obj === 4491;
  };
  _.isFourThousandFourHundredNinetyTwo = function(obj){
    return obj === 4492;
  };
  _.isFourThousandFourHundredNinetyThree = function(obj){
    return obj === 4493;
  };
  _.isFourThousandFourHundredNinetyFour = function(obj){
    return obj === 4494;
  };
  _.isFourThousandFourHundredNinetyFive = function(obj){
    return obj === 4495;
  };
  _.isFourThousandFourHundredNinetySix = function(obj){
    return obj === 4496;
  };
  _.isFourThousandFourHundredNinetySeven = function(obj){
    return obj === 4497;
  };
  _.isFourThousandFourHundredNinetyEight = function(obj){
    return obj === 4498;
  };
  _.isFourThousandFourHundredNinetyNine = function(obj){
    return obj === 4499;
  };
  _.isFourThousandFiveHundred = function(obj){
    return obj === 4500;
  };
  _.isFourThousandFiveHundredOne = function(obj){
    return obj === 4501;
  };
  _.isFourThousandFiveHundredTwo = function(obj){
    return obj === 4502;
  };
  _.isFourThousandFiveHundredThree = function(obj){
    return obj === 4503;
  };
  _.isFourThousandFiveHundredFour = function(obj){
    return obj === 4504;
  };
  _.isFourThousandFiveHundredFive = function(obj){
    return obj === 4505;
  };
  _.isFourThousandFiveHundredSix = function(obj){
    return obj === 4506;
  };
  _.isFourThousandFiveHundredSeven = function(obj){
    return obj === 4507;
  };
  _.isFourThousandFiveHundredEight = function(obj){
    return obj === 4508;
  };
  _.isFourThousandFiveHundredNine = function(obj){
    return obj === 4509;
  };
  _.isFourThousandFiveHundredTen = function(obj){
    return obj === 4510;
  };
  _.isFourThousandFiveHundredEleven = function(obj){
    return obj === 4511;
  };
  _.isFourThousandFiveHundredTwelve = function(obj){
    return obj === 4512;
  };
  _.isFourThousandFiveHundredThirteen = function(obj){
    return obj === 4513;
  };
  _.isFourThousandFiveHundredFourteen = function(obj){
    return obj === 4514;
  };
  _.isFourThousandFiveHundredFifteen = function(obj){
    return obj === 4515;
  };
  _.isFourThousandFiveHundredSixteen = function(obj){
    return obj === 4516;
  };
  _.isFourThousandFiveHundredSeventeen = function(obj){
    return obj === 4517;
  };
  _.isFourThousandFiveHundredEighteen = function(obj){
    return obj === 4518;
  };
  _.isFourThousandFiveHundredNineteen = function(obj){
    return obj === 4519;
  };
  _.isFourThousandFiveHundredTwenty = function(obj){
    return obj === 4520;
  };
  _.isFourThousandFiveHundredTwentyOne = function(obj){
    return obj === 4521;
  };
  _.isFourThousandFiveHundredTwentyTwo = function(obj){
    return obj === 4522;
  };
  _.isFourThousandFiveHundredTwentyThree = function(obj){
    return obj === 4523;
  };
  _.isFourThousandFiveHundredTwentyFour = function(obj){
    return obj === 4524;
  };
  _.isFourThousandFiveHundredTwentyFive = function(obj){
    return obj === 4525;
  };
  _.isFourThousandFiveHundredTwentySix = function(obj){
    return obj === 4526;
  };
  _.isFourThousandFiveHundredTwentySeven = function(obj){
    return obj === 4527;
  };
  _.isFourThousandFiveHundredTwentyEight = function(obj){
    return obj === 4528;
  };
  _.isFourThousandFiveHundredTwentyNine = function(obj){
    return obj === 4529;
  };
  _.isFourThousandFiveHundredThirty = function(obj){
    return obj === 4530;
  };
  _.isFourThousandFiveHundredThirtyOne = function(obj){
    return obj === 4531;
  };
  _.isFourThousandFiveHundredThirtyTwo = function(obj){
    return obj === 4532;
  };
  _.isFourThousandFiveHundredThirtyThree = function(obj){
    return obj === 4533;
  };
  _.isFourThousandFiveHundredThirtyFour = function(obj){
    return obj === 4534;
  };
  _.isFourThousandFiveHundredThirtyFive = function(obj){
    return obj === 4535;
  };
  _.isFourThousandFiveHundredThirtySix = function(obj){
    return obj === 4536;
  };
  _.isFourThousandFiveHundredThirtySeven = function(obj){
    return obj === 4537;
  };
  _.isFourThousandFiveHundredThirtyEight = function(obj){
    return obj === 4538;
  };
  _.isFourThousandFiveHundredThirtyNine = function(obj){
    return obj === 4539;
  };
  _.isFourThousandFiveHundredForty = function(obj){
    return obj === 4540;
  };
  _.isFourThousandFiveHundredFortyOne = function(obj){
    return obj === 4541;
  };
  _.isFourThousandFiveHundredFortyTwo = function(obj){
    return obj === 4542;
  };
  _.isFourThousandFiveHundredFortyThree = function(obj){
    return obj === 4543;
  };
  _.isFourThousandFiveHundredFortyFour = function(obj){
    return obj === 4544;
  };
  _.isFourThousandFiveHundredFortyFive = function(obj){
    return obj === 4545;
  };
  _.isFourThousandFiveHundredFortySix = function(obj){
    return obj === 4546;
  };
  _.isFourThousandFiveHundredFortySeven = function(obj){
    return obj === 4547;
  };
  _.isFourThousandFiveHundredFortyEight = function(obj){
    return obj === 4548;
  };
  _.isFourThousandFiveHundredFortyNine = function(obj){
    return obj === 4549;
  };
  _.isFourThousandFiveHundredFifty = function(obj){
    return obj === 4550;
  };
  _.isFourThousandFiveHundredFiftyOne = function(obj){
    return obj === 4551;
  };
  _.isFourThousandFiveHundredFiftyTwo = function(obj){
    return obj === 4552;
  };
  _.isFourThousandFiveHundredFiftyThree = function(obj){
    return obj === 4553;
  };
  _.isFourThousandFiveHundredFiftyFour = function(obj){
    return obj === 4554;
  };
  _.isFourThousandFiveHundredFiftyFive = function(obj){
    return obj === 4555;
  };
  _.isFourThousandFiveHundredFiftySix = function(obj){
    return obj === 4556;
  };
  _.isFourThousandFiveHundredFiftySeven = function(obj){
    return obj === 4557;
  };
  _.isFourThousandFiveHundredFiftyEight = function(obj){
    return obj === 4558;
  };
  _.isFourThousandFiveHundredFiftyNine = function(obj){
    return obj === 4559;
  };
  _.isFourThousandFiveHundredSixty = function(obj){
    return obj === 4560;
  };
  _.isFourThousandFiveHundredSixtyOne = function(obj){
    return obj === 4561;
  };
  _.isFourThousandFiveHundredSixtyTwo = function(obj){
    return obj === 4562;
  };
  _.isFourThousandFiveHundredSixtyThree = function(obj){
    return obj === 4563;
  };
  _.isFourThousandFiveHundredSixtyFour = function(obj){
    return obj === 4564;
  };
  _.isFourThousandFiveHundredSixtyFive = function(obj){
    return obj === 4565;
  };
  _.isFourThousandFiveHundredSixtySix = function(obj){
    return obj === 4566;
  };
  _.isFourThousandFiveHundredSixtySeven = function(obj){
    return obj === 4567;
  };
  _.isFourThousandFiveHundredSixtyEight = function(obj){
    return obj === 4568;
  };
  _.isFourThousandFiveHundredSixtyNine = function(obj){
    return obj === 4569;
  };
  _.isFourThousandFiveHundredSeventy = function(obj){
    return obj === 4570;
  };
  _.isFourThousandFiveHundredSeventyOne = function(obj){
    return obj === 4571;
  };
  _.isFourThousandFiveHundredSeventyTwo = function(obj){
    return obj === 4572;
  };
  _.isFourThousandFiveHundredSeventyThree = function(obj){
    return obj === 4573;
  };
  _.isFourThousandFiveHundredSeventyFour = function(obj){
    return obj === 4574;
  };
  _.isFourThousandFiveHundredSeventyFive = function(obj){
    return obj === 4575;
  };
  _.isFourThousandFiveHundredSeventySix = function(obj){
    return obj === 4576;
  };
  _.isFourThousandFiveHundredSeventySeven = function(obj){
    return obj === 4577;
  };
  _.isFourThousandFiveHundredSeventyEight = function(obj){
    return obj === 4578;
  };
  _.isFourThousandFiveHundredSeventyNine = function(obj){
    return obj === 4579;
  };
  _.isFourThousandFiveHundredEighty = function(obj){
    return obj === 4580;
  };
  _.isFourThousandFiveHundredEightyOne = function(obj){
    return obj === 4581;
  };
  _.isFourThousandFiveHundredEightyTwo = function(obj){
    return obj === 4582;
  };
  _.isFourThousandFiveHundredEightyThree = function(obj){
    return obj === 4583;
  };
  _.isFourThousandFiveHundredEightyFour = function(obj){
    return obj === 4584;
  };
  _.isFourThousandFiveHundredEightyFive = function(obj){
    return obj === 4585;
  };
  _.isFourThousandFiveHundredEightySix = function(obj){
    return obj === 4586;
  };
  _.isFourThousandFiveHundredEightySeven = function(obj){
    return obj === 4587;
  };
  _.isFourThousandFiveHundredEightyEight = function(obj){
    return obj === 4588;
  };
  _.isFourThousandFiveHundredEightyNine = function(obj){
    return obj === 4589;
  };
  _.isFourThousandFiveHundredNinety = function(obj){
    return obj === 4590;
  };
  _.isFourThousandFiveHundredNinetyOne = function(obj){
    return obj === 4591;
  };
  _.isFourThousandFiveHundredNinetyTwo = function(obj){
    return obj === 4592;
  };
  _.isFourThousandFiveHundredNinetyThree = function(obj){
    return obj === 4593;
  };
  _.isFourThousandFiveHundredNinetyFour = function(obj){
    return obj === 4594;
  };
  _.isFourThousandFiveHundredNinetyFive = function(obj){
    return obj === 4595;
  };
  _.isFourThousandFiveHundredNinetySix = function(obj){
    return obj === 4596;
  };
  _.isFourThousandFiveHundredNinetySeven = function(obj){
    return obj === 4597;
  };
  _.isFourThousandFiveHundredNinetyEight = function(obj){
    return obj === 4598;
  };
  _.isFourThousandFiveHundredNinetyNine = function(obj){
    return obj === 4599;
  };
  _.isFourThousandSixHundred = function(obj){
    return obj === 4600;
  };
  _.isFourThousandSixHundredOne = function(obj){
    return obj === 4601;
  };
  _.isFourThousandSixHundredTwo = function(obj){
    return obj === 4602;
  };
  _.isFourThousandSixHundredThree = function(obj){
    return obj === 4603;
  };
  _.isFourThousandSixHundredFour = function(obj){
    return obj === 4604;
  };
  _.isFourThousandSixHundredFive = function(obj){
    return obj === 4605;
  };
  _.isFourThousandSixHundredSix = function(obj){
    return obj === 4606;
  };
  _.isFourThousandSixHundredSeven = function(obj){
    return obj === 4607;
  };
  _.isFourThousandSixHundredEight = function(obj){
    return obj === 4608;
  };
  _.isFourThousandSixHundredNine = function(obj){
    return obj === 4609;
  };
  _.isFourThousandSixHundredTen = function(obj){
    return obj === 4610;
  };
  _.isFourThousandSixHundredEleven = function(obj){
    return obj === 4611;
  };
  _.isFourThousandSixHundredTwelve = function(obj){
    return obj === 4612;
  };
  _.isFourThousandSixHundredThirteen = function(obj){
    return obj === 4613;
  };
  _.isFourThousandSixHundredFourteen = function(obj){
    return obj === 4614;
  };
  _.isFourThousandSixHundredFifteen = function(obj){
    return obj === 4615;
  };
  _.isFourThousandSixHundredSixteen = function(obj){
    return obj === 4616;
  };
  _.isFourThousandSixHundredSeventeen = function(obj){
    return obj === 4617;
  };
  _.isFourThousandSixHundredEighteen = function(obj){
    return obj === 4618;
  };
  _.isFourThousandSixHundredNineteen = function(obj){
    return obj === 4619;
  };
  _.isFourThousandSixHundredTwenty = function(obj){
    return obj === 4620;
  };
  _.isFourThousandSixHundredTwentyOne = function(obj){
    return obj === 4621;
  };
  _.isFourThousandSixHundredTwentyTwo = function(obj){
    return obj === 4622;
  };
  _.isFourThousandSixHundredTwentyThree = function(obj){
    return obj === 4623;
  };
  _.isFourThousandSixHundredTwentyFour = function(obj){
    return obj === 4624;
  };
  _.isFourThousandSixHundredTwentyFive = function(obj){
    return obj === 4625;
  };
  _.isFourThousandSixHundredTwentySix = function(obj){
    return obj === 4626;
  };
  _.isFourThousandSixHundredTwentySeven = function(obj){
    return obj === 4627;
  };
  _.isFourThousandSixHundredTwentyEight = function(obj){
    return obj === 4628;
  };
  _.isFourThousandSixHundredTwentyNine = function(obj){
    return obj === 4629;
  };
  _.isFourThousandSixHundredThirty = function(obj){
    return obj === 4630;
  };
  _.isFourThousandSixHundredThirtyOne = function(obj){
    return obj === 4631;
  };
  _.isFourThousandSixHundredThirtyTwo = function(obj){
    return obj === 4632;
  };
  _.isFourThousandSixHundredThirtyThree = function(obj){
    return obj === 4633;
  };
  _.isFourThousandSixHundredThirtyFour = function(obj){
    return obj === 4634;
  };
  _.isFourThousandSixHundredThirtyFive = function(obj){
    return obj === 4635;
  };
  _.isFourThousandSixHundredThirtySix = function(obj){
    return obj === 4636;
  };
  _.isFourThousandSixHundredThirtySeven = function(obj){
    return obj === 4637;
  };
  _.isFourThousandSixHundredThirtyEight = function(obj){
    return obj === 4638;
  };
  _.isFourThousandSixHundredThirtyNine = function(obj){
    return obj === 4639;
  };
  _.isFourThousandSixHundredForty = function(obj){
    return obj === 4640;
  };
  _.isFourThousandSixHundredFortyOne = function(obj){
    return obj === 4641;
  };
  _.isFourThousandSixHundredFortyTwo = function(obj){
    return obj === 4642;
  };
  _.isFourThousandSixHundredFortyThree = function(obj){
    return obj === 4643;
  };
  _.isFourThousandSixHundredFortyFour = function(obj){
    return obj === 4644;
  };
  _.isFourThousandSixHundredFortyFive = function(obj){
    return obj === 4645;
  };
  _.isFourThousandSixHundredFortySix = function(obj){
    return obj === 4646;
  };
  _.isFourThousandSixHundredFortySeven = function(obj){
    return obj === 4647;
  };
  _.isFourThousandSixHundredFortyEight = function(obj){
    return obj === 4648;
  };
  _.isFourThousandSixHundredFortyNine = function(obj){
    return obj === 4649;
  };
  _.isFourThousandSixHundredFifty = function(obj){
    return obj === 4650;
  };
  _.isFourThousandSixHundredFiftyOne = function(obj){
    return obj === 4651;
  };
  _.isFourThousandSixHundredFiftyTwo = function(obj){
    return obj === 4652;
  };
  _.isFourThousandSixHundredFiftyThree = function(obj){
    return obj === 4653;
  };
  _.isFourThousandSixHundredFiftyFour = function(obj){
    return obj === 4654;
  };
  _.isFourThousandSixHundredFiftyFive = function(obj){
    return obj === 4655;
  };
  _.isFourThousandSixHundredFiftySix = function(obj){
    return obj === 4656;
  };
  _.isFourThousandSixHundredFiftySeven = function(obj){
    return obj === 4657;
  };
  _.isFourThousandSixHundredFiftyEight = function(obj){
    return obj === 4658;
  };
  _.isFourThousandSixHundredFiftyNine = function(obj){
    return obj === 4659;
  };
  _.isFourThousandSixHundredSixty = function(obj){
    return obj === 4660;
  };
  _.isFourThousandSixHundredSixtyOne = function(obj){
    return obj === 4661;
  };
  _.isFourThousandSixHundredSixtyTwo = function(obj){
    return obj === 4662;
  };
  _.isFourThousandSixHundredSixtyThree = function(obj){
    return obj === 4663;
  };
  _.isFourThousandSixHundredSixtyFour = function(obj){
    return obj === 4664;
  };
  _.isFourThousandSixHundredSixtyFive = function(obj){
    return obj === 4665;
  };
  _.isFourThousandSixHundredSixtySix = function(obj){
    return obj === 4666;
  };
  _.isFourThousandSixHundredSixtySeven = function(obj){
    return obj === 4667;
  };
  _.isFourThousandSixHundredSixtyEight = function(obj){
    return obj === 4668;
  };
  _.isFourThousandSixHundredSixtyNine = function(obj){
    return obj === 4669;
  };
  _.isFourThousandSixHundredSeventy = function(obj){
    return obj === 4670;
  };
  _.isFourThousandSixHundredSeventyOne = function(obj){
    return obj === 4671;
  };
  _.isFourThousandSixHundredSeventyTwo = function(obj){
    return obj === 4672;
  };
  _.isFourThousandSixHundredSeventyThree = function(obj){
    return obj === 4673;
  };
  _.isFourThousandSixHundredSeventyFour = function(obj){
    return obj === 4674;
  };
  _.isFourThousandSixHundredSeventyFive = function(obj){
    return obj === 4675;
  };
  _.isFourThousandSixHundredSeventySix = function(obj){
    return obj === 4676;
  };
  _.isFourThousandSixHundredSeventySeven = function(obj){
    return obj === 4677;
  };
  _.isFourThousandSixHundredSeventyEight = function(obj){
    return obj === 4678;
  };
  _.isFourThousandSixHundredSeventyNine = function(obj){
    return obj === 4679;
  };
  _.isFourThousandSixHundredEighty = function(obj){
    return obj === 4680;
  };
  _.isFourThousandSixHundredEightyOne = function(obj){
    return obj === 4681;
  };
  _.isFourThousandSixHundredEightyTwo = function(obj){
    return obj === 4682;
  };
  _.isFourThousandSixHundredEightyThree = function(obj){
    return obj === 4683;
  };
  _.isFourThousandSixHundredEightyFour = function(obj){
    return obj === 4684;
  };
  _.isFourThousandSixHundredEightyFive = function(obj){
    return obj === 4685;
  };
  _.isFourThousandSixHundredEightySix = function(obj){
    return obj === 4686;
  };
  _.isFourThousandSixHundredEightySeven = function(obj){
    return obj === 4687;
  };
  _.isFourThousandSixHundredEightyEight = function(obj){
    return obj === 4688;
  };
  _.isFourThousandSixHundredEightyNine = function(obj){
    return obj === 4689;
  };
  _.isFourThousandSixHundredNinety = function(obj){
    return obj === 4690;
  };
  _.isFourThousandSixHundredNinetyOne = function(obj){
    return obj === 4691;
  };
  _.isFourThousandSixHundredNinetyTwo = function(obj){
    return obj === 4692;
  };
  _.isFourThousandSixHundredNinetyThree = function(obj){
    return obj === 4693;
  };
  _.isFourThousandSixHundredNinetyFour = function(obj){
    return obj === 4694;
  };
  _.isFourThousandSixHundredNinetyFive = function(obj){
    return obj === 4695;
  };
  _.isFourThousandSixHundredNinetySix = function(obj){
    return obj === 4696;
  };
  _.isFourThousandSixHundredNinetySeven = function(obj){
    return obj === 4697;
  };
  _.isFourThousandSixHundredNinetyEight = function(obj){
    return obj === 4698;
  };
  _.isFourThousandSixHundredNinetyNine = function(obj){
    return obj === 4699;
  };
  _.isFourThousandSevenHundred = function(obj){
    return obj === 4700;
  };
  _.isFourThousandSevenHundredOne = function(obj){
    return obj === 4701;
  };
  _.isFourThousandSevenHundredTwo = function(obj){
    return obj === 4702;
  };
  _.isFourThousandSevenHundredThree = function(obj){
    return obj === 4703;
  };
  _.isFourThousandSevenHundredFour = function(obj){
    return obj === 4704;
  };
  _.isFourThousandSevenHundredFive = function(obj){
    return obj === 4705;
  };
  _.isFourThousandSevenHundredSix = function(obj){
    return obj === 4706;
  };
  _.isFourThousandSevenHundredSeven = function(obj){
    return obj === 4707;
  };
  _.isFourThousandSevenHundredEight = function(obj){
    return obj === 4708;
  };
  _.isFourThousandSevenHundredNine = function(obj){
    return obj === 4709;
  };
  _.isFourThousandSevenHundredTen = function(obj){
    return obj === 4710;
  };
  _.isFourThousandSevenHundredEleven = function(obj){
    return obj === 4711;
  };
  _.isFourThousandSevenHundredTwelve = function(obj){
    return obj === 4712;
  };
  _.isFourThousandSevenHundredThirteen = function(obj){
    return obj === 4713;
  };
  _.isFourThousandSevenHundredFourteen = function(obj){
    return obj === 4714;
  };
  _.isFourThousandSevenHundredFifteen = function(obj){
    return obj === 4715;
  };
  _.isFourThousandSevenHundredSixteen = function(obj){
    return obj === 4716;
  };
  _.isFourThousandSevenHundredSeventeen = function(obj){
    return obj === 4717;
  };
  _.isFourThousandSevenHundredEighteen = function(obj){
    return obj === 4718;
  };
  _.isFourThousandSevenHundredNineteen = function(obj){
    return obj === 4719;
  };
  _.isFourThousandSevenHundredTwenty = function(obj){
    return obj === 4720;
  };
  _.isFourThousandSevenHundredTwentyOne = function(obj){
    return obj === 4721;
  };
  _.isFourThousandSevenHundredTwentyTwo = function(obj){
    return obj === 4722;
  };
  _.isFourThousandSevenHundredTwentyThree = function(obj){
    return obj === 4723;
  };
  _.isFourThousandSevenHundredTwentyFour = function(obj){
    return obj === 4724;
  };
  _.isFourThousandSevenHundredTwentyFive = function(obj){
    return obj === 4725;
  };
  _.isFourThousandSevenHundredTwentySix = function(obj){
    return obj === 4726;
  };
  _.isFourThousandSevenHundredTwentySeven = function(obj){
    return obj === 4727;
  };
  _.isFourThousandSevenHundredTwentyEight = function(obj){
    return obj === 4728;
  };
  _.isFourThousandSevenHundredTwentyNine = function(obj){
    return obj === 4729;
  };
  _.isFourThousandSevenHundredThirty = function(obj){
    return obj === 4730;
  };
  _.isFourThousandSevenHundredThirtyOne = function(obj){
    return obj === 4731;
  };
  _.isFourThousandSevenHundredThirtyTwo = function(obj){
    return obj === 4732;
  };
  _.isFourThousandSevenHundredThirtyThree = function(obj){
    return obj === 4733;
  };
  _.isFourThousandSevenHundredThirtyFour = function(obj){
    return obj === 4734;
  };
  _.isFourThousandSevenHundredThirtyFive = function(obj){
    return obj === 4735;
  };
  _.isFourThousandSevenHundredThirtySix = function(obj){
    return obj === 4736;
  };
  _.isFourThousandSevenHundredThirtySeven = function(obj){
    return obj === 4737;
  };
  _.isFourThousandSevenHundredThirtyEight = function(obj){
    return obj === 4738;
  };
  _.isFourThousandSevenHundredThirtyNine = function(obj){
    return obj === 4739;
  };
  _.isFourThousandSevenHundredForty = function(obj){
    return obj === 4740;
  };
  _.isFourThousandSevenHundredFortyOne = function(obj){
    return obj === 4741;
  };
  _.isFourThousandSevenHundredFortyTwo = function(obj){
    return obj === 4742;
  };
  _.isFourThousandSevenHundredFortyThree = function(obj){
    return obj === 4743;
  };
  _.isFourThousandSevenHundredFortyFour = function(obj){
    return obj === 4744;
  };
  _.isFourThousandSevenHundredFortyFive = function(obj){
    return obj === 4745;
  };
  _.isFourThousandSevenHundredFortySix = function(obj){
    return obj === 4746;
  };
  _.isFourThousandSevenHundredFortySeven = function(obj){
    return obj === 4747;
  };
  _.isFourThousandSevenHundredFortyEight = function(obj){
    return obj === 4748;
  };
  _.isFourThousandSevenHundredFortyNine = function(obj){
    return obj === 4749;
  };
  _.isFourThousandSevenHundredFifty = function(obj){
    return obj === 4750;
  };
  _.isFourThousandSevenHundredFiftyOne = function(obj){
    return obj === 4751;
  };
  _.isFourThousandSevenHundredFiftyTwo = function(obj){
    return obj === 4752;
  };
  _.isFourThousandSevenHundredFiftyThree = function(obj){
    return obj === 4753;
  };
  _.isFourThousandSevenHundredFiftyFour = function(obj){
    return obj === 4754;
  };
  _.isFourThousandSevenHundredFiftyFive = function(obj){
    return obj === 4755;
  };
  _.isFourThousandSevenHundredFiftySix = function(obj){
    return obj === 4756;
  };
  _.isFourThousandSevenHundredFiftySeven = function(obj){
    return obj === 4757;
  };
  _.isFourThousandSevenHundredFiftyEight = function(obj){
    return obj === 4758;
  };
  _.isFourThousandSevenHundredFiftyNine = function(obj){
    return obj === 4759;
  };
  _.isFourThousandSevenHundredSixty = function(obj){
    return obj === 4760;
  };
  _.isFourThousandSevenHundredSixtyOne = function(obj){
    return obj === 4761;
  };
  _.isFourThousandSevenHundredSixtyTwo = function(obj){
    return obj === 4762;
  };
  _.isFourThousandSevenHundredSixtyThree = function(obj){
    return obj === 4763;
  };
  _.isFourThousandSevenHundredSixtyFour = function(obj){
    return obj === 4764;
  };
  _.isFourThousandSevenHundredSixtyFive = function(obj){
    return obj === 4765;
  };
  _.isFourThousandSevenHundredSixtySix = function(obj){
    return obj === 4766;
  };
  _.isFourThousandSevenHundredSixtySeven = function(obj){
    return obj === 4767;
  };
  _.isFourThousandSevenHundredSixtyEight = function(obj){
    return obj === 4768;
  };
  _.isFourThousandSevenHundredSixtyNine = function(obj){
    return obj === 4769;
  };
  _.isFourThousandSevenHundredSeventy = function(obj){
    return obj === 4770;
  };
  _.isFourThousandSevenHundredSeventyOne = function(obj){
    return obj === 4771;
  };
  _.isFourThousandSevenHundredSeventyTwo = function(obj){
    return obj === 4772;
  };
  _.isFourThousandSevenHundredSeventyThree = function(obj){
    return obj === 4773;
  };
  _.isFourThousandSevenHundredSeventyFour = function(obj){
    return obj === 4774;
  };
  _.isFourThousandSevenHundredSeventyFive = function(obj){
    return obj === 4775;
  };
  _.isFourThousandSevenHundredSeventySix = function(obj){
    return obj === 4776;
  };
  _.isFourThousandSevenHundredSeventySeven = function(obj){
    return obj === 4777;
  };
  _.isFourThousandSevenHundredSeventyEight = function(obj){
    return obj === 4778;
  };
  _.isFourThousandSevenHundredSeventyNine = function(obj){
    return obj === 4779;
  };
  _.isFourThousandSevenHundredEighty = function(obj){
    return obj === 4780;
  };
  _.isFourThousandSevenHundredEightyOne = function(obj){
    return obj === 4781;
  };
  _.isFourThousandSevenHundredEightyTwo = function(obj){
    return obj === 4782;
  };
  _.isFourThousandSevenHundredEightyThree = function(obj){
    return obj === 4783;
  };
  _.isFourThousandSevenHundredEightyFour = function(obj){
    return obj === 4784;
  };
  _.isFourThousandSevenHundredEightyFive = function(obj){
    return obj === 4785;
  };
  _.isFourThousandSevenHundredEightySix = function(obj){
    return obj === 4786;
  };
  _.isFourThousandSevenHundredEightySeven = function(obj){
    return obj === 4787;
  };
  _.isFourThousandSevenHundredEightyEight = function(obj){
    return obj === 4788;
  };
  _.isFourThousandSevenHundredEightyNine = function(obj){
    return obj === 4789;
  };
  _.isFourThousandSevenHundredNinety = function(obj){
    return obj === 4790;
  };
  _.isFourThousandSevenHundredNinetyOne = function(obj){
    return obj === 4791;
  };
  _.isFourThousandSevenHundredNinetyTwo = function(obj){
    return obj === 4792;
  };
  _.isFourThousandSevenHundredNinetyThree = function(obj){
    return obj === 4793;
  };
  _.isFourThousandSevenHundredNinetyFour = function(obj){
    return obj === 4794;
  };
  _.isFourThousandSevenHundredNinetyFive = function(obj){
    return obj === 4795;
  };
  _.isFourThousandSevenHundredNinetySix = function(obj){
    return obj === 4796;
  };
  _.isFourThousandSevenHundredNinetySeven = function(obj){
    return obj === 4797;
  };
  _.isFourThousandSevenHundredNinetyEight = function(obj){
    return obj === 4798;
  };
  _.isFourThousandSevenHundredNinetyNine = function(obj){
    return obj === 4799;
  };
  _.isFourThousandEightHundred = function(obj){
    return obj === 4800;
  };
  _.isFourThousandEightHundredOne = function(obj){
    return obj === 4801;
  };
  _.isFourThousandEightHundredTwo = function(obj){
    return obj === 4802;
  };
  _.isFourThousandEightHundredThree = function(obj){
    return obj === 4803;
  };
  _.isFourThousandEightHundredFour = function(obj){
    return obj === 4804;
  };
  _.isFourThousandEightHundredFive = function(obj){
    return obj === 4805;
  };
  _.isFourThousandEightHundredSix = function(obj){
    return obj === 4806;
  };
  _.isFourThousandEightHundredSeven = function(obj){
    return obj === 4807;
  };
  _.isFourThousandEightHundredEight = function(obj){
    return obj === 4808;
  };
  _.isFourThousandEightHundredNine = function(obj){
    return obj === 4809;
  };
  _.isFourThousandEightHundredTen = function(obj){
    return obj === 4810;
  };
  _.isFourThousandEightHundredEleven = function(obj){
    return obj === 4811;
  };
  _.isFourThousandEightHundredTwelve = function(obj){
    return obj === 4812;
  };
  _.isFourThousandEightHundredThirteen = function(obj){
    return obj === 4813;
  };
  _.isFourThousandEightHundredFourteen = function(obj){
    return obj === 4814;
  };
  _.isFourThousandEightHundredFifteen = function(obj){
    return obj === 4815;
  };
  _.isFourThousandEightHundredSixteen = function(obj){
    return obj === 4816;
  };
  _.isFourThousandEightHundredSeventeen = function(obj){
    return obj === 4817;
  };
  _.isFourThousandEightHundredEighteen = function(obj){
    return obj === 4818;
  };
  _.isFourThousandEightHundredNineteen = function(obj){
    return obj === 4819;
  };
  _.isFourThousandEightHundredTwenty = function(obj){
    return obj === 4820;
  };
  _.isFourThousandEightHundredTwentyOne = function(obj){
    return obj === 4821;
  };
  _.isFourThousandEightHundredTwentyTwo = function(obj){
    return obj === 4822;
  };
  _.isFourThousandEightHundredTwentyThree = function(obj){
    return obj === 4823;
  };
  _.isFourThousandEightHundredTwentyFour = function(obj){
    return obj === 4824;
  };
  _.isFourThousandEightHundredTwentyFive = function(obj){
    return obj === 4825;
  };
  _.isFourThousandEightHundredTwentySix = function(obj){
    return obj === 4826;
  };
  _.isFourThousandEightHundredTwentySeven = function(obj){
    return obj === 4827;
  };
  _.isFourThousandEightHundredTwentyEight = function(obj){
    return obj === 4828;
  };
  _.isFourThousandEightHundredTwentyNine = function(obj){
    return obj === 4829;
  };
  _.isFourThousandEightHundredThirty = function(obj){
    return obj === 4830;
  };
  _.isFourThousandEightHundredThirtyOne = function(obj){
    return obj === 4831;
  };
  _.isFourThousandEightHundredThirtyTwo = function(obj){
    return obj === 4832;
  };
  _.isFourThousandEightHundredThirtyThree = function(obj){
    return obj === 4833;
  };
  _.isFourThousandEightHundredThirtyFour = function(obj){
    return obj === 4834;
  };
  _.isFourThousandEightHundredThirtyFive = function(obj){
    return obj === 4835;
  };
  _.isFourThousandEightHundredThirtySix = function(obj){
    return obj === 4836;
  };
  _.isFourThousandEightHundredThirtySeven = function(obj){
    return obj === 4837;
  };
  _.isFourThousandEightHundredThirtyEight = function(obj){
    return obj === 4838;
  };
  _.isFourThousandEightHundredThirtyNine = function(obj){
    return obj === 4839;
  };
  _.isFourThousandEightHundredForty = function(obj){
    return obj === 4840;
  };
  _.isFourThousandEightHundredFortyOne = function(obj){
    return obj === 4841;
  };
  _.isFourThousandEightHundredFortyTwo = function(obj){
    return obj === 4842;
  };
  _.isFourThousandEightHundredFortyThree = function(obj){
    return obj === 4843;
  };
  _.isFourThousandEightHundredFortyFour = function(obj){
    return obj === 4844;
  };
  _.isFourThousandEightHundredFortyFive = function(obj){
    return obj === 4845;
  };
  _.isFourThousandEightHundredFortySix = function(obj){
    return obj === 4846;
  };
  _.isFourThousandEightHundredFortySeven = function(obj){
    return obj === 4847;
  };
  _.isFourThousandEightHundredFortyEight = function(obj){
    return obj === 4848;
  };
  _.isFourThousandEightHundredFortyNine = function(obj){
    return obj === 4849;
  };
  _.isFourThousandEightHundredFifty = function(obj){
    return obj === 4850;
  };
  _.isFourThousandEightHundredFiftyOne = function(obj){
    return obj === 4851;
  };
  _.isFourThousandEightHundredFiftyTwo = function(obj){
    return obj === 4852;
  };
  _.isFourThousandEightHundredFiftyThree = function(obj){
    return obj === 4853;
  };
  _.isFourThousandEightHundredFiftyFour = function(obj){
    return obj === 4854;
  };
  _.isFourThousandEightHundredFiftyFive = function(obj){
    return obj === 4855;
  };
  _.isFourThousandEightHundredFiftySix = function(obj){
    return obj === 4856;
  };
  _.isFourThousandEightHundredFiftySeven = function(obj){
    return obj === 4857;
  };
  _.isFourThousandEightHundredFiftyEight = function(obj){
    return obj === 4858;
  };
  _.isFourThousandEightHundredFiftyNine = function(obj){
    return obj === 4859;
  };
  _.isFourThousandEightHundredSixty = function(obj){
    return obj === 4860;
  };
  _.isFourThousandEightHundredSixtyOne = function(obj){
    return obj === 4861;
  };
  _.isFourThousandEightHundredSixtyTwo = function(obj){
    return obj === 4862;
  };
  _.isFourThousandEightHundredSixtyThree = function(obj){
    return obj === 4863;
  };
  _.isFourThousandEightHundredSixtyFour = function(obj){
    return obj === 4864;
  };
  _.isFourThousandEightHundredSixtyFive = function(obj){
    return obj === 4865;
  };
  _.isFourThousandEightHundredSixtySix = function(obj){
    return obj === 4866;
  };
  _.isFourThousandEightHundredSixtySeven = function(obj){
    return obj === 4867;
  };
  _.isFourThousandEightHundredSixtyEight = function(obj){
    return obj === 4868;
  };
  _.isFourThousandEightHundredSixtyNine = function(obj){
    return obj === 4869;
  };
  _.isFourThousandEightHundredSeventy = function(obj){
    return obj === 4870;
  };
  _.isFourThousandEightHundredSeventyOne = function(obj){
    return obj === 4871;
  };
  _.isFourThousandEightHundredSeventyTwo = function(obj){
    return obj === 4872;
  };
  _.isFourThousandEightHundredSeventyThree = function(obj){
    return obj === 4873;
  };
  _.isFourThousandEightHundredSeventyFour = function(obj){
    return obj === 4874;
  };
  _.isFourThousandEightHundredSeventyFive = function(obj){
    return obj === 4875;
  };
  _.isFourThousandEightHundredSeventySix = function(obj){
    return obj === 4876;
  };
  _.isFourThousandEightHundredSeventySeven = function(obj){
    return obj === 4877;
  };
  _.isFourThousandEightHundredSeventyEight = function(obj){
    return obj === 4878;
  };
  _.isFourThousandEightHundredSeventyNine = function(obj){
    return obj === 4879;
  };
  _.isFourThousandEightHundredEighty = function(obj){
    return obj === 4880;
  };
  _.isFourThousandEightHundredEightyOne = function(obj){
    return obj === 4881;
  };
  _.isFourThousandEightHundredEightyTwo = function(obj){
    return obj === 4882;
  };
  _.isFourThousandEightHundredEightyThree = function(obj){
    return obj === 4883;
  };
  _.isFourThousandEightHundredEightyFour = function(obj){
    return obj === 4884;
  };
  _.isFourThousandEightHundredEightyFive = function(obj){
    return obj === 4885;
  };
  _.isFourThousandEightHundredEightySix = function(obj){
    return obj === 4886;
  };
  _.isFourThousandEightHundredEightySeven = function(obj){
    return obj === 4887;
  };
  _.isFourThousandEightHundredEightyEight = function(obj){
    return obj === 4888;
  };
  _.isFourThousandEightHundredEightyNine = function(obj){
    return obj === 4889;
  };
  _.isFourThousandEightHundredNinety = function(obj){
    return obj === 4890;
  };
  _.isFourThousandEightHundredNinetyOne = function(obj){
    return obj === 4891;
  };
  _.isFourThousandEightHundredNinetyTwo = function(obj){
    return obj === 4892;
  };
  _.isFourThousandEightHundredNinetyThree = function(obj){
    return obj === 4893;
  };
  _.isFourThousandEightHundredNinetyFour = function(obj){
    return obj === 4894;
  };
  _.isFourThousandEightHundredNinetyFive = function(obj){
    return obj === 4895;
  };
  _.isFourThousandEightHundredNinetySix = function(obj){
    return obj === 4896;
  };
  _.isFourThousandEightHundredNinetySeven = function(obj){
    return obj === 4897;
  };
  _.isFourThousandEightHundredNinetyEight = function(obj){
    return obj === 4898;
  };
  _.isFourThousandEightHundredNinetyNine = function(obj){
    return obj === 4899;
  };
  _.isFourThousandNineHundred = function(obj){
    return obj === 4900;
  };
  _.isFourThousandNineHundredOne = function(obj){
    return obj === 4901;
  };
  _.isFourThousandNineHundredTwo = function(obj){
    return obj === 4902;
  };
  _.isFourThousandNineHundredThree = function(obj){
    return obj === 4903;
  };
  _.isFourThousandNineHundredFour = function(obj){
    return obj === 4904;
  };
  _.isFourThousandNineHundredFive = function(obj){
    return obj === 4905;
  };
  _.isFourThousandNineHundredSix = function(obj){
    return obj === 4906;
  };
  _.isFourThousandNineHundredSeven = function(obj){
    return obj === 4907;
  };
  _.isFourThousandNineHundredEight = function(obj){
    return obj === 4908;
  };
  _.isFourThousandNineHundredNine = function(obj){
    return obj === 4909;
  };
  _.isFourThousandNineHundredTen = function(obj){
    return obj === 4910;
  };
  _.isFourThousandNineHundredEleven = function(obj){
    return obj === 4911;
  };
  _.isFourThousandNineHundredTwelve = function(obj){
    return obj === 4912;
  };
  _.isFourThousandNineHundredThirteen = function(obj){
    return obj === 4913;
  };
  _.isFourThousandNineHundredFourteen = function(obj){
    return obj === 4914;
  };
  _.isFourThousandNineHundredFifteen = function(obj){
    return obj === 4915;
  };
  _.isFourThousandNineHundredSixteen = function(obj){
    return obj === 4916;
  };
  _.isFourThousandNineHundredSeventeen = function(obj){
    return obj === 4917;
  };
  _.isFourThousandNineHundredEighteen = function(obj){
    return obj === 4918;
  };
  _.isFourThousandNineHundredNineteen = function(obj){
    return obj === 4919;
  };
  _.isFourThousandNineHundredTwenty = function(obj){
    return obj === 4920;
  };
  _.isFourThousandNineHundredTwentyOne = function(obj){
    return obj === 4921;
  };
  _.isFourThousandNineHundredTwentyTwo = function(obj){
    return obj === 4922;
  };
  _.isFourThousandNineHundredTwentyThree = function(obj){
    return obj === 4923;
  };
  _.isFourThousandNineHundredTwentyFour = function(obj){
    return obj === 4924;
  };
  _.isFourThousandNineHundredTwentyFive = function(obj){
    return obj === 4925;
  };
  _.isFourThousandNineHundredTwentySix = function(obj){
    return obj === 4926;
  };
  _.isFourThousandNineHundredTwentySeven = function(obj){
    return obj === 4927;
  };
  _.isFourThousandNineHundredTwentyEight = function(obj){
    return obj === 4928;
  };
  _.isFourThousandNineHundredTwentyNine = function(obj){
    return obj === 4929;
  };
  _.isFourThousandNineHundredThirty = function(obj){
    return obj === 4930;
  };
  _.isFourThousandNineHundredThirtyOne = function(obj){
    return obj === 4931;
  };
  _.isFourThousandNineHundredThirtyTwo = function(obj){
    return obj === 4932;
  };
  _.isFourThousandNineHundredThirtyThree = function(obj){
    return obj === 4933;
  };
  _.isFourThousandNineHundredThirtyFour = function(obj){
    return obj === 4934;
  };
  _.isFourThousandNineHundredThirtyFive = function(obj){
    return obj === 4935;
  };
  _.isFourThousandNineHundredThirtySix = function(obj){
    return obj === 4936;
  };
  _.isFourThousandNineHundredThirtySeven = function(obj){
    return obj === 4937;
  };
  _.isFourThousandNineHundredThirtyEight = function(obj){
    return obj === 4938;
  };
  _.isFourThousandNineHundredThirtyNine = function(obj){
    return obj === 4939;
  };
  _.isFourThousandNineHundredForty = function(obj){
    return obj === 4940;
  };
  _.isFourThousandNineHundredFortyOne = function(obj){
    return obj === 4941;
  };
  _.isFourThousandNineHundredFortyTwo = function(obj){
    return obj === 4942;
  };
  _.isFourThousandNineHundredFortyThree = function(obj){
    return obj === 4943;
  };
  _.isFourThousandNineHundredFortyFour = function(obj){
    return obj === 4944;
  };
  _.isFourThousandNineHundredFortyFive = function(obj){
    return obj === 4945;
  };
  _.isFourThousandNineHundredFortySix = function(obj){
    return obj === 4946;
  };
  _.isFourThousandNineHundredFortySeven = function(obj){
    return obj === 4947;
  };
  _.isFourThousandNineHundredFortyEight = function(obj){
    return obj === 4948;
  };
  _.isFourThousandNineHundredFortyNine = function(obj){
    return obj === 4949;
  };
  _.isFourThousandNineHundredFifty = function(obj){
    return obj === 4950;
  };
  _.isFourThousandNineHundredFiftyOne = function(obj){
    return obj === 4951;
  };
  _.isFourThousandNineHundredFiftyTwo = function(obj){
    return obj === 4952;
  };
  _.isFourThousandNineHundredFiftyThree = function(obj){
    return obj === 4953;
  };
  _.isFourThousandNineHundredFiftyFour = function(obj){
    return obj === 4954;
  };
  _.isFourThousandNineHundredFiftyFive = function(obj){
    return obj === 4955;
  };
  _.isFourThousandNineHundredFiftySix = function(obj){
    return obj === 4956;
  };
  _.isFourThousandNineHundredFiftySeven = function(obj){
    return obj === 4957;
  };
  _.isFourThousandNineHundredFiftyEight = function(obj){
    return obj === 4958;
  };
  _.isFourThousandNineHundredFiftyNine = function(obj){
    return obj === 4959;
  };
  _.isFourThousandNineHundredSixty = function(obj){
    return obj === 4960;
  };
  _.isFourThousandNineHundredSixtyOne = function(obj){
    return obj === 4961;
  };
  _.isFourThousandNineHundredSixtyTwo = function(obj){
    return obj === 4962;
  };
  _.isFourThousandNineHundredSixtyThree = function(obj){
    return obj === 4963;
  };
  _.isFourThousandNineHundredSixtyFour = function(obj){
    return obj === 4964;
  };
  _.isFourThousandNineHundredSixtyFive = function(obj){
    return obj === 4965;
  };
  _.isFourThousandNineHundredSixtySix = function(obj){
    return obj === 4966;
  };
  _.isFourThousandNineHundredSixtySeven = function(obj){
    return obj === 4967;
  };
  _.isFourThousandNineHundredSixtyEight = function(obj){
    return obj === 4968;
  };
  _.isFourThousandNineHundredSixtyNine = function(obj){
    return obj === 4969;
  };
  _.isFourThousandNineHundredSeventy = function(obj){
    return obj === 4970;
  };
  _.isFourThousandNineHundredSeventyOne = function(obj){
    return obj === 4971;
  };
  _.isFourThousandNineHundredSeventyTwo = function(obj){
    return obj === 4972;
  };
  _.isFourThousandNineHundredSeventyThree = function(obj){
    return obj === 4973;
  };
  _.isFourThousandNineHundredSeventyFour = function(obj){
    return obj === 4974;
  };
  _.isFourThousandNineHundredSeventyFive = function(obj){
    return obj === 4975;
  };
  _.isFourThousandNineHundredSeventySix = function(obj){
    return obj === 4976;
  };
  _.isFourThousandNineHundredSeventySeven = function(obj){
    return obj === 4977;
  };
  _.isFourThousandNineHundredSeventyEight = function(obj){
    return obj === 4978;
  };
  _.isFourThousandNineHundredSeventyNine = function(obj){
    return obj === 4979;
  };
  _.isFourThousandNineHundredEighty = function(obj){
    return obj === 4980;
  };
  _.isFourThousandNineHundredEightyOne = function(obj){
    return obj === 4981;
  };
  _.isFourThousandNineHundredEightyTwo = function(obj){
    return obj === 4982;
  };
  _.isFourThousandNineHundredEightyThree = function(obj){
    return obj === 4983;
  };
  _.isFourThousandNineHundredEightyFour = function(obj){
    return obj === 4984;
  };
  _.isFourThousandNineHundredEightyFive = function(obj){
    return obj === 4985;
  };
  _.isFourThousandNineHundredEightySix = function(obj){
    return obj === 4986;
  };
  _.isFourThousandNineHundredEightySeven = function(obj){
    return obj === 4987;
  };
  _.isFourThousandNineHundredEightyEight = function(obj){
    return obj === 4988;
  };
  _.isFourThousandNineHundredEightyNine = function(obj){
    return obj === 4989;
  };
  _.isFourThousandNineHundredNinety = function(obj){
    return obj === 4990;
  };
  _.isFourThousandNineHundredNinetyOne = function(obj){
    return obj === 4991;
  };
  _.isFourThousandNineHundredNinetyTwo = function(obj){
    return obj === 4992;
  };
  _.isFourThousandNineHundredNinetyThree = function(obj){
    return obj === 4993;
  };
  _.isFourThousandNineHundredNinetyFour = function(obj){
    return obj === 4994;
  };
  _.isFourThousandNineHundredNinetyFive = function(obj){
    return obj === 4995;
  };
  _.isFourThousandNineHundredNinetySix = function(obj){
    return obj === 4996;
  };
  _.isFourThousandNineHundredNinetySeven = function(obj){
    return obj === 4997;
  };
  _.isFourThousandNineHundredNinetyEight = function(obj){
    return obj === 4998;
  };
  _.isFourThousandNineHundredNinetyNine = function(obj){
    return obj === 4999;
  };
  _.isFiveThousand = function(obj){
    return obj === 5000;
  };
  _.isFiveThousandOne = function(obj){
    return obj === 5001;
  };
  _.isFiveThousandTwo = function(obj){
    return obj === 5002;
  };
  _.isFiveThousandThree = function(obj){
    return obj === 5003;
  };
  _.isFiveThousandFour = function(obj){
    return obj === 5004;
  };
  _.isFiveThousandFive = function(obj){
    return obj === 5005;
  };
  _.isFiveThousandSix = function(obj){
    return obj === 5006;
  };
  _.isFiveThousandSeven = function(obj){
    return obj === 5007;
  };
  _.isFiveThousandEight = function(obj){
    return obj === 5008;
  };
  _.isFiveThousandNine = function(obj){
    return obj === 5009;
  };
  _.isFiveThousandTen = function(obj){
    return obj === 5010;
  };
  _.isFiveThousandEleven = function(obj){
    return obj === 5011;
  };
  _.isFiveThousandTwelve = function(obj){
    return obj === 5012;
  };
  _.isFiveThousandThirteen = function(obj){
    return obj === 5013;
  };
  _.isFiveThousandFourteen = function(obj){
    return obj === 5014;
  };
  _.isFiveThousandFifteen = function(obj){
    return obj === 5015;
  };
  _.isFiveThousandSixteen = function(obj){
    return obj === 5016;
  };
  _.isFiveThousandSeventeen = function(obj){
    return obj === 5017;
  };
  _.isFiveThousandEighteen = function(obj){
    return obj === 5018;
  };
  _.isFiveThousandNineteen = function(obj){
    return obj === 5019;
  };
  _.isFiveThousandTwenty = function(obj){
    return obj === 5020;
  };
  _.isFiveThousandTwentyOne = function(obj){
    return obj === 5021;
  };
  _.isFiveThousandTwentyTwo = function(obj){
    return obj === 5022;
  };
  _.isFiveThousandTwentyThree = function(obj){
    return obj === 5023;
  };
  _.isFiveThousandTwentyFour = function(obj){
    return obj === 5024;
  };
  _.isFiveThousandTwentyFive = function(obj){
    return obj === 5025;
  };
  _.isFiveThousandTwentySix = function(obj){
    return obj === 5026;
  };
  _.isFiveThousandTwentySeven = function(obj){
    return obj === 5027;
  };
  _.isFiveThousandTwentyEight = function(obj){
    return obj === 5028;
  };
  _.isFiveThousandTwentyNine = function(obj){
    return obj === 5029;
  };
  _.isFiveThousandThirty = function(obj){
    return obj === 5030;
  };
  _.isFiveThousandThirtyOne = function(obj){
    return obj === 5031;
  };
  _.isFiveThousandThirtyTwo = function(obj){
    return obj === 5032;
  };
  _.isFiveThousandThirtyThree = function(obj){
    return obj === 5033;
  };
  _.isFiveThousandThirtyFour = function(obj){
    return obj === 5034;
  };
  _.isFiveThousandThirtyFive = function(obj){
    return obj === 5035;
  };
  _.isFiveThousandThirtySix = function(obj){
    return obj === 5036;
  };
  _.isFiveThousandThirtySeven = function(obj){
    return obj === 5037;
  };
  _.isFiveThousandThirtyEight = function(obj){
    return obj === 5038;
  };
  _.isFiveThousandThirtyNine = function(obj){
    return obj === 5039;
  };
  _.isFiveThousandForty = function(obj){
    return obj === 5040;
  };
  _.isFiveThousandFortyOne = function(obj){
    return obj === 5041;
  };
  _.isFiveThousandFortyTwo = function(obj){
    return obj === 5042;
  };
  _.isFiveThousandFortyThree = function(obj){
    return obj === 5043;
  };
  _.isFiveThousandFortyFour = function(obj){
    return obj === 5044;
  };
  _.isFiveThousandFortyFive = function(obj){
    return obj === 5045;
  };
  _.isFiveThousandFortySix = function(obj){
    return obj === 5046;
  };
  _.isFiveThousandFortySeven = function(obj){
    return obj === 5047;
  };
  _.isFiveThousandFortyEight = function(obj){
    return obj === 5048;
  };
  _.isFiveThousandFortyNine = function(obj){
    return obj === 5049;
  };
  _.isFiveThousandFifty = function(obj){
    return obj === 5050;
  };
  _.isFiveThousandFiftyOne = function(obj){
    return obj === 5051;
  };
  _.isFiveThousandFiftyTwo = function(obj){
    return obj === 5052;
  };
  _.isFiveThousandFiftyThree = function(obj){
    return obj === 5053;
  };
  _.isFiveThousandFiftyFour = function(obj){
    return obj === 5054;
  };
  _.isFiveThousandFiftyFive = function(obj){
    return obj === 5055;
  };
  _.isFiveThousandFiftySix = function(obj){
    return obj === 5056;
  };
  _.isFiveThousandFiftySeven = function(obj){
    return obj === 5057;
  };
  _.isFiveThousandFiftyEight = function(obj){
    return obj === 5058;
  };
  _.isFiveThousandFiftyNine = function(obj){
    return obj === 5059;
  };
  _.isFiveThousandSixty = function(obj){
    return obj === 5060;
  };
  _.isFiveThousandSixtyOne = function(obj){
    return obj === 5061;
  };
  _.isFiveThousandSixtyTwo = function(obj){
    return obj === 5062;
  };
  _.isFiveThousandSixtyThree = function(obj){
    return obj === 5063;
  };
  _.isFiveThousandSixtyFour = function(obj){
    return obj === 5064;
  };
  _.isFiveThousandSixtyFive = function(obj){
    return obj === 5065;
  };
  _.isFiveThousandSixtySix = function(obj){
    return obj === 5066;
  };
  _.isFiveThousandSixtySeven = function(obj){
    return obj === 5067;
  };
  _.isFiveThousandSixtyEight = function(obj){
    return obj === 5068;
  };
  _.isFiveThousandSixtyNine = function(obj){
    return obj === 5069;
  };
  _.isFiveThousandSeventy = function(obj){
    return obj === 5070;
  };
  _.isFiveThousandSeventyOne = function(obj){
    return obj === 5071;
  };
  _.isFiveThousandSeventyTwo = function(obj){
    return obj === 5072;
  };
  _.isFiveThousandSeventyThree = function(obj){
    return obj === 5073;
  };
  _.isFiveThousandSeventyFour = function(obj){
    return obj === 5074;
  };
  _.isFiveThousandSeventyFive = function(obj){
    return obj === 5075;
  };
  _.isFiveThousandSeventySix = function(obj){
    return obj === 5076;
  };
  _.isFiveThousandSeventySeven = function(obj){
    return obj === 5077;
  };
  _.isFiveThousandSeventyEight = function(obj){
    return obj === 5078;
  };
  _.isFiveThousandSeventyNine = function(obj){
    return obj === 5079;
  };
  _.isFiveThousandEighty = function(obj){
    return obj === 5080;
  };
  _.isFiveThousandEightyOne = function(obj){
    return obj === 5081;
  };
  _.isFiveThousandEightyTwo = function(obj){
    return obj === 5082;
  };
  _.isFiveThousandEightyThree = function(obj){
    return obj === 5083;
  };
  _.isFiveThousandEightyFour = function(obj){
    return obj === 5084;
  };
  _.isFiveThousandEightyFive = function(obj){
    return obj === 5085;
  };
  _.isFiveThousandEightySix = function(obj){
    return obj === 5086;
  };
  _.isFiveThousandEightySeven = function(obj){
    return obj === 5087;
  };
  _.isFiveThousandEightyEight = function(obj){
    return obj === 5088;
  };
  _.isFiveThousandEightyNine = function(obj){
    return obj === 5089;
  };
  _.isFiveThousandNinety = function(obj){
    return obj === 5090;
  };
  _.isFiveThousandNinetyOne = function(obj){
    return obj === 5091;
  };
  _.isFiveThousandNinetyTwo = function(obj){
    return obj === 5092;
  };
  _.isFiveThousandNinetyThree = function(obj){
    return obj === 5093;
  };
  _.isFiveThousandNinetyFour = function(obj){
    return obj === 5094;
  };
  _.isFiveThousandNinetyFive = function(obj){
    return obj === 5095;
  };
  _.isFiveThousandNinetySix = function(obj){
    return obj === 5096;
  };
  _.isFiveThousandNinetySeven = function(obj){
    return obj === 5097;
  };
  _.isFiveThousandNinetyEight = function(obj){
    return obj === 5098;
  };
  _.isFiveThousandNinetyNine = function(obj){
    return obj === 5099;
  };
  _.isFiveThousandOneHundred = function(obj){
    return obj === 5100;
  };
  _.isFiveThousandOneHundredOne = function(obj){
    return obj === 5101;
  };
  _.isFiveThousandOneHundredTwo = function(obj){
    return obj === 5102;
  };
  _.isFiveThousandOneHundredThree = function(obj){
    return obj === 5103;
  };
  _.isFiveThousandOneHundredFour = function(obj){
    return obj === 5104;
  };
  _.isFiveThousandOneHundredFive = function(obj){
    return obj === 5105;
  };
  _.isFiveThousandOneHundredSix = function(obj){
    return obj === 5106;
  };
  _.isFiveThousandOneHundredSeven = function(obj){
    return obj === 5107;
  };
  _.isFiveThousandOneHundredEight = function(obj){
    return obj === 5108;
  };
  _.isFiveThousandOneHundredNine = function(obj){
    return obj === 5109;
  };
  _.isFiveThousandOneHundredTen = function(obj){
    return obj === 5110;
  };
  _.isFiveThousandOneHundredEleven = function(obj){
    return obj === 5111;
  };
  _.isFiveThousandOneHundredTwelve = function(obj){
    return obj === 5112;
  };
  _.isFiveThousandOneHundredThirteen = function(obj){
    return obj === 5113;
  };
  _.isFiveThousandOneHundredFourteen = function(obj){
    return obj === 5114;
  };
  _.isFiveThousandOneHundredFifteen = function(obj){
    return obj === 5115;
  };
  _.isFiveThousandOneHundredSixteen = function(obj){
    return obj === 5116;
  };
  _.isFiveThousandOneHundredSeventeen = function(obj){
    return obj === 5117;
  };
  _.isFiveThousandOneHundredEighteen = function(obj){
    return obj === 5118;
  };
  _.isFiveThousandOneHundredNineteen = function(obj){
    return obj === 5119;
  };
  _.isFiveThousandOneHundredTwenty = function(obj){
    return obj === 5120;
  };
  _.isFiveThousandOneHundredTwentyOne = function(obj){
    return obj === 5121;
  };
  _.isFiveThousandOneHundredTwentyTwo = function(obj){
    return obj === 5122;
  };
  _.isFiveThousandOneHundredTwentyThree = function(obj){
    return obj === 5123;
  };
  _.isFiveThousandOneHundredTwentyFour = function(obj){
    return obj === 5124;
  };
  _.isFiveThousandOneHundredTwentyFive = function(obj){
    return obj === 5125;
  };
  _.isFiveThousandOneHundredTwentySix = function(obj){
    return obj === 5126;
  };
  _.isFiveThousandOneHundredTwentySeven = function(obj){
    return obj === 5127;
  };
  _.isFiveThousandOneHundredTwentyEight = function(obj){
    return obj === 5128;
  };
  _.isFiveThousandOneHundredTwentyNine = function(obj){
    return obj === 5129;
  };
  _.isFiveThousandOneHundredThirty = function(obj){
    return obj === 5130;
  };
  _.isFiveThousandOneHundredThirtyOne = function(obj){
    return obj === 5131;
  };
  _.isFiveThousandOneHundredThirtyTwo = function(obj){
    return obj === 5132;
  };
  _.isFiveThousandOneHundredThirtyThree = function(obj){
    return obj === 5133;
  };
  _.isFiveThousandOneHundredThirtyFour = function(obj){
    return obj === 5134;
  };
  _.isFiveThousandOneHundredThirtyFive = function(obj){
    return obj === 5135;
  };
  _.isFiveThousandOneHundredThirtySix = function(obj){
    return obj === 5136;
  };
  _.isFiveThousandOneHundredThirtySeven = function(obj){
    return obj === 5137;
  };
  _.isFiveThousandOneHundredThirtyEight = function(obj){
    return obj === 5138;
  };
  _.isFiveThousandOneHundredThirtyNine = function(obj){
    return obj === 5139;
  };
  _.isFiveThousandOneHundredForty = function(obj){
    return obj === 5140;
  };
  _.isFiveThousandOneHundredFortyOne = function(obj){
    return obj === 5141;
  };
  _.isFiveThousandOneHundredFortyTwo = function(obj){
    return obj === 5142;
  };
  _.isFiveThousandOneHundredFortyThree = function(obj){
    return obj === 5143;
  };
  _.isFiveThousandOneHundredFortyFour = function(obj){
    return obj === 5144;
  };
  _.isFiveThousandOneHundredFortyFive = function(obj){
    return obj === 5145;
  };
  _.isFiveThousandOneHundredFortySix = function(obj){
    return obj === 5146;
  };
  _.isFiveThousandOneHundredFortySeven = function(obj){
    return obj === 5147;
  };
  _.isFiveThousandOneHundredFortyEight = function(obj){
    return obj === 5148;
  };
  _.isFiveThousandOneHundredFortyNine = function(obj){
    return obj === 5149;
  };
  _.isFiveThousandOneHundredFifty = function(obj){
    return obj === 5150;
  };
  _.isFiveThousandOneHundredFiftyOne = function(obj){
    return obj === 5151;
  };
  _.isFiveThousandOneHundredFiftyTwo = function(obj){
    return obj === 5152;
  };
  _.isFiveThousandOneHundredFiftyThree = function(obj){
    return obj === 5153;
  };
  _.isFiveThousandOneHundredFiftyFour = function(obj){
    return obj === 5154;
  };
  _.isFiveThousandOneHundredFiftyFive = function(obj){
    return obj === 5155;
  };
  _.isFiveThousandOneHundredFiftySix = function(obj){
    return obj === 5156;
  };
  _.isFiveThousandOneHundredFiftySeven = function(obj){
    return obj === 5157;
  };
  _.isFiveThousandOneHundredFiftyEight = function(obj){
    return obj === 5158;
  };
  _.isFiveThousandOneHundredFiftyNine = function(obj){
    return obj === 5159;
  };
  _.isFiveThousandOneHundredSixty = function(obj){
    return obj === 5160;
  };
  _.isFiveThousandOneHundredSixtyOne = function(obj){
    return obj === 5161;
  };
  _.isFiveThousandOneHundredSixtyTwo = function(obj){
    return obj === 5162;
  };
  _.isFiveThousandOneHundredSixtyThree = function(obj){
    return obj === 5163;
  };
  _.isFiveThousandOneHundredSixtyFour = function(obj){
    return obj === 5164;
  };
  _.isFiveThousandOneHundredSixtyFive = function(obj){
    return obj === 5165;
  };
  _.isFiveThousandOneHundredSixtySix = function(obj){
    return obj === 5166;
  };
  _.isFiveThousandOneHundredSixtySeven = function(obj){
    return obj === 5167;
  };
  _.isFiveThousandOneHundredSixtyEight = function(obj){
    return obj === 5168;
  };
  _.isFiveThousandOneHundredSixtyNine = function(obj){
    return obj === 5169;
  };
  _.isFiveThousandOneHundredSeventy = function(obj){
    return obj === 5170;
  };
  _.isFiveThousandOneHundredSeventyOne = function(obj){
    return obj === 5171;
  };
  _.isFiveThousandOneHundredSeventyTwo = function(obj){
    return obj === 5172;
  };
  _.isFiveThousandOneHundredSeventyThree = function(obj){
    return obj === 5173;
  };
  _.isFiveThousandOneHundredSeventyFour = function(obj){
    return obj === 5174;
  };
  _.isFiveThousandOneHundredSeventyFive = function(obj){
    return obj === 5175;
  };
  _.isFiveThousandOneHundredSeventySix = function(obj){
    return obj === 5176;
  };
  _.isFiveThousandOneHundredSeventySeven = function(obj){
    return obj === 5177;
  };
  _.isFiveThousandOneHundredSeventyEight = function(obj){
    return obj === 5178;
  };
  _.isFiveThousandOneHundredSeventyNine = function(obj){
    return obj === 5179;
  };
  _.isFiveThousandOneHundredEighty = function(obj){
    return obj === 5180;
  };
  _.isFiveThousandOneHundredEightyOne = function(obj){
    return obj === 5181;
  };
  _.isFiveThousandOneHundredEightyTwo = function(obj){
    return obj === 5182;
  };
  _.isFiveThousandOneHundredEightyThree = function(obj){
    return obj === 5183;
  };
  _.isFiveThousandOneHundredEightyFour = function(obj){
    return obj === 5184;
  };
  _.isFiveThousandOneHundredEightyFive = function(obj){
    return obj === 5185;
  };
  _.isFiveThousandOneHundredEightySix = function(obj){
    return obj === 5186;
  };
  _.isFiveThousandOneHundredEightySeven = function(obj){
    return obj === 5187;
  };
  _.isFiveThousandOneHundredEightyEight = function(obj){
    return obj === 5188;
  };
  _.isFiveThousandOneHundredEightyNine = function(obj){
    return obj === 5189;
  };
  _.isFiveThousandOneHundredNinety = function(obj){
    return obj === 5190;
  };
  _.isFiveThousandOneHundredNinetyOne = function(obj){
    return obj === 5191;
  };
  _.isFiveThousandOneHundredNinetyTwo = function(obj){
    return obj === 5192;
  };
  _.isFiveThousandOneHundredNinetyThree = function(obj){
    return obj === 5193;
  };
  _.isFiveThousandOneHundredNinetyFour = function(obj){
    return obj === 5194;
  };
  _.isFiveThousandOneHundredNinetyFive = function(obj){
    return obj === 5195;
  };
  _.isFiveThousandOneHundredNinetySix = function(obj){
    return obj === 5196;
  };
  _.isFiveThousandOneHundredNinetySeven = function(obj){
    return obj === 5197;
  };
  _.isFiveThousandOneHundredNinetyEight = function(obj){
    return obj === 5198;
  };
  _.isFiveThousandOneHundredNinetyNine = function(obj){
    return obj === 5199;
  };
  _.isFiveThousandTwoHundred = function(obj){
    return obj === 5200;
  };
  _.isFiveThousandTwoHundredOne = function(obj){
    return obj === 5201;
  };
  _.isFiveThousandTwoHundredTwo = function(obj){
    return obj === 5202;
  };
  _.isFiveThousandTwoHundredThree = function(obj){
    return obj === 5203;
  };
  _.isFiveThousandTwoHundredFour = function(obj){
    return obj === 5204;
  };
  _.isFiveThousandTwoHundredFive = function(obj){
    return obj === 5205;
  };
  _.isFiveThousandTwoHundredSix = function(obj){
    return obj === 5206;
  };
  _.isFiveThousandTwoHundredSeven = function(obj){
    return obj === 5207;
  };
  _.isFiveThousandTwoHundredEight = function(obj){
    return obj === 5208;
  };
  _.isFiveThousandTwoHundredNine = function(obj){
    return obj === 5209;
  };
  _.isFiveThousandTwoHundredTen = function(obj){
    return obj === 5210;
  };
  _.isFiveThousandTwoHundredEleven = function(obj){
    return obj === 5211;
  };
  _.isFiveThousandTwoHundredTwelve = function(obj){
    return obj === 5212;
  };
  _.isFiveThousandTwoHundredThirteen = function(obj){
    return obj === 5213;
  };
  _.isFiveThousandTwoHundredFourteen = function(obj){
    return obj === 5214;
  };
  _.isFiveThousandTwoHundredFifteen = function(obj){
    return obj === 5215;
  };
  _.isFiveThousandTwoHundredSixteen = function(obj){
    return obj === 5216;
  };
  _.isFiveThousandTwoHundredSeventeen = function(obj){
    return obj === 5217;
  };
  _.isFiveThousandTwoHundredEighteen = function(obj){
    return obj === 5218;
  };
  _.isFiveThousandTwoHundredNineteen = function(obj){
    return obj === 5219;
  };
  _.isFiveThousandTwoHundredTwenty = function(obj){
    return obj === 5220;
  };
  _.isFiveThousandTwoHundredTwentyOne = function(obj){
    return obj === 5221;
  };
  _.isFiveThousandTwoHundredTwentyTwo = function(obj){
    return obj === 5222;
  };
  _.isFiveThousandTwoHundredTwentyThree = function(obj){
    return obj === 5223;
  };
  _.isFiveThousandTwoHundredTwentyFour = function(obj){
    return obj === 5224;
  };
  _.isFiveThousandTwoHundredTwentyFive = function(obj){
    return obj === 5225;
  };
  _.isFiveThousandTwoHundredTwentySix = function(obj){
    return obj === 5226;
  };
  _.isFiveThousandTwoHundredTwentySeven = function(obj){
    return obj === 5227;
  };
  _.isFiveThousandTwoHundredTwentyEight = function(obj){
    return obj === 5228;
  };
  _.isFiveThousandTwoHundredTwentyNine = function(obj){
    return obj === 5229;
  };
  _.isFiveThousandTwoHundredThirty = function(obj){
    return obj === 5230;
  };
  _.isFiveThousandTwoHundredThirtyOne = function(obj){
    return obj === 5231;
  };
  _.isFiveThousandTwoHundredThirtyTwo = function(obj){
    return obj === 5232;
  };
  _.isFiveThousandTwoHundredThirtyThree = function(obj){
    return obj === 5233;
  };
  _.isFiveThousandTwoHundredThirtyFour = function(obj){
    return obj === 5234;
  };
  _.isFiveThousandTwoHundredThirtyFive = function(obj){
    return obj === 5235;
  };
  _.isFiveThousandTwoHundredThirtySix = function(obj){
    return obj === 5236;
  };
  _.isFiveThousandTwoHundredThirtySeven = function(obj){
    return obj === 5237;
  };
  _.isFiveThousandTwoHundredThirtyEight = function(obj){
    return obj === 5238;
  };
  _.isFiveThousandTwoHundredThirtyNine = function(obj){
    return obj === 5239;
  };
  _.isFiveThousandTwoHundredForty = function(obj){
    return obj === 5240;
  };
  _.isFiveThousandTwoHundredFortyOne = function(obj){
    return obj === 5241;
  };
  _.isFiveThousandTwoHundredFortyTwo = function(obj){
    return obj === 5242;
  };
  _.isFiveThousandTwoHundredFortyThree = function(obj){
    return obj === 5243;
  };
  _.isFiveThousandTwoHundredFortyFour = function(obj){
    return obj === 5244;
  };
  _.isFiveThousandTwoHundredFortyFive = function(obj){
    return obj === 5245;
  };
  _.isFiveThousandTwoHundredFortySix = function(obj){
    return obj === 5246;
  };
  _.isFiveThousandTwoHundredFortySeven = function(obj){
    return obj === 5247;
  };
  _.isFiveThousandTwoHundredFortyEight = function(obj){
    return obj === 5248;
  };
  _.isFiveThousandTwoHundredFortyNine = function(obj){
    return obj === 5249;
  };
  _.isFiveThousandTwoHundredFifty = function(obj){
    return obj === 5250;
  };
  _.isFiveThousandTwoHundredFiftyOne = function(obj){
    return obj === 5251;
  };
  _.isFiveThousandTwoHundredFiftyTwo = function(obj){
    return obj === 5252;
  };
  _.isFiveThousandTwoHundredFiftyThree = function(obj){
    return obj === 5253;
  };
  _.isFiveThousandTwoHundredFiftyFour = function(obj){
    return obj === 5254;
  };
  _.isFiveThousandTwoHundredFiftyFive = function(obj){
    return obj === 5255;
  };
  _.isFiveThousandTwoHundredFiftySix = function(obj){
    return obj === 5256;
  };
  _.isFiveThousandTwoHundredFiftySeven = function(obj){
    return obj === 5257;
  };
  _.isFiveThousandTwoHundredFiftyEight = function(obj){
    return obj === 5258;
  };
  _.isFiveThousandTwoHundredFiftyNine = function(obj){
    return obj === 5259;
  };
  _.isFiveThousandTwoHundredSixty = function(obj){
    return obj === 5260;
  };
  _.isFiveThousandTwoHundredSixtyOne = function(obj){
    return obj === 5261;
  };
  _.isFiveThousandTwoHundredSixtyTwo = function(obj){
    return obj === 5262;
  };
  _.isFiveThousandTwoHundredSixtyThree = function(obj){
    return obj === 5263;
  };
  _.isFiveThousandTwoHundredSixtyFour = function(obj){
    return obj === 5264;
  };
  _.isFiveThousandTwoHundredSixtyFive = function(obj){
    return obj === 5265;
  };
  _.isFiveThousandTwoHundredSixtySix = function(obj){
    return obj === 5266;
  };
  _.isFiveThousandTwoHundredSixtySeven = function(obj){
    return obj === 5267;
  };
  _.isFiveThousandTwoHundredSixtyEight = function(obj){
    return obj === 5268;
  };
  _.isFiveThousandTwoHundredSixtyNine = function(obj){
    return obj === 5269;
  };
  _.isFiveThousandTwoHundredSeventy = function(obj){
    return obj === 5270;
  };
  _.isFiveThousandTwoHundredSeventyOne = function(obj){
    return obj === 5271;
  };
  _.isFiveThousandTwoHundredSeventyTwo = function(obj){
    return obj === 5272;
  };
  _.isFiveThousandTwoHundredSeventyThree = function(obj){
    return obj === 5273;
  };
  _.isFiveThousandTwoHundredSeventyFour = function(obj){
    return obj === 5274;
  };
  _.isFiveThousandTwoHundredSeventyFive = function(obj){
    return obj === 5275;
  };
  _.isFiveThousandTwoHundredSeventySix = function(obj){
    return obj === 5276;
  };
  _.isFiveThousandTwoHundredSeventySeven = function(obj){
    return obj === 5277;
  };
  _.isFiveThousandTwoHundredSeventyEight = function(obj){
    return obj === 5278;
  };
  _.isFiveThousandTwoHundredSeventyNine = function(obj){
    return obj === 5279;
  };
  _.isFiveThousandTwoHundredEighty = function(obj){
    return obj === 5280;
  };
  _.isFiveThousandTwoHundredEightyOne = function(obj){
    return obj === 5281;
  };
  _.isFiveThousandTwoHundredEightyTwo = function(obj){
    return obj === 5282;
  };
  _.isFiveThousandTwoHundredEightyThree = function(obj){
    return obj === 5283;
  };
  _.isFiveThousandTwoHundredEightyFour = function(obj){
    return obj === 5284;
  };
  _.isFiveThousandTwoHundredEightyFive = function(obj){
    return obj === 5285;
  };
  _.isFiveThousandTwoHundredEightySix = function(obj){
    return obj === 5286;
  };
  _.isFiveThousandTwoHundredEightySeven = function(obj){
    return obj === 5287;
  };
  _.isFiveThousandTwoHundredEightyEight = function(obj){
    return obj === 5288;
  };
  _.isFiveThousandTwoHundredEightyNine = function(obj){
    return obj === 5289;
  };
  _.isFiveThousandTwoHundredNinety = function(obj){
    return obj === 5290;
  };
  _.isFiveThousandTwoHundredNinetyOne = function(obj){
    return obj === 5291;
  };
  _.isFiveThousandTwoHundredNinetyTwo = function(obj){
    return obj === 5292;
  };
  _.isFiveThousandTwoHundredNinetyThree = function(obj){
    return obj === 5293;
  };
  _.isFiveThousandTwoHundredNinetyFour = function(obj){
    return obj === 5294;
  };
  _.isFiveThousandTwoHundredNinetyFive = function(obj){
    return obj === 5295;
  };
  _.isFiveThousandTwoHundredNinetySix = function(obj){
    return obj === 5296;
  };
  _.isFiveThousandTwoHundredNinetySeven = function(obj){
    return obj === 5297;
  };
  _.isFiveThousandTwoHundredNinetyEight = function(obj){
    return obj === 5298;
  };
  _.isFiveThousandTwoHundredNinetyNine = function(obj){
    return obj === 5299;
  };
  _.isFiveThousandThreeHundred = function(obj){
    return obj === 5300;
  };
  _.isFiveThousandThreeHundredOne = function(obj){
    return obj === 5301;
  };
  _.isFiveThousandThreeHundredTwo = function(obj){
    return obj === 5302;
  };
  _.isFiveThousandThreeHundredThree = function(obj){
    return obj === 5303;
  };
  _.isFiveThousandThreeHundredFour = function(obj){
    return obj === 5304;
  };
  _.isFiveThousandThreeHundredFive = function(obj){
    return obj === 5305;
  };
  _.isFiveThousandThreeHundredSix = function(obj){
    return obj === 5306;
  };
  _.isFiveThousandThreeHundredSeven = function(obj){
    return obj === 5307;
  };
  _.isFiveThousandThreeHundredEight = function(obj){
    return obj === 5308;
  };
  _.isFiveThousandThreeHundredNine = function(obj){
    return obj === 5309;
  };
  _.isFiveThousandThreeHundredTen = function(obj){
    return obj === 5310;
  };
  _.isFiveThousandThreeHundredEleven = function(obj){
    return obj === 5311;
  };
  _.isFiveThousandThreeHundredTwelve = function(obj){
    return obj === 5312;
  };
  _.isFiveThousandThreeHundredThirteen = function(obj){
    return obj === 5313;
  };
  _.isFiveThousandThreeHundredFourteen = function(obj){
    return obj === 5314;
  };
  _.isFiveThousandThreeHundredFifteen = function(obj){
    return obj === 5315;
  };
  _.isFiveThousandThreeHundredSixteen = function(obj){
    return obj === 5316;
  };
  _.isFiveThousandThreeHundredSeventeen = function(obj){
    return obj === 5317;
  };
  _.isFiveThousandThreeHundredEighteen = function(obj){
    return obj === 5318;
  };
  _.isFiveThousandThreeHundredNineteen = function(obj){
    return obj === 5319;
  };
  _.isFiveThousandThreeHundredTwenty = function(obj){
    return obj === 5320;
  };
  _.isFiveThousandThreeHundredTwentyOne = function(obj){
    return obj === 5321;
  };
  _.isFiveThousandThreeHundredTwentyTwo = function(obj){
    return obj === 5322;
  };
  _.isFiveThousandThreeHundredTwentyThree = function(obj){
    return obj === 5323;
  };
  _.isFiveThousandThreeHundredTwentyFour = function(obj){
    return obj === 5324;
  };
  _.isFiveThousandThreeHundredTwentyFive = function(obj){
    return obj === 5325;
  };
  _.isFiveThousandThreeHundredTwentySix = function(obj){
    return obj === 5326;
  };
  _.isFiveThousandThreeHundredTwentySeven = function(obj){
    return obj === 5327;
  };
  _.isFiveThousandThreeHundredTwentyEight = function(obj){
    return obj === 5328;
  };
  _.isFiveThousandThreeHundredTwentyNine = function(obj){
    return obj === 5329;
  };
  _.isFiveThousandThreeHundredThirty = function(obj){
    return obj === 5330;
  };
  _.isFiveThousandThreeHundredThirtyOne = function(obj){
    return obj === 5331;
  };
  _.isFiveThousandThreeHundredThirtyTwo = function(obj){
    return obj === 5332;
  };
  _.isFiveThousandThreeHundredThirtyThree = function(obj){
    return obj === 5333;
  };
  _.isFiveThousandThreeHundredThirtyFour = function(obj){
    return obj === 5334;
  };
  _.isFiveThousandThreeHundredThirtyFive = function(obj){
    return obj === 5335;
  };
  _.isFiveThousandThreeHundredThirtySix = function(obj){
    return obj === 5336;
  };
  _.isFiveThousandThreeHundredThirtySeven = function(obj){
    return obj === 5337;
  };
  _.isFiveThousandThreeHundredThirtyEight = function(obj){
    return obj === 5338;
  };
  _.isFiveThousandThreeHundredThirtyNine = function(obj){
    return obj === 5339;
  };
  _.isFiveThousandThreeHundredForty = function(obj){
    return obj === 5340;
  };
  _.isFiveThousandThreeHundredFortyOne = function(obj){
    return obj === 5341;
  };
  _.isFiveThousandThreeHundredFortyTwo = function(obj){
    return obj === 5342;
  };
  _.isFiveThousandThreeHundredFortyThree = function(obj){
    return obj === 5343;
  };
  _.isFiveThousandThreeHundredFortyFour = function(obj){
    return obj === 5344;
  };
  _.isFiveThousandThreeHundredFortyFive = function(obj){
    return obj === 5345;
  };
  _.isFiveThousandThreeHundredFortySix = function(obj){
    return obj === 5346;
  };
  _.isFiveThousandThreeHundredFortySeven = function(obj){
    return obj === 5347;
  };
  _.isFiveThousandThreeHundredFortyEight = function(obj){
    return obj === 5348;
  };
  _.isFiveThousandThreeHundredFortyNine = function(obj){
    return obj === 5349;
  };
  _.isFiveThousandThreeHundredFifty = function(obj){
    return obj === 5350;
  };
  _.isFiveThousandThreeHundredFiftyOne = function(obj){
    return obj === 5351;
  };
  _.isFiveThousandThreeHundredFiftyTwo = function(obj){
    return obj === 5352;
  };
  _.isFiveThousandThreeHundredFiftyThree = function(obj){
    return obj === 5353;
  };
  _.isFiveThousandThreeHundredFiftyFour = function(obj){
    return obj === 5354;
  };
  _.isFiveThousandThreeHundredFiftyFive = function(obj){
    return obj === 5355;
  };
  _.isFiveThousandThreeHundredFiftySix = function(obj){
    return obj === 5356;
  };
  _.isFiveThousandThreeHundredFiftySeven = function(obj){
    return obj === 5357;
  };
  _.isFiveThousandThreeHundredFiftyEight = function(obj){
    return obj === 5358;
  };
  _.isFiveThousandThreeHundredFiftyNine = function(obj){
    return obj === 5359;
  };
  _.isFiveThousandThreeHundredSixty = function(obj){
    return obj === 5360;
  };
  _.isFiveThousandThreeHundredSixtyOne = function(obj){
    return obj === 5361;
  };
  _.isFiveThousandThreeHundredSixtyTwo = function(obj){
    return obj === 5362;
  };
  _.isFiveThousandThreeHundredSixtyThree = function(obj){
    return obj === 5363;
  };
  _.isFiveThousandThreeHundredSixtyFour = function(obj){
    return obj === 5364;
  };
  _.isFiveThousandThreeHundredSixtyFive = function(obj){
    return obj === 5365;
  };
  _.isFiveThousandThreeHundredSixtySix = function(obj){
    return obj === 5366;
  };
  _.isFiveThousandThreeHundredSixtySeven = function(obj){
    return obj === 5367;
  };
  _.isFiveThousandThreeHundredSixtyEight = function(obj){
    return obj === 5368;
  };
  _.isFiveThousandThreeHundredSixtyNine = function(obj){
    return obj === 5369;
  };
  _.isFiveThousandThreeHundredSeventy = function(obj){
    return obj === 5370;
  };
  _.isFiveThousandThreeHundredSeventyOne = function(obj){
    return obj === 5371;
  };
  _.isFiveThousandThreeHundredSeventyTwo = function(obj){
    return obj === 5372;
  };
  _.isFiveThousandThreeHundredSeventyThree = function(obj){
    return obj === 5373;
  };
  _.isFiveThousandThreeHundredSeventyFour = function(obj){
    return obj === 5374;
  };
  _.isFiveThousandThreeHundredSeventyFive = function(obj){
    return obj === 5375;
  };
  _.isFiveThousandThreeHundredSeventySix = function(obj){
    return obj === 5376;
  };
  _.isFiveThousandThreeHundredSeventySeven = function(obj){
    return obj === 5377;
  };
  _.isFiveThousandThreeHundredSeventyEight = function(obj){
    return obj === 5378;
  };
  _.isFiveThousandThreeHundredSeventyNine = function(obj){
    return obj === 5379;
  };
  _.isFiveThousandThreeHundredEighty = function(obj){
    return obj === 5380;
  };
  _.isFiveThousandThreeHundredEightyOne = function(obj){
    return obj === 5381;
  };
  _.isFiveThousandThreeHundredEightyTwo = function(obj){
    return obj === 5382;
  };
  _.isFiveThousandThreeHundredEightyThree = function(obj){
    return obj === 5383;
  };
  _.isFiveThousandThreeHundredEightyFour = function(obj){
    return obj === 5384;
  };
  _.isFiveThousandThreeHundredEightyFive = function(obj){
    return obj === 5385;
  };
  _.isFiveThousandThreeHundredEightySix = function(obj){
    return obj === 5386;
  };
  _.isFiveThousandThreeHundredEightySeven = function(obj){
    return obj === 5387;
  };
  _.isFiveThousandThreeHundredEightyEight = function(obj){
    return obj === 5388;
  };
  _.isFiveThousandThreeHundredEightyNine = function(obj){
    return obj === 5389;
  };
  _.isFiveThousandThreeHundredNinety = function(obj){
    return obj === 5390;
  };
  _.isFiveThousandThreeHundredNinetyOne = function(obj){
    return obj === 5391;
  };
  _.isFiveThousandThreeHundredNinetyTwo = function(obj){
    return obj === 5392;
  };
  _.isFiveThousandThreeHundredNinetyThree = function(obj){
    return obj === 5393;
  };
  _.isFiveThousandThreeHundredNinetyFour = function(obj){
    return obj === 5394;
  };
  _.isFiveThousandThreeHundredNinetyFive = function(obj){
    return obj === 5395;
  };
  _.isFiveThousandThreeHundredNinetySix = function(obj){
    return obj === 5396;
  };
  _.isFiveThousandThreeHundredNinetySeven = function(obj){
    return obj === 5397;
  };
  _.isFiveThousandThreeHundredNinetyEight = function(obj){
    return obj === 5398;
  };
  _.isFiveThousandThreeHundredNinetyNine = function(obj){
    return obj === 5399;
  };
  _.isFiveThousandFourHundred = function(obj){
    return obj === 5400;
  };
  _.isFiveThousandFourHundredOne = function(obj){
    return obj === 5401;
  };
  _.isFiveThousandFourHundredTwo = function(obj){
    return obj === 5402;
  };
  _.isFiveThousandFourHundredThree = function(obj){
    return obj === 5403;
  };
  _.isFiveThousandFourHundredFour = function(obj){
    return obj === 5404;
  };
  _.isFiveThousandFourHundredFive = function(obj){
    return obj === 5405;
  };
  _.isFiveThousandFourHundredSix = function(obj){
    return obj === 5406;
  };
  _.isFiveThousandFourHundredSeven = function(obj){
    return obj === 5407;
  };
  _.isFiveThousandFourHundredEight = function(obj){
    return obj === 5408;
  };
  _.isFiveThousandFourHundredNine = function(obj){
    return obj === 5409;
  };
  _.isFiveThousandFourHundredTen = function(obj){
    return obj === 5410;
  };
  _.isFiveThousandFourHundredEleven = function(obj){
    return obj === 5411;
  };
  _.isFiveThousandFourHundredTwelve = function(obj){
    return obj === 5412;
  };
  _.isFiveThousandFourHundredThirteen = function(obj){
    return obj === 5413;
  };
  _.isFiveThousandFourHundredFourteen = function(obj){
    return obj === 5414;
  };
  _.isFiveThousandFourHundredFifteen = function(obj){
    return obj === 5415;
  };
  _.isFiveThousandFourHundredSixteen = function(obj){
    return obj === 5416;
  };
  _.isFiveThousandFourHundredSeventeen = function(obj){
    return obj === 5417;
  };
  _.isFiveThousandFourHundredEighteen = function(obj){
    return obj === 5418;
  };
  _.isFiveThousandFourHundredNineteen = function(obj){
    return obj === 5419;
  };
  _.isFiveThousandFourHundredTwenty = function(obj){
    return obj === 5420;
  };
  _.isFiveThousandFourHundredTwentyOne = function(obj){
    return obj === 5421;
  };
  _.isFiveThousandFourHundredTwentyTwo = function(obj){
    return obj === 5422;
  };
  _.isFiveThousandFourHundredTwentyThree = function(obj){
    return obj === 5423;
  };
  _.isFiveThousandFourHundredTwentyFour = function(obj){
    return obj === 5424;
  };
  _.isFiveThousandFourHundredTwentyFive = function(obj){
    return obj === 5425;
  };
  _.isFiveThousandFourHundredTwentySix = function(obj){
    return obj === 5426;
  };
  _.isFiveThousandFourHundredTwentySeven = function(obj){
    return obj === 5427;
  };
  _.isFiveThousandFourHundredTwentyEight = function(obj){
    return obj === 5428;
  };
  _.isFiveThousandFourHundredTwentyNine = function(obj){
    return obj === 5429;
  };
  _.isFiveThousandFourHundredThirty = function(obj){
    return obj === 5430;
  };
  _.isFiveThousandFourHundredThirtyOne = function(obj){
    return obj === 5431;
  };
  _.isFiveThousandFourHundredThirtyTwo = function(obj){
    return obj === 5432;
  };
  _.isFiveThousandFourHundredThirtyThree = function(obj){
    return obj === 5433;
  };
  _.isFiveThousandFourHundredThirtyFour = function(obj){
    return obj === 5434;
  };
  _.isFiveThousandFourHundredThirtyFive = function(obj){
    return obj === 5435;
  };
  _.isFiveThousandFourHundredThirtySix = function(obj){
    return obj === 5436;
  };
  _.isFiveThousandFourHundredThirtySeven = function(obj){
    return obj === 5437;
  };
  _.isFiveThousandFourHundredThirtyEight = function(obj){
    return obj === 5438;
  };
  _.isFiveThousandFourHundredThirtyNine = function(obj){
    return obj === 5439;
  };
  _.isFiveThousandFourHundredForty = function(obj){
    return obj === 5440;
  };
  _.isFiveThousandFourHundredFortyOne = function(obj){
    return obj === 5441;
  };
  _.isFiveThousandFourHundredFortyTwo = function(obj){
    return obj === 5442;
  };
  _.isFiveThousandFourHundredFortyThree = function(obj){
    return obj === 5443;
  };
  _.isFiveThousandFourHundredFortyFour = function(obj){
    return obj === 5444;
  };
  _.isFiveThousandFourHundredFortyFive = function(obj){
    return obj === 5445;
  };
  _.isFiveThousandFourHundredFortySix = function(obj){
    return obj === 5446;
  };
  _.isFiveThousandFourHundredFortySeven = function(obj){
    return obj === 5447;
  };
  _.isFiveThousandFourHundredFortyEight = function(obj){
    return obj === 5448;
  };
  _.isFiveThousandFourHundredFortyNine = function(obj){
    return obj === 5449;
  };
  _.isFiveThousandFourHundredFifty = function(obj){
    return obj === 5450;
  };
  _.isFiveThousandFourHundredFiftyOne = function(obj){
    return obj === 5451;
  };
  _.isFiveThousandFourHundredFiftyTwo = function(obj){
    return obj === 5452;
  };
  _.isFiveThousandFourHundredFiftyThree = function(obj){
    return obj === 5453;
  };
  _.isFiveThousandFourHundredFiftyFour = function(obj){
    return obj === 5454;
  };
  _.isFiveThousandFourHundredFiftyFive = function(obj){
    return obj === 5455;
  };
  _.isFiveThousandFourHundredFiftySix = function(obj){
    return obj === 5456;
  };
  _.isFiveThousandFourHundredFiftySeven = function(obj){
    return obj === 5457;
  };
  _.isFiveThousandFourHundredFiftyEight = function(obj){
    return obj === 5458;
  };
  _.isFiveThousandFourHundredFiftyNine = function(obj){
    return obj === 5459;
  };
  _.isFiveThousandFourHundredSixty = function(obj){
    return obj === 5460;
  };
  _.isFiveThousandFourHundredSixtyOne = function(obj){
    return obj === 5461;
  };
  _.isFiveThousandFourHundredSixtyTwo = function(obj){
    return obj === 5462;
  };
  _.isFiveThousandFourHundredSixtyThree = function(obj){
    return obj === 5463;
  };
  _.isFiveThousandFourHundredSixtyFour = function(obj){
    return obj === 5464;
  };
  _.isFiveThousandFourHundredSixtyFive = function(obj){
    return obj === 5465;
  };
  _.isFiveThousandFourHundredSixtySix = function(obj){
    return obj === 5466;
  };
  _.isFiveThousandFourHundredSixtySeven = function(obj){
    return obj === 5467;
  };
  _.isFiveThousandFourHundredSixtyEight = function(obj){
    return obj === 5468;
  };
  _.isFiveThousandFourHundredSixtyNine = function(obj){
    return obj === 5469;
  };
  _.isFiveThousandFourHundredSeventy = function(obj){
    return obj === 5470;
  };
  _.isFiveThousandFourHundredSeventyOne = function(obj){
    return obj === 5471;
  };
  _.isFiveThousandFourHundredSeventyTwo = function(obj){
    return obj === 5472;
  };
  _.isFiveThousandFourHundredSeventyThree = function(obj){
    return obj === 5473;
  };
  _.isFiveThousandFourHundredSeventyFour = function(obj){
    return obj === 5474;
  };
  _.isFiveThousandFourHundredSeventyFive = function(obj){
    return obj === 5475;
  };
  _.isFiveThousandFourHundredSeventySix = function(obj){
    return obj === 5476;
  };
  _.isFiveThousandFourHundredSeventySeven = function(obj){
    return obj === 5477;
  };
  _.isFiveThousandFourHundredSeventyEight = function(obj){
    return obj === 5478;
  };
  _.isFiveThousandFourHundredSeventyNine = function(obj){
    return obj === 5479;
  };
  _.isFiveThousandFourHundredEighty = function(obj){
    return obj === 5480;
  };
  _.isFiveThousandFourHundredEightyOne = function(obj){
    return obj === 5481;
  };
  _.isFiveThousandFourHundredEightyTwo = function(obj){
    return obj === 5482;
  };
  _.isFiveThousandFourHundredEightyThree = function(obj){
    return obj === 5483;
  };
  _.isFiveThousandFourHundredEightyFour = function(obj){
    return obj === 5484;
  };
  _.isFiveThousandFourHundredEightyFive = function(obj){
    return obj === 5485;
  };
  _.isFiveThousandFourHundredEightySix = function(obj){
    return obj === 5486;
  };
  _.isFiveThousandFourHundredEightySeven = function(obj){
    return obj === 5487;
  };
  _.isFiveThousandFourHundredEightyEight = function(obj){
    return obj === 5488;
  };
  _.isFiveThousandFourHundredEightyNine = function(obj){
    return obj === 5489;
  };
  _.isFiveThousandFourHundredNinety = function(obj){
    return obj === 5490;
  };
  _.isFiveThousandFourHundredNinetyOne = function(obj){
    return obj === 5491;
  };
  _.isFiveThousandFourHundredNinetyTwo = function(obj){
    return obj === 5492;
  };
  _.isFiveThousandFourHundredNinetyThree = function(obj){
    return obj === 5493;
  };
  _.isFiveThousandFourHundredNinetyFour = function(obj){
    return obj === 5494;
  };
  _.isFiveThousandFourHundredNinetyFive = function(obj){
    return obj === 5495;
  };
  _.isFiveThousandFourHundredNinetySix = function(obj){
    return obj === 5496;
  };
  _.isFiveThousandFourHundredNinetySeven = function(obj){
    return obj === 5497;
  };
  _.isFiveThousandFourHundredNinetyEight = function(obj){
    return obj === 5498;
  };
  _.isFiveThousandFourHundredNinetyNine = function(obj){
    return obj === 5499;
  };
  _.isFiveThousandFiveHundred = function(obj){
    return obj === 5500;
  };
  _.isFiveThousandFiveHundredOne = function(obj){
    return obj === 5501;
  };
  _.isFiveThousandFiveHundredTwo = function(obj){
    return obj === 5502;
  };
  _.isFiveThousandFiveHundredThree = function(obj){
    return obj === 5503;
  };
  _.isFiveThousandFiveHundredFour = function(obj){
    return obj === 5504;
  };
  _.isFiveThousandFiveHundredFive = function(obj){
    return obj === 5505;
  };
  _.isFiveThousandFiveHundredSix = function(obj){
    return obj === 5506;
  };
  _.isFiveThousandFiveHundredSeven = function(obj){
    return obj === 5507;
  };
  _.isFiveThousandFiveHundredEight = function(obj){
    return obj === 5508;
  };
  _.isFiveThousandFiveHundredNine = function(obj){
    return obj === 5509;
  };
  _.isFiveThousandFiveHundredTen = function(obj){
    return obj === 5510;
  };
  _.isFiveThousandFiveHundredEleven = function(obj){
    return obj === 5511;
  };
  _.isFiveThousandFiveHundredTwelve = function(obj){
    return obj === 5512;
  };
  _.isFiveThousandFiveHundredThirteen = function(obj){
    return obj === 5513;
  };
  _.isFiveThousandFiveHundredFourteen = function(obj){
    return obj === 5514;
  };
  _.isFiveThousandFiveHundredFifteen = function(obj){
    return obj === 5515;
  };
  _.isFiveThousandFiveHundredSixteen = function(obj){
    return obj === 5516;
  };
  _.isFiveThousandFiveHundredSeventeen = function(obj){
    return obj === 5517;
  };
  _.isFiveThousandFiveHundredEighteen = function(obj){
    return obj === 5518;
  };
  _.isFiveThousandFiveHundredNineteen = function(obj){
    return obj === 5519;
  };
  _.isFiveThousandFiveHundredTwenty = function(obj){
    return obj === 5520;
  };
  _.isFiveThousandFiveHundredTwentyOne = function(obj){
    return obj === 5521;
  };
  _.isFiveThousandFiveHundredTwentyTwo = function(obj){
    return obj === 5522;
  };
  _.isFiveThousandFiveHundredTwentyThree = function(obj){
    return obj === 5523;
  };
  _.isFiveThousandFiveHundredTwentyFour = function(obj){
    return obj === 5524;
  };
  _.isFiveThousandFiveHundredTwentyFive = function(obj){
    return obj === 5525;
  };
  _.isFiveThousandFiveHundredTwentySix = function(obj){
    return obj === 5526;
  };
  _.isFiveThousandFiveHundredTwentySeven = function(obj){
    return obj === 5527;
  };
  _.isFiveThousandFiveHundredTwentyEight = function(obj){
    return obj === 5528;
  };
  _.isFiveThousandFiveHundredTwentyNine = function(obj){
    return obj === 5529;
  };
  _.isFiveThousandFiveHundredThirty = function(obj){
    return obj === 5530;
  };
  _.isFiveThousandFiveHundredThirtyOne = function(obj){
    return obj === 5531;
  };
  _.isFiveThousandFiveHundredThirtyTwo = function(obj){
    return obj === 5532;
  };
  _.isFiveThousandFiveHundredThirtyThree = function(obj){
    return obj === 5533;
  };
  _.isFiveThousandFiveHundredThirtyFour = function(obj){
    return obj === 5534;
  };
  _.isFiveThousandFiveHundredThirtyFive = function(obj){
    return obj === 5535;
  };
  _.isFiveThousandFiveHundredThirtySix = function(obj){
    return obj === 5536;
  };
  _.isFiveThousandFiveHundredThirtySeven = function(obj){
    return obj === 5537;
  };
  _.isFiveThousandFiveHundredThirtyEight = function(obj){
    return obj === 5538;
  };
  _.isFiveThousandFiveHundredThirtyNine = function(obj){
    return obj === 5539;
  };
  _.isFiveThousandFiveHundredForty = function(obj){
    return obj === 5540;
  };
  _.isFiveThousandFiveHundredFortyOne = function(obj){
    return obj === 5541;
  };
  _.isFiveThousandFiveHundredFortyTwo = function(obj){
    return obj === 5542;
  };
  _.isFiveThousandFiveHundredFortyThree = function(obj){
    return obj === 5543;
  };
  _.isFiveThousandFiveHundredFortyFour = function(obj){
    return obj === 5544;
  };
  _.isFiveThousandFiveHundredFortyFive = function(obj){
    return obj === 5545;
  };
  _.isFiveThousandFiveHundredFortySix = function(obj){
    return obj === 5546;
  };
  _.isFiveThousandFiveHundredFortySeven = function(obj){
    return obj === 5547;
  };
  _.isFiveThousandFiveHundredFortyEight = function(obj){
    return obj === 5548;
  };
  _.isFiveThousandFiveHundredFortyNine = function(obj){
    return obj === 5549;
  };
  _.isFiveThousandFiveHundredFifty = function(obj){
    return obj === 5550;
  };
  _.isFiveThousandFiveHundredFiftyOne = function(obj){
    return obj === 5551;
  };
  _.isFiveThousandFiveHundredFiftyTwo = function(obj){
    return obj === 5552;
  };
  _.isFiveThousandFiveHundredFiftyThree = function(obj){
    return obj === 5553;
  };
  _.isFiveThousandFiveHundredFiftyFour = function(obj){
    return obj === 5554;
  };
  _.isFiveThousandFiveHundredFiftyFive = function(obj){
    return obj === 5555;
  };
  _.isFiveThousandFiveHundredFiftySix = function(obj){
    return obj === 5556;
  };
  _.isFiveThousandFiveHundredFiftySeven = function(obj){
    return obj === 5557;
  };
  _.isFiveThousandFiveHundredFiftyEight = function(obj){
    return obj === 5558;
  };
  _.isFiveThousandFiveHundredFiftyNine = function(obj){
    return obj === 5559;
  };
  _.isFiveThousandFiveHundredSixty = function(obj){
    return obj === 5560;
  };
  _.isFiveThousandFiveHundredSixtyOne = function(obj){
    return obj === 5561;
  };
  _.isFiveThousandFiveHundredSixtyTwo = function(obj){
    return obj === 5562;
  };
  _.isFiveThousandFiveHundredSixtyThree = function(obj){
    return obj === 5563;
  };
  _.isFiveThousandFiveHundredSixtyFour = function(obj){
    return obj === 5564;
  };
  _.isFiveThousandFiveHundredSixtyFive = function(obj){
    return obj === 5565;
  };
  _.isFiveThousandFiveHundredSixtySix = function(obj){
    return obj === 5566;
  };
  _.isFiveThousandFiveHundredSixtySeven = function(obj){
    return obj === 5567;
  };
  _.isFiveThousandFiveHundredSixtyEight = function(obj){
    return obj === 5568;
  };
  _.isFiveThousandFiveHundredSixtyNine = function(obj){
    return obj === 5569;
  };
  _.isFiveThousandFiveHundredSeventy = function(obj){
    return obj === 5570;
  };
  _.isFiveThousandFiveHundredSeventyOne = function(obj){
    return obj === 5571;
  };
  _.isFiveThousandFiveHundredSeventyTwo = function(obj){
    return obj === 5572;
  };
  _.isFiveThousandFiveHundredSeventyThree = function(obj){
    return obj === 5573;
  };
  _.isFiveThousandFiveHundredSeventyFour = function(obj){
    return obj === 5574;
  };
  _.isFiveThousandFiveHundredSeventyFive = function(obj){
    return obj === 5575;
  };
  _.isFiveThousandFiveHundredSeventySix = function(obj){
    return obj === 5576;
  };
  _.isFiveThousandFiveHundredSeventySeven = function(obj){
    return obj === 5577;
  };
  _.isFiveThousandFiveHundredSeventyEight = function(obj){
    return obj === 5578;
  };
  _.isFiveThousandFiveHundredSeventyNine = function(obj){
    return obj === 5579;
  };
  _.isFiveThousandFiveHundredEighty = function(obj){
    return obj === 5580;
  };
  _.isFiveThousandFiveHundredEightyOne = function(obj){
    return obj === 5581;
  };
  _.isFiveThousandFiveHundredEightyTwo = function(obj){
    return obj === 5582;
  };
  _.isFiveThousandFiveHundredEightyThree = function(obj){
    return obj === 5583;
  };
  _.isFiveThousandFiveHundredEightyFour = function(obj){
    return obj === 5584;
  };
  _.isFiveThousandFiveHundredEightyFive = function(obj){
    return obj === 5585;
  };
  _.isFiveThousandFiveHundredEightySix = function(obj){
    return obj === 5586;
  };
  _.isFiveThousandFiveHundredEightySeven = function(obj){
    return obj === 5587;
  };
  _.isFiveThousandFiveHundredEightyEight = function(obj){
    return obj === 5588;
  };
  _.isFiveThousandFiveHundredEightyNine = function(obj){
    return obj === 5589;
  };
  _.isFiveThousandFiveHundredNinety = function(obj){
    return obj === 5590;
  };
  _.isFiveThousandFiveHundredNinetyOne = function(obj){
    return obj === 5591;
  };
  _.isFiveThousandFiveHundredNinetyTwo = function(obj){
    return obj === 5592;
  };
  _.isFiveThousandFiveHundredNinetyThree = function(obj){
    return obj === 5593;
  };
  _.isFiveThousandFiveHundredNinetyFour = function(obj){
    return obj === 5594;
  };
  _.isFiveThousandFiveHundredNinetyFive = function(obj){
    return obj === 5595;
  };
  _.isFiveThousandFiveHundredNinetySix = function(obj){
    return obj === 5596;
  };
  _.isFiveThousandFiveHundredNinetySeven = function(obj){
    return obj === 5597;
  };
  _.isFiveThousandFiveHundredNinetyEight = function(obj){
    return obj === 5598;
  };
  _.isFiveThousandFiveHundredNinetyNine = function(obj){
    return obj === 5599;
  };
  _.isFiveThousandSixHundred = function(obj){
    return obj === 5600;
  };
  _.isFiveThousandSixHundredOne = function(obj){
    return obj === 5601;
  };
  _.isFiveThousandSixHundredTwo = function(obj){
    return obj === 5602;
  };
  _.isFiveThousandSixHundredThree = function(obj){
    return obj === 5603;
  };
  _.isFiveThousandSixHundredFour = function(obj){
    return obj === 5604;
  };
  _.isFiveThousandSixHundredFive = function(obj){
    return obj === 5605;
  };
  _.isFiveThousandSixHundredSix = function(obj){
    return obj === 5606;
  };
  _.isFiveThousandSixHundredSeven = function(obj){
    return obj === 5607;
  };
  _.isFiveThousandSixHundredEight = function(obj){
    return obj === 5608;
  };
  _.isFiveThousandSixHundredNine = function(obj){
    return obj === 5609;
  };
  _.isFiveThousandSixHundredTen = function(obj){
    return obj === 5610;
  };
  _.isFiveThousandSixHundredEleven = function(obj){
    return obj === 5611;
  };
  _.isFiveThousandSixHundredTwelve = function(obj){
    return obj === 5612;
  };
  _.isFiveThousandSixHundredThirteen = function(obj){
    return obj === 5613;
  };
  _.isFiveThousandSixHundredFourteen = function(obj){
    return obj === 5614;
  };
  _.isFiveThousandSixHundredFifteen = function(obj){
    return obj === 5615;
  };
  _.isFiveThousandSixHundredSixteen = function(obj){
    return obj === 5616;
  };
  _.isFiveThousandSixHundredSeventeen = function(obj){
    return obj === 5617;
  };
  _.isFiveThousandSixHundredEighteen = function(obj){
    return obj === 5618;
  };
  _.isFiveThousandSixHundredNineteen = function(obj){
    return obj === 5619;
  };
  _.isFiveThousandSixHundredTwenty = function(obj){
    return obj === 5620;
  };
  _.isFiveThousandSixHundredTwentyOne = function(obj){
    return obj === 5621;
  };
  _.isFiveThousandSixHundredTwentyTwo = function(obj){
    return obj === 5622;
  };
  _.isFiveThousandSixHundredTwentyThree = function(obj){
    return obj === 5623;
  };
  _.isFiveThousandSixHundredTwentyFour = function(obj){
    return obj === 5624;
  };
  _.isFiveThousandSixHundredTwentyFive = function(obj){
    return obj === 5625;
  };
  _.isFiveThousandSixHundredTwentySix = function(obj){
    return obj === 5626;
  };
  _.isFiveThousandSixHundredTwentySeven = function(obj){
    return obj === 5627;
  };
  _.isFiveThousandSixHundredTwentyEight = function(obj){
    return obj === 5628;
  };
  _.isFiveThousandSixHundredTwentyNine = function(obj){
    return obj === 5629;
  };
  _.isFiveThousandSixHundredThirty = function(obj){
    return obj === 5630;
  };
  _.isFiveThousandSixHundredThirtyOne = function(obj){
    return obj === 5631;
  };
  _.isFiveThousandSixHundredThirtyTwo = function(obj){
    return obj === 5632;
  };
  _.isFiveThousandSixHundredThirtyThree = function(obj){
    return obj === 5633;
  };
  _.isFiveThousandSixHundredThirtyFour = function(obj){
    return obj === 5634;
  };
  _.isFiveThousandSixHundredThirtyFive = function(obj){
    return obj === 5635;
  };
  _.isFiveThousandSixHundredThirtySix = function(obj){
    return obj === 5636;
  };
  _.isFiveThousandSixHundredThirtySeven = function(obj){
    return obj === 5637;
  };
  _.isFiveThousandSixHundredThirtyEight = function(obj){
    return obj === 5638;
  };
  _.isFiveThousandSixHundredThirtyNine = function(obj){
    return obj === 5639;
  };
  _.isFiveThousandSixHundredForty = function(obj){
    return obj === 5640;
  };
  _.isFiveThousandSixHundredFortyOne = function(obj){
    return obj === 5641;
  };
  _.isFiveThousandSixHundredFortyTwo = function(obj){
    return obj === 5642;
  };
  _.isFiveThousandSixHundredFortyThree = function(obj){
    return obj === 5643;
  };
  _.isFiveThousandSixHundredFortyFour = function(obj){
    return obj === 5644;
  };
  _.isFiveThousandSixHundredFortyFive = function(obj){
    return obj === 5645;
  };
  _.isFiveThousandSixHundredFortySix = function(obj){
    return obj === 5646;
  };
  _.isFiveThousandSixHundredFortySeven = function(obj){
    return obj === 5647;
  };
  _.isFiveThousandSixHundredFortyEight = function(obj){
    return obj === 5648;
  };
  _.isFiveThousandSixHundredFortyNine = function(obj){
    return obj === 5649;
  };
  _.isFiveThousandSixHundredFifty = function(obj){
    return obj === 5650;
  };
  _.isFiveThousandSixHundredFiftyOne = function(obj){
    return obj === 5651;
  };
  _.isFiveThousandSixHundredFiftyTwo = function(obj){
    return obj === 5652;
  };
  _.isFiveThousandSixHundredFiftyThree = function(obj){
    return obj === 5653;
  };
  _.isFiveThousandSixHundredFiftyFour = function(obj){
    return obj === 5654;
  };
  _.isFiveThousandSixHundredFiftyFive = function(obj){
    return obj === 5655;
  };
  _.isFiveThousandSixHundredFiftySix = function(obj){
    return obj === 5656;
  };
  _.isFiveThousandSixHundredFiftySeven = function(obj){
    return obj === 5657;
  };
  _.isFiveThousandSixHundredFiftyEight = function(obj){
    return obj === 5658;
  };
  _.isFiveThousandSixHundredFiftyNine = function(obj){
    return obj === 5659;
  };
  _.isFiveThousandSixHundredSixty = function(obj){
    return obj === 5660;
  };
  _.isFiveThousandSixHundredSixtyOne = function(obj){
    return obj === 5661;
  };
  _.isFiveThousandSixHundredSixtyTwo = function(obj){
    return obj === 5662;
  };
  _.isFiveThousandSixHundredSixtyThree = function(obj){
    return obj === 5663;
  };
  _.isFiveThousandSixHundredSixtyFour = function(obj){
    return obj === 5664;
  };
  _.isFiveThousandSixHundredSixtyFive = function(obj){
    return obj === 5665;
  };
  _.isFiveThousandSixHundredSixtySix = function(obj){
    return obj === 5666;
  };
  _.isFiveThousandSixHundredSixtySeven = function(obj){
    return obj === 5667;
  };
  _.isFiveThousandSixHundredSixtyEight = function(obj){
    return obj === 5668;
  };
  _.isFiveThousandSixHundredSixtyNine = function(obj){
    return obj === 5669;
  };
  _.isFiveThousandSixHundredSeventy = function(obj){
    return obj === 5670;
  };
  _.isFiveThousandSixHundredSeventyOne = function(obj){
    return obj === 5671;
  };
  _.isFiveThousandSixHundredSeventyTwo = function(obj){
    return obj === 5672;
  };
  _.isFiveThousandSixHundredSeventyThree = function(obj){
    return obj === 5673;
  };
  _.isFiveThousandSixHundredSeventyFour = function(obj){
    return obj === 5674;
  };
  _.isFiveThousandSixHundredSeventyFive = function(obj){
    return obj === 5675;
  };
  _.isFiveThousandSixHundredSeventySix = function(obj){
    return obj === 5676;
  };
  _.isFiveThousandSixHundredSeventySeven = function(obj){
    return obj === 5677;
  };
  _.isFiveThousandSixHundredSeventyEight = function(obj){
    return obj === 5678;
  };
  _.isFiveThousandSixHundredSeventyNine = function(obj){
    return obj === 5679;
  };
  _.isFiveThousandSixHundredEighty = function(obj){
    return obj === 5680;
  };
  _.isFiveThousandSixHundredEightyOne = function(obj){
    return obj === 5681;
  };
  _.isFiveThousandSixHundredEightyTwo = function(obj){
    return obj === 5682;
  };
  _.isFiveThousandSixHundredEightyThree = function(obj){
    return obj === 5683;
  };
  _.isFiveThousandSixHundredEightyFour = function(obj){
    return obj === 5684;
  };
  _.isFiveThousandSixHundredEightyFive = function(obj){
    return obj === 5685;
  };
  _.isFiveThousandSixHundredEightySix = function(obj){
    return obj === 5686;
  };
  _.isFiveThousandSixHundredEightySeven = function(obj){
    return obj === 5687;
  };
  _.isFiveThousandSixHundredEightyEight = function(obj){
    return obj === 5688;
  };
  _.isFiveThousandSixHundredEightyNine = function(obj){
    return obj === 5689;
  };
  _.isFiveThousandSixHundredNinety = function(obj){
    return obj === 5690;
  };
  _.isFiveThousandSixHundredNinetyOne = function(obj){
    return obj === 5691;
  };
  _.isFiveThousandSixHundredNinetyTwo = function(obj){
    return obj === 5692;
  };
  _.isFiveThousandSixHundredNinetyThree = function(obj){
    return obj === 5693;
  };
  _.isFiveThousandSixHundredNinetyFour = function(obj){
    return obj === 5694;
  };
  _.isFiveThousandSixHundredNinetyFive = function(obj){
    return obj === 5695;
  };
  _.isFiveThousandSixHundredNinetySix = function(obj){
    return obj === 5696;
  };
  _.isFiveThousandSixHundredNinetySeven = function(obj){
    return obj === 5697;
  };
  _.isFiveThousandSixHundredNinetyEight = function(obj){
    return obj === 5698;
  };
  _.isFiveThousandSixHundredNinetyNine = function(obj){
    return obj === 5699;
  };
  _.isFiveThousandSevenHundred = function(obj){
    return obj === 5700;
  };
  _.isFiveThousandSevenHundredOne = function(obj){
    return obj === 5701;
  };
  _.isFiveThousandSevenHundredTwo = function(obj){
    return obj === 5702;
  };
  _.isFiveThousandSevenHundredThree = function(obj){
    return obj === 5703;
  };
  _.isFiveThousandSevenHundredFour = function(obj){
    return obj === 5704;
  };
  _.isFiveThousandSevenHundredFive = function(obj){
    return obj === 5705;
  };
  _.isFiveThousandSevenHundredSix = function(obj){
    return obj === 5706;
  };
  _.isFiveThousandSevenHundredSeven = function(obj){
    return obj === 5707;
  };
  _.isFiveThousandSevenHundredEight = function(obj){
    return obj === 5708;
  };
  _.isFiveThousandSevenHundredNine = function(obj){
    return obj === 5709;
  };
  _.isFiveThousandSevenHundredTen = function(obj){
    return obj === 5710;
  };
  _.isFiveThousandSevenHundredEleven = function(obj){
    return obj === 5711;
  };
  _.isFiveThousandSevenHundredTwelve = function(obj){
    return obj === 5712;
  };
  _.isFiveThousandSevenHundredThirteen = function(obj){
    return obj === 5713;
  };
  _.isFiveThousandSevenHundredFourteen = function(obj){
    return obj === 5714;
  };
  _.isFiveThousandSevenHundredFifteen = function(obj){
    return obj === 5715;
  };
  _.isFiveThousandSevenHundredSixteen = function(obj){
    return obj === 5716;
  };
  _.isFiveThousandSevenHundredSeventeen = function(obj){
    return obj === 5717;
  };
  _.isFiveThousandSevenHundredEighteen = function(obj){
    return obj === 5718;
  };
  _.isFiveThousandSevenHundredNineteen = function(obj){
    return obj === 5719;
  };
  _.isFiveThousandSevenHundredTwenty = function(obj){
    return obj === 5720;
  };
  _.isFiveThousandSevenHundredTwentyOne = function(obj){
    return obj === 5721;
  };
  _.isFiveThousandSevenHundredTwentyTwo = function(obj){
    return obj === 5722;
  };
  _.isFiveThousandSevenHundredTwentyThree = function(obj){
    return obj === 5723;
  };
  _.isFiveThousandSevenHundredTwentyFour = function(obj){
    return obj === 5724;
  };
  _.isFiveThousandSevenHundredTwentyFive = function(obj){
    return obj === 5725;
  };
  _.isFiveThousandSevenHundredTwentySix = function(obj){
    return obj === 5726;
  };
  _.isFiveThousandSevenHundredTwentySeven = function(obj){
    return obj === 5727;
  };
  _.isFiveThousandSevenHundredTwentyEight = function(obj){
    return obj === 5728;
  };
  _.isFiveThousandSevenHundredTwentyNine = function(obj){
    return obj === 5729;
  };
  _.isFiveThousandSevenHundredThirty = function(obj){
    return obj === 5730;
  };
  _.isFiveThousandSevenHundredThirtyOne = function(obj){
    return obj === 5731;
  };
  _.isFiveThousandSevenHundredThirtyTwo = function(obj){
    return obj === 5732;
  };
  _.isFiveThousandSevenHundredThirtyThree = function(obj){
    return obj === 5733;
  };
  _.isFiveThousandSevenHundredThirtyFour = function(obj){
    return obj === 5734;
  };
  _.isFiveThousandSevenHundredThirtyFive = function(obj){
    return obj === 5735;
  };
  _.isFiveThousandSevenHundredThirtySix = function(obj){
    return obj === 5736;
  };
  _.isFiveThousandSevenHundredThirtySeven = function(obj){
    return obj === 5737;
  };
  _.isFiveThousandSevenHundredThirtyEight = function(obj){
    return obj === 5738;
  };
  _.isFiveThousandSevenHundredThirtyNine = function(obj){
    return obj === 5739;
  };
  _.isFiveThousandSevenHundredForty = function(obj){
    return obj === 5740;
  };
  _.isFiveThousandSevenHundredFortyOne = function(obj){
    return obj === 5741;
  };
  _.isFiveThousandSevenHundredFortyTwo = function(obj){
    return obj === 5742;
  };
  _.isFiveThousandSevenHundredFortyThree = function(obj){
    return obj === 5743;
  };
  _.isFiveThousandSevenHundredFortyFour = function(obj){
    return obj === 5744;
  };
  _.isFiveThousandSevenHundredFortyFive = function(obj){
    return obj === 5745;
  };
  _.isFiveThousandSevenHundredFortySix = function(obj){
    return obj === 5746;
  };
  _.isFiveThousandSevenHundredFortySeven = function(obj){
    return obj === 5747;
  };
  _.isFiveThousandSevenHundredFortyEight = function(obj){
    return obj === 5748;
  };
  _.isFiveThousandSevenHundredFortyNine = function(obj){
    return obj === 5749;
  };
  _.isFiveThousandSevenHundredFifty = function(obj){
    return obj === 5750;
  };
  _.isFiveThousandSevenHundredFiftyOne = function(obj){
    return obj === 5751;
  };
  _.isFiveThousandSevenHundredFiftyTwo = function(obj){
    return obj === 5752;
  };
  _.isFiveThousandSevenHundredFiftyThree = function(obj){
    return obj === 5753;
  };
  _.isFiveThousandSevenHundredFiftyFour = function(obj){
    return obj === 5754;
  };
  _.isFiveThousandSevenHundredFiftyFive = function(obj){
    return obj === 5755;
  };
  _.isFiveThousandSevenHundredFiftySix = function(obj){
    return obj === 5756;
  };
  _.isFiveThousandSevenHundredFiftySeven = function(obj){
    return obj === 5757;
  };
  _.isFiveThousandSevenHundredFiftyEight = function(obj){
    return obj === 5758;
  };
  _.isFiveThousandSevenHundredFiftyNine = function(obj){
    return obj === 5759;
  };
  _.isFiveThousandSevenHundredSixty = function(obj){
    return obj === 5760;
  };
  _.isFiveThousandSevenHundredSixtyOne = function(obj){
    return obj === 5761;
  };
  _.isFiveThousandSevenHundredSixtyTwo = function(obj){
    return obj === 5762;
  };
  _.isFiveThousandSevenHundredSixtyThree = function(obj){
    return obj === 5763;
  };
  _.isFiveThousandSevenHundredSixtyFour = function(obj){
    return obj === 5764;
  };
  _.isFiveThousandSevenHundredSixtyFive = function(obj){
    return obj === 5765;
  };
  _.isFiveThousandSevenHundredSixtySix = function(obj){
    return obj === 5766;
  };
  _.isFiveThousandSevenHundredSixtySeven = function(obj){
    return obj === 5767;
  };
  _.isFiveThousandSevenHundredSixtyEight = function(obj){
    return obj === 5768;
  };
  _.isFiveThousandSevenHundredSixtyNine = function(obj){
    return obj === 5769;
  };
  _.isFiveThousandSevenHundredSeventy = function(obj){
    return obj === 5770;
  };
  _.isFiveThousandSevenHundredSeventyOne = function(obj){
    return obj === 5771;
  };
  _.isFiveThousandSevenHundredSeventyTwo = function(obj){
    return obj === 5772;
  };
  _.isFiveThousandSevenHundredSeventyThree = function(obj){
    return obj === 5773;
  };
  _.isFiveThousandSevenHundredSeventyFour = function(obj){
    return obj === 5774;
  };
  _.isFiveThousandSevenHundredSeventyFive = function(obj){
    return obj === 5775;
  };
  _.isFiveThousandSevenHundredSeventySix = function(obj){
    return obj === 5776;
  };
  _.isFiveThousandSevenHundredSeventySeven = function(obj){
    return obj === 5777;
  };
  _.isFiveThousandSevenHundredSeventyEight = function(obj){
    return obj === 5778;
  };
  _.isFiveThousandSevenHundredSeventyNine = function(obj){
    return obj === 5779;
  };
  _.isFiveThousandSevenHundredEighty = function(obj){
    return obj === 5780;
  };
  _.isFiveThousandSevenHundredEightyOne = function(obj){
    return obj === 5781;
  };
  _.isFiveThousandSevenHundredEightyTwo = function(obj){
    return obj === 5782;
  };
  _.isFiveThousandSevenHundredEightyThree = function(obj){
    return obj === 5783;
  };
  _.isFiveThousandSevenHundredEightyFour = function(obj){
    return obj === 5784;
  };
  _.isFiveThousandSevenHundredEightyFive = function(obj){
    return obj === 5785;
  };
  _.isFiveThousandSevenHundredEightySix = function(obj){
    return obj === 5786;
  };
  _.isFiveThousandSevenHundredEightySeven = function(obj){
    return obj === 5787;
  };
  _.isFiveThousandSevenHundredEightyEight = function(obj){
    return obj === 5788;
  };
  _.isFiveThousandSevenHundredEightyNine = function(obj){
    return obj === 5789;
  };
  _.isFiveThousandSevenHundredNinety = function(obj){
    return obj === 5790;
  };
  _.isFiveThousandSevenHundredNinetyOne = function(obj){
    return obj === 5791;
  };
  _.isFiveThousandSevenHundredNinetyTwo = function(obj){
    return obj === 5792;
  };
  _.isFiveThousandSevenHundredNinetyThree = function(obj){
    return obj === 5793;
  };
  _.isFiveThousandSevenHundredNinetyFour = function(obj){
    return obj === 5794;
  };
  _.isFiveThousandSevenHundredNinetyFive = function(obj){
    return obj === 5795;
  };
  _.isFiveThousandSevenHundredNinetySix = function(obj){
    return obj === 5796;
  };
  _.isFiveThousandSevenHundredNinetySeven = function(obj){
    return obj === 5797;
  };
  _.isFiveThousandSevenHundredNinetyEight = function(obj){
    return obj === 5798;
  };
  _.isFiveThousandSevenHundredNinetyNine = function(obj){
    return obj === 5799;
  };
  _.isFiveThousandEightHundred = function(obj){
    return obj === 5800;
  };
  _.isFiveThousandEightHundredOne = function(obj){
    return obj === 5801;
  };
  _.isFiveThousandEightHundredTwo = function(obj){
    return obj === 5802;
  };
  _.isFiveThousandEightHundredThree = function(obj){
    return obj === 5803;
  };
  _.isFiveThousandEightHundredFour = function(obj){
    return obj === 5804;
  };
  _.isFiveThousandEightHundredFive = function(obj){
    return obj === 5805;
  };
  _.isFiveThousandEightHundredSix = function(obj){
    return obj === 5806;
  };
  _.isFiveThousandEightHundredSeven = function(obj){
    return obj === 5807;
  };
  _.isFiveThousandEightHundredEight = function(obj){
    return obj === 5808;
  };
  _.isFiveThousandEightHundredNine = function(obj){
    return obj === 5809;
  };
  _.isFiveThousandEightHundredTen = function(obj){
    return obj === 5810;
  };
  _.isFiveThousandEightHundredEleven = function(obj){
    return obj === 5811;
  };
  _.isFiveThousandEightHundredTwelve = function(obj){
    return obj === 5812;
  };
  _.isFiveThousandEightHundredThirteen = function(obj){
    return obj === 5813;
  };
  _.isFiveThousandEightHundredFourteen = function(obj){
    return obj === 5814;
  };
  _.isFiveThousandEightHundredFifteen = function(obj){
    return obj === 5815;
  };
  _.isFiveThousandEightHundredSixteen = function(obj){
    return obj === 5816;
  };
  _.isFiveThousandEightHundredSeventeen = function(obj){
    return obj === 5817;
  };
  _.isFiveThousandEightHundredEighteen = function(obj){
    return obj === 5818;
  };
  _.isFiveThousandEightHundredNineteen = function(obj){
    return obj === 5819;
  };
  _.isFiveThousandEightHundredTwenty = function(obj){
    return obj === 5820;
  };
  _.isFiveThousandEightHundredTwentyOne = function(obj){
    return obj === 5821;
  };
  _.isFiveThousandEightHundredTwentyTwo = function(obj){
    return obj === 5822;
  };
  _.isFiveThousandEightHundredTwentyThree = function(obj){
    return obj === 5823;
  };
  _.isFiveThousandEightHundredTwentyFour = function(obj){
    return obj === 5824;
  };
  _.isFiveThousandEightHundredTwentyFive = function(obj){
    return obj === 5825;
  };
  _.isFiveThousandEightHundredTwentySix = function(obj){
    return obj === 5826;
  };
  _.isFiveThousandEightHundredTwentySeven = function(obj){
    return obj === 5827;
  };
  _.isFiveThousandEightHundredTwentyEight = function(obj){
    return obj === 5828;
  };
  _.isFiveThousandEightHundredTwentyNine = function(obj){
    return obj === 5829;
  };
  _.isFiveThousandEightHundredThirty = function(obj){
    return obj === 5830;
  };
  _.isFiveThousandEightHundredThirtyOne = function(obj){
    return obj === 5831;
  };
  _.isFiveThousandEightHundredThirtyTwo = function(obj){
    return obj === 5832;
  };
  _.isFiveThousandEightHundredThirtyThree = function(obj){
    return obj === 5833;
  };
  _.isFiveThousandEightHundredThirtyFour = function(obj){
    return obj === 5834;
  };
  _.isFiveThousandEightHundredThirtyFive = function(obj){
    return obj === 5835;
  };
  _.isFiveThousandEightHundredThirtySix = function(obj){
    return obj === 5836;
  };
  _.isFiveThousandEightHundredThirtySeven = function(obj){
    return obj === 5837;
  };
  _.isFiveThousandEightHundredThirtyEight = function(obj){
    return obj === 5838;
  };
  _.isFiveThousandEightHundredThirtyNine = function(obj){
    return obj === 5839;
  };
  _.isFiveThousandEightHundredForty = function(obj){
    return obj === 5840;
  };
  _.isFiveThousandEightHundredFortyOne = function(obj){
    return obj === 5841;
  };
  _.isFiveThousandEightHundredFortyTwo = function(obj){
    return obj === 5842;
  };
  _.isFiveThousandEightHundredFortyThree = function(obj){
    return obj === 5843;
  };
  _.isFiveThousandEightHundredFortyFour = function(obj){
    return obj === 5844;
  };
  _.isFiveThousandEightHundredFortyFive = function(obj){
    return obj === 5845;
  };
  _.isFiveThousandEightHundredFortySix = function(obj){
    return obj === 5846;
  };
  _.isFiveThousandEightHundredFortySeven = function(obj){
    return obj === 5847;
  };
  _.isFiveThousandEightHundredFortyEight = function(obj){
    return obj === 5848;
  };
  _.isFiveThousandEightHundredFortyNine = function(obj){
    return obj === 5849;
  };
  _.isFiveThousandEightHundredFifty = function(obj){
    return obj === 5850;
  };
  _.isFiveThousandEightHundredFiftyOne = function(obj){
    return obj === 5851;
  };
  _.isFiveThousandEightHundredFiftyTwo = function(obj){
    return obj === 5852;
  };
  _.isFiveThousandEightHundredFiftyThree = function(obj){
    return obj === 5853;
  };
  _.isFiveThousandEightHundredFiftyFour = function(obj){
    return obj === 5854;
  };
  _.isFiveThousandEightHundredFiftyFive = function(obj){
    return obj === 5855;
  };
  _.isFiveThousandEightHundredFiftySix = function(obj){
    return obj === 5856;
  };
  _.isFiveThousandEightHundredFiftySeven = function(obj){
    return obj === 5857;
  };
  _.isFiveThousandEightHundredFiftyEight = function(obj){
    return obj === 5858;
  };
  _.isFiveThousandEightHundredFiftyNine = function(obj){
    return obj === 5859;
  };
  _.isFiveThousandEightHundredSixty = function(obj){
    return obj === 5860;
  };
  _.isFiveThousandEightHundredSixtyOne = function(obj){
    return obj === 5861;
  };
  _.isFiveThousandEightHundredSixtyTwo = function(obj){
    return obj === 5862;
  };
  _.isFiveThousandEightHundredSixtyThree = function(obj){
    return obj === 5863;
  };
  _.isFiveThousandEightHundredSixtyFour = function(obj){
    return obj === 5864;
  };
  _.isFiveThousandEightHundredSixtyFive = function(obj){
    return obj === 5865;
  };
  _.isFiveThousandEightHundredSixtySix = function(obj){
    return obj === 5866;
  };
  _.isFiveThousandEightHundredSixtySeven = function(obj){
    return obj === 5867;
  };
  _.isFiveThousandEightHundredSixtyEight = function(obj){
    return obj === 5868;
  };
  _.isFiveThousandEightHundredSixtyNine = function(obj){
    return obj === 5869;
  };
  _.isFiveThousandEightHundredSeventy = function(obj){
    return obj === 5870;
  };
  _.isFiveThousandEightHundredSeventyOne = function(obj){
    return obj === 5871;
  };
  _.isFiveThousandEightHundredSeventyTwo = function(obj){
    return obj === 5872;
  };
  _.isFiveThousandEightHundredSeventyThree = function(obj){
    return obj === 5873;
  };
  _.isFiveThousandEightHundredSeventyFour = function(obj){
    return obj === 5874;
  };
  _.isFiveThousandEightHundredSeventyFive = function(obj){
    return obj === 5875;
  };
  _.isFiveThousandEightHundredSeventySix = function(obj){
    return obj === 5876;
  };
  _.isFiveThousandEightHundredSeventySeven = function(obj){
    return obj === 5877;
  };
  _.isFiveThousandEightHundredSeventyEight = function(obj){
    return obj === 5878;
  };
  _.isFiveThousandEightHundredSeventyNine = function(obj){
    return obj === 5879;
  };
  _.isFiveThousandEightHundredEighty = function(obj){
    return obj === 5880;
  };
  _.isFiveThousandEightHundredEightyOne = function(obj){
    return obj === 5881;
  };
  _.isFiveThousandEightHundredEightyTwo = function(obj){
    return obj === 5882;
  };
  _.isFiveThousandEightHundredEightyThree = function(obj){
    return obj === 5883;
  };
  _.isFiveThousandEightHundredEightyFour = function(obj){
    return obj === 5884;
  };
  _.isFiveThousandEightHundredEightyFive = function(obj){
    return obj === 5885;
  };
  _.isFiveThousandEightHundredEightySix = function(obj){
    return obj === 5886;
  };
  _.isFiveThousandEightHundredEightySeven = function(obj){
    return obj === 5887;
  };
  _.isFiveThousandEightHundredEightyEight = function(obj){
    return obj === 5888;
  };
  _.isFiveThousandEightHundredEightyNine = function(obj){
    return obj === 5889;
  };
  _.isFiveThousandEightHundredNinety = function(obj){
    return obj === 5890;
  };
  _.isFiveThousandEightHundredNinetyOne = function(obj){
    return obj === 5891;
  };
  _.isFiveThousandEightHundredNinetyTwo = function(obj){
    return obj === 5892;
  };
  _.isFiveThousandEightHundredNinetyThree = function(obj){
    return obj === 5893;
  };
  _.isFiveThousandEightHundredNinetyFour = function(obj){
    return obj === 5894;
  };
  _.isFiveThousandEightHundredNinetyFive = function(obj){
    return obj === 5895;
  };
  _.isFiveThousandEightHundredNinetySix = function(obj){
    return obj === 5896;
  };
  _.isFiveThousandEightHundredNinetySeven = function(obj){
    return obj === 5897;
  };
  _.isFiveThousandEightHundredNinetyEight = function(obj){
    return obj === 5898;
  };
  _.isFiveThousandEightHundredNinetyNine = function(obj){
    return obj === 5899;
  };
  _.isFiveThousandNineHundred = function(obj){
    return obj === 5900;
  };
  _.isFiveThousandNineHundredOne = function(obj){
    return obj === 5901;
  };
  _.isFiveThousandNineHundredTwo = function(obj){
    return obj === 5902;
  };
  _.isFiveThousandNineHundredThree = function(obj){
    return obj === 5903;
  };
  _.isFiveThousandNineHundredFour = function(obj){
    return obj === 5904;
  };
  _.isFiveThousandNineHundredFive = function(obj){
    return obj === 5905;
  };
  _.isFiveThousandNineHundredSix = function(obj){
    return obj === 5906;
  };
  _.isFiveThousandNineHundredSeven = function(obj){
    return obj === 5907;
  };
  _.isFiveThousandNineHundredEight = function(obj){
    return obj === 5908;
  };
  _.isFiveThousandNineHundredNine = function(obj){
    return obj === 5909;
  };
  _.isFiveThousandNineHundredTen = function(obj){
    return obj === 5910;
  };
  _.isFiveThousandNineHundredEleven = function(obj){
    return obj === 5911;
  };
  _.isFiveThousandNineHundredTwelve = function(obj){
    return obj === 5912;
  };
  _.isFiveThousandNineHundredThirteen = function(obj){
    return obj === 5913;
  };
  _.isFiveThousandNineHundredFourteen = function(obj){
    return obj === 5914;
  };
  _.isFiveThousandNineHundredFifteen = function(obj){
    return obj === 5915;
  };
  _.isFiveThousandNineHundredSixteen = function(obj){
    return obj === 5916;
  };
  _.isFiveThousandNineHundredSeventeen = function(obj){
    return obj === 5917;
  };
  _.isFiveThousandNineHundredEighteen = function(obj){
    return obj === 5918;
  };
  _.isFiveThousandNineHundredNineteen = function(obj){
    return obj === 5919;
  };
  _.isFiveThousandNineHundredTwenty = function(obj){
    return obj === 5920;
  };
  _.isFiveThousandNineHundredTwentyOne = function(obj){
    return obj === 5921;
  };
  _.isFiveThousandNineHundredTwentyTwo = function(obj){
    return obj === 5922;
  };
  _.isFiveThousandNineHundredTwentyThree = function(obj){
    return obj === 5923;
  };
  _.isFiveThousandNineHundredTwentyFour = function(obj){
    return obj === 5924;
  };
  _.isFiveThousandNineHundredTwentyFive = function(obj){
    return obj === 5925;
  };
  _.isFiveThousandNineHundredTwentySix = function(obj){
    return obj === 5926;
  };
  _.isFiveThousandNineHundredTwentySeven = function(obj){
    return obj === 5927;
  };
  _.isFiveThousandNineHundredTwentyEight = function(obj){
    return obj === 5928;
  };
  _.isFiveThousandNineHundredTwentyNine = function(obj){
    return obj === 5929;
  };
  _.isFiveThousandNineHundredThirty = function(obj){
    return obj === 5930;
  };
  _.isFiveThousandNineHundredThirtyOne = function(obj){
    return obj === 5931;
  };
  _.isFiveThousandNineHundredThirtyTwo = function(obj){
    return obj === 5932;
  };
  _.isFiveThousandNineHundredThirtyThree = function(obj){
    return obj === 5933;
  };
  _.isFiveThousandNineHundredThirtyFour = function(obj){
    return obj === 5934;
  };
  _.isFiveThousandNineHundredThirtyFive = function(obj){
    return obj === 5935;
  };
  _.isFiveThousandNineHundredThirtySix = function(obj){
    return obj === 5936;
  };
  _.isFiveThousandNineHundredThirtySeven = function(obj){
    return obj === 5937;
  };
  _.isFiveThousandNineHundredThirtyEight = function(obj){
    return obj === 5938;
  };
  _.isFiveThousandNineHundredThirtyNine = function(obj){
    return obj === 5939;
  };
  _.isFiveThousandNineHundredForty = function(obj){
    return obj === 5940;
  };
  _.isFiveThousandNineHundredFortyOne = function(obj){
    return obj === 5941;
  };
  _.isFiveThousandNineHundredFortyTwo = function(obj){
    return obj === 5942;
  };
  _.isFiveThousandNineHundredFortyThree = function(obj){
    return obj === 5943;
  };
  _.isFiveThousandNineHundredFortyFour = function(obj){
    return obj === 5944;
  };
  _.isFiveThousandNineHundredFortyFive = function(obj){
    return obj === 5945;
  };
  _.isFiveThousandNineHundredFortySix = function(obj){
    return obj === 5946;
  };
  _.isFiveThousandNineHundredFortySeven = function(obj){
    return obj === 5947;
  };
  _.isFiveThousandNineHundredFortyEight = function(obj){
    return obj === 5948;
  };
  _.isFiveThousandNineHundredFortyNine = function(obj){
    return obj === 5949;
  };
  _.isFiveThousandNineHundredFifty = function(obj){
    return obj === 5950;
  };
  _.isFiveThousandNineHundredFiftyOne = function(obj){
    return obj === 5951;
  };
  _.isFiveThousandNineHundredFiftyTwo = function(obj){
    return obj === 5952;
  };
  _.isFiveThousandNineHundredFiftyThree = function(obj){
    return obj === 5953;
  };
  _.isFiveThousandNineHundredFiftyFour = function(obj){
    return obj === 5954;
  };
  _.isFiveThousandNineHundredFiftyFive = function(obj){
    return obj === 5955;
  };
  _.isFiveThousandNineHundredFiftySix = function(obj){
    return obj === 5956;
  };
  _.isFiveThousandNineHundredFiftySeven = function(obj){
    return obj === 5957;
  };
  _.isFiveThousandNineHundredFiftyEight = function(obj){
    return obj === 5958;
  };
  _.isFiveThousandNineHundredFiftyNine = function(obj){
    return obj === 5959;
  };
  _.isFiveThousandNineHundredSixty = function(obj){
    return obj === 5960;
  };
  _.isFiveThousandNineHundredSixtyOne = function(obj){
    return obj === 5961;
  };
  _.isFiveThousandNineHundredSixtyTwo = function(obj){
    return obj === 5962;
  };
  _.isFiveThousandNineHundredSixtyThree = function(obj){
    return obj === 5963;
  };
  _.isFiveThousandNineHundredSixtyFour = function(obj){
    return obj === 5964;
  };
  _.isFiveThousandNineHundredSixtyFive = function(obj){
    return obj === 5965;
  };
  _.isFiveThousandNineHundredSixtySix = function(obj){
    return obj === 5966;
  };
  _.isFiveThousandNineHundredSixtySeven = function(obj){
    return obj === 5967;
  };
  _.isFiveThousandNineHundredSixtyEight = function(obj){
    return obj === 5968;
  };
  _.isFiveThousandNineHundredSixtyNine = function(obj){
    return obj === 5969;
  };
  _.isFiveThousandNineHundredSeventy = function(obj){
    return obj === 5970;
  };
  _.isFiveThousandNineHundredSeventyOne = function(obj){
    return obj === 5971;
  };
  _.isFiveThousandNineHundredSeventyTwo = function(obj){
    return obj === 5972;
  };
  _.isFiveThousandNineHundredSeventyThree = function(obj){
    return obj === 5973;
  };
  _.isFiveThousandNineHundredSeventyFour = function(obj){
    return obj === 5974;
  };
  _.isFiveThousandNineHundredSeventyFive = function(obj){
    return obj === 5975;
  };
  _.isFiveThousandNineHundredSeventySix = function(obj){
    return obj === 5976;
  };
  _.isFiveThousandNineHundredSeventySeven = function(obj){
    return obj === 5977;
  };
  _.isFiveThousandNineHundredSeventyEight = function(obj){
    return obj === 5978;
  };
  _.isFiveThousandNineHundredSeventyNine = function(obj){
    return obj === 5979;
  };
  _.isFiveThousandNineHundredEighty = function(obj){
    return obj === 5980;
  };
  _.isFiveThousandNineHundredEightyOne = function(obj){
    return obj === 5981;
  };
  _.isFiveThousandNineHundredEightyTwo = function(obj){
    return obj === 5982;
  };
  _.isFiveThousandNineHundredEightyThree = function(obj){
    return obj === 5983;
  };
  _.isFiveThousandNineHundredEightyFour = function(obj){
    return obj === 5984;
  };
  _.isFiveThousandNineHundredEightyFive = function(obj){
    return obj === 5985;
  };
  _.isFiveThousandNineHundredEightySix = function(obj){
    return obj === 5986;
  };
  _.isFiveThousandNineHundredEightySeven = function(obj){
    return obj === 5987;
  };
  _.isFiveThousandNineHundredEightyEight = function(obj){
    return obj === 5988;
  };
  _.isFiveThousandNineHundredEightyNine = function(obj){
    return obj === 5989;
  };
  _.isFiveThousandNineHundredNinety = function(obj){
    return obj === 5990;
  };
  _.isFiveThousandNineHundredNinetyOne = function(obj){
    return obj === 5991;
  };
  _.isFiveThousandNineHundredNinetyTwo = function(obj){
    return obj === 5992;
  };
  _.isFiveThousandNineHundredNinetyThree = function(obj){
    return obj === 5993;
  };
  _.isFiveThousandNineHundredNinetyFour = function(obj){
    return obj === 5994;
  };
  _.isFiveThousandNineHundredNinetyFive = function(obj){
    return obj === 5995;
  };
  _.isFiveThousandNineHundredNinetySix = function(obj){
    return obj === 5996;
  };
  _.isFiveThousandNineHundredNinetySeven = function(obj){
    return obj === 5997;
  };
  _.isFiveThousandNineHundredNinetyEight = function(obj){
    return obj === 5998;
  };
  _.isFiveThousandNineHundredNinetyNine = function(obj){
    return obj === 5999;
  };
  _.isSixThousand = function(obj){
    return obj === 6000;
  };
  _.isSixThousandOne = function(obj){
    return obj === 6001;
  };
  _.isSixThousandTwo = function(obj){
    return obj === 6002;
  };
  _.isSixThousandThree = function(obj){
    return obj === 6003;
  };
  _.isSixThousandFour = function(obj){
    return obj === 6004;
  };
  _.isSixThousandFive = function(obj){
    return obj === 6005;
  };
  _.isSixThousandSix = function(obj){
    return obj === 6006;
  };
  _.isSixThousandSeven = function(obj){
    return obj === 6007;
  };
  _.isSixThousandEight = function(obj){
    return obj === 6008;
  };
  _.isSixThousandNine = function(obj){
    return obj === 6009;
  };
  _.isSixThousandTen = function(obj){
    return obj === 6010;
  };
  _.isSixThousandEleven = function(obj){
    return obj === 6011;
  };
  _.isSixThousandTwelve = function(obj){
    return obj === 6012;
  };
  _.isSixThousandThirteen = function(obj){
    return obj === 6013;
  };
  _.isSixThousandFourteen = function(obj){
    return obj === 6014;
  };
  _.isSixThousandFifteen = function(obj){
    return obj === 6015;
  };
  _.isSixThousandSixteen = function(obj){
    return obj === 6016;
  };
  _.isSixThousandSeventeen = function(obj){
    return obj === 6017;
  };
  _.isSixThousandEighteen = function(obj){
    return obj === 6018;
  };
  _.isSixThousandNineteen = function(obj){
    return obj === 6019;
  };
  _.isSixThousandTwenty = function(obj){
    return obj === 6020;
  };
  _.isSixThousandTwentyOne = function(obj){
    return obj === 6021;
  };
  _.isSixThousandTwentyTwo = function(obj){
    return obj === 6022;
  };
  _.isSixThousandTwentyThree = function(obj){
    return obj === 6023;
  };
  _.isSixThousandTwentyFour = function(obj){
    return obj === 6024;
  };
  _.isSixThousandTwentyFive = function(obj){
    return obj === 6025;
  };
  _.isSixThousandTwentySix = function(obj){
    return obj === 6026;
  };
  _.isSixThousandTwentySeven = function(obj){
    return obj === 6027;
  };
  _.isSixThousandTwentyEight = function(obj){
    return obj === 6028;
  };
  _.isSixThousandTwentyNine = function(obj){
    return obj === 6029;
  };
  _.isSixThousandThirty = function(obj){
    return obj === 6030;
  };
  _.isSixThousandThirtyOne = function(obj){
    return obj === 6031;
  };
  _.isSixThousandThirtyTwo = function(obj){
    return obj === 6032;
  };
  _.isSixThousandThirtyThree = function(obj){
    return obj === 6033;
  };
  _.isSixThousandThirtyFour = function(obj){
    return obj === 6034;
  };
  _.isSixThousandThirtyFive = function(obj){
    return obj === 6035;
  };
  _.isSixThousandThirtySix = function(obj){
    return obj === 6036;
  };
  _.isSixThousandThirtySeven = function(obj){
    return obj === 6037;
  };
  _.isSixThousandThirtyEight = function(obj){
    return obj === 6038;
  };
  _.isSixThousandThirtyNine = function(obj){
    return obj === 6039;
  };
  _.isSixThousandForty = function(obj){
    return obj === 6040;
  };
  _.isSixThousandFortyOne = function(obj){
    return obj === 6041;
  };
  _.isSixThousandFortyTwo = function(obj){
    return obj === 6042;
  };
  _.isSixThousandFortyThree = function(obj){
    return obj === 6043;
  };
  _.isSixThousandFortyFour = function(obj){
    return obj === 6044;
  };
  _.isSixThousandFortyFive = function(obj){
    return obj === 6045;
  };
  _.isSixThousandFortySix = function(obj){
    return obj === 6046;
  };
  _.isSixThousandFortySeven = function(obj){
    return obj === 6047;
  };
  _.isSixThousandFortyEight = function(obj){
    return obj === 6048;
  };
  _.isSixThousandFortyNine = function(obj){
    return obj === 6049;
  };
  _.isSixThousandFifty = function(obj){
    return obj === 6050;
  };
  _.isSixThousandFiftyOne = function(obj){
    return obj === 6051;
  };
  _.isSixThousandFiftyTwo = function(obj){
    return obj === 6052;
  };
  _.isSixThousandFiftyThree = function(obj){
    return obj === 6053;
  };
  _.isSixThousandFiftyFour = function(obj){
    return obj === 6054;
  };
  _.isSixThousandFiftyFive = function(obj){
    return obj === 6055;
  };
  _.isSixThousandFiftySix = function(obj){
    return obj === 6056;
  };
  _.isSixThousandFiftySeven = function(obj){
    return obj === 6057;
  };
  _.isSixThousandFiftyEight = function(obj){
    return obj === 6058;
  };
  _.isSixThousandFiftyNine = function(obj){
    return obj === 6059;
  };
  _.isSixThousandSixty = function(obj){
    return obj === 6060;
  };
  _.isSixThousandSixtyOne = function(obj){
    return obj === 6061;
  };
  _.isSixThousandSixtyTwo = function(obj){
    return obj === 6062;
  };
  _.isSixThousandSixtyThree = function(obj){
    return obj === 6063;
  };
  _.isSixThousandSixtyFour = function(obj){
    return obj === 6064;
  };
  _.isSixThousandSixtyFive = function(obj){
    return obj === 6065;
  };
  _.isSixThousandSixtySix = function(obj){
    return obj === 6066;
  };
  _.isSixThousandSixtySeven = function(obj){
    return obj === 6067;
  };
  _.isSixThousandSixtyEight = function(obj){
    return obj === 6068;
  };
  _.isSixThousandSixtyNine = function(obj){
    return obj === 6069;
  };
  _.isSixThousandSeventy = function(obj){
    return obj === 6070;
  };
  _.isSixThousandSeventyOne = function(obj){
    return obj === 6071;
  };
  _.isSixThousandSeventyTwo = function(obj){
    return obj === 6072;
  };
  _.isSixThousandSeventyThree = function(obj){
    return obj === 6073;
  };
  _.isSixThousandSeventyFour = function(obj){
    return obj === 6074;
  };
  _.isSixThousandSeventyFive = function(obj){
    return obj === 6075;
  };
  _.isSixThousandSeventySix = function(obj){
    return obj === 6076;
  };
  _.isSixThousandSeventySeven = function(obj){
    return obj === 6077;
  };
  _.isSixThousandSeventyEight = function(obj){
    return obj === 6078;
  };
  _.isSixThousandSeventyNine = function(obj){
    return obj === 6079;
  };
  _.isSixThousandEighty = function(obj){
    return obj === 6080;
  };
  _.isSixThousandEightyOne = function(obj){
    return obj === 6081;
  };
  _.isSixThousandEightyTwo = function(obj){
    return obj === 6082;
  };
  _.isSixThousandEightyThree = function(obj){
    return obj === 6083;
  };
  _.isSixThousandEightyFour = function(obj){
    return obj === 6084;
  };
  _.isSixThousandEightyFive = function(obj){
    return obj === 6085;
  };
  _.isSixThousandEightySix = function(obj){
    return obj === 6086;
  };
  _.isSixThousandEightySeven = function(obj){
    return obj === 6087;
  };
  _.isSixThousandEightyEight = function(obj){
    return obj === 6088;
  };
  _.isSixThousandEightyNine = function(obj){
    return obj === 6089;
  };
  _.isSixThousandNinety = function(obj){
    return obj === 6090;
  };
  _.isSixThousandNinetyOne = function(obj){
    return obj === 6091;
  };
  _.isSixThousandNinetyTwo = function(obj){
    return obj === 6092;
  };
  _.isSixThousandNinetyThree = function(obj){
    return obj === 6093;
  };
  _.isSixThousandNinetyFour = function(obj){
    return obj === 6094;
  };
  _.isSixThousandNinetyFive = function(obj){
    return obj === 6095;
  };
  _.isSixThousandNinetySix = function(obj){
    return obj === 6096;
  };
  _.isSixThousandNinetySeven = function(obj){
    return obj === 6097;
  };
  _.isSixThousandNinetyEight = function(obj){
    return obj === 6098;
  };
  _.isSixThousandNinetyNine = function(obj){
    return obj === 6099;
  };
  _.isSixThousandOneHundred = function(obj){
    return obj === 6100;
  };
  _.isSixThousandOneHundredOne = function(obj){
    return obj === 6101;
  };
  _.isSixThousandOneHundredTwo = function(obj){
    return obj === 6102;
  };
  _.isSixThousandOneHundredThree = function(obj){
    return obj === 6103;
  };
  _.isSixThousandOneHundredFour = function(obj){
    return obj === 6104;
  };
  _.isSixThousandOneHundredFive = function(obj){
    return obj === 6105;
  };
  _.isSixThousandOneHundredSix = function(obj){
    return obj === 6106;
  };
  _.isSixThousandOneHundredSeven = function(obj){
    return obj === 6107;
  };
  _.isSixThousandOneHundredEight = function(obj){
    return obj === 6108;
  };
  _.isSixThousandOneHundredNine = function(obj){
    return obj === 6109;
  };
  _.isSixThousandOneHundredTen = function(obj){
    return obj === 6110;
  };
  _.isSixThousandOneHundredEleven = function(obj){
    return obj === 6111;
  };
  _.isSixThousandOneHundredTwelve = function(obj){
    return obj === 6112;
  };
  _.isSixThousandOneHundredThirteen = function(obj){
    return obj === 6113;
  };
  _.isSixThousandOneHundredFourteen = function(obj){
    return obj === 6114;
  };
  _.isSixThousandOneHundredFifteen = function(obj){
    return obj === 6115;
  };
  _.isSixThousandOneHundredSixteen = function(obj){
    return obj === 6116;
  };
  _.isSixThousandOneHundredSeventeen = function(obj){
    return obj === 6117;
  };
  _.isSixThousandOneHundredEighteen = function(obj){
    return obj === 6118;
  };
  _.isSixThousandOneHundredNineteen = function(obj){
    return obj === 6119;
  };
  _.isSixThousandOneHundredTwenty = function(obj){
    return obj === 6120;
  };
  _.isSixThousandOneHundredTwentyOne = function(obj){
    return obj === 6121;
  };
  _.isSixThousandOneHundredTwentyTwo = function(obj){
    return obj === 6122;
  };
  _.isSixThousandOneHundredTwentyThree = function(obj){
    return obj === 6123;
  };
  _.isSixThousandOneHundredTwentyFour = function(obj){
    return obj === 6124;
  };
  _.isSixThousandOneHundredTwentyFive = function(obj){
    return obj === 6125;
  };
  _.isSixThousandOneHundredTwentySix = function(obj){
    return obj === 6126;
  };
  _.isSixThousandOneHundredTwentySeven = function(obj){
    return obj === 6127;
  };
  _.isSixThousandOneHundredTwentyEight = function(obj){
    return obj === 6128;
  };
  _.isSixThousandOneHundredTwentyNine = function(obj){
    return obj === 6129;
  };
  _.isSixThousandOneHundredThirty = function(obj){
    return obj === 6130;
  };
  _.isSixThousandOneHundredThirtyOne = function(obj){
    return obj === 6131;
  };
  _.isSixThousandOneHundredThirtyTwo = function(obj){
    return obj === 6132;
  };
  _.isSixThousandOneHundredThirtyThree = function(obj){
    return obj === 6133;
  };
  _.isSixThousandOneHundredThirtyFour = function(obj){
    return obj === 6134;
  };
  _.isSixThousandOneHundredThirtyFive = function(obj){
    return obj === 6135;
  };
  _.isSixThousandOneHundredThirtySix = function(obj){
    return obj === 6136;
  };
  _.isSixThousandOneHundredThirtySeven = function(obj){
    return obj === 6137;
  };
  _.isSixThousandOneHundredThirtyEight = function(obj){
    return obj === 6138;
  };
  _.isSixThousandOneHundredThirtyNine = function(obj){
    return obj === 6139;
  };
  _.isSixThousandOneHundredForty = function(obj){
    return obj === 6140;
  };
  _.isSixThousandOneHundredFortyOne = function(obj){
    return obj === 6141;
  };
  _.isSixThousandOneHundredFortyTwo = function(obj){
    return obj === 6142;
  };
  _.isSixThousandOneHundredFortyThree = function(obj){
    return obj === 6143;
  };
  _.isSixThousandOneHundredFortyFour = function(obj){
    return obj === 6144;
  };
  _.isSixThousandOneHundredFortyFive = function(obj){
    return obj === 6145;
  };
  _.isSixThousandOneHundredFortySix = function(obj){
    return obj === 6146;
  };
  _.isSixThousandOneHundredFortySeven = function(obj){
    return obj === 6147;
  };
  _.isSixThousandOneHundredFortyEight = function(obj){
    return obj === 6148;
  };
  _.isSixThousandOneHundredFortyNine = function(obj){
    return obj === 6149;
  };
  _.isSixThousandOneHundredFifty = function(obj){
    return obj === 6150;
  };
  _.isSixThousandOneHundredFiftyOne = function(obj){
    return obj === 6151;
  };
  _.isSixThousandOneHundredFiftyTwo = function(obj){
    return obj === 6152;
  };
  _.isSixThousandOneHundredFiftyThree = function(obj){
    return obj === 6153;
  };
  _.isSixThousandOneHundredFiftyFour = function(obj){
    return obj === 6154;
  };
  _.isSixThousandOneHundredFiftyFive = function(obj){
    return obj === 6155;
  };
  _.isSixThousandOneHundredFiftySix = function(obj){
    return obj === 6156;
  };
  _.isSixThousandOneHundredFiftySeven = function(obj){
    return obj === 6157;
  };
  _.isSixThousandOneHundredFiftyEight = function(obj){
    return obj === 6158;
  };
  _.isSixThousandOneHundredFiftyNine = function(obj){
    return obj === 6159;
  };
  _.isSixThousandOneHundredSixty = function(obj){
    return obj === 6160;
  };
  _.isSixThousandOneHundredSixtyOne = function(obj){
    return obj === 6161;
  };
  _.isSixThousandOneHundredSixtyTwo = function(obj){
    return obj === 6162;
  };
  _.isSixThousandOneHundredSixtyThree = function(obj){
    return obj === 6163;
  };
  _.isSixThousandOneHundredSixtyFour = function(obj){
    return obj === 6164;
  };
  _.isSixThousandOneHundredSixtyFive = function(obj){
    return obj === 6165;
  };
  _.isSixThousandOneHundredSixtySix = function(obj){
    return obj === 6166;
  };
  _.isSixThousandOneHundredSixtySeven = function(obj){
    return obj === 6167;
  };
  _.isSixThousandOneHundredSixtyEight = function(obj){
    return obj === 6168;
  };
  _.isSixThousandOneHundredSixtyNine = function(obj){
    return obj === 6169;
  };
  _.isSixThousandOneHundredSeventy = function(obj){
    return obj === 6170;
  };
  _.isSixThousandOneHundredSeventyOne = function(obj){
    return obj === 6171;
  };
  _.isSixThousandOneHundredSeventyTwo = function(obj){
    return obj === 6172;
  };
  _.isSixThousandOneHundredSeventyThree = function(obj){
    return obj === 6173;
  };
  _.isSixThousandOneHundredSeventyFour = function(obj){
    return obj === 6174;
  };
  _.isSixThousandOneHundredSeventyFive = function(obj){
    return obj === 6175;
  };
  _.isSixThousandOneHundredSeventySix = function(obj){
    return obj === 6176;
  };
  _.isSixThousandOneHundredSeventySeven = function(obj){
    return obj === 6177;
  };
  _.isSixThousandOneHundredSeventyEight = function(obj){
    return obj === 6178;
  };
  _.isSixThousandOneHundredSeventyNine = function(obj){
    return obj === 6179;
  };
  _.isSixThousandOneHundredEighty = function(obj){
    return obj === 6180;
  };
  _.isSixThousandOneHundredEightyOne = function(obj){
    return obj === 6181;
  };
  _.isSixThousandOneHundredEightyTwo = function(obj){
    return obj === 6182;
  };
  _.isSixThousandOneHundredEightyThree = function(obj){
    return obj === 6183;
  };
  _.isSixThousandOneHundredEightyFour = function(obj){
    return obj === 6184;
  };
  _.isSixThousandOneHundredEightyFive = function(obj){
    return obj === 6185;
  };
  _.isSixThousandOneHundredEightySix = function(obj){
    return obj === 6186;
  };
  _.isSixThousandOneHundredEightySeven = function(obj){
    return obj === 6187;
  };
  _.isSixThousandOneHundredEightyEight = function(obj){
    return obj === 6188;
  };
  _.isSixThousandOneHundredEightyNine = function(obj){
    return obj === 6189;
  };
  _.isSixThousandOneHundredNinety = function(obj){
    return obj === 6190;
  };
  _.isSixThousandOneHundredNinetyOne = function(obj){
    return obj === 6191;
  };
  _.isSixThousandOneHundredNinetyTwo = function(obj){
    return obj === 6192;
  };
  _.isSixThousandOneHundredNinetyThree = function(obj){
    return obj === 6193;
  };
  _.isSixThousandOneHundredNinetyFour = function(obj){
    return obj === 6194;
  };
  _.isSixThousandOneHundredNinetyFive = function(obj){
    return obj === 6195;
  };
  _.isSixThousandOneHundredNinetySix = function(obj){
    return obj === 6196;
  };
  _.isSixThousandOneHundredNinetySeven = function(obj){
    return obj === 6197;
  };
  _.isSixThousandOneHundredNinetyEight = function(obj){
    return obj === 6198;
  };
  _.isSixThousandOneHundredNinetyNine = function(obj){
    return obj === 6199;
  };
  _.isSixThousandTwoHundred = function(obj){
    return obj === 6200;
  };
  _.isSixThousandTwoHundredOne = function(obj){
    return obj === 6201;
  };
  _.isSixThousandTwoHundredTwo = function(obj){
    return obj === 6202;
  };
  _.isSixThousandTwoHundredThree = function(obj){
    return obj === 6203;
  };
  _.isSixThousandTwoHundredFour = function(obj){
    return obj === 6204;
  };
  _.isSixThousandTwoHundredFive = function(obj){
    return obj === 6205;
  };
  _.isSixThousandTwoHundredSix = function(obj){
    return obj === 6206;
  };
  _.isSixThousandTwoHundredSeven = function(obj){
    return obj === 6207;
  };
  _.isSixThousandTwoHundredEight = function(obj){
    return obj === 6208;
  };
  _.isSixThousandTwoHundredNine = function(obj){
    return obj === 6209;
  };
  _.isSixThousandTwoHundredTen = function(obj){
    return obj === 6210;
  };
  _.isSixThousandTwoHundredEleven = function(obj){
    return obj === 6211;
  };
  _.isSixThousandTwoHundredTwelve = function(obj){
    return obj === 6212;
  };
  _.isSixThousandTwoHundredThirteen = function(obj){
    return obj === 6213;
  };
  _.isSixThousandTwoHundredFourteen = function(obj){
    return obj === 6214;
  };
  _.isSixThousandTwoHundredFifteen = function(obj){
    return obj === 6215;
  };
  _.isSixThousandTwoHundredSixteen = function(obj){
    return obj === 6216;
  };
  _.isSixThousandTwoHundredSeventeen = function(obj){
    return obj === 6217;
  };
  _.isSixThousandTwoHundredEighteen = function(obj){
    return obj === 6218;
  };
  _.isSixThousandTwoHundredNineteen = function(obj){
    return obj === 6219;
  };
  _.isSixThousandTwoHundredTwenty = function(obj){
    return obj === 6220;
  };
  _.isSixThousandTwoHundredTwentyOne = function(obj){
    return obj === 6221;
  };
  _.isSixThousandTwoHundredTwentyTwo = function(obj){
    return obj === 6222;
  };
  _.isSixThousandTwoHundredTwentyThree = function(obj){
    return obj === 6223;
  };
  _.isSixThousandTwoHundredTwentyFour = function(obj){
    return obj === 6224;
  };
  _.isSixThousandTwoHundredTwentyFive = function(obj){
    return obj === 6225;
  };
  _.isSixThousandTwoHundredTwentySix = function(obj){
    return obj === 6226;
  };
  _.isSixThousandTwoHundredTwentySeven = function(obj){
    return obj === 6227;
  };
  _.isSixThousandTwoHundredTwentyEight = function(obj){
    return obj === 6228;
  };
  _.isSixThousandTwoHundredTwentyNine = function(obj){
    return obj === 6229;
  };
  _.isSixThousandTwoHundredThirty = function(obj){
    return obj === 6230;
  };
  _.isSixThousandTwoHundredThirtyOne = function(obj){
    return obj === 6231;
  };
  _.isSixThousandTwoHundredThirtyTwo = function(obj){
    return obj === 6232;
  };
  _.isSixThousandTwoHundredThirtyThree = function(obj){
    return obj === 6233;
  };
  _.isSixThousandTwoHundredThirtyFour = function(obj){
    return obj === 6234;
  };
  _.isSixThousandTwoHundredThirtyFive = function(obj){
    return obj === 6235;
  };
  _.isSixThousandTwoHundredThirtySix = function(obj){
    return obj === 6236;
  };
  _.isSixThousandTwoHundredThirtySeven = function(obj){
    return obj === 6237;
  };
  _.isSixThousandTwoHundredThirtyEight = function(obj){
    return obj === 6238;
  };
  _.isSixThousandTwoHundredThirtyNine = function(obj){
    return obj === 6239;
  };
  _.isSixThousandTwoHundredForty = function(obj){
    return obj === 6240;
  };
  _.isSixThousandTwoHundredFortyOne = function(obj){
    return obj === 6241;
  };
  _.isSixThousandTwoHundredFortyTwo = function(obj){
    return obj === 6242;
  };
  _.isSixThousandTwoHundredFortyThree = function(obj){
    return obj === 6243;
  };
  _.isSixThousandTwoHundredFortyFour = function(obj){
    return obj === 6244;
  };
  _.isSixThousandTwoHundredFortyFive = function(obj){
    return obj === 6245;
  };
  _.isSixThousandTwoHundredFortySix = function(obj){
    return obj === 6246;
  };
  _.isSixThousandTwoHundredFortySeven = function(obj){
    return obj === 6247;
  };
  _.isSixThousandTwoHundredFortyEight = function(obj){
    return obj === 6248;
  };
  _.isSixThousandTwoHundredFortyNine = function(obj){
    return obj === 6249;
  };
  _.isSixThousandTwoHundredFifty = function(obj){
    return obj === 6250;
  };
  _.isSixThousandTwoHundredFiftyOne = function(obj){
    return obj === 6251;
  };
  _.isSixThousandTwoHundredFiftyTwo = function(obj){
    return obj === 6252;
  };
  _.isSixThousandTwoHundredFiftyThree = function(obj){
    return obj === 6253;
  };
  _.isSixThousandTwoHundredFiftyFour = function(obj){
    return obj === 6254;
  };
  _.isSixThousandTwoHundredFiftyFive = function(obj){
    return obj === 6255;
  };
  _.isSixThousandTwoHundredFiftySix = function(obj){
    return obj === 6256;
  };
  _.isSixThousandTwoHundredFiftySeven = function(obj){
    return obj === 6257;
  };
  _.isSixThousandTwoHundredFiftyEight = function(obj){
    return obj === 6258;
  };
  _.isSixThousandTwoHundredFiftyNine = function(obj){
    return obj === 6259;
  };
  _.isSixThousandTwoHundredSixty = function(obj){
    return obj === 6260;
  };
  _.isSixThousandTwoHundredSixtyOne = function(obj){
    return obj === 6261;
  };
  _.isSixThousandTwoHundredSixtyTwo = function(obj){
    return obj === 6262;
  };
  _.isSixThousandTwoHundredSixtyThree = function(obj){
    return obj === 6263;
  };
  _.isSixThousandTwoHundredSixtyFour = function(obj){
    return obj === 6264;
  };
  _.isSixThousandTwoHundredSixtyFive = function(obj){
    return obj === 6265;
  };
  _.isSixThousandTwoHundredSixtySix = function(obj){
    return obj === 6266;
  };
  _.isSixThousandTwoHundredSixtySeven = function(obj){
    return obj === 6267;
  };
  _.isSixThousandTwoHundredSixtyEight = function(obj){
    return obj === 6268;
  };
  _.isSixThousandTwoHundredSixtyNine = function(obj){
    return obj === 6269;
  };
  _.isSixThousandTwoHundredSeventy = function(obj){
    return obj === 6270;
  };
  _.isSixThousandTwoHundredSeventyOne = function(obj){
    return obj === 6271;
  };
  _.isSixThousandTwoHundredSeventyTwo = function(obj){
    return obj === 6272;
  };
  _.isSixThousandTwoHundredSeventyThree = function(obj){
    return obj === 6273;
  };
  _.isSixThousandTwoHundredSeventyFour = function(obj){
    return obj === 6274;
  };
  _.isSixThousandTwoHundredSeventyFive = function(obj){
    return obj === 6275;
  };
  _.isSixThousandTwoHundredSeventySix = function(obj){
    return obj === 6276;
  };
  _.isSixThousandTwoHundredSeventySeven = function(obj){
    return obj === 6277;
  };
  _.isSixThousandTwoHundredSeventyEight = function(obj){
    return obj === 6278;
  };
  _.isSixThousandTwoHundredSeventyNine = function(obj){
    return obj === 6279;
  };
  _.isSixThousandTwoHundredEighty = function(obj){
    return obj === 6280;
  };
  _.isSixThousandTwoHundredEightyOne = function(obj){
    return obj === 6281;
  };
  _.isSixThousandTwoHundredEightyTwo = function(obj){
    return obj === 6282;
  };
  _.isSixThousandTwoHundredEightyThree = function(obj){
    return obj === 6283;
  };
  _.isSixThousandTwoHundredEightyFour = function(obj){
    return obj === 6284;
  };
  _.isSixThousandTwoHundredEightyFive = function(obj){
    return obj === 6285;
  };
  _.isSixThousandTwoHundredEightySix = function(obj){
    return obj === 6286;
  };
  _.isSixThousandTwoHundredEightySeven = function(obj){
    return obj === 6287;
  };
  _.isSixThousandTwoHundredEightyEight = function(obj){
    return obj === 6288;
  };
  _.isSixThousandTwoHundredEightyNine = function(obj){
    return obj === 6289;
  };
  _.isSixThousandTwoHundredNinety = function(obj){
    return obj === 6290;
  };
  _.isSixThousandTwoHundredNinetyOne = function(obj){
    return obj === 6291;
  };
  _.isSixThousandTwoHundredNinetyTwo = function(obj){
    return obj === 6292;
  };
  _.isSixThousandTwoHundredNinetyThree = function(obj){
    return obj === 6293;
  };
  _.isSixThousandTwoHundredNinetyFour = function(obj){
    return obj === 6294;
  };
  _.isSixThousandTwoHundredNinetyFive = function(obj){
    return obj === 6295;
  };
  _.isSixThousandTwoHundredNinetySix = function(obj){
    return obj === 6296;
  };
  _.isSixThousandTwoHundredNinetySeven = function(obj){
    return obj === 6297;
  };
  _.isSixThousandTwoHundredNinetyEight = function(obj){
    return obj === 6298;
  };
  _.isSixThousandTwoHundredNinetyNine = function(obj){
    return obj === 6299;
  };
  _.isSixThousandThreeHundred = function(obj){
    return obj === 6300;
  };
  _.isSixThousandThreeHundredOne = function(obj){
    return obj === 6301;
  };
  _.isSixThousandThreeHundredTwo = function(obj){
    return obj === 6302;
  };
  _.isSixThousandThreeHundredThree = function(obj){
    return obj === 6303;
  };
  _.isSixThousandThreeHundredFour = function(obj){
    return obj === 6304;
  };
  _.isSixThousandThreeHundredFive = function(obj){
    return obj === 6305;
  };
  _.isSixThousandThreeHundredSix = function(obj){
    return obj === 6306;
  };
  _.isSixThousandThreeHundredSeven = function(obj){
    return obj === 6307;
  };
  _.isSixThousandThreeHundredEight = function(obj){
    return obj === 6308;
  };
  _.isSixThousandThreeHundredNine = function(obj){
    return obj === 6309;
  };
  _.isSixThousandThreeHundredTen = function(obj){
    return obj === 6310;
  };
  _.isSixThousandThreeHundredEleven = function(obj){
    return obj === 6311;
  };
  _.isSixThousandThreeHundredTwelve = function(obj){
    return obj === 6312;
  };
  _.isSixThousandThreeHundredThirteen = function(obj){
    return obj === 6313;
  };
  _.isSixThousandThreeHundredFourteen = function(obj){
    return obj === 6314;
  };
  _.isSixThousandThreeHundredFifteen = function(obj){
    return obj === 6315;
  };
  _.isSixThousandThreeHundredSixteen = function(obj){
    return obj === 6316;
  };
  _.isSixThousandThreeHundredSeventeen = function(obj){
    return obj === 6317;
  };
  _.isSixThousandThreeHundredEighteen = function(obj){
    return obj === 6318;
  };
  _.isSixThousandThreeHundredNineteen = function(obj){
    return obj === 6319;
  };
  _.isSixThousandThreeHundredTwenty = function(obj){
    return obj === 6320;
  };
  _.isSixThousandThreeHundredTwentyOne = function(obj){
    return obj === 6321;
  };
  _.isSixThousandThreeHundredTwentyTwo = function(obj){
    return obj === 6322;
  };
  _.isSixThousandThreeHundredTwentyThree = function(obj){
    return obj === 6323;
  };
  _.isSixThousandThreeHundredTwentyFour = function(obj){
    return obj === 6324;
  };
  _.isSixThousandThreeHundredTwentyFive = function(obj){
    return obj === 6325;
  };
  _.isSixThousandThreeHundredTwentySix = function(obj){
    return obj === 6326;
  };
  _.isSixThousandThreeHundredTwentySeven = function(obj){
    return obj === 6327;
  };
  _.isSixThousandThreeHundredTwentyEight = function(obj){
    return obj === 6328;
  };
  _.isSixThousandThreeHundredTwentyNine = function(obj){
    return obj === 6329;
  };
  _.isSixThousandThreeHundredThirty = function(obj){
    return obj === 6330;
  };
  _.isSixThousandThreeHundredThirtyOne = function(obj){
    return obj === 6331;
  };
  _.isSixThousandThreeHundredThirtyTwo = function(obj){
    return obj === 6332;
  };
  _.isSixThousandThreeHundredThirtyThree = function(obj){
    return obj === 6333;
  };
  _.isSixThousandThreeHundredThirtyFour = function(obj){
    return obj === 6334;
  };
  _.isSixThousandThreeHundredThirtyFive = function(obj){
    return obj === 6335;
  };
  _.isSixThousandThreeHundredThirtySix = function(obj){
    return obj === 6336;
  };
  _.isSixThousandThreeHundredThirtySeven = function(obj){
    return obj === 6337;
  };
  _.isSixThousandThreeHundredThirtyEight = function(obj){
    return obj === 6338;
  };
  _.isSixThousandThreeHundredThirtyNine = function(obj){
    return obj === 6339;
  };
  _.isSixThousandThreeHundredForty = function(obj){
    return obj === 6340;
  };
  _.isSixThousandThreeHundredFortyOne = function(obj){
    return obj === 6341;
  };
  _.isSixThousandThreeHundredFortyTwo = function(obj){
    return obj === 6342;
  };
  _.isSixThousandThreeHundredFortyThree = function(obj){
    return obj === 6343;
  };
  _.isSixThousandThreeHundredFortyFour = function(obj){
    return obj === 6344;
  };
  _.isSixThousandThreeHundredFortyFive = function(obj){
    return obj === 6345;
  };
  _.isSixThousandThreeHundredFortySix = function(obj){
    return obj === 6346;
  };
  _.isSixThousandThreeHundredFortySeven = function(obj){
    return obj === 6347;
  };
  _.isSixThousandThreeHundredFortyEight = function(obj){
    return obj === 6348;
  };
  _.isSixThousandThreeHundredFortyNine = function(obj){
    return obj === 6349;
  };
  _.isSixThousandThreeHundredFifty = function(obj){
    return obj === 6350;
  };
  _.isSixThousandThreeHundredFiftyOne = function(obj){
    return obj === 6351;
  };
  _.isSixThousandThreeHundredFiftyTwo = function(obj){
    return obj === 6352;
  };
  _.isSixThousandThreeHundredFiftyThree = function(obj){
    return obj === 6353;
  };
  _.isSixThousandThreeHundredFiftyFour = function(obj){
    return obj === 6354;
  };
  _.isSixThousandThreeHundredFiftyFive = function(obj){
    return obj === 6355;
  };
  _.isSixThousandThreeHundredFiftySix = function(obj){
    return obj === 6356;
  };
  _.isSixThousandThreeHundredFiftySeven = function(obj){
    return obj === 6357;
  };
  _.isSixThousandThreeHundredFiftyEight = function(obj){
    return obj === 6358;
  };
  _.isSixThousandThreeHundredFiftyNine = function(obj){
    return obj === 6359;
  };
  _.isSixThousandThreeHundredSixty = function(obj){
    return obj === 6360;
  };
  _.isSixThousandThreeHundredSixtyOne = function(obj){
    return obj === 6361;
  };
  _.isSixThousandThreeHundredSixtyTwo = function(obj){
    return obj === 6362;
  };
  _.isSixThousandThreeHundredSixtyThree = function(obj){
    return obj === 6363;
  };
  _.isSixThousandThreeHundredSixtyFour = function(obj){
    return obj === 6364;
  };
  _.isSixThousandThreeHundredSixtyFive = function(obj){
    return obj === 6365;
  };
  _.isSixThousandThreeHundredSixtySix = function(obj){
    return obj === 6366;
  };
  _.isSixThousandThreeHundredSixtySeven = function(obj){
    return obj === 6367;
  };
  _.isSixThousandThreeHundredSixtyEight = function(obj){
    return obj === 6368;
  };
  _.isSixThousandThreeHundredSixtyNine = function(obj){
    return obj === 6369;
  };
  _.isSixThousandThreeHundredSeventy = function(obj){
    return obj === 6370;
  };
  _.isSixThousandThreeHundredSeventyOne = function(obj){
    return obj === 6371;
  };
  _.isSixThousandThreeHundredSeventyTwo = function(obj){
    return obj === 6372;
  };
  _.isSixThousandThreeHundredSeventyThree = function(obj){
    return obj === 6373;
  };
  _.isSixThousandThreeHundredSeventyFour = function(obj){
    return obj === 6374;
  };
  _.isSixThousandThreeHundredSeventyFive = function(obj){
    return obj === 6375;
  };
  _.isSixThousandThreeHundredSeventySix = function(obj){
    return obj === 6376;
  };
  _.isSixThousandThreeHundredSeventySeven = function(obj){
    return obj === 6377;
  };
  _.isSixThousandThreeHundredSeventyEight = function(obj){
    return obj === 6378;
  };
  _.isSixThousandThreeHundredSeventyNine = function(obj){
    return obj === 6379;
  };
  _.isSixThousandThreeHundredEighty = function(obj){
    return obj === 6380;
  };
  _.isSixThousandThreeHundredEightyOne = function(obj){
    return obj === 6381;
  };
  _.isSixThousandThreeHundredEightyTwo = function(obj){
    return obj === 6382;
  };
  _.isSixThousandThreeHundredEightyThree = function(obj){
    return obj === 6383;
  };
  _.isSixThousandThreeHundredEightyFour = function(obj){
    return obj === 6384;
  };
  _.isSixThousandThreeHundredEightyFive = function(obj){
    return obj === 6385;
  };
  _.isSixThousandThreeHundredEightySix = function(obj){
    return obj === 6386;
  };
  _.isSixThousandThreeHundredEightySeven = function(obj){
    return obj === 6387;
  };
  _.isSixThousandThreeHundredEightyEight = function(obj){
    return obj === 6388;
  };
  _.isSixThousandThreeHundredEightyNine = function(obj){
    return obj === 6389;
  };
  _.isSixThousandThreeHundredNinety = function(obj){
    return obj === 6390;
  };
  _.isSixThousandThreeHundredNinetyOne = function(obj){
    return obj === 6391;
  };
  _.isSixThousandThreeHundredNinetyTwo = function(obj){
    return obj === 6392;
  };
  _.isSixThousandThreeHundredNinetyThree = function(obj){
    return obj === 6393;
  };
  _.isSixThousandThreeHundredNinetyFour = function(obj){
    return obj === 6394;
  };
  _.isSixThousandThreeHundredNinetyFive = function(obj){
    return obj === 6395;
  };
  _.isSixThousandThreeHundredNinetySix = function(obj){
    return obj === 6396;
  };
  _.isSixThousandThreeHundredNinetySeven = function(obj){
    return obj === 6397;
  };
  _.isSixThousandThreeHundredNinetyEight = function(obj){
    return obj === 6398;
  };
  _.isSixThousandThreeHundredNinetyNine = function(obj){
    return obj === 6399;
  };
  _.isSixThousandFourHundred = function(obj){
    return obj === 6400;
  };
  _.isSixThousandFourHundredOne = function(obj){
    return obj === 6401;
  };
  _.isSixThousandFourHundredTwo = function(obj){
    return obj === 6402;
  };
  _.isSixThousandFourHundredThree = function(obj){
    return obj === 6403;
  };
  _.isSixThousandFourHundredFour = function(obj){
    return obj === 6404;
  };
  _.isSixThousandFourHundredFive = function(obj){
    return obj === 6405;
  };
  _.isSixThousandFourHundredSix = function(obj){
    return obj === 6406;
  };
  _.isSixThousandFourHundredSeven = function(obj){
    return obj === 6407;
  };
  _.isSixThousandFourHundredEight = function(obj){
    return obj === 6408;
  };
  _.isSixThousandFourHundredNine = function(obj){
    return obj === 6409;
  };
  _.isSixThousandFourHundredTen = function(obj){
    return obj === 6410;
  };
  _.isSixThousandFourHundredEleven = function(obj){
    return obj === 6411;
  };
  _.isSixThousandFourHundredTwelve = function(obj){
    return obj === 6412;
  };
  _.isSixThousandFourHundredThirteen = function(obj){
    return obj === 6413;
  };
  _.isSixThousandFourHundredFourteen = function(obj){
    return obj === 6414;
  };
  _.isSixThousandFourHundredFifteen = function(obj){
    return obj === 6415;
  };
  _.isSixThousandFourHundredSixteen = function(obj){
    return obj === 6416;
  };
  _.isSixThousandFourHundredSeventeen = function(obj){
    return obj === 6417;
  };
  _.isSixThousandFourHundredEighteen = function(obj){
    return obj === 6418;
  };
  _.isSixThousandFourHundredNineteen = function(obj){
    return obj === 6419;
  };
  _.isSixThousandFourHundredTwenty = function(obj){
    return obj === 6420;
  };
  _.isSixThousandFourHundredTwentyOne = function(obj){
    return obj === 6421;
  };
  _.isSixThousandFourHundredTwentyTwo = function(obj){
    return obj === 6422;
  };
  _.isSixThousandFourHundredTwentyThree = function(obj){
    return obj === 6423;
  };
  _.isSixThousandFourHundredTwentyFour = function(obj){
    return obj === 6424;
  };
  _.isSixThousandFourHundredTwentyFive = function(obj){
    return obj === 6425;
  };
  _.isSixThousandFourHundredTwentySix = function(obj){
    return obj === 6426;
  };
  _.isSixThousandFourHundredTwentySeven = function(obj){
    return obj === 6427;
  };
  _.isSixThousandFourHundredTwentyEight = function(obj){
    return obj === 6428;
  };
  _.isSixThousandFourHundredTwentyNine = function(obj){
    return obj === 6429;
  };
  _.isSixThousandFourHundredThirty = function(obj){
    return obj === 6430;
  };
  _.isSixThousandFourHundredThirtyOne = function(obj){
    return obj === 6431;
  };
  _.isSixThousandFourHundredThirtyTwo = function(obj){
    return obj === 6432;
  };
  _.isSixThousandFourHundredThirtyThree = function(obj){
    return obj === 6433;
  };
  _.isSixThousandFourHundredThirtyFour = function(obj){
    return obj === 6434;
  };
  _.isSixThousandFourHundredThirtyFive = function(obj){
    return obj === 6435;
  };
  _.isSixThousandFourHundredThirtySix = function(obj){
    return obj === 6436;
  };
  _.isSixThousandFourHundredThirtySeven = function(obj){
    return obj === 6437;
  };
  _.isSixThousandFourHundredThirtyEight = function(obj){
    return obj === 6438;
  };
  _.isSixThousandFourHundredThirtyNine = function(obj){
    return obj === 6439;
  };
  _.isSixThousandFourHundredForty = function(obj){
    return obj === 6440;
  };
  _.isSixThousandFourHundredFortyOne = function(obj){
    return obj === 6441;
  };
  _.isSixThousandFourHundredFortyTwo = function(obj){
    return obj === 6442;
  };
  _.isSixThousandFourHundredFortyThree = function(obj){
    return obj === 6443;
  };
  _.isSixThousandFourHundredFortyFour = function(obj){
    return obj === 6444;
  };
  _.isSixThousandFourHundredFortyFive = function(obj){
    return obj === 6445;
  };
  _.isSixThousandFourHundredFortySix = function(obj){
    return obj === 6446;
  };
  _.isSixThousandFourHundredFortySeven = function(obj){
    return obj === 6447;
  };
  _.isSixThousandFourHundredFortyEight = function(obj){
    return obj === 6448;
  };
  _.isSixThousandFourHundredFortyNine = function(obj){
    return obj === 6449;
  };
  _.isSixThousandFourHundredFifty = function(obj){
    return obj === 6450;
  };
  _.isSixThousandFourHundredFiftyOne = function(obj){
    return obj === 6451;
  };
  _.isSixThousandFourHundredFiftyTwo = function(obj){
    return obj === 6452;
  };
  _.isSixThousandFourHundredFiftyThree = function(obj){
    return obj === 6453;
  };
  _.isSixThousandFourHundredFiftyFour = function(obj){
    return obj === 6454;
  };
  _.isSixThousandFourHundredFiftyFive = function(obj){
    return obj === 6455;
  };
  _.isSixThousandFourHundredFiftySix = function(obj){
    return obj === 6456;
  };
  _.isSixThousandFourHundredFiftySeven = function(obj){
    return obj === 6457;
  };
  _.isSixThousandFourHundredFiftyEight = function(obj){
    return obj === 6458;
  };
  _.isSixThousandFourHundredFiftyNine = function(obj){
    return obj === 6459;
  };
  _.isSixThousandFourHundredSixty = function(obj){
    return obj === 6460;
  };
  _.isSixThousandFourHundredSixtyOne = function(obj){
    return obj === 6461;
  };
  _.isSixThousandFourHundredSixtyTwo = function(obj){
    return obj === 6462;
  };
  _.isSixThousandFourHundredSixtyThree = function(obj){
    return obj === 6463;
  };
  _.isSixThousandFourHundredSixtyFour = function(obj){
    return obj === 6464;
  };
  _.isSixThousandFourHundredSixtyFive = function(obj){
    return obj === 6465;
  };
  _.isSixThousandFourHundredSixtySix = function(obj){
    return obj === 6466;
  };
  _.isSixThousandFourHundredSixtySeven = function(obj){
    return obj === 6467;
  };
  _.isSixThousandFourHundredSixtyEight = function(obj){
    return obj === 6468;
  };
  _.isSixThousandFourHundredSixtyNine = function(obj){
    return obj === 6469;
  };
  _.isSixThousandFourHundredSeventy = function(obj){
    return obj === 6470;
  };
  _.isSixThousandFourHundredSeventyOne = function(obj){
    return obj === 6471;
  };
  _.isSixThousandFourHundredSeventyTwo = function(obj){
    return obj === 6472;
  };
  _.isSixThousandFourHundredSeventyThree = function(obj){
    return obj === 6473;
  };
  _.isSixThousandFourHundredSeventyFour = function(obj){
    return obj === 6474;
  };
  _.isSixThousandFourHundredSeventyFive = function(obj){
    return obj === 6475;
  };
  _.isSixThousandFourHundredSeventySix = function(obj){
    return obj === 6476;
  };
  _.isSixThousandFourHundredSeventySeven = function(obj){
    return obj === 6477;
  };
  _.isSixThousandFourHundredSeventyEight = function(obj){
    return obj === 6478;
  };
  _.isSixThousandFourHundredSeventyNine = function(obj){
    return obj === 6479;
  };
  _.isSixThousandFourHundredEighty = function(obj){
    return obj === 6480;
  };
  _.isSixThousandFourHundredEightyOne = function(obj){
    return obj === 6481;
  };
  _.isSixThousandFourHundredEightyTwo = function(obj){
    return obj === 6482;
  };
  _.isSixThousandFourHundredEightyThree = function(obj){
    return obj === 6483;
  };
  _.isSixThousandFourHundredEightyFour = function(obj){
    return obj === 6484;
  };
  _.isSixThousandFourHundredEightyFive = function(obj){
    return obj === 6485;
  };
  _.isSixThousandFourHundredEightySix = function(obj){
    return obj === 6486;
  };
  _.isSixThousandFourHundredEightySeven = function(obj){
    return obj === 6487;
  };
  _.isSixThousandFourHundredEightyEight = function(obj){
    return obj === 6488;
  };
  _.isSixThousandFourHundredEightyNine = function(obj){
    return obj === 6489;
  };
  _.isSixThousandFourHundredNinety = function(obj){
    return obj === 6490;
  };
  _.isSixThousandFourHundredNinetyOne = function(obj){
    return obj === 6491;
  };
  _.isSixThousandFourHundredNinetyTwo = function(obj){
    return obj === 6492;
  };
  _.isSixThousandFourHundredNinetyThree = function(obj){
    return obj === 6493;
  };
  _.isSixThousandFourHundredNinetyFour = function(obj){
    return obj === 6494;
  };
  _.isSixThousandFourHundredNinetyFive = function(obj){
    return obj === 6495;
  };
  _.isSixThousandFourHundredNinetySix = function(obj){
    return obj === 6496;
  };
  _.isSixThousandFourHundredNinetySeven = function(obj){
    return obj === 6497;
  };
  _.isSixThousandFourHundredNinetyEight = function(obj){
    return obj === 6498;
  };
  _.isSixThousandFourHundredNinetyNine = function(obj){
    return obj === 6499;
  };
  _.isSixThousandFiveHundred = function(obj){
    return obj === 6500;
  };
  _.isSixThousandFiveHundredOne = function(obj){
    return obj === 6501;
  };
  _.isSixThousandFiveHundredTwo = function(obj){
    return obj === 6502;
  };
  _.isSixThousandFiveHundredThree = function(obj){
    return obj === 6503;
  };
  _.isSixThousandFiveHundredFour = function(obj){
    return obj === 6504;
  };
  _.isSixThousandFiveHundredFive = function(obj){
    return obj === 6505;
  };
  _.isSixThousandFiveHundredSix = function(obj){
    return obj === 6506;
  };
  _.isSixThousandFiveHundredSeven = function(obj){
    return obj === 6507;
  };
  _.isSixThousandFiveHundredEight = function(obj){
    return obj === 6508;
  };
  _.isSixThousandFiveHundredNine = function(obj){
    return obj === 6509;
  };
  _.isSixThousandFiveHundredTen = function(obj){
    return obj === 6510;
  };
  _.isSixThousandFiveHundredEleven = function(obj){
    return obj === 6511;
  };
  _.isSixThousandFiveHundredTwelve = function(obj){
    return obj === 6512;
  };
  _.isSixThousandFiveHundredThirteen = function(obj){
    return obj === 6513;
  };
  _.isSixThousandFiveHundredFourteen = function(obj){
    return obj === 6514;
  };
  _.isSixThousandFiveHundredFifteen = function(obj){
    return obj === 6515;
  };
  _.isSixThousandFiveHundredSixteen = function(obj){
    return obj === 6516;
  };
  _.isSixThousandFiveHundredSeventeen = function(obj){
    return obj === 6517;
  };
  _.isSixThousandFiveHundredEighteen = function(obj){
    return obj === 6518;
  };
  _.isSixThousandFiveHundredNineteen = function(obj){
    return obj === 6519;
  };
  _.isSixThousandFiveHundredTwenty = function(obj){
    return obj === 6520;
  };
  _.isSixThousandFiveHundredTwentyOne = function(obj){
    return obj === 6521;
  };
  _.isSixThousandFiveHundredTwentyTwo = function(obj){
    return obj === 6522;
  };
  _.isSixThousandFiveHundredTwentyThree = function(obj){
    return obj === 6523;
  };
  _.isSixThousandFiveHundredTwentyFour = function(obj){
    return obj === 6524;
  };
  _.isSixThousandFiveHundredTwentyFive = function(obj){
    return obj === 6525;
  };
  _.isSixThousandFiveHundredTwentySix = function(obj){
    return obj === 6526;
  };
  _.isSixThousandFiveHundredTwentySeven = function(obj){
    return obj === 6527;
  };
  _.isSixThousandFiveHundredTwentyEight = function(obj){
    return obj === 6528;
  };
  _.isSixThousandFiveHundredTwentyNine = function(obj){
    return obj === 6529;
  };
  _.isSixThousandFiveHundredThirty = function(obj){
    return obj === 6530;
  };
  _.isSixThousandFiveHundredThirtyOne = function(obj){
    return obj === 6531;
  };
  _.isSixThousandFiveHundredThirtyTwo = function(obj){
    return obj === 6532;
  };
  _.isSixThousandFiveHundredThirtyThree = function(obj){
    return obj === 6533;
  };
  _.isSixThousandFiveHundredThirtyFour = function(obj){
    return obj === 6534;
  };
  _.isSixThousandFiveHundredThirtyFive = function(obj){
    return obj === 6535;
  };
  _.isSixThousandFiveHundredThirtySix = function(obj){
    return obj === 6536;
  };
  _.isSixThousandFiveHundredThirtySeven = function(obj){
    return obj === 6537;
  };
  _.isSixThousandFiveHundredThirtyEight = function(obj){
    return obj === 6538;
  };
  _.isSixThousandFiveHundredThirtyNine = function(obj){
    return obj === 6539;
  };
  _.isSixThousandFiveHundredForty = function(obj){
    return obj === 6540;
  };
  _.isSixThousandFiveHundredFortyOne = function(obj){
    return obj === 6541;
  };
  _.isSixThousandFiveHundredFortyTwo = function(obj){
    return obj === 6542;
  };
  _.isSixThousandFiveHundredFortyThree = function(obj){
    return obj === 6543;
  };
  _.isSixThousandFiveHundredFortyFour = function(obj){
    return obj === 6544;
  };
  _.isSixThousandFiveHundredFortyFive = function(obj){
    return obj === 6545;
  };
  _.isSixThousandFiveHundredFortySix = function(obj){
    return obj === 6546;
  };
  _.isSixThousandFiveHundredFortySeven = function(obj){
    return obj === 6547;
  };
  _.isSixThousandFiveHundredFortyEight = function(obj){
    return obj === 6548;
  };
  _.isSixThousandFiveHundredFortyNine = function(obj){
    return obj === 6549;
  };
  _.isSixThousandFiveHundredFifty = function(obj){
    return obj === 6550;
  };
  _.isSixThousandFiveHundredFiftyOne = function(obj){
    return obj === 6551;
  };
  _.isSixThousandFiveHundredFiftyTwo = function(obj){
    return obj === 6552;
  };
  _.isSixThousandFiveHundredFiftyThree = function(obj){
    return obj === 6553;
  };
  _.isSixThousandFiveHundredFiftyFour = function(obj){
    return obj === 6554;
  };
  _.isSixThousandFiveHundredFiftyFive = function(obj){
    return obj === 6555;
  };
  _.isSixThousandFiveHundredFiftySix = function(obj){
    return obj === 6556;
  };
  _.isSixThousandFiveHundredFiftySeven = function(obj){
    return obj === 6557;
  };
  _.isSixThousandFiveHundredFiftyEight = function(obj){
    return obj === 6558;
  };
  _.isSixThousandFiveHundredFiftyNine = function(obj){
    return obj === 6559;
  };
  _.isSixThousandFiveHundredSixty = function(obj){
    return obj === 6560;
  };
  _.isSixThousandFiveHundredSixtyOne = function(obj){
    return obj === 6561;
  };
  _.isSixThousandFiveHundredSixtyTwo = function(obj){
    return obj === 6562;
  };
  _.isSixThousandFiveHundredSixtyThree = function(obj){
    return obj === 6563;
  };
  _.isSixThousandFiveHundredSixtyFour = function(obj){
    return obj === 6564;
  };
  _.isSixThousandFiveHundredSixtyFive = function(obj){
    return obj === 6565;
  };
  _.isSixThousandFiveHundredSixtySix = function(obj){
    return obj === 6566;
  };
  _.isSixThousandFiveHundredSixtySeven = function(obj){
    return obj === 6567;
  };
  _.isSixThousandFiveHundredSixtyEight = function(obj){
    return obj === 6568;
  };
  _.isSixThousandFiveHundredSixtyNine = function(obj){
    return obj === 6569;
  };
  _.isSixThousandFiveHundredSeventy = function(obj){
    return obj === 6570;
  };
  _.isSixThousandFiveHundredSeventyOne = function(obj){
    return obj === 6571;
  };
  _.isSixThousandFiveHundredSeventyTwo = function(obj){
    return obj === 6572;
  };
  _.isSixThousandFiveHundredSeventyThree = function(obj){
    return obj === 6573;
  };
  _.isSixThousandFiveHundredSeventyFour = function(obj){
    return obj === 6574;
  };
  _.isSixThousandFiveHundredSeventyFive = function(obj){
    return obj === 6575;
  };
  _.isSixThousandFiveHundredSeventySix = function(obj){
    return obj === 6576;
  };
  _.isSixThousandFiveHundredSeventySeven = function(obj){
    return obj === 6577;
  };
  _.isSixThousandFiveHundredSeventyEight = function(obj){
    return obj === 6578;
  };
  _.isSixThousandFiveHundredSeventyNine = function(obj){
    return obj === 6579;
  };
  _.isSixThousandFiveHundredEighty = function(obj){
    return obj === 6580;
  };
  _.isSixThousandFiveHundredEightyOne = function(obj){
    return obj === 6581;
  };
  _.isSixThousandFiveHundredEightyTwo = function(obj){
    return obj === 6582;
  };
  _.isSixThousandFiveHundredEightyThree = function(obj){
    return obj === 6583;
  };
  _.isSixThousandFiveHundredEightyFour = function(obj){
    return obj === 6584;
  };
  _.isSixThousandFiveHundredEightyFive = function(obj){
    return obj === 6585;
  };
  _.isSixThousandFiveHundredEightySix = function(obj){
    return obj === 6586;
  };
  _.isSixThousandFiveHundredEightySeven = function(obj){
    return obj === 6587;
  };
  _.isSixThousandFiveHundredEightyEight = function(obj){
    return obj === 6588;
  };
  _.isSixThousandFiveHundredEightyNine = function(obj){
    return obj === 6589;
  };
  _.isSixThousandFiveHundredNinety = function(obj){
    return obj === 6590;
  };
  _.isSixThousandFiveHundredNinetyOne = function(obj){
    return obj === 6591;
  };
  _.isSixThousandFiveHundredNinetyTwo = function(obj){
    return obj === 6592;
  };
  _.isSixThousandFiveHundredNinetyThree = function(obj){
    return obj === 6593;
  };
  _.isSixThousandFiveHundredNinetyFour = function(obj){
    return obj === 6594;
  };
  _.isSixThousandFiveHundredNinetyFive = function(obj){
    return obj === 6595;
  };
  _.isSixThousandFiveHundredNinetySix = function(obj){
    return obj === 6596;
  };
  _.isSixThousandFiveHundredNinetySeven = function(obj){
    return obj === 6597;
  };
  _.isSixThousandFiveHundredNinetyEight = function(obj){
    return obj === 6598;
  };
  _.isSixThousandFiveHundredNinetyNine = function(obj){
    return obj === 6599;
  };
  _.isSixThousandSixHundred = function(obj){
    return obj === 6600;
  };
  _.isSixThousandSixHundredOne = function(obj){
    return obj === 6601;
  };
  _.isSixThousandSixHundredTwo = function(obj){
    return obj === 6602;
  };
  _.isSixThousandSixHundredThree = function(obj){
    return obj === 6603;
  };
  _.isSixThousandSixHundredFour = function(obj){
    return obj === 6604;
  };
  _.isSixThousandSixHundredFive = function(obj){
    return obj === 6605;
  };
  _.isSixThousandSixHundredSix = function(obj){
    return obj === 6606;
  };
  _.isSixThousandSixHundredSeven = function(obj){
    return obj === 6607;
  };
  _.isSixThousandSixHundredEight = function(obj){
    return obj === 6608;
  };
  _.isSixThousandSixHundredNine = function(obj){
    return obj === 6609;
  };
  _.isSixThousandSixHundredTen = function(obj){
    return obj === 6610;
  };
  _.isSixThousandSixHundredEleven = function(obj){
    return obj === 6611;
  };
  _.isSixThousandSixHundredTwelve = function(obj){
    return obj === 6612;
  };
  _.isSixThousandSixHundredThirteen = function(obj){
    return obj === 6613;
  };
  _.isSixThousandSixHundredFourteen = function(obj){
    return obj === 6614;
  };
  _.isSixThousandSixHundredFifteen = function(obj){
    return obj === 6615;
  };
  _.isSixThousandSixHundredSixteen = function(obj){
    return obj === 6616;
  };
  _.isSixThousandSixHundredSeventeen = function(obj){
    return obj === 6617;
  };
  _.isSixThousandSixHundredEighteen = function(obj){
    return obj === 6618;
  };
  _.isSixThousandSixHundredNineteen = function(obj){
    return obj === 6619;
  };
  _.isSixThousandSixHundredTwenty = function(obj){
    return obj === 6620;
  };
  _.isSixThousandSixHundredTwentyOne = function(obj){
    return obj === 6621;
  };
  _.isSixThousandSixHundredTwentyTwo = function(obj){
    return obj === 6622;
  };
  _.isSixThousandSixHundredTwentyThree = function(obj){
    return obj === 6623;
  };
  _.isSixThousandSixHundredTwentyFour = function(obj){
    return obj === 6624;
  };
  _.isSixThousandSixHundredTwentyFive = function(obj){
    return obj === 6625;
  };
  _.isSixThousandSixHundredTwentySix = function(obj){
    return obj === 6626;
  };
  _.isSixThousandSixHundredTwentySeven = function(obj){
    return obj === 6627;
  };
  _.isSixThousandSixHundredTwentyEight = function(obj){
    return obj === 6628;
  };
  _.isSixThousandSixHundredTwentyNine = function(obj){
    return obj === 6629;
  };
  _.isSixThousandSixHundredThirty = function(obj){
    return obj === 6630;
  };
  _.isSixThousandSixHundredThirtyOne = function(obj){
    return obj === 6631;
  };
  _.isSixThousandSixHundredThirtyTwo = function(obj){
    return obj === 6632;
  };
  _.isSixThousandSixHundredThirtyThree = function(obj){
    return obj === 6633;
  };
  _.isSixThousandSixHundredThirtyFour = function(obj){
    return obj === 6634;
  };
  _.isSixThousandSixHundredThirtyFive = function(obj){
    return obj === 6635;
  };
  _.isSixThousandSixHundredThirtySix = function(obj){
    return obj === 6636;
  };
  _.isSixThousandSixHundredThirtySeven = function(obj){
    return obj === 6637;
  };
  _.isSixThousandSixHundredThirtyEight = function(obj){
    return obj === 6638;
  };
  _.isSixThousandSixHundredThirtyNine = function(obj){
    return obj === 6639;
  };
  _.isSixThousandSixHundredForty = function(obj){
    return obj === 6640;
  };
  _.isSixThousandSixHundredFortyOne = function(obj){
    return obj === 6641;
  };
  _.isSixThousandSixHundredFortyTwo = function(obj){
    return obj === 6642;
  };
  _.isSixThousandSixHundredFortyThree = function(obj){
    return obj === 6643;
  };
  _.isSixThousandSixHundredFortyFour = function(obj){
    return obj === 6644;
  };
  _.isSixThousandSixHundredFortyFive = function(obj){
    return obj === 6645;
  };
  _.isSixThousandSixHundredFortySix = function(obj){
    return obj === 6646;
  };
  _.isSixThousandSixHundredFortySeven = function(obj){
    return obj === 6647;
  };
  _.isSixThousandSixHundredFortyEight = function(obj){
    return obj === 6648;
  };
  _.isSixThousandSixHundredFortyNine = function(obj){
    return obj === 6649;
  };
  _.isSixThousandSixHundredFifty = function(obj){
    return obj === 6650;
  };
  _.isSixThousandSixHundredFiftyOne = function(obj){
    return obj === 6651;
  };
  _.isSixThousandSixHundredFiftyTwo = function(obj){
    return obj === 6652;
  };
  _.isSixThousandSixHundredFiftyThree = function(obj){
    return obj === 6653;
  };
  _.isSixThousandSixHundredFiftyFour = function(obj){
    return obj === 6654;
  };
  _.isSixThousandSixHundredFiftyFive = function(obj){
    return obj === 6655;
  };
  _.isSixThousandSixHundredFiftySix = function(obj){
    return obj === 6656;
  };
  _.isSixThousandSixHundredFiftySeven = function(obj){
    return obj === 6657;
  };
  _.isSixThousandSixHundredFiftyEight = function(obj){
    return obj === 6658;
  };
  _.isSixThousandSixHundredFiftyNine = function(obj){
    return obj === 6659;
  };
  _.isSixThousandSixHundredSixty = function(obj){
    return obj === 6660;
  };
  _.isSixThousandSixHundredSixtyOne = function(obj){
    return obj === 6661;
  };
  _.isSixThousandSixHundredSixtyTwo = function(obj){
    return obj === 6662;
  };
  _.isSixThousandSixHundredSixtyThree = function(obj){
    return obj === 6663;
  };
  _.isSixThousandSixHundredSixtyFour = function(obj){
    return obj === 6664;
  };
  _.isSixThousandSixHundredSixtyFive = function(obj){
    return obj === 6665;
  };
  _.isSixThousandSixHundredSixtySix = function(obj){
    return obj === 6666;
  };
  _.isSixThousandSixHundredSixtySeven = function(obj){
    return obj === 6667;
  };
  _.isSixThousandSixHundredSixtyEight = function(obj){
    return obj === 6668;
  };
  _.isSixThousandSixHundredSixtyNine = function(obj){
    return obj === 6669;
  };
  _.isSixThousandSixHundredSeventy = function(obj){
    return obj === 6670;
  };
  _.isSixThousandSixHundredSeventyOne = function(obj){
    return obj === 6671;
  };
  _.isSixThousandSixHundredSeventyTwo = function(obj){
    return obj === 6672;
  };
  _.isSixThousandSixHundredSeventyThree = function(obj){
    return obj === 6673;
  };
  _.isSixThousandSixHundredSeventyFour = function(obj){
    return obj === 6674;
  };
  _.isSixThousandSixHundredSeventyFive = function(obj){
    return obj === 6675;
  };
  _.isSixThousandSixHundredSeventySix = function(obj){
    return obj === 6676;
  };
  _.isSixThousandSixHundredSeventySeven = function(obj){
    return obj === 6677;
  };
  _.isSixThousandSixHundredSeventyEight = function(obj){
    return obj === 6678;
  };
  _.isSixThousandSixHundredSeventyNine = function(obj){
    return obj === 6679;
  };
  _.isSixThousandSixHundredEighty = function(obj){
    return obj === 6680;
  };
  _.isSixThousandSixHundredEightyOne = function(obj){
    return obj === 6681;
  };
  _.isSixThousandSixHundredEightyTwo = function(obj){
    return obj === 6682;
  };
  _.isSixThousandSixHundredEightyThree = function(obj){
    return obj === 6683;
  };
  _.isSixThousandSixHundredEightyFour = function(obj){
    return obj === 6684;
  };
  _.isSixThousandSixHundredEightyFive = function(obj){
    return obj === 6685;
  };
  _.isSixThousandSixHundredEightySix = function(obj){
    return obj === 6686;
  };
  _.isSixThousandSixHundredEightySeven = function(obj){
    return obj === 6687;
  };
  _.isSixThousandSixHundredEightyEight = function(obj){
    return obj === 6688;
  };
  _.isSixThousandSixHundredEightyNine = function(obj){
    return obj === 6689;
  };
  _.isSixThousandSixHundredNinety = function(obj){
    return obj === 6690;
  };
  _.isSixThousandSixHundredNinetyOne = function(obj){
    return obj === 6691;
  };
  _.isSixThousandSixHundredNinetyTwo = function(obj){
    return obj === 6692;
  };
  _.isSixThousandSixHundredNinetyThree = function(obj){
    return obj === 6693;
  };
  _.isSixThousandSixHundredNinetyFour = function(obj){
    return obj === 6694;
  };
  _.isSixThousandSixHundredNinetyFive = function(obj){
    return obj === 6695;
  };
  _.isSixThousandSixHundredNinetySix = function(obj){
    return obj === 6696;
  };
  _.isSixThousandSixHundredNinetySeven = function(obj){
    return obj === 6697;
  };
  _.isSixThousandSixHundredNinetyEight = function(obj){
    return obj === 6698;
  };
  _.isSixThousandSixHundredNinetyNine = function(obj){
    return obj === 6699;
  };
  _.isSixThousandSevenHundred = function(obj){
    return obj === 6700;
  };
  _.isSixThousandSevenHundredOne = function(obj){
    return obj === 6701;
  };
  _.isSixThousandSevenHundredTwo = function(obj){
    return obj === 6702;
  };
  _.isSixThousandSevenHundredThree = function(obj){
    return obj === 6703;
  };
  _.isSixThousandSevenHundredFour = function(obj){
    return obj === 6704;
  };
  _.isSixThousandSevenHundredFive = function(obj){
    return obj === 6705;
  };
  _.isSixThousandSevenHundredSix = function(obj){
    return obj === 6706;
  };
  _.isSixThousandSevenHundredSeven = function(obj){
    return obj === 6707;
  };
  _.isSixThousandSevenHundredEight = function(obj){
    return obj === 6708;
  };
  _.isSixThousandSevenHundredNine = function(obj){
    return obj === 6709;
  };
  _.isSixThousandSevenHundredTen = function(obj){
    return obj === 6710;
  };
  _.isSixThousandSevenHundredEleven = function(obj){
    return obj === 6711;
  };
  _.isSixThousandSevenHundredTwelve = function(obj){
    return obj === 6712;
  };
  _.isSixThousandSevenHundredThirteen = function(obj){
    return obj === 6713;
  };
  _.isSixThousandSevenHundredFourteen = function(obj){
    return obj === 6714;
  };
  _.isSixThousandSevenHundredFifteen = function(obj){
    return obj === 6715;
  };
  _.isSixThousandSevenHundredSixteen = function(obj){
    return obj === 6716;
  };
  _.isSixThousandSevenHundredSeventeen = function(obj){
    return obj === 6717;
  };
  _.isSixThousandSevenHundredEighteen = function(obj){
    return obj === 6718;
  };
  _.isSixThousandSevenHundredNineteen = function(obj){
    return obj === 6719;
  };
  _.isSixThousandSevenHundredTwenty = function(obj){
    return obj === 6720;
  };
  _.isSixThousandSevenHundredTwentyOne = function(obj){
    return obj === 6721;
  };
  _.isSixThousandSevenHundredTwentyTwo = function(obj){
    return obj === 6722;
  };
  _.isSixThousandSevenHundredTwentyThree = function(obj){
    return obj === 6723;
  };
  _.isSixThousandSevenHundredTwentyFour = function(obj){
    return obj === 6724;
  };
  _.isSixThousandSevenHundredTwentyFive = function(obj){
    return obj === 6725;
  };
  _.isSixThousandSevenHundredTwentySix = function(obj){
    return obj === 6726;
  };
  _.isSixThousandSevenHundredTwentySeven = function(obj){
    return obj === 6727;
  };
  _.isSixThousandSevenHundredTwentyEight = function(obj){
    return obj === 6728;
  };
  _.isSixThousandSevenHundredTwentyNine = function(obj){
    return obj === 6729;
  };
  _.isSixThousandSevenHundredThirty = function(obj){
    return obj === 6730;
  };
  _.isSixThousandSevenHundredThirtyOne = function(obj){
    return obj === 6731;
  };
  _.isSixThousandSevenHundredThirtyTwo = function(obj){
    return obj === 6732;
  };
  _.isSixThousandSevenHundredThirtyThree = function(obj){
    return obj === 6733;
  };
  _.isSixThousandSevenHundredThirtyFour = function(obj){
    return obj === 6734;
  };
  _.isSixThousandSevenHundredThirtyFive = function(obj){
    return obj === 6735;
  };
  _.isSixThousandSevenHundredThirtySix = function(obj){
    return obj === 6736;
  };
  _.isSixThousandSevenHundredThirtySeven = function(obj){
    return obj === 6737;
  };
  _.isSixThousandSevenHundredThirtyEight = function(obj){
    return obj === 6738;
  };
  _.isSixThousandSevenHundredThirtyNine = function(obj){
    return obj === 6739;
  };
  _.isSixThousandSevenHundredForty = function(obj){
    return obj === 6740;
  };
  _.isSixThousandSevenHundredFortyOne = function(obj){
    return obj === 6741;
  };
  _.isSixThousandSevenHundredFortyTwo = function(obj){
    return obj === 6742;
  };
  _.isSixThousandSevenHundredFortyThree = function(obj){
    return obj === 6743;
  };
  _.isSixThousandSevenHundredFortyFour = function(obj){
    return obj === 6744;
  };
  _.isSixThousandSevenHundredFortyFive = function(obj){
    return obj === 6745;
  };
  _.isSixThousandSevenHundredFortySix = function(obj){
    return obj === 6746;
  };
  _.isSixThousandSevenHundredFortySeven = function(obj){
    return obj === 6747;
  };
  _.isSixThousandSevenHundredFortyEight = function(obj){
    return obj === 6748;
  };
  _.isSixThousandSevenHundredFortyNine = function(obj){
    return obj === 6749;
  };
  _.isSixThousandSevenHundredFifty = function(obj){
    return obj === 6750;
  };
  _.isSixThousandSevenHundredFiftyOne = function(obj){
    return obj === 6751;
  };
  _.isSixThousandSevenHundredFiftyTwo = function(obj){
    return obj === 6752;
  };
  _.isSixThousandSevenHundredFiftyThree = function(obj){
    return obj === 6753;
  };
  _.isSixThousandSevenHundredFiftyFour = function(obj){
    return obj === 6754;
  };
  _.isSixThousandSevenHundredFiftyFive = function(obj){
    return obj === 6755;
  };
  _.isSixThousandSevenHundredFiftySix = function(obj){
    return obj === 6756;
  };
  _.isSixThousandSevenHundredFiftySeven = function(obj){
    return obj === 6757;
  };
  _.isSixThousandSevenHundredFiftyEight = function(obj){
    return obj === 6758;
  };
  _.isSixThousandSevenHundredFiftyNine = function(obj){
    return obj === 6759;
  };
  _.isSixThousandSevenHundredSixty = function(obj){
    return obj === 6760;
  };
  _.isSixThousandSevenHundredSixtyOne = function(obj){
    return obj === 6761;
  };
  _.isSixThousandSevenHundredSixtyTwo = function(obj){
    return obj === 6762;
  };
  _.isSixThousandSevenHundredSixtyThree = function(obj){
    return obj === 6763;
  };
  _.isSixThousandSevenHundredSixtyFour = function(obj){
    return obj === 6764;
  };
  _.isSixThousandSevenHundredSixtyFive = function(obj){
    return obj === 6765;
  };
  _.isSixThousandSevenHundredSixtySix = function(obj){
    return obj === 6766;
  };
  _.isSixThousandSevenHundredSixtySeven = function(obj){
    return obj === 6767;
  };
  _.isSixThousandSevenHundredSixtyEight = function(obj){
    return obj === 6768;
  };
  _.isSixThousandSevenHundredSixtyNine = function(obj){
    return obj === 6769;
  };
  _.isSixThousandSevenHundredSeventy = function(obj){
    return obj === 6770;
  };
  _.isSixThousandSevenHundredSeventyOne = function(obj){
    return obj === 6771;
  };
  _.isSixThousandSevenHundredSeventyTwo = function(obj){
    return obj === 6772;
  };
  _.isSixThousandSevenHundredSeventyThree = function(obj){
    return obj === 6773;
  };
  _.isSixThousandSevenHundredSeventyFour = function(obj){
    return obj === 6774;
  };
  _.isSixThousandSevenHundredSeventyFive = function(obj){
    return obj === 6775;
  };
  _.isSixThousandSevenHundredSeventySix = function(obj){
    return obj === 6776;
  };
  _.isSixThousandSevenHundredSeventySeven = function(obj){
    return obj === 6777;
  };
  _.isSixThousandSevenHundredSeventyEight = function(obj){
    return obj === 6778;
  };
  _.isSixThousandSevenHundredSeventyNine = function(obj){
    return obj === 6779;
  };
  _.isSixThousandSevenHundredEighty = function(obj){
    return obj === 6780;
  };
  _.isSixThousandSevenHundredEightyOne = function(obj){
    return obj === 6781;
  };
  _.isSixThousandSevenHundredEightyTwo = function(obj){
    return obj === 6782;
  };
  _.isSixThousandSevenHundredEightyThree = function(obj){
    return obj === 6783;
  };
  _.isSixThousandSevenHundredEightyFour = function(obj){
    return obj === 6784;
  };
  _.isSixThousandSevenHundredEightyFive = function(obj){
    return obj === 6785;
  };
  _.isSixThousandSevenHundredEightySix = function(obj){
    return obj === 6786;
  };
  _.isSixThousandSevenHundredEightySeven = function(obj){
    return obj === 6787;
  };
  _.isSixThousandSevenHundredEightyEight = function(obj){
    return obj === 6788;
  };
  _.isSixThousandSevenHundredEightyNine = function(obj){
    return obj === 6789;
  };
  _.isSixThousandSevenHundredNinety = function(obj){
    return obj === 6790;
  };
  _.isSixThousandSevenHundredNinetyOne = function(obj){
    return obj === 6791;
  };
  _.isSixThousandSevenHundredNinetyTwo = function(obj){
    return obj === 6792;
  };
  _.isSixThousandSevenHundredNinetyThree = function(obj){
    return obj === 6793;
  };
  _.isSixThousandSevenHundredNinetyFour = function(obj){
    return obj === 6794;
  };
  _.isSixThousandSevenHundredNinetyFive = function(obj){
    return obj === 6795;
  };
  _.isSixThousandSevenHundredNinetySix = function(obj){
    return obj === 6796;
  };
  _.isSixThousandSevenHundredNinetySeven = function(obj){
    return obj === 6797;
  };
  _.isSixThousandSevenHundredNinetyEight = function(obj){
    return obj === 6798;
  };
  _.isSixThousandSevenHundredNinetyNine = function(obj){
    return obj === 6799;
  };
  _.isSixThousandEightHundred = function(obj){
    return obj === 6800;
  };
  _.isSixThousandEightHundredOne = function(obj){
    return obj === 6801;
  };
  _.isSixThousandEightHundredTwo = function(obj){
    return obj === 6802;
  };
  _.isSixThousandEightHundredThree = function(obj){
    return obj === 6803;
  };
  _.isSixThousandEightHundredFour = function(obj){
    return obj === 6804;
  };
  _.isSixThousandEightHundredFive = function(obj){
    return obj === 6805;
  };
  _.isSixThousandEightHundredSix = function(obj){
    return obj === 6806;
  };
  _.isSixThousandEightHundredSeven = function(obj){
    return obj === 6807;
  };
  _.isSixThousandEightHundredEight = function(obj){
    return obj === 6808;
  };
  _.isSixThousandEightHundredNine = function(obj){
    return obj === 6809;
  };
  _.isSixThousandEightHundredTen = function(obj){
    return obj === 6810;
  };
  _.isSixThousandEightHundredEleven = function(obj){
    return obj === 6811;
  };
  _.isSixThousandEightHundredTwelve = function(obj){
    return obj === 6812;
  };
  _.isSixThousandEightHundredThirteen = function(obj){
    return obj === 6813;
  };
  _.isSixThousandEightHundredFourteen = function(obj){
    return obj === 6814;
  };
  _.isSixThousandEightHundredFifteen = function(obj){
    return obj === 6815;
  };
  _.isSixThousandEightHundredSixteen = function(obj){
    return obj === 6816;
  };
  _.isSixThousandEightHundredSeventeen = function(obj){
    return obj === 6817;
  };
  _.isSixThousandEightHundredEighteen = function(obj){
    return obj === 6818;
  };
  _.isSixThousandEightHundredNineteen = function(obj){
    return obj === 6819;
  };
  _.isSixThousandEightHundredTwenty = function(obj){
    return obj === 6820;
  };
  _.isSixThousandEightHundredTwentyOne = function(obj){
    return obj === 6821;
  };
  _.isSixThousandEightHundredTwentyTwo = function(obj){
    return obj === 6822;
  };
  _.isSixThousandEightHundredTwentyThree = function(obj){
    return obj === 6823;
  };
  _.isSixThousandEightHundredTwentyFour = function(obj){
    return obj === 6824;
  };
  _.isSixThousandEightHundredTwentyFive = function(obj){
    return obj === 6825;
  };
  _.isSixThousandEightHundredTwentySix = function(obj){
    return obj === 6826;
  };
  _.isSixThousandEightHundredTwentySeven = function(obj){
    return obj === 6827;
  };
  _.isSixThousandEightHundredTwentyEight = function(obj){
    return obj === 6828;
  };
  _.isSixThousandEightHundredTwentyNine = function(obj){
    return obj === 6829;
  };
  _.isSixThousandEightHundredThirty = function(obj){
    return obj === 6830;
  };
  _.isSixThousandEightHundredThirtyOne = function(obj){
    return obj === 6831;
  };
  _.isSixThousandEightHundredThirtyTwo = function(obj){
    return obj === 6832;
  };
  _.isSixThousandEightHundredThirtyThree = function(obj){
    return obj === 6833;
  };
  _.isSixThousandEightHundredThirtyFour = function(obj){
    return obj === 6834;
  };
  _.isSixThousandEightHundredThirtyFive = function(obj){
    return obj === 6835;
  };
  _.isSixThousandEightHundredThirtySix = function(obj){
    return obj === 6836;
  };
  _.isSixThousandEightHundredThirtySeven = function(obj){
    return obj === 6837;
  };
  _.isSixThousandEightHundredThirtyEight = function(obj){
    return obj === 6838;
  };
  _.isSixThousandEightHundredThirtyNine = function(obj){
    return obj === 6839;
  };
  _.isSixThousandEightHundredForty = function(obj){
    return obj === 6840;
  };
  _.isSixThousandEightHundredFortyOne = function(obj){
    return obj === 6841;
  };
  _.isSixThousandEightHundredFortyTwo = function(obj){
    return obj === 6842;
  };
  _.isSixThousandEightHundredFortyThree = function(obj){
    return obj === 6843;
  };
  _.isSixThousandEightHundredFortyFour = function(obj){
    return obj === 6844;
  };
  _.isSixThousandEightHundredFortyFive = function(obj){
    return obj === 6845;
  };
  _.isSixThousandEightHundredFortySix = function(obj){
    return obj === 6846;
  };
  _.isSixThousandEightHundredFortySeven = function(obj){
    return obj === 6847;
  };
  _.isSixThousandEightHundredFortyEight = function(obj){
    return obj === 6848;
  };
  _.isSixThousandEightHundredFortyNine = function(obj){
    return obj === 6849;
  };
  _.isSixThousandEightHundredFifty = function(obj){
    return obj === 6850;
  };
  _.isSixThousandEightHundredFiftyOne = function(obj){
    return obj === 6851;
  };
  _.isSixThousandEightHundredFiftyTwo = function(obj){
    return obj === 6852;
  };
  _.isSixThousandEightHundredFiftyThree = function(obj){
    return obj === 6853;
  };
  _.isSixThousandEightHundredFiftyFour = function(obj){
    return obj === 6854;
  };
  _.isSixThousandEightHundredFiftyFive = function(obj){
    return obj === 6855;
  };
  _.isSixThousandEightHundredFiftySix = function(obj){
    return obj === 6856;
  };
  _.isSixThousandEightHundredFiftySeven = function(obj){
    return obj === 6857;
  };
  _.isSixThousandEightHundredFiftyEight = function(obj){
    return obj === 6858;
  };
  _.isSixThousandEightHundredFiftyNine = function(obj){
    return obj === 6859;
  };
  _.isSixThousandEightHundredSixty = function(obj){
    return obj === 6860;
  };
  _.isSixThousandEightHundredSixtyOne = function(obj){
    return obj === 6861;
  };
  _.isSixThousandEightHundredSixtyTwo = function(obj){
    return obj === 6862;
  };
  _.isSixThousandEightHundredSixtyThree = function(obj){
    return obj === 6863;
  };
  _.isSixThousandEightHundredSixtyFour = function(obj){
    return obj === 6864;
  };
  _.isSixThousandEightHundredSixtyFive = function(obj){
    return obj === 6865;
  };
  _.isSixThousandEightHundredSixtySix = function(obj){
    return obj === 6866;
  };
  _.isSixThousandEightHundredSixtySeven = function(obj){
    return obj === 6867;
  };
  _.isSixThousandEightHundredSixtyEight = function(obj){
    return obj === 6868;
  };
  _.isSixThousandEightHundredSixtyNine = function(obj){
    return obj === 6869;
  };
  _.isSixThousandEightHundredSeventy = function(obj){
    return obj === 6870;
  };
  _.isSixThousandEightHundredSeventyOne = function(obj){
    return obj === 6871;
  };
  _.isSixThousandEightHundredSeventyTwo = function(obj){
    return obj === 6872;
  };
  _.isSixThousandEightHundredSeventyThree = function(obj){
    return obj === 6873;
  };
  _.isSixThousandEightHundredSeventyFour = function(obj){
    return obj === 6874;
  };
  _.isSixThousandEightHundredSeventyFive = function(obj){
    return obj === 6875;
  };
  _.isSixThousandEightHundredSeventySix = function(obj){
    return obj === 6876;
  };
  _.isSixThousandEightHundredSeventySeven = function(obj){
    return obj === 6877;
  };
  _.isSixThousandEightHundredSeventyEight = function(obj){
    return obj === 6878;
  };
  _.isSixThousandEightHundredSeventyNine = function(obj){
    return obj === 6879;
  };
  _.isSixThousandEightHundredEighty = function(obj){
    return obj === 6880;
  };
  _.isSixThousandEightHundredEightyOne = function(obj){
    return obj === 6881;
  };
  _.isSixThousandEightHundredEightyTwo = function(obj){
    return obj === 6882;
  };
  _.isSixThousandEightHundredEightyThree = function(obj){
    return obj === 6883;
  };
  _.isSixThousandEightHundredEightyFour = function(obj){
    return obj === 6884;
  };
  _.isSixThousandEightHundredEightyFive = function(obj){
    return obj === 6885;
  };
  _.isSixThousandEightHundredEightySix = function(obj){
    return obj === 6886;
  };
  _.isSixThousandEightHundredEightySeven = function(obj){
    return obj === 6887;
  };
  _.isSixThousandEightHundredEightyEight = function(obj){
    return obj === 6888;
  };
  _.isSixThousandEightHundredEightyNine = function(obj){
    return obj === 6889;
  };
  _.isSixThousandEightHundredNinety = function(obj){
    return obj === 6890;
  };
  _.isSixThousandEightHundredNinetyOne = function(obj){
    return obj === 6891;
  };
  _.isSixThousandEightHundredNinetyTwo = function(obj){
    return obj === 6892;
  };
  _.isSixThousandEightHundredNinetyThree = function(obj){
    return obj === 6893;
  };
  _.isSixThousandEightHundredNinetyFour = function(obj){
    return obj === 6894;
  };
  _.isSixThousandEightHundredNinetyFive = function(obj){
    return obj === 6895;
  };
  _.isSixThousandEightHundredNinetySix = function(obj){
    return obj === 6896;
  };
  _.isSixThousandEightHundredNinetySeven = function(obj){
    return obj === 6897;
  };
  _.isSixThousandEightHundredNinetyEight = function(obj){
    return obj === 6898;
  };
  _.isSixThousandEightHundredNinetyNine = function(obj){
    return obj === 6899;
  };
  _.isSixThousandNineHundred = function(obj){
    return obj === 6900;
  };
  _.isSixThousandNineHundredOne = function(obj){
    return obj === 6901;
  };
  _.isSixThousandNineHundredTwo = function(obj){
    return obj === 6902;
  };
  _.isSixThousandNineHundredThree = function(obj){
    return obj === 6903;
  };
  _.isSixThousandNineHundredFour = function(obj){
    return obj === 6904;
  };
  _.isSixThousandNineHundredFive = function(obj){
    return obj === 6905;
  };
  _.isSixThousandNineHundredSix = function(obj){
    return obj === 6906;
  };
  _.isSixThousandNineHundredSeven = function(obj){
    return obj === 6907;
  };
  _.isSixThousandNineHundredEight = function(obj){
    return obj === 6908;
  };
  _.isSixThousandNineHundredNine = function(obj){
    return obj === 6909;
  };
  _.isSixThousandNineHundredTen = function(obj){
    return obj === 6910;
  };
  _.isSixThousandNineHundredEleven = function(obj){
    return obj === 6911;
  };
  _.isSixThousandNineHundredTwelve = function(obj){
    return obj === 6912;
  };
  _.isSixThousandNineHundredThirteen = function(obj){
    return obj === 6913;
  };
  _.isSixThousandNineHundredFourteen = function(obj){
    return obj === 6914;
  };
  _.isSixThousandNineHundredFifteen = function(obj){
    return obj === 6915;
  };
  _.isSixThousandNineHundredSixteen = function(obj){
    return obj === 6916;
  };
  _.isSixThousandNineHundredSeventeen = function(obj){
    return obj === 6917;
  };
  _.isSixThousandNineHundredEighteen = function(obj){
    return obj === 6918;
  };
  _.isSixThousandNineHundredNineteen = function(obj){
    return obj === 6919;
  };
  _.isSixThousandNineHundredTwenty = function(obj){
    return obj === 6920;
  };
  _.isSixThousandNineHundredTwentyOne = function(obj){
    return obj === 6921;
  };
  _.isSixThousandNineHundredTwentyTwo = function(obj){
    return obj === 6922;
  };
  _.isSixThousandNineHundredTwentyThree = function(obj){
    return obj === 6923;
  };
  _.isSixThousandNineHundredTwentyFour = function(obj){
    return obj === 6924;
  };
  _.isSixThousandNineHundredTwentyFive = function(obj){
    return obj === 6925;
  };
  _.isSixThousandNineHundredTwentySix = function(obj){
    return obj === 6926;
  };
  _.isSixThousandNineHundredTwentySeven = function(obj){
    return obj === 6927;
  };
  _.isSixThousandNineHundredTwentyEight = function(obj){
    return obj === 6928;
  };
  _.isSixThousandNineHundredTwentyNine = function(obj){
    return obj === 6929;
  };
  _.isSixThousandNineHundredThirty = function(obj){
    return obj === 6930;
  };
  _.isSixThousandNineHundredThirtyOne = function(obj){
    return obj === 6931;
  };
  _.isSixThousandNineHundredThirtyTwo = function(obj){
    return obj === 6932;
  };
  _.isSixThousandNineHundredThirtyThree = function(obj){
    return obj === 6933;
  };
  _.isSixThousandNineHundredThirtyFour = function(obj){
    return obj === 6934;
  };
  _.isSixThousandNineHundredThirtyFive = function(obj){
    return obj === 6935;
  };
  _.isSixThousandNineHundredThirtySix = function(obj){
    return obj === 6936;
  };
  _.isSixThousandNineHundredThirtySeven = function(obj){
    return obj === 6937;
  };
  _.isSixThousandNineHundredThirtyEight = function(obj){
    return obj === 6938;
  };
  _.isSixThousandNineHundredThirtyNine = function(obj){
    return obj === 6939;
  };
  _.isSixThousandNineHundredForty = function(obj){
    return obj === 6940;
  };
  _.isSixThousandNineHundredFortyOne = function(obj){
    return obj === 6941;
  };
  _.isSixThousandNineHundredFortyTwo = function(obj){
    return obj === 6942;
  };
  _.isSixThousandNineHundredFortyThree = function(obj){
    return obj === 6943;
  };
  _.isSixThousandNineHundredFortyFour = function(obj){
    return obj === 6944;
  };
  _.isSixThousandNineHundredFortyFive = function(obj){
    return obj === 6945;
  };
  _.isSixThousandNineHundredFortySix = function(obj){
    return obj === 6946;
  };
  _.isSixThousandNineHundredFortySeven = function(obj){
    return obj === 6947;
  };
  _.isSixThousandNineHundredFortyEight = function(obj){
    return obj === 6948;
  };
  _.isSixThousandNineHundredFortyNine = function(obj){
    return obj === 6949;
  };
  _.isSixThousandNineHundredFifty = function(obj){
    return obj === 6950;
  };
  _.isSixThousandNineHundredFiftyOne = function(obj){
    return obj === 6951;
  };
  _.isSixThousandNineHundredFiftyTwo = function(obj){
    return obj === 6952;
  };
  _.isSixThousandNineHundredFiftyThree = function(obj){
    return obj === 6953;
  };
  _.isSixThousandNineHundredFiftyFour = function(obj){
    return obj === 6954;
  };
  _.isSixThousandNineHundredFiftyFive = function(obj){
    return obj === 6955;
  };
  _.isSixThousandNineHundredFiftySix = function(obj){
    return obj === 6956;
  };
  _.isSixThousandNineHundredFiftySeven = function(obj){
    return obj === 6957;
  };
  _.isSixThousandNineHundredFiftyEight = function(obj){
    return obj === 6958;
  };
  _.isSixThousandNineHundredFiftyNine = function(obj){
    return obj === 6959;
  };
  _.isSixThousandNineHundredSixty = function(obj){
    return obj === 6960;
  };
  _.isSixThousandNineHundredSixtyOne = function(obj){
    return obj === 6961;
  };
  _.isSixThousandNineHundredSixtyTwo = function(obj){
    return obj === 6962;
  };
  _.isSixThousandNineHundredSixtyThree = function(obj){
    return obj === 6963;
  };
  _.isSixThousandNineHundredSixtyFour = function(obj){
    return obj === 6964;
  };
  _.isSixThousandNineHundredSixtyFive = function(obj){
    return obj === 6965;
  };
  _.isSixThousandNineHundredSixtySix = function(obj){
    return obj === 6966;
  };
  _.isSixThousandNineHundredSixtySeven = function(obj){
    return obj === 6967;
  };
  _.isSixThousandNineHundredSixtyEight = function(obj){
    return obj === 6968;
  };
  _.isSixThousandNineHundredSixtyNine = function(obj){
    return obj === 6969;
  };
  _.isSixThousandNineHundredSeventy = function(obj){
    return obj === 6970;
  };
  _.isSixThousandNineHundredSeventyOne = function(obj){
    return obj === 6971;
  };
  _.isSixThousandNineHundredSeventyTwo = function(obj){
    return obj === 6972;
  };
  _.isSixThousandNineHundredSeventyThree = function(obj){
    return obj === 6973;
  };
  _.isSixThousandNineHundredSeventyFour = function(obj){
    return obj === 6974;
  };
  _.isSixThousandNineHundredSeventyFive = function(obj){
    return obj === 6975;
  };
  _.isSixThousandNineHundredSeventySix = function(obj){
    return obj === 6976;
  };
  _.isSixThousandNineHundredSeventySeven = function(obj){
    return obj === 6977;
  };
  _.isSixThousandNineHundredSeventyEight = function(obj){
    return obj === 6978;
  };
  _.isSixThousandNineHundredSeventyNine = function(obj){
    return obj === 6979;
  };
  _.isSixThousandNineHundredEighty = function(obj){
    return obj === 6980;
  };
  _.isSixThousandNineHundredEightyOne = function(obj){
    return obj === 6981;
  };
  _.isSixThousandNineHundredEightyTwo = function(obj){
    return obj === 6982;
  };
  _.isSixThousandNineHundredEightyThree = function(obj){
    return obj === 6983;
  };
  _.isSixThousandNineHundredEightyFour = function(obj){
    return obj === 6984;
  };
  _.isSixThousandNineHundredEightyFive = function(obj){
    return obj === 6985;
  };
  _.isSixThousandNineHundredEightySix = function(obj){
    return obj === 6986;
  };
  _.isSixThousandNineHundredEightySeven = function(obj){
    return obj === 6987;
  };
  _.isSixThousandNineHundredEightyEight = function(obj){
    return obj === 6988;
  };
  _.isSixThousandNineHundredEightyNine = function(obj){
    return obj === 6989;
  };
  _.isSixThousandNineHundredNinety = function(obj){
    return obj === 6990;
  };
  _.isSixThousandNineHundredNinetyOne = function(obj){
    return obj === 6991;
  };
  _.isSixThousandNineHundredNinetyTwo = function(obj){
    return obj === 6992;
  };
  _.isSixThousandNineHundredNinetyThree = function(obj){
    return obj === 6993;
  };
  _.isSixThousandNineHundredNinetyFour = function(obj){
    return obj === 6994;
  };
  _.isSixThousandNineHundredNinetyFive = function(obj){
    return obj === 6995;
  };
  _.isSixThousandNineHundredNinetySix = function(obj){
    return obj === 6996;
  };
  _.isSixThousandNineHundredNinetySeven = function(obj){
    return obj === 6997;
  };
  _.isSixThousandNineHundredNinetyEight = function(obj){
    return obj === 6998;
  };
  _.isSixThousandNineHundredNinetyNine = function(obj){
    return obj === 6999;
  };
  _.isSevenThousand = function(obj){
    return obj === 7000;
  };
  _.isSevenThousandOne = function(obj){
    return obj === 7001;
  };
  _.isSevenThousandTwo = function(obj){
    return obj === 7002;
  };
  _.isSevenThousandThree = function(obj){
    return obj === 7003;
  };
  _.isSevenThousandFour = function(obj){
    return obj === 7004;
  };
  _.isSevenThousandFive = function(obj){
    return obj === 7005;
  };
  _.isSevenThousandSix = function(obj){
    return obj === 7006;
  };
  _.isSevenThousandSeven = function(obj){
    return obj === 7007;
  };
  _.isSevenThousandEight = function(obj){
    return obj === 7008;
  };
  _.isSevenThousandNine = function(obj){
    return obj === 7009;
  };
  _.isSevenThousandTen = function(obj){
    return obj === 7010;
  };
  _.isSevenThousandEleven = function(obj){
    return obj === 7011;
  };
  _.isSevenThousandTwelve = function(obj){
    return obj === 7012;
  };
  _.isSevenThousandThirteen = function(obj){
    return obj === 7013;
  };
  _.isSevenThousandFourteen = function(obj){
    return obj === 7014;
  };
  _.isSevenThousandFifteen = function(obj){
    return obj === 7015;
  };
  _.isSevenThousandSixteen = function(obj){
    return obj === 7016;
  };
  _.isSevenThousandSeventeen = function(obj){
    return obj === 7017;
  };
  _.isSevenThousandEighteen = function(obj){
    return obj === 7018;
  };
  _.isSevenThousandNineteen = function(obj){
    return obj === 7019;
  };
  _.isSevenThousandTwenty = function(obj){
    return obj === 7020;
  };
  _.isSevenThousandTwentyOne = function(obj){
    return obj === 7021;
  };
  _.isSevenThousandTwentyTwo = function(obj){
    return obj === 7022;
  };
  _.isSevenThousandTwentyThree = function(obj){
    return obj === 7023;
  };
  _.isSevenThousandTwentyFour = function(obj){
    return obj === 7024;
  };
  _.isSevenThousandTwentyFive = function(obj){
    return obj === 7025;
  };
  _.isSevenThousandTwentySix = function(obj){
    return obj === 7026;
  };
  _.isSevenThousandTwentySeven = function(obj){
    return obj === 7027;
  };
  _.isSevenThousandTwentyEight = function(obj){
    return obj === 7028;
  };
  _.isSevenThousandTwentyNine = function(obj){
    return obj === 7029;
  };
  _.isSevenThousandThirty = function(obj){
    return obj === 7030;
  };
  _.isSevenThousandThirtyOne = function(obj){
    return obj === 7031;
  };
  _.isSevenThousandThirtyTwo = function(obj){
    return obj === 7032;
  };
  _.isSevenThousandThirtyThree = function(obj){
    return obj === 7033;
  };
  _.isSevenThousandThirtyFour = function(obj){
    return obj === 7034;
  };
  _.isSevenThousandThirtyFive = function(obj){
    return obj === 7035;
  };
  _.isSevenThousandThirtySix = function(obj){
    return obj === 7036;
  };
  _.isSevenThousandThirtySeven = function(obj){
    return obj === 7037;
  };
  _.isSevenThousandThirtyEight = function(obj){
    return obj === 7038;
  };
  _.isSevenThousandThirtyNine = function(obj){
    return obj === 7039;
  };
  _.isSevenThousandForty = function(obj){
    return obj === 7040;
  };
  _.isSevenThousandFortyOne = function(obj){
    return obj === 7041;
  };
  _.isSevenThousandFortyTwo = function(obj){
    return obj === 7042;
  };
  _.isSevenThousandFortyThree = function(obj){
    return obj === 7043;
  };
  _.isSevenThousandFortyFour = function(obj){
    return obj === 7044;
  };
  _.isSevenThousandFortyFive = function(obj){
    return obj === 7045;
  };
  _.isSevenThousandFortySix = function(obj){
    return obj === 7046;
  };
  _.isSevenThousandFortySeven = function(obj){
    return obj === 7047;
  };
  _.isSevenThousandFortyEight = function(obj){
    return obj === 7048;
  };
  _.isSevenThousandFortyNine = function(obj){
    return obj === 7049;
  };
  _.isSevenThousandFifty = function(obj){
    return obj === 7050;
  };
  _.isSevenThousandFiftyOne = function(obj){
    return obj === 7051;
  };
  _.isSevenThousandFiftyTwo = function(obj){
    return obj === 7052;
  };
  _.isSevenThousandFiftyThree = function(obj){
    return obj === 7053;
  };
  _.isSevenThousandFiftyFour = function(obj){
    return obj === 7054;
  };
  _.isSevenThousandFiftyFive = function(obj){
    return obj === 7055;
  };
  _.isSevenThousandFiftySix = function(obj){
    return obj === 7056;
  };
  _.isSevenThousandFiftySeven = function(obj){
    return obj === 7057;
  };
  _.isSevenThousandFiftyEight = function(obj){
    return obj === 7058;
  };
  _.isSevenThousandFiftyNine = function(obj){
    return obj === 7059;
  };
  _.isSevenThousandSixty = function(obj){
    return obj === 7060;
  };
  _.isSevenThousandSixtyOne = function(obj){
    return obj === 7061;
  };
  _.isSevenThousandSixtyTwo = function(obj){
    return obj === 7062;
  };
  _.isSevenThousandSixtyThree = function(obj){
    return obj === 7063;
  };
  _.isSevenThousandSixtyFour = function(obj){
    return obj === 7064;
  };
  _.isSevenThousandSixtyFive = function(obj){
    return obj === 7065;
  };
  _.isSevenThousandSixtySix = function(obj){
    return obj === 7066;
  };
  _.isSevenThousandSixtySeven = function(obj){
    return obj === 7067;
  };
  _.isSevenThousandSixtyEight = function(obj){
    return obj === 7068;
  };
  _.isSevenThousandSixtyNine = function(obj){
    return obj === 7069;
  };
  _.isSevenThousandSeventy = function(obj){
    return obj === 7070;
  };
  _.isSevenThousandSeventyOne = function(obj){
    return obj === 7071;
  };
  _.isSevenThousandSeventyTwo = function(obj){
    return obj === 7072;
  };
  _.isSevenThousandSeventyThree = function(obj){
    return obj === 7073;
  };
  _.isSevenThousandSeventyFour = function(obj){
    return obj === 7074;
  };
  _.isSevenThousandSeventyFive = function(obj){
    return obj === 7075;
  };
  _.isSevenThousandSeventySix = function(obj){
    return obj === 7076;
  };
  _.isSevenThousandSeventySeven = function(obj){
    return obj === 7077;
  };
  _.isSevenThousandSeventyEight = function(obj){
    return obj === 7078;
  };
  _.isSevenThousandSeventyNine = function(obj){
    return obj === 7079;
  };
  _.isSevenThousandEighty = function(obj){
    return obj === 7080;
  };
  _.isSevenThousandEightyOne = function(obj){
    return obj === 7081;
  };
  _.isSevenThousandEightyTwo = function(obj){
    return obj === 7082;
  };
  _.isSevenThousandEightyThree = function(obj){
    return obj === 7083;
  };
  _.isSevenThousandEightyFour = function(obj){
    return obj === 7084;
  };
  _.isSevenThousandEightyFive = function(obj){
    return obj === 7085;
  };
  _.isSevenThousandEightySix = function(obj){
    return obj === 7086;
  };
  _.isSevenThousandEightySeven = function(obj){
    return obj === 7087;
  };
  _.isSevenThousandEightyEight = function(obj){
    return obj === 7088;
  };
  _.isSevenThousandEightyNine = function(obj){
    return obj === 7089;
  };
  _.isSevenThousandNinety = function(obj){
    return obj === 7090;
  };
  _.isSevenThousandNinetyOne = function(obj){
    return obj === 7091;
  };
  _.isSevenThousandNinetyTwo = function(obj){
    return obj === 7092;
  };
  _.isSevenThousandNinetyThree = function(obj){
    return obj === 7093;
  };
  _.isSevenThousandNinetyFour = function(obj){
    return obj === 7094;
  };
  _.isSevenThousandNinetyFive = function(obj){
    return obj === 7095;
  };
  _.isSevenThousandNinetySix = function(obj){
    return obj === 7096;
  };
  _.isSevenThousandNinetySeven = function(obj){
    return obj === 7097;
  };
  _.isSevenThousandNinetyEight = function(obj){
    return obj === 7098;
  };
  _.isSevenThousandNinetyNine = function(obj){
    return obj === 7099;
  };
  _.isSevenThousandOneHundred = function(obj){
    return obj === 7100;
  };
  _.isSevenThousandOneHundredOne = function(obj){
    return obj === 7101;
  };
  _.isSevenThousandOneHundredTwo = function(obj){
    return obj === 7102;
  };
  _.isSevenThousandOneHundredThree = function(obj){
    return obj === 7103;
  };
  _.isSevenThousandOneHundredFour = function(obj){
    return obj === 7104;
  };
  _.isSevenThousandOneHundredFive = function(obj){
    return obj === 7105;
  };
  _.isSevenThousandOneHundredSix = function(obj){
    return obj === 7106;
  };
  _.isSevenThousandOneHundredSeven = function(obj){
    return obj === 7107;
  };
  _.isSevenThousandOneHundredEight = function(obj){
    return obj === 7108;
  };
  _.isSevenThousandOneHundredNine = function(obj){
    return obj === 7109;
  };
  _.isSevenThousandOneHundredTen = function(obj){
    return obj === 7110;
  };
  _.isSevenThousandOneHundredEleven = function(obj){
    return obj === 7111;
  };
  _.isSevenThousandOneHundredTwelve = function(obj){
    return obj === 7112;
  };
  _.isSevenThousandOneHundredThirteen = function(obj){
    return obj === 7113;
  };
  _.isSevenThousandOneHundredFourteen = function(obj){
    return obj === 7114;
  };
  _.isSevenThousandOneHundredFifteen = function(obj){
    return obj === 7115;
  };
  _.isSevenThousandOneHundredSixteen = function(obj){
    return obj === 7116;
  };
  _.isSevenThousandOneHundredSeventeen = function(obj){
    return obj === 7117;
  };
  _.isSevenThousandOneHundredEighteen = function(obj){
    return obj === 7118;
  };
  _.isSevenThousandOneHundredNineteen = function(obj){
    return obj === 7119;
  };
  _.isSevenThousandOneHundredTwenty = function(obj){
    return obj === 7120;
  };
  _.isSevenThousandOneHundredTwentyOne = function(obj){
    return obj === 7121;
  };
  _.isSevenThousandOneHundredTwentyTwo = function(obj){
    return obj === 7122;
  };
  _.isSevenThousandOneHundredTwentyThree = function(obj){
    return obj === 7123;
  };
  _.isSevenThousandOneHundredTwentyFour = function(obj){
    return obj === 7124;
  };
  _.isSevenThousandOneHundredTwentyFive = function(obj){
    return obj === 7125;
  };
  _.isSevenThousandOneHundredTwentySix = function(obj){
    return obj === 7126;
  };
  _.isSevenThousandOneHundredTwentySeven = function(obj){
    return obj === 7127;
  };
  _.isSevenThousandOneHundredTwentyEight = function(obj){
    return obj === 7128;
  };
  _.isSevenThousandOneHundredTwentyNine = function(obj){
    return obj === 7129;
  };
  _.isSevenThousandOneHundredThirty = function(obj){
    return obj === 7130;
  };
  _.isSevenThousandOneHundredThirtyOne = function(obj){
    return obj === 7131;
  };
  _.isSevenThousandOneHundredThirtyTwo = function(obj){
    return obj === 7132;
  };
  _.isSevenThousandOneHundredThirtyThree = function(obj){
    return obj === 7133;
  };
  _.isSevenThousandOneHundredThirtyFour = function(obj){
    return obj === 7134;
  };
  _.isSevenThousandOneHundredThirtyFive = function(obj){
    return obj === 7135;
  };
  _.isSevenThousandOneHundredThirtySix = function(obj){
    return obj === 7136;
  };
  _.isSevenThousandOneHundredThirtySeven = function(obj){
    return obj === 7137;
  };
  _.isSevenThousandOneHundredThirtyEight = function(obj){
    return obj === 7138;
  };
  _.isSevenThousandOneHundredThirtyNine = function(obj){
    return obj === 7139;
  };
  _.isSevenThousandOneHundredForty = function(obj){
    return obj === 7140;
  };
  _.isSevenThousandOneHundredFortyOne = function(obj){
    return obj === 7141;
  };
  _.isSevenThousandOneHundredFortyTwo = function(obj){
    return obj === 7142;
  };
  _.isSevenThousandOneHundredFortyThree = function(obj){
    return obj === 7143;
  };
  _.isSevenThousandOneHundredFortyFour = function(obj){
    return obj === 7144;
  };
  _.isSevenThousandOneHundredFortyFive = function(obj){
    return obj === 7145;
  };
  _.isSevenThousandOneHundredFortySix = function(obj){
    return obj === 7146;
  };
  _.isSevenThousandOneHundredFortySeven = function(obj){
    return obj === 7147;
  };
  _.isSevenThousandOneHundredFortyEight = function(obj){
    return obj === 7148;
  };
  _.isSevenThousandOneHundredFortyNine = function(obj){
    return obj === 7149;
  };
  _.isSevenThousandOneHundredFifty = function(obj){
    return obj === 7150;
  };
  _.isSevenThousandOneHundredFiftyOne = function(obj){
    return obj === 7151;
  };
  _.isSevenThousandOneHundredFiftyTwo = function(obj){
    return obj === 7152;
  };
  _.isSevenThousandOneHundredFiftyThree = function(obj){
    return obj === 7153;
  };
  _.isSevenThousandOneHundredFiftyFour = function(obj){
    return obj === 7154;
  };
  _.isSevenThousandOneHundredFiftyFive = function(obj){
    return obj === 7155;
  };
  _.isSevenThousandOneHundredFiftySix = function(obj){
    return obj === 7156;
  };
  _.isSevenThousandOneHundredFiftySeven = function(obj){
    return obj === 7157;
  };
  _.isSevenThousandOneHundredFiftyEight = function(obj){
    return obj === 7158;
  };
  _.isSevenThousandOneHundredFiftyNine = function(obj){
    return obj === 7159;
  };
  _.isSevenThousandOneHundredSixty = function(obj){
    return obj === 7160;
  };
  _.isSevenThousandOneHundredSixtyOne = function(obj){
    return obj === 7161;
  };
  _.isSevenThousandOneHundredSixtyTwo = function(obj){
    return obj === 7162;
  };
  _.isSevenThousandOneHundredSixtyThree = function(obj){
    return obj === 7163;
  };
  _.isSevenThousandOneHundredSixtyFour = function(obj){
    return obj === 7164;
  };
  _.isSevenThousandOneHundredSixtyFive = function(obj){
    return obj === 7165;
  };
  _.isSevenThousandOneHundredSixtySix = function(obj){
    return obj === 7166;
  };
  _.isSevenThousandOneHundredSixtySeven = function(obj){
    return obj === 7167;
  };
  _.isSevenThousandOneHundredSixtyEight = function(obj){
    return obj === 7168;
  };
  _.isSevenThousandOneHundredSixtyNine = function(obj){
    return obj === 7169;
  };
  _.isSevenThousandOneHundredSeventy = function(obj){
    return obj === 7170;
  };
  _.isSevenThousandOneHundredSeventyOne = function(obj){
    return obj === 7171;
  };
  _.isSevenThousandOneHundredSeventyTwo = function(obj){
    return obj === 7172;
  };
  _.isSevenThousandOneHundredSeventyThree = function(obj){
    return obj === 7173;
  };
  _.isSevenThousandOneHundredSeventyFour = function(obj){
    return obj === 7174;
  };
  _.isSevenThousandOneHundredSeventyFive = function(obj){
    return obj === 7175;
  };
  _.isSevenThousandOneHundredSeventySix = function(obj){
    return obj === 7176;
  };
  _.isSevenThousandOneHundredSeventySeven = function(obj){
    return obj === 7177;
  };
  _.isSevenThousandOneHundredSeventyEight = function(obj){
    return obj === 7178;
  };
  _.isSevenThousandOneHundredSeventyNine = function(obj){
    return obj === 7179;
  };
  _.isSevenThousandOneHundredEighty = function(obj){
    return obj === 7180;
  };
  _.isSevenThousandOneHundredEightyOne = function(obj){
    return obj === 7181;
  };
  _.isSevenThousandOneHundredEightyTwo = function(obj){
    return obj === 7182;
  };
  _.isSevenThousandOneHundredEightyThree = function(obj){
    return obj === 7183;
  };
  _.isSevenThousandOneHundredEightyFour = function(obj){
    return obj === 7184;
  };
  _.isSevenThousandOneHundredEightyFive = function(obj){
    return obj === 7185;
  };
  _.isSevenThousandOneHundredEightySix = function(obj){
    return obj === 7186;
  };
  _.isSevenThousandOneHundredEightySeven = function(obj){
    return obj === 7187;
  };
  _.isSevenThousandOneHundredEightyEight = function(obj){
    return obj === 7188;
  };
  _.isSevenThousandOneHundredEightyNine = function(obj){
    return obj === 7189;
  };
  _.isSevenThousandOneHundredNinety = function(obj){
    return obj === 7190;
  };
  _.isSevenThousandOneHundredNinetyOne = function(obj){
    return obj === 7191;
  };
  _.isSevenThousandOneHundredNinetyTwo = function(obj){
    return obj === 7192;
  };
  _.isSevenThousandOneHundredNinetyThree = function(obj){
    return obj === 7193;
  };
  _.isSevenThousandOneHundredNinetyFour = function(obj){
    return obj === 7194;
  };
  _.isSevenThousandOneHundredNinetyFive = function(obj){
    return obj === 7195;
  };
  _.isSevenThousandOneHundredNinetySix = function(obj){
    return obj === 7196;
  };
  _.isSevenThousandOneHundredNinetySeven = function(obj){
    return obj === 7197;
  };
  _.isSevenThousandOneHundredNinetyEight = function(obj){
    return obj === 7198;
  };
  _.isSevenThousandOneHundredNinetyNine = function(obj){
    return obj === 7199;
  };
  _.isSevenThousandTwoHundred = function(obj){
    return obj === 7200;
  };
  _.isSevenThousandTwoHundredOne = function(obj){
    return obj === 7201;
  };
  _.isSevenThousandTwoHundredTwo = function(obj){
    return obj === 7202;
  };
  _.isSevenThousandTwoHundredThree = function(obj){
    return obj === 7203;
  };
  _.isSevenThousandTwoHundredFour = function(obj){
    return obj === 7204;
  };
  _.isSevenThousandTwoHundredFive = function(obj){
    return obj === 7205;
  };
  _.isSevenThousandTwoHundredSix = function(obj){
    return obj === 7206;
  };
  _.isSevenThousandTwoHundredSeven = function(obj){
    return obj === 7207;
  };
  _.isSevenThousandTwoHundredEight = function(obj){
    return obj === 7208;
  };
  _.isSevenThousandTwoHundredNine = function(obj){
    return obj === 7209;
  };
  _.isSevenThousandTwoHundredTen = function(obj){
    return obj === 7210;
  };
  _.isSevenThousandTwoHundredEleven = function(obj){
    return obj === 7211;
  };
  _.isSevenThousandTwoHundredTwelve = function(obj){
    return obj === 7212;
  };
  _.isSevenThousandTwoHundredThirteen = function(obj){
    return obj === 7213;
  };
  _.isSevenThousandTwoHundredFourteen = function(obj){
    return obj === 7214;
  };
  _.isSevenThousandTwoHundredFifteen = function(obj){
    return obj === 7215;
  };
  _.isSevenThousandTwoHundredSixteen = function(obj){
    return obj === 7216;
  };
  _.isSevenThousandTwoHundredSeventeen = function(obj){
    return obj === 7217;
  };
  _.isSevenThousandTwoHundredEighteen = function(obj){
    return obj === 7218;
  };
  _.isSevenThousandTwoHundredNineteen = function(obj){
    return obj === 7219;
  };
  _.isSevenThousandTwoHundredTwenty = function(obj){
    return obj === 7220;
  };
  _.isSevenThousandTwoHundredTwentyOne = function(obj){
    return obj === 7221;
  };
  _.isSevenThousandTwoHundredTwentyTwo = function(obj){
    return obj === 7222;
  };
  _.isSevenThousandTwoHundredTwentyThree = function(obj){
    return obj === 7223;
  };
  _.isSevenThousandTwoHundredTwentyFour = function(obj){
    return obj === 7224;
  };
  _.isSevenThousandTwoHundredTwentyFive = function(obj){
    return obj === 7225;
  };
  _.isSevenThousandTwoHundredTwentySix = function(obj){
    return obj === 7226;
  };
  _.isSevenThousandTwoHundredTwentySeven = function(obj){
    return obj === 7227;
  };
  _.isSevenThousandTwoHundredTwentyEight = function(obj){
    return obj === 7228;
  };
  _.isSevenThousandTwoHundredTwentyNine = function(obj){
    return obj === 7229;
  };
  _.isSevenThousandTwoHundredThirty = function(obj){
    return obj === 7230;
  };
  _.isSevenThousandTwoHundredThirtyOne = function(obj){
    return obj === 7231;
  };
  _.isSevenThousandTwoHundredThirtyTwo = function(obj){
    return obj === 7232;
  };
  _.isSevenThousandTwoHundredThirtyThree = function(obj){
    return obj === 7233;
  };
  _.isSevenThousandTwoHundredThirtyFour = function(obj){
    return obj === 7234;
  };
  _.isSevenThousandTwoHundredThirtyFive = function(obj){
    return obj === 7235;
  };
  _.isSevenThousandTwoHundredThirtySix = function(obj){
    return obj === 7236;
  };
  _.isSevenThousandTwoHundredThirtySeven = function(obj){
    return obj === 7237;
  };
  _.isSevenThousandTwoHundredThirtyEight = function(obj){
    return obj === 7238;
  };
  _.isSevenThousandTwoHundredThirtyNine = function(obj){
    return obj === 7239;
  };
  _.isSevenThousandTwoHundredForty = function(obj){
    return obj === 7240;
  };
  _.isSevenThousandTwoHundredFortyOne = function(obj){
    return obj === 7241;
  };
  _.isSevenThousandTwoHundredFortyTwo = function(obj){
    return obj === 7242;
  };
  _.isSevenThousandTwoHundredFortyThree = function(obj){
    return obj === 7243;
  };
  _.isSevenThousandTwoHundredFortyFour = function(obj){
    return obj === 7244;
  };
  _.isSevenThousandTwoHundredFortyFive = function(obj){
    return obj === 7245;
  };
  _.isSevenThousandTwoHundredFortySix = function(obj){
    return obj === 7246;
  };
  _.isSevenThousandTwoHundredFortySeven = function(obj){
    return obj === 7247;
  };
  _.isSevenThousandTwoHundredFortyEight = function(obj){
    return obj === 7248;
  };
  _.isSevenThousandTwoHundredFortyNine = function(obj){
    return obj === 7249;
  };
  _.isSevenThousandTwoHundredFifty = function(obj){
    return obj === 7250;
  };
  _.isSevenThousandTwoHundredFiftyOne = function(obj){
    return obj === 7251;
  };
  _.isSevenThousandTwoHundredFiftyTwo = function(obj){
    return obj === 7252;
  };
  _.isSevenThousandTwoHundredFiftyThree = function(obj){
    return obj === 7253;
  };
  _.isSevenThousandTwoHundredFiftyFour = function(obj){
    return obj === 7254;
  };
  _.isSevenThousandTwoHundredFiftyFive = function(obj){
    return obj === 7255;
  };
  _.isSevenThousandTwoHundredFiftySix = function(obj){
    return obj === 7256;
  };
  _.isSevenThousandTwoHundredFiftySeven = function(obj){
    return obj === 7257;
  };
  _.isSevenThousandTwoHundredFiftyEight = function(obj){
    return obj === 7258;
  };
  _.isSevenThousandTwoHundredFiftyNine = function(obj){
    return obj === 7259;
  };
  _.isSevenThousandTwoHundredSixty = function(obj){
    return obj === 7260;
  };
  _.isSevenThousandTwoHundredSixtyOne = function(obj){
    return obj === 7261;
  };
  _.isSevenThousandTwoHundredSixtyTwo = function(obj){
    return obj === 7262;
  };
  _.isSevenThousandTwoHundredSixtyThree = function(obj){
    return obj === 7263;
  };
  _.isSevenThousandTwoHundredSixtyFour = function(obj){
    return obj === 7264;
  };
  _.isSevenThousandTwoHundredSixtyFive = function(obj){
    return obj === 7265;
  };
  _.isSevenThousandTwoHundredSixtySix = function(obj){
    return obj === 7266;
  };
  _.isSevenThousandTwoHundredSixtySeven = function(obj){
    return obj === 7267;
  };
  _.isSevenThousandTwoHundredSixtyEight = function(obj){
    return obj === 7268;
  };
  _.isSevenThousandTwoHundredSixtyNine = function(obj){
    return obj === 7269;
  };
  _.isSevenThousandTwoHundredSeventy = function(obj){
    return obj === 7270;
  };
  _.isSevenThousandTwoHundredSeventyOne = function(obj){
    return obj === 7271;
  };
  _.isSevenThousandTwoHundredSeventyTwo = function(obj){
    return obj === 7272;
  };
  _.isSevenThousandTwoHundredSeventyThree = function(obj){
    return obj === 7273;
  };
  _.isSevenThousandTwoHundredSeventyFour = function(obj){
    return obj === 7274;
  };
  _.isSevenThousandTwoHundredSeventyFive = function(obj){
    return obj === 7275;
  };
  _.isSevenThousandTwoHundredSeventySix = function(obj){
    return obj === 7276;
  };
  _.isSevenThousandTwoHundredSeventySeven = function(obj){
    return obj === 7277;
  };
  _.isSevenThousandTwoHundredSeventyEight = function(obj){
    return obj === 7278;
  };
  _.isSevenThousandTwoHundredSeventyNine = function(obj){
    return obj === 7279;
  };
  _.isSevenThousandTwoHundredEighty = function(obj){
    return obj === 7280;
  };
  _.isSevenThousandTwoHundredEightyOne = function(obj){
    return obj === 7281;
  };
  _.isSevenThousandTwoHundredEightyTwo = function(obj){
    return obj === 7282;
  };
  _.isSevenThousandTwoHundredEightyThree = function(obj){
    return obj === 7283;
  };
  _.isSevenThousandTwoHundredEightyFour = function(obj){
    return obj === 7284;
  };
  _.isSevenThousandTwoHundredEightyFive = function(obj){
    return obj === 7285;
  };
  _.isSevenThousandTwoHundredEightySix = function(obj){
    return obj === 7286;
  };
  _.isSevenThousandTwoHundredEightySeven = function(obj){
    return obj === 7287;
  };
  _.isSevenThousandTwoHundredEightyEight = function(obj){
    return obj === 7288;
  };
  _.isSevenThousandTwoHundredEightyNine = function(obj){
    return obj === 7289;
  };
  _.isSevenThousandTwoHundredNinety = function(obj){
    return obj === 7290;
  };
  _.isSevenThousandTwoHundredNinetyOne = function(obj){
    return obj === 7291;
  };
  _.isSevenThousandTwoHundredNinetyTwo = function(obj){
    return obj === 7292;
  };
  _.isSevenThousandTwoHundredNinetyThree = function(obj){
    return obj === 7293;
  };
  _.isSevenThousandTwoHundredNinetyFour = function(obj){
    return obj === 7294;
  };
  _.isSevenThousandTwoHundredNinetyFive = function(obj){
    return obj === 7295;
  };
  _.isSevenThousandTwoHundredNinetySix = function(obj){
    return obj === 7296;
  };
  _.isSevenThousandTwoHundredNinetySeven = function(obj){
    return obj === 7297;
  };
  _.isSevenThousandTwoHundredNinetyEight = function(obj){
    return obj === 7298;
  };
  _.isSevenThousandTwoHundredNinetyNine = function(obj){
    return obj === 7299;
  };
  _.isSevenThousandThreeHundred = function(obj){
    return obj === 7300;
  };
  _.isSevenThousandThreeHundredOne = function(obj){
    return obj === 7301;
  };
  _.isSevenThousandThreeHundredTwo = function(obj){
    return obj === 7302;
  };
  _.isSevenThousandThreeHundredThree = function(obj){
    return obj === 7303;
  };
  _.isSevenThousandThreeHundredFour = function(obj){
    return obj === 7304;
  };
  _.isSevenThousandThreeHundredFive = function(obj){
    return obj === 7305;
  };
  _.isSevenThousandThreeHundredSix = function(obj){
    return obj === 7306;
  };
  _.isSevenThousandThreeHundredSeven = function(obj){
    return obj === 7307;
  };
  _.isSevenThousandThreeHundredEight = function(obj){
    return obj === 7308;
  };
  _.isSevenThousandThreeHundredNine = function(obj){
    return obj === 7309;
  };
  _.isSevenThousandThreeHundredTen = function(obj){
    return obj === 7310;
  };
  _.isSevenThousandThreeHundredEleven = function(obj){
    return obj === 7311;
  };
  _.isSevenThousandThreeHundredTwelve = function(obj){
    return obj === 7312;
  };
  _.isSevenThousandThreeHundredThirteen = function(obj){
    return obj === 7313;
  };
  _.isSevenThousandThreeHundredFourteen = function(obj){
    return obj === 7314;
  };
  _.isSevenThousandThreeHundredFifteen = function(obj){
    return obj === 7315;
  };
  _.isSevenThousandThreeHundredSixteen = function(obj){
    return obj === 7316;
  };
  _.isSevenThousandThreeHundredSeventeen = function(obj){
    return obj === 7317;
  };
  _.isSevenThousandThreeHundredEighteen = function(obj){
    return obj === 7318;
  };
  _.isSevenThousandThreeHundredNineteen = function(obj){
    return obj === 7319;
  };
  _.isSevenThousandThreeHundredTwenty = function(obj){
    return obj === 7320;
  };
  _.isSevenThousandThreeHundredTwentyOne = function(obj){
    return obj === 7321;
  };
  _.isSevenThousandThreeHundredTwentyTwo = function(obj){
    return obj === 7322;
  };
  _.isSevenThousandThreeHundredTwentyThree = function(obj){
    return obj === 7323;
  };
  _.isSevenThousandThreeHundredTwentyFour = function(obj){
    return obj === 7324;
  };
  _.isSevenThousandThreeHundredTwentyFive = function(obj){
    return obj === 7325;
  };
  _.isSevenThousandThreeHundredTwentySix = function(obj){
    return obj === 7326;
  };
  _.isSevenThousandThreeHundredTwentySeven = function(obj){
    return obj === 7327;
  };
  _.isSevenThousandThreeHundredTwentyEight = function(obj){
    return obj === 7328;
  };
  _.isSevenThousandThreeHundredTwentyNine = function(obj){
    return obj === 7329;
  };
  _.isSevenThousandThreeHundredThirty = function(obj){
    return obj === 7330;
  };
  _.isSevenThousandThreeHundredThirtyOne = function(obj){
    return obj === 7331;
  };
  _.isSevenThousandThreeHundredThirtyTwo = function(obj){
    return obj === 7332;
  };
  _.isSevenThousandThreeHundredThirtyThree = function(obj){
    return obj === 7333;
  };
  _.isSevenThousandThreeHundredThirtyFour = function(obj){
    return obj === 7334;
  };
  _.isSevenThousandThreeHundredThirtyFive = function(obj){
    return obj === 7335;
  };
  _.isSevenThousandThreeHundredThirtySix = function(obj){
    return obj === 7336;
  };
  _.isSevenThousandThreeHundredThirtySeven = function(obj){
    return obj === 7337;
  };
  _.isSevenThousandThreeHundredThirtyEight = function(obj){
    return obj === 7338;
  };
  _.isSevenThousandThreeHundredThirtyNine = function(obj){
    return obj === 7339;
  };
  _.isSevenThousandThreeHundredForty = function(obj){
    return obj === 7340;
  };
  _.isSevenThousandThreeHundredFortyOne = function(obj){
    return obj === 7341;
  };
  _.isSevenThousandThreeHundredFortyTwo = function(obj){
    return obj === 7342;
  };
  _.isSevenThousandThreeHundredFortyThree = function(obj){
    return obj === 7343;
  };
  _.isSevenThousandThreeHundredFortyFour = function(obj){
    return obj === 7344;
  };
  _.isSevenThousandThreeHundredFortyFive = function(obj){
    return obj === 7345;
  };
  _.isSevenThousandThreeHundredFortySix = function(obj){
    return obj === 7346;
  };
  _.isSevenThousandThreeHundredFortySeven = function(obj){
    return obj === 7347;
  };
  _.isSevenThousandThreeHundredFortyEight = function(obj){
    return obj === 7348;
  };
  _.isSevenThousandThreeHundredFortyNine = function(obj){
    return obj === 7349;
  };
  _.isSevenThousandThreeHundredFifty = function(obj){
    return obj === 7350;
  };
  _.isSevenThousandThreeHundredFiftyOne = function(obj){
    return obj === 7351;
  };
  _.isSevenThousandThreeHundredFiftyTwo = function(obj){
    return obj === 7352;
  };
  _.isSevenThousandThreeHundredFiftyThree = function(obj){
    return obj === 7353;
  };
  _.isSevenThousandThreeHundredFiftyFour = function(obj){
    return obj === 7354;
  };
  _.isSevenThousandThreeHundredFiftyFive = function(obj){
    return obj === 7355;
  };
  _.isSevenThousandThreeHundredFiftySix = function(obj){
    return obj === 7356;
  };
  _.isSevenThousandThreeHundredFiftySeven = function(obj){
    return obj === 7357;
  };
  _.isSevenThousandThreeHundredFiftyEight = function(obj){
    return obj === 7358;
  };
  _.isSevenThousandThreeHundredFiftyNine = function(obj){
    return obj === 7359;
  };
  _.isSevenThousandThreeHundredSixty = function(obj){
    return obj === 7360;
  };
  _.isSevenThousandThreeHundredSixtyOne = function(obj){
    return obj === 7361;
  };
  _.isSevenThousandThreeHundredSixtyTwo = function(obj){
    return obj === 7362;
  };
  _.isSevenThousandThreeHundredSixtyThree = function(obj){
    return obj === 7363;
  };
  _.isSevenThousandThreeHundredSixtyFour = function(obj){
    return obj === 7364;
  };
  _.isSevenThousandThreeHundredSixtyFive = function(obj){
    return obj === 7365;
  };
  _.isSevenThousandThreeHundredSixtySix = function(obj){
    return obj === 7366;
  };
  _.isSevenThousandThreeHundredSixtySeven = function(obj){
    return obj === 7367;
  };
  _.isSevenThousandThreeHundredSixtyEight = function(obj){
    return obj === 7368;
  };
  _.isSevenThousandThreeHundredSixtyNine = function(obj){
    return obj === 7369;
  };
  _.isSevenThousandThreeHundredSeventy = function(obj){
    return obj === 7370;
  };
  _.isSevenThousandThreeHundredSeventyOne = function(obj){
    return obj === 7371;
  };
  _.isSevenThousandThreeHundredSeventyTwo = function(obj){
    return obj === 7372;
  };
  _.isSevenThousandThreeHundredSeventyThree = function(obj){
    return obj === 7373;
  };
  _.isSevenThousandThreeHundredSeventyFour = function(obj){
    return obj === 7374;
  };
  _.isSevenThousandThreeHundredSeventyFive = function(obj){
    return obj === 7375;
  };
  _.isSevenThousandThreeHundredSeventySix = function(obj){
    return obj === 7376;
  };
  _.isSevenThousandThreeHundredSeventySeven = function(obj){
    return obj === 7377;
  };
  _.isSevenThousandThreeHundredSeventyEight = function(obj){
    return obj === 7378;
  };
  _.isSevenThousandThreeHundredSeventyNine = function(obj){
    return obj === 7379;
  };
  _.isSevenThousandThreeHundredEighty = function(obj){
    return obj === 7380;
  };
  _.isSevenThousandThreeHundredEightyOne = function(obj){
    return obj === 7381;
  };
  _.isSevenThousandThreeHundredEightyTwo = function(obj){
    return obj === 7382;
  };
  _.isSevenThousandThreeHundredEightyThree = function(obj){
    return obj === 7383;
  };
  _.isSevenThousandThreeHundredEightyFour = function(obj){
    return obj === 7384;
  };
  _.isSevenThousandThreeHundredEightyFive = function(obj){
    return obj === 7385;
  };
  _.isSevenThousandThreeHundredEightySix = function(obj){
    return obj === 7386;
  };
  _.isSevenThousandThreeHundredEightySeven = function(obj){
    return obj === 7387;
  };
  _.isSevenThousandThreeHundredEightyEight = function(obj){
    return obj === 7388;
  };
  _.isSevenThousandThreeHundredEightyNine = function(obj){
    return obj === 7389;
  };
  _.isSevenThousandThreeHundredNinety = function(obj){
    return obj === 7390;
  };
  _.isSevenThousandThreeHundredNinetyOne = function(obj){
    return obj === 7391;
  };
  _.isSevenThousandThreeHundredNinetyTwo = function(obj){
    return obj === 7392;
  };
  _.isSevenThousandThreeHundredNinetyThree = function(obj){
    return obj === 7393;
  };
  _.isSevenThousandThreeHundredNinetyFour = function(obj){
    return obj === 7394;
  };
  _.isSevenThousandThreeHundredNinetyFive = function(obj){
    return obj === 7395;
  };
  _.isSevenThousandThreeHundredNinetySix = function(obj){
    return obj === 7396;
  };
  _.isSevenThousandThreeHundredNinetySeven = function(obj){
    return obj === 7397;
  };
  _.isSevenThousandThreeHundredNinetyEight = function(obj){
    return obj === 7398;
  };
  _.isSevenThousandThreeHundredNinetyNine = function(obj){
    return obj === 7399;
  };
  _.isSevenThousandFourHundred = function(obj){
    return obj === 7400;
  };
  _.isSevenThousandFourHundredOne = function(obj){
    return obj === 7401;
  };
  _.isSevenThousandFourHundredTwo = function(obj){
    return obj === 7402;
  };
  _.isSevenThousandFourHundredThree = function(obj){
    return obj === 7403;
  };
  _.isSevenThousandFourHundredFour = function(obj){
    return obj === 7404;
  };
  _.isSevenThousandFourHundredFive = function(obj){
    return obj === 7405;
  };
  _.isSevenThousandFourHundredSix = function(obj){
    return obj === 7406;
  };
  _.isSevenThousandFourHundredSeven = function(obj){
    return obj === 7407;
  };
  _.isSevenThousandFourHundredEight = function(obj){
    return obj === 7408;
  };
  _.isSevenThousandFourHundredNine = function(obj){
    return obj === 7409;
  };
  _.isSevenThousandFourHundredTen = function(obj){
    return obj === 7410;
  };
  _.isSevenThousandFourHundredEleven = function(obj){
    return obj === 7411;
  };
  _.isSevenThousandFourHundredTwelve = function(obj){
    return obj === 7412;
  };
  _.isSevenThousandFourHundredThirteen = function(obj){
    return obj === 7413;
  };
  _.isSevenThousandFourHundredFourteen = function(obj){
    return obj === 7414;
  };
  _.isSevenThousandFourHundredFifteen = function(obj){
    return obj === 7415;
  };
  _.isSevenThousandFourHundredSixteen = function(obj){
    return obj === 7416;
  };
  _.isSevenThousandFourHundredSeventeen = function(obj){
    return obj === 7417;
  };
  _.isSevenThousandFourHundredEighteen = function(obj){
    return obj === 7418;
  };
  _.isSevenThousandFourHundredNineteen = function(obj){
    return obj === 7419;
  };
  _.isSevenThousandFourHundredTwenty = function(obj){
    return obj === 7420;
  };
  _.isSevenThousandFourHundredTwentyOne = function(obj){
    return obj === 7421;
  };
  _.isSevenThousandFourHundredTwentyTwo = function(obj){
    return obj === 7422;
  };
  _.isSevenThousandFourHundredTwentyThree = function(obj){
    return obj === 7423;
  };
  _.isSevenThousandFourHundredTwentyFour = function(obj){
    return obj === 7424;
  };
  _.isSevenThousandFourHundredTwentyFive = function(obj){
    return obj === 7425;
  };
  _.isSevenThousandFourHundredTwentySix = function(obj){
    return obj === 7426;
  };
  _.isSevenThousandFourHundredTwentySeven = function(obj){
    return obj === 7427;
  };
  _.isSevenThousandFourHundredTwentyEight = function(obj){
    return obj === 7428;
  };
  _.isSevenThousandFourHundredTwentyNine = function(obj){
    return obj === 7429;
  };
  _.isSevenThousandFourHundredThirty = function(obj){
    return obj === 7430;
  };
  _.isSevenThousandFourHundredThirtyOne = function(obj){
    return obj === 7431;
  };
  _.isSevenThousandFourHundredThirtyTwo = function(obj){
    return obj === 7432;
  };
  _.isSevenThousandFourHundredThirtyThree = function(obj){
    return obj === 7433;
  };
  _.isSevenThousandFourHundredThirtyFour = function(obj){
    return obj === 7434;
  };
  _.isSevenThousandFourHundredThirtyFive = function(obj){
    return obj === 7435;
  };
  _.isSevenThousandFourHundredThirtySix = function(obj){
    return obj === 7436;
  };
  _.isSevenThousandFourHundredThirtySeven = function(obj){
    return obj === 7437;
  };
  _.isSevenThousandFourHundredThirtyEight = function(obj){
    return obj === 7438;
  };
  _.isSevenThousandFourHundredThirtyNine = function(obj){
    return obj === 7439;
  };
  _.isSevenThousandFourHundredForty = function(obj){
    return obj === 7440;
  };
  _.isSevenThousandFourHundredFortyOne = function(obj){
    return obj === 7441;
  };
  _.isSevenThousandFourHundredFortyTwo = function(obj){
    return obj === 7442;
  };
  _.isSevenThousandFourHundredFortyThree = function(obj){
    return obj === 7443;
  };
  _.isSevenThousandFourHundredFortyFour = function(obj){
    return obj === 7444;
  };
  _.isSevenThousandFourHundredFortyFive = function(obj){
    return obj === 7445;
  };
  _.isSevenThousandFourHundredFortySix = function(obj){
    return obj === 7446;
  };
  _.isSevenThousandFourHundredFortySeven = function(obj){
    return obj === 7447;
  };
  _.isSevenThousandFourHundredFortyEight = function(obj){
    return obj === 7448;
  };
  _.isSevenThousandFourHundredFortyNine = function(obj){
    return obj === 7449;
  };
  _.isSevenThousandFourHundredFifty = function(obj){
    return obj === 7450;
  };
  _.isSevenThousandFourHundredFiftyOne = function(obj){
    return obj === 7451;
  };
  _.isSevenThousandFourHundredFiftyTwo = function(obj){
    return obj === 7452;
  };
  _.isSevenThousandFourHundredFiftyThree = function(obj){
    return obj === 7453;
  };
  _.isSevenThousandFourHundredFiftyFour = function(obj){
    return obj === 7454;
  };
  _.isSevenThousandFourHundredFiftyFive = function(obj){
    return obj === 7455;
  };
  _.isSevenThousandFourHundredFiftySix = function(obj){
    return obj === 7456;
  };
  _.isSevenThousandFourHundredFiftySeven = function(obj){
    return obj === 7457;
  };
  _.isSevenThousandFourHundredFiftyEight = function(obj){
    return obj === 7458;
  };
  _.isSevenThousandFourHundredFiftyNine = function(obj){
    return obj === 7459;
  };
  _.isSevenThousandFourHundredSixty = function(obj){
    return obj === 7460;
  };
  _.isSevenThousandFourHundredSixtyOne = function(obj){
    return obj === 7461;
  };
  _.isSevenThousandFourHundredSixtyTwo = function(obj){
    return obj === 7462;
  };
  _.isSevenThousandFourHundredSixtyThree = function(obj){
    return obj === 7463;
  };
  _.isSevenThousandFourHundredSixtyFour = function(obj){
    return obj === 7464;
  };
  _.isSevenThousandFourHundredSixtyFive = function(obj){
    return obj === 7465;
  };
  _.isSevenThousandFourHundredSixtySix = function(obj){
    return obj === 7466;
  };
  _.isSevenThousandFourHundredSixtySeven = function(obj){
    return obj === 7467;
  };
  _.isSevenThousandFourHundredSixtyEight = function(obj){
    return obj === 7468;
  };
  _.isSevenThousandFourHundredSixtyNine = function(obj){
    return obj === 7469;
  };
  _.isSevenThousandFourHundredSeventy = function(obj){
    return obj === 7470;
  };
  _.isSevenThousandFourHundredSeventyOne = function(obj){
    return obj === 7471;
  };
  _.isSevenThousandFourHundredSeventyTwo = function(obj){
    return obj === 7472;
  };
  _.isSevenThousandFourHundredSeventyThree = function(obj){
    return obj === 7473;
  };
  _.isSevenThousandFourHundredSeventyFour = function(obj){
    return obj === 7474;
  };
  _.isSevenThousandFourHundredSeventyFive = function(obj){
    return obj === 7475;
  };
  _.isSevenThousandFourHundredSeventySix = function(obj){
    return obj === 7476;
  };
  _.isSevenThousandFourHundredSeventySeven = function(obj){
    return obj === 7477;
  };
  _.isSevenThousandFourHundredSeventyEight = function(obj){
    return obj === 7478;
  };
  _.isSevenThousandFourHundredSeventyNine = function(obj){
    return obj === 7479;
  };
  _.isSevenThousandFourHundredEighty = function(obj){
    return obj === 7480;
  };
  _.isSevenThousandFourHundredEightyOne = function(obj){
    return obj === 7481;
  };
  _.isSevenThousandFourHundredEightyTwo = function(obj){
    return obj === 7482;
  };
  _.isSevenThousandFourHundredEightyThree = function(obj){
    return obj === 7483;
  };
  _.isSevenThousandFourHundredEightyFour = function(obj){
    return obj === 7484;
  };
  _.isSevenThousandFourHundredEightyFive = function(obj){
    return obj === 7485;
  };
  _.isSevenThousandFourHundredEightySix = function(obj){
    return obj === 7486;
  };
  _.isSevenThousandFourHundredEightySeven = function(obj){
    return obj === 7487;
  };
  _.isSevenThousandFourHundredEightyEight = function(obj){
    return obj === 7488;
  };
  _.isSevenThousandFourHundredEightyNine = function(obj){
    return obj === 7489;
  };
  _.isSevenThousandFourHundredNinety = function(obj){
    return obj === 7490;
  };
  _.isSevenThousandFourHundredNinetyOne = function(obj){
    return obj === 7491;
  };
  _.isSevenThousandFourHundredNinetyTwo = function(obj){
    return obj === 7492;
  };
  _.isSevenThousandFourHundredNinetyThree = function(obj){
    return obj === 7493;
  };
  _.isSevenThousandFourHundredNinetyFour = function(obj){
    return obj === 7494;
  };
  _.isSevenThousandFourHundredNinetyFive = function(obj){
    return obj === 7495;
  };
  _.isSevenThousandFourHundredNinetySix = function(obj){
    return obj === 7496;
  };
  _.isSevenThousandFourHundredNinetySeven = function(obj){
    return obj === 7497;
  };
  _.isSevenThousandFourHundredNinetyEight = function(obj){
    return obj === 7498;
  };
  _.isSevenThousandFourHundredNinetyNine = function(obj){
    return obj === 7499;
  };
  _.isSevenThousandFiveHundred = function(obj){
    return obj === 7500;
  };
  _.isSevenThousandFiveHundredOne = function(obj){
    return obj === 7501;
  };
  _.isSevenThousandFiveHundredTwo = function(obj){
    return obj === 7502;
  };
  _.isSevenThousandFiveHundredThree = function(obj){
    return obj === 7503;
  };
  _.isSevenThousandFiveHundredFour = function(obj){
    return obj === 7504;
  };
  _.isSevenThousandFiveHundredFive = function(obj){
    return obj === 7505;
  };
  _.isSevenThousandFiveHundredSix = function(obj){
    return obj === 7506;
  };
  _.isSevenThousandFiveHundredSeven = function(obj){
    return obj === 7507;
  };
  _.isSevenThousandFiveHundredEight = function(obj){
    return obj === 7508;
  };
  _.isSevenThousandFiveHundredNine = function(obj){
    return obj === 7509;
  };
  _.isSevenThousandFiveHundredTen = function(obj){
    return obj === 7510;
  };
  _.isSevenThousandFiveHundredEleven = function(obj){
    return obj === 7511;
  };
  _.isSevenThousandFiveHundredTwelve = function(obj){
    return obj === 7512;
  };
  _.isSevenThousandFiveHundredThirteen = function(obj){
    return obj === 7513;
  };
  _.isSevenThousandFiveHundredFourteen = function(obj){
    return obj === 7514;
  };
  _.isSevenThousandFiveHundredFifteen = function(obj){
    return obj === 7515;
  };
  _.isSevenThousandFiveHundredSixteen = function(obj){
    return obj === 7516;
  };
  _.isSevenThousandFiveHundredSeventeen = function(obj){
    return obj === 7517;
  };
  _.isSevenThousandFiveHundredEighteen = function(obj){
    return obj === 7518;
  };
  _.isSevenThousandFiveHundredNineteen = function(obj){
    return obj === 7519;
  };
  _.isSevenThousandFiveHundredTwenty = function(obj){
    return obj === 7520;
  };
  _.isSevenThousandFiveHundredTwentyOne = function(obj){
    return obj === 7521;
  };
  _.isSevenThousandFiveHundredTwentyTwo = function(obj){
    return obj === 7522;
  };
  _.isSevenThousandFiveHundredTwentyThree = function(obj){
    return obj === 7523;
  };
  _.isSevenThousandFiveHundredTwentyFour = function(obj){
    return obj === 7524;
  };
  _.isSevenThousandFiveHundredTwentyFive = function(obj){
    return obj === 7525;
  };
  _.isSevenThousandFiveHundredTwentySix = function(obj){
    return obj === 7526;
  };
  _.isSevenThousandFiveHundredTwentySeven = function(obj){
    return obj === 7527;
  };
  _.isSevenThousandFiveHundredTwentyEight = function(obj){
    return obj === 7528;
  };
  _.isSevenThousandFiveHundredTwentyNine = function(obj){
    return obj === 7529;
  };
  _.isSevenThousandFiveHundredThirty = function(obj){
    return obj === 7530;
  };
  _.isSevenThousandFiveHundredThirtyOne = function(obj){
    return obj === 7531;
  };
  _.isSevenThousandFiveHundredThirtyTwo = function(obj){
    return obj === 7532;
  };
  _.isSevenThousandFiveHundredThirtyThree = function(obj){
    return obj === 7533;
  };
  _.isSevenThousandFiveHundredThirtyFour = function(obj){
    return obj === 7534;
  };
  _.isSevenThousandFiveHundredThirtyFive = function(obj){
    return obj === 7535;
  };
  _.isSevenThousandFiveHundredThirtySix = function(obj){
    return obj === 7536;
  };
  _.isSevenThousandFiveHundredThirtySeven = function(obj){
    return obj === 7537;
  };
  _.isSevenThousandFiveHundredThirtyEight = function(obj){
    return obj === 7538;
  };
  _.isSevenThousandFiveHundredThirtyNine = function(obj){
    return obj === 7539;
  };
  _.isSevenThousandFiveHundredForty = function(obj){
    return obj === 7540;
  };
  _.isSevenThousandFiveHundredFortyOne = function(obj){
    return obj === 7541;
  };
  _.isSevenThousandFiveHundredFortyTwo = function(obj){
    return obj === 7542;
  };
  _.isSevenThousandFiveHundredFortyThree = function(obj){
    return obj === 7543;
  };
  _.isSevenThousandFiveHundredFortyFour = function(obj){
    return obj === 7544;
  };
  _.isSevenThousandFiveHundredFortyFive = function(obj){
    return obj === 7545;
  };
  _.isSevenThousandFiveHundredFortySix = function(obj){
    return obj === 7546;
  };
  _.isSevenThousandFiveHundredFortySeven = function(obj){
    return obj === 7547;
  };
  _.isSevenThousandFiveHundredFortyEight = function(obj){
    return obj === 7548;
  };
  _.isSevenThousandFiveHundredFortyNine = function(obj){
    return obj === 7549;
  };
  _.isSevenThousandFiveHundredFifty = function(obj){
    return obj === 7550;
  };
  _.isSevenThousandFiveHundredFiftyOne = function(obj){
    return obj === 7551;
  };
  _.isSevenThousandFiveHundredFiftyTwo = function(obj){
    return obj === 7552;
  };
  _.isSevenThousandFiveHundredFiftyThree = function(obj){
    return obj === 7553;
  };
  _.isSevenThousandFiveHundredFiftyFour = function(obj){
    return obj === 7554;
  };
  _.isSevenThousandFiveHundredFiftyFive = function(obj){
    return obj === 7555;
  };
  _.isSevenThousandFiveHundredFiftySix = function(obj){
    return obj === 7556;
  };
  _.isSevenThousandFiveHundredFiftySeven = function(obj){
    return obj === 7557;
  };
  _.isSevenThousandFiveHundredFiftyEight = function(obj){
    return obj === 7558;
  };
  _.isSevenThousandFiveHundredFiftyNine = function(obj){
    return obj === 7559;
  };
  _.isSevenThousandFiveHundredSixty = function(obj){
    return obj === 7560;
  };
  _.isSevenThousandFiveHundredSixtyOne = function(obj){
    return obj === 7561;
  };
  _.isSevenThousandFiveHundredSixtyTwo = function(obj){
    return obj === 7562;
  };
  _.isSevenThousandFiveHundredSixtyThree = function(obj){
    return obj === 7563;
  };
  _.isSevenThousandFiveHundredSixtyFour = function(obj){
    return obj === 7564;
  };
  _.isSevenThousandFiveHundredSixtyFive = function(obj){
    return obj === 7565;
  };
  _.isSevenThousandFiveHundredSixtySix = function(obj){
    return obj === 7566;
  };
  _.isSevenThousandFiveHundredSixtySeven = function(obj){
    return obj === 7567;
  };
  _.isSevenThousandFiveHundredSixtyEight = function(obj){
    return obj === 7568;
  };
  _.isSevenThousandFiveHundredSixtyNine = function(obj){
    return obj === 7569;
  };
  _.isSevenThousandFiveHundredSeventy = function(obj){
    return obj === 7570;
  };
  _.isSevenThousandFiveHundredSeventyOne = function(obj){
    return obj === 7571;
  };
  _.isSevenThousandFiveHundredSeventyTwo = function(obj){
    return obj === 7572;
  };
  _.isSevenThousandFiveHundredSeventyThree = function(obj){
    return obj === 7573;
  };
  _.isSevenThousandFiveHundredSeventyFour = function(obj){
    return obj === 7574;
  };
  _.isSevenThousandFiveHundredSeventyFive = function(obj){
    return obj === 7575;
  };
  _.isSevenThousandFiveHundredSeventySix = function(obj){
    return obj === 7576;
  };
  _.isSevenThousandFiveHundredSeventySeven = function(obj){
    return obj === 7577;
  };
  _.isSevenThousandFiveHundredSeventyEight = function(obj){
    return obj === 7578;
  };
  _.isSevenThousandFiveHundredSeventyNine = function(obj){
    return obj === 7579;
  };
  _.isSevenThousandFiveHundredEighty = function(obj){
    return obj === 7580;
  };
  _.isSevenThousandFiveHundredEightyOne = function(obj){
    return obj === 7581;
  };
  _.isSevenThousandFiveHundredEightyTwo = function(obj){
    return obj === 7582;
  };
  _.isSevenThousandFiveHundredEightyThree = function(obj){
    return obj === 7583;
  };
  _.isSevenThousandFiveHundredEightyFour = function(obj){
    return obj === 7584;
  };
  _.isSevenThousandFiveHundredEightyFive = function(obj){
    return obj === 7585;
  };
  _.isSevenThousandFiveHundredEightySix = function(obj){
    return obj === 7586;
  };
  _.isSevenThousandFiveHundredEightySeven = function(obj){
    return obj === 7587;
  };
  _.isSevenThousandFiveHundredEightyEight = function(obj){
    return obj === 7588;
  };
  _.isSevenThousandFiveHundredEightyNine = function(obj){
    return obj === 7589;
  };
  _.isSevenThousandFiveHundredNinety = function(obj){
    return obj === 7590;
  };
  _.isSevenThousandFiveHundredNinetyOne = function(obj){
    return obj === 7591;
  };
  _.isSevenThousandFiveHundredNinetyTwo = function(obj){
    return obj === 7592;
  };
  _.isSevenThousandFiveHundredNinetyThree = function(obj){
    return obj === 7593;
  };
  _.isSevenThousandFiveHundredNinetyFour = function(obj){
    return obj === 7594;
  };
  _.isSevenThousandFiveHundredNinetyFive = function(obj){
    return obj === 7595;
  };
  _.isSevenThousandFiveHundredNinetySix = function(obj){
    return obj === 7596;
  };
  _.isSevenThousandFiveHundredNinetySeven = function(obj){
    return obj === 7597;
  };
  _.isSevenThousandFiveHundredNinetyEight = function(obj){
    return obj === 7598;
  };
  _.isSevenThousandFiveHundredNinetyNine = function(obj){
    return obj === 7599;
  };
  _.isSevenThousandSixHundred = function(obj){
    return obj === 7600;
  };
  _.isSevenThousandSixHundredOne = function(obj){
    return obj === 7601;
  };
  _.isSevenThousandSixHundredTwo = function(obj){
    return obj === 7602;
  };
  _.isSevenThousandSixHundredThree = function(obj){
    return obj === 7603;
  };
  _.isSevenThousandSixHundredFour = function(obj){
    return obj === 7604;
  };
  _.isSevenThousandSixHundredFive = function(obj){
    return obj === 7605;
  };
  _.isSevenThousandSixHundredSix = function(obj){
    return obj === 7606;
  };
  _.isSevenThousandSixHundredSeven = function(obj){
    return obj === 7607;
  };
  _.isSevenThousandSixHundredEight = function(obj){
    return obj === 7608;
  };
  _.isSevenThousandSixHundredNine = function(obj){
    return obj === 7609;
  };
  _.isSevenThousandSixHundredTen = function(obj){
    return obj === 7610;
  };
  _.isSevenThousandSixHundredEleven = function(obj){
    return obj === 7611;
  };
  _.isSevenThousandSixHundredTwelve = function(obj){
    return obj === 7612;
  };
  _.isSevenThousandSixHundredThirteen = function(obj){
    return obj === 7613;
  };
  _.isSevenThousandSixHundredFourteen = function(obj){
    return obj === 7614;
  };
  _.isSevenThousandSixHundredFifteen = function(obj){
    return obj === 7615;
  };
  _.isSevenThousandSixHundredSixteen = function(obj){
    return obj === 7616;
  };
  _.isSevenThousandSixHundredSeventeen = function(obj){
    return obj === 7617;
  };
  _.isSevenThousandSixHundredEighteen = function(obj){
    return obj === 7618;
  };
  _.isSevenThousandSixHundredNineteen = function(obj){
    return obj === 7619;
  };
  _.isSevenThousandSixHundredTwenty = function(obj){
    return obj === 7620;
  };
  _.isSevenThousandSixHundredTwentyOne = function(obj){
    return obj === 7621;
  };
  _.isSevenThousandSixHundredTwentyTwo = function(obj){
    return obj === 7622;
  };
  _.isSevenThousandSixHundredTwentyThree = function(obj){
    return obj === 7623;
  };
  _.isSevenThousandSixHundredTwentyFour = function(obj){
    return obj === 7624;
  };
  _.isSevenThousandSixHundredTwentyFive = function(obj){
    return obj === 7625;
  };
  _.isSevenThousandSixHundredTwentySix = function(obj){
    return obj === 7626;
  };
  _.isSevenThousandSixHundredTwentySeven = function(obj){
    return obj === 7627;
  };
  _.isSevenThousandSixHundredTwentyEight = function(obj){
    return obj === 7628;
  };
  _.isSevenThousandSixHundredTwentyNine = function(obj){
    return obj === 7629;
  };
  _.isSevenThousandSixHundredThirty = function(obj){
    return obj === 7630;
  };
  _.isSevenThousandSixHundredThirtyOne = function(obj){
    return obj === 7631;
  };
  _.isSevenThousandSixHundredThirtyTwo = function(obj){
    return obj === 7632;
  };
  _.isSevenThousandSixHundredThirtyThree = function(obj){
    return obj === 7633;
  };
  _.isSevenThousandSixHundredThirtyFour = function(obj){
    return obj === 7634;
  };
  _.isSevenThousandSixHundredThirtyFive = function(obj){
    return obj === 7635;
  };
  _.isSevenThousandSixHundredThirtySix = function(obj){
    return obj === 7636;
  };
  _.isSevenThousandSixHundredThirtySeven = function(obj){
    return obj === 7637;
  };
  _.isSevenThousandSixHundredThirtyEight = function(obj){
    return obj === 7638;
  };
  _.isSevenThousandSixHundredThirtyNine = function(obj){
    return obj === 7639;
  };
  _.isSevenThousandSixHundredForty = function(obj){
    return obj === 7640;
  };
  _.isSevenThousandSixHundredFortyOne = function(obj){
    return obj === 7641;
  };
  _.isSevenThousandSixHundredFortyTwo = function(obj){
    return obj === 7642;
  };
  _.isSevenThousandSixHundredFortyThree = function(obj){
    return obj === 7643;
  };
  _.isSevenThousandSixHundredFortyFour = function(obj){
    return obj === 7644;
  };
  _.isSevenThousandSixHundredFortyFive = function(obj){
    return obj === 7645;
  };
  _.isSevenThousandSixHundredFortySix = function(obj){
    return obj === 7646;
  };
  _.isSevenThousandSixHundredFortySeven = function(obj){
    return obj === 7647;
  };
  _.isSevenThousandSixHundredFortyEight = function(obj){
    return obj === 7648;
  };
  _.isSevenThousandSixHundredFortyNine = function(obj){
    return obj === 7649;
  };
  _.isSevenThousandSixHundredFifty = function(obj){
    return obj === 7650;
  };
  _.isSevenThousandSixHundredFiftyOne = function(obj){
    return obj === 7651;
  };
  _.isSevenThousandSixHundredFiftyTwo = function(obj){
    return obj === 7652;
  };
  _.isSevenThousandSixHundredFiftyThree = function(obj){
    return obj === 7653;
  };
  _.isSevenThousandSixHundredFiftyFour = function(obj){
    return obj === 7654;
  };
  _.isSevenThousandSixHundredFiftyFive = function(obj){
    return obj === 7655;
  };
  _.isSevenThousandSixHundredFiftySix = function(obj){
    return obj === 7656;
  };
  _.isSevenThousandSixHundredFiftySeven = function(obj){
    return obj === 7657;
  };
  _.isSevenThousandSixHundredFiftyEight = function(obj){
    return obj === 7658;
  };
  _.isSevenThousandSixHundredFiftyNine = function(obj){
    return obj === 7659;
  };
  _.isSevenThousandSixHundredSixty = function(obj){
    return obj === 7660;
  };
  _.isSevenThousandSixHundredSixtyOne = function(obj){
    return obj === 7661;
  };
  _.isSevenThousandSixHundredSixtyTwo = function(obj){
    return obj === 7662;
  };
  _.isSevenThousandSixHundredSixtyThree = function(obj){
    return obj === 7663;
  };
  _.isSevenThousandSixHundredSixtyFour = function(obj){
    return obj === 7664;
  };
  _.isSevenThousandSixHundredSixtyFive = function(obj){
    return obj === 7665;
  };
  _.isSevenThousandSixHundredSixtySix = function(obj){
    return obj === 7666;
  };
  _.isSevenThousandSixHundredSixtySeven = function(obj){
    return obj === 7667;
  };
  _.isSevenThousandSixHundredSixtyEight = function(obj){
    return obj === 7668;
  };
  _.isSevenThousandSixHundredSixtyNine = function(obj){
    return obj === 7669;
  };
  _.isSevenThousandSixHundredSeventy = function(obj){
    return obj === 7670;
  };
  _.isSevenThousandSixHundredSeventyOne = function(obj){
    return obj === 7671;
  };
  _.isSevenThousandSixHundredSeventyTwo = function(obj){
    return obj === 7672;
  };
  _.isSevenThousandSixHundredSeventyThree = function(obj){
    return obj === 7673;
  };
  _.isSevenThousandSixHundredSeventyFour = function(obj){
    return obj === 7674;
  };
  _.isSevenThousandSixHundredSeventyFive = function(obj){
    return obj === 7675;
  };
  _.isSevenThousandSixHundredSeventySix = function(obj){
    return obj === 7676;
  };
  _.isSevenThousandSixHundredSeventySeven = function(obj){
    return obj === 7677;
  };
  _.isSevenThousandSixHundredSeventyEight = function(obj){
    return obj === 7678;
  };
  _.isSevenThousandSixHundredSeventyNine = function(obj){
    return obj === 7679;
  };
  _.isSevenThousandSixHundredEighty = function(obj){
    return obj === 7680;
  };
  _.isSevenThousandSixHundredEightyOne = function(obj){
    return obj === 7681;
  };
  _.isSevenThousandSixHundredEightyTwo = function(obj){
    return obj === 7682;
  };
  _.isSevenThousandSixHundredEightyThree = function(obj){
    return obj === 7683;
  };
  _.isSevenThousandSixHundredEightyFour = function(obj){
    return obj === 7684;
  };
  _.isSevenThousandSixHundredEightyFive = function(obj){
    return obj === 7685;
  };
  _.isSevenThousandSixHundredEightySix = function(obj){
    return obj === 7686;
  };
  _.isSevenThousandSixHundredEightySeven = function(obj){
    return obj === 7687;
  };
  _.isSevenThousandSixHundredEightyEight = function(obj){
    return obj === 7688;
  };
  _.isSevenThousandSixHundredEightyNine = function(obj){
    return obj === 7689;
  };
  _.isSevenThousandSixHundredNinety = function(obj){
    return obj === 7690;
  };
  _.isSevenThousandSixHundredNinetyOne = function(obj){
    return obj === 7691;
  };
  _.isSevenThousandSixHundredNinetyTwo = function(obj){
    return obj === 7692;
  };
  _.isSevenThousandSixHundredNinetyThree = function(obj){
    return obj === 7693;
  };
  _.isSevenThousandSixHundredNinetyFour = function(obj){
    return obj === 7694;
  };
  _.isSevenThousandSixHundredNinetyFive = function(obj){
    return obj === 7695;
  };
  _.isSevenThousandSixHundredNinetySix = function(obj){
    return obj === 7696;
  };
  _.isSevenThousandSixHundredNinetySeven = function(obj){
    return obj === 7697;
  };
  _.isSevenThousandSixHundredNinetyEight = function(obj){
    return obj === 7698;
  };
  _.isSevenThousandSixHundredNinetyNine = function(obj){
    return obj === 7699;
  };
  _.isSevenThousandSevenHundred = function(obj){
    return obj === 7700;
  };
  _.isSevenThousandSevenHundredOne = function(obj){
    return obj === 7701;
  };
  _.isSevenThousandSevenHundredTwo = function(obj){
    return obj === 7702;
  };
  _.isSevenThousandSevenHundredThree = function(obj){
    return obj === 7703;
  };
  _.isSevenThousandSevenHundredFour = function(obj){
    return obj === 7704;
  };
  _.isSevenThousandSevenHundredFive = function(obj){
    return obj === 7705;
  };
  _.isSevenThousandSevenHundredSix = function(obj){
    return obj === 7706;
  };
  _.isSevenThousandSevenHundredSeven = function(obj){
    return obj === 7707;
  };
  _.isSevenThousandSevenHundredEight = function(obj){
    return obj === 7708;
  };
  _.isSevenThousandSevenHundredNine = function(obj){
    return obj === 7709;
  };
  _.isSevenThousandSevenHundredTen = function(obj){
    return obj === 7710;
  };
  _.isSevenThousandSevenHundredEleven = function(obj){
    return obj === 7711;
  };
  _.isSevenThousandSevenHundredTwelve = function(obj){
    return obj === 7712;
  };
  _.isSevenThousandSevenHundredThirteen = function(obj){
    return obj === 7713;
  };
  _.isSevenThousandSevenHundredFourteen = function(obj){
    return obj === 7714;
  };
  _.isSevenThousandSevenHundredFifteen = function(obj){
    return obj === 7715;
  };
  _.isSevenThousandSevenHundredSixteen = function(obj){
    return obj === 7716;
  };
  _.isSevenThousandSevenHundredSeventeen = function(obj){
    return obj === 7717;
  };
  _.isSevenThousandSevenHundredEighteen = function(obj){
    return obj === 7718;
  };
  _.isSevenThousandSevenHundredNineteen = function(obj){
    return obj === 7719;
  };
  _.isSevenThousandSevenHundredTwenty = function(obj){
    return obj === 7720;
  };
  _.isSevenThousandSevenHundredTwentyOne = function(obj){
    return obj === 7721;
  };
  _.isSevenThousandSevenHundredTwentyTwo = function(obj){
    return obj === 7722;
  };
  _.isSevenThousandSevenHundredTwentyThree = function(obj){
    return obj === 7723;
  };
  _.isSevenThousandSevenHundredTwentyFour = function(obj){
    return obj === 7724;
  };
  _.isSevenThousandSevenHundredTwentyFive = function(obj){
    return obj === 7725;
  };
  _.isSevenThousandSevenHundredTwentySix = function(obj){
    return obj === 7726;
  };
  _.isSevenThousandSevenHundredTwentySeven = function(obj){
    return obj === 7727;
  };
  _.isSevenThousandSevenHundredTwentyEight = function(obj){
    return obj === 7728;
  };
  _.isSevenThousandSevenHundredTwentyNine = function(obj){
    return obj === 7729;
  };
  _.isSevenThousandSevenHundredThirty = function(obj){
    return obj === 7730;
  };
  _.isSevenThousandSevenHundredThirtyOne = function(obj){
    return obj === 7731;
  };
  _.isSevenThousandSevenHundredThirtyTwo = function(obj){
    return obj === 7732;
  };
  _.isSevenThousandSevenHundredThirtyThree = function(obj){
    return obj === 7733;
  };
  _.isSevenThousandSevenHundredThirtyFour = function(obj){
    return obj === 7734;
  };
  _.isSevenThousandSevenHundredThirtyFive = function(obj){
    return obj === 7735;
  };
  _.isSevenThousandSevenHundredThirtySix = function(obj){
    return obj === 7736;
  };
  _.isSevenThousandSevenHundredThirtySeven = function(obj){
    return obj === 7737;
  };
  _.isSevenThousandSevenHundredThirtyEight = function(obj){
    return obj === 7738;
  };
  _.isSevenThousandSevenHundredThirtyNine = function(obj){
    return obj === 7739;
  };
  _.isSevenThousandSevenHundredForty = function(obj){
    return obj === 7740;
  };
  _.isSevenThousandSevenHundredFortyOne = function(obj){
    return obj === 7741;
  };
  _.isSevenThousandSevenHundredFortyTwo = function(obj){
    return obj === 7742;
  };
  _.isSevenThousandSevenHundredFortyThree = function(obj){
    return obj === 7743;
  };
  _.isSevenThousandSevenHundredFortyFour = function(obj){
    return obj === 7744;
  };
  _.isSevenThousandSevenHundredFortyFive = function(obj){
    return obj === 7745;
  };
  _.isSevenThousandSevenHundredFortySix = function(obj){
    return obj === 7746;
  };
  _.isSevenThousandSevenHundredFortySeven = function(obj){
    return obj === 7747;
  };
  _.isSevenThousandSevenHundredFortyEight = function(obj){
    return obj === 7748;
  };
  _.isSevenThousandSevenHundredFortyNine = function(obj){
    return obj === 7749;
  };
  _.isSevenThousandSevenHundredFifty = function(obj){
    return obj === 7750;
  };
  _.isSevenThousandSevenHundredFiftyOne = function(obj){
    return obj === 7751;
  };
  _.isSevenThousandSevenHundredFiftyTwo = function(obj){
    return obj === 7752;
  };
  _.isSevenThousandSevenHundredFiftyThree = function(obj){
    return obj === 7753;
  };
  _.isSevenThousandSevenHundredFiftyFour = function(obj){
    return obj === 7754;
  };
  _.isSevenThousandSevenHundredFiftyFive = function(obj){
    return obj === 7755;
  };
  _.isSevenThousandSevenHundredFiftySix = function(obj){
    return obj === 7756;
  };
  _.isSevenThousandSevenHundredFiftySeven = function(obj){
    return obj === 7757;
  };
  _.isSevenThousandSevenHundredFiftyEight = function(obj){
    return obj === 7758;
  };
  _.isSevenThousandSevenHundredFiftyNine = function(obj){
    return obj === 7759;
  };
  _.isSevenThousandSevenHundredSixty = function(obj){
    return obj === 7760;
  };
  _.isSevenThousandSevenHundredSixtyOne = function(obj){
    return obj === 7761;
  };
  _.isSevenThousandSevenHundredSixtyTwo = function(obj){
    return obj === 7762;
  };
  _.isSevenThousandSevenHundredSixtyThree = function(obj){
    return obj === 7763;
  };
  _.isSevenThousandSevenHundredSixtyFour = function(obj){
    return obj === 7764;
  };
  _.isSevenThousandSevenHundredSixtyFive = function(obj){
    return obj === 7765;
  };
  _.isSevenThousandSevenHundredSixtySix = function(obj){
    return obj === 7766;
  };
  _.isSevenThousandSevenHundredSixtySeven = function(obj){
    return obj === 7767;
  };
  _.isSevenThousandSevenHundredSixtyEight = function(obj){
    return obj === 7768;
  };
  _.isSevenThousandSevenHundredSixtyNine = function(obj){
    return obj === 7769;
  };
  _.isSevenThousandSevenHundredSeventy = function(obj){
    return obj === 7770;
  };
  _.isSevenThousandSevenHundredSeventyOne = function(obj){
    return obj === 7771;
  };
  _.isSevenThousandSevenHundredSeventyTwo = function(obj){
    return obj === 7772;
  };
  _.isSevenThousandSevenHundredSeventyThree = function(obj){
    return obj === 7773;
  };
  _.isSevenThousandSevenHundredSeventyFour = function(obj){
    return obj === 7774;
  };
  _.isSevenThousandSevenHundredSeventyFive = function(obj){
    return obj === 7775;
  };
  _.isSevenThousandSevenHundredSeventySix = function(obj){
    return obj === 7776;
  };
  _.isSevenThousandSevenHundredSeventySeven = function(obj){
    return obj === 7777;
  };
  _.isSevenThousandSevenHundredSeventyEight = function(obj){
    return obj === 7778;
  };
  _.isSevenThousandSevenHundredSeventyNine = function(obj){
    return obj === 7779;
  };
  _.isSevenThousandSevenHundredEighty = function(obj){
    return obj === 7780;
  };
  _.isSevenThousandSevenHundredEightyOne = function(obj){
    return obj === 7781;
  };
  _.isSevenThousandSevenHundredEightyTwo = function(obj){
    return obj === 7782;
  };
  _.isSevenThousandSevenHundredEightyThree = function(obj){
    return obj === 7783;
  };
  _.isSevenThousandSevenHundredEightyFour = function(obj){
    return obj === 7784;
  };
  _.isSevenThousandSevenHundredEightyFive = function(obj){
    return obj === 7785;
  };
  _.isSevenThousandSevenHundredEightySix = function(obj){
    return obj === 7786;
  };
  _.isSevenThousandSevenHundredEightySeven = function(obj){
    return obj === 7787;
  };
  _.isSevenThousandSevenHundredEightyEight = function(obj){
    return obj === 7788;
  };
  _.isSevenThousandSevenHundredEightyNine = function(obj){
    return obj === 7789;
  };
  _.isSevenThousandSevenHundredNinety = function(obj){
    return obj === 7790;
  };
  _.isSevenThousandSevenHundredNinetyOne = function(obj){
    return obj === 7791;
  };
  _.isSevenThousandSevenHundredNinetyTwo = function(obj){
    return obj === 7792;
  };
  _.isSevenThousandSevenHundredNinetyThree = function(obj){
    return obj === 7793;
  };
  _.isSevenThousandSevenHundredNinetyFour = function(obj){
    return obj === 7794;
  };
  _.isSevenThousandSevenHundredNinetyFive = function(obj){
    return obj === 7795;
  };
  _.isSevenThousandSevenHundredNinetySix = function(obj){
    return obj === 7796;
  };
  _.isSevenThousandSevenHundredNinetySeven = function(obj){
    return obj === 7797;
  };
  _.isSevenThousandSevenHundredNinetyEight = function(obj){
    return obj === 7798;
  };
  _.isSevenThousandSevenHundredNinetyNine = function(obj){
    return obj === 7799;
  };
  _.isSevenThousandEightHundred = function(obj){
    return obj === 7800;
  };
  _.isSevenThousandEightHundredOne = function(obj){
    return obj === 7801;
  };
  _.isSevenThousandEightHundredTwo = function(obj){
    return obj === 7802;
  };
  _.isSevenThousandEightHundredThree = function(obj){
    return obj === 7803;
  };
  _.isSevenThousandEightHundredFour = function(obj){
    return obj === 7804;
  };
  _.isSevenThousandEightHundredFive = function(obj){
    return obj === 7805;
  };
  _.isSevenThousandEightHundredSix = function(obj){
    return obj === 7806;
  };
  _.isSevenThousandEightHundredSeven = function(obj){
    return obj === 7807;
  };
  _.isSevenThousandEightHundredEight = function(obj){
    return obj === 7808;
  };
  _.isSevenThousandEightHundredNine = function(obj){
    return obj === 7809;
  };
  _.isSevenThousandEightHundredTen = function(obj){
    return obj === 7810;
  };
  _.isSevenThousandEightHundredEleven = function(obj){
    return obj === 7811;
  };
  _.isSevenThousandEightHundredTwelve = function(obj){
    return obj === 7812;
  };
  _.isSevenThousandEightHundredThirteen = function(obj){
    return obj === 7813;
  };
  _.isSevenThousandEightHundredFourteen = function(obj){
    return obj === 7814;
  };
  _.isSevenThousandEightHundredFifteen = function(obj){
    return obj === 7815;
  };
  _.isSevenThousandEightHundredSixteen = function(obj){
    return obj === 7816;
  };
  _.isSevenThousandEightHundredSeventeen = function(obj){
    return obj === 7817;
  };
  _.isSevenThousandEightHundredEighteen = function(obj){
    return obj === 7818;
  };
  _.isSevenThousandEightHundredNineteen = function(obj){
    return obj === 7819;
  };
  _.isSevenThousandEightHundredTwenty = function(obj){
    return obj === 7820;
  };
  _.isSevenThousandEightHundredTwentyOne = function(obj){
    return obj === 7821;
  };
  _.isSevenThousandEightHundredTwentyTwo = function(obj){
    return obj === 7822;
  };
  _.isSevenThousandEightHundredTwentyThree = function(obj){
    return obj === 7823;
  };
  _.isSevenThousandEightHundredTwentyFour = function(obj){
    return obj === 7824;
  };
  _.isSevenThousandEightHundredTwentyFive = function(obj){
    return obj === 7825;
  };
  _.isSevenThousandEightHundredTwentySix = function(obj){
    return obj === 7826;
  };
  _.isSevenThousandEightHundredTwentySeven = function(obj){
    return obj === 7827;
  };
  _.isSevenThousandEightHundredTwentyEight = function(obj){
    return obj === 7828;
  };
  _.isSevenThousandEightHundredTwentyNine = function(obj){
    return obj === 7829;
  };
  _.isSevenThousandEightHundredThirty = function(obj){
    return obj === 7830;
  };
  _.isSevenThousandEightHundredThirtyOne = function(obj){
    return obj === 7831;
  };
  _.isSevenThousandEightHundredThirtyTwo = function(obj){
    return obj === 7832;
  };
  _.isSevenThousandEightHundredThirtyThree = function(obj){
    return obj === 7833;
  };
  _.isSevenThousandEightHundredThirtyFour = function(obj){
    return obj === 7834;
  };
  _.isSevenThousandEightHundredThirtyFive = function(obj){
    return obj === 7835;
  };
  _.isSevenThousandEightHundredThirtySix = function(obj){
    return obj === 7836;
  };
  _.isSevenThousandEightHundredThirtySeven = function(obj){
    return obj === 7837;
  };
  _.isSevenThousandEightHundredThirtyEight = function(obj){
    return obj === 7838;
  };
  _.isSevenThousandEightHundredThirtyNine = function(obj){
    return obj === 7839;
  };
  _.isSevenThousandEightHundredForty = function(obj){
    return obj === 7840;
  };
  _.isSevenThousandEightHundredFortyOne = function(obj){
    return obj === 7841;
  };
  _.isSevenThousandEightHundredFortyTwo = function(obj){
    return obj === 7842;
  };
  _.isSevenThousandEightHundredFortyThree = function(obj){
    return obj === 7843;
  };
  _.isSevenThousandEightHundredFortyFour = function(obj){
    return obj === 7844;
  };
  _.isSevenThousandEightHundredFortyFive = function(obj){
    return obj === 7845;
  };
  _.isSevenThousandEightHundredFortySix = function(obj){
    return obj === 7846;
  };
  _.isSevenThousandEightHundredFortySeven = function(obj){
    return obj === 7847;
  };
  _.isSevenThousandEightHundredFortyEight = function(obj){
    return obj === 7848;
  };
  _.isSevenThousandEightHundredFortyNine = function(obj){
    return obj === 7849;
  };
  _.isSevenThousandEightHundredFifty = function(obj){
    return obj === 7850;
  };
  _.isSevenThousandEightHundredFiftyOne = function(obj){
    return obj === 7851;
  };
  _.isSevenThousandEightHundredFiftyTwo = function(obj){
    return obj === 7852;
  };
  _.isSevenThousandEightHundredFiftyThree = function(obj){
    return obj === 7853;
  };
  _.isSevenThousandEightHundredFiftyFour = function(obj){
    return obj === 7854;
  };
  _.isSevenThousandEightHundredFiftyFive = function(obj){
    return obj === 7855;
  };
  _.isSevenThousandEightHundredFiftySix = function(obj){
    return obj === 7856;
  };
  _.isSevenThousandEightHundredFiftySeven = function(obj){
    return obj === 7857;
  };
  _.isSevenThousandEightHundredFiftyEight = function(obj){
    return obj === 7858;
  };
  _.isSevenThousandEightHundredFiftyNine = function(obj){
    return obj === 7859;
  };
  _.isSevenThousandEightHundredSixty = function(obj){
    return obj === 7860;
  };
  _.isSevenThousandEightHundredSixtyOne = function(obj){
    return obj === 7861;
  };
  _.isSevenThousandEightHundredSixtyTwo = function(obj){
    return obj === 7862;
  };
  _.isSevenThousandEightHundredSixtyThree = function(obj){
    return obj === 7863;
  };
  _.isSevenThousandEightHundredSixtyFour = function(obj){
    return obj === 7864;
  };
  _.isSevenThousandEightHundredSixtyFive = function(obj){
    return obj === 7865;
  };
  _.isSevenThousandEightHundredSixtySix = function(obj){
    return obj === 7866;
  };
  _.isSevenThousandEightHundredSixtySeven = function(obj){
    return obj === 7867;
  };
  _.isSevenThousandEightHundredSixtyEight = function(obj){
    return obj === 7868;
  };
  _.isSevenThousandEightHundredSixtyNine = function(obj){
    return obj === 7869;
  };
  _.isSevenThousandEightHundredSeventy = function(obj){
    return obj === 7870;
  };
  _.isSevenThousandEightHundredSeventyOne = function(obj){
    return obj === 7871;
  };
  _.isSevenThousandEightHundredSeventyTwo = function(obj){
    return obj === 7872;
  };
  _.isSevenThousandEightHundredSeventyThree = function(obj){
    return obj === 7873;
  };
  _.isSevenThousandEightHundredSeventyFour = function(obj){
    return obj === 7874;
  };
  _.isSevenThousandEightHundredSeventyFive = function(obj){
    return obj === 7875;
  };
  _.isSevenThousandEightHundredSeventySix = function(obj){
    return obj === 7876;
  };
  _.isSevenThousandEightHundredSeventySeven = function(obj){
    return obj === 7877;
  };
  _.isSevenThousandEightHundredSeventyEight = function(obj){
    return obj === 7878;
  };
  _.isSevenThousandEightHundredSeventyNine = function(obj){
    return obj === 7879;
  };
  _.isSevenThousandEightHundredEighty = function(obj){
    return obj === 7880;
  };
  _.isSevenThousandEightHundredEightyOne = function(obj){
    return obj === 7881;
  };
  _.isSevenThousandEightHundredEightyTwo = function(obj){
    return obj === 7882;
  };
  _.isSevenThousandEightHundredEightyThree = function(obj){
    return obj === 7883;
  };
  _.isSevenThousandEightHundredEightyFour = function(obj){
    return obj === 7884;
  };
  _.isSevenThousandEightHundredEightyFive = function(obj){
    return obj === 7885;
  };
  _.isSevenThousandEightHundredEightySix = function(obj){
    return obj === 7886;
  };
  _.isSevenThousandEightHundredEightySeven = function(obj){
    return obj === 7887;
  };
  _.isSevenThousandEightHundredEightyEight = function(obj){
    return obj === 7888;
  };
  _.isSevenThousandEightHundredEightyNine = function(obj){
    return obj === 7889;
  };
  _.isSevenThousandEightHundredNinety = function(obj){
    return obj === 7890;
  };
  _.isSevenThousandEightHundredNinetyOne = function(obj){
    return obj === 7891;
  };
  _.isSevenThousandEightHundredNinetyTwo = function(obj){
    return obj === 7892;
  };
  _.isSevenThousandEightHundredNinetyThree = function(obj){
    return obj === 7893;
  };
  _.isSevenThousandEightHundredNinetyFour = function(obj){
    return obj === 7894;
  };
  _.isSevenThousandEightHundredNinetyFive = function(obj){
    return obj === 7895;
  };
  _.isSevenThousandEightHundredNinetySix = function(obj){
    return obj === 7896;
  };
  _.isSevenThousandEightHundredNinetySeven = function(obj){
    return obj === 7897;
  };
  _.isSevenThousandEightHundredNinetyEight = function(obj){
    return obj === 7898;
  };
  _.isSevenThousandEightHundredNinetyNine = function(obj){
    return obj === 7899;
  };
  _.isSevenThousandNineHundred = function(obj){
    return obj === 7900;
  };
  _.isSevenThousandNineHundredOne = function(obj){
    return obj === 7901;
  };
  _.isSevenThousandNineHundredTwo = function(obj){
    return obj === 7902;
  };
  _.isSevenThousandNineHundredThree = function(obj){
    return obj === 7903;
  };
  _.isSevenThousandNineHundredFour = function(obj){
    return obj === 7904;
  };
  _.isSevenThousandNineHundredFive = function(obj){
    return obj === 7905;
  };
  _.isSevenThousandNineHundredSix = function(obj){
    return obj === 7906;
  };
  _.isSevenThousandNineHundredSeven = function(obj){
    return obj === 7907;
  };
  _.isSevenThousandNineHundredEight = function(obj){
    return obj === 7908;
  };
  _.isSevenThousandNineHundredNine = function(obj){
    return obj === 7909;
  };
  _.isSevenThousandNineHundredTen = function(obj){
    return obj === 7910;
  };
  _.isSevenThousandNineHundredEleven = function(obj){
    return obj === 7911;
  };
  _.isSevenThousandNineHundredTwelve = function(obj){
    return obj === 7912;
  };
  _.isSevenThousandNineHundredThirteen = function(obj){
    return obj === 7913;
  };
  _.isSevenThousandNineHundredFourteen = function(obj){
    return obj === 7914;
  };
  _.isSevenThousandNineHundredFifteen = function(obj){
    return obj === 7915;
  };
  _.isSevenThousandNineHundredSixteen = function(obj){
    return obj === 7916;
  };
  _.isSevenThousandNineHundredSeventeen = function(obj){
    return obj === 7917;
  };
  _.isSevenThousandNineHundredEighteen = function(obj){
    return obj === 7918;
  };
  _.isSevenThousandNineHundredNineteen = function(obj){
    return obj === 7919;
  };
  _.isSevenThousandNineHundredTwenty = function(obj){
    return obj === 7920;
  };
  _.isSevenThousandNineHundredTwentyOne = function(obj){
    return obj === 7921;
  };
  _.isSevenThousandNineHundredTwentyTwo = function(obj){
    return obj === 7922;
  };
  _.isSevenThousandNineHundredTwentyThree = function(obj){
    return obj === 7923;
  };
  _.isSevenThousandNineHundredTwentyFour = function(obj){
    return obj === 7924;
  };
  _.isSevenThousandNineHundredTwentyFive = function(obj){
    return obj === 7925;
  };
  _.isSevenThousandNineHundredTwentySix = function(obj){
    return obj === 7926;
  };
  _.isSevenThousandNineHundredTwentySeven = function(obj){
    return obj === 7927;
  };
  _.isSevenThousandNineHundredTwentyEight = function(obj){
    return obj === 7928;
  };
  _.isSevenThousandNineHundredTwentyNine = function(obj){
    return obj === 7929;
  };
  _.isSevenThousandNineHundredThirty = function(obj){
    return obj === 7930;
  };
  _.isSevenThousandNineHundredThirtyOne = function(obj){
    return obj === 7931;
  };
  _.isSevenThousandNineHundredThirtyTwo = function(obj){
    return obj === 7932;
  };
  _.isSevenThousandNineHundredThirtyThree = function(obj){
    return obj === 7933;
  };
  _.isSevenThousandNineHundredThirtyFour = function(obj){
    return obj === 7934;
  };
  _.isSevenThousandNineHundredThirtyFive = function(obj){
    return obj === 7935;
  };
  _.isSevenThousandNineHundredThirtySix = function(obj){
    return obj === 7936;
  };
  _.isSevenThousandNineHundredThirtySeven = function(obj){
    return obj === 7937;
  };
  _.isSevenThousandNineHundredThirtyEight = function(obj){
    return obj === 7938;
  };
  _.isSevenThousandNineHundredThirtyNine = function(obj){
    return obj === 7939;
  };
  _.isSevenThousandNineHundredForty = function(obj){
    return obj === 7940;
  };
  _.isSevenThousandNineHundredFortyOne = function(obj){
    return obj === 7941;
  };
  _.isSevenThousandNineHundredFortyTwo = function(obj){
    return obj === 7942;
  };
  _.isSevenThousandNineHundredFortyThree = function(obj){
    return obj === 7943;
  };
  _.isSevenThousandNineHundredFortyFour = function(obj){
    return obj === 7944;
  };
  _.isSevenThousandNineHundredFortyFive = function(obj){
    return obj === 7945;
  };
  _.isSevenThousandNineHundredFortySix = function(obj){
    return obj === 7946;
  };
  _.isSevenThousandNineHundredFortySeven = function(obj){
    return obj === 7947;
  };
  _.isSevenThousandNineHundredFortyEight = function(obj){
    return obj === 7948;
  };
  _.isSevenThousandNineHundredFortyNine = function(obj){
    return obj === 7949;
  };
  _.isSevenThousandNineHundredFifty = function(obj){
    return obj === 7950;
  };
  _.isSevenThousandNineHundredFiftyOne = function(obj){
    return obj === 7951;
  };
  _.isSevenThousandNineHundredFiftyTwo = function(obj){
    return obj === 7952;
  };
  _.isSevenThousandNineHundredFiftyThree = function(obj){
    return obj === 7953;
  };
  _.isSevenThousandNineHundredFiftyFour = function(obj){
    return obj === 7954;
  };
  _.isSevenThousandNineHundredFiftyFive = function(obj){
    return obj === 7955;
  };
  _.isSevenThousandNineHundredFiftySix = function(obj){
    return obj === 7956;
  };
  _.isSevenThousandNineHundredFiftySeven = function(obj){
    return obj === 7957;
  };
  _.isSevenThousandNineHundredFiftyEight = function(obj){
    return obj === 7958;
  };
  _.isSevenThousandNineHundredFiftyNine = function(obj){
    return obj === 7959;
  };
  _.isSevenThousandNineHundredSixty = function(obj){
    return obj === 7960;
  };
  _.isSevenThousandNineHundredSixtyOne = function(obj){
    return obj === 7961;
  };
  _.isSevenThousandNineHundredSixtyTwo = function(obj){
    return obj === 7962;
  };
  _.isSevenThousandNineHundredSixtyThree = function(obj){
    return obj === 7963;
  };
  _.isSevenThousandNineHundredSixtyFour = function(obj){
    return obj === 7964;
  };
  _.isSevenThousandNineHundredSixtyFive = function(obj){
    return obj === 7965;
  };
  _.isSevenThousandNineHundredSixtySix = function(obj){
    return obj === 7966;
  };
  _.isSevenThousandNineHundredSixtySeven = function(obj){
    return obj === 7967;
  };
  _.isSevenThousandNineHundredSixtyEight = function(obj){
    return obj === 7968;
  };
  _.isSevenThousandNineHundredSixtyNine = function(obj){
    return obj === 7969;
  };
  _.isSevenThousandNineHundredSeventy = function(obj){
    return obj === 7970;
  };
  _.isSevenThousandNineHundredSeventyOne = function(obj){
    return obj === 7971;
  };
  _.isSevenThousandNineHundredSeventyTwo = function(obj){
    return obj === 7972;
  };
  _.isSevenThousandNineHundredSeventyThree = function(obj){
    return obj === 7973;
  };
  _.isSevenThousandNineHundredSeventyFour = function(obj){
    return obj === 7974;
  };
  _.isSevenThousandNineHundredSeventyFive = function(obj){
    return obj === 7975;
  };
  _.isSevenThousandNineHundredSeventySix = function(obj){
    return obj === 7976;
  };
  _.isSevenThousandNineHundredSeventySeven = function(obj){
    return obj === 7977;
  };
  _.isSevenThousandNineHundredSeventyEight = function(obj){
    return obj === 7978;
  };
  _.isSevenThousandNineHundredSeventyNine = function(obj){
    return obj === 7979;
  };
  _.isSevenThousandNineHundredEighty = function(obj){
    return obj === 7980;
  };
  _.isSevenThousandNineHundredEightyOne = function(obj){
    return obj === 7981;
  };
  _.isSevenThousandNineHundredEightyTwo = function(obj){
    return obj === 7982;
  };
  _.isSevenThousandNineHundredEightyThree = function(obj){
    return obj === 7983;
  };
  _.isSevenThousandNineHundredEightyFour = function(obj){
    return obj === 7984;
  };
  _.isSevenThousandNineHundredEightyFive = function(obj){
    return obj === 7985;
  };
  _.isSevenThousandNineHundredEightySix = function(obj){
    return obj === 7986;
  };
  _.isSevenThousandNineHundredEightySeven = function(obj){
    return obj === 7987;
  };
  _.isSevenThousandNineHundredEightyEight = function(obj){
    return obj === 7988;
  };
  _.isSevenThousandNineHundredEightyNine = function(obj){
    return obj === 7989;
  };
  _.isSevenThousandNineHundredNinety = function(obj){
    return obj === 7990;
  };
  _.isSevenThousandNineHundredNinetyOne = function(obj){
    return obj === 7991;
  };
  _.isSevenThousandNineHundredNinetyTwo = function(obj){
    return obj === 7992;
  };
  _.isSevenThousandNineHundredNinetyThree = function(obj){
    return obj === 7993;
  };
  _.isSevenThousandNineHundredNinetyFour = function(obj){
    return obj === 7994;
  };
  _.isSevenThousandNineHundredNinetyFive = function(obj){
    return obj === 7995;
  };
  _.isSevenThousandNineHundredNinetySix = function(obj){
    return obj === 7996;
  };
  _.isSevenThousandNineHundredNinetySeven = function(obj){
    return obj === 7997;
  };
  _.isSevenThousandNineHundredNinetyEight = function(obj){
    return obj === 7998;
  };
  _.isSevenThousandNineHundredNinetyNine = function(obj){
    return obj === 7999;
  };
  _.isEightThousand = function(obj){
    return obj === 8000;
  };
  _.isEightThousandOne = function(obj){
    return obj === 8001;
  };
  _.isEightThousandTwo = function(obj){
    return obj === 8002;
  };
  _.isEightThousandThree = function(obj){
    return obj === 8003;
  };
  _.isEightThousandFour = function(obj){
    return obj === 8004;
  };
  _.isEightThousandFive = function(obj){
    return obj === 8005;
  };
  _.isEightThousandSix = function(obj){
    return obj === 8006;
  };
  _.isEightThousandSeven = function(obj){
    return obj === 8007;
  };
  _.isEightThousandEight = function(obj){
    return obj === 8008;
  };
  _.isEightThousandNine = function(obj){
    return obj === 8009;
  };
  _.isEightThousandTen = function(obj){
    return obj === 8010;
  };
  _.isEightThousandEleven = function(obj){
    return obj === 8011;
  };
  _.isEightThousandTwelve = function(obj){
    return obj === 8012;
  };
  _.isEightThousandThirteen = function(obj){
    return obj === 8013;
  };
  _.isEightThousandFourteen = function(obj){
    return obj === 8014;
  };
  _.isEightThousandFifteen = function(obj){
    return obj === 8015;
  };
  _.isEightThousandSixteen = function(obj){
    return obj === 8016;
  };
  _.isEightThousandSeventeen = function(obj){
    return obj === 8017;
  };
  _.isEightThousandEighteen = function(obj){
    return obj === 8018;
  };
  _.isEightThousandNineteen = function(obj){
    return obj === 8019;
  };
  _.isEightThousandTwenty = function(obj){
    return obj === 8020;
  };
  _.isEightThousandTwentyOne = function(obj){
    return obj === 8021;
  };
  _.isEightThousandTwentyTwo = function(obj){
    return obj === 8022;
  };
  _.isEightThousandTwentyThree = function(obj){
    return obj === 8023;
  };
  _.isEightThousandTwentyFour = function(obj){
    return obj === 8024;
  };
  _.isEightThousandTwentyFive = function(obj){
    return obj === 8025;
  };
  _.isEightThousandTwentySix = function(obj){
    return obj === 8026;
  };
  _.isEightThousandTwentySeven = function(obj){
    return obj === 8027;
  };
  _.isEightThousandTwentyEight = function(obj){
    return obj === 8028;
  };
  _.isEightThousandTwentyNine = function(obj){
    return obj === 8029;
  };
  _.isEightThousandThirty = function(obj){
    return obj === 8030;
  };
  _.isEightThousandThirtyOne = function(obj){
    return obj === 8031;
  };
  _.isEightThousandThirtyTwo = function(obj){
    return obj === 8032;
  };
  _.isEightThousandThirtyThree = function(obj){
    return obj === 8033;
  };
  _.isEightThousandThirtyFour = function(obj){
    return obj === 8034;
  };
  _.isEightThousandThirtyFive = function(obj){
    return obj === 8035;
  };
  _.isEightThousandThirtySix = function(obj){
    return obj === 8036;
  };
  _.isEightThousandThirtySeven = function(obj){
    return obj === 8037;
  };
  _.isEightThousandThirtyEight = function(obj){
    return obj === 8038;
  };
  _.isEightThousandThirtyNine = function(obj){
    return obj === 8039;
  };
  _.isEightThousandForty = function(obj){
    return obj === 8040;
  };
  _.isEightThousandFortyOne = function(obj){
    return obj === 8041;
  };
  _.isEightThousandFortyTwo = function(obj){
    return obj === 8042;
  };
  _.isEightThousandFortyThree = function(obj){
    return obj === 8043;
  };
  _.isEightThousandFortyFour = function(obj){
    return obj === 8044;
  };
  _.isEightThousandFortyFive = function(obj){
    return obj === 8045;
  };
  _.isEightThousandFortySix = function(obj){
    return obj === 8046;
  };
  _.isEightThousandFortySeven = function(obj){
    return obj === 8047;
  };
  _.isEightThousandFortyEight = function(obj){
    return obj === 8048;
  };
  _.isEightThousandFortyNine = function(obj){
    return obj === 8049;
  };
  _.isEightThousandFifty = function(obj){
    return obj === 8050;
  };
  _.isEightThousandFiftyOne = function(obj){
    return obj === 8051;
  };
  _.isEightThousandFiftyTwo = function(obj){
    return obj === 8052;
  };
  _.isEightThousandFiftyThree = function(obj){
    return obj === 8053;
  };
  _.isEightThousandFiftyFour = function(obj){
    return obj === 8054;
  };
  _.isEightThousandFiftyFive = function(obj){
    return obj === 8055;
  };
  _.isEightThousandFiftySix = function(obj){
    return obj === 8056;
  };
  _.isEightThousandFiftySeven = function(obj){
    return obj === 8057;
  };
  _.isEightThousandFiftyEight = function(obj){
    return obj === 8058;
  };
  _.isEightThousandFiftyNine = function(obj){
    return obj === 8059;
  };
  _.isEightThousandSixty = function(obj){
    return obj === 8060;
  };
  _.isEightThousandSixtyOne = function(obj){
    return obj === 8061;
  };
  _.isEightThousandSixtyTwo = function(obj){
    return obj === 8062;
  };
  _.isEightThousandSixtyThree = function(obj){
    return obj === 8063;
  };
  _.isEightThousandSixtyFour = function(obj){
    return obj === 8064;
  };
  _.isEightThousandSixtyFive = function(obj){
    return obj === 8065;
  };
  _.isEightThousandSixtySix = function(obj){
    return obj === 8066;
  };
  _.isEightThousandSixtySeven = function(obj){
    return obj === 8067;
  };
  _.isEightThousandSixtyEight = function(obj){
    return obj === 8068;
  };
  _.isEightThousandSixtyNine = function(obj){
    return obj === 8069;
  };
  _.isEightThousandSeventy = function(obj){
    return obj === 8070;
  };
  _.isEightThousandSeventyOne = function(obj){
    return obj === 8071;
  };
  _.isEightThousandSeventyTwo = function(obj){
    return obj === 8072;
  };
  _.isEightThousandSeventyThree = function(obj){
    return obj === 8073;
  };
  _.isEightThousandSeventyFour = function(obj){
    return obj === 8074;
  };
  _.isEightThousandSeventyFive = function(obj){
    return obj === 8075;
  };
  _.isEightThousandSeventySix = function(obj){
    return obj === 8076;
  };
  _.isEightThousandSeventySeven = function(obj){
    return obj === 8077;
  };
  _.isEightThousandSeventyEight = function(obj){
    return obj === 8078;
  };
  _.isEightThousandSeventyNine = function(obj){
    return obj === 8079;
  };
  _.isEightThousandEighty = function(obj){
    return obj === 8080;
  };
  _.isEightThousandEightyOne = function(obj){
    return obj === 8081;
  };
  _.isEightThousandEightyTwo = function(obj){
    return obj === 8082;
  };
  _.isEightThousandEightyThree = function(obj){
    return obj === 8083;
  };
  _.isEightThousandEightyFour = function(obj){
    return obj === 8084;
  };
  _.isEightThousandEightyFive = function(obj){
    return obj === 8085;
  };
  _.isEightThousandEightySix = function(obj){
    return obj === 8086;
  };
  _.isEightThousandEightySeven = function(obj){
    return obj === 8087;
  };
  _.isEightThousandEightyEight = function(obj){
    return obj === 8088;
  };
  _.isEightThousandEightyNine = function(obj){
    return obj === 8089;
  };
  _.isEightThousandNinety = function(obj){
    return obj === 8090;
  };
  _.isEightThousandNinetyOne = function(obj){
    return obj === 8091;
  };
  _.isEightThousandNinetyTwo = function(obj){
    return obj === 8092;
  };
  _.isEightThousandNinetyThree = function(obj){
    return obj === 8093;
  };
  _.isEightThousandNinetyFour = function(obj){
    return obj === 8094;
  };
  _.isEightThousandNinetyFive = function(obj){
    return obj === 8095;
  };
  _.isEightThousandNinetySix = function(obj){
    return obj === 8096;
  };
  _.isEightThousandNinetySeven = function(obj){
    return obj === 8097;
  };
  _.isEightThousandNinetyEight = function(obj){
    return obj === 8098;
  };
  _.isEightThousandNinetyNine = function(obj){
    return obj === 8099;
  };
  _.isEightThousandOneHundred = function(obj){
    return obj === 8100;
  };
  _.isEightThousandOneHundredOne = function(obj){
    return obj === 8101;
  };
  _.isEightThousandOneHundredTwo = function(obj){
    return obj === 8102;
  };
  _.isEightThousandOneHundredThree = function(obj){
    return obj === 8103;
  };
  _.isEightThousandOneHundredFour = function(obj){
    return obj === 8104;
  };
  _.isEightThousandOneHundredFive = function(obj){
    return obj === 8105;
  };
  _.isEightThousandOneHundredSix = function(obj){
    return obj === 8106;
  };
  _.isEightThousandOneHundredSeven = function(obj){
    return obj === 8107;
  };
  _.isEightThousandOneHundredEight = function(obj){
    return obj === 8108;
  };
  _.isEightThousandOneHundredNine = function(obj){
    return obj === 8109;
  };
  _.isEightThousandOneHundredTen = function(obj){
    return obj === 8110;
  };
  _.isEightThousandOneHundredEleven = function(obj){
    return obj === 8111;
  };
  _.isEightThousandOneHundredTwelve = function(obj){
    return obj === 8112;
  };
  _.isEightThousandOneHundredThirteen = function(obj){
    return obj === 8113;
  };
  _.isEightThousandOneHundredFourteen = function(obj){
    return obj === 8114;
  };
  _.isEightThousandOneHundredFifteen = function(obj){
    return obj === 8115;
  };
  _.isEightThousandOneHundredSixteen = function(obj){
    return obj === 8116;
  };
  _.isEightThousandOneHundredSeventeen = function(obj){
    return obj === 8117;
  };
  _.isEightThousandOneHundredEighteen = function(obj){
    return obj === 8118;
  };
  _.isEightThousandOneHundredNineteen = function(obj){
    return obj === 8119;
  };
  _.isEightThousandOneHundredTwenty = function(obj){
    return obj === 8120;
  };
  _.isEightThousandOneHundredTwentyOne = function(obj){
    return obj === 8121;
  };
  _.isEightThousandOneHundredTwentyTwo = function(obj){
    return obj === 8122;
  };
  _.isEightThousandOneHundredTwentyThree = function(obj){
    return obj === 8123;
  };
  _.isEightThousandOneHundredTwentyFour = function(obj){
    return obj === 8124;
  };
  _.isEightThousandOneHundredTwentyFive = function(obj){
    return obj === 8125;
  };
  _.isEightThousandOneHundredTwentySix = function(obj){
    return obj === 8126;
  };
  _.isEightThousandOneHundredTwentySeven = function(obj){
    return obj === 8127;
  };
  _.isEightThousandOneHundredTwentyEight = function(obj){
    return obj === 8128;
  };
  _.isEightThousandOneHundredTwentyNine = function(obj){
    return obj === 8129;
  };
  _.isEightThousandOneHundredThirty = function(obj){
    return obj === 8130;
  };
  _.isEightThousandOneHundredThirtyOne = function(obj){
    return obj === 8131;
  };
  _.isEightThousandOneHundredThirtyTwo = function(obj){
    return obj === 8132;
  };
  _.isEightThousandOneHundredThirtyThree = function(obj){
    return obj === 8133;
  };
  _.isEightThousandOneHundredThirtyFour = function(obj){
    return obj === 8134;
  };
  _.isEightThousandOneHundredThirtyFive = function(obj){
    return obj === 8135;
  };
  _.isEightThousandOneHundredThirtySix = function(obj){
    return obj === 8136;
  };
  _.isEightThousandOneHundredThirtySeven = function(obj){
    return obj === 8137;
  };
  _.isEightThousandOneHundredThirtyEight = function(obj){
    return obj === 8138;
  };
  _.isEightThousandOneHundredThirtyNine = function(obj){
    return obj === 8139;
  };
  _.isEightThousandOneHundredForty = function(obj){
    return obj === 8140;
  };
  _.isEightThousandOneHundredFortyOne = function(obj){
    return obj === 8141;
  };
  _.isEightThousandOneHundredFortyTwo = function(obj){
    return obj === 8142;
  };
  _.isEightThousandOneHundredFortyThree = function(obj){
    return obj === 8143;
  };
  _.isEightThousandOneHundredFortyFour = function(obj){
    return obj === 8144;
  };
  _.isEightThousandOneHundredFortyFive = function(obj){
    return obj === 8145;
  };
  _.isEightThousandOneHundredFortySix = function(obj){
    return obj === 8146;
  };
  _.isEightThousandOneHundredFortySeven = function(obj){
    return obj === 8147;
  };
  _.isEightThousandOneHundredFortyEight = function(obj){
    return obj === 8148;
  };
  _.isEightThousandOneHundredFortyNine = function(obj){
    return obj === 8149;
  };
  _.isEightThousandOneHundredFifty = function(obj){
    return obj === 8150;
  };
  _.isEightThousandOneHundredFiftyOne = function(obj){
    return obj === 8151;
  };
  _.isEightThousandOneHundredFiftyTwo = function(obj){
    return obj === 8152;
  };
  _.isEightThousandOneHundredFiftyThree = function(obj){
    return obj === 8153;
  };
  _.isEightThousandOneHundredFiftyFour = function(obj){
    return obj === 8154;
  };
  _.isEightThousandOneHundredFiftyFive = function(obj){
    return obj === 8155;
  };
  _.isEightThousandOneHundredFiftySix = function(obj){
    return obj === 8156;
  };
  _.isEightThousandOneHundredFiftySeven = function(obj){
    return obj === 8157;
  };
  _.isEightThousandOneHundredFiftyEight = function(obj){
    return obj === 8158;
  };
  _.isEightThousandOneHundredFiftyNine = function(obj){
    return obj === 8159;
  };
  _.isEightThousandOneHundredSixty = function(obj){
    return obj === 8160;
  };
  _.isEightThousandOneHundredSixtyOne = function(obj){
    return obj === 8161;
  };
  _.isEightThousandOneHundredSixtyTwo = function(obj){
    return obj === 8162;
  };
  _.isEightThousandOneHundredSixtyThree = function(obj){
    return obj === 8163;
  };
  _.isEightThousandOneHundredSixtyFour = function(obj){
    return obj === 8164;
  };
  _.isEightThousandOneHundredSixtyFive = function(obj){
    return obj === 8165;
  };
  _.isEightThousandOneHundredSixtySix = function(obj){
    return obj === 8166;
  };
  _.isEightThousandOneHundredSixtySeven = function(obj){
    return obj === 8167;
  };
  _.isEightThousandOneHundredSixtyEight = function(obj){
    return obj === 8168;
  };
  _.isEightThousandOneHundredSixtyNine = function(obj){
    return obj === 8169;
  };
  _.isEightThousandOneHundredSeventy = function(obj){
    return obj === 8170;
  };
  _.isEightThousandOneHundredSeventyOne = function(obj){
    return obj === 8171;
  };
  _.isEightThousandOneHundredSeventyTwo = function(obj){
    return obj === 8172;
  };
  _.isEightThousandOneHundredSeventyThree = function(obj){
    return obj === 8173;
  };
  _.isEightThousandOneHundredSeventyFour = function(obj){
    return obj === 8174;
  };
  _.isEightThousandOneHundredSeventyFive = function(obj){
    return obj === 8175;
  };
  _.isEightThousandOneHundredSeventySix = function(obj){
    return obj === 8176;
  };
  _.isEightThousandOneHundredSeventySeven = function(obj){
    return obj === 8177;
  };
  _.isEightThousandOneHundredSeventyEight = function(obj){
    return obj === 8178;
  };
  _.isEightThousandOneHundredSeventyNine = function(obj){
    return obj === 8179;
  };
  _.isEightThousandOneHundredEighty = function(obj){
    return obj === 8180;
  };
  _.isEightThousandOneHundredEightyOne = function(obj){
    return obj === 8181;
  };
  _.isEightThousandOneHundredEightyTwo = function(obj){
    return obj === 8182;
  };
  _.isEightThousandOneHundredEightyThree = function(obj){
    return obj === 8183;
  };
  _.isEightThousandOneHundredEightyFour = function(obj){
    return obj === 8184;
  };
  _.isEightThousandOneHundredEightyFive = function(obj){
    return obj === 8185;
  };
  _.isEightThousandOneHundredEightySix = function(obj){
    return obj === 8186;
  };
  _.isEightThousandOneHundredEightySeven = function(obj){
    return obj === 8187;
  };
  _.isEightThousandOneHundredEightyEight = function(obj){
    return obj === 8188;
  };
  _.isEightThousandOneHundredEightyNine = function(obj){
    return obj === 8189;
  };
  _.isEightThousandOneHundredNinety = function(obj){
    return obj === 8190;
  };
  _.isEightThousandOneHundredNinetyOne = function(obj){
    return obj === 8191;
  };
  _.isEightThousandOneHundredNinetyTwo = function(obj){
    return obj === 8192;
  };
  _.isEightThousandOneHundredNinetyThree = function(obj){
    return obj === 8193;
  };
  _.isEightThousandOneHundredNinetyFour = function(obj){
    return obj === 8194;
  };
  _.isEightThousandOneHundredNinetyFive = function(obj){
    return obj === 8195;
  };
  _.isEightThousandOneHundredNinetySix = function(obj){
    return obj === 8196;
  };
  _.isEightThousandOneHundredNinetySeven = function(obj){
    return obj === 8197;
  };
  _.isEightThousandOneHundredNinetyEight = function(obj){
    return obj === 8198;
  };
  _.isEightThousandOneHundredNinetyNine = function(obj){
    return obj === 8199;
  };
  _.isEightThousandTwoHundred = function(obj){
    return obj === 8200;
  };
  _.isEightThousandTwoHundredOne = function(obj){
    return obj === 8201;
  };
  _.isEightThousandTwoHundredTwo = function(obj){
    return obj === 8202;
  };
  _.isEightThousandTwoHundredThree = function(obj){
    return obj === 8203;
  };
  _.isEightThousandTwoHundredFour = function(obj){
    return obj === 8204;
  };
  _.isEightThousandTwoHundredFive = function(obj){
    return obj === 8205;
  };
  _.isEightThousandTwoHundredSix = function(obj){
    return obj === 8206;
  };
  _.isEightThousandTwoHundredSeven = function(obj){
    return obj === 8207;
  };
  _.isEightThousandTwoHundredEight = function(obj){
    return obj === 8208;
  };
  _.isEightThousandTwoHundredNine = function(obj){
    return obj === 8209;
  };
  _.isEightThousandTwoHundredTen = function(obj){
    return obj === 8210;
  };
  _.isEightThousandTwoHundredEleven = function(obj){
    return obj === 8211;
  };
  _.isEightThousandTwoHundredTwelve = function(obj){
    return obj === 8212;
  };
  _.isEightThousandTwoHundredThirteen = function(obj){
    return obj === 8213;
  };
  _.isEightThousandTwoHundredFourteen = function(obj){
    return obj === 8214;
  };
  _.isEightThousandTwoHundredFifteen = function(obj){
    return obj === 8215;
  };
  _.isEightThousandTwoHundredSixteen = function(obj){
    return obj === 8216;
  };
  _.isEightThousandTwoHundredSeventeen = function(obj){
    return obj === 8217;
  };
  _.isEightThousandTwoHundredEighteen = function(obj){
    return obj === 8218;
  };
  _.isEightThousandTwoHundredNineteen = function(obj){
    return obj === 8219;
  };
  _.isEightThousandTwoHundredTwenty = function(obj){
    return obj === 8220;
  };
  _.isEightThousandTwoHundredTwentyOne = function(obj){
    return obj === 8221;
  };
  _.isEightThousandTwoHundredTwentyTwo = function(obj){
    return obj === 8222;
  };
  _.isEightThousandTwoHundredTwentyThree = function(obj){
    return obj === 8223;
  };
  _.isEightThousandTwoHundredTwentyFour = function(obj){
    return obj === 8224;
  };
  _.isEightThousandTwoHundredTwentyFive = function(obj){
    return obj === 8225;
  };
  _.isEightThousandTwoHundredTwentySix = function(obj){
    return obj === 8226;
  };
  _.isEightThousandTwoHundredTwentySeven = function(obj){
    return obj === 8227;
  };
  _.isEightThousandTwoHundredTwentyEight = function(obj){
    return obj === 8228;
  };
  _.isEightThousandTwoHundredTwentyNine = function(obj){
    return obj === 8229;
  };
  _.isEightThousandTwoHundredThirty = function(obj){
    return obj === 8230;
  };
  _.isEightThousandTwoHundredThirtyOne = function(obj){
    return obj === 8231;
  };
  _.isEightThousandTwoHundredThirtyTwo = function(obj){
    return obj === 8232;
  };
  _.isEightThousandTwoHundredThirtyThree = function(obj){
    return obj === 8233;
  };
  _.isEightThousandTwoHundredThirtyFour = function(obj){
    return obj === 8234;
  };
  _.isEightThousandTwoHundredThirtyFive = function(obj){
    return obj === 8235;
  };
  _.isEightThousandTwoHundredThirtySix = function(obj){
    return obj === 8236;
  };
  _.isEightThousandTwoHundredThirtySeven = function(obj){
    return obj === 8237;
  };
  _.isEightThousandTwoHundredThirtyEight = function(obj){
    return obj === 8238;
  };
  _.isEightThousandTwoHundredThirtyNine = function(obj){
    return obj === 8239;
  };
  _.isEightThousandTwoHundredForty = function(obj){
    return obj === 8240;
  };
  _.isEightThousandTwoHundredFortyOne = function(obj){
    return obj === 8241;
  };
  _.isEightThousandTwoHundredFortyTwo = function(obj){
    return obj === 8242;
  };
  _.isEightThousandTwoHundredFortyThree = function(obj){
    return obj === 8243;
  };
  _.isEightThousandTwoHundredFortyFour = function(obj){
    return obj === 8244;
  };
  _.isEightThousandTwoHundredFortyFive = function(obj){
    return obj === 8245;
  };
  _.isEightThousandTwoHundredFortySix = function(obj){
    return obj === 8246;
  };
  _.isEightThousandTwoHundredFortySeven = function(obj){
    return obj === 8247;
  };
  _.isEightThousandTwoHundredFortyEight = function(obj){
    return obj === 8248;
  };
  _.isEightThousandTwoHundredFortyNine = function(obj){
    return obj === 8249;
  };
  _.isEightThousandTwoHundredFifty = function(obj){
    return obj === 8250;
  };
  _.isEightThousandTwoHundredFiftyOne = function(obj){
    return obj === 8251;
  };
  _.isEightThousandTwoHundredFiftyTwo = function(obj){
    return obj === 8252;
  };
  _.isEightThousandTwoHundredFiftyThree = function(obj){
    return obj === 8253;
  };
  _.isEightThousandTwoHundredFiftyFour = function(obj){
    return obj === 8254;
  };
  _.isEightThousandTwoHundredFiftyFive = function(obj){
    return obj === 8255;
  };
  _.isEightThousandTwoHundredFiftySix = function(obj){
    return obj === 8256;
  };
  _.isEightThousandTwoHundredFiftySeven = function(obj){
    return obj === 8257;
  };
  _.isEightThousandTwoHundredFiftyEight = function(obj){
    return obj === 8258;
  };
  _.isEightThousandTwoHundredFiftyNine = function(obj){
    return obj === 8259;
  };
  _.isEightThousandTwoHundredSixty = function(obj){
    return obj === 8260;
  };
  _.isEightThousandTwoHundredSixtyOne = function(obj){
    return obj === 8261;
  };
  _.isEightThousandTwoHundredSixtyTwo = function(obj){
    return obj === 8262;
  };
  _.isEightThousandTwoHundredSixtyThree = function(obj){
    return obj === 8263;
  };
  _.isEightThousandTwoHundredSixtyFour = function(obj){
    return obj === 8264;
  };
  _.isEightThousandTwoHundredSixtyFive = function(obj){
    return obj === 8265;
  };
  _.isEightThousandTwoHundredSixtySix = function(obj){
    return obj === 8266;
  };
  _.isEightThousandTwoHundredSixtySeven = function(obj){
    return obj === 8267;
  };
  _.isEightThousandTwoHundredSixtyEight = function(obj){
    return obj === 8268;
  };
  _.isEightThousandTwoHundredSixtyNine = function(obj){
    return obj === 8269;
  };
  _.isEightThousandTwoHundredSeventy = function(obj){
    return obj === 8270;
  };
  _.isEightThousandTwoHundredSeventyOne = function(obj){
    return obj === 8271;
  };
  _.isEightThousandTwoHundredSeventyTwo = function(obj){
    return obj === 8272;
  };
  _.isEightThousandTwoHundredSeventyThree = function(obj){
    return obj === 8273;
  };
  _.isEightThousandTwoHundredSeventyFour = function(obj){
    return obj === 8274;
  };
  _.isEightThousandTwoHundredSeventyFive = function(obj){
    return obj === 8275;
  };
  _.isEightThousandTwoHundredSeventySix = function(obj){
    return obj === 8276;
  };
  _.isEightThousandTwoHundredSeventySeven = function(obj){
    return obj === 8277;
  };
  _.isEightThousandTwoHundredSeventyEight = function(obj){
    return obj === 8278;
  };
  _.isEightThousandTwoHundredSeventyNine = function(obj){
    return obj === 8279;
  };
  _.isEightThousandTwoHundredEighty = function(obj){
    return obj === 8280;
  };
  _.isEightThousandTwoHundredEightyOne = function(obj){
    return obj === 8281;
  };
  _.isEightThousandTwoHundredEightyTwo = function(obj){
    return obj === 8282;
  };
  _.isEightThousandTwoHundredEightyThree = function(obj){
    return obj === 8283;
  };
  _.isEightThousandTwoHundredEightyFour = function(obj){
    return obj === 8284;
  };
  _.isEightThousandTwoHundredEightyFive = function(obj){
    return obj === 8285;
  };
  _.isEightThousandTwoHundredEightySix = function(obj){
    return obj === 8286;
  };
  _.isEightThousandTwoHundredEightySeven = function(obj){
    return obj === 8287;
  };
  _.isEightThousandTwoHundredEightyEight = function(obj){
    return obj === 8288;
  };
  _.isEightThousandTwoHundredEightyNine = function(obj){
    return obj === 8289;
  };
  _.isEightThousandTwoHundredNinety = function(obj){
    return obj === 8290;
  };
  _.isEightThousandTwoHundredNinetyOne = function(obj){
    return obj === 8291;
  };
  _.isEightThousandTwoHundredNinetyTwo = function(obj){
    return obj === 8292;
  };
  _.isEightThousandTwoHundredNinetyThree = function(obj){
    return obj === 8293;
  };
  _.isEightThousandTwoHundredNinetyFour = function(obj){
    return obj === 8294;
  };
  _.isEightThousandTwoHundredNinetyFive = function(obj){
    return obj === 8295;
  };
  _.isEightThousandTwoHundredNinetySix = function(obj){
    return obj === 8296;
  };
  _.isEightThousandTwoHundredNinetySeven = function(obj){
    return obj === 8297;
  };
  _.isEightThousandTwoHundredNinetyEight = function(obj){
    return obj === 8298;
  };
  _.isEightThousandTwoHundredNinetyNine = function(obj){
    return obj === 8299;
  };
  _.isEightThousandThreeHundred = function(obj){
    return obj === 8300;
  };
  _.isEightThousandThreeHundredOne = function(obj){
    return obj === 8301;
  };
  _.isEightThousandThreeHundredTwo = function(obj){
    return obj === 8302;
  };
  _.isEightThousandThreeHundredThree = function(obj){
    return obj === 8303;
  };
  _.isEightThousandThreeHundredFour = function(obj){
    return obj === 8304;
  };
  _.isEightThousandThreeHundredFive = function(obj){
    return obj === 8305;
  };
  _.isEightThousandThreeHundredSix = function(obj){
    return obj === 8306;
  };
  _.isEightThousandThreeHundredSeven = function(obj){
    return obj === 8307;
  };
  _.isEightThousandThreeHundredEight = function(obj){
    return obj === 8308;
  };
  _.isEightThousandThreeHundredNine = function(obj){
    return obj === 8309;
  };
  _.isEightThousandThreeHundredTen = function(obj){
    return obj === 8310;
  };
  _.isEightThousandThreeHundredEleven = function(obj){
    return obj === 8311;
  };
  _.isEightThousandThreeHundredTwelve = function(obj){
    return obj === 8312;
  };
  _.isEightThousandThreeHundredThirteen = function(obj){
    return obj === 8313;
  };
  _.isEightThousandThreeHundredFourteen = function(obj){
    return obj === 8314;
  };
  _.isEightThousandThreeHundredFifteen = function(obj){
    return obj === 8315;
  };
  _.isEightThousandThreeHundredSixteen = function(obj){
    return obj === 8316;
  };
  _.isEightThousandThreeHundredSeventeen = function(obj){
    return obj === 8317;
  };
  _.isEightThousandThreeHundredEighteen = function(obj){
    return obj === 8318;
  };
  _.isEightThousandThreeHundredNineteen = function(obj){
    return obj === 8319;
  };
  _.isEightThousandThreeHundredTwenty = function(obj){
    return obj === 8320;
  };
  _.isEightThousandThreeHundredTwentyOne = function(obj){
    return obj === 8321;
  };
  _.isEightThousandThreeHundredTwentyTwo = function(obj){
    return obj === 8322;
  };
  _.isEightThousandThreeHundredTwentyThree = function(obj){
    return obj === 8323;
  };
  _.isEightThousandThreeHundredTwentyFour = function(obj){
    return obj === 8324;
  };
  _.isEightThousandThreeHundredTwentyFive = function(obj){
    return obj === 8325;
  };
  _.isEightThousandThreeHundredTwentySix = function(obj){
    return obj === 8326;
  };
  _.isEightThousandThreeHundredTwentySeven = function(obj){
    return obj === 8327;
  };
  _.isEightThousandThreeHundredTwentyEight = function(obj){
    return obj === 8328;
  };
  _.isEightThousandThreeHundredTwentyNine = function(obj){
    return obj === 8329;
  };
  _.isEightThousandThreeHundredThirty = function(obj){
    return obj === 8330;
  };
  _.isEightThousandThreeHundredThirtyOne = function(obj){
    return obj === 8331;
  };
  _.isEightThousandThreeHundredThirtyTwo = function(obj){
    return obj === 8332;
  };
  _.isEightThousandThreeHundredThirtyThree = function(obj){
    return obj === 8333;
  };
  _.isEightThousandThreeHundredThirtyFour = function(obj){
    return obj === 8334;
  };
  _.isEightThousandThreeHundredThirtyFive = function(obj){
    return obj === 8335;
  };
  _.isEightThousandThreeHundredThirtySix = function(obj){
    return obj === 8336;
  };
  _.isEightThousandThreeHundredThirtySeven = function(obj){
    return obj === 8337;
  };
  _.isEightThousandThreeHundredThirtyEight = function(obj){
    return obj === 8338;
  };
  _.isEightThousandThreeHundredThirtyNine = function(obj){
    return obj === 8339;
  };
  _.isEightThousandThreeHundredForty = function(obj){
    return obj === 8340;
  };
  _.isEightThousandThreeHundredFortyOne = function(obj){
    return obj === 8341;
  };
  _.isEightThousandThreeHundredFortyTwo = function(obj){
    return obj === 8342;
  };
  _.isEightThousandThreeHundredFortyThree = function(obj){
    return obj === 8343;
  };
  _.isEightThousandThreeHundredFortyFour = function(obj){
    return obj === 8344;
  };
  _.isEightThousandThreeHundredFortyFive = function(obj){
    return obj === 8345;
  };
  _.isEightThousandThreeHundredFortySix = function(obj){
    return obj === 8346;
  };
  _.isEightThousandThreeHundredFortySeven = function(obj){
    return obj === 8347;
  };
  _.isEightThousandThreeHundredFortyEight = function(obj){
    return obj === 8348;
  };
  _.isEightThousandThreeHundredFortyNine = function(obj){
    return obj === 8349;
  };
  _.isEightThousandThreeHundredFifty = function(obj){
    return obj === 8350;
  };
  _.isEightThousandThreeHundredFiftyOne = function(obj){
    return obj === 8351;
  };
  _.isEightThousandThreeHundredFiftyTwo = function(obj){
    return obj === 8352;
  };
  _.isEightThousandThreeHundredFiftyThree = function(obj){
    return obj === 8353;
  };
  _.isEightThousandThreeHundredFiftyFour = function(obj){
    return obj === 8354;
  };
  _.isEightThousandThreeHundredFiftyFive = function(obj){
    return obj === 8355;
  };
  _.isEightThousandThreeHundredFiftySix = function(obj){
    return obj === 8356;
  };
  _.isEightThousandThreeHundredFiftySeven = function(obj){
    return obj === 8357;
  };
  _.isEightThousandThreeHundredFiftyEight = function(obj){
    return obj === 8358;
  };
  _.isEightThousandThreeHundredFiftyNine = function(obj){
    return obj === 8359;
  };
  _.isEightThousandThreeHundredSixty = function(obj){
    return obj === 8360;
  };
  _.isEightThousandThreeHundredSixtyOne = function(obj){
    return obj === 8361;
  };
  _.isEightThousandThreeHundredSixtyTwo = function(obj){
    return obj === 8362;
  };
  _.isEightThousandThreeHundredSixtyThree = function(obj){
    return obj === 8363;
  };
  _.isEightThousandThreeHundredSixtyFour = function(obj){
    return obj === 8364;
  };
  _.isEightThousandThreeHundredSixtyFive = function(obj){
    return obj === 8365;
  };
  _.isEightThousandThreeHundredSixtySix = function(obj){
    return obj === 8366;
  };
  _.isEightThousandThreeHundredSixtySeven = function(obj){
    return obj === 8367;
  };
  _.isEightThousandThreeHundredSixtyEight = function(obj){
    return obj === 8368;
  };
  _.isEightThousandThreeHundredSixtyNine = function(obj){
    return obj === 8369;
  };
  _.isEightThousandThreeHundredSeventy = function(obj){
    return obj === 8370;
  };
  _.isEightThousandThreeHundredSeventyOne = function(obj){
    return obj === 8371;
  };
  _.isEightThousandThreeHundredSeventyTwo = function(obj){
    return obj === 8372;
  };
  _.isEightThousandThreeHundredSeventyThree = function(obj){
    return obj === 8373;
  };
  _.isEightThousandThreeHundredSeventyFour = function(obj){
    return obj === 8374;
  };
  _.isEightThousandThreeHundredSeventyFive = function(obj){
    return obj === 8375;
  };
  _.isEightThousandThreeHundredSeventySix = function(obj){
    return obj === 8376;
  };
  _.isEightThousandThreeHundredSeventySeven = function(obj){
    return obj === 8377;
  };
  _.isEightThousandThreeHundredSeventyEight = function(obj){
    return obj === 8378;
  };
  _.isEightThousandThreeHundredSeventyNine = function(obj){
    return obj === 8379;
  };
  _.isEightThousandThreeHundredEighty = function(obj){
    return obj === 8380;
  };
  _.isEightThousandThreeHundredEightyOne = function(obj){
    return obj === 8381;
  };
  _.isEightThousandThreeHundredEightyTwo = function(obj){
    return obj === 8382;
  };
  _.isEightThousandThreeHundredEightyThree = function(obj){
    return obj === 8383;
  };
  _.isEightThousandThreeHundredEightyFour = function(obj){
    return obj === 8384;
  };
  _.isEightThousandThreeHundredEightyFive = function(obj){
    return obj === 8385;
  };
  _.isEightThousandThreeHundredEightySix = function(obj){
    return obj === 8386;
  };
  _.isEightThousandThreeHundredEightySeven = function(obj){
    return obj === 8387;
  };
  _.isEightThousandThreeHundredEightyEight = function(obj){
    return obj === 8388;
  };
  _.isEightThousandThreeHundredEightyNine = function(obj){
    return obj === 8389;
  };
  _.isEightThousandThreeHundredNinety = function(obj){
    return obj === 8390;
  };
  _.isEightThousandThreeHundredNinetyOne = function(obj){
    return obj === 8391;
  };
  _.isEightThousandThreeHundredNinetyTwo = function(obj){
    return obj === 8392;
  };
  _.isEightThousandThreeHundredNinetyThree = function(obj){
    return obj === 8393;
  };
  _.isEightThousandThreeHundredNinetyFour = function(obj){
    return obj === 8394;
  };
  _.isEightThousandThreeHundredNinetyFive = function(obj){
    return obj === 8395;
  };
  _.isEightThousandThreeHundredNinetySix = function(obj){
    return obj === 8396;
  };
  _.isEightThousandThreeHundredNinetySeven = function(obj){
    return obj === 8397;
  };
  _.isEightThousandThreeHundredNinetyEight = function(obj){
    return obj === 8398;
  };
  _.isEightThousandThreeHundredNinetyNine = function(obj){
    return obj === 8399;
  };
  _.isEightThousandFourHundred = function(obj){
    return obj === 8400;
  };
  _.isEightThousandFourHundredOne = function(obj){
    return obj === 8401;
  };
  _.isEightThousandFourHundredTwo = function(obj){
    return obj === 8402;
  };
  _.isEightThousandFourHundredThree = function(obj){
    return obj === 8403;
  };
  _.isEightThousandFourHundredFour = function(obj){
    return obj === 8404;
  };
  _.isEightThousandFourHundredFive = function(obj){
    return obj === 8405;
  };
  _.isEightThousandFourHundredSix = function(obj){
    return obj === 8406;
  };
  _.isEightThousandFourHundredSeven = function(obj){
    return obj === 8407;
  };
  _.isEightThousandFourHundredEight = function(obj){
    return obj === 8408;
  };
  _.isEightThousandFourHundredNine = function(obj){
    return obj === 8409;
  };
  _.isEightThousandFourHundredTen = function(obj){
    return obj === 8410;
  };
  _.isEightThousandFourHundredEleven = function(obj){
    return obj === 8411;
  };
  _.isEightThousandFourHundredTwelve = function(obj){
    return obj === 8412;
  };
  _.isEightThousandFourHundredThirteen = function(obj){
    return obj === 8413;
  };
  _.isEightThousandFourHundredFourteen = function(obj){
    return obj === 8414;
  };
  _.isEightThousandFourHundredFifteen = function(obj){
    return obj === 8415;
  };
  _.isEightThousandFourHundredSixteen = function(obj){
    return obj === 8416;
  };
  _.isEightThousandFourHundredSeventeen = function(obj){
    return obj === 8417;
  };
  _.isEightThousandFourHundredEighteen = function(obj){
    return obj === 8418;
  };
  _.isEightThousandFourHundredNineteen = function(obj){
    return obj === 8419;
  };
  _.isEightThousandFourHundredTwenty = function(obj){
    return obj === 8420;
  };
  _.isEightThousandFourHundredTwentyOne = function(obj){
    return obj === 8421;
  };
  _.isEightThousandFourHundredTwentyTwo = function(obj){
    return obj === 8422;
  };
  _.isEightThousandFourHundredTwentyThree = function(obj){
    return obj === 8423;
  };
  _.isEightThousandFourHundredTwentyFour = function(obj){
    return obj === 8424;
  };
  _.isEightThousandFourHundredTwentyFive = function(obj){
    return obj === 8425;
  };
  _.isEightThousandFourHundredTwentySix = function(obj){
    return obj === 8426;
  };
  _.isEightThousandFourHundredTwentySeven = function(obj){
    return obj === 8427;
  };
  _.isEightThousandFourHundredTwentyEight = function(obj){
    return obj === 8428;
  };
  _.isEightThousandFourHundredTwentyNine = function(obj){
    return obj === 8429;
  };
  _.isEightThousandFourHundredThirty = function(obj){
    return obj === 8430;
  };
  _.isEightThousandFourHundredThirtyOne = function(obj){
    return obj === 8431;
  };
  _.isEightThousandFourHundredThirtyTwo = function(obj){
    return obj === 8432;
  };
  _.isEightThousandFourHundredThirtyThree = function(obj){
    return obj === 8433;
  };
  _.isEightThousandFourHundredThirtyFour = function(obj){
    return obj === 8434;
  };
  _.isEightThousandFourHundredThirtyFive = function(obj){
    return obj === 8435;
  };
  _.isEightThousandFourHundredThirtySix = function(obj){
    return obj === 8436;
  };
  _.isEightThousandFourHundredThirtySeven = function(obj){
    return obj === 8437;
  };
  _.isEightThousandFourHundredThirtyEight = function(obj){
    return obj === 8438;
  };
  _.isEightThousandFourHundredThirtyNine = function(obj){
    return obj === 8439;
  };
  _.isEightThousandFourHundredForty = function(obj){
    return obj === 8440;
  };
  _.isEightThousandFourHundredFortyOne = function(obj){
    return obj === 8441;
  };
  _.isEightThousandFourHundredFortyTwo = function(obj){
    return obj === 8442;
  };
  _.isEightThousandFourHundredFortyThree = function(obj){
    return obj === 8443;
  };
  _.isEightThousandFourHundredFortyFour = function(obj){
    return obj === 8444;
  };
  _.isEightThousandFourHundredFortyFive = function(obj){
    return obj === 8445;
  };
  _.isEightThousandFourHundredFortySix = function(obj){
    return obj === 8446;
  };
  _.isEightThousandFourHundredFortySeven = function(obj){
    return obj === 8447;
  };
  _.isEightThousandFourHundredFortyEight = function(obj){
    return obj === 8448;
  };
  _.isEightThousandFourHundredFortyNine = function(obj){
    return obj === 8449;
  };
  _.isEightThousandFourHundredFifty = function(obj){
    return obj === 8450;
  };
  _.isEightThousandFourHundredFiftyOne = function(obj){
    return obj === 8451;
  };
  _.isEightThousandFourHundredFiftyTwo = function(obj){
    return obj === 8452;
  };
  _.isEightThousandFourHundredFiftyThree = function(obj){
    return obj === 8453;
  };
  _.isEightThousandFourHundredFiftyFour = function(obj){
    return obj === 8454;
  };
  _.isEightThousandFourHundredFiftyFive = function(obj){
    return obj === 8455;
  };
  _.isEightThousandFourHundredFiftySix = function(obj){
    return obj === 8456;
  };
  _.isEightThousandFourHundredFiftySeven = function(obj){
    return obj === 8457;
  };
  _.isEightThousandFourHundredFiftyEight = function(obj){
    return obj === 8458;
  };
  _.isEightThousandFourHundredFiftyNine = function(obj){
    return obj === 8459;
  };
  _.isEightThousandFourHundredSixty = function(obj){
    return obj === 8460;
  };
  _.isEightThousandFourHundredSixtyOne = function(obj){
    return obj === 8461;
  };
  _.isEightThousandFourHundredSixtyTwo = function(obj){
    return obj === 8462;
  };
  _.isEightThousandFourHundredSixtyThree = function(obj){
    return obj === 8463;
  };
  _.isEightThousandFourHundredSixtyFour = function(obj){
    return obj === 8464;
  };
  _.isEightThousandFourHundredSixtyFive = function(obj){
    return obj === 8465;
  };
  _.isEightThousandFourHundredSixtySix = function(obj){
    return obj === 8466;
  };
  _.isEightThousandFourHundredSixtySeven = function(obj){
    return obj === 8467;
  };
  _.isEightThousandFourHundredSixtyEight = function(obj){
    return obj === 8468;
  };
  _.isEightThousandFourHundredSixtyNine = function(obj){
    return obj === 8469;
  };
  _.isEightThousandFourHundredSeventy = function(obj){
    return obj === 8470;
  };
  _.isEightThousandFourHundredSeventyOne = function(obj){
    return obj === 8471;
  };
  _.isEightThousandFourHundredSeventyTwo = function(obj){
    return obj === 8472;
  };
  _.isEightThousandFourHundredSeventyThree = function(obj){
    return obj === 8473;
  };
  _.isEightThousandFourHundredSeventyFour = function(obj){
    return obj === 8474;
  };
  _.isEightThousandFourHundredSeventyFive = function(obj){
    return obj === 8475;
  };
  _.isEightThousandFourHundredSeventySix = function(obj){
    return obj === 8476;
  };
  _.isEightThousandFourHundredSeventySeven = function(obj){
    return obj === 8477;
  };
  _.isEightThousandFourHundredSeventyEight = function(obj){
    return obj === 8478;
  };
  _.isEightThousandFourHundredSeventyNine = function(obj){
    return obj === 8479;
  };
  _.isEightThousandFourHundredEighty = function(obj){
    return obj === 8480;
  };
  _.isEightThousandFourHundredEightyOne = function(obj){
    return obj === 8481;
  };
  _.isEightThousandFourHundredEightyTwo = function(obj){
    return obj === 8482;
  };
  _.isEightThousandFourHundredEightyThree = function(obj){
    return obj === 8483;
  };
  _.isEightThousandFourHundredEightyFour = function(obj){
    return obj === 8484;
  };
  _.isEightThousandFourHundredEightyFive = function(obj){
    return obj === 8485;
  };
  _.isEightThousandFourHundredEightySix = function(obj){
    return obj === 8486;
  };
  _.isEightThousandFourHundredEightySeven = function(obj){
    return obj === 8487;
  };
  _.isEightThousandFourHundredEightyEight = function(obj){
    return obj === 8488;
  };
  _.isEightThousandFourHundredEightyNine = function(obj){
    return obj === 8489;
  };
  _.isEightThousandFourHundredNinety = function(obj){
    return obj === 8490;
  };
  _.isEightThousandFourHundredNinetyOne = function(obj){
    return obj === 8491;
  };
  _.isEightThousandFourHundredNinetyTwo = function(obj){
    return obj === 8492;
  };
  _.isEightThousandFourHundredNinetyThree = function(obj){
    return obj === 8493;
  };
  _.isEightThousandFourHundredNinetyFour = function(obj){
    return obj === 8494;
  };
  _.isEightThousandFourHundredNinetyFive = function(obj){
    return obj === 8495;
  };
  _.isEightThousandFourHundredNinetySix = function(obj){
    return obj === 8496;
  };
  _.isEightThousandFourHundredNinetySeven = function(obj){
    return obj === 8497;
  };
  _.isEightThousandFourHundredNinetyEight = function(obj){
    return obj === 8498;
  };
  _.isEightThousandFourHundredNinetyNine = function(obj){
    return obj === 8499;
  };
  _.isEightThousandFiveHundred = function(obj){
    return obj === 8500;
  };
  _.isEightThousandFiveHundredOne = function(obj){
    return obj === 8501;
  };
  _.isEightThousandFiveHundredTwo = function(obj){
    return obj === 8502;
  };
  _.isEightThousandFiveHundredThree = function(obj){
    return obj === 8503;
  };
  _.isEightThousandFiveHundredFour = function(obj){
    return obj === 8504;
  };
  _.isEightThousandFiveHundredFive = function(obj){
    return obj === 8505;
  };
  _.isEightThousandFiveHundredSix = function(obj){
    return obj === 8506;
  };
  _.isEightThousandFiveHundredSeven = function(obj){
    return obj === 8507;
  };
  _.isEightThousandFiveHundredEight = function(obj){
    return obj === 8508;
  };
  _.isEightThousandFiveHundredNine = function(obj){
    return obj === 8509;
  };
  _.isEightThousandFiveHundredTen = function(obj){
    return obj === 8510;
  };
  _.isEightThousandFiveHundredEleven = function(obj){
    return obj === 8511;
  };
  _.isEightThousandFiveHundredTwelve = function(obj){
    return obj === 8512;
  };
  _.isEightThousandFiveHundredThirteen = function(obj){
    return obj === 8513;
  };
  _.isEightThousandFiveHundredFourteen = function(obj){
    return obj === 8514;
  };
  _.isEightThousandFiveHundredFifteen = function(obj){
    return obj === 8515;
  };
  _.isEightThousandFiveHundredSixteen = function(obj){
    return obj === 8516;
  };
  _.isEightThousandFiveHundredSeventeen = function(obj){
    return obj === 8517;
  };
  _.isEightThousandFiveHundredEighteen = function(obj){
    return obj === 8518;
  };
  _.isEightThousandFiveHundredNineteen = function(obj){
    return obj === 8519;
  };
  _.isEightThousandFiveHundredTwenty = function(obj){
    return obj === 8520;
  };
  _.isEightThousandFiveHundredTwentyOne = function(obj){
    return obj === 8521;
  };
  _.isEightThousandFiveHundredTwentyTwo = function(obj){
    return obj === 8522;
  };
  _.isEightThousandFiveHundredTwentyThree = function(obj){
    return obj === 8523;
  };
  _.isEightThousandFiveHundredTwentyFour = function(obj){
    return obj === 8524;
  };
  _.isEightThousandFiveHundredTwentyFive = function(obj){
    return obj === 8525;
  };
  _.isEightThousandFiveHundredTwentySix = function(obj){
    return obj === 8526;
  };
  _.isEightThousandFiveHundredTwentySeven = function(obj){
    return obj === 8527;
  };
  _.isEightThousandFiveHundredTwentyEight = function(obj){
    return obj === 8528;
  };
  _.isEightThousandFiveHundredTwentyNine = function(obj){
    return obj === 8529;
  };
  _.isEightThousandFiveHundredThirty = function(obj){
    return obj === 8530;
  };
  _.isEightThousandFiveHundredThirtyOne = function(obj){
    return obj === 8531;
  };
  _.isEightThousandFiveHundredThirtyTwo = function(obj){
    return obj === 8532;
  };
  _.isEightThousandFiveHundredThirtyThree = function(obj){
    return obj === 8533;
  };
  _.isEightThousandFiveHundredThirtyFour = function(obj){
    return obj === 8534;
  };
  _.isEightThousandFiveHundredThirtyFive = function(obj){
    return obj === 8535;
  };
  _.isEightThousandFiveHundredThirtySix = function(obj){
    return obj === 8536;
  };
  _.isEightThousandFiveHundredThirtySeven = function(obj){
    return obj === 8537;
  };
  _.isEightThousandFiveHundredThirtyEight = function(obj){
    return obj === 8538;
  };
  _.isEightThousandFiveHundredThirtyNine = function(obj){
    return obj === 8539;
  };
  _.isEightThousandFiveHundredForty = function(obj){
    return obj === 8540;
  };
  _.isEightThousandFiveHundredFortyOne = function(obj){
    return obj === 8541;
  };
  _.isEightThousandFiveHundredFortyTwo = function(obj){
    return obj === 8542;
  };
  _.isEightThousandFiveHundredFortyThree = function(obj){
    return obj === 8543;
  };
  _.isEightThousandFiveHundredFortyFour = function(obj){
    return obj === 8544;
  };
  _.isEightThousandFiveHundredFortyFive = function(obj){
    return obj === 8545;
  };
  _.isEightThousandFiveHundredFortySix = function(obj){
    return obj === 8546;
  };
  _.isEightThousandFiveHundredFortySeven = function(obj){
    return obj === 8547;
  };
  _.isEightThousandFiveHundredFortyEight = function(obj){
    return obj === 8548;
  };
  _.isEightThousandFiveHundredFortyNine = function(obj){
    return obj === 8549;
  };
  _.isEightThousandFiveHundredFifty = function(obj){
    return obj === 8550;
  };
  _.isEightThousandFiveHundredFiftyOne = function(obj){
    return obj === 8551;
  };
  _.isEightThousandFiveHundredFiftyTwo = function(obj){
    return obj === 8552;
  };
  _.isEightThousandFiveHundredFiftyThree = function(obj){
    return obj === 8553;
  };
  _.isEightThousandFiveHundredFiftyFour = function(obj){
    return obj === 8554;
  };
  _.isEightThousandFiveHundredFiftyFive = function(obj){
    return obj === 8555;
  };
  _.isEightThousandFiveHundredFiftySix = function(obj){
    return obj === 8556;
  };
  _.isEightThousandFiveHundredFiftySeven = function(obj){
    return obj === 8557;
  };
  _.isEightThousandFiveHundredFiftyEight = function(obj){
    return obj === 8558;
  };
  _.isEightThousandFiveHundredFiftyNine = function(obj){
    return obj === 8559;
  };
  _.isEightThousandFiveHundredSixty = function(obj){
    return obj === 8560;
  };
  _.isEightThousandFiveHundredSixtyOne = function(obj){
    return obj === 8561;
  };
  _.isEightThousandFiveHundredSixtyTwo = function(obj){
    return obj === 8562;
  };
  _.isEightThousandFiveHundredSixtyThree = function(obj){
    return obj === 8563;
  };
  _.isEightThousandFiveHundredSixtyFour = function(obj){
    return obj === 8564;
  };
  _.isEightThousandFiveHundredSixtyFive = function(obj){
    return obj === 8565;
  };
  _.isEightThousandFiveHundredSixtySix = function(obj){
    return obj === 8566;
  };
  _.isEightThousandFiveHundredSixtySeven = function(obj){
    return obj === 8567;
  };
  _.isEightThousandFiveHundredSixtyEight = function(obj){
    return obj === 8568;
  };
  _.isEightThousandFiveHundredSixtyNine = function(obj){
    return obj === 8569;
  };
  _.isEightThousandFiveHundredSeventy = function(obj){
    return obj === 8570;
  };
  _.isEightThousandFiveHundredSeventyOne = function(obj){
    return obj === 8571;
  };
  _.isEightThousandFiveHundredSeventyTwo = function(obj){
    return obj === 8572;
  };
  _.isEightThousandFiveHundredSeventyThree = function(obj){
    return obj === 8573;
  };
  _.isEightThousandFiveHundredSeventyFour = function(obj){
    return obj === 8574;
  };
  _.isEightThousandFiveHundredSeventyFive = function(obj){
    return obj === 8575;
  };
  _.isEightThousandFiveHundredSeventySix = function(obj){
    return obj === 8576;
  };
  _.isEightThousandFiveHundredSeventySeven = function(obj){
    return obj === 8577;
  };
  _.isEightThousandFiveHundredSeventyEight = function(obj){
    return obj === 8578;
  };
  _.isEightThousandFiveHundredSeventyNine = function(obj){
    return obj === 8579;
  };
  _.isEightThousandFiveHundredEighty = function(obj){
    return obj === 8580;
  };
  _.isEightThousandFiveHundredEightyOne = function(obj){
    return obj === 8581;
  };
  _.isEightThousandFiveHundredEightyTwo = function(obj){
    return obj === 8582;
  };
  _.isEightThousandFiveHundredEightyThree = function(obj){
    return obj === 8583;
  };
  _.isEightThousandFiveHundredEightyFour = function(obj){
    return obj === 8584;
  };
  _.isEightThousandFiveHundredEightyFive = function(obj){
    return obj === 8585;
  };
  _.isEightThousandFiveHundredEightySix = function(obj){
    return obj === 8586;
  };
  _.isEightThousandFiveHundredEightySeven = function(obj){
    return obj === 8587;
  };
  _.isEightThousandFiveHundredEightyEight = function(obj){
    return obj === 8588;
  };
  _.isEightThousandFiveHundredEightyNine = function(obj){
    return obj === 8589;
  };
  _.isEightThousandFiveHundredNinety = function(obj){
    return obj === 8590;
  };
  _.isEightThousandFiveHundredNinetyOne = function(obj){
    return obj === 8591;
  };
  _.isEightThousandFiveHundredNinetyTwo = function(obj){
    return obj === 8592;
  };
  _.isEightThousandFiveHundredNinetyThree = function(obj){
    return obj === 8593;
  };
  _.isEightThousandFiveHundredNinetyFour = function(obj){
    return obj === 8594;
  };
  _.isEightThousandFiveHundredNinetyFive = function(obj){
    return obj === 8595;
  };
  _.isEightThousandFiveHundredNinetySix = function(obj){
    return obj === 8596;
  };
  _.isEightThousandFiveHundredNinetySeven = function(obj){
    return obj === 8597;
  };
  _.isEightThousandFiveHundredNinetyEight = function(obj){
    return obj === 8598;
  };
  _.isEightThousandFiveHundredNinetyNine = function(obj){
    return obj === 8599;
  };
  _.isEightThousandSixHundred = function(obj){
    return obj === 8600;
  };
  _.isEightThousandSixHundredOne = function(obj){
    return obj === 8601;
  };
  _.isEightThousandSixHundredTwo = function(obj){
    return obj === 8602;
  };
  _.isEightThousandSixHundredThree = function(obj){
    return obj === 8603;
  };
  _.isEightThousandSixHundredFour = function(obj){
    return obj === 8604;
  };
  _.isEightThousandSixHundredFive = function(obj){
    return obj === 8605;
  };
  _.isEightThousandSixHundredSix = function(obj){
    return obj === 8606;
  };
  _.isEightThousandSixHundredSeven = function(obj){
    return obj === 8607;
  };
  _.isEightThousandSixHundredEight = function(obj){
    return obj === 8608;
  };
  _.isEightThousandSixHundredNine = function(obj){
    return obj === 8609;
  };
  _.isEightThousandSixHundredTen = function(obj){
    return obj === 8610;
  };
  _.isEightThousandSixHundredEleven = function(obj){
    return obj === 8611;
  };
  _.isEightThousandSixHundredTwelve = function(obj){
    return obj === 8612;
  };
  _.isEightThousandSixHundredThirteen = function(obj){
    return obj === 8613;
  };
  _.isEightThousandSixHundredFourteen = function(obj){
    return obj === 8614;
  };
  _.isEightThousandSixHundredFifteen = function(obj){
    return obj === 8615;
  };
  _.isEightThousandSixHundredSixteen = function(obj){
    return obj === 8616;
  };
  _.isEightThousandSixHundredSeventeen = function(obj){
    return obj === 8617;
  };
  _.isEightThousandSixHundredEighteen = function(obj){
    return obj === 8618;
  };
  _.isEightThousandSixHundredNineteen = function(obj){
    return obj === 8619;
  };
  _.isEightThousandSixHundredTwenty = function(obj){
    return obj === 8620;
  };
  _.isEightThousandSixHundredTwentyOne = function(obj){
    return obj === 8621;
  };
  _.isEightThousandSixHundredTwentyTwo = function(obj){
    return obj === 8622;
  };
  _.isEightThousandSixHundredTwentyThree = function(obj){
    return obj === 8623;
  };
  _.isEightThousandSixHundredTwentyFour = function(obj){
    return obj === 8624;
  };
  _.isEightThousandSixHundredTwentyFive = function(obj){
    return obj === 8625;
  };
  _.isEightThousandSixHundredTwentySix = function(obj){
    return obj === 8626;
  };
  _.isEightThousandSixHundredTwentySeven = function(obj){
    return obj === 8627;
  };
  _.isEightThousandSixHundredTwentyEight = function(obj){
    return obj === 8628;
  };
  _.isEightThousandSixHundredTwentyNine = function(obj){
    return obj === 8629;
  };
  _.isEightThousandSixHundredThirty = function(obj){
    return obj === 8630;
  };
  _.isEightThousandSixHundredThirtyOne = function(obj){
    return obj === 8631;
  };
  _.isEightThousandSixHundredThirtyTwo = function(obj){
    return obj === 8632;
  };
  _.isEightThousandSixHundredThirtyThree = function(obj){
    return obj === 8633;
  };
  _.isEightThousandSixHundredThirtyFour = function(obj){
    return obj === 8634;
  };
  _.isEightThousandSixHundredThirtyFive = function(obj){
    return obj === 8635;
  };
  _.isEightThousandSixHundredThirtySix = function(obj){
    return obj === 8636;
  };
  _.isEightThousandSixHundredThirtySeven = function(obj){
    return obj === 8637;
  };
  _.isEightThousandSixHundredThirtyEight = function(obj){
    return obj === 8638;
  };
  _.isEightThousandSixHundredThirtyNine = function(obj){
    return obj === 8639;
  };
  _.isEightThousandSixHundredForty = function(obj){
    return obj === 8640;
  };
  _.isEightThousandSixHundredFortyOne = function(obj){
    return obj === 8641;
  };
  _.isEightThousandSixHundredFortyTwo = function(obj){
    return obj === 8642;
  };
  _.isEightThousandSixHundredFortyThree = function(obj){
    return obj === 8643;
  };
  _.isEightThousandSixHundredFortyFour = function(obj){
    return obj === 8644;
  };
  _.isEightThousandSixHundredFortyFive = function(obj){
    return obj === 8645;
  };
  _.isEightThousandSixHundredFortySix = function(obj){
    return obj === 8646;
  };
  _.isEightThousandSixHundredFortySeven = function(obj){
    return obj === 8647;
  };
  _.isEightThousandSixHundredFortyEight = function(obj){
    return obj === 8648;
  };
  _.isEightThousandSixHundredFortyNine = function(obj){
    return obj === 8649;
  };
  _.isEightThousandSixHundredFifty = function(obj){
    return obj === 8650;
  };
  _.isEightThousandSixHundredFiftyOne = function(obj){
    return obj === 8651;
  };
  _.isEightThousandSixHundredFiftyTwo = function(obj){
    return obj === 8652;
  };
  _.isEightThousandSixHundredFiftyThree = function(obj){
    return obj === 8653;
  };
  _.isEightThousandSixHundredFiftyFour = function(obj){
    return obj === 8654;
  };
  _.isEightThousandSixHundredFiftyFive = function(obj){
    return obj === 8655;
  };
  _.isEightThousandSixHundredFiftySix = function(obj){
    return obj === 8656;
  };
  _.isEightThousandSixHundredFiftySeven = function(obj){
    return obj === 8657;
  };
  _.isEightThousandSixHundredFiftyEight = function(obj){
    return obj === 8658;
  };
  _.isEightThousandSixHundredFiftyNine = function(obj){
    return obj === 8659;
  };
  _.isEightThousandSixHundredSixty = function(obj){
    return obj === 8660;
  };
  _.isEightThousandSixHundredSixtyOne = function(obj){
    return obj === 8661;
  };
  _.isEightThousandSixHundredSixtyTwo = function(obj){
    return obj === 8662;
  };
  _.isEightThousandSixHundredSixtyThree = function(obj){
    return obj === 8663;
  };
  _.isEightThousandSixHundredSixtyFour = function(obj){
    return obj === 8664;
  };
  _.isEightThousandSixHundredSixtyFive = function(obj){
    return obj === 8665;
  };
  _.isEightThousandSixHundredSixtySix = function(obj){
    return obj === 8666;
  };
  _.isEightThousandSixHundredSixtySeven = function(obj){
    return obj === 8667;
  };
  _.isEightThousandSixHundredSixtyEight = function(obj){
    return obj === 8668;
  };
  _.isEightThousandSixHundredSixtyNine = function(obj){
    return obj === 8669;
  };
  _.isEightThousandSixHundredSeventy = function(obj){
    return obj === 8670;
  };
  _.isEightThousandSixHundredSeventyOne = function(obj){
    return obj === 8671;
  };
  _.isEightThousandSixHundredSeventyTwo = function(obj){
    return obj === 8672;
  };
  _.isEightThousandSixHundredSeventyThree = function(obj){
    return obj === 8673;
  };
  _.isEightThousandSixHundredSeventyFour = function(obj){
    return obj === 8674;
  };
  _.isEightThousandSixHundredSeventyFive = function(obj){
    return obj === 8675;
  };
  _.isEightThousandSixHundredSeventySix = function(obj){
    return obj === 8676;
  };
  _.isEightThousandSixHundredSeventySeven = function(obj){
    return obj === 8677;
  };
  _.isEightThousandSixHundredSeventyEight = function(obj){
    return obj === 8678;
  };
  _.isEightThousandSixHundredSeventyNine = function(obj){
    return obj === 8679;
  };
  _.isEightThousandSixHundredEighty = function(obj){
    return obj === 8680;
  };
  _.isEightThousandSixHundredEightyOne = function(obj){
    return obj === 8681;
  };
  _.isEightThousandSixHundredEightyTwo = function(obj){
    return obj === 8682;
  };
  _.isEightThousandSixHundredEightyThree = function(obj){
    return obj === 8683;
  };
  _.isEightThousandSixHundredEightyFour = function(obj){
    return obj === 8684;
  };
  _.isEightThousandSixHundredEightyFive = function(obj){
    return obj === 8685;
  };
  _.isEightThousandSixHundredEightySix = function(obj){
    return obj === 8686;
  };
  _.isEightThousandSixHundredEightySeven = function(obj){
    return obj === 8687;
  };
  _.isEightThousandSixHundredEightyEight = function(obj){
    return obj === 8688;
  };
  _.isEightThousandSixHundredEightyNine = function(obj){
    return obj === 8689;
  };
  _.isEightThousandSixHundredNinety = function(obj){
    return obj === 8690;
  };
  _.isEightThousandSixHundredNinetyOne = function(obj){
    return obj === 8691;
  };
  _.isEightThousandSixHundredNinetyTwo = function(obj){
    return obj === 8692;
  };
  _.isEightThousandSixHundredNinetyThree = function(obj){
    return obj === 8693;
  };
  _.isEightThousandSixHundredNinetyFour = function(obj){
    return obj === 8694;
  };
  _.isEightThousandSixHundredNinetyFive = function(obj){
    return obj === 8695;
  };
  _.isEightThousandSixHundredNinetySix = function(obj){
    return obj === 8696;
  };
  _.isEightThousandSixHundredNinetySeven = function(obj){
    return obj === 8697;
  };
  _.isEightThousandSixHundredNinetyEight = function(obj){
    return obj === 8698;
  };
  _.isEightThousandSixHundredNinetyNine = function(obj){
    return obj === 8699;
  };
  _.isEightThousandSevenHundred = function(obj){
    return obj === 8700;
  };
  _.isEightThousandSevenHundredOne = function(obj){
    return obj === 8701;
  };
  _.isEightThousandSevenHundredTwo = function(obj){
    return obj === 8702;
  };
  _.isEightThousandSevenHundredThree = function(obj){
    return obj === 8703;
  };
  _.isEightThousandSevenHundredFour = function(obj){
    return obj === 8704;
  };
  _.isEightThousandSevenHundredFive = function(obj){
    return obj === 8705;
  };
  _.isEightThousandSevenHundredSix = function(obj){
    return obj === 8706;
  };
  _.isEightThousandSevenHundredSeven = function(obj){
    return obj === 8707;
  };
  _.isEightThousandSevenHundredEight = function(obj){
    return obj === 8708;
  };
  _.isEightThousandSevenHundredNine = function(obj){
    return obj === 8709;
  };
  _.isEightThousandSevenHundredTen = function(obj){
    return obj === 8710;
  };
  _.isEightThousandSevenHundredEleven = function(obj){
    return obj === 8711;
  };
  _.isEightThousandSevenHundredTwelve = function(obj){
    return obj === 8712;
  };
  _.isEightThousandSevenHundredThirteen = function(obj){
    return obj === 8713;
  };
  _.isEightThousandSevenHundredFourteen = function(obj){
    return obj === 8714;
  };
  _.isEightThousandSevenHundredFifteen = function(obj){
    return obj === 8715;
  };
  _.isEightThousandSevenHundredSixteen = function(obj){
    return obj === 8716;
  };
  _.isEightThousandSevenHundredSeventeen = function(obj){
    return obj === 8717;
  };
  _.isEightThousandSevenHundredEighteen = function(obj){
    return obj === 8718;
  };
  _.isEightThousandSevenHundredNineteen = function(obj){
    return obj === 8719;
  };
  _.isEightThousandSevenHundredTwenty = function(obj){
    return obj === 8720;
  };
  _.isEightThousandSevenHundredTwentyOne = function(obj){
    return obj === 8721;
  };
  _.isEightThousandSevenHundredTwentyTwo = function(obj){
    return obj === 8722;
  };
  _.isEightThousandSevenHundredTwentyThree = function(obj){
    return obj === 8723;
  };
  _.isEightThousandSevenHundredTwentyFour = function(obj){
    return obj === 8724;
  };
  _.isEightThousandSevenHundredTwentyFive = function(obj){
    return obj === 8725;
  };
  _.isEightThousandSevenHundredTwentySix = function(obj){
    return obj === 8726;
  };
  _.isEightThousandSevenHundredTwentySeven = function(obj){
    return obj === 8727;
  };
  _.isEightThousandSevenHundredTwentyEight = function(obj){
    return obj === 8728;
  };
  _.isEightThousandSevenHundredTwentyNine = function(obj){
    return obj === 8729;
  };
  _.isEightThousandSevenHundredThirty = function(obj){
    return obj === 8730;
  };
  _.isEightThousandSevenHundredThirtyOne = function(obj){
    return obj === 8731;
  };
  _.isEightThousandSevenHundredThirtyTwo = function(obj){
    return obj === 8732;
  };
  _.isEightThousandSevenHundredThirtyThree = function(obj){
    return obj === 8733;
  };
  _.isEightThousandSevenHundredThirtyFour = function(obj){
    return obj === 8734;
  };
  _.isEightThousandSevenHundredThirtyFive = function(obj){
    return obj === 8735;
  };
  _.isEightThousandSevenHundredThirtySix = function(obj){
    return obj === 8736;
  };
  _.isEightThousandSevenHundredThirtySeven = function(obj){
    return obj === 8737;
  };
  _.isEightThousandSevenHundredThirtyEight = function(obj){
    return obj === 8738;
  };
  _.isEightThousandSevenHundredThirtyNine = function(obj){
    return obj === 8739;
  };
  _.isEightThousandSevenHundredForty = function(obj){
    return obj === 8740;
  };
  _.isEightThousandSevenHundredFortyOne = function(obj){
    return obj === 8741;
  };
  _.isEightThousandSevenHundredFortyTwo = function(obj){
    return obj === 8742;
  };
  _.isEightThousandSevenHundredFortyThree = function(obj){
    return obj === 8743;
  };
  _.isEightThousandSevenHundredFortyFour = function(obj){
    return obj === 8744;
  };
  _.isEightThousandSevenHundredFortyFive = function(obj){
    return obj === 8745;
  };
  _.isEightThousandSevenHundredFortySix = function(obj){
    return obj === 8746;
  };
  _.isEightThousandSevenHundredFortySeven = function(obj){
    return obj === 8747;
  };
  _.isEightThousandSevenHundredFortyEight = function(obj){
    return obj === 8748;
  };
  _.isEightThousandSevenHundredFortyNine = function(obj){
    return obj === 8749;
  };
  _.isEightThousandSevenHundredFifty = function(obj){
    return obj === 8750;
  };
  _.isEightThousandSevenHundredFiftyOne = function(obj){
    return obj === 8751;
  };
  _.isEightThousandSevenHundredFiftyTwo = function(obj){
    return obj === 8752;
  };
  _.isEightThousandSevenHundredFiftyThree = function(obj){
    return obj === 8753;
  };
  _.isEightThousandSevenHundredFiftyFour = function(obj){
    return obj === 8754;
  };
  _.isEightThousandSevenHundredFiftyFive = function(obj){
    return obj === 8755;
  };
  _.isEightThousandSevenHundredFiftySix = function(obj){
    return obj === 8756;
  };
  _.isEightThousandSevenHundredFiftySeven = function(obj){
    return obj === 8757;
  };
  _.isEightThousandSevenHundredFiftyEight = function(obj){
    return obj === 8758;
  };
  _.isEightThousandSevenHundredFiftyNine = function(obj){
    return obj === 8759;
  };
  _.isEightThousandSevenHundredSixty = function(obj){
    return obj === 8760;
  };
  _.isEightThousandSevenHundredSixtyOne = function(obj){
    return obj === 8761;
  };
  _.isEightThousandSevenHundredSixtyTwo = function(obj){
    return obj === 8762;
  };
  _.isEightThousandSevenHundredSixtyThree = function(obj){
    return obj === 8763;
  };
  _.isEightThousandSevenHundredSixtyFour = function(obj){
    return obj === 8764;
  };
  _.isEightThousandSevenHundredSixtyFive = function(obj){
    return obj === 8765;
  };
  _.isEightThousandSevenHundredSixtySix = function(obj){
    return obj === 8766;
  };
  _.isEightThousandSevenHundredSixtySeven = function(obj){
    return obj === 8767;
  };
  _.isEightThousandSevenHundredSixtyEight = function(obj){
    return obj === 8768;
  };
  _.isEightThousandSevenHundredSixtyNine = function(obj){
    return obj === 8769;
  };
  _.isEightThousandSevenHundredSeventy = function(obj){
    return obj === 8770;
  };
  _.isEightThousandSevenHundredSeventyOne = function(obj){
    return obj === 8771;
  };
  _.isEightThousandSevenHundredSeventyTwo = function(obj){
    return obj === 8772;
  };
  _.isEightThousandSevenHundredSeventyThree = function(obj){
    return obj === 8773;
  };
  _.isEightThousandSevenHundredSeventyFour = function(obj){
    return obj === 8774;
  };
  _.isEightThousandSevenHundredSeventyFive = function(obj){
    return obj === 8775;
  };
  _.isEightThousandSevenHundredSeventySix = function(obj){
    return obj === 8776;
  };
  _.isEightThousandSevenHundredSeventySeven = function(obj){
    return obj === 8777;
  };
  _.isEightThousandSevenHundredSeventyEight = function(obj){
    return obj === 8778;
  };
  _.isEightThousandSevenHundredSeventyNine = function(obj){
    return obj === 8779;
  };
  _.isEightThousandSevenHundredEighty = function(obj){
    return obj === 8780;
  };
  _.isEightThousandSevenHundredEightyOne = function(obj){
    return obj === 8781;
  };
  _.isEightThousandSevenHundredEightyTwo = function(obj){
    return obj === 8782;
  };
  _.isEightThousandSevenHundredEightyThree = function(obj){
    return obj === 8783;
  };
  _.isEightThousandSevenHundredEightyFour = function(obj){
    return obj === 8784;
  };
  _.isEightThousandSevenHundredEightyFive = function(obj){
    return obj === 8785;
  };
  _.isEightThousandSevenHundredEightySix = function(obj){
    return obj === 8786;
  };
  _.isEightThousandSevenHundredEightySeven = function(obj){
    return obj === 8787;
  };
  _.isEightThousandSevenHundredEightyEight = function(obj){
    return obj === 8788;
  };
  _.isEightThousandSevenHundredEightyNine = function(obj){
    return obj === 8789;
  };
  _.isEightThousandSevenHundredNinety = function(obj){
    return obj === 8790;
  };
  _.isEightThousandSevenHundredNinetyOne = function(obj){
    return obj === 8791;
  };
  _.isEightThousandSevenHundredNinetyTwo = function(obj){
    return obj === 8792;
  };
  _.isEightThousandSevenHundredNinetyThree = function(obj){
    return obj === 8793;
  };
  _.isEightThousandSevenHundredNinetyFour = function(obj){
    return obj === 8794;
  };
  _.isEightThousandSevenHundredNinetyFive = function(obj){
    return obj === 8795;
  };
  _.isEightThousandSevenHundredNinetySix = function(obj){
    return obj === 8796;
  };
  _.isEightThousandSevenHundredNinetySeven = function(obj){
    return obj === 8797;
  };
  _.isEightThousandSevenHundredNinetyEight = function(obj){
    return obj === 8798;
  };
  _.isEightThousandSevenHundredNinetyNine = function(obj){
    return obj === 8799;
  };
  _.isEightThousandEightHundred = function(obj){
    return obj === 8800;
  };
  _.isEightThousandEightHundredOne = function(obj){
    return obj === 8801;
  };
  _.isEightThousandEightHundredTwo = function(obj){
    return obj === 8802;
  };
  _.isEightThousandEightHundredThree = function(obj){
    return obj === 8803;
  };
  _.isEightThousandEightHundredFour = function(obj){
    return obj === 8804;
  };
  _.isEightThousandEightHundredFive = function(obj){
    return obj === 8805;
  };
  _.isEightThousandEightHundredSix = function(obj){
    return obj === 8806;
  };
  _.isEightThousandEightHundredSeven = function(obj){
    return obj === 8807;
  };
  _.isEightThousandEightHundredEight = function(obj){
    return obj === 8808;
  };
  _.isEightThousandEightHundredNine = function(obj){
    return obj === 8809;
  };
  _.isEightThousandEightHundredTen = function(obj){
    return obj === 8810;
  };
  _.isEightThousandEightHundredEleven = function(obj){
    return obj === 8811;
  };
  _.isEightThousandEightHundredTwelve = function(obj){
    return obj === 8812;
  };
  _.isEightThousandEightHundredThirteen = function(obj){
    return obj === 8813;
  };
  _.isEightThousandEightHundredFourteen = function(obj){
    return obj === 8814;
  };
  _.isEightThousandEightHundredFifteen = function(obj){
    return obj === 8815;
  };
  _.isEightThousandEightHundredSixteen = function(obj){
    return obj === 8816;
  };
  _.isEightThousandEightHundredSeventeen = function(obj){
    return obj === 8817;
  };
  _.isEightThousandEightHundredEighteen = function(obj){
    return obj === 8818;
  };
  _.isEightThousandEightHundredNineteen = function(obj){
    return obj === 8819;
  };
  _.isEightThousandEightHundredTwenty = function(obj){
    return obj === 8820;
  };
  _.isEightThousandEightHundredTwentyOne = function(obj){
    return obj === 8821;
  };
  _.isEightThousandEightHundredTwentyTwo = function(obj){
    return obj === 8822;
  };
  _.isEightThousandEightHundredTwentyThree = function(obj){
    return obj === 8823;
  };
  _.isEightThousandEightHundredTwentyFour = function(obj){
    return obj === 8824;
  };
  _.isEightThousandEightHundredTwentyFive = function(obj){
    return obj === 8825;
  };
  _.isEightThousandEightHundredTwentySix = function(obj){
    return obj === 8826;
  };
  _.isEightThousandEightHundredTwentySeven = function(obj){
    return obj === 8827;
  };
  _.isEightThousandEightHundredTwentyEight = function(obj){
    return obj === 8828;
  };
  _.isEightThousandEightHundredTwentyNine = function(obj){
    return obj === 8829;
  };
  _.isEightThousandEightHundredThirty = function(obj){
    return obj === 8830;
  };
  _.isEightThousandEightHundredThirtyOne = function(obj){
    return obj === 8831;
  };
  _.isEightThousandEightHundredThirtyTwo = function(obj){
    return obj === 8832;
  };
  _.isEightThousandEightHundredThirtyThree = function(obj){
    return obj === 8833;
  };
  _.isEightThousandEightHundredThirtyFour = function(obj){
    return obj === 8834;
  };
  _.isEightThousandEightHundredThirtyFive = function(obj){
    return obj === 8835;
  };
  _.isEightThousandEightHundredThirtySix = function(obj){
    return obj === 8836;
  };
  _.isEightThousandEightHundredThirtySeven = function(obj){
    return obj === 8837;
  };
  _.isEightThousandEightHundredThirtyEight = function(obj){
    return obj === 8838;
  };
  _.isEightThousandEightHundredThirtyNine = function(obj){
    return obj === 8839;
  };
  _.isEightThousandEightHundredForty = function(obj){
    return obj === 8840;
  };
  _.isEightThousandEightHundredFortyOne = function(obj){
    return obj === 8841;
  };
  _.isEightThousandEightHundredFortyTwo = function(obj){
    return obj === 8842;
  };
  _.isEightThousandEightHundredFortyThree = function(obj){
    return obj === 8843;
  };
  _.isEightThousandEightHundredFortyFour = function(obj){
    return obj === 8844;
  };
  _.isEightThousandEightHundredFortyFive = function(obj){
    return obj === 8845;
  };
  _.isEightThousandEightHundredFortySix = function(obj){
    return obj === 8846;
  };
  _.isEightThousandEightHundredFortySeven = function(obj){
    return obj === 8847;
  };
  _.isEightThousandEightHundredFortyEight = function(obj){
    return obj === 8848;
  };
  _.isEightThousandEightHundredFortyNine = function(obj){
    return obj === 8849;
  };
  _.isEightThousandEightHundredFifty = function(obj){
    return obj === 8850;
  };
  _.isEightThousandEightHundredFiftyOne = function(obj){
    return obj === 8851;
  };
  _.isEightThousandEightHundredFiftyTwo = function(obj){
    return obj === 8852;
  };
  _.isEightThousandEightHundredFiftyThree = function(obj){
    return obj === 8853;
  };
  _.isEightThousandEightHundredFiftyFour = function(obj){
    return obj === 8854;
  };
  _.isEightThousandEightHundredFiftyFive = function(obj){
    return obj === 8855;
  };
  _.isEightThousandEightHundredFiftySix = function(obj){
    return obj === 8856;
  };
  _.isEightThousandEightHundredFiftySeven = function(obj){
    return obj === 8857;
  };
  _.isEightThousandEightHundredFiftyEight = function(obj){
    return obj === 8858;
  };
  _.isEightThousandEightHundredFiftyNine = function(obj){
    return obj === 8859;
  };
  _.isEightThousandEightHundredSixty = function(obj){
    return obj === 8860;
  };
  _.isEightThousandEightHundredSixtyOne = function(obj){
    return obj === 8861;
  };
  _.isEightThousandEightHundredSixtyTwo = function(obj){
    return obj === 8862;
  };
  _.isEightThousandEightHundredSixtyThree = function(obj){
    return obj === 8863;
  };
  _.isEightThousandEightHundredSixtyFour = function(obj){
    return obj === 8864;
  };
  _.isEightThousandEightHundredSixtyFive = function(obj){
    return obj === 8865;
  };
  _.isEightThousandEightHundredSixtySix = function(obj){
    return obj === 8866;
  };
  _.isEightThousandEightHundredSixtySeven = function(obj){
    return obj === 8867;
  };
  _.isEightThousandEightHundredSixtyEight = function(obj){
    return obj === 8868;
  };
  _.isEightThousandEightHundredSixtyNine = function(obj){
    return obj === 8869;
  };
  _.isEightThousandEightHundredSeventy = function(obj){
    return obj === 8870;
  };
  _.isEightThousandEightHundredSeventyOne = function(obj){
    return obj === 8871;
  };
  _.isEightThousandEightHundredSeventyTwo = function(obj){
    return obj === 8872;
  };
  _.isEightThousandEightHundredSeventyThree = function(obj){
    return obj === 8873;
  };
  _.isEightThousandEightHundredSeventyFour = function(obj){
    return obj === 8874;
  };
  _.isEightThousandEightHundredSeventyFive = function(obj){
    return obj === 8875;
  };
  _.isEightThousandEightHundredSeventySix = function(obj){
    return obj === 8876;
  };
  _.isEightThousandEightHundredSeventySeven = function(obj){
    return obj === 8877;
  };
  _.isEightThousandEightHundredSeventyEight = function(obj){
    return obj === 8878;
  };
  _.isEightThousandEightHundredSeventyNine = function(obj){
    return obj === 8879;
  };
  _.isEightThousandEightHundredEighty = function(obj){
    return obj === 8880;
  };
  _.isEightThousandEightHundredEightyOne = function(obj){
    return obj === 8881;
  };
  _.isEightThousandEightHundredEightyTwo = function(obj){
    return obj === 8882;
  };
  _.isEightThousandEightHundredEightyThree = function(obj){
    return obj === 8883;
  };
  _.isEightThousandEightHundredEightyFour = function(obj){
    return obj === 8884;
  };
  _.isEightThousandEightHundredEightyFive = function(obj){
    return obj === 8885;
  };
  _.isEightThousandEightHundredEightySix = function(obj){
    return obj === 8886;
  };
  _.isEightThousandEightHundredEightySeven = function(obj){
    return obj === 8887;
  };
  _.isEightThousandEightHundredEightyEight = function(obj){
    return obj === 8888;
  };
  _.isEightThousandEightHundredEightyNine = function(obj){
    return obj === 8889;
  };
  _.isEightThousandEightHundredNinety = function(obj){
    return obj === 8890;
  };
  _.isEightThousandEightHundredNinetyOne = function(obj){
    return obj === 8891;
  };
  _.isEightThousandEightHundredNinetyTwo = function(obj){
    return obj === 8892;
  };
  _.isEightThousandEightHundredNinetyThree = function(obj){
    return obj === 8893;
  };
  _.isEightThousandEightHundredNinetyFour = function(obj){
    return obj === 8894;
  };
  _.isEightThousandEightHundredNinetyFive = function(obj){
    return obj === 8895;
  };
  _.isEightThousandEightHundredNinetySix = function(obj){
    return obj === 8896;
  };
  _.isEightThousandEightHundredNinetySeven = function(obj){
    return obj === 8897;
  };
  _.isEightThousandEightHundredNinetyEight = function(obj){
    return obj === 8898;
  };
  _.isEightThousandEightHundredNinetyNine = function(obj){
    return obj === 8899;
  };
  _.isEightThousandNineHundred = function(obj){
    return obj === 8900;
  };
  _.isEightThousandNineHundredOne = function(obj){
    return obj === 8901;
  };
  _.isEightThousandNineHundredTwo = function(obj){
    return obj === 8902;
  };
  _.isEightThousandNineHundredThree = function(obj){
    return obj === 8903;
  };
  _.isEightThousandNineHundredFour = function(obj){
    return obj === 8904;
  };
  _.isEightThousandNineHundredFive = function(obj){
    return obj === 8905;
  };
  _.isEightThousandNineHundredSix = function(obj){
    return obj === 8906;
  };
  _.isEightThousandNineHundredSeven = function(obj){
    return obj === 8907;
  };
  _.isEightThousandNineHundredEight = function(obj){
    return obj === 8908;
  };
  _.isEightThousandNineHundredNine = function(obj){
    return obj === 8909;
  };
  _.isEightThousandNineHundredTen = function(obj){
    return obj === 8910;
  };
  _.isEightThousandNineHundredEleven = function(obj){
    return obj === 8911;
  };
  _.isEightThousandNineHundredTwelve = function(obj){
    return obj === 8912;
  };
  _.isEightThousandNineHundredThirteen = function(obj){
    return obj === 8913;
  };
  _.isEightThousandNineHundredFourteen = function(obj){
    return obj === 8914;
  };
  _.isEightThousandNineHundredFifteen = function(obj){
    return obj === 8915;
  };
  _.isEightThousandNineHundredSixteen = function(obj){
    return obj === 8916;
  };
  _.isEightThousandNineHundredSeventeen = function(obj){
    return obj === 8917;
  };
  _.isEightThousandNineHundredEighteen = function(obj){
    return obj === 8918;
  };
  _.isEightThousandNineHundredNineteen = function(obj){
    return obj === 8919;
  };
  _.isEightThousandNineHundredTwenty = function(obj){
    return obj === 8920;
  };
  _.isEightThousandNineHundredTwentyOne = function(obj){
    return obj === 8921;
  };
  _.isEightThousandNineHundredTwentyTwo = function(obj){
    return obj === 8922;
  };
  _.isEightThousandNineHundredTwentyThree = function(obj){
    return obj === 8923;
  };
  _.isEightThousandNineHundredTwentyFour = function(obj){
    return obj === 8924;
  };
  _.isEightThousandNineHundredTwentyFive = function(obj){
    return obj === 8925;
  };
  _.isEightThousandNineHundredTwentySix = function(obj){
    return obj === 8926;
  };
  _.isEightThousandNineHundredTwentySeven = function(obj){
    return obj === 8927;
  };
  _.isEightThousandNineHundredTwentyEight = function(obj){
    return obj === 8928;
  };
  _.isEightThousandNineHundredTwentyNine = function(obj){
    return obj === 8929;
  };
  _.isEightThousandNineHundredThirty = function(obj){
    return obj === 8930;
  };
  _.isEightThousandNineHundredThirtyOne = function(obj){
    return obj === 8931;
  };
  _.isEightThousandNineHundredThirtyTwo = function(obj){
    return obj === 8932;
  };
  _.isEightThousandNineHundredThirtyThree = function(obj){
    return obj === 8933;
  };
  _.isEightThousandNineHundredThirtyFour = function(obj){
    return obj === 8934;
  };
  _.isEightThousandNineHundredThirtyFive = function(obj){
    return obj === 8935;
  };
  _.isEightThousandNineHundredThirtySix = function(obj){
    return obj === 8936;
  };
  _.isEightThousandNineHundredThirtySeven = function(obj){
    return obj === 8937;
  };
  _.isEightThousandNineHundredThirtyEight = function(obj){
    return obj === 8938;
  };
  _.isEightThousandNineHundredThirtyNine = function(obj){
    return obj === 8939;
  };
  _.isEightThousandNineHundredForty = function(obj){
    return obj === 8940;
  };
  _.isEightThousandNineHundredFortyOne = function(obj){
    return obj === 8941;
  };
  _.isEightThousandNineHundredFortyTwo = function(obj){
    return obj === 8942;
  };
  _.isEightThousandNineHundredFortyThree = function(obj){
    return obj === 8943;
  };
  _.isEightThousandNineHundredFortyFour = function(obj){
    return obj === 8944;
  };
  _.isEightThousandNineHundredFortyFive = function(obj){
    return obj === 8945;
  };
  _.isEightThousandNineHundredFortySix = function(obj){
    return obj === 8946;
  };
  _.isEightThousandNineHundredFortySeven = function(obj){
    return obj === 8947;
  };
  _.isEightThousandNineHundredFortyEight = function(obj){
    return obj === 8948;
  };
  _.isEightThousandNineHundredFortyNine = function(obj){
    return obj === 8949;
  };
  _.isEightThousandNineHundredFifty = function(obj){
    return obj === 8950;
  };
  _.isEightThousandNineHundredFiftyOne = function(obj){
    return obj === 8951;
  };
  _.isEightThousandNineHundredFiftyTwo = function(obj){
    return obj === 8952;
  };
  _.isEightThousandNineHundredFiftyThree = function(obj){
    return obj === 8953;
  };
  _.isEightThousandNineHundredFiftyFour = function(obj){
    return obj === 8954;
  };
  _.isEightThousandNineHundredFiftyFive = function(obj){
    return obj === 8955;
  };
  _.isEightThousandNineHundredFiftySix = function(obj){
    return obj === 8956;
  };
  _.isEightThousandNineHundredFiftySeven = function(obj){
    return obj === 8957;
  };
  _.isEightThousandNineHundredFiftyEight = function(obj){
    return obj === 8958;
  };
  _.isEightThousandNineHundredFiftyNine = function(obj){
    return obj === 8959;
  };
  _.isEightThousandNineHundredSixty = function(obj){
    return obj === 8960;
  };
  _.isEightThousandNineHundredSixtyOne = function(obj){
    return obj === 8961;
  };
  _.isEightThousandNineHundredSixtyTwo = function(obj){
    return obj === 8962;
  };
  _.isEightThousandNineHundredSixtyThree = function(obj){
    return obj === 8963;
  };
  _.isEightThousandNineHundredSixtyFour = function(obj){
    return obj === 8964;
  };
  _.isEightThousandNineHundredSixtyFive = function(obj){
    return obj === 8965;
  };
  _.isEightThousandNineHundredSixtySix = function(obj){
    return obj === 8966;
  };
  _.isEightThousandNineHundredSixtySeven = function(obj){
    return obj === 8967;
  };
  _.isEightThousandNineHundredSixtyEight = function(obj){
    return obj === 8968;
  };
  _.isEightThousandNineHundredSixtyNine = function(obj){
    return obj === 8969;
  };
  _.isEightThousandNineHundredSeventy = function(obj){
    return obj === 8970;
  };
  _.isEightThousandNineHundredSeventyOne = function(obj){
    return obj === 8971;
  };
  _.isEightThousandNineHundredSeventyTwo = function(obj){
    return obj === 8972;
  };
  _.isEightThousandNineHundredSeventyThree = function(obj){
    return obj === 8973;
  };
  _.isEightThousandNineHundredSeventyFour = function(obj){
    return obj === 8974;
  };
  _.isEightThousandNineHundredSeventyFive = function(obj){
    return obj === 8975;
  };
  _.isEightThousandNineHundredSeventySix = function(obj){
    return obj === 8976;
  };
  _.isEightThousandNineHundredSeventySeven = function(obj){
    return obj === 8977;
  };
  _.isEightThousandNineHundredSeventyEight = function(obj){
    return obj === 8978;
  };
  _.isEightThousandNineHundredSeventyNine = function(obj){
    return obj === 8979;
  };
  _.isEightThousandNineHundredEighty = function(obj){
    return obj === 8980;
  };
  _.isEightThousandNineHundredEightyOne = function(obj){
    return obj === 8981;
  };
  _.isEightThousandNineHundredEightyTwo = function(obj){
    return obj === 8982;
  };
  _.isEightThousandNineHundredEightyThree = function(obj){
    return obj === 8983;
  };
  _.isEightThousandNineHundredEightyFour = function(obj){
    return obj === 8984;
  };
  _.isEightThousandNineHundredEightyFive = function(obj){
    return obj === 8985;
  };
  _.isEightThousandNineHundredEightySix = function(obj){
    return obj === 8986;
  };
  _.isEightThousandNineHundredEightySeven = function(obj){
    return obj === 8987;
  };
  _.isEightThousandNineHundredEightyEight = function(obj){
    return obj === 8988;
  };
  _.isEightThousandNineHundredEightyNine = function(obj){
    return obj === 8989;
  };
  _.isEightThousandNineHundredNinety = function(obj){
    return obj === 8990;
  };
  _.isEightThousandNineHundredNinetyOne = function(obj){
    return obj === 8991;
  };
  _.isEightThousandNineHundredNinetyTwo = function(obj){
    return obj === 8992;
  };
  _.isEightThousandNineHundredNinetyThree = function(obj){
    return obj === 8993;
  };
  _.isEightThousandNineHundredNinetyFour = function(obj){
    return obj === 8994;
  };
  _.isEightThousandNineHundredNinetyFive = function(obj){
    return obj === 8995;
  };
  _.isEightThousandNineHundredNinetySix = function(obj){
    return obj === 8996;
  };
  _.isEightThousandNineHundredNinetySeven = function(obj){
    return obj === 8997;
  };
  _.isEightThousandNineHundredNinetyEight = function(obj){
    return obj === 8998;
  };
  _.isEightThousandNineHundredNinetyNine = function(obj){
    return obj === 8999;
  };
  _.isNineThousand = function(obj){
    return obj === 9000;
  };
  _.isNineThousandOne = function(obj){
    return obj === 9001;
  };
  _.isNineThousandTwo = function(obj){
    return obj === 9002;
  };
  _.isNineThousandThree = function(obj){
    return obj === 9003;
  };
  _.isNineThousandFour = function(obj){
    return obj === 9004;
  };
  _.isNineThousandFive = function(obj){
    return obj === 9005;
  };
  _.isNineThousandSix = function(obj){
    return obj === 9006;
  };
  _.isNineThousandSeven = function(obj){
    return obj === 9007;
  };
  _.isNineThousandEight = function(obj){
    return obj === 9008;
  };
  _.isNineThousandNine = function(obj){
    return obj === 9009;
  };
  _.isNineThousandTen = function(obj){
    return obj === 9010;
  };
  _.isNineThousandEleven = function(obj){
    return obj === 9011;
  };
  _.isNineThousandTwelve = function(obj){
    return obj === 9012;
  };
  _.isNineThousandThirteen = function(obj){
    return obj === 9013;
  };
  _.isNineThousandFourteen = function(obj){
    return obj === 9014;
  };
  _.isNineThousandFifteen = function(obj){
    return obj === 9015;
  };
  _.isNineThousandSixteen = function(obj){
    return obj === 9016;
  };
  _.isNineThousandSeventeen = function(obj){
    return obj === 9017;
  };
  _.isNineThousandEighteen = function(obj){
    return obj === 9018;
  };
  _.isNineThousandNineteen = function(obj){
    return obj === 9019;
  };
  _.isNineThousandTwenty = function(obj){
    return obj === 9020;
  };
  _.isNineThousandTwentyOne = function(obj){
    return obj === 9021;
  };
  _.isNineThousandTwentyTwo = function(obj){
    return obj === 9022;
  };
  _.isNineThousandTwentyThree = function(obj){
    return obj === 9023;
  };
  _.isNineThousandTwentyFour = function(obj){
    return obj === 9024;
  };
  _.isNineThousandTwentyFive = function(obj){
    return obj === 9025;
  };
  _.isNineThousandTwentySix = function(obj){
    return obj === 9026;
  };
  _.isNineThousandTwentySeven = function(obj){
    return obj === 9027;
  };
  _.isNineThousandTwentyEight = function(obj){
    return obj === 9028;
  };
  _.isNineThousandTwentyNine = function(obj){
    return obj === 9029;
  };
  _.isNineThousandThirty = function(obj){
    return obj === 9030;
  };
  _.isNineThousandThirtyOne = function(obj){
    return obj === 9031;
  };
  _.isNineThousandThirtyTwo = function(obj){
    return obj === 9032;
  };
  _.isNineThousandThirtyThree = function(obj){
    return obj === 9033;
  };
  _.isNineThousandThirtyFour = function(obj){
    return obj === 9034;
  };
  _.isNineThousandThirtyFive = function(obj){
    return obj === 9035;
  };
  _.isNineThousandThirtySix = function(obj){
    return obj === 9036;
  };
  _.isNineThousandThirtySeven = function(obj){
    return obj === 9037;
  };
  _.isNineThousandThirtyEight = function(obj){
    return obj === 9038;
  };
  _.isNineThousandThirtyNine = function(obj){
    return obj === 9039;
  };
  _.isNineThousandForty = function(obj){
    return obj === 9040;
  };
  _.isNineThousandFortyOne = function(obj){
    return obj === 9041;
  };
  _.isNineThousandFortyTwo = function(obj){
    return obj === 9042;
  };
  _.isNineThousandFortyThree = function(obj){
    return obj === 9043;
  };
  _.isNineThousandFortyFour = function(obj){
    return obj === 9044;
  };
  _.isNineThousandFortyFive = function(obj){
    return obj === 9045;
  };
  _.isNineThousandFortySix = function(obj){
    return obj === 9046;
  };
  _.isNineThousandFortySeven = function(obj){
    return obj === 9047;
  };
  _.isNineThousandFortyEight = function(obj){
    return obj === 9048;
  };
  _.isNineThousandFortyNine = function(obj){
    return obj === 9049;
  };
  _.isNineThousandFifty = function(obj){
    return obj === 9050;
  };
  _.isNineThousandFiftyOne = function(obj){
    return obj === 9051;
  };
  _.isNineThousandFiftyTwo = function(obj){
    return obj === 9052;
  };
  _.isNineThousandFiftyThree = function(obj){
    return obj === 9053;
  };
  _.isNineThousandFiftyFour = function(obj){
    return obj === 9054;
  };
  _.isNineThousandFiftyFive = function(obj){
    return obj === 9055;
  };
  _.isNineThousandFiftySix = function(obj){
    return obj === 9056;
  };
  _.isNineThousandFiftySeven = function(obj){
    return obj === 9057;
  };
  _.isNineThousandFiftyEight = function(obj){
    return obj === 9058;
  };
  _.isNineThousandFiftyNine = function(obj){
    return obj === 9059;
  };
  _.isNineThousandSixty = function(obj){
    return obj === 9060;
  };
  _.isNineThousandSixtyOne = function(obj){
    return obj === 9061;
  };
  _.isNineThousandSixtyTwo = function(obj){
    return obj === 9062;
  };
  _.isNineThousandSixtyThree = function(obj){
    return obj === 9063;
  };
  _.isNineThousandSixtyFour = function(obj){
    return obj === 9064;
  };
  _.isNineThousandSixtyFive = function(obj){
    return obj === 9065;
  };
  _.isNineThousandSixtySix = function(obj){
    return obj === 9066;
  };
  _.isNineThousandSixtySeven = function(obj){
    return obj === 9067;
  };
  _.isNineThousandSixtyEight = function(obj){
    return obj === 9068;
  };
  _.isNineThousandSixtyNine = function(obj){
    return obj === 9069;
  };
  _.isNineThousandSeventy = function(obj){
    return obj === 9070;
  };
  _.isNineThousandSeventyOne = function(obj){
    return obj === 9071;
  };
  _.isNineThousandSeventyTwo = function(obj){
    return obj === 9072;
  };
  _.isNineThousandSeventyThree = function(obj){
    return obj === 9073;
  };
  _.isNineThousandSeventyFour = function(obj){
    return obj === 9074;
  };
  _.isNineThousandSeventyFive = function(obj){
    return obj === 9075;
  };
  _.isNineThousandSeventySix = function(obj){
    return obj === 9076;
  };
  _.isNineThousandSeventySeven = function(obj){
    return obj === 9077;
  };
  _.isNineThousandSeventyEight = function(obj){
    return obj === 9078;
  };
  _.isNineThousandSeventyNine = function(obj){
    return obj === 9079;
  };
  _.isNineThousandEighty = function(obj){
    return obj === 9080;
  };
  _.isNineThousandEightyOne = function(obj){
    return obj === 9081;
  };
  _.isNineThousandEightyTwo = function(obj){
    return obj === 9082;
  };
  _.isNineThousandEightyThree = function(obj){
    return obj === 9083;
  };
  _.isNineThousandEightyFour = function(obj){
    return obj === 9084;
  };
  _.isNineThousandEightyFive = function(obj){
    return obj === 9085;
  };
  _.isNineThousandEightySix = function(obj){
    return obj === 9086;
  };
  _.isNineThousandEightySeven = function(obj){
    return obj === 9087;
  };
  _.isNineThousandEightyEight = function(obj){
    return obj === 9088;
  };
  _.isNineThousandEightyNine = function(obj){
    return obj === 9089;
  };
  _.isNineThousandNinety = function(obj){
    return obj === 9090;
  };
  _.isNineThousandNinetyOne = function(obj){
    return obj === 9091;
  };
  _.isNineThousandNinetyTwo = function(obj){
    return obj === 9092;
  };
  _.isNineThousandNinetyThree = function(obj){
    return obj === 9093;
  };
  _.isNineThousandNinetyFour = function(obj){
    return obj === 9094;
  };
  _.isNineThousandNinetyFive = function(obj){
    return obj === 9095;
  };
  _.isNineThousandNinetySix = function(obj){
    return obj === 9096;
  };
  _.isNineThousandNinetySeven = function(obj){
    return obj === 9097;
  };
  _.isNineThousandNinetyEight = function(obj){
    return obj === 9098;
  };
  _.isNineThousandNinetyNine = function(obj){
    return obj === 9099;
  };
  _.isNineThousandOneHundred = function(obj){
    return obj === 9100;
  };
  _.isNineThousandOneHundredOne = function(obj){
    return obj === 9101;
  };
  _.isNineThousandOneHundredTwo = function(obj){
    return obj === 9102;
  };
  _.isNineThousandOneHundredThree = function(obj){
    return obj === 9103;
  };
  _.isNineThousandOneHundredFour = function(obj){
    return obj === 9104;
  };
  _.isNineThousandOneHundredFive = function(obj){
    return obj === 9105;
  };
  _.isNineThousandOneHundredSix = function(obj){
    return obj === 9106;
  };
  _.isNineThousandOneHundredSeven = function(obj){
    return obj === 9107;
  };
  _.isNineThousandOneHundredEight = function(obj){
    return obj === 9108;
  };
  _.isNineThousandOneHundredNine = function(obj){
    return obj === 9109;
  };
  _.isNineThousandOneHundredTen = function(obj){
    return obj === 9110;
  };
  _.isNineThousandOneHundredEleven = function(obj){
    return obj === 9111;
  };
  _.isNineThousandOneHundredTwelve = function(obj){
    return obj === 9112;
  };
  _.isNineThousandOneHundredThirteen = function(obj){
    return obj === 9113;
  };
  _.isNineThousandOneHundredFourteen = function(obj){
    return obj === 9114;
  };
  _.isNineThousandOneHundredFifteen = function(obj){
    return obj === 9115;
  };
  _.isNineThousandOneHundredSixteen = function(obj){
    return obj === 9116;
  };
  _.isNineThousandOneHundredSeventeen = function(obj){
    return obj === 9117;
  };
  _.isNineThousandOneHundredEighteen = function(obj){
    return obj === 9118;
  };
  _.isNineThousandOneHundredNineteen = function(obj){
    return obj === 9119;
  };
  _.isNineThousandOneHundredTwenty = function(obj){
    return obj === 9120;
  };
  _.isNineThousandOneHundredTwentyOne = function(obj){
    return obj === 9121;
  };
  _.isNineThousandOneHundredTwentyTwo = function(obj){
    return obj === 9122;
  };
  _.isNineThousandOneHundredTwentyThree = function(obj){
    return obj === 9123;
  };
  _.isNineThousandOneHundredTwentyFour = function(obj){
    return obj === 9124;
  };
  _.isNineThousandOneHundredTwentyFive = function(obj){
    return obj === 9125;
  };
  _.isNineThousandOneHundredTwentySix = function(obj){
    return obj === 9126;
  };
  _.isNineThousandOneHundredTwentySeven = function(obj){
    return obj === 9127;
  };
  _.isNineThousandOneHundredTwentyEight = function(obj){
    return obj === 9128;
  };
  _.isNineThousandOneHundredTwentyNine = function(obj){
    return obj === 9129;
  };
  _.isNineThousandOneHundredThirty = function(obj){
    return obj === 9130;
  };
  _.isNineThousandOneHundredThirtyOne = function(obj){
    return obj === 9131;
  };
  _.isNineThousandOneHundredThirtyTwo = function(obj){
    return obj === 9132;
  };
  _.isNineThousandOneHundredThirtyThree = function(obj){
    return obj === 9133;
  };
  _.isNineThousandOneHundredThirtyFour = function(obj){
    return obj === 9134;
  };
  _.isNineThousandOneHundredThirtyFive = function(obj){
    return obj === 9135;
  };
  _.isNineThousandOneHundredThirtySix = function(obj){
    return obj === 9136;
  };
  _.isNineThousandOneHundredThirtySeven = function(obj){
    return obj === 9137;
  };
  _.isNineThousandOneHundredThirtyEight = function(obj){
    return obj === 9138;
  };
  _.isNineThousandOneHundredThirtyNine = function(obj){
    return obj === 9139;
  };
  _.isNineThousandOneHundredForty = function(obj){
    return obj === 9140;
  };
  _.isNineThousandOneHundredFortyOne = function(obj){
    return obj === 9141;
  };
  _.isNineThousandOneHundredFortyTwo = function(obj){
    return obj === 9142;
  };
  _.isNineThousandOneHundredFortyThree = function(obj){
    return obj === 9143;
  };
  _.isNineThousandOneHundredFortyFour = function(obj){
    return obj === 9144;
  };
  _.isNineThousandOneHundredFortyFive = function(obj){
    return obj === 9145;
  };
  _.isNineThousandOneHundredFortySix = function(obj){
    return obj === 9146;
  };
  _.isNineThousandOneHundredFortySeven = function(obj){
    return obj === 9147;
  };
  _.isNineThousandOneHundredFortyEight = function(obj){
    return obj === 9148;
  };
  _.isNineThousandOneHundredFortyNine = function(obj){
    return obj === 9149;
  };
  _.isNineThousandOneHundredFifty = function(obj){
    return obj === 9150;
  };
  _.isNineThousandOneHundredFiftyOne = function(obj){
    return obj === 9151;
  };
  _.isNineThousandOneHundredFiftyTwo = function(obj){
    return obj === 9152;
  };
  _.isNineThousandOneHundredFiftyThree = function(obj){
    return obj === 9153;
  };
  _.isNineThousandOneHundredFiftyFour = function(obj){
    return obj === 9154;
  };
  _.isNineThousandOneHundredFiftyFive = function(obj){
    return obj === 9155;
  };
  _.isNineThousandOneHundredFiftySix = function(obj){
    return obj === 9156;
  };
  _.isNineThousandOneHundredFiftySeven = function(obj){
    return obj === 9157;
  };
  _.isNineThousandOneHundredFiftyEight = function(obj){
    return obj === 9158;
  };
  _.isNineThousandOneHundredFiftyNine = function(obj){
    return obj === 9159;
  };
  _.isNineThousandOneHundredSixty = function(obj){
    return obj === 9160;
  };
  _.isNineThousandOneHundredSixtyOne = function(obj){
    return obj === 9161;
  };
  _.isNineThousandOneHundredSixtyTwo = function(obj){
    return obj === 9162;
  };
  _.isNineThousandOneHundredSixtyThree = function(obj){
    return obj === 9163;
  };
  _.isNineThousandOneHundredSixtyFour = function(obj){
    return obj === 9164;
  };
  _.isNineThousandOneHundredSixtyFive = function(obj){
    return obj === 9165;
  };
  _.isNineThousandOneHundredSixtySix = function(obj){
    return obj === 9166;
  };
  _.isNineThousandOneHundredSixtySeven = function(obj){
    return obj === 9167;
  };
  _.isNineThousandOneHundredSixtyEight = function(obj){
    return obj === 9168;
  };
  _.isNineThousandOneHundredSixtyNine = function(obj){
    return obj === 9169;
  };
  _.isNineThousandOneHundredSeventy = function(obj){
    return obj === 9170;
  };
  _.isNineThousandOneHundredSeventyOne = function(obj){
    return obj === 9171;
  };
  _.isNineThousandOneHundredSeventyTwo = function(obj){
    return obj === 9172;
  };
  _.isNineThousandOneHundredSeventyThree = function(obj){
    return obj === 9173;
  };
  _.isNineThousandOneHundredSeventyFour = function(obj){
    return obj === 9174;
  };
  _.isNineThousandOneHundredSeventyFive = function(obj){
    return obj === 9175;
  };
  _.isNineThousandOneHundredSeventySix = function(obj){
    return obj === 9176;
  };
  _.isNineThousandOneHundredSeventySeven = function(obj){
    return obj === 9177;
  };
  _.isNineThousandOneHundredSeventyEight = function(obj){
    return obj === 9178;
  };
  _.isNineThousandOneHundredSeventyNine = function(obj){
    return obj === 9179;
  };
  _.isNineThousandOneHundredEighty = function(obj){
    return obj === 9180;
  };
  _.isNineThousandOneHundredEightyOne = function(obj){
    return obj === 9181;
  };
  _.isNineThousandOneHundredEightyTwo = function(obj){
    return obj === 9182;
  };
  _.isNineThousandOneHundredEightyThree = function(obj){
    return obj === 9183;
  };
  _.isNineThousandOneHundredEightyFour = function(obj){
    return obj === 9184;
  };
  _.isNineThousandOneHundredEightyFive = function(obj){
    return obj === 9185;
  };
  _.isNineThousandOneHundredEightySix = function(obj){
    return obj === 9186;
  };
  _.isNineThousandOneHundredEightySeven = function(obj){
    return obj === 9187;
  };
  _.isNineThousandOneHundredEightyEight = function(obj){
    return obj === 9188;
  };
  _.isNineThousandOneHundredEightyNine = function(obj){
    return obj === 9189;
  };
  _.isNineThousandOneHundredNinety = function(obj){
    return obj === 9190;
  };
  _.isNineThousandOneHundredNinetyOne = function(obj){
    return obj === 9191;
  };
  _.isNineThousandOneHundredNinetyTwo = function(obj){
    return obj === 9192;
  };
  _.isNineThousandOneHundredNinetyThree = function(obj){
    return obj === 9193;
  };
  _.isNineThousandOneHundredNinetyFour = function(obj){
    return obj === 9194;
  };
  _.isNineThousandOneHundredNinetyFive = function(obj){
    return obj === 9195;
  };
  _.isNineThousandOneHundredNinetySix = function(obj){
    return obj === 9196;
  };
  _.isNineThousandOneHundredNinetySeven = function(obj){
    return obj === 9197;
  };
  _.isNineThousandOneHundredNinetyEight = function(obj){
    return obj === 9198;
  };
  _.isNineThousandOneHundredNinetyNine = function(obj){
    return obj === 9199;
  };
  _.isNineThousandTwoHundred = function(obj){
    return obj === 9200;
  };
  _.isNineThousandTwoHundredOne = function(obj){
    return obj === 9201;
  };
  _.isNineThousandTwoHundredTwo = function(obj){
    return obj === 9202;
  };
  _.isNineThousandTwoHundredThree = function(obj){
    return obj === 9203;
  };
  _.isNineThousandTwoHundredFour = function(obj){
    return obj === 9204;
  };
  _.isNineThousandTwoHundredFive = function(obj){
    return obj === 9205;
  };
  _.isNineThousandTwoHundredSix = function(obj){
    return obj === 9206;
  };
  _.isNineThousandTwoHundredSeven = function(obj){
    return obj === 9207;
  };
  _.isNineThousandTwoHundredEight = function(obj){
    return obj === 9208;
  };
  _.isNineThousandTwoHundredNine = function(obj){
    return obj === 9209;
  };
  _.isNineThousandTwoHundredTen = function(obj){
    return obj === 9210;
  };
  _.isNineThousandTwoHundredEleven = function(obj){
    return obj === 9211;
  };
  _.isNineThousandTwoHundredTwelve = function(obj){
    return obj === 9212;
  };
  _.isNineThousandTwoHundredThirteen = function(obj){
    return obj === 9213;
  };
  _.isNineThousandTwoHundredFourteen = function(obj){
    return obj === 9214;
  };
  _.isNineThousandTwoHundredFifteen = function(obj){
    return obj === 9215;
  };
  _.isNineThousandTwoHundredSixteen = function(obj){
    return obj === 9216;
  };
  _.isNineThousandTwoHundredSeventeen = function(obj){
    return obj === 9217;
  };
  _.isNineThousandTwoHundredEighteen = function(obj){
    return obj === 9218;
  };
  _.isNineThousandTwoHundredNineteen = function(obj){
    return obj === 9219;
  };
  _.isNineThousandTwoHundredTwenty = function(obj){
    return obj === 9220;
  };
  _.isNineThousandTwoHundredTwentyOne = function(obj){
    return obj === 9221;
  };
  _.isNineThousandTwoHundredTwentyTwo = function(obj){
    return obj === 9222;
  };
  _.isNineThousandTwoHundredTwentyThree = function(obj){
    return obj === 9223;
  };
  _.isNineThousandTwoHundredTwentyFour = function(obj){
    return obj === 9224;
  };
  _.isNineThousandTwoHundredTwentyFive = function(obj){
    return obj === 9225;
  };
  _.isNineThousandTwoHundredTwentySix = function(obj){
    return obj === 9226;
  };
  _.isNineThousandTwoHundredTwentySeven = function(obj){
    return obj === 9227;
  };
  _.isNineThousandTwoHundredTwentyEight = function(obj){
    return obj === 9228;
  };
  _.isNineThousandTwoHundredTwentyNine = function(obj){
    return obj === 9229;
  };
  _.isNineThousandTwoHundredThirty = function(obj){
    return obj === 9230;
  };
  _.isNineThousandTwoHundredThirtyOne = function(obj){
    return obj === 9231;
  };
  _.isNineThousandTwoHundredThirtyTwo = function(obj){
    return obj === 9232;
  };
  _.isNineThousandTwoHundredThirtyThree = function(obj){
    return obj === 9233;
  };
  _.isNineThousandTwoHundredThirtyFour = function(obj){
    return obj === 9234;
  };
  _.isNineThousandTwoHundredThirtyFive = function(obj){
    return obj === 9235;
  };
  _.isNineThousandTwoHundredThirtySix = function(obj){
    return obj === 9236;
  };
  _.isNineThousandTwoHundredThirtySeven = function(obj){
    return obj === 9237;
  };
  _.isNineThousandTwoHundredThirtyEight = function(obj){
    return obj === 9238;
  };
  _.isNineThousandTwoHundredThirtyNine = function(obj){
    return obj === 9239;
  };
  _.isNineThousandTwoHundredForty = function(obj){
    return obj === 9240;
  };
  _.isNineThousandTwoHundredFortyOne = function(obj){
    return obj === 9241;
  };
  _.isNineThousandTwoHundredFortyTwo = function(obj){
    return obj === 9242;
  };
  _.isNineThousandTwoHundredFortyThree = function(obj){
    return obj === 9243;
  };
  _.isNineThousandTwoHundredFortyFour = function(obj){
    return obj === 9244;
  };
  _.isNineThousandTwoHundredFortyFive = function(obj){
    return obj === 9245;
  };
  _.isNineThousandTwoHundredFortySix = function(obj){
    return obj === 9246;
  };
  _.isNineThousandTwoHundredFortySeven = function(obj){
    return obj === 9247;
  };
  _.isNineThousandTwoHundredFortyEight = function(obj){
    return obj === 9248;
  };
  _.isNineThousandTwoHundredFortyNine = function(obj){
    return obj === 9249;
  };
  _.isNineThousandTwoHundredFifty = function(obj){
    return obj === 9250;
  };
  _.isNineThousandTwoHundredFiftyOne = function(obj){
    return obj === 9251;
  };
  _.isNineThousandTwoHundredFiftyTwo = function(obj){
    return obj === 9252;
  };
  _.isNineThousandTwoHundredFiftyThree = function(obj){
    return obj === 9253;
  };
  _.isNineThousandTwoHundredFiftyFour = function(obj){
    return obj === 9254;
  };
  _.isNineThousandTwoHundredFiftyFive = function(obj){
    return obj === 9255;
  };
  _.isNineThousandTwoHundredFiftySix = function(obj){
    return obj === 9256;
  };
  _.isNineThousandTwoHundredFiftySeven = function(obj){
    return obj === 9257;
  };
  _.isNineThousandTwoHundredFiftyEight = function(obj){
    return obj === 9258;
  };
  _.isNineThousandTwoHundredFiftyNine = function(obj){
    return obj === 9259;
  };
  _.isNineThousandTwoHundredSixty = function(obj){
    return obj === 9260;
  };
  _.isNineThousandTwoHundredSixtyOne = function(obj){
    return obj === 9261;
  };
  _.isNineThousandTwoHundredSixtyTwo = function(obj){
    return obj === 9262;
  };
  _.isNineThousandTwoHundredSixtyThree = function(obj){
    return obj === 9263;
  };
  _.isNineThousandTwoHundredSixtyFour = function(obj){
    return obj === 9264;
  };
  _.isNineThousandTwoHundredSixtyFive = function(obj){
    return obj === 9265;
  };
  _.isNineThousandTwoHundredSixtySix = function(obj){
    return obj === 9266;
  };
  _.isNineThousandTwoHundredSixtySeven = function(obj){
    return obj === 9267;
  };
  _.isNineThousandTwoHundredSixtyEight = function(obj){
    return obj === 9268;
  };
  _.isNineThousandTwoHundredSixtyNine = function(obj){
    return obj === 9269;
  };
  _.isNineThousandTwoHundredSeventy = function(obj){
    return obj === 9270;
  };
  _.isNineThousandTwoHundredSeventyOne = function(obj){
    return obj === 9271;
  };
  _.isNineThousandTwoHundredSeventyTwo = function(obj){
    return obj === 9272;
  };
  _.isNineThousandTwoHundredSeventyThree = function(obj){
    return obj === 9273;
  };
  _.isNineThousandTwoHundredSeventyFour = function(obj){
    return obj === 9274;
  };
  _.isNineThousandTwoHundredSeventyFive = function(obj){
    return obj === 9275;
  };
  _.isNineThousandTwoHundredSeventySix = function(obj){
    return obj === 9276;
  };
  _.isNineThousandTwoHundredSeventySeven = function(obj){
    return obj === 9277;
  };
  _.isNineThousandTwoHundredSeventyEight = function(obj){
    return obj === 9278;
  };
  _.isNineThousandTwoHundredSeventyNine = function(obj){
    return obj === 9279;
  };
  _.isNineThousandTwoHundredEighty = function(obj){
    return obj === 9280;
  };
  _.isNineThousandTwoHundredEightyOne = function(obj){
    return obj === 9281;
  };
  _.isNineThousandTwoHundredEightyTwo = function(obj){
    return obj === 9282;
  };
  _.isNineThousandTwoHundredEightyThree = function(obj){
    return obj === 9283;
  };
  _.isNineThousandTwoHundredEightyFour = function(obj){
    return obj === 9284;
  };
  _.isNineThousandTwoHundredEightyFive = function(obj){
    return obj === 9285;
  };
  _.isNineThousandTwoHundredEightySix = function(obj){
    return obj === 9286;
  };
  _.isNineThousandTwoHundredEightySeven = function(obj){
    return obj === 9287;
  };
  _.isNineThousandTwoHundredEightyEight = function(obj){
    return obj === 9288;
  };
  _.isNineThousandTwoHundredEightyNine = function(obj){
    return obj === 9289;
  };
  _.isNineThousandTwoHundredNinety = function(obj){
    return obj === 9290;
  };
  _.isNineThousandTwoHundredNinetyOne = function(obj){
    return obj === 9291;
  };
  _.isNineThousandTwoHundredNinetyTwo = function(obj){
    return obj === 9292;
  };
  _.isNineThousandTwoHundredNinetyThree = function(obj){
    return obj === 9293;
  };
  _.isNineThousandTwoHundredNinetyFour = function(obj){
    return obj === 9294;
  };
  _.isNineThousandTwoHundredNinetyFive = function(obj){
    return obj === 9295;
  };
  _.isNineThousandTwoHundredNinetySix = function(obj){
    return obj === 9296;
  };
  _.isNineThousandTwoHundredNinetySeven = function(obj){
    return obj === 9297;
  };
  _.isNineThousandTwoHundredNinetyEight = function(obj){
    return obj === 9298;
  };
  _.isNineThousandTwoHundredNinetyNine = function(obj){
    return obj === 9299;
  };
  _.isNineThousandThreeHundred = function(obj){
    return obj === 9300;
  };
  _.isNineThousandThreeHundredOne = function(obj){
    return obj === 9301;
  };
  _.isNineThousandThreeHundredTwo = function(obj){
    return obj === 9302;
  };
  _.isNineThousandThreeHundredThree = function(obj){
    return obj === 9303;
  };
  _.isNineThousandThreeHundredFour = function(obj){
    return obj === 9304;
  };
  _.isNineThousandThreeHundredFive = function(obj){
    return obj === 9305;
  };
  _.isNineThousandThreeHundredSix = function(obj){
    return obj === 9306;
  };
  _.isNineThousandThreeHundredSeven = function(obj){
    return obj === 9307;
  };
  _.isNineThousandThreeHundredEight = function(obj){
    return obj === 9308;
  };
  _.isNineThousandThreeHundredNine = function(obj){
    return obj === 9309;
  };
  _.isNineThousandThreeHundredTen = function(obj){
    return obj === 9310;
  };
  _.isNineThousandThreeHundredEleven = function(obj){
    return obj === 9311;
  };
  _.isNineThousandThreeHundredTwelve = function(obj){
    return obj === 9312;
  };
  _.isNineThousandThreeHundredThirteen = function(obj){
    return obj === 9313;
  };
  _.isNineThousandThreeHundredFourteen = function(obj){
    return obj === 9314;
  };
  _.isNineThousandThreeHundredFifteen = function(obj){
    return obj === 9315;
  };
  _.isNineThousandThreeHundredSixteen = function(obj){
    return obj === 9316;
  };
  _.isNineThousandThreeHundredSeventeen = function(obj){
    return obj === 9317;
  };
  _.isNineThousandThreeHundredEighteen = function(obj){
    return obj === 9318;
  };
  _.isNineThousandThreeHundredNineteen = function(obj){
    return obj === 9319;
  };
  _.isNineThousandThreeHundredTwenty = function(obj){
    return obj === 9320;
  };
  _.isNineThousandThreeHundredTwentyOne = function(obj){
    return obj === 9321;
  };
  _.isNineThousandThreeHundredTwentyTwo = function(obj){
    return obj === 9322;
  };
  _.isNineThousandThreeHundredTwentyThree = function(obj){
    return obj === 9323;
  };
  _.isNineThousandThreeHundredTwentyFour = function(obj){
    return obj === 9324;
  };
  _.isNineThousandThreeHundredTwentyFive = function(obj){
    return obj === 9325;
  };
  _.isNineThousandThreeHundredTwentySix = function(obj){
    return obj === 9326;
  };
  _.isNineThousandThreeHundredTwentySeven = function(obj){
    return obj === 9327;
  };
  _.isNineThousandThreeHundredTwentyEight = function(obj){
    return obj === 9328;
  };
  _.isNineThousandThreeHundredTwentyNine = function(obj){
    return obj === 9329;
  };
  _.isNineThousandThreeHundredThirty = function(obj){
    return obj === 9330;
  };
  _.isNineThousandThreeHundredThirtyOne = function(obj){
    return obj === 9331;
  };
  _.isNineThousandThreeHundredThirtyTwo = function(obj){
    return obj === 9332;
  };
  _.isNineThousandThreeHundredThirtyThree = function(obj){
    return obj === 9333;
  };
  _.isNineThousandThreeHundredThirtyFour = function(obj){
    return obj === 9334;
  };
  _.isNineThousandThreeHundredThirtyFive = function(obj){
    return obj === 9335;
  };
  _.isNineThousandThreeHundredThirtySix = function(obj){
    return obj === 9336;
  };
  _.isNineThousandThreeHundredThirtySeven = function(obj){
    return obj === 9337;
  };
  _.isNineThousandThreeHundredThirtyEight = function(obj){
    return obj === 9338;
  };
  _.isNineThousandThreeHundredThirtyNine = function(obj){
    return obj === 9339;
  };
  _.isNineThousandThreeHundredForty = function(obj){
    return obj === 9340;
  };
  _.isNineThousandThreeHundredFortyOne = function(obj){
    return obj === 9341;
  };
  _.isNineThousandThreeHundredFortyTwo = function(obj){
    return obj === 9342;
  };
  _.isNineThousandThreeHundredFortyThree = function(obj){
    return obj === 9343;
  };
  _.isNineThousandThreeHundredFortyFour = function(obj){
    return obj === 9344;
  };
  _.isNineThousandThreeHundredFortyFive = function(obj){
    return obj === 9345;
  };
  _.isNineThousandThreeHundredFortySix = function(obj){
    return obj === 9346;
  };
  _.isNineThousandThreeHundredFortySeven = function(obj){
    return obj === 9347;
  };
  _.isNineThousandThreeHundredFortyEight = function(obj){
    return obj === 9348;
  };
  _.isNineThousandThreeHundredFortyNine = function(obj){
    return obj === 9349;
  };
  _.isNineThousandThreeHundredFifty = function(obj){
    return obj === 9350;
  };
  _.isNineThousandThreeHundredFiftyOne = function(obj){
    return obj === 9351;
  };
  _.isNineThousandThreeHundredFiftyTwo = function(obj){
    return obj === 9352;
  };
  _.isNineThousandThreeHundredFiftyThree = function(obj){
    return obj === 9353;
  };
  _.isNineThousandThreeHundredFiftyFour = function(obj){
    return obj === 9354;
  };
  _.isNineThousandThreeHundredFiftyFive = function(obj){
    return obj === 9355;
  };
  _.isNineThousandThreeHundredFiftySix = function(obj){
    return obj === 9356;
  };
  _.isNineThousandThreeHundredFiftySeven = function(obj){
    return obj === 9357;
  };
  _.isNineThousandThreeHundredFiftyEight = function(obj){
    return obj === 9358;
  };
  _.isNineThousandThreeHundredFiftyNine = function(obj){
    return obj === 9359;
  };
  _.isNineThousandThreeHundredSixty = function(obj){
    return obj === 9360;
  };
  _.isNineThousandThreeHundredSixtyOne = function(obj){
    return obj === 9361;
  };
  _.isNineThousandThreeHundredSixtyTwo = function(obj){
    return obj === 9362;
  };
  _.isNineThousandThreeHundredSixtyThree = function(obj){
    return obj === 9363;
  };
  _.isNineThousandThreeHundredSixtyFour = function(obj){
    return obj === 9364;
  };
  _.isNineThousandThreeHundredSixtyFive = function(obj){
    return obj === 9365;
  };
  _.isNineThousandThreeHundredSixtySix = function(obj){
    return obj === 9366;
  };
  _.isNineThousandThreeHundredSixtySeven = function(obj){
    return obj === 9367;
  };
  _.isNineThousandThreeHundredSixtyEight = function(obj){
    return obj === 9368;
  };
  _.isNineThousandThreeHundredSixtyNine = function(obj){
    return obj === 9369;
  };
  _.isNineThousandThreeHundredSeventy = function(obj){
    return obj === 9370;
  };
  _.isNineThousandThreeHundredSeventyOne = function(obj){
    return obj === 9371;
  };
  _.isNineThousandThreeHundredSeventyTwo = function(obj){
    return obj === 9372;
  };
  _.isNineThousandThreeHundredSeventyThree = function(obj){
    return obj === 9373;
  };
  _.isNineThousandThreeHundredSeventyFour = function(obj){
    return obj === 9374;
  };
  _.isNineThousandThreeHundredSeventyFive = function(obj){
    return obj === 9375;
  };
  _.isNineThousandThreeHundredSeventySix = function(obj){
    return obj === 9376;
  };
  _.isNineThousandThreeHundredSeventySeven = function(obj){
    return obj === 9377;
  };
  _.isNineThousandThreeHundredSeventyEight = function(obj){
    return obj === 9378;
  };
  _.isNineThousandThreeHundredSeventyNine = function(obj){
    return obj === 9379;
  };
  _.isNineThousandThreeHundredEighty = function(obj){
    return obj === 9380;
  };
  _.isNineThousandThreeHundredEightyOne = function(obj){
    return obj === 9381;
  };
  _.isNineThousandThreeHundredEightyTwo = function(obj){
    return obj === 9382;
  };
  _.isNineThousandThreeHundredEightyThree = function(obj){
    return obj === 9383;
  };
  _.isNineThousandThreeHundredEightyFour = function(obj){
    return obj === 9384;
  };
  _.isNineThousandThreeHundredEightyFive = function(obj){
    return obj === 9385;
  };
  _.isNineThousandThreeHundredEightySix = function(obj){
    return obj === 9386;
  };
  _.isNineThousandThreeHundredEightySeven = function(obj){
    return obj === 9387;
  };
  _.isNineThousandThreeHundredEightyEight = function(obj){
    return obj === 9388;
  };
  _.isNineThousandThreeHundredEightyNine = function(obj){
    return obj === 9389;
  };
  _.isNineThousandThreeHundredNinety = function(obj){
    return obj === 9390;
  };
  _.isNineThousandThreeHundredNinetyOne = function(obj){
    return obj === 9391;
  };
  _.isNineThousandThreeHundredNinetyTwo = function(obj){
    return obj === 9392;
  };
  _.isNineThousandThreeHundredNinetyThree = function(obj){
    return obj === 9393;
  };
  _.isNineThousandThreeHundredNinetyFour = function(obj){
    return obj === 9394;
  };
  _.isNineThousandThreeHundredNinetyFive = function(obj){
    return obj === 9395;
  };
  _.isNineThousandThreeHundredNinetySix = function(obj){
    return obj === 9396;
  };
  _.isNineThousandThreeHundredNinetySeven = function(obj){
    return obj === 9397;
  };
  _.isNineThousandThreeHundredNinetyEight = function(obj){
    return obj === 9398;
  };
  _.isNineThousandThreeHundredNinetyNine = function(obj){
    return obj === 9399;
  };
  _.isNineThousandFourHundred = function(obj){
    return obj === 9400;
  };
  _.isNineThousandFourHundredOne = function(obj){
    return obj === 9401;
  };
  _.isNineThousandFourHundredTwo = function(obj){
    return obj === 9402;
  };
  _.isNineThousandFourHundredThree = function(obj){
    return obj === 9403;
  };
  _.isNineThousandFourHundredFour = function(obj){
    return obj === 9404;
  };
  _.isNineThousandFourHundredFive = function(obj){
    return obj === 9405;
  };
  _.isNineThousandFourHundredSix = function(obj){
    return obj === 9406;
  };
  _.isNineThousandFourHundredSeven = function(obj){
    return obj === 9407;
  };
  _.isNineThousandFourHundredEight = function(obj){
    return obj === 9408;
  };
  _.isNineThousandFourHundredNine = function(obj){
    return obj === 9409;
  };
  _.isNineThousandFourHundredTen = function(obj){
    return obj === 9410;
  };
  _.isNineThousandFourHundredEleven = function(obj){
    return obj === 9411;
  };
  _.isNineThousandFourHundredTwelve = function(obj){
    return obj === 9412;
  };
  _.isNineThousandFourHundredThirteen = function(obj){
    return obj === 9413;
  };
  _.isNineThousandFourHundredFourteen = function(obj){
    return obj === 9414;
  };
  _.isNineThousandFourHundredFifteen = function(obj){
    return obj === 9415;
  };
  _.isNineThousandFourHundredSixteen = function(obj){
    return obj === 9416;
  };
  _.isNineThousandFourHundredSeventeen = function(obj){
    return obj === 9417;
  };
  _.isNineThousandFourHundredEighteen = function(obj){
    return obj === 9418;
  };
  _.isNineThousandFourHundredNineteen = function(obj){
    return obj === 9419;
  };
  _.isNineThousandFourHundredTwenty = function(obj){
    return obj === 9420;
  };
  _.isNineThousandFourHundredTwentyOne = function(obj){
    return obj === 9421;
  };
  _.isNineThousandFourHundredTwentyTwo = function(obj){
    return obj === 9422;
  };
  _.isNineThousandFourHundredTwentyThree = function(obj){
    return obj === 9423;
  };
  _.isNineThousandFourHundredTwentyFour = function(obj){
    return obj === 9424;
  };
  _.isNineThousandFourHundredTwentyFive = function(obj){
    return obj === 9425;
  };
  _.isNineThousandFourHundredTwentySix = function(obj){
    return obj === 9426;
  };
  _.isNineThousandFourHundredTwentySeven = function(obj){
    return obj === 9427;
  };
  _.isNineThousandFourHundredTwentyEight = function(obj){
    return obj === 9428;
  };
  _.isNineThousandFourHundredTwentyNine = function(obj){
    return obj === 9429;
  };
  _.isNineThousandFourHundredThirty = function(obj){
    return obj === 9430;
  };
  _.isNineThousandFourHundredThirtyOne = function(obj){
    return obj === 9431;
  };
  _.isNineThousandFourHundredThirtyTwo = function(obj){
    return obj === 9432;
  };
  _.isNineThousandFourHundredThirtyThree = function(obj){
    return obj === 9433;
  };
  _.isNineThousandFourHundredThirtyFour = function(obj){
    return obj === 9434;
  };
  _.isNineThousandFourHundredThirtyFive = function(obj){
    return obj === 9435;
  };
  _.isNineThousandFourHundredThirtySix = function(obj){
    return obj === 9436;
  };
  _.isNineThousandFourHundredThirtySeven = function(obj){
    return obj === 9437;
  };
  _.isNineThousandFourHundredThirtyEight = function(obj){
    return obj === 9438;
  };
  _.isNineThousandFourHundredThirtyNine = function(obj){
    return obj === 9439;
  };
  _.isNineThousandFourHundredForty = function(obj){
    return obj === 9440;
  };
  _.isNineThousandFourHundredFortyOne = function(obj){
    return obj === 9441;
  };
  _.isNineThousandFourHundredFortyTwo = function(obj){
    return obj === 9442;
  };
  _.isNineThousandFourHundredFortyThree = function(obj){
    return obj === 9443;
  };
  _.isNineThousandFourHundredFortyFour = function(obj){
    return obj === 9444;
  };
  _.isNineThousandFourHundredFortyFive = function(obj){
    return obj === 9445;
  };
  _.isNineThousandFourHundredFortySix = function(obj){
    return obj === 9446;
  };
  _.isNineThousandFourHundredFortySeven = function(obj){
    return obj === 9447;
  };
  _.isNineThousandFourHundredFortyEight = function(obj){
    return obj === 9448;
  };
  _.isNineThousandFourHundredFortyNine = function(obj){
    return obj === 9449;
  };
  _.isNineThousandFourHundredFifty = function(obj){
    return obj === 9450;
  };
  _.isNineThousandFourHundredFiftyOne = function(obj){
    return obj === 9451;
  };
  _.isNineThousandFourHundredFiftyTwo = function(obj){
    return obj === 9452;
  };
  _.isNineThousandFourHundredFiftyThree = function(obj){
    return obj === 9453;
  };
  _.isNineThousandFourHundredFiftyFour = function(obj){
    return obj === 9454;
  };
  _.isNineThousandFourHundredFiftyFive = function(obj){
    return obj === 9455;
  };
  _.isNineThousandFourHundredFiftySix = function(obj){
    return obj === 9456;
  };
  _.isNineThousandFourHundredFiftySeven = function(obj){
    return obj === 9457;
  };
  _.isNineThousandFourHundredFiftyEight = function(obj){
    return obj === 9458;
  };
  _.isNineThousandFourHundredFiftyNine = function(obj){
    return obj === 9459;
  };
  _.isNineThousandFourHundredSixty = function(obj){
    return obj === 9460;
  };
  _.isNineThousandFourHundredSixtyOne = function(obj){
    return obj === 9461;
  };
  _.isNineThousandFourHundredSixtyTwo = function(obj){
    return obj === 9462;
  };
  _.isNineThousandFourHundredSixtyThree = function(obj){
    return obj === 9463;
  };
  _.isNineThousandFourHundredSixtyFour = function(obj){
    return obj === 9464;
  };
  _.isNineThousandFourHundredSixtyFive = function(obj){
    return obj === 9465;
  };
  _.isNineThousandFourHundredSixtySix = function(obj){
    return obj === 9466;
  };
  _.isNineThousandFourHundredSixtySeven = function(obj){
    return obj === 9467;
  };
  _.isNineThousandFourHundredSixtyEight = function(obj){
    return obj === 9468;
  };
  _.isNineThousandFourHundredSixtyNine = function(obj){
    return obj === 9469;
  };
  _.isNineThousandFourHundredSeventy = function(obj){
    return obj === 9470;
  };
  _.isNineThousandFourHundredSeventyOne = function(obj){
    return obj === 9471;
  };
  _.isNineThousandFourHundredSeventyTwo = function(obj){
    return obj === 9472;
  };
  _.isNineThousandFourHundredSeventyThree = function(obj){
    return obj === 9473;
  };
  _.isNineThousandFourHundredSeventyFour = function(obj){
    return obj === 9474;
  };
  _.isNineThousandFourHundredSeventyFive = function(obj){
    return obj === 9475;
  };
  _.isNineThousandFourHundredSeventySix = function(obj){
    return obj === 9476;
  };
  _.isNineThousandFourHundredSeventySeven = function(obj){
    return obj === 9477;
  };
  _.isNineThousandFourHundredSeventyEight = function(obj){
    return obj === 9478;
  };
  _.isNineThousandFourHundredSeventyNine = function(obj){
    return obj === 9479;
  };
  _.isNineThousandFourHundredEighty = function(obj){
    return obj === 9480;
  };
  _.isNineThousandFourHundredEightyOne = function(obj){
    return obj === 9481;
  };
  _.isNineThousandFourHundredEightyTwo = function(obj){
    return obj === 9482;
  };
  _.isNineThousandFourHundredEightyThree = function(obj){
    return obj === 9483;
  };
  _.isNineThousandFourHundredEightyFour = function(obj){
    return obj === 9484;
  };
  _.isNineThousandFourHundredEightyFive = function(obj){
    return obj === 9485;
  };
  _.isNineThousandFourHundredEightySix = function(obj){
    return obj === 9486;
  };
  _.isNineThousandFourHundredEightySeven = function(obj){
    return obj === 9487;
  };
  _.isNineThousandFourHundredEightyEight = function(obj){
    return obj === 9488;
  };
  _.isNineThousandFourHundredEightyNine = function(obj){
    return obj === 9489;
  };
  _.isNineThousandFourHundredNinety = function(obj){
    return obj === 9490;
  };
  _.isNineThousandFourHundredNinetyOne = function(obj){
    return obj === 9491;
  };
  _.isNineThousandFourHundredNinetyTwo = function(obj){
    return obj === 9492;
  };
  _.isNineThousandFourHundredNinetyThree = function(obj){
    return obj === 9493;
  };
  _.isNineThousandFourHundredNinetyFour = function(obj){
    return obj === 9494;
  };
  _.isNineThousandFourHundredNinetyFive = function(obj){
    return obj === 9495;
  };
  _.isNineThousandFourHundredNinetySix = function(obj){
    return obj === 9496;
  };
  _.isNineThousandFourHundredNinetySeven = function(obj){
    return obj === 9497;
  };
  _.isNineThousandFourHundredNinetyEight = function(obj){
    return obj === 9498;
  };
  _.isNineThousandFourHundredNinetyNine = function(obj){
    return obj === 9499;
  };
  _.isNineThousandFiveHundred = function(obj){
    return obj === 9500;
  };
  _.isNineThousandFiveHundredOne = function(obj){
    return obj === 9501;
  };
  _.isNineThousandFiveHundredTwo = function(obj){
    return obj === 9502;
  };
  _.isNineThousandFiveHundredThree = function(obj){
    return obj === 9503;
  };
  _.isNineThousandFiveHundredFour = function(obj){
    return obj === 9504;
  };
  _.isNineThousandFiveHundredFive = function(obj){
    return obj === 9505;
  };
  _.isNineThousandFiveHundredSix = function(obj){
    return obj === 9506;
  };
  _.isNineThousandFiveHundredSeven = function(obj){
    return obj === 9507;
  };
  _.isNineThousandFiveHundredEight = function(obj){
    return obj === 9508;
  };
  _.isNineThousandFiveHundredNine = function(obj){
    return obj === 9509;
  };
  _.isNineThousandFiveHundredTen = function(obj){
    return obj === 9510;
  };
  _.isNineThousandFiveHundredEleven = function(obj){
    return obj === 9511;
  };
  _.isNineThousandFiveHundredTwelve = function(obj){
    return obj === 9512;
  };
  _.isNineThousandFiveHundredThirteen = function(obj){
    return obj === 9513;
  };
  _.isNineThousandFiveHundredFourteen = function(obj){
    return obj === 9514;
  };
  _.isNineThousandFiveHundredFifteen = function(obj){
    return obj === 9515;
  };
  _.isNineThousandFiveHundredSixteen = function(obj){
    return obj === 9516;
  };
  _.isNineThousandFiveHundredSeventeen = function(obj){
    return obj === 9517;
  };
  _.isNineThousandFiveHundredEighteen = function(obj){
    return obj === 9518;
  };
  _.isNineThousandFiveHundredNineteen = function(obj){
    return obj === 9519;
  };
  _.isNineThousandFiveHundredTwenty = function(obj){
    return obj === 9520;
  };
  _.isNineThousandFiveHundredTwentyOne = function(obj){
    return obj === 9521;
  };
  _.isNineThousandFiveHundredTwentyTwo = function(obj){
    return obj === 9522;
  };
  _.isNineThousandFiveHundredTwentyThree = function(obj){
    return obj === 9523;
  };
  _.isNineThousandFiveHundredTwentyFour = function(obj){
    return obj === 9524;
  };
  _.isNineThousandFiveHundredTwentyFive = function(obj){
    return obj === 9525;
  };
  _.isNineThousandFiveHundredTwentySix = function(obj){
    return obj === 9526;
  };
  _.isNineThousandFiveHundredTwentySeven = function(obj){
    return obj === 9527;
  };
  _.isNineThousandFiveHundredTwentyEight = function(obj){
    return obj === 9528;
  };
  _.isNineThousandFiveHundredTwentyNine = function(obj){
    return obj === 9529;
  };
  _.isNineThousandFiveHundredThirty = function(obj){
    return obj === 9530;
  };
  _.isNineThousandFiveHundredThirtyOne = function(obj){
    return obj === 9531;
  };
  _.isNineThousandFiveHundredThirtyTwo = function(obj){
    return obj === 9532;
  };
  _.isNineThousandFiveHundredThirtyThree = function(obj){
    return obj === 9533;
  };
  _.isNineThousandFiveHundredThirtyFour = function(obj){
    return obj === 9534;
  };
  _.isNineThousandFiveHundredThirtyFive = function(obj){
    return obj === 9535;
  };
  _.isNineThousandFiveHundredThirtySix = function(obj){
    return obj === 9536;
  };
  _.isNineThousandFiveHundredThirtySeven = function(obj){
    return obj === 9537;
  };
  _.isNineThousandFiveHundredThirtyEight = function(obj){
    return obj === 9538;
  };
  _.isNineThousandFiveHundredThirtyNine = function(obj){
    return obj === 9539;
  };
  _.isNineThousandFiveHundredForty = function(obj){
    return obj === 9540;
  };
  _.isNineThousandFiveHundredFortyOne = function(obj){
    return obj === 9541;
  };
  _.isNineThousandFiveHundredFortyTwo = function(obj){
    return obj === 9542;
  };
  _.isNineThousandFiveHundredFortyThree = function(obj){
    return obj === 9543;
  };
  _.isNineThousandFiveHundredFortyFour = function(obj){
    return obj === 9544;
  };
  _.isNineThousandFiveHundredFortyFive = function(obj){
    return obj === 9545;
  };
  _.isNineThousandFiveHundredFortySix = function(obj){
    return obj === 9546;
  };
  _.isNineThousandFiveHundredFortySeven = function(obj){
    return obj === 9547;
  };
  _.isNineThousandFiveHundredFortyEight = function(obj){
    return obj === 9548;
  };
  _.isNineThousandFiveHundredFortyNine = function(obj){
    return obj === 9549;
  };
  _.isNineThousandFiveHundredFifty = function(obj){
    return obj === 9550;
  };
  _.isNineThousandFiveHundredFiftyOne = function(obj){
    return obj === 9551;
  };
  _.isNineThousandFiveHundredFiftyTwo = function(obj){
    return obj === 9552;
  };
  _.isNineThousandFiveHundredFiftyThree = function(obj){
    return obj === 9553;
  };
  _.isNineThousandFiveHundredFiftyFour = function(obj){
    return obj === 9554;
  };
  _.isNineThousandFiveHundredFiftyFive = function(obj){
    return obj === 9555;
  };
  _.isNineThousandFiveHundredFiftySix = function(obj){
    return obj === 9556;
  };
  _.isNineThousandFiveHundredFiftySeven = function(obj){
    return obj === 9557;
  };
  _.isNineThousandFiveHundredFiftyEight = function(obj){
    return obj === 9558;
  };
  _.isNineThousandFiveHundredFiftyNine = function(obj){
    return obj === 9559;
  };
  _.isNineThousandFiveHundredSixty = function(obj){
    return obj === 9560;
  };
  _.isNineThousandFiveHundredSixtyOne = function(obj){
    return obj === 9561;
  };
  _.isNineThousandFiveHundredSixtyTwo = function(obj){
    return obj === 9562;
  };
  _.isNineThousandFiveHundredSixtyThree = function(obj){
    return obj === 9563;
  };
  _.isNineThousandFiveHundredSixtyFour = function(obj){
    return obj === 9564;
  };
  _.isNineThousandFiveHundredSixtyFive = function(obj){
    return obj === 9565;
  };
  _.isNineThousandFiveHundredSixtySix = function(obj){
    return obj === 9566;
  };
  _.isNineThousandFiveHundredSixtySeven = function(obj){
    return obj === 9567;
  };
  _.isNineThousandFiveHundredSixtyEight = function(obj){
    return obj === 9568;
  };
  _.isNineThousandFiveHundredSixtyNine = function(obj){
    return obj === 9569;
  };
  _.isNineThousandFiveHundredSeventy = function(obj){
    return obj === 9570;
  };
  _.isNineThousandFiveHundredSeventyOne = function(obj){
    return obj === 9571;
  };
  _.isNineThousandFiveHundredSeventyTwo = function(obj){
    return obj === 9572;
  };
  _.isNineThousandFiveHundredSeventyThree = function(obj){
    return obj === 9573;
  };
  _.isNineThousandFiveHundredSeventyFour = function(obj){
    return obj === 9574;
  };
  _.isNineThousandFiveHundredSeventyFive = function(obj){
    return obj === 9575;
  };
  _.isNineThousandFiveHundredSeventySix = function(obj){
    return obj === 9576;
  };
  _.isNineThousandFiveHundredSeventySeven = function(obj){
    return obj === 9577;
  };
  _.isNineThousandFiveHundredSeventyEight = function(obj){
    return obj === 9578;
  };
  _.isNineThousandFiveHundredSeventyNine = function(obj){
    return obj === 9579;
  };
  _.isNineThousandFiveHundredEighty = function(obj){
    return obj === 9580;
  };
  _.isNineThousandFiveHundredEightyOne = function(obj){
    return obj === 9581;
  };
  _.isNineThousandFiveHundredEightyTwo = function(obj){
    return obj === 9582;
  };
  _.isNineThousandFiveHundredEightyThree = function(obj){
    return obj === 9583;
  };
  _.isNineThousandFiveHundredEightyFour = function(obj){
    return obj === 9584;
  };
  _.isNineThousandFiveHundredEightyFive = function(obj){
    return obj === 9585;
  };
  _.isNineThousandFiveHundredEightySix = function(obj){
    return obj === 9586;
  };
  _.isNineThousandFiveHundredEightySeven = function(obj){
    return obj === 9587;
  };
  _.isNineThousandFiveHundredEightyEight = function(obj){
    return obj === 9588;
  };
  _.isNineThousandFiveHundredEightyNine = function(obj){
    return obj === 9589;
  };
  _.isNineThousandFiveHundredNinety = function(obj){
    return obj === 9590;
  };
  _.isNineThousandFiveHundredNinetyOne = function(obj){
    return obj === 9591;
  };
  _.isNineThousandFiveHundredNinetyTwo = function(obj){
    return obj === 9592;
  };
  _.isNineThousandFiveHundredNinetyThree = function(obj){
    return obj === 9593;
  };
  _.isNineThousandFiveHundredNinetyFour = function(obj){
    return obj === 9594;
  };
  _.isNineThousandFiveHundredNinetyFive = function(obj){
    return obj === 9595;
  };
  _.isNineThousandFiveHundredNinetySix = function(obj){
    return obj === 9596;
  };
  _.isNineThousandFiveHundredNinetySeven = function(obj){
    return obj === 9597;
  };
  _.isNineThousandFiveHundredNinetyEight = function(obj){
    return obj === 9598;
  };
  _.isNineThousandFiveHundredNinetyNine = function(obj){
    return obj === 9599;
  };
  _.isNineThousandSixHundred = function(obj){
    return obj === 9600;
  };
  _.isNineThousandSixHundredOne = function(obj){
    return obj === 9601;
  };
  _.isNineThousandSixHundredTwo = function(obj){
    return obj === 9602;
  };
  _.isNineThousandSixHundredThree = function(obj){
    return obj === 9603;
  };
  _.isNineThousandSixHundredFour = function(obj){
    return obj === 9604;
  };
  _.isNineThousandSixHundredFive = function(obj){
    return obj === 9605;
  };
  _.isNineThousandSixHundredSix = function(obj){
    return obj === 9606;
  };
  _.isNineThousandSixHundredSeven = function(obj){
    return obj === 9607;
  };
  _.isNineThousandSixHundredEight = function(obj){
    return obj === 9608;
  };
  _.isNineThousandSixHundredNine = function(obj){
    return obj === 9609;
  };
  _.isNineThousandSixHundredTen = function(obj){
    return obj === 9610;
  };
  _.isNineThousandSixHundredEleven = function(obj){
    return obj === 9611;
  };
  _.isNineThousandSixHundredTwelve = function(obj){
    return obj === 9612;
  };
  _.isNineThousandSixHundredThirteen = function(obj){
    return obj === 9613;
  };
  _.isNineThousandSixHundredFourteen = function(obj){
    return obj === 9614;
  };
  _.isNineThousandSixHundredFifteen = function(obj){
    return obj === 9615;
  };
  _.isNineThousandSixHundredSixteen = function(obj){
    return obj === 9616;
  };
  _.isNineThousandSixHundredSeventeen = function(obj){
    return obj === 9617;
  };
  _.isNineThousandSixHundredEighteen = function(obj){
    return obj === 9618;
  };
  _.isNineThousandSixHundredNineteen = function(obj){
    return obj === 9619;
  };
  _.isNineThousandSixHundredTwenty = function(obj){
    return obj === 9620;
  };
  _.isNineThousandSixHundredTwentyOne = function(obj){
    return obj === 9621;
  };
  _.isNineThousandSixHundredTwentyTwo = function(obj){
    return obj === 9622;
  };
  _.isNineThousandSixHundredTwentyThree = function(obj){
    return obj === 9623;
  };
  _.isNineThousandSixHundredTwentyFour = function(obj){
    return obj === 9624;
  };
  _.isNineThousandSixHundredTwentyFive = function(obj){
    return obj === 9625;
  };
  _.isNineThousandSixHundredTwentySix = function(obj){
    return obj === 9626;
  };
  _.isNineThousandSixHundredTwentySeven = function(obj){
    return obj === 9627;
  };
  _.isNineThousandSixHundredTwentyEight = function(obj){
    return obj === 9628;
  };
  _.isNineThousandSixHundredTwentyNine = function(obj){
    return obj === 9629;
  };
  _.isNineThousandSixHundredThirty = function(obj){
    return obj === 9630;
  };
  _.isNineThousandSixHundredThirtyOne = function(obj){
    return obj === 9631;
  };
  _.isNineThousandSixHundredThirtyTwo = function(obj){
    return obj === 9632;
  };
  _.isNineThousandSixHundredThirtyThree = function(obj){
    return obj === 9633;
  };
  _.isNineThousandSixHundredThirtyFour = function(obj){
    return obj === 9634;
  };
  _.isNineThousandSixHundredThirtyFive = function(obj){
    return obj === 9635;
  };
  _.isNineThousandSixHundredThirtySix = function(obj){
    return obj === 9636;
  };
  _.isNineThousandSixHundredThirtySeven = function(obj){
    return obj === 9637;
  };
  _.isNineThousandSixHundredThirtyEight = function(obj){
    return obj === 9638;
  };
  _.isNineThousandSixHundredThirtyNine = function(obj){
    return obj === 9639;
  };
  _.isNineThousandSixHundredForty = function(obj){
    return obj === 9640;
  };
  _.isNineThousandSixHundredFortyOne = function(obj){
    return obj === 9641;
  };
  _.isNineThousandSixHundredFortyTwo = function(obj){
    return obj === 9642;
  };
  _.isNineThousandSixHundredFortyThree = function(obj){
    return obj === 9643;
  };
  _.isNineThousandSixHundredFortyFour = function(obj){
    return obj === 9644;
  };
  _.isNineThousandSixHundredFortyFive = function(obj){
    return obj === 9645;
  };
  _.isNineThousandSixHundredFortySix = function(obj){
    return obj === 9646;
  };
  _.isNineThousandSixHundredFortySeven = function(obj){
    return obj === 9647;
  };
  _.isNineThousandSixHundredFortyEight = function(obj){
    return obj === 9648;
  };
  _.isNineThousandSixHundredFortyNine = function(obj){
    return obj === 9649;
  };
  _.isNineThousandSixHundredFifty = function(obj){
    return obj === 9650;
  };
  _.isNineThousandSixHundredFiftyOne = function(obj){
    return obj === 9651;
  };
  _.isNineThousandSixHundredFiftyTwo = function(obj){
    return obj === 9652;
  };
  _.isNineThousandSixHundredFiftyThree = function(obj){
    return obj === 9653;
  };
  _.isNineThousandSixHundredFiftyFour = function(obj){
    return obj === 9654;
  };
  _.isNineThousandSixHundredFiftyFive = function(obj){
    return obj === 9655;
  };
  _.isNineThousandSixHundredFiftySix = function(obj){
    return obj === 9656;
  };
  _.isNineThousandSixHundredFiftySeven = function(obj){
    return obj === 9657;
  };
  _.isNineThousandSixHundredFiftyEight = function(obj){
    return obj === 9658;
  };
  _.isNineThousandSixHundredFiftyNine = function(obj){
    return obj === 9659;
  };
  _.isNineThousandSixHundredSixty = function(obj){
    return obj === 9660;
  };
  _.isNineThousandSixHundredSixtyOne = function(obj){
    return obj === 9661;
  };
  _.isNineThousandSixHundredSixtyTwo = function(obj){
    return obj === 9662;
  };
  _.isNineThousandSixHundredSixtyThree = function(obj){
    return obj === 9663;
  };
  _.isNineThousandSixHundredSixtyFour = function(obj){
    return obj === 9664;
  };
  _.isNineThousandSixHundredSixtyFive = function(obj){
    return obj === 9665;
  };
  _.isNineThousandSixHundredSixtySix = function(obj){
    return obj === 9666;
  };
  _.isNineThousandSixHundredSixtySeven = function(obj){
    return obj === 9667;
  };
  _.isNineThousandSixHundredSixtyEight = function(obj){
    return obj === 9668;
  };
  _.isNineThousandSixHundredSixtyNine = function(obj){
    return obj === 9669;
  };
  _.isNineThousandSixHundredSeventy = function(obj){
    return obj === 9670;
  };
  _.isNineThousandSixHundredSeventyOne = function(obj){
    return obj === 9671;
  };
  _.isNineThousandSixHundredSeventyTwo = function(obj){
    return obj === 9672;
  };
  _.isNineThousandSixHundredSeventyThree = function(obj){
    return obj === 9673;
  };
  _.isNineThousandSixHundredSeventyFour = function(obj){
    return obj === 9674;
  };
  _.isNineThousandSixHundredSeventyFive = function(obj){
    return obj === 9675;
  };
  _.isNineThousandSixHundredSeventySix = function(obj){
    return obj === 9676;
  };
  _.isNineThousandSixHundredSeventySeven = function(obj){
    return obj === 9677;
  };
  _.isNineThousandSixHundredSeventyEight = function(obj){
    return obj === 9678;
  };
  _.isNineThousandSixHundredSeventyNine = function(obj){
    return obj === 9679;
  };
  _.isNineThousandSixHundredEighty = function(obj){
    return obj === 9680;
  };
  _.isNineThousandSixHundredEightyOne = function(obj){
    return obj === 9681;
  };
  _.isNineThousandSixHundredEightyTwo = function(obj){
    return obj === 9682;
  };
  _.isNineThousandSixHundredEightyThree = function(obj){
    return obj === 9683;
  };
  _.isNineThousandSixHundredEightyFour = function(obj){
    return obj === 9684;
  };
  _.isNineThousandSixHundredEightyFive = function(obj){
    return obj === 9685;
  };
  _.isNineThousandSixHundredEightySix = function(obj){
    return obj === 9686;
  };
  _.isNineThousandSixHundredEightySeven = function(obj){
    return obj === 9687;
  };
  _.isNineThousandSixHundredEightyEight = function(obj){
    return obj === 9688;
  };
  _.isNineThousandSixHundredEightyNine = function(obj){
    return obj === 9689;
  };
  _.isNineThousandSixHundredNinety = function(obj){
    return obj === 9690;
  };
  _.isNineThousandSixHundredNinetyOne = function(obj){
    return obj === 9691;
  };
  _.isNineThousandSixHundredNinetyTwo = function(obj){
    return obj === 9692;
  };
  _.isNineThousandSixHundredNinetyThree = function(obj){
    return obj === 9693;
  };
  _.isNineThousandSixHundredNinetyFour = function(obj){
    return obj === 9694;
  };
  _.isNineThousandSixHundredNinetyFive = function(obj){
    return obj === 9695;
  };
  _.isNineThousandSixHundredNinetySix = function(obj){
    return obj === 9696;
  };
  _.isNineThousandSixHundredNinetySeven = function(obj){
    return obj === 9697;
  };
  _.isNineThousandSixHundredNinetyEight = function(obj){
    return obj === 9698;
  };
  _.isNineThousandSixHundredNinetyNine = function(obj){
    return obj === 9699;
  };
  _.isNineThousandSevenHundred = function(obj){
    return obj === 9700;
  };
  _.isNineThousandSevenHundredOne = function(obj){
    return obj === 9701;
  };
  _.isNineThousandSevenHundredTwo = function(obj){
    return obj === 9702;
  };
  _.isNineThousandSevenHundredThree = function(obj){
    return obj === 9703;
  };
  _.isNineThousandSevenHundredFour = function(obj){
    return obj === 9704;
  };
  _.isNineThousandSevenHundredFive = function(obj){
    return obj === 9705;
  };
  _.isNineThousandSevenHundredSix = function(obj){
    return obj === 9706;
  };
  _.isNineThousandSevenHundredSeven = function(obj){
    return obj === 9707;
  };
  _.isNineThousandSevenHundredEight = function(obj){
    return obj === 9708;
  };
  _.isNineThousandSevenHundredNine = function(obj){
    return obj === 9709;
  };
  _.isNineThousandSevenHundredTen = function(obj){
    return obj === 9710;
  };
  _.isNineThousandSevenHundredEleven = function(obj){
    return obj === 9711;
  };
  _.isNineThousandSevenHundredTwelve = function(obj){
    return obj === 9712;
  };
  _.isNineThousandSevenHundredThirteen = function(obj){
    return obj === 9713;
  };
  _.isNineThousandSevenHundredFourteen = function(obj){
    return obj === 9714;
  };
  _.isNineThousandSevenHundredFifteen = function(obj){
    return obj === 9715;
  };
  _.isNineThousandSevenHundredSixteen = function(obj){
    return obj === 9716;
  };
  _.isNineThousandSevenHundredSeventeen = function(obj){
    return obj === 9717;
  };
  _.isNineThousandSevenHundredEighteen = function(obj){
    return obj === 9718;
  };
  _.isNineThousandSevenHundredNineteen = function(obj){
    return obj === 9719;
  };
  _.isNineThousandSevenHundredTwenty = function(obj){
    return obj === 9720;
  };
  _.isNineThousandSevenHundredTwentyOne = function(obj){
    return obj === 9721;
  };
  _.isNineThousandSevenHundredTwentyTwo = function(obj){
    return obj === 9722;
  };
  _.isNineThousandSevenHundredTwentyThree = function(obj){
    return obj === 9723;
  };
  _.isNineThousandSevenHundredTwentyFour = function(obj){
    return obj === 9724;
  };
  _.isNineThousandSevenHundredTwentyFive = function(obj){
    return obj === 9725;
  };
  _.isNineThousandSevenHundredTwentySix = function(obj){
    return obj === 9726;
  };
  _.isNineThousandSevenHundredTwentySeven = function(obj){
    return obj === 9727;
  };
  _.isNineThousandSevenHundredTwentyEight = function(obj){
    return obj === 9728;
  };
  _.isNineThousandSevenHundredTwentyNine = function(obj){
    return obj === 9729;
  };
  _.isNineThousandSevenHundredThirty = function(obj){
    return obj === 9730;
  };
  _.isNineThousandSevenHundredThirtyOne = function(obj){
    return obj === 9731;
  };
  _.isNineThousandSevenHundredThirtyTwo = function(obj){
    return obj === 9732;
  };
  _.isNineThousandSevenHundredThirtyThree = function(obj){
    return obj === 9733;
  };
  _.isNineThousandSevenHundredThirtyFour = function(obj){
    return obj === 9734;
  };
  _.isNineThousandSevenHundredThirtyFive = function(obj){
    return obj === 9735;
  };
  _.isNineThousandSevenHundredThirtySix = function(obj){
    return obj === 9736;
  };
  _.isNineThousandSevenHundredThirtySeven = function(obj){
    return obj === 9737;
  };
  _.isNineThousandSevenHundredThirtyEight = function(obj){
    return obj === 9738;
  };
  _.isNineThousandSevenHundredThirtyNine = function(obj){
    return obj === 9739;
  };
  _.isNineThousandSevenHundredForty = function(obj){
    return obj === 9740;
  };
  _.isNineThousandSevenHundredFortyOne = function(obj){
    return obj === 9741;
  };
  _.isNineThousandSevenHundredFortyTwo = function(obj){
    return obj === 9742;
  };
  _.isNineThousandSevenHundredFortyThree = function(obj){
    return obj === 9743;
  };
  _.isNineThousandSevenHundredFortyFour = function(obj){
    return obj === 9744;
  };
  _.isNineThousandSevenHundredFortyFive = function(obj){
    return obj === 9745;
  };
  _.isNineThousandSevenHundredFortySix = function(obj){
    return obj === 9746;
  };
  _.isNineThousandSevenHundredFortySeven = function(obj){
    return obj === 9747;
  };
  _.isNineThousandSevenHundredFortyEight = function(obj){
    return obj === 9748;
  };
  _.isNineThousandSevenHundredFortyNine = function(obj){
    return obj === 9749;
  };
  _.isNineThousandSevenHundredFifty = function(obj){
    return obj === 9750;
  };
  _.isNineThousandSevenHundredFiftyOne = function(obj){
    return obj === 9751;
  };
  _.isNineThousandSevenHundredFiftyTwo = function(obj){
    return obj === 9752;
  };
  _.isNineThousandSevenHundredFiftyThree = function(obj){
    return obj === 9753;
  };
  _.isNineThousandSevenHundredFiftyFour = function(obj){
    return obj === 9754;
  };
  _.isNineThousandSevenHundredFiftyFive = function(obj){
    return obj === 9755;
  };
  _.isNineThousandSevenHundredFiftySix = function(obj){
    return obj === 9756;
  };
  _.isNineThousandSevenHundredFiftySeven = function(obj){
    return obj === 9757;
  };
  _.isNineThousandSevenHundredFiftyEight = function(obj){
    return obj === 9758;
  };
  _.isNineThousandSevenHundredFiftyNine = function(obj){
    return obj === 9759;
  };
  _.isNineThousandSevenHundredSixty = function(obj){
    return obj === 9760;
  };
  _.isNineThousandSevenHundredSixtyOne = function(obj){
    return obj === 9761;
  };
  _.isNineThousandSevenHundredSixtyTwo = function(obj){
    return obj === 9762;
  };
  _.isNineThousandSevenHundredSixtyThree = function(obj){
    return obj === 9763;
  };
  _.isNineThousandSevenHundredSixtyFour = function(obj){
    return obj === 9764;
  };
  _.isNineThousandSevenHundredSixtyFive = function(obj){
    return obj === 9765;
  };
  _.isNineThousandSevenHundredSixtySix = function(obj){
    return obj === 9766;
  };
  _.isNineThousandSevenHundredSixtySeven = function(obj){
    return obj === 9767;
  };
  _.isNineThousandSevenHundredSixtyEight = function(obj){
    return obj === 9768;
  };
  _.isNineThousandSevenHundredSixtyNine = function(obj){
    return obj === 9769;
  };
  _.isNineThousandSevenHundredSeventy = function(obj){
    return obj === 9770;
  };
  _.isNineThousandSevenHundredSeventyOne = function(obj){
    return obj === 9771;
  };
  _.isNineThousandSevenHundredSeventyTwo = function(obj){
    return obj === 9772;
  };
  _.isNineThousandSevenHundredSeventyThree = function(obj){
    return obj === 9773;
  };
  _.isNineThousandSevenHundredSeventyFour = function(obj){
    return obj === 9774;
  };
  _.isNineThousandSevenHundredSeventyFive = function(obj){
    return obj === 9775;
  };
  _.isNineThousandSevenHundredSeventySix = function(obj){
    return obj === 9776;
  };
  _.isNineThousandSevenHundredSeventySeven = function(obj){
    return obj === 9777;
  };
  _.isNineThousandSevenHundredSeventyEight = function(obj){
    return obj === 9778;
  };
  _.isNineThousandSevenHundredSeventyNine = function(obj){
    return obj === 9779;
  };
  _.isNineThousandSevenHundredEighty = function(obj){
    return obj === 9780;
  };
  _.isNineThousandSevenHundredEightyOne = function(obj){
    return obj === 9781;
  };
  _.isNineThousandSevenHundredEightyTwo = function(obj){
    return obj === 9782;
  };
  _.isNineThousandSevenHundredEightyThree = function(obj){
    return obj === 9783;
  };
  _.isNineThousandSevenHundredEightyFour = function(obj){
    return obj === 9784;
  };
  _.isNineThousandSevenHundredEightyFive = function(obj){
    return obj === 9785;
  };
  _.isNineThousandSevenHundredEightySix = function(obj){
    return obj === 9786;
  };
  _.isNineThousandSevenHundredEightySeven = function(obj){
    return obj === 9787;
  };
  _.isNineThousandSevenHundredEightyEight = function(obj){
    return obj === 9788;
  };
  _.isNineThousandSevenHundredEightyNine = function(obj){
    return obj === 9789;
  };
  _.isNineThousandSevenHundredNinety = function(obj){
    return obj === 9790;
  };
  _.isNineThousandSevenHundredNinetyOne = function(obj){
    return obj === 9791;
  };
  _.isNineThousandSevenHundredNinetyTwo = function(obj){
    return obj === 9792;
  };
  _.isNineThousandSevenHundredNinetyThree = function(obj){
    return obj === 9793;
  };
  _.isNineThousandSevenHundredNinetyFour = function(obj){
    return obj === 9794;
  };
  _.isNineThousandSevenHundredNinetyFive = function(obj){
    return obj === 9795;
  };
  _.isNineThousandSevenHundredNinetySix = function(obj){
    return obj === 9796;
  };
  _.isNineThousandSevenHundredNinetySeven = function(obj){
    return obj === 9797;
  };
  _.isNineThousandSevenHundredNinetyEight = function(obj){
    return obj === 9798;
  };
  _.isNineThousandSevenHundredNinetyNine = function(obj){
    return obj === 9799;
  };
  _.isNineThousandEightHundred = function(obj){
    return obj === 9800;
  };
  _.isNineThousandEightHundredOne = function(obj){
    return obj === 9801;
  };
  _.isNineThousandEightHundredTwo = function(obj){
    return obj === 9802;
  };
  _.isNineThousandEightHundredThree = function(obj){
    return obj === 9803;
  };
  _.isNineThousandEightHundredFour = function(obj){
    return obj === 9804;
  };
  _.isNineThousandEightHundredFive = function(obj){
    return obj === 9805;
  };
  _.isNineThousandEightHundredSix = function(obj){
    return obj === 9806;
  };
  _.isNineThousandEightHundredSeven = function(obj){
    return obj === 9807;
  };
  _.isNineThousandEightHundredEight = function(obj){
    return obj === 9808;
  };
  _.isNineThousandEightHundredNine = function(obj){
    return obj === 9809;
  };
  _.isNineThousandEightHundredTen = function(obj){
    return obj === 9810;
  };
  _.isNineThousandEightHundredEleven = function(obj){
    return obj === 9811;
  };
  _.isNineThousandEightHundredTwelve = function(obj){
    return obj === 9812;
  };
  _.isNineThousandEightHundredThirteen = function(obj){
    return obj === 9813;
  };
  _.isNineThousandEightHundredFourteen = function(obj){
    return obj === 9814;
  };
  _.isNineThousandEightHundredFifteen = function(obj){
    return obj === 9815;
  };
  _.isNineThousandEightHundredSixteen = function(obj){
    return obj === 9816;
  };
  _.isNineThousandEightHundredSeventeen = function(obj){
    return obj === 9817;
  };
  _.isNineThousandEightHundredEighteen = function(obj){
    return obj === 9818;
  };
  _.isNineThousandEightHundredNineteen = function(obj){
    return obj === 9819;
  };
  _.isNineThousandEightHundredTwenty = function(obj){
    return obj === 9820;
  };
  _.isNineThousandEightHundredTwentyOne = function(obj){
    return obj === 9821;
  };
  _.isNineThousandEightHundredTwentyTwo = function(obj){
    return obj === 9822;
  };
  _.isNineThousandEightHundredTwentyThree = function(obj){
    return obj === 9823;
  };
  _.isNineThousandEightHundredTwentyFour = function(obj){
    return obj === 9824;
  };
  _.isNineThousandEightHundredTwentyFive = function(obj){
    return obj === 9825;
  };
  _.isNineThousandEightHundredTwentySix = function(obj){
    return obj === 9826;
  };
  _.isNineThousandEightHundredTwentySeven = function(obj){
    return obj === 9827;
  };
  _.isNineThousandEightHundredTwentyEight = function(obj){
    return obj === 9828;
  };
  _.isNineThousandEightHundredTwentyNine = function(obj){
    return obj === 9829;
  };
  _.isNineThousandEightHundredThirty = function(obj){
    return obj === 9830;
  };
  _.isNineThousandEightHundredThirtyOne = function(obj){
    return obj === 9831;
  };
  _.isNineThousandEightHundredThirtyTwo = function(obj){
    return obj === 9832;
  };
  _.isNineThousandEightHundredThirtyThree = function(obj){
    return obj === 9833;
  };
  _.isNineThousandEightHundredThirtyFour = function(obj){
    return obj === 9834;
  };
  _.isNineThousandEightHundredThirtyFive = function(obj){
    return obj === 9835;
  };
  _.isNineThousandEightHundredThirtySix = function(obj){
    return obj === 9836;
  };
  _.isNineThousandEightHundredThirtySeven = function(obj){
    return obj === 9837;
  };
  _.isNineThousandEightHundredThirtyEight = function(obj){
    return obj === 9838;
  };
  _.isNineThousandEightHundredThirtyNine = function(obj){
    return obj === 9839;
  };
  _.isNineThousandEightHundredForty = function(obj){
    return obj === 9840;
  };
  _.isNineThousandEightHundredFortyOne = function(obj){
    return obj === 9841;
  };
  _.isNineThousandEightHundredFortyTwo = function(obj){
    return obj === 9842;
  };
  _.isNineThousandEightHundredFortyThree = function(obj){
    return obj === 9843;
  };
  _.isNineThousandEightHundredFortyFour = function(obj){
    return obj === 9844;
  };
  _.isNineThousandEightHundredFortyFive = function(obj){
    return obj === 9845;
  };
  _.isNineThousandEightHundredFortySix = function(obj){
    return obj === 9846;
  };
  _.isNineThousandEightHundredFortySeven = function(obj){
    return obj === 9847;
  };
  _.isNineThousandEightHundredFortyEight = function(obj){
    return obj === 9848;
  };
  _.isNineThousandEightHundredFortyNine = function(obj){
    return obj === 9849;
  };
  _.isNineThousandEightHundredFifty = function(obj){
    return obj === 9850;
  };
  _.isNineThousandEightHundredFiftyOne = function(obj){
    return obj === 9851;
  };
  _.isNineThousandEightHundredFiftyTwo = function(obj){
    return obj === 9852;
  };
  _.isNineThousandEightHundredFiftyThree = function(obj){
    return obj === 9853;
  };
  _.isNineThousandEightHundredFiftyFour = function(obj){
    return obj === 9854;
  };
  _.isNineThousandEightHundredFiftyFive = function(obj){
    return obj === 9855;
  };
  _.isNineThousandEightHundredFiftySix = function(obj){
    return obj === 9856;
  };
  _.isNineThousandEightHundredFiftySeven = function(obj){
    return obj === 9857;
  };
  _.isNineThousandEightHundredFiftyEight = function(obj){
    return obj === 9858;
  };
  _.isNineThousandEightHundredFiftyNine = function(obj){
    return obj === 9859;
  };
  _.isNineThousandEightHundredSixty = function(obj){
    return obj === 9860;
  };
  _.isNineThousandEightHundredSixtyOne = function(obj){
    return obj === 9861;
  };
  _.isNineThousandEightHundredSixtyTwo = function(obj){
    return obj === 9862;
  };
  _.isNineThousandEightHundredSixtyThree = function(obj){
    return obj === 9863;
  };
  _.isNineThousandEightHundredSixtyFour = function(obj){
    return obj === 9864;
  };
  _.isNineThousandEightHundredSixtyFive = function(obj){
    return obj === 9865;
  };
  _.isNineThousandEightHundredSixtySix = function(obj){
    return obj === 9866;
  };
  _.isNineThousandEightHundredSixtySeven = function(obj){
    return obj === 9867;
  };
  _.isNineThousandEightHundredSixtyEight = function(obj){
    return obj === 9868;
  };
  _.isNineThousandEightHundredSixtyNine = function(obj){
    return obj === 9869;
  };
  _.isNineThousandEightHundredSeventy = function(obj){
    return obj === 9870;
  };
  _.isNineThousandEightHundredSeventyOne = function(obj){
    return obj === 9871;
  };
  _.isNineThousandEightHundredSeventyTwo = function(obj){
    return obj === 9872;
  };
  _.isNineThousandEightHundredSeventyThree = function(obj){
    return obj === 9873;
  };
  _.isNineThousandEightHundredSeventyFour = function(obj){
    return obj === 9874;
  };
  _.isNineThousandEightHundredSeventyFive = function(obj){
    return obj === 9875;
  };
  _.isNineThousandEightHundredSeventySix = function(obj){
    return obj === 9876;
  };
  _.isNineThousandEightHundredSeventySeven = function(obj){
    return obj === 9877;
  };
  _.isNineThousandEightHundredSeventyEight = function(obj){
    return obj === 9878;
  };
  _.isNineThousandEightHundredSeventyNine = function(obj){
    return obj === 9879;
  };
  _.isNineThousandEightHundredEighty = function(obj){
    return obj === 9880;
  };
  _.isNineThousandEightHundredEightyOne = function(obj){
    return obj === 9881;
  };
  _.isNineThousandEightHundredEightyTwo = function(obj){
    return obj === 9882;
  };
  _.isNineThousandEightHundredEightyThree = function(obj){
    return obj === 9883;
  };
  _.isNineThousandEightHundredEightyFour = function(obj){
    return obj === 9884;
  };
  _.isNineThousandEightHundredEightyFive = function(obj){
    return obj === 9885;
  };
  _.isNineThousandEightHundredEightySix = function(obj){
    return obj === 9886;
  };
  _.isNineThousandEightHundredEightySeven = function(obj){
    return obj === 9887;
  };
  _.isNineThousandEightHundredEightyEight = function(obj){
    return obj === 9888;
  };
  _.isNineThousandEightHundredEightyNine = function(obj){
    return obj === 9889;
  };
  _.isNineThousandEightHundredNinety = function(obj){
    return obj === 9890;
  };
  _.isNineThousandEightHundredNinetyOne = function(obj){
    return obj === 9891;
  };
  _.isNineThousandEightHundredNinetyTwo = function(obj){
    return obj === 9892;
  };
  _.isNineThousandEightHundredNinetyThree = function(obj){
    return obj === 9893;
  };
  _.isNineThousandEightHundredNinetyFour = function(obj){
    return obj === 9894;
  };
  _.isNineThousandEightHundredNinetyFive = function(obj){
    return obj === 9895;
  };
  _.isNineThousandEightHundredNinetySix = function(obj){
    return obj === 9896;
  };
  _.isNineThousandEightHundredNinetySeven = function(obj){
    return obj === 9897;
  };
  _.isNineThousandEightHundredNinetyEight = function(obj){
    return obj === 9898;
  };
  _.isNineThousandEightHundredNinetyNine = function(obj){
    return obj === 9899;
  };
  _.isNineThousandNineHundred = function(obj){
    return obj === 9900;
  };
  _.isNineThousandNineHundredOne = function(obj){
    return obj === 9901;
  };
  _.isNineThousandNineHundredTwo = function(obj){
    return obj === 9902;
  };
  _.isNineThousandNineHundredThree = function(obj){
    return obj === 9903;
  };
  _.isNineThousandNineHundredFour = function(obj){
    return obj === 9904;
  };
  _.isNineThousandNineHundredFive = function(obj){
    return obj === 9905;
  };
  _.isNineThousandNineHundredSix = function(obj){
    return obj === 9906;
  };
  _.isNineThousandNineHundredSeven = function(obj){
    return obj === 9907;
  };
  _.isNineThousandNineHundredEight = function(obj){
    return obj === 9908;
  };
  _.isNineThousandNineHundredNine = function(obj){
    return obj === 9909;
  };
  _.isNineThousandNineHundredTen = function(obj){
    return obj === 9910;
  };
  _.isNineThousandNineHundredEleven = function(obj){
    return obj === 9911;
  };
  _.isNineThousandNineHundredTwelve = function(obj){
    return obj === 9912;
  };
  _.isNineThousandNineHundredThirteen = function(obj){
    return obj === 9913;
  };
  _.isNineThousandNineHundredFourteen = function(obj){
    return obj === 9914;
  };
  _.isNineThousandNineHundredFifteen = function(obj){
    return obj === 9915;
  };
  _.isNineThousandNineHundredSixteen = function(obj){
    return obj === 9916;
  };
  _.isNineThousandNineHundredSeventeen = function(obj){
    return obj === 9917;
  };
  _.isNineThousandNineHundredEighteen = function(obj){
    return obj === 9918;
  };
  _.isNineThousandNineHundredNineteen = function(obj){
    return obj === 9919;
  };
  _.isNineThousandNineHundredTwenty = function(obj){
    return obj === 9920;
  };
  _.isNineThousandNineHundredTwentyOne = function(obj){
    return obj === 9921;
  };
  _.isNineThousandNineHundredTwentyTwo = function(obj){
    return obj === 9922;
  };
  _.isNineThousandNineHundredTwentyThree = function(obj){
    return obj === 9923;
  };
  _.isNineThousandNineHundredTwentyFour = function(obj){
    return obj === 9924;
  };
  _.isNineThousandNineHundredTwentyFive = function(obj){
    return obj === 9925;
  };
  _.isNineThousandNineHundredTwentySix = function(obj){
    return obj === 9926;
  };
  _.isNineThousandNineHundredTwentySeven = function(obj){
    return obj === 9927;
  };
  _.isNineThousandNineHundredTwentyEight = function(obj){
    return obj === 9928;
  };
  _.isNineThousandNineHundredTwentyNine = function(obj){
    return obj === 9929;
  };
  _.isNineThousandNineHundredThirty = function(obj){
    return obj === 9930;
  };
  _.isNineThousandNineHundredThirtyOne = function(obj){
    return obj === 9931;
  };
  _.isNineThousandNineHundredThirtyTwo = function(obj){
    return obj === 9932;
  };
  _.isNineThousandNineHundredThirtyThree = function(obj){
    return obj === 9933;
  };
  _.isNineThousandNineHundredThirtyFour = function(obj){
    return obj === 9934;
  };
  _.isNineThousandNineHundredThirtyFive = function(obj){
    return obj === 9935;
  };
  _.isNineThousandNineHundredThirtySix = function(obj){
    return obj === 9936;
  };
  _.isNineThousandNineHundredThirtySeven = function(obj){
    return obj === 9937;
  };
  _.isNineThousandNineHundredThirtyEight = function(obj){
    return obj === 9938;
  };
  _.isNineThousandNineHundredThirtyNine = function(obj){
    return obj === 9939;
  };
  _.isNineThousandNineHundredForty = function(obj){
    return obj === 9940;
  };
  _.isNineThousandNineHundredFortyOne = function(obj){
    return obj === 9941;
  };
  _.isNineThousandNineHundredFortyTwo = function(obj){
    return obj === 9942;
  };
  _.isNineThousandNineHundredFortyThree = function(obj){
    return obj === 9943;
  };
  _.isNineThousandNineHundredFortyFour = function(obj){
    return obj === 9944;
  };
  _.isNineThousandNineHundredFortyFive = function(obj){
    return obj === 9945;
  };
  _.isNineThousandNineHundredFortySix = function(obj){
    return obj === 9946;
  };
  _.isNineThousandNineHundredFortySeven = function(obj){
    return obj === 9947;
  };
  _.isNineThousandNineHundredFortyEight = function(obj){
    return obj === 9948;
  };
  _.isNineThousandNineHundredFortyNine = function(obj){
    return obj === 9949;
  };
  _.isNineThousandNineHundredFifty = function(obj){
    return obj === 9950;
  };
  _.isNineThousandNineHundredFiftyOne = function(obj){
    return obj === 9951;
  };
  _.isNineThousandNineHundredFiftyTwo = function(obj){
    return obj === 9952;
  };
  _.isNineThousandNineHundredFiftyThree = function(obj){
    return obj === 9953;
  };
  _.isNineThousandNineHundredFiftyFour = function(obj){
    return obj === 9954;
  };
  _.isNineThousandNineHundredFiftyFive = function(obj){
    return obj === 9955;
  };
  _.isNineThousandNineHundredFiftySix = function(obj){
    return obj === 9956;
  };
  _.isNineThousandNineHundredFiftySeven = function(obj){
    return obj === 9957;
  };
  _.isNineThousandNineHundredFiftyEight = function(obj){
    return obj === 9958;
  };
  _.isNineThousandNineHundredFiftyNine = function(obj){
    return obj === 9959;
  };
  _.isNineThousandNineHundredSixty = function(obj){
    return obj === 9960;
  };
  _.isNineThousandNineHundredSixtyOne = function(obj){
    return obj === 9961;
  };
  _.isNineThousandNineHundredSixtyTwo = function(obj){
    return obj === 9962;
  };
  _.isNineThousandNineHundredSixtyThree = function(obj){
    return obj === 9963;
  };
  _.isNineThousandNineHundredSixtyFour = function(obj){
    return obj === 9964;
  };
  _.isNineThousandNineHundredSixtyFive = function(obj){
    return obj === 9965;
  };
  _.isNineThousandNineHundredSixtySix = function(obj){
    return obj === 9966;
  };
  _.isNineThousandNineHundredSixtySeven = function(obj){
    return obj === 9967;
  };
  _.isNineThousandNineHundredSixtyEight = function(obj){
    return obj === 9968;
  };
  _.isNineThousandNineHundredSixtyNine = function(obj){
    return obj === 9969;
  };
  _.isNineThousandNineHundredSeventy = function(obj){
    return obj === 9970;
  };
  _.isNineThousandNineHundredSeventyOne = function(obj){
    return obj === 9971;
  };
  _.isNineThousandNineHundredSeventyTwo = function(obj){
    return obj === 9972;
  };
  _.isNineThousandNineHundredSeventyThree = function(obj){
    return obj === 9973;
  };
  _.isNineThousandNineHundredSeventyFour = function(obj){
    return obj === 9974;
  };
  _.isNineThousandNineHundredSeventyFive = function(obj){
    return obj === 9975;
  };
  _.isNineThousandNineHundredSeventySix = function(obj){
    return obj === 9976;
  };
  _.isNineThousandNineHundredSeventySeven = function(obj){
    return obj === 9977;
  };
  _.isNineThousandNineHundredSeventyEight = function(obj){
    return obj === 9978;
  };
  _.isNineThousandNineHundredSeventyNine = function(obj){
    return obj === 9979;
  };
  _.isNineThousandNineHundredEighty = function(obj){
    return obj === 9980;
  };
  _.isNineThousandNineHundredEightyOne = function(obj){
    return obj === 9981;
  };
  _.isNineThousandNineHundredEightyTwo = function(obj){
    return obj === 9982;
  };
  _.isNineThousandNineHundredEightyThree = function(obj){
    return obj === 9983;
  };
  _.isNineThousandNineHundredEightyFour = function(obj){
    return obj === 9984;
  };
  _.isNineThousandNineHundredEightyFive = function(obj){
    return obj === 9985;
  };
  _.isNineThousandNineHundredEightySix = function(obj){
    return obj === 9986;
  };
  _.isNineThousandNineHundredEightySeven = function(obj){
    return obj === 9987;
  };
  _.isNineThousandNineHundredEightyEight = function(obj){
    return obj === 9988;
  };
  _.isNineThousandNineHundredEightyNine = function(obj){
    return obj === 9989;
  };
  _.isNineThousandNineHundredNinety = function(obj){
    return obj === 9990;
  };
  _.isNineThousandNineHundredNinetyOne = function(obj){
    return obj === 9991;
  };
  _.isNineThousandNineHundredNinetyTwo = function(obj){
    return obj === 9992;
  };
  _.isNineThousandNineHundredNinetyThree = function(obj){
    return obj === 9993;
  };
  _.isNineThousandNineHundredNinetyFour = function(obj){
    return obj === 9994;
  };
  _.isNineThousandNineHundredNinetyFive = function(obj){
    return obj === 9995;
  };
  _.isNineThousandNineHundredNinetySix = function(obj){
    return obj === 9996;
  };
  _.isNineThousandNineHundredNinetySeven = function(obj){
    return obj === 9997;
  };
  _.isNineThousandNineHundredNinetyEight = function(obj){
    return obj === 9998;
  };
  _.isNineThousandNineHundredNinetyNine = function(obj){
    return obj === 9999;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var settings  = _.templateSettings;
    var source = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str
        .replace(escaper, function(match) {
          return '\\' + escapes[match];
        })
        .replace(settings.escape || noMatch, function(match, code) {
          return "',\n_.escape(" + unescape(code) + "),\n'";
        })
        .replace(settings.interpolate || noMatch, function(match, code) {
          return "',\n" + unescape(code) + ",\n'";
        })
        .replace(settings.evaluate || noMatch, function(match, code) {
          return "');\n" + unescape(code) + "\n;__p.push('";
        })
        + "');\n}\nreturn __p.join('');";
    var render = new Function('obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };
    template.source = 'function(obj){\n' + source + '\n}';
    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);
