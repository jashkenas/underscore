import isArray from './isArray.js';
import deepGet from './_deepGet.js';

// Generates a function for a given object that returns a given property.
export default function propertyOf(obj) {
  if (obj == null) {
    return function(){};
  }
  return function(path) {
    return !isArray(path) ? obj[path] : deepGet(obj, path);
  };
}
