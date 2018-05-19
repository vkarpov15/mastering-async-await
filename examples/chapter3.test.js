const Promise = require('../content/promise');
const assert = require('assert');
const tickId = require('tick-id');

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
});
