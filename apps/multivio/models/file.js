// ==========================================================================
// Project:   Multivio.Metadata
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/

Multivio.FileRecord = SC.Record.extend(SC.TreeItemContent, {

  // TODO: Add your own code here.
  creator: SC.Record.attr(String),
  url: SC.Record.attr(String),
  index: SC.Record.attr(Number),
  fileSize: SC.Record.attr(Number),
  title: SC.Record.attr(String),
  mime: SC.Record.attr(String),
  nPages: SC.Record.attr(Number),
  nativeSizes: SC.Record.attr(Object),
  defaultNativeSize: SC.Record.attr(Array),
  children: SC.Record.attr(Array, {lazilyInstantiate: YES}),

  _parentNode: null,
  _ancestorFileNode: null,
  _children: null,
 
  /*****************************************************************************/ 
  init: function () {
    sc_super();
    this.set('treeItemIsExpanded', this.get('treeItemIsExpandedDefault'));
  },

  isReady: function () { 
    return ((this.get('status') & SC.Record.READY) !== 0);
  }.property('status'),
 
  /*****************************************************************************/ 
  toString: function () {
    var to_return = "Creator: %@\n".fmt(this.get('creator'));
    to_return += "FileSize: %@\n".fmt(this.get('fileSize'));
    to_return += "Url: %@\n".fmt(this.get('url'));
    to_return += "Index: %@\n".fmt(this.get('index'));
    to_return += "Title: %@\n".fmt(this.get('title'));
    to_return += "mime: %@\n".fmt(this.get('mime'));
    to_return += "Number of pages: %@\n".fmt(this.get('nPages'));
    to_return += "Native size: %@\n".fmt(this.get('nativeSizes'));
    to_return += "Default native size: %@\n".fmt(this.get('defaultNativeSize'));
    to_return += "Children: %@\n".fmt(this.get('children'));
    return to_return;
  },

 /*****************************************************************************/ 
  humanReadableFileSize: function () {
    var size = this.get('fileSize');
    if (!size) {
      return "";
    }
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = 0;
    while (size >= 1024) {
      size /= 1024;
      ++i;
    }
    return size.toFixed(1) + ' ' + units[i];
  }.property('fileSize'),

 /*****************************************************************************/ 
  isFileNode: function () {
    return this.get('mime') ? YES : NO;
  }.property('mime').cacheable(),

 /*****************************************************************************/ 
  fileNode: function () {
    return this.get('isFileNode') ? this : this.get('_ancestorFileNode');
  }.property('isFileNode', '_ancestorFileNode').cacheable(),
  
 /*****************************************************************************/ 
  isContent: function () {
    if (this.get('isFileNode')) {
      return this.get('mime').match(/xml/) ? NO : YES;
    }
    return NO;
  }.property('mime').cacheable(),

 /*****************************************************************************/ 
  isPdf: function () {
    if (!this.get('mime')) {
      return NO;
    }
    if (this.get('isFileNode')) {
      return this.get('mime').match(/pdf/) ? YES: NO;
    }
    return NO;
  }.property('mime').cacheable(),

 /*****************************************************************************/ 
  isSearchable: function () {
    return this.get('isPdf') ? YES : NO;
  }.property('isPdf'),
  
 /*****************************************************************************/ 
  isImage: function () {
    if (!this.get('mime')) {
      return NO;
    }
    if (this.get('isFileNode')) {
      return this.get('mime').match(/image/) ? YES : NO;
    }
    return NO;
  }.property('mime').cacheable(),

 /*****************************************************************************/ 
  isXml: function () {
    if (!this.get('mime')) {
      return NO;
    }
    return this.get('mime').match(/xml/) ? YES : NO;
  }.property('mime'),

 /*****************************************************************************/ 
  treeItemIsExpandedDefault: function () {
    return this.get('children') ? YES : NO;
  }.property('children').cacheable(),

 /*****************************************************************************/ 
  icon: function () {
    return this.get('canBeFetched') ? 'sc-icon-document-16' : null;
  }.property('canBeFetched').cacheable(),

 /*****************************************************************************/ 
  canBeFetched: function () {
    return (!this.get('isFileNode') && !this.get('isFinalNode') && !this.get('children')) ? YES : NO;
  }.property('isFileNode', 'isFinalNode', 'children').cacheable(),

 /*****************************************************************************/ 
  appendChildren: function (children) {
    if (!this.get('_children')) {
      this.set('_children', children);
      this.notifyPropertyChange('treeItemChildren');
      this.set('treeItemIsExpanded', YES);
      return YES;
    }
    return NO;
  },
 /*****************************************************************************/ 
  isFinalNode: function () {
    if (this.get('children')) {
      return NO;
    }
    //is fileNode and has no children
    if (this.get('isFileNode')) {
      return YES;
    }
    //ancestoreFileNode alreay in the tree
    var _ancestorFileNode = this.get('_ancestorFileNode');
    if (_ancestorFileNode && (_ancestorFileNode.get('url') === this.get('url'))) {
      return YES;
    }
    return NO;
  }.property('children', 'isFileNode', '_ancestorFileNode', 'url').cacheable(),

 /*****************************************************************************/ 
  canBeFetchedNodes: function () {
    if (this.get('isContent') || !this.get('isFileNode')) {
      return null;
    }
    return this._getCanBeFechedNodes(this.get('treeItemChildren'));
  }.property('treeItemChildren', 'isContent', 'isFileNode'),

 /*****************************************************************************/ 
  _getCanBeFechedNodes: function (children) {
    if (!children) {
      return [];
    }
    var toReturn = [];
    children.forEach(function (item) {
      //SC.Logger.debug(item.statusString());
      if (item.get('canBeFetched')) {
        toReturn.pushObject(item);
      } else {
        var toAdd = this._getCanBeFechedNodes(item.get('treeItemChildren'));
        toReturn.pushObjects(toAdd);
      }
    }, this);
    return toReturn;
  },

 /*****************************************************************************/ 
  treeItemChildren: function () {


    //is a final leaf in the tree?
    if (this.get('isFinalNode')) {
      return null;
    }

    var children = this.get('children');
    if (children) {
      //create children records for both file and indexNode
      return children.map(function (item, index) {
        //guid
        var guid = "%@-%@".fmt(this.get('id'), index);
        item.guid = guid;

        var tmp = Multivio.store.createRecord(Multivio.FileRecord, item);

        if (this.get('isFileNode')) {
          tmp.set('_ancestorFileNode', this);
        } else {
          tmp.set('_ancestorFileNode', this.get('_ancestorFileNode'));
        }
        tmp.set('_parentNode', this);
        return tmp;
      }, this);
    }

    //current node is not final and has no children property yet
    //fetch from the server!
    if (this.get('_children')) {
      return this.get('_children');
    }
    return null;

  }.property('children', '_children').cacheable(),
  

 /*****************************************************************************/ 
  _nextFile: function (fileRecord, childRecord) {

    var children = fileRecord.get('canBeFetchedNodes');
    if (!childRecord) {
      if (children && children.get('length') > 0) {
        return children[0];
      } else {
        if (fileRecord.get('_ancestorFileNode')) {
          return this._nextFile(fileRecord.get('_ancestorFileNode'), fileRecord);
        } else {
          return NO;
        }
      }
    }
    var matched = children.findProperty('url', childRecord.get('url'));
    var childIndex = children.indexOf(matched);
    if (childIndex < (children.get('length') - 1)) {
      return children.objectAt(childIndex + 1); 
    }
    
    //root Node
    if (SC.none(fileRecord.get('_ancestorFileNode'))) {
      return NO;
    }

    //the same in parents
    return this._nextFile(fileRecord.get('_ancestorFileNode'), fileRecord);
  },

 /*****************************************************************************/ 
  _previousFile: function (fileRecord, childRecord) {
    var children = fileRecord.get('canBeFetchedNodes');
    if (!childRecord) {
      if (children && children.get('length') > 0) {
        return children[0];
      } else {
        return NO;
      }
    }
    var matched = children.findProperty('url', childRecord.get('url'));
    var childIndex = children.indexOf(matched);
    if (childIndex > 0) {
      return children.objectAt(childIndex - 1); 
    }
    //root Node
    if (!fileRecord.get('_ancestorFileNode')) {
      return NO;
    }
    

    //the same in parents
    return this._previousFile(fileRecord.get('_ancestorFileNode'), fileRecord);
  },

 /*****************************************************************************/ 
  hasNextFile: function () {
    
    if (!this.get('isFileNode')) {
      return NO;
    }

    var ancestor = this.get('_ancestorFileNode');
    //rootNode
    return this._nextFile(this, null);
  }.property('isContent', '_ancestorFileNode', 'treeItemChildren'),


 /*****************************************************************************/ 
  hasPreviousFile: function () {
    if (!this.get('isFileNode')) {
      return NO;
    }

    var ancestor = this.get('_ancestorFileNode');
    if (SC.none(ancestor)) {
      return NO;
    }
    
    return this._previousFile(ancestor, this);
  }.property('isContent', '_ancestorFileNode', 'treeItemChildren')
  
});

