const Promise = require('../content/promise').Promise;
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

  it('example 3.3', async function() {
    const startId = 0;
    let currentId = 0;
    process.nextTick(() => ++currentId);
    const p = {
      then: (onFulfilled, onRejected) => {
        console.log('then():', currentId - startId); // "then(): 1
        return onRejected(Error('Oops!'));
      }
    };

    try {
      console.log('Before:', currentId - startId); // "Before: 0"
      await p;
      console.log('This does not print');
    } catch (error) {
      console.log('After:', currentId - startId); // "After: 1"
    }
    // acquit:ignore:start
    assert.equal(console.logged.length, 3);
    assert.deepEqual(console.logged.map(calls => calls[1]), [0, 1, 1]);
    // acquit:ignore:end
  });

  it('example 3.4', function(done) {
    async function test() {
      try {
        return Promise.reject(new Error('Oops!'));
      } catch (error) { return 'ok'; }
    }
    // Prints "Oops!"
    test().then(v => console.log(v), err => console.log(err.message));
    // acquit:ignore:start
    setTimeout(() => {
      assert.equal(console.logged.length, 1);
      assert.deepEqual(console.logged[0], ['Oops!']);
      done();
    }, 50);
    // acquit:ignore:end
  });

  it('example 3.5', function(done) {
    async function test() {
      try {
        const v = await Promise.reject(new Error('Oops!'));
        return v;
      } catch (error) { return 'ok'; }
    }
    // Prints "ok"
    test().then(v => console.log(v), err => console.log(err.message));
    // acquit:ignore:start
    setTimeout(() => {
      assert.equal(console.logged.length, 1);
      assert.deepEqual(console.logged[0], ['ok']);
      done();
    }, 50);
    // acquit:ignore:end
  });

  it('example 3.6', function(done) {
    async function test() {
      try {
        return await Promise.reject(new Error('Oops!'));
      } catch (error) { return 'ok'; }
    }
    // Prints "ok"
    test().then(v => console.log(v), err => console.log(err.message));
    // acquit:ignore:start
    setTimeout(() => {
      assert.equal(console.logged.length, 1);
      assert.deepEqual(console.logged[0], ['ok']);
      done();
    }, 50);
    // acquit:ignore:end
  });

  it('example 3.10', async function() {
    await Promise.all([fibonacci(50000), fibonacci(50000)]);
    async function fibonacci(n) {
      let prev2 = 1;
      let prev1 = 1;
      let cur = 1;
      for (let i = 2; i < n; ++i) {
        // Pause this instance of `fibonacci()` so the other `fibonacci()`
        // function call can make progress.
        await new Promise(resolve => setImmediate(resolve));
        // "Fib: 10000"
        // "Fib: 10000"
        // "Fib: 20000" ...
        if (i % 10000 === 0) console.log('Fib:', i);
        cur = prev1 + prev2;
        prev2 = prev1;
        prev1 = cur;
      }
      return cur;
    }
    // acquit:ignore:start
    assert.deepEqual(console.logged.map(v => v[1]),
      [10000, 10000, 20000, 20000, 30000, 30000, 40000, 40000]);
    assert.equal(await fibonacci(1), 1);
    assert.equal(await fibonacci(2), 1);
    assert.equal(await fibonacci(3), 2);
    assert.equal(await fibonacci(4), 3);
    assert.equal(await fibonacci(5), 5);
    assert.equal(await fibonacci(6), 8);
    assert.equal(await fibonacci(7), 13);
    // acquit:ignore:end
  });
});
