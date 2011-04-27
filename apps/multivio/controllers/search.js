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

Multivio.filesForSearchController = Multivio.FilesController.create({});


Multivio.searchController = SC.ArrayController.create({
  allowsMultipleSelection: NO,
  loadingStatus: undefined,
  content: Multivio.SearchData,
  currentUrl: null,
  currentQuery: null,

  fetchFile: function(url, query) {
    if(this.get('loadingStatus') === Multivio.LOADING_LOADING) {
      throw	new Error('searchController: concurrent file fetch');
    }
    var alreadyLoaded = this.find(url, query);
    if(alreadyLoaded) {
      //this.set('currentFile', url);
      //Multivio.mainStatechart.sendEvent('fileLoaded', alreadyLoaded);
        this.selectObject(alreadyLoaded);
    }else{
      this.set('loadingStatus', Multivio.LOADING_LOADING);
      this.set('currentUrl', url);
      this.set('currentQuery', query);
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
    var records = this.get('content');
    if(SC.none(records)) {
      return null;
    }
    for(var i=0;i<records.length();i++) {
      if(records.objectAt(i).url === url &&
        records.objectAt(i).query === query) {
        return records.objectAt(i);
      }
    }
    return null;
  },

  _contentDidChange: function(){
    SC.Logger.debug('file received!!!!!');
    var url = this.get('currentUrl');
    var query = this.get('currentQuery');
    var fetchedObject = this.find(this.get('currentUrl'), query);
    if(!SC.none(fetchedObject)){
      //accept new fetch request
        this.set('currentUrl', undefined);
        this.set('currentQuery', undefined);
        SC.Logger.debug('fileLoaded');
        //this.set('currentFile', url);
        this.set('loadingStatus', Multivio.LOADING_DONE);
        this.selectObject(fetchedObject);
        //Multivio.mainStatechart.sendEvent('fileLoaded', fetchedObject);
    }
  }.observes('[]')
});

Multivio.searchItem = SC.Object.extend(SC.TreeItemContent, {

  treeItemIsExpanded: YES,

  treeItemChildren: function() {
    var ret = [];

    var children = this.get('results');
    if(SC.none(children)) {
      return null;
    }

    var expanded = YES;
    for(var i=0;i<children.length;i++) {
      ret.push(Multivio.searchItem.create({parentNode: this, treeItemIsExpanded:expanded}, children[i]));
      //expanded = NO;
    }
    return ret ; 
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
    var file = Multivio.filesController.find(url);
    if(SC.none(file)) {
      return "<strong>%@</strong> (%@)".fmt(this.get('url'), nResults);
    }
    return "<strong>%@</strong> (%@)".fmt(file.getPath('metadata.title'), nResults);
  }.property('url')
}) ;

Multivio.searchTreeController = SC.TreeController.create(
/** @scope Multivio.searchController.prototype */ {

  // TODO: Add your own code here.
  defaultQueryMessage: 'Enter a new query here.',
  query: null,
  content: null,
  searchStatus: 'Search in current file',
  currentFile: null,
  currentFileBinding: SC.Binding.oneWay('Multivio.filesController.selection'),
  currentSearch: null,
  currentSearchBinding: 'Multivio.searchController.selection',
  currentPage: null,
  currentPageBinding: 'Multivio.filesController.currentIndex',

  hasResult: function() {
    if(this.get('content').length > 0) {
      return YES;
    }
    return NO;
  }.property('[]'),

  init: function() {
    sc_super();
    var currentNode = Multivio.searchItem.create();
    this.set('content', currentNode);
    //var currentNode = Multivio.searchItem.create();
    //this.set('content', currentNode);
  },
  

  _currentFileDidChanged: function() {
    var currentFile = this.get('currentFile');
    var query = this.get('query');
    if(!SC.none(query) && !SC.none(currentFile)) {
      currentFile = currentFile.firstObject();
      if(currentFile.get('isContentFile')){
        if(SC.none(this.get('content').url) || currentFile.url !== this.get('content').url || query !== this.get('content').query){
          this.set('searchStatus', 'searching...');
          Multivio.searchController.fetchFile(currentFile.url, query);
        }
      }
    }
  }.observes('currentFile', 'query'),
    


  clear: function() {
    this.set('query', null);
    var content = this.get('content');
    content.url = null;
    content.query = null;
    content.results = null;
    this.propertyDidChange('content') ;

  },

  _selectionDidChanged: function() {
    var currentPage = this.get('currentPage');
    var selection = this.get('selection').firstObject();
    if(!SC.none(selection)) {
      var pageToSelect = 1;
      if(!SC.none(selection.index)) {
        pageToSelect = selection.index.page;
      }
      if (currentPage !== pageToSelect) {
        this.set('currentPage', pageToSelect);
      }
    }
  }.observes('selection'),

  _currentSearchDidChanged: function() {
    if(!SC.none(this.get('currentSearch'))){
      var currentSearch = this.get('currentSearch').firstObject();
      if(!SC.none(currentSearch)) {
        var url = currentSearch.url;
        var query = currentSearch.query;
        var content = this.get('content');
        if(url !== content.url || query !== content.query) {
          content.url = url;
          content.query = query;
          content.results = [currentSearch];
          this.propertyDidChange('content') ;
          this.set('content', this.get('content'));
          this.set('searchStatus', 'done');
        }
      }
    }
  }.observes('currentSearch')
}) ;
