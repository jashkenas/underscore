import chain from './chain.js';

// Helper function to continue chaining intermediate results.
export default function chainResult(instance, obj) {
  // Use the standalone `chain` rather than `_(obj).chain()`. When `obj` is
  // already a wrapped instance (as returned by `_.chain`), `_(obj)` yields the
  // same wrapper and the prototype `chain` method would re-enter `chainResult`
  // indefinitely, overflowing the stack (e.g. `_.chain([1]).chain()`).
  return instance._chain ? chain(obj) : obj;
}
