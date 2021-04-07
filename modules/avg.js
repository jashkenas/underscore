import isArrayLike from './_isArrayLike.js';
import values from './values.js';
import sum from './sum.js'

// Return the average element (or element-based computation).
export default function mean(obj, iteratee, context) {
    if (!iteratee && _.isEmpty(obj)){
        return 0;
    }
  var result = 0;
  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);
    result = sum(obj)/obj.length;
  } else {
    result = sum(obj, iteratee, context)/obj.length
  }
  return result;
}
