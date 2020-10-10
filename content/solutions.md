# Answers in the Back of the Book

## 1.1: HTTP Request Loops

The answer is to first `fetch()` the list of blog posts, and then loop through
each blog post and `fetch()` the blog post's contents. Async/await makes this
easy because you can `await` in a `for/of` loop. Just make sure you use
async/await in an async function!

```javascript
async function run() {
  const root = 'https://' +
    'us-central1-mastering-async-await.cloudfunctions.net/post';
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

One more detail to note: you can use `break` in a `for/of` loop that uses async/await.
There's nothing special about a `for/of` loop with an `await` statement, it's a normal
loop! You can use `break`, `continue`, and `return`.

## 1.2: Retrying Failed Requests

The answer is to use `try/catch` to handle any async errors and continue retrying up to
`numRetries` times. Use a `for` loop to execute requests, and `return` when a request
succeeds. Otherwise, try again until you run out of retries, and `throw` an error.

<div class="page-break"></div>

```javascript
async function getWithRetry(url, numRetries) {
  let error = null;
  for (let i = 0; i < numRetries; ++i) {
    try {
      const res = await fetch(url).then(res => res.json());
      return res;
    } catch(err) {
      error = err;
    }
  }
  throw error;
}
```