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
    canLoadInBackground: NO,
    layout: { top: 50, left: 0, bottom: 50, right: 0},
    contentView: SC.ImageView.design({
      layout: { centerX: 0, centerY: 0 },
      valueBinding: 'Multivio.pdfViewController.pdfUrl',
      imageDidLoad: function (url, imageOrError) {
        /*
        var jquery = this.$();
        var img_height = jquery.find('img').height();
        var img_width = jquery.find('img').width();
        */
        var img_height = this.get('image').height;
        var img_width = this.get('image').width;
        if(img_height > 1 && img_width > 1) {
        this.adjust('width', img_width);
        this.adjust('height', img_height);
        }
      }.observes('image'),

        //redifined this default method in order remove the defaultBlankImage
      _image_valueDidChange: function() {
        var value = this.get('imageValue'),
        type = this.get('type');

        // check to see if our value has changed
        if (value !== this._iv_value) {
          this._iv_value = value;

          // While the new image is loading use SC.BLANK_IMAGE as a placeholder
          //this.set('image', SC.BLANK_IMAGE);
          this.set('status', SC.IMAGE_STATE_LOADING);

          // order: image cache, normal load
          if (!this._loadImageUsingCache()) {
            if (!this._loadImage()) {
              // CSS class? this will be handled automatically
            }
          }
        }
      }.observes('imageValue')
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
