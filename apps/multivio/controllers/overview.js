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

  // TODO: Add your own code here.
  //contentBinding: 'Multivio.currentFileNodeController',
  isPaletteVisible: null,
  isPaletteVisibleBinding: 'Multivio.mainPage.overview.isVisibleInWindow',
  contentBinding: 'Multivio.pdfFileController',
  imageWidth: 140,

  isEnabled: function () {
    return YES;
  }.property(),

  currentUrl: function () {
    if (this.get('isContent')) {
      //pdf check
      if (this.get('isPdf') || this.get('isImage')) {
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

  showPalette: function (key, value) {
    SC.Logger.warn("Key: %@, value: %@".fmt(key, value));
    if (!SC.none(value)) {
      if (!value) {
        Multivio.getPath('mainPage.overview').remove();
      } else {
        //TODO: change this hack!!
        SC.Timer.schedule({
          target: this, 
          action: 'openPalette', 
          interval: 0,
          repeat: NO
        });
        //Multivio.getPath('mainPage.overview').append();
      }
    } else {
      return this.get('isPaletteVisible');
    }
  }.property('isPaletteVisible'),

  openPalette: function () {
    //Multivio.getPath('mainPage.overview').popup(Multivio.getPath('mainPage.mainPane.centerView'), 
    //    SC.PICKER_MENU, [5, -200, 3]);
    Multivio.getPath('mainPage.overview').append();
  }
});


