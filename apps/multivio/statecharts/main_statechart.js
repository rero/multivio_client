/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('statecharts/search_operational.js');
sc_require('statecharts/displaying_content.js');
sc_require('statecharts/fetching_content.js');

/**
  @namespace

  Main application statechart
  
  @author maj
  @extends SC.Statechart
  @since 1.0
*/
Multivio.mainStatechart = SC.Object.create(SC.StatechartManager, {
  /** @scope Multivio.mainStatechart.prototype */
  
  initialState: 'main',
  trace: YES,
  autoInitStatechart: NO,

  /**
    STATE DECLARATION
  */
  main: SC.State.design({
    /** @scope Multivio.mainStatechart.main.prototype */

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
      @type SC.State
    */
    mainDummy: SC.State,

    /**
      SUBSTATE DECLARATION
      
      Is active while the application is waiting for a server response
      @type SC.State
    */
    waitingForServer: SC.State.design({
      /** @scope Multivio.mainStatechart.waitingForServer.prototype */

      /** */
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
    @type SC.State
  */
  applicationReady: SC.State.design({
    /** @scope Multivio.mainStatechart.applicationReady.prototype */

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
      @type SC.State
    */
    contentOperational: SC.State.design({
      /** @scope Multivio.mainStatechart.applicationReady.contentOperational.prototype */

      initialSubstate: 'fetchingContent',

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
        //set root file
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
          //set current file
          Multivio.currentFileNodeController.set('content',
              currentRootNode.get('content'));
        }
      }.observes('*currentRootNode.url'),

      /**
        SUBSTATE DECLARATION
        
        See Multivio#FetchingContent
        @type Multivio.FetchingContent
      */
      fetchingContent: SC.State.plugin('Multivio.FetchingContent'),

      /**
        SUBSTATE DECLARATION

        See Multivio#DisplayingContent
        @type Multivio.DisplayingContent
      */
      displayingContent: SC.State.plugin('Multivio.DisplayingContent')

    }),
    /**
      SUBSTATE DECLARATION

      See Multivio#SearchOperationalState
      @type Multivio.SearchOperationalState
    */
    searchOperational: SC.State.plugin('Multivio.SearchOperationalState')
  }),

  /**
    SUBSTATE DECLARATION
    
    Transitional state - it is used for handling fatal errors and then
    transition to the end state
    @type SC.State
  */
  error: SC.State.design({
    /** @scope Multivio.mainStatechart.error.prototype */

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

    @type SC.State
  */
  end: SC.State.design({
    /** @scope Multivio.mainStatechart.end.prototype */
    
    /** */
    enterState: function () {
      SC.Logger.log("Application ended.");
    }
  })

});
