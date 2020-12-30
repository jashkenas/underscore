import getLength from './_getLength.js';
import contains from './contains.js';
import linearSearch from './_linearSearch.js';

// Produce an array that contains every item shared between all the
// passed-in arrays.
export default function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = getLength(array); i < length; i++) {
    var item = array[i];
    if (contains(result, item)) continue;
    if (linearSearch(arguments, function(other) {
      return !contains(other, item);
    }, 1) == -1) result.push(item);
  }
  return result;
}
