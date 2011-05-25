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
        rec.results.forEach(function(item, index, self) {
          item.idx = index;
        });
        this.pushObject(rec);
      //}
    }else{
      this._requestError();
    }
  },
  find: function(url, query, idx) {
    var results = this.filterProperty('query', query);
    if(!SC.none(results)) {
      results = results.findProperty('url', url);
    }
    if(SC.none(idx) || SC.none(results)){
      return results;
    }else{
      return results.objectAt(idx);
    }
  }
});
