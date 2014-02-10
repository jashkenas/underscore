var tape = require('tape');
var _ = require('../underscore');

(function() {

  var templateSettings;

  var test = function(name, options, callback) {
    if (!callback) {
      callback = options;
      options = null;
    }
    tape(name, options, function(t) {
      templateSettings = _.clone(_.templateSettings);
      callback(t);
      _.templateSettings = templateSettings;
    });
  };

  test('#750 - Return _ instance.', 2, function(t) {
    var instance = _([]);
    t.ok(_(instance) === instance);
    t.ok(new _(instance) === instance);
    t.end();
  });

  test('identity', function(t) {
    var moe = {name : 'moe'};
    t.is(_.identity(moe), moe, 'moe is the same as his identity');
    t.end();
  });

  test('constant', function(t) {
    var moe = {name : 'moe'};
    t.is(_.constant(moe)(), moe, 'should create a function that returns moe');
    t.end();
  });

  test('property', function(t) {
    var moe = {name : 'moe'};
    t.is(_.property('name')(moe), 'moe', 'should return the property with the given name');
    t.end();
  });

  test('random', function(t) {
    var array = _.range(1000);
    var min = Math.pow(2, 31);
    var max = Math.pow(2, 62);

    t.ok(_.every(array, function() {
      return _.random(min, max) >= min;
    }), 'should produce a random number greater than or equal to the minimum number');

    t.ok(_.some(array, function() {
      return _.random(Number.MAX_VALUE) > 0;
    }), 'should produce a random number when passed `Number.MAX_VALUE`');
    t.end();
  });

  test('now', function(t) {
    var diff = _.now() - new Date().getTime();
    t.ok(diff <= 0 && diff > -5, 'Produces the correct time in milliseconds');//within 5ms
    t.end();
  });

  test('uniqueId', function(t) {
    var ids = [], i = 0;
    while(i++ < 100) ids.push(_.uniqueId());
    t.is(_.uniq(ids).length, ids.length, 'can generate a globally-unique stream of ids');
    t.end();
  });

  test('times', function(t) {
    var vals = [];
    _.times(3, function (i) { vals.push(i); });
    t.ok(_.isEqual(vals, [0,1,2]), 'is 0 indexed');
    //
    vals = [];
    _(3).times(function(i) { vals.push(i); });
    t.ok(_.isEqual(vals, [0,1,2]), 'works as a wrapper');
    // collects return values
    t.ok(_.isEqual([0, 1, 2], _.times(3, function(i) { return i; })), 'collects return values');

    t.same(_.times(0, _.identity), []);
    t.same(_.times(-1, _.identity), []);
    t.same(_.times(parseFloat('-Infinity'), _.identity), []);
    t.end();
  });

  test('mixin', function(t) {
    _.mixin({
      myReverse: function(string) {
        return string.split('').reverse().join('');
      }
    });
    t.is(_.myReverse('panacea'), 'aecanap', 'mixed in a function to _');
    t.is(_('champ').myReverse(), 'pmahc', 'mixed in a function to the OOP wrapper');
    t.end();
  });

  test('_.escape', function(t) {
    t.is(_.escape('Curly & Moe'), 'Curly &amp; Moe');
    t.is(_.escape('<a href="http://moe.com">Curly & Moe\'s</a>'), '&lt;a href=&quot;http://moe.com&quot;&gt;Curly &amp; Moe&#x27;s&lt;/a&gt;');
    t.is(_.escape('Curly &amp; Moe'), 'Curly &amp;amp; Moe');
    t.is(_.escape(null), '');
    t.end();
  });

  test('_.unescape', function(t) {
    var string = 'Curly & Moe';
    t.is(_.unescape('Curly &amp; Moe'), string);
    t.is(_.unescape('&lt;a href=&quot;http://moe.com&quot;&gt;Curly &amp; Moe&#x27;s&lt;/a&gt;'), '<a href="http://moe.com">Curly & Moe\'s</a>');
    t.is(_.unescape('Curly &amp;amp; Moe'), 'Curly &amp; Moe');
    t.is(_.unescape(null), '');
    t.is(_.unescape(_.escape(string)), string);
    t.end();
  });

  test('template', function(t) {
    var basicTemplate = _.template("<%= thing %> is gettin' on my noives!");
    var result = basicTemplate({thing : 'This'});
    t.is(result, "This is gettin' on my noives!", 'can do basic attribute interpolation');

    var sansSemicolonTemplate = _.template('A <% this %> B');
    t.is(sansSemicolonTemplate(), 'A  B');

    var backslashTemplate = _.template('<%= thing %> is \\ridanculous');
    t.is(backslashTemplate({thing: 'This'}), 'This is \\ridanculous');

    var escapeTemplate = _.template('<%= a ? "checked=\\"checked\\"" : "" %>');
    t.is(escapeTemplate({a: true}), 'checked="checked"', 'can handle slash escapes in interpolations.');

    var fancyTemplate = _.template('<ul><% \
      for (var key in people) { \
    %><li><%= people[key] %></li><% } %></ul>');
    result = fancyTemplate({people : {moe : 'Moe', larry : 'Larry', curly : 'Curly'}});
    t.is(result, '<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>', 'can run arbitrary javascript in templates');

    var escapedCharsInJavascriptTemplate = _.template('<ul><% _.each(numbers.split("\\n"), function(item) { %><li><%= item %></li><% }) %></ul>');
    result = escapedCharsInJavascriptTemplate({numbers: 'one\ntwo\nthree\nfour'});
    t.is(result, '<ul><li>one</li><li>two</li><li>three</li><li>four</li></ul>', 'Can use escaped characters (e.g. \\n) in JavaScript');

    var namespaceCollisionTemplate = _.template('<%= pageCount %> <%= thumbnails[pageCount] %> <% _.each(thumbnails, function(p) { %><div class="thumbnail" rel="<%= p %>"></div><% }); %>');
    result = namespaceCollisionTemplate({
      pageCount: 3,
      thumbnails: {
        1: 'p1-thumbnail.gif',
        2: 'p2-thumbnail.gif',
        3: 'p3-thumbnail.gif'
      }
    });
    t.is(result, '3 p3-thumbnail.gif <div class="thumbnail" rel="p1-thumbnail.gif"></div><div class="thumbnail" rel="p2-thumbnail.gif"></div><div class="thumbnail" rel="p3-thumbnail.gif"></div>');

    var noInterpolateTemplate = _.template('<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>');
    result = noInterpolateTemplate();
    t.is(result, '<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>');

    var quoteTemplate = _.template("It's its, not it's");
    t.is(quoteTemplate({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template("<%\
      if(foo == 'bar'){ \
    %>Statement quotes and 'quotes'.<% } %>");
    t.is(quoteInStatementAndBody({foo: 'bar'}), "Statement quotes and 'quotes'.");

    var withNewlinesAndTabs = _.template('This\n\t\tis: <%= x %>.\n\tok.\nend.');
    t.is(withNewlinesAndTabs({x: 'that'}), 'This\n\t\tis: that.\n\tok.\nend.');

    var template = _.template('<i><%- value %></i>');
    var result = template({value: '<script>'});
    t.is(result, '<i>&lt;script&gt;</i>');

    var stooge = {
      name: 'Moe',
      template: _.template("I'm <%= this.name %>")
    };
    t.is(stooge.template(), "I'm Moe");

    template = _.template('\n \
      <%\n \
      // a comment\n \
      if (data) { data += 12345; }; %>\n \
      <li><%= data %></li>\n \
    ');
    t.is(template({data : 12345}).replace(/\s/g, ''), '<li>24690</li>');

    _.templateSettings = {
      evaluate    : /\{\{([\s\S]+?)\}\}/g,
      interpolate : /\{\{=([\s\S]+?)\}\}/g
    };

    var custom = _.template('<ul>{{ for (var key in people) { }}<li>{{= people[key] }}</li>{{ } }}</ul>');
    result = custom({people : {moe : 'Moe', larry : 'Larry', curly : 'Curly'}});
    t.is(result, '<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>', 'can run arbitrary javascript in templates');

    var customQuote = _.template("It's its, not it's");
    t.is(customQuote({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template("{{ if(foo == 'bar'){ }}Statement quotes and 'quotes'.{{ } }}");
    t.is(quoteInStatementAndBody({foo: 'bar'}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      evaluate    : /<\?([\s\S]+?)\?>/g,
      interpolate : /<\?=([\s\S]+?)\?>/g
    };

    var customWithSpecialChars = _.template('<ul><? for (var key in people) { ?><li><?= people[key] ?></li><? } ?></ul>');
    result = customWithSpecialChars({people : {moe : 'Moe', larry : 'Larry', curly : 'Curly'}});
    t.is(result, '<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>', 'can run arbitrary javascript in templates');

    var customWithSpecialCharsQuote = _.template("It's its, not it's");
    t.is(customWithSpecialCharsQuote({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template("<? if(foo == 'bar'){ ?>Statement quotes and 'quotes'.<? } ?>");
    t.is(quoteInStatementAndBody({foo: 'bar'}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
    };

    var mustache = _.template('Hello {{planet}}!');
    t.is(mustache({planet : 'World'}), 'Hello World!', 'can mimic mustache.js');

    var templateWithNull = _.template('a null undefined {{planet}}');
    t.is(templateWithNull({planet : 'world'}), 'a null undefined world', 'can handle missing escape and evaluate settings');
    t.end();
  });

  test('_.template provides the generated function source, when a SyntaxError occurs', function(t) {
    try {
      _.template('<b><%= if x %></b>');
    } catch (ex) {
      var source = ex.source;
    }
    t.ok(/__p/.test(source));
    t.end();
  });

  test('_.template handles \\u2028 & \\u2029', function(t) {
    var tmpl = _.template('<p>\u2028<%= "\\u2028\\u2029" %>\u2029</p>');
    t.is(tmpl(), '<p>\u2028\u2028\u2029\u2029</p>');
    t.end();
  });

  test('result calls functions and returns primitives', function(t) {
    var obj = {w: '', x: 'x', y: function(){ return this.x; }};
    t.is(_.result(obj, 'w'), '');
    t.is(_.result(obj, 'x'), 'x');
    t.is(_.result(obj, 'y'), 'x');
    t.is(_.result(obj, 'z'), undefined);
    t.is(_.result(null, 'x'), undefined);
    t.end();
  });

  test('_.templateSettings.variable', function(t) {
    var s = '<%=data.x%>';
    var data = {x: 'x'};
    t.is(_.template(s, data, {variable: 'data'}), 'x');
    _.templateSettings.variable = 'data';
    t.is(_.template(s)(data), 'x');
    t.end();
  });

  test('#547 - _.templateSettings is unchanged by custom settings.', function(t) {
    t.ok(!_.templateSettings.variable);
    _.template('', {}, {variable: 'x'});
    t.ok(!_.templateSettings.variable);
    t.end();
  });

  test('#556 - undefined template variables.', function(t) {
    var template = _.template('<%=x%>');
    t.is(template({x: null}), '');
    t.is(template({x: undefined}), '');

    var templateEscaped = _.template('<%-x%>');
    t.is(templateEscaped({x: null}), '');
    t.is(templateEscaped({x: undefined}), '');

    var templateWithProperty = _.template('<%=x.foo%>');
    t.is(templateWithProperty({x: {} }), '');
    t.is(templateWithProperty({x: {} }), '');

    var templateWithPropertyEscaped = _.template('<%-x.foo%>');
    t.is(templateWithPropertyEscaped({x: {} }), '');
    t.is(templateWithPropertyEscaped({x: {} }), '');
    t.end();
  });

  test('interpolate evaluates code only once.', 2, function(t) {
    var count = 0;
    var template = _.template('<%= f() %>');
    template({f: function(){ t.ok(!(count++)); }});

    var countEscaped = 0;
    var templateEscaped = _.template('<%- f() %>');
    templateEscaped({f: function(){ t.ok(!(countEscaped++)); }});
    t.end();
  });

  test('#746 - _.template settings are not modified.', 1, function(t) {
    var settings = {};
    _.template('', null, settings);
    t.same(settings, {});
    t.end();
  });

  test('#779 - delimeters are applied to unescaped text.', 1, function(t) {
    var template = _.template('<<\nx\n>>', null, {evaluate: /<<(.*?)>>/g});
    t.is(template(), '<<\nx\n>>');
    t.end();
  });

})();
