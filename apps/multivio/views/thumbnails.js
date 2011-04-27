sc_require('views/thumbnail.js');
sc_require('controllers/thumbnails.js');

Multivio.thumbnailsView = SC.PickerPane.design({
  isAnchored: YES,
  isModal: NO,
  layout: { width: 130, bottom: 100},
  canBeClosed: YES,
  contentView: SC.ScrollView.design({
    contentView: SC.SourceListView.design({
      layerId: 'mvo-thumbnails',
      contentValueKey: 'pageNumber',
      contentIconKey: 'url',
      //contentBinding: 'Multivio.pdfThumbnailsController.arrangedObjects',
      //selectionBinding: 'Multivio.pdfThumbnailsController.selection',
      exampleView: Multivio.thumbnailView,
      rowHeight: 130,
      rowSpacing: 10,

      _selectionDidChanged: function() {
        var sel = this.get('selection').firstObject();
        if(!SC.none(sel) && sel.get('pageNumber') > 0) {
          SC.Logger.debug('selection: changed ' + sel.get('pageNumber')); 
          this.scrollToContentIndex(sel.get('pageNumber') - 1);
        }
      }.observes('selection')
    })
  }),

  modalPaneDidClick: function(evt) {
    if(this.get('canBeClosed'))
      {
        return sc_super();
      } else {
        return NO ;
      }
  }
});
