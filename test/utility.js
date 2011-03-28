$(document).ready(function() {

  module("Utility functions (uniqueId, template)");

  test("utility: noConflict", function() {
    var underscore = _.noConflict();
    ok(underscore.isUndefined(_), "The '_' variable has been returned to its previous state.");
    var intersection = underscore.intersect([-1, 0, 1, 2], [1, 2, 3, 4]);
    equals(intersection.join(', '), '1, 2', 'but the intersection function still works');
    window._ = underscore;
  });

  test("utility: identity", function() {
    var moe = {name : 'moe'};
    equals(_.identity(moe), moe, 'moe is the same as his identity');
  });

  test("utility: uniqueId", function() {
    var ids = [], i = 0;
    while(i++ < 100) ids.push(_.uniqueId());
    equals(_.uniq(ids).length, ids.length, 'can generate a globally-unique stream of ids');
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
    equals(_.myReverse('panacea'), 'aecanap', 'mixed in a function to _');
    equals(_('champ').myReverse(), 'pmahc', 'mixed in a function to the OOP wrapper');
  });
  
  test("utility: counter", function() {
    var nums, genCounter;
    
    genCounter = _.counter(); nums = [];
    _(10).times(function(){ nums.push(genCounter()); });
    equals(nums.join(' '), '0 1 2 3 4 5 6 7 8 9', 'from 0 by 1, calling 10 times');
    
    genCounter = _.counter(10); nums = [];
    _(7).times(function(){ nums.push(genCounter()); });
    equals(nums.join(' '), '10 11 12 13 14 15 16', 'from 10 by 1, calling 7 times');
    
    genCounter = _.counter(100, 2); nums = [];
    _(5).times(function(){ nums.push(genCounter()); });
    equals(nums.join(' '), '100 102 104 106 108', 'from 100 by 2, calling 5 times');
    
    genCounter = _.counter(-1, -3); nums = [];
    _(8).times(function(){ nums.push(genCounter()); });
    equals(nums.join(' '), '-1 -4 -7 -10 -13 -16 -19 -22', 'from -1 by -3, calling 8 times');
    
    genCounter = _.counter(20, -3); nums = [];
    _(10).times(function(){ nums.push(genCounter()); });
    equals(nums.join(' '), '20 17 14 11 8 5 2 -1 -4 -7', 'from 20 by -3, calling 10 times');
  });
  
  test("utility: cycle", function() {
    var nums, genCycle;
    
    genCycle = _.cycle(_.range(5)); nums = [];
    _(10).times(function(){ nums.push(genCycle()); });
    equals(nums.join(' '), '0 1 2 3 4 0 1 2 3 4', 'cycling [0, 1, 2, 3, 4], calling 10 times');
    
    genCycle = _.cycle("ABC"); nums = [];
    _(10).times(function(){ nums.push(genCycle()); });
    equals(nums.join(' '), 'A B C A B C A B C A', 'cycling \'ABC\', calling 10 times');
    
    genCycle = _.cycle({ "a": 1, "b": "test", "c": "#" }); nums = [];
    _(7).times(function(){ nums.push(genCycle()); });
    equals(nums.join(' '), '1 test # 1 test # 1', 'cycling object, calling 7 times');
    
    genCycle = _.cycle([1, "A", 12, "Run"]); nums = [];
    _(7).times(function(){ nums.push(genCycle()); });
    equals(nums.join(' '), '1 A 12 Run 1 A 12', 'cycling assorted list, calling 7 times');
    
    raises(function(){ _.cycle(1); }, TypeError, 'Number is not allowed');
    raises(function(){ _.cycle(/abc/); }, TypeError, 'Regex is not allowed');
    raises(function(){ _.cycle(null); }, TypeError, 'null is not allowed');
    raises(function(){ _.cycle(""); }, TypeError, 'empty string is not allowed');
    raises(function(){ _.cycle([]); }, TypeError, 'empty list is not allowed');
    raises(function(){ _.cycle({}); }, TypeError, 'empty object is not allowed');
    
  });
  
  test("utility: template", function() {
    var basicTemplate = _.template("<%= thing %> is gettin' on my noives!");
    var result = basicTemplate({thing : 'This'});
    equals(result, "This is gettin' on my noives!", 'can do basic attribute interpolation');

    var backslashTemplate = _.template("<%= thing %> is \\ridanculous");
    equals(backslashTemplate({thing: 'This'}), "This is \\ridanculous");

    var fancyTemplate = _.template("<ul><% \
      for (key in people) { \
    %><li><%= people[key] %></li><% } %></ul>");
    result = fancyTemplate({people : {moe : "Moe", larry : "Larry", curly : "Curly"}});
    equals(result, "<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>", 'can run arbitrary javascript in templates');

    var namespaceCollisionTemplate = _.template("<%= pageCount %> <%= thumbnails[pageCount] %> <% _.each(thumbnails, function(p) { %><div class=\"thumbnail\" rel=\"<%= p %>\"></div><% }); %>");
    result = namespaceCollisionTemplate({
      pageCount: 3,
      thumbnails: {
        1: "p1-thumbnail.gif",
        2: "p2-thumbnail.gif",
        3: "p3-thumbnail.gif"
      }
    });
    equals(result, "3 p3-thumbnail.gif <div class=\"thumbnail\" rel=\"p1-thumbnail.gif\"></div><div class=\"thumbnail\" rel=\"p2-thumbnail.gif\"></div><div class=\"thumbnail\" rel=\"p3-thumbnail.gif\"></div>");

    var noInterpolateTemplate = _.template("<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>");
    result = noInterpolateTemplate();
    equals(result, "<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>");

    var quoteTemplate = _.template("It's its, not it's");
    equals(quoteTemplate({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template("<%\
      if(foo == 'bar'){ \
    %>Statement quotes and 'quotes'.<% } %>");
    equals(quoteInStatementAndBody({foo: "bar"}), "Statement quotes and 'quotes'.");

    var withNewlinesAndTabs = _.template('This\n\t\tis: <%= x %>.\n\tok.\nend.');
    equals(withNewlinesAndTabs({x: 'that'}), 'This\n\t\tis: that.\n\tok.\nend.');

    if (!$.browser.msie) {
      var fromHTML = _.template($('#template').html());
      equals(fromHTML({data : 12345}).replace(/\s/g, ''), '<li>24690</li>');
    }

    _.templateSettings = {
      evaluate    : /\{\{([\s\S]+?)\}\}/g,
      interpolate : /\{\{=([\s\S]+?)\}\}/g
    };

    var custom = _.template("<ul>{{ for (key in people) { }}<li>{{= people[key] }}</li>{{ } }}</ul>");
    result = custom({people : {moe : "Moe", larry : "Larry", curly : "Curly"}});
    equals(result, "<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>", 'can run arbitrary javascript in templates');

    var customQuote = _.template("It's its, not it's");
    equals(customQuote({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template("{{ if(foo == 'bar'){ }}Statement quotes and 'quotes'.{{ } }}");
    equals(quoteInStatementAndBody({foo: "bar"}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      evaluate    : /<\?([\s\S]+?)\?>/g,
      interpolate : /<\?=([\s\S]+?)\?>/g
    };

    var customWithSpecialChars = _.template("<ul><? for (key in people) { ?><li><?= people[key] ?></li><? } ?></ul>");
    result = customWithSpecialChars({people : {moe : "Moe", larry : "Larry", curly : "Curly"}});
    equals(result, "<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>", 'can run arbitrary javascript in templates');

    var customWithSpecialCharsQuote = _.template("It's its, not it's");
    equals(customWithSpecialCharsQuote({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template("<? if(foo == 'bar'){ ?>Statement quotes and 'quotes'.<? } ?>");
    equals(quoteInStatementAndBody({foo: "bar"}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
    };

    var mustache = _.template("Hello {{planet}}!");
    equals(mustache({planet : "World"}), "Hello World!", "can mimic mustache.js");
  });
  
});
