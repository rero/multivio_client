/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/
/*globals Multivio module test ok equals same stop start */


module("Multivio.CDM");

function checkServerHasVersion() {
  // Should be to find record now
  SC.Logger.debug(Multivio.CDM.get('serverVersion'));
  ok(Multivio.configurator.get('serverVersion') !== undefined, 'serverVersion should be defined');
  // Resume the test runner again
  start();
}

function checkServerVersionKo() {
  // Should be to find record now
  equals(Multivio.configurator.get('serverVersion'), undefined, 'serverVersion should not be defined');
  // Resume the test runner again
  start();
}

function checkTitle() {
  // Should be to find record now
  var url = 'http://doc.rero.ch/record/4321/export/xm';
  var title = Multivio.CDM.findProperty('url', url).get('metadata').title;
  equals(title, '"Ho rifatto la mia vita due volte"', 'serverVersion should not be defined');
  // Resume the test runner again
  start();
}

function checkLogic() {
  // Should be to find record now
  var url = 'http://doc.rero.ch/lm.php?url=1000,40,6,20091106095458-OI/2009INFO006.pdf';
  var logic = Multivio.CDM.findProperty('url', url).get('logicalStructure');
  equals(logic[0].label, 'Contents', 'first entry for logical should be Content');
  // Resume the test runner again
  start();
}

function checkPhysic() {
  // Should be to find record now
  var url = 'http://doc.rero.ch/lm.php?url=1000,40,6,20091106095458-OI/2009INFO006.pdf';
  var physic = Multivio.CDM.findProperty('url', url).get('physicalStructure');
  equals(physic[0].label, '2009INFO006.pdf', 'first entry for physical should be 2009INFO006.pdf');
  // Resume the test runner again
  start();
}

test('check Server has Version', function() {
  // Pause the test runner. If start() is not called within 2 seconds, fail the test.
  stop(2000);
  Multivio.CDM.getServerInfo(); 
  // Give our store 1 second to commit records to the remote server
  setTimeout(checkServerHasVersion, 1000);
});

test('check Server Compatibility Ko', function() {
  // Pause the test runner. If start() is not called within 2 seconds, fail the test.
  stop(2000);
  Multivio.configurator.set('serverCompatibility', '0.0.0');
  Multivio.CDM.getServerInfo(); 
  // Give our store 1 second to commit records to the remote server
  setTimeout(checkServerVersionKo, 1000);
});

test('check Metadata', function() {
  // Pause the test runner. If start() is not called within 2 seconds, fail the test.
  stop(2000);
  var url = 'http://doc.rero.ch/record/4321/export/xm';
  Multivio.CDM.getMetadata(url); 
  // Give our store 1 second to commit records to the remote server
  setTimeout(checkTitle, 1000);
});

test('check Logical structure', function() {
  // Pause the test runner. If start() is not called within 2 seconds, fail the test.
  stop(2000);
  var url = 'http://doc.rero.ch/lm.php?url=1000,40,6,20091106095458-OI/2009INFO006.pdf';
  Multivio.CDM.getLogicalStructure(url); 
  // Give our store 1 second to commit records to the remote server
  setTimeout(checkLogic, 1000);
});

test('check Physical structure', function() {
  // Pause the test runner. If start() is not called within 2 seconds, fail the test.
  stop(2000);
  var url = 'http://doc.rero.ch/lm.php?url=1000,40,6,20091106095458-OI/2009INFO006.pdf';
  Multivio.CDM.getPhysicalStructure(url); 
  // Give our store 1 second to commit records to the remote server
  setTimeout(checkPhysic, 1000);
});

test('file record creation', function() {
  var url = "http://doc.rero.ch/record/4321/export/xm";
  var fileRec = Multivio.FileRecord.create({url: url});
  equals(fileRec.url, url, "Objects should be equals");
});

test('check push cdm', function() {
  var url = "http://doc.rero.ch/record/4321/export/xm";
  var fileRec = Multivio.FileRecord.create({url: url});
  Multivio.CDM.pushObject(fileRec);
  var result = Multivio.CDM.findProperty('url', url);
  equals(url, result.url, "Objects should be equals");
});
