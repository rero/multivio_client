/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

Multivio.FadeInOut = {
  
  transitions: {
    // and add transitions
    opacity: { duration: .5, timing: SC.Animatable.TRANSITION_CSS_EASE_IN_OUT } // CSS-transition-only timing function (JavaScript gets linear)
    //display: .75 // a bit longer than opacity 
  },

  _permanent: NO,
  //timer : SC.Timer(),

  /*
  init: function() {
    sc_super();
    this.set('timer', SC.Timer());
  },
  */

  displayBar:function () {
    SC.Logger.debug('Display ');
    if(!this.get('permanent')) {
      this.adjust('opacity', 1);
      //this.get('timer').schedule({ target: this, action: 'hidden', interval: 100 });
      SC.Timer.schedule({ target: this, action: 'hide', interval: 1000 });
    }
  },

  hide: function() {
    SC.Logger.debug('hide');
    if(!this.get('permanent')) {
      this.adjust("opacity", 0.0);
    }
  },

  mouseEntered: function (evt) {
    if(!this.get('permanent')) {
      this.adjust("opacity", 1.0);
    }
    return YES;
  },
  
  /**
    Event that occurs when the mouse exit this view. Create a timer that hides
    the view after - 1 sec.
    
    @param {SC.Event}
  */
  mouseExited: function (evt) {
    if(!this.get('permanent')) {
      this.adjust("opacity", 0.0);
    }
    return YES;
  },

  permanent: function(keyName, value){
    if (value !== undefined) {
      if(value === YES) {
        this.adjust("opacity", 1.0);
      } else {
        this.adjust("opacity", 0.0);
      }
      this._permanent = value;
    }
    return this._permanent;
  }.property('_permanent'),

  popup: function(anchor){
    if(this.get('permanent')) {
      this.set('permanent', NO);
    } else {
      this.set('permanent', YES);
    }
  },
  remove: function() {
      this.set('permanent', NO);
  }
};
