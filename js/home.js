module.exports = {
  template: '#homeTemplate',
  data: function () {
    return {
      records: [],
      newCollectionName: ''
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
      // this.$data.currentDb = name;
      // this.$data.currentCollection = '';
      // databaseVM.getCollection(name);
      var vm = this;
      dbClient.getCollections(dbName).then(function(collections){
        vm.collections = collections;
      });
    },
    getRecords: function(dbName, collectionName) {
      // this.$data.currentCollection = name;
      // databaseVM.getRecords(name);
      var vm = this;
      dbClient.getRecords(dbName, collectionName).then(function(records){
        vm.records = records;
      });
    },
    stringifyRecord: function(r) {
      return JSON.stringify(r, null, "  ");
    },
    addDb: function(e) {
      e.preventDefault();
      //databaseVM.addDatabase(this.$data.newdb, this.$data.newCollectionName);
      dbClient.addDatabase(this.$data.newdb);
    },
    addCollection: function(dbName, collectionName) {
      collectionName = this.$data.newCollectionName;
      var promise = dbClient.addCollection(dbName, collectionName), vm = this;
      promise.then(function(){
        vm.generateTreeView();
      }, function(){
        alert("Error");
      })
    },
    addDbAndCollection: function(e){
      e.preventDefault();
      var vm = this;
      vm.addDb(e);
      vm.addCollection(e);
    },
    dropDatabase: function(name) {
      dbClient.dropDatabase(name);
      this.getDatabases();
    },
    dropCollection: function(name) {
      dbClient.dropCollection(name);
      this.getCollections();
    },
    addRecord: function(e) {
      e.preventDefault();
      dbClient.addRecord(JSON.parse(this.$data.record));
    },
    generateTreeView: function(){
      var viewData = [],
      container = document.getElementById("explorer-container"),
      vm = this;
      container.innerHTML = "";
      dbClient.getDatabases().then(function(dbs){
        var counter = dbs.length;
        dbs.forEach(function(db, index, array){
          var node = {};
          node.title = db;
          node.iconUrl = "../images/database-icon.jpg";
          node.childNodes = [];
          viewData.push(node);

          // add collections folder
          var collectionsNode = {};
          collectionsNode.title = "Collections";
          collectionsNode.iconUrl = "../images/folder-icon.jpg";
          collectionsNode.childNodes = [];
          collectionsNode.contextMenu = [{
            title: "Add Collection",
            onclick: function(){
              $("#collectionModal").modal('show');
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
                childNode.contextMenu = [{title: "Delete", onclick: function(){
                  //vm.Delete
                }}];
                collectionsNode.childNodes.push(childNode);
              });
            }

            // last database element
            counter--;
            if(counter === 0){
              new Explorer(container, viewData, { titleProperty: "title", iconProperty: "iconUrl",
              childNodesProperty: "childNodes",
              clickProperty: "onclick",
              contextMenuProperty: "contextMenu"
            });
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
