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
    STATE EVENT (internal)

    Update the highlighting of search results in the displayed content
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

  /**
    If the file index (e.g. the page) changes, update the result highlighting
    according to the current search query
    @private
  */
  _currentFileIndexDidChange : function () {
    // STATECHART EVENT TRIGGER
    Multivio.mainStatechart.sendEvent('updateHighlighting');
  }.observes('*currentFileNode.currentIndex'),

  /** @private */
  _currentFileNodeDidChange : function () {
    // if the "searching in all files" mode is active, and a user search query
    // exists, launch the search process immediately upon file node transition
    if (!Multivio.getPath('searchTreeController.searchInAllFiles')) {
      var currentUserQuery = this.getPath('searchTreeController.currentUserQuery');
      if (currentUserQuery && currentUserQuery !== "") {
        // STATECHART EVENT TRIGGER
        Multivio.mainStatechart.sendEvent('updateSearch', currentUserQuery);
      }
    }
  }.observes('*currentFileNode.url'),

  /** @private */
  _currentUserSearchQueyDidChange : function () {
    var currentUserQuery = this.getPath('searchTreeController.currentUserQuery');
    if (currentUserQuery && currentUserQuery !== "") {
      // STATECHART EVENT TRIGGER
      Multivio.mainStatechart.sendEvent('updateSearch', currentUserQuery);
    }
  }.observes('*searchTreeController.currentUserQuery'),
  
  /** @private */
  _searchInAllFilesDidChange : function () {
    if (Multivio.getPath('searchTreeController.searchInAllFiles')) {
      // STATECHART EVENT TRIGGER
      Multivio.mainStatechart.sendEvent('searchInAllFiles');
    } else {
      // STATECHART EVENT TRIGGER
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

    /**
      @param String currentUserQuery if provided, the search process is
      automatically launched upon entering this state
    */
    enterState: function (currentUserQuery) {
      if (currentUserQuery && currentUserQuery !== "") {
        // STATECHART EVENT TRIGGER
        Multivio.mainStatechart.sendEvent('updateSearch', currentUserQuery);
      }
    },
    
    /**
      STATE EVENT

      Changes the search mode
    */
    searchInAllFiles: function () {
      var currentUserQuery = Multivio.getPath('searchTreeController.currentUserQuery');
      // STATE TRANSITION
      this.gotoState('searchInAllFilesIdle', currentUserQuery);
    },

    /**
      STATE EVENT (internal)
    
      This function starts or resumes the search process in the current file.
      It usually results from one of the following events:

      - the user started a new search, either using the search button or by
        hitting "enter" in the search query field
      - the user unchecked the "Search in all files" box
      - the currently displayed file did change
    */
    updateSearch: function (currentUserQuery) {
      var currentFetchingFileNode = Multivio.getPath('currentFileNodeController.content');
      // search only if the current file is searchable
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
    
    /** @private */
    _currentSearchResultsDidChange: function () {
      if (this.getPath('currentSearchResults.status') & SC.Record.READY) {
        Multivio.mainStatechart.sendEvent('updateHighlighting');
        this._concludeSearchProcess('Done', Multivio.LOADING_DONE);
      }
    }.observes('*currentSearchResults.status'),

    /**
      @param String statusMessage
      @param String statusCode See Multivio.currentSearchResultsController for
      the list of admitted codes
      @private
    */
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
  searchInAllFilesIdle: SC.State.design({

    /**
      @param String currentUserQuery if provided, the search process is
      automatically launched upon entering this state
    */
    enterState: function (currentUserQuery) {
      if (currentUserQuery && currentUserQuery !== "") {
        this.updateSearch(currentUserQuery);
      }
    },

    /**
      STATE EVENT
      
      Changes the search mode
    */
    searchInCurrentFile: function () {
      var currentUserQuery = Multivio.getPath('searchTreeController.currentUserQuery');
      // STATE TRANSITION
      this.gotoState('searchInCurrentFileIdle', currentUserQuery);
    },
    
    /**
      STATE EVENT (internal)

      This function starts or resumes the search process in the all the files
      of the current document. Each time it is called, it starts the search
      process from the document root node and traverses the whole tree,
      getting search results for each content node and storing them in the
      store.
      
      If a search operation has already been executed earlier for the current
      document, the search results, or a part of them, if the process was
      interrupted by the user, are already cached in the store. In that case,
      the outcome of the process will be the addition of the possible missing
      results to the store.

      Besides, the following events may also cause a search update:

      - the user started a new search, either using the search button or by
        hitting "enter" in the search query field
      - the user checked the "Search in all files" box
      - the currently displayed file did change

      @param String currentUserQuery
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
      // launch the search process from the root node of the document tree
      // STATE TRANSITION
      this.gotoState('gettingSearchResultsForFile',
          Multivio.getPath('rootNodeController.nextFile'));
    }
  }),


  /**
    SUBSTATE DECLARATION (transient)
    
    Is active while the application is getting the search results for a
    searchable file. This is used only when searching in all files.
    
    During the search process, this state is visited iteratively, once per
    file node in the document tree. The state transitions to itself, once per
    file node, until they have all been visited.
    
    @type SC.State
  */
  gettingSearchResultsForFile: SC.State.design({
    /** @lends Multivio.SearchOperationalState.prototype */
    /**
      @type Multivio.FileRecord
    */
    currentSearchResults: null,
    
    /**
      @type SC.RecordArray
    */
    currentFetchingFileNode: null,
    
    /**
      @param FileRecord fromNode the node from which to start the search. The
      node itself is not searched.
    */
    enterState: function (fromNode) {
      var currentNode;
      var fileNode;
      if (fromNode.get('isFetchable')) {
        currentNode = fromNode;
        fileNode = Multivio.store.find(Multivio.FileRecord, fromNode.get('url'));
        //already fetched?
        if (!fileNode.get('fetchableChild')) {
          fileNode.set('_ancestorFileNode', currentNode.get('_ancestorFileNode'));
          currentNode.appendFetchableChild(fileNode);
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
      STATE EVENT (transient)

      Continue search with the next file, if present, otherwise set search
      process as done
      @private
    */
    _proceedSearchWithNextFile: function () {
      var next = this.getPath('currentFetchingFileNode.nextFile');
      if (next) {
        // STATE TRANSITION
        this.gotoState('gettingSearchResultsForFile', next);
      } else {
        // STATE TRANSITION (will be executed inside the called function)
        this._concludeSearchProcess("Done", Multivio.LOADING_DONE);
      }
    },
    
    /**
      Callback for tree structure walking. Observes the arrival of the search
      results for the current searched file and jumps to the next.
      @private
    */
    _currentSearchResultsDidChange: function () {
      if (this.getPath('currentSearchResults.status') & SC.Record.READY) {
        Multivio.mainStatechart.sendEvent('updateHighlighting');

        var currentSearchResults = this.get('currentSearchResults');
        var currentFetchingFileNode = this.get('currentFetchingFileNode');
        var searchResults =
            currentSearchResults.getPath('firstObject.searchTreeItemChildren');
        currentFetchingFileNode.updateParentSearchResults(searchResults.get('length'));
        searchResults.setEach('_parentNode', currentFetchingFileNode);
        searchResults.setEach('_ancestorFileNode', currentFetchingFileNode);
        currentFetchingFileNode.set('searchResults', searchResults);
        Multivio.searchTreeController.update();

        this._proceedSearchWithNextFile();
      }
    }.observes('*currentSearchResults.status'),

    /**
      STATE EVENT (transient)
      
      While traversing the tree for multi-file searching, if the current
      searched file has a different MIME type than the previous, check if it's
      searchable and launch the search, otherwise proceed to the next file
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
    _concludeSearchProcess: function (statusMessage, statusCode) {
      Multivio.setPath('searchTreeController.msgStatus', statusMessage);
      Multivio.setPath('searchTreeController.loadingStatus', statusCode);
      this.set('currentFetchingFileNode', null);
      this.set('currentSearchResults', null);
      // STATE TRANSITION
      this.gotoState('searchInAllFilesIdle');
    }
  })
});
