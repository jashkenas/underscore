import times from './times.js';
import getLength from './_getLength.js';
import { slice } from './_setup.js';

// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
export default function chunk(array, count) {
  if (count == null || count < 1) return [];
  return times(Math.ceil(getLength(array) / count), function(index) {
    var offset = index * count;
    return slice.call(array, offset, offset + count);
  });
}
