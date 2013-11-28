(function() {
  var undefined;
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('sendUncaughtException', {
    // This will run before each test in this module.
    setup: function() {
      delete window.onuncaughtException;
    }
  });

  test('are defined', function(){
    expect(2);
    ok(sendUncaughtException, 'sendUncaughtException is defined');
    ok(exceptionalException, 'exceptionalException is defined');
  });

  test('property propagation', function(){
    expect(1);
    // This tests the basic structure of exceptionalException, and the style of property use.
    window.f = function(){
      function f() {
        console.log('someProp:', ef.someProp);
        return ef.someProp;
      }
      var ef = f;
      ef.someProp = window.f.someProp;
      window.f = ef;
      return ef();
    };
    window.f.someProp = 'custom';
    f();
    window.f.someProp = 'new custom value';
    strictEqual(f(), window.f.someProp);
  });


  test('onuncaughtException\'s return value should get returned', function(){
    window.onuncaughtException = function(exception) {
      return 'returnValue';
    };
    strictEqual(sendUncaughtException(new Error('test')), 'returnValue', 'new Error input, should still equal returnValue');
    strictEqual(sendUncaughtException('raw string test'), 'returnValue', 'raw string input, should still equal returnValue');
  });

  module('exceptionalException');

  asyncTest('exceptionalException', function(){
    expect(2);

    // Assuming we have a extendFunction.js devDependency with tests passing,
    extendFunction('confirm', function(args, oldConfirm) {
      ok('confirm called', 'confirm was called');
      start();
    });

    ok(_.isNumber(exceptionalException('string input')), 'exceptionalException should return a timer id from setTimeout');

  });


/*
extendFunction.js:
  module('prototype, constructor, and length copied over properly');
  extendFunction('confirm', function(args, oldConfirm) {
    strictEqual(window.confirm, oldConfirm,
    return oldConfirm;
  });

-
  if process and no fireUncaughtException then just throw instead of calling fireUncaughtException
*/



}());
