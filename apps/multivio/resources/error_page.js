Multivio.errorPage = SC.Page.design({
	// The main pane is made visible on screen as soon as your app is loaded.
	// Add childViews to this pane for views to display immediately on page 
	// load.
	mainPane: SC.MainPane.design({
		defaultResponder: 'Multivio.mainStatechart',
		childViews: 'labelView'.w(),

		labelView: SC.LabelView.design({
			layout: { centerX: 0, centerY: 0, width: 200, height: 18 },
			textAlign: SC.ALIGN_CENTER,
			tagName: "h1",
			valueBinding: SC.Binding.oneWay('Multivio.errorController.errorMessage')
		}),

		buttonView: SC.ButtonView.design({      
			layout: { centerX: 0, centerY: 40, width: 250, height: 24 },      
			title: "Continue",      
			action: "quit"
		})
	})
});
