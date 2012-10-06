var objects = require('./objects'),
    functions = require('./functions'),
    utils = require('./utils'),
    common = require('./common'),
    each = common.each,
    breaker = common.breaker,
    ArrayProto = Array.prototype,
    slice = ArrayProto.slice,
    nativeMap = ArrayProto.map,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeReduce = ArrayProto.reduce,
    nativeReduceRight = ArrayProto.reduceRight,
    nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
    hasOwnProperty = Object.prototype.hasOwnProperty;

// The cornerstone, an `each` implementation, aka `forEach`.
// Handles objects with the built-in `forEach`, arrays, and raw objects.
// Delegates to **ECMAScript 5**'s native `forEach` if available.
exports.each = exports.forEach = each;

// Return the results of applying the iterator to each element.
// Delegates to **ECMAScript 5**'s native `map` if available.
exports.map = exports.collect = function(obj, iterator, context) {
  var results = [];
  if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
  each(obj, function(value, index, list) {
    results[results.length] = iterator.call(context, value, index, list);
  });
  return results;
};

// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
exports.reduce = exports.foldl = exports.inject = function(obj, iterator, memo, context) {
  var initial = arguments.length > 2;
  if (nativeReduce && obj.reduce === nativeReduce) {
    if (context) iterator = functions.bind(iterator, context);
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
exports.reduceRight = exports.foldr = function(obj, iterator, memo, context) {
  var initial = arguments.length > 2;
  if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
    if (context) iterator = functions.bind(iterator, context);
    return arguments.length > 2 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
  }
  var length = obj.length;
  if (length !== +length) {
    var keys = objects.keys(obj);
    length = keys.length;
  }
  each(obj, function(value, index, list) {
    index = keys ? keys[--length] : --length;
    if (!initial) {
      memo = obj[index];
      initial = true;
    } else {
      memo = iterator.call(context, memo, obj[index], index, list);
    }
  });
  if (!initial) throw new TypeError('Reduce of empty array with no initial value');
  return memo;
};

// Return the first value which passes a truth test. Aliased as `detect`.
exports.find = exports.detect = function(obj, iterator, context) {
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
exports.filter = exports.select = function(obj, iterator, context) {
  var results = [];
  if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
  each(obj, function(value, index, list) {
    if (iterator.call(context, value, index, list)) results[results.length] = value;
  });
  return results;
};

// Return all the elements for which a truth test fails.
exports.reject = function(obj, iterator, context) {
  var results = [];
  each(obj, function(value, index, list) {
    if (!iterator.call(context, value, index, list)) results[results.length] = value;
  });
  return results;
};

// Determine whether all of the elements match a truth test.
// Delegates to **ECMAScript 5**'s native `every` if available.
// Aliased as `all`.
exports.every = exports.all = function(obj, iterator, context) {
  iterator || (iterator = utils.identity);
  var result = true;
  if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
  each(obj, function(value, index, list) {
    if (!(result = result && iterator.call(context, value, index, list))) return breaker;
  });
  return !!result;
};

// Determine if at least one element in the object matches a truth test.
// Delegates to **ECMAScript 5**'s native `some` if available.
// Aliased as `any`.
var any = exports.any = exports.some = function(obj, iterator, context) {
  iterator || (iterator = utils.identity);
  var result = false;
  if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
  each(obj, function(value, index, list) {
    if (result || (result = iterator.call(context, value, index, list))) return breaker;
  });
  return !!result;
};

// Determine if the array or object contains a given value (using `===`).
// Aliased as `include`.
exports.contains = exports.include = function(obj, target) {
  var found = false;
  if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
  found = any(obj, function(value) {
    return value === target;
  });
  return found;
};

// Invoke a method (with arguments) on every item in a collection.
exports.invoke = function(obj, method) {
  var args = slice.call(arguments, 2);
  return exports.map(obj, function(value) {
    return (objects.isFunction(method) ? method : value[method]).apply(value, args);
  });
};

// Convenience version of a common use case of `map`: fetching a property.
exports.pluck = function(obj, key) {
  return exports.map(obj, function(value){ return value[key]; });
};

// Convenience version of a common use case of `filter`: selecting only objects
// with specific `key:value` pairs.
exports.where = function(obj, attrs) {
  if (objects.isEmpty(attrs)) return [];
  return exports.filter(obj, function(value) {
    for (var key in attrs) {
      if (attrs[key] !== value[key]) return false;
    }
    return true;
  });
};

// Return the maximum element or (element-based computation).
// Can't optimize arrays of integers longer than 65,535 elements.
// See: https://bugs.webkit.org/show_bug.cgi?id=80797
exports.max = function(obj, iterator, context) {
  if (!iterator && objects.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
    return Math.max.apply(Math, obj);
  }
  if (!iterator && objects.isEmpty(obj)) return -Infinity;
  var result = {computed : -Infinity};
  each(obj, function(value, index, list) {
    var computed = iterator ? iterator.call(context, value, index, list) : value;
    computed >= result.computed && (result = {value : value, computed : computed});
  });
  return result.value;
};

// Return the minimum element (or element-based computation).
exports.min = function(obj, iterator, context) {
  if (!iterator && objects.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
    return Math.min.apply(Math, obj);
  }
  if (!iterator && objects.isEmpty(obj)) return Infinity;
  var result = {computed : Infinity};
  each(obj, function(value, index, list) {
    var computed = iterator ? iterator.call(context, value, index, list) : value;
    computed < result.computed && (result = {value : value, computed : computed});
  });
  return result.value;
};

// Shuffle an array.
exports.shuffle = function(obj) {
  var rand;
  var index = 0;
  var shuffled = [];
  each(obj, function(value) {
    rand = utils.random(index++);
    shuffled[index - 1] = shuffled[rand];
    shuffled[rand] = value;
  });
  return shuffled;
};

// An internal function to generate lookup iterators.
var lookupIterator = function(value) {
  return objects.isFunction(value) ? value : function(obj){ return obj[value]; };
};

// Sort the object's values by a criterion produced by an iterator.
exports.sortBy = function(obj, value, context) {
  var iterator = lookupIterator(value);
  return exports.pluck(exports.map(obj, function(value, index, list) {
    return {
      value : value,
      index : index,
      criteria : iterator.call(context, value, index, list)
    };
  }).sort(function(left, right) {
    var a = left.criteria;
    var b = right.criteria;
    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }
    return left.index < right.index ? -1 : 1;
  }), 'value');
};

// An internal function used for aggregate "group by" operations.
var group = function(obj, value, context, behavior) {
  var result = {};
  var iterator = lookupIterator(value);
  each(obj, function(value, index) {
    var key = iterator.call(context, value, index, obj);
    behavior(result, key, value);
  });
  return result;
};

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
exports.groupBy = function(obj, value, context) {
  return group(obj, value, context, function(result, key, value) {
    (objects.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });
};

// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
exports.countBy = function(obj, value, context) {
  return group(obj, value, context, function(result, key, value) {
    if (!objects.has(result, key)) result[key] = 0;
    result[key]++;
  });
};

// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
exports.sortedIndex = function(array, obj, iterator, context) {
  iterator = iterator == null ? utils.identity : lookupIterator(iterator);
  var value = iterator.call(context, obj);
  var low = 0, high = array.length;
  while (low < high) {
    var mid = (low + high) >>> 1;
    iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
  }
  return low;
};

// Safely convert anything iterable into a real, live array.
exports.toArray = function(obj) {
  if (!obj) return [];
  if (obj.length === +obj.length) return slice.call(obj);
  return objects.values(obj);
};

// Return the number of elements in an object.
exports.size = function(obj) {
  return (obj.length === +obj.length) ? obj.length : objects.keys(obj).length;
};
