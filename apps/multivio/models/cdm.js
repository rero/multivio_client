/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('request_handler.js');
sc_require('configurator.js');

Multivio.fileRecord = SC.Object.extend({
  received: [],
  metadata: null,
  physicalStructure: null,
  logicalStructure: null,
  url: null,

  init: function(){
    sc_super();
  },

  isComplete: function(){
    if(this.get('received').length === 3){
      return YES;
    }
    return NO;
  }.property('received').cacheable()

});


/** 
  @class

  CDM (Core Document Model) is the global model of the application. 
  The CDM consists of 4 objects.

  CDM can return as response:
    -1: the response is not on the client-side but 
        the request has been transmitted to the server
    Object: the response of the request. The response can be 'null'

  @extends SC.Object
  @version 0.2.0
*/
Multivio.CDM = SC.Object.create(SC.Enumerable, SC.Array,{
  requestHandler: Multivio.requestHandler,
  apiServerVersion: undefined,
  init: function () {
    this._array = [];
  },

  length: function() {
    return this._array ? this._array.length : 0;
  }.property().cacheable(),

  // return an object at the named index
  objectAt: function(idx) {
    return this._array ? this._array[idx] : undefined;
  },

  replace: function(start, amt, items) {
    var array = this._array;
    if (!array) { array = this._array = [];}
      array.replace(start, amt, items);  // pass through

    // compute the delta change...remember items may be null
    var len = items ? items.length : 0 ;
    var delta = len - amt;

    // notify observers..
    this.enumerableContentDidChange(start, amt, delta);
    return this;
  },

  getServerInfo: function() {
    Multivio.configurator.set('serverVersion', undefined);
    var versionReq = Multivio.configurator.getPath('baseUrlParameters.version');
    SC.Logger.debug('Get server info');
    this.get('requestHandler').sendGetRequest(versionReq, this, '_verifyVersion', '_requestError');
  },

  _requestError: function () {
    Multivio.setPath("errorController.errorMessage", "Server is not responding");
    Multivio.mainStatechart.sendEvent('initializationError');
  },

  _checkIsVersionSupported: function(version, to_compare){
    if(SC.none(version) || SC.none(to_compare)) {
      return NO;
    }
    var vers = version.split(".");
    var to_compare_vers = to_compare.split(".");  
    if(vers.length !== to_compare_vers.length) {
      return NO;
    }

    for(var i=0;i<3;i++) {
      if (parseInt(vers[i], 10) < parseInt(to_compare_vers[i], 10)) {
        SC.Logger.debug("i:" + i);
        return NO;
      }  
    }
    return YES;
  },

  _verifyVersion: function (response, url, field) {
    if (SC.ok(response)) {
      SC.Logger.debug("Server version received:" + response.get("body").api_version + ": " + Multivio.configurator.get("serverCompatibility"));

      var version_ok = this._checkIsVersionSupported(Multivio.configurator.get("serverCompatibility"), response.get('body').api_version);
      if(version_ok) {
        SC.Logger.debug("Server and client are compatible.");
        Multivio.configurator.set('serverVersion', response.get("body").version);
        Multivio.mainStatechart.sendEvent('initializationOk');
      }
      else {
        SC.Logger.debug("Server and client are not compatible.");
        Multivio.setPath("errorController.errorMessage", "Server and client are incompatible");
        Multivio.mainStatechart.sendEvent('initializationError');
      }
    }else{
      this._requestError();
    }
  },

  _receivedData: function(response, url, field) {
    if (SC.ok(response)) {
      var result = response.get("body");
      var rec = this.find(url);
      if(SC.none(rec)) {
        rec = Multivio.fileRecord.create({url: url});
        this.pushObject(rec);
      }else{
        /* notify changes */
        this.enumerableContentDidChange();
      }
      rec.get('received').push(field);
      rec.set(field, result);
    }else{
      this._requestError();
    }
  },

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
  },

  find: function(url) {
    var records = this.get('fileRecords');
    for(var i=0;i<this.length();i++) {
      if(this.objectAt(i).url === url) {
        return this.objectAt(i);
      }
    }
    return null;
  }

});
