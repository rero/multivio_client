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
    opacity: { duration: 0.5, timing: SC.Animatable.TRANSITION_CSS_EASE_IN_OUT } // CSS-transition-only timing function (JavaScript gets linear)
    //display: .75 // a bit longer than opacity 
  },

  mouseEntered: function (evt) {
    this.adjust("opacity", 1.0);

    return YES;
  },
  
  /**
    Event that occurs when the mouse exit this view. Create a timer that hides
    the view after - 1 sec.
    
    @param {SC.Event}
  */
  mouseExited: function (evt) {
    this.adjust("opacity", 0.0);
    return YES;
  }

};
