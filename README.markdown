### fireUncaughtExcepton

Usage:
```javascript
try {
  //code...
} catch (uncaughtException) {
  fireUncaughtExceptonEvent(uncaughtException);
}
```

This will call `onuncaughtException` in a safe way.