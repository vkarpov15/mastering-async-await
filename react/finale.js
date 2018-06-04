const { renderToString } = require('react-dom/server');
const { createElement, Component } = require('react');
const { createStore, applyMiddleware } = require('redux');
const thunk = require('redux-thunk').default;

const reducer = (state, action) => {
  if (action.type === 'SET') state.text = action.payload;
  return state;
};
const store = createStore(reducer, { text: '' }, applyMiddleware(thunk));

class MyComponent extends Component {
  componentWillMount() {
    this.setState(store.getState()); // Pull state from Redux
  }
  render() { return createElement('h1', null, this.state.text); }
}

store.dispatch(async (dispatch) => {
  await new Promise(resolve => setTimeout(resolve, 250));
  dispatch({ type: 'SET', payload: 'Hello, World!' });
});

setInterval(() => {
  // First 2 will print an empty <h1>, then "Hello, World!"
  console.log(renderToString(createElement(MyComponent)));
}, 100);
