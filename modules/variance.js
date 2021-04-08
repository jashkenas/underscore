import cb from './_cb.js';
import mean from './mean.js';

// https://en.wikipedia.org/wiki/Variance

// Steps to calculate variance
// 1. Average value of the array
// 2. New array is calulated by negating the value with the average value and to the power of 2.
// 3. Average value of the new array is the variance

// Return the variance based on the computation.
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
