import isArrayLike from './_isArrayLike.js';
import values from './values.js';
import sortBy from './sortBy.js'

// Return the maximum element (or element-based computation).
export default function mode(obj, iteratee, context) {
    if (!iteratee && _.isEmpty(obj)){
        return 0;
    }
    var result = 0;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
        obj = isArrayLike(obj) ? obj : values(obj);
        obj = sortBy(obj);
    }else{
        obj = sortBy(tmpObj,iteratee,context);
    }
    var bestStreak = 1;
    var bestElem = obj[0];
    var currentStreak = 1;
    var currentElem = obj[0];
    for (var i = 1; i < obj.length; i++) {
      if (obj[i-1] !== obj[i]) {
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
          bestElem = currentElem;
        }
        currentStreak = 0;
        currentElem = obj[i];
      }

      currentStreak++;
    }
    result = currentStreak > bestStreak ? currentElem : bestElem;
    return result
}