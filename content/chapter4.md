# Async/Await in the Wild

Async/await is a powerful tool on its own, but it really shines when combined
with the prolific open source JavaScript ecosystem. It is no secret that
JavaScript was a painful language to work with in 2005, but that pain lead
developers to build an incredible variety of libraries and frameworks to
address common problems.

Now that JavaScript has features like async/await, these libraries and frameworks
are even more powerful.
In this chapter, you'll see how async/await interacts with several common
npm packages. In addition, you'll learn to evaluate whether a
package works with async/await.

Broadly speaking, npm packages belong to one of two categories when it comes
to integrating with async/await: libraries and frameworks.

* Generally, when working with a _framework_, like Express or Redux, you pass functions to the framework that the framework then calls for you.
* Conversely, a _library_, like superagent or the MongoDB driver, exposes a collection of functions for you that you're responsible for calling.

Not all npm packages fall neatly into one of these categories. But, these
categories help break the question of whether a given package "works"
with async/await down into two easier questions.

For a framework to support async/await, it must support functions that return
promises.

<div class="example-header-wrap"><div class="example-header">Example 4.1</div></div>

```javascript
// Express is the most popular web framework for Node.js.
const app = require('express')();
// Does Express handle functions that return promises?
app.get('*', async function(req, res) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  res.send('Hello, World!');
});
```

For a library to support async/await, its functions must return thenables.

<div class="example-header-wrap"><div class="example-header">Example 4.2</div></div>

```javascript
// Superagent is a popular HTTP client library for Node.js
const superagent = require('superagent');
run().catch(error => console.error(error.stack));
async function run() {
  // Do superagent's functions return thenables?
  const response = await superagent.get('http://google.com');
}
```

Now let's apply these principles to several popular npm packages, starting
with the test framework [mocha](http://npmjs.com/package/mocha).

# With Mocha

Mocha falls firmly into the framework category. It's a framework that runs
behavior-driven development (BDD) tests for you. The below example is from
the Mocha home page. It has one test that asserts that JavaScript's
built-in `indexOf()` function handles a simple case correctly.

<div class="example-header-wrap"><div class="example-header">Example 4.3</div></div>

```javascript
const assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});
```

The `describe()` calls are analogous to test suites in more conventional
testing frameworks like [JUnit](https://junit.org/junit5/), and the `it()`
calls are individual tests. So Mocha's async/await support is contingent
on whether the `it()` function supports passing in a function that returns
a promise.

To figure out whether Mocha supports promises, go to their documentation site,
which has a [section on promises](https://mochajs.org/#working-with-promises)
pictured below.

<img src="https://i.imgur.com/dLnbbfs.png">

So Mocha does support async/await as a framework. Digging deeper, it turns out
Mocha has enjoyed [rudimentary promise support since `v1.8.0` in March 2014](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#1180--2014-03-13).

<div class="page-break"></div>

Below is an example of using Mocha with an async function.

<div class="example-header-wrap"><div class="example-header">Example 4.4</div></div>

```javascript
describe('async', function() {
  it('works', async function() {
    [require:Example 4.4$]
  });
});
```

# With Express

[Express](http://expressjs.com/) is a Node.js web framework used for building
HTTP servers, like RESTful APIs and classic web applications. The key term
here is that Express is primarily a framework, which means its async/await
support is predicated on supporting functions that return promises. Below is
an example showing how to use Express with synchronous functions.

<div class="example-header-wrap"><div class="example-header">Example 4.5</div></div>

```javascript
[require:Example 4.5$]
```

Since Mocha supports async/await out of the box, you might mistakenly assume
that Express supports async/await too. That would be a mistake. However, it is
an easy mistake to make because the below code works fine, even though the
Express route handler function is now async.

<div class="example-header-wrap"><div class="example-header">Example 4.6</div></div>

```javascript
[require:Example 4.6$]
```

Figuring out that Express doesn't fully support async/await is tricky because
they don't explicitly say one way or the other in the docs. If you Google
"express async/await", you'll end up at [an old GitHub issue](https://github.com/expressjs/express/issues/2259) that's still open and
implies that promises are not quite supported.

<img src="https://i.imgur.com/9afBtuL.png">

Unfortunately, this GitHub issue isn't explicit about where the interaction
between Express and async/await breaks down. The issue is what happens when
your async function throws an error.

<div class="example-header-wrap"><div class="example-header">Example 4.7</div></div>

```javascript
[require:Example 4.7$]
```

In older versions of Node.js, the superagent request above will hang. In newer
versions of Node.js, the Express server process will crash because Express
does **not** handle errors in promises.

Error handling is a common cause of async/await integration issues. Even if
a framework seems to support async functions, make sure to check whether it
handles async function errors correctly. In this case, Express does not handle
errors in async functions correctly.
