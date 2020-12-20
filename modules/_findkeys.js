import cb from './_cb.js';
import keys from './keys.js';

 
function findKeys(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = keys(obj), key;
  var arr = [];
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) {
        arr.push(key);
    }
  }
  return arr;
}