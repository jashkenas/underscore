import isFunction from './isFunction.js';
import bindCb4 from './_bindCb4.js';
import _ from './underscore.js';
import './iteratee.js';

// The function we call internally to generate a callback: a wrapper
// of `_.iteratee`, which uses `bindCb4` instead of `bindCb` for
// function iteratees. It also saves some bytes in the minified code.
export default function cb(value, context) {
  if (isFunction(value)) return bindCb4(value, context);
  return _.iteratee(value, context);
}
