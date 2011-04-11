// ==========================================================================
// Project:   Multivio.pdfFileController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

sc_require('controllers/pdf_view.js');
/** @class

(Document Your Controller Here)

@extends SC.Object
*/
Multivio.pdfFileController = SC.ObjectController.create(
  /** @scope Multivio.pdfFileController.prototype */ {
  contentBinding: 'Multivio.filesController.currentSelection',
  _renderPrefix: 'server/document/render?',
  rotationAngle: 0,
  currentPage: 1,
  _zoomScale: [0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.5,
    2.0, 3.0, 4.0],
    _currentZoomIndex: 7,

    _defaultWidth: function() {
      var nativeSizes = this.get('metadata').nativeSize;
      var currentPage = this.get('currentPage');
      if(!SC.none(nativeSizes[currentPage])) {
        return nativeSizes[currentPage][0];
      }else{
        return this.get('metadata').defaultNativeSize[0];
      }
    }.property('currentPage', 'metadata').cacheable(),

    _defaultHeight: function() {
      var nativeSizes = this.get('metadata').nativeSize;
      var currentPage = this.get('currentPage');
      if(!SC.none(nativeSizes[currentPage])) {
        return nativeSizes[currentPage][1];
      }else{
        return this.get('metadata').defaultNativeSize[1];
      }
    }.property('currentPage', 'metadata').cacheable(),

    pdfUrl: function() {
      if(!SC.none(this.get('metadata'))){
        if(this.get('metadata').mime === 'application/pdf') {
          var scaleFactor = this.get('_zoomScale')[this.get('_currentZoomIndex')];
          var newWidth = parseInt(this.get('_defaultWidth') * scaleFactor, 10);
          var newHeight = parseInt(this.get('_defaultHeight') * scaleFactor, 10);
          var newUrl = this.get('_renderPrefix') + "page_nr="  + this.get('currentPage') + "&max_width=" + newWidth  + "&max_height=" + newHeight + "&angle=" + this.get("rotationAngle")+ "&url=" +  this.get('url') ;
          return newUrl;
        }
      }else{
        return undefined;
      }
    }.property('url','rotationAngle', '_currentZoomIndex', 'currentPage').cacheable(),

    nPages:function() {
      if(!SC.none(this.get('metadata'))) {
        return this.get('metadata').nPages;
      }
      return 0;
    }.property('metadata'),

    nextPage: function() {
      if(this.get('hasNextPage')) {
        this.set('currentPage', this.get('currentPage') + 1);
      }
    },

    previousPage: function() {
      if(this.get('hasPreviousPage')) {
        this.set('currentPage', this.get('currentPage') - 1);
      }
    },
    showHideThumbnailsPanel: function() {
      Multivio.thumbnailsView.popup();		
    },

    hasNextPage: function() {
      if(this.get('currentPage') < this.get('nPages')) {
        return YES;
      }
      return NO;
    }.property('nPages', 'currentPage'),

    hasPreviousPage: function() {
      if(this.get('currentPage') > 1) {
        return YES;
      }
      return NO;
    }.property('nPages', 'currentPage'),

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
