/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/** @class

(Document Your View Here)

@extends SC.View
*/

sc_require('mixins/interface.js');
sc_require('controllers/tree.js');

Multivio.TreeViewItem = SC.ListItemView.extend(SC.AutoResize, {

  // TODO: Add your own code here.
  classNames: ['mvo-toc-entry'],
  supportsAutoResize: YES,
  displayProperties: ['title', 'icon'],
  contentIconKey: 'icon',
  contentValueKey: 'title',
  iconWidth: 32,
  hasContentIcon: function () {
    var content = this.get('content');
    return content.get('icon') ? YES : NO;
  }.property('content.icon'),


  autoResizeText: function () {
    return this.getPath('content.title');
  }.property('content'),

  autoResizeLayer: function () {
    return this.get('layer');
  }.property(),

  autoResizePadding: function () {
    var width = 0;
    width = this.get('iconWidth') + (this.get('outlineLevel') + 1) * this.get('outlineIndent');
    return {width: width, height: 0};
  }.property('outlineLevel', 'outlineIndent', 'iconWidth').cacheable(),

  _measureSizeDidChange: function () {
    var contentWidth = this.get('measuredSize').width;
    var parentView = this.get('parentView');
    if (contentWidth > parentView.get('frame').width) {
      parentView.adjust('width', contentWidth);
    }
  }.observes('measuredSize')
});

Multivio.TreeView = SC.PalettePane.design({
  isAnchored: YES,
  //isModal: NO,
  layout: {left: 45, top: 10, width: 314, bottom: 100},
  classNames: 'mvo-palette-pane'.w(),
  layerId: 'mvo-tree-view',
  canBeClosed: YES,
  contentView: SC.ScrollView.design(Multivio.innerGradientThinTopBottom, {
    contentView: SC.SourceListView.design({
      rowHeight: 18,
      rowSpacing: 4,
      actOnSelect: YES,
      action: 'userClicked',
      target: 'Multivio.treeController',
      contentValueKey: 'title',
      contentBinding: 'Multivio.treeController.arrangedObjects',
      selectionBinding: 'Multivio.treeController.selection',
      exampleView: Multivio.TreeViewItem

    })
  }),

  modalPaneDidClick: function (evt) {
    return this.get('canBeClosed') ? sc_super() : NO;
  }

});
