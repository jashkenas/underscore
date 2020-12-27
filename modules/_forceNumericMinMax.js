import isNaN from './isNaN.js';

// Internal `extremum` return value adapter for `_.min` and `_.max`.
// Ensures that a number is returned even if no element of the
// collection maps to a numeric value.
export function decideNumeric(fallback) {
  return function(result, iterResult) {
    return isNaN(+iterResult) ? fallback : result;
  }
}
