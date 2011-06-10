// ==========================================================================
// Project:   Multivio.searchController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */
sc_require('controllers/search_results.js');
sc_require('controllers/files.js');

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Multivio.searchResultController = SC.ObjectController.create({

  contentBinding: SC.Binding.from('Multivio.searchResultsController.selection').single()

}) ;

Multivio.currentSearchResultsController = SC.ArrayController.create({

  content: [],
  currentResults: null,
  allowsMultipleSelection: NO,
  currentResultsBinding: 'Multivio.searchResultsController.selection',
  currentPage: null,
  currentPageBinding: 'Multivio.filesController.currentIndex',
  currentFile: null,
  currentFileBinding: 'Multivio.filesController.currentFile',
  currentSearchIndex: null,
  currentSearchIndexBinding: 'Multivio.searchResultsController.currentIndex',


  _currentPageDidChange: function(){
    this._removeAll();
    var currentPage = this.get('currentPage');
    var currentResults = Multivio.searchResultsController.findProperty('url', this.getPath('currentFile.url'));
    if(currentPage < 1 || SC.none(currentResults)){
      return;
    }
    currentResults = currentResults.results;
    
    var toAdd = currentResults.filter(function(item, index, enumerable){
      if(item.index.page === this.get('currentPage')){
        return YES;
        }
        return NO;
    },this);
    toAdd.forEach(function(item, index, self) {
      this.pushObject(SC.Object.create({
        bounding_box: item.index.bounding_box,
        idx: item.idx
      }));
    }, this);
    SC.Logger.debug('here');
//    this.set('currentSearchIndex', 0);
  }.observes('currentPage', 'currentFile'),
  
    _contentDidChanged: function() {
      var currentSearchIndex = this.get('currentSearchIndex');
      if(currentSearchIndex) {
        SC.Logger.debug('Change search index: %@'.fmt(this.get('currentSearchIndex')));
      }

    }.observes('[]'),
  _removeAll: function() {
    if(this.get('length') > 0) {
      this.removeAt(0, this.get('length')); 
    }
  },
  _currentSearchIndexChanged: function() {
     var selection = this.get('selection');
     var idx = this.get('currentSearchIndex');
     if(!SC.none(selection)) {
        selection = selection.firstObject();
     }
     if(SC.none(selection) || selection.idx !==  idx) {
        var toSelect = this.findProperty('idx', idx);
        if(toSelect) {
          this.selectObject(toSelect);
        }
     }
  }.observes('currentSearchIndex')

}) ;
