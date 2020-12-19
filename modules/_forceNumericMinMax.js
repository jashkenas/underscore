import isNaN from './isNaN.js';

// Internal comparison adapter for `_.min` and `_.max`.
// Only considers numeric values as possible extremes.
export function compareNumeric(compare) {
  return function(left, right) {
    if (right == null || +right !== +right) return true;
    return left != null && compare(+left, +right);
  }
}

// Internal `extremum` return value adapter for `_.min` and `_.max`.
// Ensures that a number is returned even if no element of the
// collection maps to a numeric value.
export function decideNumeric(fallback) {
  return function(result, iterResult) {
    return isNaN(+iterResult) ? fallback : result;
  }
}
