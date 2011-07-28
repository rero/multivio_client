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
sc_require('statecharts/displaying_content.js');
sc_require('statecharts/pending_content.js');

Multivio.mainStatechart = SC.Object.create(SC.StatechartManager,{
  //Multivio.mainStatechart = SC.Statechart.create({
  initialState: 'main',
  trace: YES,
  autoInitStatechart: NO,

  main: SC.State.design({
    inputParameters: null,
    inputParametersBinding: 'Multivio.inputParameters',
    initialSubstate: 'mainDummy',


    enterState: function() {
      Multivio.set('store', SC.Store.create().from('Multivio.DataSource'));
      Multivio.getPath('mainPage.mainPane').append();
      //Multivio.inputParameters.read();
    },

    _inputParametersDidChange: function(){
      var options = this.getPath('inputParameters.options');
      var url = this.getPath('inputParameters.options.url');
      if(!url) {
        return;
      }
      var inputServer = options.server;

      inputServer = inputServer ? inputServer : 'server';
      var serverName = Multivio.configurator.get('serverName');
      Multivio.configurator.set('serverName', inputServer);
      
      //clear datastore
      Multivio.get('store').unloadRecords(Multivio.FileRecord);
      Multivio.get('store').unloadRecords(Multivio.ServerRecord);
      Multivio.get('store').unloadRecords(Multivio.SearchRecord);
      Multivio.get('store').unloadRecords(Multivio.SearchResultRecord);

      // update theme
      var theme = Multivio.getPath('inputParameters.options').theme;
      if (SC.none(theme)) {
        theme = Multivio.configurator.get('defaultTheme');
      }
      Multivio.changeTheme(SC.Object.create({newTheme: theme}));
     
      //check server 
      var server = Multivio.store.find(Multivio.ServerRecord, 'inputServer');
      this.gotoState('waitingForServer', server);
    }.observes('*inputParameters.options'),
    
    mainDummy: SC.State,

    waitingForServer: SC.State.design({
      server: null,

      enterState: function(server) {
        var panel = Multivio.getPath('loadingPage.mainPane');
        panel.append();

        this.set('server', server);
      },

      exitState: function() {
        Multivio.getPath('loadingPage.mainPane').remove();
      },

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
    })
  }),

  applicationReady: SC.State.design({
    //stateAreConcurrent: YES,
    substatesAreConcurrent: YES,

    serverError: function() {
      SC.Logger.debug("InitializationError called");
      this.gotoState('error');
    },

    content: SC.State.design({
      initialSubstate: 'pendingContent',

      currentRootNode: null,
      currentRootNodeBinding: 'Multivio.rootNodeController',

      enterState: function() {
        Multivio.getPath('mainPage.mainPane').append();
        var url_to_get = Multivio.getPath('inputParameters.options.url');
        var record = Multivio.store.find(Multivio.FileRecord, url_to_get);
        //set root document
        Multivio.rootNodeController.set('content', record);
      },

      exitState: function() {
        Multivio.getPath('mainPage.mainPane').remove();
      },

      _rootNodeDidChange: function() {
        var currentRootNode = this.getPath('currentRootNode');
        if(currentRootNode && currentRootNode.get('isLoaded')) {
          Multivio.treeController.get('content').set('treeItemChildren', [currentRootNode]);
          //set current document
          Multivio.currentFileNodeController.set('content', currentRootNode.get('content'));
          //Multivio.currentFileNodeController.set('currentIndex', 1);
          //Multivio.treeController.update();
        }
      }.observes('*currentRootNode.url'),

      pendingContent: SC.State.plugin('Multivio.PendingContent'),

      displayingContent: SC.State.plugin('Multivio.DisplayingContent')

    }),
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
