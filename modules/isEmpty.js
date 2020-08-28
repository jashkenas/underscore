import isArrayLike from './_isArrayLike.js';
import isArray from './isArray.js';
import isString from './isString.js';
import isArguments from './isArguments.js';
import keys from './keys.js';

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
export default function isEmpty(obj) {
  if (obj == null) return true;
  // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.
  if (isArrayLike(obj) && (isArray(obj) || isString(obj) || isArguments(obj))) return obj.length === 0;
  return keys(obj).length === 0;
}
