$(document).ready(function() {

  module("Piping");

  test("map/flatten/reduce", function() {
    var lyrics = [
      "I'm a lumberjack and I'm okay",
      "I sleep all night and I work all day",
      "He's a lumberjack and he's okay",
      "He sleeps all night and he works all day"
    ];
    var counts = _.pipe(lyrics) //early seed
      (_.map, function(line) { return line.split(''); })
      (_.flatten)
      (_.reduce, function(hash, l) {
          hash[l] = hash[l] || 0;
          hash[l]++;
          return hash;
        }, {})
      ();
    ok(counts['a'] == 16 && counts['e'] == 10, 'counted all the letters in the song');  
    var getCounts = _.pipe() //late seed
      (_.map, function(line) { return line.split(''); })
      (_.flatten)
      (_.reduce, function(hash, l) {
          hash[l] = hash[l] || 0;
          hash[l]++;
          return hash;
        }, {})
      ();
    ok(_.isFunction(getCounts), 'can compose functions by piping together other functions')
    var counts2 = getCounts(lyrics); //provide seed
    ok(counts2['a'] == 16 && counts2['e'] == 10, 'the result of a composed function is the same');
    deepEqual(counts, counts2, 'whether a seed is provided early or late the result is the same')
  });

  test("select/reject/sortBy", function() {
    var numbers = [1,2,3,4,5,6,7,8,9,10];
    numbers = _.pipe(numbers) //compact formatting
      (_.select, function(n) { return n % 2 == 0; })
      (_.reject, function(n) { return n % 4 == 0; })
      (_.sortBy, function(n) { return -n; })
      ();
    equal(numbers.join(', '), "10, 6, 2", "filtered and reversed the numbers");
  });

  test("reverse/concat/unshift/pop/map", function() {
    var numbers = [1,2,3,4,5];
    numbers = _.pipe(numbers)
      (_.reverse)
      (_.concat, [5, 5, 5])
      (_.unshift, 17)
      (_.pop)
      (_.map, function(n){ return n * 2; })
      ();
    equal(numbers.join(', '), "34, 10, 8, 6, 4, 2, 10, 10", 'can pipe together array functions.');
  });

  test("inject non-underscore functions into pipe", function() {
    function dot(key){ //pluck using map
      return function(obj){
        return obj[key];
      }
    }
    function log(item){ //monitor interim results
      //console.log(item);  //don't actually interfere with test suite.
      return item;
    }
    function type(key, constructor){
      return function(obj){
        var revised = _.clone(obj);
        revised[key] = new constructor(revised[key]);
        return revised;
      }
    }
    var stooges = [{name: 'moe'  , dob: '1897-06-19'},
                   {name: 'curly', dob: '1903-10-22'},
                   {name: 'shemp', dob: '1895-03-11'}];
    var toUpperCase = _.detach(String.prototype.toUpperCase);                   
    var stooge  = _.pipe(stooges)(_.first)(dot('name'))();
    equal(stooge, 'moe', 'can inject non-underscore functions into the chain.');
    var getHeadliner = _.pipe()(_.map, dot('name'))(log)(_.first)(log)(toUpperCase)();
    ok(_.isFunction(getHeadliner), 'can produce functions by piping even non-underscore functions together')
    var headliner = getHeadliner(stooges);
    equal(headliner, 'MOE')
    var dob = _.pipe()(_.shuffle)(_.first)(type('dob', Date))(dot('dob'))()(stooges);
    ok(_.isDate(dob))
  });  

});
