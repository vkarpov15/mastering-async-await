const Promise = require('../content/promise');
const assert = require('assert');
const tickId = require('tick-id');

const _console = console;

describe('Chapter 3 Examples', function() {
  let logged = [];
  const console = {
    logged: [],
    log: function() {
      console.logged.push(Array.prototype.slice.call(arguments));
    }
  };

  beforeEach(function() {
    console.logged = [];
  });

  it('example 3.1', async function() {
    const p = {
      then: onFulfilled => {
        // Prints "then(): function () { [native code] }"
        console.log('then():', onFulfilled.toString());
        // Only one entry in the stack:
        // Error
        //     at Object.then (/examples/chapter3.test.js:8:21)
        console.log(new Error().stack);
        onFulfilled('Hello, World!');
      }
    };

    console.log(await p); // Prints "Hello, World!"
    // acquit:ignore:start
    assert.equal(console.logged.length, 3);
    assert.deepEqual(console.logged[0],
      ['then():', 'function () { [native code] }']);
    // acquit:ignore:end
  });

  it('example 3.2', async function() {
    const startId = 0;
    let currentId = 0;
    process.nextTick(() => ++currentId);

    const p = {
      then: onFulfilled => {
        console.log('then():', currentId - startId); // "then(): 1"
        onFulfilled('Hello, World!');
      }
    };

    console.log('Before:', currentId - startId); // "Before: 0"
    await p;
    console.log('After:', currentId - startId); // "After: 1"
    // acquit:ignore:start
    assert.equal(console.logged.length, 3);
    assert.deepEqual(console.logged.map(calls => calls[1]), [0, 1, 1]);
    // acquit:ignore:end
  });
});
