import isArrayLike from './_isArrayLike.js';
import values from './values.js';
import cb from './_cb.js';
import each from './each.js';

// Return the sum of elements (or element-based computation).
export default function sum(obj, iteratee, context) {
    if (!iteratee && _.isEmpty(obj)){
        return 0;
    }
  var result = 0;
  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      result += obj[i];
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      result += computed;
    });
  }
  return result;
}
