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

Unfortunately, there is no way to make Express handle promises correctly without
monkey-patching Express itself or using a wrapper function. Using a wrapper
function is the better choice, because it is difficult to foresee all the
potential consequences of replacing part of a framework's code. Below is an
example of a wrapper function you can use to handle async function errors with
Express.

<div class="example-header-wrap"><div class="example-header">Example 4.8</div></div>

```javascript
[require:Example 4.8$]
```

Error handling often causes async/await integration issues. Make sure to check
whether frameworks you use
handle errors in async function correctly. Express is not the only framework that seems to support async functions at first glance but does not
handle errors.

# With MongoDB

Mocha is an example of a framework that fully supports async functions and
Express is an example of a framework that does not support async functions.
Let's take a look at an example of a Node.js library: the
[official MongoDB driver for Node.js](http://npmjs.com/package/mongodb).

The MongoDB driver generally does not execute
functions for you, with a few exceptions like callbacks.
Apps built on the MongoDB driver primarily use the driver's functions for CRUD (create, read, update, delete) operations:

<div class="example-header-wrap"><div class="example-header">Example 4.9</div></div>

```javascript
[require:Example 4.9$]
```

For a library to support async/await, its functions must return
thenables. The documentation shows that functions like
`insertOne()` return a promise, as long as you don't specify a callback.

<img src="https://i.imgur.com/Cr8TuDT.png">

This means the MongoDB driver supports async/await from a library perspective.
However, using the MongoDB driver with async/await lets you do more than just
`await` on individual CRUD operations. Async/await opens up some elegant
alternatives for streaming data using `for` loops.

Most database applications only read a few documents from the database at a
time. But what happens if you need to read through millions of documents, more
than can fit into your application's memory at one time? The MongoDB driver
has a construct called a [cursor](http://mongodb.github.io/node-mongodb-native/3.0/api/Cursor.html) that lets you iterate through huge data sets by only loading a fixed number of
documents into memory at any one time.

Fundamentally, a MongoDB cursor is an object with a function `next()` that
returns a promise which resolves to the next document, or `null` if there are
no more documents. Without async/await, iterating through a cursor using
`next()` required recursion. With async/await, you can iterate through a
cursor using a `for` loop:

<div class="example-header-wrap"><div class="example-header">Example 4.10</div></div>

```javascript
[require:Example 4.10$]
```

That's right, you can `await` within a `for` loop's statements. This pattern
is a more intuitive and performant way to iterate through a cursor than using
recursion or streams.

# With Redux

[React](http://npmjs.com/package/react) is the most popular JavaScript UI framework, and [Redux](https://www.npmjs.com/package/redux) is
the most popular state management framework for React. The two have become
largely synonymous since Redux's release in 2015. For the purposes of async/await
integration, both React and Redux are frameworks.

First, let's look at how to integrate Redux with async/await. Below is an
example of using Redux with synchronous functions in vanilla Node.js. Redux
has 3 primary concepts: stores, actions, and reducers. A _store_ tracks the
state of your application, an _action_ is an object representing some change
going through the system, and a _reducer_ is a synchronous function that
modifies the application state object in response to actions.

<div class="page-break"></div>

<br>

<div class="example-header-wrap"><div class="example-header">Example 4.11</div></div>

```javascript
[require:Example 4.11$]
```

Redux beginners might be wondering why you need to dispatch actions rather than
modifying the state directly using the assignment operator.
It's hard to watch for changes on a JavaScript value, so
actions exist to make it easy to observe all changes going through the system.
In particular, Redux makes it easy to update your React UI every time your state
changes.

So can you use async/await with Redux? Redux
reducers **must** be synchronous, so you cannot use an async function as a
reducer. However, you can dispatch actions
from an async function.

<div class="example-header-wrap"><div class="example-header">Example 4.12</div></div>

```javascript
[require:Example 4.12$]
```

Calling `store.dispatch()` from an async function works, but
doesn't toe the Redux party line. The [official Redux approach](https://redux.js.org/advanced/async-actions#async-action-creators) is to use the `redux-thunk` package and action creators. An _action creator_ is
a function that returns a function with a single parameter,
`dispatch`.

<div class="page-break"></div>

<br>

<div class="example-header-wrap"><div class="example-header">Example 4.13</div></div>

```javascript
[require:Example 4.13$]
```

`redux-thunk`'s purpose is inversion of control (IoC). In other
words, an action creator that takes `dispatch()` as a parameter doesn't have
a hard-coded dependency on any one Redux store. Like AngularJS dependency
injection, but for React.

# With React

Redux is best with React. To avoid bloat, this chapter will not use JSX,
React's preferred extended JS syntax. Below is an example of creating a component
that shows "Hello, World!" in React:

<div class="example-header-wrap"><div class="example-header">Example 4.14</div></div>

```javascript
const { renderToString } = require('react-dom/server');
const { createElement, Component } = require('react');

class MyComponent extends Component {
  render() {
    return createElement('h1', null, 'Hello, World!');
  }
}
// <h1 data-reactroot="">Hello, World!</h1>
console.log(renderToString(createElement(MyComponent)));
```

Currently, `render()` functions **cannot** be async. An async `render()` will cause React to throw a "Objects are not valid as a React child" error. The
upcoming [React Suspense API](https://auth0.com/blog/time-slice-suspense-react16/)
may change this.

React components have [lifecycle hooks](https://reactjs.org/docs/react-component.html) that React calls when it
does something with a component. For example, React calls `componentWillMount()` before adding a component to the DOM. The below script
will also generate HTML that shows "Hello, World!" because `componentWillMount()`
runs before the first `render()`.

<br>

<div class="example-header-wrap"><div class="example-header">Example 4.15</div></div>

```javascript
class MyComponent extends Component {
  componentWillMount() { this.setState({ v: 'Hello, World!' }); }
  render() { return createElement('h1', null, this.state.v); }
}
// <h1 data-reactroot="">Hello, World!</h1>
console.log(renderToString(createElement(MyComponent)));
```

The `componentWillMount()` hook does **not**
handle async functions. The below
script produces an empty `<h1>`. React also doesn't
handle errors that occur in an async `componentWillMount()`.

<div class="example-header-wrap"><div class="example-header">Example 4.16</div></div>

```javascript
class MyComponent extends Component {
  async componentWillMount() {
    this.setState({ text: null });
    await new Promise(resolve => setImmediate(resolve));
    this.setState({ text: 'Hello, World!' });
  }
  render() { return createElement('h1', null, this.state.text); }
}
// <h1 data-reactroot=""></h1>
console.log(renderToString(createElement(MyComponent)));
```

In general, React doesn't handle async functions well. To use async functions
with React, you should use a framework like Redux.

<div class="example-header-wrap"><div class="example-header">Example 4.17</div></div>

```javascript
const reducer = (state, action) => Object.assign({}, state, action);
const store = createStore(reducer, { v: '' }, applyMiddleware(thunk));

class MyComponent extends Component {
  componentWillMount() { this.setState(store.getState()); }
  render() { return createElement('h1', null, this.state.v); }
}

store.dispatch(async (dispatch) => {
  await new Promise(resolve => setTimeout(resolve, 250));
  dispatch({ type: 'SET', v: 'Hello, World!' });
});
setInterval(() => {
  // First 2 will print an empty <h1>, then "Hello, World!"
  console.log(renderToString(createElement(MyComponent)));
}, 100);
```
