/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Object
*/
Multivio = SC.Application.create(
  /** @scope Multivio.prototype */ {

  NAMESPACE: 'Multivio',
  VERSION: '1.0.0',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.
  //store: SC.Store.create().from(SC.Record.fixtures)
  
  // TODO: Add global constants or singleton objects needed by your app here.
  store: null,

  // the name of the active theme
  currentTheme: undefined
});

/**
  Change the graphical theme that is currently selected. The name of the
  theme to be applied must be a property called 'newTheme' of the object
  given as input. This object is usually a view that calls this method
  through a target/action binding. In that case the view must contain the
  newTheme property.

  @param {SC.Object} caller the object that called this method (usually an SC.View);
*/
Multivio.changeTheme = function (caller) {
  var currentTheme = Multivio.get('currentTheme');
  if (!SC.none(caller)) {
    var newTheme = caller.get('newTheme');
    if (!SC.none(newTheme) && newTheme !== currentTheme) {
      SC.Logger.debug('Changing theme from %@ to %@'.fmt(currentTheme, newTheme));
      SC.$('body')
          .addClass('mvo-%@-theme'.fmt(newTheme))
          .removeClass('mvo-%@-theme'.fmt(currentTheme));
    }
    Multivio.set('currentTheme', newTheme);
  }
};
