// ==========================================================================
// Project:   Multivio.TreeView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

(Document Your View Here)

@extends SC.View
*/
sc_require('controllers/tree.js');
Multivio.SearchViewItem = SC.ListItemView.extend(SC.AutoResize,
  /** @scope Multivio.NavigationItem.prototype */ {

  // TODO: Add your own code here.
  escapeHTML: NO,
  displayProperties: ['label'],
  //layout: {height: 40, centerX: 0, centerY: 0, width: 200}
  classNames: ['mvo-toc-entry'],
  supportsAutoResize: YES,
  iconWidth: 16,

  autoResizeText: function() {
    return this.getPath('content.label');
  }.property('content'),

  autoResizeLayer: function() {
      return this.get('layer');
  }.property(),

  autoResizePadding: function() {
    var width = 0;
    width = this.get('iconWidth') + (this.get('outlineLevel') + 1) * this.get('outlineIndent');
    return {width: width, height: 0};
  }.property('outlineLevel', 'outlineIndent', 'iconWidth').cacheable(),
  
  _measureSizeDidChange: function () {
    var contentWidth = this.get('measuredSize').width;
    var parentView = this.get('parentView');
    if(contentWidth > parentView.get('frame').width) {
      parentView.adjust('width', contentWidth);
    }
  }.observes('measuredSize')

});

Multivio.SearchView = SC.PickerPane.design({
  isAnchored: YES,
  isModal: NO,
  layout: { width: 314, bottom: 100},
  layerId: 'mvo-tree-view',
  canBeClosed: YES,
  contentView: SC.View.design({
    childViews: ['messageLabelView', 'searchQueryView',
      'previousResultButtonView', 'nextResultButtonView', 'resultsScrollView',
      'searchScopeView', 'waitingView'],

      searchQueryView: SC.TextFieldView.design({
        layout: { top: 0, left: 0, right: 0, height: 24 },
        applyImmediately: NO,
        hintBinding: 'Multivio.searchTreeController.defaultQueryMessage',
        valueBinding: 'Multivio.searchTreeController.query',
        fieldDidFocus: function(evt) {
          sc_super();
          this.selectAll();
        },

        selectAll: function() {
          var start = 0;
          if(!SC.none(this.get('value'))) {
            var end = this.get('value').length;
            var selection = SC.TextSelection.create({ start:start, end:end });
            this.set('selection', selection);
          }
        },
        rightAccessoryView: SC.ImageButtonView.design({
          layout: { top: 2, right: 0, width: 20, height: 20 },
          isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',
          image: 'image-button-search-16',
          title: 'search',
          target: 'Multivio.mainPage.searchView.contentView.searchQueryView',
          action: 'commitEditing'
        })
      }),

      resultsScrollView: SC.ScrollView.design({
        layout: { top: 100, left: 0, right: 0, bottom: 0 },
        contentView: SC.SourceListView.design({
          rowHeight: 18,
          rowSpacing: 4,
          contentValueKey: 'label',
          contentBinding: 'Multivio.searchTreeController.arrangedObjects',
          selectionBinding: 'Multivio.searchTreeController.selection',
          exampleView: Multivio.SearchViewItem
        })
      }),
        
      nextResultButtonView: SC.ImageButtonView.design({
        layout: { top: 70, height: 20, width: 20, right: 0 },
        image: 'image-button-down-16',
        title: 'searchNext',
        target: 'Multivio.searchTreeController',
        action: 'goToNextResult'
      }),

      previousResultButtonView: SC.ImageButtonView.design({
        layout: { top: 70, height: 20, width: 20, right: 24 },
        image: 'image-button-up-16',
        title: 'searchPrevious',
        target: 'Multivio.searchTreeController',
        action: 'goToPreviousResult'
      }),

      searchScopeView : SC.SelectButtonView.design({

        layout: { top: 36, left: 0, right: 0, height: 25 },
        isEnabledBinding: 'Multivio.searchTreeController.allowsSelection',    
        toolTip: '_searchIn'.loc(),
        valueBinding: 'Multivio.searchTreeController.currentSearchFile',
        objectsBinding: 'Multivio.searchTreeController.currentFileList',
        nameKey: 'label',
        theme: 'square',
        valueKey: 'url',
        disableSort: YES,
        checkboxEnabled: YES,
        needsEllipsis: NO,
        supportFocusRing: NO
      }),

      waitingView: SC.ImageView.design({
        layout: { top: 72, left: 0, width: 22, height: 22 },
        
        //canvas do not work with animated gifs
        useCanvas: NO,

        isVisible: YES,
        isVisibleBinding: 'Multivio.searchResultsController.isLoading',
        value: static_url('images/progress_wheel_medium.gif'),
        classNames: "mvo-waiting-small".w()
      }),

      messageLabelView: SC.LabelView.design({
        layout: { top: 72, left: 30, right: 0, height: 22 },
        textAlign: SC.ALIGN_LEFT,
        classNames: 'message',
        valueBinding: 'Multivio.searchTreeController.searchStatus'
      })

  }),

  modalPaneDidClick: function(evt) {
    if(this.get('canBeClosed'))
      {
        return sc_super();
      } else {
        return NO ;
      }
  }

});
