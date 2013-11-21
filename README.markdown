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

How do you catch all errors and send them to one function?

I have a solution in progress that helps you re-define library functions and catch their errors:
http://Github.com/devinrhode2/shield.js

##### Vision
I'd like to work with libraries to establish `window.onuncaughtException` as a standard, so you don't have to
re-define their library function.

Eventually I'm sure it will be very clear for browsers to also send exceptions to this same function,
but perhaps as a `window` event like `load`.

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
handler like I do, you'll probably want to use this library.

# Usage:

```javascript
try {
  // code
} catch (e) {
  sendUncaughtException(e);
}
```

`sendUncaughtException` simply calls `window.onuncaughtException` — but if there's an exception
in doing so, we pass that exceptional exception to, well, `exceptionalException`.

`exceptionalException` will wait 100 milliseconds until it is no longer receiving any new exceptions,
and then creates an email report of the errors and asks the user if they are willing to send it with a `confirm` dialog.
If they hit OK, a window for a `mailto` link with all the info pre-populated pops up.

The `confirm` dialog also happens to be a quick and convenient way to discover your own errors.

If you want to do something else with string and non-string errors, consider not using this library,
copying out just the `sendUncaughtException` function, or just redefining exceptionalException to something else.

# Options
exceptionalException adds properties onto itself as options.

Options are:
 - emailPreface: Defaults to:
=====
    "Email error?

     We had a serious issue and were not able to automatically report an error.
     Click "ok" to send an email about the error so we can fix it.

     Thanks!"
 - email: Email address to send errors to. Defaults to unrecordedJavaScriptError@{domain},support@{domain} (all subdomains are removed)
 - mailtoParams.subject: Subject of email
 - mailtoParams.bodyStart: **TOP** of the email message, before the list of errors
 - mailtoParams.bodyEnd: **END** of the email message, after the list
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
