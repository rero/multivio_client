sc_require('mixins/fadeinout.js');
sc_require('controllers/image.js');
Multivio.mainImageView =  SC.View.design({
  childViews: ['waitingView', 'imageScrollView', 'bottomToolbar'], 

  acceptsFirstResponder: YES,
  keyDown: function(evt) {
    SC.Logger.debug('KeyDown: ' + evt.keyCode );
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
    //canvas do not work with animated gifs
    useCanvas: NO,
    isVisibleBinding: 'Multivio.imageFileController.loadingPage',
    value: static_url('images/progress_wheel_medium.gif'),
    classNames: "mvo-waiting".w()
  }),


  imageScrollView: SC.ScrollView.design({
    classNames: "mvo-center".w(),
    layout: { top: 0, left: 0, bottom: 0, right: 0},
    contentView: SC.ImageView.design({
      layout: { centerX: 0, centerY: 0 },
      classNames: "mvo-page".w(),
      visibleWidth: 0,
      visibleHeight: 0,
      valueBinding: 'Multivio.imageFileController.currentUrl',
      imageDidLoad: function (url, imageOrError) {
        var img_height = this.get('image').height;
        var img_width = this.get('image').width;
        var parent_width = this.get('visibleWidth');
        var parent_height = this.get('visibleHeight');
        var _layout = {};
        if(img_height > 1 && img_width > 1) {
          _layout.width = img_width;
          _layout.height = img_height;
          if(parent_width > img_width) {
            _layout.centerX = 0;
          }else{
            _layout.left = 0;
          }
          if(parent_height > img_height) {
            _layout.centerY = 0;
          }else{
            _layout.top = 0;
          }
          this.set('layout', _layout);
          this.notifyPropertyChange("layer");
          SC.Logger.debug('ImageView updated');
        }
      }.observes('image').cacheable(),

      parentViewDidResize: function() {
        this.set('visibleHeight', this.get('parentView').get('frame').height);
        this.set('visibleWidth', this.get('parentView').get('frame').width);
        sc_super();
      },

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
      }.observes('imageValue').cacheable()
    })
  }),

  bottomToolbar: SC.NavigationBarView.design(SC.Animatable, Multivio.FadeInOut, {
    childViews: ['previousButton', 'nextButton', 'rotateRightButton', 'rotateLeftButton', 'nextZoomButton', 'previousZoomButton', 'nextPageButton', 'previousPageButton', 'fitWidthButton', 'fitAllButton'],
    classNames: "mvo-front-view-transparent".w(),
    layout: { centerX: 0, width: 410, height: 48, bottom: 20 },
    acceptsFirstResponder: NO,
    
    previousButton: SC.ImageButtonView.design({
      image: 'image-button-previous-doc',
      layout: {centerY: 0,  left: 10, width: 32, height: 32 },
      action: 'previousFile',
      title: '<<',
      isEnabledBinding: "Multivio.filesController.hasPreviousFile"
    }),

    nextButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 40, width: 32,  height: 32 },
      image: 'image-button-next-doc',
      action: 'nextFile',
      isEnabledBinding: "Multivio.filesController.hasNextFile",
      title: '>>'
    }),
    
    rotateLeftButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 100, width: 32, height: 32 },
      image: 'image-button-rotate-left',
      target: 'Multivio.imageFileController',
      action: 'rotateLeft',
      title: '-'
    }),
    rotateRightButton: SC.ImageButtonView.design({
      image: 'image-button-rotate-right',
      layout: {centerY: 0,  left: 130, width: 32, height: 32 },
      target: 'Multivio.imageFileController',
      action: 'rotateRight',
      title: '+'
    }),
    
    previousPageButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 180, width: 32, height: 32 },
      image: 'image-button-previous-page',
      target: 'Multivio.imageFileController',
      action: 'previousPage',
      isEnabledBinding: 'Multivio.imageFileController.hasPreviousPage',
      title: '<'
    }),

    nextPageButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 210, width: 32, height: 32 },
      image: 'image-button-next-page',
      target: 'Multivio.imageFileController',
      action: 'nextPage',
      isEnabledBinding: 'Multivio.imageFileController.hasNextPage',
      title: '>'
    }),


    previousZoomButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 260, width: 32, height: 32 },
      image: 'image-button-zoom-minus',
      target: 'Multivio.imageFileController',
      action: 'previousZoom',
      keyEquivalent: 'a',
      isKeyResponder: YES,
      isEnabledBinding: 'Multivio.imageFileController.hasPreviousZoom',
      title: 'z-'
    }),
    

    nextZoomButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 290, width: 32, height: 32 },
      image: 'image-button-zoom-plus',
      target: 'Multivio.imageFileController',
      action: 'nextZoom',
      keyEquivalent: '+',
      isEnabledBinding: 'Multivio.imageFileController.hasNextZoom',
      title: 'z+'
    }),

    fitAllButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 340, width: 32, height: 32 },
      image: 'image-button-fit-all',
      buttonBehavior: SC.TOGGLE_BEHAVIOR,
      toggleOffValue: NO,
      toggleOnValue: YES,
      valueBinding: 'Multivio.imageFileController.fitAll',
      title: 'all'
    }),

    fitWidthButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 370, width: 32, height: 32 },
      image: 'image-button-fit-width',
      buttonBehavior: SC.TOGGLE_BEHAVIOR,
      toggleOffValue: NO,
      toggleOnValue: YES,
      valueBinding: 'Multivio.imageFileController.fitWidth',
      title: 'width'
    })
  })
});
