import restArguments from './restArguments.js';
import now from './now.js';

// When a sequence of calls of the returned function ends, the argument
// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.
//
// A common issue with other debounce libraries is that when the user closes
// the browser tab, the debounced function may not have run yet. This is a
// frequent cause of data loss. This implementation prevents that problem by
// running the debounced function immediately if the tab is closed prior to the
// timeout. (Not applicable to Node.js or other headless runtimes.)
//
// When making debounced API calls it is recommended to use `fetch()` with the
// `keepalive` parameter. This allows the HTTP request to finish in the
// background after the user closes the browser tab.
export default function debounce(func, wait, immediate) {
  var timeout, previous, args, result, context;

  var later = function() {
    var passed = now() - previous;
    var pageHidden = global.document && global.document.visibilityState === 'hidden';
    clearTimeout(timeout);
    if (wait <= passed || (!immediate && pageHidden)) {
      if (!immediate && global.document && global.document.removeEventListener) {
        global.document.removeEventListener(
          'visibilityChange',
          later, { capture: true });
      }
      timeout = null;
      if (!immediate) result = func.apply(context, args);
      // This check is needed because `func` can recursively invoke `debounced`.
      if (!timeout) args = context = null;
    } else {
      timeout = setTimeout(later, wait - passed);
    }
  };

  var debounced = restArguments(function(_args) {
    context = this;
    args = _args;
    previous = now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (!immediate && global.document && global.document.addEventListener) {
        global.document.addEventListener(
          'visibilityChange',
          later, { capture: true, passive: true });
      }
      if (immediate) result = func.apply(context, args);
    }
    return result;
  });

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}
