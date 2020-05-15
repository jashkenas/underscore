import isArrayLike from './_isArrayLike.js';
import toArray from './toArray.js';
import indexOf from './indexOf.js';

// Determine if the array or object contains a given item (using `===`).
export default function contains(obj, item, fromIndex, guard) {
  if (!isArrayLike(obj)) obj = toArray(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}
