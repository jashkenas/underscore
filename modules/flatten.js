import _flatten from './_flatten.js';

// Flatten out an array, either recursively (by default), or just one level.
export default function flatten(array, shallow) {
  return _flatten(array, shallow, false);
}
