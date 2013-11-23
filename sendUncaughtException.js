/*!
 * sendUncaughtException.js - Catch exceptions and send them to window.onuncaughtException(e).
 * sendUncaughtException(e) is just a more robust way of calling this function
 *
 * github.com/devinrhode2/sendUncaughtException.js
 *
 * Copyright (c) 2013 sendUncaughtException.js contributors
 * MIT Licensed
 */
(function(){
  var undefined; // safe reference to undefined

  function sendUncaughtException(exception) {
    // Ensure stack property is computed. Or, attempt to alias Opera 10's stacktrace property to it
    exception.stack || (exception.stack = exception.stacktrace);

    // Hand uncaught exception over to onuncaughtException:
    try {
      return window.onuncaughtException(exception);
      // return is included to be as transparent as possible,
      // it makes new interesting use cases and patterns possible (which are yet to be known)
      // It may also be good for clearing resources..

      // I use this try-catch structure instead of several if checks for efficiency
    } catch (exceptionCallingOnUncaughtException) {

      // Attempt to give an Error with more clarity:
      if (window.onuncaughtException === undefined) {
        exceptionCallingOnUncaughtException = [
          'onuncaughtException is undefined.',
          'Please define one; like this for example:',
          '  window.onuncaughtException = function (exception) {',
          '    // log exception.stack to your server',
          '  };'
        ].join('\n');
      }

      // Using ['prop'] to prevent Closure Compiler advanced mode from re-naming it
      clearTimeout(exceptionalException(exceptionCallingOnUncaughtException));
                   exceptionalException(exception, 100);

    }
  }
  window['sendUncaughtException'] = sendUncaughtException;

  window['exceptionalException'] = function(message) {
    //'use strict' is senseless here. We don't need the crutch creating more exceptions, especially here.

    var receivedErrorMessages = {};
    var lastMessageReceived = '';

    // Define the actual core function: (INITIALIZATION BELOW)
    function exceptionalException(message, msToWaitForMoreExceptions) {
      // Make sure the message is a string, lodash style (search "function isString" in lodash.compat.js)
      if ( !(typeof message == 'string' || toString.call(message) == '[object String]') ) {
        message = ee.stringifyError(message);
      }

      // Add the message to the email body.
      ee.mailtoParams.body += '\n\n' + message;

      // Mark message as received.
      if (receivedErrorMessages[message]) return 'already received this error message';
      receivedErrorMessages[message] = true;
      lastMessageReceived = message;

      // Get a snapshot of the lastMessageReceived at the start of the timeout by using a closure
      (function(){
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
                   // arg string taken from twitters tweet button
                   'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,left=445,top=240')) {
              // Just let it be.
            }
          }

          //throw 'crashing thread to clear resources??'
        }, msToWaitForMoreExceptions || 34); // Wait for 2 frames by default: (1000/60) * 2 = 33.3...
      })();
    }

    // # INITIALIZATION:

    // Alias:
    var ee = exceptionalException;

    // gee stands for "Global Exceptional Exception"
    var gee = window['exceptionalException'];

    var defaultOptions = {
      emailAddress:            'support@' + location.hostname +
      ', engineering+exceptionalJSError@' + location.hostname,
      emailPreface: 'EMAIL ERROR? \n\n' +
        'We had a serious error and were not able to report it. \n\n' +
        'Pressing "OK" will open up your default email application to send this email:',
      mailtoParams: {/*
        subject: See default below.
        body: Start of the email. See default below.
        cc: Feel free to add cc and bcc properties
      */},
      bodyEnd: 'Hope this helps.',

      // stringifyError is globally exposed for other libraries to use
      stringifyError: function (hash) {
        // Ensure stack property is computed. Or, attempt to alias Opera 10's stacktrace property to it
        hash.stack || (hash.stack = hash.stacktrace);
        /* Interesting hack to always have a computed stack property:
        extendFunction('Error', function(args, oldError) {
          var ret = oldError.apply(window, args);
          ret.stack || (ret.stack = ret.stacktrace);
          return ret;
        });

        However, it ends up adding like 4 extra function calls to the stack frame..
        we could increase the number of stack frames given in stack traces in chrome.
        Also, we'd have to do this to every error type, (TypeError, ReferenceError, etc) and
        */
        var result = '';
        for (var key in hash) {
          result += key + ':\n  ' + hash[key] + '\n';
        }
        return result;
      }
    };

    // copy over options from window['exceptionalException'] to exceptionalException, falling back to defaults.
    for (var option in defaultOptions) {
      if (defaultOptions.hasOwnProperty(option)) {
        ee[option] = gee[option] || defaultOptions[option];
      }
    }

    // Ensure we still have a subject + body in case gee.mailtoParams was used instead of the default mailtoParams
    ee.mailtoParams.subject || (ee.mailtoParams.subject = 'Automatic error reporting failed, here\'s why');
    ee.mailtoParams.body    || (ee.mailtoParams.body    = 'Errors listed below:');

    window['exceptionalException'] = exceptionalException;

    // Start!
    return exceptionalException(message);
  };

})();