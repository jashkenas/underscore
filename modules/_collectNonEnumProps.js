import { nonEnumerableProps, ObjProto } from './_setup.js';
import isFunction from './isFunction.js';
import has from './_has.js';
import contains from './contains.js';

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
export default function collectNonEnumProps(obj, keys) {
  var nonEnumIdx = nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = isFunction(constructor) && constructor.prototype || ObjProto;

  // Constructor is a special case.
  var prop = 'constructor';
  if (has(obj, prop) && !contains(keys, prop)) keys.push(prop);

  while (nonEnumIdx--) {
    prop = nonEnumerableProps[nonEnumIdx];
    if (prop in obj && obj[prop] !== proto[prop] && !contains(keys, prop)) {
      keys.push(prop);
    }
  }
}
