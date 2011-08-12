/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('resources/main_page.js');
sc_require('controllers/file.js');
sc_require('controllers/tree.js');
sc_require('controllers/pdf.js');
sc_require('controllers/image.js');

/** @class

  STATE DEFINITION
  
  Becomes active when the application is fetching content to be displayed

  @author maj
  @extends SC.State
  @since 1.0
*/
Multivio.FetchingContent = SC.State.extend({
  /** @scope Multivio.FetchingContent.prototype */

  /**
  */
  initialSubstate: 'fetchingDummy',

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
  fetchingDummy: SC.State,

  /**
    SUBSTATE DECLARATION

    @type SC.State
  */
  settingFile: SC.State.design({
    
    /** */
    enterState: function (fromNode) {
      var node;
      if (fromNode.get('isFetchable')) {
        node = fromNode;
      } else {
        node = fromNode.get('nearestFileNode');
      }
      var record = Multivio.store.find(Multivio.FileRecord, node.get('url'));
      if (!record.get('isReady')) {
        SC.Logger.debug("Append");
        record.set('_ancestorFileNode', node.get('_ancestorFileNode'));
        node.appendChildren([record]);
      }
      //SC.Logger.debug("Get Next: %@ (%@)".fmt(node.get('url'), Multivio.currentFileNodeController.get('url')));
      Multivio.currentFileNodeController.set('content', record);
    }
  }),

  /**
    SUBSTATE DECLARATION

    @type SC.State
  */
  gettingNextFile: SC.State.design({
    
    /** */
    enterState: function (fromNode) {
      var node;
      if (fromNode.get('isFetchable')) {
        node = fromNode;
      } else {
        if (fromNode.get('isFile')) {
          var next = fromNode.get('nearestFileNode').get('hasNextFile');
          node = next;
        } else {
          node = fromNode.get('nearestFileNode');
        }
      }
      var record = Multivio.store.find(Multivio.FileRecord, node.get('url'));
      if (!record.get('_ancestorFileNode')) {
        SC.Logger.debug("Append");
        record.set('_ancestorFileNode', node.get('_ancestorFileNode'));
        node.appendChildren([record]);
      }
      //alert('set currentFileNode: %@'.fmt(record.get('url')));
      if (record && record.getPath('storeKey') !== Multivio.currentFileNodeController.get('storeKey')) {
        Multivio.currentFileNodeController.set('content', record);
      }
      Multivio.currentFileNodeController.set('currentIndex', 1);
    }
  }),

  /**
    SUBSTATE DECLARATION

    @type SC.State
  */
  gettingPreviousFile: SC.State.design({
    
    /** */
    enterState: function (fromNode) {
      var previous = fromNode.get('hasPreviousFile');
      var record = Multivio.store.find(Multivio.FileRecord, previous.get('url'));
      record.set('_ancestorFileNode', previous.get('_ancestorFileNode'));
      SC.Logger.debug("Get Previous: %@".fmt(previous.get('url')));
      if (record && record.getPath('storeKey') !== Multivio.currentFileNodeController.get('storeKey')) {
        Multivio.currentFileNodeController.set('content', record);
      }
      Multivio.currentFileNodeController.set('currentIndex', 1);
    }
  })


});
