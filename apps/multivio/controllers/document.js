/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2011 RERO
License: See file COPYING
==============================================================================
*/
/*globals Multivio */

sc_require('models/cdm.js');

/**
  @namespace

  (Document Your Controller Here)

  @extends SC.Object
*/
Multivio.documentController = SC.ArrayController.create(
/** @scope Multivio.documentController.prototype */ {

  allowsMultipleSelection: NO,
  refererBinding: 'Multivio.inputParameters.url',
  currentUrl: undefined,

  // TODO: Add your own code here.
  content: Multivio.CDM.get('fileRecordsReady'),
  
  fetchFile: function(url) {
    if(!SC.none(this.get('currentUrl'))) {
      throw new Error('documentController: concurrent fetch file');
    }
    this.set('currentUrl', url);
    Multivio.CDM.getMetadata(url);
    Multivio.CDM.getPhysicalStructure(url);
    Multivio.CDM.getLogicalStructure(url);
  },

  find: function(url) {
    var records = this.get('content');
    for(var i=0;i<records.length();i++) {
      if(records.objectAt(i).url === url) {
        return records.objectAt(i);
      }
    }
    return null;
  },

  _contentDidChange: function(){
      var fetchedObject = this.find(this.get('currentUrl'));
      if(!SC.none(fetchedObject)){
          this.selectObject(fetchedObject);
          SC.Logger.debug("Add selection");
          //accept new fetch request
          if(fetchedObject.get('isComplete')) {
            this.set('currentUrl', undefined);
          }
      }
  }.observes('[]')

});
