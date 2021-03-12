import _ from './underscore.js';
import identity from './identity.js';
import isFunction from './isFunction.js';
import isObject from './isObject.js';
import bindCb from './_bindCb.js';
import isArray from './isArray.js';
import matcher from './matcher.js';
import property from './property.js';

// A function to generate callbacks that can be applied to each element in a
// collection, returning the desired result — either `identity`, an arbitrary
// callback, a property matcher, or a property accessor. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
export default function iteratee(value, context) {
  if (value == null) return identity;
  if (isFunction(value)) return bindCb(value, context);
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}
_.iteratee = iteratee;
