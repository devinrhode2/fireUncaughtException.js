# Question

How can I register a global "uncaught exception" handler for javascript in the browser?
<strong><a href="http://nodejs.org/api/process.html#process_event_uncaughtexception">In node it's simple</a></strong>,
in the browser, all you have is
<strong><code><a href="http://webcache.googleusercontent.com/search?q=cache%3Ahttps%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FGlobalEventHandlers.onerror%3Fredirectlocale%3Den-US%26redirectslug%3DWeb%252FAPI%252FWindow.onerror&oq=cache%3Ahttps%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FGlobalEventHandlers.onerror%3Fredirectlocale%3Den-US%26redirectslug%3DWeb%252FAPI%252FWindow.onerror&aqs=chrome..69i57j69i58.3391j0j4&sourceid=chrome&espv=210&es_sm=91&ie=UTF-8">
window.onerror</a></code></strong>, which works like this:

```javascript
window.onerror = function(message, url, lineNo) {
  // Script with error was hosted on a different domain, the message is just "Script error." with no line number or url!
}
```

But don't forget, we have the `try-catch-finally` block!

Problem: How can I catch all errors and send them to one function?
Solution: Write a library, establish a backwards-compatible standard, and encourage all javascript libraries to add a
try-catch block, and send exceptions they catch to `window.onuncaughtException`

I have a solution in progress that helps you re-define library functions and catch their errors:
http://Github.com/devinrhode2/shield.js

Most people will want to fire an `uncaughtException`, without a library, like this:
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
} catch (uncaughtException) {
  onuncaughtException(uncaughtException);
}
```

Now, if you really believe that the javascript community should have a way to register a global `uncaughtException`
handler, you may want to really bark at them if they don't define one!

But what if they did define a `window.onuncaughtException` function, but there was an exception when you called it?!
Now you have 2 exceptions on your hands that may go un-discovered if not found when testing.

That's where _this_ library comes in. It barks at the developer for you, and asks the user (via <code><a href="http://lmgtfy.com/?confirm+javascript+function">confirm</a></code>)
if they would like to email the error to you (via `window.open('mailto:`).

Now, if you do not ever want to re-`throw` the exception, and are set on sending the exception to an
`oncaughtException` function, use `fireUncaughtExcepton`:

Usage:
```javascript
try {
  //code...
} catch (uncaughtException) {
  fireUncaughtExcepton(uncaughtException);
}
```

`fireUncaughtExcepton` simply calls `onuncaughtException`, but if an exception occurs in doing so, it
first checks if it's defined as a function. If it is, then we have an `exceptionalException`, which
creates a `confirm` dialog listing all the errors, asking the user if they would be willing to **email**
the error to support@domain.com, "because we failed to report it". Instead of a using a confirm alert
dialog, you can use a user setting for "send information to company X?" just setting the
exceptionalException.emailErrors to try. (to ask user to email errors or not)

===============


If you don't want to email errors, you can `noop` exceptionalException like this:
```javascript
window.exceptionalException = function(){};
```

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
