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
Multivio.NavigationItem = SC.ListItemView.extend({

  // TODO: Add your own code here.
  displayProperties: ['icon', 'panel'],
  layout: {height: 40, centerX: 0, centerY: 0, width: 40},
  mouseEntered: function () {
    var jquery = this.$();
    jquery.css('cursor', 'pointer');
    jquery.css('color', '#356aa0');
    return YES;
  },
  mouseExited: function () {
    var jquery = this.$();
    jquery.css('cursor', 'normal');
    jquery.css('color', '#000');
    return YES;
  },
  render: function (context) {
    var content = this.get('content');

    context.push('<img src="', content.get('icon'), '"/>');
    //context.push('<p>',content.get('panel'), '</p>');
  },
  update: function (jquery) {
    jquery.find('h1').text(this.get('url'));
  }

});
