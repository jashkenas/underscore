import restArguments from './restArguments.js';

// An internal function for creating assigner functions.
export default function createAssigner(keysFunc, defaults) {
  return restArguments(function(obj, sources) {
    var length = sources.length;
    if (defaults) obj = Object(obj);
    if (!length || obj == null) return obj;
    for (var index = 0; index < length; index++) {
      var source = sources[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  });
}
