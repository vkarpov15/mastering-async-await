# Async/Await: The Good Parts

The `async` and `await` keywords are new additions to JavaScript as part of the
2017 edition of the language specification. The `async` keyword modifies a function,
either a normal `function() {}` or an arrow function `() => {}`, to mark it as an
_async function_. In an async function, you can use the `await` keyword to pause
the function's execution until a promise settles. In the below function, the `await`
keyword pauses the function's execution for approximately 1 second.

<div class="example-header-wrap"><div class="example-header">Example 1.1</div></div>

```javascript
[require:example 1.1$]
```

You can use the `await` keyword anywhere in the body of an async function. This means
you can use `await` in `if` statements, `for` loops, and `try/catch` blocks. Below
is another way to pause an async function's execution for about 1 second.

<div class="example-header-wrap"><div class="example-header">Example 1.2</div></div>

```javascript
async function test() {
  // Wait 100ms 10 times. This function also prints after 1 sec.
  for (let i = 0; i < 10; ++i) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log('Hello, World!');
}

test();
```

There is one major restriction for using `await`: you can only use `await`
within the body of a function that's marked `async`. The following code throws a
`SyntaxError`.

<div class="example-header-wrap"><div class="example-header">Example 1.3</div></div>

```javascript
function test() {
  const p = new Promise(resolve => setTimeout(resolve, 1000));
  // SyntaxError: Unexpected identifier
  await p;
}

test();
```

In particular, you can't use `await` in a closure embedded in an async function, unless
the closure is also an async function. The below code also throws a `SyntaxError`.

<div class="example-header-wrap"><div class="example-header">Example 1.4</div></div>

```javascript
const assert = require('assert');

async function test() {
  const p = Promise.resolve('test');
  assert.doesNotThrow(function() {
    // "SyntaxError: Unexpected identifier" because the above
    // function isn't async. Closure = function inside a function
    await p;
  });
}
```

As long as you don't create a new function, you can use `await` underneath any
number of `for` loops and `if` statements.

<div class="example-header-wrap"><div class="example-header">Example 1.5</div></div>

```javascript
async function test() {
  while (true) {
    // Convoluted way to print out "Hello, World!" once per
    // second by pausing execution for 200ms 5 times
    for (let i = 0; i < 10; ++i) {
      if (i % 2 === 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    console.log('Hello, World!');
  }
}
```

<div class="page-break"></div>

## Return Values

You can use `async/await` for more than just pausing execution. The return
value of `await` is the value the promise is fulfilled with. This means you can
assign a variable to an asynchronously-computed value in code that looks
synchronous.

<div class="example-header-wrap"><div class="example-header">Example 1.6</div></div>

```javascript
async function test() {
  // You can `await` on a non-promise without getting an error.
  let res = await 'Hello World!';
  console.log(res); // "Hello, World!"

  const promise = new Promise(resolve => {
    // This promise resolves to "Hello, World!" after 1s
    setTimeout(() => resolve('Hello, World!'), 1000);
  });
  res = await promise;
  // Prints "Hello, World!". `res` is equal to the value the
  // promise resolved to.
  console.log(res);

  // Prints "Hello, World!". You can `await` in function params!
  console.log(await promise);
}
```

An async function **always** returns a promise. When you `return` from an async
function, JavaScript resolves the promise to the value you returned. This means
calling async functions from other async functions is very natural. You can
`await` on the async function call and get the async function's "return value".

<div class="example-header-wrap"><div class="example-header">Example 1.7</div></div>

```javascript
async function computeValue() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // "Hello, World" is the resolved value for this function call
  return 'Hello, World!';
}

async function test() {
  // Prints after 1 second. `computeValue` returns a promise!
  console.log(await computeValue());
}
```

This book will refer to the value you `return` from an async function as the
_resolved value_. In `computeValue` above, "Hello, World!" is the resolved
value, `computeValue()` still returns a promise. This distinction is subtle
but important: the value you `return` from an async function body is **not**
the value that an async function call like `computeValue()` without `await`
returns.

You can also return a promise from an async function. In that case, the
promise the async function returns will be fulfilled or rejected whenever the
resolved value promise is fulfilled or rejected. Below is another async function that fulfills to 'Hello, World!' after 1 second:

<div class="example-header-wrap"><div class="example-header">Example 1.8</div></div>

```javascript
async function computeValue() {
  // The resolved value is a promise. The promise returned from
  // `computeValue()` will be fulfilled with 'Hello, World!'
  return new Promise(resolve => {
    setTimeout(() => resolve('Hello, World!'), 1000);
  });
}
```

If you `return` a promise from an async function, the resolved value will
still not equal the return value. The below example demonstrates that the
`resolvedValue` promise that the function body returns is not the same as
the return value from `computeValue()`.

<div class="example-header-wrap"><div class="example-header">Example 1.9</div></div>

```javascript
let resolvedValue = Promise.resolve('Hello, World!');
const computeValue = async () => resolvedValue;

async function test() {
  // No `await` below, so `returnValue` will be a promise
  const returnValue = computeValue();
  // `false`. Return value never strictly equals resolved value.
  console.log(returnValue === resolvedValue);
}
```

Async/await beginners often mistakenly think they need to `return` a promise
from an async function. They likely read that an async function always returns
a promise and think they're responsible for returning a promise. An async function
always returns a promise, but, like in example 1.9, JavaScript creates the returned promise for you.

<div class="example-header-wrap"><div class="example-header">Example 1.10</div></div>

```javascript
async function computeValue() {
  // Adding `Promise.resolve()` below is unnecessary. It adds
  // perf overhead because you're creating an unnecessary promise
  // "Unnecessary code is not as harmless as I thought. It sends
  // the misleading signal that it's necessary" - Paul Graham
  return Promise.resolve('Hello, World!');
}
```

<div class="page-break"></div>

## Error Handling

One of the most important properties of async/await is that you can use `try/catch`
to handle asynchronous errors. Remember that a promise may be either fulfilled
or rejected. When a promise `p` is fulfilled, JavaScript evaluates `await p`
to the promise's value. What about if `p` is rejected?

<div class="example-header-wrap"><div class="example-header">Example 1.11</div></div>

```javascript
async function test() {
  try {
    const p = Promise.reject(new Error('Oops!'));
    // The below `await` throws
    await p;
  } catch (error) {
    console.log(err.message); // "Oops!"
  }
}
```

If `p` is rejected, `await p` throws an error that you can catch with a
normal JavaScript `try/catch`. Note that the `await` statement is what throws
an error, **not** the promise instantiation.

This `try/catch` behavior is a powerful tool for consolidating error handling.
The `try/catch` block above can catch synchronous errors as well as asynchronous
ones. Suppose you have code that throws a `TypeError: cannot read property 'x' of undefined` error:

<div class="example-header-wrap"><div class="example-header">Example 1.12</div></div>

```javascript
async function test() {
  try {
    const bad = undefined;
    bad.x;
    const p = Promise.reject(new Error('Oops!'));
    await p;
  } catch (error) {
    // "cannot read property 'x' of undefined"
    console.log(error.message);
  }
}
```

In callback-based code, you had to watch out for synchronous errors like `TypeError`
separately from asynchronous errors. This lead to a lot of server crashes and
red text in Chrome consoles, because discipline doesn't scale.

Consider using a callback-based approach instead of async/await. Suppose you have
a black-box function `test()` that takes a single parameter, a `callback`.
If you want to ensure you catch every possible error, you need 2 `try/catch`
calls: one around `test()` and one around `callback()`. You also need to check
whether `test()` called your callback with an error. In other words, every
single async operation needs 3 distinct error handling patterns!

<div class="example-header-wrap"><div class="example-header">Example 1.13</div></div>

```javascript
function testWrapper(callback) {
  try {
    // There might be a sync error in `test()`
    test(function(error, res) {
      // `test()` might also call the callback with an error
      if (error) {
        return callback(error);
      }
      // And you also need to be careful that both accessing
      // `res.x` and calling `callback()` don't throw.
      try {
        return callback(null, res.x);
      } catch (error) {
        return callback(error);
      }
    });
  }
}
```

When there's this much boilerplate for error handling, even the most rigorous
and disciplined developers end up missing a spot. The result is uncaught errors,
server downtime, and buggy user interfaces. Below is an equivalent example with
async/await. You can handle the 3 distinct error cases from example 1.12 with
a single pattern.

<div class="example-header-wrap"><div class="example-header">Example 1.14</div></div>

```javascript
async function testWrapper() {
  try {
    // `try/catch` will catch sync errors in `test()`, async
    // promise rejections, and errors with accessing `res.x`.
    const res = await test();
    return res.x;
  } catch (error) {
    throw error;
  }
}
```

Let's take a look at how the `throw` keyword works with async functions now that
you've seen how `try/catch` works. When you `throw` in an async function,
JavaScript will reject the returned promise.
Remember that the value you `return` from an async function is called the
resolved value. Similarly, this book will refer to the value you `throw` in
an async function as the _rejected value_.

<div class="example-header-wrap"><div class="example-header">Example 1.15</div></div>

```javascript
async function computeValue() {
  // `err` is the "rejected value"
  const err = new Error('Oops!');
  throw err;
}

async function test() {
  try {
    const res = await computeValue();
    // Never runs
    console.log(res);
  } catch (error) {
    console.log(error.message); // "Oops!"
  }
}
```

Remember that the `computeValue()` function call itself does **not** throw an
error in the `test()` function. The `await` keyword is what throws an error that
you can handle with `try/catch`. The below code will print "No Error" unless you
uncomment the `await` block.

<div class="example-header-wrap"><div class="example-header">Example 1.16</div></div>

```javascript
async function computeValue() {
  throw new Error('Oops!');
};

async function test() {
  try {
    const promise = computeValue();
    // With the below line commented out, no error will be thrown
    // await promise;
    console.log("No Error");
  } catch (error) {
    console.log(error.message); // Won't run
  }
}
```

<div class="page-break"></div>

Just because you can `try/catch` around a promise doesn't necessarily mean you
should. Since async functions return promises, you can also use `.catch()`:

<div class="example-header-wrap"><div class="example-header">Example 1.17</div></div>

```javascript
async function computeValue() {
  throw new Error('Oops!');
};

async function test() {
  let err = null;
  await computeValue().catch(_err => { err = _err; });
  console.log(err.message);
}
```

Both `try/catch` and `catch()` have their place. In particular, `catch()`
makes it easier to centralize your error handling. A common async/await
novice mistake is putting `try/catch` at the top of every single function.
If you want a common `handleError()` function to ensure you're handing all
errors, you're better off using `catch()`.

<div class="example-header-wrap"><div class="example-header">Example 1.18</div></div>

```javascript
// If you find yourself doing this, stop!
async function fn1() {
  try {
    /* Bunch of logic here */
  } catch (err) {
    handleError(err);
  }
}

// Do this instead
async function fn2() {
  /* Bunch of logic here */
}

fn2().catch(handleError);
```

<div class="page-break"></div>

## Retrying Failed Requests

Let's tie together loops, return values, and error handling to handle a challenge
that's painful with callbacks: retrying failed requests. Suppose you had to make
HTTP requests to an unreliable API.

With callbacks or promise chains, retrying failed requests requires recursion,
and recursion is less readable than the synchronous alternative of writing
a `for` loop. Below is a simplified implementation of a `getWithRetry()` function
using callbacks and the [`superagent` HTTP client](https://www.npmjs.com/package/superagent).

<div class="example-header-wrap"><div class="example-header">Example 1.19</div></div>

```javascript
function getWithRetry(url, numRetries, callback, count) {
  count = count || 0;
  superagent.get(url).end(function(error, res) {
    if (error) {
      if (count >= numRetries) { return callback(error); }
      return getWithRetry(url, numRetries, callback, count + 1);
    }
    return callback(null, res.body);
  });
}
```

Recursion is subtle and tricky to understand relative to a loop.
Plus, the above code ignores the possibility of sync errors, because the
`try/catch` spaghetti highlighted in example 1.13 would make this example
unreadable. In short, this pattern is both brittle and cumbersome.

With async/await, you don't need recursion and you need one `try/catch` to
handle sync and async errors. The async/await implementation is built on `for`
loops, `try/catch`, and other constructs that should be familiar to even the
most junior of engineers.

<div class="example-header-wrap"><div class="example-header">Example 1.20</div></div>

```javascript
async function getWithRetry(url, numRetries) {
  let lastError = null;
  for (let i = 0; i < numRetries; ++i) {
    try {
      // Note that `await superagent.get(url).body` doesn't work
      const res = await superagent.get(url);
      // Early return with async functions works as you'd expect
      return res.body;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
```

More generally, async/await makes executing async operations in series trivial.
For example, let's say you had to load a list of blog posts from an HTTP API
and then execute a separate HTTP request to load the comments for each blog
post. This example uses the excellent [JSONPlaceholder API](https://jsonplaceholder.typicode.com/) that provides good test data.

<div class="example-header-wrap"><div class="example-header">Example 1.21</div></div>

```javascript
async function run() {
  const root = 'https://jsonplaceholder.typicode.com';
  const posts = await getWithRetry(`${root}/posts`, 3);
  for (const { id } of posts) {
    const comments =
      await getWithRetry(`${root}/comments?postId=${id}`, 3);
    console.log(comments);
  }
}
```

If this example seems trivial, that's good, because that's how programming
should be. The JavaScript community has created an incredible hodge-podge of
tools for executing asynchronous tasks in series, from [`async.waterfall()`](https://caolan.github.io/async/docs.html#waterfall) to [Redux sagas](https://www.npmjs.com/package/redux-saga) to [zones](https://github.com/domenic/zones) to [co](https://www.npmjs.com/package/co). Async/await makes all of these libraries
and more unnecessary. Do you even need [Redux middleware](https://www.codementor.io/vkarpov/beginner-s-guide-to-redux-middleware-du107uyud) anymore?

This isn't the whole story with async/await. This chapter glossed over numerous
important details, including how promises integrate with async/await and
what happens when two asynchronous functions run simultaneously. Chapter 2
will focus on the internals of promises, including the difference between
"resolved" and "fulfilled", and explain why promises are perfectly suited
for async/await.

<div class="page-break"></div>

## Exercise 1: HTTP Request Loops

The purpose of this exercise is to get comfortable with using
loops and `if` statements with async/await. You will need to use
the [`fetch()` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
to get a list of blog posts on
thecodebarbarian.com, and then
execute a separate `fetch()` to get the raw markdown `content`
for each blog post.

Below are the API endpoints. The API endpoints are hosted on
Google Cloud Functions at `https://us-central1-mastering-async-await.cloudfunctions.net`.
- `/posts`
gets a list of blog posts. Below is an example post:

```
{ "src":"./lib/posts/20160304_circle_ci.md",
  "title":"Setting Up Circle CI With Node.js",
  "date":"2016-03-04T00:00:00.000Z",
  "tags":["NodeJS"],
  "id":51 }
```

- `/post?id=${id}`
gets the markdown content of a blog post by its `id` property.
The above blog post has `id` = 0, so you can get its content from
this endpoint: [`https://us-central1-mastering-async-await.cloudfunctions.net/post?id=51`](https://us-central1-mastering-async-await.cloudfunctions.net/post?id=51). Try opening this URL in your browser, the output looks
like this:

```
{"content":"*This post was featured as a guest blog post..."}
```

Loop through the blog posts and find the id of the first post
whose `content` contains the string "async/await hell".

Below is the starter code. You may copy this code and run it in Node.js using [the `node-fetch` npm module](https://www.npmjs.com/package/node-fetch), or you may complete this exercise in your browser
on CodePen at [`http://bit.ly/async-await-exercise-1`](http://bit.ly/async-await-exercise-1)

```javascript
const root = 'https://' +
  'us-central1-mastering-async-await.cloudfunctions.net';

async function run() {
  // Example of using `fetch()` API
  const res = await fetch(`${root}/posts`);
  console.log(await res.json());
}

run().catch(error => console.error(error.stack));
```

<div class="page-break"></div>

## Exercise 2: Retrying Failed Requests

The purpose of this exercise is to implement a function that retries failed
HTTP requests using async/await and `try/catch` to handle errors. This example
builds on the correct answer to exercise 1.1, but with the added caveat that
every other `fetch()` request fails.

For this exercise, you need to implement the `getWithRetry()` function below.
This function should `fetch()` the `url`, and if the request fails this
function should retry the request up to `numRetries` times. If you see
"Correct answer: 76", congratulations, you completed this exercise.

Like exercise 1.1, you can complete this exercise locally by copying the
below code and using the [`node-fetch` npm module](https://www.npmjs.com/package/node-fetch).
You can also complete this exercise in your browser on CodePen at the following
url: [http://bit.ly/async-await-exercise-2](http://bit.ly/async-await-exercise-2).

```javascript
async function getWithRetry(url, numRetries) {
  return fetch(url).then(res => res.json());
}

// Correct answer for exercise 1.1 below
async function run() {
  const root = 'https://' +
    'us-central1-mastering-async-await.cloudfunctions.net/post';
  const posts = await getWithRetry(`${root}/posts`, 3);

  for (const p of posts) {
    console.log(`Fetch post ${p.id}`);
    const content = await getWithRetry(`${root}?id=${p.id}`, 3);
    if (content.content.includes('async/await hell')) {
      console.log(`Correct answer: ${p.id}`);
      break;
    }
  }
}

run().catch(error => console.error(error.stack));

// This makes every 2nd `fetch()` fail
const _fetch = fetch;
let calls = 0;
(window || global).fetch = function(url) {
  const err = new Error('Hard-coded fetch() error');
  return (++calls % 2 === 0) ? Promise.reject(err) : _fetch(url);
}
```
