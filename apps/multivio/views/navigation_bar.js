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
  action: '_hello',
  target: 'Multivio.NavigationBar',
  layout: { top: 10, left: 0, bottom: 40, width: 50},
    layerId: 'mvo-navigation-bar',
    contentValueKey: 'panel',
    contentIconKey: 'icon',
    selectionBinding: 'Multivio.navigationController.selection',
    contentBinding: 'Multivio.navigationController.content',
    exampleView: Multivio.NavigationItem,
    rowHeight: 35,
    rowSpacing: 10,

    _hello: function() {
      SC.Logger.debug('hello');
    },
      mouseDown: function(ev) {
        var status = sc_super();
        SC.Logger.debug('hello');
        return status;
      },


    _didChange: function() {
     SC.Logger.debug('itemView: changed'); 
    }.observes('selection')

});
