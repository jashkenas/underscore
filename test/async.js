if (typeof require !== 'undefined') {
  var _ = require('../underscore');
}

(function (exports) {

exports['nextTick'] = function(test){
    var call_order = [];
    _.nextTick(function(){call_order.push('two');});
    call_order.push('one');
    setTimeout(function(){
        test.same(call_order, ['one','two']);
        test.done();
    }, 50);
};

exports['nextTick in node'] = function(test){
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

exports['nextTick in the browser'] = function(test){
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

})(typeof exports === 'undefined' ? this['async_tests'] = {}: exports);
