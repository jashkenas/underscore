import baseCreate from './_baseCreate.js';
import isObject from './isObject.js';

// Determines whether to execute a function as a constructor
// or a normal function with the provided arguments.
export default function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject(result)) return result;
  return self;
}
