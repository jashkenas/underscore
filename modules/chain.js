import _ from './underscore.js';

// Add a "chain" function. Start chaining a wrapped Underscore object.
export default function chain(obj) {
  var instance = _(obj);
  instance._chain = true;
  return instance;
}
