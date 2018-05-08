'use strict';

const assert = require('assert');

describe('Chapter 2 Examples', function() {
  let Promise25;

  it('example 2.2', function() {
    const p = new Promise((resolve, reject) => {
      resolve('foo');
      // The below `reject()` is a no-op, once a promise is fulfilled it
      // stays fulfilled with the same value forever.
      reject(new Error('bar'));
    });
    // acquit:ignore:start
    return p;
    // acquit:ignore:end
  });

  it('example 2.4', function() {
    class Promise {
      constructor(executor) {
        assert(typeof executor === 'function', 'Executor not a function');

        // Internal state.
        this.state = 'PENDING';
        this.chained = []; // Not used yet
        this.value = undefined;

        // Call the executor with the above `resolve` and `reject` functions
        try {
          // If the executor function throws a sync exception, that's a
          // a rejection. Need to `bind()` for correct value of `this`
          executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (err) {
          this.reject(err);
        }
      }

      // Define `resolve()` and `reject()` to change the promise state
      resolve(value) {
        // Calling `resolve()` twice is a no-op
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
      constructor(executor) { // same as before, omitted for brevity
        // acquit:ignore:start
        assert(typeof executor === 'function', 'Executor not a function');

        // Internal state.
        this.state = 'PENDING';
        this.chained = []; // Not used yet
        this.value = undefined;

        // Call the executor with the above `resolve` and `reject` functions
        try {
          // If the executor function throws a sync exception, that's a
          // a rejection. Need to `bind()` for correct value of `this`
          executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (err) {
          this.reject(err);
        }
        // acquit:ignore:end
      }

      then(onFulfilled, onRejected) {
        if (this.state === 'FULFILLED') return onFulfilled(this.value);
        if (this.state === 'REJECTED') return onRejected(this.value);
        this.chained.push({ onFulfilled, onRejected });
      }

      resolve(value) {
        if (this.state !== 'PENDING') return;
        this.state = 'FULFILLED';
        this.value = value;
        // Loop through the `chained` array and find all `onFulfilled()`
        // functions. Keep in mind `.then(null, onRejected)` is valid,
        // so `onFulfilled` may be `null`.
        this.chained.
          filter(({ onFulfilled }) => typeof onFulfilled === 'function').
          forEach(({ onFulfilled }) => onFulfilled(value));
      }

      reject(value) {
        if (this.state !== 'PENDING') return;
        this.state = 'REJECTED';
        this.value = value;
        this.chained.
          filter(({ onRejected }) => typeof onRejected === 'function').
          forEach(({ onRejected }) => onRejected(value));
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

    let called = 0;
    p1.then(res => { ++called; assert.equal(res, 'good'); });
    p2.then(null, err => { ++called; assert.equal(err.message, 'bad'); });
    assert.equal(called, 2);
    Promise25 = Promise;
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
