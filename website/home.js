module.exports = props => `
<style>
  #container {
    min-height: 1000px;
  }
</style>
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
    or <a href="https://reactjs.org/">React</a> app without nested callbacks
    or convoluted promise chains. With async/await, that dream is now a reality.
  </p>

  <p>
    <i>Mastering Async/Await</i> provides a concise and comprehensive guide to
    async/await fundamentals from micro to macro. You'll learn how to implement a
    <a href="https://promisesaplus.com/">Promises/A+ compliant</a> promise
    library from scratch (micro) and see how await operates on the custom
    promise library (macro). You'll also learn about using async/await with
    the frameworks you use every day, like <a href="http://expressjs.com/">Express</a>
    and <a href="https://reactjs.org/">React</a>. This book is designed to
    avoid wasteful fluff and is only 52 pages, so you can master async/await
    in hours, not days.
  </p>

  <h3>About the Author</h3>

  <p id="author">
    <img src="https://pbs.twimg.com/profile_images/891062607053860864/rDX7vHYT_400x400.jpg" style="float: right; width: 145px; margin-left: 10px">

    Valeri Karpov is the lead maintainer of <a href="https://www.npmjs.com/package/mongoose">Mongoose</a>
    and the Lead Backend Engineer for
    <a href="https://www.trybooster.com/">Booster Fuels</a>.
    He's a core contributor to
    <a href="https://www.npmjs.com/package/mocha">Mocha</a>, <a href="https://www.npmjs.com/package/agenda">Agenda</a>,
    and other npm modules with over 10M combined monthly downloads.
    He's the author of <a href="http://es2015generators.com/"><i>The 80/20 Guide to ES2015 Generators</i></a>
    and <a href="https://www.amazon.com/Professional-AngularJS-Valeri-Karpov/dp/1118832078/ref=sr_1_1?ie=UTF8&qid=1528769632&sr=8-1&keywords=professional+angularjs"><i>Professional AngularJS</i></a>.
    <a href="http://thecodebarbarian.com/">His blog</a>
    is the top result on Google for "async await design patterns".

    <div class="clear"></div>
  </p>

  <h3>Buy</h3>

  <form action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post" target="_top">
  <input type="hidden" name="cmd" value="_s-xclick">
  <input type="hidden" name="hosted_button_id" value="PCKRMQJK8KTNQ">
  <input type="image" src="https://www.sandbox.paypal.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
  <img alt="" border="0" src="https://www.sandbox.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">
  </form>

  <h3>Preview</h3>

  <ul>
    <li><a href="/bin/toc.pdf">Table of Contents</a></li>
    <li><a href="/bin/page-32-33.pdf">Pages 32-33</a></li>
  </ul>
</div>
`;
