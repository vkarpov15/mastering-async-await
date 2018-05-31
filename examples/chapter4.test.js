'use strict';

const assert = require('assert');
const superagent = require('superagent');

describe('Chapter 4 Examples', function() {
  it('Example 4.4', async function() {
    assert.equal(await Promise.resolve(42), 42);
  });

  it('Example 4.5', async function() {
    const app = require('express')();
    app.get('*', (req, res) => res.send('Hello, World!'));
    const server = app.listen(3000);
    // acquit:ignore:start
    await new Promise(resolve => setTimeout(resolve, 20));
    const text = await superagent.get('http://localhost:3000').
      then(res => res.text);
    assert.equal(text, 'Hello, World!');
    server.close();
    // acquit:ignore:end
  });

  it('Example 4.6', async function() {
    const app = require('express')();
    app.get('*', async (req, res) => res.send('Hello, World!'));
    const server = app.listen(3000);
    // acquit:ignore:start
    await new Promise(resolve => setTimeout(resolve, 20));
    const text = await superagent.get('http://localhost:3000').
      then(res => res.text);
    assert.equal(text, 'Hello, World!');
    server.close();
    // acquit:ignore:end
  });

  it('Example 4.7', function(done) {
    const app = require('express')();
    // Process will crash, won't send a response
    app.get('*', async () => { throw Error('Oops!'); });
    const server = app.listen(3000);
    // acquit:ignore:start
    const op = () => {
      request.abort();
      server.close();
      done();
    };
    process.once('unhandledRejection', op);
    // acquit:ignore:end
    // This request will error out, but not with the 'Oops!' error
    const request = superagent.get('http://localhost:3000').end();
  });
});
