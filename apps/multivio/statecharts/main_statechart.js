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
      Multivio.set('store', SC.Store.create().from('Multivio.DataSource'));
      this.gotoState('initializing'); 
    }
  }),
  
  initializing: SC.State.design({
    server: null,

    _serverDidChange: function() {
      var server = this.get('server');
      if(server) {
        server.addRangeObserver(0, this, this._checkServerVersion);
      }
    }.observes('server'),

    _checkServerVersion: function() {
      var server = this.get('server');
      if(server.get('length') > 0) {
        if(server.firstObject().get('isOk')){
          this.gotoState('applicationReady'); 
        }else{
          this.gotoState('error', {msg: 'Server is not compatible'});  
        }
      }
    },

    enterState: function() {
      SC.Logger.debug('Initializing...');
      var panel = Multivio.getPath('loadingPage.mainPane');
      panel.append();
      Multivio.inputParameters.read();
      Multivio.get('store').unloadRecords(Multivio.FileRecord);
      var server = Multivio.store.find(Multivio.ServerRecord);
      this.set('server', server);
    },
    
    exitState: function() {
      Multivio.getPath('loadingPage.mainPane').remove();
    }
  }),
  
  applicationReady: SC.State.design({
   substatesAreConcurrent: YES,
    content: SC.State.plugin('Multivio.ContentReadyState')
    //search: SC.State.plugin('Multivio.SearchReadyState')
  }),

  error: SC.State.design({
    enterState: function(context) {
      Multivio.errorController.set('errorMessage', context.msg);
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
