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

Include the higher-level library <a href="http://Github.com/devinrhode2/shield.js">**Shield.js**</a> in your page, and tell it what libraries you are using. It'll handle the rest.

If you work on javascript libraries, please read on. This library is a low-level component that Shield.js uses, and you may also be interested in using.

[![Build Status](https://secure.travis-ci.org/devinrhode2/sendUncaughtException.png?branch=master)](http://travis-ci.org/devinrhode2/sendUncaughtException)

[![Selenium Test Status](https://saucelabs.com/buildstatus/sendUncaughtException)](https://saucelabs.com/u/sendUncaughtException)
[![Selenium Browser Matrix](https://saucelabs.com/browser-matrix/sendUncaughtException.svg)](https://saucelabs.com/u/sendUncaughtException)

#### Vision
I'd like to work with libraries to establish `window.onuncaughtException` as a standard, so you don't have to
re-define library functions.

Eventually I'm sure it will be very clear for browsers to also send exceptions to this same function,
but perhaps as an event like `load` on the `window` object.

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
handler like I do, you may want to use this component in your library.

# Usage:

```javascript
try {
  // code
} catch (e) {
  return sendUncaughtException(e);
}
```

`sendUncaughtException` simply calls `window.onuncaughtException` — but if there's an exception
in doing so, we pass that fatal exception to `fatalException`.

`fatalException` will wait 34 milliseconds (2 frames) by default until it is no longer receiving any new exceptions,
and then creates an email report of the errors and asks the user if they are willing to send it with a `confirm` dialog.
If they hit OK, a window for a `mailto` link with all the info pre-populated pops up.

The `confirm` dialog also happens to be a quick and convenient way to
discover errors in your `window.onuncaughtException` handler.

If you want to do something other than ask users to email errors, fork this library and redefine `fatalException`

Also, this libraries method for turning an exception into a string is exposed as `sendUncaughtException.createStringyException`. The method takes in an exception and returns a JSON-stringifiable exception with an enhanced toString method. Because of this, you can just concatenate it with other strings and not lose any information about the exception. The stringified format is:
```
someProperty:
 someValue
```

Furthermore, if you pass a string into this method, it will just be returned. If you want a real exception object, create one yourself and pass it in, like this:
```
sendUncaughtException.createStringyException(new Error('your string'))
```


# Options
fatalException adds properties onto itself as options.

The options and their defaults are listed around line 129 in `sendUncaughtException.js` at `var defaultOptions`

To customize any of these options, do:
```javascript
fatalException.option = 'your new value';
```

You can use fatalException for other mission-critical fails:

```javascript
try {
  loadScript('jquery')
} catch (e) {
  return fatalException('failed to load jQuery.')
}
```

By default `fatalException` will wait 34 milliseconds for other errors to reel in, you can set this to
0 or any other time my passing in the number as the second parameter to `fatalException`. For example:
```javascript
fatalException('failed to load jQuery.', 5000); // wait for other load failures
```
Futhermore, `fatalException` returns the timer id from setTimeout, allowing you to
`clearTimeout` if you know you're going to call `fatalException` again very shortly.

# Download

```
npm install devinrhode2/sendUncaughtException --save
```

This downloads the version on the master branch on github. No other versions are available at this time.

Enjoy! Please file issues and/or give me direct feedback via email. I use gmail and my username is devinrhode2 everywhere.

*Except in the latest chrome, which gives you the exception object as the 5th parameter to `window.onerror`
