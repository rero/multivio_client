sc_require('mixins/fadeinout.js');
sc_require('controllers/image.js');
sc_require('controllers/center_image.js');
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
    contentView: Multivio.CenterImage.design({
      layout: { centerX: 0, centerY: 0 },
      valueBinding: 'Multivio.imageFileController.currentUrl'
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
