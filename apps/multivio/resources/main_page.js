// ==========================================================================
// Project:   Multivio - mainPage
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

// This page describes the main user interface for your application.  
Multivio.mainPage = SC.Page.design({
	// The main pane is made visible on screen as soon as your app is loaded.
	// Add childViews to this pane for views to display immediately on page 
	// load.
	mainPane: SC.MainPane.design({
		childViews: 'workspaceView'.w(),
		workspaceView: SC.WorkspaceView.design({
			contentView: SC.SplitView.design({
				dividerThickness: 1,
				defaultThickness: 300,
				topLeftView: SC.SourceListView.design({
					content: ["Menu"]
				}),
				bottomRightView: SC.View.design({
					childViews: 'pdfView'.w(),

					pdfView: SC.View.design({
						layout: { top: 50, left: 50, bottom: 50, right: 50 },
						childViews: 'welcomeLabel'.w(),

						welcomeLabel: SC.LabelView.design({
							layout: { width: 500, height: 18 },
							value: "Welcome on pdfView"
						})
					})
				})
			})
		})
	})
});

