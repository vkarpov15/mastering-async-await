module.exports = props => `
<div class="left">
  <img id="cover" src="/images/cover_400.png" />
</div>
<div class="right">
  <h1>Mastering Async/Await</h1>

  <h3>
    Learn how
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function">async/await</a>
    works
    and how it fits in the JavaScript ecosystem.
  </h3>

  <p>
    Async/await is the most important new feature in the
    <a href="https://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf">
      2017 JavaScript language specification</a>.
    Async/await lets you write asynchronous, non-blocking code without callbacks.
    Imagine writing your entire <a href="http://expressjs.com/">Express</a> API
    or <a href="https://reactjs.org/">React</a> app without nested callback hell
    or convoluted promise chains. With async/await, that dream is now a reality.
  </p>
</div>
`;
