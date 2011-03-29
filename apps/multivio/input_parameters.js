/**
==============================================================================
	Project:    Multivio - https://www.multivio.org/
	Copyright:  (c) 2009-2011 RERO
	License:    See file license.js
==============================================================================
*/

/** 
@class

	CDM (Core Document Model) is the global model of the application. 
	The CDM consists of 4 objects.

	CDM can return as response:
		-1: the response is not on the client-side but 
				the request has been transmitted to the server
		{Object}: the response of the request. The response can be 'null'

@extends SC.Object
@version 0.2.0
*/

Multivio.inputParameters = SC.Object.create({

	url: undefined,

	options: {},

	read: function(){
		this.set('url', undefined);
		this.set('options', {});
		var inputUrl = !SC.none(location.hash) ? location.hash.slice(1) : undefined;
		SC.Logger.debug("Read input args: " + inputUrl);
		if (!SC.none(inputUrl)) {
			var inputRegExp = /(.*?)url=(.*)/;
			var inputParts = inputRegExp.exec(inputUrl);

			//get input url argument
			var referer = inputParts.pop();
			this.set('url', referer);
			SC.Logger.debug("Referer: " + referer);

			//remove all match
			inputParts.shift();
			var options = {};
			
			var optionsParts = inputParts.pop().slice(0,-1).split('&');
			for(var val in optionsParts){
				if(optionsParts.hasOwnProperty(val)){  
					res = val.split('=');	
					options[res[0]] = options[res[1]];
				}
			}
			this.set('options', options);
			SC.Logger.debug("Options: " + options);
		}
	}
});

