import now from './now.js';

// When a sequence of calls of the returned function ends, the argument
// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.
export default function debounce(func, wait, immediate) {
  var timeout, timestamp, args, result, context;
  var later = function() {
    var last = now() - timestamp;
    if (wait > last) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
    }
  };
// Remove timer for immediate, samme as for throttle
  var debounced = function() {
    var callNow = immediate && !timeout;
    context = this;
    args = [].slice.call(arguments, 0);
    timestamp = now();
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) result = func.apply(context, args);
    return result;
  }

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}
