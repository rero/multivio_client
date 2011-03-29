/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2011 RERO
License: See file COPYING
==============================================================================
*/
/*globals Multivio */

sc_require('resources/main_page.js');

/**
  @class

  One of the application states: becomes active when the application is ready
  for user interaction
  
  @author maj
  @extends Ki.State
  @since 1.0
*/
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
      currentFileDidChange:function() {
        this.gotoState('contentReady');
      }
      /*
      enterState: function() {
      }
      */
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
