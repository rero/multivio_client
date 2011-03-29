
sc_require('fixtures/cdm.js');
sc_require('configurator.js');

Multivio.fixtureResponse = SC.Object.create({
      isError: NO,
      body: undefined
});

Multivio.fixtureRequestHandler = SC.Object.create(
/** @scope Multivio.requestHandler.prototype */ {
  
  fixtures: Multivio.CDMFixtures,
  body: undefined,
  sendGetRequest: function (uri, callbackTarget, callbackMethod, param1, param2) {
    var serverName = Multivio.configurator.get('serverName');
    var req = serverName + uri;
    console.info('Fake request with: ' + req);
    var response = Multivio.fixtureResponse;
    SC.Logger.debug(serverName + " : " + this.get('fixtures')[req]);
    response.set('body', this.get('fixtures')[req]);
    callbackTarget[callbackMethod].apply(callbackTarget,[response, param1, param2]);
  }
});
