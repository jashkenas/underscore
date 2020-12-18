import getIterator from './_getIterator.js';
import isFunction from './isFunction.js';
// Internal function to check if `obj` is iterable.
export default function isIterable(obj) {
  return isFunction(getIterator(obj));
}