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

    try {
      // Reject if the executor function throws a sync error
      executor(v => this.resolve(v), err => this.reject(err));
    } catch (err) {
      this.reject(err);
    }
  }

  then(_onFulfilled, _onRejected) {
    // Ensure `onFulfilled` and `onRejected` are always functions. If
    // `null` or some other value, `onFulfilled` is a noop...
    if (typeof _onFulfilled !== 'function') {
      _onFulfilled = (v => v);
    }
    // and `onRejected` just rethrows the error
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
      return this.reject(new TypeError('Cannot resolve promise with itself'));
    }
    let then = null;
    if (['object', 'function'].includes(typeof value) && value != null) {
      try {
        then = value.then;
      } catch (error) {
        return this.reject(error);
      }
    }
    if (typeof then === 'function') {
      // Important detail: `resolve()` and `reject()` cannot be called
      // more than once. This means if `then()` calls `resolve()` with
      // a promise that later fulfills and then throws, the promise
      // that `then()` returns will be fulfilled.
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
      try {
        return then.call(value, resolve, reject);
      } catch (error) {
        return reject(error);
      }
    }
    this.state = 'FULFILLED';
    this.value = value;
    this.chained.forEach(({ onFulfilled }) => {
      setImmediate(() => onFulfilled(value));
    });
  }

  reject(value) {
    if (this.state !== 'PENDING') return;
    this.state = 'REJECTED';
    this.value = value;
    this.chained.forEach(({ onRejected }) => {
      setImmediate(() => onRejected(value));
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  // ------------------------------------
  // The below functionality is **not** covered in the book, but is necessary
  // for the es6 promise test suite
  // ------------------------------------

  finally(onFinally) {
    return this.then(
      /* onFulfilled */
      res => Promise.resolve(onFinally.call(this)).then(() => res),
      /* onRejected */
      err => Promise.resolve(onFinally.call(this)).then(() => { throw err; })
    );
  }

  static all(arr) {
    if (!Array.isArray(arr)) {
      return _Promise.reject(new TypeError('all() only accepts an array'));
    }
    let remaining = arr.length;
    if (arr.length === 0) {
      return _Promise.resolve([]);
    }
    let result = [];
    return new _Promise((resolve, reject) => {
      arr.forEach((p, i) => {
        _Promise.resolve(p).then(
          res => {
            result[i] = res;
            --remaining || resolve(result);
          },
          err => {
            reject(err);
          });
      });
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
    return new this(resolve => resolve(v));
  }

  static reject(err) {
    return new this((resolve, reject) => reject(err));
  }
}

module.exports = {
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
