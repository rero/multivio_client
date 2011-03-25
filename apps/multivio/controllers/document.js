// ==========================================================================
// Project:   Multivio.documentController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
sc_require('models/cdm.js');

Multivio.documentController = SC.ArrayController.create(
/** @scope Multivio.documentController.prototype */ {

  // TODO: Add your own code here.
	content: Multivio.CDM.get('fileRecordsReady'),
	
	fetchFile: function(url) {
		Multivio.CDM.getMetadata(url);
		Multivio.CDM.getPhysicalStructure(url);
		Multivio.CDM.getLogicalStructure(url);
	},

	find: function(url) {
		var records = this.get('content');
		for(i=0;i<records.length();i++) {
			if(records.objectAt(i).url === url) {
				return records.objectAt(i);
			}
		}
		return null;
	},

	_contentDidChange2: function(){
			SC.Logger.debug('content changed');
	}.observes('[]')

}) ;
