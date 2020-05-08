import { VERSION } from './_setup.js';

// If Underscore is called as a function, it returns a wrapped object that
// can be used OO-style. This wrapper holds altered versions of all the
// underscore functions. Wrapped objects may be chained.
//
// Unwrapping methods and `Array.prototype` methods are added in the
// `underscore-oop.js` module. All public Underscore functions are added to it
// in the `index-default.js` using the `_.mixin` function.
export default function _(obj) {
  if (obj instanceof _) return obj;
  if (!(this instanceof _)) return new _(obj);
  this._wrapped = obj;
}

_.VERSION = VERSION;
