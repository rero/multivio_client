// ==========================================================================
// Project:   Multivio.fileController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
sc_require('controllers/document.js');

Multivio.fileController = SC.ObjectController.create(
/** @scope Multivio.fileController.prototype */ {

	contentBinding: SC.Binding.from('Multivio.documentController.selection').single(),

    _contentDidChanged: function() {
      SC.Logger.debug('New selection');
    }.observes('content')

}) ;
