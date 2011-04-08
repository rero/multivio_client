/**
      SC.Logger.debug("Run nextFile.");
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
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
  referer: undefined,
  refererBinding: 'Multivio.inputParameters.url',
  currentUrl: undefined,
  currentParent: undefined,

  // TODO: Add your own code here.
  content: Multivio.CDM,

  fetchFile: function(url, parent) {
    if(!SC.none(this.get('currentUrl'))) {
      throw	new Error('documentController: concurrent file fetch');
    }
    var alreadyLoaded = this.find(url);
    if(alreadyLoaded && alreadyLoaded.get('isComplete')) {
      Multivio.mainStatechart.sendEvent('fileLoaded');
    }else{
      this.set('currentUrl', url);
      this.set('currentParent', parent);
      Multivio.CDM.getMetadata(url);
      Multivio.CDM.getPhysicalStructure(url);
      Multivio.CDM.getLogicalStructure(url);
    }
  },


  _nextFile: function(fileRecord, childRecord) {
    if(SC.none(fileRecord) || SC.none(fileRecord.get('url'))) {
      return NO;
    }

    var physicalStructure = fileRecord.get('physicalStructure');
    
    //get last url in child
    var lastChildUrl = physicalStructure[physicalStructure.length - 1].url;
    var childUrl = childRecord.get('url');
    
    //is the child the last?
    if(childUrl !== lastChildUrl) {
      //getSuccessor
      var currentIndex = -1;
      for(var i=0; i<physicalStructure.length; i++) {
        if(childUrl === physicalStructure[i].url) {
          currentIndex = i;
        }
      }
      if(currentIndex < 0) {
        throw "Multivio.filesController._nextFile: Child not found in physical structure";
      }
      return {'url' :physicalStructure[currentIndex + 1].url, 'parent': fileRecord};
    }

    //root Node
    if(SC.none(fileRecord.get('parent'))) {
      return NO;
    }

    //the same in parents
    return this._nextFile(fileRecord.get('parent'), fileRecord);
  },
  
  currentSelection: function() {
    var current = this.get('selection');
    if(SC.none(current) || current.length() === 0) {return undefined;}
    return current.firstObject(); 
  }.property('selection'),

  _previousFile: function(fileRecord, childRecord) {
    if(SC.none(fileRecord) || SC.none(fileRecord.get('url'))) {
      return NO;
    }

    var physicalStructure = fileRecord.get('physicalStructure');
    
    //get last url in child
    var firstChildUrl = physicalStructure[0].url;
    var childUrl = childRecord.get('url');
    
    //is the child the last?
    if(childUrl !== firstChildUrl) {
      //getSuccessor
      var currentIndex = -1;
      for(var i=0; i<physicalStructure.length; i++) {
        if(childUrl === physicalStructure[i].url) {
          currentIndex = i;
        }
      }
      if(currentIndex < 0) {
        throw "Multivio.filesController._nextFile: Child not found in physical structure";
      }
      return {'url' :physicalStructure[currentIndex - 1].url, 'parent': fileRecord};
    }

    //root Node
    if(SC.none(fileRecord.get('parent'))) {
      return NO;
    }

    //the same in parents
    return this._previousFile(fileRecord.get('parent'), fileRecord);
  },


  hasNextFile: function() {
    SC.Logger.debug('hasNextFile?');

    var currentFile = this.get('currentSelection');
    if(SC.none(currentFile)) {
      return NO;
    }
    
    if(!currentFile.get('isContentFile')) {
      throw "Multivio.filesController: hasNextFile should be called on content file only."; 
    }

    var parent = currentFile.get('parent');
    if(SC.none(parent)) {
      return NO;
    }
    return this._nextFile(parent, currentFile);
  }.property('currentSelection'),


  hasPreviousFile: function() {
    SC.Logger.debug('hasPreviousFile?');

    var currentFile = this.get('currentSelection');
    if(SC.none(currentFile)) {
      return NO;
    }
    
    if(!currentFile.get('isContentFile')) {
      throw "Multivio.filesController: hasNextFile should be called on content file only."; 
    }

    var parent = currentFile.get('parent');
    if(SC.none(parent)) {
      return NO;
    }
    return this._previousFile(parent, currentFile);
  }.property('currentSelection'),

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
      //accept new fetch request
      if(fetchedObject.get('isComplete')) {
        //set parent
        if(!SC.none(fetchedParentObject)){
          fetchedObject.set('parent', fetchedParentObject);
        }
        //this.selectObject(fetchedObject);
        SC.Logger.debug("Add selection for " + url + " : " + fetchedObject.get('received') + " and isComplete:" + fetchedObject.get('isComplete'));
          SC.Logger.debug('Accept new request!');
        this.set('currentUrl', undefined);
        this.set('currentParent', undefined);
        Multivio.mainStatechart.sendEvent('fileLoaded');
      }
    }
  }.observes('[]')

});
