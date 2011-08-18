/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/** @class

  STATE DEFINITION
  
  Becomes active when the application is fetching content to be displayed

  @author maj
  @extends SC.State
  @since 1.0
*/
Multivio.FetchingContent = SC.State.extend({
  initialSubstate: 'fetchingDummy',
  fetchingDummy: SC.State,

  fetchingNextContent: SC.State.extend({
    /** @scope Multivio.FetchingContent.prototype */

    /**
*/
    currentFetchingFileNode: null,

    /** */
    enterState: function (fromNode) {
      var currentNode;
      var fileNode;
      if (fromNode.get('isFetchable')) {
        currentNode = fromNode;
        fileNode = Multivio.store.find(Multivio.FileRecord, fromNode.get('url'));
        //already fetched?
        if (!fileNode.get('_children')) {
          currentNode.appendChildren([fileNode]);
        }
      } else {
        currentNode = fromNode.get('nearestFileNode');
        fileNode = Multivio.store.find(Multivio.FileRecord, currentNode.get('url'));
      }
      this.set('currentFetchingFileNode', fileNode);
    },

    _currentFetchingFileNodeDidChange: function () {
      var fileNode = this.get('currentFetchingFileNode');
      if (fileNode.get('mime')) {
        if (fileNode.get('isContent')) {
          this.gotoState('displayingContent', fileNode);
        } else {
          //xml file or logical node
          fileNode.set('treeItemIsExpanded', YES);
          this.gotoState('fetchingNextContent', fileNode.getPath('hasNextFile'));
        }
      }
    }.observes('*currentFetchingFileNode.mime')

  }),
  
  fetchingPreviousContent: SC.State.extend({
    /** @scope Multivio.FetchingContent.prototype */

    /**
*/
    currentFetchingFileNode: null,

    /** */
    enterState: function (fromNode) {
      var currentNode;
      var fileNode;
      SC.Logger.warn(fromNode.get('id'));
      if (fromNode.get('isFetchable')) {
        currentNode = fromNode;
        fileNode = Multivio.store.find(Multivio.FileRecord, fromNode.get('url'));
        //already fetched?
        if (!fileNode.get('_children')) {
          currentNode.appendChildren([fileNode]);
        }
      } else {
        currentNode = fromNode.get('nearestFileNode');
        fileNode = Multivio.store.find(Multivio.FileRecord, currentNode.get('url'));
      }
      this.set('currentFetchingFileNode', fileNode);
    },

    _currentFetchingFileNodeDidChange: function () {
      var fileNode = this.get('currentFetchingFileNode');
      if (fileNode.get('mime')) {
        if (fileNode.get('isContent')) {
          this.gotoState('displayingContent', fileNode);
        } else {
          //xml file or logical node
          fileNode.set('treeItemIsExpanded', YES);
          this.gotoState('fetchingPreviousContent', fileNode.getPath('lastChild'));
        }
      }
    }.observes('*currentFetchingFileNode.mime')

  })
});
