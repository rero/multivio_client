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
  _renderPrefix: 'server/document/render?',
  rotationAngle: 0,
  _defaultWidth: 400,
  _defaultHeight: 600,
  _zoomScale: [0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.5,
            2.0, 3.0, 4.0],
  _currentZoomIndex: 7,
  
  pdfUrl: function() {
    SC.Logger.debug('pdfViewController: url changed: ');
    if(!SC.none(this.get('metadata'))){
      if(this.get('metadata').mime === 'application/pdf') {
        var scaleFactor = this.get('_zoomScale')[this.get('_currentZoomIndex')];
        var newWidth = this.get('_defaultWidth') * scaleFactor;
        var newHeight = this.get('_defaultHeight') * scaleFactor;
        var newUrl = this.get('_renderPrefix') + "max_width=" + newWidth  + "&max_height=" + newHeight + "&angle=" + this.get("rotationAngle")+ "&url=" +  this.get('url') ;
        SC.Logger.debug('pdfViewController: new url: ' + newUrl );
        return newUrl;
      }
    }else{
      return undefined;
    }
  }.property('url','rotationAngle', '_currentZoomIndex').cacheable(),

  rotateLeft: function() {
    var currentAngle = this.get('rotationAngle');
    this.set('rotationAngle', (currentAngle % 360) - 90);
  },

  nextZoom: function() {
    if(this.get('hasNextZoom')){
      this.set('_currentZoomIndex', this.get('_currentZoomIndex') + 1);
    }
  },

  previousZoom: function() {
    if(this.get('hasPreviousZoom')){
      this.set('_currentZoomIndex', this.get('_currentZoomIndex') - 1);
    }
  },

  hasNextZoom: function() {
    if(this.get('_currentZoomIndex') < (this.get('_zoomScale').length - 2)) {
      return YES;
    }
    return NO;
  }.property('_currentZoomIndex'),
  
  hasPreviousZoom: function() {
    if(this.get('_currentZoomIndex') > 0) {
      return YES;
    }
    return NO;
  }.property('_currentZoomIndex'),

  rotateRight: function() {
    var currentAngle = this.get('rotationAngle');
    this.set('rotationAngle', (currentAngle % 360) + 90);
  }
});
