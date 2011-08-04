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
Multivio.TitleView = SC.View.extend({

  layout: {bottom: 0, left: 10, height: 30, right: 10},
  childViews: 'titleLabel'.w(),

  titleLabel: SC.LabelView.design({
    layout: { width: 500, height: 18 },
    value: "Welcome on pdfView",
    contentBinding: 'Multivio.rootNodeController',
    contentValueKey: 'title'
  })

});
