// ==========================================================================
// Project:   Multivio.overviewController
// Copyright: @2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
sc_require('views/overview.js');
Multivio.overviewController = SC.ObjectController.create({

  isPaletteVisible: null,
  isPaletteVisibleBinding: 'Multivio.mainPage.overview.isVisibleInWindow',
  contentBinding: 'Multivio.pdfFileController',
  imageWidth: 140,

  /**
    @field
    @type Boolean
  */
  isEnabled: function () {
    return YES;
  }.property(),

  /**
    @field
    @type Boolean
  */
  showPalette: null,

  /**
    @field
    @type String
  */
  currentUrl: function () {
    if (this.get('isContent')) {
      //pdf check
      if (this.get('isPDF') || this.get('isImage')) {
        var scaleFactor = this.get('_zoomScale')[this.get('_currentZoomIndex')],
          newUrl,
          angle = -this.get('rotationAngle');
        return "%@max_width=%@&max_height=%@&angle=%@&%@"
          .fmt(this.get('_renderPrefix'), this.get('imageWidth'), 
               this.get('imageWidth'), angle, this.get('_currentUrl'));
      }
    } 
    return undefined;
  }.property('rotationAngle', '_currentUrl'),

  /** @private */
  _showPaletteDidChange: function () {
    var showPalette = this.get('showPalette');
    if (showPalette) {
      Multivio.getPath('mainPage.overview').open();
    } else {
      Multivio.getPath('mainPage.overview').close();
    }
  }.observes('showPalette')
});


