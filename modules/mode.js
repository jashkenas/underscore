import isEmpty from './isEmpty';
import groupBy from './groupBy.js';
import max from './max.js';
import first from './first.js';
import isBoolean from './isBoolean';
import map from './map.js'
// Return the element (or element-based computation) that appears most frequently in the collection.
// https://en.wikipedia.org/wiki/Mode_(statistics)
export default function mode(collection, isSorted, iteratee, context) {
  if (isEmpty(collection)) return;
  
  if (typeof iteratee == 'number' && collection != null && typeof collection[0] != 'object') {
    iteratee = null;
  }
  //var groups = groupBy(collection, iteratee, context);
  //return first(max(groups, 'length'));

  var sorted =  map(collection, iteratee, context)
  sorted = isBoolean(isSorted) ? sorted : sorted.sort();

  if (sorted.length === 0) {
      throw new Error("mode requires at least one data point");
  } else if (sorted.length === 1) {
      return sorted[0];
  }
  var last = sorted[0],
      value = NaN,
      maxSeen = 0,
      seenThis = 1;
  for (var i = 1; i < sorted.length + 1; i++) {
      if (sorted[i] !== last) {
          if (seenThis > maxSeen) {
              maxSeen = seenThis;
              value = last;
          }
          seenThis = 1;
          last = sorted[i];
      } else {
          seenThis++;
      }
  }
  return value;
}
