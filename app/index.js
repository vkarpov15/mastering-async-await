'use strict';

const email = require('./email');
const express = require('express');
const fs = require('fs');
const inline = require('inline-css');
const superagent = require('superagent');

const mailgunKey = process.env.MAILGUN.trim();
const mailgunDomain = process.env.MAILGUN_DOMAIN.trim();

const mailgun = require('mailgun-js')({
  apiKey: mailgunKey,
  domain: mailgunDomain
});

const css = fs.readFileSync('./website/style.css').toString();
const html = inline(email({ css }), { url: 'noop' });

const text = 'Thanks for purchasing "Mastering Async/Await"! Your copy is attached';

run().catch(error => console.error(error.stack));

async function run() {
  const app = express();

  app.use(require('body-parser').text({
    type: () => true
  }));

  app.post('/paypal-ipn', wrap(async function(req) {
    const body = (req.body || '').toString();
    const params = body.split('&').reduce((cur, kv) => {
      const [key, value] = kv.split('=');
      cur[key] = value;
      return cur;
    }, {})

    if (!['X123', '0001'].includes(params['item_number'])) {
      return 'IGNORED';
    }

    const to = params['payer_email'] != null ?
      decodeURIComponent(params['payer_email']) :
      'val@karpov.io';
    await mailgun.messages().send({
      from: 'noreply@asyncawait.net',
      to,
      subject: 'Your Copy of Mastering Async/Await',
      text,
      html: await html,
      attachment: [
        './bin/mastering-async-await.pdf',
        './bin/mastering-async-await.epub'
      ]
    });

    await superagent.post('http://api.meanit.cc/track', {
      hostname: 'asyncawait.net',
      type: 'purchase',
      to
    });

    return 'SENT';
  }));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Listening on ${port}`);
}

function wrap(fn) {
  return function(req, res) {
    fn(req).then(
      v => res.status(200).send(v),
      e => {
        console.log(e.stack);
        res.status(500).send(require('util').inspect(e));
      }
    );
  }
}
