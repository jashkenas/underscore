var objects = require('./objects'),
    each = require('./common').each;

// Save the previous value of the `_` variable.
if (typeof window !== 'undefined') var previousUnderscore = window._;

// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
// previous owner. Returns a reference to the Underscore object.
exports.noConflict = function() {
  window._ = previousUnderscore;
  return this;
};

// Keep the identity function around for default iterators.
exports.identity = function(value) {
  return value;
};

// Run a function **n** times.
exports.times = function(n, iterator, context) {
  for (var i = 0; i < n; i++) iterator.call(context, i);
};

// Return a random integer between min and max (inclusive).
exports.random = function(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + (0 | Math.random() * (max - min + 1));
};

// List of HTML entities for escaping.
var entityMap = {
  escape: {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
};
entityMap.unescape = objects.invert(entityMap.escape);

// Regexes containing the keys and values listed immediately above.
var entityRegexes = {
  escape:   new RegExp('[' + objects.keys(entityMap.escape).join('') + ']', 'g'),
  unescape: new RegExp('(' + objects.keys(entityMap.unescape).join('|') + ')', 'g')
};

// Functions for escaping and unescaping strings to/from HTML interpolation.
each(['escape', 'unescape'], function(method) {
  exports[method] = function(string) {
    if (string == null) return '';
    return ('' + string).replace(entityRegexes[method], function(match) {
      return entityMap[method][match];
    });
  };
});

// If the value of the named property is a function then invoke it;
// otherwise, return it.
exports.result = function(object, property) {
  if (object == null) return null;
  var value = object[property];
  return objects.isFunction(value) ? value.call(object) : value;
};

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
exports.uniqueId = function(prefix) {
  var id = idCounter++;
  return prefix ? prefix + id : id;
};

// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
exports.templateSettings = {
  evaluate    : /<%([\s\S]+?)%>/g,
  interpolate : /<%=([\s\S]+?)%>/g,
  escape      : /<%-([\s\S]+?)%>/g
};

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'":      "'",
  '\\':     '\\',
  '\r':     'r',
  '\n':     'n',
  '\t':     't',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
exports.template = function(text, data, settings) {
  settings = objects.defaults({}, settings, this.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = new RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset)
      .replace(escaper, function(match) { return '\\' + escapes[match]; });
    source +=
      escape ? "'+\n((__t=(" + escape + "))==null?'':__escape(__t))+\n'" :
      interpolate ? "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'" :
      evaluate ? "';\n" + evaluate + "\n__p+='" : '';
    index = offset + match.length;
  });
  source += "';\n";

  // If a variable is not specified, place data values in local scope.
  if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + "return __p;\n";

  try {
    var render = new Function(settings.variable || 'obj', '__escape', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  if (data) return render(data, exports.escape);
  var template = function(data) {
    return render.call(this, data, exports.escape);
  };

  // Provide the compiled function source as a convenience for precompilation.
  template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

  return template;
};
