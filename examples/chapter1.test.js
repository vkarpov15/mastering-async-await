'use strict';

const { EventEmitter } = require('events');
const assert = require('assert');

describe('Chapter 1 Examples', function() {
  const _log = console.log;
  const logs = new EventEmitter();

  beforeEach(function() {
    console.log = function() {
      process.nextTick(() => {
        logs.emit('log', Array.prototype.slice.call(arguments))
      });
    };
  });

  it('example 1.1', function() {
    async function test() {
      // This function will print "Hello, World!" after 1 second.
      await new Promise(resolve => setTimeout(() => resolve(), 1000));
      console.log('Hello, World!');
    }

    test();

    // acquit:ignore:start
    const now = Date.now();
    return new Promise((resolve, reject) => {
      logs.once('log', args => {
        console.log = _log;
        assert.ok(Date.now() - now >= 950, `Elapsed ${Date.now() - now}`);
        assert.deepEqual(args, ['Hello, World!']);

        resolve();
      });
    });
    // acquit:ignore:end
  });
});
