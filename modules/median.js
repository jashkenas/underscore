import map from './map.js'
import isNumber from './isNumber.js';
import isEmpty from './isEmpty';

// https://en.wikipedia.org/wiki/Median
// Return the median element (or element-based computation).
// First arrays is sorted in ascending order
// Then middle element is the median in the given array
// Calulation of median is done using the following method;

/* Odd elements
   If the array has odd numbers then value is the middle element
   example: [1,2,3,4,5,6,7]
   length: 7
   middle value: (length+1)/2 = 4
   median : array[4] = 4
*/

/* Even elements
   If the array has odd numbers then value is the middle element
   example: [1,5,5,8,10,12,13,15]
   length: 8
   middle value: ((length/2) + ((length/2)+1))/2  = 
   median : (8+10)/2 = 9
*/
export default function median(collection, iteratee, context) {
  if (isEmpty(collection)) return undefined;

  if (typeof iteratee == 'number' && collection != null && typeof collection[0] != 'object') {
    iteratee = null;
  }
  var tmpArr = map(collection, iteratee, context).sort();

  return tmpArr.length%2 ?
             tmpArr[Math.floor(tmpArr.length/2)] : 
            (isNumber(tmpArr[tmpArr.length/2-1]) && isNumber(tmpArr[tmpArr.length/2])) ?
                 (tmpArr[tmpArr.length/2-1]+tmpArr[tmpArr.length/2]) /2 : 
                 tmpArr[tmpArr.length/2-1];
}
