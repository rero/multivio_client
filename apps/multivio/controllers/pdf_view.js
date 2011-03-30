// ==========================================================================
// Project:   Multivio.pdfViewController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

sc_require('controllers/pdf_view.js');
/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Multivio.pdfViewController = SC.ObjectController.create(
/** @scope Multivio.pdfViewController.prototype */ {
  contentBinding: 'Multivio.documentController.currentSelection',
  _renderPrefix: 'server/document/render?max_width=400&max_height=800&url=',
  
  pdfUrl: function() {
    SC.Logger.debug('pdfViewController: url changed: ');
    if(!SC.none(this.get('metadata'))){
      if(this.get('metadata').mime === 'application/pdf') {
        var newUrl = this.get('_renderPrefix') + this.get('url') ;
        SC.Logger.debug('pdfViewController: new url: ' + newUrl );
        return newUrl;
      }
    }else{
      return undefined;
    }
  }.property('url').cacheable()

});
