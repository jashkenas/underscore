import isArrayLike from './_isArrayLike.js';
import values from './values.js';
import cb from './_cb.js';
import each from './each.js';
import clone from './clone.js'
import isNumber from './isNumber.js'

// Return the median element (or element-based computation).
export default function median(obj, iteratee, context) {
    if (!iteratee && _.isEmpty(obj)){
        return 0;
    }
  var tmpObj = [];
  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);
    tmpObj = clone(obj);
    tmpObj.sort(function(f,s){return f-s;});
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      tmpObj.push(iteratee ? computed : v);
      tmpObj.sort();
    });
  }

  return tmpObj.length%2 ? tmpObj[Math.floor(tmpObj.length/2)] : (isNumber(tmpObj[tmpObj.length/2-1]) && isNumber(tmpObj[tmpObj.length/2])) ? (tmpObj[tmpObj.length/2-1]+tmpObj[tmpObj.length/2]) /2 : tmpObj[tmpObj.length/2-1];
}
