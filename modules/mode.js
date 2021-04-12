import isEmpty from './isEmpty';
import groupBy from './groupBy.js';
import max from './max.js';
import first from './first.js';

// Return the element (or element-based computation) that appears most frequently in the collection.
// https://en.wikipedia.org/wiki/Mode_(statistics)
export default function mode(collection, iteratee, context) {
  if (isEmpty(collection)) return;
  
  if (typeof iteratee == 'number' && collection != null && typeof collection[0] != 'object') {
    iteratee = null;
  }
  var groups = groupBy(collection, iteratee, context);
  return first(max(groups, 'length'));
}
