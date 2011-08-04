
Multivio.DisplayingContent = SC.State.extend({

  initialSubstate: 'displayingDummy',
  
  treeController: null,
  treeControllerBinding: 'Multivio.treeController',
  
  currentFileNode: null,
  currentFileNodeBinding: 'Multivio.currentFileNodeController',
  
  fetchNewFile: function (record) {
    this.gotoState('setDocument', record);
  },

  gotoFile: function (url) {
    var currentUrl = Multivio.getPath('currentFileNodeController.url');
    if (url !== currentUrl) {
      var record = Multivio.store.find(Multivio.FileRecord, url);
      Multivio.currentFileNodeController.set('content', record);
    }
  },

  nextFile: function () {
    if (Multivio.currentFileNodeController.get('hasNextFile')) {
      Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.currentFileNodeController.set('treeItemIsExpanded', NO);
      this.gotoState('getNextDocument', Multivio.currentFileNodeController);
    }
  },

  previousFile: function () {
    if (Multivio.currentFileNodeController.get('hasPreviousFile')) {
      Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.currentFileNodeController.set('treeItemIsExpanded', NO);
      this.gotoState('getPreviousDocument', Multivio.currentFileNodeController);
    }
  },
  
  /*displaying content */
  displayingDummy: SC.State.design({}),

  displayingPdf: SC.State.design({

    currentPage: null,
    currentPageBinding: 'Multivio.currentFileNodeController.currentIndex',

    enterState: function () {
      var viewToChange = Multivio.getPath('mainPage.mainPane.centerView');
      if (viewToChange.get('nowShowing') !== 'mainPdfView') {
        viewToChange.set('nowShowing', 'mainPdfView');
        Multivio.getPath('mainPage.mainPdfView').becomeFirstResponder();
        // add bindings only after the current file is determined
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('content', 'Multivio.pdfThumbnailsController.arrangedObjects');
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('selection', 'Multivio.pdfThumbnailsController.selection');
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('target', 'Multivio.pdfThumbnailsController');
        // TODO: unbind these afterwards
        Multivio.getPath('mainPage.mainPdfView.bottomToolbar').displayBar();
      }
      //Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.pdfFileController.set('content', Multivio.currentFileNodeController);
      Multivio.pdfFileController.set('currentPage', this.get('currentPage'));
      var selection = Multivio.getPath('treeController.selection');
      if (!selection || selection.getPath('firstObject.storeKey') !== Multivio.currentFileNodeController.get('storeKey')) {
        Multivio.treeController.selectObject(Multivio.currentFileNodeController.get('content'));
      }
    },

    exitState: function () {
      Multivio.pdfFileController.set('content', null);
      //Multivio.pdfFileController.set('currentPage', null);
    },

    nextIndex: function () {
      if (Multivio.currentFileNodeController.get('hasNextIndex')) {
        Multivio.currentFileNodeController.set('currentIndex', Multivio.currentFileNodeController.get('currentIndex') + 1);
        return YES;
      } 
      return NO;
    },
    previousIndex: function () {
      if (Multivio.currentFileNodeController.get('hasPreviousIndex')) {
        Multivio.currentFileNodeController.set('currentIndex', Multivio.currentFileNodeController.get('currentIndex') - 1);
        return YES;
      } 
      return NO;
    },

    _currentPageDidChange: function () {
      var currentPage = this.get('currentPage');
      if (currentPage && currentPage !== Multivio.pdfFileController.get('currentPage')) {
        Multivio.pdfFileController.set('currentPage', currentPage);
        Multivio.getPath('mainPage.mainPdfView.pdfScrollView.contentView.infoPanel').displayBar();
      }
    }.observes('currentPage')
  }),

  displayingImage: SC.State.design({
    enterState: function () {
      var viewToChange = Multivio.getPath('mainPage.mainPane.centerView');
      if (viewToChange.get('nowShowing') !== 'mainImageView') {
        viewToChange.set('nowShowing', 'mainImageView');
        Multivio.getPath('mainPage.mainImageView').becomeFirstResponder();
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('content', 'Multivio.imageThumbnailsController.arrangedObjects');
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('selection', 'Multivio.imageThumbnailsController.selection');
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('target', 'Multivio.imageThumbnailsController');
        Multivio.getPath('mainPage.mainImageView.bottomToolbar').displayBar();
        Multivio.getPath('mainPage.mainImageView.imageScrollView.contentView.infoPanel').displayBar();
      }
      Multivio.imageFileController.set('content', Multivio.currentFileNodeController);
      var selection = Multivio.getPath('treeController.selection');
      if (!selection || selection.getPath('firstObject.storeKey') !== Multivio.currentFileNodeController.get('storeKey')) {
        Multivio.treeController.selectObject(Multivio.currentFileNodeController.get('content'));
      }
    },
    exitState: function () {
      Multivio.imageFileController.set('content', null);
      //Multivio.imageFileController.set('currentPage', null);
    }
  }),

  displayingUnsupported: SC.State.design({
    enterState: function () {
      var viewToChange = Multivio.getPath('mainPage.mainPane.centerView');
      if (viewToChange.get('nowShowing') !== 'unsupportedDocumentView') {
        viewToChange.set('nowShowing', 'unsupportedDocumentView');
        viewToChange.set('nowShowing', 'unsupportedDocumentView');
      }
    }
  })
});
