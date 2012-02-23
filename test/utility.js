$(document).ready(function() {

  module("Utility");

  test("utility: noConflict", function() {
    var underscore = _.noConflict();
    ok(underscore.isUndefined(_), "The '_' variable has been returned to its previous state.");
    var intersection = underscore.intersect([-1, 0, 1, 2], [1, 2, 3, 4]);
    equal(intersection.join(', '), '1, 2', 'but the intersection function still works');
    window._ = underscore;
  });

  test("utility: identity", function() {
    var moe = {name : 'moe'};
    equal(_.identity(moe), moe, 'moe is the same as his identity');
  });

  test("utility: uniqueId", function() {
    var ids = [], i = 0;
    while(i++ < 100) ids.push(_.uniqueId());
    equal(_.uniq(ids).length, ids.length, 'can generate a globally-unique stream of ids');
  });

  test("utility: times", function() {
    var vals = [];
    _.times(3, function (i) { vals.push(i); });
    ok(_.isEqual(vals, [0,1,2]), "is 0 indexed");
    //
    vals = [];
    _(3).times(function (i) { vals.push(i); });
    ok(_.isEqual(vals, [0,1,2]), "works as a wrapper");
  });

  test("utility: mixin", function() {
    _.mixin({
      myReverse: function(string) {
        return string.split('').reverse().join('');
      }
    });
    equal(_.myReverse('panacea'), 'aecanap', 'mixed in a function to _');
    equal(_('champ').myReverse(), 'pmahc', 'mixed in a function to the OOP wrapper');
  });

  test("utility: _.escape", function() {
    equal(_.escape("Curly & Moe"), "Curly &amp; Moe");
    equal(_.escape("Curly &amp; Moe"), "Curly &amp;amp; Moe");
  });

  test("utility: template", function() {
    var basicTemplate = _.template("<%= o.thing %> is gettin' on my noives!");
    var result = basicTemplate({thing : 'This'});
    equal(result, "This is gettin' on my noives!", 'can do basic attribute interpolation');

    var sansSemicolonTemplate = _.template("A <% this %> B");
    equal(sansSemicolonTemplate(), "A  B");

    var backslashTemplate = _.template("<%= o.thing %> is \\ridanculous");
    equal(backslashTemplate({thing: 'This'}), "This is \\ridanculous");

    var escapeTemplate = _.template('<%= o.a ? "checked=\\"checked\\"" : "" %>');
    equal(escapeTemplate({a: true}), 'checked="checked"', 'can handle slash escapes in interpolations.');

    var fancyTemplate = _.template("<ul><% \
      for (key in o.people) { \
    %><li><%= o.people[key] %></li><% } %></ul>");
    result = fancyTemplate({people : {moe : "Moe", larry : "Larry", curly : "Curly"}});
    equal(result, "<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>", 'can run arbitrary javascript in templates');

    var escapedCharsInJavascriptTemplate = _.template("<ul><% _.each(o.numbers.split('\\n'), function(item) { %><li><%= item %></li><% }) %></ul>");
    result = escapedCharsInJavascriptTemplate({numbers: "one\ntwo\nthree\nfour"});
    equal(result, "<ul><li>one</li><li>two</li><li>three</li><li>four</li></ul>", 'Can use escaped characters (e.g. \\n) in Javascript');

    var namespaceCollisionTemplate = _.template("<%= o.pageCount %> <%= o.thumbnails[o.pageCount] %> <% _.each(o.thumbnails, function(p) { %><div class=\"thumbnail\" rel=\"<%= p %>\"></div><% }); %>");
    result = namespaceCollisionTemplate({
      pageCount: 3,
      thumbnails: {
        1: "p1-thumbnail.gif",
        2: "p2-thumbnail.gif",
        3: "p3-thumbnail.gif"
      }
    });
    equal(result, "3 p3-thumbnail.gif <div class=\"thumbnail\" rel=\"p1-thumbnail.gif\"></div><div class=\"thumbnail\" rel=\"p2-thumbnail.gif\"></div><div class=\"thumbnail\" rel=\"p3-thumbnail.gif\"></div>");

    var noInterpolateTemplate = _.template("<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>");
    result = noInterpolateTemplate();
    equal(result, "<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>");

    var quoteTemplate = _.template("It's its, not it's");
    equal(quoteTemplate({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template("<%\
      if(o.foo == 'bar'){ \
    %>Statement quotes and 'quotes'.<% } %>");
    equal(quoteInStatementAndBody({foo: "bar"}), "Statement quotes and 'quotes'.");

    var withNewlinesAndTabs = _.template('This\n\t\tis: <%= o.x %>.\n\tok.\nend.');
    equal(withNewlinesAndTabs({x: 'that'}), 'This\n\t\tis: that.\n\tok.\nend.');

    var template = _.template("<i><%- o.value %></i>");
    var result = template({value: "<script>"});
    equal(result, '<i>&lt;script&gt;</i>');

    var stooge = {
      name: "Moe",
      template: _.template("I'm <%= this.name %>")
    };
    equal(stooge.template(), "I'm Moe");

    var printing = _.template("<% print('a:' + o.a + ',b:' + o.b); %>");
    equal('a:1,b:2', printing({a:1, b:2}));

    if (!$.browser.msie) {
      var fromHTML = _.template($('#template').html());
      equal(fromHTML({data : 12345}).replace(/\s/g, ''), '<li>24690</li>');
    }

    _.templateSettings = {
      evaluate    : /\{\{([\s\S]+?)\}\}/g,
      interpolate : /\{\{=([\s\S]+?)\}\}/g
    };

    var custom = _.template("<ul>{{ for (key in o.people) { }}<li>{{= o.people[key] }}</li>{{ } }}</ul>");
    result = custom({people : {moe : "Moe", larry : "Larry", curly : "Curly"}});
    equal(result, "<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>", 'can run arbitrary javascript in templates');

    var customQuote = _.template("It's its, not it's");
    equal(customQuote({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template("{{ if(o.foo == 'bar'){ }}Statement quotes and 'quotes'.{{ } }}");
    equal(quoteInStatementAndBody({foo: "bar"}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      evaluate    : /<\?([\s\S]+?)\?>/g,
      interpolate : /<\?=([\s\S]+?)\?>/g
    };

    var customWithSpecialChars = _.template("<ul><? for (key in o.people) { ?><li><?= o.people[key] ?></li><? } ?></ul>");
    result = customWithSpecialChars({people : {moe : "Moe", larry : "Larry", curly : "Curly"}});
    equal(result, "<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>", 'can run arbitrary javascript in templates');

    var customWithSpecialCharsQuote = _.template("It's its, not it's");
    equal(customWithSpecialCharsQuote({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template("<? if(o.foo == 'bar'){ ?>Statement quotes and 'quotes'.<? } ?>");
    equal(quoteInStatementAndBody({foo: "bar"}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
    };

    var mustache = _.template("Hello {{o.planet}}!");
    equal(mustache({planet : "World"}), "Hello World!", "can mimic mustache.js");

    var templateWithNull = _.template("a null undefined {{o.planet}}");
    equal(templateWithNull({planet : "world"}), "a null undefined world", "can handle missing escape and evaluate settings");
  });

});
