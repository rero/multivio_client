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
  currentParent: undefined,

  // TODO: Add your own code here.
  content: Multivio.CDM.get('fileRecordsReady'),

  fetchFile: function(url, parent) {
    if(!SC.none(this.get('currentUrl'))) {
      throw	new Error('documentController: concurrent fetch file');
    }
    var alreadyLoaded = this.find(url);
    if(alreadyLoaded && alreadyLoaded.get('isComplete')) {
      this.selectObject(alreadyLoaded);
    }else{
      Multivio.mainStatechart.sendEvent('changeCurrentFile');
      this.set('currentUrl', url);
      this.set('currentParent', parent);
      Multivio.CDM.getMetadata(url);
      Multivio.CDM.getPhysicalStructure(url);
      Multivio.CDM.getLogicalStructure(url);
    }
  },

  _findPreviousFile: function(fileRecord) {
    var currentUrl = fileRecord.get('url');
    var parent = fileRecord.get('parent');
    if(SC.none(parent)) {
      return null;
    }
    var physicalStructure = parent.get('physicalStructure');
    var currentIndex = -1;
    for(var i=0; i<physicalStructure.length;i++) {
      if(currentUrl === physicalStructure[i].url) {
        currentIndex = i;
      }
    }
    // TODO: generate exception if not found!
    // Is current index not the last?
    if(currentIndex > 0 ) {
        return this.fetchFile(physicalStructure[currentIndex - 1].url, parent);
    }
    this._findNextFile(parent);
  },

  previousFile: function() {
    this._findPreviousFile(Multivio.fileController);
  },

  _findNextFile: function(fileRecord) {
    var currentUrl = fileRecord.get('url');
    var parent = fileRecord.get('parent');
    if(SC.none(parent)) {
      return null;
    }
    var physicalStructure = parent.get('physicalStructure');
    var currentIndex = -1;
    for(var i=0; i<physicalStructure.length;i++) {
      if(currentUrl === physicalStructure[i].url) {
        currentIndex = i;
      }
    }
    // TODO: generate exception if not found!
    // Is current index not the last?
    if(currentIndex < (physicalStructure.length - 1)) {
        return this.fetchFile(physicalStructure[currentIndex + 1].url, parent);
    }
    this._findNextFile(parent);
  },

  nextFile: function() {
    this._findNextFile(Multivio.fileController);
  },

  _hasNextFile: function(fileRecord) {
    var currentUrl = fileRecord.get('url');
    var parent = fileRecord.get('parent');
    if(SC.none(parent)) {
      return NO;
    }
    SC.Logger.debug('_hasNext: ' + currentUrl + " : " + parent.get('url'));
    var physicalStructure = parent.get('physicalStructure');
    var currentIndex = -1;
    for(var i=0; i<physicalStructure.length;i++) {
      if(currentUrl === physicalStructure[i].url) {
        currentIndex = i;
      }
    }
    SC.Logger.debug('_hasNextFile: ' + currentIndex + ' -> ' + physicalStructure.length);
    // TODO: generate exception if not found!
    // Is current index not the last?
    if(currentIndex < (physicalStructure.length - 1)) {
      SC.Logger.debug('return');
      return YES;
    }
    return this._hasNextFile(parent);
  },

  hasNextFile: function() {
    return this._hasNextFile(Multivio.fileController);
  },

  _hasPreviousFile: function(fileRecord) {
    var currentUrl = fileRecord.get('url');
    var parent = fileRecord.get('parent');
    SC.Logger.debug('documentController._hasPreviousFile: ' + currentUrl + ' -> ' + parent);
    if(SC.none(parent)) {
      return NO;
    }
    var physicalStructure = parent.get('physicalStructure');
    var currentIndex = -1;
    for(var i=0; i<physicalStructure.length;i++) {
      if(currentUrl === physicalStructure[i].url) {
        currentIndex = i;
      }
    }
    SC.Logger.debug('documentController._hasNextFile: currentIndex ' + currentIndex);
    // TODO: generate exception if not found!
    // Is current index not the first?
    if(currentIndex > 0) {
      return YES;
    }
    return this._hasPreviousFile(parent);
  },

  hasPreviousFile: function() {
    return this._hasPreviousFile(Multivio.fileController);
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
    var url = this.get('currentUrl');
    var fetchedObject = this.find(this.get('currentUrl'));
    var fetchedParentObject = this.get('currentParent');
    if(!SC.none(fetchedObject)){
      //set parent
      if(!SC.none(fetchedParentObject)){
        fetchedObject.set('parent', fetchedParentObject);
      }
      this.selectObject(fetchedObject);
      SC.Logger.debug("Add selection for " + url + " : " + fetchedObject.get('received') + " and isComplete:" + fetchedObject.get('isComplete'));
      //accept new fetch request
      if(fetchedObject.get('isComplete')) {
        SC.Logger.debug('Accept new request!');
        this.set('currentUrl', undefined);
        this.set('currentParent', undefined);
        Multivio.mainStatechart.sendEvent('contentReady');
      }
    }
  }.observes('[]')

});
