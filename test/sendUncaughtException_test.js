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
      window.onuncaughtException = undefined;
    }
  });

  test('are defined', function(){
    expect(2);
    ok(sendUncaughtException, 'sendUncaughtException is defined');
    ok(fatalException, 'fatalException is defined');
  });

  test('property propagation', function(){
    expect(1);
    // This tests the basic structure of fatalException, and the style of property use.
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

  module('fatalException');

  test('fatalException', function(){
    expect(1);

    // Assuming we have a extendFunction.js devDependency with tests passing,
    window.confirm = function(message) {
      // greater than 2 because the library has a hardcoded '\n\n' in the confirm call
      test('confirm was called', function(){
        expect(1);
        ok(message.length > 2, 'confirm was called');
      });
    };

    var result = fatalException('string input');
    var isNumber = _.isNumber(result);
    if (isNumber) {
      ok(isNumber, 'fatalException should return a timer id from setTimeout');
    } else {
      console.log({I: result, type: typeof result, isNumber: isNumber});
    }
  });

  test('toString property gets used', function(){
    var err = new Error('a');
    err.toString = function() {
      ok('errors toString got called', 'everything is ok');
    };
    err + 'string';
  });
/*
function SimpleError() {
}
SimpleError.prototype.toString = function () {
  return 'fact';
};
strictEqual('facta', new SimpleError() + 'a', 'string concatentation should use an objects toString method');
*/

  test('CreateSimpleError', function(){
    var message = 'the error message';
    var err = new Error(message);
    var result = sendUncaughtException.CreateSimpleError(err);

    _([
      // found in all modern browsers:
      'name'
    , 'message'
    , 'stack'

      // FF:
    , 'fileName'
    , 'lineNumber'
    , 'columnNumber'

      // old safari:
    , 'line'
    , 'sourceId'
    , 'sourceURL'
    , 'expressionBeginOffset'
    , 'expressionCaretOffset'
    , 'expressionEndOffset'

      //ie 10:
    , 'number'

      // old chrome, node:
    , 'arguments'
    , 'type'
    ]).forEach(function(item) {
      if (err[item]) {
        if (!ok(
          result[item],
          'result should contain key:' + item
        )) { console.log(result) } else {
          if (!ok(
            result[item] === err[item],
            'with value:' + err[item] + ' actual:' + result[item] + ' type:' + typeof result[item]
          )) { console.log(result[item], err[item]) }
        }
      }
    });
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
