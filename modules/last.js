import getLength from './_getLength.js';
import rest from './rest.js';

// Get the last element of an array. Passing **n** will return the last N
// values in the array.
export default function last(array, n, guard) {
  var len = getLength(array);
  var singleton = (n == null || guard);
  if (array == null || len < 1) return singleton ? void 0 : [];
  return singleton ? array[len - 1] : rest(array, Math.max(0, len - n));
}
