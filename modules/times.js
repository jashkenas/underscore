import bindCb4 from './_bindCb4.js';

// Run a function **n** times.
export default function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = bindCb4(iteratee, context);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}
