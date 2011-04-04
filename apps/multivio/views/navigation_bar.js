// ==========================================================================
// Project:   Multivio.NavigationBar
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
sc_require('views/navigation_item.js');
sc_require('controllers/navigation.js');

Multivio.NavigationBar = SC.SourceListView.design({
  selectOnMouseDown: YES,
  actOnSelect: YES,
  layout: { top: 0, left: 0, bottom: 0, right: 0},
    layerId: 'mvo-navigation-bar',
    contentValueKey: 'panel',
    contentIconKey: 'icon',
    selectionBinding: 'Multivio.navigationController.selection',
    contentBinding: 'Multivio.navigationController.content',
    exampleView: Multivio.NavigationItem,
    rowHeight: 35,
    rowSpacing: 10,

    _didChange: function() {
     SC.Logger.debug('itemView: changed'); 
    }.observes('content')

});
