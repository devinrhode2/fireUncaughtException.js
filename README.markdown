### fireUncaughtExcepton

For most people, you probably DO NOT want to use this low-level library.
Instead, you might do this:
```javascript
try {
  // javascript
} catch (e) {
  onuncaughtException(e);
}
```
or this:
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

`fireUncaughtExcepton` will simply call `onuncaughtException` in a safe way. If an exception occurs, it will first check if it's defined and that it is a function. If it is both of these, then we create a `confirm` dialog, asking the user if they would be willing to **email** the error to support@domain.com, "because we failed to report it". Instead of a using a confirm alert dialog, you can use a user setting for "send information to company X?" just setting the exceptionalException.emailErrors to try. (to ask user to email errors or not)

q


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