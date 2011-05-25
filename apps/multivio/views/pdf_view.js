sc_require('mixins/fadeinout.js');
sc_require('views/center_image.js');
sc_require('controllers/pdf.js');

Multivio.mainPdfView =  SC.View.design({
  childViews: ['waitingView', 'pdfScrollView', 'bottomToolbar'], 

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
    //canvas do not work with animated gifs
    useCanvas: NO,
    isVisibleBinding: 'Multivio.pdfFileController.loadingPage',
    value: static_url('images/progress_wheel_medium.gif'),
    classNames: "mvo-waiting".w()
  }),


  pdfScrollView: SC.ScrollView.design({
    classNames: "mvo-center".w(),
    layout: { top: 0, left: 0, bottom: 0, right: 0},
    contentView: Multivio.CenterImage.design({
      layout: { centerX: 0, centerY: 0 },
      init:function() {
        sc_super();
        this.get('imageView').bind('value', 'Multivio.pdfFileController.currentUrl');
        this.get('selectionView').bind('nativeSize', 'Multivio.pdfFileController.nativeSize');
        this.get('selectionView').bind('rotationAngle', 'Multivio.pdfFileController.rotationAngle');
        this.get('selectionView').bind('content', 'Multivio.currentSearchResultsController.arrangedObjects');
        this.get('selectionView').bind('selection', 'Multivio.currentSearchResultsController.selection');
      }
      //valueBinding: 'Multivio.pdfFileController.currentUrl'
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
      target: 'Multivio.pdfFileController',
      action: 'rotateLeft',
      title: '-'
    }),
    rotateRightButton: SC.ImageButtonView.design({
      image: 'image-button-rotate-right',
      layout: {centerY: 0,  left: 130, width: 32, height: 32 },
      target: 'Multivio.pdfFileController',
      action: 'rotateRight',
      title: '+'
    }),

    previousPageButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 180, width: 32, height: 32 },
      image: 'image-button-previous-page',
      target: 'Multivio.pdfFileController',
      action: 'previousPage',
      isEnabledBinding: 'Multivio.pdfFileController.hasPreviousPage',
      title: '<'
    }),

    nextPageButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 210, width: 32, height: 32 },
      image: 'image-button-next-page',
      target: 'Multivio.pdfFileController',
      action: 'nextPage',
      isEnabledBinding: 'Multivio.pdfFileController.hasNextPage',
      title: '>'
    }),

    previousZoomButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 260, width: 32, height: 32 },
      image: 'image-button-zoom-minus',
      target: 'Multivio.pdfFileController',
      action: 'previousZoom',
      keyEquivalent: 'a',
      isKeyResponder: YES,
      isEnabledBinding: 'Multivio.pdfFileController.hasPreviousZoom',
      title: 'z-'
    }),
    

    nextZoomButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 290, width: 32, height: 32 },
      image: 'image-button-zoom-plus',
      target: 'Multivio.pdfFileController',
      action: 'nextZoom',
      keyEquivalent: '+',
      isEnabledBinding: 'Multivio.pdfFileController.hasNextZoom',
      title: 'z+'
    }),

    fitAllButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 340, width: 32, height: 32 },
      image: 'image-button-fit-all',
      buttonBehavior: SC.TOGGLE_BEHAVIOR,
      toggleOffValue: NO,
      toggleOnValue: YES,
      valueBinding: 'Multivio.pdfFileController.fitAll',
      title: 'all'
    }),
    fitWidthButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 370, width: 32, height: 32 },
      image: 'image-button-fit-width',
      buttonBehavior: SC.TOGGLE_BEHAVIOR,
      toggleOffValue: NO,
      toggleOnValue: YES,
      valueBinding: 'Multivio.pdfFileController.fitWidth',
      title: 'width'
    })
  })
});
