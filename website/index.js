const fs = require('fs');
const layout = require('./layout');

const pages = [
  { url: '/', path: './index.html', template: './home' },
  { url: '/thank-you.html', path: './thank-you.html', template: './thanks.js' },
  { url: '/wyncode.html', path: './wyncode.html', template: './wyncode.js' }
].map(p => Object.assign(p, { content: require(p.template)(p) }));

for (const page of pages) {
  fs.writeFileSync(page.path, layout(page));
}

console.log('Done');
