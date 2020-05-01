'use strict';

const assert = require('assert');

describe('Chapter 2 Examples', function() {
  let Promise25;

  let logged = [];
  const _console = {
    logged: [],
    log: function() {
      _console.logged.push(Array.prototype.slice.call(arguments));
    }
  };

  beforeEach(function() {
    _console.logged = [];
  });

  it('example 2.2', function() {
    const p = new Promise((resolve, reject) => {
      resolve('foo');
      // The below `reject()` is a no-op. A fulfilled promise stays
      // fulfilled with the same value forever.
      reject(new Error('bar'));
    });
    // acquit:ignore:start
    return p;
    // acquit:ignore:end
  });

  it('example 2.4', function() {
    class Promise {
      constructor(executor) {
        this.state = 'PENDING';
        this.chained = []; // Not used yet
        this.value = undefined;

        try {
          // Reject if the executor throws a sync error
          executor(v => this.resolve(v), err => this.reject(err));
        } catch (err) { this.reject(err); }
      }
      // Define `resolve()` and `reject()` to change the promise state
      resolve(value) {
        if (this.state !== 'PENDING') return;
        this.state = 'FULFILLED';
        this.value = value;
      }
      reject(value) {
        if (this.state !== 'PENDING') return;
        this.state = 'REJECTED';
        this.value = value;
      }
    }
    // acquit:ignore:start
    const p1 = new Promise((resolve, reject) => {
      resolve('good');
    });
    const p2 = new Promise((resolve, reject) => {
      reject(new Error('bad'));
    });
    assert.equal(p1.state, 'FULFILLED');
    assert.equal(p2.state, 'REJECTED');
    assert.equal(p1.value, 'good');
    assert.equal(p2.value.message, 'bad');
    // acquit:ignore:end
  });

  it('example 2.5', function() {
    class Promise {
      // Constructor is the same as before, omitted for brevity
      // acquit:ignore:start
      constructor(executor) {
        assert(executor instanceof Function);
        // Internal state.
        this.state = 'PENDING';
        this.chained = [];
        this.value = undefined;
        try {
          // Reject if the executor throws a sync error
          executor(v => this.resolve(v), e => this.reject(e));
        } catch (err) {
          this.reject(err);
        }
      }
      // acquit:ignore:end
      then(onFulfilled, onRejected) {
        const { value, state } = this;
        // If promise is already settled, call the right handler
        if (state === 'FULFILLED')
          return setImmediate(onFulfilled, value);
        if (state === 'REJECTED')
          return setImmediate(onRejected, value);
        // Otherwise, store handlers so you can call them later
        this.chained.push({ onFulfilled, onRejected });
      }
      resolve(value) {
        if (this.state !== 'PENDING') return;
        Object.assign(this, { value, state: 'FULFILLED' });
        // Loop over `chained`, find `onFulfilled()` functions.
        // Remember that `.then(null, onRejected)` is valid.
        this.chained.
          filter(obj => obj.onFulfilled instanceof Function).
          // The ES6 spec section 25.4 says `onFulfilled` and
          // `onRejected` must be called on next event loop tick
          forEach(obj => setImmediate(obj.onFulfilled, value));
      }
      reject(value) {
        if (this.state !== 'PENDING') return;
        Object.assign(this, { value, state: 'REJECTED' });
        this.chained.
          filter(obj => obj.onRejected instanceof Function).
          forEach(obj => setImmediate(obj.onRejected, value));
      }
    }
    // acquit:ignore:start
    const p1 = new Promise((resolve, reject) => {
      resolve('good');
    });
    const p2 = new Promise((resolve, reject) => {
      reject(new Error('bad'));
    });
    assert.equal(p1.state, 'FULFILLED');
    assert.equal(p2.state, 'REJECTED');
    assert.equal(p1.value, 'good');
    assert.equal(p2.value.message, 'bad');

    Promise25 = Promise;
    return test();

    async function test() {
      let called = 0;
      p1.then(res => {
        assert.equal(res, 'good');
        ++called;
      });
      p2.then(null, err => {
        assert.equal(err.message, 'bad');
        ++called;
      });

      await p1;
      let threw = false;
      try {
        await p2;
      } catch (err) {
        threw = true;
        assert.equal(err.message, 'bad');
      }

      assert.ok(threw);
      assert.equal(called, 2);
    }
    // acquit:ignore:end
  });

  it('example 2.6', function() {
    async function test() {
      // Works, even though this is a custom `Promise` class. All
      // you need is a `then()` function to support `await`.
      const res = await new Promise(resolve => {
        setTimeout(() => resolve('Hello'), 50);
      });
      assert.equal(res, 'Hello');
    }
    // acquit:ignore:start
    const Promise = Promise25;
    return test();
    // acquit:ignore:end
  });

  it('example 2.15', function() {
    const originalError = new Error('Oops!');
    const p = new Promise((_, reject) => reject(originalError)).
      then(() => console.log('This will not print')).
      then(() => console.log('Nor will this')).
      // The `onFulfilled()` handlers above get skipped. Each of
      // the then() promises above reject with the original error
      catch(err => assert.ok(err === originalError));
    // acquit:ignore:start
    return p;
    // acquit:ignore:end
  });

  it('example 2.16', function() {
    // Yes, this is a thenable. When it comes to promises, the
    // letter of the law overrules the spirit of the law.
    const thenable = { then: () => { throw Error('Oops!'); } };
    // acquit:ignore:start
    const console = _console;
    // acquit:ignore:end
    // But `thenable` doesn't have `catch()`, so convert it with
    // `Promise.resolve()` use `catch()`
    const p = Promise.resolve(thenable).
      catch(err => console.log(err.message)); // Prints "Oops!"
    // acquit:ignore:start
    return p.then(() => assert.deepEqual(console.logged, [['Oops!']]));
    // acquit:ignore:end
  });

  it('example 2.18', async function() {
    async function run() {
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('run(): running');
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('run(): done');
    }
    // acquit:ignore:start
    const console = _console;
    // acquit:ignore:end

    console.log('Start running');
    await Promise.all([run(), run()]);
    console.log('Done');
    // Start running
    // run(): running
    // run(): running
    // run(): done
    // run(): done
    // Done
    // acquit:ignore:start
    assert.deepEqual(console.logged, [
      ['Start running'],
      ['run(): running'],
      ['run(): running'],
      ['run(): done'],
      ['run(): done'],
      ['Done']
    ]);
    // acquit:ignore:end
  });
});
