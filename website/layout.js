module.exports = props => `
<html>
  <head>
    <link rel="stylesheet" href="/website/style.css">

    <link href="//fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css">
  </head>
  <body>
    <div id="container">
      ${props.content}
    </div>

    <script
      type="text/javascript"
      src="https://d26b395fwzu5fz.cloudfront.net/3.5.0/keen.min.js"></script>
    <script type="text/javascript" src="/website/track.js"></script>
  </body>
</html>
`;
