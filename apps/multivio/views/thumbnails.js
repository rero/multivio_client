sc_require('views/thumbnail.js');
sc_require('controllers/thumbnails.js');

Multivio.thumbnailsView = SC.PickerPane.design({
  isAnchored: YES,
  layout: { width: 130, bottom: 100},
  canBeClosed: YES,
  contentView: SC.ScrollView.design({
    contentView: SC.SourceListView.design({
      layerId: 'mvo-thumbnails',
      contentValueKey: 'pageNumber',
      contentIconKey: 'url',
      contentBinding: 'Multivio.thumbnailsController.content',
      selectionBinding: 'Multivio.thumbnailsController.selection',
      exampleView: Multivio.thumbnailView,
      rowHeight: 130,
      rowSpacing: 10,

      _didChange: function() {
        SC.Logger.debug('thumbnailsView: changed'); 
      }.observes('content')
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
