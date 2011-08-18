/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/** @class

(Document Your Controller Here)

@extends SC.Object
*/
Multivio.treeController = SC.TreeController.create({

  allowsMultipleSelection: NO,
  currentIndex: 1,
  currentIndexBinding: 'Multivio.currentFileNodeController.currentIndex',

  init: function () {
    sc_super();
    var rootNode = SC.Object.create({
      treeItemIsExpanded: YES,
      treeItemChildren: null,
      guid: '0'
    });
    this.set('content', rootNode);
  },

  userClicked: function (pane) {
    var selection = pane.getPath('selection.firstObject');
    if (selection) {
      var newIndex = selection.get('index') || 1;
      Multivio.currentFileNodeController.set('currentIndex', newIndex);

      if (Multivio.currentFileNodeController.get('url') &&
           (selection.get('url') !== Multivio.currentFileNodeController.get('url'))) {
        SC.Logger.warn('User click');
        Multivio.mainStatechart.sendEvent('fetchFile', selection);
      }
    }
  },

  currentIndexDidChange: function () {
    //alert('New currentIndex: %@'.fmt(this.get('currentIndex')));
    var currentIndex = this.get('currentIndex');
    var currentFileNode = Multivio.getPath('currentFileNodeController.content');
    if (currentFileNode && currentIndex) {
      var record = this._getNodeFromIndex(currentIndex, currentFileNode);
      if (record && record !== this.getPath('selection.firstObject')) {
        SC.Logger.warn('SelectObject');
        this.selectObject(record);
      }
    }
  }.observes('currentIndex'),

  _getNodeFromIndex: function (index, rootNode) {
    var children = rootNode.get('treeItemChildren');
    var bestIndex = -1;
    if (!SC.none(children)) {
      var i;
      for (i = 0; i < children.length; i++) {
        var childIndex = children[i].get('index');
        SC.Logger.debug('%@ <= %@'.fmt(childIndex, index));
        if (childIndex <= index) {
          bestIndex = i;
        }
      }
      if (bestIndex >= 0) {
        var bestChild = this._getNodeFromIndex(index, children[bestIndex]);
        if (!SC.none(bestChild)) {
          return bestChild;
        }
      }
      return rootNode;
    }
    if (bestIndex < 0) {
      return rootNode;
    }
  },

  update: function () {
    this.notifyPropertyChange('content');
  }
});

