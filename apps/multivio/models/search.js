/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/
sc_require('mixins/remote_data.js');
sc_require('configurator.js');

Multivio.SearchRecord = SC.Object.extend({
  maxReached: -1,
  results: null,
  url: null,
  query: null

});


Multivio.SearchData = SC.Object.create(SC.Array, Multivio.RemoteData, {
  getSearchResult: function (query, url) {
    var serverAdress = Multivio.configurator.
      getPath('baseUrlParameters.search').fmt(query, url);
    this.get('requestHandler').
      sendGetRequest(serverAdress, this, '_receivedData', url, query);
  },

  _receivedData: function(response, url, query) {
    if (SC.ok(response)) {
      var result = response.get("body");
      var rec = this.find(url, query);
      SC.Logger.debug('_receivedData for ' + url + ' :' + rec);
      //if(SC.none(rec)) {
        rec = Multivio.SearchRecord.create({url: url, query: query, results: result.file_position.results, maxReached: result.max_reached});
        this.pushObject(rec);
      //}
    }else{
      this._requestError();
    }
  },
  find: function(url, query) {
    var records = this.get('content');
    for(var i=0;i<this.length();i++) {
      if(this.objectAt(i).url === url &&
        this.objectAt(i).query === query) {
        return this.objectAt(i);
      }
    }
    return null;
  }
});
