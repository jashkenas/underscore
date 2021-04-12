import variance from './variance.js';
import size from './size.js';

// Return the standard error of the mean based on element-based computation.
// https://en.wikipedia.org/wiki/Standard_error
export default function standardError(collection, iteratee, context) {
    return Math.sqrt(variance(collection, iteratee, context)/(size(collection) - 1));
}
