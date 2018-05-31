const { renderToString } = require('react-dom/server');
const { createElement, Component } = require('react');

class MyComponent extends Component {
  render() {
    return createElement('h1', null, 'Hello, World!');
  }
}

// <h1 data-reactroot="">Hello, World!</h1>
console.log(renderToString(createElement(MyComponent)));
