### 1.6.0 (February 10, 2014)  compare:1.5.2...1.6.0

  - Underscore now registers itself for AMD (Require.js), Bower and Component,
    as well as being a CommonJS module and a regular (Java)Script. An ugliness,
    but perhaps a necessary one.

  - Added `_.partition`, a way to split a collection into two lists of results
    -- those that pass and those that fail a particular predicate.

  - Added `_.property`, for easy creation of iterators that pull specific
    properties from objects. Useful in conjunction with other Underscore
    collection functions.

  - Added `_.matches`, a function that will give you a predicate that can
    be used to tell if a given object matches a list of specified key/value
    properties.

  - Added `_.constant`, as a higher-order `_.identity`.

  - Added `_.now`, an optimized way to get a timestamp -- used internally to
    speed up `debounce` and `throttle`.

  - The `_.partial` function may now be used to partially apply any of its
    arguments, by passing `_` wherever you'd like a placeholder variable, to
    be filled-in later.

  - The `_.each` function now returns the original iterated list (just like it
    used to), for better chaining.

  - ... and more miscellaneous refactoring.
