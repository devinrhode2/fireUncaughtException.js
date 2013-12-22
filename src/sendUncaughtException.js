/*!
 * sendUncaughtException.js - Catch exceptions and send them to window.onuncaughtException(e).
 * return sendUncaughtException(e) is just a more robust way of calling this function
 *
 * github.com/devinrhode2/sendUncaughtException.js
 *
 * Copyright (c) 2013 Devin Gene Rhode
 * MIT Licensed
 */
(function(){
  var undefined; // safe reference to undefined


  // Establish "root" lodash style:
  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }


  // window['prop'] ensures closure compiler advanced mode doesn't mistakenly rename a property.
  function sendUncaughtException(ex) {
    try {
      // Ensure stack property is computed. Or, attempt to alias Opera 10's stacktrace property to it
      ex.stack || (ex.stacktrace ? (ex.stack = ex.stacktrace) : '');
    } catch ( _ ) {
      if (!root['sendUncaughtException']['allowPrimitives']) {
        if (window.console && console.error) {
          console.error('PRIMITIVE VALUE THROWN:' + ex + '\n\n' +
            'Please do throw new Error("message") instead of throw "message" so that you have a stack trace.\n\n' +
            'Stack trace up to this point:\n' + (new Error('creating stack')).stack +
            '\n\nTo silences these messages, do window.sendUncaughtException.allowPrimitives = true'
          );
        }
      }
    }

    // Hand uncaught exception over to onuncaughtException:
    try {
      return window.onuncaughtException(ex);
      // return is included to be as transparent as possible,
      // it makes new interesting use cases and patterns possible (which are yet to be known)
      // It may also be good for clearing resources, and makes the function more testable

      // I use this try-catch structure instead of several if checks for efficiency
    } catch (exceptionCallingOnUncaughtException) {

      // Attempt to give an Error with more clarity:
      if (window.onuncaughtException === undefined) {
        exceptionCallingOnUncaughtException = [
          'onuncaughtException is undefined.',
          'Example definition:',
          '  window.onuncaughtException = function (ex) {',
          '    // log ex.stack to your server',
          '  };'
        ].join('\n');
      }

      clearTimeout(exceptionalException(exceptionCallingOnUncaughtException));
      return [ex, exceptionalException(ex, 100)];

    }
  }
  // stringifyException is globally exposed for other libraries to use
  sendUncaughtException['stringifyException'] = function(ex) {
    // If input is a string, just return it
    // string typecheck is lodash style (search "function isString" in lodash.compat.js)
    if ( (typeof ex == 'string' || Object.prototype.toString.call(ex) == '[object String]') ) {
      return ex;
      // Even though Object.prototype.toString.call may give '[object String]',
      // new String('haha ') + 'other sting' === 'haha other string' (verified in chrome)
      // This is because it uses the String classes toString method
    }

    // Ensure stack property is computed. Or, attempt to alias Opera 10's stacktrace property to it
    ex.stack || (ex.stacktrace ? (ex.stack = ex.stacktrace) : '');
    /* interesting hack to always have a computed stack property:
    extendFunction('Error', function(args, oldError) {
      var ex = oldError.apply(window, args);
      ex.stack || (ex.stacktrace ? (ex.stack = ex.stacktrace) : '');
      return ex;
    });

    However, it ends up adding extra function calls to the stack frame..
    we could increase the number of stack frames given in stack traces in chrome.
    Also, we'd have to do this to every error type, (TypeError, ReferenceError, etc), and custom types would
    also need the extension applied
    */
    var result = '';
    /*
    var specialKeys = [
      // found in modern browsers:
      'name'         // all
    , 'message'      // all
    , 'stack'        // all
    , 'fileName'     // FF
    , 'lineNumber'   // FF
    , 'columnNumber' // FF

    , // old safari:
    , 'line'
    , 'sourceId'
    , 'sourceURL'
    , 'expressionBeginOffset'
    , 'expressionCaretOffset'
    , 'expressionEndOffset'

    , // old chrome:
    , 'arguments'
    , 'type'
    ];
    */
    for (var key in ex) {
      result += key + ':\n  ' + ex[key] + '\n';
    }
    return result;
  };

  // exceptionalException state variables
  var receivedErrorMessages = {};
  var lastMessageReceived = '';

  //var exceptionalException is too long. ee stands for exceptionalException
  var ee = function(message, msToWaitForMoreExceptions) {
    //'use strict' is senseless here. We don't need the crutch creating more exceptions, especially here.

    // Make sure the message is a string
    message = sendUncaughtException['stringifyException'](message);

    // Add the message to the email body.
    ee.mailtoParams.body += '\n\n' + message;

    // Mark message as received.
    if (receivedErrorMessages[message]) return 'already received this error message';
    receivedErrorMessages[message] = true;
    lastMessageReceived = message;

    return (function(){
      // Get a snapshot of the lastMessageReceived at the start of the timeout by using a closure
      var lastMessageAtStartOfTimeout = lastMessageReceived;
      // the return allows you to clearTimeout if you know you have another exceptional exception coming
      return setTimeout(function(){
        if (lastMessageReceived !== lastMessageAtStartOfTimeout) return; //bail and try sending on next timeout

        ee.mailtoParams.body += '\n\n' + ee.bodyEnd;

        var emailPreview = ee.bodyEnd; //re-use variable to conserve memory

        emailPreview = [
          'To:'      + ee.emailAddress,
          'Subject:' + ee.mailtoParams.subject,
                       ee.mailtoParams.body
        ].join('\n');

        // We have the error report containing all errors setup and are ready to send it,
        // let's ask the user if they are willing to:
        if (confirm(ee.emailPreface + '\n\n' + emailPreview)) {

          var finalUrl = message; //re-use message variable to conserve memory
          finalUrl = 'mailto:' + ee.emailAddress + '?';

          // mailtoParams need to be turned into a querystring and appended to finalUrl
          for (var param in ee.mailtoParams) {
            if (ee.mailtoParams.hasOwnProperty(param)) {
              finalUrl += param + '=' + encodeURIComponent(ee.mailtoParams) + '&';
            }
          }

          if (!window.open(
                 finalUrl,
                 null,
                 // arg string taken from twitters tweet button:
                 'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,left=445,top=240')) {
            // Time to give up?
          }
        }

        //throw 'crashing thread to clear resources??'
      }, msToWaitForMoreExceptions || 34); // Wait for 2 frames by default: (1000/60) * 2 = 33.3...
    })();
  };

  // default options
  var defaults = {
    emailAddress:            'support@' + location.hostname +
    ', engineering+exceptionalJSError@' + location.hostname,
    emailPreface: 'EMAIL ERROR? \n\n' +
      'We had a serious error and were not able to report it. \n\n' +
      'Pressing "OK" will open up your default email application to send this email:',
    mailtoParams: {/*
      subject: See default below.
      body: *START* of the body of the email. See default below.
      cc: Feel free to add cc and bcc properties
    */},
    /*END* of the email*/
    bodyEnd: 'Hope this helps.'
  };

  // copy over options from root['exceptionalException'] to ee, falling back to defaults.
  // first ensure root['exceptionalException'] is an object type for inside this for loop
  objectTypes[typeof root['exceptionalException']] ||  (root['exceptionalException'] = {});
  for (var opt in defaults) {
    if (defaults.hasOwnProperty(opt)) {
      ee[opt] = root['exceptionalException'][opt] || defaults[opt];
    }
  }

  // Either ee.mailtoParams.subject/body
  // are defined by now   OR (we will assign it to our default value)
  ee.mailtoParams.subject || (ee.mailtoParams.subject = 'Automatic error reporting failed, here\'s why');
  ee.mailtoParams.body    || (ee.mailtoParams.body    = 'Errors listed below:');
  // If you want the user to customize these things when composing their email, you can set them to a
  // space character. If you set it to empty string, that is falsey and the the default will be used instead

  root['exceptionalException'] = ee;


  // Export/define function just like lodash
  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as a named module like jQuery and underscore.js
    define("sendUncaughtException", [], function () {
      return sendUncaughtException;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      freeModule['exports'] = sendUncaughtException;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports['sendUncaughtException'] = sendUncaughtException;
    }
  }
  else {
    // in a browser or Rhino
    root['sendUncaughtException'] = sendUncaughtException;
  }

})();