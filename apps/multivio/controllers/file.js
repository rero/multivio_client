/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/
/*globals Multivio */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
sc_require('controllers/document.js');

Multivio.fileController = SC.ObjectController.create(
/** @scope Multivio.fileController.prototype */ {

	contentBinding: SC.Binding.from('Multivio.filesController.selection').single(),

    _contentDidChanged: function() {
      SC.Logger.debug('New selection');
    }.observes('content')

}) ;
