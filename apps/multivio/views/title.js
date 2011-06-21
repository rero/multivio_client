// ==========================================================================
// Project:   Multivio.TitleView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
Multivio.TitleView = SC.View.extend(
/** @scope Multivio.TitleView.prototype */ {

  layout: { bottom: 0, left: 10, height: 30 , right: 10 },
  childViews: 'titleLabel'.w(),

  titleLabel: SC.LabelView.design({
    layout: { width: 500, height: 18 },
    value: "Welcome on pdfView",
    contentBinding: 'Multivio.rootNodeController',
    contentValueKey: 'title'
  })
  // TODO: Add your own code here.

});
