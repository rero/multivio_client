/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

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
  initialState: 'main',
  trace: YES,
  autoInitStatechart: NO,

  main: SC.State.design({
    inputParameters: null,
    inputParametersBinding: 'Multivio.inputParameters',
    serverRecord: null,
    server: null,
    
    enterState: function() {
      SC.Logger.debug('------ Main --------');
      Multivio.set('store', SC.Store.create().from('Multivio.DataSource'));
      Multivio.getPath('mainPage.mainPane').append();
      Multivio.inputParameters.read();


    },
    
    exitState: function() {
      Multivio.getPath('loadingPage.mainPane').remove();
    },

    
    _inputParametersDidChange: function(){
      var inputServer = this.getPath('inputParameters.options.server');
      SC.Logger.debug('------ readInput --------');
      inputServer = inputServer ? inputServer : 'server';
      var serverName = Multivio.configurator.get('serverName');
      if(this.get('server') !== inputServer) {
        var panel = Multivio.getPath('loadingPage.mainPane');
        panel.append();
        
        Multivio.configurator.set('serverName', inputServer);
        Multivio.get('store').unloadRecords(Multivio.FileRecord);
        Multivio.get('store').unloadRecords(Multivio.ServerRecord);
        Multivio.get('store').unloadRecords(Multivio.SearchRecord);
        Multivio.get('store').unloadRecords(Multivio.SearchResultRecord);
        var server = Multivio.store.find(Multivio.ServerRecord, 'inputServer');
        this.set('server', server);
      }
      // update theme
      var theme = Multivio.getPath('inputParameters.options').theme;
      if (SC.none(theme)) {
        theme = Multivio.configurator.get('defaultTheme');
      }
      Multivio.changeTheme(SC.Object.create({newTheme: theme}));
    }.observes('*inputParameters.options'),

    _serverDidChange:function() {
      var server = this.get('server');
      if(server && server.get('isOk')){
        Multivio.getPath('loadingPage.mainPane').remove();
        this.gotoState('applicationReady'); 
      }
      /*TODO: check status to go to error*/
      /*else{
        this.gotoState('error', {msg: 'Server is not compatible'});  
      }*/
    }.observes('*server.status')
  }),
  
    
  applicationReady: SC.State.design({
    //stateAreConcurrent: YES,
    substatesAreConcurrent: YES,

    serverError: function() {
      SC.Logger.debug("InitializationError called");
      this.gotoState('error');
    },

    content: SC.State.plugin('Multivio.ContentReadyState'),
    search: SC.State.plugin('Multivio.SearchReadyState')
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
