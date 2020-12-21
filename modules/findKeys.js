import cb from './_cb.js';
import keys from './keys.js';

// Returns the first key on an object that passes a truth test.
export default function findKeys(obj, predicate, context) {
  predicate = cb(predicate, context);
  var result = [];
  var _keys = keys(obj), key;
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) result.push(key);
  }
  return result
}
