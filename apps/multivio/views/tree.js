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
  displayProperties: ['file_position', 'label', 'labelPage'],
  //layout: {height: 40, centerX: 0, centerY: 0, width: 200}
  classNames: ['mvo-toc-entry'],

  autoResize: function() {
    // get the layer
    var layer = this.get("layer");

    // return if there wasn't one (no font sizes, etc. to use with measuring)
    if (!layer) {
      return;
    }

      // get metrics, using layer as example element
      var labelSize = SC.metricsForString(this.get("content").get('labelPage'), layer);
      var iconWidth = 16;
      var newWidth = labelSize.width + iconWidth + (this.get('outlineLevel') + 1) * this.get('outlineIndent');
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
  layerId: 'mvo-tree-view',
  canBeClosed: YES,
  contentView: SC.ScrollView.design({
    contentView: SC.SourceListView.design({
      rowHeight: 18,
      rowSpacing: 4,
      contentValueKey: 'labelPage',
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
