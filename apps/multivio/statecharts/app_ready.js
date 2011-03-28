/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/
/*globals Multivio */

sc_require('resources/main_page.js');
sc_require('controllers/document.js');

/**
  @class

  One of the application states: becomes active when the application is ready
  for user interaction
  
  @author maj
  @extends Ki.State
  @since 1.0
*/
Multivio.ApplicationReadyState = Ki.State.extend({

  initialSubstate: 'contentReady',

  enterState: function() {
    Multivio.getPath('mainPage.mainPane').append();
  },

  exitState: function() {
    Multivio.getPath('mainPage.mainPane').remove();
  },

  applicationError: function(){
    this.gotoState('error');
  },

  loading: Ki.State.design({

    initialSubstate: 'loadingFile',

    currentFileDidChange: function(){
      this.gotoState('contentReady');
    },

    currentPositionDidChange: function(){
      this.gotoState('contentReady');

    },

    loadingFile: Ki.State.design({
    enterState: function() {
      var pdfView = Multivio.getPath('mainPage.mainPdfView.waitingView');
      pdfView.set('isVisible', YES);

    },
    exitState: function() {
      var pdfView = Multivio.getPath('mainPage.mainPdfView.waitingView');
      pdfView.set('isVisible', NO);
    },
      currentFileDidChange:function() {
        this.gotoState('contentReady');
      }
      /*
      enterState: function() {
      }
      */
    }),

    loadingPosition: Ki.State.design({
      enterState: function() {
        this.gotoState('contentReady');
      }
    })

  }),

  contentReady: Ki.State.design({

    enterState: function() {
      var currentFile = Multivio.documentController.get('currentSelection');
      var viewToChange = Multivio.getPath('mainPage.mainPane.workspaceView.bottomRightView');
      SC.Logger.debug('------> ' + viewToChange);
      if(!SC.none(currentFile) && 
        !SC.none(currentFile.metadata) &&
             currentFile.metadata.mime === 'application/pdf') {
        viewToChange.set('nowShowing', 'mainPdfView');
      }else{
        viewToChange.set('nowShowing', 'unsupportedDocumentView');
      }
    },

    nextFile: function(){
      SC.Logger.debug("Run nextFile.");
      Multivio.documentController.nextFile();
    },

    previousFile: function(){
        Multivio.documentController.previousFile();
    },

    changeCurrentFile: function(){
      this.gotoState('loadingFile');
    },
    changeCurrentPosition: function(){
      this.gotoState('loadingPosition');
    }
  })
});
