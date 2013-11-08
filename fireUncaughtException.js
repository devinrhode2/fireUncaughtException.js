function fireUncaughtExcepton(uncaughtException) {
  // uncaughtException's get sent to onuncaughtException:
  try {
    onuncaughtException(uncaughtException);

    // I use this try-catch structure instead of several if checks for efficiency
  } catch (exceptionCallingOnUncaughtException) { // what a gnarly exception..

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


window.exceptionalException = function(message) {
  //'use strict'; //'use strict' is senseless here. We don't need the crutch creating exceptions here.

  var receivedErrorMessages = {};
  var lastMessageReceived = '';

  //define the actual core function: (options are initialized below)
  window.exceptionalException = function(message) {
    //check if the user has approved emailing errors
    if (!ee.emailErrors) return 'User does not want to email errors.';

    //make sure the message is a string
    if ( !(typeof message == 'string' || toString.call(message) == '[object String]') ) { //String type check from lodash.js compat build, search "function isString"
      //ensure stack property is computed
      message.stack;
      message = ee.stringifyError(message);
    }

    //Add the message to the email body.
    ee.mailtoParams.body += '\n\n' + message;

    //mark the message as received.
    if (receivedErrorMessages[message]) return 'already received this error message';
    receivedErrorMessages[message] = true;
    lastMessageReceived = message;

    //get a snapshot of the lastMessageReceived at the start of the timeout by using a closure
    (function(lastMessageAtStartOfTimeout){
      setTimeout(function(){
        //if lastMessageReceived has changed since the start of the timeout.. bail
        if (lastMessageReceived !== lastMessageAtStartOfTimeout) return;

        ee.mailtoParams.body += '\n\nSincerely, person';

        //re-use message variable under alias
        var finalUrl = message = 'mailto:' + ee.email + '?';

        //mailtoParams needs to be turned into a querystring parameters and appended to finalUrl
        for (var param in ee.mailtoParams) {
          if (ee.mailtoParams.hasOwnProperty(param)) {
            finalUrl += param + '=' + encodeURIComponent(ee.mailtoParams) + '&';
          }
        }

        // Now we will attempt to load the mailto link via popup, but if that fails we will just do a redirect to compose the email
        if (!window.open(finalUrl, null, 'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,left=445,top=240')) {
          //window.open arguments taken from twitters tweet button
          location.href = finalUrl;
          if (location.href !== finalUrl) {
            alert('System failed to redirect to compose email. ' +
                  'Email is shown below to copy and paste:\n\n' +
                  ee.mailtoParams.subject + '\n\n' +
                  ee.mailtoParams.body);
          }
        }
      }, 100);
    })(lastMessageReceived);

    //inform the world as to whether or not the user attempted to report an error or not
    return ee.emailErrors;
  };

  // ## Initialization:

  // alias:
  var ee = window.exceptionalException;
  ee.confirmDialogMessage || (
    ee.confirmDialogMessage =
      'Email error? \n\nWe had a serious issue and were not able ' +
      'to automatically report an error. Click "ok" to send an email ' +
      'about the error so we can fix it.\n\nThanks!'
  );
  ee.email || (
    //in these first 2 statements, ee.email becomes the domain name
    ee.email = location.hostname.split('.'),
    ee.email = ee.email[ee.email.length - 2] + '.' +
               ee.email[ee.email.length - 1],
    ee.email = 'unrecordedJavaScriptError@' + ee.email + ',support@' + ee.email
  );

  ee.mailtoParams || (ee.mailtoParams = {});
  ee.mailtoParams.subject || (ee.mailtoParams.subject = 'Automatic error report failed, it\'s included here.');
  ee.mailtoParams.body    || (ee.mailtoParams.body    = 'I found some javascript errors, they are listed below:');

  function stringifyError(hash) {
    var result = '';
    for (var key in hash) {
      result += key + ':\n  ' + hash[key] + '\n\n';
    }
    return result;
  }
  ee.stringifyError || (ee.stringifyError = stringifyError);


  //start!
  //first thing we want to do is ask the user if they even want to email errors.
  ee.emailErrors = confirm(ee.confirmDialogMessage); // TODO: Add in actual error message!!

  //now that we have our initialization done and state variables defined, let it roll
  return exceptionalException(message);
};