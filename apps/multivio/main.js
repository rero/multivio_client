/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
Multivio.reload = function () {
  SC.Logger.debug('New input');
  // STATECHART EVENT TRIGGER
  // Multivio.mainStatechart.sendEvent('main');
  Multivio.inputParameters.read();
};

Multivio.main = function main() {

  Multivio.changeTheme(SC.Object.create({
    newTheme: Multivio.configurator.get('defaultTheme')
  }));

  // Step 1: Instantiate Your Views
  // The default code here will make the mainPane for your application visible
  // on screen.  If you app gets any level of complexity, you will probably 
  // create multiple pages and panes.

  // Step 2. Set the content property on your primary controller.
  // This will make your app come alive!
  //Multivio.getPath('mainPage.mainPane').append();

  // TODO: Set the content property on your primary controller
  // ex: Multivio.contactsController.set('content',Multivio.contacts);
  SC.routes.add('*', Multivio, 'reload');
  Multivio.mainStatechart.initStatechart();

};

function main() { 
  Multivio.main();
}
