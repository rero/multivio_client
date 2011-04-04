
  // help
Multivio.HelpPane = SC.PickerPane.design({
  isAnchored: YES,
    layout: { width: 320, bottom: 100 },
    contentView: SC.ScrollView.design({
      layout: { top: 2, bottom: 2, left: 2, right: 2 },
      borderStyle: SC.BORDER_NONE,
      hasHorizontalScroller: NO,
      //contentView: SC.StaticContentView.design({
      contentView: SC.LabelView.design({
        layout: {top: 2, height: 2500, width:300},
        classNames: "help-panel",
        escapeHTML: NO,
        isTextSelectable: YES,
        value: '<h1>' + '_helpTitle'.loc() + '</h1>'
        + '_helpIntro'.loc()
        + '<h4>' + '_helpVerticalBar'.loc() + '</h4>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/tree_dark_24x24.png") + '"/>' + '_helpToc'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/thumbnails_dark_24x24.png") + '"/>' + '_helpThum'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/search_dark_24x24.png") + '"/>' + '_helpSearch'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/information_dark_24x24.png") + '"/>' + '_helpMetadata'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/download_dark_24x24.png") + '"/>' + '_helpDownload'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/show_toolbar_dark_24x24.png") + '"/>' + '_helpDisplayBar'.loc() + '</p>'
        + '<h4>' + '_helpNavigationBar'.loc() + '</h4>'
        + '<p>' + '_helpNavigationBarDesc'.loc() + '<p/>'
        + '<p><img class="" style= "" src="' + sc_static("images/icons/24x24/loupe_dark_24x24.png") + '"/>' + '_helpLoupe'.loc() + '</p>'
        + '<p><img class="" style= "" src="' + sc_static("images/icons/24x24/pan_dark_24x24.png") + '"/>' + '_helpPan'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/rotate_left_dark_24x24.png") + '"/>'
        + '<img class="" style= "" src="' + sc_static("images/icons/24x24/rotate_right_dark_24x24.png") + '"/>' + '_helpRotation'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/jump_backwards_dark_24x24.png") + '"/>'
        + '<img class="" style= "" src="' + sc_static("images/icons/24x24/go_backwards_dark_24x24.png") + '"/>'
        + '<img class="" style= "" src="' + sc_static("images/icons/24x24/go_forward_dark_24x24.png") + '"/>'
        + '<img class="" style= "" src="' + sc_static("images/icons/24x24/jump_forward_dark_24x24.png") + '"/>' + '_helpNavigation'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/zoom_minus_dark_24x24.png") + '"/>'
        + '<img class="" style= "" src="' + sc_static("images/icons/24x24/zoom_plus_dark_24x24.png") + '"/>' + '_helpZoom'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/full_size_dark_24x24.png") + '"/>' + '_helpFullSize'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/full_width_dark_24x24.png") + '"/>' + '_helpFullWidth'.loc() + '</p>'
        + '<p>' + '<img class="" style= "" src="' + sc_static("images/icons/24x24/100_percent_dark_24x24.png") + '"/>' + '_helpNativeSize'.loc() + '</p>'
        + '<h4>' + '_mouseActionsTitle'.loc() + '</h4>'
        + '<p>' + '_mouseActions'.loc('<img class="" style= "" src="' + sc_static("images/icons/24x24/pan_dark_24x24.png") + '"/>') + '</p>'
        + '<h4>' + '_keyShortcutsTitle'.loc() + '</h4>'
        + '<p>' + '_keyShortcuts'.loc() + '</p>'

      })
    })
});

