'use strict';

const express = require('express');

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

    return 'SENT';
  }));

  await app.listen(process.env.PORT || 4000);
  console.log('Listening');
}

function wrap(fn) {
  return function(req, res) {
    fn(req).then(
      v => res.status(200).send(v),
      e => res.status(500).send(e.message)
    );
  }
}
