const assert = (v, err) => {
  if (!v) {
    throw err;
  }
};

class Promise {
  constructor(executor) {
    assert(typeof executor === 'function',
      new TypeError('Executor not a function'));

    // Internal state.
    this.state = 'PENDING';
    this.chained = [];
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

  then(_onFulfilled, _onRejected) {
    _onFulfilled = _onFulfilled || (v => v);
    _onRejected = _onRejected || (err => { throw err; });
    const _Promise = this.constructor;
    return new _Promise((resolve, reject) => {
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
    const then = typeof value === 'object' && value != null ? value.then : null;
    if (typeof then === 'function') {
      try {
        return then.call(value, this.resolve.bind(this), this.reject.bind(this));
      } catch (error) {
        return this.reject(error);
      }
    }
    this.state = 'FULFILLED';
    this.value = value;
    // Loop through the `chained` array and find all `onFulfilled()`
    // functions. Keep in mind `.then(null, onRejected)` is valid,
    // so `onFulfilled` may be `null`.
    this.chained.
      filter(({ onFulfilled }) => typeof onFulfilled === 'function').
      forEach(({ onFulfilled }) => {
        setImmediate(() => onFulfilled(value));
      });
  }

  reject(value) {
    if (this.state !== 'PENDING') return;
    this.state = 'REJECTED';
    this.value = value;
    this.chained.
      filter(({ onRejected }) => typeof onRejected === 'function').
      forEach(({ onRejected }) => {
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
    const _Promise = this;
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
