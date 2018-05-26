# Async/Await Internals

Promises are the fundamental tool for integrating with async/await. Now
that you've seen how promises work from the ground up, it's time to go from
the micro to the macro and see what happens when you `await` on a promise.
Even though async functions are flat like synchronous functions, they're
as asynchronous as the most callback-laden banana code under the hood.

As you might have already guessed, `await` makes JavaScript call `then()`
under the hood.

<div class="example-header-wrap"><div class="example-header">Example 3.1</div></div>

```javascript
[require:example 3.1$]
```

The `await` keyword causes JavaScript to _pause_ execution until the next
iteration of the event loop. In the below code, the `console.log()` after
the `await` runs **after** the `++currentId` code, even though the increment
is in a callback. The `await` keyword causes the async function to pause
and then resume later.

<div class="example-header-wrap"><div class="example-header">Example 3.2</div></div>

```javascript
[require:example 3.2$]
```

Notice that the `then()` function runs on the next tick, even though it is
fully synchronous. This means that `await` always pauses execution until at
least the next tick, even if the thenable is not async.The same thing happens
when the awaited promise is rejected. If you call
`onRejected(err)`, the `await` keyword throws `err` in your function body.

<div class="example-header-wrap"><div class="example-header">Example 3.3</div></div>

```javascript
[require:example 3.3$]
```

## `await` vs `return`

Recall that `return` in an async function resolves the promise that the async
function returns. This means you can `return` a promise. What's the difference
between `await` and `return`? The obvious answer is that, when you `await` on
a promise, JavaScript pauses execution of the async function and resumes later,
but when you `return` a promise, JavaScript finishes executing the async
function. JavaScript doesn't "resume" executing the function after you `return`.

The obvious answer is correct, but has some non-obvious implications
that tease out how `await` works. If you wrap `await p` in a `try/catch`
and `p` is rejected, you can catch the error. What happens if you
instead `return p`?

<div class="example-header-wrap"><div class="example-header">Example 3.4</div></div>

```javascript
[require:example 3.4$]
```

Notice that `try/catch` does **not** catch the rejected promise that you
returned. Why does only `await` give you a catchable error when the promise
is rejected? Because `await` throws the error when it _resumes_ execution.
When you `return` a promise, JavaScript stops executing your async function
body and kicks off the `resolve()` process on the async function promise.

On the other hand, when you `await` on a promise, JavaScript pauses executing
your async function and resumes once the promise is settled. When JavaScript
resumes your async function after `await`, it throws an error if the awaited
promise rejected. Below is a flow chart showing what happens when you await
on a promise.

<img src="../images/flow.png">

On the other hand, when you `return` a promise from an async function, your
promise goes into the JavaScript runtime and never goes back into your code,
so `try/catch` won't handle the error in example 3.4. Below are a couple
alternatives that `catch` the error: example 3.5 assigns `await p` to a
variable `v` and then returns the variable, and example 3.6 uses `return await`.

<div class="example-header-wrap"><div class="example-header">Example 3.5</div></div>

```javascript
[require:example 3.5$]
```

<div class="example-header-wrap"><div class="example-header">Example 3.6</div></div>

```javascript
[require:example 3.6$]
```

Both approaches work, but example 3.5 is simpler and less confusing. Seeing
`return await` is a head-scratcher for engineers that aren't JavaScript experts,
and that's antithetical to the goal of making asynchronous code easy for
average developers.

## Concurrency

So far, you've seen that `await p` makes JavaScript pause your async function,
call `p.then()`, and resume once the promise is settled. What does this mean
for running multiple async functions in parallel, especially given that
JavaScript is single threaded?

The "JavaScript is single threaded" concept means that, when a normal JavaScript
function is running, no other JavaScript can run. For example, the below code
will never print anything. In other languages, a construct like `setImmediate()`
may run logic in a separate thread and print even while an infinite loop is
spinning, but JavaScript does not allow that.

<div class="example-header-wrap"><div class="example-header">Example 3.7</div></div>

```javascript
setImmediate(() => console.log('Hello, World!'));
// This loop will spin forever, and so you'll never get back into
// the event loop and the above `console.log()` will never run.
while (true) {}
```

JavaScript functions are like the [Pauli Exclusion Principle](https://www.britannica.com/science/Pauli-exclusion-principle) in physics:
no two normal JavaScript functions can be running in the same memory space at
the same time. Closures (callbacks) are separate functions, so in the below
example, `foo()`, `bar()`, and `baz()` all run separately.

<div class="example-header-wrap"><div class="example-header">Example 3.8</div></div>

```javascript
function foo() {
  let x = 0;

  // When `foo()` is done, `bar()` will run later but still have
  // access to `x`
  setImmediate(bar);
  // Stop running `foo()` until `baz()` is done
  baz();

  function bar() {
    ++x;
  }

  function baz() {
    ++x;
  }
}
```

Async functions follow the same rule: no two functions can be running at the
same time. But, any number of async functions can be _paused_ at the same time
as long as you don't run out of memory, and other functions can run when an
async function is paused.

<div class="example-header-wrap"><div class="example-header">Example 3.9</div></div>

```javascript
run().catch(error => console.error(error.stack));

async function run() {
  // This will print, because `run()` is paused when you `await`
  setImmediate(() => console.log('Hello, World!'));
  // Each iteration of the loop pauses the function
  while (true) { await new Promise(resolve => setImmediate(resolve)); }
}
```

This makes async functions useful for breaking up long-running synchronous
code in JavaScript, similar to how you might use threads in another language.
For the sake of an example, let's say you wanted to run two functions in
parallel that each compute a large [Fibonacci number](https://en.wikipedia.org/wiki/Fibonacci_number). Without async/await,
this would be tricky and require subtle recursion. Async/await makes this
task trivial.

<div class="example-header-wrap"><div class="example-header">Example 3.10</div></div>

```javascript
[require:example 3.10$]
```

This example may
seem contrived: a more realistic example would be an Express API endpoint
that runs a potentially expensive algorithm like [clustering](http://thecodebarbarian.com/single-link-clustering-with-node-js.html).
I have used this pattern in a production Express API specifically to run an
`O(n^5)` clustering algorithm in an Express route handler without bogging down
the entire server.

The key takeaway here is that an async function will run with no interruptions
unless you pause it with `await` or exit the function with `return` or `throw`.
JavaScript is still single threaded in the conventional sense, so two async
functions can't be running at the same time, but you can pause your async
function using `await` to give the event loop and other functions a chance to
run.

## Async/Await vs Generators

Async/await has a lot in common with [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator), a feature that JavaScript introduced in the 2015 edition of the
language spec. Like async functions, generator functions can be paused. There
are two major differences between generator functions and async functions:

1. The keyword you use to pause a generator function is `yield`, not `await`.
2. When you pause a generator function, control goes back to your JavaScript code, rather than to the underlying JavaScript runtime. You resume the generator function by calling `next()` on a generator object.

Below is an example of a generator function, using `yield` to pause the function and `next()` to resume it.

<div class="example-header-wrap"><div class="example-header">Example 3.11</div></div>

```javascript
[require:example 3.11$]
```

You can use generators to support syntax that is virtually identical to async/await.
There are numerous packages on npm for this. The most popular one is called [co](https://www.npmjs.com/package/co), originally written by TJ Holowaychuk, the author of Express and Mocha. [Co design patterns](http://thecodebarbarian.com/3-common-co-design-patterns) are virtually identical to async/await design patterns. Below is example 1.1, using co instead of async/await.

<div class="example-header-wrap"><div class="example-header">Example 3.12</div></div>

```javascript
[require:example 3.12$]
```

Co offers several neat features that async/await does not natively support. By
virtue of being a userland library, co can iterate faster and be more extensible.
For example, co can natively handle when you `yield` an array of promises or a
map of promises.

<div class="example-header-wrap"><div class="example-header">Example 3.13</div></div>

```javascript
[require:example 3.13$]
```

The flip-side of co's implicit promise conversion is that co throws an error if
you `yield` something that it can't convert to a promise.

<div class="example-header-wrap"><div class="example-header">Example 3.14</div></div>

```javascript
[require:example 3.14$]
```

In practice, co treating `yield 1` as an error helps catch a lot of errors, but
also causes a lot of unnecessary errors. With async/await, `await 1` is
valid and evaluates to `1`, which is more robust.

Async/await has a few other advantages over co and generators. The biggest advantage
is that async/await is built-in to Node.js and modern browsers, so you don't
need an external library like co. Async/await also has cleaner stack traces.
Co stack traces often have a lot of `generator.next()` and `onFulfilled` lines
that obscure the actual error.

<div class="example-header-wrap"><div class="example-header">Example 3.15</div></div>

```javascript
[require:example 3.15$]
```

The equivalent async/await stack trace has the function name and omits `generator.next()` and `onFulfilled`. Async/await's `onFulfilled`
runs in the JavaScript interpreter, not userland.

<div class="example-header-wrap"><div class="example-header">Example 3.16</div></div>

```javascript
[require:example 3.16$]
```

In general, async/await is the better paradigm because it is built in to
JavaScript, throws fewer unnecessary errors, and has most of the functionality
you need. Co has some neat syntactic sugar and works in older browsers, but
that is not enough to justify including an external library.

## Core Principles

So far, this chapter has been about the technical details of what it means for
an async function to be paused. What does all this mean for a developer looking
to use async/await for their core business logic? Here's some core principles
to remember based on the behaviors this chapter covered.

### Don't `await` on a value that can't be a promise

Just because you can `await 1` doesn't mean you should. A lot of async/await
beginners abuse `await` and `await` on everything.

<div class="example-header-wrap"><div class="example-header">Example 3.17</div></div>

```javascript
async function findSubstr(arr, str) {
  // Don't do this! There's no reason for this function to be async
  for (let i = await 0; i < arr.length; ++i) {
    if (await arr[i].includes(str)) return arr[i];
  }
}
```

In general, you should use `await` on a value you expect to be a promise.
There is no reason to `await` on a value that will never be a promise, and
it falsely implies that the value may be a promise. If a function can be
synchronous, it should be synchronous.

The only reason to make the `findSubstr()` function async would be to pause
execution and let other functions run like in example 3.10. This is only
potentially beneficial if `findSubstr()` runs on a massive array. In that case,
you should use `await new Promise(setImmediate)` in order to make sure all other
tasks have a chance to run.

Similarly, you must convert any value you want to `await` on into a promise.
For example, if you want to `await` on multiple promises in parallel you must
use `Promise.all()`.

<div class="example-header-wrap"><div class="example-header">Example 3.18</div></div>

```javascript
async function run() {
  const p1 = Promise.resolve(1);
  const p2 = Promise.resolve(2);
  // Won't work, `arr1` will be an array of promises
  const arr1 = await [p1, p2];
  // Works! `arr1` will equal `[1, 2]`
  const arr2 = await Promise.all(p1, p2);
}
```

### Prefer using `return` with a non-promise

As demonstrated in example 3.4, you can `return` a promise from an async function,
but doing so has some nuances and corner cases. Instead of using a promise as
the resolved value, use `await` to resolve the value and then `return` the value.

It is generally easier to use `await` and return the resolved value
than to explain the difference between `async` and `return`.

<div class="example-header-wrap"><div class="example-header">Example 3.19</div></div>

```javascript
async function fn1() {
  // Fine, but has some issues with `try/catch` as shown in example 3.4
  return asyncFunction();
}
async function fn2() {
  // More verbose, but less error prone. Use this method unless you do
  // not intend to handle `asyncFunction()` errors in this function.
  const ret = await asyncFunction();
  return ret;
}
```

### Use loops rather than array helpers like `forEach()` and `map()` with `await`

Because you can only `await` in an async function, async functions behave
differently than synchronous functions when it comes to functional array methods
like `forEach()`. For example, the below code throws a `SyntaxError` because
`await` is not in an async function.

<div class="example-header-wrap"><div class="example-header">Example 3.20</div></div>

```javascript
async function test() {
  const p1 = Promise.resolve(1);
  const p2 = Promise.resolve(2);
  // SyntaxError: Unexpected identifier
  [p1, p2].forEach(p => { await p; });
}
```

You might think that all you need is an async arrow function. But that
does **not** pause `test()`.

<div class="example-header-wrap"><div class="example-header">Example 3.21</div></div>

```javascript
async function test() {
  const p1 = Promise.resolve(1);
  const p2 = Promise.resolve(2);
  // This sets off two async functions in parallel, but does **not**
  // pause `test()` because this `await` pauses the arrow function
  [p1, p2].forEach(async (p) => {
    console.log(await p);
  });
  // 'Done' will print **before** '1' and '2'.
  console.log('Done');
}
```

### Make sure you handle errors with `.catch()`

Consolidated error handling is one of the most powerful features of async/await.
Using `.catch()` on an async function call lets you handle all errors that occur
in the async function, whether they're synchronous or asynchronous.

### Use try/catch sparingly to handle specific errors
