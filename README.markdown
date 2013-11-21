# Question

**How can I register a global "uncaught exception" handler for javascript in the browser?**

<a href="http://nodejs.org/api/process.html#process_event_uncaughtexception">
**In node it's simple**</a>,
in the browser, all you have is
<a href="http://webcache.googleusercontent.com/search?q=cache%3Ahttps%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FGlobalEventHandlers.onerror%3Fredirectlocale%3Den-US%26redirectslug%3DWeb%252FAPI%252FWindow.onerror&oq=cache%3Ahttps%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FGlobalEventHandlers.onerror%3Fredirectlocale%3Den-US%26redirectslug%3DWeb%252FAPI%252FWindow.onerror&aqs=chrome..69i57j69i58.3391j0j4&sourceid=chrome&espv=210&es_sm=91&ie=UTF-8">
**`window.onerror`**</a>... which works like this:

```javascript
window.onerror = function(message, url, lineNo) {
  // If failing script was hosted on a different domain, the message is just "Script error."
  // No line number or url!
}
```

Butt wait! We have the `try-catch-finally` block!

Problem: How can I catch all errors and send them to one function?
Solution: Write a library, establish a backwards-compatible standard, and encourage all javascript libraries to add a
try-catch block, and send exceptions they catch to `window.onuncaughtException`

I have a solution in progress that helps you re-define library functions and catch their errors:
http://Github.com/devinrhode2/shield.js

Most people will want to just send uncaught exceptions to a
`window.onuncaughtException` function, without a library, like this:
```javascript
try {
  // javascript
} catch (e) {
  if (window.onuncaughtException) {
    window.onuncaughtException(e);
  } else {
    throw e;
  }
}
```

Maybe even skip the `if` check!
```javascript
try {
  // javascript
} catch (e) {
  window.onuncaughtException(e);
}
```

If you really believe that the javascript community should have a way to register a global `uncaughtException`
handler, you'll probably want to use this library.

# Usage:

```javascript
try {
  // code
} catch (e) {
  sendUncaughtException(e);
}
```

`sendUncaughtException` simply calls `onuncaughtException`, but if there's an exception
calling `window.onuncaughtException`, we have an `exceptionalException`.

`exceptionalException` will wait 100 milliseconds until it is no longer receiving any new exceptions,
and then creates an email report of the errors and asks the user if they are willing to send it with a `confirm` dialog.
If they hit OK, a window for a `mailto` link with all the info pre-populated pops up.

The `confirm` dialog is also a quick and convenient 
You'll discover your own errors first via the `confirm` dialog,
sparing you from opening the console.

If you don't want to ask users to email errors, you can `noop` exceptionalException like this:
```javascript
window.exceptionalException = function(){};
```

exceptionalException adds properties onto itself as options.

Options are:
 - emailErrors: boolean. Defaults to asking the user the confirmDialogMessage for emailing errors or not.
 - emailPreface: Defaults to:
=====
    "Email error?

     We had a serious issue and were not able to automatically report an error.
     Click "ok" to send an email about the error so we can fix it.

     Thanks!"
 - email: Email address to send errors to. Defaults to unrecordedJavaScriptError@{domain},support@{domain} (all subdomains are removed)
 - mailtoParams.subject: Subject of email
 - mailtoParams.body: Top of the email message
 - stringifyError: function used to turn input to exceptionalException into a string
     when it is not a string (exception or potentially something else..)

You can use exceptionalException for other mission-critical fails:

```javascript
try {
  loadScript('jquery')
} catch (e) {
  exceptionalException('failed to load jQuery.')
}
```
