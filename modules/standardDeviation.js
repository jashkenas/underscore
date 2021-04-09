import variance from './variance.js';

// Return the standardDeviation based on element-based computation.
// https://en.wikipedia.org/wiki/Standard_deviation
export default function standardDeviation(collection, iteratee, context) {
  return Math.sqrt(variance(collection, iteratee, context));
}
