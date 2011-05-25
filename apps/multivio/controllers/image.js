/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

sc_require('mixins/image.js');
sc_require('controllers/files.js');



/** @class

  This controll the center view to display a pdf content.

  @author jma
  @extends SC.ObjectController
*/
Multivio.imageFileController = SC.ObjectController.create(Multivio.DisplayImage, {

  //Bindings 
  contentBinding: SC.Binding.oneWay('Multivio.fileController'),

  _centerViewWidthBinding: SC.Binding.oneWay('Multivio.mainPage.mainImageView.imageScrollView.contentView.visibleWidth'),

  _centerViewHeightBinding: SC.Binding.oneWay('Multivio.mainPage.mainImageView.imageScrollView.contentView.visibleHeight'),
  
  centerImageBinding: SC.Binding.oneWay('Multivio.mainPage.mainImageView.imageScrollView.contentView.image'),

  currentPage: null,
  currentPageBinding: 'Multivio.filesController.currentIndex',

  _centerImageStatusBinding: SC.Binding.oneWay('Multivio.mainPage.mainImageView.imageScrollView.contentView.status'),

  _appOptionsBinding: SC.Binding.oneWay('Multivio.inputParameters.options'),

  _zoomScale: [0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0],
  mimeRegExp: 'image/.*?',

  _currentZoomIndex: 2,
  _urls: [],

  _currentUrl: function (){
    return "page_nr=%@&url=%@".fmt(this.get('currentPage'), this.get('url'));
  }.property('url', 'currentPage').cacheable(),

  _urlDidChange: function() { 
    var _urls = [];
    var physical = this.get('physicalStructure');
    var mime = this.getPath('metadata.mime');
    if(!SC.none(mime) && mime.match('image/.*?') && !SC.none(physical)) {
      this.set('_urls', physical.getEach('url'));
    }
    this.set('currentPage', 1);
  }.observes('url').cacheable(),
  
  nPages:function() {
    if(!SC.none(this.get('_urls'))) {
      return this.get('_urls').length;
    }
    return 0;
  }.property('metadata').cacheable()

});
