// ==========================================================================
// Project:   MyApp.Metadata
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals MyApp */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/

Multivio.ServerRecord = SC.Record.extend({

  // TODO: Add your own code here.
  //
  name: SC.Record.attr(String),
  api_version: SC.Record.attr(String),
  version: SC.Record.attr(Number),
  
  serverCompatibility: '0.4.0',
  isReady: function () { 
    return (this.get('status') & SC.Record.READY) !== 0; 
  }.property('status'),

  isOk: function () {
    var toCompare = this.get('api_version');
    var version = this.get('serverCompatibility'), i;

    if (SC.none(version) || SC.none(toCompare)) {
      return NO;
    }
    var vers = version.split(".");
    var toCompareVersion = toCompare.split(".");
    if (vers.length !== toCompareVersion.length) {
      return NO;
    }

    for (i = 0; i < 3; i++) {
      if (parseInt(vers[i], 10) < parseInt(toCompareVersion[i], 10)) {
        SC.Logger.debug("i:" + i);
        return NO;
      }
    }
    return YES;
  }.property('serverCompatibility', 'api_version')

});

