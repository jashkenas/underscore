import _ from './underscore.js';
import iteratee from './iteratee.js';

// The function we call internally to generate a callback. It is just a
// shorthand to save some bytes in the minified code.
export default function cb(value, context) {
  return _.iteratee(value, context);
}
