if (typeof require !== 'undefined') {
  var _ = require('../underscore');
}

(function (exports) {
//$(document).ready(function() {

  //module("Utility functions (uniqueId, template)");

exports["utility: noConflict"] = function(test) {
  if (typeof window !== 'undefined') {
    var underscore = _.noConflict();
    test.ok(underscore.isUndefined(_), "The '_' variable has been returned to its previous state.");
    var intersection = underscore.intersect([-1, 0, 1, 2], [1, 2, 3, 4]);
    test.equals(intersection.join(', '), '1, 2', 'but the intersection function still works');
    window._ = underscore;
  }
  test.done();
};

exports["utility: identity"] = function(test) {
  var moe = {name : 'moe'};
  test.equals(_.identity(moe), moe, 'moe is the same as his identity');
  test.done();
};

exports["utility: uniqueId"] = function(test) {
  var ids = [], i = 0;
  while(i++ < 100) ids.push(_.uniqueId());
  test.equals(_.uniq(ids).length, ids.length, 'can generate a globally-unique stream of ids');
  test.done();
};

exports["utility: times"] = function(test) {
  var vals = [];
  _.times(3, function (i) { vals.push(i); });
  test.ok(_.isEqual(vals, [0,1,2]), "is 0 indexed");
  //
  vals = [];
  _(3).times(function (i) { vals.push(i); });
  test.ok(_.isEqual(vals, [0,1,2]), "works as a wrapper");
  test.done();
};

exports["utility: mixin"] = function(test) {
  _.mixin({
    myReverse: function(string) {
      return string.split('').reverse().join('');
    }
  });
  test.equals(_.myReverse('panacea'), 'aecanap', 'mixed in a function to _');
  test.equals(_('champ').myReverse(), 'pmahc', 'mixed in a function to the OOP wrapper');
  test.done();
};

exports["utility: template"] = function(test) {
  var basicTemplate = _.template("<%= thing %> is gettin' on my noives!");
  var result = basicTemplate({thing : 'This'});
  test.equals(result, "This is gettin' on my noives!", 'can do basic attribute interpolation');

  var backslashTemplate = _.template("<%= thing %> is \\ridanculous");
  test.equals(backslashTemplate({thing: 'This'}), "This is \\ridanculous");

  var fancyTemplate = _.template("<ul><% \
    for (key in people) { \
  %><li><%= people[key] %></li><% } %></ul>");
  result = fancyTemplate({people : {moe : "Moe", larry : "Larry", curly : "Curly"}});
  test.equals(result, "<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>", 'can run arbitrary javascript in templates');

  var namespaceCollisionTemplate = _.template("<%= pageCount %> <%= thumbnails[pageCount] %> <% _.each(thumbnails, function(p) { %><div class=\"thumbnail\" rel=\"<%= p %>\"></div><% }); %>");
  result = namespaceCollisionTemplate({
    pageCount: 3,
    thumbnails: {
      1: "p1-thumbnail.gif",
      2: "p2-thumbnail.gif",
      3: "p3-thumbnail.gif"
    }
  });
  test.equals(result, "3 p3-thumbnail.gif <div class=\"thumbnail\" rel=\"p1-thumbnail.gif\"></div><div class=\"thumbnail\" rel=\"p2-thumbnail.gif\"></div><div class=\"thumbnail\" rel=\"p3-thumbnail.gif\"></div>");

  var noInterpolateTemplate = _.template("<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>");
  result = noInterpolateTemplate();
  test.equals(result, "<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>");

  var quoteTemplate = _.template("It's its, not it's");
  test.equals(quoteTemplate({}), "It's its, not it's");

  var quoteInStatementAndBody = _.template("<%\
    if(foo == 'bar'){ \
  %>Statement quotes and 'quotes'.<% } %>");
  test.equals(quoteInStatementAndBody({foo: "bar"}), "Statement quotes and 'quotes'.");

  var withNewlinesAndTabs = _.template('This\n\t\tis: <%= x %>.\n\tok.\nend.');
  test.equals(withNewlinesAndTabs({x: 'that'}), 'This\n\t\tis: that.\n\tok.\nend.');

  if (typeof $ !== 'undefined' && !$.browser.msie) {
    var fromHTML = _.template($('#template').html());
    test.equals(fromHTML({data : 12345}).replace(/\s/g, ''), '<li>24690</li>');
  }

  _.templateSettings = {
    evaluate    : /\{\{([\s\S]+?)\}\}/g,
    interpolate : /\{\{=([\s\S]+?)\}\}/g
  };

  var custom = _.template("<ul>{{ for (key in people) { }}<li>{{= people[key] }}</li>{{ } }}</ul>");
  result = custom({people : {moe : "Moe", larry : "Larry", curly : "Curly"}});
  test.equals(result, "<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>", 'can run arbitrary javascript in templates');

  var customQuote = _.template("It's its, not it's");
  test.equals(customQuote({}), "It's its, not it's");

  var quoteInStatementAndBody = _.template("{{ if(foo == 'bar'){ }}Statement quotes and 'quotes'.{{ } }}");
  test.equals(quoteInStatementAndBody({foo: "bar"}), "Statement quotes and 'quotes'.");

  _.templateSettings = {
    evaluate    : /<\?([\s\S]+?)\?>/g,
    interpolate : /<\?=([\s\S]+?)\?>/g
  };

  var customWithSpecialChars = _.template("<ul><? for (key in people) { ?><li><?= people[key] ?></li><? } ?></ul>");
  result = customWithSpecialChars({people : {moe : "Moe", larry : "Larry", curly : "Curly"}});
  test.equals(result, "<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>", 'can run arbitrary javascript in templates');

  var customWithSpecialCharsQuote = _.template("It's its, not it's");
  test.equals(customWithSpecialCharsQuote({}), "It's its, not it's");

  var quoteInStatementAndBody = _.template("<? if(foo == 'bar'){ ?>Statement quotes and 'quotes'.<? } ?>");
  test.equals(quoteInStatementAndBody({foo: "bar"}), "Statement quotes and 'quotes'.");

  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  };

  var mustache = _.template("Hello {{planet}}!");
  test.equals(mustache({planet : "World"}), "Hello World!", "can mimic mustache.js");
  test.done();
};

//});

})(typeof exports === 'undefined' ? this['utility'] = {}: exports);
