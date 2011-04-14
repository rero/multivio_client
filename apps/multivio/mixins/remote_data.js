/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

Multivio.RemoteData = {
  
  requestHandler: Multivio.requestHandler,

  init: function () {
    this._array = [];
  },

  removeAll: function() {
    if(this.get('length') > 0) {
      this.removeAt(0, this.get('length')); 
      this.get('requestHandler').set('listOfRequest', undefined);
    }
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
  _requestError: function () {
    SC.Logger.debug('http error');
    Multivio.setPath("errorController.errorMessage", "Server is not responding");
    Multivio.mainStatechart.sendEvent('serverError');
  },


  _receivedData: function(response, url, field) {
    if (SC.ok(response)) {
      var result = response.get("body");
      var rec = this.find(url);
      SC.Logger.debug('_receivedData for ' + url + ' :' + rec);
      if(SC.none(rec)) {
        rec = Multivio.FileRecord.create({url: url});
        rec.get('received').push(field);
        rec.set(field, result);
        this.pushObject(rec);
      }else{
        rec.get('received').push(field);
        rec.set(field, result);
        /* notify changes */
        this.enumerableContentDidChange();
      }
    }else{
      this._requestError();
    }
  },
  find: function(url) {
    var records = this.get('content');
    for(var i=0;i<this.length();i++) {
      if(this.objectAt(i).url === url) {
        return this.objectAt(i);
      }
    }
    return null;
  }

}
