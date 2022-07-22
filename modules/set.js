import isObject from './isObject.js';
import toPath from './_toPath.js';
import contains from './contains.js';


var arrayIndex = /^\d+$/;

// Internal function of `set`.
function deepSet(obj, path, value) {
  var key = path[0];

  if (path.length === 1) {
    obj[key] = value;
    return;
  }

  if (!isObject(obj[key])) {
    var nextKey = path[1];
    obj[key] = arrayIndex.test(nextKey) ? [] : {};
  }

  return deepSet(obj[key], path.slice(1), value);
}

// Set the value on `path` of `object`.
// If any property in `path` does not exist it will be created.
// Returns mutated object (the first argument `obj`).
export default function set(obj, path, value) {
  path = toPath(path);

  if (!isObject(obj) || !path.length) return obj;
  if (contains(path, '__proto__')) throw new Error('Prototype assignment attempted');

  deepSet(obj, path, value);

  return obj;
}
