module.exports = {
  template: '#homeTemplate',
  props: {
    explorerObj: null,
    explorerViewData: null
  },
  data: function () {
    return {
      records: [],
      selectedDb: null,
      selectedCollection: null
    }
  },
  methods: {
    getDatabases: function(){
      var vm = this;
      dbClient.getDatabases().then(function(dbs){
        vm.databases = dbs;
      });
    },
    getCollections: function(dbName) {
      var vm = this;
      dbClient.getCollections(dbName).then(function(collections){
        vm.collections = collections;
      });
    },
    getRecords: function(dbName, collectionName) {
      var vm = this;
      dbClient.getRecords(dbName, collectionName).then(function(records){
        vm.records = records;
      });
    },
    stringifyRecord: function(r) {
      return JSON.stringify(r, null, "  ");
    },
    addDatabase: function(dbName) {
      var vm = this;
      var promise = dbClient.addDatabase(dbName);
      promise.then(function(){
          vm.updateTreeView("addDatabase", dbName);
      }, vm.errorHandler);
      return promise;
    },
    addCollection: function(collectionName) {
      var vm = this;
      var promise = dbClient.addCollection(this.selectedDb, collectionName);
      promise.then(function(){
        vm.updateTreeView("addCollection", vm.selectedDb, collectionName);
      }, vm.errorHandler);
      return promise;
    },
    addRecord: function(record) {
      var vm = this;
      var promise = dbClient.addRecord(this.selectedDb, this.selectedCollection ,JSON.parse(record));
      promise.then(function(){
        alert("Record inserted");
      }, vm.errorHandler);
      return promise;
    },
    dropDatabase: function(dbName) {
      var vm = this;
      dbClient.dropDatabase(dbName).then(function(){
        vm.updateTreeView("dropDatabase", dbName);
      }, vm.errorHandler);
    },
    dropCollection: function(dbName, collectionName) {
      var vm = this;
      dbClient.dropCollection(dbName, collectionName).then(function(){
        vm.updateTreeView("dropCollection", dbName, collectionName);
      }, vm.errorHandler);
    },
    errorHandler: function(ex){
      alert("Something went wrong");
    },

    //explorer treeview functionality
    getDbNode: function(viewData, dbName){
      var node = null;
      viewData[0].childNodes.forEach(function(item,index){
        if(item.title === dbName){
          node = {index: index, value: item};
          return false; // to break the loop
        }
      });
      return node;
    },
    getCollectionNode: function (viewData, dbName, collectionName) {
      var dbNode = this.getDbNode(viewData, dbName),
          node = null;
      if(dbNode){
        dbNode.value.childNodes[0].childNodes.forEach(function(item, index){
          if(item.title === collectionName){
            node = {index: index, value: item};
            return false; // to break the loop
          }
        });
      }
      return node;
    },
    getDbParentNode: function(viewData){
      return viewData[0].childNodes;
    },
    getCollectionParentNode: function(viewData, dbName){
       var dbNode = this.getDbNode(viewData, dbName), node = null;
       if(dbNode){
         node = dbNode.value.childNodes[0].childNodes;
       }
       return node;
    },
    createDbNode: function(dbName){
      var node = {}, collectionsNode = {}, vm = this;
      node.id = dbName;
      node.title = dbName;
      node.iconUrl = "../images/database-icon.jpg";
      node.childNodes = [];
      node.contextMenu = [{
        title: "Drop Database",
        onclick: function(){
          vm.dropDatabase(dbName);
        }
      }];

      // add collections folder
      collectionsNode.id = "Collections";
      collectionsNode.title = "Collections";
      collectionsNode.iconUrl = "../images/folder-icon.jpg";
      collectionsNode.childNodes = [];
      collectionsNode.contextMenu = [{
        title: "Add Collection",
        onclick: function(){
          vm.selectedDb = dbName;
          $("#add-collection-modal").modal('show');
        }
      }];
      node.childNodes.push(collectionsNode);

      return node;
    },
    createCollectionNode: function(dbName, collectionName){
      var node = {}, vm = this;
      node.id = collectionName;
      node.title = collectionName;
      node.iconUrl = "../images/collection-icon.png";
      node.onclick = function(){
        vm.getRecords(dbName,collectionName);
      };
      node.contextMenu = [{title: "Add Record", onclick: function(){
        vm.selectedDb = dbName;
        vm.selectedCollection = collectionName;
        $("#add-record-modal").modal('show');
      }},{title: "Drop Collection", onclick: function(){
        vm.dropCollection(dbName, collectionName);
      }}];

      return node;
    },
    generateTreeView: function(){
      var viewData = [],
      container = document.getElementById("explorer-container"),
      vm = this;

      dbClient.getDatabases().then(function(dbs){
        var counter = dbs.length;

        // add database folder
        var rootNode = {};
        rootNode.id = "databases";
        rootNode.title = "Databases";
        rootNode.iconUrl = "../images/db-icon.jpg";
        rootNode.childNodes = [];
        rootNode.contextMenu = [{title: "Add Database",onclick: function(){
          $("#add-database-Modal").modal('show');
        }}];

        viewData.push(rootNode);

        dbs.forEach(function(db, index, array){
          var node = vm.createDbNode(db), collectionsNode = node.childNodes[0];
          rootNode.childNodes.push(node);

          // get collections
          dbClient.getCollections(db).then(function(collections){
            if(collections && collections.length){
              collections.forEach(function(collection){
                var childNode = vm.createCollectionNode(db, collection);
                collectionsNode.childNodes.push(childNode);
              });
            }

            // last database element
            counter--;
            if(counter === 0){
              if(vm.explorerObj){
                vm.explorerObj.update(viewData);
              }
              else{
                vm.explorerViewData = viewData;
                vm.explorerObj = new Explorer(container, viewData, 
                  { titleProperty: "title", iconProperty: "iconUrl",
                childNodesProperty: "childNodes", clickProperty: "onclick",
                contextMenuProperty: "contextMenu", idProperty: "id" });
              }
            }
          });
        });
      });
    },
    updateTreeView: function(action, dbName, collectionName){
      var vm = this;
      var viewData = JSON.parse(JSON.stringify(vm.explorerViewData));
      if(action === "addCollection"){
        var parentNode = vm.getCollectionParentNode(viewData, dbName);
        if(parentNode){
          parentNode.push(vm.createCollectionNode(dbName,collectionName));
        }
        else{
            console.log("parent node is not found"); // testing
        }
      }
      else if(action === "dropCollection"){
        var parentNode = vm.getCollectionParentNode(viewData, dbName);
        if(parentNode){
            var node = vm.getCollectionNode(viewData, dbName, collectionName);
            if(node){
                parentNode.splice(node.index, 1);
            }
            else{
                console.log("collection node is not found"); // testing
            }
        }
        else{
            console.log("parent node is not found"); // testing
        }
      }
      else if(action === "addDatabase"){
        var parentNode = vm.getDbParentNode(viewData);
        if(parentNode){
          parentNode.push(vm.createDbNode(dbName));
        }
        else{
            console.log("parent node is not found"); // testing
        }
      }
      else if(action === "dropDatabase"){
        var parentNode = vm.getDbParentNode(viewData);
        if(parentNode){
            var node = vm.getDbNode(viewData, dbName);
            if(node){
                parentNode.splice(node.index, 1);
            }
            else{
                console.log("database node is not found"); // testing
            }
        }
        else{
            console.log("parent node is not found"); // testing
        }
      }

      vm.explorerObj.update(viewData);
      vm.explorerViewData = viewData;
    }
  },
  attached: function(){
    this.generateTreeView();
  }
};
