var collections = require('./collections'),
    objects = require('./objects'),
    each = collections.each,
    ArrayProto = Array.prototype,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    push = ArrayProto.push,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat;

// Get the first element of an array. Passing **n** will return the first N
// values in the array. Aliased as `head` and `take`. The **guard** check
// allows it to work with `_.map`.
exports.first = exports.head = exports.take = function(array, n, guard) {
  return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
};

// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N. The **guard** check allows it to work with
// `_.map`.
exports.initial = function(array, n, guard) {
  return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
};

// Get the last element of an array. Passing **n** will return the last N
// values in the array. The **guard** check allows it to work with `_.map`.
exports.last = function(array, n, guard) {
  if ((n != null) && !guard) {
    return slice.call(array, Math.max(array.length - n, 0));
  } else {
    return array[array.length - 1];
  }
};

// Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
// Especially useful on the arguments object. Passing an **n** will return
// the rest N values in the array. The **guard**
// check allows it to work with `_.map`.
exports.rest = exports.tail = exports.drop = function(array, n, guard) {
  return slice.call(array, (n == null) || guard ? 1 : n);
};

// Trim out all falsy values from an array.
exports.compact = function(array) {
  return collections.filter(array, function(value){ return !!value; });
};

// Internal implementation of a recursive `flatten` function.
var flatten = function(input, shallow, output) {
  each(input, function(value) {
    if (objects.isArray(value)) {
      shallow ? push.apply(output, value) : flatten(value, shallow, output);
    } else {
      output.push(value);
    }
  });
  return output;
};

// Return a completely flattened version of an array.
exports.flatten = function(array, shallow) {
  return flatten(array, shallow, []);
};

// Return a version of the array that does not contain the specified value(s).
exports.without = function(array) {
  return exports.difference(array, slice.call(arguments, 1));
};

// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// Aliased as `unique`.
exports.uniq = exports.unique = function(array, isSorted, iterator, context) {
  var initial = iterator ? collections.map(array, iterator, context) : array;
  var results = [];
  var seen = [];
  each(initial, function(value, index) {
    if (isSorted ? (!index || seen[seen.length - 1] !== value) : !collections.contains(seen, value)) {
      seen.push(value);
      results.push(array[index]);
    }
  });
  return results;
};

// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
exports.union = function() {
  return exports.uniq(concat.apply(ArrayProto, arguments));
};

// Produce an array that contains every item shared between all the
// passed-in arrays.
exports.intersection = function(array) {
  var rest = slice.call(arguments, 1);
  return collections.filter(exports.uniq(array), function(item) {
    return collections.every(rest, function(other) {
      return exports.indexOf(other, item) >= 0;
    });
  });
};

// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
exports.difference = function(array) {
  var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
  return collections.filter(array, function(value){ return !collections.contains(rest, value); });
};

// Zip together multiple lists into a single array -- elements that share
// an index go together.
exports.zip = function() {
  var args = slice.call(arguments);
  var length = collections.max(collections.pluck(args, 'length'));
  var results = new Array(length);
  for (var i = 0; i < length; i++) {
    results[i] = collections.pluck(args, "" + i);
  }
  return results;
};

// Converts lists into objects. Pass either a single array of `[key, value]`
// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values.
exports.object = function(list, values) {
  var result = {};
  for (var i = 0, l = list.length; i < l; i++) {
    if (values) {
      result[list[i]] = values[i];
    } else {
      result[list[i][0]] = list[i][1];
    }
  }
  return result;
};

// If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
// we need this function. Return the position of the first occurrence of an
// item in an array, or -1 if the item is not included in the array.
// Delegates to **ECMAScript 5**'s native `indexOf` if available.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
exports.indexOf = function(array, item, isSorted) {
  var i = 0, l = array.length;
  if (isSorted) {
    if (typeof isSorted == 'number') {
      i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
    } else {
      i = collections.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
  }
  if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
  for (; i < l; i++) if (array[i] === item) return i;
  return -1;
};

// Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
exports.lastIndexOf = function(array, item, from) {
  var hasIndex = from != null;
  if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
    return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
  }
  var i = (hasIndex ? from : array.length);
  while (i--) if (array[i] === item) return i;
  return -1;
};

// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](http://docs.python.org/library/functions.html#range).
exports.range = function(start, stop, step) {
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
