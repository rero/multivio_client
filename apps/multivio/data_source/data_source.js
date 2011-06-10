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
Multivio.DataSource = SC.DataSource.extend(
/** @scope MyApp.DataSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 
  idx: 1,
  fetch: function(store, query) {

    SC.Logger.debug(query);
    // TODO: Add handlers to fetch data for specific queries.  
    // call store.dataSourceDidFetchQuery(query) when done.
    var record_type = query.get('recordType');
    var parameters = query.get('parameters');
    if(SC.kindOf(record_type, Multivio.FileRecord) && parameters && parameters.url){
      SC.Request.getUrl('/server/get?url=%@'.fmt(parameters.url))
      .set('isJSON', YES)
      .notify(this, this._didFetchFileRecord, { query: query, store: store })
      .send();

      return YES; // return YES if you handled the query
    }
    if(SC.kindOf(record_type, Multivio.ServerRecord)){
      SC.Request.getUrl('/server/version')
      .set('isJSON', YES)
      .notify(this, this._didFetchServerRecord, { query: query, store: store })
      .send();
      return YES; // return YES if you handled the query
    }
    return NO;
  },
  
  _didFetchServerRecord: function(response, params) {
    var store = params.store;
    var query = params.query; 

    if (SC.$ok(response)) {
      SC.Logger.debug('received');
      store.loadRecords(Multivio.ServerRecord, [response.get('body')], ["server"]);
      store.dataSourceDidFetchQuery(query);
    // handle error case
    } else {
      store.dataSourceDidErrorQuery(query, response);
    }
  },
  
  _didFetchFileRecord: function(response, params) {

    var store = params.store;

    var query = params.query; 

    if (SC.$ok(response)) {
      SC.Logger.debug('received');

      // load the contacts into the store...
      //var content = response.get('encodedBody');
      //var _response = SC.json.decode(content);
      //SC.Logger.debug('Added record for: %@'.fmt(query.getPath('parameters.url')));
      //_response.url = query.getPath('parameters.url');
      var idx = this.get('idx');
      var rec_keys = store.loadRecords(Multivio.FileRecord, [response.get('body')], ["%@".fmt(idx)]);
      this.set('idx', idx + 1);
      var parameters = query.get('parameters');
      var parent = parameters.parent;
      if(parent) {
        this.set('parent', parent);
        this.set('_ancestorFileNode', parent.get('_ancestorFileNode'));
      }

      // notify store that we handled the fetch

      //store.loadQueryResults(query, rec_keys);
      store.dataSourceDidFetchQuery(query);
 

    // handle error case

    } else {
      store.dataSourceDidErrorQuery(query, response);
    }
  },

  // ..........................................................
  // RECORD SUPPORT
  // 
  
  retrieveRecord: function(store, storeKey) {
    
    // TODO: Add handlers to retrieve an individual record's contents
    // call store.dataSourceDidComplete(storeKey) when done.
    return NO; // return YES if you handled the storeKey
  },
  
  createRecord: function(store, storeKey) {
    
    // TODO: Add handlers to submit new records to the data source.
    // call store.dataSourceDidComplete(storeKey) when done.
    
    return NO ; // return YES if you handled the storeKey
  },
  
  updateRecord: function(store, storeKey) {
    
    // TODO: Add handlers to submit modified record to the data source
    // call store.dataSourceDidComplete(storeKey) when done.

    return NO ; // return YES if you handled the storeKey
  },
  
  destroyRecord: function(store, storeKey) {
    
    // TODO: Add handlers to destroy records on the data source.
    // call store.dataSourceDidDestroy(storeKey) when done
    
    return NO ; // return YES if you handled the storeKey
  }
  
}) ;
