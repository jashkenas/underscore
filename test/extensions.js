$(document).ready(function() {
  module("Underscore extensions (toJSON, parseJSON)");

  Date.prototype.toJSON = function() { 
    return {
      _type:'Date', 
      year:this.getUTCFullYear(), 
      month:this.getUTCMonth(), 
      day:this.getUTCDate(),
      hours:this.getUTCHours(),
      minutes:this.getUTCMinutes(),
      seconds:this.getUTCSeconds()
    }; 
  };
  Date.prototype.isEqual = function(that) { 
    var this_date_components = this.toJSON();
    var that_date_components = (that instanceof Date) ? that.toJSON() : that;
    delete this_date_components['_type']; delete that_date_components['_type']
    return _.isEqual(this_date_components, that_date_components);
  };

  Date.parseJSON = function(obj) { 
    if (obj._type!='Date') return null;
    return new Date(Date.UTC(obj.year, obj.month, obj.day, obj.hours, obj.minutes, obj.seconds))
  };

  window.window.SomeNamespace || (window.SomeNamespace = {});
  SomeNamespace.SomeClass = (function() {
    function SomeClass(int_value, string_value, date_value) { 
      this.int_value = int_value; 
      this.string_value = string_value; 
      this.date_value = date_value; 
    }
    SomeClass.prototype.toJSON = function() { 
      return {
        _type:'SomeNamespace.SomeClass', 
        int_value:this.int_value, 
        string_value:this.string_value, 
        date_value:this.date_value
      }; 
    };
    SomeClass.parseJSON = function(obj) { 
      if (obj._type!='SomeNamespace.SomeClass') return null;
      return new SomeClass(obj.int_value, obj.string_value, Date.parseJSON(obj.date_value));
    };
    return SomeClass;
  })();

  test("extensions: toJSON", function() {
    var int_value = 123456, string_value = 'Hello', date_value = new Date(), result;
    var object = {
      _type:'SomeNamespace.SomeClass', 
      int_value:int_value, 
      string_value:string_value, 
      date_value: {
        _type:'Date',
        year:date_value.getUTCFullYear(), 
        month:date_value.getUTCMonth(), 
        day:date_value.getUTCDate(),
        hours:date_value.getUTCHours(),
        minutes:date_value.getUTCMinutes(),
        seconds:date_value.getUTCSeconds()
      }
    };

    result = _.toJSON(date_value);
    ok(result._type==='Date', 'Date serialized');
    ok(_.isEqual(result, date_value), 'date matches');

    var some_class = new SomeNamespace.SomeClass(int_value, string_value, date_value);
    result = _.toJSON(some_class);
    ok(_.isEqual(result,object), 'serialized object isEqual');
    
    var array = [some_class, some_class, some_class];
    result = _.toJSON(array);
    ok(result.length===3, 'serialized array length');
    ok(_.isEqual(result[0],object), 'serialized object 1 isEqual');
    ok(_.isEqual(result[1],object), 'serialized object 2 isEqual');
    ok(_.isEqual(result[2],object), 'serialized object 3 isEqual');
  });

  test("extensions: parseJSON", function() {
    var int_value = 123456, string_value = 'Hello', date_value = new Date(), result;
    var object = {
      _type:'SomeNamespace.SomeClass', 
      int_value:int_value, 
      string_value:string_value, 
      date_value: {
        _type:'Date',
        year:date_value.getUTCFullYear(), 
        month:date_value.getUTCMonth(), 
        day:date_value.getUTCDate(),
        hours:date_value.getUTCHours(),
        minutes:date_value.getUTCMinutes(),
        seconds:date_value.getUTCSeconds()
      }
    };
  
    var result = _.parseJSON(object.date_value);
    ok(result instanceof Date, 'Date deserialized');
    ok(result.isEqual(date_value), 'date matches');
  
    result = _.parseJSON(object);
    ok(result instanceof SomeNamespace.SomeClass, 'deserialized is SomeNamespace.SomeClass');
    ok(result.int_value===int_value, 'int_value deserialized');
    ok(result.string_value===string_value, 'string_value deserialized');
    ok(result.date_value instanceof Date, 'date_value deserialized');
    ok(result.date_value.isEqual(date_value), 'date matches');
  
    var array = [object, object, object];
    result = _.parseJSON(array);
    ok(result.length===3, 'serialized array length');
    ok(result[0] instanceof SomeNamespace.SomeClass, 'serialized object 1 correct type');
    ok(result[0].date_value instanceof Date, 'serialized object date 1 correct type');
    ok(result[1] instanceof SomeNamespace.SomeClass, 'serialized object 2 correct type');
    ok(result[1].date_value instanceof Date, 'serialized object date 2 correct type');
    ok(result[2] instanceof SomeNamespace.SomeClass, 'serialized object 3 correct type');
    ok(result[2].date_value instanceof Date, 'serialized object date 3 correct type');

    var embedded_objects = {
      date_value1: {
        _type:'Date',
        year:date_value.getUTCFullYear(), 
        month:date_value.getUTCMonth(), 
        day:date_value.getUTCDate(),
        hours:date_value.getUTCHours(),
        minutes:date_value.getUTCMinutes(),
        seconds:date_value.getUTCSeconds()
      },
      date_value2: {
        _type:'Date',
        year:date_value.getUTCFullYear(), 
        month:date_value.getUTCMonth(), 
        day:date_value.getUTCDate(),
        hours:date_value.getUTCHours(),
        minutes:date_value.getUTCMinutes(),
        seconds:date_value.getUTCSeconds()
      },
      date_value3: {
        _type:'Date',
        year:date_value.getUTCFullYear(), 
        month:date_value.getUTCMonth(), 
        day:date_value.getUTCDate(),
        hours:date_value.getUTCHours(),
        minutes:date_value.getUTCMinutes(),
        seconds:date_value.getUTCSeconds()
      },
    };
    result = _.parseJSON(embedded_objects, {parse_properties: true});
    ok(_.size(result)===3, 'serialized property count');
    ok(result.date_value1 instanceof Date, 'serialized object date 1 correct type');
    ok(result.date_value2 instanceof Date, 'serialized object date 2 correct type');
    ok(result.date_value3 instanceof Date, 'serialized object date 3 correct type');
  });
});
