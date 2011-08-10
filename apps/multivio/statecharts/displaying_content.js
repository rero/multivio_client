/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/**
  @class
  
  STATE DEFINITION

  Becomes active when the application is showing content. Its different
  substates handle different kinds of content.

  @author maj
  @extends SC.State
  @since 1.0
*/
Multivio.DisplayingContent = SC.State.extend(
  /** @scope Multivio.DisplayingContent.prototype */{

  /**
    @default SC.State displayingDummy
  */
  initialSubstate: 'displayingDummy',

  /**
    STATE EVENT
    
    Goes fetching the file corresponding to the given record object
    
    @param {FileRecord} the record of the destination file
  */
  fetchNewFile: function (record) {
    // STATE TRANSITION
    this.gotoState('settingDocument', record);
  },

  /**
    Goes to the file indicated in the URL
    
    @param {String} url The URL of the destination file
  */
  goToFile: function (url) {
    var currentUrl = Multivio.getPath('currentFileNodeController.url');
    if (url !== currentUrl) {
      var record = Multivio.store.find(Multivio.FileRecord, url);
      Multivio.currentFileNodeController.set('content', record);
    }
  },

  /**
    STATE EVENT

    Goes to the next file in the document structure
  */
  goToNextFile: function () {
    if (Multivio.currentFileNodeController.get('hasNextFile')) {
      Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.currentFileNodeController.set('treeItemIsExpanded', NO);
      // STATE TRANSITION
      this.gotoState('gettingNextDocument', Multivio.currentFileNodeController);
    }
  },

  /**
    STATE EVENT

    Goes to the previous file in the document structure
  */
  goToPreviousFile: function () {
    if (Multivio.currentFileNodeController.get('hasPreviousFile')) {
      Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.currentFileNodeController.set('treeItemIsExpanded', NO);
      // STATE TRANSITION
      this.gotoState('gettingPreviousDocument', Multivio.currentFileNodeController);
    }
  },
  
  /**
    SUBSTATE DECLARATION
    
    Dummy state used as initial substate
  */
  displayingDummy: SC.State.design(
    /** @scope Multivio.DisplayingContent.displayingDummy.prototype */{
  }),

  /**
    SUBSTATE DECLARATION
    
    Is active while the application is showing PDF content
  */
  displayingPDF: SC.State.design(
    /** @scope Multivio.DisplayingContent.displayingPDF.prototype */{

    /**
      Binds to the currently selected index in currentFileNodeController, that
      holds the currently displayed content file
      @type Number
    */
    currentPage: null,
    currentPageBinding: 'Multivio.currentFileNodeController.currentIndex',

    /** */
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

    /** */
    exitState: function () {
      Multivio.pdfFileController.set('content', null);
    },

    /**
      Goes to the next page, image, ... in the current sequence
      @returns Boolean YES if successful
    */
    goToNextIndex: function () {
      if (Multivio.currentFileNodeController.get('hasNextIndex')) {
        Multivio.currentFileNodeController.set('currentIndex',
            Multivio.currentFileNodeController.get('currentIndex') + 1);
        return YES;
      } 
      return NO;
    },

    /**
      Goes to the previous page, image, ... in the current sequence
      @returns Boolean YES if successful
    */
    goToPreviousIndex: function () {
      if (Multivio.currentFileNodeController.get('hasPreviousIndex')) {
        Multivio.currentFileNodeController.set('currentIndex',
            Multivio.currentFileNodeController.get('currentIndex') - 1);
        return YES;
      } 
      return NO;
    },

    /**
      Observes changes in the current page and forwards them to the PDF
      controller
      @private
    */
    _currentPageDidChange: function () {
      var currentPage = this.get('currentPage');
      if (currentPage && currentPage !== Multivio.pdfFileController.get('currentPage')) {
        Multivio.pdfFileController.set('currentPage', currentPage);
        Multivio.getPath('mainPage.mainPdfView.pdfScrollView.contentView.infoPanel').displayBar();
      }
    }.observes('currentPage')
  }),

  /**
    SUBSTATE DECLARATION
  
    Is active while the application is showing image content
  */
  displayingImage: SC.State.design(
    /** @scope Multivio.DisplayingContent.displayingImage.prototype */{

    /** */
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

    /** */
    exitState: function () {
      Multivio.imageFileController.set('content', null);
    }
  }),

  /**
    SUBSTATE DECLARATION
  
    Is active while the application is showing unsupported content - a message
    error is shown in that case
  */
  displayingUnsupported: SC.State.design(
    /** @scope Multivio.DisplayingContent.displayingUnsupported.prototype */{

    /** */
    enterState: function () {
      var viewToChange = Multivio.getPath('mainPage.mainPane.centerView');
      if (viewToChange.get('nowShowing') !== 'unsupportedDocumentView') {
        viewToChange.set('nowShowing', 'unsupportedDocumentView');
        viewToChange.set('nowShowing', 'unsupportedDocumentView');
      }
    }
  })
});
