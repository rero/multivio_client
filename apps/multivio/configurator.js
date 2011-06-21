/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

/**
  @namespace

  Object that stores and manages all configuration parameters

  @author che
  @extends SC.Object
  @since 0.1.0
*/
Multivio.configurator = SC.Object.create(
/** @scope Multivio.configurator.prototype */ {
  
  /**
    The support address
  */
  support: 'info@multivio.org',  
  
  /**
    The name of the multivio server
    
    @property String
    @default server
  */
  serverName: null,
  
  /**
    The version of the server
    
    @property String
  */  
  serverVersion: undefined,
  
  /**
    The version of compatibility between server and client
  */
  serverCompatibility: '0.4.0'


});
