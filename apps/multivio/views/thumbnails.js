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
  layout: {left: 45, top: 10, width: 150, bottom: 100},
  classNames: 'mvo-palette-pane'.w(),
  isAnchored: YES,
  canBeClosed: YES,
  contentView: SC.View.design({

    childViews: [
      'thumbnailScrollView',
      'thumbnailListModeButtom',
      'thumbnailGridModeButtom'
    ],

    thumbnailScrollView: SC.ScrollView.design(Multivio.innerGradientThinTopBottom, {
      layout: { left: 0, top: 0, right: 0, bottom: 42 },
      contentView: SC.GridView.design({
        layerId: 'mvo-thumbnails',
        contentValueKey: 'pageNumber',
        contentIconKey: 'url',
        //contentBinding: 'Multivio.pdfThumbnailsController.arrangedObjects',
        //selectionBinding: 'Multivio.pdfThumbnailsController.selection',
        actOnSelect: YES,
        action: 'userClicked',
        target: 'Multivio.currentThumbnailController',
        exampleView: Multivio.thumbnailView,
        rowHeight: 130,
        rowSpacing: 10,
        columnWidth: 130,

        _selectionDidChanged: function () {
          var selection = this.getPath('selection').firstObject();
          if (selection && selection.get('pageNumber') > 0) {
            SC.Logger.debug('selection: changed ' + selection.get('pageNumber')); 
            this.scrollToContentIndex(selection.get('pageNumber') - 1);
          }
        }.observes('selection')
      })
    }),

    thumbnailListModeButtom: SC.ImageButtonView.design({
      layout: { height: 32, bottom: 4, width: 32, left: 2 },
      image: 'thumbnail_list_mode',
      title: 'thumbnailListMode',
      buttonBehavior: SC.TOGGLE_ON_BEHAVIOR,
      toolTip: '_ThumbnailListMode'.loc(),
      valueBinding: 'Multivio.currentThumbnailController.thumbnailMode',
      toggleOnValue: 'list'
    }),

    thumbnailGridModeButtom: SC.ImageButtonView.design({
      layout: { height: 32, bottom: 4, width: 32, left: 36 },
      name: 'thumbnailGridMode',
      toolTip: '_ThumbnailGridMode'.loc(),
      image: 'thumbnail_grid_mode',
      valueBinding: 'Multivio.currentThumbnailController.thumbnailMode',
      buttonBehavior: SC.TOGGLE_ON_BEHAVIOR,
      toggleOnValue: 'grid'
    })

  }),

  modalPaneDidClick: function (evt) {
    return this.get('canBeClosed') ? sc_super() : NO;
  }
});
