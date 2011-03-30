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

Multivio.unsupportedDocumentView =  SC.View.design({
  childViews: ['titleView', 'previousButton', 'nextButton'],

  titleView: SC.View.design({
    layout: { top: 0, left: 0, bottom: 0 , right: 0 },
    childViews: 'titleLabel'.w(),

    titleLabel: SC.LabelView.design({
      layout: { width: 500, height: 18 },
      value: "Unsupported document!"
    })
  }),
  previousButton: SC.ButtonView.design({
    layout: {bottom: 10,  left: 10, width: 50, height: 30 },
    action: 'previousFile',
    title: '<<',
    isEnabledBinding: "Multivio.documentController.hasPreviousFile"
  }),

  nextButton: SC.ButtonView.design({
    layout: {bottom: 10,  right: 10, width: 50,  height: 30 },
    action: 'nextFile',
    isEnabledBinding: "Multivio.documentController.hasNextFile",
    title: '>>'
  })
});

Multivio.mainPdfView =  SC.View.design({
  childViews: ['waitingView', 'titleView', 'pdfScrollView', 'previousButton', 'nextButton', 'rotateRightButton', 'rotateLeftButton', 'nextZoomButton', 'previousZoomButton', 'nextPageButton', 'previousPageButton'],

  waitingView: SC.ImageView.design({
    layout: { centerX: 0, centerY: 0, width: 36, height: 36 },
    isVisible: YES,
    value: static_url('images/progress_wheel_medium.gif'),
    classNames: "mvo-waiting".w()
  }),

  titleView: SC.View.design({
    layout: { top: 10, left: 10, height: 30 , right: 10 },
    childViews: 'titleLabel'.w(),

    titleLabel: SC.LabelView.design({
      layout: { width: 500, height: 18 },
      value: "Welcome on pdfView",
      contentBinding: 'Multivio.fileController.metadata',
      contentValueKey: 'title'
    })
  }),

  pdfScrollView: SC.ScrollView.design({
		classNames: "mvo-center".w(),
		layout: { top: 50, left: 0, bottom: 50, right: 0},
    contentView: SC.ImageView.design({
      layout: { centerX: 0, centerY: 0, width: 100, height: 100 },
      valueBinding: 'Multivio.pdfViewController.pdfUrl',
      imageDidChange: function() {
        var img_height = this.get('image').height;
        var img_width = this.get('image').width;
				this.adjust('width', img_width);
				this.adjust('height', img_height);
			/*
				SC.Logger.debug('ImageView: width ' + img_width + ' height ' + img_height);
        //this.set('layout', {centerX: 0, centerY: 0, width: img_width, height: img_height});
        //this.set('layout', {centerX: 0, centerY: 0, width: img_width, height: img_height});
				*/
      }.observes('image')
    })
  }),
  
  previousPageButton: SC.ButtonView.design({
    layout: {bottom: 10,  left: 190, width: 50, height: 30 },
    target: 'Multivio.pdfViewController',
    action: 'previousPage',
    isEnabledBinding: 'Multivio.pdfViewController.hasPreviousPage',
    title: '<'
  }),

  nextPageButton: SC.ButtonView.design({
    layout: {bottom: 10,  right: 190, width: 50, height: 30 },
    target: 'Multivio.pdfViewController',
    action: 'nextPage',
    isEnabledBinding: 'Multivio.pdfViewController.hasNextPage',
    title: '>'
  }),
  previousZoomButton: SC.ButtonView.design({
    layout: {bottom: 10,  left: 130, width: 50, height: 30 },
    target: 'Multivio.pdfViewController',
    action: 'previousZoom',
    isEnabledBinding: 'Multivio.pdfViewController.hasPreviousZoom',
    title: 'z-'
  }),

  nextZoomButton: SC.ButtonView.design({
    layout: {bottom: 10,  right: 130, width: 50, height: 30 },
    target: 'Multivio.pdfViewController',
    action: 'nextZoom',
    isEnabledBinding: 'Multivio.pdfViewController.hasNexZoom',
    title: 'z+'
  }),
  
  rotateLeftButton: SC.ButtonView.design({
    layout: {bottom: 10,  left: 70, width: 50, height: 30 },
    target: 'Multivio.pdfViewController',
    action: 'rotateLeft',
    title: '-'
  }),
  rotateRightButton: SC.ButtonView.design({
    layout: {bottom: 10,  right: 70, width: 50, height: 30 },
    target: 'Multivio.pdfViewController',
    action: 'rotateRight',
    title: '+'
  }),


  previousButton: SC.ButtonView.design({
    layout: {bottom: 10,  left: 10, width: 50, height: 30 },
    action: 'previousFile',
    title: '<<',
    isEnabledBinding: "Multivio.documentController.hasPreviousFile"
  }),

  nextButton: SC.ButtonView.design({
    layout: {bottom: 10,  right: 10, width: 50,  height: 30 },
    action: 'nextFile',
    isEnabledBinding: "Multivio.documentController.hasNextFile",
    title: '>>'
  })
});

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
      topLeftView: SC.SourceListView.design({ }),
      bottomRightView: SC.WellView.design({
        layout: { top: 0, left: 0, bottom: 0 , right: 0 }
      })
    })
  }),
  mainPdfView: Multivio.mainPdfView,
  unsupportedDocumentView: Multivio.unsupportedDocumentView
});

