import isArrayLike from './_isArrayLike.js';
import clone from './clone.js';
import values from './values.js';
import getLength from './_getLength.js';
import random from './random.js';

// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `_.map`.
export default function sample(obj, n, guard) {
  var sample = isArrayLike(obj) ? null : values(obj);
  obj = sample || obj;
  var length = getLength(obj);
  if (n == null || guard) return obj[random(length - 1)];
  sample = sample || clone(obj);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;
  for (var index = 0; index < n; index++) {
    var rand = random(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
}
