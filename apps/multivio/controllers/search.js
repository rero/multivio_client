// ==========================================================================
// Project:   Multivio.treeController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

(Document Your Controller Here)

@extends SC.Object
*/
Multivio.LOADING_DONE = "done";
Multivio.LOADING_LOADING = "loading";
Multivio.LOADING_CANCEL = "cancel";

//highlight
Multivio.currentSearchResultsController = SC.ArrayController.create({
  allowsMultipleSelection: NO
});

Multivio.searchTreeController = SC.TreeController.create({

  allowsMultipleSelection: NO,
  currentQuery: null,
  defaultQueryMessage: 'Enter...',
  searchInAll: null,
  msgStatus: "",
  loadingStatus: Multivio.LOADING_DONE,

  init: function () {
    sc_super();
    var rootNode = SC.Object.create({
      treeItemIsExpanded: YES,
      treeItemChildren: null,
      guid: '0'
    });
    this.set('content', rootNode);
  },
  
  isLoading: function () {
    return this.get('loadingStatus') === Multivio.LOADING_LOADING ? YES : NO;
  }.property('loadingStatus'),

  isEditable: function () {
    return this.get('isLoading') ? NO : YES;
  }.property('isLoading'),

  cancelSearch: function () {
    Multivio.mainStatechart.sendEvent('cancelSearch');
  },

  userClicked: function (pane) {
    var currentSelection = pane.getPath('selection.firstObject');
    if (currentSelection) {
      var selectedIndex = currentSelection.get('page');
      var selectedUrl = currentSelection.get('url');
      if (!selectedIndex) {
        selectedIndex = 1;
      }
      Multivio.mainStatechart.sendEvent('goToFile', selectedUrl);
      Multivio.currentFileNodeController.set('currentIndex', selectedIndex);
    }
  }.observes('selection')
  
});

