/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('mixins/interface.js');
sc_require('views/thumbnail.js');
sc_require('controllers/thumbnails.js');

Multivio.thumbnailsView = SC.PalettePane.design({
  layout: {left: 45, top: 15, width: 130, bottom: 100},
  classNames: 'mvo-palette-pane'.w(),
  //isAnchored: NO,
  isModal: NO,
  canBeClosed: YES,
  contentView: SC.ScrollView.design(Multivio.innerGradientThinTopBottom, {
    contentView: SC.SourceListView.design({
      layerId: 'mvo-thumbnails',
      contentValueKey: 'pageNumber',
      contentIconKey: 'url',
      //contentBinding: 'Multivio.pdfThumbnailsController.arrangedObjects',
      //selectionBinding: 'Multivio.pdfThumbnailsController.selection',
      actOnSelect: YES,
      action: 'userClicked',
      target: 'Multivio.pdfThumbnailsController',
      exampleView: Multivio.thumbnailView,
      rowHeight: 130,
      rowSpacing: 10,

      _selectionDidChanged: function () {
        var selection = this.getPath('selection').firstObject();
        if (selection && selection.get('pageNumber') > 0) {
          SC.Logger.debug('selection: changed ' + selection.get('pageNumber')); 
          this.scrollToContentIndex(selection.get('pageNumber') - 1);
        }
      }.observes('selection')
    })
  }),

  modalPaneDidClick: function (evt) {
    return this.get('canBeClosed') ? sc_super() : NO;
  }
});
