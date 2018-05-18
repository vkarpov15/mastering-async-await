# Promises From The Ground Up

Async/await is built on top of promises. Async functions return promises, and
`await` only pauses an async function when it operates on a promise.
In order to grok the internals of async/await, you need to understand how
promises work from base principles. JavaScript promises didn't become what they
are by accident, they were carefully designed to enable paradigms like
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
  // or `reject()` when the async operation succeeded or failed
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
is a no-op. This detail is pivotal for async/await, because how would `await` work
if a promise changed state from 'FULFILLED' to 'REJECTED' after an async function was done?

<div class="example-header-wrap"><div class="example-header">Example 2.2</div></div>

```javascript
[require:example 2.2$]
```

Below is a diagram showing the promise state machine.

<svg xmlns="http://www.w3.org/2000/svg" width="600" height="390" viewbox="0 0 400 260">
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

With this in mind, below is a first draft of a promise constructor that implements
the state transitions. Note that the property names `state`, `resolve`,
`reject`, and `value` used below are non-standard. Actual ES6 promises do **not**
expose these properties publicly, so don't try to use `p.value` or `p.resolve()`
with a native JavaScript promise.

<div class="example-header-wrap"><div class="example-header">Example 2.4</div></div>

```javascript
[require:example 2.4$]
```

The promise constructor manages the promise's state and calls the executor
function. You also need to implement the `then()` function that
let clients define handlers that run when a promise is settled. The `then()`
function takes 2 function parameters, `onFulfilled()` and `onRejected()`.
A promise must call the `onFulfilled()` callback if the promise is fulfilled,
and `onRejected()` if the promise is rejected.

For now, `then()` is simple, it push `onFulfilled()` and
`onRejected()` onto an array `chained`. Then, `resolve()` and `reject()` will call
them when the promise is fulfilled or rejected. If the promise is already
settled, the `then()` function will queue up `onFulfilled()` or `onRejected()`
to run on the next tick of the event loop using `setImmediate()`.

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

<div class="example-header-wrap"><div class="example-header">Example 2.6</div></div>

```javascript
[require:example 2.6$]
```

## Promise Chaining

One key feature that the promise implementation thus far does not support is
promise chaining. Promise chaining is a common pattern for keeping async code
flat, although it has become far less useful now that generators and async/await
have widespread support. Here's how the `getWikipediaHeaders()` function
from the introduction looks with promise chaining:

<div class="example-header-wrap"><div class="example-header">Example 2.7</div></div>

```javascript
function getWikipediaHeaders() {
  return stat('./headers.txt').
    then(res => {
      if (res == null) {
        // If you return a promise from `onFulfilled()`, the next
        // `then()` call's `onFulfilled()` will get called when
        // the returned promise is fulfilled...
        return get({ host: 'www.wikipedia.org', port: 80 });
      }
      return res;
    }).
    then(res => {
      // So whether the above `onFulfilled()` returns a primitive or a
      // promise, this `onFulfilled()` gets the headers object
      return writeFile('./headers.txt', JSON.stringify(res.headers));
    }).
    then(() => console.log('Great success!')).
    catch(err => console.err(err.stack));
}
```

While async/await is a superior pattern, promise chaining is still useful,
and still necessary to complete a robust promise implementation. In order
to implement promise chaining, you need to make 3 changes to the promise
implementation from example 2.5:

1. The `then()` function needs to return a promise. The promise returned from `then()` should be resolved with the value returned from `onFulfilled()`
2. The `resolve()` function needs to check if `value` is a thenable, and, if so, transition to fulfilled or rejected only when `value` transitions to fulfilled or rejected.
3. If `resolve()` is called with a thenable, the promise needs to stay 'PENDING', but future calls to `resolve()` and `reject()` must be ignored.

The first change, improving the `then()` function, is shown below. There are
two other changes: `onFulfilled()` and `onRejected()` now have default
values, and are wrapped in a try/catch.

<div class="example-header-wrap"><div class="example-header">Example 2.8</div></div>

```javascript
then(_onFulfilled, _onRejected) {
  // `onFulfilled` is a no-op by default...
  if (typeof _onFulfilled !== 'function') _onFulfilled = (v => v);
  // and `onRejected` just rethrows the error by default
  if (typeof _onRejected !== 'function') {
    _onRejected = err => { throw err; };
  }
  return new Promise((resolve, reject) => {
    // Wrap `onFulfilled` and `onRejected` for two reasons:
    // consistent async and `try/catch`
    const onFulfilled = res => setImmediate(() => {
      try {
        resolve(_onFulfilled(res));
      } catch (err) { reject(err); }
    });
    const onRejected = err => setImmediate(() => {
      try {
        // Note this is `resolve()`, **not** `reject()`. The `then()`
        // promise will be fulfilled if `onRejected` doesn't rethrow
        resolve(_onRejected(err));
      } catch (err) { reject(err); }
    });

    if (this.state === 'FULFILLED') return onFulfilled(this.value);
    if (this.state === 'REJECTED') return onRejected(this.value);
    this.chained.push({ onFulfilled, onRejected });
  });
}
```

Now `then()` returns a promise. However, there's still work to be done: if
`onFulfilled()` returns a promise, `resolve()` needs to be able to handle it.
In order to support this, the `resolve()` function will need to use `then()`
in a two-step recursive dance. Below is the expanded `resolve()` function
that shows the 2nd necessary change.

<div class="example-header-wrap"><div class="example-header">Example 2.9</div></div>

```javascript
resolve(value) {
  if (this.state !== 'PENDING') return;
  if (value === this) {
    return this.reject(TypeError(`Can't resolve promise with itself`);
  }
  // Is `value` a thenable? If so, fulfill/reject this promise when
  // `value` fulfills or rejects. The Promises/A+ spec calls this
  // process "assimilating" the other promise (resistance is futile).
  const then = this._getThenProperty(value);
  if (typeof then === 'function') {
    try {
      return then.call(value, v => this.resolve(v),
        err => this.reject(err));
    } catch (error) {
      return reject(error);
    }
  }

  // If `value` is **not** a thenable, transition to fulfilled
  this.state = 'FULFILLED';
  this.value = value;
  this.chained.
    forEach(({ onFulfilled }) => setImmediate(onFulfilled, value));
}
// Helper to wrap getting the `then()` property because the Promises/A+
// spec has 2 tricky details: you can only access the `then` property
// once, and if getting `value.then` throws the promise should reject
_getThenProperty(value) {
  if (value == null) return null;
  if (!['object', 'function'].includes(typeof value)) return null;
  try {
    return value.then;
  } catch (error) {
    // Unlikely edge case, Promises/A+ section 2.3.3.2 enforces this
    this.reject(error);
  }
}
```

Finally, the third change, ensuring that a promise doesn't change state
once `resolve()` is called with a thenable, requires changes to both
`resolve()` and the promise constructor. The motivation for this change
is to ensure that `p2` in the below example is fulfilled, **not** rejected.

<div class="example-header-wrap"><div class="example-header">Example 2.10</div></div>

```javascript
const p1 = new Promise(resolve => setTimeout(resolve, 50));
const p2 = new Promise(resolve => {
  resolve(p1);
  throw new Error('Oops!'); // Ignored because `resolve()` was called
});
```

One way to achieve this is to create a helper function that wraps
`this.resolve()` and `this.reject()` that ensures `resolve()` and `reject()`
can only be called once.

<div class="example-header-wrap"><div class="example-header">Example 2.11</div></div>

```javascript
// After you call `resolve()` with a promise, extra `resolve()` and
// `reject()` calls will be ignored despite the 'PENDING' state
_wrapResolveReject() {
  let called = false;
  const resolve = v => {
    if (called) return;
    called = true;
    this.resolve(v);
  };
  const reject = err => {
    if (called) return;
    called = true;
    this.reject(err);
  };
  return { resolve, reject };
}
```

Once you have this `_wrapResolveReject()` helper, you need to use it in
`resolve()`:

<div class="example-header-wrap"><div class="example-header">Example 2.12</div></div>

```javascript
resolve(value) { // Beginning omitted for brevity
  if (typeof then === 'function') {
    // If `then()` calls `resolve()` with a 'PENDING' promise and then
    // throws, the `then()` promise will be fulfilled like example 2.10
    const { resolve, reject } = this._wrapResolveReject();
    try {
      return then.call(value, resolve, reject);
    } catch (error) { return reject(error); }
  }
} // End omitted for brevity
```

Also, you need to use `_wrapResolveReject()` in the constructor itself:

<div class="example-header-wrap"><div class="example-header">Example 2.13</div></div>

```javascript
constructor(executor) { // Beginning omitted for brevity
  // This makes the promise class handle example 2.10 correctly...
  const { resolve, reject } = this._wrapResolveReject();
  try {
    executor(resolve, reject);
    // because if `executor` calls `resolve()` and then throws,
    // the below `reject()` is a no-op
  } catch (err) { reject(err); }
}
```

With all these changes, the complete promise implementation, which you can
find at [bit.ly/simple-promise](http://bit.ly/simple-promise), now passes
all 872 test cases in the [Promises/A+ spec](https://promisesaplus.com/).
The Promises/A+ spec is [a subset of the ES6 promise spec](https://promisesaplus.com/implementations#the-ecmascript-specification) that focuses on `then()` and the promise constructor.

## `catch()` and Other Helpers

The ES6 promise spec is a superset of the Promises/A+ spec that adds several
convenient helper methods on top of the `then()` function. The most commonly
used helper is the `catch()` function. Like the synchronous `catch` keyword, the
`catch()` function typically appears at the end of a promise chain to handle
any errors that occurred.

The `catch()` function may sound complex, but it is just a thin layer of syntactic
sugar on top of `then()`. The `catch()` is so sticky because
the name `catch()` is a powerful metaphor for explaining what this helper is used for.
Below is the full implementation of `catch()`.

<div class="example-header-wrap"><div class="example-header">Example 2.14</div></div>

```javascript
catch(onRejected) {
  return this.then(null, onRejected);
}
```

Why does this work? Recall from example 2.8 that `then()` has a default `onRejected()`
argument that rethrows the error. So when a promise is rejected, subsequent `then()`
calls that only specify an `onFulfilled()` handler are skipped.

<div class="example-header-wrap"><div class="example-header">Example 2.15</div></div>

```javascript
[require: example 2.15$]
```

There are several other helpers in the ES6 promise spec. The `Promise.resolve()`
and `Promise.reject()` helpers are both commonly used for testing and examples,
as well as to convert a thenable into a fully fledged promise.

<div class="example-header-wrap"><div class="example-header">Example 2.16</div></div>

```javascript
[require: example 2.16$]
```

Below is the implementation of `resolve()` and `reject()`.

<div class="example-header-wrap"><div class="example-header">Example 2.17</div></div>

```javascript
static resolve(v) {
  return new Promise(resolve => resolve(v));
}
static reject(err) {
  return new Promise((resolve, reject) => reject(err));
}
```

The `Promise.all()` function is another important helper, because it lets you execute multiple promises in
parallel and `await` on the result. The below code will run two instances of
the `run()` function in parallel, and pause execution until they're both done.

<div class="example-header-wrap"><div class="example-header">Example 2.18</div></div>

```javascript
[require: example 2.18$]
```

`Promise.all()` is the preferred mechanism for executing async functions in parallel.
To execute async functions in series, you would use a `for` loop and `await` on
each function call.

`Promise.all()` is just a convenient wrapper around calling `then()` on an array
of promises and waiting for the result. Below is a simplified implementation of
`Promise.all()`:

<div class="example-header-wrap"><div class="example-header">Example 2.19</div></div>

```javascript
static all(arr) {
  let remaining = arr.length;
  if (remaining === 0) return Promise.resolve([]);
  // `result` stores the value that each promise is fulfilled with
  let result = [];
  return new Promise((resolve, reject) => {
    // Loop through every promise in the array and call `then()`. If
    // the promise fulfills, store the fulfilled value in `result`.
    // If any promise rejects, the `all()` promise rejects immediately.
    arr.forEach((p, i) => p.then(
      res => {
        result[i] = res;
        --remaining || resolve(result);
      },
      err => reject(err)));
  });
}
```

There is one more helper function defined in the ES6 spec, `Promise.race()`,
that will be an exercise. Other than `race()` and some minor details like
support for subclassing, the promise implementation in this chapter is
compliant with the ES6 spec. In the next chapter, you'll use your
understanding of promises to monkey-patch async/await and figure out what's
happening under the hood.

The key takeaways from this journey
of building a promise library from scratch are:

* A promise can be in one of 3 states: pending, fulfilled, or rejected. It can also be locked in to match the state of another promise if you call `resolve(promise)`.
* Once a promise is settled, it stays settled with the same value forever
* The `then()` function and the promise constructor are the basis for all other promise functions. The `catch()`, `all()`, `resolve()`, and `reject()` helpers are all syntactic sugar on top of `then()` and the constructor.

But before you start tinkering with the internals of async/await, here's 3 exercises
to expand your understanding of promises.

<div class="page-break"></div>

# Exercise 1: Promise Chains in Action

The purpose of this exercise is to get comfortable with using promise chaining.
While promise chaining is less useful now that async/await exists, promise
chaining is a useful complement to async/await in much the same way that
`forEach()` and `filter()` are useful for chaining array transformations.

Using the same endpoints as Exercise 1.1, which are explained below, find the blog
post entitled "Unhandled Promise Rejections in Node.js", load its content, and find the number of times the phrase "async/await" appears in the `content`.

Below are the API endpoints. The API endpoints are hosted on Google Cloud Functions
at `https://us-central1-mastering-async-await.cloudfunctions.net`

- `/posts` gets a list of blog posts. Below is an example post:

```
{ "src":"./lib/posts/20160304_circle_ci.md",
  "title":"Setting Up Circle CI With Node.js",
  "date":"2016-03-04T00:00:00.000Z",
  "tags":["NodeJS"],
  "id":51 }
```

- `/post?id=${id}` gets the markdown content of a blog post by its `id` property. The above blog post has `id` = 0, so you can get its content from this endpoint: [`https://us-central1-mastering-async-await.cloudfunctions.net/post?id=0`](https://us-central1-mastering-async-await.cloudfunctions.net/post?id=0). Try opening this URL in your browser, the output looks like this:

```
{"content":"*This post was featured as a guest blog post..."}
```

Below is the starter code. You may copy this code and run it in Node.js using [the `node-fetch` npm module](https://www.npmjs.com/package/node-fetch), or you may complete this exercise in your browser
on CodePen at [`http://bit.ly/async-await-exercise-21`](http://bit.ly/async-await-exercise-21)

```javascript
const root = 'https://' +
  'us-central1-mastering-async-await.cloudfunctions.net';

function run() {
  // Example of using `fetch()` API
  return fetch(`${root}/posts`).
    then(res => res.json()).
    then(posts => console.log(posts[0]));
}
run().catch(error => console.error(error.stack));
```

<div class="page-break"></div>

# Exercise 2: `Promise.race()`

The [ES6 promise spec](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) has one more helper method that this book hasn't covered yet:
[`Promise.race()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race).
The 
