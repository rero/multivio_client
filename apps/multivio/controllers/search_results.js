// ==========================================================================
// Project:   Multivio.searchController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
sc_require('models/search.js');
sc_require('controllers/files.js');

Multivio.filesSearchController = Multivio.FilesController.create({fileLoadedEvent: 'searchFileLoaded'});

/*********************************************************************************/
/*********************************************************************************/
Multivio.searchResultsController = SC.ArrayController.create({
  allowsMultipleSelection: NO,

  loadingStatus: Multivio.LOADING_DONE,
  content: Multivio.SearchData,
  currentQuery: null,
  currentIndex: null,
 
  //for asynchronous data
  _fetchingUrl: null,
  _fetchingQuery: null,
  searchToAll: null,

  fetchFile: function(url, query) {
    if(this.get('_fetchingUrl')) {
      throw	new Error('searchResultsController: concurrent file fetch (%@ and %@)'.fmt(this.get('_fetchingUrl'), url));
    }
    var alreadyLoaded = this.find(url, query);
    if(alreadyLoaded) {
      //this.set('currentFile', url);
      SC.Logger.debug('Selecting: ' + alreadyLoaded.url);
      this.selectObject(alreadyLoaded);
      Multivio.mainStatechart.sendEvent('searchResultsLoaded', alreadyLoaded);
    }else{
      this.set('_internalLoadingStatus', Multivio.LOADING_LOADING);
      this.set('_fetchingUrl', url);
      this.set('_fetchingQuery', query);
      Multivio.SearchData.getSearchResult(query, url);
    }
  },

  isLoading: function() {
    if(this.get('loadingStatus') === Multivio.LOADING_LOADING) {
      return YES;
    }
    return NO;
  }.property('loadingStatus'),

  find: function(url, query) {
    var results = this.filterProperty('query', query);
    if(!SC.none(results)) {
      results = results.findProperty('url', url);
    }
    return results;
  },

  _contentDidChange: function(){
    SC.Logger.debug('Search results received!!!!!');
    var url = this.get('_fetchingUrl');
    var query = this.get('_fetchingQuery');
    var fetchedObject = this.find(this.get('_fetchingUrl'), query);
    if(!SC.none(fetchedObject)){
      //accept new fetch request
        this.set('_fetchingUrl', undefined);
        this.set('_fetchingQuery', undefined);
        this.selectObject(fetchedObject);
        Multivio.mainStatechart.sendEvent('searchResultsLoaded', fetchedObject);
    }
  }.observes('[]')
});


/*********************************************************************************/
/*********************************************************************************/
Multivio.searchItem = SC.Object.extend(SC.TreeItemContent, {

  treeItemIsExpanded: YES,

  treeItemChildren: function() {

    var children = this.get('results');
    if(SC.none(children)) {
      return null;
    }

    var expanded = NO;
    return children.map(function(item, index) {
      if(index === 0) {
          expanded = YES;
      }else {
          expanded = NO;
      }
        return Multivio.searchItem.create({parentNode: this, treeItemIsExpanded:expanded}, item);          
    }, this);

  }.property('results'),

  label: function() {
    var url = this.get('url');
    if(SC.none(url)) {
      return "%@".fmt(this.get('preview'));
    }
    var nResults = this.get('results').length;
    if(this.get('maxReached') !== 0) {
      nResults = "%@ %@".fmt(nResults, "+");
    }
    var file = Multivio.filesController.findProperty('url', url);
    if(SC.none(file)) {
      return "<strong>%@</strong> (%@)".fmt(this.get('url'), nResults);
    }
    return "<strong>%@</strong> (%@)".fmt(file.get('label'), nResults);
  }.property('url')
}) ;


/*********************************************************************************/
/*********************************************************************************/
Multivio.searchTreeController = SC.TreeController.create(
/** @scope Multivio.searchController.prototype */ {

  // TODO: Add your own code here.
  defaultQueryMessage: 'Enter a new query here.',
  currentQuery: null,
  content: null,
  msgStatus: '',

  //current search results
  currentSearch: null,
  currentSearchBinding: 'Multivio.searchResultsController.selection',

  //current page index
  currentPage: null,
  currentPageBinding: 'Multivio.filesController.currentIndex',

  //current serach index in results
  currentSearchIndex: null,
  currentSearchIndexBinding: 'Multivio.searchResultsController.currentIndex',

  loadingStatus: null,
  loadingStatusBinding: 'Multivio.searchResultsController.loadingStatus',

  init: function() {
    sc_super();
    var content = Multivio.searchItem.create({url: null, query: null, results: []});
    this.set('content', content);
    //set root item
  },
  
  isEditable: function(){
    var status = this.get('loadingStatus');
    if (status === Multivio.LOADING_LOADING) {
      return NO;
    }
    return YES;
  }.property('loadingStatus'),

  _currentQueryDidChanged: function() {
    var query = this.get('currentQuery');
    if(!SC.none(query) && query !== '') {
    SC.Logger.debug("New query: " + query);
      
      //reset the content
      this.clear();

      Multivio.searchResultsController.set('currentQuery', query);
      //search in all content files
      if(Multivio.getPath('searchResultsController.searchToAll')){
        SC.Logger.debug('searchToAll');
        Multivio.mainStatechart.sendEvent('findAll', query);
      } else {
        Multivio.mainStatechart.sendEvent('findInCurrent', query);
      }
    }
  }.observes('currentQuery'),
    
  clear: function() {
    //var content = Multivio.searchItem.create();
    var content = this.get('content');
    content.url = null;
    content.query = null;
    content.results = [];
    //content.results = [];
    //if(!SC.none(content.results)){
    //  content.results.removeAt(0, content.results.get('length'));
    //}else{
    //  content.set('results', []);
    //}
    this.set('content', content);
    //this.propertyDidChange('content') ;
  },

  _selectionDidChanged: function() {
    var currentPage = this.get('currentPage');
    var currentSearchIndex = this.get('currentSearchIndex');
    var selection = this.get('selection').firstObject();
    if(!SC.none(selection)) {
      var pageToSelect = 1;
      var indexToSelect = 0;
      if(!SC.none(selection.index)) {
        pageToSelect = selection.index.page;
        indexToSelect = selection.idx;
        var urlToSelect = selection.url;
        Multivio.filesController.selectNewFile(urlToSelect);
      }
      if (currentPage !== pageToSelect) { 
        this.set('currentPage', pageToSelect);
      }
      if (currentSearchIndex !== indexToSelect) {
        this.set('currentSearchIndex', indexToSelect);
      }
    }
  }.observes('selection'),

  _currentSearchDidChanged: function() {
    if(!SC.none(this.get('currentSearch'))){
      var currentSearch = Multivio.getPath('searchResultsController.selection').firstObject();
      if(!SC.none(currentSearch)) {
        var url = currentSearch.url;
        var query = currentSearch.query;
        var content = this.get('content');
        if(url !== content.url || query !== content.query) {
          content.url = url;
          content.query = query;
          content.results.push({url: currentSearch.url, results: currentSearch.results, query: currentSearch.results});
          this.propertyDidChange('content') ;
        }
      }
    }
  }.observes('Multivio.searchResultsController.selection')
}) ;
