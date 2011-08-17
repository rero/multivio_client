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
Multivio.FetchingContent = SC.State.extend(/** @scope Multivio.FetchingContent.prototype */{
  initialSubstate: 'fetchingDummy',
<<<<<<< HEAD
=======

  /**
  */
  currentFileNode: null,
  currentFileNodeBinding: 'Multivio.currentFileNodeController',

  /**
    STATE EVENT
  */
  _fileTypeDidChange: function () {
    var record = this.get('currentFileNode');
    SC.Logger.debug("Mime changed: %@".fmt(record.get('mime')));
    if (record.get('mime')) {
      if (record.get('isPDF')) {
        SC.Logger.debug("PDF....");
        Multivio.currentFileNodeController.set('currentIndex', 1);
        // STATE TRANSITION
        this.gotoState('displayingPDF');
        return;
      }
      if (record.get('isImage')) {
        SC.Logger.debug("Image....");
        // STATE TRANSITION
        this.gotoState('displayingImage');
        return;
      }
      if (record.get('isXML')) {
        // STATE TRANSITION
        this.gotoState('gettingNextFile', this.get('currentFileNode'));
        return;
      }
      // STATE TRANSITION
      this.gotoState('displayingUnsupported');
    }
  }.observes('*currentFileNode.mime'),



  /************** SubStates *************************/

  /**
    SUBSTATE DECLARATION

    @type SC.State
  */
>>>>>>> Code review - search statechart (in progress)
  fetchingDummy: SC.State,

  fetchingNextContent: SC.State.extend({

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
          fileNode.set('_ancestorFileNode', currentNode.get('_ancestorFileNode'));
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
      if (fileNode && fileNode.get('mime')) {
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
          fileNode.set('_ancestorFileNode', currentNode.get('_ancestorFileNode'));
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
