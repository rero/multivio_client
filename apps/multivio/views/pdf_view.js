Multivio.mainPdfView =  SC.View.design({
  childViews: ['waitingView', 'pdfScrollView', 'previousButton', 'nextButton', 'rotateRightButton', 'rotateLeftButton', 'nextZoomButton', 'previousZoomButton', 'nextPageButton', 'previousPageButton'],

acceptsFirstResponder: YES,
keyDown: function(evt) {
   SC.Logger.debug('KeyDown: ' + evt.keyCode );
  if(evt.keyCode === 38) {
       Multivio.pdfFileController.previousPage();
  }
  if(evt.keyCode === 40) {
       Multivio.pdfFileController.nextPage();
  }
  if(evt.keyCode === 39) {
    Multivio.mainStatechart.sendEvent('nextFile');
  }
  if(evt.keyCode === 37) {
    Multivio.mainStatechart.sendEvent('previousFile');
  }
  return NO;
}, 
  waitingView: SC.ImageView.design({
    layout: { centerX: 0, centerY: 0, width: 36, height: 36 },
    isVisible: YES,
    value: static_url('images/progress_wheel_medium.gif'),
    classNames: "mvo-waiting".w()
  }),


  pdfScrollView: SC.ScrollView.design({
    classNames: "mvo-center".w(),
    layout: { top: 0, left: 0, bottom: 0, right: 0},
    contentView: SC.ImageView.design({
      layout: { centerX: 0, centerY: 0 },
      valueBinding: 'Multivio.pdfFileController.pdfUrl',
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
    target: 'Multivio.pdfFileController',
    action: 'previousPage',
    isEnabledBinding: 'Multivio.pdfFileController.hasPreviousPage',
    title: '<'
  }),

  nextPageButton: SC.ButtonView.design({
    layout: {bottom: 10,  right: 190, width: 50, height: 30 },
    target: 'Multivio.pdfFileController',
    action: 'nextPage',
    isEnabledBinding: 'Multivio.pdfFileController.hasNextPage',
    title: '>'
  }),
  previousZoomButton: SC.ButtonView.design({
    layout: {bottom: 10,  left: 130, width: 50, height: 30 },
    target: 'Multivio.pdfFileController',
    action: 'previousZoom',
    keyEquivalent: 'a',
    isKeyResponder: YES,
    isEnabledBinding: 'Multivio.pdfFileController.hasPreviousZoom',
    title: 'z-'
  }),

  nextZoomButton: SC.ButtonView.design({
    layout: {bottom: 10,  right: 130, width: 50, height: 30 },
    target: 'Multivio.pdfFileController',
    action: 'nextZoom',
    keyEquivalent: '+',
    isEnabledBinding: 'Multivio.pdfFileController.hasNexZoom',
    title: 'z+'
  }),

  rotateLeftButton: SC.ButtonView.design({
    layout: {bottom: 10,  left: 70, width: 50, height: 30 },
    target: 'Multivio.pdfFileController',
    action: 'rotateLeft',
    title: '-'
  }),
  rotateRightButton: SC.ButtonView.design({
    layout: {bottom: 10,  right: 70, width: 50, height: 30 },
    target: 'Multivio.pdfFileController',
    action: 'rotateRight',
    title: '+'
  }),


  previousButton: SC.ButtonView.design({
    layout: {bottom: 10,  left: 10, width: 50, height: 30 },
    action: 'previousFile',
    title: '<<',
    isEnabledBinding: "Multivio.filesController.hasPreviousFile"
  }),

  nextButton: SC.ButtonView.design({
    layout: {bottom: 10,  right: 10, width: 50,  height: 30 },
    action: 'nextFile',
    isEnabledBinding: "Multivio.filesController.hasNextFile",
    title: '>>'
  })
});
