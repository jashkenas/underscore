// In Firefox, `Function.prototype.call` is faster than
// `Function.prototype.apply`. In the optimized variant of
// `bindCb` below, we exploit the fact that no Underscore
// function passes more than four arguments to a callback.
// **NOT general enough for use outside of Underscore.**
export default function bindCb4(func, context) {
  if (context === void 0) return func;
  return function(a1, a2, a3, a4) {
    return func.call(context, a1, a2, a3, a4);
  };
}
