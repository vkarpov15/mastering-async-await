const defaultBuyButton = `
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="hosted_button_id" value="JWETZFLXVWQPY">
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!" onclick="client.addEvent('track', { type: 'clickthrough' });">
<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
</form>
`;

module.exports = ({ price = '$24.99', buyButton = defaultBuyButton }) => `
<div class="left">
  <img id="cover" src="/content/mock_lite.jpeg" />
</div>
<div class="right">
  <h1 class="title">Mastering Async/Await</h1>

  <h3 class="tagline">
    Become your team's expert on escaping callback hell.
  </h3>

  <p>
    Imagine writing your entire <a href="http://expressjs.com/">Express</a> API
    or <a href="https://reactjs.org/">React</a> app with for loops and if
    statements. No more deeply nested callbacks or convoluted promise chains.
    With async/await, you can make that dream a reality.
  </p>

  <p>
    <i>Mastering Async/Await</i> provides a concise and comprehensive guide to
    async/await fundamentals. You'll learn:
  </p>

  <ul>
    <li>Why React and Express don't support async/await out of the box, and how to work around these frameworks' limitations.</li>
    <li>How to evaluate whether your favorite <a href="http://npmjs.com/">npm</a> modules support async/await.</li>
    <li>How promises work under the hood, in excruciating detail, by building a <a href="https://promisesaplus.com/">Promises/A+</a> compliant promise library from scratch.</li>
    <li>Why async/await is the perfect complement to promises, rather than an alternative.</li>
    <li>How to use async/await to handle errors and keep nasty red error messages out of your Chrome console.</li>
  </ul>

  <p>
    <i>Mastering Async/Await</i> packs all this and more into 52 terse pages.
    That means you can get caught up on modern asynchronous JavaScript in hours,
    not days. Instead of cobbling together copy/pasted snippets from
    StackOverflow, become the expert your team goes to for all things async.
  </p>

  <h3>Buy</h3>

  <div class="price">
    ${price}
  </div>

  <div class="buy-button">
    ${buyButton}
  </div>

  <h3>About the Author</h3>

  <p id="author">
    <img src="https://pbs.twimg.com/profile_images/891062607053860864/rDX7vHYT_400x400.jpg" style="float: right; width: 145px; margin-left: 10px">

    Valeri Karpov is the lead maintainer of <a href="https://www.npmjs.com/package/mongoose">Mongoose</a>.
    He's a core contributor to
    <a href="https://www.npmjs.com/package/mocha">Mocha</a>, <a href="https://www.npmjs.com/package/agenda">Agenda</a>,
    and other npm modules with over 10M combined monthly downloads.
    He's the author of <a href="http://es2015generators.com/"><i>The 80/20 Guide to ES2015 Generators</i></a>
    and <a href="https://www.amazon.com/Professional-AngularJS-Valeri-Karpov/dp/1118832078/ref=sr_1_1?ie=UTF8&qid=1528769632&sr=8-1&keywords=professional+angularjs"><i>Professional AngularJS</i></a>.
    <a href="http://thecodebarbarian.com/">His blog</a>
    is the top result on Google for "async await design patterns".

    <div class="clear"></div>
  </p>

  <div class="money-back">
    <p>
      <i>
        Have an issue?
        <a href="https://github.com/vkarpov15/mastering-async-await-issues/issues">Report it on GitHub</a>
        and we'll respond within 24 hours
      </i>.
    </p>

    <p>
      <i>
        Not happy with your purchase? Report an issue on the
        <a href="https://www.paypal.com/disputes/">PayPal Resolution Center</a>
        or email <a href="mailto:val@karpov.io">val@karpov.io</a> with your
        PayPal transaction id for a full refund within 72 hours.
      </i>
    </p>
  </div>

  <h3>Preview</h3>

  <ul>
    <li><a href="/bin/toc.pdf">Table of Contents</a></li>
    <li><a href="/bin/page-30-31.pdf">Pages 30-31</a></li>
  </ul>

  <h3>What Developers are Saying</h3>

  <blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">So I started reading &quot;Mastering Async/Await&quot; by <a href="https://twitter.com/code_barbarian?ref_src=twsrc%5Etfw">@code_barbarian</a> - and just like his &quot;Generators guide&quot; it is an awesome practical tutorial for all the ways you should be using &quot;async/await&quot; in JS. No fluff, straight examples, great text. <a href="https://t.co/nnAEFhtTjj">https://t.co/nnAEFhtTjj</a></p>&mdash; Gleb Bahmutov (@bahmutov) <a href="https://twitter.com/bahmutov/status/1013882918941446146?ref_src=twsrc%5Etfw">July 2, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Just bought the &quot;Mastering async/await&quot; book from <a href="https://twitter.com/code_barbarian?ref_src=twsrc%5Etfw">@code_barbarian</a>.<br>Thank you Valeri for putting this together!<br><br>Find it here: <a href="https://t.co/WnsH4tqDld">https://t.co/WnsH4tqDld</a> <a href="https://t.co/KYh5QZROap">pic.twitter.com/KYh5QZROap</a></p>&mdash; Marcus Poehls ⚡️ (@marcuspoehls) <a href="https://twitter.com/marcuspoehls/status/1014520503485259779?ref_src=twsrc%5Etfw">July 4, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

  <blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I&#39;m super impressed with <a href="https://twitter.com/code_barbarian?ref_src=twsrc%5Etfw">@code_barbarian</a> &#39;s latest ebook: Mastering Async/Await. Check it out: <a href="https://t.co/8tsaVfSjsN">https://t.co/8tsaVfSjsN</a></p>&mdash; Brad Vogel (@BradVogel) <a href="https://twitter.com/BradVogel/status/1016473731332390913?ref_src=twsrc%5Etfw">July 10, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

  <blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">From the maintainer of my favorite <a href="https://twitter.com/MongoDB?ref_src=twsrc%5Etfw">@MongoDB</a> library <a href="https://twitter.com/mongoosejs?ref_src=twsrc%5Etfw">@mongoosejs</a>, comes a new book giving a deep dive on learning and understanding Async/Await, one of the best new features of es6.<br><br>ch-ch-ch-check it outtt <a href="https://t.co/givAinTbPV">https://t.co/givAinTbPV</a></p>&mdash; Harry Wolff (@hswolff) <a href="https://twitter.com/hswolff/status/1007340590210699265?ref_src=twsrc%5Etfw">June 14, 2018</a></blockquote>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>
<div style="clear: both"></div>
`;
