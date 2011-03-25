/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2011 RERO
License: See file COPYING
==============================================================================
*/
/*globals Multivio */

sc_require('controller.file.js');

/**
  @namespace

  Creates the main the main user interface of Multivio.
  
  @since 0.1.0
*/
Multivio.mainPage = SC.Page.design({
  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    childViews: 'workspaceView'.w(),

    workspaceView: SC.SplitView.design({
      
      // the left view...
      topLeftView: SC.SourceListView.design({
        content: ["Menu"]
      }),
      
      // the right view
      bottomRightView: SC.View.design({
        childViews: 'pdfView'.w(),

        pdfView: SC.View.design({
          layout: { top: 50, left: 50, bottom: 50, right: 50 },
          childViews: 'welcomeLabel'.w(),

          welcomeLabel: SC.LabelView.design({
            layout: { width: 500, height: 18 },
            value: "Welcome on pdfView",
            contentBinding: 'Multivio.fileController.metadata',
            contentValueKey: 'title'
          })
        })
      })
    })
  })
});

