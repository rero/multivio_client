// ==========================================================================
// Project:   Multivio.documentController Unit Test
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Multivio module test ok equals same stop start */

module("Multivio.documentController");

function checkTitle() {
  // Should be to find record now
	var url = 'http://doc.rero.ch/record/4321/export/xm';
	var title = Multivio.documentController.find(url).get('metadata').title;
	SC.Logger.debug(title);
  equals(title, '"Ho rifatto la mia vita due volte"', 'serverVersion should not be defined');
  start();
  // Resume the test runner again
}

test('check Metadata', function() {
  // Pause the test runner. If start() is not called within 2 seconds, fail the test.
  stop(2000);
	var url = 'http://doc.rero.ch/record/4321/export/xm';
	Multivio.documentController.set('content', Multivio.CDM); 
	Multivio.documentController.fetchFile(url); 
  // Give our store 1 second to commit records to the remote server
  setTimeout(checkTitle, 1000);
});
