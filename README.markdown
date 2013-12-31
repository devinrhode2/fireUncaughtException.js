# Question

**How can I register a global "uncaught exception" handler for javascript in the browser?**

<a href="http://nodejs.org/api/process.html#process_event_uncaughtexception">
**In node it's simple.**</a>
In the browser, all you have is
<a href="http://webcache.googleusercontent.com/search?q=cache%3Ahttps%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FGlobalEventHandlers.onerror%3Fredirectlocale%3Den-US%26redirectslug%3DWeb%252FAPI%252FWindow.onerror&oq=cache%3Ahttps%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FGlobalEventHandlers.onerror%3Fredirectlocale%3Den-US%26redirectslug%3DWeb%252FAPI%252FWindow.onerror&aqs=chrome..69i57j69i58.3391j0j4&sourceid=chrome&espv=210&es_sm=91&ie=UTF-8">
**`window.onerror`**</a>... which works like this:

```javascript
window.onerror = function(message, url, lineNo) {
  // If failing script was hosted on a different domain, the message is just "Script error."
  // with no line number or url!
}
```

In order to get a real stack trace, all you have is the `try-catch` block*.

How do you catch all errors and send them to one function?

Include the higher-level library: <a href="http://Github.com/devinrhode2/shield.js">Shield.js</a>

#### Vision
I'd like to work with libraries to establish `window.onuncaughtException` as a standard, so you don't have to
re-define library functions.

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

If you strongly believe that the javascript community should have a way to register a global `uncaughtException`
handler like I do, you'll probably want to use this library.

# Usage:

```javascript
try {
  // code
} catch (e) {
  return sendUncaughtException(e);
}
```

`sendUncaughtException` simply calls `window.onuncaughtException` — but if there's an exception
in doing so, we pass that exceptional exception to, well, `exceptionalException`.

`exceptionalException` will wait 100 milliseconds until it is no longer receiving any new exceptions,
and then creates an email report of the errors and asks the user if they are willing to send it with a `confirm` dialog.
If they hit OK, a window for a `mailto` link with all the info pre-populated pops up.

The `confirm` dialog also happens to be a quick and convenient way to
discover errors in your `window.onuncaughtException` handler.

If you want to do something other than ask users to email errors, fork this library and redefine `exceptionalException`

Also, this libraries method for turning an exception into a string is exposed as `sendUncaughtException.stringifyException`. The method takes in an exception or string and returns a string.

# Options
exceptionalException adds properties onto itself as options.

The options and their defaults are listed around line 129 in `sendUncaughtException.js` at `var defaultOptions`

To customize any of these options, do:
```javascript
exceptionalException.option = 'your new value';
```

You can use exceptionalException for other mission-critical fails:

```javascript
try {
  loadScript('jquery')
} catch (e) {
  return exceptionalException('failed to load jQuery.')
}
```

By default `exceptionalException` will wait 34 milliseconds for other errors to reel in, you can set this to
0 or any other time my passing in the number as the second parameter to `exceptionalException`. For example:
```javascript
exceptionalException('failed to load jQuery.', 5000); // wait for other load failures
```
Futhermore, `exceptionalException` returns the timer id from setTimeout, allowing you to
`clearTimeout` if you know you're going to call `exceptionalException` again very shortly.

# Download

```
npm install devinrhode2/sendUncaughtException --save
```

This downloads the version on the master branch on github. No other versions are available at this time.

Enjoy! Please file issues and/or give me direct feedback via email. I use gmail and my username is devinrhode2 everywhere.

*Except in the latest chrome, which gives you the exception object as the 5th parameter to `window.onerror`
