/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/** @class

  This is the controller of the files contained by a bibilographic record.

  @author jma
  @extends SC.ArrayController
*/

sc_require('models/cdm.js');

//Loading status of the data received from the server
Multivio.LOADING_DONE = 'done';
Multivio.LOADING_ERROR = 'error';
Multivio.LOADING_LOADING = 'loading';

Multivio.FilesController = SC.ArrayController.extend({

  /**
    Single selection

    @type Boolean
  */
  allowsMultipleSelection: NO,
  fileLoadedEvent: 'fileLoaded',
  
  /**
    Url of the bibliographic record

    @type Boolean
  */
  referer: null,
  refererBinding: 'Multivio.inputParameters.url',

  /**
    Url of the last fetched file.

    @type String
  */
  currentUrl: undefined,
  
  /** @private
    Parent of the current loading file.

    @type String
  */
  currentParent: undefined,
  currentIndex: undefined,
  loadingStatus: undefined,
  currentFile: undefined,

  content: Multivio.CDM,

  /**
    Fetch a new file with a given url.

    @param {url} url of the new file to get from the server
  */
  fetchFile: function(url, parent) {
    if(this.get('loadingStatus') === Multivio.LOADING_LOADING) {
      throw	new Error('filesController: concurrent file fetch');
    }
    var alreadyLoaded = this.findProperty('url', url);
    if(!SC.none(alreadyLoaded) && alreadyLoaded.get('isComplete')) {
      this.set('currentFile', url);
      Multivio.mainStatechart.sendEvent(this.get('fileLoadedEvent'), alreadyLoaded);
    }else{
      this.set('loadingStatus', Multivio.LOADING_LOADING);
      this.set('currentUrl', url);
      this.set('currentParent', parent);
      Multivio.CDM.getMetadata(url);
      Multivio.CDM.getPhysicalStructure(url);
      Multivio.CDM.getLogicalStructure(url);
    }
  },

  title: function() {
    var referer = this.get('referer');
    if(referer) {
        var refRecord = this.findProperty('url', referer);
        if(refRecord) {
          return refRecord.getPath('metadata.title');
        }
    }
    return "";
  }.property('[]', 'referer'),

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
      var tmp = physicalStructure.findProperty('url', childUrl);
      if(tmp) {
        currentIndex = physicalStructure.indexOf(tmp);
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
  currentPhysicalStructure: function() {
    var current = this.get('selection');
    if(SC.none(current) || current.length() === 0) {return undefined;}
    return current.firstObject().get('physicalStructure'); 
  }.property('selection'),
  currentLogicalStructure: function() {
    var current = this.get('selection');
    if(SC.none(current) || current.length() === 0) {return undefined;}
    return current.firstObject().get('logicalStructure'); 
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
      var tmp = physicalStructure.findProperty('url', childUrl);
      if(tmp) {
        currentIndex = physicalStructure.indexOf(tmp);
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

    var currentFile = this.get('currentSelection');
    if(SC.none(currentFile)) {
      return NO;
    }
    
    if(!currentFile.get('isContentFile')) {
      //throw "Multivio.filesController: hasNextFile should be called on content file only."; 
      return NO;
    }

    var parent = currentFile.get('parent');
    if(SC.none(parent)) {
      return NO;
    }
    return this._nextFile(parent, currentFile);
  }.property('currentSelection'),


  hasPreviousFile: function() {

    var currentFile = this.get('currentSelection');
    if(SC.none(currentFile)) {
      return NO;
    }
    
    if(!currentFile.get('isContentFile')) {
      //throw "Multivio.filesController: hasNextFile should be called on content file only."; 
      return NO;
    }

    var parent = currentFile.get('parent');
    if(SC.none(parent)) {
      return NO;
    }
    return this._previousFile(parent, currentFile);
  }.property('currentSelection'),

  selectNewFile: function(url, parentUrl) {
    //SC.Logger.debug('%@');
    if(!SC.none(this.get('currentSelection')) &&
      this.get('currentSelection').url !== url) {
      SC.Logger.debug('-------------> %@, %@'.fmt(url, this.get('currentSelection').url));
      Multivio.mainStatechart.sendEvent('fetchFile', {url: url, parent: this.findProperty('url', parentUrl)});
    }
  },

  didChange: function() {
    SC.Logger.debug('Did Change');
  },

  _contentDidChange: function(){
    var url = this.get('currentUrl');
    if(url) {
      var fetchedObject = this.findProperty('url', this.get('currentUrl'));
      SC.Logger.debug('file received: %@: %@'.fmt(url, fetchedObject));
      var fetchedParentObject = this.get('currentParent');
      if(fetchedObject){
        //accept new fetch request
        if(fetchedObject.get('isComplete')) {
          //set parent
          if(!SC.none(fetchedParentObject)){
            fetchedObject.set('parent', fetchedParentObject);
          }
          this.set('currentUrl', undefined);
          this.set('currentParent', undefined);
          SC.Logger.debug('fileLoaded');
          //this.set('currentFile', url);
          this.set('loadingStatus', Multivio.LOADING_DONE);
          this.set('currentFile', fetchedObject);
          SC.Logger.debug('file received: %@'.fmt(url));
          Multivio.mainStatechart.sendEvent(this.get('fileLoadedEvent'), fetchedObject);
        }
      }
    }
  }.observes('[]')

});
Multivio.filesController = Multivio.FilesController.create({});
