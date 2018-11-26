module.exports = props => `
<style>
  #container {
    min-height: 700px;
  }
</style>
<div class="left">
  <img id="cover" src="/images/cover_400.png" />
</div>
<div class="right">
  <h1>Thanks for Buying!</h1>

  <p>
    We've emailed a copy of <i>Mastering Async/Await</i> to your PayPal email.
    You can also download a copy from this page as a
    <a href="/bin/mastering-async-await.pdf">PDF</a> or
    <a href="/bin/mastering-async-await.epub">ePub</a>.
  </p>
`;
