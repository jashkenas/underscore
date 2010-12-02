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

exports['async: asyncReduce'] = function(test){
    var call_order = [];
    _.asyncReduce([1,2,3], 0, function(a, x, callback){
        call_order.push(x);
        callback(null, a + x);
    }, function(err, result){
        test.equals(result, 6);
        test.same(call_order, [1,2,3]);
        test.done();
    });
};

exports['async: asyncReduce async with non-reference memo'] = function(test){
    _.asyncReduce([1,3,2], 0, function(a, x, callback){
        setTimeout(function(){callback(null, a + x)}, Math.random()*100);
    }, function(err, result){
        test.equals(result, 6);
        test.done();
    });
};

exports['async: asyncReduce error'] = function(test){
    test.expect(1);
    _.asyncReduce([1,2,3], 0, function(a, x, callback){
        callback('error');
    }, function(err, result){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['async: asyncInject alias'] = function(test){
    test.equals(_.asyncInject, _.asyncReduce);
    test.done();
};

exports['async: asyncFoldl alias'] = function(test){
    test.equals(_.asyncFoldl, _.asyncReduce);
    test.done();
};

exports['async: asyncReduceRight'] = function(test){
    var call_order = [];
    var a = [1,2,3];
    _.asyncReduceRight(a, 0, function(a, x, callback){
        call_order.push(x);
        callback(null, a + x);
    }, function(err, result){
        test.equals(result, 6);
        test.same(call_order, [3,2,1]);
        test.same(a, [1,2,3]);
        test.done();
    });
};

exports['async: asyncFoldr alias'] = function(test){
    test.equals(_.asyncFoldr, _.asyncReduceRight);
    test.done();
};

exports['async: asyncFilter'] = function(test){
    _.asyncFilter([3,1,2], function(x, callback){
        setTimeout(function(){callback(x % 2);}, x*25);
    }, function(results){
        test.same(results, [3,1]);
        test.done();
    });
};

exports['async: asyncFilter original untouched'] = function(test){
    var a = [3,1,2];
    _.asyncFilter(a, function(x, callback){
        callback(x % 2);
    }, function(results){
        test.same(results, [3,1]);
        test.same(a, [3,1,2]);
        test.done();
    });
};

exports['async: asyncFilterSeries'] = function(test){
    _.asyncFilterSeries([3,1,2], function(x, callback){
        setTimeout(function(){callback(x % 2);}, x*25);
    }, function(results){
        test.same(results, [3,1]);
        test.done();
    });
};

exports['async: asyncSelect alias'] = function(test){
    test.equals(_.asyncSelect, _.asyncFilter);
    test.done();
};

exports['async: asyncSelectSeries alias'] = function(test){
    test.equals(_.asyncSelectSeries, _.asyncFilterSeries);
    test.done();
};

exports['async: asyncReject'] = function(test){
    _.asyncReject([3,1,2], function(x, callback){
        setTimeout(function(){callback(x % 2);}, x*25);
    }, function(results){
        test.same(results, [2]);
        test.done();
    });
};

exports['async: asyncReject original untouched'] = function(test){
    var a = [3,1,2];
    _.asyncReject(a, function(x, callback){
        callback(x % 2);
    }, function(results){
        test.same(results, [2]);
        test.same(a, [3,1,2]);
        test.done();
    });
};

exports['async: asyncRejectSeries'] = function(test){
    _.asyncRejectSeries([3,1,2], function(x, callback){
        setTimeout(function(){callback(x % 2);}, x*25);
    }, function(results){
        test.same(results, [2]);
        test.done();
    });
};

exports['async: asyncDetect'] = function(test){
    var call_order = [];
    _.asyncDetect([3,2,1], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x == 2);
        }, x*25);
    }, function(result){
        call_order.push('callback');
        test.equals(result, 2);
    });
    setTimeout(function(){
        test.same(call_order, [1,2,'callback',3]);
        test.done();
    }, 100);
};

exports['async: asyncDetectSeries'] = function(test){
    var call_order = [];
    _.asyncDetectSeries([3,2,1], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x == 2);
        }, x*25);
    }, function(result){
        call_order.push('callback');
        test.equals(result, 2);
    });
    setTimeout(function(){
        test.same(call_order, [3,2,'callback']);
        test.done();
    }, 200);
};

exports['async: asyncSome true'] = function(test){
    _.asyncSome([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 1);}, 0);
    }, function(result){
        test.equals(result, true);
        test.done();
    });
};

exports['async: asyncSome false'] = function(test){
    _.asyncSome([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 10);}, 0);
    }, function(result){
        test.equals(result, false);
        test.done();
    });
};

exports['async: asyncSome early return'] = function(test){
    var call_order = [];
    _.asyncSome([1,2,3], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x === 1);
        }, x*25);
    }, function(result){
        call_order.push('callback');
    });
    setTimeout(function(){
        test.same(call_order, [1,'callback',2,3]);
        test.done();
    }, 100);
};

exports['async: asyncAny alias'] = function (test) {
    test.strictEqual(_.asyncSome, _.asyncAny);
    test.done();
};

exports['async: asyncEvery true'] = function(test){
    _.asyncEvery([1,2,3], function(x, callback){
        setTimeout(function(){callback(true);}, 0);
    }, function(result){
        test.equals(result, true);
        test.done();
    });
};

exports['async: asyncEvery false'] = function(test){
    _.asyncEvery([1,2,3], function(x, callback){
        setTimeout(function(){callback(x % 2);}, 0);
    }, function(result){
        test.equals(result, false);
        test.done();
    });
};

exports['async: asyncEvery early return'] = function(test){
    var call_order = [];
    _.asyncEvery([1,2,3], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x === 1);
        }, x*25);
    }, function(result){
        call_order.push('callback');
    });
    setTimeout(function(){
        test.same(call_order, [1,2,'callback',3]);
        test.done();
    }, 100);
};

exports['async: asyncAll alias'] = function(test){
    test.equals(_.asyncAll, _.asyncEvery);
    test.done();
};

exports['async: asyncSortBy'] = function(test){
    _.asyncSortBy([{a:1},{a:15},{a:6}], function(x, callback){
        setTimeout(function(){callback(null, x.a);}, 0);
    }, function(err, result){
        test.same(result, [{a:1},{a:6},{a:15}]);
        test.done();
    });
};

exports['async: iterator'] = function(test){
    var call_order = [];
    var iterator = _.iterator([
        function(){call_order.push(1);},
        function(arg1){
            test.equals(arg1, 'arg1');
            call_order.push(2);
        },
        function(arg1, arg2){
            test.equals(arg1, 'arg1');
            test.equals(arg2, 'arg2');
            call_order.push(3);
        }
    ]);
    iterator();
    test.same(call_order, [1]);
    var iterator2 = iterator();
    test.same(call_order, [1,1]);
    var iterator3 = iterator2('arg1');
    test.same(call_order, [1,1,2]);
    var iterator4 = iterator3('arg1', 'arg2');
    test.same(call_order, [1,1,2,3]);
    test.equals(iterator4, undefined);
    test.done();
};

exports['async: iterator empty array'] = function(test){
    var iterator = _.iterator([]);
    test.equals(iterator(), undefined);
    test.equals(iterator.next(), undefined);
    test.done();
};

exports['async: iterator.next'] = function(test){
    var call_order = [];
    var iterator = _.iterator([
        function(){call_order.push(1);},
        function(arg1){
            test.equals(arg1, 'arg1');
            call_order.push(2);
        },
        function(arg1, arg2){
            test.equals(arg1, 'arg1');
            test.equals(arg2, 'arg2');
            call_order.push(3);
        }
    ]);
    var fn = iterator.next();
    var iterator2 = fn('arg1');
    test.same(call_order, [2]);
    iterator2('arg1','arg2');
    test.same(call_order, [2,3]);
    test.equals(iterator2.next(), undefined);
    test.done();
};

exports['async: parallel'] = function(test){
    var call_order = [];
    _.parallel([
        function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 25);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 50);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 15);
        }
    ],
    function(err, results){
        test.equals(err, null);
        test.same(call_order, [3,1,2]);
        test.same(results, [1,2,[3,3]]);
        test.done();
    });
};

exports['async: parallel empty array'] = function(test){
    _.parallel([], function(err, results){
        test.equals(err, null);
        test.same(results, []);
        test.done();
    });
};

exports['async: parallel error'] = function(test){
    _.parallel([
        function(callback){
            callback('error', 1);
        },
        function(callback){
            callback('error2', 2);
        }
    ],
    function(err, results){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 100);
};

exports['async: parallel no callback'] = function(test){
    _.parallel([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ]);
};

exports['async: parallel object'] = function(test){
    var call_order = [];
    _.parallel({
        one: function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 25);
        },
        two: function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 50);
        },
        three: function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 15);
        }
    },
    function(err, results){
        test.equals(err, null);
        test.same(call_order, [3,1,2]);
        test.same(results, {
            one: 1,
            two: 2,
            three: [3,3]
        });
        test.done();
    });
};

exports['async: series'] = function(test){
    var call_order = [];
    _.series([
        function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 25);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 50);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 15);
        }
    ],
    function(err, results){
        test.equals(err, null);
        test.same(results, [1,2,[3,3]]);
        test.same(call_order, [1,2,3]);
        test.done();
    });
};

exports['async: series empty array'] = function(test){
    _.series([], function(err, results){
        test.equals(err, null);
        test.same(results, []);
        test.done();
    });
};

exports['async: series error'] = function(test){
    test.expect(1);
    _.series([
        function(callback){
            callback('error', 1);
        },
        function(callback){
            test.ok(false, 'should not be called');
            callback('error2', 2);
        }
    ],
    function(err, results){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 100);
};

exports['async: series no callback'] = function(test){
    _.series([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ]);
};

exports['async: series object'] = function(test){
    var call_order = [];
    _.series({
        one: function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 25);
        },
        two: function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 50);
        },
        three: function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 15);
        }
    },
    function(err, results){
        test.equals(err, null);
        test.same(results, {
            one: 1,
            two: 2,
            three: [3,3]
        });
        test.same(call_order, [1,2,3]);
        test.done();
    });
};

exports['async: waterfall'] = function(test){
    test.expect(6);
    var call_order = [];
    _.waterfall([
        function(callback){
            call_order.push('fn1');
            setTimeout(function(){callback(null, 'one', 'two');}, 0);
        },
        function(arg1, arg2, callback){
            call_order.push('fn2');
            test.equals(arg1, 'one');
            test.equals(arg2, 'two');
            setTimeout(function(){callback(null, arg1, arg2, 'three');}, 25);
        },
        function(arg1, arg2, arg3, callback){
            call_order.push('fn3');
            test.equals(arg1, 'one');
            test.equals(arg2, 'two');
            test.equals(arg3, 'three');
            callback(null, 'four');
        },
        function(arg4, callback){
            call_order.push('fn4');
            test.same(call_order, ['fn1','fn2','fn3','fn4']);
            callback(null, 'test');
        }
    ], function(err){
        test.done();
    });
};

exports['async: waterfall empty array'] = function(test){
    _.waterfall([], function(err){
        test.done();
    });
};

exports['async: waterfall no callback'] = function(test){
    _.waterfall([
        function(callback){callback();},
        function(callback){callback(); test.done();}
    ]);
};

exports['async: waterfall async'] = function(test){
    var call_order = [];
    _.waterfall([
        function(callback){
            call_order.push(1);
            callback();
            call_order.push(2);
        },
        function(callback){
            call_order.push(3);
            callback();
        },
        function(){
            test.same(call_order, [1,2,3]);
            test.done();
        }
    ]);
};

exports['async: waterfall error'] = function(test){
    test.expect(1);
    _.waterfall([
        function(callback){
            callback('error');
        },
        function(callback){
            test.ok(false, 'next function should not be called');
            callback();
        }
    ], function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['async: waterfall multiple callback calls'] = function(test){
    var call_order = [];
    var arr = [
        function(callback){
            call_order.push(1);
            // call the callback twice. this should call function 2 twice
            callback(null, 'one', 'two');
            callback(null, 'one', 'two');
        },
        function(arg1, arg2, callback){
            call_order.push(2);
            callback(null, arg1, arg2, 'three');
        },
        function(arg1, arg2, arg3, callback){
            call_order.push(3);
            callback(null, 'four');
        },
        function(arg4){
            call_order.push(4);
            arr[3] = function(){
                call_order.push(4);
                test.same(call_order, [1,2,2,3,3,4,4]);
                test.done();
            };
        }
    ];
    _.waterfall(arr);
};

exports['async: asyncConcat'] = function(test){
    var call_order = [];
    var iterator = function (x, cb) {
        setTimeout(function(){
            call_order.push(x);
            var r = [];
            while (x > 0) {
                r.push(x);
                x--;
            }
            cb(null, r);
        }, x*25);
    };
    _.asyncConcat([1,3,2], iterator, function(err, results){
        test.same(results, [1,2,1,3,2,1]);
        test.same(call_order, [1,2,3]);
        test.ok(!err);
        test.done();
    });
};

exports['async: asyncConcat error'] = function(test){
    var iterator = function (x, cb) {
        cb(new Error('test error'));
    };
    _.asyncConcat([1,2,3], iterator, function(err, results){
        test.ok(err);
        test.done();
    });
};

exports['async: asyncConcatSeries'] = function(test){
    var call_order = [];
    var iterator = function (x, cb) {
        setTimeout(function(){
            call_order.push(x);
            var r = [];
            while (x > 0) {
                r.push(x);
                x--;
            }
            cb(null, r);
        }, x*25);
    };
    _.asyncConcatSeries([1,3,2], iterator, function(err, results){
        test.same(results, [1,3,2,1,2,1]);
        test.same(call_order, [1,3,2]);
        test.ok(!err);
        test.done();
    });
};

exports['async: asyncQueue'] = function (test) {
    var call_order = [],
        delays = [40,20,60,20];

    // worker1: --1-4
    // worker2: -2---3
    // order of completion: 2,1,4,3

    var q = _.asyncQueue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, delays.splice(0,1)[0]);
    }, 2);

    q.push(1, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 1);
        call_order.push('callback ' + 1);
    });
    q.push(2, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 2);
        call_order.push('callback ' + 2);
    });
    q.push(3, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 0);
        call_order.push('callback ' + 3);
    });
    q.push(4, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 0);
        call_order.push('callback ' + 4);
    });
    test.equal(q.length(), 4);
    test.equal(q.concurrency, 2);

    setTimeout(function () {
        test.same(call_order, [
            'process 2', 'callback 2',
            'process 1', 'callback 1',
            'process 4', 'callback 4',
            'process 3', 'callback 3'
        ]);
        test.equal(q.concurrency, 2);
        test.equal(q.length(), 0);
        test.done();
    }, 200);
};

exports['async: asyncQueue changing concurrency'] = function (test) {
    var call_order = [],
        delays = [40,20,60,20];

    // worker1: --1-2---3-4
    // order of completion: 1,2,3,4

    var q = _.asyncQueue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, delays.splice(0,1)[0]);
    }, 2);

    q.push(1, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 3);
        call_order.push('callback ' + 1);
    });
    q.push(2, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 2);
        call_order.push('callback ' + 2);
    });
    q.push(3, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 1);
        call_order.push('callback ' + 3);
    });
    q.push(4, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 0);
        call_order.push('callback ' + 4);
    });
    test.equal(q.length(), 4);
    test.equal(q.concurrency, 2);
    q.concurrency = 1;

    setTimeout(function () {
        test.same(call_order, [
            'process 1', 'callback 1',
            'process 2', 'callback 2',
            'process 3', 'callback 3',
            'process 4', 'callback 4'
        ]);
        test.equal(q.concurrency, 1);
        test.equal(q.length(), 0);
        test.done();
    }, 250);
};

exports['async: asyncQueue push without callback'] = function (test) {
    var call_order = [],
        delays = [40,20,60,20];

    // worker1: --1-4
    // worker2: -2---3
    // order of completion: 2,1,4,3

    var q = _.asyncQueue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, delays.splice(0,1)[0]);
    }, 2);

    q.push(1);
    q.push(2);
    q.push(3);
    q.push(4);

    setTimeout(function () {
        test.same(call_order, [
            'process 2',
            'process 1',
            'process 4',
            'process 3'
        ]);
        test.done();
    }, 200);
};

exports['async: asyncMemoize'] = function (test) {
    test.expect(4);
    var call_order = [];

    var fn = function (arg1, arg2, callback) {
        call_order.push(['fn', arg1, arg2]);
        callback(null, arg1 + arg2);
    };

    var fn2 = _.asyncMemoize(fn);
    fn2(1, 2, function (err, result) {
        test.equal(result, 3);
    });
    fn2(1, 2, function (err, result) {
        test.equal(result, 3);
    });
    fn2(2, 2, function (err, result) {
        test.equal(result, 4);
    });

    test.same(call_order, [['fn',1,2], ['fn',2,2]]);
    test.done();
};

exports['async: asyncMemoize error'] = function (test) {
    test.expect(1);
    var testerr = new Error('test');
    var fn = function (arg1, arg2, callback) {
        callback(testerr, arg1 + arg2);
    };
    _.asyncMemoize(fn)(1, 2, function (err, result) {
        test.equal(err, testerr);
    });
    test.done();
};

exports['async: asyncMemoize custom hash function'] = function (test) {
    test.expect(2);
    var testerr = new Error('test');

    var fn = function (arg1, arg2, callback) {
        callback(testerr, arg1 + arg2);
    };
    var fn2 = _.asyncMemoize(fn, function () {
        return 'custom hash';
    });
    fn2(1, 2, function (err, result) {
        test.equal(result, 3);
    });
    fn2(2, 2, function (err, result) {
        test.equal(result, 3);
    });
    test.done();
};

exports['async: asyncWhile'] = function (test) {
    var call_order = [];

    var count = 0;
    _.asyncWhile(
        function () {
            call_order.push(['test', count]);
            return (count < 5);
        },
        function (cb) {
            call_order.push(['iterator', count]);
            count++;
            cb();
        },
        function (err) {
            test.same(call_order, [
                ['test', 0],
                ['iterator', 0], ['test', 1],
                ['iterator', 1], ['test', 2],
                ['iterator', 2], ['test', 3],
                ['iterator', 3], ['test', 4],
                ['iterator', 4], ['test', 5],
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

})(typeof exports === 'undefined' ? this['async_tests'] = {}: exports);
