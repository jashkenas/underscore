import cb from './_cb.js';
import negate from './negate.js';
import some from './some.js';

// Determine whether all of the elements pass a truth test.
export default function every(obj, predicate, context) {
  return !some(obj, negate(cb(predicate, context)));
}
