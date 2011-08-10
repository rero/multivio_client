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

Multivio.mainStatechart = SC.Object.create(SC.StatechartManager,
  /** @scope Multivio.mainStatechart.prototype */ {
  
  initialState: 'main',
  trace: YES,
  autoInitStatechart: NO,

  /**
    STATE DECLARATION
  */
  main: SC.State.design({

    inputParameters: null,
    inputParametersBinding: 'Multivio.inputParameters',

    initialSubstate: 'mainDummy',

    /** */
    enterState: function () {
      Multivio.set('store', SC.Store.create().from('Multivio.DataSource'));
      Multivio.getPath('mainPage.mainPane').append();
      //Multivio.inputParameters.read();
    },

    /**
      STATE EVENT

      @private
    */
    _inputParametersDidChange: function () {
      var options = this.getPath('inputParameters.options');
      var url = this.getPath('inputParameters.options.url');
      if (!url) {
        return;
      }
      var inputServer = options.server;

      inputServer = inputServer || 'server';
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

      // STATE TRANSITION
      this.gotoState('waitingForServer', server);
    }.observes('*inputParameters.options'),
    
    /**
      SUBSTATE DECLARATION

      Dummy state used as initial substate
    */
    mainDummy: SC.State,

    /**
      SUBSTATE DECLARATION
      
      Is active while the application is waiting for a server response
    */
    waitingForServer: SC.State.design({
      server: null,

      /** */
      enterState: function (server) {
        var panel = Multivio.getPath('loadingPage.mainPane');
        panel.append();

        this.set('server', server);
      },

      /** */
      exitState: function () {
        Multivio.getPath('loadingPage.mainPane').remove();
      },

      /**
        STATE EVENT

        @private
      */
      _serverDidChange: function () {
        var server = this.get('server');
        if (server && server.get('isOk')) {
          Multivio.getPath('loadingPage.mainPane').remove();

          // STATE TRANSITION
          this.gotoState('applicationReady'); 
        }
        /*TODO: check status to go to error*/
        /*else{
        this.gotoState('error', {msg: 'Server is not compatible'});  
        }*/
      }.observes('*server.status')
    })
  }),

  /**
    SUBSTATE DECLARATION
    
    The major application state. It is active while the application is ready
    to interact with the user, that is, nearly always.
  */
  applicationReady: SC.State.design({

    /** @default YES */
    substatesAreConcurrent: YES,

    /**
      STATE EVENT
    */
    serverError: function () {
      SC.Logger.debug("InitializationError called");
      // STATE TRANSITION
      this.gotoState('error');
    },

    /**
      SUBSTATE DECLARATION
    */
    contentReady: SC.State.design({
      initialSubstate: 'pendingContent',

      /**
        Binds to the root node object. Its URL must be observed for changes
        @type SC.ObjectController
      */
      currentRootNode: null,
      currentRootNodeBinding: 'Multivio.rootNodeController',

      /** */
      enterState: function () {
        Multivio.getPath('mainPage.mainPane').append();
        var url_to_get = Multivio.getPath('inputParameters.options.url');
        var record = Multivio.store.find(Multivio.FileRecord, url_to_get);
        //set root document
        //Multivio.rootNodeController.set('content', record); TODO mom 10.08.2011 remove if next line does the job
        this.get('currentRootNode').set('content', record);
      },

      /** */
      exitState: function () {
        Multivio.getPath('mainPage.mainPane').remove();
      },

      /**
        Initialize the tree with the root node
        @private
      */
      _rootNodeDidChange: function () {
        var currentRootNode = this.getPath('currentRootNode');
        if (currentRootNode && currentRootNode.get('isLoaded')) {
          Multivio.treeController.get('content').set('treeItemChildren',
              [currentRootNode]);
          //set current document
          Multivio.currentFileNodeController.set('content',
              currentRootNode.get('content'));
        }
      }.observes('*currentRootNode.url'),

      /**
        SUBSTATE DECLARATION
        
        See Multivio#PendingContent
      */
      pendingContent: SC.State.plugin('Multivio.PendingContent'),

      /**
        SUBSTATE DECLARATION

        See Multivio#DisplayingContent
      */
      displayingContent: SC.State.plugin('Multivio.DisplayingContent')

    }),
    /**
      SUBSTATE DECLARATION

      See Multivio#SearchReadyState
    */
    searchReady: SC.State.plugin('Multivio.SearchReadyState')
  }),

  /**
    SUBSTATE DECLARATION
    
    Transitional state - it is used for handling fatal errors and then
    transition to the end state
  */
  error: SC.State.design({

    /**
      STATE EVENT
      
      Handle the error and go to the end state
    */
    enterState: function (context) {
      Multivio.errorController.set('errorMessage', context.msg);
      var panel = Multivio.getPath('errorPage.mainPane');
      panel.append();
      // STATE TRANSITION
      this.gotoState('end');
    }
  }),

  /**
    SUBSTATE DECLARATION
  */
  end: SC.State.design({
    
    /** */
    enterState: function () {
      SC.Logger.log("Application ended.");
    }
  })

});
