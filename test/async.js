if (typeof require !== 'undefined') {
  var _ = require('../underscore');
}

(function (exports) {

exports['async: nextTick'] = function(test){
    var call_order = [];
    _.nextTick(function(){call_order.push('two');});
    call_order.push('one');
    setTimeout(function(){
        test.same(call_order, ['one','two']);
        test.done();
    }, 50);
};

exports['async: nextTick in node'] = function(test){
    test.expect(1);
    var browser = false;
    if (typeof process === 'undefined') {
        browser = true;
        window.process = {};
    }
    var _nextTick = process.nextTick;
    process.nextTick = function(){
        if (browser) {
            window.process = undefined;
        }
        else {
            process.nextTick = _nextTick;
        }
        test.ok(true, 'process.nextTick called');
        test.done();
    };
    _.nextTick(function(){});
};

exports['async: nextTick in the browser'] = function(test){
    test.expect(1);

    if (typeof process !== 'undefined') {
        var _nextTick = process.nextTick;
        process.nextTick = undefined;
    }

    var call_order = [];
    _.nextTick(function(){call_order.push('two');});

    call_order.push('one');
    setTimeout(function(){
        if (typeof process !== 'undefined') {
            process.nextTick = _nextTick;
        }
        test.same(call_order, ['one','two']);
    }, 50);
    setTimeout(test.done, 100);
};

exports['async: asyncForEach'] = function(test){
    var args = [];
    _.asyncForEach([1,3,2], function(x, callback){
        setTimeout(function(){
            args.push(x);
            callback();
        }, x*25);
    }, function(err){
        test.same(args, [1,2,3]);
        test.done();
    });
};

exports['async: asyncForEach empty array'] = function(test){
    test.expect(1);
    _.asyncForEach([], function(x, callback){
        test.ok(false, 'iterator should not be called');
        callback();
    }, function(err){
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['async: asyncForEach error'] = function(test){
    test.expect(1);
    _.asyncForEach([1,2,3], function(x, callback){
        callback('error');
    }, function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['async: asyncEach alias'] = function (test) {
    test.strictEqual(_.asyncEach, _.asyncForEach);
    test.done();
};

exports['async: asyncForEachSeries'] = function(test){
    var args = [];
    _.asyncForEachSeries([1,3,2], function(x, callback){
        setTimeout(function(){
            args.push(x);
            callback();
        }, x*25);
    }, function(err){
        test.same(args, [1,3,2]);
        test.done();
    });
};

exports['async: asyncForEachSeries empty array'] = function(test){
    test.expect(1);
    _.asyncForEachSeries([], function(x, callback){
        test.ok(false, 'iterator should not be called');
        callback();
    }, function(err){
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['async: asyncForEachSeries error'] = function(test){
    test.expect(2);
    var call_order = [];
    _.asyncForEachSeries([1,2,3], function(x, callback){
        call_order.push(x);
        callback('error');
    }, function(err){
        test.same(call_order, [1]);
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['async: asyncEachSeries alias'] = function (test) {
    test.strictEqual(_.asyncEachSeries, _.asyncForEachSeries);
    test.done();
};

exports['async: asyncMap'] = function(test){
    var call_order = [];
    _.asyncMap([1,3,2], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(null, x*2);
        }, x*25);
    }, function(err, results){
        test.same(call_order, [1,2,3]);
        test.same(results, [2,6,4]);
        test.done();
    });
};

exports['async: asyncMap original untouched'] = function(test){
    var a = [1,2,3];
    _.asyncMap(a, function(x, callback){
        callback(null, x*2);
    }, function(err, results){
        test.same(results, [2,4,6]);
        test.same(a, [1,2,3]);
        test.done();
    });
};

exports['async: asyncMap error'] = function(test){
    test.expect(1);
    _.asyncMap([1,2,3], function(x, callback){
        callback('error');
    }, function(err, results){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['async: asyncMapSeries'] = function(test){
    var call_order = [];
    _.asyncMapSeries([1,3,2], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(null, x*2);
        }, x*25);
    }, function(err, results){
        test.same(call_order, [1,3,2]);
        test.same(results, [2,6,4]);
        test.done();
    });
};

exports['async: asyncMapSeries error'] = function(test){
    test.expect(1);
    _.asyncMapSeries([1,2,3], function(x, callback){
        callback('error');
    }, function(err, results){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

})(typeof exports === 'undefined' ? this['async_tests'] = {}: exports);
