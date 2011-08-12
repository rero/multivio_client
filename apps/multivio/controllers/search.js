// ==========================================================================
// Project:   Multivio.treeController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

Multivio.LOADING_DONE = "done";
Multivio.LOADING_LOADING = "loading";
Multivio.LOADING_CANCEL = "cancel";

/** @namespace

  TODO

  @extends SC.Object
*/
Multivio.currentSearchResultsController = SC.ArrayController.create(
  /** @scope Multivio.currentSearchResultsController.prototype */ {

  /** */
  allowsMultipleSelection: NO
});

/** @namespace

  TODO

  @extends SC.Object
*/
Multivio.searchTreeController = SC.TreeController.create(
  /** @scope Multivio.searchTreeController.prototype */ {

  allowsMultipleSelection: NO,
  currentUserQuery: null,
  defaultQueryMessage: 'Enter...',
  searchInAllFiles: null,
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
    this.resetSearchInterface();
  },

  /** */
  resetSearchInterface: function () {
    this.set('currentUserQuery', '');
    this.set('searchInAllFiles', NO);
    this.set('msgStatus', '');
    this.set('loadingStatus', Multivio.LOADING_DONE);
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

