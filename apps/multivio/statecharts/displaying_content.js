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

  initialSubstate: 'displayingDummy',
  
  treeController: null,
  treeControllerBinding: 'Multivio.treeController',
  
  currentFileNode: null,
  currentFileNodeBinding: 'Multivio.currentFileNodeController',
  
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
    Goes to the next file in the document structure
  */
  nextFile: function () {
    if (Multivio.currentFileNodeController.get('hasNextFile')) {
      Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.currentFileNodeController.set('treeItemIsExpanded', NO);
      this.gotoState('gettingNextDocument', Multivio.currentFileNodeController);
    }
  },

  /**
    Goes to the previous file in the document structure
  */
  previousFile: function () {
    if (Multivio.currentFileNodeController.get('hasPreviousFile')) {
      Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.currentFileNodeController.set('treeItemIsExpanded', NO);
      this.gotoState('gettingPreviousDocument', Multivio.currentFileNodeController);
    }
  },
  
  /**
    STATE DECLARATION
    
    Dummy state used as initial substate
  */
  displayingDummy: SC.State.design({}),

  /**
    STATE DECLARATION
    
    Is active while the application is showing PDF content
  */
  displayingPdf: SC.State.design({

    /**
      Binds to the currently selected index in currentFileNodeController, that
      holds the currently displayed file
    */
    currentPage: null,
    currentPageBinding: 'Multivio.currentFileNodeController.currentIndex',

    /**
      STATE EVENT
    */
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

    /**
      STATE EVENT
    */
    exitState: function () {
      Multivio.pdfFileController.set('content', null);
    },

    /**
      Increments the current file index
    */
    nextIndex: function () {
      if (Multivio.currentFileNodeController.get('hasNextIndex')) {
        Multivio.currentFileNodeController.set('currentIndex',
            Multivio.currentFileNodeController.get('currentIndex') + 1);
        return YES;
      } 
      return NO;
    },

    /**
      Decrements the current file index
    */
    previousIndex: function () {
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
    STATE DECLARATION
  
    Is active while the application is showing image content
  */
  displayingImage: SC.State.design({

    /**
      STATE EVENT
    */
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

    /**
      STATE EVENT
    */
    exitState: function () {
      Multivio.imageFileController.set('content', null);
    }
  }),

  /**
    STATE DECLARATION
  
    Is active while the application is showing unsupported content - a message
    error is shown in that case
  */
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
