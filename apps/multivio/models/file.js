// ==========================================================================
// Project:   Multivio.Metadata
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/**
  @class

  The core data model of Multivio is a hierarchical (tree) structure that
  contains a representation of the document being presented. Each node in the
  tree is represented by a URL. These nodes can be of different types:
  
  - **file** nodes, of two kinds:
    - **content** file nodes: correspond to files with content (e.g. PDF, images...)
    - **structural** file nodes: correspond to files whose purpose (with regard to
      Multivio) is to group other files (e.g. XML Dublin Core, XML MARC, XML
      MODS, XML METS...)
  - **logical** nodes: they do not correspond to actual files; they represent
    a specific location in the contents of a **content** file node, usually an
    entry in its table of contents; the node has the same URL as its nearest
    ancestor file node, and the `index` property determines the corresponding
    location

  Besides, some nodes play a special role in the tree:

  - **root** node: the one corresponding to the top-level URL given as input to
    the application
  - **final** nodes: they lie in the bottom of the tree in its final state, i.e.
    they have no children, and will never have
  - **fetchable** nodes: these are (temporarily) leaf nodes which are
    descendant of a **structural** file node; the fact that they are fetchable
    means that they link to file nodes that have not yet been loaded into the
    tree, and can thus be fetched; for example, a node corresponding to an XML
    DC file contains children that point each to a **content** file (e.g.
    PDFs), that will only be loaded later into the tree;

  @extends SC.Record
  @version 0.1
*/

Multivio.FileRecord = SC.Record.extend(SC.TreeItemContent,
  /** @scope Multivio.FileRecord.prototype */ {

  /**
    URL of the node
    @type String
  */
  url: SC.Record.attr(String),
  
  /**
    This is used in **logical** nodes and corresponds to a location (e.g. a
    page number)
    @type Number
  */
  index: SC.Record.attr(Number),
  
  /**
    Descriptive metadata of file content
    @type String
  */
  title: SC.Record.attr(String),
  /**
    Descriptive metadata of file content
    @type String
  */
  creator: SC.Record.attr(String),

  /** @type Number */
  fileSize: SC.Record.attr(Number),
  /** @type String */
  mime: SC.Record.attr(String),
  /** @type Number */
  nPages: SC.Record.attr(Number),
  /**
    The default page size of a PDF or the native size of an image. It's an
    array with two elements: [width, height]
    @type Array
  */
  defaultNativeSize: SC.Record.attr(Array),
  /**
    The list of exceptions to the default native size. It's an array of
    objects like ["2": [ 594.0, 843.0 ]]
    @type Array
  */
  nativeSizes: SC.Record.attr(Object),
  /**
    Child nodes
    @type Array
  */
  children: SC.Record.attr(Array, {lazilyInstantiate: YES}),

  /**
    @field
    @private
    @type FileRecord
  */
  _parentNode: null,

  /**
    The nearest ancestor that is a **file** node
    @field
    @private
    @type FileRecord
  */
  _ancestorFileNode: null,

  /**
    @field
    @private
    @type Array
  */
  _children: null,


  /** */
  init: function () {
    sc_super();
    this.set('treeItemIsExpanded', this.get('treeItemIsExpandedDefault'));
  },

  /**
    @field
    @type Boolean
  */
  isReady: function () { 
    return ((this.get('status') & SC.Record.READY) !== 0);
  }.property('status'),
 
  /**
    @field
    @returns String
  */
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

  /**
    @field
    @type String
  */
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

  /**
    @field
    @type Boolean
  */
  isFile: function () {
    return this.get('mime') ? YES : NO;
  }.property('mime').cacheable(),

  /**
    Returns the node itself, if it's a file node, or the nearest ancestor node
    higher up in the hierarchy
    @field
    @type FileRecord
  */
  nearestFileNode: function () {
    return this.get('isFile') ? this : this.get('_ancestorFileNode');
  }.property('isFile', '_ancestorFileNode').cacheable(),
  
  /**
    @field
    @type Boolean
  */
  isContent: function () {
    if (this.get('isFile')) {
      return this.get('mime').match(/xml/) ? NO : YES;
    }
    return NO;
  }.property('mime').cacheable(),

  /**
    @field
    @type Boolean
  */
  isPDF: function () {
    if (!this.get('mime')) {
      return NO;
    }
    if (this.get('isFile')) {
      return this.get('mime').match(/pdf/) ? YES: NO;
    }
    return NO;
  }.property('mime').cacheable(),

  /**
    True if it's a content file node whose contents are searchable (e.g. a PDF)
    @field
    @type Boolean
  */
  isSearchable: function () {
    return this.get('isPDF') ? YES : NO;
  }.property('isPDF'),
  
  /**
    @field
    @type Boolean
  */
  isImage: function () {
    if (!this.get('mime')) {
      return NO;
    }
    if (this.get('isFile')) {
      return this.get('mime').match(/image/) ? YES : NO;
    }
    return NO;
  }.property('mime').cacheable(),

  /**
    @field
    @type Boolean
  */
  isXML: function () {
    if (!this.get('mime')) {
      return NO;
    }
    return this.get('mime').match(/xml/) ? YES : NO;
  }.property('mime'),

  /**
    See SC.TreeItemContent.treeItemIsExpanded
    @field
    @type Boolean
  */
  treeItemIsExpandedDefault: function () {
    return this.get('children') ? YES : NO;
  }.property('children').cacheable(),

  /**
    @field
    @type String
  */
  icon: function () {
    return this.get('isFetchable') ? 'sc-icon-document-16' : null;
  }.property('isFetchable').cacheable(),

  /**
    @field
    @type Boolean
  */
  isFetchable: function () {
    return (!this.get('isFile') && !this.get('isFinal') && !this.get('children')) ? YES : NO;
  }.property('isFile', 'isFinal', 'children').cacheable(),

  /**
    @param Array children
    @returns Boolean
  */
  appendChildren: function (children) {
    if (!this.get('_children')) {
      this.set('_children', children);
      this.notifyPropertyChange('treeItemChildren');
      this.set('treeItemIsExpanded', YES);
      return YES;
    }
    return NO;
  },

  /**
    @field
    @type Boolean
  */
  isFinal: function () {
    if (this.get('children')) {
      return NO;
    }
    //is fileNode and has no children
    if (this.get('isFile')) {
      return YES;
    }
    //ancestoreFileNode alreay in the tree
    var _ancestorFileNode = this.get('_ancestorFileNode');
    if (_ancestorFileNode && (_ancestorFileNode.get('url') === this.get('url'))) {
      return YES;
    }
    return NO;
  }.property('children', 'isFile', '_ancestorFileNode', 'url').cacheable(),

  /**
    @field
    @type Array
  */
  fetchableNodes: function () {
    if (this.get('isContent') || !this.get('isFile')) {
      return null;
    }
    return this._getFetchableNodes(this.get('treeItemChildren'));
  }.property('treeItemChildren', 'isContent', 'isFile'),

  /**
    @private
    @param Array children
    @returns Array
  */
  _getFetchableNodes: function (children) {
    if (!children) {
      return [];
    }
    var toReturn = [];
    children.forEach(function (item) {
      //SC.Logger.debug(item.statusString());
      if (item.get('isFetchable')) {
        toReturn.pushObject(item);
      } else {
        var toAdd = this._getFetchableNodes(item.get('treeItemChildren'));
        toReturn.pushObjects(toAdd);
      }
    }, this);
    return toReturn;
  },

  /**
    See SC.TreeItemContent.treeItemChildren
    @field
    @type Array
  */
  treeItemChildren: function () {

    //is a final leaf in the tree?
    if (this.get('isFinal')) {
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

        if (this.get('isFile')) {
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
  

  /**
    @private
  */
  _nextFile: function (fileRecord, childRecord) {

    var children = fileRecord.get('fetchableNodes');
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

  /**
    @private
  */
  _previousFile: function (fileRecord, childRecord) {
    var children = fileRecord.get('fetchableNodes');
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

  /**
    @field
    @type Boolean
  */
  hasNextFile: function () {
    
    if (!this.get('isFile')) {
      return NO;
    }

    var ancestor = this.get('_ancestorFileNode');
    //rootNode
    return this._nextFile(this, null);
  }.property('isContent', '_ancestorFileNode', 'treeItemChildren'),


  /**
    @field
    @type Boolean
  */
  hasPreviousFile: function () {
    if (!this.get('isFile')) {
      return NO;
    }

    var ancestor = this.get('_ancestorFileNode');
    if (SC.none(ancestor)) {
      return NO;
    }
    
    return this._previousFile(ancestor, this);
  }.property('isContent', '_ancestorFileNode', 'treeItemChildren')
  
});

