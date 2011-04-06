/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/
/*globals Multivio */

/**
  @namespace

  Main application statechart
  
  @author maj
  @extends Ki.Statechart
  @since 1.0
*/
Multivio.mainStatechart = Ki.Statechart.create({
  initialState: 'starting',
  trace: YES,

  starting: Ki.State.design({
    loadApp: function() {
      this.gotoState('initializing'); 
    }
  }),
  initializing: Ki.State.design({
    enterState: function() {
      SC.Logger.debug('Initializing...');
      var panel = Multivio.getPath('loadingPage.mainPane');
      panel.append();
      Multivio.inputParameters.read();
      Multivio.CDM.removeAll();
      Multivio.CDM.getServerInfo();
      SC.Logger.debug('After');
    },
    
    exitState: function() {
      Multivio.getPath('loadingPage.mainPane').remove();
    },

    initializationOk: function() {
      SC.Logger.debug('Go to ready');
      Multivio.documentController.set('content', Multivio.CDM);
      Multivio.documentController.fetchFile(Multivio.inputParameters.get('url'));
      this.gotoState('applicationReady'); 
    },

    initializationError: function() {
      SC.Logger.debug("InitializationError called");
      this.gotoState('error');  
    }
  }),
  
  applicationReady: Ki.State.plugin('Multivio.ApplicationReadyState'),

  error: Ki.State.design({
    enterState: function() {
      var panel = Multivio.getPath('errorPage.mainPane');
      panel.append();
      this.gotoState('end');
    }
  }),

  end: Ki.State.design({
    enterState: function() {
      SC.Logger.log("Application ended.");
    }
  })

});
