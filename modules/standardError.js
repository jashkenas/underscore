import variance from './variance.js';
import size from './size.js';

//https://en.wikipedia.org/wiki/Standard_error

// Square root of variance divided by the number of elements (length -1)
// Variance is calulation can go through the variance function for description (https://en.wikipedia.org/wiki/Variance)

// Return the standardError based on element-based computation.
export default function standardError(collection, iteratee, context) {
    return Math.sqrt(variance(collection, iteratee, context)/(size(collection) - 1));
}
