// Internal function that returns a bound version of the
// passed-in callback, used in `_.iteratee`.
export default function bindCb(func, context) {
  if (context === void 0) return func;
  return function() {
    return func.apply(context, arguments);
  };
}
