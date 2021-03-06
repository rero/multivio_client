/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('mixins/image.js');



/** @class

  This controll the center view to display a pdf content.

  @author jma
  @extends SC.ObjectController
*/
Multivio.imageFileController = SC.ObjectController.create(Multivio.DisplayImage, {
  content: null,
  //Bindings 
  //contentBinding: SC.Binding.oneWay('Multivio.fileController'),

  _centerViewWidthBinding: SC.Binding.oneWay('Multivio.mainPage.mainImageView.imageScrollView.contentView.visibleWidth'),

  _centerViewHeightBinding: SC.Binding.oneWay('Multivio.mainPage.mainImageView.imageScrollView.contentView.visibleHeight'),
  
  centerImageBinding: SC.Binding.oneWay('Multivio.mainPage.mainImageView.imageScrollView.contentView.image'),

  currentPage: 1,
  //currentPageBinding: 'Multivio.filesController.currentIndex',

  _centerImageStatusBinding: SC.Binding.oneWay('Multivio.mainPage.mainImageView*imageView.status'),

  _appOptionsBinding: SC.Binding.oneWay('Multivio.inputParameters.options'),

  _zoomScale: [0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0],

  _currentZoomIndex: 2,
  _urls: [],

  _currentUrl: function () {
    this.set('_urls', [this.get('url')]);
    this.set('currentPage', 1);
    return "url=%@".fmt(this.get('url'));
  }.property('url'),

  
  nPages: function () {
    if (!SC.none(this.get('_urls'))) {
      return this.get('_urls').length;
    }
    return 0;
  }.property('_urls').cacheable(),
  
  infoMessage: function () {
    return "Image";
  }.property('currentPage', 'nPages')

});
