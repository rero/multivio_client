/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2011 RERO
License: See file COPYING
==============================================================================
*/
/*globals Multivio module test ok equals same stop start */



module("Multivio.documentController" , {
  setup: function() {
    Multivio.mainStatechart = Ki.Statechart.create({
      initialState: 'test',
      test: Ki.State.design({})
    });
    Multivio.mainStatechart.initStatechart();
    Multivio.CDM.set('requestHandler', Multivio.fixtureRequestHandler);
    Multivio.documentController.set('content', Multivio.CDM); 
  }
});


test('check Metadata', function() {
  // Pause the test runner. If start() is not called within 2 seconds, fail the test.
  var url = 'http://doc.rero.ch/record/4321/export/xm';
  SC.RunLoop.begin();
  Multivio.documentController.set('content', Multivio.CDM); 
  Multivio.documentController.fetchFile(url); 
  SC.RunLoop.end();
  // Give our store 1 second to commit records to the remote server
  var title = Multivio.fileController.get('metadata').title;
  equals(title, '"Ho rifatto la mia vita due volte"', 'serverVersion should not be defined');
});

test('check hasNext', function() {
// Pause the test runner. If start() is not called within 2 seconds, fail the test.
  var url = 'http://doc.rero.ch/record/10138/export/xm';
  
  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(url); 
  SC.RunLoop.end();
  
  var parent = Multivio.fileController.get('content');
  var phys = parent.get('physicalStructure'); 
  var newUrl = phys[0].url;

  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(newUrl, parent); 
  SC.RunLoop.end();

  equals(Multivio.documentController.get('hasNextFile'), YES, newUrl + ': should have brothers');
});

test('check do not hasNext', function() {
// Pause the test runner. If start() is not called within 2 seconds, fail the test.
  var url = 'http://doc.rero.ch/record/10138/export/xm';
  
  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(url); 
  SC.RunLoop.end();
  
  var parent = Multivio.fileController.get('content');
  var phys = parent.get('physicalStructure'); 
  var newUrl = phys[phys.length - 1].url;
  //var newUrl = phys[phys.length - 1].url;
  
  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(newUrl, parent); 
  SC.RunLoop.end();
  equals(Multivio.documentController.get('hasNextFile'), NO, newUrl + ': should not have next as is last element');
});

test('check hasPrevious', function() {
// Pause the test runner. If start() is not called within 2 seconds, fail the test.
  var url = 'http://doc.rero.ch/record/10138/export/xm';

  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(url); 
  SC.RunLoop.end();
  
  var parent = Multivio.fileController.get('content');
  var phys = parent.get('physicalStructure'); 
  var newUrl = phys[1].url;

  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(newUrl, parent); 
  SC.RunLoop.end();

  equals(Multivio.documentController.get('hasPreviousFile'), YES, newUrl + ': should have previous');
});

test('check do not have hasPrevious', function() {
// Pause the test runner. If start() is not called within 2 seconds, fail the test.
  var url = 'http://doc.rero.ch/record/10138/export/xm';

  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(url); 
  SC.RunLoop.end();
  
  equals(Multivio.documentController.get('hasPreviousFile'), NO, url + ': should not have previous');
});

test('check getNext', function() {
// Pause the test runner. If start() is not called within 2 seconds, fail the test.
  var url = 'http://doc.rero.ch/record/10138/export/xm';
  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(url); 
  SC.RunLoop.end();

  var parent = Multivio.fileController.get('content');
  var phys = parent.get('physicalStructure'); 
  var refUrl = phys[1].url;

  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(refUrl, parent); 
  SC.RunLoop.end();

  var newUrl = phys[0].url;
  
  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(newUrl, parent); 
  SC.RunLoop.end();

  SC.RunLoop.begin();
  Multivio.documentController.nextFile();
  SC.RunLoop.end();

  equals(Multivio.fileController.get('url'), refUrl, refUrl + ': should next to ' + newUrl);
});

test('check getPrevious', function() {
// Pause the test runner. If start() is not called within 2 seconds, fail the test.
  var url = 'http://doc.rero.ch/record/10138/export/xm';
  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(url); 
  SC.RunLoop.end();

  var parent = Multivio.fileController.get('content');
  var phys = parent.get('physicalStructure'); 
  var refUrl = phys[0].url;

  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(refUrl, parent); 
  SC.RunLoop.end();

  var newUrl = phys[1].url;
  
  SC.RunLoop.begin();
  Multivio.documentController.fetchFile(newUrl, parent); 
  SC.RunLoop.end();

  SC.RunLoop.begin();
  Multivio.documentController.previousFile();
  SC.RunLoop.end();

  equals(Multivio.fileController.get('url'), refUrl, refUrl + ': should next to ' + newUrl);
});
