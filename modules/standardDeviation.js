import variance from './variance.js';

// https://en.wikipedia.org/wiki/Standard_deviation

// Suare root of the variance value
// Variance is calulation can go through the variance function for description (https://en.wikipedia.org/wiki/Variance)
// Return the standardDeviation based on element-based computation.

export default function standardDeviation(collection, iteratee, context) {
  return Math.sqrt(variance(collection, iteratee, context));
}
