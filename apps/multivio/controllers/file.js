/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/** @class

  This is the controller is the single selection of the Multivio.filesController.

  @author jma
  @extends SC.ObjectController
*/

Multivio.currentFileNodeController = SC.ObjectController.create({
  currentIndex: null,

/*********************************************************************************/
  hasNextIndex: function () {
    var nPages = this.get('nPages');
    var currentIndex = this.get('currentIndex');

    if (nPages && currentIndex >= 0) {
      return currentIndex < nPages ? YES : NO;
    }
    return NO;
  }.property('nPages', 'currentIndex').cacheable(),

  hasPreviousIndex: function () {
    var nPages = this.get('nPages'),
      currentIndex = this.get('currentIndex');
    if (nPages && currentIndex > 0) {
      return currentIndex > 1 ? YES : NO;
    }
    return NO;
  }.property('nPages', 'currentIndex').cacheable(),

  treeItemChildrenObserves: function () {
    if (this.get('isContent')) {
      Multivio.treeController.update();
    }
    this.set('treeItemIsExpanded', YES);
  }.observes('treeItemChildren')

});

Multivio.rootNodeController = SC.ObjectController.create({

  _childrenDidChange: function () {
    if (this.get('children')) {
      this.set('treeItemIsExpanded', YES);
    }
  }.observes('children')

});
