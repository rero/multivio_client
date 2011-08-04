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

Multivio.SearchResultRecord = SC.Record.extend(SC.TreeItemContent, {
  left_context: SC.Record.attr(String),
  right_context: SC.Record.attr(String),
  matched: SC.Record.attr(String),
  y2: SC.Record.attr(Number), 
  x2: SC.Record.attr(Number), 
  y1: SC.Record.attr(Number), 
  x1: SC.Record.attr(Number), 
  page: SC.Record.attr(Number),
  treeItemChildren: null,
  url: null,
  query: null,

  label: function () {
    return "%@<b>%@</b>%@ (p.%@)".fmt(this.get('left_context'), this.get('matched'), this.get('right_context'), this.get('page'));
  }.property('left_context', 'matched', 'right_context', 'page').cacheable()

});

Multivio.SearchRecord = SC.Record.extend(SC.TreeItemContent, {

  // TODO: Add your own code here.
  query: SC.Record.attr(String),
  url: SC.Record.attr(String),
  max_reached: SC.Record.attr(Number),
  context_type: SC.Record.attr(String),
  results: SC.Record.attr(Array, {lazilyInstantiate: YES}),

  treeItemIsExpanded: NO,

 
  /*****************************************************************************/ 
  isReady: function () { 
    return (this.get('status') & SC.Record.READY) !== 0; 
  }.property('status'),
 
  /*****************************************************************************/ 
  toString: function () {
    var to_return = "Query: %@\n".fmt(this.get('query'));
    to_return += "Url: %@\n".fmt(this.get('url'));
    to_return += "Max: %@\n".fmt(this.get('max_reached'));
    to_return += "Right-context: %@\n".fmt(this.get('right_context'));
    to_return += "Left-context: %@\n".fmt(this.get('left_context'));
    return to_return;
  },


 /*****************************************************************************/ 
  treeItemChildren: function () {

    var children = this.get('results');
    if (children) {
      //create children records for both file and indexNode
      return children.map(function (item, index) {
        //guid
        var tmp = Multivio.store.createRecord(Multivio.SearchResultRecord, item);
        tmp.set('url', this.get('url'));
        tmp.set('query', this.get('query'));
        return tmp;
      }, this);
    }

    return null;

  }.property('results').cacheable(),

  label: function () {
    return "%@ (%@)".fmt(Multivio.store.find(Multivio.FileRecord, this.get('url')).get('title'), this.getPath('results.length'));
  }.property('results', 'url')
  
});
