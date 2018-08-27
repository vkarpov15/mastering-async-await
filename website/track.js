var client = new Keen({
  projectId: '5b218103c9e77c0001524f51',
  writeKey: '99B21BF12053F617C31642B4B3E2FBF3FCCBBD9F04051F08C430BB2CC944469D279DB805568E2666E9B0216AA1B6764971995D8EF88D364285D816E42B5DCF87B35BC3698B3894071809A588D6FEB0E5EDC29B9B90B71E7F21CD3A4849CCE8DE'
});
client.addEvent('track', {
  type: 'visit',
  url: window.location.pathname,
  utmSource: getUrlParameter('utm_source'),
  utmCampaign: getUrlParameter('utm_campaign')
}, function(error) {});

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
