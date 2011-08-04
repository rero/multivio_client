/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file COPYING
==============================================================================
*/

sc_require('controllers/pdf.js');
sc_require('controllers/image.js');

/** @class

This is the controller create a list of image for the thumbnailView.

@author jma
@extends SC.ArrayController
*/
Multivio.imageThumbnailsController = SC.ArrayController.create({

  content: [],

  nPages: null,
  nPagesBinding: SC.Binding.oneWay('Multivio.imageFileController.nPages'),

  currentPage: null,
  currentPageBinding: 'Multivio.imageFileController.currentPage',

  urls: [],
  urlsBinding: SC.Binding.oneWay('Multivio.imageFileController._urls'),
  _appOptions: null,
  _appOptionsBinding: SC.Binding.oneWay('Multivio.inputParameters.options'),

  _thumbnailPrefix: function () {
    var server = 'server';
    if (!SC.none(this.get('_appOptions').server)) {
      server = this.get('_appOptions').server; 
    }
    return '/' + server + "/document/render?max_width=100&max_height=100";
  }.property('_appOptions').cacheable(),

  userClicked: function (pane) {
    var selection = pane.getPath('selection.firstObject');
    if (selection) {
      this.set('currentPage', selection.get('pageNumber'));
    }
  },

  _currentPageDidChange: function () {
    var currentPage = this.get('currentPage');
    if (currentPage) {
      var toSelect = this.objectAt(currentPage - 1);
      this.selectObject(toSelect);
    }
  }.observes('currentPage').cacheable(),

  _removeAll: function () {
    if (this.get('length') > 0) {
      this.removeAt(0, this.get('length')); 
    }
  },

  _nPagesDidChange: function () {
    this._removeAll();
    var nP = this.get('nPages');
    if (!SC.none(nP) && nP >= 0) {
      var pageNr = 1, i;
      for (i = 0; i < nP; i++) {
        this.pushObject(SC.Object.create({
          url: "%@&url=%@".fmt(this.get('_thumbnailPrefix'), this.get('urls')[i]),
          pageNumber: pageNr
        }));
        pageNr += 1;
      }
    }
  }.observes('nPages', 'urls').cacheable()

});

Multivio.pdfThumbnailsController = SC.ArrayController.create({
  
  content: [],

  nPages: null,
  nPagesBinding: SC.Binding.oneWay('Multivio.pdfFileController.nPages'),

  currentPage: null,
  currentPageBinding: 'Multivio.pdfFileController.currentPage',

  url: null,
  urlBinding: SC.Binding.oneWay('Multivio.pdfFileController.url'),

  _appOptions: null,
  _appOptionsBinding: SC.Binding.oneWay('Multivio.inputParameters.options'),

  _thumbnailPrefix: function () {
    var server = 'server';
    if (!SC.none(this.get('_appOptions').server)) {
      server = this.get('_appOptions').server; 
    }
    return '/' + server + "/document/render?max_width=100&max_height=100";
  }.property('_appOptions').cacheable(),

  userClicked: function (pane) {
    var selection = pane.getPath('selection.firstObject');
    if (selection) {
      this.set('currentPage', selection.get('pageNumber'));
    }
  },

  _currentPageDidChange: function () {
    var currentPage = this.get('currentPage');
    if (currentPage) {
      var toSelect = this.objectAt(currentPage - 1);
      this.selectObject(toSelect);
    }
  }.observes('currentPage').cacheable(),

  _removeAll: function () {
    if (this.get('length') > 0) {
      this.removeAt(0, this.get('length')); 
    }
  },

  _nPagesDidChange: function () {
    this._removeAll();
    var nP = this.get('nPages');
    if (!SC.none(nP) && nP >= 0) {
      var pageNr = 1, i;
      for (i = 0; i < nP; i++) {
        this.pushObject(SC.Object.create({
          url: "%@&page_nr=%@&url=%@"
              .fmt(this.get('_thumbnailPrefix'), pageNr, this.get('url')),
          pageNumber: pageNr
        }));
        pageNr += 1;
      }
    }
  }.observes('nPages', 'url').cacheable()

});
