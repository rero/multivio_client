sc_require('resources/main_page.js');

Multivio.ApplicationReadyState = Ki.State.extend({

	initialSubstate: 'loading',
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
				Multivio.CDM.getMetadata('http://doc.rero.ch/record/4321/export/xm');
				Multivio.CDM.getPhysicalStructure('http://doc.rero.ch/record/4321/export/xm');
				Multivio.CDM.getLogicalStructure('http://doc.rero.ch/record/4321/export/xm');
				this.gotoState('contentReady');
			}
		}),

		loadingPosition: Ki.State.design({
			enterState: function() {
				this.gotoState('contentReady');
			}
		})

	}),

	contentReady: Ki.State.design({
		changeCurrentFile: function(){
			this.gotoState('loadingFile');
		},
		changeCurrentPosition: function(){
			this.gotoState('loadingPosition');
		}
	})
});
