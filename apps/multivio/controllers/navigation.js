/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
sc_require('views/help.js');
sc_require('views/thumbnails.js');
sc_require('views/tree.js');
sc_require('views/search.js');
Multivio.navigationController = SC.ArrayController.create({

  currentOpenPanel: undefined,

  content: [
    SC.Object.create({
      panel: 'mainPage.searchView',
      icon: static_url("images/icons/24x24/search_light_24x24.png")
    }),
    
    SC.Object.create({
      panel: 'mainPage.treeView',
      icon: static_url("images/icons/24x24/tree_light_24x24.png")
    }),

    SC.Object.create({
      panel: 'mainPage.thumbnailsView',
      icon: static_url("images/icons/24x24/thumbnails_light_24x24.png")
    }),

    SC.Object.create({
      panel: 'download',
      icon: static_url("images/icons/24x24/download_light_24x24.png"),
      action: 'download'
    }),
    
    SC.Object.create({
      panel: 'mainPage.mainPane.centerView.contentView.bottomToolbar',
      icon: static_url("images/icons/24x24/show_toolbar_light_24x24.png")
      //action: 'showBottomToolbar'
    }),

    SC.Object.create({
      panel: 'mainPage.helpPane',
      icon: static_url("images/icons/24x24/help_light_24x24.png")
    })
  ],

  _selectionDidChange: function () {
    var panelName;
    var sel = this.get('selection');
    SC.Logger.debug('navigationBar: selection changed! ' + sel.length());
    if (!SC.none(sel) && sel.length() > 0) {
      panelName = sel.firstObject().get('panel');
      var action = sel.firstObject().get('action');
      var oldPanelName = this.get('currentOpenPanel');
      if (!SC.none(oldPanelName) && panelName !== oldPanelName) {
        if (Multivio.getPath(oldPanelName).remove) {
          Multivio.getPath(oldPanelName).remove();
        }
      }
      this.set('currentOpenPanel', panelName);
      SC.Logger.debug('Panel Name: ' + panelName);
      if (Multivio.getPath(panelName)) {
        Multivio.getPath(panelName).append();
      } else {
        eval("this." + action + "()");
      }
    }
    if (sel.length() === 0) {
      panelName = this.get('currentOpenPanel');
      if (!SC.none(panelName)) {
        if (Multivio.getPath(panelName)) {
          Multivio.getPath(panelName).remove();
        }
      }
      this.set('currentOpenPanel', undefined);
    }
  }.observes('selection'),

  /**
    Close all palettes
  */
  closeAll: function () {
    this.deselectObjects(this.get('selection'));
  },

  performDownload: function () {
    var url = Multivio.getPath('currentFileNodeController.url');
    if (parseInt(SC.browser.msie, 0) === 7) {
      window.location.href = url;
    } else {
      window.open(url);
    }
  },

  download: function () {
    this.deselectObject(this.findProperty('panel', 'download'));
    SC.AlertPane.info({
      message: "Download current File",
      description: "File size is: %@"
        .fmt(Multivio.getPath('currentFileNodeController.humanReadableFileSize')),
      caption: "It will open it in a new window",
      buttons: [
        { 
          title: "Continue",
          action: Multivio.navigationController.performDownload
        },
        { 
          title: "Cancel"
        }
      ]
    });
  }

});
