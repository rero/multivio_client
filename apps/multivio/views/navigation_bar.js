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
  allowDeselectAll: YES,
  useToggleSelection: YES,
  selectOnMouseDown: YES,
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

    //bug correction
    mouseDown: function(ev) {
      var status = sc_super();
      var itemView      = this.itemViewForEvent(ev);
      SC.Logger.debug('hello');
      // recieved a mouseDown on the collection element, but not on one of the 
      // childItems... unless we do not allow empty selections, set it to empty.
      // Toggle the selection if selectOnMouseDown is true
      if (this.get('useToggleSelection')) {
        if (this.get('selectOnMouseDown')) {
          if (!itemView) {
            if (this.get('allowDeselectAll')) {
              this.select(null, false);
            }
            return YES ;
          }
        }
      }
      return status;
    },


    _didChange: function() {
     SC.Logger.debug('itemView: changed'); 
    }.observes('selection')

});
