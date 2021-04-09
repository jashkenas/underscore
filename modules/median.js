import map from './map.js'
import isNumber from './isNumber.js';
import isEmpty from './isEmpty';

// https://en.wikipedia.org/wiki/Median
// Return the median element (or element-based computation).
// First arrays is sorted in ascending order
// Then middle element is the median in the given array
// Calulation of median is done using the following method;

/* Odd elements
   If the array has odd numbers then median is the middle element
*/

/* Even elements
   If the array has even numbers then average of middle two numbers is the median value
*/
export default function median(collection, iteratee, context) {
  if (isEmpty(collection)) return undefined;

  if (typeof iteratee == 'number' && collection != null && typeof collection[0] != 'object') {
    iteratee = null;
  }
  var tmpArr = map(collection, iteratee, context).sort();

  return tmpArr.length % 2 ?
             tmpArr[Math.floor(tmpArr.length / 2)] : 
                 (tmpArr[tmpArr.length / 2 - 1] + tmpArr[tmpArr.length / 2]) / 2
}
