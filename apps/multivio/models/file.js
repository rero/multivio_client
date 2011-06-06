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
  }.property('metadata'),//.cacheable()
  
  isSearchable: function(){
    if(this.get('metadata').mime.match(/pdf/)){
      return YES;
    }
    return NO;
  }.property('metadata'),//.cacheable()

  label: function(){
    var parent = this.get('parent');
    if(parent) {
      var phys = parent.get('physicalStructure');
      if(phys){
      var meInParent = phys.findProperty('url', this.get('url'));
      return meInParent.label;
      }
    }
    return this.title;
  }.property('metadata', 'parent'),//.cacheable()

  isPdfFile: function(){
    if(this.get('metadata').mime.match(/pdf$/)){
      return NO;
    }
    return YES;
  }.property('metadata')//.cacheable()

});

