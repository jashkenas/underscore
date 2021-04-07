import isArrayLike from './_isArrayLike.js';
import values from './values.js';
import variance from './variance.js'

// Return the maximum element (or element-based computation).
export default function standardDeviation(obj, iteratee, context) {
    if (!iteratee && _.isEmpty(obj)){
        return 0;
    }
    var result = 0;
  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);
    result = Math.sqrt(variance(obj));
  } else {
    result = Math.sqrt(variance(obj,iteratee,context));
  }

  return result;
}
