# Moving On

Async/await is an exciting new tool that makes JavaScript much easier to
work with. Async/await won't solve all your problems, but it will make your
day-to-day easier by replacing callbacks and promise chaining with `for` loops
and `if` statements. But remember the fundamentals, or you'll end up trading
callback hell and promise hell for async/await hell.
Here are some key points to remember when working with async/await.

* An async function always returns a promise.
* `await` pauses an async function until the awaited promise is settled.
* `await` on a value that isn't a promise is a no-op.
* Other JavaScript may run when an async function is paused.
* Error handling is a common problem. Make sure you handle errors with `.catch()`.

To get more content on async/await, including design patterns and tools for
integrating with popular frameworks, check out my blog's async/await section
at [`bit.ly/asyncawait-blog`](http://bit.ly/asyncawait-blog).

Congratulations on completing this book, and good luck with your async/await
coding adventures!
