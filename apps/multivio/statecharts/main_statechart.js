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
      // initialize store
      Multivio.set('store', SC.Store.create().from('Multivio.DataSource'));
      // show main pane
      Multivio.getPath('mainPage.mainPane').append();
      //Multivio.inputParameters.read();
    },

    /**
      STATE EVENT (transient)

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
      SUBSTATE DECLARATION (transient)

      Dummy state used as initial substate
      @type SC.State
    */
    mainDummy: SC.State,

    /**
      SUBSTATE DECLARATION (transient)
      
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
        STATE EVENT (internal)

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
      
      The parent state of all content-related states
      @type SC.State
    */
    contentOperational: SC.State.design({
      /** @scope Multivio.mainStatechart.applicationReady.contentOperational.prototype */

      initialSubstate: 'contentOperationalDummy',
      
      /**
        SUBSTATE DECLARATION (transient)

        Dummy state used as initial substate
        @type SC.State
      */
      contentOperationalDummy: SC.State,

      /**
        Binds to the root node object. Its URL must be observed for changes
        @type SC.ObjectController
      */
      currentFetchingRootNode: null,

      /** */
      enterState: function () {
        Multivio.getPath('mainPage.mainPane').append();
        var url_to_get = Multivio.getPath('inputParameters.options.url');
        var record = Multivio.store.find(Multivio.FileRecord, url_to_get);
        this.set('currentFetchingRootNode', record);
      },

      /** */
      exitState: function () {
        Multivio.getPath('mainPage.mainPane').remove();
      },
      
      /**
        STATE EVENT (transient)

        The root node has been loaded. Initialize the tree with the root node
        @private
      */
      _rootNodeHasBeenLoaded: function () {
        var currentFetchingRootNode = this.get('currentFetchingRootNode');
        if (currentFetchingRootNode.get('mime')) {
          Multivio.setPath('rootNodeController.content', currentFetchingRootNode);
          currentFetchingRootNode.set('treeItemIsExpanded', YES);
          Multivio.setPath('treeController.content.treeItemChildren', [currentFetchingRootNode]);
          if (currentFetchingRootNode.get('isContent')) {
            // STATE TRANSITION
            this.gotoState('displayingContent', currentFetchingRootNode);
          } else {
            // STATE TRANSITION
            this.gotoState('fetchingNextContent',
                currentFetchingRootNode.getPath('nextFile')); 
          }
        }
      }.observes('*currentFetchingRootNode.mime'),


      /**
        SUBSTATE DECLARATION
        
        See Multivio#FetchingContent
        @type Multivio.FetchingContentState
      */
      fetchingContent: SC.State.plugin('Multivio.FetchingContentState'),

      /**
        SUBSTATE DECLARATION

        See Multivio#DisplayingContent
        @type Multivio.DisplayingContentState
      */
      displayingContent: SC.State.plugin('Multivio.DisplayingContentState')

    }),

    /**
      SUBSTATE DECLARATION

      The parent state of all search-related states

      See Multivio#SearchOperationalState
      @type Multivio.SearchOperationalState
    */
    searchOperational: SC.State.plugin('Multivio.SearchOperationalState')

  }),

  /**
    SUBSTATE DECLARATION (transient)
    
    Transient state - it is used for handling fatal errors and then transition
    to the end state
    @type SC.State
  */
  error: SC.State.design({
    /** @scope Multivio.mainStatechart.error.prototype */

    /**
      STATE EVENT (transient)
      
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
