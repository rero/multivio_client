/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/
sc_require('controllers/files.js');

/** @class

  This is the controller is the single selection of the Multivio.filesController.

  @author jma
  @extends SC.ArrayController
*/
Multivio.fileController = SC.ObjectController.create(
/** @scope Multivio.fileController.prototype */ {

	contentBinding: SC.Binding.single('Multivio.filesController.selection')

}) ;
