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
/*
var menuItems = [ 
	{ icon:static_url("images/icons/24x24/help_dark_24x24.png"), keyEquivalent: 'ctrlh' }, 
	{ icon:static_url("images/icons/24x24/thumbnails_dark_24x24.png"), keyEquivalent: 'ctrlt', itemTargetKey: Multivio.pdfViewController, itemActionKey: 'showHideThumbnailsPanel' }
	];
Multivio.NavigationBar = SC.MenuPane.create({ 
items: menuItems,
itemHeight: 35
});
Multivio.NavigationBar.becomeMenuPane();
//Multivio.NavigationBar.becomesFirstResponder();
//*/
Multivio.NavigationBar = SC.SourceListView.design({
  selectOnMouseDown: YES,
  actOnSelect: YES,
  layout: { top: 10, left: 0, bottom: 40, width: 50},
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
