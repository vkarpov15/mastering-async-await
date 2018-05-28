'use strict';

const acquit = require('acquit');
const highlight = require('highlight.js');
const fs = require('fs');
const marked = require('marked');
const nightmare = require('nightmare');
const transform = require('acquit-require');

require('acquit-ignore')();

marked.setOptions({
  highlight: function(code) {
    return highlight.highlight('JavaScript', code).value;
  }
});

run().catch(error => console.error(error.stack));

async function run() {
  const blank = fs.readFileSync('./content/blank.html', 'utf8');
  const cover = fs.readFileSync('./content/cover.html', 'utf8');
  const intro = fs.readFileSync('./content/intro.md', 'utf8');
  const toc = fs.readFileSync('./content/toc.md', 'utf8');

  const examples = [1, 2, 3, 4].
    map(c => fs.readFileSync(`./examples/chapter${c}.test.js`, 'utf8').toString());

  const chapters = [1, 2, 3, 4].
    map(c => fs.readFileSync(`./content/chapter${c}.md`, 'utf8').toString()).
    map((c, i) => transform(c, examples[i]));

  const css = {
    content: fs.readFileSync('./content/content.css', 'utf8'),
    cover: fs.readFileSync('./content/cover.css', 'utf8')
  };

  const coverHtml = `
    <link href='http://fonts.googleapis.com/css?family=Titillium+Web' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Droid+Sans+Mono' rel='stylesheet' type='text/css'>
    <style>
      ${css.cover}
    </style>
    <div id="content">
      ${cover}
    </div>
  `;

  const contentHtml = `
    <html>
      <head>
        <link href='http://fonts.googleapis.com/css?family=Titillium+Web' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Droid+Sans+Mono' rel='stylesheet' type='text/css'>

        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <style>
          ${css.content}
        </style>
      </head>
      <body>
        <div class="toc">
          ${marked(toc)}
        </div>
        <div class="chapter">
          ${marked(intro)}
        </div>
        <div class="chapter">
          ${marked(chapters[0])}
        </div>
        <div class="chapter">
          ${marked(chapters[1])}
        </div>
        <div class="chapter">
          ${marked(chapters[2])}
        </div>
        <div class="chapter">
          ${marked(chapters[3])}
        </div>
      </body>
    </html>
  `;

  fs.writeFileSync('./bin/cover.html', coverHtml);
  fs.writeFileSync('./bin/content.html', contentHtml);

  let browser = nightmare({ show: false });

  await browser.goto(`file://${__dirname}/bin/cover.html`).
    pdf('./bin/cover.pdf', { marginsType: 0 }).
    end();

  browser = nightmare({ show: false });

  await browser.goto(`file://${__dirname}/bin/content.html`).
    pdf('./bin/content.pdf', { marginsType: 0 }).
    end();

  console.log('Done');
  process.exit(0);
}
