// ==========================================================================
// Project:   Multivio.treeController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Multivio.Outline = SC.Object.extend(
  /** @scope Outline.prototype */ {

    treeItemIsExpanded: YES,

    treeItemChildren: function() {
      var ret = [];

      var children = this.get('childs');
      if(SC.none(children)) {
        return null;
      }
      var expanded = YES;
      for(var i=0;i<children.length;i++) {
        ret.push(Multivio.Outline.create({treeItemIsExpanded:expanded}, children[i]));
        expanded = NO;
      }
      return ret ; 
    }.property('childs').cacheable(),
    labelPage: function() {
      return "%@ (p. %@)".fmt(this.get('label'), this.get('file_position').index);
    }.property('label', 'file_position').cacheable()
}) ;

Multivio.treeController = SC.TreeController.create(
/** @scope Multivio.treeController.prototype */ {

  // TODO: Add your own code here.
  rawContent: null,
  rawContentBinding: SC.Binding.oneWay('Multivio.filesController.currentSelection'),
  currentIndex: null,
  currentIndexBinding: 'Multivio.pdfFileController.currentPage',
  currentNode: null,
    
  init:function() {
    var currentNode = Multivio.Outline.create({label : 'root', 'childs' : null, file_position: {url:'' , index:1}});
    this.set('content', currentNode);
    this.set('currentNode', currentNode);
  },

  _rawContentDidChange: function() {
    SC.Logger.debug("###################### hello ###################");
    var rawContent = this.get('rawContent');
    if(!SC.none(rawContent)) {

    SC.Logger.debug("URL: %@".fmt(rawContent.url));
      var newContent = this.get('rawContent').logicalStructure;

      //physicalStructure
      if(SC.none(newContent)){
        physicalStructure = this.get('rawContent').physicalStructure;
        newContent = [];
        for (var i=0;i<physicalStructure.length;i++) {
          newContent.push({label: physicalStructure[i].label, file_position: {index: -1, url: physicalStructure[i].url}});
        }
      }
        //this.set('content', newContent); 
        this.get('content').set('childs', newContent);
        //this.propertyDidChange('content') ;
    }
  }.observes('rawContent'),

  _currentIndexDidChange: function() {
     var currentIndex = this.get('currentIndex'); 
     var nodeToSelect = this._getNodeFromIndex(currentIndex, this.get('content'));
     SC.Logger.debug('Node: %@'.fmt(nodeToSelect));
     if(!SC.none(nodeToSelect)) {
     SC.Logger.debug('Node: %@'.fmt(nodeToSelect.label));
     nodeToSelect.set('treeItemIsExpanded', YES);
     nodeToSelect.set('dontChangeIndex', YES);
       this.selectObject(nodeToSelect);
     }
  }.observes('currentIndex'),

  _getNodeFromIndex: function(index, rootNode) {
    var children = rootNode.get('treeItemChildren');

    var best_index = -1;
    if(!SC.none(children)) {
      for(var i=0;i<children.length;i++) {
        var childIndex = children[i].file_position.index; 
        if(childIndex <= index) {
          best_index = i;
        }
      }
      SC.Logger.debug('Best index %@'.fmt(best_index));
      if(best_index >=0) {
        var bestChild =  this._getNodeFromIndex(index, children[best_index]);
        if(!SC.none(bestChild)) {
          return bestChild;
        }
      }
      return rootNode;
    }
    if(best_index < 0) {
      return rootNode;
    }
  },

  _selectionDidChange: function () {
    if (!this.get('allowsSelection')) {
      Multivio.logger.debug('tree selectionDidChange, selection not allowed, exit');
      return;
    }
    var sel = this.get('selection');
    if (SC.none(sel)) {
      return;
    }
    var so = sel.firstObject();
    if (SC.none(so)) {
      return;
    }
    if(so.get('dontChangeIndex')) {
      return;
    }
    this.set('currentIndex', so.file_position.index);
  }.observes('selection')

}) ;
