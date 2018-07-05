const fs = require('fs');
const nightmare = require('nightmare');

const bannerCss = fs.readFileSync('./content/banner.css');
const banner = fs.readFileSync('./content/banner.html');

const bannerHtml = `
  <link href='http://fonts.googleapis.com/css?family=Titillium+Web' rel='stylesheet' type='text/css'>
  <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
  <link href='http://fonts.googleapis.com/css?family=Droid+Sans+Mono' rel='stylesheet' type='text/css'>
  <style>
    ${bannerCss}
  </style>
  <div id="content">
    ${banner}
  </div>
`;

fs.writeFileSync('./bin/banner.html', bannerHtml);

main().catch(error => console.error(error.stack));

async function main() {
  let browser = nightmare({ show: false });

  await browser.goto(`file://${__dirname}/bin/banner.html`).
    viewport(800, 175).
    screenshot('./bin/banner.png');
  console.log('Done');
}
