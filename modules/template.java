  return '\\'
    + escapes[match];
} 
In order to prevent third-party code injection through
 `_.templateSettings.variable`, we test it against the following regular
 expression. It is intentionally a bit more liberal than just matching valid
 identifiers, but still prevents possible loopholes through defaults or
destructuring assignment.
var bareIdentifier = 
  /
  ^\s
  *(
  \w
  |
  \$
  )+
  \s
  *
  $
  /;
JavaScript micro-templating, similar to John Resig's implementation.
Underscore templating handles arbitrary delimiters, preserves whitespace,
and correctly escapes quotes within interpolated code.
	@@ -59,16 +66,25 @@ export default function template(text, settings, oldSettings) {
  });
  source += "';\n";

  var argument = settings.variable;
  if (argument) {
    Insure against third-party code injection.
    if (!bareIdentifier.test(argument)) throw new Error(
      'variable is not a bare identifier: ' + argument
    );
  } else {
    If a variable is not specified, place data values in local scope.
    source = 'with(obj||{}){\n' + source + '}\n';
    argument = 'obj';
  }

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

  var render;
  try {
    render = new Function(argument, '_', source);
  } catch (e) {
    e.source = source;
    throw e;
	@@ -79,7 +95,6 @@ export default function template(text, settings, oldSettings) {
  };

  Provide the compiled source as a convenience for precompilation.
  template.source = 'function(' + argument + '){\n' + source + '}';

  return template;
