// ==========================================================================
// Project:   Multivio.navigationController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
sc_require('views/help.js');
sc_require('views/thumbnails.js');
Multivio.navigationController = SC.ArrayController.create(
/** @scope Multivio.navigationController.prototype */ {
  // TODO: Add your own code here.
  currentOpenedPanel: undefined,
  content: [
    SC.Object.create({
      panel: 'helpPane',
      icon: static_url("images/icons/24x24/help_light_24x24.png")
    }),

    SC.Object.create({
      panel: 'thumbnailsView',
      icon: static_url("images/icons/24x24/thumbnails_light_24x24.png")
    }),
    
    SC.Object.create({
      panel: 'mainPdfView.bottomToolbar',
      icon: static_url("images/icons/24x24/show_toolbar_light_24x24.png")
    })

  ],

  _selectionDidChange: function() {
    var panelName;
    var sel = this.get('selection');
    SC.Logger.debug('navigationBar: selection changed! ' + sel.length());
    if(!SC.none(sel) && sel.length() > 0)  {
      panelName = sel.firstObject().get('panel');
      oldPanelName = this.get('currentOpenedPanel');
      if(!SC.none(oldPanelName) && panelName !== oldPanelName) {
        Multivio.getPath('mainPage.'+oldPanelName).remove();
      }

      this.set('currentOpenedPanel', panelName);
      SC.Logger.debug('Panel Name: ' + panelName);
      //Multivio.getPath('mainPage.thumbnailsView').set('canBeClosed', NO);
      Multivio.getPath('mainPage.'+panelName).popup(Multivio.getPath('mainPage.mainPane.centerView'));
    }
    if(sel.length() === 0) {
      panelName = this.get('currentOpenedPanel');
      if(!SC.none(panelName)) {
        Multivio.getPath('mainPage.'+panelName).remove();
      }
      this.set('currentOpenedPanel', undefined);
    }
  }.observes('selection')

}) ;
