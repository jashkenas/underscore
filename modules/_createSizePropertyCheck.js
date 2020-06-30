import { MAX_ARRAY_INDEX } from "./_setup.js";
import isFunction from "./isFunction";

// Common internal logic for `isArrayLike` and `isBufferLike`.
export default function createSizePropertyCheck(getSizeProperty) {
  return function (collection) {
    var sizeProperty = getSizeProperty(collection);
    return (
      !isFunction(collection) &&
      typeof sizeProperty == "number" &&
      sizeProperty >= 0 &&
      sizeProperty <= MAX_ARRAY_INDEX
    );
  };
}
