/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/
/*globals Multivio */


/**
@class

  One of the application states: becomes active when the application is ready
  for user interaction

  @author maj
  @extends SC.State
  @since 1.0
*/
Multivio.SearchReadyState = SC.State.extend({

  initialSubstate: 'dummy',
  searchController: null,
  searchControllerBinding: 'Multivio.searchTreeController',

  currentFileNode: null,
  currentFileNodeBinding: 'Multivio.currentFileNodeController',

  currentSearchResults: null,

  currentSearchingFile: null,

  /************** Methods *************************/
  selectionsUpdate : function() {
    this.updateEnlightening();
  }.observes('*currentFileNode.currentIndex'),

  updateEnlightening: function() {
     var currentIndex = this.getPath('currentFileNode.currentIndex');
     var current = this.getPath('searchController.currentQuery');
     if(this.getPath('currentFileNode.isSearchable') && currentIndex > 0) {
        var query =  SC.Query.local(Multivio.SearchResultRecord, "query={query} AND url={url} AND page={page}", { 
          query: current,
          url: this.getPath('currentFileNode.url'),
          page: this.getPath('currentFileNode.currentIndex')
        });
        Multivio.currentSearchResultsController.set('content', Multivio.store.find(query));
     }else{
        Multivio.currentSearchResultsController.set('content', null);
     }
  },
  
  /*****************************************************************************/ 
  currentQueryStore: function() {
    var current = this.getPath('searchController.currentQuery');
    if(current && current !== "") {
      var searchInAll = this.getPath('searchController.searchInAll');
      if(!searchInAll && this.getPath('currentFileNode.isContent')){
        return  SC.Query.local(Multivio.SearchRecord, "query={query} AND url={url}", { 
          query: current,
          url: this.getPath('currentFileNode.url')
        });
      }else{
        return SC.Query.local(Multivio.SearchRecord, "query={query}", { 
          query: current
        });
      } 
    }
    return null;

  }.property('*searchController.currentQuery', '*searchController.searchInAll', '*currentFileNode.url'),

  /*****************************************************************************/ 
  _currentQueryStoreDidChange: function() {
    var query = this.get('currentQueryStore');
    if(query) {
      this.getPath('searchController.content').set('treeItemChildren', Multivio.store.find(query));
      var searchInAll = this.getPath('searchController.searchInAll');
      if(searchInAll) {
        this.get('searchController').set("msgStatus", "Searching in all...");
        this.get('searchController').set("loadingStatus", Multivio.LOADING_LOADING);
        this.set('currentSearchingFile', Multivio.rootNodeController.get('content'));
      }
    }
    this.updateEnlightening();
  }.observes('*searchController.currentQuery', '*searchController.searchInAll', '*currentFileNode.url'),

  /*****************************************************************************/ 
  cancelSearch: function() {
    this.get('searchController').set("msgStatus", "Aborted...");
    this.get('searchController').set("loadingStatus", Multivio.LOADING_CANCEL);
    this.set('currentSearchingFile', null);
    this.set('currentSearchResults', null);
  },

  /*****************************************************************************/ 
  _currentFileNodeDidChange: function() {
    var currentFileNode = this.get('currentFileNode');
    var currentQuery = this.get('searchController.currentQuery');
    if(currentFileNode && currentFileNode.get('isSearchable') && currentQuery){
      var query = SC.Query.local(Multivio.SearchRecord, "query={query} AND url={url}", { 
        query: this.getPath('searchController.currentQuery'),
        url: this.getPath('currentSearchingFile.url')
      });
      Multivio.searchResultsController.set('content', Multivio.store.find(query));
    }
  }.observes('*currentFileNode.url'),

  /*****************************************************************************/ 
  _documentTypeDidChange: function() {
    var record = this.get('currentSearchingFile');
    if(record && record.get('mime')){
      if(record.get('isSearchable')) {
        this.get('searchController').set("msgStatus", "Searching in: %@".fmt(this.getPath('currentSearchingFile.url')));

        var query = SC.Query.local(Multivio.SearchRecord, "query={query} AND url={url}", { 
          query: this.getPath('searchController.currentQuery'),
          url: this.getPath('currentSearchingFile.url')
        });
        this.set('currentSearchResults', Multivio.store.find(query));
      }else{
        this._next();
      }
    }
  }.observes('*currentSearchingFile.mime'),

  /*****************************************************************************/ 
  _next: function() {
    var next = this.getPath('currentSearchingFile.hasNextFile');
    if(next) {
      this.gotoState('getNextSearchingResult', this.get('currentSearchingFile'));
    }
    else{
      Multivio.searchTreeController.set("msgStatus", "Done");
      this.get('searchController').set("loadingStatus", Multivio.LOADING_DONE);
      this.set('currentSearchingFile', null);
      this.set('currentSearchResults', null);
      this.updateEnlightening();
    }
  },

  /*****************************************************************************/ 
  statusString: function(status) {
    var ret = [];
    for(var prop in SC.Record) {
      if(prop.match(/[A-Z_]$/) && SC.Record[prop]===status) {
        ret.push(prop);
      }
    }
    return ret.join(" ");
  },

  /*****************************************************************************/ 
  _currentSearchingResultsDidChange: function() {
    if(this.getPath('currentSearchResults.status') & SC.Record.READY){
      this._next();
    }
  }.observes('*currentSearchResults.status'),

  /************** SubStates *************************/
  /*****************************************************************************/ 
  dummy: SC.State,

  /*****************************************************************************/ 
  getNextSearchingResult: SC.State.design({
    enterState: function(fromNode) {
      var node;
      if(fromNode.get('canBeFetched')) {
        node = fromNode;
      }else{
        if(fromNode.get('isFileNode')){
          var next = fromNode.get('fileNode').get('hasNextFile');
          node = next;
        }else{
          node = fromNode.get('fileNode');
        }
      }
      var record = Multivio.store.find(Multivio.FileRecord, node.get('url'));
      if(!record.get('_ancestorFileNode')){
        record.set('_ancestorFileNode', node.get('_ancestorFileNode'));
        node.appendChildren([record]);
      }
      this.get('parentState').set('currentSearchingFile', record);
    }
  })
});
