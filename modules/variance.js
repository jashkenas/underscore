import isArrayLike from './_isArrayLike.js';
import values from './values.js';
import cb from './_cb.js';
import each from './each.js';
import mean from './avg.js'

// Return the maximum element (or element-based computation).
export default function variance(obj, iteratee, context) {
  if (!iteratee && _.isEmpty(obj)){
      return 0;
  }
  var result = 0;
  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);
    var avg = mean(obj);
    var squareDiffs = obj.map(function(value){
        return (value - avg) * (value - avg);;
    });
    result = mean(squareDiffs);
  } else {
    var tmpObj;
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      tmpObj.push(iteratee ? computed : v);
    });
    var avg = mean(tmpObj);
    var squareDiffs = tmpObj.map(function(value){
        return (value - avg) * (value - avg);;
    });
    result = mean(squareDiffs);
  }
  return result;
}
