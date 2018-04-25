# Async/Await: The Good Parts

The `async` and `await` keywords are new additions to JavaScript as part of the
2017 edition of the language specification. The `async` keyword modifies a function,
either a normal `function() {}` or an arrow function `() => {}`, to mark it as an
_async function_. In an async function, you can use the `await` keyword to pause
the function's execution until a promise settles. In the below function, the `await`
keyword pauses the function's execution for approximately 1 second.

<div class="example-header-wrap"><div class="example-header">Example 1.1</div></div>

```javascript
async function test() {
  // This function will print "Hello, World!" after 1 second.
  await new Promise(resolve => setTimeout(() => resolve(), 1000));
  console.log('Hello, World!');
}

test();
```

You can use the `await` keyword anywhere in the body of an async function. This means
you can use `await` in `if` statements, `for` loops, and `try/catch` blocks. Below
is another way to pause an async function's execution for about 1 second.

<div class="example-header-wrap"><div class="example-header">Example 1.2</div></div>

```javascript
async function test() {
  // Wait for 100ms 10 times. This function also prints after 1 second.
  for (let i = 0; i < 10; ++i) {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
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
  const p = new Promise(resolve => setTimeout(() => resolve(), 1000));
  // SyntaxError: Unexpected identifier
  await p;
}
```

In particular, you can't use `await` in a closure embedded in an async function, unless
the closure is also an async function. The below code also throws a `SyntaxError`.

<div class="example-header-wrap"><div class="example-header">Example 1.4</div></div>

```javascript
const assert = require('assert');

async function test() {
  const p = Promise.resolve('test');
  assert.doesNotThrow(function() {
    // "SyntaxError: Unexpected identifier" because the above function
    // is **not** marked async. "Closure" = function inside a function
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
    // Convoluted way to print out "Hello, World!" once per second by
    // pausing execution for 200ms 5 times
    for (let i = 0; i < 10; ++i) {
      if (i % 2 === 0) {
        await new Promise(resolve => setTimeout(() => resolve(), 200));
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

  // Prints "Hello, World!". You can use `await` in function params!
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
  await new Promise(resolve => setTimeout(() => resolve(), 1000));
  // "Hello, World" is the _resolved value_ for this function call
  return 'Hello, World!';
}

async function test() {
  // Prints "Hello, World!" after 1s. `computeValue` returns a promise!
  console.log(await computeValue());
}
```

This book will refer to the value you `return` from an async function as the
_resolved value_. In `computeValue` above, "Hello, World!" is the resolved
value, `computeValue()` still returns a promise. This is a subtle but important
distinction that you will learn more about in Chapter 3.

## Error Handling

One of the most important properties of async/await is that you can use `try/catch`
to handle asynchronous errors. Remember that a promise may be either fulfilled
or rejected. When a promise `p` is fulfilled, JavaScript evaluates `await p`
to the promise's value. What about if `p` is rejected?

<div class="example-header-wrap"><div class="example-header">Example 1.8</div></div>

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

<div class="example-header-wrap"><div class="example-header">Example 1.9</div></div>

```javascript
async function test() {
  try {
    const bad = undefined;
    bad.x;
    const p = Promise.reject(new Error('Oops!'));
    await p;
  } catch (error) {
    // "cannot read property 'x' of undefined"
    console.log(err.message);
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

<div class="example-header-wrap"><div class="example-header">Example 1.10</div></div>

```javascript
function testWrapper(callback) {
  try {
    // There might be a sync error in `test()`
    test(function(error, res) {
      // `test()` might also call the callback with an error
      if (error) {
        return callback(error);
      }
      // And you also need to be careful that accessing `res.x` doesn't
      // throw **and** calling `callback()` doesn't throw.
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
async/await. You can handle the 3 distinct error cases from example 1.10 with
a single pattern.

<div class="example-header-wrap"><div class="example-header">Example 1.11</div></div>

```javascript
async function testWrapper() {
  try {
    // `try/catch` will catch sync errors in `test()`, async promise
    // rejections, and errors with accessing `res.x`.
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

<div class="example-header-wrap"><div class="example-header">Example 1.12</div></div>

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

<div class="example-header-wrap"><div class="example-header">Example 1.13</div></div>

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

## Retrying Failed Requests

Let's tie together loops, return values, and error handling to handle a challenge
that's particularly nasty with callbacks: retrying failed requests.
