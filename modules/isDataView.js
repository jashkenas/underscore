import tagTester from './_tagTester.js';
import isArrayBuffer from './isArrayBuffer.js';
import { hasStringTagBug } from './_stringTagBug.js';

var isDataView = tagTester('DataView');

// In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.
function ie10IsDataView(obj) {
  return (
    obj != null &&
    typeof obj.getInt8 == 'function' &&
    isArrayBuffer(obj.buffer)
  );
}

export default (hasStringTagBug ? ie10IsDataView : isDataView);
