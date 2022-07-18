import isArray from './isArray.js';
import isObject from './isObject.js';
import _set from './_set.js';


export default function set (obj, path, value) {
  if (!isObject(obj) || !isArray(path)) return obj;
  if (path.length === 0) return obj;

  _set(obj, path, value);

  return obj;
}
