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
    this.arrayContentWillChange();
    array.replace(start, amt, items);  // pass through
    this.arrayContentDidChange();
    this.enumerableContentDidChange();
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
      var rec = this.findProperty('url', url);
      SC.Logger.debug('_receivedData for ' + url + ' :' + rec);
      if(SC.none(rec)) {
        rec = Multivio.FileRecord.create({url: url});
        rec.get('received').push(field);
        rec.set(field, result);
        this.pushObject(rec);
      }else{
        rec.get('received').push(field);
        this.arrayContentWillChange();
        rec.set(field, result);
        this.arrayContentDidChange();
        this.enumerableContentDidChange();
        SC.Logger.debug('Received Data: notify!!!!!!!!!!!!!!!!!!');
      }
    }else{
      this._requestError();
    }
  }

};
