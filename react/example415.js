const { renderToString } = require('react-dom/server');
const { createElement, Component } = require('react');

class MyComponent extends Component {
  componentWillMount() {
    this.setState({ text: 'Hello, World!' });
  }

  render() { return createElement('h1', null, this.state.text); }
}

// <h1 data-reactroot="">Hello, World!</h1>
console.log(renderToString(createElement(MyComponent)));
