import isArray from './isArray.js';
import shallowProperty from './_shallowProperty.js';
import deepGet from './_deepGet.js';

// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indices.
export default function property(path) {
  if (!isArray(path)) {
    return shallowProperty(path);
  }
  return function(obj) {
    return deepGet(obj, path);
  };
}
