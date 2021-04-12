import map from './map.js'
import isEmpty from './isEmpty';

// https://en.wikipedia.org/wiki/Median
// Calulation of median is done using the following method.
// If the array has odd numbers then median is the middle element.
// If the array has even numbers then average of middle two numbers is the median value.
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
