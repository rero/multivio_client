// ==========================================================================
// Project:   Multivio.treeController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

(Document Your Controller Here)

@extends SC.Object
*/
Multivio.treeController = SC.TreeController.create({

  allowsMultipleSelection: NO,
  currentIndex: null,
  currentIndexBinding: 'Multivio.currentFileNodeController.currentIndex',
  userSelection: YES,

  init:function() {
    sc_super();
    var rootNode = SC.Object.create({
      treeItemIsExpanded: YES,
      treeItemChildren: null,
      guid: '0'
    });
      this.set('content', rootNode);
  },

  currentIndexDidChange: function() {
    var currentIndex = this.get('currentIndex');
    var currentFileNode = Multivio.getPath('currentFileNodeController.content');
    if(currentFileNode && currentIndex) {
      var record = this._getNodeFromIndex(currentIndex, currentFileNode);
      SC.Logger.debug("To select: %@".fmt(record.get('index')));
      if(record && record !== this.getPath('selection.firstObject')) {
        this.set('userSelection', NO);
        this.selectObject(record);
      }
    }
  }.observes('currentIndex'),

 _getNodeFromIndex: function(index, rootNode) {
    var children = rootNode.get('treeItemChildren');

    var bestIndex = -1;
    if(!SC.none(children)) {
      for(var i=0;i<children.length;i++) {
        var childIndex = children[i].get('index');
        SC.Logger.debug('%@ <= %@'.fmt(childIndex, index));
        if(childIndex <= index) {
          bestIndex = i;
        }
      }
      if(bestIndex >=0) {
        var bestChild = this._getNodeFromIndex(index, children[bestIndex]);
        if(!SC.none(bestChild)) {
          return bestChild;
        }
      }
      return rootNode;
    }
    if(bestIndex < 0) {
      return rootNode;
    }
  },

  update:function(){
    //SC.Logger.debug("New: %@".fmt(Multivio.getPath('treeController.content.treeItemChildren.firstObject.treeItemChildren')));
    this.notifyPropertyChange('content');
  }
});

