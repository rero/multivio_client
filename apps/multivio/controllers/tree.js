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
  _selectionDidChange: function() {
    var selection = this.get('selection');
    if(selection) {
      var obj = selection.firstObject();
      if(obj && obj.get('canBeFetched')){
        if(obj.fetchFromServer()){
          //TODO: why do I have to do that?
          this.notifyPropertyChange("content");
        }
      }
    }
  }.observes('selection')
});

/*
sc_require('controllers/files.js');
Multivio.Outline = SC.Object.extend(SC.TreeItemContent, {

  treeItemIsExpanded: YES,

  treeItemChildren: function() {

    var children = this.get('childs');
    if(SC.none(children)) {
      return null;
    }
    var expanded = YES;

    return children.map(function(item){
      return Multivio.Outline.create({parentNode: this, treeItemIsExpanded:expanded}, item);
    }, this);

  }.property('childs').cacheable(),

  labelPage: function() {
    var index = this.get('file_position').index;
    if(index > 0) {
      return "%@ (p. %@)".fmt(this.get('label'), this.get('file_position').index);
    }
      return "%@".fmt(this.get('label'));
  }.property('label', 'file_position').cacheable()
}) ;

Multivio.treeController = SC.TreeController.create({

  // TODO: Add your own code here.
  allowsMultipleSelection: NO,

  currentFile: null,
  currentFileBinding: 'Multivio.fileController.content',

  currentIndex: null,
  currentIndexBinding: 'Multivio.filesController.currentIndex',

  _urlCache: null,
  dontChangeIndex: NO,

  init:function() {
    var currentNode = Multivio.Outline.create({label : 'root', 'childs' : null, file_position: {url:'' , index: -1}});
    this.set('content', currentNode);
    this.set('currentNode', currentNode);
    this.set('_urlCache', {});
  },

  _currentFileDidChanged: function() {
    var currentFile = this.get('currentFile');
    var contentUpdated = NO;

    if(!SC.none(currentFile)) {
      var url = currentFile.url;

      if(SC.none(this.get('_urlCache')[url])) {
        var toAppend = this.get('content');
        if(!SC.none(currentFile.parent)) {
          var newUrl = currentFile.parent.url;
          toAppend = this._findLeaf(this.get('_urlCache')[newUrl], url, newUrl);
          if(SC.none(toAppend)) {
            throw "Child (%@) not found in parent (%@)".fmt(childUrl, parentUrl);
          }
        } else{
          this.get('content').file_position.url = url;
        }
        this._appendChild(currentFile, toAppend);
        contentUpdated = YES;
        this.get('_urlCache')[url] = toAppend;
      }
      if(contentUpdated) {
        this.propertyDidChange('content') ;
      }
      var nodeToSelect = this.get('_urlCache')[url];
      if(!SC.none(nodeToSelect)) {
        this.selectObject(nodeToSelect);
      }
    }
  }.observes('currentFile'),


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
      newContent = physicalStructure.map(function(item){
        return {label: item.label, file_position: {index: -1, url: item.url}}; 
      });
    }
    //this.set('content', newContent); 
    parent.set('childs', newContent);
  },
  
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

  _findChildFileNode: function(node) {
    if(!SC.none(node.file_position.url)) {
      return node;
    }
    var children = node.get('treeItemChildren');
    if(SC.none(children)) {
      throw "Children should have file_position or childs";
      //return null;
    }
    return this._findChildFileNode(children[0]);
  },

  _findParentFileNode: function(node, childUrl) {
    if(!SC.none(node.file_position.url) &&
       node.file_position.url !== childUrl) {
      return node;
    }
    var parent = node.get('parentNode');
    if(SC.none(parent)) {
      return node;
    }
    return this._findParentFileNode(parent, childUrl);
  },


  _currentIndexDidChange: function() {
    var currentIndex = this.get('currentIndex'); 
    var currentFile = this.get('currentFile');
    if(!SC.none(currentFile)) {
      var nodeToSelect = this._getNodeFromIndex(currentIndex, this.get('_urlCache')[currentFile.url]);
      if(!SC.none(nodeToSelect)) {
        if(nodeToSelect != this.get('selection').firstObject()) {
          this.set('dontChangeIndex', YES);
        SC.Logger.debug('Tree select object for current index: ' + currentIndex);
          this.selectObject(nodeToSelect);
        }
      }
    }
  }.observes('currentIndex'),

  _selectionDidChange: function () {
    if (!this.get('allowsSelection')) {
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
    if(this.get('dontChangeIndex')) {
      this.set('dontChangeIndex', NO);
      return;
    }
    //this.set('currentFile', so.file_position.url);
    var urlToFetch = this._findChildFileNode(so).file_position.url;
    var parentUrl = this._findParentFileNode(so, urlToFetch).file_position.url;
    Multivio.filesController.selectNewFile(urlToFetch, parentUrl);
    if(!SC.none(so.file_position) && so.file_position.index > -1 &&
      this.get('currentIndex') !== so.file_position.index) {
        SC.Logger.debug('Tree select current index: ' + so.file_position.index);
      this.set('currentIndex', so.file_position.index);
    }
    //Multivio.mainStatechart.sendEvent('fetchFile');
  }.observes('selection')

}) ;
*/
