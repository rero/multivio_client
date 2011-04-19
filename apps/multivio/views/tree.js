// ==========================================================================
// Project:   Multivio.TreeView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

(Document Your View Here)

@extends SC.View
*/
sc_require('controllers/tree.js');
Multivio.TreeViewItem = SC.ListItemView.extend(
  /** @scope Multivio.NavigationItem.prototype */ {

  // TODO: Add your own code here.
  displayProperties: ['file_position', 'label'],
  //layout: {height: 40, centerX: 0, centerY: 0, width: 200}

  autoResize: function() {
    // get the layer
    var layer = this.get("layer");

    // return if there wasn't one (no font sizes, etc. to use with measuring)
    if (!layer) {
      return;
    }

      // get metrics, using layer as example element
      //var labelSize = SC.metricsForString(this.get("content").label, layer);
      var labelSize = SC.metricsForString(this.get('content').label, '"Helvetica Neue", Arial, Helvetica, Geneva, sans-serif;');
      //SC.Logger.debug('%@ vs %@'.fmt(labelSize.width, metrics.width));
      var iconWidth = 16;
      var newWidth = labelSize.width + iconWidth + (this.get('outlineLevel') + 1) * this.get('outlineIndent');
      // 10 is an arbitrary value to give a little padding.
      this.adjust("width", newWidth);
      if (this.get('parentView').get('frame').width < newWidth) {
        this.get('parentView').adjust('width', newWidth);
      }
  },

  _layerDidChange: function () {
    this.autoResize();
  }.observes('layer')


});

Multivio.TreeView = SC.PickerPane.design({
  isAnchored: YES,
  isModal: NO,
  layout: { width: 314, bottom: 100},
  canBeClosed: YES,
  contentView: SC.ScrollView.design({
    hasHorizontalScroller: YES,
    hasVerticalScroller: YES,
    contentView: SC.SourceListView.design({
      contentValueKey: 'label',
      contentBinding: 'Multivio.treeController.arrangedObjects',
      selectionBinding: 'Multivio.treeController.selection',
      exampleView: Multivio.TreeViewItem
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
