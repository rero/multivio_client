Multivio.mainStatechart = Ki.Statechart.create({
  initialState: 'initializing',
	trace: YES,

  initializing: Ki.State.design({
    enterState: function() {
			SC.Logger.debug('Initializing...');
      var panel = Multivio.getPath('loadingPage.mainPane');
			panel.append();
			Multivio.documentController.set('content', Multivio.CDM);
			Multivio.CDM.getServerInfo();
			SC.Logger.debug('After');
    },
		
		exitState: function() {
			Multivio.getPath('loadingPage.mainPane').remove();
		},

		initializationOk: function() {
			SC.Logger.debug('Go to ready');
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
