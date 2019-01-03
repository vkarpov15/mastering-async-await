const defaultBuyButton = `
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="hosted_button_id" value="PBVTAMSMYXTZN">
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
</form>
`;

const defaultPrice = '$27.95';

module.exports = ({ price = defaultPrice, buyButton = defaultBuyButton }) => `
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
    <li>Why async/await works perfectly with <code>for</code> loops and <code>if</code> statements, but not functional constructs like <code>forEach</code>.</li>
    <li>How to avoid common async/await mistakes, like using <code>return</code> in a <code>try/catch</code>.
  </ul>

  <p>
    <i>Mastering Async/Await</i> packs all this and more into 52 terse pages.
    That means you can get caught up on modern asynchronous JavaScript in hours,
    not days. Stop copy/pasting snippets from
    StackOverflow and become the expert your team goes to for all things async.
  </p>

  <h3>

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

  <p>
    Check out
    <a href="https://devchat.tv/js-jabber/jsj-329-promises-promise-finally-and-async-await-with-valeri-karpov/">Valeri Karpov on JavaScript Jabber</a>,
    one of the
    <a href="https://snipcart.com/blog/javascript-podcasts">top JavaScript podcasts</a>.
  </p>

  <p>
    Check out <a href="https://javascriptweekly.com/issues/413">Valeri Karpov on JavaScript Weekly</a>,
    the <a href="https://usersnap.com/blog/web-development-newsletters/">#1 JavaScript newsletter</a>.
  </p>

  <h3>Preview</h3>

  <ul>
    <li><a href="/bin/toc.pdf">Table of Contents</a></li>
    <li><a href="/bin/page-30-31.pdf">Pages 30-31</a></li>
  </ul>

  <h3>Buy</h3>

  <div class="price">
    ${price}
  </div>

  <div class="buy-button">
    ${buyButton}
  </div>

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

  <h3>What Developers are Saying</h3>

  <blockquote data-cards="hidden" class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">So I started reading &quot;Mastering Async/Await&quot; by <a href="https://twitter.com/code_barbarian?ref_src=twsrc%5Etfw">@code_barbarian</a> - and just like his &quot;Generators guide&quot; it is an awesome practical tutorial for all the ways you should be using &quot;async/await&quot; in JS. No fluff, straight examples, great text. <a href="https://t.co/nnAEFhtTjj">https://t.co/nnAEFhtTjj</a></p>&mdash; Gleb Bahmutov (@bahmutov) <a href="https://twitter.com/bahmutov/status/1013882918941446146?ref_src=twsrc%5Etfw">July 2, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

  <blockquote data-cards="hidden" class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">So, like I said a few minutes ago, I purchased &quot;Mastering Async/Await&quot; from <a href="https://twitter.com/code_barbarian?ref_src=twsrc%5Etfw">@code_barbarian</a> , well he happens to have another book<a href="https://t.co/gr0TZNCSJN">https://t.co/gr0TZNCSJN</a><br>The 80/20 Guide to ES2015 Generators. I feel like it&#39;s Christmas.<br><br>Thanks <a href="https://twitter.com/code_barbarian?ref_src=twsrc%5Etfw">@code_barbarian</a>, can&#39;t wait to start reading.</p>&mdash; Tony Brown ⚛️ ❤️ 💻 👑 (@pixelBender67) <a href="https://twitter.com/pixelBender67/status/1042367743620784130?ref_src=twsrc%5Etfw">September 19, 2018</a></blockquote>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

  <blockquote data-cards="hidden" class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Just bought the &quot;Mastering async/await&quot; book from <a href="https://twitter.com/code_barbarian?ref_src=twsrc%5Etfw">@code_barbarian</a>.<br>Thank you Valeri for putting this together!<br><br>Find it here: <a href="https://t.co/WnsH4tqDld">https://t.co/WnsH4tqDld</a> <a href="https://t.co/KYh5QZROap">pic.twitter.com/KYh5QZROap</a></p>&mdash; Marcus Poehls ⚡️ (@marcuspoehls) <a href="https://twitter.com/marcuspoehls/status/1014520503485259779?ref_src=twsrc%5Etfw">July 4, 2018</a></blockquote>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

  <blockquote data-cards="hidden" class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I&#39;m super impressed with <a href="https://twitter.com/code_barbarian?ref_src=twsrc%5Etfw">@code_barbarian</a> &#39;s latest ebook: Mastering Async/Await. Check it out: <a href="https://t.co/8tsaVfSjsN">https://t.co/8tsaVfSjsN</a></p>&mdash; Brad Vogel (@BradVogel) <a href="https://twitter.com/BradVogel/status/1016473731332390913?ref_src=twsrc%5Etfw">July 10, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

  <blockquote data-cards="hidden" class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I&#39;ve been awaiting to read &quot;Mastering Async/Await&quot; by <a href="https://twitter.com/code_barbarian?ref_src=twsrc%5Etfw">@code_barbarian</a> (<a href="https://t.co/4AOjVSTpTz">https://t.co/4AOjVSTpTz</a>) and finally resolved the promise. Concise and very informative! My ebook was not spiral-bound, but contents were otherwise as described ;-). <a href="https://twitter.com/hashtag/GoodReads?src=hash&amp;ref_src=twsrc%5Etfw">#GoodReads</a> <a href="https://twitter.com/hashtag/nodejs?src=hash&amp;ref_src=twsrc%5Etfw">#nodejs</a> <a href="https://t.co/b4jQwQniXQ">pic.twitter.com/b4jQwQniXQ</a></p>&mdash; Stennie (@stennie) <a href="https://twitter.com/stennie/status/1045154322202353664?ref_src=twsrc%5Etfw">September 27, 2018</a></blockquote>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

  <blockquote data-cards="hidden" class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">From the maintainer of my favorite <a href="https://twitter.com/MongoDB?ref_src=twsrc%5Etfw">@MongoDB</a> library <a href="https://twitter.com/mongoosejs?ref_src=twsrc%5Etfw">@mongoosejs</a>, comes a new book giving a deep dive on learning and understanding Async/Await, one of the best new features of es6.<br><br>ch-ch-ch-check it outtt <a href="https://t.co/givAinTbPV">https://t.co/givAinTbPV</a></p>&mdash; Harry Wolff (@hswolff) <a href="https://twitter.com/hswolff/status/1007340590210699265?ref_src=twsrc%5Etfw">June 14, 2018</a></blockquote>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>
<div style="clear: both"></div>
`;
