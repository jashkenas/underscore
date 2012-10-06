var ArrayProto = Array.prototype,
    nativeForEach = ArrayProto.forEach,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf;


// Establish the object that gets returned to break out of a loop iteration.
var breaker = exports.breaker = {};

// The cornerstone, an `each` implementation, aka `forEach`.
// Handles objects with the built-in `forEach`, arrays, and raw objects.
// Delegates to **ECMAScript 5**'s native `forEach` if available.
var each = exports.each = function(obj, iterator, context) {
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) return;
    }
  } else {
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) return;
      }
    }
  }
};

// Determine if the array or object contains a given value (using `===`).
// Aliased as `include`.
exports.contains = function(obj, target) {
  var found = false;
  if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
  found = any(obj, function(value) {
    return value === target;
  });
  return found;
};

// Determine if at least one element in the object matches a truth test.
// Delegates to **ECMAScript 5**'s native `some` if available.
// Aliased as `any`.
var any = exports.any = function(obj, iterator, context) {
  iterator || (iterator = exports.identity);
  var result = false;
  if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
  each(obj, function(value, index, list) {
    if (result || (result = iterator.call(context, value, index, list))) return breaker;
  });
  return !!result;
};

// Keep the identity function around for default iterators.
exports.identity = function(value) {
  return value;
};
