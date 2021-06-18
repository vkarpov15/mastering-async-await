# Answers in the Back of the Book

### 1.1: HTTP Request Loops

**Correct Answer:** 76

The solution is to first `fetch()` the list of blog posts, and then loop through
each blog post and `fetch()` the blog post's contents. Async/await makes this
easy because you can `await` in a `for/of` loop. Just make sure you use
async/await in an async function!

```javascript
async function run() {
  const root = 'https://' +
    'us-central1-mastering-async-await.cloudfunctions.net';
  const posts = await fetch(`${root}/posts`).then(res => res.json());

  for (const p of posts) {
    const content = await fetch(`${root}/post?id=${p.id}`).
      then(res => res.json());
    if (content.content.includes('async/await hell')) {
      console.log(`Correct answer: ${p.id}`);
      break;
    }
  }
}
run().catch(error => console.error(error.stack));
```

### 1.2: Retrying Failed Requests

The answer is to use `try/catch` to handle any async errors and continue retrying up to
`numRetries` times. Use a `for` loop to execute requests, and `return` when a request
succeeds. Otherwise, try again until you run out of retries, and `throw` an error.

```javascript
async function getWithRetry(url, numRetries) {
  let error = null;
  for (let i = 0; i < numRetries; ++i) {
    try {
      const res = await fetch(url).then(res => res.json());
      return res;
    } catch(err) { error = err; }
  }
  throw error;
}
```

### 2.1: Promise Chains in Action

**Correct answer:** 6

_Promise chaining_ means you chain multiple `then()` calls together, and each `then()` call returns a
promise that resolves to the value the next `then()` call needs.

It helps to break this problem down into 4 steps:

1. Get the list of blog posts.
2. Find the blog post whose title equals "Unhandled Promise Rejections in Node.js".
3. Fetch additional information about the blog post by its id.
4. Count the number of times "async/await" appears in `post.content`.

Each of these steps is a one-liner. Just make each of these steps into a `then()` call as shown below.

```javascript
const root = 'https://' +
  'us-central1-mastering-async-await.cloudfunctions.net';

function run() {
  const title = 'Unhandled Promise Rejections in Node.js';
  // 1. Get the list of blog posts
  return fetch(`${root}/posts`).then(res => res.json()).
    // 2. Find the blog post whose title equals
    //    "Unhandled Promise Rejections in Node.js"
    then(posts => posts.find(p => p.title === title)).
    // 3. Fetch additional information about the blog post by its id.
    then(({ id }) => fetch(`${root}/post?id=${id}`)).
    then(res => res.json()).
    // 4. Count the number of times "async/await" appears in
    //    `post.content`.
    then(post => {
      const count = (post.content.match(/async\/await/g) || []).length;
      console.log(count);
    });
}
run().catch(error => console.error(error.stack));
```

### 2.2: `Promise.race()`

According to the problem statement, the `race()` function must return a promise, so the first
thing you should write is `return new Promise((resolve, reject) => {})`.

Now, the question is, when should you call `resolve()` or `reject()`? The `race()` function is
supposed to resolve or reject with the same value as the first promise that settles in `arr`.
So the answer is simple: add a `.then()` to every promise in `arr`, call `resolve()` when
that promise is fulfilled, or `reject()` when that promise is rejected.

```javascript
function race(arr) {
  return new Promise((resolve, reject) => {
    for (const promise of arr) {
      // Remember that calling `resolve()` or `reject()` multiple
      // times is a no-op, so no need to check for duplicate calls.
      promise.then(resolve, reject);
    }
  });
}
```

### 3.1: Implementing Custom Thenables

Remember that `then()` needs to execute the `HTTPRequest`, return a promise, and call `onFulfilled()` or `onRejected()` dependong on whether the request succeeded or failed.
The easiest way to do this is to create a promise that represents a call to `this.exec()`, and use that promise's `then()` function.

```javascript
class HTTPRequest {
  static create() { return new HTTPRequest(); }
  get(url) { /* ... */ }
  exec(callback) {
    fetch(this.url, this).then(res => res.json()).
      then(res => callback(null, res)).catch(callback);
  }
  then(onFulfilled, onRejected) {
    // Create a new promise that wraps calling `exec()`, and use
    // its `then()` function.
    const p = new Promise((resolve, reject) => {
      this.exec((err, res) => {
        if (err != null) return reject(err);
        resolve(res);
      });
    });
    return p.then(onFulfilled, onRejected);
  }
}
```

<div class="page-break"></div>

### 3.2: Async `forEach()`

The most common sticking point with this exercise is trying to use JavaScript's functional programming methods, like `map()` and `reduce()`, to write an async `forEach()`.
The easiest way is an old fashioned `for` loop as shown below.

```javascript
async function forEachAsync(arr, fn) {
  for (const el of arr) {
    await fn(el);
  }
}
```

It is possible to implement `forEachAsync()` using `reduce()`, just trickier.
The key insight is that you need to use `reduce()` to chain the `fn()` calls, so your accumulator needs to return a promise as shown below.

```javascript
async function forEachAsync(arr, fn) {
  return arr.reduce((promise, i) => promise.then(() => fn(arr[i])), Promise.resolve());
}
```