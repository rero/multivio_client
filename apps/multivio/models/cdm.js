/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('request_handler.js');
sc_require('configurator.js');
sc_require('mixins/remote_data.js');

Multivio.CDM = SC.Object.create(SC.Array, Multivio.RemoteData, {

  getMetadata: function (url) {
    var serverAdress = Multivio.configurator.
      getPath('baseUrlParameters.metadata');
    serverAdress += url;
    this.get('requestHandler').
      sendGetRequest(serverAdress, this, '_receivedData', url, "metadata");
  },

  getLogicalStructure: function (url) {
    var serverAdress = Multivio.configurator.
      getPath('baseUrlParameters.logicalStructure');
    serverAdress += url;
    this.get('requestHandler').
      sendGetRequest(serverAdress, this, '_receivedData', url, "logicalStructure");
  },

  getPhysicalStructure: function (url) {
    var serverAdress = Multivio.configurator.
      getPath('baseUrlParameters.physicalStructure');
    serverAdress += url;
    this.get('requestHandler').
      sendGetRequest(serverAdress, this, '_receivedData', url, "physicalStructure");
  }
});
