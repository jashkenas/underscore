import isEmpty from './isEmpty';
import groupBy from './groupBy.js';
import max from './max.js';
import first from './first.js';

// https://en.wikipedia.org/wiki/Mode_(statistics)
// Mode is the value that appears most number of times in an array;

// Array is sorted and traversed to find the most frequent element in the array
// Return the mode element (or element-based computation).
export default function mode(collection, iteratee, context) {
  if (isEmpty(collection)) return;
  
  if (typeof iteratee == 'number' && collection != null && typeof collection[0] != 'object') {
    iteratee = null;
  }
  var groups = groupBy(collection, iteratee, context);
  return first(max(groups, 'length'));
}
