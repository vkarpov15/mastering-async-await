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

Notice that the `then()` function runs on the next tick, even though it is fully
synchronous. This means that `await` always pauses execution until at least
the next tick, even if the thenable is not async. 
