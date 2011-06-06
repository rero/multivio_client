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
  @extends SC.Statechart
  @since 1.0
*/
sc_require('statecharts/search_ready.js');
Multivio.mainStatechart = SC.Object.create(SC.StatechartManager,{
//Multivio.mainStatechart = SC.Statechart.create({
  initialState: 'starting',
  trace: YES,

  starting: SC.State.design({
    loadApp: function() {
      this.gotoState('initializing'); 
    }
  }),
  
  initializing: SC.State.design({
    enterState: function() {
      SC.Logger.debug('Initializing...');
      var panel = Multivio.getPath('loadingPage.mainPane');
      panel.append();
      Multivio.inputParameters.read();
      Multivio.CDM.removeAll();
      Multivio.filesController.set('content', Multivio.CDM);
      Multivio.ServerVersion.getServerInfo();
      SC.Logger.debug('After');
    },
    
    exitState: function() {
      Multivio.getPath('loadingPage.mainPane').remove();
    },

    initializationOk: function() {
      SC.Logger.debug('Go to ready');
      this.gotoState('applicationReady'); 
    },
    
    serverError: function() {
      SC.Logger.debug("InitializationError called");
      this.gotoState('error');  
    }

  }),
  
  applicationReady: SC.State.design({
    //stateAreConcurrent: YES,
   substatesAreConcurrent: YES,
    content: SC.State.plugin('Multivio.ContentReadyState'),
    search: SC.State.plugin('Multivio.SearchReadyState')
  }),

  error: SC.State.design({
    enterState: function() {
      var panel = Multivio.getPath('errorPage.mainPane');
      panel.append();
      this.gotoState('end');
    }
  }),

  end: SC.State.design({
    enterState: function() {
      SC.Logger.log("Application ended.");
    }
  })

});
