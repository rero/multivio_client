// ==========================================================================
// Project:   Multivio.thumnailsController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Multivio.thumbnailsController = SC.ArrayController.create(
  /** @scope Multivio.thumnailsController.prototype */ {
  content: [],
  nPages: undefined,
  currentPage: undefined,
  url: undefined,
  nPagesBinding: 'Multivio.pdfViewController.nPages',
  currentPageBinding: 'Multivio.pdfViewController.currentPage',
  //urlBinding: 'Multivio.pdfViewController.url',
  _thumbnailPrefix: '/server/document/render?max_width=100&max_height=100',

  _selectionDidChange: function() {
    var sel = this.get('selection');
    var currentPage = this.get('currentPage');
    if(!SC.none(sel))  {
      var newPage  = sel.firstObject().get('pageNumber');
      if(currentPage != newPage) {
        this.set('currentPage', sel.firstObject().get('pageNumber'));
      }
    }
  }.observes('selection'),
  
  _currentPageDidChange: function() {
    var currentPage = this.get('currentPage');
    if(!SC.none(currentPage) && currentPage > 1) {
      this.selectObject(this.get('content')[currentPage - 1]);
    }
  }.observes('currentPage'),

  _nPagesDidChange: function() {
    var nP = this.get('nPages');
    var newContent  = [];
    if(!SC.none(nP) && nP >= 0){
      SC.Logger.debug('New number of pages: ' + nP);
    var pageNr = 1;
    for(var i=0; i<nP; i++) {
      newContent[i] = SC.Object.create( 
        {
        url: this.get('_thumbnailPrefix') + "&page_nr=" + pageNr + "&url=" + Multivio.pdfViewController.get('url'),
        pageNumber: pageNr
      });
      pageNr += 1;
    }
    this.set('content', newContent);
    }
  }.observes('nPages')

}) ;
