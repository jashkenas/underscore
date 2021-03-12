import isArrayLike from './_isArrayLike.js';
import isArray from './isArray.js';
import isString from './isString.js';
import isArguments from './isArguments.js';
import getLength from './_getLength.js';
import keys from './keys.js';

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
export default function isEmpty(obj) {
  if (obj == null) return true;
  // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.
  if (isArrayLike(obj) && (
    isArray(obj) || isString(obj) || isArguments(obj)
  )) return !getLength(obj);
  return !getLength(keys(obj));
}
