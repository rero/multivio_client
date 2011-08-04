// ==========================================================================
// Project:   Multivio.Overview
// Copyright: @2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
sc_require('controllers/overview.js');

Multivio.Overview = SC.PickerPane.design({
  layout: {bottom: 115, right: 15, width: 155, height: 155},
  isAnchored: YES,
  isModal: NO,
  contentView: SC.View.extend({
    layout: {top: 5, right: 5, bottom: 5, left: 5},
    childViews: ['imageView'],
    classNames: "mvo-center-image".w(),
    image: null,
    imageBinding: "*imageView.image",

    imageDidLoad: function () {
      var img_height = this.get('image').height,
        img_width = this.get('image').width,
        _layout = {};

      if (img_height > 1 && img_width > 1) {
        _layout.width = img_width;
        _layout.height = img_height;
        _layout.centerX = 0;
        _layout.centerY = 0;
        this.set('layout', _layout);
        this.notifyPropertyChange("layer");
        SC.Logger.debug('ImageView updated');
      }
    }.observes('image'),

    imageView: SC.ImageView.extend({
      classNames: "mvo-page".w(),
      valueBinding: 'Multivio.overviewController.currentUrl',
      canLoadInBackground: YES,
      imageDidLoad: function (url, imageOrError) {
        //TODO: why do I have to adjust width/height as the layout is defined to
        //take all the stuffs!
        this.adjust('width', this.get('image').width);
        this.adjust('height', this.get('image').height);
      }.observes('image'),

      //redifined this default method in order remove the defaultBlankImage
      _image_valueDidChange: function () {
        var value = this.get('imageValue'),
          type = this.get('type');

        // check to see if our value has changed
        if (value !== this._iv_value) {
          this._iv_value = value;

          //this.set('image', SC.BLANK_IMAGE);

          if (type !== SC.IMAGE_TYPE_CSS_CLASS) {
            // While the new image is loading use SC.BLANK_IMAGE as a placeholder
            this.set('status', SC.IMAGE_STATE_LOADING);

            // order: image cache, normal load
            if (!this._loadImageUsingCache()) {
              this._loadImage();
            }
          }
        }
      }.observes('imageValue').cacheable()
    })
  })

});
