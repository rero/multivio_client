/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/


/** @class
  
  STATE DEFINITION

  Is active when the search functionality is ready for use after application
  setup

  @author maj
  @extends SC.State
  @since 1.1
*/
Multivio.SearchOperationalState = SC.State.extend({
  /** @scope Multivio.SearchOperationalState.prototype */

  /** @default searchIdle */
  initialSubstate: 'searchIdle',

  /**
    Binds to the root node of the search results tree (through its controller)
    @type Multivio.FileRecord
  */
  searchController: null,
  searchControllerBinding: 'Multivio.searchTreeController',

  /**
    Binds to the current file node (through its controller)
    @type Multivio.FileRecord
  */
  currentFileNode: null,
  currentFileNodeBinding: 'Multivio.currentFileNodeController',

  /**
    @type SC.RecordArray
  */
  currentSearchResults: null,

  /**
    @type Multivio.FileRecord
  */
  currentSearchedFile: null,

  /** */
  enterState: function () {
    // reset search interface
    Multivio.searchTreeController.resetSearchInterface();
  },

  /**
    STATE EVENT
  */ 
  _fileTypeDidChange: function () {
    var record = this.get('currentSearchedFile');
    if (record && record.get('mime')) {
      if (record.get('isSearchable')) {
        this.get('searchController').set("msgStatus",
          "Searching in: %@".fmt(this.getPath('currentSearchedFile.url')));
        var query = SC.Query.local(Multivio.SearchRecord, "query={query} AND url={url}", {
          query: this.getPath('searchController.currentUserQuery'),
          url: this.getPath('currentSearchedFile.url')
        });
        this.set('currentSearchResults', Multivio.store.find(query));
      } else {
        this._proceedSearchWithNextFile();
      }
    }
  }.observes('*currentSearchedFile.mime'),

  /**
    This function starts or resumes the search process. The events that may
    cause this to happen are:

    - the user started a new search, either using the search button or by
      hitting "enter" in the search query field
    - the user checked or unchecked the "Search in all files" box
    - the current file did change
    @private
  */
  _resumeSearch: function () {
    var storeQuery = this.get('_storeQueryForCurrentContext');
    if (storeQuery) {
      this.getPath('searchController.content').set('treeItemChildren',
          Multivio.store.find(storeQuery));
      var searchInAllFiles = this.getPath('searchController.searchInAllFiles');
      if (searchInAllFiles) {
        SC.Logger.debug('Searching in all files...');
        this.get('searchController').set("msgStatus", "Searching in all files...");
        this.get('searchController').set("loadingStatus", Multivio.LOADING_LOADING);
        this.set('currentSearchedFile', Multivio.rootNodeController.get('content'));
      }
      else {
        SC.Logger.debug('Searching in current file...');
        this.get('searchController').set("msgStatus", "Searching in current file...");
      }
    }
    this._updateHighlighting();
  }.observes(
      '*searchController.currentUserQuery',
      '*searchController.searchInAllFiles',
      '*currentFileNode.url'),

  /**
    STATE EVENT
  */ 
  cancelSearch: function () {
    this._concludeSearchProcess("Aborted", Multivio.LOADING_CANCEL);
  },

  /**
    STATE EVENT

    @private
  */
  _currentSearchResultsDidChange: function () {
    if (this.getPath('currentSearchResults.status') & SC.Record.READY) {
      this._proceedSearchWithNextFile();
    }
  }.observes('*currentSearchResults.status'),


  /** @private */
  _currentFileIndexDidChange : function () {
    this._updateHighlighting();
  }.observes('*currentFileNode.currentIndex'),

  /**
    Update the highlighting of search results in the displayed content
    @private
  */
  _updateHighlighting: function () {
    var currentIndex = this.getPath('currentFileNode.currentIndex');
    var currentUserQuery = this.getPath('searchController.currentUserQuery');
    if (this.getPath('currentFileNode.isSearchable') && currentIndex > 0) {
      // take the search query that corresponds to searching in the current
      // page and pass it to the search results controller, so that the
      // corresponding results are propagated to the highlight view
      var query = SC.Query.local(
          Multivio.SearchResultRecord,
          "query={query} AND url={url} AND page={page}", {
          query: currentUserQuery,
          url: this.getPath('currentFileNode.url'),
          page: this.getPath('currentFileNode.currentIndex')
        });
      Multivio.currentSearchResultsController.set('content',
          Multivio.store.find(query));
    } else {
      Multivio.currentSearchResultsController.set('content', null);
    }
  },
  
  /**
    @field
    Returns the store query that corresponds to the current context, taking
    into account the current user query and the 'search in all files' selection

    @type SC.Query
    @private
  */
  _storeQueryForCurrentContext: function () {
    var currentUserQuery = this.getPath('searchController.currentUserQuery');
    if (currentUserQuery && currentUserQuery !== "") {
      var searchInAllFiles = this.getPath('searchController.searchInAllFiles');
      if (!searchInAllFiles && this.getPath('currentFileNode.isContent')) {
        return SC.Query.local(Multivio.SearchRecord,
          "query={query} AND url={url}", { 
          query: currentUserQuery,
          url: this.getPath('currentFileNode.url')
        });
      } else {
        return SC.Query.local(Multivio.SearchRecord, "query={query}", { 
          query: currentUserQuery
        });
      } 
    }
    return null;
  }.property(
      '*searchController.currentUserQuery',
      '*searchController.searchInAllFiles',
      '*currentFileNode.url'),

  /**
  */ 
  _currentFileNodeDidChange: function () {
    var currentFileNode = this.get('currentFileNode');
    var currentUserQuery = this.get('searchController.currentUserQuery');
    if (currentFileNode && currentFileNode.get('isSearchable') && currentUserQuery) {
      var query = SC.Query.local(Multivio.SearchRecord, "query={query} AND url={url}", { 
        query: this.getPath('searchController.currentUserQuery'),
        url: this.getPath('currentSearchedFile.url')
      });
      //query:set('orderBy', 'guid');
      Multivio.searchResultsController.set('content', Multivio.store.find(query));
    }
  }.observes('*currentFileNode.url'),

  /**
    Continue search with the next file, if present, otherwise set search
    process as done
    @private
  */ 
  _proceedSearchWithNextFile: function () {
    var next = this.getPath('currentSearchedFile.hasNextFile');
    if (next) {
      // STATE TRANSITION
      this.gotoState('gettingNextSearchResult', this.get('currentSearchedFile'));
    } else {
      this._updateHighlighting();
      this._concludeSearchProcess("Done", Multivio.LOADING_DONE);
    }
  },

  /**
    @param String statusMessage
    @param String statusCode See Multivio.currentSearchResultsController for
    the list of admitted codes
    @private
  */
  _concludeSearchProcess: function (statusMessage, statusCode) {
    this.get('searchController').set("msgStatus", statusMessage);
    SC.Logger.debug(statusMessage);
    this.get('searchController').set("loadingStatus", statusCode);
    this.set('currentSearchedFile', null);
    this.set('currentSearchResults', null);
    // STATE TRANSITION
    this.gotoState('searchIdle');
  },

  /**
    @param String status
    @returns String
  */
  /* 
  statusString: function (status) {
    var ret = [], prop;
    for (prop in SC.Record) {
      if (prop.match(/[A-Z_]$/) && SC.Record[prop] === status) {
        ret.push(prop);
      }
    }
    return ret.join(" ");
  },
  */


  /************** SubStates *************************/
  
  /**
    SUBSTATE DECLARATION

    @type SC.State
  */
  searchIdle: SC.State,

  /**
    SUBSTATE DECLARATION
    
    Is active while the application is getting the search results for the next
    searchable file. This is used only when searching in all files.
    
    @type SC.State
  */
  gettingNextSearchResult: SC.State.design({
    /** @lends Multivio.SearchOperationalState.prototype */
    
    /** */
    enterState: function (fromNode) {
      var node;
      if (fromNode.get('isFetchable')) {
        node = fromNode;
      } else {
        if (fromNode.get('isFile')) {
          var next = fromNode.get('nearestFileNode').get('hasNextFile');
          node = next;
        } else {
          node = fromNode.get('nearestFileNode');
        }
      }
      var record = Multivio.store.find(Multivio.FileRecord, node.get('url'));
      if (!record.get('_ancestorFileNode')) {
        record.set('_ancestorFileNode', node.get('_ancestorFileNode'));
        node.appendChildren([record]);
      }
      this.get('parentState').set('currentSearchedFile', record);
    }
  })
});
