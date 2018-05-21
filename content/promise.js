const assert = (v, err) => {
  if (!v) {
    throw err;
  }
};

let counter = 0;

class Promise {
  constructor(executor) {
    assert(typeof executor === 'function',
      new TypeError('Executor not a function'));

    // Internal state.
    this.state = 'PENDING';
    this.chained = [];
    this.value = undefined;
    this.id = ++counter;
    this.executor = executor;

    const { resolve, reject } = this._wrapResolveReject();
    try {
      // Reject if the executor function throws a sync error
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  // In addition to enforcing that a promise cannot change state once
  // it is settled, a promise also cannot change state once you call
  // `resolve()` with a promise. Easiest way to enforce this is to
  // ensure `resolve()` and `reject()` can only be called once.
  _wrapResolveReject() {
    let called = false;
    const resolve = v => {
      if (called) return;
      called = true;
      this.resolve(v);
    };
    const reject = err => {
      if (called) return;
      called = true;
      this.reject(err);
    };
    return { resolve, reject };
  }

  then(_onFulfilled, _onRejected) {
    // Defaults to ensure `onFulfilled` and `onRejected` are always
    // functions. `onFulfilled` is a no-op by default...
    if (typeof _onFulfilled !== 'function') {
      _onFulfilled = (v => v);
    }
    // and `onRejected` just rethrows the error by default
    if (typeof _onRejected !== 'function') {
      _onRejected = err => { throw err; };
    }
    return new Promise((resolve, reject) => {
      // Wrap `onFulfilled` and `onRejected` for two reasons:
      // consistent async and `try/catch`
      const onFulfilled = res => setImmediate(() => {
        try {
          resolve(_onFulfilled(res));
        } catch (err) {
          reject(err);
        }
      });
      const onRejected = err => setImmediate(() => {
        try {
          resolve(_onRejected(err));
        } catch (err) {
          reject(err);
        }
      });

      if (this.state === 'FULFILLED') return onFulfilled(this.value);
      if (this.state === 'REJECTED') return onRejected(this.value);
      this.chained.push({ onFulfilled, onRejected });
    });
  }

  resolve(value) {
    if (this.state !== 'PENDING') return;
    if (value === this) {
      return this.reject(TypeError(`Can't resolve promise with itself`));
    }
    // Is `value` a thenable? If so, fulfill/reject this promise when
    // `value` fulfills or rejects. The Promises/A+ spec calls this
    // process "assimilating" the other promise (resistance is futile).
    const then = this._getThenProperty(value);
    if (typeof then === 'function') {
      // Important detail: `resolve()` and `reject()` cannot be called
      // more than once. This means if `then()` calls `resolve()` with
      // a promise that later fulfills and then throws, the promise
      // that `then()` returns will be fulfilled.
      const { resolve, reject } = this._wrapResolveReject();
      try {
        return then.call(value, resolve, reject);
      } catch (error) {
        return reject(error);
      }
    }

    // If `value` is **not** a thenable, transition to fulfilled
    this.state = 'FULFILLED';
    this.value = value;
    this.chained.
      forEach(({ onFulfilled }) => setImmediate(onFulfilled, value));
  }

  reject(v) {
    if (this.state !== 'PENDING') return;
    this.state = 'REJECTED';
    this.value = v;
    this.chained.forEach(({ onRejected }) => setImmediate(onRejected, v));
  }

  _getThenProperty(value) {
    if (['object', 'function'].includes(typeof value) && value != null) {
      try {
        return value.then;
      } catch (error) {
        // Unlikely edge case that is enforced by Promise/A+ spec
        // section 2.3.3.2: if getting `value.then` throws, reject
        // immediately.
        this.reject(error);
      }
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      /* onFulfilled */
      res => Promise.resolve(onFinally.call(this)).then(() => res),
      /* onRejected */
      err => Promise.resolve(onFinally.call(this)).then(() => { throw err; })
    );
  }

  static all(arr) {
    let remaining = arr.length;
    if (remaining === 0) return Promise.resolve([]);
    // `result` stores the value that each promise is fulfilled with
    let result = [];
    return new Promise((resolve, reject) => {
      // Loop through every promise in the array and call `then()`. If
      // the promise fulfills, store the fulfilled value in `result`.
      // If any promise rejects, the `all()` promise rejects immediately.
      arr.forEach((p, i) => p.then(
        res => {
          result[i] = res;
          --remaining || resolve(result);
        },
        err => reject(err)));
    });
  }

  static race(arr) {
    const _Promise = this;
    if (!Array.isArray(arr)) {
      return _Promise.reject(new TypeError('race() only accepts an array'));
    }
    return new _Promise((resolve, reject) => {
      arr.forEach(p => {
        _Promise.resolve(p).then(resolve, reject);
      });
    });
  }

  static resolve(v) {
    return new Promise(resolve => resolve(v));
  }

  static reject(err) {
    return new Promise((resolve, reject) => reject(err));
  }
}

module.exports = {
  Promise: Promise,
  resolved: v => Promise.resolve(v),
  rejected: err => Promise.reject(err),
  deferred: () => {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    return { resolve, reject, promise };
  }
};
