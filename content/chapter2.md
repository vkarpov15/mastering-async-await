# Promises From The Ground Up

Async/await is built on top of promises. Async functions return promises, and
`await` only pauses execution of an async function when it operates on a promise.
In order to grok the internals of async/await, you need to understand how
promises work from base principles. JavaScript promises didn't become what they
are today by accident, they were specifically designed to enable paradigms like
async/await.

In the ES6 spec, a [promise is a class](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-executor) whose
constructor takes an `executor` function. Instances of the Promise class have a
[`then()` function](http://www.ecma-international.org/ecma-262/6.0/#sec-promise.prototype.then). Promises in the ES6 spec have several other properties, but for now you can
ignore them. Below is a skeleton of a simplified `Promise` class.

```javascript
class Promise {
  // `executor` takes 2 parameters, `resolve()` and `reject()`.
  // The executor function is responsible for calling `resolve()`
  // or `reject()` when the async operation succeeded (resolved)
  // or failed (rejected).
  constructor(executor) {}

  // `onFulfilled` is called if the promise is fulfilled, and
  // `onRejected` if the promise is rejected. For now, you can
  // think of 'fulfilled' and 'resolved' as the same thing.
  then(onFulfilled, onRejected) {}
}
```

A promise is a state machine with 3 states:

* pending: the initial state, means that the underlying operation is in progress
* fulfilled: the underlying operation succeeded and has an associated value
* rejected: the underlying operation failed and has an associated error

A promise that is not pending is called _settled_. So settled is a shorthand that
means a promise is either fulfilled or rejected.

With this in mind, below is a first draft of a promise constructor that handles this state machine. Note that the property names `state`, `settled`, and `value`
are non-standard. Actual ES6 promises do *not* expose these properties publicly,
