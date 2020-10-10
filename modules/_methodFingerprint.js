import isEqual from './isEqual.js';
import functions from './functions.js';

// Since the regular `Object.prototype.toString` type tests don't work for
// some types in IE 11, we use a fingerprinting heuristic instead, based
// on the methods. It's not great, but it's the best we got.
// The fingerprint method lists are defined below.
export function ie11fingerprint(methods) {
  return function(obj) {
    return obj != null && isEqual(functions(obj), methods);
  };
}

// In the interest of compact minification, we write
// each string in the fingerprints only once.
var forEachName = 'forEach',
    hasName = 'has',
    commonInit = ['clear', 'delete'],
    mapTail = ['get', hasName, 'set'];

// `Map`, `WeakMap` and `Set` each have slightly different
// combinations of the above sublists.
export var mapMethods = [commonInit].concat(forEachName, mapTail),
    weakMapMethods = [commonInit].concat(mapTail),
    setMethods = ['add'].concat(commonInit, forEachName, hasName);
