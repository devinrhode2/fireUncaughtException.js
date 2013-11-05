function fireUncaughtExcepton(uncaughtException) {
  // uncaughtException's get sent to onuncaughtException:
  try {
    onuncaughtException(uncaughtException);

    // I use this try-catch structure instead of several if checks for efficiency
  } catch (exceptionCallingOnUncaughtException) { // what a gnarly exception..

    if (typeof onuncaughtException === 'undefined') {

      exceptionalException(new Error('You need assign window.onuncaughtException to some function.'));

    } else { // apparently `onuncaughtException` IS DEFINED...
      if (Object.prototype.toString.call(onuncaughtException) != '[object Function]') {
        exceptionalException(new TypeError('onuncaughtException is not a function'));
      } else {
        exceptionalException(exceptionCallingOnUncaughtException);
        exceptionalException(uncaughtException);
      }
    }

  } // catch exceptionCallingOnUncaughtException
}

/**
exceptionalException

An exceptionalException is when there is an exception calling window.onuncaughtException.

You can also use it for any other scenario where you
catch an exception and can't really do anything about it.

The function prompts the user asking if they could send an email about the
which is defined in the 3rd statement in this funciton.
If the user agrees to this message by hitting OK, then a mailto link
will be opened with the body= the javascript stack traces.

exceptionalException adds properties onto itself as options.
It doesn't need to be part of stack traces, so a function
expression works instead of a function declaration(){ }

Options are:
 - emailErrors: boolean. Defaults to asking the user the confirmDialogMessage for emailing errors or not.
 - confirmDialogMessage: Defaults to:
    "Email error?

     We had a serious issue and were not able to automatically report an error.
     Click "ok" to send an email about the error so we can fix it.

     Thanks!"
 - email: Email address to send errors to. Defaults to unrecordedJavaScriptError@{domain},support@{domain} (all subdomains are removed)
 - mailtoParams.subject: Subject of email
 - mailtoParams.body: Top of the email message
 - stringifyError: function used to turn input to exceptionalException into a string
     when it is not a string (exception or potentially something else..)
You need to set options after the library loads.
It is, after all, about catching and reporting errors.
If you have javascript above the library that has an error,
the purpose has been defeated.

@type function
@example
   // Attempt to perform basic mission critical tasks
   try {
     loadScript('jquery')
   } catch (e) {
     exceptionalException('failed to load jQuery.')
   }
 */

window.exceptionalException = function(message) {
  //'use strict'; //'use strict' is senseless here. We don't need the crutch creating exceptions here.

  var receivedErrorMessages = {};
  var lastMessageReceived = '';

  //define the actual core function: (options are initialized below)
  window.exceptionalException = function(message) {
    //check if the user has approved emailing errors
    if (!ee.emailErrors) return 'User does not want to email errors.';

    console.log('exceptionalException received:', message);

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
  ee.emailErrors = confirm(ee.confirmDialogMessage);

  //now that we have our initialization done and state variables defined, let it roll
  return exceptionalException(message);
};