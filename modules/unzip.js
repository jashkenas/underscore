import max from './max.js';
import getLength from './_getLength.js';
import times from './times.js';
import pluck from './pluck.js';

// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
export default function unzip(array) {
  var length = array && max(array, getLength).length || 0;
  return times(length, function(index) {
    return pluck(array, index);
  });
}
