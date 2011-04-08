/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

Multivio.FileRecord = SC.Object.extend({
  received: null,
  parent: undefined,
  metadata: null,
  physicalStructure: null,
  logicalStructure: null,
  url: null,

  init: function(){
    sc_super();
    this.set('received', []);
  },

  isComplete: function(){
    if(this.get('received').length === 3){
      return YES;
    }
    return NO;
  }.property('received'), //.cacheable()

  isContentFile: function(){
    if(this.get('metadata').mime.match(/xml$/)){
      return NO;
    }
    return YES;
  }.property('metadata')//.cacheable()

});

