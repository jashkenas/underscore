import chain from './chain.js';

// Helper function to continue chaining intermediate results.
export default function chainResult(instance, obj) {
  return instance._chain ? chain(obj) : obj;
}
