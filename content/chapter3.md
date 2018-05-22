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

The `await` keyword causes JavaScript to pause execution until the next
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
