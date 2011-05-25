
//mixin
Multivio.LoadFile = {
  initialSubstate: 'receivedFile',

  enterState: function(context) {
    if(SC.none(context)) {
      this.gotoState('contentReady');
      return;
    }
    var pdfView = Multivio.getPath('mainPage.mainPdfView.waitingView');
    pdfView.set('isVisible', YES);
  },

  exitState: function() {
    var pdfView = Multivio.getPath('mainPage.mainPdfView.waitingView');
    pdfView.set('isVisible', NO);
  },

  serverError: function() {
    SC.Logger.debug("InitializationError called");
    this.gotoState('error');  
  },

  loadingFile: SC.State.design({
    fileLoaded:function(context) {
      this.gotoState(this.get('parentState').receivedFile, context);
    }
  })
};


Multivio.LoadNextFile = SC.State.design(Multivio.LoadFile, {
  receivedFile: SC.State.design({
    enterState: function(context) {
      var currentRootNode = context;
      SC.Logger.debug("Enter received with: " + currentRootNode.url);
      var currentNode = Multivio.filesController.findProperty('url', currentRootNode.url);
      //rootNode not loaded
      if(SC.none(currentNode)) {
        this.gotoState(this.get('parentState').loadingFile);
        Multivio.filesController.fetchFile(currentRootNode.url, currentRootNode.parent);
        return;
      }

      //isContent file: display it!
      Multivio.filesController.selectObject(currentNode);
      if(currentNode.get('isContentFile')) {
        Multivio.filesController.selectObject(currentNode);
        this.gotoState('contentReady');
        return;
      }

      //logical Node
      var currentPhys = currentNode.get('physicalStructure');
      var nextNodeUrl;
      //expand first child
      nextNodeUrl = currentPhys[0].url;

      //store current as parent and call child
      this.gotoState(this.get('parentState').loadingFile);
      Multivio.filesController.fetchFile(nextNodeUrl, currentNode);
    }
  })
});


Multivio.LoadPreviousFile = SC.State.design(Multivio.LoadFile, {
  receivedFile: SC.State.design({
    enterState: function(context) {
      var currentRootNode = context;
      SC.Logger.debug("Enter received with: " + currentRootNode.url);
      var currentNode = Multivio.filesController.findProperty('url', currentRootNode.url);
      //rootNode not loaded
      if(SC.none(currentNode)) {
        this.gotoState(this.get('parentState').loadingFile);
        Multivio.filesController.fetchFile(currentRootNode.url, currentRootNode.parent);
        return;
      }

      //isContent file: display it!
      Multivio.filesController.selectObject(currentNode);
      if(currentNode.get('isContentFile')) {
        Multivio.filesController.selectObject(currentNode);
        this.gotoState('contentReady');
        return;
      }

      //logical Node
      var currentPhys = currentNode.get('physicalStructure');
      var nextNodeUrl;
      //expand last child
      nextNodeUrl = currentPhys[currentPhys.length - 1].url;

      //store current as parent and call child
      this.gotoState(this.get('parentState').loadingFile);
      Multivio.filesController.fetchFile(nextNodeUrl, currentNode);
    }
  })
});
