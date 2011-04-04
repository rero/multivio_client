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
      layout: { top: 10, bottom: 10, left: 10, right: 10 },
      valueBinding: 'Multivio.pdfViewController.pdfUrl',
      imageDidChange: function() {
        var img_height = this.get('image').height;
        var img_width = this.get('image').width;
				/*this.adjust('width', img_width);
				this.adjust('height', img_height);*/
				SC.Logger.debug('ImageView: width ' + img_width + ' height ' + img_height);
        this.set('layout', {centerX: 0, centerY: 0, width: img_width, height: img_height});
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
