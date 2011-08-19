// ==========================================================================
// Project:   Multivio.Metadata
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  A single search result

  @extends SC.Record
  @version 0.1
*/
Multivio.SearchResultRecord = SC.Record.extend({
  /** @scope Multivio.SearchResultRecord.prototype */
  
  /** @type String */
  left_context: SC.Record.attr(String),
  /** @type String */
  right_context: SC.Record.attr(String),
  /** @type String */
  matched: SC.Record.attr(String),
  /** @type Number */
  y2: SC.Record.attr(Number), 
  /** @type Number */
  x2: SC.Record.attr(Number), 
  /** @type Number */
  y1: SC.Record.attr(Number), 
  /** @type Number */
  x1: SC.Record.attr(Number), 
  /** @type Number */
  page: SC.Record.attr(Number),
  /** @type Array */
  searchTreeItemChildren: null,
  /** @type String */
  url: null,
  /** @type String */
  query: null,

  isSearchResult: YES,
  _parentNode: null,

  _ancestorFileNode: null,
  
  /**
    @field
    @type String
  */
  label: function () {
    return "%@<b>%@</b>%@ (p.%@)".fmt(this.get('left_context'),
        this.get('matched'), this.get('right_context'), this.get('page'));
  }.property('left_context', 'matched', 'right_context', 'page').cacheable()

});

/** @class

  The top-level data structure of a set of search results. It includes a set
  of Multivio.SearchResultRecord objects

  @extends SC.Record
  @version 0.1
*/
Multivio.SearchRecord = SC.Record.extend(/** @scope Multivio.SearchRecord.prototype */ {

  /** @type String */
  query: SC.Record.attr(String),
  /** @type Number */
  url: SC.Record.attr(String),
  /** @type Number */
  max_reached: SC.Record.attr(Number),
  /** @type String */
  context_type: SC.Record.attr(String),
  /** @type Array */
  results: SC.Record.attr(Array, {lazilyInstantiate: YES}),
  /** @type Boolean */
  treeItemIsExpanded: YES,
 
  /**
    @field
    @type Boolean
  */ 
  isReady: function () { 
    return (this.get('status') & SC.Record.READY) !== 0; 
  }.property('status'),
 
  /**
    @field
    @type String
  */ 
  toString: function () {
    var to_return = "Query: %@\n".fmt(this.get('query'));
    to_return += "Url: %@\n".fmt(this.get('url'));
    to_return += "Max: %@\n".fmt(this.get('max_reached'));
    to_return += "Right-context: %@\n".fmt(this.get('right_context'));
    to_return += "Left-context: %@\n".fmt(this.get('left_context'));
    return to_return;
  },

  /**
    @field
    @type Array
  */ 
  searchTreeItemChildren: function () {
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
  }.property('results', 'url', 'query').cacheable(),

  /**
    @field
    @type String
  */ 
  label: function () {
    if (this.get('url')) {
      return "%@ (%@)".fmt(Multivio.store.find(Multivio.FileRecord,
        this.get('url')).get('title'), this.getPath('results.length'));
    }
    return null;
  }.property('results', 'url')
  
});
