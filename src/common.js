var ArrayProto = Array.prototype,
    nativeForEach = ArrayProto.forEach;

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

// Keep the identity function around for default iterators.
exports.identity = function(value) {
  return value;
};
