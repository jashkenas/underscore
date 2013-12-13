This is a proposal to refine the _ documentation by:
1) Adding subcategories, eg, Collections/Filters.
2) Adding types for args & return values.

Since editing index.html is a lot of work, I'm soliciting feedback on the proposal below.

# Collections

# length; convert to array
int size(list) # array length or #kv
array toArray(list) # If an object, equivalent to values().

# loop
void forEach/each(list, void f(item, indexOrKey, list), [context])

# MapReduce
# map
array collect/map(list, void f(value, [key], [list]), [context])
array invoke(list, String functionName, [*arguments])
# reduce
value inject/foldl/reduce(list, f(memo, value, indexOrKey, list), memo, [context])
# scan array backwards
value foldr/reduceRight(list, f(memo, value, indexOrKey, list), memo, [context])

# numerical
number max(list, [number f(value)], [context])
number min(list, [number f(value)], [context])

# filter
# by predicate
item detect/find(list, bool f(value, indexOrKey, list), [context])
array select/filter(list, bool f(value, indexOrKey, list), [context])
array reject(list, bool f(value, indexOrKey, list), [context])
# by kv
array where(object, kv)
item findWhere(object, kv)
# by random
array = sample(array, [n]) # TODO This should be in the array category.

# predicates
bool all/every(list, [bool f(value, indexOrKey, list)], [context])
bool any/some(list, [bool f(value, indexOrKey, list)], [context])
bool include/contains(list, value)

# reordering
array pluck(list<object>, key)
array sortBy(list, val f(item), [context])
array shuffle(array) # TODO This should be in the array category.

# grouping
object groupBy(list, group f(item), [context])
object indexBy(list, uniqueGroup f(item), [context])
# histogram
object countBy(list, group f(item), [context])

# Arrays

# head/tail
array[0] head/take/first(array)
array head/take/first(array, n)
array initial(array, [n])
array[length - 1] last(array)
array last(array, n)
array tail/drop/rest(array, [index])

# filter
array compact(array) # strip falsy's
array without(array, [*values])
array uniq(array, [bool isSorted], [val f(item)])

# logical
array union(*arrays)
array intersection(*arrays)
array difference(array, *others)

# reorganize
array flatten(array, [bool shallow])
array zip(*arrays)

# object factory
object object([key, val], ...)
object object([key1, ...], [val1, ...])

# array factory
array range([start], stop, [step])

# search
index indexOf(array, val, [bool isSorted])
index lastIndexOf(array, val, [bool isSorted])
index sortedIndex(array, val, [rank f(item)], [context])

# Functions

# function wrappers
bind(f, object, [*arguments]) # return new f s.t. this == object & arguments are passed
bindAll(object, *methodNames) # similar to each(methodNames, f(methodName) { bind(method, object); })
memoize(f, [hashFunction])
partial(f, [*arguments]) # add5 = partial(add, 5)
throttle(f, millisec, [options]) # options are bool leading & trailing.
debounce(f, millisec, [immediate])
once(f)
after(count, f)
wrap(f, wrapper)
compose(*functions)

# setTimeout
delay(f, millisec, [*arguments]) # slow partial
defer(f, [*arguments]) # execute partial at top level

# Objects

# kv
array keys(object)
array values(object)
array<String> = methods/functions(object)
bool has(object, key)
[[key1, val1], ...] pairs(object)
{val1: key1, ...} invert({key1: val1, ...})

# copy
object clone(object) # shallow

# augment
# append missing & override present
extend(destination, *sources)
# append missing
defaults(object, *defaults)

# predicate
bool isEqual(object, other)
bool isEmpty(object) # don't pass it a String
bool isNull(object)

# type predicates
bool isUndefined(val)
# number
bool isNumber(object)
bool isNan(object)
bool isFinite(object)
# other primitives
bool isString(object)
bool isBoolean(object)
bool isDate(object)
bool isRegExp(object)
bool isElement(object) # DOM elt
# collections
bool isArray(object)
bool isObject(val)
bool isArguments(object)
# func
bool isFunction(object)

# filter
pick(object, *keys)
omit(object, *keys)

# chain
object tap(object, f(object))

# Utility

# numerical
val random(max)
val random(min, max)

# string
string uniqueId([prefix])
func template(templateString) # ERB-style <% ... %> but can be customized
string func(bindings) # supports iteration

# HTML
string escape(string)
string unescape(string)

# misc
[val1, ..., valn] times(n, val f(index), [context])

# _
var underscore = _.noConflict();
mixin({ key: function() ..., ...}) # extend

# Chaining

_.map([1, 2, 3], ...) # functional
or:
_([1, 2, 3].map(...) # OO

chain(object) # begin the chain
val value() # end the chain
