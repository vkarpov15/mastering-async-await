'use strict';

const assert = require('assert');
const redux = require('redux');
const superagent = require('superagent');

// For monkeypatched console later
const _console = console;

describe('Chapter 4 Examples', function() {
  let app;

  beforeEach(function() {
    app = require('express')();
  });

  it('Example 4.4', async function() {
    assert.equal(await Promise.resolve(42), 42);
  });

  it('Example 4.5', async function() {
    const app = require('express')();
    app.get('*', (req, res) => res.send('Hello, World!'));
    const server = app.listen(3000);
    // acquit:ignore:start
    await new Promise(resolve => setTimeout(resolve, 20));
    const text = await superagent.get('http://localhost:3000').
      then(res => res.text);
    assert.equal(text, 'Hello, World!');
    server.close();
    // acquit:ignore:end
  });

  it('Example 4.6', async function() {
    const app = require('express')();
    app.get('*', async (req, res) => res.send('Hello, World!'));
    const server = app.listen(3000);
    // acquit:ignore:start
    await new Promise(resolve => setTimeout(resolve, 20));
    const text = await superagent.get('http://localhost:3000').
      then(res => res.text);
    assert.equal(text, 'Hello, World!');
    server.close();
    // acquit:ignore:end
  });

  it('Example 4.7', function(done) {
    const app = require('express')();
    // Process will crash, won't send a response
    app.get('*', async () => { throw Error('Oops!'); });
    const server = app.listen(3000);
    // acquit:ignore:start
    const op = () => {
      request.abort();
      server.close();
      done();
    };
    process.once('unhandledRejection', op);
    // acquit:ignore:end
    // This request will error out, but not with the 'Oops!' error
    const request = superagent.get('http://localhost:3000').end();
  });

  it('Example 4.8', async function() {
    app.get('*', wrap(async () => { throw Error('Oops!'); }));
    const server = app.listen(3000);
    // acquit:ignore:start
    let threw = false;
    // acquit:ignore:end
    try {
      await superagent.get('http://localhost:3000');
    } catch (error) {
      // error.response.text === 'Oops!'
      // acquit:ignore:start
      threw = true;
      assert.ok(error);
      assert.equal(error.response.text, 'Oops!');
      // acquit:ignore:end
    }
    // acquit:ignore:start
    assert.ok(threw);
    server.close();
    // acquit:ignore:end
    function wrap(fn) {
      return (req, res) => fn(req, res).catch(error => {
        if (res.headersSent) {
          // `headersSent` means Express has already started sending
          // an HTTP response, so we can't report the error via the
          // HTTP response. Depending on your app's needs, you may
          // choose to rethrow the error here, or ignore it.
          return;
        }
        // Error occurred, set the response status to 500 (Internal
        // Server Error) and send the error message.
        res.status(500).send(error.message);
      });
    }
  });

  describe('MongoDB', function() {
    let server;
    let client;
    let db;

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

    before(async function() {
      const { Server } = require('mongodb-topology-manager');
      server = new Server('mongod', { dbpath: `${__dirname}/db` });
      await server.discover();
      await server.purge();
      await server.start();
    });

    beforeEach(async function() {
      const { MongoClient } = require('mongodb');
      const uri = 'mongodb://localhost:27017/test';
      client = await MongoClient.connect(uri);
      db = client.db('test');
    });

    afterEach(async function() {
      await client.close();
    });

    after(async function() {
      return server.stop();
    })

    it('Example 4.9', async function() {
      const { MongoClient } = require('mongodb');
      const uri = 'mongodb://localhost:27017/test';
      const client = await MongoClient.connect(uri);
      const db = client.db('test');

      await db.collection('test').insertOne({ answer: 42 }); // Create
      const doc = await db.collection('test').findOne(); // Read
      console.log(doc.answer); // Prints "42"
      // acquit:ignore:start
      assert.deepEqual(console.logged, [[42]]);
      await client.close();
      // acquit:ignore:end
    });

    it('Example 4.10', async function() {
      await db.collection('Movie').insertMany([
        { title: 'Star Wars', year: 1977 },
        { title: 'The Empire Strikes Back', year: 1980 },
        { title: 'Return of the Jedi', year: 1983 }
      ]);
      // Do not `await`, `find()` returns a cursor synchronously
      const cursor = db.collection('Movie').find();
      for (let v = await cursor.next(); v != null; v = await cursor.next()) {
        console.log(v.year); // Prints "1977", "1980", "1983"
      }
      // acquit:ignore:start
      assert.deepEqual(console.logged, [
        [1977],
        [1980],
        [1983]
      ]);
      await db.collection('Movie').drop();
      await client.close();
      // acquit:ignore:end
    });

    describe('cursor examples', function() {
      beforeEach(async function() {
        await db.collection('Movie').insertMany([
          { title: 'Star Wars', year: 1977 },
          { title: 'The Empire Strikes Back', year: 1980 },
          { title: 'Return of the Jedi', year: 1983 }
        ]);
      });

      afterEach(async function() {
        await db.collection('Movie').drop();
      });

      it('Example 4.11', function(done) {
        // Do not `await`, `find()` returns a cursor synchronously
        const cursor = db.collection('Movie').find();
        // Prints "1977", "1980", "1983", "done"
        cursor.on('data', doc => console.log(doc.year));
        cursor.on('end', () => console.log('done'));
        // acquit:ignore:start
        setTimeout(() => {
          assert.deepEqual(console.logged, [
            [1977],
            [1980],
            [1983],
            ['done']
          ]);
          done();
        }, 150);
        // acquit:ignore:end
      });
    });
  });

  describe('Redux', function() {
    let reducer;
    let store;

    beforeEach(function() {
      const { createStore } = redux;
      reducer = (state, action) => {
        switch(action.type) {
          case 'INCREMENT': return state + 1;
          case 'DECREMENT': return state - 1;
          default:          return state;
        };
      };
      store = createStore(reducer, 0);
    });

    const console = {
      logged: [],
      log: function() {
        console.logged.push(Array.prototype.slice.call(arguments));
      }
    };

    beforeEach(function() {
      console.logged = [];
    });

    it('Example 4.12', function() {
      // A _store_ tracks state and lets you dispatch _actions_
      const { createStore } = require('redux');
      // A _reducer_ is a sync function that changes the state
      const reducer = (state, action) => {
        switch(action.type) { // Redux calls reducer on every action
          case 'INCREMENT': return state + 1;
          case 'DECREMENT': return state - 1;
          default:          return state;
        };
      };
      // Create a new store and subscribe to state changes
      const store = createStore(reducer, 0);
      store.subscribe(() => console.log(store.getState()));

      store.dispatch({ type: 'INCREMENT' }); // Prints "1"
      store.dispatch({ type: 'INCREMENT' }); // Prints "2"
      store.dispatch({ type: 'DECREMENT' }); // Prints "1"
      // acquit:ignore:start
      assert.deepEqual(console.logged, [[1], [2], [1]]);
      // acquit:ignore:end
    });

    it('Example 4.13', function(done) {
      store.subscribe(() => console.log(store.getState()));

      run().catch(error => _console.log(error.stack));

      async function run() {
        store.dispatch({ type: 'INCREMENT' }); // Prints "1"
        await new Promise(resolve => setImmediate(resolve));
        store.dispatch({ type: 'INCREMENT' }); // Prints "2"
        // acquit:ignore:start
        assert.deepEqual(console.logged, [[1], [2]]);
        done();
        // acquit:ignore:end
      }
    });

    it('Example 4.14', function(done) {
      const { createStore, applyMiddleware } = require('redux');
      const thunk = require('redux-thunk').default;

      // The 3rd arg to `createStore()` is composed Redux _middleware_,
      // in this case just the `redux-thunk` middleware.
      const store = createStore(reducer, 0, applyMiddleware(thunk));
      store.subscribe(() => console.log(store.getState()));

      // `redux-thunk` lets you dispatch _action creators_, which are
      // potentially async functions that can `dispatch()` more actions
      store.dispatch(async (dispatch) => {
        dispatch({ type: 'INCREMENT' }); // Prints "1"
        await new Promise(resolve => setImmediate(resolve));
        dispatch({ type: 'INCREMENT' }); // Prints "2"
        // acquit:ignore:start
        assert.deepEqual(console.logged, [[1], [2]]);
        done();
        // acquit:ignore:end
      });
    });
  });
});
