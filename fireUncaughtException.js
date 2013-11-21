/*!
 * fireUncaughtExcepton.js - Catch exceptions and send them to window.onuncaughtException(e).
 * fireUncaughtException(e) is just a more robust way of calling this function
 *
 * github.com/devinrhode2/fireUncaughtExcepton.js
 *
 * Copyright (c) 2013 fireUncaughtExcepton.js contributors
 * MIT Licensed
 */

// No (function(){ .. wrapper because there are no shared variables,
// not even for var window = this; because this code is only for the browser

// Closure Compiler will rename this function. With proper source-mapping, you can
function fireUncaughtExcepton(uncaughtException) {
  // uncaughtException's just handed over to onuncaughtException.
  try {
    return onuncaughtException(uncaughtException);
    // return is included to be as transparent as possible,
    // it makes new interesting use cases and patterns possible (which are yet to be known)
    // It may also be good for clearing resources..

    // I use this try-catch structure instead of several if checks for efficiency
  } catch (exceptionCallingOnUncaughtException) { // what a gnarly exception..!

    if (typeof onuncaughtException === 'undefined') {
      exceptionalException(new Error([
        'Please define a window.onuncaughtException function.',
        'For example:',
        '  window.onuncaughtException = function (uncaughtException) {',
        '    //log uncaughtException.stack to your server',
        '  };'
      ].join('\n')));
    } else { // apparently `onuncaughtException` IS DEFINED...
      if (Object.prototype.toString.call(onuncaughtException) != '[object Function]') {
        exceptionalException(new TypeError('onuncaughtException is not a function'));
      } else {
        exceptionalException(exceptionCallingOnUncaughtException);
      }
    }
    exceptionalException(uncaughtException);

  } // catch exceptionCallingOnUncaughtException
}
window['fireUncaughtExcepton'] = fireUncaughtExcepton;

window['exceptionalException'] = function(message) {
  //'use strict' is senseless here. We don't need the crutch creating more exceptions, especially here.

  var receivedErrorMessages = {};
  var lastMessageReceived = '';

  // Define the actual core function: (INITIALIZATION BELOW)
  window.exceptionalException = function(message) {
    // Make sure the message is a string, lodash style (search "function isString" in lodash.compat.js)
    if ( !(typeof message == 'string' || toString.call(message) == '[object String]') ) {
      // Ensure stack property is computed, or alias Opera 10's stacktrace property to it
      message.stack || (message.stack = message.stacktrace);
      message = ee.stringifyError(message);
    }

    // Add the message to the email body.
    ee.mailtoParams.body += '\n\n' + message;

    // Mark message as received.
    if (receivedErrorMessages[message]) return 'already received this error message';
    receivedErrorMessages[message] = true;
    lastMessageReceived = message;

    // Get a snapshot of the lastMessageReceived at the start of the timeout by using a closure
    (function(lastMessageAtStartOfTimeout){
      setTimeout(function(){
        if (lastMessageReceived !== lastMessageAtStartOfTimeout) return; //bail and try sending on next timeout

        ee.mailtoParams.body += '\n\nSincerely, person';

        var finalUrl = message; //re-use message variable under alias
        finalUrl = 'mailto:' + ee.email + '?';

        // mailtoParams needs to be turned into a querystring parameters and appended to finalUrl
        for (var param in ee.mailtoParams) {
          if (ee.mailtoParams.hasOwnProperty(param)) {
            finalUrl += param + '=' + encodeURIComponent(ee.mailtoParams) + '&';
          }
        }

        // We have the error report containing all errors setup and are ready to send it,
        // let's ask the user if they are willing to:
        if (confirm([
          ee.emailPreface + '\n',
          'To:' + ee.mailtoParams.email,
          'Subject:' + ee.mailtoParams.subject,
          ee.mailtoParams.body
        ].join('\n'))) {

          // If loading the mailto link via popup fails...
          if (!window.open(
                 finalUrl,
                 null,
                 // arg string taken from twitters tweet button
                 'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,left=445,top=240')) {
            // we will just do a redirect to compose the email
            location.href = finalUrl;
            if (location.href !== finalUrl) {
              alert('System failed to redirect to compose email. ' +
                    'Email is shown below to copy and paste:\n\n' +
                    ee.mailtoParams.subject + '\n\n' +
                    ee.mailtoParams.body);
            }
          }
        } else {
          return 'User does not want to email errors.';
        }

        throw 'crashing thread to clear resources';
      }, 100);
    })(lastMessageReceived);
  };

  // ## Initialization:

  // Alias:
  var ee = window.exceptionalException;
  ee.emailPreface || (
    ee.emailPreface =
      'Email error? We had a serious error and were not able to report it. ' +
      'Press "OK" to send this email from your mail application. '
  );
  ee.email || (
    // In these first 2 statements, ee.email becomes the domain name
    ee.email = location.hostname.split('.'),
    ee.email = ee.email[ee.email.length - 2] + '.' +
               ee.email[ee.email.length - 1],
    ee.email = 'support@' + ee.email + ',engineering+unrecordedJavaScriptError@' + ee.email
  );

  ee.mailtoParams || (ee.mailtoParams = {});
  ee.mailtoParams.subject || (ee.mailtoParams.subject = 'Automatic error report failed, it\'s included here.');
  ee.mailtoParams.body    || (ee.mailtoParams.body    = 'I found some javascript errors, they are listed below:');

  function stringifyError(hash) {
    var result = '';
    for (var key in hash) {
      result += key + ':\n  ' + hash[key] + '\n';
    }
    return result;
  }
  ee.stringifyError || (ee.stringifyError = stringifyError);


  // Start!
  // Now that we have our initialization done and state variables defined, let it roll
  return exceptionalException(message);
};