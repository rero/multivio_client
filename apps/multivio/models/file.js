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

Multivio.FileRecord = SC.Record.extend(SC.TreeItemContent,
/** @scope Multivio.FileRecord.prototype */ {

  // TODO: Add your own code here.
  creator: SC.Record.attr(String),
  url: SC.Record.attr(String),
  index: SC.Record.attr(Number),
  fileSize: SC.Record.attr(Number),
  title: SC.Record.attr(String),
  mime: SC.Record.attr(String),
  nPages: SC.Record.attr(Number),
  nativeSize: SC.Record.attr(Object),
  defaultNativeSize: SC.Record.attr(Array),
  children: SC.Record.attr(Array),

  _parentNode: null,
  _ancestorFileNode: null,
  _queryChildren: null,
 
  /*****************************************************************************/ 
  init: function() {
    sc_super();
    this.set('treeItemIsExpanded', this.get('treeItemIsExpandedDefault'));
  },
 
  /*****************************************************************************/ 
  toString: function() {
    var to_return = "Creator: %@\n".fmt(this.get('creator'));
    to_return += "FileSize: %@\n".fmt(this.get('fileSize'));
    to_return += "Url: %@\n".fmt(this.get('url'));
    to_return += "Index: %@\n".fmt(this.get('index'));
    to_return += "Title: %@\n".fmt(this.get('title'));
    to_return += "mime: %@\n".fmt(this.get('mime'));
    to_return += "Number of pages: %@\n".fmt(this.get('nPages'));
    to_return += "Native size: %@\n".fmt(this.get('nativeSize'));
    to_return += "Default native size: %@\n".fmt(this.get('defaultNativeSize'));
    to_return += "Children: %@\n".fmt(this.get('children'));
    return to_return;
  },

 /*****************************************************************************/ 
  isFileNode: function() {
    return this.get('mime') ? YES: NO;
  }.property('mime').cacheable(),
  
 /*****************************************************************************/ 
  treeItemIsExpandedDefault: function() {
    return this.get('children') ? YES: NO;
  }.property('children').cacheable(),

 /*****************************************************************************/ 
  icon:function() {
    return this.get('canBeFetched') ? 'sc-icon-document-16' : null;
  }.property('canBeFetched').cacheable(),

 /*****************************************************************************/ 
  canBeFetched: function() {
    return (!this.get('isFileNode') && !this.get('isFinalNode') && !this.get('children')) ? YES : NO;
  }.property('isFileNode', 'isFinalNode', 'children').cacheable(),

 /*****************************************************************************/ 
  fetchFromServer: function() {
    if(this.get('canBeFetched') && !this.get('_queryChildren'))
      {
        var query = SC.Query.local(Multivio.FileRecord, "url={url} AND isFileNode=YES", {url:this.get('url'), parent: this});
        var results = Multivio.get('store').find(query);
        this.set('treeItemChildren', results);
        this.set('treeItemIsExpanded', YES);
        return YES;
      }
      return NO;
  },

 /*****************************************************************************/ 
  isFinalNode: function() {
    if(this.get('children')){
      return NO;
    }
    //is fileNode and has no children
    if(this.get('isFileNode')) {
      return YES;
    }
    //ancestoreFileNode alreay in the tree
    var _ancestorFileNode = this.get('_ancestorFileNode');
    if(_ancestorFileNode && (_ancestorFileNode.get('url') === this.get('url'))){
      return YES;
    }
    return NO;
  }.property('children', 'isFileNode', '_ancestorFileNode', 'url').cacheable(),

 /*****************************************************************************/ 
  treeItemChildren: function(key, value) {

    //set...
    if (value !== undefined) {
      this.set('_queryChildren', value);
    }

    //get... 
    //is a final leaf in the tree?
    if(this.get('isFinalNode')){
      return null;
    }

    var children = this.get('children');
    if(children) {
      //create children records for both file and indexNode
      return children.map(function(item, index){
        //guid
        var guid = "%@-%@".fmt(this.get('id'), index);
        item.guid = guid;

        var tmp = Multivio.store.createRecord(Multivio.FileRecord, item);

        if(this.get('isFileNode')) {
          tmp.set('_ancestorFileNode', this);
        }else{
          tmp.set('_ancestorFileNode', this.get('_ancestorFileNode'));
        }
        tmp.set('_parentNode', this);
        return tmp;
      }, this);
    }

    //current node is not final and has no children property yet
    //fetch from the server!
    var queryChildren = this.get('_queryChildren');

    return queryChildren ? queryChildren : null;
  }.property('children', '_queryChildren').cacheable()

});

