import group from './_group.js';

// Split a collection into two arrays: one whose elements all satisfy the given
// predicate, and one whose elements all do not satisfy the predicate.
export default group(function(result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true);
