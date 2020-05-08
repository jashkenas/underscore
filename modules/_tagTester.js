import { toString } from './_setup.js';

// Internal function for creating a `toString`-based type tester.
export default function tagTester(name) {
  return function(obj) {
    return toString.call(obj) === '[object ' + name + ']';
  };
}
