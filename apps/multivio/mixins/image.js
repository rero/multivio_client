
Multivio.ZOOM_MODE = 'zoom';
Multivio.FIT_WIDTH_MODE = 'fit-width';
Multivio.FIT_ALL_MODE = 'fit-all';

Multivio.DisplayImage = {
  _centerViewWidth: 0,
  _centerViewHeight: 0,
  _centerImageStatus: null,
  _appOptions: null,
  rotationAngle: 0,
  mode: Multivio.FIT_ALL_MODE, //fitWidth, zoom, fit, native
  _zoomScale: [],
  _currentZoomIndex: -1,
  centerImage: null,

  currentUrl: function() {

    //need metadata to get url
    if(!SC.none(this.get('metadata'))){
      
      //pdf check
      if(this.getPath('metadata.mime').match(this.get('mimeRegExp'))) {

        var scaleFactor = this.get('_zoomScale')[this.get('_currentZoomIndex')];
        var newUrl, newWidth, newHeight;
        var angle = this.get('rotationAngle');
        
        //different zoom mode
        switch(this.get('mode')) {
          case Multivio.FIT_WIDTH_MODE:
            newWidth = parseInt(this.get('_centerViewWidth'), 10);
            if(angle % 180) {
              newUrl = "%@max_height=%@&angle=%@&%@".fmt(this.get('_renderPrefix'), newWidth, angle, this.get('_currentUrl'));
            } else {
              newUrl = "%@max_width=%@&angle=%@&%@".fmt(this.get('_renderPrefix'), newWidth, angle, this.get('_currentUrl'));
            }
            break;
          case Multivio.FIT_ALL_MODE:
            if(angle % 180) {
              newHeight = parseInt(this.get('_centerViewWidth'), 10);
              newWidth = parseInt(this.get('_centerViewHeight'), 10);
            }else {
              newWidth = parseInt(this.get('_centerViewWidth'), 10);
              newHeight = parseInt(this.get('_centerViewHeight'), 10);
            }
            newUrl = "%@max_width=%@&max_height=%@&angle=%@&%@".fmt(this.get('_renderPrefix'), newWidth, newHeight, angle, this.get('_currentUrl'));
            break;
          default:
            newWidth = parseInt(this.get('_defaultWidth') * scaleFactor, 10);
            newHeight = parseInt(this.get('_defaultHeight') * scaleFactor, 10);
            newUrl = "%@max_width=%@&max_height=%@&angle=%@&%@".fmt(this.get('_renderPrefix'), newWidth, newHeight, angle, this.get('_currentUrl'));
        }
        return newUrl;
      }
    }else{
      return undefined;
    }
  }.property( 'rotationAngle', '_currentZoomIndex', '_currentUrl' ,'_centerViewWidth', '_centerViewHeight', 'mode').cacheable(),

  _renderPrefix: function () {
    var server = 'server.test';
    if(!SC.none(this.get('_appOptions').server)) {
      server = this.get('_appOptions').server; 
    }
    return '/' + server + "/document/render?";
  }.property('_appOptions').cacheable(),

  loadingPage: function() {
    var status = this.get('_centerImageStatus');
    SC.Logger.debug('------> loadingPage ' + status);
    if(status === SC.IMAGE_STATE_LOADING) {
      return YES;
    }else{
      return NO;
    }
  }.property('_centerImageStatus').cacheable(),
  
  //********************// 
  //        PAGES       //
  //********************// 
  hasNextPage: function() {
    if(this.get('currentPage') < this.get('nPages')) {
      return YES;
    }
    return NO;
  }.property('nPages', 'currentPage').cacheable(),

  hasPreviousPage: function() {
    if(this.get('currentPage') > 1) {
      return YES;
    }
    return NO;
  }.property('nPages', 'currentPage').cacheable(),

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
  }.property('metadata').cacheable(),
  
  //********************// 
  //        ZOOM        //
  //********************// 

  _defaultWidth: function() {
    if(SC.none(this.get('metadata')) ||
      SC.none(this.getPath('metadata.defaultNativeSize'))) {
      return 0;
    }
    var nativeSizes = this.get('metadata').nativeSize;
    var currentPage = this.get('currentPage');
    if(!SC.none(nativeSizes) && !SC.none(nativeSizes[currentPage])) {
      return nativeSizes[currentPage][0];
    }else{
      return this.get('metadata').defaultNativeSize[0];
    }
  }.property('currentPage', 'metadata').cacheable(),
  
  hasThumbnails: function() {
    if(this.get('nPages') > 1){
      return YES;
    }
    return NO;
  }.property('nPages').cacheable(),

  _defaultHeight: function() {
    if(SC.none(this.get('metadata')) ||
      SC.none(this.getPath('metadata.nativeSize'))) {
      return 0;
    }
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
    var winWidth = 0;
    if(this.get('centerImage')) {
      winWidth = this.get('centerImage').width;
    }

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
        //SC.Logger.debug('distance: ' + d + ' desi: ' + desiredNumber + ' actual ' + zooms[i] + " nearest " + nearest);
        if (d < bestDistanceFoundYet) {
          // For the moment, this value is the nearest to the desired number...
          nearest = i;
          bestDistanceFoundYet = d;
        }
      }
    }
    //SC.Logger.debug('Best index: ' + nearest);
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
    var currentZoomIndex = this.get('_currentZoomIndex');
    if(this.get('mode') !== Multivio.ZOOM_MODE) {
      currentZoomIndex = this._getNearestZoomIndex(YES);
    }
    if(currentZoomIndex < (this.get('_zoomScale').length - 2)) {
      return YES;
    }
    return NO;
  }.property('_currentZoomIndex', '_centerImageStatus').cacheable(),

  hasPreviousZoom: function() {
    var currentZoomIndex = this.get('_currentZoomIndex');
    if(this.get('mode') !== Multivio.ZOOM_MODE) {
      currentZoomIndex = this._getNearestZoomIndex(NO);
    }
    if(this.get('_currentZoomIndex') > 0) {
      return YES;
    }
    return NO;
  }.property('_currentZoomIndex', '_centerImageStatus').cacheable(),

  //********************// 
  //        ROTATION   //
  //********************// 
  rotateLeft: function() {
    var currentAngle = this.get('rotationAngle');
    this.set('rotationAngle', (currentAngle - 90) % 360);
  },

  rotateRight: function() {
    var currentAngle = this.get('rotationAngle');
    this.set('rotationAngle', (currentAngle + 90) % 360);
  }

};
