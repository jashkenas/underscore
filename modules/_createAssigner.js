// An internal function for creating assigner functions.
export default function createAssigner(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) {
          if (key === '__proto__') {
            // Assigning through `obj[key] = ...` would invoke the
            // `Object.prototype` setter and replace the destination's
            // prototype instead of copying the key. Define the property
            // directly so `__proto__` is copied as an own property.
            Object.defineProperty(obj, key, {
              value: source[key],
              enumerable: true,
              configurable: true,
              writable: true
            });
          } else {
            obj[key] = source[key];
          }
        }
      }
    }
    return obj;
  };
}
