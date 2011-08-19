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

  /** @default searchInCurrentFileIdle */
  initialSubstate: 'searchInCurrentFileIdle',

  /**
    Binds to the root node of the search results tree (through its controller)
    @type Multivio.FileRecord
  */
  searchTreeController: null,
  searchTreeControllerBinding: 'Multivio.searchTreeController',

  /**
    Binds to the current file node (through its controller)
    @type Multivio.FileRecord
  */
  currentFileNode: null,
  currentFileNodeBinding: 'Multivio.currentFileNodeController',


  /** */
  enterState: function () {
    // reset search interface
    Multivio.searchTreeController.resetSearchInterface();
  },

  /**
    Update the highlighting of search results in the displayed content
    @private
  */
  updateHighlighting: function () {
    var currentIndex = this.getPath('currentFileNode.currentIndex');
    var currentUserQuery = this.getPath('searchTreeController.currentUserQuery');
    if (this.getPath('currentFileNode.isSearchable') && currentIndex > 0) {
      // take the search query that corresponds to searching in the current
      // page and pass it to the search results controller, so that the
      // corresponding results are propagated to the highlight view
      var query = SC.Query.local(
          Multivio.SearchResultRecord,
          "query={query} AND url={url} AND page={page}", 
          {
            query: currentUserQuery,
            url: this.getPath('currentFileNode.url'),
            page: this.getPath('currentFileNode.currentIndex')
          }
        );
      Multivio.setPath('currentSearchResultsController.content',
          Multivio.store.find(query));
    } else {
      Multivio.setPath('currentSearchResultsController.content', null);
    }
  },

  /** @private */
  _currentFileIndexDidChange : function () {
    Multivio.mainStatechart.sendEvent('updateHighlighting');
  }.observes('*currentFileNode.currentIndex'),

  /** */
  _currentFileNodeDidChange : function () {
    if (!Multivio.getPath('searchTreeController.searchInAllFiles')) {
      var currentUserQuery = this.getPath('searchTreeController.currentUserQuery');
      if (currentUserQuery && currentUserQuery !== "") {
        Multivio.mainStatechart.sendEvent('updateSearch', currentUserQuery);
      }
    }
  }.observes('*currentFileNode.url'),

  /** */
  _currentUserSearchQueyDidChange : function () {
    var currentUserQuery = this.getPath('searchTreeController.currentUserQuery');
    if (currentUserQuery && currentUserQuery !== "") {
      Multivio.mainStatechart.sendEvent('updateSearch', currentUserQuery);
    }
  }.observes('*searchTreeController.currentUserQuery'),
  
  /** */
  _searchInAllDidChange : function () {
    if (Multivio.getPath('searchTreeController.searchInAllFiles')) {
      Multivio.mainStatechart.sendEvent('searchInAllFiles');
    } else {
      Multivio.mainStatechart.sendEvent('searchInCurrentFile');
    }
  }.observes('*searchTreeController.searchInAllFiles'),

  

  /************** SubStates *************************/
  /**
    SUBSTATE DECLARATION

    @type SC.State
  */
  searchInCurrentFileIdle: SC.State.design({
    /**
      @type SC.RecordArray
    */
    currentSearchResults: null,
    currentFetchingFileNode: null,
    
    enterState: function (currentUserQuery) {
      if (currentUserQuery && currentUserQuery !== "") {
        Multivio.mainStatechart.sendEvent('updateSearch', currentUserQuery);
      }
    },
    
    /** */
    searchInAllFiles: function () {
      var currentUserQuery = Multivio.getPath('searchTreeController.currentUserQuery');
      this.gotoState('searchInAllIdle', currentUserQuery);
    },

    /**
      This function starts or resumes the search process. The events that may
      cause this to happen are:

      - the user started a new search, either using the search button or by
        hitting "enter" in the search query field
      - the user checked or unchecked the "Search in all files" box
      - the current file did change
      @private
    */
    updateSearch: function (currentUserQuery) {
      var currentFetchingFileNode = Multivio.getPath('currentFileNodeController.content');
      if (currentFetchingFileNode.get('isContent')) {
        //reset seachResult and counters
        this.set('currentFetchingFileNode', currentFetchingFileNode);
        Multivio.store.find(Multivio.FileRecord).setEach('numberOfSearchResults', 0);
        currentFetchingFileNode.set('searchResults', null);

        var storeQuery = SC.Query.local(Multivio.SearchRecord,
          "query={query} AND url={url}",
          { 
            query: currentUserQuery,
            url: Multivio.getPath('currentFileNodeController.url')
          }
          );

        SC.Logger.debug('Searching in current file...');
        this.set('currentSearchResults', Multivio.store.find(storeQuery));
        Multivio.setPath('searchTreeController.msgStatus', "Searching in current file...");
      }
    },
    
    /** */
    _currentSearchResultsDidChange: function () {
      if (this.getPath('currentSearchResults.status') & SC.Record.READY) {
        Multivio.mainStatechart.sendEvent('updateHighlighting');
        this._concludeSearchProcess('Done', Multivio.LOADING_DONE);
      }
    }.observes('*currentSearchResults.status'),

    _concludeSearchProcess: function (statusMessage, statusCode) {
      var currentSearchResults = this.get('currentSearchResults');
      var currentFetchingFileNode = this.get('currentFetchingFileNode');

      var searchResults = currentSearchResults.getPath('firstObject.searchTreeItemChildren');
      currentFetchingFileNode.updateParentSearchResults(searchResults.get('length'));
      searchResults.setEach('_parentNode', currentFetchingFileNode);
      searchResults.setEach('_ancestorFileNode', currentFetchingFileNode);
      currentFetchingFileNode.set('searchResults', searchResults);

      Multivio.setPath('searchTreeController.content.searchTreeItemChildren',
        [Multivio.getPath('rootNodeController.content')]);

      Multivio.setPath('searchTreeController.msgStatus', statusMessage);
      Multivio.setPath('searchTreeController.loadingStatus', statusCode);
      this.set('currentSearchResults', null);
    }

  }),

  
  /**
    SUBSTATE DECLARATION

    @type SC.State
  */
  searchInAllIdle: SC.State.design({

    enterState: function (currentUserQuery) {
      if (currentUserQuery && currentUserQuery !== "") {
        this.updateSearch(currentUserQuery);
      }
    },

    searchInCurrentFile: function () {
      var currentUserQuery = Multivio.getPath('searchTreeController.currentUserQuery');
      this.gotoState('searchInCurrentFileIdle', currentUserQuery);
    },
    
    /**
      STATE EVENT
      @private
    */
    updateSearch: function (currentUserQuery) {
      Multivio.store.find(Multivio.FileRecord).setEach('numberOfSearchResults', 0);
      Multivio.store.find(Multivio.FileRecord).setEach('searchResults', null);
      SC.Logger.debug('Searching in all files...');
      Multivio.setPath('searchTreeController.msgStatus', "Searching in all files...");
      Multivio.setPath('searchTreeController.loadingStatus', Multivio.LOADING_LOADING);
      //var queryStore = SC.Query.local(Multivio.SearchRecord, "query={query}", { 
      //  query: currentUserQuery
      //});
      Multivio.setPath('searchTreeController.content.searchTreeItemChildren',
        [Multivio.getPath('rootNodeController.content')]);
      this.gotoState('gettingNextSearchResult', Multivio.getPath('rootNodeController.hasNextFile'));
    }
  }),


  /**
    SUBSTATE DECLARATION
    
    Is active while the application is getting the search results for the next
    searchable file. This is used only when searching in all files.
    
    @type SC.State
  */
  gettingNextSearchResult: SC.State.design({
    /** @lends Multivio.SearchOperationalState.prototype */
    /**
      @type Multivio.FileRecord
    */
    currentSearchResults: null,
    
    /**
      @type SC.RecordArray
    */
    currentFetchingFileNode: null,
    
    /** */
    enterState: function (fromNode) {
      var currentNode;
      var fileNode;
      if (fromNode.get('isFetchable')) {
        currentNode = fromNode;
        fileNode = Multivio.store.find(Multivio.FileRecord, fromNode.get('url'));
        //already fetched?
        if (!fileNode.get('_children')) {
          fileNode.set('_ancestorFileNode', currentNode.get('_ancestorFileNode'));
          currentNode.appendChildren([fileNode]);
        }
      } else {
        currentNode = fromNode.get('nearestFileNode');
        fileNode = Multivio.store.find(Multivio.FileRecord, currentNode.get('url'));
      }
      this.set('currentFetchingFileNode', fileNode);
    },


    /**
      STATE EVENT
    */ 
    cancelSearch: function () {
      this._concludeSearchProcess("Aborted", Multivio.LOADING_CANCEL);
    },

    /**
      Continue search with the next file, if present, otherwise set search
      process as done
      @private
    */ 
    _proceedSearchWithNextFile: function () {
      var next = this.getPath('currentFetchingFileNode.hasNextFile');
      if (next) {
        // STATE TRANSITION
        this.gotoState('gettingNextSearchResult', next);
      } else {
        this._concludeSearchProcess("Done", Multivio.LOADING_DONE);
        //this.gotoState('searchInAllIdle');
      }
    },
    
    //callback for tree structure walking
    _currentSearchResultsDidChange: function () {
      if (this.getPath('currentSearchResults.status') & SC.Record.READY) {
        Multivio.mainStatechart.sendEvent('updateHighlighting');
        this._concludeCurrentSearchProcess();
        this._proceedSearchWithNextFile();
      }
    }.observes('*currentSearchResults.status'),

    /**
      STATE EVENT
    */ 
    _currentFetchingFileNodeDidChange: function () {
      var fileNode = this.get('currentFetchingFileNode');
      if (fileNode && fileNode.get('mime')) {
        if (fileNode.get('isSearchable')) {
          Multivio.setPath('searchTreeController.msgStatus',
            "Searching in: %@".fmt(this.getPath('currentFetchingFileNode.url')));
          var query = SC.Query.local(Multivio.SearchRecord, "query={query} AND url={url}", {
            query: Multivio.getPath('searchTreeController.currentUserQuery'),
            url: this.getPath('currentFetchingFileNode.url')
          });
          this.set('currentSearchResults', Multivio.store.find(query));
        } else {
          this._proceedSearchWithNextFile();
        }
      }
    }.observes('*currentFetchingFileNode.mime'),

    
    /**
      @param String statusMessage
      @param String statusCode See Multivio.currentSearchResultsController for
      the list of admitted codes
      @private
    */
    _concludeCurrentSearchProcess: function () {
      var currentSearchResults = this.get('currentSearchResults');
      var currentFetchingFileNode = this.get('currentFetchingFileNode');

      var searchResults = currentSearchResults.getPath('firstObject.searchTreeItemChildren');
      currentFetchingFileNode.updateParentSearchResults(searchResults.get('length'));
      searchResults.setEach('_parentNode', currentFetchingFileNode);
      searchResults.setEach('_ancestorFileNode', currentFetchingFileNode);
      currentFetchingFileNode.set('searchResults', searchResults);
      Multivio.searchTreeController.update();
    },

    _concludeSearchProcess: function (statusMessage, statusCode) {
      Multivio.setPath('searchTreeController.msgStatus', statusMessage);
      Multivio.setPath('searchTreeController.loadingStatus', statusCode);
      this.set('currentFetchingFileNode', null);
      this.set('currentSearchResults', null);
      // STATE TRANSITION
      this.gotoState('searchInAllIdle');
    }
  })
});
