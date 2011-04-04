/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/
/*globals Multivio */

/**
  @namespace

  Creates the main the main user interface of Multivio.
  
  @since 0.1.0
*/

sc_require('views/unsupported_view.js');
sc_require('views/thumbnails.js');
sc_require('views/pdf_view.js');
sc_require('views/navigation_bar.js');
sc_require('views/help.js');

Multivio.mainPage = SC.Page.design({
  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // see: http://groups.google.com/group/sproutcore/msg/9f59c491b9c27464
  //  and http://groups.google.com/group/sproutcore/browse_thread/thread/914c2c6c0558fcbc/9cc1bb65f0adcd0d
  // for more details
  // load.
  
  mainPane: SC.MainPane.design({
    childViews: 'workspaceView'.w(),
    defaultResponder: 'Multivio.mainStatechart',


    workspaceView: SC.SplitView.design({
      defaultThickness: 0.1,
      
      // the left view...
      topLeftView: Multivio.NavigationBar,
      //topLeftView: Multivio.thumbnailsView,

      //topLeftView: Multivio.navigationBar,
      bottomRightView: SC.WellView.design({
        layout: { top: 0, left: 0, bottom: 0 , right: 0 }
      })
    })
  }),
  mainPdfView: Multivio.mainPdfView,
  unsupportedDocumentView: Multivio.unsupportedDocumentView,
  thumbnailsView: Multivio.thumbnailsView,
  navigationBar: Multivio.NavigationBar,
  helpPane: Multivio.HelpPane
});

