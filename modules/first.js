import getLength from './_getLength.js';
import initial from './initial.js';

// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `_.map`.
export default function first(array, n, guard) {
  var len = getLength(array);
  var singleton = (n == null || guard);
  if (array == null || len < 1) return singleton ? void 0 : [];
  return singleton ? array[0] : initial(array, len - n);
}
