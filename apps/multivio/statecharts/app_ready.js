/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/
/*globals Multivio */

sc_require('resources/main_page.js');
sc_require('controllers/files.js');
sc_require('statecharts/loading.js');

/**
@class

  One of the application states: becomes active when the application is ready
  for user interaction

@author maj
@extends SC.State
  @since 1.0
*/
Multivio.ApplicationReadyState = SC.State.extend({

  initialSubstate: 'contentReady',
  autoInitStatechart: NO,

  enterState: function() {
    Multivio.getPath('mainPage.mainPane').append();
    //Multivio.filesController.fetchFile(Multivio.inputParameters.get('url'));
    //Multivio.getPath('mainPage.mainPane').becomeKeyPane();
  },
  loadApp: function() {
    this.gotoState('initializing'); 
  },

  exitState: function() {
    Multivio.getPath('mainPage.mainPane').remove();
  },

  applicationError: function(){
    this.gotoState('error');
  },

  loadingNextContentFile: SC.State.plugin('Multivio.LoadNextFile'),

  loadingPreviousContentFile: SC.State.plugin('Multivio.LoadPreviousFile'),

  contentReady: SC.State.design({


    enterState: function() {
      //loading root
      if(Multivio.filesController.length() < 1) {
        var rootUrl = Multivio.filesController.get('referer');
        this.gotoState('loadingNextContentFile', {url: rootUrl, parent: undefined}); 
        return;
      }

      var currentFile = Multivio.filesController.get('currentSelection');
      var viewToChange = Multivio.getPath('mainPage.mainPane.centerView');
      if(!SC.none(currentFile) && 
         !SC.none(currentFile.metadata)){
        if(currentFile.metadata.mime.match('.*?/pdf')) {
          if(viewToChange.get('nowShowing') !== 'mainPdfView') {
            viewToChange.set('nowShowing', 'mainPdfView');
            Multivio.getPath('mainPage.mainPdfView').becomeFirstResponder();
            Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('content', 'Multivio.pdfThumbnailsController.arrangedObjects');
            Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('selection', 'Multivio.pdfThumbnailsController.selection');
            Multivio.getPath('mainPage.mainPdfView.bottomToolbar').displayBar();
          }
        }else{
          if(currentFile.metadata.mime.match('image/.*?')) {
            if(viewToChange.get('nowShowing') !== 'mainImageView') {
              viewToChange.set('nowShowing', 'mainImageView');
              Multivio.getPath('mainPage.mainImageView').becomeFirstResponder();
              Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('content', 'Multivio.imageThumbnailsController.arrangedObjects');
              Multivio.getPath('mainPage.thumbnailsView.contentView.contentView').bind('selection', 'Multivio.imageThumbnailsController.selection');
              Multivio.getPath('mainPage.mainImageView.bottomToolbar').displayBar();
            }
          }else{
            viewToChange.set('nowShowing', 'unsupportedDocumentView');
          }
        }
      }
    },

    nextFile: function(){
      var predecessorNode = Multivio.filesController.get('hasNextFile');
      if(predecessorNode) {
        this.gotoState('loadingNextContentFile', predecessorNode); 
      }
    },

    previousFile: function(){
      var predecessorNode = Multivio.filesController.get('hasPreviousFile');
      if(predecessorNode) {
        this.gotoState('loadingPreviousContentFile', predecessorNode); 
      }
    },

    fetchFile: function(context){
      var currentUrl = Multivio.filesController.get('currentUrl');
      var currentParent = Multivio.filesController.get('currentParent');
      this.gotoState('loadingNextContentFile', context); 
    }
  })
});
