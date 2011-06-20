/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/** @class

(Document Your View Here)

@extends SC.View
*/
Multivio.CenterImage = SC.View.extend({
  layout: {top: 5, right: 5, bottom: 5, left: 5},
  childViews: ['imageView', 'selectionView', 'infoPanel'],
  classNames: "mvo-center-image".w(),
  visibleWidth: 0,
  visibleHeight: 0,
  image: null,
  imageBinding: "*imageView.image",

  imageDidLoad: function () {
    var img_height = this.get('image').height;
    var img_width = this.get('image').width;
    var parent_width = this.get('visibleWidth');
    var parent_height = this.get('visibleHeight');
    var _layout = {};
    if(img_height > 1 && img_width > 1) {
      _layout.width = img_width;
      _layout.height = img_height;
      if(parent_width > img_width) {
        _layout.centerX = 0;
      }else{
        _layout.left = 0;
      }
      if(parent_height > img_height) {
        _layout.centerY = 0;
      }else{
        _layout.top = 0;
      }
      this.set('layout', _layout);
      this.notifyPropertyChange("layer");
      SC.Logger.debug('ImageView updated');
    }
  }.observes('image'),

  parentViewDidResize: function() {
    sc_super();
    this.set('visibleHeight', this.getPath('parentView.frame').height);
    this.set('visibleWidth', this.getPath('parentView.frame').width);
  },

  infoPanel: SC.NavigationBarView.design(SC.Animatable, Multivio.FadeInOut, {
    classNames: "mvo-front-view-transparent".w(),
    layout: { centerX: 0, width: 100, height: 30, top: 16 },
    acceptsFirstResponder: NO,
    childViews: ['textView'],
    textView: SC.LabelView.design({
      layout: { centerY: 0, centerX: 0, width: 80, height: 20 },
      textAlign: 'center',
      value: null
      //valueBinding: 'Multivio.pdfFileController.infoMessage'
    })
  }),

  selectionView: SC.CollectionView.design({
    layout: {left: 0, right: 0, top:0, bottom:0},
    nativeSize: null,
    rotationAngle: null,

    currentZoomFactor: function() {
      var angle = this.get('rotationAngle');
      if(angle % 180) {
        return this.getPath('frame.height')/this.get('nativeSize').width;
      }else{
        return this.getPath('frame.width')/this.get('nativeSize').width;
      }
    }.property('nativeSize', 'layout', 'rotationAngle'),

    viewDidResize: function() {
      sc_super();
      this.reload(); 
    },
      _selectionDidChanged: function() {
        var sel = this.get('selection');
        if(!SC.none(sel) && sel.firstObject()) {
          sel = sel.firstObject();
          var itemView = this.itemViewForContentObject(sel) ;
          if (itemView) this.scrollToItemView(itemView) ;
        }
      }.observes('selection'),

    layoutForContentIndex: function(contentIndex) {
      var current = this.get('content').objectAt(contentIndex);
      var zoomFactor = this.get('currentZoomFactor');
      SC.Logger.debug("------> %@".fmt(this.get('nativeSize')));
      if(current){
        var angle = this.get('rotationAngle');
          switch(Math.abs(angle % 360)) {
            case 0:
              return {
              top: current.get('y1')*zoomFactor,
              left: current.get('x1')*zoomFactor,
              height: (current.get('y2') - current.get('y1'))*zoomFactor,
              width: (current.get('x2') - current.get('x1'))*zoomFactor
            };
            case 90:
              return {
              right: current.get('y1')*zoomFactor,
              top: current.get('x1')*zoomFactor,
              width: (current.get('y2') - current.get('y1'))*zoomFactor,
              height: (current.get('x2') - current.get('x1'))*zoomFactor
            };
            case 180:
              return {
              bottom: current.get('y1')*zoomFactor,
              right: current.get('x1')*zoomFactor,
              height: (current.get('y2') - current.get('y1'))*zoomFactor,
              width: (current.get('x2') - current.get('x1'))*zoomFactor
            };
            case 270:
              return {
              left: current.get('y1')*zoomFactor,
              bottom: current.get('x1')*zoomFactor,
              width: (current.get('y2') - current.get('y1'))*zoomFactor,
              height: (current.get('x2') - current.get('x1'))*zoomFactor
            };
          }
      }
    },

    exampleView: SC.View.extend(SC.Control,{
      classNames: "mvo-search-results".w(),
      render: function(context){
        if(this.get('isSelected')) {
        context.addClass('sel');
        }
      }
    })
  }),

  imageView : SC.ImageView.design({
    classNames: "mvo-page".w(),
    layout: {left: 0, right: 0, top: 0, bottom: 0},
    canLoadInBackground: YES,
    imageDidLoad: function (url, imageOrError) {
      //TODO: why do I have to adjust width/height as the layout is defined to
      //take all the stuffs!
      this.adjust('width', this.get('image').width);
      this.adjust('height', this.get('image').height);
    }.observes('image'),

    //redifined this default method in order remove the defaultBlankImage
    _image_valueDidChange: function() {
      var value = this.get('imageValue');
      SC.Logger.debug('New value: %@'.fmt(value));
      type = this.get('type');

      // check to see if our value has changed
      if (value !== this._iv_value) {
        this._iv_value = value;

        // While the new image is loading use SC.BLANK_IMAGE as a placeholder
        //this.set('image', SC.BLANK_IMAGE);
        this.set('status', SC.IMAGE_STATE_LOADING);

        // order: image cache, normal load
        if (!this._loadImageUsingCache()) {
          if (!this._loadImage()) {
            // CSS class? this will be handled automatically
          }
        }
      }
    }.observes('imageValue').cacheable()
  })
});
