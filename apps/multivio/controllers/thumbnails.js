/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('controllers/pdf.js');
sc_require('controllers/image.js');

/**
  @namespace
  @mixin

  This mixin does the major work of a thumbnail controller. It can be included
  by any controller implementing thumbnail behaviour for an actual file type.
  
  The methods _nPagesDidChange() and _thumbnailURL() must be defined in each
  actual controller that includes this mixin.
*/
Multivio.thumbnailsControllerMixin = {

  /** @field */
  content: [],

  /**
    @field
    This property will be bound to a content controller
  */
  nPages: null,

  /**
    @field
    This property will be bound to a content controller
  */
  currentPage: 1,

  /**
    @field
    @type String
    Possible values: 'list' (default), 'grid'
  */
  thumbnailMode: 'list',

  /** @private */
  _appOptions: null,
  _appOptionsBinding: SC.Binding.oneWay('Multivio.inputParameters.options'),

  /** @private */
  _thumbnailPrefix: function () {
    var server = 'server';
    if (!SC.none(this.get('_appOptions').server)) {
      server = this.get('_appOptions').server; 
    }
    return '/' + server + "/document/render?max_width=100&max_height=100";
  }.property('_appOptions').cacheable(),

  /** @private */
  userClicked: function (pane) {
    var selection = pane.getPath('selection.firstObject');
    if (selection) {
      this.set('currentPage', selection.get('pageNumber'));
    }
  },

  /** @private */
  _currentPageDidChange: function () {
    var currentPage = this.get('currentPage');
    if (currentPage) {
      var toSelect = this.objectAt(currentPage - 1);
      this.selectObject(toSelect);
    }
  }.observes('currentPage').cacheable(),

  /** @private */
  _removeAll: function () {
    if (this.get('length') > 0) {
      this.removeAt(0, this.get('length')); 
    }
  },

  /** @private */
  _updateThumbnails: function () {
    this._removeAll();
    var nP = this.get('nPages');
    if (!SC.none(nP) && nP >= 0) {
      var pageNr = 1, i;
      for (i = 0; i < nP; i++) {
        this.pushObject(SC.Object.create({
          url: this._thumbnailURL(pageNr),
          pageNumber: pageNr
        }));
        pageNr += 1;
      }
    }
  },

  /**
    Adjust the thumbnail palette layout according to current mode:
    'list' or 'grid'
  */
  _adjustThumbnailLayoutToMode: function () {
    var pal = Multivio.getPath('mainPage.thumbnailsView');
    var vframe = Multivio.getPath('mainPage.mainPane.frame');
    if (this.get('thumbnailMode') === 'list') {
      pal.adjust('width', 150);
    }
    else {
      // put the thumbnail grid width at 60% of the whole window width
      pal.adjust('width', parseInt(vframe.width * 0.6, 10));
    }
  }.observes('thumbnailMode', 'Multivio.mainPage.mainPane.frame')

};


/** @class

  This is the thumbnailView controller for a list of images.

  @see Multivio.thumbnailsControllerMixin
  @author jma
  @extends SC.ArrayController
*/
Multivio.imageThumbnailsController = SC.ArrayController.create(
    Multivio.thumbnailsControllerMixin, {

  /**
    Binds a property declared in thumbnailsControllerMixin
  */
  nPagesBinding: SC.Binding.oneWay('Multivio.imageFileController.nPages'),

  /**
    Binds a property declared in thumbnailsControllerMixin
  */
  currentPageBinding: 'Multivio.imageFileController.currentPage',

  /* The URLs of the images */
  urls: [],
  urlsBinding: SC.Binding.oneWay('Multivio.imageFileController._urls'),

  /* Observe changes and update the thumbnails */
  _nPagesDidChange: function () {
    // calls a method declared in thumbnailsControllerMixin
    this._updateThumbnails();
  }.observes('nPages', 'urls').cacheable(),

  /**
    The URL for the thumbnail of a given page of the PDF file
  */
  _thumbnailURL: function (pageNr) {
    return "%@&url=%@".fmt(this.get('_thumbnailPrefix'), this.get('urls')[pageNr - 1]);
  }

});

/** @class

  This is the thumbnailView controller for a PDF.
  
  @see Multivio.thumbnailsControllerMixin
  @author jma
  @extends SC.ArrayController
*/
Multivio.pdfThumbnailsController = SC.ArrayController.create(
    Multivio.thumbnailsControllerMixin, {
  
  /**
    Binds a property declared in thumbnailsControllerMixin
  */
  nPagesBinding: SC.Binding.oneWay('Multivio.pdfFileController.nPages'),

  /**
    Binds a property declared in thumbnailsControllerMixin
  */
  currentPageBinding: 'Multivio.pdfFileController.currentPage',

  /* The URL of the PDF file */
  url: null,
  urlBinding: SC.Binding.oneWay('Multivio.pdfFileController.url'),

  /* Observe changes and update the thumbnails */
  _nPagesDidChange: function () {
    // calls a method declared in thumbnailsControllerMixin
    this._updateThumbnails();
  }.observes('nPages', 'url').cacheable(),

  /**
    The URL for the thumbnail of a given image
  */
  _thumbnailURL: function (pageNr) {
    return "%@&page_nr=%@&url=%@".fmt(this.get('_thumbnailPrefix'), pageNr, this.get('url'));
  }

});
