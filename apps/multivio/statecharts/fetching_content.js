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
Multivio.FetchingContentState = SC.State.extend(/** @scope Multivio.FetchingContentState.prototype */{
  initialSubstate: 'fetchingDummy',

  /**
    SUBSTATE DECLARATION

    Dummy state used as initial substate
    @type SC.State
  */
  fetchingDummy: SC.State,

  /**
    SUBSTATE DECLARATION
  
    Is active while the application is fetching the next content node relative
    to a given node
    @type SC.State
  */
  fetchingNextContent: SC.State.design({

    /**
    */
    fileNodeBeingFetched: null,

    /**
      @param FileRecord fromNode the reference node, whose next content node
      is being fetched; fromNode can be any node in the tree, of any type
    */
    enterState: function (fromNode) {
      this.set('fileNodeBeingFetched',
          this.get('parentState').fileNodeForNode(fromNode));
    },

    /**
      STATE EVENT (transient)

      This event is fired when fileNodeBeingFetched has effectively been fetched
      @private
    */
    _fileNodeHasBeenFetched: function () {
      var fileNode = this.get('fileNodeBeingFetched');
      if (fileNode && fileNode.get('mime')) {
        // if it's a content node the work is done - the content can be displayed
        if (fileNode.get('isContent')) {
          // STATE TRANSITION
          this.gotoState('displayingContent', fileNode);
        } else {
          // otherwise proceed to the next file
          //xml file or logical node
          fileNode.set('treeItemIsExpanded', YES);
          // STATE TRANSITION
          this.gotoState('fetchingNextContent', fileNode.getPath('nextFile'));
        }
      }
    }.observes('*fileNodeBeingFetched.mime')

  }),
  
  /**
    SUBSTATE DECLARATION
  
    Is active while the application is fetching the previous content node
    relative to a given node
    @type SC.State
  */
  fetchingPreviousContent: SC.State.design({

    /**
    */
    fileNodeBeingFetched: null,

    /**
      @param FileRecord fromNode the reference node, whose previous content node
      is being fetched; fromNode can be any node in the tree, of any type
    */
    enterState: function (fromNode) {
      this.set('fileNodeBeingFetched',
          this.get('parentState').fileNodeForNode(fromNode));
    },

    /**
      STATE EVENT (transient)

      This event is fired when fileNodeBeingFetched has effectively been fetched
      @private
    */
    _fileNodeHasBeenFetched: function () {
      var fileNode = this.get('fileNodeBeingFetched');
      if (fileNode && fileNode.get('mime')) {
        // if it's a content node the work is done - the content can be displayed
        if (fileNode.get('isContent')) {
          // STATE TRANSITION
          this.gotoState('displayingContent', fileNode);
        } else {
          // otherwise proceed to the previous file
          //xml file or logical node
          fileNode.set('treeItemIsExpanded', YES);
          // STATE TRANSITION
          this.gotoState('fetchingPreviousContent', fileNode.getPath('lastChild'));
        }
      }
    }.observes('*fileNodeBeingFetched.mime')

  }),
  
  
  /**
    Helper function, used by the substates - it returns the file node that
    corresponds to a reference node.
    
    This function also handles the case where fromNode is a fetchable node, in
    which case its fetchableChild is loaded

    @param FileRecord fromNode the reference node, whose content node should be returned
    @type FileRecord
  */
  fileNodeForNode: function (fromNode) {
    var fileNode = null;
    if (fromNode.get('isFetchable')) {
      // the 'url' property of a fetchable node is the URL of its fetchable child
      fileNode = Multivio.store.find(Multivio.FileRecord, fromNode.get('url'));
      // if fetchableChild not yet fetched
      if (!fromNode.get('fetchableChild')) {
        // link the fetchableChild to the fromNode's ancestor file node,
        // bypassing fromNode, no longer needed
        fileNode.set('_ancestorFileNode', fromNode.get('_ancestorFileNode'));
        fromNode.appendFetchableChild(fileNode);
      }
    } else {
      // otherwise, simply fetch and return the nearest file node of fromNode
      var currentNode = fromNode.get('nearestFileNode');
      fileNode = Multivio.store.find(Multivio.FileRecord, currentNode.get('url'));
    }
    return fileNode;
  }

});
