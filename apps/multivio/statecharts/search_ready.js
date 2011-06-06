/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/
/*globals Multivio */


/**
@class

  One of the application states: becomes active when the application is ready
  for user interaction

@author maj
@extends SC.State
  @since 1.0
*/
sc_require('controllers/search_results.js');
Multivio.SearchReadyState = SC.State.extend({

  initialSubstate: 'searchReady',

  searchReady: SC.State.design({

    enterState: function() {
      Multivio.searchResultsController.set('loadingStatus', Multivio.LOADING_DONE);
    },

    findAll: function(context) {
      var rootUrl = Multivio.filesSearchController.get('referer');
      Multivio.searchResultsController.set('loadingStatus', Multivio.LOADING_LOADING);
      this.gotoState('waitingForSearchResults', {node: {url: rootUrl, parent: undefined}, searchInNext: YES});
    },

    findInCurrent: function(context) {
      var rootUrl = Multivio.filesSearchController.get('referer');
      Multivio.searchResultsController.set('loadingStatus', Multivio.LOADING_LOADING);
      var currentFile = Multivio.getPath('filesController.currentFile');
      this.gotoState('waitingForSearchResults', {node: currentFile, searchInNext: NO});
    }

  }),

  waitingForSearchResults: SC.State.design({
    searchInNext: NO,

    enterState: function(context) {
      var currentRootNode = context.node;
      if(!SC.none(context.searchInNext)) {
        this.set('searchInNext', context.searchInNext);
      }
      SC.Logger.debug("Search enter received with: " + currentRootNode.url);
      var currentNode = Multivio.filesSearchController.findProperty('url', currentRootNode.url);

      //rootNode not loaded
      if(SC.none(currentNode)) {
        //this.gotoState(this.get('parentState').loadingFile);
        SC.Logger.debug('Search: fetching root node');
        Multivio.filesSearchController.fetchFile(currentRootNode.url, currentRootNode.parent);
        return;
      }

      //isContent file: display it!
      if(currentNode.get('isContentFile')) {
        Multivio.filesSearchController.selectObject(currentNode);
        SC.Logger.debug("Searching: %@".fmt(currentNode.url));
        Multivio.searchTreeController.set('msgStatus', "Searching in: %@".fmt(currentNode.get('label')));
        Multivio.searchResultsController.fetchFile(currentNode.url, Multivio.searchResultsController.get('currentQuery'));
        return;
      }else{
        //logical Node
        var currentPhys = currentNode.get('physicalStructure');
        //expand first child
        var nextNodeUrl = currentPhys[0].url;
        Multivio.filesSearchController.fetchFile(nextNodeUrl, currentNode);
        return;
      }
    },

    searchResultsLoaded:function(context) {
        var nextNode = Multivio.filesSearchController.hasNextFile();
        if(nextNode && this.get('searchInNext')) {
          this.gotoState(this, {node:nextNode});
        }else{
          Multivio.searchTreeController.set('msgStatus', "Done");
          this.gotoState('searchReady');
          return;
        }
    },

    searchFileLoaded:function(context) {
      this.gotoState(this, {node: context});
    },

    cancel:function() {
        Multivio.searchTreeController.set('msgStatus', "Aborted");
      this.gotoState('searchReady');
    }
  })
});
