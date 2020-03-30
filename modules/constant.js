// Predicate-generating functions. Often useful outside of Underscore.
export default function constant(value) {
  return function() {
    return value;
  };
}
