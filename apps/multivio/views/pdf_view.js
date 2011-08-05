/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('mixins/fadeinout.js');
sc_require('views/center_image.js');
sc_require('controllers/pdf.js');

Multivio.mainPdfView =  SC.View.design({
  childViews: ['waitingView', 'pdfScrollView', 'bottomToolbar'], 
  acceptsFirstResponder: YES,
  keyDown: function (evt) {
    SC.Logger.debug('KeyDown: ' + evt.keyCode);
    if (evt.keyCode === 38) {
      Multivio.mainStatechart.sendEvent('previousIndex');
    }
    if (evt.keyCode === 40) {
      Multivio.mainStatechart.sendEvent('nextIndex');
    }
    if (evt.keyCode === 39) {
      Multivio.mainStatechart.sendEvent('nextFile');
    }
    if (evt.keyCode === 37) {
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
    layout: { top: 5, left: 5, bottom: 5, right: 5},
    contentView: Multivio.CenterImage.design({
      layout: { centerX: 0, centerY: 0 },
      init: function () {
        sc_super();
        this.get('imageView').bind('value', 'Multivio.pdfFileController.currentUrl');
        this.get('selectionView').bind('nativeSize', 'Multivio.pdfFileController.nativeSize');
        this.get('selectionView').bind('rotationAngle', 'Multivio.pdfFileController.rotationAngle');
        this.get('selectionView').bind('content', 'Multivio.currentSearchResultsController.arrangedObjects');
        this.get('selectionView').bind('selection', 'Multivio.currentSearchResultsController.selection');
        this.getPath('infoPanel.textView').bind('value', 'Multivio.pdfFileController.infoMessage');
      }
    })
  }),


  bottomToolbar: SC.NavigationBarView.design(SC.Animatable, Multivio.FadeInOut, {
    childViews: ['previousButton', 'nextButton', 'rotateRightButton', 'rotateLeftButton', 'nextZoomButton', 'previousZoomButton', 'nextPageButton', 'pageEntry', 'previousPageButton', 'fitWidthButton', 'fitAllButton', 'hundredPercentButton', 'overviewButton'],
    classNames: "mvo-front-view-transparent".w(),
    layout: { centerX: 0, width: 530, height: 48, bottom: 20 },
    acceptsFirstResponder: NO,
    
    previousButton: SC.ImageButtonView.design({
      image: 'image-button-previous-doc',
      layout: {centerY: 0,  left: 10, width: 32, height: 32 },
      action: 'previousFile',
      title: '<<',
      isEnabledBinding: "Multivio.currentFileNodeController.hasPreviousFile"
    }),

    nextButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 40, width: 32,  height: 32 },
      image: 'image-button-next-doc',
      action: 'nextFile',
      isEnabledBinding: "Multivio.currentFileNodeController.hasNextFile",
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
      //target: 'Multivio.pdfFileController',
      action: 'previousIndex',
      isEnabledBinding: 'Multivio.currentFileNodeController.hasPreviousIndex',
      title: '<'
    }),

    pageEntry: SC.TextFieldView.design({
      layout: {centerY: 0,  left: 210, width: 50, height: 24 },
      acceptsFirstResponder: NO,
      isTextArea: NO,
      applyImmediately: NO,
      contentBinding: 'Multivio.currentFileNodeController', 
      contentValueKey: 'currentIndex',
      classNames: "mvo-pagenr".w(),
      validator: SC.Validator.PositiveInteger.create({
        validateKeyDown: function (form, field, charStr) {
          var isPositiveInt = sc_super(),
            text = field.$input().val(),
            value = parseInt(text, 0);

          if (isPositiveInt) {
            if (!text) {
              text = '';
            }
            text += charStr;
            if (value > 0 && value <= Multivio.getPath('pdfFileController.nPages')) {
              return YES;
            }
          }
          return NO;
        }
      })
    }),

    nextPageButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 260, width: 32, height: 32 },
      image: 'image-button-next-page',
      //target: 'Multivio.pdfFileController',
      action: 'nextIndex',
      isEnabledBinding: 'Multivio.currentFileNodeController.hasNextIndex',
      title: '>'
    }),

    previousZoomButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 310, width: 32, height: 32 },
      image: 'image-button-zoom-minus',
      target: 'Multivio.pdfFileController',
      action: 'previousZoom',
      keyEquivalent: 'a',
      isKeyResponder: YES,
      isEnabledBinding: 'Multivio.pdfFileController.hasPreviousZoom',
      title: 'z-'
    }),
    

    nextZoomButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 340, width: 32, height: 32 },
      image: 'image-button-zoom-plus',
      target: 'Multivio.pdfFileController',
      action: 'nextZoom',
      keyEquivalent: '+',
      isEnabledBinding: 'Multivio.pdfFileController.hasNextZoom',
      title: 'z+'
    }),

    fitAllButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 390, width: 32, height: 32 },
      image: 'image-button-fit-all',
      buttonBehavior: SC.TOGGLE_BEHAVIOR,
      toggleOffValue: NO,
      toggleOnValue: YES,
      valueBinding: 'Multivio.pdfFileController.fitAll',
      title: 'all'
    }),
    fitWidthButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 420, width: 32, height: 32 },
      image: 'image-button-fit-width',
      buttonBehavior: SC.TOGGLE_BEHAVIOR,
      toggleOffValue: NO,
      toggleOnValue: YES,
      valueBinding: 'Multivio.pdfFileController.fitWidth',
      title: 'width'
    }),
    hundredPercentButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 450, width: 32, height: 32 },
      image: 'image-button-hundred-percent',
      target: 'Multivio.pdfFileController',
      action: 'hundredPercentZoom',
      keyEquivalent: '=',
      isEnabledBinding: 'Multivio.pdfFileController.hundredPercentZoomEnabled',
      title: 'hundred'
    }),
    overviewButton: SC.ImageButtonView.design({
      layout: {centerY: 0,  left: 490, width: 32, height: 32 },
      image: 'image-button-overview',
      buttonBehavior: SC.TOGGLE_BEHAVIOR,
      toggleOffValue: NO,
      toggleOnValue: YES,
      //value: null,
      valueBinding: 'Multivio.overviewController.showPalette',
      title: 'overview'
    })
  })
});
