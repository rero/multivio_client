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
      'findAllView', 'labelView',
      'resultsScrollView', 'waitingView'],
      //'previousResultButtonView', 'nextResultButtonView', 'resultsScrollView',

      searchQueryView: SC.TextFieldView.design({
        layout: { top: 0, left: 0, right: 0, height: 24 },
        applyImmediately: NO,
        hintBinding: 'Multivio.searchTreeController.defaultQueryMessage',
        valueBinding: 'Multivio.searchTreeController.currentQuery',
        //TODO: to change to isEditable when sproutcore will be solved the
        //      problem.
        isEnabledBinding: 'Multivio.searchTreeController.isEditable',
        fieldDidFocus: function(evt) {
          sc_super();
          this.set('value','');
          //this.selectAll();
        },

        selectAll: function() {
          var start = 0;
          if(!SC.none(this.get('value'))) {
            var end = this.get('value').length;
            var selection = SC.TextSelection.create({ start:start, end:end });
            this.set('selection', selection);
          }
        },
        leftAccessoryView: SC.ImageButtonView.design({
          layout: { top: 2, left: 0, width: 20, height: 20 },
          isEnabledBinding: 'Multivio.searchTreeController.isEditable',
          image: 'image-button-search-16',
          title: 'search',
          target: 'Multivio.mainPage.searchView.contentView.searchQueryView',
          action: 'commitEditing'
        }),
        rightAccessoryView: SC.ImageButtonView.design({
          layout: { top: 2, right: 0, width: 20, height: 20 },
          isEnabledBinding: 'Multivio.searchTreeController.isLoading',
          image: 'image-button-cancel-16',
          title: 'cancel-search',
          //defaultResponder: 'Multivio.mainStatechart',
          target: 'Multivio.searchTreeController',
          action: 'cancelSearch'
        })
      }),

      findAllView: SC.CheckboxView.design({
        layout: { top: 24, left: 0, width: 20, height: 20 },
        toggleOffValue: NO,
        toggleOnValue: YES,
        isEnabledBinding: SC.Binding.oneWay('Multivio.searchTreeController.isLoading').not(),
        valueBinding: 'Multivio.searchTreeController.searchInAll'
      }),

      labelView: SC.LabelView.design({
        layout: { top: 24, left: 22, right: 0, height: 20 },
        value: "Search to all"
      }),

      resultsScrollView: SC.ScrollView.design({
        layout: { top: 44, left: 0, right: 0, bottom: 20 },
        contentView: SC.SourceListView.design({
          rowHeight: 18,
          rowSpacing: 4,
          contentValueKey: 'label',
          contentBinding: 'Multivio.searchTreeController.arrangedObjects',
          selectionBinding: 'Multivio.searchTreeController.selection',
          exampleView: Multivio.SearchViewItem
        })
      }),
        
      /*
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
      */

      waitingView: SC.ImageView.design({
        layout: { bottom: 0, right: 0, width: 20, height: 20 },
        
        //canvas do not work with animated gifs
        useCanvas: NO,

        isVisible: YES,
        isVisibleBinding: 'Multivio.searchTreeController.isLoading',
        value: static_url('images/progress_wheel_medium.gif'),
        classNames: "mvo-waiting-small".w()
      }),

      messageLabelView: SC.LabelView.design({
        layout: { bottom: 0, left: 0, right: 22, height: 20 },
        textAlign: SC.ALIGN_RIGHT,
        classNames: 'message',
        valueBinding: 'Multivio.searchTreeController.msgStatus'
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
