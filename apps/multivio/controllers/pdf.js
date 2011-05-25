/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

sc_require('views/pdf_view.js');
sc_require('mixins/image.js');
sc_require('controllers/files.js');



/** @class

  This controll the center view to display a pdf content.

  @author jma
  @extends SC.ObjectController
*/
Multivio.pdfFileController = SC.ObjectController.create(Multivio.DisplayImage, {

  //Bindings 
  contentBinding: SC.Binding.oneWay('Multivio.fileController'),

  _centerViewWidthBinding: SC.Binding.oneWay('Multivio.mainPage.mainPdfView.pdfScrollView.contentView.visibleWidth'),

  _centerViewHeightBinding: SC.Binding.oneWay('Multivio.mainPage.mainPdfView.pdfScrollView.contentView.visibleHeight'),
  centerImageBinding: SC.Binding.oneWay('Multivio.mainPage.mainPdfView.pdfScrollView.contentView.image'),

  currentPage: null,
  currentPageBinding: 'Multivio.filesController.currentIndex',

  _centerImageStatusBinding: SC.Binding.oneWay('Multivio.mainPage.mainPdfView.pdfScrollView.contentView.imageView.status'),

  _appOptionsBinding: SC.Binding.oneWay('Multivio.inputParameters.options'),

  _zoomScale: [0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0],
  _currentZoomIndex: 7,
  mimeRegExp: '.*?/pdf',

  _currentUrl: function (){
    return "page_nr=%@&url=%@".fmt(this.get('currentPage'), this.get('url'));
  }.property('url', 'currentPage').cacheable(),

  currentZoomScale: function() {

  }.property('_currentZoomIndex', '_zoomScale'),
  
  nPages:function() {
    if(!SC.none(this.get('metadata'))) {
      return this.get('metadata').nPages;
    }
    return 0;
  }.property('metadata').cacheable(),

  _urlDidChange: function() { 
    SC.Logger.debug('url changed');
    this.set('currentPage', 1);
  }.observes('url').cacheable()

});
