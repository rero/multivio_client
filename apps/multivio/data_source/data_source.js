// ==========================================================================
// Project:   MyApp.DataSource
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals MyApp */
sc_require('models/file.js');
sc_require('models/server.js');
/** @class

(Document Your Data Source Here)

@extends SC.DataSource
*/
sc_require('configurator.js');
Multivio.DataSource = SC.DataSource.extend({

  // ..........................................................
  // QUERY SUPPORT
  // 
  idx: 1,
  //serverName: null,
  //serverNameBinding: 'Multivio.configurator.serverName',

  serverName: function () {
    return Multivio.configurator.get('serverName');
  }.property('Multivio.configurator.serverName'),

  fetch: function (store, query) {

    SC.Logger.debug("new query");
    // TODO: Add handlers to fetch data for specific queries.  
    // call store.dataSourceDidFetchQuery(query) when done.
    var record_type = query.get('recordType');
    var parameters = query.get('parameters');
    if (SC.kindOf(record_type, Multivio.FileRecord) && 
        parameters && parameters.url) {
      return NO; // return YES if you handled the query
    }
    if (SC.kindOf(record_type, Multivio.SearchRecord) && 
        parameters && parameters.url && parameters.query) {
      var existingStoreKey = store.storeKeyExists(Multivio.SearchRecord, 
          this._primaryKey(query));
      if (existingStoreKey) {
        store.dataSourceDidFetchQuery(query);
        return YES;
        //return YES;
      }
      SC.Request.getUrl('/%@/document/search?angle=0&max_results=15&context_size=10&query=%@&url=%@'
        .fmt(this.get('serverName'), parameters.query, parameters.url))
        .set('isJSON', YES)
        .notify(this, this._didFetchRecord, { query: query, store: store })
        .send();
      return YES; // return YES if you handled the query
    }
    if (SC.kindOf(record_type, Multivio.ServerRecord)) {
      SC.Request.getUrl('/%@/version'.fmt(this.get('serverName')))
        .set('isJSON', YES)
        .notify(this, this._didFetchRecord, { query: query, store: store })
        .send();
      return YES; // return YES if you handled the query
    }
    return NO;
  },

  _primaryKey : function (query) {
    var record_type = query.get('recordType');
    var parameters = query.get('parameters');
    if (SC.kindOf(record_type, Multivio.ServerRecord)) {
      return this.get('serverName');
    }
    if (SC.kindOf(record_type, Multivio.SearchRecord)) {
      return parameters ? "%@-%@".fmt(parameters.query, parameters.url) : null;
    }
    return null;
  },

  _didFetchRecord: function (response, params) {
    var store = params.store;
    var query = params.query; 
    var record_type = query.get('recordType');
    var parameters = query.get('parameters');

    if (SC.$ok(response)) {
      SC.Logger.debug('received');
      if (SC.kindOf(record_type, Multivio.ServerRecord)) {
        store.loadRecords(Multivio.ServerRecord, 
            [response.get('body')], [this._primaryKey(query)]);
      }
      if (SC.kindOf(record_type, Multivio.SearchRecord)) {
        SC.Logger.debug('received search');
        store.loadRecords(Multivio.SearchRecord, [response.get('body')], 
            [this._primaryKey(query)]);
      }
      store.dataSourceDidFetchQuery(query);
      // handle error case
    } else {
      store.dataSourceDidErrorQuery(query, response);
    }
  },


  // ..........................................................
  // RECORD SUPPORT
  // 

  retrieveRecord: function (store, storeKey) {
    var record_type = store.recordTypeFor(storeKey);
    SC.Logger.debug('single: %@'.fmt(record_type));  
    var url;
    // TODO: Add handlers to fetch data for specific queries.  
    // call store.dataSourceDidFetchQuery(query) when done.
    if (SC.kindOf(record_type, Multivio.FileRecord)) {
      url = store.idFor(storeKey);
      SC.Request.getUrl('/%@/get?url=%@'.fmt(this.get('serverName'), url))
        .set('isJSON', YES)
        .notify(this, this._didFetchSingleRecord, { key: storeKey, store: store })
        .send();

      return YES; // return YES if you handled the query
    }

    if (SC.kindOf(record_type, Multivio.SearchRecord)) {
      return NO; // return YES if you handled the query
    }

    if (SC.kindOf(record_type, Multivio.ServerRecord)) {
      SC.Request.getUrl('/%@/version'.fmt(this.get('serverName')))
        .set('isJSON', YES)
        .notify(this, this._didFetchSingleRecord, { key: storeKey, store: store })
        .send();
      return YES; // return YES if you handled the query
    }
    return NO;
  },

  _didFetchSingleRecord: function (response, params) {
    var store = params.store;
    var store_key = params.key;
    var record_type = store.recordTypeFor(store_key);
    var id = store.idFor(store_key);
    //SC.Logger.debug("--->%@, %@".fmt(id, store_key));


    if (SC.$ok(response)) {
      //SC.Logger.debug('received');

      var content = response.get('encodedBody');
      var newRecord = SC.json.decode(content);
      //SC.Logger.debug(newRecord);
      store.dataSourceDidComplete(store_key, response.get('body'), id);


      // handle error case

    } else {
      store.dataSourceDidError(store_key, response.get('body'));
    }
  },

  createRecord: function (store, storeKey) {

    // TODO: Add handlers to submit new records to the data source.
    // call store.dataSourceDidComplete(storeKey) when done.
    //SC.Logger.debug('create record');

    return NO; // return YES if you handled the storeKey
  },

  updateRecord: function (store, storeKey) {

    // TODO: Add handlers to submit modified record to the data source
    // call store.dataSourceDidComplete(storeKey) when done.
    //SC.Logger.debug('update record');

    return NO; // return YES if you handled the storeKey
  },

  destroyRecord: function (store, storeKey) {
    //SC.Logger.debug('destroy record');

    // TODO: Add handlers to destroy records on the data source.
    // call store.dataSourceDidDestroy(storeKey) when done
    return NO; // return YES if you handled the storeKey
  }

});
