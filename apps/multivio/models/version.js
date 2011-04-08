/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('mixins/remote_data.js');

Multivio.ServerVersion = SC.Object.create(SC.Enumerable, SC.Array, Multivio.RemoteData, {
  apiServerVersion: undefined,

  getServerInfo: function() {
    Multivio.configurator.set('serverVersion', undefined);
    var versionReq = Multivio.configurator.getPath('baseUrlParameters.version');
    SC.Logger.debug('Get server info');
    this.get('requestHandler').sendGetRequest(versionReq, this, '_verifyVersion', '_requestError');
  },

  _checkIsVersionSupported: function(version, toCompare){
    if(SC.none(version) || SC.none(toCompare)) {
      return NO;
    }
    var vers = version.split(".");
    var toCompareVersion = toCompare.split(".");  
    if(vers.length !== toCompareVersion.length) {
      return NO;
    }

    for(var i=0;i<3;i++) {
      if (parseInt(vers[i], 10) < parseInt(toCompareVersion[i], 10)) {
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
  }

});
