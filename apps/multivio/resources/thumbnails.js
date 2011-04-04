sc_require('views/thumbnail.js');
sc_require('controllers/thumbnails.js');

Multivio.thumbnailsView = SC.ScrollView.design({
  layout: { top: 0, left: 0, bottom: 0, right: 0},
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
});
