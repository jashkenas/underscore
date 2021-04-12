import cb from './_cb.js';
import mean from './mean.js';

// Return the variance of the numeric elements of the collection,
// optionally after transforming them through `iteratee`.
// https://en.wikipedia.org/wiki/Variance
export default function variance(collection, iteratee, context) {
  if (typeof iteratee == 'number' && collection != null && typeof collection[0] != 'object') iteratee = null;
  
  iteratee = cb(iteratee, context);

  var computed = [];
  var avg = mean(collection, function(value, key, collection) {
    var result = iteratee(value, key, collection);
    computed.push(result);
    return result;
  });
  return mean(computed, function(value) {
    var difference = value - avg;
    return difference * difference;
  });
}
