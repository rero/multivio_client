/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/** @class

  TODO...

@extends SC.Object
*/

Multivio.inputParameters = SC.Object.create({

  options: {},

  read: function () {
    this.beginPropertyChanges();
    this.set('options', {});
    var inputUrl = !SC.none(location.hash) ? location.hash.slice(1) : null;
    SC.Logger.debug("Read input args: " + inputUrl);
    if (!SC.none(inputUrl)) {
      var inputRegExp = /(.*?)url=(.*)/;
      var inputParts = inputRegExp.exec(inputUrl);

      //get input url argument
      var referer = inputParts.pop();
      //this.set('url', referer);
      SC.Logger.debug("Referer: " + referer);

      //remove all match
      inputParts.shift();
      var options = {}, i;
      
      var optionsParts = inputParts.pop().slice(0, -1).split('&');
      for (i = 0; i < optionsParts.length; i++) {
        var res = optionsParts[i].split('='); 
        options[res[0]] = res[1];
      }
      options.url = referer;
      this.set('options', options);
    }
    this.endPropertyChanges();
  }
});

