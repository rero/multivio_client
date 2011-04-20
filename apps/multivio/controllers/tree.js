// ==========================================================================
// Project:   Multivio.treeController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Multivio.Outline = SC.Object.extend(SC.TreeItemContent,
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
        ret.push(Multivio.Outline.create({parentNode: this, treeItemIsExpanded:expanded}, children[i]));
        //expanded = NO;
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
  rawContentBinding: SC.Binding.oneWay('Multivio.filesController'),
  
  currentFile: null,
  currentFileBinding: 'Multivio.filesController.currentFile',
  
  currentIndex: null,
  //currentIndexBinding: 'Multivio.filesController.currentIndex',
  
  _urlCache: null,
    
  init:function() {
    var currentNode = Multivio.Outline.create({label : 'root', 'childs' : null, file_position: {url:'' , index:1}});
    this.set('content', currentNode);
    this.set('currentNode', currentNode);
    this.set('_urlCache', {});
  },

  updateContent: function() {
    var rawContent = this.get('rawContent');
    if(!SC.none(rawContent)) {
    SC.Logger.debug("###################### hello ###################: %@".fmt(rawContent.length()));
    rawContent.forEach( function (object, index, source, indexSet) { 
      SC.Logger.debug("%@, %@, %@, %@".fmt(object, index, source, indexSet)); 
      var url = object.url;
      if(SC.none(this.get('_urlCache')[url])) {
        var toAppend = this.get('content');
        if(!SC.none(object.parent)) {
          var newUrl = object.parent.url;
          toAppend = this._findLeaf(this.get('_urlCache')[newUrl], url, newUrl);
          if(SC.none(toAppend)) {
            throw "Child (%@) not found in parent (%@)".fmt(childUrl, parentUrl);
          }
        } else{
        this.get('content').url = url;
      }
        this._appendChild(object, toAppend);
        this.get('_urlCache')[url] = toAppend;
      }
    } , this);

/*
var parent = this.get('content');
var child = rawContent;
SC.Logger.debug("URL: %@".fmt(rawContent.url));
this._appendChild(child, parent);
//this.propertyDidChange('content') ;
*/
this.propertyDidChange('content') ;
    }
  },
    
  _findLeaf: function(rootNode, childUrl, parentUrl) {
      if(!SC.none(rootNode.file_position) && rootNode.file_position.url === childUrl) {
        return rootNode;
      }
      if(!SC.none(rootNode.url) && rootNode.url !== parentUrl) {
        return null;
      }
      var children = rootNode.get('treeItemChildren');
      if(SC.none(children)) {
        return null;
      }
      for(var i=0; i<children.length; i++) {
        var foundedNode = this._findLeaf(children[i], childUrl, parentUrl);
        if(foundedNode) {
          return foundedNode;
        }
      }
      return null;
    },


  _appendChild: function(child, parent) {
    var newContent = child.logicalStructure;

    //physicalStructure
    if(SC.none(newContent)){
      physicalStructure = child.physicalStructure;
      newContent = [];
      for (var i=0;i<physicalStructure.length;i++) {
        newContent.push({label: physicalStructure[i].label, file_position: {index: -1, url: physicalStructure[i].url}});
      }
    }
    //this.set('content', newContent); 
    parent.set('childs', newContent);
  },

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

_findParentFileNode: function(node) {
  if(!SC.none(node.url)) {
    return node;
  }
  return this._findParentFileNode(node.get('parentNode'));
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
    //this.set('currentFile', so.file_position.url);
    var newUrl = so.file_position.url;
    Multivio.filesController.selectNewFile(so.file_position.url, this._findParentFileNode(so).url);
    SC.Logger.debug('Loading file: %@'.fmt(so.file_position.url));
    this.set('currentIndex', so.file_position.index);
    //Multivio.mainStatechart.sendEvent('fetchFile');
  }.observes('selection')

}) ;
