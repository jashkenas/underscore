import _has from './_has.js';
import toPath from './_toPath.js';
import linearSearch from './_linearSearch.js';

// Shortcut function for checking if an object has a given property directly on
// itself (in other words, not on a prototype). Unlike the internal `has`
// function, this public version can also traverse nested properties.
export default function has(obj, path) {
  path = toPath(path);
  return linearSearch(path, function(key) {
    if (!_has(obj, key)) return true;
    obj = obj[key];
  }) == -1;
}
