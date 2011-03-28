/**
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
  refererBinding: 'Multivio.inputParameters.url',
  currentUrl: undefined,
  currentParent: undefined,

  // TODO: Add your own code here.
  content: Multivio.CDM.get('fileRecordsReady'),

  fetchFile: function(url, parent) {
    if(!SC.none(this.get('currentUrl'))) {
      throw	new Error('documentController: concurrent file fetch');
    }
    var alreadyLoaded = this.find(url);
    if(alreadyLoaded && alreadyLoaded.get('isComplete')) {
      Multivio.mainStatechart.sendEvent('changeCurrentFile');
      this.selectObject(alreadyLoaded);
      Multivio.mainStatechart.sendEvent('currentFileDidChange');
    }else{
      Multivio.mainStatechart.sendEvent('changeCurrentFile');
      this.set('currentUrl', url);
      this.set('currentParent', parent);
      Multivio.CDM.getMetadata(url);
      Multivio.CDM.getPhysicalStructure(url);
      Multivio.CDM.getLogicalStructure(url);
    }
  },



  _nextFile: function(fileRecord, childRecord, go) {
    if(SC.none(fileRecord) || SC.none(fileRecord.get('url'))) {
      return NO;
    }
    SC.Logger.debug('Next to :' + fileRecord.get('url'));
    SC.Logger.debug('Phys :' + fileRecord.get('isComplete'));
    var currentUrl = fileRecord.get('url');
    var physicalStructure = fileRecord.get('physicalStructure');

    //deep first
    if(SC.none(childRecord)) {
      //has childs?
      if(physicalStructure[0].url !== currentUrl) {
        if(go) {
          this.fetchFile(physicalStructure[0].url, fileRecord);
        }
        return YES;
      }
    }else{

      //brothers and sisters
      //get index of the currentChild
      var currentIndex = -1;
      for(var i=0; i<physicalStructure.length; i++) {
        if(childRecord.get('url') === physicalStructure[i].url) {
          currentIndex = i;
        }
      }
      // TODO: generate exception if not found!
      // Is current index not the last?
      // found sister
      if(currentIndex < (physicalStructure.length - 1)) {
        if(go) {this.fetchFile(physicalStructure[currentIndex + 1].url, fileRecord);}
        return YES;
      }
    }

    if(SC.none(fileRecord.get('parent'))) {
      return NO;
    }

    //find in parents
    return this._nextFile(fileRecord.get('parent'), fileRecord, go);
  },
  
  currentSelection: function() {
    var current = this.get('selection');
    if(SC.none(current) || current.length() === 0) {return undefined;}
    return current.firstObject(); 
  }.property('selection'),

  _previousFile: function(fileRecord, childRecord, go) {
    if(SC.none(fileRecord) || SC.none(fileRecord.get('url'))) {
      return NO;
    }
    var currentUrl = fileRecord.get('url');
    var physicalStructure = fileRecord.get('physicalStructure');

    if(SC.none(childRecord)){
      //root node?
      if(SC.none(fileRecord.get('parent'))) {
        return NO;
      }else {
        return this._previousFile(fileRecord.get('parent'), fileRecord, go);
      }
    }else{

      //brothers and sisters
      //get index of the currentChild
      var currentIndex = -1;
      for(var i=0; i<physicalStructure.length; i++) {
        if(childRecord.get('url') === physicalStructure[i].url) {
          currentIndex = i;
        }
      }
      // TODO: generate exception if not found!
      // Is current index not the first?
      // found previous sister
      if(currentIndex > 0) {
        if(go) {this.fetchFile(physicalStructure[currentIndex - 1].url, fileRecord);}
        return YES;
      }
      //previous is me!
      if(go) {this.fetchFile(fileRecord.get('url'));}
      return YES;
    }
  },

  nextFile: function() {
    SC.Logger.debug('get next to: ' + this.get('currentSelection'));
    return this._nextFile(this.get('currentSelection'), undefined, YES);
  },

  hasNextFile: function() {
    SC.Logger.debug('hasNextFile?');
    return this._nextFile(this.get('currentSelection'), undefined, NO);
  }.property('currentSelection'),


  previousFile: function() {
    this._previousFile(this.get('currentSelection'), undefined, YES);
  },

  hasPreviousFile: function() {
    return this._previousFile(this.get('currentSelection'), undefined, NO);
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
      //set parent
      if(!SC.none(fetchedParentObject)){
        fetchedObject.set('parent', fetchedParentObject);
      }
      //accept new fetch request
      if(fetchedObject.get('isComplete')) {
        this.selectObject(fetchedObject);
        SC.Logger.debug("Add selection for " + url + " : " + fetchedObject.get('received') + " and isComplete:" + fetchedObject.get('isComplete'));
        SC.Logger.debug('Accept new request!');
        this.set('currentUrl', undefined);
        this.set('currentParent', undefined);
        Multivio.mainStatechart.sendEvent('currentFileDidChange');
      }
    }
  }.observes('[]')

});
