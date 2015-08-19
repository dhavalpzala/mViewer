module.exports = {
  template: '#homeTemplate',
  data: function () {
    return {
      records: [],
      selectedDb: null,
      selectedCollection: null,
      explorerObj: null,
      temp: ["hello"]
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
        vm.generateTreeView();
      }, vm.errorHandler);
      return promise;
    },
    addCollection: function(collectionName) {
      var vm = this;
      var promise = dbClient.addCollection(this.selectedDb, collectionName);
      promise.then(function(){
        vm.generateTreeView();
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
        vm.generateTreeView();
      }, vm.errorHandler);
    },
    dropCollection: function(dbName, collectionName) {
      var vm = this;
      dbClient.dropCollection(dbName, collectionName).then(function(){
        vm.generateTreeView();
      }, vm.errorHandler);
    },
    errorHandler: function(ex){
      alert("Something went wrong");
    },
    generateTreeView: function(){
      var viewData = [],
      container = document.getElementById("explorer-container"),
      vm = this;
      //container.innerHTML = "";
      dbClient.getDatabases().then(function(dbs){
        var counter = dbs.length;

        // add database folder
        var rootNode = {};
        rootNode.title = "Databases";
        rootNode.iconUrl = "../images/db-icon.jpg";
        rootNode.childNodes = [];
        rootNode.contextMenu = [{title: "Add Database",
        onclick: function(){
            $("#add-database-Modal").modal('show');
          }
        }];

        viewData.push(rootNode);

        dbs.forEach(function(db, index, array){
          var node = {};
          node.title = db;
          node.iconUrl = "../images/database-icon.jpg";
          node.childNodes = [];
          node.contextMenu = [{
            title: "Drop Database",
            onclick: function(){
                vm.dropDatabase(db);
            }
          }];
          rootNode.childNodes.push(node);

          // add collections folder
          var collectionsNode = {};
          collectionsNode.title = "Collections";
          collectionsNode.iconUrl = "../images/folder-icon.jpg";
          collectionsNode.childNodes = [];
          collectionsNode.contextMenu = [{
            title: "Add Collection",
            onclick: function(){
                vm.selectedDb = db;
                $("#add-collection-modal").modal('show');
            }
          }];
          node.childNodes.push(collectionsNode);
          // get collections
          dbClient.getCollections(db).then(function(collections){
            if(collections && collections.length){
              collections.forEach(function(collection){
                var childNode = {};
                childNode.title = collection.collectionName;
                childNode.iconUrl = "../images/collection-icon.png";
                childNode.onclick = function(){
                  vm.getRecords(db,collection.collectionName);
                };
                childNode.contextMenu = [{title: "Add Record", onclick: function(){
                  vm.selectedDb = db;
                  vm.selectedCollection = collection.collectionName;
                  $("#add-record-modal").modal('show');
                }},{title: "Drop Collection", onclick: function(){
                  vm.dropCollection(db, collection.collectionName);
                }}];
                collectionsNode.childNodes.push(childNode);
              });
            }


            // last database element
            counter--;
            if(counter === 0){
              vm.$data.temp = viewData;
              if(vm.$data.explorerObj){
                  vm.$data.explorerObj.update(viewData);
              }
              else{
                  vm.$data.explorerObj = new Explorer(container, viewData, { titleProperty: "title", iconProperty: "iconUrl",
                  childNodesProperty: "childNodes",
                  clickProperty: "onclick",
                  contextMenuProperty: "contextMenu"
                });
              }
          }
        });
      });
    });
  }
},
attached: function(){
  this.generateTreeView();
}
};
