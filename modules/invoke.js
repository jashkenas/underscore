import restArguments from './restArguments.js';
import isFunction from './isFunction.js';
import last from './last.js';
import map from './map.js';
import getLength from './_getLength.js';
import deepGet from './_deepGet.js';
import toPath from './_toPath.js';

// Invoke a method (with arguments) on every item in a collection.
export default restArguments(function(obj, path, args) {
  var contextPath, func;
  if (isFunction(path)) {
    func = path;
  } else {
    path = toPath(path);
    contextPath = path.slice(0, -1);
    path = last(path);
  }
  return map(obj, function(context) {
    var method = func;
    if (!method) {
      if (getLength(contextPath)) {
        context = deepGet(context, contextPath);
      }
      if (context == null) return void 0;
      method = context[path];
    }
    return method == null ? method : method.apply(context, args);
  });
});
