'use strict';

const assert = require('assert');

describe('Chapter 2 Examples', function() {
  let Promise25;

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
        } catch (err) {
          this.reject(err);
        }
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
        assert(typeof executor === 'function', 'Executor not a function');

        // Internal state.
        this.state = 'PENDING';
        this.chained = [];
        this.value = undefined;

        try {
          // Reject if the executor throws a sync error
          executor(v => this.resolve(v), err => this.reject(err));
        } catch (err) {
          this.reject(err);
        }
      }
      // acquit:ignore:end
      then(onFulfilled, onRejected) {
        const { value, state } = this;
        // If promise is already settled, enqueue the right handler
        if (state === 'FULFILLED') return setImmediate(onFulfilled, value);
        if (state === 'REJECTED') return setImmediate(onRejected, value);
        // Otherwise, track `onFulfilled` and `onRejected` for later
        this.chained.push({ onFulfilled, onRejected });
      }
      resolve(value) {
        if (this.state !== 'PENDING') return;
        this.state = 'FULFILLED';
        this.value = value;
        // Loop through the `chained` array and find all `onFulfilled()`
        // functions. Remember that `.then(null, onRejected)` is valid.
        this.chained.
          filter(({ onFulfilled }) => typeof onFulfilled === 'function').
          // The ES6 spec section 25.4 says `onFulfilled` and
          // `onRejected` must be called on a separate event loop tick
          forEach(({ onFulfilled }) => setImmediate(onFulfilled, value));
      }
      reject(value) {
        if (this.state !== 'PENDING') return;
        this.state = 'REJECTED';
        this.value = value;
        this.chained.
          filter(({ onRejected }) => typeof onRejected === 'function').
          forEach(({ onFulfilled }) => setImmediate(onFulfilled, value));
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
      // Works, even though this is a custom `Promise` class. All you
      // need is a `then()` function to integrate with `await`.
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
});
