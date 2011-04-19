// ==========================================================================
// Project:   Multivio.pdfFileController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

sc_require('views/pdf_view.js');
/** @class

(Document Your Controller Here)

@extends SC.Object
*/
Multivio.ZOOM_MODE = 'zoom';
Multivio.FIT_WIDTH_MODE = 'fit-width';
Multivio.FIT_ALL_MODE = 'fit-all';

Multivio.pdfFileController = SC.ObjectController.create(
  /** @scope Multivio.pdfFileController.prototype */ {

  //Bindings 
  contentBinding: 'Multivio.filesController.currentSelection',
  _centerViewWidth: 0,
  _centerViewHeight: 0,
  _centerViewWidthBinding: 'Multivio.mainPage.mainPdfView.pdfScrollView.contentView.visibleWidth',
  _centerViewHeightBinding: 'Multivio.mainPage.mainPdfView.pdfScrollView.contentView.visibleHeight',

  _centerImageStatus: null,
  _centerImageStatusBinding: 'Multivio.mainPage.mainPdfView.pdfScrollView.contentView.status',

  _appOptions: null,
  _appOptionsBinding: 'Multivio.inputParameters.options',
  rotationAngle: 0,
  mode: Multivio.FIT_ALL_MODE, //fitWidth, zoom, fit, native
  currentPage: 1,
  _zoomScale: [0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.5,
    2.0, 3.0, 4.0],
    _currentZoomIndex: 7,


    pdfUrl: function() {
      if(!SC.none(this.get('metadata'))){
        if(this.get('metadata').mime === 'application/pdf') {
          var scaleFactor = this.get('_zoomScale')[this.get('_currentZoomIndex')];
          var newUrl, newWidth, newHeight;
          switch(this.get('mode')) {
            case Multivio.FIT_WIDTH_MODE:
              newWidth = parseInt(this.get('_centerViewWidth'), 10);
            newUrl = this.get('_renderPrefix') + "page_nr="  + this.get('currentPage') + "&max_width=" + newWidth  + "&angle=" + this.get("rotationAngle")+ "&url=" +  this.get('url') ;
            break;
            case Multivio.FIT_ALL_MODE:
              newWidth = parseInt(this.get('_centerViewWidth'), 10);
            newHeight = parseInt(this.get('_centerViewHeight'), 10);
            newUrl = this.get('_renderPrefix') + "page_nr="  + this.get('currentPage') + "&max_width=" + newWidth  + "&max_height=" + newHeight + "&angle=" + this.get("rotationAngle")+ "&url=" +  this.get('url') ;
            break;
            default:
              newWidth = parseInt(this.get('_defaultWidth') * scaleFactor, 10);
            newHeight = parseInt(this.get('_defaultHeight') * scaleFactor, 10);
            newUrl = this.get('_renderPrefix') + "page_nr="  + this.get('currentPage') + "&max_width=" + newWidth  + "&max_height=" + newHeight + "&angle=" + this.get("rotationAngle")+ "&url=" +  this.get('url') ;
          }
          return newUrl;
        }
      }else{
        return undefined;
      }
    }.property('url', 'rotationAngle', '_currentZoomIndex', 'currentPage', '_centerViewWidth', '_centerViewHeight','mode').cacheable(),

    _renderPrefix: function () {
      var server = 'server.test';
      if(!SC.none(this.get('_appOptions').server)) {
        server = this.get('_appOptions').server; 
      }
      return '/' + server + "/document/render?";
    }.property('_appOptions'),

    showHideThumbnailsPanel: function() {
      Multivio.thumbnailsView.popup();		
    },

    loadingPage: function() {
      var status = this.get('_centerImageStatus');
      SC.Logger.debug('------> loadingPage ' + status);
      if(status === SC.IMAGE_STATE_LOADING) {
        return YES;
      }else{
        return NO;
      }
    }.property('_centerImageStatus'),

    //********************// 
    //        PAGES       //
    //********************// 
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

    nPages:function() {
      if(!SC.none(this.get('metadata'))) {
        return this.get('metadata').nPages;
      }
      return 0;
    }.property('metadata'),

    _urlDidChange: function() { 
      SC.Logger.debug('url changed');
      this.set('currentPage', 1);
    }.observes('url'),


    //********************// 
    //        ZOOM        //
    //********************// 

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

    fitWidth: function(key, value) {
      SC.Logger.debug('fitWidth: ' + value);
      if(SC.none(value)) {
        if (this.get('mode') === Multivio.FIT_WIDTH_MODE) {
          return YES;
        } else {
          return NO;
        }
      }else {
        if(value) {
          this.set('mode', Multivio.FIT_WIDTH_MODE);
        } else {
          this.set('mode', Multivio.ZOOM_MODE);
        }
      }
    }.property('mode').cacheable(),

    fitAll: function(key, value) {
      SC.Logger.debug('fitAll: ' + value);
      if(SC.none(value)) {
        if (this.get('mode') === Multivio.FIT_ALL_MODE) {
          return YES;
        } else {
          return NO;
        }
      }else {
        if(value) {
          this.set('mode', Multivio.FIT_ALL_MODE);
        } else {
          this.set('mode', Multivio.ZOOM_MODE);
        }
      }
    }.property('mode').cacheable(),

    nextZoom: function() {
      if(this.get('mode') !== Multivio.ZOOM_MODE) {
        var correspondingZoom = this._getNearestZoomIndex(NO);
        this.set('_currentZoomIndex', correspondingZoom);
        this.set('mode', Multivio.ZOOM_MODE);
        return;
      } else {
        if(this.get('hasNextZoom')){
          this.set('_currentZoomIndex', this.get('_currentZoomIndex') + 1);
        }
      }
    },

    previousZoom: function() {
      if(this.get('mode') !== Multivio.ZOOM_MODE) {
        var correspondingZoom = this._getNearestZoomIndex(YES);
        this.set('_currentZoomIndex', correspondingZoom);
        this.set('mode', Multivio.ZOOM_MODE);
        return;
      } else {
        if(this.get('hasPreviousZoom')){
          this.set('_currentZoomIndex', this.get('_currentZoomIndex') - 1);
        }
      }
    },

    _getNearestZoomIndex: function(roundedDown) {
      //image with at 100% zoom
      var nativeWidth = this.get('_defaultWidth');
      //current Image Width
      var winWidth = Multivio.getPath('mainPage.mainPdfView.pdfScrollView.contentView').get('image').width;
      var desiredNumber = winWidth/nativeWidth;

      var zooms = this.get('_zoomScale');
      var nearest = -1;
      var bestDistanceFoundYet = Number.MAX_VALUE;
      // We iterate on the array...
      for (var i = 0; i < zooms.length; i++) {
        // if we found the desired number, we return it.
        if (zooms[i] === desiredNumber) {
          nearest = i;
        } else {
          // else, we consider the difference between the desired number and the current number in the array.
          var d = Math.abs(desiredNumber - zooms[i]);
          SC.Logger.debug('distance: ' + d + ' desi: ' + desiredNumber + ' actual ' + zooms[i] + " nearest " + nearest);
          if (d < bestDistanceFoundYet) {
            // For the moment, this value is the nearest to the desired number...
            nearest = i;
            bestDistanceFoundYet = d;
          }
        }
      }
      SC.Logger.debug('Best index: ' + nearest);
      if(roundedDown) {
        if(nearest === 0 || desiredNumber > zooms[nearest]) {
          return nearest;
        }else {
          return nearest-1;
        }
      }else{
        if(nearest === (zooms.length - 1)  || desiredNumber < zooms[nearest]) {
          return nearest;
        }else {
          return nearest+1;
        }
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

    //********************// 
    //        ROTATION   //
    //********************// 
    rotateLeft: function() {
      var currentAngle = this.get('rotationAngle');
      this.set('rotationAngle', (currentAngle % 360) - 90);
    },

    rotateRight: function() {
      var currentAngle = this.get('rotationAngle');
      this.set('rotationAngle', (currentAngle % 360) + 90);
    }
});
