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

<div class="example-header-wrap"><div class="example-header">Example 2.1</div></div>

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

A promise that is not pending is called _settled_. In other words, a settled
promise is either fulfilled or rejected. Once a promise is settled,
it **cannot** change state.
For example, the below promise will remain fulfilled despite the `reject()` call.
Once you've called `resolve()` or `reject()` once, calling `resolve()` or `reject()`
is a no-op.

<div class="example-header-wrap"><div class="example-header">Example 2.2</div></div>

```javascript
[require:example 2.2$]
```

Below is a diagram showing the promise state machine.

<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewbox="0 0 400 260">
  <line x1="100" y1="150" x2="300" y2="80" style="stroke:#000;stroke-width:5" />
  <line x1="100" y1="150" x2="300" y2="220" style="stroke:#000;stroke-width:5" />

  <line x1="245" y1="100" x2="220" y2="94" style="stroke:#000;stroke-width:5" />
  <line x1="245" y1="100" x2="232" y2="119" style="stroke:#000;stroke-width:5" />

  <line x1="245" y1="200" x2="230" y2="180" style="stroke:#000;stroke-width:5" />
  <line x1="245" y1="200" x2="220" y2="206" style="stroke:#000;stroke-width:5" />

  <!-- Pending -->
  <ellipse rx="75" ry="30" cx="100" cy="150" fill="#000"/>
  <ellipse rx="72" ry="27" cx="100" cy="150" fill="#fff"/>
  <text x="49" y="158" font-family="Roboto" font-size="24">
    PENDING
  </text>

  <!-- Fulfilled -->
  <ellipse rx="75" ry="30" cx="300" cy="80" fill="#000"/>
  <ellipse rx="72" ry="27" cx="300" cy="80" fill="#fff"/>
  <text x="243" y="89" font-family="Roboto" font-size="24">
    FULFILLED
  </text>

  <!-- Rejected -->
  <ellipse rx="75" ry="30" cx="300" cy="220" fill="#000"/>
  <ellipse rx="72" ry="27" cx="300" cy="220" fill="#fff"/>
  <text x="245" y="228" font-family="Roboto" font-size="24">
    REJECTED
  </text>

  <!-- Settled -->
  <line x1="200" y1="250" x2="200" y2="50" style="stroke:#f00;stroke-width:5" />
  <text x="250" y="30" font-family="Roboto" font-size="24" fill="red">
    SETTLED
  </text>
</svg>

Below is a skeleton of the promise class. The general idea is
that the promise wraps an _executor function_, which runs an
asynchronous operation and calls `resolve()` if the operation
succeeded, or `reject()` if it failed. For this first example,
you can think of _fulfilled_ and _resolved_ as the same thing.

<div class="example-header-wrap"><div class="example-header">Example 2.3</div></div>

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


With this in mind, below is a first draft of a promise constructor that implements
the state transitions. Note that the property names `state`, `resolve`,
`reject`, and `value` used below are non-standard. Actual ES6 promises do *not*
expose these properties publicly, so don't try to use `p.value` to get the value of a
promise or call `p.resolve()` to resolve a real promise. This promise
implementation is meant to be a didactic example, and is not meant to be a
rigorous implementation of the promise spec.

<div class="page-break"></div>

<br>

<div class="example-header-wrap"><div class="example-header">Example 2.4</div></div>

```javascript
[require:example 2.4$]
```

The promise constructor manages the promise's state and calls the executor
function. However, you still need to implement the `then()` function, which
lets you define handlers that run when a promise is settled. The `then()`
function takes 2 function parameters, `onFulfilled()` and `onRejected()`.
A promise must call the `onFulfilled()` callback if the promise is fulfilled,
and `onRejected()` if the promise is rejected.

For now, `then()` is simple, its job will be to track `onFulfilled()` and
`onRejected()` in the `chained` array so `resolve()` and `reject()` can call
them when the promise is fulfilled or rejected. If the promise is already
settled, the `then()` function will call `onFulfilled()` or `onRejected()`
immediately.

<div class="example-header-wrap"><div class="example-header">Example 2.5</div></div>

```javascript
[require:example 2.5$]
```

This `Promise` class, while simple, represents most of the work necessary
to integrate with async/await. The `await` keyword doesn't explicitly check
if the value it operates on is `instanceof Promise`, it only checks for the
presence of a `then()` function. In general, any object that has a `then()`
function is called a _thenable_ in JavaScript. Below is an example of using the
custom `Promise` class with async/await.

```javascript
[require:example 2.6$]
```
