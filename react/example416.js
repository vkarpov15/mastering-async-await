const { renderToString } = require('react-dom/server');
const { createElement, Component } = require('react');

class MyComponent extends Component {
  async componentWillMount() {
    this.setState({ text: null });
    await new Promise(resolve => setImmediate(resolve));
    // Unhandled promise rejection
    throw Error('Oops');
  }
  render() { return createElement('h1', null, this.state.text); }
}
// <h1 data-reactroot=""></h1>
console.log(renderToString(createElement(MyComponent)));
