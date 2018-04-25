const page = require('webpage').create();
const system = require('system');
const fs = require('fs');

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';

page.paperSize = {
  format: 'A4',
  orientation: 'portrait',
  margin: {
    top: '60px',
    bottom: '45px',
    left: '35px',
    right: '35px'
  },
  footer: {
    height: '15px',
    contents: phantom.callback(function(pageNum) {
      if (pageNum <= 1) {
        return '';
      }
      return '<div style="position: absolute; right: 0px; font-family: \'Sans\'; font-size: 0.75em">' +
        (pageNum - 1) + '</div>';
    })
  }
};

page.content = fs.read(system.args[1]);

var output = system.args[2];

window.setTimeout(function () {
    page.render(output, {format: 'pdf'});
    phantom.exit(0);
}, 2000);
