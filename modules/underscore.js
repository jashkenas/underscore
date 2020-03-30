import { VERSION } from './_setup.js';

// The Underscore object. All exported functions are added to it in the
// underscore-module.js using the mixin function.
export default function _(obj) {
  if (obj instanceof _) return obj;
  if (!(this instanceof _)) return new _(obj);
  this._wrapped = obj;
}

_.VERSION = VERSION;
