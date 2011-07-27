/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('resources/main_page.js');
sc_require('controllers/file.js');
sc_require('controllers/tree.js');
sc_require('controllers/pdf.js');
sc_require('controllers/image.js');
sc_require('statecharts/loading.js');

/**
@class

  One of the application states: becomes active when the application is ready
  for user interaction

@author maj
@extends SC.State
  @since 1.0
*/
Multivio.ContentReadyState = SC.State.extend({

  initialSubstate: 'displayingDummy',

  currentRootNode: null,
  currentRootNodeBinding: 'Multivio.rootNodeController',

  currentFileNode: null,
  currentFileNodeBinding: 'Multivio.currentFileNodeController',

  treeControllerSelection: null,
  treeControllerSelectionBinding: 'Multivio.treeController.selection',

  enterState: function() {
    Multivio.getPath('mainPage.mainPane').append();
    var url_to_get = Multivio.getPath('inputParameters.url');
    var record = Multivio.store.find(Multivio.FileRecord, url_to_get);

    //set root document
    Multivio.rootNodeController.set('content', record);

    //set current document
    Multivio.currentFileNodeController.set('content', record);
  },
  _currentIndexDidChange: function() {
    Multivio.treeController.set('currentIndex', Multivio.getPath('currentFileNodeController.currentIndex'));
  }.observes('*currentFileNode.currentIndex'),

  _currentFileNodeUrlDidChange: function() {
    var selection = Multivio.treeController.getPath('selection.firstObject');
    if(selection && this.getPath('currentFileNode.url') && selection.get('url') !== this.getPath('currentFileNode.url')) {
      Multivio.treeController.selectObject(Multivio.store.find(Multivio.FileRecord, this.getPath('currentFileNode.url')));
    }
  }.observes('*currentFileNode.url'),

  _rootNodeDidChange: function() {
    var currentRootNode = this.getPath('currentRootNode');
    if(currentRootNode && currentRootNode.get('isLoaded')) {
      Multivio.treeController.get('content').set('treeItemChildren', [currentRootNode]);
      //Multivio.currentFileNodeController.set('currentIndex', 1);
      //Multivio.treeController.update();
    }
  }.observes('*currentRootNode.url'),

  _treeControllerSelectionDidChange: function() {
    SC.Logger.debug("Selection did change");
    var selection = this.getPath('treeControllerSelection.firstObject');
    if(selection) {
      //var fileIndex = selection.index;
      if(selection.get('url') !== Multivio.currentFileNodeController.get('url')) {
        Multivio.currentFileNodeController.set('treeItemIsExpanded', NO);
        this.gotoState('setDocument', selection);
      }
      if(!selection.get('index')){
        Multivio.currentFileNodeController.set('currentIndex', 1);
      }else{ 
        if (selection.get('index') !== Multivio.currentFileNodeController.get('currentIndex')){
          Multivio.currentFileNodeController.set('currentIndex', selection.get('index'));
        }
      }
    }
  }.observes('treeControllerSelection'),

  _documentTypeDidChange: function() {
    var record = this.get('currentFileNode');
    SC.Logger.debug("Mime changed: %@".fmt(record.get('mime')));
    if(record.get('mime')){
      if(record.get('isPdf')) {
        SC.Logger.debug("PDF....");
        this.gotoState('displayingPdf');
        return;
      }
      if(record.get('isImage')) {
        SC.Logger.debug("Image....");
        this.gotoState('displayingImage');
        return;
      }
      if(record.get('isXml')){
        this.gotoState('getNextDocument', this.get('currentFileNode'));
        return;
      }
      this.gotoState('displayingUnsupported');
    }
  }.observes('*currentFileNode.mime'),

  gotoFile: function(url) {
    var currentUrl = Multivio.getPath('currentFileNodeController.url');
    if(url !== currentUrl){
      var record = Multivio.store.find(Multivio.FileRecord, url);
      Multivio.currentFileNodeController.set('content', record);
    }
  },

  nextFile: function() {
    if(Multivio.currentFileNodeController.get('hasNextFile')){
      Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.currentFileNodeController.set('treeItemIsExpanded', NO);
      this.gotoState('getNextDocument', Multivio.currentFileNodeController);
    }
  },

  previousFile: function() {
    if(Multivio.currentFileNodeController.get('hasPreviousFile')){
      Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.currentFileNodeController.set('treeItemIsExpanded', NO);
      this.gotoState('getPreviousDocument', Multivio.currentFileNodeController);
    }
  },

  exitState: function() {
    Multivio.getPath('mainPage.mainPane').remove();
  },

  /************** SubStates *************************/
  displayingDummy: SC.State,

  setDocument: SC.State.design({
    enterState: function(fromNode) {
      var node;
      if(fromNode.get('canBeFetched')) {
        node = fromNode;
      }else{
        node = fromNode.get('fileNode');
      }
      var record = Multivio.store.find(Multivio.FileRecord, node.get('url'));
      if(!record.get('isReady')){
        SC.Logger.debug("Append");
        record.set('_ancestorFileNode', node.get('_ancestorFileNode'));
        node.appendChildren([record]);
      }
      //SC.Logger.debug("Get Next: %@ (%@)".fmt(node.get('url'), Multivio.currentFileNodeController.get('url')));
      Multivio.currentFileNodeController.set('content', record);
    }
  }),

  getNextDocument: SC.State.design({
    enterState: function(fromNode) {
      var node;
      if(fromNode.get('canBeFetched')) {
        node = fromNode;
      }else{
        if(fromNode.get('isFileNode')){
          var next = fromNode.get('fileNode').get('hasNextFile');
          node = next;
        }else{
          node = fromNode.get('fileNode');
        }
      }
      var record = Multivio.store.find(Multivio.FileRecord, node.get('url'));
      if(!record.get('_ancestorFileNode')){
        SC.Logger.debug("Append");
        record.set('_ancestorFileNode', node.get('_ancestorFileNode'));
        node.appendChildren([record]);
      }
      Multivio.currentFileNodeController.set('content', record);
      Multivio.currentFileNodeController.set('currentIndex', 1);
    }
  }),

  getPreviousDocument: SC.State.design({
    enterState: function(fromNode) {
      var previous = fromNode.get('hasPreviousFile');
      var record = Multivio.store.find(Multivio.FileRecord, previous.get('url'));
      record.set('_ancestorFileNode', previous.get('_ancestorFileNode'));
      SC.Logger.debug("Get Previous: %@".fmt(previous.get('url')));
      Multivio.currentFileNodeController.set('content', record);
      Multivio.currentFileNodeController.set('currentIndex', 1);
    }
  }),

  /*displaying content */
  displayingPdf: SC.State.design({

    currentPage: null,
    currentPageBinding: 'Multivio.currentFileNodeController.currentIndex',

    enterState: function() {
      var viewToChange = Multivio.getPath('mainPage.mainPane.centerView');
      if(viewToChange.get('nowShowing') !== 'mainPdfView') {
        viewToChange.set('nowShowing', 'mainPdfView');
        Multivio.getPath('mainPage.mainPdfView').becomeFirstResponder();
        // add bindings only after the current file is determined
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('content', 'Multivio.pdfThumbnailsController.arrangedObjects');
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('selection', 'Multivio.pdfThumbnailsController.selection');
        // TODO: unbind these afterwards
        Multivio.getPath('mainPage.mainPdfView.bottomToolbar').displayBar();
      }
      //Multivio.currentFileNodeController.set('currentIndex', 1);
      Multivio.pdfFileController.set('content', Multivio.currentFileNodeController);
      Multivio.pdfFileController.set('currentPage', this.get('currentPage'));
      Multivio.treeController.selectObject(Multivio.currentFileNodeController.get('content'));
    },

    exitState: function() {
      Multivio.pdfFileController.set('content', null);
      //Multivio.pdfFileController.set('currentPage', null);
    },
    gotoIndex: function(index) {
        var currentIndex = Multivio.getPath('currentFileNodeController.currentIndex');
        if(currentIndex !== index) {
           Multivio.currentFileNodeController.set('currentIndex', index);
           return YES;
        }
        return NO;
    },
    nextIndex: function() {
      if (Multivio.currentFileNodeController.get('hasNextIndex')) {
        Multivio.currentFileNodeController.set('currentIndex', Multivio.currentFileNodeController.get('currentIndex') + 1);
        return YES;
      } 
      return NO;
    },
    previousIndex: function() {
      if (Multivio.currentFileNodeController.get('hasPreviousIndex')) {
        Multivio.currentFileNodeController.set('currentIndex', Multivio.currentFileNodeController.get('currentIndex') - 1);
        return YES;
      } 
      return NO;
    },
    _currentPageDidChange: function() {
      var currentPage = this.get('currentPage');
      if(currentPage && currentPage !== Multivio.pdfFileController.get('currentPage')) {
        Multivio.pdfFileController.set('currentPage', currentPage);
        Multivio.getPath('mainPage.mainPdfView.infoPanel').displayBar();
      }
    }.observes('currentPage')
  }),

  displayingImage: SC.State.design({
    enterState: function() {
      var viewToChange = Multivio.getPath('mainPage.mainPane.centerView');
      if(viewToChange.get('nowShowing') !== 'mainImageView') {
        viewToChange.set('nowShowing', 'mainImageView');
        Multivio.getPath('mainPage.mainImageView').becomeFirstResponder();
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('content', 'Multivio.imageThumbnailsController.arrangedObjects');
        Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('selection', 'Multivio.imageThumbnailsController.selection');
        Multivio.getPath('mainPage.mainImageView.bottomToolbar').displayBar();
        Multivio.getPath('mainPage.mainImageView.infoPanel').displayBar();
      }
      Multivio.imageFileController.set('content', Multivio.currentFileNodeController);
      Multivio.treeController.selectObject(Multivio.currentFileNodeController.get('content'));
    },
    exitState: function() {
      Multivio.imageFileController.set('content', null);
      //Multivio.imageFileController.set('currentPage', null);
    }
  }),

  displayingUnsupported: SC.State.design({
    enterState: function() {
      var viewToChange = Multivio.getPath('mainPage.mainPane.centerView');
      if(viewToChange.get('nowShowing') !== 'unsupportedDocumentView') {
        viewToChange.set('nowShowing', 'unsupportedDocumentView');
        viewToChange.set('nowShowing', 'unsupportedDocumentView');
      }
    }
  })

});
