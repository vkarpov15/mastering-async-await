const home = require('./home');

module.exports = props => home(Object.assign({}, props, {
  price: `
    <del>&nbsp;$24.99&nbsp;</del>
    $19.99<br>
    <small>for JavaScript Jabber listeners</small>
  `,
  buyButton: `
    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
    <input type="hidden" name="cmd" value="_s-xclick">
    <input type="hidden" name="hosted_button_id" value="SH37BCTJ3F4KS">
    <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
    <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
    </form>
  `
}));
