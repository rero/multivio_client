// ==========================================================================
// Project:   Multivio.NavigationItem
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
Multivio.NavigationItem = SC.ListItemView.extend(
/** @scope Multivio.NavigationItem.prototype */ {

  // TODO: Add your own code here.
  displayProperties: ['icon', 'panel'],
  layout: {height: 35},
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

    context.push('<img src="',content.get('icon'), '"/>');
    //context.push('<p>',content.get('panel'), '</p>');
  },
  update: function (jquery) {
    jquery.find('h1').text(this.get('url'));
  }

});
