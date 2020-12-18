import isArray from './isArray.js';
import { slice } from './_setup.js';
import isString from './isString.js';
import isArrayLike from './_isArrayLike.js';
import map from './map.js';
import identity from './identity.js';
import values from './values.js';
import isIterable from './_isIterable.js'

// Safely create a real, live array from anything iterable.
var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
export default function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice.call(obj);
  if (isString(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) return map(obj, identity);
  else if (isIterable(obj)) return iteratorToArray(obj[Symbol.iterator]())
  return values(obj);
}

// create an array of iterator's values
function iteratorToArray(iterator) {
  var data,
    result = [];

  while (!(data = iterator.next()).done) {
    result.push(data.value);
  }
  return result;
}